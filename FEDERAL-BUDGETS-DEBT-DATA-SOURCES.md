# Federal Budgets & Debt — Official Data Source Snapshot

**Retrieval date:** 2026-08-27  
**Scope:** Official U.S. government sources used by the `federal-budgets-and-debt` production bank. Values below are frozen authoring evidence, not live-data prompts.

## Congressional Budget Office

- **Agency:** Congressional Budget Office (CBO)
- **Publication:** *The Budget and Economic Outlook: 2026 to 2036*
- **Publication date:** February 11, 2026
- **Official pages:** https://www.cbo.gov/publication/61882 and https://www.cbo.gov/publication/62105
- **Status:** Baseline projections, not realized outcomes
- **Budget period:** Fiscal years
- **Units:** Trillions of dollars or percentage of GDP, as labeled

Verified anchors used in questions:

| Measure | FY2026 | FY2036 | Interpretation |
|---|---:|---:|---|
| Revenues | $5.6 trillion | $8.3 trillion | Projected federal revenues |
| Outlays | $7.4 trillion | $11.4 trillion | Projected federal outlays |
| Deficit | $1.9 trillion | $3.1 trillion | Projected amount by which outlays exceed revenues; rounded values do not subtract exactly |
| Deficit/GDP | 5.8% | 6.7% | Projected annual flow relative to GDP |
| Debt held by the public/GDP | 101% | 120% | Projected debt stock at year-end relative to GDP |
| Outlays/GDP | 23.3% | 24.4% | Projected federal outlays relative to GDP |
| Revenues/GDP | 17.5% | 17.8% | Projected federal revenues relative to GDP |
| Primary deficit/GDP | 2.6% | 2.1% | Projected deficit excluding net interest outlays |
| Net interest/GDP | 3.3% | 4.6% | Projected net interest outlays relative to GDP |

Additional verified FY2026 statement: CBO projects net interest outlays to rise from $970 billion in FY2025 to **more than $1.0 trillion in FY2026**. The report attributes most of that increase to growth in debt held by the public. Questions use the publication's own “more than” wording rather than inventing a more precise value.

Authoring notes:

- Always say **projects**, **projected**, or **baseline projection**.
- CBO labels budget data by fiscal year and economic data by calendar year.
- Values are rounded. Do not require students to infer that $7.4 trillion minus $5.6 trillion must equal the separately reported rounded $1.9 trillion deficit.
- The report states that baseline results are uncertain and depend on laws and assumptions in place on specified cutoff dates.

## U.S. Treasury Fiscal Data

- **Agency:** U.S. Department of the Treasury, Bureau of the Fiscal Service
- **Dataset:** *Debt to the Penny*
- **Official page:** https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny
- **Release frequency:** Daily
- **Dataset coverage shown at retrieval:** April 1, 1993 through August 25, 2026
- **Last updated when retrieved:** August 26, 2026
- **Units:** Currency amounts; questions using the definitions do not require memorizing a live value

Verified data-dictionary definitions:

- **Debt Held by the Public:** federal debt held by individuals, corporations, state or local governments, Federal Reserve Banks, foreign governments, and other entities outside the U.S. Government, less Federal Financing Bank securities.
- **Intragovernmental Holdings:** Government Account Series securities held by government trust funds, revolving funds, and special funds, plus Federal Financing Bank securities.
- **Total Public Debt Outstanding:** the total of debt held by the public and intragovernmental holdings.

Authoring notes:

- Do not label any of these measures merely “the federal debt” when a numeric value is given.
- Do not require students to memorize Treasury security types.
- Daily Debt to the Penny observations are stocks measured on a date, not annual deficits.

## Source-to-question controls

Every real-data record carries a `dataSourceKey` equal to `CBO-2026-OUTLOOK` or `TREASURY-DEBT-TO-PENNY`. The focused validator checks that each key resolves to this snapshot, that CBO wording remains projected, that the relevant year and units appear, and that no live/current-value question is present.

