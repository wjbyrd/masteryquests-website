import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import scenario from './game/scenarios/main-attraction.js';
import housing from './game/scenarios/housing-crisis.js';
import { scenarios, scenarioFor } from './game/scenarios/registry.js';
import { createRun, decide, advance, availableChoices, validateScenario } from './game/engine.js';
import { loadRun, saveRun, clearRun, storageKey } from './game/storage.js';
import { selectScene } from './game/scenes.js';
import { coverage, trace } from './main-attraction-qa.mjs';
const data = coverage();
const memory = () => { const map = new Map(); return { getItem: k => map.get(k) ?? null, setItem: (k,v) => map.set(k,v), removeItem: k => map.delete(k) }; };

test('main attraction validates; all legal paths have six decisions, 2–3 available choices, bounded effects and complete coverage', () => {
  assert.equal(validateScenario(scenario), true);
  assert.equal(data.result.unreachableNodes.length, 0); assert.equal(data.result.unreachableEndings.length, 0);
  assert.equal(data.result.nodes.length, 7); assert.equal(data.result.choices.length, 21);
  assert.equal(Object.keys(data.summary.endings).length, 5);
  const scenes = new Set(), gateStates = new Set();
  for (const run of data.result.complete) {
    assert.equal(run.history.length, 6);
    assert.equal(new Set(run.history.map(h => h.nodeID)).size, 6);
    const row = trace(run.history.map(h => h.choiceID));
    row.scenes.forEach(s => scenes.add(s)); row.features.filter(f => f.startsWith('gate:')).forEach(f => gateStates.add(f));
    for (const phase of row.phases) {
      if (phase.phase === 'decision') assert.ok([2,3].includes(availableChoices(scenario, phase).length));
      for (const value of Object.values(phase.state)) assert.ok(Number.isInteger(value) && value >= 0 && value <= 8);
    }
  }
  assert.deepEqual([...scenes].sort(), ['baseline','construction','crowded','maintenance','premium','upgraded']);
  assert.equal(gateStates.size, 6, 'Every conditional choice is both available and unavailable');
});

test('different paths preserve distinct tradeoff profiles without a common maximizing route', () => {
  const runs = data.result.complete, keys = Object.keys(scenario.state);
  const maxima = Object.fromEntries(keys.map(k => [k, Math.max(...runs.map(r => r.state[k]))]));
  assert.ok(!runs.some(r => keys.every(k => r.state[k] === maxima[k])));
  const premium = runs.find(r => r.endingID === 'premium'), crowded = runs.find(r => r.endingID === 'crowded');
  assert.ok(premium.state.experience > crowded.state.experience);
  assert.ok(crowded.state.access > premium.state.access);
  assert.doesNotMatch(JSON.stringify(scenario.nodes), /Correct answer|Incorrect answer|Good decision|Bad decision|Optimal choice|Wrong strategy/);
});

test('branching, segmentation outcomes, maintenance severity and funding gates are consequential', () => {
  assert.equal(trace(['lower']).run.nodeID, 'busy-midway'); assert.equal(trace(['raise']).run.nodeID, 'steady-midway');
  const raised = trace(['raise','reserve','members']).run.history.at(-1);
  const held = trace(['hold','reserve','members']).run.history.at(-1);
  assert.equal(raised.after.earnings - raised.before.earnings, 1);
  assert.equal(held.after.earnings - held.before.earnings, 0);
  assert.notEqual(raised.consequence, held.consequence);
  const low = trace(['lower','reserve','members']).run;
  assert.ok(!availableChoices(scenario, low).some(c => c.id === 'overhaul'));
  assert.throws(() => decide(scenario, low, 'overhaul'));
  const spent = trace(['lower','reserve','single','overhaul']).run;
  assert.ok(!availableChoices(scenario, spent).some(c => c.id === 'expand'));
  const exhausted = trace(['lower','reserve','single','overhaul','throughput']).run;
  assert.equal(exhausted.state.earnings, 0);
  assert.throws(() => decide(scenario, exhausted, 'differentiate'));
});

