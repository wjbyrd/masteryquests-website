# The Market Signal — Engine 2.0 Upgrade Audit

Date: 2026-08-15

## Upgrade scope

- Engine chassis: production-tested Managerial Engine 2.0 build already exercised in The Cost Directive.
- Preserved Market identity: Principal, Capital Arbiter, Risk Oracle, Signal Architect, Capital Key, Risk Prism, Market Map, market-specific areas, final Signal Architect entrance, external student bank, local telemetry/CSV, and instructional review catalog.
- Enabled modes: Standard Campaign, Timed Trial, Exam Drill, Quiz, Unlimited Practice, Legendary, Score Attack, Trial by Graph, Fading Fortune, and Risk & Reward.

## Bank inventory

- Main/boss records: 620
- Pool counts: {"easy": 91, "easyBoss": 15, "elite": 93, "finalBoss": 30, "hard": 93, "legendary": 93, "legendaryBoss": 91, "medium": 93, "mediumBoss": 21}
- Repair skill keys: 26
- Bridge skill keys: 26
- Repair pool sizes present: [2, 4]
- Bridge pool sizes present: [2, 4]

## Fixed-mode pools

- Trial by Graph allowlist: 58 audited graph-linked questions
- Trial by Graph eligible non-boss deck: 39 questions (enough for 10, 15, and 20-question runs)
- Fading Fortune: 240 curated questions
- Risk & Reward: 420 curated questions

## Trial by Graph

The July 2026 Market Signal deep audit reviewed all 58 graph-linked questions against the supplied diagrams and found no graph answer-key correction. This Engine 2.0 build marks those audited image-linked records as `graphRequired` at runtime and supplies accessibility metadata for the three existing graph assets:

- demand_supply.png
- demand_supply_two.png
- long_run_competition.png

The published bank itself is not rewritten.

## Adaptive repair routing

Market Signal historically contained primarySkill values that were not mapped to remediation pools even though the same records carried valid repairSkill values. This build resolves the primary skill only when it has a real repair/bridge pool; otherwise it uses a mapped repairSkill before inference/fallback.

## LO9.6

The bank contains 32 records tagged LO9.6. The supplied official Market Signal learning-objective document ends at LO9.5. This build does not invent a formal LO9.6 description and does not silently retag those questions. It leaves `LO9.6` visible as the bank taxonomy. The review router can still fall back to Chapter 9 resources. A faculty-source taxonomy decision remains separate from this engine migration.

## Progression contract

- Standard Campaign alone writes mission progression and artifact completion.
- Primary Directorate keys: `managerialHub_marketSignal_*`.
- Historical compatibility aliases: `managerialHub_market_*`.
- Practice and challenge modes do not unlock Strategy Desk.
- Save loading validates the requested mode before restoring a payload.

## Deployment

Place the upgraded HTML as `index.html` beside the existing Market Signal production assets, `market_signal_question_bank_student.js`, `instructional_resources.js`, and `resources/` directory.

## Live acceptance checks

1. Standard fresh run, save/resume, all three bosses, all three artifacts.
2. Standard completion -> Directorate hub -> Strategy Desk unlock.
3. Timed, Exam, Quiz, Unlimited, Legendary, Score Attack full launch/return cycles.
4. Fading Fortune and Risk & Reward at 10/15/20 questions.
5. Trial by Graph at 10/15/20 questions, graph lightbox, and pause/resume behavior.
6. Weak Chapter 5, 8, 9, and 17 evidence -> targeted review links.
7. LO9.6 weakness -> valid Chapter 9 fallback review instead of a dead recommendation.
8. Mobile layout and local telemetry CSV.

## Automated validation completed

- Inline Engine 2.0 JavaScript syntax: PASS.
- Published Market Signal question-bank JavaScript syntax: PASS.
- Instructional-resource JavaScript syntax: PASS.
- Mode preflight: PASS for all 10 modes.
- Runtime launch smoke: PASS for Standard, Timed, Exam Drill, Quiz, Unlimited Practice, Legendary, Score Attack, Fading Fortune, Risk & Reward, and Trial by Graph.
- Trial by Graph setup launch: PASS with a 10-question deck and graph-linked current question.
- Fading Fortune setup launch: PASS with a 10-question deck.
- Risk & Reward setup launch: PASS with a 10-question deck.
- Candidate inventories: 39 graph-eligible, 240 Fading Fortune, 420 Risk & Reward.
- Instructional review routing: PASS for LO8.3 direct recommendations and LO9.6 Chapter 9 fallback recommendations.
- Unmapped primarySkill fallback: verified question 2006 routes to mapped repairSkill `cost_of_capital_npv`.
- Directorate progression alias sync: PASS for active and completed Market Signal state.
- Save-mode mismatch rejection: PASS; a Legendary payload under the Standard key is rejected and removed.
- Risk & Reward local telemetry fields/version: PASS.
