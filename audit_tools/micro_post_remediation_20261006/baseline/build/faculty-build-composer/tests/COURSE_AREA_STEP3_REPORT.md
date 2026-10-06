# Faculty Build Composer — Step 3 Course-Area Report

Status: **PASS**

## Course-area audit

| Area | Eligible | Visible with All | Parents | Children/subtopics | Ready | Supporting |
|---|---:|---:|---:|---:|---:|---:|
| General Economics | 13 | 13 | 1 | 0 | 7 | 6 |
| Microeconomics | 80 | 80 | 8 | 54 | 53 | 27 |
| Macroeconomics | 54 | 54 | 1 | 0 | 48 | 6 |

Counts preserve the existing convention that parent and child cards are counted separately. The optional Macro checkpoint supplement is not counted as a normal concept card.

## Root cause and metadata corrections

The failure was both data and implementation:

1. The browser used hard-coded General and Micro ID sets.
2. Every concept absent from both sets fell through to Macro.
3. Thirty-six newer Micro family children were absent from the Micro set, so their effective area was incorrectly `macro` even though their Concept Review discipline was `micro`.

All 36 records changed from `areas: ["macro"]` to `areas: ["micro"]` because each is a child of a Micro-only family:

- Costs of Production (10): `economic-costs`, `profit-concepts`, `short-run-production`, `cost-components-schedules`, `average-costs`, `marginal-cost-production-linkages`, `short-run-cost-curves`, `sunk-avoidable-costs`, `long-run-average-cost-scale`, `minimum-efficient-scale`.
- Perfect Competition (8): `competitive-market-price-taking-revenue`, `competitive-output-choice`, `competitive-profit-loss`, `competitive-shutdown`, `competitive-short-run-supply`, `competitive-entry-exit-long-run`, `competitive-industry-cost-conditions`, `competitive-efficiency-limits`.
- Monopoly (7): `monopoly-power-barriers`, `monopoly-demand-revenue`, `monopoly-output-price`, `monopoly-profit-loss-shutdown`, `monopoly-welfare-efficiency`, `natural-monopoly-regulation`, `monopoly-price-discrimination`.
- Monopolistic Competition (5): `mcomp-structure-differentiation`, `mcomp-short-run-choice`, `mcomp-entry-exit-long-run`, `mcomp-advertising-nonprice`, `mcomp-efficiency-variety-limits`.
- Oligopoly (6): `oligopoly-structure-concentration`, `oligopoly-game-theory-foundations`, `oligopoly-collusion-cartels`, `oligopoly-dynamic-strategy`, `oligopoly-rivalry-coordination`, `oligopoly-welfare-policy`.

The complete record-by-record table, including display names and reasons, is in `course_area_metadata_corrections.json`.

## Filter implementation

`course-area-model.js` is the authoritative area/discipline source. It provides `isConceptVisibleForArea(concept, activeArea)` and derives family-child eligibility from explicit parent metadata.

Filter order:

1. Active course area.
2. Area-eligible, card-visible concepts.
3. Search.
4. All / Ready / Supporting subfilter.
5. Render and update visible counts.

Switching areas preserves shared concepts that are valid in the destination area and removes incompatible selections. Applying a starter resets stale search/subfilter state so every preset selection is visible.

## Accent system

- General: `#2a8f8a`
- Micro: `#9fc4df` (existing Micro strip color preserved)
- Macro: `#8f3f4d`

All use a 4px left border through `.concept-card[data-discipline="general|micro|macro"]`. The card background is unchanged. Textual discipline labels remain on every card.

## Validation

- Course-area cases A–L: 12/12 PASS.
- Browser QA: PASS; no console warnings/errors.
- Mobile 390 × 844: PASS; no horizontal overflow.
- Step 1 Concept Review packaging: PASS, including 120 PDFs and the full-library package.
- Step 2 Mastery Report Concept Review routing: 16/16 PASS.
- All ten modes remain present in the generated-build regression case.
- Canonical concepts unchanged: 126; ordered-ID SHA-256 `9aff9af3b239d01b1f24d37c8a1404b92d8308a978dcc250929f7f29789e931f`.

## Scope

This step did not modify the Mastery Report 2.0 UI, Concept Review PDFs or routing semantics, game engine, scoring, mastery thresholds, question pools, adaptive routing, Repair/Bridge, public website pages, See It in Action evidence, navigation, or downloadable resources.
