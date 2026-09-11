# PDF accessibility pilot tooling

Task: PDF_ACCESSIBILITY_REPO_LOCK_V1

**Experimental pilot; no batch approval and no production installer.** Five staged PDFs pass veraPDF 1.28.2's explicit PDF/UA-1 profile. Two fail font embedding. The payoff-table sheet is rejected. Inline formula semantics and human assistive-technology checks remain pending. Successful syntax validation is not release approval.

All commands must run with working directory `C:\Users\Jennings\Documents\GitHub\masteryquests-website`. `repo_guard.py` verifies the exact checkout, rejects traversal, sibling-prefix collisions and reparse points. Intentional outputs stay in this checkout. Do not supply another workspace or follow historical absolute asset paths.

## Preserved evidence and resumption

Use `validation_artifacts/pdf_accessibility/inventory.json` and `baseline_hashes.json`; do not rerun the initial inventory. The inventory script refuses to overwrite an existing baseline. There are 151 manifest records, 151 logical pages, 287 existing copies, and 15 missing expected public copies. Per-copy metadata, fonts, image fingerprints, language, title, annotations and hashes are retained. Original instructional source fields match all Composer PDFs with whitespace-only line-wrap accommodation.

The canonical pilot semantic metadata is `build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json`. Its schema, resource codes, source-record hashes, baseline PDF hashes and displayed-image fingerprints are checked before generation. A shared quantity-theory description is referenced by both relevant resources. A description existing does not establish its semantic correctness. Review evidence is separately recorded.

## Commands

Use the available Python 3.12 runtime with `-B` to avoid bytecode products. Prefix script paths with the verified repository root when invoking from PowerShell.

- `tag_pilot.py`: regenerates only the selected staging candidates. The image-based payoff table is deliberately rejected. Every meaningful text object must match a canonical source field; unfamiliar text/images fail closed.
- `validate_pilot.py`: explicit veraPDF `--flavour ua1`, plus exact baseline/candidate text, page geometry and 1400-pixel Poppler rendering comparisons.
- `accessibility_gate.py`: standalone active-manifest release gate; expected exit code 1 on the current collection. No passing release evidence is supplied. This gate is not yet wired into the production installers.
- `negative_tests.py`: isolated staged mutations; never modifies active PDFs. Raw independent-validator reports are retained alongside project-specific results. The table-header-removal test is pending because no valid semantic table fixture exists.
- `run_regression.py baseline` or `run_regression.py final`: reads the current active-runner list and executes those same runners, with test products and TEMP/TMP rooted in task scratch. It does not edit the Composer tests or their telemetry behavior.

Python packages used by the prototype are pinned in `requirements.txt`. Existing rendering uses Poppler 26.07.0. Portable veraPDF 1.28.2 and Temurin JRE 17.0.16+8 are installed only in `tmp/pdf_accessibility/repo_lock_v1/tools`. Versions, download URLs, hashes and licenses are in `validation_artifacts/pdf_accessibility/installed_tools.json`. No global packages were changed.

## Why the current production pipeline is not replaced

The maintained completion/expansion tools draw untagged ReportLab PDFs. The former has staging/publication switches; the latter writes source metadata and PDFs directly. Neither was executed here. The original 116-sheet full renderer was not located among the tracked PDF tools. Its corrected PDFs plus their matching maintained JSON are the preserved source-aware pilot input. Do not run an older generator to recover visual resources.

The prototype preserves painting operators and font programs, adding content-linked semantic structure, metadata, and alternatives. It cannot currently create table-cell content associations for a single image containing a payoff matrix. It also does not split mixed prose/math into Formula runs. Standard Helvetica fonts used in 35 later baseline sheets are not embedded. No unapproved font substitution or economic content rewrite was made.

Before batch/install work, implement and validate those cases, remedy the documented text contrast, extend semantic review to every graph usage, and integrate the gate into a deterministic build-once/install-identical-copies path with regenerated manifest checksums. A checked structural flag or an experimental candidate's PDF/UA identifier must never be accepted as release evidence.
