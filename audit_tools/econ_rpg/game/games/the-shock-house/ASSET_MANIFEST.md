# Signal House illustrated assets

All shipped art lives in `assets/illustrated/`. Fourteen original plates, sprites, and atlases were generated with the **built-in imagegen tool**, then encoded as WebP. Exact generation/edit prompts are in [PROMPTS.json](assets/illustrated/PROMPTS.json). No external image service is required at runtime. Amounts, dates, puzzle answers, hit regions, and progress are defined in JavaScript/HTML, never inferred from image pixels.

## Panoramas

Each has a 1536×1024 full plate and a matching 768×512 `-768.webp` variant. These five plates are the primary environment; the old SVG furniture renderer is not imported by the game.

| File | Camera ID | Illustrated content |
|---|---|---|
| `panorama_exit.webp` | `hall` | Exit, coat, clock, letter rack, console |
| `panorama_living.webp` | `residence` | Armchair, bag, writing desk, books |
| `panorama_work.webp` | `workshop` | Filing tray, press, machine, input bin |
| `panorama_records.webp` | `archive` | Bookshelves, tin, television, radio |
| `panorama_utility.webp` | `policy` | Shutter, utility meter, fuse box, radiator |

Architecture, light, materials, and wall/floor heights share a reference image. Some neighboring views repeat edge furnishings; panning translates two adjacent plates without a black frame or a room-loading page.

## Close-ups

These dedicated plates also have `-768.webp` variants.

| File | State / use |
|---|---|
| `coat_close.webp` | Both lower pockets closed; seams, buttons, cloth details |
| `drawer_close.webp` | Open drawer, closed wallet, keys, photo, pens, clips |
| `bag_close.webp` | Open empty bag lining; removable groceries are separate overlays |
| `wallet_open.webp` | Open leather wallet with folded pay stubs and travel card |
| `radio_close.webp` | Actual receiver casing, power knob and service flap |

Other miniature scenes reuse cropped regions of an existing plate, preserving their visual relationship rather than introducing unrelated inventory cards. `MINI` in `tactile.js` is the complete replaceable crop manifest:

- Household plate: bag exterior, desk, bookshelf, notebook background, lamp, window, armchair.
- Exit plate: letter rack, rent background, clock, photograph, plant, ticket background.
- Work plate: filing tray/folder, machine, counter, bin, tools, calendar, time-card rack.
- Records plate: bookshelf/register, television, cup, biscuit tin.
- Utility plate: shutter, meter, radiator, fuse box.
- Drawer plate: wallet closed and keys background.
- Bag plate: groceries, receipt and price labels.
- Receiver plate: receiver, service flap and tuning inscription.

To substitute a bespoke close-up later, point its `inspectionArt` entry at a new plate and set its crop to `null`; component coordinates remain local to the miniature scene. Update those coordinates only if the replacement moves the physical components.

## State overlays

| Asset / layer | State binding |
|---|---|
| `coat_pocket_open.webp` (+ `-768`) | Mission 2: right flap lifted when `recovery.flags` contains `right-pocket` |
| Ticket cutout from `object_atlas.webp` | Mission 2: visible inside open pocket until the `ticket` flag is set |
| Jar and bread cutouts | Removed independently by `moved:jar` and `moved:bread` |
| Postcard and book cutouts | Movable mail/catalogue covers |
| Coin and spools | Coin is a required Mission 2 tool for the photograph fastener; spools show production inputs. The keys cell is retained in the atlas but unused. |
| Receiver/shutter indicator glows | Lightweight transparent CSS layers; puzzle state |
| Exit illumination | Transparent animated layer when final mechanism unlocks |

The atlas has genuine alpha, retained in WebP. Image states contain no baked-in solution text. Small live mechanical effects remain CSS/SVG as appropriate; scenery and physical objects use bitmap artwork.

## Documents / objects

`register_book.webp` is a transparent 1254×1254 replacement for the atlas book, with a 768×768 mobile variant. Its cover, left spine, and visible top page edge share a consistent perspective; the bottom page surface is hidden. All `sprite-book` uses share the corrected artwork. The register clasp hit region follows the painted button at approximately 60% x / 49% y of its close-up. The atlas's original book cell is retained but no longer displayed.

