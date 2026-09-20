# Linden approved artwork

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

**Selection and persistence.** Retain exactly five IDs, existing condition precedence, thresholds and history/phase checks. Art selection is read-only and must never change economic state, saves or endings. A new image is not a new game mechanic.

**Reference material.** If present, retain `art/reference/neighborhood-style-reference.png` as development-only reference. It is not a runtime asset. That optional file was absent during this integration; no replacement reference was created.

**Privacy and publication.** Masters, reference material and runtime WebPs all remain under the private `audit_tools/econ_rpg/` tree. The preview serves only `game/`; source PNGs are not accessible there. Existing production publication rules exclude the entire tree. There is no release toggle, external asset host, service worker or remote cache.

See [APPROVED-ART-INTEGRATION-REPORT.md](../APPROVED-ART-INTEGRATION-REPORT.md) for the integration record and browser evidence.
