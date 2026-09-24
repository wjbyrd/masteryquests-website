import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { previewServer } from './serve.mjs';
import { CONFIG } from './game/games/gdp-live/config.js';
import { AUDITS } from './game/games/gdp-live/scenarios.js';
import * as e from './game/games/gdp-live/engine.js';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = fileURLToPath(new URL('../../tmp/econ-rpg/gdp-live/', import.meta.url));
await mkdir(out, { recursive: true });
const server = previewServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const errors = [], external = [], results = [];
const action = (page, name) => page.locator(`[data-action="${name}"]`).click();
const target = async page => Number(await page.locator('#gdp-number').getAttribute('data-target'));
const settled = page => page.waitForFunction(() => document.querySelector('#gdp-number').dataset.animating === 'false');
async function layout(page, label, screenshot = true) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label}: horizontal overflow`);
  for (const button of await page.locator('button, summary, .button').all()) {
    const b = await button.boundingBox(); if (b) assert.ok(b.height >= 44, `${label}: touch target`);
  }
  if (screenshot) await page.screenshot({ path: `${out}${label}.png`, fullPage: true });
}
async function select(page, postings) {
  for (const b of await page.locator('[data-account][aria-pressed="true"]').all()) await b.click();
  for (const account of e.expectedAccounts(postings)) await page.locator(`[data-account="${account}"]`).click();
}
async function totals(page, accounts) {
  assert.equal(await target(page), e.gdp(accounts));
  for (const key of [...Object.keys(accounts), 'NX']) {
    assert.equal(await page.locator(`[data-component="${key}"] .component-value`).innerText(), (key === 'NX' ? e.nx(accounts) : accounts[key]).toLocaleString('en-US'));
  }
}
async function setup(viewport, seed, reduce = false, blocked = false) {
  const page = await browser.newPage({ viewport, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  page.on('request', r => { if (!r.url().startsWith(origin + '/')) external.push(r.url()); });
  await page.addInitScript(({ seed, blocked }) => {
    const original = crypto.getRandomValues.bind(crypto);
    Object.defineProperty(crypto, 'getRandomValues', { value(array) { if (array instanceof Uint32Array && array.length === 1) { array[0] = seed; return array; } return original(array); } });
    if (blocked) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked for QA'); } });
  }, { seed, blocked });
  await page.goto(origin + '/games/gdp-live/');
  await page.locator('[data-action="start"]').waitFor();
  return page;
}
try {
  const viewports = [{width:1920,height:1080},{width:1366,height:768},{width:900,height:900},{width:390,height:844},{width:320,height:740}];
  for (let index = 0; index < AUDITS.length; index++) {
    const audit = AUDITS[index]; let seed = 1;
    while (e.newRun(seed).auditID !== audit.id) seed++;
    const viewport = viewports[index], reduce = index === 3 || index === 4, label = `${viewport.width}-${audit.id}`;
    const page = await setup(viewport, seed, reduce);
    let s = e.newRun(seed);
    assert.doesNotMatch(await page.locator('body').innerText(), /GDP =/);
    await totals(page, CONFIG.baseline); await layout(page, label + '-opening');
    await page.locator('[data-action="start"]').focus(); await page.keyboard.press('Enter'); s = e.start(s);
    await layout(page, label + '-posting');
    if (viewport.width >= 1100) {
      for (const selector of ['#gdp-number','[data-action="post"]']) {
        const box = await page.locator(selector).boundingBox();
        assert.ok(box.y >= 0 && box.y + box.height <= viewport.height, `${label}: counter and posting controls visible together`);
      }
    }
    assert.equal(await page.locator('[data-action="post"]').isDisabled(), true);
    // Keyboard selection and exclusive Not Counted behavior.
    await page.locator('[data-account="C"]').focus(); await page.keyboard.press('Space');
    await page.locator('[data-account="M"]').click();
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 2);
    await page.locator('[data-account="NC"]').click();
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 1);
    assert.equal(await page.locator('[data-account="NC"]').getAttribute('aria-pressed'), 'true');
    await action(page, 'post'); // Basic scenarios never accept NC.
    s = e.postTransaction({ ...s, selection: ['NC'] });
    await totals(page, CONFIG.baseline); assert.match(await page.locator('.feedback').innerText(), /Adjust the accounts/);
    assert.match(await page.locator('#announcement').textContent(), /Posting attempt 1/);
    assert.equal(await page.locator('.feedback[role="status"]').count(),0,'one live announcement per feedback update');
    for (let n = 0; n < s.deck.length; n++) {
      const scenario = e.currentScenario(s), previous = e.gdp(s.accounts);
      await select(page, scenario.postings);
      await action(page, 'post'); s = e.postTransaction({ ...s, selection: e.expectedAccounts(scenario.postings) });
      await totals(page, s.accounts);
      if (reduce) assert.equal(await page.locator('#gdp-number').getAttribute('data-animating'), 'false');
      else if (n === 0) {
        assert.equal(await page.locator('#gdp-number').getAttribute('data-direction'), 'up');
        assert.equal(await page.locator('#gdp-number').getAttribute('data-animating'), 'true');
      }
      await settled(page);
      if (scenario.phase === 'multi') {
        assert.equal(await target(page), previous); assert.equal(await page.locator('#gdp-number').getAttribute('data-animating'), 'false');
        assert.match(await page.locator('#gdp-change').innerText(), /\$0B/);
        for (const p of scenario.postings) {
          assert.match(await page.locator(`[data-component="${p.account}"]`).getAttribute('class'), /account-changed/);
          assert.equal(await page.locator(`[data-component="${p.account}"] .component-delta`).innerText(), `+$${p.amount}B`);
        }
        if (n === 8) await layout(page, label + '-import');
      }
      await layout(page, label + `-post-${n}`, false);
      await action(page, 'next'); s = e.nextTransaction(s);
    }
    assert.equal(s.stage, 'identity'); assert.match(await page.locator('.identity').innerText(), /GDP = C \+ I \+ G \+ X − M/);
    await action(page, 'audit'); s = e.beginAudit(s); await settled(page); await totals(page, s.accounts);
    await layout(page, label + '-audit');
    await page.locator('[data-audit="meals"]').click(); s = e.identifyAudit(s, 'meals');
    await totals(page, s.accounts); assert.match(await page.locator('.feedback').innerText(), /correctly records/);
    await page.locator('[data-audit="bad"]').click(); s = e.identifyAudit(s, 'bad');
    await select(page, [{account:'X',amount:1}]); await action(page, 'repair');
    s = e.repairAudit({...s, selection:['X']}); await totals(page, s.accounts);
    const row = s.auditRows.find(r => r.id === 'bad'), beforeRepair = e.gdp(s.accounts);
    await select(page, row.correctPostings); await action(page, 'repair');
    s = e.repairAudit({...s, selection:e.expectedAccounts(row.correctPostings)});
    await totals(page, s.accounts);
    if (!reduce && e.gdp(s.accounts) < beforeRepair) {
      assert.equal(await page.locator('#gdp-number').getAttribute('data-direction'), 'down');
      assert.equal(await page.locator('#gdp-number').getAttribute('data-animating'), 'true');
    }
    if (e.gdp(s.accounts) === beforeRepair) assert.equal(await page.locator('#gdp-number').getAttribute('data-animating'), 'false');
    await settled(page); await layout(page, label + '-repaired');
    await action(page, 'shock'); s = e.beginShock(s);
    await layout(page, label + '-shock');
    await page.locator('#shock-value').fill('46'); await page.locator('#shock-value').press('Enter'); s = e.answerShock(s, '46');
    await totals(page, s.accounts); assert.doesNotMatch(await page.locator('.feedback').innerText(), /20/);
    assert.equal(await page.locator('#shock-value').inputValue(), '46');
    await page.locator('#shock-value').fill('$20B'); await page.locator('#shock-value').press('Enter'); s = e.answerShock(s, '$20B');
    await totals(page, s.accounts); await settled(page);
    assert.match(await page.locator('.results').innerText(), /91%/);
    await page.locator('#ledger summary').click();
    assert.equal(await page.locator('#ledger tbody tr').count(), s.ledger.length);
    await layout(page, label + '-complete');
    const records = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('mq.gdp-live.run.v1.')).map(k => JSON.parse(localStorage.getItem(k))));
    assert.equal(records.length, 1); const events = records[0].events;
    for (const name of ['run_start','identity_reveal','audit_presented','audit_corrected','shock_presented','run_complete']) assert.equal(events.filter(ev => ev.action === name).length,1,name);
    assert.equal(events.filter(ev => ev.action === 'post_attempt').length,12);
    assert.equal(events.filter(ev => ev.action === 'transaction_posted').length,11);
    assert.equal(events.filter(ev => ev.action === 'scenario_presented').length,11);
    assert.equal(events.filter(ev => ev.action === 'phase_complete').length,3);
    assert.equal(events.filter(ev => ev.action === 'audit_attempt').length,4);
    assert.equal(events.filter(ev => ev.action === 'shock_attempt').length,2);
    assert.equal(events.at(-1).gdpDelta,20);
    assert.deepEqual(events.map(ev => ev.sequenceNumber), events.map((_,i) => i+1));
    await action(page, 'replay'); await totals(page, CONFIG.baseline);
    assert.match(await page.locator('#ledger summary').innerText(), /0 entries/);
    assert.equal(await page.locator('#ledger').getAttribute('open'), null);
    assert.equal(await page.locator('.feedback').count(),0);
    await action(page, 'start');
    const fresh = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('mq.gdp-live.run.v1.')).map(k => JSON.parse(localStorage.getItem(k)))).then(records => records.find(r => r.runID !== events[0].runID));
    assert.equal(fresh.events.length,2); assert.equal(fresh.events[0].sequenceNumber,1);
    results.push({viewport,seed,audit:audit.id,reducedMotion:reduce,finalGDP:e.gdp(s.accounts),events:events.length});
    await page.close();
  }
  const page = await setup({width:1366,height:768},1,false,true);
  await action(page,'start'); assert.equal(await page.locator('#storage-warning').isVisible(),true);
  const scenario = e.currentScenario(e.newRun(1)); await select(page,scenario.postings); await action(page,'post');
  assert.equal(await page.locator('[data-action="next"]').count(),1);
  await page.emulateMedia({reducedMotion:'reduce'}); await settled(page);
  await page.goto(origin+'/games/'); await page.getByRole('link',{name:'PLAY GAME: GDP Live',exact:true}).click();
  assert.match(page.url(),/\/games\/gdp-live\/$/); await page.close();
  assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
  await writeFile(out+'results.json',JSON.stringify({results,errors,external},null,2));
  console.log(JSON.stringify({results,errors,external},null,2));
} finally { await browser.close(); await new Promise(r => server.close(r)); }
