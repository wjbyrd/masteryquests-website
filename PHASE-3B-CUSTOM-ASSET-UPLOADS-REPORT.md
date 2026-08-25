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

## Manual Faculty QA Repair

### 1. Official-Asset Integrity Root Cause

The browser generation path fetched the correct official asset bytes but passed its `Uint8Array` to `Core.sha256Hex()`, which is intentionally a text-hash helper. That helper converted the byte array to a comma-separated string before hashing it. The repair adds a strict `sha256BytesHex()` binary helper and a shared `loadEmbeddedThemeAssets()` production routine in `composer-core.js`; the Generate button now calls that same routine. Integrity checks remain mandatory and unchanged in strength.

The three required pre-repair runtime hashes demonstrate the type error:

| Asset | Incorrect pre-repair runtime SHA | Correct manifest/source SHA |
|---|---|---|
| `market-start` | `2b8000895f7a745582b5a5c6a790f4612c1b0f4e7ba0ad9243b7814de0a8ceb8` | `393487865dc2bea151a40ba66338c84f341b9e0404c603af83630d84aecf7af9` |
| `market-gameplay` | `d3637661ee31a63581277f79ecdf43e5d40828e1ff1fd36e95532ce7eed7e9c0` | `1cabe91dbd264c5fceb721f76248c0ad9b6e875daa86bad3f85b9b4a7287519b` |
| `ledger-hall-1` | `792afe9da863bc7b44bbf915c92411e75ad9e3f262713fb939bcaf6a507ac1e5` | `c986d6ea0dff70751b3b2ecb2281777387a530840541bb3f00b464bab660915b` |

### 2. Local and Deployed Behavior

Before repair, both local production and deployed `masteryquests.org` contained the faulty `Core.sha256Hex(bytes)` call and therefore had the same failure. After repair, the local Composer passes real browser generation. The deployed site still serves the pre-repair Composer until this uncommitted repair is published. This is a code-version difference after the local repair, not an artwork or path difference.

The deployed responses used `Cache-Control: public, max-age=0, must-revalidate`; no stale artwork response was found. Composer script cache keys were advanced to `20260825-phase3b-manual-qa`, and the theme-library key was advanced to `20260825-market-gate-label` for the eventual deployment.

### 3. Artwork Byte Comparison

Repository files, local-server responses, and deployed-site responses were byte-for-byte identical for all three required samples:

| Asset | Bytes | Repository SHA | Local response SHA | Deployed response SHA |
|---|---:|---|---|---|
| `market-start` | 784,744 | `393487865dc2bea151a40ba66338c84f341b9e0404c603af83630d84aecf7af9` | same | same |
| `market-gameplay` | 716,792 | `1cabe91dbd264c5fceb721f76248c0ad9b6e875daa86bad3f85b9b4a7287519b` | same | same |
| `ledger-hall-1` | 638,012 | `c986d6ea0dff70751b3b2ecb2281777387a530840541bb3f00b464bab660915b` | same | same |

### 4. Manifest SHA Decision

No manifest SHA was wrong, weakened, or regenerated. All 51 existing manifest hashes continue to match the repository artwork bytes.

### 5. Source-Path Resolution

Path construction was not the defect. Generation now and previously consumes each canonical asset record's `sourceUrl` directly. The browser regression records every requested URL and asserts it exactly equals the corresponding manifest `sourceUrl`. No display label, preset label, theme family, filename guess, or `market-citadel` slug is used to construct an artwork path.

### 6. Market Gate Display Label

The faculty-visible preset label and the two visible start/gameplay asset labels now say **Market Gate**. The stable internal preset ID `market-citadel`, asset IDs, and recipe schema references remain unchanged, so existing Phase 3A/3B recipes continue to resolve.

### 7. Mode-Card Overflow Root Cause

Generated mode images were inserted directly into a fixed `160px` grid row while an earlier generic rule gave them `height:220px`. Portrait and custom images could therefore extend into the title/description tracks. The first wrapper repair also exposed a one-pixel boundary error because its border initially used content-box sizing.

### 8. Mode-Card Fix

Every mode card now receives one shared `.mode-card-media` wrapper. The wrapper owns the fixed grid row, uses `overflow:hidden` and `box-sizing:border-box`, and contains both official and custom images at `width:100%`, `height:100%`, and `object-fit:cover`. The implementation has no per-image exceptions and does not distort images.

### 9. Missing-Guide Root Cause

