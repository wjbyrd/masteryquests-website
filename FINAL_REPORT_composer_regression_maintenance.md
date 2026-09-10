# Composer Regression Maintenance — Final Report

Date: 2026-09-10

## Executive Summary

**Baseline: 19/27 PASS. Final: 27/27 PASS. Eight stale tests repaired. One additional real metadata-synchronization defect discovered and repaired. Verdict: PASS WITH NOTES.**

The eight known runners were the only functional baseline failures. Four contained obsolete global count sentinels; two relied on obsolete snapshots; two encoded superseded audit/migration semantics. All were run individually after repair, followed by the unchanged 27-runner active suite. A separate mutation verifier passed **18 negative checks** and does not change the active denominator.

Production changes are limited to **composer_library_manifest.json**: 40 stale accessibility fields across 27 asset registrations now match the independently audited canonical inventory. The question library, registry, graph bytes, engine, template, LO definitions, resources, telemetry, presets, published games, Worker/D1 and public documentation are unchanged. Byte comparisons cover all 4727 initially tracked files; only the eight requested runners and that manifest changed. Two test helpers, one standalone negative verifier, evidence and this report were added.

Baseline and final logs are under `validation_artifacts/composer_regression_maintenance/`. The initial Git status was clean. A recapture under the sandbox account produced two **environmental Git dubious-ownership errors**, in the official-theme and checkpoint-remediation runners. Per-process trust scoped to this repository resolved both without code changes. The corrected pre-edit baseline reproduced exactly the expected eight failures. Both raw captures are retained; these environment errors were not classified as stale tests.

## Failure-by-Failure Analysis

Original line numbers refer to the clean baseline. Exact messages and assertion expressions are retained in `baseline-suite.stdout.log`, `baseline-suite.stderr.log`, and `scope-and-integrity.json`.

| Runner | Original failure | Exactly one classification | Canonical source, cause, and repair |
|---|---|---|---|
| run_phase3e_graph_question_sync_validation.mjs | Lines 111–112: Canonical/Manifest count 9779 against 9539; lines 128/138: 13 copy and 8 answer-hash differences | **C — OBSOLETE FIXTURE / SNAPSHOT** | Market Gate author records plus QH5/QH6/human-read ledgers predate committed Foundations Sep 6, Demand/Supply Sep 6, and Market Policy Sep 7 assessment changes. Replay authorized after-fields with before-state checks where a historical full record exists; keep author mapping, skill, difficulty, accessibility, exact answer and asset checks. Inventory assertions use independent artifact agreement. |
| run_question_quality_auditor_validation.mjs | Line 50: Stale source hash on 40010; later unreachable assertions also froze old review totals and historical publication hashes | **B — STALE TEST SEMANTICS** | Current canonical text is intentionally edited in the live library while original source provenance is preserved. Verify the historical hash against its historical payload, occurrences, and current content against authorized audit records. Check exact reviewed findings and dispositions instead of declaring all heuristic signals defects. Recompute the current semantic library checksum independently. |
| run_macro_phase2_taxonomy_validation.mjs | Line 109: Global synchronized totals, actual 149/9779 versus 143/9539; later checks required a machine-local pre-migration content fingerprint and seven missing review resources | **B — STALE TEST SEMANTICS** | Current library, navigation model, checked-in Phase 1 question inventory, approved taxonomy assignments, Phase 2 family membership, open-economy author/manifest and current review routes. Preserve exact original IDs, assignments, counts, aliases and hidden supplement. Replace the completed migration's content freeze/resource gaps with current structural and review-routing contracts. |
| run_mastery_report_2_validation.js | Line 47: canonical 9779 versus 9539 | **A — STALE HARD-CODED EXPECTATION** | Only the global inventory sentinel failed. Replace it with independent corpus/registry/manifest/hash/asset checks; retain every report behavior assertion. |
| run_unlimited_practice_validation.js | Line 77: canonical question count changed to 9779 | **A — STALE HARD-CODED EXPECTATION** | Only the 9539 sentinel failed. Same inventory repair; all mode requirements, generated output, VM simulations and difficulty assertions retained. |
| run_trial_by_graph_validation.js | Lines 84/123/124: canonical count 9779, graphRequired count 1077, flags outside audited set 22 | **C — OBSOLETE FIXTURE / SNAPSHOT** | Legacy membership fixtures omitted the later open-economy expansion. Add the exact 22 authored graph IDs, independently corroborate the open-economy manifest totals and current membership, retain historical audited sets and all runtime eligibility assertions. |
| run_fading_fortune_validation.js | Line 34: canonical count 9779 versus 9539 | **A — STALE HARD-CODED EXPECTATION** | Only the global sentinel failed. Independent inventory repair; deck, eligibility, interval, scoring/decay, pause and completion checks retained. |
| run_risk_reward_validation.js | Line 28: canonical count 9779 versus 9539 | **A — STALE HARD-CODED EXPECTATION** | Only the global sentinel failed. Independent inventory repair; wager, bankroll, deck, reveal, settlement and completion assertions retained. |

