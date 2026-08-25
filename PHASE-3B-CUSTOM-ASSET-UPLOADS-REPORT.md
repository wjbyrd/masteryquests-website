# Phase 3B - Faculty Custom Asset Uploads Report

## 1. Clean Committed Phase 3A Baseline

- Production repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`
- Branch: `main`
- Starting working tree: clean
- Phase 3A baseline commit: `ebb3929 Began process to update composer asset build and website`
- No Phase 3B work was mixed into an uncommitted Phase 3A diff.

## 2. Composer Version Before

`4.5s.3a`

## 3. Recipe Schema Before

`1.3.0`

## 4. Pre-Change Active Suite

- Active Composer suite: **14/14 PASS**
- Phase 3A official-theme validator: **1040 checks PASS**

## 5. Supported Custom File Types

- WebP: `image/webp`, `.webp`
- PNG: `image/png`, `.png`
- JPEG: `image/jpeg`, `.jpg`, `.jpeg`

The filename and browser-reported MIME are not sufficient. Actual byte signatures and successful browser decoding are required.

## 6. Rejected File Types

SVG, GIF, AVIF, PDF, HTML, JavaScript, CSS, fonts, audio, video, ZIP files, remote URLs, zero-byte files, malformed raster images, and format/signature mismatches are rejected. No blob URL, local path, or remote URL is accepted as persistent state.

## 7. Source Byte Limit

Maximum uploaded source: **12 MiB / 12,582,912 bytes** per file.

The 51 Phase 3A official files range from 118,066 to 822,628 bytes. The higher faculty limit accommodates high-resolution source photography before normalization without allowing extreme payloads.

## 8. Pixel And Dimension Limits

- Maximum width or height: **8,192 pixels**
- Maximum decoded area: **40,000,000 pixels / 40 MP**
- Scene/mode normalization long edge: **2,560 pixels**
- Character/reward normalization long edge: **2,048 pixels**
- Images are never upscaled.

## 9. Total Custom Payload Limit

- Maximum normalized asset: **6 MiB / 6,291,456 bytes**
- Maximum deduplicated custom artwork per recipe/game: **24 MiB / 25,165,824 bytes**

## 10. Normalization Strategy

The production browser path performs signature validation, decodes the raster, validates decoded dimensions, draws the full uncropped image to an aspect-preserving canvas, and encodes game-ready WebP at quality `0.9`. PNG is a compatibility fallback only if the browser cannot encode WebP. Transparency is preserved, sources are not distorted, and oversized valid sources are proportionally downscaled.

## 11. EXIF And Privacy

Only decoded pixels are written to the normalized canvas payload. JPEG EXIF, GPS, camera metadata, and other source metadata are not copied into the portable recipe or generated game.

## 12. Custom Asset Data Model

Each recipe-scoped record contains a content-addressed `faculty-<sha-prefix>` ID, normalized MIME, SHA-256, dimensions, original dimensions/bytes, normalized bytes, portable data URL, compatible slot IDs, original display filename, and normalization marker. Binary is stored once by ID and compatible slot references point to it.

## 13. SHA And Integrity Model

SHA-256 is computed from normalized bytes. Import verifies data-URL syntax, MIME/signature agreement, byte length, hash, successful decode, and stored dimensions. Generation re-verifies active records. Invalid records are removed, affected slots receive explicit messages, and resolution falls back safely.

## 14. Slot-Fit Warnings

Hard errors cover unsafe or invalid content. Nonblocking quality warnings cover low resolution, portrait art in wide scene/mode slots, very wide scenes, excessively wide characters, and nonsquare reward art. The shell retains `object-fit` and overlay responsibility.

## 15. UI Changes

Every one of the existing 22 Phase 3A slots now has **Upload My Image**, immediate processing status, thumbnail, dimensions, normalized size, custom status, **Replace**, and **Reset to Theme**. Official selectors remain filtered by slot. No separate media manager or image editor was added.

## 16. Accessibility

Custom backgrounds, hallways, and mode art follow decorative semantics. Guide, boss, and artifact records receive the existing slot label as meaningful runtime alt/name text; raw filenames are never used as screen-reader labels.

## 17. Preset And Custom Precedence

Resolution is:

1. Valid faculty custom override
2. Valid official per-slot override
3. Selected official preset
4. Default shell fallback

Changing presets retains custom overrides while all non-overridden slots update.

## 18. Reset Behavior

Reset removes both the custom reference and any stale per-slot official override, then resolves directly to the current preset. Replacing custom with official art removes the custom reference. Unreferenced binary is pruned immediately.

## 19. Portable Recipe Persistence

Schema `1.4.0` stores normalized custom records and slot references inside downloaded recipe JSON. Closing the browser, reopening the Composer, and importing the recipe does not require the original local files. Recipes contain no `C:\fakepath`, object URL, or filesystem dependency.

## 20. Browser Storage Implications

The Composer has no recipe autosave to `localStorage` or IndexedDB. Full custom payloads are therefore kept only in current in-memory state, portable recipe downloads, and generated packages. No large base64 payload is written blindly to browser quota-limited storage.

## 21. Schema Migration

Phase 3A `1.3.0` recipes migrate to `1.4.0` in memory with zero custom assets. Browser import preserved the Arcane preset and its Market boss official override. Durable migration and generation tests pass.

## 22. Custom Recipe Round Trip

A Market preset recipe with official and custom overrides was serialized, parsed, migrated, and resolved again. Preset, official override, custom slot IDs, asset count, data, and hashes were identical. Browser corrupt-import testing preserved valid boss/artifact records while rejecting shared corrupted scene records.

## 23. Official-Only Regression

All four Phase 3A presets, official overrides, preset switching, reset, integrity checks, single-file generation, and old-recipe generation pass. Phase 3A validator remains **1040 checks PASS**.

## 24. Custom Slot-Family Acceptance

Real browser file-input testing covered:

| Family | Input | Result |
|---|---|---|
| Start screen | 1440x900 PNG | WebP, 65 KB, ready |
| Gameplay background | 1672x941 WebP | WebP, 550 KB, ready |
| Hallway | 1440x900 JPEG | WebP, 69 KB, ready |
| Guide | 1086x1448 WebP | WebP, 104 KB, ready |
| Boss | 1086x1448 WebP | WebP, 320 KB, ready; semantic alt verified |
| Artifact | 1254x1254 WebP | WebP, 234 KB, ready; semantic alt verified |
| Mode card | 900x520 WebP | WebP, 110 KB, accepted with low-resolution warning |

## 25. Negative Validation

- Renamed text/non-image: rejected with supported-format message
- SVG policy: rejected
- Zero-byte input: rejected
- Malformed PNG with valid PNG signature: rejected at decode with a clear message
- Source byte, dimension, and pixel limits: rejected
- MIME/signature mismatch: rejected
- Missing custom reference: preset fallback
- Corrupt base64/record shape: rejected structurally
- SHA mismatch: rejected during import verification

The Composer remained usable and retained the previous valid selection when a replacement failed.

## 26. Corrupted Recipe Fallback

A portable recipe with one corrupted shared landscape record was imported through the production UI. Start, gameplay, and mode references fell back to Market Citadel; valid custom boss and artifact records survived. Affected slots receive explicit error state/messages.

## 27. Offline Single-File Portability

A generated custom game was served independently from the Composer/repository server. It loaded with embedded custom and official data URIs and no `blob:`, `file:`, localhost asset, or local-path dependency. Start, mode screen, normal gameplay, hallway progression, custom boss, custom artifact, Unlimited End Practice, and Mastery Report all worked with **zero console errors**.

## 28. Responsive Results

Composer and generated custom games were tested at `1440x900`, `1024x768`, `768x1024`, and `390x844`.

- Horizontal overflow: **0** at all viewports
- Upload/replace/reset controls reachable: **PASS**
- Thumbnails and warnings contained: **PASS**
- Custom start/background readability: **PASS**
- Custom guide/boss/artifact containment: **PASS**
- Custom mode cards: **PASS**
- Phone Mastery Report: **PASS**

## 29. Generated File Sizes

| Representative build | Custom slot use | HTML bytes |
|---|---|---:|
| Phase 3A official-only Arcane | 0 custom | 16,647,916 |
| Light Arcane customization | 1 custom asset / 1 slot | 17,060,110 |
| Moderate Market customization | 3 unique custom assets / 5 slots | 13,127,476 |
| Heavy Market customization | 3 unique custom assets / 10 slots | 11,388,009 |

Validator custom payload: **1,552,294 normalized bytes**. Browser acceptance inputs totaled **2,386,315 source bytes** and normalized to approximately **1.45 MiB**. Moderate/heavy HTML is smaller because reused custom records replace multiple larger official images and are embedded once; slot count alone does not determine output size.

## 30. Deduplication And Cleanup

Content hash IDs deduplicate repeated uploads. The same custom landscape used in multiple compatible slots appears once in `customAssetData`. Tests cover custom-to-custom replacement, custom-to-official selection, reset-to-preset, unused-record pruning, and absence of orphan binary in generated HTML.

## 31. Active Suite Post-Change

**15/15 PASS**. The new Phase 3B validator is registered as the fifteenth active suite entry.

## 32. Phase 3B Validator

`run_phase3b_custom_asset_validation.js`: **51 checks PASS**. It covers policies, signatures, limits, schema, hashes, deduplication, slot compatibility, precedence, switching/reset, migration, round trip, corrupt fallback, portability, single embedding, orphan cleanup, official regression, question-library integrity, and engine contracts.

## 33. Composer Version After

`4.5s.3b`

## 34. Recipe Schema After

`1.4.0`

## 35. Git Diff Check

`git diff --check`: **PASS**. Only expected Windows line-ending notices were emitted.

## 36. Git Diff Stat

Tracked diff before this untracked report:

```text
7 files changed, 310 insertions(+), 40 deletions(-)
```

New untracked implementation files are listed in final status because `git diff --stat` does not include them.

## 37. Final Git Status

```text
 M build/faculty-build-composer/composer-core.js
 M build/faculty-build-composer/composer.css
 M build/faculty-build-composer/composer.js
 M build/faculty-build-composer/index.html
 M build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html
 M build/faculty-build-composer/tests/run_active_composer_suite.js
 M build/faculty-build-composer/tests/run_phase3a_official_theme_validation.js
