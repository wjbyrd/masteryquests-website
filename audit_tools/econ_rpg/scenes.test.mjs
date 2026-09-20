import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

test('all five scenes reachable across unchanged 200 legal paths and every scene has a local named view and description', () => {
  const result = enumerate(); assert.equal(result.complete.length, 200);
  const reached = new Set(['baseline']);
  for (const completed of result.complete) {
    let run = createRun(scenario);
    for (const choice of completed.history) {
      run = decide(scenario, run, choice.choiceID); reached.add(selected(run));
      run = advance(scenario, run); reached.add(selected(run));
    }
  }
  const svg = readFileSync(new URL('./game/art/neighborhood.svg', import.meta.url), 'utf8');
  assert.equal(reached.size, 5);
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'SVG IDs are unique');
  const sceneIDs = scenario.sceneSet.variants.map(v => v.id);
  assert.equal(sceneIDs.length, new Set(sceneIDs).size, 'Scene IDs are unique');
  assert.equal([...svg.matchAll(/<view\b/g)].length, 5, 'Exactly five visual states');
  for (const match of svg.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), `Local fragment ${match[1]} exists`);
  for (const variant of scenario.sceneSet.variants) {
    assert.ok(reached.has(variant.id)); assert.ok(variant.alt.length > 70); assert.ok(variant.label);
    assert.ok(svg.includes(`<view id="${variant.id}"`));
  }
  assert.doesNotMatch(svg, /<script|<foreignObject|(?:href|src)="(?:https?:|\/\/)/i);
  assert.match(svg, /<use href="#back"/);
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
