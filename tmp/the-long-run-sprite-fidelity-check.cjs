const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const oldPath='tmp/the-long-run-before-sprite-fidelity.html',newPath='audit_tools/econ_rpg/game/games/the-long-run/index.html';
const old=fs.readFileSync(oldPath,'utf8').replaceAll('\r\n','\n'),now=fs.readFileSync(newPath,'utf8').replaceAll('\r\n','\n');
const section=(s,a,b)=>s.slice(s.indexOf(a),b?s.indexOf(b):undefined).trim();
assert.equal(section(now,'<!doctype html>','/* 9. GAME DATA'),section(old,'<!doctype html>','/* 9. GAME DATA'));
assert.equal(section(now,'function renderPixelTown','/* PIXEL ANIMATION'),section(old,'function renderPixelTown','/* PIXEL ANIMATION'));
assert.equal(section(now,'  smoke:{frames:','const PIXEL_PATHS'),section(old,'  smoke:{frames:','// A second wheel frame,'));
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const before=await browser.newPage({reducedMotion:'reduce'}),after=await browser.newPage({reducedMotion:'reduce'});
 await before.goto(pathToFileURL(path.resolve(oldPath)).href);await after.goto(pathToFileURL(path.resolve(newPath)).href);
 const paths=[[],['confidence','fiscal-expand','rate-cut'],['energy','fiscal-contract','rate-hike'],['energy'],['confidence','fiscal-expand','rate-hike'],['breakthrough','fiscal-hold','rate-hold','infrastructure']];
 for(const choices of paths){
  const run=page=>page.evaluate(ids=>{economy=initialEconomy();recordYear();ids.forEach(stepEconomy);renderWorld();return {background:document.querySelector('#world').toDataURL(),caption:document.querySelector('#city-caption').textContent,world:worldState()};},choices);
  assert.deepEqual(await run(after),await run(before));
 }
 const dimensions=page=>page.evaluate(()=>Object.fromEntries(['compact','sedan','truck','pedestrian','worker'].map(type=>[type,{width:Math.max(...sprites[type].frames[0].map(row=>row.length)),height:sprites[type].frames[0].length,frames:sprites[type].frames.length}])));
 const oldSizes=await dimensions(before),newSizes=await dimensions(after);
 for(const type of ['compact','sedan','truck']){
  const ratio=newSizes[type].width/oldSizes[type].width;assert.ok(ratio>=1.15&&ratio<=1.25);assert.equal(newSizes[type].height,12);
 }
 for(const type of ['pedestrian','worker'])assert.deepEqual(newSizes[type],{width:9,height:15,frames:3});
 const validity=await after.evaluate(()=>{
  const failures=[];
  for(const [type,sprite] of Object.entries(sprites))for(const frame of sprite.frames){
   for(const row of frame)for(const pixel of row)if(pixel!==' '&&!(pixel in PIXEL_PALETTE))failures.push('Unknown color');
   if(SPRITE_PLACEMENT[type]&&frame.some(row=>row.length!==sprite.frames[0][0].length))failures.push('Changing frame width');
  }
  for(const type of ['compact','sedan','truck']){
   const offset=SPRITE_PLACEMENT[type],h=sprites[type].frames[0].length;
   for(const y of [149,163])if(y+offset.y<148||y+offset.y+h>177)failures.push('Road overflow');
   if(sprites[type].frames[0].slice(0,8).join()!==sprites[type].frames[1].slice(0,8).join())failures.push('Body jitter');
  }
  for(const type of ['pedestrian','worker'])if(SPRITE_PLACEMENT[type].y+sprites[type].frames[0].length!==12)failures.push('Foot drift');
  return failures;
 });
 assert.deepEqual(validity,[]);console.log('World canvases identical across six states; unchanged shell and scenery; actor dimensions, road fit, foot contact, frame bounds and colors PASS');console.log(JSON.stringify({oldSizes,newSizes}));
}finally{await browser.close();}})();
