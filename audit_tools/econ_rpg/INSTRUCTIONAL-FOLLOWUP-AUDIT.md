# Instructional follow-up audit

Initial library audit: 2026-09-22. Targeted instructional-design revision: 2026-09-23. Private preview only; no deployment or push.

## Inventory and current closure

Seven private games fit the RPG, economic-simulation or accounting categories. Public adaptive collections (Economic Realm, Managerial Intelligence Directorate, Macro Command System and Micro Domains), their classroom/faculty variants, and the Econ-nections grouping puzzle remain outside this audit.

| Game | Current type | What happened? | Why economically? | Transfer? | Latest action |
|---|---|---|---|---|---|
| Room to Stay | Branching price-ceiling / housing-market simulation | PASS | PASS | PASS | Recenter scenario; formal ceiling model; numeric variants |
| The Main Attraction | Branching market-power RPG | PASS | PASS | PASS | Numeric follow-up variants only |
| The Economy’s Edge | Branching production simulation | PASS | PASS | PASS | Content unchanged; shared resolved-answer fix |
| Megastar Mania | Branching ticket-market RPG | PASS | PASS | PASS | Content unchanged; shared resolved-answer fix |
| Gameday Rivals | Repeated-strategy simulation | PASS | PASS | PASS | Content unchanged; shared resolved-answer fix |
| Takeout Taco: Lunch Rush | Production simulation | PASS | PASS | PASS | NONE |
| GDP LIVE | Accounting/classification simulation | PASS | PASS | PASS | NONE |

The initial audit identified five minor transfer gaps, no major explanation gaps, and two PASS games requiring no work. This revision addresses the subsequent conceptual-identity and replayability review. It does not replace the shared RPG engine or impose one ending template on every game.

## Room to Stay: from choosing a policy to managing its consequences

### Old and new conceptual structure

Previously the opening offered a rent ceiling, rental assistance or emergency grants. Two routes could avoid a ceiling entirely. The new version begins after political pressure over rising rents has led Linden to impose a **binding ceiling below equilibrium**, including future rental projects. Lower covered rents benefit incumbents; more units are sought and fewer offered at the controlled price. The housing advisor inherits that condition rather than voting on it.

The opening, library card and debrief now identify a price-ceiling simulation. The six-decision arc retains seven authored nodes and branching:

| Decision | Preserved material / targeted revision |
|---|---|
| 1. Vacancy allocation | Lottery and new-lease exemption moved to the opening. Lottery changes allocation, not the shortage. Exempt leases can charge market rents; existing covered tenants retain protection. |
| 2. Maintenance | Inspections, conditional repair grants and phased requirements retained. Controlled revenue limits recovery of repair costs; some owners defer work or withdraw marginal units. Grants improve existing homes without adding apartments. |
| 3. Future supply | Permitting reform, co-funded mixed-rent construction and retaining development limits retained. Added a new-construction exemption when new leases are still controlled. Expected returns improve before homes arrive. |
| 4. Incumbents/newcomers | Distinct controlled-new-lease and exempt-new-lease branches. Choose stronger incumbent renewal security (less turnover) or application/relocation help for newcomers (public cost, no invented units). |
| 5. Mitigation | Targeted rental assistance, temporary eviction grants and tapering now sit on top of the ceiling. Assistance does not create vacancies; exempt rents may absorb purchasing power. |
| 6. Two-year review | Access versus current-renter stability retained. Earlier supply policies deliver with a lag. New-construction exemptions now have their own delayed outcome; reform responds less strongly when new units remain controlled. |

No route repeals the ceiling on existing covered leases. New-lease exemptions therefore do not erase the premise. Both benefits and costs remain explicit: lower rents/security for covered tenants, rationing/access for outsiders, maintenance and construction incentives, and fiscal costs of mitigation. No policy is scored as universally best.

### Initialization and saved runs

| Indicator | Former pre-policy baseline | New inherited-ceiling start | Reason |
|---|---:|---:|---|
| Renter affordability | 2 | 5 | First-order payment relief for covered incumbents |
| Housing availability | 3 | 2 | More applicants and fewer units offered at the controlled price |
| Housing quality | 5 | 5 | Future maintenance pressure is not instant physical damage |
| Budget room | 7 | 7 | Enacting the ceiling is not itself the assistance expenditure |
| Construction incentive | 3 | 2 | Lower expected controlled returns weaken incentives |