`paper_unfolded.webp` is a transparent 1095×1437 cream paper sprite with a 768×1008 `-768.webp` variant. It replaces the crumpled atlas receipt after unfolding, giving exact receipt and rent figures a flat readable surface. It loads only as a player approaches one of those documents.

`object_atlas.webp` is a 1254×1254 transparent 3×3 atlas (418×418 cells, used by CSS background positioning without runtime cropping):

| Row | Left | Center | Right |
|---|---|---|---|
| 1 | Jar | Bread | Folded receipt |
| 2 | Postcard | Clothbound notebook | Tram ticket |
| 3 | Brass keys | Coin | Pair of spools |

Ticket ink, price stickers, receipt totals, meter memory, counter readings, television bulletins, calendar date, and service inscriptions are positioned semantic HTML on the illustrated surfaces. Existing pay stubs, invoices, notebook pages, collected evidence, and mechanical puzzle pieces retain their exact authored data in `objects.js` / `physical-content.js`. These are readable physical documents and puzzle controls, not discovery descriptions.

## Loading, fallback, and replacement

- `illustrated.js` owns URLs, wide hit regions, and session preload cache.
- On a phone it requests 768px plates; the shared transparent atlas stays full resolution.
- At entry, load the active panorama, its two neighbors, and one frequently used close-up. Additional close-ups warm only when relevant. Never preload the full collection.
- Every generated full plate is approximately 200–315 KB; mobile variants are approximately 55–80 KB. The shared atlas is approximately 333 KB.
- If a plate fails, its image falls back to local `assets/cover.svg`. Interaction regions, keyboard names, hints, and economic progress remain available. The missing-art fallback is deliberately temporary, not a parallel vector art pipeline.
- Replace the named WebP files with matching framing to upgrade art without modifying logic. Regenerate the corresponding `-768` files. Keep source prompt provenance updated.
- Keyboard/screen-reader names are `aria-label` attributes. No scene/component has a `title` tooltip. Optional dashed outlines default off.

## Validation

Mission 2 reuses these plates and sprites through `recovery-view.js`; its separate state is documented in [MISSION_2.md](MISSION_2.md). Coin, ticket, photograph, and gardening-journal interactions are disabled in Mission 1. The second case makes all four necessary discoveries rather than optional decoration.

`tests/shock-house/illustrated.cjs` checks camera movement, unlabelled miniature scenes, first-case cleanup, touch sizes, small asset variants, bounded preloading, and failed-image recovery. `recovery.cjs` covers the coat reveal, coin use, ticket flip, and full second-mission sequence with saved progress. The full seven-puzzle first case remains in `panorama.cjs`; `interaction.cjs` checks legacy saves, pointer controls, and accessibility regressions.

## September 28 illustration pass

### Second-case objects and document finish

Additional built-in imagegen assets are saved in `assets/illustrated/`, with full-size and `-768.webp` versions:

- `tram_front.webp` / `tram_back.webp`: complete printed ticket faces, including their lettering. Hidden semantic text preserves accessible reading without a second visible text overlay.
- `photo_backing.webp`: actual wooden picture-frame reverse, hanging wire, cardboard backing, and coin-operated slotted fastener.
- `journal_shelf.webp`: three textured bindings with leaf, gear, and compass marks; invisible controls align to the illustrated spines.

Exact generation prompts are in `assets/illustrated/PROMPTS.json` under these base names. The existing paper, metal-panel, news-studio, and gauge assets now also support Mission 2's records and mechanisms. Postcard rendering clips the neighboring key-ring fragment out of its atlas cell.

`recovery.cjs` verifies both missions' statistics visibility, the illustrated objects, the coin gate, and all seven second-case mechanisms at desktop and phone widths. Screenshots are saved under `tmp/shock-house/recovery-1440/` and `tmp/shock-house/recovery-390/`.

The subsequent broadcast and instrument pass adds four assets, each with a `-768.webp` phone variant in `assets/illustrated/`:

