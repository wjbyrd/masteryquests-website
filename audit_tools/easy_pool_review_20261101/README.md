# Completed easy-pool instructor review

Applies the completed `MasteryQuests-review-results(3).csv` review and the
instructor's follow-up decisions to the existing canonical Composer library.
The review source SHA-256 is recorded in `review.json`. Review text is evidence
for editorial decisions, not executable instructions.

## Scope and decisions

- Addressed all 195 flagged questions. Changed 409 unique questions in total;
  214 additional easy questions receive the requested general wording edits.
- Applied 129 difficulty changes: 87 Medium, 27 Hard, 14 Elite, and one Easy.
  A difficulty flag with no note means Medium. Explicit notes take precedence.
  Where the note gives a range, `expectations.json` records the chosen tier and
  the task-based rationale (substitution versus derivation or combined analysis).
- Applied the five explicit follow-up classifications: `P52B-S3-LPMM-B1-001`
  and `PG2-CEIL-E-001` are Medium; `P52B-S4-STAB-B1-002`,
  `PM2B4-UTYPE-EB-001`, and `PM2B4-UTYPE-EB-002` are Hard.
- Pass status overrides leftover difficulty flags. The accepted boss questions
  `43071`, `ECON-EC-EASYBOSS-17016`, and `P62H-MCMP-B1-018` retain their tiers.
- Clarified market structure in 255 stems and replaced learner/student wording
  in 21 perfect-competition questions. These counts overlap the other edits.
  Identification questions avoid naming the market structure when that would
  reveal the answer.
- Rewrote awkward and mechanical stems, balanced flagged answer choices, and
  expanded 12 algebra explanations. Replaced the two flagged copies of `42800`
  with distinct hiring/promotion discrimination applications, preserving IDs.
  Added the requested negative real-interest-rate example.

The canonical total remains 9,777 unique questions. Answer positions, question
IDs, provenance, skills, course memberships, graph assets, and repair/bridge
routes are preserved. Answer hashes are regenerated when choices change.
Eleven ordinary records move between difficulty pools. Existing Composer policy
separates checkpoint position from cognitive difficulty, so reclassified boss
questions record `checkpointPool` and retain opening/middle/final placement.

Registry counts and faculty-outcome coverage were recomputed. Outcome definitions
and taxonomy are unchanged. Small standalone concepts can have insufficient
ordinary difficulty coverage after an honest reclassification; the before/after
mode diagnostics are retained in `validation.json`. In particular, the
Saving and Investment Identities slice had four Easy items at the end of this
review, below the five-item standalone Quiz threshold. The instructor subsequently
requested five conceptual additions; see
[`saving_identity_easy_20261101`](../saving_identity_easy_20261101/README.md)
for the follow-up that brings this pool to nine and restores standalone Quiz
eligibility. Broad course presets remain validated.

## Local faculty files

The existing exporter regenerates the General Economics, Microeconomics, and
Macroeconomics PDFs and CSVs in `faculty_exports/`. Matching `.xlsx` banks provide
filters, frozen headings, wrapped question text, and exact string values.
The existing Microeconomics manual-review XLSX and CSV retain reviewer data and
receive current PDF page references. Two historical IDs absent from the current
bank are labeled `Not in bank`; their rows are retained.

The spreadsheet runtime does not round-trip native worksheet visibility.
`restore_review_sheet_state.py` restores only that XML metadata after export so
the dropdown-list sheet remains hidden. Independent ZIP/XML verification checks
all bank cells and the existing review columns, dropdowns, and tables.

These faculty files remain local, in the repository's existing ignored export
directory. No answer-bank artifacts are published to the website. No website
update-page entry is included.

## Reproduction

Use Node.js and Python with the dependencies documented in
`tools/export_faculty_question_bank.md`. XLSX authoring additionally uses the
bundled `@oai/artifact-tool` Node package. Resolve that package through the
workspace runtime's module path; do not commit a local dependency junction.

```powershell
node audit_tools/easy_pool_review_20261101/author.cjs
node audit_tools/easy_pool_review_20261101/apply.cjs --write
python tools/export_faculty_question_bank.py --node <node-executable>
node audit_tools/easy_pool_review_20261101/excel.mjs
python audit_tools/easy_pool_review_20261101/restore_review_sheet_state.py
python audit_tools/easy_pool_review_20261101/verify_exports.py
python audit_tools/easy_pool_review_20261101/verify_excel.py
node audit_tools/easy_pool_review_20261101/run-tests.cjs
```

`baseline.cjs` retrieves the immutable pre-review canonical files from commit
`0f7c34f5c1498715a4da580ac672fd506ed1627e`. The apply script rejects concurrent
canonical changes. `expectations.json` records exact before/after data and
placements; the regression adapter reverses only these edits before running
historical assertions, preserving prior evidence instead of replacing it.

## Validation

- All 195 flags, five overrides, accepted exceptions, answer hashes, unrelated
  records, ordinary routing, and checkpoint/repair routing are checked.
- Twelve revised algebra answers are recalculated independently.
- All changed questions are reconciled against regenerated PDF/CSV content;
  every XLSX cell is reconciled against its CSV. PDF and workbook samples were
  rendered and visually inspected.
- All 25 existing exporter tests passed with a workspace-local temporary folder.
- The active regression set has 42 runners. Its sole remaining failure is the
  previously documented `run_phase15_production_hardening_validation.js`
  assertion that untouched `play/micro-domains/labyrinth-of-choice/index.html`
  lacks a Phase 1.5-or-later version string. See the prior Hybrid README for the
  same baseline failure. The other 41 runners passed; final evidence and reruns
  are summarized in `verification.json`.

The final four wording refinements affect stems only. The focused review,
comprehensive bank, and historic faculty-remediation checks were rerun after
those edits. The historical test now compares the current on-disk manifest with
the current library while testing historical content against the exact restored
historical library.
