# Growth Realms

A six-cycle strategy game in which the player manages **one** economy and an independent computer doctrine manages the other. Its layered 32-bit isometric presentation uses detailed district sprites, staged construction, fixed routes and visible constraints. The economic model is unchanged by the visual pass.

## Sidewalk follow-up

Public pedestrians now follow the continuous .7-tile sidewalk around the Education block. Concrete paving, slab joints and curb edges distinguish it from the vehicle lanes. Construction workers use visible paved service walks within their district parcels. People retain their original 32px student / 29px worker sprites to preserve detail.

The street grid gains one tile of world width and height to reserve pavement without squeezing maximum buildings, annexes or equipment. Pedestrian paths and protected sidewalk rectangles share the production geometry; buildings and scenery cannot occupy the pavement. The local source game and staged beta assets include this change; it has not been publicly deployed. Run `npm run test:sidewalks` to observe actual pedestrians, workers and traffic through complete route cycles, check maximum layouts, and exercise mobile allocation. Evidence is in `tmp/games-preview/growth-realms/sidewalk-pass/`.

## District zoning

The live renderer uses `district-layout.js` for measured per-level image anchors and ground lots, fixed parcels for both cities, protected road rectangles, annex strips and construction geometry. `scene-layout.js` checks actual rectangular ground footprints, directional expansion limits, effects and neighboring districts before `map-engine.js` draws a city. Invalid layouts log explicit errors and suppress district rendering. Scenery automatically yields to expanded lots and construction service walks.

Both cities reserve 6.5 × 6.5 tile parcels centered at Education (3.75, 3.75), Industry (12.25, 3.75), Resources (3.75, 12.25), Research (12.25, 12.25). Structural expansion is limited to 2.95 tiles in each map direction; the remaining .3 tile is a service/safety buffer. District sprite scale remains 238/512. The world is 1216 × 736 pixels, independently displayed through a responsive 1184 × 704 camera. Exact level footprints and image dimensions are documented in `assets/README.md`.

Open `tests/zoning.html` on the local game server for repeatable starting, maximum, individual-level and construction views. Its Maximum mode stress-tests all districts at their individual highest model levels, including annexes; it does not alter the game session or economics. The overlay shows the production parcel/road/footprint geometry and routes. The entire tests directory is excluded from beta publication.

Run `npm test` for model/economic locks and geometric acceptance checks, `npm run test:zoning` for the 48 level views, 288 construction transitions, maximum traffic loops and responsive targets, and `npm run test:browser` for both complete six-cycle game flows. Browser scripts use Playwright with Edge (`PLAYWRIGHT_MODULE` may specify an installed ESM path). Screenshots under `tmp/games-preview/growth-realms/zoning-pass/` are test output only; production code does not load them.

Zoning-pass implementation references (line numbers recorded before the sidewalk follow-up):

| Changed file | Implemented behavior / source lines |
| --- | --- |
| `district-layout.js` | Both cities' fixed parcels and expansion limits: 1–18; protected road rectangles: 19–27; 24 measured level footprints/image anchors: 29–83; annexes, construction/service geometry: 85–109 |
| `scene-layout.js` | Scenery positions and ground geometry: 1–24; actual occupied lots: 25–45; scenery filtering: 46–62; road, parcel, expansion, district and effect checks: 63–83 |
| `map-engine.js` | Responsive world/hit targets: 32–38; drawing the same protected road geometry: 72–86; anchored district/construction rendering and pre-render rejection: 88–142; actual unit ground contacts: 157–174; audit exposed in renderer stats: 218 |
| `visual-config.js` | World/camera: 5–7; targets, measured metadata and routes: 36–65; projection: 73 |
| `game.js` | City-specific anchor import: 1; allocation feedback position: 119 |
| `tests/zoning.html`, `tests/zoning-fixture.js` | Repeatable local starting/max/all-level/construction state using the real renderer, with optional road/parcel/route overlay |
| `tests/zoning.test.js`, `tests/zoning-browser.test.mjs` | New geometric and browser acceptance coverage, including negative collision cases |
| `tests/cleanup.test.js`, `tests/cleanup-browser.test.mjs` | Existing route checks upgraded to actual rectangular footprints and currently visible scenery |
| `tests/beta-build.test.js` | Requires the production zoning module in the staged beta build |
| `package.json` | Adds zoning geometry to the normal test command and `test:zoning` browser command |
| `README.md`, `assets/README.md` | Zoning contract, per-level footprint table, repeatable verification and delivery evidence |

Verified on 2026-10-03: 35 model/visual/interaction/geometry tests, the staged beta build test, both full six-cycle game flows, the cleanup browser regression, 48 individual visual level views, 288 construction transitions, 650 live maximum-city traffic samples and four viewport sizes (320, 390, 768, 1366 px). A deliberately invalid Education parcel in a disposable browser page logged the exact road collision and painted zero district actors, confirming the production guard. No remaining spatial conflicts were found in the tested states. Road routes now follow the new 7.5/15 centerlines, the bus turns one tile inside the road ends, and workers use the reserved rear/left path. No economic files, coefficients, thresholds, rival rules, point logic or cycle structure were changed.

