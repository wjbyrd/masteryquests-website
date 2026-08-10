# Macro M2a Phillips Simulation Report

Deterministic sessions: **8,250**.

- Granular solo: 5 concepts × 5 modes × 150 = **3,750**.
- F10 family: 5 modes × 500 = **2,500**.
- Cross-family A–D: 4 configurations × 5 modes × 100 = **2,000**.

Five response patterns were distributed evenly: all correct, all incorrect, alternating, randomized ≈70% correct, and remediation-heavy/boss-failure. Incorrect paths exercised Repair, Bridge, and retest routing.

## Granular solo

| Slice | Mode | Sessions | Completed | Completion failures | Routing failures | Controlled duplicate selections | Graph exposures | Calculation exposures |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Short-Run Phillips Curve | Standard | 150 | 150 | 0 | 0 | 1050 | 1568 | 0 |
| Short-Run Phillips Curve | Timed Trial | 150 | 150 | 0 | 0 | 1500 | 1750 | 0 |
| Short-Run Phillips Curve | Exam Drill | 150 | 150 | 0 | 0 | 1500 | 1757 | 0 |
| Short-Run Phillips Curve | Legendary | 150 | 150 | 0 | 0 | 4050 | 1341 | 0 |
| Short-Run Phillips Curve | Score Attack | 150 | 150 | 0 | 0 | 1050 | 1559 | 0 |
| Phillips-Curve Expectations | Standard | 150 | 150 | 0 | 0 | 900 | 2140 | 0 |
| Phillips-Curve Expectations | Timed Trial | 150 | 150 | 0 | 0 | 1200 | 2177 | 0 |
| Phillips-Curve Expectations | Exam Drill | 150 | 150 | 0 | 0 | 1200 | 2176 | 0 |
| Phillips-Curve Expectations | Legendary | 150 | 150 | 0 | 0 | 4050 | 1344 | 0 |
| Phillips-Curve Expectations | Score Attack | 150 | 150 | 0 | 0 | 900 | 2108 | 0 |
| Long-Run Phillips Curve | Standard | 150 | 150 | 0 | 0 | 1350 | 1415 | 0 |
| Long-Run Phillips Curve | Timed Trial | 150 | 150 | 0 | 0 | 1800 | 1251 | 0 |
| Long-Run Phillips Curve | Exam Drill | 150 | 150 | 0 | 0 | 1800 | 1234 | 0 |
| Long-Run Phillips Curve | Legendary | 150 | 150 | 0 | 0 | 4050 | 0 | 0 |
| Long-Run Phillips Curve | Score Attack | 150 | 150 | 0 | 0 | 1350 | 1442 | 0 |
| Sacrifice Ratio | Standard | 150 | 150 | 0 | 0 | 750 | 0 | 3659 |
| Sacrifice Ratio | Timed Trial | 150 | 150 | 0 | 0 | 1200 | 0 | 3043 |
| Sacrifice Ratio | Exam Drill | 150 | 150 | 0 | 0 | 1200 | 0 | 3031 |
| Sacrifice Ratio | Legendary | 150 | 150 | 0 | 0 | 4050 | 0 | 5400 |
| Sacrifice Ratio | Score Attack | 150 | 150 | 0 | 0 | 750 | 0 | 3669 |
| Disinflation and Policy | Standard | 150 | 150 | 0 | 0 | 1350 | 595 | 375 |
| Disinflation and Policy | Timed Trial | 150 | 150 | 0 | 0 | 1800 | 496 | 258 |
| Disinflation and Policy | Exam Drill | 150 | 150 | 0 | 0 | 1800 | 507 | 248 |
| Disinflation and Policy | Legendary | 150 | 150 | 0 | 0 | 4050 | 1354 | 1798 |
| Disinflation and Policy | Score Attack | 150 | 150 | 0 | 0 | 1350 | 577 | 378 |

Solo duplicates occur only after a mode exhausts the eligible unique pool. No immediate reuse occurs, and first reuse is exactly one ordinal after the available pool size.

## F10 family

| Mode | Sessions | Completed | Completion failures | Routing failures | Duplicate selections | Graph exposures | Calculation exposures |
|---|---:|---:|---:|---:|---:|---:|---:|
| Standard | 500 | 500 | 0 | 0 | 0 | 3951 | 2955 |
| Timed Trial | 500 | 500 | 0 | 0 | 0 | 3859 | 2385 |
| Exam Drill | 500 | 500 | 0 | 0 | 0 | 3937 | 2527 |
| Legendary | 500 | 500 | 0 | 0 | 0 | 2664 | 4816 |
| Score Attack | 500 | 500 | 0 | 0 | 0 | 3938 | 2836 |

Across 500 clean Legendary checks, every run used **27 unique ordinary Legendary records** and **9 unique Legendary Boss records** before reuse. Aggregate representation remained within 12%–35% for every sibling in ordinary, boss, Legendary, and Legendary Boss categories.

## Cross-family regression

| Configuration | Mode | Sessions | Completed | Completion failures | Routing failures | F10 main selections |
|---|---|---:|---:|---:|---:|---:|
| A | Standard | 100 | 100 | 0 | 0 | 2229 |
| A | Timed Trial | 100 | 100 | 0 | 0 | 1816 |
| A | Exam Drill | 100 | 100 | 0 | 0 | 1797 |
| A | Legendary | 100 | 100 | 0 | 0 | 2109 |
| A | Score Attack | 100 | 100 | 0 | 0 | 2224 |
| B | Standard | 100 | 100 | 0 | 0 | 2379 |
| B | Timed Trial | 100 | 100 | 0 | 0 | 1957 |
| B | Exam Drill | 100 | 100 | 0 | 0 | 1974 |
| B | Legendary | 100 | 100 | 0 | 0 | 2399 |
| B | Score Attack | 100 | 100 | 0 | 0 | 2417 |
| C | Standard | 100 | 100 | 0 | 0 | 2040 |
| C | Timed Trial | 100 | 100 | 0 | 0 | 1601 |
| C | Exam Drill | 100 | 100 | 0 | 0 | 1649 |
| C | Legendary | 100 | 100 | 0 | 0 | 2116 |
| C | Score Attack | 100 | 100 | 0 | 0 | 2032 |
| D | Standard | 100 | 100 | 0 | 0 | 2776 |
| D | Timed Trial | 100 | 100 | 0 | 0 | 2282 |
| D | Exam Drill | 100 | 100 | 0 | 0 | 2273 |
| D | Legendary | 100 | 100 | 0 | 0 | 2573 |
| D | Score Attack | 100 | 100 | 0 | 0 | 2826 |

- A: Unemployment and Labor + F10.
- B: Aggregate Demand + Aggregate Supply + Long-Run Macroeconomic Adjustment + F10. The protected `macroeconomic-equilibrium-and-shocks` concept was separately detected as carrying three pre-existing invalid Legendary `bossStage` values and was not modified.
- C: Fiscal and Stabilization Policy + F10.
- D: Monetary Policy Transmission + F10. The protected `liquidity-preference-and-money-market` concept was separately detected as carrying one pre-existing invalid Legendary `bossStage` value and was not modified.

Detailed seeded representation, first-reuse, auxiliary-route, and pattern data are in `macro_m2a_validation_results.json`.

MACRO M2a COMPLETE WITH NON-BLOCKING ISSUES
