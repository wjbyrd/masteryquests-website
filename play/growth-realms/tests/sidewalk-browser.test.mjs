import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startCity,waitMaps} from './browser-helpers.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=fileURLToPath(new URL('../../../tmp/games-preview/growth-realms/sidewalk-pass/',import.meta.url));await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.location().url.endsWith('/favicon.ico'))errors.push(m.text());});
async function observe(){return page.evaluate(async()=>{
  const {rendererStats}=await import('/play/growth-realms/map-engine.js');
  const {onSidewalk,constructionWalks,contains,intersects}=await import('/play/growth-realms/scene-layout.js');
  const {PROTECTED_ROADS,FARM_FIELD}=await import('/play/growth-realms/district-layout.js');
  const directions=new Set(),failures=[];let pedestrians=0,workers=0,traffic=0,last=-1;
  const period=(await import('/play/growth-realms/visual-config.js')).SPRITE_ROUTES.campusStudents.period;const startTick=rendererStats().tick,until=performance.now()+65000;
  while(rendererStats().tick-startTick<period+2&&performance.now()<until){const s=rendererStats();if(s.tick!==last){last=s.tick;
    for(const city of s.states)for(const u of city.moving){
      if(u.id==='campusStudents'){pedestrians++;directions.add(u.direction);if(!onSidewalk(u.footprint)||PROTECTED_ROADS.some(r=>intersects(r,u.footprint)))failures.push('student off sidewalk');}
      else if(u.id.startsWith('worker:')){workers++;const id=u.id.split(':')[1];if(!constructionWalks(city.city,id).some(p=>contains(p,u.footprint))||PROTECTED_ROADS.some(r=>intersects(r,u.footprint)))failures.push('worker off service walk');}
      else if(u.id==='farmTractor'){if(!contains(FARM_FIELD,u.footprint))failures.push('tractor off farm');}
      else{traffic++;if(!PROTECTED_ROADS.some(r=>contains(r,u.footprint)))failures.push('vehicle off road');}
      if([...city.layout.occupied,...city.layout.scenery].some(f=>intersects(f,u.footprint)))failures.push(`${u.id} hits occupied lot`);
    }
  }await new Promise(r=>setTimeout(r,50));}
  return {ticks:rendererStats().tick-startTick,pedestrians,workers,traffic,directions:[...directions],failures};
});}
try{
 await page.goto('http://127.0.0.1:4178/play/growth-realms/');await startCity(page,'meridian');await waitMaps(page);
 const starting=await observe();assert.ok(starting.ticks>=386);assert.deepEqual(starting.failures,[]);assert.equal(starting.directions.length,4);await page.screenshot({path:out+'planning-sidewalks.png'});
 await page.goto('http://127.0.0.1:4178/play/growth-realms/tests/zoning.html');await page.waitForFunction(()=>document.body.dataset.ready==='true');
 await page.evaluate(async()=>{await (await import('./zoning-fixture.js')).show({city:'meridian',mode:'max',construction:true,progress:.4});});
 const construction=await observe();assert.ok(construction.ticks>=386);assert.deepEqual(construction.failures,[]);assert.ok(construction.workers>0);assert.equal(construction.directions.length,4);await page.screenshot({path:out+'construction-walks.png',fullPage:true});
 for(const city of ['meridian','rivermark']){const audit=await page.evaluate(async city=>(await import('./zoning-fixture.js')).show({city,mode:'max',construction:false}),city);assert.deepEqual(audit.errors,[]);await page.screenshot({path:out+`maximum-${city}.png`,fullPage:true});}
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});await page.goto('http://127.0.0.1:4178/play/growth-realms/');await startCity(page,'rivermark');await waitMaps(page);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('[data-map-district=education]').click();assert.equal(await page.locator('#selected-investment').innerText(),'1');
  if(width===390)await page.screenshot({path:out+'mobile-sidewalks.png'});
 }
 assert.deepEqual(errors,[]);await fs.writeFile(out+'audit.json',JSON.stringify({starting,construction,errors},null,2));console.log('PASS: complete pedestrian loops stay on sidewalks, construction workers stay on paved access paths, traffic stays on roads, both maximum cities and phone allocation pass.');
}finally{await browser.close();}
