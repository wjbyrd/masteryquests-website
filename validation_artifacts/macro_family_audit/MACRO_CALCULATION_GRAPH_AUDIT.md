# Macro Calculation and Graph Audit

## Calculation inventory

The registry reports **246 calculation-linked records**, including **149 dedicated Calculation-pool records**. Calculation breadth is concentrated appropriately: GDP/value added/components/deflator; CPI/inflation/indexing/real interest; growth/rule of 70/productivity; unemployment/participation; reserve and money multipliers; quantity theory/Fisher; fiscal multipliers/crowding out; sacrifice ratio.

| Family | Concept | Dedicated Calculation | Calculation-linked |
| --- | --- | --- | --- |
| F1 — GDP and National Output | gdp-measurement | 6 | 12 |
| F1 — GDP and National Output | gdp-components | 7 | 10 |
| F1 — GDP and National Output | real-versus-nominal-gdp | 3 | 12 |
| F1 — GDP and National Output | limits-of-gdp | 0 | 1 |
| F2 — Inflation Measurement and Real Values | cpi-and-inflation-measurement | 21 | 32 |
| F2 — Inflation Measurement and Real Values | indexing-and-real-values | 7 | 16 |
| F2 — Inflation Measurement and Real Values | real-versus-nominal-interest-rates | 3 | 8 |
| F3 — Growth and Productivity | living-standards-and-growth | 6 | 22 |
| F3 — Growth and Productivity | productivity-measurement | 6 | 13 |
| F4 — Unemployment and Labor | unemployment-measurement | 8 | 16 |
| F4 — Unemployment and Labor | natural-rate-of-unemployment | 0 | 3 |
| F4 — Unemployment and Labor | labor-market-institutions | 0 | 5 |
| F5 — Money, Banking, and Fed Operations | money-functions-and-measures | 3 | 4 |
| F5 — Money, Banking, and Fed Operations | bank-money-creation | 30 | 29 |
| F5 — Money, Banking, and Fed Operations | monetary-policy-tools | 2 | 2 |
| F5 — Money, Banking, and Fed Operations | monetary-control-limits | 2 | 2 |
| F6 — Money Growth, Inflation, and Neutrality | quantity-theory-of-money | 12 | 15 |
| F6 — Money Growth, Inflation, and Neutrality | monetary-neutrality | 4 | 5 |
| F6 — Money Growth, Inflation, and Neutrality | fisher-effect | 8 | 8 |
| F9 — Fiscal and Stabilization Policy | fiscal-policy-and-aggregate-demand | 4 | 7 |
| F9 — Fiscal and Stabilization Policy | fiscal-multipliers-and-crowding-out | 12 | 13 |
| F10 — Phillips Curve and Disinflation | sacrifice-ratio | 4 | 10 |
| F10 — Phillips Curve and Disinflation | disinflation-and-policy | 0 | 1 |

Static template normalization found repeated number-swap families in CPI inflation rates, unemployment/participation, GDP components, productivity, Fisher/real-rate calculations, money multipliers, quantity theory, fiscal multipliers, and sacrifice ratio. These are legitimate practice only when difficulty, scenario, or reasoning changes; otherwise flag `CALCULATION_MONOTONY`. Answer choices generally carry the required unit and yield exact-choice results; explicit rounding rules are rare. M2 should state rounding only when the result is not exact and keep percent/percentage-point, billion/trillion, index, and rate units consistent.

## Graph inventory

There are **236 graph-linked Macro records**, **33 concept-scoped asset copies**, and only **8 unique image hashes**.

| Family | Graph-linked records | Asset copies | Unique images |
| --- | --- | --- | --- |
| F6 — Money Growth, Inflation, and Neutrality | 32 | 5 | 1 |
| F7 — Money Market and Policy Transmission | 65 | 4 | 2 |
| F8 — AD-AS and Macroeconomic Equilibrium | 37 | 6 | 2 |
| F9 — Fiscal and Stabilization Policy | 43 | 6 | 4 |
| F10 — Phillips Curve and Disinflation | 45 | 7 | 2 |
| F11 — Integrated Macro Analysis | 14 | 5 | 5 |

The eight unique assets are AD-AS, AD-AS-LRAS, SRPC, LRPC, money-market shift, money-supply/value-of-money, two-panel money-market→AD, and multiplier/AD-shift. Visual inspection found all axes/curves/points readable at source resolution. Every image-linked stem explicitly references a graph/curve/point, so the cover-the-graph heuristic found no obvious decorative graph. The graph supplies the labeled states needed for the tasks.

Material defects and risks:

- **Accessibility:** all 33 Macro asset-manifest copies lack `imageAlt` and `graphDescription`; this is a systematic remediation requirement.
- **Task monotony:** 236 graph-linked records reuse eight unique images. Long-Run Adjustment, Equilibrium/Shocks, Money Market/Transmission, and Phillips families repeat the same labeled-state combinations.
- **Ambiguity:** `srpc.webp` labels two different plotted points “d”; any prompt referring only to point d is ambiguous.
- **Asset naming:** `moneymultiplier.webp` is an AD-shift diagram; the filename is legacy shorthand and can mislead maintenance even when the question match is valid.
- **Fake precision:** none of the inspected images requires interpolation beyond labeled guide points; M2 should preserve that constraint.

No graph files or accessibility metadata were modified in M1.
