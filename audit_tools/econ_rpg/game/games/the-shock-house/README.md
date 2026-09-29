# The Shock House — An Economic Escape

Game 12 in the October Mastery Quests preview collection. One continuous interior built from illustrated WebP plates, five camera directions, miniature object scenes, and two sets of seven connected mechanisms. Contextual hints, browser saves, an economic reveal, one transfer challenge, and results remain intact. Discovery difficulty and classroom timing need fresh human playtesting after the branching revision.

## Two missions

Mission 1 is a **negative aggregate supply mystery** with freely explorable household and workshop clues, badge-gated cost rails, national synthesis, and a three-source radio convergence. It unlocks **The Second Harvest**, a **positive aggregate supply / efficiency mystery** with seven mechanisms, including distributed cost reconstruction, widespread adoption, and a required unchanged-demand check. The second mission intentionally reuses familiar objects and the same illustrated scenery. The coat coin, photograph, tram ticket, and gardening journal are interactive only in the second case, where each is required. See [MISSION_2.md](MISSION_2.md) for its route, economic framing, save compatibility, and tests.

## Run

From `audit_tools/econ_rpg/game`, run `python -m http.server 4179` (or any static server), then open `http://127.0.0.1:4179/games/the-shock-house/?experience=illustrated`. The existing preview server can serve the same path. ES modules require HTTP rather than `file://`. Opening `index.html` directly now shows a link to that preview instead of an empty screen. Keep using the same hostname and port to retain access to the same browser save.

The folder can also be hosted unchanged on GitHub Pages. For standalone deployment, adjust the optional brand link to your library. Embed the hosted URL in a Canvas iframe with scripts enabled, preferably at least 800px tall. Edge arrows, left/right keyboard keys, and horizontal touch swipes turn to adjacent views. Portrait navigation sits below the scene so it cannot cover objects. Close-ups scroll vertically. Storage restrictions in embedded browsers are caught and explained; the current tab remains playable.

No runtime libraries, remote fonts, network services, generated questions, or build step are required. No personal information is collected or transmitted.

The broadcast and instrument finish uses an illustrated news studio, radio cabinet, calibrated metal gauges, and open-door ending. Radio instructions are consolidated into one service card. Shipping and radio clues are recorded when displayed, and connected register documents stay fixed while directions change. Phone broadcasts include a readable transcript beneath the television. Existing saves continue without a reset.

The second case uses illustrated book spines, printed ticket faces, and an actual photograph backing. The coin is explicitly used to release its slotted fastener. Installation records and batch charges appear as readable documents; rate, cost, adoption, and direction controls use the illustrated instrument materials. The first-case reveal displays elapsed time, hint count, evidence, and solved puzzles immediately, before the optional forecast. New second cases also record their own start and completion times; older saves remain playable and label unavailable timing as not recorded.

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
- `recovery-state.js`: second-case gates, location-aware hints, validation, and legacy migration.
- `recovery-view.js` / `recovery.css`: seven second-case mechanisms, changed house interactions, and physical overlays.
- `MISSION_2.md`: seven-mechanism design and the micro-to-macro adoption requirement.
- `ASSET_MANIFEST.md`: every shipped plate, atlas, variant, crop, state binding, and replacement instructions.
- `panorama.css`: navy palette, camera layout, tactile search objects, portrait controls, and motion settings.
- `assets/cover.svg`: local fallback image if an illustrated plate is unavailable.
- `GAME_FLOW.md`: dependency map and full puzzle specifications, including solutions.
- `../../../tests/shock-house/`: engine and browser regression checks.

## Investigation and dependencies

All five views can be explored immediately. There are no room labels or navigation doors. A shuttered utility cabinet keeps the receiver prerequisite on its mechanism. The only door is the exit. Click ordinary objects directly; normal exploration has no numbered controls, duplicate object list, or progress dashboard. Back steps through the nested inspection stack; camera navigation never requires returning to a hub.

Every interactive object has a keyboard-accessible invisible hit region of at least 44 CSS pixels. Focus outlines remain visible. **Case menu → Accessibility → Show interactive objects** optionally outlines regions; it defaults off. The household uses three direction catches; cost-tag rails and final-order arrows provide drag, keyboard, and touch alternatives. Turn the radio knob by dragging, tapping, or using arrows/Home/End. The satchel holds unused items and the persistent evidence folder.