?? PHASE-3B-CUSTOM-ASSET-UPLOADS-REPORT.md
?? build/faculty-build-composer/custom-asset-core.js
?? build/faculty-build-composer/tests/run_phase3b_custom_asset_validation.js
```

Unauthorized changes under `play/`: **0**. Question banks, question graphs, official WebPs, deployed games, telemetry, Phase 2 authoring/publishers, archives, backups, and snapshots were not modified.

## 38. Deferred Items

### PHASE 2A MARKET GATE GRAPH QUESTION COMPOSER SYNCHRONIZATION

The 48 Phase 2A Market Gate graph questions remain deferred to a separate content-sync phase. Phase 3B did not change Composer question pools.

### FACULTY CUSTOM AUDIO

Music, ambience, sound effects, upload validation, normalization, and packaging remain deferred.

### FULL POLISHED LIVE PREVIEW

The richer generated-game preview and comparison workflow remain Phase 3C work.

## 39. Unresolved Issues

- Full-resolution custom payloads can still produce large recipe JSON and HTML within the documented 24 MiB custom budget.
- The shell intentionally does not perform computer-vision contrast analysis; busy faculty backgrounds rely on the standard overlays and faculty visual review.
- Browser-local autosave is intentionally absent. Portable recipe export is the persistence mechanism.

No commit was created.
