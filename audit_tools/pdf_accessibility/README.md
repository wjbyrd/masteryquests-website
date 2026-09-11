# Concept Review accessibility pipeline

Current task: `PDF_ACCESSIBILITY_PILOT_BLOCKERS_V1`. Eight local pilots only. Full-library batching and active installation require separate owner authorization.

Run from `C:\Users\Jennings\Documents\GitHub\masteryquests-website` using the pinned Python dependencies in `requirements.txt`. Every input/output is checked by `repo_guard.py`; no alternate checkout or redirected path is accepted.

## Maintained source

`build/faculty-build-composer/data/concept-reviews/concept_review_source.json` owns instructional text. `accessibility_semantics.json` is the sole authored semantic source. It contains field/offset Formula runs and alternatives, graph/image hashes, contextual descriptions, the captured MICRO-49 table values and image-region mapping, and review state.

The six original-layout pilots retain fingerprinted, corrected visual sources in `data/concept-reviews/authoring/visual-sources/`. These are source-aware transformation inputs, excluded from deployment and package-resource resolution. No maintained original-layout visual renderer was identified. Source changes therefore require a corresponding reviewed visual-source update; the tagger rejects drift. This avoids depending on active installation bytes for future rebuilds. The two later-layout pilots render from the maintained Micro/Macro generators with the pinned ReportLab Bitstream Vera fonts. Replacing an active PDF cannot strip the next build's semantics.

## Build and validate

- `python -B audit_tools/pdf_accessibility/rebuild_pilot.py` builds the same eight staged candidates.
- `python -B audit_tools/pdf_accessibility/validate_candidates.py` runs veraPDF 1.28.2 with explicit `--flavour ua1`, independent structural/source checks, and Poppler comparisons.
- `python -B audit_tools/pdf_accessibility/negative_tests.py` exercises isolated damaged candidates.
- `python -B audit_tools/pdf_accessibility/test_pipeline.py` requires the byte-bound completed review receipt, checks the pipeline, and installs only into a scratch fixture.
- `python -B audit_tools/pdf_accessibility/run_regression.py pilot_blockers_v1` runs all current active Composer runners in repository scratch.

The legacy Micro/Macro generation commands now require explicit `--review-codes` and a repository-local `--output-dir` inside `tmp/pdf_accessibility/`. They use this same tagging and validation lifecycle. Raw visual generation refuses active output paths. Legacy `--publish`, source replacement helpers and implicit whole-family runs are disabled. The manifest audit command may write only staged evidence; validated installation owns active checksum updates.

`tag_pilot.py` and `validate_pilot.py` remain compatible entrypoints to the current pilot. The old inventory/baseline scripts preserve the earlier audit and should not be rerun for this task.

## Review and eventual installation

`install_validated.py --validation <validation.json> --review <review_receipt.json>` produces a read-only plan. The independent report, exact candidate hash, current instructional/semantic hashes, fonts, graph binding, semantic table/formulas, and completed source/visual review must all pass before installation. `materialize` repeats preflight, writes identical public/Composer bytes, updates only resource hashes/sizes/page/language data and total PDF size, records release evidence, checks equality and rolls back partial failures. Backups remain in repository scratch. No question-bank, telemetry or governance versions are changed.

The optional `--install` operation is for a separately authorized future release. It was NOT executed in this pilot. `test_pipeline.py` exercises the same transaction with scratch destinations, including creation of a missing public copy from validated bytes. `active_gate` reads recorded release evidence when available. Missing/unreviewed documents, changed assets/source, broken semantics or copy mismatches remain failures.

## Supported implementation and boundaries

PDF 1.7 / PDF/UA-1 (ISO 14289-1:2014). Single-page ReportLab text-show streams with proven single-byte font mappings are supported; unknown encodings/operators or unassigned content reject generation. Inline math splits original text-show bytes without moving or duplicating text. MICRO-49 partitions the existing image into non-overlapping caption/header/cell clips, each owned by its semantic element with replacement text. Table attributes include header scopes, IDs, an ID tree and explicit cell Headers references. The image-region mapping is tied to the displayed image fingerprint and captured source values; it is not OCR or a generic arbitrary-table recognizer.

Machine checks do not establish arbitrary graph semantics or screen-reader usability. Actual assistive-technology verification remains PENDING. See the updated owner pack and final pilot-blocker report. The other 143 logical documents have not been rebuilt or installed in this task.
