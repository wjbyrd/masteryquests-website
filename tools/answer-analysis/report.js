'use strict';
let records=[],summary=null;
const collection=MQAnswerAnalysis.createCollection();
const byId=id=>document.getElementById(id);
function el(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
const percent=(correct,total)=>total?Math.round(100*correct/total)+'%':'Unavailable';
const plural=MQAnswerAnalysis.plural;
const questionAnchor=g=>'q-'+btoa(unescape(encodeURIComponent(JSON.stringify([g.gameID,String(g.questionID),g.revision])))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
function reviewLink(g,index){
  const link=el('a',`Review ${index+1}: ${g.prompt}`,'review-link');link.href='#'+questionAnchor(g);
  link.addEventListener('click',event=>{
    event.preventDefault();openQuestion(g);
  });
  return link;
}
function summaryText(){return MQAnswerAnalysis.feedbackSummary(summary,{fileCount:collection.entries().length,minResponses:Number(byId('minimum').value),grouping:byId('grouping').value});}
function table(headers,rows){
  const wrap=el('div','','table-wrap'),node=el('table',''),head=el('thead',''),tr=el('tr','');
  wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',headers.join(', ')+' table');
  for(const label of headers){const th=el('th',label);th.scope='col';tr.append(th);}head.append(tr);node.append(head);
  const body=el('tbody','');for(const values of rows){const row=el('tr','');for(const value of values){const cell=el('td','');cell.append(value instanceof Node?value:String(value));row.append(cell);}body.append(row);}node.append(body);wrap.append(node);return wrap;
}
function renderOverview(){renderDashboard();}
function refresh(){
  records=collection.rows();
  const filters=Object.fromEntries(['exposure','assistance','mode','game','run'].map(id=>[id,byId(id).value]));
  summary=MQAnswerAnalysis.analyze(records,filters);
  const s=summary.stats,o=summary.overview,q=summary.quality;
  byId('dashboard').hidden=!records.length;byId('dashboard-nav').hidden=!records.length;byId('empty-state').hidden=Boolean(records.length);
  byId('status').textContent=`${plural(s.accepted,'recorded answer')} · ${s.included} shown · ${s.unresolved} without usable saved question details · ${plural(s.duplicates,'duplicate row')} skipped · ${plural(s.rapidGuesses,'rapid guess','rapid guesses')} and ${plural(s.drafts,'exam draft')} excluded.`;
  const warnings=[];
  if(s.unresolved)warnings.push(`${s.unresolved} accepted responses lack usable saved question details and are excluded.`);
  if(s.keyConflicts)warnings.push(`${s.keyConflicts} question versions have conflicting answer-key or grading information. Correct answers are withheld.`);
  if(s.objectiveConflicts)warnings.push(`${s.objectiveConflicts} question versions have conflicting objective assignments.`);
  if(s.unverifiableIDs)warnings.push(`${s.unverifiableIDs} responses have no reliable identifier; overlapping exports cannot be fully deduplicated.`);
  if(o.unknownRunAnswers)warnings.push(`${o.unknownRunAnswers} shown responses have no run ID; run-level and within-run encounter measures exclude them.`);
  if(q.difficultyConflicts)warnings.push(`${q.difficultyConflicts} question versions have conflicting recorded difficulty; classified as Unknown.`);
  if(q.roleConflicts)warnings.push(`${q.roleConflicts} question versions have conflicting role metadata.`);
  if(q.outcomeConflicts)warnings.push(`${q.outcomeConflicts} runs have conflicting endings; classified as Unknown.`);
  byId('integrity').textContent=warnings.join('\n');
  const modes=[...new Set(summary.groups.flatMap(g=>g.modes))];
  byId('dataset-context').textContent=`${collection.entries().length} files imported · ${o.files} files represented · ${o.runs} distinct runs · ${s.included} included responses. Games: ${o.games.join(', ')||'None'}. Modes: ${modes.join(', ')||'None'}.`;
  const active=Object.entries(filters).filter(([,v])=>v!=='all').map(([id])=>byId(id).selectedOptions[0].textContent);
  byId('active-filters').textContent=active.length?'Filtered selection: '+active.join(' · '):'All imported responses selected. Review minimum affects suggestions only.';byId('active-filters').classList.toggle('filtered',Boolean(active.length));
  questionScope=null;questionPage=0;
  renderOverview();renderQuestions();
  byId('copy-summary').disabled=!s.accepted;byId('download-feedback').disabled=!s.accepted;
  byId('download-summary').disabled=!summary.groups.length;byId('download').disabled=!summary.groups.length;
  byId('feedback-preview').textContent=summaryText();
  if(!byId('summary-editor').hidden){byId('summary-text').value=summaryText();byId('copy-status').textContent='Summary updated for the current selection. Copy it again to use these results.';}
}
function renderFiles(){
  const list=byId('file-list');list.replaceChildren();
  byId('file-count').textContent='('+collection.entries().length+')';
  for(const file of collection.entries()){
    const item=el('li',''),remove=el('button','Remove');remove.type='button';remove.setAttribute('aria-label','Remove '+file.name);
    const details=file.tables.length?' · Tables: '+file.tables.join('; '):'';
    const ignored=file.ignored.length?' · Skipped: '+file.ignored.join('; '):'';
    item.append(el('span',`${file.name} · ${file.format} (${plural(file.answers,'recorded answer')})${details}${ignored}`),remove);
    remove.addEventListener('click',()=>{collection.remove(file.id);update();});list.append(item);
  }
}
function update(){
  records=collection.rows();const select=byId('mode'),selected=select.value;
  select.replaceChildren(new Option('All modes','all'));
  for(const mode of [...new Set(records.map(r=>MQAnswerAnalysis.normalizeRow(r).mode).filter(Boolean))].sort())select.append(new Option(mode,mode));
  if([...select.options].some(o=>o.value===selected))select.value=selected;
  const available=MQAnswerAnalysis.analyze(records).available;
  for(const [id,items] of [['game',available.games],['run',available.runs]]){
    const control=byId(id),value=control.value;control.replaceChildren(new Option(id==='game'?'All games':'All runs','all'));
    for(const item of items)control.append(new Option(item.label,item.id));
    if([...control.options].some(o=>o.value===value))control.value=value;
  }
  renderFiles();refresh();
  openHashQuestion();
}
let loadGeneration=0,importQueue=Promise.resolve();
function addFiles(files){
  const generation=loadGeneration;
  importQueue=importQueue.then(async()=>{
    if(generation!==loadGeneration)return;
    byId('import-status').textContent='Reading files…';const errors=[];let added=0,duplicates=0;
    for(const file of files){try{
      const imported=await MQFileImport.read(file);if(generation!==loadGeneration)return;
      const accepted=imported.format==='CSV'?collection.add(file.name,imported.text):collection.addRows(file.name,imported.tables.flatMap(t=>t.rows),{format:imported.format,tables:imported.tables.map(t=>t.name),ignored:imported.ignored});
      if(accepted)added++;else duplicates++;
    }catch(e){errors.push(`${file.name}: ${e.message}`);}}
    if(generation!==loadGeneration)return;
    byId('errors').textContent=errors.join('\n');
    byId('files').setAttribute('aria-invalid',String(errors.length>0));
    byId('files').setAttribute('aria-describedby','import-help errors import-status');
    byId('import-status').textContent=`${plural(added,'file')} added. ${plural(duplicates,'identical file')} already loaded. ${plural(collection.entries().length,'file')} in this report.`;
    update();
  });
}
byId('files').addEventListener('change',event=>{const files=Array.from(event.target.files);event.target.value='';addFiles(files);});
const dropZone=byId('drop-zone');
dropZone.addEventListener('dragover',event=>{event.preventDefault();dropZone.classList.add('dragging');});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop',event=>{event.preventDefault();dropZone.classList.remove('dragging');addFiles(Array.from(event.dataTransfer.files));});
for(const id of ['exposure','assistance','mode','game','run','grouping','minimum'])byId(id).addEventListener('change',refresh);
byId('topic-sort').addEventListener('change',renderTopics);
byId('question-search').addEventListener('input',()=>{questionPage=0;renderQuestions();});
byId('show-all-questions').addEventListener('click',()=>{questionScope=null;questionPage=0;byId('question-search').value='';renderQuestions();});
function resetFilters(){for(const id of ['exposure','assistance','mode','game','run'])byId(id).value='all';byId('minimum').value='5';byId('question-search').value='';questionScope=null;}
byId('reset-filters').addEventListener('click',()=>{resetFilters();refresh();});
byId('clear').addEventListener('click',()=>{loadGeneration++;MQFileImport.cancel();collection.clear();byId('files').value='';byId('files').removeAttribute('aria-invalid');byId('errors').textContent='';byId('import-status').textContent='';byId('summary-editor').hidden=true;byId('summary-text').value='';byId('copy-status').textContent='';resetFilters();update();});
byId('copy-summary').addEventListener('click',async()=>{
  const text=summaryText();byId('summary-editor').hidden=false;byId('summary-text').value=text;
  try{await navigator.clipboard.writeText(text);byId('copy-status').textContent='Class summary copied. You can edit the text below before using it.';}
  catch(_){byId('copy-status').textContent='Clipboard access is unavailable. Select the summary below and use your device’s Copy command.';byId('summary-text').focus();byId('summary-text').select();}
});
function downloadCSV(rows,name){
  const escape=value=>'"'+String(value).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row=>row.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const link=el('a','');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  byId('copy-status').textContent=`Download prepared: ${name}.`;
}
byId('download-feedback').addEventListener('click',()=>{
  const content=byId('summary-editor').hidden?summaryText():byId('summary-text').value;
  const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'})),link=el('a','');link.href=url;link.download='mastery-quests-teaching-summary.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  byId('copy-status').textContent='Teaching summary download prepared.';
});
byId('download').addEventListener('click',()=>{
  const rows=[['gameID','questionID','questionRevision','question','choice','count','share','correctAnswer','keyStatus','correctCount','knownCorrectness','runCount','exposureFilter','assistanceFilter','modeFilter','gameFilter','runFilter']];
  for(const g of summary.groups)for(const o of g.options)rows.push([g.gameID,g.questionID,g.revision,g.prompt,o.text,o.count,o.count/g.count,o.isCorrect===null?'':o.isCorrect,g.keyStatus,o.correct,o.knownCorrectness,g.runCount,byId('exposure').value,byId('assistance').value,byId('mode').value,byId('game').value,byId('run').value]);
  downloadCSV(rows,'mastery-quests-answer-analysis.csv');
});
byId('download-summary').addEventListener('click',()=>{
  const headers=['section','game','topicOrQuestion','questionID','questionRevision','answers','correct','knownCorrectness','accuracy','gameRuns','files','exposureFilter','assistanceFilter','modeFilter','objectiveID','keyStatus','recordedRunTimeMs','medianRunTimeMs','runsWithRecordedTime','longestRecordedStreak','runsWithRecordedStreak','reviewMinimumResponses','averageResponseTimeMs','medianResponseTimeMs','responsesWithRecordedTime','averageCompletionTimeMs','runsWithCompletionTime','gameFilter','runFilter','uniqueQuestionVersions','questionVersionsWithFiveResponses','questionVersionsWithTenResponses','difficulty','reportedDifficulty','questionType','gameplayRole','successfulRuns','earlyEndedRuns','unsuccessfulRuns','unknownOutcomeRuns','successfulCompletionRate','medianSuccessfulCompletionTimeMs','medianAnswersPerSuccessfulRun','runsWithSuccessfulTime','runsWithSuccessfulAnswerCount','meanEndedRunDurationMs','metric','value'];
  const selection={exposureFilter:byId('exposure').value,assistanceFilter:byId('assistance').value,modeFilter:byId('mode').value,gameFilter:byId('game').value,runFilter:byId('run').value};
  const rows=[headers];
  const append=record=>rows.push(headers.map(h=>({...selection,...record})[h]??''));
  const stats=g=>({answers:g.count,correct:g.correct,knownCorrectness:g.knownCorrectness,accuracy:g.knownCorrectness?g.correct/g.knownCorrectness:null,gameRuns:g.runCount,uniqueQuestionVersions:g.questionCount,averageResponseTimeMs:g.averageResponseTimeMs,medianResponseTimeMs:g.medianResponseTimeMs,responsesWithRecordedTime:g.timedResponses});
  const o=summary.overview,p=summary.progression;
  append({section:'class',...stats({...o,count:summary.stats.included,runCount:o.runs,questionCount:o.questions}),files:o.files,recordedRunTimeMs:o.recordedTimeMs,medianRunTimeMs:o.medianRunTimeMs,runsWithRecordedTime:o.timedRuns,longestRecordedStreak:o.bestStreak,runsWithRecordedStreak:o.streakRuns,reviewMinimumResponses:byId('minimum').value,averageCompletionTimeMs:o.averageCompletionTimeMs,meanEndedRunDurationMs:o.averageCompletionTimeMs,runsWithCompletionTime:o.completionRuns,questionVersionsWithFiveResponses:summary.coverage.atLeastFive,questionVersionsWithTenResponses:summary.coverage.atLeastTen,successfulRuns:p.successful,earlyEndedRuns:p.early,unsuccessfulRuns:p.unsuccessful,unknownOutcomeRuns:p.unknown,successfulCompletionRate:p.successfulRate,medianSuccessfulCompletionTimeMs:p.medianSuccessfulTimeMs,medianAnswersPerSuccessfulRun:p.medianAnswersPerSuccess,runsWithSuccessfulTime:p.successfulTimedRuns,runsWithSuccessfulAnswerCount:p.successfulCountedRuns});
  for(const t of summary.topics)append({section:'topic',game:t.game,topicOrQuestion:t.topic,...stats(t),questionVersionsWithFiveResponses:t.atLeastFive,questionVersionsWithTenResponses:t.atLeastTen});
  for(const t of summary.objectives)append({section:'objective',game:t.game,topicOrQuestion:MQAnswerAnalysis.objectiveLabel(t),objectiveID:t.objective,...stats(t),questionVersionsWithFiveResponses:t.atLeastFive,questionVersionsWithTenResponses:t.atLeastTen});
  for(const g of summary.groups)append({section:'question',game:g.games.join(', '),topicOrQuestion:g.prompt,questionID:g.questionID,questionRevision:g.revision,keyStatus:g.keyStatus,...stats(g),difficulty:g.difficulty,reportedDifficulty:g.reportedDifficulties.join(' / '),questionType:g.types.join(' / '),gameplayRole:[...g.roles,...g.bossStages].join(' / ')});
  for(const g of summary.difficulties)append({section:'difficulty',topicOrQuestion:g.label,...stats(g)});
  for(const g of summary.reportedDifficulties)append({section:'recorded_difficulty',topicOrQuestion:g.label,...stats(g)});
  for(const g of summary.encounters.question)append({section:'question_encounter',topicOrQuestion:g.label,...stats(g)});
  for(const g of summary.remediation.roles)append({section:'remediation_role',topicOrQuestion:g.label,...stats(g)});
  append({section:'post_remediation_retest',topicOrQuestion:'Explicitly linked ordered retests',...stats(summary.remediation.linkedRetests)});
  for(const bin of summary.distribution)append({section:'response_time_distribution',topicOrQuestion:bin.label,answers:bin.count});
  for(const [metric,value] of [['skill_encounters',null],['remediation_sequences_initiated',null],['remediation_sequences_completed',null],['remediation_sequences_abandoned',null],['checkpoint_retry_rate',null],['total_bank_percentage',null]])append({section:'unavailable',metric,value});
  downloadCSV(rows,'mastery-quests-class-summary.csv');
});
function openHashQuestion(){
  let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const g=summary?.groups.find((g,i)=>questionAnchor(g)===hash||'question-'+i===hash);if(g)openQuestion(g);
}
window.addEventListener('hashchange',openHashQuestion);
