# Standard Campaign boss checkpoint regression

Branch: `accessibility-preview`

Investigation baseline: `a4b247fd`

Pre-accessibility baseline: `5e1d5644`

Date: 2026-10-22

## Finding and required behavior

The reported progression was reproduced. It predates accessibility and is present in the game currently served by production. Answer verification and correct-answer counts were accurate; the checkpoint completion path awarded rewards and advanced independently of those counts.

The owner clarified during this investigation: **any wrong Standard Campaign boss answer must immediately send the player back.** The fix restores that rule. Standard requires three correct boss answers in the same attempt. A miss at Room 10, 20, or 30 returns to Room 7, 17, or 27, bounded by the last successfully cleared checkpoint. No artifact, boss-clear achievement, or victory is awarded for a failed attempt.

Other modes retain their existing checkpoint assessment rules. Ordinary adaptive selection, answer verification, scoring, mastery calculations, question banks, and timing constants are unchanged.

## Reproduction and comparison

The browser tests use actual game HTML, real question banks, the real answer verifier, and native answer buttons. Random selection is seeded with `16427`; the browser clock is controlled and answers are paced at 6.5 seconds to avoid changing rapid-guess behavior. All outbound game requests are blocked. Production comparison uses read-only downloads of the public Market Gate HTML and its two script dependencies, replayed locally.

The production HTML, normalized for line endings, exactly matches `5e1d5644`. Both production dependencies match that baseline and the working branch. Hashes and function comparisons are in `validation_artifacts/boss_checkpoint_regression/source-audit.json`.

Natural Room 1–10 runs selected boss questions **2014, 2012, 2013** in all three versions: pre-accessibility, production, and the original preview. Wrong → wrong → correct, correct → wrong → wrong, and wrong → correct → wrong each produced a correctly counted 1/3 result, the “not secured” summary, an artifact, and Room 11.

| Three-answer pattern | Before this fix | Restored Standard behavior |
|---|---|---|
| Wrong, wrong, wrong | 0/3; not secured; reward and advance | First wrong answer ends the attempt; setback |
| Wrong, wrong, correct | 1/3; not secured; reward and advance | First wrong answer ends the attempt; setback |
| Wrong, correct, wrong | 1/3; not secured; reward and advance | First wrong answer ends the attempt; setback |
| Correct, wrong, wrong | 1/3; not secured; reward and advance | Second answer ends the attempt; setback |
| Wrong, correct, correct | 2/3; cleared; reward and advance | First wrong answer ends the attempt; setback |
| Correct, wrong, correct | 2/3; cleared; reward and advance | Second answer ends the attempt; setback |
| Correct, correct, wrong | 2/3; cleared; reward and advance | Third answer ends the attempt; setback |
| Correct, correct, correct | 3/3; secured; reward and advance | Secured; one reward and one continuation |

After restoration, the unused suffix of a failed sequence is intentionally never delivered in that boss attempt. The player must traverse the setback rooms and retry the checkpoint.

## History and root cause

1. The original hit-based boss implementation reduced health only for correct answers. Its fallback sent a boss miss back three rooms, subject to the previous checkpoint floor. Legacy remediation could intercept some misses before that fallback.
2. `c0c8fea5` (2026-08-27, “Resolved checkpoint issues”) deliberately changed the Composer engine into uninterrupted three-response assessments. Both correct and incorrect answers called `advanceCheckpointAttempt()`. Every completed assessment called `completeCheckpointEncounter()`.
3. `4ab5974d` (2026-08-30, “Updated artifacts and bosses”) added the 3/3 “secured,” 2/3 “cleared,” and 0–1/3 “not secured” classifications. These labels did not gate rewards or progression.
4. Economic Realm imported the shared engine in `f98cbdf5` on 2026-10-11. Macro Command imported it in `70a01460` on the same date. Both precede the October 22 accessibility work.

Before this fix, `recordCheckpointAttempt()` counted correctly and `finalizeCheckpointOutcome()` classified correctly under the assessment design. `completeCheckpointEncounter()` then unconditionally recorded a boss defeat, awarded an artifact, and called `showKnowledgeRoom()`. That summary raised the checkpoint floor and offered forward progression for every outcome. The wrong-answer checkpoint branch returned before the ordinary setback branch.

The new feedback hallway helper and recovery Continue callbacks did not cause this behavior. The relevant completion and summary functions matched production and the pre-accessibility baseline exactly. Natural pre-boss hallway tests also preserved the same selected questions and counts.

A separate pre-existing defect was reproduced: invoking the checkpoint-summary Continue handler twice moved Room 10 to Room 12 in all three versions. That handler lacked a one-shot guard.

## Fix

- Standard boss misses now immediately finalize the failed attempt and use the original three-room setback. Standard 2/3 is no longer labeled “cleared.” The other modes' classifications remain unchanged.
- The completion function independently refuses to award Standard rewards unless the attempt is secured. The successful three-answer path is unchanged.
- Failure clears the active encounter and boss pool, resets health, cancels pending feedback continuation, and permits a fresh retry. Previously recorded answer and mastery evidence remains intact.
- A resumed, unfinished assessment-era Standard save containing a boss miss receives the setback without adding an answer or changing its correct-answer count. Existing completed checkpoint floors and earned inventories are not retroactively revoked.
- Checkpoint-summary and new failure Continue handlers reject repeated or stale activation. An old summary callback cannot override a later failed attempt.
- Independent legacy engines keep their existing hit-based boss evaluation. A narrow Standard-only guard prevents a new remediation detour from intercepting the boss setback; ordinary remediation eligibility and thresholds are unchanged.

## Authoritative sources and propagated files

