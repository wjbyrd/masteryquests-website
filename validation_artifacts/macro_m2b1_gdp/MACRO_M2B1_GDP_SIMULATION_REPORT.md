# Macro M2b-1 GDP Simulation Report

Deterministic sessions: **2,000**. Five response patterns were evenly distributed: all correct, all incorrect, alternating, randomized ≈70% correct, and remediation-heavy/boss-failure.

## Granular solo — 750 sessions

| Slice | Mode | Sessions | Completed | Completion failures | Routing failures | Controlled duplicates | Calculation exposures |
|---|---|---:|---:|---:|---:|---:|---:|
| GDP Components | Standard | 50 | 50 | 0 | 0 | 100 | 748 |
| GDP Components | Timed Trial | 50 | 50 | 0 | 0 | 250 | 620 |
| GDP Components | Exam Drill | 50 | 50 | 0 | 0 | 250 | 616 |
| GDP Components | Legendary | 50 | 50 | 0 | 0 | 1350 | 150 |
| GDP Components | Score Attack | 50 | 50 | 0 | 0 | 100 | 746 |
| Real versus Nominal GDP | Standard | 50 | 50 | 0 | 0 | 300 | 1040 |
| Real versus Nominal GDP | Timed Trial | 50 | 50 | 0 | 0 | 450 | 890 |
| Real versus Nominal GDP | Exam Drill | 50 | 50 | 0 | 0 | 450 | 908 |
| Real versus Nominal GDP | Legendary | 50 | 50 | 0 | 0 | 1350 | 1800 |
| Real versus Nominal GDP | Score Attack | 50 | 50 | 0 | 0 | 300 | 1059 |
| Limits of GDP | Standard | 50 | 50 | 0 | 0 | 450 | 0 |
| Limits of GDP | Timed Trial | 50 | 50 | 0 | 0 | 600 | 0 |
| Limits of GDP | Exam Drill | 50 | 50 | 0 | 0 | 600 | 0 |
| Limits of GDP | Legendary | 50 | 50 | 0 | 0 | 1350 | 230 |
| Limits of GDP | Score Attack | 50 | 50 | 0 | 0 | 450 | 0 |

## F1 family — 1,000 sessions

| Mode | Sessions | Completed | Completion failures | Routing failures | Duplicate selections | Calculation exposures |
|---|---:|---:|---:|---:|---:|---:|
| Standard | 200 | 200 | 0 | 0 | 0 | 2224 |
| Timed Trial | 200 | 200 | 0 | 0 | 0 | 1967 |
| Exam Drill | 200 | 200 | 0 | 0 | 0 | 2004 |
| Legendary | 200 | 200 | 0 | 0 | 200 | 2473 |
| Score Attack | 200 | 200 | 0 | 0 | 0 | 2231 |

Family ordinary, boss, Legendary, and Legendary Boss representation remained between 12% and 40% for every sibling. No immediate repeat occurred.

## Cross-family — 250 sessions

| Configuration | Mode | Sessions | Completed | Completion failures | Routing failures |
|---|---|---:|---:|---:|---:|
| A | Standard | 25 | 25 | 0 | 0 |
| A | Timed Trial | 25 | 25 | 0 | 0 |
| A | Exam Drill | 25 | 25 | 0 | 0 |
| A | Legendary | 25 | 25 | 0 | 0 |
| A | Score Attack | 25 | 25 | 0 | 0 |
| B | Standard | 25 | 25 | 0 | 0 |
| B | Timed Trial | 25 | 25 | 0 | 0 |
| B | Exam Drill | 25 | 25 | 0 | 0 |
| B | Legendary | 25 | 25 | 0 | 0 |
| B | Score Attack | 25 | 25 | 0 | 0 |

A = F1 + Inflation Measurement and Real Values. B = F1 + Growth and Productivity. Cross-family read-only validation found 19 pre-existing F2/F3 Legendary Boss records without valid `bossStage` metadata. They were excluded from the regression composition in memory, while all ordinary, checkpoint, Repair, and Bridge interfaces remained live. No F2/F3 source record was modified.

MACRO M2b-1 COMPLETE WITH NON-BLOCKING ISSUES
