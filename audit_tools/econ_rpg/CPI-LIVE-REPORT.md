# CPI LIVE — instructional refinement and QA

## October 2, 2026 — readability and optional measurement extension

This update supersedes the September 23 interface descriptions below. The core ten-check sequence, accounting formulas, scoring, weighting, audits, timeline, and artwork remain intact.

### Files in this pass

Runtime under `game/games/cpi-live/`: modified `app.js`, `config.js`, `engine.js`, `storage.js`, `view.js`, `cpi-live.css`; added `measurement.js` and `measurement-view.js`.

Tests: updated `cpi-live.test.mjs` and `cpi-live.browser.test.mjs`; added `cpi-live-measurement.test.mjs` and `cpi-live-measurement.browser.test.mjs`.

Documentation: this report, `audit_tools/faculty_game_guides/CPI-LIVE-REPORT.md`, `docs/faculty-guides/cpi-live.md`, and `downloads/resources/cpi-live-faculty-guide.docx`. Other faculty guides, resource-page work, game artwork, and unrelated games are preserved.

### Basket and readout polish

- Plain `Qty N` text is 0.85rem (13.6px), up from 0.65–0.7rem. Item names and prices remain larger at 0.95rem. Quantities are not controls.
- Retained Fixed market basket; removed Quantities fixed badge and each item’s fixed suffix.
- Pending basket total is an em dash; removed To calculate and the persistent calculation explanation.
- Native, keyboard-accessible Need help? disclosure starts closed. A second disclosure reveals Basket Cost = Σ(Price × Quantity). Existing progressive CPI/inflation hints are unchanged.
- CPI, Inflation, and Base Year have dedicated readouts. The base-year card wraps below the other two on phones; primary values are 1.65rem.

### Question 5

Inspected PHASES and view/engine: question 5 is `meaning`, an index-level interpretation, previously hard-coded CPI 108. It is not the weighting question (6), audit (7), or timeline (8–10).

Six authored index levels: 104, 108, 112, 115, 120, 125. The answer is always the basket’s 4%, 8%, 12%, 15%, 20%, or 25% increase since the base year; annual inflation still requires a previous-period index. Answer positions rotate. Selection joins the existing deterministic run-level pools with five-run recent history, so all six appear before a repeat. The variant and history survive reload. Existing version-2 saves retain their original 108 question and feedback during replay validation.

### Behind the Index

Optional, unlocked only after core completion. Core score and completion remain intact; core replay and Return to Games remain available. Back to Core Results preserves extension progress. The ending uses three comparison panels and retains the normal CPI/inflation foundation.

1. **Substitution:** four purchases, initially two of each product. A single permitted shift changes the bundle to one plus three. Explicit household preferences bound substitution and make the alternative acceptable. Beef/chicken: original base $20, fixed current $28 (+40%), substituted $22 (+10% against original base cost). Apples/pears: $8, $12 (+50%), $10 (+25%). Cereal brands: $16, $24 (+50%), $20 (+25%). The student moves a token and identifies overstatement. This alternative is not labeled true CPI.
2. **New goods:** the old-basket position explicitly has no base-period product or price. Students reject inventing a base price, inspect a consumer opportunity, then select a later basket update with appropriate linking. Streaming $20 versus $12; commute $40 versus $30; approved generic $30 versus $20. Savings are illustrative opportunities, not index changes. New goods are not excluded forever.
3. **Quality:** students enter comparable price, raw percentage change, and adjusted percentage change. Laptop: $1,100 − $150 = $950 versus old $1,000. Phone: $550 − $75 = $475 versus $500. Washer: $880 − $120 = $760 versus $800. Each raw change is +10%; each adjusted change is −5%. Added-quality values are explicit simplified analyst estimates, not performance-index ratios or perfect measurements.

Each episode has three authored variants (27 reachable initial combinations). Extension replay avoids the previous selection in all three pools. The last extension selections also carry across core replays.

### Persistence and accessibility

