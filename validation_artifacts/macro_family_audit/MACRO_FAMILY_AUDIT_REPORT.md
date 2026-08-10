# Macroeconomics Phase M1 Family Audit Report

## Executive verdict

The live inventory is internally consistent: **42 Macro-specific concepts, 11 families, and 2,064 unique canonical records**. Every concept is assigned exactly once; no family-boundary change is required. The family-first model is valid, but production is not yet uniformly mature. The decisive defects are checkpoint-tier concentration, 25 ordinary concepts with at least one solo preflight failure, zero Repair Seed records across Macro, weak explicit Bridge destinations, and inaccessible Macro graph metadata. The Phillips Curve/Disinflation family is the only ordinary chapter family unable to launch Standard/Score and Legendary as a family.

The evidence-based build estimate is **420–490 new canonical records**, not 42 textbook banks. Exactly 385 of the lower-bound debt is the arithmetic needed to raise every non-integration granular concept to the current engine’s launch floors; the remaining 35 lower-bound records supply family Legendary uniqueness and synthesis-specific Repair/Bridge. New questions should be multi-use by design but are counted once by their primary function.

Audited live production snapshot: `72b8b50d0c70c1ec83b8afc2fe75c9c6dbe62cd4` (2026-08-09T23:11:52-04:00, “Finished general econ update”). Composer library SHA-256: `b7faf8d1cac32457ef636c40ed784832536966b9417f64b3cce0f8e0ebc282bb`; library generated at 2026-08-10T21:00:00.000Z. Sources were `build/faculty-build-composer/data/composer_registry.json`, `composer_library.js`, the live Composer classification in `composer.js`, and selection/preflight logic in the composer-ready runtime template. No production content, metadata, graphs, Composer code, runtime code, hashes, or generated libraries were changed.

## Reconciliation

- Macro-specific concepts discovered from the three live Macro presets: **42**
- Assigned exactly once to the 11 families: **42**
- Unassigned: **0**
- Duplicately assigned: **0**
- Missing from registry/library: **0**
- Live Macro-specific canonical total: **2064**

The Composer’s implementation also adds shared General-foundation IDs to its Macro filter. Those shared concepts are intentionally excluded from the 42-concept Macro-specific reconciliation.

## Current engine consumption model

| Mode | Clean-path demand | Launch pools / floors | Reuse behavior |
| --- | --- | --- | --- |
| Standard | 27 ordinary (9 Easy, 9 Medium, 9 Hard) + 9 boss prompts (3 per checkpoint) | Easy/Medium/Hard ≥6; Easy/Medium/Final Boss ≥3; Repair ≥1; Bridge ≥1 | Ordinary recent window relaxes 10→5→3; boss set first avoids used IDs/recent fingerprints, then may reuse. |
| Timed Trial | Ten-minute run; room schedule is Easy through 10, Medium through 20, Hard thereafter; wrong answers can extend attempts | Easy/Medium/Hard ≥6; Repair ≥1; Bridge ≥1 | No boss questions. Timer, setbacks, and remediation make total demand variable. |
| Exam Drill | 30 rooms: 10 Easy, 10 Medium, 10 Hard on a clean path | Easy/Medium/Hard ≥6; Repair ≥1; Bridge ≥1 | No bosses. Ordinary recent-window reuse allowed. |
| Legendary | 27 Legendary + 9 Legendary Boss prompts | Legendary ≥6; Legendary Boss ≥3 | Legendary exhausts each eligible record before cycle reset; boss reuse can begin when fewer than nine unique boss records exist. |
| Score Attack | Same 30-room/boss structure as Standard, with score layer | Same as Standard | Same question selection as Standard; scoring does not expand the pool. |

A wrong non-Legendary answer may trigger Repair → Bridge → retest, so Repair and Bridge demand is error-dependent, not a fixed run count. A missed boss answer does not reduce boss health; total boss attempts can therefore exceed nine.

## Family overview

