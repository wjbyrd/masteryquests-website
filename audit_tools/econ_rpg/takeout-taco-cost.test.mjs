import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { COSTS, TOTAL_PRODUCT } from './game/games/takeout-taco-counting-the-cost/config.js';
import { evaluate, enrich, allocations, minimumPlan, minimumSchedule, marginalSchedule, autoIngredients, perService, operatingChange } from './game/games/takeout-taco-counting-the-cost/engine.js';
import { newRun, transition, choices, acceptedTrials } from './game/games/takeout-taco-counting-the-cost/gameplay.js';
import { graphData, chart, curvesView, primaryGraphs } from './game/games/takeout-taco-counting-the-cost/graphs.js';
import { consequence, review } from './game/games/takeout-taco-counting-the-cost/content.js';
import { createRecorder, STORAGE_PREFIX } from './game/games/takeout-taco-counting-the-cost/telemetry.js';
const plan = (patch = {}) => ({ trucks: 1, grills: [true, false], workers: [3, 0], target: 40, kits: 40, ...patch });
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test('canonical technology and the required two-truck allocations', () => {
  assert.deepEqual(TOTAL_PRODUCT, [0, 8, 18, 31, 42, 50, 53]);
  TOTAL_PRODUCT.forEach((q, n) => assert.equal(evaluate(plan({ workers: [n, 0], target: 200, kits: 200 })).output, q));
  [53, 58, 60, 62].forEach((q, i) => assert.equal(evaluate(plan({ trucks: 2, grills: [true, true], workers: [6 - i, i], target: 100, kits: 100 })).output, q));
});
test('required infeasible 3-worker and feasible 4-worker cases', () => {
  const a = enrich(plan());
  assert.deepEqual([a.capacity, a.output, a.shortfall, a.unused, a.Q, a.FC, a.VC, a.TC], [31, 31, 9, 9, 620, 1200, 5200, 6400]);
  near(a.AFC, 1200 / 620); near(a.AVC, 5200 / 620); near(a.ATC, 6400 / 620);
  assert.equal(a.minimum.TC, 6040); assert.equal(a.avoidable, 360); assert.equal(a.MC, null);
  const b = enrich(plan({ workers: [4, 0] }));
  assert.deepEqual([b.capacity, b.output, b.shortfall, b.Q, b.FC, b.VC, b.TC, b.ATC], [42, 40, 0, 800, 1200, 6400, 7600, 9.5]);
  assert.equal(b.feasible, true); assert.equal(b.avoidable, 0); assert.equal(b.MC, null);
});
test('required expanded month', () => {
  const r = evaluate(plan({ trucks: 2, grills: [true, true], workers: [3, 3], target: 62, kits: 62 }));
  assert.deepEqual([r.output, r.Q, r.FC, r.VC, r.TC], [62, 1240, 2400, 9680, 12080]);
});
test('zero production, missing resources, target limits, and perishable waste', () => {
  const empty = enrich(plan({ workers: [0, 0], kits: 0 }));
  assert.deepEqual([empty.Q, empty.FC, empty.VC, empty.TC, empty.AFC, empty.AVC, empty.ATC, empty.MC], [0, 1200, 0, 1200, null, null, null, null]);
  const noGrill = evaluate(plan({ grills: [false, false] }));
  assert.equal(noGrill.output, 0); assert.equal(noGrill.VC, 5200); assert.equal(noGrill.FC, 1000);
  assert.equal(evaluate(plan({ kits: 0 })).output, 0);
  assert.equal(evaluate(plan({ kits: 9 })).output, 9);
  assert.equal(evaluate(plan({ target: 5 })).output, 5);
  const excessive = evaluate(plan({ target: 200, kits: 250, workers: [6, 0] }));
  assert.equal(excessive.output, 53); assert.equal(excessive.shortfall, 147); assert.equal(excessive.unused, 197);
  const unequipped = evaluate(plan({ trucks: 2, grills: [true, false], workers: [3, 6] }));
  assert.equal(unequipped.capacity, 31); assert.equal(unequipped.workers, 9);
  assert.equal(enrich(plan({ target: 0 })).ATC, null);
});
test('efficient staffing MC falls, then rises with diminishing MP; never crosses technology', () => {
  const rows = marginalSchedule(plan());
  assert.deepEqual(rows.map(r => r.MP), [null, 8, 10, 13, 11, 8, 3]);
  [null, 9.5, 8, 60 / 13 + 2, 60 / 11 + 2, 9.5, 22].forEach((mc, i) => mc === null ? assert.equal(rows[i].MC, null) : near(rows[i].MC, mc));
  assert.ok(rows[3].MC < rows[2].MC); assert.ok(rows[4].MC > rows[3].MC);
  for (const equipment of [{ trucks: 1, grills: [true] }, { trucks: 2, grills: [true, true] }, { trucks: 2, grills: [false, true] }]) {
    const frontier = marginalSchedule(equipment);
    frontier.slice(1).forEach((r, i) => { const previous = frontier[i]; near(r.MC, (r.TC - previous.TC) / (r.Q - previous.Q)); assert.equal(r.FC, previous.FC); });
  }
});
test('exhaustive minimum schedule across every permitted equipment configuration', () => {
  for (let trucks = 1; trucks <= 2; trucks++) for (let mask = 0; mask < 2 ** trucks; mask++) {
    const equipment = { trucks, grills: [!!(mask & 1), !!(mask & 2)] };
    const schedule = minimumSchedule(equipment);
    for (const row of schedule) {
      assert.equal(row.output, row.plan.target); assert.equal(row.unused, 0);
      assert.equal(row.Q, row.output * 20); near(row.TC, row.FC + row.VC);
      const costs = allocations(equipment).filter(a => a.capacity >= row.output).map(a => row.FC + 20 * (a.labor * 60 + row.output * 2));
      assert.equal(row.TC, Math.min(...costs));
      if (row.Q) { near(row.ATC, row.AFC + row.AVC); near(row.ATC, row.TC / row.Q); }
    }
    assert.equal(minimumPlan(equipment, schedule.length), null);
  }
});
test('configurable accounting period scales output and variable expense together', () => {
  const costs = { ...COSTS, shifts: 10, wage: 80, kit: 3, truck: 1500, grill: 250 };
  const r = evaluate(plan(), costs);
  assert.deepEqual([r.Q, r.FC, r.VC, r.TC], [310, 1750, 3600, 5350]);
  near(marginalSchedule(plan(), costs)[3].MC, 80 / 13 + 3);
});
const choose = (state, id) => transition(transition(state, 'select', id), 'commit');
const proceed = state => transition(state, 'continue');
function sample({ opening = 'open', crew = [1, 2, 3, 4, 5, 6], target = 62, expand = true, allocation = 3 } = {}) {
  let s = transition(newRun(), 'start');
  for (const id of [opening, ...crew.map(n => `crew-${n}`)]) s = proceed(choose(s, id));
  assert.equal(s.round, 8); assert.equal(s.phase, 'choice');
  s = choose(s, `target-${target}`); s = choose(s, expand ? 'expand' : 'stay');
  if (expand) s = choose(s, `allocation-${allocation}`);
  return s;
}

