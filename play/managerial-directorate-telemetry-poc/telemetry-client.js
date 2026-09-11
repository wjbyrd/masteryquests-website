(function anonymousTelemetryPOC(){
  "use strict";

  const PHASE = "phaseAnonymousTelemetryPOC-v1";
  const BUILD_ID = "managerial-directorate-telemetry-poc";
  const BUILD_VERSION = "2026.09.10-parity3";
  const SCHEMA_VERSION = 3;
  const DEFAULT_ENDPOINT = "/api/anonymous-telemetry-poc/v1/events";
  const QUEUE_KEY = "anonymousTelemetry:queue:v1";
  const CLIENT_KEY = "anonymousTelemetry:clientId:v1";
  const RUNS_KEY = "anonymousTelemetry:runs:v1";
  const SEQUENCES_KEY = "anonymousTelemetry:sequences:v1";
  const ACTIVE_RUN_KEY_PREFIX = "anonymousTelemetry:activeRun:v1:";
  const FAILURE_KEY = "anonymousTelemetry:debugFailure:v1";
  const COLLECTION_KEY = "anonymousTelemetry:remoteDisabled:v1";
  const QUALITY_KEY = "anonymousTelemetry:quality:v1";
  const MAX_QUEUE = 2000;
  let collectionEpoch=0, memoryRemoteDisabled=false;
  function remoteEnabled(){
    if(memoryRemoteDisabled)return false;
    if(document.querySelector('meta[name="anonymous-telemetry-collection"]')?.content==='disabled')return false;
    try{return localStorage['getItem'](COLLECTION_KEY)!=='1';}catch(_){return false;}
  }
  function setRemoteCollection(enabled){
    collectionEpoch++;memoryRemoteDisabled=!enabled;
    try{localStorage['setItem'](COLLECTION_KEY,enabled?'0':'1');}catch(_){}
    if(!enabled || !remoteEnabled()){
      clearTimeout(state.retryTimer);state.retryTimer=0;
      state.quality.cancelled+=state.queue.length;state.queue=[];state.sentManifests.clear();persistQueue();saveQuality();
    }
    return remoteEnabled();
  }
  function saveQuality(){try{localStorage.setItem(QUALITY_KEY,JSON.stringify(state.quality));}catch(_){state.quality.storageFailures++;}}

  const BATCH_SIZE = 25;
  const COMPLETION_EVENTS = new Set([
    "complete", "timed_complete", "timed_ended_early", "legendary_complete", "score_complete",
    "quiz_complete", "trial_graph_complete", "fading_fortune_complete", "risk_reward_complete",
    "exam_complete", "unlimited_complete"
  ]);
  const script = document.currentScript;
  const gameId = String(script?.dataset?.gameId || document.documentElement.dataset.telemetryGameId || "managerial-hub");
  const ACTIVE_RUN_KEY = ACTIVE_RUN_KEY_PREFIX + gameId;
  const params = new URLSearchParams(location.search);
  const debugEnabled = params.get("telemetryDebug") === "1";
  const configuredEndpoint = params.get("telemetryEndpoint") || document.querySelector('meta[name="anonymous-telemetry-endpoint"]')?.content;
  const endpoint = configuredEndpoint || DEFAULT_ENDPOINT;
  const syntheticMode = params.get("telemetrySynthetic") === "1";
  const state = {
    queue: readJSON(QUEUE_KEY, []),
    quality: (()=>{const saved=readJSON(QUALITY_KEY,{});return Object.fromEntries(['overflow','permanentlyRejected','cancelled','storageFailures'].map(key=>[key,Number.isSafeInteger(saved?.[key])&&saved[key]>=0?saved[key]:0]));})(),
    singletonRetry:false,
    sentManifests:new Set(),
    lastMeasurement:null,
    runs: readJSON(RUNS_KEY, {}),
    sequences: readJSON(SEQUENCES_KEY, {}),
    activeRunId: readJSON(ACTIVE_RUN_KEY, "") || "",
    sourceRunId: "",
    flushing: false,
    retryAttempt: 0,
    retryTimer: 0,
    lastStatus: "idle",
    artifactOwnership: null,
    launchDepth: 0,
    lastStage: "",
    lastBossStage: "",
    lastPosition: 0,
    lastScore: null,
    lastStreak: null,
    lastSuccessfulSend: "",
    lastServerResponse: "none",
    failedSendCount: 0,
    visibilityPaused: false,
    failureSimulation: readJSON(FAILURE_KEY,0) === 1,
    debugNode: null
  };

  // BEGIN GENERATED COMPOSER BEHAVIOR (sync-composer-behavior.mjs)
  function createComposerQuestionTracker(){
    let questionStartTime=0, questionVisibilityTiming=createQuestionVisibilityTimingState();
    let questionBehaviorTelemetry=createQuestionBehaviorTelemetryState();
    let questionSelectionDebounceTimer=null, questionBehaviorGeneration=0;
    // The adapter freezes at submission; it never changes the game's pending flag.
    let answerSubmissionPending=false;
function createQuestionVisibilityTimingState(){
    return {
        active:false,
        accumulatedHiddenMs:0,
        hiddenStartedAt:null,
        tabSwitchCount:0,
        lastReturnAt:null,
        hasReturned:false
    };
}

function createQuestionBehaviorTelemetryState(){
    return {
        active:false,
        accumulatedUnfocusedMs:0,
        unfocusedStartedAt:null,
        focusLossCount:0,
        lastFocusAt:null,
        hasRefocused:false,
        selectionCount:0,
        maxSelectedChars:0,
        questionSelected:false,
        answersSelected:false,
        copyCount:0,
        questionCopied:false,
        answersCopied:false,
        lastCopyAt:null,
        pendingCopyToHideAt:null,
        pendingCopyToBlurAt:null,
        timeCopyToHideMs:null,
        timeCopyToBlurMs:null
    };
}

function clearQuestionSelectionDebounce(){
    if(questionSelectionDebounceTimer !== null){
        clearTimeout(questionSelectionDebounceTimer);
        questionSelectionDebounceTimer = null;
    }
}

function resetQuestionVisibilityTiming(now = Date.now()){
    try { MQContract.show(); } catch (_) {}
    const safeNow = Math.max(0, Number(now) || 0);
    clearQuestionSelectionDebounce();
    questionBehaviorGeneration++;
    questionStartTime = safeNow;
    questionVisibilityTiming = createQuestionVisibilityTimingState();
    questionVisibilityTiming.active = true;
    questionBehaviorTelemetry = createQuestionBehaviorTelemetryState();
    questionBehaviorTelemetry.active = true;
    if(document.hidden) questionVisibilityTiming.hiddenStartedAt = safeNow;
    return questionVisibilityTiming;
}

function markQuestionVisibilityHidden(now = Date.now()){
    if(!questionVisibilityTiming.active || Number.isFinite(questionVisibilityTiming.hiddenStartedAt)) return;
    const safeNow = Math.max(questionStartTime, Number(now) || 0);
    questionVisibilityTiming.hiddenStartedAt = safeNow;
    questionVisibilityTiming.tabSwitchCount++;
    if(Number.isFinite(questionBehaviorTelemetry.pendingCopyToHideAt)){
        questionBehaviorTelemetry.timeCopyToHideMs = Math.max(0, safeNow - questionBehaviorTelemetry.pendingCopyToHideAt);
        questionBehaviorTelemetry.pendingCopyToHideAt = null;
    }
}

function markQuestionVisibilityVisible(now = Date.now()){
    if(!questionVisibilityTiming.active || !Number.isFinite(questionVisibilityTiming.hiddenStartedAt)) return;
    const safeNow = Math.max(questionVisibilityTiming.hiddenStartedAt, Number(now) || 0);
    questionVisibilityTiming.accumulatedHiddenMs += safeNow - questionVisibilityTiming.hiddenStartedAt;
    questionVisibilityTiming.hiddenStartedAt = null;
    questionVisibilityTiming.lastReturnAt = safeNow;
    questionVisibilityTiming.hasReturned = true;
}

function getQuestionVisibilityTiming(now = Date.now()){
    const safeNow = Math.max(questionStartTime, Number(now) || 0);
    const responseTimeMs = Math.max(0, safeNow - questionStartTime);
    const openHiddenMs = Number.isFinite(questionVisibilityTiming.hiddenStartedAt)
        ? Math.max(0, safeNow - questionVisibilityTiming.hiddenStartedAt)
        : 0;
    const hiddenTimeMs = Math.min(
        responseTimeMs,
        Math.max(0, questionVisibilityTiming.accumulatedHiddenMs + openHiddenMs)
    );
    const activeResponseTimeMs = Math.max(0, responseTimeMs - hiddenTimeMs);
    const timeAfterReturnMs = questionVisibilityTiming.hasReturned
        && !Number.isFinite(questionVisibilityTiming.hiddenStartedAt)
        && Number.isFinite(questionVisibilityTiming.lastReturnAt)
            ? Math.max(0, safeNow - questionVisibilityTiming.lastReturnAt)
            : null;
    return {
        responseTimeMs,
        activeResponseTimeMs,
        hiddenTimeMs,
        tabSwitchCount:Math.max(0, Number(questionVisibilityTiming.tabSwitchCount) || 0),
        timeAfterReturnMs,
        ...getQuestionBehaviorTelemetry(safeNow)
    };
}

function completeQuestionVisibilityTiming(){
    clearQuestionSelectionDebounce();
    questionVisibilityTiming.active = false;
    questionVisibilityTiming.hiddenStartedAt = null;
    questionBehaviorTelemetry.active = false;
    questionBehaviorTelemetry.unfocusedStartedAt = null;
    questionBehaviorTelemetry.pendingCopyToHideAt = null;
    questionBehaviorTelemetry.pendingCopyToBlurAt = null;
}

function handleQuestionVisibilityChange(now = Date.now()){
    if(document.hidden) markQuestionVisibilityHidden(now);
    else markQuestionVisibilityVisible(now);
}

function markQuestionFocusLost(now = Date.now()){
    if(!questionBehaviorTelemetry.active || answerSubmissionPending || Number.isFinite(questionBehaviorTelemetry.unfocusedStartedAt)) return;
    const safeNow = Math.max(questionStartTime, Number(now) || 0);
    questionBehaviorTelemetry.unfocusedStartedAt = safeNow;
    questionBehaviorTelemetry.focusLossCount++;
    if(Number.isFinite(questionBehaviorTelemetry.pendingCopyToBlurAt)){
        questionBehaviorTelemetry.timeCopyToBlurMs = Math.max(0, safeNow - questionBehaviorTelemetry.pendingCopyToBlurAt);
        questionBehaviorTelemetry.pendingCopyToBlurAt = null;
    }
}

function markQuestionFocusRegained(now = Date.now()){
    if(!questionBehaviorTelemetry.active || answerSubmissionPending || !Number.isFinite(questionBehaviorTelemetry.unfocusedStartedAt)) return;
    const safeNow = Math.max(questionBehaviorTelemetry.unfocusedStartedAt, Number(now) || 0);
    questionBehaviorTelemetry.accumulatedUnfocusedMs += Math.max(0, safeNow - questionBehaviorTelemetry.unfocusedStartedAt);
    questionBehaviorTelemetry.unfocusedStartedAt = null;
    questionBehaviorTelemetry.lastFocusAt = safeNow;
    questionBehaviorTelemetry.hasRefocused = true;
}

function selectedCharactersWithinRange(range, root){
    if(!range || !root || typeof range.intersectsNode !== "function") return 0;
    try {
        if(!range.intersectsNode(root)) return 0;
        const relevantRange = range.cloneRange();
        const rootRange = document.createRange();
        rootRange.selectNodeContents(root);
        if(relevantRange.compareBoundaryPoints(Range.START_TO_START, rootRange) < 0){
            relevantRange.setStart(rootRange.startContainer, rootRange.startOffset);
        }
        if(relevantRange.compareBoundaryPoints(Range.END_TO_END, rootRange) > 0){
            relevantRange.setEnd(rootRange.endContainer, rootRange.endOffset);
        }
        return Math.max(0, String(relevantRange.toString()).trim().length);
    } catch(error){
        return 0;
    }
}

function getRelevantSelectionSummary(selection = window.getSelection?.()){
    const summary = {characterCount:0,question:false,answers:false};
    if(!selection || selection.isCollapsed || selection.rangeCount < 1) return summary;
    const questionRoot = document.getElementById("question");
    const answersRoot = document.getElementById("answers");
    for(let index = 0; index < selection.rangeCount; index++){
        const range = selection.getRangeAt(index);
        const questionCharacters = selectedCharactersWithinRange(range, questionRoot);
        const answerCharacters = selectedCharactersWithinRange(range, answersRoot);
        if(questionCharacters > 0) summary.question = true;
        if(answerCharacters > 0) summary.answers = true;
        summary.characterCount += questionCharacters + answerCharacters;
    }
    return summary;
}

function recordMeaningfulQuestionSelection(summary = getRelevantSelectionSummary()){
    if(!questionBehaviorTelemetry.active || answerSubmissionPending || !summary || summary.characterCount < 1) return false;
    questionBehaviorTelemetry.selectionCount++;
    questionBehaviorTelemetry.maxSelectedChars = Math.max(questionBehaviorTelemetry.maxSelectedChars, summary.characterCount);
    questionBehaviorTelemetry.questionSelected ||= !!summary.question;
    questionBehaviorTelemetry.answersSelected ||= !!summary.answers;
    return true;
}

function scheduleQuestionSelectionTelemetry(){
    if(!questionBehaviorTelemetry.active || answerSubmissionPending) return;
    clearQuestionSelectionDebounce();
    const scheduledGeneration = questionBehaviorGeneration;
    questionSelectionDebounceTimer = setTimeout(() => {
        questionSelectionDebounceTimer = null;
        if(scheduledGeneration !== questionBehaviorGeneration) return;
        recordMeaningfulQuestionSelection();
    }, 250);
}

function flushQuestionSelectionTelemetry(){
    if(questionSelectionDebounceTimer === null) return;
    clearQuestionSelectionDebounce();
    recordMeaningfulQuestionSelection();
}

function recordRelevantQuestionCopy(now = Date.now(), summary = getRelevantSelectionSummary()){
    if(!questionBehaviorTelemetry.active || answerSubmissionPending || !summary || summary.characterCount < 1) return false;
    const safeNow = Math.max(questionStartTime, Number(now) || 0);
    questionBehaviorTelemetry.copyCount++;
    questionBehaviorTelemetry.questionCopied ||= !!summary.question;
    questionBehaviorTelemetry.answersCopied ||= !!summary.answers;
    questionBehaviorTelemetry.lastCopyAt = safeNow;
    questionBehaviorTelemetry.pendingCopyToHideAt = safeNow;
    questionBehaviorTelemetry.pendingCopyToBlurAt = safeNow;
    questionBehaviorTelemetry.timeCopyToHideMs = null;
    questionBehaviorTelemetry.timeCopyToBlurMs = null;
    return true;
}

function getQuestionBehaviorTelemetry(now = Date.now()){
    const safeNow = Math.max(questionStartTime, Number(now) || 0);
    const responseTimeMs = Math.max(0, safeNow - questionStartTime);
    const openUnfocusedMs = Number.isFinite(questionBehaviorTelemetry.unfocusedStartedAt)
        ? Math.max(0, safeNow - questionBehaviorTelemetry.unfocusedStartedAt)
        : 0;
    const unfocusedTimeMs = Math.min(
        responseTimeMs,
        Math.max(0, questionBehaviorTelemetry.accumulatedUnfocusedMs + openUnfocusedMs)
    );
    const timeAfterFocusMs = questionBehaviorTelemetry.hasRefocused
        && !Number.isFinite(questionBehaviorTelemetry.unfocusedStartedAt)
        && Number.isFinite(questionBehaviorTelemetry.lastFocusAt)
            ? Math.max(0, safeNow - questionBehaviorTelemetry.lastFocusAt)
            : null;
    return {
        focusLossCount:Math.max(0, Math.trunc(Number(questionBehaviorTelemetry.focusLossCount) || 0)),
        unfocusedTimeMs,
        timeAfterFocusMs,
        selectionCount:Math.max(0, Math.trunc(Number(questionBehaviorTelemetry.selectionCount) || 0)),
        maxSelectedChars:Math.max(0, Math.trunc(Number(questionBehaviorTelemetry.maxSelectedChars) || 0)),
        questionSelected:questionBehaviorTelemetry.questionSelected ? 1 : 0,
        answersSelected:questionBehaviorTelemetry.answersSelected ? 1 : 0,
        copyCount:Math.max(0, Math.trunc(Number(questionBehaviorTelemetry.copyCount) || 0)),
        questionCopied:questionBehaviorTelemetry.questionCopied ? 1 : 0,
        answersCopied:questionBehaviorTelemetry.answersCopied ? 1 : 0,
        lastCopyElapsedMs:Number.isFinite(questionBehaviorTelemetry.lastCopyAt)
            ? Math.max(0, questionBehaviorTelemetry.lastCopyAt - questionStartTime)
            : null,
        timeCopyToHideMs:Number.isFinite(questionBehaviorTelemetry.timeCopyToHideMs)
            ? Math.max(0, questionBehaviorTelemetry.timeCopyToHideMs)
            : null,
        timeCopyToBlurMs:Number.isFinite(questionBehaviorTelemetry.timeCopyToBlurMs)
            ? Math.max(0, questionBehaviorTelemetry.timeCopyToBlurMs)
            : null
    };
}

    return {reset:resetQuestionVisibilityTiming, snapshot:getQuestionVisibilityTiming,
      complete:completeQuestionVisibilityTiming, visibility:handleQuestionVisibilityChange,
      blur:markQuestionFocusLost, focus:markQuestionFocusRegained,
      selection:scheduleQuestionSelectionTelemetry, flushSelection:flushQuestionSelectionTelemetry,
      copy:recordRelevantQuestionCopy, active:()=>questionVisibilityTiming.active};
  }
  // END GENERATED COMPOSER BEHAVIOR

  // BEGIN MEASUREMENT CONTRACT
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

  const MQContract=createTelemetryContract(globalValue, /* RELEASE REGISTRY */ {"contractID":"mq-measurement/1","measurementRevision":"mq-tracker-2026.09.10-contract1","localSchema":"mq-local-csv/1","anonymousEnvelope":3,"manifestSchema":"mq-run-manifest/1","trackerSourceRevision":"1023a767020cb5cea0d6e82f8ad0f41a56dccae2a24ed80fe25ee5131bddb762","games":{"cost-directive":{"engineRevision":"1aa3b13ff3f5f3bc605f8ac7eef313bed970909421b3899cea16d2050205e703","pocEngineRevision":"2b9af4ca1bc6e93f2481215053849e079ec5d474ceeb6f5972e00e389b72defc","classroomEngineRevision":"eaacaa493b7c3389e2edfda5845e61e557586266a5e106eb2cae081447ee17b0","assetRevision":"e84ae7d58d4f614ec045fb1b8f1327e9acb14060321b757e92ee42277369eb71"},"market-signal":{"engineRevision":"8d3922950fac1b8419b034467e005fa5179312535ec912d990091eb8f7fa73e7","pocEngineRevision":"13ab6fdf6bba07a5ac355e6114f239c36339e10d700317c032c57e1b6841ba5c","classroomEngineRevision":"471a5d84225f66b6c22fbda33b760683a02863e755a63be162dff798856ba0df","assetRevision":"b08933cae7a38a40c1ab82a012b5ef2ca45a3271a467be2ea303532e635333fa"},"strategy-desk":{"engineRevision":"8c831eca82af41b0433bbc45e9fa01f503a87deaf124fc2ab94c6dd351e8ab29","pocEngineRevision":"57d7d218a3b711cc7b1bcc344f33ba7626b3294b8a67c0653976375cd69b1f2f","classroomEngineRevision":"5c795fb2ba0dbeec400981199732b3b8f5e26afdc1d509a3e0ea8789ecf473e9","assetRevision":"fee2394b66f0bccdd4ad9c5289d9ea6e09e0cf58b56987b59c510c9bf738b6cf"},"agency-protocol":{"engineRevision":"f5fad05193dc16d79007ee8733fbdcbf62b266f091aac11231c89bea3fe1b632","pocEngineRevision":"8dfa2532424c30cbdc6c4f69f6325ac03510e43be83f5edebb5b12b3f97aa5ad","classroomEngineRevision":"685a5850f5e0653a44431a5f5c2d21bf0d7ae4b77617670c00f2ed0e0b5037ff","assetRevision":"90b45185b2f7b58e87bb619618a0c7642860be1748eb45ef768820db614faec8"},"composer":{"engineRevision":"e09f9b640310dbb3b3962007f10e9efae1f63243a4d6b15cd1f59273cf07503e","assetRevision":"cbeeea56e054a29eb211219b581e7e08a7485e65dfbfe0a971105ce2192ec716"}}});
  // END MEASUREMENT CONTRACT

  const BEHAVIOR_FIELDS = ["activeResponseTimeMs","hiddenTimeMs","tabSwitchCount","timeAfterReturnMs","focusLossCount","unfocusedTimeMs","timeAfterFocusMs","selectionCount","maxSelectedChars","questionSelected","answersSelected","copyCount","questionCopied","answersCopied","lastCopyElapsedMs","timeCopyToHideMs","timeCopyToBlurMs"];
  const tracker=createComposerQuestionTracker();
  let intervalKey='', intervalContext=null, pendingTiming=null, pendingKey='', shownToken='', runClosed=true;
  const examViews=new Map();
  const intervalId=c=>[state.activeRunId,c.position,c.questionId].join(':');
  function finishInterval(timing){
    if(!tracker.active())return;
    const value=timing || tracker.snapshot();
    if(intervalContext?.mode==='exam'){
      const prior=examViews.get(intervalKey);
      const sum={...value};
      if(prior){
        for(const key of ['responseTimeMs','activeResponseTimeMs','hiddenTimeMs','tabSwitchCount','focusLossCount','unfocusedTimeMs','selectionCount','copyCount'])sum[key]+=prior[key];
        sum.maxSelectedChars=Math.max(prior.maxSelectedChars,value.maxSelectedChars);
        for(const key of ['questionSelected','answersSelected','questionCopied','answersCopied'])sum[key]=Number(Boolean(prior[key]||value[key]));
        if(!value.copyCount)for(const key of ['lastCopyElapsedMs','timeCopyToHideMs','timeCopyToBlurMs'])sum[key]=prior[key];
      }
      examViews.set(intervalKey,sum);
    }
    tracker.complete();
  }
  function beginInterval(){
    if(runClosed)return;
    const c=currentContext({});
    if(!c.questionId || globalValue('answerSubmissionPending',false))return;
    if(c.mode==='riskReward'&&!globalValue('riskRewardQuestionRevealed',false))return;
    if(c.mode==='fadingFortune'&&!globalValue('fadingFortuneQuestionActive',false))return;
    const key=intervalId(c),token=key+':'+globalValue('questionStartTime',0)+':'+[c.remediationStage,c.bridgeStage,c.retestStage].join(':');
    if(shownToken===token && tracker.active())return;
    finishInterval();
    intervalKey=key;intervalContext=c;shownToken=token;pendingTiming=null;pendingKey='';
    tracker.reset();
    emit("question_shown",{});
    return true;
  }
  function responseMeasurements(raw){
    const c=currentContext(raw),key=intervalId(c);
    if(raw.adaptiveMode==='exam-commit')return examViews.get(key) || null;
    if(!['question','rapid_guessing','exam_answer_initial','exam_answer_revision'].includes(raw.event))return null;
    if(key!==intervalKey)return null;
    const value=pendingKey===key&&pendingTiming ? pendingTiming : tracker.active()?tracker.snapshot():null;
    if(value)finishInterval(value);
    return value;
  }
  function suspendQuestion(reason){
    if(runClosed)return;
    if(tracker.active()){
      tracker.flushSelection();
      emit('question_interrupted',{...intervalContext,...tracker.snapshot(),lifecycleReason:reason});
      finishInterval();
    }
    pendingTiming=null;shownToken='';
  }
  function safeBehavior(action){try{if(!runClosed)action();}catch(_){} }

  function readJSON(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed === null ? fallback : parsed;
    } catch (_) { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { state.quality.storageFailures++; }
  }

  function uuid() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }

  function getClientId() {
    let value = localStorage.getItem(CLIENT_KEY);
    if (!/^[0-9a-f-]{36}$/i.test(value || "")) {
      value = uuid();
      localStorage.setItem(CLIENT_KEY, value);
    }
    return value;
  }

  function nextSequence(runId) {
    const next = Number(state.sequences[runId] || 0) + 1;
    state.sequences[runId] = next;
    writeJSON(SEQUENCES_KEY, state.sequences);
    return next;
  }

  function createRun(sourceRunId, mode) {
    const runId = uuid();
    const sourceKey = sourceRunId ? `${gameId}:${sourceRunId}` : "";
    if (sourceKey) state.runs[sourceKey] = runId;
    state.activeRunId = runId;
    state.sourceRunId = sourceRunId || "";
    tracker.complete(); examViews.clear(); intervalKey=''; pendingTiming=null; shownToken=''; runClosed=false;
    state.visibilityPaused = false;
    state.runs[`${gameId}:artifacts:${runId}`] = state.artifactOwnership || artifactOwnership();
    state.lastStage = "";
    state.lastBossStage = "";
    state.lastPosition = 0;
    state.lastScore = null;
    state.lastStreak = null;
    localStorage.setItem(ACTIVE_RUN_KEY, runId);
    if (mode) state.runs[`${gameId}:mode:${runId}`] = String(mode);
    writeJSON(RUNS_KEY, state.runs);
    return runId;
  }

  function resumeRun(sourceRunId, mode) {
    tracker.complete(); pendingTiming=null; shownToken=''; runClosed=false;
    const sourceKey = sourceRunId ? `${gameId}:${sourceRunId}` : "";
    const mapped = sourceKey ? state.runs[sourceKey] : "";
    if (mapped) {
      state.activeRunId = mapped;
      state.sourceRunId = sourceRunId;
      localStorage.setItem(ACTIVE_RUN_KEY, mapped);
      return mapped;
    }
    return createRun(sourceRunId, mode);
  }

  function ensureRun(mode) {
    if (state.activeRunId) return state.activeRunId;
    return createRun("", mode);
  }

  function globalValue(name, fallback) {
    try {
      const value = (0, eval)(name);
      return value === undefined ? fallback : value;
    } catch (_) { return fallback; }
  }

  function artifactOwnership() {
    const keys = globalValue("ARTIFACT_STORAGE_KEYS", {});
    return Object.fromEntries(Object.entries(keys).map(([key, storageKey]) => [key, localStorage.getItem(storageKey) === "true"]));
  }

  function currentContext(raw = {}) {
    const question = globalValue("currentQuestion", null) || {};
    const remediation = globalValue("remediationState", null) || {};
    const mastery = globalValue("masteryState", null) || {};
    const position = number(raw.room ?? globalValue("room", 0));
    const type = text(raw.type ?? question.type, 80);
    const stage = text(raw.remediationStage ?? (remediation.active ? remediation.stage : ""), 40);
    const difficulty = text(raw.difficulty ?? question.difficulty, 80);
    const questionId = text(raw.questionId ?? raw.question ?? question.id ?? question.questionId, 160);
    const objective = text(raw.objective ?? question.objective ?? question.learningObjective, 160);
    const conceptId = text(question.primaryConceptId ?? question.primarySkill ?? question.repairSkill ?? raw.tag ?? question.tag, 160);
    const bossStage = isBossPosition(position) ? `checkpoint-${position}` : text(question.bossStage, 40);
    const graph = Boolean(question.graph || question.image || question.imagePath || /graph/i.test(type));
    const attempts = number(raw.totalAttempts ?? raw.attempt ?? globalValue("totalAttempts", 0));
    const correctAnswers = number(globalValue("correctAnswers", 0));
    const masteryAccuracy = attempts > 0 ? correctAnswers / attempts : number(raw.accuracy);
    return {
      mode: text(raw.mode ?? globalValue("gameMode", "standard"), 60).replace(/-complete$/, ""),
      elapsedTimeMs: number(raw.totalTime ?? raw.totalTimeMs ?? raw.elapsedTime ?? raw.elapsedTimeMs ?? globalValue("getElapsedTimeMs", null)?.() ?? 0),
      position,
      questionId,
      conceptId,
      learningObjective: objective,
      questionType: type,
      difficulty,
      selectedResponse: raw.selectedIndex === undefined ? null : number(raw.selectedIndex),
      correct: raw.correct === undefined ? null : Boolean(Number(raw.correct)),
      responseTimeMs: number(raw.responseTime ?? raw.responseTimeMs),
      rapidGuess: raw.event === "rapid_guessing" || Boolean(Number(raw.rapidGuessing)),
      remediationStage: stage === "repair" ? stage : "",
      bridgeStage: stage === "bridge" ? stage : "",
      retestStage: stage === "retest" ? stage : "",
      bossStage,
      graphQuestion: graph,
      score: number(raw.score ?? globalValue("scoreAttackScore", 0)),
      streak: number(raw.streak ?? globalValue("streak", 0)),
      dailyProgress: attempts,
      artifact: text(raw.artifact, 120),
      completionStatus: text(raw.completionStatus, 80),
      masteryAttempts: attempts,
      masteryCorrect: correctAnswers,
      masteryAccuracy: finite(masteryAccuracy),
      selectionReason: text(remediation.active ? `adaptive-${stage || "detour"}` : (globalValue("adaptiveMode", "") || "mode-pool"), 160),
      weaknessEstimate: summarizeWeakness(mastery),
      sourceEvent: text(raw.event, 80),
      sourceRunId: text(state.sourceRunId, 160),
      lifecycleReason: text(raw.lifecycleReason, 80)
    };
  }

  function summarizeWeakness(mastery) {
    const buckets = mastery?.bySkill || mastery?.byObjective || mastery?.byTag || {};
    const rows = Object.entries(buckets).map(([key, value]) => {
      const attempts = number(value?.attempts);
      const correct = number(value?.correct);
      return { key: text(key, 120), attempts, accuracy: attempts ? correct / attempts : 0 };
    }).filter(row => row.attempts > 0).sort((a,b) => a.accuracy - b.accuracy || b.attempts - a.attempts).slice(0, 5);
    return rows;
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function finite(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
  function text(value, max) { return String(value ?? "").slice(0, max); }
  function isBossPosition(position) { return position === 10 || position === 20 || position === 30; }

  function emit(eventType, fields = {}, options = {}) {
    if(!remoteEnabled())return null;
    try {
      const runId = options.runId || ensureRun(fields.mode);
      const context = currentContext(fields);
      const safeOverrides = Object.fromEntries(BEHAVIOR_FIELDS.map(key=>[key,null]));
      for (const key of [
        "mode", "elapsedTimeMs", "position", "questionId", "conceptId", "learningObjective",
        "questionType", "difficulty", "selectedResponse", "correct", "responseTimeMs", "rapidGuess",
        "remediationStage", "bridgeStage", "retestStage", "bossStage", "graphQuestion", "score",
        "streak", "dailyProgress", "artifact", "completionStatus", "masteryAttempts", "masteryCorrect",
        "masteryAccuracy", "selectionReason", "weaknessEstimate", "sourceEvent",
        "sourceRunId", "lifecycleReason", "acceptedAttempt", "artifactName", "artifactSource",
        "artifactAlreadyOwned", "artifactOwnedBeforeRun", "artifactNewlyEarned"
      , ...BEHAVIOR_FIELDS]) {
        if (Object.prototype.hasOwnProperty.call(fields, key)) safeOverrides[key] = fields[key];
      }
      const measurement=fields.__measurement || (eventType==='run_manifest'?null:state.lastMeasurement);
      if(fields.__measurement)state.lastMeasurement=fields.__measurement;
      if(measurement?.manifestID && !state.sentManifests.has(runId+':'+measurement.manifestID)){
        state.sentManifests.add(runId+':'+measurement.manifestID);
        const localRun=fields.runID || globalValue('runID','');
        const manifest=MQContract.state(localRun).manifests[measurement.manifestID];
        if(manifest)emit('run_manifest',{__manifest:JSON.stringify(manifest),__manifestID:measurement.manifestID},{runId});
      }
      const event = {
        eventId: uuid(),
        runId,
        anonymousClientId: getClientId(),
        buildId: BUILD_ID,
        buildVersion: MQContract.build().buildRevision,
        schemaVersion: SCHEMA_VERSION,
        phase: PHASE,
        gameId,
        mode: context.mode,
        eventType: text(eventType, 80),
        sequenceNumber: nextSequence(runId),
        eventTimestamp: new Date().toISOString(),
        synthetic: Boolean(options.synthetic || syntheticMode),
        ...context,
        ...safeOverrides,
        contractID:'mq-measurement/1',
        manifestID:fields.__manifestID || measurement?.manifestID || null,
        provenanceStatus:measurement?.provenanceStatus || 'unresolved',
        presentationID:measurement?.presentationID || null,
        attemptID:measurement?.attemptID || null,
        canonicalSelectedIndex:measurement?.canonicalSelectedIndex ?? null,
        localSequence:measurement?.localSequence ?? null,
        supportJSON:measurement?.supportJSON ?? null,
        originAttemptID:measurement?.originAttemptID ?? null,
        resourceID:measurement?.resourceID ?? null,
        manifestJSON:fields.__manifest || null,
        deliveryQuality:JSON.stringify(state.quality)
      };
      // Lifecycle/adaptive reasons never occupy the durable terminal field.
      if (eventType !== "run_completed" && event.completionStatus) {
        event.lifecycleReason ||= event.completionStatus;
        event.completionStatus = "";
      }
      state.queue.push(event);
      if (state.queue.length > MAX_QUEUE){
        while(state.queue.length>MAX_QUEUE){
          const referenced=new Set(state.queue.filter(e=>e?.eventType!=='run_manifest'&&e?.manifestID).map(e=>e.runId+':'+e.manifestID));
          let index=state.queue.findIndex(e=>e?.eventType==='run_manifest'&&!referenced.has(e.runId+':'+e.manifestID));
          if(index<0)index=state.queue.findIndex(e=>e?.eventType!=='run_manifest');
          if(index<0)index=0;
          state.queue.splice(index,1);state.quality.overflow++;
        }
        saveQuality();
      }
      persistQueue();
      updateDebug();
      scheduleFlush(0);
      return event;
    } catch (error) {
      state.lastStatus = `capture failed: ${error?.message || error}`;
      updateDebug();
      return null;
    }
  }

  function persistQueue() { writeJSON(QUEUE_KEY, state.queue); }

  function mapGameEvent(raw, measurements) {
    const sourceEvent = text(raw?.event, 80);
    if (!sourceEvent) return;
    if(sourceEvent==='question_presented'){state.lastMeasurement=raw.__measurement;return;}
    const sourceRunId = text(raw.runID ?? raw.runId, 160);
    const context = currentContext(raw);
    let runId = state.activeRunId;
    if (sourceEvent === "start") runId = createRun(sourceRunId, context.mode);
    if (sourceEvent === "resume") runId = resumeRun(sourceRunId, context.mode);
    runId ||= ensureRun(context.mode);

    if (sourceEvent === "start" || sourceEvent === "resume") {
      // start is sent before the Standard engine reset; never sample prior-run
      // question/progress globals for these pre-question lifecycle events.
      const initial = { ...raw, position: 0, questionId: "", conceptId: "", learningObjective: "",
        questionType: "", difficulty: "", remediationStage: "", bridgeStage: "", retestStage: "",
        bossStage: "", graphQuestion: false };
      if (sourceEvent === "start") {
        Object.assign(initial, { elapsedTimeMs: 0, streak: 0, score: 0, dailyProgress: 0,
          masteryAttempts: 0, masteryCorrect: 0, masteryAccuracy: 0, weaknessEstimate: [], selectionReason: "new-run" });
        emit("mode_selected", initial, { runId });
      }
      state.visibilityPaused = false;
      emit(sourceEvent === "resume" ? "run_resumed" : "run_started", initial, { runId });
      return;
    }
    if (sourceEvent === "artifact_unlocked") {
      const baseline = state.runs[`${gameId}:artifacts:${runId}`];
      emit("artifact_unlocked", { ...raw,
        artifactOwnedBeforeRun: baseline?.[raw.artifact] ?? null,
        artifactNewlyEarned: !raw.artifactAlreadyOwned && baseline?.[raw.artifact] !== true
      }, { runId });
      return;
    }
    if (sourceEvent === "question" || sourceEvent === "rapid_guessing") {
      raw = { ...raw, ...(measurements === undefined ? responseMeasurements(raw) : measurements), acceptedAttempt: sourceEvent === "question", rapidGuess: context.rapidGuess };
      emit("answer_submitted", raw, { runId });
      emit("answer_evaluated", raw, { runId });
      // Outcome capture does not observe feedback rendering or reading. Mode policy describes availability.
      if (context.rapidGuess || sourceEvent === "rapid_guessing") emit("rapid_guess_detected", raw, { runId });
      const stage = context.remediationStage || context.bridgeStage || context.retestStage;
      if (stage === "repair") emit("repair_question_answered", raw, { runId });
      if (stage === "bridge") emit("bridge_question_answered", raw, { runId });
      if (stage === "retest") emit("retest_question_answered", raw, { runId });
      if (context.bossStage) emit("boss_question_answered", raw, { runId });
      if (context.graphQuestion) emit("graph_question_answered", raw, { runId });
      if (["score", "fadingFortune", "riskReward"].includes(context.mode) && (state.lastScore === null || state.lastScore !== context.score)) emit("score_changed", raw, { runId });
      if (state.lastStreak === null || state.lastStreak !== context.streak) emit("streak_changed", raw, { runId });
      state.lastScore = context.score;
      state.lastStreak = context.streak;
      return;
    }
    if (sourceEvent === "exam_answer_initial" || sourceEvent === "exam_answer_revision") {
      emit(sourceEvent,{...raw,...(measurements === undefined ? responseMeasurements(raw) : measurements)},{runId});return;
    }
    if (sourceEvent === "boss_defeated") {
      emit("checkpoint_completed", raw, { runId });
      return;
    }
    if (COMPLETION_EVENTS.has(sourceEvent) || /_(?:complete|bust|ended_by_student)$/.test(sourceEvent)) {
      suspendQuestion("run-ended");
      emit("run_completed", { ...raw, completionStatus: sourceEvent }, { runId });
      runClosed=true;
      return;
    }
    emit(sourceEvent, raw, { runId });
  }

  function captureQuestionShown() {
    if(!beginInterval())return;
      const context = currentContext({});
      if (!context.questionId) return;
      const stage = context.remediationStage || context.bridgeStage || context.retestStage;
      if (stage !== state.lastStage) {
        if (state.lastStage) emit("adaptive_detour_ended", { lifecycleReason: state.lastStage });
        if (stage === "repair") emit("repair_triggered", { lifecycleReason: stage });
        if (stage === "bridge") emit("bridge_triggered", { lifecycleReason: stage });
        if (stage === "retest") emit("retest_triggered", { lifecycleReason: stage });
        state.lastStage = stage;
      }
      if (state.lastPosition > 0 && context.position > state.lastPosition) emit("room_advanced", {});
      if (context.position > 0) state.lastPosition = context.position;
      if (context.bossStage !== state.lastBossStage) {
        if (context.bossStage) emit("checkpoint_started", {});
        state.lastBossStage = context.bossStage;
      }
      if (stage === "repair") emit("repair_question_shown", {});
      if (stage === "bridge") emit("bridge_question_shown", {});
      if (stage === "retest") emit("retest_question_shown", {});
      if (context.bossStage) emit("boss_question_shown", {});
      if (context.graphQuestion) emit("graph_question_shown", {});
  }

  function masterySummary() {
    MQContract.resources();
    setTimeout(() => {
      const context = currentContext({});
      emit("mastery_report_summary_emitted", {
        masteryAttempts: context.masteryAttempts,
        masteryCorrect: context.masteryCorrect,
        masteryAccuracy: context.masteryAccuracy,
        weaknessEstimate: context.weaknessEstimate
      });
    }, 0);
  }

  function wrapAfter(name, after) {
    const original = window[name];
    if (typeof original !== "function" || original.__anonymousTelemetryWrapped) return false;
    const wrapped = function(...args) {
      const result = original.apply(this, args);
      if(result && typeof result.then === "function") result.then(()=>{try{after(args,result);}catch(_){}},()=>{});
      else try { after(args, result); } catch (_) {}
      return result;
    };
    wrapped.__anonymousTelemetryWrapped = true;
    window[name] = wrapped;
    return true;
  }

  function installExamHooks() {
    // Classroom navigation helpers load after this adapter; re-install at DOM ready.
    const finalize=window.finalizeExamRoomView;
    if(typeof finalize==='function'&&!finalize.__anonymousTelemetryWrapped){
      const wrapped=function(...args){safeBehavior(()=>finishInterval());return finalize.apply(this,args);};
      wrapped.__anonymousTelemetryWrapped=true;window.finalizeExamRoomView=wrapped;
    }
  }

  // Extend the existing local exporter; never build a parallel CSV or tracker.
  function installLocalTelemetryColumns(){
    const columns=globalValue('TELEMETRY_COLUMNS',null);
    if(!Array.isArray(columns))return;
    for(const key of BEHAVIOR_FIELDS.concat('gameplayResponseTimeMs',["contractID","manifestID","provenanceStatus","presentationID","attemptID","canonicalSelectedIndex","localSequence","manifestJSON","deliveryQuality","supportJSON","originAttemptID","resourceID"]))if(!columns.includes(key))columns.push(key);
  }
  function installLocalCsvDownload(){
    const original=window.downloadTelemetryCsv;
    if(typeof original!=='function'||original.__anonymousLocalCsvWrapped)return;
    const wrapped=function(activeRunID=globalValue('runID','')){
      const resolved=activeRunID || localStorage.getItem(globalValue('LATEST_TELEMETRY_RUN_KEY',''));
      const records=resolved ? globalValue('readLocalTelemetry')?.(resolved) : [];
      if(!records?.length)return original.apply(this,arguments);
      // Reuse the game's reader, ordered columns and quoting; no metric calculation.
      const columns=globalValue('TELEMETRY_COLUMNS',[]),escape=globalValue('escapeCsvValue');
      const exported=MQContract.exportRows(records,resolved);
      if(state.quality)for(const row of exported)if(row.event==='export_manifest')row.deliveryQuality=JSON.stringify({...JSON.parse(row.deliveryQuality),remoteOverflow:state.quality.overflow,remoteCancelled:state.quality.cancelled,remotePermanentlyRejected:state.quality.permanentlyRejected,remoteStorageFailures:state.quality.storageFailures,remotePending:state.queue.length});
      const rows=[columns.join(','),...exported.map(row=>columns.map(key=>escape(row[key])).join(','))];
      const url=URL.createObjectURL(new Blob(['\uFEFF',rows.join('\r\n')],{type:'text/csv;charset=utf-8'}));
      const link=document.createElement('a');
      const mode=String(records.at(-1)?.mode || 'run').replace(/[^a-z0-9_-]+/gi,'-').toLowerCase();
      link.href=url;
      link.download=`${globalValue('FACULTY_COMPOSITION_CONFIG',{}).slug || 'faculty-mastery-quest'}_${mode}_${resolved}.csv`;
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    wrapped.__anonymousLocalCsvWrapped=true;window.downloadTelemetryCsv=wrapped;
  }
  function localTelemetryTail(data){
    const localRun=data?.runID || globalValue('runID','') || localStorage.getItem(globalValue('RUN_ID_KEY',''));
    const read=globalValue('readLocalTelemetry',null);
    if(!localRun || typeof read!=='function')return null;
    return {runId:localRun,eventId:read(localRun).at(-1)?.eventID};
  }
  function attachLocalMeasurements(data, measurements, prior){
    if(!prior)return;
    const read=globalValue('readLocalTelemetry',null),key=globalValue('getTelemetryKey',null);
    if(typeof read!=='function'||typeof key!=='function')return;
    const records=read(prior.runId),row=records.at(-1);
    // Only enrich the row just saved by this invocation, including at the cap.
    if(!row || row.eventID===prior.eventId || row.event!==data.event){MQContract.state(prior.runId).quality.storageFailures++;return;}
    if(measurements){row.gameplayResponseTimeMs=row.responseTimeMs;
    for(const field of ['responseTimeMs',...BEHAVIOR_FIELDS])row[field]=measurements[field] ?? null;}
    MQContract.stamp(row,data);
    data.__measurement=Object.fromEntries(MQContract.fields.filter(k=>!['manifestJSON','deliveryQuality'].includes(k)).map(k=>[k,row[k]??null]));
    localStorage.setItem(key(prior.runId),JSON.stringify(records));
  }

  function installHooks() {
    try { MQContract.build(); MQContract.wrapShuffle(); MQContract.installResources(); } catch (_) {}
    try { installLocalTelemetryColumns(); } catch (_) {}
    try { installLocalCsvDownload(); } catch (_) {}
    const originalSend = window.sendGameData;
    if (typeof originalSend === "function" && !originalSend.__anonymousTelemetryWrapped) {
      const wrapped = function(data) {
        let result, measurements, prior;
        // Resolve once: local and anonymous rows receive the identical snapshot.
        try { measurements=responseMeasurements(data || {}); prior=localTelemetryTail(data); } catch (_) {}
        try { result = originalSend.apply(this, arguments); } finally {
          try { attachLocalMeasurements(data || {},measurements,prior); } catch (_) {}
          try { mapGameEvent(data || {},measurements); } catch (_) {}
        }
        return result;
      };
      wrapped.__anonymousTelemetryWrapped = true;
      window.sendGameData = wrapped;
    }
    wrapAfter("displayQuestion", captureQuestionShown);
    wrapAfter("phase15RestoreSavedQuestion", captureQuestionShown);
    wrapAfter("beginFadingFortuneQuestion", captureQuestionShown);
    wrapAfter("renderRiskRewardQuestion", captureQuestionShown);
    wrapAfter("showMasteryReportScreen", masterySummary);
    const originalAnswer=window.answer;
    if(typeof originalAnswer==='function'&&!originalAnswer.__anonymousTelemetryWrapped){
      const wrapped=function(...args){
        safeBehavior(()=>{
          if(!globalValue('answerSubmissionPending',false)&&!globalValue('rapidGuessLocked',false)&&tracker.active()){
            tracker.flushSelection();pendingTiming=tracker.snapshot();pendingKey=intervalKey;
          }
        });
        return originalAnswer.apply(this,args);
      };
      wrapped.__anonymousTelemetryWrapped=true;window.answer=wrapped;
    }
    for(const name of ['returnToModeSelectFromRun','returnToTitleScreen']){
      const original=window[name];
      if(typeof original!=='function'||original.__anonymousTelemetryWrapped)continue;
      const wrapped=function(...args){
        safeBehavior(()=>{suspendQuestion('menu');pauseForLifecycle('menu');runClosed=true;});
        return original.apply(this,args);
      };
      wrapped.__anonymousTelemetryWrapped=true;window[name]=wrapped;
    }
    installExamHooks();
    // Capture ownership before launch helpers clear any run-local save state.
    for (const name of ["startNewRun", "startSelectedMode", "startGame"]) {
      const original = window[name];
      if (typeof original !== "function" || original.__anonymousTelemetryWrapped) continue;
      const wrapped = function(...args) {
        if (state.launchDepth === 0) { try { state.artifactOwnership = artifactOwnership(); } catch (_) { state.artifactOwnership = null; } }
        state.launchDepth++;
        try { return original.apply(this, args); } finally { state.launchDepth--; }
      };
      wrapped.__anonymousTelemetryWrapped = true;
      window[name] = wrapped;
    }
  }

  function scheduleFlush(delay) {
    if(!remoteEnabled())return;
    if (state.retryTimer) clearTimeout(state.retryTimer);
    state.retryTimer = setTimeout(() => flush(), delay);
  }

  async function flush(options = {}) {
    if(!remoteEnabled()){setRemoteCollection(false);return {ok:true,disabled:true,queued:0};}
    const epoch=collectionEpoch;
    if (state.flushing || !state.queue.length) return { ok: true, queued: state.queue.length };
    if (state.failureSimulation) {
      state.lastStatus = "simulated network failure; queue preserved";
      state.retryAttempt += 1;
      scheduleFlush(Math.min(30000, 1000 * 2 ** Math.min(state.retryAttempt, 5)));
      updateDebug();
      return { ok: false, simulated: true, queued: state.queue.length };
    }
    state.flushing = true;
    const batch = state.queue.slice(0, state.singletonRetry?1:BATCH_SIZE);
    let timeout;
    try {
      const controller=new AbortController();
      timeout=setTimeout(()=>controller.abort(),10000);
      const response = await fetch(endpoint, {
        signal:controller.signal,
        method: "POST",
        headers: { "content-type": "application/json", "x-telemetry-phase": PHASE },
        body: JSON.stringify({ phase: PHASE, events: batch }),
        keepalive: Boolean(options.keepalive),
        credentials: "omit"
      });
      if(epoch!==collectionEpoch || !remoteEnabled())return {ok:false,cancelled:true};
      if([400,413,422].includes(response.status)){
        // Isolate individual poison records; valid peers retain their original IDs.
        state.singletonRetry=true;
        if(batch.length===1){const index=state.queue.indexOf(batch[0]);if(index>=0){state.queue.splice(index,1);state.quality.permanentlyRejected++;}persistQueue();saveQuality();}
        scheduleFlush(50);return {ok:false,permanentRejection:true,queued:state.queue.length};
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json().catch(() => ({}));
      if(!Array.isArray(result.acknowledgedEventIds))throw new Error('Missing acknowledgment IDs; queue retained');
      const sentIds=new Set(batch.map(item=>item?.eventId));
      const acknowledged=new Set(result.acknowledgedEventIds.filter(id=>sentIds.has(id)));
      if(!acknowledged.size)throw new Error('No acknowledged events; queue retained');
      state.queue = state.queue.filter(item => !acknowledged.has(item?.eventId));
      persistQueue();
      state.retryAttempt = 0;
      state.lastSuccessfulSend = new Date().toISOString();
      state.lastServerResponse = `HTTP ${response.status}; accepted ${Number(result.accepted || 0)}; duplicates ${Number(result.duplicates || 0)}`;
      state.lastStatus = `flushed ${acknowledged.size}; ${state.queue.length} queued`;
      if (state.queue.length) scheduleFlush(50);
      return { ok: true, acknowledged: acknowledged.size, queued: state.queue.length };
    } catch (error) {
      state.retryAttempt += 1;
      state.failedSendCount += 1;
      state.lastServerResponse = String(error?.message || error);
      state.lastStatus = `offline/server unavailable; ${state.queue.length} queued`;
      scheduleFlush(Math.min(30000, 1000 * 2 ** Math.min(state.retryAttempt, 5)));
      return { ok: false, error: String(error?.message || error), queued: state.queue.length };
    } finally {
      clearTimeout(timeout);
      state.flushing = false;
      updateDebug();
    }
  }

  function addDisclosure() {
    if (document.getElementById("anonymousTelemetryDisclosure")) return;
    const disclosure = document.createElement("details");
    disclosure.id = "anonymousTelemetryDisclosure";
    disclosure.style.cssText = "position:fixed;right:10px;bottom:10px;z-index:2147483000;max-width:430px;padding:8px 10px;border:1px solid rgba(125,211,252,.5);border-radius:8px;background:rgba(2,6,23,.94);color:#e0f2fe;font:12px/1.45 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.35)";
    disclosure.innerHTML = "<summary style='cursor:pointer;font-weight:700'>Your game data</summary><p>This private build records game interactions, including answers, timing, and counts of relevant selection/copy actions. It never stores selected or copied content, clipboard contents, keystrokes, or unrelated-tab activity. A random browser ID can link runs without identifying a person. Use Download Game Data to inspect your own record. A tab switch or copy action alone does not establish misconduct, intent, attention, cognition, or learning. Turning off future transmission cancels pending unsent events and keeps local downloads available; the choice persists after refresh when browser storage is available. Re-enabling does not replay cancelled events. It cannot retract in-flight requests or delete accepted server records, downloaded copies, or backups. Already accepted application data remains under our 730-day whole-run policy, automatically evaluated daily from the latest stored server receipt. Disclosure mq-disclosure/2; governance mq-governance/2. <a href='/privacy/'>Privacy and your choices</a></p>";
    const control=document.createElement('label');
    control.innerHTML='<input type="checkbox"> Send future anonymous gameplay events';
    const toggle=control.querySelector?.('input');
    if(toggle){toggle.checked=remoteEnabled();toggle.addEventListener('change',()=>{toggle.checked=setRemoteCollection(toggle.checked);});}
    disclosure.appendChild?.(control);
    // BEGIN GOVERNANCE STATUS
    const collectionStatus=document.createElement('p');const updateCollectionStatus=()=>{collectionStatus.textContent=remoteEnabled()?'Anonymous transmission is enabled. Local Download Game Data remains available.':'Anonymous transmission is disabled. Game data and Download Game Data remain local.';};updateCollectionStatus();toggle?.addEventListener?.('change',updateCollectionStatus);disclosure.appendChild?.(collectionStatus);
    // END GOVERNANCE STATUS
    document.body.appendChild(disclosure);
  }

  function addDebugPanel() {
    if (!debugEnabled || state.debugNode) return;
    const node = document.createElement("details");
    node.id = "anonymousTelemetryDebug";
    node.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:2147483647;max-width:min(520px,calc(100vw - 16px));max-height:48vh;overflow:auto;padding:8px;border:2px solid #22d3ee;border-radius:8px;background:#020617;color:#e2e8f0;font:12px/1.4 ui-monospace,monospace;text-align:left";
    node.innerHTML = "<summary style='cursor:pointer;font-weight:800'>Anonymous telemetry POC debug</summary><pre data-status style='white-space:pre-wrap'></pre><details><summary>Recent queued events</summary><pre data-events style='white-space:pre-wrap'></pre></details><div style='display:flex;flex-wrap:wrap;gap:6px'><button data-action='new-run'>Fresh telemetry run</button><button data-action='flush'>Flush now</button><button data-action='failure'>Toggle failure simulation</button><button data-action='reset-client'>Reset client ID</button><button data-action='resume-check'>Verify resume mapping</button><button data-action='close'>Close</button></div>";
    node.addEventListener("click", async event => {
      const action = event.target?.dataset?.action;
      if (!action) return;
      if (action === "new-run") requestFreshRun();
      if (action === "flush") await flush();
      if (action === "failure") {
        state.failureSimulation = !state.failureSimulation;
        localStorage.setItem(FAILURE_KEY, state.failureSimulation ? "1" : "0");
        if (!state.failureSimulation) scheduleFlush(0);
      }
      if (action === "reset-client") {
        localStorage.removeItem(CLIENT_KEY);
        getClientId();
      }
      if (action === "resume-check") {
        const mapped = state.sourceRunId ? state.runs[`${gameId}:${state.sourceRunId}`] : "";
        state.lastStatus = mapped === state.activeRunId && Boolean(mapped) ? "resume mapping valid" : "no resumable source run mapped yet";
      }
      if (action === "close") node.open = false;
      updateDebug();
    });
    document.body.appendChild(node);
    state.debugNode = node;
    updateDebug();
  }

  function updateDebug() {
    const status = state.debugNode?.querySelector("[data-status]");
    if (!status) return;
    status.textContent = JSON.stringify({
      phase: PHASE,
      gameId,
      buildId: BUILD_ID,
      buildVersion: MQContract.build().buildRevision,
      schemaVersion: SCHEMA_VERSION,
      endpoint,
      syntheticMode,
      anonymousClientId: getClientId(),
      runId: state.sourceRunId ? state.activeRunId : "(pre-game/unmapped; start or resume gameplay)",
      sourceRunId: state.sourceRunId || "",
      sourceRunMapped: Boolean(state.sourceRunId),
      nextSequence: Number(state.sequences[state.activeRunId] || 0) + 1,
      queuedEvents: state.queue.length,
      failureSimulation: state.failureSimulation,
      failedSendCount: state.failedSendCount,
      lastSuccessfulSend: state.lastSuccessfulSend || "none",
      lastServerResponse: state.lastServerResponse,
      lastStatus: state.lastStatus
    }, null, 2);
    const recent = state.debugNode?.querySelector("[data-events]");
    if (recent) recent.textContent = JSON.stringify(state.queue.slice(-20).filter(Boolean).map(event => ({ sequenceNumber: event.sequenceNumber, eventType: event.eventType, position: event.position, questionId: event.questionId })), null, 2);
  }

  function requestFreshRun() {
    // A debug action cannot split an existing source run or mint a throwaway ID.
    state.lastStatus = "Start a New Run in the game menu to create a fresh telemetry run. Continue preserves the existing mapping.";
    updateDebug();
    return null;
  }

  function pauseForLifecycle(reason) {
    if (!state.activeRunId || state.visibilityPaused || runClosed) return;
    state.visibilityPaused = true;
    emit("run_paused", { lifecycleReason: reason });
  }

  window.AnonymousTelemetryPOC = Object.freeze({
    phase: PHASE,
    setRemoteCollection, remoteEnabled, getQuality:()=>({...state.quality}),
    emit,
    flush,
    getQueue: () => state.queue.slice(),
    getClientId,
    getRunId: () => state.activeRunId,
    forceNewRun: requestFreshRun,
    installHooks
  });

  if(!Array.isArray(state.queue)){state.queue=[];state.quality.storageFailures++;persistQueue();saveQuality();}
  if(!remoteEnabled())setRemoteCollection(false);
  installHooks();
  document.addEventListener('DOMContentLoaded',()=>{try{installExamHooks();}catch(_){}});
  document.addEventListener('selectionchange',()=>safeBehavior(()=>{if(!globalValue('answerSubmissionPending',false))tracker.selection();}));
  document.addEventListener('copy',()=>safeBehavior(()=>{if(!globalValue('answerSubmissionPending',false))tracker.copy();}));
  window.addEventListener('blur',()=>safeBehavior(()=>{if(!globalValue('answerSubmissionPending',false))tracker.blur();}));
  window.addEventListener('focus',()=>safeBehavior(()=>{if(!globalValue('answerSubmissionPending',false))tracker.focus();}));
  addDisclosure();
  addDebugPanel();
  window.addEventListener("online", () => scheduleFlush(0));
  window.addEventListener("pagehide", () => {
    if(runClosed)return;
    safeBehavior(()=>{if(tracker.active())emit("question_interrupted",{...intervalContext,...tracker.snapshot(),lifecycleReason:"pagehide"});});
    pauseForLifecycle("pagehide");
    flush({ keepalive: true });
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted && state.visibilityPaused && document.visibilityState === "visible") {
      state.visibilityPaused = false;
      emit("run_resumed", { lifecycleReason: "pageshow" });
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!state.activeRunId || runClosed) return;
    safeBehavior(()=>tracker.visibility());
    if (document.visibilityState === "hidden" && !state.visibilityPaused) {
      pauseForLifecycle("visibility-hidden");
      flush({ keepalive: true });
    } else if (document.visibilityState === "visible" && state.visibilityPaused) {
      state.visibilityPaused = false;
      emit("run_resumed", { lifecycleReason: "visibility-visible" });
    }
  });
  scheduleFlush(250);
})();
