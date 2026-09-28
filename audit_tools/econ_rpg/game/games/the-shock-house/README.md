# The Shock House — An Economic Escape

Game 12 in the October Mastery Quests preview collection. One continuous interior built from illustrated WebP plates, five camera directions, miniature object scenes, and seven connected mechanisms. Contextual hints, browser saves, an economic reveal, one transfer challenge, and results remain intact. Target first-play time is 15–25 minutes; discovery difficulty and classroom timing still need human playtesting.

## Two missions

The original negative-supply case unlocks **The Second Harvest**, a playable positive-supply mystery. The coat coin, photograph, tram ticket, and gardening journal are interactive only in the second case, where each is required. See [MISSION_2.md](MISSION_2.md) for its route, economic framing, save compatibility, and tests.

## Run

From `audit_tools/econ_rpg/game`, run `python -m http.server 4179` (or any static server), then open `http://localhost:4179/games/the-shock-house/`. The existing preview server can serve the same path. ES modules require HTTP rather than `file://`.

The folder can also be hosted unchanged on GitHub Pages. For standalone deployment, adjust the optional brand link to your library. Embed the hosted URL in a Canvas iframe with scripts enabled, preferably at least 800px tall. Edge arrows, left/right keyboard keys, and horizontal touch swipes turn to adjacent views. Portrait navigation sits below the scene so it cannot cover objects. Close-ups scroll vertically. Storage restrictions in embedded browsers are caught and explained; the current tab remains playable.

No runtime libraries, remote fonts, network services, generated questions, or build step are required. No personal information is collected or transmitted.

## Files

- `index.html`: document shell, live announcement region, and native dialog.
- `styles.css`: base typography, start/ending screens, dialogs, and accessibility styles.
- `immersive.css`: room viewport, physical papers and mechanisms, satchel, interaction animations, mobile layouts, and reduced motion.
- `content.js`: authored rooms, documents, evidence, hints, orders, broadcasts, and optional audio paths.
- `physical-content.js`: pay stubs, itemized receipts, household bills, notebook slips, and document metadata, separate from rendering.
- `objects.js`: physical document and mechanism rendering; no puzzle completion or save mutations.
- `engine.js`: central state, prerequisite gates, puzzle validation, rewards, policy model, and versioned save validation.
- `game.js`: interaction, rendering, keyboard focus management, dialogs, save/resume, reveal, transfer, and results.
- `illustrated.js`: background plate URLs, camera order, region coordinates, preload cache, and image fallback.
- `tactile.js`: miniature image scenes, invisible component targets, physical overlays and document readings.
- `discovery.js`: quiet fragments, accessible titles, and progressive discovery hints.
- `illustrated.css`: bitmap scene layout, camera/overlay treatments, and mobile reading surfaces.
- `ASSET_MANIFEST.md`: every shipped plate, atlas, variant, crop, state binding, and replacement instructions.
- `panorama.css`: navy palette, camera layout, tactile search objects, portrait controls, and motion settings.
- `assets/cover.svg`: local fallback image if an illustrated plate is unavailable.
- `GAME_FLOW.md`: dependency map and full puzzle specifications, including solutions.
- `../../../tests/shock-house/`: engine and browser regression checks.

## Investigation and dependencies

All five views can be explored immediately. There are no room labels or navigation doors. A shuttered utility cabinet keeps the receiver prerequisite on its mechanism. The only door is the exit. Click ordinary objects directly; normal exploration has no numbered controls, duplicate object list, or progress dashboard. Back steps through the nested inspection stack; camera navigation never requires returning to a hub.

Every interactive object has a keyboard-accessible invisible hit region of at least 44 CSS pixels. Focus outlines remain visible. **Case menu → Accessibility → Show interactive objects** optionally outlines regions; it defaults off. Paper slips support drag/drop or select-then-place; invoice and final-order arrows provide keyboard/touch alternatives. Turn the radio knob by dragging, tapping, or using arrows/Home/End. The satchel holds unused items and the persistent evidence folder.

Decorative furnishings remain in the illustrated plates without dead-end hotspots. The fuse box, hanging tools, biscuit tin, lamps, plants, windows, cup, clock, armchair, and radiator are scenery. Loose decorative keys stay in the drawer artwork; they are not collectible or usable. The obsolete fuse-code and tin/armchair key reveals have been removed. Ordinary details within working searches still provide visual camouflage, the photograph and gardening book are reserved for Mission 2.

Search the bag, move groceries, unfold the older receipt, and peel newer price stickers. Search the desk drawer and wallet for pay stubs. Compare the utility meter with a notice behind the mail. Pull the notebook from the shelf. The household drawer still yields a badge and dated notice. The badge opens the invoice cabinet; deliveries are filed beneath a catalogue, and production readings live in a covered machine counter. The press supplies the staffing record. Separate television bulletins establish national output, employment, and prices. After the work plan, open the narrow register to compare those bulletins and engage its hidden clasp. This powers the receiver; the notice and invoice dates identify its sequence. The receiver releases the utility shutter. Testing policy directions and sealing both objectives produces the final artifact for the exit’s causal mechanism.