These are bounded 0–8 ordinal teaching indicators, not estimated effects. The original model disclaimer remains; the opening also states the ordinal limitation. Comments and tests document the initialization. Quality pressure is explained before the maintenance decision; nuanced “some owners” language avoids claiming universal neglect.

Room to Stay is now **scenario version 2**. Current saves resume exactly at every phase. Version-1 saves receive the existing version-mismatch notice and a fresh-start option; they are not silently translated into different decisions or outcomes. The shared save format, storage key and engine are unchanged. Other games’ saves remain isolated.

### Endings and representative paths

All five ending IDs, titles and precedence rules remain. Three summaries now explicitly connect the result to the inherited ceiling; existing shortage and protected-tenant summaries already made that connection. Counts changed because the decision arc changed:

| Ending | Revised paths | Representative choices |
|---|---:|---|
| Relief with a funding gap | 75 | registry → inspect → reform → stability → renew → protect |
| A lease worth holding onto | 33 | registry → phase → reform → stability → renew → access |
| More homes, a difficult transition | 8 | exempt → inspect → reform → search → taper → access |
| Stability for some, a wait for others | 88 | registry → inspect → reform → stability → renew → access |
| Room to move, work still ahead | 48 | registry → inspect → reform → search → taper → access |

**252 legal paths**, six decisions each, seven nodes and 18 node/choice pairs. The regenerated [QA guide](QA-PATHS.md) contains 18 routes covering every choice, reachable consequence variant and ending. No unreachable ending/node, cycle or dead end remains. All five supplied neighborhood images are reused unchanged. Opening art now shows vacancy pressure; the new construction-exemption route uses the existing construction/completed-homes rules.

### Formal bridge and applications

“Read the rent ceiling” follows the experiential ending, actual path recap, consequences, economics and alternatives. Its introduction cites the player’s actual allocation and maintenance choices. One responsive SVG shows upward-sloping supply and downward-sloping demand; Pe/Qe equilibrium; Pc below Pe; Qs < Qe < Qd; and a labelled bracket for **shortage = Qd − Qs**. The graphic has axis labels, SVG title/description and a visible text equivalent. Line patterns, labels and the bracket make meaning independent of color.

The graph explicitly represents the **initial controlled market**, not estimated Linden quantities or the final market after exemptions and mitigation. No fake empirical numbers are supplied.

Three short applications complete the sequence:

1. Read the diagram: another city uses a transparent lottery at unchanged Pc and curves. The shortage remains Qd − Qs; allocation changes.
2. Transfer: lowering an already binding ceiling with upward-sloping supply widens the shortage; low advertised rent does not guarantee access.
3. Additionality: distinguish repaired occupied units from new supply and subtract construction that would have occurred anyway. Four numeric variants replace the fixed example.

Incorrect options explain the relevant misconception and permit correction. The existing outcome remains a classroom stopping point; replay and Return to Games stay available.

## Replayability: small numeric pools

Only surface values in two numeric templates vary. Qualitative questions, RPG choices, payoffs, transitions and ending rules are not randomized.

### The Main Attraction

The park’s gameplay and debrief are unchanged. Its resale/segmentation application is unchanged. The incremental-profit question has four variants:

| Variant | Before Q @ P | After Q @ P | Extra cost | Lost revenue on existing sales | Revenue on extra sales | ΔTR | ΔProfit |
|---|---|---|---:|---:|---:|---:|---:|
| A | 100 @ $50 | 110 @ $48 | $350 | $200 | $480 | $280 | −$70 |
| B | 120 @ $45 | 135 @ $43 | $300 | $240 | $645 | $405 | +$105 |
| C | 80 @ $60 | 92 @ $57 | $444 | $240 | $684 | $444 | $0 |
| D | 150 @ $40 | 175 @ $38 | $500 | $300 | $950 | $650 | +$150 |

All before/after revenues, losses on existing sales, additional-ticket revenue, net revenue change, extra cost and profit effects are computed from the selected data. The correct option and explanation are generated from the result, including unchanged profit in C. Average incremental revenue is respectively $28, $27, $37 and $26 per extra guest—below each new ticket price because existing sales also receive the price cut.

