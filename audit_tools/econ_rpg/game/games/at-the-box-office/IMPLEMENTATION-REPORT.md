# At the Box Office

This is the first-pass implementation record. See [the refinement report](REFINEMENT-REPORT.md) for the current UI, revised Week 3, charts, and supplied replacement imagery.

Built October 1, 2026 for the unlisted October games hub.

- Game: https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/at-the-box-office/
- Hub: https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/
- Deployment: `ac51ce81-4d83-4a63-979e-88ef90803b8f`, existing `masteryquests-website` Worker, with `--keep-vars` and the normal complete-site build.

## Files

The requested working copy is `tmp/econ-rpg/at-the-box-office/`. The durable publication source is `audit_tools/econ_rpg/game/games/at-the-box-office/`, because the repository excludes `tmp` from version control and publication.

Created `index.html`, `styles.css`, `scenarios.js`, and `game.js`. Copied the three supplied WebPs unchanged into the publication source's `scenes/`. Original PNGs and WebPs remain untouched in the requested working folder. Added model, browser, and publication tests (`*.test.cjs`) and this report; these do not ship.

Hub integration adds one illustrated card and a narrowly scoped image-framing rule, adds the standalone game to `games-preview.json`, makes the published game count dynamic, and extends the existing hub smoke test. Other games' gameplay files and public-facing source pages were not edited.

## Rounds and economics

1. The Premiere: inelastic ticket demand; higher prices raise revenue while retaining the audience target.
2. A Tougher Sell: elastic ticket demand; a promotional price increases attendance and revenue.
3. The Revenue Test: unit-elastic price–quantity pairs; equal receipts make attendance the deciding aim.
4. Streaming Special: an observed streaming price cut shifts theater demand down; substitutes and positive cross-price elasticity.
5. The Popcorn Problem: concession prices affect ticket demand at a fixed ticket price; complements and negative cross-price elasticity.
6. Rebate Weekend: unchanged-price bookings show normal premium/standard responses and an inferior matinee response in this fictional market, before any promotion.
7. Opening Night: three integrated ticket, bundle, and promotion strategies; feedback explicitly avoids estimating a single elasticity from simultaneous changes.

## Design decisions

The portrait scenes remain the visual focus, with a restrained navy-and-brass reading panel alongside on desktop and stacked beneath on mobile. The opening scene is shown without cropping. The original theater exterior also supplies the hub card. Return to Games is available throughout the game.

Scenario data, calculations, state, rendering, and debrief generation are separated. Deterministic tables make every outcome reproducible. Each week has its own explicit reference figures; only season admissions, ticket receipts, and market-reading points accumulate. Weekly goals balance access, revenue, and audience fit. The final debrief incorporates the actual run and offers a seven-week ledger and restart.

Results use computed ticket receipts and, where applicable, concession and combined revenue. Rebate-week revenue sums price × quantity across the three screening types; it does not use a misleading single ticket price. Directional changes include words and arrows. Semantic controls, keyboard focus, a skip link, a live result announcement, reduced-motion support, and scrolling layouts are included.

## Verification

- All 21 decisions checked for exact revenue arithmetic and valid quantities.
- Elasticity magnitudes, related-good response signs, income responses, and scoring against each stated aim verified by model tests.
- All 2,187 choice paths enumerated; valid totals and all three ending tiers confirmed.
- Desktop 1440px and phones 390px/320px: every choice exercised, totaling 63 result checks and nine full playthroughs/restarts per browser-test run.
- Start, decision, result, income table, finale, debrief, and hub screenshots visually reviewed; 200% zoom checked.
- All scene images decode, no horizontal overflow, no page exceptions or failed responses, correct live result text, and focus transfer confirmed.
- Publication checks verify exactly seven runtime files, unchanged image hashes, the 13-card hub, robots metadata, and no new link on the normal public Games page.
- The complete site build passed with zero forbidden or incoming source files.

The older repository-wide publication test has one pre-existing failure: its broad forbidden-name expression rejects existing CPI Live and Labor Force Files faculty-guide references in `how-to/index.html` (also present in HEAD). Its deployment-configuration check passes. The new game-specific publication checks pass; no unrelated guide content or old assertions were changed to hide this failure.

## Assumptions for instructor review

Fictional response tables are deliberate teaching scenarios, not empirical estimates. Relative elasticity comparisons hold other conditions fixed except where the brief explicitly describes a demand shift. Income classifications are specific to this market. Total admissions count visits, not unique people; revenue is gross receipts and costs/profit are not modeled. Promotions have specified attendance effects, but their costs are not simulated. The intended 8–12 minute duration assumes students read and reflect; it has not been timed with a student group. Progress is session-only, with no persistence, telemetry, backend, or remote API.

The complete-site deployment also uploaded the already-committed `resources/index.html`, which differed from the previously deployed copy. This task made no edits to that file.

## Live verification

The deployed game passed all 63 choice-result checks at 1440px, 390px, and 320px, including nine complete playthroughs and restarts, with no page errors or failed asset responses. The complete 13-game hub passed 26 launch/interaction/return checks at desktop and phone widths; all 240 runtime assets returned HTTP 200. The live indexing header was verified. Machine-readable results and screenshots are in the ignored working-copy qa directory and tmp/games-preview/live/.