The main implementation is in:

- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`
- `audit_tools/accessibility_cleanup/legacy.mjs` — narrow propagation to independent release snapshots; no whole-engine replacement
- `build/faculty-build-composer/CHECKPOINT-REMEDIATION-DESIGN-NOTE.md`

The changed runtime is propagated to these maintained HTML files:

- `play/economic-realm/{market-gate,national-ledger,equilibrium-crisis,liquidity-grid,stabilization-protocol}/index.html`
- `play/macro-command-system/{national-engine,mint-ash-gold,command-nexus,exchange-citadel}/index.html`
- `play/managerial-intelligence-directorate/{cost-directive,market-signal,strategy-desk,agency-protocol}/index.html`
- `play/managerial-directorate-classroom/{cost-directive,market-signal,strategy-desk,agency-protocol}/index.html`
- `play/managerial-directorate-telemetry-poc/{cost-directive,market-signal,strategy-desk,agency-protocol}/index.html`
- `play/micro-domains/labyrinth-of-choice/index.html`
- `beta-testing/composer-telemetry-live-test/index.html`
- `downloads/resources/mastery-quests-faculty-starter.html`
- `downloads/resources/mastery-quests-faculty-template.html`

Faculty-generated games inherit the authoritative template. A fresh generated game was exercised in the browser. The published manual templates received only the checkpoint change, preserving their independent selection and validation code.

Permanent tests and audit tools:

- `build/faculty-build-composer/tests/run_standard_boss_progression_validation.mjs` — registered in `run_active_composer_suite.js`
- `audit_tools/accessibility_cleanup/boss-checkpoint-regression.mjs`
- `audit_tools/accessibility_cleanup/boss-checkpoint-resume-retry.mjs`
- `audit_tools/accessibility_cleanup/boss-checkpoint-source-audit.mjs`
- `audit_tools/accessibility_cleanup/boss-checkpoint-protected.mjs`

Existing checkpoint classification, remediation-design, and Legendary completion tests were updated for the Standard-only rule and callback context. The mastery-report state-leak test now recognizes a valid block container with accessibility attributes; no question-container markup was changed.

## Validation

Evidence is saved under `validation_artifacts/boss_checkpoint_regression/`.

| Evidence | Result |
|---|---|
| `matrix.json` | 98 baseline/current/production characterization cases before the fix |
| `additional.json` | 56 cross-engine and fresh faculty-export characterization cases |
| `later.json` | 48 baseline/current/production later-boss save/resume cases |
| `boundary.json` | 9 natural Room 1–10 runs; identical seeded boss questions across versions |
| `release-guard.json` | Before-fix counterexamples: failed rewards and duplicate continuation |
| `fixed-final.json` | 91 passing restored-rule browser cases, including all response orders, later bosses, resumes, fresh faculty output, and natural boundary runs |
| `manual-fixed.json` | 8 passing maintained faculty-starter patterns |
| `resume-retry.json` plus `resume-retry-labyrinth-final.json` | All 12 failure/reload/retry/reward and historical partial-save scenarios pass; final Labyrinth rerun includes its existing cinematic intro |
| `weakness-setback.json` | 3 passing tests: existing weakness cannot intercept the boss setback |
| `standard-boss-unit.log` | 42 passing runtime-function cases, including defense against stale callbacks and preservation of other modes |
| `release-guard-final.json` | All 8 final release-guard patterns pass, including repeated Continue activation |
| `protected.json` | 658 protected definitions checked across 26 HTML files; only the explicit Standard boss-routing additions are excluded from answer-function comparison |
| `sync-check.json` | Generated/maintained propagation is idempotent |

The initial harness runs are retained. An incorrect Macro Command path and the final-results DOM transition were corrected in the harness before the complete `matrix.json` run. The first implementation test caught an out-of-scope name introduced by the existing accessibility text transform; this was corrected and the full fixed matrix passed. The Labyrinth retry test initially stopped at its cinematic intro; the focused rerun uses the existing Skip control and passes. These intermediate results are not counted as successful final checks.

No question-bank files, selection formulas, difficulty definitions, verification functions, scoring formulas, mastery calculations, telemetry serialization, artwork, graph descriptions, gameplay timing constants, or Cloudflare configuration were changed.

## Release status

The reported one-correct/two-incorrect behavior has been reproduced and its cause established. The restored Standard rule is validated: the first wrong boss answer ends the attempt and applies the setback. Production still serves the old behavior until a separately authorized deployment. No push, merge, or deployment was performed.

The full Composer suite initially passed 39 of 40 runners. Its sole failure was a stale exact-markup assertion that rejected the existing accessibility attributes on the question container. That assertion was corrected to validate the element type while allowing attributes, and its rerun passed. All 40 runners are therefore validated; the original run and corrective result are both retained. No remaining blocker was found for the checkpoint fix. Historical already-completed progression and previously earned artifacts remain intact, as noted above.

## Re-running

Run with Node from the repository root. Browser checks require Playwright and Microsoft Edge; `PLAYWRIGHT_MODULE` can point to an installed Playwright package.

```text
node build/faculty-build-composer/tests/run_standard_boss_progression_validation.mjs
node audit_tools/accessibility_cleanup/boss-checkpoint-source-audit.mjs
node audit_tools/accessibility_cleanup/boss-checkpoint-regression.mjs --fixed
node audit_tools/accessibility_cleanup/boss-checkpoint-resume-retry.mjs
node audit_tools/accessibility_cleanup/boss-checkpoint-protected.mjs
```

The source audit creates the scratch faculty export used by the browser matrix. Production fixtures are the captured public files in the evidence directory, so re-running the comparison does not contact production.