- `gauge_face.webp`: worn metal bezel and blank cream dial; calibrated markings, labels, and needles remain live SVG.
- `instrument_backing.webp`: aged enamel panel with restrained metal edges, shared by the register, policy, production, and exit mechanisms.
- `news_studio.webp`: archival newsreader and studio backdrop; all bulletin figures remain readable HTML.
- `panorama_exit_open.webp`: matching open-door panorama with a visible street and natural daylight on the floor.

These were generated with the built-in image tool, converted to WebP, and visually checked in desktop and phone layouts. Exact prompts are recorded under their filenames' base keys in `assets/illustrated/PROMPTS.json`. `finish.cjs` verifies the new views, stationary connected records, radio interactions, and illustrated ending at 1440px and 390px.

- `assets/illustrated/drawer_reward.webp` and `drawer_reward-768.webp`: empty felt-lined walnut reward drawer, edited from `drawer_close.webp`; removable rewards are separate controls.
- `assets/illustrated/press_control.webp` and `press_control-768.webp`: illustrated iron-and-walnut press handle, referenced to the workbench panorama; replaces the CSS lever.
- Both generated with the built-in image tool. Exact prompts are stored under the corresponding keys in `assets/illustrated/PROMPTS.json`.
- `cost-rails.cjs` captures and checks both 1440px and 390px layouts, individual drawer collection, direct counter/rack access, readable stock, and press operation.
## Printed evidence and empty broadcast studio

- `assets/illustrated/rent_notice.webp` and `rent_notice-768.webp`: built-in imagegen; exact prompt key `rent_notice` in `assets/illustrated/PROMPTS.json`. Original: `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-5feeb6bf-6f2a-4d6b-b58f-327ecac9773f.png`.
- `assets/illustrated/utility_account.webp` and `utility_account-768.webp`: built-in imagegen; exact prompt key `utility_account` in `assets/illustrated/PROMPTS.json`. Original: `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-b14e3dd4-cabf-45c9-a144-0888228c2937.png`.
- `assets/illustrated/news_map.webp` and `news_map-768.webp`: built-in imagegen; exact prompt key `news_map` in `assets/illustrated/PROMPTS.json`. Original: `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-8bdc169e-fb71-46a0-8c08-c818fb50549d.png`.

The rent and utility artwork contains the exact printed figures. Accessible HTML descriptions and expandable transcripts preserve text access without overlaying the artwork. The news-map edit removes the newsreader, desk, and microphone from the earlier studio asset. All three are 1536 × 1024; companion files are 768 × 512 WebP. Original generated PNGs remain in place.

## Workshop material revision · September 29, 2026

- `assets/illustrated/steel_blank.webp` (768 × 307) and `steel_blank-384.webp` (384 × 154): one raw steel blank, with genuine alpha transparency, generated using built-in imagegen. Exact final prompt: `steel_blank` in `assets/illustrated/PROMPTS.json`. Original preserved at `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-48672c6a-9df7-4045-8bad-959f0c5ab132.png`.
- One sprite equals one blank. The bin, stock record, available-material row, and selected-order sockets use this same asset. The old atlas spool cell is no longer rendered.
- The workbench frame and mechanical control finishes reuse `instrument_backing.webp`; the household catches and recovery cost/design selectors reuse `gauge_face.webp` with live markings and needles.

## Household record and desk revision

- `assets/illustrated/grocery_account.webp` and `grocery_account-768.webp`. Generated with built-in imagegen; exact prompt key `grocery_account` in `assets/illustrated/PROMPTS.json`. Original retained at `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-a148cd97-fe79-414e-89dc-50cb2af08104.png`.
- `assets/illustrated/desk_accounts_close.webp` and `desk_accounts_close-768.webp`. Generated with built-in imagegen; exact prompt key `desk_accounts_close` in `assets/illustrated/PROMPTS.json`. Original retained at `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-a412dd98-7302-4abe-a9f7-48335ef86f81.png`.

