# Externalities Question Pool Production Report

Production date: 2026-08-26  
Source version: `Externalities-2026.08.26-production-v1`  
Composer version: `4.5s.3e -> 4.5s.3f`  
Recipe schema: `1.4.0` (unchanged)  
Concept: `market-failures`  
Question IDs: `42000-42159`

## Scope And Result

The production pool adds exactly 160 ordinary Principles of Microeconomics externalities questions. It adds no Repair, Repair Seed, Bridge, boss, engine, mode, UI, recipe-schema, runtime Market Gate, or unrelated-pool changes. The preflight working tree contained only the user-staged `_incoming-externalities/` directory.

| Measure | Before | After | Change |
| --- | ---: | ---: | ---: |
| Canonical questions | 8,211 | 8,371 | +160 |
| Graph-dependent questions | 1,151 | 1,255 | +104 |
| Registered assets | 448 | 461 | +13 |
| Physical WebPs | 448 | 461 | +13 |

The safe contiguous range `42000-42159` had no collision with existing ordinary or support IDs. The Phase 2A range `40000-40047` and Market Gate remediation range were not reused.

## Allocation

| Objective | ID | Total | Graph |
| --- | --- | ---: | ---: |
| Positive versus Negative Externalities | `EXT.1` | 14 | 4 |
| Negative Externalities and Market Efficiency | `EXT.2` | 28 | 24 |
| Regulation of Negative Externalities | `EXT.3` | 16 | 6 |
| Corrective Taxes | `EXT.4` | 26 | 22 |
| Positive Externalities and Market Efficiency | `EXT.5` | 26 | 24 |
| Corrective Subsidies | `EXT.6` | 20 | 18 |
| Tradable Permits | `EXT.7` | 12 | 0 |
| Private Solutions | `EXT.8` | 8 | 0 |
| Coase Theorem | `EXT.9` | 10 | 6 |
| **Total** | | **160** | **104** |

| Difficulty | Count | Question type | Count |
| --- | ---: | --- | ---: |
| Easy | 24 | Graph interpretation | 34 |
| Medium | 48 | Graph calculation | 30 |
| Hard | 48 | Graph integration/policy | 24 |
| Elite | 28 | Graph trap | 16 |
| Legendary | 12 | Scenario application | 24 |
| | | Conceptual/causal interpretation | 14 |
| | | Policy evaluation/integration | 10 |
| | | Private/Coase/permit calculation | 8 |

Hard-or-above coverage is `88/160`, exactly 55%. Answer positions are balanced `40/40/40/40`.

| Graph class | Questions | Scenario | Graph questions |
| --- | ---: | --- | ---: |
| A | 20 | Fast fashion | 24 |
| B | 40 | Disposable vapes | 32 |
| C | 36 | Native-plant gardens | 24 |
| D | 8 | Public transit | 24 |
| Non-graph | 56 | General/mixed cases | 56 |

## Skill Totals

The pool uses 62 precise `primarySkill` values. Higher-frequency strands are: `externality_social_cost` 13, `external_marginal_cost` 12, `externality_identification` 10, `externality_quantity_gap` 8, `corrective_tax_externality_logic` 7, `subsidy_price_signal` 7, `positive_externality` 6, `buyer_seller_policy_wedge` 5, `coase_efficiency` 5, `externality_dwl_calculation` 5, and four each for `corrective_policy_quantity`, `equilibrium_price`, `graph_reading`, `policy_internalization`, `social_efficiency_condition`, and `tax_revenue_calculation`.

Counts of three: `tradable_permit_cap`. Counts of two: `coase_policy_comparison`, `corrective_tax_misconception`, `externality_channel`, `imperfect_corrective_tax`, `negative_externality_efficiency`, `regulation_policy_identification`, `regulatory_quantity_target`, `subsidy_expenditure_calculation`, `subsidy_quantity_target`, and `transaction_cost_net_gain`.