Decorative furnishings remain in the illustrated plates without dead-end hotspots. The fuse box, hanging tools, biscuit tin, lamps, plants, windows, cup, clock, armchair, and radiator are scenery. Loose decorative keys stay in the drawer artwork; they are not collectible or usable. The obsolete fuse-code and tin/armchair key reveals have been removed. Ordinary details within working searches still provide visual camouflage, the photograph and gardening book are reserved for Mission 2.

Search the bag, top drawer of the writing desk, utility bill on the desk, and mail to compare the same household across months. Three catches establish pay up, essential costs up faster, remainder down; the illustrated drawer opens for individual inspection and collection of household evidence, a date, and badge 047. Investigate the workshop dated cost records, machine memory, and scarce materials in any order. Insert the badge, order the dated records March 12 → March 16 → March 21, and allocate A/C to record higher costs followed by production and staffing cuts. Correct cost records no longer depend on hidden source-visit flags. The early-access register requires both branches and national observations. Radio power, household date, workshop unit cost, shipping tag, shift-rack date, and service inscription converge at the radio. Its archived reports reveal the upstream cause. Policy trials supply the fifth final artifact. See [GAME_FLOW.md](GAME_FLOW.md) for separate search, puzzle, and causal graphs.

Physical items are consumed only after their purpose is served. Evidence remains in the log permanently. Solved mechanisms are safe to revisit and do not duplicate rewards. Each puzzle has three hints; hints do not deduct points. There is no time-based mastery score.

Search progress persists: moved groceries and catalogue stay moved, the bin lid stays lifted, and read household records stay recorded. In Mission 2, coat cloth opens to expose a ticket edge; the ticket can be collected, flipped, and used to locate a dated trial. Discovery scenes have no visible action labels, tooltips, or descriptive paragraphs. The satchel records raw observations without naming their economic meaning. Back retraces the inspection stack and reverses the camera movement. Reduced-motion preferences disable camera animation; keyboard names and optional outlines remain available.

The household essential basket is constant in quantity. Workshop orders remain available; costly inputs, rather than disappearing demand, explain the production cuts. National output is real, and the national register supplies aggregate evidence rather than inferring it from one household or firm. Inflation figures refer to matching monthly intervals. The final diagram holds AD fixed while SRAS shifts left. Policy gauges are illustrative directional indices, not forecasts or calibrated estimates. A higher price level does not imply endlessly accelerating inflation.

## Art and audio replacement

All five image plates share wall treatment, trim, floor, palette, perspective, window construction, and lighting. Furnishings sit against walls or overlap foreground edges. There is no center table, labeled door hub, or exposed macro dashboard. Important objects are ordinary containers; discoveries happen in miniature image scenes. Exact economic figures and mechanical puzzle controls remain semantic HTML/CSS/SVG overlays. There are no remote assets at runtime.

`SCENE_OBJECTS` in `illustrated.js` records each object’s center and extent in normalized 1000×640 coordinates. Rendering converts these to percentages with a 44 CSS-pixel minimum. `MINI` and component regions in `tactile.js` describe the corresponding close-ups. See [ASSET_MANIFEST.md](ASSET_MANIFEST.md) for art replacement, transparent atlas cells, state images, generated prompt provenance, mobile variants, and fallback behavior. `physical-content.js` owns authored amounts; `objects.js` owns the preserved mechanisms.

Quiet paper, wood, and metal interaction sounds play after a user gesture and can be muted in Accessibility. The independent radio-audio setting remains off by default; existing radio preferences are preserved. Add broadcast audio file paths in `BROADCAST_AUDIO` in `content.js`; transcripts always remain visible. Room transitions stop any broadcast audio. Device reduced-motion preferences disable animation and transitions. Optional object outlines are solid and off by default; keyboard focus remains visible regardless of that preference.

## Save format

