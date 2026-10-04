import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startCity, fillPlan, getRun, waitMaps} from './browser-helpers.mjs';
import {QUESTIONS} from '../report-learning.js';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = fileURLToPath(new URL('../../../tmp/games-preview/growth-realms/learning-pass/', import.meta.url));
await fs.mkdir(out, {recursive: true});
const browser = await chromium.launch({channel: 'msedge', headless: true});
const errors = [];
const capture = !process.env.NO_SCREENSHOTS;
try {
  const page = await browser.newPage({viewport: {width: 1366, height: 900}, hasTouch: true, reducedMotion: 'reduce'});
  page.on('pageerror', e => errors.push(e.stack));
  page.on('response', r => {if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4178/play/growth-realms/');
  await startCity(page, 'rivermark');
  for (let round = 1; round <= 10; round++) {
    if (round === 3) await page.locator('#accept-challenge').click();
    await fillPlan(page, round < 3 ? [10, 4, 3, 3] : [3, 3, 7, 7]);
    await page.locator('#quick-commit').click();
    await page.locator('#consequences').waitFor({state: 'visible'});
    await waitMaps(page);
    await page.locator('#quick-commit').click();
  }
  await page.locator('#final-report').waitFor({state: 'visible'});
  const before = await getRun(page);
  assert.equal(before.phase, 'finished');
  const order = await page.locator('.chart-panel,.learning-synthesis,.economics,.policy-connection,.concept-check,.ledger').evaluateAll(es => es.map(e => e.className));
  assert.ok(order[0].includes('chart-panel') && order[1].includes('learning-synthesis') && order[2].includes('economics') && order[3].includes('policy-connection') && order[4].includes('concept-check') && order[5].includes('ledger'));
  assert.equal(await page.locator('.concept-grid article').count(), 6);
  assert.match(await page.locator('.run-connection').innerText(), /20 of 40 early development points/);
  assert.equal(await page.locator('.ledger tbody tr').count(), 20);
  assert.deepEqual(await page.locator('.chart-panel polyline').evaluateAll(es => es.map(e => e.getAttribute('points').split(' ').length)), [11, 11]);
  assert.equal(await page.locator('.transfer').count(), 0);
  const shot = async (selector, name) => {if (capture) await page.locator(selector).screenshot({path: out + name + '.png'});};
  // Capture only after the played runtime, ordering and data-preservation checks above.
  await shot('.learning-synthesis', '01-economics-behind-the-race');
  await shot('.growth-level-callout', '02-growth-rate-vs-level');
  await shot('.concept-check', '03-concept-question');
  for (const [index, q] of QUESTIONS.entries()) {
    assert.equal(await page.locator('.question-step').innerText(), `Question ${index + 1} of 4`);
    assert.equal(await page.locator('[data-concept-answer]').count(), 4);
    assert.equal(await page.locator('#check-next').isVisible(), false);
    const orderBefore = await page.locator('[data-concept-answer]').evaluateAll(es => es.map(e => e.dataset.conceptAnswer));
    // Every distractor explains its own misconception and remains retryable.
    for (const [id, , feedback] of q.options.filter(o => o[0] !== q.answer)) {
      await page.locator(`[data-concept-answer="${id}"]`).click();
      assert.equal(await page.locator('#concept-feedback').innerText(), feedback);
      assert.equal(await page.locator('#concept-feedback').getAttribute('data-correct'), 'false');
      assert.equal(await page.locator('#check-progress').innerText(), `${index} / 4 understood`);
      assert.equal(await page.locator('#check-next').isVisible(), false);
      assert.deepEqual(await page.locator('[data-concept-answer]').evaluateAll(es => es.map(e => e.dataset.conceptAnswer)), orderBefore);
    }
    if (!index) await shot('.concept-check', '04-incorrect-feedback');
    await page.locator(`[data-concept-answer="${q.answer}"]`).focus();
    await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
    assert.equal(await page.locator('#concept-feedback').innerText(), q.options.find(o => o[0] === q.answer)[2]);
    assert.equal(await page.locator('#check-progress').innerText(), `${index + 1} / 4 understood`);
    // No double counting or overwriting correct feedback by subsequent answer clicks.
    await page.locator(`[data-concept-answer="${q.answer}"]`).click({force: true});
    await page.locator(`[data-concept-answer="${q.options.find(o => o[0] !== q.answer)[0]}"]`).click({force: true});
    assert.equal(await page.locator('#concept-feedback').getAttribute('data-correct'), 'true');
    assert.equal(await page.locator('#check-progress').innerText(), `${index + 1} / 4 understood`);
    if (!index) await shot('.concept-check', '05-correct-feedback');
    await page.locator('#check-next').click();
    if (index < 3) assert.equal(await page.locator(':focus').getAttribute('id'), 'question-title');
  }
  assert.equal(await page.locator('#check-progress').innerText(), '4 / 4 complete');
  assert.equal(await page.locator('.check-complete li').count(), 4);
  assert.equal(await page.locator('[data-concept-answer]').count(), 0);
  assert.deepEqual(await getRun(page), before);
  await shot('.concept-check', '06-completed-check');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({width, height: 900});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    for (const selector of ['.learning-synthesis', '.growth-level-callout', '.concept-check']) {
      const box = await page.locator(selector).boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width);
    }
  }
  await page.setViewportSize({width: 390, height: 844});
  if (capture) await shot('.learning-synthesis', '07-mobile-synthesis');
  // A replay must initialize an unanswered check, with no carry-over into the next run.
  await startCity(page, 'meridian', '#replay');
  assert.equal(await page.locator('#check-content').count(), 0);
  for (let round = 1; round <= 10; round++) {
    if (round === 3) await page.locator('#accept-challenge').click();
    await fillPlan(page, [2, 3, 8, 7]);
    await page.locator('#quick-commit').click();
    await page.locator('#consequences').waitFor({state: 'visible'});
    await page.locator('#quick-commit').click();
  }
  assert.equal(await page.locator('#check-progress').innerText(), '0 / 4 understood');
  assert.equal(await page.locator('.question-step').innerText(), 'Question 1 of 4');
  assert.equal(await page.locator('#concept-feedback').innerText(), '');
  const mobileAnswers = await page.locator('[data-concept-answer]').evaluateAll(es => es.map(e => ({width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height})));
  assert.ok(mobileAnswers.every(b => b.width >= 44 && b.height >= 44));
  await page.locator('[data-concept-answer=lower-base]').tap();
  assert.equal(await page.locator('#check-progress').innerText(), '1 / 4 understood');
  for (const width of [320, 390]) {
    await page.setViewportSize({width, height: 844});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(out + (capture ? 'audit.json' : 'staged-audit.json'), JSON.stringify({url: page.url(), errors, rounds: before.currentCycle, questions: QUESTIONS.map(q => q.id), runUnchangedByQuiz: true, replayReset: true}, null, 2));
  console.log('PASS: both ten-round runs; chart/synthesis/interpretation order; six visible concepts; four questions, all 12 distractors, feedback/retry/keyboard/completion; no run mutation; replay reset; 320–1440px.');
} finally {await browser.close();}
