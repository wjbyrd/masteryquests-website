# Federal Budgets & Debt — Production Report

**Production date:** 2026-08-27  
**Concept:** Federal Budgets & Debt (`federal-budgets-and-debt`)  
**Release:** `FederalBudgetsDebt-2026.08.27-production-v1`  
**Status:** Production bank published and validated in the working tree; no commit created.

## 1. Executive summary

Published one original Principles Macroeconomics concept with exactly 108 new questions. The release adds no assets or graph-dependent questions, changes no prior question record, preserves all 38 audited supporting records, and raises the canonical library to 9,379 questions, 134 concepts, and 486 assets. The focused validator passed 2,186 checks and the active Composer suite passed all 24 runners.

## 2. Concept registration

- Title: Federal Budgets & Debt
- Canonical ID: `federal-budgets-and-debt`
- Discipline/area: Macro only
- Prerequisites: GDP Components; GDP Measurement
- Related concepts: Fiscal Policy and Aggregate Demand; Fiscal Multipliers and Crowding Out
- Coverage status: ready-focused, standalone
- Stabilization Policy quick start: unchanged; this concept was not added
- Concept-review resource: placeholder metadata only (`NO_SHEET_INTEGRATION_META`), as requested

## 3. Exact question count

Exactly **108 new questions** were authored and published. No legacy record was moved, cloned, renumbered, or reassigned.

## 4. ID range

- First ID: **43060**
- Last ID: **43167**
- Allocation: contiguous, deterministic, and collision-free

## 5. FB1–FB9 counts

| Objective | Title | Count |
|---|---|---:|
| FB1 | Federal Budget Accounting | 15 |
| FB2 | Deficit Versus Debt | 17 |
| FB3 | Public Saving | 11 |
| FB4 | Federal Revenues and Outlays | 11 |
| FB5 | Measures of Federal Debt | 11 |
| FB6 | Debt-to-GDP | 15 |
| FB7 | Interest Costs and Debt Service | 10 |
| FB8 | Persistent Deficits and Government Borrowing | 11 |
| FB9 | Real-World Fiscal-Data Interpretation | 7 |

The requested targets were met exactly. FB2 and FB6 are the two deepest families.

## 6. Difficulty distribution

| Easy | Medium | Hard | Elite | Legendary | Total |
|---:|---:|---:|---:|---:|---:|
| 32 | 32 | 22 | 10 | 12 | 108 |

Boss and adaptive records inherit the appropriate canonical difficulty; high challenge comes from economic synthesis, not longer prose.

## 7. Pool distribution

| Pool | Count |
|---|---:|
| easy | 20 |
| medium | 20 |
| hard | 18 |
| elite | 10 |
| legendary | 8 |
| easyBoss | 4 |
| mediumBoss | 4 |
| finalBoss | 4 |
| legendaryBoss | 4 |
| repairQuestions | 8 |
| bridgeQuestions | 8 |

This yields 76 ordinary/challenge questions, 16 checkpoint/boss questions, and 16 adaptive Repair/Bridge questions.

## 8. Type distribution

| Type | Count |
|---|---:|
| definition | 14 |
| interpretation | 17 |
| calculation | 16 |
| integration | 43 |
| application | 9 |
| bridge | 8 |
| comparison | 1 |

## 9. Real-world-data count

The bank contains **15 official-data questions**, within the requested 12–16 range. They test interpretation rather than memorization; the remaining 93 questions use durable synthetic economics.

## 10. Official-data provenance summary

Two official U.S. government sources were frozen in `FEDERAL-BUDGETS-DEBT-DATA-SOURCES.md`:

1. Congressional Budget Office, *The Budget and Economic Outlook: 2026 to 2036*, published February 11, 2026. Questions identify its values as projections and use fiscal-year/percentage/trillion units as stated.
2. U.S. Department of the Treasury, Bureau of the Fiscal Service, *Debt to the Penny*, last updated August 26, 2026. Questions use its debt-measure definitions and dated-stock interpretation; they do not ask for a live debt value.

Every official-data record resolves through a structured `dataSourceKey`. The bank does not use the unverified nominal `$32.1 trillion` anchor.