The guide DOM, configuration resolver, and image-application hook still existed, but a later blank-template rule applied `#wizardBox { display:none !important; }`. This hid valid custom and official Guide selections after they were successfully embedded.

### 10. Guide Rendering Restoration

The blanket hide rule was removed. The existing polished-game pattern was retained: Market Gate, National Ledger, and Labyrinth of Choice all place the Guide in a dedicated panel beside the normal gameplay card, stack it above gameplay at tablet/phone widths, and hide it only during boss presentation. The faculty template uses this one shared normal-game renderer for Standard Campaign and other normal-shell modes; no gameplay, dialogue, or routing logic changed.

### 11. Real Generation Integrity Result

**51/51 PASS.** The new browser test loads the real production Composer page, resolves all 51 manifest records, fetches each `sourceUrl` through the browser, runs the same `loadEmbeddedThemeAssets()` integrity/embedding routine used by Generate, and confirms 51 portable WebP data URIs.

### 12. Mixed Theme and Custom Generation

**PASS.** The durable regression imports and generates this representative recipe through the actual Download button:

- Market Gate preset
- Ledger Hallway 1, Arcane Hallway 2, and Market Hallway 3 official overrides
- custom Start Screen, Guide, Boss 2, Artifact 2, and Exam Drill card

The generated ZIP contains a syntax-valid self-contained game. It embeds 14 selected official assets and five deduplicated custom assets. Standard gameplay loads, the custom Guide is visible, custom Boss 2 and Artifact 2 render, and the browser reports zero console or page errors.

### 13. Four-Viewport Result

**PASS** at `1440x900`, `1024x768`, `768x1024`, and `390x844`. Browser geometry and screenshots verified wide, near-square, and portrait custom mode images plus an official mode image. Artwork remained clipped to the media region, titles/descriptions remained readable, Guide images stayed inside their panel, question/answer regions were unobstructed, and no horizontal overflow occurred.

### 14. Phase 3A Validator

**PASS: 1,043 checks.** The three added checks cover the shared 51-asset production embed routine, portable output, and the Market Gate display label while preserving the stable internal ID.

### 15. Phase 3B Validator

**PASS: 51 checks.** Existing custom upload, validation, normalization, deduplication, precedence, migration, round-trip, portability, and fallback coverage remains green.

### 16. Active Suite

**PASS: 15/15 active runners.** No prior assertions were weakened.

### 17. Manual Repair Files Changed

- `build/faculty-build-composer/composer-core.js`
- `build/faculty-build-composer/composer.js`
- `build/faculty-build-composer/data/official_theme_library.js`
- `build/faculty-build-composer/index.html`
- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`
- `build/faculty-build-composer/tests/run_phase3a_official_theme_validation.js`
- `build/faculty-build-composer/tests/run_phase3b_manual_qa_browser_validation.mjs`
- `PHASE-3B-CUSTOM-ASSET-UPLOADS-REPORT.md`

No deployed `play/` game, question bank, question artwork, official WebP, gameplay/adaptive logic, telemetry, archive, backup, or snapshot was modified.

### 18. Git Diff Check

`git diff --check`: **PASS**. Git emitted only the repository's existing LF-to-CRLF working-copy notices.

### 19. Unresolved Issues

- `masteryquests.org` will retain the pre-repair hash bug until this repair is published; deployment was outside this task and was not performed.
- The durable browser test requires a local Chromium-family browser plus Playwright. It accepts `MQ_BROWSER_EXECUTABLE` when Chrome or Edge is installed outside the default Windows paths.
- The previously documented Phase 3B payload-size, contrast-review, and recipe-only persistence constraints remain unchanged.

No commit was created for the Manual Faculty QA Repair.

### Hallway Transition Runtime Repair

#### 1. Root Cause

The generated configuration, official/custom embedding, hallway slot references, and room-to-stage mapping were already correct. The runtime `showHallwayTransition()` assigned the resolved Hallway 1/2/3 data URI to the overlay's inline `background`, but a later blank-template rule declared a default gradient with `#hallwayTransition { background: ... !important; }`. That author-level `!important` rule overrode the ordinary inline background, so the computed/rendered transition continued to show the shell fallback.

#### 2. Embedded Hallway Assets

The correct hallway assets were already present in `visualTheme.slots`, in the selected official/custom embedded asset data, and in each generated slot reference. No hashing, packaging, manifest, source URL, or artwork byte changed.

#### 3. Old Runtime Hallway Source

