# Gameday Rivals — implementation and QA report

Private development implementation, September 21, 2026. Preview: <http://127.0.0.1:4179/?scenario=gameday-rivals>. Start with `node audit_tools/econ_rpg/serve.mjs` from the repository root. No deployment, push, publication, public navigation addition or production source modification was performed.

## Experience and architecture

The player manages fictional Copper Cart against fictional Clover Run in Alderwick. Every home game repeats the same two independently chosen strategies. The rival's current offer is committed before the strategy buttons render, remains outside the visible/persisted unresolved state, and is revealed with the player's choice in one synchronous render. Previous completed rounds change the rival's probability; there is no branching story route, graded choice, boss or forced ending.

`game/scenarios/gameday-rivals.js` owns the title, identities, labels and six round definitions. Renaming the visible title requires changing its `title` field; the save/route ID can remain stable. Economics, rival behavior and scene metadata live in separate scenario modules. `gameday-rivals-engine.js` supplies immutable observe/reveal/advance transitions. Its controller, view, CSS and storage are separate from the four earlier RPGs. The shared changes are a registry entry and a new `preview.js` dispatch entry in the existing private HTML shell. The original RPG engine, controller, renderer, styles, storage and scenario logic remain byte-unchanged relative to HEAD `f850939`.

The command center shows market opportunity, the round scene, equally styled strategy buttons, season profits/shares and a persistent semantic history ledger. Reveals report both choices, both profits, actual bounded share changes and a short outcome explanation. Neither the payoff matrix nor formal Prisoner's Dilemma, dominant-strategy or Nash terminology appears during the six rounds. The final debrief adds those concepts, counts and the student's actual results.

## Payoffs and demand

All amounts below are dollars. One canonical base matrix applies throughout:

| Player | Rival | Player profit | Rival profit |
|---|---|---:|---:|
| Standard | Standard | 100,000 | 100,000 |
| Aggressive | Standard | 155,000 | 45,000 |
| Standard | Aggressive | 45,000 | 155,000 |
| Aggressive | Aggressive | 70,000 | 70,000 |

Both payoffs receive the same demand multiplier. Integer hundredths and whole-dollar amounts avoid accumulated display/rounding discrepancies. Display retains exact dollars, including $232,500 in the final asymmetric round, rather than rounding each reveal to thousands and creating totals that do not add up.

| Round | Opportunity | Multiplier | T | R | P | S |
|---|---|---:|---:|---:|---:|---:|
| Big Home Opener | High | 1.15 | 178,250 | 115,000 | 80,500 | 51,750 |
| Small-Team Game | Low | 0.80 | 124,000 | 80,000 | 56,000 | 36,000 |
| Conference Game | Medium-High | 1.00 | 155,000 | 100,000 | 70,000 | 45,000 |
| Heated Rival | High | 1.25 | 193,750 | 125,000 | 87,500 | 56,250 |
| Homecoming | Very High | 1.35 | 209,250 | 135,000 | 94,500 | 60,750 |
| Biggest Rival | Maximum | 1.50 | 232,500 | 150,000 | 105,000 | 67,500 |

Every round preserves **T > R > P > S**. Final stakes are largest. Numeric multipliers stay out of the round UI. Profit is the payoff; market share is a separate description of order distribution, beginning 50/50. An asymmetric round moves six percentage points toward the aggressive firm, clamped to 25–75%; symmetric rounds move zero. The rival's share is always the complement. The UI reports the actual change at a bound, and share never feeds back into profit.

The independent mutual-Standard industry comparison is **$1,410,000** over six games. Asymmetric base payoffs also sum to $200,000; only mutual Aggressive lowers joint profit relative to that benchmark. The debrief states this explicitly. It explains why Aggressive is one-shot dominant, why mutual Aggressive is the one-shot Nash equilibrium, and why history changes expectations about this uncertain competitor. The finite horizon has no later home-game response after Game 6; the narrative does not claim that repetition guarantees cooperation or that restraint is a finite-game equilibrium. No communication, agreement or recommendation to coordinate occurs.

## Rival and simultaneity

`chooseRivalAction(previousHistory, roundContext, rng)` receives only completed action pairs and pre-round context, all frozen by the engine. Starting Aggressive probability is 0.22. Add 0.22 after a player Aggressive, add 0.10 for at least two player Aggressives in the last three rounds, subtract 0.12 after two consecutive player Standards. Round pressures are 0.04 / 0.08 / 0.05 / 0.10 / 0.08 / 0.12. Clamp to 0.10–0.85. No current player action, button, current payoff or DOM input reaches this module.