Counts of one: `abatement_cost_allocation`, `coase_assumptions`, `coase_distribution`, `coase_transaction_cost_threshold`, `dwl_reduction_percentage`, `efficiency_vs_cost_effectiveness`, `efficiency_vs_distribution`, `externality`, `imperfect_policy_evaluation`, `imperfect_policy_quantity`, `permit_allocation_distribution`, `permit_cap_comparative_statics`, `permit_enforcement`, `policy_comparison`, `positive_externality_efficiency`, `private_contract_solution`, `private_incentive_capture`, `private_solution_integration`, `regulation_mechanism`, `regulatory_cost_effectiveness`, `regulatory_design`, `regulatory_enforcement`, `regulatory_flexibility`, `regulatory_tradeoff`, `residual_dwl_calculation`, `residual_quantity_distortion`, `social_norm_solution`, `subsidy_policy_evaluation`, `tax_revenue_vs_dwl`, `tradable_permit_cap_calculation`, `tradable_permit_cost_effectiveness`, `tradable_permit_price_signal`, `tradable_permit_trading`, `transaction_cost_barrier`, and `transaction_cost_threshold`.

## Content And Answer Safety

- Independent numerical assertions verify market/efficient outcomes, external gaps, DWL, tax revenue, subsidy expenditure, corrected prices, imperfect-tax quantity, residual DWL, percentage removed, and imperfect-policy revenue.
- Coase items preserve efficiency-versus-distribution and transaction-cost qualifications.
- Permit items preserve the fixed cap, marginal-abatement-cost trading logic, enforcement, allocation, and distribution distinctions.
- All 160 stems are exact-duplicate free. Maximum token similarity is `0.750`, below the `0.800` review threshold.
- All 160 answer sets are distinct, and each contains four unique choices.
- Published records contain hashed answers only; no plaintext correct-answer field or index is present.
- Graph questions contain accessible alternatives and descriptions; answer positions have no pattern.

## Files Changed

New authored/publishing/validation files:

- `build/faculty-build-composer/authoring/externalities_question_pool_author.mjs`
- `audit_tools/publish_externalities_question_pool.mjs`
- `build/faculty-build-composer/tests/run_externalities_question_pool_validation.mjs`
- `EXTERNALITIES-QUESTION-POOL-PRODUCTION-REPORT.md`
- `EXTERNALITIES-GRAPH-ASSET-INVENTORY.md`
- 13 `build/faculty-build-composer/data/question-assets/market-failures/EXTERNALITY-*.webp` files

Generated/version/test-pin files:

- `build/faculty-build-composer/composer-core.js`
- `build/faculty-build-composer/data/composer_library.js`
- `build/faculty-build-composer/data/composer_registry.json`
- `build/faculty-build-composer/data/composer_library_manifest.json`
- `build/faculty-build-composer/data/concept-reviews/manifest.json`
- `build/faculty-build-composer/tests/run_active_composer_suite.js`
- Phase 3A, Phase 3B, Phase 3E, Mastery Report 2, Unlimited Practice, Trial by Graph, Fading Fortune, Risk & Reward, and full-graph count/version validators

## Validation Results

- `node audit_tools/publish_externalities_question_pool.mjs`: PASS; byte-identical deterministic rerun; library SHA-256 `a6570af954330fedf0c48f3a014b64fada157a361a71b0ccb6f89961f5a616b6`.
- `node build/faculty-build-composer/tests/run_externalities_question_pool_validation.mjs`: PASS; all allocations, numerical assertions, hashes, dimensions, references, answer safety, duplication, all ten modes, Trial by Graph, adaptive support, and Mastery metadata.
- `node build/faculty-build-composer/tests/run_active_composer_suite.js`: PASS, 17/17.
- Full graph audit: PASS; 186 legacy audit questions, 461 assets, no global asset issues.
- JavaScript and generated inline-script syntax: PASS.
- All 13 WebPs decoded and matched registered `1720x1200` dimensions, sizes, and hashes.

Browser QA used a generated quest containing all four scenarios and representative A, B, C, and D assets. Trial by Graph reported 104 graph-safe questions. Embedded WebPs decoded at `1720x1200`; enlargement, accessible descriptions, correct-answer feedback, wrong-answer feedback, Quiz completion, and Mastery Report presentation passed. At `1280x720` and `390x844`, horizontal overflow and visible button overlap were both zero. Browser console errors/warnings were empty.

## Unresolved Issues

No new issue remains. The full-graph audit retains one pre-existing advisory that `statutory-versus-economic-tax-incidence` has no direct repair route; this is outside the externalities expansion and was not changed. Existing generic Market Failures Repair and Bridge routes remain available and unchanged; the architecture did not require new remediation records. No runtime Market Gate bank, unrelated pool, Composer feature, recipe field, or user interface was modified. No commit was created.
