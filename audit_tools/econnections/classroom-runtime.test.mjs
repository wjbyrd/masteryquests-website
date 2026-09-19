// Run after the Wrangler dry-run documented in the service README.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareSession } from '../../server/econnections-classroom/session-tools.mjs';
import { pinnedPuzzle, SCHEMA, eventFields, transitionEvents } from '../../games/econnections/classroom-contract.js';
import { startRecord, submitGroup } from '../../games/econnections/engine.js';
const root = fileURLToPath(new URL('../../', import.meta.url));
const { Miniflare, convertV4MiniflareOptions } = createRequire(import.meta.url)(process.env.MINIFLARE_MODULE || path.join(root, 'tmp/econnections/tools/node_modules/miniflare'));
const adminToken = crypto.randomUUID() + crypto.randomUUID();
const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true, scriptPath: path.join(root, 'tmp/econnections/worker-build/worker.js'), compatibilityDate: '2026-09-19',
  d1Databases: { CLASSROOM_DB: 'classroom-test-only' },
  bindings: { ADMIN_TOKEN: adminToken, ALLOWED_ORIGINS: 'https://classroom.test', RETENTION_DAYS: '90' },
  ratelimits: {
    CLASSROOM_RATE: { namespace_id: '1101', simple: { limit: 120, period: 60 } },
    CLASSROOM_GLOBAL_RATE: { namespace_id: '1102', simple: { limit: 3000, period: 60 } },
  },
}));
try {
  const db = await mf.getD1Database('CLASSROOM_DB');
  const migration = await readFile(new URL('../../server/econnections-classroom/migrations/0001_classroom.sql', import.meta.url), 'utf8');
  // D1 exec uses newline-delimited statements; retain trigger-body semicolons.
  const statements = migration.replace(/^--.*$/gm, '').split(/;\s*(?=PRAGMA|CREATE|$)/).map(x => x.trim()).filter(Boolean);
  for (const sql of statements) await db.prepare(sql).run();
  const call = (route, data, admin = false) => mf.dispatchFetch('https://classroom.test/api/econnections-classroom' + route, {
    method: data === undefined ? 'GET' : 'POST', headers: { Origin: 'https://classroom.test', 'Content-Type': 'application/json', ...(admin ? { Authorization: 'Bearer ' + adminToken } : {}) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const wall = JSON.parse(await readFile(new URL('../../server/econnections-classroom/session.example.json', import.meta.url), 'utf8'));
  for (const key of ['sessionDate', 'scheduledClassTime', 'studentWindowStart', 'walkthroughStart', 'sessionClose']) wall[key] = wall[key].replace('2026', '2099');
  const creation = await call('/admin/sessions', prepareSession(wall), true);
  assert.equal(creation.status, 201);
  const { session, studentPath } = await creation.json(), accessToken = new URL(studentPath, 'https://classroom.test').searchParams.get('classroom');
  assert.equal((await call('/resolve', { accessToken })).status, 200);
  const puzzle = pinnedPuzzle(session), runID = crypto.randomUUID(), playerID = crypto.randomUUID();
  let record = startRecord(puzzle), events = [];
  const append = fields => { for (const field of fields) events.push({ eventID: crypto.randomUUID(), sessionID: session.sessionID, runID, playerID, sequenceNumber: events.length + 1, schemaVersion: SCHEMA, ...field }); };
  append([eventFields('session_start', record)]);
  for (const group of puzzle.groups) {
    const ids = puzzle.tiles.filter(t => t.groupId === group.id).map(t => t.id);
    record.elapsedTimeMs += 1000;
    const result = submitGroup(puzzle, record, ids); record = result.record;
    append(transitionEvents(puzzle, result, ids));
  }
  for (const event of events) assert.equal((await call('/events', { accessToken, event })).status, 200);
  const retry = await call('/events', { accessToken, event: events.at(-1) }); assert.equal(retry.status, 200);
  const response = await call('/admin/session?sessionID=' + session.sessionID, undefined, true);
  const data = await response.json(); assert.equal(data.summary.runsStarted, 1); assert.equal(data.summary.solved, 1); assert.equal(data.runs[0].groupSolveOrder.length, 4);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM classroom_events').first()).n, 10);
  const exported = await call('/admin/export?sessionID=' + session.sessionID, undefined, true);
  assert.equal(exported.status, 200); assert.match(await exported.text(), /preWalkthrough/);
  await call('/admin/close', { sessionID: session.sessionID }, true);
  assert.equal((await call('/resolve', { accessToken })).status, 410);
  console.log('PASS workerd + D1 + rate bindings: migration, creation, resolution, full solve, retry, summary/solve order, CSV and close');
} finally { await mf.dispose(); }
