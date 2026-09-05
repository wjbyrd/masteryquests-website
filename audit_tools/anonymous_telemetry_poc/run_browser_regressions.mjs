import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { reconstructRun, validateEnvelope } from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const repo=path.resolve(process.argv[2]||'.');
const results=[], received=new Map(); let offline=true;
const server=http.createServer(async(req,res)=>{
  if(req.url.startsWith('/api/anonymous-telemetry-poc/')){
    if(offline){res.writeHead(503);res.end();return;}
    try{let body='';for await(const chunk of req)body+=chunk;const events=validateEnvelope(JSON.parse(body));for(const e of events)received.set(e.eventId,e);res.setHeader('content-type','application/json');res.writeHead(202);res.end(JSON.stringify({accepted:events.length,acknowledgedEventIds:events.map(e=>e.eventId)}));}catch(e){res.writeHead(400);res.end(e.message);}return;
  }
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=path.resolve(repo,'.'+pathname);
  if(!file.startsWith(repo+path.sep)){res.writeHead(403);res.end();return;}
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'};res.setHeader('content-type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);}catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
context.setDefaultTimeout(12000);
// Browser fixtures never contact the live Worker or other external services.
await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',detail:e.stack});}console.log(name+': '+results.at(-1).status);}
async function open(game='cost-directive'){
  const page=await context.newPage();await page.goto(`${origin}/play/managerial-directorate-telemetry-poc/${game}/?telemetryDebug=1&telemetrySynthetic=1`,{waitUntil:'load'});
  await page.waitForFunction(()=>Boolean(window.AnonymousTelemetryPOC));return page;
}
async function events(page){return page.evaluate(()=>AnonymousTelemetryPOC.getQueue().filter(e=>e.runId===AnonymousTelemetryPOC.getRunId()));}
async function launch(page,mode='standard'){
  await page.evaluate(mode=>{if(mode==='standard')startNewRun();else startSelectedMode(mode);},mode);
  await page.waitForFunction(()=>AnonymousTelemetryPOC.getQueue().some(e=>e.runId===AnonymousTelemetryPOC.getRunId()&&e.eventType==='question_shown'));
}
async function answerCorrect(page){await page.evaluate(async()=>{questionStartTime=Date.now()-6000;for(let i=0;i<currentQuestion.options.length;i++){if(await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}}throw Error('No correct option');});}
async function answerWrong(page,ms=12000){await page.evaluate(async ms=>{questionStartTime=Date.now()-ms;for(let i=0;i<currentQuestion.options.length;i++){if(!await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}}throw Error('No wrong option');},ms);}
let cost;
try{
  for(const game of ['cost-directive','market-signal','strategy-desk','agency-protocol']){
    const page=await open(game);if(game==='cost-directive')cost=page;
    await check(game+': actual fresh launch excludes previous question and streak',async()=>{
      await page.evaluate(()=>{room=30;streak=24;maxStreak=24;currentQuestion={id:4004};});await launch(page);
      const e=await events(page);assert.deepEqual(e.slice(0,2).map(e=>e.eventType),['mode_selected','run_started']);
      for(const initial of e.slice(0,2)){assert.equal(initial.position,0);assert.equal(initial.questionId,'');assert.equal(initial.streak,0);}
      assert.equal(reconstructRun(e).maxStreak,0);assert.ok(e.find(e=>e.eventType==='question_shown').questionId);
    });
    await check(game+': actual checkpoint reward emits a named new artifact and vault remains unlocked',async()=>{
      await page.evaluate(()=>{room=10;bossPool=[];bossHealth=3;loadQuestion();bossHealth=1;});await answerCorrect(page);
      await page.waitForFunction(()=>AnonymousTelemetryPOC.getQueue().some(e=>e.runId===AnonymousTelemetryPOC.getRunId()&&e.eventType==='artifact_unlocked'));
      const e=await events(page),r=reconstructRun(e);assert.equal(r.artifactAwards.length,1);assert.equal(r.artifactAwards[0].position,10);assert.equal(r.artifactAwards[0].newlyEarned,true);assert.ok(r.artifactAwards[0].artifactName);assert.equal(r.bossCompletions,1);
      const key=r.artifacts[0];assert.equal(await page.evaluate(key=>localStorage.getItem(ARTIFACT_STORAGE_KEYS[key]),key),'true');
      assert.equal(await page.locator('#vault'+key[0].toUpperCase()+key.slice(1)).evaluate(n=>n.classList.contains('unlocked')),true);
    });
    await check(game+': repeated grant is recorded as already owned, display alone emits nothing',async()=>{
      const before=(await events(page)).filter(e=>e.eventType==='artifact_unlocked').length;
      await page.evaluate(()=>{const key=Object.keys(ARTIFACT_STORAGE_KEYS)[0];showArtifact(artifacts[key].img,artifacts[key].title,artifacts[key].text);});
      assert.equal((await events(page)).filter(e=>e.eventType==='artifact_unlocked').length,before);
      await page.evaluate(()=>unlockArtifact(Object.keys(ARTIFACT_STORAGE_KEYS)[0]));
      const award=(await events(page)).filter(e=>e.eventType==='artifact_unlocked').at(-1);assert.equal(award.artifactAlreadyOwned,true);assert.equal(award.artifactNewlyEarned,false);
    });
    if(game!=='cost-directive')await page.close();
  }
  await check('debug Close leaves a working reopen control and Fresh leaves mapping intact',async()=>{
    const panel=cost.locator('#anonymousTelemetryDebug');await panel.locator(':scope > summary').click();
    await panel.locator('[data-action=close]').click();assert.equal(await panel.evaluate(n=>n.open),false);
    await panel.locator(':scope > summary').click();assert.equal(await panel.evaluate(n=>n.open),true);
    const id=await cost.evaluate(()=>AnonymousTelemetryPOC.getRunId());await panel.locator('[data-action=new-run]').click();assert.equal(await cost.evaluate(()=>AnonymousTelemetryPOC.getRunId()),id);
    assert.ok((await panel.innerText()).includes('Start a New Run in the game menu'));
    await cost.screenshot({path:path.join(repo,'validation_artifacts/anonymous_telemetry_poc/debug_regression.png')});
    await panel.locator('[data-action=close]').click();
  });
  await check('refresh/Continue uses actual saved game source ID and does not reselect mode',async()=>{
    await cost.evaluate(()=>{closeGameModal();room=2;bossHealth=3;streak=7;saveGameState();});
    const id=await cost.evaluate(()=>AnonymousTelemetryPOC.getRunId());await cost.reload({waitUntil:'load'});
    await cost.evaluate(()=>continueSavedRun());await cost.waitForFunction(()=>AnonymousTelemetryPOC.getQueue().some(e=>e.eventType==='run_resumed'&&e.runId===AnonymousTelemetryPOC.getRunId()));
    assert.equal(await cost.evaluate(()=>AnonymousTelemetryPOC.getRunId()),id);
    const e=await events(cost);assert.equal(e.filter(e=>e.eventType==='mode_selected').length,1);assert.equal(e.filter(e=>e.eventType==='run_resumed').at(-1).streak,7);assert.equal(reconstructRun(e).sequence.contiguous,true);
  });
  await check('real Standard ordinary miss proceeds repair -> bridge -> retest',async()=>{
    await cost.evaluate(()=>closeGameModal());await launch(cost);
    await answerWrong(cost);
    await cost.evaluate(()=>{closeGameModal();displayQuestion();});
    await answerWrong(cost);
    await cost.waitForFunction(()=>remediationState.active&&remediationState.stage==='repair');
    await answerCorrect(cost);await cost.waitForFunction(()=>remediationState.stage==='bridge');
    await answerCorrect(cost);await cost.waitForFunction(()=>remediationState.stage==='retest');
    const r=reconstructRun(await events(cost));assert.deepEqual([r.remediationDetours,r.bridgeTriggers,r.retestTriggers],[1,1,1]);
  });
  await check('real Legendary rapid pattern records non-engaged attempts without remediation',async()=>{
    await cost.evaluate(()=>{closeGameModal();returnToModeSelectFromRun();});await launch(cost,'legendary');
    for(let i=0;i<5;i++){
      await answerWrong(cost,100);
      if(i<4)await cost.evaluate(()=>{closeGameModal();loadQuestion();});
    }
    const r=reconstructRun(await events(cost));assert.equal(r.rapidGuessCount,1);assert.equal(r.rawAttempts,5);assert.equal(r.acceptedAttempts,4);assert.deepEqual([r.remediationDetours,r.bridgeTriggers,r.retestTriggers],[0,0,0]);
  });
  await check('actual Timed expiration preserves timed_complete and engine 600-second elapsed',async()=>{
    await cost.evaluate(()=>{closeGameModal();returnToModeSelectFromRun();});await launch(cost,'timed');
    await cost.evaluate(()=>{timedModeEndTime=Date.now()-1;updateTimedModeClock();});
    const e=await events(cost);const r=reconstructRun(e);assert.equal(r.completionStatus,'timed_complete');assert.equal(r.activeGameplayElapsedMs,600000);
  });
  await check('actual Standard completion emits terminal event; mastery report waits for view',async()=>{
    await cost.evaluate(()=>{closeGameModal();returnToModeSelectFromRun();});await launch(cost);
    for(const checkpoint of [10,20,30]){
      await cost.evaluate(checkpoint=>{closeGameModal();room=checkpoint;bossPool=[];bossHealth=3;loadQuestion();bossHealth=1;},checkpoint);
      await answerCorrect(cost);
    }
    await cost.evaluate(()=>{closeGameModal();handleVictory();});
    const r=reconstructRun(await events(cost));assert.equal(r.completionStatus,'complete');assert.equal(r.masterySummary,null);
    await cost.evaluate(()=>showMasteryReportScreen());await cost.waitForFunction(()=>AnonymousTelemetryPOC.getQueue().some(e=>e.runId===AnonymousTelemetryPOC.getRunId()&&e.eventType==='mastery_report_summary_emitted'));
  });
  await check('completed-run persistent artifact is pre-owned in a fresh run and not earned by restoration',async()=>{
    await launch(cost);const e=await events(cost);assert.equal(e.filter(e=>e.eventType==='artifact_unlocked').length,0);
    await cost.evaluate(()=>{room=10;bossPool=[];bossHealth=3;loadQuestion();bossHealth=1;});await answerCorrect(cost);
    const award=(await events(cost)).find(e=>e.eventType==='artifact_unlocked');assert.equal(award.artifactOwnedBeforeRun,true);assert.equal(award.artifactAlreadyOwned,true);assert.equal(award.artifactNewlyEarned,false);
  });
  await check('browser queue retries local failure then sends validated batches with unique contiguous events',async()=>{
    const queued=await cost.evaluate(()=>AnonymousTelemetryPOC.getQueue());assert.ok(queued.length>25);offline=false;
    await cost.evaluate(async()=>{while(AnonymousTelemetryPOC.getQueue().length){const result=await AnonymousTelemetryPOC.flush();if(!result.ok)throw Error(result.error);await new Promise(r=>setTimeout(r,60));}});
    assert.equal(await cost.evaluate(()=>AnonymousTelemetryPOC.getQueue().length),0);assert.equal(received.size,queued.length);for(const e of queued)assert.ok(received.has(e.eventId));
    for(const id of new Set(queued.map(e=>e.runId)))assert.equal(reconstructRun(queued.filter(e=>e.runId===id)).sequence.contiguous,true);
  });
}finally{
  await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  const failed=results.filter(r=>r.status==='FAIL');const report={phase:'phaseAnonymousTelemetryPOC-v1',generatedAt:new Date().toISOString(),environment:'Headless Edge; actual private HTML/engine; localhost transport only; fixture positioning/clock acceleration',passed:results.length-failed.length,failed:failed.length,total:results.length,results};
  fs.writeFileSync(path.join(repo,'validation_artifacts/anonymous_telemetry_poc/browser_regression_results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(failed.length)process.exitCode=1;
}