Distractors model two distinct errors: ignore the discount on existing sales; or confuse revenue change with profit change. Option order varies deterministically across pool entries. This prevents learning a fixed answer position or an always-negative profit sign. Arithmetic is integral, with no rounding ambiguity.

### Room to Stay

| Variant | Occupied units repaired | Supported new units | Would have been built anyway | Additional units |
|---|---:|---:|---:|---:|
| A | 80 | 50 | 30 | 20 |
| B | 90 | 60 | 25 | 35 |
| C | 65 | 45 | 20 | 25 |
| D | 100 | 70 | 50 | 20 |

Correct answers are calculated as supported minus baseline. Distractors count all supported units or incorrectly add repairs to new construction. Prompt, options, explanation and feedback derive from the same selected values. Repairs remain explicitly separate from new supply.

### Selection and reset

`instructional-variants.js` hashes the existing randomly generated run UUID with a template salt to select one of four variants. A new run can draw a new variant; consecutive repeats remain possible. Resume/reload of the same saved outcome keeps its variant, so a task does not change mid-attempt. Selection never reads economic indicators, choices or the ending, and never mutates a saved run.

An internal index override permits exact unit testing. Browser QA supplies controlled run IDs to cover every entry without exposing QA controls to players. No question bank, new storage schema, random gameplay branch, identity field or telemetry infrastructure was introduced. Practice answer state remains view-local and clears on replay/reset; reloading restarts practice with the same surface values.

## Shared renderer and games preserved

Resolved choices now use native `disabled`, replacing the previous aria-only interaction guard. Selected text and `aria-pressed` remain visible. Focus moves to the explanatory feedback, and Tab reaches Next/Finish directly rather than revisiting resolved answers. Feedback remains semantic, visible and accessible; incorrect answers stay interactive. Button targets remain at least 44px, with visible keyboard focus and no new animation.

Economy’s Edge retains its PPF diagram and three existing tasks; Megastar retains its price-sensitive diagram and two tasks; Gameday retains its counterfactual payoff matrix/task. These games receive only the necessary shared resolved-answer behavior. Their authored content, engines, scenarios, artwork and state logic are unchanged. Gameday’s original debrief function still matches its frozen hash.

Takeout Taco and GDP LIVE remain entirely untouched. Taco already links observed production to marginal-product calculations, graphs and a two-truck transfer. GDP already requires component posting, error correction, a separate ledger audit and combined-change calculation. Their runtime files and telemetry are byte-unchanged.

## Files in this revision

All paths below are relative to `audit_tools/econ_rpg/`.

Created:

- `game/instructional-variants.js` — four validated entries per numeric template, run-ID selection and dynamic questions/calculations.

Modified runtime/presentation:

- `game/scenarios/housing-crisis.js` — v2 inherited-ceiling premise, six-stage arc, initialization, distribution branches, new-construction exemption, mitigation and debrief.
- `game/scenarios/housing-scenes.js` — initial pressure image and new exemption pipeline; asset bytes unchanged.
- `game/games/index.html` — Room to Stay description only.
- `game/instructional-followup.js` — housing graph and three tasks; housing/park numeric factories.
- `game/instructional-followup-view.js` — ceiling SVG and native resolved-answer/focus behavior.
- `game/instructional-followup.css` — resolved cursor rule now targets native disabled buttons.

Modified QA/documentation:

- `engine.test.mjs`, `scenes.test.mjs`, `browser.test.mjs` — revised housing premise, all paths, economic invariants, scenes, versions and browser fixtures.
- `instructional-followup.test.mjs`, `instructional-followup.browser.test.mjs`, `mini-game-library.browser.test.mjs` — every numeric variant, dynamic answers, graph geometry, disabled/focus flow, reset and keyboard/zoom checks.
- `main-attraction.test.mjs`, `ppf.test.mjs`, `megastar-mania.test.mjs`, `gameday-rivals.test.mjs` — replace the obsolete housing-v1 fingerprint/blanket no-change guard with the reviewed v2 reference; retain other games’ frozen checks.
- `main-attraction.browser.test.mjs`, `ppf.browser.test.mjs`, `megastar-mania.browser.test.mjs` — their cross-game save-isolation fixture uses the new housing opening choice.
- `qa.mjs`, `QA-PATHS.md`, `README.md`, `INSTRUCTIONAL-FOLLOWUP-AUDIT.md` — current arc, counts, saved-version behavior and audit evidence.

