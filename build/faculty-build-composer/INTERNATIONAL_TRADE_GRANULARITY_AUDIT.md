# International Trade & Trade Policy Granularity Audit

## Verdict

**READY FOR GRANULARIZATION — six natural child concepts are already present in the authoritative bank.**

The current production Trade family contains **426 canonical records** after the approved graph expansion. The six existing instructional objectives already define a clean six-way taxonomy, so no question rewriting, question generation, or artificial remapping is needed for the pilot audit.

## Recommended child subtopics

| Child subtopic | Role | Total records | Practice/calculation | Non-Legendary practice/calculation | Graph-linked |
|---|---|---:|---:|---:|---:|
| World Prices & Importer/Exporter Status | Supporting / targeted | 31 | 20 | 20 | 4 |
| Domestic Production, Consumption & Trade Quantities | Standalone | 74 | 54 | 34 | 14 |
| Gains from Trade, Surplus & Winners/Losers | Standalone | 124 | 72 | 48 | 23 |
| Tariffs, Revenue & Deadweight Loss | Standalone | 94 | 66 | 42 | 31 |
| Import Quotas, Quota Rents & Tariff–Quota Comparison | Standalone | 47 | 35 | 29 | 20 |
| Trade-Policy Arguments, Efficiency & Distribution | Supporting / targeted | 56 | 45 | 19 | 0 |

All six children have at least **19 non-Legendary practice/calculation questions**, so every child can support the planned 15-question Quiz mode without filler.

## 1. World Prices & Importer/Exporter Status

Maps to **ITP.1**: explain world price, imports, exports, and the small-country trade model.

Includes:
- world-price interpretation;
- importer versus exporter identification;
- the small-country price-taking assumption;
- basic trade-status reasoning.

This is pedagogically real but deliberately narrow. Keep it selectable for targeted review or quizzes, but do not inflate it merely to satisfy full-campaign mode floors.

## 2. Domestic Production, Consumption & Trade Quantities

Maps to **ITP.2**: determine domestic production, domestic consumption, and trade quantities.

Includes:
- domestic quantity supplied under trade;
- domestic quantity demanded under trade;
- imports and exports;
- reading importing/exporting market graphs;
- integrated quantity calculations.

This is a strong standalone concept and a natural follow-on to world-price/status identification.

## 3. Gains from Trade, Surplus & Winners/Losers

Maps to **ITP.3**: calculate and interpret consumer, producer, and total-surplus changes from trade.

Includes:
- consumer-surplus changes;
- producer-surplus changes;
- total gains from trade;
- winners and losers from opening trade;
- distribution of gains from exchange;
- integrated welfare calculations.

This is the largest child slice and should remain distinct from the earlier Consumer & Producer Surplus family because these records explicitly apply surplus analysis to international trade.

## 4. Tariffs, Revenue & Deadweight Loss

Maps to **ITP.4**: analyze tariff effects on price, quantities, revenue, and total surplus.

Includes:
- tariff-induced price changes;
- changes in domestic production and consumption;
- import reductions;
- tariff revenue;
- production and consumption distortions;
- deadweight loss and welfare effects.

This is a clean standalone quiz/practice concept with the deepest graph coverage in the family.

## 5. Import Quotas, Quota Rents & Tariff–Quota Comparison

Maps to **ITP.5**: analyze quotas, quota rents, and tariff-versus-quota differences.

Includes:
- quota quantity effects;
- quota rents;
- quota-price effects;
- tariff-versus-quota comparisons;
- policy-distribution differences;
- related welfare effects.

This is smaller than Tariffs but still comfortably supports a 15-question targeted quiz without filler.

## 6. Trade-Policy Arguments, Efficiency & Distribution

Maps to **ITP.6**: evaluate trade-policy arguments using efficiency, distribution, and evidence.

Includes:
- protectionism arguments;
- efficiency versus equity;
- distributional consequences;
- evidence-based evaluation of trade-policy claims;
- policy tradeoffs.

This is best treated as a targeted/supporting concept. It has ample quiz depth, but its existing difficulty mix is intentionally weighted toward Elite and Legendary analysis rather than basic mechanics.

## Partition integrity

- Parent family records: **426**
- Recombined child records: **426**
- Unclassified records: **0**
- Cross-child duplicate assignment: **0**
- Proposed question additions: **0**
- Proposed question rewrites: **0**

The partition can be implemented directly from the existing `ITP.1`–`ITP.6` objective metadata. That is cleaner than keyword inference and avoids unnecessary content surgery.

## Existing scope guardrails preserved

The established Trade bank excludes monopoly, externalities, exchange-rate determination, balance-of-payments accounting, and macro trade-deficit analysis. Consumer/producer surplus remains the primary welfare prerequisite, while tariff and quota losses are treated as trade-specific lost gains from exchange rather than requiring generic tax-incidence instruction.

The current production bank also includes the approved four-graph expansion for importing markets, exporting markets, tariffs, and quotas. Those assets and graph-linked questions remain untouched by granularity work.

## Recommended implementation rule

Keep `international-trade-and-trade-policy` as the parent family. Add the six child selectors as filters over the same 426 canonical records.

Use the same rules already proven for Elasticity and Surplus:

- parent and child selection are mutually exclusive;
- sibling child concepts may be combined;
- child runtime identity drives mastery/remediation reporting;
- parent family identity remains preserved underneath;
- canonical IDs, answer hashes, assets, difficulty, Repair, Bridge, and checkpoint metadata remain unchanged;
- targeted/supporting children are not required to satisfy old full-campaign mode floors independently.

## Quiz-mode implication

All six proposed children already exceed the future 15-question Quiz ceiling using non-Legendary practice/calculation records alone. Therefore **no filler is justified for Trade granularity**.

## Next step

Apply the six child selectors to the current Phase Micro2 build, then run:

- exact 426-record recombination;
- zero-overlap/zero-missing partition checks;
- parent/child exclusion behavior;
- sibling-combination behavior;
- all-five-current-mode family validation;
- targeted child and child-combination composition tests;
- answer-hash and asset-hash validation;
- Elasticity and Surplus regression;
- legacy recipe regression.
