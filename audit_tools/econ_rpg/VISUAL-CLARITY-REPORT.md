# Visual communication and layout review

September 20, 2026. Private prototype only; no push, deployment or production changes.

## Changes

- **Clarity:** brighter cream, ochre, terracotta and blue facades; darker window recesses/roofs and 1.5-unit structural outlines. Color separation comes from authored SVG surfaces, not filters.
- **State cues:** a larger, higher-contrast rental queue and occupied curtained windows; broader exposed masonry with the existing boards/scaffolding; clearer blue construction fencing, cones and open frame; brighter completed apartments with a planted entrance. The same five scenes and all selection rules remain.
- **Backdrop:** clean pale sky `#eef4f8` replaces the yellow-green wash.
- **Waterfront:** brighter blue water, staggered curved ripples, retaining wall/promenade, a short timber landing and one moored launch. No animation. The corrected red car remains on its street plane in every view.
- **Caption:** removed “Linden · Housing district” from the image caption. The current condition is now centered, bold and larger, with the same meaningful label available to assistive technology.
- **Help:** removed the long instructional-model paragraph from gameplay. Five short definitions remain, followed only by “Indicators show simplified scenario conditions, not real-world forecasts.” Extra spacing keeps the keyboard focus outline clear of the first definition.
- **Indicators:** retained the compact names, equal-width bars, muted numeric steps and signed movement. Numeric levels help compare small changes and provide explicit non-color meaning; no qualitative labels or persistent definitions returned.

## Placement comparison

Both layouts were implemented in an isolated browser: existing right-hand panel and a real above-image panel (five horizontal indicators on desktop, stacked on phones). The above version uses DOM order matching its visual order and a larger desktop image. It is a development-only comparison, not a new game mode. Same consequence, viewport and state in each pair; no overflow in either.

| Viewport | Right / below-actions image | Above-panel image | Cost of above placement |
|---|---|---|---|
| 1280px | 748 × 370px, starts at y321 | 1060 × 520px, starts at y513 | Continue moves down 266px; status precedes scene and economics |
| 390px | 334 × 238px, starts at y271 | Same size, starts at y685 | Image and Continue move down 415px |
| 320px | 264 × 200px, starts at y271 | Same size, starts at y685 | Image and Continue move down 415px |

**Chosen: right on wide screens, below scenario/actions on narrow screens.** The above layout provides a larger desktop illustration, but makes secondary indicators interrupt the title → image → condition → consequence sequence. The right layout keeps the image and indicators simultaneously visible, retains a more comfortable prose width, and reaches the action sooner. On phones, above placement provides no image-size benefit. This is a screenshot/layout review, not a student usability study.

[Desktop right](../../tmp/econ-rpg/layout-review/right-1280.png) · [Desktop above](../../tmp/econ-rpg/layout-review/above-1280.png) · [390px right/below](../../tmp/econ-rpg/layout-review/right-390.png) · [390px above](../../tmp/econ-rpg/layout-review/above-390.png) · [320px right/below](../../tmp/econ-rpg/layout-review/right-320.png) · [320px above](../../tmp/econ-rpg/layout-review/above-320.png) · [Measurements](../../tmp/econ-rpg/layout-review/metrics.json).

## QA and screenshots

Visual review at 1280px, 390px and 320px found readable bars/names, prominent condition captions, distinct foreground state cues and no horizontal overflow. Phone art remains 200–240px high; the status panel remains about 405px high. The long construction caption fits at 320px. Fine architectural detail naturally becomes smaller on phones; the queue, worn buildings, construction frame and completed block remain the primary cues.

Semantic headings, figure captions, image alternatives and definition lists remain. The pressure-scene alternative now describes its revised occupied windows and queue. Keyboard Tab/Enter/Space, visible focus, help open/close, restart cancellation and existing live announcements pass. Arrows, signs, numeric levels and textual condition labels convey state without color alone. The new caption text/background contrast is 10.29:1; muted help/numeric text is at least 7.99:1 against the lightest panel background, and teal movement/help text is 7.91:1. Reduced-motion behavior and DOM reading order remain unchanged. Screen-reader semantics were checked through the DOM; no claim of NVDA/VoiceOver testing.

The 13 RPG engine/storage/scene/publication tests passed: all 200 legal paths and all five endings remain, and every serialized completed path matches the frozen pre-refinement SHA-256. Exact save/resume and all five scene selections remain unchanged. The browser suite passes 41 complete runs across the three widths, plus focused layout/help/save checks; all five images decode, differ without captions and survive reload. Zero external requests, CSP violations, console errors or page errors. The actual production build excludes the RPG, and protected production/configuration files remain untouched.

| Requested output | Capture |
|---|---|
| Desktop consequence / chosen panel layout | [1280px](../../tmp/econ-rpg/consequence-1280.png) |
| Mobile consequence | [390px](../../tmp/econ-rpg/consequence-390.png), [320px](../../tmp/econ-rpg/consequence-320.png) |
| Five variants, consistent desktop framing | [Baseline](../../tmp/econ-rpg/scene-1280-baseline.png), [Limited vacancies](../../tmp/econ-rpg/scene-1280-pressure.png), [Maintenance](../../tmp/econ-rpg/scene-1280-maintenance.png), [Construction](../../tmp/econ-rpg/scene-1280-construction.png), [Completed homes](../../tmp/econ-rpg/scene-1280-homes.png) |
| Five variants together | [Desktop sheet](../../tmp/econ-rpg/visual-clarity-scenes-1280.png), [320px sheet](../../tmp/econ-rpg/visual-clarity-scenes-320.png) |
| Simplified help | [Desktop](../../tmp/econ-rpg/state-help-1280.png), [320px](../../tmp/econ-rpg/state-help-320.png) |

## Requested conclusions

1. **Changes easier to notice?** Yes in the reviewed renders: larger queues/occupied windows, broad wear and distinct construction/completion silhouettes improve the difference without captions doing all the work.
2. **Cleaner background?** Yes; pale sky separates from warm buildings, paving and greenery.
3. **Clearly water?** Yes; curved ripples, a moored boat and the landing/retaining edge remove the previous road-like treatment.
4. **State more prominent than location?** Yes; the location caption is removed and the condition is the sole, centered caption.
5. **Best panel placement?** Right on desktop, below actions on phones, based on the rendered comparison above.
6. **Before October: substantive work or polish?** The visible prototype is now mostly at the polish/instructor-review stage. Classroom validation of economic interpretation and a deliberate release/publication review remain substantive decisions; these tests do not establish student comprehension or authorize release. No engine redesign is indicated by this pass.

## File scope

Modified: `art/build-neighborhood.mjs`, generated `game/art/neighborhood.svg`, `game/rpg.css`, `game/scenes.js` (caption only), `game/scenarios/housing-scenes.js` (pressure alt text only), `game/ui.js` (help only), `browser.test.mjs`, `README.md`, and `art/README.md`.

Added: `layout-review.mjs` and this report. Screenshots/metrics are ignored local artifacts under `tmp/econ-rpg/`. Engine, economics scenario, controller, storage, scene selection, publication guard, telemetry and Cloudflare configuration are unchanged. Stop at this focused refinement.