Mulberry32 uses a stored unsigned 32-bit seed. Round index selects one stable draw from that sequence; replay recomputes it without storing a mutable generator. Same seed and prior history yield the same action, including after refresh. Ordinary play creates the seed with `crypto.getRandomValues` and a UUID run ID. `&seed=0` through `&seed=4294967295` select reproducible QA seeds; invalid values produce a notice. No untracked `Math.random` calls occur. A QA reset deliberately reuses its URL seed; an ordinary reset creates a fresh one.

The controller locks player input and disables the old buttons before resolving. Both actions, payoffs and the new ledger row enter the DOM together. The rival commitment is checked against the pre-round run; it is not recalculated from the player's chosen action. Exhaustive tests compare Standard and Aggressive branches from every pre-round state and spy on every rival input. Browser tests invoke the same stale button twice and confirm only one payoff/history entry.

## Save, resume and replay

Serializable state includes scenario/version, run ID/time/seed, current phase/index/key/demand/multiplier, both current choices, round and cumulative firm/industry profits, shares, full action/payoff/share history, classification and completion. Unresolved choices are null. History entries are the action/profit/share histories without redundant arrays.

`gamedayRivalsSave_v1` is written only after a completed reveal. Loading strictly replays every saved player action against the stored seed and compares the whole resulting state. Corruption and incompatible versions fail visibly. Resume advances the last completed reveal once, restoring the next unresolved game or the final debrief without another payout. Storage denial permits in-memory play with an explicit warning. New Season uses the existing accessible confirmation dialog and removes only this game's key. Play Another Season also starts a clean run.

## Assets, overlays and accessibility

Six runtime WebPs and six PNG masters are supplied originals, preserved byte-for-byte. Masters moved outside the served `game/` root. The asset manifest records original/current paths, hashes, dimensions and byte counts. No image generation, pixel editing, conversion or recompression was performed. Each round maps directly to its own image; only Game 6 uses the night file. All retain 1448 × 1086 proportions and `object-fit: contain`. Missing runtime images show a filename-specific notice without fallback.

**Unresolved reference limitation:** the expected `canonical-day.webp` is absent, including in the asset folder confirmed by the user. No substitute is created. The six actual round images were inspected; comparisons against the missing canonical geometry cannot be certified yet.

Base crowds/traffic represent demand. SVG outlined P/orange and R/green units represent revealed strategy: 2/2, 4/2, 2/4 or 4/4. Existing colored vehicles in the raster remain background traffic, distinguished by the caption. Every SVG vehicle uses one firm's color, including moped boxes, plus a P/R mark and accessible text. Coordinates are fixed in image space:

| Slot | x / y | Direction / rotation | Type |
|---|---|---|---|
| nw1 | 250 / 647 | northwest / 201° | car |
| nw2 | 430 / 716 | northwest / 201° | moped |
| nw3 | 610 / 785 | northwest / 201° | car |
| nw4 | 750 / 839 | northwest / 201° | moped |
| se1 | 250 / 708 | southeast / 21° | moped |
| se2 | 430 / 777 | southeast / 21° | car |
| se3 | 610 / 847 | southeast / 21° | moped |
| se4 | 740 / 896 | southeast / 21° | car |

The two directions are exactly 180° apart. Scaled vehicle footprints remain inside authored lane/road polygons and outside crosswalk polygons. No random positioning or moving vehicle animation is used. These are schematic indicators over supplied traffic, not a physical traffic simulation. They are small on phones, so the visible unit counts and full text reveals carry equivalent information.

Buttons are native keyboard controls with inherited visible focus, at least 48px targets and equal visual weight. Headings receive focus on transitions; a live region announces both choices/profits. The ledger uses ordered rows, headings and description lists. At 390px and 320px, reveal cards/actions stack, stats use two columns and ledger rows become cards. The matrix has its own bounded scroll container if needed. Reduced-motion mode disables transitions/animations; no timing or motion is required. Automated keyboard/layout checks supplement screenshot inspection; a human screen-reader session remains a useful instructor check.

## Exhaustive QA and classifications

Exactly **64 player sequences × 32 seeds (0–31) = 2,048 complete seasons**, comprising **12,288 reveals**. All six rounds, two actions, deterministic transitions, input isolation, payoffs, accumulation, bounded shares, save/replay, scenes and class reachability are asserted. All supplied assets are hash-checked.

Classification precedence is the following table order. A retaliation transition counts at most once when either current aggressive action follows the opponent's previous aggressive action. It describes observed timing, not proven motive. No threshold adjustment was needed.

| Classification | Rule, if no earlier rule matched | Count |
|---|---|---:|
| Promotion War | ≥3 mutual Aggressive rounds OR ≥9 combined Aggressive choices | 338 |
| Retaliation Cycle | ≥3 lagged aggression transitions | 647 |
| Opportunistic Season | ≥3 asymmetric rounds, with one firm aggressive in a strict majority | 535 |
| Stable Competition | ≥4 mutual Standard and ≤1 mutual Aggressive | 161 |
| Market-Share Chase | Either firm Aggressive ≥4 times | 48 |
| Uneasy Restraint | Remaining mixed histories | 319 |

