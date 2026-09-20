# Linden art / visual QA pass

The five-view SVG system now uses stronger architectural drawing, more distinct building treatments, larger condition cues and closer gameplay-card framing. All mechanics, economic text, effects, condition thresholds, endings, debrief logic, scenario ID/version, saves, privacy behavior and publication protections are unchanged. This is a private art pass, not release approval.

## Reference comparison

The actual supplied image, `codex-clipboard-0b5009a6-5235-44d7-aaed-14bbb1fb83ec.png`, was inspected from the attachment's local Temp path. Its strengths are clear dark edges, differentiated facades, recessed blue windows, active storefronts, useful urban detail, controlled local color and a close crop. Its specific building designs, scene layout, mural, signs, figures and distinctive details were not copied. The image is not embedded or shipped with Linden.

| Aspect | Before this pass | Change made | Remaining intentional difference |
|---|---|---|---|
| Crispness | Fine pale outlines disappeared when reduced | Dark structural edges, pale window surrounds, deep glass, projecting ledges | Flatter vector finish than the reference's drawn texture |
| Architecture | Similar boxes and repeated window bands | Brick/stone/modern facade treatments, projecting bay, double balcony levels, cornices, roof parapets, stronger shopfront glazing | Fewer unique custom facades than a large portrait illustration |
| Density | Sparse props and lightly occupied streets | Produce displays, planters, fuller trees, roof equipment, larger transit shelter, purposeful pavement activity | Crossings and roads retain breathing room for phone readability |
| Color | Washed-out roofs and weak separation of surfaces | Slate roofs, deeper shaded sides, warm masonry and controlled blue glass/green foliage | No painterly texture, dramatic glow or full-scene color grading |
| Line definition | Uniform fine line weight | Silhouette/frame/detail hierarchy, roughly 0.65–2.8 SVG units plus selected thicker structural strokes | Deliberately clean geometric edges instead of hand-drawn irregularity |
| Composition | Small complete board in a wide light surround | Tighter shared viewBox and bounded cover framing; local detail occupies more of the card | The same horizontal neighborhood is retained rather than reproducing the reference's tall composition |
| Personality | Relatively interchangeable facades | Original Quay Books clock turret, stone-bay lettings block and established blue cafe/transit landmarks | Linden's own streets, storefronts and architecture remain distinct |

No sharpening filters, pixelated rendering, CSS contrast filters, upscaling or raster substitution were used. The generator still creates original static vector geometry.

## Artwork and state changes

Five variants were **retained**; none were added or removed. Common ground, streets, rear buildings, traffic, foreground buildings, service yard and waterfront details are shared. The clock turret, intersection, cafe, older apartments and promenade remain recognizable in every view. Separating traffic from foreground layers also corrected an occlusion problem found during visual review: vehicles must stay on the road behind buildings rather than draw over their facades.

- **Baseline:** functional occupied apartments, ordinary street activity and small vacancy notices. No distressed or celebratory lighting.
- **Limited vacancies:** a larger eight-person viewing queue, a small pavement viewing board and a queue boundary outside the established lettings entrance. Normal street activity remains elsewhere.
- **Deferred maintenance:** larger dark/boarded windows across two older facades, exposed masonry, a visible crack, roof patches, full-height scaffold decks and a small cordoned repair area. The rest of the district remains functional.
- **Construction:** a taller lattice crane, several open structural levels, scaffolding, corrugated work-site fencing and stacked materials. There are no glazed apartments, completed front doors or occupied balconies in the frame.
- **Completed homes:** a finished apartment block on that same site, with glazing, balconies, entrance canopy, planting and a few occupants. This view can coexist with fiscal stress; it is not a success grade.

## Files modified / added

Modified, all under `audit_tools/econ_rpg/`:

- `art/build-neighborhood.mjs`: architectural primitives, individually treated buildings, original clock landmark, fuller street details, stronger overlays, correct traffic layer and tighter view framing.
- `game/art/neighborhood.svg`: regenerated five-view shared illustration; approximately 406 KB uncompressed.
- `game/rpg.css`: purposeful artwork cover framing and bounded phone image height; no changes to controls or typography.
- `scenes.test.mjs`: unique SVG/scene IDs, exactly five views and valid local fragment references.
- `browser.test.mjs`: all scenes/runs at 390px in addition to desktop/320px, caption-free image checks, per-view reload, and phone height/decision-flow checks.
- `art/README.md`: explicit reference comparison and **Mastery Quests RPG Art Bible — v1**.
- `README.md`, `REFINEMENT-REPORT.md`, `IMPLEMENTATION-REPORT.md`: current documentation and links from historical reports.

Added: `ART-QA-REPORT.md` (this report). Generated screenshots and a local comparison gallery live only in ignored `tmp/econ-rpg/`. No reference asset, library, package, service or gameplay module was added.

## Validation results

