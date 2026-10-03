import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {fillPlan,getRun,waitMaps} from './browser-helpers.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=fileURLToPath(new URL('../../../tmp/games-preview/growth-realms/presentation-pass/',import.meta.url));
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(`${r.status()} ${r.url()}`);});
await page.addInitScript(()=>{Math.random=()=>.2;});
const url='http://127.0.0.1:4178/play/growth-realms/';
const shot=(name,fullPage=true)=>page.screenshot({path:out+name+'.png',fullPage});
const overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
try{
  await page.goto(url);await waitMaps(page);
  assert.equal(await getRun(page),null);assert.equal(await page.locator('#title-screen').isVisible(),true);assert.equal(await page.locator('#city-choice').isVisible(),false);assert.equal(await page.locator('#hud').isVisible(),false);assert.equal(await page.locator('.region-section').isVisible(),false);
  assert.match(await page.locator('#title-screen').innerText(),/Start ahead\. Catch up\. Build your economy\./);
  await page.locator('#open-how').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#how-to-play').isVisible(),true);assert.match(await page.locator('#how-to-play').innerText(),/20 development points/);assert.equal(await page.locator(':focus').getAttribute('id'),'how-title');await page.keyboard.press('Escape');assert.equal(await page.locator(':focus').getAttribute('id'),'open-how');
  await page.locator('#landing-guide').click();assert.equal(await page.locator('#help').isVisible(),true);assert.equal(await page.locator(':focus').getAttribute('id'),'guide-title');await page.keyboard.press('Escape');assert.equal(await page.locator(':focus').getAttribute('id'),'landing-guide');
  const theme=await page.evaluate(()=>Object.fromEntries(['bg','surface','border','text','muted','accent','accent-soft','highlight'].map(k=>[k,getComputedStyle(document.documentElement).getPropertyValue('--mq-'+k).trim()])));assert.equal(theme.accent,'#009f9a');assert.equal(theme.text,'#253247');
  await shot('01-title');
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await overflow(),false,`Title overflow ${width}`);if(width===390)await shot('07-phone-title');}
  await page.locator('#start-game').click();assert.equal(await page.locator('#title-screen').isVisible(),false);assert.equal(await page.locator('#city-choice').isVisible(),true);assert.equal(await getRun(page),null);await shot('02-choice');
  await page.locator('#back-title').click();assert.equal(await page.locator('#start-game').isVisible(),true);await page.locator('#start-game').click();
  await page.locator('[data-choose="rivermark"]').click();await waitMaps(page);await shot('03-planning');
  assert.deepEqual(await page.locator('#city-tabs button').allTextContents(),['Combined Comparison','Meridian','Rivermark']);
  const dots=await page.locator('#budget-pips .available').first().evaluate(e=>({radius:getComputedStyle(e).borderRadius,bg:getComputedStyle(e).backgroundColor}));assert.equal(dots.radius,'50%');assert.equal(dots.bg,'rgb(255, 255, 255)');
  await page.locator('[data-map-district="capital"]').click();assert.equal((await getRun(page)).allocation.capital,1);assert.match(await page.locator('#points-remaining').innerText(),/19/);await page.locator('[data-adjust="clear"]').click();await page.locator('.map-click-feedback').waitFor({state:'hidden'});
  await page.evaluate(()=>window.scrollTo({top:400,behavior:'instant'}));await page.waitForFunction(()=>document.body.classList.contains('hud-compact'));
  const sticky=await page.locator('#planning-hud').boundingBox();assert.equal(sticky.y,0);assert.ok(sticky.height<=68);assert.ok((await page.locator('.command-header').boundingBox()).y<0);await shot('04-compact-hud',false);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await page.locator('#district-select').scrollIntoViewIfNeeded();await page.evaluate(()=>document.querySelector('.region-section').scrollIntoView({block:'start',behavior:'instant'}));assert.equal(await overflow(),false,`Planning overflow ${width}`);const box=await page.locator('#planning-hud').boundingBox();assert.ok(box.y>=0&&box.height<=70,`Sticky ${width}: ${JSON.stringify(box)}`);if(width===390)await shot('08-phone-compact',false);}
  await page.emulateMedia({reducedMotion:'reduce'});
  await fillPlan(page,[10,4,3,3]);await page.locator('#quick-commit').click();await page.locator('#consequences').waitFor({state:'visible'});await waitMaps(page);
  assert.equal(await page.locator('#planning-budget').isVisible(),false);assert.equal(await page.locator('[data-city-map]').count(),2);assert.deepEqual(await page.locator('#consequences .eyebrow').allTextContents(),['Meridian ALLOCATION','Rivermark ALLOCATION']);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await shot('05-resolution');
  for(let cycle=2;cycle<=6;cycle++){await page.locator('#advance').click();await fillPlan(page,cycle<4?[10,4,3,3]:[3,3,7,7]);await page.locator('#quick-commit').click();await page.locator('#consequences').waitFor({state:'visible'});}
  await page.locator('#advance').click();await page.locator('#final-report').waitFor({state:'visible'});
  const expected=await page.evaluate(async()=>{const r=(await import('./game.js')).exportRun();return(await import('./model.js')).gapReport(r.initialCities,r.cities);});
  assert.equal(await page.locator('#gap-result').textContent(),expected.label);assert.deepEqual(await page.locator('.gap-numbers strong').allTextContents(),[expected.start,expected.finish].map(n=>(Math.abs(n)*100).toFixed(1)+'%'));assert.equal(await page.locator('#planning-hud').isVisible(),false);
  const reportFonts=await page.evaluate(()=>Object.fromEntries(['#gap-result','.gap-numbers strong','.gap-explanation','.gap-note'].map(s=>[s,parseFloat(getComputedStyle(document.querySelector(s)).fontSize)])));assert.ok(reportFonts['#gap-result']>=40);assert.ok(reportFonts['.gap-numbers strong']>=60);assert.ok(reportFonts['.gap-explanation']>=16);assert.ok(reportFonts['.gap-note']>=15);
  assert.equal(await page.locator('.gap-method').evaluate(e=>e.open),false);await page.locator('.gap-method summary').click();assert.match(await page.locator('.gap-note').innerText(),/Relative and absolute gaps can move differently/);await page.locator('.gap-method summary').click();
  await page.evaluate(()=>document.querySelector('#final-report').scrollIntoView({block:'start',behavior:'instant'}));await shot('06-final-report',false);
  const visibleCopy=await page.locator('body').innerText();assert.doesNotMatch(visibleCopy,/Computer rival|A new regional rivalry|Your economy\. An independent rival/i);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await overflow(),false,`Report overflow ${width}`);if(width===390){await page.evaluate(()=>document.querySelector('#final-report').scrollIntoView({block:'start',behavior:'instant'}));await shot('09-phone-report',false);}}
  await page.locator('#replay').click();assert.equal(await getRun(page),null);assert.equal(await page.locator('#city-choice').isVisible(),true);
  assert.deepEqual(errors,[]);await fs.writeFile(out+'audit.json',JSON.stringify({acceptance:'A–I passed',theme,sticky,dots,reportFonts,errors},null,2));
  console.log('PASS A–I: title/choice flow, keyboard dialogs and focus, MQ theme, compact 64px HUD, white round budget dots, clean labels, six cycles, authoritative gap report, readable typography, replay and 320–1440px overflow checks.');
}finally{await browser.close();}


