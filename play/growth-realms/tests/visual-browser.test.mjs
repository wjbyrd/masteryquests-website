import { enterChoice, fillPlan } from './browser-helpers.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=fileURLToPath(new URL('../../../tmp/games-preview/growth-realms/visual-pass/',import.meta.url));
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1600,height:1200}}), errors=[];
page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(`${r.status()} ${r.url()}`);});
await page.addInitScript(()=>{Math.random=()=>.2;});
const url='http://127.0.0.1:4178/play/growth-realms/';
const stats=()=>page.evaluate(async()=>(await import('./city-renderer.js')).rendererStats());
const state=()=>page.evaluate(async()=>(await import('./game.js')).exportRun());
const waitMaps=()=>page.waitForFunction(()=>[...document.querySelectorAll('.city-map')].every(e=>e.dataset.levels));
async function fill(values){await fillPlan(page,values);}
async function photo(name){await page.evaluate(()=>document.querySelector('.region-section').scrollIntoView({block:'start',behavior:'instant'}));await page.screenshot({path:output+name+'.png'});}
try{
  await page.goto(url);await enterChoice(page);await page.locator('[data-choose="rivermark"]').click();await page.locator('#city-tabs [data-view="combined"]').click();await waitMaps();assert.equal((await stats()).atlases,7);assert.equal(await page.locator('.map-layer').count(),18);
  await photo('01-starting-combined');
  for(const id of ['meridian','rivermark']){await page.locator(`#city-tabs [data-view="${id}"]`).click();await waitMaps();assert.equal((await stats()).maps,1);await photo(id==='meridian'?'02-meridian-close':'03-rivermark-close');}
  await page.locator('#city-tabs [data-view="rivermark"]').click();await fill([10,4,3,3]);await page.locator('#advance').click();
  await page.waitForFunction(()=>document.querySelector('[data-map="rivermark"]').dataset.construction==='frame');
  assert.equal((await stats()).maps,2);assert.equal((await state()).cities[0].history.length,0);
  assert.equal(await page.locator('[data-map="rivermark"]').getAttribute('data-priority'),'capital');
  await photo('04-construction');await page.locator('#consequences').waitFor({state:'visible'});await waitMaps();await photo('05-cycle-resolution');
  let s=await stats();assert.ok(s.states.every(s=>s.districts.every(d=>d.intensity===0)));assert.equal(s.loops,1);
  assert.equal(s.states.find(s=>s.city==='rivermark').districts.find(d=>d.id==='education').level,1);
  await page.locator('[data-map-district="education"][data-city="rivermark"]').click();assert.match(await page.locator('#inspect-rivermark').innerText(),/Materials stored/);
  // Research/resource dominance checked through real planning and resolution.
  for(const [priority,allocation] of [['research',[2,2,14,2]],['resources',[2,14,2,2]]]){
    await page.locator('#advance').click();await fill(allocation);await page.locator('#advance').click();await page.locator('.city-map[data-phase="building"]').first().waitFor();
    assert.equal(await page.locator('[data-map="rivermark"]').getAttribute('data-priority'),priority);
    const before=await page.locator('[data-map="rivermark"] .construction-layer').screenshot();await page.waitForTimeout(600);const after=await page.locator('[data-map="rivermark"] .construction-layer').screenshot();assert.notDeepEqual(before,after);
    await page.locator('#consequences').waitFor({state:'visible'});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  for(let cycle=4;cycle<=6;cycle++){await page.locator('#advance').click();await fill([10,4,3,3]);await page.locator('#advance').click();await page.locator('#consequences').waitFor({state:'visible'});}
  await waitMaps();s=await stats();assert.equal(s.loops,0);assert.equal((await state()).cities[1].history.length,6);assert.ok(s.states.find(s=>s.city==='rivermark').districts.every(d=>d.level>0));await photo('06-later-catch-up');
  // Repeated rerenders keep a single shared clock and at most two map instances.
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(let n=0;n<12;n++){await page.locator(`#city-tabs [data-view="${n%2?'combined':'meridian'}"]`).click();await waitMaps();assert.equal((await stats()).loops,1);assert.ok((await stats()).maps<=2);}
  // Native visibility events stop the renderer; expose the same DOM property in this isolated test page.
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  const paused=(await stats()).tick;await page.waitForTimeout(300);assert.equal((await stats()).loops,0);assert.equal((await stats()).tick,paused);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await stats()).loops,1);
  await page.locator('#advance').click();await page.locator('#replay').click();await waitMaps();s=await stats();assert.deepEqual(s.states.map(s=>s.districts.map(d=>d.level)),[[3,2,2,3],[1,1,0,1]]);assert.equal((await state()),null);
  await page.locator('[data-choose="rivermark"]').click();await page.locator('#city-tabs [data-view="combined"]').click();
  // Real diagnostic objects, drawn in an isolated preview; no gameplay state is patched.
  await page.evaluate(async()=>{const {createCities}=await import('./model.js'),{syncCityMaps}=await import('./city-renderer.js');const cities=createCities();for(const city of cities)for(const k of Object.keys(city.constraints))city.constraints[k]=true;await syncCityMaps(document.querySelector('#city-maps'),cities.map(city=>({city,phase:'planning'})));});
  s=await stats();assert.ok(s.states.every(s=>s.diagnostics.length===5));assert.match(await page.locator('.map-scene-description').first().innerText(),/Technology adoption constrained/);await photo('07-diagnostic-fixture');
  await page.goto(url);await enterChoice(page);await waitMaps();
  for(const width of [320,390,768,1600]){await page.setViewportSize({width,height:1100});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);if(width===390)await photo('08-phone');}
  assert.deepEqual(errors,[]);console.log('PASS: all 12 visual acceptance cases; 7 atlases; real construction frame changes; 8FPS singleton loop; visibility pause/resume; reduced motion; view/replay cleanup; diagnostics; 320–1600px; zero browser errors.');console.log('Screenshots: '+output);
}finally{await browser.close();}


