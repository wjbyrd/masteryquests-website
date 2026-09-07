# Question Quality Audit

Generated: 2026-09-06T21:56:57.278Z

## Scope

- Concepts: competitive-markets, demand, supply, market-equilibrium, price-signals, elasticity
- Pools: all pools
- Pool inventory: boss, bridge, calculation, easy, elite, hard, legendary, legendaryBoss, medium, repair, repairSeed
- Unique questions inspected: 789
- Library: phase6.2i-oligopoly-rich-bank-v1-costs-graph-v2-pc-graph-v2-monopoly-graph-v2-mcomp-graph-v2-elasticity-graph-v2-trade-graph-v2-phase6.3-targeted-production-repair-v1-phase6.4-graph-accessibility-v1-phase7.1-scarcity-standalone-expansion-v1-phase7.2-opportunity-cost-standalone-expansion-v1-phase7.3-marginal-analysis-standalone-expansion-v1-phase7.4-incentives-standalone-expansion-v1-phase7.5-comparative-advantage-gains-trade-standalone-expansion-v1-phase7.6-models-assumptions-light-touch-pilot-v1-phase7.7-general-economics-final-maturation-v1-phaseM2a-phillips-disinflation-family-maturation-v1-phaseM2b1-gdp-national-output-family-maturation-v1-phaseM2b2-inflation-real-values-family-maturation-v1-phaseM2b3-growth-productivity-family-maturation-v1-phaseM2b4-unemployment-labor-family-maturation-v1-phaseM2c1-money-banking-fed-family-maturation-v1-phaseM2c2-money-growth-inflation-neutrality-family-maturation-v1-phaseM2c3-money-market-policy-transmission-family-maturation-v1-phaseM2d1-ad-as-macro-equilibrium-family-maturation-v1-phaseM2d2-fiscal-stabilization-family-maturation-v1-phaseM2d3-stabilization-block-closure-v1-phaseM2e-advanced-macro-checkpoint-supplement-v1-phaseM4-final-macro-release-closure-v1-phaseMicro1-elasticity-granularity-pilot-v1-phaseMicro2-surplus-granularity-v1-phaseMicro3-trade-granularity-v1-phaseMicro3a-adaptive-depth-backfill-v1-phaseMicro3b-adaptive-support-backfill-v1-phaseMicro4-costs-granularity-adaptive-backfill-v1-phaseMicro5-perfect-competition-granularity-adaptive-backfill-v1-phaseMicro6-monopoly-granularity-adaptive-backfill-v1-phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1-phaseMicro8-oligopoly-granularity-adaptive-backfill-v1-phaseQH1-question-independence-graph-hygiene-v1-phaseGraph1-demand-supply-core-v1-phaseGraph2-price-controls-taxes-v1-phaseGraph3-macro-ad-as-core-v1-phaseGraph4-money-market-ad-transmission-v1-phaseGraphAudit-remediation-v1-phaseMicroGraphAudit-remediation-v1-phaseTrialGraph-mode8-v1-phaseQH2-question-quality-remediation-v1-phase3e-market-gate-graph-sync-v1-phase-public-goods-common-resources-question-pool-v1-phase-externalities-question-pool-v1-phase-factor-markets-question-pool-v1-phase-remaining-principles-micro-question-pools-v1-phase-macro-federal-budgets-debt-v1-phase-saving-investment-loanable-funds-question-pool-v1-phaseQH3-core-question-quality-gate-v1-phaseQH4-supply-demand-equilibrium-audit-remediation-v1-phaseQH5-foundations-curation-graph-evidence-v1-phaseQH6-graph-assessment-integrity-v1-phaseQH7-principles-micro-human-read-curation-v1-phaseMacro2-taxonomy-normalization-v1-phaseMacro4-human-read-curation-v1-phaseMacroFinalCleanup-v1-phaseMacroOpenEconomy-v1
- Library SHA-256: 098bf47591ab9b39091130336b8c2ab368716407ea215257c1ae374684bd6c85

## Summary

