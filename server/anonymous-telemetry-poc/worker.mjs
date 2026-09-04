import {
  MAX_BODY_BYTES,
  PHASE,
  TelemetryValidationError,
  reconstructRun,
  validateEnvelope
} from "./telemetry-core.mjs";

const API_PREFIXES = ["/api/anonymous-telemetry-poc", ""];
const COMPLETION_EVENT = "run_completed";

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      const status = error instanceof TelemetryValidationError ? error.status : Number(error?.status || 500);
      if (status >= 500) console.error("anonymous telemetry worker error", error);
      return json({ ok: false, phase: PHASE, error: status >= 500 ? "internal error" : String(error.message || error) }, status);
    }
  }
};

async function route(request, env) {
  const url = new URL(request.url);
  const pathname = stripPrefix(url.pathname);
  if (request.method === "OPTIONS") return corsResponse(request, env);
  if (request.method === "GET" && pathname === "/v1/health") {
    return withCors(request, env, json({ ok: true, phase: PHASE, storage: Boolean(env.TELEMETRY_DB) }));
  }
  if (request.method === "POST" && pathname === "/v1/events") {
    assertAllowedOrigin(request, env);
    return withCors(request, env, await ingest(request, env));
  }
  if (pathname.startsWith("/v1/admin/")) {
    requireAdmin(request, env);
    return adminRoute(request, env, pathname, url);
  }
  return json({ ok: false, error: "not found" }, 404);
}

function stripPrefix(pathname) {
  for (const prefix of API_PREFIXES) {
    if (prefix && pathname.startsWith(prefix)) return pathname.slice(prefix.length) || "/";
  }
  return pathname;
}

