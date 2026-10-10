import { COSTS, TOTAL_PRODUCT, LIMITS } from './config.js';

const integer = (n, max) => Math.max(0, Math.min(max, Math.trunc(Number(n) || 0)));
export function normalize(plan) {
  const trucks = Math.max(1, integer(plan.trucks, LIMITS.trucks));
  return { trucks, grills: [0, 1].map(i => i < trucks && !!plan.grills?.[i]),
    workers: [0, 1].map(i => i < trucks ? integer(plan.workers?.[i], LIMITS.workers) : 0),
    target: integer(plan.target, LIMITS.target), kits: integer(plan.kits, LIMITS.kits) };
}
export const equipmentKey = plan => `${plan.trucks}:${plan.grills.slice(0, plan.trucks).map(Number).join('')}`;
export const equipmentLabel = plan => `${plan.trucks} truck${plan.trucks === 1 ? '' : 's'} · grills ${plan.grills.slice(0, plan.trucks).map((on, i) => on ? 'AB'[i] : '').filter(Boolean).join(' + ') || 'none'}`;
export function evaluate(input, costs = COSTS) {
  const plan = normalize(input);
  const capacityByTruck = plan.workers.map((n, i) => plan.grills[i] ? TOTAL_PRODUCT[n] : 0);
  const capacity = capacityByTruck.reduce((a, b) => a + b, 0);
  const output = Math.min(plan.target, capacity, plan.kits);
  const workers = plan.workers.reduce((a, b) => a + b, 0);
  const FC = costs.truck * plan.trucks + costs.grill * plan.grills.filter(Boolean).length;
  const labor = costs.shifts * workers * costs.wage;
  const ingredients = costs.shifts * plan.kits * costs.kit;
  const VC = labor + ingredients, TC = FC + VC, Q = costs.shifts * output;
  return { plan, key: equipmentKey(plan), capacityByTruck, capacity, output, Q, workers,
    shortfall: plan.target - output, unused: plan.kits - output, idle: capacity - output,
    feasible: output === plan.target, FC, labor, ingredients, VC, TC,
    AFC: Q ? FC / Q : null, AVC: Q ? VC / Q : null, ATC: Q ? TC / Q : null };
}

// Exhaust all feasible integer allocations under this equipment, including idle trucks.
// Paying a worker in an unequipped truck cannot improve the minimum-cost reference.
export function allocations(input) {
  const plan = normalize(input), rows = [];
  for (let a = 0; a <= (plan.grills[0] ? LIMITS.workers : 0); a++) {
    for (let b = 0; b <= (plan.grills[1] ? LIMITS.workers : 0); b++) {
      rows.push({ workers: [a, b], labor: a + b, capacity: TOTAL_PRODUCT[a] + TOTAL_PRODUCT[b] });
    }
  }
  return rows.sort((a, b) => a.labor - b.labor || b.capacity - a.capacity || b.workers[0] - a.workers[0]);
}
export function minimumPlan(input, output, costs = COSTS) {
  if (!Number.isInteger(output) || output < 0) return null;
  const best = allocations(input).find(row => row.capacity >= output);
  return best ? evaluate({ ...input, target: output, kits: output, workers: best.workers }, costs) : null;
}
export function minimumSchedule(input, costs = COSTS) {
  const max = Math.max(...allocations(input).map(row => row.capacity));
  return Array.from({ length: max + 1 }, (_, output) => minimumPlan(input, output, costs));
}
// At each total staffing level use its highest attainable output, then buy exactly
// that many kits. MC uses consecutive endpoints of THIS equipment's frontier only.
export function marginalSchedule(input, costs = COSTS) {
  const rows = allocations(input), frontier = [];
  for (let labor = 0; labor <= LIMITS.workers * LIMITS.trucks; labor++) {
    const allocation = rows.find(row => row.labor === labor);
    if (!allocation) continue;
    const result = evaluate({ ...input, target: allocation.capacity, kits: allocation.capacity, workers: allocation.workers }, costs);
    const previous = frontier.at(-1);
    const deltaQ = previous ? result.Q - previous.Q : 0;
    frontier.push({ ...result, fromQ: previous?.Q ?? 0, MP: previous ? result.output - previous.output : null,
      MC: deltaQ > 0 ? (result.TC - previous.TC) / deltaQ : null });
  }
  return frontier;
}
export function enrich(input, costs = COSTS) {
  const result = evaluate(input, costs), minimum = minimumPlan(result.plan, result.output, costs);
  const endpoint = marginalSchedule(result.plan, costs).find(row => row.output === result.output);
  return { ...result, minimum, avoidable: result.TC - minimum.TC,
    // An actual trial is a frontier endpoint only when it uses the efficient inputs.
    MC: endpoint && Math.abs(result.TC - endpoint.TC) < 1e-8 ? endpoint.MC : null };
}
// Routine play purchases exactly the feasible target quantity; no hidden waste.
export function autoIngredients(input, costs = COSTS) {
  const capacity = evaluate({ ...input, kits: 0 }, costs).capacity;
  const plan = normalize(input);
  return enrich({ ...plan, kits: Math.min(plan.target, capacity) }, costs);
}
// Engine results retain the original monthly contract. Views use this single
// conversion so chart axes and operating bills never mix accounting periods.
export function perService(result, costs = COSTS) {
  return { ...result, Q: result.output, FC: result.FC / costs.shifts, labor: result.labor / costs.shifts,
    ingredients: result.ingredients / costs.shifts, VC: result.VC / costs.shifts, TC: result.TC / costs.shifts,
    avoidable: result.avoidable === undefined ? undefined : result.avoidable / costs.shifts };
}
export function operatingChange(previous, current, costs = COSTS) {
  if (!previous) return null;
  const deltaOutput = current.output - previous.output;
  const deltaCost = (current.TC - previous.TC) / costs.shifts;
  return { deltaOutput, deltaCost, sameEquipment: previous.key === current.key,
    // This is a comparison of actual plans, NEVER a reference MC observation.
    costPerExtra: deltaOutput > 0 ? deltaCost / deltaOutput : null };
}
