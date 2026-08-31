# Question Quality Audit

Generated: 2026-08-31T14:59:21.454Z

## Scope

- Concepts: scarcity-and-tradeoffs, opportunity-cost, production-possibilities-frontier, marginal-analysis, incentives, models-and-assumptions
- Pools: all pools
- Pool inventory: boss, bridge, calculation, easy, elite, hard, legendary, legendaryBoss, medium, repair, repairSeed
- Unique questions inspected: 563
- Library: phase6.2i-oligopoly-rich-bank-v1-costs-graph-v2-pc-graph-v2-monopoly-graph-v2-mcomp-graph-v2-elasticity-graph-v2-trade-graph-v2-phase6.3-targeted-production-repair-v1-phase6.4-graph-accessibility-v1-phase7.1-scarcity-standalone-expansion-v1-phase7.2-opportunity-cost-standalone-expansion-v1-phase7.3-marginal-analysis-standalone-expansion-v1-phase7.4-incentives-standalone-expansion-v1-phase7.5-comparative-advantage-gains-trade-standalone-expansion-v1-phase7.6-models-assumptions-light-touch-pilot-v1-phase7.7-general-economics-final-maturation-v1-phaseM2a-phillips-disinflation-family-maturation-v1-phaseM2b1-gdp-national-output-family-maturation-v1-phaseM2b2-inflation-real-values-family-maturation-v1-phaseM2b3-growth-productivity-family-maturation-v1-phaseM2b4-unemployment-labor-family-maturation-v1-phaseM2c1-money-banking-fed-family-maturation-v1-phaseM2c2-money-growth-inflation-neutrality-family-maturation-v1-phaseM2c3-money-market-policy-transmission-family-maturation-v1-phaseM2d1-ad-as-macro-equilibrium-family-maturation-v1-phaseM2d2-fiscal-stabilization-family-maturation-v1-phaseM2d3-stabilization-block-closure-v1-phaseM2e-advanced-macro-checkpoint-supplement-v1-phaseM4-final-macro-release-closure-v1-phaseMicro1-elasticity-granularity-pilot-v1-phaseMicro2-surplus-granularity-v1-phaseMicro3-trade-granularity-v1-phaseMicro3a-adaptive-depth-backfill-v1-phaseMicro3b-adaptive-support-backfill-v1-phaseMicro4-costs-granularity-adaptive-backfill-v1-phaseMicro5-perfect-competition-granularity-adaptive-backfill-v1-phaseMicro6-monopoly-granularity-adaptive-backfill-v1-phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1-phaseMicro8-oligopoly-granularity-adaptive-backfill-v1-phaseQH1-question-independence-graph-hygiene-v1-phaseGraph1-demand-supply-core-v1-phaseGraph2-price-controls-taxes-v1-phaseGraph3-macro-ad-as-core-v1-phaseGraph4-money-market-ad-transmission-v1-phaseGraphAudit-remediation-v1-phaseMicroGraphAudit-remediation-v1-phaseTrialGraph-mode8-v1-phaseQH2-question-quality-remediation-v1-phase3e-market-gate-graph-sync-v1-phase-public-goods-common-resources-question-pool-v1-phase-externalities-question-pool-v1-phase-factor-markets-question-pool-v1-phase-remaining-principles-micro-question-pools-v1-phase-macro-federal-budgets-debt-v1-phase-saving-investment-loanable-funds-question-pool-v1-phaseQH3-core-question-quality-gate-v1-phaseQH4-supply-demand-equilibrium-audit-remediation-v1
- Library SHA-256: 1f3430d726edecd481b79c0c0659d037abdf12e40bee1be9a82b7c3fe8e82e91

## Summary

- ERROR: 5
- WARNING: 86
- REVIEW: 84
- Total findings: 175
- Unique questions affected: 153
- Questions with multiple findings: 20

ERROR means a deterministic defect. WARNING means a strong machine-detectable reason to inspect. REVIEW requires semantic or pedagogical judgment.

## Rule counts

| Severity | Rule | Count |
|---|---|---:|
| ERROR | invalid-answer-key | 5 |
| REVIEW | answer-length-outlier | 1 |
| REVIEW | graph-evidence-redundant-in-stem | 7 |
| REVIEW | near-duplicate-stem | 2 |
| REVIEW | possible-difficulty-overstatement | 1 |
| REVIEW | stem-answer-redundancy | 1 |
| REVIEW | weak-absolute-distractors | 72 |
| WARNING | graph-prompt-missing-cue | 6 |
| WARNING | image-without-graph-required | 23 |
| WARNING | repeated-feedback | 57 |

## Findings by concept

| Concept | Findings |
|---|---:|
| models-and-assumptions | 62 |
| production-possibilities-frontier | 54 |
| incentives | 23 |
| opportunity-cost | 14 |
| scarcity-and-tradeoffs | 13 |
| marginal-analysis | 9 |

## Findings by pool

| Pool | Findings |
|---|---:|
| legendary | 34 |
| medium | 22 |
| hard | 20 |
| repair | 20 |
| boss | 18 |
| easy | 16 |
| calculation | 14 |
| elite | 12 |
| legendaryBoss | 9 |
| bridge | 8 |
| repairSeed | 2 |

## Questions with multiple findings