async function ingest(request, env) {
  if (!env.TELEMETRY_DB) return json({ ok: false, error: "telemetry storage unavailable" }, 503);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return json({ ok: false, error: "request too large" }, 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ ok: false, error: "request too large" }, 413);
  let input;
  try { input = JSON.parse(raw); } catch (_) { throw new TelemetryValidationError("request body must be valid JSON"); }
  const events = validateEnvelope(input);
  const clientIds = [...new Set(events.map(event => event.anonymousClientId))];
  if (clientIds.length !== 1) throw new TelemetryValidationError("one anonymous client is permitted per batch");
  await enforceRateLimit(env, clientIds[0], events.length);

  const idPlaceholders = events.map(() => "?").join(",");
  const existing = await env.TELEMETRY_DB.prepare(
    `SELECT event_id FROM telemetry_events WHERE event_id IN (${idPlaceholders})`
  ).bind(...events.map(event => event.eventId)).all();
  const existingIds = new Set((existing.results || []).map(row => row.event_id));
  const sequenceWhere = events.map(() => "(run_id = ? AND sequence_number = ?)").join(" OR ");
  const existingSequences = await env.TELEMETRY_DB.prepare(
    `SELECT run_id, sequence_number FROM telemetry_events WHERE ${sequenceWhere}`
  ).bind(...events.flatMap(event => [event.runId, event.sequenceNumber])).all();
  const existingRunSequences = new Set((existingSequences.results || []).map(row => `${row.run_id}:${row.sequence_number}`));
  const novelEvents = events.filter(event => !existingIds.has(event.eventId) && !existingRunSequences.has(`${event.runId}:${event.sequenceNumber}`));

  const eventStatements = [];
  for (const event of novelEvents) {
    eventStatements.push(eventInsert(env, event));
    eventStatements.push(runUpsert(env, event));
  }
  const results = eventStatements.length ? await env.TELEMETRY_DB.batch(eventStatements) : [];
  let inserted = 0;
  for (let index = 0; index < results.length; index += 2) inserted += Number(results[index]?.meta?.changes || 0);
  const duplicates = events.length - inserted;
  const batchId = crypto.randomUUID();
  await env.TELEMETRY_DB.prepare(`
    INSERT INTO telemetry_ingest_batches
      (batch_id, anonymous_client_id, event_count, inserted_count, duplicate_count, synthetic)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(batchId, clientIds[0], events.length, inserted, duplicates, events.every(event => event.synthetic) ? 1 : 0).run();
  return json({
    ok: true,
    phase: PHASE,
    batchId,
    accepted: inserted,
    duplicates,
    acknowledgedEventIds: events.map(event => event.eventId)
  }, 202);
}

function eventInsert(env, event) {
  return env.TELEMETRY_DB.prepare(`
    INSERT OR IGNORE INTO telemetry_events (
      event_id, run_id, anonymous_client_id, build_id, build_version, schema_version, phase,
      game_id, mode, event_type, sequence_number, event_timestamp, elapsed_time_ms, position,
      question_id, concept_id, learning_objective, question_type, difficulty, selected_response,
      correct, response_time_ms, rapid_guess, remediation_stage, bridge_stage, retest_stage,
      boss_stage, graph_question, score, streak, daily_progress, artifact, completion_status,
      mastery_attempts, mastery_correct, mastery_accuracy, synthetic, extras_json
    ) VALUES (${Array(38).fill("?").join(",")})
  `).bind(
    event.eventId, event.runId, event.anonymousClientId, event.buildId, event.buildVersion,
    event.schemaVersion, event.phase, event.gameId, event.mode, event.eventType, event.sequenceNumber,
    event.eventTimestamp, event.elapsedTimeMs, event.position, event.questionId, event.conceptId,
    event.learningObjective, event.questionType, event.difficulty, event.selectedResponse,
    event.correct === null ? null : event.correct ? 1 : 0, event.responseTimeMs, event.rapidGuess ? 1 : 0,
    event.remediationStage, event.bridgeStage, event.retestStage, event.bossStage,
    event.graphQuestion ? 1 : 0, event.score, event.streak, event.dailyProgress, event.artifact,
    event.completionStatus, event.masteryAttempts, event.masteryCorrect, event.masteryAccuracy,
    event.synthetic ? 1 : 0, JSON.stringify(event.extras)
  );
}

function runUpsert(env, event) {
  const completed = event.eventType === COMPLETION_EVENT ? 1 : 0;
  return env.TELEMETRY_DB.prepare(`
    INSERT INTO telemetry_runs (
      run_id, anonymous_client_id, build_id, build_version, game_id, mode,
      first_event_at, last_event_at, event_count, max_sequence, completed, completion_status, synthetic
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    ON CONFLICT(run_id) DO UPDATE SET
      last_event_at = MAX(last_event_at, excluded.last_event_at),
      last_received_at = CURRENT_TIMESTAMP,
      event_count = event_count + 1,
      max_sequence = MAX(max_sequence, excluded.max_sequence),
      completed = MAX(completed, excluded.completed),
      completion_status = CASE WHEN excluded.completion_status <> '' THEN excluded.completion_status ELSE completion_status END,
      synthetic = MIN(synthetic, excluded.synthetic)
  `).bind(
    event.runId, event.anonymousClientId, event.buildId, event.buildVersion, event.gameId, event.mode,
    event.eventTimestamp, event.eventTimestamp, event.sequenceNumber, completed, event.completionStatus,
    event.synthetic ? 1 : 0
  );
}

async function enforceRateLimit(env, anonymousClientId, increment) {
  const windowMinute = Math.floor(Date.now() / 60000);
  const limit = Math.max(50, Number(env.MAX_EVENTS_PER_CLIENT_MINUTE || 300));
  const current = await env.TELEMETRY_DB.prepare(
    "SELECT event_count FROM telemetry_rate_limits WHERE anonymous_client_id = ? AND window_minute = ?"
  ).bind(anonymousClientId, windowMinute).first();
  if (Number(current?.event_count || 0) + increment > limit) {
    const error = new Error("rate limit exceeded");
    error.status = 429;
    throw error;
  }
  await env.TELEMETRY_DB.prepare(`
    INSERT INTO telemetry_rate_limits (anonymous_client_id, window_minute, event_count)
    VALUES (?, ?, ?)
    ON CONFLICT(anonymous_client_id, window_minute)
    DO UPDATE SET event_count = event_count + excluded.event_count
  `).bind(anonymousClientId, windowMinute, increment).run();
  if (Math.random() < 0.01) {
    await env.TELEMETRY_DB.prepare("DELETE FROM telemetry_rate_limits WHERE window_minute < ?").bind(windowMinute - 10).run();
  }
}

async function adminRoute(request, env, pathname, url) {
  if (!env.TELEMETRY_DB) return json({ ok: false, error: "telemetry storage unavailable" }, 503);
  if (request.method === "GET" && pathname === "/v1/admin/summary") {
    const totals = await env.TELEMETRY_DB.prepare(`
      SELECT COUNT(*) AS events, COUNT(DISTINCT run_id) AS runs,
             COUNT(DISTINCT anonymous_client_id) AS clients,
             SUM(CASE WHEN synthetic = 1 THEN 1 ELSE 0 END) AS synthetic_events
      FROM telemetry_events
    `).first();
    const recent = await env.TELEMETRY_DB.prepare(`
      SELECT run_id, anonymous_client_id, game_id, mode, first_event_at, last_event_at,
             event_count, max_sequence, completed, completion_status, synthetic
      FROM telemetry_runs ORDER BY last_event_at DESC LIMIT 50
    `).all();
    return noStore(json({ ok: true, phase: PHASE, totals, recentRuns: recent.results || [] }));
  }
  if (request.method === "GET" && pathname === "/v1/admin/anomalies") {
    const rows = await env.TELEMETRY_DB.prepare(`
      WITH arrivals AS (
        SELECT run_id, sequence_number,
               LAG(sequence_number) OVER (PARTITION BY run_id ORDER BY received_at, rowid) AS prior_arrival_sequence
        FROM telemetry_events
      ), arrival_violations AS (
        SELECT run_id, SUM(CASE WHEN prior_arrival_sequence IS NOT NULL AND sequence_number < prior_arrival_sequence THEN 1 ELSE 0 END) AS out_of_order_arrivals
        FROM arrivals GROUP BY run_id
      )
      SELECT r.run_id, r.game_id, r.mode, r.event_count, r.max_sequence, r.completed,
             COUNT(e.event_id) AS stored_events,
             MIN(e.sequence_number) AS min_sequence,
             MAX(e.sequence_number) AS max_sequence_seen,
             COUNT(e.event_id) - COUNT(DISTINCT e.sequence_number) AS duplicate_sequences,
             COALESCE(a.out_of_order_arrivals, 0) AS out_of_order_arrivals
      FROM telemetry_runs r
      LEFT JOIN telemetry_events e ON e.run_id = r.run_id
      LEFT JOIN arrival_violations a ON a.run_id = r.run_id
      GROUP BY r.run_id
      HAVING min_sequence <> 1 OR stored_events <> max_sequence_seen OR duplicate_sequences > 0
          OR out_of_order_arrivals > 0 OR r.completed = 0
      ORDER BY r.last_event_at DESC LIMIT 500
    `).all();
    const duplicateBatches = await env.TELEMETRY_DB.prepare(`
      SELECT batch_id, received_at, anonymous_client_id, event_count, duplicate_count
      FROM telemetry_ingest_batches WHERE duplicate_count > 0 ORDER BY received_at DESC LIMIT 200
    `).all();
    return noStore(json({ ok: true, phase: PHASE, runsWithGapsOutOfOrderOrIncomplete: rows.results || [], duplicateBatches: duplicateBatches.results || [] }));
  }
  const runMatch = pathname.match(/^\/v1\/admin\/runs\/([0-9a-f-]{36})(?:\/(reconstruct))?$/i);
  if (request.method === "GET" && runMatch) {
    const rows = await env.TELEMETRY_DB.prepare(
      "SELECT * FROM telemetry_events WHERE run_id = ? ORDER BY sequence_number ASC"
    ).bind(runMatch[1].toLowerCase()).all();
    if (runMatch[2]) return noStore(json({ ok: true, reconstruction: reconstructRun(rows.results || []) }));
    return noStore(json({ ok: true, phase: PHASE, runId: runMatch[1].toLowerCase(), events: rows.results || [] }));
  }
  if (request.method === "GET" && pathname === "/v1/admin/export.csv") {
    const buildId = String(url.searchParams.get("buildId") || "managerial-directorate-telemetry-poc").slice(0, 100);
    const includeSynthetic = url.searchParams.get("includeSynthetic") === "1";
    const rows = await env.TELEMETRY_DB.prepare(`
      SELECT * FROM telemetry_events WHERE build_id = ? AND (? = 1 OR synthetic = 0)
      ORDER BY run_id, sequence_number LIMIT 50000
    `).bind(buildId, includeSynthetic ? 1 : 0).all();
    return noStore(csv(rows.results || []));
  }
  if (request.method === "POST" && pathname === "/v1/admin/cleanup") {
    const body = await request.json().catch(() => ({}));
    if (body.confirm !== "DELETE") return json({ ok: false, error: "confirm must equal DELETE" }, 400);
    const scope = body.scope;
    let where;
    let binding;
    if (scope === "synthetic") { where = "synthetic = 1"; binding = null; }
    else if (scope === "build" && body.buildId) { where = "build_id = ?"; binding = String(body.buildId).slice(0, 100); }
    else return json({ ok: false, error: "scope must be synthetic or a named build" }, 400);
    const eventStatement = env.TELEMETRY_DB.prepare(`DELETE FROM telemetry_events WHERE ${where}`);
    const runStatement = env.TELEMETRY_DB.prepare(`DELETE FROM telemetry_runs WHERE ${where}`);
    const eventResult = binding === null ? await eventStatement.run() : await eventStatement.bind(binding).run();
    const runResult = binding === null ? await runStatement.run() : await runStatement.bind(binding).run();
    if (scope === "synthetic") await env.TELEMETRY_DB.prepare("DELETE FROM telemetry_ingest_batches WHERE synthetic = 1").run();
    return noStore(json({ ok: true, phase: PHASE, deletedEvents: eventResult.meta?.changes || 0, deletedRuns: runResult.meta?.changes || 0 }));
  }
  return json({ ok: false, error: "admin route not found" }, 404);
}

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean);
}

function assertAllowedOrigin(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  if (!allowedOrigins(env).includes(origin)) {
    const error = new Error("origin not permitted");
    error.status = 403;
    throw error;
  }
}

function requireAdmin(request, env) {
  const configured = String(env.ADMIN_TOKEN || "");
  const supplied = String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!configured || !supplied || supplied !== configured) {
    const error = new Error("admin authorization required");
    error.status = 401;
    throw error;
  }
}

function corsResponse(request, env) {
  assertAllowedOrigin(request, env);
  return withCors(request, env, new Response(null, { status: 204 }));
}

function withCors(request, env, response) {
  const origin = request.headers.get("origin");
  if (origin && allowedOrigins(env).includes(origin)) {
    response.headers.set("access-control-allow-origin", origin);
    response.headers.set("vary", "origin");
    response.headers.set("access-control-allow-methods", "POST,GET,OPTIONS");
    response.headers.set("access-control-allow-headers", "content-type,x-telemetry-phase,authorization");
  }
  return response;
}

function noStore(response) {
  response.headers.set("cache-control", "no-store");
  response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return response;
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff" }
  });
}

function csv(rows) {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const escape = value => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const body = [columns.map(escape).join(","), ...rows.map(row => columns.map(column => escape(row[column])).join(","))].join("\r\n");
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=anonymous-telemetry-poc.csv",
      "x-content-type-options": "nosniff"
    }
  });
}
