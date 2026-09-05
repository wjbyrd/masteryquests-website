export const PHASE = "phaseAnonymousTelemetryPOC-v1";
export const MAX_BATCH_EVENTS = 50;
export const MAX_BODY_BYTES = 131072;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENT_PATTERN = /^[a-z][a-z0-9_]{1,79}$/;
const FORBIDDEN_KEYS = new Set([
  "name", "username", "user", "email", "emailaddress", "account", "accountid",
  "studentid", "sisid", "lmsid", "ip", "ipaddress", "freeResponse", "responseText"
].map(value => value.toLowerCase()));

export const NORMALIZED_FIELDS = [
  "eventId", "runId", "anonymousClientId", "buildId", "buildVersion", "schemaVersion", "phase",
  "gameId", "mode", "eventType", "sequenceNumber", "eventTimestamp", "elapsedTimeMs", "position",
  "questionId", "conceptId", "learningObjective", "questionType", "difficulty", "selectedResponse",
  "correct", "responseTimeMs", "rapidGuess", "remediationStage", "bridgeStage", "retestStage",
  "bossStage", "graphQuestion", "score", "streak", "dailyProgress", "artifact", "completionStatus",
  "masteryAttempts", "masteryCorrect", "masteryAccuracy", "synthetic"
];
export const QA_EXTRA_FIELDS = ["sourceRunId", "lifecycleReason", "acceptedAttempt", "artifactName", "artifactSource",
  "artifactAlreadyOwned", "artifactOwnedBeforeRun", "artifactNewlyEarned"];
const BOOLEAN_EXTRAS = new Set(["acceptedAttempt", "artifactAlreadyOwned", "artifactOwnedBeforeRun", "artifactNewlyEarned"]);
const ALLOWED_EXTRA_KEYS = new Set(["selectionReason", "weaknessEstimate", "sourceEvent", ...QA_EXTRA_FIELDS]);

const FIELD_LIMITS = {
  buildId: 100, buildVersion: 80, phase: 80, gameId: 100, mode: 60, eventType: 80,
  eventTimestamp: 40, questionId: 160, conceptId: 160, learningObjective: 200,
  questionType: 80, difficulty: 80, remediationStage: 40, bridgeStage: 40,
  retestStage: 40, bossStage: 60, artifact: 120, completionStatus: 80
};

function assert(condition, message) {
  if (!condition) throw new TelemetryValidationError(message);
}

export class TelemetryValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "TelemetryValidationError";
    this.status = 400;
  }
}

function rejectForbiddenKeys(value, path = "event") {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    assert(!FORBIDDEN_KEYS.has(key.toLowerCase()), `${path}.${key} is not permitted`);
    rejectForbiddenKeys(child, `${path}.${key}`);
  }
}

function cleanString(value, field) {
  if (value === null || value === undefined) return "";
  const output = String(value);
  assert(output.length <= (FIELD_LIMITS[field] || 240), `${field} is too long`);
  return output;
}

function cleanNumber(value, field, { integer = false, min = -1e12, max = 1e12 } = {}) {
  if (value === null || value === undefined || value === "") return 0;
  const output = Number(value);
  assert(Number.isFinite(output), `${field} must be finite`);
  assert(output >= min && output <= max, `${field} is outside the accepted range`);
  assert(!integer || Number.isInteger(output), `${field} must be an integer`);
  return output;
}

export function validateEnvelope(input) {
  assert(input && typeof input === "object" && !Array.isArray(input), "request body must be an object");
  assert(input.phase === PHASE, `phase must be ${PHASE}`);
  assert(Array.isArray(input.events), "events must be an array");
  assert(input.events.length > 0 && input.events.length <= MAX_BATCH_EVENTS, `events must contain 1-${MAX_BATCH_EVENTS} records`);
  const normalized = input.events.map((event, index) => normalizeEvent(event, index));
  const eventIds = new Set();
  const runSequences = new Set();
  for (const [index, event] of normalized.entries()) {
    assert(!eventIds.has(event.eventId), `events[${index}].eventId is duplicated within the batch`);
    eventIds.add(event.eventId);
    const runSequence = `${event.runId}:${event.sequenceNumber}`;
    assert(!runSequences.has(runSequence), `events[${index}] duplicates a run sequence within the batch`);
    runSequences.add(runSequence);
  }
  return normalized;
}

