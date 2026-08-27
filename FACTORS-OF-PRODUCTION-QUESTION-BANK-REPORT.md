# Factor Markets / Labor Question Bank Production Report

Date: 2026-08-26  
Source version: `FactorMarkets-2026.08.26-production-v1`  
Canonical concept: `factor-markets`  
Composer version: `4.5s.3j`  
Status: production publisher PASS; focused validator PASS; active suite PASS; browser QA PASS

## Executive result

This change publishes a new, canonical Principles of Economics factor-markets/labor concept with exactly 240 new questions. No pre-existing question was moved, rewritten, or assigned to the new concept. The result is 240 canonical records under `factor-markets`, 64 graph-dependent records, 176 non-graph records, nine byte-preserved WebP graph assets, six repair questions, six bridge questions, and coverage of all ten supported game modes.

The final canonical library contains 8,771 questions, 130 concepts, and 475 registered question assets. The deterministic final library SHA-256 is:

`dc7e539f7c63e2bb32b69d0497f2f6d357e1a3da9626232a4b15642bd5836da3`

## Baseline inventory and taxonomy audit

### Baseline counts

| Inventory | Before | After | Change |
| --- | ---: | ---: | ---: |
| Canonical questions | 8,531 | 8,771 | +240 |
| Registered concepts | 129 | 130 | +1 |
| Registered question assets | 466 | 475 | +9 |
| Graph-required IDs used by Trial by Graph validation | 797 | 861 | +64 |

The repository did not contain a registered or selectable `factor-markets` concept. It did contain dangling `relatedConceptId` references to `factor-markets` from Costs of Production and Perfect Competition. Those references are strong evidence that `factor-markets` was the intended missing canonical taxonomy node, rather than a reason to repurpose another concept.

The audit found 29 adjacent existing records across nearby production, elasticity, wage-policy, and labor-institution topics. They remain under their established concepts:

- `labor-market-institutions` remains the home for minimum wages, unions, job search, and efficiency-wage material already published there.
- `binding-price-floors` retains its existing minimum-wage applications.
- Existing short-run production and elasticity records remain canonical in their current concepts.
- No existing question was duplicated into, moved to, or shared with `factor-markets`.

Taxonomy disposition:

- Retained existing records in `factor-markets`: **0**
- Newly authored records: **240**
- Resulting records in `factor-markets`: **240**
- New concept created: **yes**
- Existing record mutation: **none**

## Identity and deterministic authoring

The new numeric ID range is contiguous and was unused at baseline:

- First ID: `42320`
- Last ID: `42559`
- Count: `240`
- Duplicate IDs: `0`
- Gaps: `0`
- Answer positions: exactly `60 / 60 / 60 / 60`

The source file is deterministic and exports the complete pool from compact, reviewable authoring rows. Identity and content digests are:

| Field sequence | SHA-256 |
| --- | --- |
| IDs | `9284953b94d4becb291bf914b9f9fbb1e1b0c07fb98897acac68d3d5cc62fbb3` |
| Correct answers | `a0c1d9b190c0f7a730692cc47fa94f5b4f04a1d650a0f50bdb8b838da54ae338` |
| Skills | `adc44aaba79542538aa589f8d7c3b1d40803840c878c82886c7e15afa032f7d0` |
| Objectives | `7004bef301aeb29279f2b01b4b20489cc486b92a8ff48ca6632843ec72811931` |
| Difficulties | `737d6fb9fa93a56d9b5f7404946acc210463ee35fea3e019dc3fffba225934f1` |
| Pools | `beef4a383a5641a397986517744a236d0304eff6b6df8c13959eb3143e80570d` |
| Graph assignments | `7df17116b6456a576b2a7d620ba251e9bd15ac30d28bd284ed86879b601196df` |
| Stems | `e6969bd48b3f76323cbfead7f9c6ead0abda8de7b1f91b7d915fc44e1e050c0a` |

## Objective distribution

| Objective | Label | Questions |
| --- | --- | ---: |
| FM.1 | Diminishing Marginal Product of Labor | 20 |
| FM.2 | Value of Marginal Product, Wages, and Hiring Decisions | 22 |
| FM.3 | Calculate Value of Marginal Product | 18 |
| FM.4 | Calculate Marginal Product of Labor | 18 |
| FM.5 | Movement Along versus Shift of Labor Demand | 20 |
| FM.6 | Labor-Demand Changes and Market Equilibrium | 20 |
| FM.7 | Relationships among Factor Markets | 16 |
| FM.8 | Labor-Supply Determinants | 18 |
| FM.9 | Labor-Supply Changes and Market Equilibrium | 18 |
| FM.10 | Factor-Market Equilibrium | 18 |
| FM.11 | Labor-Market Equilibrium Wage and Employment | 18 |
| FM.12 | Labor-Demand Determinants | 18 |
| FM.13 | Cross-Factor Market Effects | 16 |
| **Total** |  | **240** |

