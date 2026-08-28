# MICRO-60–68 Concept Review Split Report

## Outcome

The active `MICRO-60 — Information, Behavior & Public Choice` umbrella review was replaced with nine focused, five-minute Principles Micro reviews. The old title and mixed insurance/behavioral/voting example are no longer active. Each replacement retains the established one-page Concept Review design and contains one primary mechanism, one substantive worked example, and one Check Yourself item.

| Code | Canonical title | Focused worked example |
|---|---|---|
| MICRO-60 | Adverse Selection | An insurer's unobserved pre-enrollment risk pool worsens as high-risk applicants participate disproportionately. |
| MICRO-61 | Moral Hazard | Low-deductible collision coverage reduces a driver's incentive to take precautions after coverage. |
| MICRO-62 | Signaling & Screening | In one labor market, an applicant initiates certification while an employer initiates a skills test. |
| MICRO-63 | Present Bias | A worker repeatedly postpones retirement saving when immediate consumption becomes available. |
| MICRO-64 | Loss Aversion | An equal $50 fee receives more psychological weight than an equal $50 refund. |
| MICRO-65 | Framing Effects | A 90% survival description and a 10% mortality description produce different reactions to the same outcome. |
| MICRO-66 | Condorcet Paradox & Voting Cycles | Three consistent voter rankings generate A > B, B > C, and C > A by pairwise majority rule. |
| MICRO-67 | Arrow's Impossibility Theorem | A community cannot guarantee all specified desirable social-ranking conditions simultaneously under the theorem's assumptions. |
| MICRO-68 | Median Voter Theorem | Five ordered policy preferences show why 30 defeats alternatives on either side under the required assumptions. |

## Mapping strategy

The existing Concept Review bundle architecture already supported deterministic multi-resource routing by diagnostic evidence. A minimal, generalizable resource-routing extension now passes question-ID and tag maps in addition to the existing skill/objective maps, and supports `suppressUnmatched` for a broad parent whose bundle must not default to its first asset. This change is confined to Concept Review resource selection; question banks, question IDs, objective assignments, adaptive scoring, checkpoints, remediation, and gameplay behavior were not changed.

| Weakness signal | Review | Current route |
|---|---|---|
| Adverse selection | MICRO-60 | `IBP.2`, `analyze_adverse_selection`, and exact tag/aliases |
| Moral hazard | MICRO-61 | `IBP.3`, `analyze_moral_hazard`, and exact tag/aliases |
| Signaling/screening | MICRO-62 | `IBP.4`, `distinguish_signaling_screening`, and exact tag/aliases |
| Present bias | MICRO-63 | Exact current question IDs `42998`, `43002`, `43006`, `43010`, `43014`; exact future/legacy tag or skill aliases |
| Loss aversion | MICRO-64 | Exact current question IDs `42997`, `43001`, `43005`, `43009`, `43013`, `43017`; exact future/legacy tag or skill aliases |
| Framing effects | MICRO-65 | Exact future/legacy framing tag or skill aliases |
| Condorcet/voting cycles | MICRO-66 | `IBP.8`, `identify_condorcet_cycle`, and exact tag/aliases |
| Arrow's theorem | MICRO-67 | `IBP.7`, `apply_arrow_impossibility`, and exact tag/aliases |
| Median voter theorem | MICRO-68 | `IBP.9`, `apply_median_voter_theorem`, and exact tag/aliases |

The current production bank combines present bias, loss aversion, the endowment effect, and the availability heuristic under broad behavioral objective/skill signals, and it has no independently diagnosed framing-effects question. Therefore the current present-bias and loss-aversion records route by immutable question ID. Framing routes only when an exact framing signal exists. Broad parent evidence, `IBP.1`, `IBP.5`, ambiguous `IBP.6`, and unrecognized behavioral questions return no Concept Review instead of arbitrarily selecting MICRO-60 or another sheet.

## Validation and QA

