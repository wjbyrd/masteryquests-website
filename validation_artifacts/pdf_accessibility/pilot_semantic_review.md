# Pilot source, visual and semantic review

Task: PDF_ACCESSIBILITY_REPO_LOCK_V1. Review method: assistant inspection of Poppler-rendered current sheets and decoded tag transcripts, compared with canonical instructional JSON. This is **not a human screen-reader test**.

Eight sheets were inspected. All seven experimental outputs preserve exact extracted text, page boxes and rendered pixels. Every source paragraph and list item is retained in the demonstrated reading sequence: title, discipline/code, time/outcome/difficulty, core idea, recognition list, warning, worked-example heading, figure or formula card, worked prose, self-check, and closing instruction. Metadata is not lost. Source grouping prevents axis labels from interleaving with worked prose. PDF extraction order remains the original stream order; assistive reading order is the tag-tree order. `/Tabs /S` is set, but these PDFs have no interactive link annotations. Printed “Return to the game” was not converted into a guessed hyperlink.

| Sheet | Actual structure and review | Unresolved release requirement |
|---|---|---|
| GEN-ECON-01 | Plain text, H1/H2 hierarchy, four list items, metadata and self-check. No instructional graph. | Human reader/AT review; collection-wide visual assessment remains incomplete. |
| MICRO-04 | Demand graph: C=(30,12), B=(60,8), A=(90,4); price/quantity axes, line intercepts and guides inspected. Worked midpoint percentages and self-check preserved. | Mixed inline equations/fractions need explicit Formula semantics and spoken equivalents. |
| MICRO-49 | Genuine two-by-two payoff table in a bitmap. Caption says payoff order (Row firm, Column firm); columns X,Y; rows A,B; cells (9,9), (2,3), (3,2), (7,7). Canonical cell data captured without OCR. | No output: current tagger lacks content-linked TH/TD associations. A whole-table Figure alternative would not provide table navigation. |
| MICRO-54 | Current fast-fashion graph checked: MPC/MPB market intersection 240 million at $12; MSC/MPB efficient intersection 160 million at $15; $6 marginal external cost; current axes and tick values described. | Helvetica/Helvetica-Bold font programs missing; inline comparison/equation semantics; text contrast. |
| MACRO-23 | Dedicated corrected curved MD graph: MS1=2,500 at a with 1/P=2; MS2=5,000 at b with 1/P=1. Current worked fractions and 100% price increase retained. | Mixed inline Formula semantics and actual AT pronunciation. |
| MACRO-24 | Same fingerprint reviewed in the monetary-neutrality context. Current corrected fixed-V/Y prose and long-run distinction retained. | Mixed inline Formula semantics and actual AT pronunciation. |
| MACRO-29 | Both panels reviewed: MS2 left of MS1, r2 above r1; AD2 left of AD1, Y2 left of Y1 at P1. No numerical magnitudes invented. | Actual AT handling of subscripts/variable labels and complete formula-pattern coverage. |
| MACRO-42 | Five existing formula-card lines tagged individually as Formula with spoken alternatives. Their exact original visible bytes remain. Worked saving arithmetic and signs retained. | Helvetica embedding, inline formulas outside the card, and 13-point heading contrast. |

The quantity-theory alternatives in the older source metadata included an equation not printed on the graph. The pilot's canonical description instead names the displayed axes, curves, points and values. The active source/PDF economics was not changed. No old money graph was substituted. Pilot descriptions rely on names, positions and labels rather than color alone.

Decorative branding and repeated section icons were reviewed and fingerprint-allowlisted only for these pilot layouts. No meaningful block is deliberately artifacted. All unknown text or images are rejected. This review does not establish correct descriptions for unreviewed library figures. Comprehensive table/formula classification outside the pilot remains pending.

The unchanged later renderer uses #008F95 text on #EAF7F7 at 13-point bold for certain headings: calculated contrast 3.570012991246963:1, below the 4.5:1 normal-text threshold. Other page/graph contrast has not received complete quantitative review. Dense body text and raster figure zoom/reflow need owner evaluation. No palette redesign, font replacement, OCR or page-size change was performed.

Decision: **pilot not sound enough for batch**. Preserve candidates as experimental evidence; do not install or publish them.
