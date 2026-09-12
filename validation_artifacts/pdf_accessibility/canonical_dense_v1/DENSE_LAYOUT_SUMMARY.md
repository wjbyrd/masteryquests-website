# Canonical dense-layout summary

## Modes

- CANONICAL_GRAPH_DENSE: graph/text interior columns; source-aware graph proportions and label placement; six-point gap below the worked heading. It never alters the canonical frame, metadata, icons, palette, fonts, card width/radius/stroke or footer.
- CANONICAL_TABLE_DENSE: full-width table, compact row padding, and unchanged explanation beneath. It preserves every cell, header, scope, ID and association.
- CANONICAL_LONG_TITLE: controlled two-line Arimo Bold, centered navy title at 25 pt. It uses the existing long-title allowance and flexible spacing; header, metadata and footer do not move.

## Resource Usage

Accepted: graph dense on MACRO-16 and MICRO-52; table dense on MACRO-20; long-title mode on MICRO-52. Other pilot resources retain their canonical standard modes.

Fit-only dense-table trials, not accepted candidate replacements: MICRO-67, MACRO-07, MACRO-18, MACRO-21, MACRO-24, MACRO-41, MACRO-42. These were attempted only after standard layout failed.

## Typography Floors

Canonical body target: 10.45 pt. Compact body floor: 9.5 pt. Accepted dense bodies are 9.70 (MACRO-16), 9.55 (MACRO-20), and 9.55 (MICRO-52). These are explicit per-resource fit choices, not a blanket shrink applied to the library. Other pilot metadata and headings keep their canonical sizes.

## Graph Minimum Dimensions

MACRO-16: 280 x 120 pt. MICRO-52: 280 x 127 pt. Graph labels are rendered natively at 26 pixels / 3 = 8.667 pt, above the 8.5-point floor. Resizing below the floor is rejected using the actual image display dimensions. All source curve coordinates, legend text, tick values, notes and alternatives are preserved. Dense tick-label leaders separate MICRO-52's close 36/40 values while pointing to their exact positions. Models are captured from the existing maintained graph generator; their SHA-256 is recorded with each graph.

These are tested minimum profiles for the two specified graphs, not a claim that all graphs can use these dimensions. Other graph kinds require their own fit and readability verification.

## Table Minimum Text Size

Floor: 9.5 pt. MACRO-20 uses 29-pixel Arimo at 479.573 / 1439 display scale, approximately 9.665 pt. Each single-line row is 36 pixels, approximately 12.0 pt high. Two-pixel padding and a 32-pixel line pitch reduce whitespace without reducing the font. Total rows keep tint/bold emphasis without extra height. The full table is approximately 479.573 x 119.996 pt; all eight rows and both states remain.

## Long-Title Rules

MICRO-52 retains the full approved title on two centered 25-point lines. The title zone is bounded to y=579..636; metadata ends at y=642.24. Core begins at y=568.326. The minimum in this two-line mode is 25 pt. No title words were removed and no global title-size change was made.

## Spacing Budget

Content-zone totals exclude the fixed header, metadata, title and footer; their heights are listed separately to prevent double counting. Canonical outer coordinates and style tokens are unchanged. Dense interior flow reduces the heading-to-visual gap, uses eight-point flexible section gaps instead of ten, and uses the available space above the fixed footer. The minimum Check Yourself bottom is 70 pt, leaving at least 14 pt above the footer. This adds 7.326 pt to the earlier conservative content budget without moving or changing the footer.

### MACRO-16

| Component | Prior points | Final points |
|---|---:|---:|
| Header (fixed) | 82.080 | 82.080 |
| Metadata (fixed) | 45.360 | 45.360 |
| Title zone | 36 | 36 |
| core | 77.600 | 78.368 |
| recognition | 106.550 | 107.830 |
| watch | 67.350 | 67.606 |
| worked | 160.815 | 158.392 |
| check | 67.350 | 67.606 |
| Flexible section gaps | 40.000 | 32.000 |
| Footer (fixed) | 41.000 | 41.000 |
| Required content-zone total | 519.665 | 511.802 |
| Available content-zone budget | 505.000 | 512.326 |
| Remaining content-zone space | -14.665 | 0.524 |

Final body: 9.70 pt. Check Yourself bottom: 70.524; footer top stays 56.000. Footer separation: 14.524 pt.

### MACRO-20

| Component | Prior points | Final points |
|---|---:|---:|
| Header (fixed) | 82.080 | 82.080 |
| Metadata (fixed) | 45.360 | 45.360 |
| Title zone | 36 | 36 |
| core | 77.600 | 77.792 |
| recognition | 80.740 | 80.932 |
| watch | 67.350 | 67.414 |
| worked | 205.190 | 198.608 |
| check | 55.190 | 55.190 |
| Flexible section gaps | 40.000 | 32.000 |
| Footer (fixed) | 41.000 | 41.000 |
| Required content-zone total | 526.070 | 511.936 |
| Available content-zone budget | 505.000 | 512.326 |
| Remaining content-zone space | -21.070 | 0.390 |

Final body: 9.55 pt. Check Yourself bottom: 70.390; footer top stays 56.000. Footer separation: 14.390 pt.

### MICRO-52

| Component | Prior points | Final points |
|---|---:|---:|
| Header (fixed) | 82.080 | 82.080 |
| Metadata (fixed) | 45.360 | 45.360 |
| Title zone | 57 | 57 |
| core | 77.600 | 77.792 |
| recognition | 80.740 | 80.932 |
| watch | 67.350 | 67.414 |
| worked | 180.015 | 184.592 |
| check | 55.190 | 55.190 |
| Flexible section gaps | 40.000 | 32.000 |
| Footer (fixed) | 41.000 | 41.000 |
| Required content-zone total | 500.895 | 497.920 |
| Available content-zone budget | 491.000 | 498.326 |
| Remaining content-zone space | -9.895 | 0.406 |

Final body: 9.55 pt. Check Yourself bottom: 70.406; footer top stays 56.000. Footer separation: 14.406 pt.

## Pilot Results

8/8 PASS: GEN-ECON-01, MACRO-11, MACRO-13, MACRO-16, MACRO-20, MICRO-49, MICRO-52, GEN-ECON-09. Six regenerated candidates match their maintained-lifecycle rebuild hashes; the two controls retain their existing accepted bytes and determinism evidence. All eight pass explicit PDF/UA-1, semantic and canonical-component checks. The three inherited dense blockers are resolved.

## Human Review Notes

Codex inspected the rendered pilot at equal scale. The labor graph retains equilibrium, wage floor, QD=90, QS=120 and surplus=30. The bank table is readable with complete accounting identities. The kinked-demand graph and two-line title remain balanced, and MC=36 crosses the MR gap. Body text, graph labels, tables and panel boundaries were checked for clipping and overlap. Owner visual approval and actual human AT remain PENDING.

## Wider Batch Status

The conditional batch fit check reached 49 provisional fits and 31 blockers across the 80-resource set. Six fits are the accepted pilot replacements; 43 additional fits are not fully validated/promoted. The 31 blockers are recorded in batch_dispositions.json and domain checkpoints. V4 was not created.