- Manifest build: PASS — 135 PDFs total, including 68 Micro PDFs; 0 hard failures.
- Focused Concept Review integration: PASS — all nine source records, PDFs, canonical filenames, titles, mappings, hashes, and generated package links resolve; the broad parent packages all nine assets.
- Mastery-report Concept Review routing: PASS — 26 cases, including exact objective/skill/question/tag routes and unmatched-evidence suppression.
- Full active Composer suite: PASS — 25/25 validators.
- PDF structural QA: PASS — 9/9 PDFs are valid, one-page, text-selectable files; each contains exactly one Core Idea, recognition section, Watch Out, Worked Example, Check Yourself, and Ready footer. Manifest size/hash checks pass.
- Visual QA: PASS — all nine PDFs were rendered at 180 DPI and manually inspected. No overflow, clipping, awkward page breaks, orphan headings, unreadably small worked-example text, broken symbols, or apostrophe/encoding defects were found.
- Deterministic publishing: PASS — a second generation produced identical SHA-256 hashes for all nine PDFs plus the canonical source, validation, full-library source, manifest, and integration audit (14/14 files unchanged).
- Scope audit: PASS — no existing Concept Review PDF other than the intentionally replaced MICRO-60 changed; MICRO-61 through MICRO-68 are new. No Macro resource, graph asset, question bank, question ID, or learning-objective assignment changed.
- Diff hygiene: `git diff --check` passes. No commit was created.

The manifest audit continues to report four known non-blocking library warnings: legacy orphan/unreachable `MICRO-03`, two diagnosable no-sheet meta concepts, and eight parent concepts covered by children. None was introduced by this split, and the audit reports zero hard failures.

## Files created or changed

### Canonical implementation and generation

- `build/faculty-build-composer/composer-core.js`
- `build/faculty-build-composer/concept-review-runtime.js`
- `build/faculty-build-composer/tools/expand_micro_concept_reviews.py`

### Canonical review data and generated registry outputs

- `build/faculty-build-composer/data/concept-reviews/concept_review_source.json`
- `build/faculty-build-composer/data/concept-reviews/concept_review_validation.json`
- `build/faculty-build-composer/data/concept-reviews/full-library-production/concept_review_source.json`
- `build/faculty-build-composer/data/concept-reviews/manifest.json`
- `build/faculty-build-composer/data/concept-reviews/concept_review_integration_audit.json`

### PDFs

- `build/faculty-build-composer/data/concept-reviews/MICRO-60.pdf`
- `build/faculty-build-composer/data/concept-reviews/MICRO-61.pdf`
- `build/faculty-build-composer/data/concept-reviews/MICRO-62.pdf`
- `build/faculty-build-composer/data/concept-reviews/MICRO-63.pdf`
- `build/faculty-build-composer/data/concept-reviews/MICRO-64.pdf`
- `build/faculty-build-composer/data/concept-reviews/MICRO-65.pdf`
- `build/faculty-build-composer/data/concept-reviews/MICRO-66.pdf`
- `build/faculty-build-composer/data/concept-reviews/MICRO-67.pdf`
- `build/faculty-build-composer/data/concept-reviews/MICRO-68.pdf`

### Validation sources and refreshed generated fixtures/results

- `build/faculty-build-composer/tests/run_concept_review_integration.js`
- `build/faculty-build-composer/tests/run_mastery_report_concept_reviews.js`
- `build/faculty-build-composer/tests/concept_review_integration_results.json`
- `build/faculty-build-composer/tests/mastery_report_concept_review_results.json`
- `build/faculty-build-composer/tests/federal-budgets-debt-production-sample.html` (refreshed embedded Concept Review runtime source only)
- `build/faculty-build-composer/MICRO-60-68-CONCEPT-REVIEW-SPLIT-REPORT.md`

## Unresolved issues

There are no unresolved defects in the MICRO-60–68 resource split. The only architecture limitation is the current question bank's lack of an independently diagnosable framing-effects record and its shared behavioral objective/skill; the deterministic suppression behavior above prevents false routing until such an exact signal exists.