export function normalizeEvent(event, index = 0) {
  assert(event && typeof event === "object" && !Array.isArray(event), `events[${index}] must be an object`);
  rejectForbiddenKeys(event, `events[${index}]`);
  assert(UUID_PATTERN.test(String(event.eventId || "")), `events[${index}].eventId must be a UUID`);
  assert(UUID_PATTERN.test(String(event.runId || "")), `events[${index}].runId must be a UUID`);
  assert(UUID_PATTERN.test(String(event.anonymousClientId || "")), `events[${index}].anonymousClientId must be a UUID`);
  assert(EVENT_PATTERN.test(String(event.eventType || "")), `events[${index}].eventType is invalid`);
  assert(event.phase === PHASE, `events[${index}].phase must be ${PHASE}`);
  const timestamp = new Date(event.eventTimestamp);
  assert(!Number.isNaN(timestamp.valueOf()), `events[${index}].eventTimestamp is invalid`);
  const now = Date.now();
  assert(timestamp.valueOf() >= now - 1000 * 60 * 60 * 24 * 90, `events[${index}].eventTimestamp is too old`);
  assert(timestamp.valueOf() <= now + 1000 * 60 * 10, `events[${index}].eventTimestamp is too far in the future`);

  const normalized = {
    eventId: String(event.eventId).toLowerCase(),
    runId: String(event.runId).toLowerCase(),
    anonymousClientId: String(event.anonymousClientId).toLowerCase(),
    buildId: cleanString(event.buildId, "buildId"),
    buildVersion: cleanString(event.buildVersion, "buildVersion"),
    schemaVersion: cleanNumber(event.schemaVersion, "schemaVersion", { integer: true, min: 1, max: 100 }),
    phase: cleanString(event.phase, "phase"),
    gameId: cleanString(event.gameId, "gameId"),
    mode: cleanString(event.mode, "mode"),
    eventType: cleanString(event.eventType, "eventType"),
    sequenceNumber: cleanNumber(event.sequenceNumber, "sequenceNumber", { integer: true, min: 1, max: 1e9 }),
    eventTimestamp: timestamp.toISOString(),
    elapsedTimeMs: cleanNumber(event.elapsedTimeMs, "elapsedTimeMs", { min: 0, max: 1000 * 60 * 60 * 48 }),
    position: cleanNumber(event.position, "position", { integer: true, min: 0, max: 100000 }),
    questionId: cleanString(event.questionId, "questionId"),
    conceptId: cleanString(event.conceptId, "conceptId"),
    learningObjective: cleanString(event.learningObjective, "learningObjective"),
    questionType: cleanString(event.questionType, "questionType"),
    difficulty: cleanString(event.difficulty, "difficulty"),
    selectedResponse: event.selectedResponse === null || event.selectedResponse === undefined ? null : cleanNumber(event.selectedResponse, "selectedResponse", { integer: true, min: -1, max: 100 }),
    correct: event.correct === null || event.correct === undefined ? null : Boolean(event.correct),
    responseTimeMs: cleanNumber(event.responseTimeMs, "responseTimeMs", { min: 0, max: 1000 * 60 * 60 }),
    rapidGuess: Boolean(event.rapidGuess),
    remediationStage: cleanString(event.remediationStage, "remediationStage"),
    bridgeStage: cleanString(event.bridgeStage, "bridgeStage"),
    retestStage: cleanString(event.retestStage, "retestStage"),
    bossStage: cleanString(event.bossStage, "bossStage"),
    graphQuestion: Boolean(event.graphQuestion),
    score: cleanNumber(event.score, "score"),
    streak: cleanNumber(event.streak, "streak", { integer: true, min: 0, max: 100000 }),
    dailyProgress: cleanNumber(event.dailyProgress, "dailyProgress", { min: 0 }),
    artifact: cleanString(event.artifact, "artifact"),
    completionStatus: cleanString(event.completionStatus, "completionStatus"),
    masteryAttempts: cleanNumber(event.masteryAttempts, "masteryAttempts", { integer: true, min: 0, max: 1000000 }),
    masteryCorrect: cleanNumber(event.masteryCorrect, "masteryCorrect", { integer: true, min: 0, max: 1000000 }),
    masteryAccuracy: cleanNumber(event.masteryAccuracy, "masteryAccuracy", { min: 0, max: 1 }),
    synthetic: Boolean(event.synthetic)
  };
  assert(normalized.buildId.length > 0, `events[${index}].buildId is required`);
  assert(normalized.gameId.length > 0, `events[${index}].gameId is required`);
  const extras = {};
  for (const [key, value] of Object.entries(event)) {
    if (NORMALIZED_FIELDS.includes(key)) continue;
    assert(ALLOWED_EXTRA_KEYS.has(key), `events[${index}].${key} is not an accepted research field`);
    if (QA_EXTRA_FIELDS.includes(key)) {
      if (BOOLEAN_EXTRAS.has(key)) {
        assert(value === null || typeof value === "boolean", `${key} must be boolean or null`);
        extras[key] = value;
      } else extras[key] = cleanString(value, key);
    }
    if (key === "selectionReason") extras[key] = cleanString(value, "selectionReason").slice(0, 160);
    if (key === "sourceEvent") extras[key] = cleanString(value, "sourceEvent").slice(0, 80);
    if (key === "weaknessEstimate") {
      assert(Array.isArray(value) && value.length <= 5, `events[${index}].weaknessEstimate must contain at most five rows`);
      extras[key] = value.map((row, rowIndex) => {
        assert(row && typeof row === "object" && !Array.isArray(row), `events[${index}].weaknessEstimate[${rowIndex}] must be an object`);
        assert(Object.keys(row).every(rowKey => ["key", "attempts", "accuracy"].includes(rowKey)), `events[${index}].weaknessEstimate[${rowIndex}] contains an unknown field`);
        return {
          key: String(row.key || "").slice(0, 120),
          attempts: cleanNumber(row.attempts, "weakness attempts", { integer: true, min: 0, max: 1000000 }),
          accuracy: cleanNumber(row.accuracy, "weakness accuracy", { min: 0, max: 1 })
        };
      });
    }
  }
  // Normalize queued v1 clients too; preserve their reasons outside terminal status.
  if (normalized.eventType !== "run_completed" && normalized.completionStatus) {
    extras.lifecycleReason ||= normalized.completionStatus;
    normalized.completionStatus = "";
  }
  const extrasJson = JSON.stringify(extras);
  assert(extrasJson.length <= 16384, `events[${index}] extras are too large`);
  normalized.extras = extras;
  return normalized;
}