The additional **D — REAL PRODUCTION DEFECT** is separate from those eight classifications. The new integrity check found stale manifest accessibility copies. Publisher implementations explicitly establish `manifest.assets = library.assetInventory`, including `audit_tools/macro_open_economy/publish_macro_open_economy.mjs:205` and `audit_tools/apply_graph_assessment_integrity_remediation.mjs:204`. All 27 replacements were independently compared with committed Sep 6/Sep 7 `asset-accessibility-changes.json` after-states before writing. This is a synchronization correction, not invented wording or a question repair. `manifest-sync-proof.json` contains every before/after value. The new exact manifest-asset comparison and its stale-description mutation specifically cover this defect.

## Graph Sync

The current corpus has **1,077 unique graphRequired questions**, **507 concept asset registrations**, and **502 distinct runtime paths**. Shared physical graph registrations are intentional. Every graph-marked record resolves to a registered asset, every registered file is read and checked against SHA-256/size, and concept file identity agrees with the inventory. Contextual module descriptions are not assumed to be identical across all representations; the focused graph test checks its actual audited wording. Manifest asset records must exactly mirror the canonical global inventory, as the publishers specify.

The 48-question Market Gate cohort remains exact and unique, with its original 7 Medium / 16 Hard / 20 Elite / 5 Legendary distribution, concept mappings, objectives and skills. Existing asset-byte equality to Market Gate, 21 phase registrations, 11 cleaned graph checks, generated embedding, syntax and ten-mode readiness assertions remain. Audited options are additionally compared exactly when the ledger supplies them.

Copy changes were already authorized for **40005, 40010, 40014, 40016, 40017, 40029, 40033, 40036, 40039, 40040, 40041, 40045, 40046**. Changed answer hashes affected **40005, 40010, 40014, 40016, 40017, 40029, 40041, 40046**. No graph question was reverted. Quantity-theory and other current graph assets retain their bytes; the complete asset checksum pass includes them.

Trial by Graph retains its audited base of 1,055 and adds the 22 independently authored open-economy graphs. Exact expansion ID membership, graph presence and original deck checks protect against both omissions and accidental additions. Existing tests still reject invalid/missing embedded graphs and non-graph questions in generated decks.

## Question Quality Hash

Question **40010** is currently the audited movie-ticket/streaming-subscription substitute scenario. Its stored source hash is:

`7b430a9da5ee7224cc86b9ae78d27cc7fc66e248db89418eccbc8d8d5de776ba`

Hashing the current eight-field payload produces:

`fa53f1c50fe86c444f6ac9df153f9ef436d0aa532c5d84fbb8c24537d6777bfb`

The first value correctly identifies the QH6 historical source payload, before the Sep 6 rewrite. The Sep 6 Demand/Supply report explicitly preserves “original source provenance”; the Foundations report likewise states that historical provenance hashes remain historical. The current runtime loads `data/composer_library.js`; source-occurrence filenames describe origin and are not an alternate live upstream bank requiring a reverse rewrite.

The repaired test validates historical payload → preserved sourceHash → occurrences, then validates authorized current text/options/feedback/key. For the early 13-fix ledger's partial records, unchanged fields are reconstructed and still checked against the independently stored source digest; later before-fields restore the actual historical content. Full QH5/QH6/human-read snapshots are compared as full records through the later recorded changes. Every tested answer key must resolve to exactly one option.

The current library semantic digest remains **530ce41689bf83126ccde2d7d0fd236ca0c34761042455323ce7d3f99e97bbab**, independently recomputed and matched across library, registry and manifest. The historical human-read publication digest is no longer compared to a later global publication.

The target 240-question Demand/Supply/Equilibrium scope has **0 errors, 1 warning, 9 reviews**; the 563-question Foundations scope has **0 errors, 0 warnings, 64 reviews**. Exact question/rule/severity membership, recorded wording, and a nonempty disposition are required. New findings fail. The graph warning for **PG1-SUP-L-003** is explicitly documented as a heuristic false positive: the graph contains the required S1 point, and supplying its final price in the stem would reveal the answer. All original synthetic auditor classification/graph-contract tests remain. This is not a claim that all retained heuristic limitations have been eliminated.

