# Instructional follow-up audit

Audited 2026-09-22. Private preview only; no deployment or push.

## Inventory and decision

Inspected the private library, scenario registry, both standalone game folders, shared RPG ending renderer, Gameday season debrief, and public game collection entry points. Seven games fit this audit. The Economic Realm, Managerial Intelligence Directorate, Macro Command System and Micro Domains are adaptive question-bank collections; their classroom/faculty variants are also excluded. Econ-nections is a grouping puzzle, not an economic simulation. No public game was changed.

The table records the **pre-change** findings. A read-only counterfactual is useful explanation, but does not demonstrate that the learner can apply the idea.

| Game | Type | What happened? | Why economically? | Transfer? | Action |
|---|---|---|---|---|---|
| Room to Stay | Branching housing-policy RPG | PASS | PASS | GAP | MINOR |
| The Main Attraction | Branching market-power RPG | PASS | PASS | GAP | MINOR |
| The Economy’s Edge | Branching production simulation | PASS | PASS | GAP | MINOR |
| Megastar Mania | Branching ticket-market RPG | PASS | PASS | GAP | MINOR |
| Gameday Rivals | Repeated-strategy simulation | PASS | PASS | GAP | MINOR |
| Takeout Taco: Lunch Rush | Production simulation | PASS | PASS | PASS | NONE |
| GDP LIVE | Accounting/classification simulation | PASS | PASS | PASS | NONE |

No game had a major explanation gap. In particular, Economy’s Edge already explicitly explains all eight requested mechanisms in its path consequences and four debrief sections. It needed model interpretation and answered transfer, not a replacement debrief. All five modified games now provide an application sequence with explanatory correction feedback and an explicit completion state. Existing endings, path recaps and classroom stopping points remain available.

## Per-game evidence and changes

### Room to Stay

**Current follow-up inspected:** actual six-choice path, state changes, mechanisms and consequence/tradeoff disclosures; efficiency/quantity, distribution/affordability, and fiscal-cost/timing debrief; three path-selected alternative decisions. The path covers binding ceilings, rationing, repair incentives, subsidies, additionality, constraints, delayed construction and budget opportunity cost. No answered transfer task existed.

**Change:** appended “Advise the next city,” linked to the actual opening choice and its mechanism. Two applications: predict newcomer access when an already binding ceiling is lowered; calculate additional construction when 50 units are supported but 30 would have been built anyway, distinguishing them from repairs to 80 occupied units. Correct additional supply is 20. Distractor feedback separates low posted rent from obtaining a lease, allocation from extra supply, and spending from additionality. No graph or debrief rewrite.

### The Main Attraction

**Current follow-up inspected:** actual path and indicators, explicit MR below price under uniform pricing, elasticity, segmentation/resale, congestion, repairs versus investment, sunk versus marginal cost, substitutes and entry barriers. Existing alternatives were read-only.

**Change:** appended “Try the next attraction,” linked to the final choice and its mechanism. Two applications: evaluate a uniform price cut from 100 tickets at $50 to 110 at $48 with $350 extra cost; diagnose freely resalable student discounts in a new museum. Revenue rises $280, average incremental revenue is $28 per extra guest, and profit falls $70. Feedback explains the lost revenue on existing sales and the need to separate customer groups. No monopoly graph or changes to gameplay.

### The Economy’s Edge

**Current follow-up inspected:** actual production path and ordinal state changes; scarcity, increasing opportunity cost, consumer/capital allocation, productive efficiency, idle resources, recovery, delayed investment and outward capacity shifts already explicit. Missing a learner-operated formal-model bridge.

**Change:** appended “Read the frontier,” with one responsive PPF SVG. It connects the actual disruption and final allocation to an illustrative position: B inside the original frontier for remaining slack; A on the original frontier for full recovery without expansion; C on the larger frontier only for realized expansion. The dashed frontier is explicitly hypothetical for runs that did not reach it. Three applications distinguish recovery B→A, completed productivity gains/outward shift, and forgone consumer goods when reallocating fully employed resources to capital goods.

**Graph notes:** consumer goods horizontally, capital goods vertically; original and expanded frontiers differ by solid/dashed strokes, not color alone. Visible caption and A/B/C interpretation table provide a text equivalent; SVG title/description support assistive technology. Positions are schematic relationships, not game-indicator coordinates or quantities. No claim that a balanced mix is inherently best, or that planned investment immediately increases capacity.

