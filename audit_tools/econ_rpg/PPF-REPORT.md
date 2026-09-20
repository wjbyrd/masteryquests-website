# The Economy’s Edge — implementation and QA report

**Ready for instructor QA.** Completed September 20, 2026. This is the third private scenario, using the requested title **The Economy’s Edge**, internal ID `ppf`, version 1. It is development-complete, not declared production-ready. Nothing was deployed or pushed.

[Local preview](http://127.0.0.1:4179/?scenario=ppf) · [Instructor playthroughs](PPF-QA-PATHS.md)

Run `node audit_tools/econ_rpg/serve.mjs` from the repository root if the local preview is not already running.

## Architecture

The new scenario uses the existing engine, condition matcher, immutable transitions, storage reconstruction, controller, DOM renderer, state panel, scene renderer, consequences and six-entry debrief. The shared renderer already supports four state rows; no UI or engine refactor was necessary. Data helpers construct ordinary conditional outcomes for authored production mixes and restarts. They do not execute a separate game engine.

New files under `audit_tools/econ_rpg/`:

- `game/scenarios/ppf.js`: scenario content, metadata, effects, branches, delayed delivery and endings.
- `game/scenarios/ppf-scenes.js`: six read-only state/history-driven scene variants.
- `art/ppf-assets.json`: original and current asset paths, byte counts, dimensions and SHA-256 hashes.
- `ppf-qa.mjs`: exhaustive exploration and compact manual coverage selection.
- `ppf.test.mjs`: PPF consistency, schema, paths, save, art, routing and frozen prior-scenario checks.
- `ppf.browser.test.mjs`: complete three-width browser runs and cross-scenario save checks.
- `PPF-QA-PATHS.md` and this report.
- The twelve supplied PPF assets at the destinations below.

Modified files:

- `game/scenarios/registry.js`: register the third scenario at `?scenario=ppf`.
- `main-attraction.test.mjs`: update only the expected registry size from two to three.
- `publication.test.mjs`: include PPF content and asset hashes in exclusion checks.
- `README.md` and `art/README.md`: document the scenario and extend the existing Art Bible.

The engine, controller, storage, UI, CSS and common scene renderer are unchanged. Housing and park scenario content/configuration are unchanged. Missing or unknown query IDs still load Room to Stay; there is no public scenario picker.

The save key is `mq.econ-rpg.ppf`. Existing keys remain `mq.econ-rpg.housing-crisis` and `mq.econ-rpg.main-attraction`. All are version 1 and independently preserve decision, consequence and ending phases. Restart and replay replace only the selected scenario's run. No accounts, identifying input, telemetry, analytics or gameplay network reporting were added. The existing CSP remains intact.

## Scenario structure

The player is director of economic planning for fictional Calder. Unlike the policy choices in Room to Stay and firm choices in The Main Attraction, these decisions allocate an economy's production across time.

| Indicator | Initial level | Meaning |
|---|---:|---|
| Current consumption | 5 | Output for household use and living standards |
| Capital production | 5 | Current equipment, infrastructure and productive investment |
| Resource utilization | 8 | Use of available workers and equipment |
| Future growth | 2 | Capacity-expanding improvements still in preparation |

All four indicators use 0–8 ordinal steps. They are not measured quantities, percentages or categories to sum. Low endpoints do not literally mean no people, equipment or projects exist.

| Decision | Choices and consequences |
|---|---|
| 1. Initial allocation | Household emphasis, balanced production or capital emphasis; a change in one current output costs the other. |
| 2. Reallocation under pressure | Shift toward either sector or keep the mix. Further concentration incurs a larger sacrifice as specialized resources move. |
| 3. Disruption | Wait for local restarts, coordinate immediately or protect household supply first. Both current outputs fall and resources become idle; coordination uses teams from future projects. |
| 4. Recovery | Full coordinated restart where feasible, phased restarts or equipment-first recovery. Reusing idle resources increases output without expanding the frontier. |
| 5. Investment | At full utilization: more productive investment, retain the mix or more consumption. With slack: finish restarts or advance existing project preparation while forgoing current recovery. |
| 6. Final production | Allocate along an unchanged frontier, allocate on a larger frontier after completed improvements, or choose between remaining restarts and future preparation. |

There are **nine authored nodes, 25 node/choice pairs and 361 legal complete paths**. Every path has exactly six decisions and every reachable decision offers two or three choices. All authored choices and all conditional gates in both available/unavailable states are covered. No orphan nodes, unreachable endings or cycles were found.

## PPF consistency

The following details are for instructor QA and tests, not displayed as equations or a graph in gameplay.

The original efficient production mixes, expressed as (consumption, capital) steps, are `(2,7)`, `(4,6)`, `(5,5)`, `(6,4)` and `(7,2)`. Utilization is 8 at these mixes. Every full-utilization reallocation stays within this set until realized expansion. Moving from the center toward consumption gains one consumption step for one capital step, then gains one for two capital steps; the capital direction mirrors that pattern. This implements increasing opportunity cost without a calculation exercise.

- **On the frontier:** every output-increasing reallocation reduces the other output. Stable allocation changes neither. Efficiency does not imply that the balanced mix is preferred.
- **Inside the frontier:** the disruption leaves the same resources available but lowers both outputs and utilization. An idle-resource shortfall is tracked relative to the pre-shock production mix. No output or utilization effect is silently clipped to conceal an impossible result.
- **Recovery:** restarts raise one or both outputs and utilization, never above that earlier mix. A full restart restores it exactly. Tests check this at every reachable phase.
- **Future preparation:** shifting current production toward equipment and training sacrifices household goods. Continuing project preparation while slack remains instead forgoes the output that completing restarts could recover. This is work within capital production, not an independent third current output.
- **Outward expansion:** after decision 5, full utilization and a preparation level of at least 3 route to the completed-improvement branch. Improvements enter use with the final decision. The expanded feasible set raises both coordinates of every original mix by one step. Keeping that mix therefore raises both outputs together; selecting another mix allocates the enlarged capacity differently.

Only the completed-improvement branch triggers the growth scene and ending. A high future-growth indicator with idle resources is still a pipeline, not realized growth. Completion draws projects out of that pipeline, so the indicator can fall while realized capacity rises. The final household/capital emphasis also changes replenishment of the pipeline. This distinction is explained in the consequences and manual guide.

The scenario deliberately simplifies time, readiness and coordination. The readiness threshold is an authored instructional condition, not an empirical forecast. It omits prices, finance, international trade, depreciation, heterogeneous households and political institutions. Output levels describe the current period; they do not erase household sacrifices in earlier decisions. The frontier palette and utilization index provide consistency checks, not measured resource totals.

There is no answer score, designated winning path or welfare ranking. No legal outcome simultaneously maximizes all four indicators. More current output, investment preparation and prompt utilization can require different priorities across the six-decision history.

## Endings

First matching rule supplies the headline; the full path and indicators retain other tradeoffs.

| Ending | Eligibility | Paths |
|---|---|---:|
| Slack and Strain | Final utilization below 8 | 42 |
| A Larger Frontier | A choice completed in the expanded-frontier branch | 43 |
| Living for Today | No realized expansion; full utilization and consumption ≥6 | 94 |
| Building Tomorrow | No earlier match; capital production ≥6 | 95 |
| Back on Track | Remaining full-utilization balanced outcomes | 87 |

The debrief preserves the shared structure: summary, overall changes, all six choices with mechanisms and expandable consequences/tradeoffs, four short economics sections, and three counterfactual observations. Its topics are scarcity and opportunity cost, production on the frontier, idle resources and recovery, and investment/outward shifts. No PPF diagram, equations, formulas or calculations are required in gameplay.

## Approved artwork

The six supplied WebPs already occupied a safe namespace, which was kept: **`game/art/scenes/the-economys-edge/`**. The six PNG masters were inside the preview's served tree at `game/art/sources/`; they moved unchanged to **`art/source/ppf/`**.

| Scene ID | Master filename | Runtime filename |
|---|---|---|
| balanced | `ppf-balanced.png` | `balanced.webp` |
| consumption | `ppf-consumption.png` | `consumption.webp` |
| capital | `ppf-capital.png` | `capital.webp` |
| slowdown | `ppf-slowdown.png` | `slowdown.webp` |
| recovery | `ppf-recovery.png` | `recovery.webp` |
| growth | `ppf-growth.png` | `growth.webp` |

All twelve remain 1448 × 1086 with exactly their supplied bytes. Hashes were captured before moving the masters and verified afterward. No art was generated, edited, recolored, cropped, resized or recompressed. All images use the existing full-frame 4:3 renderer and meaningful scene alternatives/captions.

The four panels consistently show capital goods at top left, future improvements at top right, idle resources at bottom left and household goods at bottom right. They are not independent quantity controls. The idle-resource panel is interpreted through inactive workers/equipment, not inventory piles. Small details are supplemental; the economic distinctions remain explicit in text and state changes.

Scene priority:

1. Completed `final-expanded` choice: growth.
2. Utilization ≤5, the initial disruption before recovery, or continued slack after investment planning: slowdown.
3. Recent recovery before investment, completed late restarts before another final allocation, or the final recovery-only choice: recovery.
4. Full utilization with consumption ≥6: consumption.
5. Full utilization with capital ≥6: capital.
6. Otherwise: balanced.

The selector is read-only. Recovery cannot accidentally activate growth, and a final ordinary reallocation leaves the temporary recovery view for its actual production emphasis.

At task start, five legacy housing WebPs were missing from their existing URLs and were present in the user-supplied `room-to-stay/` folder. Their original manifest hashes matched, so byte-identical copies were restored to the existing URLs. The supplied namespace copies were retained. This preserves the unchanged housing scene configuration and art; it is not a housing redesign or migration.

## QA results

**29 existing and new automated tests pass.** Seven PPF-specific tests exhaust all 361 paths and **4,693 phases**. They verify schema, exactly one applicable conditional outcome, bounds without output clipping, all choices/gates/scenes/endings, increasing opportunity cost, fixed-frontier efficiency, shock/recovery behavior, delayed expansion and exact save reconstruction. Both earlier scenarios retain their complete frozen behavior:

- Room to Stay: 200 paths; SHA-256 `f5eb10bba272b655a3253ba355b801b0aa7e445147ee4a0bed5ad4ec77cb1d6e`.
- The Main Attraction: 665 paths; SHA-256 `e9bb3c77ba9f57acc27b1d49a442e911526a761a70fe1bc51b072e40122561ad`.

**Browser QA passes: 33 PPF runs, 41 housing runs and 27 park runs — 101 complete playthroughs.** PPF uses the eleven coverage routes at 1280px, 390px and 320px. At each width, every scene and ending is exercised and captured along with intro, first decision, consequence, expanded indicator help and debrief. The four-row panel renders correctly with definitions collapsed initially; output changes match the saved state and reset cleanly. No horizontal overflow was found, controls meet the existing target-size checks, and the phone's first choice remains within 800px of the decision card's top. The supplied art stays uncropped at its original aspect ratio.

Keyboard activation, visible focus, heading focus transfer, live announcements, numeric/non-color-only indicators, meaningful alt text, native details and reduced-motion mode pass. Exact decision/consequence/ending resume, unavailable choices after reload, replay identity, version mismatch, blocked storage and preservation of both other saves pass. Screenshots of desktop and narrow layouts and all six narrow art states were visually inspected. Real-device and screen-reader instructor review remains appropriate; browser automation is not a substitute for it.

All suites report zero external requests, CSP violations, console errors or page errors. The new source masters return 404 at both their former served location and attempted canonical-source URLs. Only approved local WebPs are used for scenes.

The production exclusion test runs the real builder locally and checks paths, RPG content and all **34 approved source/runtime asset hashes**, including renamed duplicates. No RPG files or art enter `dist`. No public navigation, Games listing, update history, configuration or unrelated system changed. The builder and Cloudflare configuration were not modified; no deployment or push occurred.

Evidence is local and ignored under `tmp/econ-rpg/ppf/`: `unit-results.txt`, `browser-results.json`, the three browser logs and responsive screenshots (`scene-*`, `art-only-*`, `intro-*`, `first-decision-*`, `consequence-*`, `help-*`, `debrief-*`). Existing housing/park screenshot folders were refreshed by their own suites.

## First instructor playthroughs

Use the exact choice key in [PPF-QA-PATHS.md](PPF-QA-PATHS.md); start over between routes. The first six are:

1. **Balanced recovery:** balanced → hold → wait → full → hold → hold. Ends at consumption 5, capital 5, utilization 8, future growth 1. Recovery does not expand capacity.
2. **Household emphasis:** consumption → consumption → wait → phased → restart → hold. Ends 7 / 2 / 8 / 0. Inspect increasing opportunity cost and lower future preparation.
3. **Capital emphasis:** capital → hold → wait → full → hold → hold. Ends 4 / 6 / 8 / 2. More capital formation is not yet realized expansion.
4. **Unfinished recovery:** balanced → hold → wait → phased → continue → prepare. Ends 4 / 4 / 6 / 4. Stronger preparation coexists with idle resources and no growth scene.
5. **Late recovery:** balanced → hold → wait → equipment → restart → hold. Ends 5 / 5 / 8 / 2. Compare its sequence with route 1.
6. **A larger frontier:** balanced → hold → wait → full → invest → consumption. Ends 6 / 6 / 8 / 0. Both current outputs exceed the opening mix; the preparation pipeline falls as projects enter use.

Routes 7–11 complete all authored choice and conditional-gate coverage. In particular, route 9 chooses “Increase both types of output” and demonstrates the direct gain in both outputs from the pre-delivery mix. Inspect the four economics sections and the distinction between inventory, idle equipment, current investment and completed capacity.

## Explicit answers

1. **Same shared RPG engine? Yes.** No duplicate application, engine or save implementation.
2. **Room to Stay unchanged? Yes.** Its content, behavior, saves and approved art match the existing baseline; missing legacy image URLs were restored with identical bytes.
3. **The Main Attraction unchanged? Yes.** Frozen full-path outcomes and its browser suite pass; only the registry-count test expectation changed.
4. **PPF teaching without gameplay graphs/formulas? Yes.** Players allocate resources and inspect consequences; formal diagrams/calculations are left to the instructor.
5. **Scene changes obey PPF logic? Yes.** Read-only state/history selection is tied to reallocation, slack, recovery and verified delivery.
6. **Can players experience all four distinctions? Yes.** Full utilization, inside-frontier production, recovery and outward expansion all occur on reachable routes.
7. **All six approved scenes used appropriately? Yes.** Every scene is reachable, decoded and captured at all three widths; artwork bytes are unchanged.
8. **Ready for instructor QA? Yes.** Development-complete with eleven coverage routes and documented simplifications.
9. **Any public/production files changed? No.** Source edits are confined to the private RPG tree; ignored local QA/build outputs were regenerated.
10. **Anything deployed or pushed? No.**
