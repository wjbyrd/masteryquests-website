# Macro M2b-2 Inflation Simulation Report

Deterministic sessions: **1,300**. Five response patterns were evenly distributed: all correct, all incorrect, alternating, randomized ≈70% correct, and remediation-heavy/boss-failure.

## Granular solo — 600 sessions

| Slice | Mode | Sessions | Completed | Completion failures | Routing failures | Controlled duplicates | Calculation exposures |
|---|---|---:|---:|---:|---:|---:|---:|
| CPI versus GDP Deflator | Standard | 30 | 30 | 0 | 0 | 270 | 0 |
| CPI versus GDP Deflator | Timed Trial | 30 | 30 | 0 | 0 | 360 | 0 |
| CPI versus GDP Deflator | Exam Drill | 30 | 30 | 0 | 0 | 360 | 0 |
| CPI versus GDP Deflator | Legendary | 30 | 30 | 0 | 0 | 810 | 0 |
| CPI versus GDP Deflator | Score Attack | 30 | 30 | 0 | 0 | 270 | 0 |
| CPI Bias | Standard | 30 | 30 | 0 | 0 | 270 | 0 |
| CPI Bias | Timed Trial | 30 | 30 | 0 | 0 | 360 | 0 |
| CPI Bias | Exam Drill | 30 | 30 | 0 | 0 | 360 | 0 |
| CPI Bias | Legendary | 30 | 30 | 0 | 0 | 810 | 0 |
| CPI Bias | Score Attack | 30 | 30 | 0 | 0 | 270 | 0 |
| Indexing and Real Values | Standard | 30 | 30 | 0 | 0 | 60 | 572 |
| Indexing and Real Values | Timed Trial | 30 | 30 | 0 | 0 | 150 | 425 |
| Indexing and Real Values | Exam Drill | 30 | 30 | 0 | 0 | 150 | 430 |
| Indexing and Real Values | Legendary | 30 | 30 | 0 | 0 | 810 | 720 |
| Indexing and Real Values | Score Attack | 30 | 30 | 0 | 0 | 60 | 570 |
| Real versus Nominal Interest Rates | Standard | 30 | 30 | 0 | 0 | 180 | 899 |
| Real versus Nominal Interest Rates | Timed Trial | 30 | 30 | 0 | 0 | 270 | 760 |
| Real versus Nominal Interest Rates | Exam Drill | 30 | 30 | 0 | 0 | 270 | 778 |
| Real versus Nominal Interest Rates | Legendary | 30 | 30 | 0 | 0 | 810 | 852 |
| Real versus Nominal Interest Rates | Score Attack | 30 | 30 | 0 | 0 | 180 | 902 |

## F2 family — 500 sessions

| Mode | Sessions | Completed | Completion failures | Routing failures | Duplicate selections | Calculation exposures |
|---|---:|---:|---:|---:|---:|---:|
| Standard | 100 | 100 | 0 | 0 | 0 | 1893 |
| Timed Trial | 100 | 100 | 0 | 0 | 0 | 1583 |
| Exam Drill | 100 | 100 | 0 | 0 | 0 | 1599 |
| Legendary | 100 | 100 | 0 | 0 | 0 | 1763 |
| Score Attack | 100 | 100 | 0 | 0 | 0 | 1895 |

A clean Legendary run consumed 27 unique ordinary records and nine unique Legendary Boss records before reuse. No immediate repeat occurred.

## Cross-family — 200 sessions

| Configuration | Mode | Sessions | Completed | Completion failures | Routing failures |
|---|---|---:|---:|---:|---:|
| A | Standard | 20 | 20 | 0 | 0 |
| A | Timed Trial | 20 | 20 | 0 | 0 |
| A | Exam Drill | 20 | 20 | 0 | 0 |
| A | Legendary | 20 | 20 | 0 | 0 |
| A | Score Attack | 20 | 20 | 0 | 0 |
| B | Standard | 20 | 20 | 0 | 0 |
| B | Timed Trial | 20 | 20 | 0 | 0 |
| B | Exam Drill | 20 | 20 | 0 | 0 |
| B | Legendary | 20 | 20 | 0 | 0 |
| B | Score Attack | 20 | 20 | 0 | 0 |

A = GDP and National Output + F2. B = F2 + Growth and Productivity. Cross-family configuration B excluded 9 pre-existing F3 Legendary Boss records with invalid bossStage metadata in memory only. No F3 source record was modified.

MACRO M2b-2 COMPLETE WITH NON-BLOCKING ISSUES
