(function anonymousClassroomTelemetry(){
  "use strict";

  const PHASE = "phaseAnonymousTelemetryPOC-v1";
  const BUILD_ID = "managerial-directorate-classroom";
  const BUILD_VERSION = "2026.09.05-classroom1";
  const SCHEMA_VERSION = 1;
  const DEFAULT_ENDPOINT = "/api/anonymous-telemetry-poc/v1/events";
  const QUEUE_KEY = "anonymousTelemetry:queue:v1";
  const CLIENT_KEY = "anonymousTelemetry:clientId:v1";
  const RUNS_KEY = "anonymousTelemetry:runs:v1";
  const SEQUENCES_KEY = "anonymousTelemetry:sequences:v1";
  const ACTIVE_RUN_KEY_PREFIX = "anonymousTelemetry:activeRun:v1:";
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
  const endpoint = DEFAULT_ENDPOINT;
  const state = {
    queue: readJSON(QUEUE_KEY, []),
    runs: readJSON(RUNS_KEY, {}),
    sequences: readJSON(SEQUENCES_KEY, {}),
    activeRunId: safeStorageGet(ACTIVE_RUN_KEY) || "",
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
  };

  function safeStorageGet(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function safeStorageSet(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  let memoryClientId = "";

  function readJSON(key, fallback) {
    try {
      const parsed = JSON.parse(safeStorageGet(key) || "null");
      return parsed === null ? fallback : parsed;
    } catch (_) { return fallback; }
  }

  function writeJSON(key, value) {
    try { safeStorageSet(key, JSON.stringify(value)); } catch (_) {}
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
    let value = memoryClientId || safeStorageGet(CLIENT_KEY);
    if (!/^[0-9a-f-]{36}$/i.test(value || "")) {
      value = uuid();
      safeStorageSet(CLIENT_KEY, value);
    }
    memoryClientId = value;
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
    state.visibilityPaused = false;
    state.runs[`${gameId}:artifacts:${runId}`] = state.artifactOwnership || artifactOwnership();
    state.lastStage = "";
    state.lastBossStage = "";
    state.lastPosition = 0;
    state.lastScore = null;
    state.lastStreak = null;
    safeStorageSet(ACTIVE_RUN_KEY, runId);
    if (mode) state.runs[`${gameId}:mode:${runId}`] = String(mode);
    writeJSON(RUNS_KEY, state.runs);
    return runId;
  }

  function resumeRun(sourceRunId, mode) {
    const sourceKey = sourceRunId ? `${gameId}:${sourceRunId}` : "";
    const mapped = sourceKey ? state.runs[sourceKey] : "";
    if (mapped) {
      state.activeRunId = mapped;
      state.sourceRunId = sourceRunId;
      safeStorageSet(ACTIVE_RUN_KEY, mapped);
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
    return Object.fromEntries(Object.entries(keys).map(([key, storageKey]) => [key, safeStorageGet(storageKey) === "true"]));
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
      const safeOverrides = {};
      for (const key of [
        "mode", "elapsedTimeMs", "position", "questionId", "conceptId", "learningObjective",
        "questionType", "difficulty", "selectedResponse", "correct", "responseTimeMs", "rapidGuess",
        "remediationStage", "bridgeStage", "retestStage", "bossStage", "graphQuestion", "score",
        "streak", "dailyProgress", "artifact", "completionStatus", "masteryAttempts", "masteryCorrect",
        "masteryAccuracy", "selectionReason", "weaknessEstimate", "sourceEvent",
        "sourceRunId", "lifecycleReason", "acceptedAttempt", "artifactName", "artifactSource",
        "artifactAlreadyOwned", "artifactOwnedBeforeRun", "artifactNewlyEarned"
      ]) {
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
        synthetic: false,
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
      scheduleFlush(0);
      return event;
    } catch (error) {
      state.lastStatus = `capture failed: ${error?.message || error}`;
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
      raw = { ...raw, acceptedAttempt: sourceEvent === "question", rapidGuess: context.rapidGuess };
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
    if (sourceEvent === "boss_defeated") {
      emit("checkpoint_completed", raw, { runId });
      return;
    }
    if (COMPLETION_EVENTS.has(sourceEvent) || /_(?:complete|bust|ended_by_student)$/.test(sourceEvent)) {
      emit("run_completed", { ...raw, completionStatus: sourceEvent }, { runId });
      return;
    }
    emit(sourceEvent, raw, { runId });
  }

  function captureQuestionShown() {
    setTimeout(() => {
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
      emit("question_shown", {});
      if (stage === "repair") emit("repair_question_shown", {});
      if (stage === "bridge") emit("bridge_question_shown", {});
      if (stage === "retest") emit("retest_question_shown", {});
      if (context.bossStage) emit("boss_question_shown", {});
      if (context.graphQuestion) emit("graph_question_shown", {});
    }, 0);
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
      try { after(args, result); } catch (_) {}
      return result;
    };
    wrapped.__anonymousTelemetryWrapped = true;
    window[name] = wrapped;
    return true;
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
    wrapAfter("beginFadingFortuneQuestion", captureQuestionShown);
    wrapAfter("renderRiskRewardQuestion", captureQuestionShown);
    wrapAfter("showMasteryReportScreen", masterySummary);
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
    state.flushing = true;
    const batch = state.queue.slice(0, BATCH_SIZE);
    try {
      const response = await fetch(endpoint, {
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
      state.flushing = false;
    }
  }

  function addDisclosure() {
    const disclosure = document.createElement("details");
    disclosure.id = "anonymousTelemetryDisclosure";
    disclosure.style.cssText = "margin-top:12px;color:#e0f2fe;font:13px/1.5 system-ui,sans-serif;text-align:left";
    disclosure.innerHTML = "<summary style='cursor:pointer'>About this class build</summary><p>This private class build records anonymous gameplay activity to help evaluate and improve the game. It does not collect your name, email, student ID, or course identity.</p>";
    document.getElementById("gameMenuOptions")?.appendChild(disclosure);
  }

  function pauseForLifecycle(reason) {
    if (!state.activeRunId || state.visibilityPaused) return;
    state.visibilityPaused = true;
    emit("run_paused", { lifecycleReason: reason });
  }


  installHooks();
  addDisclosure();
  window.addEventListener("online", () => scheduleFlush(0));
  window.addEventListener("pagehide", () => {
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
    if (!state.activeRunId) return;
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
