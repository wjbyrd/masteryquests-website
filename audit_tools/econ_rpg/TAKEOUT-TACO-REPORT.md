# Takeout Taco: Lunch Rush — graphical analysis and transfer revision

Revised the existing private mini-game in place. The staffing mechanic, production schedule, ten-window cap, original seven images and conditional review questions remain intact. Nothing was deployed or pushed.

Launch: <http://127.0.0.1:4179/games/takeout-taco-lunch-rush/>. Start `node audit_tools/econ_rpg/serve.mjs` from the repo root if needed. Return to Games remains the private `/games/` route.

## Files changed

All runtime paths below are relative to `audit_tools/econ_rpg/game/games/takeout-taco-lunch-rush/`.

| File | Change |
| --- | --- |
| `index.html` | Room to Stay-style Mastery Quests brand treatment |
| `lunch-rush.css` | Direct Room to Stay tokens, panels, buttons, focus, typography, width and mobile treatment; responsive graph styles |
| `engine.js` | Crew-specific operational dialogue; fresh graph/transfer state on each run; production arithmetic unchanged |
| `debrief.js` | Final review continuation now enters the total-product graph, rather than completion |
| `app.js` | Crew context and phase routing; review → graphs → explanation → transfer → final takeaway; telemetry dispatch |
| `telemetry.js` | Record schema 3; new phase answers and final-completion metrics |
| **New** `analysis.js` | Fixed graph/transfer questions, guarded answer/continue transitions and metrics |
| **New** `graphs.js` | Accessible responsive inline SVG derived from the existing production schedule |
| **New** `analysis-view.js` | Graph questions, paired comparison, What If and concise final takeaway |

Also updated `audit_tools/econ_rpg/takeout-taco.test.mjs`, `takeout-taco.browser.test.mjs`, and this report. No Room to Stay code, shared site styles, public navigation, other games, registry, server, source PNG or runtime WebP was edited. Previously supplied replacement art/deleted old filenames remain the user's pre-existing worktree changes.

## Exact visual reference

Inspected **`audit_tools/econ_rpg/game/index.html`** and **`audit_tools/econ_rpg/game/rpg.css`**, the actual Room to Stay shell and stylesheet. Specifically followed:

- `:root`: navy `#062454`, page `#031638`, primary text `#ebf3ff`, secondary text `#bccbe1`, teal `#77d9d3`, gold `#efcd87`, border `#3a5277`, panel `#0c2a51`; Inter/system font stack, 16px base, 1.6 line height.
- `body`: blue radial background, `#123b61` fading into the navy page. This replaces the prior pale shell with the reference game's blue UI, without new noir decoration or altered artwork.
- `main`, `.masthead`, `.brand`, `.hero`: 1160px maximum width, 28px desktop gutters, 88px masthead, teal brand accent, 28/24px title spacing, 2–3rem title hierarchy.
- `.panel`: `linear-gradient(135deg,#103157,#0a2549)`, 18px radius, subtle `0 20px 50px #0002` shadow, thin borders; used for intro, operations/log and learning phases.
- Base buttons, `.choice`, `.primary`: blue secondary buttons, teal primary buttons with navy text, 48px minimum height, 10px radius, blue/teal hover states, gold 3px focus outline with 5px offset.
- Table cell borders, muted text, teal emphasis and gold selected/highlight treatment.
- The reference's **760px** breakpoint for smaller gutters, centered/wrapped brand header and 14px-radius panels. The game's existing **800px** management stack is preserved.

These rules are local to Lunch Rush; Room to Stay's stylesheet is not imported or modified. Browser QA compares the two pages' resolved text, muted, accent, gold, border and panel tokens. Screenshots were visually inspected. During management, the truck image remains the largest visual object and retains its full aspect ratio. Graph phases use the same panel/typography family.

## Operational dialogue

The secondary customer-pressure line now says **Demand stays strong**. A separate crew-specific message describes what the kitchen is doing:

| Crew/state | Operational message |
| --- | --- |
| One, backlog ≤8 | The line is moving, but one worker is handling everything. |
| One, backlog >8 | Orders are piling up. One worker cannot keep pace. |
| Two | Tasks are being divided. The crew is moving faster. |
| Three | Specialization is paying off. The kitchen is running smoothly. |
| Four | Output is still rising, but the workspace is starting to tighten. |
| Five | Orders are moving, but workers are beginning to crowd one another. |
| Six | The line is under control. The kitchen isn’t. Six workers are fighting for the same space and equipment. |

