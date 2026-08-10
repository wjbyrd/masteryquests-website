# Phase 6.2e Costs of Production — Current Validation Report

## Final verdict

**READY FOR PLAYTEST — GRAPH EXPANSION V2 INTEGRATED AND VALIDATED**

The Costs of Production standalone bank now includes the six title-free canonical figures `COST-01` through `COST-06` and 72 additional graph-dependent questions. Two older shift-scenario questions were converted to text-only because the reasoning is clearer without a decorative before/after curve graphic.

The instructional boundary remains locked: costs and production are taught before competitive-firm profit maximization, shutdown, entry, and exit.

## Current bank structure

- Easy: 44
- Medium: 46
- Hard main: 46 plus 30 dedicated calculation items (76 hard-routed total)
- Elite: 42
- Legendary: 98
- Repair: 20
- Bridge: 20
- Checkpoint One: 20
- Checkpoint Two: 20
- Final Checkpoint: 20
- Legendary Boss: 36
- **Total canonical Costs questions: 442**

The graph expansion added 72 questions: 14 easy, 16 medium, 16 hard, 12 elite, 8 legendary, and 6 checkpoint items.

## Graph layer

- Graph-linked questions before the full graph audit: 141
- Graph-linked questions immediately after that audit: 30
- Existing fixed-cost-shift and variable-input-shift scenarios converted to text-only: 2
- Pre-expansion graph layer after those conversions: 28
- New graph-dependent questions added in v2: 72
- **Current graph-linked questions: 100**
- Existing Costs assets retained: 59
- New canonical graph assets: 6
- **Current Costs assets: 65**

New canonical figures:

- `COST-01`: MC, AC, AVC with Q=25/Q=50 landmarks
- `COST-02`: MC, AC, AVC scale variant with Q=200/Q=400 landmarks
- `COST-03`: TFC, TVC, TC with A/B/C at Q=120
- `COST-04`: total product
- `COST-05`: average product and marginal product
- `COST-06`: long-run average cost

## Graph-question standards

Every new graphical item was authored against the two locked standards:

1. **Cover-the-graph:** the item requires a coordinate, curve location, labeled point, turning point, slope region, or other information visible in the figure.
2. **Answer-from-the-graph:** numerical items use explicit/readable values or deliberately broad approximations rather than unsupported eyeballing.

No new graph item imports market price, MR=MC, shutdown, entry/exit, or competitive-firm profit decisions into Costs of Production.

## Static authoring audit

- New question count: 72
- Exact duplicate stems involving new items: 0
- High-overlap near-duplicate flags: 0
- Answer-hash failures: 0
- Four-unique-option failures: 0
- Correct-answer positions: 18 in each of positions 1–4
- Correct/distractor mean-length ratio: 0.993
- Neighboring perfect-competition/profit-decision violations: 0

## Runtime validation

Costs-only composer validation: **PASS**

- Composer errors: 0
- Composer warnings: 0
- Answer audit: 442/442 passed
- Asset audit: 65 assets, 0 issues
- Standard Campaign: PASS
- Timed Trial: PASS
- Exam Drill: PASS
- Legendary Mode: PASS
- Score Attack: PASS
- Checkpoint coverage: 20 / 20 / 20

Combination regression:

- Firms & Market Structure starter combination: PASS in all five modes
- Principles Micro Core combination: PASS in all five modes
- Combined answer-hash audits: PASS
- Combined asset audits: PASS
- Legacy recipe regression: 8/8 PASS

## Library state

- Composer concepts: 72
- Canonical questions across library: 6062
- Library assets: 382
- Library version: `phase6.2i-oligopoly-rich-bank-v1-costs-graph-v2`
- Library SHA-256: `3f538463c899d8d6e936dde5604ecd5745ec51c071d62b1f10bdfa1f1c0339e5`

## Historical simulation note

The original Phase 6.2e bank underwent the earlier 20,000-session simulation and persistence suite before this graph expansion. Those historical simulation figures apply to the pre-expansion 370-question bank and are not restated as if they covered the 72 new questions. The current v2 expansion has passed structural, answer, asset, routing, mode, starter-combination, and legacy-recipe validation. A human browser/mobile playtest remains the appropriate next check before production.