## 11. Public-saving convention

The bank uses `public saving = T − G` only when **T is explicitly net tax revenue, net of transfers, and G is government purchases**. Total federal revenues minus total federal outlays is always labeled the federal budget balance, surplus, or deficit—not public saving. Focused validation pins every occurrence of the shorthand and the transfer-inclusive-outlay boundary.

## 12. Deficit/debt safeguards

Pinned questions establish that the deficit is an annual flow and debt is a stock; a smaller positive deficit can coexist with rising debt; a balanced budget does not erase existing debt; and a surplus may reduce debt only under stated financing assumptions. Real-world wording says deficits generally add to debt and recognizes cash balances, timing, and other financing adjustments.

## 13. Debt-measure coverage

Coverage distinguishes debt held by the public, intragovernmental holdings, total public debt outstanding, and—when instructionally useful—debt subject to limit. No numeric amount is labeled merely “the federal debt,” and Treasury-security trivia is excluded.

## 14. Debt-to-GDP coverage

FB6 includes calculation, interpretation, cross-economy comparison, numerator/denominator growth, nominal debt versus ratio direction, and percent versus percentage-point distinctions. CBO's 101% and 120% projections are described as a 19-percentage-point change.

## 15. Interest-cost coverage

Questions distinguish the debt stock from annual net interest outlays, use clearly labeled simplifying assumptions for one-rate calculations, explain the roles of debt size and rates, and connect higher interest outlays to future budget pressure. The bank does not teach bond pricing or imply that one rate describes the actual debt portfolio.

## 16. Phase 2 boundary

The bank stops at the introductory chain from persistent deficits to lower public saving, borrowing, and larger debt. It may state a conditional pressure on rates/private investment, but it does not build loanable-funds supply/demand, equilibrium, graphs, saving-investment equilibrium, foreign capital, exchange rates, or open-economy macro.

## 17. Graph decision

Graph count is **0**. No unrelated AD–AS or crowding-out asset was attached, no new renderer was added, and compact fiscal evidence remains textual.

## 18. Trial by Graph status

Standalone Trial by Graph is **intentionally unavailable**: the mode requires 10 graph-safe questions and this concept supplies 0. The browser displays a clear “Mode Unavailable” dialog with `Needs 10; found 0`. All nine non-graph modes pass standalone requirements.

## 19. Repetition audit

- Normalized duplicate stems: 0
- Near-duplicate pairs at Jaccard threshold 0.75: 0
- Exact repeated correct-answer strings: 0
- Repeated distractor sets: 0
- Maximum repeated five-word opening: 6 (CBO provenance framing)
- Answer positions: A/B/C/D = 27/27/27/27

Manual review found the repeated CBO opening justified by source/date/status precision rather than a duplicated economic task.

## 20. Political-neutrality audit

No president, administration, political party, campaign language, ideological label, or praise/blame framing appears. A dedicated per-record neutrality check passed all 108 records. The bank analyzes positive accounting relationships and conditional tradeoffs without prescribing a fiscal philosophy.

## 21. Focused validator results

`run_federal_budgets_debt_question_pool_validation.mjs` passed **2,186 checks** with zero errors. It pins author sequences, published answer hashes, all distributions, 38 protected records, source provenance, public-saving notation, deficit/debt misconceptions, Macro-only placement, mode support, Mastery Report metadata, deterministic output, and sample generation.

## 22. Active Composer suite

The active suite passed **24/24 runners**. It includes the new focused validator, the existing 1,067-check Factor Markets validator, the 2,171-check remaining-Micro validator, the 25-run simulation/manual audit, checkpoint regression, concept-review and Mastery Report tests, and all mode validators. Release pins were advanced from 9,271/133 to 9,379/134; behavioral thresholds were not changed. Historical `audit_tools/run_macro_m2*.mjs` scripts remain archival phase-tail validators whose `libraryVersion.endsWith(PHASE)` contract predates multiple later releases; the focused validator instead proves every pre-existing question record—including all Macro banks—is byte-for-byte unchanged from `HEAD`.

