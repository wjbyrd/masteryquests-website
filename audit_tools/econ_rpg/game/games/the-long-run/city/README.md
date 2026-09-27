# The Long Run city renderer

This is presentation code. The existing economic engine in `../index.html` owns all decisions, shocks, lags, indicators, annual history, reports and AD–AS calculations. Never write visual values back into that engine.

## Boundaries

1. `visual-state.js`: `adapt(economy)` copies realized quantities into independent visual channels. `VisualController` stages their arrival during the existing watch phase. `memory(history)` reconstructs persistent assets from annual snapshots.
2. `entities.js`: `World` owns a bounded population. `Pedestrian` walks, settles before turning, enters/exits buildings, waits, works, inspects, idles, carries and repositions. Door occupancy prevents overlapping arrivals/exits. `Vehicle` follows a fixed lane with clearance to its leader. Entities retain positions across annual changes.
3. `sprites.js`: original 20×28 people, eight distance-driven walk poses, two idle poses, four work poses, front/back entrance poses and carrying poses. Five vehicle entity types share six artwork types, including a public-service van livery. A bitmap alphabet and bounded sprite-sheet cache keep edges crisp. Lateral direction mirrors the pose; vehicle markings use pictograms rather than mirrored lettering.
4. `town.js`: buildings, environmental details and depth layers on a 480×270 grid. Factory cycles, loading, doors, crane and excavator motion read the world's clocks.
5. `renderer.js`: the single requestAnimationFrame loop; visibility and motion controls; canvas composition; teardown; read-only diagnostics.

These are ordered classic scripts so the standalone prototype also opens from disk. No package or build step is required.

## Timing and tuning

`TUNING` in `visual-state.js` centralizes dimensions, limits, walking/traffic speed, stride length, cloud speed, lane baselines, indoor dwell and transition duration. The RAF follows display refresh independently of the pose cadence. Delta time is capped at 50 ms to avoid teleporting after a stalled frame; hidden tabs stop entirely.

Walking advances by actual traveled distance, not elapsed animation time: 16 world pixels per eight-pose left/right cycle, at the unchanged 12–17 pixels/second. This produces 6–8.5 pose frames/second (8 at the nominal 16px/s speed). The active stance shoe moves backward within the pose as the body moves forward. Three cached 0/1/2-pixel ankle corrections hold the planted foot between key poses; they do not add body poses or advance the gait while blocked. Feet end at row 27, directly above the common ground anchor at row 28. Turns settle for 180ms. Crews alternate work, inspection, rest and short carrying/repositioning tasks; factory workers remain inside longer than shoppers.

The 16-bit art pass retains the 480×270 grid and layout. Native sprites blit 1:1 at integer positions. Whole-scene CSS scales to 840px at large desktop widths and 960px (exact 2×) in the stacked desktop layout. A shared upper-left light direction, controlled color ramps and deterministic material motifs add detail without photographic textures or noise. See `../../../../THE-LONG-RUN-FIDELITY-REPORT.md` for the scale audit and visual verification.

Visual transitions finish within 1.7 seconds, inside the unchanged 1.8-second watch period. `DELAYS` describes mechanism-specific channel ordering. It changes presentation only; all results were already calculated by the economic engine. Paused and reduced-motion users receive the resolved state immediately when they make a decision.

Normal year transitions never rebuild the population. New road vehicles spawn just outside an edge only when lane clearance permits. Pedestrians spawn at sidewalk edges and use explicit building entrances. The opening tableau seeds existing traffic once. Static accessible presentations may reconcile representative populations when the economic state changes.

## Memory and limits

Private construction integrates realized above-baseline investment by year. Public improvements integrate realized public demand. Capacity gains leave an annex; unemployment-related wear can later be repaired by public activity. These are illustrative visual indices, not additional economics. Repeated rendering and long waits cannot add progress. Completed assets remain during later weakness; restarting begins a new world.

The original game has no localStorage save or reload recovery. This upgrade preserves that behavior: persistence means across the six years of the current run. The adapter can reconstruct the same assets from the same stored annual history without serializing animation positions.

The cap is 24 pedestrians and 9 vehicles. Sprite variants are finite, steam uses bounded phases rather than particles, and no timer belongs to an individual entity. There are no DOM measurements inside the RAF loop.

## Accessibility and responsive layout

The canvas retains the existing accessible name and economic description. The description adds durable city changes; it describes freight frequency rather than an exact on-screen vehicle census. Numerical indicators, explanatory callouts, live announcements, focus management, native buttons, reports and AD–AS descriptions stay authoritative.

Pause cancels RAF without changing economic timing. Reduced-motion preference changes are observed live; a static current scene remains available. Final outcomes freeze as before. Visibility changes reset the timestamp to avoid catch-up motion.

CSS scales the entire 16:9 scene without cropping or horizontal panning. Pixels remain at a 480×270 backing resolution regardless of device pixel ratio. On narrow phones, precise values and explanations remain readable in the HTML interface.

## Verification

From the repository root:

```powershell
node audit_tools/econ_rpg/serve.mjs
node audit_tools/econ_rpg/tests/long-run/engine.test.cjs
# In another terminal, with Playwright installed/resolvable:
node audit_tools/econ_rpg/tests/long-run/browser.test.cjs
node audit_tools/econ_rpg/tests/long-run/fidelity.test.cjs
```

`PLAYWRIGHT_MODULE` can point to an existing Playwright package; `BROWSER_CHANNEL` defaults to Chrome and `LONG_RUN_URL` defaults to the loopback preview. No browser tooling ships with the game. Screenshots, pose/movement strips and results go into the ignored `tmp/long-run-canvas/` directory.

`economic-baseline.json` records the original economic source/interface hashes and all 243 economic histories, ending profiles, explanations and transfer questions. Do not regenerate it to make a failed preservation check pass. The test's optional source argument exists solely to capture an independently retained original version.

`fidelity-preservation.json` separately protects the accepted Canvas version's entire interface/layout, economic mappings, visual sequencing, persistence, population targets, spawning/traffic logic and RAF/motion controls. `fidelity.test.cjs` checks rendered support-foot contact in both directions, all six variants and three speeds, along with blocked gait, turns, refresh-rate independence, behavior coverage, smoothing and live economic scenes.