| Question | Concept | Pools | Findings | Rules |
|---|---|---|---:|---|
| ECON-MG-HARD-250 | production-possibilities-frontier | calculation | 3 | graph-evidence-redundant-in-stem, image-without-graph-required, near-duplicate-stem |
| ECON-MG-HARD-251 | production-possibilities-frontier | calculation | 3 | graph-evidence-redundant-in-stem, image-without-graph-required, near-duplicate-stem |
| 40005 | production-possibilities-frontier | legendary | 2 | graph-prompt-missing-cue, weak-absolute-distractors |
| ECON-EC-LEGENDARY-14007 | production-possibilities-frontier | legendary | 2 | graph-evidence-redundant-in-stem, image-without-graph-required |
| ECON-MG-HARD-252 | production-possibilities-frontier | calculation | 2 | graph-evidence-redundant-in-stem, image-without-graph-required |
| ECON-MG-HARD-254 | production-possibilities-frontier | hard | 2 | image-without-graph-required, possible-difficulty-overstatement |
| ECON-MG-HARD-255 | production-possibilities-frontier | calculation | 2 | graph-evidence-redundant-in-stem, image-without-graph-required |
| ECON-MG-LEGENDARY-9000 | production-possibilities-frontier | legendary | 2 | graph-evidence-redundant-in-stem, image-without-graph-required |
| ECON-MG-LEGENDARY-9002 | production-possibilities-frontier | legendary | 2 | graph-evidence-redundant-in-stem, image-without-graph-required |
| ECON-MG-MEDIUM-150 | production-possibilities-frontier | medium | 2 | image-without-graph-required, weak-absolute-distractors |
| ECON-MG-MEDIUM-157 | production-possibilities-frontier | medium | 2 | image-without-graph-required, weak-absolute-distractors |
| P52B-MODL-E-002 | models-and-assumptions | easy | 2 | repeated-feedback, weak-absolute-distractors |
| P52B-MODL-EL-001 | models-and-assumptions | elite | 2 | repeated-feedback, weak-absolute-distractors |
| P76-MODL-EL-003 | models-and-assumptions | elite | 2 | repeated-feedback, weak-absolute-distractors |
| P76-MODL-FB-003 | models-and-assumptions | boss | 2 | repeated-feedback, weak-absolute-distractors |
| P76-MODL-H-005 | models-and-assumptions | hard | 2 | repeated-feedback, weak-absolute-distractors |
| P76-MODL-L-009 | models-and-assumptions | legendary | 2 | repeated-feedback, weak-absolute-distractors |
| P76-MODL-L-012 | models-and-assumptions | legendary | 2 | repeated-feedback, weak-absolute-distractors |
| P76-MODL-R-003 | models-and-assumptions | repair | 2 | repeated-feedback, weak-absolute-distractors |
| P76-MODL-R-004 | models-and-assumptions | repair | 2 | repeated-feedback, weak-absolute-distractors |

## Findings

### ERROR — P74-INC-H-010 — invalid-answer-key

- Concept: incentives
- Pools: hard
- Current wording: A police department rewards citation counts. Citations rise, public trust falls, and serious-case work receives less time. Which conclusion is warranted?
- Reason: The keyed answer matches 0 options; exactly one is required.

### ERROR — P74-INC-L-015 — invalid-answer-key

- Concept: incentives
- Pools: legendary
- Current wording: A charity matches the first $100 of each donation. A donor planning to give $300 still gives $300. How should the match be evaluated for that donor?
- Reason: The keyed answer matches 0 options; exactly one is required.

### ERROR — ECON-MG-MEDIUM-100 — invalid-answer-key

- Concept: opportunity-cost
- Pools: medium
- Current wording: A laboratory assistant works an extra Saturday shift and gives up a study group that would improve preparation for a licensing exam. Which interpretation is best?
- Reason: The keyed answer matches 0 options; exactly one is required.

### ERROR — P72-OPPC-H-009 — invalid-answer-key

- Concept: opportunity-cost
- Pools: hard
- Current wording: A government funds a coastal barrier valued at $30 million. The same engineers could instead complete a water system valued at $34 million or road repairs valued at $21 million. Which statement is correct?
- Reason: The keyed answer matches 0 options; exactly one is required.

### ERROR — P71-SCAR-LB-004 — invalid-answer-key

- Concept: scarcity-and-tradeoffs
- Pools: legendaryBoss
- Current wording: A high-income country postpones either hospital upgrades or rail expansion because both require the same engineers. Which statement best explains why scarcity persists?
- Reason: The keyed answer matches 0 options; exactly one is required.

### WARNING — ECON-MG-EASY-18 — repeated-feedback

- Concept: models-and-assumptions
- Pools: easy
- Current wording: A household-choice model omits brand colors and store music. Why can it still help explain how price affects purchases?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — ECON-MG-EASY-19 — repeated-feedback

- Concept: models-and-assumptions
- Pools: easy
- Current wording: An economist studying commute time assumes gasoline prices stay unchanged. What is that assumption doing?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — ECON-MG-LEGENDARY-9080 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: A local haircut model omits exchange rates and global shipping. What is the best evaluation of that omission?
- Reason: Identical feedback is reused across 8 distinct questions.

### WARNING — P52B-MODL-BR-001 — repeated-feedback

- Concept: models-and-assumptions
- Pools: bridge
- Current wording: A demand model predicts fewer purchases after a price increase. What connects model limits to positive analysis?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P52B-MODL-E-001 — repeated-feedback

- Concept: models-and-assumptions
- Pools: easy
- Current wording: A manager uses a two-factor model of sales rather than listing every detail of the store. Why?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P52B-MODL-E-002 — repeated-feedback

- Concept: models-and-assumptions
- Pools: easy
- Current wording: An economist studies how price affects purchases while holding income constant. Why hold income constant?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P52B-MODL-EL-001 — repeated-feedback

