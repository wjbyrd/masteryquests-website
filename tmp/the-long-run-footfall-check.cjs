const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const beforeFile='tmp/the-long-run-pre-footfall.html',game='audit_tools/econ_rpg/game/games/the-long-run/index.html';
const old=fs.readFileSync(beforeFile,'utf8').replaceAll('\r\n','\n'),now=fs.readFileSync(game,'utf8').replaceAll('\r\n','\n');
const scrub=s=>s.replace(/walkSpeed:(3.3|4),/,'walkSpeed:SPEED,').replace(/[/][/] Native 18 × 27 people[\s\S]*?(?=const sprites=\{)/,'ACTOR_ART\n').replace(/function spriteImage[\s\S]*?(?=  function fixedPerson)/,'ACTOR_RENDER\n').replace(/      locate\(object\);[\s\S]*?(?=\n    }\n  }\n  function rect)/,'WALK_PHASE').replace(/object.idle\?SPRITE_WALK.idleFrame:object.frame,object.direction,object.index(?:,object.travelY\|\|0)?\);/,'DRAW_PERSON');
assert.equal(scrub(now),scrub(old));console.log('PASS: changes restricted to actor sprites, pedestrian placement and walk cadence. All buildings, UI, reports, transfer gate, graph and economy source unchanged.');
function api(html){let code=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');code=code.slice(0,code.indexOf('/* PIXEL ANIMATION'))+code.slice(code.indexOf('function renderTimeline()'));const c={document:{addEventListener(){}},matchMedia:()=>({matches:true}),structuredClone,setTimeout};vm.createContext(c);vm.runInContext(code+'\nglobalThis.api={run:path=>{economy=initialEconomy();recordYear();path.forEach(stepEconomy);return JSON.stringify({economy,explanations:economicExplanations(),transfer:transferQuestion()})},years:YEARS}',c);return c.api;}
const a=api(old),b=api(now);for(let n=0;n<243;n++){let k=n;const ids=a.years.map(y=>{const id=y.options[k%3].id;k=Math.floor(k/3);return id});assert.equal(a.run(ids),b.run(ids));}console.log('PASS: all 243 economic histories and instructional follow-ups identical.');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:900}}),before=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{let next=0,t=1000;const q=new Map();window.requestAnimationFrame=cb=>{q.set(++next,cb);return next};window.cancelAnimationFrame=id=>q.delete(id);window.stepWorld=count=>{for(let i=0;i<count;i++){t+=50;const jobs=[...q.values()];q.clear();jobs.forEach(cb=>cb(t));}};});
await page.goto('http://127.0.0.1:4179/games/the-long-run/');await before.goto(pathToFileURL(path.resolve(beforeFile)).href);
for(const [name,p] of [['before',before],['after',page]]){
 const sheet=await p.evaluate(()=>{
  const c=document.createElement('canvas');c.width=1000;c.height=840;const ctx=c.getContext('2d');ctx.fillStyle='#b9cfcd';ctx.fillRect(0,0,c.width,c.height);ctx.font='16px system-ui';
  ['pedestrian','shopper','factoryWorker','worker','resident','compact','sedan','truck'].forEach((type,i)=>{ctx.fillStyle='#192e40';ctx.fillText(type,8,i*104+20);sprites[type].frames.slice(0,5).forEach((frame,f)=>{frame.forEach((row,y)=>[...row].forEach((v,x)=>{if(v!==' '){ctx.fillStyle=PIXEL_PALETTE[v];ctx.fillRect(160+f*150+x*3,i*104+12+y*3,3,3)}}));});});return c.toDataURL().split(',')[1];
 });fs.writeFileSync(`tmp/long-run-footfall-actors-${name}.png`,Buffer.from(sheet,'base64'));
}
const dimensions=await page.evaluate(()=>Object.fromEntries(Object.entries(sprites).filter(([type])=>SPRITE_PLACEMENT[type]).map(([type,s])=>[type,[s.frames[0][0].length,s.frames[0].length]])));assert.deepEqual(dimensions.compact,[35,20]);assert.deepEqual(dimensions.sedan,[41,20]);assert.deepEqual(dimensions.truck,[46,20]);assert.deepEqual(dimensions.pedestrian,[18,27]);
const check=await page.evaluate(()=>{
 const issues=new Set(),plants=new Map();let plantChecks=0;const isCar=o=>['compact','sedan','truck'].includes(o.spriteType),key=o=>`${isCar(o)?'car':'human'}/${o.path}/${o.index}`;
 const tables=[45,78,111].map(x=>({x:x-6,y:159,w:13,h:4})),obstacles=[{x:127,y:166,w:11,h:13},{x:241,y:326,w:22,h:14},{x:132,y:329,w:11,h:7},...[3,265,415,635].map(x=>({x:x-3,y:176,w:8,h:2}))];
 for(const [type,sprite] of Object.entries(sprites)){if(!SPRITE_PLACEMENT[type])continue;const h=sprite.frames[0].length,w=sprite.frames[0][0].length;for(const frame of sprite.frames){if(frame.length!==h||frame.some(row=>row.length!==w))issues.add('Frame size jitter');for(const row of frame)for(const c of row)if(c!==' '&&!(c in PIXEL_PALETTE))issues.add('Unknown color');}if(!['compact','sedan','truck'].includes(type)&&new Set(sprite.frames.slice(0,4).map(f=>f.join())).size!==4)issues.add('Indistinct walk poses');}
 function inspect(ticks){let prior=pixelWorld.inspect().objects;
  for(let tick=0;tick<ticks;tick++){stepWorld(1);const current=pixelWorld.inspect().objects;
   for(const lane of ['upperRoad','lowerRoad']){const cars=current.filter(o=>isCar(o)&&o.active&&o.path===lane).sort((a,b)=>a.x-b.x);for(let i=1;i<cars.length;i++)if(cars[i].x-cars[i-1].x<sprites[cars[i-1].spriteType].frames[0][0].length+6)issues.add('Car crowding');for(const car of cars){if(car.y!==(lane==='upperRoad'?197:218))issues.add('Lane drift');const h=sprites[car.spriteType].frames[0].length;if(car.y<196||car.y+h>238||(lane==='upperRoad'&&car.y+h>217))issues.add('Lane clipping');}}
   for(const o of current){const previous=prior.find(p=>key(p)===key(o));if(o.path&&o.active&&previous?.active&&Math.abs(o.x-previous.x)>2)issues.add('Motion jump');if(!o.active||isCar(o))continue;
    if(o.path&&o.wait<=0){
      const progress=(o.travelY?Math.round(o.y)*o.travelY:Math.round(o.x)*o.direction)+o.index*2,phase=walkingPhase(o),cycle=Math.floor(progress/4),feet=walkingFeet(phase,o.travelY||0),frame=humanFrames(o.spriteType,o.travelY||0)[o.frame];
      const foot=feet.planted,offset=SPRITE_PLACEMENT[o.spriteType],x=Math.round(o.x)+offset.x+(o.direction<0?17-foot.x:foot.x),y=Math.round(o.y)+offset.y+foot.y;
      if(frame[foot.y][foot.x]!=='O')issues.add('Missing planted sole');
      const prior=plants.get(key(o));if(prior&&prior.cycle===cycle&&prior.axis===o.travelY&&prior.direction===o.direction){plantChecks++;if(x!==prior.x||y!==prior.y)issues.add('Planted foot slides');}
      plants.set(key(o),{cycle,x,y,axis:o.travelY,direction:o.direction});
    }
    const off=SPRITE_PLACEMENT[o.spriteType],frame=sprites[o.spriteType].frames[o.idle?SPRITE_WALK.idleFrame:o.frame];frame.forEach((row,y)=>[...row].forEach((c,x)=>{if(c===' ')return;const px=Math.round(o.x)+off.x+(o.direction<0?row.length-1-x:x),py=Math.round(o.y)+off.y+y;if(tables.some(t=>px>=t.x&&px<t.x+t.w&&py>=t.y&&py<t.y+t.h))issues.add('Table contact');if(y===frame.length-1&&obstacles.some(t=>px>=t.x&&px<t.x+t.w&&py>=t.y&&py<t.y+t.h))issues.add('Feet in furniture');}));}
   prior=current;
  }
 }
 inspect(640);for(const id of ['confidence','fiscal-expand','rate-cut','housing-boom','support']){const before=pixelWorld.inspect().objects;stepEconomy(id);renderWorld();const after=pixelWorld.inspect().objects;for(const o of before.filter(o=>o.path)){const next=after.find(n=>key(n)===key(o));if(next&&next.distance!==o.distance)issues.add('Year teleport');}inspect(640);}
 return {issues:[...issues],frames:pixelWorld.inspect().frameCount,plantChecks};
});assert.deepEqual(check.issues,[]);assert.ok(check.plantChecks>10000);console.log('PASS: 192 seconds of simulated motion, lane clearances, sprite bounds/colors, furniture, wraparound and year continuity.',check);
for(const [label,ids] of Object.entries({baseline:[],busy:['confidence','fiscal-expand','rate-cut'],recession:['energy','fiscal-contract','rate-hike']})){
 for(const p of [page,before])await p.evaluate(ids=>{economy=initialEconomy();recordYear();ids.forEach(stepEconomy);render();},ids);
 assert.equal(await page.locator('#world').evaluate(c=>c.toDataURL()),await before.locator('#world').evaluate(c=>c.toDataURL()));
 await page.evaluate(()=>stepWorld(30));await page.locator('.world-window').screenshot({path:`tmp/long-run-footfall-${label}.png`});
}
for(const width of [1440,1280,390]){for(const p of [page,before])await p.setViewportSize({width,height:900});const geometry=p=>p.evaluate(()=>{const r=document.querySelector('#world').getBoundingClientRect();return {width:r.width,x:r.x,overflow:document.documentElement.scrollWidth>innerWidth}});assert.deepEqual(await geometry(page),await geometry(before));}
await page.locator('#motion').click();const time=await page.evaluate(()=>pixelWorld.inspect().time);await page.evaluate(()=>stepWorld(40));assert.equal(await page.evaluate(()=>pixelWorld.inspect().time),time);await page.locator('#motion').click();await page.evaluate(()=>stepWorld(40));assert.ok(await page.evaluate(()=>pixelWorld.inspect().time)>time);
assert.deepEqual(errors,[]);console.log('PASS: unchanged background pixels in baseline/busy/recession, desktop/mobile layout, pause/resume and no browser errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