## 23. Browser QA

In the Codex in-app browser, the generated quest passed Standard Campaign, Quiz, Exam Drill, Unlimited Practice, and Legendary Mode smoke/interaction checks. Ordinary correct and incorrect responses rendered correctly. A live adaptive miss sequence completed Concept Repair → Bridge Repair → Recovery Retest and returned to its origin room. Desktop question/answer layout showed no overlap or clipping.

Checkpoint One was exercised with Q1 incorrect, Q2 correct, and Q3 correct. The observed transition was Q1 → Q2, never Q1 → Repair; all three questions completed, evidence remained, and gameplay resumed normally at Room 11.

## 24. Mastery Report QA

Exam Drill and Unlimited Practice both generated reports. The longer report displayed 83% accuracy, 5/6 evidence, Developing Evidence, human-readable `Revenues And Outlays` objective labeling, `Definition` question-form labeling, behavior counts, and a concrete next move. Neither `FB4` nor `federal-budgets-and-debt` appeared as raw student-facing labels. The game title remains visible as Federal Budgets & Debt Mastery Quest.

## 25. Published totals

| Measure | Before | After | Change |
|---|---:|---:|---:|
| Canonical questions | 9,271 | 9,379 | +108 |
| Concepts | 133 | 134 | +1 |
| Assets | 486 | 486 | 0 |

Published library SHA-256: `e47d94f4b2e11e010a8ce02c18f606ed0589d493e7cbf0170a3bdd9eeb10d742`.

## 26. Exact files changed

New production files:

- `FEDERAL-BUDGETS-DEBT-DATA-SOURCES.md`
- `FEDERAL-BUDGETS-DEBT-PRODUCTION-REPORT.md`
- `audit_tools/publish_federal_budgets_debt_question_pool.mjs`
- `build/faculty-build-composer/authoring/federal_budgets_debt_question_pool_author.mjs`
- `build/faculty-build-composer/federal_budgets_debt_validation_results.json`
- `build/faculty-build-composer/tests/federal-budgets-debt-browser-qa-results.json`
- `build/faculty-build-composer/tests/federal-budgets-debt-faculty-sample.html`
- `build/faculty-build-composer/tests/federal-budgets-debt-production-sample.html`
- `build/faculty-build-composer/tests/run_federal_budgets_debt_question_pool_validation.mjs`

Deterministically generated library/registration files:

- `build/faculty-build-composer/data/composer_library.js`
- `build/faculty-build-composer/data/composer_library_manifest.json`
- `build/faculty-build-composer/data/composer_registry.json`
- `build/faculty-build-composer/data/concept-reviews/full-library-production/concept_review_source.json`
- `build/faculty-build-composer/data/concept-reviews/manifest.json`

Active-suite baseline/integration files:

- `build/faculty-build-composer/tests/run_active_composer_suite.js`
- `build/faculty-build-composer/tests/run_externalities_copy_taxonomy_repair_validation.mjs`
- `build/faculty-build-composer/tests/run_externalities_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/run_factor_markets_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/run_fading_fortune_validation.js`
- `build/faculty-build-composer/tests/run_mastery_report_2_validation.js`
- `build/faculty-build-composer/tests/run_phase3e_graph_question_sync_validation.mjs`
- `build/faculty-build-composer/tests/run_public_goods_common_resources_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/run_remaining_micro_manual_audit_validation.mjs`
- `build/faculty-build-composer/tests/run_remaining_principles_micro_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/run_risk_reward_validation.js`
- `build/faculty-build-composer/tests/run_trial_by_graph_validation.js`
- `build/faculty-build-composer/tests/run_unlimited_practice_validation.js`

`FEDERAL-BUDGETS-DEBT-INVENTORY-AUDIT.md` was read and retained unchanged.

## 27. Remaining limitations/issues

No production-blocking issue remains. Intended limitations are: zero dedicated graph questions; standalone Trial by Graph unavailable; official statistics frozen to dated CBO/Treasury sources rather than live values; and no final faculty concept-review sheet until the later synchronization pass. No runtime change was made, no legacy question was altered, and no commit was created.