The numerical production result remains separate and reports exact current output and the signed change from the previous crew. The live announcement includes operational context. Generic manageable-queue wording no longer competes with crowding at five/six workers.

Backlog arithmetic is unchanged from the prior pass: first window 4; subsequent solo windows +2; larger crews reduce it by 4 with a floor of 4. It affects only the one-worker scene and light context, never output. Solo backlog ≤8 uses the calm worker-0 image; >8 uses worker-1. Crews 2–6 retain exact image mappings. No queue count, queue controls or new demand model.

## Preserved management and review

`engine.js` still uses `[0,8,18,31,42,50,53]`; additions derive as `[8,10,13,11,8,3]`. Total product rises throughout and marginal product stays positive. Add/hold/send remain bounded at 1–6, each advances one service window, and Production Log records unique tested crews only.

Review unlocks after four distinct crews, with optional further experimentation. At ten windows, staffing stops and review is prompted. The existing fewer-than-four cap exception remains so repeated holds cannot strand the player. Its turning-point question uses a clearly labeled partial reference for crews 1–4 rather than pretending those crews were tested.

Existing conditional Production Review remains **3 / 5 / 6 questions** for four / five / six observed crews: turning point, required numeric calculation of 13, extra fifth-worker calculation of 8 and contribution-versus-output question when applicable, sixth-worker question only when observed, and final fixed-input interpretation. Selection follows tested crew sizes even after reducing staffing. Feedback and explicit continuation remain, with no displayed score or gate requiring correct answers.

Only the destination of its last continuation changed: **BUILD THE PRODUCTION PICTURE**. Formal terms now enter naturally in the graph phase, as requested; the full formal table remains after both graphs.

## Graph implementation and flow

No reusable runtime chart component or chart dependency was found in the private game/Econ-nections code inspected for this pass. The implementation uses **native inline SVG**, without canvas, a new library, network dependency, or raster graph assets. `graphs.js` derives every value from `productionRows()`, not a second production schedule.

Each graph has visible axis titles, numeric ticks, connected points, `role="img"`, a unique title/description association, and an accessible description listing every displayed worker/value pair and its evidence source. Shapes and line patterns distinguish evidence, so color is not the only cue. Graphs need no mouse, keyboard or hover to read. The paired graphs stack on mobile.

1. **Total Product:** horizontal Workers; vertical Tacos per Production Window. Initially plot only tested crews, labeled **YOUR OBSERVED PRODUCTION**. All-six runs immediately show all six observed points. Axis ticks include the full range but untested markers/segments are absent.
2. **TP question:** correct option is “It continues rising, but at a decreasing rate.” Correct or incorrect response receives the flattening explanation. Only then do missing values appear, so the complete schedule is visible.
3. **Evidence styling:** observed points are filled teal circles with solid connecting segments; revealed points are hollow gold diamonds with dashed connecting segments and an explicit legend. Accessible descriptions identify observed versus revealed for every point.
4. **Marginal Product:** full points `(1,8),(2,10),(3,13),(4,11),(5,8),(6,3)`; horizontal Workers and vertical Additional Tacos from One More Worker. Gold rings mark Workers 3 and 4, with a visible key identifying **peak 13** and **first decline 11**. The zero-based vertical scale makes all contributions visibly positive. Revealed/observed provenance is preserved here too.
5. **MP question:** correct concept is each additional worker adds fewer tacos than the worker before. Feedback explicitly connects falling MP with still-rising TP.
6. **Connect the graphs:** both complete graphs plus three short statements: MP rises through Worker 3 then falls; positive MP keeps TP rising; smaller MP flattens the TP curve.
7. **Formal DMR record:** preserved full table, Worker 4 highlight, strong existing explanation, specialization, crowding and **Smaller additions. Still more tacos.** Exploration-specific message remains.
8. **WHAT IF?:** second grill and more prep space before tomorrow. Correct option B predicts diminishing returns likely starting with more workers. Feedback explains the relaxed fixed-input constraint and never invents a new worker count or production schedule.
9. **Final takeaway:** **SPECIALIZATION FIRST. CROWDING LATER.**, one short explanation, Play Again and Return to Games. Replay resets management, backlog, tested crews, review answers/index, graph answers, transfer answer, completion and run ID.

