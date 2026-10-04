# Rival Cities

A ten-round city-building rivalry game. Start Game randomly assigns Meridian or Rivermark. A brief city advisor introduces district investment; the rival develops out of view in rounds 1–2 and is revealed at the beginning of Round 3. The result interprets the player’s starting role using final output per worker, gap change and own productivity growth, followed by the full economic debrief.

## Ambient life, traffic, rival staging and comparison pass

Runtime changes:

- `district-layout.js`: district centers on the far row/column move outward by one tile; roads widen from 1 to 1.6 tiles with separated lane centers. The main grid grows from extent 17 to 19, with a dedicated agricultural extension beside Resources. Sidewalks remain continuous and separated from roads. Native district artwork stays at its existing scale.
- `visual-config.js`: world/camera become 1344×816 / 1312×784, with a larger hitbox height to retain phone tap areas. Two directional lane loops carry up to five vehicles. Bus desired speed is 2.3 tiles/sec, freight 1.7, service van 1.45, tractor 0.8; following and yielding can lower actual speed. The tractor has its own farm/service route and never joins city traffic. Worker period is 192 ticks; campus walkers retain 384 ticks.
- `traffic.js` (new): each vehicle stores route, lane, progress, desired/actual speed, leader and waiting state. Same-lane followers keep body length plus 0.7 tile clearance. Small swept movement steps reject body conflicts; exclusive junction reservations hold other routes outside the turning area. Spawns require clearance, positions survive map redraws, and replay resets the visual world. This is bounded ambient traffic, not an economic calculation or pathfinding system.
- `walking-sprites.js` (new): adapts The Long Run’s original palette, authored person poses and cached-sheet approach from `audit_tools/econ_rpg/game/games/the-long-run/city/sprites.js`. Its `city/entities.js` distance-driven gait pattern is reused: eight poses, front/back views mirrored into four facings, pose changes from distance traveled, and stationary/reduced-motion scenes do not keep cycling. Worker helmets and student pairs use small cached 20×28 cells. The Long Run’s population controller and separate animation clock are not loaded; the existing Rival Cities clock drives everything. No Long Run source files were changed.
- `map-engine.js`: draws the farm service patch, widened roads, reused walking sheets and managed vehicles; exposes route/gait state for QA. Ground-contact depth ordering remains shared with buildings. The farm tractor remains visible on its service route even when resource conditions change.
- `game.js`: the rival mayor’s dock is inside the rival’s `.isometric-map`; placement avoids district controls. Round 3 alone shows each city’s most recently resolved productivity growth directly on its map. The badge explicitly names that round (Round 2 at first reveal, Round 3 after resolution), never mislabels cumulative growth as this round. The top ribbon retains only the role objective during that round. The Strategic Summary now leads with output/worker, latest-round growth, active bottlenecks and gap direction. Abstract technology values remain in details with a last-round change. Rival plans stay hidden until resolution.
- `flow.css`: the rival uses absolute/relative map-container positioning, never fixed positioning. When an overlay would cover a target, the figure occupies an attached dock below its city scene. At narrow widths, growth badges sit in the map’s top edge area to avoid click targets. Existing advisor staging remains intact.
- `index.html`: removes the obsolete white-ring legend and moves expandable economic stocks after the compact strategic summary.

Test/tooling files changed: `package.json`, `tests/ambient.test.js` (new), `tests/ambient-browser.test.mjs` (new), `tests/browser.test.mjs`, `tests/interaction-browser.test.mjs`, `tests/interaction.test.js`, `tests/cleanup.test.js`, `tests/visual.test.js`, `tests/zoning.test.js`, `tests/sidewalk-browser.test.mjs`, and `tests/beta-build.test.js`. Documentation: `README.md`.

Verification: 50 unit tests including unchanged economic locks; five-vehicle traffic stress test spanning 6,000 ticks/750 simulated seconds with clearance, exclusive junctions and continued circulation; farm/road/sidewalk and maximum-lot geometry checks; live walking-frame and collision observations; both mayor assignments and scroll anchoring; reveal-only growth badges; summary/detail hierarchy; hidden rival plans; 320–1440px keyboard/touch interaction; both full ten-round flows including the preserved final report and concept check. Source and staged-beta runtime checks are separate from public deployment.