## Difficulty, pool, type, and subtopic distributions

### Difficulty

| Difficulty | Questions |
| --- | ---: |
| Easy | 60 |
| Medium | 90 |
| Hard | 54 |
| Elite | 18 |
| Legendary | 18 |
| **Total** | **240** |

### Runtime pool

| Pool | Questions |
| --- | ---: |
| easy | 54 |
| medium | 72 |
| hard | 48 |
| elite | 18 |
| legendary | 12 |
| easyBoss | 6 |
| mediumBoss | 6 |
| finalBoss | 6 |
| legendaryBoss | 6 |
| repairQuestions | 6 |
| bridgeQuestions | 6 |
| **Total** | **240** |

### Question type

| Type | Questions |
| --- | ---: |
| application | 80 |
| calculation | 53 |
| graph_interpretation | 26 |
| interpretation | 23 |
| graph_integration | 17 |
| integration | 14 |
| graph_calculation | 12 |
| graph_trap | 9 |
| bridge | 6 |
| **Total** | **240** |

### Instructional subtopic

| Subtopic tag | Questions |
| --- | ---: |
| production-and-diminishing-marginal-product | 38 |
| derived-demand-and-labor-demand-determinants | 38 |
| labor-supply-determinants-and-shifts | 36 |
| relationships-among-factor-markets | 32 |
| competitive-labor-market-equilibrium-and-wages | 23 |
| labor-demand-shifts-and-comparative-statics | 20 |
| firm-labor-demand-and-input-decisions | 20 |
| marginal-product-and-value-of-marginal-product | 18 |
| supplemental-labor-market-applications | 15 |
| **Total** | **240** |

Supplemental coverage is deliberately proportional: the two minimum-wage graphs support 11 questions total, and monopsony supports four. These are applications within the broader factor-market bank, not substitutes for the bank's production, MPL/VMP, derived-demand, equilibrium, supply, demand, and cross-factor foundations.

## Graph inventory and authoritative readings

All incoming assets were inspected before authoring, preserved byte-for-byte, moved to `build/faculty-build-composer/data/question-assets/factor-markets/`, registered, embedded by the Composer build, and removed from the incoming staging folder.

| Asset | Authoritative reading | Questions | Dimensions | Bytes | SHA-256 |
| --- | --- | ---: | ---: | ---: | --- |
| LABOR-01.webp | Warehouse equilibrium: 4,000 workers at $20/hour | 10 | 1651×1182 | 61,218 | `6ab49624f781b786c338440667347fa79c67a9f471e113c633d25d036b680946` |
| LABOR-02.webp | Demand increase: 4,000 at $20 → 6,000 at $25 | 9 | 1720×1200 | 74,204 | `e6ecbe54922ffbe4929e10494e307ae1092461e26896ebd00a3af81b22fbad73` |
| LABOR-03.webp | Demand decrease: 4,000 at $20 → 2,000 at $15 | 9 | 1720×1200 | 65,808 | `7d7163c3fa8ba6d719c5b15c037c6636aeffae63194e7825ded3eae472d5eeea` |
| LABOR-04.webp | Supply increase: 4,000 at $20 → 6,000 at $15 | 8 | 1624×1200 | 72,982 | `7bb0871ba053742da20aa39dee70922a3e24ff0549588186dfcba6fa07317536` |
| LABOR-05.webp | Supply decrease: 4,000 at $20 → 2,000 at $25 | 8 | 1653×1200 | 70,446 | `b34cf3cf4422b9411e0acb67c965d7950b61a693ef5008d00513b3bc91245aad` |
| LABOR-06.webp | Binding $20 floor above $15 equilibrium; Qd 2,000, Qs 6,000, surplus 4,000 | 7 | 1617×1200 | 71,208 | `e5bebbfd9f2ab8eab68524fa99a689196544d41d4ad35ed110611f67638f2214` |
| LABOR-07.webp | Nonbinding $10 floor below 4,000-at-$15 equilibrium | 4 | 1642×1182 | 63,756 | `f6cc7e4327e537c2cc756453593d5522cdb90a0c0abdcd273ff867a8283e6d6e` |
| LABOR-08.webp | Monopsony: MFC=MRP at 4,000; wage $20 on supply; competition 6,000 at $25 | 4 | 1720×1200 | 69,234 | `d2ec0bd0a1c742236406ab92a73bb57408fd6f19ca5509306ea819b2918f7172` |
| LABOR-09.webp | Demand and supply rise: 4,000 at $20 → 8,000 at $20 | 5 | 1624×1200 | 78,764 | `ef7b4edc7407c3be73a64749a0d76f9c5e513e358b9f4cf67fa108220533bd2c` |
| **Total** |  | **64** |  | **627,620** |  |