Run version 3 uses the existing storage keys and replay-validated action history. Version 2 remains supported without resetting active progress. Extension saves include selected contexts, current episode, bounded quantity choice, submitted answers, feedback, and attempts. Unsubmitted typing is not persisted, matching core behavior. Core first-attempt score is unaffected.

Native buttons, tables with scoped headers, labeled fields, keyboard focus, status announcements, quantity counts as text as well as symbols, and 44px minimum targets are retained. The light-panel disclosure has an explicit dark text color.

### Verification

- 16 Node test groups passed: unchanged 25 basket/shock totals, all weighting and audit cases, 2,500 core combinations, 10,000 no-repeat selections, 120 Q5 runs, 300 extension runs covering all 27 combinations, replay validation after each episode interaction, and genuine HEAD version-2 save compatibility.
- 25 complete core browser runs passed: keyboard operation, wrong answers/retries, hints, save/reload, replay, scoring, return routing, all authored core pools, 200% zoom, reduced motion and normal motion.
- Four extension browser runs passed at 390×844, 844×390, 768×1024, and 1366×900: interactions, errors, replay, save/reload mid-episode, retained core score, touch targets, and no horizontal overflow. Core also passed at 320px.
- Zero local page, console, or HTTP failures. Screenshots reviewed for opening, comparisons, new-good opportunity, quality arithmetic, and ending.
- Faculty guide rendered to five pages with Word and inspected page by page. All comparison values are visible; existing guide sections remain.

### Publication status

Verified local source and staged release only. Cloudflare deployment was rejected by automatic approval review because the shared assets staging directory had not been fully verified against the live site and explicit authorization for a broad deployment was not established. Nothing from this pass was published. The nine intended release files are eight CPI runtime assets and the CPI faculty-guide download. Publication requires user approval and verification of the rest of the staged site before retrying.

Remaining human playtesting: instructional pacing, whether students understand the substitution suitability assumption, clarity of the two-step new-goods decision, and comfort with the three quality fields on a physical phone. No known functional blockers.

---

2026-09-23. Private instructor preview; no push or deployment.

## Scope and landing-page artwork

The existing dark Mastery Quests shell, light fixed-basket panel, dashboard, buttons and ten-check sequence are preserved. Runtime changes are confined to `game/games/cpi-live/`. The only other game-facing change is the two card images in `game/games/index.html`; GDP Live and every other game's runtime remain unchanged.

Exact supplied assets, relative to the repository root:

- GDP: `audit_tools/econ_rpg/game/art/scenes/gdp-live/gdp-live.webp`
- CPI: `audit_tools/econ_rpg/game/art/scenes/cpi-live/cpi-live.webp`

Both original WebPs are 1448 × 1086. Neither was renamed, regenerated, cropped, recompressed or edited. Their SHA-256 hashes remain:

- GDP: `434b84e9872e58f773da49c833ffec3aa2c750ebe6bab8dc141e1e3ee50dee4b`
- CPI: `1774681a0e53eb493983cfed2010741f28e604aa98c9bd4208404a78bbb25768`

The existing `.game-card` shell, media spacing, 4:3 aspect ratio and `object-fit: contain` treatment are reused, without changing the library CSS. GDP's placeholder media and CPI's old SVG reference are replaced with ordinary lazy-loaded images with explicit source dimensions. Alt text:

- GDP: “GDP scoreboard showing total GDP and consumption, investment, government purchases, and net exports.”
- CPI: “Household market basket display showing item costs, CPI, inflation, and total basket cost.”

The card links launch `/games/gdp-live/` and `/games/cpi-live/`. Relative image URLs resolve in the preview and a separately staged static copy of the private game tree, with source-art folders excluded. These checks do not publish the games: the actual public build still excludes `audit_tools/` and the private library.

## Wording

The visible heading is now **Fixed market basket**, followed by **Year 1 · Base year** and the retained **Quantities fixed** indicator. Removed “Household receipt” and “Same five items. Same quantities.” The structured table retains a concise screen-reader caption. Internal receipt function/class names remain to avoid unrelated refactoring.