- Concept: models-and-assumptions
- Pools: elite
- Current wording: A model uses an unrealistic assumption but predicts well in a narrow setting. What is the strongest evaluation?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P52B-MODL-R-001 — repeated-feedback

- Concept: models-and-assumptions
- Pools: repair
- Current wording: What role does an assumption play in a model?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P52B-MODL-R-002 — repeated-feedback

- Concept: models-and-assumptions
- Pools: repair
- Current wording: Must a model be rejected because it simplifies reality?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-BR-002 — repeated-feedback

- Concept: models-and-assumptions
- Pools: bridge
- Current wording: A supply-and-demand model holds buyer income fixed. Which bridge connects the model to ceteris paribus?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-BR-003 — repeated-feedback

- Concept: models-and-assumptions
- Pools: bridge
- Current wording: A policy model predicts lower emissions after a fee. How does model reasoning connect to policy analysis?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-E-005 — repeated-feedback

- Concept: models-and-assumptions
- Pools: easy
- Current wording: A restaurant model tracks price and customer traffic but omits wall color. When is that simplification useful?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-E-006 — repeated-feedback

- Concept: models-and-assumptions
- Pools: easy
- Current wording: A model is best understood as:
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-E-007 — repeated-feedback

- Concept: models-and-assumptions
- Pools: easy
- Current wording: A bus-demand study asks what happens when fares rise, with service unchanged. Which condition is an assumption?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-E-008 — repeated-feedback

- Concept: models-and-assumptions
- Pools: easy
- Current wording: Which question is a simple supply-and-demand model designed to address?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P76-MODL-EB-001 — repeated-feedback

- Concept: models-and-assumptions
- Pools: boss
- Current wording: Why can a map-like economic model omit many details?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P76-MODL-EB-002 — repeated-feedback

- Concept: models-and-assumptions
- Pools: boss
- Current wording: A study holds population constant while examining income and sales. What is population here?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-EB-003 — repeated-feedback

- Concept: models-and-assumptions
- Pools: boss
- Current wording: Which statement best distinguishes a model from reality?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-EL-003 — repeated-feedback

- Concept: models-and-assumptions
- Pools: elite
- Current wording: A complex model predicts purchases accurately, while a simpler model identifies a price mechanism. Which choice is best?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P76-MODL-EL-004 — repeated-feedback

- Concept: models-and-assumptions
- Pools: elite
- Current wording: A model predicts policy outcomes accurately in several cities, but its proposed mechanism was never measured. What follows?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P76-MODL-FB-001 — repeated-feedback

- Concept: models-and-assumptions
- Pools: boss
- Current wording: Two models fit past data, but only one predicts behavior after a new fee. What evidence best separates them?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P76-MODL-FB-002 — repeated-feedback

- Concept: models-and-assumptions
- Pools: boss
- Current wording: A policy conclusion disappears when one plausible assumption changes. What is the strongest evaluation?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-FB-003 — repeated-feedback

- Concept: models-and-assumptions
- Pools: boss
- Current wording: A larger model fits old data better but predicts new data worse. What does this show?
- Reason: Identical feedback is reused across 5 distinct questions.

### WARNING — P76-MODL-H-005 — repeated-feedback

- Concept: models-and-assumptions
- Pools: hard
- Current wording: A housing model estimated where construction is flexible is applied where zoning is strict. What is the central concern?
- Reason: Identical feedback is reused across 8 distinct questions.

### WARNING — P76-MODL-H-006 — repeated-feedback

- Concept: models-and-assumptions
- Pools: hard
- Current wording: Two labor models fit past employment equally well. One predicts a wage rule raises jobs; the other predicts a decline. What evidence is most useful?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P76-MODL-H-007 — repeated-feedback

- Concept: models-and-assumptions
- Pools: hard
- Current wording: Adding dozens of variables improves historical fit but makes the mechanism impossible to interpret. What tradeoff appears?
- Reason: Identical feedback is reused across 5 distinct questions.

### WARNING — P76-MODL-H-008 — repeated-feedback

- Concept: models-and-assumptions
- Pools: hard
- Current wording: A transit model worked before remote work became common but now overpredicts commuting. What should be reconsidered?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-L-005 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: During a pandemic, a model based on stable workplace commuting badly misses travel demand. What is the best diagnosis?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-L-006 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: An online-shopping model estimated before smartphones underpredicts impulse purchases after app alerts spread. What should change?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-L-007 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: A rent model assumes landlords can adjust units quickly. In a city with long permit delays, which conclusion is strongest?
- Reason: Identical feedback is reused across 8 distinct questions.

### WARNING — P76-MODL-L-008 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: Two energy models fit normal years. One includes storage constraints and predicts a price spike after a pipeline break. What is the best test?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P76-MODL-L-009 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: A classroom market experiment predicts rapid price convergence, but a real market has search costs and long contracts. What follows?
- Reason: Identical feedback is reused across 8 distinct questions.

### WARNING — P76-MODL-L-010 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: A credit model fits defaults well but uses a proxy unrelated to the claimed borrower mechanism. What is justified?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P76-MODL-L-011 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: A policy result reverses when a plausible behavioral assumption changes slightly. How should it be reported?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-L-012 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: A detailed firm model improves forecasts slightly but requires costly data unavailable to decision-makers. Which model may be preferable?
- Reason: Identical feedback is reused across 5 distinct questions.

