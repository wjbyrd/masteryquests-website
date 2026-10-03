import { GAME_BALANCE as B, CPU_DOCTRINES, CATEGORIES } from './config.js';

export function validDoctrines(cityId) {
  return Object.keys(CPU_DOCTRINES).filter(id => CPU_DOCTRINES[id].cities.includes(cityId));
}
export function selectDoctrine(cityId, random = Math.random, previous = null) {
  const valid = validDoctrines(cityId);
  const pool = valid.length > 1 ? valid.filter(id => id !== previous) : valid;
  return pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))];
}
// This function receives ONLY the CPU's state and doctrine. It cannot inspect
// the player's allocation, stocks, controls, or uncommitted decisions.
export function cpuAllocation(city, doctrineId) {
  if (!validDoctrines(city.id).includes(doctrineId)) throw new Error('Invalid doctrine for this rival city.');
  const d = CPU_DOCTRINES[doctrineId], rule = B.cpu;
  const weights = { ...d.weights };
  const maturity = city.capitalPerWorker / (city.capitalPerWorker + rule.capitalMaturityScale);
  weights.capital -= d.capitalShift * maturity;
  weights.research += d.researchShift * maturity;
  const trainingShift = (d.educationToResearch || 0) * city.education / (city.education + rule.educationReadinessScale);
  weights.education -= trainingShift;
  weights.research += trainingShift;
  weights.resources += Math.max(0, city.resourceUtilization - rule.resourceTargetUtilization) * rule.resourceResponse * d.resourceResponse;
  weights.education += Math.max(0, rule.adoptionTarget - city.technologyAdoption) * rule.educationResponse * d.educationResponse;
  for (const key of Object.keys(weights)) weights[key] = Math.max(rule.minimumWeight, weights[key]);
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const shares = CATEGORIES.map((c, index) => ({ key: c.id, index, exact: weights[c.id] / total * B.developmentPointsPerCycle }));
  const result = Object.fromEntries(shares.map(s => [s.key, Math.floor(s.exact)]));
  let remaining = B.developmentPointsPerCycle - Object.values(result).reduce((a, b) => a + b, 0);
  // Largest remainders produce a deterministic, nonnegative integer plan totaling 20.
  shares.sort((a, b) => (b.exact % 1) - (a.exact % 1) || a.index - b.index);
  for (let i = 0; remaining > 0; i++, remaining--) result[shares[i].key]++;
  return result;
}