### Megastar Mania

**Current follow-up inspected:** path-specific consequences, derived ticket-market display, ending, actual choices and state changes; shortage/surplus and price pressure, receipts versus resale proceeds, capacity changes and demand shifts already explained. No graph interpretation or answered transfer.

**Change:** appended “Here is what economists draw,” referencing the actual final choice/mechanism and final market result. One responsive diagram shows fixed remaining capacity S, downward-sloping D and the retained posted-price line. Qd/Qs ordering comes directly from `ticketMarket(run)`, including both price decisions; it never compares raw fan interest with supply. Two applications interpret the run’s shortage/balance/surplus and resulting price pressure, then distinguish another artist’s hit-driven demand shift from a price movement or additional capacity. Feedback explains why stronger interest cannot raise fixed-price sales beyond capacity.

**Graph notes:** this is short-run remaining ticket capacity, so S is vertical. The curve shapes and distances are schematic, without dollar or ticket-count scales inferred from ordinal indicators. A visible description and expanded label key accompany the accessible SVG. Only one graph appears per ending; no extra stage diagrams or changes to existing art.

### Gameday Rivals

**Current follow-up inspected:** actual profits and weighted shares, actual action-pair counts, base payoff matrix, T>R>P>S, individual/joint incentives, one-shot dominance/Nash equilibrium, uncertain history-dependent rival, final-round pressure and the fixed-demand all-Standard benchmark. This was strong explanation but no answered counterfactual.

**Change:** appended “A different promotion game” after the existing debrief and before replay. Actual player aggression count connects the season to a new, clearly hypothetical payoff matrix: Standard/Standard $120/$120; Aggressive/Standard $140/$50; Standard/Aggressive $50/$140; Aggressive/Aggressive $40/$40. One task asks for the best response to each rival offer. Correct: Aggressive against Standard, Standard against Aggressive; neither dominates. Feedback explains why mutual Aggressive is no longer Nash when matching costs change. No recommendation to coordinate and no claim of a unique repeated-game equilibrium.

The existing `debrief` function retains its frozen source hash. The new matrix is teaching content only: actual payoffs, rival behavior, shares, classifications, imagery and active-round layout are unchanged.

### Takeout Taco: Lunch Rush — unchanged

**Current follow-up inspected:** observed production record; 3–6 evidence-dependent Production Review tasks with explanations and marginal-product calculations; total- and marginal-product graph interpretation; observed/revealed distinction and accessible graph tables; fixed-input synthesis; two-truck allocation retries; two final capacity/diminishing-returns questions.

This already connects the learner’s record to mechanisms and requires application beyond the original truck. The same six workers can be allocated across two trucks: 3+3 produces 62 tacos versus 53 on one truck, followed by explanation of the changed capital constraint. No runtime, content, imagery or telemetry files changed.

### GDP LIVE — unchanged

**Current follow-up inspected:** seeded transactions with actual component postings and receipts; correction feedback on exclusions, investment and imports; identity synthesis; a separate draft-ledger error identification/repair task; combined GDP-change calculation; actual final ledger and performance review.

This already requires correction and synthesis: the final simultaneous changes imply +$20B, with import offsets and signed investment changes accounted for. Errors permit revision without prematurely applying incorrect postings. No additional units or questions were needed. No runtime, content, imagery or telemetry files changed.

## State, accessibility and classroom use

- New questions appear only after the existing RPG ending or Gameday season debrief. Existing teaching text and read-only alternatives remain intact.
- Each task requires a correct answer to advance; every wrong option has misconception-specific feedback and permits correction. There is no numerical grade or score added to an ending. Replay and Return to Games remain available for classroom stopping points.
- Practice is local to the mounted ending view. Replay/restart discards it. Reload/resume reconstructs the saved economic outcome and starts practice afresh; answers are not advertised as saved. No changes to game save schemas, balances, histories, classifications or market logic.
- The modified games have no active anonymous event recorder (RPG transitions have a no-op integration seam). No telemetry infrastructure, identity collection, network events or storage keys were added. Taco/GDP telemetry remains untouched.
- Native buttons, visible selected text, 48px minimum targets, live textual feedback, labelled choice groups and focused task/completion headings support keyboard use. Graphs have text equivalents, and new styling is scoped to the follow-up section. No animation is introduced.

