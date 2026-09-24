const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url'),path=require('node:path');
const oldPath='tmp/the-long-run-pre-targeted-polish.html',newPath='audit_tools/econ_rpg/game/games/the-long-run/index.html';
const old=fs.readFileSync(oldPath,'utf8').replaceAll('\r\n','\n'),now=fs.readFileSync(newPath,'utf8').replaceAll('\r\n','\n');
const protect=s=>s.replace(/const TOWN_PALETTE=\{[\s\S]*?\n\};/,'WORLD_COLORS')
 .replace(/vehicleGap:(56|68)/,'vehicleGap:SPACING')
 .replace(/(  for\(let x=0;x<640;x\+=8\)[^\n]*\n)[\s\S]*?(?=  r\(0,94,640,266)/,'$1SKYLINE\n')
 .replace(/const PIXEL_PALETTE=[^\n]+/,'ACTOR_PALETTE')
 .replace(/const PERSON_HEAD=[\s\S]*?(?=const sprites=\{)/,'ACTOR_ART\n')
 .replace(/upperRoad:\[\[-(?:52|64),197\],\[640,197\]\],lowerRoad:\[\[640,218\],\[-(?:52|64),218\]\]/,'ROAD_ENTRY')
 .replace(/,skinHighlights=\[[^\]]+\]/,'')
 .replace(/,Z:skinHighlights\[variant%2\]/,'');
assert.equal(protect(now),protect(old));console.log('Change boundary PASS: only skyline, pixel palette, human/vehicle art and vehicle spacing/offscreen entry changed. Buildings, UI, paths within town and economic code unchanged.');
function api(html){let code=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');code=code.slice(0,code.indexOf('/* PIXEL ANIMATION'))+code.slice(code.indexOf('function renderTimeline()'));const c={document:{addEventListener(){}},matchMedia:()=>({matches:true}),structuredClone,setTimeout};vm.createContext(c);vm.runInContext(code+'\nglobalThis.api={run:path=>{economy=initialEconomy();recordYear();path.forEach(stepEconomy);return JSON.stringify(economy)},years:YEARS}',c);return c.api;}
const a=api(old),b=api(now);for(let n=0;n<243;n++){let k=n;const choices=a.years.map(y=>{const id=y.options[k%3].id;k=Math.floor(k/3);return id});assert.equal(b.run(choices),a.run(choices));}console.log('All 243 economic histories identical.');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const before=await browser.newPage({reducedMotion:'reduce'}),page=await browser.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await before.goto(pathToFileURL(path.resolve(oldPath)).href);await page.goto(pathToFileURL(path.resolve(newPath)).href);
const size=p=>p.evaluate(()=>Object.fromEntries(['compact','sedan','truck'].map(type=>[type,{w:sprites[type].frames[0][0].length,h:sprites[type].frames[0].length}])));
const previous=await size(before),current=await size(page);for(const type of Object.keys(current)){const ratio=current[type].w/previous[type].w;assert.ok(ratio>=1.19&&ratio<=1.21);assert.equal(current[type].h,previous[type].h);}console.log('Vehicle length/pixel area increased 19.6–20%; unchanged lane height:',current);
const cases={baseline:[],expansion:['confidence','fiscal-expand','rate-cut'],recession:['energy','fiscal-contract','rate-hike'],inflation:['energy'],rates:['confidence','fiscal-expand','rate-hike'],productivity:['breakthrough','fiscal-hold','rate-hold','infrastructure']};
for(const [name,ids] of Object.entries(cases)){
 const run=p=>p.evaluate(ids=>{economy=initialEconomy();recordYear();ids.forEach(stepEconomy);render();const state=pixelWorld.inspect();return {state:worldState(),visual:state.visual,caption:document.querySelector('#city-caption').textContent,hud:document.querySelector('#hud').innerHTML,decision:document.querySelector('#decision').innerHTML,people:state.objects.filter(o=>!['compact','sedan','truck'].includes(o.spriteType))};},ids);
 assert.deepEqual(await run(page),await run(before));
 const failures=await page.evaluate(()=>{const failures=[];
  for(const [type,sprite] of Object.entries(sprites)){
   for(const f of sprite.frames)for(const row of f)for(const c of row)if(c!==' '&&!(c in PIXEL_PALETTE))failures.push('Unknown color');
   if(SPRITE_PLACEMENT[type]){const w=sprite.frames[0][0].length,h=sprite.frames[0].length;if(sprite.frames.some(f=>f.length!==h||f.some(r=>r.length!==w)))failures.push('Frame shape jitter');
    if(['compact','sedan','truck'].includes(type)){if(w>64||197+h>218||218+h>238||PIXEL_POLISH.vehicleGap<w)failures.push('Vehicle clearance');if(sprite.frames[0].slice(0,14).join()!==sprite.frames[1].slice(0,14).join())failures.push('Body jitter');}
    else if(w!==16||h!==26||new Set(SPRITE_WALK.sequence.map(i=>sprite.frames[i].join())).size!==4)failures.push('Human bounds/poses');
   }
  }
  for(const c of document.querySelectorAll('.city-surface canvas')){if(c.width!==640||c.height!==360||c.getContext('2d').imageSmoothingEnabled)failures.push('Canvas changed');const data=c.getContext('2d').getImageData(0,0,640,360).data;for(let i=3;i<data.length;i+=4)if(data[i]!==0&&data[i]!==255){failures.push('Antialiasing');break;}}
  return [...new Set(failures)];});assert.deepEqual(failures,[],name);
 if(['baseline','expansion','recession'].includes(name))await page.screenshot({path:`tmp/the-long-run-targeted-${name}.png`,fullPage:true});
}
for(const width of [1440,1280,390]){await page.setViewportSize({width,height:800});const geometry=await page.evaluate(()=>{const a=document.querySelector('#world').getBoundingClientRect(),b=document.querySelector('#pixel-world').getBoundingClientRect();return {a:a.width,b:b.width,x:a.x-b.x,overflow:document.documentElement.scrollWidth>innerWidth};});assert.equal(geometry.a,width>=1400?840:960);assert.equal(geometry.b,geometry.a);assert.equal(geometry.x,0);assert.equal(geometry.overflow,false);}
assert.deepEqual(errors,[]);console.log('Six economic scenes, native art bounds/crispness, vehicle fit and responsive alignment PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
