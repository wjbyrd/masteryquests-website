# The Main Attraction — development completion report

**Development-complete and ready for instructor QA.** Verified September 20, 2026. This is private development work, not a production release.

Play [The Main Attraction](http://127.0.0.1:4179/?scenario=main-attraction) using `node audit_tools/econ_rpg/serve.mjs`. [Room to Stay](http://127.0.0.1:4179/?scenario=housing-crisis) remains the default. See [MAIN-ATTRACTION-QA-PATHS.md](MAIN-ATTRACTION-QA-PATHS.md) for nine concise coverage routes.

## Architecture and files

Both scenarios use the existing immutable engine, condition matcher, strict save reconstruction, restart/replay logic, renderer, responsive CSS, accessibility behavior, consequence screen, six-entry path and debrief framework. No second application or engine was introduced.

Added under `audit_tools/econ_rpg/`:

- `game/scenarios/main-attraction.js`: scenario version 1, content, effects, branching, endings and instructional metadata.
- `game/scenarios/main-attraction-scenes.js`: six read-only scene variants and conditions.
- `game/scenarios/registry.js`: stable-ID lookup for the private `scenario` query parameter.
- `main-attraction-qa.mjs`: exhaustive enumeration plus a compact manual coverage set.
- `main-attraction.test.mjs`, `main-attraction.browser.test.mjs`: scenario, storage, asset, routing, regression and browser checks.
- `art/main-attraction-assets.json`: original hashes, dimensions and byte counts for twelve supplied images.
- This report and `MAIN-ATTRACTION-QA-PATHS.md`.
- Twelve supplied files moved into the namespaces listed below.

Modified:

- `game/rpg.js`: replace its housing-only import with the registry resolver. All subsequent controller behavior is unchanged.
- `qa.mjs`: let `summarize` accept a scenario, retaining housing as its default.
- `publication.test.mjs`: also scan for Main Attraction content and all twelve park asset hashes.
- `README.md` and `art/README.md`: document both scenarios and extend the existing Art Bible.

`engine.js`, `storage.js`, `ui.js`, `rpg.css`, `scenes.js`, the housing scenario/configuration and every Linden asset remain unchanged. Unknown or missing query IDs return housing; inherited object names cannot select a scenario. There is no public scenario picker.

Independent version-1 save keys are `mq.econ-rpg.housing-crisis` and `mq.econ-rpg.main-attraction`. Switching scenarios, restarting or replaying one leaves the other's save intact. Corrupt/version-mismatched saves fail safely; denied storage leaves the current session playable. CSP and the no-op event hook are unchanged: no remote telemetry, accounts, identifying input or gameplay transmission.

## Scenario and economics

The player is general manager of fictional Starhaven Park, the dominant regional large-scale attraction. Land, reputation, established rides and large fixed investment impede entry, while festivals, travel, smaller attractions and staying home constrain demand.

Five bounded 0–8 indicators begin at earnings 5, access 4, experience 5, capacity 4 and market power 6. Earnings means retained operating strength after commitments; access includes affordability and practical use of rides. These are ordinal teaching indicators, not accounting profit, attendance, dollar amounts, percentages or a welfare score. A zero is the low endpoint of a condition, not literally zero customers or money.

| Stage | Decision and path dependence |
|---|---|
| 1. Admission | Raise, hold or lower admission. Lower prices lead to the busy-midway branch; raise/hold lead to the steady-midway branch. |
| 2. Queues | Reservations, paid priority or general queues. Queue pressure changes effects; both branches reconverge at segmentation. |
| 3. Segmentation | One price, peak/off-peak prices or named off-peak memberships. Initial higher pricing changes membership earnings. |
| 4. Maintenance | Full overhaul, inspected deferral or partial repairs. An overhaul requires earnings ≥4; prior heavy use worsens deferral. |
| 5. Investment | Expansion, throughput work or hold capacity. Expansion requires earnings ≥4 and spends funds without immediately adding capacity. |
| 6. Competition | Broaden access, differentiate or keep the offer. Premium programming requires earnings ≥1. Earlier repairs and investment deliver their next-season consequences exactly once. |

There are seven nodes and 21 authored node/choice pairs, with two or three available options at every reachable decision. All **665 legal complete paths contain exactly six decisions**. No orphan, dead-end or cyclic path exists. All nodes, choices, funding gates in both states, conditional consequences, scenes and endings are reachable.

Pricing explicitly assumes a relatively inelastic first-season response; raising price does not universally raise revenue. Queue choices separate marginal operating contribution from waiting costs borne by other guests. Segmentation applies differences in willingness to pay/elasticity and restrictions on resale; discounts can replace full-price purchases. Peak pricing can also reflect congestion costs. Maintenance and investment sacrifice current funds for later service, while more substitutes can erode future pricing power. The debrief explains marginal revenue below price under uniform pricing, marginal operating costs versus sunk costs, entry barriers and contestability.

No answer score, correct/incorrect feedback, designated winning route or aggregate optimization target exists. For example, these first six manual routes end with the following profiles:

| Route | Earnings | Access | Experience | Capacity | Power |
|---|---:|---:|---:|---:|---:|
| Premium operation | 4 | 0 | 8 | 4 | 5 |
| Broad access / crowding | 4 | 8 | 0 | 3 | 4 |
| New attraction | 2 | 4 | 8 | 7 | 6 |
| Deferred upkeep | 3 | 8 | 0 | 5 | 4 |
| Incremental investment | 5 | 3 | 8 | 6 | 4 |
| Depleted funds | 0 | 7 | 7 | 6 | 5 |

No legal path simultaneously attains every indicator's observed maximum. This verifies divergent modeled outcomes, not empirical validity or equal attractiveness of every possible sequence.

### Ending rules

The first matching rule supplies the headline; indicators and the full path retain other effects. Priority diagnoses overlapping conditions and does not rank welfare.

| Priority / ending | Final eligibility | Paths |
|---|---|---:|
| Running on Reputation | Deferred maintenance, experience ≤3, power ≥3 | 150 |
| Lines Around the Midway | Access ≥6, experience ≤4 | 84 |
| Built for the Next Season | Expansion chosen, capacity ≥6 | 123 |
| A Park Worth the Premium | Earnings ≥4, experience ≥6, access ≤4, power ≥5 | 50 |
| Still the Main Attraction | Remaining cases | 258 |

Instructor review should assess the size/direction of ordinal effects, relatively inelastic opening demand, retained-surplus financing gates, congestion proxies and overlapping ending priority. Access/capacity thresholds stand in for crowd pressure; they are not a numerical demand curve. Investment completion is deterministic at the final review, and partial repairs leave obligations beyond the modeled horizon. These simplifications are documented rather than presented as forecasts.

## Approved art and moves

All supplied files retain their original filenames, bytes and 1448 × 1086 dimensions. No images were generated, edited, recolored, cropped, converted or recompressed. Before moving, hashes and byte counts were recorded in `art/main-attraction-assets.json`; tests verify them. All ten existing Linden files also pass their original manifest checks.

Masters moved from `art/source/` to **`art/source/main-attraction/`**. Runtime files moved from the ambiguous `art/scenes/` directory to **`game/art/scenes/main-attraction/`**. Paths below are relative to those destinations.

| Scene | PNG master | Runtime WebP |
|---|---|---|
| baseline | `main-attraction-baseline.png` | `baseline.webp` |
| crowded | `main-attraction-crowded.png` | `crowded.webp` |
| premium | `main-attraction-premium.png` | `premium.webp` |
| maintenance | `main-attraction-maintenance.png` | `maintenance.webp` |
| construction | `main-attraction-construction.png` | `construction.webp` |
| upgraded | `main-attraction-upgraded.png` | `upgraded.webp` |

Initial play always uses baseline. Thereafter, first-match scene priority is:

1. Maintenance: deferred maintenance and experience ≤3.
2. Upgraded: expansion chosen and the final competition response completed.
3. Construction: expansion chosen but final delivery has not occurred.
4. Crowded: access ≥6 with capacity ≤5, or access ≥7 with capacity ≤6.
5. Premium: access ≤4 and experience ≥5, plus prior higher admission, paid priority or final differentiation.
6. Baseline: other conditions.

Maintenance can visually override construction or delivered expansion because new rides do not repair older ones. An upgraded view does not imply all other constraints have disappeared. Scene selection never writes state or saves. Alt text and HTML captions supplement the text; the illustrations are not grades. PNG masters are outside the preview's served root.

## QA evidence

**22 engine/scenario/storage/scene/publication tests pass.** Park enumeration verifies all 665 paths, every node/choice and exactly six decisions, bounded states, all five endings and six scenes. Every phase of every park path reconstructs exactly from its save. Conditional funding, prior-price consequences and delivery timing are exercised. Invalid schema checks and immutable transition coverage are retained from the shared suite.

**Room to Stay remains behaviorally identical:** all 200 complete serialized path outcomes match the existing frozen SHA-256 `f5eb10bba272b655a3253ba355b801b0aa7e445147ee4a0bed5ad4ec77cb1d6e`. Its original tests, scene selection and 41 complete browser playthroughs pass unchanged.

**Main Attraction browser QA:** nine full coverage routes at each of 1280px, 390px and 320px, totaling 27 complete runs. At each width all six images and five endings were exercised. Checks cover intro, decisions, consequences, six path entries, expandable details, alternative decisions, indicator values/actual bounded changes, collapsed definitions, no horizontal overflow and usable action sizes. Images retain their complete 4:3 frame. The phone's first option begins within 800px of the decision heading; the conditions panel follows actions.

Keyboard Enter/Space/Tab, visible focus, heading focus transfer, live state announcements, non-color-only values, descriptive image alternatives, native controls and reduced-motion styling pass. Reloads preserve decision/consequence/ending phases without duplicate effects. Restart cancellation, replay identity, funding-gate resume, cross-scenario isolation, invalid versions and unavailable storage pass. Automated checks and screenshot inspection do not replace the instructor's real-device and screen-reader review.

Both browser suites report **zero external requests, CSP violations, console errors or page errors**. Runtime requests use the approved local WebPs, with correct MIME types and dimensions; source masters return 404.

QA artifacts are local and git-ignored under `tmp/econ-rpg/` and `tmp/econ-rpg/main-attraction/`. The park directory contains `browser-results.json`, `unit-results.txt`, all six `scene-{1280,390,320}-{id}.png` captures and caption-free art captures, plus intro, first-decision, consequence, help and five debrief screenshots at each width. Visual inspection confirmed the six states remain distinct at narrow widths and the shared reading order/layout is intact.

The real production builder was run locally for the publication test. Its existing allowlist/deny rules exclude the RPG tree; scans confirm no RPG content or any of the 22 approved image hashes appears in `dist`. No public navigation, Games listing, update history, hidden public route, protected game, question bank or production configuration was changed. No deployment or push occurred.

## Inspect these playthroughs first

The [manual guide](MAIN-ATTRACTION-QA-PATHS.md) maps these short IDs to the exact displayed choices. Start over between routes.

1. **Premium:** raise → reserve → single → overhaul → hold → differentiate.
2. **Access/crowding:** lower → open → members → partial → hold → broaden.
3. **Segmentation and expansion:** raise → priority → dates → partial → expand → broaden. Watch construction before completion, then upgraded art.
4. **Deferred upkeep:** lower → open → members → defer → expand → course. Maintenance remains visible despite expansion.
5. **Incremental investment:** hold → reserve → single → partial → throughput → course.
6. **Funding constraints:** lower → reserve → single → overhaul → throughput → broaden. Expansion and final premium programming become unavailable.

Finish guide rows 7–9 to cover every authored option and conditional branch. Review the six-entry debrief, switch between saved scenarios and try keyboard/mobile play.

## Explicit completion answers

1. **Same reusable engine? Yes.** Shared transitions, conditions, storage, rendering and debrief; only a minimal registry was needed.
2. **Room to Stay behavior unchanged? Yes.** Protected files, frozen 200-path result, original art hashes and browser regression pass.
3. **Hidden correct path? No.** No grading, designated winner or combined score is implemented.
4. **Meaningfully different tradeoff profiles? Yes.** Access, retained earnings, experience, capacity and pricing power diverge across strategies.
5. **Applied monopoly decisions instead of quiz questions? Yes.** Six operating decisions change later choices and outcomes.
6. **All six approved scenes used appropriately? Yes.** All are reachable, selected from state/history and verified at all three viewport widths.
7. **Ready for instructor QA? Yes.** Development-complete, with nine review routes and documented assumptions. Not declared production-ready.
8. **Any production/public file changed? No.** All source changes are under the private RPG directory; only ignored local build/QA outputs were regenerated.
9. **Anything deployed? No.**
10. **Anything pushed? No.**
