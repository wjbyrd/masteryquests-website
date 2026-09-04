import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import worker from "../../server/anonymous-telemetry-poc/worker.mjs";
import { PHASE } from "../../server/anonymous-telemetry-poc/telemetry-core.mjs";

const repo = path.resolve(process.argv[2] || ".");
const outputDir = path.join(repo, "validation_artifacts", "anonymous_telemetry_poc");
const synthetic = JSON.parse(fs.readFileSync(path.join(outputDir, "synthetic_scenarios.json"), "utf8"));
const migration = fs.readFileSync(path.join(repo, "server", "anonymous-telemetry-poc", "migrations", "0001_initial.sql"), "utf8");
const db = new DatabaseSync(":memory:");
db.exec(migration);

class D1Statement {
  constructor(database, sql) { this.database = database; this.sql = sql; this.values = []; }
  bind(...values) { this.values = values; return this; }
  async run() { const result = this.database.prepare(this.sql).run(...this.values); return { success: true, meta: { changes: Number(result.changes) } }; }
  async all() { return { success: true, results: this.database.prepare(this.sql).all(...this.values) }; }
  async first() { return this.database.prepare(this.sql).get(...this.values) || null; }
}
class D1Database {
  constructor(database) { this.database = database; }
  prepare(sql) { return new D1Statement(this.database, sql); }
  async batch(statements) { const results = []; this.database.exec("BEGIN"); try { for (const statement of statements) results.push(await statement.run()); this.database.exec("COMMIT"); return results; } catch (error) { this.database.exec("ROLLBACK"); throw error; } }
}

