# Income Inequality, Poverty, and Redistribution Question Bank Production Report

## Production result

- Baseline Composer inventory: 8,771 questions, 130 independently selectable concepts, and 475 registered graph assets.
- Inventory audit: no active standalone concept or canonical record slice covered this complete family. Related legacy records were preserved in their original concepts.
- Taxonomy decision: added the independent faculty-selectable concept `income-inequality-poverty-and-redistribution`.
- Retained existing records in this concept: 0.
- New and resulting concept count: 160 questions.
- Deterministic ID range: 42720–42879, contiguous with no collisions.
- Resulting full library: 9,271 questions, 133 concepts, and 486 registered assets.

## Coverage

| Objective | Questions | Canonical subtopic |
|---|---:|---|
| IP.1 Income distribution and measurement | 22 | `income-distribution-and-measurement` |
| IP.2 Lorenz curves | 22 | `lorenz-curves` |
| IP.3 Gini coefficients | 16 | `gini-coefficients` |
| IP.4 Comparing inequality | 18 | `comparing-inequality` |
| IP.5 Sources of income differences | 22 | `sources-of-income-differences` |
| IP.6 Poverty thresholds | 18 | `poverty-thresholds` |
| IP.7 In-kind transfers | 12 | `in-kind-transfers` |
| IP.8 Redistribution philosophy | 16 | `redistribution-philosophy` |
| IP.9 Antipoverty policy design | 14 | `antipoverty-policy-design` |

The content explicitly distinguishes cumulative from noncumulative shares, inequality from poverty, relative distribution from mean income, and cash-income measures from broader material resources. Normative frameworks and policy tradeoffs are presented neutrally.

## Difficulty, pools, and question forms

- Difficulty: easy 42; medium 58; hard 36; elite 12; legendary 12.
- Pools: easy 36; easyBoss 6; medium 40; mediumBoss 6; hard 30; finalBoss 6; elite 12; legendary 6; legendaryBoss 6; repairQuestions 6; bridgeQuestions 6.
- Question types: application 59; calculation 25; integration 28; bridge 6; graph interpretation 20; graph calculation 11; graph integration 11.
- Balanced answer positions: 40 / 40 / 40 / 40.

## Graph assets and dependency

There are 42 graph-dependent questions. All 42 require a visible Lorenz coordinate, curve ordering, stated Gini, or comparison that the referenced asset supplies. Dependency audit: 42/42 pass; no decorative graph use and no orphaned references.

| Asset | Questions | Dimensions | Bytes | SHA-256 |
|---|---:|---:|---:|---|
| LORENZ-01.webp | 14 | 1720×1200 | 69,044 | `05e0f6fafaa9260da33c44507cd05dc3d52fec2c14e41805b4af6a8768ca0a35` |
| LORENZ-02.webp | 14 | 1720×1200 | 76,480 | `40384f963cb4ce8ef26b188b2df9bda49e58edb4ed8181efa172a74baf025bb1` |
| LORENZ-03.webp | 14 | 1601×1175 | 89,188 | `629cfd3f9fb4db171762cef199cdc0dc87c76dc75fc043ed439b2f1a41cddb5f` |

Pinned values include LORENZ-01 bottom 40% = 15%; LORENZ-02 bottom 40% = 22% for A and 7% for B; and LORENZ-03 bottom 40% = 15% before and 22% after, with Gini falling from 0.380 to 0.252. The three incoming WebP files were moved to canonical storage byte-for-byte and registered with alt text and full descriptions.

## Publishing and validation

- Author source: `authoring/income_inequality_question_pool_author.mjs`.
- Coordinated publisher: `audit_tools/publish_remaining_principles_micro_question_pools.mjs`.
- Publisher was run twice with identical canonical output; the final no-write run passed with library SHA-256 `7d3856431775c72d86443c7a2358eccb976f2988a34003cfe3c6df3164603218`.
- Targeted production validation passed within the coordinated 2,144-check run, including exact graph math, IDs, answers, objectives, skills, subtopics, difficulty, pools, reviews, quick starts, uniqueness, copy searches, and pinned digests.
- All ten standalone mode floors pass, including Trial by Graph.
- The active Composer suite passes 21/21.

## Browser QA

The focused production build was exercised at 820×1180. Trial by Graph launched successfully and rendered LORENZ-02 with accessible text. The tested 25% calculation received the correct explanatory feedback. The build had no horizontal overflow and no console warnings or errors. Deterministic focused validation covered all three Lorenz assets, poverty thresholds, redistribution frameworks, in-kind transfers, inequality sources, all supported modes, and Repair/Bridge routing.

## Representative questions

- 42720: “Refer to LORENZ-01.webp. What share of income goes to the bottom 40 percent?” Answer: 15 percent.
- 42730: LORENZ-02 asks which distribution is more unequal and keys B because its curve lies farther below equality.
- 42740: LORENZ-03 asks how the stated Gini changes and keys the fall from 0.380 to 0.252.
- 42820: a supplied $24,000 threshold and $21,500 income test poverty status without requiring memorized current policy data.
- 42866: a $0.60 benefit phaseout tests effective marginal tax-rate incentives without asserting a contested empirical outcome as certain.

## Files changed and protections

Concept-specific additions are the author source, canonical `question-assets/income-inequality-poverty-and-redistribution/` directory, focused production sample, and this report. Shared changes are the deterministic library/registry/manifest/review outputs, publisher/helper, validator, active-suite registration, template mode-label correction, and current release pins in historical validators.

Protected Externalities, Public Goods/Common Resources, Factors of Production/Labor, Market Power, Market Gate, unrelated website content, recipe schema, existing IDs/answers/taxonomy, adaptive/remediation mechanics, mode floors, and 2,800 ms ordinary feedback timing remain intact. Historical protected-record tests pass.

## Unresolved limitations

No blocking issue remains. The bank uses the three supplied Lorenz assets only; it makes no claim to graphical poverty-threshold or labor-market coverage. Interactive browser QA sampled representative paths, while the complete deterministic validator checked every record and graph assignment.
