'use strict';
let records=[],summary=null;
const collection=MQAnswerAnalysis.createCollection();
const byId=id=>document.getElementById(id);
function el(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
const percent=(correct,total)=>total?Math.round(100*correct/total)+'%':'Unavailable';
const plural=MQAnswerAnalysis.plural;
function summaryText(){return MQAnswerAnalysis.feedbackSummary(summary,{fileCount:collection.entries().length,minResponses:Number(byId('minimum').value),grouping:byId('grouping').value});}
function table(headers,rows){
  const wrap=el('div','','table-wrap'),node=el('table',''),head=el('thead',''),tr=el('tr','');
  wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',headers.join(', ')+' table');
  for(const label of headers){const th=el('th',label);th.scope='col';tr.append(th);}head.append(tr);node.append(head);
  const body=el('tbody','');for(const values of rows){const row=el('tr','');for(const value of values)row.append(el('td',String(value)));body.append(row);}node.append(body);wrap.append(node);return wrap;
}
function renderOverview(){
  const o=summary.overview,container=byId('overview');container.replaceChildren();
  if(!records.length)return;
  container.append(el('h2','Class overview'));
  const metrics=el('div','','metrics');
  for(const [label,value] of [['Files added',collection.entries().length],['Game runs',o.runs],['Answers shown',summary.stats.included],['Questions covered',o.questions],['Overall accuracy',percent(o.correct,o.knownCorrectness)]]){
    const metric=el('div','','metric');metric.append(el('strong',String(value)),el('span',label));metrics.append(metric);
  }container.append(metrics);
  container.append(el('p',`${o.correct} correct out of ${plural(o.knownCorrectness,'answer')} with a recorded result. Accuracy combines all shown answers. Game runs may include several attempts by the same student. Questions covered counts each saved question version once.`,'meta'));
  if(o.unknownRunAnswers)container.append(el('p',`${plural(o.unknownRunAnswers,'shown answer')} ${o.unknownRunAnswers===1?'has':'have'} no run ID.`,'meta'));
  if(!summary.groups.length)return;
  const objectiveView=byId('grouping').value==='objectives';
  const topics=[...(objectiveView?summary.objectives:summary.topics)].sort((a,b)=>(a.knownCorrectness?a.correct/a.knownCorrectness:2)-(b.knownCorrectness?b.correct/b.knownCorrectness:2)||b.count-a.count);
  const multipleGames=new Set(topics.map(t=>t.game)).size>1;
  const topicTable=table([objectiveView?'Learning objective':'Topic',...(multipleGames?['Game']:[]),'Responses','Runs','Accuracy','Evidence'],topics.map(t=>[
    objectiveView?MQAnswerAnalysis.objectiveLabel(t)+(t.labelConflict?' (conflicting descriptions)':''):t.topic.replaceAll('_',' ').replaceAll('-',' '),
    ...(multipleGames?[t.game]:[]),t.count,t.runCount,percent(t.correct,t.knownCorrectness),MQAnswerAnalysis.sufficient(t)?'Broader sample':t.knownCorrectness<5?'Limited evidence (fewer than 5 responses)':'One run or run count unavailable']));
  if(!multipleGames)topicTable.classList.add('topic-results');
  container.append(el('h3',objectiveView?'Results by learning objective':'Results by topic'),el('p',objectiveView?'Compare the learning objectives covered in these runs. Older files may lack descriptions.':'Topics use the labels recorded by each game. The current filters apply to every result below.','meta'),topicTable);
  if(summary.stats.missingObjectives||summary.stats.objectiveConflicts)container.append(el('p',`${plural(summary.stats.missingObjectives,'response')} without an objective; ${plural(summary.stats.objectiveConflicts,'question version')} with inconsistent objective assignments. Original labels remain in the tables.`,'meta'));
  const lowest=MQAnswerAnalysis.reviewQuestions(summary,Number(byId('minimum').value));
  if(lowest.length){
    container.append(el('h3','Questions to review'),el('p',`Showing up to five questions with at least ${plural(Number(byId('minimum').value),'response')} with a recorded result. All question distributions remain below. Small samples and repeated practice within one run provide limited evidence.`,'meta'));
    container.append(table(['Question','Responses','Runs','Accuracy','Most common choice marked incorrect'],lowest.map(g=>{
      const wrong=g.options.filter(o=>o.knownCorrectness>o.correct),max=Math.max(...wrong.map(o=>o.knownCorrectness-o.correct));
      return [g.prompt,g.count,g.runCount,percent(g.correct,g.knownCorrectness),wrong.filter(o=>o.knownCorrectness-o.correct===max).map(o=>`${o.text} (${max})`).join(' / ')];
    })));
  }else container.append(el('p','No questions meet the current review threshold. All imported question results remain available below.','meta'));
}
function refresh(){
  records=collection.rows();
  summary=MQAnswerAnalysis.analyze(records,{exposure:byId('exposure').value,assistance:byId('assistance').value,mode:byId('mode').value});
  const s=summary.stats;
  byId('status').textContent=`${plural(s.accepted,'recorded answer')} · ${s.included} shown · ${s.unresolved} without usable saved question details · ${plural(s.duplicates,'duplicate row')} skipped · ${plural(s.rapidGuesses,'rapid guess','rapid guesses')} and ${plural(s.drafts,'exam draft')} excluded.`;
  byId('integrity').textContent=s.keyConflicts?`${plural(s.keyConflicts,'question version')} ${s.keyConflicts===1?'has':'have'} conflicting answer-key or grading information. Check the original exports before drawing conclusions. Recorded counts remain visible; answer keys are withheld for these questions.`:s.unverifiableIDs?`${plural(s.unverifiableIDs,'response')} ${s.unverifiableIDs===1?'has':'have'} no reliable identifier. Legitimate repeated attempts are retained, but overlapping exports cannot be fully deduplicated.`:'';
  renderOverview();
  byId('copy-summary').disabled=!s.accepted;
  if(!byId('summary-editor').hidden){byId('summary-text').value=summaryText();byId('copy-status').textContent='Summary updated for the current selection. Copy it again to use these results.';}
  byId('download-summary').disabled=!summary.groups.length;
  byId('download').disabled=!summary.groups.length;byId('results').replaceChildren();
  if(summary.groups.length)byId('results').append(el('h2','Answer choices by question'),el('p','Open a question to see its choice counts.','meta'));
  for(const g of summary.groups){
    const card=el('details','','question'),heading=el('summary','');
    heading.append(el('h3',g.prompt),el('p',`${plural(g.count,'answer')} · ${percent(g.correct,g.knownCorrectness)} correct`,'meta'));card.append(heading);
    card.append(el('p',`${g.first} first, ${g.repeat} repeat, ${g.unknown} exposure unknown · ${g.assisted} with choices removed`));
    if(g.optionOrder==='displayed')card.append(el('p','Original answer order was unavailable. These choices are grouped by the order shown.','meta'));
    if(g.keyStatus!=='known')card.append(el('p',g.keyStatus==='conflict'?'Data integrity problem: conflicting answer-key or grading information.':'Correct answer unavailable',g.keyStatus==='conflict'?'integrity-note':'meta'));
    const wrap=el('div','','table-wrap'),table=el('table',''),head=el('thead',''),tr=el('tr','');
    wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Answer choices and results');
    for(const text of ['Answer choice','Selected','Share','Correct answer','Selections marked correct']){const th=el('th',text);th.scope='col';tr.append(th);}head.append(tr);table.append(head);
    const body=el('tbody','');for(const o of g.options){const row=el('tr','');for(const text of [o.text,o.count,Math.round(o.count/g.count*100)+'%',g.keyStatus==='conflict'?'Conflicting key':o.isCorrect===null?'Unavailable':o.isCorrect?'Yes':'No',o.knownCorrectness?`${o.correct} of ${o.knownCorrectness}`:'No recorded result'])row.append(el('td',String(text)));body.append(row);}table.append(body);wrap.append(table);card.append(wrap);byId('results').append(card);
  }
}
function renderFiles(){
  const list=byId('file-list');list.replaceChildren();
  for(const file of collection.entries()){
    const item=el('li',''),remove=el('button','Remove');remove.type='button';remove.setAttribute('aria-label','Remove '+file.name);
    item.append(el('span',`${file.name} (${plural(file.answers,'recorded answer')})`),remove);
    remove.addEventListener('click',()=>{collection.remove(file.id);update();});list.append(item);
  }
}
function update(){
  records=collection.rows();const select=byId('mode'),selected=select.value;
  select.replaceChildren(new Option('All modes','all'));
  for(const mode of [...new Set(records.map(r=>MQAnswerAnalysis.normalizeRow(r).mode).filter(Boolean))].sort())select.append(new Option(mode,mode));
  if([...select.options].some(o=>o.value===selected))select.value=selected;
  renderFiles();refresh();
}
let loadGeneration=0,importQueue=Promise.resolve();
function addFiles(files){
  const generation=loadGeneration;
  importQueue=importQueue.then(async()=>{
    if(generation!==loadGeneration)return;
    byId('import-status').textContent='Reading files…';const errors=[];let added=0,duplicates=0;
    for(const file of files){try{
      const text=await file.text();if(generation!==loadGeneration)return;
      if(collection.add(file.name,text))added++;else duplicates++;
    }catch(e){errors.push(`${file.name}: ${e.message}`);}}
    if(generation!==loadGeneration)return;
    byId('errors').textContent=errors.join('\n');
    byId('import-status').textContent=`${plural(added,'file')} added. ${plural(duplicates,'identical file')} already loaded. ${plural(collection.entries().length,'file')} in this report.`;
    update();
  });
}
byId('files').addEventListener('change',event=>{const files=Array.from(event.target.files);event.target.value='';addFiles(files);});
const dropZone=byId('drop-zone');
dropZone.addEventListener('dragover',event=>{event.preventDefault();dropZone.classList.add('dragging');});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop',event=>{event.preventDefault();dropZone.classList.remove('dragging');addFiles(Array.from(event.dataTransfer.files));});
for(const id of ['exposure','assistance','mode','grouping','minimum'])byId(id).addEventListener('change',refresh);
byId('clear').addEventListener('click',()=>{loadGeneration++;collection.clear();byId('files').value='';byId('errors').textContent='';byId('import-status').textContent='';byId('summary-editor').hidden=true;byId('summary-text').value='';byId('copy-status').textContent='';for(const id of ['exposure','assistance','mode'])byId(id).value='all';update();});
byId('copy-summary').addEventListener('click',async()=>{
  const text=summaryText();byId('summary-editor').hidden=false;byId('summary-text').value=text;
  try{await navigator.clipboard.writeText(text);byId('copy-status').textContent='Class summary copied. You can edit the text below before using it.';}
  catch(_){byId('copy-status').textContent='Clipboard access is unavailable. Select the summary below and use your device’s Copy command.';byId('summary-text').focus();byId('summary-text').select();}
});
function downloadCSV(rows,name){
  const escape=value=>'"'+String(value).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row=>row.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const link=el('a','');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
byId('download').addEventListener('click',()=>{
  const rows=[['gameID','questionID','questionRevision','question','choice','count','share','correctAnswer','keyStatus','correctCount','knownCorrectness','runCount','exposureFilter','assistanceFilter','modeFilter']];
  for(const g of summary.groups)for(const o of g.options)rows.push([g.gameID,g.questionID,g.revision,g.prompt,o.text,o.count,o.count/g.count,o.isCorrect===null?'':o.isCorrect,g.keyStatus,o.correct,o.knownCorrectness,g.runCount,byId('exposure').value,byId('assistance').value,byId('mode').value]);
  downloadCSV(rows,'mastery-quests-answer-analysis.csv');
});
byId('download-summary').addEventListener('click',()=>{
  const filters=[byId('exposure').value,byId('assistance').value,byId('mode').value];
  const rows=[['section','game','topicOrQuestion','questionID','questionRevision','answers','correct','knownCorrectness','accuracy','gameRuns','files','exposureFilter','assistanceFilter','modeFilter','objectiveID','keyStatus']];
  const o=summary.overview;
  rows.push(['class','','','','',summary.stats.included,o.correct,o.knownCorrectness,o.knownCorrectness?o.correct/o.knownCorrectness:'',o.runs,o.files,...filters,'','']);
  for(const t of summary.topics)rows.push(['topic',t.game,t.topic,'','',t.count,t.correct,t.knownCorrectness,t.knownCorrectness?t.correct/t.knownCorrectness:'',t.runCount,'',...filters,'','']);
  for(const t of summary.objectives)rows.push(['objective',t.game,MQAnswerAnalysis.objectiveLabel(t),'','',t.count,t.correct,t.knownCorrectness,t.knownCorrectness?t.correct/t.knownCorrectness:'',t.runCount,'',...filters,t.objective,'']);
  for(const g of summary.groups)rows.push(['question',g.games.join(', '),g.prompt,g.questionID,g.revision,g.count,g.correct,g.knownCorrectness,g.knownCorrectness?g.correct/g.knownCorrectness:'',g.runCount,'',...filters,'',g.keyStatus]);
  downloadCSV(rows,'mastery-quests-class-summary.csv');
});
