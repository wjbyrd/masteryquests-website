# Puzzle-structure revision — implementation report

Implemented September 28, 2026 in the existing static game. No art assets, hosting, navigation hub, or environment pipeline were replaced.

## Changes

Mission 1 now has independent household and workshop progression. The household uses three direction catches rather than eight clerical entries. Workshop cost tags, machine memory, shift rack, and input bin provide physical evidence. Both branches meet at national synthesis. Radio power, unit cost, service rule, and three distributed dates converge before the cause is revealed. Policy tradeoffs and the five-event negative-SRAS ending are preserved. Five major artifacts occupy the final evidence folder; household/date observations remain supporting clues.

Mission 2 retains the coat, coin, ticket, photograph, and journal while expanding to seven mechanisms. A botanical shelf reference identifies the book. Cost reconstruction requires separately collected trial hours, utility rate, and fixed batch costs. A three-group installed-design board establishes diffusion. A separate demand-log seal is mandatory. The national comparison combines these sources, and five earned artifacts form the final positive-SRAS chain.

See GAME_FLOW.md for search/puzzle/causal graphs and diagrams, and MISSION_2.md for each mechanism.

## Files changed in this revision

Under `audit_tools/econ_rpg/game/games/the-shock-house/`:

- `engine.js` — independent prerequisites, household catches, radio source requirements, root migration.
- `game.js` — catch interaction, supporting-clue tray, five-artifact results, second-case hint context.
- `objects.js` — three-catch ledger, manual cost rails, released production/staffing/material state, evidence art.
- `tactile.js` — early register access, input-cost display, shipping tag, updated bin, distributed radio instructions.
- `discovery.js` — shipping observation and branch-aware discovery guidance.
- `content.js` — new puzzle copy, hints, physical artifact names, supporting-source captions.
- `physical-content.js` — distributed radio-source metadata.
- `recovery-state.js` — seven-mechanism gates, adoption/AD dependencies, earned artifacts, location-aware hints, version-2 migration.
- `recovery-view.js` — changed house interactions, shelf identification, cost wheel, installed-design board, AD seal, five-stage exit.
- `recovery.css` — physical controls, matching leaf mark, responsive mechanism layouts and contrast.
- `GAME_FLOW.md` — separate search, puzzle, economic graphs and parallel dependency diagrams.
- `MISSION_2.md` — seven mechanisms, micro-to-macro reasoning and migration.
- `README.md` — both missions, current controls, saves, and test instructions.
- `REVISION_REPORT.md` — this handoff.

Under `audit_tools/econ_rpg/tests/shock-house/`:

- `engine.mjs` — revised household/radio fixtures; original validation coverage retained.
- `branching.mjs` — new independent-order, convergence, hint, and migration checks.
- `interaction.cjs` — keyboard household catches, native cost-tag dragging, updated valid fixtures.
- `panorama.cjs` — four real UI exploration routes and simplified household controls.
- `recovery.mjs` — seven mechanisms, missing sources, AD gate, earned artifacts, partial/completed legacy migration.
- `recovery.cjs` — full seven-mechanism desktop/phone playthrough with independent-source retrieval and reloads.

## Test results

All final checks passed:

| Check | Result |
|---|---|
| engine.mjs | 54 assertions passed |
| branching.mjs | Independent branches; either branch alone blocks synthesis; radio sources; ready-action hints; legacy amount/date migration |
| recovery.mjs | Seven mechanisms; wrong/missing evidence; adoption and AD requirements; legacy partial/completed saves; corrupt second-case isolation |
| panorama.cjs, route A, 1440px | Household → workshop → national → complete first case |
| panorama.cjs, route B, 1440px | Workshop → household → national → complete first case |
| panorama.cjs, route C, 1440px | Unpowered radio → early TV → workshop → household → complete first case |
| panorama.cjs, route D, 390px | Unsolved cross-branch discoveries before first gate → complete first case |
| recovery.cjs, 1440px and 390px | Full second mission, wrong attempts, adoption/AD gates, partial and completed reload, first-case preservation |
| interaction.cjs | Real dragging, pointer tuning, touch swipe, keyboard, saved partial sequence, reduced motion, storage denial |
| illustrated.cjs | Plate loading, camera push, no hover labels, mobile targets/variants, image fallback |
| television.cjs | Three channels, real knob/touch alignment, reverse/forward wrap, keyboard, resume |
| register.cjs | Direct clasp use with bulletin evidence, desktop and phone |
| Responsive first-case checks | 320, 390, 768, 1024, 1440px |
| Visual inspection | New household catches, cost rails, photo clue, adoption board, cost wheel, five-artifact ending on desktop/phone |
| Diff whitespace check | Passed |

