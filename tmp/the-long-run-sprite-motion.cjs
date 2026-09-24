const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage();await page.addInitScript(()=>{
  let next=0;const queue=new Map();let timestamp=1000;
  window.requestAnimationFrame=cb=>{queue.set(++next,cb);return next;};window.cancelAnimationFrame=id=>queue.delete(id);
  window.stepPixelFrames=count=>{for(let n=0;n<count;n++){timestamp+=100;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(cb=>cb(timestamp));}};
 });
 await page.goto('http://127.0.0.1:4179/games/the-long-run/');
 const result=await page.evaluate(()=>{
  const errors=[],isCar=o=>['compact','sedan','truck'].includes(o.spriteType),key=o=>`${isCar(o)?'car':'person'}/${o.path}/${o.index}`;
  function checkLoops(ticks){let prior=pixelWorld.inspect().objects;
   for(let n=0;n<ticks;n++){
    stepPixelFrames(1);const now=pixelWorld.inspect().objects;
    for(const lane of ['upperRoad','lowerRoad']){
     const cars=now.filter(o=>isCar(o)&&o.path===lane&&o.active).sort((a,b)=>a.x-b.x);
     for(let i=1;i<cars.length;i++)if(cars[i].x-cars[i-1].x<34)errors.push('Vehicle spacing');
     if(cars.some(o=>o.y!==(lane==='upperRoad'?149:163)))errors.push('Lane drift');
    }
    for(const o of now){const old=prior.find(p=>key(p)===key(o));if(!o.path||!o.active||!old?.active)continue;
     if(Math.abs(o.x-old.x)>3&&o.path==='construction')errors.push('Construction teleport');
     if(isCar(o)&&Math.abs(o.x-old.x)>3)errors.push('Vehicle jitter');
    }prior=now;
   }
  }
  checkLoops(320);
  for(const choice of ['confidence','fiscal-expand','rate-cut','housing-boom','support']){
   const before=pixelWorld.inspect().objects;stepEconomy(choice);renderWorld();const after=pixelWorld.inspect().objects;
   for(const old of before.filter(o=>o.path)){const kept=after.find(o=>key(o)===key(old));if(kept&&kept.distance!==old.distance)errors.push('Year-change teleport');}
   checkLoops(320);
  }
  return {errors:[...new Set(errors)],frames:pixelWorld.inspect().frameCount,year:economy.year};
 });
 assert.deepEqual(result.errors,[]);assert.equal(result.year,6);console.log('Motion: 192 simulated seconds; lane spacing, steady truck bodies, construction turns and year-change continuity PASS');
}finally{await browser.close();}})();

