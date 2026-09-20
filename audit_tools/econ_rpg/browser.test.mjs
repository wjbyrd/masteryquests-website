// Use the repository's existing Playwright convention; no package installation required.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { previewServer } from './serve.mjs';
import { enumerate, summarize } from './qa.mjs';
import scenario from './game/scenarios/housing-crisis.js';
import { selectScene } from './game/scenes.js';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = fileURLToPath(new URL('../../tmp/econ-rpg/', import.meta.url));
await mkdir(out, { recursive: true });
const server = previewServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const key = `mq.econ-rpg.${scenario.id}`, errors = [], external = [], violations = [], passed = [];
let browser;
const check = text => { passed.push(text); console.log(`PASS ${text}`); };
try {
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : { channel: process.env.BROWSER_CHANNEL || 'chrome' }) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    if (!route.request().url().startsWith(origin + '/')) { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(() => {
    window.__networkViolations = [];
    document.addEventListener('securitypolicyviolation', e => window.__networkViolations.push(`${e.violatedDirective}: ${e.blockedURI}`));
  });
  const saved = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  const bounds = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
  const focus = async () => assert.equal(await page.evaluate(() => document.activeElement.id), 'view-title');
  const seenScenes = new Map();
  const sceneCheck = async () => {
    const figure = page.locator('.neighborhood-scene'), img = figure.locator('img');
    const run = await saved(), expected = selectScene(scenario.sceneSet, run);
    assert.equal(await figure.getAttribute('data-scene'), expected.id);
    assert.equal(await img.getAttribute('alt'), expected.alt);
    await img.evaluate(image => image.decode());
    assert.ok(await img.evaluate(image => image.naturalWidth > 0));
    const box = await img.boundingBox(); assert.ok(box.width >= 250 && box.height >= 180);
    if (page.viewportSize().width <= 390) assert.ok(box.height <= 240, 'Phone art has a bounded height for gameplay flow');
    const width = page.viewportSize().width, key = `${width}-${expected.id}`;
    if (!seenScenes.has(key)) {
      await figure.screenshot({ path: path.join(out, `scene-${key}.png`) });
      // Compare the artwork without captions: different labels alone must not pass.
      const pixels = await img.screenshot({ path: path.join(out, `art-only-${key}.png`) });
      seenScenes.set(key, pixels.toString('base64'));
      // Every encountered view must survive a real browser reload, not just a selector unit test.
      if (run) {
        violations.push(...await page.evaluate(() => window.__networkViolations));
        await page.reload();
        await page.getByRole('button', { name: /Resume decision|Review saved outcome/ }).click();
        assert.deepEqual(await saved(), run);
        assert.equal(await page.locator('.neighborhood-scene').getAttribute('data-scene'), expected.id);
        await page.locator('.neighborhood-scene img').evaluate(image => image.decode());
      }
    }
  };
  const choose = async id => { await page.locator(`[data-choice="${id}"]`).click(); await focus(); assert.equal((await saved()).phase, 'consequence'); await sceneCheck(); };
  const next = async () => { await page.getByRole('button', { name: /Continue to next decision|See your outcome/ }).click(); await focus(); };
  const fresh = async () => {
    await page.getByRole('button', { name: 'Start over', exact: true }).click();
    assert.ok(await page.getByRole('dialog').isVisible());
    await page.getByRole('button', { name: 'Clear run and start over' }).click(); await focus();
  };
  await page.goto(origin); await page.getByRole('button', { name: 'Begin scenario' }).waitFor();
  await sceneCheck();
  assert.doesNotMatch(await page.locator('body').innerText(), /Six decisions\. One city|Economics in the making|Take your seat/);
  await bounds(); await page.screenshot({ path: path.join(out, 'intro-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Begin scenario' }).focus(); await page.keyboard.press('Enter'); await focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.choice), 'ceiling');
  assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'solid');
  await page.keyboard.press('Space');
  await focus(); assert.match(await page.locator('#announcement').innerText(), /affordability increased/);
  const snapshot = await saved();
  await page.reload(); await page.getByRole('button', { name: /Resume decision/ }).click();
  assert.deepEqual(await saved(), snapshot); assert.match(await page.locator('#view').innerText(), /Policy consequences/);
  await sceneCheck();
  await next(); assert.match(await page.locator('#view-title').innerText(), /vacant apartment/);
  await choose('registry'); await next();
  assert.match(await page.locator('#view').innerText(), /cannot recover those costs/);
  await page.getByRole('button', { name: 'Start over', exact: true }).click(); await page.keyboard.press('Escape');
  assert.ok(await page.getByRole('dialog').isHidden()); assert.equal((await saved()).history.length, 2);
  check('Keyboard activation, focus, live updates, exact consequence resume, conditional narrative, restart cancellation');
  // Exhaustive first-decision / ending combinations through real controls at all three widths.
  const representatives = summarize(enumerate()).representatives;
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: width === 320 ? 720 : 960 });
    // This isolated browser context owns its test save; leave the user's preview untouched.
    await page.evaluate(k => localStorage.removeItem(k), key); await page.reload();
    await page.getByRole('button', { name: 'Begin scenario' }).waitFor();
    assert.doesNotMatch(await page.locator('body').innerText(), /Multiple endings|10–15 minutes|Make a recommendation, see|There is no answer score|Development · Instructor QA|No gameplay transmission|Each policy changes the conditions/);
    await bounds(); await page.screenshot({ path: path.join(out, `intro-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Begin scenario' }).click(); await focus();
    await page.screenshot({ path: path.join(out, `first-decision-${width}.png`), fullPage: true });
    await choose('ceiling');
    const status = page.locator('#state-panel'), help = status.locator('details'), summary = help.locator('summary');
    assert.equal(await help.getAttribute('open'), null);
    assert.equal(await status.locator('.indicator-list .state-item').count(), 5);
    assert.equal(await status.locator('.indicator-definitions dt').count(), 5);
    assert.ok(await status.locator('.indicator-definitions').isHidden());
    assert.doesNotMatch(await status.locator('.indicator-list').innerText(), /Moderate|Limited|Strong|Weak|Relief for current renters|Access for people/);
    const affordability = status.locator('.state-item').first();
    assert.match(await affordability.locator('.state-value').innerText(), /5 \/ 8/);
    assert.equal(await affordability.locator('.steps .filled').count(), 5);
    assert.match(await affordability.locator('.state-change').innerText(), /↑ \+3/);
    assert.match(await affordability.locator('.state-change .sr-only').textContent(), /Increased by 3 steps after the latest decision/);
    assert.match(await status.locator('.state-item').nth(1).innerText(), /↓ -1/);
    assert.equal(await status.locator('.state-item').nth(3).locator('.state-change').count(), 0);
    assert.ok((await status.boundingBox()).height < 420, 'Collapsed status remains compact at every width');
    await bounds(); await page.screenshot({ path: path.join(out, `consequence-${width}.png`), fullPage: true });
    await summary.focus(); await page.keyboard.press('Enter');
    assert.ok(await status.locator('.indicator-definitions').isVisible());
    assert.equal(await summary.innerText(), 'What do these indicators mean?');
    assert.equal(await summary.evaluate(e => getComputedStyle(e).outlineStyle), 'solid');
    assert.ok((await summary.boundingBox()).height >= 44);
    await bounds(); await page.screenshot({ path: path.join(out, `state-help-${width}.png`), fullPage: true });
    await page.keyboard.press('Space'); assert.equal(await help.getAttribute('open'), null);
    await next(); assert.match(await status.locator('.state-change').first().innerText(), /↑ \+3/);
    await fresh(); assert.equal(await status.locator('.state-change').count(), 0);
    check(`Minimal intro, numeric status, signed latest changes, reset, collapsed definitions and keyboard help at ${width}px`);
    for (const representative of representatives) {
      await fresh();
      await sceneCheck();
      if (width <= 390) {
        // Art may add one small scroll, but must not bury the first decision behind a tall hero.
        const layout = await page.evaluate(() => ({ card: document.querySelector('#view').getBoundingClientRect().top,
          choice: document.querySelector('[data-choice]').getBoundingClientRect().top }));
        assert.ok(layout.choice - layout.card < 800, 'First choice is within a short phone scroll');
      }
      for (const id of representative.choices) {
        await bounds();
        const targets = await page.locator('#view button').evaluateAll(buttons => buttons.map(b => b.getBoundingClientRect().height));
        assert.ok(targets.every(height => height >= 44));
        await choose(id); await bounds(); await next();
      }
      const result = await saved();
      assert.equal(result.endingID, representative.combination.split(' / ')[1]);
      assert.equal(await page.locator('.path > li').count(), 6); assert.equal(await page.locator('.what-ifs > li').count(), 3);
      await bounds();
      await page.locator('.path details summary').first().click(); await bounds();
      if (representative.combination === 'ceiling / protected') await page.screenshot({ path: path.join(out, `debrief-${width}.png`), fullPage: true });
      violations.push(...await page.evaluate(() => window.__networkViolations));
    }
    check(`All ${representatives.length} opening-policy / ending combinations at ${width}px; six decisions, debrief, tap sizes and no overflow`);
    const views = [...seenScenes].filter(([key]) => key.startsWith(`${width}-`));
    assert.equal(views.length, 5, `All five scene states render at ${width}px`);
    assert.equal(new Set(views.map(([,pixels]) => pixels)).size, 5, 'Named SVG views produce distinct images');
  }
  const oldID = (await saved()).runID;
  await page.getByRole('button', { name: 'Replay scenario' }).click();
  assert.notEqual((await saved()).runID, oldID); assert.equal((await saved()).history.length, 0);
  await page.screenshot({ path: path.join(out, 'decision-mobile.png'), fullPage: true });
  await choose('assistance'); await page.screenshot({ path: path.join(out, 'consequence-mobile.png'), fullPage: true }); await next();
  await choose('expand'); await next(); await choose('grants'); await next();
  assert.equal(await page.locator('[data-choice="subsidy"]').count(), 0);
  assert.match(await page.locator('#view').innerText(), /at least 3 steps/);
  await page.reload(); await page.getByRole('button', { name: /Resume decision/ }).click();
  assert.equal(await page.locator('[data-choice="subsidy"]').count(), 0);
  await page.setViewportSize({ width: 390, height: 844 }); await bounds();
  await page.setViewportSize({ width: 640, height: 960 }); await bounds();
  check('Replay identity reset, unavailable subsidy, exact decision resume, 390px and 640px layouts');
  for (const [ids, ending] of [
    [['bridge', 'target', 'phase', 'subsidy', 'taper', 'access'], 'supply'],
    [['ceiling', 'registry', 'inspect', 'subsidy', 'taper', 'protect'], 'protected']
  ]) {
    await fresh();
    for (const id of ids) { await choose(id); await next(); await bounds(); }
    assert.equal((await saved()).endingID, ending);
    assert.match(await page.locator('.path').innerText(), /co-funded|co-funded/i);
  }
  check('Construction subsidy is playable when funded and delivers delayed units on both rent-policy paths');
  await page.evaluate(k => { const value = JSON.parse(localStorage.getItem(k)); value.scenarioVersion = 999; localStorage.setItem(k, JSON.stringify(value)); }, key);
  await page.reload(); await page.getByRole('button', { name: 'Begin scenario' }).waitFor();
  assert.match(await page.locator('#storage-notice').innerText(), /different scenario version/);
  await page.getByRole('button', { name: 'Begin scenario' }).click();
  assert.equal((await saved()).scenarioVersion, 1);
  const blocked = await context.newPage();
  await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked'); } }); });
  await blocked.goto(origin); await blocked.getByRole('button', { name: 'Begin scenario' }).click();
  assert.match(await blocked.locator('#storage-notice').innerText(), /could not be saved/);
  await blocked.locator('[data-choice="ceiling"]').click();
  assert.equal(await blocked.locator('#view-title').innerText(), 'Policy consequences');
  check('Version mismatch fails safely; blocked storage remains playable with clear warning');
  check('Five distinct local scene images without captions at desktop, 390px and 320px; reload restores each view; bounded phone framing and descriptive alternatives');
  // Enforce absence of attempted network activity, including requests stopped by CSP.
  violations.push(...await page.evaluate(() => window.__networkViolations));
  assert.deepEqual(external, []); assert.deepEqual(violations, []); assert.deepEqual(errors, []);
  check('No external requests, CSP violations, console errors or page errors');
  await writeFile(path.join(out, 'browser-results.json'), JSON.stringify({ passed, external, violations, errors }, null, 2));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