`browser.cjs` and `objects.cjs` remain wrappers for the tested panorama and interaction suites. Browser playthroughs reported no page errors. One alternate-route test initially attempted to reopen an already-open wallet; the test was corrected to respect persistent state, and route D then passed.

## Save migration

The root key/version stay `mastery-quests.shock-house.v1` / 1. Completed first missions remain valid and keep the Mission 2 unlock. Legacy solved budgets remain solved; completely filled correct old ledgers map to new catches. Old invoice discoveries receive credit for dates formerly bundled in the stack.

Second-case version 1 migrates to 2. Completed cases retain completion. Partial cases retain earned search/journal/cost progress. Previously earned costs receive the rate/overhead credit that the old screen already displayed. Old TV-only national synthesis is reopened for adoption and demand evidence; its partial exit chain is cleared. Malformed second-case data cannot invalidate the completed first case.

## Human playtesting still needed

- First-time discovery and route choice without hints, particularly the botanical shelf reference.
- Whether the three installed-design connections provide enough inference and satisfying feedback.
- Radio clue retention and whether the physical locations are memorable.
- Overall pacing across both missions; no new completion-time claim has been made.
- Screen-reader narration and comfortable touch use on actual devices, beyond automated focus/touch checks.

Refresh the local game to load the revision. Continue preserves and migrates progress. A new investigation is the way to experience the redesigned first mission from its beginning; restarting remains an explicit user action.

## September 28 playtest corrections

### September 29: independent receipts and simpler evidence views

Both grocery receipts now use one reusable paper template: identical materials, typography, spacing, and contents except for their respective date and total. March shows March 30 / $600; April shows April 30 / $800. Neither exposes the other receipt. New investigations need both discoveries before the grocery comparison is complete; existing saves that read the former two-price April document retain their knowledge. The collected comparison uses the same pair of forms.

The workbench filing view now contains one paper with “SHIPPING TAG”, “MARCH 16”, and “Emergency route arrival”. Opening it records the date automatically. The extra blank receipt and separate input-display target are removed; dated input-cost records remain on the cabinet rails. The matched-bulletin record no longer adds large directional arrows underneath the numeric table.

Validation: desktop and phone checks verify identical receipt dimensions, no other-month amounts, independent discovery, one shipping tag, and automatic date credit. Unit checks cover both discovery orders, partial-save reloads, old comparison saves, and retained bulletin figures without redundant arrows. The full first-case playthrough, household regressions, and engine checks pass.

### Household records and fewer inspection steps

The pay envelopes now take two clicks from the room: writing desk → top drawer. The intervening closed drawer, wallet, and clasp views are removed from the active route; returning from the envelopes goes straight to the desk. Existing discovery/save fields remain compatible.

The household electricity account is now an envelope resting on the books at the writing desk in a dedicated high-resolution close-up. Reading it records the existing household utility evidence. The equipment meter in the cabinet area is atmospheric in the first case and retains its production-related pump-rate role in the second case. Household hints and source-record backgrounds now point to the living-area desk.

The April grocery comparison is a complete printed account with integrated vintage lettering, showing the unchanged monthly basket at $600 in March and $800 in April. The earlier March receipt also has larger structured typography. Image descriptions and expandable text copies retain accessible access to the figures.

Validation: two-click access, returning to the desk, household utility discovery, absence of household evidence at the equipment meter, printed grocery evidence, old-save restoration, and desktop/phone layouts pass. The full first-case playthrough and household regression checks pass. New artwork and prompts are listed in the asset manifest.

### Discovery, proportions, and printed evidence