Shared `engine.js`, `storage.js`, `rpg.js`, `ui.js`, scene renderer and existing RPG/Gameday styles were not edited. Public game/navigation/build configuration files were not edited.

## Verification

**79 unit/regression tests passed.** Housing checks enumerate all 252 paths and replay every saved phase; verify initial state/premise, no enact-or-avoid opening, rationing, repair-only effects, distribution branches, all five endings, delayed construction and exemption interactions. New tests independently recompute all eight numeric variants, answer positions, distinct options, explanations, integer incremental revenue and stable run-based selection. Every wrong answer supplies substantive feedback; no NaN/undefined values occur.

Unchanged regression coverage includes 665 park paths, 361 PPF paths, 729 Megastar paths, all 2,048 seeded Gameday seasons, Taco production/graph/two-truck branches and 1,000 seeded complete GDP runs. Prior non-housing gameplay fingerprints remain unchanged. A local publication build confirms private-file exclusion; it does not deploy.

Browser QA:

- Housing browser suite: nine opening/ending combinations plus one extra art-coverage route at 1280, 390 and 320px (30 complete runs), plus two subsidy runs. Checks all five art states, consequences, saved phases, replay, version mismatch, blocked storage, keyboard help, responsive layout and no external requests/CSP/console/page errors.
- Instructional follow-up suite: 45 ending/model/explicit-numeric fixtures at both 1280 and 320px, plus five-game spot checks at 768 and 390px (100 checks). All four housing and four park variants are individually exercised with keyboard-only application controls, every wrong option and correction. Tests check Pc below Pe, Qs < Qe < Qd, semantic graph text, option/feedback reflow, touch targets, native disabling, explanation focus, next-control focus, same variant on resume, reset and return navigation.
- Seven-game library suite: 14 complete keyboard-only runs, including real Chrome 200% zoom, reduced motion, replay and return. Contrast, target sizes, tables, focus and native restart dialogs pass. The other games’ existing follow-ups still complete through the shared renderer fix.
- Dedicated Main Attraction, PPF and Megastar browser regressions: 27, 33 and 51 complete coverage runs respectively across 1280/390/320px, plus save-isolation, ending review, replay, version-mismatch and blocked-storage checks. Existing scenes and endings still render correctly with no external requests, CSP violations or runtime errors.

Screenshots/results are ignored under `tmp/econ-rpg/`, including `instructional-followup/` and `library-accessibility/`. Numeric question and resolved-feedback screenshots cover each pool entry on desktop and narrow mobile. No console/page errors occurred in the completed browser runs.

Reproduce with the existing external Playwright module configuration:

```powershell
node --test audit_tools/econ_rpg/instructional-followup.test.mjs audit_tools/econ_rpg/engine.test.mjs audit_tools/econ_rpg/scenes.test.mjs audit_tools/econ_rpg/main-attraction.test.mjs audit_tools/econ_rpg/ppf.test.mjs audit_tools/econ_rpg/megastar-mania.test.mjs audit_tools/econ_rpg/gameday-rivals.test.mjs audit_tools/econ_rpg/takeout-taco.test.mjs audit_tools/econ_rpg/gdp-live.test.mjs audit_tools/econ_rpg/publication.test.mjs
node audit_tools/econ_rpg/browser.test.mjs
node audit_tools/econ_rpg/instructional-followup.browser.test.mjs
node audit_tools/econ_rpg/mini-game-library.browser.test.mjs
```

## Instructor judgment and limits

The ceiling model intentionally uses upward-sloping supply, a binding initial control and a two-year horizon. Actual rent-control rules, elasticities and owner responses differ; ordinal magnitudes are not empirical predictions. The graph is an initial-market formalization, while the scenario explores later exemptions and mitigation. The additionality baseline is explicitly supplied, not inferred from spending.

Instructors may review the illustrative strength/timing of responses and ending precedence for their course. No political recommendation or unique best policy is implied. Automated semantics, keyboard/zoom/reflow and contrast checks do not replace testing actual screen-reader speech and physical devices.
