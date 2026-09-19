import { SESSION_FIELDS, EVENT_FIELDS, TOKEN, validateSession, validateEvent, validatePath, exactKeys, requireValue } from '../../games/econnections/classroom-contract.js';
import { provisionCourse, instructorCourse, instructorView, currentSession, activate, closeSession, randomToken } from './courses.mjs';

const PREFIX = '/api/econnections-classroom';
const MAX_BODY = 8192;
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' } });
function fail(status, code) { throw Object.assign(new Error('Request rejected'), { status, code }); }
export async function digest(value) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), x => x.toString(16).padStart(2, '0')).join(''); }
function metadata(row) { return Object.fromEntries(SESSION_FIELDS.map(key => [key, row[key]])); }
export function accessState(session, now) {
  if (session.status === 'closed' || now >= session.sessionClose) return 'closed';
  // Server time gates access; walkthroughStart only classifies completions.
  return now < session.studentWindowStart ? 'upcoming' : 'open';
}
async function body(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) fail(415);
  if (Number(request.headers.get('content-length')) > MAX_BODY) fail(413);
  const reader = request.body?.getReader();
  if (!reader) fail(400);
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.length;
    if (size > MAX_BODY) { await reader.cancel(); fail(413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { fail(400); }
}
async function limit(binding, key) { if (!binding) fail(503); if (!(await binding.limit({ key })).success) fail(429); }
function storedEvent(row) { return { ...JSON.parse(row.payload), serverTimestamp: row.serverTimestamp }; }
export function csvCell(value) {
  let text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
  if (/^(?:\s*[=+@-]|[ \t\r\n]*[\t\r\n])/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function createWorker({ now = () => new Date().toISOString() } = {}) {
  return {
    async fetch(request, env) {
      let origin;
      try {
        const path = new URL(request.url).pathname;
        if (!path.startsWith(PREFIX + '/')) fail(404);
        if (!env.CLASSROOM_DB) fail(503);
        if (path.startsWith(PREFIX + '/admin/')) {
          if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 32) fail(503);
          const auth = request.headers.get('Authorization') || '';
          if (await digest(auth) !== await digest('Bearer ' + env.ADMIN_TOKEN)) fail(401);
          return await admin(request, env, path.slice(PREFIX.length), now());
        }
        origin = request.headers.get('Origin');
        if (!origin || !(env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).includes(origin)) { origin = null; fail(403); }
        if (!['/resolve', '/events', '/instructor/open', '/instructor/activate', '/instructor/close'].includes(path.slice(PREFIX.length))) fail(404);
        const headers = { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Cache-Control': 'no-store' };
        if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
        if (request.method !== 'POST') fail(405);
        await limit(env.CLASSROOM_GLOBAL_RATE, 'classroom');
        const input = await body(request);
        if (path.includes('/instructor/')) {
          await limit(env.CLASSROOM_RATE, 'instructor:' + await digest(request.headers.get('Authorization') || ''));
          const course = await instructorCourse(env.CLASSROOM_DB, request, digest), receipt = now();
          let view;
          if (path.endsWith('/open')) {
            try { exactKeys(input, []); } catch { fail(400); }
            view = await instructorView(env.CLASSROOM_DB, course, receipt);
          } else if (path.endsWith('/activate')) view = await activate(env.CLASSROOM_DB, course, input, receipt);
          else view = await closeSession(env.CLASSROOM_DB, course, input, receipt);
          const response = json(view);
          for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
          return response;
        }
        try { exactKeys(input, path.endsWith('/events') ? ['accessToken', 'event'] : ['accessToken']); requireValue(typeof input.accessToken === 'string' && TOKEN.test(input.accessToken)); } catch { fail(400); }
        const accessHash = await digest(input.accessToken);
        if (path.endsWith('/resolve')) await limit(env.CLASSROOM_RATE, 'resolve:' + accessHash);
        const course = await env.CLASSROOM_DB.prepare("SELECT * FROM classroom_courses WHERE studentToken=? AND status='active'").bind(input.accessToken).first();
        if (!course) fail(404);
        const receipt = now();
        if (path.endsWith('/events')) { try { validateEvent(input.event); } catch { fail(400); } }
        const row = path.endsWith('/resolve') ? await currentSession(env.CLASSROOM_DB, course, receipt)
          : await env.CLASSROOM_DB.prepare('SELECT * FROM classroom_sessions WHERE classroomID=? AND sessionID=?').bind(course.classroomID, input.event.sessionID).first();
        if (!row) fail(path.endsWith('/resolve') ? 410 : 404, path.endsWith('/resolve') ? 'no_active_session' : undefined);
        const session = metadata(row);
        try { validateSession(session); } catch { fail(503); }
        if (accessState(session, receipt) === 'upcoming') fail(403, 'session_not_open');
        let response;
        if (path.endsWith('/resolve')) {
          const status = accessState(session, receipt);
          if (status === 'closed') fail(410);
          response = json({ session: { ...session, status }, serverTimestamp: receipt });
        } else {
          try { validateEvent(input.event); requireValue(input.event.sessionID === session.sessionID); } catch { fail(400); }
          await limit(env.CLASSROOM_RATE, 'player:' + input.event.playerID);
          response = await ingest(env.CLASSROOM_DB, session, input.event, receipt);
        }
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
        return response;
      } catch (error) {
        const messages = { session_not_open: 'Classroom session is not open yet', no_active_session: 'No Econ-nections session is currently active for this class.',
          active_session_exists: 'A session is already active. End it before activating another.', invalid_window: 'Check the date, timezone and ordered session times.', retired_session_access: 'Per-session access has been retired. Provision a classroom instead.' };
        const response = json(messages[error.code]
          ? { ok: false, code: error.code, error: messages[error.code] }
          : { ok: false, error: 'Classroom request unavailable or rejected' }, error.status || 500);
        if (origin) { response.headers.set('Access-Control-Allow-Origin', origin); response.headers.set('Vary', 'Origin'); }
        return response;
      }
    },
    async scheduled(_controller, env) {
      const days = Number(env.RETENTION_DAYS);
      if (!Number.isInteger(days) || days < 1 || days > 730) throw new Error('Invalid retention configuration');
      const cutoff = new Date(Date.parse(now()) - days * 86400000).toISOString();
      // Delete whole expired sessions and cascade their paths; never truncate a run.
      await env.CLASSROOM_DB.prepare('DELETE FROM classroom_sessions WHERE sessionClose < ?').bind(cutoff).run();
    },
  };
}
async function ingest(db, session, event, receipt) {
  const payload = JSON.stringify(Object.fromEntries(EVENT_FIELDS.map(key => [key, event[key]])));
  const duplicate = async () => {
    const found = await db.prepare('SELECT payload, serverTimestamp FROM classroom_events WHERE eventID = ? OR (runID = ? AND sequenceNumber = ?)').bind(event.eventID, event.runID, event.sequenceNumber).all();
    if (!found.results.length) return null;
    if (found.results.length !== 1 || found.results[0].payload !== payload) fail(409);
    return json({ ok: true, eventID: event.eventID, serverTimestamp: found.results[0].serverTimestamp });
  };
  const existing = await duplicate(); if (existing) return existing;
  if (accessState(session, receipt) === 'closed') fail(410);
  const rows = await db.prepare('SELECT payload FROM classroom_events WHERE runID = ? ORDER BY sequenceNumber').bind(event.runID).all();
  try { validatePath(session, [...rows.results.map(row => JSON.parse(row.payload)), event]); } catch { fail(409); }
  const statements = [];
  if (event.sequenceNumber === 1) statements.push(db.prepare('INSERT INTO classroom_runs(runID, sessionID, playerID) VALUES(?, ?, ?)').bind(event.runID, session.sessionID, event.playerID));
  statements.push(db.prepare(`INSERT INTO classroom_events(eventID, sessionID, runID, playerID, sequenceNumber, eventType, serverTimestamp, elapsedMs, selectedTileIds, correct, oneAway, groupID, groupsSolvedCount, schemaVersion, payload) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(event.eventID, event.sessionID, event.runID, event.playerID, event.sequenceNumber, event.eventType, receipt, event.elapsedMs, JSON.stringify(event.selectedTileIds), event.correct === null ? null : Number(event.correct), Number(event.oneAway), event.groupID, event.groupsSolvedCount, event.schemaVersion, payload));
  try { await db.batch(statements); }
  catch { const retry = await duplicate(); if (retry) return retry; fail(409); }
  return json({ ok: true, eventID: event.eventID, serverTimestamp: receipt });
}
async function admin(request, env, path, receipt) {
  const db = env.CLASSROOM_DB, url = new URL(request.url);
  if (path === '/admin/classrooms' && request.method === 'POST') return json(await provisionCourse(db, await body(request), receipt, digest), 201);
  if (path === '/admin/classrooms/rotate-instructor' && request.method === 'POST') {
    const input = await body(request);
    try { exactKeys(input, ['classroomID']); requireValue(typeof input.classroomID === 'string'); } catch { fail(400); }
    const instructorToken = randomToken();
    const row = await db.prepare('UPDATE classroom_courses SET instructorHash=? WHERE classroomID=? RETURNING classroomID').bind(await digest(instructorToken), input.classroomID).first();
    if (!row) fail(404);
    return json({ classroomID: row.classroomID, instructorToken });
  }
  if (path === '/admin/classrooms/status' && request.method === 'POST') {
    const input = await body(request);
    try { exactKeys(input, ['classroomID', 'status']); requireValue(typeof input.classroomID === 'string' && ['active', 'disabled'].includes(input.status)); } catch { fail(400); }
    const row = await db.prepare('UPDATE classroom_courses SET status=? WHERE classroomID=? RETURNING classroomID').bind(input.status, input.classroomID).first();
    if (!row) fail(404);
    return json({ ok: true, classroomID: row.classroomID, status: input.status });
  }
  if (path === '/admin/close' && request.method === 'POST') {
    const input = await body(request);
    try { exactKeys(input, ['sessionID']); requireValue(typeof input.sessionID === 'string'); } catch { fail(400); }
    const row = await db.prepare('UPDATE classroom_sessions SET status = ? WHERE sessionID = ? RETURNING sessionID').bind('closed', input.sessionID).first();
    if (!row) fail(404);
    return json({ ok: true, sessionID: row.sessionID, status: 'closed' });
  }
  if (path === '/admin/sessions' && request.method === 'POST') {
    fail(410, 'retired_session_access');
  }
  if (request.method !== 'GET') fail(405);
  if (path === '/admin/run') {
    const rows = await db.prepare('SELECT payload, serverTimestamp FROM classroom_events WHERE runID = ? ORDER BY sequenceNumber').bind(url.searchParams.get('runID') || '').all();
    if (!rows.results.length) fail(404);
    const events = rows.results.map(storedEvent);
    const row = await db.prepare('SELECT * FROM classroom_sessions WHERE sessionID = ?').bind(events[0].sessionID).first();
    return json({ session: metadata(row), events });
  }
  if (!['/admin/session', '/admin/export'].includes(path)) fail(404);
  const row = await db.prepare('SELECT * FROM classroom_sessions WHERE sessionID = ?').bind(url.searchParams.get('sessionID') || '').first();
  if (!row) fail(404);
  const session = metadata(row);
  if (path === '/admin/export') {
    // A stable rowid cursor bounds each export to 1000 rows. Empty nextCursor ends export.
    const after = Number(url.searchParams.get('after') || 0);
    if (!Number.isSafeInteger(after) || after < 0) fail(400);
    const rows = await db.prepare('SELECT rowid, payload, serverTimestamp FROM classroom_events WHERE sessionID = ? AND rowid > ? ORDER BY rowid LIMIT 1001').bind(session.sessionID, after).all();
    const page = rows.results.slice(0, 1000), fields = [...EVENT_FIELDS, 'serverTimestamp', 'puzzleID', 'puzzleVersion', 'preWalkthrough'];
    const content = [fields.map(csvCell).join(','), ...page.map(row => {
      const event = storedEvent(row);
      return fields.map(key => csvCell(key === 'preWalkthrough' ? (event.eventType === 'puzzle_complete' ? event.serverTimestamp < session.walkthroughStart : '') : event[key] ?? session[key])).join(',');
    })].join('\r\n');
    return new Response(content, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment; filename="classroom-events.csv"', 'X-Next-Cursor': rows.results.length > 1000 ? String(page.at(-1).rowid) : '', 'X-Content-Type-Options': 'nosniff' } });
  }
  const summary = await db.prepare(`SELECT COUNT(DISTINCT CASE WHEN eventType='session_start' THEN runID END) AS runsStarted,
    SUM(eventType='puzzle_complete') AS completed, SUM(eventType='puzzle_complete' AND correct=1) AS solved,
    SUM(eventType='puzzle_complete' AND correct=0) AS completedNotSolved,
    SUM(eventType='puzzle_complete' AND serverTimestamp < ?) AS completedBeforeWalkthrough,
    SUM(eventType='puzzle_complete' AND serverTimestamp >= ?) AS completedAtOrAfterWalkthrough,
    SUM(eventType='group_attempt') AS groupAttempts, SUM(eventType='group_attempt' AND oneAway=1) AS nearMisses,
    AVG(CASE WHEN eventType='puzzle_complete' THEN elapsedMs END) AS meanCompletionElapsedMs
    FROM classroom_events WHERE sessionID=?`).bind(session.walkthroughStart, session.walkthroughStart, session.sessionID).first();
  const runRows = await db.prepare('SELECT runID, playerID FROM classroom_runs WHERE sessionID = ? AND runID > ? ORDER BY runID LIMIT 101').bind(session.sessionID, url.searchParams.get('afterRun') || '').all();
  const runs = runRows.results.slice(0, 100);
  const solved = runs.length ? (await db.prepare(`SELECT runID, groupID, sequenceNumber, elapsedMs, serverTimestamp FROM classroom_events WHERE eventType='group_solved' AND runID IN (${runs.map(() => '?').join(',')}) ORDER BY runID, sequenceNumber`).bind(...runs.map(r => r.runID)).all()).results : [];
  for (const key of Object.keys(summary)) if (key !== 'meanCompletionElapsedMs') summary[key] ??= 0;
  return json({ session: { ...session, status: accessState(session, receipt) }, summary,
    runs: runs.map(run => ({ ...run, groupSolveOrder: solved.filter(e => e.runID === run.runID).map(({ runID, ...event }) => event) })),
    nextRunCursor: runRows.results.length > 100 ? runs.at(-1).runID : null });
}
export default createWorker();
