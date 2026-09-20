import test from 'node:test';
import assert from 'node:assert/strict';
import scenario from './game/scenarios/housing-crisis.js';
import { createRun, decide, advance, availableChoices, matches, validateScenario, nodeContent, transitionEvent } from './game/engine.js';
import { loadRun, saveRun, clearRun, storageKey } from './game/storage.js';
import { enumerate } from './qa.mjs';
const copy = () => structuredClone(scenario);
const fakeStorage = () => { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) }; };
const follow = ids => ids.reduce((run, id) => advance(scenario, decide(scenario, run, id)), createRun(scenario));
test('schema is valid; rejects duplicate IDs, missing targets, invalid effects, conditions, cycles, and orphans', () => {
  assert.equal(validateScenario(scenario), true);
  for (const mutate of [
    s => s.nodes.push(structuredClone(s.nodes[0])),
    s => s.nodes[0].choices.push(structuredClone(s.nodes[0].choices[0])),
    s => s.nodes[0].choices[0].next = 'missing',
    s => s.nodes[0].choices[0].effects.bogus = 1,
    s => s.nodes[0].choices[0].effects.relief = 1.5,
    s => s.nodes[0].choices[0].when = { chosen: 'missing.choice' },
    s => s.nodes[0].choices[0].next = 'response',
    s => s.nodes.push({ ...structuredClone(s.nodes[1]), id: 'orphan' }),
    s => s.endings.at(-1).when = { state: 'budget', op: 'gte', value: 0 },
    s => s.nodes[0].scene = [{ type: 'html', text: '<script>' }]
  ]) { const s = copy(); mutate(s); assert.throws(() => validateScenario(s)); }
});
test('enumerates every legal path: six decisions, all nodes, choices and five endings reached', () => {
  const result = enumerate();
  assert.deepEqual(result.unreachableNodes, []); assert.deepEqual(result.unreachableEndings, []);
  assert.equal(result.choices.length, scenario.nodes.reduce((n, node) => n + node.choices.length, 0));
  assert.ok(result.complete.length > 100);
  for (const run of result.complete) {
    assert.equal(run.history.length, 6);
    assert.equal(new Set(run.history.map(h => h.nodeID)).size, 6);
    for (const [id, value] of Object.entries(run.state)) assert.ok(Number.isInteger(value) && value >= scenario.state[id].min && value <= scenario.state[id].max);
  }
});
test('path dependence changes routes, availability, prose, severity and endings', () => {
  const rent = follow(['ceiling', 'registry']), aid = follow(['assistance', 'expand']);
  assert.equal(rent.history[1].nodeID, 'allocation'); assert.equal(aid.history[1].nodeID, 'bridge');
  assert.notDeepEqual(nodeContent(scenario, rent).scene, nodeContent(scenario, aid).scene);
  const rentRepair = decide(scenario, rent, 'inspect'), aidRepair = decide(scenario, aid, 'inspect');
  assert.equal(rentRepair.state.availability, rent.state.availability - 1);
  assert.equal(aidRepair.state.availability, aid.state.availability);
  const poor = follow(['assistance', 'expand', 'grants']);
  assert.ok(!availableChoices(scenario, poor).some(c => c.id === 'subsidy'));
  assert.throws(() => decide(scenario, poor, 'subsidy'));
  const funded = follow(['bridge', 'target', 'phase']);
  assert.ok(availableChoices(scenario, funded).some(c => c.id === 'subsidy'));
});
test('conditions, post-choice conditional routes, structured tables and images are reusable', () => {
  const s = copy();
  s.nodes[0].choices[0].next = [{ when: { state: 'relief', op: 'gte', value: 5 }, target: 'allocation' }, { target: 'bridge' }];
  s.nodes[0].scene.push({ type: 'table', caption: 'Illustrative units', headers: ['Item', 'Value'], rows: [['Homes', '10']] }, { type: 'image', src: './chart.svg', alt: 'Supply curve', description: 'An accessible description of the relationships.' });
  assert.ok(validateScenario(s));
  assert.equal(advance(s, decide(s, createRun(s), 'ceiling')).nodeID, 'allocation');
  assert.equal(matches({ all: [{ not: { chosen: 'response.ceiling' } }, { any: [{ state: 'budget', op: 'eq', value: 7 }] }] }, createRun(s)), true);
});
test('transitions are immutable and phase guarded; hook returns a detached snapshot', () => {
  const run = createRun(scenario), before = structuredClone(run);
  const next = decide(scenario, run, 'ceiling'); assert.deepEqual(run, before);
  assert.throws(() => decide(scenario, next, 'ceiling')); assert.throws(() => advance(scenario, run));
  const event = transitionEvent('decision_selected', next, 'ceiling', run.startedAt + 15);
  assert.equal(event.elapsedMs, 15); event.state.budget = -999; assert.equal(next.state.budget, 7);
});
test('save/resume restores exact state in every phase of every path', () => {
  const storage = fakeStorage();
  for (const completed of enumerate().complete) {
    let run = createRun(scenario, { runID: 'roundtrip', startedAt: 1234 });
    saveRun(storage, scenario, run); assert.deepEqual(loadRun(storage, scenario).run, run);
    for (const decision of completed.history) {
      run = decide(scenario, run, decision.choiceID);
      saveRun(storage, scenario, run); assert.deepEqual(loadRun(storage, scenario).run, run);
      run = advance(scenario, run);
      saveRun(storage, scenario, run); assert.deepEqual(loadRun(storage, scenario).run, run);
    }
  }
});
test('restart clears only this scenario; replay creates a fresh independent state', () => {
  const storage = fakeStorage(), old = follow(['ceiling']);
  storage.setItem('unrelated-game', 'preserve'); saveRun(storage, scenario, old);
  assert.ok(clearRun(storage, scenario)); assert.equal(loadRun(storage, scenario).run, null);
  assert.equal(storage.getItem('unrelated-game'), 'preserve');
  const fresh = createRun(scenario); assert.notEqual(fresh.runID, old.runID); assert.equal(fresh.history.length, 0);
  assert.equal(fresh.state.relief, 2); fresh.state.relief = 8; assert.equal(createRun(scenario).state.relief, 2);
});
test('version mismatch, corrupt/tampered saves, illegal paths and unavailable storage fail safely', () => {
  const storage = fakeStorage(), run = follow(['ceiling']);
  saveRun(storage, scenario, run); assert.equal(loadRun(storage, { ...scenario, version: 2 }).reason, 'version');
  for (const corrupt of ['{', JSON.stringify({ ...run, state: { ...run.state, budget: 999 } }), JSON.stringify({ ...run, phase: 'ending' }), JSON.stringify({ ...run, history: [{ nodeID: 'response', choiceID: 'missing' }] })]) {
    storage.setItem(storageKey(scenario), corrupt); assert.equal(loadRun(storage, scenario).run, null);
  }
  assert.equal(loadRun(null, scenario).reason, 'unavailable'); assert.equal(saveRun(null, scenario, run), false); assert.equal(clearRun(null, scenario), false);
});
