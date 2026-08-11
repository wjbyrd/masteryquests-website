# Mastery Report 2.0 — State-Leak Hotfix

## Release
Composer **4.5s.1**

## Defect reproduced
Sequence:

1. End Unlimited Practice.
2. View Mastery Report.
3. Back to Results.
4. Choose Another Battle.
5. Start Exam Drill.

Observed defect: the prior Unlimited Practice results block could remain visible under the new Exam Drill question.

## Root cause
The gameplay template used a `<p id="question">` element while completion/results rendering inserted block-level `<div>` elements inside that paragraph. The results screen was cached as HTML for the Mastery Report's **Back to Results** function. When that cached HTML was reparsed, the browser corrected the invalid paragraph/block nesting and moved the old results block outside `#question`. Starting the next mode replaced the new question content but could leave the orphaned old results block behind.

A Chromium fragment reproduction confirmed the behavior:
- legacy paragraph container: old results become an orphan and survive a new question;
- new block container: old results are removed normally and no orphan remains.

## Fix
- Changed `#question` from a paragraph element to a block-safe `<div>` container.
- `restoreGameplayShell()` now supports a forced pristine reset.
- Every newly started/resumed battle calls `restoreGameplayShell(true)` so previous results/report DOM cannot survive into another run.
- Returning to the mode menu clears `latestResultsScreenHTML`.

## Regression protection
Validated:
- seven-mode availability: PASS
- Quiz Mode: PASS
- Unlimited Practice / Exam Drill manual-end flow: PASS
- Mastery Report 2.0 evidence logic: PASS
- explicit results-state-leak hotfix test: PASS
- Chromium legacy-vs-fixed DOM fragment reproduction: PASS

## Source integrity
No question/library data changed.
- Canonical questions: **7,977**
- Question assets: **399**
- `composer_library.js`: unchanged
- `composer_registry.json`: unchanged
- `composer_library_manifest.json`: unchanged

This is a UI/state-management hotfix only.