The introduction is “SAME BASKET. NEW PRICES.” followed by the requested concise calculation goal and “No timer. Every answer can be corrected.” Prompts, feedback and results use basket terminology. Shock titles now directly describe rent, grocery, gas or service price increases, or mixed price changes. “Dearer” and the old grocery-shop phrasing are gone; no remaining visible “cheaper shop,” “price storm” or “inflation strikes” wording was found. The repricing instruction explicitly says to use the original quantities.

## Retrieval and correction

CPI, Year 2 inflation and the later Year 3 inflation calculation start without a formula. **Need a hint?** opens conceptual guidance; a separate **Show formula** button then reveals the appropriate formula. Students can finish all calculations without using either control. The initial base-year confirmation no longer gives away the CPI formula.

Wrong answers provide conceptual correction and permit retries without forcing formulas open. Hints use native buttons with `aria-expanded` and `aria-controls`; focus stays on the activated control and typed input survives hint toggles. Formula symbols have plain-language screen-reader equivalents. Requested hints survive reload and reset on Play Again. Diagnostic formulas remain in the analyst's intentionally incorrect work and its repair, where evaluating the formula is the task itself.

## Multi-year visualizations

Only the multi-year section adds charts. A **PRICE LEVEL — CPI** line with points, numeric values and labeled axes uses the selected timeline. A separate **INFLATION RATE** bar chart uses calculated annual percentage changes; a visible zero line and negative bars distinguish deflation. There is no dual axis. Negative-rate labels sit above the zero line to avoid the bottom axis.

The CPI chart appears first. The Year 3 calculation does not reveal the inflation chart. At the interpretation stages, a valid answer attempt reveals rate bars and the rate column in the adjacent table; an incorrect interpretation still permits correction. The final stage adds Year 4 and repeats this interpretation-before-reveal sequence.

Each SVG has a meaningful title and description containing all displayed values. The structured table supplies equivalent CPI/rate data, with rates exposed at the same instructional point as the chart. Interpretation does not depend on color, pointer interaction or hover. Charts scale down on mobile and have a maximum graphic width of 440px. They remain inside the page at 320px and real 200% browser zoom.

Feedback distinguishes disinflation (prices still rise, more slowly) from deflation (the price level falls). If the selected Year 3 path does not demonstrate disinflation, feedback supplies the separate computed 100 → 108 → 112 example. Every Year 4 path falls while remaining above 100. The concise final recap explicitly distinguishes CPI level, inflation, disinflation and deflation.

## Authored baskets and arithmetic

Five baskets use the same categories, in this order: rent, groceries, gas, streaming, haircuts. Quantities remain fixed throughout each run. Prices below are dollars per unit.

| Basket ID | Quantities | Base prices | Base cost |
|---|---|---|---:|
| original | 1, 10, 40, 2, 2 | 1000, 20, 3, 15, 25 | $1,400 |
| compact | 1, 8, 30, 1, 2 | 900, 25, 4, 20, 30 | $1,300 |
| commuter | 1, 12, 40, 2, 2 | 1100, 25, 4, 15, 30 | $1,650 |
| city | 1, 10, 30, 2, 2 | 1200, 25, 4, 20, 35 | $1,680 |
| shared | 1, 12, 30, 2, 2 | 1000, 25, 4, 20, 30 | $1,520 |

All five base-year indices equal 100. Rent remains the largest expenditure category. Integer-cent arithmetic derives every item expenditure, basket cost and dollar contribution from the selected basket. Intermediate CPI and inflation calculations use full precision.

The five shocks apply percentage changes to the selected base prices, rather than assuming one basket. In category order:

| Shock ID | Percentage changes |
|---|---|
| housing-pressure | +4, +5, +5, +10, 0 |
| fuel-pressure | +1, 0, +25, 0, 0 |
| food-pressure | 0, +15, 0, +10, +5 |
| mixed-prices | +6, +5, −10, −10, +4 |
| service-pressure | 0, +5, 0, +40, +20 |

