# Approved RPG artwork

The current scene assets are supplied, approved raster illustrations. No game-time generator or conversion pipeline exists. The obsolete generated SVG and its authoring script are retired; older reports describe that earlier implementation only.

## Mastery Quests RPG Art Bible — v1

**Art creation.** Approved scenario art is created outside the game runtime and stored as high-quality master images. Maintain a recognizable neighborhood, clear architecture, consistent viewpoint/skyline/waterfront and environmental condition cues. Do not turn scene colors into success/failure scores; construction and completed homes must remain distinct.

**Master artwork.** Canonical PNGs live under `audit_tools/econ_rpg/art/source/`. Future authorized art edits begin with these masters, never by editing or recompressing runtime WebPs. Preserve the originals unless a separate art request explicitly authorizes changes.

**Runtime artwork.** Already-approved browser-ready WebPs live under `audit_tools/econ_rpg/game/art/scenes/`. All five are 1448 × 1086 (4:3). Integration uses these files as supplied, without conversion, optimization, resizing or pixel changes. `approved-assets.json` records the original dimensions, byte counts and SHA-256 hashes of all ten files; tests enforce their integrity.

| Scene ID | PNG master in `source/` | Runtime WebP in `../game/art/scenes/` |
|---|---|---|
| baseline | `linden-baseline.png` | `baseline.webp` |
| pressure | `linden-limited-vacancies.png` | `pressure.webp` |
| maintenance | `linden-deferred-maintenance.png` | `maintenance.webp` |
| construction | `linden-housing-under-construction.png` | `construction.webp` |
| homes | `linden-new-homes-completed.png` | `homes.webp` |

**Important text.** Do not embed instructional wording or generated storefront lettering into artwork. Prefer recognizable architecture, symbols/icons, environmental props and visual condition changes. Keep state labels, economic explanations and accessibility descriptions in HTML so they stay crisp, accessible, editable and searchable. Meaning must never depend on reading tiny signs.

**Division of labor.** Approved artwork is supplied as an asset. Codex integrates it, tests it, renders it responsively and connects it to existing state selection. Codex must not regenerate, recolor, recompress or stylistically reinterpret approved art without an explicit art-edit request.

**Responsive presentation.** Use native 1448 × 1086 HTML dimensions, `width: 100%`, `height: auto`, and `object-fit: contain`. Show the complete frame without cropping or distortion. Test desktop, 390px and 320px for readable condition cues, prominent HTML captions, intact waterfront/skyline, keyboard focus and usable decision placement. Judge differences with captions hidden as well as visible.

**Linden selection and persistence.** Retain exactly five housing IDs, existing condition precedence, thresholds and history/phase checks. Art selection is read-only and must never change economic state, saves or endings. A new image is not a new game mechanic.

**Reference material.** If present, retain `art/reference/neighborhood-style-reference.png` as development-only reference. It is not a runtime asset. That optional file was absent during this integration; no replacement reference was created.

**Privacy and publication.** Masters, reference material and runtime WebPs all remain under the private `audit_tools/econ_rpg/` tree. The preview serves only `game/`; source PNGs are not accessible there. Existing production publication rules exclude the entire tree. There is no release toggle, external asset host, service worker or remote cache.

See [APPROVED-ART-INTEGRATION-REPORT.md](../APPROVED-ART-INTEGRATION-REPORT.md) for the integration record and browser evidence.

## The Main Attraction art direction

The park extends this bible with an elevated 2D amusement-park management scene: classic tycoon-game readability with a modern illustrated finish. Keep recognizable rides, queues, concessions, paths and service areas. Preserve the same park composition, viewpoint, Ferris wheel, coaster, entrance and waterfront across all conditions. Changes show crowding, premium operation, maintenance strain, construction and delivered expansion. No important generated text belongs inside artwork; condition captions and economic meaning stay in accessible HTML.

