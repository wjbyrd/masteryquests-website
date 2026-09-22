# Gameday Rivals — implementation and QA report

Private development implementation with instructor-play patch, September 21, 2026. Preview: <http://127.0.0.1:4179/?scenario=gameday-rivals>. Start with `node audit_tools/econ_rpg/serve.mjs` from the repository root. No deployment, push, publication, public navigation addition or production source modification was performed.

## Experience and architecture

The player manages fictional Copper Cart against fictional Clover Run in Alderwick. Every home game repeats the same two independently chosen strategies. The rival's current offer is committed before the strategy buttons render, remains outside the visible/persisted unresolved state, and is revealed with the player's choice in one synchronous render. Previous completed rounds change the rival's probability; there is no branching story route, graded choice, boss or forced ending.

`game/scenarios/gameday-rivals.js` owns the title, identities, labels and six round definitions. Renaming the visible title requires changing its `title` field; the save/route ID can remain stable. Economics, rival behavior and scene metadata live in separate scenario modules. `gameday-rivals-engine.js` supplies immutable observe/reveal/advance transitions. Its controller, view, CSS and storage are separate from the four earlier RPGs. The shared changes are a registry entry and a new `preview.js` dispatch entry in the existing private HTML shell. The original RPG engine, controller, renderer, styles, storage and scenario logic remain byte-unchanged relative to HEAD `f850939`.

The command center shows market opportunity, the round scene, equally styled strategy buttons, season profits/shares and a persistent semantic history ledger. Reveals report both choices, both profits, game-day order shares and demand-weighted season shares and a short outcome explanation. Neither the payoff matrix nor formal Prisoner's Dilemma, dominant-strategy or Nash terminology appears during the six rounds. The final debrief adds those concepts, counts and the student's actual results.

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

Every round preserves **T > R > P > S**. Final stakes are largest. The profit matrix and all demand multipliers remain unchanged. Profit is the payoff; order distribution is a separate measure.

### Instructor-play patch: demand-weighted season share

The previous method started at 50/50, added/subtracted six percentage points after asymmetric rounds and clamped to 25–75%. That method could cancel equal counts of wins even when they occurred in differently sized markets. It is removed.

The centralized `ROUND_ORDER_SHARES` configuration now assigns **50/50** for S/S and A/A, **62/38** for A/S, and **38/62** for S/A. For completed round i:

- Player weighted orders = player round order-share percentage × demand multiplier.
- Rival weighted orders = rival round order-share percentage × demand multiplier.
- Player season share (%) = 100 × total player weighted orders / total weighted orders for both firms.
- Rival season share (%) = 100 − player season share.

These are relative weighted order units, not measured order counts or profit. Integer hundredths of the configured market weights keep accumulation exact; the ratio retains JavaScript numeric precision. Display rounds the player percentage to one decimal and takes its complement for the rival, so displayed shares also sum to 100%. Before any completed round, the desk displays the neutral 50/50 baseline.

Reveals separately label **Game-Day Order Share** and **Season Market Share**. The ledger shows each round’s order split and market weight so the final ratio can be reproduced. The Season Desk and debrief recompute from completed history rather than trusting a carried share cache. The old percentage-point-change language is removed, including outcome explanations that incorrectly implied symmetric rounds could not change the cumulative average.

With four symmetric rounds, a player win in the Small-Team Game and a rival win in the Biggest Rival game, the weighted player total is 344.1 and the rival total 360.9: **48.8085106383% / 51.1914893617%**, displayed **48.8% / 51.2%**. Reversing the winners reverses the shares. One high-demand win influences season share more than one low-demand win. The profit formula, rival algorithm and classification logic never consume these share values.

The independent mutual-Standard industry comparison is **$1,410,000** over six games. Asymmetric base payoffs also sum to $200,000; only mutual Aggressive lowers joint profit relative to that benchmark. The debrief states this explicitly. It explains why Aggressive is one-shot dominant, why mutual Aggressive is the one-shot Nash equilibrium, and why history changes expectations about this uncertain competitor. The finite horizon has no later home-game response after Game 6; the narrative does not claim that repetition guarantees cooperation or that restraint is a finite-game equilibrium. No communication, agreement or recommendation to coordinate occurs.

## Rival and simultaneity

