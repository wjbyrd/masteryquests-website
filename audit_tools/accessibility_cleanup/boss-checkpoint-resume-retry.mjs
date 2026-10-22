import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
process.env.MQ_A11Y_OUT ||= 'validation_artifacts/boss_checkpoint_regression';
const {pw,serve,isolated,start,save}=await import('./support.mjs');
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true}),results=[];
const market='play/economic-realm/market-gate/index.html';
async function open(file){
 const x=await isolated(browser,origin,{reducedMotion:'reduce'});
 await x.page.addInitScript(()=>{let seed=16427;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};});
 await x.page.clock.install({time:new Date('2026-10-22T16:00:00Z')});await x.page.clock.pauseAt(new Date('2026-10-22T16:00:01Z'));
 return x;
}
async function snapshot(p){return p.evaluate(()=>({room,bossHealth,bossCheckpoint,attempts:totalAttempts,correct:correctAnswers,question:currentQuestion?.id,checkpoint:typeof checkpointAttemptState==='undefined'?null:checkpointAttemptState,inventory:typeof getArtifactInventoryCount==='function'?['compass','lens','scales'].map(getArtifactInventoryCount):Object.values(ARTIFACT_STORAGE_KEYS).map(k=>localStorage.getItem(k)),defeats:bossesDefeatedThisRun,remediation:remediationState.active}));}
async function answer(p,want){
 await p.evaluate(()=>{if(typeof resetQuestionVisibilityTiming==='function')resetQuestionVisibilityTiming();});await p.clock.runFor(6500);
 const before=await snapshot(p),i=await p.evaluate(async want=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;},want);
 await p.locator('#answers button').nth(i).click();await p.waitForFunction(n=>totalAttempts===n+1,before.attempts);await p.clock.runFor(3500);
}
async function next(p){
 if(await p.locator('#mqFeedbackContinue').isVisible())await p.locator('#mqFeedbackContinue').evaluate(e=>{e.click();e.click();});
 else if(await p.locator('#gameModalConfirm').isVisible())await p.locator('#gameModalConfirm').evaluate(e=>{e.click();e.click();});
 await p.clock.runFor(4000);
 if(await p.locator('#bossRevealProceed').isVisible())await p.locator('#bossRevealProceed').click();
}
async function enter(p,roomNumber){await p.evaluate(n=>{room=n;bossCheckpoint=n-9;bossHealth=3;bossPool=[];loadQuestion();},roomNumber);if(await p.locator('#bossRevealProceed').isVisible())await p.locator('#bossRevealProceed').click();if(await p.locator('.principal-suspense').isVisible())await p.clock.runFor(5000);if(await p.locator('.principal-skip-btn').isVisible())await p.locator('.principal-skip-btn').click();}
async function test(name,run){if(process.env.MQ_BOSS_FILTER && !name.includes(process.env.MQ_BOSS_FILTER))return;try{results.push({name,status:'PASS',detail:await run()});}catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}save(process.env.MQ_BOSS_RESUME_REPORT || 'resume-retry.json',results);console.log(results.at(-1).status,name);}
try{
 for(const file of [market,'play/micro-domains/labyrinth-of-choice/index.html','play/managerial-intelligence-directorate/cost-directive/index.html'])await test(`Known weakness cannot intercept a Standard boss setback: ${file}`,async()=>{
  const {page:p,context}=await open(file);try{await p.goto(origin+'/'+file);await start(p);await enter(p,10);
   await p.evaluate(()=>{conceptMemory[currentQuestion.tag]=10;});assert(await p.evaluate(()=>shouldTriggerDetour(currentQuestion)));
   await answer(p,false);const failed=await snapshot(p);assert.equal(failed.room,7);assert.equal(failed.remediation,false);assert.equal(failed.defeats,0);return failed;
  }finally{await context.close();}
 });
 for(const file of [market,'play/micro-domains/labyrinth-of-choice/index.html','play/managerial-intelligence-directorate/cost-directive/index.html'])for(const roomNumber of [10,20,30])await test(`Failure, reload, retry and reward ${file} boss ${roomNumber}`,async()=>{
  const {page:p,context}=await open(file);try{
   await p.goto(origin+'/'+file);await start(p);await enter(p,roomNumber);const initial=await snapshot(p);await answer(p,false);const failed=await snapshot(p);
   assert.equal(failed.room,roomNumber-3);assert.equal(failed.defeats,initial.defeats);assert.deepEqual(failed.inventory,initial.inventory);assert.equal(failed.remediation,false);
   await p.evaluate(()=>saveGameState());await p.reload();await p.evaluate(()=>continueSavedRun());if(await p.locator('#guideIntroProceed').isVisible())await p.locator('#guideIntroProceed').click();
   assert.equal((await snapshot(p)).room,roomNumber-3);assert.equal((await snapshot(p)).attempts,failed.attempts);
   for(let i=0;i<3;i++){await answer(p,true);await next(p);}
   assert.equal((await snapshot(p)).room,roomNumber);assert.equal((await snapshot(p)).bossHealth,3);
   for(let i=0;i<3;i++)await answer(p,true);
   const secured=await snapshot(p);assert.equal(secured.defeats,initial.defeats+1);
   if(file===market){const inventory=[...initial.inventory];inventory[roomNumber/10-1]++;assert.deepEqual(secured.inventory,inventory);assert.equal(secured.checkpoint,null);}
   // Resume a completed summary without re-awarding it, then call the same handler twice.
   await p.evaluate(()=>saveGameState());await p.reload();await p.evaluate(()=>continueSavedRun());if(await p.locator('#guideIntroProceed').isVisible())await p.locator('#guideIntroProceed').click();await p.clock.runFor(100);
   assert.equal((await snapshot(p)).defeats,secured.defeats);assert.deepEqual((await snapshot(p)).inventory,secured.inventory);
   await p.locator('#continueBtn').evaluate(e=>{const callback=e.onclick;callback();callback();});await p.clock.runFor(4000);
   if(roomNumber<30)assert.equal((await snapshot(p)).room,roomNumber+1);
   return {initial,failed,secured,final:await snapshot(p)};
  }finally{await context.close();}
 });
 for(const roomNumber of [10,20,30])await test(`Historical partial save containing a miss: boss ${roomNumber}`,async()=>{
  const {page:p,context}=await open(market);try{
   const old=execFileSync('git',['show','5e1d5644:'+market],{encoding:'utf8',maxBuffer:20e6});
   await context.route(origin+'/'+market,r=>r.fulfill({contentType:'text/html',body:old}));await p.goto(origin+'/'+market);await start(p);await enter(p,roomNumber);
   await answer(p,false);await answer(p,true);const prior=await snapshot(p);assert.equal(prior.room,roomNumber);assert.equal(prior.checkpoint.incorrect,1);await p.evaluate(()=>saveGameState());
   await context.unroute(origin+'/'+market);await p.reload();await p.evaluate(()=>continueSavedRun());if(await p.locator('#guideIntroProceed').isVisible())await p.locator('#guideIntroProceed').click();
   const restored=await snapshot(p);assert.equal(restored.room,roomNumber-3);assert.equal(restored.attempts,prior.attempts);assert.equal(restored.correct,prior.correct);assert.equal(restored.defeats,prior.defeats);assert.deepEqual(restored.inventory,prior.inventory);assert.equal(restored.checkpoint,null);
   await next(p);assert.equal((await snapshot(p)).room,roomNumber-3);return {prior,restored};
  }finally{await context.close();}
 });
}finally{await browser.close();server.close();}
