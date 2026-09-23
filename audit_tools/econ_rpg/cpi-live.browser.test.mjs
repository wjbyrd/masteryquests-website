import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { previewServer } from './serve.mjs';
import { CONFIG } from './game/games/cpi-live/config.js';
import * as engine from './game/games/cpi-live/engine.js';
import { ACTIVE_KEY } from './game/games/cpi-live/storage.js';
import { money, indexText, rateText } from './game/games/cpi-live/view.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='tmp/econ-rpg/cpi-live-refinement';await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[],external=[],checks=[],coverage=new Set(), seeds=[];let zoomContext;
for(let seed=0;coverage.size<24&&seed<10000;seed++){
  const picks=engine.selections(seed),keys=Object.entries(picks).map(([k,v])=>`${k}:${v}`);
  if(keys.some(k=>!coverage.has(k))){seeds.push(seed);keys.forEach(k=>coverage.add(k));}
}
assert.equal(coverage.size,24);
async function reach(page,locator){
  await locator.waitFor();
  for(let n=0;n<80;n++){
    if(await locator.evaluate(e=>e===document.activeElement)){
      assert.ok(await locator.evaluate(e=>getComputedStyle(e).outlineStyle==='solid'&&parseFloat(getComputedStyle(e).outlineWidth)>=3));return;
    }
    await page.keyboard.press('Tab');
  }
  throw Error('Unreachable keyboard target: '+await locator.textContent());
}
async function press(page,selector){const loc=page.locator(selector);await reach(page,loc);await page.keyboard.press('Enter');}
async function fill(page,name,value){await reach(page,page.locator(`[name="${name}"]`));await page.keyboard.press('Control+A');await page.keyboard.type(String(value));}
async function inspect(page,label){
  const active=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),ACTIVE_KEY);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' horizontal containment');
  for(const input of await page.locator('input').all())assert.ok(await input.evaluate(e=>e.labels.length===1&&!!e.getAttribute('aria-describedby')));
  assert.ok(await page.locator('.cpi-receipt table caption').isVisible());
  assert.equal(await page.locator('.cpi-receipt tbody th[scope=row]').count(),5);
  assert.deepEqual(await page.locator('.cpi-receipt tbody th small').allTextContents(),CONFIG.baskets.find(b=>b.id===active.basketID).items.map(b=>`${b.quantity} Ã— fixed`));
  for(const button of await page.locator('button:visible,input:visible,.return-games').all())assert.ok((await button.boundingBox()).height>=44,label+' touch target');
  for(const svg of await page.locator('.cpi-chart svg').all()){assert.ok(await svg.locator('title').count());assert.ok((await svg.locator('desc').textContent()).length>60);assert.ok(await svg.evaluate(el=>[...el.querySelectorAll('text')].every(t=>{const b=t.getBBox();return b.x>=0&&b.y>=0&&b.x+b.width<=380&&b.y+b.height<=250;})),JSON.stringify(await svg.evaluate(el=>[...el.querySelectorAll('text')].map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,width:b.width,height:b.height};}))));}
  assert.equal(await page.locator('#announcement[aria-live=polite][aria-atomic=true]').count(),1);
  assert.equal(await page.locator('#receipt [aria-live]').count(),0);
}
async function play(context,seed,label,capture,wrong=true){
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  page.on('request',r=>{if(!r.url().startsWith(origin+'/'))external.push(r.url());});
  await page.addInitScript(seed=>{const original=crypto.getRandomValues.bind(crypto);Object.defineProperty(crypto,'getRandomValues',{value(array){if(array instanceof Uint32Array&&array.length===1){array[0]=seed;return array;}return original(array);}});},seed);
  await page.goto(origin+'/games/');await page.evaluate(()=>localStorage.clear());
  await page.locator('[data-game=cpi-live] h2').filter({hasText:CONFIG.title}).waitFor();
  assert.equal(await page.locator('[data-game=cpi-live] p').innerText(),CONFIG.description);
  await press(page,'[data-game=cpi-live] a');await page.waitForURL('**'+CONFIG.route);
  assert.equal(await page.title(),`${CONFIG.title} | Mastery Quests`);
  assert.equal(await page.locator('#model-note').innerText(),CONFIG.modelNote);
  await inspect(page,'intro');
  if(label==='zoom200'){assert.equal(await page.evaluate(()=>innerWidth),683);assert.equal(await page.evaluate(()=>devicePixelRatio),2);}
  if(capture)await page.screenshot({path:`${out}/${label}-intro.png`});
  assert.doesNotMatch(await page.locator('#work').innerText(),/Ã·|Current cost of the fixed basket/);
  await press(page,'[data-action=start]');let run=engine.start(engine.newRun(seed,'qa',0));
  for(const phase of engine.PHASES){
    assert.equal(run.phase,phase);await inspect(page,`${label}-${phase}`);
    const target=engine.expected(run),numeric=typeof target==='object';
    assert.equal(await page.evaluate(()=>document.activeElement.id),'stage-title');
    if(['cpi','inflation','timeline_rate'].includes(phase))assert.equal(await page.locator('.cpi-formula').count(),0);
    if(['timeline_rate','timeline_compare','deflation'].includes(phase)){assert.equal(await page.locator('[data-chart=cpi]').count(),1);assert.equal(await page.locator('[data-chart=inflation]').count(),0);}
    if(capture){await page.screenshot({path:`${out}/${label}-${phase}.png`});await page.locator('#receipt').screenshot({path:`${out}/${label}-${phase}-receipt.png`});}
    if(wrong){
      const bad=numeric?Object.fromEntries(Object.keys(target).map(k=>[k,'999'])):phase==='meaning'?'rate':phase==='weight'?(target==='a'?'b':'a'):phase==='audit'?CONFIG.audits.find(a=>a.id!==target).id:phase==='timeline_compare'?(target==='stable'?'deflation':'stable'):'below';
      if(numeric){for(const k of Object.keys(target))await fill(page,k,'999');await press(page,'button[type=submit]');}
      else await press(page,`[data-answer="${bad}"]`);
      run=engine.submit(run,bad);
      assert.match(await page.locator('#feedback').innerText(),/Try again/);assert.ok((await page.locator('#announcement').textContent()).length>30);
      assert.equal(await page.locator('[data-action=next]').count(),0);
      if(phase==='weight')assert.match(await page.locator('.comparison-grid').innerText(),/added/);
      if(phase==='base')assert.doesNotMatch(await page.locator('#work').innerText(),/Current cost of the fixed basket Ã·/);
    }
    if(capture&&['cpi','inflation','timeline_rate'].includes(phase)){
      assert.equal(await page.locator('.cpi-formula').count(),0,'wrong answers do not expose formulas');
      await fill(page,'value','123');
      await press(page,'[data-hint=concept]');run=engine.toggleHint(run);
      assert.equal(await page.locator('[data-hint=concept]').getAttribute('aria-expanded'),'true');
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.hint),'concept');
      assert.equal(await page.locator('[name=value]').inputValue(),'123');
      assert.equal(await page.locator('.cpi-formula').count(),0);
      await press(page,'[data-hint=formula]');run=engine.toggleHint(run,'formula');
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.hint),'formula');
      assert.equal(await page.locator('[name=value]').inputValue(),'123');
      assert.match(await page.locator('.cpi-formula').innerText(),/Ã·/);
      await page.locator('#work').screenshot({path:`${out}/${label}-${phase}-hints.png`});
      const beforeReload=await page.evaluate(key=>localStorage.getItem(key),ACTIVE_KEY);
      await page.reload();assert.equal(await page.evaluate(key=>localStorage.getItem(key),ACTIVE_KEY),beforeReload);
      assert.equal(await page.locator('.cpi-formula').count(),1,'requested hint survives resume');
    }
    const response=numeric?Object.fromEntries(Object.entries(target).map(([k,v])=>[k,['base','reprice'].includes(phase)?`$${v.toLocaleString('en-US',{maximumFractionDigits:2})}`:v.toFixed(2)+(phase==='cpi'?'':'%')])):target;
    if(numeric){for(const [key,value]of Object.entries(response))await fill(page,key,value);await press(page,'button[type=submit]');}
    else await press(page,`[data-answer="${target}"]`);
    run=engine.submit(run,response);assert.equal(run.solved,true);assert.match(await page.locator('#feedback').innerText(),/Verified/);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'feedback');
    assert.ok(await page.locator('#work button:not([data-action]),#work input').evaluateAll(es=>es.every(e=>e.disabled)),'resolved controls natively disabled');
    const m=engine.model(run);
    if(engine.isRepriced(run))assert.equal(await page.locator('#basket-total').innerText(),money(m.current.cost));
    if(engine.indexKnown(run))assert.equal(await page.locator('#cpi-value').innerText(),indexText(m.index));
    if(engine.rateKnown(run))assert.equal(await page.locator('#inflation-value').innerText(),rateText(m.rate));
    if(phase==='base')assert.match(await page.locator('#feedback').innerText(),/indexed to 100/);
    if(phase==='timeline_rate'){assert.equal(await page.locator('.timeline-table tbody tr').count(),3);assert.equal(await page.locator('[data-chart=inflation]').count(),0);}
    if(['timeline_compare','deflation'].includes(phase))assert.equal(await page.locator('[data-chart=inflation]').count(),1);
    if(phase==='deflation')assert.equal(await page.locator('.timeline-table tbody tr').count(),4);
    await inspect(page,`${label}-${phase}-solved`);
    if(capture)await page.locator('#work').screenshot({path:`${out}/${label}-${phase}-solved.png`});
    await press(page,'[data-action=next]');run=engine.next(run);
  }
  assert.equal(run.phase,'complete');await inspect(page,label+'-complete');
  assert.match(await page.locator('#work').innerText(),new RegExp(`${wrong?'0':'100'}%`));
  assert.match(await page.locator('#work').innerText(),/Multi-year interpretation/);
  if(capture)await page.screenshot({path:`${out}/${label}-complete.png`,fullPage:label!=='zoom200'});
  const records=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('mq.cpi-live.run.v1.')).map(k=>JSON.parse(localStorage.getItem(k))));
  const record=records.at(-1);assert.equal(record.events.filter(e=>e.action==='run_complete').length,1);
  assert.equal(record.events.filter(e=>e.action==='weight_reveal').length,1);
  assert.equal(record.events.filter(e=>e.action==='timeline_complete').length,1);
  assert.equal(record.events.filter(e=>e.action==='base_basket_attempt').length,wrong?2:1);
  assert.equal(record.events.at(-1).firstCorrect,wrong?0:10);
  const completed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),ACTIVE_KEY);
  await page.reload();assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),ACTIVE_KEY),completed);
  await press(page,'[data-action=replay]');
  const fresh=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),ACTIVE_KEY);assert.notEqual(fresh.runID,completed.runID);
  for(const key of Object.keys(engine.POOLS))assert.notEqual(fresh[key],completed[key]);
  assert.deepEqual(fresh.hints,{});assert.deepEqual(fresh.attempts,{});
  await page.reload();assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),ACTIVE_KEY),fresh);assert.equal(await page.locator('#basket-total').innerText(),'To calculate');
  assert.equal(await page.locator('#cpi-value').innerText(),'â€”');
  await press(page,'nav .return-games');await page.waitForURL('**/games/');
  checks.push({seed,label,pools:engine.selections(seed),firstCorrect:run.firstCorrect});console.log(`PASS ${label} seed ${seed}: full keyboard run, receipt, retries, replay, return`);
  await page.close();
}
try{
  for(const [i,seed]of seeds.entries()){
    const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
    await play(context,seed,'1366x768'+(i?`-pool-${i}`:''),i===0);await context.close();
  }
  for(const size of [{width:1280,height:720},{width:768,height:1024},{width:390,height:844},{width:320,height:720}]){
    const context=await browser.newContext({viewport:size,reducedMotion:'reduce'});await play(context,seeds.at(-1),`${size.width}x${size.height}`,true);await context.close();
  }
  zoomContext=await chromium.launchPersistentContext(`${out}/zoom-profile`,{channel:'chrome',headless:true,viewport:{width:1366,height:768},reducedMotion:'reduce'});
  const settings=zoomContext.pages()[0];await settings.goto('chrome://settings/appearance');await settings.evaluate(()=>new Promise(r=>chrome.settingsPrivate.setDefaultZoom(2,r)));await settings.close();
  await play(zoomContext,seeds[0],'zoom200',true);await zoomContext.close();zoomContext=null;
  const motion=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'no-preference'});await play(motion,1,'motion-perfect',false,false);await motion.close();
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log(`PASS ${checks.length} complete browser runs; every authored variant; all viewports; zero page, console or network errors`);
}finally{
  await writeFile(`${out}/results.json`,JSON.stringify({seeds,checks,errors,external},null,2));
  await zoomContext?.close();await browser.close();await new Promise(r=>server.close(r));
}