test('per-service play automatically buys only completed output and keeps monthly accounting intact', () => {
  const a = autoIngredients(plan({ workers: [2, 0], target: 20 })), b = autoIngredients(plan({ workers: [3, 0], target: 20 }));
  const r = perService(a);
  assert.deepEqual([a.output, a.shortfall, a.plan.kits, a.unused, r.FC, r.labor, r.ingredients, r.VC, r.TC], [18, 2, 18, 0, 60, 120, 36, 156, 216]);
  assert.equal(b.output, 20); assert.equal(perService(b).TC, 280);
  assert.equal(perService(autoIngredients(plan({ workers: [4, 0], target: 40 }))).TC, 380);
  assert.equal(operatingChange(a, b).costPerExtra, 32); near(marginalSchedule(plan())[3].MC, 60 / 13 + 2);
  assert.equal(perService(autoIngredients(plan({ workers: [0, 0], target: 0 }))).TC, 60);
});
test('only service decisions append observations; equipment and commitment steps cannot add graph points', () => {
  let s = transition(newRun(), 'start');
  assert.equal(graphData(s).actual.length, 0);
  s = transition(s, 'select', 'open'); assert.equal(s.trials.length, 0);
  s = transition(s, 'commit'); assert.equal(s.trials.length, 1);
  assert.equal(graphData(s).minimum.length, 0); assert.equal(graphData(s).marginal.length, 0);
  assert.equal(graphData(s, { reference: true, full: true }).minimum.length, 1); // no untested curve during play
  assert.equal(transition(s, 'commit'), s); assert.equal(transition(s, 'select', 'delay'), s);
  s = sample(); assert.equal(s.trials.length, 8); assert.equal(s.plan.trucks, 2);
  const one = graphData(s, { key: '1:1', reference: true });
  assert.ok(one.actual.every(r => r.key === '1:1')); assert.ok(one.minimum.every(r => r.key === '1:1'));
  assert.equal(one.minimum.length, new Set(one.actual.map(r => r.output)).size);
  assert.ok(graphData(s, { key: '2:11' }).actual.every(r => r.key === '2:11'));
  assert.doesNotMatch(chart(s), /NaN|Infinity/); assert.match(chart(s), /tacos per lunch/i);
  s = proceed(s); assert.equal(graphData(s, { key: '1:1', reference: true, full: true }).minimum.length, 54);
});
test('optional experiments preserve history and expose order-limited inefficiency', () => {
  let s = proceed(choose(transition(newRun(), 'start'), 'delay'));
  s = choose(s, 'crew-0'); const original = structuredClone(s.trials[1]);
  assert.equal(s.trials[1].shortfall, 8);
  s = choose(transition(s, 'revise'), 'crew-2');
  assert.equal(s.trials.length, 3); assert.deepEqual(s.trials[1], original);
  assert.equal(s.trials[2].output, 8); assert.equal(s.trials[2].experiment, true);
  assert.equal(s.trials[2].avoidable / 20, 60); assert.equal(s.trials[2].MC, null);
  s = choose(transition(s, 'revise'), 'crew-1'); assert.equal(s.trials.at(-1).TC / 20, 136);
  assert.equal(s.trials[2].TC / 20, 196);
  const reference = graphData(s, { reference: true }).minimum.find(r => r.output === 8);
  assert.equal(reference.TC, 136);
});

