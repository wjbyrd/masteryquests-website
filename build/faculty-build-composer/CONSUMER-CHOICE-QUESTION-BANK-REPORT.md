# Consumer Choice Question Bank Production Report

## Production result

- Baseline Composer inventory: 8,771 questions, 130 independently selectable concepts, and 475 registered graph assets.
- Inventory audit: no active standalone Consumer Choice concept or canonical Consumer Choice records existed. Related legacy material remained in place and was not retagged.
- Taxonomy decision: added the independent faculty-selectable concept `consumer-choice` rather than merging it with either of the other banks in this pass.
- Retained existing records in this concept: 0.
- New and resulting concept count: 160 questions.
- Deterministic ID range: 42560–42719, contiguous with no collisions.
- Resulting full library: 9,271 questions, 133 concepts, and 486 registered assets.

## Coverage

| Objective | Questions | Canonical subtopic |
|---|---:|---|
| CC.1 Budget constraints and feasible bundles | 22 | `budget-constraints-and-feasible-sets` |
| CC.2 Income and price changes | 22 | `income-and-price-changes` |
| CC.3 Relative prices and opportunity cost | 16 | `relative-prices-and-opportunity-cost` |
| CC.4 Preferences and ranking | 18 | `preferences-and-ranking` |
| CC.5 Indifference-curve properties | 16 | `indifference-curves` |
| CC.6 Ordinal utility | 12 | `ordinal-utility` |
| CC.7 Marginal rate of substitution | 12 | `marginal-rate-of-substitution` |
| CC.8 Perfect substitutes and complements | 12 | `perfect-substitutes-and-complements` |
| CC.9 Consumer optimum and tangency | 18 | `consumer-optimum-and-tangency` |
| CC.10 Marginal utility per dollar | 12 | `marginal-utility-per-dollar` |

The bank deliberately omits graphical income/substitution effects and Giffen-good analysis because none of the supplied final assets supports those treatments cleanly.

## Difficulty, pools, and question forms

- Difficulty: easy 40; medium 60; hard 36; elite 12; legendary 12.
- Pools: easy 34; easyBoss 6; medium 42; mediumBoss 6; hard 30; finalBoss 6; elite 12; legendary 6; legendaryBoss 6; repairQuestions 6; bridgeQuestions 6.
- Question types: application 51; calculation 27; integration 30; bridge 6; graph interpretation 20; graph calculation 9; graph integration 11; graph trap 6.
- Balanced answer positions: 40 / 40 / 40 / 40.

## Graph assets and dependency

There are 46 graph-dependent questions. Every graph record was reviewed and validator-tested for an answer that depends on the referenced image plus the stem. Dependency audit: 46/46 pass; no decorative assignments and no orphaned references.

| Asset | Questions | Dimensions | Bytes | SHA-256 |
|---|---:|---:|---:|---|
| CHOICE-01.webp | 6 | 1761×1235 | 32,824 | `d7b214200a7437647ea5750f605f691a05cc23221f764b5fb2efb33ea461fac9` |
| CHOICE-02.webp | 6 | 1741×1223 | 44,054 | `c6cb021f7385afdeb398f89fd7af689ce31af568992573a2c01680c1fdeb3d82` |
| CHOICE-03.webp | 6 | 1749×1219 | 40,186 | `1d3e804836571e5960ade819b8412a1a6c1d41105562fc09b88ebe6bd263bb5c` |
| CHOICE-04.webp | 6 | 1740×1222 | 37,180 | `b838cfd9668ccc7b621ab4e7a03c5167be53416d7b01bc269124c47fad8623e3` |
| CHOICE-05.webp | 5 | 1600×1134 | 44,208 | `afb5ff5728a78589a6638d0b3e39b81e90fe055bab8693d5f17be40db9cf388e` |
| CHOICE-06.webp | 6 | 1600×1200 | 59,836 | `3dd9961e41c18d7055d22ad16dc8472a1df3301ff387e8be0e7ecc76764bf93d` |
| CHOICE-07.webp | 5 | 1600×1132 | 55,378 | `39c70b0e2895222e41303a1b70f556b7de3482756453dcc6742cf4f686a26fdd` |
| CHOICE-08.webp | 6 | 1600×1200 | 41,068 | `0ffd1918fde88d36fd83eed3a2a285b0e985a9272c737740be2d57acd4efd86b` |

The eight incoming WebP files were moved into canonical concept storage without pixel or byte changes. Each has concise alt text and a separate full graph description.

## Publishing and validation

- Author source: `authoring/consumer_choice_question_pool_author.mjs`.
- Coordinated publisher: `audit_tools/publish_remaining_principles_micro_question_pools.mjs`.
- Publisher was run twice with identical canonical output; a final no-write run passed with library SHA-256 `7d3856431775c72d86443c7a2358eccb976f2988a34003cfe3c6df3164603218`.
- Targeted production validator passed as part of 2,144 total checks across the coordinated release. It pins IDs, stems, answers, objectives, skills, difficulty, pools, graph allocations, asset bytes/dimensions/hashes, concept reviews, quick starts, and answer positions.
- All ten standalone mode floors pass: Standard, Timed Trial, Exam Drill, Quiz, Unlimited Practice, Legendary, Score Attack, Trial by Graph, Fading Fortune, and Risk & Reward.
- The active Composer suite passes 21/21.

## Browser QA

The focused production build was exercised at 1440×900. Trial by Graph reported 24 eligible graph-safe questions and launched a ten-question run. CHOICE-05 and CHOICE-06 were checked for correct and wrong explanatory feedback, graph enlargement, alt text, and the full graph description. Layout showed no horizontal overflow and the console had no warnings or errors. Static focused validation additionally exercised all modes, Repair/Bridge pools, adaptive metadata, and topical coverage.

## Representative questions

- 42560: “Refer to CHOICE-01.webp. Which labeled bundle exactly exhausts the $40 budget?” Answer: bundle B at (6,2).
- 42589: “Refer to CHOICE-06.webp. Which labeled bundle is the best affordable choice?” Answer: bundle C at (10,10).
- 42687: perfect substitutes are distinguished from perfect complements through the shape and constancy of the tradeoff.
- 42708–42719 include high-challenge optimization and misconception-diagnosis coverage while preserving Principles-level language.

## Files changed and protections

Concept-specific additions are the author source, canonical `question-assets/consumer-choice/` directory, focused production sample, and this report. Shared deterministic outputs include the Composer library, registry, manifest, concept-review metadata, coordinated publisher/helper, validator, active-suite registration, template mode-label fix, and release-total/version pins in historical validators.

Protected Externalities, Public Goods/Common Resources, Factors of Production/Labor, Market Power, Market Gate, unrelated website content, recipe schema, existing IDs/answers/taxonomy, adaptive/remediation behavior, mode floors, and the 2,800 ms ordinary feedback timing were preserved. Historical protected-record validators pass.

## Unresolved limitations

No blocking issue remains. Graph QA is intentionally limited to the supplied CHOICE family; the bank does not claim unsupported graphical income/substitution effects or Giffen-good coverage. Browser QA used representative interactive sampling while deterministic validation checked the complete bank.
