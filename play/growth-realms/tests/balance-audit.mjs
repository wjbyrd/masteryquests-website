import fs from 'node:fs/promises';
import { GAME_BALANCE, CATEGORIES, CPU_DOCTRINES, CYCLES } from '../config.js';
import { createRun, commitRun, finishRunCycle, nextRunCycle } from '../session.js';
import { createCities } from '../model.js';
const plan = values => Object.fromEntries(CATEGORIES.map((c, i) => [c.id, values[i]]));
const fixed = {
  '5/5/5/5': [5, 5, 5, 5], '10/4/3/3': [10, 4, 3, 3], '3/3/7/7': [3, 3, 7, 7],
  '8/6/3/3': [8, 6, 3, 3], '2/3/8/7': [2, 3, 8, 7],
  'Capital only': [20, 0, 0, 0], 'Research only': [0, 0, 20, 0],
  'Research + education': [0, 0, 10, 10], 'Resources only': [0, 20, 0, 0], 'Resource neglect': [10, 0, 5, 5],
};
function simulate(cityId, strategy, doctrine = 'balanced') {
  const run = createRun(cityId, { doctrine });
  for (let cycle = 1; cycle <= CYCLES.length; cycle++) {
    run.allocation = plan(typeof strategy === 'function' ? strategy(cycle) : strategy);
    if (!commitRun(run)) throw new Error('Audit allocation rejected.');
    finishRunCycle(run); nextRunCycle(run);
  }
  const c = run.cities.find(c => c.id === cityId);
  return {
    outputPerWorker: c.outputPerWorker, output: c.output,
    productivityGrowthPercent: (c.outputPerWorker / run.initialCities.find(x => x.id === cityId).outputPerWorker - 1) * 100,
    technologyIndex: c.technology * GAME_BALANCE.technologyDisplayScale,
    education: c.education, adoptionPercent: c.technologyAdoption * 100,
    capacityCoveragePercent: c.resourceAdequacy * 100, labor: c.labor,
    gapChangePercent: run.gapChangePercent,
    cycleProductivityGains: c.history.map(h => h.outputPerWorkerChange),
    firstConstraintCycle: c.history.find(h => h.endState.constraints.resourceShortage)?.cycle ?? null,
    allocations: c.history.map(h => h.allocation),
    rival: run.cities.find(x => x.id === run.rivalCity),
  };
}
const requestedNames = Object.keys(fixed).slice(0, 5);
const results = {};
const gridLeaders = {};
let gridRuns = 0;
for (const id of ['meridian', 'rivermark']) {
  results[id] = Object.fromEntries(Object.entries(fixed).map(([name, a]) => [name, simulate(id, a)]));
  results[id]['Capital early, research late'] = simulate(id, cycle => cycle <= 2 ? fixed['10/4/3/3'] : fixed['2/3/8/7']);
  results[id]['Research early, capital late'] = simulate(id, cycle => cycle <= 2 ? fixed['2/3/8/7'] : fixed['10/4/3/3']);
  const grid = [];
  for (let k = 0; k <= 20; k += 2) for (let r = 0; r <= 20 - k; r += 2) for (let t = 0; t <= 20 - k - r; t += 2) {
    const allocation = [k, r, t, 20 - k - r - t];
    const result = simulate(id, allocation); gridRuns++;
    if (![result.output, result.outputPerWorker, result.labor, result.technologyIndex].every(v => Number.isFinite(v) && v > 0)) throw new Error('Nonfinite or nonpositive economy in sweep.');
    grid.push({ allocation, outputPerWorker: result.outputPerWorker, capacityCoveragePercent: result.capacityCoveragePercent });
  }
  gridLeaders[id] = grid.sort((a, b) => b.outputPerWorker - a.outputPerWorker).slice(0, 5);
}
const winner = id => requestedNames.reduce((best, name) => results[id][name].outputPerWorker > results[id][best].outputPerWorker ? name : best, requestedNames[0]);
const balanceFailure = winner('meridian') === winner('rivermark');
const doctrines = {};
for (const cpuCity of ['meridian', 'rivermark']) {
  const playerId = cpuCity === 'meridian' ? 'rivermark' : 'meridian';
  doctrines[cpuCity] = {};
  for (const [id, doctrine] of Object.entries(CPU_DOCTRINES)) if (doctrine.cities.includes(cpuCity)) {
    const r = simulate(playerId, fixed['5/5/5/5'], id).rival;
    doctrines[cpuCity][id] = { name: doctrine.name, outputPerWorker: r.outputPerWorker, technologyIndex: r.technology * GAME_BALANCE.technologyDisplayScale, capacityCoveragePercent: r.resourceAdequacy * 100, allocations: r.history.map(h => h.allocation) };
  }
}
// Keep the audit artifact compact, without duplicated rival histories.
for (const city of Object.values(results)) for (const r of Object.values(city)) delete r.rival;
const startingStates = createCities().map(({ history, ...state }) => state);
const artifact = { balanceFailure, testedAgainst: 'Independent Balanced Growth CPU; same doctrine for each paired comparison', startingStates, requestedWinners: { meridian: winner('meridian'), rivermark: winner('rivermark') }, results, doctrines, gridRuns, gridLeaders, GAME_BALANCE, CPU_DOCTRINES };
await fs.writeFile(new URL('./balance-results.json', import.meta.url), JSON.stringify(artifact, null, 2) + '\n');
console.log(JSON.stringify({ balanceFailure, requestedWinners: artifact.requestedWinners, finalProductivity: Object.fromEntries(Object.entries(results).map(([id, rows]) => [id, Object.fromEntries(Object.entries(rows).map(([name, r]) => [name, +r.outputPerWorker.toFixed(2)]))])), gridRuns, gridLeaders, doctrines: Object.fromEntries(Object.entries(doctrines).map(([id, rows]) => [id, Object.fromEntries(Object.entries(rows).map(([name, r]) => [name, +r.outputPerWorker.toFixed(2)]))])) }, null, 2));
if (balanceFailure) process.exitCode = 1;
