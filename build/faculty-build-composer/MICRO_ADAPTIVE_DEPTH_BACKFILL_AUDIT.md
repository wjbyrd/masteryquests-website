# Micro Child-Concept Adaptive Depth Audit

## New adaptive-depth rule

- **Standalone/focused child concepts:** minimum **10 runtime Easy + 10 Medium + 10 Hard** questions.
- **Supporting child concepts:** minimum **5 runtime Easy + 5 Medium + 5 runtime Hard** questions.
- Runtime counts include `calculation`/`integration` records after Composer routes them into their canonical difficulty pools.
- The 10-question core floor is engine-driven: Exam/Timed use roughly ten base rooms per tier and `getAdaptiveQuestion()` suppresses the last ten IDs. A pool below ten forces early reuse.
- Supporting selectors are intentionally paired; a 5-per-tier floor allows two supporting topics to contribute at least ten adaptive questions per tier together.

## Retrospective results

### Elasticity

| Child concept | Role | Runtime E | Runtime M | Runtime H | Backfill E | Backfill M | Backfill H | Add |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Price Elasticity of Demand | standalone/focused | 24 | 14 | 32 | 0 | 0 | 0 | **0** |
| Price Elasticity of Supply | standalone/focused | 6 | 5 | 11 | 4 | 5 | 0 | **9** |
| Income Elasticity of Demand | supporting | 2 | 2 | 6 | 3 | 3 | 0 | **6** |
| Cross-Price Elasticity of Demand | supporting | 2 | 2 | 7 | 3 | 3 | 0 | **6** |
| Elasticity and Total Revenue | standalone/focused | 4 | 10 | 7 | 6 | 0 | 3 | **9** |
| Applications of Elasticity | standalone/focused | 1 | 6 | 6 | 9 | 4 | 4 | **17** |

**Family adaptive backfill: 47 questions.**

### Consumer and Producer Surplus

| Child concept | Role | Runtime E | Runtime M | Runtime H | Backfill E | Backfill M | Backfill H | Add |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Consumer Surplus & Willingness to Pay | standalone/focused | 11 | 7 | 12 | 0 | 3 | 0 | **3** |
| Producer Surplus & Willingness to Accept | standalone/focused | 11 | 7 | 13 | 0 | 3 | 0 | **3** |
| Total Surplus & Gains from Exchange | standalone/focused | 2 | 6 | 11 | 8 | 4 | 0 | **12** |
| Efficient Quantity & Allocation | standalone/focused | 4 | 7 | 15 | 6 | 3 | 0 | **9** |
| Changes in Surplus & Policy Effects | supporting | 0 | 2 | 6 | 5 | 3 | 0 | **8** |
| Efficiency, Equity & Limits of Surplus Analysis | supporting | 2 | 1 | 3 | 3 | 4 | 2 | **9** |

**Family adaptive backfill: 44 questions.**

### International Trade and Trade Policy

| Child concept | Role | Runtime E | Runtime M | Runtime H | Backfill E | Backfill M | Backfill H | Add |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| World Prices & Importer/Exporter Status | supporting | 5 | 12 | 0 | 0 | 0 | 5 | **5** |
| Domestic Production, Consumption & Trade Quantities | standalone/focused | 10 | 12 | 12 | 0 | 0 | 0 | **0** |
| Gains from Trade, Surplus & Winners/Losers | standalone/focused | 6 | 2 | 32 | 4 | 8 | 0 | **12** |
| Tariffs, Revenue & Deadweight Loss | standalone/focused | 7 | 7 | 20 | 3 | 3 | 0 | **6** |
| Import Quotas, Quota Rents & Tariff–Quota Comparison | standalone/focused | 7 | 7 | 8 | 3 | 3 | 2 | **8** |
| Trade-Policy Arguments, Efficiency & Distribution | supporting | 5 | 2 | 0 | 0 | 3 | 5 | **8** |

**Family adaptive backfill: 39 questions.**

## Backfill scope

The three already-granularized families need **130** targeted adaptive questions under this rule:
- Elasticity: **47**
- Consumer and Producer Surplus: **44**
- International Trade and Trade Policy: **39**

No Legendary, checkpoint, repair, bridge, calculation, or graph expansion is justified by this audit. The deficit is specifically in the ordinary adaptive Easy/Medium/Hard spine.

## Rule for Costs of Production and remaining Micro families

Every future granularity audit must report both total child-bank depth and **runtime adaptive depth after calculation/integration routing**. Taxonomy wiring is not closed until each child either meets its applicable adaptive floor or is explicitly classified as supporting and paired.

