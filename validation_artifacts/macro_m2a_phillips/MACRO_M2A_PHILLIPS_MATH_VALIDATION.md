# Macro M2a Phillips Math Validation

Formula: **sacrifice ratio = cumulative output loss relative to potential ÷ inflation reduction in percentage points**.

Independent numerical checks: **30**; failures: **0**. The audit covers direct ratio, implied output loss, implied inflation reduction, multi-year cumulative gaps, dollar loss per inflation point, cross-path comparisons, percentage versus percentage-point wording, and required rounding.

| Question | Independent calculation | Result | Published correct answer | Rounding | Status |
|---|---|---|---|---|---|
| `ECON-SP-ELITE-330` | (12 − 7) × 3.5 | 17.5 | 17.5 percent of one year's output | Exact | PASS |
| `ECON-SP-ELITE-331` | 14 ÷ 4 | 3.5 | 3.5% of one year’s output per inflation point | Exact | PASS |
| `ECON-SP-LEGENDARY-9020` | 18 ÷ (10 − 6) | 4.5 | The sacrifice ratio is 4.5, showing a costly disinflation. | Exact | PASS |
| `ECON-SP-LEGENDARY-9049` | 10 ÷ (9 − 5) | 2.5 | The sacrifice ratio is 2.5, so disinflation was costly but not extreme. | Exact | PASS |
| `ECON-SP-LEGENDARY-9021` | 5 × 2.8 | 14 | 14 percent of one year's output | Exact | PASS |
| `ECON-SP-LEGENDARY-9050` | 6 × 1.75 | 10.5 | 10.5 percent of one year's output | Exact | PASS |
| `ECON-SP-EASY-78` | 4 × 2 | 8 | 8 percent of one year's output | Exact | PASS |
| `ECON-SP-HARD-249` | ($24 billion ÷ $400 billion × 100) ÷ (8 − 5) | 2 | 2% of one year’s output per inflation point | Exact | PASS |
| `ECON-SP-HARD-250` | 12 ÷ 3 | 4 | 4% of one year’s output per inflation point | Exact | PASS |
| `ECON-SP-MEDIUM-167` | 3 × (8 − 5) | 9 | 9 percent of one year's output | Exact | PASS |
| `ECON-SP-MEDIUMBOSS-3013` | 3 × 4 | 12 | 12 percent of one year's output | Exact | PASS |
| `PM2A-SAC-M-005` | 12 ÷ 3 | 4 | 4% of one year’s output per inflation point | Exact | PASS |
| `PM2A-SAC-M-006` | 2.5 × 3 | 7.5 | 7.5% of one year’s output | Exact | PASS |
| `PM2A-SAC-M-007` | (1.5 + 2.5) ÷ 2 | 2 | 2% of one year’s output per inflation point | Exact | PASS |
| `PM2A-SAC-M-008` | 8 − 5 | 3 | Cumulative output loss divided by 3 percentage points | Exact | PASS |
| `PM2A-SAC-M-009` | A: 6 ÷ 3; B: 5 ÷ 2 | 2 versus 2.5 | Path A has a ratio of 2; Path B has a ratio of 2.5 | Exact | PASS |
| `PM2A-SAC-H-010` | [(.02 × 500) + 2(.01 × 500)] ÷ 4 | 5 | $5 billion per inflation point | Exact | PASS |
| `PM2A-SAC-H-011` | 9 ÷ 3 | 3 | 3 percentage points | Exact | PASS |
| `PM2A-SAC-H-013` | 6.5 ÷ 3, round half up to two decimals | 2.17 | 2.17% of one year’s output per inflation point | Round to two decimal places. | PASS |
| `PM2A-SAC-L-014` | gradual: (2 + 1 + 0) ÷ 2; rapid: 4 ÷ 2 | 1.5 versus 2 | The gradual path ratio is 1.5; the fast path ratio is 2 | Exact | PASS |
| `PM2A-SAC-L-015` | A: 8 ÷ (9 − 5); B: 6 ÷ (5 − 2) | 2 and 2 | A has a ratio of 2 and B also has a ratio of 2 | Exact | PASS |
| `PM2A-SAC-MB-019` | 10 ÷ 4 | 2.5 | 2.5% of one year’s output per inflation point | Exact | PASS |
| `PM2A-SAC-FB-020` | (1 + 2 + 1) ÷ (7 − 5) | 2 | 2% of one year’s output per inflation point | Exact | PASS |
| `PM2A-SAC-FB-022` | X: 7.2 ÷ 3; Y: 5 ÷ 2 | 2.4 versus 2.5 | Path X, with a ratio of 2.4 versus 2.5 | Exact | PASS |
| `PM2A-SAC-LB-023` | (2.4 + 1.8) ÷ (7.0 − 5.2), round to two decimals | 2.33 | 2.33% of one year’s output per inflation point | Round to two decimal places. | PASS |
| `PM2A-SAC-LB-024` | credible: 3 ÷ 2; other: 7.5 ÷ 3 | 1.5 versus 2.5 | The credible plan ratio is 1.5; the other is 2.5 | Exact | PASS |
| `PM2A-SAC-LB-025` | [(.015 × 800 × 2) + (.005 × 800)] ÷ 2.8 | 10 | $10 billion per inflation point | Report the exact dollar amount per inflation point. | PASS |
| `PM2A-DIS-L-010` | 6 ÷ 3 | 2 | The sacrifice ratio is 2, and the unemployment cost was temporary in the model | Exact | PASS |
| `PM2A-DIS-FB-016` | rapid: 5 ÷ 2; gradual: 6 ÷ 3 | 2.5 versus 2 | The gradual plan has ratio 2 versus the rapid plan’s 2.5 | Exact | PASS |
| `PM2A-DIS-LB-019` | A: 8 ÷ 4; B: 4 ÷ 2.5 | 2 versus 1.6 | A has ratio 2; B has ratio 1.6, so B loses less output per point | Exact | PASS |

Conceptual checks also confirmed that slower real-GDP growth is not automatically an output-gap loss, the denominator is not the final inflation rate, and cumulative multi-year gaps must be summed before division.

MACRO M2a COMPLETE WITH NON-BLOCKING ISSUES
