import {GAME_CONFIG as G} from '../config.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {selectDistrict,startCity,fillPlan,getRun,waitMaps} from './browser-helpers.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.GAMES_PREVIEW_ORIGIN||'http://127.0.0.1:4180';
const config=JSON.parse(await fs.readFile(new URL('../../../audit_tools/econ_rpg/games-preview.json',import.meta.url)));
const hub=origin+config.previewRoot+config.hubPath;
const out=fileURLToPath(new URL('../../../tmp/games-preview/growth-realms/cue-pass/'+(origin.startsWith('https:')?'live/':'local/'),import.meta.url));await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],measurements={};
const track=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.status()+' '+r.url());});};
const marker=e=>{const s=getComputedStyle(e),m=getComputedStyle(e,'::after');return{background:s.backgroundColor,clip:s.clipPath,color:m.borderColor,fill:m.backgroundColor,radius:m.borderRadius,w:parseFloat(m.width),h:parseFloat(m.height)};};
try{
 const p=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:1});track(p);
 await p.goto(hub);await p.waitForFunction(()=>document.querySelector('#growth-realms-art')?.dataset.ready);assert.equal(await p.locator('.game-card').count(),config.gameCount);await p.screenshot({path:out+'05-beta-entry.png'});
 await p.locator('[data-game=growth-realms] a').click();assert.equal(new URL(p.url()).pathname,config.previewRoot+'games/growth-realms/');assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'noindex,nofollow');
 await startCity(p,'meridian');await waitMaps(p);
 const map=await p.locator('.city-map').boundingBox();assert.ok(map.y+map.height<=768);assert.ok(map.width>800);measurements.map=map;
 await selectDistrict(p,'resources');await p.locator('[data-map-district=capital]').hover();
 const hover=await p.locator('[data-map-district=capital]').evaluate(marker);assert.equal(hover.background,'rgba(0, 0, 0, 0)');assert.match(hover.clip,/ellipse/);assert.equal(hover.radius,'50%');assert.equal(hover.w,hover.h);assert.notEqual(hover.fill,'rgba(0, 0, 0, 0)');await p.screenshot({path:out+'01-hover.png'});
 await p.locator('[data-map-district=capital]').click();assert.equal((await getRun(p)).allocation.capital,1);assert.match(await p.locator('.map-click-feedback').innerText(),/\+1 CAPITAL/);assert.match(await p.locator('#points-remaining').innerText(),/19/);assert.equal(await p.locator('#selected-investment').innerText(),'1');assert.match(await p.locator('[data-board=rivermark] [data-plan-district=capital]').innerText(),/0 \/ 4 funded\s+Planned: \+1/);await p.screenshot({path:out+'03-plus-one.png'});
 await p.mouse.move(1300,700);await p.locator('.map-click-feedback').waitFor({state:'hidden'});const selected=await p.locator('[data-map-district=capital]').evaluate(marker);assert.equal(selected.color,'rgb(255, 255, 255)');assert.equal(selected.radius,'50%');await p.screenshot({path:out+'02-selected.png'});measurements.hover=hover;measurements.selected=selected;
 const targets=await p.locator('[data-map-district]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height};}));
 for(const a of targets){assert.ok(a.w>=150&&a.h>=100);for(const b of targets){if(a===b)continue;assert.ok(((a.x-b.x)/((a.w+b.w)/2))**2+((a.y-b.y)/((a.h+b.h)/2))**2>1,'District ellipses overlap');}}measurements.targets=targets;
 await p.screenshot({path:out+'04-clear-roads-meridian.png'});
 await p.locator('[data-adjust=clear]').click();await fillPlan(p,[5,5,5,5]);await p.locator('#quick-commit').click();await p.waitForFunction(()=>document.body.dataset.phase==='building'&&document.querySelector('#build-progress').value>5);const progress=await p.locator('#build-progress').evaluate(e=>e.value);assert.ok(progress<100);await p.screenshot({path:out+'07-commit-progress.png'});await p.locator('#consequences').waitFor({state:'visible'});assert.equal((await getRun(p)).cities[0].history.length,1);
 await p.emulateMedia({reducedMotion:'reduce'});
 for(let cycle=2;cycle<=G.totalRounds;cycle++){await p.locator('#quick-commit').click();await fillPlan(p,[5,5,5,5]);await p.locator('#quick-commit').click();await p.locator('#consequences').waitFor({state:'visible'});}
 await p.locator('[data-view=meridian]').click();await p.evaluate(()=>scrollTo(0,0));await waitMaps(p);await p.screenshot({path:out+'08-upgraded-meridian.png'});
 await p.locator('[data-view=rivermark]').click();await p.evaluate(()=>scrollTo(0,0));await waitMaps(p);await p.screenshot({path:out+'09-upgraded-rivermark.png'});
 await p.locator('#quick-commit').click();await p.locator('#final-report').waitFor({state:'visible'});await p.locator('[data-answer=potential]').click();assert.ok((await p.locator('#transfer-feedback').innerText()).length>70);
 await startCity(p,'rivermark','#replay');await waitMaps(p);await p.screenshot({path:out+'10-clear-roads-rivermark.png'});
 const back=p.getByRole('link',{name:'Return to Games',exact:true}).filter({visible:true}).first();await back.click();assert.equal(p.url(),hub);await p.close();
 for(const width of [390,320]){
  const m=await browser.newPage({viewport:{width,height:844},hasTouch:true,isMobile:true});track(m);await m.goto(hub);await m.waitForFunction(()=>document.querySelector('#growth-realms-art')?.dataset.ready);await m.locator('[data-game=growth-realms]').scrollIntoViewIfNeeded();assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);if(width===390)await m.screenshot({path:out+'06-mobile-beta-entry.png'});
  await m.locator('[data-game=growth-realms] a').tap();await startCity(m,'rivermark');await waitMaps(m);await m.locator('[data-map-district=capital]').tap();assert.equal((await getRun(m)).allocation.capital,1);assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const sizes=await m.locator('[data-map-district]').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert.ok(sizes.every(s=>s.w>=44&&s.h>=44));measurements['mobile'+width]=sizes;if(width===390)await m.screenshot({path:out+'11-mobile-game.png',fullPage:true});await m.close();
 }
 assert.deepEqual(errors,[]);await fs.writeFile(out+'audit.json',JSON.stringify({hub,measurements,errors},null,2));console.log('PASS A–I + 10A: round cues, +1/panel/budget, separated targets, larger fitting map, real commit progress, both upgraded cities, beta entry/return, phone launch/taps at 320 and 390px, ten rounds/report/replay.');
}finally{await browser.close();}
