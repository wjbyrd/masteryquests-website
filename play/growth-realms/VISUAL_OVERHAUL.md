# Growth Realms — 32-bit visual and animation pass

## Result and protected scope

Detailed modern isometric pixel-art districts replace flat block buildings. Meridian starts with apartments, paved roads, a university, factory, laboratory, warehouse and power facility. Rivermark starts with houses, basic roads, a workshop, farms, school and open research lot. Combined Comparison shows simultaneous development; single-city views enlarge the scene. Phone maps stack.

**No economic rebalancing.** The pre-pass SHA-256 hashes for `model.js`, `cpu.js`, and `session.js` still match exactly. Full `GAME_BALANCE`, `CPU_DOCTRINES`, and `CYCLES` snapshots also match. No formula, bottleneck threshold, point budget, doctrine, control ownership or six-cycle rule changed.

## Files changed

| Files | Change |
| --- | --- |
| city-renderer.js | Renderer facade and preserved shared icons |
| map-engine.js | New layered canvas renderer and lifecycle |
| visual-config.js | New manifest, visual-state mapping, districts and routes |
| visual.css | New panel styling, map zoom, responsive presentation |
| game.js | Pass actual city state/allocations into renderer, coordinate construction, retain completed maps in view, show constraints and partial investment, avoid unnecessary redraws |
| index.html | Load visual CSS; revised map legend |
| config.js | Remove unused null-art hooks only; economic objects unchanged |
| assets/sprites/{capital,resources,research,education,support}.png | Five generated RGBA sheets |
| assets/sprites/generation-prompts.json | Exact final prompts and tool provenance |
| tests/visual.test.js, tests/visual-browser.test.mjs | New state, asset, lifecycle and browser acceptance checks |
| tests/visual-economy-lock.json | Frozen pre-pass economic contract |
| tests/browser.test.mjs | Update obsolete SVG selectors to new construction state |
| package.json, README.md, assets/README.md, VISUAL_OVERHAUL.md | Test scripts, asset contract and documentation |

The earlier gameplay report, `styles.css`, model/CPU/session modules and unrelated repository files are untouched.

## Renderer architecture and asset manifest

Each city uses nine fixed **768 × 512** canvas layers: **terrain → water → roads → buildings → construction → units → ambient → ownership/selection → resolution effects**. Terrain, roads, buildings and selection remain cached until a state/view/selection change. District and contextual sprites are depth-sorted within the static layer. Fixed-route units are alpha-masked behind building sprites to avoid traffic on roofs.

`visual-config.js` centralizes `ASSETS`, `BUILDING_VISUALS`, `SUPPORT`, `SPRITE_ROUTES`, `DIAGNOSTICS`, palette, scale, anchors and coordinates. Raster filenames are not scattered in renderer code. `visualState()` derives presentation from the model without mutating economics. Code-native terrain/road/effect colors are also centralized; substituting raster effects would need a small drawing adapter.

## Building levels

| Model level | Capital | Resources | Research | Education |
| --- | --- | --- | --- | --- |
| 0 | Serviced lot | Cultivated land | Open research lot | Local school |
| 1 | Workshop | Organized farm | Technical office | Expanded school |
| 2 | Factory | Irrigation/storage | Laboratory | Technical college |
| 3 | Industrial complex | Mechanized agriculture | Research center | University |
| 4 | Advanced manufacturing | Resource network | Technology campus | Large university |
| 5 | Integrated logistics | High-efficiency resource system | Innovation district | Education/training campus |
| 6+ | Level-5 asset plus one visible annex for each additional actual model level, in all categories | Same | Same | Same |

Starting levels remain **Meridian 3/2/2/3; Rivermark 1/1/0/1**, in capital/resources/research/education order. Existing cumulative investment thresholds remain **4, 15, 30, 50, 80, 120**, added to those starting levels. No second progression system exists. Capital levels also control dirt/improved/paved/arterial road treatment and contextual urban density. Editing an uncommitted plan never awards buildings.

## Construction states and allocation priority

Supported states: **absent, site prep, construction, complete, upgraded**. Threshold-crossing commitments animate **site prep → foundation → frame → finishing → complete**, five 480 ms phases over the existing **2.4 seconds**. Existing sprites yield to foundation/frame/scaffolding; the pending model-level sprite appears in the final phase. Economics still commit atomically at the end, when HUD values, rival allocation and consequences update.

Intensity affects presentation only: **0 none; 1–3 minor; 4–6 small; 7–9 major; 10+ push**. It controls site size, workers, dust and additional crane-hook activity. The largest allocation gains the largest site treatment and a gold progress accent; ties share priority. Each city uses its own committed allocation.

Below threshold, the completed district remains. Crews prepare a smaller site, and stored materials persist after resolution. Material counts and the inspection percentage derive from cumulative investment between existing thresholds. Exactly reaching a threshold clears partial progress. A three-point education commitment leaves the current school rather than creating a university.

Reduced motion applies final visuals and economics immediately. Enabling it during construction completes the transition on the next frame. A visual timestamp clamp handles browsers whose first rAF timestamp slightly precedes the commit timestamp.

## Ambient animation and fixed routes

Implemented at **8 FPS**: smoke, irrigation pulses, lab/campus/equipment lights, river ripples, construction dust and crane hook, trucks, buses, tractors, service vans, students and workers. Short resolution labels distinguish upgrades from site progress, then expire. Changed HUD values receive a fixed-width stepped highlight. No pathfinding was introduced.

