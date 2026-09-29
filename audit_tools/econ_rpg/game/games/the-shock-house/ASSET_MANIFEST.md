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