Screenshot evidence (actual rendered game/fixture; excluded from publication):

- Starting layouts: [Meridian](../../tmp/games-preview/growth-realms/zoning-pass/starting-meridian.png), [Rivermark](../../tmp/games-preview/growth-realms/zoning-pass/starting-rivermark.png).
- Maximum layouts, including annexes: [Meridian](../../tmp/games-preview/growth-realms/zoning-pass/maximum-meridian.png), [Rivermark](../../tmp/games-preview/growth-realms/zoning-pass/maximum-rivermark.png).
- Construction near roads: [Meridian](../../tmp/games-preview/growth-realms/zoning-pass/construction-meridian.png), [Rivermark](../../tmp/games-preview/growth-realms/zoning-pass/construction-rivermark.png).
- Maximum route/parcel overlays: [Meridian](../../tmp/games-preview/growth-realms/zoning-pass/routes-meridian.png), [Rivermark](../../tmp/games-preview/growth-realms/zoning-pass/routes-rivermark.png).
- Eight `levels-{city}-{district}.png` contact sheets cover all 48 level views; `mobile-planning.png` verifies the phone layout. `audit.json` and `guard-and-beta.json` record measurements and checks alongside the images.

The source game and local staged beta build contain these changes. This zoning pass has not been deployed to the public beta site.

## Run locally

From the repository root:

```sh
node play/growth-realms/tests/serve.mjs
```

Open `http://127.0.0.1:4178/play/growth-realms/`. Any static HTTP server also works. JavaScript modules require HTTP rather than `file://`. The game has no runtime dependencies or build step. The existing site build already includes the `play/` directory; this pass does not publish it or change the public catalog.

## Play

1. Select **Start Game** on the title screen, then Manage Meridian or Manage Rivermark. How to Play and Field Guide explain the controls and growth concepts. The other city gets a valid, randomly selected CPU doctrine.
2. Planning opens your city. Click or tap any district to invest +1. Select a district without spending through the dropdown below the map; its compact −1 / +1 / +5 / Clear controls provide quick allocation and undo. The prominent budget and 20 pips update immediately. Every cycle starts at zero, and commitment requires all 20 points.
3. Commit. The CPU independently plans from its own state and doctrine. Both results are calculated against the same pre-cycle technology frontier.
4. The existing construction transition runs for both cities. Stocks update together when it finishes; reduced motion skips the delay.
5. Compare the cities and revealed allocations. Compare Cities defaults to four strategic measures and the productivity gap; View detailed comparison retains the full economic data.
6. Continue for six cycles, then inspect actual history, relative and absolute productivity gaps, growth policies, the revealed rival doctrine, and one transfer question.
7. Play Again returns to city choice and resets state. The next doctrine is sampled from a valid pool excluding the preceding doctrine when alternatives exist.

Combined Comparison, Meridian, and Rivermark remain available during a run. The full stock HUD scrolls away; a compact sticky cycle/budget strip stays visible during planning and resolution. Inspecting the rival never changes who controls it or exposes editing controls. Future rival allocations are never shown before commitment/resolution.

## Files

