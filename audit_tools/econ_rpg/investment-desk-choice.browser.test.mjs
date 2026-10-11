import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {previewServer} from './serve.mjs';
import {Game} from './game/games/the-investment-desk/engine.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='tmp/econ-rpg/investment-desk/choice-refinement/';await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,errors=[];let browser;
try{
  browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1366,height:900}});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const action=(a,id)=>page.locator(`[data-action="${a}"]${id?`[data-id="${id}"]`:''}`).first().click();
  const noCounts=async()=>assert.doesNotMatch(await page.locator('#game').innerText(),/\bQuest (?:0?[12]|One|Two)\b|(?:First|Second) Quest|Window \d|Decision window/i);
  const shot=async name=>{await page.locator('.art img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:out+name+'.png',fullPage:true});};
  const start=async()=>{await page.goto(origin+'/games/the-investment-desk/?seed=42');await action('start');};
  const commit=async()=>{await action('confirm-first');await action('commit-first');};
  await start();await noCounts();assert.equal(await page.getByText('How does NPV work?',{exact:true}).count(),0);await shot('allocation-desk');
  const fixture=new Game(42),chosen=fixture.first.projects.slice(0,1);
  for(const p of chosen){await action('inspect',p.id);await action('toggle',p.id);}await commit();await noCounts();
  await page.getByText('How does NPV work?',{exact:true}).click();
  assert.match(await page.locator('.worked-npv').innerText(),new RegExp(chosen[0].name));
  assert.equal(await page.locator('.npv-table tbody tr').count(),chosen[0].flows.length);
  const firstCash=chosen[0].flows[0].toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});assert.ok((await page.locator('.npv-table').innerText()).includes(firstCash));await shot('chosen-npv-example');
  await action('unlock');await noCounts();assert.equal(await page.getByText('How does NPV work?',{exact:true}).count(),0);
  for(const id of ['medical','development']){await action('inspect',id);await action('reject',id);}
  await action('inspect','packing');assert.equal(await page.locator('dialog .optional-research[open]').count(),0);assert.equal(await page.locator('[data-action="invest"]').isEnabled(),true);await action('invest','packing');
  assert.match(await page.locator('.portfolio').innerText(),/1 funded proposal/);await shot('one-project-no-research');
  await action('confirm-finish');assert.match(await page.locator('dialog').innerText(),/Regional distribution, Renewable energy/);await action('close');assert.equal(await page.locator('.card').count(),5);
  await action('confirm-finish');await action('finish');await noCounts();await action('next');await noCounts();
  assert.equal(await page.locator('.outcome-tile').count(),1);assert.match(await page.locator('.final-report>header').innerText(),/1 project funded · 0 research reports/);
  assert.equal(await page.locator('.report-explanations details[open]').count(),0);assert.ok((await page.locator('.final-report').innerText()).split(/\s+/).length<250,'default results should be concise');await shot('visual-results');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mq.investment-desk.runs.v1'))[0]);assert.ok(!saved.events.some(e=>['research_purchased','market_bulletin'].includes(e.action)));
  await page.getByText('How does NPV work?',{exact:true}).click();assert.match(await page.locator('.worked-npv').innerText(),/Fresh-food packing/);await shot('realized-npv-example');
  await page.setViewportSize({width:320,height:844});await shot('results-mobile');
  await start();await commit();await page.getByText('How does NPV work?',{exact:true}).click();assert.match(await page.locator('.worked-npv').innerText(),/Project NPV = \$0/);await action('unlock');await action('confirm-finish');await action('finish');assert.match(await page.locator('.final-report').innerText(),/0 projects funded/);
  await page.setViewportSize({width:1366,height:900});await start();await commit();await action('unlock');await action('inspect','packing');await action('wait','packing');await action('advance');assert.match(await page.locator('dialog').innerText(),/Your paid holds stay open/);await action('close');assert.match(await page.locator('.bulletin').innerText(),/Opening outlook/);await action('advance');await action('proceed-advance');await noCounts();assert.equal(await page.locator('.rejected').count(),4);await shot('bulletin-no-counts');await action('inspect','packing');await action('invest','packing');await action('confirm-finish');await action('finish');await action('next');assert.match(await page.locator('.capital-key').innerText(),/\$2,000/);
  assert.deepEqual(errors,[]);console.log('PASS: one/zero investments without research; finish and bulletin cancellation; passed-open proposals; chosen and realized NPV calculations; concise visual results; mobile; no quest/window counts or desk help.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