| Family | Concepts | Canonical | E/M/H | Elite | Legendary | Boss E/M/F | LB | Repair / Seed / Bridge | Calc linked | Graph linked | Std | Timed | Exam | Leg | Score | Recommendation | Adds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F1 — GDP and National Output | 4 | 180 | 18/15/16 | 20 | 23 | E 31 / M 3 / F 3 | 8 | 18 / 0 / 9 | 35 | 0 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | MODERATE_EXPANSION | 50–55 |
| F2 — Inflation Measurement and Real Values | 5 | 175 | 18/20/19 | 20 | 22 | E 18 / M 3 / F 3 | 10 | 14 / 0 / 7 | 56 | 0 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | MAJOR_EXPANSION | 70–78 |
| F3 — Growth and Productivity | 4 | 188 | 20/19/19 | 20 | 23 | E 3 / M 36 / F 3 | 9 | 14 / 0 / 10 | 35 | 0 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | MODERATE_EXPANSION | 41–47 |
| F4 — Unemployment and Labor | 4 | 190 | 21/19/19 | 21 | 23 | E 3 / M 3 / F 42 | 8 | 12 / 0 / 11 | 24 | 0 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | MODERATE_EXPANSION | 44–49 |
| F5 — Money, Banking, and Fed Operations | 5 | 304 | 38/31/31 | 36 | 30 | E 15 / M 9 / F 9 | 17 | 40 / 0 / 19 | 37 | 0 | ROBUST | ROBUST | ROBUST | ADEQUATE | ROBUST | TARGETED_EXPANSION | 22–27 |
| F6 — Money Growth, Inflation, and Neutrality | 5 | 249 | 34/24/23 | 33 | 28 | E 3 / M 15 / F 3 | 15 | 29 / 0 / 17 | 28 | 32 | THIN | ROBUST | ROBUST | ADEQUATE | THIN | MODERATE_EXPANSION | 50–56 |
| F7 — Money Market and Policy Transmission | 2 | 137 | 18/20/17 | 17 | 20 | E 6 / M 6 / F 6 | 6 | 14 / 0 / 7 | 0 | 65 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | TARGETED_EXPANSION | 12–18 |
| F8 — AD-AS and Macroeconomic Equilibrium | 4 | 191 | 24/25/25 | 21 | 21 | E 10 / M 10 / F 10 | 9 | 25 / 0 / 11 | 0 | 37 | ROBUST | ROBUST | ROBUST | THIN | ROBUST | TARGETED_EXPANSION | 15–21 |
| F9 — Fiscal and Stabilization Policy | 3 | 204 | 21/24/24 | 27 | 20 | E 9 / M 9 / F 9 | 12 | 23 / 0 / 13 | 20 | 43 | ROBUST | ROBUST | ROBUST | THIN | ROBUST | TARGETED_EXPANSION | 8–12 |
| F10 — Phillips Curve and Disinflation | 5 | 142 | 23/15/26 | 16 | 16 | E 0 / M 12 / F 2 | 0 | 15 / 0 / 13 | 11 | 45 | NOT READY | ADEQUATE | ADEQUATE | NOT READY | NOT READY | MAJOR_EXPANSION | 93–105 |
| F11 — Integrated Macro Analysis | 1 | 104 | 0/0/0 | 7 | 29 | E 5 / M 5 / F 24 | 22 | 1 / 0 / 1 | 0 | 14 | NOT READY | NOT READY | NOT READY | ADEQUATE | NOT READY | TARGETED_EXPANSION | 15–22 |

## Mode readiness

