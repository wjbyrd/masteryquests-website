import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, COMPONENTS } from './game/games/gdp-live/config.js';
import { SCENARIOS, AUDITS, BY_ID } from './game/games/gdp-live/scenarios.js';
import * as e from './game/games/gdp-live/engine.js';
import { createRecorder, STORAGE_PREFIX } from './game/games/gdp-live/telemetry.js';
import { createCounter } from './game/games/gdp-live/counter.js';

const choose = (state, posts) => ({ ...state, selection: e.expectedAccounts(posts) });
function transactions(seed) {
  let s = e.start(e.newRun(seed));
  while (s.stage === 'posting') {
    const before = s, scenario = e.currentScenario(s);
    s = e.postTransaction(choose(s, scenario.postings));
    assert.equal(e.gdp(s.accounts) - e.gdp(before.accounts), e.deltaOf(scenario.postings));
    s = e.nextTransaction(s);
  }
  return s;
}
test('fictional baseline and component-derived arithmetic', () => {
  assert.equal(e.gdp(CONFIG.baseline), 25000); assert.equal(e.nx(CONFIG.baseline), -500);
  assert.equal(e.deltaOf([{ account: 'M', amount: 5 }]), -5);
  assert.throws(() => e.applyPostings(CONFIG.baseline, [{ account: 'N', amount: 2 }]));
});
test('all 18 scenarios: exhaustive account selections reject mistakes without mutating totals or ledger', () => {
  assert.deepEqual(Object.keys(CONFIG.phaseLengths).map(p => SCENARIOS.filter(s => s.phase === p).length), [7,8,3]);
  assert.equal(new Set(SCENARIOS.map(s => s.id)).size, 18);
  const accounts = [...COMPONENTS, 'NC'];
  for (const scenario of SCENARIOS) {
    let accepted = 0;
    for (let mask = 0; mask < 64; mask++) {
      const s = { ...e.start(e.newRun(1)), deck: [scenario.id], selection: accounts.filter((_, i) => mask & (1 << i)) };
      const snapshot = JSON.stringify(s), after = e.postTransaction(s);
      assert.equal(JSON.stringify(s), snapshot);
      if (e.matches(s.selection, scenario.postings)) {
        accepted++; assert.equal(after.stage, 'posted'); assert.equal(after.ledger.length, 1);
        assert.deepEqual(after.accounts, e.applyPostings(CONFIG.baseline, scenario.postings));
        assert.equal(after.firstCorrect, 1); assert.equal(after.ledger[0].gdpDelta, e.deltaOf(scenario.postings));
        assert.equal(e.postTransaction(after), after, 'no duplicate posting');
      } else {
        assert.deepEqual(after.accounts, CONFIG.baseline); assert.equal(after.ledger.length, 0);
        if (mask) {
          assert.ok(after.feedback.includes(scenario.feedback));
          const fixed = e.postTransaction(choose(after, scenario.postings));
          assert.equal(fixed.firstCorrect, 0); assert.equal(fixed.attempts, 2); assert.equal(fixed.ledger.length, 1);
        }
      }
    }
    assert.equal(accepted, 1, scenario.id);
  }
});
test('economic content: investment, exclusions, used-good service and positive import offsets', () => {
  for (const id of ['basic-machinery','basic-inventory','basic-housing','trap-house','trap-inventory']) assert.deepEqual(e.expectedAccounts(BY_ID[id].postings), ['I']);
  for (const id of ['trap-transfer','trap-benefits','trap-stock','trap-used','trap-steel']) assert.deepEqual(BY_ID[id].postings, []);
  assert.deepEqual(BY_ID['trap-used-service'].postings, [{ account: 'C', amount: 1 }]);
  for (const [id, account, amount] of [['import-phones','C',5], ['import-capital','I',4], ['import-government','G',3]]) {
    const posts = BY_ID[id].postings, result = e.applyPostings(CONFIG.baseline, posts);
    assert.deepEqual(posts, [{ account, amount }, { account: 'M', amount }]);
    assert.equal(e.deltaOf(posts), 0); assert.equal(e.gdp(result), 25000);
    assert.equal(result.M, CONFIG.baseline.M + amount); assert.equal(e.nx(result), -500 - amount);
  }
});
test('Not Counted exclusive; ordinary accounts combine and toggle', () => {
  let s = e.start(e.newRun(1));
  for (const a of ['C','M']) s = e.toggleAccount(s,a);
  assert.deepEqual(s.selection, ['C','M']);
  s = e.toggleAccount(s,'NC'); assert.deepEqual(s.selection, ['NC']);
  s = e.toggleAccount(s,'I'); assert.deepEqual(s.selection, ['I']);
  s = e.toggleAccount(s,'I'); assert.deepEqual(s.selection, []);
  assert.equal(e.toggleAccount(s,'N'), s);
});
test('1,000 seeded complete runs cover all scenarios and audits, reconcile ledger, and reset', () => {
  const seen = new Set(), audits = new Set();
  for (let seed = 1; seed <= 1000; seed++) {
    const initial = e.newRun(seed);
    assert.deepEqual(initial, e.newRun(seed)); assert.equal(initial.deck.length, 11);
    assert.equal(new Set(initial.deck).size, 11);
    assert.deepEqual(initial.deck.map(id => BY_ID[id].phase), [...Array(4).fill('basic'),...Array(4).fill('traps'),...Array(3).fill('multi')]);
    initial.deck.forEach(id => seen.add(id)); audits.add(initial.auditID);
    let s = transactions(seed), prior = s.accounts;
    assert.equal(s.stage, 'identity'); s = e.beginAudit(s);
    const audit = e.currentAudit(s);
    assert.equal(s.auditRows.filter(r => JSON.stringify(r.correctPostings) !== JSON.stringify(r.posted)).length, 1);
    const wrong = e.identifyAudit(s, s.auditRows.find(r => r.id !== audit.badID).id);
    assert.equal(wrong.stage, 'audit_find'); assert.deepEqual(wrong.accounts, s.accounts);
    s = e.identifyAudit(wrong, audit.badID);
    const bad = s.auditRows.find(r => r.id === audit.badID);
    const wrongRepair = e.repairAudit({ ...s, selection: ['X'] });
    assert.equal(wrongRepair.stage, 'audit_repair'); assert.deepEqual(wrongRepair.accounts, s.accounts);
    s = e.repairAudit(choose(wrongRepair, bad.correctPostings));
    assert.equal(s.stage, 'audit_done'); assert.equal(s.auditFindAttempts, 2); assert.equal(s.auditRepairAttempts, 2);
    assert.deepEqual(s.accounts, e.applyPostings(prior, audit.rows.flatMap(r => r.correctPostings)));
    assert.equal(e.repairAudit(s), s);
    s = e.beginShock(s); const before = s.accounts;
    s = e.answerShock(s, '46'); assert.deepEqual(s.accounts, before); assert.equal(s.stage, 'shock');
    assert.ok(!s.feedback.includes('20'));
    s = e.answerShock(s, '$20B'); assert.equal(s.stage, 'complete'); assert.equal(e.gdp(s.accounts) - e.gdp(before), 20);
    assert.equal(s.shockAttempts, 2); assert.equal(s.firstCorrect, 11);
    assert.deepEqual(s.accounts, e.applyPostings(CONFIG.baseline, s.ledger.flatMap(r => r.postings)));
    assert.equal(e.gdp(s.accounts), 25000 + s.ledger.reduce((sum,r) => sum + r.gdpDelta,0));
    assert.equal(e.answerShock(s, '20'), s);
    assert.deepEqual(e.newRun(seed), initial);
  }
  assert.equal(seen.size, 18); assert.equal(audits.size, 5);
});
test('numeric final challenge accepts reasonable formats, rejects unrelated input, and does not disclose answer on failure', () => {
  for (const value of ['20','+20','20B','$20B',' $ + 20 billion ','20.0']) assert.equal(e.parseAmount(value),20);
  for (const value of ['', 'twenty', '20cats', '20+0', 'Infinity', '<script>']) assert.equal(e.parseAmount(value),null);
  assert.equal(e.parseAmount('-25B'), -25);
  assert.equal(e.deltaOf(COMPONENTS.map(account => ({ account, amount: CONFIG.shock[account] }))), 20);
});
test('counter rolls in both directions, settles exactly, and keeps zero-change and reduced-motion updates still', () => {
  const saved = [globalThis.requestAnimationFrame, globalThis.cancelAnimationFrame];
  let tick, change;
  globalThis.requestAnimationFrame = callback => { tick = callback; return 1; };
  globalThis.cancelAnimationFrame = () => {};
  try {
    const motion = { matches: false, addEventListener: (_, callback) => { change = callback; } };
    const element = { dataset: {}, textContent: '', parentElement: { setAttribute() {} }, animate: () => ({ cancel() {} }) };
    const counter = createCounter(element, motion);
    counter.update(25000, false); assert.equal(element.textContent, '$25,000');
    counter.update(25012); assert.equal(element.dataset.direction, 'up'); assert.equal(element.dataset.animating, 'true');
    // A rapid zero-GDP posting must stop any unfinished preceding roll.
    counter.update(25012); assert.equal(element.dataset.animating, 'false'); assert.equal(element.textContent, '$25,012');
    counter.update(25006); assert.equal(element.dataset.direction, 'down');
    tick(performance.now() + CONFIG.animationMs + 1); assert.equal(element.textContent, '$25,006'); assert.equal(element.dataset.animating, 'false');
    counter.update(25008); motion.matches = true; change();
    assert.equal(element.textContent, '$25,008'); assert.equal(element.dataset.animating, 'false');
    counter.update(25028); assert.equal(element.textContent, '$25,028'); assert.equal(element.dataset.animating, 'false');
  } finally { [globalThis.requestAnimationFrame, globalThis.cancelAnimationFrame] = saved; }
});
test('telemetry isolates runs, records actual component effects, retains 20 runs and tolerates unavailable storage', () => {
  const map = new Map(), storage = { get length() { return map.size; }, key: i => [...map.keys()][i], getItem: k => map.get(k), setItem: (k,v) => map.set(k,v), removeItem: k => map.delete(k) };
  map.set('other-game', 'untouched');
  let now = 0;
  for (let i = 0; i < 23; i++) {
    const recorder = createRecorder(storage, undefined, `run-${i}`, () => now++);
    const before = { ...e.start(e.newRun(i)), deck: ['import-phones'], selection: ['C','M'] }, after = e.postTransaction(before);
    recorder.log('post_attempt', before, after, { correct: true });
    assert.equal(recorder.record.events[0].gdpDelta, 0);
    assert.deepEqual(recorder.record.events[0].componentChanges, { C:5,I:0,G:0,X:0,M:5 });
    assert.equal(recorder.record.events[0].sequenceNumber, 1);
  }
  assert.equal([...map.keys()].filter(k => k.startsWith(STORAGE_PREFIX)).length, 20);
  assert.equal(map.get('other-game'), 'untouched');
  let warnings = 0;
  const unavailable = createRecorder(null, () => warnings++, 'blocked', () => now++), s = e.newRun(1);
  unavailable.log('run_start',s); unavailable.log('scenario_presented',s);
  assert.equal(warnings,1); assert.equal(unavailable.record.events.length,2);
});
