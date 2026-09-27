# The Long Run — 16-bit artwork and pedestrian motion pass

Completed September 27, 2026. This is a refinement of the accepted Canvas engine. The economic engine, economic-to-visual formulas, six-year progression, persistent assets, public/private distinction, interface, dashboard and reports were retained.

## Requested summary

| Item | Result |
|---|---|
| 1. Internal resolution | **480×270 before and after.** Measured scene widths are 840px at a 1440px viewport and 960px at 1280px. The latter gives exact 2× scaling. A 640/800 grid would require rescaling the established world and would make 28px people smaller at the same display size. The existing grid supports the redrawn artwork without that tradeoff. |
| 2. Scaling | Existing composition and responsive 16:9 CSS remain unchanged. No individual sprite is fractionally scaled; atlas frames are blitted 1:1 at integer coordinates. Whole-scene CSS scaling remains 1.75× at the large desktop layout, 2× in the stacked desktop layout, and proportionally smaller on phones. |
| 3. Smoothing | Main canvas and all atlas contexts retain `imageSmoothingEnabled = false`; the blitter explicitly enforces it. Integer drawing/translation and CSS `image-rendering: pixelated` preserve hard edges. No gradients, photographic textures or noise filters were introduced in the world. |
| 4. Pedestrian dimensions | **18×24 → 20×28 pixels.** Six controlled silhouette/clothing/head variants, three skin ramps, jacket/sleeve variations, hair/cap variation, shopping bags and briefcases. Public crews retain teal/white; private builders retain ochre/yellow. |
| 5. Walk frame count | **Eight newly authored lateral body poses**, with explicit contact/down/passing/up phases on both sides. Thighs, knees, shins, shoes, opposite arms and torso position change together. Separate front/back and carrying poses reuse the same eight-phase cadence. |
| 6. Walk FPS | **6–8.5 pose frames/second**, derived from actual speed; nominal 8 FPS at 16px/s. Time spent blocked does not advance the gait. Three cached ankle offsets compensate contact between body poses; they do not add body poses or independent animation clocks. |
| 7. Walking velocity | Existing **12–17 world pixels/second** retained. One complete left/right cycle covers **16 pixels**, so each displayed body pose corresponds to 2 pixels of travel. |
| 8. Pedestrian states | Added settled turns, inspection, idle/rest, carrying and short work-site repositioning. Existing walking, waiting, entering, indoor, exiting and working behavior remains. Entrance occupancy serializes visitors, and workers have longer indoor dwell than shoppers. |
| 9. Building art | Brick joints and selected face highlights; wood siding; stone block seams; metal panels, ribs and vents; layered window glazing, trim and sills; recessed doors; awning highlights/shadows; roof seams/tiles; gutters; foundation lines; more detailed loading-bay trim. The home and civic facade proportions now accommodate the taller doors within the same districts. |
| 10. Vehicle art | New passenger sedan, distinct enclosed van, box delivery truck, exposed industrial flatbed and aggregate-carrying construction truck. Larger cabins, glass, hood/trunk, handles, bumpers, wheel arches, hubs and body ramps. A public-service van livery uses the already-existing elevated public-activity channel. No new vehicle spawn category, traffic rule or population formula. |
| 11. Palette/shading | Shared upper-left lighting, controlled highlight/base/shadow ramps and common deep outlines. Buildings, foliage, metalwork, people and vehicles share materials. Hard-edged grounding shadows replace floating silhouettes. A representative baseline contains 78 visible colors, including the controlled character ramps. |
| 12. Texture | Deterministic masonry/siding motifs, roof rows, sparse asphalt aggregate/wear, a pavement repair patch, curb divisions, sidewalk seams, drains, richer bark/foliage clusters, restrained grass accents, benches, one hydrant and two planters. |
| 13. Redrawn assets | All pedestrian poses; all five traffic vehicle types plus public van livery; facade/window/door/roof/awning helpers; trees; benches; crates; unfinished masonry; excavator cabin and tracks; fuel pumps and loading-bay details. Finished workshops use the same materials and footprint as the preceding construction. |
| 14. States tested | Stable economy/Year 1, consumer boom, public works/Year 3, supply stress, private investment/Year 5, expanded factory/Year 5, recovery/Year 6, and actual final-outcome freezing. Live animation and static reduced-motion views were checked, plus desktop and phone layouts. |
| 15. Remaining limits | Chrome testing with emulated phone sizes, rather than physical-device or Safari/Firefox testing. Whole-scene scaling remains fractional at some viewport widths, though native sprite drawing is integer-aligned. The scene remains a compact illustrative diorama; very small phone labels rely on the unchanged readable HTML dashboard and descriptions. |

## Why the previous walk slid

The prior pedestrian code selected poses from an elapsed animation clock. It could advance that clock while blocked, and pedestrians with different velocities all used the same fixed frame rate. Foot positions in successive drawings did not account for the distance traveled by the actor.

The new `Pedestrian.move()` accumulates only actual displacement. Pose selection uses `distance / 16 × 8`. During a support phase, the planted ankle moves backward relative to the body by the same amount the actor moves forward. A cached 0/1/2-pixel ankle correction removes the remaining integer-pixel drift between the eight authored body poses. The active sole remains at the world contact point while the other leg bends and swings.