The exit presents five economic event tiles with supporting-record captions. Players reconstruct causes and consequences: the input disruption, higher costs, production/shift cuts, national effects, and the policy tradeoff. Radio reports are retrospective evidence. `FINAL_EVENTS` in `content.js` supplies the player-facing labels; `FINAL_ORDER` keeps the existing evidence IDs so saved partial arrangements and completed games remain compatible.

One versioned localStorage key: `mastery-quests.shock-house.v1`. Legacy room IDs now identify camera positions. Search markers and raw fragments use the existing validated `inspectedObjects` list. Earlier saves retain puzzle, hint, evidence, partial mechanism, final-sequence, and ending progress; an already inspected national register does not require rediscovery. Visiting the utility view before obtaining its key is now valid. `branchRevision:2` adds three household catches while retaining legacy amount arrays. A completed old household puzzle stays solved; a fully correct unfinished old ledger maps to the correct catches. Legacy invoice discoveries supply credit for dates formerly shown together. The final evidence folder displays five artifacts, retaining supporting-record IDs internally.

Mission 2 uses `recovery.version:2`. Old completed second cases stay complete. Partial saves keep coat/photo/journal and earned cost progress; adoption and AD evidence must now be established before re-sealing the national comparison. A partial old final chain is cleared when its national conclusion is reopened. Malformed second-case data is isolated: the completed first case remains available and the second case can be restarted. Root malformed saves are still preserved rather than silently overwritten.

Title-screen Continue is shown for a valid save. New Investigation requires confirmation. Malformed saves are not overwritten until the player starts a replacement investigation; storage denial falls back to tab-only play.

`branchRevision:3` adds `drawerCollected` for individually inspected and collected rewards. Earlier saves infer already collected drawer contents from their solved household puzzle, preserving inventory and evidence. Already completed workshop-first saves remain valid. New cost solutions require the employee badge and chronological dated records.

## Validation

From the repository root:

```sh
node audit_tools/econ_rpg/tests/shock-house/engine.mjs
node audit_tools/econ_rpg/tests/shock-house/branching.mjs
node audit_tools/econ_rpg/tests/shock-house/cost-rails.mjs
node audit_tools/econ_rpg/tests/shock-house/cost-rails.cjs
node audit_tools/econ_rpg/tests/shock-house/browser.cjs
node audit_tools/econ_rpg/tests/shock-house/objects.cjs
node audit_tools/econ_rpg/tests/shock-house/illustrated.cjs
node audit_tools/econ_rpg/tests/shock-house/television.cjs
node audit_tools/econ_rpg/tests/shock-house/register.cjs
node audit_tools/econ_rpg/tests/shock-house/recovery.mjs
node audit_tools/econ_rpg/tests/shock-house/recovery.cjs
```

Set `SHOCK_HOUSE_ROUTE=A`, `B`, `C`, or `D` when running `panorama.cjs`: household first; workshop first; radio/TV first; or collect unsolved clues across branches before solving. These are real UI playthroughs, not state injection shortcuts.

The browser check uses Playwright and Chrome for development only. Set `PLAYWRIGHT_PATH` to your installed Playwright module, `SHOCK_HOUSE_URL` to the served game URL, and `SHOCK_HOUSE_WIDTH=390` for the phone playthrough. Screenshots are written to `tmp/shock-house/panorama-<width>`. The supplied default module path uses this workspace’s bundled runtime.

`browser.cjs` runs `panorama.cjs`: a full title-to-results playthrough using nested searches, quiet fragments, wrong attempts, saved manipulation state, three hint levels, keyboard tuning and policy controls, completed-save resume, narrow layouts, and focus. `objects.cjs` runs `interaction.cjs`: native dragging, pointer tuning, actual touch swipes, a version-1 save fixture with partial final sequence, optional outlines, camera animation, reduced motion, malformed saves, and denied storage. The game has no Playwright dependency.

Validation covers both missions, four first-case exploration orders, gates for missing evidence, cost/adoption/demand convergence, old and current saves, wrong attempts, keyboard/mouse/touch controls, image fallback, and responsive layouts. Human playtesting remains necessary for discovery difficulty, the botanical shelf clue, diffusion-puzzle satisfaction, overall pacing, and screen-reader narration. Automated pass results are reported with each implementation delivery.
