# Phase 6 Graph-Question Audit Report

Generated: 2026-08-07

## Verdict

**READY FOR BUILD TESTING — FULL PHASE 6 MICRO GRAPH SWEEP COMPLETE**

The graph-rich Phase 6 micro banks were audited using two rules:

1. **Cover-the-graph test:** if the question can be solved completely from the stem, the graph should not be attached merely as decoration.
2. **Answer-from-the-graph test:** if the question depends on the graph, the displayed graph must contain the curves, labels, coordinates, guides, payoff values, or regions needed to answer it without guessing.

## What changed

- Graph attachments before audit: **899**
- Graph attachments after audit: **322**
- Redundant/misleading graph attachments removed: **577**
- Question stems clarified: **22**
- Answer choices changed: **0**
- Answer hashes changed: **0**
- Feedback changed: **0**
- Difficulty/pool routing changed: **0**

### By concept

| Concept | Before | After | Removed |
|---|---:|---:|---:|
| elasticity | 19 | 8 | 11 |
| consumer-and-producer-surplus | 64 | 64 | 0 |
| international-trade-and-trade-policy | 102 | 36 | 66 |
| costs-of-production | 141 | 30 | 111 |
| perfect-competition | 124 | 36 | 88 |
| monopoly | 201 | 12 | 189 |
| monopolistic-competition | 111 | 13 | 98 |
| oligopoly | 137 | 123 | 14 |


## Key corrections

- **Elasticity:** reduced from 19 graph-attached items to 8 genuinely graph-relevant items. Retained stems now explicitly reference the displayed steep/flat, linear-demand, perfect-extremes, or time-horizon supply graph. Midpoint calculations and total-revenue rule questions no longer carry decorative graphs.
- **Consumer & Producer Surplus:** all 64 graph items were retained. The existing labeled-coordinate cleanup already supplies the information required for the surplus calculations.
- **International Trade:** equation-complete and arithmetic-complete country cases no longer carry redundant trade graphs. Graph-dependent tariff, quota, surplus, and selected boss cases retain their visuals. Two stems that incorrectly referred to “stated equations” were corrected to tell students to use the displayed graph.
- **Costs of Production:** company-specific calculations such as Summit Glassworks no longer display unrelated cost curves when all TFC, wage, labor, output, or TC values are already in the stem. The exact screenshot problem is therefore removed. Generic cost-curve interpretation items remain graphical.
- **Perfect Competition:** benchmark-limitations, stand-alone calculations, and verbal cost shocks no longer carry generic firm graphs. Profit/loss/shutdown, market-firm, entry/exit, supply-segment, and long-run graph analysis remains graphical.
- **Monopoly:** equation-driven monopoly calculations no longer receive generated graphs as decoration. The 12 retained graph questions are direct monopoly graph-reading items involving Q1, P1, ATC/AVC, shutdown, welfare, and MR=MC.
- **Monopolistic Competition:** arithmetic questions that state Q1, Q2, P, ATC, or MC directly are now text-only. Long-run graph interpretation remains graphical.
- **Oligopoly:** payoff matrices, concentration-share charts, game trees, cartel graphs, and kinked-demand displays remain where students must read them. Generic strategy-theory items no longer receive an unnecessary matrix.

## Visual sufficiency review

The retained graph families were checked against the current contact sheets/assets. Retained quantitative graph questions use labeled coordinates/guides, readable payoff cells, labeled market shares, or clearly marked curve relationships. Questions that required unsupported eyeballing were converted to text-only when the stem already supplied the needed data rather than forcing students to reverse-engineer a graph.

## Validation

Every Phase 6 concept passes its composer validation after the audit. The following combined builds also pass all five modes (Standard, Timed, Exam, Legendary, Score Attack):

- Firms & Market Structure combination
- Elasticity + Consumer/Producer Surplus + Trade combination
- All eight Phase 6 micro graph-rich concepts together

Answer verification passes with **0 failures**. Asset verification passes with **0 missing files or hash mismatches**.

Current library SHA-256: `abac304dfcfa9fa83ac8b082449b8d51921c8cf40f17c569e54f5b86621b9a56`


## Post-audit Costs rebuild

Phase 6.2e Costs of Production was subsequently rebuilt with six title-free canonical figures and 72 new graph-dependent items. Two previously retained cost-shift scenario attachments were converted to text-only. Current Costs graph coverage is **100** items, and current graph coverage across the eight Phase 6 graph-rich micro concepts is **392** items. See `PHASE6_2E_COST_GRAPH_EXPANSION_V2_REPORT.md` for the current Costs-specific validation.