const env = {
  TELEMETRY_DB: new D1Database(db),
  ALLOWED_ORIGINS: "https://private.example.test",
  MAX_EVENTS_PER_CLIENT_MINUTE: "300",
  ADMIN_TOKEN: "synthetic-test-admin-token"
};
const results = [];
async function check(name, fn) {
  try { await fn(); results.push({ name, status: "PASS" }); }
  catch (error) { results.push({ name, status: "FAIL", detail: String(error?.stack || error) }); }
}
async function call(pathname, { method = "GET", body, origin = "https://private.example.test", admin = false } = {}) {
  const headers = {};
  if (origin) headers.origin = origin;
  if (body !== undefined) headers["content-type"] = "application/json";
  if (admin) headers.authorization = `Bearer ${env.ADMIN_TOKEN}`;
  const request = new Request(`https://telemetry.example.test${pathname}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  return worker.fetch(request, env);
}
const scenario = letter => synthetic.scenarios.find(item => item.label.startsWith(letter + " "));

await check("01 migration creates normalized tables", async () => {
  const names = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row => row.name); for (const name of ["telemetry_events","telemetry_runs","telemetry_ingest_batches","telemetry_rate_limits"]) assert.ok(names.includes(name), name);
});
await check("02 health endpoint reports storage", async () => { const response = await call("/v1/health"); assert.equal(response.status, 200); assert.equal((await response.json()).storage, true); });
await check("03 disallowed origin rejected", async () => { const response = await call("/v1/events", { method: "POST", origin: "https://evil.example", body: { phase: PHASE, events: scenario("A").events } }); assert.equal(response.status, 403); });
await check("04 direct identifier rejected", async () => { const event = { ...scenario("A").events[0], email: "student@example.test" }; const response = await call("/v1/events", { method: "POST", body: { phase: PHASE, events: [event] } }); assert.equal(response.status, 400); });
await check("04b arbitrary extras rejected", async () => { const event = { ...scenario("A").events[0], arbitraryText: "not part of the research schema" }; const response = await call("/v1/events", { method: "POST", body: { phase: PHASE, events: [event] } }); assert.equal(response.status, 400); });
await check("04c duplicate run sequence inside one batch rejected", async () => { const first = scenario("A").events[0]; const second = { ...scenario("A").events[1], sequenceNumber: first.sequenceNumber }; const response = await call("/v1/events", { method: "POST", body: { phase: PHASE, events: [first, second] } }); assert.equal(response.status, 400); });
await check("05 valid batch ingests", async () => { const response = await call("/api/anonymous-telemetry-poc/v1/events", { method: "POST", body: { phase: PHASE, events: scenario("A").events } }); const body = await response.json(); assert.equal(response.status, 202); assert.equal(body.accepted, 7); assert.equal(body.duplicates, 0); assert.equal(body.acknowledgedEventIds.length, 7); });
await check("06 duplicate retry is idempotent", async () => { const response = await call("/v1/events", { method: "POST", body: { phase: PHASE, events: scenario("A").events } }); const body = await response.json(); assert.equal(body.accepted, 0); assert.equal(body.duplicates, 7); assert.equal(db.prepare("SELECT event_count FROM telemetry_runs WHERE run_id = ?").get(scenario("A").events[0].runId).event_count, 7); });
await check("07 resumed run stores one run with contiguous sequence", async () => { const response = await call("/v1/events", { method: "POST", body: { phase: PHASE, events: scenario("E").events } }); assert.equal(response.status, 202); const row = db.prepare("SELECT event_count, max_sequence FROM telemetry_runs WHERE run_id = ?").get(scenario("E").events[0].runId); assert.equal(row.event_count, 4); assert.equal(row.max_sequence, 4); });
await check("08 completion and mastery batch ingests", async () => { const response = await call("/v1/events", { method: "POST", body: { phase: PHASE, events: scenario("F").events } }); assert.equal(response.status, 202); const row = db.prepare("SELECT completed, completion_status FROM telemetry_runs WHERE run_id = ?").get(scenario("F").events[0].runId); assert.equal(row.completed, 1); assert.equal(row.completion_status, "complete"); });
await check("09 admin routes require bearer secret", async () => { const response = await call("/v1/admin/summary"); assert.equal(response.status, 401); });
await check("10 admin summary returns counts without caching", async () => { const response = await call("/v1/admin/summary", { admin: true }); const body = await response.json(); assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store"); assert.ok(Number(body.totals.events) >= 13); });
await check("11 run events are sequence ordered", async () => { const runId = scenario("E").events[0].runId; const response = await call(`/v1/admin/runs/${runId}`, { admin: true }); const body = await response.json(); assert.deepEqual(body.events.map(event => event.sequence_number), [1,2,3,4]); });
await check("12 server reconstruction is coherent", async () => { const runId = scenario("F").events[0].runId; const response = await call(`/v1/admin/runs/${runId}/reconstruct`, { admin: true }); const body = await response.json(); assert.equal(body.reconstruction.completionStatus, "complete"); assert.equal(body.reconstruction.masterySummary.accuracy, 1); assert.equal(body.reconstruction.sequence.contiguous, true); });
await check("13 anomaly report surfaces incomplete runs", async () => { const response = await call("/v1/admin/anomalies", { admin: true }); const body = await response.json(); assert.ok(body.runsWithGapsOutOfOrderOrIncomplete.some(run => run.run_id === scenario("E").events[0].runId)); });
await check("14 CSV export excludes synthetic by default", async () => { const response = await call("/v1/admin/export.csv?buildId=managerial-directorate-telemetry-poc", { admin: true }); const text = await response.text(); assert.equal(response.status, 200); assert.equal(text.trim(), ""); });
await check("15 CSV export can include synthetic", async () => { const response = await call("/v1/admin/export.csv?buildId=managerial-directorate-telemetry-poc&includeSynthetic=1", { admin: true }); const text = await response.text(); assert.ok(text.includes("event_id") && text.includes(scenario("F").events[0].runId)); });
await check("16 synthetic cleanup removes QA rows", async () => { const response = await call("/v1/admin/cleanup", { method: "POST", admin: true, body: { scope: "synthetic", confirm: "DELETE" } }); const body = await response.json(); assert.equal(response.status, 200); assert.ok(body.deletedEvents >= 13); assert.equal(db.prepare("SELECT COUNT(*) AS count FROM telemetry_events").get().count, 0); });

const failed = results.filter(result => result.status === "FAIL");
const report = { phase: PHASE, generatedAt: new Date().toISOString(), status: failed.length ? "FAIL" : "PASS", passed: results.length - failed.length, failed: failed.length, total: results.length, synthetic: true, results };
fs.writeFileSync(path.join(outputDir, "backend_integration_results.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ phase: PHASE, status: report.status, passed: report.passed, failed: report.failed, total: report.total }, null, 2));
if (failed.length) { console.error(failed.map(item => `${item.name}: ${item.detail}`).join("\n")); process.exit(1); }
