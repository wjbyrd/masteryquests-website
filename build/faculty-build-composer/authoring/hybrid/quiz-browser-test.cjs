'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.MQ_PLAYWRIGHT_MODULE||'playwright'),server=require('./serve.cjs')(),out=path.resolve(__dirname,'../../../../tmp/hybrid-composer');
const checks=[],errors=[],fixture=name=>JSON.parse(fs.readFileSync(path.join(out,name+'-project.json')));
function unzip(bytes){const files=new Map();let i=0;while(bytes.readUInt32LE(i)===0x04034b50){const size=bytes.readUInt32LE(i+18),n=bytes.readUInt16LE(i+26),extra=bytes.readUInt16LE(i+28),start=i+30+n+extra;files.set(bytes.subarray(i+30,i+30+n).toString(),bytes.subarray(start,start+size).toString());i=start+size;}return files;}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;let browser;
  try{
    browser=await chromium.launch({headless:true,channel:'msedge'});const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/build/faculty-build-composer/authoring/hybrid/quiz.html');
    await page.locator('#quizPickerPanel').waitFor({state:'visible'});
    assert(await page.locator('#quizPickerPanel').isVisible());assert.equal(await page.locator('#hybridSharedContent').isVisible(),false);
    assert.equal(await page.locator('#quizPickEnabled').count(),0);assert.equal(await page.locator('[data-step]').count(),5);
    await page.locator('[data-step="2"]').click();assert(await page.locator('#modeOptions [data-mode=quiz]').isChecked());assert.equal(await page.locator('#modeOptions [data-mode=standard]').isVisible(),false);
    await page.locator('#nextStep').click();assert(await page.locator('[data-step-panel="5"]').isVisible());await page.locator('#prevStep').click();assert(await page.locator('[data-step-panel="2"]').isVisible());await page.locator('#editQuestions').click();
    checks.push('dedicated five-step Quiz Composer selects Quiz and skips mode and checkpoint setup in both directions');
    await page.locator('#quizConcept').selectOption('demand');await page.locator('#quizDifficulty').selectOption('easy');
    const ids=fixture('quiz-all').hybrid.quizSelection.questionIds;
    for(const id of ids)await page.locator(`[data-quiz-pick="${id}"]`).check();
    await page.waitForFunction(ids=>JSON.stringify(MQHybridUI.project().quizSelection.questionIds)===JSON.stringify(ids),ids);
    await page.locator('#quizQuestionList details').first().locator('summary').click();await page.waitForFunction(()=>document.querySelector('[data-quiz-answer]').textContent.startsWith('Correct answer:'));
    await page.locator('#quizSearch').fill('no question should match this');assert.equal(await page.locator('[data-quiz-pick]').count(),0);assert.equal(await page.evaluate(()=>MQHybridUI.project().quizSelection.questionIds.length),3);await page.locator('#quizSearch').fill('');
    await page.locator('#quizSelectedOnly').check();assert.equal(await page.locator('[data-quiz-pick]').count(),3);
    await page.locator('#quizPickerHeading').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'quiz-picker-desktop.png')});
    checks.push('concept/difficulty/search filters, explicit selection, selected-only view and verified answer preview');
    await page.goto(origin+'/build/faculty-build-composer/authoring/hybrid/');await page.locator('#draftStatus').waitFor();assert(await page.locator('#hybridSharedContent').isVisible());assert.equal(await page.locator('#quizPickEnabled').count(),0);assert.equal(await page.locator('#quizPickerPanel').count(),0);assert.equal(await page.locator('[data-step]').count(),7);
    await page.goto(origin+'/build/faculty-build-composer/authoring/hybrid/quiz.html');await page.locator('#restoreDraft').click();await page.waitForFunction(()=>MQHybridUI.project().quizSelection.enabled&&MQHybridUI.project().quizSelection.questionIds.length===3);
    assert(await page.locator('#quizPickerPanel').isVisible());checks.push('separate game and Quiz entries preserve Quiz selections through browser draft recovery');
    await page.locator('#quizDelivery').selectOption('sample');await page.locator('#quizSampleCount').fill('4');await page.locator('#quizSampleCount').press('Tab');await page.locator('[data-step="7"]').click();assert(await page.locator('#downloadPackage').isDisabled());await page.locator('[data-step="6"]').click();assert((await page.locator('#hybridReadiness').textContent()).includes('reduce the sample'));await page.locator('#editQuestions').click();await page.locator('#quizDelivery').selectOption('all');
    checks.push('oversized sample blocks generation and explains the exact fix');
    await page.locator('#projectMenu > summary').click();const savedPending=page.waitForEvent('download');await page.locator('#saveProject').click();const saved=await savedPending;await saved.saveAs(path.join(out,'quiz-ui-roundtrip.json'));assert.equal(JSON.parse(fs.readFileSync(path.join(out,'quiz-ui-roundtrip.json'))).hybrid.quizSelection.questionIds.length,3);
    async function openProject(name){await page.locator('[data-step="1"]').click();if(await page.locator('#projectMenu').getAttribute('open')===null)await page.locator('#projectMenu > summary').click();await page.locator('#openProject').setInputFiles(path.join(out,name+'-project.json'));await page.waitForFunction(()=>document.getElementById('hybridStatus').textContent.includes('Project restored'));}
    async function generate(name){await page.locator('[data-step="7"]').click();await page.waitForFunction(()=>!document.getElementById('downloadPackage').disabled);const pending=page.waitForEvent('download',{timeout:90000});await page.locator('#downloadPackage').click();const file=await pending;await file.saveAs(path.join(out,name+'.zip'));const entries=unzip(fs.readFileSync(path.join(out,name+'.zip'))),manifest=JSON.parse(entries.get('composition_manifest.json'));assert(manifest.answerVerification.passed);assert(!entries.has('composition_recipe.json'));fs.writeFileSync(path.join(out,name+'-download.html'),entries.get(manifest.generatedFilename));return manifest;}
    await openProject('quiz-all');const allManifest=await generate('quiz-all');assert.equal(allManifest.poolCounts.totalCanonical,3);
    checks.push('separate project save and exact three-question ZIP with verified hashes');
    async function play(name,expectedIds,expectedCount){
      const game=await context.newPage();game.on('pageerror',e=>errors.push(e.message));await game.goto(origin+'/tmp/hybrid-composer/'+name+'-download.html');await game.waitForFunction(()=>globalThis.MQ_BUILD);
      const runtime=await game.evaluate(()=>({ids:Object.values(questionBanks).flat().map(q=>q.id),policy:FACULTY_COMPOSITION_CONFIG.quizSelection,preflight:validateFacultyMode('quiz')}));
      assert.deepEqual(runtime.ids.slice().sort(),expectedIds.slice().sort());assert(runtime.preflight.ok);assert.equal(runtime.policy.count,expectedCount);
      await game.locator('#playerNameInput').fill('Selected Quiz QA');await game.locator('#startScreen .start-btn').first().click();if(await game.locator('#guideIntroProceed').isVisible())await game.locator('#guideIntroProceed').click();await game.locator('[data-mode=quiz]').click();
      assert(await game.locator('#quizQuestionCountSelect').isDisabled());assert.equal(await game.locator('#quizQuestionCountSelect').inputValue(),String(expectedCount));assert.equal(await game.locator('[data-quiz-count="5"]').isVisible(),false);
      await game.getByRole('button',{name:'Launch Quiz',exact:true}).click();if(await game.locator('#guideIntroProceed').isVisible())await game.locator('#guideIntroProceed').click();
      const seen=[];
      for(let i=0;i<expectedCount;i++){
        await game.waitForFunction(()=>currentQuestion&&document.querySelectorAll('#answers button:not(:disabled)').length===4);
        const answer=await game.evaluate(async()=>{const q=currentQuestion;let index=Number.isInteger(q.a)?q.a:-1;for(let j=0;j<q.options.length;j++){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(normalizeAnswerText(q.options[j]))),hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');if(hex===String(q.aHash||'').replace(/^sha256:/,''))index=j;}return {id:q.id,index};});
        assert(expectedIds.includes(answer.id));assert(!seen.includes(answer.id));seen.push(answer.id);assert(answer.index>=0);
        await game.locator('#answers button').nth(answer.index).click();await game.waitForFunction(n=>quizQuestionsCompleted===n,i+1);await game.locator('#mqFeedbackContinue').click();
      }
      await game.waitForFunction(()=>runEnding===true);await game.screenshot({path:path.join(out,name+'-complete.png')});
      const completion=await game.evaluate(()=>({ending:runEnding,completed:quizQuestionsCompleted,target:quizQuestionTarget,area:document.getElementById('areaDisplay').textContent,body:document.body.innerText}));
      fs.writeFileSync(path.join(out,name+'-completion.json'),JSON.stringify(completion,null,2));
      assert(completion.area.includes(`Complete (${expectedCount}/${expectedCount})`));await game.close();return seen;
    }
    const allSeen=await play('quiz-all',ids,3);assert.deepEqual(allSeen.slice().sort(),ids.slice().sort());checks.push('use-all Quiz completes with every chosen question exactly once and faculty-locked length');
    await openProject('quiz-sample');await generate('quiz-sample');await play('quiz-sample',ids,2);checks.push('sample Quiz completes at faculty-set length using only selected IDs without repeats');
    await openProject('quiz-graph');
    const graphId=fixture('quiz-graph').hybrid.quizSelection.questionIds[0];await page.locator('#quizSelectedOnly').check();await page.locator('#quizConcept').selectOption('');await page.locator('#quizDifficulty').selectOption('');await page.locator(`[data-quiz-details="${graphId}"] > summary`).click();assert(await page.locator('.quiz-graph').isVisible());await page.waitForFunction(()=>document.querySelector('.quiz-graph').naturalWidth>0);
    await generate('quiz-graph');await play('quiz-graph',[graphId],1);checks.push('graph question preview and self-contained one-question Quiz generation/playthrough');
    await openProject('quiz-mixed');const mixed=await generate('quiz-mixed');assert.equal(mixed.poolCounts.totalCanonical,5);const mixedIds=[...ids,...fixture('quiz-mixed').hybrid.questions.filter(q=>q.included).map(q=>'mq-custom:'+fixture('quiz-mixed').hybrid.id+':q:'+q.id)];await play('quiz-mixed',mixedIds,5);checks.push('mixed selected MQ and instructor questions complete together with exclusions respected');
    await openProject('quiz-wide');await generate('quiz-wide');const wide=await context.newPage();await wide.goto(origin+'/tmp/hybrid-composer/quiz-wide-download.html');await wide.waitForFunction(()=>globalThis.MQ_BUILD);assert.equal(await wide.evaluate(()=>normalizeQuizQuestionTarget(1)),16);assert((await wide.evaluate(()=>validateFacultyMode('quiz'))).ok);await wide.close();checks.push('sixteen-question use-all runtime overrides the legacy fifteen-question cap');
    await page.locator('#editQuestions').click();await page.locator('#quizSelectedOnly').check();await page.setViewportSize({width:390,height:844});await page.locator('#quizPickerHeading').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'quiz-picker-mobile.png')});
    await page.locator('#quizSelectedOnly').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#quizSelectedOnly').isChecked(),false);
    if(process.env.MQ_AXE_MODULE){await page.addScriptTag({path:require.resolve(process.env.MQ_AXE_MODULE)});const scan=await page.evaluate(async()=>axe.run(document.querySelector('#hybridGuide'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));fs.writeFileSync(path.join(out,'quiz-axe-results.json'),JSON.stringify(scan.violations,null,2));assert.deepEqual(scan.violations,[]);}
    checks.push('narrow-screen layout, keyboard selection and automated WCAG A/AA checks');
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'quiz-browser-results.json'),JSON.stringify({passed:checks.length,checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,checks},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