| Family | Standard | Timed | Exam | Legendary | Score | Primary reason |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | Preserve GDP Measurement; repair three supporting slices and diversify Medium/Final checkpoints. |
| F2 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | The family is numerically deep but CPI Measurement dominates; Indexing/Real Values and several comparison slices miss solo floors. |
| F3 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | Ordinary family play is adequate; checkpoint concentration in Medium Boss and thin Productivity Measurement drive the build. |
| F4 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | Unemployment Measurement is healthy; other slices need targeted launch/checkpoint support, not textbook-sized banks. |
| F5 | ROBUST | ROBUST | ROBUST | ADEQUATE | ROBUST | The 304-record family is already robust. Add only Central Bank and Control Limits structural support and modernize definition-heavy tasks. |
| F6 | THIN | ROBUST | ROBUST | ADEQUATE | THIN | Family ordinary depth is ample, but boss tiers are badly uneven and Fisher Effect is structurally thin. |
| F7 | THIN | ADEQUATE | ADEQUATE | THIN | THIN | Two healthy sibling banks; add enough Legendary/Boss depth for one unique family run and strengthen the actual money-market-to-transmission connection. |
| F8 | ROBUST | ROBUST | ROBUST | THIN | ROBUST | AD, AS, and Shocks are healthy together. Concentrate work on Long-Run Adjustment and do not inflate AD and AS independently. |
| F9 | ROBUST | ROBUST | ROBUST | THIN | ROBUST | Protect the robust ordinary/checkpoint bank; add only unique Legendary depth and route quality. |
| F10 | NOT READY | ADEQUATE | ADEQUATE | NOT READY | NOT READY | This is the only normal chapter family that fails Standard/Score and Legendary preflight: zero Easy Boss, two Final Boss, zero Legendary Boss. |
| F11 | NOT READY | NOT READY | NOT READY | ADEQUATE | NOT READY | Do not create Easy/Medium/Hard filler. Improve combination diversity and synthesis-specific Repair/Bridge only. |

Ratings measure one selected family. ROBUST means ample margin and representation, ADEQUATE means one clean path is supported without forced reuse in the principal pools, THIN means launch is possible but unique depth/representation is weak, and NOT READY means live preflight fails.

## Family findings and balance

### F1 — GDP and National Output

MODERATE PRIORITY. Preserve GDP Measurement; repair three supporting slices and diversify Medium/Final checkpoints.

Eligible unique depth: Easy 18, Medium 15, Hard 16, Elite 20, Legendary 23; bosses E 31 / M 3 / F 3, Legendary Boss 8; Repair 18, Repair Seed 0, Bridge 9. Family Legendary first reuse: item 24; Legendary Boss first reuse across a clean run: item 9.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GDP Measurement | 73 | 40.8% | 51.4% | 34.8% | 33.3% | 33.3% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| GDP Components | 48 | 20.4% | 24.3% | 26.1% | 33.3% | 33.3% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Real versus Nominal GDP | 36 | 24.5% | 8.1% | 26.1% | 22.2% | 22.2% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Limits of GDP | 23 | 14.3% | 16.2% | 13.0% | 11.1% | 11.1% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |

Risks: starvation `real-versus-nominal-gdp`; domination `gdp-measurement`; duplicate LOW; definition MODERATE; Repair LOW; Bridge HIGH. Recommended target 230–235 canonical records, requiring 50–55 additions. Primary-function allocation (no double counting): ordinary 18–19, Elite 1–2, Legendary 3–4, bosses 22–23, Repair 2, Bridge 1–2, calculation 2, integration 1.

### F2 — Inflation Measurement and Real Values

MODERATE PRIORITY. The family is numerically deep but CPI Measurement dominates; Indexing/Real Values and several comparison slices miss solo floors.

Eligible unique depth: Easy 18, Medium 20, Hard 19, Elite 20, Legendary 22; bosses E 18 / M 3 / F 3, Legendary Boss 10; Repair 14, Repair Seed 0, Bridge 7. Family Legendary first reuse: item 23; Legendary Boss first reuse across a clean run: none in one clean run.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CPI and Inflation Measurement | 60 | 31.6% | 50.0% | 27.3% | 28.6% | 28.6% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| CPI versus GDP Deflator | 27 | 21.1% | 12.5% | 18.2% | 14.3% | 14.3% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| CPI Bias | 35 | 24.6% | 12.5% | 18.2% | 28.6% | 28.6% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Indexing and Real Values | 25 | 7.0% | 12.5% | 13.6% | 14.3% | 14.3% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Real versus Nominal Interest Rates | 28 | 15.8% | 12.5% | 22.7% | 14.3% | 14.3% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |

Risks: starvation `indexing-and-real-values`; domination `cpi-and-inflation-measurement`; duplicate LOW; definition LOW; Repair LOW; Bridge HIGH. Recommended target 245–253 canonical records, requiring 70–78 additions. Primary-function allocation (no double counting): ordinary 33–33, Elite 0–1, Legendary 8, bosses 29, Repair 0–2, Bridge 0–2, calculation 0–2, integration 0–1.