Physical items are consumed only after their purpose is served. Evidence remains in the log permanently. Solved mechanisms are safe to revisit and do not duplicate rewards. Each puzzle has three hints; hints do not deduct points. There is no time-based mastery score.

Search progress persists: moved groceries and catalogue stay moved, the wallet stays open, and meter/bin covers stay lifted. In Mission 2, coat cloth opens to expose a ticket edge; the ticket can be collected, flipped, and used to locate a dated trial. Discovery scenes have no visible action labels, tooltips, or descriptive paragraphs. The satchel records raw observations without naming their economic meaning. Back retraces the inspection stack and reverses the camera movement. Reduced-motion preferences disable camera animation; keyboard names and optional outlines remain available.

The household essential basket is constant in quantity. Workshop orders remain available; costly inputs, rather than disappearing demand, explain the production cuts. National output is real, and the national register supplies aggregate evidence rather than inferring it from one household or firm. Inflation figures refer to matching monthly intervals. The final diagram holds AD fixed while SRAS shifts left. Policy gauges are illustrative directional indices, not forecasts or calibrated estimates. A higher price level does not imply endlessly accelerating inflation.

## Art and audio replacement

All five image plates share wall treatment, trim, floor, palette, perspective, window construction, and lighting. Furnishings sit against walls or overlap foreground edges. There is no center table, labeled door hub, or exposed macro dashboard. Important objects are ordinary containers; discoveries happen in miniature image scenes. Exact economic figures and mechanical puzzle controls remain semantic HTML/CSS/SVG overlays. There are no remote assets at runtime.

`SCENE_OBJECTS` in `illustrated.js` records each object’s center and extent in normalized 1000×640 coordinates. Rendering converts these to percentages with a 44 CSS-pixel minimum. `MINI` and component regions in `tactile.js` describe the corresponding close-ups. See [ASSET_MANIFEST.md](ASSET_MANIFEST.md) for art replacement, transparent atlas cells, state images, generated prompt provenance, mobile variants, and fallback behavior. `physical-content.js` owns authored amounts; `objects.js` owns the preserved mechanisms.

Sound is off by default. Optional synthesized mechanism tones require explicit enabling. Add broadcast audio file paths in `BROADCAST_AUDIO` in `content.js`; transcripts always remain visible. Room transitions stop any broadcast audio. Device reduced-motion preferences disable animation and transitions.

## Save format

The exit presents five economic event tiles with supporting-record captions. Players reconstruct causes and consequences: the input disruption, higher costs, production/shift cuts, national effects, and the policy tradeoff. Radio reports are retrospective evidence. `FINAL_EVENTS` in `content.js` supplies the player-facing labels; `FINAL_ORDER` keeps the existing evidence IDs so saved partial arrangements and completed games remain compatible.

One versioned localStorage key: `mastery-quests.shock-house.v1`. Legacy room IDs now identify camera positions. Search markers and raw fragments use the existing validated `inspectedObjects` list. Earlier saves retain puzzle, hint, evidence, partial mechanism, final-sequence, and ending progress; an already inspected national register does not require rediscovery. Visiting the utility view before obtaining its key is now valid. Title-screen Continue is shown for a valid save. New Investigation requires confirmation. Malformed saves are not overwritten until the player starts a replacement investigation; storage denial falls back to tab-only play.

## Validation

From the repository root:

```sh
node audit_tools/econ_rpg/tests/shock-house/engine.mjs
node audit_tools/econ_rpg/tests/shock-house/browser.cjs
node audit_tools/econ_rpg/tests/shock-house/objects.cjs
node audit_tools/econ_rpg/tests/shock-house/illustrated.cjs
node audit_tools/econ_rpg/tests/shock-house/recovery.mjs
node audit_tools/econ_rpg/tests/shock-house/recovery.cjs
```

The browser check uses Playwright and Chrome for development only. Set `PLAYWRIGHT_PATH` to your installed Playwright module, `SHOCK_HOUSE_URL` to the served game URL, and `SHOCK_HOUSE_WIDTH=390` for the phone playthrough. Screenshots are written to `tmp/shock-house/panorama-<width>`. The supplied default module path uses this workspace’s bundled runtime.

`browser.cjs` runs `panorama.cjs`: a full title-to-results playthrough using nested searches, quiet fragments, wrong attempts, saved manipulation state, three hint levels, keyboard tuning and policy controls, completed-save resume, narrow layouts, and focus. `objects.cjs` runs `interaction.cjs`: native dragging, pointer tuning, actual touch swipes, a version-1 save fixture with partial final sequence, optional outlines, camera animation, reduced motion, malformed saves, and denied storage. The game has no Playwright dependency.

Verified September 28, 2026: engine assertions passed; desktop and 390px phone playthroughs completed all seven puzzles, transfer, and results with no page errors. Layout/target checks passed at 320, 390, 768, 1024, and 1440px. Legacy-save and gesture regression checks passed. First-time discovery difficulty, play duration, and full assistive-technology compatibility still need human playtesting.
