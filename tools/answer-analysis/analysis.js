(function(root){
  'use strict';
  function parseCSV(text){
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
      else if(c===','&&!quoted){row.push(field);field='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field='';}
      else field+=c;
    }
    if(quoted)throw Error('A quoted CSV value is unfinished.');
    if(field||row.length){row.push(field);rows.push(row);}
    const headers=rows.shift();if(!headers)throw Error('This file is empty.');headers[0]=headers[0].replace(/^\uFEFF/,'');
    if(new Set(headers).size!==headers.length||!headers.some(h=>h==='event'||h==='event_type'))throw Error('This file is not a supported game-data CSV.');
    return rows.map((r,i)=>{if(r.length!==headers.length)throw Error(`CSV row ${i+2} has the wrong number of columns.`);return Object.fromEntries(headers.map((h,j)=>[h,r[j]]));});
  }
  const json=value=>{try{return typeof value==='string'?JSON.parse(value):value;}catch(_){return null;}};
  const flag=value=>value===true||value===1||value==='1'||value==='true';
  function analyze(rows,filters={}){
    const groups=new Map(),seen=new Set();
    const stats={accepted:0,included:0,unresolved:0,duplicates:0,rapidGuesses:0,drafts:0};
    for(const row of rows){
      const extras=json(row.extras_json)||{},r={...extras,...Object.fromEntries(Object.entries(row).filter(([,v])=>v!==''&&v!=null))},event=r.event||r.event_type;
      const accepted=event==='question'||(event==='answer_evaluated'&&(flag(r.acceptedAttempt)||(!r.acceptedAttempt&&!flag(r.rapid_guess))));
      const id=accepted?(r.attemptID||r.eventID||r.event_id):(r.eventID||r.event_id);
      // Shared attempt IDs deduplicate local + remote copies of the same answer.
      const identity=(accepted?'answer:':event+':')+(id||JSON.stringify(r));
      if(seen.has(identity)){stats.duplicates++;continue;}seen.add(identity);
      if(!accepted){if(event==='rapid_guessing'||event==='answer_evaluated'&&flag(r.rapid_guess))stats.rapidGuesses++;if(event==='exam_answer_initial'||event==='exam_answer_revision')stats.drafts++;continue;}
      stats.accepted++;
      const s=json(r.answerSnapshotJSON),support=json(r.supportJSON);
      if(!s||s.schema!=='mq-answer-snapshot/1'||typeof s.prompt!=='string'||!Array.isArray(s.options)||
        s.options.some(x=>typeof x!=='string')||!Number.isInteger(s.selectedIndex)||s.selectedIndex<0||s.selectedIndex>=s.options.length||
        s.selectedAnswer!==s.options[s.selectedIndex]||!/^[a-f0-9]{64}$/.test(s.questionRevision||'')){stats.unresolved++;continue;}
      const exposure=s.priorExposureCount===0?'first':Number.isInteger(s.priorExposureCount)&&s.priorExposureCount>0?'repeat':'unknown';
      const assisted=support?Boolean(support.artifactApplied||support.artifactRemovedCanonical?.length||support.modeRemovedCanonical?.length):null;
      const assistance=assisted===null?'unknown':assisted?'assisted':'unassisted';
      const mode=r.mode||'unknown';
      if(filters.exposure&&filters.exposure!=='all'&&filters.exposure!==exposure)continue;
      if(filters.assistance&&filters.assistance!=='all'&&filters.assistance!==assistance)continue;
      if(filters.mode&&filters.mode!=='all'&&filters.mode!==mode)continue;
      stats.included++;
      const key=s.questionRevision;
      if(!groups.has(key))groups.set(key,{revision:key,questionID:s.questionID,prompt:s.prompt,optionOrder:s.optionOrder,
        options:s.options.map(text=>({text,count:0,correct:0,knownCorrectness:0})),count:0,correct:0,knownCorrectness:0,
        first:0,repeat:0,unknown:0,assisted:0,unassisted:0,unknownAssistance:0,games:new Set(),modes:new Set()});
      const g=groups.get(key);
      if(g.options.length!==s.options.length||g.options.some((o,i)=>o.text!==s.options[i])||g.prompt!==s.prompt){stats.unresolved++;stats.included--;continue;}
      g.count++;g[exposure]++;g[assistance==='unknown'?'unknownAssistance':assistance]++;
      g.games.add(r.game||r.game_id||'Unknown game');g.modes.add(mode);
      const option=g.options[s.selectedIndex];option.count++;
      if([0,1,'0','1',true,false,'true','false'].includes(r.correct)){
        g.knownCorrectness++;option.knownCorrectness++;
        if(flag(r.correct)){g.correct++;option.correct++;}
      }
    }
    return {stats,groups:[...groups.values()].map(g=>({...g,games:[...g.games],modes:[...g.modes]}))};
  }
  const api={parseCSV,analyze};if(typeof module==='object'&&module.exports)module.exports=api;else root.MQAnswerAnalysis=api;
})(globalThis);