### F3 — Growth and Productivity

MODERATE PRIORITY. Ordinary family play is adequate; checkpoint concentration in Medium Boss and thin Productivity Measurement drive the build.

Eligible unique depth: Easy 20, Medium 19, Hard 19, Elite 20, Legendary 23; bosses E 3 / M 36 / F 3, Legendary Boss 9; Repair 14, Repair Seed 0, Bridge 10. Family Legendary first reuse: item 24; Legendary Boss first reuse across a clean run: none in one clean run.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Living Standards and Growth | 56 | 31.0% | 28.6% | 26.1% | 28.6% | 20.0% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Productivity Measurement | 31 | 10.3% | 14.3% | 21.7% | 14.3% | 10.0% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Sources of Productivity | 66 | 37.9% | 35.7% | 30.4% | 42.9% | 60.0% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Economic Growth Policy | 35 | 20.7% | 21.4% | 21.7% | 14.3% | 10.0% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |

Risks: starvation `productivity-measurement`; domination `NONE`; duplicate LOW; definition LOW; Repair LOW; Bridge MODERATE. Recommended target 229–235 canonical records, requiring 41–47 additions. Primary-function allocation (no double counting): ordinary 18, Elite 0, Legendary 2, bosses 21, Repair 0–2, Bridge 0–2, calculation 0, integration 0–2.

### F4 — Unemployment and Labor

MODERATE PRIORITY. Unemployment Measurement is healthy; other slices need targeted launch/checkpoint support, not textbook-sized banks.

Eligible unique depth: Easy 21, Medium 19, Hard 19, Elite 21, Legendary 23; bosses E 3 / M 3 / F 42, Legendary Boss 8; Repair 12, Repair Seed 0, Bridge 11. Family Legendary first reuse: item 24; Legendary Boss first reuse across a clean run: item 9.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Unemployment Measurement | 79 | 37.3% | 35.4% | 39.1% | 41.7% | 45.5% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Types of Unemployment | 44 | 27.1% | 25.0% | 17.4% | 25.0% | 27.3% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Natural Rate of Unemployment | 24 | 15.3% | 10.4% | 13.0% | 16.7% | 9.1% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Labor-Market Institutions | 43 | 20.3% | 29.2% | 30.4% | 16.7% | 18.2% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |

Risks: starvation `natural-rate-of-unemployment`; domination `NONE`; duplicate LOW; definition LOW; Repair LOW; Bridge MODERATE. Recommended target 234–239 canonical records, requiring 44–49 additions. Primary-function allocation (no double counting): ordinary 17, Elite 0, Legendary 5, bosses 22, Repair 0–2, Bridge 0–2, calculation 0, integration 0–1.

### F5 — Money, Banking, and Fed Operations

LOW PRIORITY. The 304-record family is already robust. Add only Central Bank and Control Limits structural support and modernize definition-heavy tasks.

Eligible unique depth: Easy 38, Medium 31, Hard 31, Elite 36, Legendary 30; bosses E 15 / M 9 / F 9, Legendary Boss 17; Repair 40, Repair Seed 0, Bridge 19. Family Legendary first reuse: none in one clean run; Legendary Boss first reuse across a clean run: none in one clean run.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Money Functions and Measures | 66 | 26.0% | 27.3% | 20.0% | 27.5% | 21.1% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER C — QUALITY MODERNIZATION |
| Bank Money Creation | 90 | 18.0% | 27.3% | 23.3% | 25.0% | 31.6% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Central Banking and the Federal Reserve | 35 | 15.0% | 9.1% | 10.0% | 20.0% | 15.8% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Monetary-Policy Tools | 60 | 21.0% | 27.3% | 20.0% | 17.5% | 15.8% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Limits of Monetary Control | 53 | 20.0% | 9.1% | 26.7% | 10.0% | 15.8% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |

Risks: starvation `NONE`; domination `NONE`; duplicate LOW; definition MODERATE; Repair HIGH; Bridge HIGH. Recommended target 326–331 canonical records, requiring 22–27 additions. Primary-function allocation (no double counting): ordinary 5, Elite 0, Legendary 3, bosses 14, Repair 0–2, Bridge 0–2, calculation 0, integration 0–1.

### F6 — Money Growth, Inflation, and Neutrality

MODERATE PRIORITY. Family ordinary depth is ample, but boss tiers are badly uneven and Fisher Effect is structurally thin.

Eligible unique depth: Easy 34, Medium 24, Hard 23, Elite 33, Legendary 28; bosses E 3 / M 15 / F 3, Legendary Boss 15; Repair 29, Repair Seed 0, Bridge 17. Family Legendary first reuse: none in one clean run; Legendary Boss first reuse across a clean run: none in one clean run.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quantity Theory of Money | 81 | 27.2% | 42.9% | 32.1% | 27.6% | 29.4% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Monetary Neutrality | 51 | 22.2% | 14.3% | 25.0% | 24.1% | 23.5% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Fisher Effect | 33 | 7.4% | 14.3% | 14.3% | 13.8% | 11.8% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Costs of Inflation | 49 | 24.7% | 14.3% | 17.9% | 24.1% | 23.5% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Inflation Tax and Deflation | 35 | 18.5% | 14.3% | 10.7% | 10.3% | 11.8% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |

Risks: starvation `fisher-effect`; domination `NONE`; duplicate MODERATE; definition MODERATE; Repair HIGH; Bridge HIGH. Recommended target 299–305 canonical records, requiring 50–56 additions. Primary-function allocation (no double counting): ordinary 18, Elite 0, Legendary 6, bosses 26, Repair 0–2, Bridge 0–2, calculation 0–1, integration 0–1.

### F7 — Money Market and Policy Transmission

LOW PRIORITY. Two healthy sibling banks; add enough Legendary/Boss depth for one unique family run and strengthen the actual money-market-to-transmission connection.

Eligible unique depth: Easy 18, Medium 20, Hard 17, Elite 17, Legendary 20; bosses E 6 / M 6 / F 6, Legendary Boss 6; Repair 14, Repair Seed 0, Bridge 7. Family Legendary first reuse: item 21; Legendary Boss first reuse across a clean run: item 7.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Liquidity Preference and the Money Market | 64 | 43.6% | 50.0% | 30.0% | 50.0% | 57.1% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Monetary-Policy Transmission | 73 | 56.4% | 50.0% | 70.0% | 50.0% | 42.9% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |

Risks: starvation `NONE`; domination `NONE`; duplicate LOW; definition LOW; Repair HIGH; Bridge MODERATE. Recommended target 149–155 canonical records, requiring 12–18 additions. Primary-function allocation (no double counting): ordinary 0, Elite 0, Legendary 7–8, bosses 3–4, Repair 1–2, Bridge 1–2, calculation 0, integration 0–2.

### F8 — AD-AS and Macroeconomic Equilibrium

MODERATE PRIORITY. AD, AS, and Shocks are healthy together. Concentrate work on Long-Run Adjustment and do not inflate AD and AS independently.

Eligible unique depth: Easy 24, Medium 25, Hard 25, Elite 21, Legendary 21; bosses E 10 / M 10 / F 10, Legendary Boss 9; Repair 25, Repair Seed 0, Bridge 11. Family Legendary first reuse: item 22; Legendary Boss first reuse across a clean run: none in one clean run.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Aggregate Demand | 47 | 24.3% | 30.0% | 28.6% | 20.0% | 18.2% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Aggregate Supply | 51 | 25.7% | 30.0% | 28.6% | 24.0% | 36.4% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Macroeconomic Equilibrium and Shocks | 59 | 29.7% | 30.0% | 28.6% | 36.0% | 27.3% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Long-Run Macroeconomic Adjustment | 34 | 20.3% | 10.0% | 14.3% | 20.0% | 18.2% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |

Risks: starvation `long-run-macroeconomic-adjustment`; domination `NONE`; duplicate MODERATE; definition LOW; Repair LOW; Bridge HIGH. Recommended target 206–212 canonical records, requiring 15–21 additions. Primary-function allocation (no double counting): ordinary 3, Elite 0, Legendary 3, bosses 9, Repair 0–2, Bridge 0–2, calculation 0, integration 0–2.