The grocery account embeds all text and exact amounts. The dedicated desk close-up integrates the utility envelope into the scene, with separate targets for the envelope, pay drawer, and lower household latch. Both assets are 1536 × 1024, with 768 × 512 companions.

## October 2, 2026 — close-up resolution and interaction audit

This section supersedes the earlier crop and mobile-loading descriptions. The confirmed study shelf, mail rack, filing tray, material chest, and door hardware now use dedicated artwork. The open chest is a matching sixth image. The bag entry reuses the existing full `bag_close` image. Mission 2 retains `journal_shelf` and its original book targets.

### Method and interpretation

`tests/shock-house/closeup-audit.cjs` renders both initial and revealed states through the actual renderers and inspection classes. It covers every registered miniature (including dormant legacy inspection handlers), documents, mechanisms, and Mission 2 views. It measured 1,180 image/texture samples at 1440×900 (1×), 768×1024 (1×), 390×844 (3×), and 844×390 (2×). No image decode failed. Measurements are CSS pixels; mobile is the maximum of the two phone orientations. The 768 column is separate. Native dimensions describe the full source; usable dimensions describe the crop or one atlas cell. Status checks both width and height at normal CSS size, not just the width shown in the table. `GOOD` means enough pixels at those measured normal sizes, not unlimited zoom.

Crops now always request full plates, never the 768 panorama. Dedicated plates use full versions on high-density screens; 1× narrow screens can still use 768 variants. Steel overlays select their existing full 768-pixel source above 1.5× density. This avoids needlessly throwing away source pixels, but cannot repair insufficient panorama crops. The remaining crops below are deliberately flagged. No sharpening or artificial upscaling was used.