`chooseRivalAction(previousHistory, roundContext, rng)` receives only completed action pairs and pre-round context, all frozen by the engine. Starting Aggressive probability is 0.22. Add 0.22 after a player Aggressive, add 0.10 for at least two player Aggressives in the last three rounds, subtract 0.12 after two consecutive player Standards. Round pressures are 0.04 / 0.08 / 0.05 / 0.10 / 0.08 / 0.12. Clamp to 0.10–0.85. No current player action, button, current payoff or DOM input reaches this module.

Mulberry32 uses a stored unsigned 32-bit seed. Round index selects one stable draw from that sequence; replay recomputes it without storing a mutable generator. Same seed and prior history yield the same action, including after refresh. Ordinary play creates the seed with `crypto.getRandomValues` and a UUID run ID. `&seed=0` through `&seed=4294967295` select reproducible QA seeds; invalid values produce a notice. No untracked `Math.random` calls occur. A QA reset deliberately reuses its URL seed; an ordinary reset creates a fresh one.

The controller locks player input and disables the old buttons before resolving. Both actions, payoffs and the new ledger row enter the DOM together. The rival commitment is checked against the pre-round run; it is not recalculated from the player's chosen action. Exhaustive tests compare Standard and Aggressive branches from every pre-round state and spy on every rival input. Browser tests invoke the same stale button twice and confirm only one payoff/history entry.

## Save, resume and replay

Serializable state includes scenario/version, run ID/time/seed, current phase/index/key/demand/multiplier, both current choices, round and cumulative firm/industry profits, shares, full action/payoff/share history, classification and completion. Unresolved choices are null. History entries include both round order-share percentages alongside actions, profits and the demand multiplier, without redundant arrays. The state marks the calculation with `marketShareVersion: 2`.

`gamedayRivalsSave_v1` is written only after a completed reveal. Loading strictly replays every saved player action against the stored seed and compares the whole resulting state. Legacy saves without `marketShareVersion` discard only old share fields and validate all remaining fields against replay before deriving corrected shares. The key and scenario version stay stable; no old share value is mixed into the new formula. A captured pre-patch save fixture verifies this migration. New-format corrupted shares are rejected by the full-state comparison. Corruption and incompatible versions fail visibly. Resume advances the last completed reveal once, restoring the next unresolved game or the final debrief without another payout. Storage denial permits in-memory play with an explicit warning. New Season uses the existing accessible confirmation dialog and removes only this game's key. Play Another Season also starts a clean run.

## Assets, activity comparison and accessibility

Six runtime WebPs and six PNG masters are supplied originals, preserved byte-for-byte. Masters moved outside the served `game/` root. The asset manifest records original/current paths, hashes, dimensions and byte counts. No image generation, pixel editing, conversion or recompression was performed. Each round maps directly to its own image; only Game 6 uses the night file. All retain 1448 × 1086 proportions and `object-fit: contain`. Missing runtime images show a filename-specific notice without fallback.

**Unresolved reference limitation:** the expected `canonical-day.webp` is absent, including in the asset folder confirmed by the user. No substitute is created. The six actual round images were inspected; comparisons against the missing canonical geometry cannot be certified yet.

The on-image activity system is removed entirely: no SVG vehicle renderer, P/R markers, road slots, rotations or overlay styles remain. The supplied raster artwork alone communicates the underlying market environment. Its caption now reads “Background activity shows the game-day market.” No image pixels changed.

After reveal, a compact normal HTML/CSS **Delivery activity** comparison appears below, outside the scene figure. Copper Cart uses orange segments; Clover Run uses green. Each row includes the firm name and Moderate (two of four segments) or High (four segments). S/S is Moderate/Moderate, A/S High/Moderate, S/A Moderate/High and A/A High/High. This presentation remains subordinate to the larger profit amounts and does not feed into payoffs or weighted order shares. No vehicle icons or image-positioned elements are generated.

Buttons are native keyboard controls with inherited visible focus, at least 48px targets and equal visual weight. Headings receive focus on transitions; a live region announces both choices/profits. The ledger uses ordered rows, headings and description lists. At 390px and 320px, reveal cards/actions stack, stats use two columns and ledger rows become cards. The matrix has its own bounded scroll container if needed. Reduced-motion mode disables transitions/animations; no timing or motion is required. Automated keyboard/layout checks supplement screenshot inspection; a human screen-reader session remains a useful instructor check.