test('all eight-round decision paths complete without an optimal-answer gate', t => {
  let completed = 0, prefixes = 0;
  const visit = s => {
    prefixes++;
    if (s.phase === 'review') {
      completed++; assert.equal(s.completed, true); assert.equal(s.trials.length, 8); assert.equal(acceptedTrials(s).length, 8);
      for (const r of s.trials) { assert.equal(r.unused, 0); assert.equal(r.plan.kits, r.output); assert.equal(r.Q, r.output * 20); }
      assert.ok(review(s).includes('Where else does this apply?')); return;
    }
    if (s.phase === 'result') { assert.ok(consequence(s).headline); visit(proceed(s)); return; }
    assert.equal(s.phase, 'choice'); assert.ok(choices(s).length);
    choices(s).forEach(c => visit(choose(s, c.id)));
  };
  visit(transition(newRun(), 'start')); assert.ok(completed > 500); t.diagnostic(`${completed} complete choice paths, ${prefixes} state prefixes`);
});
test('different decisions produce different reviews; costly expansion is never automatically rewarded', () => {
  const stay = sample({ crew: [0, 0, 0, 0, 0, 0], target: 80, expand: false });
  assert.equal(stay.trials.at(-1).shortfall, 80);
  const expanded = sample({ target: 62 }); assert.equal(expanded.trials.at(-1).output, 62); assert.equal(perService(expanded.trials.at(-1)).FC, 120);
  assert.notEqual(review(proceed(stay)), review(proceed(expanded)));
  const low = sample({ target: 40, expand: true }); assert.match(consequence(low).why, /One truck can physically meet this target/);
  const poor = sample({ allocation: 6 }); assert.equal(poor.trials.at(-1).output, 53); assert.equal(poor.trials.at(-1).shortfall, 9);
  assert.match(consequence(expanded).insight, /not short-run MC/);
  const html = review(proceed(expanded));
  for (const concept of ['fixed', 'variable', 'marginal', 'AFC', 'AVC', 'ATC', 'undefined', 'benefit', 'bakery', 'long-run', '$32', '$6.62']) assert.ok(html.toLowerCase().includes(concept.toLowerCase()), concept);
  assert.doesNotMatch(curvesView(proceed(expanded), { kind: 'unit', reference: true, full: true }), /NaN|Infinity/);
});
test('sparse and full paths retain real observations and progressively reveal references', () => {
  const sparse = sample({ crew: [0, 0, 0, 0, 0, 0], expand: false });
  assert.ok(sparse.trials.every(t => t.output === 0 && t.VC === 0));
  assert.match(review(proceed(sparse)), /not to produce in any round/);
  assert.match(review(proceed(sparse)), /met 0 of the seven/);
  assert.equal(graphData(sparse).actual.length, 8);
  assert.equal((chart(sparse).match(/class="chart-point /g) || []).length, 2); // one coincident TC/FC plus VC, deduplicated
  const full = sample();
  assert.deepEqual(full.trials.map(t => t.output), [0, 8, 18, 31, 42, 50, 53, 62]);
  assert.deepEqual(full.trials.map(t => t.TC / 20), [60, 136, 216, 302, 384, 460, 526, 604]);
  assert.match(review(proceed(full)), /met 7 of the seven/);
  for (let round = 1; round <= 7; round++) {
    const s = { ...full, trials: full.trials.filter(t => t.round <= round), round, completed: false };
    const refs = graphData(s).marginal;
    assert.ok(refs.every(t => t.workers <= round - 1));
    if (round < 4) assert.equal(refs.length, 0);
    assert.doesNotMatch(chart(s, { kind: 'unit' }), /NaN|Infinity/);
  }
  const r7 = { ...full, round: 7, trials: full.trials.slice(0, 7) };
  assert.match(consequence(r7).why, /You hired another worker/);
  const skipped = sample({ crew: [0, 0, 0, 0, 0, 6] });
  assert.match(consequence({ ...skipped, round: 7, trials: skipped.trials.slice(0, 7) }).why, /Full-capacity reference/);
});

test('primary totals persist through all eight rounds and separate expanded capital', () => {
  const full = sample();
  for (let round = 1; round <= 8; round++) {
    const state = { ...full, round, trials: full.trials.filter(t => t.round <= round) };
    const html = primaryGraphs(state);
    assert.equal((html.match(/data-chart="total"/g) || []).length, round === 8 ? 2 : 1);
    assert.doesNotMatch(html, /data-chart="unit"|Solid markers show|Solid markers:/);
    for (const f of ['FC', 'VC', 'TC']) assert.match(html, new RegExp(`</svg>${f}</span>`));
    assert.ok(html.includes(`Trial ${round} · round ${round}`));
    assert.ok(html.includes('Trial 1 · round 1'));
    assert.match(html, /Graph values · accessible table/);
  }
  const [one, two] = primaryGraphs(full).split('</figure>');
  assert.match(one, /Original operation · 1 truck/); assert.doesNotMatch(one, /2 trucks;/);
  assert.match(two, /Expanded operation · 2 trucks/); assert.doesNotMatch(two, /1 truck;/);
  assert.match(curvesView(full, { kind: 'unit' }), /Solid markers show actual decisions/);
  for (const f of ['AFC', 'AVC', 'ATC', 'MC']) assert.match(curvesView(full, { kind: 'unit' }), new RegExp(`</svg>${f}</span>`));
});

test('Cost Lab unlocks only after completion and never changes story records or review', () => {
  assert.equal(transition(newRun(), 'lab-start').phase, 'intro');
  const pending = sample(); assert.equal(transition(pending, 'lab-start'), pending);
  const completed = proceed(pending), original = structuredClone(completed.trials), summary = review(completed);
  let s = transition(completed, 'lab-start'); assert.equal(s.phase, 'lab');
  for (const patch of [{ workers: [6, 0], target: 20 }, { trucks: 2, grills: [true, true], workers: [3, 3], target: 80 }, { grills: [false, false], target: 40 }]) s = transition(s, 'lab-run', { ...plan(), ...patch });
  assert.equal(s.lab.trials.length, 3); assert.deepEqual(s.trials, original); assert.equal(review(s), summary);
  assert.ok(s.lab.trials.every(t => t.source === 'lab' && t.round === null && t.plan.kits === t.output));
  assert.equal(s.lab.trials[2].output, 0); assert.equal(s.lab.trials[2].ATC, null);
  s = transition(s, 'lab-exit'); assert.equal(s.phase, 'review');
  assert.equal(transition(s, 'lab-run', plan()), s);
  assert.equal(transition(s, 'lab-start').lab.trials.length, 3);
});

test('telemetry records anonymously, retains 20 runs and survives storage errors', () => {
  const data = new Map(), storage = { get length() { return data.size; }, key: i => [...data.keys()][i], getItem: k => data.get(k), setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) };
  for (let i = 0; i < 23; i++) createRecorder(storage, () => {}, String(i)).log('service_trial', { output: 31, FC: 1200 });
  assert.equal(data.size, 20); assert.ok([...data.keys()].every(k => k.startsWith(STORAGE_PREFIX)));
  const warnings = [], recorder = createRecorder(null, x => warnings.push(x), 'anonymous');
  recorder.log('run_started'); recorder.log('completion'); assert.equal(warnings.length, 1); assert.equal(recorder.record.events.length, 2);
  assert.equal(recorder.record.events[1].sequenceNumber, 2); assert.equal(recorder.record.events[1].action, 'completion');
});
test('hub and preview packaging register game 15; original game and art unchanged', () => {
  const config = JSON.parse(readFileSync(new URL('./games-preview.json', import.meta.url)));
  const hub = readFileSync(new URL('./game/games/index.html', import.meta.url), 'utf8');
  assert.equal((hub.match(/class="game-card"/g) || []).length, config.gameCount);
  assert.ok(config.standaloneGames.includes('takeout-taco-counting-the-cost'));
  assert.match(hub, /href="\.\/takeout-taco-counting-the-cost\/"/);
  execFileSync('git', ['diff', '--exit-code', 'HEAD', '--', 'audit_tools/econ_rpg/game/games/takeout-taco-lunch-rush', 'audit_tools/econ_rpg/game/art/scenes/takeout-taco-lunch-rush', 'audit_tools/econ_rpg/game/mini-game-accessibility.css'], { stdio: 'pipe' });
});