| ASSET / use | NATIVE WIDTH | NATIVE HEIGHT | USABLE SOURCE W×H | MAX DESKTOP RENDER WIDTH | 768px RENDER WIDTH | MAX MOBILE RENDER WIDTH | SOURCE TYPE | STATUS |
|---|---:|---:|---:|---:|---:|---:|---|---|
| `.desk-balance-indicator — M1 mechanism budget` | — | — | scalable | 77 | 77 | 77 | CSS fallback | GOOD |
| `.open-catalogue — M1 files, M1 tray` | — | — | scalable | 832 | 533 | 391 | CSS fallback | GOOD |
| `bag_close.webp — M1 bag, M1 groceries, M1 receipt …` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | dedicated close-up | GOOD |
| `coat_close.webp — M1 coat, M2 coat` | 1536 | 1024 | 1536×1024 | 1200 | 768 | 435 | dedicated close-up | GOOD |
| `coat_pocket_open.webp — M2 coat` | 1536 | 1024 | 1536×1024 | 990 | 768 | 390 | dedicated close-up | GOOD |
| `desk_accounts_close.webp — M1 desk, M1 document bills` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | dedicated close-up | GOOD |
| `door_hardware_close.webp — M1 mechanism exit` | 1536 | 1024 | 1536×1024 | 346 | 346 | 346 | dedicated close-up | GOOD |
| `drawer_close.webp — M1 drawer` | 1536 | 1024 | 1536×1024 | 1200 | 768 | 435 | dedicated close-up | GOOD |
| `drawer_close.webp crop [35,32,35,39] — M1 wallet` | 1536 | 1024 | 538×399 | 1077 | 768 | 391 | dedicated close-up | HIGHER-RES VERSION NEEDED |
| `filing_tray_close.webp — M1 document invoices, M1 files, M1 tray …` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | dedicated close-up | GOOD |
| `gauge_face.webp — M1 mechanism indicators, M1 mechanism policy, M2 adoption …` | 1254 | 1254 | 1254×1254 | 245 | 245 | 245 | generated overlay | GOOD |
| `instrument_backing.webp — M1 document production, M1 mechanism exit, M1 mechanism indicators …` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 766 | generated overlay | HIGHER-RES VERSION NEEDED |
| `journal_shelf.webp — M2 gardening, M2 ledger` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | dedicated close-up | GOOD |
| `mail_rack_close.webp — M1 mail, M1 rent, M2 mail` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | dedicated close-up | GOOD |
| `material_bin_close.webp — M1 bin, M2 bin` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | dedicated close-up | GOOD |
| `material_bin_open.webp — M1 bin, M1 document stock` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | dedicated close-up | GOOD |
| `news_map.webp — M1 television, M2 television` | 1536 | 1024 | 1536×1024 | 565 | 384 | 205 | generated overlay | GOOD |
| `object_atlas.webp — M1 groceries, M1 mail, M1 receipt …` | 1254 | 1254 | 418×418 | 621 | 354 | 270 | sprite atlas | HIGHER-RES VERSION NEEDED |
| `panorama_exit.webp crop [71,9,11,16] — M1 clock` | 1536 | 1024 | 169×164 | 825 | 768 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_exit.webp crop [82,10,16,25] — M1 frame, M2 frame` | 1536 | 1024 | 246×256 | 768 | 768 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_exit.webp crop [5,33,16,42] — M1 plant` | 1536 | 1024 | 246×430 | 458 | 528 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_living.webp crop [82,29,11,20] — M1 lamp` | 1536 | 1024 | 169×205 | 660 | 763 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_living.webp crop [31,0,20,48] — M1 window` | 1536 | 1024 | 307×492 | 500 | 578 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_living.webp crop [9,39,29,40] — M1 chair` | 1536 | 1024 | 445×410 | 870 | 768 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_records.webp crop [47,35,16,17] — M1 television, M2 comparison, M2 television` | 1536 | 1024 | 246×174 | 1350 | 768 | 585 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_records.webp crop [9,5,26,48] — M1 records, M1 register, M2 records` | 1536 | 1024 | 399×492 | 1350 | 768 | 585 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_records.webp crop [62,45,6,7] — M1 cup` | 1536 | 1024 | 92×72 | 1029 | 768 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_records.webp crop [16,44,8,11] — M1 box` | 1536 | 1024 | 123×113 | 873 | 768 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_utility.webp — M2 mandate` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | panorama | GOOD |
| `panorama_utility.webp crop [53,22,11,18] — M1 fuse` | 1536 | 1024 | 169×184 | 734 | 768 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_utility.webp crop [13,24,12,17] — M1 meter, M2 meter` | 1536 | 1024 | 184×174 | 1350 | 768 | 585 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_utility.webp crop [61,48,23,30] — M1 pipes` | 1536 | 1024 | 353×307 | 920 | 768 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_utility.webp crop [28,10,24,68] — M1 utility` | 1536 | 1024 | 369×696 | 424 | 490 | 378 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_work.webp — M1 mechanism cost` | 1536 | 1024 | 1536×1024 | 920 | 690 | 766 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_work.webp crop [83,24,14,22] — M1 tools` | 1536 | 1024 | 215×225 | 764 | 768 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_work.webp crop [66,39,16,18] — M1 counter, M1 document production` | 1536 | 1024 | 246×184 | 1350 | 768 | 585 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_work.webp crop [62,29,21,35] — M1 machine, M2 machine` | 1536 | 1024 | 323×358 | 1350 | 768 | 585 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_work.webp crop [35,22,25,26] — M2 adoption` | 1536 | 1024 | 384×266 | 1350 | 768 | 585 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_work.webp crop [78,30,5,18] — M1 schedule` | 1536 | 1024 | 77×184 | 1350 | 768 | 585 | panorama | HIGHER-RES VERSION NEEDED |
| `panorama_work.webp crop [27,19,7,15] — M1 calendar` | 1536 | 1024 | 108×154 | 560 | 647 | 390 | panorama | HIGHER-RES VERSION NEEDED |
| `paper_unfolded.webp — M1 document bills, M1 document food, M1 document index …` | 1095 | 1437 | 1095×1437 | 960 | 707 | 600 | generated overlay | GOOD |
| `photo_backing.webp — M2 coin, M2 frame` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | dedicated close-up | GOOD |
| `press_control.webp — M1 mechanism orders` | 1536 | 1024 | 1536×1024 | 380 | 380 | 380 | dedicated close-up | GOOD |
| `radio_close.webp — M1 document index, M1 mechanism radio, M1 receiver …` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 766 | dedicated close-up | GOOD |
| `register_book.webp — M1 book, M1 register, M1 tray` | 1254 | 1254 | 1254×1254 | 621 | 354 | 270 | generated overlay | GOOD |
| `rent_notice.webp — M1 rent` | 1536 | 1024 | 1536×1024 | 1100 | 768 | 585 | dedicated close-up | GOOD |
| `steel_blank.webp — M1 bin, M1 document stock, M1 mechanism orders` | 768 | 307 | 768×307 | 194 | 194 | 160 | generated overlay | GOOD |
| `study_shelf_close.webp — M1 book, M1 ledger` | 1536 | 1024 | 1536×1024 | 1350 | 768 | 585 | dedicated close-up | GOOD |
| `tram_back.webp — M2 ticket` | 1536 | 1024 | 1536×1024 | 990 | 768 | 390 | dedicated close-up | GOOD |
| `tram_front.webp — M2 ticket` | 1536 | 1024 | 1536×1024 | 990 | 768 | 390 | dedicated close-up | GOOD |
| `utility_account.webp — M1 utility-bill` | 1536 | 1024 | 1536×1024 | 1100 | 768 | 585 | dedicated close-up | GOOD |
| `wallet_open.webp — M1 wallet` | 1536 | 1024 | 1536×1024 | 1200 | 768 | 435 | dedicated close-up | GOOD |

### Remaining artwork needs

24 asset/crop combinations still exceed their useful source resolution in at least one registered view. These have NOT been repaired by CSS. Their exact crop coordinates are listed above. The main remaining active ones are the television casing, machine/counter, tall record shelf/register background, utility cabinet and pump meter, calendar/time-card background, Mission 2 photograph front and adoption-press background, and the closed-wallet crop. Ambient/legacy handlers also retain undersized lamp, plant, window, cup, tools, box, chair, pipe, fuse, and clock crops. No larger source than the 1536×1024 panorama was available in this asset set. These need dedicated illustrations; enlarging or recompressing the current WebP cannot recover their details. The atlas has only 418×418 pixels per object cell.

The repeated/tall instrument-panel texture also exceeds its native height in some long mechanism layouts; it needs a better fitted/repeatable background treatment rather than being counted as sharp scenery.

At 390px/3× density, the following otherwise normal-size-sufficient art still lacks full one-source-pixel-per-device-pixel coverage in some states: `desk_accounts_close.webp`, `filing_tray_close.webp`, `journal_shelf.webp`, `mail_rack_close.webp`, `material_bin_close.webp`, `material_bin_open.webp`, `panorama_utility.webp`, `paper_unfolded.webp`, `photo_backing.webp`, `radio_close.webp`. This is a stricter limit than the normal-size rating. The six new plates have sufficient detail for the tested 3× portrait close-ups.

### New assets and compression

Six 1536×1024 PNG originals were generated from the existing room artwork with built-in imagegen. Full WebPs were encoded directly once at quality 94 / method 6; 768×512 companions were downsampled from those PNGs and encoded at quality 92. They were not derived from thumbnails or recompressed WebPs. Full-size RGB PSNR against the originals: shelf 40.8 dB, mail 40.2 dB, filing tray 40.6 dB, closed bin 41.9 dB, door 41.7 dB, open bin 42.1 dB. Files are 425–528 KB each. Visual review shows retained wood, paper, and brass detail. The previous panorama-crop enlargement (often only 77–399 usable pixels) was the dominant visible problem; original compression settings for the older plates cannot be reliably inferred from their WebP files.

Exact prompts are recorded in `assets/illustrated/PROMPTS.json`. Original PNGs remain in the generation directory and are not shipped in the runtime.

- `study_shelf_close.webp` and `study_shelf_close-768.webp`: original `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-28fc1a9e-1f4c-40bc-adc2-40d062c305cd.png`.
- `mail_rack_close.webp` and `mail_rack_close-768.webp`: original `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-f17d93b9-9f96-4be5-9b68-d6f6bf028978.png`.
- `filing_tray_close.webp` and `filing_tray_close-768.webp`: original `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-fe1c99e0-d372-4d2d-8932-c146b88c5d01.png`.
- `material_bin_close.webp` and `material_bin_close-768.webp`: original `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-eb31c560-d299-4573-be3a-4bbfac929505.png`.
- `door_hardware_close.webp` and `door_hardware_close-768.webp`: original `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-3f1889ed-9eeb-468d-8dec-72fa04e2916c.png`.
- `material_bin_open.webp` and `material_bin_open-768.webp`: original `C:\Users\Jennings\.codex\generated_images\01a0e30d-f5d9-7370-b10f-9296a011cba5\exec-85849cd2-6f0e-4578-8b01-13178245cd05.png`.

### Interaction and visual verification

- Door: entire knob/backplate and lock visible with surrounding walnut; the handle control appears before the event slots, including on a narrow phone. Same solve action and event sequence.
- Mail: dedicated layered holder; postcard must still move before the rent-notice target becomes available.
- Groceries: the first room click opens the bag with bread and jar already visible; there is no empty-bag intermediate view, and one Back returns to the room. Both receipt targets are absent initially. Bread moves aside and exposes April; March still requires the jar as well. Both moved objects remain visible at the edges and retain their existing saved flags.
- Household: paper/brass catches with small ink balance indicators replace the rusted panels and large gauges. Values, controls, and solution are unchanged.
- Catalogue: the existing cover rotates open; a persistent two-page book reveals the shipping tag inside immediately. No disappearing-book state or extra required discovery click. The same `moved:catalogue` and `search:files` / `shipping-date` flags are used; old saves with just the moved flag record the visible tag when revisiting the open book.
- Material chest: matching closed/open plates, six existing steel-blank sprites, same allocation counts and stock inspection.
- TV: the bulletin footer is transparent, with restrained on-screen text. The mobile transcript also has no separate colored card; both missions retain their readable text and tuning controls.

Visual review covered all eight requested areas and the four screen sizes; screenshots are in `tmp/shock-house/inspection-polish/`. Phone screenshots are captured at 3× device density, landscape at 2×. The landscape tag is contained within its book; the hidden/revealed grocery states and domestic balance controls were also checked.

### Files in this pass

Runtime: `tactile.js`, `illustrated.js`, `game.js`, `objects.js`, `recovery-view.js`, `discovery.js`, `index.html`, and new `inspection-polish.css`. Art: the six full/768 WebP pairs listed above and `assets/illustrated/PROMPTS.json`. Documentation: this manifest. Tests: `tests/shock-house/inspection-polish.cjs`, `closeup-audit.cjs`, the existing receipt-order expectations in `discovery-finish.cjs`, and Mission 2 transparent-broadcast assertions in `recovery.cjs`. Economic engines, recovery state machine, save schema, public hub, faculty guides, and unrelated existing work were not edited.

### Test and release status

Passed: engine (54 assertions), branching, household, cost-rails and recovery unit suites; household and discovery browser suites at 1440/390; television touch/keyboard/channel/reload tests; full Mission 1 panorama route (seven puzzles and responsive layouts); complete Mission 2 at 1440/390; focused polish interactions and save/reload at all four sizes; 1,180-sample resolution audit with no failed image loads. The focused test also checks a normal-motion book opening and migration of an older moved-cover state.

The local unlisted package was rebuilt and its runtime-identity release test passed. The built-route browser suite passed at 1440, 768, 390 portrait and 844×390 landscape, including touch swipe, Return to Games, legacy save, Mission 2 unlock, and all 100 shipped runtime assets. No public release switch was enabled.

Read-only live check on October 2: `https://masteryquests.org/beta-testing/signal-house-4e2ce7c23dc8/` returned HTTP 200 but still had the previous build (no `inspection-polish.css`; five checked new close-up URLs returned 404). This pass did not deploy. Local mobile/package checks are verified; deployed mobile verification of the NEW assets remains pending deployment. The initial release-identity failure was due to the stale local package and passed after rebuilding.
