# Takeout Taco: eight-round refinement and UI cleanup

Counting the Cost now has eight decision-driven rounds, optional within-round experiments, progressive cost graphs, a personalized review, and a separate postgame Cost Lab. The original Lunch Rush engine, game, scene catalog and artwork remain unchanged.

Preview: [Counting the Cost](http://127.0.0.1:4179/games/takeout-taco-counting-the-cost/). Start the local server with `node audit_tools/econ_rpg/serve.mjs` if needed. The beta hub and companion were published on October 10, 2026; see the deployment record below. No Git push was performed.

## October 10 targeted cleanup

This pass changed `app.js`, `index.html`, `graphs.js`, `costs.css`, the two companion test files and this report. Economic formulas, gameplay transitions, artwork and telemetry code were not changed.

- Removed the introductory estimate and small print, introductory round-count tagline, and persistent footer copy. Navigation, live announcements, storage safeguards and privacy metadata remain.
- Narrative titles appear beside the numbered progress circles without a duplicate “ROUND N OF 8” label. The active circle has `aria-current="step"`.
- The primary result graph retains FC, VC and TC throughout all eight rounds, including zero variable cost at opening. Every committed observation remains in its table; identical plotted points remain deduplicated.
- Expansion retains the original one-truck graph and adds a separately titled two-truck graph with matching axis scales. No line connects the configurations.
- Normal graph captions contain only the compact curve legend. Detailed actual/reference explanations moved to View Cost Curves; numerical tables remain collapsible. Secondary MC/AFC/AVC/ATC views remain available.

Validation: **27 deterministic tests passed**, including **1,920 complete paths**, plus the Edge browser suite at 1440, 768, 390 and 320 pixels and a 1366×768 laptop check. New checks cover the cleaned intro/footer, accessible current-round circle, every round’s total-cost legend and cumulative table, optional unit curves, and separately plotted expansion history. Existing gameplay, lab, telemetry, storage, replay and completion checks also passed. Screenshots of desktop, mobile and expansion views were inspected. `git diff --check` passed.

## Implementation files

All game files below are under `audit_tools/econ_rpg/game/games/takeout-taco-counting-the-cost/`:

- `gameplay.js`: eight guarded rounds, refusal/shortfall paths, optional experiments, completion, and isolated lab transitions.
- `content.js`: eight challenges and consequences; actual-versus-reference comparisons; personalized review that also handles zero production throughout.
- `graphs.js`: progressive references, discrete MC interval segments, solid actual markers, subdued history, current-point rings, deduplication, equipment filtering and accessible data tables.
- `app.js`, `index.html`, `costs.css`: eight-round UI, compact results, mobile progress, optional comparisons, focus/live announcements, reports, source-labeled CSV exports and lab integration.
- New `lab.js`: postgame controls, lab result, separate curves and history.

Also updated the companion description in `game/games/index.html`, both `takeout-taco-cost*.test.mjs` files and this report. The existing 15-game registration remains intact. This refinement did not change `engine.js`, `config.js`, `telemetry.js` or unrelated games.

## Progression and economics

| Round | Challenge | Target / new concept |
| --- | --- | --- |
| 1 | Open for Business | Zero output; $60 fixed bill, no variable cost |
| 2 | First Customers | 8 tacos; first worker, wages and ingredients |
| 3 | The Line Gets Longer | 18 tacos; capacity versus orders |
| 4 | Finding Our Rhythm | 31 tacos; third-worker specialization, MC $6.62 |
| 5 | The Rush Intensifies | 42 tacos; fourth-worker MP falls to 11, output still rises |
| 6 | Pushing Capacity | 50 tacos; fifth-worker increment costs $76 / 8 = $9.50 |
| 7 | The Marginal Squeeze | 53 tacos; sixth-worker increment costs $66 / 3 = $22 |
| 8 | Expand or Stay Put? | Promise 40, 62 or 80; keep the prior crew or expand with six workers |

Rounds 2–7 always offer current staffing alongside the introduced crew size. Explore Another Choice allows a repeat service at the same target, including an overstaffed alternative where applicable. Final review uses the last choice for each round; every experiment remains in history. Refusing every hire and completing with zero output is valid. Neither selecting a card nor choosing an intermediate expansion step records production.

Expansion allocations 6+0, 5+1, 4+2 and 3+3 produce capacities 53, 58, 60 and 62. Staying keeps the round-seven crew, including zero workers. Expanding explicitly schedules six workers; it is not automatically rewarded. The round-seven statement about an actual three-taco gain appears only after a comparable five-worker, 50-taco observation. Other paths receive an explicitly calculated reference.

Canonical output remains `[0, 8, 18, 31, 42, 50, 53]`. Prices remain $1,000/truck/month, $200/grill/month, $60/worker/service, $2/taco and 20 services/month. Ingredients match actual production automatically. All core gameplay figures use per-service costs; reports retain monthly equivalents. Zero-output averages are undefined. Arbitrary trial changes are never labeled theoretical MC.

The main graph continuously displays FC, VC and TC. Actual averages and progressively introduced calculated staffing MC remain in the optional View Cost Curves interface. Repeated identical observations share markers without deleting history. Dashed MC segments show discrete production increments. Untested complete reference schedules unlock after completion; equipment schedules are filtered separately. Reports and tables retain all numerical detail.

Free Play / Cost Lab unlocks after the eighth result. Targets, staffing, truck counts, allocation and grill availability can be varied. Lab observations have a separate state collection, graph, report, CSV and telemetry event; they never alter the eight-round review or story completion count.

## Validation

On October 10, 2026, all **27 deterministic tests passed**: 17 companion tests and 10 original Lunch Rush regressions. The companion suite traversed **1,920 complete choice paths and 5,117 state prefixes**. Coverage includes canonical production, feasibility, minimum costs, MC, unit conversion, zero output, automatic ingredients, refusals, shortages, retries, excess staffing, expansion/staying, sparse graphs, all-round fulfillment, lab gating and lab/story isolation.

The hire-each-round path produces 0, 8, 18, 31, 42, 50, 53 and 62 tacos, at per-service total costs $60, $136, $216, $302, $384, $460, $526 and $604. Engine regression cases with explicitly limited/excess ingredients also pass.

The packaged-preview browser suite passed in headless Edge at 1440, 768, 390 and 320 pixels, with an additional 1366×768 laptop check. It verifies eight-round play, refusal and shortfall paths, experiments, overstaffing, allocation, reference unlocking, keyboard selection, dialog focus/Escape, graph tables, reduced motion, mobile layout, CSV export, telemetry, replay/restoration, blocked storage, hub navigation and Cost Lab separation. No JavaScript, console, missing-asset or external-request errors occurred. Desktop/laptop, mobile result and mobile lab screenshots were inspected.

```text
node --test audit_tools/econ_rpg/takeout-taco-cost.test.mjs audit_tools/econ_rpg/takeout-taco.test.mjs
node audit_tools/econ_rpg/takeout-taco-cost.browser.test.mjs
```

Browser testing uses Playwright (`PLAYWRIGHT_MODULE` can specify its location) and `BROWSER_CHANNEL=msedge`. Its temporary loopback server stops afterward. Screenshots/results are in ignored `tmp/econ-rpg/takeout-taco-cost-redesign/`. The original-game/art diff guard and `git diff --check` pass.

## Limits

The 6–10 minute duration is a design target, not a measured student study. Browser checks do not replace physical-device or assistive-technology user testing. Supplied opening and two-truck art is illustrative; captions specify actual staffing and allocation. Reload starts a new run; replay archives live in the open tab and anonymous telemetry retains up to 20 runs. An 80-taco story promise exceeds the six-worker maximum of 62; the lab permits larger crews. The source-only preview's unrelated Growth Realms module remains external; integration tests use the complete packaged hub.


## October 10 splash screen and live hub publication

- Enlarged the opening artwork into a full-width splash panel with shaded text and a start button; retained responsive sizing and existing artwork.
- Organized the beta hub into Microeconomics followed by Macroeconomics. Microeconomics order: The Economy’s Edge, Room to Stay, Megastar Mania, At the Box Office, Takeout Taco: Lunch Rush, Takeout Taco: Counting the Cost, The Main Attraction, Gameday Rivals. The seven macroeconomics cards retain their prior relative order.
- Changed `costs.css`, hub `index.html` and `library.css`, browser checks and publication checks. The publication test now recognizes the existing unlisted Signal House return link and public faculty-guide mentions while still rejecting leaked runtime identifiers, private artwork, and public links to the beta collection.
- Validation: 17 companion tests and both publication tests passed; packaged browser tests passed at 1440, 768, 390 and 320 pixels. The controlled build contains 2,250 files and zero forbidden files; Cloudflare dry run passed.
- Published through the repository’s existing complete-site build and unchanged Worker configuration, preserving variables. Version: `bc43894b-44f9-4b44-8286-dbac05c309d8`. The full build uploaded 28 changed assets, including previously committed repository updates to Growth Realms, Micro Domains and the faculty export scope JSON; those sources were not edited in this task.
- Live verification passed at 1440 and 390 pixels: all 15 cards, exact requested microeconomics order, artwork loading, game launch, first production decision and return navigation. All 12 hub/game runtime files checked match the generated build byte-for-byte. No page errors or failed asset responses were captured.

Live hub: https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/

Live game: https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/takeout-taco-counting-the-cost/

Live screenshots and results: ignored `tmp/econ-rpg/takeout-taco-cost-live/`.