At the cap with fewer than four tested crews, the initial TP graph still plots only observed points. A short labeled kitchen reference supplies outputs for crews 3–6 as reasoning evidence, avoiding a blind question; these do not become observed graph points.

## Telemetry

Existing anonymous browser-local records, key prefix `mq.takeout-taco.run.v1.`, latest-20 retention and unavailable-storage fallback are retained. Records are event history, not resumable saves. New records have **schemaVersion 3**; older records remain untouched. No identity or external transmission; CSP still denies network connections.

New events:

- `production_review_complete`: once after leaving the last review feedback.
- `total_product_graph_answer` and `marginal_product_graph_answer`: once per answer.
- `what_if_answer`: once after the transfer answer.
- `game_complete`: once on entering the final takeaway, replacing the earlier premature `complete` event.

Added `productionReviewCorrect`, `productionReviewTotal`, `totalProductGraphCorrect`, `marginalProductGraphCorrect`, `whatIfCorrect`, and answer/question identifiers. Existing review metrics, distinct tested count, maximum observed crew, output, backlog and run fields remain. Unanswered fields stay null. **completed remains false through review, graphs, formal explanation and What-If feedback**; only the final takeaway completes the run.

## Verification

- **9 Taco automated tests passed.** Includes unchanged schedule; all management prefixes; backlog scenes; existing conditional review; unchanged art hashes; telemetry retention/failure; crew dialogue; exact graph/evidence data; all graph/transfer answer branches.
- Exhaustive management check: **9,020 legal prefixes**, **5,791 complete staffing paths to the cap**. Bounds, signed deltas, unique logs, scene selection, review gating and original outputs preserved.
- Tested all **64 combinations** of TP / MP / What-If answers, correct and incorrect, with phase ordering, duplicate-answer rejection, required-response guards, no management-state changes and final completion only after transfer.
- Graph checks cover observed depths 1–6, exact TP/MP values, evidence flags, positive MP, Worker 3 peak and Worker 4 first decline.
- Browser full runs cover cap fallback, all seven images, calm/stressed transitions, returns to one worker with high/low backlog, all staffing actions, review after four, continued exploration, reductions after six, all 3/5/6 review lengths, typed calculations, correct/incorrect feedback and blocked storage.
- Browser graph checks verify only tested points initially, 6 complete points after response, exact MP values, two highlights, paired comparison, formal-table timing, What-If after the explanation, and concise final screen. Complete replay traverses the new stages with a new run ID; exact event counts verify no duplicated listeners/events.
- Browser compares Room to Stay's resolved design tokens with Lunch Rush. Visual inspection covered artwork, panels/buttons/tables, observed/revealed graph markers, mobile MP graph and final takeaway.
- Responsive checks passed at **1920×1080, 1280×720, 900×800, 768×1024, 390×844 and 320×740**, plus a **1366×768** full run. Tested management, review/calculations, both graphs, connected graphs, DMR record, transfer and final takeaway. No horizontal overflow; accessible touch targets and mobile ordering preserved.
- **Zero browser console/runtime errors, failed HTTP responses or external requests.**
- **54 existing-game/publication tests passed**, including all earlier frozen path behavior and asset checks. Public navigation, Composer, telemetry and Cloudflare configuration remain untouched, and the publication build excludes the private prototype tree.
- **63 automated tests passed in total**, plus the expanded browser suite. `git diff --check` passed. No deployment or push.

Reproduce:

```powershell
node --test audit_tools/econ_rpg/takeout-taco.test.mjs
# Set PLAYWRIGHT_MODULE to the installed package path if needed.
node audit_tools/econ_rpg/takeout-taco.browser.test.mjs
node --test audit_tools/econ_rpg/publication.test.mjs
```

Screenshots and results remain ignored local artifacts in `tmp/econ-rpg/takeout-taco/`.

## Instructor review

- Room to Stay's actual reference is a dark navy/blue UI. This pass matches that source faithfully, with bright imagery and blue panels; it does not retain the earlier pale shell or add noir imagery.
- The longer learning arc intentionally increases time spent analyzing, without any extra service windows. Classroom pacing has not been timed with students.
- The graph/cap reference exception is retained for low-exploration runs. Reference data is clearly distinguished from observed data.
- The What-If prediction is deliberately qualitative (“likely”), not an exact claim about a new production function.
