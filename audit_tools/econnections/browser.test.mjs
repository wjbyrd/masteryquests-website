// Set PLAYWRIGHT_MODULE to an absolute Playwright package path if not installed
// locally. Set BROWSER_CHANNEL (default chrome) or BROWSER_EXECUTABLE as needed.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sourceRoot = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const root = path.resolve(process.env.ECON_SITE_ROOT || sourceRoot);
const out = path.join(sourceRoot, 'tmp', 'econnections'); await mkdir(out, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const errors = [], passed = [];
const check = label => { passed.push(label); console.log(`PASS ${label}`); };
try {
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : { channel: process.env.BROWSER_CHANNEL || 'chrome' }) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-09-16T12:00:00Z') });
  await page.goto(`${origin}/games/`);
  await page.getByRole('link', { name: 'Play Econ-nections' }).last().click();
  await page.locator('#micro-status').filter({ hasText: 'Not played today' }).waitFor();
  await page.screenshot({ path: path.join(out, 'landing-desktop.png'), fullPage: true });
  check('Games entry opens the standalone landing page');
  await page.locator('[data-domain="micro"]').click();
  assert.equal(await page.locator('.tile').count(), 16);
  assert.ok(await page.locator('#submit').isDisabled());
  const puzzle = await page.evaluate(async () => (await import('/games/econnections/engine.js')).createPuzzle('micro', '2026-09-16'));
  await page.clock.runFor(62000);
  const first = page.locator('.tile').first(); await first.focus(); await page.keyboard.press('Space');
  assert.equal(await first.getAttribute('aria-pressed'), 'true');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.tile').nth(1).evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Escape'); assert.equal(await page.locator('.tile[aria-pressed="true"]').count(), 0);
  check('keyboard selection, arrow navigation, escape and submit gating');
  const selectIds = async (target, ids) => { for (const id of ids) await target.locator(`[data-tile-id="${id}"]`).click(); };
  const idsFor = group => puzzle.tiles.filter(t => t.groupId === group.id).map(t => t.id);
  const firstIds = idsFor(puzzle.groups[0]);
  await selectIds(page, firstIds);
  await page.locator('.tile[aria-pressed="false"]').first().click();
  assert.equal(await page.locator('.tile[aria-pressed="true"]').count(), 4);
  await page.locator('#shuffle').click();
  assert.equal(await page.locator('.tile[aria-pressed="true"]').count(), 4);
  await page.locator('#submit').click();
  assert.equal(await page.locator('.tile').count(), 12);
  assert.equal(await page.locator('.connection').count(), 1);
  await page.reload();
  await page.locator('[data-domain="micro"]').click();
  assert.equal(await page.locator('.tile').count(), 12);
  check('selection capped at four, shuffle preserves selection, solved group persists after reload');
  for (const group of puzzle.groups.slice(1)) { await selectIds(page, idsFor(group)); await page.locator('#submit').click(); }
  assert.ok(await page.locator('#results').isVisible());
  assert.match(await page.locator('#result-title').innerText(), /Four connections/);
  assert.equal(await page.locator('.connection').count(), 4);
  assert.ok(await page.locator('#result-title').evaluate(el => el === document.activeElement));
  await page.screenshot({ path: path.join(out, 'win-desktop.png'), fullPage: true });
  const records = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('mq.econnections.result.')).map(k => JSON.parse(localStorage.getItem(k))));
  assert.equal(records[0].solved, true); assert.ok(records[0].elapsedTimeMs >= 62000);
  await page.locator('#share').click();
  await page.waitForFunction(() => document.getElementById('share-status').textContent.length > 0);
  const shared = await page.locator('#share-status').innerText(); assert.match(shared, /copied|copy/i);
  check('win state, all explanations, elapsed time, result focus and share summary');
  await page.locator('#choose-domain').click();
  assert.match(await page.locator('#micro-status').innerText(), /Solved today/);
  await page.locator('[data-domain="micro"]').click(); assert.ok(await page.locator('#results').isVisible());
  await page.locator('#other-domain').click();
  const macro = await page.evaluate(async () => (await import('/games/econnections/engine.js')).createPuzzle('macro', '2026-09-16'));
  const wrong = [0, 1, 2].map(i => macro.groups.map(g => macro.tiles.filter(t => t.groupId === g.id)[i].id));
  await selectIds(page, wrong[0]); await page.locator('#submit').click();
  assert.match(await page.locator('#attempts').innerText(), /2 strikes remaining/);
  await page.locator('#submit').click(); assert.match(await page.locator('#feedback').innerText(), /No extra strike/);
  for (const ids of wrong.slice(1)) { await page.locator('#deselect').click(); await selectIds(page, ids); await page.locator('#submit').click(); }
  assert.match(await page.locator('#result-title').innerText(), /Completed, not solved/);
  assert.equal(await page.locator('.connection').count(), 4);
  assert.ok((await page.locator('.connection-meta').allTextContents()).every(s => s.includes('Revealed')));
  await page.locator('#choose-domain').click();
  assert.match(await page.locator('#macro-status').innerText(), /Completed today/);
  assert.deepEqual(await page.locator('#landing-stats .stat strong').allTextContents(), ['1', '1', '2', '2', '1', '1']);
  check('three-strike loss, repeat protection, reveal, revisit and distinct lifetime stats');
  await page.clock.setSystemTime(new Date('2026-09-17T00:00:01Z')); await page.clock.runFor(5000);
  assert.ok(await page.locator('#day-notice').isVisible());
  assert.match(await page.locator('#micro-status').innerText(), /Not played/);
  await page.locator('[data-domain="micro"]').click();
  const next = await page.evaluate(async () => (await import('/games/econnections/engine.js')).createPuzzle('micro', '2026-09-17'));
  assert.notDeepEqual(next.groups.map(g => g.id), puzzle.groups.map(g => g.id));
  assert.equal(await page.locator('.tile').count(), 16);
  check('UTC midnight rollover starts a new deterministic board and preserves history');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(out, 'board-mobile.png'), fullPage: true });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth, tiles: [...document.querySelectorAll('.tile')].map(t => ({ w: t.getBoundingClientRect().width, h: t.getBoundingClientRect().height, overflow: t.scrollHeight > t.clientHeight })) }));
    assert.ok(layout.scroll <= layout.width, `horizontal overflow at ${width}`);
    assert.ok(layout.tiles.every(t => t.w >= 44 && t.h >= 44 && !t.overflow), `tile sizing at ${width}`);
  }
  check('320px, 390px and 768px layouts: no horizontal overflow; readable, >=44px tile targets');
  // Two tabs share the same completed record rather than creating extra games.
  const second = await context.newPage(); await second.clock.install({ time: new Date('2026-09-17T12:00:00Z') });
  await second.goto(`${origin}/games/econnections/`); await second.locator('[data-domain="micro"]').click();
  for (const group of next.groups) {
    await selectIds(second, next.tiles.filter(t => t.groupId === group.id).map(t => t.id)); await second.locator('#submit').click();
  }
  await page.locator('#results').waitFor(); assert.match(await page.locator('#result-title').innerText(), /Four connections/);
  check('another tab’s completion synchronizes without a second counted game');
  await second.close();
  const blockedContext = await browser.newContext(); const blocked = await blockedContext.newPage();
  await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('blocked'); }; });
  await blocked.goto(`${origin}/games/econnections/`); await blocked.locator('[data-domain="micro"]').click();
  assert.ok(await blocked.locator('#storage-warning').isVisible()); assert.equal(await blocked.locator('.tile').count(), 16);
  check('blocked localStorage displays a warning while play remains available');
  await blockedContext.close();
  assert.deepEqual(errors, []); check('no JavaScript runtime errors');
  console.log(`${passed.length} browser checks passed. Screenshots: ${out}`);
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
