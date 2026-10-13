'use strict';
let records=[],summary=null;
const collection=MQAnswerAnalysis.createCollection();
const byId=id=>document.getElementById(id);
function el(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
const percent=(correct,total)=>total?Math.round(100*correct/total)+'%':'Unavailable';
function table(headers,rows){
  const wrap=el('div','','table-wrap'),node=el('table',''),head=el('thead',''),tr=el('tr','');
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
  container.append(el('p',`${o.correct} correct out of ${o.knownCorrectness} answers with a recorded result. Accuracy combines all shown answers. Game runs may include several attempts by the same student. Questions covered counts each saved question version once.`,'meta'));
  if(o.unknownRunAnswers)container.append(el('p',`${o.unknownRunAnswers} shown answers have no run ID.`,'meta'));
  if(!summary.groups.length)return;
  const topics=[...summary.topics].sort((a,b)=>(a.knownCorrectness?a.correct/a.knownCorrectness:2)-(b.knownCorrectness?b.correct/b.knownCorrectness:2)||b.count-a.count);
  const multipleGames=new Set(topics.map(t=>t.game)).size>1;
  const topicTable=table(['Topic',...(multipleGames?['Game']:[]),'Answers','Correct','Accuracy'],topics.map(t=>[t.topic.replaceAll('_',' ').replaceAll('-',' '),...(multipleGames?[t.game]:[]),t.count,t.correct,percent(t.correct,t.knownCorrectness)]));
  if(!multipleGames)topicTable.classList.add('topic-results');
  container.append(el('h3','Results by topic'),el('p','Topics use the labels recorded by each game. The current filters apply to every result below.','meta'),topicTable);
  const lowest=summary.groups.filter(g=>g.knownCorrectness&&g.correct<g.knownCorrectness).sort((a,b)=>a.correct/a.knownCorrectness-b.correct/b.knownCorrectness||b.knownCorrectness-a.knownCorrectness).slice(0,5);
  if(lowest.length){
    container.append(el('h3','Questions to review'),el('p','These questions had the lowest accuracy in the selected answers. Check the response counts alongside the percentages, especially when only a few students saw a question.','meta'));
    container.append(table(['Question','Answers','Accuracy','Most common incorrect choice'],lowest.map(g=>{
      const wrong=g.options.filter(o=>o.knownCorrectness>o.correct),max=Math.max(...wrong.map(o=>o.knownCorrectness-o.correct));
      return [g.prompt,g.count,percent(g.correct,g.knownCorrectness),wrong.filter(o=>o.knownCorrectness-o.correct===max).map(o=>`${o.text} (${max})`).join(' / ')];
    })));
  }
}
function refresh(){
  records=collection.rows();
  summary=MQAnswerAnalysis.analyze(records,{exposure:byId('exposure').value,assistance:byId('assistance').value,mode:byId('mode').value});
  const s=summary.stats;
  byId('status').textContent=`${s.accepted} recorded answers · ${s.included} shown · ${s.unresolved} without saved question details · ${s.duplicates} duplicate rows skipped · ${s.rapidGuesses} rapid guesses and ${s.drafts} exam drafts excluded.`;
  renderOverview();
  byId('download-summary').disabled=!summary.groups.length;
  byId('download').disabled=!summary.groups.length;byId('results').replaceChildren();
  if(summary.groups.length)byId('results').append(el('h2','Answer choices by question'),el('p','Open a question to see its choice counts.','meta'));
  for(const g of summary.groups){
    const card=el('details','','question'),heading=el('summary','');
    heading.append(el('h3',g.prompt),el('p',`${g.count} answers · ${percent(g.correct,g.knownCorrectness)} correct`,'meta'));card.append(heading);
    card.append(el('p',`${g.count} answers · ${g.knownCorrectness?Math.round(100*g.correct/g.knownCorrectness)+'% correct':'Correctness unavailable'} · ${g.first} first, ${g.repeat} repeat, ${g.unknown} exposure unknown · ${g.assisted} with choices removed`));
    if(g.optionOrder==='displayed')card.append(el('p','Original answer order was unavailable. These choices are grouped by the order shown.','meta'));
    const wrap=el('div','','table-wrap'),table=el('table',''),head=el('thead',''),tr=el('tr','');
    for(const text of ['Answer choice','Selected','Share','Marked correct']){const th=el('th',text);th.scope='col';tr.append(th);}head.append(tr);table.append(head);
    const body=el('tbody','');for(const o of g.options){const row=el('tr','');for(const text of [o.text,o.count,Math.round(o.count/g.count*100)+'%',o.knownCorrectness?`${o.correct} of ${o.knownCorrectness}`:'No recorded result'])row.append(el('td',String(text)));body.append(row);}table.append(body);wrap.append(table);card.append(wrap);byId('results').append(card);
  }
}
function renderFiles(){
  const list=byId('file-list');list.replaceChildren();
  for(const file of collection.entries()){
    const item=el('li',''),remove=el('button','Remove');remove.type='button';remove.setAttribute('aria-label','Remove '+file.name);
    item.append(el('span',`${file.name} (${file.answers} recorded answers)`),remove);
    remove.addEventListener('click',()=>{collection.remove(file.id);update();});list.append(item);
  }
}
function update(){
  records=collection.rows();const select=byId('mode'),selected=select.value;
  select.replaceChildren(new Option('All modes','all'));
  for(const mode of [...new Set(records.map(r=>r.mode).filter(Boolean))].sort())select.append(new Option(mode,mode));
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
    byId('import-status').textContent=`${added} files added. ${duplicates} identical files already loaded. ${collection.entries().length} files in this report.`;
    update();
  });
}
byId('files').addEventListener('change',event=>{const files=Array.from(event.target.files);event.target.value='';addFiles(files);});
const dropZone=byId('drop-zone');
dropZone.addEventListener('dragover',event=>{event.preventDefault();dropZone.classList.add('dragging');});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop',event=>{event.preventDefault();dropZone.classList.remove('dragging');addFiles(Array.from(event.dataTransfer.files));});
for(const id of ['exposure','assistance','mode'])byId(id).addEventListener('change',refresh);
byId('clear').addEventListener('click',()=>{loadGeneration++;collection.clear();byId('files').value='';byId('errors').textContent='';byId('import-status').textContent='';for(const id of ['exposure','assistance','mode'])byId(id).value='all';update();});
function downloadCSV(rows,name){
  const escape=value=>'"'+String(value).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row=>row.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const link=el('a','');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
byId('download').addEventListener('click',()=>{
  const rows=[['questionID','questionRevision','question','choice','count','share','correctCount','knownCorrectness','exposureFilter','assistanceFilter','modeFilter']];
  for(const g of summary.groups)for(const o of g.options)rows.push([g.questionID,g.revision,g.prompt,o.text,o.count,o.count/g.count,o.correct,o.knownCorrectness,byId('exposure').value,byId('assistance').value,byId('mode').value]);
  downloadCSV(rows,'mastery-quests-answer-analysis.csv');
});
byId('download-summary').addEventListener('click',()=>{
  const filters=[byId('exposure').value,byId('assistance').value,byId('mode').value];
  const rows=[['section','game','topicOrQuestion','questionID','questionRevision','answers','correct','knownCorrectness','accuracy','gameRuns','files','exposureFilter','assistanceFilter','modeFilter']];
  const o=summary.overview;
  rows.push(['class','','','','',summary.stats.included,o.correct,o.knownCorrectness,o.knownCorrectness?o.correct/o.knownCorrectness:'',o.runs,collection.entries().length,...filters]);
  for(const t of summary.topics)rows.push(['topic',t.game,t.topic,'','',t.count,t.correct,t.knownCorrectness,t.knownCorrectness?t.correct/t.knownCorrectness:'','','',...filters]);
  for(const g of summary.groups)rows.push(['question',g.games.join(', '),g.prompt,g.questionID,g.revision,g.count,g.correct,g.knownCorrectness,g.knownCorrectness?g.correct/g.knownCorrectness:'','','',...filters]);
  downloadCSV(rows,'mastery-quests-class-summary.csv');
});
