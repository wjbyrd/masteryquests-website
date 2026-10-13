'use strict';
let records=[],summary=null;
const byId=id=>document.getElementById(id);
function el(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
function refresh(){
  summary=MQAnswerAnalysis.analyze(records,{exposure:byId('exposure').value,assistance:byId('assistance').value,mode:byId('mode').value});
  const s=summary.stats;
  byId('status').textContent=`${s.accepted} recorded answers · ${s.included} shown · ${s.unresolved} without usable answer snapshots · ${s.duplicates} duplicate rows skipped · ${s.rapidGuesses} rapid guesses and ${s.drafts} exam drafts excluded.`;
  byId('download').disabled=!summary.groups.length;byId('results').replaceChildren();
  for(const g of summary.groups){
    const card=el('article','','question');card.append(el('p',`${g.games.join(', ')} · Question ${g.questionID} · Revision ${g.revision.slice(0,12)}`,'meta'),el('h2',g.prompt));
    card.append(el('p',`${g.count} answers · ${g.knownCorrectness?Math.round(100*g.correct/g.knownCorrectness)+'% correct':'Correctness unavailable'} · ${g.first} first, ${g.repeat} repeat, ${g.unknown} exposure unknown · ${g.assisted} with choices removed`));
    if(g.optionOrder==='displayed')card.append(el('p','Original answer order was unavailable. These choices are grouped by the order shown.','meta'));
    const wrap=el('div','','table-wrap'),table=el('table',''),head=el('thead',''),tr=el('tr','');
    for(const text of ['Answer choice','Selected','Share','Marked correct']){const th=el('th',text);th.scope='col';tr.append(th);}head.append(tr);table.append(head);
    const body=el('tbody','');for(const o of g.options){const row=el('tr','');for(const text of [o.text,o.count,Math.round(o.count/g.count*100)+'%',o.knownCorrectness?`${o.correct} of ${o.knownCorrectness}`:'No recorded result'])row.append(el('td',String(text)));body.append(row);}table.append(body);wrap.append(table);card.append(wrap);byId('results').append(card);
  }
}
let loadGeneration=0;
byId('files').addEventListener('change',async event=>{
  const generation=++loadGeneration;records=[];const errors=[];
  for(const file of event.target.files){try{const next=MQAnswerAnalysis.parseCSV(await file.text());if(generation!==loadGeneration)return;records.push(...next);}catch(e){errors.push(`${file.name}: ${e.message}`);}}
  if(generation!==loadGeneration)return;
  byId('errors').textContent=errors.join('\n');const select=byId('mode');select.replaceChildren(new Option('All modes','all'));
  for(const mode of [...new Set(records.map(r=>r.mode).filter(Boolean))].sort())select.append(new Option(mode,mode));refresh();
});
for(const id of ['exposure','assistance','mode'])byId(id).addEventListener('change',refresh);
byId('clear').addEventListener('click',()=>{loadGeneration++;records=[];byId('files').value='';byId('errors').textContent='';refresh();});
byId('download').addEventListener('click',()=>{
  const escape=value=>'"'+String(value).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
  const rows=[['questionID','questionRevision','question','choice','count','share','correctCount','knownCorrectness','exposureFilter','assistanceFilter','modeFilter']];
  for(const g of summary.groups)for(const o of g.options)rows.push([g.questionID,g.revision,g.prompt,o.text,o.count,o.count/g.count,o.correct,o.knownCorrectness,byId('exposure').value,byId('assistance').value,byId('mode').value]);
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row=>row.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const link=el('a','');link.href=url;link.download='mastery-quests-answer-analysis.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
