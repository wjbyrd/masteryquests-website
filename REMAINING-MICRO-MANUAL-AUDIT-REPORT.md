# Remaining Principles Micro Manual Audit Report

Date: 2026-08-27  
Scope: Factors of Production / Labor; Consumer Choice; Income Inequality, Poverty, and Redistribution; Information Asymmetry, Behavioral Economics, and Political Economy  
Disposition: targeted repair completed; no commit created

## 1. Realm-placement fix

The placement defect was in the shared `MICRO_AREA_IDS` source of truth in `course-area-model.js`, not in concept IDs or registrations. Consumer Choice, Income Inequality/Poverty/Redistribution, and Information/Behavioral/Political Economy were added to that Micro set; Factors of Production / Labor was already present. Browser QA and the regression validator confirm all four appear under Micro, none appears under Macro, unrelated realm assignments are unchanged, quick starts resolve, and focused compositions still build.

## 2. Graph filename references found and fixed

Eighty-eight student-visible filename references were removed: 46 Consumer Choice `CHOICE-xx.webp` stems and 42 Inequality `LORENZ-xx.webp` stems. All 152 graph-dependent questions across the four concepts now begin with the natural dependency signal `Refer to the graph above.` and no stem exposes `.webp`. Asset paths remain only in metadata; pixels, byte counts, hashes, and registrations are unchanged.

## 3. Capitalization fixes

The first alphabetic character was corrected in 196 stems: 52 Consumer Choice, 54 Inequality, and 90 Information/Behavioral/Political Economy. The shared finalizer now uppercases only the first alphabetic character, preserving leading HTML, notation, punctuation, and deliberate internal casing. Validators now enforce this invariant across all four banks.

## 4. Ambiguous comparison stems fixed

Directional Lorenz questions were rewritten so the baseline and comparison are explicit. In particular, IDs 42745, 42746, and 42760 now identify the before/after or named-economy comparison; ID 42753 also states the two shares being subtracted. Wording does not disclose values that the graph is intended to supply.

## 5. Percent versus percentage-point fixes

Four Inequality records—42745, 42746, 42753, and 42760—now use `percentage points` for subtraction between percentage shares. The targeted validator pins these IDs and checks the corrected terminology.

## 6. Approximate-reading fixes

Seventeen visually estimated Lorenz readings now use `approximately` or `about`: 42721, 42723, 42733, 42734, 42736, 42737, 42746, 42749, 42750, 42752, 42754, 42755, 42756, 42757, 42758, 42759, and 42760. Exact language remains only where the figure or stem makes precision defensible.

## 7. Trivial graph-transcription questions rewritten

Two Gini questions, 42740 and 42761, were changed from copying printed coefficients to interpreting what the lower coefficient and Lorenz-curve position mean. Across the four banks, 24 graph questions received material economic or clarity rewrites; the other graph changes standardized the reference surface without changing the task. Asset-level review preserved useful questions while expanding comparison, feasibility, purchasing-power, distribution, and interpretation angles.

## 8. Repeated answer and stem analysis

The reported answer `A high effective marginal tax rate can weaken work incentives` was keyed verbatim in 14 published records before this pass and in zero afterward. The repair diversified the economic angle and natural answer phrasing rather than changing correct economics. In total, 168 template-driven questions received substantive variety work: 70 Consumer Choice, 86 Inequality, and 12 Repair/Bridge records. A separate mechanical professor-voice cleanup removed artificial organization wrappers from 400 ordinary stems while preserving their underlying economics.

Exact visible stems remain unique. Substantive four-word opening peaks after stripping standard graph/case framing are 10 for Consumer Choice, 18 for Inequality, and 6 for Information/Behavioral/Political Economy. Standard technical answers remain repeated where the exact term is pedagogically necessary.

## 9. Repair and Bridge copy changes

All 12 Repair/Bridge records in the Information/Behavioral/Political Economy pool were rewritten to reduce synthetic context and cognitive noise. Consumer Choice opportunity-cost support now uses direct goods-and-prices language where a story adds nothing. Repair and Bridge remain aligned to the diagnosed primary skill, and authored stems do not duplicate the UI's `Concept Repair` label.

## 10. Runtime repetition findings

The observed repetition was primarily authored template concentration, not a selector defect. The runtime suppresses IDs seen in the previous ten selections and prevents a third consecutive same-tag choice when the eligible pool permits. It does not suppress normalized answer text. Five deterministic seeds were run for each single-concept scope and for the mixed four-concept scope (25 runs total): no ID repeated inside the recent window, tag streaks never exceeded two, and the mixed concept streak never exceeded three. Full-run ID reuse can occur after the recent window, especially in single-concept runs, and is intended. The maximum exact answer occurrence in any 12-question window was four across all simulations and two in the mixed runs.

