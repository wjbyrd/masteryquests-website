(function(root){
  'use strict';
  const number=v=>v!==''&&v!=null&&typeof v!=='boolean'&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null;
  const median=values=>{const v=[...values].sort((a,b)=>a-b),i=Math.floor(v.length/2);return v.length?(v.length%2?v[i]:(v[i-1]+v[i])/2):null;};
  const known=v=>[0,1,'0','1',true,false,'true','false'].includes(v);
  const correct=v=>[1,'1',true,'true'].includes(v);
  const text=v=>typeof v==='string'?v.trim():'';
  const event=r=>r.event||r.event_type;
  const seq=r=>{const n=number(r.localSequence??r.sequence_number??r.sequenceNumber);return Number.isInteger(n)&&n>0?n:null;};
  const responseTime=r=>number(r.responseTimeMs??r.response_time_ms);
  const key=g=>JSON.stringify([g.gameID,String(g.questionID),g.revision]);
  function role(r){
    const roles=[r.remediationStage,r.remediation_stage,r.bridgeStage,r.bridge_stage,r.retestStage,r.retest_stage].map(text).filter(v=>['repair','bridge','retest'].includes(v));
    return new Set(roles).size>1?'Conflicting roles':roles[0]||'Not supplied';
  }
  const difficultyName=value=>{const v=text(value);if(!v||/^(unknown|none|null|undefined|n\/a|not supplied|not available|\d+)$/i.test(v))return 'Unknown';const common=['Easy','Medium','Hard','Elite','Legendary'].find(label=>label.toLowerCase()===v.toLowerCase());return common||v[0].toUpperCase()+v.slice(1);};
  // Accepted answers in both local and private exports carry difficulty.
  // Read that field directly; do not infer a missing value from mode.
  function recordedDifficulty(r){return difficultyName(r.difficulty);}
  function stats(items){
    const times=items.map(a=>responseTime(a.row)).filter(v=>v>0),graded=items.filter(a=>known(a.row.correct));
    return {count:items.length,correct:graded.filter(a=>correct(a.row.correct)).length,knownCorrectness:graded.length,
      runCount:new Set(items.map(a=>a.runKey).filter(Boolean)).size,questionCount:new Set(items.map(a=>a.key)).size,
      medianResponseTimeMs:median(times),averageResponseTimeMs:times.length?times.reduce((a,b)=>a+b,0)/times.length:null,timedResponses:times.length};
  }
  function group(items,label){
    const groups=new Map();for(const item of items){const name=label(item);if(!groups.has(name))groups.set(name,[]);groups.get(name).push(item);}
    return [...groups].map(([label,rows])=>({label,...stats(rows)}));
  }
  const completedEvents=new Set(['complete','legendary_complete','score_complete','timed_complete','quiz_complete','trialGraph_complete','exam_complete','fadingFortune_complete','riskReward_complete','unlimited_complete']);
  function outcome(value){
    if(completedEvents.has(value))return 'successful';
    if(value==='timed_ended_early'||/^(?:quiz|trialGraph|exam|unlimited|fadingFortune|riskReward|score|timed|legendary)_ended_by_student$/.test(value))return 'early';
    if(value==='riskReward_bust')return 'unsuccessful';
    return 'unknown';
  }
  function endStatus(r){
    const e=event(r);if(e!=='run_completed')return outcome(e);
    const claims=[r.completionStatus,r.completion_status,r.sourceEvent].filter(v=>v&&v!=='run_completed').map(outcome);
    return claims.length&&new Set(claims).size===1?claims[0]:'unknown';
  }
  function exactEncounters(allAnswers,events,snapshot,gameKey){
    const byRun=new Map(),answersByRow=new Map(allAnswers.map(a=>[a.row,a])),classification=new Map();
    for(const row of events){
      if(!answersByRow.has(row)&&!['rapid_guessing','rapid_guess_detected'].includes(event(row)))continue;
      const s=snapshot(row),run=row.runID||row.run_id;if(!run)continue;
      const runKey=JSON.stringify([gameKey(row,s),run]);if(!byRun.has(runKey))byRun.set(runKey,[]);
      byRun.get(runKey).push({row,s,seq:seq(row)});
    }
    for(const entries of byRun.values()){
      const ordered=entries.every(e=>e.seq!==null)&&new Set(entries.map(e=>e.seq)).size===entries.length;
      if(ordered)entries.sort((a,b)=>a.seq-b.seq);
      const history=new Map();
      for(const {row,s} of entries){
        const a=answersByRow.get(row),id=String(s?.questionID??row.questionID??row.question_id??''),prior=history.get(id)||[];
        if(a){
          const n=s.priorExposureCount;
          let category='Unavailable';
          if(n===0&&(!ordered||!prior.length))category='First encounter';
          else if(ordered&&prior.some(p=>p?.questionRevision===s.questionRevision)&&n!==0)category='Repeat encounter';
          else if(ordered&&Number.isInteger(n)&&n===prior.length&&prior.every(Boolean))category='First encounter';
          classification.set(row,category);
        }
        prior.push(s);history.set(id,prior);
      }
    }
    return classification;
  }
  function enrich(result,{allAnswers,answers,events,runEvents,runAliases,snapshot,gameKey,runAlias}){
    const grouped=new Map();for(const a of allAnswers){if(!grouped.has(a.key))grouped.set(a.key,[]);grouped.get(a.key).push(a);}
    let difficultyConflicts=0,roleConflicts=0;
    const metadata=new Map();
    for(const [k,items] of grouped){
      const levels=[...new Set(items.map(a=>recordedDifficulty(a.row)).filter(v=>v!=='Unknown'))];
      const roles=[...new Set(items.map(a=>role(a.row)).filter(v=>v!=='Not supplied'))];
      const conflict=levels.length>1;if(conflict)difficultyConflicts++;
      if(roles.includes('Conflicting roles'))roleConflicts++;
      metadata.set(k,{difficulty:conflict?'Unknown':levels[0]||'Unknown',difficultyConflict:conflict,
        reportedDifficulties:[...new Set(items.map(a=>difficultyName(a.row.difficulty)).filter(v=>v!=='Unknown'))],
        topics:[...new Set(items.map(a=>text(a.row.tag)).filter(Boolean))],
        objectives:[...new Set(items.map(a=>text(a.snapshot.objectiveLabel)||text(a.snapshot.objectiveID)||text(a.row.objective)).filter(Boolean))],
        objectiveIDs:[...new Set(items.map(a=>text(a.snapshot.objectiveID)||text(a.row.objective)).filter(Boolean))],
        types:[...new Set(items.map(a=>text(a.row.type||a.row.question_type||a.row.questionType)).filter(Boolean))],roles,
        bossStages:[...new Set(items.map(a=>text(a.row.boss_stage||a.row.bossStage)).filter(Boolean))]});
    }
    for(const g of result.groups){
      Object.assign(g,metadata.get(key(g)));
      const selected=answers.filter(a=>a.key===key(g));
      g.topics=[...new Set(selected.map(a=>String(a.row.tag||'Topic unavailable')))];
      g.objectiveIDs=[...new Set(selected.map(a=>String(a.snapshot.objectiveID||a.row.objective||'')))];
      g.objectives=[...new Set(selected.map(a=>text(a.snapshot.objectiveLabel)||text(a.snapshot.objectiveID)||text(a.row.objective)||'Not supplied'))];
      g.roles=[...new Set(selected.map(a=>role(a.row)).filter(v=>v!=='Not supplied'))];
      g.types=[...new Set(selected.map(a=>text(a.row.type||a.row.question_type||a.row.questionType)).filter(Boolean))];
      g.bossStages=[...new Set(selected.map(a=>text(a.row.boss_stage||a.row.bossStage)).filter(Boolean))];
      g.reportedDifficulties=[...new Set(selected.map(a=>difficultyName(a.row.difficulty)).filter(v=>v!=='Unknown'))];
    }
    result.difficulties=group(answers,a=>metadata.get(a.key).difficulty);
    for(const level of ['Easy','Medium','Hard','Elite','Legendary'])if(!result.difficulties.some(g=>g.label===level))result.difficulties.push({label:level,...stats([])});
    const order=['Easy','Medium','Hard','Elite','Legendary'];
    result.difficulties.sort((a,b)=>(a.label==='Unknown'?999:order.includes(a.label)?order.indexOf(a.label):10)-(b.label==='Unknown'?999:order.includes(b.label)?order.indexOf(b.label):10)||a.label.localeCompare(b.label));
    result.reportedDifficulties=group(answers,a=>difficultyName(a.row.difficulty));
    const exact=exactEncounters(allAnswers,events,snapshot,gameKey);
    result.encounters={question:['First encounter','Repeat encounter','Unavailable'].map(label=>({label,...stats(answers.filter(a=>(exact.get(a.row)||'Unavailable')===label))})),
      recorded:['first','repeat','unknown'].map(label=>({label,...stats(answers.filter(a=>a.exposure===label))})),skill:null};
    for(const g of result.groups)g.encounters=result.encounters.question.map(({label})=>({label,...stats(answers.filter(a=>a.key===key(g)&&(exact.get(a.row)||'Unavailable')===label))}));
    const runSequences=new Map();for(const a of allAnswers){if(!runSequences.has(a.runKey))runSequences.set(a.runKey,[]);runSequences.get(a.runKey).push(seq(a.row));}
    const orderedRuns=new Set([...runSequences].filter(([run,values])=>run&&values.every(v=>v!==null)&&new Set(values).size===values.length).map(([run])=>run));
    const byAttempt=new Map();for(const a of allAnswers){const id=a.row.attemptID;if(id&&a.runKey)byAttempt.set(JSON.stringify([a.runKey,id]),a);}
    const linkedRetests=answers.filter(a=>{
      if(role(a.row)!=='retest'||!orderedRuns.has(a.runKey)||!a.row.originAttemptID)return false;
      const origin=byAttempt.get(JSON.stringify([a.runKey,a.row.originAttemptID]));
      if(!origin||!known(origin.row.correct)||correct(origin.row.correct)||seq(origin.row)===null||seq(a.row)===null||seq(origin.row)>=seq(a.row))return false;
      return allAnswers.some(p=>p.runKey===a.runKey&&p.row.originAttemptID===a.row.originAttemptID&&['repair','bridge'].includes(role(p.row))&&seq(p.row)!==null&&seq(origin.row)<seq(p.row)&&seq(p.row)<seq(a.row));
    });
    result.remediation={roles:['repair','bridge','retest'].map(label=>({label,...stats(answers.filter(a=>role(a.row)===label))})),linkedRetests:stats(linkedRetests),
      linkedGroups:new Set(answers.filter(a=>a.runKey&&a.row.originAttemptID&&['repair','bridge','retest'].includes(role(a.row))).map(a=>JSON.stringify([a.runKey,a.row.originAttemptID]))).size,
      initiated:null,completed:null,incomplete:null};
    const bins=[['Under 15 s',t=>t<15000],['15–<30 s',t=>t>=15000&&t<30000],['30–<60 s',t=>t>=30000&&t<60000],['1–2 min (inclusive)',t=>t>=60000&&t<=120000],['Over 2 min',t=>t>120000]];
    result.distribution=bins.map(([label,includes])=>({label,count:answers.filter(a=>{const t=responseTime(a.row);return t>0&&includes(t);}).length}));
    result.coverage={encountered:result.groups.length,atLeastFive:result.groups.filter(g=>g.knownCorrectness>=5).length,atLeastTen:result.groups.filter(g=>g.knownCorrectness>=10).length,bankTotal:null};
    for(const [name,field] of [['topics','tag'],['objectives','objective']])for(const g of result[name]){
      const subset=answers.filter(a=>JSON.parse(a.key)[0]===g.gameID&&(field==='tag'?String(a.row.tag||'Topic unavailable'):String(a.snapshot.objectiveID||a.row.objective||''))===g[field==='tag'?'topic':'objective']);
      Object.assign(g,stats(subset));
      const perQuestion=group(subset,a=>a.key);g.atLeastFive=perQuestion.filter(q=>q.knownCorrectness>=5).length;g.atLeastTen=perQuestion.filter(q=>q.knownCorrectness>=10).length;
    }
    const represented=new Set(answers.map(a=>a.runKey).filter(Boolean)),runItems=new Map([...represented].map(k=>[k,{key:k,runID:JSON.parse(k)[1],gameID:JSON.parse(k)[0],statuses:new Set(),ended:false,time:null,endTime:null,successTime:null,attempts:null,answerCount:allAnswers.filter(a=>a.runKey===k).length}]));
    for(const row of runEvents){
      const run=row.runID||row.run_id;if(!run)continue;
      const s=snapshot(row),candidates=runAliases.get(runAlias(row));
      const k=s?JSON.stringify([gameKey(row,s),run]):candidates?.size===1?[...candidates][0]:null,item=runItems.get(k);if(!item)continue;
      const e=event(row),terminal=e==='run_completed'||e==='timed_ended_early'||e==='complete'||/_(?:complete|bust|ended_by_student)$/.test(e||'');
      const total=terminal?number(row.totalTimeMs):null,time=total>0?total:number(row.elapsedTimeMs??row.elapsed_time_ms);
      if(time>0)item.time=Math.max(item.time||0,time);
      if(terminal){
        item.ended=true;const status=endStatus(row);item.statuses.add(status);
        if(time>0)item.endTime=Math.max(item.endTime||0,time);
        if(status==='successful'){
          if(time>0)item.successTime=Math.max(item.successTime||0,time);
          const count=number(row.totalAttempts??row.mastery_attempts??row.masteryAttempts);
          if(Number.isInteger(count)&&count>=item.answerCount)item.attempts=Math.max(item.attempts??0,count);
        }
      }
    }
    result.runs=[...runItems.values()].map(({statuses,...r})=>({...r,status:statuses.size===1?[...statuses][0]:'unknown',conflict:statuses.size>1}));
    const successes=result.runs.filter(r=>r.status==='successful'),successTimes=successes.map(r=>r.successTime).filter(v=>v!==null),counts=successes.map(r=>r.attempts).filter(v=>v!==null);
    const identified=result.runs.filter(r=>r.status!=='unknown').length;
    result.progression={successful:successes.length,early:result.runs.filter(r=>r.status==='early').length,unsuccessful:result.runs.filter(r=>r.status==='unsuccessful').length,unknown:result.runs.filter(r=>r.status==='unknown').length,
      identified,represented:represented.size,successfulRate:identified?successes.length/represented.size:null,medianSuccessfulTimeMs:median(successTimes),successfulTimedRuns:successTimes.length,
      medianAnswersPerSuccess:median(counts),successfulCountedRuns:counts.length,checkpointRetryRate:null};
    result.quality={difficultyConflicts,roleConflicts,outcomeConflicts:result.runs.filter(r=>r.conflict).length};
    result.available={games:[...new Map(allAnswers.map(a=>[JSON.parse(a.key)[0],a.row.game||a.row.game_id||JSON.parse(a.key)[0]])).entries()].map(([id,label])=>({id,label})),
      runs:[...new Map(allAnswers.filter(a=>a.runKey).map(a=>[a.runKey,{id:a.runKey,label:(a.row.game||a.row.game_id||JSON.parse(a.key)[0])+' · '+(a.row.runID||a.row.run_id)}])).values()]};
    return result;
  }
  const api={enrich,median,stats,recordedDifficulty,endStatus};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.MQDashboardAnalysis=api;
})(globalThis);
