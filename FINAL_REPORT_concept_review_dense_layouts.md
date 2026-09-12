# Canonical dense-layout engineering

## Task Identity
CONCEPT_REVIEW_CANONICAL_DENSE_LAYOUTS_V1

## Repository
Verified working directory and Git top-level: C:\Users\Jennings\Documents\GitHub\masteryquests-website. Branch: main. Baseline HEAD: 064362140bb6439d044f1c2aa835d841783f75ae. Write probe passed. Pre-existing tracked/untracked work was preserved; the repository was not clean at preflight. Exact status and protected hashes are in [baseline.json](validation_artifacts/pdf_accessibility/canonical_dense_v1/baseline.json). Forbidden workspace unused. No reset, commit or push.

## Inherited Blockers
MACRO-16 required 519.665 pt against 505; MACRO-20 required 526.070 against 505; MICRO-52 required 500.895 against 491. The graph-based budgets also relied on a narrow image that made labels too small. All three inherited blockers are now resolved.

## Canonical Template Freeze
GEN-ECON-01's established specification, retained components, fonts and palette are byte-identical to preflight. Template extraction was not rerun. Header, metadata strip/icons/difficulty dots, icon rail, section rules, canonical card styling and footer remain unchanged. Dense modes alter interior composition and permitted flexible spacing only.

The instructional source remains byte-identical. No sentence, example, table value, title or economics correction was shortened or reverted.

## Dense Layout Modes
Implemented CANONICAL_GRAPH_DENSE, CANONICAL_TABLE_DENSE and CANONICAL_LONG_TITLE in the canonical-components path. [Mode contracts and checks](audit_tools/pdf_accessibility/canonical_components/dense_modes.py) and [renderer](audit_tools/pdf_accessibility/canonical_components/pilot_renderer.py). See [DENSE_LAYOUT_SUMMARY.md](validation_artifacts/pdf_accessibility/canonical_dense_v1/DENSE_LAYOUT_SUMMARY.md) for complete rules and [vertical budgets](validation_artifacts/pdf_accessibility/canonical_dense_v1/vertical_budgets.json).

## MACRO-16
Old budget: 519.665 / 505 pt. New layout: native-sized dense labor graph at left, unchanged explanation at right, inside the canonical Worked Example card. Graph dimensions: **280 x 120 pt**, labels **8.667 pt**. Curves, equilibrium, binding minimum wage, QD=90, QS=120 and surplus=30 remain correct and legible. Body is **9.70 pt**, above the 9.5 floor.

Final budget: **511.802 / 512.326 pt**. Final rendered page reopened and checked; no clipped or overlapping labels or prose. [Final maintained candidate](tmp\pdf_accessibility\canonical_dense_v1\maintained\after\MACRO-16.pdf).

## MACRO-20
Old budget: 526.070 / 505 pt. New layout: full-width semantic bank balance sheet, compact row padding and unchanged explanation beneath. Table text is **9.665 pt**; body is **9.55 pt**. Rows remain Reserves 120/120, Loans 780/755, Securities 100/100, Total assets 1000/975, Deposits 900/900, Borrowing 40/40, Total liabilities 940/940, Capital 60/35. Identities remain 1,000 = 940 + 60 and 975 = 940 + 35. Semantic Table/TR/TH/TD, scopes, IDs and Headers associations remain valid.

Final budget: **511.936 / 512.326 pt**. Final rendered table reopened and checked. [Final maintained candidate](tmp\pdf_accessibility\canonical_dense_v1\maintained\after\MACRO-20.pdf).

## MICRO-52
Old budget: 500.895 / 491 pt. The full title uses the bounded **two-line 25-point Arimo Bold** exception. Header, metadata and footer geometry are unchanged. The source-aware graph is **280 x 127 pt**, with **8.667-point** labels and unchanged curve coordinates. MC=36 still crosses the MR discontinuity between 20 and 40 at Q=20. Close y-axis tick labels use short leaders to their exact values. Current prose is unchanged at **9.55 pt**.

