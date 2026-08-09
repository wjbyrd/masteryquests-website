# Scarcity Standalone Expansion Report

Phase: `phase7.1-scarcity-standalone-expansion-v1`  
Concept: `scarcity-and-tradeoffs`  
Production source: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`

## Outcome

The canonical Scarcity and Tradeoffs bank is now a compact, scenario-led standalone bank shared by General Economics and Macroeconomics. Main pools require application; Repair and Bridge provide diagnostic rebuilding and conceptual transfer. No other concept bank was changed.

## Counts

| Pool | Before | After |
|---|---:|---:|
| Easy | 6 | 10 |
| Medium | 6 | 10 |
| Hard | 6 | 10 |
| Elite | 4 | 4 |
| Legendary | 6 | 27 |
| Easy Boss | 3 | 4 |
| Medium Boss | 3 | 4 |
| Final Boss | 3 | 4 |
| Legendary Boss | 3 | 9 |
| Repair | 3 | 7 |
| Repair Seed | 3 | 3 |
| Bridge | 2 | 4 |
| Unique canonical total | 48 | 96 |

Changes: **48 added**, **28 rewritten**, **0 relocated to Repair**, **0 relocated to Bridge**, and **0 removed**. All 48 original canonical items were reviewed; unchanged records were retained.

## Instructional quality

- Definition-heavy main-pool items: 5 → 0.
- Scenario/application items detected: 25 → 61.
- Exact duplicate stems: 0.
- Material near-duplicate families: 0.
- Repeated answer sets: 0.
- New graph assets: 0; Phase 6.4 graph-accessibility infrastructure remains unchanged.

### Misconception coverage

| Diagnostic target | Before | After |
|---|---:|---:|
| scarcity is not poverty | 0 | 3 |
| scarcity is not temporary shortage | 0 | 2 |
| scarcity persists in wealthy societies | 0 | 5 |
| zero price is not nonscarcity | 2 | 3 |
| more resources do not eliminate scarcity | 1 | 3 |
| technology relaxes but does not eliminate constraints | 3 | 8 |
| efficiency differs from equality | 10 | 11 |
| fairness does not remove the constraint | 2 | 5 |

### Answer-length audit

No after-pool has correct answers uniquely longest in more than 50% of records, and no pool's mean correct-to-distractor word-length ratio exceeds 1.35. Full pool metrics are preserved in `scarcity_validation_results.json`.

## Five-mode and simulation results

| Mode | Core/preflight | Sessions | Routing failures | Completion failures | Prohibited duplicates |
|---|---|---:|---:|---:|---:|
| standard | PASS | 500 | 0 | 0 | 0 |
| timed | PASS | 500 | 0 | 0 | 0 |
| exam | PASS | 500 | 0 | 0 | 0 |
| legendary | PASS | 500 | 0 | 0 | 0 |
| score | PASS | 500 | 0 | 0 | 0 |

Total deterministic sessions: **2500**. Patterns were evenly divided among all-correct, all-incorrect, alternating, randomized approximately 70% correct, and boss-failure/remediation-heavy. All modes exercised Repair and Bridge selections except the intentionally all-correct pattern.

## Shared-area regression

Scarcity appears exactly once in the tested General Economics configuration and exactly once in the tested Macroeconomics configuration. Both combinations passed all five core modes and deterministic start/selection/completion checks without contaminating their companion concept.

## Browser validation

PASS — All five modes started and selected a four-option Scarcity question; Standard save/resume restored Stage One room 1 and the same reservoir prompt after reload; checkpoint markers rendered at rooms 10, 20, and 30; no browser console errors were observed.

## Final verdict

SCARCITY READY — COMPACT STANDALONE BANK VALIDATED