### F9 — Fiscal and Stabilization Policy

VERIFY / PROTECT. Protect the robust ordinary/checkpoint bank; add only unique Legendary depth and route quality.

Eligible unique depth: Easy 21, Medium 24, Hard 24, Elite 27, Legendary 20; bosses E 9 / M 9 / F 9, Legendary Boss 12; Repair 23, Repair Seed 0, Bridge 13. Family Legendary first reuse: item 21; Legendary Boss first reuse across a clean run: none in one clean run.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fiscal Policy and Aggregate Demand | 52 | 29.0% | 33.3% | 30.0% | 26.1% | 23.1% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Fiscal Multipliers and Crowding Out | 74 | 27.5% | 33.3% | 30.0% | 39.1% | 38.5% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |
| Stabilization Policy | 78 | 43.5% | 33.3% | 40.0% | 34.8% | 38.5% | SOLO_SAFE_WITH_CONTROLLED_REUSE | TIER D — HEALTHY / PROTECT |

Risks: starvation `NONE`; domination `NONE`; duplicate LOW; definition LOW; Repair HIGH; Bridge MODERATE. Recommended target 212–216 canonical records, requiring 8–12 additions. Primary-function allocation (no double counting): ordinary 0, Elite 0, Legendary 7–8, bosses 0, Repair 1–2, Bridge 0–1, calculation 0, integration 0–1.

### F10 — Phillips Curve and Disinflation

HIGH PRIORITY. This is the only normal chapter family that fails Standard/Score and Legendary preflight: zero Easy Boss, two Final Boss, zero Legendary Boss.

Eligible unique depth: Easy 23, Medium 15, Hard 26, Elite 16, Legendary 16; bosses E 0 / M 12 / F 2, Legendary Boss 0; Repair 15, Repair Seed 0, Bridge 13. Family Legendary first reuse: item 17; Legendary Boss first reuse across a clean run: item 1.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Short-Run Phillips Curve | 35 | 26.6% | 21.4% | 18.8% | 33.3% | 30.8% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Phillips-Curve Expectations | 38 | 34.4% | 21.4% | 18.8% | 20.0% | 23.1% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Long-Run Phillips Curve | 21 | 15.6% | 21.4% | 18.8% | 13.3% | 7.7% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Sacrifice Ratio | 26 | 7.8% | 14.3% | 25.0% | 20.0% | 23.1% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |
| Disinflation and Policy | 22 | 15.6% | 21.4% | 18.8% | 13.3% | 15.4% | SOLO_PREFLIGHT_RISK | TIER A — STRUCTURAL REPAIR |

Risks: starvation `sacrifice-ratio`; domination `NONE`; duplicate LOW; definition LOW; Repair LOW; Bridge HIGH. Recommended target 235–247 canonical records, requiring 93–105 additions. Primary-function allocation (no double counting): ordinary 33, Elite 0–2, Legendary 14, bosses 46, Repair 0–4, Bridge 0–3, calculation 0–1, integration 0–2.

### F11 — Integrated Macro Analysis

VERIFY / PROTECT. Do not create Easy/Medium/Hard filler. Improve combination diversity and synthesis-specific Repair/Bridge only.

Eligible unique depth: Easy 0, Medium 0, Hard 0, Elite 7, Legendary 29; bosses E 5 / M 5 / F 24, Legendary Boss 22; Repair 1, Repair Seed 0, Bridge 1. Family Legendary first reuse: none in one clean run; Legendary Boss first reuse across a clean run: none in one clean run.

| Concept | Canonical | Ordinary share / cold expected | Boss share | Legendary share | Repair share | Bridge share | Solo safety | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Integrated Macroeconomic Analysis | 104 | 0.0% | 100.0% | 100.0% | 100.0% | 100.0% | SOLO_PREFLIGHT_RISK | TIER B — CONTENT GAP |

