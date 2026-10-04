import assert from 'node:assert/strict';
import {startCity,fillPlan,getRun,waitMaps,keys,selectDistrict} from './browser-helpers.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const url=process.env.GAME_URL||'http://127.0.0.1:4178/play/growth-realms/',errors=[];
const track=p=>p.on('pageerror',e=>errors.push(e.stack));
async function localAudit(p){
 const box=await p.locator('.district-local').boundingBox(),map=await p.locator('[data-owner=player] .isometric-map').boundingBox();
 assert.ok(box.x>=map.x&&box.x+box.width<=map.x+map.width&&box.y>=map.y&&box.y+box.height<=map.y+map.height);
 const targets=await p.locator('[data-map-district]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}));
 for(const t of targets)assert.ok(!(box.x<t.x+t.w&&box.x+box.width>t.x&&box.y<t.y+t.h&&box.y+box.height>t.y),'local controls cover a district');
 assert.ok(await p.locator('.district-local button').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().width>=44&&e.getBoundingClientRect().height>=44)));
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
}
try{
 const p=await browser.newPage({viewport:{width:1366,height:768}});track(p);await p.goto(url);await startCity(p,'rivermark');
 assert.equal(await p.locator('#district-select').count(),0);assert.equal(await p.locator('[data-board=rivermark] .district-status').count(),4);
 const stocks=run=>run.cities.map(({developmentPoints,...city})=>city);const before=stocks(await getRun(p));
 for(const key of keys){await p.locator(`[data-map-district=${key}]`).click();await localAudit(p);assert.equal((await getRun(p)).allocation[key],1);assert.match(await p.locator(`[data-plan-district=${key}] .board-planned`).innerText(),/Planned: \+1/);}
 assert.deepEqual(stocks(await getRun(p)),before,'planning never constructs early');
 await p.locator('[data-adjust="-1"]').click();assert.equal((await getRun(p)).allocation.education,0);
 await p.locator('[data-adjust="5"]').click();assert.equal((await getRun(p)).allocation.education,5);
 await p.locator('[data-adjust=clear]').click();assert.equal((await getRun(p)).allocation.education,0);
 await selectDistrict(p,'capital');for(let i=0;i<4;i++)await p.locator('[data-adjust="5"]').click();
 assert.equal((await getRun(p)).allocation.capital,18);assert.equal(await p.locator('#quick-commit').isEnabled(),true);
 assert.equal(await p.locator('[data-adjust="5"]').isDisabled(),true);await p.locator('[data-adjust="-1"]').click();assert.equal(await p.locator('#quick-commit').isEnabled(),false);
 for(const key of keys){await selectDistrict(p,key);if((await getRun(p)).allocation[key])await p.locator('[data-adjust=clear]').click();}
 await p.locator('[data-plan-district=research]').focus();await p.keyboard.press('Enter');assert.equal((await getRun(p)).allocation.research,0);
 await p.locator('[data-adjust="5"]').focus();await p.keyboard.press('Space');assert.equal((await getRun(p)).allocation.research,5);await p.locator('[data-adjust=clear]').click();
 for(const key of keys){await p.locator(`[data-map-district=${key}]`).focus();await p.keyboard.press('Enter');assert.equal((await getRun(p)).allocation[key],1);}
 for(const key of keys){await selectDistrict(p,key);await p.locator('[data-adjust=clear]').click();}
 await p.emulateMedia({reducedMotion:'reduce'});
 for(let n=0;n<2;n++){await fillPlan(p,[5,5,5,5]);await p.locator('#quick-commit').click();await p.locator('#consequences').waitFor({state:'visible'});await p.locator('#quick-commit').click();}
 assert.equal(await p.locator('[data-board=meridian] .district-status').count(),4);assert.match(await p.locator('[data-board=meridian]').innerText(),/Plan hidden/);
 const plan=(await getRun(p)).allocation;await p.locator('[data-city=meridian][data-map-district=capital]').click();assert.deepEqual((await getRun(p)).allocation,plan);
 await p.locator('#accept-challenge').click();await p.locator('#dismiss-advisor').click();await localAudit(p);
 await p.locator('#comparison>summary').click();assert.equal(await p.locator('.strategic-comparison dl>div').count(),6);await p.locator('#detailed-comparison>summary').click();assert.equal(await p.locator('#detailed-comparison .comparison-grid dl>div').count(),20);
 for(const width of [320,390,768,1440]){
  const touch=await browser.newPage({viewport:{width,height:900},hasTouch:true,isMobile:width<700});track(touch);await touch.goto(url);await startCity(touch,'rivermark');await waitMaps(touch);
  for(const key of keys){await touch.locator(`[data-map-district=${key}]`).tap();await localAudit(touch);assert.equal((await getRun(touch)).allocation[key],1);}
  await touch.locator('[data-adjust="5"]').tap();assert.equal((await getRun(touch)).allocation.education,6);await touch.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: local actions, all-district status, target clearance, 44px controls, +1/+5/undo/Clear/clamping, commit gating, keyboard, touch 320–1440px, rival plan privacy and detailed comparison.');
}finally{await browser.close();}
