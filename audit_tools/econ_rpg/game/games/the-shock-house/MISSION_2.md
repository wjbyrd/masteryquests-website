# Mission 2 — The Second Harvest

Completing the original exit unlocks **Open Mission 2** on the first case's economic reveal and results. Existing completed version-1 saves qualify immediately. The original mystery remains a negative aggregate supply shock; the second case investigates an independent later efficiency improvement, with aggregate demand held unchanged.

## First-case cleanup

The coat, photograph, coin, tram ticket, and gardening book have no interaction targets in Mission 1. Old discoveries remain compatible with saves but no longer display unused items in its satchel. The gardening book cannot be pulled from the first case's shelf. Mission 2 activates those objects with separate progress and real dependency checks.

## Playable sequence and solutions

| Step | Where and action | Purpose / result |
|---|---|---|
| 1. Open the photograph | Search both pockets of the coat beside the exit. Take the coin and ticket. Turn over the framed photograph to the right of the exit; use the coin on its slotted fastener. | Coin releases the backing. The filing note names the gardening journal and asks for the journey date on the ticket. |
| 2. Find the trial | Flip the ticket: **14 MAR**. At the shelf above the writing desk, pull the gardening book from the left side of the lower shelf. Open it and select **14 MAR**. | Trial uses 3 pump-hours instead of 6, with unchanged harvest, quality, land, and other inputs. Photograph and ticket inspection are required. The departure time is printed context, not a code. |
| 3. Recalculate costs | Examine the idle machine beside the workbench. Set **$15**, then stamp the cost record. | 3 hours × $2/hour + $9 unchanged other costs = $15. Old method costs $21 for the same batch. Trial notes are required. |
| 4. Establish national scope | At the television, use the two visible knobs to cycle three June bulletins. Click the screen to compare figures; set output **UP**, prices **DOWN**, then seal. | Reports establish adoption across agriculture and input-producing industries, output 200 → 216, price index 100 → 96, and unchanged AD. All bulletins and the cost record are required. |
| 5. Reconstruct the cause | Return to the exit. Place adoption → lower unit costs → increased SRAS → higher output/lower price level. Set **SRAS RIGHT, output UP, prices DOWN**. Turn the mechanism. | Completes the second case. A comparison with Mission 1 explains the opposite supply shifts. |

The utility cabinet also holds the June demand-policy log, corroborating the unchanged-AD assumption. It adds context rather than a new prerequisite. Hints advance through the unfinished dependencies and give object locations; the satchel keeps the ticket and recovered records available.

## Economic framing

The small garden experiment establishes a technical resource saving, not an aggregate conclusion. Later widespread adoption plus national output and price observations establish the positive aggregate supply case. June figures use their own baseline; they do not simply reverse April values. Lower production costs shift SRAS right with AD unchanged. The lower observed price level is not a claim of permanently falling prices. No labor-market direction is inferred solely from the productivity change.

## Implementation and saves

- `recovery-state.js`: independent progress, prerequisite checks, wrong-answer feedback, final sequence, hints, and validation.
- `recovery-view.js`: reuse of illustrated plates, object-component targets, readable physical records, mission-specific panoramas, satchel, and ending.
- `recovery.css`: document, control, and small-screen layouts.
- `engine.js`: optional `recovery` state and `recovery` / `recovery-results` stages in the existing version-1 save. Missing recovery data migrates to `null`. Invalid or premature second-case states are rejected.
- `game.js`: unlock, scene routing, interaction, hints, keyboard navigation, and persistent resume. First-case records and solved flags are retained. Starting a new investigation resets both missions after the existing confirmation.

Reuses the shipped bitmap assets. No new remote services or image generation is required. Separate state prevents previous coat or book discoveries from skipping the second case. Completion and partial selections survive reloads. The first economic reveal remains available from the second ending.

## Validation

`tests/shock-house/recovery.mjs` covers dependencies, wrong answers, malformed state, migration, and completion. `recovery.cjs` plays both desktop and phone paths including first-case cleanup, legacy completion unlock, coin use, ticket/date lookup, cost calculation, national evidence, causal reconstruction, partial reload, completed reload, and first-case preservation. The original seven-puzzle playthrough and gesture/save regressions remain in the test suite.