Risks: starvation `integrated-macroeconomic-analysis`; domination `NONE`; duplicate LOW; definition N/A; Repair HIGH; Bridge HIGH. Recommended target 119–126 canonical records, requiring 15–22 additions. Primary-function allocation (no double counting): ordinary 0, Elite 0, Legendary 0, bosses 0, Repair 5–7, Bridge 5–7, calculation 0, integration 5–8.

## Application / definition distribution

Categories: A pure definition; B basic recognition; C simple application; D scenario application; E multistep reasoning; F calculation; G graph analysis; H integrated transfer. This deterministic classification uses live question type/skill metadata plus conservative stem rules and is an audit estimate, not new metadata.

| Family | Ordinary N | A | B | C | D | E | F | G | H | Definition/recognition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F1 | 49 | 8 | 2 | 6 | 7 | 4 | 22 | 0 | 0 | 20.4% |
| F2 | 57 | 4 | 1 | 4 | 0 | 4 | 44 | 0 | 0 | 8.8% |
| F3 | 58 | 6 | 0 | 3 | 10 | 11 | 26 | 0 | 2 | 10.3% |
| F4 | 59 | 11 | 1 | 13 | 13 | 3 | 15 | 0 | 3 | 20.3% |
| F5 | 100 | 23 | 5 | 8 | 31 | 8 | 13 | 0 | 12 | 28.0% |
| F6 | 81 | 17 | 5 | 16 | 9 | 12 | 12 | 5 | 5 | 27.2% |
| F7 | 55 | 4 | 1 | 7 | 12 | 1 | 2 | 22 | 6 | 9.1% |
| F8 | 74 | 4 | 5 | 9 | 13 | 7 | 1 | 27 | 8 | 12.2% |
| F9 | 69 | 10 | 0 | 2 | 33 | 7 | 7 | 8 | 2 | 14.5% |
| F10 | 64 | 1 | 2 | 7 | 4 | 2 | 9 | 37 | 2 | 4.7% |
| F11 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | N/A |

The largest modernization need is Family 5: Central Banking/Fed is 60% A+B and Money Functions/Measures 53.8% A+B. Most other families are already application-, calculation-, or graph-led. Scenario coverage is strong in national data, banking, labor, and government policy but sparse in unfamiliar transfer and international comparison outside Growth/Productivity.

## Cross-concept duplication and boundaries

No exact cross-concept stem duplicate was found. The scan found six semantic/cosmetic cross-sibling candidates and five repeated answer-set groups; these require human review but do not justify deletion in M1. The clearest template candidate is the same LRAS movement task split between Macroeconomic Equilibrium/Shocks and Long-Run Adjustment. CPI-versus-Deflator overlap is legitimate comparison work; Fed/Tools, Tools/Transmission, AD/Fiscal, Shocks/Stabilization, and SRPC/Expectations remain defensible when the primary task is applied consistently.

## Integrated Macro Analysis

Integrated Macro Analysis is synthesis-only: 104 canonical records, zero Easy/Medium/Hard, 7 Elite, 29 Legendary, 34 ordinary-boss records, 22 Legendary Boss, 10 dedicated Integration, and only 1 Repair plus 1 Bridge. Solo ordinary selection is not pedagogically meaningful and fails preflight by design; Legendary participation is adequate. Its M2 role should be **INTEGRATED_TRANSFER_COMPONENT / family-wide synthesis**, with new work limited to diverse concept combinations and synthesis-specific recovery routes.

## Final Macro summary

- Live Macro-specific canonical questions: **2,064**
- Macro-specific concepts: **42**
- Families: **11**
- Healthy / protect (Tier D): **15**
- Structural repair (Tier A): **25**
- Content gap (Tier B): **1**
- Quality modernization (Tier C): **1**
- Solo-safe with controlled reuse: **16**
- Solo preflight risk: **26** (includes the synthesis-only integration concept)
- Evidence-based additions: **420–490**
- Highest-value targets: **Phillips Curve/Disinflation checkpoint architecture; Indexing and Real Values; Fisher Effect; Productivity Measurement; Long-Run Macroeconomic Adjustment**

## Final verdict

MACRO M1 COMPLETE — FAMILY-LEVEL BLUEPRINT READY
