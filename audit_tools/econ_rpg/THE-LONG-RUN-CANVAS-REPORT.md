# The Long Run — canvas animation upgrade

Completed September 27, 2026. Local implementation; no publication or deployment performed.

## Scope and original project inventory

The standalone game was implemented in `game/games/the-long-run/index.html`. Inspection found an existing two-canvas 640×360 system, rather than DOM actors: a static town and a separate 30 Hz sprite overlay, embedded alongside the economic engine. This upgrade replaces that implementation, including its horizontal mobile pan, with one modular 480×270 world.

The economic source of truth remains unchanged:

- Years 1–5 each offer three choices; Year 6 is the outcome. All 243 complete paths remain legal.
- Opening events: confidence, energy disruption, productivity breakthrough. Fiscal expansion/contraction/hold, monetary cut/hike/hold, housing/commodities/infrastructure, then support/control/adjustment remain unchanged.
- State includes GDP, potential GDP, price level, inflation, unemployment, interest rate, aggregate demand, short-run supply, long-run capacity, confidence, business investment, government demand, productivity, budget pressure, supply shift and wage pressure.
- Annual snapshots, previous state, effect source years, lags and durations drive the existing calculations and history.
- The AD–AS intersection, seven ending profiles, explanations, transfer challenge and six model snapshots remain unchanged.
- Transition timing remains 420 ms passage, 1,800 ms observation, and 200 ms follow-up. Reduced-motion timing remains immediate.
- Native controls, focus restoration, live announcements, graph descriptions, Pause City Motion and final-scene freezing remain.
- No localStorage, sessionStorage or IndexedDB persistence existed in this game. Reload still begins a new run.
- Existing `tmp/the-long-run-*.cjs` scripts contain economic, UI and previous-artwork checks. New maintained tests capture the exact current economic baseline and replace checks tied to retired canvas dimensions and actor internals.

## Files

Changed:

- `game/games/the-long-run/index.html`: one accessible 480×270 canvas; responsive full-scene layout; five script imports; read-only renderer connection; freight-frequency wording and persistent-asset description.
- Repository `.gitignore`: local visual QA directory.

Created:

- `game/games/the-long-run/city/visual-state.js`
- `game/games/the-long-run/city/sprites.js`
- `game/games/the-long-run/city/entities.js`
- `game/games/the-long-run/city/town.js`
- `game/games/the-long-run/city/renderer.js`
- `game/games/the-long-run/city/README.md`
- `tests/long-run/engine.test.cjs`
- `tests/long-run/browser.test.cjs`
- `tests/long-run/economic-baseline.json`
- This report.

Retired: the inline 640×360 town painter, old palettes/anchors/routes, sprite builders, overlay canvas, embedded actor manager, 30 Hz throttled loop, and sideways city exploration instructions. Historical QA artifacts remain untouched.

## Architecture and artwork

Economic engine → read-only adapter → staged visual controller → persistent world/entities → sprite atlas and layered canvas renderer.

One requestAnimationFrame loop updates delta-time movement at display refresh. Walking art cycles independently at 8 Hz, with eight original contact/passing/lift poses, arm opposition, torso bob, directional mirroring and varied clothing, hair and skin tones. Additional idle and four work poses support waiting residents, private builders and public workers with tools.

Pedestrian roles include shoppers with bags, commuting workers with briefcases, residents, waiting residents, builders and public workers. Enter/inside/exit states use café and market doors and the factory entrance. Road entities include passenger cars, vans, delivery box trucks, industrial flatbeds and construction trucks. A tracked excavator and crane operate within the private site. Road vehicles follow opposing lanes, maintain clearance, and spawn/despawn at edges.

All artwork is authored on the native pixel grid: tiled roofs, divided windows, awnings, shelves, factory presses/conveyor/loading shutter, household basket, street lamps, trees, clouds, steam, road markings and civic improvements. No external textures or copied character assets were introduced. The fixed camera shows every district together.

## Economic channel mapping

