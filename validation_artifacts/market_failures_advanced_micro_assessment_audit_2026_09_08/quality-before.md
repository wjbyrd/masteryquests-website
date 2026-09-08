# Question Quality Audit

Generated: 2026-09-08T17:07:31.589Z

## Scope

- Concepts: externalities, public-goods-and-common-resources, market-power
- Pools: all pools
- Pool inventory: boss, bridge, easy, elite, hard, legendary, legendaryBoss, medium, repair
- Unique questions inspected: 362
- Library: phase6.2i-oligopoly-rich-bank-v1-costs-graph-v2-pc-graph-v2-monopoly-graph-v2-mcomp-graph-v2-elasticity-graph-v2-trade-graph-v2-phase6.3-targeted-production-repair-v1-phase6.4-graph-accessibility-v1-phase7.1-scarcity-standalone-expansion-v1-phase7.2-opportunity-cost-standalone-expansion-v1-phase7.3-marginal-analysis-standalone-expansion-v1-phase7.4-incentives-standalone-expansion-v1-phase7.5-comparative-advantage-gains-trade-standalone-expansion-v1-phase7.6-models-assumptions-light-touch-pilot-v1-phase7.7-general-economics-final-maturation-v1-phaseM2a-phillips-disinflation-family-maturation-v1-phaseM2b1-gdp-national-output-family-maturation-v1-phaseM2b2-inflation-real-values-family-maturation-v1-phaseM2b3-growth-productivity-family-maturation-v1-phaseM2b4-unemployment-labor-family-maturation-v1-phaseM2c1-money-banking-fed-family-maturation-v1-phaseM2c2-money-growth-inflation-neutrality-family-maturation-v1-phaseM2c3-money-market-policy-transmission-family-maturation-v1-phaseM2d1-ad-as-macro-equilibrium-family-maturation-v1-phaseM2d2-fiscal-stabilization-family-maturation-v1-phaseM2d3-stabilization-block-closure-v1-phaseM2e-advanced-macro-checkpoint-supplement-v1-phaseM4-final-macro-release-closure-v1-phaseMicro1-elasticity-granularity-pilot-v1-phaseMicro2-surplus-granularity-v1-phaseMicro3-trade-granularity-v1-phaseMicro3a-adaptive-depth-backfill-v1-phaseMicro3b-adaptive-support-backfill-v1-phaseMicro4-costs-granularity-adaptive-backfill-v1-phaseMicro5-perfect-competition-granularity-adaptive-backfill-v1-phaseMicro6-monopoly-granularity-adaptive-backfill-v1-phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1-phaseMicro8-oligopoly-granularity-adaptive-backfill-v1-phaseQH1-question-independence-graph-hygiene-v1-phaseGraph1-demand-supply-core-v1-phaseGraph2-price-controls-taxes-v1-phaseGraph3-macro-ad-as-core-v1-phaseGraph4-money-market-ad-transmission-v1-phaseGraphAudit-remediation-v1-phaseMicroGraphAudit-remediation-v1-phaseTrialGraph-mode8-v1-phaseQH2-question-quality-remediation-v1-phase3e-market-gate-graph-sync-v1-phase-public-goods-common-resources-question-pool-v1-phase-externalities-question-pool-v1-phase-factor-markets-question-pool-v1-phase-remaining-principles-micro-question-pools-v1-phase-macro-federal-budgets-debt-v1-phase-saving-investment-loanable-funds-question-pool-v1-phaseQH3-core-question-quality-gate-v1-phaseQH4-supply-demand-equilibrium-audit-remediation-v1-phaseQH5-foundations-curation-graph-evidence-v1-phaseQH6-graph-assessment-integrity-v1-phaseQH7-principles-micro-human-read-curation-v1-phaseMacro2-taxonomy-normalization-v1-phaseMacro4-human-read-curation-v1-phaseMacroFinalCleanup-v1-phaseMacroOpenEconomy-v1
- Library SHA-256: 0cb44b95ad1e064babf5a3df750864c7dcdbbe9d03c177be31a3671383bc62d4

## Summary

- ERROR: 0
- WARNING: 59
- REVIEW: 64
- Total findings: 123
- Unique questions affected: 113
- Questions with multiple findings: 10

ERROR means a deterministic defect. WARNING means a strong machine-detectable reason to inspect. REVIEW requires semantic or pedagogical judgment.

## Rule counts