Direct close-ups now use the source crop's actual aspect ratio in both cases. Room plates preserve their 3:2 proportions; atlas props retain square cells and standalone book/paper art is contained without stretching. Crop bounds and their percentage-based controls stay together. Flowing document workspaces crop their backdrops instead of deforming them.

Rent and electricity records are complete printed image assets with large integrated lettering, exact amounts, accessible image descriptions, and expandable text copies. The electricity account shows 500 units in both months and a unit rate rising from $0.40 to $1.00, yielding $200 and $500. Both television sequences use an empty archival map studio; the newsreader has been removed.

The desk's lower drawer is the sole household-puzzle entry. The shelf remains an atmospheric inspection. Register pages contain no national figures; the player must discover the television bulletins. Existing saves that already read the old register summary keep that knowledge, and completed puzzles remain intact. The employee access slot no longer discloses the badge number, location, or household solution. Failed attempts report mismatches without supplying direction settings or the exact dated order; explicit help remains in the hint system.

Added non-clue furnishings to explore and quiet paper, wood, and metal click sounds with an independent mute setting. Object highlighting remains optional and uses subdued solid boundaries. Keyboard focus always has a visible solid ring. WCAG focus-visible guidance does not prescribe permanent dashed hotspot outlines.

Validation: first-case seven-puzzle playthrough; second-case complete playthrough at 1440px and 390px; new discovery/geometry/audio/migration regressions at both sizes; engine, household, cost permutations, branching, recovery-state, register, television pointer/touch/keyboard, interaction, and motion-enabled finish checks all pass. Visual inspections include rent, utility, shelf, register, mail, and news. Screenshots: `tmp/shock-house/discovery-*.png`. Generated asset paths and prompts are recorded in the asset manifest and prompt registry.

### Workshop records and remaining control audit · September 29, 2026

The stock label and staffing comparison now flow inside transparent paper backgrounds with safe text margins. Both adapt to narrow screens; shift comparisons stack vertically, and neither relies on an absolutely positioned fixed-height paper box. The flat beige area outside each sheet has been removed.

Replaced generic “measures” and repeated spool pairs with individual standardized steel blanks. A blank is explicitly defined as a piece of raw steel ready to be shaped. Six are available, each job consumes two at $18 each, other costs remain $18 per job, and the $200 sunk lease remains unchanged. Available and allocated counts stay consistent between the bin and the press; releasing A and C stores the remaining two. Updated source text, hints, feedback, evidence, and flow documentation without changing saved-state fields or puzzle answers.

Active control audit across both cases:

| Surface | Revision / verification |
| --- | --- |
| Work-order press | Replaced CSS bevel frame with illustrated metal backing; steel sprites and rectangular material sockets replace gold cylinders and dashed round slots. Removed token drop animation. |
| Demand-side policy | Replaced flat green slider and rectangle thumb with a recessed metal carriage, engraved seven-stop scale, and ridged dark grip. Native range keyboard, pointer, touch, focus, and live gauge updates are retained. |
| Household balance catches | Replaced flat beveled buttons with textured instrument plates and calibrated direction dials. Labels and direction arrows remain readable. |
| Recovery cost wheel | Added a calibrated four-position dollar dial instead of text pasted over an unmarked gauge face. |
| Recovery installation selectors | Replaced plain green V1/V2 buttons with illustrated three-position design dials. |
| Objective seals and trial lamps | Updated aged material shading and lamp housings; removed floating/rotating stamp animation. |
| Mechanical action buttons, reorder catches, radio date selector | Restored plain material finishes after the follow-up below; ordinary actions no longer reuse panel artwork. |
| Register, radio, recovery direction gauges, press handle, exit handle | Inspected existing illustrated controls; retained their artwork and live behavior. Inactive fallback CSS does not replace the current illustrated controls. |

Validation: engine (54 assertions), recovery state checks, desktop/phone household tests, desktop/phone finish tests, full second-case playthroughs at 1440 and 390 pixels, and new stock/paper/allocation regressions. Visual inspection covers both paper layouts, the press, policy slider, and recovery selectors. New screenshots are in `tmp/shock-house/materials/`; asset provenance and exact prompt are in `ASSET_MANIFEST.md` and `assets/illustrated/PROMPTS.json`.

