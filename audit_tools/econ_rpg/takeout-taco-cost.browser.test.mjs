import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import path from 'node:path';
import { publishGamesPreview } from './publish-games-preview.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = fileURLToPath(new URL('../../tmp/econ-rpg/takeout-taco-cost-redesign/', import.meta.url));
await mkdir(out, { recursive: true });
const packaged = path.join(out, 'packaged'); await mkdir(packaged, { recursive: true });
const config = publishGamesPreview(fileURLToPath(new URL('../../', import.meta.url)), packaged);
const server = createServer(async (req, res) => {
  try {
    let file = path.resolve(packaged, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(packaged + path.sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`, errors = [], results = [];
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
async function setup(width, blocked = false) {
  const p = await browser.newPage({ viewport: { width, height: width > 760 ? 900 : 844 }, reducedMotion: 'reduce' });
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  p.on('request', r => { if (!r.url().startsWith(origin)) errors.push(`Unexpected network: ${r.url()}`); });
  if (blocked) await p.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw Error('Blocked'); } }));
  await p.goto(origin + config.previewRoot + 'games/takeout-taco-counting-the-cost/');
  return p;
}
const act = (p, action) => p.locator(`[data-action="${action}"]`).first().click();
async function choose(p, id) { await p.locator(`[data-choice="${id}"]`).click(); await act(p, 'commit'); }
const text = (p, id) => p.locator(id).innerText();
async function count(p) { return p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('mq.takeout-taco-cost.run.v1.')).flatMap(k => JSON.parse(localStorage.getItem(k)).events).filter(e => e.action === 'service_trial').length); }
async function primaryGraph(p, round, trials) {
  assert.equal(await p.locator('.plot [data-chart=unit]').count(), 0);
  assert.equal(await p.locator('.plot [data-chart=total]').count(), round === 8 ? 2 : 1);
  assert.deepEqual(await p.locator('.plot .legend').first().locator('span').allTextContents(), ['FC', 'VC', 'TC']);
  assert.equal(await p.locator('.plot figcaption > p').count(), 0);
  assert.equal(await p.locator('.plot .graph-data tbody tr').count(), trials);
  assert.equal(await p.locator('.round-bar [aria-current=step]').innerText(), String(round));
  assert.doesNotMatch(await text(p, '.round-bar'), /ROUND \d+ OF 8/);
}
async function layout(p, width) {
  assert.equal(await p.locator('footer').count(), 0);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `horizontal overflow ${width}`);
  assert.equal(await p.locator('input[type=number]').count(), 0);
  assert.equal(await p.locator('#plan-form,#dashboard,#target,#kits').count(), 0);
  const labels = await p.locator('input,select').evaluateAll(xs => xs.filter(x => !x.labels?.length).map(x => x.id)); assert.deepEqual(labels, []);
}
async function shortPath(p, { expand = false, target = 80, allocation = 6, refuse = false } = {}) {
  await act(p, 'start');
  for (const id of ['delay', ...[1, 2, 3, 4, 5, 6].map(n => `crew-${refuse ? 0 : n}`)]) { await choose(p, id); await act(p, 'continue'); }
  await choose(p, `target-${target}`); await choose(p, expand ? 'expand' : 'stay');
  if (expand) await choose(p, `allocation-${allocation}`);
}
try {
  const p = await setup(1440); await p.screenshot({ path: out + '/desktop-intro.png', fullPage: true });
  assert.equal(await p.locator('[data-action=lab-start]').count(), 0);
  assert.ok(await p.locator('.intro img').evaluate(el => el.getBoundingClientRect().width > 1000 && el.getBoundingClientRect().height > 500));
  assert.doesNotMatch(await text(p, 'body'), /minutes|Eight rounds|No timer|Anonymous history|Companion to/i);
  assert.equal(await p.locator('.intro .small,footer').count(), 0);
  await act(p, 'start'); assert.equal(await p.locator('#commit').isDisabled(), true);
  await p.locator('[data-choice=open]').focus(); await p.keyboard.press('Enter');
  assert.equal(await p.locator('[data-choice=open]').getAttribute('aria-pressed'), 'true');
  assert.equal(await count(p), 0); await p.locator('#commit').focus(); await p.keyboard.press('Enter');
  assert.equal(await text(p, '#actual-output'), '0 / 0'); assert.equal(await text(p, '#total-cost'), '$60');
  await primaryGraph(p, 1, 1);
  await act(p, 'report'); assert.match(await text(p, '#dialog-content'), /AFC \/ taco\s+—/);
  await p.keyboard.press('Escape'); assert.equal(await p.evaluate(() => document.activeElement.dataset.action), 'report');
  await act(p, 'continue'); await layout(p, 1440);
  await p.screenshot({ path: out + '/desktop-round2-choice.png', fullPage: true });
  await choose(p, 'crew-0'); await primaryGraph(p, 2, 2); assert.equal(await text(p, '#actual-output'), '0 / 8');
  assert.match(await text(p, '#announcement'), /8 orders remain/);
  await act(p, 'revise'); await choose(p, 'crew-2'); assert.equal(await text(p, '#total-cost'), '$196');
  await act(p, 'report'); assert.match(await text(p, '#dialog-content'), /Avoidable expense: \$60 per lunch/); await p.keyboard.press('Escape');
  await act(p, 'revise'); await choose(p, 'crew-1'); assert.equal(await text(p, '#total-cost'), '$136');
  await act(p, 'continue');
  for (const [n, q, cost] of [[2,18,216],[3,31,302],[4,42,384],[5,50,460],[6,53,526]]) {
    await choose(p, `crew-${n}`); assert.equal(await text(p, '#actual-output'), `${q} / ${q}`); assert.equal(await text(p, '#total-cost'), `$${cost}`);
    await layout(p, 1440); await primaryGraph(p, n + 1, n + 3);
    if (n < 6) await act(p, 'continue');
  }
  assert.match(await text(p, '.why'), /three additional tacos/); assert.match(await text(p, '.why'), /\$22/);
  assert.equal(await p.locator('[data-chart=total]').count(), 1);
  await p.screenshot({ path: out + '/desktop-round7-result.png', fullPage: true });
  await p.setViewportSize({ width: 1366, height: 768 });
  await p.screenshot({ path: out + '/laptop-round7-result.png', fullPage: true });
  assert.equal(await p.locator('[data-action=continue]').evaluate(el => el.getBoundingClientRect().bottom < innerHeight), true, 'laptop result fits');
  await p.setViewportSize({ width: 1440, height: 900 });
  await act(p, 'curves'); await p.locator('#curve-kind').selectOption('unit'); assert.equal(await p.locator('#curve-full').count(), 0);
  assert.match(await text(p, '#dialog-content'), /Solid markers show actual decisions/);
  assert.deepEqual(await p.locator('#dialog-content .legend span').allTextContents(), ['AFC', 'AVC', 'ATC', 'MC']);
  await p.locator('#curve-reference').check();
  assert.ok(await p.locator('path[data-reference] title').filter({ hasText: '$22.00' }).count());
  await p.keyboard.press('Escape'); await act(p, 'continue');
  const before = await count(p); await choose(p, 'target-62'); await choose(p, 'expand'); assert.equal(await count(p), before);
  await act(p, 'back'); await choose(p, 'expand'); await choose(p, 'allocation-3');
  await primaryGraph(p, 8, 10);
  assert.equal(await p.locator('.plot .cost-chart').first().locator('.chart-point[aria-label*="2 trucks"]').count(), 0);
  assert.equal(await p.locator('.plot .cost-chart').last().locator('.chart-point[aria-label*="1 truck"]').count(), 0);
  await p.screenshot({ path: out + '/desktop-expansion.png', fullPage: true });
  assert.equal(await text(p, '#actual-output'), '62 / 62'); assert.equal(await text(p, '#total-cost'), '$604');
  await act(p, 'continue'); assert.match(await text(p, '.review'), /met 7 of the seven/); assert.match(await text(p, '.review'), /2 additional experiments/);
  await p.locator('#curve-equipment').selectOption('1:1'); await p.locator('#curve-full').check(); await p.locator('#curve-kind').selectOption('unit');
  assert.equal(await p.locator('#final-curves-content .chart-point[aria-label*="2 trucks"]').count(), 0);
  await act(p, 'report'); await p.locator('summary').filter({ hasText: 'Complete trial history' }).click();
  const download = p.waitForEvent('download'); await p.locator('#download').click(); assert.equal((await download).suggestedFilename(), 'takeout-taco-cost-trials.csv'); await p.keyboard.press('Escape');
  const storyReview = await text(p, '.review > section:first-of-type');
  await act(p, 'lab-start'); assert.equal(await p.locator('input[type=number]').count(), 3);
  await p.locator('#lab-target').fill('20'); await p.locator('#lab-trucks').selectOption('1'); await p.locator('#lab-workers-a').fill('6');
  await p.locator('#lab-form button').click(); assert.match(await text(p, '.lab'), /20 \/ 20 tacos · capacity 53 · total cost \$460/);
  await p.locator('#lab-trucks').selectOption('2'); await p.locator('#lab-workers-a').fill('3'); await p.locator('#lab-workers-b').fill('3');
  await p.locator('[name=grill-b]').check(); await p.locator('#lab-target').fill('80'); await p.locator('#lab-form button').click();
  assert.match(await text(p, '.lab'), /62 \/ 80 tacos/); await p.screenshot({ path: out + '/desktop-lab.png', fullPage: true });
  await act(p, 'report'); assert.equal(await p.locator('#report-trial option').count(), 2); assert.match(await text(p, '#dialog-title'), /Lab Cost Report/); await p.keyboard.press('Escape');
  assert.equal(await count(p), 10); await act(p, 'lab-exit'); assert.equal(await text(p, '.review > section:first-of-type'), storyReview);
  await act(p, 'report'); assert.equal(await p.locator('#report-trial option').count(), 10); await p.keyboard.press('Escape');
  const events = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('mq.takeout-taco-cost.run.v1.')).flatMap(k => JSON.parse(localStorage.getItem(k)).events));
  assert.equal(events.filter(e => e.action === 'completion').length, 1); assert.equal(events.filter(e => e.action === 'lab-run').length, 2);
  assert.ok(events.filter(e => e.action === 'service_trial').every(e => e.plan.kits === e.output));
  await act(p, 'replay'); await shortPath(p, { refuse: true }); await act(p, 'continue'); assert.match(await text(p, '.review'), /not to produce in any round/);
  await p.locator('summary').filter({ hasText: 'Earlier playthroughs' }).click(); await p.locator('[data-archive="0"]').click(); assert.match(await text(p, '.review'), /2 additional experiments/); await p.close();
  results.push({ viewport: 1440, eightRounds: true, persistentTotalGraphs: true, separatedCapital: true, cleanLabels: true, experiments: true, labSeparation: true, keyboard: true, dialogs: true, telemetry: true, replay: true });
  for (const width of [768, 390, 320]) {
    const page = await setup(width); await page.screenshot({ path: `${out}/splash-${width}.png`, fullPage: true }); await layout(page, width); await act(page, 'start'); await choose(page, 'delay'); await act(page, 'continue');
    await layout(page, width); await page.screenshot({ path: `${out}/choice-${width}.png`, fullPage: true });
    for (let n = 1; n <= 6; n++) { await choose(page, `crew-${width === 390 ? 0 : n}`); if (n < 6) await act(page, 'continue'); }
    if (width <= 760) { assert.equal(await page.locator('.plot-content').isVisible(), false); await act(page, 'expand-graph'); }
    await page.locator('.graph-data summary').click(); await layout(page, width); await page.locator('.graph-data summary').click();
    if (width !== 390) assert.equal(await page.locator('.new-point').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.screenshot({ path: `${out}/result-${width}.png`, fullPage: true });
    await act(page, 'continue'); await choose(page, 'target-80'); await choose(page, width === 320 ? 'expand' : 'stay');
    if (width === 320) { await choose(page, 'allocation-6'); await layout(page, width); await page.screenshot({ path: `${out}/expansion-${width}.png`, fullPage: true }); }
    assert.equal(await text(page, '#actual-output'), `${width === 390 ? 0 : 53} / 80`); await act(page, 'continue');
    await pSafeLab(page, width); await layout(page, width);
    await page.getByRole('link', { name: 'RETURN TO GAMES', exact: true }).click();
    assert.deepEqual(await page.locator('[aria-labelledby=microeconomics-heading] .game-card').evaluateAll(xs => xs.map(x => x.dataset.game)), ['ppf', 'housing-crisis', 'megastar-mania', 'at-the-box-office', 'takeout-taco-lunch-rush', 'takeout-taco-counting-the-cost', 'main-attraction', 'gameday-rivals']);
    assert.equal(await page.locator('[aria-labelledby=macroeconomics-heading] .game-card').count(), 7);
    await page.screenshot({ path: `${out}/ordered-hub-${width}.png`, fullPage: true });
    await page.locator('[data-game=takeout-taco-counting-the-cost] a').click(); await page.locator('[data-action=start]').waitFor({ state: 'visible' });
    results.push({ viewport: width, eightRounds: true, shortageAccepted: true, responsiveGraphs: true, lab: true, reducedMotion: true, hubNavigation: true }); await page.close();
  }
  const blocked = await setup(390, true); await shortPath(blocked, { expand: true, target: 40, allocation: 3 });
  assert.equal(await blocked.locator('#storage-warning').isVisible(), true); await act(blocked, 'continue'); await act(blocked, 'lab-start');
  await blocked.locator('#lab-form button').click(); assert.match(await text(blocked, '.lab'), /Lab trial 1/); await blocked.close();
  results.push({ storageBlocked: true, entireGameAndLabComplete: true }); assert.deepEqual(errors, []);
  await writeFile(out + '/results.json', JSON.stringify({ passed: true, results, errors }, null, 2));
  console.log(JSON.stringify({ passed: true, results, screenshots: out }, null, 2));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
async function pSafeLab(page, width) {
  await act(page, 'lab-start'); await page.locator('#lab-form button').click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `lab overflow ${width}`);
  assert.deepEqual(await page.locator('input,select').evaluateAll(xs => xs.filter(x => !x.labels?.length).map(x => x.id)), []);
  await page.screenshot({ path: `${out}/lab-${width}.png`, fullPage: true }); await act(page, 'lab-exit');
}