| Severity | Rule | Count |
|---|---|---:|
| REVIEW | answer-length-outlier | 17 |
| REVIEW | possible-difficulty-overstatement | 28 |
| REVIEW | possible-difficulty-understatement | 1 |
| REVIEW | weak-absolute-distractors | 18 |
| WARNING | graph-prompt-missing-cue | 48 |
| WARNING | repeated-feedback | 11 |

## Findings by concept

| Concept | Findings |
|---|---:|
| externalities | 87 |
| public-goods-and-common-resources | 32 |
| market-power | 4 |

## Findings by pool

| Pool | Findings |
|---|---:|
| medium | 38 |
| hard | 36 |
| elite | 25 |
| easy | 12 |
| legendary | 5 |
| legendaryBoss | 3 |
| repair | 3 |
| boss | 1 |
| bridge | 0 |

## Questions with multiple findings

| Question | Concept | Pools | Findings | Rules |
|---|---|---|---:|---|
| 42064 | externalities | hard | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| 42066 | externalities | elite | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| 42073 | externalities | hard | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| 42075 | externalities | elite | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| 42082 | externalities | hard | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| 42084 | externalities | elite | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| 42091 | externalities | hard | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| 42093 | externalities | elite | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| 42097 | externalities | elite | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| 42295 | public-goods-and-common-resources | hard | 2 | answer-length-outlier, weak-absolute-distractors |

## Findings

### WARNING — 42002 — graph-prompt-missing-cue

- Concept: externalities
- Pools: easy
- Current wording: If no corrective policy is adopted, how will the market quantity of fast-fashion garments compare with the socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42003 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Based on the vertical distance between the private and social curves, what is the constant marginal external effect for fast-fashion garments?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42004 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Which change in incentives would move the fast-fashion garments market toward its socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42007 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: If no corrective policy is adopted, how will the market quantity of disposable vapes compare with the socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42008 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Based on the vertical distance between the private and social curves, what is the constant marginal external effect for disposable vapes?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42009 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Which change in incentives would move the disposable vapes market toward its socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42012 — graph-prompt-missing-cue

- Concept: externalities
- Pools: easy
- Current wording: If no corrective policy is adopted, how will the market quantity of native-plant gardens compare with the socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42013 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Based on the vertical distance between the private and social curves, what is the constant marginal external effect for native-plant gardens?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42014 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Which change in incentives would move the native-plant gardens market toward its socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42017 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: If no corrective policy is adopted, how will the market quantity of public-transit rides compare with the socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42018 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Based on the vertical distance between the private and social curves, what is the constant marginal external effect for public-transit rides?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42019 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Which change in incentives would move the public-transit rides market toward its socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42022 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Which marked quantity represents the socially efficient outcome for fast-fashion garments?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42024 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: By how many million garments does the unregulated fast-fashion garments quantity differ from the socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42025 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: At the efficient quantity for fast-fashion garments, what marginal external cost is represented by the gap between the curves?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42032 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Which marked quantity represents the socially efficient outcome for disposable vapes?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42034 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: By how many thousand vapes does the unregulated disposable vapes quantity differ from the socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42035 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: At the efficient quantity for disposable vapes, what marginal external cost is represented by the gap between the curves?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42042 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Which marked quantity represents the socially efficient outcome for native-plant gardens?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42044 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: By how many gardens does the unregulated native-plant gardens quantity differ from the socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42045 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: At the efficient quantity for native-plant gardens, what marginal external benefit is represented by the gap between the curves?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42052 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: Which marked quantity represents the socially efficient outcome for public-transit rides?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42054 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: By how many thousand rides per day does the unregulated public-transit rides quantity differ from the socially efficient quantity?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42055 — graph-prompt-missing-cue