- ERROR: 0
- WARNING: 15
- REVIEW: 118
- Total findings: 133
- Unique questions affected: 128
- Questions with multiple findings: 5

ERROR means a deterministic defect. WARNING means a strong machine-detectable reason to inspect. REVIEW requires semantic or pedagogical judgment.

## Rule counts

| Severity | Rule | Count |
|---|---|---:|
| REVIEW | answer-length-outlier | 20 |
| REVIEW | near-duplicate-stem | 1 |
| REVIEW | possible-difficulty-overstatement | 47 |
| REVIEW | weak-absolute-distractors | 50 |
| WARNING | graph-prompt-missing-cue | 7 |
| WARNING | image-without-graph-required | 5 |
| WARNING | repeated-feedback | 3 |

## Findings by concept

| Concept | Findings |
|---|---:|
| elasticity | 113 |
| competitive-markets | 13 |
| price-signals | 7 |
| demand | 0 |
| market-equilibrium | 0 |
| supply | 0 |

## Findings by pool

| Pool | Findings |
|---|---:|
| hard | 31 |
| legendary | 23 |
| boss | 16 |
| repair | 14 |
| legendaryBoss | 12 |
| easy | 11 |
| medium | 11 |
| bridge | 6 |
| calculation | 5 |
| elite | 4 |
| repairSeed | 0 |

## Questions with multiple findings

| Question | Concept | Pools | Findings | Rules |
|---|---|---|---:|---|
| P52B-COMP-B1-001 | competitive-markets | boss | 2 | answer-length-outlier, repeated-feedback |
| P52B-COMP-H-001 | competitive-markets | hard | 2 | answer-length-outlier, weak-absolute-distractors |
| P62B-ELAS-B3-014 | elasticity | boss | 2 | answer-length-outlier, weak-absolute-distractors |
| P62B-ELAS-H-031 | elasticity | hard | 2 | graph-prompt-missing-cue, possible-difficulty-overstatement |
| P62B-ELAS-R-005 | elasticity | repair | 2 | answer-length-outlier, weak-absolute-distractors |

## Findings

### WARNING — P52B-COMP-B1-001 — repeated-feedback

- Concept: competitive-markets
- Pools: boss
- Current wording: Which seller is most clearly a price taker?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P52B-COMP-B1-002 — repeated-feedback

- Concept: competitive-markets
- Pools: boss
- Current wording: What makes sustained economic profit difficult in a competitive market?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P52B-COMP-B1-003 — repeated-feedback

- Concept: competitive-markets
- Pools: boss
- Current wording: A market has many buyers and sellers and standardized products. What does this imply about an individual seller's ability to set price?
- Reason: Identical feedback is reused across 3 distinct questions.

### WARNING — P62B-ELAS-B2-019 — graph-prompt-missing-cue

- Concept: elasticity
- Pools: boss
- Current wording: Checkpoint: Calculate total revenue at C, B, and A. Which pattern is correct as price falls across those points?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — P62B-ELAS-E-028 — image-without-graph-required

- Concept: elasticity
- Pools: easy
- Current wording: Refer to the graph. D2 is steeper than D1. Why isn't slope alone a valid measure of elasticity?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — P62B-ELAS-E-029 — image-without-graph-required

- Concept: elasticity
- Pools: easy
- Current wording: On the displayed linear demand curve, as you move downward from C through B toward A, price elasticity of demand generally:
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — P62B-ELAS-EL-031 — graph-prompt-missing-cue

- Concept: elasticity
- Pools: elite
- Current wording: Use the price, quantity, and total-revenue change from C to B. Which elasticity conclusion follows?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — P62B-ELAS-H-016 — image-without-graph-required

- Concept: elasticity
- Pools: hard
- Current wording: The displayed linear demand curve has constant slope. Why can the upper portion near C be elastic while the lower portion near A is inelastic?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — P62B-ELAS-H-031 — graph-prompt-missing-cue

- Concept: elasticity
- Pools: hard
- Current wording: Using the labeled coordinates at points C and B, what is the midpoint price elasticity of demand?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — P62B-ELAS-H-037 — graph-prompt-missing-cue

