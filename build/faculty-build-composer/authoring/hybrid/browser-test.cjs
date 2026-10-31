'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.MQ_PLAYWRIGHT_MODULE||'playwright');
const server=require('./serve.cjs')(),root=path.resolve(__dirname,'../../../..'),out=path.join(root,'tmp/hybrid-composer');
const results=[],errors=[];
function unzip(bytes){const entries=new Map();let i=0;while(bytes.readUInt32LE(i)===0x04034b50){assert.equal(bytes.readUInt16LE(i+8),0);const size=bytes.readUInt32LE(i+18),n=bytes.readUInt16LE(i+26),extra=bytes.readUInt16LE(i+28),start=i+30+n+extra;entries.set(bytes.subarray(i+30,i+30+n).toString(),bytes.subarray(start,start+size).toString());i=start+size;}return entries;}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  let browser;
  try{
    browser=await chromium.launch({headless:true,channel:'msedge'});
    const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
    await page.goto(origin+'/build/faculty-build-composer/authoring/hybrid/');await page.locator('#hybridCount').waitFor();
    await page.locator('[name=hybridSource][value=own]').check();
    assert.equal(await page.locator('[data-step-panel="1"]').isVisible(),false);
    await page.locator('#pasteInput').fill('question: Incomplete biology question\nA: First choice\nanswer: Z\nimage: diagram.png');await page.locator('#importPaste').click();
    await page.waitForFunction(()=>MQHybridUI.project().questions.length===1);
    assert((await page.locator('#hybridStatus').textContent()).includes('unsupported field'));
    assert((await page.locator('#questionList').textContent()).includes('Set the correct answer to A'));
    await page.locator('[data-edit]').click();
    await page.locator('#hq-question').fill('Which cell structure synthesizes proteins?');
    for(const [k,v] of Object.entries({A:'Ribosome',B:'Cell wall',C:'Vacuole',D:'Chromosome',explanation:'Ribosomes assemble proteins.',topic:'Biology',outcome:'Identify cell structures'}))await page.locator('#hq-'+k).fill(v);
    await page.locator('#hq-answer').selectOption('A');await page.locator('#hq-difficulty').selectOption('easy');await page.locator('#saveQuestion').click();
    await page.locator('[data-review]').check();await page.waitForFunction(()=>MQHybridUI.project().questions[0].review!==null);
    await page.locator('[data-preview]').click();await page.locator('[data-answer=A]').click();assert((await page.locator('.hybrid-preview [role=status]').textContent()).includes('Correct.'));
    await page.locator('[data-edit]').click();await page.locator('#hq-explanation').fill('Ribosomes assemble amino acids into proteins.');await page.locator('#saveQuestion').click();
    await page.waitForFunction(()=>MQHybridUI.project().questions[0].review===null);results.push('paste errors, manual completion, preview, explicit review, edit invalidation');
    await page.locator('#selectAllQuestions').click();await page.locator('#bulkTopic').fill('Cell biology');await page.locator('#applyBulk').click();
    await page.waitForFunction(()=>MQHybridUI.project().questions[0].topic==='Cell biology');
    await page.locator('[name=hybridSource][value=shared]').check();assert.equal(await page.locator('[data-edit]').count(),1);
    await page.locator('[name=hybridSource][value=own]').check();
    const before=await page.evaluate(()=>localStorage.getItem('mq-hybrid-authoring-v1'));
    await page.reload();await page.locator('#restoreDraft').waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('mq-hybrid-authoring-v1')),before);
    await page.locator('#restoreDraft').click();await page.waitForFunction(()=>MQHybridUI.project().questions.length===1);results.push('bulk assignment, source preservation, non-destructive browser draft recovery');
    await page.locator('#csvInput').setInputFiles(path.join(__dirname,'demo-biology.csv'));await page.waitForFunction(()=>MQHybridUI.project().questions.length===16);results.push('CSV file import in browser');
    async function openProject(name){await page.locator('#openProject').setInputFiles(path.join(out,name+'-project.json'));await page.waitForFunction(()=>document.getElementById('hybridStatus').textContent.includes('Project restored'));await page.locator('[data-step="7"]').click();await page.waitForFunction(()=>!document.getElementById('downloadPackage').disabled);}
    async function generate(name){const pending=page.waitForEvent('download',{timeout:90000});await page.locator('#downloadPackage').click();const download=await pending;await download.saveAs(path.join(out,name+'.zip'));const entries=unzip(fs.readFileSync(path.join(out,name+'.zip')));assert(!entries.has('composition_recipe.json'));assert(![...entries.values()].some(s=>s.includes('EXCLUDED_SENTINEL')||s.includes('UNFINISHED_SENTINEL')||s.includes('"hybrid":')));const manifest=JSON.parse(entries.get('composition_manifest.json'));assert(manifest.answerVerification.passed);fs.writeFileSync(path.join(out,name+'-download.html'),entries.get(manifest.generatedFilename));return {entries,manifest};}
    await openProject('own');
    const draftDownload=page.waitForEvent('download');await page.locator('#saveProject').click();const saved=await draftDownload;await saved.saveAs(path.join(out,'roundtrip.json'));assert.equal(JSON.parse(fs.readFileSync(path.join(out,'roundtrip.json'))).hybrid.questions.length,16);
    const own=await generate('own');assert.equal(own.manifest.poolCounts.totalCanonical,15);assert.equal(own.manifest.conceptReviewMappedPdfCount,0);results.push('instructor-only ZIP: hashes, no supplied questions, no unrelated reviews, no authoring project or excluded draft');
    const game=await context.newPage();game.on('pageerror',e=>errors.push(e.message));
    await game.goto(origin+'/tmp/hybrid-composer/own-download.html');await game.waitForFunction(()=>globalThis.MQ_BUILD);
    const ownRuntime=await game.evaluate(()=>({count:Object.values(questionBanks).flat().length,custom:Object.values(questionBanks).flat().every(q=>q.source==='instructor-custom'),guard:remediationTransitionAllowed(Object.values(questionBanks).flat()[0]),plan:planRemediation(Object.values(questionBanks).flat()[0],20000)}));assert.deepEqual(ownRuntime,{count:15,custom:true,guard:false,plan:null});
    fs.writeFileSync(path.join(out,'game-controls.txt'),await game.locator('body').innerText());
    await game.screenshot({path:path.join(out,'game-start.png'),fullPage:true});
    // Exercise the actual engine and answer interaction. No production credentials or telemetry.
    await game.locator('#playerNameInput').fill('Hybrid QA');
    await game.locator('#startScreen .start-btn').first().click();
    if(await game.locator('#guideIntroProceed').isVisible())await game.locator('#guideIntroProceed').click();
    await game.locator('[data-mode=quiz]').click();
    await game.locator('#quizQuestionCountSelect').selectOption('5');
    await game.getByRole('button',{name:'Launch Quiz',exact:true}).click();
    if(await game.locator('#guideIntroProceed').isVisible())await game.locator('#guideIntroProceed').click();
    await game.waitForFunction(()=>typeof currentQuestion==='object'&&currentQuestion);
    await game.screenshot({path:path.join(out,'own-question.png'),fullPage:true});
    const played=await game.evaluate(async()=>{const q=currentQuestion;let index=-1;for(let i=0;i<q.options.length;i++){const normalized=normalizeAnswerText(q.options[i]);const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(normalized));const hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');if(hex===q.aHash)index=i;}return {id:q.id,index,buttons:[...document.querySelectorAll('#answers button')].map(b=>b.textContent)};});
    assert(played.id.startsWith('mq-custom:'));assert(played.index>=0);
    await game.locator('#answers button').nth(played.index).click();
    await game.waitForFunction(()=>quizQuestionsCompleted===1);
    await game.locator('#mqFeedbackContinue').waitFor();
    assert((await game.locator('#hallwayText').innerText()).length>20);
    await game.locator('#mqFeedbackContinue').click();await game.waitForFunction(()=>quizQuestionsCompleted===1&&document.querySelectorAll('#answers button:not(:disabled)').length===4);
    results.push('generated instructor-only quiz starts, accepts an answer, shows feedback, and advances');
    await openProject('mixed');const mixed=await generate('mixed');assert(mixed.manifest.poolCounts.totalCanonical>15);assert(mixed.manifest.conceptReviewMappedPdfCount>0);
    await game.goto(origin+'/tmp/hybrid-composer/mixed-download.html');await game.waitForFunction(()=>globalThis.MQ_BUILD);
    assert(await game.evaluate(()=>Object.values(questionBanks).flat().some(q=>q.source==='instructor-custom')&&Object.values(questionBanks).flat().some(q=>q.source!=='instructor-custom')));
    await game.locator('#playerNameInput').fill('Mixed QA');await game.locator('#startScreen .start-btn').first().click();await game.locator('[data-mode=quiz]').click();await game.locator('#quizQuestionCountSelect').selectOption('5');await game.getByRole('button',{name:'Launch Quiz',exact:true}).click();if(await game.locator('#guideIntroProceed').isVisible())await game.locator('#guideIntroProceed').click();await game.waitForFunction(()=>currentQuestion&&currentQuestion.id);await game.locator('#answers button').first().click();await game.waitForFunction(()=>quizQuestionsCompleted===1);results.push('mixed ZIP and runtime contain both selected sources and accept gameplay answers');
    await page.setViewportSize({width:390,height:844});await page.locator('#hybridHeading').scrollIntoViewIfNeeded();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Narrow viewport overflow');
    await page.locator('[name=hybridSource][value=own]').focus();await page.keyboard.press('Space');await page.waitForFunction(()=>MQHybridUI.project().source==='own');await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement!==document.body));
    await page.locator('#hybridHeading').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(out,'composer-mobile.png')});results.push('390px layout, keyboard source selection and focus traversal');
    if(process.env.MQ_AXE_MODULE){
      await page.addScriptTag({path:require.resolve(process.env.MQ_AXE_MODULE)});
      const axe=await page.evaluate(async()=>axe.run(document.querySelector('#hybridGuide'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
      fs.writeFileSync(path.join(out,'axe-results.json'),JSON.stringify(axe.violations,null,2));assert.deepEqual(axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),[]);results.push('automated WCAG A/AA checks on Hybrid guide');
    }
    const publicPage=await context.newPage();publicPage.on('pageerror',e=>errors.push(e.message));await publicPage.goto(origin+'/build/faculty-build-composer/');
    await publicPage.locator('[data-step="7"]').click();
    await publicPage.locator('#importRecipe').setInputFiles({name:'public-recipe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({title:'Public regression',slug:'public-regression',selectedConceptIds:['demand'],supportedModes:['quiz']}))});
    await publicPage.waitForFunction(()=>!document.getElementById('downloadPackage').disabled);
    assert.equal(await publicPage.evaluate(()=>typeof window.MQHybridUI),'undefined');
    const publicDownload=publicPage.waitForEvent('download');await publicPage.locator('#downloadPackage').click();const publicFile=await publicDownload;await publicFile.saveAs(path.join(out,'public-regression.zip'));
    const publicEntries=unzip(fs.readFileSync(path.join(out,'public-regression.zip')));assert(publicEntries.has('composition_recipe.json'));assert(![...publicEntries.values()].some(s=>s.includes('mq-custom:')));results.push('unchanged public Composer imports supplied recipe and generates its original package');
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({passed:results.length,results,errors},null,2));console.log(JSON.stringify({passed:results.length,results},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