Real runtime screenshots live in `tmp/games-preview/growth-realms/ambient-pass/`: `01-farm-service-route.png`, `01b-tractor-closeup.png`, `02-walking-frame-a.png`, `02b-walking-frame-b.png`, `03-following-traffic.png`, `04-intersection-yield.png`, `05-rival-mayor.png`, `06-reveal-growth.png`, `07-strategic-summary.png`, and `08-detailed-comparison.png`. These are test evidence only. The paired walking captures show successive poses, not an animated image.

Remaining presentation limits: the isometric routes use discrete four-facing turns, so turns do not blend smoothly. Junction reservations are deliberately conservative and sometimes pause traffic even when separate lanes could pass simultaneously. Small phone scenes use an attached mayor dock and map-edge metric badges to preserve district access. The agricultural extension is a simple field/service strip rather than a detailed working farm simulation. No public deployment was performed; this pass does not claim the game is finished.

## Final report synthesis and concept check pass

The report now follows chart evidence → visible textbook synthesis → existing personalized interpretation → policy connection → four-question concept check → optional ledger. Six short blocks cover productivity; physical capital and diminishing returns; the catch-up effect; human capital; technology and innovation; and complementary inputs/resource bottlenecks. A distinct **Growth Rate ≠ Economic Level** callout illustrates 20 → 24 (+20%) versus 100 → 108 (+8%), including the distinction between narrowing relative gaps and widening absolute differences. The policy transition explicitly maps all four districts to growth-policy categories and preserves opportunity cost.

Personalization reads actual history: early capital allocations of at least half the first two rounds’ budget; otherwise observed resource-constraint rounds, observed adoption-constraint rounds, or actual education/research commitments. It reports those facts without claiming a separately measured causal return. Model formulas, thresholds, outcomes, ten-round data, chart series and existing personalized analysis are unchanged.

The check presents one item at a time with four shuffled choices, choice-specific immediate feedback, unlimited incorrect retries, keyboard support and a simple understood/completed count. Correct responses cannot be double-counted or overwritten. Completion recaps all four ideas. Quiz state is separate from the simulation and resets on replay. The original “Another economy. A new decision.” scenario and equipment-plus-adoption answer are Question 4; its original two distractors remain, with one additional training distractor. There is no second transfer exercise.

Files changed:

- Runtime: `report-learning.js` (new concept copy, run connection, question bank and local check UI); `debrief.js` (report order and policy transition); `game.js` (mount check instead of the old transfer handler); `flow.css` (responsive concept blocks, callout and feedback).
- Tests/tooling: `package.json`; `tests/report-learning.test.js` and `tests/report-learning-browser.test.mjs` (new); `tests/browser-helpers.mjs`; `tests/browser.test.mjs`; `tests/cleanup-browser.test.mjs`; `tests/cues-browser.test.mjs`; `tests/beta-build.test.js`.
- Documentation: `README.md`.

Verification: 47 unit tests including economic locks; local staged-beta dependency/byte check; live ten-round flows for both roles, every distractor and correct answer, retries, no double counting, keyboard focus, completion, replay reset, unchanged run snapshots, 11-point chart series, 20-row ledger, and layouts at 320–1440px. Source and staged-beta browser checks are recorded in `tmp/games-preview/growth-realms/learning-pass/`. The older cleanup/cues suites were adapted to the integrated check but not separately rerun in this pass. No public deployment was performed.

Screenshots (real runtime, test artifacts only): `01-economics-behind-the-race.png`, `02-growth-rate-vs-level.png`, `03-concept-question.png`, `04-incorrect-feedback.png`, `05-correct-feedback.png`, `06-completed-check.png`, plus `07-mobile-synthesis.png`, all in that learning-pass directory.

Remaining instructional limits: start/finish tables and the optional ledger remain descriptive evidence; the visible synthesis and personalized interpretation supply their economic meaning. The pre-existing first/last capital-heavy-round comparison is not a controlled estimate of capital’s contribution, because other inputs also change. The new synthesis does not make such a causal claim. Institutions and broader living-standard determinants are acknowledged, not modeled. This pass does not establish an optimal policy mix or claim the game is finished.

### Exact concept-check questions, answer keys and feedback

Option order is randomized in the game. Correct choices are identified below by content, not displayed letter.

#### Question 1 — Faster growth. Higher productivity?

A smaller economy begins with much less capital per worker and lower output per worker than a richer economy. Its output per worker grows 12%, while the richer economy’s grows 5%. What can we conclude?

- **Correct answer:** The smaller economy is catching up in relative terms, but may still have lower output per worker.

  **Feedback:** Exactly. Faster growth from a lower base narrows the relative gap without necessarily eliminating it. Growth rates and productivity levels answer different questions.

