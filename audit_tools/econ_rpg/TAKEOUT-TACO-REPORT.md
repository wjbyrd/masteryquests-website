# Takeout Taco: Lunch Rush — two-truck ending extension

Added the applied two-truck challenge after the existing DMR explanation, replacing the generic second-grill What-If. The original staffing simulation, conditional Production Review, Total Product/Marginal Product graphs and their questions remain unchanged.

Launch: <http://127.0.0.1:4179/games/takeout-taco-lunch-rush/>. The existing loopback server is `node audit_tools/econ_rpg/serve.mjs`. This remains a private preview. Nothing was deployed or pushed.

## Files modified

Runtime files are under `audit_tools/econ_rpg/game/games/takeout-taco-lunch-rush/`:

| File | Change |
| --- | --- |
| **New** `two-truck.js` | Allocation arithmetic, retry progression, two concept questions, guarded answers and telemetry metrics |
| **New** `two-truck-view.js` | Baseline, allocation choices/results, image reveal, follow-up questions and final visual comparison |
| `scenes.js` | Adds `TWO_TRUCK_SCENE` with the exact supplied filename and meaningful alt text; original scene mapping unchanged |
| `engine.js` | Fresh two-truck state in `newRun()`; management logic and production schedule unchanged |
| `analysis.js` | Removes generic What-If question/metric; DMR continuation now enters the two-truck phase |
| `analysis-view.js` | Removes the previous final-screen rendering and reserves this view for the existing graphs |
| `app.js` | New end-phase routes, delegated allocation/answer handlers, event dispatch; DMR exit button becomes THE NEXT RUSH |
| `lunch-rush.css` | Appends ending-only result cards, image comparison and mobile stacking styles |
| `telemetry.js` | Schema 4 and allocation/capacity/transfer fields |

Updated `audit_tools/econ_rpg/takeout-taco.test.mjs`, `takeout-taco.browser.test.mjs` and this report. Existing `debrief.js`, `graphs.js`, HTML shell, Room to Stay reference styles, earlier artwork and unrelated game/site code were not edited. The two new supplied art files were already present as untracked user assets at the beginning of this pass; they were not generated or modified.

## Artwork

`TWO_TRUCK_SCENE` in `scenes.js` points to:

`../../art/scenes/takeout-taco-lunch-rush/takout-taco-worker-7.webp`

Exact runtime asset: `audit_tools/econ_rpg/game/art/scenes/takeout-taco-lunch-rush/takout-taco-worker-7.webp`.

Alt: “Two Takeout Taco trucks operate side by side, each staffed by three workers, with customers lined up at both trucks.”

SHA-256 pinned in tests: `4f4851c0a85a3c875b77502613fb4d0de8625a4a78f4072e8e5cbdd3e478f751`.

The image is absent from the initial allocation screen and from 5+1 / 4+2 results. It appears only after 3+3 is selected, then appears in the final side-by-side comparison. The original six-worker single-truck scene supplies the other comparison image. Both images preserve their complete intrinsic aspect ratio, with no crop, overlay or edit; cards stack vertically on mobile. All important economic information is also text/numbers.

## Calculation and repeated attempts

Both trucks independently reuse the **existing** `TOTAL_PRODUCT = [0,8,18,31,42,50,53]` from `engine.js`. No second production function was introduced.

`allocationResult(a)` assigns `b = 6 - a` and computes `TOTAL_PRODUCT[a] + TOTAL_PRODUCT[b]`.

| Allocation | Truck A | Truck B | Combined |
| --- | --- | --- | --- |
| Baseline 6+0 | 53 | 0 | **53** |
| 5+1 | 50 | 8 | **58** |
| 4+2 | 42 | 18 | **60** |
| 3+3 | 31 | 31 | **62** |

The only selectable splits are 5/1, 4/2 and 3/3. Every split has exactly six total workers. Swapped duplicates are not offered. The baseline, balanced result and **+9** comparison are derived from the same schedule.

Each choice enters a result screen with both trucks' workers/output and their combined output. Choices are not labeled wrong. For 5+1 and 4+2, TRY ANOTHER SPLIT returns to the same three choices. Repeated choices are allowed and recorded as separate attempts, without advancing any service window or changing the original Production Log. There is no arbitrary retry cap; 3+3 is always available.

Allocation feedback:

- **5+1:** “Better than putting all six workers in one truck. But one kitchen is still crowded while the other has very little labor.”
- **4+2:** “More output than the one-truck baseline. Labor is spread more evenly across the available production space.”
- **3+3:** “Three workers in each truck produce 31 tacos each. The same six workers now have two kitchens to work in.”

Discovering 3+3 reveals the artwork and **SAME SIX WORKERS. MORE OUTPUT.** with the explicit 53 → 62 / +9 comparison. It then advances to interpretation. A player may discover 3+3 immediately; testing the other two splits is not required.

## Two final questions

After discovery:

1. **Why can the same six workers produce more with two trucks?** Correct choice C: each group has more fixed space and equipment. Feedback states that the workers and total labor did not change; the amount of capital available to them did. Distractors cover skill, demand and marginal product ceasing to apply.
2. **Does the two-truck result contradict diminishing marginal returns?** Correct choice C: no, the fixed inputs changed, so the original one-truck relationship does not describe the new setup. Feedback contrasts adding labor to one fixed truck with changing capital by adding another truck. Distractors include capital reducing output, six workers always producing 53, and DMR requiring falling total product.

