# Macro Repair and Bridge Audit

## Findings

Macro has 205 Repair records, **zero Repair Seed records**, and 118 Bridge records. Raw counts overstate routing quality. Same-skill coverage is strong in the first four measurement families and AD-AS, but weak in several money/policy concepts because live ordinary skill keys do not match declared Repair-route keys. Missing `commonError` metadata is especially widespread in AD-AS Repair records; feedback is generally substantive, but deterministic misconception reporting is limited.

Repair calculations are often appropriate for measurement mistakes, but Fisher, money multiplication, multipliers, and sacrifice-ratio recovery should begin with one-error scaffold prompts before multi-step recomputation. No exact cross-concept Repair duplicate was detected; semantic repetition remains a manual-review issue.

| Concept | Repair | Repair Seed | Major skills | Same-skill covered | Coverage | Bridge | Flags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gdp-measurement | 6 | 0 | 3 | 3 | 100.0% | 3 | NO_REPAIR_SEEDS |
| gdp-components | 6 | 0 | 1 | 1 | 100.0% | 3 | NO_REPAIR_SEEDS |
| real-versus-nominal-gdp | 4 | 0 | 2 | 2 | 100.0% | 2 | NO_REPAIR_SEEDS |
| limits-of-gdp | 2 | 0 | 1 | 1 | 100.0% | 1 | THIN_REPAIR_POOL; THIN_BRIDGE_POOL; NO_REPAIR_SEEDS |
| cpi-and-inflation-measurement | 4 | 0 | 2 | 2 | 100.0% | 2 | NO_REPAIR_SEEDS |
| cpi-versus-gdp-deflator | 2 | 0 | 1 | 1 | 100.0% | 1 | THIN_REPAIR_POOL; THIN_BRIDGE_POOL; NO_REPAIR_SEEDS |
| cpi-bias | 4 | 0 | 2 | 2 | 100.0% | 2 | NO_REPAIR_SEEDS |
| indexing-and-real-values | 2 | 0 | 1 | 1 | 100.0% | 1 | THIN_REPAIR_POOL; THIN_BRIDGE_POOL; NO_REPAIR_SEEDS |
| real-versus-nominal-interest-rates | 2 | 0 | 1 | 1 | 100.0% | 1 | THIN_REPAIR_POOL; THIN_BRIDGE_POOL; NO_REPAIR_SEEDS |
| living-standards-and-growth | 4 | 0 | 3 | 1 | 33.3% | 2 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| productivity-measurement | 2 | 0 | 1 | 1 | 100.0% | 1 | THIN_REPAIR_POOL; THIN_BRIDGE_POOL; NO_REPAIR_SEEDS |
| sources-of-productivity | 6 | 0 | 5 | 5 | 100.0% | 6 | NO_REPAIR_SEEDS |
| economic-growth-policy | 2 | 0 | 1 | 1 | 100.0% | 1 | THIN_REPAIR_POOL; THIN_BRIDGE_POOL; NO_REPAIR_SEEDS |
| unemployment-measurement | 5 | 0 | 4 | 4 | 100.0% | 5 | NO_REPAIR_SEEDS |
| unemployment-types | 3 | 0 | 3 | 3 | 100.0% | 3 | THIN_REPAIR_POOL; NO_REPAIR_SEEDS |
| natural-rate-of-unemployment | 2 | 0 | 1 | 1 | 100.0% | 1 | THIN_REPAIR_POOL; THIN_BRIDGE_POOL; NO_REPAIR_SEEDS |
| labor-market-institutions | 2 | 0 | 3 | 2 | 66.7% | 2 | THIN_REPAIR_POOL; NO_REPAIR_SEEDS |
| money-functions-and-measures | 11 | 0 | 5 | 2 | 40.0% | 4 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| bank-money-creation | 10 | 0 | 1 | 0 | 0.0% | 6 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| central-bank-and-federal-reserve | 8 | 0 | 2 | 0 | 0.0% | 3 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| monetary-policy-tools | 7 | 0 | 5 | 2 | 40.0% | 3 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| monetary-control-limits | 4 | 0 | 2 | 1 | 50.0% | 3 | NO_REPAIR_SEEDS |
| quantity-theory-of-money | 8 | 0 | 3 | 1 | 33.3% | 5 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| monetary-neutrality | 7 | 0 | 4 | 2 | 50.0% | 4 | NO_REPAIR_SEEDS |
| fisher-effect | 4 | 0 | 1 | 0 | 0.0% | 2 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| inflation-costs | 7 | 0 | 8 | 3 | 37.5% | 4 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| inflation-tax-and-deflation | 3 | 0 | 4 | 1 | 25.0% | 2 | THIN_REPAIR_POOL; MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| liquidity-preference-and-money-market | 7 | 0 | 5 | 2 | 40.0% | 4 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| monetary-policy-transmission | 7 | 0 | 8 | 2 | 25.0% | 3 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| aggregate-demand | 5 | 0 | 4 | 4 | 100.0% | 2 | NO_REPAIR_SEEDS |
| aggregate-supply | 6 | 0 | 4 | 4 | 100.0% | 4 | NO_REPAIR_SEEDS |
| macroeconomic-equilibrium-and-shocks | 9 | 0 | 6 | 6 | 100.0% | 3 | NO_REPAIR_SEEDS |
| long-run-macroeconomic-adjustment | 5 | 0 | 2 | 2 | 100.0% | 2 | NO_REPAIR_SEEDS |
| fiscal-policy-and-aggregate-demand | 6 | 0 | 4 | 0 | 0.0% | 3 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| fiscal-multipliers-and-crowding-out | 9 | 0 | 2 | 1 | 50.0% | 5 | NO_REPAIR_SEEDS |
| stabilization-policy | 8 | 0 | 9 | 3 | 33.3% | 5 | MISSING_MISCONCEPTION_PATH; NO_REPAIR_SEEDS |
| short-run-phillips-curve | 5 | 0 | 5 | 5 | 100.0% | 4 | NO_REPAIR_SEEDS |
| phillips-curve-expectations | 3 | 0 | 3 | 3 | 100.0% | 3 | THIN_REPAIR_POOL; NO_REPAIR_SEEDS |
| long-run-phillips-curve | 2 | 0 | 2 | 1 | 50.0% | 1 | THIN_REPAIR_POOL; THIN_BRIDGE_POOL; NO_REPAIR_SEEDS |
| sacrifice-ratio | 3 | 0 | 1 | 1 | 100.0% | 3 | THIN_REPAIR_POOL; NO_REPAIR_SEEDS |
| disinflation-and-policy | 2 | 0 | 3 | 2 | 66.7% | 2 | THIN_REPAIR_POOL; NO_REPAIR_SEEDS |
| integrated-macroeconomic-analysis | 1 | 0 | 0 | 0 | 0.0% | 1 | THIN_REPAIR_POOL; MISSING_MISCONCEPTION_PATH; THIN_BRIDGE_POOL; NO_REPAIR_SEEDS |

