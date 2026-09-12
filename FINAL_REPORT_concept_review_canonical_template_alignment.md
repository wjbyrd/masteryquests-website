# Concept Review canonical template alignment

## Task Identity
CONCEPT_REVIEW_GEN_ECON_01_TEMPLATE_ALIGNMENT_V1

## Repository
Working directory and Git top-level verified as `C:\Users\Jennings\Documents\GitHub\masteryquests-website`. Branch `main`; baseline HEAD `064362140bb6439d044f1c2aa835d841783f75ae`. Write probe passed. Pre-existing tracked changes and untracked style-restoration work were preserved; the repository was not clean at preflight. Exact initial status is in [preflight.json](validation_artifacts/pdf_accessibility/canonical_template_v1/preflight.json). The forbidden workspace was not accessed. No reset, commit or push occurred.

## Canonical Visual Authority
GEN-ECON-01, accepted staged/review hash `3901424bba74d606a1ead9e6d271e110fdfbd4e13015cb99e0e97b400892f2e0`. Source candidate: `tmp\pdf_accessibility\full_batch_v1\batches\general_01\GEN-ECON-01\after\GEN-ECON-01.pdf`. The current accepted v3 copy and staged source were verified byte-identical.

## Problem
The previous restoration approximated the design with different fonts, metadata icons, colors, geometry and footer treatment. It did not reproduce GEN-ECON-01's component system. Approved economics corrections remain frozen.

## Root Cause
GEN-ECON-01 follows the retained reviewed visual-input path. The prior `qa_template.py` independently reconstructed page components using Vera and simplified vector symbols. This changed text metrics and omitted canonical details such as distinct metadata icons and difficulty dots. Source-aware tagging preserved accessibility but could not guarantee template fidelity.

## Canonical Tokens
Coordinates are PDF points from the bottom-left; RGB values are the actual PDF operands. The specification also retains original Bezier paths, icon bounds, source image fingerprints and font maps.

| Component | Extracted values |
|---|---|
| Page | 612 x 792 |
| Header | x=15.84, y=695.52, w=580.32, h=82.08; rounded upper corners, square lower corners; RGB (0.031, 0.157, 0.373) |
| Logo card | (37.44, 709.20) to (92.16, 763.92); original retained logo |
| Domain title | Arimo Bold 27; baseline 727.1973; x=105.12 |
| Resource card | (449.961, 717.159) to (574.56, 755.96); stroke 1.5; RGB (0.094, 0.816, 0.780); radius 9 |
| Metadata strip | x=29.52, y=642.24, w=552.96, h=45.36; white fill; stroke 0.75; radius 10 |
| Metadata dividers | x=167.82 and 397.47; y=642.99 through 686.85 |
| Time | Retained hourglass; bold 10.3995-point label at x=64.47, baseline 660.0951 |
| Outcome | Retained target; bold 8.55-point label; x=202.02; 10-point leading |
| Difficulty | Bold 9.89925-point label; dots centered (465,663.6), (473.2,663.6), (481.4,663.6), radius 3.05; value 9.55 points |
| Title | Arimo Bold 32; centered; baseline 599.3574; long-title exceptions explicit |
| Icon rail | Center x=50.76; original role-specific artwork; height 38.16; original aspect ratios retained |
| Main sections | Text x=80.44365; Arimo Bold 16.2; teal rule width=503.28, thickness=0.9 |
| Watch / Worked / Check cards | x=79.92, width=503.28; radius 8; stroke=1.05; body inset x~91.77 |
| Card fills and borders | Watch/Check fill RGB (0.918,0.973,0.973), border (0.071,0.686,0.663); Worked white/navy |
| Card headings | Arimo Bold 16; Watch/Check RGB (0.027451,0.560784,0.564706) |
| Body | Arimo Regular 10.45; canonical leading 13.376; measured worked-text variants retained in typography inventory |
| Footer | x=16,y=15,w=580,h=41; radius 8; RGB (0.043137,0.180392,0.403922) |
| Footer contents | White arrow-circle centered (92,35.5), radius 9.5, stroke 1.4; READY? teal 16-point Bold at (109,28.5); return text white 11.5-point Bold at (207,30.3) |
| Rhythm | Measured header/metadata/title positions; 24-point canonical card gaps; content-driven compact exceptions recorded, never silently accepted |

