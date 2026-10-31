(function(root, factory){
  if(typeof module === 'object' && module.exports) module.exports = factory();
  else root.MQHybridCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
'use strict';
const VERSION = 1;
const FIELDS = ['question','A','B','C','D','answer','explanation','topic','outcome','difficulty'];
const LEVELS = ['easy','medium','hard','elite','legendary'];
const SOURCES = ['shared','own','mixed'];
const clone = value => JSON.parse(JSON.stringify(value));
const uid = () => globalThis.crypto.randomUUID();
const text = value => typeof value === 'string' ? value.trim() : '';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fresh(){return {version:VERSION,id:uid(),source:'shared',questions:[]};}
function signature(q){return JSON.stringify(FIELDS.map(key => text(q[key])));}
function draft(row = {}, used = new Set()){
  let id; do {id = uid();} while(used.has(id));
  return {id,...Object.fromEntries(FIELDS.map(key => [key,text(row[key])])),included:true,review:null};
}
function issues(q, review = true){
  const errors = [];
  if(!text(q.question)) errors.push('Add question text.');
  for(const letter of ['A','B','C','D']) if(!text(q[letter])) errors.push(`Add choice ${letter}.`);
  const norm = v => text(v).normalize('NFKC').toLowerCase().replace(/\s+/g,' ');
  if(new Set(['A','B','C','D'].map(k => norm(q[k]))).size !== 4) errors.push('Use four distinct choices.');
  if(!/^[ABCD]$/.test(q.answer)) errors.push('Set the correct answer to A, B, C, or D.');
  for(const key of ['explanation','topic','outcome']) if(!text(q[key])) errors.push(`Add ${key === 'outcome' ? 'an explicit learning outcome' : key === 'explanation' ? 'an explanation' : 'a topic'}.`);
  if(!LEVELS.includes(q.difficulty)) errors.push('Choose a supported difficulty.');
  if(FIELDS.some(key => /<\/?[a-z][^>]*>|!\[[^\]]*\]\(/i.test(q[key] || ''))) errors.push('Only plain text is supported; remove HTML or embedded media markup.');
  if(review && q.review?.signature !== signature(q)) errors.push('Confirm instructor review after completing the question.');
  return errors;
}
function edit(q, changes){
  const next = {...q,...Object.fromEntries(FIELDS.filter(k => k in changes).map(k => [k,text(changes[k])]))};
  if(signature(next) !== signature(q)) next.review = null;
  return next;
}
function acknowledge(q){
  const errors = issues(q,false);
  if(errors.length) throw new Error(errors.join(' '));
  return {...q,review:{signature:signature(q),at:new Date().toISOString()}};
}
function acknowledgeIncluded(questions){
  let reviewedCount=0;const blocked=[];
  const next=questions.map((q,index)=>{
    if(!q.included)return q;
    const errors=issues(q,false);
    if(errors.length){blocked.push({id:q.id,number:index+1,issues:errors});return q;}
    if(q.review?.signature===signature(q))return q;
    reviewedCount++;return acknowledge(q);
  });
  return {questions:next,reviewedCount,blocked};
}
function restore(value){
  if(!value || value.version !== VERSION) throw new Error('Unsupported Hybrid project version. Keep the original file.');
  if(!SOURCES.includes(value.source) || !Array.isArray(value.questions)) throw new Error('Invalid project source or question list.');
  const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
  if(!uuid.test(value.id)) throw new Error('Invalid project identity. Keep the original file.');
  const used = new Set();
  const questions = value.questions.map((raw,index) => {
    if(!raw || typeof raw !== 'object') throw new Error(`Question ${index+1} is not a question record.`);
    if(!uuid.test(raw.id) || used.has(raw.id)) throw new Error(`Question ${index+1} has a missing or duplicate identity. Import its text as a new draft.`);
    used.add(raw.id);
    const q = {id:raw.id,...Object.fromEntries(FIELDS.map(k => [k,text(raw[k])])),included:raw.included !== false,review:null};
    if(raw.review?.signature === signature(q) && typeof raw.review.at === 'string' && !issues(q,false).length) q.review = clone(raw.review);
    return q;
  });
  return {version:VERSION,id:value.id,source:value.source,questions};
}
// RFC 4180-style quoted fields, including embedded newlines and CRLF/CR/LF.
function csvRows(input){
  input = String(input).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const rows = []; let row = [], cell = '', quoted = false, closed = false;
  for(let i=0;i<input.length;i++){
    const c = input[i];
    if(quoted){if(c === '"'){if(input[i+1] === '"'){cell += '"';i++;}else{quoted=false;closed=true;}}else cell+=c;}
    else if(c === ',' || c === '\n'){row.push(cell);cell='';closed=false;if(c === '\n'){rows.push(row);row=[];}}
    else if(c === '"' && !cell && !closed) quoted=true;
    else {if(closed) throw new Error('CSV has text after a closing quote. Use doubled quotes inside a quoted field.');cell+=c;}
  }
  if(quoted) throw new Error('CSV has an unclosed quoted field. Close its quote; your original input is preserved.');
  if(cell || row.length || closed){row.push(cell);rows.push(row);}
  return rows.filter(r => r.some(v => v.trim()));
}
function importCSV(input){
  const rows = csvRows(input);
  if(!rows.length) throw new Error('Paste CSV with the template header and at least one question row.');
  const headers = rows.shift().map(text);
  const unknown = headers.filter(h => !FIELDS.includes(h));
  if(unknown.length) throw new Error('Unsupported CSV column(s): '+unknown.join(', ')+'. Use the downloadable template.');
  if(new Set(headers).size !== headers.length) throw new Error('CSV column names must not repeat.');
  if(!headers.includes('question')) throw new Error('CSV needs a question column. Other missing columns become draft fields.');
  const warnings = [];
  const questions = rows.map((row,i) => {
    if(row.length > headers.length) throw new Error(`CSV row ${i+2} has extra fields. Put commas inside double quotes.`);
    const q=draft(Object.fromEntries(headers.map((h,j)=>[h,row[j] || ''])));
    const errors=issues(q,false);if(errors.length)warnings.push(`Row ${i+2}: ${errors.join(' ')}`);
    return q;
  });
  if(!questions.length) throw new Error('Add at least one question row below the header.');
  return {questions,warnings};
}
function importPaste(input){
  const blocks=String(input).replace(/\r\n?/g,'\n').trim().split(/\n\s*---\s*\n/);
  const warnings=[];
  const questions=blocks.map((block,i)=>{
    const row={};let key=null;
    for(const line of block.split('\n')){
      const match=/^([A-Za-z]+):\s?(.*)$/.exec(line);
      if(match){key=match[1];if(!FIELDS.includes(key)){warnings.push(`Question ${i+1}: unsupported field "${key}". It remains in the original paste; use only the listed labels.`);key=null;}
        else if(key in row){throw new Error(`Question ${i+1}: repeated ${key} label. Separate questions with --- on its own line.`);}else row[key]=match[2];}
      else if(key) row[key]+='\n'+line;
      else if(line.trim()) warnings.push(`Question ${i+1}: unrecognized line "${line.slice(0,60)}". Use label: value.`);
    }
    const q=draft(row);const errors=issues(q,false);if(errors.length)warnings.push(`Question ${i+1}: ${errors.join(' ')}`);return q;
  });
  if(!String(input).trim()) throw new Error('Paste a question using the example labels.');
  return {questions,warnings};
}
function wrap(Base){
  const hashes = new Map();
  async function prepare(project){
    for(const q of project.questions){
      if(!issues(q,false).length){const answer=escape(q[q.answer]);const normalized=Base.normalizeAnswerText(answer);hashes.set(normalized,await Base.sha256Hex(normalized));}
    }
  }
  function inputs(library, recipe){
    if(!recipe.hybrid) return {library,recipe,errors:[]};
    const project=restore(recipe.hybrid),errors=[];
    const shared=project.source !== 'own' ? [...recipe.selectedConceptIds] : [];
    const runtime={...recipe,selectedConceptIds:shared,contentScopes:Object.fromEntries(Object.entries(recipe.contentScopes || {}).filter(([id])=>shared.includes(id)))};
    delete runtime.hybrid;
    runtime.checkpointFocus=Object.fromEntries(Base.CHECKPOINT_ORDER.map(k=>[k,recipe.checkpointFocus?.[k] == null ? null : recipe.checkpointFocus[k].filter(id=>shared.includes(id))]));
    if(project.source === 'shared') return {library,recipe:runtime,errors};
    const prefix='mq-custom:'+project.id, id=prefix+':bank';
    if(library.concepts[id]) throw new Error('Instructor bank identity collides with supplied content.');
    const module={canonicalConceptId:id,title:'Instructor questions',questions:Object.fromEntries(LEVELS.map(k=>[k,[]])),objectiveLabels:{},repairQuestions:[],bridgeQuestions:[]};
    const used = new Set(Object.values(library.concepts).flatMap(m=>Base.ContentScope.allQuestions(m).map(Base.idOf)));
    for(const [index,q] of project.questions.entries()){
      if(!q.included)continue;
      const problems=issues(q);if(problems.length){errors.push(`My question ${index+1}: ${problems.join(' ')}`);continue;}
      const qid=prefix+':q:'+q.id,topic=prefix+':topic:'+encodeURIComponent(q.topic),objective=topic+':outcome:'+encodeURIComponent(q.outcome);
      if(used.has(qid))throw new Error('Question identity collision. Import as a new draft.');used.add(qid);
      const options=['A','B','C','D'].map(k=>escape(q[k]));const hash=hashes.get(Base.normalizeAnswerText(options['ABCD'.indexOf(q.answer)]));
      if(!hash){errors.push(`My question ${index+1}: answer integrity preparation is incomplete.`);continue;}
      module.objectiveLabels[objective]=escape(q.outcome);
      module.questions[q.difficulty].push({id:qid,canonicalId:qid,q:escape(q.question),options,aHash:hash,feedback:escape(q.explanation),tag:topic,topic:escape(q.topic),objective,outcomeIds:[objective],primaryConceptId:id,primarySkill:objective,repairSkill:objective,type:'concept',difficulty:q.difficulty,canonicalDifficulty:q.difficulty,source:'instructor-custom'});
    }
    if(Object.values(module.questions).some(q=>q.length)){
      runtime.selectedConceptIds.push(id);
      runtime.contentScopes[id]={preset:'custom',outcomeIds:[],legacySkillIds:Object.keys(module.objectiveLabels)};
    }
    return {library:{...library,concepts:{...library.concepts,[id]:module}},recipe:runtime,errors};
  }
  const Core={...Base,
    compose(library,recipe){
      const p=inputs(library,recipe),c=Base.compose(p.library,p.recipe);c.errors.push(...p.errors);
      // Display labels do not create shared outcome mappings or repair routes.
      for(const q of Object.values(c.banks).flat())if(q.source==='instructor-custom'){
        c.objectiveLabels[q.tag]=q.topic;c.objectiveLabels[q.primaryConceptId]='Instructor questions';
      }
      return c;
    },
    canonicalRecipe(recipe,library,theme){return {...Base.canonicalRecipe(recipe,library,theme),...(recipe.hybrid?{hybrid:restore(recipe.hybrid)}:{})};},
    migrateRecipe(recipe,library,theme){const out=Base.migrateRecipe(recipe,library,theme);if(recipe.hybrid)out.recipe.hybrid=restore(recipe.hybrid);return out;},
    async createConfig(recipe,library,sha,theme,composition){const p=inputs(library,recipe);if(p.errors.length)throw new Error(p.errors.join('\n'));return Base.createConfig(p.recipe,p.library,sha,theme,composition);},
    buildHtml(template,composition,config,metadata,activation){
      if(composition.errors?.length)throw new Error(composition.errors.join('\n'));
      const anchor='function remediationTransitionAllowed(question){';
      if(!template.includes(anchor))throw new Error('Runtime remediation integration changed; staging needs review.');
      template=template.replace(anchor,anchor+'\n    if(question?.source === "instructor-custom") return false;');
      const plan='function planRemediation(question, responseTime){';
      if(!template.includes(plan))throw new Error('Runtime remediation planning integration changed.');
      template=template.replace(plan,plan+'\n    if(question?.source === "instructor-custom") return null;');
      return Base.buildHtml(template,composition,config,metadata,activation);
    }
  };
  return {Core,prepare,inputs};
}
return {VERSION,FIELDS,LEVELS,SOURCES,fresh,draft,issues,edit,acknowledge,acknowledgeIncluded,restore,signature,importCSV,importPaste,csvRows,escape,wrap};
});