Final budget: **497.920 / 498.326 pt**. Title and graph were reopened and reviewed together; neither clips or overlaps. [Final maintained candidate](tmp\pdf_accessibility\canonical_dense_v1\maintained\after\MICRO-52.pdf).

## Full Pilot
| Resource | Layout / role | PDF/UA | Semantics / fidelity | Determinism | Render review |
|---|---|---|---|---|---|
| GEN-ECON-01 | Unchanged control | PASS | PASS | PASS | PASS |
| MACRO-11 | TEXT | PASS | PASS | PASS | PASS |
| MACRO-13 | TEXT | PASS | PASS | PASS | PASS |
| MACRO-16 | CANONICAL_GRAPH_DENSE | PASS | PASS | PASS | PASS |
| MACRO-20 | CANONICAL_TABLE_DENSE | PASS | PASS | PASS | PASS |
| MICRO-49 | Unchanged control | PASS | PASS | PASS | PASS |
| MICRO-52 | CANONICAL_GRAPH_DENSE | PASS | PASS | PASS | PASS |
| GEN-ECON-09 | FULL-WIDTH TABLE | PASS | PASS | PASS | PASS |


All eight were rechecked. Six generated candidates have exact normalized approved text; the two controls were not rebuilt unnecessarily. Explicit veraPDF PDF/UA-1 and source/semantic checks pass for all eight. Graph model hashes and unchanged alternatives bind the dense layouts to the approved economics. Current candidate hashes, independent validator evidence and rebuild hashes are recorded in [pilot results](validation_artifacts/pdf_accessibility/canonical_dense_v1/pilot_results.json) and [maintained validation](validation_artifacts/pdf_accessibility/canonical_dense_v1/corrected_validation.json).

Equal-scale evidence:

- [MACRO-11 canonical comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MACRO-11-canonical-comparison.png) and [v3 comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MACRO-11-v3-comparison.png).
- [MACRO-13 canonical comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MACRO-13-canonical-comparison.png) and [v3 comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MACRO-13-v3-comparison.png).
- [MACRO-16 canonical comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MACRO-16-canonical-comparison.png) and [v3 comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MACRO-16-v3-comparison.png).
- [MACRO-20 canonical comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MACRO-20-canonical-comparison.png) and [v3 comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MACRO-20-v3-comparison.png).
- [MICRO-52 canonical comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MICRO-52-canonical-comparison.png) and [v3 comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/MICRO-52-v3-comparison.png).
- [GEN-ECON-09 canonical comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/GEN-ECON-09-canonical-comparison.png) and [v3 comparison](validation_artifacts/pdf_accessibility/canonical_dense_v1/comparisons/GEN-ECON-09-v3-comparison.png).

## Pilot Decision
**PASS - 8/8.** [Byte-bound acceptance](validation_artifacts/pdf_accessibility/canonical_dense_v1/pilot_acceptance.json). Owner final visual approval and human AT remain pending; the render reviewer was Codex.

## Renderer Promotion
Promotion occurred only after the complete pilot passed. The maintained qa_renderer dispatch now supports an explicit canonicalTemplate profile. Source-aware tagging and source binding support canonical table regions and dense graph model fingerprints. The sole accessibility_semantics.json received dependent metadata updates for exactly six pilot resources. The two dense graph visual inputs are retained under canonical_components/figures and regenerate from the existing approved model data.

Six resources now regenerate through the normal maintained lifecycle, and their outputs are byte-identical to the reviewed pilot and final determinism rebuilds. The legacy route remains for candidates not yet aligned. No active production PDF was replaced.

## Batch Results
After the pilot PASS, fit preflight was run for the authorized 80-resource set in domain groups:

| Domain | Provisional fits | Blocked | Total |
|---|---:|---:|---:|
| General Economics | 4 | 5 | 9 |
| Microeconomics | 18 | 20 | 38 |
| Macroeconomics | 27 | 6 | 33 |
| Total | 49 | 31 | 80 |

