# Macroeconomics consolidated cleanup evidence

This directory implements the exact 2,179-ID action union in the September 26
Macro audit. It is not a new audit or a final-verification runner.

`inputs/question_patches.json` contains the final coherent per-ID edits.
`inputs/baseline.json` pins the starting Git revision, source/asset/audit hashes,
exact course memberships and protected General/Micro IDs. The other input
ledgers explain difficulty decisions, routes, calculations and targeted task
differentiation. Authoring scripts document how those reviewed inputs were
prepared; do not rerun them in arbitrary order over a finished patch ledger.

`apply_cleanup.cjs` reconstructs from the immutable Git baseline, refreshes keys
with production normalization, updates derived metadata, and produces the
exact approved-state adapter ledger. Without `--write`, it only stages output.
With `--write`, every destination must match either its original baseline or
the exact final output; subsequent unrelated edits are rejected before writing.
The final expectations are retained at
`validation_artifacts/question_quality/macroeconomics_consolidated_cleanup_expectations.json`.

Implementation checks:

- `verify_cleanup.cjs`: current canonical state, keys, aliases, protected hashes,
  support references, exact course memberships and 89 mode selections.
- `check_publication.cjs`: full Macro publication, before/after omission sets,
  supported modes, graph embedding and generated JavaScript compilation.
- `verify_economic_work.py`: per-ID arithmetic replay and additional visible-value,
  scope and labeled-model checks, using the reviewed input ledger.
- `check_exports.py NODE_PATH`: normal CSV/PDF parity, all-page rendering,
  bounds, core continuity, graph presence and navigation checks.
- `render_visual_samples.py`: exact required visual sample pages and contact
  sheets. The reviewed manifest is signed off only after visual inspection.
- `build_report.py`: binds evidence to the current source and PDF hashes and
  emits the requested 19-section report plus exact per-ID/family/finding ledger.

Final evidence is retained in
`validation_artifacts/macroeconomics_consolidated_cleanup/`. The active Composer
suite has 29 runners; the normal exporter retains its 14-test suite. Run the
normal exporter (`tools/export_faculty_question_bank.py`) to regenerate the
faculty bank, never edit the generated CSV/PDF files directly.

The next independent read-only verification is a separate task. The cleanup
report discloses existing publication omissions, small-selection mode inventory,
checkpoint stage/demand coupling and reviewed construction signals.