- Concept: externalities
- Pools: medium
- Current wording: At the efficient quantity for public-transit rides, what marginal external benefit is represented by the gap between the curves?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42061 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: What per-unit gap between private and social incentives must the policy internalize in the fast-fashion garments market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42064 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: After the optimal corrective tax internalizes the spillover, what quantity of fast-fashion garments is produced or consumed?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42065 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: Why does the corrected quantity of 160 million garments represent social efficiency in this market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42066 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: At the corrected fast-fashion garments quantity, which buyer-price and seller-receipt pair reflects the policy wedge?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42067 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: How does the corrective tax change private incentives in the fast-fashion garments market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42070 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: What per-unit gap between private and social incentives must the policy internalize in the disposable vapes market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42073 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: After the optimal corrective tax internalizes the spillover, what quantity of disposable vapes is produced or consumed?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42074 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: Why does the corrected quantity of 140 thousand vapes represent social efficiency in this market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42075 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: At the corrected disposable vapes quantity, which buyer-price and seller-receipt pair reflects the policy wedge?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42076 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: How does the corrective tax change private incentives in the disposable vapes market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42079 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: What per-unit gap between private and social incentives must the policy internalize in the native-plant gardens market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42082 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: After the optimal producer subsidy internalizes the spillover, what quantity of native-plant gardens is produced or consumed?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42083 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: Why does the corrected quantity of 150 gardens represent social efficiency in this market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42084 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: At the corrected native-plant gardens quantity, which buyer-price and seller-receipt pair reflects the policy wedge?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42085 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: How does the producer subsidy change private incentives in the native-plant gardens market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42088 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: What per-unit gap between private and social incentives must the policy internalize in the public-transit rides market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42091 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: After the optimal rider subsidy internalizes the spillover, what quantity of public-transit rides is produced or consumed?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42092 — graph-prompt-missing-cue

- Concept: externalities
- Pools: hard
- Current wording: Why does the corrected quantity of 200 thousand rides per day represent social efficiency in this market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42093 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: At the corrected public-transit rides quantity, which buyer-price and seller-receipt pair reflects the policy wedge?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42094 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: How does the rider subsidy change private incentives in the public-transit rides market?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42097 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: At what quantity does the $2 vaping tax leave the market after shifting the private consumption incentive?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42101 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: What percentage of the original vaping deadweight loss is removed by the $2 tax?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42102 — graph-prompt-missing-cue

- Concept: externalities
- Pools: elite
- Current wording: How much tax revenue does the government collect when the $2 vaping tax leaves consumption at 160 thousand units?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — 42103 — graph-prompt-missing-cue

- Concept: externalities
- Pools: legendary
- Current wording: Which assessment correctly compares the actual $2 vaping tax with the optimal $4 correction?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — ECON-MG-MEDIUM-106 — repeated-feedback

- Concept: externalities
- Pools: medium
- Current wording: A delivery truck creates noise for residents who are not customers. Why is this an externality?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P77-MFAIL-E-003 — repeated-feedback

- Concept: externalities
- Pools: easy
- Current wording: A neighbor bears smoke from a restaurant exhaust fan. What feature identifies an externality?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P77-MFAIL-EL-014 — repeated-feedback

- Concept: externalities
- Pools: elite
- Current wording: A subsidy addresses a spillover but attracts costly gaming. What follows?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P77-MFAIL-L-019 — repeated-feedback

- Concept: externalities
- Pools: legendary
- Current wording: A loud festival benefits ticket buyers but disturbs residents. What is the spillover?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P77-MFAIL-R-035 — repeated-feedback

- Concept: externalities
- Pools: repair
- Current wording: What makes an effect an externality?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P77-MFAIL-E-005 — repeated-feedback

- Concept: market-power
- Pools: easy
- Current wording: A seller can profitably influence price by restricting output. What concern appears?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P77-MFAIL-L-020 — repeated-feedback

- Concept: market-power
- Pools: legendary
- Current wording: A patent holder sets price above marginal cost. Which introductory concern applies?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P77-MFAIL-M-009 — repeated-feedback

- Concept: market-power
- Pools: medium
- Current wording: A dominant platform blocks entry and reduces trades. What is the core concern?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P77-MFAIL-R-036 — repeated-feedback

- Concept: market-power
- Pools: repair
- Current wording: How does market power differ from an externality?
- Reason: Identical feedback is reused across 4 distinct questions.

### WARNING — P77-MFAIL-L-017 — repeated-feedback

- Concept: public-goods-and-common-resources
- Pools: legendary
- Current wording: A fishery uses quotas, but regulators cannot observe illegal catch. What complicates the remedy?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P77-MFAIL-LB-031 — repeated-feedback

- Concept: public-goods-and-common-resources
- Pools: legendaryBoss
- Current wording: A fishing limit protects stocks but enforcement is weak. What should evaluation include?
- Reason: Identical feedback is reused across 3 distinct questions.

### REVIEW — 42023 — weak-absolute-distractors

- Concept: externalities
- Pools: medium
- Current wording: Based on the graph, why does the unregulated fast-fashion garments outcome differ from the socially efficient outcome?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42027 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: Suppose regulators replace the price instrument with a quantity limit. Based on the graph, what fast-fashion garments quantity would reproduce the efficient outcome?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42029 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: If affected parties could bargain costlessly over the fast-fashion garments spillover, which quantity on the graph would be their efficient target?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42033 — weak-absolute-distractors