- Concept: elasticity
- Pools: hard
- Current wording: Using the labeled $10-to-$6 price change, which classification is correct?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — P62B-ELAS-M-008 — image-without-graph-required

- Concept: elasticity
- Pools: medium
- Current wording: Refer to the graph. As you move down the linear demand curve from C through B toward A, price elasticity of demand generally:
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — P62B-ELAS-M-028 — image-without-graph-required

- Concept: elasticity
- Pools: medium
- Current wording: The displayed linear demand curve has constant slope, yet elasticity changes along it. Which statement correctly compares slope and elasticity?
- Reason: The stem directs the learner to visual evidence, but graphRequired is not true.
- Suggested direction: Set graphRequired to true after confirming the attached graph is the intended asset.

### WARNING — P62B-ELAS-M-033 — graph-prompt-missing-cue

- Concept: elasticity
- Pools: medium
- Current wording: Compare points C and B and calculate total revenue at each. What does the change imply about demand over that interval?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — P62B-ELAS-M-038 — graph-prompt-missing-cue

- Concept: elasticity
- Pools: medium
- Current wording: When price rises from $4 to $8, how much does quantity supplied rise in the short run?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### WARNING — P62B-ELAS-M-039 — graph-prompt-missing-cue

- Concept: elasticity
- Pools: medium
- Current wording: Compare the short-run and long-run supply responses to the same price change. Why is the long-run response larger?
- Reason: The graph is required, but the stem does not clearly direct the learner to visual evidence.
- Suggested direction: Use a natural cue such as 'Refer to the graph...' when the graph is required.

### REVIEW — ECON-MG-EASY-36 — answer-length-outlier

- Concept: competitive-markets
- Pools: easy
- Current wording: A competitive market has:
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — ECON-MG-MEDIUMBOSS-3002 — weak-absolute-distractors

- Concept: competitive-markets
- Pools: boss
- Current wording: A market has many buyers but only one seller, and that seller has control over price. Is this a competitive market?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-COMP-B1-001 — answer-length-outlier

- Concept: competitive-markets
- Pools: boss
- Current wording: Which seller is most clearly a price taker?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P52B-COMP-BR-001 — weak-absolute-distractors

- Concept: competitive-markets
- Pools: bridge
- Current wording: An online marketplace makes prices easy to compare and lets buyers switch with one click. This tends to:
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-COMP-E-002 — answer-length-outlier

- Concept: competitive-markets
- Pools: easy
- Current wording: Which feature most supports a competitive market?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P52B-COMP-H-001 — answer-length-outlier

- Concept: competitive-markets
- Pools: hard
- Current wording: A restaurant market has many sellers, but each offers a differentiated experience. Which statement is best?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P52B-COMP-H-001 — weak-absolute-distractors

- Concept: competitive-markets
- Pools: hard
- Current wording: A restaurant market has many sellers, but each offers a differentiated experience. Which statement is best?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-COMP-L-001 — answer-length-outlier

- Concept: competitive-markets
- Pools: legendary
- Current wording: A commodity exchange publishes prices instantly, products are standardized, and thousands of traders participate. Which mechanism most supports price taking?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P52B-COMP-M-003 — answer-length-outlier

- Concept: competitive-markets
- Pools: medium
- Current wording: Which change would make a market less competitive?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P52B-COMP-R-001 — answer-length-outlier

- Concept: competitive-markets
- Pools: repair
- Current wording: A price taker is a seller that:
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-B1-019 — weak-absolute-distractors

- Concept: elasticity
- Pools: boss
- Current wording: Checkpoint: At point B, what does the graph imply about total revenue for a small movement in either direction along the same linear demand curve?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-B3-006 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: boss
- Current wording: Demand is Q = 120 − 3P. At P = 30, Q = 30. What is point elasticity?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-B3-007 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: boss
- Current wording: Supply is Q = 20 + 2P. At P = 20, Q = 60. What is point elasticity?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-B3-008 — weak-absolute-distractors