Ground contact is always row 27, immediately above the common foot anchor at row 28. Torso bob is limited to −1/0/+1 pixels and does not move the support foot. Left/right movement mirrors the lateral pose. A 180ms settled turn changes orientation while stationary; door approaches and departures use back/front artwork. Vehicles have pictographic markings, avoiding reversed lettering when mirrored.

Pedestrians no longer need to keep walking in place to show activity. Public and private crews alternate work strokes, inspection, rest, and six-pixel moves. Builders carry materials during those moves. Waiting residents occasionally shift their stance. A blocked pedestrian stands still. Doors admit one crossing at a time; inside workers remain hidden for 15–17 seconds, while shoppers retain their shorter visits. These are visual behaviors only.

## Scale audit

| Asset | Current native dimensions / relationship |
|---|---|
| Person | 20×28 frame; body is narrower than the frame, which includes limb/accessory clearance |
| Door | 18×30 outer frame; 14×28 opening; body and head fit the entrance |
| Passenger car | 52×25; longer than a person is tall, with separate cabin/hood/trunk |
| Van / public-service van | 57×30; higher roof and longer cargo compartment |
| Delivery truck | 68×34; taller box and separate driver cabin |
| Industrial flatbed | 70×32; long platform with exposed cargo |
| Construction truck | 64×32; aggregate bed and yellow/ochre bodywork |
| Trees | Approximately 39–41px tall, layered canopy above people and street objects |
| Road | Existing 48px roadway and both lane baselines retained; clearance uses each vehicle's actual redrawn width |
| Homes / civic / construction | Original district positions and persistent building footprints retained; facade details share the same pixel grid |

The main scene remains 840×472.5 CSS pixels at the large desktop layout and 960×540 in the stacked desktop layout. At a 390px phone viewport it is 354×199.125. At 320px it is 284×159.75. Larger native people retain readable silhouettes at these sizes. Increasing the canvas resolution alone would not improve this relationship.

## Preservation and validation

`fidelity-preservation.json` was captured from the retained pre-pass implementation. Source hashes verify that the entire economic interface/layout, economic mappings, staged visual sequencing, history-based persistence, population targets, spawn logic, vehicle movement logic, static-state reconciliation, door queries, RAF and motion controls remain unchanged. Pedestrian behavior and artwork are the scoped exceptions.

Validation passed:

- **243 complete economic paths**, all seven outcome profiles, all history calculations, instructional explanations and transfer questions against the original baseline.
- **1,458 browser report-year entries and 1,458 AD–AS views**, with native decisions, focus restoration, transfer feedback and restart.
- **12,960 rendered support-foot samples:** both directions × six variants × three speeds × 360 time samples. Maximum measured support-contact drift: **0 pixels**.
- All eight lateral poses are distinct. Left/right mirroring, stopped gait under blockage, a stationary direction-change interval, front/back entrance poses, and movement independence at 30/60 Hz all pass.
- All 11 pedestrian behavior states were exercised. Work, carrying and repositioning alternate with stationary states.
- Live stable, consumer, public, supply, factory, private and Year 6 scenes were captured. Economic state remains identical before/after animation; the actual final controller freezes the scene.
- Six viewport widths: 320, 390, 768, 1280, 1440 and 1920. No horizontal page overflow; aspect ratio, touch target sizes and readable interface retained.
- Pause compares complete state and canvas pixels across a wait. Decisions while paused, reduced-motion changes and visibility/resume remain functional.
- One simulated hour retains the existing bounds and vehicle lane clearance. Observed maxima: 18 people and 9 vehicles, against caps of 24 and 9.
- Main-canvas pixels remain opaque and pixel-aligned; all sampled atlas contexts disable smoothing. No browser errors were recorded.

The final browser draw benchmark measured approximately 1.1ms median and 4.7ms at the 95th percentile on the test host; this is a local measurement, not a guarantee for all devices.

Visual evidence and JSON results are in the ignored `tmp/long-run-canvas/` directory, including `fidelity-contact-strip.png`, `fidelity-live-*.png`, `fidelity-mobile.png` and `fidelity-results.json`.

## Files changed in this pass

- `game/games/the-long-run/city/sprites.js`: replacement people/vehicle artwork, palette, foot correction and shadows.
- `game/games/the-long-run/city/entities.js`: distance-driven gait and scoped pedestrian behavior.
- `game/games/the-long-run/city/town.js`: building, street, landscaping and equipment artwork.
- `game/games/the-long-run/city/visual-state.js`: three centralized gait/turn tuning values only; mapping/controller/persistence code unchanged.
- `game/games/the-long-run/city/renderer.js`: public-service artwork selection for an existing van during already-elevated public activity; loop and layering unchanged.
- `game/games/the-long-run/city/README.md`: current architecture/art/motion documentation and test command.
- New `tests/long-run/fidelity.test.cjs` and `fidelity-preservation.json`.
- This report.

No changes were made to `game/games/the-long-run/index.html` during this pass. The successful Canvas architecture, roadway, district composition and economic UI were not rebuilt. No deployment was performed.
