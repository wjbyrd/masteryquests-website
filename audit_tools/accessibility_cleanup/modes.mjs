import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {root,out,pw,serve,isolated,start,scan,save} from './support.mjs';
const representatives=['downloads/resources/mastery-quests-faculty-starter.html','play/economic-realm/market-gate/index.html','play/macro-command-system/national-engine/index.html','play/managerial-intelligence-directorate/cost-directive/index.html','play/micro-domains/labyrinth-of-choice/index.html'];
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true});const results=[];
async function open(file,baseline=false){const item=await isolated(browser,origin,{reducedMotion:'reduce'}),{page,context}=item;
 if(baseline){const html=execFileSync('git',['show','HEAD:'+file],{encoding:'utf8',maxBuffer:20e6});await context.route(origin+'/'+file,r=>r.fulfill({contentType:'text/html',body:html}));}
 await page.addInitScript(()=>{let seed=16427;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};});
 await page.clock.install({time:new Date('2026-10-22T16:00:00Z')});await page.goto(origin+'/'+file);return item;
}
async function sequence(file,mode,baseline){const {page,context}=await open(file,baseline);const errors=[];page.on('pageerror',e=>errors.push(e.message));try{
 await start(page,mode);const states=[],release=[];
 for(const wantCorrect of [false,true,true]){
  if(!await page.locator('#answers button:not(:disabled)').count())break;
  await page.clock.runFor(6500);
  const q=await page.evaluate(()=>({id:currentQuestion.id,feedback:currentQuestion.feedback,immediate:typeof modeAllowsImmediateCorrectnessFeedback==='function'?modeAllowsImmediateCorrectnessFeedback():gameMode!=='exam'}));
  const choice=await page.evaluate(async want=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;},wantCorrect);
  const answer=page.locator('#answers button').nth(choice);if(await answer.isDisabled())continue;
  await answer.focus();await page.keyboard.press('Enter');await page.clock.runFor(100);
  if(!q.immediate && !baseline){const tree=await page.locator('body').ariaSnapshot();assert(!q.feedback||!tree.includes(q.feedback),'delayed feedback leaked');assert.equal(await page.locator('#mqExplanationReview li').count(),0);}
  release.push({question:q.id,immediate:q.immediate});
  await page.clock.runFor(4000);
  states.push(await page.evaluate(()=>({question:currentQuestion?.id,room,totalAttempts,correctAnswers,streak,score:typeof scoreAttackScore==='undefined'?null:scoreAttackScore,fading:typeof fadingFortuneScore==='undefined'?null:fadingFortuneScore,risk:typeof riskRewardBankroll==='undefined'?null:riskRewardBankroll,repair:typeof remediationState==='undefined'?null:JSON.parse(JSON.stringify(remediationState))})));
 }
 return {states,release,errors};
}finally{await context.close();}}
try{for(const file of representatives){
 const {page,context}=await open(file);await page.evaluate(()=>showModeSelect());const modes=await page.locator('[data-mode]').evaluateAll(es=>es.filter(e=>!e.disabled&&getComputedStyle(e).display!=='none').map(e=>e.dataset.mode));await context.close();
 for(const mode of modes){const result={file,mode};try{result.before=await sequence(file,mode,true);result.after=await sequence(file,mode,false);assert.deepEqual(result.after.states,result.before.states);assert.deepEqual(result.after.errors,[]);result.status='PASS';}catch(e){result.status='FAIL';result.error=e.message;process.exitCode=1;}results.push(result);save('modes.json',results);console.log(file.split('/').at(-2),mode,result.status);}
}}finally{await browser.close();server.close();}