- Concept: elasticity
- Pools: boss
- Current wording: A 10 percent price increase lowers quantity 20 percent. Cost per unit is unchanged. Which revenue-profit statement is safest?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-B3-009 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: boss
- Current wording: A rival price cut reduces a firm's demand 15 percent. The rival price fell 10 percent. What is cross-price elasticity?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-B3-011 — answer-length-outlier

- Concept: elasticity
- Pools: boss
- Current wording: A tariff is placed on imports with highly elastic import demand. What is most likely?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-B3-014 — answer-length-outlier

- Concept: elasticity
- Pools: boss
- Current wording: A product is a necessity but one brand has many rivals. Which elasticity comparison is correct?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-B3-014 — weak-absolute-distractors

- Concept: elasticity
- Pools: boss
- Current wording: A product is a necessity but one brand has many rivals. Which elasticity comparison is correct?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-B3-015 — weak-absolute-distractors

- Concept: elasticity
- Pools: boss
- Current wording: A regression slope is −200 units per dollar. Why is this not enough to classify elasticity?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-B3-019 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: boss
- Current wording: Checkpoint: Using the two labeled points on vertical D2, what is the midpoint price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-C-021 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: calculation
- Current wording: The price of coffee rises by 10 percent, and quantity demanded for tea rises by 6 percent. What is the cross-price elasticity of demand between coffee and tea?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-C-022 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: calculation
- Current wording: The price of printer ink rises by 8 percent, and quantity demanded for printers falls by 12 percent. What is the cross-price elasticity of demand between printer ink and printers?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-C-023 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: calculation
- Current wording: The price of gasoline rises by 20 percent, and quantity demanded for bus rides rises by 5 percent. What is the cross-price elasticity of demand between gasoline and bus rides?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-C-024 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: calculation
- Current wording: The price of hot-dog buns falls by 10 percent, and quantity demanded for hot dogs rises by 7 percent. What is the cross-price elasticity of demand between hot-dog buns and hot dogs?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-C-025 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: calculation
- Current wording: The price of a national-brand product falls by 5 percent, and quantity demanded for the store-brand alternative falls by 8 percent. What is the cross-price elasticity of demand between the two products?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-E-002 — weak-absolute-distractors

- Concept: elasticity
- Pools: easy
- Current wording: Why is an elasticity coefficient usually unit-free?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-E-018 — weak-absolute-distractors

- Concept: elasticity
- Pools: easy
- Current wording: When demand is unit elastic, a price change leaves total revenue:
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-E-030 — weak-absolute-distractors

- Concept: elasticity
- Pools: easy
- Current wording: The midpoint method calculates percentage changes using:
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-EL-016 — answer-length-outlier

- Concept: elasticity
- Pools: elite
- Current wording: A firm sells 2,000 units at $15. After raising price to $17, it sells 1,700 units. Which statement is correct?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-EL-018 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: elite
- Current wording: A carbon tax is intended to reduce emissions. Which market configuration creates the strongest quantity response to a given tax wedge?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-EL-038 — weak-absolute-distractors