All six approved park states are supplied complete, at 1448 × 1086. No generation, pixel edits, resizing, cropping, recoloring or recompression was performed. They use the same uncropped responsive image renderer as Linden. The namespace prevents collisions with housing scenes and does not change Linden's files or selection rules.

| Scene ID | Master in `source/main-attraction/` | Runtime in `../game/art/scenes/main-attraction/` |
|---|---|---|
| baseline | `main-attraction-baseline.png` | `baseline.webp` |
| crowded | `main-attraction-crowded.png` | `crowded.webp` |
| premium | `main-attraction-premium.png` | `premium.webp` |
| maintenance | `main-attraction-maintenance.png` | `maintenance.webp` |
| construction | `main-attraction-construction.png` | `construction.webp` |
| upgraded | `main-attraction-upgraded.png` | `upgraded.webp` |

The six masters moved from `art/source/` to `art/source/main-attraction/`; the six generic WebPs moved from `art/scenes/` to `game/art/scenes/main-attraction/`. Filenames and bytes were preserved. `main-attraction-assets.json` contains all twelve original hashes, byte counts and dimensions; scenario tests enforce them. `approved-assets.json` continues to protect the ten Linden files independently.

Park scene priority: materially deteriorated experience after deferred maintenance; completed expansion; ongoing construction; crowd pressure; lower-volume premium operation; baseline. Construction adds no usable capacity until delivery. An expansion can coexist with worn older rides, and maintenance takes visual precedence. Neither premium appearance nor upgraded facilities is a visual score. Captions, indicators and the complete path explain conditions a single image cannot show.

See [MAIN-ATTRACTION-REPORT.md](../MAIN-ATTRACTION-REPORT.md) for exact conditions, validation and screenshots. All source and runtime assets remain private under the existing publication guard.

## The Economy’s Edge — PPF scene guidance

Keep the same four-panel composition across the six approved views. Top left shows capital production; top right shows technology, training and infrastructure preparing future capacity; bottom left shows idle workers and equipment; bottom right shows household goods and services. Idle resources means unused labor/capital, not the number of crates, stored parts or inventories. Future growth is capacity-expanding preparation, not a third category of current output.

Use the existing images exactly as supplied. No important text belongs inside future artwork; keep labels and explanations in accessible HTML. This integration adds no lettering, overlays, crops, recoloring, recompression or pixel edits. All twelve supplied source/runtime files are 1448 × 1086, with pre-move SHA-256 hashes recorded in `ppf-assets.json`.

| Scene | Master in `source/ppf/` | Runtime in `../game/art/scenes/the-economys-edge/` |
|---|---|---|
| balanced | `ppf-balanced.png` | `balanced.webp` |
| consumption | `ppf-consumption.png` | `consumption.webp` |
| capital | `ppf-capital.png` | `capital.webp` |
| slowdown | `ppf-slowdown.png` | `slowdown.webp` |
| recovery | `ppf-recovery.png` | `recovery.webp` |
| growth | `ppf-growth.png` | `growth.webp` |

The runtime namespace was already safe and was retained. Masters were supplied inside `game/art/sources/`; they moved unchanged to `art/source/ppf/` so the preview cannot serve them. No park or Linden master changed. The user-supplied `room-to-stay/` copies were retained, and their original hashes verified before restoring the five missing legacy housing URLs; this keeps the housing configuration and existing tests unchanged.

Economic consistency governs scene selection. At full utilization, more current consumption costs capital output and vice versa. A slowdown leaves more idle resources and less current production without destroying the frontier. Recovery reuses those resources. Growth appears only after completed improvements expand capacity. A strong pipeline alone never triggers growth art, particularly while resources remain idle. The top-right panel is a qualitative illustration, not a literal count of pending projects; completed productivity improvements can remain visible when the pipeline indicator falls.

Current priority is completed growth; disruption/continued slack; recent recovery; consumption or capital emphasis at full utilization; balanced otherwise. A final reallocation after recovery selects its current production emphasis. Keep scene selection read-only and the full 4:3 frame visible at desktop, 390px and 320px. See [PPF-REPORT.md](../PPF-REPORT.md) for precise rules and QA.

