import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
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

  await page.goto(origin + fixture.studentPath); await page.locator('.tile').first().waitFor();
  await eventually(() => count('session_start') === 1);
  assert.equal(await page.locator('.tile').count(), 16);
  const key = 'mq.econnections.classroom.v1.run.' + fixture.accessToken;
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  assert.equal(saved.record.puzzleId, puzzleID); assert.equal(saved.record.completed, false);
  assert.notEqual(saved.playerID, saved.runID);
  assert.equal(saved.playerID, await page.evaluate(() => localStorage.getItem('mq.econnections.classroom.v1.player')));
  check('valid session pins exact puzzle with separate progress, player UUID, run UUID and one start');

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

  const nextFixture = await h.session({ sessionID: 'next-session' });
  await page.goto(origin + nextFixture.studentPath); await page.locator('.tile').first().waitFor();
  const nextKey = 'mq.econnections.classroom.v1.run.' + nextFixture.accessToken;
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

  for (const { body } of requests.filter(r => r.path.endsWith('/events'))) {
    assert.deepEqual(Object.keys(body).sort(), ['accessToken', 'event']);
    assert.doesNotMatch(JSON.stringify(body), /email|userAgent|fingerprint|studentName|keystroke|clipboard/);
  }
  assert.deepEqual(errors, []);
  check('event payloads contain only the classroom contract; no browser errors');
  console.log(JSON.stringify({ status: 'PASS', checks: passed.length }, null, 2));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
