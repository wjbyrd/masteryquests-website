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
    s => s.nodes[0].choices[0].next = 'allocation',
    s => s.nodes.push({ ...structuredClone(s.nodes[1]), id: 'orphan' }),
    s => s.endings.at(-1).when = { state: 'budget', op: 'gte', value: 0 },
    s => s.nodes[0].scene = [{ type: 'html', text: '<script>' }]
  ]) { const s = copy(); mutate(s); assert.throws(() => validateScenario(s)); }
});
test('enumerates every legal path: six decisions, all nodes, choices and five endings reached', () => {
  const result = enumerate();
  assert.deepEqual(result.unreachableNodes, []); assert.deepEqual(result.unreachableEndings, []);
  assert.equal(result.choices.length, scenario.nodes.reduce((n, node) => n + node.choices.length, 0));
  assert.equal(result.complete.length, 252);
  for (const run of result.complete) {
    assert.equal(run.history.length, 6);
    assert.equal(new Set(run.history.map(h => h.nodeID)).size, 6);
    for (const [id, value] of Object.entries(run.state)) assert.ok(Number.isInteger(value) && value >= scenario.state[id].min && value <= scenario.state[id].max);
  }
});
test('every run inherits the ceiling with moderate first-order effects; there is no enact-or-avoid choice', () => {
  const run=createRun(scenario);
  assert.equal(scenario.version,2);assert.equal(run.nodeID,'allocation');
  assert.deepEqual(run.state,{relief:5,availability:2,quality:5,budget:7,building:2});
  assert.match(scenario.introduction.map(p=>p.text).join(' '),/already imposed a binding rent ceiling below the market equilibrium/);
  assert.match(scenario.modelNote,/ordinal/);
  assert.deepEqual(availableChoices(scenario,run).map(c=>c.id),['registry','exempt']);
  assert.equal(scenario.nodes.some(n=>n.id==='response'||n.id==='bridge'),false);
});
test('path dependence preserves controlled incumbents, differentiates newcomers and avoids duplicate exemptions', () => {
  const rent = follow(['registry','grants','reform']), open = follow(['exempt','grants','reform']);
  assert.equal(rent.nodeID,'distribution-protected');assert.equal(open.nodeID,'distribution-open');
  assert.notDeepEqual(nodeContent(scenario,rent).scene,nodeContent(scenario,open).scene);
  const closedSupply=follow(['registry','grants']), openSupply=follow(['exempt','grants']);
  assert.ok(availableChoices(scenario,closedSupply).some(c=>c.id==='exempt'));
  assert.ok(!availableChoices(scenario,openSupply).some(c=>c.id==='exempt'));
  assert.throws(()=>decide(scenario,openSupply,'exempt'));
  const poor={...closedSupply,state:{...closedSupply.state,budget:2}};
  assert.ok(!availableChoices(scenario,poor).some(c=>c.id==='subsidy'));
  assert.throws(()=>decide(scenario,poor,'subsidy'));
});
test('all paths preserve rationing, maintenance, construction lag, and policy interactions', () => {
  for(const run of enumerate().complete){
    assert.deepEqual(run.history.map(h=>h.nodeID),['allocation','maintenance','supply',run.history[0].choiceID==='exempt'?'distribution-open':'distribution-protected','renewal','review']);
    const [allocation,maintenance,supply,,mitigation,review]=run.history;
    if(allocation.choiceID==='registry'){
      assert.equal(allocation.after.availability,allocation.before.availability);
      assert.match(allocation.consequence,/does not eliminate the shortage/);
    }
    if(maintenance.choiceID==='grants'){
      assert.equal(maintenance.after.availability,maintenance.before.availability);
      assert.equal(maintenance.after.quality-maintenance.before.quality,2);
      assert.match(maintenance.consequence,/not new units/);
    }
    assert.equal(supply.after.availability,supply.before.availability,'supply encouragement is not completion');
    assert.equal(mitigation.after.availability,mitigation.before.availability,'assistance is not units');
    if(supply.choiceID==='exempt'){
      assert.equal(supply.after.building-supply.before.building,2);
      assert.equal(review.after.availability-review.before.availability,review.choiceID==='access'?3:2);
      assert.match(review.consequence,/now open|after the construction lag/);
    }
    assert.match(mitigation.consequence,/ceiling/);
  }
  const closed=follow(['registry','grants','reform','search','taper','access']);
  const open=follow(['exempt','grants','reform','search','taper','access']);
  assert.equal(closed.history[5].after.availability-closed.history[5].before.availability,2);
  assert.equal(open.history[5].after.availability-open.history[5].before.availability,4);
});
test('conditions, post-choice conditional routes, structured tables and images are reusable', () => {
  const s = copy();
  s.nodes[0].choices[0].next = [{ when: { state: 'relief', op: 'gte', value: 5 }, target: 'maintenance' }, { target: 'supply' }];
  s.nodes[0].scene.push({ type: 'table', caption: 'Illustrative units', headers: ['Item', 'Value'], rows: [['Homes', '10']] }, { type: 'image', src: './chart.svg', alt: 'Supply curve', description: 'An accessible description of the relationships.' });
  assert.ok(validateScenario(s));
  assert.equal(advance(s, decide(s, createRun(s), 'registry')).nodeID, 'maintenance');
  assert.equal(matches({ all: [{ not: { chosen: 'allocation.exempt' } }, { any: [{ state: 'budget', op: 'eq', value: 7 }] }] }, createRun(s)), true);
});
test('transitions are immutable and phase guarded; hook returns a detached snapshot', () => {
  const run = createRun(scenario), before = structuredClone(run);
  const next = decide(scenario, run, 'registry'); assert.deepEqual(run, before);
  assert.throws(() => decide(scenario, next, 'registry')); assert.throws(() => advance(scenario, run));
  const event = transitionEvent('decision_selected', next, 'registry', run.startedAt + 15);
  assert.equal(event.elapsedMs, 15); event.state.budget = -999; assert.equal(next.state.budget, 6);
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
  const storage = fakeStorage(), old = follow(['registry']);
  storage.setItem('unrelated-game', 'preserve'); saveRun(storage, scenario, old);
  assert.ok(clearRun(storage, scenario)); assert.equal(loadRun(storage, scenario).run, null);
  assert.equal(storage.getItem('unrelated-game'), 'preserve');
  const fresh = createRun(scenario); assert.notEqual(fresh.runID, old.runID); assert.equal(fresh.history.length, 0);
  assert.equal(fresh.state.relief, 5); fresh.state.relief = 8; assert.equal(createRun(scenario).state.relief, 5);
});
test('version mismatch, corrupt/tampered saves, illegal paths and unavailable storage fail safely', () => {
  const storage = fakeStorage(), run = follow(['registry']);
  saveRun(storage, scenario, run); assert.equal(loadRun(storage, { ...scenario, version: 99 }).reason, 'version');
  saveRun(storage,scenario,{...run,scenarioVersion:1});assert.equal(loadRun(storage,scenario).reason,'version');
  for (const corrupt of ['{', JSON.stringify({ ...run, state: { ...run.state, budget: 999 } }), JSON.stringify({ ...run, phase: 'ending' }), JSON.stringify({ ...run, history: [{ nodeID: 'response', choiceID: 'missing' }] })]) {
    storage.setItem(storageKey(scenario), corrupt); assert.equal(loadRun(storage, scenario).run, null);
  }
  assert.equal(loadRun(null, scenario).reason, 'unavailable'); assert.equal(saveRun(null, scenario, run), false); assert.equal(clearRun(null, scenario), false);
});