## Exhaustive QA and classifications

Exactly **64 player sequences × 32 seeds (0–31) = 2,048 complete seasons**, comprising **12,288 reveals**. All six rounds, two actions, deterministic transitions, input isolation, payoffs, accumulation, weighted shares, legacy migration, save/replay, scenes and class reachability are asserted. All supplied assets are hash-checked.

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

### Instructor-play patch QA results

The patch reruns the complete Gameday suite and the existing unit/regression/publication checks. Exact simulation count remains **2,048 seasons / 12,288 reveals**, with all six classification counts unchanged. A SHA-256 fingerprint of every seeded rival action, round multiplier, round/season profit and classification matches pre-patch commit `07a8898`: `cc10f13c006f712e81a4a60d4f4d95c20eec7eb756fb7301d779b2e893814b38`.

New assertions cover every round split, exact market weighting, complementary/reproducible shares, profit independence, the Small-Team/Biggest-Rival wins in both directions, debrief recomputation despite stale share caches, legacy migration and rejection of corrupted historical actions/profits. Browser checks cover all 24 round/activity states at three widths, asserting that the image stage contains only its IMG, no vehicle/marker/SVG/canvas overlays exist, activity bars lie below the image, names/colors/labels match, and reveal/desk shares agree. The six runtime images still match the supplied hashes.

**Final results: 52/52 unit, regression and publication tests passed; 42 complete browser seasons passed at 1280px, 390px and 320px.** All six classifications remain reachable with unchanged counts. The 72 activity comparison captures cover all round/state/width combinations; full reveal/debrief screenshots were also captured, and desktop/phone reveals were visually reviewed. No page overflow, runtime errors, external requests or CSP violations occurred in normal play. Keyboard/reload/reset/storage-denial/missing-image tests passed, together with legacy-save reconstruction. No unresolved patch failure remains.

Evidence is under ignored `tmp/econ-rpg/gameday-rivals/` (activity screenshots, reveal/debrief screenshots and results.json). Patch logs are `tmp/econ-rpg/gameday-patch-unit.log` and `gameday-patch-browser.log`. Earlier implementation evidence included 152 older-game browser runs; those historical runs are not counted as rerun for this narrow patch. The four prior scenario path fingerprints and protected-file diff were checked again. Artwork, rival source, round configuration and older scenario files have no diff; the frozen economic fingerprint confirms all payoff and classification paths are unchanged.

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

## Instructor-play patch diff audit

Only Gameday activity rendering/styles/scene metadata, order-share calculation and related state/persistence, share labels/announcements, tests and these QA documents changed. Added a captured legacy-save fixture. Scenario configuration, rival source, profit matrix/function, multipliers, round order and classification thresholds are unchanged. All twelve supplied image hashes still match. No older RPG, public navigation or production source changed. No deployment or push.

## September 22 instructor-play layout pass

The desktop/tablet scene figure is now centered and capped at **520px**, using the complete 4:3 image with automatic height and `object-fit: contain`. At 1280px the image is about 518 × 389px, down from roughly 858 × 644px. Phone widths through 540px retain the prior wide image frame rather than shrinking the scene further. The environment stays near the top while activity and profit reveals move substantially higher on the page. No raster or image-selection changes were made.

The Season Desk uses normal grid flow at every width. Its former sticky positioning could move the rail through the full-width history row because both belonged to the same grid container. Removing stickiness keeps the desk in its own row; the history starts below both columns. The existing one-column breakpoint at 900px remains. Desk padding and metric gaps are tightened, while values keep their readable sizes.

The desk now contains only the four priority metrics, game-day progress and **How to read these numbers**. That explanation uses native `details`/`summary`, default collapsed, with its state triangle, keyboard activation and existing visible focus styling. Opening it retains both profit and demand-weighted-share explanations. No new redundant labels were added. The repeated Copper Cart/Clover Run identity lines were removed from the desk; firm identities remain in the activity comparison and reveal cards. The only additional copy trim removes the intro sentence “Profit and market share tell different parts of the story,” whose interpretation now lives in the desk disclosure. Reveals, history guidance and the economics debrief are otherwise retained.