- **Distractor:** The smaller economy now has higher output per worker because its growth rate was higher.

  **Feedback:** Not quite. A higher percentage growth rate does not establish a higher productivity level. Starting points matter; try again.

- **Distractor:** The smaller economy’s reported growth contradicts diminishing returns to capital.

  **Feedback:** Not quite. Diminishing returns can make additional capital more productive where capital is scarce, helping explain faster growth from a lower base. Try again.

- **Distractor:** The smaller economy can close the relative gap only if both growth rates become equal.

  **Feedback:** Not quite. Equal proportional growth preserves the relative gap. Faster productivity growth in the lower-level economy can narrow it; try again.

#### Question 2 — The next unit of equipment

Two otherwise similar economies add the same amount of capital per worker. One starts with little capital; the other already has a large stock. Why might the first receive a larger productivity gain?

- **Correct answer:** The marginal gain from additional capital tends to be larger when the starting capital stock is low.

  **Feedback:** Exactly. With other inputs held constant, diminishing returns means each additional unit of capital tends to add less output as capital accumulates.

- **Distractor:** Additional capital generally reduces output once an economy has a large capital stock.

  **Feedback:** Not quite. A smaller marginal gain is not the same as a negative gain. More capital can still raise output in a capital-rich economy; try again.

- **Distractor:** Accumulating capital automatically reduces the technology available to workers.

  **Feedback:** Not quite. Diminishing returns does not require technology to fall; it describes additional capital’s payoff with other inputs held constant. Try again.

- **Distractor:** Each additional unit of capital raises output by the same amount at every starting level.

  **Feedback:** Not quite. That assumes constant marginal returns. Diminishing returns means the added output generally becomes smaller as capital accumulates; try again.

#### Question 3 — New technology, limited skills

An economy invests heavily in new technology, but workers lack the skills needed to use it effectively. What does this illustrate?

- **Correct answer:** Technology and human capital can complement each other, so weak skills can limit the productivity payoff.

  **Feedback:** Exactly. Human capital helps workers adopt and use new methods. Technology and skills can raise each other’s productivity payoff.

- **Distractor:** Access to new technology raises productivity equally, regardless of workers’ skills.

  **Feedback:** Not quite. Access is not the same as effective use. Skills can limit technology adoption and its payoff; try again.

- **Distractor:** Investment in technology generally removes the need for education and training.

  **Feedback:** Not quite. New methods often require new skills. Technology and human capital can complement each other rather than replace one another; try again.

- **Distractor:** Education must always have the highest return, whatever the economy’s starting conditions.

  **Feedback:** Not quite. This scenario identifies a skills bottleneck, not a universal ranking of policies. Returns depend on starting conditions and other inputs; try again.

#### Question 4 — Another economy. A new decision.

An economy has little equipment per worker, strong schools, reliable infrastructure, and access to existing world technology. Which development opportunity would you expect to be especially valuable?

- **Correct answer:** Combine additional equipment with adoption of existing production methods.

  **Feedback:** Exactly. Scarce equipment can have high returns, while strong schools make existing technology easier to adopt. Together they offer a productivity opportunity, provided resources keep up with the new activity.

- **Distractor:** Prioritize still more basic resource capacity, even though existing infrastructure has ample room.

  **Feedback:** Not quite. Resources matter when they constrain production. With ample infrastructure, extra capacity may contribute less immediately than equipment and better methods that the skilled workforce can use; try again.

- **Distractor:** Prioritize increasing the number of workers, while leaving their equipment and methods unchanged.

  **Feedback:** Not quite. More workers can raise total output, but unchanged equipment and methods limit gains per worker. Scarce capital and strong skills create an opportunity to improve productivity; try again.

- **Distractor:** Prioritize more training while leaving scarce equipment and available production methods unchanged.

  **Feedback:** Not quite. Training can help, but this workforce already has strong skills. Equipment and existing technology offer a way to put those skills to use; try again.

## In-world controls / advisor cadence / outcome framing pass

Runtime changes:

- `game.js`: one local action bubble beside the selected district, with −1 / +1 / +5 / Clear and planned points. Candidate placements avoid every district hitbox. If there is insufficient room, controls dock at the map edge; phones use this layout frequently. All four district statuses replace the dropdown, and board buttons provide keyboard-accessible selection without spending. The board uses existing upgrade thresholds and shows next/current building, funded progress, planned points, and constraint/readiness notes. Rival plans remain hidden until resolution. Resize and render updates reposition controls; the advisor avoids both district targets and the local bubble.
- `index.html`: the city maps are a focusable skip-link destination.
- `flow.css`: local control styling, four-district status board, responsive map-edge fallback, and result hierarchy. Desktop status board remains 230px wide; phone boards use two columns.
- `visual-config.js`: students use a 384-tick walking circuit instead of 128 (one third of their previous speed); workers use 160 instead of 32 (one fifth). Truck and bus periods remain 88/112; tractor/service van periods become 144/128. At the existing 8 fps these preserve a clear traffic/service/walking speed hierarchy without changing routes, geometry or pedestrian art.
- `advisor.js`: skippable contextual check-ins in planning Rounds 5, 8 and 10, in addition to the existing opening, first-click, Round 1 result and Round 3 exchange. Resource strain, skill/tool mismatch, investment mix and relative progress drive the short advice. Dismissal or a positive investment clears that round’s check-in; replay resets the cadence.
- `rivalry.js`: role-aware result categories and goals replace the automatic percentage winner. Meridian can retain its lead with meaningful growth, retain it with weak growth, face significant catch-up, draw level, or be overtaken. Rivermark can make modest progress, substantially narrow the gap, nearly catch up, draw level, overtake, or remain behind. A falling own productivity level is explicitly qualified even when relative standing improves.
- `debrief.js`: final levels are prominent, each city’s growth remains visible, and lead direction plus relative gap change follow. The original instructional analysis, chart, ledger, rival strategy, policy connection and transfer question remain after this result summary.
- `config.js`: Round 3 briefing now asks players to compare lead, gap and growth together. No economic coefficients changed.
- `README.md`: this record.

Framing thresholds are disclosed in the result’s “How this result is framed” section: lead/parity use output per worker displayed to one decimal; a remaining gap within 10% of Meridian is near catch-up; closure of at least 10 percentage points is substantial; Meridian’s meaningful own productivity growth is at least 5% across the run. These are presentation categories, not economic laws, revised production formulas, or a hidden aggregate score. The original relative-gap reference remains Meridian, with the lead direction explicit after an overtake. Midgame goals update if the lead changes, and the status strip shows the leader and current gap alongside growth.

Test files changed: `tests/advisor.test.js`, `tests/rivalry.test.js`, `tests/interaction.test.js`, `tests/browser-helpers.mjs`, `tests/browser.test.mjs`, `tests/interaction-browser.test.mjs`, `tests/sidewalk-browser.test.mjs`, `tests/cleanup-browser.test.mjs`, `tests/cues-browser.test.mjs`.

Verification: 44 unit tests; exact staged-beta package check; both complete ten-round browser flows and role-aware reports; direct controls, budget gating, keyboard and touch at 320–1440px; complete 386-tick sidewalk observations including construction, protected roads, and maximum city layouts. Economic formula/session/doctrine locks still pass. Beta files are staged locally only; no public deployment was performed.

Requested real-runtime captures are in `tmp/games-preview/growth-realms/in-world-pass/`: `03-first-click.png` (district controls), `14-city-plan-board.png`, `13-midgame-advisor.png`, `15-meridian-result.png`, and `16-rivermark-result.png`. They are test artifacts, not implementation assets. `audit.json` records the real played run.

Remaining refinement: the status board is intentionally a compact structured summary. Narrow phones sometimes require map-edge controls rather than controls floating beside a building, and stacked comparisons still require scrolling. No active endgame text awards victory solely to the higher growth percentage; the result thresholds remain game-design judgments and are disclosed. This pass does not rebalance either city or claim the game is finished.

## Advisor / rival staging pass

This pass changes character staging and read-only coaching, preserving the simulation, ten rounds, assignment, delayed reveal, direct allocation, construction, district progression, comparison calculations, report and splash.

Files changed in this pass:

- `characters.js`: larger standing advisor and mayor figures, retaining the established faces and MQ palette.
- `advisor.js` (new): city-specific opening recommendations and Round 1 coaching derived from the actual resolved allocation, stock changes and constraints. Rivermark starts with Industry for equipment; Meridian starts with Schools to complement its strong equipment base. Resource pressure and lagging training take priority over generic nudges.
- `game.js`: mandatory opening without a dismissal button; first positive investment advances dialogue and relaxes the single cue; the follow-up may be dismissed or clears with the next investment. A brief advisor return at Round 1 resolution is independently dismissible. Round 2 has no recurring tutorial. The rival speaks from its own city’s dock; accepting the challenge switches to the player’s city and triggers the advisor reply. The reply clears on dismissal or the next investment. Replay resets all presentation state. None of this state enters the simulation snapshot.
- `flow.css`: larger standing figures, connected speech bubbles, stronger contrast and readable dialogue; smaller rivalry heading bars; viewport placement tied to the owning city. Cards dock below their own map on narrow/short screens or when a desktop overlay would intersect a district target. The single-city camera leaves room for the extra Round 3 HUD rows.
- `tests/advisor.test.js` (new), `package.json`: state-based coaching checks across both cities and four concentrated plans, including actual resource/training constraints and no mutation.
- `tests/browser.test.mjs`: mandatory first action, motivated instruction in both starts, first-click response, post-round coaching, both rival owners/positions, advisor reply, target clearance, larger figures, replay reset and full ten-round flows. Screenshots now write to `tmp/games-preview/growth-realms/staging-pass/`.
- `tests/interaction-browser.test.mjs`: accepts the rival challenge before continuing the existing interaction regression checks.
- `tests/beta-build.test.js`: verifies the new advisor module ships with the exact local runtime.
- `README.md`: this record.

Validation: all 42 unit tests and the isolated beta build check passed; source and staged ten-round browser runs passed; the existing keyboard/touch/direct-investment browser suite passed. Verified rival placement with both player assignments, desktop and responsive views. Formula/session/doctrine hash locks still pass. Screenshots are browser captures, never game assets. This pass is staged locally and is not publicly deployed.

Requested evidence: `02-round-one-guide.png`, `03-first-click.png`, `03b-round-one-coaching.png`, `05-round-three-reveal.png`, `05b-advisor-response.png`. `12-rivermark-mayor.png` shows the other rival on the right; phone opening/reveal captures are also included. The directory contains the full-run audit JSON.

Remaining refinement: the mandatory opening still contains a short instruction paragraph. Larger speech bubbles take more vertical room on narrow phones, where they dock below the associated city; desktop overlays preserve more simultaneous map space. The existing difficulty imbalance is unchanged. This is a character-staging pass, not a finished-game claim.

## Character-guided / map-first pass

Implemented in the runtime, using existing atlases and code-native character portraits:

- `characters.js`: distinct advisor Ellis and rival-mayor SVG portraits.
- `game.js`: short opening dialogue, one Industry/Capital target, first-investment response, tutorial cue removal, second-investment dismissal, and a Round 3 mayor challenge. The same live dialogue node docks beneath the first map on narrow/short screens. Necessary selection, +1/+5, undo, Clear, commit and help controls remain.
- `flow.css`: bottom-left advisor and bottom-right rival cards on desktop; safe corner-aligned docks on narrow/short screens; wider maps; 230px desktop controls; compact race strip. No oversized reveal banner. At 1366px the single city is about 1,065px wide and each comparison map about 658px wide. On phones the two cities stack.
- `cleanup.css`: removed the four numbered tutorial markers and their four duplicate shortcut styles.
- `index.html`: stock dashboard moved into optional comparison details; the compact sticky budget/commit/help HUD remains.
- `splash-layout.js`: shared road rectangles, eight measured district footprints, reserved neighborhood lots and protected river corridor; pure geometry audit. Portrait and landscape scale the same ground and sprite geometry together.
- `hero-scene.js`: continuous water, curved banks, deeper channel, surface glints, bridge parapets, serviced lots and a viewport-matched portrait canvas. No screenshots are loaded as art.
- `map-engine.js`: exports the existing measured `districtSprite` drawing helper for the splash; its playable-city drawing logic is unchanged.
- `tests/browser.test.mjs`: one-cue and first-click dialogue checks, popup/target collision checks, opaque dialogue backgrounds, desktop map width, mobile/touch/keyboard/help, both ten-round flows, rival visibility, report and replay. Existing screenshots now go to `tmp/games-preview/growth-realms/character-pass/`.
- `tests/splash.test.js`, `package.json`: splash placement audit joins the existing 39 unit checks.
- `tests/beta-build.test.js`: verifies the two new runtime modules ship and all staged runtime files match source.
- `README.md`: this implementation and verification record.

Verification: 40 unit tests plus the beta build check; both ten-round browser flows on source and locally staged beta; existing direct-interaction browser suite. Browser sizes include 320, 390, 768, 1366 and 1440px, plus a short 1024×600 viewport. The baseline model/session/doctrine hash checks pass. Beta staging is local only; no public deployment was performed.

