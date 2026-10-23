# Labyrinth merged main validation

## Cause and scope

Investigated local `main` at `d0ee273b08f88c43bdb3319df2d3b1ff08a09f1f`, after the Labyrinth and Macro merges. The failing `baseline parity exam` comparison used production commit `47485dd34788de6f23d0db325801aa7dd4640317`, which predates the approved Labyrinth Exam modernization.

The reproduced mismatch is expected behavior, not a merged functional regression. After an ordinary response, the old baseline immediately increments attempts and correct answers, updates mastery, emits a scored `question` event, and advances the room. The approved implementation keeps attempts and correctness unchanged, emits `exam_answer_initial` or `exam_answer_revision`, and retains a revisable response until section commitment. The old baseline also uses different adaptive state and RNG consumption. Requiring those traces to match would undo the approved assessment behavior.

All **86 tracked files** under `play/micro-domains/labyrinth-of-choice` match approved branch `labyrinth-interface-exam-alignment` at `0a28f2eb9f2409d903b85582091e04a018a80b86`. Both commits reference HTML blob `a675fb304a2f4bab45a9e17cec13902206ef9c3a`. No application files were changed during this investigation.

## Changes

- `audit_tools/labyrinth_alignment/validate.mjs`: keep the old production baseline for the nine non-Exam modes and historical save/selection compatibility. Add an independent, pinned approved Exam baseline, configurable with `MQ_LABYRINTH_EXAM_BASELINE`. Both phase 1 and phase 2 now compare a complete Exam against that approved reference instead of comparing two responses against pre-modernization behavior. The deep Risk & Reward all-in case also dismisses the approved introduction through its normal controls before looking for the wager button, without using the shared start helper that would preselect a 10% wager.
- `LABYRINTH_MERGED_MAIN_VALIDATION_REPORT.md`: this cause, scope, reproduction, and validation record.

The Exam comparison checks 46 protected snapshots: question identity and option order, drafts, scoring, mastery/adaptive state, RNG counts, events, Daily state, report, artifacts, and navigation. Independent assertions require three sections of nine revisable ordinary responses followed by three guardian responses, 36 accepted responses, three section commits, and one completion. It exercises draft revision and room revisiting, rejects premature/duplicate commits, checks the compact clickable room grid and neutral named introductions, and verifies withheld correctness, no artifacts, and no Standard setback, remediation, or combat presentation on guardian misses. A wrong checkpoint still consumes all three responses before its aggregate summary.

The existing phase 2 coverage retains delayed feedback/audio checks, draft-export privacy, early exit, report correctness, canonical cross-engine comparisons, graph and keyboard accessibility, and abandoned asynchronous verification. Historical Standard save and non-Exam compatibility checks remain intact. Stage-specific historical authoring scripts are not substitutes for this current-runtime suite; the guardian suite separately protects the final approved introduction integration against its immediate predecessor.

The complete run also exposed an obsolete launch sequence in `Risk all-in bust baseline parity`: it called `startSelectedMode` directly and waited for the ALL IN button while the first-launch Archivist dialog was still open. The same approved introduction is present unchanged on both the approved branch and merged main. The test now proceeds through that dialog before wagering; its historical bankroll, bust-event, and state-parity assertions remain unchanged.

## Final validation

| Validation | Final result |
| --- | --- |
| Complete validator phase 1 | 18 / 18 PASS |
| Complete validator phase 2 | 24 / 24 PASS |
| Complete validator deep stage | 16 / 16 PASS |
| Guardian introduction suite | 6 / 6 PASS |
| Total browser cases | **64 / 64 PASS** |
| Exam CSV contract and Class Answer Analysis | 2 / 2 PASS |
| Labyrinth artifact fingerprint | PASS |
| Macro synchronization and source protection | PASS |
| Combined public-site build and ten runtime file comparisons | PASS |

The first deep run passed 15 cases and exposed the stale Risk & Reward launch described above. Its evidence is retained in `full/deep-first-pass-results.json`. The corrected focused case passed, then the entire deep stage was rerun and passed all 16 cases. Phase 1, phase 2, and the guardian suite passed their complete runs. No gameplay correction was necessary.

The current draft and complete Exam CSV exports also passed the historical 70-column schema and telemetry-contract checks, canonical answer-index consistency, draft answer-key withholding, and Class Answer Analysis with 0 and 36 accepted/included attempts respectively, no duplicate attempts, and no unresolved rows.

The focused approved Exam comparison passed with **46 states**, **three sections**, and **36 accepted responses**. Macro `sync.mjs --check` and `check.mjs` passed, protecting **22 complete engine functions per game** and **159 companion files**, including the four approved question corrections. The combined public-site build passed with **2,408 files**, **151 Composer review PDFs**, **zero forbidden files**, and **zero incoming question assets**. All ten built Labyrinth/Macro entry-page and bank files exactly match their merged source bytes.

## Reproduction

From the repository root, use the configured Node runtime:

```powershell
$env:MQ_A11Y_OUT = 'tmp/accessibility_cleanup/merged-main-investigation/full'
node audit_tools/labyrinth_alignment/validate.mjs phase1
node audit_tools/labyrinth_alignment/validate.mjs phase2
node audit_tools/labyrinth_alignment/validate.mjs deep
node audit_tools/labyrinth_alignment/guardian-introductions.mjs
node audit_tools/labyrinth_alignment/update-fingerprint.mjs --check
$env:MQ_MACRO_OUT = 'tmp/macro-managerial-alignment/merged-main-investigation'
node audit_tools/macro_command_engine/sync.mjs --check
node audit_tools/macro_command_engine/check.mjs
node audit_tools/public_site_publication/build-dist.mjs
```

The run used the bundled Node runtime and local headless Edge, with browser requests restricted to the local test server. Browser launch requires the host's usual execution permissions; the initial sandbox launch could not start Edge, and the local browser runs succeeded outside that sandbox.

Evidence is ignored under `tmp/accessibility_cleanup/merged-main-investigation/`, with the dedicated guardian results under `tmp/accessibility_cleanup/labyrinth-final-alignment/guardian-introductions/` and Macro results under `tmp/macro-managerial-alignment/merged-main-investigation/`. The initial failing comparison is retained in `before/phase1-focused-results.json`; the approved comparison is in `focused/phase1-focused-results.json`; the complete runs are in `full/`. Source/build comparison evidence is `source-and-build-integrity.json`. Public build output remains in ignored `dist/`.

Generated evidence and the rebuilt public site left no unintended tracked changes. Only the validator and this report are included in the local commit.

No push, merge, deployment, or Cloudflare configuration change was performed.
