# Macro M2b-1 GDP Math Validation

Numeric records reviewed: **103**. Independently recomputed calculation records: **52**. Failures: **0**.

The validator covers expenditure GDP, C/I/G/NX totals, net exports, value added, final-versus-intermediate accounting, nominal GDP, real GDP, real-GDP growth, per-person output, units, and explicit rounding.

| Question | Independent calculation | Published answer | Rounding | Status |
|---|---|---|---|---|
| `ECON-NL-ELITE-303` | 180 − 110 | $70 | Exact | PASS |
| `ECON-NL-ELITE-307` | 100×20 + 50×1000 | $52,000 | Exact | PASS |
| `ECON-NL-LEGENDARY-9002` | 350000 − 200000 | $150,000 | Exact | PASS |
| `ECON-NL-LEGENDARY-9003` | 300 − 90 | $210 | Exact | PASS |
| `ECON-NL-EASY-4` | expenditure = income | $20 trillion | Exact | PASS |
| `ECON-NL-EASY-8` | final sale value | $50 | Exact | PASS |
| `ECON-NL-HARD-205` | new final capital good | $230 | Exact | PASS |
| `ECON-NL-MEDIUM-101` | production income = final expenditure | $900 billion | Exact | PASS |
| `ECON-NL-MEDIUM-103` | income = expenditure | $18 trillion | Exact | PASS |
| `ECON-NL-MEDIUM-105` | final bread value | $250 | Exact | PASS |
| `ECON-NL-EASYBOSS-2002` | expenditure = income | $18 trillion | Exact | PASS |
| `ECON-NL-EASYBOSS-2005` | final bread value | $100 | Exact | PASS |
| `PM2B1-GDPC-H-001` | import cancels C; domestic I = 5000 | $5,000 from the domestic machine | Exact | PASS |
| `PM2B1-GDPC-H-002` | current production only = 6 | $6 million of current production | Exact | PASS |
| `PM2B1-GDPC-H-003` | domestic buses = 3; transfer excluded; import cancels | $3 million | Exact | PASS |
| `PM2B1-GDPC-H-004` | exports 4 + domestic inventory .5 | $4.5 million | Exact | PASS |
| `ECON-NL-ELITE-311` | 23 − 15 − 4 − 6 + 5 | $3T | Exact | PASS |
| `ECON-NL-EASY-12` | 10 + 3 + 4 − 1 | 16 | Exact | PASS |
| `ECON-NL-HARD-208` | 300000 + 5000 | $305,000 | Exact | PASS |
| `ECON-NL-HARD-209` | 14 + 4 + 5 + 3 − 4.5 | $21.5T | Exact | PASS |
| `ECON-NL-HARD-212` | 70 sold + 30 inventory | $100 million because unsold output is inventory investment | Exact | PASS |
| `ECON-NL-MEDIUM-109` | 12 + 4 + 5 + 3 − 4 | $20 trillion | Exact | PASS |
| `ECON-NL-MEDIUM-112` | 800 − 1100 | -$300 billion | Exact | PASS |
| `ECON-NL-MEDIUM-113` | 7 sold + 3 inventory | $10 million | Exact | PASS |
| `ECON-NL-EASYBOSS-2008` | 8 + 2 + 3 − 1 | 12 | Exact | PASS |
| `ECON-NL-EASYBOSS-2011` | 600 − 750 | -$150 billion | Exact | PASS |
| `PM2B1-GDPC-FB-004` | 8 + 3 + 4 + 1 − 2 | $14 million | Exact | PASS |
| `PM2B1-GDPC-FB-005` | 7 domestic + 1 export + 2 inventory | $10 million | Exact | PASS |
| `PM2B1-GDPC-FB-006` | foreign equipment net 0 + road 4 + services 2 | $6 million: road repair plus recipients’ domestic services | Exact | PASS |
| `PM2B1-GDPC-LB-001` | domestic C 3 + I 4 + G 5 + X 2 | $14 million | Exact | PASS |
| `PM2B1-RNGDP-E-002` | 8×10 | $80 | Exact | PASS |
| `PM2B1-RNGDP-M-001` | 20×9; 20×6 | $180 nominal and $120 real | Exact | PASS |
| `PM2B1-RNGDP-M-002` | (110−100)/100 | 10% | Exact | PASS |
| `P52B-S2-RVNGDP-H-001` | .98/.95−1 ≈ .0316 | Real GDP rises about 3 percent. | Exact | PASS |
| `P52B-S2-RVNGDP-H-002` | 120×4 + 30×10 | $780. | Exact | PASS |
| `PM2B1-RNGDP-H-001` | 1.18/1.10−1 = .0727 | 7.3% | Round real-GDP growth to one decimal place. | PASS |
| `PM2B1-RNGDP-H-002` | (660/1.05 − 600)/600 = .0476 | 4.8% | Round real-GDP growth to one decimal place. | PASS |
| `ECON-NL-ELITE-313` | 25/1 = 30/1.2 = 25 | It is unchanged | Exact | PASS |
| `ECON-NL-ELITE-314` | 25×8; 25×5 | Nominal GDP = $200; real GDP = $125 | Exact | PASS |
| `ECON-NL-LEGENDARY-9005` | 24/1.2 = 30/1.5 = 20 | It is unchanged | Exact | PASS |
| `ECON-NL-LEGENDARY-9006` | 120×1000 + 550×20 | $131,000 | Exact | PASS |
| `ECON-NL-LEGENDARY-9007` | 120×900 + 550×24 | $121,200 | Exact | PASS |
| `ECON-NL-HARD-214` | 30/25×100 | 120 | Exact | PASS |
| `ECON-NL-HARD-215` | 110×5 | $550 | Exact | PASS |
| `ECON-NL-MEDIUM-116` | 24/1.2 | $20 trillion | Exact | PASS |
| `ECON-NL-EASYBOSS-2014` | 10×5 | $50 | Exact | PASS |
| `PM2B1-RNGDP-MB-001` | 30×8; 30×5 | $240 nominal GDP and $150 real GDP | Exact | PASS |
| `PM2B1-RNGDP-MB-003` | 25/500 | $25 billion ÷ $500 billion = 5% | Exact | PASS |
| `PM2B1-RNGDP-FB-005` | 840/1.2 = 700; 990/1.32 = 750 | It rises from $700 billion to $750 billion | Exact | PASS |
| `ECON-NL-LEGENDARYBOSS-9103` | 40/1.25 = 48/1.5 = 32 | It is unchanged at $32T | Exact | PASS |
| `PM2B1-RNGDP-LB-001` | nominal 120×5+24×12=888; real 120×4+24×10=720; growth (720−600)/600 | $888, $720, and 20% | Exact | PASS |
| `ECON-NL-LEGENDARY-9019` | 2T/20M = 100000; 4T/80M = 50000 | The first country, with $100,000 per person versus $50,000 | Exact | PASS |

MACRO M2b-1 COMPLETE WITH NON-BLOCKING ISSUES