[QA paths](GAMEDAY-RIVALS-QA-PATHS.md) lists all 64 sequences and nine representative seeds/routes: the eight requested patterns plus a Market-Share Chase witness. The browser set extends these to 14 paths for all 24 round/activity combinations, then repeats at 1280px, 390px and 320px: **42 complete browser seasons**, plus targeted keyboard/reload/reset/failure checks.

### Final results

- **49/49 unit, regression and publication-isolation tests passed.** The revised vehicle footprints also passed the Gameday unit suite after their final size change.
- **42 complete Gameday browser seasons passed**, covering all six classifications and all 24 round/activity combinations at each of three widths. There are 72 scene screenshots, plus full reveal/debrief captures. Actual DOM actions, payoffs, shares and ledger rows match deterministic simulation. No horizontal page overflow, duplicate reward, early matrix/theory disclosure or premature rival-action disclosure was detected.
- Targeted browser checks passed for Enter/Space activation, focus transfer, live announcements, reload after all six reveals, exact restored totals/seed, reset cancellation, four older save keys, automatic/QA seed reset, invalid seed, incompatible save, storage denial and an explicitly missing image. Normal play produced **zero runtime errors, external requests or CSP violations**.
- All four earlier browser suites passed: **Room to Stay 41 complete runs**, **The Main Attraction 27**, **The Economy’s Edge 33**, **Megastar Mania 51**: **152 complete regression runs** plus their targeted checks. Megastar's immediate added-date map and all seven endings passed. The prior four complete-path outputs remain frozen at 200 / 665 / 361 / 729 paths with their pre-change SHA-256 fingerprints.
- Local production staging excludes the private runtime, game names, save key, identities and all supplied asset hashes. Protected production source/navigation/configuration files remain unchanged. `git diff --check` passed.

Initial QA exposed two test-harness defects: strict equality treated zero and negative zero differently in a share-complement assertion, and a browser notice assertion raced the dynamic module mount. These were corrected and the checks rerun successfully; neither changed the game rules. Visual inspection also led to enlarging the schematic vehicles within the checked safe footprints. **No unresolved runtime test failure remains.** Canonical-reference verification is explicitly pending the absent file, not counted as passed.

Evidence is under ignored `tmp/econ-rpg/gameday-rivals/`, including `results.json`, 72 scene images and desktop/phone reveal/debrief images. Logs are `tmp/econ-rpg/gameday-unit.log`, `gameday-browser.log` and `gameday-{housing,park,ppf,megastar}-regression.log`. These are QA output, not runtime dependencies.

### Reproduce

```powershell
node audit_tools/econ_rpg/gameday-rivals-qa.mjs --write
node --test audit_tools/econ_rpg/engine.test.mjs audit_tools/econ_rpg/scenes.test.mjs audit_tools/econ_rpg/main-attraction.test.mjs audit_tools/econ_rpg/ppf.test.mjs audit_tools/econ_rpg/megastar-mania.test.mjs audit_tools/econ_rpg/gameday-rivals.test.mjs audit_tools/econ_rpg/publication.test.mjs
# Set PLAYWRIGHT_MODULE to the installed Playwright module if it is not resolvable locally.
node audit_tools/econ_rpg/gameday-rivals.browser.test.mjs
node audit_tools/econ_rpg/browser.test.mjs
node audit_tools/econ_rpg/main-attraction.browser.test.mjs
node audit_tools/econ_rpg/ppf.browser.test.mjs
node audit_tools/econ_rpg/megastar-mania.browser.test.mjs
```

## Files and scope audit

Created: `game/preview.js`; `game/gameday-rivals-{app,engine,storage,view}.js`; `game/gameday-rivals.css`; `game/scenarios/gameday-rivals.js` and its `-market`, `-rival`, `-scenes` modules; `gameday-rivals-qa.mjs`; unit/browser test files; this report; the QA guide; `art/gameday-rivals-assets.json`. Integrated the twelve supplied asset files under private source/runtime folders.

Modified: private `game/index.html` script entry, `game/scenarios/registry.js`, README and art README; registry-count expectation in `main-attraction.test.mjs`; branching-save-key scope in `megastar-mania.test.mjs`; publication test exclusions/hash manifest coverage. No older scenario mechanics or prose changed. The publication test builds only ignored local staging and verifies that game content and supplied art are absent; it does not publish.

The final audit verifies no production/public navigation edits, no unrelated tracked changes, no save collisions, no current-choice input to the rival, intact payoff ordering and unchanged supplied image bytes. Remaining manual work is instructor playtesting and the canonical-reference comparison when that missing file is supplied.