Evidence (real browser captures): `01-splash.png`, `02-round-one-guide.png`, `02b-highlighted-district.png`, `03-first-click.png`, `05-round-three-reveal.png`, `06-later-rivalry.png`; mobile splash/advisor/reveal captures and full-run `audit.json` are in the same character-pass directory. These files are test artifacts and are not runtime dependencies.

Remaining refinement: the district upgrade controls and optional economic comparison still read as instructional UI. On phones, comparison requires scrolling between the stacked cities; simultaneous city comparison remains stronger on desktop. The existing city difficulty imbalance and temporary sprite-art status remain unchanged. Physical-device Safari and classroom playtesting are still outstanding. This is a focused presentation pass, not a claim that the game is finished.

The sections below record previous passes.

## Splash / assigned start / Round 3 reveal pass

- `config.js`: centralized `GAME_CONFIG.title`, `totalRounds: 10`, `rivalRevealRound: 3`, and round briefings. `CYCLES` remains the engine identifier but derives its length from the configured round count.
- `rivalry.js`: random assignment, visible-city filtering, and one authoritative productivity-growth race calculation. Scores use one decimal place; matching displayed scores draw. Total output does not decide the winner.
- `game.js`: direct start and replay, nonmodal advisor, first-click follow-up, early rival exclusion from map/HUD/comparison/allocation/result DOM, Round 3 reveal and city-council voice, race scoreboard, accessible help, and round-aware progression.
- `index.html`, `flow.css`, `hero-scene.js`: full-screen splash with centered title and bottom Start Game; full-bleed region drawn from existing sprite atlases with a separate portrait composition; responsive advisor/reveal/score/result presentation. No subtitle or reading links on the splash. The persistent in-game `?` opens concise instructions and an optional deeper Field Guide.
- `debrief.js`: game result before the retained explanation, dynamic round references, all ten round ledger entries per city, and eleven chart points positioned inside the existing chart viewport.
- `package.json`, `tests/rivalry.test.js`, `tests/browser.test.mjs`, `tests/browser-helpers.mjs`, and the presentation/onboarding/cleanup/cues/interaction/visual/sidewalk/zoning browser checks: current-flow acceptance and regression coverage. Presentation/onboarding commands share the authoritative flow suite. `tests/visual.test.js` retains the original formula/coefficient/doctrine/session hashes; only the obsolete six-round briefing-array assertion was replaced by the configured-length assertion. `tests/beta-build.test.js` checks the new runtime dependencies.

Browser test files updated for the new start/reveal flow: `tests/browser-helpers.mjs`, `tests/browser.test.mjs`, `tests/onboarding-browser.test.mjs`, `tests/presentation-browser.test.mjs`, `tests/cleanup-browser.test.mjs`, `tests/cues-browser.test.mjs`, `tests/interaction-browser.test.mjs`, `tests/visual-browser.test.mjs`, `tests/sidewalk-browser.test.mjs`, and `tests/zoning-browser.test.mjs`. Unit/build checks changed: `tests/rivalry.test.js`, `tests/visual.test.js`, and `tests/beta-build.test.js`.

`model.js`, `session.js`, `cpu.js`, `GAME_BALANCE`, rival doctrines, thresholds, map geometry and construction drawings are unchanged. Both economies still resolve together from the first round. Hidden means absent from the early rendered UI, not absent from the simulation. Internal `growth-realms` paths and cycle identifiers remain compatible.

Validation: `npm test`, `npm run test:browser`, `npm run test:visual`, `npm run test:interaction`, `npm run test:cleanup`, and `npm run test:cues` (the latter against locally staged beta files). Screenshots in `tmp/games-preview/growth-realms/ten-round-pass/` come from the actual runtime; they are not loaded by the game. The source and isolated beta staging are local; this pass has not been publicly deployed.

Current limitations: the reveal and later comparison are still information-dense on phones. The splash intentionally uses existing game art rather than a new illustration. Percentage growth gives the catch-up city a substantial difficulty advantage: across five fixed allocation mixes against every eligible rival doctrine, Rivermark won 30/30 samples and Meridian 3/25. This is a limited diagnostic, not an optimal-strategy analysis; coefficients were deliberately preserved. A later balance and outside-playtest pass is still needed.

The sections below record earlier passes and their historical verification details.

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