The compact orange/green activity comparison is preserved without changing its renderer, four outcome mappings or labels. It remains outside the image and aligned with the reveal area. No decorative vehicles or image overlays were reintroduced.

### Final-round rival inspection

**No rival-algorithm change is needed or made.** Game 6 contributes 0.12 to aggression probability, versus Game 5's 0.08. Holding previous history fixed, that is a 4 percentage-point increase over the prior pressure and a 12-point increase over zero final pressure. With two preceding Standard player actions, the final probability is **22%**, compared with **10%** without final pressure or **18%** using Game 5 pressure. Restraint still matters: final aggression is neither forced nor necessarily more probable than the 26% opening offer.

In the established seeds 0–31, **seeds 20 and 25** with player `SSSSSS` produce rival `SSSSSA`. Seed 20's final draw is **0.1917954453**, below the final 0.22 threshold but above the no-pressure 0.10 threshold. The rival receives **$232,500** for that asymmetric final result: the unchanged $155,000 temptation payoff times the largest demand multiplier, 1.50. This explains how the observed late aggressive move can produce the season's largest individual payout.

Across the same **2,048** fixed seasons, Game 6 rival Aggressive appears **1,208** times. Re-evaluating the same pre-round histories and draws with only final pressure set to zero gives **928**, a difference of **280**. This controlled comparison demonstrates a material pressure effect; these repeated-seed coverage cases are not independent random trials or a population estimate.

The rival still receives only completed action pairs, round key/index/pressure and its seeded draw. The controller commits before presenting current strategy buttons; exhaustive tests still compare the current Standard/Aggressive alternatives and confirm an identical rival commitment. There is no input from the current player choice or payoff. The added regression fixes the seed-20 witness and the pressure comparison counts, without changing any economic behavior.

### Layout validation and scope

The complete 2,048-season Gameday audit and all unit/regression/publication checks were rerun. Browser coverage retains 42 complete seasons across desktop and phone widths, with all 24 round/activity combinations. Additional layout fixtures cover **1440, 1280, 1024, 920, 900, 768, 540, 390 and 320px** in intro, reveal and debrief. For collapsed and expanded help, geometry checks inspect the top, middle, history boundary and bottom of the page, confirming containment and column/row gaps. Enter and Space toggle the native disclosure; the explanation remains accessible and the repeated desk identities are absent.

**Final September 22 results: 53/53 unit, regression and publication tests passed; all 42 complete browser seasons and all nine-width layout checks passed.** There are 27 intro/reveal/debrief layout fixtures, each checked with help closed, open and closed again at four scroll positions. No desk/history overlap, panel overflow, page overflow, runtime error, external request or CSP violation was found. Desktop, tablet and phone screenshots confirm cleaner framing and contained expanded help. The four older scenario path fingerprints, all six Gameday classifications, exact payoff fingerprint and supplied artwork hashes still pass. No unresolved layout or gameplay failure remains.

Logs: `tmp/econ-rpg/gameday-layout-unit.log` and `gameday-layout-browser.log`; screenshots: `tmp/econ-rpg/gameday-rivals/layout-*-collapsed.png` and `layout-*-expanded.png`. All seven protected source-file hashes match the start of this layout task, and `git diff --check` passes.

This pass changes only Gameday presentation/CSS, QA assertions and the two QA documents plus their generator. The earlier weighted-share patch was already present in the working tree and is preserved. Before/after file hashes protect that existing engine, storage, app, market module, rival module, configuration and scene metadata. No payoff, multiplier, round order, market-share method, reveal flow, debrief logic or classification threshold changed. No older scenario, production/public file or artwork changed. No deployment or push.

## Active-round UI density pass — September 22

This pass supersedes the centered desktop image composition described above. At widths **1200px and above**, the round body is a **54% image / 46% decision-or-reveal grid**, below the unchanged round title and Market Opportunity line. The image and compact caption occupy the left column; context, instruction and vertically stacked promotion buttons occupy the right. After selection, that same right column contains the existing activity bars, both strategy/profit/share cards, consequence text and continuation button. No additional block is appended below the image and no overlay is drawn on the art.