Validated Year 2 basket costs for all 25 combinations:

| Basket | Housing | Fuel | Food | Mixed | Services |
|---|---:|---:|---:|---:|---:|
| original | $1,459 | $1,440 | $1,435.50 | $1,457 | $1,432 |
| compact | $1,354 | $1,339 | $1,335 | $1,352.40 | $1,330 |
| commuter | $1,720 | $1,701 | $1,701 | $1,714.40 | $1,689 |
| city | $1,750.50 | $1,722 | $1,725 | $1,751.30 | $1,722.50 |
| shared | $1,585 | $1,560 | $1,572 | $1,581.40 | $1,563 |

CPI = current basket cost / base basket cost × 100. Annual inflation = (new CPI − previous CPI) / previous CPI × 100. All 25 combinations have exact-cent prices; no arbitrary procedural prices are generated.

Four weighting comparisons are retained, now derived from each selected base basket: streaming +40% versus rent +5%; groceries +10% versus haircuts +30%; streaming +40% versus gas +15%; rent +4% versus gas +25%. All 20 basket/comparison pairs preserve the intended unequal expenditure-weight lesson and have one winner.

Five audits cover changed quantities, equal averaging, reversed CPI ratio, CPI level mistaken for inflation, and the wrong annual comparison period. All 125 basket/shock/audit combinations are validated. The deliberately incorrect analyst quantities never affect the live basket.

| Timeline | CPI, Years 1–4 | Year 2 rate | Year 3 rate | Year 3 meaning | Year 4 rate |
|---|---|---:|---:|---|---:|
| slower-rise | 100 → 108 → 112 → 109 | 8.0% | 3.7% | Disinflation | −2.7% |
| faster-rise | 100 → 104 → 112 → 110 | 4.0% | 7.7% | Acceleration | −1.8% |
| stable-prices | 100 → 106 → 106 → 103 | 6.0% | 0.0% | Stable price level | −2.8% |
| falling-prices | 100 → 110 → 108 → 105 | 10.0% | −1.8% | Deflation | −2.8% |
| high-level-slow-rise | 100 → 120 → 122 → 118 | 20.0% | 1.7% | Disinflation | −3.3% |

The timeline remains a clearly labeled separate economy; it does not overwrite the household basket. Numeric parsing and tolerances are preserved: half-cent currency tolerance, 0.05 index-point/rate tolerance, and a correctly rounded whole CPI also accepted. Optional currency/percent symbols, standard commas and negative rates work; malformed or nonfinite input is rejected.

## Fresh runs and saved runs

Pools contain **5 baskets × 5 shocks × 4 weighting comparisons × 5 audits × 5 timelines = 2,500 combinations**. Play Again creates a new anonymous run ID, clears progress/hints and excludes the last-used ID independently in all five categories. One local last-selection record is sufficient; there is no identity tracking or cross-game history system.

The active run is stored under `mq.cpi-live.active.v2`; last-used selections under `mq.cpi-live.last.v2`. Reload resumes the same ID, five selections, submitted answers, progress, score and requested hints. Restoration replays the saved actions and verifies the resulting state, rejecting corrupted or inconsistent data. Unsubmitted typing is preserved during hint toggles but is not a saved answer. If storage is unavailable, play and no-repeat replay still work in the current tab, with a clear warning that reload may lose progress.

Existing anonymous telemetry remains local, with 20-run retention. Records include the basket ID and new hint events. Resuming appends to the same run record instead of duplicating start/completion events. No personal data or external requests are introduced.

**The Main Attraction: verification only.** Its four controlled variants vary with run ID and remain stable when a saved run is serialized and reviewed. Its existing selection does not guarantee no immediate repeats. No-repeat behavior is implemented only in CPI Live; no global standardization or Main Attraction runtime changes were made.

## Ten-stage flow audit