- Concept: externalities
- Pools: medium
- Current wording: Based on the graph, why does the unregulated disposable vapes outcome differ from the socially efficient outcome?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42037 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: Suppose regulators replace the price instrument with a quantity limit. Based on the graph, what disposable vapes quantity would reproduce the efficient outcome?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42039 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: If affected parties could bargain costlessly over the disposable vapes spillover, which quantity on the graph would be their efficient target?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42043 — weak-absolute-distractors

- Concept: externalities
- Pools: medium
- Current wording: Based on the graph, why does the unregulated native-plant gardens outcome differ from the socially efficient outcome?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42047 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: Suppose regulators replace the price instrument with a quantity limit. Based on the graph, what native-plant gardens quantity would reproduce the efficient outcome?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42049 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: If affected parties could bargain costlessly over the native-plant gardens spillover, which quantity on the graph would be their efficient target?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42053 — weak-absolute-distractors

- Concept: externalities
- Pools: medium
- Current wording: Based on the graph, why does the unregulated public-transit rides outcome differ from the socially efficient outcome?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42057 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: Suppose regulators replace the price instrument with a quantity limit. Based on the graph, what public-transit rides quantity would reproduce the efficient outcome?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42059 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: If affected parties could bargain costlessly over the public-transit rides spillover, which quantity on the graph would be their efficient target?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42062 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: Which corrective instrument and per-unit amount shown on the graph would move fast-fashion garments to the efficient quantity?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42064 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: After the optimal corrective tax internalizes the spillover, what quantity of fast-fashion garments is produced or consumed?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42066 — possible-difficulty-overstatement

- Concept: externalities
- Pools: elite
- Current wording: At the corrected fast-fashion garments quantity, which buyer-price and seller-receipt pair reflects the policy wedge?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42071 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: Which corrective instrument and per-unit amount shown on the graph would move disposable vapes to the efficient quantity?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42073 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: After the optimal corrective tax internalizes the spillover, what quantity of disposable vapes is produced or consumed?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42075 — possible-difficulty-overstatement

- Concept: externalities
- Pools: elite
- Current wording: At the corrected disposable vapes quantity, which buyer-price and seller-receipt pair reflects the policy wedge?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42080 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: Which corrective instrument and per-unit amount shown on the graph would move native-plant gardens to the efficient quantity?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42082 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: After the optimal producer subsidy internalizes the spillover, what quantity of native-plant gardens is produced or consumed?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42084 — possible-difficulty-overstatement

- Concept: externalities
- Pools: elite
- Current wording: At the corrected native-plant gardens quantity, which buyer-price and seller-receipt pair reflects the policy wedge?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42089 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: Which corrective instrument and per-unit amount shown on the graph would move public-transit rides to the efficient quantity?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42091 — possible-difficulty-overstatement

- Concept: externalities
- Pools: hard
- Current wording: After the optimal rider subsidy internalizes the spillover, what quantity of public-transit rides is produced or consumed?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42093 — possible-difficulty-overstatement

- Concept: externalities
- Pools: elite
- Current wording: At the corrected public-transit rides quantity, which buyer-price and seller-receipt pair reflects the policy wedge?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42097 — possible-difficulty-overstatement

- Concept: externalities
- Pools: elite
- Current wording: At what quantity does the $2 vaping tax leave the market after shifting the private consumption incentive?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42099 — possible-difficulty-overstatement

- Concept: externalities
- Pools: elite
- Current wording: At the taxed quantity of 160 thousand vapes, which consumer-price and seller-receipt pair is shown?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42110 — weak-absolute-distractors

- Concept: externalities
- Pools: medium
- Current wording: What distinguishes an external cost from an ordinary private cost?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42111 — weak-absolute-distractors

- Concept: externalities
- Pools: medium
- Current wording: Why does the sign of an externality not reveal its production or consumption channel?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42116 — answer-length-outlier

- Concept: externalities
- Pools: hard
- Current wording: Why can equating MPB with MPC fail when consumption creates an external cost?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42137 — answer-length-outlier

- Concept: externalities
- Pools: medium
- Current wording: Firm A abates for $20 per ton and B for $70. At a $45 permit price, what is efficient?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42141 — possible-difficulty-overstatement

- Concept: externalities
- Pools: elite
- Current wording: What signal does a higher permit price create?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42150 — weak-absolute-distractors