Full extracted paths, image fingerprints, typography inventory and font provenance are in [specification.json](audit_tools/pdf_accessibility/canonical_components/specification.json). See the [canonical audit](validation_artifacts/pdf_accessibility/canonical_template_v1/CANONICAL_TEMPLATE_AUDIT.md).

## Pilot
| Resource | Result |
|---|---|
| GEN-ECON-01 | Accepted canonical control, unchanged |
| MICRO-49 | Accepted unique-Nash/payoff-table control, unchanged |
| MACRO-11 | Experimental: PDF/UA-1 and semantics pass; not promoted |
| MACRO-13 | Experimental: PDF/UA-1 and semantics pass; not promoted |
| MACRO-16 | BLOCKED: Canonical readable layout does not fit MACRO-16: 519.665 |
| MACRO-20 | BLOCKED: Canonical readable layout does not fit MACRO-20: 526.0699999999999 |
| MICRO-52 | BLOCKED: Canonical readable layout does not fit MICRO-52: 500.895 |
| GEN-ECON-09 | Experimental: PDF/UA-1 and semantics pass; not promoted |

The six affected pilot resources were attempted; GEN-ECON-01 and MICRO-49 were unchanged controls. Three experimental pages were generated, tagged and rebuilt deterministically. They passed measured component checks, exact frozen-text comparison, semantic checks and explicit veraPDF PDF/UA-1. They are not accepted replacements.

The pilot gate is BLOCKED. At the current prototype's minimum 9.5-point body and compact spacing, MACRO-16 requires 519.665 points against a 505-point budget; MACRO-20 requires 526.070 against 505; MICRO-52 requires 500.895 against 491 after its two-line title allowance. A graph/text arrangement that reduces the graph to a narrow column is also unacceptable because labels become too small. These are unresolved renderer implementation issues, not proof that the frozen content cannot fit any suitable canonical composition.

Following the pilot restriction, no 80-resource batch was started. Required follow-up: implement and verify readable dense graph/table interiors and the long-title exception, rerun the complete pilot, then adopt the shared renderer and batch only the affected 80. No content simplification is authorized by this report.

[MACRO-11 equal-scale comparison](validation_artifacts/pdf_accessibility/canonical_template_v1/comparisons/MACRO-11-comparison.png) ? [MACRO-13 comparison](validation_artifacts/pdf_accessibility/canonical_template_v1/comparisons/MACRO-13-comparison.png) ? [all comparisons](validation_artifacts/pdf_accessibility/canonical_template_v1/comparisons.json).

## Renderer Architecture
Added a reproducible extraction tool, exact component specification, retained icon/font inputs, isolated proposed renderer and resumable pilot runner. The proposed renderer is [pilot_renderer.py](audit_tools/pdf_accessibility/canonical_components/pilot_renderer.py); it is not connected to the accepted candidate lifecycle. The operational `qa_template.py` is byte-identical to its preflight version, protecting existing regeneration while the pilot is blocked. This is preparatory work toward one canonical system, not a completed migration or a second adopted semantics system.

## Metadata Strip Alignment
The three generated prototypes use the canonical white container and dividers, retained hourglass and target, bold field labels and three difficulty dots. PDF-object checks verify image pixels, bounds, label fonts, dot geometry and container paths. Negative tests reject a substituted generic target, missing dots and changed strip geometry.

## Section/Icon Alignment
Prototypes use the original section artwork, canonical rail x/scale, Arimo hierarchy and main content edge. The icons were extracted directly, not redrawn by approximation.

## Panel Alignment
Watch Out, Worked Example and Check Yourself retain canonical x/width, radius, stroke and fill. Tests inspect actual PDF curves, including radii; plain-text substitutions fail. Table cells remain real Table/TR/TH/TD structures after tagging. GEN-ECON-09's experimental table preserves all values, row/column associations and reading order.

## Footer Alignment
The original footer vector geometry, white arrow-circle, teal READY? treatment and return-text font/position are reproduced. Actual PDF paths, colors and fonts are checked. A different footer fill fails the regression.