## Taxonomy / Counts

Global canonical integrity is **149 concepts / 9,779 unique questions**. Repeated pool aliases are deduplicated by canonical ID; derived views are not counted as copied physical questions. Library and manifest counts must equal independently enumerated records, registry IDs must equal concept keys, registries must agree exactly, and semantic checksums must agree.

The current taxonomy runner checks:

- The original ten Macro families: **51 children, 2,758 ordinary questions**.
- The hidden, non-card supplement: **112 questions**, disjoint from ordinary content.
- Original Macro total **2,870**, with **1,778 practice / 620 checkpoint / 360 adaptive / 112 supplemental** records; exact membership against the checked-in Phase 1 inventory.
- Approved per-family child IDs/counts, 14 migrated child counts, **553 migration assignments**, the three explicit SRAS ambiguity resolutions, and the approved boundary override.
- All six retired parent IDs absent from current cards and exact legacy recipe expansion into their replacement children.
- Six open-economy children with **240 authored questions**, each independently matched by ID to the author module and manifest.
- The **22 intentionally shared General Economics concepts** and all **79 current Macro navigation selections**, with no duplicate navigation IDs.
- Current review sheets and error-free review routing for all 14 migrated children; valid answer keys and all ten mode readiness checks for the combined original Macro scope.

Selectable does not mean every single concept supports every mode alone. For example, Competitive Markets correctly reports Quiz pool shortages of four versus five Easy/Medium/Hard questions. The runner requires nonempty resolved selection and rejects unknown IDs without hiding existing mode readiness limits.

Historical Macro image/graph/calculation counts currently still measure **327 / 174 / 326**, but “153 unflagged graphs must remain deferred” is no longer a product requirement. The current graph assets and eligibility tests replace that migration-era deferral assertion. Historical reports are never overwritten by the current runner. The former external TEMP fingerprint dependency is gone.

Deliberate integrity sentinels remain for approved taxonomy partitions, expansion membership, mode thresholds, and the current release inventory in the standalone verification. Global totals are not duplicated across all mode runners.

## Mode Tests

Inventory checks are now separate from behavior checks. The only changes to Unlimited Practice, Fading Fortune and Risk & Reward are an integrity-helper import and replacement of their old global count assertion.

- **Unlimited Practice:** preflight pool requirements, generated configuration/UI, repeating 30-room cycle controls, Easy/Medium/Hard boundaries, absence of bosses, manual-end VM simulations, report destination and telemetry, and practice-control visibility remain tested.
- **Trial by Graph:** supported 10/15/20 targets, unique ordered decks, minimum eligibility, no non-graph leakage, unsupported concepts, mode configuration, embedding and missing-asset rejection remain tested. A child-process mutation disabling the actual runtime eligibility filter is caught by the retained non-graph deck assertion.
- **Fading Fortune:** eligible four-choice pools, unique decks, limited/zero-inventory boundaries, exact timing intervals, decay floor, protection of the correct answer, pause/freeze hooks and completion/report integration remain tested.
- **Risk & Reward:** eligible decks and pool thresholds, initial bankroll, wager ratios, reveal hooks, settlement guard, all-in loss and completion/report integration remain tested. The unchanged risk/reward state and visibility-aware telemetry runners supply complementary runtime timing/state coverage.

The preserved tests combine Node/VM behavior checks and generated-source assertions. This maintenance run does not claim a new manual browser playthrough of every mode.

## Mastery Report

Every existing report assertion remains. The runner still checks evidence strength at limited/developing/mastery thresholds, low-accuracy strong evidence, concept diagnosis, question-type handling, recommendations, attempt evidence and report isolation/completion integration. Only the stale 9,539 sentinel was replaced. The separate unchanged Concept Review and report state-leak runners also pass. See the complete per-runner log for exact evidence cases.

## Brittleness Improvements

1. A small shared integrity helper independently enumerates stored records and checks canonical artifact agreement, semantic hashes and actual asset bytes.
2. A focused audit helper reuses existing committed ledgers and exact dispositions; no new duplicated question fixture was created.
3. The Macro runner tests current structure and committed ID membership instead of a machine-local historical content fingerprint or unfinished resource status.
4. Open-economy graph membership comes from independent authoring evidence and its manifest; existing behavioral and legacy-audit contracts remain.
5. Current taxonomy output uses the existing test-artifact helper rather than rewriting the historical Phase 2 execution report.

