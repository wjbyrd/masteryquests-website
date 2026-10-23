// Preview refinements: real published graphs, UI and approved-baseline comparisons.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fn} from '../economic_realm_engine/source.mjs';
process.env.MQ_A11Y_OUT ||= 'tmp/accessibility_cleanup/labyrinth-final';
const {pw,serve,isolated,start,scan}=await import('../accessibility_cleanup/support.mjs');
const out=path.resolve(process.env.MQ_A11Y_OUT),base='2c5c2a8a';
const dir='play/micro-domains/labyrinth-of-choice',htmlFile=dir+'/index.html',bankFile=dir+'/labyrinth_of_choice_question_bank_student.js';
const oldText=file=>execFileSync('git',['show',`${base}:${file}`],{encoding:'utf8',maxBuffer:5e6}).replace(/\r\n/g,'\n');
const html=fs.readFileSync(htmlFile,'utf8').replace(/\r\n/g,'\n'),oldHTML=oldText(htmlFile),bankText=fs.readFileSync(bankFile,'utf8'),oldBankText=oldText(bankFile);
function bank(source){const c={};vm.createContext(c);vm.runInContext(source+'\nthis.result={bank:questionBank,metadata:typeof questionAssetMetadata===\'undefined\'?{}:questionAssetMetadata};',c);return JSON.parse(JSON.stringify(c.result));}
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true}),results=[];
async function open(old=false,width=390,clock=false){
 const x=await isolated(browser,origin,{viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true,hasTouch:true});x.errors=[];x.page.on('pageerror',e=>x.errors.push(e.message));
 await x.page.addInitScript(()=>{let n=16427;Math.random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);});
 if(clock){await x.page.clock.install({time:new Date('2026-10-23T16:00:00Z')});await x.page.clock.pauseAt(new Date('2026-10-23T16:00:01Z'));}
 if(old){await x.page.route('**/'+htmlFile,r=>r.fulfill({contentType:'text/html',body:oldHTML}));await x.page.route('**/'+bankFile,r=>r.fulfill({contentType:'text/javascript',body:oldBankText}));}
 await x.page.goto(origin+'/'+htmlFile,{timeout:30000});return x;
}
async function check(name,action){if(process.argv[2]&&!name.includes(process.argv[2]))return;try{results.push({name,status:'PASS',details:await action()});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(name,results.at(-1).status);fs.writeFileSync(path.join(out,process.argv[2]?'focused-results.json':'results.json'),JSON.stringify(results,null,2));}
async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png'),fullPage:true});}
async function answer(p,correct){await p.clock.runFor(6500);const i=await p.evaluate(async want=>{for(let i=0;i<currentQuestion.options.length;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;throw Error('Answer unavailable');},correct);await p.locator('#answers button').nth(i).focus();await p.keyboard.press('Enter');await p.waitForTimeout(30);await p.clock.runFor(2000);await p.waitForTimeout(30);}
async function state(p){return p.evaluate(()=>({room,q:currentQuestion?.id,options:currentQuestion?.options,attempts:totalAttempts,correct:correctAnswers,streak,maxStreak,bossHealth,bossCheckpoint,adaptiveMode,conceptMemory,masteryState,remediation:remediationState,columns:TELEMETRY_COLUMNS,report:getMasteryReportData(),events:readLocalTelemetry(runID).map(r=>({event:r.event,room:r.room,q:r.questionID,correct:r.correct,selected:r.selectedIndex,canonical:r.canonicalSelectedIndex,response:r.responseTimeMs,attempt:r.attempt,streak:r.streak,objective:r.objective,tag:r.tag,type:r.type})),vault:Object.fromEntries(Object.entries(ARTIFACT_STORAGE_KEYS).map(([k,v])=>[k,localStorage.getItem(v)]))}));}
try{

 for(const width of [1440,820,390,320])await check('Exam grid keyboard touch layout '+width,async()=>{const x=await open(false,width,true);try{const p=x.page;await start(p,'exam');assert.equal(await p.locator('#labyrinthExamNavigation').count(),0);for(let n=1;n<=9;n++){await p.locator(`[data-exam-room="${n}"]`).focus();await p.keyboard.press(n%2?'Enter':' ');assert.equal(await p.evaluate(()=>room),n);}const sizes=await p.locator('#mazeTrack button').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(sizes.every(s=>s.w>=44&&s.h>=44),JSON.stringify(sizes));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('[data-exam-room="1"]').tap();assert.equal(await p.evaluate(()=>room),1);await p.clock.resume();assert.deepEqual((await scan(p)).violations,[]);await shot(p,'exam-grid-'+width);assert.deepEqual(x.errors,[]);return sizes;}finally{await x.context.close();}});
 await check('full Exam protected state equals approved baseline',async()=>{
  const runs=[];for(const old of [true,false]){const x=await open(old,390,true);try{const p=x.page;await start(p,'exam');const trace=[await state(p)];await answer(p,false);await answer(p,true);const first=await p.evaluate(()=>currentQuestion.options);await p.locator('[data-exam-room="2"]').focus();await p.keyboard.press(' ');await p.locator('[data-exam-room="1"]').focus();await p.keyboard.press('Enter');assert.deepEqual(await p.evaluate(()=>currentQuestion.options),first);assert.equal(await p.evaluate(()=>totalAttempts),0);assert.equal(await p.locator('[data-exam-room="10"]').count(),0);assert.equal(await p.evaluate(()=>selectExamCheckpoint(10)),false);
   if(!old)assert.equal(await p.locator('#labyrinthExamNavigation').count(),0);
   await shot(p,(old?'before':'after')+'-exam-navigation');trace.push(await state(p));
   for(const startRoom of [1,11,21]){for(let n=startRoom;n<startRoom+9;n++){await p.locator(`[data-exam-room="${n}"]`).click();await answer(p,n%2===1);trace.push(await state(p));}await p.locator(`[data-exam-room="${startRoom+9}"]`).focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>selectExamCheckpoint(room)),false);trace.push(await state(p));for(const correct of startRoom===1?[false,true,false]:startRoom===11?[true,false,true]:[true,true,true]){await answer(p,correct);trace.push(await state(p));}await p.locator('#continueBtn').focus();await p.keyboard.press('Enter');trace.push(await state(p));}
   assert.equal(await p.evaluate(()=>totalAttempts),36);await p.getByRole('button',{name:'View Mastery Report',exact:true}).click();trace.push(await state(p));assert.deepEqual(x.errors,[]);runs.push(trace);
  }finally{await x.context.close();}}assert.deepEqual(runs[1],runs[0]);return {statesCompared:runs[0].length,final:runs[1].at(-1)};
 });
}finally{await browser.close();server.close();}
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
