# Elite question revisions — November 1, 2026

Strengthen the instructor's flagged Elite questions and audit the unfinished
Elite questions in the existing offline review queue. The latest instruction
keeps the flagged items at Elite and strengthens their content, superseding
earlier suggestions to lower their difficulty.

## Scope and results

The supplied fifth CSV contains 150 newly reviewed Elite questions: 85 passed
and 65 flagged. All 65 flags were revised. Of the 137 unfinished Elite questions,
113 were revised and 24 retained with individual reasons in `retained.json`.
The 178 edits preserve answer positions and all question IDs and difficulty
levels. There are still 9,802 canonical questions and 481 Elite questions.

The 85 passed questions, 14 questions with earlier review decisions, and 180
previously documented Elite questions absent from this review queue are unchanged.
Every non-target canonical record is checked against the immutable baseline.
The earlier Easy corrections and all 25 approved conceptual additions remain intact.

Revisions require linked reasoning or calculations, meaningful interpretation,
plausible alternatives of comparable length, complete initial conditions, and
explicit market structures. Students infer curve shifts from economic events.
Graphs have usable numerical information; fixed-price models state their
assumptions. Calculations do not require calculus. The transit-elasticity item
now stays within elasticity prerequisites and has matching skill metadata.
A loanable-funds misconception description was also aligned with its new values.
Original source provenance remains intact.

## Refreshed local review

The existing file was updated in place:

`C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation/deliverables/MasteryQuests_Question_Review.html`

The underlying `source/personal-review-list-data.json`, template, and builder
were refreshed too. All 7,143 queue records match the current canonical bank;
217 unique graphs remain embedded for offline use. The original queue does not
include the 25 subsequently approved Easy additions, which remain in the banks.

- **Continue elite review** selects the 137 unfinished Elite questions.
- **Verify revised elite flags** selects the 65 previously flagged revisions.
- Revised questions show the previous version for comparison.
- Existing decisions and notes remain keyed by question ID. The fifth CSV seeds
  the page, and newer browser-local records win over that seed.
- A prior answer is labeled as belonging to the previous version. Confirming a
  new answer or review preserves the old record in review history.
- CSV and backup exports retain progress and revision-verification metadata.

The browser test uses a separate, disposable browser profile. It does not open
or alter the instructor's actual browser storage. The original local review
sources and generated page are backed up under the ignored `baseline/review/`.

## PDF and Excel banks

The three faculty PDFs/CSVs and matching XLSX banks were rebuilt in the existing
ignored `faculty_exports/` directory. The Microeconomics manual-review workbook
and CSV preserve reviewer entries and receive current PDF page references.
Two historical IDs already absent from the bank remain labeled `Not in bank`.
The workbook's dropdowns and hidden support sheet are preserved.

These answer-bank files and the offline personal review remain local. No
website update-page entry is included.

## Validation

- Canonical integrity, all 202 audit decisions, all 178 answer keys, unchanged
  records, unique choices, graph references, and answer-length screening pass.
- 66 independent numerical scenarios pass, including all revised numerical
  families and checks of profit-maximizing output against alternative outputs.
- Comprehensive question-bank validation and faculty-outcome validation pass;
  the latter checks 194,096 assertions across 536 combinations and 13 presets.
- The completed Easy pool, original Easy-review changes, Quiz mode, and
  Macroeconomics taxonomy regressions pass.
- Browser tests pass for all 7,143 records, 217 images, progress merging,
  previous-answer history, re-verification, backup/restore, CSV, and mobile layout.
- PDF/CSV content is reconciled with revised records and previous Easy changes;
  every XLSX cell matches its CSV. Manual-review entries and dropdowns are
  compared against the original workbook. PDF and workbook samples are rendered
  and visually inspected.

The graph-hygiene runner still reports four pre-existing findings in unchanged
records: `P52B-INC-H-002`, `PMOE-TX-L-006`, `P62C-CPS-L-004`, and
`P62C-CPS-L-010`. These are outside this Elite revision scope. The targeted audit
asserts that all four are identical to the baseline; revised questions have no
orphaned graph references or dependent-context introductions.

## Reproduction and provenance

`inventory.json` records the original questions and review classification.
The baseline commit is `7a86aefd70045d315fc56e066eccafc41cd5a58e`.
`expectations.json` records exact before/after data, reasons, and checksums.
Historical regression adapters reverse only the documented changes before
running historical assertions, while validating the current canonical hash.

The local baseline files are intentionally ignored. `prepare.py` can recover
canonical baseline files from the commit above; it also requires the original
review CSVs at their documented local paths. Do not rerun preparation merely
to regenerate exports.

```powershell
node audit_tools/elite_pool_revision_20261101/merge-drafts.cjs
node audit_tools/elite_pool_revision_20261101/apply.cjs --write
node audit_tools/elite_pool_revision_20261101/validate.cjs
python audit_tools/elite_pool_revision_20261101/refresh-review.py
python 'C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation/source/build-review-html.py'
node audit_tools/elite_pool_revision_20261101/test-review.mjs
python tools/export_faculty_question_bank.py --node <node-executable>
node audit_tools/easy_pool_review_20261101/excel.mjs --report-directory=audit_tools/elite_pool_revision_20261101
python audit_tools/easy_pool_review_20261101/restore_review_sheet_state.py --baseline-directory audit_tools/elite_pool_revision_20261101/baseline
python audit_tools/easy_pool_review_20261101/verify_exports.py --report-directory audit_tools/elite_pool_revision_20261101 --revisions audit_tools/elite_pool_revision_20261101/expectations.json --additions audit_tools/saving_identity_easy_20261101/expectations.json --additions audit_tools/quiz_easy_completion_20261101/expectations.json --additions audit_tools/remaining_easy_completion_20261101/expectations.json
python audit_tools/easy_pool_review_20261101/verify_excel.py --report-directory audit_tools/elite_pool_revision_20261101 --baseline-directory audit_tools/elite_pool_revision_20261101/baseline
```

Use the bundled runtime dependencies for the exporter, Artifact Tool workbook
authoring, and isolated Edge browser test. The tracked review template and
builder are copies of the external source files; the builder runs from the
external `source` directory. Full browser backups, screenshots, and local
review-state data are ignored rather than published with the audit code.
