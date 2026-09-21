# Megastar Mania — implementation and QA report

Completed September 20, 2026; targeted gameplay refinements reviewed against commit `cc9dd5791c79655157cc0ea3f47719601244578b` on September 21, 2026. **Ready for instructor QA.** Development only; nothing deployed, published or pushed.

Play at <http://127.0.0.1:4179/?scenario=megastar-mania>. The title is exactly **Megastar Mania**, without a subtitle. Start with routes 1–8 in [MEGASTAR-MANIA-QA-PATHS.md](MEGASTAR-MANIA-QA-PATHS.md); together they show all seven scenes and all seven endings. Seventeen routes cover every reachable conditional consequence and choice, including added dates under shortage, balance and surplus.

## September 21 refinement scope

Only two gameplay rules changed from the reviewed commit: added-date consequence art and classification of strong-demand limited-tour endings. The map's alt description now identifies the action being illustrated rather than asserting strong ticket sales. All decision prose, choices, numerical effects, routing, market derivation, existing ending prose, debrief, artwork and shared runtime remain unchanged. Supporting tests and documentation reflect those two changes.

`expansion.dates` now selects `expanded-tour` on its immediate consequence in all three derived market states. Advancing returns to the current market image. `expansion.venues` never selects the tour-stop map.

`Intimate by Choice` requires `expansion.limited`, preference demand of at least 6/8 (the existing strong-demand threshold used by crossover scene selection), and no shortage according to the derived ticket market. It follows the existing ending priorities, preserving every Reputation, Too Big, Crossover, Sold Out and Built assignment. Of the 30 former Smaller Circuit paths, 12 now receive Intimate by Choice and 18 retain Smaller Circuit. The retained paths have demand 5/8; no strong-demand path reaches the default. Price-sensitive purchases, not raw Demand versus Supply, determine whether tickets are scarce.

Version 1 and save structure remain unchanged. Decision/consequence histories are identical to the commit, and all 717 unaffected old completed saves still replay exactly. The 12 old completed saves with the newly superseded `niche` ending ID are rejected safely by the existing strict replay validator; those completed playthroughs need to be restarted to see the revised ending. No storage migration or other mechanics were added.

## Architecture and changed files

The fourth scenario uses the existing shared engine, controller, UI, CSS, scene renderer, storage and debrief. Those implementations are unchanged. The private registry adds `megastar-mania`, version 1, through the existing `?scenario=` query parameter. Missing, unknown and inherited-object query names still resolve to Room to Stay. No public scenario picker was added.

Added under `audit_tools/econ_rpg/`:

- `game/scenarios/megastar-mania.js`: fictional artist, role, five indicators, six stages, consequences, endings and debrief.
- `game/scenarios/megastar-mania-scenes.js`: seven scenario-owned image conditions, captions and alt descriptions.
- `game/scenarios/megastar-mania-market.js`: scenario authoring helpers that compile price/history/state comparisons into ordinary shared-engine conditions. No separate transition engine or additional saved indicator.
- `megastar-mania-qa.mjs`: exhaustive enumeration, representative routes and manual-guide generation.
- `megastar-mania.test.mjs`: nine suites for structure, economic invariants, scenes, endings, persistence, assets, committed-history comparison and earlier scenario behavior.
- `megastar-mania.browser.test.mjs`: browser coverage using the existing preview and Playwright pattern.
- `art/megastar-mania-assets.json`: fourteen pre-integration hashes, sizes, dimensions and original locations.
- `art/source/megastar-mania/`: seven approved PNG masters moved from the runtime source folder.
- `game/art/scenes/megastar-mania/`: the seven supplied runtime WebPs, retained unchanged.
- `MEGASTAR-MANIA-QA-PATHS.md` and this report.

Modified existing files:

- `game/scenarios/registry.js`: fourth private registration.
- `main-attraction.test.mjs`: registry count changes from three to four; existing behavior checks remain intact.
- `publication.test.mjs`: scans for Megastar content and the fourteen new art hashes as well as the previous content/assets.
- `README.md`: fourth preview URL, architecture, model assumptions and QA commands.
- `art/README.md`: Art Bible guidance, approved-name mapping and conditional scene priorities.

