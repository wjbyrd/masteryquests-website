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
  const knownCorrect=v=>[0,1,'0','1',true,false,'true','false'].includes(v);
  const normalizeRow=row=>({...json(row.extras_json),...Object.fromEntries(Object.entries(row).filter(([,v])=>v!==''&&v!=null))});
  function accepted(r){const e=r.event||r.event_type;return e==='question'||(e==='answer_evaluated'&&!flag(r.rapid_guess)&&!flag(r.rapidGuess)&&(r.acceptedAttempt==null||r.acceptedAttempt===''||flag(r.acceptedAttempt)));}
  function snapshot(r){
    const s=json(r.answerSnapshotJSON);
    return s&&['mq-answer-snapshot/1','mq-answer-snapshot/2'].includes(s.schema)&&s.questionID!=null&&typeof s.prompt==='string'&&Array.isArray(s.options)&&s.options.length>=2&&s.options.every(x=>typeof x==='string')&&Number.isInteger(s.selectedIndex)&&s.selectedIndex>=0&&s.selectedIndex<s.options.length&&s.selectedAnswer===s.options[s.selectedIndex]&&/^[a-f0-9]{64}$/.test(s.questionRevision||'')?s:null;
  }
  const gameKey=(r,s)=>String(s?.gameID||r.game_id||r.game||('unknown-file-'+(r.__sourceFile||'unidentified')));
  const groupKey=(r,s)=>JSON.stringify([gameKey(r,s),String(s.questionID),s.questionRevision]);
  function conditions(r,s){
    const support=json(r.supportJSON),n=s.priorExposureCount;
    return {exposure:n===0?'first':Number.isInteger(n)&&n>0?'repeat':'unknown',assistance:support?(support.artifactApplied||support.artifactRemovedCanonical?.length||support.modeRemovedCanonical?.length?'assisted':'unassisted'):'unknown',mode:r.mode||'unknown'};
  }
  const matches=(c,f)=>['exposure','assistance','mode'].every(k=>!f[k]||f[k]==='all'||f[k]===c[k]);
  const numeric=value=>value!==null&&value!==undefined&&value!==''&&typeof value!=='boolean'&&Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null;
  const median=values=>{const sorted=[...values].sort((a,b)=>a-b),mid=Math.floor(sorted.length/2);return sorted.length?(sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2):null;};
  const timing=values=>({averageResponseTimeMs:values.length?values.reduce((a,b)=>a+b,0)/values.length:null,medianResponseTimeMs:median(values),timedResponses:values.length});
  const runAlias=r=>JSON.stringify([r.game_id||r.game||('unknown-file-'+(r.__sourceFile||'unidentified')),r.runID||r.run_id]);
  function runContext(rows,runs,aliases){
    const observed=new Map();
    for(const r of rows){
      const run=r.runID||r.run_id;if(!run)continue;
      const s=snapshot(r),candidates=aliases.get(runAlias(r));
      const key=s?JSON.stringify([gameKey(r,s),run]):candidates?.size===1?[...candidates][0]:null;
      if(!key||!runs.has(key))continue;
      const event=r.event||r.event_type,terminal=event==='complete'||event==='run_completed'||event==='timed_ended_early'||/_(?:complete|bust|ended_by_student)$/.test(event||'');
      const item=observed.get(key)||{time:null,completionTime:null,streak:null};
      // Clocks and streaks are cumulative: take one maximum per run, never sum rows.
      const total=terminal?numeric(r.totalTimeMs):null;
      const time=total>0?total:numeric(r.elapsedTimeMs??r.elapsed_time_ms);
      if(time>0)item.time=Math.max(item.time??0,time);
      if(terminal&&time>0)item.completionTime=Math.max(item.completionTime??0,time);
      const peak=terminal?numeric(r.maxStreak):null,current=terminal||accepted(r)?numeric(r.streak):null;
      const streak=peak===null?current:Math.max(peak,current??0);
      if(streak!==null&&Number.isInteger(streak))item.streak=Math.max(item.streak??0,streak);
      observed.set(key,item);
    }
    const times=[...observed.values()].map(r=>r.time).filter(v=>v!==null),streaks=[...observed.values()].map(r=>r.streak).filter(v=>v!==null);
    const completionTimes=[...observed.values()].map(r=>r.completionTime).filter(v=>v!==null);
    return {recordedTimeMs:times.length?times.reduce((a,b)=>a+b,0):null,medianRunTimeMs:median(times),timedRuns:times.length,averageCompletionTimeMs:completionTimes.length?completionTimes.reduce((a,b)=>a+b,0)/completionTimes.length:null,completionRuns:completionTimes.length,bestStreak:streaks.length?Math.max(...streaks):null,streakRuns:streaks.length};
  }
  function analyze(rows,filters={}){
    const prepared=rows.map(normalizeRow),metadata=new Map();
    // Inspect all accepted records, including duplicate copies and filtered-out claims.
    // An inconsistent key must never become trustworthy just by changing a filter.
    for(const r of prepared){const s=snapshot(r);if(!s||!accepted(r))continue;
      const key=groupKey(r,s),m=metadata.get(key)||{signatures:new Set(),keys:new Set(),objectives:new Set(),invalidKey:false};
      m.signatures.add(JSON.stringify([s.prompt,s.options,s.optionOrder]));
      m.objectives.add(String(s.objectiveID||r.objective||''));
      const indices=s.correctOptionIndices;
      if(indices!=null){
        if(s.schema!=='mq-answer-snapshot/2'||!Array.isArray(indices)||!indices.length||new Set(indices).size!==indices.length||indices.some(i=>!Number.isInteger(i)||i<0||i>=s.options.length))m.invalidKey=true;
        else {m.keys.add(JSON.stringify([...indices].sort((a,b)=>a-b)));if(knownCorrect(r.correct)&&flag(r.correct)!==indices.includes(s.selectedIndex))m.invalidKey=true;}
      }
      metadata.set(key,m);
    }
    const groups=new Map(),seen=new Set(),runs=new Set(),runAliases=new Map(),topics=new Map(),objectives=new Map(),files=new Set(),games=new Set();
    const overview={correct:0,knownCorrectness:0,unknownRunAnswers:0},responseTimes=[];
    const stats={accepted:0,included:0,unresolved:0,duplicates:0,rapidGuesses:0,drafts:0,unverifiableIDs:0,missingObjectives:0,keyConflicts:0,objectiveConflicts:0};
    function aggregate(map,key,fields,r,run){
      if(!map.has(key))map.set(key,{...fields,count:0,correct:0,knownCorrectness:0,runs:new Set(),labels:new Set()});
      const a=map.get(key);a.count++;if(run)a.runs.add(run);
      if(knownCorrect(r.correct)){a.knownCorrectness++;if(flag(r.correct))a.correct++;}return a;
    }
    for(const r of prepared){
      const event=r.event||r.event_type,isAccepted=accepted(r),s=snapshot(r),run=r.runID||r.run_id;
      if(isAccepted&&s&&matches(conditions(r,s),filters)&&r.__sourceFile!=null)files.add(r.__sourceFile);
      const id=isAccepted?(r.attemptID||r.eventID||r.event_id):(r.eventID||r.event_id);
      const scope=/^[a-f0-9]{8}-[a-f0-9-]{27}$/i.test(String(id))?'':gameKey(r,s);
      const identity=id?JSON.stringify([isAccepted?'answer':event,scope,run||'',id]):null;
      const eventId=r.eventID||r.event_id;
      const eventScope=/^[a-f0-9]{8}-[a-f0-9-]{27}$/i.test(String(eventId))?'':gameKey(r,s);
      const eventIdentity=eventId?JSON.stringify(['event',eventScope,run||'',eventId]):null;
      if((identity&&seen.has(identity))||(eventIdentity&&seen.has(eventIdentity))){stats.duplicates++;continue;}
      if(identity)seen.add(identity);if(eventIdentity)seen.add(eventIdentity);
      if(!isAccepted){if(['rapid_guessing','rapid_guess_detected'].includes(event)||event==='answer_evaluated'&&(flag(r.rapid_guess)||flag(r.rapidGuess)))stats.rapidGuesses++;if(['exam_answer_initial','exam_answer_revision'].includes(event))stats.drafts++;continue;}
      stats.accepted++;if(!id)stats.unverifiableIDs++;
      if(!s){stats.unresolved++;continue;}
      const c=conditions(r,s);if(!matches(c,filters))continue;
      const key=groupKey(r,s),m=metadata.get(key);
      if(m.signatures.size>1){stats.unresolved++;continue;}
      stats.included++;
      const game=r.game||r.game_id||s.gameID||'Unknown game',gameID=gameKey(r,s);games.add(game);
      if(!groups.has(key)){
        const keyStatus=m.invalidKey||m.keys.size>1?'conflict':m.keys.size===1?'known':'unavailable';
        const correctOptionIndices=keyStatus==='known'?JSON.parse([...m.keys][0]):null;
        if(keyStatus==='conflict')stats.keyConflicts++;
        if(m.objectives.size>1)stats.objectiveConflicts++;
        groups.set(key,{revision:s.questionRevision,questionID:s.questionID,gameID,prompt:s.prompt,optionOrder:s.optionOrder,keyStatus,correctOptionIndices,
          options:s.options.map((text,i)=>({text,count:0,correct:0,knownCorrectness:0,isCorrect:correctOptionIndices?correctOptionIndices.includes(i):null})),count:0,correct:0,knownCorrectness:0,
          first:0,repeat:0,unknown:0,assisted:0,unassisted:0,unknownAssistance:0,games:new Set(),modes:new Set(),runs:new Set(),responseTimes:[]});
      }
      const g=groups.get(key);g.count++;g[c.exposure]++;g[c.assistance==='unknown'?'unknownAssistance':c.assistance]++;g.games.add(game);g.modes.add(c.mode);
      // Use each retained answer's interval, never divide whole-run clocks by answer counts.
      // Older exports use zero as an unmeasured default. Keep those out of timing averages.
      const responseTime=numeric(r.responseTimeMs??r.response_time_ms);
      if(responseTime>0){responseTimes.push(responseTime);g.responseTimes.push(responseTime);}
      const runKey=run?JSON.stringify([gameID,run]):null;if(runKey){runs.add(runKey);g.runs.add(runKey);}else overview.unknownRunAnswers++;
      if(runKey){const alias=runAlias(r);if(!runAliases.has(alias))runAliases.set(alias,new Set());runAliases.get(alias).add(runKey);}
      const topic=String(r.tag||'Topic unavailable');aggregate(topics,JSON.stringify([gameID,topic]),{game,gameID,topic},r,runKey);
      const objective=String(s.objectiveID||r.objective||'');if(!objective)stats.missingObjectives++;
      const objectiveGroup=aggregate(objectives,JSON.stringify([gameID,objective]),{game,gameID,objective},r,runKey);
      if(s.objectiveLabel)objectiveGroup.labels.add(s.objectiveLabel);
      const option=g.options[s.selectedIndex];option.count++;
      if(knownCorrect(r.correct)){g.knownCorrectness++;option.knownCorrectness++;overview.knownCorrectness++;if(flag(r.correct)){g.correct++;option.correct++;overview.correct++;}}
    }
    const rollup=map=>[...map.values()].map(({runs,labels,...a})=>({...a,runCount:runs.size,labels:[...labels],labelConflict:labels.size>1}));
    const objectiveResults=rollup(objectives);
    return {stats,filters:{...filters},overview:{...overview,...timing(responseTimes),...runContext(prepared,runs,runAliases),runs:runs.size,questions:groups.size,files:files.size,games:[...games]},topics:rollup(topics),objectives:objectiveResults,
      groups:[...groups.values()].map(({runs,responseTimes,...g})=>({...g,...timing(responseTimes),runCount:runs.size,games:[...g.games],modes:[...g.modes]}))};
  }
  const plural=(n,one,many=one+'s')=>`${n} ${n===1?one:many}`;
  function duration(ms){if(ms===null||ms===undefined)return 'Not recorded';const seconds=Math.round(ms/1000),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60);return [hours?hours+'h':'',minutes?minutes+'m':'',seconds%60||!seconds?(seconds%60)+'s':''].filter(Boolean).join(' ');}
  function responseDuration(ms){return ms==null?'Not recorded':ms<100?'less than 0.1s':ms<60000?`${Number((ms/1000).toFixed(1))}s`:duration(ms);}
  const reviewMinimum=value=>Math.max(1,Math.floor(Number(value)||5));
  function runContextText(o){return `Whole-run context: recorded run time ${duration(o.recordedTimeMs)}; median run time ${duration(o.medianRunTimeMs)}; longest recorded correct-answer streak ${o.bestStreak===null?'not recorded':o.bestStreak}. Average completion time: ${duration(o.averageCompletionTimeMs)}, based on ${plural(o.completionRuns,'run')} with a recorded end time (including runs ended early). Time recorded for ${o.timedRuns}/${o.runs} runs; streaks for ${o.streakRuns}/${o.runs}. Includes answers outside the filters; incomplete exports may understate these values.`;}
  function objectiveLabel(group){
    const clean=value=>String(value||'').replace(/^LO\s*\d+(?:\.\d+)*(?:\s*[—–:_-]\s*|\s+|$)/i,'').replaceAll('_',' ').trim();
    const labels=[...new Set((group.labels||[]).map(clean).filter(Boolean))];
    return labels.join(' / ')||clean(group.objective)||'Learning objective description unavailable';
  }
  const accuracy=a=>a.knownCorrectness?`${Math.round(100*a.correct/a.knownCorrectness)}%`:'unavailable';
  const sufficient=(a,min=5)=>a.knownCorrectness>=min&&a.runCount>=2;
  function reviewQuestions(result,min=5){return result.groups.filter(g=>g.keyStatus!=='conflict'&&g.knownCorrectness>=min&&g.correct<g.knownCorrectness).sort((a,b)=>a.correct/a.knownCorrectness-b.correct/b.knownCorrectness||b.runCount-a.runCount||b.count-a.count).slice(0,5);}
  function feedbackSummary(result,{fileCount=0,minResponses=5,grouping='topics'}={}){
    const o=result.overview,s=result.stats,f=result.filters;
    const filters={exposure:{all:'all attempts',first:'first recorded exposures',repeat:'repeat exposures',unknown:'exposure unknown'},assistance:{all:'all responses regardless of choice removal',assisted:'one or more choices removed',unassisted:'no choices removed',unknown:'choice removal not recorded'}};
    const lines=[`Class Practice Summary${o.games.length?' — '+o.games.join(', '):''}`,
      `Overall accuracy: ${accuracy(o)} (${o.correct} of ${o.knownCorrectness} responses with a recorded result). ${plural(o.runs,'game run')} represented ${plural(s.included,'accepted response')} across ${plural(o.questions,'question version')}.`];
    const min=reviewMinimum(minResponses);
    const source=grouping==='objectives'?result.objectives.filter(a=>a.objective&&!a.labelConflict):result.topics.filter(a=>a.topic!=='Topic unavailable');
    const eligible=source.filter(a=>a.knownCorrectness>=min).sort((a,b)=>a.correct/a.knownCorrectness-b.correct/b.knownCorrectness||b.runCount-a.runCount);
    const label=a=>(o.games.length>1?a.game+' — ':'')+(grouping==='objectives'?objectiveLabel(a):a.topic.replaceAll('_',' '));
    const describe=a=>`${label(a)}: ${accuracy(a)} (${a.correct}/${a.knownCorrectness}; ${plural(a.runCount,'run')}${sufficient(a)?'':'; limited evidence'})`;
    if(s.keyConflicts||s.objectiveConflicts)lines.push('Conflicting answer-key or objective information needs review. Comparative conclusions are withheld until those records are checked.');
    else if(eligible.length){
      const low=eligible[0],high=eligible.at(-1);
      const differentRates=low.correct/low.knownCorrectness<high.correct/high.knownCorrectness;
      const priorities=eligible.filter(a=>a.correct<a.knownCorrectness&&(!differentRates||a.correct/a.knownCorrectness<high.correct/high.knownCorrectness));
      if(priorities.length){
        lines.push(`Start the review with ${describe(priorities[0])}.`);
        if(priorities.length>1)lines.push('Also review:\n'+priorities.slice(1,3).map(a=>`- ${describe(a)}.`).join('\n'));
        if(priorities.length>3)lines.push(`${plural(priorities.length-3,grouping==='objectives'?'additional learning objective':'additional topic')} with incorrect answers also ${priorities.length===4?'meets':'meet'} the review minimum. See the report for those results.`);
      }else lines.push(`Results meeting the review minimum: ${eligible.slice(0,3).map(describe).join('; ')}.${eligible.length>3?' See the report for the other results.':''}`);
      if(differentRates)lines.push(`Stronger results in this selection: ${describe(high)}.`);
      if(eligible.some(a=>!sufficient(a)))lines.push('Limited evidence: results below five responses or two identified runs are starting points for discussion.');
    }else lines.push(`There is too little evidence for a comparison at the selected minimum of ${plural(min,'response')}. No available ${grouping==='objectives'?'learning objectives':'topics'} meet that minimum.`);
    const review=reviewQuestions(result,min).slice(0,2),reviewArea=eligible.find(a=>a.correct<a.knownCorrectness);
    if(!s.keyConflicts&&!s.objectiveConflicts){
      if(review.length){
        lines.push('Questions to discuss:\n'+review.map((q,i)=>{
          const wrong=q.options.filter(o=>o.knownCorrectness>o.correct),max=Math.max(...wrong.map(o=>o.knownCorrectness-o.correct)),common=wrong.filter(o=>o.knownCorrectness-o.correct===max);
          const choice=common.length===1?` Most common choice marked incorrect: “${common[0].text}” (${plural(max,'response')}).`:` ${plural(common.length,'incorrect choice')} tied at ${plural(max,'response')} each; see the choice counts.`;
          return `- Review ${i+1}: ${q.prompt} — ${accuracy(q)} (${q.correct}/${q.knownCorrectness}; ${plural(q.runCount,'run')}${sufficient(q)?'':'; limited evidence'}).${choice}`;
        }).join('\n'));
        lines.push('Suggested next step: ask the class to explain the reasoning behind these choices, work through an example, then check understanding with a fresh question.');
      }else if(o.knownCorrectness&&o.correct===o.knownCorrectness)lines.push('All shown answers with a recorded result were correct. A fresh question or application can help check whether that understanding carries over.');
      else if(reviewArea){
        lines.push(`The ${grouping==='objectives'?'learning-objective':'topic'} results support a review, even though no individual question with an incorrect answer reaches the selected minimum of ${plural(min,'response')}.`);
        lines.push(`Suggested next step: ${sufficient(reviewArea)?'revisit':'explore'} ${label(reviewArea)} with a worked example, ask students to explain each step, then use a fresh question to check understanding.${sufficient(reviewArea)?'':' Treat this as an initial discussion because the evidence is limited.'}`);
      }else if(s.included)lines.push(`More responses are needed to choose a specific question or ${grouping==='objectives'?'learning objective':'topic'} to revisit at the selected review minimum.`);
    }
    lines.push(o.timedResponses?`Time per answered question: ${responseDuration(o.averageResponseTimeMs)} average; ${responseDuration(o.medianResponseTimeMs)} median (middle value), based on ${o.timedResponses} of ${plural(s.included,'shown answer')}.`:'Time per answered question: not recorded in the shown answers.');
    lines.push(runContextText(o));
    lines.push(`Selection: ${plural(fileCount,'file')} loaded; ${plural(o.files,'file')} represented. Filters: ${filters.exposure[f.exposure||'all']||'all attempts'}; ${filters.assistance[f.assistance||'all']||'all responses regardless of choice removal'}; mode ${f.mode&&f.mode!=='all'?f.mode:'all modes'}. Review minimum: ${plural(min,'response')} with a recorded result per topic, objective, or question.`);
    if(s.unresolved)lines.push(`${plural(s.unresolved,'accepted response')} lacked usable saved question details; this analysis excludes those records.`);
    if(s.missingObjectives)lines.push(`${plural(s.missingObjectives,'shown response')} had no learning objective.`);
    if(result.objectives.some(a=>a.labelConflict))lines.push('Some learning-objective descriptions conflict. Their original labels remain in the report; those objectives are excluded from feedback comparisons.');
    if(s.unverifiableIDs)lines.push(`${plural(s.unverifiableIDs,'response')} had no reliable answer identifier; overlapping exports may include repeats that cannot be verified.`);
    lines.push('Runs may include repeated practice by the same student and different questions. Recorded times may include idle time. Answer choices can guide discussion; they do not establish a specific misconception.');
    return lines.join('\n\n');
  }

  // Preserve each import so faculty can add or remove files without losing earlier work.
  function createCollection(){
    const files=new Map(),contents=new Map();let nextID=0;
    return {
      add(name,text){
        if(contents.has(text))return false;
        const rows=parseCSV(text),id=++nextID;
        files.set(id,{id,name,rows:rows.map(row=>({...row,__sourceFile:id})),text,answers:analyze(rows).stats.accepted});contents.set(text,id);return true;
      },
      remove(id){const file=files.get(id);if(file){contents.delete(file.text);files.delete(id);}},
      clear(){files.clear();contents.clear();},
      entries(){return [...files.values()].map(({text,rows,...file})=>file);},
      rows(){return [...files.values()].flatMap(file=>file.rows);}
    };
  }
  const api={parseCSV,analyze,createCollection,normalizeRow,plural,duration,responseDuration,runContextText,reviewMinimum,objectiveLabel,accuracy,sufficient,reviewQuestions,feedbackSummary};if(typeof module==='object'&&module.exports)module.exports=api;else root.MQAnswerAnalysis=api;
})(globalThis);
