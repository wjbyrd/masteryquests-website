import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {games,baselineCommit} from './source.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),out=path.resolve(process.env.MQ_REALM_OUT||path.join(root,'validation_artifacts/economic_realm_engine'));
fs.mkdirSync(out,{recursive:true});
const profiles=JSON.parse(fs.readFileSync('audit_tools/economic_realm_engine/profiles.json','utf8'));
const legacy=Object.fromEntries(games.map(g=>[g,execFileSync('git',['show',`${baselineCommit}:play/economic-realm/${g}/index.html`],{encoding:'utf8',maxBuffer:8e6})]));
const legacyBanks=Object.fromEntries(games.map(g=>[g,execFileSync('git',['show',`${baselineCommit}:play/economic-realm/${g}/${profiles[g].bank}`],{encoding:'utf8',maxBuffer:8e6})]));
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const oldGame=games.find(g=>url.pathname===`/play/economic-realm/${g}/`);
  if(url.searchParams.has('legacy')&&oldGame){res.setHeader('content-type','text/html');res.end(legacy[oldGame].replace(profiles[oldGame].bank,profiles[oldGame].bank+'?legacy=1'));return;}
  const oldBank=games.find(g=>url.pathname===`/play/economic-realm/${g}/${profiles[g].bank}`);
  if(url.searchParams.has('legacy')&&oldBank){res.setHeader('content-type','text/javascript');res.end(legacyBanks[oldBank]);return;}
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('content-type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[],errors=[];
async function check(name,callback){if(process.env.MQ_TEST_FILTER&&!new RegExp(process.env.MQ_TEST_FILTER).test(name))return;try{await callback();results.push({name,passed:true});}catch(e){results.push({name,passed:false,error:e.stack});}console.log(JSON.stringify(results.at(-1)));}
try{
 for(const game of games){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',e=>{errors.push({game,error:e.message});console.log('BROWSER ERROR '+game+': '+e.message);});
  await page.goto(`${origin}/play/economic-realm/${game}/`);
  await check(`${game}: initialized and branded`,async()=>{
    assert.equal(await page.title(),profiles[game].title);
    assert.equal(await page.evaluate(()=>typeof startSelectedMode),'function');
    assert.equal(await page.locator('#wizardName').textContent(),profiles[game].guideName);
  });
  await check(`${game}: all configured modes validate`,async()=>{
    const modes=await page.evaluate(()=>FACULTY_COMPOSITION_CONFIG.supportedModes.map(mode=>({mode,...validateFacultyMode(mode)})));
    assert.deepEqual(modes.filter(m=>!m.ok),[]);
  });
  await check(`${game}: every published question asset decodes`,async()=>{
    const assets=await page.evaluate(async()=>Promise.all(Object.values(embeddedQuestionAssets).map(src=>new Promise(resolve=>{
      const image=new Image();image.onload=()=>resolve({src,ok:image.naturalWidth>0&&image.naturalHeight>0});image.onerror=()=>resolve({src,ok:false});image.src=src;
    }))));
    assert.deepEqual(assets.filter(a=>!a.ok),[]);
  });
  const modes=await page.evaluate(()=>FACULTY_COMPOSITION_CONFIG.supportedModes);
  for(const mode of modes)await check(`${game}: ${mode} launch and answer`,async()=>{
    await page.reload();
    await page.evaluate(mode=>{
      localStorage.setItem(GUIDE_INTRO_SEEN_KEY,'true');
      document.getElementById('playerNameInput').value='Engine QA';username='Engine QA';
      startSelectedMode(mode);
      const launch={quiz:'launchQuizFromSetup',trialGraph:'launchTrialGraphFromSetup',fadingFortune:'launchFadingFortuneFromSetup',riskReward:'launchRiskRewardFromSetup'}[mode];
      if(launch)window[launch]();
      if(mode==='riskReward')lockRiskRewardWager(0.1);
    },mode);
    await page.waitForFunction(()=>currentQuestion&&document.querySelectorAll('#answers button').length===4,{},{timeout:8000});
    const before=await page.evaluate(()=>({q:currentQuestion.id,attempts:totalAttempts}));
    await page.evaluate(async()=>{questionStartTime=Date.now()-6000;for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}throw Error('No correct option');});
    const after=await page.evaluate(()=>({attempts:totalAttempts,question:currentQuestion.id,pending:answerSubmissionPending}));
    if(mode!=='exam')assert.equal(after.attempts,before.attempts+1);
    else assert.equal(after.attempts,0,'Exam drafts must not score');
  });
  await check(`${game}: report and local CSV`,async()=>{
    await page.evaluate(async()=>{beginRunSession();runEnding=true;stopTimedModeClock();await showMasteryReportScreen();});
    assert(await page.locator('#masteryReportScreen').isVisible());
    const download=page.waitForEvent('download');await page.evaluate(()=>downloadTelemetryCsv());
    const file=await download;await file.saveAs(path.join(out,game+'.csv'));
    const csv=fs.readFileSync(path.join(out,game+'.csv'),'utf8');assert(csv.includes('activeResponseTimeMs'));assert(csv.includes('focusLossCount'));
  });
  await check(`${game}: mobile layout`,async()=>{
    await page.setViewportSize({width:390,height:844});await page.reload();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:path.join(out,game+'-mobile.png')});
  });
  await page.setViewportSize({width:1440,height:1000});
  for(const phase of ['ordinary','checkpoint','remediation'])await check(`${game}: legacy ${phase} save resumes exactly`,async()=>{
    await page.goto(`${origin}/play/economic-realm/${game}/?legacy=1`);
    await page.evaluate(()=>localStorage.clear());await page.reload();
    const before=await page.evaluate(({phase,artifactKeys})=>{
      startSelectedMode('standard');
      room=phase==='checkpoint'?10:7;bossHealth=3;bossPool=[];loadQuestion();
      if(phase==='checkpoint'){bossHealth=2;loadQuestion();}
      if(phase==='remediation'){
        remediationState=planRemediation(currentQuestion,20000);
        if(!remediationState?.active)throw Error('No remediation fixture');
        const repair=getRemediationQuestion(remediationState);if(!repair)throw Error('No matching repair');
        currentQuestion=shuffleOptions(repair);displayQuestion();
      }
      localStorage.setItem(artifactKeys[0],'true');saveGameState();
      return {room,runID,q:currentQuestion.id,options:currentQuestion.options,attempts:totalAttempts,bossHealth,remediation:remediationState,save:localStorage.getItem(getSaveKey())};
    },{phase,artifactKeys:profiles[game].artifactKeys});
    await page.goto(`${origin}/play/economic-realm/${game}/`);
    await page.evaluate(()=>continueSavedRun());
    const after=await page.evaluate(()=>({room,runID,q:currentQuestion?.id,options:currentQuestion?.options,attempts:totalAttempts,bossHealth,remediation:remediationState,artifact:localStorage.getItem(ARTIFACT_STORAGE_KEYS.compass),checkpoint:checkpointAttemptState}));
    for(const key of ['room','runID','q','options','attempts','bossHealth','remediation'])assert.deepEqual(after[key],before[key],key);
    assert.equal(after.artifact,'true');
    if(phase==='checkpoint'){assert.equal(after.checkpoint.total,1);assert.equal(after.checkpoint.correct,1);}
  });
  await check(`${game}: first checkpoint miss ends encounter with three-room setback`,async()=>{
    await page.goto(`${origin}/play/economic-realm/${game}/`);await page.evaluate(()=>{
      localStorage.setItem(GUIDE_INTRO_SEEN_KEY,'true');startSelectedMode('standard');
      room=10;bossCheckpoint=1;bossHealth=3;bossPool=[];loadQuestion();if(activeBossReveal)proceedBossReveal();
      Object.keys(TIMING).forEach(k=>TIMING[k]=1);
    });
    const inventory=await page.evaluate(()=>['compass','lens','scales'].map(getArtifactInventoryCount));
    await page.evaluate(async()=>{rapidGuessHistory=[];questionStartTime=Date.now()-10000;for(let i=0;i<4;i++)if(!await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}});
    await page.waitForFunction(()=>lastCheckpointOutcome?.room===10);
    assert.equal(await page.evaluate(()=>remediationState.active),false);
    assert.equal(await page.evaluate(()=>room),7);
    assert.equal(await page.evaluate(()=>bossCheckpoint),1);
    assert.deepEqual(await page.evaluate(()=>['compass','lens','scales'].map(getArtifactInventoryCount)),inventory);
    const outcome=await page.evaluate(()=>lastCheckpointOutcome);
    assert.equal(outcome.total,1);assert.equal(outcome.correct,0);assert.equal(outcome.outcome,'not-secured');
  });
  await check(`${game}: exam revisions score once at section commit`,async()=>{
    await page.goto(`${origin}/play/economic-realm/${game}/`);await page.evaluate(()=>{localStorage.setItem(GUIDE_INTRO_SEEN_KEY,'true');username='Exam QA';startSelectedMode('exam');});
    for(let r=1;r<=9;r++)await page.evaluate(async r=>{navigateExamRoom(r);questionStartTime=Date.now()-6000;for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);break;}},r);
    assert.equal(await page.evaluate(()=>totalAttempts),0);
    await page.evaluate(async()=>{navigateExamRoom(1);for(let i=0;i<4;i++)if(!await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);break;}});
    await page.evaluate(()=>commitExamSection(getExamSectionState(1)));
    assert.equal(await page.evaluate(()=>totalAttempts),9);assert.equal(await page.evaluate(()=>correctAnswers),8);
    await page.evaluate(()=>commitExamSection(getExamSectionState(1)));
    assert.equal(await page.evaluate(()=>totalAttempts),9);
  });
  await check(`${game}: original Realm storage and sound menu`,async()=>{
    const keys=await page.evaluate(()=>{if(activeBossReveal)proceedBossReveal();gameMode='standard';room=8;syncRealmAttemptState();recordRealmCorrectAnswer();recordRealmStreak(4);openGameMenu();return {started:REALM_STARTED_KEY,status:localStorage.getItem(REALM_STATUS_KEY),room:localStorage.getItem(REALM_ROOM_KEY),correct:localStorage.getItem(REALM_TOTAL_CORRECT_KEY)};});
    assert.equal(keys.started,`economicRealm_${profiles[game].key}_started`);assert.equal(keys.status,'contested');assert.equal(keys.room,'8');assert(Number(keys.correct)>0);
    assert(await page.locator('#soundToggle').isVisible());
    await page.screenshot({path:path.join(out,game+'-desktop-menu.png')});
  });
  await context.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
results.push({name:'No browser exceptions',passed:errors.length===0,errors});
fs.writeFileSync(path.join(out,process.env.MQ_TEST_FILTER?'browser-focused-results.json':'browser-results.json'),JSON.stringify({results,errors},null,2));
console.log(JSON.stringify({passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,errors}));
if(results.some(r=>!r.passed))process.exitCode=1;
