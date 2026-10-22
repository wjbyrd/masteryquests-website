import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
process.env.MQ_A11Y_OUT ||= 'validation_artifacts/boss_checkpoint_regression';
const {pw,serve,isolated,start,save,out}=await import('./support.mjs');
const {server,origin}=await serve();
const browser=await pw.chromium.launch({channel:'msedge',headless:true});
const results=[];
const baseline='5e1d5644'; // Immediately before the first accessibility commit.
const economic=['market-gate','national-ledger','equilibrium-crisis','liquidity-grid','stabilization-protocol'].map(g=>`play/economic-realm/${g}/index.html`);
const representatives=[economic[0],'play/macro-command-system/national-engine/index.html','play/micro-domains/labyrinth-of-choice/index.html','play/managerial-intelligence-directorate/cost-directive/index.html'];
const patterns=Array.from({length:8},(_,n)=>[Boolean(n&4),Boolean(n&2),Boolean(n&1)]);
const phase=process.env.MQ_BOSS_PHASE || 'current';
async function state(p){return p.evaluate(()=>({room,bossHealth,bossCheckpoint,attempts:totalAttempts,correct:correctAnswers,checkpoint:typeof checkpointAttemptState==='undefined'?null:checkpointAttemptState,outcome:typeof lastCheckpointOutcome==='undefined'?null:lastCheckpointOutcome,remediation:remediationState.active,question:currentQuestion?.id,title:document.getElementById('question')?.innerText || document.body.innerText.slice(0,500),modal:document.getElementById('gameModalTitle')?.textContent,inventory:typeof getArtifactInventoryCount==='function'?['compass','lens','scales'].map(k=>getArtifactInventoryCount(k)):null}));}
async function answer(p,want){
 await p.evaluate(()=>{if(typeof resetQuestionVisibilityTiming==='function')resetQuestionVisibilityTiming();else questionStartTime=Date.now();});
 await p.clock.runFor(6500);
 const before=await state(p);
 const index=await p.evaluate(async want=>{for(let i=0;i<currentQuestion.options.length;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;throw Error('No matching answer');},want);
 await p.locator('#answers button').nth(index).click();
 await p.waitForFunction(n=>totalAttempts===n+1,before.attempts);
 await p.clock.runFor(3500);
 return {wanted:want,before,after:await state(p)};
}
async function enter(p,bossRoom){
 await p.evaluate(n=>{room=n;bossCheckpoint=n===10?1:n-9;bossHealth=3;bossPool=[];loadQuestion();},bossRoom);
 if(await p.locator('#bossRevealProceed').isVisible())await p.locator('#bossRevealProceed').click();
 await p.waitForFunction(()=>!answerSubmissionPending && document.querySelectorAll('#answers button').length===4);
}
async function scenario(file,{version='current',pattern=[false,false,true],bossRoom=10,resume=false,double=false,natural=false}={}){
 const {page:p,context}=await isolated(browser,origin,{reducedMotion:'reduce'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  if(version!=='current')await context.route(origin+'/'+file,route=>route.fulfill({contentType:'text/html',body:version==='production'?fs.readFileSync(path.join(out,'production-market-gate.html'),'utf8'):execFileSync('git',['show',baseline+':'+file],{encoding:'utf8',maxBuffer:20e6})}));
  if(version==='production')for(const asset of ['market_gate_questions_student.js','instructional_resources.js'])await context.route(origin+'/play/economic-realm/market-gate/'+asset,r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(out,'production-'+asset))}));
  await p.addInitScript(()=>{let seed=16427;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};});
  await p.clock.install({time:new Date('2026-10-22T16:00:00Z')});await p.clock.pauseAt(new Date('2026-10-22T16:00:01Z'));
  await p.goto(origin+'/'+file);await start(p);
  if(natural){
   for(let n=1;n<bossRoom;n++){
    assert.equal((await state(p)).room,n);await answer(p,true);
    if(await p.locator('#mqFeedbackContinue').isVisible())await p.locator('#mqFeedbackContinue').evaluate(e=>{e.click();e.click();});
    await p.clock.runFor(4000);
   }
   if(await p.locator('#bossRevealProceed').isVisible())await p.locator('#bossRevealProceed').click();
   assert.equal((await state(p)).room,bossRoom);
  }else await enter(p,bossRoom);
  const initial=await state(p),trace=[];
  for(let i=0;i<pattern.length;i++){
   trace.push(await answer(p,pattern[i]));
   if(i===1 && resume && (await state(p)).room===bossRoom && !(await state(p)).remediation){
    await p.evaluate(()=>saveGameState());await p.reload();await p.evaluate(()=>continueSavedRun());
    if(await p.locator('#guideIntroProceed').isVisible())await p.locator('#guideIntroProceed').click();
    if(await p.locator('#bossRevealProceed').isVisible())await p.locator('#bossRevealProceed').click();
    assert.equal((await state(p)).bossHealth,trace.at(-1).after.bossHealth,'Resume lost checkpoint position');
    assert.deepEqual((await state(p)).checkpoint,trace.at(-1).after.checkpoint,'Resume lost checkpoint counts');
   }
   // Independent legacy engines may leave a checkpoint immediately on a miss.
   if((await state(p)).room!==bossRoom || (await state(p)).remediation)break;
  }
  const summary=await state(p);
  if(file===economic[0] && pattern.join()==='false,false,true' && !resume && !double)await p.screenshot({path:path.join(out,phase+'-'+version+'-one-correct.png')});
  let repeatedClickRoom=null;
  if(await p.locator('#continueBtn').isVisible()){
   await p.locator('#continueBtn').evaluate((e,double)=>{e.click();if(double)e.click();},double);
   repeatedClickRoom=(await state(p)).room;
   await p.clock.runFor(8000);
  }else if(await p.locator('#gameModalConfirm').isVisible()){
   await p.locator('#gameModalConfirm').click();await p.clock.runFor(100);
  }
  const afterContinue=await state(p);
  if(summary.outcome){
   const correct=trace.filter(t=>t.wanted).length;
   const fixed=await p.evaluate(()=>typeof failStandardCheckpoint==='function');
   assert.equal(summary.outcome.correct,correct);assert.equal(summary.outcome.total,trace.length);
   assert.equal(summary.outcome.outcome,correct===3?'secured':correct===2 && trace.length===3 && !fixed?'cleared':'not-secured');
   assert.equal(summary.attempts-initial.attempts,trace.length);assert.equal(summary.correct-initial.correct,correct);
  }
  assert.deepEqual(errors,[]);
  return {file,version,pattern,bossRoom,resume,double,natural,initial,trace,summary,afterContinue,repeatedClickRoom};
 }finally{await context.close();}
}
async function test(file,options){
 let observation;
 try{
  observation=await scenario(file,options);
  if(process.argv.includes('--release-check') || process.argv.includes('--fixed')){
   const {initial,summary,afterContinue}=observation;
   if(options.pattern.includes(false)){
    assert.deepEqual(summary.inventory,initial.inventory,'Unsecured checkpoint awarded an artifact');
    assert.equal(summary.bossCheckpoint,initial.bossCheckpoint,'Unsecured checkpoint raised the checkpoint floor');
    assert.equal(afterContinue.room,(options.bossRoom || 10)-3,'Wrong boss answer did not apply the original setback');
    assert.equal(observation.trace.length,options.pattern.indexOf(false)+1,'Checkpoint continued past the first miss');
   }else if((options.bossRoom || 10)!==30){
    assert.equal(afterContinue.room,(options.bossRoom || 10)+1,'Repeated Continue skipped a room');
   }
  }
  results.push({status:'PASS',...observation});
 }catch(e){results.push({status:'FAIL',file,...options,...observation,error:e.stack});process.exitCode=1;}
 save(phase+'.json',results);console.log(results.at(-1).status,file,JSON.stringify(options));
}
try{
 const smoke=process.argv.includes('--smoke');
 if(process.argv.includes('--manual')){
  for(const pattern of patterns)await test('downloads/resources/mastery-quests-faculty-starter.html',{pattern,double:true});
 }else if(process.argv.includes('--fixed')){
  for(const file of [...economic,...representatives.slice(1),'tmp/boss-checkpoint-regression/faculty.html','downloads/resources/mastery-quests-faculty-starter.html'])for(const pattern of patterns)await test(file,{pattern,double:true});
  for(const bossRoom of [20,30])for(const pattern of patterns)await test(economic[0],{bossRoom,pattern,resume:true,double:true});
  for(const pattern of [[false,false,true],[true,false,false],[false,true,false]])await test(economic[0],{pattern,natural:true});
 }else if(process.argv.includes('--release-check')){
  for(const pattern of patterns)await test(economic[0],{pattern,double:true});
 }else if(process.argv.includes('--boundary')){
  for(const version of ['baseline','production','current'])for(const pattern of [[false,false,true],[true,false,false],[false,true,false]])await test(economic[0],{version,pattern,natural:true});
 }else if(process.argv.includes('--later')){
  for(const version of ['baseline','production','current'])for(const bossRoom of [20,30])for(const pattern of patterns)await test(economic[0],{version,bossRoom,pattern,resume:true});
 }else if(process.argv.includes('--additional')){
  for(const file of [...representatives.slice(1),'tmp/boss-checkpoint-regression/faculty.html'])for(const version of (file.startsWith('tmp/')?['current']:['baseline','current']))for(const pattern of patterns)await test(file,{version,pattern});
 }else{
 for(const version of (smoke?['current']:['baseline','production','current']))for(const pattern of (smoke?[[false,false,true]]:patterns))await test(economic[0],{version,pattern});
 if(!smoke){
  for(const file of economic.slice(1))for(const pattern of patterns)await test(file,{pattern});
  for(const file of representatives.slice(1))for(const pattern of patterns)await test(file,{pattern});
  for(const bossRoom of [10,20,30])for(const pattern of [[false,false,false],[false,false,true],[false,true,true],[true,true,true]])await test(economic[0],{bossRoom,pattern,resume:true});
  for(const version of ['baseline','production','current'])for(const pattern of [[false,false,true],[true,true,true]])await test(economic[0],{version,pattern,double:true});
 }
 }
}finally{await browser.close();server.close();}
