(function anonymousTelemetryPOC(){
  "use strict";

  const PHASE = "phaseAnonymousTelemetryPOC-v1";
  const BUILD_ID = "managerial-directorate-telemetry-poc";
  const BUILD_VERSION = "2026.09.10-parity3";
  const SCHEMA_VERSION = 2;
  const DEFAULT_ENDPOINT = "/api/anonymous-telemetry-poc/v1/events";
  const QUEUE_KEY = "anonymousTelemetry:queue:v1";
  const CLIENT_KEY = "anonymousTelemetry:clientId:v1";
  const RUNS_KEY = "anonymousTelemetry:runs:v1";
  const SEQUENCES_KEY = "anonymousTelemetry:sequences:v1";
  const ACTIVE_RUN_KEY_PREFIX = "anonymousTelemetry:activeRun:v1:";
  const FAILURE_KEY = "anonymousTelemetry:debugFailure:v1";
  const MAX_QUEUE = 2000;
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
    runs: readJSON(RUNS_KEY, {}),
    sequences: readJSON(SEQUENCES_KEY, {}),
    activeRunId: localStorage.getItem(ACTIVE_RUN_KEY) || "",
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
    failureSimulation: localStorage.getItem(FAILURE_KEY) === "1",
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
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
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
      const event = {
        eventId: uuid(),
        runId,
        anonymousClientId: getClientId(),
        buildId: BUILD_ID,
        buildVersion: BUILD_VERSION,
        schemaVersion: SCHEMA_VERSION,
        phase: PHASE,
        gameId,
        mode: context.mode,
        eventType: text(eventType, 80),
        sequenceNumber: nextSequence(runId),
        eventTimestamp: new Date().toISOString(),
        synthetic: Boolean(options.synthetic || syntheticMode),
        ...context,
        ...safeOverrides
      };
      // Lifecycle/adaptive reasons never occupy the durable terminal field.
      if (eventType !== "run_completed" && event.completionStatus) {
        event.lifecycleReason ||= event.completionStatus;
        event.completionStatus = "";
      }
      state.queue.push(event);
      if (state.queue.length > MAX_QUEUE) state.queue.splice(0, state.queue.length - MAX_QUEUE);
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

  function mapGameEvent(raw) {
    const sourceEvent = text(raw?.event, 80);
    if (!sourceEvent) return;
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
      raw = { ...raw, ...responseMeasurements(raw), acceptedAttempt: sourceEvent === "question", rapidGuess: context.rapidGuess };
      emit("answer_submitted", raw, { runId });
      emit("answer_evaluated", raw, { runId });
      emit("feedback_shown", raw, { runId });
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
      emit(sourceEvent,{...raw,...responseMeasurements(raw)},{runId});return;
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

  function installHooks() {
    const originalSend = window.sendGameData;
    if (typeof originalSend === "function" && !originalSend.__anonymousTelemetryWrapped) {
      const wrapped = function(data) {
        let result;
        try { result = originalSend.apply(this, arguments); } finally {
          try { mapGameEvent(data || {}); } catch (_) {}
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
    if (state.retryTimer) clearTimeout(state.retryTimer);
    state.retryTimer = setTimeout(() => flush(), delay);
  }

  async function flush(options = {}) {
    if (state.flushing || !state.queue.length) return { ok: true, queued: state.queue.length };
    if (state.failureSimulation) {
      state.lastStatus = "simulated network failure; queue preserved";
      state.retryAttempt += 1;
      scheduleFlush(Math.min(30000, 1000 * 2 ** Math.min(state.retryAttempt, 5)));
      updateDebug();
      return { ok: false, simulated: true, queued: state.queue.length };
    }
    state.flushing = true;
    const batch = state.queue.slice(0, BATCH_SIZE);
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json().catch(() => ({}));
      const acknowledged = new Set(Array.isArray(result.acknowledgedEventIds) ? result.acknowledgedEventIds : batch.map(item => item.eventId));
      state.queue = state.queue.filter(item => !acknowledged.has(item.eventId));
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
    disclosure.innerHTML = "<summary style='cursor:pointer;font-weight:700'>Anonymous gameplay telemetry</summary><p style='margin:7px 0 0'>This private QA build sends anonymous gameplay events to a gameplay telemetry database. It does not send names, email addresses, account IDs, or typed free-response text. Events include visibility/focus durations and counts of question-area selection/copy actions, but never selected or copied text. Events may include question identifiers, selected option index, correctness, timing, mode, adaptive-path state, score, streak, artifacts, and aggregate Mastery Report results. Transmission failures never block play; unsent events remain queued in this browser for retry.</p>";
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
      buildVersion: BUILD_VERSION,
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
    if (recent) recent.textContent = JSON.stringify(state.queue.slice(-20).map(event => ({ sequenceNumber: event.sequenceNumber, eventType: event.eventType, position: event.position, questionId: event.questionId })), null, 2);
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
    emit,
    flush,
    getQueue: () => state.queue.slice(),
    getClientId,
    getRunId: () => state.activeRunId,
    forceNewRun: requestFreshRun,
    installHooks
  });

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
