# Macro 45-ID exception closure

This directory implements the bounded 2026-09-27 closure of the 45 MFV exceptions. It is not a general question-bank cleanup tool.

The frozen `inputs/baseline.json` identifies the independently verified Git/source state, all 45 targets, all 6,623 protected General/Micro IDs and the protected file hashes. `inputs/before_targets.json` retains exact records, MFV exceptions, original findings and overlaps. Do not replace these inputs or rerun `prepare.cjs` against another state.

`author.py` records the explicit approved revisions and focused semantic reviews. `apply.cjs` reconstructs the proposed state from the frozen baseline, asserts the exact 45-ID boundary and produces a staged preview and field ledger. `--write` applies the four canonical/derived data files and the literal approval expectations; it refuses unrelated later changes. Do not replay the earlier consolidated cleanup over this closure.

`verify.cjs` checks exact current approvals, all answers, unchanged records and placements, shared-bank protection, the 13 tiers, actual repair/bridge pools, publication and all before/after mode inventories. It also verifies that unauthorized record mutations are rejected. `recompute.py` independently computes the numerical cases from current student-visible stems. `protect.py` checks the frozen source/audit/asset file hashes.

The normal exporter remains `tools/export_faculty_question_bank.py`. `check_exports.py NODE_EXECUTABLE` compares canonical data with all companion CSVs and checks every Macro PDF page, image, question core, answer marker and navigation target. `render_visual.py` creates the contact sheets for every revised target; its manifest must be marked PASS only after actual visual inspection. Re-rendering invalidates that attestation until the new sheets have been inspected.

`build_report.py` asserts matching current source/export evidence, successful logs and visual inspection, then produces the requested 18-section report and machine ledger. It copies completed checks and logs into `validation_artifacts/macroeconomics_exception_closure/`. The source-file SHA-256 and internal normalized `librarySha256` are separate values and are verified separately.

Completed validation: 29 Composer runners, 14 exporter tests, 20 independent numerical checks, 45 visual target inspections, zero unauthorized canonical changes. All prior 93 unavailable small-selection combinations persist; the required tier corrections add 11 within two already affected selections. The cumulative calibration consequence is 104 combinations across the same 41 selections, while full Macro supports all ten modes.

Reports and generated exports reside in the repository's existing ignored `faculty_exports` output directory. This task does not change ignore rules or stage generated files. The durable evidence and explicit approval layer allow future reviewers to reconcile each change with its original exception.