- Concept: elasticity
- Pools: elite
- Current wording: Refer to the graph. After a persistent price increase, quantity supplied initially adjusts toward A and, with more time to respond, toward B. Which elasticity principle does this illustrate?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-H-001 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, price for commuter rail passes changes from $10 to $12 and quantity demanded changes from 1200 to 1020. What is price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-002 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, price for specialty coffee subscriptions changes from $18 to $21 and quantity demanded changes from 800 to 680. What is price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-003 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, price for museum admissions changes from $14 to $11 and quantity demanded changes from 500 to 650. What is price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-004 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, price for cloud-storage plans changes from $20 to $24 and quantity demanded changes from 1400 to 1120. What is price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-005 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, price for fitness memberships changes from $35 to $40 and quantity demanded changes from 900 to 765. What is price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-006 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, price for festival tickets changes from $50 to $44 and quantity demanded changes from 600 to 720. What is price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-007 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, price for meal-kit subscriptions changes from $60 to $66 and quantity demanded changes from 1000 to 850. What is price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-008 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, price for airport parking days changes from $16 to $20 and quantity demanded changes from 1500 to 1170. What is price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-009 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, the price of a professional exam-prep course falls from $250 to $225, and quantity demanded rises from 400 seats to 480 seats. What is the price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-010 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, price for premium headphones changes from $180 to $198 and quantity demanded changes from 700 to 560. What is price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-011 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, the price of artisan bread loaves changes from $4 to $5 and quantity supplied changes from 900 to 1080. What is price elasticity of supply?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-012 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, the price of rental bicycles changes from $12 to $15 and quantity supplied changes from 300 to 390. What is price elasticity of supply?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-013 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, the price of greenhouse tomatoes changes from $3 to $4 and quantity supplied changes from 1000 to 1180. What is price elasticity of supply?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-014 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, the price of cloud-server capacity rises from $40 to $50 per unit, and quantity supplied rises from 500 to 700 units. What is the price elasticity of supply?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-015 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the midpoint method, the price of hotel rooms rises from $150 to $180, and short-run quantity supplied rises from 800 to 840 rooms. What is the price elasticity of supply?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-022 — weak-absolute-distractors

- Concept: elasticity
- Pools: hard
- Current wording: A product has many substitutes, but buyers have signed one-year contracts. Which statement is most defensible?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-H-030 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: A binding price ceiling creates a shortage. Which demand characteristic makes quantity demanded rise more sharply at the controlled price?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-031 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the labeled coordinates at points C and B, what is the midpoint price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-033 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Across the full C-to-A interval, what midpoint price elasticity does the graph imply?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-035 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Using the two labeled points on D1, what is the midpoint price elasticity of demand?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-H-036 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: hard
- Current wording: Refer to the graph. What is the midpoint price elasticity of demand between the marked points on D2?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-029 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: The price of gasoline changes by 12 percent, and demand for electric vehicles changes by -9 percent. Which cross-price result is correct?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-030 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: The price of high-speed rail changes by 10 percent, and demand for air travel changes by 6 percent. Which cross-price result is correct?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-031 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: The price of tablet cases changes by 15 percent, and demand for tablets changes by -18 percent. Which cross-price result is correct?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-032 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: The price of brand B cereal changes by -8 percent, and demand for brand A cereal changes by -10 percent. Which cross-price result is correct?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-033 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: The price of coffee creamer changes by 20 percent, and demand for coffee changes by -7 percent. Which cross-price result is correct?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-042 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendary
- Current wording: A city evaluates a fuel tax using a one-month elasticity estimate. Why might this underestimate the tax's eventual effect on fuel consumption?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-L-049 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendary
- Current wording: Why does maximum total revenue not necessarily identify the profit-maximizing output?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-L-050 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendary
- Current wording: A museum has near-zero marginal cost for another visitor before capacity. Why might it still avoid the unit-elastic revenue maximum?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-L-052 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: An airline's leisure customers become easier to identify, but ticket resale also becomes easy. What happens to elasticity-based price discrimination?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-063 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: A country's export demand is highly elastic. Its currency appreciates, raising foreign-currency export prices. What is the likely quantity effect?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-071 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendary
- Current wording: A demand estimate is elastic at the current price but the firm plans a large price cut. Why is using one constant coefficient risky?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-L-073 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: A point elasticity is measured on a differentiable demand curve. Which expression combines slope with the current point?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-076 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: For supply Q = 10 + 3P, what is point elasticity at P = 10, where Q = 40?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-077 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: For supply Q = −20 + 4P, what is point elasticity at P = 10, where Q = 20?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-078 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: A supply curve passes through the origin and is linear. What is point elasticity along the positive portion?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-086 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendary
- Current wording: A policy analyst uses demand elasticity to predict a quota's price effect. What additional elasticity is essential?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-L-087 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: A binding production quota reduces market quantity. In which demand case is the price increase likely largest?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-088 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: A supply disruption occurs. Which market has the smallest price increase, other things equal?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-091 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendary
- Current wording: Compare the C→B and B→A intervals on the graph. Why can their elasticity classifications differ?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-L-093 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: At point C, the seller is on the elastic portion of demand. Which direction of price change moves revenue toward its maximum at B?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-L-095 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendary
- Current wording: Suppose D1 and D2 describe similar goods, but one has many close substitutes and the other has few. Which assignment is most consistent with the displayed responses?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-LB-002 — possible-difficulty-overstatement

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A health insurer lowers patients' out-of-pocket price. What happens to the observed price sensitivity of patients at the point of service?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P62B-ELAS-LB-004 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A policymaker claims a tax on an inelastic good is painless because quantity barely changes. What is missing?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-LB-005 — answer-length-outlier

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A product has very elastic demand and very inelastic supply. A demand increase occurs. Which short-run outcome is most likely?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-LB-009 — answer-length-outlier

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: An elasticity estimate is based on a period when income and competitor prices also changed. What is the core identification problem?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-LB-013 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A government publishes one national elasticity for housing. Why should local planners be cautious?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-LB-017 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A seller wants to maximize revenue with one uniform price. What information about elasticity is needed beyond knowing its value at the current price?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-LB-018 — answer-length-outlier

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A firm estimates the price elasticity of demand at 1.05, with a wide confidence interval spanning values below and above one. What is the prudent pricing conclusion?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-LB-020 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A product has no close substitutes today but represents a large budget share. What is the best conclusion?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-LB-022 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A market's supply is inelastic today but highly elastic over five years. A permanent tax is imposed. How should incidence analysis change over time?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-LB-025 — answer-length-outlier

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A seller estimates elastic demand but still raises price after a cost increase. Why is this not necessarily irrational?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-LB-031 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A researcher reports price elasticity of demand as −2.3 and another reports 2.3 for the same estimate. Are they necessarily inconsistent?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-LB-032 — weak-absolute-distractors

