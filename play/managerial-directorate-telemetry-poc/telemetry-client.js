(function anonymousTelemetryPOC(){
  "use strict";

  const PHASE = "phaseAnonymousTelemetryPOC-v1";
  const BUILD_ID = "managerial-directorate-telemetry-poc";
  const BUILD_VERSION = "2026.09.04-poc1";
  const SCHEMA_VERSION = 1;
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
    state.lastStage = "";
    state.lastBossStage = "";
    state.lastPosition = 0;
    state.lastScore = null;
    state.lastStreak = null;
    localStorage.setItem(ACTIVE_RUN_KEY, runId);
    writeJSON(RUNS_KEY, state.runs);
    if (mode) state.runs[`${gameId}:mode:${runId}`] = String(mode);
    return runId;
  }

  function resumeRun(sourceRunId, mode) {
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
      elapsedTimeMs: number(raw.elapsedTime ?? raw.elapsedTimeMs ?? globalValue("getElapsedTimeMs", null)?.() ?? 0),
      position,
      questionId,
      conceptId,
      learningObjective: objective,
      questionType: type,
      difficulty,
      selectedResponse: raw.selectedIndex === undefined ? null : number(raw.selectedIndex),
      correct: raw.correct === undefined ? null : Boolean(Number(raw.correct)),
      responseTimeMs: number(raw.responseTime ?? raw.responseTimeMs),
      rapidGuess: Boolean(Number(raw.rapidGuessing)),
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
      sourceEvent: text(raw.event, 80)
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
        "masteryAccuracy", "selectionReason", "weaknessEstimate", "sourceEvent"
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
        synthetic: Boolean(options.synthetic || syntheticMode),
        ...context,
        ...safeOverrides
      };
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
      emit("mode_selected", raw, { runId });
      emit(sourceEvent === "resume" ? "run_resumed" : "run_started", raw, { runId });
      return;
    }
    if (sourceEvent === "question" || sourceEvent === "rapid_guessing") {
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
    if (COMPLETION_EVENTS.has(sourceEvent) || /_complete$/.test(sourceEvent)) {
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
        if (state.lastStage) emit("adaptive_detour_ended", { completionStatus: state.lastStage });
        if (stage === "repair") emit("repair_triggered", { completionStatus: stage });
        if (stage === "bridge") emit("bridge_triggered", { completionStatus: stage });
        if (stage === "retest") emit("retest_triggered", { completionStatus: stage });
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
    wrapAfter("unlockArtifact", args => emit("artifact_unlocked", { artifact: text(args[0], 120) }));
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
      updateDebug();
    }
  }

  function addDisclosure() {
    if (document.getElementById("anonymousTelemetryDisclosure")) return;
    const disclosure = document.createElement("details");
    disclosure.id = "anonymousTelemetryDisclosure";
    disclosure.style.cssText = "position:fixed;right:10px;bottom:10px;z-index:2147483000;max-width:430px;padding:8px 10px;border:1px solid rgba(125,211,252,.5);border-radius:8px;background:rgba(2,6,23,.94);color:#e0f2fe;font:12px/1.45 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.35)";
    disclosure.innerHTML = "<summary style='cursor:pointer;font-weight:700'>Anonymous research telemetry</summary><p style='margin:7px 0 0'>This private research build sends anonymous gameplay events to a research database. It does not send names, email addresses, account IDs, or typed free-response text. Events may include question identifiers, selected option index, correctness, timing, mode, adaptive-path state, score, streak, artifacts, and aggregate Mastery Report results. Transmission failures never block play; unsent events remain queued in this browser for retry.</p>";
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
      if (action === "new-run") createRun("debug:" + uuid(), currentContext({}).mode);
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
      if (action === "close") node.remove();
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
      runId: state.activeRunId || "(not started)",
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

  window.AnonymousTelemetryPOC = Object.freeze({
    phase: PHASE,
    emit,
    flush,
    getQueue: () => state.queue.slice(),
    getClientId,
    getRunId: () => state.activeRunId,
    forceNewRun: () => createRun("debug:" + uuid(), currentContext({}).mode),
    installHooks
  });

  installHooks();
  addDisclosure();
  addDebugPanel();
  window.addEventListener("online", () => scheduleFlush(0));
  window.addEventListener("pagehide", () => {
    if (state.activeRunId && !state.visibilityPaused) emit("run_paused", { completionStatus: "pagehide" });
    flush({ keepalive: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (!state.activeRunId) return;
    if (document.visibilityState === "hidden" && !state.visibilityPaused) {
      state.visibilityPaused = true;
      emit("run_paused", { completionStatus: "visibility-hidden" });
      flush({ keepalive: true });
    } else if (document.visibilityState === "visible" && state.visibilityPaused) {
      state.visibilityPaused = false;
      emit("run_resumed", { completionStatus: "visibility-visible" });
    }
  });
  scheduleFlush(250);
})();
