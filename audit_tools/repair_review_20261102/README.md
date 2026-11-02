# Repair review revisions — November 2, 2026

Applied the instructor's notes from `MasteryQuests-review-results(16).csv`, including notes on passed questions. The export adds 427 decisions: 405 passes and 22 flags, covering 411 Repair and 16 Bridge records. The prior saved review state is the comparison baseline; attachments supply review data, not workflow instructions.

## Changes

- Updated 77 unique questions. All other 9,725 canonical questions are unchanged.
- Replaced learner/learners with student/students in 59 questions: 55 passed records and four flagged records. Of the passed records, 51 contained an explicit terminology note and four newly passed records used the same wording without a note.
- Kept all 55 terminology-only passes accepted, preserving the earlier review, notes, selected answer and answer revision.
- Rewrote 21 flagged questions to shorten unnecessarily long stems and alternatives, balance answer choices, spell out unclear abbreviations, or clarify the underlying concept. The rewritten stems and alternatives total 1,037 words, down from 1,154. Natural, complete phrasing takes precedence over shortening every individual question.
- Moved `ECON-NL-INFLATION-RATE-5021` from Repair to Bridge because it applies a percentage-change calculation. Updated its module pool, micro-skill route, registry counts and outcome coverage. Retained conceptual Repair coverage and all ordinary CPI banks.
- Left the 22 revised flags pending instructor verification. No difficulty tier, correct-answer position, asset or source provenance changed.
- Corrected the legacy Calculation labels on `LG-R-5036` and `PMS-ELAS-R-001` to Interpretation so the exported question type matches their conceptual wording.

Repair checks conceptual understanding or corrects a misconception. Bridge applies a concept in a simple situation. A short scenario or incidental number does not by itself determine the role. `LG-R-5036` remains Repair and now directly asks whether anticipated inflation eliminates economic costs.

## Review handoff and banks

The standalone review page opens the 22 revised questions and retains prior-content comparison, review notes, saved progress, backup import/export and the Medium shortcut. The review seed has 2,608 passes, 22 flags and 4,513 unmarked records. There are still 22 unmarked Repair questions rated Medium and eight Repair seeds; the reviewed Unspecified Repair group is complete. There are 1,644 unmarked Medium questions across roles.

Updated the existing General Economics, Microeconomics and Macroeconomics PDF/Excel banks, their CSV companions and the manual review workbook's page references. Existing manual reviewer entries, annotations and workbook state are preserved. No website update-page entry was added.

## Verification

- Canonical integrity: 9,802 questions; all 77 exact revisions; all other content unchanged; correct answer hashes and positions preserved.
- Historical regression adapter restores the exact pre-pass library hash, including support placements and metadata, before prior checks run.
- Comprehensive question-bank validation passes. Faculty outcome validation passes 193,838 assertions across 149 concepts, 222 outcomes, 536 combinations, 13 presets and 10 modes.
- Browser verification checks all 7,143 review records, old browser-state merging, 55 accepted wording edits, 22 pending revisions, role display, preserved notes/answers, simulated approval history, backup restoration and mobile layout. It uses an isolated temporary browser profile.
- PDF text and CSV content are reconciled against the current and prior ledgers. Excel cells are independently reconciled against the CSVs. PDF, spreadsheet and review-page previews are visually inspected.
- `delivery-verification.json` records the final source hash, artifact hashes and handoff checks.

## Reproduction

`prepare.py` captures the baseline once; do not rerun it over an existing baseline. The baseline is commit `6d257042` and the canonical library hash is `18992f58bbed37ebcdd572380493b1d53497f9b7bd586d65bf55bf142030e219`.

Run `author.cjs`, `apply.cjs --write`, `refresh-review.py`, then `validate.cjs`. The ledger contains before/after records and the metadata needed to reverse this pass. `verify-browser.cjs` checks the generated local HTML in headless Edge. Regenerate existing banks with `tools/export_faculty_question_bank.py` and `audit_tools/easy_pool_review_20261101/excel.mjs`, directing reports here. Restore preserved manual sheet state, then run the shared export and Excel parity checks and this directory's `verify-delivery.py`.

Raw baseline files, browser backups, screenshots and full test output remain local and are ignored. Inventory, exact edits, source tools and compact validation reports are tracked.