### WARNING — P76-MODL-L-013 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: A central bank changes its policy rule, and a forecasting relationship estimated under the old rule breaks down. What lesson applies?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-LB-004 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendaryBoss
- Current wording: A labor model built where unions are rare is transferred to a heavily unionized market. What is the decisive review?
- Reason: Identical feedback is reused across 8 distinct questions.

### WARNING — P76-MODL-LB-005 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendaryBoss
- Current wording: A forecasting model fits every historical recession but offers no evidence for its claimed credit mechanism. What can be concluded?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P76-MODL-LB-006 — repeated-feedback

- Concept: models-and-assumptions
- Pools: legendaryBoss
- Current wording: Adding detailed behavior improves a model slightly but makes results highly sensitive to uncertain parameters. What is the best choice?
- Reason: Identical feedback is reused across 5 distinct questions.

### WARNING — P76-MODL-M-005 — repeated-feedback

- Concept: models-and-assumptions
- Pools: medium
- Current wording: A wage model assumes workers can change jobs easily, but licenses block movement. What should the analyst do?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-M-006 — repeated-feedback

- Concept: models-and-assumptions
- Pools: medium
- Current wording: A household model predicts spending from income, but families also face new credit limits. Why might the prediction change?
- Reason: Identical feedback is reused across 8 distinct questions.

### WARNING — P76-MODL-M-007 — repeated-feedback

- Concept: models-and-assumptions
- Pools: medium
- Current wording: One inflation model studies demand pressure; another studies supply disruptions. Which should be used after an energy shock?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P76-MODL-M-008 — repeated-feedback

- Concept: models-and-assumptions
- Pools: medium
- Current wording: A policy model misses one month of data but explains the broader pattern. What is the best response?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-MB-001 — repeated-feedback

- Concept: models-and-assumptions
- Pools: boss
- Current wording: A restaurant-demand model assumes nearby competitors stay open, but two close. What should happen to the forecast?
- Reason: Identical feedback is reused across 20 distinct questions.

### WARNING — P76-MODL-MB-002 — repeated-feedback

- Concept: models-and-assumptions
- Pools: boss
- Current wording: One model explains short-run layoffs; another explains long-run hiring. How should a firm choose?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P76-MODL-MB-003 — repeated-feedback

- Concept: models-and-assumptions
- Pools: boss
- Current wording: A model predicts well in rural areas but not dense cities. What is the first question to ask?
- Reason: Identical feedback is reused across 8 distinct questions.

### WARNING — P76-MODL-R-003 — repeated-feedback

- Concept: models-and-assumptions
- Pools: repair
- Current wording: Does adding more detail automatically improve a model?
- Reason: Identical feedback is reused across 5 distinct questions.

### WARNING — P76-MODL-R-004 — repeated-feedback

- Concept: models-and-assumptions
- Pools: repair
- Current wording: A prediction assumes income stays fixed. What if income changes?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P76-MODL-R-005 — repeated-feedback

- Concept: models-and-assumptions
- Pools: repair
- Current wording: A model fit past data well. Does that prove its proposed mechanism?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P76-MODL-R-006 — repeated-feedback

- Concept: models-and-assumptions
- Pools: repair
- Current wording: When should a model be applied to a new setting?
- Reason: Identical feedback is reused across 8 distinct questions.

### WARNING — 40000 — graph-prompt-missing-cue

- Concept: production-possibilities-frontier
- Pools: medium
- Current wording: Moving from A to B, what is the opportunity cost per additional pizza?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 40001 — graph-prompt-missing-cue

- Concept: production-possibilities-frontier
- Pools: hard
- Current wording: As production moves farther right along bowed PPF0, what happens to the opportunity cost of additional pizzas?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 40002 — graph-prompt-missing-cue

- Concept: production-possibilities-frontier
- Pools: elite
- Current wording: Which proposed change would require greater productive capacity rather than reallocation along PPF0?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 40003 — graph-prompt-missing-cue

- Concept: production-possibilities-frontier
- Pools: hard
- Current wording: On PPF0, moving from A to B gains 20 burgers. What is the opportunity cost per additional burger?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 40004 — graph-prompt-missing-cue