| Check | Result |
|---|---|
| RPG engine/storage/schema + scene + publication suites | **13 tests passed** |
| Legal path regression | **All 200 paths unchanged**, six decisions each, all five endings reachable |
| Save compatibility | Frozen hash of all 200 serialized v1 paths unchanged; exact state/history restored |
| Scene schema/assets | Five unique scene IDs, unique SVG IDs, every local fragment exists, shared definitions retained |
| Browser runs | **41 complete runs passed**: 13 opening/ending combinations × 3 widths, plus 2 subsidy paths |
| Scene viewport coverage | All five views at **1280px, 390px, 320px**; additional 640px layout check |
| Visual distinction | Distinct screenshot content with captions excluded; manual side-by-side review at 320px |
| Reload | Scene ID and saved state match after actual page reload/resume for captured saved views |
| Gameplay flow | No horizontal overflow, image capped at 200–240px on narrow phones, first choice less than 800px from card top |
| Keyboard/accessibility | Tab, Enter, Space, visible focus, heading focus, live text updates and restart Escape checks passed |
| Privacy/runtime | No external requests, CSP violations, console errors or runtime errors |
| Existing nearby regression suites | **36 Econ-nections tests passed**, no changes to those files |
| Publication | Real local production build passed; RPG remains excluded; protected production files unchanged |

The frozen path hash is `f5eb10bba272b655a3253ba355b801b0aa7e445147ee4a0bed5ad4ec77cb1d6e`. Scenario ID `housing-crisis` and version `1` remain unchanged. No test expectations for economic behavior were relaxed.

Tests run:

```powershell
node --test audit_tools/econ_rpg/engine.test.mjs audit_tools/econ_rpg/scenes.test.mjs audit_tools/econ_rpg/publication.test.mjs
node audit_tools/econ_rpg/browser.test.mjs
node --test audit_tools/econnections/engine.test.mjs audit_tools/econnections/calendar-date.test.mjs audit_tools/econnections/classroom.test.mjs audit_tools/econnections/classroom-tools.test.mjs
```

Playwright uses the existing local package via `PLAYWRIGHT_MODULE`; no dependency installation was needed. Browser image differences establish distinct renders, not a claim that every learner will notice every cue. Real-phone instructor observation is still useful.

## Screenshots for all five states

Columns use the same viewport within each set. These are captures from the game card, not standalone art shown at an artificially enlarged size. File names beginning `art-only-` contain the matching image with the caption excluded.

| Scene | Desktop 1280px | Phone 390px | Narrow phone 320px |
|---|---|---|---|
| Baseline | [Desktop](../../tmp/econ-rpg/scene-1280-baseline.png) | [390px](../../tmp/econ-rpg/scene-390-baseline.png) | [320px](../../tmp/econ-rpg/scene-320-baseline.png) |
| Limited vacancies | [Desktop](../../tmp/econ-rpg/scene-1280-pressure.png) | [390px](../../tmp/econ-rpg/scene-390-pressure.png) | [320px](../../tmp/econ-rpg/scene-320-pressure.png) |
| Deferred maintenance | [Desktop](../../tmp/econ-rpg/scene-1280-maintenance.png) | [390px](../../tmp/econ-rpg/scene-390-maintenance.png) | [320px](../../tmp/econ-rpg/scene-320-maintenance.png) |
| Construction | [Desktop](../../tmp/econ-rpg/scene-1280-construction.png) | [390px](../../tmp/econ-rpg/scene-390-construction.png) | [320px](../../tmp/econ-rpg/scene-320-construction.png) |
| Completed homes | [Desktop](../../tmp/econ-rpg/scene-1280-homes.png) | [390px](../../tmp/econ-rpg/scene-390-homes.png) | [320px](../../tmp/econ-rpg/scene-320-homes.png) |

[Caption-free local comparison gallery](../../tmp/econ-rpg/art-qa-gallery.html). Prior baseline captures are [desktop](../../tmp/econ-rpg/before-art-pass-desktop.png) and [320px](../../tmp/econ-rpg/before-art-pass-mobile.png). Full gameplay captures include [first decision on a narrow phone](../../tmp/econ-rpg/decision-mobile.png) and [desktop introduction](../../tmp/econ-rpg/intro-desktop.png).

Reproduce the views through ordinary decisions:

1. Baseline: start/replay.
2. Limited vacancies: rent ceiling.
3. Deferred maintenance: rent ceiling → vacancy lottery → phase in repairs.
4. Construction: emergency grants → focused support → inspections → permit reform.
5. Completed homes: continue that construction path → taper support → prioritize access.

## Answers for final art QA

1. **Closer to the reference's crispness and density?** Yes. The frame, window/roof separation, street detail and architectural identities are visibly stronger. It does not claim parity with the reference's much richer portrait-scale micro-detail.
2. **Intentional differences?** Original streets and buildings, simpler vector textures, a calmer horizontal composition and fewer tiny props. No copied mural, garden layout, figures or distinctive reference structure. Five shared views remain maintainable.
3. **Can the five states be distinguished at 320px?** Yes in the caption-free side-by-side captures: the queue, broad repairs, open frame/crane and finished block are visible. Pressure remains subtler than physical construction; inspect it first on an actual phone.
4. **Any scene still visually weak?** Limited vacancies is the least immediately striking. That is preferable to an exaggerated warning or an outcome-grade tint, but an instructor may want a slightly stronger local queue/entrance emphasis after classroom observation. The other four have clear structural differences.
5. **Would further artwork materially improve the game before October?** Most remaining work is cosmetic facade/foliage refinement. A short real-phone recognition check could still justify targeted work on the pressure cue; a wholesale redraw, more variants or new mechanics would not currently be justified.

Accessibility semantics, captions, alt text, focus behavior and economic explanation remain intact. Framing crops peripheral edges rather than the foreground state cues. Text and indicators remain authoritative. No deployment, Git push, remote resource creation, public linking, production-site change or telemetry change occurred.