No active-suite membership or unrelated passing test was changed.

## Negative Validation

`node build/faculty-build-composer/tests/verify_composer_regression_contracts.cjs` passed **18/18** checks:

- wrong canonical question count: rejected as expected.
- missing registry concept: rejected as expected.
- mismatched manifest hash: rejected as expected.
- stale manifest accessibility copy: rejected as expected.
- graph question with missing asset: rejected as expected.
- corrupt asset bytes: rejected as expected.
- incorrect preserved source hash: rejected as expected.
- unauthorized graph copy: rejected as expected.
- new unreviewed auditor finding: rejected as expected.
- run_phase3e_graph_question_sync_validation.mjs: count: rejected as expected.
- run_question_quality_auditor_validation.mjs: count: rejected as expected.
- run_macro_phase2_taxonomy_validation.mjs: count: rejected as expected.
- run_mastery_report_2_validation.js: count: rejected as expected.
- run_unlimited_practice_validation.js: count: rejected as expected.
- run_trial_by_graph_validation.js: count: rejected as expected.
- run_fading_fortune_validation.js: count: rejected as expected.
- run_risk_reward_validation.js: count: rejected as expected.
- run_trial_by_graph_validation.js: mode: rejected as expected.

Mutations use object clones or in-memory child-process reads. No production file is temporarily modified. Child failures must match the intended assertion, not merely exit nonzero. Scratch paths are constrained to the temporary root and cleaned. The stale accessibility-copy negative test specifically protects the one production synchronization correction.

## Final Suite Results

Command: `node build/faculty-build-composer/tests/run_active_composer_suite.js` from the repository root, with per-process `safe.directory` scoped to this repository for sandbox Git operations. A capture hook records successful child stdout/stderr without altering tests or their results.

```text
PASS run_faculty_outcome_validation.js
PASS run_content_scope_validation.js
PASS run_default_character_set_validation.js
PASS run_exam_navigation_boss_reveal_validation.js
PASS run_checkpoint_artifact_exam_integrity_validation.js
PASS run_guide_intro_validation.js
PASS run_phase1_targeted_repair_validation.js
PASS run_phase15_production_hardening_validation.js
PASS run_visibility_aware_telemetry_validation.js
PASS run_generated_telemetry_smoke.js
PASS run_phase3a_official_theme_validation.js
PASS run_phase3b_custom_asset_validation.js
PASS run_phase3e_graph_question_sync_validation.mjs
PASS run_question_quality_auditor_validation.mjs
PASS run_macro_phase2_taxonomy_validation.mjs
PASS run_checkpoint_remediation_design_change_validation.mjs
PASS run_concept_review_integration.js
PASS run_mastery_report_concept_reviews.js
PASS run_mastery_report_2_validation.js
PASS run_mastery_report_state_leak_hotfix.js
PASS run_mode_availability_fix.js
PASS run_quiz_mode_validation.js
PASS run_unlimited_practice_validation.js
PASS run_trial_by_graph_validation.js
PASS run_fading_fortune_validation.js
PASS run_risk_reward_validation.js
PASS run_risk_reward_state_validation.js
{
  "ok": true,
  "total": 27,
  "passed": 27,
  "failed": []
}
```

The faculty outcome runner independently reports **193,775 assertions**, **536 combinations**, **149 concepts**, **222 outcomes**, **13 presets**, and **10 modes**. Concept Review routing, generated JavaScript compilation, generated telemetry smoke, exam/checkpoint integrity, visibility handling and report/mode state checks all pass. Asset bytes and the current release inventory additionally pass the independent standalone verification. Final diff check has no whitespace errors.

## Files Changed

All paths below are repository-relative and exact.

### Test code

- build/faculty-build-composer/tests/run_phase3e_graph_question_sync_validation.mjs
- build/faculty-build-composer/tests/run_question_quality_auditor_validation.mjs
- build/faculty-build-composer/tests/run_macro_phase2_taxonomy_validation.mjs
- build/faculty-build-composer/tests/run_mastery_report_2_validation.js
- build/faculty-build-composer/tests/run_unlimited_practice_validation.js
- build/faculty-build-composer/tests/run_trial_by_graph_validation.js
- build/faculty-build-composer/tests/run_fading_fortune_validation.js
- build/faculty-build-composer/tests/run_risk_reward_validation.js
- build/faculty-build-composer/tests/verify_composer_regression_contracts.cjs (new standalone negative verification; active denominator stays 27)

