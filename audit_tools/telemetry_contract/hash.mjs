/* Maintained measurement metadata only. No clocks, scoring, network or learner identity. */
function createTelemetryContract(get, registry) {
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
  const fields=['contractID','manifestID','provenanceStatus','presentationID','attemptID','canonicalSelectedIndex','localSequence','manifestJSON','deliveryQuality','supportJSON','originAttemptID','resourceID'];
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
  function show(){
    const run=runKey(),q=get('currentQuestion',null);if(!run||!q)return;
    const s=state(run),k=slot(q),prior=s.slots[k];
    if(get('gameMode','')!=='exam')s.slots={};
    s.slots[k]={presentationID:uuid(),attemptID:get('gameMode','')==='exam'&&prior?prior.attemptID:uuid()};persist(run,s);
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
    const response=['question','rapid_guessing','exam_answer_initial','exam_answer_revision'].includes(row.event),q=get('currentQuestion',{});
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
    row.resourceID=ids([data.resourceID])[0]??null;
    row.manifestJSON=null;row.deliveryQuality=null;persist(run,s);return row;
  }
  function exportRows(rows,run){
    const s=state(run),result=rows.map(r=>({...r}));
    for(const id of new Set(rows.map(r=>r.manifestID).filter(Boolean)))result.push({event:'export_manifest',runID:run,contractID:registry.contractID,manifestID:id,manifestJSON:s.manifests[id]?stable(s.manifests[id]):null,deliveryQuality:stable({...s.quality,localLastSequence:s.sequence,localRetainedRows:rows.length,knownMissingPrefix:Math.max(0,Number(rows.find(r=>r.localSequence)?.localSequence||1)-1)})});
    return result;
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
  return {fields,stamp,show,exportRows,wrapShuffle,hash,stable,build,state,resources,installResources};
}

const utilities=createTelemetryContract(()=>null,{});
export const contractHash=utilities.hash,stableContractJSON=utilities.stable;
