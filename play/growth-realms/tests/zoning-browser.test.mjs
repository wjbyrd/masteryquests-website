import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {waitMaps} from './browser-helpers.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=fileURLToPath(new URL('../../../tmp/games-preview/growth-realms/zoning-pass/',import.meta.url));await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1366,height:900}}),errors=[],results={levels:[],responsive:[]};
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.location().url.endsWith('/favicon.ico'))errors.push(m.text()+' '+m.location().url);});
const base='http://127.0.0.1:4178/play/growth-realms/';
try{
 // Starting screenshots come from the real title -> choice -> planning flow.
 for(const city of ['meridian','rivermark']){
  await p.goto(base);await p.locator('#start-game').click();await p.locator(`[data-choose=${city}]`).click();await waitMaps(p);
  assert.equal(await p.locator('.city-map').getAttribute('data-layout-errors'),'0');
  await p.screenshot({path:out+`starting-${city}.png`});
 }
 await p.goto(base+'tests/zoning.html');await p.waitForFunction(()=>document.body.dataset.ready==='true');
 const show=options=>p.evaluate(async options=>(await import('./zoning-fixture.js')).show(options),options);
 await p.emulateMedia({reducedMotion:'reduce'});
 for(const city of ['meridian','rivermark']){
  const a=await show({city,mode:'max',levels:null,construction:false});assert.deepEqual(a.errors,[]);
  await p.screenshot({path:out+`maximum-${city}.png`});
  for(const category of ['capital','resources','research','education']){
   const shots=[];
   for(let level=0;level<=5;level++){
    const audit=await show({city,mode:'max',levels:{[category]:level},construction:false});assert.deepEqual(audit.errors,[]);
    const target=p.locator(`[data-map-district=${category}]`),box=await target.boundingBox();assert.ok(box.width>=44&&box.height>=44);
    const native=await p.evaluate(async({city,category})=>{
      const {districtAnchor}=await import('../district-layout.js'),{iso,MAP,CAMERA}=await import('../visual-config.js');const [x,y]=iso(...districtAnchor(city,category));
      const r=document.querySelector('.city-map').getBoundingClientRect(),scale=r.width/CAMERA.width;
      return {x:r.x+(x-CAMERA.x-175)*scale,y:r.y+(y-CAMERA.y-190)*scale,width:350*scale,height:330*scale};
    },{city,category});
    const screenshot=await p.screenshot({clip:native});shots.push({level,src:screenshot.toString('base64')});results.levels.push({city,category,level,anchor:audit.occupied.find(f=>f.id===category).center,target:box,errors:audit.errors});
    for(const progress of [0,.2,.4,.6,.8,1]){
      const transition=await show({city,mode:'max',levels:{[category]:level},construction:true,progress});assert.deepEqual(transition.errors,[]);
      assert.equal(await p.locator('.city-map').getAttribute('data-layout-errors'),'0');
    }
   }
   const sheet=await browser.newPage({viewport:{width:1080,height:770}});
   await sheet.setContent(`<body style="margin:0;background:#031638;color:white;font:16px sans-serif"><h2 style="padding:12px;margin:0">${city} · ${category} · actual renderer, levels 0–5</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${shots.map(s=>`<div><div>Level ${s.level}</div><img style="width:100%" src="data:image/png;base64,${s.src}"></div>`).join('')}</div></body>`);
   await sheet.screenshot({path:out+`levels-${city}-${category}.png`,fullPage:true});await sheet.close();
  }
  await show({city,mode:'max',levels:null,construction:true,progress:.4});await p.screenshot({path:out+`construction-${city}.png`});
  await p.locator('#overlay').check();await show({city,mode:'max',levels:null,construction:false});await p.screenshot({path:out+`routes-${city}.png`});await p.locator('#overlay').uncheck();
 }
 // Observe actual production traffic through full loops at maximum development.
 await p.emulateMedia({reducedMotion:'no-preference'});await show({city:'meridian',mode:'max',levels:null,construction:false});
 const moving=await p.evaluate(async()=>{
   const {rendererStats}=await import('../map-engine.js'),{intersects}=await import('../scene-layout.js');let samples=0,collisions=[],routes=new Set();
   for(let n=0;n<130;n++){await new Promise(r=>setTimeout(r,125));const state=rendererStats().states[0];for(const unit of state.moving){routes.add(unit.id);samples++;const hit=[...state.layout.occupied,...state.layout.scenery].find(f=>intersects(unit.footprint,f));if(hit)collisions.push({unit:unit.id,hit:hit.id});}}
   return {samples,collisions,routes:[...routes]};
 });assert.deepEqual(moving.collisions,[]);assert.ok(moving.routes.length>=4);results.traffic=moving;
 // Responsive interaction uses the real game and unchanged point allocation.
 for(const width of [1366,768,390,320]){
  await p.setViewportSize({width,height:width>=900?768:900});await p.goto(base);await p.locator('#start-game').click();await p.locator('[data-choose=rivermark]').click();await waitMaps(p);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const targets=await p.locator('[data-map-district]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height};}));assert.ok(targets.every(r=>r.w>=44&&r.h>=44));
  await p.locator('[data-map-district=capital]').click();assert.equal(await p.locator('#selected-investment').innerText(),'1');
  const map=await p.locator('.city-map').boundingBox();if(width>=900)assert.ok(map.y+map.height<=768);results.responsive.push({width,map,targets});
  if(width===390)await p.screenshot({path:out+'mobile-planning.png'});
 }
 assert.deepEqual(errors,[]);await fs.writeFile(out+'audit.json',JSON.stringify({...results,errors},null,2));console.log(`PASS: 48 individual levels, 288 construction transitions, both maximum states, ${moving.samples} live vehicle samples, four viewports.`);
}finally{await browser.close();}
