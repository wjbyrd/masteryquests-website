// Run after the Wrangler dry-run documented in the service README.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pinnedPuzzle, SCHEMA, eventFields, transitionEvents } from '../../games/econnections/classroom-contract.js';
import { startRecord, submitGroup } from '../../games/econnections/engine.js';
const root = fileURLToPath(new URL('../../', import.meta.url));
const { Miniflare, convertV4MiniflareOptions } = createRequire(import.meta.url)(process.env.MINIFLARE_MODULE || path.join(root, 'tmp/econnections/tools/node_modules/miniflare'));
const adminToken = crypto.randomUUID() + crypto.randomUUID();
const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true, scriptPath: path.join(root, 'tmp/econnections/worker-build/worker.js'), compatibilityDate: '2026-09-19',
  d1Databases: { CLASSROOM_DB: 'classroom-test-only' },
  bindings: { ADMIN_TOKEN: adminToken, ALLOWED_ORIGINS: 'https://classroom.test', RETENTION_DAYS: '730' },
  ratelimits: {
    CLASSROOM_RATE: { namespace_id: '1101', simple: { limit: 120, period: 60 } },
    CLASSROOM_GLOBAL_RATE: { namespace_id: '1102', simple: { limit: 3000, period: 60 } },
  },
}));
try {
  const db = await mf.getD1Database('CLASSROOM_DB');
  const migrations = new URL('../../server/econnections-classroom/migrations/', import.meta.url);
  for (const file of (await readdir(migrations)).sort()) {
    const migration = await readFile(new URL(file, migrations), 'utf8');
    // Retain trigger-body semicolons while separating complete SQL statements.
    const statements = migration.replace(/^--.*$/gm, '').split(/;\s*(?=PRAGMA|CREATE|ALTER|$)/).map(x => x.trim()).filter(Boolean);
    for (const sql of statements) await db.prepare(sql).run();
  }
  const call = (route, data, admin = false, instructorToken) => mf.dispatchFetch('https://classroom.test/api/econnections-classroom' + route, {
    method: data === undefined ? 'GET' : 'POST', headers: { Origin: 'https://classroom.test', 'Content-Type': 'application/json', ...(admin || instructorToken ? { Authorization: 'Bearer ' + (admin ? adminToken : instructorToken) } : {}) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const provision = await call('/admin/classrooms', JSON.parse(await readFile(new URL('../../server/econnections-classroom/classroom.example.json', import.meta.url), 'utf8')), true);
  assert.equal(provision.status, 201);
  const course = await provision.json(), studentPath = course.studentPath, accessToken = new URL(studentPath, 'https://classroom.test').searchParams.get('classroom');
  const instructor = (action, data = {}) => call('/instructor/' + action, data, false, course.instructorToken);
  assert.equal((await call('/resolve', { accessToken })).status, 410);
  const future = await instructor('activate', { sessionDate: '2099-09-21', domain: 'micro', timeZone: 'America/Chicago', studentWindowStart: '12:40', walkthroughStart: '13:00', sessionClose: '13:30' });
  assert.equal(future.status, 200);
  const futureSession = (await future.json()).activeSession;
  const early = await call('/resolve', { accessToken });
  assert.equal(early.status, 403); assert.equal((await early.json()).code, 'session_not_open');
  const earlyStart = { eventID: crypto.randomUUID(), sessionID: futureSession.sessionID, runID: crypto.randomUUID(), playerID: crypto.randomUUID(), sequenceNumber: 1, schemaVersion: SCHEMA,
    ...eventFields('session_start', startRecord(pinnedPuzzle(futureSession))) };
  assert.equal((await call('/events', { accessToken, event: earlyStart })).status, 403);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM classroom_runs').first()).n, 0);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM classroom_events').first()).n, 0);
  await instructor('close', { sessionID: futureSession.sessionID });
  // Select a test timezone away from its last hour so the open fixture is stable.
  const clock = new Date(), timeZone = clock.getUTCHours() >= 23 ? 'Pacific/Honolulu' : 'Etc/UTC';
  const sessionDate = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(clock);
  const input = { sessionDate, domain: 'micro', timeZone, studentWindowStart: '00:00', walkthroughStart: '23:58', sessionClose: '23:59' };
  const competing = await Promise.all([instructor('activate', input), instructor('activate', input)]);
  assert.deepEqual(competing.map(r => r.status).sort(), [200, 409]);
  const created = await competing.find(r => r.status === 200).json(), session = created.activeSession;
  assert.equal(created.studentPath, studentPath); assert.notEqual(session.sessionID, futureSession.sessionID);
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
  const repeated = await instructor('activate', input); assert.equal(repeated.status, 200);
  assert.equal((await repeated.json()).studentPath, studentPath);
  assert.equal((await call('/events', { accessToken, event: events.at(-1) })).status, 200);
  console.log('PASS workerd + D1 + rate bindings: both migrations, classroom provisioning, early/no-session refusal, competing activations, same QR, full solve, retry, summary/CSV and close/reactivation');
} finally { await mf.dispose(); }
