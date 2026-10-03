# Growth Realms — direct manipulation and legibility

## Completed scope

Planning now opens the player's single-city view. The four visible district clusters are the main allocation interface. Clicking or tapping adds one point, selects the district, updates its planned-investment badge, emits a short floating amount, and updates the remaining budget immediately. Buildings and economic stocks remain unchanged until commitment. Combined Comparison stays available and automatically returns for simultaneous construction and resolution.

**Economic contract preserved:** pre-pass SHA-256 locks still match `model.js`, `cpu.js`, and `session.js`; `GAME_BALANCE`, `CPU_DOCTRINES`, and `CYCLES` equal the frozen snapshot. No building threshold, formula, diagnostic, doctrine, budget, six-cycle rule or control ownership was changed.

## Files changed

| File | Responsibility |
| --- | --- |
| game.js | Direct clicks, live budget, selected-district controls, compact rival planning, simple/detailed comparison, planning view priority and focus |
| index.html | Budget HUD/quick commit, secondary cycle briefing, stylesheet and comparison placement |
| interaction.css | Typography, responsive camera, generous overlays, contextual controls and sticky mobile budget |
| planning-ui.js | UI commands call the existing allocatePoint contract for each point |
| map-engine.js | Camera wrapper, button overlays, selected-area lighting, directional sprite rendering and source-cell alpha cropping |
| city-renderer.js | Export the selection-update API |
| visual-config.js | Camera, hitbox dimensions, directional-unit manifest and corrected routes |
| unit-routes.js | Pure route sampling and facing from projected segment vectors |
| assets/sprites/vehicles-directional.png | Rear/front truck, bus, tractor and van sprites |
| assets/sprites/people-directional.png | Rear/front worker and student groups |
| assets/sprites/directional-prompts.json | Exact generation prompts and provenance |
| tests/interaction.test.js, tests/interaction-browser.test.mjs | New A–L interaction and facing checks |
| tests/browser-helpers.mjs | Shared current-UI allocation helpers |
| tests/browser.test.mjs, tests/visual-browser.test.mjs | Existing full-run and visual regressions adapted to the new UI |
| package.json, README.md, assets/README.md, DIRECT_MANIPULATION.md | Commands, specifications and report |

## Allocation UI replaced

The four-row allocation form is removed from the DOM. It is replaced by one small panel for the selected district: a selector, one-line description, current investment, **−1 / +1 / +5 / Clear**. The selector changes selection without spending, providing an alternative to map clicks. +5 spends `min(5, remaining)`; −1 cannot go below zero; Clear returns the selected category's entire allocation. All commands delegate to the unchanged session function, and edits lock after commitment.

Remaining points and 20 budget pips appear in the command HUD. Both commit buttons stay disabled until all points are spent. The mobile budget remains visible when interacting further down the page. The rival's planning message is one compact card; its allocation stays hidden until resolution. Rival map buttons inspect only. Long economic descriptions moved into Field Guide; cycle briefing is available through a disclosure.

## Direct-map interaction and hitboxes

Four semantic HTML buttons sit directly above the corresponding district sprites in the same camera-transformed world container as the canvases. Their centers derive from `iso(...DISTRICTS[category])`; the manifest defines a **184 × 160 logical-pixel** diamond bounding box with vertical offset **−40**. Diamond shapes avoid adjacent district overlap. There is no pixel-perfect roof targeting or canvas-only mouse handling.

At 1440px the single-city targets measure approximately **271 × 235 CSS pixels**. All measured targets exceed **44 × 44** at 320/390/768/1440px. Each has an accessible name including category, allocated points and activation behavior, a visible focus treatment, and selected state. Enter/Space use native button activation. Touch taps behave identically. The contextual selector and buttons allow full keyboard allocation without using the map.

Selection changes a gold diamond outline and brightens the district. The current district name appears on the map. Planning badges show point commitments, not building levels. Floating feedback lasts 900 ms, uses discrete frames, and becomes static under reduced motion; the accessible announcement and budget update persist. Updates do not replace focused district/control nodes. One feedback timer is cleared on commit/reset/page exit.

The camera displays a **612 × 476** rectangle from the existing 768 × 512 world, offset **(78,18)**. This gives **25.49%** magnification at a fixed map width, removing outer backdrop/terrain while retaining district buildings. Logical economic/building state is unchanged. Single-city maps remain larger than either combined map; mobile combined maps stack.

## Typography audit

| Information | Current desktop size |
| --- | --- |
| Main body, field guide, cycle consequences, final debrief | 16px |
| Important secondary text / concise district descriptions | 14–15px |
| Context selector and action controls | 16px |
| Ownership labels | 13px |
| City statistics | 22px |
| HUD numeric values | 22–27px via clamp |
| HUD labels | 12px desktop, 11px narrow layouts |
| Remaining development points | 28px desktop, 27px phone |
| Section headings | 22–30px |
| Major game heading | 34–44px |