Axis normalization is explicit in the prompt, feedback, graph alt text, and long description: every horizontal axis labeled in hundreds of workers is converted to workers by multiplying by 100. Wage values are consistently stated in dollars per hour. No question treats the displayed `40` as 40 workers.

### Graph-dependency audit

- Questions reviewed for graph necessity: 64
- Questions retained as truly graph-dependent: 64
- Questions converted to non-graph: 0
- Non-graph questions: 176
- Trial-by-Graph audited/safe subset in the focused build: 41

Each of the 64 graph questions requires a plotted intersection, curve identity, curve movement, marked policy line, scale conversion, or comparison that is not fully restated in the stem. No decorative graph dependency was retained.

## Copy and answer-quality audit

- Four distinct options per record: PASS
- Correct answer resolves to exactly one option: PASS
- Explanation/feedback agrees with the answer: PASS
- Duplicate normalized stems: 0
- Near-duplicate pairs at token Jaccard ≥ 0.78: 0
- Banned boilerplate phrase hits: 0
- Maximum repeated opening count: 8 (limit 12)
- Balanced correct-option positions: 60 each

During review, two generated distractor collisions in MPL/VMP calculations were corrected before publication. Answer hashing was also aligned exactly with the Composer's normalization contract (`NFKC`, trim, whitespace collapse, lowercase), after which source, library, and concept-review answer verification all passed.

## Representative questions

The following illustrate the vertical progression without reproducing the complete bank.

| ID | Difficulty | Objective | Type | Prompt | Correct answer |
| --- | --- | --- | --- | --- | --- |
| 42320 | Easy | FM.11 | graph_interpretation | What hourly wage clears the warehouse labor market shown? | $20 per hour |
| 42321 | Medium | FM.11 | graph_interpretation | At the market-clearing wage, how many warehouse workers are employed? | 4,000 workers |
| 42322 | Hard | FM.10 | graph_interpretation | Suppose the wage is $30 per hour. What imbalance is visible in this warehouse labor market? | Labor supplied exceeds labor demanded |
| 42327 | Elite | FM.11 | graph_interpretation | At equilibrium, what payment does an additional employed worker receive in this competitive market? | The market wage of $20 per hour |
| 42329 | Legendary | FM.10 | graph_calculation | Why does 40 on the horizontal axis not mean 40 warehouse workers? | The axis is measured in hundreds, so 40 represents 4,000 |

## Publisher and generated artifacts

`audit_tools/publish_factor_markets_question_pool.mjs` is the sole deterministic publisher for this phase. It validates the author source and assets before updating generated state. A no-write repeat after the final publication returned PASS with the same library hash.

Publisher result:

```text
status: PASS
questions: 240
graphQuestions: 64
assets: 9
canonicalQuestionCount: 8771
assetInventoryCount: 475
conceptQuestionCount: 240
conceptCount: 130
librarySha256: dc7e539f7c63e2bb32b69d0497f2f6d357e1a3da9626232a4b15642bd5836da3
```

The publisher updates the canonical library, manifest, registry, concept-review manifest/source, course-area model, quick-starts, and Composer version while preserving existing registry/review ordering and immutable existing question content. Recipe schema version `1.4.0` remains unchanged.

## Automated validation

Focused command:

`node build/faculty-build-composer/tests/run_factor_markets_question_pool_validation.mjs`

Focused result:

- Status: PASS
- Checks: 1,065
- Focused build: `build/faculty-build-composer/tests/factor-markets-production-sample.html`
- Inline scripts: 1, syntax-valid
- Supported modes built and validated: Standard, Timed, Exam, Quiz, Unlimited, Legendary, Score Attack, Trial by Graph, Fading Fortune, Risk & Reward
- Exact 240-question, objective, difficulty, pool, graph, answer-position, asset, adaptive-support, review, and hash checks: PASS

Full command:

`node build/faculty-build-composer/tests/run_active_composer_suite.js`

Full result: **20/20 PASS**. Passing suites cover phase 1 repair, phase 1.5 hardening, official themes, custom assets, graph synchronization, externalities, public goods/common resources, factor markets, concept reviews, both Mastery Report suites and the state-leak hotfix, mode availability, Quiz, Unlimited Practice, Trial by Graph, Fading Fortune, Risk & Reward, and Risk & Reward state.

## Browser QA

Browser QA used the generated focused build through a localhost HTTP server and the in-app browser-control runtime. The production build itself was not altered for QA. Temporary, separately served QA-only copies changed only deck order: one ordered Trial by Graph so the elite-only LABOR-01 graph could be observed without relying on random selection, and one ordered a short Quiz for required non-graph concept sampling. Both temporary files and generators were deleted after the checks.