export function analyzeSequence(events) {
  const ordered = [...events].sort((a,b) => Number(a.sequenceNumber ?? a.sequence_number) - Number(b.sequenceNumber ?? b.sequence_number));
  const seenIds = new Set();
  const duplicateEventIds = [];
  const gaps = [];
  const outOfOrder = [];
  let prior = 0;
  for (const event of events) {
    const sequence = Number(event.sequenceNumber ?? event.sequence_number);
    if (sequence <= prior) outOfOrder.push(sequence);
    prior = sequence;
  }
  let expected = ordered.length ? Number(ordered[0].sequenceNumber ?? ordered[0].sequence_number) : 1;
  for (const event of ordered) {
    const id = event.eventId ?? event.event_id;
    if (seenIds.has(id)) duplicateEventIds.push(id);
    seenIds.add(id);
    const sequence = Number(event.sequenceNumber ?? event.sequence_number);
    while (expected < sequence) gaps.push(expected++);
    expected = sequence + 1;
  }
  return { duplicateEventIds, gaps, outOfOrder, contiguous: !duplicateEventIds.length && !gaps.length && !outOfOrder.length };
}

export function eventExtras(event) {
  if (event.extras) return event.extras;
  if (event.extras_json) { try { return JSON.parse(event.extras_json); } catch (_) {} }
  return event;
}

export function acceptedAttempt(event) {
  const extras = eventExtras(event);
  if (typeof extras.acceptedAttempt === "boolean") return extras.acceptedAttempt;
  // Historical v1 source events identify the actual non-engaged engine branch.
  if (extras.sourceEvent === "rapid_guessing") return false;
  if (extras.sourceEvent === "question") return true;
  if (event.rapidGuess || event.rapid_guess) return false;
  return null; // do not invent acceptance for unclassified historical fixtures
}

