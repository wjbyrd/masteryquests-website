const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const file='audit_tools/econ_rpg/game/games/the-long-run/index.html';
const before=execFileSync('git',['show',`HEAD:${file}`],{encoding:'utf8'}).replace(/\r\n/g,'\n');
const after=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
assert.equal(after.match(/<script>([\s\S]*?)<\/script>/)[1],before.match(/<script>([\s\S]*?)<\/script>/)[1]);
console.log('Entire game/rendering script unchanged: PASS');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
for(const width of [1920,1500,1440,1400,1399,1280,768,390]){
 const page=await browser.newPage({viewport:{width,height:width<700?844:800},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4179/games/the-long-run/');
 for(let year=1;year<=6;year++){
  const data=await page.evaluate(()=>{
   const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
   const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
   return {world:rect('#world'),actors:rect('#pixel-world'),shell:rect('#world-shell'),rail:rect('#decision'),
    options:[...document.querySelectorAll('[data-choice]')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,bottom:r.bottom,height:r.height};}),
    canvases:[...document.querySelectorAll('.city-surface canvas')].map(e=>[e.width,e.height,getComputedStyle(e).imageRendering]),
    overflow:document.documentElement.scrollWidth>innerWidth,duplicateIds:ids.length-new Set(ids).size,
    pan:getComputedStyle(document.querySelector('.world-window')).overflowX,reportOutside:!document.querySelector('.play-layout #report')};
  });
  assert.equal(data.world.width,960);assert.equal(data.world.height,540);assert.deepEqual(data.actors,data.world);
  assert.deepEqual(data.canvases,[[480,270,'pixelated'],[480,270,'pixelated']]);
  assert.equal(data.overflow,false);assert.equal(data.duplicateIds,0);assert.equal(data.reportOutside,true);
  if(width>=1400){
   assert.equal(data.rail.y,data.shell.y);assert.equal(data.rail.x-data.shell.right,18);
   assert.ok(data.rail.width>=360&&data.rail.width<=420);
   for(let n=0;n<data.options.length;n++){
    assert.ok(data.options[n].bottom<=800,`${width}, year ${year}: choice below fold`);
    assert.ok(data.options[n].height>=44);
    if(n)assert.ok(data.options[n].y>data.options[n-1].bottom);
   }
  }else{assert.ok(data.rail.y>data.shell.bottom);}
  if(width<966)assert.equal(data.pan,'auto');
  if((width===1440||width===390||width===1280)&&(year===1||year===3))await page.screenshot({path:`tmp/the-long-run-layout-${width}-year-${year}.png`,fullPage:true});
  if(year<6){await page.locator('[data-choice]:enabled').first().click();await page.waitForFunction(()=>economy.phase==='choice'||economy.phase==='finished');}
 }
 assert.equal(await page.locator('#report').isVisible(),true);
 await page.locator('#model-toggle').click();assert.equal(await page.locator('#graph').isVisible(),true);
 assert.deepEqual(errors,[]);console.log(`${width}px: all five decision rounds, outcome, report and model PASS`);await page.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
