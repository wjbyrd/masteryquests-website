# The Strategy Desk — Engine 2.0 Upgrade Audit

Build date: 2026-08-16

## Result

The Strategy Desk has been migrated to the same current Managerial Intelligence Directorate engine architecture used by the upgraded Cost Directive and Market Signal.

The published question bank and instructional-resource catalog were not rewritten.

## Modes

All ten modes pass engine preflight:

1. Standard Campaign
2. Timed Trial
3. Exam Drill
4. Quiz
5. Unlimited Practice
6. Legendary Mode
7. Score Attack
8. Trial by Graph
9. Fading Fortune
10. Risk & Reward

Shared family artwork is wired exactly as requested:

- Quiz → `mode_quiz.webp`
- Unlimited Practice → `mode_unlimited.webp`
- Trial by Graph → `mode_graph.webp`
- Fading Fortune → `mode_fading.webp`
- Risk & Reward → `mode_risk.webp`

Existing mode artwork remains unchanged.

## Trial by Graph

The Strategy Desk contains 37 graph-linked questions across the three game-tree assets.

The fixed-length Trial by Graph deck deliberately uses ordinary non-boss pools only:

- eligible ordinary graph questions: 24
- supported run lengths: 10, 15, 20
- generated deck tests: 10/10, 15/15, 20/20

Graph metadata was added at runtime for:

- `gametreeone.webp`
- `gametreetwo.webp`
- `gametreethree.webp`

The published bank itself was not modified.

## Fading Fortune

Curated fixed-mode inventory:

- 240 eligible questions
- 48 selected from each ordinary difficulty tier
- supported run lengths: 10, 15, 20
- generated deck tests: 10/10, 15/15, 20/20

The inherited timing schedule remains difficulty-sensitive:

- Easy: 8 seconds
- Medium: 10 seconds
- Hard: 12 seconds
- Elite: 15 seconds
- Legendary: 18 seconds

Each answer fade reduces the live value by 25 points.

## Risk & Reward

Curated fixed-mode inventory:

- 420 eligible questions
- 84 selected from each ordinary difficulty tier
- supported run lengths: 10, 15, 20
- generated deck tests: 10/10, 15/15, 20/20

The current Engine 2.0 bankroll mechanics are preserved, including the bust condition.

## Strategy-specific remediation repair

The current bank uses 47 primary-skill labels while the repair/bridge library contains 26 canonical skills.

Ninety primary questions use one of 21 historical aliases with no direct repair pool.

Engine 2.0 now resolves those aliases through the Strategy Desk objective-to-canonical-skill map before remediation begins.

Validation:

- affected alias questions: 90
- successfully routed to a real canonical repair/bridge pool: 90
- unresolved: 0

Examples:

- `damaged_goods_metering` + LO14.2 → `versioning_and_metering`
- `self_selection` + LO14.3 → `consumer_surplus_extraction`
- `game_design` + LO15.4 → `strategic_rule_design`
- `arbitrage_prevention` + LO13.3 → `arbitrage_control`

This also resolves aliases such as `credible_threats` by objective instead of pretending one global alias means the same thing everywhere.

## Legendary bosses

The Strategy Desk's authored Legendary boss triplets are preserved as ordered three-question objective groups.

The upgraded selection logic:

- randomizes genuinely tied weak objectives
- avoids reusing an objective across the three Legendary boss encounters when alternatives remain
- preserves authored triplet order
- tracks already-used Legendary boss questions

A controlled three-boss tie test selected three different objectives and three ordered triplets.

## Score Attack

The Strategy-specific perfect score remains correctly calibrated at 11,590.

That reflects the real 36-answer perfect route:

- 27 ordinary-room answers
- 9 boss hits

The old 9,250 “maximum” defect is not present in this build.

## Strategy timing calibration

The Strategy Desk keeps its native timing targets rather than falling back to a generic timing model.

Explicit targets remain for:

- definition
- interpretation
- application
- strategy
- calculation
- graph
- matrix
- trap
- multi-step
- interaction
- integration
- graph-integration

Advanced selection also retains Strategy-specific preference for strategy, matrix, graph, and graph-integration forms.

## Mastery Report and review routing

Engine 2.0 evidence-strength reporting is active.

The report separates performance from evidence strength and tracks:

- accuracy
- number of scored attempts
- difficulty exposure
- strongest signals
- concepts to review
- weakest question forms
- repair/bridge exposure
- mode-specific evidence
- Risk & Reward bankroll evidence
- Fading Fortune value/fade evidence

The Strategy Desk resource catalog contains mappings for all 26 objectives represented in the question bank.

Validation:

- Strategy objectives in bank: 26
- mapped instructional objectives: 26
- unmapped objectives: 0
- direct recommendation routing tested successfully for LO15.3 and LO13.4

## State and hub protections

Validated:

- selected mode remains authoritative
- a mismatched Legendary payload stored under the Standard save key is rejected and deleted
- delayed callbacks are run-session guarded
- awaited answer resolution is run-session guarded
- practice modes do not write Standard campaign progression
- no-boss modes suppress boss encounters/icons
- Standard remains the only mode allowed to complete the Directorate mission
- historical hub keys remain authoritative:
  - `managerialHub_desk_started`
  - `managerialHub_desk_complete`
  - `managerialHub_desk_status`
  - `managerialHub_desk_room`
- newer `managerialHub_strategyDesk_*` aliases are mirrored for compatibility
- active-state synchronization tested at Room 7
- completion synchronization tested at Room 30

## Published-bank integrity

Current published package:

- primary/boss questions: 607
- repair questions: 78
- bridge questions: 78
- total authored records: 763
- duplicate primary IDs: 0
- malformed four-choice records: 0
- repair skills: 26
- bridge skills: 26

Every one of the 763 published records was checked against its SHA-256 answer hash.

Result:

- records checked: 763
- records with anything other than exactly one valid answer: 0

## Preserved Strategy Desk identity

Preserved:

- Demand Strategist
- Segmentation Broker
- Game Architect
- The Principal
- Elasticity Compass
- Segmentation Seal
- Bargaining Ledger
- corporate-noir visual design
- Strategy Desk sound effects
- three game-tree assets
- Game Architect guide-to-final-boss reveal
- ordinary boss scaffolds
- local telemetry and CSV export
- graph lightbox
- rapid-guess protection

## Deployment

Replace only:

`play/managerial-intelligence-directorate/strategy-desk/index.html`

with the upgraded HTML.

Leave the current production copies of these files/assets in place:

- `strategy_desk_question_bank_student.js`
- `instructional_resources.js`
- `resources/`
- existing bosses, artifacts, backgrounds, audio, game-tree images
- existing mode artwork
- the five shared new mode WebP files

## Validation status

Passed:

- inline JavaScript syntax
- published question-bank JavaScript syntax
- instructional-resource JavaScript syntax
- all ten mode preflights
- all fixed-length 10/15/20 deck builders
- published-answer hash verification
- canonical remediation alias routing
- hub active/completion alias synchronization
- mismatched-save rejection
- instructional-resource recommendation routing
- Legendary boss diversification/order test

A normal browser play pass is still the final deployment check, especially for sound, image loading, mobile sizing, and click/touch behavior.
