const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage({viewport:{width:1440,height:800}});await p.addInitScript(()=>{let next=0,t=1000;const q=new Map();window.requestAnimationFrame=cb=>{q.set(++next,cb);return next};window.cancelAnimationFrame=id=>q.delete(id);window.stepWorld=count=>{for(let i=0;i<count;i++){t+=50;const jobs=[...q.values()];q.clear();jobs.forEach(cb=>cb(t));}};});await p.goto('http://127.0.0.1:4179/games/the-long-run/');
const result=await p.evaluate(()=>{
 const errors=new Set(),isCar=o=>['compact','sedan','truck'].includes(o.spriteType),key=o=>`${isCar(o)?'car':'human'}/${o.path}/${o.index}`;
 const tables=[45,78,111].map(x=>({x:x-6,y:159,w:13,h:4}));
 const obstacles=[{x:127,y:166,w:11,h:13},{x:241,y:326,w:22,h:14},{x:132,y:329,w:11,h:7},...[3,265,415,635].map(x=>({x:x-3,y:176,w:8,h:2}))];
 function inspect(ticks){let prior=pixelWorld.inspect().objects;
  for(let tick=0;tick<ticks;tick++){
   stepWorld(1);const now=pixelWorld.inspect().objects;
   for(const lane of ['upperRoad','lowerRoad']){const cars=now.filter(o=>isCar(o)&&o.active&&o.path===lane).sort((a,b)=>a.x-b.x);for(let i=1;i<cars.length;i++){const width=sprites[cars[i-1].spriteType].frames[0][0].length;if(cars[i].x-cars[i-1].x<width)errors.add('Car overlap');}for(const car of cars)if(car.y!==(lane==='upperRoad'?197:218))errors.add('Lane drift');}
   for(const o of now){const old=prior.find(p=>key(p)===key(o));if(o.path&&o.active&&old?.active&&Math.abs(o.x-old.x)>2)errors.add('Motion jump');if(!o.active||isCar(o))continue;
    const off=SPRITE_PLACEMENT[o.spriteType],frame=sprites[o.spriteType].frames[o.idle?SPRITE_WALK.idleFrame:o.frame];
    frame.forEach((row,y)=>[...row].forEach((c,x)=>{if(c===' ')return;const px=Math.round(o.x)+off.x+(o.direction<0?row.length-1-x:x),py=Math.round(o.y)+off.y+y;
     if(tables.some(t=>px>=t.x&&px<t.x+t.w&&py>=t.y&&py<t.y+t.h))errors.add('Table contact');
     if(y===25&&obstacles.some(t=>px>=t.x&&px<t.x+t.w&&py>=t.y&&py<t.y+t.h))errors.add('Feet in furniture');
    }));
   }prior=now;
  }
 }
 inspect(640);
 for(const choice of ['confidence','fiscal-expand','rate-cut','housing-boom','support']){const before=pixelWorld.inspect().objects;stepEconomy(choice);renderWorld();const after=pixelWorld.inspect().objects;for(const old of before.filter(o=>o.path)){const next=after.find(o=>key(o)===key(old));if(next&&next.distance!==old.distance)errors.add('Year teleport');}inspect(640);}
 return {errors:[...errors],year:economy.year,frames:pixelWorld.inspect().frameCount};
});assert.deepEqual(result.errors,[]);assert.equal(result.year,6);console.log('192 simulated seconds: all walking frames, furniture/table clearances, lane fit, wraparound and year continuity PASS',result.frames);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
