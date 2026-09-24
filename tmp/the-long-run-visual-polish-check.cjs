const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const old=fs.readFileSync('tmp/the-long-run-pre-visual-polish.html','utf8').replaceAll('\r\n','\n');
const now=fs.readFileSync('audit_tools/econ_rpg/game/games/the-long-run/index.html','utf8').replaceAll('\r\n','\n');
const protectedSource=s=>s.replace(/const TOWN_PALETTE=\{[\s\S]*?\n\};/,'PALETTE').replace(/fps:\d+,vehicleSpeed/,'fps:UNCHANGED,vehicleSpeed').replace(/const SPRITE_WALK=.+/,'WALK').replace(/const sprites=\{[\s\S]*?(?=  smoke:\{frames:)/,'ACTOR MATRICES').replace(/vehicleColors=\[[^\]]+\]/,'vehicleColors=PALETTE').replace(/shirtColors=\[[^\]]+\]/,'shirtColors=PALETTE');
assert.equal(protectedSource(now),protectedSource(old));
console.log('Only palette, actor matrices, walk sequence/idle frame and animation FPS changed; all layout, paths, anchors, prose and game logic identical.');
function api(html){let code=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');code=code.slice(0,code.indexOf('/* PIXEL ANIMATION'))+code.slice(code.indexOf('function renderTimeline()'));const c={document:{addEventListener(){}},matchMedia:()=>({matches:true}),structuredClone,setTimeout};vm.createContext(c);vm.runInContext(code+'\nglobalThis.api={run:path=>{economy=initialEconomy();recordYear();path.forEach(stepEconomy);return JSON.stringify(economy)},years:YEARS}',c);return c.api;}
const a=api(old),b=api(now);for(let n=0;n<243;n++){let k=n;const path=a.years.map(y=>{const id=y.options[k%3].id;k=Math.floor(k/3);return id});assert.equal(b.run(path),a.run(path));}
console.log('All 243 complete economic histories unchanged.');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4179/games/the-long-run/');
const validity=await page.evaluate(()=>{
 const failures=[],sizes={};
 for(const type of ['compact','sedan','truck','pedestrian','worker']){
  const frames=sprites[type].frames,w=frames[0][0].length,h=frames[0].length;sizes[type]=[w,h,frames.length];
  for(const f of frames){if(f.length!==h||f.some(r=>r.length!==w))failures.push('Frame size jitter '+type);for(const row of f)for(const c of row)if(c!==' '&&!(c in PIXEL_PALETTE))failures.push('Unknown color');}
  if(type==='pedestrian'||type==='worker'){
   if(SPRITE_PLACEMENT[type].y+h!==12)failures.push('Foot drift');
   if(new Set(SPRITE_WALK.sequence.map(i=>JSON.stringify(frames[i]))).size!==4)failures.push('Walk frames not distinct');
   if(SPRITE_WALK.sequence.includes(SPRITE_WALK.idleFrame))failures.push('Idle should be separate');
  }else{
   if(w>34)failures.push('Too wide for respawn');
   if(frames[0].slice(0,10).join()!==frames[1].slice(0,10).join())failures.push('Vehicle body jitter');
   if(149+SPRITE_PLACEMENT[type].y<148||163+SPRITE_PLACEMENT[type].y+h>177)failures.push('Road overflow');
   if(149+SPRITE_PLACEMENT[type].y+h>163+SPRITE_PLACEMENT[type].y)failures.push('Lane overlap');
  }
 }
 const palette=new Set(Object.values(TOWN_PALETTE));
 for(const c of document.querySelectorAll('.city-surface canvas')){
  if(c.width!==480||c.height!==270||c.getContext('2d').imageSmoothingEnabled)failures.push('Canvas grid changed');
  const data=c.getContext('2d').getImageData(0,0,480,270).data;
  for(let i=0;i<data.length;i+=4){if(data[i+3]!==0&&data[i+3]!==255)failures.push('Antialiasing');if(data[i+3]&&!palette.has('#'+[data[i],data[i+1],data[i+2]].map(x=>x.toString(16).padStart(2,'0')).join('')))failures.push('Outside palette');}
 }
 return {failures:[...new Set(failures)],sizes};
});
assert.deepEqual(validity.failures,[]);console.log('Native matrices, distinct walk frames, stationary wheel bodies, lane fit, crisp canvas: PASS',validity.sizes);
await page.screenshot({path:'tmp/the-long-run-polished-desktop.png',fullPage:true});
for(let n=0;n<5;n++){await page.locator('[data-choice]:enabled').first().click();await page.waitForFunction(()=>economy.phase==='choice'||economy.phase==='finished');if(n===2)await page.screenshot({path:'tmp/the-long-run-polished-busy.png',fullPage:true});}
assert.equal(await page.locator('#report').isVisible(),true);await page.locator('#model-toggle').click();assert.equal(await page.locator('#graph').isVisible(),true);
// Preview every native actor frame against its actual ground color, enlarged by integer scaling.
await page.evaluate(()=>{
 const c=document.createElement('canvas');c.id='sprite-review';c.width=200;c.height=140;c.style.cssText='position:fixed;inset:0;width:1000px;height:700px;image-rendering:pixelated;z-index:999;background:#fff';document.body.append(c);
 const g=c.getContext('2d');g.fillStyle=TOWN_PALETTE.paving;g.fillRect(0,0,200,64);g.fillStyle=TOWN_PALETTE.road;g.fillRect(0,64,200,76);
 const palette={...PIXEL_PALETTE,B:TOWN_PALETTE.coral,C:TOWN_PALETTE.blue,A:TOWN_PALETTE.sky};
 for(const [i,type] of ['pedestrian','worker','compact','sedan','truck'].entries())sprites[type].frames.forEach((frame,n)=>frame.forEach((row,y)=>[...row].forEach((v,x)=>{if(v!==' '){g.fillStyle=palette[v];g.fillRect(8+n*38+x,5+i*27+y,1,1);}})));
});
await page.locator('#sprite-review').screenshot({path:'tmp/the-long-run-polished-actors.png'});
assert.deepEqual(errors,[]);console.log('Year progression, final report and AD-AS reveal PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