- Concept: production-possibilities-frontier
- Pools: elite
- Current wording: Which statement correctly distinguishes A to B from PPF0 to PPF1?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 40005 — graph-prompt-missing-cue

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: What can the outward shift establish without knowing society's preferences?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — ECON-EC-LEGENDARY-14007 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to a bowed-out PPF. Moving from point A to B costs 4 units of Y for 5 units of X. Moving from D to E costs 14 units of Y for 5 units of X. What is the best interpretation?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-HARD-250 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from A to B increases Good X by 8 units and reduces Good Y by 5 units. What is the opportunity cost per additional unit of Good X?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-HARD-251 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from B to C increases Good X by 7 units and reduces Good Y by 10 units. What is the opportunity cost per additional unit of Good X?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-HARD-252 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from D to E increases Good X by 4 units and reduces Good Y by 20 units. What is the opportunity cost per additional unit of Good X?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-HARD-253 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: hard
- Current wording: Refer to the PPF graph. Which move has the highest opportunity cost per additional unit of Good X?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-HARD-254 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: hard
- Current wording: Refer to the PPF graph. What pattern is shown by the opportunity cost of Good X as the economy moves from A toward E?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-HARD-255 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from E to D means gaining 20 units of Good Y while giving up 4 units of Good X. What is the opportunity cost per additional unit of Good Y?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-HARD-256 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: hard
- Current wording: Refer to the PPF graph. If the economy is at F and moves to B, what happens?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-HARD-257 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: hard
- Current wording: Refer to the PPF graph. If the economy moves from F to C, what best describes the change?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-LEGENDARY-9000 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to the PPF graph. A move from B to C changes production from about 8 X and 45 Y to 15 X and 35 Y. Which answer best states the tradeoff?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-LEGENDARY-9001 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to the PPF graph. Which statement best compares points F and G?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-LEGENDARY-9002 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to the PPF graph. A move from C to D increases Good X from 15 to 21 while Good Y falls from 35 to 20. What is the opportunity cost per additional X?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-LEGENDARY-9003 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to the PPF graph. If the economy is at F, which move most directly shows improved use of currently idle resources rather than economic growth?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-LEGENDARY-9004 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to the PPF graph. Why does the opportunity cost of Good X rise as production moves from A toward E?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-MEDIUM-150 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: medium
- Current wording: Refer to the PPF graph. Which points are efficient production points?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-MEDIUM-151 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: medium
- Current wording: Refer to the PPF graph. Which point is attainable but inefficient?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-MEDIUM-152 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: medium
- Current wording: Refer to the PPF graph. Which point is currently unattainable?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-MEDIUM-153 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from B to C increases production of Good X by how many units?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-MEDIUM-154 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from B to C requires giving up how many units of Good Y?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-MEDIUM-155 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. What is the opportunity cost of moving from C to D?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-MEDIUM-156 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. What is the opportunity cost per additional unit of Good X when moving from C to D?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-MEDIUM-157 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: medium
- Current wording: Refer to the PPF graph. What does the bowed-out shape of the PPF suggest?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-MEDIUM-158 — image-without-graph-required

- Concept: production-possibilities-frontier
- Pools: medium
- Current wording: Refer to the PPF graph. If the economy moves from F to C, what has happened?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — ECON-MG-PPF-OPPORTUNITY-COST-5011 — repeated-feedback

- Concept: production-possibilities-frontier
- Pools: repair
- Current wording: An economy moves from inside its PPF to the frontier without new resources. What changed?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P77-PPF-LB-006 — repeated-feedback

- Concept: production-possibilities-frontier
- Pools: legendaryBoss
- Current wording: A new technology improves only medical production. How should the PPF change?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P77-PPF-LB-007 — repeated-feedback

- Concept: production-possibilities-frontier
- Pools: legendaryBoss
- Current wording: An economy first removes unemployment, then gains new machinery. Which sequence is correct?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P77-PPF-R-002 — repeated-feedback

- Concept: production-possibilities-frontier
- Pools: repair
- Current wording: Is a point inside the PPF unattainable?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P77-PPF-R-003 — repeated-feedback

- Concept: production-possibilities-frontier
- Pools: repair
- Current wording: Does moving along a PPF represent economic growth?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P77-PPF-R-004 — repeated-feedback

- Concept: production-possibilities-frontier
- Pools: repair
- Current wording: What shifts a PPF outward?
- Reason: Identical feedback is reused across 7 distinct questions.

### WARNING — P77-PPF-R-005 — repeated-feedback

- Concept: production-possibilities-frontier
- Pools: repair
- Current wording: Why can opportunity cost rise along a bowed-out PPF?
- Reason: Identical feedback is reused across 7 distinct questions.

### REVIEW — ECON-MG-CORE-INCENTIVES-30005 — answer-length-outlier

- Concept: incentives
- Pools: repairSeed
- Current wording: Which definition best captures an economic incentive?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — ECON-MG-EASY-9 — weak-absolute-distractors

- Concept: incentives
- Pools: easy
- Current wording: Gas prices rise and more consumers buy fuel-efficient cars. What principle does this show?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-EASYBOSS-2006 — weak-absolute-distractors

- Concept: incentives
- Pools: boss
- Current wording: A café doubles loyalty points for visits before 9 a.m. Which response would economic reasoning most directly predict?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-LEGENDARYBOSS-9110 — weak-absolute-distractors

- Concept: incentives
- Pools: legendaryBoss
- Current wording: A sales bonus pays only when quarterly revenue exceeds $1 million. A team at $990,000 moves several legitimate January sales into December. What does the episode demonstrate?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-LEGENDARYBOSS-9111 — weak-absolute-distractors

- Concept: incentives
- Pools: legendaryBoss
- Current wording: An unemployment program replaces 80% of lost wages for the first month and 35% thereafter. Which prediction is most defensible, holding other factors constant?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-INC-B2-002 — weak-absolute-distractors

- Concept: incentives
- Pools: boss
- Current wording: A fee changes behavior for some people but not others. What is the best explanation?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-INC-EL-002 — weak-absolute-distractors

- Concept: incentives
- Pools: elite
- Current wording: Why can a small probability of a severe penalty sometimes have little deterrent effect?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-BR-005 — weak-absolute-distractors

- Concept: incentives
- Pools: bridge
- Current wording: A policy aims to reduce congestion but rewards agencies only for bus tickets sold. What lesson connects incentives to policy design?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-EL-003 — weak-absolute-distractors

- Concept: incentives
- Pools: elite
- Current wording: A nonprofit grant rewards clients placed in jobs for 30 days. Providers avoid applicants needing intensive support and favor easy placements. Which redesign best preserves effort while limiting selection?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-EL-004 — weak-absolute-distractors

- Concept: incentives
- Pools: elite
- Current wording: An energy plan combines a peak-hour surcharge, a monthly conservation badge, and a rebate for smart thermostats. Which analysis is strongest?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-H-005 — weak-absolute-distractors

