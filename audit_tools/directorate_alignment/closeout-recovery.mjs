// Controlled state fixtures exercise every family through the real answer handler.
// Fresh full campaigns are separately tested by closeout-browser.mjs.
import {fs,path,chromium,out,server,origin,games,snap,settle} from './closeout-support.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true}),results=[];
try{for(const game of games){
 const page=await browser.newPage();await page.clock.install();await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({status:204,body:''}));const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);
 const cases=await page.evaluate(()=>{const by=new Map();for(const pool of ['easy','medium','hard','elite','easyBoss','mediumBoss','finalBoss'])for(const q of questionBanks[pool])if(!by.has(getSkillKey(q)))by.set(getSkillKey(q),{id:q.id,skill:getSkillKey(q),pool,room:({easy:9,medium:19,hard:29,elite:29,easyBoss:10,mediumBoss:20,finalBoss:30})[pool]});return [...by.values()];});
 const runs=[];
 for(const source of cases){
  await page.evaluate(()=>startSelectedMode('standard'));await settle(page);
  for(const history of ['normal','exhausted']){
   await page.evaluate(({source,history})=>{
    room=source.room;currentQuestion=shuffleOptions(questionBanks[source.pool].find(q=>q.id===source.id));currentQuestion.__mqDifficulty=source.pool;
    if(history==='exhausted'){
     for(const [pool,rows] of Object.entries(questionBanks))questionHistory[pool]=rows.map(q=>q.id);
     questionHistory.repair=Object.values(microSkillRepairPools).flat().map(q=>q.id);questionHistory.bridge=Object.values(microSkillBridgePools).flat().map(q=>q.id);
    }
    remediationState=planRemediation(currentQuestion,getTypeTargetMs(currentQuestion.type)*1.5);
    const q=getRemediationQuestion(remediationState);if(!q)throw Error('No repair');currentQuestion=shuffleOptions(q);currentQuestion.__mqDifficulty='repair';displayQuestion();
   },{source,history});
   const steps=[];
   for(const expected of ['repair','repair','bridge','retest']){
    await settle(page);
    const q=await page.evaluate(async()=>{let correct=-1;for(let n=0;n<currentQuestion.options.length;n++)if(await isPublishedAnswerCorrect(currentQuestion,currentQuestion.options[n]))correct=n;return {id:currentQuestion.id,correct,stage:remediationState.stage,skill:getSkillKey(currentQuestion),objective:currentQuestion.objective};});
    if(q.stage!==expected||q.correct<0)throw Error('Recovery stage regression '+JSON.stringify({game,source,history,expected,q}));
    const wrong=steps.length===0;await page.clock.fastForward(60000);await page.evaluate(async c=>{await answer(c);},wrong?(q.correct+1)%4:q.correct);steps.push({...q,correctResponse:!wrong});
   }
   const state=await settle(page);if(state.remediation.active||state.room!==source.room)throw Error('Recovery return failed');
   runs.push({source,history,steps,returnedRoom:state.room});
  }
 }
 if(errors.length)throw Error(JSON.stringify(errors));results.push({game,families:cases.length,runs,errors});fs.writeFileSync(path.join(out,'recovery-lifecycle.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({game,families:cases.length,cycles:runs.length,errors}));await page.close();
}}finally{await browser.close();await new Promise(r=>server.close(r));}
