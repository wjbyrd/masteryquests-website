const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url'),path=require('node:path');
const oldPath='tmp/the-long-run-pre-actor-upgrade.html',newPath='audit_tools/econ_rpg/game/games/the-long-run/index.html';
const old=fs.readFileSync(oldPath,'utf8').replaceAll('\r\n','\n'),now=fs.readFileSync(newPath,'utf8').replaceAll('\r\n','\n');
const protect=s=>s.replace(/const PIXEL_PALETTE=[^\n]+/,'ACTOR_PALETTE').replace(/const SPRITE_PLACEMENT=[^\n]+/,'ACTOR_PLACEMENT').replace(/const sprites=\{[\s\S]*?(?=  smoke:\{frames:)/,'ACTOR_MATRICES').replace(/  \/\/ Actor-only ramps[\s\S]*?(?=  let visual=null)/,'').replace(/    const brush=sheet.getContext[\s\S]*?(?=    if\(type==='smoke'\))/,'ACTOR_COLORS\n');
assert.equal(protect(now),protect(old));console.log('Only actor matrices, native sprite placement and actor palette changed. Layout, buildings, routes, animation timing, controls and economy source identical.');
function api(html){let code=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');code=code.slice(0,code.indexOf('/* PIXEL ANIMATION'))+code.slice(code.indexOf('function renderTimeline()'));const c={document:{addEventListener(){}},matchMedia:()=>({matches:true}),structuredClone,setTimeout};vm.createContext(c);vm.runInContext(code+'\nglobalThis.api={run:path=>{economy=initialEconomy();recordYear();path.forEach(stepEconomy);return JSON.stringify(economy)},years:YEARS}',c);return c.api;}
const a=api(old),b=api(now);for(let n=0;n<243;n++){let k=n;const choices=a.years.map(y=>{const id=y.options[k%3].id;k=Math.floor(k/3);return id});assert.equal(b.run(choices),a.run(choices));}console.log('All 243 complete economic histories identical.');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const before=await browser.newPage({reducedMotion:'reduce'}),after=await browser.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'});
 const errors=[];after.on('pageerror',e=>errors.push(e.message));await before.goto(pathToFileURL(path.resolve(oldPath)).href);await after.goto(pathToFileURL(path.resolve(newPath)).href);
 const cases={baseline:[],expansion:['confidence','fiscal-expand','rate-cut'],recession:['energy','fiscal-contract','rate-hike'],inflation:['energy'],rates:['confidence','fiscal-expand','rate-hike'],productivity:['breakthrough','fiscal-hold','rate-hold','infrastructure']};
 for(const [name,choices] of Object.entries(cases)){
  const run=p=>p.evaluate(ids=>{economy=initialEconomy();recordYear();ids.forEach(stepEconomy);render();const state=pixelWorld.inspect();return {background:document.querySelector('#world').toDataURL(),caption:document.querySelector('#city-caption').textContent,callouts:document.querySelector('#callouts').innerHTML,visual:state.visual,actors:state.objects};},choices);
  assert.deepEqual(await run(after),await run(before));
  const failures=await after.evaluate(()=>{
   const errors=[],tables=[35,59,83].map(x=>({x:x-5,y:121,w:11,h:3}));
   for(const type of ['compact','sedan','truck','pedestrian','worker']){
    const f=sprites[type].frames,w=f[0][0].length,h=f[0].length;
    for(const frame of f){if(frame.length!==h||frame.some(row=>row.length!==w))errors.push('Frame jitter');for(const row of frame)for(const c of row)if(c!==' '&&!(c in PIXEL_PALETTE))errors.push('Unknown color '+c);}
    if(['pedestrian','worker'].includes(type)){
     if(w!==11||h!==18||SPRITE_PLACEMENT[type].y+h!==12)errors.push('Foot anchor drift');
     if(new Set(SPRITE_WALK.sequence.map(i=>f[i].join())).size!==4)errors.push('Walk poses not distinct');
    }else{
     if(w>34||h!==14)errors.push('Vehicle bounds');
     if(f[0].slice(0,10).join()!==f[1].slice(0,10).join())errors.push('Body wobble');
     const top=149+SPRITE_PLACEMENT[type].y,bottom=163+SPRITE_PLACEMENT[type].y+h;
     if(top<148||bottom>177||top+h>162)errors.push('Lane overlap');
    }
   }
   for(const o of pixelWorld.inspect().objects.filter(o=>o.active&&!['compact','sedan','truck'].includes(o.spriteType))){
    const offset=SPRITE_PLACEMENT[o.spriteType],frame=sprites[o.spriteType].frames[o.idle?SPRITE_WALK.idleFrame:o.frame];
    frame.forEach((row,y)=>[...row].forEach((c,x)=>{if(c===' ')return;const px=Math.round(o.x)+offset.x+(o.direction<0?row.length-1-x:x),py=Math.round(o.y)+offset.y+y;if(tables.some(t=>px>=t.x&&px<t.x+t.w&&py>=t.y&&py<t.y+t.h))errors.push('Table overlap');}));
   }
   for(const c of document.querySelectorAll('.city-surface canvas')){if(c.width!==480||c.height!==270||c.getContext('2d').imageSmoothingEnabled)errors.push('Canvas changed');const data=c.getContext('2d').getImageData(0,0,480,270).data;for(let i=3;i<data.length;i+=4)if(data[i]!==0&&data[i]!==255){errors.push('Antialiasing');break;}}
   return [...new Set(errors)];
  });assert.deepEqual(failures,[],name);
  if(name==='expansion'||name==='recession')await after.locator('#world-shell').screenshot({path:`tmp/the-long-run-actor-upgrade-${name}.png`});
 }
 console.log('Six scenes: town canvas pixel-identical; actor populations/routes/captions identical; sprite bounds, lane fit, cafe clearances and crisp pixels PASS');
 for(const width of [1440,1280,390]){await after.setViewportSize({width,height:800});const geometry=await after.evaluate(()=>{const a=document.querySelector('#world').getBoundingClientRect(),b=document.querySelector('#pixel-world').getBoundingClientRect();return {world:a.width,actors:b.width,offset:a.x-b.x,overflow:document.documentElement.scrollWidth>innerWidth};});assert.equal(geometry.world,width>=1400?840:960);assert.equal(geometry.actors,geometry.world);assert.equal(geometry.offset,0);assert.equal(geometry.overflow,false);}
 assert.deepEqual(errors,[]);console.log('Desktop, stacked and mobile canvas alignment PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
