import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {previewServer} from './serve.mjs';
import {Game} from './game/games/the-investment-desk/engine.js';
import {projectValue} from './game/games/the-investment-desk/first-scenario.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='tmp/econ-rpg/investment-desk/refinement/';await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,errors=[],checks=[];
const money=v=>`${v<0?'−':''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;
let browser;
try{
  browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const action=(a,id)=>page.locator(`[data-action="${a}"]${id?`[data-id="${id}"]`:''}`).first().click();
  const start=async(seed=42)=>{await page.goto(origin+`/games/the-investment-desk/?seed=${seed}`);await action('start');};
  const commit=async()=>{await action('confirm-first');await action('commit-first');};
  const visibleWithin=async(selector)=>{for(const el of await page.locator(selector).all()){const b=await el.boundingBox();assert.ok(b&&b.y>=0&&b.y+b.height<=page.viewportSize().height+.5,`${selector} out of viewport: ${JSON.stringify(b)}`);}};
  const screenshot=async(name,fullPage=false)=>{await page.locator('.art img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name} horizontal overflow`);await page.screenshot({path:out+name+'.png',fullPage});checks.push(name);};
  for(const viewport of [{width:1366,height:768},{width:1440,height:900}]){
    await page.setViewportSize(viewport);await page.goto(origin+'/games/the-investment-desk/?seed=42');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight),false,'opening must fit vertically');assert.doesNotMatch(await page.locator('body').innerText(),/MINI-GAME 16|10–15 minutes|01 · Allocate|Your firm/);assert.equal(await page.locator('.splash-art img').count(),1);await visibleWithin('[data-action="start"]');await screenshot(`opening-${viewport.width}`);
    await action('start');assert.equal(await page.locator('.first-card').count(),6);assert.equal(await page.locator('.first-card:visible').count(),6);await visibleWithin('.first-card');await visibleWithin('[data-action="confirm-first"]');assert.equal(await page.evaluate(()=>scrollY),0);await screenshot(`desk-${viewport.width}`);
  }
  await page.setViewportSize({width:1366,height:768});const fixture=new Game(42);await start();
  for(const p of fixture.first.projects){
    await action('inspect',p.id);assert.equal(await page.locator('dialog .facts>div').nth(0).locator('strong').innerText(),money(p.cost));assert.equal(await page.locator('dialog .facts>div').nth(1).locator('strong').innerText(),money(projectValue(p)));await visibleWithin('dialog [data-action="toggle"]');assert.equal(await page.locator('dialog').evaluate(el=>el.scrollHeight>el.clientHeight),false,'essential modal content fits');
    assert.doesNotMatch(await page.locator('dialog').innerText(),/Fully fund this project/);assert.match(await page.locator('.modal-terms').innerText(),new RegExp(`${p.duration}-year project · ${Math.round(p.rate*100)}%`));
    await page.getByText('Cash flows, timing & assumptions',{exact:true}).click();assert.deepEqual(await page.locator('dialog .financial-list strong').allTextContents(),p.flows.map(money));await page.keyboard.press('Escape');
  }
  await action('inspect',fixture.first.projects[0].id);await screenshot('proposal-1366');await page.keyboard.press('Escape');
  for(const id of fixture.firstResult().best.ids){await action('inspect',id);await action('toggle',id);fixture.start();fixture.toggle(id);}
  assert.equal(await page.locator('[data-total="remaining"]').innerText(),money(fixture.firstResult().remaining));assert.equal(await page.locator('[data-total="npv"]').innerText(),money(fixture.firstResult().value));await visibleWithin('[data-action="confirm-first"]');await screenshot('funded-desk-1366');
  const remove=fixture.selected[0];await action('toggle',remove);fixture.toggle(remove);await action('inspect',remove);await action('toggle',remove);fixture.toggle(remove);await commit();
  assert.match(await page.locator('.comparison-gap').innerText(),/matches the highest/);assert.equal(await page.locator('.report-explanations details[open]').count(),0);await screenshot('optimal-report-1366',true);
  await page.getByText('What was the opportunity cost?',{exact:true}).click();assert.match(await page.locator('.report-explanations details[open]').innerText(),/Unused capital is not automatically wasteful/);await action('unlock');
  assert.match(await page.locator('.budget-bar').innerText(),/\$250,000/);await action('inspect','energy');await action('invest','energy');const secondBudget=await page.locator('.budget-bar').innerText();await action('review-first');assert.equal(await page.locator('.first-report .budget-bar strong').nth(1).innerText(),money(fixture.firstResult().remaining));await action('return-second');assert.equal(await page.locator('.budget-bar').innerText(),secondBudget);assert.match(await page.locator('.portfolio').innerText(),/Renewable energy/);
  for(const seed of [0,1,5,9,17,39,80,99]){await start(seed);await visibleWithin('.first-card');await visibleWithin('[data-action="confirm-first"]');}
  // Zero and loss scenarios must retain a real zero baseline and truthful labels.
  await start(42);await commit();assert.equal(Number(await page.locator('.bar-player').getAttribute('width')),0);await screenshot('empty-report',true);
  let negativeSeed=0;while(!new Game(negativeSeed).first.projects.some(p=>projectValue(p)<0))negativeSeed++;
  const negative=new Game(negativeSeed).first.projects.find(p=>projectValue(p)<0);await start(negativeSeed);await action('inspect',negative.id);await action('toggle',negative.id);await commit();assert.equal(await page.locator('.bar-negative').count(),1);assert.match(await page.locator('.opportunity-takeaway').innerText(),/negative combined NPV/);assert.ok(Number(await page.locator('.bar-negative').getAttribute('width'))>0);await screenshot('negative-report',true);
  // Explicit new game uses a new seed; it is stable while navigating its desk.
  await action('replay');await action('start');const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mq.investment-desk.runs.v1'))[0]);assert.notEqual(saved.seed,negativeSeed);const before=await page.locator('.first-cards').innerText();await page.locator('.first-card [data-action="inspect"]').first().click();await page.keyboard.press('Escape');assert.equal(await page.locator('.first-cards').innerText(),before);
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(origin+'/games/the-investment-desk/?seed=42');await screenshot(`opening-mobile-${width}`,true);await visibleWithin('[data-action="start"]');await action('start');assert.equal(await page.locator('.first-card:visible').count(),1);await screenshot(`desk-mobile-${width}`,true);
    const ids=[];for(let i=0;i<6;i++){ids.push(await page.locator('.first-card:visible').getAttribute('data-project'));await action('next-card');}assert.equal(new Set(ids).size,6);assert.equal(await page.locator('.first-card:visible').getAttribute('data-project'),ids[0]);await action('previous-card');assert.equal(await page.locator('.first-card:visible').getAttribute('data-project'),ids[5]);
    await page.locator('.first-card:visible [data-action="inspect"]').click();await action('toggle',ids[5]);assert.equal(await page.locator('.first-card:visible.selected').count(),1);await action('toggle',ids[5]);assert.equal(await page.locator('.first-card.selected').count(),0);await commit();await screenshot(`report-mobile-${width}`,true);await action('unlock');assert.match(await page.locator('.budget-bar').innerText(),/\$250,000/);
  }
  assert.deepEqual(errors,[]);await writeFile(out+'results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
