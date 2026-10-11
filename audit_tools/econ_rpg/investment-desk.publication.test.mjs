import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {publishGamesPreview} from './publish-games-preview.mjs';
const root=process.cwd(),out=path.resolve('tmp/econ-rpg/investment-desk/published');
fs.mkdirSync(out,{recursive:true});
const config=publishGamesPreview(root,out),base=path.join(out,config.previewRoot,'games/the-investment-desk');
for(const file of ['index.html','app.js','engine.js','data.js','styles.css','cover.svg','finance.js','first-library.js','first-scenario.js','first-view.js','first-art.js','first-quest.css','card-art.css','mq-theme.css'])assert.ok(fs.existsSync(path.join(base,file)),file);
for(const file of ['npv-view.js','results-view.js'])assert.ok(fs.existsSync(path.join(base,file)),file);
for(const name of ['warehouse','restaurant','fleet','property','software','equipment','packaging','retail','cold','efficiency','conveyor','production','scanner','hotel','routing','processing','ordering','inventory','water','workshop','energy'])assert.ok(fs.statSync(path.join(base,'assets/cards',name+'.webp')).size>0,name);
assert.equal(config.gameCount,17);assert.ok(fs.readFileSync(path.join(base,'index.html'),'utf8').includes(config.previewRoot+'games/'));
assert.equal(fs.existsSync(path.join(base,'README.md')),false);
const server=createServer((req,res)=>{try{const url=new URL(req.url,'http://local');let file=path.resolve(out,'.'+url.pathname);if(!file.startsWith(out+path.sep))throw Error();if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');browser=await chromium.launch({channel:'chrome',headless:true});const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});const origin=`http://127.0.0.1:${server.address().port}`;await p.goto(origin+config.previewRoot+'games/');await p.waitForLoadState('networkidle');await p.locator('#growth-realms-art[data-ready="true"]').waitFor();
assert.equal(await p.locator('[data-game="gameday-rivals"] + [data-game="the-investment-desk"]').count(),1);
assert.equal(await p.locator('[data-game="takeout-taco-counting-the-cost"] img').evaluate(img=>getComputedStyle(img).objectFit),'cover');
assert.equal(await p.locator('#growth-realms-art').getAttribute('data-layout'),'landscape');
const shots=path.resolve('tmp/econ-rpg/investment-desk/hub-update');fs.mkdirSync(shots,{recursive:true});
for(const width of [1440,390]){
 await p.setViewportSize({width,height:900});
 for(const id of ['takeout-taco-counting-the-cost','the-investment-desk','growth-realms']){
  const card=p.locator(`[data-game="${id}"]`);await card.scrollIntoViewIfNeeded();
  await card.screenshot({path:path.join(shots,`${id}-${width}.png`)});
 }
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
}
await p.getByRole('link',{name:'PLAY GAME: The Investment Desk',exact:true}).click();await p.locator('[data-action="start"]').click();assert.equal(await p.locator('.card').count(),6);await p.getByRole('link',{name:'Return to Games'}).click();assert.equal(new URL(p.url()).pathname,config.previewRoot+'games/');assert.deepEqual(errors,[]);console.log('PASS: packaged hub → game → hub; runtime assets, 17-game count, no browser or asset errors.');}finally{await browser?.close();await new Promise(r=>server.close(r));}