### Action-button finish correction · September 29, 2026

Removed instrument-panel artwork from shared acknowledgment/retention and mechanism-submit buttons across both games. The `brass-latch` family now uses a plain parchment/brass surface, dark readable lettering, a subtle border and shadow, and matching hover/pressed states. This covers installation records, retained clues, trial/cost/adoption/national records, household and register latches, dispatch compilation, policy acknowledgment, and the second-case exit action. Reorder/remove controls and the radio date selector also no longer shrink panel artwork into their backgrounds. Full-size illustrated mechanisms and their functional artwork remain in context.

Validated the first-case finish walkthrough at 1440 and 390 pixels and the complete second-case walkthrough at 1440 pixels. The Growers Cooperative record now matches the requested plain-button treatment; retained-state text is legible against its light background.

### Second-case objects, records, and completion statistics

Replaced generic second-case blue panels with installation records, batch-cost paperwork, a metered-rate instrument, and textured cost/adoption mechanisms. Both second-case direction puzzles now use calibrated illustrated gauges; June television bulletins share the news-studio treatment. First-case supplier/household source records, cabinet rails, counter, and supporting plates also receive the material finish. Paper backgrounds now fit their text on desktop and phone.

The three placeholder book bars are replaced by illustrated cloth bindings. Both tram-ticket faces contain their own printed lettering. The photograph reverse has an actual backing and brass slotted fastener; a visible Use coin action and persistent satchel entry explain and track the coin's purpose. The mysterious arc below the postcard was neighboring key-ring artwork leaking across an atlas boundary and is now clipped out.

First-case statistics appear immediately on the economic reveal, independent of forecast completion. Second-case start/completion timestamps are additive save fields; existing saves without them remain valid and show unavailable time honestly. Desktop and phone second-case playthroughs, timing/legacy-state checks, first-case engine checks, cost-rail regressions, and the desktop/phone finish walkthrough passed. Visual captures include all three installation documents, the bookshelf, both ticket faces, frame reverse, and statistics.

### Broadcast and instrument finish

Radio instructions now occupy one readable service card, with the purpose of each date source and power connection stated explicitly. The shipping tag is larger. Television bulletins use a newsreader, headlines, large figures, and a phone transcript. Radio tuning and listening controls sit on the illustrated cabinet. Register and policy gauges use textured metal faces with precise live tick marks and needles. Connected register documents retain their DOM nodes when directions change, preventing repeated insertion animations. Production and exit mechanisms use subdued illustrated materials, and the ending replaces the flat yellow overlay with a matching open-door panorama and natural daylight.

Validation: engine (54 assertions), branching, recovery state, full seven-puzzle first mission, television pointer/touch/keyboard controls, interaction regressions, and the new `finish.cjs` desktop/phone walkthrough passed. The latter checks stationary documents with motion enabled, single-step service clue discovery, shipping credit, radio dates and knobs, policy needles, and the open-door ending at 1440px and 390px. Screenshots are in `tmp/shock-house/finish/`; generated-art paths and exact prompt provenance are in `ASSET_MANIFEST.md` and `assets/illustrated/PROMPTS.json`.

### Earlier corrections

The player's latest request supersedes the earlier optional-badge/interchangeable-tag design. Cost records are now distinct dated documents, ordered March 12, March 16, March 21 after inserting employee badge 047. All needed cost and output figures appear on those documents; no hidden source visit blocks a correct answer.

Drawer rewards remain in the illustrated felt-lined drawer until individually inspected and collected. Partial collection persists; legacy saves retain their previously granted rewards and completed puzzles. Receipts are adjacent, counter and time-card rack have separate direct room hotspots, stock text is larger, staffing uses before/after groups of ten, and the press has illustrated iron-and-wood artwork.

Validation: engine (54 assertions), household and branching regressions, all six cost permutations, individual and partial drawer collection, legacy save migration, desktop/phone UI checks, full seven-puzzle first mission, pointer/keyboard accessibility regressions, and full second mission passed. Screenshots are under `tmp/shock-house/polish/`.
