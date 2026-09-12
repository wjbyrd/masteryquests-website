# Concept Review accessibility pipeline

Current task: `PDF_ACCESSIBILITY_FULL_BATCH_V1`. The active manifest contains 151 resources. All have staged PDF/UA-1 machine-profile passes; the byte-bound semantic/visual gate currently accepts 126 and blocks 25. No active PDF was installed. Installation and human AT verification remain separate owner gates.

Run from `C:\Users\Jennings\Documents\GitHub\masteryquests-website` using the pinned Python dependencies in `requirements.txt`. Every input/output is checked by `repo_guard.py`; no alternate checkout or redirected path is accepted.

## Maintained source

`build/faculty-build-composer/data/concept-reviews/concept_review_source.json` owns instructional text. `accessibility_semantics.json` is the sole authored semantic source. It contains field/offset Formula runs and alternatives, graph/image hashes, contextual descriptions, the captured MICRO-49 table values and image-region mapping, and review state.

All 116 original-layout resources retain fingerprinted, current corrected visual sources in `data/concept-reviews/authoring/visual-sources/`. These transformation inputs are excluded from deployment and package-resource resolution. No maintained original-layout visual renderer was identified. Source changes therefore require a corresponding reviewed visual-source update; the tagger rejects drift. This avoids depending on active installation bytes for future rebuilds. The 35 later-layout resources render from the maintained Micro/Macro generators with pinned ReportLab Bitstream Vera fonts. Replacing an active PDF cannot strip the next build's semantics.

## Build and validate

Full-batch entrypoints (run from the verified root):

- `batch_candidates.py --name <checkpoint-name> --codes <explicit IDs>` resumes a guarded group, validates candidates and repeats generation for determinism. Recommended groups contain 15–25 documents; the manifest, not a historical count, defines scope.
- `refresh_batch_evidence.py` refreshes this run's recorded groups after a source/tooling change. Identical bytes retain valid original raw reports; changed groups use distinct evidence paths, preventing report collisions.
- `staged_gate.py --validation validation_artifacts/pdf_accessibility/full_batch_v1/final_validation.json --review validation_artifacts/pdf_accessibility/full_batch_v1/review_receipt.json --output validation_artifacts/pdf_accessibility/full_batch_v1/staged_gate.json` accounts for every active resource. Its current exit code 1 is expected: 25 documented visual/context blockers, not a machine-profile failure.
- `negative_tests.py --run full_batch_v1 --validation validation_artifacts/pdf_accessibility/full_batch_v1/final_validation.json` preserves isolated negative probes outside active locations.
- `test_pipeline.py --run full_batch_v1` exercises only fixture installation and rejected forged plans.
- `run_regression.py full_batch_v1_final` runs the current active Composer suite.

Canonical instruction cards can expose lists and source-aware Formula runs, including a grouped continuation line. Heading formulas and unary negative values are covered. Source-operator coverage catches omitted semantic selectors but does not infer arbitrary math or judge arbitrary economics. Unknown layouts remain rejected. The current Macro renderer also guards core/list overlap, preserves title size, and fits long formula-card definitions without truncation.

Historical pilot commands remain available; their output directories and evidence should not be overwritten during a full-batch retry:

- `python -B audit_tools/pdf_accessibility/rebuild_pilot.py` builds the same eight staged candidates.
- `python -B audit_tools/pdf_accessibility/validate_candidates.py` runs veraPDF 1.28.2 with explicit `--flavour ua1`, independent structural/source checks, and Poppler comparisons.
- `python -B audit_tools/pdf_accessibility/negative_tests.py` exercises isolated damaged candidates.
- `python -B audit_tools/pdf_accessibility/test_pipeline.py` requires the byte-bound completed review receipt, checks the pipeline, and installs only into a scratch fixture.
- `python -B audit_tools/pdf_accessibility/run_regression.py pilot_blockers_v1` runs all current active Composer runners in repository scratch.

The legacy Micro/Macro generation commands require explicit `--review-codes` and a task-specific repository-local `--output-dir` inside `tmp/pdf_accessibility/`. They use this same tagging and validation lifecycle, retaining validator reports under the matching subtree of `validation_artifacts/pdf_accessibility/`. Raw visual generation refuses active output paths. Legacy `--publish`, source replacement helpers and implicit whole-family runs are disabled. The manifest audit command may write only staged evidence; validated installation owns active checksum updates.

`tag_pilot.py` and `validate_pilot.py` remain compatible entrypoints to the current pilot. The old inventory/baseline scripts preserve the earlier audit and should not be rerun for this task.

## Review and eventual installation

`install_validated.py --validation <validation.json> --review <review_receipt.json>` produces a read-only plan. The independent report, exact candidate hash, current instructional/semantic hashes, fonts, graph binding, semantic table/formulas, and completed source/visual review must all pass before installation. `materialize` repeats preflight, writes identical public/Composer bytes, updates only resource hashes/sizes/page/language data and total PDF size, records release evidence, checks equality and rolls back partial failures. Backups remain in repository scratch. No question-bank, telemetry or governance versions are changed.

The optional `--install` operation is for a separately authorized future release. It was NOT executed in this batch. `test_pipeline.py` exercises the same transaction with scratch destinations, including creation of a missing public copy from validated bytes. `active_gate` reads recorded release evidence when available; `staged_gate` verifies the pre-install collection. Missing/unreviewed documents, changed assets/source, broken semantics or copy mismatches remain failures. The partial collection's installation plan is PREVIEW ONLY, not a proposal to install mixed production bytes.

## Supported implementation and boundaries

PDF 1.7 / PDF/UA-1 (ISO 14289-1:2014). Single-page ReportLab text-show streams with proven single-byte font mappings are supported; unknown encodings/operators or unassigned content reject generation. Inline math splits original text-show bytes without moving or duplicating text. MICRO-49 partitions the existing image into non-overlapping caption/header/cell clips, each owned by its semantic element with replacement text. Table attributes include header scopes, IDs, an ID tree and explicit cell Headers references. The image-region mapping is tied to the displayed image fingerprint and captured source values; it is not OCR or a generic arbitrary-table recognizer.

Machine checks do not establish arbitrary graph semantics, visual contrast or screen-reader usability. Actual assistive-technology verification remains PENDING. See `FINAL_REPORT_pdf_accessibility_full_batch.md`, the full-batch evidence directory and the versioned owner pack. The 25 blocked resources retain their machine-passing diagnostic candidates, exact visual/context findings and current production bytes; no weak substitute has been installed.