### Helpers

- build/faculty-build-composer/tests/composer-integrity-contracts.js
- build/faculty-build-composer/tests/composer-audit-contracts.js

### Fixtures

None added or modified. Existing historical and assessment audit records are consumed as independent evidence.

### Production files

- build/faculty-build-composer/data/composer_library_manifest.json — 40 accessibility fields in 27 asset records synchronized to audited canonical metadata; no bytes, paths, IDs, counts, hashes or versions changed.

### Report

- FINAL_REPORT_composer_regression_maintenance.md

### Validation artifacts

- validation_artifacts/composer_regression_maintenance/baseline-git-status.txt
- validation_artifacts/composer_regression_maintenance/baseline-suite.stderr.log
- validation_artifacts/composer_regression_maintenance/baseline-suite.stdout.log
- validation_artifacts/composer_regression_maintenance/baseline-tracked-sha256.json
- validation_artifacts/composer_regression_maintenance/classification-before-edits.md
- validation_artifacts/composer_regression_maintenance/demand-current-quality.json
- validation_artifacts/composer_regression_maintenance/final-diff-check.txt
- validation_artifacts/composer_regression_maintenance/final-git-status.txt
- validation_artifacts/composer_regression_maintenance/final-suite.stderr.log
- validation_artifacts/composer_regression_maintenance/final-suite.stdout.log
- validation_artifacts/composer_regression_maintenance/manifest-sync-proof.json
- validation_artifacts/composer_regression_maintenance/run_checkpoint_artifact_exam_integrity_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_checkpoint_remediation_design_change_validation.mjs.log
- validation_artifacts/composer_regression_maintenance/run_concept_review_integration.js.log
- validation_artifacts/composer_regression_maintenance/run_content_scope_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_default_character_set_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_exam_navigation_boss_reveal_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_faculty_outcome_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_fading_fortune_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_generated_telemetry_smoke.js.log
- validation_artifacts/composer_regression_maintenance/run_guide_intro_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_macro_phase2_taxonomy_validation.mjs.log
- validation_artifacts/composer_regression_maintenance/run_mastery_report_2_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_mastery_report_concept_reviews.js.log
- validation_artifacts/composer_regression_maintenance/run_mastery_report_state_leak_hotfix.js.log
- validation_artifacts/composer_regression_maintenance/run_mode_availability_fix.js.log
- validation_artifacts/composer_regression_maintenance/run_phase15_production_hardening_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_phase1_targeted_repair_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_phase3a_official_theme_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_phase3b_custom_asset_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_phase3e_graph_question_sync_validation.mjs.log
- validation_artifacts/composer_regression_maintenance/run_question_quality_auditor_validation.mjs.log
- validation_artifacts/composer_regression_maintenance/run_quiz_mode_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_risk_reward_state_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_risk_reward_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_trial_by_graph_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_unlimited_practice_validation.js.log
- validation_artifacts/composer_regression_maintenance/run_visibility_aware_telemetry_validation.js.log
- validation_artifacts/composer_regression_maintenance/sandbox-ownership.stderr.log
- validation_artifacts/composer_regression_maintenance/sandbox-ownership.stdout.log
- validation_artifacts/composer_regression_maintenance/scarcity-and-tradeoffs-current-quality.json
- validation_artifacts/composer_regression_maintenance/scope-and-integrity.json
- validation_artifacts/composer_regression_maintenance/verify_composer_regression_contracts.cjs.log

## Remaining Issues

No failing active Composer regression remains. The historical quality dispositions described above remain explicit, exact accepted findings, not newly discovered production defects or unreviewed exceptions. Some individually selectable concepts intentionally have insufficient pools for certain modes; their readiness messages are preserved. Git trust configuration is an execution-environment prerequisite only under the separate sandbox account.

The sole additional production integrity defect discovered here is repaired and covered by a failing mutation. Of 4727 pre-existing tracked files, **4718 remain byte-identical**; the nine changed files are exactly the eight requested runners plus the manifest. Question/graph content and all protected systems remain unchanged.

No commit, push or deployment was performed.

## Final Verdict

**PASS WITH NOTES** — 27/27 active runners pass, all eight stale failures are reconciled, 18 negative checks demonstrate failure detection, and the independently proven manifest metadata defect is fixed. Notes concern already documented heuristic findings and intentional mode readiness limits, not unresolved regression failures.
