import {fs,path,chromium,out,server,origin,games,snap,settle} from './closeout-support.mjs';
const results=[];const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext();await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({status:204,body:''}));const page=await context.newPage();await page.clock.install();const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin))missing.push(r.url().replace(origin,''));});
 const completedKeys=[];
 for(const game of games){
  await page.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);await page.evaluate(()=>startSelectedMode('standard'));let state=await settle(page);
  const fresh=await page.evaluate(()=>({attempts:totalAttempts,mastery:masteryState,runID,saveKey:getSaveKey(),storagePrefix:STORAGE_PREFIX,completeKey:REALM_COMPLETE_KEY,startedKey:REALM_STARTED_KEY,roomKey:REALM_ROOM_KEY,statusKey:REALM_STATUS_KEY,completed:localStorage.getItem(REALM_COMPLETE_KEY)}));
  if(fresh.attempts!==0||fresh.mastery.attemptEvidence.length||fresh.completed==='true')throw Error('State leaked into fresh game');
  for(let i=0;i<45&&!state.ending;i++){
   const q=await page.evaluate(async()=>{let choice=-1;for(let n=0;n<currentQuestion.options.length;n++)if(await isPublishedAnswerCorrect(currentQuestion,currentQuestion.options[n]))choice=n;return {choice,target:getTypeTargetMs(currentQuestion.type)};});await page.clock.fastForward(q.target*1.5);await page.evaluate(async c=>{await answer(c);},q.choice);state=await settle(page);
  }
  if(state.completed!=='true'||state.attempts!==36)throw Error('Isolation campaign failed');completedKeys.push(fresh.completeKey);
  const finished=await page.evaluate(()=>({storage:Object.fromEntries(Object.entries(localStorage)),mastery:masteryState,runID}));
  await page.evaluate(()=>{startSelectedMode('quiz');setQuizQuestionCount(5);launchQuizFromSetup();});state=await settle(page);
  for(let i=0;i<5;i++){const choice=await page.evaluate(async()=>{for(let n=0;n<currentQuestion.options.length;n++)if(await isPublishedAnswerCorrect(currentQuestion,currentQuestion.options[n]))return n;});await page.clock.fastForward(60000);await page.evaluate(async c=>{await answer(c);},choice);state=await settle(page);}
  const afterOptional=await page.evaluate(keys=>({keys:keys.map(k=>({key:k,value:localStorage.getItem(k)})),storage:Object.fromEntries(Object.entries(localStorage)),runID}),completedKeys);
  if(afterOptional.keys.some(k=>k.value!=='true'))throw Error('Completion erased by optional mode');
  results.push({game,fresh,finished,afterOptional});console.log(JSON.stringify({game,standard:36,optional:5,priorCompletionsRetained:afterOptional.keys.length}));
 }
 if(new Set(results.map(r=>r.fresh.saveKey)).size!==4||new Set(results.map(r=>r.fresh.runID)).size!==4)throw Error('Save or run collision');
 await page.goto(`${origin}/play/managerial-intelligence-directorate/cost-directive/`);const reopened=await page.evaluate(()=>({complete:localStorage.getItem(REALM_COMPLETE_KEY),status:localStorage.getItem(REALM_STATUS_KEY),room:localStorage.getItem(REALM_ROOM_KEY),saved:hasSavedGame()}));if(reopened.complete!=='true')throw Error('Cost state lost');
 await page.goto(origin+'/play/managerial-intelligence-directorate/');const hub=await page.evaluate(()=>({operations:getSortedOperationKeys().map(key=>({key,completed:isOperationCompleted(key)})),text:document.body.innerText}));if(hub.operations.filter(x=>x.completed).length!==4)throw Error('Hub completion mismatch');
 await page.evaluate(()=>renderArtifactVault());
 const artifactImages=await page.locator('#operationsArtifactVault img').evaluateAll(async images=>{await Promise.all(images.map(i=>i.decode()));return images.map(i=>({src:i.getAttribute('src'),width:i.naturalWidth}));});
 fs.writeFileSync(path.join(out,'state-isolation.json'),JSON.stringify({results,reopened,hub,artifactImages,errors,missing},null,2));if(errors.length||missing.length)throw Error(JSON.stringify({errors,missing}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
