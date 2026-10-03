import { GAME_BALANCE as B, CYCLES } from './config.js';
import { createCities, emptyAllocation, adjustAllocation, validAllocation, advanceRegion, gapReport } from './model.js';
import { selectDoctrine, validDoctrines, cpuAllocation } from './cpu.js';

export function createRun(playerCity, { random = Math.random, previousDoctrine = null, doctrine = null } = {}) {
  const cities = createCities();
  if (!cities.some(c => c.id === playerCity)) throw new Error('Choose an economy to manage.');
  const rivalCity = cities.find(c => c.id !== playerCity).id;
  const rivalDoctrine = doctrine ?? selectDoctrine(rivalCity, random, previousDoctrine);
  if (!validDoctrines(rivalCity).includes(rivalDoctrine)) throw new Error('Invalid rival doctrine.');
  const gap = gapReport(cities, cities);
  return { playerCity, rivalCity, rivalDoctrine, cities, initialCities: createCities(), currentCycle: 1, phase: 'planning',
    allocation: emptyAllocation(), committedAllocations: null, pendingCities: null,
    productivityGapStart: gap.start, productivityGapEnd: gap.finish, gapChangePercent: 0,
  };
}
export function allocatePoint(run, category, delta) {
  if (run.phase !== 'planning') return false;
  const next = adjustAllocation(run.allocation, category, delta);
  const changed = next !== run.allocation;
  run.allocation = next;
  const player = run.cities.find(c => c.id === run.playerCity);
  player.developmentPoints = B.developmentPointsPerCycle - Object.values(next).reduce((a, b) => a + b, 0);
  return changed;
}
export function commitRun(run) {
  if (run.phase !== 'planning' || !validAllocation(run.allocation)) return false;
  const rival = run.cities.find(c => c.id === run.rivalCity);
  const plans = { [run.playerCity]: { ...run.allocation }, [run.rivalCity]: cpuAllocation(rival, run.rivalDoctrine) };
  // Resolve a transaction first; publish its stocks only when the visual transition finishes.
  const result = advanceRegion(run.cities, plans, run.currentCycle, { [run.rivalCity]: run.rivalDoctrine });
  run.committedAllocations = plans; run.pendingCities = result; run.phase = 'building';
  return true;
}
export function finishRunCycle(run) {
  if (run.phase !== 'building') return false;
  run.cities = run.pendingCities; run.pendingCities = null; run.phase = 'resolved';
  const gap = gapReport(run.initialCities, run.cities);
  run.productivityGapEnd = gap.finish; run.gapChangePercent = gap.gapChangePercent;
  return true;
}
export function nextRunCycle(run) {
  if (run.phase !== 'resolved') return false;
  if (run.currentCycle === CYCLES.length) { run.phase = 'finished'; return true; }
  run.currentCycle++; run.phase = 'planning'; run.allocation = emptyAllocation(); run.committedAllocations = null;
  for (const city of run.cities) city.developmentPoints = B.developmentPointsPerCycle;
  return true;
}
// Serializable internal state for future local export. No external telemetry.
export function snapshotRun(run) { return run ? structuredClone(run) : null; }
