# Scarcity Simulation Report

Phase: `phase7.1-scarcity-standalone-expansion-v1`

## Deterministic run matrix

| Mode | Sessions | Main/checkpoint selections | Repair | Bridge | Preflight failures | Routing failures | Empty pools | Completion failures | Prohibited duplicates |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| standard | 500 | 18000 | 1900 | 1000 | 0 | 0 | 0 | 0 | 0 |
| timed | 500 | 15000 | 1900 | 1000 | 0 | 0 | 0 | 0 | 0 |
| exam | 500 | 15000 | 1900 | 1000 | 0 | 0 | 0 | 0 | 0 |
| legendary | 500 | 18000 | 1900 | 1000 | 0 | 0 | 0 | 0 | 0 |
| score | 500 | 18000 | 1900 | 1000 | 0 | 0 | 0 | 0 | 0 |

Each mode ran 500 seeded sessions (2,500 total). Each group of five sessions used: all correct, all incorrect, alternating, randomized approximately 70% correct, and boss-failure/remediation-heavy. Standard and Score Attack traversed three ordinary tiers and all three checkpoint tiers; Timed Trial and Exam Drill exhausted ten unique questions in each ordinary tier; Legendary traversed all 27 unique Legendary questions and all nine unique Legendary Boss questions across three checkpoints. Repair/Bridge diagnostics used only valid routed records and did not reuse an auxiliary record inside a run.

## Result

0 preflight failures, 0 routing failures, 0 empty-pool failures, 0 completion failures, and 0 prohibited duplicate selections.

SCARCITY READY — COMPACT STANDALONE BANK VALIDATED