## Typography / Spacing Alignment
Retained Arimo outlines replace the approximation only inside isolated experimental pilots. MACRO-11 and MACRO-13 use 10.45-point body text; GEN-ECON-09 uses an explicit 9.55-point compact exception. The pilot does not authorize arbitrary whole-page shrinking. Dense layouts and MICRO-52's long title remain blockers.

## Content Preservation
No maintained instructional source or accessibility semantics were changed in this task. All 151 current source-record and semantic hashes match accepted v3 validation evidence. All 151 accepted candidate files and v3 review copies remain unchanged. The three experimental PDFs have exact normalized v2/v3 text. MICRO-49 remains the corrected unique-Nash candidate, with B/Y=(1,1), strict dominant A and X, and only (A,X) identified as the Nash equilibrium. Its PDF was reopened visually. No mixed-strategy material was added. Removed graphs remain removed; all approved graphs/tables and other fixes remain in the existing accepted collection.

## Accessibility Preservation
Three experimental candidates pass veraPDF 1.28.2 with explicit `--flavour ua1`; their semantic inspections have no errors. They retain PDF 1.7, embedded fonts and source-aware structure, including GEN-ECON-09's semantic table. [Raw validator evidence](validation_artifacts/pdf_accessibility/canonical_template_v1/verapdf.json) and [pilot results](validation_artifacts/pdf_accessibility/canonical_template_v1/pilot_results.json). This does not validate the three blocked layouts or approve the full pilot. Human AT remains pending.

## Determinism
- MACRO-11: candidate and rebuild `45eb61150b288f5fea35a3846bcae636a064bdc01abcc318c07a1316a0bcb8b7`.
- MACRO-13: candidate and rebuild `8597af794f3447fe6b95911413ea7a5d24d9a4d6df939c91259675966e38ace4`.
- GEN-ECON-09: candidate and rebuild `d9d39864adca2edc30126cb45094d0ff72e25e3a54482a02ef93f6b6f725cdfe`.

## Regression
46/46 focused tests pass: six new canonical-component/negative tests plus 40 existing instructional, semantic-table and renderer tests. [Results](validation_artifacts/pdf_accessibility/canonical_template_v1/tests.json), [full log](validation_artifacts/pdf_accessibility/canonical_template_v1/tests.txt). No claim is made that the entire canonical-template gate passes. Composer was not rerun because the pilot stopped before shared renderer adoption or package integration; its prior result is not represented as a new run.

## Full Staged Gate
Existing v3 collection rechecked: **151/151 ACCEPTED**, using its unchanged candidates and review evidence. Source, semantic, candidate and raw-validator hashes were rechecked for every resource. [Existing-v3 gate](validation_artifacts/pdf_accessibility/canonical_template_v1/existing_v3_gate.json). This is preservation of the prior accepted collection, not completion of the requested aligned collection. No unaffected candidate was regenerated.

## Canonical Template Fidelity Gate
**BLOCKED — full pilot incomplete.** Three experimental prototypes pass the implemented object-measured component tests; the 80-resource applicability gate was not run or declared passed. Equal-scale renders were inspected for the generated pages. Remaining graph/table readability and fit failures prevent batching.

## V4 Owner Review Package
**Not created.** The requested destination is `C:\Users\Jennings\Documents\GitHub\masteryquests-website\validation_artifacts\concept_review_owner_review\v4\`. Publishing 151 copies there would falsely imply a completed alignment. Experimental evidence is at `C:\Users\Jennings\Documents\GitHub\masteryquests-website\validation_artifacts\pdf_accessibility\canonical_template_v1\`.

## Installation Preview
The accepted v3 preview is unchanged. No preview was refreshed to unaccepted prototype hashes; no installation was executed.

## Production State
UNCHANGED. 974 protected files verified unchanged, including active production authorities. No production PDF, active manifest, graph source, canonical instructional source or canonical semantics was modified. No deployment, installation, missing-public-PDF creation, commit or push. [Preservation evidence](validation_artifacts/pdf_accessibility/canonical_template_v1/preservation.json).

## Human AT
PENDING. Owner visual approval is also pending.

## Final Status
CANONICAL TEMPLATE ALIGNMENT PARTIAL — FOLLOW-UP REQUIRED