## Highest-priority misconceptions

| Family | Recovery targets |
| --- | --- |
| F1 — GDP and National Output | final vs intermediate goods; transfer/used/nonmarket production; expenditure-income identity; nominal price change vs real output; GDP vs welfare |
| F2 — Inflation Measurement and Real Values | fixed basket vs current output; substitution/new-good/quality bias; imported goods; indexation; ex ante vs ex post real rates |
| F3 — Growth and Productivity | level vs growth rate; productivity numerator/denominator; physical vs human capital; catch-up and diminishing returns; policy tradeoffs |
| F4 — Unemployment and Labor | unemployed vs not in labor force; discouraged workers; frictional/structural/cyclical; natural rate components; institution effects |
| F5 — Money, Banking, and Fed Operations | money vs wealth/income; reserve ratio vs multiplier; capital vs reserves; Fed institution vs tool; policy control leakages |
| F6 — Money Growth, Inflation, and Neutrality | MV=PY comparative statics; nominal vs real neutrality; Fisher direction; expected vs unexpected inflation; inflation tax vs deflation |
| F7 — Money Market and Policy Transmission | money demand shifters vs movement; money supply shifts; interest-investment-AD sequence; direction reversals and omitted links |
| F8 — AD-AS and Macroeconomic Equilibrium | AD vs AS shifters; movement vs shift; short-run vs long-run equilibrium; self-correction; demand vs supply shocks |
| F9 — Fiscal and Stabilization Policy | first-round vs multiplied effect; spending vs tax multiplier; crowding out; automatic vs discretionary policy; lag/uncertainty |
| F10 — Phillips Curve and Disinflation | movement along vs shift of SRPC; expected inflation; natural-rate vertical LRPC; sacrifice-ratio denominator; credibility and disinflation |
| F11 — Integrated Macro Analysis | locating the broken link in multi-model chains rather than replaying one-step topic repair |

## Bridge pathways

| Family | Priority connections for future Bridge authoring | Current issue |
| --- | --- | --- |
| F1 | GDP Measurement → Components → Real/Nominal → Limits | Most “Bridge” records are same-skill checks with no destination metadata. |
| F2 | CPI → CPI/Deflator → Bias → Indexing/Real Values → Real Interest | Only 3 of 7 Bridge records declare a secondary destination. |
| F3 | Productivity Measurement → Sources → Living Standards → Policy | 9 of 10 have a destination; preserve this stronger pattern. |
| F4 | Measurement → Types → Natural Rate → Institutions | 4 of 11 declare destinations; natural-rate connection is thin. |
| F5 | Money Measures → Bank Creation → Fed → Tools → Control Limits | 19 records but only 3 destination-tagged; quantity is not the issue. |
| F6 | Quantity Theory → Neutrality → Fisher → Inflation Costs/Tax/Deflation | 17 records, no explicit destination IDs; many are relabeled same-skill checks. |
| F7 | Money Market → Policy Transmission; Tools (F5) → Money Market | 7 records, 2 destination-tagged; this should be the cleanest cross-family chain. |
| F8 | AD + AS → Equilibrium/Shocks → Long-Run Adjustment | 11 Bridge records, none destination-tagged; many begin “Bridge check” without reconstructing two concepts. |
| F9 | Fiscal Policy → Multiplier/Crowding Out → Stabilization; Stabilization ↔ AD-AS | 13 records, 2 destination-tagged. |
| F10 | SRPC → Expectations → LRPC → Sacrifice Ratio → Disinflation | 13 records, none destination-tagged; the sequence is present in stems but not metadata. |
| F11 | Failed synthesis link → targeted family Repair → two-model Bridge → synthesis retest | One generic Repair and one generic Bridge cannot diagnose the integration bank. |

Flag interpretation: **THIN_REPAIR_POOL** is fewer than four records; **MISSING_MISCONCEPTION_PATH** is below 50% same-skill coverage among recurring ordinary skills; **THIN_BRIDGE_POOL** is fewer than two. `REPAIR_NOT_DIAGNOSTIC` applies where the route is generic or lacks a declared misconception; `BRIDGE_NOT_ACTUALLY_BRIDGING` applies to same-skill retests branded as Bridge. M2 should fix route quality before adding broad ordinary volume.
