import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {applyFeedbackProgression} from './progression-source.mjs';
process.env.MQ_A11Y_OUT ||= 'validation_artifacts/feedback_progression';
const {pw,serve,isolated,start,save}=await import('./support.mjs');
const baseline=process.env.MQ_FEEDBACK_BASELINE || 'aa74a1e2',git=args=>execFileSync('git',['-c','core.safecrlf=false',...args],{encoding:'utf8',maxBuffer:30e6});
const strip=s=>s.replace(/\r\n/g,'\n').replace(/<!-- MQ ACCESSIBILITY (style|script) START -->[\s\S]*?<!-- MQ ACCESSIBILITY \1 END -->/g,'').replace(/<!-- MQ HUB ACCESSIBILITY START -->[\s\S]*?<!-- MQ HUB ACCESSIBILITY END -->/g,'').replace(/<!-- MQ ECONOMIC CHARACTER STYLE START -->[\s\S]*?<!-- MQ ECONOMIC CHARACTER STYLE END -->\n/g,'');
const results=[];async function test(name,fn){try{const detail=await fn();results.push({name,status:'PASS',detail});}catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}console.log(name,results.at(-1).status);}
await test('Only approved source transformations outside embedded presentation blocks',()=>{
 const files=git(['diff',baseline,'--name-only']).trim().split(/\r?\n/).filter(f=>f.endsWith('.html'));
 assert.equal(files.length,32);for(const f of files){const before=git(['show',baseline+':'+f]),after=fs.readFileSync(f,'utf8');assert.equal(strip(after),strip(applyFeedbackProgression(before.replace(/\r\n/g,'\n'))),f);assert.equal(applyFeedbackProgression(after),after,'idempotent '+f);for(const m of after.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);}
 assert(!git(['diff',baseline,'--name-only']).split(/\r?\n/).some(f=>/question.*\.(js|json)$|wrangler|worker\./i.test(f)));
 return {htmlFiles:files.length,baseline};
});
const reps=['downloads/resources/mastery-quests-faculty-starter.html','play/economic-realm/market-gate/index.html','play/macro-command-system/national-engine/index.html','play/managerial-intelligence-directorate/cost-directive/index.html','play/micro-domains/labyrinth-of-choice/index.html'];
const {server,origin}=await serve();let browser;
try{browser=await pw.chromium.launch({channel:'msedge',headless:true});
async function open(file,old){const x=await isolated(browser,origin,{reducedMotion:'reduce'}),{page:p,context}=x;if(old)await context.route(origin+'/'+file,r=>r.fulfill({contentType:'text/html',body:git(['show',baseline+':'+file])}));await p.addInitScript(()=>{let seed=16427;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};});await p.clock.install({time:new Date('2026-10-22T16:00:00Z')});await p.clock.pauseAt(new Date('2026-10-22T16:00:01Z'));await p.goto(origin+'/'+file);return x;}
const state=p=>p.evaluate(()=>{const repair=JSON.parse(JSON.stringify(remediationState));delete repair.mqOriginFeedback;return {q:currentQuestion?.id,room,attempts:totalAttempts,correct:correctAnswers,streak,maxStreak,score:scoreAttackScore,fading:fadingFortuneScore,risk:riskRewardBankroll,bossHealth,bossCheckpoint,repair,mastery:JSON.parse(JSON.stringify(masteryState)),concept:JSON.parse(JSON.stringify(conceptMemory))};});
async function sequence(file,mode,want,old){const {page:p,context,blocked}=await open(file,old);const errors=[];p.on('pageerror',e=>errors.push(e.message));try{
 await start(p,mode);await p.evaluate(()=>{window.auditSent=[];const send=sendGameData;sendGameData=function(data){auditSent.push(JSON.parse(JSON.stringify(data)));return send(data);};});await p.clock.runFor(6500);
 const original=await p.evaluate(()=>({q:currentQuestion.q,feedback:currentQuestion.feedback}));const i=await p.evaluate(async want=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;},want);
 await p.locator('#answers button').nth(i).focus();await p.keyboard.press('Enter');await p.waitForTimeout(50);await p.clock.runFor(1000);const resolved=await state(p);
 const held=await p.locator('#mqFeedbackContinue').isVisible();if(!old && want && !['exam','timed'].includes(mode)){assert(held,'manual continuation absent');assert.equal(await p.locator('#mqMotionControl').isVisible(),false);assert((await p.locator('#hallwayText').innerText()).includes(original.feedback));}
 if(!old && !want && ['standard','unlimited','legendary'].includes(mode))assert(!(await p.locator('#gameModalText').innerText()).includes(original.feedback),'campaign Wrong Turn leaked explanation');
 if(!old && !want && ['quiz','trialGraph','score','fadingFortune','riskReward'].includes(mode))assert((await p.locator('#gameModalText').innerText()).includes(original.feedback),'wrong explanation absent');
 if(!old && mode==='exam'){assert.equal(await p.locator('#mqExplanationReview').isVisible(),false);assert(!held);}
 await p.clock.runFor(7000);
 if(held){assert.deepEqual(await state(p),resolved,'reading changed protected state');await p.locator('#mqFeedbackContinue').evaluate(e=>{e.click();e.click();});await p.clock.runFor(30);}
 else if(await p.locator('#gameModalConfirm').isVisible()){await p.locator('#gameModalConfirm').evaluate(e=>{e.click();e.click();});await p.clock.runFor(30);}
 const advanced=await state(p);assert.equal(advanced.attempts,resolved.attempts,'Continue resubmitted answer');assert.deepEqual(errors,[]);
 const sent=await p.evaluate(()=>auditSent.filter(e=>['question','exam_answer_initial','exam_answer_revision'].includes(e.event)));
 assert.equal(sent.length,1);return {resolved,advanced,events:sent.map(e=>({event:e.event,questionId:e.questionId,correct:e.correct,responseTime:e.responseTime,score:e.score})),blocked:blocked.length,held};
 }finally{await context.close();}}
const jobs=[];for(const file of reps){const {page,context}=await open(file,false);await page.evaluate(()=>showModeSelect());const modes=await page.locator('[data-mode]').evaluateAll(es=>es.filter(e=>!e.disabled&&getComputedStyle(e).display!=='none').map(e=>e.dataset.mode));await context.close();for(const mode of modes)for(const want of [false,true])jobs.push({file,mode,want});}
let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<jobs.length){const {file,mode,want}=jobs[cursor++];await test(`${file} ${mode} ${want?'correct':'incorrect'}`,async()=>{const before=await sequence(file,mode,want,true),after=await sequence(file,mode,want,false);assert.deepEqual(after.resolved,before.resolved,'resolved state');assert.deepEqual(after.advanced,before.advanced,'advanced state');assert.deepEqual(after.events,before.events,'scoring telemetry');return {before,after};});}}));
}finally{await browser?.close();server.close();save('regression.json',JSON.parse(JSON.stringify(results,(key,value)=>['mastery','concept'].includes(key)?{sha256:createHash('sha256').update(JSON.stringify(value)).digest('hex')}:value)));}