| Route | Activation | Duration |
| --- | --- | --- |
| factoryTruck | Capital ≥ 1 | 88 ticks / 11 s |
| campusBus | Education ≥ 2 | 112 ticks / 14 s |
| farmTractor | Resources ≥ 1; no shortage/excess-capacity flag | 100 ticks / 12.5 s |
| researchService | Research ≥ 1; no resource shortage | 104 ticks / 13 s |
| campusStudents | Education ≥ 1 | 128 ticks / 16 s |
| constructionWorker | Funded district during construction | 32 ticks / 4 s; removed at resolution |

Route checkpoints are tile coordinates; construction-worker points are relative to the funded district. Movement uses discrete positions and mirrored facing.

## Existing diagnostic indicators

| Diagnostic | Visual representation |
| --- | --- |
| Resource shortage | Strain marker, muted dry-field tint, irrigation/smoke muted, fewer service routes |
| Technology adoption | Skills-constraint marker; research stays active while industrial equipment lights are muted |
| Skills underused | Campus marker and text; actual education/equipment tiers remain independently visible |
| Excess resource capacity | Spare-capacity marker; tractor and irrigation stop |
| Capital saturation | Capital-mature marker; mature district stays in place, with small annexes for later raw levels |

Readable chips, tooltips and screen-reader descriptions supplement map markers. Ownership combines text, border trim and a small flag. These are views of existing diagnostic flags, with no new penalties or invented diagnoses.

## Dimensions, sheet frames and temporary art

The [asset contract](assets/README.md) lists exact rectangles, anchors and frame specifications. The four district sheets are **1536 × 1024**, **3 × 2** frames of **512 × 512**. The support atlas is **1254 × 1254** with sixteen measured rectangles correcting uneven generated gutters. All five are RGBA, generated with the **built-in image generation tool** and copied unchanged. [Exact prompts](assets/sprites/generation-prompts.json) are included.

Recommended logical dimensions: tile **64 × 32**; district master **256 × 256**, ground **192 × 96**; vehicle **48 × 48**, bus **64 × 48**; people **32 × 48**; construction **256 × 256**. Current district sprites display at **238 × 238**. Current FX: smoke/dust/river **6 states**, irrigation **3**, lights/hook **4 ticks**, all at 8 FPS. Units have **one pose plus mirrored facing**, with position animated along routes. There are no authored walk/wheel sheets yet. Optional future raster FX sheet sizes are documented without claiming those files exist.

All five atlases are explicitly temporary and marked for replacement by curated release art. Terrain, roads, materials, selection lines and small FX remain code-native pixel art. Districts, housing, utilities, construction stages and units are raster sprites.

## Performance

One shared requestAnimationFrame scheduler caps visual updates at **8 FPS** across both cities. No intervals or per-unit timers. View changes replace the map registry and reconnect one IntersectionObserver; offscreen maps skip ambient paints. `document.hidden` stops the shared clock and returning restores one loop. Reduced motion leaves zero animation loops. Page exit cancels the clock and clears references. Construction clears at resolution; result labels expire after 1.5 seconds.

At most five persistent moving sprites per city. Construction adds at most three worker groups and four dust puffs per funded district for 2.4 seconds. Eighteen fixed-resolution canvases use about **27 MiB** of backing storage for two maps; decoded atlases add about **30 MiB**, excluding browser overhead. Five PNG files total **11,576,104 bytes / 11.04 MiB**. No device-pixel-ratio canvas multiplication, new runtime dependency or build step.

## Verification and screenshots

**12 existing model groups and 8 new visual groups pass.** Economic hashes/snapshots pass. The existing browser suite completes full runs for both player choices, reveal timing, reports, replay and responsive layouts. The visual suite covers the 12 requested acceptance cases through pure-state and live-browser checks, including real changing construction frames, priority, both cities, catch-up/frontier paths, all diagnostics, reduced motion, reset, singleton-loop cleanup and visibility pause/resume. Browser checks pass at 320/390/768/1440/1600 pixels with no page overflow or browser errors. Screenshots were visually inspected.

Local screenshot evidence lives under the ignored preview directory:

1. [Starting Combined View](../../tmp/games-preview/growth-realms/visual-pass/01-starting-combined.png)
2. [Meridian close view](../../tmp/games-preview/growth-realms/visual-pass/02-meridian-close.png)
3. [Rivermark close view](../../tmp/games-preview/growth-realms/visual-pass/03-rivermark-close.png)
4. [Construction in progress](../../tmp/games-preview/growth-realms/visual-pass/04-construction.png)
5. [Cycle resolution](../../tmp/games-preview/growth-realms/visual-pass/05-cycle-resolution.png)
6. [Later-stage catch-up](../../tmp/games-preview/growth-realms/visual-pass/06-later-catch-up.png)
7. [All-diagnostics isolated fixture](../../tmp/games-preview/growth-realms/visual-pass/07-diagnostic-fixture.png) — a rendering fixture, not a claimed natural economic outcome.
8. [Stacked phone view](../../tmp/games-preview/growth-realms/visual-pass/08-phone.png)

## Unresolved issues

No known economic or functional blocker remains. Art is temporary: single-pose people/vehicles, generated support gutters, and code-drawn small FX are the principal release-art limitations. Firefox/Safari, physical low-end mobile hardware and human screen-reader/classroom testing remain unverified; automated evidence uses Edge/Chromium. Screenshots are local review artifacts, not published assets. This pass has not deployed the game.
