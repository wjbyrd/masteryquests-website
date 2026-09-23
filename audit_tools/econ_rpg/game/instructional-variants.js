// Small validated surface-value pools only. No game-state or engine randomness.
export const PARK_VARIANTS = Object.freeze([
  { id: 'park-a', beforeQ: 100, beforeP: 50, afterQ: 110, afterP: 48, extraCost: 350 },
  { id: 'park-b', beforeQ: 120, beforeP: 45, afterQ: 135, afterP: 43, extraCost: 300 },
  { id: 'park-c', beforeQ: 80, beforeP: 60, afterQ: 92, afterP: 57, extraCost: 444 },
  { id: 'park-d', beforeQ: 150, beforeP: 40, afterQ: 175, afterP: 38, extraCost: 500 }
].map(Object.freeze));
export const HOUSING_VARIANTS = Object.freeze([
  { id: 'homes-a', repaired: 80, supported: 50, baseline: 30 },
  { id: 'homes-b', repaired: 90, supported: 60, baseline: 25 },
  { id: 'homes-c', repaired: 65, supported: 45, baseline: 20 },
  { id: 'homes-d', repaired: 100, supported: 70, baseline: 50 }
].map(Object.freeze));

// A new run already gets a random UUID. Hash only that ID (not choices, state,
// or ending), with a template salt. Resume/reload keeps the same variant. Tests
// can supply an explicit index; there is no player-facing seed/QA control.
export function variantIndex(run, template, override) {
  if (override !== undefined) {
    if (!Number.isInteger(override) || override < 0 || override > 3) throw new RangeError('Variant index must be 0–3');
    return override;
  }
  let hash = 2166136261;
  for (const c of `${template}:${run.runID}`) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  return hash % 4;
}
export function parkValues(v) {
  const beforeTR = v.beforeP * v.beforeQ, afterTR = v.afterP * v.afterQ;
  const extraQ = v.afterQ - v.beforeQ, lostRevenue = (v.beforeP - v.afterP) * v.beforeQ;
  const addedRevenue = extraQ * v.afterP, deltaTR = afterTR - beforeTR;
  return { beforeTR, afterTR, extraQ, lostRevenue, addedRevenue, deltaTR,
    deltaProfit: deltaTR - v.extraCost, incrementalRevenue: deltaTR / extraQ };
}
const money = n => `$${n.toLocaleString('en-US')}`;
const profit = n => n === 0 ? 'Profit is unchanged.' : `Profit ${n > 0 ? 'rises' : 'falls'} by ${money(Math.abs(n))}.`;
function rotate(options, correct, index) {
  const ordered = options.slice(index).concat(options.slice(0, index));
  return { options: ordered, correct: (correct - index + options.length) % options.length };
}
export function parkQuestion(index) {
  const v = PARK_VARIANTS[index], x = parkValues(v);
  return {
    id: 'attraction-margin', variantID: v.id,
    prompt: `A different park sells ${v.beforeQ} tickets at ${money(v.beforeP)}. Cutting the single price to ${money(v.afterP)} sells ${v.afterQ} tickets. Serving the extra guests costs ${money(v.extraCost)} more. With all other costs unchanged, what happens to profit?`,
    ...rotate([
      { text: profit(x.deltaProfit), feedback: '' },
      { text: profit(x.addedRevenue - v.extraCost), feedback: `That counts revenue from the ${x.extraQ} extra tickets but misses the price cut on the original ${v.beforeQ} sales. Those customers pay ${money(v.beforeP - v.afterP)} less each. Include that lost revenue.` },
      { text: profit(x.deltaTR), feedback: `That is the change in revenue, not profit. The extra guests also add ${money(v.extraCost)} in costs. Compare the revenue change with that extra cost.` }
    ], 0, index % 3),
    explanation: `Revenue before: ${money(v.beforeP)} × ${v.beforeQ} = ${money(x.beforeTR)}; after: ${money(v.afterP)} × ${v.afterQ} = ${money(x.afterTR)}. The price cut loses ${money(v.beforeP - v.afterP)} × ${v.beforeQ} = ${money(x.lostRevenue)} on existing sales. The ${x.extraQ} extra tickets bring in ${money(x.addedRevenue)}. Net extra revenue: ${money(x.addedRevenue)} − ${money(x.lostRevenue)} = ${money(x.deltaTR)}. Subtract ${money(v.extraCost)} extra cost. ${profit(x.deltaProfit)} Incremental revenue averages ${money(x.incrementalRevenue)} per extra guest, below the ${money(v.afterP)} price because existing customers also pay less.`
  };
}
export function housingQuestion(index) {
  const v = HOUSING_VARIANTS[index], additional = v.supported - v.baseline;
  return {
    id: 'housing-additionality', variantID: v.id,
    prompt: `A different city funds repairs to ${v.repaired} occupied apartments and supports ${v.supported} new units. Of those new units, ${v.baseline} would have been built anyway. How many additional units does this create relative to no program?`,
    ...rotate([
      { text: `${v.repaired + v.supported} units`, feedback: `Repairs improve ${v.repaired} existing occupied homes; they are not new apartments. Also subtract construction that would have occurred without the program.` },
      { text: `${v.supported} units`, feedback: `That counts every supported new unit. Compare with the no-program baseline: ${v.baseline} of them would have been built anyway.` },
      { text: `${additional} units`, feedback: '' }
    ], 2, index % 3),
    explanation: `${v.supported} − ${v.baseline} = ${additional} additional units. Repairing ${v.repaired} occupied apartments improves existing housing; it creates no new units in this example. A supply subsidy can mitigate a ceiling’s effects, but spending is not the same as additional supply.`
  };
}