The active screen uses more available horizontal space: a flexible command panel with a 240px Season Desk rail, within a maximum 1560px page. Masthead/hero spacing, command padding, heading margins, caption padding, control gaps and reveal spacing are tightened only while a round is active. The illustration scales with its column, remaining complete and uncropped; measured image widths range from about 447px at the desktop breakpoint to 642px on wide desktop. This avoids making the scene tiny or centering it in an otherwise empty wide card.

History follows the command/desk grid row with a 16px gap. Its active-screen heading and entry padding are compacted, without an accordion or hidden entries. The desk remains non-sticky and lean, with its existing four metrics, progress and default-collapsed help. No identity labels, extra explanations or round data were added to it.

Below **1200px**, the active screen stacks image, context/strategy or reveal, Season Desk, then Season History. The tablet image remains capped at 520px and phone framing stays wide. Controls retain at least 48px touch targets. Narrow layouts deliberately allow vertical scrolling instead of squeezing three columns onto a tablet.

The only copy change is the interface instruction: “The rival’s offer is locked. Choose yours to reveal both.” Scenario context, outcomes and final instructional content are not rewritten. All compact CSS is scoped to the active-round body class; entering the final debrief removes that class. The debrief function has the same normalized SHA-256 fingerprint as before, and its 1280px full-page screenshot is byte-identical to the pre-pass capture. The final summary retains its original spacious layout.

### Measured desktop density

Measurements below are document coordinates from the top of the page for the first Aggressive/Standard reveal (seed 0), not positions after automatic scrolling. Both choices are wholly visible in the corresponding observation screen.

| Viewport | Bottom of second choice | Bottom of continuation | Bottom of history heading | First history entry begins |
|---|---:|---:|---:|---:|
| 1920 × 1080 | 513px | 650px | 827px | 839px |
| 1440 × 900 | 513px | 650px | 778px | 790px |
| 1366 × 768 | 513px | 650px | 748px | 760px |
| 1280 × 800 | 535px | 670px | 744px | 756px |
| 1200 × 768 | 535px | 691px | 765px | 777px |

At 1366 × 768, the full history heading is visible and the first entry reaches the lower edge; taller desktop viewports show more of the entry. At 1280px the prior centered reveal placed history around 1400px down the page; the new heading is fully visible by about 744px. The full ledger remains available by normal scrolling.

### Density QA and scope

The established 2,048-season economic audit is retained. Browser coverage includes the existing 42 complete seasons and 16 additional complete density seasons: all-Standard (seed 1) and all-Aggressive (seed 0) at **1920×1080, 1440×900, 1366×768, 1280×800, 1200×768, 1024×768, 768×1024 and 390×844**. Desktop assertions check both actions, continuation and the history heading at scroll position zero for every round; they also check the 54/46 split, reuse of the right-side region and image-first stacking below the breakpoint. Existing nine-width disclosure and scroll-boundary containment checks remain in place.

**Final density-pass results: 54/54 automated unit/regression/publication tests passed, including all 2,048 simulated seasons; 58 complete browser seasons passed.** All desktop density assertions and the nine-width disclosure/scroll-boundary checks pass. No horizontal page overflow, desk/history collision, runtime error, external request or CSP violation was detected. Laptop, wide-desktop and narrow-screen captures were visually inspected. The first density run exposed a clipped history heading on the 1200×768 asymmetric reveal; the adjacent activity and header spacing was tightened and the full browser suite rerun successfully. No economic explanation was shortened to fix it.

The completed debrief screenshot still matches the pre-pass PNG byte-for-byte (`d6e1dd80e6a7e710a2f8336e51538c3ae20fe99624525285af59e63f9e2d0ac3`). The debrief source fingerprint, seven protected gameplay/configuration file hashes, prior scenario path fingerprints and all twelve supplied art hashes remain unchanged. `git diff --check` passes.

Evidence: `tmp/econ-rpg/gameday-density-unit.log`, `gameday-density-browser.log`, `gameday-rivals/results.json` and `gameday-rivals/density-*-observe.png` / `density-*-reveal.png`. The report and manual QA notes are updated for the composition change.

The runtime diff is limited to `gameday-rivals-view.js` and scoped additions to `gameday-rivals.css`. Economics, payoff logic, multipliers, rival decisions, order-share calculations, classifications, state transitions, persistence, scene selection and supplied image bytes remain unchanged. The final debrief content/function is unchanged. No production/public files or other scenarios changed; nothing was deployed or pushed.
