import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import scenario from './game/scenarios/housing-crisis.js';
import { createRun, decide, advance } from './game/engine.js';
import { selectScene } from './game/scenes.js';
import { enumerate } from './qa.mjs';
import { loadRun, storageKey } from './game/storage.js';
const step = (run, id) => advance(scenario, decide(scenario, run, id));
const path = ids => ids.reduce(step, createRun(scenario));
const selected = run => selectScene(scenario.sceneSet, run).id;

test('scene selection reflects housing conditions, construction lag and completion without mutating a run', () => {
  const run = createRun(scenario), snapshot = structuredClone(run);
  assert.equal(selected(run), 'baseline'); assert.deepEqual(run, snapshot);
  assert.equal(selectScene(null, run), null);
  assert.equal(selected(path(['ceiling'])), 'pressure');
  assert.equal(selected(path(['ceiling','registry','phase'])), 'maintenance');
  assert.equal(selected(path(['bridge','target','inspect','reform'])), 'construction');
  const renewed = path(['bridge','target','inspect','reform','taper']);
  assert.equal(selected(renewed), 'construction');
  const delivered = decide(scenario, renewed, 'access');
  assert.equal(selected(delivered), 'homes');
  assert.equal(selected(advance(scenario, delivered)), 'homes');
  // Supply encouragement alone is not a completed-home image; weak response is not a "win".
  assert.equal(selected(path(['ceiling','registry','inspect','reform','renew','access'])), 'pressure');
  assert.equal(selected(path(['ceiling','registry','phase','reform','renew','protect'])), 'maintenance');
});

test('all five scenes reachable across unchanged 200 legal paths and resolve to the approved local WebPs', () => {
  const result = enumerate(); assert.equal(result.complete.length, 200);
  const reached = new Set(['baseline']);
  for (const completed of result.complete) {
    let run = createRun(scenario);
    for (const choice of completed.history) {
      run = decide(scenario, run, choice.choiceID); reached.add(selected(run));
      run = advance(scenario, run); reached.add(selected(run));
    }
  }
  assert.equal(reached.size, 5);
  const sceneIDs = scenario.sceneSet.variants.map(v => v.id);
  assert.equal(sceneIDs.length, new Set(sceneIDs).size, 'Scene IDs are unique');
  assert.deepEqual([...sceneIDs].sort(), ['baseline','construction','homes','maintenance','pressure']);
  for (const variant of scenario.sceneSet.variants) {
    assert.ok(reached.has(variant.id)); assert.ok(variant.alt.length > 70); assert.ok(variant.label);
    assert.equal(variant.src, `./art/scenes/${variant.id}.webp`);
    const data = readFileSync(new URL(variant.src, new URL('./game/', import.meta.url)));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
  }
  assert.equal(scenario.sceneSet.width, 1448); assert.equal(scenario.sceneSet.height, 1086);
  function inspect(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
      if (entry.isDirectory()) inspect(file);
      else if (/\.(js|css|html)$/.test(entry.name)) assert.doesNotMatch(readFileSync(file, 'utf8'), /neighborhood\.svg|art\/source\/|\.png\b/);
    }
  }
  inspect(new URL('./game/', import.meta.url));
});

test('supplied PNG masters and runtime WebPs remain byte-for-byte unchanged', () => {
  const manifest = JSON.parse(readFileSync(new URL('./art/approved-assets.json', import.meta.url), 'utf8'));
  assert.equal(manifest.filter(a => a.path.startsWith('art/source/') && a.path.endsWith('.png')).length, 5);
  assert.equal(manifest.filter(a => a.path.startsWith('game/art/scenes/') && a.path.endsWith('.webp')).length, 5);
  for (const asset of manifest) {
    const data = readFileSync(new URL(asset.path, import.meta.url));
    assert.equal(data.length, asset.bytes, asset.path);
    assert.equal(createHash('sha256').update(data).digest('hex'), asset.sha256, asset.path);
  }
});

test('pre-refinement version-1 saves remain byte-equivalent after replay', () => {
  // Frozen from all 200 pre-refinement v1 paths, checked against commit 5508e8e.
  // Detect changes to states, history text, routing, ending IDs or serialized shape.
  const completeRuns = enumerate().complete;
  assert.equal(createHash('sha256').update(JSON.stringify(completeRuns)).digest('hex'),
    'f5eb10bba272b655a3253ba355b801b0aa7e445147ee4a0bed5ad4ec77cb1d6e');
  for(const complete of completeRuns) {
    const raw=JSON.stringify(complete);
    const storage={getItem:key=>key===storageKey(scenario)?raw:null};
    assert.deepEqual(loadRun(storage,scenario).run,complete);
  }
});