- Concept: externalities
- Pools: elite
- Current wording: Why can community norms reduce an externality without guaranteeing full efficiency?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42156 — weak-absolute-distractors

- Concept: externalities
- Pools: elite
- Current wording: A rancher and one farmer have enforceable rights, full information, and negligible bargaining costs. What does Coase predict?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42159 — answer-length-outlier

- Concept: externalities
- Pools: legendary
- Current wording: Avoided pollution damage is $2 million, prevention costs $1.2 million, and bargaining costs $1 million. What follows?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42167 — possible-difficulty-overstatement

- Concept: public-goods-and-common-resources
- Pools: boss
- Current wording: Which statement best describes the MC curve in the emergency-sirens graph?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42179 — possible-difficulty-overstatement

- Concept: public-goods-and-common-resources
- Pools: legendaryBoss
- Current wording: Refer to the graph. Which labeled benefit curve would be built from voluntary payments when listeners can receive the signal without contributing?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42182 — possible-difficulty-overstatement

- Concept: public-goods-and-common-resources
- Pools: hard
- Current wording: Refer to the coastal-protection graph. At what quantity do MSB and MC intersect?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42189 — possible-difficulty-overstatement

- Concept: public-goods-and-common-resources
- Pools: legendaryBoss
- Current wording: Refer to the graph. At Q = 10 miles, what marginal cost does the MC curve show?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42196 — possible-difficulty-overstatement

- Concept: public-goods-and-common-resources
- Pools: elite
- Current wording: Which quantity of community fireworks is efficient in the graph?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — 42197 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: hard
- Current wording: The graph plots North and South MB at the same quantity of four displays. Which summation rule does this illustrate?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42215 — possible-difficulty-understatement

- Concept: public-goods-and-common-resources
- Pools: easy
- Current wording: A university database requires a paid login, and simultaneous users do not reduce the information available to one another. Which category fits?
- Reason: Easy metadata may understate a multi-step or simultaneous-change task.

### REVIEW — 42227 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: elite
- Current wording: A road is free and uncongested before rush hour but becomes crowded later. Which conclusion is best?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42233 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: medium
- Current wording: A private park requires a membership card at its only entrance. Which conclusion follows?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42245 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: hard
- Current wording: A swimming pool is nearly empty in the morning but packed in the afternoon. Which conclusion is best?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42260 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: elite
- Current wording: Why does free riding not imply that nobody will ever contribute?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42261 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: hard
- Current wording: A city asks households to report benefits from a proposed siren network before setting voluntary fees. What bias should analysts anticipate?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42262 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: medium
- Current wording: If exclusion technology becomes effective for a formerly open broadcast, what happens to the free-rider problem?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42267 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: repair
- Current wording: A student says free riding means 'people are bad.' What is the more precise economic explanation?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42279 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: medium
- Current wording: How can free riding bias a survey used to value a proposed public good?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42282 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: elite
- Current wording: An analyst values a public-health information campaign using only benefits to people who completed a survey. What may be missing?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42284 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: medium
- Current wording: Why do boats tend to catch too many fish in an open-access fishery?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42287 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: medium
- Current wording: On open grazing land, why might each herder add another animal even when total grazing is excessive?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42291 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: medium
- Current wording: Which outcome distinguishes common-resource overuse from public-good underprovision?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42293 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: medium
- Current wording: Why can an individual fisher's private marginal cost be below the social marginal cost of a catch?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42295 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: hard
- Current wording: A shared irrigation canal has ample water this month, but supply is scarce during drought. Which statement is best?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42295 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: hard
- Current wording: A shared irrigation canal has ample water this month, but supply is scarce during drought. Which statement is best?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42296 — weak-absolute-distractors

- Concept: public-goods-and-common-resources
- Pools: easy
- Current wording: What would an efficient common-resource rule try to make users consider?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — 42298 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: easy
- Current wording: Why might voluntary promises alone fail to protect a large open-access forest?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42302 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: easy
- Current wording: Why can common-resource use exceed the efficient quantity even when every user understands depletion?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42306 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: hard
- Current wording: A village assigns each household a monitored groundwater allowance. What incentive changes?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42307 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: easy
- Current wording: Why might a private forest owner conserve young trees?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42311 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: easy
- Current wording: How can transferable catch shares reduce a race to fish?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42312 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: easy
- Current wording: Why can community-managed access rights sometimes improve stewardship?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — 42317 — answer-length-outlier

- Concept: public-goods-and-common-resources
- Pools: easy
- Current wording: How do clear rights differ from a general request to conserve?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

