# Pilot source, semantic and rendered-page review

Task: PDF_ACCESSIBILITY_PILOT_BLOCKERS_V1. Reviewer: Codex source/structure/render review. Actual human assistive-technology test: PENDING.

All eight current pilot pages were rendered with Poppler at 1400 pixels and inspected. Title, metadata, section headings, lists, watch-out, worked example and self-check remain in source order. Inline Formula children interrupt and resume their owning P/LBody; they do not replace entire paragraphs. The decoded transcript records source text and spoken alternatives separately, without adding a duplicate paragraph reading.

GEN-ECON-01: plain text, one H1 and six H2 sections, four genuine list items; no informative graph/table/formula.

MICRO-04: five list items, midpoint definition and worked ratio, two point-coordinate expressions, currency and percentage runs. Numerator 66.7 percent, denominator 40.0 percent, result 1.67. The graph keeps C (30,12), B (60,8), A (90,4), with the original axes and intercepts. No graph values or answers were added.

MICRO-49: caption states payoff order (Row firm, Column firm); column headers X/Y and row headers A/B. Rows contain (9,9)/(2,3), then (3,2)/(7,7), retaining spaces and punctuation in canonical cell strings. Table has three structural rows and three columns including header row/column and the blank corner, with four data cells. TH scope, header IDs, ID tree and TD Headers associations are checked. Each actual painted image region is linked to its own cell/caption; the image itself is unchanged. A 197-pixel antialias difference is confined to one vertical matrix-border edge at the review rendering size. Values, labels and geometry remain visually intact. Real reader table navigation awaits owner testing.

MICRO-54: inequalities MSC > MPC, MPB > MSB, MSB > MPB and MPC > MSC, and the worked equalities are separate Formula runs. The external-cost graph retains the $6 gap, market (240 million,$12), efficient (160 million,$15) and 80 million overproduction. Embedded Vera changes wrapping; all source characters and numbers remain. The Time and Outcome values were moved slightly right to preserve label separation with the new font. Heading colors darkened; no graph image changed.

MACRO-23/MACRO-24: MV = PY explicitly reads V as velocity. Value of money is one divided by P. The reciprocal calculations remain 1/2 = 0.50 and 1/1 = 1.00, 100 percent increase. The actual dedicated graph retains M 2,500 to 5,000 and value of money 2 to 1. Its shared description is fingerprint-bound. The old 2 to 1.5 graph was not used. MACRO-24's Formula can span a visual line break while remaining a single logical Formula element.

MACRO-29: the two panels preserve MS1 to MS2, r1 to r2, AD1 to AD2, and Y1 to Y2 at P1. Accessible run alternatives identify the variable labels. No numeric magnitudes were invented. Existing black border below the source graphic remains unchanged.

MACRO-42: all five formula cards and 25 inline expressions/scalars are represented. Private saving Y-T-C, public saving T-G, national saving Y-C-G, closed S=I and open S=I+NCO/NX remain distinct. Negative $110/$50 and the worked $40 results retain their signs. The font is embedded; all original text sizes are preserved in the final candidate. The worked-heading width allowance increased from 474 to 479 points within the existing box to retain 12.2-point text. Body line wrapping changes are justified by the font replacement; no clipping or omitted text was seen.

Figures occur before their related worked paragraphs in the assistive sequence. Axis labels do not interleave with worked text. Image identity is checked independently of alternative existence. Printed return instructions remain text; these pilot PDFs have no link annotations. Keyboard traversal/reflow/reader pronunciation remain owner tests, not claims derived from extraction.

The font dependency and exact color ratios are in font_dependency.json. All 35 inherited layout-family records have glyph coverage in both bundled fonts; only the two pilot family sheets were generated. Individual layout/semantic validation is still required when any remaining sheet is later authorized.
