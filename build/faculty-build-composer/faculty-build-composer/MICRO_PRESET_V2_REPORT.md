# Faculty Concept Composer — Microeconomics Starter Combination V2

## Final verdict

**READY FOR HOSTED WEBSITE TESTING**

## Root cause

The microeconomics concepts were present in the Composer library and area classification, but the `PRESETS` array did not include a starter combination for the new micro sequence.

The screenshot also showed the older HTML still being served because its Course area selector displayed **All areas**. The corrected HTML displays **Choose a course area** until faculty select General economics, Microeconomics, or Macroeconomics.

## New starter combination

**Microeconomics: firms and markets**

Description:

> Elasticity, surplus, trade, production costs, and firm behavior across market structures.

Included concepts:

1. Elasticity
2. Consumer and Producer Surplus
3. International Trade and Trade Policy
4. Costs of Production
5. Perfect Competition
6. Monopoly
7. Monopolistic Competition
8. Oligopoly

The existing **Market fundamentals** combination remains available for demand, supply, equilibrium, price signals, controls, and taxes.

## Files changed

- `build/faculty-build-composer/index.html`
- `build/faculty-build-composer/composer.js`

## Cache update

All Composer asset query strings now use:

`20260805-area-gated-concepts-v2`

## Validation

- JavaScript syntax: PASS
- Current concepts in library: 72
- New micro preset concept IDs found: 8/8
- New preset appears exactly once: PASS
- Area-gated HTML prompt present: PASS
- Legacy **All areas** default removed: PASS
