import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startCity,fillPlan,getRun,waitMaps} from './browser-helpers.mjs';
import {GAME_CONFIG as G} from '../config.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=fileURLToPath(new URL('../../../tmp/games-preview/growth-realms/staging-pass/',import.meta.url));
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const url=process.env.GAME_URL||'http://127.0.0.1:4178/play/growth-realms/';
const errors=[],evidence={};
const forbidden=/Growth Realms|\bcomputer\b|\bCPU\b|\bAI\b|\balgorithm\b|six cycles|six rounds/i;
const track=p=>{p.on('pageerror',e=>errors.push(e.stack));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(`${r.status()} ${r.url()}`);});};
const shot=(p,name,fullPage=false)=>p.screenshot({path:out+name+'.png',fullPage});
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
async function characterBounds(p){
  const panel=p.locator('#advisor-panel'),r=await getRun(p),kind=await panel.getAttribute('data-dialogue');
  const owner=kind==='challenge'?r.rivalCity:r.playerCity;
  assert.equal(await panel.getAttribute('data-city'),owner);
  assert.equal(await panel.evaluate(e=>e.closest('[data-city-map]').dataset.cityMap),owner);
  const box=await panel.boundingBox(),host=await p.locator(`[data-city-map=${owner}]`).boundingBox();
  assert.ok(box.width<=440&&box.x>=host.x&&box.x+box.width<=host.x+host.width);
  if(p.viewportSize().width>=900&&p.viewportSize().height>650)assert.ok(box.y>=0&&box.y+box.height<=p.viewportSize().height,'desktop dialogue stays fully visible');
  assert.notEqual(await panel.locator('.dialogue-copy').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
  const figure=await panel.locator('.character-portrait').boundingBox();assert.ok(figure.width>=76&&figure.height>=144);
  const targets=await p.locator('[data-map-district]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}));
  for(const t of targets)assert.ok(!(box.x<t.x+t.width&&box.x+box.width>t.x&&box.y<t.y+t.height&&box.y+box.height>t.y),'character must not cover district target');
}
async function noRival(p){
  const r=await getRun(p);assert.ok(r.currentCycle<G.rivalRevealRound);
  assert.equal(await p.locator('[data-city-map]').count(),1);
  assert.equal(await p.locator(`[data-city-map=${r.rivalCity}]`).count(),0);
  assert.equal(await p.locator('#city-tabs button').count(),0);
  assert.equal(await p.locator('#comparison-body').innerHTML(),'');
  assert.equal(await p.locator('#allocations').innerHTML(),'');
  assert.equal(await p.locator('#rivalry-score').innerHTML(),'');
  assert.equal(await p.locator(`[data-cycle-report=${r.rivalCity}]`).count(),0);
  assert.doesNotMatch(await p.locator('body').innerText(),new RegExp(r.cities.find(c=>c.id===r.rivalCity).name));
  const states=await p.evaluate(async()=>(await import('./map-engine.js')).rendererStats().states.map(s=>s.city));
  assert.deepEqual(states,[r.playerCity]);
}
try{
  const p=await browser.newPage({viewport:{width:1366,height:768}});track(p);
  await p.goto(url);await p.waitForFunction(()=>document.querySelector('#hero-scene').dataset.ready);
  assert.equal(await getRun(p),null);assert.equal(await p.locator('[data-city-map]').count(),0);
  assert.equal((await p.locator('#title-screen').innerText()).replace(/\s+/g,' ').trim(),'RIVAL CITIES MASTERY QUESTS Start Game');
  assert.equal(await p.locator('#city-choice').count(),0);assert.equal(await p.locator('#open-how').count(),0);
  const splash=await p.locator('#title-screen').boundingBox(),start=await p.locator('#start-game').boundingBox();
  assert.equal(splash.height,768);assert.ok(start.y>768*.75);await shot(p,'01-splash');
  await startCity(p,'rivermark');await noRival(p);
  assert.match(await p.locator('#advisor-panel').innerText(),/Welcome to Rivermark\./);
  assert.match(await p.locator('#advisor-panel').innerText(),/Industry adds equipment/);assert.match(await p.locator('#advisor-panel').innerText(),/20 points/);assert.equal(await p.locator('#dismiss-advisor').count(),0);
  assert.equal(await p.locator('#compact-cycle').innerText(),'Round 1 / 10');assert.equal(await p.locator('#hud').isVisible(),false);
  const map=await p.locator('.city-map').boundingBox();assert.ok(map.y+map.height<=768);await characterBounds(p,'left');assert.equal(await p.locator('.tutorial-target').count(),1);assert.equal(await p.locator('.onboarding-marker,.district-choice').count(),0);await shot(p,'02-round-one-guide');await p.locator('[data-map-district=capital]').screenshot({path:out+'02b-highlighted-district.png'});
  await p.locator('#quick-guide').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#help').isVisible(),true);assert.equal(await p.locator('#field-guide').evaluate(e=>e.open),false);
  assert.match(await p.locator('#help-goal').innerText(),/percentage growth in output per worker/);await p.locator('#field-guide summary').click();assert.match(await p.locator('#help-categories').innerText(),/workforce skills/i);await p.keyboard.press('Escape');assert.equal(await p.locator(':focus').getAttribute('id'),'quick-guide');
  await p.locator('[data-map-district=capital]').click();assert.equal((await getRun(p)).allocation.capital,1);assert.match(await p.locator('#points-remaining').innerText(),/19/);assert.equal(await p.locator('.map-click-feedback').innerText(),'+1 CAPITAL');
  assert.match(await p.locator('#advisor-panel').innerText(),/Good\. Your first investment is planned\.[\s\S]*Spend the rest, then commit your plan/);assert.equal(await p.locator('.tutorial-target').count(),0);await shot(p,'03-first-click');
  await p.locator('[data-adjust=clear]').click();await p.locator('[data-map-district=education]').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#advisor-panel').isVisible(),false);await p.locator('[data-adjust=clear]').click();
  for(let round=1;round<=G.totalRounds;round++){
    if(round>1){await p.locator('#quick-commit').click();await waitMaps(p);}
    let r=await getRun(p);assert.equal(r.currentCycle,round);assert.equal(r.phase,'planning');
    assert.equal(await p.locator('#compact-cycle').innerText(),`Round ${round} / ${G.totalRounds}`);
    if(round===2){await noRival(p);assert.equal(await p.locator('#advisor-panel').isVisible(),false);assert.ok(r.cities.every(c=>c.history.length===1));await shot(p,'04-round-two');}
    if(round===G.rivalRevealRound){
      assert.ok(r.cities.every(c=>c.history.length===G.rivalRevealRound-1));assert.equal(await p.locator('[data-city-map]').count(),2);assert.equal(await p.locator('#city-tabs button').count(),3);
      assert.match(await p.locator('#advisor-panel').innerText(),/MAYOR OF MERIDIAN[\s\S]*We’ve been building too/i);assert.match(await p.locator('#rivalry-score').innerText(),/Outgrow Meridian/);await characterBounds(p,'right');assert.ok((await p.locator('.city-map').first().boundingBox()).width>650);await shot(p,'05-round-three-reveal');
      const plan=structuredClone(r.allocation);await p.locator('[data-city=meridian][data-map-district=capital]').click();assert.deepEqual((await getRun(p)).allocation,plan);
      await p.locator('#accept-challenge').click();assert.equal(await p.locator('#advisor-panel').getAttribute('data-dialogue'),'challenge-reply');await characterBounds(p);await shot(p,'05b-advisor-response');assert.equal(await p.locator('[data-city-map]').count(),1);await p.locator('#dismiss-advisor').click();assert.equal(await p.locator('#advisor-panel').isVisible(),false);
    }
    await fillPlan(p,round<4?[9,3,4,4]:[3,3,7,7]);assert.equal(await p.locator('#quick-commit').isEnabled(),true);assert.match(await p.locator('#quick-commit').getAttribute('class'),/commit-ready/);
    assert.equal((await getRun(p)).cities[0].history.length,round-1);
    await p.locator('#quick-commit').click();
    if(round===1){await p.waitForFunction(()=>document.body.dataset.phase==='building'&&document.querySelector('#build-progress').value>0);await waitMaps(p);await noRival(p);assert.equal(await p.locator('[data-map-district]:disabled').count(),4);evidence.firstProgress=await p.locator('#build-progress').evaluate(e=>e.value);}
    await p.locator('#consequences').waitFor({state:'visible'});await waitMaps(p);r=await getRun(p);
    assert.ok(r.cities.every(c=>c.history.length===round));
    if(round===1){assert.equal(await p.locator('#advisor-panel').getAttribute('data-dialogue'),'round-one-coach');assert.match(await p.locator('#advisor-panel').innerText(),/new equipment/);await p.evaluate(()=>scrollTo(0,0));await characterBounds(p);await shot(p,'03b-round-one-coaching');await p.locator('#dismiss-advisor').click();assert.equal(await p.locator('#advisor-panel').isVisible(),false);}
    if(round<G.rivalRevealRound)await noRival(p);
    else {
      assert.equal(await p.locator('[data-cycle-report]').count(),2);
      const race=await p.evaluate(async()=>{const r=(await import('./game.js')).exportRun();return(await import('./rivalry.js')).raceResult(r);});
      assert.deepEqual(await p.locator('#rivalry-score .race-scores strong').allTextContents(),[race.player,race.rival].map(c=>`${c.score>=0?'+':'−'}${Math.abs(c.score).toFixed(1)}%`));
    }
    if(round===5){await p.evaluate(()=>scrollTo(0,0));await shot(p,'06-later-rivalry');}
    assert.doesNotMatch(await p.locator('body').innerText(),forbidden);assert.equal(await overflow(p),false);
    if(round===1)await p.emulateMedia({reducedMotion:'reduce'});
  }
  await p.locator('#quick-commit').click();await p.locator('#final-report').waitFor({state:'visible'});
  const r=await getRun(p);assert.equal(r.phase,'finished');assert.ok(r.cities.every(c=>c.history.length===G.totalRounds));assert.equal(await p.locator('.ledger tbody tr').count(),G.totalRounds*2);
  const expected=await p.evaluate(async()=>{const r=(await import('./game.js')).exportRun();return{race:(await import('./rivalry.js')).raceResult(r),gap:(await import('./model.js')).gapReport(r.initialCities,r.cities)};});
  assert.equal(await p.locator('#race-result-title').innerText(),expected.race.headline);assert.equal(await p.locator('#gap-result').textContent(),expected.gap.label);
  assert.ok((await p.locator('.race-result').boundingBox()).y<(await p.locator('.report-heading').boundingBox()).y);
  const report=await p.locator('#final-report').innerText();for(const term of ['productivity','diminishing returns','catch-up','human capital','technology','growth policy'])assert.ok(report.toLowerCase().includes(term));
  const chart=await p.locator('.chart-panel polyline').evaluateAll(es=>es.map(e=>e.getAttribute('points').split(' ').map(s=>s.split(',').map(Number))));assert.ok(chart.every(points=>points.length===G.totalRounds+1&&points.at(-1)[0]===630));
  await p.locator('[data-answer=potential]').click();assert.ok((await p.locator('#transfer-feedback').innerText()).length>70);await p.evaluate(()=>document.querySelector('#final-report').scrollIntoView());await shot(p,'07-final-result',false);await shot(p,'08-final-debrief',true);
  evidence.run=r;evidence.result=expected;
  await p.setViewportSize({width:390,height:844});await startCity(p,'meridian','#replay');assert.equal((await getRun(p)).playerCity,'meridian');assert.notEqual((await getRun(p)).rivalDoctrine,r.rivalDoctrine);await noRival(p);
  assert.deepEqual((await getRun(p)).cities.map(c=>c.history.length),[0,0]);assert.equal(await p.locator('#build-progress').evaluate(e=>e.value),0);
  assert.equal(await p.locator('#dismiss-advisor').count(),0);assert.equal(await p.locator('.tutorial-target').getAttribute('data-map-district'),'education');assert.match(await p.locator('#advisor-panel').innerText(),/industry is already strong/);
  for(let round=1;round<=G.totalRounds;round++){
    if(round===3){await p.setViewportSize({width:1366,height:768});await p.waitForFunction(()=>document.querySelector('#advisor-panel').getBoundingClientRect().left>innerWidth/2);await p.evaluate(()=>scrollTo(0,0));await characterBounds(p);assert.match(await p.locator('#advisor-panel').innerText(),/MAYOR OF RIVERMARK/);await shot(p,'12-rivermark-mayor');await p.locator('#accept-challenge').click();await characterBounds(p);assert.equal(await p.locator('#advisor-panel').getAttribute('data-dialogue'),'challenge-reply');}
    await fillPlan(p,[2,3,8,7]);await p.locator('#quick-commit').click();await p.locator('#consequences').waitFor({state:'visible'});await waitMaps(p);
    if(round<G.rivalRevealRound)await noRival(p);assert.equal(await overflow(p),false);await p.locator('#quick-commit').click();
  }
  assert.match(await p.locator('#final-report').innerText(),/You managed Meridian/);
  for(const width of [320,390,768,1440]){await p.setViewportSize({width,height:900});assert.equal(await overflow(p),false);}
  for(const width of [320,390,768]){
    const mobile=await browser.newPage({viewport:{width,height:844},hasTouch:true,isMobile:width<700});track(mobile);await mobile.goto(url);await mobile.waitForFunction(()=>document.querySelector('#hero-scene').dataset.ready);assert.equal(await overflow(mobile),false);
    if(width===390)await shot(mobile,'09-phone-splash');await startCity(mobile,'rivermark');await noRival(mobile);assert.equal(await mobile.locator('#quick-guide').isVisible(),true);
    const targets=await mobile.locator('[data-map-district]').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert.ok(targets.every(t=>t.w>=44&&t.h>=44));
    await characterBounds(mobile,'left');if(width===390)await shot(mobile,'10-phone-guide');await mobile.locator('[data-map-district=capital]').tap();assert.equal((await getRun(mobile)).allocation.capital,1);await mobile.locator('[data-adjust=clear]').click();await mobile.emulateMedia({reducedMotion:'reduce'});
    for(let n=1;n<G.rivalRevealRound;n++){await fillPlan(mobile,[5,5,5,5]);await mobile.locator('#quick-commit').tap();await mobile.locator('#consequences').waitFor({state:'visible'});await mobile.locator('#quick-commit').tap();}
    assert.equal(await mobile.locator('#advisor-panel.rival-reveal').isVisible(),true);assert.equal(await overflow(mobile),false);await mobile.evaluate(()=>scrollTo(0,0));await characterBounds(mobile,'right');if(width===390)await shot(mobile,'11-phone-reveal');await mobile.close();
  }
  const short=await browser.newPage({viewport:{width:1024,height:600}});track(short);await short.goto(url);await startCity(short,'meridian');await characterBounds(short,'left');assert.equal(await overflow(short),false);assert.equal(await short.locator('#dismiss-advisor').count(),0);await short.locator('.tutorial-target').click();await short.locator('#dismiss-advisor').click();assert.equal(await short.locator('.tutorial-target').count(),0);await short.close();
  assert.deepEqual(errors,[]);await fs.writeFile(out+'audit.json',JSON.stringify({...evidence,errors},null,2));
  console.log('PASS A–I: full splash; assigned starts in both cities; advisor and +1; no rival DOM/maps/metrics in rounds 1–2; background development; Round 3 reveal; both ten-round runs; real productivity race result; complete debrief/chart/ledger; help/focus/replay; 320–1440px and touch/reduced motion.');
}finally{await browser.close();}