- Concept: incentives
- Pools: hard
- Current wording: A hospital is paid for each procedure but penalized for readmissions. Which response best reflects both incentives?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-L-011 — weak-absolute-distractors

- Concept: incentives
- Pools: legendary
- Current wording: A city pays restaurants for each kilogram of food donated. Donations rise, but some restaurants overproduce near closing time. What does this show?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-L-027 — weak-absolute-distractors

- Concept: incentives
- Pools: legendary
- Current wording: A criminal fine is tripled while the probability of detection falls by two-thirds. Without more information, what can be concluded?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-LB-005 — weak-absolute-distractors

- Concept: incentives
- Pools: legendaryBoss
- Current wording: Two households face the same $50 peak-energy surcharge. One shifts appliance use; the other has medical equipment that must run continuously. What should the analyst infer?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-M-005 — weak-absolute-distractors

- Concept: incentives
- Pools: medium
- Current wording: A warehouse pays a bonus for packages shipped per hour but charges workers for verified damage. What response is most plausible?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-M-006 — weak-absolute-distractors

- Concept: incentives
- Pools: medium
- Current wording: A parking fine doubles, but patrols become rare. Why might violations change little?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-M-007 — weak-absolute-distractors

- Concept: incentives
- Pools: medium
- Current wording: Two employees receive the same attendance bonus. One changes her schedule; the other has caregiving duties and cannot. What does this show?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-M-009 — weak-absolute-distractors

- Concept: incentives
- Pools: medium
- Current wording: A company offers either a $40 bonus or public recognition for completing training. Some workers value one more than the other. What follows?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-R-003 — weak-absolute-distractors

- Concept: incentives
- Pools: repair
- Current wording: A $500 attendance bonus is offered, but an employee misses work during a medical emergency. Was the bonus still an incentive?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-R-004 — weak-absolute-distractors

- Concept: incentives
- Pools: repair
- Current wording: An economist says a fine creates an incentive to avoid an action. Does that statement approve of the fine?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P74-INC-R-006 — weak-absolute-distractors

- Concept: incentives
- Pools: repair
- Current wording: A school gives public recognition rather than cash for attendance. Can recognition be an incentive?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-EASYBOSS-2003 — weak-absolute-distractors

- Concept: marginal-analysis
- Pools: boss
- Current wording: A nurse can make one more follow-up call. The expected patient benefit is 12 points and the fatigue cost is 8 points. What should the nurse do?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-EASYBOSS-2004 — weak-absolute-distractors

- Concept: marginal-analysis
- Pools: boss
- Current wording: A grocer can stock one more crate. Expected sales margin is $45, spoilage risk costs $12, and shelf labor costs $18. What should the grocer do?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-EASYBOSS-2005 — weak-absolute-distractors

- Concept: marginal-analysis
- Pools: boss
- Current wording: A vendor already spent 100 tokens setting up a stall. Staying open one more hour costs 12 tokens and brings in 20 tokens. What should matter now?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-MEDIUM-101 — weak-absolute-distractors

- Concept: marginal-analysis
- Pools: medium
- Current wording: A business owner already spent $2,000 on a project. Finishing the project costs another $500 and will bring in $800. What should matter for the decision?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52A-MARG-B3-001 — weak-absolute-distractors

- Concept: marginal-analysis
- Pools: boss
- Current wording: MB values for units 1 through 4 are 30, 22, 14, and 8; MC values are 10, 16, 15, and 12. Which production plan is optimal?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52A-MARG-BR-002 — weak-absolute-distractors

- Concept: marginal-analysis
- Pools: bridge
- Current wording: A worker could earn $25 during one more study hour. How does opportunity cost enter the marginal study decision?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P73-MARG-B2-004 — weak-absolute-distractors

- Concept: marginal-analysis
- Pools: boss
- Current wording: A firm's average profit is positive. The next order adds $180 in revenue and $205 in avoidable cost. What should it do?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P73-MARG-BR-004 — weak-absolute-distractors

- Concept: marginal-analysis
- Pools: bridge
- Current wording: A factory's next unit creates pollution damage not paid by the factory. How does that affect marginal analysis?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P73-MARG-E-008 — weak-absolute-distractors

- Concept: marginal-analysis
- Pools: easy
- Current wording: A clinic can treat one more patient. Which question is marginal?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-MODL-E-002 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: easy
- Current wording: An economist studies how price affects purchases while holding income constant. Why hold income constant?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-MODL-EL-001 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: elite
- Current wording: A model uses an unrealistic assumption but predicts well in a narrow setting. What is the strongest evaluation?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-MODL-H-001 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: hard
- Current wording: A model fits historical data but fails after institutions change. Which limitation is most relevant?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-MODL-H-003 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: hard
- Current wording: A highly detailed model predicts poorly because many parameters are estimated imprecisely. What does this illustrate?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-MODL-M-002 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: medium
- Current wording: Two models answer different questions about the same market. How should an economist choose between them?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P76-MODL-EL-003 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: elite
- Current wording: A complex model predicts purchases accurately, while a simpler model identifies a price mechanism. Which choice is best?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P76-MODL-FB-003 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: boss
- Current wording: A larger model fits old data better but predicts new data worse. What does this show?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P76-MODL-H-005 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: hard
- Current wording: A housing model estimated where construction is flexible is applied where zoning is strict. What is the central concern?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P76-MODL-L-009 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: A classroom market experiment predicts rapid price convergence, but a real market has search costs and long contracts. What follows?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P76-MODL-L-012 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: legendary
- Current wording: A detailed firm model improves forecasts slightly but requires costly data unavailable to decision-makers. Which model may be preferable?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P76-MODL-R-003 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: repair
- Current wording: Does adding more detail automatically improve a model?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P76-MODL-R-004 — weak-absolute-distractors

