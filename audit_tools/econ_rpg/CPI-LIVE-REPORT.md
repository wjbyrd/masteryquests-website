# CPI LIVE — implementation and QA

2026-09-23. Private instructor preview; no deployment or push.

## Route and files

Route: `/games/cpi-live/`, served from `audit_tools/econ_rpg/game/games/cpi-live/` by the existing loopback preview server. The private Games library now has eight cards. Public navigation, production games and deployment configuration are unchanged; the existing production build excludes `audit_tools/` and the new publication check explicitly excludes CPI LIVE identifiers.

New game files:

- `config.js`: working title, route, description, fixed basket, authored pools, rounding/tolerances, motion duration and local-history retention.
- `engine.js`: pure arithmetic, seeded pool selection, guarded phase transitions, numeric parsing and corrective feedback.
- `view.js`: receipt, calculation controls, comparison reveal, analyst draft, timelines and concise results.
- `app.js`: DOM events, focus, receipt/counter updates and local event recording.
- `telemetry.js`: anonymous local-only run history, matching GDP Live's 20-run retention convention.
- `index.html`, `cpi-live.css`: semantic shell, shared Mastery Quests design tokens, responsive receipt/dashboard and reduced-motion handling.
- `card.svg`, `card.js`: local vector receipt graphic and library-card configuration binding. Editing `CONFIG.title` updates both the game and card. The generic HTML fallback is not another copy of the working title.

Other changes: one private-library card/module, README inventory/link, library-browser inventory expectation, and CPI-specific publication exclusions. No existing game's runtime, scenario, economics, graph or art was edited.

## Instructional sequence

Ten short checks implement the requested loop:

1. Calculate groceries expenditure and the total base basket. Other component expenditures are supplied to avoid arithmetic drudgery.
2. Reveal base CPI 100 and the CPI formula, then open Year 2 prices and reprice the fixed quantities.
3. Calculate CPI from the completed receipt.
4. Reveal the inflation formula and calculate Year 1 → Year 2 inflation.
5. Distinguish an index level of 108 from annual inflation.
6. Predict which isolated shock matters more, then reveal both expenditure effects. An incorrect prediction permits correction after the reveal.
7. Repair one randomly selected analyst error.
8. Calculate Year 3 annual inflation in a separate CPI timeline.
9. Interpret the change in the annual rate. Disinflation is explained with a computed example even when the selected path demonstrates acceleration, stability or deflation.
10. Interpret the final year's falling CPI while it remains above the base-year level.

Results recap the actual Year 2 household basket, its CPI and inflation, the largest positive **dollar contribution**, first-attempt accuracy, audit completion and timeline results. There is no extra quiz, timer, classification deck or mastery report.

## Fixed basket and calculations

| Item | Fixed quantity | Base unit price | Base expenditure |
|---|---:|---:|---:|
| Rent | 1 | $1,000 | $1,000 |
| Groceries | 10 | $20 | $200 |
| Gas | 40 | $3 | $120 |
| Streaming | 2 | $15 | $30 |
| Haircuts | 2 | $25 | $50 |
| Total | | | **$1,400** |

The deeply frozen configuration is the only source of ordinary basket quantities. Prices and expenditures use integer cents. Item expenditure is quantity × price; basket cost sums the expenditures; CPI is current cost / base cost × 100; inflation is (current CPI − previous CPI) / previous CPI × 100. Contributions are quantity × (new price − base price). Intermediate index/rate values are not rounded before subsequent calculations.

The deliberately wrong quantity in an analyst draft is isolated to that draft. It never updates the student's basket. Regression checks cover all phases and even a stray current-quantity property on a run.

## Authored pools

Five price shocks, each changing only prices:

| Shock | Year 2 prices: rent / groceries / gas / streaming / haircuts | Basket | CPI | Inflation | Largest positive contribution |
|---|---|---:|---:|---:|---|
| Housing pressure | $1,040 / $21 / $3.10 / $16 / $25 | $1,456 | 104.0 | 4.0% | Rent +$40 |
| Fuel pressure | $1,010 / $20 / $3.75 / $15 / $25 | $1,440 | 102.9 | 2.9% | Gas +$30 |
| Food pressure | $1,000 / $23.50 / $3 / $16 / $26.50 | $1,440 | 102.9 | 2.9% | Groceries +$35 |
| Mixed prices | $1,060 / $21 / $2.50 / $14 / $26 | $1,450 | 103.6 | 3.6% | Rent +$60 |
| Service pressure | $1,000 / $20.50 / $3 / $21 / $30 | $1,427 | 101.9 | 1.9% | Streaming +$12 |

Four independent base-basket weighting comparisons:

| Case A | Added spending | Case B | Added spending | Larger CPI effect |
|---|---:|---|---:|---|
| Streaming +40% | $12 | Rent +5% | $50 | B: rent |
| Groceries +10% | $20 | Haircuts +30% | $15 | A: groceries |
| Streaming +40% | $12 | Gas +15% | $18 | B: gas |
| Rent +4% | $40 | Gas +25% | $30 | A: rent |

Five audit cases: changed quantities, equal averaging of price changes, reversed CPI ratio, CPI level mislabeled as inflation, and the wrong comparison period for annual inflation. Each has exactly one intended major error, one accepted diagnosis and a calculated correction. All 25 audit/price-shock pairings are checked, including that an unweighted average does not accidentally equal the correct weighted result within rounding tolerance.

Five timeline pools:

| ID | CPI path, Years 1–4 | Year 2 inflation | Year 3 inflation | Year 3 interpretation | Year 4 inflation |
|---|---|---:|---:|---|---:|
| slower-rise | 100 → 108 → 112 → 109 | 8.0% | 3.7% | Disinflation | −2.7% |
| faster-rise | 100 → 104 → 112 → 110 | 4.0% | 7.7% | Acceleration | −1.8% |
| stable-prices | 100 → 106 → 106 → 103 | 6.0% | 0.0% | Stable price level | −2.8% |
| falling-prices | 100 → 110 → 108 → 105 | 10.0% | −1.8% | Deflation | −2.8% |
| high-level-slow-rise | 100 → 120 → 122 → 118 | 20.0% | 1.7% | High price level, slower inflation | −3.3% |

All final indices remain above 100, making the distinction between falling prices and returning to the base-year price level explicit. Rates and correct classifications come from calculations, not separate hand-entered answer values.

## Numeric acceptance

- Currency accepts standard comma grouping, an optional leading `$`, and decimal cents. Tolerance is half a cent in dollars (`0.005`), which rejects amounts a full cent away from these exact-cent targets.
- CPI displays one decimal. Decimal responses must be within 0.05 index points. The correctly rounded whole-number CPI is also accepted, as requested; the dashboard then shows the calculated one-decimal index.
- Inflation displays one decimal; tolerance is 0.05 percentage points. Optional `%`, signs and the Unicode minus sign are supported. Later-year rates use the preceding year, not a constant denominator of 100.
- Empty, malformed grouping, embedded text, exponential/hex syntax, NaN and infinity are rejected. Raw input text is never inserted into HTML or persisted in telemetry.

## Accessibility and presentation

The white receipt is the visual anchor within the existing navy/teal Mastery Quests dashboard language. Desktop uses receipt and task columns; narrower viewports stack them. The compact desktop rows keep the total and index panel visible alongside the first calculation. The receipt remains structured table content, with a caption, row/column headers, visible fixed quantities and text for price changes.

Native labeled text inputs accept flexible number formatting. Buttons and fields retain 44px+ targets, visible focus and explicit selected/invalid states. Wrong numeric answers return focus to the invalid field with corrective feedback; correct answers disable resolved controls and focus the explanation, with Tab reaching Continue. Stage transitions focus their headings. A single polite, atomic live region announces complete feedback rather than individual counter digits. Receipt-line highlighting respects reduced motion. No new raster or AI-generated artwork is used.

## Local telemetry

Events: `run_start`, `base_basket_attempt/complete`, `price_shock_presented`, `basket_cost_attempt/complete`, `cpi_attempt/complete`, `inflation_attempt/complete`, `index_meaning_attempt/complete`, `weight_prediction`, `weight_reveal`, `weight_complete`, `audit_presented`, `audit_attempt/complete`, `timeline_presented`, `timeline_attempt`, `timeline_step_complete`, `timeline_complete`, and `run_complete`.

Fields include anonymous run ID, selected pool IDs, phase/question, attempt number, correctness/first-attempt correctness, basket/CPI values, inflation, parsed numeric or controlled-option responses and elapsed time. Records use `mq.cpi-live.run.v1.*`, retain at most 20 runs, and do not transmit data. Unavailable storage produces one notice and leaves play functional. Reload starts a new run, matching GDP Live; Play Again resets progress and chooses fresh authored variants.

## QA completed

- **87 unit/regression tests pass** across the existing suite plus eight CPI tests.
- **500 full pool combinations** (5 × 4 × 5 × 5), with wrong-answer correction at every check, immutable fixed quantities, all answers/calculations, score accounting and duplicate-submission guards.
- **22 full keyboard-only browser runs**, covering every authored variant. Wrong-answer/retry runs and a perfect first-attempt run verify results and event counts.
- Viewports: **1366 × 768, 1280 × 720, 768 × 1024, 390 × 844, 320 × 720**, plus actual **200% Chrome zoom** (683 × 384 CSS pixels from a 1366 × 768 browser viewport). Native Tab/Enter play, focus outlines, labels, table semantics, targets, receipt values, results, replay and Return to Games pass.
- Reduced-motion runs and a normal-motion run complete. No horizontal page overflow, missing assets, console/page errors or external requests were observed.
- Existing seven-game library suite passes **14 full keyboard runs** at desktop/200% zoom, including the new eight-card inventory and existing-game regression checks.
- Production build/publication guard and `git diff --check` pass. No push or deployment.

Commands: `node --test audit_tools/econ_rpg/cpi-live.test.mjs`; `node audit_tools/econ_rpg/cpi-live.browser.test.mjs`; existing `mini-game-library.browser.test.mjs` and unit suite. Browser tests use the existing externally configured `PLAYWRIGHT_MODULE`, without new dependencies. Screenshots, browser results and logs are under ignored `tmp/econ-rpg/cpi-live/`.

## Instructional choices / instructor review

The supplied base basket is unchanged. The pools use clean authored prices instead of arbitrary random prices. Formula reveal follows the brief's base-year reveal instruction: after students construct the basket, never on entry. One audit is used per run.

The weighting comparisons and CPI timelines are explicitly **separate examples**; they do not invent item prices or overwrite the student's receipt. Accordingly results label the student's final basket inflation as **Year 1 → Year 2**, and report example timeline rates separately. This is the main implementation clarification to the suggested results design.

No unresolved arithmetic or economic-model defects were found. Instructor review should confirm the ten-check pacing and the intentionally simplified, fixed-basket treatment; it does not claim to reproduce full BLS methodology. Automated semantics and keyboard/zoom checks do not substitute for a listening pass with a screen reader.