| Visual channel | Realized economic inputs | Visible response |
|---|---|---|
| Retail | Consumer confidence, aggregate demand, household purchasing power | Shopping population, store visits, passenger traffic |
| Labor | Unemployment | Commuters and waiting residents |
| Private investment | Business investment | Builders, material traffic, crane/excavator activity, progressive workshops |
| Production | Real GDP, productivity, supply shift | Press/conveyor cadence, output crates, loading activity |
| Efficiency | Productivity | Faster machinery and upgraded equipment without a matching shopper surge |
| Fiscal/public | Government demand | Teal public crews, repair materials/cones, public footway and bus shelter |
| Supply stress | Negative supply shift | Scarce/slower freight, restricted loading shutter, fuel-delay notice, reduced production |
| Price pressure | Price level, inflation, supply costs | Printed grocery and fuel prices; existing dashboard/explanations carry inflation precision |
| Household strain | Existing illustrative work-income formula, unemployment, productivity, price level | Smaller basket, weaker shopping and passenger activity |
| Durable capacity | Potential GDP history | Permanent factory annex |

Confidence first changes retail, then deliveries, output/labor and investment presentation. Supply disruption first changes freight/supply cues, then production, then household activity. Productivity first changes machinery efficiency, then output/freight, then other realized responses. Fiscal changes first affect public work. All sequences finish inside the original watch window; no economic calculation is delayed or changed.

## Six-year memory

The adapter reconstructs visual assets from recorded annual snapshots. Above-baseline business investment advances foundation → frame → walls → permanent workshops. Above-baseline government demand accumulates public footway improvements and a bus shelter. Capacity gains preserve the annex. Labor-market weakness leaves pavement wear that later public activity can repair.

These visual indices are illustrative and never feed into GDP, choices or reports. Completed private/public assets and maximum realized capacity survive later contractions. A repeated render cannot advance construction. Restart resets the world, while ordinary year changes keep actors and positions.

## Motion, accessibility and mobile

Pause cancels the single RAF, freezing pedestrians, vehicles, sprite frames, clouds, steam and equipment. A new decision while paused produces one resolved static view; game timing and controls still work. Reduced motion uses the same static presentation, observes preference changes while running, and avoids transitional animation. Hidden tabs stop and resume without a catch-up jump. Year 6 freezes as before.

The existing textual economic description remains available to assistive technology, supplemented with durable city changes. Exact dashboard values, explanatory feedback, reports and AD–AS descriptions remain HTML/SVG. Freight text now describes frequency because edge-based spawning makes an instantaneous vehicle census inappropriate.

The complete 480×270 scene scales at 16:9, with pixelated rendering and image smoothing disabled. There is no scene pan, cropping or horizontal page overflow. Decision buttons retain their touch target sizes. Phone labels inside the pixel scene are secondary to the readable dashboard and text.

## Validation

- Exact economic-source and interface/timing-source hashes match the retained original version.
- All 243 full economic histories, seven ending profiles, economic explanations and transfer questions match original SHA-256 baselines.
- Every annual AD–AS equilibrium passes its algebraic consistency checks.
- Browser execution covers 243 complete runs, 1,458 report-year entries and 1,458 AD–AS year renderings.
- Actual pointer/keyboard controls cover choices, transition locks, focus restoration, transfer answers, model-year selection and restart.
- Six viewport widths pass: 320, 390, 768, 1280, 1440 and 1920 px. Full-scene aspect ratio, logical resolution, crisp rendering, touch targets and overflow are checked.
- All eight walking poses are distinct; left/right artwork is verified as exact mirroring. Enter/inside/exit states and reversed outward walking were exercised. A walking contact strip supports visual inspection.
- One simulated hour checks entity caps and lane clearance continuously. Observed maxima were 18 people and 9 vehicles, below/equal to caps of 24 and 9. Movement agrees across 30/60 Hz updates.
- Pause compares complete world state and canvas pixels before/after waiting. Decisions while paused, live reduced-motion changes, simulated document visibility events and resume all pass.
- Durable assets remain across contraction and reproduce identically from the same history.
- Screenshots reviewed for baseline, demand, supply, productivity, fiscal expansion, private investment, decline and recovery, plus desktop/mobile layouts and mobile AD–AS.
- No browser page errors or failed application responses were recorded.

Local screenshots, sprite/movement strips and measured draw timings are in the ignored `tmp/long-run-canvas/` directory. Reproduction commands and boundaries are documented in `city/README.md`.

## Remaining limits

- Browser automation and visual inspection used desktop Chrome, including emulated narrow viewports. Physical phones and Firefox/Safari have not been tested.
- The city is an illustrative diorama with simple opposing lanes, bounded populations and a finite set of buildable sites. It does not simulate junctions or a full logistics network.
- On the narrowest phones, pixel labels are small; the numerical dashboard and accessible explanatory text carry precise information.
- Persistence remains within a run; page reload recovery was not part of the original game and was not added.
