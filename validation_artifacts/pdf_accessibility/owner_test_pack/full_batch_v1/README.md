# Full-batch owner accessibility test pack

Task: PDF_ACCESSIBILITY_FULL_BATCH_V1

Actual human / assistive-technology verification: **PENDING**. No screen-reader/PDF-reader combination was tested here. The 13 PDFs in `pdfs/` passed the documented machine, semantic and visual checks. Two retained pilot PDFs are under `blocked_diagnostics/`: MICRO-04 and MICRO-54 now have graph-label contrast findings. They are provided for diagnosis, not release approval. This is a documented expansion of the prior pilot review, not a claim that its machine result changed. All eight pilot resources are retained with their latest candidate bytes.

| Resource | Pattern | Candidate status |
|---|---|---|
| [GEN-ECON-01](pdfs/GEN-ECON-01.pdf) | Plain prose, headings and recognition list | PASS |
| [MICRO-04](blocked_diagnostics/MICRO-04.pdf) | Mixed prose and Formula runs; C label contrast remains blocked | BLOCKED |
| [MICRO-49](pdfs/MICRO-49.pdf) | Semantic payoff matrix with row/column header associations | PASS |
| [MICRO-54](blocked_diagnostics/MICRO-54.pdf) | Embedded Vera and corrected heading style; MSC graph label remains blocked | BLOCKED |
| [MACRO-23](pdfs/MACRO-23.pdf) | Velocity versus value of money, exact corrected graph and reciprocal formulas | PASS |
| [MACRO-24](pdfs/MACRO-24.pdf) | Monetary neutrality with the same corrected quantity-theory graph | PASS |
| [MACRO-29](pdfs/MACRO-29.pdf) | Two-panel monetary-transmission diagram | PASS |
| [MACRO-42](pdfs/MACRO-42.pdf) | Standalone formula cards plus inline expressions | PASS |
| [MICRO-29](pdfs/MICRO-29.pdf) | Equation within a heading | PASS |
| [MICRO-48](pdfs/MICRO-48.pdf) | Concentration bars and HHI arithmetic | PASS |
| [MICRO-51](pdfs/MICRO-51.pdf) | Sequential decision tree and branch payoffs | PASS |
| [MICRO-60](pdfs/MICRO-60.pdf) | Diagnostic card exposed as a second semantic list | PASS |
| [MACRO-52](pdfs/MACRO-52.pdf) | Three-line NCO card definition and full-size title | PASS |
| [MACRO-55](pdfs/MACRO-55.pdf) | Joined continuation lines in one logical Formula run | PASS |
| [MACRO-57](pdfs/MACRO-57.pdf) | Six-line core paragraph and adjusted recognition spacing | PASS |

Record the operating system, PDF reader and version, screen reader and version, candidate SHA-256, procedure, observed result and any issue. Use a desktop reader that supports tagged PDFs; do not substitute browser text extraction for a screen-reader test.

1. Open GEN-ECON-01. Confirm document title/language, one main title, ordered section headings, complete paragraphs and list navigation. Timing, outcome, difficulty, warning, worked example, self-check and final instruction must be available once.
2. Read MICRO-29 and MICRO-04 in sequence. Confirm heading mathematics and inline Formula runs do not swallow surrounding prose or duplicate it. Verify signs, percentages, fractions, numerator/denominator grouping, currency and variables against the displayed source. MICRO-04 remains visually blocked regardless of AT results.
3. On MACRO-23/24, confirm V is velocity in MV = PY; value of money is 1/P. Read money supply 2,500 to 5,000, value of money 2 to 1, and price level 0.50 to 1.00. Check figure reading and formula speech separately; neither should repeat the whole worked paragraph.
4. Read MACRO-29's panels in instructional order. Confirm both axes, curve shifts, point relationships and the transmission chain are understandable without color. Check MICRO-48's five bars and the meaning of aggregate Other. Read MICRO-51's tree from entrant choice through incumbent responses and verify all terminal payoffs.
5. Navigate MICRO-49 as a table, cell by cell, row then column. Confirm X/Y column headers, A/B row headers, and row-firm/column-firm payoff order. Values: A/X (9,9), A/Y (2,3), B/X (3,2), B/Y (7,7). Headers must be announced at the relevant cells. The bitmap must not be read as a second duplicate table or one giant alternative string.
6. Read MACRO-42's five standalone formulas and its mixed prose. Check private/public/national saving and closed/open-economy identities. Read MACRO-52's full NCO definition and MACRO-55's continuation as one logical formula; neither should lose grouping at a line break. Read MICRO-60's diagnostic card as a second genuine list.
7. Read MACRO-57 from the core paragraph into recognition. Confirm the repaired spacing remains clear at 100%, 200% and 400% zoom. On later-layout examples confirm embedded font glyphs, signs and currency remain readable. MICRO-54's darkened section headings are improved, but the graph-label blocker is unresolved.
8. Use keyboard-only navigation. These candidates contain no link annotations or form controls; confirm no unexpected focus stops. Printed “Return to the game” is an instruction, not a fabricated hyperlink. Record PDF-reader navigation and focus behavior separately from logical reading order.
9. Record any clipping, excessive wrapping, missing or duplicated text, unusable graph description, broken formula speech or table header failure. Sampling these patterns does not prove every possible assistive-technology experience across the collection.

Do not authorize installation of the partial collection from this pack. First resolve the 25 documented candidate blockers, refresh affected evidence, complete the owner checks, and separately review the full installation authorization.
