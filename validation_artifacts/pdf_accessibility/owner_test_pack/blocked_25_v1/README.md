# Owner accessibility test pack: blocked-document closeout

Task: PDF_ACCESSIBILITY_BLOCKED_25_V1

Actual human/screen-reader verification: **PENDING**. All 18 files pass the current staged project gate. No installation has occurred. Old packs remain historical evidence.

| Resource | Pattern |
|---|---|
| [GEN-ECON-01](pdfs/GEN-ECON-01.pdf) | Plain prose, headings and recognition list |
| [MICRO-04](pdfs/MICRO-04.pdf) | Inline formulas and repaired C label |
| [MICRO-49](pdfs/MICRO-49.pdf) | Semantic payoff matrix with row/column header associations |
| [MICRO-54](pdfs/MICRO-54.pdf) | Embedded Vera, corrected heading style and repaired MSC label/curve |
| [MACRO-23](pdfs/MACRO-23.pdf) | Velocity versus value of money, exact corrected graph and reciprocal formulas |
| [MACRO-24](pdfs/MACRO-24.pdf) | Monetary neutrality with the same corrected quantity-theory graph |
| [MACRO-29](pdfs/MACRO-29.pdf) | Two-panel monetary-transmission diagram |
| [MACRO-42](pdfs/MACRO-42.pdf) | Standalone formula cards plus inline expressions |
| [MICRO-29](pdfs/MICRO-29.pdf) | Equation within a heading |
| [MICRO-48](pdfs/MICRO-48.pdf) | Concentration bars and HHI arithmetic |
| [MICRO-51](pdfs/MICRO-51.pdf) | Sequential decision tree and branch payoffs |
| [MICRO-60](pdfs/MICRO-60.pdf) | Diagnostic card exposed as a second semantic list |
| [MACRO-52](pdfs/MACRO-52.pdf) | Three-line NCO card definition and full-size title |
| [MACRO-55](pdfs/MACRO-55.pdf) | Joined continuation lines in one logical Formula run |
| [MACRO-57](pdfs/MACRO-57.pdf) | Six-line core paragraph and adjusted recognition spacing |
| [MICRO-16](pdfs/MICRO-16.pdf) | Owner-corrected avocado export-market self-check at Pw=$10 |
| [MICRO-52](pdfs/MICRO-52.pdf) | Owner-accepted kinked-demand example and repaired curve contrast |
| [MACRO-30](pdfs/MACRO-30.pdf) | Repaired AD3 graphical contrast |

Record the operating system, PDF reader and version, screen reader and version, candidate SHA-256, procedure, observed result and any issue. Use a desktop reader that supports tagged PDFs; do not substitute browser text extraction for a screen-reader test.

1. Open GEN-ECON-01. Confirm document title/language, one main title, ordered section headings, complete paragraphs and list navigation. Timing, outcome, difficulty, warning, worked example, self-check and final instruction must be available once.
2. Read MICRO-29 and MICRO-04 in sequence. Confirm heading mathematics and inline Formula runs do not swallow surrounding prose or duplicate it. Verify signs, percentages, fractions, numerator/denominator grouping, currency and variables against the displayed source.
3. On MACRO-23/24, confirm V is velocity in MV = PY; value of money is 1/P. Read money supply 2,500 to 5,000, value of money 2 to 1, and price level 0.50 to 1.00. Check figure reading and formula speech separately; neither should repeat the whole worked paragraph.
4. Read MACRO-29's panels in instructional order. Confirm both axes, curve shifts, point relationships and the transmission chain are understandable without color. Check MICRO-48's five bars and the meaning of aggregate Other. Read MICRO-51's tree from entrant choice through incumbent responses and verify all terminal payoffs.
5. Navigate MICRO-49 as a table, cell by cell, row then column. Confirm X/Y column headers, A/B row headers, and row-firm/column-firm payoff order. Values: A/X (9,9), A/Y (2,3), B/X (3,2), B/Y (7,7). Headers must be announced at the relevant cells. The bitmap must not be read as a second duplicate table or one giant alternative string.
6. Read MACRO-42's five standalone formulas and its mixed prose. Check private/public/national saving and closed/open-economy identities. Read MACRO-52's full NCO definition and MACRO-55's continuation as one logical formula; neither should lose grouping at a line break. Read MICRO-60's diagnostic card as a second genuine list.
7. Read MACRO-57 from the core paragraph into recognition. Confirm the repaired spacing remains clear at 100%, 200% and 400% zoom. On later-layout examples confirm embedded font glyphs, signs and currency remain readable. Inspect MICRO-54's repaired MSC label and curve, including readability at 100%, 200% and 400% zoom.
8. Use keyboard-only navigation. These candidates contain no link annotations or form controls; confirm no unexpected focus stops. Printed “Return to the game” is an instruction, not a fabricated hyperlink. Record PDF-reader navigation and focus behavior separately from logical reading order.
9. Record any clipping, excessive wrapping, missing or duplicated text, unusable graph description, broken formula speech or table header failure. Sampling these patterns does not prove every possible assistive-technology experience across the collection.


10. On MICRO-16 confirm the self-check refers to the avocado export market and Pw=$10, then compare the spoken Formula and visible text.
11. On MICRO-52 check the owner-accepted approximate $36 MC/MR-gap interpretation is understandable. The alternative identifies the worked example interpretation; the graph has not been redesigned. Record any difficulty rather than treating machine validation as an AT result.
12. On MACRO-30 compare labeled AD1/AD2/AD3 visibility; on MICRO-04 and MICRO-54 inspect repaired small labels. Curves, labels and intersections should remain distinct at zoom.

After documenting actual reader/screen-reader results, review the complete 151-resource installation preview and request separate installation authorization. Nothing in this pack itself authorizes installation or deployment.
