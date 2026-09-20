# The Main Attraction — final editorial QA

Completed September 20, 2026. This pass changes player-facing wording only. All 665 legal paths retain identical gameplay outcomes. The scenario remains private and ready for instructor QA; nothing was deployed or pushed.

## Scope and count

Reviewed **226 player-facing text fields, containing 208 distinct strings** in the expanded scenario data. This covers titles, prompts, scenes, labels, details, consequences (including conditional/generated outcomes), mechanisms, tradeoffs, alternatives, ending summaries, debriefs and indicator definitions. Repeated queue-branch wording and generated final-review combinations count as separate fields; hidden metadata and the external scene configuration are excluded.

**111 fields were materially edited, representing 105 distinct original strings.** These are field-level counts, not sentence counts: several fields contain multiple sentences. Helper text shared by several final outcomes is counted at each displayed outcome. All 21 node/choice pairs were reviewed consecutively, including the differences between busy and steady queue branches.

Changed files:

- `game/scenarios/main-attraction.js`: visible copy only.
- `MAIN-ATTRACTION-QA-PATHS.md`: five label/heading updates to match the interface. Routes and coverage are unchanged.
- This report.

No tests or exact-copy assertions required changes. No engine, storage, scene configuration, art, housing scenario, public file or production configuration changed. Scenario ID/version, node/choice IDs, ordering, conditions, effects, funding gates and ending eligibility remain identical.

## What changed

Competition wording now separates an increase in competitive pressure from the level of market power Starhaven retains. The final-stage scene and all three responses explain the role of established attractions, differentiation and entry barriers. Expansion and premium summaries explicitly allow substantial market power alongside new competition. The debrief still explains how more substitutes can make demand more elastic over time.

Price-discrimination wording describes what the player does: sell faster access, issue tickets for specific dates, or issue memberships to named residents. The restrictions still explain how customer groups remain separate and resale is limited. Conditional membership consequences retain the difference between added business and discounts replacing full-price sales. Peak pricing retains both demand sensitivity and congestion costs.

Mechanism labels remain disciplinary and short. For example, “Capacity rationing and congestion,” “Fixed investment and construction lag,” and “Product differentiation and market power” replace longer abstract constructions. Their surrounding consequences and tradeoffs still explain the benefits, costs and next constraint.

All four debrief headings remain unchanged. Their body text falls from **278 to 246 words, an 11.5% reduction** using whitespace-delimited word counts. The earnings definition now explains funds remaining after decisions without the paragraph about ordinal modeling and audited accounts; the private implementation report retains those qualifications. The existing short indicator caveat remains unchanged in the shared UI.

### Representative before and after

| Area | Before | After |
|---|---|---|
| Admission revenue | “In this season’s booking response, the higher receipt per guest outweighs the lost sales, and operating earnings rise.” | “This season, the higher price per ticket more than offsets the drop in sales, and operating earnings rise.” |
| Queue costs | “extra receipts exceed the added operating shifts in this season” | “extra receipts exceed the cost of added operating shifts this season” |
| Priority access | “Priority access screens guests by willingness to pay for time.” | “Priority access separates guests by how much they will pay to avoid waiting.” |
| Maintenance | “The coaster closes and the overhaul absorbs retained operating surplus, reducing current capacity.” | “The overhaul uses funds from operations and closes the coaster, reducing capacity.” |
| Expansion ending | “The park enters a more competitive market with a larger asset base and the costs of its earlier choices.” | “More competition is coming, but the expanded park can still have substantial market power.” |
| Membership label | “Offer named local off-peak memberships” | “Offer off-peak memberships to local residents” |
| Final choice label | “Keep the current offer” | “Keep existing prices and services” |
| Investment title | “A place for the next crowd” | “Investing in capacity” |
| Competition title | “Another reason to go elsewhere” | “A new competitor” |

The investment choice “Hold capacity and retain the funds” also becomes “Keep existing capacity and save the funds.” Named membership restrictions move into the detail rather than disappearing from the economics. “Programming” becomes “entertainment,” and references to financial “position,” “current offer” and “operating strength” become direct descriptions of prices, services or funds.

### Accuracy and language deliberately retained

The queue sentence previously compared money with operating shifts; it now compares receipts with their cost. “Elasticity of total revenue” is shortened to “elasticity,” with the consequence explaining how demand elasticity affects revenue. The debrief explicitly distinguishes the inelastic opening assumption from elastic demand, under which raising price would reduce revenue. It does not suggest that any increase in elasticity necessarily reverses the revenue effect.

The competition/expansion wording no longer invites an inference that a new entrant must leave the park with little market power. Final consequences still distinguish competitive pressure from the benefits and costs of earlier investment and repair decisions; those effects can offset one another.

These strong lines remain verbatim:

- “Market power permits a markup, not control over how many people buy.”
- “A profitable extra admission can still impose waiting costs on other visitors.”
- “Usable capacity does not increase yet.”
- “A ticket is not a guarantee of unlimited ride time.”
- “Existing attractions and entry barriers buy time, not immunity from substitutes.”

The title, subtitle, all five ending titles, four debrief headings and clear choice labels such as “Raise the admission price” and “Build a major new attraction” remain unchanged. “The signature ride” and “Different guests, different dates” already identify their situations clearly. Funding notes retain the explicit earnings thresholds and reserve amounts because replacing them with vague descriptions would obscure why a choice is unavailable. “Differentiation,” “marginal operating cost,” “cannibalization,” “peak-load pricing” and “contestability” remain where they name useful economic mechanisms.

No graphs, formulas, calculations, grading, welfare ranking or new economics were added. Consequences retain benefits and costs; final-review prose still explains both earlier maintenance and capacity delivery. Counterfactuals remain alternatives with costs, rather than hints toward a preferred answer.

## Regression results

Before editing, the scenario was captured from clean baseline commit `7264f49a07f572e2e265b5de9d09e174062c5223`. A separate comparison removes only identified visible text fields and requires all remaining scenario data to match exactly, including metadata and scene configuration. It also replays every route and compares every phase's state, available choice IDs, node, ending and selected scene.

- **665 paths / 8,645 phases identical before and after.** Exactly six decisions per completed path; all funding gates, intermediate and final states, scenes and endings match.
- Mechanical path/phase SHA-256: `de6a8410adce4c9b7f0a89d230112ba9627ed33574f2c9d4f7de8ce044576864`.
- Ending counts unchanged: reputation 150, crowded 84, built 123, premium 50, mixed 258. All six scene states remain reachable.
- **22 existing shared/scenario/storage/scene/publication tests pass.** Room to Stay's frozen 200-path result and approved artwork hashes remain unchanged.
- **27 park and 41 housing browser runs pass.** Desktop 1280px, mobile 390px and 320px, exact resume/replay, separate saves, keyboard/focus, indicators, debriefs and overflow checks pass. Narrow-screen screenshots were inspected after the edits.
- No external requests, CSP violations or browser errors. The existing production build exclusion passes; no public assets or links were added.

Local, ignored evidence is in `tmp/econ-rpg/editorial/`: the before-copy snapshot, field-by-field comparison, mechanical audit script and test logs. Existing browser screenshot/results directories hold the refreshed captures. Tests themselves were not changed.

### Saved-copy compatibility

The save format, loader, validation rules and scenario version remain unchanged as requested. Saves made with the revised copy reconstruct exactly throughout all current paths. **A pre-edit save containing a completed choice is not compatible with the revised prose:** the existing strict loader compares stored narrative text against a fresh replay and rejects the mismatch. A pre-choice save still loads. This was checked against all three original admission consequences.

Start a fresh Main Attraction run for this editorial review. No save migration, version bump, storage exception or deletion of the user's browser data was introduced. Room to Stay saves are unaffected. Preserving older narrative-bearing saves would require a separate change to the explicitly protected storage behavior.

## Read these 14 sections first

Use the unchanged routes in [MAIN-ATTRACTION-QA-PATHS.md](MAIN-ATTRACTION-QA-PATHS.md). This is an editorial reading order, not an additional set of required playthroughs.

1. **Admission: raise and lower consequences.** Check the relatively inelastic opening assumption, revenue versus ticket volume, access and queues.
2. **Paid priority in both queue branches.** Check the benefits for buyers and earnings against longer ordinary queues and unchanged capacity.
3. **Peak/off-peak consequence.** Check dated resale restrictions, flexible schedules, administration costs and congestion.
4. **Membership detail and both consequences.** Compare after higher admission with after hold/lower; check named residents and replacement of full-price sales.
5. **Full overhaul and deferred maintenance.** Read the heavy-use variant too; check current lost capacity versus later repair costs.
6. **Build a major new attraction.** Check funds spent before opening and the explicit absence of immediate usable capacity.
7. **A new competitor: both scene variants.** Check increased price sensitivity alongside the possibility of substantial remaining market power.
8. **All three final responses and their consequences.** Check retained funds, narrower or broader access, competition and delivery of earlier work.
9. **Built for the Next Season and A Park Worth the Premium summaries.** Check that more competition is consistent with a high market-power indicator.
10. **Running on Reputation, Lines Around the Midway and Still the Main Attraction summaries.** Check concrete costs, no moral ranking and no implied single best outcome.
11. **Pricing, demand and marginal reasoning.** Check the preserved markup sentence, marginal revenue below price and the elastic-demand contrast.
12. **Who pays which price?** Check natural wording without losing market power, separation, resale restrictions or cannibalization.
13. **Ride time today and investment tomorrow.** Check timing, opportunity cost, sunk versus marginal cost and the shorter earnings explanation.
14. **A dominant park can still face competition.** Check entry barriers, differentiation, substitute demand and effects before a rival opens.
