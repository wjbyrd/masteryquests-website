import {fs,path,chromium,out,server,origin,games,snap,settle} from './closeout-support.mjs';
const results=[];const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const game of games){
  const probe=await browser.newPage();await probe.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);
  const modes=await probe.evaluate(()=>FACULTY_COMPOSITION_CONFIG.supportedModes);await probe.close();
  for(const mode of modes.filter(x=>x!=='standard'))for(const target of (mode==='quiz'?[5,10,15]:['trialGraph','fadingFortune','riskReward'].includes(mode)?[10,15,20]:[null])){
   const context=await browser.newContext();await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({status:204,body:''}));
   const page=await context.newPage();const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin))missing.push(r.url().replace(origin,''));});
   await page.clock.install();await page.addInitScript(()=>{let n=6655;Math.random=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);});
   await page.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);
   await page.evaluate(({mode,target})=>{
    startSelectedMode(mode);
    if(mode==='quiz'){setQuizQuestionCount(target);launchQuizFromSetup();}
    if(mode==='trialGraph'){setTrialGraphQuestionCount(target);launchTrialGraphFromSetup();}
    if(mode==='fadingFortune'){setFadingFortuneQuestionCount(target);launchFadingFortuneFromSetup();}
    if(mode==='riskReward'){setRiskRewardQuestionCount(target);launchRiskRewardFromSetup();}
   },{mode,target});
   let state=await settle(page);const questions=[];
   for(let i=0;i<150&&!state.ending;i++){
    if(mode==='riskReward')await page.evaluate(()=>{if(!riskRewardWagerLocked)lockRiskRewardWager(.1);});
    const q=await page.evaluate(async()=>{let choice=-1;for(let i=0;i<currentQuestion.options.length;i++)if(await isPublishedAnswerCorrect(currentQuestion,currentQuestion.options[i]))choice=i;return {id:currentQuestion.id,room,choice,target:getTypeTargetMs(currentQuestion.type),pool:currentQuestion.__mqDifficulty};});
    if(q.choice<0)throw Error('Unkeyed selection');questions.push(q);
    await page.clock.fastForward(mode==='fadingFortune'?5000:Math.max(15000,q.target));
    await page.evaluate(async choice=>{await answer(choice);},q.choice);
    if(mode==='exam'&&q.room%10!==0)await page.evaluate(()=>{const section=getExamSectionState(room);if(room===section.end)selectExamCheckpoint(section.boss);else navigateExamRoom(room+1);});
    state=await settle(page);
    if(mode==='unlimited'&&questions.length===40){await page.evaluate(()=>confirmEndPractice());state=await settle(page);}
    if(mode==='timed'&&questions.length===12){await page.clock.fastForward(3600000);state=await settle(page);}
   }
   if(!state.ending)throw Error('Mode did not finish '+JSON.stringify({game,mode,target,state}));
   if(target&&questions.length!==target)throw Error('Wrong limited length '+JSON.stringify({game,mode,target,actual:questions.length}));
   if(target&&new Set(questions.map(q=>q.id)).size!==questions.length)throw Error('Duplicate limited selection '+JSON.stringify({game,mode,target,questions}));
   if(state.completed==='true')throw Error('Optional mode set Standard completion');
   const report=await page.evaluate(()=>({data:getMasteryReportData(),mode:gameMode,text:document.body.innerText,telemetry:readLocalTelemetry()}));
   if(errors.length||missing.length)throw Error('Runtime error '+JSON.stringify({game,mode,errors,missing}));
   results.push({game,mode,target,questions,state,report,errors,missing});fs.writeFileSync(path.join(out,'optional-modes.json'),JSON.stringify(results,null,2));
   console.log(JSON.stringify({game,mode,target,questions:questions.length,completed:state.ending,standardCompleted:state.completed,errors}));await context.close();
  }
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
