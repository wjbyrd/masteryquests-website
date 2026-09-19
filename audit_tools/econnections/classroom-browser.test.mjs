import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { harness } from './classroom-harness.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(process.env.ECON_SITE_ROOT || fileURLToPath(new URL('../../', import.meta.url)));
const h = harness(), fixture = await h.session(), puzzleID = fixture.session.puzzleID;
const requests = [], errors = [];
let outage = false, loseAcknowledgment = false;
const server = createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/econnections-classroom/')) {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString();
      requests.push({ path: req.url, body: JSON.parse(body) });
      if (outage) { res.writeHead(503, { 'Content-Type': 'application/json' }).end('{}'); return; }
      const response = await h.worker.fetch(new Request(origin + req.url, { method: req.method, headers: req.headers, body }), h.env);
      if (loseAcknowledgment && req.url.endsWith('/events') && response.ok) { loseAcknowledgment = false; res.writeHead(503, { 'Content-Type': 'application/json' }).end('{}'); return; }
      res.writeHead(response.status, Object.fromEntries(response.headers)).end(await response.text()); return;
    }
    let file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(await readFile(file));
  } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500).end(); if (error.code !== 'ENOENT') errors.push(error.message); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
h.env.ALLOWED_ORIGINS = origin;
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : { channel: process.env.BROWSER_CHANNEL || 'chrome' }) });
const passed = [];
const check = label => { passed.push(label); console.log('PASS ' + label); };
const count = type => h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_events WHERE eventType=?').get(type).n;
const eventually = async fn => { for (let i = 0; i < 100; i++) { if (await fn()) return; await new Promise(resolve => setTimeout(resolve, 50)); } assert.fail('Timed out awaiting event persistence'); };
const choose = async (page, ids) => { if (await page.locator('#deselect').isEnabled()) await page.locator('#deselect').click(); for (const id of ids) await page.locator(`[data-tile-id="${id}"]`).click(); await page.locator('#submit').click(); };
try {
  const context = await browser.newContext({ timezoneId: 'Asia/Tokyo' });
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.clock.install({ time: new Date('2026-09-21T12:00:00Z') });
  await page.goto(origin + '/games/econnections/');
  await page.locator('[data-domain="micro"]').click();
  const puzzle = await page.evaluate(async () => (await import('/games/econnections/engine.js')).createPuzzle('micro', '2026-09-21'));
  const ids = puzzle.groups.map(g => puzzle.tiles.filter(t => t.groupId === g.id).map(t => t.id));
  for (const group of ids) await choose(page, group);
  const publicKey = 'mq.econnections.result.' + puzzleID;
  const publicRecord = await page.evaluate(key => localStorage.getItem(key), publicKey);
  assert.equal(JSON.parse(publicRecord).solved, true); assert.equal(requests.length, 0);
  check('ordinary daily play, including a full solve, makes zero classroom API requests');

  h.setTime('2026-09-21T17:39:59.999Z');
  await page.goto(origin + fixture.studentPath);
  await page.locator('#classroom-notice').filter({ hasText: 'not open yet' }).waitFor();
  assert.equal(await page.locator('.tile').count(), 0);
  assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('mq.econnections.classroom.')).length), 0);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_runs').get().n, 0);
  assert.equal(count('session_start'), 0);
  assert.equal(requests.filter(r => r.path.endsWith('/events')).length, 0);
  assert.equal(await page.evaluate(key => localStorage.getItem(key), publicKey), publicRecord);
  check('before opening, a valid private link creates no progress, browser ID, run or events');
  h.setTime(fixture.session.studentWindowStart);
  await page.goto(origin + fixture.studentPath); await page.locator('.tile').first().waitFor();
  await eventually(() => count('session_start') === 1);
  assert.equal(await page.locator('.tile').count(), 16);
  const key = 'mq.econnections.classroom.v1.run.' + fixture.session.sessionID;
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  assert.equal(saved.record.puzzleId, puzzleID); assert.equal(saved.record.completed, false);
  assert.notEqual(saved.playerID, saved.runID);
  assert.equal(saved.playerID, await page.evaluate(() => localStorage.getItem('mq.econnections.classroom.v1.player')));
  check('valid session pins exact puzzle with separate progress, player UUID, run UUID and one start');

  const cached = await page.evaluate(key => localStorage.getItem(key), key);
  h.setTime('2026-09-21T17:39:59.999Z');
  await page.reload();
  await page.locator('#classroom-notice').filter({ hasText: 'not open yet' }).waitFor();
  assert.equal(await page.locator('.tile').count(), 0);
  assert.equal(count('session_start'), 1);
  assert.equal(requests.filter(r => r.path.endsWith('/events')).length, 1);
  // No new document writes to the cached run after an authoritative refusal.
  const refusedCache = await page.evaluate(key => localStorage.getItem(key), key);
  assert.equal(JSON.parse(refusedCache).runID, JSON.parse(cached).runID);
  await page.clock.runFor(6000);
  assert.equal(await page.evaluate(key => localStorage.getItem(key), key), refusedCache);
  h.setTime(fixture.session.studentWindowStart);
  await page.reload(); await page.locator('.tile').first().waitFor();
  assert.equal(count('session_start'), 1);
  check('cached progress cannot bypass an early-access refusal; the same run resumes when open');

  const other = await context.newPage();
  await other.goto(origin + fixture.studentPath);
  await other.locator('#classroom-notice').filter({ hasText: 'already open in another tab' }).waitFor();
  assert.equal(await other.locator('.tile').count(), 0); assert.equal(count('session_start'), 1);
  check('second classroom tab cannot overwrite the active writer or allocate event sequences');
  await other.close();

  const near = [...ids[0].slice(0, 3), ids[1][0]];
  await choose(page, [...near].reverse()); await page.locator('#submit').click();
  assert.match(await page.locator('#feedback').innerText(), /No extra strike.*1 away/);
  assert.match(await page.locator('#attempts').innerText(), /2 strikes remaining/);
  await eventually(() => count('group_attempt') === 2);
  const attempts = h.sqlite.prepare("SELECT payload FROM classroom_events WHERE eventType='group_attempt' ORDER BY sequenceNumber").all().map(x => JSON.parse(x.payload));
  assert.deepEqual(attempts[0].selectedTileIds, [...near].sort());
  assert.equal(attempts[0].correct, false); assert.equal(attempts[0].oneAway, true);
  assert.deepEqual(attempts[0].selectedTileIds, attempts[1].selectedTileIds);
  check('duplicate wrong sets emit two sorted stable-ID attempts while consuming only one strike');

  await choose(page, ids[0]); await eventually(() => count('group_solved') === 1);
  let solved = JSON.parse(h.sqlite.prepare("SELECT payload FROM classroom_events WHERE eventType='group_solved'").get().payload);
  assert.equal(solved.groupID, puzzle.groups[0].id); assert.equal(solved.groupsSolvedCount, 1);
  await page.reload(); await page.locator('.tile').first().waitFor();
  assert.equal(await page.locator('.tile').count(), 12); assert.equal(count('session_start'), 1);
  const reloaded = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  assert.equal(reloaded.runID, saved.runID); assert.equal(reloaded.playerID, saved.playerID);
  assert.ok(reloaded.sequence > saved.sequence);
  await page.clock.setSystemTime(new Date('2026-09-23T20:00:00Z')); await page.clock.runFor(6000);
  assert.equal(await page.locator('#puzzle-date').innerText(), 'Sep 21, 2026');
  for (const group of ids.slice(1)) await choose(page, group);
  await eventually(() => count('puzzle_complete') === 1);
  assert.equal(await page.locator('#result-title').innerText(), 'Four Econ-nections. Nicely done.');
  assert.equal(await page.evaluate(key => localStorage.getItem(key), publicKey), publicRecord);
  const completed = JSON.parse(h.sqlite.prepare("SELECT payload FROM classroom_events WHERE eventType='puzzle_complete'").get().payload);
  assert.equal(completed.correct, true); assert.equal(completed.groupsSolvedCount, 4);
  await page.reload(); await page.locator('#results').waitFor(); assert.equal(count('puzzle_complete'), 1);
  check('correct solves, reload sequence continuity, midnight pinning, single completion and byte-identical public history');

  const lossContext = await browser.newContext(), loss = await lossContext.newPage();
  await loss.goto(origin + fixture.studentPath); await loss.locator('.tile').first().waitFor();
  await choose(loss, near);
  await choose(loss, [ids[0][0], ids[0][1], ids[1][0], ids[1][1]]);
  await choose(loss, [ids[0][0], ids[1][0], ids[2][0], ids[3][0]]);
  await eventually(() => count('puzzle_complete') === 2);
  assert.equal(await loss.locator('#result-title').innerText(), 'Completed, not solved.');
  const lost = JSON.parse(h.sqlite.prepare("SELECT payload FROM classroom_events WHERE eventType='puzzle_complete' ORDER BY rowid DESC LIMIT 1").get().payload);
  assert.equal(lost.correct, false); assert.equal(lost.groupsSolvedCount, 0);
  await loss.reload(); await loss.locator('#results').waitFor(); assert.equal(count('puzzle_complete'), 2);
  check('third-strike completion stays distinct from a solve and is not emitted again on reload');

  const nextFixture = await h.session();
  await page.goto(origin + nextFixture.studentPath); await page.locator('.tile').first().waitFor();
  const nextKey = 'mq.econnections.classroom.v1.run.' + nextFixture.session.sessionID;
  const next = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), nextKey);
  assert.equal(next.playerID, saved.playerID); assert.notEqual(next.runID, saved.runID);
  await eventually(() => count('session_start') === 3);
  outage = true;
  await choose(page, ids[0]); await page.clock.runFor(12000);
  // Clock controls timers, while actual failed fetches settle in the event loop.
  await eventually(() => requests.filter(r => r.path.endsWith('/events') && r.body.event.runID === next.runID && r.body.event.sequenceNumber === 2).length >= 1);
  for (let i = 0; i < 4; i++) { await page.clock.runFor(5000); await new Promise(r => setTimeout(r, 80)); }
  const failures = requests.filter(r => r.path.endsWith('/events') && r.body.event.runID === next.runID && r.body.event.sequenceNumber === 2);
  assert.equal(failures.length, 3);
  assert.equal(await page.locator('.tile').count(), 12);
  const beforeOfflineReload = requests.filter(r => r.path.endsWith('/events')).length;
  await page.reload(); await page.locator('.tile').first().waitFor();
  assert.equal(await page.locator('.tile').count(), 12);
  await choose(page, ids[1]);
  assert.equal(requests.filter(r => r.path.endsWith('/events')).length, beforeOfflineReload);
  check('persistent player spans sessions; network failures preserve play, stop at three tries and resume cached progress offline');
  outage = false;
  await page.reload(); await page.locator('.tile').first().waitFor();
  await page.locator('#classroom-notice').filter({ hasText: 'after three attempts' }).waitFor();
  assert.equal(requests.filter(r => r.path.endsWith('/events')).length, beforeOfflineReload);
  check('reload with a healthy service does not reset the exhausted retry budget');

  const retryContext = await browser.newContext(), retryPage = await retryContext.newPage();
  loseAcknowledgment = true;
  const beforeRetry = count('session_start');
  await retryPage.goto(origin + fixture.studentPath); await retryPage.locator('.tile').first().waitFor();
  await eventually(() => count('session_start') === beforeRetry + 1);
  await retryPage.reload(); await retryPage.locator('.tile').first().waitFor();
  await retryPage.locator('#classroom-notice').filter({ hasText: 'received by the server' }).waitFor();
  assert.equal(count('session_start'), beforeRetry + 1);
  const retryState = await retryPage.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  const repeated = requests.filter(r => r.path.endsWith('/events') && r.body.event.runID === retryState.runID);
  assert.equal(repeated.length, 2); assert.equal(repeated[0].body.event.eventID, repeated[1].body.event.eventID);
  check('lost acknowledgment followed by reload retries the original event ID without a duplicate start');

  const oldPlayer = retryState.playerID;
  await retryPage.evaluate(() => localStorage.clear());
  await choose(retryPage, ids[0]);
  await retryPage.reload(); await retryPage.locator('.tile').first().waitFor();
  const newPlayer = await retryPage.evaluate(() => localStorage.getItem('mq.econnections.classroom.v1.player'));
  assert.notEqual(newPlayer, oldPlayer);
  assert.equal(await retryPage.locator('.tile').count(), 16);
  check('clearing storage regenerates browser identity and cannot resurrect the old run');

  const invalid = await lossContext.newPage();
  const beforeInvalid = requests.length;
  await invalid.goto(origin + '/games/econnections/?classroom=invalid');
  await invalid.locator('#classroom-notice').filter({ hasText: 'invalid' }).waitFor(); assert.equal(requests.length, beforeInvalid);
  h.setTime('2026-09-21T18:30:00.000Z');
  const closedContext = await browser.newContext(), closed = await closedContext.newPage();
  const beforeClosed = requests.filter(r => r.path.endsWith('/events')).length;
  await closed.goto(origin + fixture.studentPath); await closed.locator('#classroom-notice').filter({ hasText: 'unavailable or closed' }).waitFor();
  assert.equal(requests.filter(r => r.path.endsWith('/events')).length, beforeClosed);
  await closed.locator('#classroom-public a').click(); await closed.locator('[data-domain="micro"]').click(); assert.equal(await closed.locator('.tile').count(), 16);
  check('malformed and closed sessions fail closed while the public puzzle remains available');

  h.setTime('2026-09-21T17:40:00.000Z');
  const brokenContext = await browser.newContext();
  await brokenContext.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Blocked'); }; });
  const broken = await brokenContext.newPage(), beforeBroken = requests.filter(r => r.path.endsWith('/events')).length;
  await broken.goto(origin + fixture.studentPath); await broken.locator('.tile').first().waitFor();
  await choose(broken, ids[0]); assert.equal(await broken.locator('.tile').count(), 12);
  assert.equal(requests.filter(r => r.path.endsWith('/events')).length, beforeBroken);
  check('blocked storage permits in-memory play with reporting disabled');

  const noLocksContext = await browser.newContext();
  await noLocksContext.addInitScript(() => Object.defineProperty(navigator, 'locks', { value: undefined }));
  const noLocks = await noLocksContext.newPage(), beforeNoLocks = requests.filter(r => r.path.endsWith('/events')).length;
  await noLocks.goto(origin + fixture.studentPath); await noLocks.locator('.tile').first().waitFor();
  await choose(noLocks, ids[0]); assert.equal(await noLocks.locator('.tile').count(), 12);
  assert.equal(requests.filter(r => r.path.endsWith('/events')).length, beforeNoLocks);
  check('missing Web Locks fails closed for reporting while retaining in-memory gameplay');

  const damagedContext = await browser.newContext(), damaged = await damagedContext.newPage();
  await damaged.goto(origin + fixture.studentPath); await damaged.locator('.tile').first().waitFor();
  await damaged.locator('#classroom-notice').filter({ hasText: 'received by the server' }).waitFor();
  // Corrupt on the next load, after the old document has finished its pagehide save.
  await damaged.addInitScript(key => { const state = JSON.parse(localStorage.getItem(key)); state.queue = [null]; localStorage.setItem(key, JSON.stringify(state)); }, key);
  const beforeDamaged = requests.filter(r => r.path.endsWith('/events')).length;
  await damaged.reload(); await damaged.locator('.tile').first().waitFor();
  await choose(damaged, ids[0]); assert.equal(await damaged.locator('.tile').count(), 12);
  assert.equal(requests.filter(r => r.path.endsWith('/events')).length, beforeDamaged);
  check('corrupt pending state cannot emit malformed events or break gameplay');

  h.setTime('2026-09-21T17:40:00.000Z');
  const course = await h.course(), teacherContext = await browser.newContext({ timezoneId: 'Asia/Tokyo', viewport: { width: 1440, height: 1100 } });
  const external = [];
  await teacherContext.route('**/*', route => {
    if (new URL(route.request().url()).origin !== origin) { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  const teacher = await teacherContext.newPage(); teacher.on('pageerror', e => errors.push(e.message));
  const studentContext = await browser.newContext(), student = await studentContext.newPage();
  student.on('pageerror', e => errors.push(e.message));
  await student.goto(origin + course.studentPath);
  await student.locator('#classroom-notice').filter({ hasText: 'No Econ-nections session is currently active' }).waitFor();
  assert.equal(await student.locator('.tile').count(), 0);
  assert.deepEqual(await student.evaluate(() => Object.keys(localStorage)), []);
  await teacher.goto(origin + '/games/econnections-class/');
  await teacher.locator('#instructor-token').fill('incorrect-token'); await teacher.getByRole('button', { name: 'Open Classroom', exact: true }).click();
  await teacher.locator('#message').filter({ hasText: 'not accepted' }).waitFor();
  await teacher.locator('#instructor-token').fill(course.instructorToken); await teacher.getByRole('button', { name: 'Open Classroom', exact: true }).click();
  await teacher.locator('#console').waitFor();
  assert.equal(await teacher.locator('#instructor-token').inputValue(), '');
  assert.ok(!(await teacher.content()).includes(course.instructorToken)); assert.ok(!teacher.url().includes(course.instructorToken));
  assert.equal(await teacher.evaluate(() => localStorage.length + sessionStorage.length), 0);
  assert.equal(await teacher.locator('#date').inputValue(), '2026-09-21');
  assert.equal(await teacher.locator('#timezone').inputValue(), 'America/Chicago');
  assert.equal(await teacher.locator('#window').inputValue(), '12:40');
  assert.equal(await teacher.locator('#walkthrough').inputValue(), '13:00');
  assert.equal(await teacher.locator('#close').inputValue(), '13:30');
  const permanentURL = origin + course.studentPath;
  assert.equal(await teacher.locator('#student-url').innerText(), permanentURL);
  const qrMarkup = await teacher.locator('#qr').innerHTML();
  const raster = await teacher.evaluate(async () => {
    const svg = new XMLSerializer().serializeToString(document.querySelector('#qr svg'));
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const img = new Image(); img.src = url; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 800;
    const context = canvas.getContext('2d'); context.imageSmoothingEnabled = false; context.drawImage(img, 0, 0, 800, 800); URL.revokeObjectURL(url);
    return Array.from(context.getImageData(0, 0, 800, 800).data);
  });
  const jsQR = createRequire(import.meta.url)(process.env.JSQR_MODULE || fileURLToPath(new URL('../../tmp/econnections/qr-test/node_modules/jsqr', import.meta.url)));
  assert.equal(jsQR(new Uint8ClampedArray(raster), 800, 800).data, permanentURL);
  const screenshotDir = fileURLToPath(new URL('../../tmp/econnections/', import.meta.url)); await mkdir(screenshotDir, { recursive: true });
  await teacher.screenshot({ path: path.join(screenshotDir, 'instructor-console.png'), fullPage: true });
  assert.deepEqual(external, []);
  check('instructor login is memory-only, defaults use classroom time, no active session creates no run, and local QR independently decodes to the student URL');

  const secondTeacher = await teacherContext.newPage();
  await secondTeacher.goto(origin + '/games/econnections-class/');
  await secondTeacher.locator('#instructor-token').fill(course.instructorToken); await secondTeacher.getByRole('button', { name: 'Open Classroom', exact: true }).click();
  await secondTeacher.locator('#console').waitFor();
  let browserPlayer, priorRun, lastSession;
  const occurrenceIDs = [];
  for (const [date, hour] of [['2026-09-21', '12'], ['2026-09-23', '12'], ['2026-09-25', '12'], ['2026-09-25', '14']]) {
    h.setTime(date + 'T' + String(+hour + 5) + ':40:00.000Z');
    await teacher.locator('#date').fill(date); await teacher.locator('#window').fill(hour + ':40');
    await teacher.locator('#walkthrough').fill(String(+hour + 1) + ':00'); await teacher.locator('#close').fill(String(+hour + 1) + ':30');
    await teacher.getByRole('button', { name: 'Activate Session', exact: true }).click(); await teacher.locator('#active').waitFor();
    const activeView = await (await h.instructor(course, 'open')).json(); lastSession = activeView.activeSession; occurrenceIDs.push(lastSession.sessionID);
    if (occurrenceIDs.length === 1) {
      await secondTeacher.getByRole('button', { name: 'Activate Session', exact: true }).click();
      await secondTeacher.locator('#message').filter({ hasText: 'already active' }).waitFor();
      assert.ok(await secondTeacher.locator('#active').isVisible());
      assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_sessions WHERE classroomID=?').get(course.classroom.classroomID).n, 1);
      await secondTeacher.close();
    }
    assert.equal(await teacher.locator('#student-url').innerText(), permanentURL); assert.equal(await teacher.locator('#qr').innerHTML(), qrMarkup);
    await student.goto(permanentURL); await student.locator('.tile').first().waitFor();
    const runKey = 'mq.econnections.classroom.v1.run.' + lastSession.sessionID;
    const run = await student.evaluate(key => JSON.parse(localStorage.getItem(key)), runKey);
    browserPlayer ??= run.playerID; assert.equal(run.playerID, browserPlayer); assert.notEqual(run.runID, priorRun); priorRun = run.runID;
    assert.equal(run.record.puzzleId, lastSession.puzzleID); assert.equal(run.record.completed, false);
    const pinned = await student.evaluate(async date => (await import('/games/econnections/engine.js')).createPuzzle('micro', date), date);
    for (const group of pinned.groups) await choose(student, pinned.tiles.filter(t => t.groupId === group.id).map(t => t.id));
    await eventually(() => h.sqlite.prepare("SELECT COUNT(*) AS n FROM classroom_events WHERE sessionID=? AND eventType='puzzle_complete'").get(lastSession.sessionID).n === 1);
    await teacher.locator('#end').click(); await teacher.locator('#activate').waitFor();
    await student.reload(); await student.locator('#classroom-notice').filter({ hasText: 'No Econ-nections session is currently active' }).waitFor();
    assert.equal(await student.locator('.tile').count(), 0);
  }
  assert.equal(new Set(occurrenceIDs).size, 4);
  for (const id of occurrenceIDs) assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_events WHERE sessionID=?').get(id).n, 10);
  assert.equal(await teacher.evaluate(() => localStorage.length + sessionStorage.length), 0);
  assert.deepEqual(external, []);
  await teacher.locator('#logout').click(); await teacher.locator('#access').waitFor();
  assert.equal(await teacher.locator('#instructor-token').inputValue(), '');
  check('one QR supports Monday/Wednesday/Friday and another same-day session with separate telemetry, stable player ID, new run IDs, and explicit close');

  for (const { body } of requests.filter(r => r.path.endsWith('/events'))) {
    assert.deepEqual(Object.keys(body).sort(), ['accessToken', 'event']);
    assert.doesNotMatch(JSON.stringify(body), /email|userAgent|fingerprint|studentName|keystroke|clipboard/);
  }
  assert.deepEqual(errors, []);
  check('event payloads contain only the classroom contract; no browser errors');
  console.log(JSON.stringify({ status: 'PASS', checks: passed.length }, null, 2));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