## 11. Checkpoint architecture findings

A checkpoint first chooses one diagnosed objective and uses matching checkpoint records. If fewer than three matching records exist, remaining slots are filled from other checkpoint-eligible questions, preferring objective diversity. Consequently, a checkpoint can legitimately contain more than one selected concept.

Concept Repair is allowed to interrupt a checkpoint. The remediation state captures the checkpoint room, executes Repair, Bridge, and Recovery Retest, then restores the same room and resumes that checkpoint. The `Concept Repair` prefix is a runtime label, not author text. Deterministic simulations and browser gameplay reproduced this architecture, including cross-concept checkpoint questions and same-room resumption.

## 12. Whether checkpoint behavior required a code change

No. The manual behavior matches the current tested design, so no selector, adaptive, remediation, checkpoint, template, or timing code was changed. The 2,800 ms ordinary-feedback timing, remediation thresholds, recipe schema, difficulty routing, and pool rules remain intact.

## 13. Final validation

- Factor Markets focused validator: PASS, 1,067 checks.
- Remaining Principles Micro focused validator: PASS, 2,171 checks.
- Manual-audit validator: PASS, 241 checks, including 25 deterministic runs and 240 simulation assertions.
- Full active Composer suite: PASS, 22 of 22 runners.
- Published totals remain 9,271 questions, 133 concepts, and 486 assets.
- Current library SHA-256: `a14c7735a89a66466e2eb56d17b1204046dd3d0c0fa38547b933d09aac5a064e`.
- `git diff --check`: clean.

Regression coverage now includes realm placement, filename leakage, capitalization, graph-reference truthfulness, percentage-point pins, approximate-reading pins, IDs, answers, objectives, difficulty, pools, asset hashes, protected concept slices, quick starts, focused composition, checkpoint structure, repair resumption, and deterministic run-level variety.

## 14. Browser QA

- Composer: all four concepts displayed under Micro and none under Macro.
- Trial by Graph: Consumer Choice, Inequality, and Factors of Production all rendered natural graph references with no filenames and correct graph-dependent content.
- Mixed Standard Campaign: forced a pre-checkpoint miss, entered Repair, completed Bridge and Recovery Retest, returned to the same Checkpoint One room, cleared Checkpoint One, and reached Checkpoint Two. Cross-concept checkpoint selection matched the documented architecture.
- Regenerated mixed build: question copy remained natural after the final author-source cleanup.
- Unlimited Practice: a scored attempt generated a correct Mastery Report with 100% accuracy, `Limited Evidence`, a 1/1 count, concept/form/skill signals, behavior signals, next moves, and report controls.
- Browser console: no errors.

## 15. Exact files changed

Authoritative sources and grouping:

- `build/faculty-build-composer/authoring/consumer_choice_question_pool_author.mjs`
- `build/faculty-build-composer/authoring/factor_markets_question_pool_author.mjs`
- `build/faculty-build-composer/authoring/income_inequality_question_pool_author.mjs`
- `build/faculty-build-composer/authoring/information_behavioral_political_economy_question_pool_author.mjs`
- `build/faculty-build-composer/authoring/remaining_micro_question_pool_helpers.mjs`
- `build/faculty-build-composer/course-area-model.js`

Deterministically regenerated publisher outputs:

- `build/faculty-build-composer/data/composer_library.js`
- `build/faculty-build-composer/data/composer_library_manifest.json`
- `build/faculty-build-composer/data/composer_registry.json`

Validation and generated QA artifacts:

- `build/faculty-build-composer/tests/run_active_composer_suite.js`
- `build/faculty-build-composer/tests/run_factor_markets_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/run_remaining_principles_micro_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/run_remaining_micro_manual_audit_validation.mjs`
- `build/faculty-build-composer/tests/factor-markets-production-sample.html`
- `build/faculty-build-composer/tests/consumer-choice-production-sample.html`
- `build/faculty-build-composer/tests/income-inequality-production-sample.html`
- `build/faculty-build-composer/tests/information-behavioral-political-production-sample.html`
- `build/faculty-build-composer/tests/remaining-micro-manual-audit-production-sample.html`
- `REMAINING-MICRO-MANUAL-AUDIT-REPORT.md`

## 16. Unresolved issues

No release-blocking issues remain. Two intended characteristics are worth retaining in faculty expectations: single-concept 27-question simulations naturally have a concept streak of 27, and an ID may recur after it leaves the ten-question recent-history window. The runtime has no normalized-answer-text suppression; current authored variety and mixed-run results do not demonstrate a need to add it.

No commit was created.
