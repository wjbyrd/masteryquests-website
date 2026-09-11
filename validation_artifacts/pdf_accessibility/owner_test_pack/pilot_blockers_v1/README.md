# Repaired eight-document pilot: owner verification

Task: PDF_ACCESSIBILITY_PILOT_BLOCKERS_V1. Status: **PENDING**. No real screen-reader test has occurred. These are experimental local PDFs; do not publish or substitute them for active resources as part of this test.

Record tester, date, operating system/version, PDF reader/version, screen reader/version, settings, filename and result for each check. Open the files in the desktop PDF reader used by your learners. Machine validation, browser inspection and text extraction do not count as this test.

1. Read document title and language. Navigate by headings: title, core idea, recognition, watch-out, worked example, self-check, ready. Confirm metadata such as time/outcome/difficulty is available in the reading sequence.
2. Read continuously through paragraphs and lists. Check that every instructional sentence is present once, list items stay together, and figure labels do not interrupt the worked paragraph.
3. Navigate to each informative figure. Hear its description and verify axes, named curves, points and the values needed for the exercise. Confirm the figure is encountered in the intended sequence before the worked prose.
4. Read prose containing inline formulas. Ordinary prose must resume after each expression. Check numerator/denominator grouping, signs, currency, percentages and variable labels. Check that raw glyph text is not announced again as a duplicate expression.
5. MICRO-49: navigate into the table using the reader's table commands. Confirm column X/Y and row A/B headers. Move by row and column through A/X (9, 9), A/Y (2, 3), B/X (3, 2), B/Y (7, 7). Confirm the caption explains payoff order (Row firm, Column firm), header associations are announced correctly and no whole-image duplicate is read. The structural header row/column include a blank upper-left cell.
6. MACRO-23 and MACRO-24: distinguish velocity V in MV = PY from value of money 1/P. Read 1/2 = 0.50 and 1/1 = 1.00; confirm 2,500 to 5,000 and graph values 2 to 1. MACRO-24 includes a formula crossing a visual line break; it must remain one logical expression.
7. MACRO-42: read all five standalone formula-card expressions and the mixed inline saving identities. Confirm public saving T - G and negative $110/$50 are spoken correctly, with no sign reversal or skipped text.
8. MICRO-54: check inequalities and its $6 external cost, market 240 million at $12 and efficient 160 million at $15. Check that labels, currency and the embedded font remain legible.
9. MICRO-04: check midpoint ratio 66.7% / 40.0% = 1.67 and the point-coordinate expressions. MACRO-29: check both transmission panels and numbered variable labels. GEN-ECON-01 covers basic paragraph/list navigation.
10. Keyboard: navigate pages and document structure without a mouse; verify no trap. These eight files have no link annotations, so link activation is not applicable. Printed 'Return to the game' text is intentionally not a guessed hyperlink. Record unexpected focusable objects or link announcements.
11. Inspect at 100%, 200% and 400% zoom. Check text readability, clipping, graph axes, table borders and contrast. Test the reader's available reflow/reading mode and record any loss of logical order or content.

Use every file in `pdfs/`: GEN-ECON-01, MICRO-04, MICRO-49, MICRO-54, MACRO-23, MACRO-24, MACRO-29 and MACRO-42. Report PASS / FAIL / NOT APPLICABLE for each applicable check, with exact observed and expected behavior. Keep all unperformed checks PENDING. A reader failure requires investigation before a release claim. Representative testing does not prove every future document or reader combination.
