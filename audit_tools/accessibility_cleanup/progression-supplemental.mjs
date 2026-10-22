import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
process.env.MQ_A11Y_OUT ||= 'validation_artifacts/feedback_progression';
const {pw,serve,isolated,start,save}=await import('./support.mjs');
const {server,origin}=await serve();
const browser=await pw.chromium.launch({channel:'msedge',headless:true}),results=[];
async function test(name,fn){try{results.push({name,status:'PASS',detail:await fn()});}catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}console.log(name,results.at(-1).status);}
async function open(file,old=false){
 const x=await isolated(browser,origin,{reducedMotion:'reduce'});
 if(old)await x.context.route(origin+'/'+file,r=>r.fulfill({contentType:'text/html',body:execFileSync('git',['show',(process.env.MQ_FEEDBACK_BASELINE || 'aa74a1e2')+':'+file],{encoding:'utf8',maxBuffer:20e6})}));
 await x.page.addInitScript(()=>{let seed=16427;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};});
 await x.page.clock.install({time:new Date('2026-10-22T16:00:00Z')});await x.page.clock.pauseAt(new Date('2026-10-22T16:00:01Z'));
 await x.page.goto(origin+'/'+file);return x;
}
const state=p=>p.evaluate(()=>({room,q:currentQuestion?.id,attempts:totalAttempts,correct:correctAnswers,streak,maxStreak,bossHealth,bossCheckpoint,repair:remediationState.stage,active:remediationState.active,ending:runEnding}));
async function answer(p,want){
 await p.clock.runFor(6500);
 const feedback=await p.evaluate(()=>currentQuestion.feedback);
 const choice=await p.evaluate(async want=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;},want);
 await p.locator('#answers button').nth(choice).focus();await p.keyboard.press('Enter');await p.waitForTimeout(30);await p.clock.runFor(1000);
 return {feedback,state:await state(p)};
}
async function next(p){
 if(await p.locator('#mqFeedbackContinue').isVisible())await p.locator('#mqFeedbackContinue').click();
 else if(await p.locator('#gameModalConfirm').isVisible())await p.locator('#gameModalConfirm').click();
 else await p.clock.runFor(3500);
 await p.clock.runFor(50);
}
try{
 for(const file of ['play/economic-realm/market-gate/index.html','play/managerial-intelligence-directorate/cost-directive/index.html','play/micro-domains/labyrinth-of-choice/index.html'])await test('Motion-on hallway remains readable; OS fallback and reload preference: '+file,async()=>{
  const {page:p,context}=await open(file);try{
   await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>!document.documentElement.classList.contains('mq-motion-paused'));
   await start(p,'quiz');await answer(p,true);const settled=await state(p);await p.clock.runFor(20000);await p.waitForTimeout(1500);
   assert.deepEqual(await state(p),settled);assert(await p.locator('#hallwayTransition').evaluate(e=>Number(getComputedStyle(e).opacity)>.99));assert(await p.locator('#hallwayText').evaluate(e=>Number(getComputedStyle(e).opacity)>.99));
   await p.locator('#mqFeedbackContinue').click();await p.clock.runFor(50);
   await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.documentElement.classList.contains('mq-motion-paused'));
   await p.locator('#returnMenuBtn').click();await p.locator('#mqMotionControl').click();
   assert.equal(await p.evaluate(()=>localStorage.getItem('mq:accessibility:decorative-motion')),'playing');
   await p.reload();assert(await p.locator('html').evaluate(e=>!e.classList.contains('mq-motion-paused')));
   return {animationHeld:true,osFallback:true,explicitChoiceSurvivesReload:true};
  }finally{await context.close();}
 });
 for(const file of ['downloads/resources/mastery-quests-faculty-starter.html','play/economic-realm/market-gate/index.html','play/micro-domains/labyrinth-of-choice/index.html'])await test('Fixed-length Trial by Graph completion: '+file,async()=>{
  const {page:p,context}=await open(file);try{
   await start(p,'trialGraph');let count=0;
   while(!(await state(p)).ending && count<60){await answer(p,count%2===0);count++;await next(p);assert.equal((await state(p)).attempts,count);}
   assert((await state(p)).ending);assert(count<60);
   assert.notEqual(await p.evaluate(()=>document.activeElement.tagName),'BODY');
   return {questions:count,state:await state(p)};
  }finally{await context.close();}
 });
 for(const file of ['play/managerial-intelligence-directorate/cost-directive/index.html','play/micro-domains/labyrinth-of-choice/index.html'])await test('Independent recovery retry and final explanation baseline: '+file,async()=>{
  const runs=[];for(const old of [true,false]){const {page:p,context}=await open(file,old);try{
   await start(p);const states=[];let originFeedback;
   for(let i=0;i<12;i++){const r=await answer(p,false);states.push(r.state);if(r.state.active){originFeedback=r.feedback;break;}await next(p);}
   assert(originFeedback);if(!old)assert(!(await p.locator('body').ariaSnapshot()).includes(originFeedback));
   states.push((await answer(p,false)).state);assert((await state(p)).active);
   for(let i=0;i<3;i++){states.push((await answer(p,true)).state);if(!old && i<2)assert(!(await p.locator('body').ariaSnapshot()).includes(originFeedback));}
   if(!old){assert((await p.locator('#gameModalText').innerText()).includes(originFeedback));const frozen=await state(p);await p.clock.runFor(20000);assert.deepEqual(await state(p),frozen);}
   await next(p);states.push(await state(p));runs.push(states);
  }finally{await context.close();}}
  assert.deepEqual(runs[1],runs[0]);return {states:runs[1]};
 });
}finally{await browser.close();server.close();save('supplemental.json',results);}
