import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { previewServer } from './serve.mjs';
import { enumerate } from './qa.mjs';
import { audit } from './gameday-rivals-qa.mjs';
import { scenarios } from './game/scenarios/registry.js';
import { followupFor } from './game/instructional-followup.js';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = fileURLToPath(new URL('../../tmp/econ-rpg/instructional-followup/', import.meta.url));
await mkdir(out, { recursive: true });
const fixtures = [];
for (const id of ['housing-crisis','main-attraction','ppf','megastar-mania']) {
  const seen = new Set();
  for (const run of enumerate(scenarios[id]).complete) {
    const model = followupFor(id, run), variant = `${run.endingID}-${model.graph?.status || model.graph?.point || ''}`;
    if (seen.has(variant)) continue;
    seen.add(variant); fixtures.push({ id, run, variant });
  }
}
for (const { run } of audit().representatives) fixtures.push({ id: 'gameday-rivals', run, variant: run.classification });
const server = previewServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage(), errors = [], checked = [];
page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
async function resume(id) {
  await page.getByRole('button', { name: id === 'gameday-rivals' ? 'Review Saved Season' : 'Review saved outcome', exact: true }).click();
  await page.locator('.instructional-followup').waitFor();
}
try {
  for (const width of [1280,768,390,320]) {
    await page.setViewportSize({ width, height: 900 });
    // Desktop and smallest mobile exercise every ending/model combination.
    const subset = [1280,320].includes(width) ? fixtures : fixtures.filter((f, i, all) => all.findIndex(v => v.id === f.id) === i);
    for (const { id, run, variant } of subset) {
      await page.goto(`${origin}/?scenario=${id}`);
      const key = id === 'gameday-rivals' ? 'gamedayRivalsSave_v1' : `mq.econ-rpg.${id}`;
      const saved = id === 'gameday-rivals' ? { ...run, phase: 'reveal' } : run;
      await page.evaluate(({key, saved}) => localStorage.setItem(key, JSON.stringify(saved)), {key, saved});
      await page.reload(); await resume(id);
      const model = followupFor(id, run);
      assert.equal(await page.locator('#followup-title').textContent(), model.title);
      assert.ok((await page.locator('.instructional-followup').textContent()).includes(model.intro));
      for (const part of scenarios[id].debrief || []) assert.ok((await page.locator('#view').textContent()).includes(part.text));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${id}/${variant}/${width}: page overflow`);
      for (const b of await page.locator('.followup-options button').all()) assert.ok((await b.boundingBox()).height >= 44);
      if (model.graph) {
        const svg = page.locator('.followup-graph svg');
        assert.ok((await svg.locator('desc').textContent()).includes(model.graph.description));
        assert.ok((await svg.boundingBox()).width <= (await page.locator('.instructional-followup').boundingBox()).width + 1);
        if (id === 'ppf') assert.equal(await page.locator('.followup-graph tbody tr').count(), 3);
      }
      if (width === 1280 || width === 320) await page.locator('.instructional-followup').screenshot({ path: `${out}/${id}-${variant}-${width}.png` });
      for (const task of model.questions) {
        assert.equal(await page.locator('.followup-stage').getAttribute('data-question'), task.id);
        for (let i = 0; i < task.options.length; i++) if (i !== task.correct) {
          await page.locator('.followup-options button').nth(i).click();
          assert.ok((await page.locator('.followup-feedback').textContent()).includes(task.options[i].feedback));
          assert.equal(await page.locator('.followup-stage .primary').isVisible(), false);
        }
        await page.locator('.followup-options button').nth(task.correct).click();
        assert.ok((await page.locator('.followup-feedback').textContent()).includes(task.explanation));
        const correctText = await page.locator('.followup-feedback').textContent();
        await page.locator('.followup-options button').nth((task.correct + 1) % 3).evaluate(el => el.click());
        assert.equal(await page.locator('.followup-feedback').textContent(), correctText, 'answered task stays resolved');
        await page.locator('.followup-stage .primary').click();
        assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H4');
      }
      assert.equal(await page.locator('.instructional-followup').getAttribute('data-complete'), 'true');
      assert.equal(await page.evaluate(key => localStorage.getItem(key), key), JSON.stringify(saved), 'applications do not alter saved economic state');
      await page.reload(); await resume(id);
      assert.equal(await page.locator('.followup-stage').getAttribute('data-question'), model.questions[0].id);
      assert.equal(await page.locator('.followup-feedback').textContent(), '');
      await page.locator('#restart').click(); await page.locator('#confirm-restart').click();
      assert.equal(await page.locator('.instructional-followup').count(), 0);
      await page.getByRole('link', { name: 'RETURN TO GAMES', exact: true }).click();
      assert.equal(new URL(page.url()).pathname, '/games/');
      checked.push({ id, variant, width });
    }
    console.log(`${width}px: ${subset.length} ending/model variants, corrections, reload, restart and return passed`);
  }
  assert.deepEqual(errors, []);
  await writeFile(`${out}/results.json`, JSON.stringify({ checked, errors }, null, 2));
} finally { await browser.close(); await new Promise(r => server.close(r)); }
