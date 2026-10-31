(function(){
'use strict';
const H=window.MQHybridCore,engine=H.wrap(window.MQComposerCore),KEY='mq-hybrid-authoring-v1';
let current=H.fresh(),api=null,ready=false,pendingDraft=null,editing=null,lastRecipe=null,activeStep=1,questionView='shared';
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
  if(current.source!=='own')parts.push(`${supplied} MQ concept${supplied===1?'':'s'}`);
  if(current.source!=='shared')parts.push(`${included.length} of my questions${needsReview?` (${needsReview} need attention)`:''}`);
  $('questionSummaryText').textContent=parts.join(' · ');
  $('questionSummary').hidden=activeStep===1;
}
function stepChanged(step){activeStep=step;if(ready && step!==1){say('');$('projectMenu').open=false;}summary();}
function showQuestionView(view){
  questionView=view;
  const shared=current.source==='shared'||current.source==='mixed'&&view==='shared';
  $('hybridSharedContent').hidden=!shared;
  $('hybridCustomContent').hidden=shared;
  $('questionViews').hidden=current.source!=='mixed';
  document.querySelectorAll('[data-question-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.questionView===(shared?'shared':'own'))));
}
function showMethod(method){
  document.querySelectorAll('[data-method-panel]').forEach(p=>p.hidden=p.dataset.methodPanel!==method);
  document.querySelectorAll('[data-method]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.method===method)));
}
async function commit(message){await engine.prepare(current);render();api.recalculate();save();if(message)say(message);}
function formValues(){return Object.fromEntries(H.FIELDS.map(k=>[k,$('hq-'+k).value]));}
function clearForm(){editing=null;for(const key of H.FIELDS)$('hq-'+key).value='';$('editorTitle').textContent='Write a question';$('saveQuestion').textContent='Add to my questions';}
function openQuestion(id){const details=document.querySelector(`[data-question-details="${id}"]`);if(details)details.open=true;}
function render(){
  const opened=new Set([...document.querySelectorAll('[data-question-details][open]')].map(n=>n.dataset.questionDetails));
  const selected=new Set([...document.querySelectorAll('[data-bulk]:checked')].map(n=>n.dataset.bulk));
  document.querySelectorAll('[name=hybridSource]').forEach(n=>n.checked=n.value===current.source);
  $('sourceHelp').textContent=current.source==='own'?'Write a question or import a bank below. You can use any subject.':current.source==='mixed'?'Choose MQ content and add your questions using the two views below.':'Browse the MQ collection below. You do not need to write any questions.';
  showQuestionView(questionView);
  $('myQuestionsView').textContent=`My questions (${current.questions.length})`;
  $('hybridCount').textContent=`${current.questions.length} saved · ${current.questions.filter(q=>q.included).length} included · ${current.questions.filter(q=>q.included&&!H.issues(q).length).length} reviewed and ready`;
  $('bulkTools').hidden=!current.questions.length;
  $('questionList').innerHTML=current.questions.map((q,i)=>{
    const errors=H.issues(q),status=!q.included?'Excluded':errors.length?'Needs attention':'Reviewed and ready';
    return `<article class="hybrid-card"><label class="hybrid-bulk-choice"><input type="checkbox" data-bulk="${q.id}" ${selected.has(q.id)?'checked':''}> Select question ${i+1}</label><details data-question-details="${q.id}" ${opened.has(q.id)?'open':''}><summary><span class="hybrid-question">${i+1}. ${esc(q.question||'Untitled draft')}</span><span class="hybrid-question-status">${status}</span></summary><div class="hybrid-question-body"><ol type="A">${['A','B','C','D'].map(k=>`<li>${esc(q[k]||'(missing choice)')}</li>`).join('')}</ol><p><strong>Correct answer:</strong> ${esc(q.answer||'Not set')}<br><strong>Explanation:</strong> ${esc(q.explanation||'Not set')}</p><dl class="hybrid-assignments"><div><dt>Topic</dt><dd>${esc(q.topic||'Not set')}</dd></div><div><dt>Learning outcome</dt><dd>${esc(q.outcome||'Not set')}</dd></div><div><dt>Difficulty</dt><dd>${esc(labels[q.difficulty]||'Not set')}</dd></div></dl>${errors.length?`<ul class="hybrid-errors">${errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`:''}<div class="hybrid-actions"><button data-edit="${q.id}">Edit question ${i+1}</button><button data-toggle="${q.id}">${q.included?'Exclude':'Include'} question ${i+1}</button><button data-preview="${q.id}">Try question ${i+1}</button></div><label class="hybrid-review"><input type="checkbox" data-review="${q.id}" ${q.review?'checked':''} ${H.issues(q,false).length?'disabled':''}> I reviewed question ${i+1} for accuracy, clarity, difficulty, and course fit.</label><div data-preview-host="${q.id}"></div></div></details></article>`;
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
  await engine.prepare(next);current=next;questionView=current.source==='own'?'own':'shared';if(api){clearForm();showMethod(null);render();}
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
  $('hybridProjectTools').innerHTML=`<div class="hybrid-project-row"><span id="draftStatus"></span><details id="projectMenu"><summary>Save or open a project</summary><div><button id="saveProject">Save project file</button><label>Open a saved project or Composer recipe <input id="openProject" type="file" accept=".json,application/json"></label><small>A project keeps your editable questions and settings. Save it separately from the student game.</small></div></details></div><div id="draftRecovery" hidden><p>A saved browser draft is available.</p><button id="restoreDraft">Restore browser draft</button><button id="keepNew">Start fresh (replace saved draft)</button><button id="downloadRecovery">Download saved draft</button></div><p id="hybridStatus" role="status" aria-live="polite"></p><div id="questionSummary" hidden><span><strong>Questions</strong> <span id="questionSummaryText"></span></span><button id="editQuestions">Edit questions</button></div>`;
  const shared=$('hybridSharedContent');
  shared.className='hybrid-shared-content';
  $('hybridGuide').innerHTML=`<fieldset class="hybrid-source-picker"><legend id="hybridHeading">1. Choose your question sources</legend><div class="hybrid-source-options"><label><input type="radio" name="hybridSource" value="shared"><span><strong>Mastery Quests questions</strong><small>Browse the ready-to-use economics collection.</small></span></label><label><input type="radio" name="hybridSource" value="own"><span><strong>Only my questions</strong><small>Write or import questions for any subject.</small></span></label><label><input type="radio" name="hybridSource" value="mixed"><span><strong>Combine both</strong><small>Add your questions to selected MQ content.</small></span></label></div><p id="sourceHelp"></p></fieldset>
  <div id="questionViews" class="hybrid-view-switch" role="group" aria-label="Choose which question source to work on" hidden><button data-question-view="shared" aria-controls="hybridSharedContent" aria-pressed="true">Mastery Quests collection</button><button id="myQuestionsView" data-question-view="own" aria-controls="hybridCustomContent" aria-pressed="false">My questions</button></div><div id="sharedContentHost"></div>
  <section id="hybridCustomContent" hidden aria-labelledby="customContentHeading"><h2 id="customContentHeading">2. Write or import your questions</h2><p>Choose a starting point. You can add more questions at any time.</p><div class="hybrid-methods"><button data-method="write" aria-expanded="false" aria-controls="questionEditor"><strong>Write a question</strong><small>Use a guided form.</small></button><button data-method="paste" aria-expanded="false" aria-controls="pastePanel"><strong>Paste questions</strong><small>Use a labeled text example.</small></button><button data-method="csv" aria-expanded="false" aria-controls="csvPanel"><strong>Import a CSV file</strong><small>Use the spreadsheet template.</small></button></div>
  <section id="questionEditor" class="hybrid-method-panel" data-method-panel="write" hidden aria-labelledby="editorTitle"><h3 id="editorTitle">Write a question</h3><p>Four text choices. You can save an incomplete draft and finish it later.</p>${editorFields()}<div class="hybrid-actions"><button id="saveQuestion" class="primary">Add to my questions</button><button id="cancelEdit">Close editor</button></div></section>
  <section id="pastePanel" class="hybrid-method-panel" data-method-panel="paste" hidden aria-labelledby="pasteHeading"><h3 id="pasteHeading">Paste questions</h3><p>Use the labels in the example. Put --- on its own line between questions.</p><details><summary>Show format and example</summary><pre id="pasteExample">${esc(example)}</pre><button id="copyExample">Copy example</button><p>Use these exact labels. Continuation lines belong to the preceding field. Answer: A, B, C, or D. Difficulty: easy, medium, hard, elite, or legendary.</p></details><label for="pasteInput">Question text</label><textarea id="pasteInput" rows="8"></textarea><button id="importPaste" class="primary">Import pasted questions</button><small>Text only; no HTML, images, graphs, or document conversion. Missing fields become drafts.</small></section>
  <section id="csvPanel" class="hybrid-method-panel" data-method-panel="csv" hidden aria-labelledby="csvHeading"><h3 id="csvHeading">Import a CSV file</h3><p>Download the template, fill it in with your spreadsheet app, then save and import it as CSV.</p><button id="csvTemplate">Download CSV template</button><label>Choose your CSV file <input id="csvInput" type="file" accept=".csv,text/csv"></label><details><summary>CSV format and demonstration bank</summary><p>Headers: ${H.FIELDS.join(', ')}. Keep their spelling and capitalization. Quote fields containing commas, quotes, or newlines; double a quote inside a quoted field. Use UTF-8 CSV. Text questions only, with four choices.</p><a href="authoring/hybrid/demo-biology.csv" download>Download a biology demonstration bank</a></details></section>
  <section class="hybrid-review-section" aria-labelledby="reviewHeading"><h2 id="reviewHeading">3. Review and organize your questions</h2><p>Open a question to edit its topic, learning outcome, or difficulty, try it, and confirm your review.</p><p id="hybridCount"></p><details id="bulkTools" class="hybrid-help" hidden><summary>Assign a topic, outcome, or difficulty to several questions</summary><p>Select questions in the list, enter the assignments, then choose Apply. Blank fields keep their current values.</p><div class="hybrid-grid"><label>Topic <input id="bulkTopic" list="topicList" placeholder="e.g., Cell biology"><small>A course unit or subject.</small></label><label>Learning outcome <input id="bulkOutcome" list="outcomeList" placeholder="e.g., Explain membrane transport"><small>What students should be able to do.</small></label><label>Difficulty <select id="bulkDifficulty">${options()}</select><small>Your judgment of the thinking required.</small></label></div><div class="hybrid-actions"><button id="selectAllQuestions">Select all questions</button><button id="applyBulk">Apply to selected questions</button></div></details><div id="questionList"></div><details class="hybrid-help"><summary>What does instructor review confirm?</summary><p>You confirm accuracy, clarity, difficulty, and course fit. Automatic checks only check structure and missing fields. Changes reopen review. Your topics and outcomes stay separate from the MQ collection.</p></details></section></section>
  <div class="hybrid-continue"><span>Your selections are saved as you work. Check game requirements in Readiness.</span><button id="continueComposer" class="primary">Done with questions — continue</button></div><datalist id="topicList"></datalist><datalist id="outcomeList"></datalist>`;
  $('sharedContentHost').append(shared);
  // Validation belongs in the Composer's existing Readiness step, not above every step.
  const readiness=document.createElement('div');readiness.id='hybridReadiness';readiness.className='hybrid-readiness';readiness.hidden=true;
  $('readinessMessage').before(readiness);
  const on=(id,event,fn)=>$(id).addEventListener(event,async e=>{try{await fn(e);}catch(error){say(error.message);}});
  document.querySelectorAll('[name=hybridSource]').forEach(el=>el.addEventListener('change',async()=>{current.source=el.value;questionView=current.source==='own'?'own':'shared';await commit('Question source updated. Your saved questions are preserved.');}));
  document.querySelectorAll('[data-question-view]').forEach(b=>b.onclick=()=>showQuestionView(b.dataset.questionView));
  document.querySelectorAll('[data-method]').forEach(b=>b.onclick=()=>{showMethod(b.dataset.method);if(b.dataset.method==='write')$('hq-question').focus();});
  on('copyExample','click',async()=>{try{await navigator.clipboard.writeText(example);say('Example copied.');}catch{$('pasteInput').value=example;say('Example inserted in the paste box.');}});
  on('importPaste','click',async()=>{const result=H.importPaste($('pasteInput').value);current.questions.push(...result.questions);await commit(`Imported ${result.questions.length} draft(s). ${result.warnings.join('\n')}`);openQuestion(result.questions[0]?.id);});
  on('csvInput','change',async e=>{if(!e.target.files[0])return;const result=H.importCSV(await e.target.files[0].text());current.questions.push(...result.questions);await commit(`Imported ${result.questions.length} draft(s). ${result.warnings.join('\n')}`);openQuestion(result.questions[0]?.id);e.target.value='';});
  on('csvTemplate','click',()=>api.downloadBlob(new Blob([H.FIELDS.join(',')+'\r\n'],{type:'text/csv'}),'hybrid-question-template.csv'));
  on('saveQuestion','click',async()=>{const values=formValues();let id=editing;if(editing)current.questions=current.questions.map(q=>q.id===editing?H.edit(q,values):q);else{const q=H.draft(values);id=q.id;current.questions.push(q);}clearForm();showMethod(null);await commit('Question saved. Open it below to try it and confirm your review.');openQuestion(id);document.querySelector(`[data-question-details="${id}"] > summary`).focus();});
  on('cancelEdit','click',()=>{clearForm();showMethod(null);document.querySelector('[data-method="write"]').focus();});
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
  on('openProject','change',async e=>{if(!e.target.files[0])return;await api.importRecipe(e.target.files[0]);pendingDraft=null;$('draftRecovery').hidden=true;$('projectMenu').open=false;save();say('Project restored with questions, source, reviews, and game settings.');e.target.value='';});
  on('continueComposer','click',()=>{api.switchStep(2);$('gameTitle').focus();});
  on('editQuestions','click',()=>{api.switchStep(1);document.querySelector('[name=hybridSource]:checked').focus();});
  try{pendingDraft=localStorage.getItem(KEY);}catch{say('Browser storage is unavailable. Save a project file to keep your work.');}
  $('draftRecovery').hidden=!pendingDraft;
  on('restoreDraft','click',async()=>{await api.importRecipe(new Blob([pendingDraft],{type:'application/json'}));pendingDraft=null;$('draftRecovery').hidden=true;save();say('Browser draft restored.');});
  on('keepNew','click',()=>{pendingDraft=null;$('draftRecovery').hidden=true;save();say('New project is now the browser draft.');});
  on('downloadRecovery','click',()=>api.downloadBlob(new Blob([pendingDraft],{type:'application/json'}),'recovered-hybrid-project.json'));
  ready=true;render();
}
window.MQHybridUI={engine,project:()=>JSON.parse(JSON.stringify(current)),projectFrom:recipe=>recipe.hybrid||{source:'shared'},acceptRecipe,mount,stepChanged,
  changed(recipe,composition){lastRecipe=recipe;if(!ready)return;const customIssues=composition.errors.filter(e=>e.startsWith('My question '));$('hybridReadiness').hidden=!customIssues.length;$('hybridReadiness').textContent=customIssues.length?'Review your questions before export:\n'+customIssues.join('\n'):'';summary();save();}
};
})();
