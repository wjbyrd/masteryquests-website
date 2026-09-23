import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,cp,mkdir,mkdtemp,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import path from 'node:path';
import {gameRoot} from './serve.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='tmp/econ-rpg/cpi-live-refinement';await mkdir(out,{recursive:true});
const art={
  'gdp-live':'434b84e9872e58f773da49c833ffec3aa2c750ebe6bab8dc141e1e3ee50dee4b',
  'cpi-live':'1774681a0e53eb493983cfed2010741f28e604aa98c9bd4208404a78bbb25768',
};
for(const [id,hash]of Object.entries(art))assert.equal(createHash('sha256').update(await readFile(path.join(gameRoot,`art/scenes/${id}/${id}.webp`))).digest('hex'),hash,'Supplied WebP bytes unchanged');
// Private production-style static output. The real public build must still exclude this tree.
const staged=path.resolve(await mkdtemp(out+'/staged-'));
await cp(gameRoot,staged,{recursive:true,filter:src=>!src.split(path.sep).includes('sources')});
const server=createServer(async(req,res)=>{try{
  let file=path.resolve(staged,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(staged+path.sep))throw Error('Outside build');
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  const body=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'}).end(body);
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],checks=[];let zoom;
try{
  for(const v of [{width:1366,height:768},{width:1280,height:720},{width:768,height:1024},{width:390,height:844},{width:320,height:720},{width:1366,height:768,zoom:true}]){
    let context;
    if(v.zoom){zoom=await chromium.launchPersistentContext(out+'/art-zoom-profile',{channel:'chrome',headless:true,viewport:{width:1366,height:768}});const settings=zoom.pages()[0];await settings.goto('chrome://settings/appearance');await settings.evaluate(()=>new Promise(r=>chrome.settingsPrivate.setDefaultZoom(2,r)));await settings.close();context=zoom;}
    else context=await browser.newContext({viewport:v});
    const p=await context.newPage(),label=v.zoom?'zoom200':`${v.width}x${v.height}`;
    p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await p.goto(origin+'/games/');await p.locator('img').evaluateAll(images=>Promise.all(images.map(i=>{i.loading='eager';return i.decode();})));
    if(v.zoom){assert.equal(await p.evaluate(()=>innerWidth),683);assert.equal(await p.evaluate(()=>devicePixelRatio),2);}
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const cardBoxes=[];
    for(const id of Object.keys(art)){
      const card=p.locator(`[data-game="${id}"]`),img=card.locator('img');
      assert.equal(await img.getAttribute('src'),`../art/scenes/${id}/${id}.webp`);
      const metrics=await img.evaluate(i=>({natural:[i.naturalWidth,i.naturalHeight],fit:getComputedStyle(i).objectFit,box:[i.getBoundingClientRect().width,i.getBoundingClientRect().height]}));
      assert.deepEqual(metrics.natural,[1448,1086]);assert.equal(metrics.fit,'contain');assert.ok(Math.abs(metrics.box[0]/metrics.box[1]-4/3)<.015);
      assert.ok((await img.getAttribute('alt')).length>50);await card.screenshot({path:`${out}/${id}-card-${label}.png`});cardBoxes.push(await card.boundingBox());
    }
    if(v.width>=1280&&!v.zoom)assert.ok(Math.abs(cardBoxes[0].height-cardBoxes[1].height)<1,'cards in the same desktop row balance');
    await p.screenshot({path:`${out}/library-${label}.png`,fullPage:!v.zoom});
    for(const id of Object.keys(art)){
      const link=p.locator(`[data-game="${id}"] a`);let focused=false;
      for(let i=0;i<30;i++){if(await link.evaluate(e=>document.activeElement===e)){focused=true;break;}await p.keyboard.press('Tab');}
      assert.ok(focused);assert.ok(await link.evaluate(e=>getComputedStyle(e).outlineStyle==='solid'));
      await p.keyboard.press('Enter');await p.waitForURL(`**/games/${id}/`);await p.locator('#game-title').filter({hasText:id==='gdp-live'?'GDP LIVE':'CPI LIVE'}).waitFor();
      await p.goto(origin+'/games/');
    }
    checks.push(label);await context.close();if(v.zoom)zoom=null;
  }
  assert.deepEqual(errors,[]);console.log('PASS supplied-art hashes, staged relative assets, both game links and six responsive/zoom card layouts');
}finally{await writeFile(out+'/art-results.json',JSON.stringify({staged,checks,errors},null,2));await zoom?.close();await browser.close();await new Promise(r=>server.close(r));}
