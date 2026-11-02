# Outstanding review requests, November 2, 2026

Applied all 54 outstanding flags after the instructor accepted the earlier 65
Elite revisions and the completed Easy-review records were reconciled. Baseline
commit: `0d89ff0febcbb0565c81f303706f6a177584d080`.

## Dispositions

- 41 Elite questions moved to Legendary, including the ten tentative
  Monopolistic Competition recommendations covered by this authorized pass.
- Six Easy questions moved to Medium.
- One Easy and one Medium question moved to Hard.
- Five content fixes: simplified the Easy reserve-contraction boss; clarified
  the public-good baseline and provided a readable, dedicated graph; removed
  the distracting velocity premise from monetary neutrality; clarified the
  monopoly-regulation price order; and made the innovation question's
  oligopoly context explicit.

`inventory.json` preserves the original flags and notes. `content-edits.json`
and `expectations.json` record exact before/after questions and reasons. All
9,748 other canonical question records are unchanged. Answer positions and
source provenance are preserved. The six ordinary boss records retain their
checkpoint placement while receiving the requested difficulty classification;
the specialist checkpoint challenge follows its existing difficulty routing.
There are 42 ordinary pool moves and 49 verified runtime difficulty/checkpoint
routes. No ordinary selectable topic falls below the five-Easy minimum, and
standalone Quiz availability is unchanged.

The public-good question uses a new graph asset. The original asset remains
available to every other question that references it. Counts, manifest, and
faculty-outcome coverage were rebuilt from the updated canonical library.

## Review and exports

The external review source and HTML in
`Documents/Mastery Quests Website/Conference_Presentation` now use the current
bank. **Review updated questions** opens all 54 revisions together, including
the 41 now labeled Legendary. Previous wording, difficulty, explanations, and
the replaced graph are available for comparison. These 54 remain pending user
verification; no new approval was inferred. All existing reviews, notes,
history, and the 65 prior Elite approvals are preserved. Newer browser reviews
win over older embedded seeds. CSV export is explicitly labeled as containing
all questions, regardless of the active filter, and includes current and
previous difficulty columns.

All three faculty PDF/CSV/XLSX banks were regenerated. The existing Micro manual
review workbook and CSV retain reviewer entries, dropdowns, and hidden support
sheet state, with page references reconciled. Exports, baselines, browser
backups, and screenshots remain local and ignored. No website update-page
entry was added.

## Verification

- Targeted validation: 54 exact edits, 49 runtime routes, 9,802 canonical
  questions, preserved provenance/answers/assets, and no Easy coverage loss.
- Comprehensive question-bank validation passes across all 9,802 questions.
- Faculty-outcome validation passes 194,096 assertions across 149 concepts,
  222 outcomes, 536 combinations, 13 presets, and 10 modes.
- The completed Easy-pool regression passes. Its current coverage assertion
  uses the current bank; historical content assertions still use the original
  revision snapshots.
- Isolated Edge tests reconcile all 7,143 review questions and 218 embedded
  graphs, and verify the 54-item queue, prior approvals, newer browser notes,
  backup/restore, approval history, CSV export, and mobile layout.
- PDF/CSV content checks include the earlier review ledgers and all current
  changes. Every XLSX cell matches its CSV; manual reviewer fields, dropdowns,
  hidden sheet, and page references pass preservation checks.
- Current PDF and workbook samples were rendered and visually inspected.

Detailed results are in `validation.json`, `review-validation.json`,
`export-validation.json`, `excel-parity.json`, and `delivery-verification.json`.

## Reproduction

Use the bundled Node/Python runtimes and dependencies. The immutable baseline
was captured once by `prepare.py`; do not recapture it from the revised bank.
`author.cjs`, `graph.cjs`, and `apply.cjs --write` generate the documented bank
changes. `refresh-review.py` updates the external review source/template, and
the copied `build-review-html.py` runs from that external source directory.
`test-review.mjs` uses an isolated Edge context and never changes the user's
browser profile.

Core verification commands:

```powershell
node audit_tools/review_flags_20261102/validate.cjs
node build/faculty-build-composer/tests/run_remaining_easy_completion_validation.cjs
node audit_tools/review_flags_20261102/test-review.mjs
python tools/export_faculty_question_bank.py --node <node-executable>
node audit_tools/easy_pool_review_20261101/excel.mjs --report-directory=audit_tools/review_flags_20261102
python audit_tools/easy_pool_review_20261101/restore_review_sheet_state.py --baseline-directory audit_tools/review_flags_20261102/baseline
python audit_tools/easy_pool_review_20261101/verify_excel.py --report-directory audit_tools/review_flags_20261102 --baseline-directory audit_tools/review_flags_20261102/baseline
python audit_tools/review_flags_20261102/verify-delivery.py
```

The PDF verifier accepts both the earlier Elite and current revision ledgers,
the three Easy-addition ledgers, and repeatable `--preview-id` arguments. The
General bank contains no questions from this 54-item batch; its current
rendering was inspected separately at question `P77-MVM-EL-015`, page 461.
