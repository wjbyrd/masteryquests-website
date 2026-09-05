  // Inspect telemetry through transport/storage, never a production debug API.
  const queued=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('anonymousTelemetry:queue:v1')||'[]'));
  const runEvents=async()=>{await page.waitForTimeout(80);const source=await page.evaluate(()=>runID);const all=[...harness.received.values(),...await queued()];return [...new Map(all.filter(e=>e.gameId===game&&e.sourceRunId===String(source)).map(e=>[e.eventId,e])).values()].sort((a,b)=>a.sequenceNumber-b.sequenceNumber);};
  const drain=async()=>{await page.evaluate(()=>window.dispatchEvent(new Event('online')));await page.waitForFunction(()=>JSON.parse(localStorage.getItem('anonymousTelemetry:queue:v1')||'[]').length===0);};
  await check(game+' classroom has no debug API/UI or query switches; fixed real telemetry accepted by Worker',async()=>{
   await drain();const e=await runEvents();assert.ok(e.length>2);assert.ok(e.every(e=>e.synthetic===false&&e.buildId==='managerial-directorate-classroom'&&e.buildVersion==='2026.09.05-classroom1'&&e.schemaVersion===1));
   assert.ok(e.every(e=>e.anonymousClientId&&e.runId&&e.sourceRunId));assert.equal(await page.evaluate(()=>Boolean(window.AnonymousTelemetryPOC)),false);
   assert.equal(await page.locator('#anonymousTelemetryDebug,[data-action="new-run"],[data-action="flush"],[data-action="failure"]').count(),0);
   assert.ok(!/Fresh telemetry run|Flush now|failure simulation|POC debug/.test(await page.locator('body').innerText()));
   assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex,nofollow,noarchive');
   assert.equal(await page.locator('#question .boss-title').evaluate(n=>getComputedStyle(n).textShadow),'none');
   assert.ok(harness.received.size>0);assert.deepEqual(harness.errors,[]);
  });
  await check(game+' offline queue retries normally; refresh preserves mapping and deduplicates lifecycle pause',async()=>{
   harness.setOffline(true);await launch(page,'standard');await correct(page);await page.waitForTimeout(100);
   const prior=await runEvents();const id=prior[0].runId,source=prior[0].sourceRunId,client=prior[0].anonymousClientId;
   await page.evaluate(()=>{saveGameState();Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('pagehide'));});
   assert.equal((await runEvents()).filter(e=>e.eventType==='run_paused').length,1);
   assert.ok((await queued()).length>0);await page.reload();await page.evaluate(()=>continueSavedRun());
   const after=await runEvents();assert.ok(after.some(e=>e.eventType==='run_resumed'));assert.ok(after.every(e=>e.runId===id&&e.sourceRunId===source&&e.anonymousClientId===client));assert.equal(after.filter(e=>e.eventType==='mode_selected').length,1);
   assert.equal(await page.locator('#guideIntroScreen').isVisible(),false);assert.equal(reconstructRun(after).sequence.contiguous,true);
   harness.setOffline(false);await drain();assert.deepEqual(harness.errors,[]);
  });
  await check(game+' boss intro defers question telemetry and checkpoint reward retains ownership semantics',async()=>{
   await launch(page,'standard');const before=await runEvents();
   await page.evaluate(()=>{closeGameModal();room=10;bossHealth=3;bossPool=[];loadQuestion();});
   const selection=await page.evaluate(()=>({q:currentQuestion.id,pool:bossPool.map(q=>q.id)}));
   assert.equal(await page.locator('#bossRevealScreen').isVisible(),true);
   assert.equal((await runEvents()).filter(e=>e.eventType==='boss_question_shown').length,0);
   await page.keyboard.press('Enter');assert.deepEqual(await page.evaluate(()=>({q:currentQuestion.id,pool:bossPool.map(q=>q.id)})),selection);
   assert.equal((await runEvents()).filter(e=>e.eventType==='boss_question_shown').length,1);
   assert.equal((await runEvents()).filter(e=>e.eventType==='artifact_unlocked').length,0);
   await page.evaluate(()=>{saveGameState();});await page.reload();await page.evaluate(()=>continueSavedRun());assert.equal(await page.locator('#bossRevealScreen').isVisible(),false);
   const ownership=await page.evaluate(()=>{const key=Object.keys(ARTIFACT_STORAGE_KEYS)[0],id=localStorage.getItem('anonymousTelemetry:activeRun:v1:'+document.querySelector('[data-game-id]').dataset.gameId),runs=JSON.parse(localStorage.getItem('anonymousTelemetry:runs:v1'));return {current:localStorage.getItem(ARTIFACT_STORAGE_KEYS[key])==='true',baseline:runs[document.querySelector('[data-game-id]').dataset.gameId+':artifacts:'+id][key]};});
   await page.evaluate(()=>{bossHealth=1;});await correct(page);
   const events=await runEvents(),awards=events.filter(e=>e.eventType==='artifact_unlocked');assert.equal(awards.length,1);assert.equal(awards[0].artifactAlreadyOwned,ownership.current);assert.equal(awards[0].artifactOwnedBeforeRun,ownership.baseline);assert.equal(awards[0].artifactNewlyEarned,!ownership.current&&!ownership.baseline);assert.ok(awards[0].artifactName);
   assert.equal(await page.evaluate(key=>localStorage.getItem(ARTIFACT_STORAGE_KEYS[key]),awards[0].artifact),'true');
   await page.evaluate(()=>{const key=Object.keys(ARTIFACT_STORAGE_KEYS)[0];showArtifact(artifacts[key].img,artifacts[key].title,artifacts[key].text);});assert.equal((await runEvents()).filter(e=>e.eventType==='artifact_unlocked').length,1);
   await page.evaluate(()=>unlockArtifact(Object.keys(ARTIFACT_STORAGE_KEYS)[0]));const repeated=(await runEvents()).filter(e=>e.eventType==='artifact_unlocked').at(-1);assert.equal(repeated.artifactAlreadyOwned,true);assert.equal(repeated.artifactNewlyEarned,false);
   // Earlier fresh-context parity checkpoint must have been newly earned.
   const initial=[...harness.received.values(),...await queued()].filter(e=>e.gameId===game&&e.eventType==='artifact_unlocked'&&e.runId!==before[0].runId);
   assert.ok(initial.some(e=>e.artifactAlreadyOwned===false&&e.artifactOwnedBeforeRun===false&&e.artifactNewlyEarned===true));
  });
  await check(game+' actual Standard repair bridge retest and Legendary raw/accepted semantics preserved',async()=>{
   await launch(page,'standard');
   const slowWrong=async()=>page.evaluate(async()=>{questionStartTime=Date.now()-12000;for(let i=0;i<currentQuestion.options.length;i++)if(!await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}});
   await slowWrong();await page.evaluate(()=>{closeGameModal();displayQuestion();});await slowWrong();await page.waitForFunction(()=>remediationState.active&&remediationState.stage==='repair');
   await correct(page);await page.waitForFunction(()=>remediationState.stage==='bridge');await correct(page);await page.waitForFunction(()=>remediationState.stage==='retest');
   const repair=reconstructRun(await runEvents());assert.deepEqual([repair.remediationDetours,repair.bridgeTriggers,repair.retestTriggers],[1,1,1]);
   await launch(page,'legendary');for(let i=0;i<5;i++){await wrong(page);if(i<4)await page.evaluate(()=>{closeGameModal();loadQuestion();});}
   const r=reconstructRun(await runEvents());assert.equal(r.rawAttempts,5);assert.equal(r.acceptedAttempts,4);assert.equal(r.rapidGuessCount,1);assert.deepEqual([r.remediationDetours,r.bridgeTriggers,r.retestTriggers],[0,0,0]);
  });
  await check(game+' completion and Mastery Report remain distinct; timing retains engine units',async()=>{
   await launch(page,'timed');await page.evaluate(()=>{timedModeEndTime=Date.now()-1;updateTimedModeClock();});
   let r=reconstructRun(await runEvents());assert.equal(r.completionStatus,'timed_complete');assert.equal(r.activeGameplayElapsedMs,600000);assert.ok(r.wallClockDurationMs>=0);assert.equal(r.masterySummary,null);
   await page.evaluate(()=>showMasteryReportScreen());await page.waitForTimeout(100);r=reconstructRun(await runEvents());assert.ok(r.masterySummary);assert.equal(r.completionStatus,'timed_complete');
   await drain();
  });
