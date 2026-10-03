import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_BALANCE as B, CYCLES, CATEGORIES, CPU_DOCTRINES } from '../config.js';
import { createCities, economy, advanceCity, advanceRegion, validAllocation, emptyAllocation, adjustAllocation, gapReport } from '../model.js';
import { cpuAllocation, selectDoctrine, validDoctrines } from '../cpu.js';
import { createRun, allocatePoint, commitRun, finishRunCycle, nextRunCycle, snapshotRun } from '../session.js';
import { reportHTML, describePath } from '../debrief.js';

export const plan = values => Object.fromEntries(CATEGORIES.map((c, i) => [c.id, values[i]]));
export const STRATEGIES = {
  '5/5/5/5': plan([5, 5, 5, 5]), '10/4/3/3': plan([10, 4, 3, 3]), '3/3/7/7': plan([3, 3, 7, 7]),
  '8/6/3/3': plan([8, 6, 3, 3]), '2/3/8/7': plan([2, 3, 8, 7]),
  capitalOnly: plan([20, 0, 0, 0]), researchOnly: plan([0, 0, 20, 0]),
  researchEducation: plan([0, 0, 10, 10]), resourceOnly: plan([0, 20, 0, 0]),
  neglectResources: plan([10, 0, 5, 5]),
};
export function simulate(playerCity, strategy, doctrine = 'balanced') {
  const run = createRun(playerCity, { doctrine });
  for (let cycle = 1; cycle <= CYCLES.length; cycle++) {
    const city = run.cities.find(c => c.id === playerCity);
    const allocation = typeof strategy === 'function' ? strategy(city, cycle) : strategy;
    for (const category of CATEGORIES) for (let i = 0; i < allocation[category.id]; i++) allocatePoint(run, category.id, 1);
    assert.ok(commitRun(run)); assert.ok(finishRunCycle(run)); assert.ok(nextRunCycle(run));
  }
  return run;
}
const player = run => run.cities.find(c => c.id === run.playerCity);
const initial = createCities();

