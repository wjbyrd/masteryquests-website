# First Quest refinement — October 10, 2026

Implemented in the existing game. No other mini-game or Second Quest research/uncertainty rules were changed. No public deployment performed.

## Experience

- **Opening:** reduced two-line serif title, existing illustrated cards, one brief statement using the generated capital budget, and Take Your Seat. Removed game number, timing estimate, quest previews, and redundant metadata. Fits without vertical scrolling at 1366 × 768 and 1440 × 900.
- **Drafting:** six consistent compact cards in a 3 × 2 grid beside the portfolio. All cards and commit controls fit in those desktop viewports. Cards show distinct project art, name, actual cost and NPV, and one Inspect Proposal action. Funded badges and compact removable portfolio entries preserve reversible drafting.
- **Responsive layout:** tablet uses two columns; mobile shows one proposal with visible Previous/Next buttons and a live position announcement. Budget and portfolio remain adjacent to the card area. No swipe requirement or fixed overlays.
- **Proposal:** retained familiar modal and expandable financial data; removed redundant funding instructions. Duration and scenario rate are visible, with an optional brief discount-rate explanation. Essential desktop controls fit without internal scrolling; expanded details and small screens can scroll within the dialog.
- **Results:** capital invested, remaining capital, and combined NPV; labeled comparison bars sharing a real zero baseline; compact funded/optimal project tiles; an actual opportunity-cost takeaway. Negative values extend left of zero; zero portfolios remain zero. Detailed economics and transfer material are in four closed accordions. Continue to Second Quest is prominent; Review First Quest is available during the second quest and final review without changing game state.

## Generation and financial validation

The library contains **20 proposals**, each with its own illustration, cost, cash-flow pattern, duration, and operating assumption. Each seed draws six distinct proposals and varies installation configuration, operating volume/savings, a two-to-five-year schedule, a $200,000–$300,000 budget in $25,000 steps, and a common rate of 8%, 10%, or 12%.

NPV is always recomputed from actual initial cost and annual cash flows. Quotes are rounded to $5,000 and cash-flow forecasts to $1,000 during scenario construction; NPV and optimization then use full precision. Cards, modals, totals, and results use the same project-value calculation. The model charges no additional discount-rate opportunity cost.

Candidates must have at least three positive-NPV proposals, multiple affordable combinations, and insufficient capital to fund all positive-NPV projects. A seeded portion also requires a worthwhile combination that excludes the highest-NPV individual proposal. Generation stops after **60 attempts**, then uses one of **three validated fallback proposal sets**. No scenario specifies a winning bundle: all winners are determined by comparing 64 subsets, including the empty portfolio. Exact ties choose the first subset in proposal order; equal-valued student portfolios are acknowledged as optimal.

The First Quest uses an independent random stream and an immutable per-run scenario. Inspection, funding, removal, commitment, and revisiting the report do not reroll it. New Game generates a fresh seed; `?seed=42` remains available for debugging. The Second Quest keeps its own $250,000 budget, original probability model, and seeded draws.

**Seeds 0–99, actually executed:**

| Check | Result |
| --- | --- |
| Valid six-project scenarios | 100 / 100 |
| Distinct proposal sets | 93 |
| Distinct optimal portfolio compositions | 83 |
| Best portfolio excludes largest individual NPV | 49 / 100 |
| Validated fallback used | 9 / 100 |
| Project identities appearing in winning portfolios | 20 / 20 |
| Every identity sometimes not selected when offered | Passed |
| Independent recursive enumeration matches optimizer | 100 / 100 |
| Rate, budget, and duration variation | All 3 rates, 5 budgets, and 4 horizons |

## Executed checks

- `node --test audit_tools/econ_rpg/investment-desk-first.test.mjs audit_tools/econ_rpg/investment-desk.test.mjs`: **24 passing tests**, including independent NPV examples, 100-scenario audit, exact/sub-cent optimizer checks, ties, all-negative/empty portfolios, bounded fallback, stable scenarios, quest isolation, and the existing 3,000-seed Second Quest checks.
- `investment-desk-first.browser.test.mjs`: **passed**. Opening and all six cards/commit controls fit at both requested desktop resolutions; additional seeds test varied project names. Card/modal cash flows and values agree. Tested optimal, empty, and negative reports, accordions, selection/removal, confirmation, report revisiting, new-seed restart, and 390px/320px carousel navigation. Representative screenshots visually inspected; no horizontal overflow or browser errors.
- `investment-desk.browser.test.mjs`: **passed**. Complete two-quest regression, research, signals, waiting, investment/rejection, outcome reveals, final report, keyboard Enter/Tab/Escape, focus containment/restoration, blocked storage, touch targets, reduced-motion mode, navigation, and replay. The existing source-only Growth Realms hub-script warning remains isolated from the game.
- `investment-desk.publication.test.mjs`: **passed**; verifies all 12 runtime assets and packaged hub → game → hub. The packaged hub resolves the existing external Growth Realms assets.
- JavaScript syntax and `git diff --check` checked.

Evidence: ignored `tmp/econ-rpg/investment-desk/scenario-validation.json`, `refinement/results.json`, screenshots in `refinement/`, and complete-game `results.json`.

## Files

Added within `audit_tools/econ_rpg/game/games/the-investment-desk/`: `finance.js`, `first-library.js`, `first-scenario.js`, `first-art.js`, `first-view.js`, `first-quest.css`, and this report.

Modified there: `engine.js` (generated First Quest state and isolated budget), `app.js` (routing/data integration and review access), `index.html` (header and scoped stylesheet), and `README.md`.

Tests under `audit_tools/econ_rpg/`: added `investment-desk-first.test.mjs` and `investment-desk-first.browser.test.mjs`; updated the existing model/browser fixtures and publication asset check for generated scenarios.

## Limitations

Browser testing used desktop Chrome with mobile-sized viewports; physical-device and human screen-reader checks remain outstanding. The report and expanded financial details intentionally scroll. The First Quest is deterministic within a run; only the Second Quest has hidden outcomes. Existing browser-local history is retained, but reload still starts a fresh game rather than resuming a saved session.
