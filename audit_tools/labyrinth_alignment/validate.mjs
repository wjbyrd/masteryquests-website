// Real-browser, local-only Labyrinth regression checks. Generated evidence stays ignored.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
process.env.MQ_A11Y_OUT='tmp/accessibility_cleanup/labyrinth-modernization';
const {pw,serve,isolated,start,scan}=await import('../accessibility_cleanup/support.mjs');
const out=path.resolve(process.env.MQ_A11Y_OUT),file='play/micro-domains/labyrinth-of-choice/index.html';
const baseline=execFileSync('git',['show',`${process.env.MQ_LABYRINTH_BASELINE||'47485dd34788de6f23d0db325801aa7dd4640317'}:${file}`],{encoding:'utf8',maxBuffer:5e6});
const stage=process.argv[2]||'phase1',results=[];
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true});
async function open(old=false,width=1440,extra={}){
 const x=await isolated(browser,origin,{viewport:{width,height:1000},reducedMotion:'reduce',acceptDownloads:true,...extra});
 x.errors=[];x.page.on('pageerror',e=>x.errors.push(e.message));
 await x.page.addInitScript(()=>{let n=16427;Math.random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);});
 await x.page.clock.install({time:new Date('2026-10-23T16:00:00Z')});await x.page.clock.pauseAt(new Date('2026-10-23T16:00:01Z'));
 if(old)await x.page.route('**/'+file,r=>r.fulfill({contentType:'text/html',body:baseline}));
 await x.page.goto(origin+'/'+file);return x;
}
async function shot(p,name){await p.screenshot({path:path.join(out,stage+'-'+name+'.png')});}
async function state(p){return p.evaluate(()=>({q:currentQuestion?.id,options:currentQuestion?.options,difficulty:currentQuestion?.__mqDifficulty,room,attempts:totalAttempts,correct:correctAnswers,streak,maxStreak,bossHealth,bossCheckpoint,remediation:JSON.parse(JSON.stringify(remediationState)),adaptiveMode,conceptMemory,masteryState,score:scoreAttackScore,fading:fadingFortuneScore,bankroll:riskRewardBankroll,events:readLocalTelemetry(runID).map(r=>({event:r.event,q:r.questionID,correct:r.correct,response:r.responseTimeMs,attempt:r.attempt,streak:r.streak,score:r.score})),columns:TELEMETRY_COLUMNS,vault:Object.fromEntries(Object.entries(ARTIFACT_STORAGE_KEYS).map(([k,v])=>[k,localStorage.getItem(v)]))}));}
async function next(p){
 if(await p.locator('.principal-skip-btn').isVisible()){await p.locator('.principal-skip-btn').focus();await p.keyboard.press('Enter');return;}
 for(const id of ['mqFeedbackContinue','gameModalConfirm','continueBtn','guideIntroProceed','bossRevealProceed'])if(await p.locator('#'+id).isVisible()){await p.locator('#'+id).focus();await p.keyboard.press('Enter');await p.clock.runFor(50);await p.waitForTimeout(20);return;}
 await p.clock.runFor(3500);await p.waitForTimeout(20);
}
async function answer(p,want){
 await p.clock.runFor(6500);
 if(await p.evaluate(()=>gameMode==='riskReward'&&!riskRewardWagerLocked))await p.evaluate(()=>lockRiskRewardWager(.1));
 const index=await p.evaluate(async want=>{for(let i=0;i<currentQuestion.options.length;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;throw Error('No matching answer');},want);
 await p.locator('#answers button').nth(index).focus();await p.keyboard.press('Enter');await p.waitForTimeout(30);await p.clock.runFor(2000);await p.waitForTimeout(30);
}
async function check(name,fn){if(process.argv[3]&&!name.includes(process.argv[3]))return;try{const details=await fn();results.push({name,status:'PASS',details});}catch(e){results.push({name,status:'FAIL',error:e.stack});}fs.writeFileSync(path.join(out,stage+(process.argv[3]?'-focused':'')+'-results.json'),JSON.stringify(results,null,2));console.log(name,results.at(-1).status);}
try{
 if(['phase1','phase2'].includes(stage)){
 for(const mode of ['standard','timed','quiz','unlimited','legendary','score','trialGraph','fadingFortune','riskReward',...(stage==='phase1'?['exam']:[])])await check('baseline parity '+mode,async()=>{
  const runs=[];for(const old of [true,false]){const x=await open(old);try{await start(x.page,mode);const snapshots=[await state(x.page)];for(const want of [true,false]){await answer(x.page,want);snapshots.push(await state(x.page));await next(x.page);}assert.deepEqual(x.errors,[]);runs.push(snapshots);}finally{await x.context.close();}}
  assert.deepEqual(runs[1],runs[0]);return {snapshots:runs[1]};
 });
 for(const width of [1440,820,390,320])await check('menu and responsive '+width,async()=>{const x=await open(false,width);try{const p=x.page;await start(p,'unlimited');await shot(p,'question-'+width);assert.equal(await p.locator('.fullscreenBtn').count(),0);assert.equal(await p.locator('#mqUtilityMenu #soundToggle').count(),1);await p.locator('#returnMenuBtn').focus();await p.keyboard.press('Enter');await p.waitForTimeout(50);await shot(p,'menu-'+width);
  for(const key of ['Tab','Tab','Shift+Tab','Tab','Tab','Tab','Tab','Tab','Tab','Shift+Tab']){await p.keyboard.press(key);assert(await p.locator('#gameModal').evaluate(e=>e.contains(document.activeElement)));}
  await p.locator('#soundToggle').focus();await p.keyboard.press(' ');assert.equal(await p.evaluate(()=>soundEnabled),false);assert(await p.evaluate(()=>[bgMusic,bossMusic,finalBossMusic,sfxCorrect,sfxWrong].every(a=>a.muted)));
  await p.locator('#mqMotionControl').focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>localStorage.getItem('mq:accessibility:decorative-motion')),'playing');
  await p.keyboard.press('Escape');await p.waitForTimeout(30);assert.equal(await p.evaluate(()=>document.activeElement.id),'returnMenuBtn');
  await p.evaluate(()=>confirmEndPractice());await p.locator('#gameModalConfirm').focus();await p.keyboard.press('Enter');await p.waitForTimeout(80);await shot(p,'report-'+width);assert(await p.locator('#masteryReportScreen').isVisible());
  const overflow=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,nodes:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&e.getBoundingClientRect().width).slice(0,15).map(e=>({id:e.id,class:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right}))}));assert(overflow.scroll<=overflow.width,JSON.stringify(overflow));
  await p.clock.resume();const a11y=await scan(p);assert.deepEqual(a11y.violations,[]);
  await p.reload();assert.equal(await p.evaluate(()=>soundEnabled),false);assert.equal(await p.evaluate(()=>document.documentElement.classList.contains('mq-motion-paused')),false);
  return {a11y,errors:x.errors};}finally{await x.context.close();}});
 await check('fullscreen supported and unavailable',async()=>{const x=await open();try{const p=x.page;await start(p);await p.locator('#returnMenuBtn').click();const supported=await p.evaluate(()=>document.fullscreenEnabled);if(supported){await p.locator('#labyrinthFullscreen').click();assert(await p.evaluate(()=>Boolean(document.fullscreenElement)));await p.locator('#labyrinthFullscreen').click();assert.equal(await p.evaluate(()=>Boolean(document.fullscreenElement)),false);}await p.evaluate(()=>Object.defineProperty(document,'fullscreenEnabled',{value:false,configurable:true}));await p.keyboard.press('Escape');await p.locator('#returnMenuBtn').click();assert(await p.locator('#labyrinthFullscreen').isDisabled());return {supported,unavailable:await p.locator('#labyrinthFullscreen').innerText()};}finally{await x.context.close();}});
 await check('before screenshots and text enlargement',async()=>{for(const old of [true,false]){const x=await open(old,390);try{const p=x.page;await start(p,'unlimited');await shot(p,(old?'before':'after')+'-mobile');await p.locator('#returnMenuBtn').click();await shot(p,(old?'before':'after')+'-menu');await p.keyboard.press('Escape');await p.evaluate(()=>confirmEndPractice());await p.locator('#gameModalConfirm').click();await p.waitForTimeout(60);await shot(p,(old?'before':'after')+'-report');if(!old){await p.addStyleTag({content:'html {font-size:200%}'});await shot(p,'report-text-200');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}}finally{await x.context.close();}}});
 await check('Standard save resume',async()=>{const x=await open();try{const p=x.page;await start(p);await answer(p,true);await next(p);const before=await state(p);await p.reload();await p.evaluate(()=>continueSavedRun());await p.waitForFunction(()=>!!currentQuestion);const after=await state(p);for(const k of ['q','options','attempts','correct','streak','conceptMemory','masteryState','bossCheckpoint','vault'])assert.deepEqual(after[k],before[k],k);return {before,after};}finally{await x.context.close();}});
 await check('Standard natural bosses failure retry and completion',async()=>{const x=await open();try{const p=x.page;await start(p);const failed=new Set(),encounters=[];for(let i=0;i<85;i++){for(let j=0;j<5;j++){if(await p.evaluate(()=>runEnding))break;if(await p.locator('#answers button').count()===4)break;await next(p);await p.clock.runFor(4000);}if(await p.evaluate(()=>runEnding))break;const before=await state(p);const miss=[10,20,30].includes(before.room)&&!failed.has(before.room);if(miss)failed.add(before.room);await answer(p,!miss);const after=await state(p);if(miss){assert.equal(after.room,before.room-3);assert.deepEqual(after.vault,before.vault);assert.equal(after.bossCheckpoint,before.bossCheckpoint);encounters.push({room:before.room,setback:after.room});}await next(p);}const final=await state(p);assert.equal(failed.size,3);assert.equal(final.events.filter(r=>r.event==='boss_defeated').length,3);assert(final.events.some(r=>r.event==='complete'));await shot(p,'standard-complete');return {encounters,final};}finally{await x.context.close();}});
 }
}finally{await browser.close();server.close();}
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
