const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url'),path=require('node:path');
const oldPath='tmp/the-long-run-pre-640-world.html',newPath='audit_tools/econ_rpg/game/games/the-long-run/index.html';
const old=fs.readFileSync(oldPath,'utf8').replaceAll('\r\n','\n'),now=fs.readFileSync(newPath,'utf8').replaceAll('\r\n','\n');
const section=(s,a,b)=>s.slice(s.indexOf(a),b?s.indexOf(b):undefined);
assert.equal(section(now,'<!doctype html>','<script>').replaceAll('640/360','480/270').replaceAll('640 × 360','480 × 270').replaceAll('width="640" height="360"','width="480" height="270"'),section(old,'<!doctype html>','<script>'));
assert.equal(section(now,'/* 9. GAME DATA','const WORLD_GRID'),section(old,'/* 9. GAME DATA','const WORLD_GRID').replace('// CSS controls display size only; neither canvas is enlarged for devicePixelRatio.\n','// CSS controls display size only; neither canvas is enlarged for devicePixelRatio.\n')+'// Native 640 × 360 art: architectural components are drawn at their own pixel density.\n');
assert.equal(section(now,'function renderWorld()','/* PIXEL ANIMATION'),section(old,'function renderWorld()','/* PIXEL ANIMATION'));
assert.equal(section(now,'function getVisualEconomyState()','const pixelWorld'),section(old,'function getVisualEconomyState()','const pixelWorld'));
assert.equal(section(now,'function renderTimeline()'),section(old,'function renderTimeline()'));
console.log('Economics, choices, callouts, accessibility, reports and page layout source unchanged.');
function api(html){let code=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');code=code.slice(0,code.indexOf('/* PIXEL ANIMATION'))+code.slice(code.indexOf('function renderTimeline()'));const c={document:{addEventListener(){}},matchMedia:()=>({matches:true}),structuredClone,setTimeout};vm.createContext(c);vm.runInContext(code+'\nglobalThis.api={run:path=>{economy=initialEconomy();recordYear();path.forEach(stepEconomy);return JSON.stringify(economy)},years:YEARS}',c);return c.api;}
const a=api(old),b=api(now);for(let n=0;n<243;n++){let k=n;const choices=a.years.map(y=>{const id=y.options[k%3].id;k=Math.floor(k/3);return id});assert.equal(b.run(choices),a.run(choices));}console.log('All 243 complete economic histories identical.');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const before=await browser.newPage({reducedMotion:'reduce'}),page=await browser.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await before.goto(pathToFileURL(path.resolve(oldPath)).href);await page.goto(pathToFileURL(path.resolve(newPath)).href);
 const cases={baseline:[],expansion:['confidence','fiscal-expand','rate-cut'],recession:['energy','fiscal-contract','rate-hike'],inflation:['energy'],rates:['confidence','fiscal-expand','rate-hike'],productivity:['breakthrough','fiscal-hold','rate-hold','infrastructure']};
 const counts={};
 for(const [name,choices] of Object.entries(cases)){
  const run=p=>p.evaluate(ids=>{economy=initialEconomy();recordYear();ids.forEach(stepEconomy);render();return {state:worldState(),caption:document.querySelector('#city-caption').textContent,description:document.querySelector('#world-description').textContent,hud:document.querySelector('#hud').innerHTML,decision:document.querySelector('#decision').innerHTML,callouts:document.querySelector('#callouts').innerHTML,visual:pixelWorld.inspect().visual};},choices);
  assert.deepEqual(await run(page),await run(before));
  const result=await page.evaluate(()=>{
   const errors=[],humans=['pedestrian','shopper','resident','factoryWorker','worker'],cars=['compact','sedan','truck'];
   for(const type of [...humans,...cars]){
    const frames=sprites[type].frames,w=frames[0][0].length,h=frames[0].length;
    for(const frame of frames){if(frame.length!==h||frame.some(row=>row.length!==w))errors.push('Matrix jitter '+type);for(const row of frame)for(const c of row)if(c!==' '&&!(c in PIXEL_PALETTE))errors.push('Unknown color '+c);}
    if(humans.includes(type)){if(w!==16||h!==26)errors.push('Human resolution');if(new Set(SPRITE_WALK.sequence.map(i=>frames[i].join())).size!==4)errors.push('Walk poses not distinct');}
    else {if(w>52||h>21)errors.push('Vehicle lane/spawn fit');if(frames[0].slice(0,14).join()!==frames[1].slice(0,14).join())errors.push('Body jitter');}
   }
   if(new Set(humans.map(type=>JSON.stringify(sprites[type]))).size!==5)errors.push('Missing role variants');
   for(const c of document.querySelectorAll('.city-surface canvas')){if(c.width!==640||c.height!==360||c.getContext('2d').imageSmoothingEnabled||getComputedStyle(c).imageRendering!=='pixelated')errors.push('Canvas grid');const data=c.getContext('2d').getImageData(0,0,640,360).data;for(let i=3;i<data.length;i+=4)if(data[i]!==0&&data[i]!==255){errors.push('Antialiasing');break;}}
   const objects=pixelWorld.inspect().objects,vehicles=objects.filter(o=>cars.includes(o.spriteType)),people=objects.filter(o=>!cars.includes(o.spriteType));
   if(vehicles.length>10||people.length>18)errors.push('Object caps');
   const tables=[45,78,111].map(x=>({x:x-6,y:159,w:13,h:4}));
   for(const o of people.filter(o=>o.active)){
    const off=SPRITE_PLACEMENT[o.spriteType],frame=sprites[o.spriteType].frames[o.idle?SPRITE_WALK.idleFrame:o.frame];
    frame.forEach((row,y)=>[...row].forEach((c,x)=>{if(c===' ')return;const px=Math.round(o.x)+off.x+(o.direction<0?row.length-1-x:x),py=Math.round(o.y)+off.y+y;if(tables.some(t=>px>=t.x&&px<t.x+t.w&&py>=t.y&&py<t.y+t.h))errors.push('Table overlap');}));
   }
   return {errors:[...new Set(errors)],vehicles:vehicles.length,people:people.length,construction:people.filter(o=>o.path==='construction').length};
  });assert.deepEqual(result.errors,[],name);counts[name]=result;
  if(name==='recession'||name==='rates')assert.equal(result.construction,0);
  await page.screenshot({path:`tmp/the-long-run-640-${name}.png`,fullPage:true});
 }
 assert.ok(counts.expansion.vehicles>counts.recession.vehicles);assert.ok(counts.expansion.people>counts.recession.people);
 console.log('Six scenes: unchanged UI/state, five distinct native human variants, lane-sized vehicles, caps, cafe clearance and crisp pixels PASS');
 for(const width of [1500,1440,1400,1399,1280,768,390,320]){
  await page.setViewportSize({width,height:800});await page.reload();
  const d=await page.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};return {a:rect('#world'),b:rect('#pixel-world'),shell:rect('#world-shell'),rail:rect('#decision'),choice:rect('.choice:last-child'),overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.deepEqual(d.a,d.b);assert.equal(d.a.width,width>=1400?840:960);assert.equal(d.overflow,false);
  if(width>=1400){assert.equal(d.rail.y,d.shell.y);assert.ok(d.choice.bottom<800);}else assert.ok(d.rail.y>d.shell.bottom);
  if(width===390){await page.locator('.world-window').evaluate(el=>el.scrollLeft=410);assert.equal(await page.evaluate(()=>document.querySelector('#world').getBoundingClientRect().x-document.querySelector('#pixel-world').getBoundingClientRect().x),0);await page.screenshot({path:'tmp/the-long-run-640-mobile.png',fullPage:true});}
 }
 await page.emulateMedia({reducedMotion:'no-preference'});let start=await page.evaluate(()=>pixelWorld.inspect().frameCount);await page.waitForTimeout(1100);let frames=await page.evaluate(()=>pixelWorld.inspect().frameCount)-start;assert.ok(frames>=15&&frames<=26);await page.locator('#motion').click();start=await page.evaluate(()=>pixelWorld.inspect().frameCount);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>pixelWorld.inspect().frameCount),start);await page.locator('#motion').click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});start=await page.evaluate(()=>pixelWorld.inspect().frameCount);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>pixelWorld.inspect().frameCount),start);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(200);assert.ok(await page.evaluate(()=>pixelWorld.inspect().frameCount)>start);
 await page.emulateMedia({reducedMotion:'reduce'});start=await page.evaluate(()=>pixelWorld.inspect().frameCount);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>pixelWorld.inspect().frameCount),start);
 assert.deepEqual(errors,[]);console.log('Eight viewport sizes, pan, 20fps cadence, manual/hidden/reduced-motion pause PASS');
 fs.writeFileSync('tmp/the-long-run-640-qa.json',JSON.stringify(counts,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