The stage count is preserved. Weighting prediction and its reveal stay together rather than becoming two screens.

| Price Check | Work | Primary cognitive demand |
|---|---|---|
| 1 | Calculate groceries expenditure and base-basket total | Multiplication and basket construction |
| 2 | Apply new prices to the original quantities | Repricing/application |
| 3 | Convert basket costs to CPI, with optional hints | Retrieval and index calculation |
| 4 | Calculate Year 1 → Year 2 inflation, with optional hints | Retrieval and percentage-change calculation |
| 5 | Interpret a separate CPI level of 108 | Distinguish an index level from an annual rate |
| 6 | Predict the larger weighted effect; reveal and compare dollar effects | Prediction, interpretation and correction |
| 7 | Diagnose and repair the analyst's error | Error diagnosis |
| 8 | Calculate Year 3 inflation from the CPI timeline | Transfer to a non-base-year denominator |
| 9 | Interpret the change in annual inflation; reveal rate bars | Trend interpretation/disinflation |
| 10 | Interpret falling CPI that remains above 100 | Synthesis: deflation versus base-year comparison |

The first four calculations perform different operations and build the measurement sequence. They are followed by interpretation, prediction/reveal and diagnosis, then transfer to a later period. Consolidation would remove distinct practice; no new stages or giant final report were added.

## QA results

- **91 unit/regression tests pass**, including 12 CPI tests and the actual production build/publication guard. The 12 CPI tests also pass after the final chart-label adjustment.
- **2,500 complete combinations** exercise wrong-answer correction, fixed quantities, calculated answers, score accounting, transition guards and render validity.
- All five base costs, all 25 shock combinations, all 20 weighting pairs, all 125 audit combinations and all five timeline classifications/rates are checked.
- **10,000 consecutive fresh selections** cover all 24 authored variants and prevent immediate repeats in each category. Twenty complete action histories validate phase/hint persistence and reject corrupted saves.
- **21 complete CPI keyboard-only browser runs** cover every authored variant, correction and perfect-answer paths, hints opened and unused, focus retention, replay, reload/resume and Return to Games.
- **14 existing-game keyboard runs** pass for the other seven games at desktop and actual 200% zoom.
- Card-image checks pass in a staged static build at **1366 × 768, 1280 × 720, 768 × 1024, 390 × 844, 320 × 720 and 200% zoom**. Source hashes, dimensions, aspect ratio, contain treatment, card balance, alt text and both keyboard-operated links are verified.
- CPI uses the same viewport matrix. Real 200% Chrome zoom yields a 683 × 384 CSS viewport with device-pixel ratio 2. No horizontal page overflow; all SVG labels remain within the viewBox. Visual inspection includes narrow-screen charts/hints, negative bars, the two card images and both chart types at 200% zoom.
- Native controls retain 44px targets, labels and visible focus. Requested formulas have spoken equivalents; tables and SVG descriptions carry chart values. Reduced motion and normal motion complete successfully. A screen-reader listening pass was not performed.
- **Zero console errors, page errors, missing assets or external requests** in CPI browser checks. Card tests also report zero errors. Other-game runtime/source guards and `git diff --check` pass.

Commands: `node --test` with the non-browser `audit_tools/econ_rpg/*.test.mjs` files; `node audit_tools/econ_rpg/cpi-live.browser.test.mjs`; `node audit_tools/econ_rpg/cpi-live-art.browser.test.mjs`; `node audit_tools/econ_rpg/mini-game-library.browser.test.mjs`. Browser tests use the existing external `PLAYWRIGHT_MODULE`; no new dependencies were installed.

Logs, arithmetic/browser results, staged card previews and screenshots are under ignored `tmp/econ-rpg/cpi-live-refinement/`. Real-zoom chart viewport captures use Chrome's screenshot API without extending capture beyond the viewport; oversized element captures at browser zoom can miscrop in Playwright.

No unrelated cleanup, source-art editing, public navigation change, push or deployment.