Correct and incorrect answers receive the same substantive explanation, preceded by brief confirming/corrective wording. Each answer is accepted once and requires explicit continuation. Neither correctness nor financial performance gates completion. No costs, wages, revenues, pricing, profit, new workers or new graphs were introduced.

The final takeaway is now **SPECIALIZATION FIRST. CROWDING LATER. CAPACITY MATTERS.** It includes the concise specialization/crowding/capital explanation, visual one-truck/two-truck cards, **SAME LABOR · +9 TACOS**, Play Again and Return to Games.

## Telemetry and replay

Local-only storage, latest-20-run retention, storage failure fallback and random run IDs remain. Records use the existing `mq.takeout-taco.run.v1.` namespace with **schemaVersion 4**. No identity, email or network service is added. Older records remain intact.

New events:

- `two_truck_challenge_start`: once on entry from the DMR explanation.
- `two_truck_allocation`: once per valid allocation selection.
- `two_truck_best_allocation_found`: once when 3+3 is discovered.
- `two_truck_concept_answer`: capacity question response.
- `two_truck_dmr_transfer_answer`: DMR transfer response.
- Existing `game_complete`: once on entering the final takeaway, after both feedback screens.

Added fields: allocationTruckA, allocationTruckB, truckAOutput, truckBOutput, combinedOutput, allocationAttemptNumber, bestAllocationFound, capacityQuestionCorrect, dmrTransferCorrect. New question events also include question ID and selected answer. Not-yet-answered metrics are null. Original `workers`/`finalCrew` fields describe the earlier management run; allocation-specific fields describe the six workers in the challenge. The removed generic `what_if_answer` and `whatIfCorrect` are no longer emitted.

Replay creates a fresh run containing empty allocation attempts, null current allocation, false discovery flag and null capacity/DMR answers, alongside the original reset of crew, windows, tested levels, review and graph answers. Listeners remain delegated and are not reattached during replay.

## QA

- **10 Taco automated tests passed.** Original schedule, management actions, backlog scenes, conditional review, graph data, original image hashes and local storage behavior still pass.
- Exhaustively checked **9,020 management prefixes / 5,791 paths to the ten-window cap**, unchanged.
- Checked all **256 combinations** of the two graph answers and two new follow-up answers, including incorrect responses, phase guards, duplicate-answer rejection and unchanged earlier management state.
- Checked **765 allocation attempts** across all retry prefixes through eight attempts, including repeated/reordered 5+1 and 4+2 followed by 3+3. Exact totals, six-worker invariant, required discovery and no dead ends passed.
- New WebP filename, meaningful alt and original-byte hash passed. All previous art hashes remain unchanged.
- Browser walkthrough exercised **4+2 → 5+1 → 4+2 → 3+3**, **5+1 → 4+2 → 3+3**, and immediate **3+3**. It verified hidden-before-discovery imagery, decoded new image, all numerical results, both follow-up questions, correct/incorrect feedback and final 53/62/+9 comparison.
- Browser replay completed a second full run. Telemetry showed fresh allocation state, three second-run attempts, one discovery event, one challenge-start event and one game-complete event; the full six-level run with three allocation attempts produced exactly 28 events. No duplicate handlers/events.
- Full existing review/graph/browser walkthrough still passes, including reduced final staffing after testing six, observed-only TP points, revealed points, MP peak/decline, full table timing, blocked storage and private return route.
- Responsive checks passed at **1920×1080, 1280×720, 900×800, 768×1024, 390×844, 320×740**, plus a **1366×768** walkthrough. New challenge/result/feedback/final screenshots were inspected. No horizontal overflow; buttons meet touch-target checks; final images stack on mobile without distortion.
- **Zero console/runtime errors, failed HTTP responses or external requests.**
- **54 earlier-game/publication tests passed.** Frozen earlier-game behavior and art remain unchanged; public navigation, Composer, telemetry and Cloudflare configuration are untouched; the publication build excludes this private game.
- **64 automated tests passed in total**, plus the expanded browser suite. `git diff --check` passed, and the existing review/graph modules have no diff from the starting commit. No deployment or push.

Reproduce:

```powershell
node --test audit_tools/econ_rpg/takeout-taco.test.mjs
# Set PLAYWRIGHT_MODULE to an installed Playwright package if needed.
node audit_tools/econ_rpg/takeout-taco.browser.test.mjs
node --test audit_tools/econ_rpg/publication.test.mjs
```

Local browser screenshots/results remain ignored in `tmp/econ-rpg/takeout-taco/`.

## Instructor-review choices

- The one-truck result is labeled **baseline**, rather than claiming every player personally tested six workers; four-crew runs still reach this ending.
- 4+2 feedback compares with the baseline rather than saying “output rises again,” since it may be the first allocation selected or a repeated one.
- Discovery of 3+3 advances the activity; it does not force testing 5+1 and 4+2 first. This preserves the requested discovery while avoiding empty repeated rounds.
- New artwork depicts more customers, but scenario text explicitly says tomorrow is just as busy and question feedback attributes the output gain to capital, not demand or worker skill.