| File | Responsibility / change |
| --- | --- |
| `index.html` | Updated choice-screen shell, field guide, cycle wording |
| `styles.css` | Existing style retained; added choice, point controls, rival report, and policy section layouts |
| `config.js` | `GAME_CONFIG`, `GAME_BALANCE`, `CPU_DOCTRINES`, project labels, `CYCLES` |
| `model.js` | Productivity model, delayed education, endogenous constraints, city histories, gap measures |
| `cpu.js` | New independent doctrine selection and integer allocation engine |
| `session.js` | New testable run state machine, scarcity validation, atomic resolution, reset-ready state |
| `game.js` | Player-only controls, city selection, rival reveal, coordinated animation, integer stock displays |
| `debrief.js` | Actual player/rival histories, doctrine reveal, policy connection and transfer question |
| `city-renderer.js` | Renderer facade and shared UI icons |
| `map-engine.js` | Nine canvas layers, cached scenes, one 8 FPS clock, fixed routes and construction |
| `visual-config.js` | Central asset manifest, district levels, routes and visual-state mapping |
| `visual.css` | Strategy-game panels, map sizing, responsive and reduced-motion presentation |
| `interaction.css`, `planning-ui.js` | Readable UI, generous district targets and compact allocation commands |
| `mq-theme.css`, `presentation.css` | Central MQ navy/teal tokens, title/choice flow, compact HUD and report hierarchy |
| `cleanup.css`, `hero-scene.js` | Sparse title, shared river scene, height-aware desktop map and contextual sidebar |
| `scene-layout.js`, `upgrade-progress.js` | Shared ground-contact/footprint rules and display-only cumulative upgrade progress |
| `CLEANUP_PASS.md`, `tests/cleanup.test.js`, `tests/cleanup-browser.test.mjs` | Cleanup implementation index, route/clearance tests, live acceptance evidence and screenshot index |
| `INTERACTION_CUES_BETA.md`, `tests/cues-browser.test.mjs`, `tests/beta-build.test.js` | Current circular cues, wider landscape, scenery clearance and beta/mobile integration |
| `card.js` | Reuses the production hero scene on the existing beta hub card |
| `PRESENTATION_PASS.md`, `tests/presentation-browser.test.mjs` | Current presentation report, A–I browser checks and screenshots |
| `unit-routes.js` | Segment-based NE/NW/SE/SW position and facing |
| `assets/README.md`, `assets/sprites/` | Seven temporary RGBA atlases, exact dimensions and generation prompts |
| `tests/visual.test.js`, `tests/visual-economy-lock.json` | Visual acceptance and frozen economics contract |
| `tests/visual-browser.test.mjs` | Animation/lifecycle checks, mobile layouts and screenshots |
| `VISUAL_OVERHAUL.md` | Complete visual report and screenshot index |
| `DIRECT_MANIPULATION.md` | Current interaction, legibility and directional-unit report |
| `tests/interaction.test.js`, `tests/interaction-browser.test.mjs`, `tests/browser-helpers.mjs` | A–L interaction, facing, touch/keyboard and shared browser helpers |
| `package.json` | Test/audit scripts |
| `tests/model.test.js` | Acceptance A–L, scarcity, history, state/ordering checks |
| `tests/browser.test.mjs` | Both player cities, views, point controls, reveal timing, animation, reports, replay, responsive checks |
| `tests/balance-audit.mjs` | Reproducible requested-strategy and 572-run fixed-plan audit |
| `tests/balance-results.json` | Exact numeric audit output and configuration snapshot |
| `tests/serve.mjs` | Existing loopback-only development server, unchanged |
| `GAMEPLAY_OVERHAUL.md` | Exact formulas, all constants, starting states, doctrine rules, A–L evidence, limitations |

## Verification

Use a current Node runtime (Node 24 used here):

```sh
node --test play/growth-realms/tests/model.test.js play/growth-realms/tests/visual.test.js play/growth-realms/tests/interaction.test.js play/growth-realms/tests/cleanup.test.js
node play/growth-realms/tests/balance-audit.mjs
```

For browser tests, start the server, then run:

```sh
node play/growth-realms/tests/browser.test.mjs
node play/growth-realms/tests/visual-browser.test.mjs
node play/growth-realms/tests/interaction-browser.test.mjs
node play/growth-realms/tests/presentation-browser.test.mjs
node play/growth-realms/tests/cleanup-browser.test.mjs
node play/growth-realms/tests/cues-browser.test.mjs
```

Browser tests require Playwright and Microsoft Edge. If Playwright is outside normal module resolution, set `PLAYWRIGHT_MODULE` to its `index.mjs` file URL. Test dependencies are not needed by the game. Screenshots go to the already-ignored `tmp/games-preview/growth-realms/` directory.

The cue/beta suite uses the built site on port 4180, or `GAMES_PREVIEW_ORIGIN` for the deployed site. Growth Realms is published only inside the existing unlisted [beta hub](https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/). `play/growth-realms/` remains its authoritative source; the publisher copies runtime files and rebases Return to Games. After a site build, run `node --test play/growth-realms/tests/beta-build.test.js` to verify that boundary.

The implementation passed all 12 model-test groups, a 572-run sweep, and full browser runs for both city choices. Responsive views were checked at 320, 390, 768, and 1440 pixels, including expanded tables, reports, and active allocation controls, with no page overflow or browser errors.

## Internal state and remaining scope

`session.js` holds serializable run metadata and both city histories; `game.js` exports `exportRun()` for a future local export workflow. No external telemetry, save service, or data transmission is added. The copy returned by `exportRun()` cannot mutate the live run. Reload resets the run.

All major economic parameters are centralized in `GAME_BALANCE`; CPU-specific weights/rules are in `CPU_DOCTRINES`. The model is illustrative, without empirical calibration, depreciation, trade, random shocks, or policy institutions. There is no global score or GDP winner. Relative and absolute productivity gaps are both reported because they can move differently.

See the [gameplay report](GAMEPLAY_OVERHAUL.md), [earlier visual report](VISUAL_OVERHAUL.md), [direct-manipulation report](DIRECT_MANIPULATION.md), [presentation report](PRESENTATION_PASS.md), and [current cleanup report](CLEANUP_PASS.md). Art remains explicitly temporary pending curated release sprites. Classroom, Firefox/Safari, physical low-end mobile and human assistive-technology testing remain outstanding.