test('construction is not usable capacity; completion occurs once and deferred repairs retain precedence', () => {
  const before = trace(['raise','priority','dates','partial']).run;
  const building = decide(scenario, before, 'expand');
  assert.equal(building.state.capacity, before.state.capacity);
  assert.equal(selectScene(scenario.sceneSet, building).id, 'construction');
  const review = advance(scenario, building), complete = decide(scenario, review, 'broaden');
  assert.equal(complete.state.capacity, Math.min(8, review.state.capacity + 3));
  assert.equal(selectScene(scenario.sceneSet, complete).id, 'upgraded');
  assert.deepEqual(advance(scenario, complete).state, complete.state);
  const worn = trace(['lower','open','members','defer','expand','course']).run;
  assert.equal(selectScene(scenario.sceneSet, worn).id, 'maintenance');
  assert.equal(worn.state.capacity, 5);
});

test('every phase of every park path resumes exactly; scenarios, restart, replay and versions remain isolated', () => {
  const storage = memory();
  const home = decide(housing, createRun(housing), 'ceiling'); saveRun(storage, housing, home);
  for (const run of data.result.complete) {
    for (const phase of trace(run.history.map(h => h.choiceID)).phases) {
      assert.equal(saveRun(storage, scenario, phase), true);
      assert.deepEqual(loadRun(storage, scenario).run, phase);
    }
  }
  assert.deepEqual(loadRun(storage, housing).run, home);
  clearRun(storage, scenario); assert.equal(loadRun(storage, scenario).run, null);
  assert.deepEqual(loadRun(storage, housing).run, home);
  const first = createRun(scenario), second = createRun(scenario);
  assert.notEqual(first.runID, second.runID); assert.deepEqual(first.state, second.state); assert.deepEqual(second.history, []);
  storage.setItem(storageKey(scenario), JSON.stringify({ ...first, scenarioVersion: 999 }));
  assert.equal(loadRun(storage, scenario).reason, 'version');
  assert.notEqual(storageKey(scenario), storageKey(housing));
});

test('private registry preserves default/unknown routing and does not mistake inherited object names for scenarios', () => {
  for (const query of ['', '?view=approved-art','?scenario=missing','?scenario=toString','?scenario=__proto__']) assert.equal(scenarioFor(query), housing);
  assert.equal(scenarioFor('?scenario=housing-crisis'), housing);
  assert.equal(scenarioFor('?scenario=main-attraction'), scenario); assert.equal(Object.keys(scenarios).length, 4);
});

test('six approved park masters/WebPs retain their original bytes and unique namespaced mappings', () => {
  const manifest = JSON.parse(readFileSync(new URL('./art/main-attraction-assets.json', import.meta.url), 'utf8'));
  assert.equal(manifest.length, 12); assert.equal(new Set(manifest.map(a => a.path)).size, 12);
  for (const asset of manifest) {
    const bytes = readFileSync(new URL(asset.path, import.meta.url));
    assert.equal(bytes.length, asset.bytes); assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    assert.equal(asset.width, 1448); assert.equal(asset.height, 1086);
  }
  assert.equal(new Set(scenario.sceneSet.variants.map(v => v.id)).size, 6);
  for (const v of scenario.sceneSet.variants) {
    assert.equal(v.src, `./art/scenes/main-attraction/${v.id}.webp`);
    assert.ok(manifest.some(a => `./${a.path.slice(5)}` === v.src)); assert.ok(v.alt.length > 70);
  }
});

test('Room to Stay data, artwork and shared transition/storage/UI implementations are untouched', () => {
  execFileSync('git', ['diff','--exit-code','HEAD','--','audit_tools/econ_rpg/game/engine.js','audit_tools/econ_rpg/game/storage.js','audit_tools/econ_rpg/game/ui.js','audit_tools/econ_rpg/game/rpg.css','audit_tools/econ_rpg/game/scenes.js','audit_tools/econ_rpg/game/scenarios/housing-crisis.js','audit_tools/econ_rpg/game/scenarios/housing-scenes.js','audit_tools/econ_rpg/art/approved-assets.json'], { stdio: 'pipe' });
});
