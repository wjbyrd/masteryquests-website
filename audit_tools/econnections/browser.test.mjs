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
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce', timezoneId: 'America/New_York' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-09-16T12:00:00Z') });
  await page.goto(`${origin}/games/`);
  await page.getByRole('link', { name: 'Play Econ-nections' }).last().click();
  await page.locator('#micro-status').filter({ hasText: 'Not played today · Play' }).waitFor();
  assert.equal(await page.locator('#daily-date').innerText(), 'Sep 16, 2026');
  assert.doesNotMatch(await page.locator('.econ-footer').innerText(), /New puzzles at local midnight|About 2 minutes/);
  assert.equal(await page.locator('.econ-footer a').getAttribute('href'), '/privacy/');
  assert.doesNotMatch(await page.locator('body').innerText(), /UTC/);
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
  assert.equal(await page.locator('#result-title').innerText(), 'Four Econ-nections. Nicely done.');
  assert.doesNotMatch(await page.locator('body').innerText(), /Puzzle complete|Solved! All four connections found\.|ALL SIGNALS CONNECTED|You found all four economic connections\./);
  assert.equal(await page.locator('#feedback').innerText(), '');
  assert.ok(await page.locator('#result-eyebrow').isHidden());
  assert.ok(await page.locator('#result-description').isHidden());
  assert.ok(await page.locator('#result-return').isHidden());
  assert.deepEqual(await page.locator('#result-stats .stat span').allTextContents(), ['Active time', 'Strikes used', 'Current streak', 'Best streak']);
  assert.equal(await page.locator('.connection').count(), 4);
  assert.ok(await page.locator('#result-title').evaluate(el => el === document.activeElement));
  await page.screenshot({ path: path.join(out, 'win-desktop.png'), fullPage: true });
  const records = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('mq.econnections.result.')).map(k => JSON.parse(localStorage.getItem(k))));
  assert.equal(records[0].solved, true); assert.ok(records[0].elapsedTimeMs >= 62000);
  await page.locator('#share').click();
  await page.waitForFunction(() => document.getElementById('share-status').textContent.length > 0);
  const shared = await page.locator('#share-status').innerText(); assert.match(shared, /copied|copy/i);
  assert.equal(shared, 'Spoiler-free results copied.');
  const clipboard = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');
  assert.match(clipboard, /Econ-nections · Micro · 2026-09-16\nSolved · 4\/4 connections\n0\/3 strikes/);
  for (const tile of puzzle.tiles) assert.ok(!clipboard.includes(tile.label));
  // Keep the established fallback usable when clipboard permission is denied.
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new DOMException('denied'); }; });
  await page.locator('#share').click();
  await page.locator('#share-fallback').waitFor();
  assert.equal(await page.locator('#share-text').inputValue(), clipboard);
  check('win state, all explanations, elapsed time, result focus and share summary');
  await page.locator('#choose-domain').click();
  assert.match(await page.locator('#micro-status').innerText(), /Solved today/);
  await page.locator('[data-domain="micro"]').click(); assert.ok(await page.locator('#results').isVisible());
  await page.locator('#other-domain').click();
  assert.equal(await page.locator('#game-title').innerText(), 'Macro connections');
  const macro = await page.evaluate(async () => (await import('/games/econnections/engine.js')).createPuzzle('macro', '2026-09-16'));
  const wrong = [0, 1, 2].map(i => macro.groups.map(g => macro.tiles.filter(t => t.groupId === g.id)[i].id));
  await selectIds(page, wrong[0]); await page.locator('#submit').click();
  assert.match(await page.locator('#attempts').innerText(), /2 strikes remaining/);
  assert.doesNotMatch(await page.locator('#feedback').innerText(), /away/);
  await page.locator('#submit').click(); assert.match(await page.locator('#feedback').innerText(), /No extra strike/);
  for (const ids of wrong.slice(1)) { await page.locator('#deselect').click(); await selectIds(page, ids); await page.locator('#submit').click(); }
  assert.match(await page.locator('#result-title').innerText(), /Completed, not solved/);
  assert.equal(await page.locator('.connection').count(), 4);
  assert.ok((await page.locator('.connection-meta').allTextContents()).every(s => s.includes('Revealed')));
  await page.locator('#choose-domain').click();
  assert.match(await page.locator('#macro-status').innerText(), /Completed today/);
  assert.deepEqual(await page.locator('#landing-stats .stat strong').allTextContents(), ['1', '1', '2', '2', '1', '1']);
  check('three-strike loss, repeat protection, reveal, revisit and distinct lifetime stats');
  await page.locator('[data-domain="macro"]').click();
  assert.equal(await page.locator('#result-eyebrow').innerText(), 'DAILY PUZZLE COMPLETE');
  assert.ok(await page.locator('#result-description').isVisible());
  assert.equal(await page.locator('#other-domain').innerText(), 'View today’s Micro');
  await page.locator('#other-domain').click();
  assert.equal(await page.locator('#result-title').innerText(), 'Four Econ-nections. Nicely done.');
  await page.locator('#choose-domain').click();
  // 8 p.m. Eastern: crossing UTC midnight must not change either puzzle.
  await page.clock.setSystemTime(new Date('2026-09-17T00:00:01Z')); await page.clock.runFor(5000);
  assert.ok(await page.locator('#day-notice').isHidden());
  assert.match(await page.locator('#micro-status').innerText(), /Solved today/);
  assert.match(await page.locator('#macro-status').innerText(), /Completed today/);
  assert.equal(await page.locator('#daily-date').innerText(), 'Sep 16, 2026');
  check('UTC midnight at 8 p.m. Eastern does not change local puzzles or statuses');
  const oldResults = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('mq.econnections.result.')).sort().map(k => [k, localStorage.getItem(k)]));
  await page.clock.setSystemTime(new Date('2026-09-17T03:59:59Z')); await page.clock.runFor(6000);
  assert.ok(await page.locator('#day-notice').isVisible());
  assert.match(await page.locator('#micro-status').innerText(), /Not played/);
  await page.locator('[data-domain="micro"]').click();
  const next = await page.evaluate(async () => (await import('/games/econnections/engine.js')).createPuzzle('micro', '2026-09-17'));
  assert.notDeepEqual(next.groups.map(g => g.id), puzzle.groups.map(g => g.id));
  assert.equal(await page.locator('.tile').count(), 16);
  assert.equal(await page.locator('#puzzle-date').innerText(), 'Sep 17, 2026');
  for (const [key, raw] of oldResults) assert.equal(await page.evaluate(key => localStorage.getItem(key), key), raw);
  check('local midnight starts a new board and preserves completed history byte for byte');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(out, 'board-mobile.png'), fullPage: true });
  for (const width of [320, 390, 420, 768]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth, tiles: [...document.querySelectorAll('.tile')].map(t => ({ w: t.getBoundingClientRect().width, h: t.getBoundingClientRect().height, overflow: t.scrollHeight > t.clientHeight })) }));
    assert.ok(layout.scroll <= layout.width, `horizontal overflow at ${width}`);
    assert.ok(layout.tiles.every(t => t.w >= 44 && t.h >= 44 && !t.overflow), `tile sizing at ${width}`);
  }
  check('320px, 390px, 420px and 768px layouts: no horizontal overflow; readable, >=44px tile targets');
  // Two tabs share the same completed record rather than creating extra games.
  const second = await context.newPage(); await second.clock.install({ time: new Date('2026-09-17T12:00:00Z') });
  await second.goto(`${origin}/games/econnections/`); await second.locator('[data-domain="micro"]').click();
  for (const group of next.groups) {
    await selectIds(second, next.tiles.filter(t => t.groupId === group.id).map(t => t.id)); await second.locator('#submit').click();
  }
  await page.locator('#results').waitFor(); assert.equal(await page.locator('#result-title').innerText(), 'Four Econ-nections. Nicely done.');
  assert.equal(await page.locator('#result-stats .stat strong').nth(2).innerText(), '2');
  assert.equal(await page.locator('#result-stats .stat strong').nth(3).innerText(), '2');
  check('another tab’s completion synchronizes without a second counted game');
  await second.close();
  // Check historical migration in a separate browser without touching v1 keys.
  const legacyContext = await browser.newContext({ timezoneId: 'America/New_York' });
  const legacyPage = await legacyContext.newPage();
  await legacyPage.clock.install({ time: new Date('2026-09-17T03:30:00Z') });
  await legacyPage.goto(`${origin}/games/econnections/`);
  const fixture = JSON.parse(await readFile(path.join(sourceRoot, 'audit_tools/econnections/fixtures/v1-history.json'), 'utf8'));
  await legacyPage.evaluate(records => { for (const r of records) localStorage.setItem(`mq.econnections.result.${r.puzzleId}`, JSON.stringify(r)); }, fixture.records);
  await legacyPage.reload();
  assert.equal(await legacyPage.locator('#daily-date').innerText(), 'Sep 16, 2026');
  assert.match(await legacyPage.locator('#micro-status').innerText(), /Not played/);
  assert.match(await legacyPage.locator('#macro-status').innerText(), /Not played/);
  assert.deepEqual(await legacyPage.locator('#landing-stats .stat strong').allTextContents(), ['0', '0', '3', '2', '1', '1']);
  await legacyPage.locator('[data-domain="micro"]').click();
  const localPuzzle = await legacyPage.evaluate(async () => (await import('/games/econnections/engine.js')).createPuzzle('micro'));
  assert.equal(localPuzzle.date, '2026-09-16'); assert.equal(localPuzzle.poolVersion, '2');
  await selectIds(legacyPage, localPuzzle.tiles.filter(t => t.groupId === localPuzzle.groups[0].id).map(t => t.id));
  await legacyPage.locator('#submit').click();
  await legacyPage.clock.setSystemTime(new Date('2026-09-17T03:59:59Z')); await legacyPage.clock.runFor(6000);
  assert.ok(await legacyPage.locator('#landing').isVisible());
  assert.ok(await legacyPage.locator('#game').isHidden());
  const partial = await legacyPage.evaluate(id => JSON.parse(localStorage.getItem(`mq.econnections.result.${id}`)), localPuzzle.puzzleId);
  assert.equal(partial.groupsSolved, 1); assert.equal(partial.completed, false); assert.equal(partial.date, '2026-09-16');
  for (const r of fixture.records) assert.equal(await legacyPage.evaluate(id => localStorage.getItem(`mq.econnections.result.${id}`), r.puzzleId), JSON.stringify(r));
  assert.match(await legacyPage.locator('#micro-status').innerText(), /Not played/);
  check('legacy lifetime totals survive; v2 has independent status; midnight preserves an unfinished game');
  await legacyContext.close();

  // Real timezone emulation checks open-tab rollover at DST and calendar edges.
  for (const [zone, before, after, label] of [
    ['America/New_York', '2026-03-08T23:59:59-04:00', '2026-03-09', 'Mar 9, 2026'],
    ['America/New_York', '2026-11-01T23:59:59-05:00', '2026-11-02', 'Nov 2, 2026'],
    ['America/New_York', '2026-12-31T23:59:59-05:00', '2027-01-01', 'Jan 1, 2027'],
    ['Asia/Tokyo', '2028-02-28T23:59:59+09:00', '2028-02-29', 'Feb 29, 2028'],
    ['Asia/Kathmandu', '2028-02-29T23:59:59+05:45', '2028-03-01', 'Mar 1, 2028'],
  ]) {
    const dateContext = await browser.newContext({ timezoneId: zone });
    const datePage = await dateContext.newPage();
    await datePage.clock.install({ time: new Date(new Date(before).getTime() - 1000) });
    await datePage.clock.pauseAt(new Date(before));
    await datePage.goto(`${origin}/games/econnections/`);
    // Seed a local solve on the date just ending, then observe the UI streak.
    await datePage.evaluate(async () => {
      const { createPuzzle, startRecord, submitGroup } = await import('/games/econnections/engine.js');
      const p = createPuzzle('micro'); let r = startRecord(p);
      for (const g of p.groups) r = submitGroup(p, r, p.tiles.filter(t => t.groupId === g.id).map(t => t.id)).record;
      localStorage.setItem(`mq.econnections.result.${p.puzzleId}`, JSON.stringify(r));
    });
    await datePage.reload();
    await datePage.clock.runFor(6000);
    assert.equal(await datePage.locator('#daily-date').innerText(), label);
    assert.equal(await datePage.locator('#landing-stats .stat strong').first().innerText(), '1');
    assert.match(await datePage.locator('#micro-status').innerText(), /Not played/);
    await datePage.locator('[data-domain="macro"]').click();
    assert.equal(await datePage.evaluate(async () => (await import('/games/econnections/engine.js')).createPuzzle('macro').date), after);
    await dateContext.close();
  }
  check('local midnight and streak carry across 23/25-hour days, year boundary, leap day and month boundary');
  const hintContext = await browser.newContext({ reducedMotion: 'reduce', timezoneId: 'America/New_York' });
  const hintPage = await hintContext.newPage();
  hintPage.on('pageerror', error => errors.push(error.message));
  await hintPage.clock.install({ time: new Date('2026-09-16T12:00:00Z') });
  await hintPage.goto(`${origin}/games/econnections/`);
  await hintPage.locator('[data-domain="micro"]').click();
  const sets = puzzle.groups.map(idsFor);
  const near = [...sets[0].slice(0, 3), sets[1][0]];
  await selectIds(hintPage, near);
  await hintPage.locator('#submit').focus(); await hintPage.keyboard.press('Enter');
  assert.equal(await hintPage.locator('#feedback').innerText(), 'That set does not form a connection. 1 away. 2 strikes remaining. Change your selection to try again.');
  assert.equal(await hintPage.locator('#feedback').getAttribute('role'), 'status');
  assert.equal(await hintPage.locator('#feedback').getAttribute('aria-live'), 'polite');
  assert.equal(await hintPage.locator('#feedback').getAttribute('aria-atomic'), 'true');
  assert.ok(await hintPage.locator('#submit').evaluate(el => el === document.activeElement));
  assert.equal(await hintPage.locator('.tile[aria-pressed="true"]').count(), 4);
  await hintPage.keyboard.press('Enter');
  assert.equal(await hintPage.locator('#feedback').innerText(), 'You already tried this set. No extra strike; try a different connection. 1 away.');
  assert.match(await hintPage.locator('#attempts').innerText(), /2 strikes remaining/);
  await hintPage.reload(); await hintPage.locator('[data-domain="micro"]').click();
  await selectIds(hintPage, near); await hintPage.locator('#submit').click();
  assert.match(await hintPage.locator('#feedback').innerText(), /No extra strike.*1 away\./);
  assert.match(await hintPage.locator('#attempts').innerText(), /2 strikes remaining/);
  await hintPage.locator('#deselect').click();
  await selectIds(hintPage, [...sets[0].slice(0, 2), ...sets[1].slice(0, 2)]);
  await hintPage.locator('#submit').click();
  assert.doesNotMatch(await hintPage.locator('#feedback').innerText(), /away/);
  assert.match(await hintPage.locator('#attempts').innerText(), /1 strikes remaining/);
  await hintPage.locator('#deselect').click();
  await selectIds(hintPage, [...sets[0].slice(0, 3), sets[1][1]]);
  await hintPage.locator('#submit').click();
  assert.equal(await hintPage.locator('#feedback').innerText(), 'Third strike. Remaining connections revealed. 1 away.');
  assert.equal(await hintPage.locator('#result-title').innerText(), 'Completed, not solved.');
  await hintContext.close();
  check('1 away live feedback, keyboard focus, selected tiles, duplicate/reload protection, 2/4 silence and third-strike loss');

  for (const width of [320, 390, 420, 768]) {
    const mobileContext = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce', timezoneId: 'America/New_York' });
    const mobile = await mobileContext.newPage();
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.clock.install({ time: new Date('2026-09-16T12:00:00Z') });
    await mobile.goto(`${origin}/games/econnections/`);
    await mobile.locator('[data-domain="micro"]').click();
    // Exercise all 384 active labels in the real tile grid, in batches of 16.
    // Restore their text before interacting with the actual daily puzzle.
    const typography = await mobile.evaluate(async () => {
      const { GROUPS } = await import('/games/econnections/econnections_groups.js');
      const buttons = [...document.querySelectorAll('.tile')];
      const original = buttons.map(b => b.textContent);
      const labels = GROUPS.flatMap(g => g.tiles), failures = [];
      let wrapped = 0;
      for (let offset = 0; offset < labels.length; offset += 16) {
        buttons.forEach((b, i) => { b.textContent = labels[offset + i]; });
        for (const b of buttons) {
          const box = b.getBoundingClientRect(), range = document.createRange(); range.selectNodeContents(b);
          const rects = [...range.getClientRects()], style = getComputedStyle(b);
          if (rects.length > 1) wrapped++;
          if (box.width < 44 || box.height < 44 || b.scrollHeight > b.clientHeight || b.scrollWidth > b.clientWidth ||
              rects.some(r => r.left < box.left || r.right > box.right || r.top < box.top || r.bottom > box.bottom) ||
              parseFloat(style.fontSize) < 13) failures.push(b.textContent);
        }
      }
      buttons.forEach((b, i) => { b.textContent = original[i]; });
      return { failures, wrapped, fontSize: getComputedStyle(buttons[0]).fontSize, scroll: document.documentElement.scrollWidth, width: innerWidth };
    });
    assert.deepEqual(typography.failures, [], `all label bounds at ${width}`);
    assert.ok(typography.wrapped > 0); assert.ok(typography.scroll <= typography.width);
    assert.equal(typography.fontSize, width <= 420 ? '13px' : '13.76px');
    await mobile.screenshot({ path: path.join(out, `cleanup-board-${width}.png`), fullPage: true });
    await mobile.locator(`[data-tile-id="${sets[0][0]}"]`).tap();
    assert.equal(await mobile.locator('.tile[aria-pressed="true"]').count(), 1);
    await mobile.locator('#deselect').click();
    await selectIds(mobile, sets[0]); await mobile.locator('#submit').click();
    const solvedType = await mobile.locator('.connection').evaluate(el => ['h3', '.connection-terms', '.connection-explanation'].map(s => {
      const node = el.querySelector(s), css = getComputedStyle(node);
      return { size: parseFloat(css.fontSize), overflow: node.scrollWidth > node.clientWidth, lineHeight: parseFloat(css.lineHeight) };
    }));
    assert.deepEqual(solvedType.map(t => t.size), [15.2, 12.48, 12.48]);
    assert.ok(solvedType.every(t => !t.overflow)); assert.equal(solvedType[2].lineHeight, 18.72);
    await selectIds(mobile, sets[1]); // All three action buttons enabled.
    await mobile.locator('#actions').scrollIntoViewIfNeeded();
    const controls = await mobile.locator('#actions').evaluate(el => {
      const visual = window.visualViewport;
      return { position: getComputedStyle(el).position, usable: [...el.children].every(b => {
        const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        return r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth && r.top >= visual.offsetTop &&
          r.bottom <= visual.offsetTop + visual.height && b.contains(document.elementFromPoint(x, y));
      }) };
    });
    assert.ok(controls.usable, `visible, uncovered action targets at ${width}`);
    if (width <= 420) assert.equal(controls.position, 'sticky');
    await mobile.screenshot({ path: path.join(out, `cleanup-controls-${width}.png`) });
    await mobile.locator('#submit').click();
    for (const ids of sets.slice(2)) { await selectIds(mobile, ids); await mobile.locator('#submit').click(); }
    assert.ok(await mobile.locator('#results').isVisible());
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await mobile.screenshot({ path: path.join(out, `cleanup-solved-${width}.png`), fullPage: true });
    await mobile.locator('#other-domain').click();
    assert.equal(await mobile.locator('#game-title').innerText(), 'Macro connections');
    await mobileContext.close();
  }
  check('touch/mobile 320/390/420/768: all 384 labels fit, natural wrapping, solved typography, sticky controls and result actions');
  const blockedContext = await browser.newContext(); const blocked = await blockedContext.newPage();
  await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('blocked'); }; });
  await blocked.goto(`${origin}/games/econnections/`); await blocked.locator('[data-domain="micro"]').click();
  assert.ok(await blocked.locator('#storage-warning').isVisible()); assert.equal(await blocked.locator('.tile').count(), 16);
  check('blocked localStorage displays a warning while play remains available');
  await blockedContext.close();
  assert.deepEqual(errors, []); check('no JavaScript runtime errors');
  console.log(`${passed.length} browser checks passed. Screenshots: ${out}`);
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