- Concept: models-and-assumptions
- Pools: repair
- Current wording: A prediction assumes income stays fixed. What if income changes?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-LEGENDARY-9011 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: legendary
- Current wording: A researcher initially gives up consulting worth $900 to spend a weekend on a paper. A new consulting request worth $1,400 then becomes available before the weekend begins. If the paper remains the choice, how does its opportunity cost change?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-LEGENDARY-9054 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: legendary
- Current wording: A popular clinic charges no appointment fee, but patients must wait four hours. A nearby clinic charges $80 with almost no wait. Which claim correctly compares the options?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52A-OPPC-E-003 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: easy
- Current wording: A parent attends a free evening class and gives up two hours of family time. Why can the class still have an opportunity cost?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52A-OPPC-H-005 — stem-answer-redundancy

- Concept: opportunity-cost
- Pools: hard
- Current wording: A worker's hourly wage rises from $20 to $32. Holding preferences constant, the opportunity cost of taking an unpaid hour off:
- Reason: The stem contains the complete correct-answer wording.

### REVIEW — P52A-OPPC-M-005 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: medium
- Current wording: A firm uses a warehouse it owns for storage instead of renting it out for $30,000 per year. The storage decision has an implicit cost of:
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P72-OPPC-BR-003 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: bridge
- Current wording: Two producers can make the same goods, but one gives up fewer shirts for each bicycle. How does opportunity cost identify comparative advantage?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P72-OPPC-BR-004 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: bridge
- Current wording: A firm considers producing one additional unit. How does opportunity cost enter a marginal decision?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P72-OPPC-EL-003 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: elite
- Current wording: A port authority has already installed specialized foundations for a terminal. It can complete the terminal for $40 million and obtain benefits of $55 million, or redirect crews to storm protection worth $22 million. Which comparison is relevant now?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P72-OPPC-H-008 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: hard
- Current wording: A one-year program charges $18,000 tuition and $2,000 for required supplies. A student gives up a $44,000 job but gains employer-independent health coverage valued at $4,000 while enrolled. Ignoring future benefits, what is the net opportunity cost?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P72-OPPC-M-007 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: medium
- Current wording: A free certification exam takes five hours. A worker would otherwise earn $25 per hour and also pays $15 for transit. Ignoring other effects, what is the opportunity cost?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P72-OPPC-R-005 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: repair
- Current wording: Why can spending an hour in a free park have an opportunity cost?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P72-OPPC-R-007 — weak-absolute-distractors

- Concept: opportunity-cost
- Pools: repair
- Current wording: An owner uses a room that could be rented to someone else. Why is the room not costless?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 40005 — weak-absolute-distractors

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: What can the outward shift establish without knowing society's preferences?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-EC-LEGENDARY-14007 — graph-evidence-redundant-in-stem

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to a bowed-out PPF. Moving from point A to B costs 4 units of Y for 5 units of X. Moving from D to E costs 14 units of Y for 5 units of X. What is the best interpretation?
- Reason: The stem appears to reproduce graph-derived values needed for the requested result, allowing the learner to bypass meaningful graph inspection.
- Suggested direction: Keep external scenario information in the stem, but remove coordinates, changes, or relationships the learner should extract from the attached graph.

### REVIEW — ECON-MG-EASY-20 — weak-absolute-distractors

- Concept: production-possibilities-frontier
- Pools: easy
- Current wording: The circular-flow model shows how dollars, goods and services, and resources move between:
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-EASY-22 — weak-absolute-distractors

- Concept: production-possibilities-frontier
- Pools: easy
- Current wording: In the simple circular-flow model, firms usually supply:
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-EASY-23 — weak-absolute-distractors

- Concept: production-possibilities-frontier
- Pools: easy
- Current wording: A production possibilities frontier shows:
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-ELITE-327 — weak-absolute-distractors

- Concept: production-possibilities-frontier
- Pools: elite
- Current wording: A country invests more in capital goods today, sacrificing consumer goods. In a PPF framework, what is the likely long-run implication?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-HARD-250 — graph-evidence-redundant-in-stem

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from A to B increases Good X by 8 units and reduces Good Y by 5 units. What is the opportunity cost per additional unit of Good X?
- Reason: The stem appears to reproduce graph-derived values needed for the requested result, allowing the learner to bypass meaningful graph inspection.
- Suggested direction: Keep external scenario information in the stem, but remove coordinates, changes, or relationships the learner should extract from the attached graph.

### REVIEW — ECON-MG-HARD-250 — near-duplicate-stem

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from A to B increases Good X by 8 units and reduces Good Y by 5 units. What is the opportunity cost per additional unit of Good X?
- Reason: Stem is 100% token-similar to ECON-MG-HARD-251. Automated comparison indicates differences in: numerical values, graph point.
- Suggested direction: Confirm that the pair tests meaningfully different reasoning rather than a trivial wording variant; the listed differences are heuristic review aids, not a redundancy verdict.

### REVIEW — ECON-MG-HARD-251 — graph-evidence-redundant-in-stem

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from B to C increases Good X by 7 units and reduces Good Y by 10 units. What is the opportunity cost per additional unit of Good X?
- Reason: The stem appears to reproduce graph-derived values needed for the requested result, allowing the learner to bypass meaningful graph inspection.
- Suggested direction: Keep external scenario information in the stem, but remove coordinates, changes, or relationships the learner should extract from the attached graph.

