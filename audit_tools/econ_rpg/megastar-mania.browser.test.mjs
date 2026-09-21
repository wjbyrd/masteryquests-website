import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { previewServer } from './serve.mjs';
import scenario from './game/scenarios/megastar-mania.js';
import ppf from './game/scenarios/ppf.js';
import attraction from './game/scenarios/main-attraction.js';
import housing from './game/scenarios/housing-crisis.js';
import { availableChoices } from './game/engine.js';
import { selectScene } from './game/scenes.js';
import { ticketMarket } from './game/scenarios/megastar-mania-market.js';
import { storageKey } from './game/storage.js';
import { coverage } from './megastar-mania-qa.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = fileURLToPath(new URL('../../tmp/econ-rpg/megastar-mania/', import.meta.url));
await mkdir(out, { recursive: true });
const server = previewServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`, url = `${origin}/?scenario=megastar-mania`;
const key = storageKey(scenario), homeKey = storageKey(housing), parkKey = storageKey(attraction), ppfKey = storageKey(ppf), errors = [], external = [], violations = [], passed = [], images = new Set();
const manual = coverage().selected, seen = new Set(), endings = new Set();
let browser;
const check = message => { passed.push(message); console.log(`PASS ${message}`); };
try {
  browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    if (!route.request().url().startsWith(origin + '/')) { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if (request.resourceType() === 'image') images.add(new URL(request.url()).pathname); });
  await page.addInitScript(() => {
    window.__violations = [];
    document.addEventListener('securitypolicyviolation', e => window.__violations.push(`${e.violatedDirective}: ${e.blockedURI}`));
  });
  const saved = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  const housingBytes = () => page.evaluate(keys => JSON.stringify(keys.map(k => localStorage.getItem(k))), [homeKey,parkKey,ppfKey]);
  const focus = async () => assert.equal(await page.evaluate(() => document.activeElement.id), 'view-title');
  const bounds = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
  const panel = async () => {
    const run = await saved();
    assert.equal(await page.locator('#scenario-title').innerText(), scenario.title);
    assert.equal(await page.locator('#state-title').innerText(), 'Tour conditions');
    assert.equal(await page.locator('.indicator-list .state-item').count(), 5);
    for (const [index, [id, spec]] of Object.entries(Object.entries(scenario.state))) {
      const row = page.locator('.indicator-list .state-item').nth(Number(index));
      assert.equal(await row.locator('dt').innerText(), spec.label);
      const value = run?.state[id] ?? spec.initial;
      assert.match(await row.locator('.state-value').innerText(), new RegExp(`${value} / 8`));
      assert.equal(await row.locator('.steps .filled').count(), value);
      const last = run?.history.at(-1), delta = last ? last.after[id] - last.before[id] : 0;
      assert.equal(await row.locator('.state-change').count(), delta ? 1 : 0);
      if (delta) assert.match(await row.locator('.state-change').innerText(), new RegExp(delta > 0 ? `↑ \\+${delta}` : `↓ ${delta}`));
    }
  };
  const scene = async () => {
    const run = await saved(), expected = selectScene(scenario.sceneSet, run), figure = page.locator('.neighborhood-scene'), img = figure.locator('img');
    assert.equal(await figure.getAttribute('data-scene'), expected.id);
    assert.equal(await figure.locator('figcaption').innerText(), expected.label);
    assert.equal(await img.getAttribute('src'), expected.src); assert.equal(await img.getAttribute('alt'), expected.alt);
    await img.evaluate(image => image.decode());
    assert.deepEqual(await img.evaluate(image => [image.naturalWidth, image.naturalHeight]), [1448,1086]);
    assert.equal(await img.evaluate(image => getComputedStyle(image).objectFit), 'contain');
    const box = await img.boundingBox(); assert.ok(Math.abs(box.width / box.height - 4/3) < .005);
    const sceneKey = `${page.viewportSize().width}-${expected.id}`;
    if (!seen.has(sceneKey)) {
      seen.add(sceneKey);
      await figure.screenshot({ path: `${out}/scene-${sceneKey}.png` });
      await img.screenshot({ path: `${out}/art-only-${sceneKey}.png` });
      if (run) {
        violations.push(...await page.evaluate(() => window.__violations));
        await page.reload(); await page.getByRole('button', { name: /Resume decision|Review saved outcome/ }).click();
        assert.deepEqual(await saved(), run);
        assert.equal(await figure.getAttribute('data-scene'), expected.id);
        await img.evaluate(image => image.decode()); await panel();
      }
    }
    await bounds();
  };
  const restart = async () => {
    await page.getByRole('button', { name: 'Start over', exact: true }).click();
    await page.getByRole('button', { name: 'Clear run and start over' }).click(); await focus();
  };
  const choose = async id => {
    const before = await saved();
    assert.deepEqual(await page.locator('[data-choice]').evaluateAll(nodes => nodes.map(n => n.dataset.choice)), availableChoices(scenario, before).map(c => c.id));
    await page.locator(`[data-choice="${id}"]`).click(); await focus();
    assert.equal((await saved()).phase, 'consequence');
    assert.ok((await page.locator('#announcement').innerText()).length > 0);
    await panel(); await scene();
    if (before.nodeID === 'expansion') assert.equal((await page.locator('.neighborhood-scene').getAttribute('data-scene')) === 'expanded-tour', id === 'dates');
  };
  const next = async () => {
    await page.getByRole('button', { name: /Continue to next decision|See your outcome/ }).click(); await focus();
    const run = await saved();
    if (run.phase === 'decision' && run.nodeID === 'illness') {
      const market = ticketMarket(run).status;
      assert.equal(await page.locator('.neighborhood-scene').getAttribute('data-scene'), market === 'balanced' ? 'baseline' : market);
      await scene();
    }
  };

  // All four scenarios share an origin, but must never share a save key.
  await page.goto(origin); await page.getByRole('button', { name: 'Begin scenario' }).click();
  await page.locator('[data-choice="ceiling"]').click();
  await page.goto(`${origin}/?scenario=main-attraction`); await page.getByRole('button', { name: 'Begin scenario' }).click();
  await page.locator('[data-choice="raise"]').click();
  await page.goto(`${origin}/?scenario=ppf`); await page.getByRole('button', { name: 'Begin scenario' }).click();
  await page.locator('[data-choice="balanced"]').click(); const originalHousing = await housingBytes();
  await page.goto(url); await page.getByRole('button', { name: 'Begin scenario' }).waitFor();
  assert.equal(await page.title(), `${scenario.title} · Mastery Quests`);
  await page.getByRole('button', { name: 'Begin scenario' }).focus(); await page.keyboard.press('Enter'); await focus();
  await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement.dataset.choice), 'premium');
  assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'solid');
  await page.keyboard.press('Space'); await focus(); assert.match(await page.locator('#announcement').innerText(), /Tour Revenue decreased/);
  const initial = await saved(); await page.reload(); await page.getByRole('button', { name: /Resume decision/ }).click();
  assert.deepEqual(await saved(), initial); await panel();
  await page.getByRole('button', { name: 'Start over', exact: true }).click(); await page.keyboard.press('Escape');
  assert.deepEqual(await saved(), initial);
  check('Private routing, keyboard activation/focus/live announcements and exact consequence resume');

  for (const width of [1280,390,320]) {
    await page.setViewportSize({ width, height: width === 320 ? 720 : 960 });
    violations.push(...await page.evaluate(() => window.__violations));
    await page.evaluate(k => localStorage.removeItem(k), key); await page.reload();
    await page.getByRole('button', { name: 'Begin scenario' }).waitFor(); await scene(); await panel();
    await page.screenshot({ path: `${out}/intro-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Begin scenario' }).click(); await focus();
    for (const [index, row] of manual.entries()) {
      await restart();
      if (!index) {
        await page.screenshot({ path: `${out}/first-decision-${width}.png`, fullPage: true });
        if (width <= 390) assert.ok(await page.evaluate(() => document.querySelector('[data-choice]').getBoundingClientRect().top - document.querySelector('#view').getBoundingClientRect().top < 800));
      }
      for (const [step, entry] of row.run.history.entries()) {
        assert.ok((await page.locator('#view button').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().height))).every(height => height >= 44));
        await choose(entry.choiceID);
        if (!index && !step) {
          await page.screenshot({ path: `${out}/consequence-${width}.png`, fullPage: true });
          const help = page.locator('#state-panel details'); assert.equal(await help.getAttribute('open'), null);
          await help.locator('summary').focus(); await page.keyboard.press('Enter');
          assert.equal(await help.locator('.indicator-definitions dt').count(), 5);
          assert.ok(await help.locator('.indicator-definitions').isVisible());
          await bounds(); await page.screenshot({ path: `${out}/help-${width}.png`, fullPage: true });
          await page.keyboard.press('Space'); assert.equal(await help.getAttribute('open'), null);
        }
        await next(); await panel(); await bounds();
      }
      const actual = await saved(); assert.equal(actual.endingID, row.run.endingID);
      assert.deepEqual(actual.state, row.run.state); assert.deepEqual(actual.history, row.run.history);
      assert.equal(await page.locator('.path > li').count(), 6); assert.equal(await page.locator('.what-ifs > li').count(), 3);
      await page.locator('.path details summary').first().click(); await bounds();
      const endKey = `${width}-${actual.endingID}`;
      if (!endings.has(endKey)) { endings.add(endKey); await page.screenshot({ path: `${out}/debrief-${endKey}.png`, fullPage: true }); }
      assert.equal(await housingBytes(), originalHousing);
    }
    assert.equal([...seen].filter(k => k.startsWith(`${width}-`)).length, 7);
    assert.equal([...endings].filter(k => k.startsWith(`${width}-`)).length, 7);
    check(`${manual.length} complete coverage runs at ${width}px: seven scenes, seven endings, date-map sequencing, conditional consequences, panel values, debrief and no overflow`);
  }
  const parkEnding = await saved();
  await page.goto(`${origin}/?scenario=housing-crisis`); await page.getByRole('button', { name: /Resume decision/ }).click();
  assert.equal(await page.locator('#scenario-title').innerText(), 'Room to Stay'); assert.equal(await housingBytes(), originalHousing);
  await page.goto(url); await page.getByRole('button', { name: 'Review saved outcome' }).click();
  assert.deepEqual(await saved(), parkEnding);
  await page.getByRole('button', { name: 'Replay scenario' }).click();
  assert.notEqual((await saved()).runID, parkEnding.runID); assert.equal((await saved()).history.length, 0);
  assert.equal(await page.locator('.neighborhood-scene').getAttribute('data-scene'), 'baseline');
  assert.equal(await housingBytes(), originalHousing);
  await choose('premium'); await next();
  assert.equal((await saved()).nodeID, 'breakout-rebuild');
  const branched = await saved(); await page.reload(); await page.getByRole('button', { name: /Resume decision/ }).click();
  assert.deepEqual(await saved(), branched);
  await choose('aggressive'); await next(); await choose('dates'); await next(); await choose('cancel');
  assert.equal(await page.locator('.neighborhood-scene').getAttribute('data-scene'), 'supply-shock');
  const remaining = (await saved()).state.supply; await next();
  assert.notEqual(await page.locator('.neighborhood-scene').getAttribute('data-scene'), 'supply-shock');
  assert.equal((await saved()).state.supply, remaining);
  check('Cross-scenario saves stay isolated; ending review, replay and conditional decision resume are exact');
  await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.scenarioVersion = 999; localStorage.setItem(k, JSON.stringify(s)); }, key);
  await page.reload(); await page.getByRole('button', { name: 'Begin scenario' }).waitFor();
  assert.match(await page.locator('#storage-notice').innerText(), /different scenario version/); assert.equal(await housingBytes(), originalHousing);
  const blocked = await context.newPage();
  await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked'); } }));
  await blocked.goto(url); await blocked.getByRole('button', { name: 'Begin scenario' }).click(); await blocked.locator('[data-choice="premium"]').click();
  assert.match(await blocked.locator('#storage-notice').innerText(), /could not be saved/);
  assert.equal(await blocked.locator('#view-title').innerText(), 'Tour consequences'); await blocked.close();
  check('Version mismatch fails safely and blocked storage remains playable');
  for (const v of scenario.sceneSet.variants) {
    const response = await context.request.get(`${origin}/${v.src.slice(2)}`);
    assert.equal(response.status(), 200); assert.match(response.headers()['content-type'], /image\/webp/);
    assert.equal((await context.request.get(`${origin}/art/source/megastar-mania/megastar-${v.id}.png`)).status(), 404);
    assert.equal((await context.request.get(`${origin}/art/sources/megastar-${v.id}.png`)).status(), 404);
  }
  const allowedImages = new Set([...scenario.sceneSet.variants, ...housing.sceneSet.variants, ...attraction.sceneSet.variants, ...ppf.sceneSet.variants].map(v => v.src.slice(1)));
  for (const image of images) assert.ok(allowedImages.has(image));
  assert.equal([...images].filter(p => p.includes('/megastar-mania/')).length, 7);
  violations.push(...await page.evaluate(() => window.__violations));
  assert.deepEqual(external, []); assert.deepEqual(errors, []); assert.deepEqual(violations, []);
  check('Approved local WebPs only; source masters inaccessible; no external requests, CSP violations or runtime errors');
  await writeFile(`${out}/browser-results.json`, JSON.stringify({ passed, completeRuns: manual.length*3, scenes: [...seen], endings: [...endings], images: [...images], external, violations, errors }, null, 2));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
