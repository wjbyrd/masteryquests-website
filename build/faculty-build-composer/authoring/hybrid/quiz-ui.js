(function(){
'use strict';
const Q=window.MQQuizSelection,Base=window.MQComposerCore,$=id=>document.getElementById(id);
let hooks,catalog=[],page=0,lastCatalogState='',openIds=new Set();
const PAGE_SIZE=12,answers=new Map(),escape=value=>window.MQHybridCore.escape(value);
function markup(value){
  const parsed=new DOMParser().parseFromString(String(value||''),'text/html');
  const serialize=node=>node.nodeType===3?escape(node.textContent):node.nodeType===1?(['BR','SUP','SUB','EM','STRONG','B','I'].includes(node.tagName)?`<${node.tagName.toLowerCase()}>${[...node.childNodes].map(serialize).join('')}</${node.tagName.toLowerCase()}>`:[...node.childNodes].map(serialize).join('')):'';
  return [...parsed.body.childNodes].map(serialize).join('');
}
function plain(value){return new DOMParser().parseFromString(String(value||''),'text/html').body.textContent||'';}
function selection(){return hooks.project().quizSelection;}
function filtered(){
  const term=$('quizSearch').value.trim().toLowerCase(),concept=$('quizConcept').value,difficulty=$('quizDifficulty').value,selected=new Set(selection().questionIds);
  return catalog.filter(q=>(!concept||q.conceptIds.includes(concept))&&(!difficulty||q.difficulty===difficulty)&&(!$('quizSelectedOnly').checked||selected.has(q.id))&&(!term||q.search.includes(term)));
}
async function showAnswer(id){
  const item=catalog.find(q=>q.id===id);if(!item)return;
  if(!answers.has(id))answers.set(id,(async()=>{
    const q=item.question;
    if(Number.isInteger(q.a)&&q.a>=0&&q.a<4)return q.a;
    const expected=String(q.aHash||'').replace(/^sha256:/i,'').toLowerCase(),matches=[];
    for(let i=0;i<q.options.length;i++)if(await Base.sha256Hex(Base.normalizeAnswerText(q.options[i]))===expected)matches.push(i);
    return matches.length===1?matches[0]:-1;
  })());
  const index=await answers.get(id),host=[...document.querySelectorAll('[data-quiz-answer]')].find(n=>n.dataset.quizAnswer===id);
  if(host)host.textContent=index>=0?`Correct answer: ${'ABCD'[index]}. ${plain(item.question.options[index])}`:'The answer could not be verified. This question will need attention before export.';
}
function renderList(){
  const items=filtered(),selected=new Set(selection().questionIds);page=Math.max(0,Math.min(page,Math.ceil(items.length/PAGE_SIZE)-1));
  const visible=items.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  $('quizResultsCount').textContent=items.length?`${page*PAGE_SIZE+1}–${page*PAGE_SIZE+visible.length} of ${items.length} matching questions`:'No matching questions. Adjust the filters.';
  $('quizPrev').disabled=page===0;$('quizNext').disabled=(page+1)*PAGE_SIZE>=items.length;$('quizSelectPage').disabled=!visible.length;
  $('quizQuestionList').innerHTML=visible.map(item=>{
    const q=item.question,asset=(item.module.assetMetadata||[]).find(a=>a.runtimePath===q.image),image=asset&&/^data\/question-assets\/[\w./-]+$/.test(asset.sourceUrl)?`<img class="quiz-graph" src="${escape(asset.sourceUrl)}" alt="${escape(asset.imageAlt||'Question graph')}"><p class="quiz-graph-description">${escape(asset.graphDescription||'')}</p>`:'';
    return `<article class="quiz-question-card"><label class="quiz-question-pick"><input type="checkbox" data-quiz-pick="${escape(item.id)}" ${selected.has(item.id)?'checked':''}><span>${markup(q.q)}</span></label><p class="quiz-question-meta">${escape(item.title)} · ${escape(item.difficulty)}${q.image?' · Graph question':''}</p><details data-quiz-details="${escape(item.id)}" ${openIds.has(item.id)?'open':''}><summary>View answers and explanation</summary><div class="quiz-answer-body">${image}<ol type="A">${q.options.map(option=>`<li>${markup(option)}</li>`).join('')}</ol><p data-quiz-answer="${escape(item.id)}" role="status">Checking answer…</p><p>${markup(q.feedback)}</p><p><strong>Learning outcome:</strong> ${escape(plain(item.outcome))}</p></div></details></article>`;
  }).join('');
  for(const item of visible)if(openIds.has(item.id))showAnswer(item.id);
}
function update(view){
  if(!hooks)return;
  const p=hooks.project(),s=p.quizSelection,enabled=s.enabled;
  $('quizPickEnabled').checked=enabled;$('quizSettings').hidden=!enabled;
  const shared=p.source==='shared'||p.source==='mixed'&&view==='shared';
  $('quizPickerPanel').hidden=!enabled||!shared;
  $('hybridSharedContent').hidden=enabled||!shared;
  $('quizDelivery').value=s.delivery;$('quizSampleField').hidden=s.delivery!=='sample';$('quizSampleCount').value=s.count;
  const selected=new Set(s.questionIds),mqCount=p.source==='own'?0:catalog.filter(q=>selected.has(q.id)).length,ownCount=p.source==='shared'?0:p.questions.filter(q=>q.included).length;
  $('quizSelectionCount').textContent=`${mqCount} MQ questions + ${ownCount} of your questions = ${mqCount+ownCount} selected`;
  $('quizOwnNote').hidden=p.source==='shared';
  $('quizModesNote').hidden=!enabled;
  document.querySelectorAll('#modeOptions input[data-mode]').forEach(input=>{input.disabled=enabled;input.closest('.mode-option').hidden=enabled&&input.dataset.mode!=='quiz';});
  document.querySelector('#modeOptions [data-mode="quiz"]').closest('.mode-option').querySelector('p').textContent=enabled?'Uses only your selected questions, with the length you set in Questions.':'Fixed-length classroom quiz. Students choose 1–15 questions; faculty-selected concepts stay locked.';
  document.querySelector('[data-step="4"]').hidden=enabled;
  $('quizMissing').innerHTML=p.source!=='own'?s.questionIds.filter(id=>!catalog.some(q=>q.id===id)).map(id=>`<p>Unavailable question: ${escape(id)} <button data-quiz-remove="${escape(id)}">Remove unavailable question</button></p>`).join(''):'';
  const state=JSON.stringify([s.questionIds,p.source]);if(state!==lastCatalogState){lastCatalogState=state;renderList();}
}
async function change(changes){await hooks.change({...selection(),...changes});}
function mount(api){
  hooks=api;catalog=Q.catalog(Base,window.MQ_COMPOSER_LIBRARY).map(q=>({...q,search:plain([q.question.q,...q.question.options,q.title,q.outcome].join(' ')).toLowerCase()}));
  const controls=document.createElement('section');controls.id='quizSelectionControls';controls.className='quiz-selection-controls';
  controls.innerHTML=`<label class="quiz-path"><input id="quizPickEnabled" type="checkbox"> Pick questions for a Quiz</label><p class="quiz-path-help">Choose individual questions and set the quiz length. Leave this off to use concept pools and other game modes.</p><div id="quizSettings" hidden><div class="hybrid-grid"><label>Questions per attempt<select id="quizDelivery"><option value="all">Use every selected question</option><option value="sample">Take a random sample from my selection</option></select></label><label id="quizSampleField" hidden>Sample size<input id="quizSampleCount" type="number" min="1" step="1" value="10"></label></div><p id="quizSelectionCount" role="status"></p><p id="quizOwnNote">Your included questions join this quiz. Use Include/Exclude in My questions to choose them.</p><p class="quiz-path-help">Students answer each question at most once. The order is shuffled, and the length is set by you. Easy, medium, and hard questions can be mixed in any proportion.</p><div id="quizMissing" role="status"></div></div>`;
  document.querySelector('.hybrid-source-picker').after(controls);
  const panel=document.createElement('section');panel.id='quizPickerPanel';panel.hidden=true;panel.setAttribute('aria-labelledby','quizPickerHeading');
  panel.innerHTML=`<h2 id="quizPickerHeading">2. Pick your MQ questions</h2><div class="quiz-filters"><label>Search questions or outcomes<input id="quizSearch" type="search" placeholder="e.g., opportunity cost"></label><label>Concept<select id="quizConcept"><option value="">All concepts</option>${Object.entries(window.MQ_COMPOSER_LIBRARY.concepts).filter(([id])=>catalog.some(q=>q.conceptIds.includes(id))).sort((a,b)=>a[1].title.localeCompare(b[1].title)).map(([id,m])=>`<option value="${escape(id)}">${escape(m.title)}</option>`).join('')}</select></label><label>Difficulty<select id="quizDifficulty"><option value="">All difficulties</option>${Q.LEVELS.map(d=>`<option value="${d}">${d[0].toUpperCase()+d.slice(1)}</option>`).join('')}</select></label></div><div class="quiz-list-tools"><label><input id="quizSelectedOnly" type="checkbox"> Show selected only</label><button id="quizSelectPage">Select this page</button></div><p id="quizResultsCount" role="status"></p><div id="quizQuestionList"></div><div class="hybrid-actions"><button id="quizPrev">Previous questions</button><button id="quizNext">More questions</button></div>`;
  $('sharedContentHost').append(panel);
  const note=document.createElement('p');note.id='quizModesNote';note.hidden=true;note.textContent='Your handpicked questions will run as a Quiz. To use other modes, turn off “Pick questions for a Quiz” in Questions.';$('modeOptions').before(note);
  const on=(id,event,fn)=>$(id).addEventListener(event,async e=>{try{await fn(e);}catch(error){hooks.say(error.message);}});
  on('quizPickEnabled','change',async e=>{if(e.target.checked)hooks.quizOnly();await change({enabled:e.target.checked});hooks.say(e.target.checked?'Quiz selection enabled. Choose your questions below.':'Concept-pool selection restored. Your handpicked list is saved.');});
  on('quizDelivery','change',e=>change({delivery:e.target.value}));
  on('quizSampleCount','change',async e=>{const count=Number(e.target.value);if(!Number.isSafeInteger(count)||count<1){e.target.value=selection().count;throw new Error('Enter a positive whole-number sample size.');}await change({count});});
  for(const id of ['quizSearch','quizConcept','quizDifficulty','quizSelectedOnly'])on(id,id==='quizSearch'?'input':'change',()=>{page=0;renderList();});
  on('quizPrev','click',()=>{page--;renderList();$('quizResultsCount').scrollIntoView({block:'start'});});
  on('quizNext','click',()=>{page++;renderList();$('quizResultsCount').scrollIntoView({block:'start'});});
  on('quizSelectPage','click',()=>change({questionIds:[...new Set([...selection().questionIds,...filtered().slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE).map(q=>q.id)])]}));
  $('quizQuestionList').addEventListener('change',async e=>{const id=e.target.dataset.quizPick;if(!id)return;try{const ids=new Set(selection().questionIds);e.target.checked?ids.add(id):ids.delete(id);await change({questionIds:[...ids]});const next=[...document.querySelectorAll('[data-quiz-pick]')].find(n=>n.dataset.quizPick===id);(next||$('quizSelectedOnly')).focus();}catch(error){hooks.say(error.message);}});
  $('quizQuestionList').addEventListener('toggle',e=>{const id=e.target.dataset.quizDetails;if(!id)return;e.target.open?openIds.add(id):openIds.delete(id);if(e.target.open)showAnswer(id);},true);
  $('quizMissing').addEventListener('click',async e=>{const id=e.target.closest('[data-quiz-remove]')?.dataset.quizRemove;if(id)await change({questionIds:selection().questionIds.filter(q=>q!==id)});});
}
window.MQQuizUI={mount,update};
})();
