import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { harness, ORIGIN } from './classroom-harness.mjs';
import { SCHEMA, eventFields, transitionEvents, pinnedPuzzle, validatePath, validateSession, EVENT_FIELDS } from '../../games/econnections/classroom-contract.js';
import { startRecord, submitGroup } from '../../games/econnections/engine.js';
import { zonedInstant } from '../../server/econnections-classroom/session-tools.mjs';
import { csvCell, accessState } from '../../server/econnections-classroom/worker.mjs';

function pathFor(session, win = true) {
  const puzzle = pinnedPuzzle(session), runID = crypto.randomUUID(), playerID = crypto.randomUUID();
  let record = startRecord(puzzle), events = [];
  const add = fields => fields.forEach(e => events.push({ eventID: crypto.randomUUID(), sessionID: session.sessionID, runID, playerID, sequenceNumber: events.length + 1, schemaVersion: SCHEMA, ...e }));
  add([eventFields('session_start', record)]);
  const groups = puzzle.groups.map(g => puzzle.tiles.filter(t => t.groupId === g.id).map(t => t.id));
  const attempts = win ? groups : [[...groups[0].slice(0, 3), groups[1][0]], [...groups[0].slice(0, 3), groups[1][0]], [groups[0][0], groups[0][1], groups[1][0], groups[1][1]], [groups[0][0], groups[1][0], groups[2][0], groups[3][0]]];
  for (const ids of attempts) {
    record.elapsedTimeMs += 1000;
    const result = submitGroup(puzzle, record, [...ids].reverse()); record = result.record;
    add(transitionEvents(puzzle, result, [...ids].reverse()));
  }
  return events;
}
async function send(h, fixture, event) { return h.call('/events', { accessToken: fixture.accessToken, event }); }