## Megastar Mania — concert market art direction

Use the same waterfront concert venue, skyline and elevated, oblique management-game viewpoint across all seven scenes. Maps are the main signal for added or removed tour dates. Crowds communicate attendance and unmet ticket requests; they are not decoration or a reward. Preserve the approved signage as supplied, without adding banners, overlays or repeated decorative lettering. The meaningful labels and explanations remain in accessible HTML.

All fourteen supplied files remain byte-for-byte unchanged at 1448 × 1086. The PNGs were already named `megastar-*.png` in `game/art/sources/`; they moved to the canonical private `art/source/megastar-mania/` folder. The supplied WebPs stayed in `game/art/scenes/megastar-mania/`. No generation, conversion, recompression, cropping or pixel editing was needed. Original locations, byte counts, dimensions and pre-move SHA-256 hashes are recorded in `megastar-mania-assets.json` and enforced by tests.

| Approved original name | Canonical PNG in `source/megastar-mania/` | Runtime WebP in `../game/art/scenes/megastar-mania/` |
|---|---|---|
| waterfront_megastar_concert_at_sunset.png | megastar-baseline.png | baseline.webp |
| quiet_twilight_concert_by_the_bay.png | megastar-surplus.png | surplus.webp |
| neon_sold_out_waterfront_concert.png | megastar-shortage.png | shortage.webp |
| twilight_tour_map_at_the_waterfront.png | megastar-expanded-tour.png | expanded-tour.webp |
| closed_venue_tour_dates_canceled.png | megastar-supply-shock.png | supply-shock.webp |
| underattended_waterfront_concert_at_dusk.png | megastar-demand-drop.png | demand-drop.webp |
| waterfront_concert_under_the_stars.png | megastar-demand-boom.png | demand-boom.webp |

The descriptive original names above follow the approved mapping; those names were not present in the workspace. The integration verified the supplied canonical-name files themselves.

Scene selection uses price history, current preference strength, remaining capacity and recent decisions:

1. **Supply shock:** only the illness consequence. The closed venue has no active performance and no waiting crowd. The next decision explicitly moves to the recovered artist’s remaining performances; canceled capacity is not restored.
2. **Demand drop:** after the interview when tickets wanted at the retained price fall below remaining capacity. A demand decline that still leaves excess requests uses shortage art instead.
3. **Demand boom:** after a limited or full crossover, with strong demand and enough ticket purchases to fill the remaining capacity. A crossover with unsold seats keeps the demand-drop scene.
4. **Expanded tour:** only the immediate consequence of adding dates, in shortage, balance or surplus. The map illustrates the action of adding tour stops and ticket supply, not realized attendance. Advancing returns to market-state art. Larger venues increase capacity without adding tour stops and never trigger this map.
5. **Shortage:** ticket requests exceed available seats at the official price. The sold-out sign, packed venue and shut-out fans show why resale pressure can arise.
6. **Surplus:** available seats exceed ticket purchases before the publicity decline. The performer is on stage; this is weak turnout, not a canceled concert.
7. **Baseline:** the neutral starting view or purchases in balance with available tickets.

A scene is a representative tour view, not a literal count of seats, fans or cities. The supply-shock scene represents the removed performances; later scenes represent those still occurring. The generic source image uses cancellation signage, so postponed performances are described as canceled for their original dates and moved beyond the current window. Art never changes state, price, saves or endings. All seven use the unchanged, uncropped 4:3 renderer and meaningful captions/alt text at desktop, 390px and 320px.

See [Megastar Mania report](../MEGASTAR-MANIA-REPORT.md) and [instructor routes](../MEGASTAR-MANIA-QA-PATHS.md). Masters return 404 from the loopback preview. All source and runtime assets remain excluded by the existing publication boundary.
