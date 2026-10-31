(function(){
'use strict';
const H=window.MQHybridCore,engine=H.wrap(window.MQComposerCore),IS_QUIZ=document.documentElement.dataset.composerWorkflow==='quiz',KEY=IS_QUIZ?'mq-hybrid-quiz-v1':'mq-hybrid-authoring-v1',HANDOFF='mq-hybrid-builder-handoff-v1';
let current=H.fresh(),api=null,ready=false,pendingDraft=null,editing=null,lastRecipe=null,activeStep=1,questionView='shared',projectLoaded=false;
current.quizSelection.enabled=IS_QUIZ;
if(new URLSearchParams(location.search).get('source')==='own'){current.source='own';questionView='own';}
const $=id=>document.getElementById(id),esc=H.escape;
const labels={easy:'Foundational (easy)',medium:'Application (medium)',hard:'Analysis (hard)',elite:'Challenge (elite)',legendary:'Extended challenge (legendary)'};
const sourceLabels={shared:'Mastery Quests questions',own:'My questions',mixed:'Mastery Quests + my questions'};
const example='question: Which organelle contains most DNA in a plant cell?\nA: Nucleus\nB: Cell wall\nC: Vacuole\nD: Ribosome\nanswer: A\nexplanation: The nucleus holds most of the cell’s genetic material.\ntopic: Cell biology\noutcome: Identify the functions of cell structures\ndifficulty: easy';
const options=()=>`<option value="">Choose difficulty</option>${H.LEVELS.map(k=>`<option value="${k}">${labels[k]}</option>`).join('')}`;
function say(message){$('hybridStatus').textContent=message;}
function save(){
  if(!ready || !lastRecipe || pendingDraft)return;
  try{localStorage.setItem(KEY,JSON.stringify({...lastRecipe,hybrid:current}));$('draftStatus').textContent='Draft saved in this browser.';}
  catch(error){$('draftStatus').textContent='Browser storage is unavailable or full. Save a project file to keep your work.';}
}
function summary(){
  if(!ready)return;
  const included=current.questions.filter(q=>q.included),needsReview=included.filter(q=>H.issues(q).length).length;
  const supplied=lastRecipe?.selectedConceptIds?.length||0;
  const parts=[];
  if(current.source!=='own')parts.push(current.quizSelection.enabled?`${current.quizSelection.questionIds.length} selected MQ questions`:`${supplied} MQ concept${supplied===1?'':'s'}`);
  if(current.source!=='shared')parts.push(`${included.length} of my questions${needsReview?` (${needsReview} need attention)`:''}`);
  $('questionSummaryText').textContent=parts.join(' · ');
  $('questionSummary').hidden=activeStep===1;
}
function stepChanged(step){activeStep=step;if(ready && step!==1){say('');$('projectMenu').open=false;}summary();}
function stepFor(requested,previous){
  const step=Math.max(1,Math.min(7,Number(requested))),steps=IS_QUIZ?[1,2,5,6,7]:[1,2,3,4,5,6,7];
  return steps.includes(step)?step:step<previous?[...steps].reverse().find(n=>n<step):steps.find(n=>n>step);
}
function routeImported(recipe){
  if(!recipe||typeof recipe!=='object'||Array.isArray(recipe))throw new Error('Open a saved project or Composer recipe JSON file.');
  const next=recipe.hybrid?H.restore(recipe.hybrid):H.fresh();
  if(next.quizSelection.enabled===IS_QUIZ)return false;
  const target=next.quizSelection.enabled?'quiz':'game';
  // The source draft is left untouched. The target builder imports the original project.
  try{sessionStorage.setItem(HANDOFF,JSON.stringify({target,recipe}));}
  catch{throw new Error(`This project belongs in the ${target==='quiz'?'Quiz':'Game'} Composer. Open that builder from Build options and import the project there; browser transfer is unavailable.`);}
  window.top.location.assign('/build/faculty-build-composer/authoring/hybrid/'+(target==='quiz'?'quiz.html':'')+'#open-project');
  return true;
}
function showQuestionView(view){
  questionView=view;
  const shared=current.source==='shared'||current.source==='mixed'&&view==='shared';
  $('hybridSharedContent').hidden=!shared;
  $('hybridCustomContent').hidden=shared;
  $('questionViews').hidden=current.source!=='mixed';
  document.querySelectorAll('[data-question-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.questionView===(shared?'shared':'own'))));
  window.MQQuizUI?.update(questionView);
}
function showMethod(method){
  document.querySelectorAll('[data-method-panel]').forEach(p=>p.hidden=p.dataset.methodPanel!==method);
  document.querySelectorAll('[data-method]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.method===method)));
}
async function commit(message){await engine.prepare(current);$('reviewStatus').textContent='';render();api.recalculate();save();if(message)say(message);}
function formValues(){return Object.fromEntries(H.FIELDS.map(k=>[k,$('hq-'+k).value]));}
function clearForm(){editing=null;for(const key of H.FIELDS)$('hq-'+key).value='';$('editorTitle').textContent='Write a question';$('saveQuestion').textContent='Add to my questions';}
function openQuestion(id){const details=document.querySelector(`[data-question-details="${id}"]`);if(details)details.open=true;}
async function importQuestions(result){
  current.questions.push(...result.questions);
  await commit(`Imported ${result.questions.length} question(s). ${result.warnings.join('\n')}`);
  const incomplete=result.questions.find(q=>H.issues(q,false).length);
  if(incomplete)openQuestion(incomplete.id);
  else if(!result.warnings.length){showMethod(null);$('reviewAll').focus();}
}
function render(){
  const opened=new Set([...document.querySelectorAll('[data-question-details][open]')].map(n=>n.dataset.questionDetails));
  const selected=new Set([...document.querySelectorAll('[data-bulk]:checked')].map(n=>n.dataset.bulk));
  document.querySelectorAll('[name=hybridSource]').forEach(n=>n.checked=n.value===current.source);
  $('sourceHelp').textContent=current.source==='own'?'Write a question or import a bank below. You can use any subject.':current.source==='mixed'?'Choose MQ content and add your questions using the two views below.':'Browse the MQ collection below. You do not need to write any questions.';
  showQuestionView(questionView);
  $('myQuestionsView').textContent=`My questions (${current.questions.length})`;
  $('hybridCount').textContent=`${current.questions.length} saved · ${current.questions.filter(q=>q.included).length} included · ${current.questions.filter(q=>q.included&&!H.issues(q).length).length} reviewed and ready`;
  $('questionTools').hidden=!current.questions.length;
  $('reviewAll').disabled=!current.questions.some(q=>q.included);
  $('reuseAssignment').hidden=!projectLoaded;
  $('questionList').innerHTML=current.questions.map((q,i)=>{
    const errors=H.issues(q,false),status=!q.included?'Excluded':errors.length?'Incomplete':q.review?'Reviewed':'Needs review';
    return `<article class="hybrid-card"><label class="hybrid-bulk-choice"><input type="checkbox" data-bulk="${q.id}" ${selected.has(q.id)?'checked':''}> Select question ${i+1}</label><div class="hybrid-card-heading"><h3 class="hybrid-question">${i+1}. ${esc(q.question||'Untitled draft')}</h3><span class="hybrid-question-status">${status}</span></div><p class="hybrid-card-meta">${esc(q.topic||'Topic not set')} · ${esc(labels[q.difficulty]||'Difficulty not set')}</p><div class="hybrid-actions hybrid-card-actions"><button data-edit="${q.id}" aria-label="Edit question ${i+1}">Edit</button><button data-preview="${q.id}" aria-label="Try question ${i+1}">Try</button><button data-toggle="${q.id}" aria-label="${q.included?'Exclude':'Include'} question ${i+1}">${q.included?'Exclude':'Include'}</button></div><details data-question-details="${q.id}" ${opened.has(q.id)?'open':''}><summary>Answers and review <span class="screen-reader">for question ${i+1}</span>${errors.length?` · ${errors.length} issue(s) to fix`:''}</summary><div class="hybrid-question-body"><ol type="A">${['A','B','C','D'].map(k=>`<li>${esc(q[k]||'(missing choice)')}</li>`).join('')}</ol><p><strong>Correct answer:</strong> ${esc(q.answer||'Not set')}<br><strong>Explanation:</strong> ${esc(q.explanation||'Not set')}<br><strong>Learning outcome:</strong> ${esc(q.outcome||'Not set')}</p>${errors.length?`<ul class="hybrid-errors">${errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`:''}<label class="hybrid-review"><input type="checkbox" data-review="${q.id}" ${q.review?'checked':''} ${errors.length?'disabled':''}> I reviewed question ${i+1} for accuracy, clarity, difficulty, and course fit.</label></div></details><div data-preview-host="${q.id}"></div></article>`;
  }).join('')||'<p class="hybrid-empty">Your questions will appear here after you write or import them.</p>';
  for(const [id,key] of [['topicList','topic'],['outcomeList','outcome']])$(id).innerHTML=[...new Set(current.questions.map(q=>q[key]).filter(Boolean))].map(v=>`<option value="${esc(v)}"></option>`).join('');
  summary();
}
async function acceptRecipe(recipe){
  if(!recipe || typeof recipe!=='object' || Array.isArray(recipe))throw new Error('Open a saved project or Composer recipe JSON file.');
  const next=recipe.hybrid?H.restore(recipe.hybrid):H.fresh();
  const probe={...recipe,title:recipe.title||'Draft',slug:recipe.slug||'draft',supportedModes:recipe.supportedModes?.length?recipe.supportedModes:['quiz']};
  const errors=window.MQComposerCore.validateRecipeShape(window.MQ_COMPOSER_LIBRARY,probe).filter(e=>e!=='Select at least one concept.');
  if(errors.length)throw new Error(errors.join('\n'));
  await engine.prepare(next);current=next;projectLoaded=true;questionView=current.source==='own'?'own':'shared';if(api){clearForm();showMethod(null);$('assignmentCopyStatus').textContent='';$('reviewStatus').textContent='';render();}
}
function editorFields(){
  const field=(key,label,control,help='')=>`<label>${label}${control}${help?`<small>${help}</small>`:''}</label>`;
  return `${field('question','Question','<textarea id="hq-question" rows="3"></textarea>')}
  <div class="hybrid-grid">${['A','B','C','D'].map(k=>field(k,'Choice '+k,`<input id="hq-${k}">`)).join('')}</div>
  ${field('answer','Correct answer','<select id="hq-answer"><option value="">Not set yet</option>'+['A','B','C','D'].map(v=>`<option>${v}</option>`).join('')+'</select>')}
  ${field('explanation','Explanation','<textarea id="hq-explanation" rows="3"></textarea>','What should a student learn from the feedback?')}
  <h4>Give this question a place in your course</h4><div class="hybrid-grid">
  ${field('topic','Topic','<input id="hq-topic" list="topicList" placeholder="e.g., Cell biology">','A course unit or subject. Type a new topic or reuse one.')}
  ${field('outcome','Learning outcome','<input id="hq-outcome" list="outcomeList" placeholder="e.g., Explain membrane transport">','What should students be able to do?')}
  ${field('difficulty','Difficulty',`<select id="hq-difficulty">${options()}</select>`,'Your judgment of the thinking required; not a measured rating.')}</div>
  <details class="hybrid-help"><summary>What do the difficulty labels mean?</summary><p>Foundational: recall or recognize. Application: use a familiar idea. Analysis: connect ideas or interpret evidence. Challenge and extended challenge: more complex reasoning.</p></details>`;
}
async function mount(hooks){
  api=hooks;
  if(IS_QUIZ)api.quizOnly();
  $('hybridProjectTools').innerHTML=`<div class="hybrid-project-row"><span id="draftStatus"></span><details id="projectMenu"><summary>Save or open a project</summary><div><button id="saveProject">Save project file</button><label>Open a saved project or Composer recipe <input id="openProject" type="file" accept=".json,application/json"></label><small>A project keeps your editable questions and settings. Save it separately from the student game.</small></div></details></div><div id="draftRecovery" hidden><p>A saved browser draft is available.</p><button id="restoreDraft">Restore browser draft</button><button id="keepNew">Start fresh (replace saved draft)</button><button id="downloadRecovery">Download saved draft</button></div><p id="hybridStatus" role="status" aria-live="polite"></p><div id="questionSummary" hidden><span><strong>Questions</strong> <span id="questionSummaryText"></span></span><button id="editQuestions">Edit questions</button></div>`;
  const shared=$('hybridSharedContent');
  shared.className='hybrid-shared-content';
  $('hybridGuide').innerHTML=`<fieldset class="hybrid-source-picker"><legend id="hybridHeading">1. Choose your question sources</legend><div class="hybrid-source-options"><label><input type="radio" name="hybridSource" value="shared"><span><strong>Mastery Quests questions</strong><small>Browse the ready-to-use economics collection.</small></span></label><label><input type="radio" name="hybridSource" value="own"><span><strong>Only my questions</strong><small>Write or import questions for any subject.</small></span></label><label><input type="radio" name="hybridSource" value="mixed"><span><strong>Combine both</strong><small>Add your questions to selected MQ content.</small></span></label></div><p id="sourceHelp"></p></fieldset>
  <div id="questionViews" class="hybrid-view-switch" role="group" aria-label="Choose which question source to work on" hidden><button data-question-view="shared" aria-controls="hybridSharedContent" aria-pressed="true">Mastery Quests collection</button><button id="myQuestionsView" data-question-view="own" aria-controls="hybridCustomContent" aria-pressed="false">My questions</button></div><div id="sharedContentHost"></div>
  <section id="hybridCustomContent" hidden aria-labelledby="customContentHeading"><h2 id="customContentHeading">2. Write or import your questions</h2><p>Choose a starting point. You can add more questions at any time.</p><div class="hybrid-methods"><button data-method="write" aria-expanded="false" aria-controls="questionEditor"><strong>Write a question</strong><small>Use a guided form.</small></button><button data-method="paste" aria-expanded="false" aria-controls="pastePanel"><strong>Paste questions</strong><small>Use a labeled text example.</small></button><button data-method="csv" aria-expanded="false" aria-controls="csvPanel"><strong>Import a CSV file</strong><small>Use the spreadsheet template.</small></button></div>
  <section id="questionEditor" class="hybrid-method-panel" data-method-panel="write" hidden aria-labelledby="editorTitle"><h3 id="editorTitle">Write a question</h3><p>Four text choices. You can save an incomplete draft and finish it later.</p>${editorFields()}<div class="hybrid-actions"><button id="saveQuestion" class="primary">Add to my questions</button><button id="cancelEdit">Close editor</button></div></section>
  <section id="pastePanel" class="hybrid-method-panel" data-method-panel="paste" hidden aria-labelledby="pasteHeading"><h3 id="pasteHeading">Paste questions</h3><p>Use the labels in the example. Put --- on its own line between questions.</p><details><summary>Show format and example</summary><pre id="pasteExample">${esc(example)}</pre><button id="copyExample">Copy example</button><p>Use these exact labels. Continuation lines belong to the preceding field. Answer: A, B, C, or D. Difficulty: easy, medium, hard, elite, or legendary.</p></details><label for="pasteInput">Question text</label><textarea id="pasteInput" rows="8"></textarea><button id="importPaste" class="primary">Import pasted questions</button><small>Text only; no HTML, images, graphs, or document conversion. Missing fields become drafts.</small></section>
  <section id="csvPanel" class="hybrid-method-panel" data-method-panel="csv" hidden aria-labelledby="csvHeading"><h3 id="csvHeading">Import a CSV file</h3><p>Download the template, fill it in with your spreadsheet app, then save and import it as CSV.</p><button id="csvTemplate">Download CSV template</button><label>Choose your CSV file <input id="csvInput" type="file" accept=".csv,text/csv"></label><details><summary>CSV format and demonstration bank</summary><p>Headers: ${H.FIELDS.join(', ')}. Keep their spelling and capitalization. Quote fields containing commas, quotes, or newlines; double a quote inside a quoted field. Use UTF-8 CSV. Text questions only, with four choices.</p><a href="authoring/hybrid/demo-biology.csv" download>Download a biology demonstration bank</a></details></section>
  <section class="hybrid-review-section" aria-labelledby="reviewHeading"><h2 id="reviewHeading">3. Check your question bank</h2><p id="hybridCount"></p><div id="questionTools" hidden><button id="reviewAll" class="primary">Mark all included questions as reviewed</button><p class="hybrid-review-hint">Already reviewed your bank? Confirm accuracy, clarity, difficulty, and course fit with one click. Incomplete questions still need fixes.</p><p id="reviewStatus" role="status" aria-live="polite"></p><div class="hybrid-actions"><button id="toggleBulkTools" aria-expanded="false" aria-controls="bulkTools">Edit several questions</button><button id="toggleAnswers">Show all answers</button></div></div><section id="bulkTools" class="hybrid-help" hidden aria-labelledby="bulkHeading"><h3 id="bulkHeading">Assign topics, outcomes, or difficulty</h3><p>Select questions below. Blank fields keep their current values.</p><div class="hybrid-grid"><label>Topic <input id="bulkTopic" list="topicList" placeholder="e.g., Cell biology"></label><label>Learning outcome <input id="bulkOutcome" list="outcomeList" placeholder="e.g., Explain membrane transport"></label><label>Difficulty <select id="bulkDifficulty">${options()}</select></label></div><div class="hybrid-actions"><button id="selectAllQuestions">Select all questions</button><button id="applyBulk">Apply to selected questions</button></div></section><div id="questionList"></div></section></section>
  <div class="hybrid-continue"><span>Your selections are saved as you work. Check game requirements in Readiness.</span><button id="continueComposer" class="primary">Done with questions — continue</button></div><datalist id="topicList"></datalist><datalist id="outcomeList"></datalist>`;
  $('sharedContentHost').append(shared);
  window.MQQuizUI.mount({isQuiz:()=>IS_QUIZ,project:()=>current,change:async selection=>{current.quizSelection=window.MQQuizSelection.restore({...selection,enabled:IS_QUIZ});await commit();},say});
  // Validation belongs in the Composer's existing Readiness step, not above every step.
  const readiness=document.createElement('div');readiness.id='hybridReadiness';readiness.className='hybrid-readiness';readiness.hidden=true;
  $('readinessMessage').before(readiness);
  const on=(id,event,fn)=>$(id).addEventListener(event,async e=>{try{await fn(e);}catch(error){say(error.message);}});
  document.querySelectorAll('[name=hybridSource]').forEach(el=>el.addEventListener('change',async()=>{current.source=el.value;questionView=current.source==='own'?'own':'shared';await commit('Question source updated. Your saved questions are preserved.');}));
  document.querySelectorAll('[data-question-view]').forEach(b=>b.onclick=()=>showQuestionView(b.dataset.questionView));
  document.querySelectorAll('[data-method]').forEach(b=>b.onclick=()=>{showMethod(b.dataset.method);if(b.dataset.method==='write')$('hq-question').focus();});
  on('copyExample','click',async()=>{try{await navigator.clipboard.writeText(example);say('Example copied.');}catch{$('pasteInput').value=example;say('Example inserted in the paste box.');}});
  on('importPaste','click',async()=>importQuestions(H.importPaste($('pasteInput').value)));
  on('csvInput','change',async e=>{if(!e.target.files[0])return;await importQuestions(H.importCSV(await e.target.files[0].text()));e.target.value='';});
  on('csvTemplate','click',()=>api.downloadBlob(new Blob([H.FIELDS.join(',')+'\r\n'],{type:'text/csv'}),'hybrid-question-template.csv'));
  on('saveQuestion','click',async()=>{const values=formValues();let id=editing;if(editing)current.questions=current.questions.map(q=>q.id===editing?H.edit(q,values):q);else{const q=H.draft(values);id=q.id;current.questions.push(q);}clearForm();showMethod(null);await commit('Question saved. Open it below to try it and confirm your review.');openQuestion(id);document.querySelector(`[data-question-details="${id}"] > summary`).focus();});
  on('cancelEdit','click',()=>{clearForm();showMethod(null);document.querySelector('[data-method="write"]').focus();});
  on('reviewAll','click',async()=>{const result=H.acknowledgeIncluded(current.questions);current.questions=result.questions;await commit();const count=current.questions.filter(q=>q.included&&!H.issues(q).length).length;$('reviewStatus').textContent=result.blocked.length?`${count} reviewed. ${result.blocked.length} incomplete question(s) still need fixes: ${result.blocked.map(q=>q.number).join(', ')}.`:`All ${count} included questions are reviewed. Editing a question will reopen its review.`;if(result.blocked.length)openQuestion(result.blocked[0].id);});
  on('toggleBulkTools','click',()=>{$('bulkTools').hidden=!$('bulkTools').hidden;$('toggleBulkTools').setAttribute('aria-expanded',String(!$('bulkTools').hidden));});
  on('toggleAnswers','click',()=>{const details=[...document.querySelectorAll('[data-question-details]')],open=details.some(n=>!n.open);details.forEach(n=>n.open=open);$('toggleAnswers').textContent=open?'Hide all answers':'Show all answers';});
  $('questionList').addEventListener('toggle',()=>{const details=[...document.querySelectorAll('[data-question-details]')];$('toggleAnswers').textContent=details.length&&details.every(n=>n.open)?'Hide all answers':'Show all answers';},true);
  on('selectAllQuestions','click',()=>document.querySelectorAll('[data-bulk]').forEach(n=>n.checked=true));
  on('applyBulk','click',async()=>{const ids=new Set([...document.querySelectorAll('[data-bulk]:checked')].map(n=>n.dataset.bulk));if(!ids.size)throw new Error('Select at least one question in the list.');const changes={};for(const [k,id] of [['topic','bulkTopic'],['outcome','bulkOutcome'],['difficulty','bulkDifficulty']])if($(id).value.trim())changes[k]=$(id).value;current.questions=current.questions.map(q=>ids.has(q.id)?H.edit(q,changes):q);await commit('Assignments updated. Changed questions need review again.');});
  $('questionList').addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    try{
      const id=b.dataset.edit||b.dataset.toggle||b.dataset.preview,q=current.questions.find(q=>q.id===id);if(!q)return;
      if(b.dataset.edit){editing=id;for(const k of H.FIELDS)$('hq-'+k).value=q[k];showMethod('write');$('editorTitle').textContent='Edit question';$('saveQuestion').textContent='Save changes';$('hq-question').focus();}
      if(b.dataset.toggle){q.included=!q.included;await commit('Inclusion updated. The question remains in your project.');document.querySelector(`[data-toggle="${id}"]`).focus();}
      if(b.dataset.preview){const host=document.querySelector(`[data-preview-host="${id}"]`);host.innerHTML=`<div class="hybrid-preview"><p class="hybrid-question">${esc(q.question||'Question text missing')}</p>${['A','B','C','D'].map(k=>`<button data-answer="${k}">${k}. ${esc(q[k]||'(missing choice)')}</button>`).join('')}<p role="status" aria-live="polite"></p></div>`;host.querySelectorAll('button').forEach(n=>n.onclick=()=>{host.querySelector('[role=status]').textContent=`${!q.answer?'Correct answer is not set.':n.dataset.answer===q.answer?'Correct.':'Try again. Correct answer: '+q.answer+'.'} ${q.explanation||'Explanation is not set.'}`;});host.querySelector('button').focus();}
    }catch(error){say(error.message);}
  });
  $('questionList').addEventListener('change',async e=>{if(!e.target.dataset.review)return;const id=e.target.dataset.review;try{current.questions=current.questions.map(q=>q.id===id?(e.target.checked?H.acknowledge(q):{...q,review:null}):q);await commit('Instructor review updated.');document.querySelector(`[data-review="${id}"]`).focus();}catch(error){say(error.message);}});
  on('saveProject','click',()=>api.downloadBlob(new Blob([JSON.stringify({...api.recipe(),hybrid:current},null,2)],{type:'application/json'}),'hybrid-authoring-project.json'));
  on('openProject','change',async e=>{if(!e.target.files[0])return;if(await api.importRecipe(e.target.files[0])==='redirected')return;pendingDraft=null;$('draftRecovery').hidden=true;$('projectMenu').open=false;save();say('Project restored with questions, source, reviews, and game settings.');e.target.value='';});
  on('continueComposer','click',()=>{api.switchStep(2);$('gameTitle').focus();});
  on('editQuestions','click',()=>{api.switchStep(1);document.querySelector('[name=hybridSource]:checked').focus();});
  try{pendingDraft=localStorage.getItem(KEY);}catch{say('Browser storage is unavailable. Save a project file to keep your work.');}
  $('draftRecovery').hidden=!pendingDraft;
  on('restoreDraft','click',async()=>{if(await api.importRecipe(new Blob([pendingDraft],{type:'application/json'}))==='redirected')return;pendingDraft=null;$('draftRecovery').hidden=true;save();say('Browser draft restored.');});
  on('keepNew','click',()=>{pendingDraft=null;$('draftRecovery').hidden=true;save();say('New project is now the browser draft.');});
  on('downloadRecovery','click',()=>api.downloadBlob(new Blob([pendingDraft],{type:'application/json'}),'recovered-hybrid-project.json'));
  try{
    const transfer=JSON.parse(sessionStorage.getItem(HANDOFF)||'null');
    if(location.hash==='#open-project'&&transfer?.target===(IS_QUIZ?'quiz':'game')){
      // Retain the destination's earlier draft as a downloadable recovery copy.
      if(pendingDraft)sessionStorage.setItem(HANDOFF+'-previous-'+transfer.target,pendingDraft);
      await api.importRecipe(new Blob([JSON.stringify(transfer.recipe)],{type:'application/json'}));
      pendingDraft=null;$('draftRecovery').hidden=true;sessionStorage.removeItem(HANDOFF);
      history.replaceState(null,'',location.pathname+location.search);
      say(`Project opened in the ${IS_QUIZ?'Quiz':'Game'} Composer.`);
    }
    const backup=sessionStorage.getItem(HANDOFF+'-previous-'+(IS_QUIZ?'quiz':'game'));
    if(backup){const button=document.createElement('button');button.textContent='Download earlier browser draft';button.id='downloadEarlierDraft';button.onclick=()=>api.downloadBlob(new Blob([backup],{type:'application/json'}),'earlier-browser-draft.json');document.querySelector('#projectMenu > div').append(button);}
  }catch(error){say('The project could not be opened: '+error.message);}
  ready=true;render();
}
window.MQHybridUI={engine,isQuiz:()=>IS_QUIZ,routeImported,stepFor,project:()=>JSON.parse(JSON.stringify(current)),projectFrom:recipe=>recipe.hybrid||{source:'shared'},acceptRecipe,mount,stepChanged,
  assignmentCopied(){$('assignmentCopyStatus').textContent='Separate assignment created. Update the title and file name above, then save your project.';$('gameTitle').focus();},
  changed(recipe,composition){lastRecipe=recipe;if(!ready)return;const customIssues=current.quizSelection.enabled?composition.errors:composition.errors.filter(e=>e.startsWith('My question '));$('hybridReadiness').hidden=!customIssues.length;$('hybridReadiness').textContent=customIssues.length?'Review your questions before export:\n'+customIssues.join('\n'):'';window.MQQuizUI.update(questionView);summary();save();}
};
})();