test('server access window rejects early starts and enforces exact opening/closing boundaries', async () => {
  for (const [stamp, status] of [
    ['2026-09-21T17:39:59.999Z', 403],
    ['2026-09-21T17:40:00.000Z', 200],
    ['2026-09-21T17:59:59.999Z', 200],
    ['2026-09-21T18:00:00.000Z', 200],
    ['2026-09-21T18:10:00.000Z', 200],
    ['2026-09-21T18:29:59.999Z', 200],
    ['2026-09-21T18:30:00.000Z', 410],
    ['2026-09-21T18:30:00.001Z', 410],
  ]) {
    const h = harness(), f = await h.session(), events = pathFor(f.session);
    h.setTime(stamp);
    const response = await h.call('/resolve', { accessToken: f.accessToken });
    assert.equal(response.status, status, stamp);
    if (status === 403) {
      assert.deepEqual(await response.json(), { ok: false, code: 'session_not_open', error: 'Classroom session is not open yet' });
      assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    for (const event of status === 200 ? events : events.slice(0, 2)) assert.equal((await send(h, f, event)).status, status, stamp);
    assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_runs').get().n, status === 200 ? 1 : 0);
    assert.equal(h.sqlite.prepare("SELECT COUNT(*) AS n FROM classroom_events WHERE eventType='session_start'").get().n, status === 200 ? 1 : 0);
    if (status !== 200) assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_events').get().n, 0);
    else {
      const { summary } = await (await h.call('/admin/session?sessionID=' + f.session.sessionID, undefined, { admin: true })).json();
      assert.equal(summary.completedBeforeWalkthrough, stamp < f.session.walkthroughStart ? 1 : 0);
      assert.equal(summary.completedAtOrAfterWalkthrough, stamp >= f.session.walkthroughStart ? 1 : 0);
    }
  }
});

test('isolated schema, exact engine replay, ordered wins and duplicate-containing third-strike losses', async () => {
  const h = harness(), f = await h.session();
  for (const win of [true, false]) {
    const events = pathFor(f.session, win);
    const record = validatePath(f.session, events);
    assert.equal(record.solved, win); assert.equal(record.completed, true);
    assert.equal(record.strikesUsed, win ? 0 : 3);
    for (const event of events) {
      assert.deepEqual(Object.keys(event).sort(), [...EVENT_FIELDS].sort());
      assert.deepEqual(event.selectedTileIds, [...event.selectedTileIds].sort());
      assert.equal((await send(h, f, event)).status, 200);
    }
    const response = await h.call('/admin/run?runID=' + events[0].runID, undefined, { admin: true });
    const stored = (await response.json()).events;
    assert.deepEqual(stored.map(e => e.sequenceNumber), events.map(e => e.sequenceNumber));
    assert.equal(stored.filter(e => e.eventType === 'puzzle_complete').length, 1);
    if (!win) { assert.equal(stored.filter(e => e.oneAway).length, 2); assert.equal(stored.filter(e => e.eventType === 'group_attempt').length, 4); }
  }
  const tables = h.sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x => x.name);
  assert.deepEqual(tables, ['classroom_sessions', 'classroom_runs', 'classroom_events']);
});
test('idempotency returns original receipt even after close; conflicts and sequence gaps fail', async () => {
  const h = harness(), f = await h.session(), events = pathFor(f.session);
  assert.equal((await send(h, f, events[1])).status, 409);
  const first = await (await send(h, f, events[0])).json();
  h.setTime('2026-09-21T18:30:00.000Z');
  assert.deepEqual(await (await send(h, f, events[0])).json(), first);
  assert.equal((await send(h, f, { ...events[0], eventID: crypto.randomUUID() })).status, 409);
  assert.equal((await send(h, f, events[1])).status, 410);
  assert.equal((await h.call('/resolve', { accessToken: f.accessToken })).status, 410);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_events').get().n, 1);
});
test('server cutoff is strict, independent of active elapsed time, with equality counted late', async () => {
  const h = harness(), f = await h.session();
  for (const stamp of ['2026-09-21T17:59:59.999Z', '2026-09-21T18:00:00.000Z', '2026-09-21T18:10:00.000Z']) {
    h.setTime(stamp);
    for (const event of pathFor(f.session)) assert.equal((await send(h, f, event)).status, 200);
  }
  const response = await h.call('/admin/session?sessionID=' + f.session.sessionID, undefined, { admin: true });
  const { summary, runs } = await response.json();
  assert.equal(summary.runsStarted, 3); assert.equal(summary.solved, 3); assert.equal(summary.completedBeforeWalkthrough, 1); assert.equal(summary.completedAtOrAfterWalkthrough, 2);
  assert.equal(summary.meanCompletionElapsedMs, 4000);
  assert.equal(runs.length, 3); assert.ok(runs.every(run => run.groupSolveOrder.length === 4));
  assert.deepEqual(runs[0].groupSolveOrder.map(e => e.sequenceNumber), [3, 5, 7, 9]);
});
test('concurrent exact retries are idempotent and conflicting writers cannot fork a sequence', async () => {
  const h = harness(), f = await h.session(), events = pathFor(f.session);
  const same = await Promise.all([send(h, f, events[0]), send(h, f, events[0])]);
  assert.deepEqual(same.map(r => r.status), [200, 200]);
  const conflict = await Promise.all([send(h, f, events[1]), send(h, f, { ...events[1], eventID: crypto.randomUUID() })]);
  assert.deepEqual(conflict.map(r => r.status).sort(), [200, 409]);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_events').get().n, 2);
});
test('manual close disables resolution and new events without changing existing receipts', async () => {
  const h = harness(), f = await h.session(), events = pathFor(f.session);
  const first = await (await send(h, f, events[0])).json();
  assert.equal((await h.call('/admin/close', { sessionID: f.session.sessionID }, { admin: true })).status, 200);
  assert.equal((await h.call('/resolve', { accessToken: f.accessToken })).status, 410);
  assert.equal((await send(h, f, events[1])).status, 410);
  assert.deepEqual(await (await send(h, f, events[0])).json(), first);
});
test('allowlists, identity, origin, credentials, body size, rate limits and safe errors fail closed', async () => {
  const h = harness(), f = await h.session(), event = pathFor(f.session)[0];
  for (const extra of ['serverTimestamp', 'email', 'name', 'userAgent', 'url', 'threePlusOne']) assert.equal((await send(h, f, { ...event, [extra]: 'forbidden' })).status, 400);
  assert.equal((await send(h, f, { ...event, runID: 'bad' })).status, 400);
  assert.equal((await h.call('/events', { accessToken: f.accessToken, event }, { headers: { Origin: 'https://evil.test' } })).status, 403);
  assert.equal((await h.call('/events', { accessToken: f.accessToken, event }, { headers: { Origin: '' } })).status, 403);
  assert.equal((await h.call('/resolve', { accessToken: 'x'.repeat(43) })).status, 404);
  assert.equal((await h.call('/resolve', { accessToken: f.session.sessionID })).status, 400);
  assert.equal((await h.call('/resolve', '{}'.repeat(5000))).status, 413);
  assert.equal((await h.call('/resolve', 'not json')).status, 400);
  const unauthorized = await h.call('/admin/session?sessionID=' + f.session.sessionID);
  assert.equal(unauthorized.status, 401); assert.equal(unauthorized.headers.get('cache-control'), 'no-store');
  h.env.CLASSROOM_RATE = { limit: async () => ({ success: false }) };
  assert.equal((await send(h, f, event)).status, 429);
  delete h.env.CLASSROOM_RATE;
  assert.equal((await send(h, f, event)).status, 503);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_events').get().n, 0);
});
test('forged outcomes, unsorted tiles, changed player, redundant solves and second runs are rejected', async () => {
  const h = harness(), f = await h.session(), events = pathFor(f.session);
  assert.equal((await send(h, f, events[0])).status, 200);
  for (const patch of [{ correct: false }, { oneAway: true }, { selectedTileIds: [...events[1].selectedTileIds].reverse() }, { playerID: crypto.randomUUID() }, { groupsSolvedCount: 4 }]) assert.equal((await send(h, f, { ...events[1], ...patch })).status, 409);
  assert.equal((await send(h, f, { ...events[0], eventID: crypto.randomUUID(), runID: crypto.randomUUID() })).status, 409);
  for (const event of events.slice(1)) assert.equal((await send(h, f, event)).status, 200);
  assert.equal((await send(h, f, { ...events.at(-1), sequenceNumber: events.length + 1, eventID: crypto.randomUUID() })).status, 409);
});
test('IANA timezone conversion follows Chicago DST and rejects invalid/ambiguous wall times', async () => {
  assert.equal(zonedInstant('2026-09-21T13:00', 'America/Chicago'), '2026-09-21T18:00:00.000Z');
  assert.equal(zonedInstant('2026-01-19T13:00', 'America/Chicago'), '2026-01-19T19:00:00.000Z');
  assert.throws(() => zonedInstant('2026-03-08T02:30', 'America/Chicago'));
  assert.throws(() => zonedInstant('2026-11-01T01:30', 'America/Chicago'));
  const h = harness(), f = await h.session();
  assert.throws(() => validateSession({ ...f.session, timeZone: 'CST' }));
  assert.throws(() => validateSession({ ...f.session, puzzleVersion: '1' }));
  assert.equal(accessState(f.session, '2026-09-21T16:00:00.000Z'), 'upcoming');
  assert.equal(accessState(f.session, '2026-09-21T17:45:00.000Z'), 'open');
  h.setTime('2026-09-21T16:00:00.000Z');
  assert.equal((await h.call('/resolve', { accessToken: f.accessToken })).status, 403);
});
test('spreadsheet-safe export retains raw IDs and paginates; retention removes whole sessions', async () => {
  const h = harness(), f = await h.session();
  for (const e of pathFor(f.session)) await send(h, f, e);
  for (const value of ['=1+1', '+x', '-x', '@x', '\tfoo', '  =X']) assert.ok(csvCell(value).startsWith('"\''));
  assert.equal(csvCell('a"b'), '"a""b"');
  const response = await h.call('/admin/export?sessionID=' + f.session.sessionID, undefined, { admin: true });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const csv = await response.text(); assert.match(csv, /preWalkthrough/); assert.match(csv, /econnections:2:2026-09-21:micro/); assert.equal(csv.split('\r\n').length, 11);
  const empty = await h.call('/admin/export?sessionID=' + f.session.sessionID + '&after=1000', undefined, { admin: true });
  assert.equal((await empty.text()).split('\r\n').length, 1);
  const config = JSON.parse(readFileSync(new URL('../../server/econnections-classroom/wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.vars.RETENTION_DAYS, '730'); assert.equal(h.env.RETENTION_DAYS, '730');
  for (const days of ['0', '731', '1.5', 'invalid']) await assert.rejects(h.worker.scheduled({}, { ...h.env, RETENTION_DAYS: days }), /Invalid retention/);
  const expiration = Date.parse(f.session.sessionClose) + 730 * 86400000;
  for (const stamp of ['2027-01-01T00:00:00.000Z', new Date(expiration).toISOString()]) {
    h.setTime(stamp); await h.worker.scheduled({}, h.env);
    assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_events').get().n, 10);
    assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_runs').get().n, 1);
    assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_sessions').get().n, 1);
  }
  h.setTime(new Date(expiration + 1).toISOString()); await h.worker.scheduled({}, h.env);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_events').get().n, 0);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_runs').get().n, 0);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_sessions').get().n, 0);
});
test('session and CSV cursors traverse complete multi-page results without truncation or duplicates', async () => {
  const h = harness(), f = await h.session();
  for (let i = 0; i < 101; i++) for (const event of pathFor(f.session)) assert.equal((await send(h, f, event)).status, 200);
  const first = await (await h.call('/admin/session?sessionID=' + f.session.sessionID, undefined, { admin: true })).json();
  const second = await (await h.call('/admin/session?sessionID=' + f.session.sessionID + '&afterRun=' + first.nextRunCursor, undefined, { admin: true })).json();
  assert.equal(first.summary.solved, 101); assert.equal(first.runs.length, 100); assert.equal(second.runs.length, 1); assert.equal(second.nextRunCursor, null);
  assert.equal(new Set([...first.runs, ...second.runs].map(r => r.runID)).size, 101);
  const csv1 = await h.call('/admin/export?sessionID=' + f.session.sessionID, undefined, { admin: true });
  assert.equal((await csv1.text()).split('\r\n').length, 1001);
  const csv2 = await h.call('/admin/export?sessionID=' + f.session.sessionID + '&after=' + csv1.headers.get('x-next-cursor'), undefined, { admin: true });
  assert.equal((await csv2.text()).split('\r\n').length, 11); assert.equal(csv2.headers.get('x-next-cursor'), '');
});