Six of the 49 are the accepted pilot replacements. The other 43 are geometry/text fits only, not fully validated or promoted replacements. The remaining 31 need further content-aware layout work; they were not forced below the typography floor. No broad candidate-validation batch was claimed complete. Resumable [domain checkpoints](validation_artifacts/pdf_accessibility/canonical_dense_v1/batches) and [80-resource dispositions](validation_artifacts/pdf_accessibility/canonical_dense_v1/batch_dispositions.json) record exact budgets and failures.

Blocked resources: GEN-ECON-08, GEN-ECON-16, GEN-ECON-17, GEN-ECON-22, GEN-ECON-25, MICRO-02, MICRO-08, MICRO-11, MICRO-12, MICRO-13, MICRO-14, MICRO-16, MICRO-22, MICRO-24, MICRO-27, MICRO-32, MICRO-33, MICRO-38, MICRO-40, MICRO-44, MICRO-48, MICRO-51, MICRO-57, MICRO-58, MICRO-68, MACRO-23, MACRO-30, MACRO-37, MACRO-38, MACRO-39, MACRO-57.

This wider set includes additional graph and long-content layouts beyond the three inherited pilot blockers. Existing accepted candidates remain current for these resources. No content edits are authorized by this report.

## Full Staged Gate
**151/151 ACCEPTED**, now comprising six accepted canonical replacements and **145 reused candidates**. This includes all **71 unchanged canonical resources**, none of which was rebuilt. PDF/UA machine, semantic/project, content/authorized difference, determinism and contrast/render evidence remain valid. [Current staged gate](validation_artifacts/pdf_accessibility/canonical_dense_v1/staged_gate.json) and [current validation collection](validation_artifacts/pdf_accessibility/canonical_dense_v1/final_validation.json).

The preview was refreshed for this validated collection only: 151 resources, 302 planned destination copies. It was **not executed**. The 15 missing public MICRO-54 through MICRO-68 files remain absent.

## Canonical Fidelity Gate
PASS for the complete eight-resource pilot, including six rebuilt resources and two unchanged controls. The all-80 canonical alignment gate remains **INCOMPLETE**; the 31 fit blockers prevent declaring the collection fully aligned.

## Tests
**60/60 focused tests** and **19/19 pipeline checks** pass. Tests cover readable graph/table/body floors, graph display scaling, title overflow, immutable outer geometry, panel text/visual overlap, clipping, footer collision and metadata changes, plus the existing instructional and semantic-table regressions. Pipeline installation checks used isolated temporary fixtures only; active installation count is zero. [Focused results](validation_artifacts/pdf_accessibility/canonical_dense_v1/focused_tests.json), [pipeline results](validation_artifacts/pdf_accessibility/canonical_dense_v1/pipeline_tests.json).

## V4 Package
**Not created.** The requested path C:\Users\Jennings\Documents\GitHub\masteryquests-website\validation_artifacts\concept_review_owner_review\v4\ remains absent because the full batch is incomplete. Pilot comparisons and the dense-layout summary are available under C:\Users\Jennings\Documents\GitHub\masteryquests-website\validation_artifacts\pdf_accessibility\canonical_dense_v1\.

## Active Production State
UNCHANGED. 990 protected files were verified unchanged. The canonical specification and instructional source are unchanged. Exactly six resources received authorized dependent accessibility metadata updates. Active PDFs/manifests, graph authoring originals, games/hubs, question banks, telemetry/governance, Workers/D1 and manuscripts were not modified. No installation, deployment, commit or push. [Preservation evidence](validation_artifacts/pdf_accessibility/canonical_dense_v1/preservation.json).

## Human AT
PENDING.

## Final Status
CANONICAL DENSE LAYOUTS PARTIAL — FOLLOW-UP REQUIRED