### REVIEW — ECON-MG-HARD-251 — near-duplicate-stem

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from B to C increases Good X by 7 units and reduces Good Y by 10 units. What is the opportunity cost per additional unit of Good X?
- Reason: Stem is 100% token-similar to ECON-MG-HARD-252. Automated comparison indicates differences in: numerical values, graph point.
- Suggested direction: Confirm that the pair tests meaningfully different reasoning rather than a trivial wording variant; the listed differences are heuristic review aids, not a redundancy verdict.

### REVIEW — ECON-MG-HARD-252 — graph-evidence-redundant-in-stem

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from D to E increases Good X by 4 units and reduces Good Y by 20 units. What is the opportunity cost per additional unit of Good X?
- Reason: The stem appears to reproduce graph-derived values needed for the requested result, allowing the learner to bypass meaningful graph inspection.
- Suggested direction: Keep external scenario information in the stem, but remove coordinates, changes, or relationships the learner should extract from the attached graph.

### REVIEW — ECON-MG-HARD-254 — possible-difficulty-overstatement

- Concept: production-possibilities-frontier
- Pools: hard
- Current wording: Refer to the PPF graph. What pattern is shown by the opportunity cost of Good X as the economy moves from A toward E?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — ECON-MG-HARD-255 — graph-evidence-redundant-in-stem

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. Moving from E to D means gaining 20 units of Good Y while giving up 4 units of Good X. What is the opportunity cost per additional unit of Good Y?
- Reason: The stem appears to reproduce graph-derived values needed for the requested result, allowing the learner to bypass meaningful graph inspection.
- Suggested direction: Keep external scenario information in the stem, but remove coordinates, changes, or relationships the learner should extract from the attached graph.

### REVIEW — ECON-MG-LEGENDARY-9000 — graph-evidence-redundant-in-stem

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to the PPF graph. A move from B to C changes production from about 8 X and 45 Y to 15 X and 35 Y. Which answer best states the tradeoff?
- Reason: The stem appears to reproduce graph-derived values needed for the requested result, allowing the learner to bypass meaningful graph inspection.
- Suggested direction: Keep external scenario information in the stem, but remove coordinates, changes, or relationships the learner should extract from the attached graph.

### REVIEW — ECON-MG-LEGENDARY-9002 — graph-evidence-redundant-in-stem

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to the PPF graph. A move from C to D increases Good X from 15 to 21 while Good Y falls from 35 to 20. What is the opportunity cost per additional X?
- Reason: The stem appears to reproduce graph-derived values needed for the requested result, allowing the learner to bypass meaningful graph inspection.
- Suggested direction: Keep external scenario information in the stem, but remove coordinates, changes, or relationships the learner should extract from the attached graph.

### REVIEW — ECON-MG-MEDIUM-150 — weak-absolute-distractors

- Concept: production-possibilities-frontier
- Pools: medium
- Current wording: Refer to the PPF graph. Which points are efficient production points?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-MEDIUM-157 — weak-absolute-distractors

- Concept: production-possibilities-frontier
- Pools: medium
- Current wording: Refer to the PPF graph. What does the bowed-out shape of the PPF suggest?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-S4-PPF-B3-002 — weak-absolute-distractors

- Concept: production-possibilities-frontier
- Pools: boss
- Current wording: Country A chooses more capital goods and fewer consumer goods today than Country B, with otherwise similar resources. What is the likely long-run implication?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-CORE-SCARCITY-30003 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: repairSeed
- Current wording: Scarcity exists because:
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52A-SCAR-E-001 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: easy
- Current wording: A wealthy city can afford more services than before, yet this year it must choose between expanding transit and replacing aging water lines. Why does scarcity remain?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52A-SCAR-L-003 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: legendary
- Current wording: An allocation rule maximizes total output but concentrates nearly all gains among a small group. Which conclusion is strongest?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52A-SCAR-L-004 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: legendary
- Current wording: A breakthrough makes desalination much cheaper, but coastal land, energy, pipelines, and environmental capacity remain limited. Which statement is best?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52A-SCAR-M-004 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: medium
- Current wording: A new technology doubles crop yields. What happens to scarcity?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P71-SCAR-H-001 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: hard
- Current wording: After a flood, a county can use its emergency fund for temporary housing or immediate levee repairs. Housing aids displaced families now; repairs reduce future risk. What must an economic analysis include?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P71-SCAR-L-002 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: legendary
- Current wording: A city can zone a waterfront parcel for housing, a flood barrier, or a public park. A developer claims housing demand makes the other uses economically irrelevant. What is the strongest response?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P71-SCAR-L-003 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: legendary
- Current wording: A hospital opens two new operating rooms but cannot hire additional anesthesiologists. Administrators announce that the capacity problem is solved. Which diagnosis is best?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P71-SCAR-L-011 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: legendary
- Current wording: A wealthy country can afford either a high-speed rail network or a major hospital modernization program sooner, but construction crews and materials cannot complete both on the same schedule. What does this show?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P71-SCAR-L-017 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: legendary
- Current wording: A parent can accept additional paid work only by reducing caregiving or rest. A colleague says no tradeoff exists because caregiving has no money price. What is the best correction?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P71-SCAR-R-001 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: repair
- Current wording: A wealthy person must choose how to use one free evening. Why can that person still face scarcity?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P71-SCAR-R-002 — weak-absolute-distractors

- Concept: scarcity-and-tradeoffs
- Pools: repair
- Current wording: A grocery store temporarily runs out of bottled water after a storm. Why is this different from scarcity?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