- Concept: elasticity
- Pools: legendaryBoss
- Current wording: A researcher reports income elasticity of −2.3. Should the sign be discarded as with price elasticity of demand?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-M-002 — weak-absolute-distractors

- Concept: elasticity
- Pools: medium
- Current wording: Demand for "food" is less elastic than demand for "restaurant lunches" mainly because:
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-M-018 — answer-length-outlier

- Concept: elasticity
- Pools: medium
- Current wording: An income elasticity of 0.4 suggests the good is:
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-M-021 — near-duplicate-stem

- Concept: elasticity
- Pools: medium
- Current wording: Demand is very inelastic and supply is relatively elastic. Which side of the market will bear most of a new excise tax?
- Reason: Stem is 93% token-similar to P62B-ELAS-M-022. Automated comparison indicates differences in: scenario or wording.
- Suggested direction: Confirm that the pair tests meaningfully different reasoning rather than a trivial wording variant; the listed differences are heuristic review aids, not a redundancy verdict.

### REVIEW — P62B-ELAS-M-029 — weak-absolute-distractors

- Concept: elasticity
- Pools: medium
- Current wording: Why is the midpoint method preferred when comparing two price-quantity observations?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-R-002 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner reports an elasticity in kilograms per dollar. Which statement best corrects the error?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-R-005 — answer-length-outlier

- Concept: elasticity
- Pools: repair
- Current wording: A learner says necessities always have perfectly inelastic demand. Which statement best corrects the error?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P62B-ELAS-R-005 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says necessities always have perfectly inelastic demand. Which statement best corrects the error?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-R-006 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says a steeper curve is always less elastic. Which statement best corrects the error?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-R-012 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says marginal revenue is positive on inelastic demand. Which statement best corrects the error?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-R-014 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says short-run supply is always more elastic. Which statement best corrects the error?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-R-015 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner drops the negative sign from income elasticity. Which statement best corrects the error?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-R-017 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says the side that sends the tax payment to the government bears the entire tax burden. Which statement best corrects the error?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P62B-ELAS-R-019 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says the same elasticity must apply at every point on a linear demand curve. Which statement best corrects the error?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMA-ELAS-E-002 — weak-absolute-distractors

