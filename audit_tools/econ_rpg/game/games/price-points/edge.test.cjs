const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.MQ_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const {previewServer}=await import(pathToFileURL(path.resolve('audit_tools/econ_rpg/serve.mjs'))),server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:390,height:950}});await page.goto(origin+'/games/price-points/');await page.locator('[data-action=studio]').click();
  let comparisons=0;
  for(const id of ['responsive','loyal','unit-demand','linear','fixed-demand','open-demand','substitutes','complements','necessity','luxury','inferior','short-run','long-run','unit-supply','fixed-supply','open-supply']){
   await page.locator('#studio-select').selectOption(id);
   for(const key of ['Home','End','ArrowLeft']){await page.locator('#value-slider').focus();await page.locator('#value-slider').press(key);const hits=await page.locator('#graph').evaluate(svg=>{const items=[...svg.querySelectorAll('text')].map(e=>({text:e.textContent,b:e.getBBox()})),hits=[];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i].b,b=items[j].b;if(a.x<b.x+b.width&&b.x<a.x+a.width&&a.y<b.y+b.height&&b.y<a.y+a.height)hits.push([items[i].text,items[j].text]);}return hits;});assert.deepEqual(hits,[],id+' '+key+' label overlap');comparisons++;}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.locator('#studio-select').selectOption('linear');await page.locator('#value-input').fill('20');await page.locator('#value-input').press('Tab');const aligned=await page.evaluate(()=>{const a=document.querySelector('#graph .point-now'),b=document.querySelector('#revenue-chart .point-now');return Math.abs(a.getBoundingClientRect().x-b.getBoundingClientRect().x)<1;});assert(aligned,'Linked chart quantities align');
  const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});const bp=await blocked.newPage();await bp.goto(origin+'/games/price-points/');await bp.locator('[data-action=start][data-scope=supply]').click();assert(await bp.locator('#storage-warning').isVisible());await bp.locator('[data-action=prediction]').click();await bp.locator('[data-predict="0"]').click();await bp.locator('#value-slider').focus();await bp.locator('#value-slider').press('ArrowRight');assert(await bp.locator('#graph').isVisible());await blocked.close();
  await page.setViewportSize({width:320,height:800});await page.locator('#home').click();await page.locator('[data-action=start][data-scope=related]').click();await page.locator('[data-action=prediction]').click();await page.locator('[data-predict="0"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const result={passed:true,extremeLabelChecks:comparisons,linkedAxesAligned:true,storageUnavailablePlayable:true,graph320px:true};fs.writeFileSync('tmp/price-points/edge-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