The transition function already called `getFacultyVisualSlot(room <= 10 ? "hallway1" : room <= 20 ? "hallway2" : "hallway3")`. Its inline style contained the correct data URI, but the rendered/computed background came from the later important shell gradient. The faculty template's legacy `hallwayImages` array is empty and was not the active source; there were no hard-coded hallway filenames in the active faculty transition renderer.

#### 4. New Resolved Hallway Source

The active renderer continues to use the existing Phase 3A/3B `getFacultyVisualSlot()` result and precedence. Only the stale CSS override was removed. No second hallway configuration system was added.

#### 5. CSS Contribution

CSS was the entire defect. Removing the late important shorthand allows the existing inline gradient-plus-resolved-image background to win. The earlier generic gradient remains in the base `#hallwayTransition` rule and still supplies the default-shell fallback when no configured hallway image exists.

#### 6. Official Hallway 1/2/3 Result

**PASS.** The generated Market Gate mixed build rendered:

- Stage One: `ledger-hall-1`, source `override`
- Stage Two: `arcane-hall-2`, source `override`
- Stage Three: `market-hall-3`, source `override`

The browser asserted both the assigned inline background and the final computed background, not merely presence of the three data URIs in generated HTML.

#### 7. Custom Hallway 1/2/3 Result

**PASS.** A second real Composer download used three faculty custom hallway records. All three transitions resolved with source `custom`, rendered their matching embedded data URI, and retained `cover` sizing.

#### 8. Hybrid Result

**PASS.** The hybrid generated build rendered official Ledger Hallway 1 with source `override`, custom Arcane Hallway 2 with source `custom`, and Market Hallway 3 from the Market Gate preset with source `preset`.

#### 9. Preset Switch and Reset Result

**PASS.** Market Gate plus a Ledger Hallway 1 override was switched to Arcane Archive. Hallway 1 remained `ledger-hall-1`; non-overridden Hallway 2/3 became `arcane-hall-2` and `arcane-hall-3`. Resetting Hallway 1 produced `arcane-hall-1`. Stable precedence behavior was unchanged.

#### 10. Resume Result

**PASS.** Standard Campaign was saved at room 11, the generated page was reloaded, and Continue Standard Run restored room 11. The next rendered Stage Two transition remained `arcane-hall-2` with source `override`. No presentation state was added to or read from the save payload.

#### 11. Four-Viewport Result

**PASS** at `1440x900`, `1024x768`, `768x1024`, and `390x844`. Each of the three official mixed hallways was rendered at every viewport, for 12 official transition checks. Every computed background used the expected data URI, all background layers used `cover`, transition text remained contained, and no horizontal overflow occurred. Representative Ledger, Arcane, and Market screenshots were visually inspected.

#### 12. Browser Regression Result

**PASS.** `run_phase3b_manual_qa_browser_validation.mjs` now performs 19 rendered hallway assertions: 12 official stage/viewport combinations, three custom transitions, three hybrid transitions, and one resumed transition. It generates all three recipes through the actual Composer Download button and checks the resulting runtime computed backgrounds. Existing 51/51 integrity, mode-card, Guide, Boss 2, Artifact 2, inline-script, and zero-console-error assertions remain enabled.

#### 13. Active Suite Result

**PASS: 15/15 active runners.** No existing assertion was removed or weakened.

#### 14. Phase 3A Result

**PASS: 1,043 checks.** Official theme inventory, hashes, embedding, presets, overrides, generation, and stable Market Gate labeling remain green.

#### 15. Phase 3B Result

**PASS: 51 checks.** Custom upload validation, normalization, persistence, precedence, deduplication, fallback, and generation remain green.

#### 16. Hallway Repair Files Changed

- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`
- `build/faculty-build-composer/tests/run_phase3b_manual_qa_browser_validation.mjs`
- `PHASE-3B-CUSTOM-ASSET-UPLOADS-REPORT.md`

No question bank, gameplay/adaptive engine, save schema, telemetry, deployed `play/` game, artwork, archive, backup, or snapshot was modified.

#### 17. Git Diff Check

`git diff --check`: **PASS**. Git emitted only the repository's existing LF-to-CRLF working-copy notices.

#### 18. Unresolved Issues

- There is no hallway-specific unresolved defect in the local production Composer or generated game.
- `masteryquests.org` will continue to serve the committed pre-repair Composer until the combined manual-QA repair is published. Deployment was not performed.

No commit was created for the Hallway Transition Runtime Repair.
