// Scenario authoring helpers, not a second transition engine. These compile
// comparisons into the shared engine's ordinary, serializable conditions.
export const chosen = id => ({ chosen: id });
export const all = (...conditions) => ({ all: conditions });
export const any = (...conditions) => ({ any: conditions });
export const not = condition => ({ not: condition });
export const eq = (state, value) => ({ state, op: 'eq', value });
export const gte = (state, value) => ({ state, op: 'gte', value });
export const lte = (state, value) => ({ state, op: 'lte', value });
export const stageChosen = (node, ids) => any(...ids.map(id => chosen(`${node}.${id}`)));
const clamp = n => Math.max(0, Math.min(8, n));
const opening = { premium: -2, moderate: 0, introductory: 1 };
const later = { keep: 0, moderate: -1, aggressive: -3 };
const breakoutChoice = id => any(chosen(`breakout.${id}`), chosen(`breakout-rebuild.${id}`));
const breakout = any(...Object.keys(later).map(breakoutChoice));
const prices = Object.entries(opening).flatMap(([first, offset]) => [
  { offset, when: all(chosen(`pricing.${first}`), not(breakout)) },
  ...Object.entries(later).map(([second, change]) => ({ offset: offset + change, when: all(chosen(`pricing.${first}`), breakoutChoice(second)) }))
]);
function market(demand, supply, offset) {
  const wanted = clamp(demand + offset);
  return { wanted, supply, sold: Math.min(wanted, supply), status: wanted > supply ? 'shortage' : wanted < supply ? 'surplus' : 'balanced' };
}
// Ordinal illustrations only: preference strength and posted price jointly
// determine ticket purchases. Neither this derived value nor price is a sixth
// saved indicator. Price stays in choice history; demand never means attendance.
export function ticketMarket(run) {
  const first = run.history.find(h => h.nodeID === 'pricing');
  const second = run.history.find(h => h.nodeID.startsWith('breakout'));
  return market(run.state.demand, run.state.supply, (opening[first?.choiceID] ?? 0) + (later[second?.choiceID] ?? 0));
}
export function marketCondition(predicate, change = {}) {
  const branches = [];
  for (const price of prices) for (let supply = 0; supply <= 8; supply++) {
    const values = [];
    for (let demand = 0; demand <= 8; demand++) {
      const before = market(demand, supply, price.offset);
      const after = market(clamp(demand + (change.demand || 0)), clamp(supply + (change.supply || 0)), price.offset + (change.price || 0));
      if (predicate(after, before)) values.push(demand);
    }
    if (values.length) branches.push(all(price.when, eq('supply', supply), any(...values.map(value => eq('demand', value)))));
  }
  // An empty match remains a valid, always-false engine condition.
  return branches.length ? any(...branches) : eq('demand', -1);
}
export const marketIs = status => marketCondition(m => m.status === status);
export const marketCopy = {
  surplus: 'At the posted price, fewer tickets are wanted than are available. Empty seats put downward pressure on price.',
  balanced: 'Ticket purchases now match the available seats, with neither unsold capacity nor fans left seeking tickets at this price.',
  shortage: 'More tickets are wanted at the posted price than are available. Shows sell out, some fans miss out, and resale offers rise above the official price. That extra payment goes to resellers, not Jules.'
};
// Outcomes incorporate actual sales changes at an unchanged price. Stronger
// demand cannot raise ticket receipts when all remaining seats already sell.
export function salesOutcomes(change, lead) {
  const results = [];
  for (const status of ['surplus', 'balanced', 'shortage']) for (const direction of [-1, 0, 1]) {
    const receipts = direction > 0 ? 'More tickets sell, strengthening tour receipts.' : direction < 0 ? 'Fewer tickets sell, weakening tour receipts.' : 'The number of tickets sold is unchanged, so ticket receipts do not rise or fall from this change.';
    results.push({ when: marketCondition((after, before) => after.status === status && Math.sign(after.sold - before.sold) === direction, change),
      effects: { revenue: direction }, consequence: `${lead} ${marketCopy[status]} ${receipts}` });
  }
  return results;
}
