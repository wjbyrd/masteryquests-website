// Actual answer/lifecycle integration, synthetic users, local-only network.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
const out=path.resolve(process.env.AUDIT_OUTPUT_DIR||path.join(root,'_private_course_sources/eco6655/alignment-audit/closeout-2026-09-28'));
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(relative==='/favicon.ico'){res.writeHead(204).end();return;}
 if(!/^\/(play|assets|build)\//.test(relative)){res.writeHead(403).end();return;}
 let file=path.resolve(root,'.'+relative);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.pdf':'application/pdf'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const games=process.env.AUDIT_GAME?[process.env.AUDIT_GAME]:['cost-directive','market-signal','strategy-desk','agency-protocol'];
const profiles=process.env.AUDIT_PROFILES?.split(',')||['steady','fast','mixed','recovery','save-question','save-boss','save-recovery','rapid-recovery'];
const resultFile=path.join(out,'standard-lifecycle.json');
const results=fs.existsSync(resultFile)?JSON.parse(fs.readFileSync(resultFile,'utf8')).filter(r=>!games.includes(r.game)||!profiles.includes(r.profile)):[];let browser;
async function snap(page){return page.evaluate(()=>({room,mode:gameMode,phase:typeof runPhase==='undefined'?null:runPhase,ending:runEnding,attempts:totalAttempts,correct:correctAnswers,question:currentQuestion?.id,pool:currentQuestion?.__mqDifficulty,remediation:{...remediationState},bossHealth,checkpoint:bossCheckpoint,pending:answerSubmissionPending,completed:localStorage.getItem(REALM_COMPLETE_KEY),runID,visibleButtons:[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length&&getComputedStyle(b).visibility!=='hidden').map(b=>({id:b.id,text:b.innerText.slice(0,80),disabled:b.disabled})),storage:Object.fromEntries(Object.entries(localStorage).filter(([k])=>/managerialHub.*(complete|status|started|room)$/.test(k)))}));}
async function settle(page){
 for(let i=0;i<12;i++){
  await page.clock.runFor(4500);
  const action=await page.evaluate(()=>{
   const visible=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none';
   for(const selector of ['#guideIntroProceed','#bossRevealProceed','.principal-begin-btn','#gameModalConfirm','#continueBtn']){const b=document.querySelector(selector);if(visible(b)&&!b.disabled){b.click();return selector;}}
   return null;
  });
  const s=await snap(page);
  if(s.ending)return s;
  if(!action&&s.phase==='question'&&!s.pending)return s;
 }
 return snap(page);
}
try{
 browser=await chromium.launch({channel:'msedge',headless:true});
 for(const game of games)for(const profile of profiles){
  const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
  const external=[];await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin)return r.continue();external.push({url:u.origin+u.pathname,method:r.request().method()});return r.fulfill({status:204,body:''});});
  const page=await context.newPage();const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin))missing.push({url:r.url().replace(origin,''),status:r.status()});});
  await page.clock.install();
  const seed=6655+profiles.indexOf(profile)*31;
  await page.addInitScript(seed=>{let state=seed;Math.random=()=>((state=(Math.imul(1664525,state)+1013904223)>>>0)/4294967296);},seed);
  await page.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);
  await page.evaluate(()=>startSelectedMode('standard'));
  let state=await settle(page);const steps=[];let resumed=null,repairMiss=false,rapidSubmitted=false;const stagesSeen=new Set();let recoveryEntered=false;
  for(let i=0;i<240&&!state.ending;i++){
   if(profile.startsWith('save-')&&!resumed&&((profile==='save-question'&&i===4)||(profile==='save-boss'&&state.room===10&&state.bossHealth===2)||(profile==='save-recovery'&&state.remediation.active))){
    const before=await page.evaluate(()=>{saveGameState();return {room,runID,attempts:totalAttempts,correct:correctAnswers,question:currentQuestion.id,bossHealth,bossPool:bossPool.map(q=>q.id),mastery:JSON.stringify(masteryState),remediation:JSON.stringify(remediationState),completed:localStorage.getItem(REALM_COMPLETE_KEY),saved:JSON.parse(localStorage.getItem(getSaveKey()))};});
    if(before.completed==='true')throw Error('Incomplete run marked complete');
    await page.reload();await page.evaluate(()=>continueSavedRun());
    state=await settle(page);
    const after=await page.evaluate(()=>({room,runID,attempts:totalAttempts,correct:correctAnswers,question:currentQuestion.id,bossHealth,bossPool:bossPool.map(q=>q.id),mastery:JSON.stringify(masteryState),remediation:JSON.stringify(remediationState),completed:localStorage.getItem(REALM_COMPLETE_KEY)}));
    resumed={before,after,pass:['room','runID','attempts','correct','question','bossHealth','bossPool','mastery','remediation'].every(k=>JSON.stringify(before[k])===JSON.stringify(after[k]))};
    if(!resumed.pass)throw Error('Save/resume mismatch '+game+' '+profile+' '+JSON.stringify(resumed));
   }
   if(state.phase!=='question'||state.pending)throw Error('Not ready to answer '+JSON.stringify(state));
   const q=await page.evaluate(async()=>{
    if(!currentQuestion)throw Error('Missing current question');
    let choice=-1;for(let n=0;n<currentQuestion.options.length;n++)if(await isPublishedAnswerCorrect(currentQuestion,currentQuestion.options[n]))choice=n;
    if(choice<0)throw Error('No keyed choice');
    return {id:currentQuestion.id,choice,target:getTypeTargetMs(currentQuestion.type),elapsed:Date.now()-questionStartTime,room,stage:remediationState.active?remediationState.stage:null,boss:currentQuestion.bossStage};
   });
   if(q.stage){stagesSeen.add(q.stage);recoveryEntered=true;}
   let correct=true;
   if(profile==='mixed'&&[2,8,18,30].includes(i))correct=false;
   if(['recovery','save-recovery','rapid-recovery'].includes(profile)&&!recoveryEntered)correct=false;
   if(['recovery','save-recovery'].includes(profile)&&q.stage==='repair'&&!repairMiss){correct=false;repairMiss=true;}
   const rapid=profile==='rapid-recovery'&&!rapidSubmitted;
   if(rapid){
    // Re-present the current item, then immediately miss through the real guard.
    await page.evaluate(async choice=>{displayQuestion();await answer(choice);},(q.choice+1)%4);
    rapidSubmitted=await page.evaluate(()=>rapidGuessWarnings>0);
    if(i>12&&!rapidSubmitted)throw Error('Rapid guard was not exercised');
    state=await settle(page);continue;
   }
   await page.clock.fastForward(Math.max(1,Math.ceil(q.target*(profile==='fast'?.9:1.5)-q.elapsed)));
   const choice=correct?q.choice:(q.choice+1)%4;
   await page.evaluate(async choice=>{await answer(choice);},choice);
   state=await settle(page);steps.push({...q,after:state});
   if(i%60===59)console.log(JSON.stringify({game,profile,step:i,room:state.room,phase:state.phase,attempts:state.attempts}));
  }
  if(state.completed!=='true')throw Error('Campaign did not complete '+game+' '+profile+' '+JSON.stringify(state));
  if(profile.startsWith('save-')&&!resumed)throw Error('Save point not exercised');
  if(['recovery','save-recovery'].includes(profile)&&!['repair','bridge','retest'].every(x=>stagesSeen.has(x)))throw Error('Recovery stages not exercised '+[...stagesSeen]);
  const telemetry=await page.evaluate(()=>readLocalTelemetry());
  await page.evaluate(async()=>{await showMasteryReportScreen();});await page.clock.runFor(100);
  const report=await page.evaluate(()=>({data:getMasteryReportData(),text:document.getElementById('gameBox').innerText,resources:getRecommendedResources(getWeakLearningObjectiveIds(getMasteryReportData())),mastery:masteryState,title:FACULTY_COMPOSITION_CONFIG.title}));
  await page.evaluate(()=>copyMasteryReport());
  const copied=await page.evaluate(()=>navigator.clipboard.readText());
  if(!copied.includes(report.title)||!copied.includes('Mastery Report')||report.data.totalAttempts!==state.attempts||report.data.correctAnswers!==state.correct)throw Error('Report/copy mismatch');
  const paste=await context.newPage();await paste.goto(origin+'/play/managerial-intelligence-directorate/');await paste.setContent('<textarea aria-label="Canvas paste compatibility check"></textarea>');await paste.locator('textarea').focus();await paste.keyboard.press('Control+V');const pasted=await paste.locator('textarea').inputValue();await paste.close();
  if(pasted.replace(/\r\n/g,'\n')!==copied.replace(/\r\n/g,'\n'))throw Error('Plain-text clipboard paste mismatch '+JSON.stringify({copied:copied.length,pasted:pasted.length,firstDifference:[...copied].findIndex((x,i)=>x!==pasted[i])}));
  await page.reload();const completedAfterReload=await page.evaluate(()=>localStorage.getItem(REALM_COMPLETE_KEY));
  if(completedAfterReload!=='true')throw Error('Completion lost after refresh');
  const result={game,profile,seed,state,steps,resumed,stagesSeen:[...stagesSeen],report,copied,pasteVerified:true,completedAfterReload,telemetry,errors,missing,external};results.push(result);
  fs.writeFileSync(path.join(out,'standard-lifecycle.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({game,profile,complete:state.completed,attempts:state.attempts,recovery:[...stagesSeen],resumed:resumed?.pass,errors,missing:missing.length,reportCopied:true}));
  await context.close();
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