test('A/B/G: city choice changes capital payoffs; repeated capital gains weaken smoothly', () => {
  const m = player(simulate('meridian', STRATEGIES.capitalOnly));
  const r = player(simulate('rivermark', STRATEGIES.capitalOnly));
  assert.ok(r.history[0].outputPerWorkerChange > m.history[0].outputPerWorkerChange * 1.5);
  for (const city of [m, r]) {
    for (let i = 1; i < city.history.length; i++) assert.ok(city.history[i].outputPerWorkerChange < city.history[i - 1].outputPerWorkerChange);
    assert.ok(city.history.at(-1).outputPerWorkerChange < city.history[0].outputPerWorkerChange / 3);
  }
  // Hold other stocks constant: the shape, rather than a cycle penalty, drives this.
  for (const city of initial) {
    let last = Infinity;
    for (let i = 0; i < 15; i++) {
      const stocks = { ...city, resources: 10000, capital: city.capital + i * 180 };
      const gain = economy({ ...stocks, capital: stocks.capital + 180 }).outputPerWorker - economy(stocks).outputPerWorker;
      assert.ok(gain > 0 && gain < last); last = gain;
    }
  }
});
test('C/D: weak skills mute research; education improves adoption and long-run productivity', () => {
  for (const city of initial) {
    const weak = player(simulate(city.id, STRATEGIES.researchOnly));
    const trained = player(simulate(city.id, STRATEGIES.researchEducation));
    assert.ok(weak.technology > city.technology);
    assert.ok(weak.constraints.technologyAdoption);
    assert.ok(trained.technologyAdoption > weak.technologyAdoption);
    assert.ok(trained.outputPerWorker > weak.outputPerWorker);
  }
});
test('E: bottlenecks are endogenous; no special cycle-four shock exists', () => {
  for (const city of initial) {
    const neglected = player(simulate(city.id, STRATEGIES.neglectResources));
    const supported = player(simulate(city.id, STRATEGIES['5/5/5/5']));
    assert.ok(neglected.constraints.resourceShortage);
    assert.ok(neglected.resourceAdequacy < supported.resourceAdequacy);
    assert.ok(neglected.labor < supported.labor);
    const earlier = advanceCity({ ...city, currentCycle: 0 }, STRATEGIES.neglectResources, 1, 2);
    const later = advanceCity({ ...city, currentCycle: 3 }, STRATEGIES.neglectResources, 4, 2);
    assert.equal(earlier.outputPerWorker, later.outputPerWorker);
    assert.equal(earlier.resourceAdequacy, later.resourceAdequacy);
  }
});
test('F: abundant resources protect capacity but have weak direct productivity payoff', () => {
  for (const city of initial) {
    const abundant = player(simulate(city.id, STRATEGIES.resourceOnly));
    const balanced = player(simulate(city.id, STRATEGIES['5/5/5/5']));
    assert.equal(abundant.resourceAdequacy, 1);
    assert.ok(abundant.constraints.excessCapacity);
    assert.ok(abundant.outputPerWorker < balanced.outputPerWorker);
    assert.equal(economy({ ...city, resources: 10000 }).outputPerWorker, economy({ ...city, resources: 20000 }).outputPerWorker);
  }
});
test('H: doctrine paths differ materially and all plans are valid integer budgets', () => {
  for (const cpuCity of initial) {
    const histories = [];
    const outcomes = [];
    for (const id of validDoctrines(cpuCity.id)) {
      let city = structuredClone(cpuCity);
      const path = [];
      for (let cycle = 1; cycle <= CYCLES.length; cycle++) {
        const allocation = cpuAllocation(city, id);
        assert.ok(validAllocation(allocation));
        path.push(allocation); city = advanceCity(city, allocation, cycle, 1.85, id);
      }
      histories.push(JSON.stringify(path)); outcomes.push(city.outputPerWorker);
      assert.ok(city.history.every(h => h.doctrine === id));
    }
    assert.equal(new Set(histories).size, validDoctrines(cpuCity.id).length);
    assert.ok(Math.max(...outcomes) / Math.min(...outcomes) > 1.15);
  }
});
test('I: CPU cannot counter the player’s CURRENT plan; decision uses only its own city', () => {
  const first = createRun('rivermark', { doctrine: 'industrial' });
  const second = createRun('rivermark', { doctrine: 'industrial' });
  first.allocation = { ...STRATEGIES.capitalOnly }; second.allocation = { ...STRATEGIES.researchOnly };
  commitRun(first); commitRun(second);
  assert.deepEqual(first.committedAllocations.meridian, second.committedAllocations.meridian);
  const city = initial[0], saved = structuredClone(city);
  assert.deepEqual(cpuAllocation(city, 'innovation'), cpuAllocation(city, 'innovation'));
  assert.deepEqual(city, saved);
});
test('J: prior education raises research payoff, capital expansion raises resource payoff', () => {
  const city = initial[1];
  const train = advanceCity(city, plan([0, 0, 0, 20]), 1, 1.85);
  assert.ok(train.pendingEducation > 0);
  assert.ok(Math.abs(train.education - city.education - 20 * B.educationPerPoint * B.educationImmediateShare) < 1e-10);
  const afterTraining = advanceCity(train, STRATEGIES.researchOnly, 2, 1.85);
  const withoutTraining = advanceCity({ ...train, education: city.education, pendingEducation: 0 }, STRATEGIES.researchOnly, 2, 1.85);
  assert.ok(afterTraining.history.at(-1).technologyGain > withoutTraining.history.at(-1).technologyGain);
  assert.ok(afterTraining.education > train.education);
  const resourceMarginal = state => economy({ ...state, resources: state.resources + B.resourcesPerPoint }).outputPerWorker - economy(state).outputPerWorker;
  const crowded = { ...city, capital: city.capital + 900 };
  assert.ok(resourceMarginal(crowded) > resourceMarginal(city));
  const skillsWithoutEquipment = economy({ ...city, education: 250 });
  assert.ok(skillsWithoutEquipment.constraints.skillsUnderused);
  assert.ok(economy({ ...skillsWithoutEquipment, capital: 600 }).humanCapital > skillsWithoutEquipment.humanCapital);
});
test('K: replay resets all state and can select another city and a new valid doctrine', () => {
  const old = simulate('rivermark', STRATEGIES['5/5/5/5'], 'innovation');
  const fresh = createRun('meridian', { random: () => 0.75, previousDoctrine: old.rivalDoctrine });
  assert.equal(fresh.playerCity, 'meridian'); assert.equal(fresh.rivalCity, 'rivermark');
  assert.notEqual(fresh.rivalDoctrine, old.rivalDoctrine);
  assert.deepEqual(fresh.cities, createCities()); assert.deepEqual(fresh.allocation, emptyAllocation());
  assert.equal(fresh.currentCycle, 1); assert.equal(fresh.pendingCities, null); assert.equal(fresh.committedAllocations, null);
  assert.equal(fresh.gapChangePercent, 0);
  assert.equal(fresh.phase, 'planning');
  assert.ok(!validDoctrines('rivermark').includes('frontier'));
  assert.ok(validDoctrines('meridian').includes('frontier'));
  assert.notEqual(selectDoctrine('meridian', () => 0, 'balanced'), 'balanced');
});
test('L: requested fixed plans have different productivity leaders for the two starts', () => {
  const names = ['5/5/5/5', '10/4/3/3', '3/3/7/7', '8/6/3/3', '2/3/8/7'];
  const winner = cityId => names.map(name => ({ name, result: player(simulate(cityId, STRATEGIES[name])).outputPerWorker })).sort((a, b) => b.result - a.result)[0].name;
  assert.notEqual(winner('meridian'), winner('rivermark'), 'BALANCING FAILURE: same fixed plan dominates both starts.');
  for (const id of ['meridian', 'rivermark']) {
    const best = Math.max(...names.map(name => player(simulate(id, STRATEGIES[name])).outputPerWorker));
    assert.ok(best > player(simulate(id, STRATEGIES.researchOnly)).outputPerWorker);
  }
});
test('Scarcity and atomic resolution: integer points, no overdraw, no negative allocation, no double commit', () => {
  let allocation = emptyAllocation();
  assert.deepEqual(adjustAllocation(allocation, 'capital', -1), allocation);
  for (let i = 0; i < B.developmentPointsPerCycle; i++) allocation = adjustAllocation(allocation, 'capital', 1);
  assert.deepEqual(adjustAllocation(allocation, 'research', 1), allocation);
  for (const invalid of [plan([19, 0, 0, 0]), plan([21, 0, 0, 0]), plan([20, -1, 1, 0]), plan([19.5, 0.5, 0, 0]), plan([NaN, 0, 0, 0]), {}, null]) assert.equal(validAllocation(invalid), false);
  const run = createRun('meridian', { doctrine: 'balanced' });
  assert.equal(commitRun(run), false);
  for (let i = 0; i < 20; i++) allocatePoint(run, 'capital', 1);
  assert.equal(run.cities[0].developmentPoints, 0);
  const before = structuredClone(run.cities);
  assert.equal(commitRun(run), true); assert.deepEqual(run.cities, before);
  assert.equal(commitRun(run), false); assert.equal(allocatePoint(run, 'capital', -1), false);
  assert.equal(finishRunCycle(run), true); assert.equal(finishRunCycle(run), false);
  assert.equal(run.cities[0].history.length, 1);
  assert.equal(nextRunCycle(run), true); assert.deepEqual(run.allocation, emptyAllocation());
});
test('History and local export record both independent paths and gap calculations', () => {
  const run = simulate('rivermark', STRATEGIES['10/4/3/3'], 'frontier');
  for (const city of run.cities) for (const h of city.history) {
    for (const key of ['cycle', 'doctrine', 'allocation', 'startState', 'endState', 'outputChange', 'outputPerWorkerChange', 'capitalPerWorker', 'growthRate', 'bottlenecks', 'technologyGain', 'educationGain', 'majorMechanisms']) assert.ok(Object.hasOwn(h, key));
    assert.equal(h.doctrine, city.id === run.playerCity ? null : 'frontier');
  }
  const exported = snapshotRun(run); assert.deepEqual(JSON.parse(JSON.stringify(exported)), exported);
  exported.cities[0].capital = -1; assert.ok(run.cities[0].capital > 0);
  const report = reportHTML(run);
  assert.ok(report.includes('You managed Rivermark')); assert.ok(report.includes(CPU_DOCTRINES.frontier.name));
  assert.ok(report.includes('POLICY CONNECTION')); assert.ok(report.includes('Resource capacity'));
  assert.ok(!describePath(run.cities[0], false).startsWith('You'));
  const gap = gapReport(run.initialCities, run.cities);
  assert.equal(run.gapChangePercent, gap.gapChangePercent);
  assert.equal(gapReport(initial, initial).gapChangePercent, 0);
  assert.equal(gapReport([initial[0], initial[0]], initial).gapChangePercent, null);
});
test('Shared pre-cycle frontier keeps simultaneous resolution order independent', () => {
  const cities = createCities(), copy = structuredClone(cities);
  const plans = Object.fromEntries(cities.map(c => [c.id, STRATEGIES['5/5/5/5']]));
  assert.deepEqual(advanceRegion(cities, plans, 1), advanceRegion([...cities].reverse(), plans, 1).reverse());
  assert.deepEqual(cities, copy);
});
