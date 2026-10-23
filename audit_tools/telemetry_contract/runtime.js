// BEGIN UNIFIED RPG CSV
/* Local CSV boundary only. Never calls gameplay, clocks, randomness or transport. */
function createRpgCsvContract(get) {
  const schema = /* RPG_SCHEMA */ {"version":"mq-rpg-csv/1","columns":["contractID","manifestID","provenanceStatus","presentationID","attemptID","canonicalSelectedIndex","localSequence","manifestJSON","deliveryQuality","supportJSON","originAttemptID","resourceID","eventID","timestamp","telemetryVersion","gameVersion","runID","game","mode","event","room","questionID","questionVersion","difficulty","selectedIndex","correct","rapidGuessing","tag","type","objective","responseTimeMs","activeResponseTimeMs","hiddenTimeMs","tabSwitchCount","timeAfterReturnMs","focusLossCount","unfocusedTimeMs","timeAfterFocusMs","selectionCount","maxSelectedChars","questionSelected","answersSelected","copyCount","questionCopied","answersCopied","lastCopyElapsedMs","timeCopyToHideMs","timeCopyToBlurMs","attempt","streak","elapsedTimeMs","adaptiveMode","remediationStage","priorExposureCount","firstExposure","score","bestScore","totalTimeMs","accuracy","maxStreak","totalAttempts","verificationCode","fadingFortuneScore","fadingFortuneQuestionValue","fadingFortuneFadeCount","fadingFortuneIntervalMs","fadingFortunePausedDurationMs","fadingFortuneMaxScore","fadingFortuneAverageValue","fadingFortuneDistribution","dailyID","dailyDate","dailyFamily","dailyTarget","dailyWindowSize","dailyEligibleFamilies","dailyProgressBefore","dailyProgressAfter","dailyWindowAttempt","dailyCompleted","dailyCompletionTimestamp","dailyAlreadyComplete","dailyPostCompletionQuestions","dailyMsSinceCompletion","dailyQuestionsToComplete","dailyElapsedToCompleteMs","dailyConcept","dailyCompletedNow","dailyWindowFailed","examSection","examInitialSelectedIndex","examFinalSelectedIndex","examRevisionCount","examNavigationFrom","examNavigationTo","examReturnVisit","examSkippedRevisit","examReviewTimeMs","examChangedCorrect","examChangedIncorrect","bossTargetLabel","checkpointOutcome","checkpointCorrect","checkpointTotal","artifactAvailable","artifactSlot","artifactDistractorsRemoved","artifactFinalAnswer","artifactAssisted","artifactAssistedCorrect","artifactSkippedRooms","artifactSkippedRoomIDs","artifactSkipRemaining","artifactFailedReason","artifactInventoryBefore","artifactInventoryAfter","answerSnapshotJSON","riskRewardBankrollBefore","riskRewardWagerAmount","riskRewardWagerPercent","riskRewardWagerTier","riskRewardBankrollAfter","riskRewardAllIn","riskRewardStartingBankroll","riskRewardFinalBankroll","riskRewardNet","riskRewardPeakBankroll","riskRewardLargestWager","riskRewardAllInAttempts","riskRewardBusted","riskRewardQuestionsCompleted","riskRewardTarget","riskRewardWagerDistribution","gameplayResponseTimeMs","csvSchemaVersion","collectionID","fieldAvailabilityJSON"],"behaviorFields":["activeResponseTimeMs","hiddenTimeMs","tabSwitchCount","timeAfterReturnMs","focusLossCount","unfocusedTimeMs","timeAfterFocusMs","selectionCount","maxSelectedChars","questionSelected","answersSelected","copyCount","questionCopied","answersCopied","lastCopyElapsedMs","timeCopyToHideMs","timeCopyToBlurMs"],"games":{"Arcane Archive / faculty-generated games":{"collection":"faculty-composer","modes":["standard","timed","exam","quiz","unlimited","legendary","score","trialGraph","fadingFortune","riskReward"]},"equilibrium-crisis":{"collection":"economic-realm","modes":["standard","timed","exam","quiz","unlimited","legendary","score","trialGraph","fadingFortune","riskReward"]},"liquidity-grid":{"collection":"economic-realm","modes":["standard","timed","exam","quiz","unlimited","legendary","score","fadingFortune","riskReward"]},"market-gate":{"collection":"economic-realm","modes":["standard","timed","exam","quiz","unlimited","legendary","score","trialGraph","fadingFortune","riskReward"]},"national-ledger":{"collection":"economic-realm","modes":["standard","timed","exam","quiz","unlimited","legendary","score","fadingFortune","riskReward"]},"stabilization-protocol":{"collection":"economic-realm","modes":["standard","timed","exam","quiz","unlimited","legendary","score","trialGraph","fadingFortune","riskReward"]},"command-nexus":{"collection":"macro-command-system","modes":["standard","timed","exam","quiz","unlimited","legendary","score","fadingFortune","riskReward"]},"exchange-citadel":{"collection":"macro-command-system","modes":["standard","timed","exam","quiz","unlimited","legendary","score","fadingFortune","riskReward"]},"mint-ash-gold":{"collection":"macro-command-system","modes":["standard","timed","exam","quiz","unlimited","legendary","score","fadingFortune","riskReward"]},"national-engine":{"collection":"macro-command-system","modes":["standard","timed","exam","quiz","unlimited","legendary","score","fadingFortune","riskReward"]},"agency-protocol":{"collection":"managerial-intelligence-directorate","modes":["standard","timed","exam","quiz","unlimited","legendary","score","fadingFortune","riskReward"]},"cost-directive":{"collection":"managerial-intelligence-directorate","modes":["standard","timed","exam","quiz","unlimited","legendary","score","fadingFortune","riskReward"]},"market-signal":{"collection":"managerial-intelligence-directorate","modes":["standard","timed","exam","quiz","unlimited","legendary","score","trialGraph","fadingFortune","riskReward"]},"strategy-desk":{"collection":"managerial-intelligence-directorate","modes":["standard","timed","exam","quiz","unlimited","legendary","score","trialGraph","fadingFortune","riskReward"]},"labyrinth-of-choice":{"collection":"micro-domains","modes":["standard","timed","exam","quiz","unlimited","legendary","score","trialGraph","fadingFortune","riskReward"]},"labyrinth-choice":{"collection":"micro-domains","modes":["standard","timed","exam","quiz","unlimited","legendary","score","trialGraph","fadingFortune","riskReward"]}},"fields":[{"name":"contractID","scope":"metadata","sources":["contractID"]},{"name":"manifestID","scope":"metadata","sources":["manifestID"]},{"name":"provenanceStatus","scope":"metadata","sources":["provenanceStatus"]},{"name":"presentationID","scope":"metadata","sources":["presentationID"]},{"name":"attemptID","scope":"metadata","sources":["attemptID"]},{"name":"canonicalSelectedIndex","scope":"response","sources":["canonicalSelectedIndex"]},{"name":"localSequence","scope":"metadata","sources":["localSequence"]},{"name":"manifestJSON","scope":"metadata","sources":["manifestJSON"]},{"name":"deliveryQuality","scope":"metadata","sources":["deliveryQuality"]},{"name":"supportJSON","scope":"response","sources":["supportJSON"]},{"name":"originAttemptID","scope":"metadata","sources":["originAttemptID"]},{"name":"resourceID","scope":"metadata","sources":["resourceID"]},{"name":"eventID","scope":"metadata","sources":["eventID"]},{"name":"timestamp","scope":"metadata","sources":["timestamp"]},{"name":"telemetryVersion","scope":"metadata","sources":["telemetryVersion"]},{"name":"gameVersion","scope":"metadata","sources":["gameVersion"]},{"name":"runID","scope":"metadata","sources":["runID"]},{"name":"game","scope":"metadata","sources":["game"]},{"name":"mode","scope":"metadata","sources":["mode"]},{"name":"event","scope":"metadata","sources":["event"]},{"name":"room","scope":"context","sources":["room"]},{"name":"questionID","scope":"context","sources":["questionId","question"]},{"name":"questionVersion","scope":"context","sources":["questionVersion"]},{"name":"difficulty","scope":"context","sources":["difficulty"]},{"name":"selectedIndex","scope":"response","sources":["selectedIndex"]},{"name":"correct","scope":"accepted","sources":["correct"]},{"name":"rapidGuessing","scope":"response","sources":["rapidGuessing"]},{"name":"tag","scope":"context","sources":["tag"]},{"name":"type","scope":"context","sources":["type"]},{"name":"objective","scope":"context","sources":["objective"]},{"name":"responseTimeMs","scope":"response","sources":["responseTime","responseTimeMs"]},{"name":"activeResponseTimeMs","scope":"response","sources":["activeResponseTime","activeResponseTimeMs"]},{"name":"hiddenTimeMs","scope":"response","sources":["hiddenTime","hiddenTimeMs"]},{"name":"tabSwitchCount","scope":"response","sources":["tabSwitchCount"]},{"name":"timeAfterReturnMs","scope":"response","sources":["timeAfterReturn","timeAfterReturnMs"]},{"name":"focusLossCount","scope":"response","sources":["focusLossCount"]},{"name":"unfocusedTimeMs","scope":"response","sources":["unfocusedTimeMs"]},{"name":"timeAfterFocusMs","scope":"response","sources":["timeAfterFocusMs"]},{"name":"selectionCount","scope":"response","sources":["selectionCount"]},{"name":"maxSelectedChars","scope":"response","sources":["maxSelectedChars"]},{"name":"questionSelected","scope":"response","sources":["questionSelected"]},{"name":"answersSelected","scope":"response","sources":["answersSelected"]},{"name":"copyCount","scope":"response","sources":["copyCount"]},{"name":"questionCopied","scope":"response","sources":["questionCopied"]},{"name":"answersCopied","scope":"response","sources":["answersCopied"]},{"name":"lastCopyElapsedMs","scope":"response","sources":["lastCopyElapsedMs"]},{"name":"timeCopyToHideMs","scope":"response","sources":["timeCopyToHideMs"]},{"name":"timeCopyToBlurMs","scope":"response","sources":["timeCopyToBlurMs"]},{"name":"attempt","scope":"response","sources":["attempt"]},{"name":"streak","scope":"response","sources":["streak"]},{"name":"elapsedTimeMs","scope":"context","sources":["elapsedTime","elapsedTimeMs","totalTime","totalTimeMs"]},{"name":"adaptiveMode","scope":"context","sources":["adaptiveMode"]},{"name":"remediationStage","scope":"context","sources":["remediationStage"]},{"name":"priorExposureCount","scope":"response","sources":["priorExposureCount"]},{"name":"firstExposure","scope":"response","sources":["firstExposure"]},{"name":"score","scope":"context","sources":["score"]},{"name":"bestScore","scope":"context","sources":["bestScore"]},{"name":"totalTimeMs","scope":"summary","sources":["totalTime","totalTimeMs"]},{"name":"accuracy","scope":"summary","sources":["accuracy"]},{"name":"maxStreak","scope":"summary","sources":["maxStreak"]},{"name":"totalAttempts","scope":"summary","sources":["totalAttempts","attempts"]},{"name":"verificationCode","scope":"summary","sources":["verificationCode","code"]},{"name":"fadingFortuneScore","scope":"fadingFortune","sources":["fadingFortuneScore"]},{"name":"fadingFortuneQuestionValue","scope":"fadingFortune","sources":["fadingFortuneQuestionValue"]},{"name":"fadingFortuneFadeCount","scope":"fadingFortune","sources":["fadingFortuneFadeCount"]},{"name":"fadingFortuneIntervalMs","scope":"fadingFortune","sources":["fadingFortuneIntervalMs"]},{"name":"fadingFortunePausedDurationMs","scope":"fadingFortune","sources":["fadingFortunePausedDurationMs"]},{"name":"fadingFortuneMaxScore","scope":"fadingFortune","sources":["fadingFortuneMaxScore"]},{"name":"fadingFortuneAverageValue","scope":"fadingFortune","sources":["fadingFortuneAverageValue"]},{"name":"fadingFortuneDistribution","scope":"fadingFortune","sources":["fadingFortuneDistribution"]},{"name":"dailyID","scope":"daily","sources":["dailyID"]},{"name":"dailyDate","scope":"daily","sources":["dailyDate"]},{"name":"dailyFamily","scope":"daily","sources":["dailyFamily"]},{"name":"dailyTarget","scope":"daily","sources":["dailyTarget"]},{"name":"dailyWindowSize","scope":"daily","sources":["dailyWindowSize"]},{"name":"dailyEligibleFamilies","scope":"daily","sources":["dailyEligibleFamilies"]},{"name":"dailyProgressBefore","scope":"daily","sources":["dailyProgressBefore"]},{"name":"dailyProgressAfter","scope":"daily","sources":["dailyProgressAfter"]},{"name":"dailyWindowAttempt","scope":"daily","sources":["dailyWindowAttempt"]},{"name":"dailyCompleted","scope":"daily","sources":["dailyCompleted"]},{"name":"dailyCompletionTimestamp","scope":"daily","sources":["dailyCompletionTimestamp"]},{"name":"dailyAlreadyComplete","scope":"daily","sources":["dailyAlreadyComplete"]},{"name":"dailyPostCompletionQuestions","scope":"daily","sources":["dailyPostCompletionQuestions"]},{"name":"dailyMsSinceCompletion","scope":"daily","sources":["dailyMsSinceCompletion"]},{"name":"dailyQuestionsToComplete","scope":"daily","sources":["dailyQuestionsToComplete"]},{"name":"dailyElapsedToCompleteMs","scope":"daily","sources":["dailyElapsedToCompleteMs"]},{"name":"dailyConcept","scope":"daily","sources":["dailyConcept"]},{"name":"dailyCompletedNow","scope":"daily","sources":["dailyCompletedNow"]},{"name":"dailyWindowFailed","scope":"daily","sources":["dailyWindowFailed"]},{"name":"examSection","scope":"exam","sources":["examSection"]},{"name":"examInitialSelectedIndex","scope":"exam","sources":["examInitialSelectedIndex"]},{"name":"examFinalSelectedIndex","scope":"exam","sources":["examFinalSelectedIndex"]},{"name":"examRevisionCount","scope":"exam","sources":["examRevisionCount"]},{"name":"examNavigationFrom","scope":"exam","sources":["examNavigationFrom"]},{"name":"examNavigationTo","scope":"exam","sources":["examNavigationTo"]},{"name":"examReturnVisit","scope":"exam","sources":["examReturnVisit"]},{"name":"examSkippedRevisit","scope":"exam","sources":["examSkippedRevisit"]},{"name":"examReviewTimeMs","scope":"exam","sources":["examReviewTimeMs"]},{"name":"examChangedCorrect","scope":"exam","sources":["examChangedCorrect"]},{"name":"examChangedIncorrect","scope":"exam","sources":["examChangedIncorrect"]},{"name":"bossTargetLabel","scope":"checkpoint","sources":["bossTargetLabel"]},{"name":"checkpointOutcome","scope":"checkpoint","sources":["checkpointOutcome"]},{"name":"checkpointCorrect","scope":"checkpoint","sources":["checkpointCorrect"]},{"name":"checkpointTotal","scope":"checkpoint","sources":["checkpointTotal"]},{"name":"artifactAvailable","scope":"artifact","sources":["artifactAvailable"]},{"name":"artifactSlot","scope":"artifact","sources":["artifactSlot"]},{"name":"artifactDistractorsRemoved","scope":"artifact","sources":["artifactDistractorsRemoved"]},{"name":"artifactFinalAnswer","scope":"artifact","sources":["artifactFinalAnswer"]},{"name":"artifactAssisted","scope":"artifact","sources":["artifactAssisted"]},{"name":"artifactAssistedCorrect","scope":"artifact","sources":["artifactAssistedCorrect"]},{"name":"artifactSkippedRooms","scope":"artifact","sources":["artifactSkippedRooms"]},{"name":"artifactSkippedRoomIDs","scope":"artifact","sources":["artifactSkippedRoomIDs"]},{"name":"artifactSkipRemaining","scope":"artifact","sources":["artifactSkipRemaining"]},{"name":"artifactFailedReason","scope":"artifact","sources":["artifactFailedReason"]},{"name":"artifactInventoryBefore","scope":"artifact","sources":["artifactInventoryBefore"]},{"name":"artifactInventoryAfter","scope":"artifact","sources":["artifactInventoryAfter"]},{"name":"answerSnapshotJSON","scope":"response","sources":["answerSnapshotJSON"]},{"name":"riskRewardBankrollBefore","scope":"riskReward","sources":["riskRewardBankrollBefore"]},{"name":"riskRewardWagerAmount","scope":"riskReward","sources":["riskRewardWagerAmount"]},{"name":"riskRewardWagerPercent","scope":"riskReward","sources":["riskRewardWagerPercent"]},{"name":"riskRewardWagerTier","scope":"riskReward","sources":["riskRewardWagerTier"]},{"name":"riskRewardBankrollAfter","scope":"riskReward","sources":["riskRewardBankrollAfter"]},{"name":"riskRewardAllIn","scope":"riskReward","sources":["riskRewardAllIn"]},{"name":"riskRewardStartingBankroll","scope":"riskReward","sources":["riskRewardStartingBankroll"]},{"name":"riskRewardFinalBankroll","scope":"riskReward","sources":["riskRewardFinalBankroll"]},{"name":"riskRewardNet","scope":"riskReward","sources":["riskRewardNet"]},{"name":"riskRewardPeakBankroll","scope":"riskReward","sources":["riskRewardPeakBankroll"]},{"name":"riskRewardLargestWager","scope":"riskReward","sources":["riskRewardLargestWager"]},{"name":"riskRewardAllInAttempts","scope":"riskReward","sources":["riskRewardAllInAttempts"]},{"name":"riskRewardBusted","scope":"riskReward","sources":["riskRewardBusted"]},{"name":"riskRewardQuestionsCompleted","scope":"riskReward","sources":["riskRewardQuestionsCompleted"]},{"name":"riskRewardTarget","scope":"riskReward","sources":["riskRewardTarget"]},{"name":"riskRewardWagerDistribution","scope":"riskReward","sources":["riskRewardWagerDistribution"]},{"name":"gameplayResponseTimeMs","scope":"response","sources":["gameplayResponseTimeMs"]},{"name":"csvSchemaVersion","scope":"metadata","sources":[]},{"name":"collectionID","scope":"metadata","sources":[]},{"name":"fieldAvailabilityJSON","scope":"metadata","sources":[]}]};
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
// END UNIFIED RPG CSV
/* Maintained measurement metadata only. No clocks, scoring, network or learner identity. */
function createTelemetryContract(get, registry) {
  const rpgCsv=createRpgCsvContract(get);
  function stable(value) {
    if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k)+':'+stable(value[k])).join(',') + '}';
    return JSON.stringify(value === undefined ? null : value);
  }
  // SHA-256 over UTF-8; artifact/configuration fingerprints, never browser fingerprints.
  function hash(value) {
    const bytes = unescape(encodeURIComponent(typeof value==='string'?value:stable(value))).split('').map(c=>c.charCodeAt(0));
    const length=bytes.length*8; bytes.push(128); while(bytes.length%64!==56)bytes.push(0);
    for(let i=7;i>=0;i--)bytes.push(i>=4?0:(length>>> (i*8))&255);
    const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const k=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const r=(v,n)=>(v>>>n)|(v<<(32-n));
    for(let off=0;off<bytes.length;off+=64){const w=[];for(let i=0;i<16;i++)w[i]=(bytes[off+i*4]<<24)|(bytes[off+i*4+1]<<16)|(bytes[off+i*4+2]<<8)|bytes[off+i*4+3];
      for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=(w[i-16]+(r(a,7)^r(a,18)^(a>>>3))+w[i-7]+(r(b,17)^r(b,19)^(b>>>10)))|0;}
      let [a,b,c,d,e,f,g,z]=h;for(let i=0;i<64;i++){const t1=(z+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+k[i]+w[i])|0,t2=((r(a,2)^r(a,13)^r(a,22))+((a&b)^(a&c)^(b&c)))|0;z=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;}[a,b,c,d,e,f,g,z].forEach((v,i)=>h[i]=(h[i]+v)|0);
    } return h.map(v=>(v>>>0).toString(16).padStart(8,'0')).join('');
  }
  const fields=['contractID','manifestID','provenanceStatus','presentationID','attemptID','canonicalSelectedIndex','localSequence','manifestJSON','deliveryQuality','supportJSON','originAttemptID','resourceID','answerSnapshotJSON'];
  const memory=new Map(); let cachedBuild=null;
  const uuid=()=>get('createTelemetryEventID',null)?.() || globalThis.crypto.randomUUID();
  const ids=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x)).sort():[];
  const number=v=>Number.isFinite(v)?v:null;
  function config(){
    const c=get('FACULTY_COMPOSITION_CONFIG',{}),scopes={};
    for(const id of ids(Object.keys(c.contentScopes||{}))){const s=c.contentScopes[id];scopes[id]={preset:['standard','brief','full','custom'].includes(s?.preset)?s.preset:null,outcomeIds:ids(s?.outcomeIds)};}
    return {recipeSchema:c.composerVersion?String(c.schemaVersion):null,selectedConceptIds:ids(c.selectedConceptIds),contentScopes:scopes,
      policyFingerprint:/^[a-f0-9]{64}$/.test(c.facultyOutcomePolicySha256||'')?c.facultyOutcomePolicySha256:null,
      samplingStrategies:Object.fromEntries(['quiz','trialGraph','fadingFortune','riskReward'].map(k=>[k,['balanced','adaptive'].includes(c.limitedRunSampling?.[k]?.strategy)?c.limitedRunSampling[k].strategy:null])),
      supportedModes:ids(c.supportedModes),dailyChallengesEnabled:typeof c.dailyChallengesEnabled==='boolean'?c.dailyChallengesEnabled:null,
      checkpoints:Object.fromEntries(['checkpointOne','checkpointTwo','finalCheckpoint'].map(k=>[k,ids(c.checkpointFocus?.[k])])),
      fadingIntervals:Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,number(c.fadingFortune?.intervals?.[k])])),
      startingBankroll:number(get('RISK_REWARD_STARTING_BANKROLL',null)),wagerRatios:(c.riskReward?.wagerOptions||[]).map(x=>number(x.ratio))};
  }
  function build(){
    if(cachedBuild)return cachedBuild;
    const c=config(),configSource=get('FACULTY_COMPOSITION_CONFIG',{}),game=String(configSource.slug||'').replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase();
    const source=configSource.composerVersion?registry.games.composer:(registry.games[game]||registry.games.composer);
    const script=typeof document!=='undefined'?document.currentScript?.src||'':'';
    const engineRevision=script.includes('/managerial-directorate-classroom/')?source.classroomEngineRevision:script.includes('/managerial-directorate-telemetry-poc/')?source.pocEngineRevision:source.engineRevision;
    // Hash available pools once per document, before any question is shuffled.
    const pools=Object.fromEntries(['questionBanks','challengeQuestionBanks','repairQuestions','bridgeQuestions','microSkillRepairPools','microSkillBridgePools','skillRepairSeedPools'].map(k=>[k,get(k,null)]));
    cachedBuild={manifestSchema:'mq-run-manifest/1',contractID:registry.contractID,measurementRevision:registry.measurementRevision,
      engineRevision,trackerSourceRevision:registry.trackerSourceRevision,assetRevision:source.assetRevision,contentRevision:hash(pools),configuration:c,configurationRevision:hash(c)};
    cachedBuild.buildRevision=hash(cachedBuild);
    return cachedBuild;
  }
  function key(run){return String(get('TELEMETRY_PREFIX','mq-local:'))+'contract:'+run;}
  function state(run){
    if(memory.has(run))return memory.get(run);
    let s;try{s=JSON.parse(localStorage.getItem(key(run))||'null');}catch(_){}
    if(!s||s.version!==1)s={version:1,sequence:0,manifests:{},slots:{},quality:{storageFailures:0}};
    memory.set(run,s);return s;
  }
  function persist(run,s){try{localStorage['setItem'](key(run),JSON.stringify(s));}catch(_){s.quality.storageFailures++;}}
  function runKey(){return String(get('runID',''));}
  function slot(q=get('currentQuestion',{})){return [get('gameMode','standard'),get('room',0),q?.id??q?.questionId??''].join(':');}
  // Read the same authored key used by gameplay, only after an accepted response.
  function correctOptions(q,options,mapping){
    if(Number.isInteger(q.a))return q.a>=0&&q.a<options.length?[mapping[q.a]]:null;
    if(typeof q.aHash!=='string')return null;
    const expected=q.aHash.trim().replace(/^sha256:/i,'');
    const normalize=get('normalizePublishedAnswer',null)||get('normalizeAnswerText',null)||
      (v=>String(v).normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase());
    const matches=[];
    options.forEach((text,i)=>{const digest=hash(normalize(text));
      const base64=typeof btoa==='function'?btoa(digest.match(/../g).map(x=>String.fromCharCode(parseInt(x,16))).join('')):'';
      if(digest===expected.toLowerCase()||(base64&&base64.replace(/=+$/,'')===expected.replace(/=+$/,'')))matches.push(mapping[i]);
    });
    return matches.length?matches.sort((a,b)=>a-b):null;
  }
  // Freeze only this answered question. Never serialize the question bank.
  // The revision separates edited questions even when their ID is reused.
  function answerSnapshot(q,row,b){
    try {
      if(!q || String(q.id??q.questionId??'')!==String(row.questionID??'') || !Array.isArray(q.options))return null;
      const prompt=q.q??q.question,options=q.options.slice(),selected=row.selectedIndex;
      if(typeof prompt!=='string'||prompt.length>12000||options.length<2||options.length>20||
        options.some(x=>typeof x!=='string'||x.length>4000)||!Number.isInteger(selected)||selected<0||selected>=options.length)return null;
      const mapping=q.telemetryOptionIndices;
      const canonical=Array.isArray(mapping)&&mapping.length===options.length&&new Set(mapping).size===options.length&&
        mapping.every(i=>Number.isInteger(i)&&i>=0&&i<options.length);
      const ordered=canonical?Array.from({length:options.length},(_,i)=>options[mapping.indexOf(i)]):options;
      const gameID=String(get('FACULTY_COMPOSITION_CONFIG',{}).slug||row.game||'unknown').slice(0,160);
      const content={gameID,questionID:String(q.id??q.questionId),questionVersion:String(q.version??1),prompt,
        options:ordered,optionOrder:canonical?'canonical':'displayed',assetRevision:b.assetRevision};
      const objectiveID=String(row.objective||q.objective||'').slice(0,300);
      const labels=get('objectiveLabels',{}),templateLabels=get('TEMPLATE_OBJECTIVE_LABELS',{}),microLabels=get('LABYRINTH_OF_CHOICE_OBJECTIVE_LABELS',{});
      const objectiveLabel=String(labels?.[objectiveID]||templateLabels?.[objectiveID]||microLabels?.[objectiveID]||'')
        .replace(/^LO\s*\d+(?:\.\d+)*(?:\s*[—–:_-]\s*|\s+|$)/i,'').trim().slice(0,2000);
      const snapshot={schema:'mq-answer-snapshot/2',...content,questionRevision:hash(content),objectiveID,objectiveLabel,
        correctOptionIndices:row.event==='question'?correctOptions(q,options,canonical?mapping:options.map((_,i)=>i)):null,
        contentRevision:q.telemetryContentRevision||null,selectedIndex:canonical?mapping[selected]:selected,
        selectedAnswer:options[selected],priorExposureCount:Number.isInteger(row.priorExposureCount)&&row.priorExposureCount>=0?row.priorExposureCount:null};
      const json=stable(snapshot);
      return unescape(encodeURIComponent(JSON.stringify({answerSnapshotJSON:json}))).length<=56000?json:null;
    }catch(_){return null;}
  }
  function show(){
    const run=runKey(),q=get('currentQuestion',null);if(!run||!q)return;
    const s=state(run),k=slot(q),prior=s.slots[k];
    if(get('gameMode','')!=='exam')s.slots={};
    s.slots[k]={...(get('gameMode','')==='exam'&&prior?prior:{}),presentationID:uuid(),attemptID:get('gameMode','')==='exam'&&prior?prior.attemptID:uuid()};persist(run,s);
    get('sendGameData',null)?.({event:'question_presented',runID:run,questionId:q.id,room:get('room',0)});
  }
  function stamp(row,data={}){
    const run=String(row.runID||runKey());if(!run)return row;
    const s=state(run),b=build();
    const mode=String(row.mode||get('gameMode','standard'));
    const segmentKey=hash(b)+':'+mode;
    s.segments ||= {};
    const manifest=s.segments[segmentKey] ||= {...b,mode,modeParameters:{quizTarget:number(get('quizQuestionTarget',null)),trialGraphTarget:number(get('trialGraphQuestionTarget',null)),timedLimitMs:number(get('timedModeDurationMs',null)),fadingTarget:number(get('fadingFortuneQuestionTarget',null)),riskTarget:number(get('riskRewardQuestionTarget',null))}};
    const manifestID=hash(manifest);
    if(!s.manifests[manifestID])s.manifests[manifestID]=manifest;
    const response=['question','rapid_guessing','exam_answer_initial','exam_answer_revision'].includes(row.event);
    const q=(data.adaptiveMode==='exam-commit'?get('getExamRoomState',null)?.(row.room,false)?.question:null)||get('currentQuestion',{});
    const k=[mode,row.room??get('room',0),row.questionID||q?.id||''].join(':');
    let view=s.slots[k];
    if(response&&!view){view={presentationID:null,attemptID:uuid()};s.slots[k]=view;}
    row.contractID=registry.contractID;row.telemetryVersion=registry.measurementRevision;row.manifestID=manifestID;
    row.provenanceStatus=data.event==='resume'?'resume-segment':'measured-segment';
    row.localSequence=++s.sequence;row.presentationID=view?.presentationID??null;row.attemptID=view?.attemptID??null;
    const mapping=q?.telemetryOptionIndices;
    const unknownSavedContent=response&&(!Array.isArray(mapping)||(q?.telemetryContentRevision&&q.telemetryContentRevision!==b.contentRevision));
    if(unknownSavedContent)row.provenanceStatus='unresolved';
    row.canonicalSelectedIndex=response&&!unknownSavedContent&&Array.isArray(mapping)&&Number.isInteger(row.selectedIndex)?mapping[row.selectedIndex]??null:null;
    if(row.event==='rapid_guessing'&&view)view.attemptID=uuid();
    const stage=data.remediationStage || get('remediationState',{})?.stage;
    row.originAttemptID=['repair','bridge','retest'].includes(stage)?s.lastMiss??null:null;
    if(row.event==='question'&&!Number(row.correct)&&!['repair','bridge','retest'].includes(stage))s.lastMiss=row.attemptID;
    const assistance=get('currentQuestionAssistance',null),faded=get('fadingFortuneFadedChoices',null);
    const relevantAssistance=assistance?.questionId===q?.id?assistance:null;
    const support={hintDisplayed:Boolean(q?.hint),artifactApplied:relevantAssistance?Boolean(relevantAssistance.removedIndexes?.length):false,
      artifactRemovedCanonical:(relevantAssistance?.removedIndexes||[]).map(i=>mapping?.[i]??null),
      modeRemovedCanonical:mode==='fadingFortune'&&faded?[...faded].map(i=>mapping?.[i]??null):[],
      remainingOptionCount:Array.isArray(q?.options)?q.options.length-(relevantAssistance?.removedIndexes?.length||0)-(mode==='fadingFortune'&&faded?faded.size:0):null};
    if(response&&view){if(data.adaptiveMode==='exam-commit')row.supportJSON=view.supportJSON??null;else{row.supportJSON=stable(support);view.supportJSON=row.supportJSON;}}
    else row.supportJSON=null;
    if(response&&view){
      if(data.adaptiveMode==='exam-commit'){
        row.answerSnapshotJSON=view.answerSnapshotJSON??answerSnapshot(q,row,b);
        try{const prior=JSON.parse(row.answerSnapshotJSON),committed=JSON.parse(answerSnapshot(q,row,b));
          if(prior&&committed&&prior.questionRevision===committed.questionRevision){prior.correctOptionIndices=committed.correctOptionIndices;row.answerSnapshotJSON=stable(prior);}
        }catch(_){}
      }
      else {row.answerSnapshotJSON=answerSnapshot(q,row,b);view.answerSnapshotJSON=row.answerSnapshotJSON;}
    }else row.answerSnapshotJSON=null;
    row.resourceID=ids([data.resourceID])[0]??null;
    row.manifestJSON=null;row.deliveryQuality=null;
    row._rpgCsv=rpgCsv.capture(row,data);
    persist(run,s);return row;
  }
  function exportRows(rows,run){
    const s=state(run),result=rows.map(r=>({...r}));
    for(const id of new Set(rows.map(r=>r.manifestID).filter(Boolean)))result.push({event:'export_manifest',runID:run,contractID:registry.contractID,manifestID:id,manifestJSON:s.manifests[id]?stable(s.manifests[id]):null,deliveryQuality:stable({...s.quality,localLastSequence:s.sequence,localRetainedRows:rows.length,knownMissingPrefix:Math.max(0,Number(rows.find(r=>r.localSequence)?.localSequence||1)-1)})});
    // Stored reports must retain Exam disclosure rules after reload or switching runs.
    const activeExam=rows.some(row=>row.mode==='exam')&&!rows.some(row=>row.mode==='exam'&&['complete','exam_complete','exam_ended_by_student'].includes(row.event));
    return result.map(row=>rpgCsv.normalize(row,{activeExam,collection:rpgCsv.collection()}));
  }
  function wrapShuffle(){
    const old=get('shuffleOptions',null);if(typeof old!=='function'||old.__contractMapping)return;
    const wrapped=function(q){const out=old.apply(this,arguments);if(out&&q){out.telemetryContentRevision=q.telemetryContentRevision||build().contentRevision;if(!Array.isArray(out.telemetryOptionIndices)){const remaining=q.options.map((text,i)=>({text,index:q.telemetryOptionIndices?.[i]??i}));out.telemetryOptionIndices=out.options.map(text=>{const at=remaining.findIndex(x=>x.text===text);return at<0?null:remaining.splice(at,1)[0].index;});}}return out;};
    wrapped.__contractMapping=true;window.shuffleOptions=wrapped;
  }
  let resourcesInstalled=false;
  function resources(){
    const run=runKey();if(!run)return;
    const s=state(run);s.offered ||= [];
    for(const a of document.querySelectorAll?.('[data-telemetry-resource]')||[]){const id=ids([a.dataset.telemetryResource])[0];if(id&&!s.offered.includes(id)){s.offered.push(id);get('sendGameData',null)?.({event:'resource_offered',runID:run,resourceID:id});}}
    persist(run,s);
  }
  function installResources(){
    if(resourcesInstalled)return;resourcesInstalled=true;
    const originalReport=get('showMasteryReportScreen',null);
    if(typeof originalReport==='function')window.showMasteryReportScreen=function(...args){const result=originalReport.apply(this,args);if(result?.then)result.then(resources,()=>{});else resources();return result;};
    document.addEventListener('click',e=>{const id=ids([e.target?.closest?.('[data-telemetry-resource]')?.dataset.telemetryResource])[0];if(id)get('sendGameData',null)?.({event:'resource_activated',runID:runKey(),resourceID:id});});
  }
  return {fields,columns:rpgCsv.columns,stamp,show,exportRows,wrapShuffle,hash,stable,build,state,resources,installResources};
}