- Concept: elasticity
- Pools: easy
- Current wording: Which situation generally makes supply more price elastic?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMA-ELAS-E-027 — weak-absolute-distractors

- Concept: elasticity
- Pools: easy
- Current wording: A price increase raises total revenue. Which demand condition is consistent with that result?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMA-ELAS-E-032 — weak-absolute-distractors

- Concept: elasticity
- Pools: easy
- Current wording: If supply is much less elastic than demand, sellers usually bear:
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMA-ELAS-H-045 — weak-absolute-distractors

- Concept: elasticity
- Pools: hard
- Current wording: A regulator compares two markets facing identical per-unit fees. In Market X, demand and supply are relatively inelastic; in Market Y, both are relatively elastic. Which claim is best?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMS-ELAS-BR-012 — weak-absolute-distractors

- Concept: elasticity
- Pools: bridge
- Current wording: A category has income elasticity 1.4. How does that connect to business forecasting during an expansion?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMS-ELAS-BR-013 — weak-absolute-distractors

- Concept: elasticity
- Pools: bridge
- Current wording: Why can income elasticity help explain changes in the mix of goods consumers buy as an economy grows?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMS-ELAS-BR-016 — answer-length-outlier

- Concept: elasticity
- Pools: bridge
- Current wording: A coffee shop tracks the price of a nearby competitor's drinks. Why is cross-price elasticity useful?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — PMS-ELAS-BR-023 — weak-absolute-distractors

- Concept: elasticity
- Pools: bridge
- Current wording: A firm cuts price and total revenue rises. What does this imply about demand over that price range?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMS-ELAS-BR-025 — weak-absolute-distractors

- Concept: elasticity
- Pools: bridge
- Current wording: How does elasticity connect to marginal-revenue reasoning for a firm with downward-sloping demand?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMS-ELAS-R-020 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says a price cut always lowers total revenue because each unit sells for less. What is missing?
- Reason: 3 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMS-ELAS-R-021 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says marginal revenue must be positive everywhere on a downward-sloping demand curve. Which statement best corrects the error?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMS-ELAS-R-029 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says labor demand elasticity is unrelated to substitution possibilities. Best correction?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMS-ELAS-R-030 — weak-absolute-distractors

- Concept: elasticity
- Pools: repair
- Current wording: A learner says supply elasticity does not matter when the price received for an export rises. Which statement best corrects the error?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-PSIG-E-001 — answer-length-outlier

- Concept: price-signals
- Pools: easy
- Current wording: A rising market price typically signals producers that:
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P52B-PSIG-H-001 — weak-absolute-distractors

- Concept: price-signals
- Pools: hard
- Current wording: A high price reflects both strong demand and a temporary supply disruption. Why can the price alone be insufficient for policy diagnosis?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-PSIG-H-002 — answer-length-outlier

- Concept: price-signals
- Pools: hard
- Current wording: A subsidy lowers the buyer's out-of-pocket price while paying sellers an additional amount. How can the subsidy distort the price signal buyers receive?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

### REVIEW — P52B-PSIG-H-003 — possible-difficulty-overstatement

- Concept: price-signals
- Pools: hard
- Current wording: A congested road has no toll. What price-signal problem is present?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — P52B-PSIG-H-004 — weak-absolute-distractors

- Concept: price-signals
- Pools: hard
- Current wording: A sudden price spike attracts rapid entry, but the shock disappears before new capacity arrives. What does this show?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-PSIG-L-003 — weak-absolute-distractors

- Concept: price-signals
- Pools: legendary
- Current wording: A carbon price raises energy prices. What information is the policy trying to add to the market signal?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — P52B-PSIG-M-002 — answer-length-outlier

- Concept: price-signals
- Pools: medium
- Current wording: The price of a product falls after a new production technology spreads. What information does the lower price convey?
- Reason: The correct answer is an extreme length outlier and may cue test-wise learners.
- Suggested direction: Make distractors comparably specific without adding ambiguity.

