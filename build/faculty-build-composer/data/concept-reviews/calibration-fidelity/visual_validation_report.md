# Calibration Fidelity Validation

Overall result: **PASS**

GEN-ECON-01 remained the unmodified benchmark. All five revised PDFs use the same measured header bounds, corner path, logo bounds, discipline anchor, and badge geometry.

## Actual body font sizes (points)

| PDF | Core | Recognize | Watch | Worked | Check |
|---|---:|---:|---:|---:|---:|
| GEN-ECON-11 | 10.45 | 10.35 | 10.45 | 10.45 | 10.45 |
| MACRO-01 | 9.55 | 9.60 | 10.45 | 10.45 | 10.45 |
| MACRO-17 | 9.55 | 9.60 | 10.45 | 10.45 | 10.45 |
| MICRO-04 | 9.20 | 9.50 | 9.70 | 9.50 | 10.45 |
| MICRO-21 | 10.45 | 10.35 | 10.45 | 10.45 | 10.45 |

## Graph dimensions

| PDF | Width × height (pt) | Usable-width share | Vertical occupancy |
|---|---:|---:|---:|
| MICRO-04 | 216.000 × 145.148 | 45.07% | 85.00% |
| MICRO-21 | 216.000 × 142.290 | 45.07% | 85.00% |

## Scope and accessibility note

The five PDFs are one-page, selectable-text documents with `/Lang en-US`. Graph alt text remains in the review source data and each graph has a visible connected explanation. The current ReportLab path does not create tagged Figure structure elements with `/Alt`; no PDF/UA claim is made.

Detailed per-page header, typography, bullet, graph, structural, and manual visual checks are in `visual_validation_report.json`.
