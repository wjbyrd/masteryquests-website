import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {ROADS,DISTRICTS} from '../visual-config.js';
import {fileURLToPath} from 'node:url';
import {fillPlan,getRun,waitMaps} from './browser-helpers.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=fileURLToPath(new URL('../../../tmp/games-preview/growth-realms/cleanup-pass/',import.meta.url));
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:1}),errors=[];
page.on('pageerror',e=>errors.push(e.stack));
page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(`${r.status()} ${r.url()}`);});
await page.addInitScript(()=>{Math.random=()=>.2;});
const url='http://127.0.0.1:4178/play/growth-realms/';
const shot=name=>page.screenshot({path:out+name+'.png'});
const forbidden=/\bCPU\b|computer|AI manages|AI opponent|algorithm|building threshold|materials stored/i;
async function choose(city){await page.goto(url);await page.locator('#start-game').click();await page.locator(`[data-choose="${city}"]`).click();await waitMaps(page);}
async function fit(){
  const map=await page.locator('.city-map').boundingBox(),hud=await page.locator('#planning-hud').boundingBox();
  const targets=await page.locator('[data-map-district]').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
  assert.ok(map.y>=hud.y+hud.height&&map.y+map.height<=768,JSON.stringify({map,hud}));
  assert.ok(targets.every(t=>t.w>=150&&t.h>=100));assert.equal(await page.locator('.single-city .city-heading').count(),0);
  assert.equal(await page.evaluate(()=>scrollY),0);return {map,hud,targets};
}
// Observe the production clock, without changing time, routes, drawings or game state.
async function watchRoutes(duration){return page.evaluate(async duration=>{
  const {rendererStats}=await import('./map-engine.js'),{onRoad,onSidewalk,intersects,depthOrder}=await import('./scene-layout.js');
  const seen={},failures=[],workers=new Set(),phases=new Set();let frames=0,last=-1;
  const until=performance.now()+duration;
  while(performance.now()<until){const s=rendererStats();if(s.tick!==last){last=s.tick;frames++;phases.add(document.body.dataset.phase);
    for(const state of s.states){for(let i=1;i<state.depthOrder.length;i++)if(depthOrder(state.depthOrder[i-1],state.depthOrder[i])>0)failures.push('depth');
      for(const unit of state.moving){if(unit.id.startsWith('worker:')){workers.add(unit.id);if([...state.layout.occupied,...state.layout.scenery].some(f=>intersects(unit.footprint,f)))failures.push({worker:unit.id,point:unit.point});continue;}
        const key=state.city+':'+unit.id;(seen[key]||=new Set()).add(unit.direction);
        if(!(unit.id==='campusStudents'?onSidewalk(unit.footprint):onRoad(unit.point))||[...state.layout.occupied,...state.layout.scenery].some(f=>intersects(unit.footprint,f)))failures.push({key,point:unit.point});
      }
    }
  }await new Promise(r=>setTimeout(r,50));}
  return{frames,seen:Object.fromEntries(Object.entries(seen).map(([k,v])=>[k,[...v]])),failures,workers:[...workers],phases:[...phases]};
},duration);}
try{
  await page.goto(url);await page.waitForFunction(()=>document.querySelector('#hero-scene').dataset.ready);
  assert.equal(await getRun(page),null);
  assert.equal((await page.locator('#title-screen').innerText()).replace(/\s+/g,' ').trim(),'GROWTH REALMS Start ahead. Catch up. Build your economy. Start Game → How to Play Field Guide');
  assert.ok(await page.locator('#hero-scene').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(v=>v>0)));
  await shot('01-title');
  await page.locator('#open-how').click();assert.deepEqual(await page.locator('#how-to-play li').allTextContents(),['Choose a city.','Spend 20 development points each cycle.','Build, adapt, and compare your growth with the city across the river.']);await page.keyboard.press('Escape');
  await page.locator('#landing-guide').click();assert.doesNotMatch(await page.locator('#help').innerText(),forbidden);await page.keyboard.press('Escape');
  await page.locator('#start-game').click();assert.match(await page.locator('#city-choice').innerText(),/Advanced and productive\./);assert.match(await page.locator('#city-choice').innerText(),/More room to catch up\./);await shot('02-choice');
  await page.locator('[data-choose="rivermark"]').click();await waitMaps(page);const rivermark=await fit();await shot('03-rivermark');
  await page.locator('[data-map-district="capital"]').click();assert.equal((await getRun(page)).allocation.capital,1);assert.match(await page.locator('#points-remaining').innerText(),/19/);
  assert.match(await page.locator('#upgrade-progress').innerText(),/NEXT UPGRADE\s+Factory\s+0 \/ 4 → 1 \/ 4 Capital points funded\s+3 more needed/);
  const marker=await page.locator('[data-map-district="capital"]').evaluate(e=>{const s=getComputedStyle(e,'::after');return{color:s.borderColor,radius:s.borderRadius};});assert.equal(marker.color,'rgb(255, 255, 255)');assert.equal(marker.radius,'50%');
  assert.equal(await page.locator('.district-plan-badge:visible').count(),0);await shot('05-selected-district');
  await page.locator('[data-adjust="clear"]').click();await fillPlan(page,[9,3,4,4]);await page.locator('#district-select').selectOption('capital');await page.locator('.map-click-feedback').waitFor({state:'hidden'});
  // Observe an actual construction cycle, including mobile workers and normal ambient routes.
  const cycleWatch=watchRoutes(4000);await page.locator('#quick-commit').click();const cycle=await cycleWatch;
  assert.deepEqual(cycle.failures,[]);assert.ok(cycle.workers.length>0);assert.ok(cycle.phases.includes('building'));await page.locator('#consequences').waitFor({state:'visible'});
  await page.locator('#quick-commit').click();await page.evaluate(()=>scrollTo(0,0));await waitMaps(page);
  const badge=page.locator('.condition-badge').filter({hasText:'Skills constraint'});await badge.locator('summary').click();assert.match(await badge.innerText(),/workforce training/);await shot('06-bottleneck');
  await page.locator('#district-select').selectOption('capital');await page.locator('[data-adjust="1"]').click();await page.locator('[data-adjust="1"]').click();await page.locator('[data-adjust="1"]').click();await page.locator('[data-adjust="1"]').click();await page.locator('.map-click-feedback').waitFor({state:'hidden'});
  assert.match(await page.locator('#upgrade-progress').innerText(),/Industrial complex\s+9 \/ 15 → 13 \/ 15 Capital points funded\s+2 more needed/);await shot('09-upgrade-progress');
  await choose('meridian');const meridian=await fit();await shot('04-meridian');
  const routes=await watchRoutes(18000);assert.deepEqual(routes.failures,[]);assert.equal(Object.keys(routes.seen).length,5);for(const [id,dirs]of Object.entries(routes.seen))assert.equal(dirs.length,4,id);
  const depthEvidence={};
  await page.evaluate(async()=>{window.auditRenderer=(await import('./map-engine.js')).rendererStats;});
  for(const [name,front]of [['07-vehicle-behind',false],['08-vehicle-front',true]]){
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForFunction(({front,x,y})=>{const s=window.auditRenderer().states[0],t=s.moving.find(u=>u.id==='factoryTruck'),b=s.depthOrder.find(o=>o.id==='district:research');return t&&Math.abs(t.point[0]-x)<.6&&Math.abs(t.point[1]-y)<.01&&(t.foot.y>b.foot.y)===front;},{front,x:DISTRICTS.research[0],y:front?ROADS.front:ROADS.cross});
    // Freeze only after a naturally reached position; no routes, draw order or state are patched.
    await page.emulateMedia({reducedMotion:'reduce'});
    const evidence=await page.evaluate(()=>{const s=window.auditRenderer().states[0];return{truck:s.moving.find(u=>u.id==='factoryTruck'),order:s.depthOrder.map(o=>o.id)};});
    assert.equal(evidence.truck.point[1],front?ROADS.front:ROADS.cross);assert.equal(evidence.order.indexOf('factoryTruck')>evidence.order.indexOf('district:research'),front);
    depthEvidence[name]=evidence;await shot(name);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  for(let n=1;n<=6;n++){await fillPlan(page,[5,5,5,5]);await page.locator('#quick-commit').click();await page.locator('#consequences').waitFor({state:'visible'});await page.locator('#quick-commit').click();}
  await page.locator('#final-report').waitFor({state:'visible'});assert.equal((await getRun(page)).cities[0].history.length,6);assert.match(await page.locator('#final-report').innerText(),/Policy connection|growth policy/);assert.doesNotMatch(await page.locator('body').innerText(),forbidden);
  await page.locator('[data-answer="potential"]').click();assert.ok((await page.locator('#transfer-feedback').innerText()).length>70);await page.locator('#replay').click();assert.equal(await getRun(page),null);assert.equal(await page.locator('#city-choice').isVisible(),true);
  assert.deepEqual(errors,[]);await fs.writeFile(out+'audit.json',JSON.stringify({viewport:{width:1366,height:768,deviceScaleFactor:1},rivermark,meridian,marker,cycle,routes,depthEvidence,errors},null,2));
  console.log('PASS A–K: sparse title, real hero, white selection, map/HUD fit for both managed cities, labeled skills constraint, cumulative upgrade preview, complete route loops and ground sorting, construction workers, six cycles, report/transfer/replay.');
}finally{await browser.close();}
