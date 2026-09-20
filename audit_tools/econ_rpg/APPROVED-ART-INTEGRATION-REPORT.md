# Approved Linden artwork integration

Completed September 20, 2026. The five approved WebPs replace the generated scene artwork. This remains a private, unpublished prototype.

## Assets and mapping

All ten supplied PNG/WebP files are **byte-for-byte unchanged**, verified against SHA-256 checksums recorded before integration in `art/approved-assets.json`. Every file is 1448 × 1086. No generation, conversion, recompression, pixel resizing, recoloring or image-text editing occurred.

The supplied WebPs were actually in `art/scenes/`, rather than the expected runtime directory. They were moved as-is to `game/art/scenes/`; filenames and bytes were preserved. Canonical PNGs remain in `art/source/`. The optional `art/reference/neighborhood-style-reference.png` was absent, so no reference file was changed or created.

| Scene ID | Runtime URL | Retained HTML label |
|---|---|---|
| baseline | `./art/scenes/baseline.webp` | Existing neighborhood |
| pressure | `./art/scenes/pressure.webp` | Limited vacancies |
| maintenance | `./art/scenes/maintenance.webp` | Deferred maintenance |
| construction | `./art/scenes/construction.webp` | Housing under construction |
| homes | `./art/scenes/homes.webp` | New homes completed |

`selectScene()` is unchanged. Variant order, thresholds, history predicates and phase conditions are unchanged. Only image sources, intrinsic dimensions and descriptions changed. Alt text now describes the supplied scenes rather than the retired illustration's service yard, shop names or scaffolding. Meaningful state labels remain prominent HTML captions; the original consequence text and indicators carry the economics.

## Presentation and obsolete infrastructure

HTML image dimensions now match 1448 × 1086. CSS uses full available width, automatic height and `object-fit: contain`. Removed the old landscape aspect ratio, cover cropping, desktop height cap and phone height/min-height overrides. The complete skyline, crane, buildings and waterfront remain visible without stretching. Approximate image sizes are 748 × 561px on desktop, 334 × 251px at 390px and 264 × 198px at 320px. The compact conditions panel, help, captions and reading order retain their existing treatment.

The loopback preview now returns `image/webp`. No preload was added: 253 measured local control-to-decoded-image transitions had a 35ms median and 201ms maximum, including button activation and focus work. These are local test timings, not a remote-network performance guarantee. There is no service worker, external asset request or new cache system.

Repository references were searched, then current tests and documentation updated before removing `game/art/neighborhood.svg` and `art/build-neighborhood.mjs`. Neither runtime nor QA uses the obsolete pipeline. Historical implementation/refinement reports retain their historical descriptions. The current README and **Mastery Quests RPG Art Bible — v1** now distinguish PNG masters from supplied WebPs and prohibit unrequested reinterpretation of approved art.

## Verification

| Check | Result |
|---|---|
| RPG test suites | 14 passed: engine, storage, scenes, asset integrity, production exclusion |
| Legal paths | All 200 unchanged; frozen serialized-run SHA-256 remains `f5eb10bba272b655a3253ba355b801b0aa7e445147ee4a0bed5ad4ec77cb1d6e` |
| Endings | All five reachable; six decisions per run |
| Scene selection | All five states reachable with unchanged precedence and conditions |
| Saves | Exact reconstruction in every phase; each image and state panel restore on browser reload/resume |
| Browser coverage | 41 complete runs at 1280px, 390px and 320px, plus targeted keyboard/help/storage cases |
| Image loading | All five return HTTP 200 and `image/webp`; native dimensions and 4:3 rendered ratio verified; no broken images |
| Runtime requests | Exactly the five intended local WebP image paths; no PNG-master requests, external requests, CSP violations, console errors or page errors |
| Source isolation | All five master URLs return 404 from the game-only preview root |
| Publication | Real production build excludes the RPG; hashes of every supplied PNG/WebP are absent from published images, even under alternate filenames |
| Unrelated files | Existing protected navigation, games, telemetry, publication and Cloudflare files unchanged |

All five scenes were captured at all three widths and visually reviewed. The supplied neighborhood remains recognizable through its clock tower, shops, road crossing, transit stops, skyline and waterfront. Queues, deterioration, construction and completed housing are distinct. Fine detail is naturally smaller at 320px, but the entire approved frame stays visible and its state caption stays readable. No horizontal overflow; first choices remain within 800px of the scenario-card top on phones. The desktop artwork is intentionally taller than the cropped predecessor to show the complete approved composition.

Semantic headings, figure captions, descriptive alternatives, numeric levels, non-color-only deltas and live state announcements remain. Tab/Enter/Space, visible focus, collapsed help and restart cancellation passed. Reduced-motion behavior is unchanged. This is DOM, keyboard and visual QA, not a claim of NVDA/VoiceOver testing.

## Browser captures

| Scene | Desktop 1280px | 390px | 320px |
|---|---|---|---|
| Baseline | [Image](../../tmp/econ-rpg/scene-1280-baseline.png) | [Image](../../tmp/econ-rpg/scene-390-baseline.png) | [Image](../../tmp/econ-rpg/scene-320-baseline.png) |
| Limited vacancies | [Image](../../tmp/econ-rpg/scene-1280-pressure.png) | [Image](../../tmp/econ-rpg/scene-390-pressure.png) | [Image](../../tmp/econ-rpg/scene-320-pressure.png) |
| Deferred maintenance | [Image](../../tmp/econ-rpg/scene-1280-maintenance.png) | [Image](../../tmp/econ-rpg/scene-390-maintenance.png) | [Image](../../tmp/econ-rpg/scene-320-maintenance.png) |
| Construction | [Image](../../tmp/econ-rpg/scene-1280-construction.png) | [Image](../../tmp/econ-rpg/scene-390-construction.png) | [Image](../../tmp/econ-rpg/scene-320-construction.png) |
| Completed homes | [Image](../../tmp/econ-rpg/scene-1280-homes.png) | [Image](../../tmp/econ-rpg/scene-390-homes.png) | [Image](../../tmp/econ-rpg/scene-320-homes.png) |

Full gameplay examples: [desktop consequence](../../tmp/econ-rpg/consequence-1280.png), [390px consequence](../../tmp/econ-rpg/consequence-390.png), [320px first decision](../../tmp/econ-rpg/first-decision-320.png). Screenshots and [browser results](../../tmp/econ-rpg/browser-results.json) remain ignored development artifacts. Screenshots capture browser presentation; they are not replacement artwork assets.

## File scope and confirmations

Modified: `game/scenarios/housing-scenes.js`, `game/scenes.js`, `game/rpg.css`, `serve.mjs`, `scenes.test.mjs`, `browser.test.mjs`, `publication.test.mjs`, `layout-review.mjs` (removed its obsolete image-height override), `README.md`, and `art/README.md`.

Removed: `game/art/neighborhood.svg`, `art/build-neighborhood.mjs`.

Added: this report and `art/approved-assets.json`. The five supplied runtime WebPs are now under `game/art/scenes/`; the five supplied source PNGs remain under `art/source/`. These supplied files were untracked when the task began; integration did not create their artwork.

Explicit confirmations: supplied PNGs/WebPs used as-is; no image generation; no conversion/recompression; no text added to artwork; meaningful labels remain HTML/accessibility content; scene selection unchanged; economics/gameplay unchanged; RPG private and unpublished; no deployment; no Git push. No changes to save semantics, endings, privacy, telemetry or production configuration. Work stops at this integration.
