import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
process.env.MQ_A11Y_OUT ||= 'validation_artifacts/final_feedback_refinement';
const {pw,serve,isolated,start,save,out}=await import('./support.mjs');
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true}),results=[];
const baseline='90f12687';
const reps=['play/economic-realm/market-gate/index.html','play/managerial-intelligence-directorate/cost-directive/index.html','play/micro-domains/labyrinth-of-choice/index.html'];
async function test(name,fn){try{results.push({name,status:'PASS',detail:await fn()});}catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}console.log(name,results.at(-1).status);}
async function open(file,old=false,options={}){
 const x=await isolated(browser,origin,{reducedMotion:'reduce',...options});
 if(old)await x.context.route(origin+'/'+file,r=>r.fulfill({contentType:'text/html',body:execFileSync('git',['show',baseline+':'+file],{encoding:'utf8',maxBuffer:20e6})}));
 await x.page.addInitScript(()=>{let seed=16427;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};});
 await x.page.clock.install({time:new Date('2026-10-22T16:00:00Z')});await x.page.clock.pauseAt(new Date('2026-10-22T16:00:01Z'));await x.page.goto(origin+'/'+file);return x;
}
async function state(p){const s=await p.evaluate(()=>{const repair=JSON.parse(JSON.stringify(remediationState));delete repair.mqOriginFeedback;return {q:currentQuestion?.id,room,attempts:totalAttempts,correct:correctAnswers,streak,maxStreak,score:scoreAttackScore,fading:fadingFortuneScore,risk:riskRewardBankroll,bossHealth,bossCheckpoint,repair,mastery:masteryState,concept:conceptMemory};});for(const key of ['mastery','concept'])s[key]=createHash('sha256').update(JSON.stringify(s[key])).digest('hex');return s;}
async function answer(p,want){
 await p.evaluate(()=>{if(typeof resetQuestionVisibilityTiming==='function')resetQuestionVisibilityTiming();});await p.clock.runFor(6500);
 const original=await p.evaluate(()=>({id:currentQuestion.id,q:currentQuestion.q,feedback:currentQuestion.feedback}));
 const choice=await p.evaluate(async want=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;},want);
 await p.locator('#answers button').nth(choice).focus();await p.keyboard.press('Enter');await p.waitForTimeout(30);await p.clock.runFor(1000);return original;
}
async function next(p){if(await p.locator('#mqFeedbackContinue').isVisible())await p.locator('#mqFeedbackContinue').click();else if(await p.locator('#gameModalConfirm').isVisible())await p.locator('#gameModalConfirm').click();else await p.clock.runFor(3500);await p.clock.runFor(50);}
async function enterRecovery(p){for(let i=0;i<12;i++){const q=await answer(p,false);if(await p.evaluate(()=>remediationState.active))return q;await next(p);}throw Error('Natural remediation not reached');}
async function noStageStop(p,original){assert(await p.evaluate(()=>remediationState.active));assert.equal(await p.locator('#mqFeedbackContinue').isVisible(),false);assert.equal(await p.locator('#gameModal').isVisible(),false);assert(!(await p.locator('body').ariaSnapshot()).includes(original.feedback));}
try{
 for(const file of reps)for(const [label,sequence]of Object.entries({success:[true,true,true],repairRetry:[false,true,true,true],bridgeRetry:[true,false,true,true],retestRetry:[true,true,false,true]}))await test('Natural recovery '+label+': '+file,async()=>{
  const runs=[];for(const old of [true,false]){const {page:p,context}=await open(file,old);try{
   await start(p);const original=await enterRecovery(p),states=[await state(p)];if(!old)await noStageStop(p,original);
   for(let i=0;i<sequence.length;i++){await answer(p,sequence[i]);states.push(await state(p));if(!old && i<sequence.length-1)await noStageStop(p,original);}
   assert.equal(await p.evaluate(()=>remediationState.active),false);
   if(!old){
    assert.deepEqual(await p.locator('#gameModalText [role=heading]').allTextContents(),['The original question','The economic connection']);
    assert.deepEqual(await p.locator('#gameModalText .mq-recovery-copy').allTextContents(),[original.q,original.feedback]);
    const destination=await p.evaluate(()=>FACULTY_COMPOSITION_CONFIG.title);assert.equal(await p.locator('#gameModalConfirm').textContent(),'Continue to '+destination);
    assert((await p.locator('#gameModalText').innerText()).includes('the question that sent you here'));
    assert.equal(await p.evaluate(()=>document.activeElement.id),'gameModalTitle');
    for(let n=0;n<4;n++){await p.keyboard.press('Tab');assert(await p.locator('#gameModal').evaluate(e=>e.contains(document.activeElement)));}
    const settled=await state(p);await p.clock.runFor(20000);assert.deepEqual(await state(p),settled);
    if(label==='success')await p.screenshot({path:path.join(out,file.split('/')[2]+'-recovery.png')});
    await p.locator('#gameModalConfirm').evaluate(e=>{e.click();e.click();});await p.clock.runFor(50);assert.equal((await state(p)).attempts,settled.attempts);
    assert.notEqual(await p.evaluate(()=>document.activeElement.tagName),'BODY');
   }else await next(p);
   states.push(await state(p));runs.push(states);
  }finally{await context.close();}}assert.deepEqual(runs[1],runs[0]);return {sequence,states:runs[1]};
 });
 for(const legacy of [false,true])await test('Resume active recovery '+(legacy?'without origin context':'with original context'),async()=>{
  const {page:p,context}=await open(reps[0]);try{
   await start(p);const original=await enterRecovery(p);await answer(p,true);assert.equal(await p.evaluate(()=>remediationState.stage),'bridge');await p.evaluate(()=>saveGameState());
   await p.reload();
   // Modify the historical fixture after pagehide's normal autosave has finished.
   if(legacy)await p.evaluate(()=>{const key=getSaveKey(),saved=JSON.parse(localStorage.getItem(key));delete saved.phase15.remediationState.mqOriginFeedback;localStorage.setItem(key,JSON.stringify(saved));});
   await p.evaluate(()=>continueSavedRun());if(await p.locator('#guideIntroProceed').isVisible())await p.locator('#guideIntroProceed').click();
   if(legacy)assert.equal(await p.evaluate(()=>remediationState.mqOriginFeedback || null),null);
   await noStageStop(p,original);assert.equal(await p.evaluate(()=>remediationState.stage),'bridge');await answer(p,true);await noStageStop(p,original);await answer(p,true);
   if(legacy){assert.equal(await p.locator('#gameModal').isVisible(),false);assert(!(await p.locator('body').ariaSnapshot()).includes(original.feedback));await p.clock.runFor(3500);assert.equal(await p.evaluate(()=>remediationState.active),false);}
   else{assert((await p.locator('#gameModalText').innerText()).includes(original.feedback));await next(p);}
   return {legacy,origin:original.id};
  }finally{await context.close();}
 });
 await test('Recovery long-text layout at mobile and 200% text; original modal cleanup',async()=>{
  const {page:p,context}=await open(reps[0],false,{viewport:{width:390,height:844}});try{
   await start(p);const original=await enterRecovery(p);for(let i=0;i<3;i++)await answer(p,true);
   // Stress the presentation with existing authored text repeated only in this isolated DOM fixture.
   await p.locator('.mq-recovery-copy').evaluateAll(es=>es.forEach(e=>e.textContent=Array(8).fill(e.textContent).join('\n\n')));
   await p.addStyleTag({content:'#gameModalText{font-size:36px} #gameModalTitle{font-size:60px}'});
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert(await p.locator('.game-modal-card').first().evaluate(e=>e.scrollHeight>e.clientHeight));
   await p.locator('#gameModalConfirm').focus();await p.keyboard.press('Tab');assert(await p.locator('#gameModal').evaluate(e=>e.contains(document.activeElement)));
   await p.screenshot({path:path.join(out,'recovery-mobile-long-text.png')});await p.locator('#gameModalConfirm').click();await p.clock.runFor(50);
   await p.locator('#returnMenuBtn').click();assert.equal(await p.locator('.mq-recovery-copy').count(),0);return {origin:original.id,viewport:390,textScale:2};
  }finally{await context.close();}
 });
 for(const file of reps)await test('Single motion button: defaults, legacy values, all inputs, persistence: '+file,async()=>{
  const {page:p,context}=await open(file,false,{hasTouch:true});try{
   await start(p);await p.locator('#returnMenuBtn').click();const button=p.locator('#mqMotionControl');
   assert.equal(await p.locator('.mq-motion-setting button').count(),1);assert.equal(await p.locator('.mq-motion-default').count(),0);assert.equal(await button.textContent(),'DECORATIVE MOTION: OFF');
   await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>document.getElementById('mqMotionControl').textContent.endsWith('ON'));
   const unchanged=await p.evaluate(()=>({time:questionStartTime,attempts:totalAttempts,sound:soundEnabled,volume:bgMusic.volume,muted:bgMusic.muted}));
   for(const input of ['mouse','touch','Enter','Space']){const previous=await button.textContent();if(input==='mouse')await button.click();else if(input==='touch')await button.tap();else{await p.keyboard.press('Tab');await button.focus();await p.keyboard.press(input);assert(await button.evaluate(e=>getComputedStyle(e).outlineStyle!=='none'));}assert.notEqual(await button.textContent(),previous);}
   assert.deepEqual(await p.evaluate(()=>({time:questionStartTime,attempts:totalAttempts,sound:soundEnabled,volume:bgMusic.volume,muted:bgMusic.muted})),unchanged);
   assert.equal(await p.evaluate(()=>localStorage.getItem('mq:accessibility:decorative-motion')),'playing');await p.emulateMedia({reducedMotion:'reduce'});await p.reload();assert(await p.locator('html').evaluate(e=>!e.classList.contains('mq-motion-paused')));
   await p.evaluate(()=>localStorage.setItem('mq:accessibility:decorative-motion','paused'));await p.reload();assert(await p.locator('html').evaluate(e=>e.classList.contains('mq-motion-paused')));
   return {legacyValues:['playing','paused'],inputs:['mouse','touch','Enter','Space']};
  }finally{await context.close();}
 });
 await test('Motion helper works when storage is unavailable',async()=>{
  const {page:p,context}=await isolated(browser,origin,{reducedMotion:'reduce'});try{
   await p.goto(origin+'/');await p.setContent('<main id="test"></main>');
   await p.evaluate(()=>Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Denied','SecurityError');}}));
   await p.addScriptTag({content:fs.readFileSync('build/faculty-build-composer/template/motion-preference.js','utf8')});
   await p.evaluate(()=>document.getElementById('test').append(MQMotionPreference.createControl('motion')));
   assert.equal(await p.locator('#motion').textContent(),'DECORATIVE MOTION: OFF');await p.locator('#motion').click();assert.equal(await p.locator('#motion').textContent(),'DECORATIVE MOTION: ON');
   await p.emulateMedia({reducedMotion:'no-preference'});await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('#motion').textContent(),'DECORATIVE MOTION: ON');return {storageThrows:true,inMemoryChoiceRetained:true};
  }finally{await context.close();}
 });
}finally{await browser.close();server.close();save('focused.json',results);}
