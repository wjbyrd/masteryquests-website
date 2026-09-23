# Private mini-game scene density pass

2026-09-23. Presentation-only comparison against `e932fd0`. No deployment or push.

## Inventory and scope

| Game | Treatment |
|---|---|
| Room to Stay | Shared scene frame reduced; five scene variants inspected. |
| The Main Attraction | Shared scene frame reduced; six variants, including crowded park and final scene, inspected. |
| The Economy’s Edge | Shared scene frame reduced; six variants, including multi-panel production artwork and final scene, inspected. |
| Megastar Mania | Shared scene frame reduced; seven variants, including expanded-tour map, shortage, surplus, and final scene, inspected. |
| Gameday Rivals | Intentionally unchanged. Its existing desktop image/decision columns already keep both offers visible; mobile uses the existing stacked composition. |
| Takeout Taco: Lunch Rush | Excluded and unchanged. Its production imagery uses its own stylesheet and scene class. |
| GDP Live | Unchanged; no comparable large gameplay scene artwork. |

All 24 affected source images are 1448 × 1086 (4:3). Their wide views, dense crowds, tall buildings and multi-panel compositions share that outer ratio. No separate portrait/widescreen sizing rule was needed. Neither shared RPG scene rendering nor Gameday's scene renderer has an existing image-expansion/lightbox control; no new one was added.

## CSS changes

Only `.neighborhood-scene` and its caption in `game/rpg.css` changed:

- Previously the figure filled the RPG panel plus negative side margins. On both tested desktop sizes the artwork measured 748 × 561 pixels.
- The centered figure now uses `width:100%; max-width:534px`, yielding 532 × 399 pixels of artwork inside its border. This is about 71% of the former width/height. Actual layout dimensions shrink; no transform or viewport-height sizing is used.
- The image keeps `width:100%; height:auto; object-fit:contain`, so the complete art scales proportionally. The frame follows the image rather than reserving a larger empty image area.
- Desktop bottom margin decreases from 24 to 18 pixels; caption vertical padding from 12 to 8 pixels.
- At 540px and below, the existing near-full-width, slightly inset phone framing remains. Bottom margin decreases from 20 to 16 pixels and caption vertical padding from 11 to 8 pixels. Artwork remains 334 × 250.5 at 390px and 264 × 198 at 320px.
- From 541–760px, the scene uses the same centered responsive cap. This also handles the narrower CSS viewport produced by browser zoom.

No heading, narrative, choice, panel, graph, landing-card, or Gameday layout styles changed. Source assets, alt text, captions, scenario content, mechanics, saves, telemetry and navigation code are untouched. Instructional SVGs use separate classes and retain their original sizing and content.

## Visual QA

The before/after browser inspection covers 1366 × 768, 1280 × 720, 390 × 844, 320 × 720, and actual Chrome 200% default zoom in an isolated profile (1366 × 768 browser viewport becomes 683 × 384 CSS pixels, device pixel ratio 2). It uses legal saved runs, the real scene selector and real rendered pages.

At each size, every affected art variant plus opening and completed screens is checked for intrinsic aspect ratio, containment, centering, alt text and horizontal overflow. Opening choice → consequence → continue and Return to Games are exercised through existing controls. Ending instructional graph dimensions and markup are compared with the baseline. Separate before/after geometry/style comparisons cover the library, Taco, GDP Live and Gameday's first active round.

Representative first-choice positions after the game's normal scroll-to-panel behavior:

| Game | Before, desktop | After, desktop | Improvement |
|---|---:|---:|---:|
| Room to Stay | 903px | 727px | 176px higher |
| The Main Attraction | 928px | 752px | 176px higher |
| The Economy’s Edge | 928px | 752px | 176px higher |
| Megastar Mania | 928px | 752px | 176px higher |

Both desktop viewport widths hit the same existing page-width cap. At 1366 × 768, the full scene, context and prompt fit, and the beginning of the first choice appears. At 1280 × 720, Room to Stay's prompt fits; the other prompts reach the bottom edge and choices require a small scroll. The artwork was not made smaller just to force all choices above the fold. At phone widths, unchanged image dimensions retain legibility while spacing brings subsequent content up by 10 pixels. Zoom retains readable full artwork and ordinary vertical scrolling.

Visual inspection includes the crowded park, tour map, housing streetscape, production montage and completed-season scenes. No cropping, distortion, horizontal overflow or new console errors was found. Instructional graphs remain full size; Taco and landing-card sizing remain unchanged.

## Regression checks and evidence

- All 140 before/after scene/phase pairs and 20 unchanged-screen geometry/style pairs pass across the five viewport/zoom configurations; no browser console or page errors.
- All 79 existing unit/regression tests pass, including frozen RPG paths, Gameday seasons, instructional follow-ups, Taco, GDP and private-publication safeguards.
- The old Gameday test's blanket prohibition on edits to `rpg.css` was narrowed to permit this authorized scene-style change. Engine, scenario and frozen economic-path protections remain intact.
- `git diff --check` passes. Changed runtime file: `game/rpg.css` only. No source artwork or public-site files changed.
- Local before/after screenshots, measurement JSON and test output: `tmp/econ-rpg/scene-density/` (ignored QA artifacts). The temporary browser inspection script is `tmp/econ-rpg/scene-density.mjs`.
