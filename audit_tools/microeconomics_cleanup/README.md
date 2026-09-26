# Microeconomics consolidated cleanup

This is the implementation of the existing 116-finding Micro audit and its
instructor adjudications. It is not the subsequent independent final verification.
The canonical starting point is Git `04f9ca7`; the apply script verifies its source
SHA-256 before reconstructing the bank. Inputs are explicit reviewed records, not
an open-ended text-rewriting heuristic.

From the repository root:

```powershell
node audit_tools/microeconomics_cleanup/apply_cleanup.cjs
```

This writes staging files and an exact before/after ledger under
`tmp/microeconomics_cleanup`. It does not install them unless `--write` is supplied.
The default uses the seven reviewed asset files already in the canonical asset
directory. To recreate those assets with Python, NumPy, Matplotlib and Pillow:

```powershell
python audit_tools/microeconomics_cleanup/generate_graphs.py
node audit_tools/microeconomics_cleanup/apply_cleanup.cjs --generated-graphs --write
```

The checked-in expectation ledger is
`validation_artifacts/question_quality/microeconomics_consolidated_cleanup_expectations.json`.
It pins all changed IDs and fields against the immutable baseline. Do not refresh
it from arbitrary live content. The mutation checks demonstrate that edits to an
approved record's unapproved fields, untouched records, accepted records, answer
hashes, historical expectations, and storage locations are rejected.

Implementation validation commands:

```powershell
node build/faculty-build-composer/tests/run_active_composer_suite.js
python audit_tools/microeconomics_cleanup/check_math.py
node audit_tools/microeconomics_cleanup/check_guards.cjs
node audit_tools/microeconomics_cleanup/check_publication.cjs
python -m unittest discover -s tools/tests -p test_export_faculty_question_bank.py
python tools/export_faculty_question_bank.py --node node
python audit_tools/microeconomics_cleanup/check_exports.py node
node audit_tools/microeconomics_cleanup/report.cjs
```

The export checker renders every Micro page, compares every CSV field with the
current projection, and checks keys, feedback, images, bounds, navigation and
question-core continuity. Visual review of corrected graphs and dense pages is
recorded separately in the final report. Reports and faculty answer-key exports
remain in the repository's ignored local `faculty_exports` directory.

Known documented limits: the calibrated factor/choice/inequality preset lacks a
Legendary ordinary pool; the full Micro course supports all ten modes. The 25
legacy Market Failures records omitted by selectable student subtopics were
already omitted before this cleanup and remain in the faculty export. Neither
limitation is disguised by changing the engine or inventing harder questions.
