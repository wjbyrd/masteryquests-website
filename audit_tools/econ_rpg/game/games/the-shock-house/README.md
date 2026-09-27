# The Shock House — An Economic Escape

Game 12 in the October Mastery Quests preview collection. Five illustrated locations and seven connected mechanisms, with direct object interaction, contextual hints, browser saves, an economic reveal, one transfer challenge, and results. Target first-play time is 15–25 minutes; classroom timing still needs playtesting.

## Run

From `audit_tools/econ_rpg/game`, run `python -m http.server 4179` (or any static server), then open `http://localhost:4179/games/the-shock-house/`. The existing preview server can serve the same path. ES modules require HTTP rather than `file://`.

The folder can also be hosted unchanged on GitHub Pages. For standalone deployment, adjust the optional brand link to your library. Embed the hosted URL in a Canvas iframe with scripts enabled, preferably at least 800px tall. Narrow screens retain a larger room composition: swipe horizontally or use the small edge arrows to look around. Close-ups scroll vertically. Storage restrictions in embedded browsers are caught and explained; the current tab remains playable.

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
- `scenes.js`: original layered SVG room illustrations, object hit regions, visible world changes, and replaceable room image paths.
- `assets/cover.svg`: library artwork derived from the original Hall illustration.
- `GAME_FLOW.md`: dependency map and full puzzle specifications, including solutions.
- `../../../tests/shock-house/`: engine and browser regression checks.

## Investigation and dependencies

The Hall, Residence, Workshop, and Archive can be explored immediately. The Control Room requires the receiver pass. Click objects directly; the normal room has no hotspot circles, numbered controls, duplicate object list, or progress dashboard. Doorways return to the Hall.

Every object has a keyboard-accessible invisible hit region of at least 44 CSS pixels. Focus outlines remain visible. **Case menu → Accessibility → Show interactive objects** optionally outlines regions; it defaults off. Paper slips support drag/drop or select-then-place; invoice and final-order arrows provide keyboard/touch alternatives. Turn the radio knob by dragging, tapping, or using arrows/Home/End. The satchel holds unused items and the persistent evidence folder.

The household drawer yields a badge and a dated notice. The badge opens the invoice cabinet. Its cost record unlocks the work-order press and supplies a receiver-frequency clue. The resulting staffing record joins household and cost evidence at the national indicator wall. This powers the receiver; the old household date and invoice dates now identify its broadcast sequence. The receiver opens the Control Room. Testing both policy directions and sealing both objectives produces the last artifact for the Hall’s causal mechanism.

Physical items are consumed only after their purpose is served. Evidence remains in the log permanently. Solved mechanisms are safe to revisit and do not duplicate rewards. Each puzzle has three hints; hints do not deduct points. There is no time-based mastery score.

The house carries progress: the household drawer and invoice cabinet stay open, recovered drawer contents leave their impressions in the lining, allocated materials leave the store, the Archive gauges remain configured, its receiver powers on, the Control Room door unlocks, and inserted artifacts stay visible on the Hall door. The final door itself opens. Paper, envelope, notebook, drawer, and machine close-ups use different motion, disabled by reduced-motion preferences.

The household essential basket is constant in quantity. Workshop orders remain available; costly inputs, rather than disappearing demand, explain the production cuts. National output is real, and the national register supplies aggregate evidence rather than inferring it from one household or firm. Inflation figures refer to matching monthly intervals. The final diagram holds AD fixed while SRAS shifts left. Policy gauges are illustrative directional indices, not forecasts or calibrated estimates. A higher price level does not imply endlessly accelerating inflation.

## Art and audio replacement

All five rooms use original editable SVG illustrations with perspective, curved silhouettes, material patterns, frame depth, shadows, and foreground objects. Documents are semantic HTML with paper-specific styling. There are no empty image placeholders or third-party visual assets.

To replace a room, put an image in `assets/` (suggested: `central_hall.webp`, `residence.webp`, `workshop.webp`, `archive.webp`, `policy_room.webp`) and set its `ROOM_ASSETS` entry in `scenes.js`. Use a 1000×640 composition. `HOTSPOTS` in that file records each object’s center x/y and width/height in world pixels. Rendering converts them to percentages, retaining minimum touch dimensions. For a raster replacement, provide corresponding state variants or retain the SVG state layers so world changes remain visible. Document amounts and copy can be changed in `physical-content.js` without changing the paper treatments in `objects.js` or `immersive.css`.

Sound is off by default. Optional synthesized mechanism tones require explicit enabling. Add broadcast audio file paths in `BROADCAST_AUDIO` in `content.js`; transcripts always remain visible. Room transitions stop any broadcast audio. Device reduced-motion preferences disable animation and transitions.

## Save format

One versioned localStorage key: `mastery-quests.shock-house.v1`. The object overhaul preserves this format and the existing engine. Earlier saves retain puzzle, hint, evidence, partial mechanism, final-sequence, and ending progress. Title-screen Continue is shown for a valid save. New Investigation requires confirmation. Save validation rejects unsupported or incoherent progress without crashing; storage denial falls back to tab-only play with a notice.

## Validation

From the repository root:

```sh
node audit_tools/econ_rpg/tests/shock-house/engine.mjs
node audit_tools/econ_rpg/tests/shock-house/browser.cjs
node audit_tools/econ_rpg/tests/shock-house/objects.cjs
```

The browser check uses Playwright and Chrome for development only. Set `PLAYWRIGHT_PATH` to your installed Playwright module, `SHOCK_HOUSE_URL` to the served game URL, and optionally `SHOCK_HOUSE_OUTPUT` to the screenshot/results folder. The supplied default module path uses this workspace’s bundled runtime.

The browser path operates the actual controls from title to results, including wrong attempts, nonlinear visits, notebook slip placement, three hint levels, keyboard tuning and policy controls, saved items, partial final sequence resume, completed-save resume, restart cancellation, narrow layouts, object focus, malformed saves, and denied storage. `objects.cjs` additionally checks native paper dragging, pointer-operated tuning, persistent visual changes, a version-1 save fixture, optional outlines, object-specific animation, and reduced motion. Both write screenshots for visual inspection. The game has no Playwright dependency.

Verified September 27, 2026: 54 engine assertions passed; the redesigned desktop and 390px phone playthroughs completed all seven puzzles, the transfer, and results with no page errors. Layout/target checks passed at 320, 390, 768, 1024, and 1440px. All five room compositions and physical close-ups were visually reviewed. First-time play duration and full assistive-technology compatibility still need human playtesting.