export function reconstructRun(events) {
  const ordered = [...events].sort((a,b) => Number(a.sequenceNumber ?? a.sequence_number) - Number(b.sequenceNumber ?? b.sequence_number));
  const first = ordered[0] || {};
  const typeOf = event => event.eventType ?? event.event_type ?? "";
  const valueOf = (event, camel, snake) => event[camel] ?? event[snake];
  const answers = ordered.filter(event => typeOf(event) === "answer_evaluated");
  const accepted = answers.filter(event => acceptedAttempt(event) === true);
  const acceptedCorrect = accepted.filter(event => Boolean(event.correct)).length;
  const awards = ordered.filter(event => typeOf(event) === "artifact_unlocked");
  const correct = answers.filter(event => Boolean(valueOf(event, "correct", "correct"))).length;
  const completion = ordered.findLast ? ordered.findLast(event => typeOf(event) === "run_completed") : [...ordered].reverse().find(event => typeOf(event) === "run_completed");
  const mastery = [...ordered].reverse().find(event => typeOf(event) === "mastery_report_summary_emitted");
  return {
    phase: PHASE,
    runId: valueOf(first, "runId", "run_id") || "",
    anonymousClientId: valueOf(first, "anonymousClientId", "anonymous_client_id") || "",
    gameId: valueOf(first, "gameId", "game_id") || "",
    mode: valueOf(first, "mode", "mode") || "",
    startedAt: valueOf(first, "eventTimestamp", "event_timestamp") || "",
    completedAt: completion ? valueOf(completion, "eventTimestamp", "event_timestamp") : "",
    completionStatus: completion ? valueOf(completion, "completionStatus", "completion_status") : "incomplete",
    sourceRunId: ordered.map(event => eventExtras(event).sourceRunId).find(Boolean) || "",
    wallClockDurationMs: ordered.length ? Math.max(0, Date.parse(valueOf(completion || ordered.at(-1), "eventTimestamp", "event_timestamp")) - Date.parse(valueOf(first, "eventTimestamp", "event_timestamp"))) : 0,
    // This is the engine's existing elapsed value; no timing mechanics are changed.
    activeGameplayElapsedMs: completion ? Number(valueOf(completion, "elapsedTimeMs", "elapsed_time_ms") || 0) : null,
    eventCount: ordered.length,
    rawAttempts: answers.length,
    rawCorrect: correct,
    rawAccuracy: answers.length ? correct / answers.length : 0,
    acceptedAttempts: accepted.length,
    acceptedCorrect,
    acceptedAccuracy: accepted.length ? acceptedCorrect / accepted.length : 0,
    unclassifiedAttempts: answers.filter(event => acceptedAttempt(event) === null).length,
    attemptSemantics: "answerCount/correctAnswers/accuracy remain raw; accepted excludes the engine non-engaged branch; missing historical evidence is unclassified",
    answerCount: answers.length,
    correctAnswers: correct,
    accuracy: answers.length ? correct / answers.length : 0,
    rapidGuessCount: ordered.filter(event => typeOf(event) === "rapid_guess_detected").length,
    remediationDetours: ordered.filter(event => typeOf(event) === "repair_triggered").length,
    bridgeTriggers: ordered.filter(event => typeOf(event) === "bridge_triggered").length,
    retestTriggers: ordered.filter(event => typeOf(event) === "retest_triggered").length,
    bossCompletions: ordered.filter(event => typeOf(event) === "checkpoint_completed").length,
    graphAnswers: ordered.filter(event => typeOf(event) === "graph_question_answered").length,
    artifacts: awards.map(event => event.artifact).filter(Boolean),
    newlyEarnedArtifacts: awards.filter(event => eventExtras(event).artifactNewlyEarned === true).map(event => event.artifact),
    artifactAwards: awards.map(event => ({ artifact: event.artifact, position: event.position,
      artifactName: eventExtras(event).artifactName || "", source: eventExtras(event).artifactSource || "",
      alreadyOwned: eventExtras(event).artifactAlreadyOwned ?? null,
      ownedBeforeRun: eventExtras(event).artifactOwnedBeforeRun ?? null,
      newlyEarned: eventExtras(event).artifactNewlyEarned ?? null })),
    finalScore: Number(valueOf([...ordered].reverse().find(event => typeOf(event) === "score_changed") || {}, "score", "score") || 0),
    maxStreak: ordered.reduce((max, event) => Math.max(max, Number(valueOf(event, "streak", "streak") || 0)), 0),
    masterySummary: mastery ? {
      attempts: Number(valueOf(mastery, "masteryAttempts", "mastery_attempts") || 0),
      correct: Number(valueOf(mastery, "masteryCorrect", "mastery_correct") || 0),
      accuracy: Number(valueOf(mastery, "masteryAccuracy", "mastery_accuracy") || 0)
    } : null,
    sequence: analyzeSequence(ordered),
    timeline: ordered.map(event => ({
      sequenceNumber: Number(valueOf(event, "sequenceNumber", "sequence_number")),
      eventType: typeOf(event),
      timestamp: valueOf(event, "eventTimestamp", "event_timestamp"),
      position: Number(valueOf(event, "position", "position") || 0),
      questionId: valueOf(event, "questionId", "question_id") || ""
    }))
  };
}