Letter spacing is restrained. Decorative river/brand markings may be smaller; essential state and controls do not depend on them. Comparison, reports, tables, Field Guide, buttons, diagnostics and cycle summaries have explicit readable scales. Automated computed-style checks are recorded in the screenshot directory's `audit.json`.

## Compare Cities

The default summary shows exactly four rows per city: **Output / worker, Current growth (output / worker), Technology, Current constraint**. It then shows starting/current productivity gaps and **Gap narrowing / Gap widening / Little change**, directly using the existing gap calculation without declaring a winner.

**View detailed comparison** reveals the original ten measures, including output, capital per worker, education, labor/capacity, both growth measures, resource utilization and technology adoption, plus full bottleneck explanations. No deep economic data was deleted.

## Directional units and routes

Every active moving type now has NE, NW, SE and SW entries in `UNIT_VISUALS`: truck, bus, tractor, van, worker group and student group. Each uses two distinct generated poses, rear and front, with horizontal mirroring only for the corresponding opposite-bank direction. No arbitrary CSS/canvas rotation is used.

`routeSample()` derives screen-space direction from the same adjacent waypoints used for movement, including the final-to-first segment. Increasing isometric i faces SE; decreasing i faces NW; increasing j faces SW; decreasing j faces NE. Position and facing change together at turns. All routes are axis-aligned in isometric coordinates and projected at a 2:1 road slope. The six audited routes are factoryTruck, campusBus, farmTractor, researchService, campusStudents and constructionWorker.

The truck now uses the front service road and bridge, making front/rear changes easy to see. The service van uses the front/east service corridor. Other route geometry remains compatible; all six use the new facing sampler. Perimeter roads and their lane markings follow these routes and retain the existing capital-driven road quality. Static cars, forklifts and equipment painted into district art are parked scenery, not moving actors.

The [asset contract](assets/README.md) documents actual sheets, crops, anchors and sizes. New vehicle sheet: **1536 × 1024**, 4 × 2 cells; people sheet: **1254 × 1254**, 2 × 2 cells. Both were generated with the **built-in image generation tool**, copied unchanged, and have [recorded prompts](assets/sprites/directional-prompts.json). Runtime alpha-bound cropping removes cell padding and preserves proportions.

## Construction connection

Planning clicks produce feedback at the clicked district without completing it. On commitment, the existing threshold-driven staged construction consumes the exact same allocation. The largest funded category receives dominant site size, gold progress accent, workers and dust. Small non-threshold investments preserve the existing asset and leave materials. None of these presentation choices changes output or investment progression.

## Verification and screenshots

All **24 pure test groups** pass, including the unchanged economic lock. Browser coverage checks map spending, repeated research clicks, +5 clamping, undo/Clear, commit gating, no premature buildings, large targets, computed fonts, concise/detailed comparison, all route facings/turns, real touch taps, keyboard operation, mobile budget visibility and no overflow at 320–1440px. The existing regression suites also cover both full six-cycle player paths, CPU secrecy/reveal, simultaneous construction, reduced motion, final reports, replay, diagnostics and animation cleanup.

A live full-loop audit observes all four directions for each of the five ambient routes. Pure vector tests cover all six routes, including construction workers and loop closures. Vehicle screenshots were visually inspected for actual front/rear appearance, not just direction metadata.

Required screenshots, saved locally under ignored `tmp/games-preview/growth-realms/ui-pass/`:

1. [Initial city-selection screen](../../tmp/games-preview/growth-realms/ui-pass/01-city-selection.png)
2. [Single-city planning](../../tmp/games-preview/growth-realms/ui-pass/02-single-city-planning.png)
3. [District selected](../../tmp/games-preview/growth-realms/ui-pass/03-district-selected.png)
4. [Points allocated on the map](../../tmp/games-preview/growth-realms/ui-pass/04-direct-map-allocation.png)
5. [Simplified Compare Cities](../../tmp/games-preview/growth-realms/ui-pass/05-simplified-comparison.png)
6. [Vehicle heading NE](../../tmp/games-preview/growth-realms/ui-pass/06-vehicle-NE.png) and [vehicle heading SW](../../tmp/games-preview/growth-realms/ui-pass/06-vehicle-SW.png)
7. [Phone planning](../../tmp/games-preview/growth-realms/ui-pass/07-phone-planning.png) and [phone budget/context](../../tmp/games-preview/growth-realms/ui-pass/08-phone-budget-context.png)

## Remaining visual issues and assets

No known functional or economic blocker remains. The seven atlases remain temporary generated art; final curated sprites are optional follow-up work. Current moving units have all required facings, but people use one walking pose per front/rear view and vehicles have no authored wheel-cycle frames. Mirroring also mirrors asymmetric vehicle details. Optional future assets are dedicated walk/wheel cycles and four individually authored views per unit. No additional asset is needed for the implemented controls or direction fix.

Browser verification uses Edge/Chromium and emulated touch. Physical phone performance, Firefox/Safari and human assistive-technology/classroom testing remain unverified. This pass does not publish or deploy the game.
