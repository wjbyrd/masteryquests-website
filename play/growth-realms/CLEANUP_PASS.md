# Growth Realms — game-feel / cleanup pass

Implemented in the working game at `http://127.0.0.1:4178/play/growth-realms/`. All screenshots below are captures of that implementation. No screenshot is loaded by the game. The title illustration is a production canvas composition using the existing seven sprite atlases.

## Changes and source locations

Paths in this table are relative to `play/growth-realms/`; ranges are inclusive.

| Feature | Implementation | Files / lines |
| --- | --- | --- |
| Sparse title | Exact requested hook, Start Game, How to Play and Field Guide; removed extra slogans, premise and building captions | `index.html` 27–29; `cleanup.css` 2–6 |
| Shared hero scene | Developed and earlier-stage clusters on continuous terrain, divided by a river with a connecting road/bridge; reused game art | `hero-scene.js` 1–26; `game.js` 286 |
| Short choice / instructions | Concise city descriptions and challenges; exactly three How to Play steps | `game.js` 37–41; `index.html` 28 |
| White selection | Single white ground ring; removed gold diamond, owner flag, warning symbols and planned-allocation rectangles; white +1 feedback remains | `map-engine.js` 164–167; `game.js` 97–122; `cleanup.css` 11–14 |
| Single-city space | No single-city heading rendered; compact condition in the map corner; allocation/progress controls beside map on desktop | `game.js` 68–88; `cleanup.css` 8–10, 22–42 |
| Viewport fit | Map height uses available viewport height, capped at 700px; smaller screens retain stacked layout | `cleanup.css` 27–42 |
| Sticky HUD | Existing 64px cycle/budget strip retained; desktop duplicate title chrome removed; Guide stays available | `index.html` 24; `cleanup.css` 21–25, 40; existing `presentation.css` 13–17 |
| Bottlenecks | Named district-specific badges open short explanations; no standalone exclamation marks | `game.js` 75–82; `visual-config.js` 61–67; `cleanup.css` 15–17 |
| Ambient effects | Removed research, education and factory blinking lights and diagnostic wash. Smoke, river motion, irrigation and construction dust remain | `map-engine.js` 122–135, 155–163 |
| Roads / clearance | Cross road centered between district rows; vehicle loops stay on road corridors. Workers use service-facing edges clear of support buildings. Annex art stays within its district lot | `visual-config.js` 35–36, 52–60; `scene-layout.js` 1–27; `map-engine.js` 70–116 |
| Depth | Static buildings, scenery, moving vehicles, workers and crane participate in the same ground-contact ordering. Removed the all-building erasure mask. Ordering is foot y, then foot x, then stable id | `scene-layout.js` 25–27; `map-engine.js` 95–116, 136–153 |
| Upgrade wording | Named next building, cumulative funded / required points, planned projection and remaining amount; derived from existing investment goals and initial building offsets | `upgrade-progress.js` 1–12; `game.js` 89–106; `cleanup.css` 18–19, 39 |
| Field Guide | Independent rival strategy language; removed computer and deterministic-system explanation | `index.html` 27; `game.js` 277–278 |

Changed production files: `index.html`, `game.js`, `map-engine.js`, `visual-config.js`; added `cleanup.css`, `hero-scene.js`, `scene-layout.js`, `upgrade-progress.js`.

Changed verification/documentation files: `package.json`, `README.md`, `tests/interaction-browser.test.mjs`, `tests/presentation-browser.test.mjs`, `tests/visual-browser.test.mjs`; added this report, `tests/cleanup.test.js`, `tests/cleanup-browser.test.mjs`. Older browser assertions now follow the requested copy and the smaller header. Unrelated repository work was left alone.

## Validation

- 28 pure test groups pass, including the existing frozen economic contract. `config.js`, `model.js`, `cpu.js`, `session.js`, `debrief.js`, and `mq-theme.css` are unchanged.
- Five browser suites pass: gameplay, interaction, animation, presentation and cleanup. These cover both six-cycle runs, independent rival allocation/reveal, direct clicking, +5/clamping/undo, touch/keyboard, construction, combined view, final report, policy connection, transfer answers and replay. No browser errors were reported.
- At **1366×768, scale factor 1**, both managed cities have a **698×543px** map ending at **y=750**, with no scrolling needed to see the playable city. The sticky strip is **64px** high and district targets are approximately **210×183px**. Below-map statistics, comparison and cycle detail remain scrollable.
- Live observation samples all five ambient routes through at least one full loop and a real development transition with construction workers. Route facings cover NE/NW/SE/SW. Pure tests sample every route at eighth-tick intervals against occupied district and support-building footprints; worker paths are checked with their smaller clearance.
- Behind/front captures stop normal motion only after the truck naturally reaches the required road segment, using the existing reduced-motion preference. The audit records its ground position and its actual position in the draw order relative to the research building. No economic state or draw order is patched for these images.
- Player-visible Field Guide, title/instructions and report copy contain no CPU/computer/algorithm wording. Internal technical identifiers remain internal.
- Screenshots and JSON are under the already-ignored `tmp/games-preview/` test directory. Production HTML/JS/CSS references sprite assets, never `tmp/` or test captures.
- All eight changed/added production files served by the local game match this working tree byte-for-byte; hashes are recorded in `tmp/games-preview/growth-realms/cleanup-pass/live-files.json`.

## Live screenshots

All nine captures use a 1366×768 viewport at 100% browser zoom. The two city views are actual managed-city runs, not rival inspection views.

| Capture | File |
| --- | --- |
| Title / shared terrain hero | [01-title.png](../../tmp/games-preview/growth-realms/cleanup-pass/01-title.png) |
| City choice | [02-choice.png](../../tmp/games-preview/growth-realms/cleanup-pass/02-choice.png) |
| Rivermark | [03-rivermark.png](../../tmp/games-preview/growth-realms/cleanup-pass/03-rivermark.png) |
| Meridian | [04-meridian.png](../../tmp/games-preview/growth-realms/cleanup-pass/04-meridian.png) |
| Selected district / +1 | [05-selected-district.png](../../tmp/games-preview/growth-realms/cleanup-pass/05-selected-district.png) |
| Active skills constraint / explanation | [06-bottleneck.png](../../tmp/games-preview/growth-realms/cleanup-pass/06-bottleneck.png) |
| Truck behind research building | [07-vehicle-behind.png](../../tmp/games-preview/growth-realms/cleanup-pass/07-vehicle-behind.png) |
| Truck in front of research building | [08-vehicle-front.png](../../tmp/games-preview/growth-realms/cleanup-pass/08-vehicle-front.png) |
| 9 / 15 → 13 / 15 upgrade preview | [09-upgrade-progress.png](../../tmp/games-preview/growth-realms/cleanup-pass/09-upgrade-progress.png) |

Machine-readable measurements: [audit.json](../../tmp/games-preview/growth-realms/cleanup-pass/audit.json).

## Remaining roughness

The game is not visually finished. Existing temporary atlases are flattened building lots, so parked cars, delivery trucks and forklifts baked into those lots remain static; the independently animated blue vehicle is the research service van. The separate moving fleet uses the corrected routes and depth order. Eight-frame-per-second motion and abrupt isometric turns still look mechanical. Some road-tile joins and late-level annex compositions remain crude. Vehicle-to-vehicle avoidance is not simulated. The title uses the existing sprite family and would still benefit from a curated illustration pass. Cross-browser and physical low-end-device testing remain outstanding.
