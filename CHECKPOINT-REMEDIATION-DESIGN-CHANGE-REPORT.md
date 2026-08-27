# Checkpoint Remediation Design Change Report

Date: 2026-08-27  
Status: implemented and validated; no commit created

## Old behavior

A remediation-triggering miss inside a checkpoint could immediately replace the checkpoint question with Concept Repair. The runtime saved the checkpoint room, ran Repair → Bridge → Recovery Retest, restored the saved room, and resumed the checkpoint. A checkpoint miss that did not launch remediation would otherwise fall through to ordinary setback handling.

## New behavior

Checkpoint encounters are uninterrupted three-question assessments. Correct and incorrect responses are all scored, logged, and added to adaptive/Mastery Report evidence. Each scored response advances the checkpoint sequence. Repair, Bridge, and Recovery Retest cannot begin until the checkpoint has fully resolved.

After the checkpoint summary, play advances to the post-checkpoint room. Existing remediation eligibility then resumes through the ordinary response path. If remediation later launches, its return room is the post-checkpoint room; it cannot reopen the completed checkpoint.

## Root decision and implementation point

The shared transition helper `remediationTransitionAllowed(question)` now rejects an active checkpoint as identified by the canonical `isBossRoomForMode(room)` state. `planRemediation` independently refuses checkpoint entry as a defensive invariant. The single staged-remediation trigger calls this helper.

The answer path records adaptive evidence and question telemetry before routing. On a checkpoint response, `advanceCheckpointAttempt()` consumes one of the three selected questions. A miss returns immediately to the next checkpoint question or `completeCheckpointEncounter()`; it never reaches active-remediation, remediation-trigger, or ordinary setback branches.

## Protected behavior

- Checkpoint objective selection, three-slot construction, and cross-concept fallback are unchanged; the validator compares `buildBossQuestionSet` byte-for-byte with `HEAD`.
- Remediation thresholds and Repair/Bridge/Retest content are unchanged.
- Question banks, IDs, assets, taxonomy, Micro/Macro placement, difficulty pools, mode floors, recipe schema, Mastery Report scoring definitions, and 2,800 ms feedback timing are unchanged.
- Ordinary-room remediation remains Repair → Bridge → Recovery Retest → origin room.
- Quiz, Trial by Graph, Fading Fortune, and Risk & Reward continue to exclude remediation at the same shared gate.

## Return-room state

Generic `returnRoom`, `detourReturnRoom`, and remediation history infrastructure was retained. Ordinary-room remediation and compatible saved-run behavior still use it. The checkpoint guard prevents new checkpoint-caused remediation state from being created, so a deferred Repair starts and returns after the cleared checkpoint.

## Tests and simulation

`run_checkpoint_remediation_design_change_validation.mjs` passes 28 checks. It covers:

- an eligible ordinary miss still launching Repair;
- one, two, and final-question checkpoint misses without mid-checkpoint remediation;
- delivery of all three checkpoint questions;
- preserved miss/evidence records and Mastery Report inputs;
- correct checkpoint performance without remediation;
- post-checkpoint remediation using the unchanged thresholds;
- no reopening of a completed checkpoint;
- unchanged ordinary Repair → Bridge → Recovery Retest behavior;
- unchanged checkpoint selection and remediation thresholds.

The updated manual-audit validator passes 268 checks. Across 25 deterministic runs, each simulated checkpoint delivered three questions with two retained misses, no in-checkpoint remediation, normal completion, and post-checkpoint repair resumption from Room 11. The original question-variety and selection measurements remain intact.

## Browser QA

The regenerated four-concept Standard build was exercised from Room 1. Ordinary weakness evidence was created before Checkpoint One. At Checkpoint One, Q1 and Q2 were intentionally answered incorrectly:

- Q2 appeared after the Q1 miss, not Concept Repair.
- Q3 appeared after the Q2 miss, not Concept Repair.
- The third response resolved `CHECKPOINT ONE COMPLETE`.
- The continue action entered Room 11 exactly once.
- No duplicate or stale checkpoint state appeared.

The checkpoint UI, graph rendering, feedback, artifact summary, and room progression remained intact. The browser console reported no errors.

## Mastery Report verification

Checkpoint responses still pass through `recordAdaptiveAttempt` and question telemetry before the checkpoint-only transition suppression. The regression validator confirms two checkpoint misses produce three attempts, two misses, 1/3 accuracy, and the affected objective in report inputs. Browser QA separately generated a Mastery Report after a deliberate miss and confirmed 0% accuracy, 0/1 correct, one foundational attempt, one fast miss, evidence labeling, and normal report controls.

## Validation results

- Checkpoint-remediation validator: PASS, 28 checks.
- Remaining-Micro manual audit: PASS, 268 checks and 25 deterministic runs.
- Factor Markets validator: PASS, 1,067 checks.
- Remaining Principles Micro validator: PASS, 2,171 checks.
- Quiz, Trial by Graph, Fading Fortune, and Risk & Reward focused validators: PASS.
- Active Composer suite: PASS, 23/23 runners.
- `git diff --check`: clean.

## Files changed for this design change

- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`
- `build/faculty-build-composer/CHECKPOINT-REMEDIATION-DESIGN-NOTE.md`
- `build/faculty-build-composer/tests/run_checkpoint_remediation_design_change_validation.mjs`
- `build/faculty-build-composer/tests/run_remaining_micro_manual_audit_validation.mjs`
- `build/faculty-build-composer/tests/run_active_composer_suite.js`
- `build/faculty-build-composer/tests/run_quiz_mode_validation.js`
- `build/faculty-build-composer/tests/run_trial_by_graph_validation.js`
- `build/faculty-build-composer/tests/run_fading_fortune_validation.js`
- `build/faculty-build-composer/tests/run_risk_reward_validation.js`
- `build/faculty-build-composer/tests/factor-markets-production-sample.html`
- `build/faculty-build-composer/tests/consumer-choice-production-sample.html`
- `build/faculty-build-composer/tests/income-inequality-production-sample.html`
- `build/faculty-build-composer/tests/information-behavioral-political-production-sample.html`
- `build/faculty-build-composer/tests/remaining-micro-manual-audit-production-sample.html`
- `build/faculty-build-composer/tests/quiz-only.html`
- `build/faculty-build-composer/tests/trial-by-graph-only.html`
- `build/faculty-build-composer/quiz_mode_validation_results.json`
- `build/faculty-build-composer/trial_by_graph_validation_results_4.5s.2m.json`
- `build/faculty-build-composer/fading_fortune_validation_results_4.5s.2m.json`
- `build/faculty-build-composer/risk_reward_validation_results_4.5s.2m.json`
- `REMAINING-MICRO-MANUAL-AUDIT-REPORT.md`
- `CHECKPOINT-REMEDIATION-DESIGN-CHANGE-REPORT.md`

## Unresolved issues

No release-blocking issues remain. Remediation is not forced immediately after checkpoint completion; this preserves the existing architecture, which reevaluates the unchanged trigger criteria on a subsequent eligible ordinary response. Checkpoint evidence remains available to adaptive selection and reporting in the interim.
