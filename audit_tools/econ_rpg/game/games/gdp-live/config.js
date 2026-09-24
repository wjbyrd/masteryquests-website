export const CONFIG = Object.freeze({
  title: 'GDP Live', gameID: 'gdp-live',
  baseline: Object.freeze({ C: 17000, I: 4000, G: 4500, X: 3000, M: 3500 }),
  phaseLengths: Object.freeze({ basic: 4, traps: 4, multi: 3 }),
  animationMs: 650,
  shock: Object.freeze({ C: 40, I: -25, G: 10, X: 8, M: 13 }),
});
export const ACCOUNTS = Object.freeze({ C: 'Consumption', I: 'Investment', G: 'Government Purchases', X: 'Exports', M: 'Imports', NC: 'Not Counted' });
export const COMPONENTS = Object.freeze(['C', 'I', 'G', 'X', 'M']);
export const PHASES = Object.freeze({ basic: 'Basic posting', traps: 'Accounting traps', multi: 'Across the border' });
