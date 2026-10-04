import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startCity,fillPlan,getRun,waitMaps} from './browser-helpers.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=fileURLToPath(new URL('../../../tmp/games-preview/growth-realms/ambient-pass/',import.meta.url));
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[];
const url=process.env.GAME_URL||'http://127.0.0.1:4178/play/growth-realms/';
try{
 const p=await browser.newPage({viewport:{width:1440,height:1000},hasTouch:true});
 p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error'&&!m.location().url.endsWith('favicon.ico'))errors.push(m.text());});
 await p.goto(url);await startCity(p,'meridian');await waitMaps(p);
 await p.locator('[data-map-district=education]').click();await p.locator('#dismiss-advisor').click();await p.locator('[data-adjust=clear]').click();
 assert.doesNotMatch(await p.locator('body').innerText(),/White ring: selected district/);
 const shot=async(selector,name)=>{if(!process.env.NO_SCREENSHOTS){await p.evaluate(()=>scrollTo(0,0));const box=await p.locator(selector).boundingBox();await p.screenshot({path:out+name+'.png',fullPage:true,clip:box});}};
 async function cropUnit(id,name){
   const clip=await p.evaluate(async id=>{
     const s=(await import('./map-engine.js')).rendererStats().states[0],u=s.moving.find(u=>u.id===id),el=document.querySelector('.map-world'),r=el.getBoundingClientRect();
     const {MAP}=await import('./visual-config.js'),scale=r.width/MAP.width;
     return{x:Math.max(0,r.x+u.foot.x*scale-100),y:Math.max(0,r.y+u.foot.y*scale-100),width:200,height:150};
   },id);
   if(!process.env.NO_SCREENSHOTS)await p.screenshot({path:out+name+'.png',clip});
 }
 const observations=await p.evaluate(async()=>{
   const {rendererStats}=await import('./map-engine.js'),{contains,intersects,onSidewalk}=await import('./scene-layout.js'),{FARM_FIELD}=await import('./district-layout.js');
   const poses=new Set(),facings=new Set(),failures=[];let last=-1,count=0;const until=performance.now()+16000;
   while(count<100&&performance.now()<until){const stats=rendererStats();if(last!==stats.tick){last=stats.tick;count++;
     for(const s of stats.states){if(s.layout.errors.length)failures.push(...s.layout.errors);
       const traffic=s.moving.filter(u=>u.lane);
       for(const u of s.moving){if(u.id==='campusStudents'){poses.add(u.pose);facings.add(u.direction);if(!onSidewalk(u.footprint))failures.push('off sidewalk');}
         if(u.id==='farmTractor'&&!contains(FARM_FIELD,u.footprint))failures.push('tractor off farm');
         if([...s.layout.occupied,...s.layout.scenery].some(f=>intersects(f,u.footprint)))failures.push(u.id+' hits lot');}
       for(const a of traffic)for(const b of traffic)if(a.id<b.id&&intersects(a.footprint,b.footprint))failures.push(a.id+' overlaps '+b.id);
     }
   }await new Promise(r=>setTimeout(r,40));}
   return{count,poses:[...poses],facings:[...facings],failures};
 });
 assert.ok(observations.count>=100);assert.ok(observations.poses.length>=7);assert.deepEqual(observations.failures,[]);
 await shot('.city-map','01-farm-service-route');await cropUnit('farmTractor','01b-tractor-closeup');
 await cropUnit('campusStudents','02-walking-frame-a');
 const pose=await p.evaluate(async()=>(await import('./map-engine.js')).rendererStats().states[0].moving.find(u=>u.id==='campusStudents').pose);
 await p.waitForFunction(async pose=>(await import('./map-engine.js')).rendererStats().states[0].moving.find(u=>u.id==='campusStudents').pose!==pose,pose);
 await cropUnit('campusStudents','02b-walking-frame-b');
 await p.waitForFunction(async()=>(await import('./map-engine.js')).rendererStats().states[0].moving.some(u=>u.waiting==='following'),{timeout:30000});
 await shot('.city-map','03-following-traffic');
 await p.waitForFunction(async()=>(await import('./map-engine.js')).rendererStats().states[0].moving.some(u=>u.waiting==='intersection'));
 await shot('.city-map','04-intersection-yield');
 await p.emulateMedia({reducedMotion:'reduce'});
 const tick=await p.evaluate(async()=>(await import('./map-engine.js')).rendererStats().tick);
 await p.waitForTimeout(350);assert.equal(await p.evaluate(async()=>(await import('./map-engine.js')).rendererStats().tick),tick);
 for(let r=1;r<3;r++){await fillPlan(p,[2,3,8,7]);await p.locator('#quick-commit').click();await p.locator('#consequences').waitFor({state:'visible'});await p.locator('#quick-commit').click();}
 await waitMaps(p);let run=await getRun(p);
 assert.equal(run.currentCycle,3);assert.equal(await p.locator('.map-growth-badge').count(),2);
 assert.equal(await p.locator('#rivalry-score .race-scores').count(),0);
 for(const c of run.cities){assert.match(await p.locator(`[data-growth-city=${c.id}]`).innerText(),/Round 2/);assert.ok((await p.locator(`[data-growth-city=${c.id}] strong`).innerText()).includes(Math.abs(c.productivityGrowthRate).toFixed(1)));}
 async function mayorAudit(){
   const panel=p.locator('#advisor-panel');assert.equal(await panel.getAttribute('data-city'),(await getRun(p)).rivalCity);
   assert.notEqual(await panel.evaluate(e=>getComputedStyle(e).position),'fixed');
   assert.equal(await panel.evaluate(e=>e.closest('.isometric-map').closest('[data-city-map]').dataset.cityMap),(await getRun(p)).rivalCity);
   const before=await panel.boundingBox();await p.evaluate(()=>scrollBy(0,140));const after=await panel.boundingBox();
   assert.ok(Math.abs(before.y-after.y-140)<2,'Mayor should scroll with the map');await p.evaluate(()=>scrollBy(0,-140));
 }
 await mayorAudit();await shot('[data-owner=rival] .isometric-map','05-rival-mayor');await shot('#city-maps','06-reveal-growth');
 for(const width of [320,390,768,1440]){
   await p.setViewportSize({width,height:1000});await p.waitForTimeout(70);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const clashes=await p.locator('.map-growth-badge').evaluateAll(es=>es.flatMap(e=>{const b=e.getBoundingClientRect();return [...e.parentElement.querySelectorAll('[data-map-district]')].filter(t=>{const r=t.getBoundingClientRect();return b.left<r.right&&b.right>r.left&&b.top<r.bottom&&b.bottom>r.top;}).map(t=>t.dataset.mapDistrict);}));
   assert.deepEqual(clashes,[],`Growth badge covers a district at ${width}`);
 }
 await p.locator('#accept-challenge').click();await p.locator('#dismiss-advisor').click();
 await p.locator('#comparison>summary').click();
 assert.equal(await p.locator('.strategic-comparison dl>div').count(),6);
 assert.doesNotMatch(await p.locator('.strategic-comparison').innerText(),/Technology|Capital mature|Spare capacity/);
 assert.match(await p.locator('.strategic-gap').innerText(),/NARROWING|WIDENING|LITTLE CHANGE/);
 assert.equal(await p.locator('#detailed-comparison').evaluate(e=>e.open),false);assert.equal(await p.locator('.stock-details').evaluate(e=>e.open),false);
 await shot('#comparison','07-strategic-summary');await p.locator('#detailed-comparison>summary').click();
 assert.match(await p.locator('.comparison-grid').innerText(),/Technology index[\s\S]*last round/);
 await shot('#comparison','08-detailed-comparison');
 assert.match(await p.locator('#allocations').innerText(),/Rival plan hidden until resolution/);
 await fillPlan(p,[2,3,8,7]);await p.locator('#quick-commit').click();await p.locator('#consequences').waitFor({state:'visible'});await p.locator('#quick-commit').click();
 assert.equal((await getRun(p)).currentCycle,4);assert.equal(await p.locator('.map-growth-badge').count(),0);assert.equal(await p.locator('#rivalry-score .race-scores').count(),1);
 // Opposite player assignment must still stage the mayor inside its own scene.
 await p.goto(url);await startCity(p,'rivermark');
 for(let r=1;r<3;r++){await fillPlan(p,[5,5,5,5]);await p.locator('#quick-commit').click();await p.locator('#consequences').waitFor({state:'visible'});await p.locator('#quick-commit').click();}
 await mayorAudit();assert.deepEqual(errors,[]);
 await fs.writeFile(out+(process.env.NO_SCREENSHOTS?'staged-audit.json':'audit.json'),JSON.stringify({observations,errors,bothMayorsAnchored:true,revealBadgesRound3Only:true},null,2));
 console.log('PASS: walking frames; agricultural tractor; real traffic clearance/yield; reduced motion; both map-anchored mayors; round-specific badges; optional summary/details; rival privacy; 320–1440px.');
}finally{await browser.close();}
