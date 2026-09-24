const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url'),path=require('node:path');
const beforePath='tmp/the-long-run-pre-architecture.html',afterPath='audit_tools/econ_rpg/game/games/the-long-run/index.html';
const before=fs.readFileSync(beforePath,'utf8').replaceAll('\r\n','\n'),after=fs.readFileSync(afterPath,'utf8').replaceAll('\r\n','\n');
const script=s=>s.match(/<script>([\s\S]*?)<\/script>/)[1];
const protect=s=>script(s).replace(/const TOWN_BUILDINGS=[\s\S]*?(?=function renderWorld\()/,'ARCHITECTURE\n').replace(/fixedPerson\((?:28\+i\*21,126|22\+i\*24,116),i\)/,'CAFE_ANCHOR').replace(/\/\/ (?:Bitmap price text|Small produce and pump accents)[^\n]*/,'// Price cue');
assert.equal(protect(after),protect(before));
assert.equal(after.split('<body>')[1].split('<script>')[0],before.split('<body>')[1].split('<script>')[0]);
const styles=s=>s.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\/\* Desktop[^\n]*\n/,'').replace(/grid-template-columns:(?:966|846)px minmax\(360px,420px\)/,'GRID').replace(/max-width:(?:1404|1284)px/,'MAX').replace(/  \.world-column\{max-width:846px\}\n  \.city-surface\{min-width:840px\}\n/,'');
assert.equal(styles(after),styles(before));
console.log('Protected actor design, animation, routes, economics, UI/report source and all CSS except desktop scale: unchanged.');
function api(html){let code=script(html).replace(/\nrender\(\);\s*$/,'');code=code.slice(0,code.indexOf('/* PIXEL ANIMATION'))+code.slice(code.indexOf('function renderTimeline()'));const c={document:{addEventListener(){}},matchMedia:()=>({matches:true}),structuredClone,setTimeout};vm.createContext(c);vm.runInContext(code+'\nglobalThis.api={run:path=>{economy=initialEconomy();recordYear();path.forEach(stepEconomy);return JSON.stringify(economy)},years:YEARS}',c);return c.api;}
const a=api(before),b=api(after);for(let n=0;n<243;n++){let k=n;const choices=a.years.map(y=>{const id=y.options[k%3].id;k=Math.floor(k/3);return id});assert.equal(b.run(choices),a.run(choices));}
console.log('All 243 complete economic histories identical.');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const old=await browser.newPage({reducedMotion:'reduce'}),page=await browser.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await old.goto(pathToFileURL(path.resolve(beforePath)).href);await page.goto(pathToFileURL(path.resolve(afterPath)).href);
 const cases={baseline:[],expansion:['confidence','fiscal-expand','rate-cut'],recession:['energy','fiscal-contract','rate-hike'],inflation:['energy'],rates:['confidence','fiscal-expand','rate-hike'],productivity:['breakthrough','fiscal-hold','rate-hold','infrastructure']};
 const run=(p,choices)=>p.evaluate(ids=>{economy=initialEconomy();recordYear();ids.forEach(stepEconomy);render();return {state:worldState(),caption:document.querySelector('#city-caption').textContent,callouts:document.querySelector('#callouts').innerHTML,visual:pixelWorld.inspect().visual,actors:pixelWorld.inspect().objects.map(o=>!o.path&&o.y===116?{...o,x:28+((o.x-22)/24)*21,y:126}:o)};},choices);
 for(const [name,choices] of Object.entries(cases)){
  assert.deepEqual(await run(page,choices),await run(old,choices));
  const result=await page.evaluate(()=>{
   const failures=[],tables=[35,59,83].map(x=>({x:x-5,y:121,w:11,h:3}));
   const objects=pixelWorld.inspect().objects;
   for(const o of objects.filter(o=>o.active&&!['compact','sedan','truck'].includes(o.spriteType))){
    const offset=SPRITE_PLACEMENT[o.spriteType],f=sprites[o.spriteType].frames[o.frame],r={x:o.x+offset.x,y:o.y+offset.y,w:f[0].length,h:f.length};
    if(tables.some(t=>r.x<t.x+t.w&&r.x+r.w>t.x&&r.y<t.y+t.h&&r.y+r.h>t.y))failures.push('Person on table');
   }
   for(const c of document.querySelectorAll('.city-surface canvas')){
    if(c.width!==480||c.height!==270||getComputedStyle(c).imageRendering!=='pixelated'||c.getContext('2d').imageSmoothingEnabled)failures.push('Canvas crispness');
    const data=c.getContext('2d').getImageData(0,0,480,270).data;
    for(let i=3;i<data.length;i+=4)if(data[i]!==0&&data[i]!==255){failures.push('Antialiasing');break;}
   }
   return failures;
  });assert.deepEqual(result,[]);
  await page.locator('#world-shell').screenshot({path:`tmp/the-long-run-architecture-${name}.png`});
 }
 console.log('Six economic scenes: identical state/callouts/actor population, correct cafe separation, crisp 480x270 canvases PASS');
 for(const width of [1500,1440,1400,1399,1280,768,390]){
  await page.setViewportSize({width,height:800});await page.reload();
  const r=await page.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};return {world:rect('#world'),actors:rect('#pixel-world'),shell:rect('#world-shell'),rail:rect('#decision'),last:rect('.choice:last-child'),overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(r.overflow,false);assert.deepEqual(r.world,r.actors);assert.equal(r.world.width,width>=1400?840:960);
  if(width>=1400){assert.equal(r.rail.y,r.shell.y);assert.ok(r.last.bottom<=800);}else{assert.ok(r.rail.y>r.shell.bottom);}
  if(width===390){await page.locator('.world-window').evaluate(el=>el.scrollLeft=400);assert.equal(await page.evaluate(()=>document.querySelector('#world').getBoundingClientRect().x-document.querySelector('#pixel-world').getBoundingClientRect().x),0);await page.screenshot({path:'tmp/the-long-run-architecture-mobile.png',fullPage:true});}
 }
 assert.deepEqual(errors,[]);console.log('Seven viewport sizes, desktop pullback, stacked fallback and mobile pan PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
