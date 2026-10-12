// Explicit instructional boundary for this release. Inclusion requires baseline
// evidence as well: no concept can enter a game solely through this list.
const micro = [
 'production-possibilities-frontier','opportunity-cost','marginal-analysis',
 'scarcity-and-tradeoffs','market-equilibrium','demand','supply',
 'binding-price-ceilings','binding-price-floors','incentives',
 'positive-versus-normative-analysis','tax-wedges-and-revenue','tax-incidence',
 'statutory-versus-economic-tax-incidence','models-and-assumptions'
];
const measurement = [
 'gdp-components','gdp-measurement','real-versus-nominal-gdp','limits-of-gdp',
 'cpi-and-inflation-measurement','cpi-bias','cpi-versus-gdp-deflator',
 'indexing-and-real-values','real-versus-nominal-interest-rates',
 'living-standards-and-growth','productivity-measurement','sources-of-productivity',
 'economic-growth-policy','unemployment-measurement','unemployment-types',
 'natural-rate-of-unemployment','labor-market-institutions'
];
const money = [
 'deposit-creation-and-money-multiplier','monetary-policy-tools',
 'monetary-control-limits','bank-balance-sheets-reserves-and-capital',
 'money-functions-and-measures','central-bank-and-federal-reserve',
 'quantity-theory-of-money','monetary-neutrality','fisher-effect',
 'inflation-costs','inflation-tax-and-deflation','monetary-policy-transmission',
 'liquidity-preference-and-money-market','stabilization-policy','fiscal-multipliers-and-crowding-out',
 'fiscal-policy-and-aggregate-demand'
];
const fluctuations = [
 'demand-and-supply-shocks','long-run-macroeconomic-self-adjustment',
 'short-run-phillips-curve','disinflation-and-policy','phillips-curve-expectations',
 'sacrifice-ratio','long-run-phillips-curve','aggregate-demand',
 'long-run-aggregate-supply-and-potential-output','short-run-aggregate-supply','ad-as-equilibrium-and-output-gaps'
];
export const fullConcepts = {
 'market-gate':micro,
 'national-ledger':measurement,
 'equilibrium-crisis':[...micro,...measurement],
 'liquidity-grid':money,
 'stabilization-protocol':[...money,...fluctuations]
};
// Introductory mentions must not open an entire advanced family. Only a skill
// already represented in that game can receive additional practice here.
export const existingSkillOnlyConcepts = [
 'competitive-markets','price-signals','gains-from-trade','micro-versus-macro',
 'economist-policy-role'
];
// Existing integrated and incidental items are updated, but are not used as a
// gateway into the composer's much broader synthesis/political-economy banks.
export const excludedExpansionConcepts = [
 'integrated-economic-analysis','integrated-macroeconomic-analysis',
 'budget-accounting-and-public-saving',
 'information-asymmetry-behavioral-and-political-economy'
 ,'market-failures'
];
export const limits = {ordinaryPerConceptDifficulty:2,checkpointPerConceptStage:1,supportPerCoveredRoute:2};
export const excludedExpansionText = /\b(exchange rates?|currency appreciation|currency depreciation|net capital outflows?|balance of payments|current account|tariffs?|loanable funds)\b/i;