No public or production source files changed. The publication test regenerated ignored local `dist/` solely to verify the existing exclusion boundary. Browser screenshots and logs are ignored evidence under `tmp/econ-rpg/`; they are not public output.

## Scenario and economic model

The player manages fictional indie-pop singer **Jules Arlen**. Six major decisions cover:

1. Early-career premium, moderate or introductory pricing.
2. Breakout demand with unchanged, moderately raised or sharply raised prices. A premium opening takes an alternate narrative node after its surplus.
3. Additional dates, larger venues or a limited schedule.
4. Laryngitis: cancellations, postponement beyond the current window or a longer recovery interval.
5. An ordinary public-image shock: an interview remark dismissing longtime fans; acknowledge it, stay quiet or establish a new image.
6. Original sound, a limited dance collaboration or full crossover appeal.

Seven unique nodes and 21 node/choice pairs generate **729 legal paths**. Every path has exactly six decisions. All nodes and endings are reachable, with no cycles or dead ends.

The five compact 0–8 indicators are **Ticket Demand, Ticket Supply, Tour Revenue, Fan Goodwill and Career Momentum**. Definitions remain in the shared collapsed help panel. Values are ordinal illustrations, not empirical measurements or a common welfare score.

Demand means preference strength. Price choices remain in history, and the scenario's authored comparison uses both price and preference strength to determine tickets wanted relative to capacity. The demand indicator itself does not change merely because a ticket price changes. More dates and larger rooms increase supply without increasing demand. Illness removes current supply without reducing demand. Publicity and crossover change demand without changing available seats.

The private helper uses a small illustrative price-response rule to author serializable conditions; it is not an estimated demand curve, pricing recommendation or formula exercise for students. Gameplay contains no graphs, algebra, quiz questions or Correct/Incorrect feedback. The pure comparison helper does not mutate runs. Save data retains only the shared engine's existing fields and five declared indicators.

Revenue represents financial strength from receipts after refunds, not profit. Price-setting outcomes illustrate higher receipts per buyer versus sales lost; they are not estimated elasticities. Later supply and demand changes occur at the retained price. They change receipts only if actual sales change. More demand with all seats already sold intensifies scarcity without adding ticket receipts. Refunds reduce the revenue indicator during cancellations. Logistics, fan experience, preparation and recovery time have tradeoffs beyond receipts.

Secondary resale occurs only when requests exceed available tickets at the official price. Consequences identify shut-out fans, higher resale offers and value captured by resellers. The debrief distinguishes a sellout from evidence of unfilled requests, and does not judge affordable official pricing as inherently wrong.

The final debrief retains the shared overall changes, six-entry path, individual mechanisms and tradeoffs, four economics sections and three counterfactuals. It explains surplus/shortage, what sellouts and resale reveal, supply shifts and demand shifts.

| Ending | Legal paths | Distinct economic condition |
|---|---:|---|
| Reputation on the Ropes | 162 | Demand remains well below the breakout peak; a small supply can still be scarce |
| Too Big, Too Fast | 147 | Expanded tour has more remaining tickets than buyers want at the price |
| Crossover Superstar | 141 | Full crossover restores strong demand, with core-fan tradeoffs |
| Sold Out Everywhere | 202 | Tickets wanted exceed the remaining supply; resale pressure persists |
| Built for the Crowd | 47 | Expanded capacity and later changes leave purchases in balance with available seats |
| Intimate by Choice | 12 | Strong preference demand, deliberately limited tour and no shortage at the retained price |
| A Smaller Circuit | 18 | More modest preference demand on a compact schedule, sometimes with open seats |

“A Smaller Circuit” is reserved for more modest demand. “Intimate by Choice” recognizes a deliberately compact tour with strong interest, whether the retained price leaves ticket purchases in balance or some seats open. Neither small scale nor open seats alone implies weak preference demand. Endings are not ranked. No route reaches the maximum of all five indicators, and there is no aggregate score or prescribed best ending.