Verified live behavior:

- Desktop start screen at 1280×720: PASS; no horizontal overflow.
- Mode-selection screen: all ten instructor-enabled modes visible and selectable.
- Live content sampling: diminishing MPL, MPL calculation, combined VMP calculation/hiring, productivity-driven labor-demand shift versus wage movement, labor-supply determinants, complementary factors, substitute factors, competitive wage/employment, all four one-curve shift graphs, binding/nonbinding wage floors, monopsony, simultaneous demand/supply shifts, and cross-factor effects were inspected.
- Unlimited Practice: PASS.
- Incorrect response: `Wrong Turn` feedback appeared.
- Adaptive follow-up: the miss changed the next item to a targeted labor-demand repair question; later rapid misses produced a VMP `Concept Repair` item.
- Correct response: explanation appeared and the run advanced with streak state.
- End Practice: confirmation correctly stated 10 scored attempts and generated a Mastery Report.
- Mastery Report: accuracy, evidence strength, hardest evidence, concept/skill/form signals, behavior signals, and next moves rendered.
- Trial by Graph: 41 audited graph-safe questions reported; a 20-question run completed and produced results.
- Graph enlargement: PASS, including close control, natural-resolution image, concise alt text, and visible long description.
- Every `LABOR-01.webp` through `LABOR-09.webp` asset rendered at least once in live gameplay across the production graph trials and the deterministic QA-only coverage deck.
- Tablet gameplay at 768×1024: PASS; no horizontal overflow and two-column answer controls remained usable.
- Mobile gameplay at 390×844: PASS; no horizontal overflow, graph scaled to 358×257, answer controls remained two-column and tappable.
- Browser console warnings/errors: 0.

## Files added

- `audit_tools/publish_factor_markets_question_pool.mjs`
- `build/faculty-build-composer/authoring/factor_markets_question_pool_author.mjs`
- `build/faculty-build-composer/tests/run_factor_markets_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/factor-markets-production-sample.html`
- `build/faculty-build-composer/data/question-assets/factor-markets/LABOR-01.webp` through `LABOR-09.webp`
- `FACTORS-OF-PRODUCTION-QUESTION-BANK-REPORT.md`

## Files updated

Core/catalog output:

- `build/faculty-build-composer/composer-core.js`
- `build/faculty-build-composer/composer.js`
- `build/faculty-build-composer/course-area-model.js`
- `build/faculty-build-composer/data/composer_library.js`
- `build/faculty-build-composer/data/composer_library_manifest.json`
- `build/faculty-build-composer/data/composer_registry.json`
- `build/faculty-build-composer/data/concept-reviews/manifest.json`
- `build/faculty-build-composer/data/concept-reviews/full-library-production/concept_review_source.json`

Validation snapshots/integration:

- `build/faculty-build-composer/tests/run_active_composer_suite.js`
- `build/faculty-build-composer/tests/run_phase3a_official_theme_validation.js`
- `build/faculty-build-composer/tests/run_phase3b_custom_asset_validation.js`
- `build/faculty-build-composer/tests/run_phase3e_graph_question_sync_validation.mjs`
- `build/faculty-build-composer/tests/run_externalities_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/run_externalities_copy_taxonomy_repair_validation.mjs`
- `build/faculty-build-composer/tests/run_public_goods_common_resources_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/run_mastery_report_2_validation.js`
- `build/faculty-build-composer/tests/run_unlimited_practice_validation.js`
- `build/faculty-build-composer/tests/run_trial_by_graph_validation.js`
- `build/faculty-build-composer/tests/run_fading_fortune_validation.js`
- `build/faculty-build-composer/tests/run_risk_reward_validation.js`

## Intentionally unchanged

- All 8,531 baseline canonical question records and their identity/content hashes.
- Existing concept ownership of the 29 adjacent audited records.
- Existing minimum-wage records in `binding-price-floors` and labor-institution records in `labor-market-institutions`.
- Existing production and elasticity concept assignments.
- Canonical HTML gameplay template and mode behavior.
- Recipe schema version `1.4.0`.
- The nine supplied WebP asset byte streams.

## Known limitation

No immutable faculty source sheet or PDF was provided for this phase. The concept-review entry is therefore registered as diagnosable with disposition `NO_SHEET_INTEGRATION_META`, so Mastery Report diagnosis works, but there is no source-sheet review page to attach. This is documented metadata, not a validation failure.

## Final acceptance

The repository now contains a reproducible, production-grade 240-question factor-markets/labor bank with complete graph registration, deterministic publishing, protected baseline content, adaptive support, all-mode composition, focused and full regression coverage, live responsive browser verification, and a clean console. No commit was created.
