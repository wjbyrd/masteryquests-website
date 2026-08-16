# The Agency Protocol — Engine 2.0 Upgrade Audit

Build date: 2026-08-16

## Result

The Agency Protocol has been migrated to the same current Managerial Intelligence Directorate engine architecture used by the upgraded Cost Directive, Market Signal, and Strategy Desk.

The published question bank and instructional-resource catalog were not rewritten.

## Modes

Nine modes are enabled and pass preflight:

1. Standard Campaign
2. Timed Trial
3. Exam Drill
4. Quiz
5. Unlimited Practice
6. Legendary Mode
7. Score Attack
8. Fading Fortune
9. Risk & Reward

Trial by Graph is deliberately not enabled. The published Agency Protocol bank contains zero image-bearing questions.

## Shared new mode artwork

The four requested shared WebP files are wired:

- Quiz → `mode_quiz.webp`
- Unlimited Practice → `mode_unlimited.webp`
- Fading Fortune → `mode_fading.webp`
- Risk & Reward → `mode_risk.webp`

No `mode_graph.webp` reference was added.

## Quiz

- instructor/student run-length selector: 1–15 questions
- no bosses
- no artifacts
- no Directorate campaign progression
- ends cleanly in results and Mastery Report
- one-question completion path runtime-tested

## Unlimited Practice

- adaptive practice with no fixed question limit
- no bosses
- no artifacts
- no Directorate campaign progression
- End Practice control generates the Mastery Report
- student-ended completion path runtime-tested

## Fading Fortune

All 269 ordinary Agency Protocol questions are eligible.

Supported fixed lengths:

- 10
- 15
- 20

Deck generation passed at all three lengths.

The difficulty-sensitive fade timing and 100 → 75 → 50 → 25 point decay architecture is active.

## Risk & Reward

All 269 ordinary Agency Protocol questions are eligible.

Supported fixed lengths:

- 10
- 15
- 20

Deck generation passed at all three lengths.

The Engine 2.0 bankroll system is active, including wager tiers and the bust condition.

A deliberate all-in miss was runtime-tested:

- starting bankroll: 1000
- final bankroll: 0
- bust detected: yes
- run terminated: yes
- Mastery Report generated: yes

## Mastery Report 2.0

The current evidence-strength architecture is active and separates performance from evidence quantity.

The report incorporates:

- accuracy
- scored attempts
- difficulty exposure
- strongest signals
- concepts to review
- weakest question forms
- repair/bridge exposure
- mode-specific evidence
- Fading Fortune value/fade evidence
- Risk & Reward bankroll/wager evidence

Quiz, Unlimited Practice, Fading Fortune, and Risk & Reward all route into the same reporting system.

## Instructional resources

The supplied Agency Protocol instructional-resource catalog remains intact.

Coverage:

- Chapters 19–22
- 17 resources
- 23 objective mappings
- 23 objective families represented by the published bank
- 0 unmapped bank objectives

Targeted review therefore remains available for all current objective families.

## Remediation routing

The Agency Protocol already contained an explicit historical-skill alias resolver. It is preserved.

Validated examples include:

- `risk_transfer_and_pooling` → `insurance`
- `hidden_information_before_contract` → `adverse_selection`
- `metric_gaming_and_unintended_responses` → `gaming`
- `transfer_pricing_internal_trade` → `transfer_pricing`

The existing 22 repair and 22 bridge skill pools remain unchanged.

## State and hub protections

Validated:

- Standard Campaign remains the only mode allowed to complete the Agency Protocol campaign.
- practice modes cannot unlock Directorate progression
- historical hub keys remain synchronized:
  - `managerialHub_agency_started`
  - `managerialHub_agency_complete`
  - `managerialHub_agency_status`
  - `managerialHub_agency_room`
- compatibility aliases are mirrored:
  - `managerialHub_agencyProtocol_started`
  - `managerialHub_agencyProtocol_complete`
  - `managerialHub_agencyProtocol_status`
  - `managerialHub_agencyProtocol_room`
- active-state synchronization tested at Room 7
- completion synchronization tested at Room 30
- malformed cross-mode save payloads are rejected and deleted
- delayed callbacks and awaited answer resolution remain protected by the run-session guard

## Published-bank integrity

Current published package:

- primary/boss questions: 456
- repair questions: 44
- bridge questions: 44
- total authored records: 544
- ordinary practice questions: 269
- image-bearing questions: 0
- repair skills: 22
- bridge skills: 22

Every published record was checked against its SHA-256 answer hash.

Result:

- records checked: 544
- records with anything other than exactly one valid answer: 0

## Boss/artifact preservation

The upgrade preserves the Agency Protocol-specific campaign identity:

- Underwriter of Hidden Risk
- Auditor of Moral Hazard
- The Principal
- Red Ledger
- Glass Lens
- Incentive Algorithm
- Principal guide-to-final-boss reveal
- existing boss scaffolds
- local telemetry/CSV export
- rapid-guess protection
- sound and visual system

A Room 10 boss victory was runtime-tested and correctly unlocked the Red Ledger.

## Deployment

Replace only:

`play/managerial-intelligence-directorate/agency-protocol/index.html`

with the upgraded HTML.

Leave the current production copies of these in place:

- `agency_protocol_question_bank_student.js`
- `instructional_resources.js`
- `resources/`
- bosses
- artifacts
- backgrounds
- audio
- existing mode artwork
- the four shared new WebP files

## Validation status

Passed:

- upgraded inline JavaScript syntax
- published question-bank JavaScript syntax
- instructional-resource JavaScript syntax
- all nine enabled mode preflights
- all nine enabled mode runtime launches
- Fading Fortune 10/15/20 deck generation
- Risk & Reward 10/15/20 deck generation
- Quiz completion
- Unlimited Practice manual ending
- Risk & Reward bust handling
- Risk & Reward Mastery Report
- Room 10 artifact unlock
- hub active/completion synchronization
- mismatched-save rejection
- 544/544 published answer-hash verification

Final deployment still deserves the normal real-browser click/touch, sound, mobile, and resource-link pass.