## Approved artwork and scene mapping

Masters: `audit_tools/econ_rpg/art/source/megastar-mania/megastar-{scene}.png`.

Runtime: `audit_tools/econ_rpg/game/art/scenes/megastar-mania/{scene}.webp`.

All fourteen files remain **byte-for-byte identical to the supplied assets**, at 1448 × 1086. The supplied PNGs were already canonically named in `game/art/sources/`; they moved outside the preview root. Runtime WebPs already existed in the required namespace. No new art, conversion, recompression, crop, resize, overlay or pixel edit was performed. The Art Bible records the mapping from the seven descriptive original names in the request to these canonical names.

| Scene | Selection and meaning |
|---|---|
| baseline | Initial neutral market or purchases matching capacity |
| surplus | Unsold tickets before the interview; active concert with empty seats |
| shortage | More tickets wanted at the official price than available; packed venue and shut-out fans |
| expanded-tour | Immediate `expansion.dates` consequence in every market state; the map illustrates added tour stops and supply, not realized attendance |
| supply-shock | Illness consequence only; canceled current performances, closed venue and no waiting audience |
| demand-drop | After the interview when weakened interest and the retained price leave seats unsold |
| demand-boom | Crossover has brought strong demand and purchases fill remaining capacity |

Priority is supply shock, demand drop, demand boom, immediate added-date consequence, shortage, surplus, baseline. The map uses decision history and consequence phase to illustrate the supply action, including temporary surplus capacity. At the next decision, market-state art resumes; larger venues never trigger the map. Other scenes still use history and derived market conditions. A demand decline that still leaves a shortage retains shortage imagery. A crossover that cannot fill seats retains demand-drop imagery.

The cancellation image represents removed performances. The next decision explicitly moves to the recovered artist's remaining shows without restoring canceled capacity. Postponed shows are canceled for their original dates and moved beyond the current window, matching the supplied image's signage. Subsequent crowds represent performances that actually occur.

## Verification results

**Automated tests: 38 passed, zero failed on September 21.** This includes nine Megastar tests and all existing engine, scene, park, PPF and publication tests.

The exhaustive checks validate unique IDs, targets, all reachable nodes/choices/outcomes, bounds, six decisions on all 729 routes, every ending and every scene. All 9,477 current decision/consequence/ending phases replay exactly. Repeated selection from cloned runs is deterministic and leaves state unchanged. Every added-date consequence shows the map, covering shortage, balance and surplus; no venue-expansion or later screen does. Advancing from expansion selects the independently verified market image. Four save keys remain isolated. Restart/replay identity, corrupted state and version mismatches are checked. Economic assertions cover price versus demand, supply-only changes, publicity-only changes, revenue under binding capacity, resale-only shortages, recent cancellation scenes and market-consistent endings. Comparison with the requested commit proves all 729 histories/state transitions unchanged and exactly twelve final ending IDs reclassified.

Earlier full serialized path histories retain their frozen SHA-256 checksums:

| Scenario | Legal paths | Frozen complete-path checksum |
|---|---:|---|
| Room to Stay | 200 | `f5eb10bba272b655a3253ba355b801b0aa7e445147ee4a0bed5ad4ec77cb1d6e` |
| The Main Attraction | 665 | `e9bb3c77ba9f57acc27b1d49a442e911526a761a70fe1bc51b072e40122561ad` |
| The Economy’s Edge | 361 | `3fd6ef7143484f891e64470ef384a8dde4174408426cd39f692fa1f45b550b3a` |

**Browser checks: headless Chrome.** The revised Megastar coverage set contains 17 routes at each of 1280px, 390px and 320px: **51 full playthroughs**, all seven scenes and all seven endings at each width, including explicit date-map consequence and subsequent market-image assertions. The earlier September 20 browser regression run covered 41 housing runs, 27 park runs and 33 PPF runs; those scenarios and the shared runtime remain unchanged, with their automated regressions and complete-path hashes verified again on September 21.

