# Micro Graph Question Audit Remediation — 4.5s.2j

**Date:** 2026-08-12  
**Base:** 4.5s.2i Full Graph Question Audit Remediation  
**Scope:** 426 Micro graph questions from Elasticity through Monopolistic Competition, plus a second-pass filename audit of the 186 newly built graph questions.

## Bottom line
The Micro graph banks have been corrected using the full audit recommendations. The release keeps the canonical library at **8,163 questions** and the asset inventory at **427 assets**; this is a quality remediation, not a content-count expansion.

## Micro corrections completed
- **88 graph-dependency/stem-leak items rewritten.** Calculations now require students to read graph coordinates, areas, gaps, or curve relationships rather than receiving the needed values in the stem.
- **45 redundant-task questions across 15 reuse groups diversified.** Checkpoint, calculation, hard, and Legendary items no longer simply repeat the same easy/medium computation under a different difficulty label.
- **58 uniquely-longest keyed answers reduced to 0.** The **19 severe length cues** identified in the audit are also 0.
- **158 internal asset-code references removed from student stems.** `TRD-xx`, `MON-xx`, `MCOMP-xx`, and the one `PC-xx` exposure are no longer shown to students.
- **51 high-overlap stem pairs at Jaccard >= 0.80 reduced to 0** across the 426-question audited Micro set.
- **64 Consumer & Producer Surplus image paths normalized** to `question-assets/consumer-and-producer-surplus/...`.
- `P62F-PC-H-041` metadata corrected from `total_profit` to **`integrated_competitive_firm_analysis`** for both primary and repair skill routing.

## Family records modified
| Family | Questions audited | Records modified |
|---|---:|---:|
| Elasticity | 48 | 28 |
| Consumer & Producer Surplus | 64 | 64 |
| International Trade | 56 | 56 |
| Costs of Production | 72 | 25 |
| Perfect Competition | 84 | 32 |
| Monopoly | 60 | 60 |
| Monopolistic Competition | 42 | 42 |

A record can be modified for a substantive rewrite, filename cleanup, path normalization, answer-choice balancing, or metadata correction. **No non-target question content changed.**

## Second pass on the 186 newly built graph questions
The filename scan found exactly the three SRPC-03 references that escaped the previous remediation:
- `PG5-PC-E-019`
- `PG5-PC-H-022`
- `PG5-PC-M-021`

All three now use normal student-facing graph language. Filename exposure in the 186-question set is now **0**.

The second pass also exposed a structural Phillips-curve asset-registration issue: several Phase 5 questions legitimately reused an SRPC asset across the short-run, long-run, and expectations concepts, but the shared image was not registered with every primary concept that used it. Shared asset references were added without duplicating the global asset inventory. The full graph-hygiene composition now passes.

## Validation
### Static audit
- Micro questions audited: **426**
- Recent graph questions rechecked: **186**
- Answer-hash failures: **0**
- Internal filename exposures — Micro: **0**
- Internal filename exposures — recent 186: **0**
- Unique-longest correct answers — Micro: **0**
- Severe length cues — Micro: **0**
- High-overlap Micro pairs at Jaccard >= 0.80: **0**
- CPS noncanonical image paths: **0**
- Canonical question count: **8,163**
- Asset inventory: **427**

### Question independence / graph hygiene
**PASS**
- unsafe context starts: 0
- orphan graph references: 0
- axis-giveaway images: 0
- screenshot-context failures: 0

### Seven-mode composition
The following all pass Standard, Timed, Exam, Quiz, Unlimited, Legendary, and Score Attack with no composition errors, answer failures, or asset-hash failures:
- Elasticity
- Consumer & Producer Surplus
- International Trade
- Costs of Production
- Perfect Competition
- Monopoly
- Monopolistic Competition
- Firm Graph Core
- Broad Micro Graph Core

The existing full graph remediation validator also passes the Demand/Supply, Market Policy, AD/AS, Money/Monetary, Phillips, and broad Macro Graph configurations after the shared Phillips asset-registration repair.

## Updated question-bank files
- `phase6_2b_elasticity_graph_expansion_v2_questions.json`
- `phase6_2c_consumer_producer_surplus_graph_questions_audit_corrected.json`
- `phase6_2d_international_trade_graph_expansion_v2_questions.json`
- `phase6_2e_cost_graph_expansion_v2_questions.json`
- `phase6_2f_perfect_competition_graph_expansion_v2_questions.json`
- `phase6_2g_monopoly_graph_expansion_v2_questions.json`
- `phase6_2h_monopolistic_competition_graph_expansion_v2_questions.json`
- `phaseGraph5-phillips-curve-v1_questions.json`

## Release
**4.5s.2j — Micro Graph Audit Remediation + Filename Hygiene**
