const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createServer}=require('node:http');
const {chromium}=require(process.env.MQ_PLAYWRIGHT_MODULE||'playwright');
const config=JSON.parse(fs.readFileSync('audit_tools/econ_rpg/games-preview.json','utf8'));
const base=path.resolve(process.env.MARKET_SHIFT_PREVIEW_ROOT||'dist');
const out=path.resolve('tmp/market-shift/beta-'+(process.env.MARKET_SHIFT_PREVIEW_ORIGIN?'live':'local'));fs.mkdirSync(out,{recursive:true});
(async()=>{
 let server,browser,origin=process.env.MARKET_SHIFT_PREVIEW_ORIGIN;
 if(!origin){server=createServer((req,res)=>{try{let file=path.resolve(base,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(base+path.sep))throw Error('Outside package');if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;}
 const hub=origin+config.previewRoot+'games/',game=hub+'market-shift/',results=[];
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:960}}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
   const response=await page.goto(hub);assert.equal(response.status(),200);if(origin.startsWith('https:'))assert.match(response.headers()['x-robots-tag'],/noindex/);
   assert.equal(await page.locator('.game-card').count(),config.gameCount);
   const card=page.locator('section[aria-labelledby=microeconomics-heading] [data-game=market-shift]');await card.scrollIntoViewIfNeeded();
   assert.equal(await card.locator('img').getAttribute('src'),'./market-shift/assets/linden-busy.webp');await card.locator('img').evaluate(i=>i.decode());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await card.screenshot({path:path.join(out,'card-'+width+'.png')});
   await card.getByRole('link',{name:'PLAY GAME: Market Shift',exact:true}).click();await page.waitForURL(game);
   assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex,nofollow');
   await page.locator('.market-art img').evaluate(i=>i.decode());await page.screenshot({path:path.join(out,'splash-'+width+'.png'),fullPage:true});
   await page.locator('[data-action=start]').click();await page.locator('.bulletin').waitFor();await page.locator('.market-art img').evaluate(i=>i.decode());
   await page.screenshot({path:path.join(out,'bulletin-'+width+'.png'),fullPage:true});await page.locator('[data-action=forecast]').click();
   await page.locator('#input-d').focus();await page.locator('#input-d').press('ArrowRight');assert.equal(await page.locator('#input-d').inputValue(),'5');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.getByRole('link',{name:'Return to Games',exact:true}).click();await page.waitForURL(hub);assert(await page.locator('[data-game=market-shift]').isVisible());
   assert.deepEqual(errors,[]);results.push({width,card:true,launch:true,bulletin:true,keyboardGraph:true,returnToHub:true});await context.close();
  }
  const request=await browser.newContext();let runtimeAssets=0;
  for(const name of ['market','busy','quiet','storm','harvest','delivery','busy-harvest','quiet-harvest','busy-storm','quiet-storm']){const r=await request.request.get(game+'assets/linden-'+name+'.webp');assert.equal(r.status(),200);assert.match(r.headers()['content-type'],/image\/webp/);runtimeAssets++;}
  const publicHub=await request.request.get(origin+'/games/');assert.equal(publicHub.status(),200);assert(!(await publicHub.text()).includes(config.previewRoot));
  for(const name of ['README.md','model.test.js','browser.test.cjs','assets/ART_DIRECTION.md']){const r=await request.request.get(game+name);assert.equal(r.status(),404,name+' must remain private');}
  await request.close();const result={passed:true,hub,game,results,runtimeAssets,publicHubUnchanged:true,developmentFilesExcluded:true};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser?.close();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
