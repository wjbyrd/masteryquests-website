import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { previewServer } from './serve.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out=fileURLToPath(new URL('../../tmp/econ-rpg/takeout-taco/',import.meta.url));
await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const url=origin+'/games/takeout-taco-lunch-rush/';
const results=[], errors=[], network=[];
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome',headless:true});
async function setup(viewport,blocked=false){
  const page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  page.on('request',r=>{if(!r.url().startsWith(origin+'/'))network.push(r.url());});
  if(blocked) await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Blocked');}}));
  await page.goto(url);
  return page;
}
async function action(p,name){await p.locator(`[data-action="${name}"]`).click();}
async function imageCrew(p,n){const img=p.locator('.scene img');await img.evaluate(el=>el.decode());assert.match(await img.getAttribute('src'),new RegExp(`worker-${n}\\.webp$`));assert.ok((await img.getAttribute('alt')).length>40);}
async function layout(p,label){
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,label+' horizontal overflow');
  for(const b of await p.locator('button').all()){const box=await b.boundingBox();if(box)assert.ok(box.height>=44,label+' touch target');}
  await p.screenshot({path:out+label+'.png',fullPage:true});
}
const removed=/one truck\. a hungry campus|a 2–3 minute production experiment|same truck · same grill|try different crew sizes|lunch rush in progress|lock in the crew/i;
async function clean(p) { assert.doesNotMatch(await p.locator('body').innerText(),removed); }
async function finishDebrief(p,depth,{wrong=false,prefix}={}) {
  const answers=depth>=6?[2,13,8,3,1,3]:depth>=5?[2,13,8,3,3]:[2,13,3];
  for(let i=0;i<answers.length;i++){
    await clean(p);
    assert.doesNotMatch(await p.locator('#game').innerText(),/marginal product|total product|diminishing marginal returns/i);
    assert.match(await p.locator('.debrief>.small').innerText(),new RegExp(`Question ${i+1} of ${answers.length}`));
    if(i===0){assert.equal(await p.locator('thead th').count(),2);if(prefix)await layout(p,prefix+'-turning');}
    if(await p.locator('#extra-tacos').count()){
      if(prefix)await layout(p,prefix+`-calculation-${i}`);
      await p.locator('#extra-tacos').fill('');await p.getByRole('button',{name:'CHECK CALCULATION'}).click();assert.equal(await p.locator('.question-feedback').count(),0);
      await p.locator('#extra-tacos').fill('-1');await p.getByRole('button',{name:'CHECK CALCULATION'}).click();assert.equal(await p.locator('.question-feedback').count(),0);
      await p.locator('#extra-tacos').fill(String(wrong?0:answers[i]));await p.locator('#extra-tacos').press('Enter');
    }else await p.locator(`[data-answer="${wrong?0:answers[i]}"]`).click();
    assert.equal(await p.locator('.question-feedback').count(),1);assert.equal(await p.locator('.reveal').count(),0);
    assert.match(await p.locator('.question-feedback').innerText(),wrong?/Here’s the comparison/:/Yes/);
    assert.doesNotMatch(await p.locator('#game').innerText(),/marginal product|total product/i);
    if(prefix && i===answers.length-1)await layout(p,prefix+'-feedback');
    await action(p,'continue_debrief');
  }
  await finishAnalysis(p, depth, {wrong, prefix});
}
async function finishAnalysis(p, depth, {wrong, prefix}={}) {
  assert.equal(await p.locator('[data-graph="total"] [data-workers]').count(), depth);
  assert.equal(await p.locator('[data-observed="false"]').count(),0);
  assert.equal(await p.locator('.reveal,.what-if,.final-takeaway').count(),0);
  if(prefix)await layout(p,prefix+'-total-observed');
  await p.locator(`[data-analysis-answer="${wrong?0:2}"]`).click();
  assert.equal(await p.locator('[data-graph="total"] [data-workers]').count(),6);
  assert.equal(await p.locator('[data-observed="false"]').count(),6-depth);
  assert.match(await p.locator('.question-feedback').innerText(),/curve begins to flatten/);
  if(prefix)await layout(p,prefix+'-total-revealed');
  await action(p,'continue_analysis');
  assert.deepEqual(await p.locator('[data-graph="marginal"] [data-value]').evaluateAll(es=>es.map(e=>Number(e.dataset.value))),[8,10,13,11,8,3]);
  assert.equal(await p.locator('.graph-highlight').count(),2);
  assert.match(await p.locator('.graph-key').innerText(),/Worker 3: peak 13 · Worker 4: first decline 11/);
  if(prefix)await layout(p,prefix+'-marginal');
  await p.locator(`[data-analysis-answer="${wrong?0:1}"]`).click();
  assert.match(await p.locator('.question-feedback').innerText(),/Total product can still rise while marginal product falls/);
  await action(p,'continue_analysis');
  assert.equal(await p.locator('.paired-graphs svg').count(),2);
  if(prefix)await layout(p,prefix+'-connected');
  await action(p,'continue_analysis');
  assert.equal(await p.locator('.reveal').count(),1);
  assert.equal(await p.locator('.what-if').count(),0);
  assert.deepEqual(await p.locator('.reveal tbody tr').allTextContents(),['188','21810','33113','44211','5508','6533']);
  assert.equal(await p.locator('.turning-point th').innerText(),'4');
  assert.match(await p.locator('.reveal').innerText(),/Smaller additions. Still more tacos./);
  await clean(p);if(prefix)await layout(p,prefix+'-reveal');
  const message=await p.locator('.exploration-message').innerText();
  assert.match(message,depth===4?/Two staffing levels remained untested/:depth===5?/beyond the turning point/:depth===6?/Full production record observed/:/untested levels/);
  await action(p,'continue_analysis');
  assert.equal(await p.locator('[data-allocation]').count(),3);
  assert.equal(await p.locator('img[src$="worker-7.webp"]').count(),0);
  assert.match(await p.locator('.truck-baseline').innerText(),/6 workers → 53 tacos/);
  if(prefix)await layout(p,prefix+'-two-truck-start');
  const attempts=wrong?[4,5,4,3]:prefix?.startsWith('laptop')?[5,4,3]:[3];
  for(const a of attempts){
    await p.locator(`[data-allocation="${a}"]`).click();
    assert.match(await p.locator('.allocation-totals').innerText(),new RegExp(`${a===5?58:a===4?60:62} tacos`));
    assert.equal(await p.locator('img[src$="worker-7.webp"]').count(),a===3?1:0);
    if(prefix)await layout(p,prefix+`-allocation-${a}`);
    if(a===3){await p.locator('.two-truck-payoff img').evaluate(img=>img.decode());assert.match(await p.locator('.capacity-gain').innerText(),/\+9 TACOS/);}
    else assert.equal(await p.getByRole('button',{name:'TRY ANOTHER SPLIT'}).count(),1);
    await action(p,'continue_two_truck');
  }
  assert.match(await p.locator('legend').innerText(),/same six workers produce more/);
  await p.locator(`[data-truck-answer="${wrong?0:2}"]`).click();
  assert.match(await p.locator('.question-feedback').innerText(),/amount of capital available/);
  if(prefix)await layout(p,prefix+'-capacity-feedback');
  await action(p,'continue_two_truck');
  assert.match(await p.locator('legend').innerText(),/contradict diminishing marginal returns/);
  await p.locator(`[data-truck-answer="${wrong?0:2}"]`).click();
  assert.match(await p.locator('.question-feedback').innerText(),/Adding another truck changes the fixed input/);
  await action(p,'continue_two_truck');
  assert.equal(await p.locator('.final-takeaway').count(),1);
  assert.match(await p.locator('#stage-title').innerText(),/CAPACITY MATTERS/);
  assert.match(await p.locator('.truck-comparison').innerText(),/53 tacos/);
  assert.match(await p.locator('.truck-comparison').innerText(),/62 tacos/);
  assert.match(await p.locator('.capacity-gain').innerText(),/\+9 TACOS/);
  if(prefix)await layout(p,prefix+'-final');
}
try {
  const p=await setup({width:1366,height:768});
  const reference=await browser.newPage();await reference.goto(origin);
  const tokens=await reference.evaluate(()=>{const s=getComputedStyle(document.documentElement);return ['--ink','--muted','--teal','--gold','--line','--panel'].map(k=>s.getPropertyValue(k));});
  assert.deepEqual(await p.evaluate(()=>{const s=getComputedStyle(document.documentElement);return ['--ink','--muted','--teal','--gold','--line','--panel'].map(k=>s.getPropertyValue(k));}),tokens);
  await reference.close();
  await imageCrew(p,0);await clean(p);await layout(p,'laptop-intro');
  await p.locator('[data-action="start_rush"]').focus();await p.keyboard.press('Enter');
  await imageCrew(p,0);assert.equal(await p.locator('#output').innerText(),'8 tacos');assert.equal(await p.locator('#change').innerText(),'— first window');
  assert.equal(await p.locator('[data-action="send_worker_home"]').isDisabled(),true);
  for(let i=0;i<2;i++){await action(p,'hold_crew');await imageCrew(p,0);assert.equal(await p.locator('#output').innerText(),'8 tacos');}
  await action(p,'hold_crew');await imageCrew(p,1);assert.match(await p.locator('.operational-status').innerText(),/piling up/);
  await action(p,'hold_crew');await action(p,'hold_crew');
  await action(p,'call_worker');await imageCrew(p,2);await action(p,'send_worker_home');await imageCrew(p,1);
  assert.match(await p.locator('#change').innerText(),/^−10/);
  await action(p,'call_worker');await action(p,'call_worker');
  assert.equal(await p.locator('.staffing-actions button:disabled').count(),3);assert.equal(await p.locator('.production-log tbody tr').count(),3);
  await action(p,'review_record');assert.match(await p.locator('caption').innerText(),/Kitchen reference: crews 1–4/);assert.equal(await p.locator('tbody tr').count(),4);
  await finishDebrief(p,3,{wrong:true});
  let records=await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('mq.takeout-taco.run.v1.')).map(k=>JSON.parse(localStorage[k])));
  assert.equal(records[0].events.at(-1).debriefQuestionsCorrect,0);assert.equal(records[0].events.at(-1).sixthWorkerCorrect,null);
  const firstRun=records[0].runID;
  await action(p,'replay');await imageCrew(p,0);assert.equal(await p.locator('.review,.production-log').count(),0);
  await action(p,'start_rush');assert.equal(await p.locator('.production-log tbody tr').count(),1);assert.match(await p.locator('.window-count').innerText(),/Window 1/);await imageCrew(p,0);
  await action(p,'call_worker');await action(p,'send_worker_home');await imageCrew(p,0);
  for(let n=2;n<=6;n++){
    await action(p,'call_worker');await imageCrew(p,n);
    assert.equal(await p.locator('#output').innerText(),[null,null,'18 tacos','31 tacos','42 tacos','50 tacos','53 tacos'][n]);
    assert.equal(await p.locator('[data-action="review_record"]').count(),n>=4?1:0);
    if(n===6)assert.match(await p.locator('.operational-status').innerText(),/fighting for the same space and equipment/);
  }
  assert.equal(await p.locator('[data-action="call_worker"]').isDisabled(),true);
  await action(p,'hold_crew');await imageCrew(p,6);assert.match(await p.locator('#change').innerText(),/^0/);
  await action(p,'send_worker_home');await imageCrew(p,5);assert.match(await p.locator('#change').innerText(),/^−3/);
  assert.equal(await p.locator('.production-log tbody tr').count(),6);await layout(p,'laptop-active-six-tested');
  await action(p,'review_record');await finishDebrief(p,6,{prefix:'laptop-full'});
  records=await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('mq.takeout-taco.run.v1.')).map(k=>JSON.parse(localStorage[k])));
  const record=records.find(r=>r.runID!==firstRun), last=record.events.at(-1);
  assert.equal(records.length,2);assert.equal(record.schemaVersion,4);assert.equal(record.events.length,28);
  assert.equal(last.action,'game_complete');assert.equal(last.completed,true);assert.equal(last.debriefQuestionsAnswered,6);assert.equal(last.debriefQuestionsCorrect,6);assert.equal(last.maximumCrewObserved,6);assert.equal(last.finalCrew,5);
  for(const field of ['turningPointCorrect','marginalCalculationCorrect','totalVsMarginalCorrect','sixthWorkerCorrect','fixedInputCorrect','totalProductGraphCorrect','marginalProductGraphCorrect','capacityQuestionCorrect','dmrTransferCorrect'])assert.equal(last[field],true);
  assert.equal(record.events.filter(e=>e.action==='production_review_complete').length,1);
  assert.equal(record.events.filter(e=>e.action==='two_truck_challenge_start').length,1);
  assert.equal(record.events.filter(e=>e.action==='two_truck_allocation').length,3);
  assert.equal(record.events.filter(e=>e.action==='two_truck_best_allocation_found').length,1);
  assert.equal(last.allocationAttemptNumber,3);assert.equal(last.combinedOutput,62);
  assert.equal(record.events[0].allocationAttemptNumber,0);assert.equal(record.events[0].capacityQuestionCorrect,null);
  assert.ok(record.events.filter(e=>e.action!=='game_complete').every(e=>e.completed===false));
  assert.equal(record.events.filter(e=>e.action==='debrief_answer').length,6);assert.equal(record.events.filter(e=>e.action==='game_complete').length,1);
  await p.getByRole('link',{name:'RETURN TO GAMES'}).click();assert.equal(new URL(p.url()).pathname,'/games/');await p.getByRole('link',{name:'PLAY LUNCH RUSH'}).click();await imageCrew(p,0);await p.close();
  results.push('Solo calm/threshold/stress/low-and-high-backlog return paths; all images; boundaries; unique logs; cap fallback; full debrief after crew reduction; replay, telemetry and return route passed.');
  for(const [index,viewport] of [{width:1920,height:1080},{width:1280,height:720},{width:900,height:800},{width:768,height:1024},{width:390,height:844},{width:320,height:740}].entries()){
    const p=await setup(viewport), depth=4+index%3;
    await action(p,'start_rush');for(let i=1;i<depth;i++)await action(p,'call_worker');
    await clean(p);await layout(p,`${viewport.width}-active`);
    if(viewport.width<=800){const boxes=await Promise.all(['.scene','.operations','.production-log','.controls'].map(s=>p.locator(s).boundingBox()));for(let i=1;i<boxes.length;i++)assert.ok(boxes[i].y>=boxes[i-1].y+boxes[i-1].height);}
    await action(p,'review_record');await finishDebrief(p,depth,{prefix:String(viewport.width)});
    await p.close();results.push(`${viewport.width}×${viewport.height}: active and ${depth===4?3:depth===5?5:6}-question debrief/reveal passed.`);
  }
  const blocked=await setup({width:390,height:844},true);await action(blocked,'start_rush');assert.equal(await blocked.locator('#storage-warning').isVisible(),true);for(let i=0;i<3;i++)await action(blocked,'call_worker');await action(blocked,'review_record');await finishDebrief(blocked,4);await blocked.close();results.push('Blocked storage permits full play and debrief.');
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  await writeFile(out+'results.json',JSON.stringify({results,errors,network},null,2));console.log(JSON.stringify({results,errors,network},null,2));
} finally {await browser.close();await new Promise(r=>server.close(r));}
