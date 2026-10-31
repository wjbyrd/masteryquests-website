(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.MQQuizSelection=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const LEVELS=['easy','medium','hard'];
const defaults=()=>({enabled:false,questionIds:[],delivery:'all',count:10});
function restore(value){
  if(value==null)return defaults();
  if(typeof value!=='object'||typeof value.enabled!=='boolean'||!Array.isArray(value.questionIds)||value.questionIds.some(id=>typeof id!=='string'||!id)||new Set(value.questionIds).size!==value.questionIds.length)throw new Error('Invalid Quiz question selection. Keep the original project file.');
  if(!['all','sample'].includes(value.delivery)||!Number.isSafeInteger(value.count)||value.count<1)throw new Error('Choose all questions or a positive whole-number Quiz sample size.');
  return {enabled:value.enabled,questionIds:[...value.questionIds],delivery:value.delivery,count:value.count};
}
const cache=new WeakMap();
function catalog(Base,library){
  if(cache.has(library))return cache.get(library);
  const byId=new Map(),registry=new Map((library.registry?.concepts||[]).map(m=>[m.canonicalConceptId,m]));
  // Prefer the published primary concept when an item also appears in a family/subtopic.
  for(const [conceptId,module] of Object.entries(library.concepts)){
    if(registry.get(conceptId)?.status==='legacy'||module.supplementType)continue;
    for(const [pool,questions] of Object.entries(module.questions||{})){
      for(const q of questions){
        const difficulty=LEVELS.includes(pool)?pool:['calculation','integration'].includes(pool)?q.canonicalDifficulty||q.difficulty:null;
        if(!LEVELS.includes(difficulty)||!Array.isArray(q.options)||q.options.length!==4)continue;
        const id=String(Base.idOf(q));if(!id)continue;
        const existing=byId.get(id);
        if(existing){if(!existing.conceptIds.includes(conceptId))existing.conceptIds.push(conceptId);if(q.primaryConceptId!==conceptId)continue;}
        const image=q.image?String(q.image).replaceAll('\\','/').replace(/^data\//,''):null;
        const question={...q,...(image?{image:image.includes('/')?image:`question-assets/${module.assetConceptId||conceptId}/${image}`}:{})};
        const outcomes=Base.FacultyOutcomes.describe(conceptId).outcomes.filter(outcome=>outcome.skillIds.includes(q.primarySkill)).map(outcome=>outcome.label);
        const publishedLabel=module.objectiveLabels?.[q.objective];
        const outcome=outcomes.join('; ')||(publishedLabel&&publishedLabel!==q.objective?publishedLabel:String(q.primarySkill||'Not specified').replaceAll('_',' '));
        byId.set(id,{id,conceptId,conceptIds:existing?.conceptIds||[conceptId],title:module.title||conceptId,difficulty,question,outcome,module});
      }
    }
  }
  const result=[...byId.values()].sort((a,b)=>a.title.localeCompare(b.title)||LEVELS.indexOf(a.difficulty)-LEVELS.indexOf(b.difficulty)||a.id.localeCompare(b.id));
  cache.set(library,result);return result;
}
function selectInputs(Base,library,recipe){
  const selection=restore(recipe.hybrid.quizSelection),errors=[],byId=new Map(catalog(Base,library).map(q=>[q.id,q]));
  const selected=recipe.hybrid.source==='own'?[]:selection.questionIds.map(id=>{const q=byId.get(id);if(!q)errors.push(`Quiz question ${id} is no longer available. Remove it from your selection and choose a replacement.`);return q;}).filter(Boolean);
  const concepts={...library.concepts},ids=[...new Set(selected.map(q=>q.conceptId))];
  for(const id of ids){
    const original=library.concepts[id],items=selected.filter(q=>q.conceptId===id);
    const assetPaths=new Set(items.filter(q=>q.question.image).map(q=>q.question.image));
    concepts[id]={...original,derivedFromConceptId:null,questions:Object.fromEntries(LEVELS.map(level=>[level,items.filter(q=>q.difficulty===level).map(q=>q.question)])),repairQuestions:[],repairSeedQuestions:[],bridgeQuestions:[],directSkillRepairRoutes:{},microSkillRepairPools:{},skillRepairSeedPools:{},microSkillBridgePools:{},assetMetadata:(original.assetMetadata||[]).filter(a=>assetPaths.has(a.runtimePath))};
  }
  if(recipe.supportedModes?.length!==1||recipe.supportedModes[0]!=='quiz')errors.push('Individual question selection supports Quiz only. Use concept pools for other game modes.');
  if(recipe.hybrid.source!=='shared')for(const [i,q] of recipe.hybrid.questions.entries())if(q.included&&!LEVELS.includes(q.difficulty))errors.push(`My question ${i+1}: handpicked Quiz supports easy, medium, and hard questions. Change its difficulty or exclude it.`);
  return {library:{...library,concepts},recipe:{...recipe,selectedConceptIds:ids,contentScopes:Object.fromEntries(ids.map(id=>[id,{depth:'full'}])),checkpointFocus:Object.fromEntries(Base.CHECKPOINT_ORDER.map(k=>[k,null]))},errors};
}
function applyValidation(Base,composition,selection){
  const questions=LEVELS.flatMap(pool=>composition.banks[pool]||[]),target=selection.delivery==='all'?questions.length:selection.count;
  const issues=[];
  for(const pool of LEVELS)for(const q of composition.banks[pool]||[]){
    const fields=Base.validateFacultyQuestionRecord(q,pool,composition.assets);
    if(fields.length)issues.push({pool,id:Base.idOf(q),issue:fields.join(', ')});
  }
  const requirements=[{pool:'Selected quiz questions',minimum:Math.max(1,target),count:questions.length}],deficiencies=requirements.filter(r=>r.count<r.minimum);
  const mode={mode:'quiz',label:'Quiz — selected questions',requirements,deficiencies,issues,ok:!deficiencies.length&&!issues.length};
  composition.validation={modes:[mode]};
  composition.errors=composition.errors.filter(e=>!e.startsWith('Quiz:')&&!['Select at least one concept.','Select at least one included concept.'].includes(e));
  if(deficiencies.length)composition.errors.push(questions.length?`Quiz: choose at least ${target} questions or reduce the sample size.`:'Quiz: select at least one question.');
  for(const item of issues)composition.errors.push(`Quiz: ${item.id}: ${item.issue}`);
  composition.warnings=composition.warnings.filter(w=>!['repair','bridge'].includes(w.type));
  composition.quizSelection={version:1,delivery:selection.delivery,count:target,questionIds:questions.map(Base.idOf).map(String)};
}
// These functions are injected into the staged game script, sharing its lexical scope.
function mqSelectedQuiz(){return FACULTY_COMPOSITION_CONFIG.quizSelection?.version===1?FACULTY_COMPOSITION_CONFIG.quizSelection:null;}
function mqQuizCandidates(){
  const ids=new Set(mqSelectedQuiz().questionIds);
  return ['easy','medium','hard'].flatMap(pool=>(questionBanks[pool]||[]).filter(q=>ids.has(String(q.id??q.questionId??q.canonicalId))).map(q=>({...q,__mqDifficulty:pool})));
}
function mqSelectQuizQuestion(){
  const used=new Set(quizDeck.filter(Boolean).map(getLimitedRunQuestionId));
  const available=mqQuizCandidates().filter(q=>!used.has(getLimitedRunQuestionId(q)));
  return available.length?available[Math.floor(Math.random()*available.length)]:null;
}
function mqValidateSelectedQuiz(){
  const policy=mqSelectedQuiz(),questions=mqQuizCandidates(),issues=[];
  if(!['all','sample'].includes(policy.delivery)||!Number.isSafeInteger(policy.count)||policy.count<1||policy.count>questions.length)issues.push({pool:'Quiz',id:'—',issue:'Invalid instructor-selected Quiz length.'});
  if(new Set(policy.questionIds).size!==policy.questionIds.length||questions.length!==policy.questionIds.length||new Set(questions.map(getLimitedRunQuestionId)).size!==questions.length)issues.push({pool:'Quiz',id:'—',issue:'Selected questions are missing or duplicated.'});
  if(policy.delivery==='all'&&policy.count!==questions.length)issues.push({pool:'Quiz',id:'—',issue:'Quiz must use every selected question.'});
  for(const q of questions){const fields=validateFacultyQuestion(q,q.__mqDifficulty);if(fields.length)issues.push({pool:'Quiz',id:getLimitedRunQuestionId(q),issue:fields.join(', ')});}
  return {ok:!issues.length,issues};
}
function mqUpdateQuizControls(){
  const policy=mqSelectedQuiz();quizQuestionTarget=policy.count;
  document.getElementById('quizSetupTitle').textContent='Your Quiz';
  document.querySelector('#quizSetupModal .quiz-setup-text').textContent=policy.delivery==='all'?`Your instructor selected ${policy.count} questions. You will answer each one once, in a shuffled order.`:`You will answer ${policy.count} questions sampled from your instructor’s selected bank, without repeats.`;
  const select=document.getElementById('quizQuestionCountSelect');select.replaceChildren(new Option(`${policy.count} question${policy.count===1?'':'s'} — set by your instructor`,String(policy.count)));select.value=String(policy.count);select.disabled=true;
  document.querySelector('#quizSetupModal .quiz-quick-counts').style.display='none';
}
function patchTemplate(template){
  const insert=(anchor,code)=>{if(template.split(anchor).length!==2)throw new Error('Selected Quiz runtime integration changed: '+anchor);template=template.replace(anchor,anchor+'\n'+code);};
  template=template.replace('function normalizeQuizQuestionTarget(value){',[mqSelectedQuiz,mqQuizCandidates,mqSelectQuizQuestion,mqValidateSelectedQuiz,mqUpdateQuizControls].map(fn=>fn.toString()).join('\n')+'\nfunction normalizeQuizQuestionTarget(value){');
  insert('function normalizeQuizQuestionTarget(value){','    if(mqSelectedQuiz())return mqSelectedQuiz().count;');
  insert('function updateQuizCountControls(){','    if(mqSelectedQuiz())return mqUpdateQuizControls();');
  insert('function getQuizCandidates(){','    if(mqSelectedQuiz())return mqQuizCandidates();');
  insert('function selectLimitedRunQuestion(mode, preferredDifficulty = null){','    if(mode === "quiz" && mqSelectedQuiz())return mqSelectQuizQuestion();');
  insert('function validateFacultyMode(mode){','    if(mode === "quiz" && mqSelectedQuiz())return mqValidateSelectedQuiz();');
  // Explain the selected-quiz behavior wherever the engine normally describes its pool sampler.
  if(template.split('adaptiveMode = "quiz-balanced";').length!==2)throw new Error('Selected Quiz sampling label integration changed.');
  return template.replace('adaptiveMode = "quiz-balanced";','adaptiveMode = mqSelectedQuiz() ? "quiz-selected" : "quiz-balanced";');
}
return {LEVELS,defaults,restore,catalog,selectInputs,applyValidation,patchTemplate};
});
