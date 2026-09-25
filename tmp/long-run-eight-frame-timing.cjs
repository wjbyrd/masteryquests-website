const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://127.0.0.1:4179/games/the-long-run/');
 const result=await page.evaluate(async()=>{
  const person=()=>pixelWorld.inspect().objects.find(o=>o.path==='sidewalk');
  const begin=person(),wall=performance.now(),time=pixelWorld.inspect().time,frames=pixelWorld.inspect().frameCount;
  const sheet=document.createElement('canvas');sheet.width=800;sheet.height=240;const ctx=sheet.getContext('2d');ctx.imageSmoothingEnabled=false;const samples=[];
  for(let i=0;i<8;i++){
   await new Promise(resolve=>setTimeout(resolve,135));const o=person();samples.push({x:o.x,frame:o.frame,phase:walkingPhase(o),time:pixelWorld.inspect().time});
   const x=i%4*200,y=Math.floor(i/4)*120;ctx.fillStyle='#c6d9d3';ctx.fillRect(x,y,200,120);ctx.drawImage(document.querySelector('#world'),Math.round(begin.x)-16,152,52,40,x,y,156,120);ctx.drawImage(document.querySelector('#pixel-world'),Math.round(begin.x)-16,152,52,40,x,y,156,120);ctx.fillStyle='#192e40';ctx.font='11px system-ui';ctx.fillText(Math.round(performance.now()-wall)+' ms',x+4,y+12);
  }
  await new Promise(resolve=>setTimeout(resolve,2100));const end=person(),elapsed=(performance.now()-wall)/1000;
  return {wallSeconds:elapsed,speed:(end.distance-begin.distance)/elapsed,fps:(pixelWorld.inspect().frameCount-frames)/elapsed,simulationElapsed:pixelWorld.inspect().time-time,samples,png:sheet.toDataURL().split(',')[1]};
 });fs.writeFileSync('tmp/long-run-eight-frame-motion-strip.png',Buffer.from(result.png,'base64'));delete result.png;assert.ok(result.speed>14&&result.speed<16);assert.ok(result.fps>28&&result.fps<32);console.log('Real browser timing:',result);
 // Inspect a close pass, including the taller delivery vehicle, using the actual render loop.
 await page.addInitScript(()=>{let next=0,t=1000;const q=new Map();window.requestAnimationFrame=cb=>{q.set(++next,cb);return next};window.cancelAnimationFrame=id=>q.delete(id);window.stepWorld=()=>{t+=1000/60;const jobs=[...q.values()];q.clear();jobs.forEach(cb=>cb(t));};});await page.reload();
 const passing=await page.evaluate(()=>{for(let i=0;i<12000;i++){stepWorld();const cars=pixelWorld.inspect().objects.filter(o=>o.active&&['compact','sedan','truck'].includes(o.spriteType));for(const a of cars.filter(o=>o.path==='upperRoad'))for(const b of cars.filter(o=>o.path==='lowerRoad'))if(a.x>150&&a.x<470&&Math.abs(a.x-b.x)<3&&(a.spriteType==='truck'||b.spriteType==='truck'))return [a,b];}return null;});assert.ok(passing);await page.locator('.world-window').screenshot({path:'tmp/long-run-eight-frame-passing.png'});console.log('Captured opposing-lane pass:',passing.map(o=>({type:o.spriteType,x:o.x,y:o.y})));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