Checks include exact UI choices and path history, five indicators and signed changes, collapsed help, six path entries, three counterfactuals, image decode and full 4:3 framing, descriptive alt text, captions, no horizontal overflow, and buttons at least 44px high. Keyboard Enter/Space/Tab activation, visible focus, focus transfer, live announcements and Escape cancellation passed. Reload at consequences/decisions/endings, ending review, replay, blocked storage, version mismatch, and the three older scenarios' untouched saves passed. Desktop and narrow first-decision screenshots and the mobile debrief were visually reviewed. Real-device and screen-reader review remain appropriate instructor QA; this is not a claim of a full assistive-technology audit.

No external requests, CSP violations, console errors or page errors were recorded by any browser suite. All seven Megastar WebPs return the correct local image MIME type. Source-master URLs return 404. Art-only captures accompany captioned scenes at all three widths.

Current refinement evidence: `tmp/econ-rpg/megastar-mania/browser-results.json`, screenshots in that folder, `tmp/econ-rpg/megastar-refinements-units.log` and `tmp/econ-rpg/megastar-refinements-browser.log`. Original earlier-scenario browser evidence remains in the three `megastar-*-regression.log` files.

**Publication guard: passed.** The existing explicit `audit_tools/` deny rule and `.assetsignore` remain unchanged. The real local build contains no RPG content, no private directory and none of the 48 approved source/runtime image hashes under any filename. Protected public navigation, Games, Composer, telemetry, Cloudflare and publication tooling show no changes. No deployment or push command ran.

## First instructor review

Use [routes 1–8](MEGASTAR-MANIA-QA-PATHS.md) first, in order: early surplus and reputational weakness; balanced opening and successful capacity fit; low-price shortage and resale; expansion followed by crossover; excess capacity; a more modest compact tour; Intimate by Choice with balanced purchases; Intimate by Choice with surplus seats at the retained price. Routes 9–17 cover the remaining conditional economic consequences.

For the scene correction, compare row 1 (added dates create surplus), row 4 (balance), and row 12 (shortage): all show the map immediately and market-state art after Continue. Rows 5, 9–11 use larger venues and must never show the tour-stop map. For the ending correction, rows 7–8 both end with demand 7/8 and a limited schedule, but the posted price and remaining capacity leave different sales conditions. Row 6 remains A Smaller Circuit at demand 5/8. Row 3 retains Sold Out Everywhere; row 2 retains Built for the Crowd.

## Explicit completion answers

| # | Question | Answer |
|---|---|---|
| 1 | Does Megastar Mania run on the shared RPG engine? | **Yes.** No engine duplication or runtime modification. |
| 2 | Did Room to Stay remain unchanged? | **Yes.** Content, runtime behavior, frozen paths and regression suite preserved. |
| 3 | Did The Main Attraction remain unchanged? | **Yes.** Scenario preserved; only its registry-count test now expects four. |
| 4 | Did The Economy’s Edge remain unchanged? | **Yes.** Content, frozen paths and regression suite preserved. |
| 5 | Does it teach supply and demand without gameplay graphs or formulas? | **Yes.** Decisions and consequences precede the conceptual debrief. |
| 6 | Can players experience surplus and shortage? | **Yes.** Both have reachable consequences and appropriate scenes. |
| 7 | Can players experience supply increases and decreases? | **Yes.** Dates/venues expand capacity; illness removes current performances. |
| 8 | Can players experience demand increases and decreases? | **Yes.** Breakout/crossover growth and the interview shock change preferences. |
| 9 | Is the secondary market specifically tied to shortages? | **Yes.** Every resale consequence is checked against excess requests at the posted price. |
| 10 | Are all seven approved scene states used appropriately? | **Yes.** All are reachable; cancellation, attendance and recent-history rules are exhaustively checked. |
| 11 | Did any public/production files change? | **No public or production source changed.** Only ignored local `dist/` was regenerated for exclusion QA. |
| 12 | Was anything deployed or pushed? | **No.** Nothing published, deployed or pushed. |

**Megastar Mania is ready for instructor QA. Work stops at this private development milestone.**
