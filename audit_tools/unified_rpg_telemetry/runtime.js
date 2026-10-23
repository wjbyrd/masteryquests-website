/* Local CSV boundary only. Never calls gameplay, clocks, randomness or transport. */
function createRpgCsvContract(get) {
  const schema = /* RPG_SCHEMA */ null;
  const present=v=>v!==undefined&&v!==null&&v!=='';
  const response=e=>['question','rapid_guessing','exam_answer_initial','exam_answer_revision'].includes(e);
  const terminal=e=>e==='complete'||e==='timed_ended_early'||/(?:^|_)(?:complete|bust|ended_by_student)$/.test(e||'');
  function collection(){
    const c=get('FACULTY_COMPOSITION_CONFIG',{}),slug=String(c.slug||'').replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase();
    return c.composerVersion?'faculty-composer':schema.games[slug]?.collection||'faculty-composer';
  }
  function applicable(f,row){
    const mode=row.mode,event=row.event;
    switch(f.scope){
      case 'accepted':return event==='question';
      case 'response':return response(event)||(['attempt','streak'].includes(f.name)&&terminal(event));
      case 'riskReward':return mode==='riskReward';
      case 'fadingFortune':return mode==='fadingFortune';
      case 'exam':return mode==='exam';
      case 'daily':
        if(['dailyMsSinceCompletion','dailyQuestionsToComplete','dailyElapsedToCompleteMs','dailyCompletionTimestamp'].includes(f.name)&&!row.dailyCompleted&&!row.dailyCompletionTimestamp)return false;
        return Boolean(row.dailyID)||event?.startsWith('daily_');
      case 'artifact':return mode!=='exam'&&mode!=='timed'&&mode!=='legendary';
      case 'summary':return terminal(event);
      case 'checkpoint':return /boss|checkpoint|exam_section/.test(event||'')||response(event);
      default:
        if(f.name==='score')return ['score','riskReward','fadingFortune'].includes(mode);
        if(f.name==='bestScore')return mode==='score';
        if(['tag','type','objective','questionVersion','difficulty','questionID'].includes(f.name))return present(row.questionID)&&String(row.questionID)!=='0';
        return true;
    }
  }
  function capture(row,data){
    const values={},missing={},family=collection();
    for(const f of schema.fields){
      const name=f.name;
      if(['csvSchemaVersion','collectionID','fieldAvailabilityJSON'].includes(name))continue;
      if(!applicable(f,{...row,dailyID:row.dailyID||data.dailyID,dailyCompleted:data.dailyCompleted??row.dailyCompleted,dailyCompletionTimestamp:data.dailyCompletionTimestamp??row.dailyCompletionTimestamp})){missing[name]='not-applicable';continue;}
      let value;
      if(f.scope==='metadata')value=row[name];
      else {
        const key=f.sources.find(k=>present(data[k]));
        if(family==='managerial-intelligence-directorate'&&present(row.gameplayResponseTimeMs)&&(name==='responseTimeMs'||schema.behaviorFields.includes(name)))value=row[name];
        else if(key)value=data[key];
        // These fields are observations computed by the existing serializer/tracker.
        else if(['priorExposureCount','firstExposure','supportJSON','answerSnapshotJSON','canonicalSelectedIndex'].includes(name))value=row[name];
        else if(name==='gameplayResponseTimeMs'&&family==='managerial-intelligence-directorate')value=row[name];
        else if(schema.behaviorFields.includes(name)&&present(data.activeResponseTime??data.activeResponseTimeMs)&&family!=='micro-domains')value=row[name];
        else if(name.startsWith('daily')&&!['dailyCompletedNow','dailyWindowFailed'].includes(name)&&row.dailyID)value=row[name];
        else if(['room','adaptiveMode','remediationStage','questionVersion','difficulty'].includes(name))value=row[name];
      }
      if(schema.behaviorFields.includes(name)&&family==='micro-domains'){missing[name]='not-measured';continue;}
      if(name==='gameplayResponseTimeMs'&&family!=='managerial-intelligence-directorate'){missing[name]='not-applicable';continue;}
      if(!present(value)){missing[name]='not-measured';continue;}
      if(typeof value==='number'&&!Number.isFinite(value)){missing[name]='unavailable';continue;}
      if(/index/i.test(name)&&typeof value==='number'&&value<0){missing[name]='unavailable';continue;}
      values[name]=typeof value==='boolean'?Number(value):value;
    }
    // Reference unchanged raw observations instead of duplicating large snapshots.
    const reasons=['','not-applicable','not-measured','unavailable','legacy-ambiguous'];
    const status=schema.fields.map(f=>String(Math.max(0,reasons.indexOf(missing[f.name]||'')))).join('');
    for(const name of Object.keys(values))if(values[name]===row[name])delete values[name];
    return {version:schema.version,collection:family,values,status};
  }
  function normalize(row,context={}){
    const saved=row._rpgCsv,values={},missing={};
    for(const [i,f] of schema.fields.entries()){
      const name=f.name;if(['csvSchemaVersion','collectionID','fieldAvailabilityJSON'].includes(name))continue;
      if(saved?.version===schema.version){
        if(present(saved.values[name]))values[name]=saved.values[name];
        else if((saved.status?.[i]==='0'||saved.recorded?.includes(name))&&present(row[name]))values[name]=row[name];
        else missing[name]=['','not-applicable','not-measured','unavailable','legacy-ambiguous'][Number(saved.status?.[i])]||saved.missing?.[name]||'not-measured';
        // Export manifests and later delivery-quality enrichment use current metadata.
        if(f.scope==='metadata'&&present(row[name])){values[name]=row[name];delete missing[name];}
      }else if(!applicable(f,row))missing[name]='not-applicable';
      else if(!present(row[name]))missing[name]='not-measured';
      else if(typeof row[name]==='number'&&!Number.isFinite(row[name]))missing[name]='unavailable';
      else if((row[name]===0||row[name]===false||row[name]===-1)&&f.scope!=='metadata'&&!(name==='correct'&&row.event==='question'))missing[name]='legacy-ambiguous';
      else values[name]=row[name];
      if(name==='correct'&&row.event!=='question'){delete values[name];missing[name]='not-applicable';}
    }
    const activeExam=context.activeExam && row.mode==='exam';
    if(activeExam){for(const name of schema.columns.filter(name=>name.startsWith('daily')||['correct','streak','maxStreak','score','bestScore','examChangedCorrect','examChangedIncorrect','checkpointCorrect','checkpointOutcome','bossTargetLabel','accuracy'].includes(name))){delete values[name];missing[name]='unavailable';}}
    if(values.answerSnapshotJSON&&(activeExam||row.event!=='question')){
      try{const s=JSON.parse(values.answerSnapshotJSON);s.correctOptionIndices=null;values.answerSnapshotJSON=JSON.stringify(s);}catch(_){delete values.answerSnapshotJSON;missing.answerSnapshotJSON='unavailable';}
    }
    values.csvSchemaVersion=schema.version;
    values.collectionID=saved?.collection||context.collection||collection();
    values.fieldAvailabilityJSON=JSON.stringify(missing);
    return values;
  }
  return {columns:schema.columns,capture,normalize,collection,version:schema.version};
}