## Files

Created:

- `game/instructional-followup.js` — pure scenario-specific applications and answer feedback.
- `game/instructional-followup-view.js` — end-only rendering, diagrams, tables and session practice state.
- `game/instructional-followup.css` — scoped responsive presentation.
- `instructional-followup.test.mjs` — exhaustive model/path/answer and unchanged-file checks.
- `instructional-followup.browser.test.mjs` — ending/model variants, correction flow, reflow, reload/reset/navigation.
- `INSTRUCTIONAL-FOLLOWUP-AUDIT.md` — this report.

Modified:

- `game/ui.js` — append applications after existing RPG alternatives.
- `game/gameday-rivals-view.js` — append application after the preserved season debrief.
- `gameday-rivals.test.mjs` — permit the authorized shared UI append; preserve all engine/data/style and frozen-path checks.
- `mini-game-library.browser.test.mjs` — complete new tasks through keyboard-only wrong-answer/correction flows in existing full runs.
- `README.md` — link this audit.

## Verification

The combined unit/regression suite passes **76 tests**. It includes all 200 housing paths, 665 attraction paths, 361 PPF paths and 729 Megastar paths (1,955 total); all 2,048 seeded Gameday seasons; all new answer branches; unchanged frozen RPG histories/endings and Gameday behavior/debrief hash. PPF A/B/C mapping and all three derived ticket-market states are checked exhaustively. Independent arithmetic checks cover both new calculations and changed best responses.

Existing Taco coverage includes 9,020 legal prefixes, 5,791 cap-complete paths and graph/two-truck branches. GDP includes all scenario/account combinations, all audits and 1,000 complete seeded runs. The publication check performs a local build and confirms private-file exclusion. Git diff checks confirm PASS games, scenario economics, saves and public surfaces are unchanged.

Browser suites:

- `mini-game-library.browser.test.mjs`: all seven games from their Games cards, completed with Tab/Enter/Space, replay and return, at desktop and real Chrome 200% zoom (14 complete runs). New tasks exercise every wrong option and correction. Existing checks cover contrast, focus, native dialogs, target sizes, tables, image alternatives, 1366/900/390/320px reflow and reduced motion.
- `instructional-followup.browser.test.mjs`: 37 representative ending/model variants at 1280px and 320px, plus one per modified game at 768px and 390px (84 checks). Verifies correct end-only content, all wrong/correct feedback, advance guards, original debrief retention, immutable saves, fresh practice on reload, restart and Return to Games. No console/page/HTTP errors. Screenshots in ignored `tmp/econ-rpg/instructional-followup/`; library results in ignored `tmp/econ-rpg/library-accessibility/`.

Run with the existing external Playwright module path as needed:

```powershell
node --test audit_tools/econ_rpg/instructional-followup.test.mjs audit_tools/econ_rpg/engine.test.mjs audit_tools/econ_rpg/scenes.test.mjs audit_tools/econ_rpg/main-attraction.test.mjs audit_tools/econ_rpg/ppf.test.mjs audit_tools/econ_rpg/megastar-mania.test.mjs audit_tools/econ_rpg/gameday-rivals.test.mjs audit_tools/econ_rpg/takeout-taco.test.mjs audit_tools/econ_rpg/gdp-live.test.mjs audit_tools/econ_rpg/publication.test.mjs
node audit_tools/econ_rpg/instructional-followup.browser.test.mjs
node audit_tools/econ_rpg/mini-game-library.browser.test.mjs
```

## Instructor judgment and limits

The new economics are mechanically checked, but instructors should decide whether schematic PPF positions and fixed-window vertical ticket supply are the right formalization level for their course. They are explicitly illustrative, not estimated economic relationships. Housing additionality assumes the stated no-program construction baseline; the museum and new delivery payoff matrix are hypothetical transfer cases, not new game rules.

Actual screen-reader speech and physical-device checks remain useful; automated semantics, keyboard/zoom/reflow and contrast checks are not a claim of full accessibility certification. No further content addition is required to close the identified transfer gaps.
