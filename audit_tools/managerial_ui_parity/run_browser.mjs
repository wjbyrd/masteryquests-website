import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(process.argv[2]||'.'),out=path.join(root,'validation_artifacts/managerial_ui_parity');
const results=[],screenshots=[],errors=[];
const server=http.createServer((req,res)=>{
 let p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 try{if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');res.setHeader('content-type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg'})[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',detail:e.stack});}console.log(name+': '+results.at(-1).status);}
async function shot(page,name){const file=name+'.png';await page.screenshot({path:path.join(out,file),fullPage:false});screenshots.push(file);}
async function correct(page){await page.evaluate(async()=>{questionStartTime=Date.now()-6000;for(let i=0;i<currentQuestion.options.length;i++){if(await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}}throw Error('No valid answer');});}
async function wrong(page){await page.evaluate(async()=>{questionStartTime=Date.now()-100;for(let i=0;i<currentQuestion.options.length;i++){if(!await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}}});}
async function launch(page,mode){await page.evaluate(mode=>{closeGameModal();returnToModeSelectFromRun();startSelectedMode(mode);if(mode==='riskReward')launchRiskRewardFromSetup();if(mode==='fadingFortune')launchFadingFortuneFromSetup();},mode);}
async function noOverflow(page){const info=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,wide:[...document.querySelectorAll('body *')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2);}).slice(0,12).map(n=>({tag:n.tagName,id:n.id,cls:n.className,w:n.getBoundingClientRect().width,right:n.getBoundingClientRect().right}))}));assert.ok(info.scroll<=info.width+1,JSON.stringify(info));}
try{
 for(const game of ['cost-directive','market-signal','strategy-desk','agency-protocol']){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});context.setDefaultTimeout(10000);
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push({game,error:e.message}));
  await page.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);await page.waitForFunction(()=>typeof openGameMenu==='function');
  await check(game+' Daily deterministic schedule and graph eligibility',async()=>{
   const data=await page.evaluate(()=>{const d=initializeDailyChallenges();const eligibility=getDailyEligibility();return {daily:d,again:MQDailyChallengesCore.resolveDaily({identity:getDailyQuestIdentity(),date:d.date,eligibleFamilies:eligibility.families,context:eligibility.context}),eligibility};});
   assert.equal(data.daily.id,data.again.id);assert.ok(data.daily.description);if(!data.eligibility.context.graphQuestionCount)assert.ok(!data.eligibility.families.includes('graph_questions'));
   if(game==='cost-directive')assert.equal(data.eligibility.context.graphQuestionCount,0);
  });
  await check(game+' first mode opens correct guide; keyboard Proceed starts once',async()=>{
   await page.evaluate(()=>startSelectedMode('standard'));
   assert.equal(await page.locator('#guideIntroScreen').isVisible(),true);
   assert.equal(await page.locator('#guideIntroImage').getAttribute('src'),await page.locator('#wizardImage').evaluate(n=>n.src));
   assert.equal(await page.locator('#guideIntroProceed').evaluate(n=>n===document.activeElement),true);
   await shot(page,game+'-guide-desktop');await page.keyboard.press('Enter');
   await page.waitForFunction(()=>Boolean(currentQuestion)&&document.getElementById('guideIntroScreen').hidden);
   const state=await page.evaluate(()=>({mode:gameMode,starts:readLocalTelemetry().filter(e=>e.event==='start').length,room,attempts:totalAttempts}));
   assert.equal(state.mode,'standard');assert.equal(state.starts,1);assert.equal(state.room,1);assert.equal(state.attempts,0);
  });
  await check(game+' single Game Menu contains Fullscreen, Sound, Daily; controls work',async()=>{
   assert.equal(await page.locator('.fullscreenBtn').count(),0);assert.equal(await page.locator('#returnMenuBtn').textContent(),'Game Menu');
   await page.locator('#returnMenuBtn').click();assert.equal(await page.locator('#gameMenuFullscreen').isVisible(),true);assert.equal(await page.locator('#gameMenuDaily').isVisible(),true);assert.equal(await page.locator('#gameMenuOptions #soundToggle').count(),1);
   await shot(page,game+'-menu-desktop');
   const prior=await page.evaluate(()=>soundEnabled);await page.locator('#soundToggle').click();assert.notEqual(await page.evaluate(()=>soundEnabled),prior);
   await page.locator('#gameMenuFullscreen').click();await page.waitForFunction(()=>Boolean(document.fullscreenElement));await page.locator('#gameMenuFullscreen').click();await page.waitForFunction(()=>!document.fullscreenElement);
   await page.locator('#gameMenuDaily').click();assert.equal(await page.locator('#dailyDetailsPanel').isVisible(),true);assert.equal(await page.locator('#dailyTaskPill').isVisible(),false);await page.keyboard.press('Escape');
   assert.equal(await page.locator('#dailyDetailsPanel').isVisible(),false);assert.equal(await page.locator('#returnMenuBtn').evaluate(n=>n===document.activeElement),true);
  });
  await check(game+' accepted gameplay progresses Daily and survives navigation/refresh',async()=>{
   const before=await page.evaluate(()=>(dailyState.today.progress.qualifyingQuestions+dailyState.today.progress.postCompletionQuestions));await correct(page);
   assert.equal(await page.evaluate(()=>(dailyState.today.progress.qualifyingQuestions+dailyState.today.progress.postCompletionQuestions)),before+1);
   const state=await page.evaluate(()=>{saveGameState();return {runID,progress:dailyState.today.progress};});
   await page.reload();await page.evaluate(()=>continueSavedRun());
   assert.equal(await page.locator('#guideIntroScreen').isVisible(),false);assert.equal(await page.evaluate(()=>runID),state.runID);assert.deepEqual(await page.evaluate(()=>dailyState.today.progress),state.progress);
  });
  await check(game+' checkpoint reveal uses selected encounter; no early artifact or repeated selection',async()=>{
   await page.evaluate(()=>{closeGameModal();room=9;bossHealth=3;loadQuestion();});
   assert.equal(await page.locator('#bossMessage').innerText(),'');await correct(page);
   // Advance the existing hallway callback immediately for bounded local QA.
   await page.evaluate(()=>{document.getElementById('hallwayTransition')?.classList.remove('active');loadQuestion();});
   assert.equal(await page.locator('#bossRevealScreen').isVisible(),true);
   assert.equal(await page.locator('#bossRevealImage').getAttribute('src'),await page.locator('#question .bossIcon').evaluate(n=>n.src));
   const before=await page.evaluate(()=>({id:currentQuestion.id,pool:bossPool.map(q=>q.id),health:bossHealth,artifacts:Object.values(ARTIFACT_STORAGE_KEYS).map(k=>localStorage.getItem(k)),events:readLocalTelemetry().filter(e=>e.event==='boss_defeated').length}));
   assert.equal(before.health,3);assert.ok(before.artifacts.every(v=>v!=='true'));
   await shot(page,game+'-boss-desktop');await page.keyboard.press('Enter');
   assert.deepEqual(await page.evaluate(()=>({id:currentQuestion.id,pool:bossPool.map(q=>q.id),health:bossHealth})),{id:before.id,pool:before.pool,health:3});
   await correct(page);await page.waitForTimeout(1100);assert.equal(await page.locator('#bossRevealScreen').isVisible(),false);assert.equal(await page.evaluate(()=>bossHealth),2);
   const source=await page.evaluate(()=>{saveGameState();return runID;});await page.reload();await page.evaluate(()=>continueSavedRun());assert.equal(await page.evaluate(()=>runID),source);assert.equal(await page.locator('#bossRevealScreen').isVisible(),false);
   await correct(page);await page.waitForTimeout(1100);await correct(page);
   assert.equal(await page.evaluate(()=>readLocalTelemetry().filter(e=>e.event==='boss_defeated').length),before.events+1);
   assert.equal(await page.evaluate(()=>localStorage.getItem(Object.values(ARTIFACT_STORAGE_KEYS)[0])),'true');
  });
  await check(game+' curated weakness and safe fallback only; selector is read-only',async()=>{
   const data=await page.evaluate(()=>{const before=JSON.stringify(masteryState);const targeted=getBossChallengeLine('cost behavior','targeted-weakness');const generic=getBossChallengeLine('','mixed-non-specific');getBossIntroPresentationState('missing');return {targeted,generic,unchanged:before===JSON.stringify(masteryState)};});
   assert.match(data.targeted,/costs/);assert.ok(data.generic.length>10&&data.generic.length<120);assert.equal(data.unchanged,true);
  });
  for(const mode of ['exam','score','riskReward','timed','legendary','fadingFortune'])await check(game+' mode '+mode+' initializes and accepts gameplay',async()=>{
   await launch(page,mode);assert.equal(await page.evaluate(()=>gameMode),mode);assert.equal(await page.locator('#guideIntroScreen').isVisible(),false);
   if(mode==='riskReward')await page.evaluate(()=>lockRiskRewardWager(.1));
   await page.waitForFunction(()=>!answerSubmissionPending&&!rapidGuessLocked&&Boolean(currentQuestion));
   const before=await page.evaluate(()=>({attempts:totalAttempts,daily:(dailyState.today.progress.qualifyingQuestions+dailyState.today.progress.postCompletionQuestions),score:scoreAttackScore,bank:riskRewardBankroll}));
   await correct(page);assert.equal(await page.evaluate(()=>totalAttempts),before.attempts+1);assert.equal(await page.evaluate(()=>(dailyState.today.progress.qualifyingQuestions+dailyState.today.progress.postCompletionQuestions)),before.daily+1);
   if(mode==='score')assert.ok(await page.evaluate(()=>scoreAttackScore)>before.score);
   if(mode==='riskReward')assert.ok(await page.evaluate(()=>riskRewardBankroll)>before.bank);
  });
  await check(game+' Legendary rapid lockout does not progress Daily or add remediation',async()=>{
   await launch(page,'legendary');const before=await page.evaluate(()=>(dailyState.today.progress.qualifyingQuestions+dailyState.today.progress.postCompletionQuestions));
   for(let i=0;i<5;i++){await wrong(page);if(i<4)await page.evaluate(()=>{closeGameModal();loadQuestion();});}
   const state=await page.evaluate(()=>({attempts:totalAttempts,daily:(dailyState.today.progress.qualifyingQuestions+dailyState.today.progress.postCompletionQuestions),rapid:readLocalTelemetry().filter(e=>e.event==='rapid_guessing').length,repair:remediationState.active}));
   assert.equal(state.rapid,1);assert.equal(state.attempts,4);assert.equal(state.daily,before+4);assert.equal(state.repair,false);
  });
  await check(game+' mobile menu/guide/boss have visible focus and no horizontal overflow',async()=>{
   await page.setViewportSize({width:390,height:844});await launch(page,'standard');
   await page.locator('#returnMenuBtn').click();await noOverflow(page);assert.equal(await page.locator('#gameMenuFullscreen').isVisible(),true);await shot(page,game+'-menu-mobile');
   await page.locator('#gameMenuGuideIntro').click();await noOverflow(page);await shot(page,game+'-guide-mobile');
   const rect=await page.locator('#guideIntroProceed').boundingBox();assert.ok(rect.x>=0&&rect.x+rect.width<=390);await page.keyboard.press('Escape');assert.equal(await page.locator('#guideIntroScreen').isVisible(),false);
   await page.evaluate(()=>{room=20;bossHealth=3;bossPool=[];loadQuestion();});await noOverflow(page);assert.equal(await page.locator('#bossRevealScreen').isVisible(),true);await shot(page,game+'-boss-mobile');
   for(const selector of ['#bossRevealImage','#wizardImage','#question .bossIcon'])assert.match(await page.locator(selector).evaluate(n=>getComputedStyle(n).filter),/rgba\(0, 0, 0, 0.32\)/);
   await page.keyboard.press('Escape');assert.equal(await page.locator('#bossRevealScreen').isVisible(),false);
   await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#wizardImage').evaluate(n=>getComputedStyle(n).animationName),'none');
  });
  await context.close();
 }
 await check('No browser runtime exceptions',()=>assert.deepEqual(errors,[]));
}finally{
 await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));
 const failed=results.filter(r=>r.status==='FAIL');const report={generatedAt:new Date().toISOString(),passed:results.length-failed.length,failed:failed.length,total:results.length,results,screenshots,errors};
 fs.writeFileSync(path.join(out,'browser_results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(failed.length)process.exitCode=1;
}
