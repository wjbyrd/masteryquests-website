# Question Quality Audit

Generated: 2026-09-10T03:34:58.131Z

## Scope

- Concepts: international-transactions-and-identities, nominal-exchange-rates, real-exchange-rates-and-purchasing-power, capital-flows-and-net-capital-outflow, foreign-exchange-market, open-economy-policy-transmission
- Pools: all pools
- Pool inventory: boss, bridge, easy, elite, hard, legendary, legendaryBoss, medium, repair
- Unique questions inspected: 240
- Library: phase6.2i-oligopoly-rich-bank-v1-costs-graph-v2-pc-graph-v2-monopoly-graph-v2-mcomp-graph-v2-elasticity-graph-v2-trade-graph-v2-phase6.3-targeted-production-repair-v1-phase6.4-graph-accessibility-v1-phase7.1-scarcity-standalone-expansion-v1-phase7.2-opportunity-cost-standalone-expansion-v1-phase7.3-marginal-analysis-standalone-expansion-v1-phase7.4-incentives-standalone-expansion-v1-phase7.5-comparative-advantage-gains-trade-standalone-expansion-v1-phase7.6-models-assumptions-light-touch-pilot-v1-phase7.7-general-economics-final-maturation-v1-phaseM2a-phillips-disinflation-family-maturation-v1-phaseM2b1-gdp-national-output-family-maturation-v1-phaseM2b2-inflation-real-values-family-maturation-v1-phaseM2b3-growth-productivity-family-maturation-v1-phaseM2b4-unemployment-labor-family-maturation-v1-phaseM2c1-money-banking-fed-family-maturation-v1-phaseM2c2-money-growth-inflation-neutrality-family-maturation-v1-phaseM2c3-money-market-policy-transmission-family-maturation-v1-phaseM2d1-ad-as-macro-equilibrium-family-maturation-v1-phaseM2d2-fiscal-stabilization-family-maturation-v1-phaseM2d3-stabilization-block-closure-v1-phaseM2e-advanced-macro-checkpoint-supplement-v1-phaseM4-final-macro-release-closure-v1-phaseMicro1-elasticity-granularity-pilot-v1-phaseMicro2-surplus-granularity-v1-phaseMicro3-trade-granularity-v1-phaseMicro3a-adaptive-depth-backfill-v1-phaseMicro3b-adaptive-support-backfill-v1-phaseMicro4-costs-granularity-adaptive-backfill-v1-phaseMicro5-perfect-competition-granularity-adaptive-backfill-v1-phaseMicro6-monopoly-granularity-adaptive-backfill-v1-phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1-phaseMicro8-oligopoly-granularity-adaptive-backfill-v1-phaseQH1-question-independence-graph-hygiene-v1-phaseGraph1-demand-supply-core-v1-phaseGraph2-price-controls-taxes-v1-phaseGraph3-macro-ad-as-core-v1-phaseGraph4-money-market-ad-transmission-v1-phaseGraphAudit-remediation-v1-phaseMicroGraphAudit-remediation-v1-phaseTrialGraph-mode8-v1-phaseQH2-question-quality-remediation-v1-phase3e-market-gate-graph-sync-v1-phase-public-goods-common-resources-question-pool-v1-phase-externalities-question-pool-v1-phase-factor-markets-question-pool-v1-phase-remaining-principles-micro-question-pools-v1-phase-macro-federal-budgets-debt-v1-phase-saving-investment-loanable-funds-question-pool-v1-phaseQH3-core-question-quality-gate-v1-phaseQH4-supply-demand-equilibrium-audit-remediation-v1-phaseQH5-foundations-curation-graph-evidence-v1-phaseQH6-graph-assessment-integrity-v1-phaseQH7-principles-micro-human-read-curation-v1-phaseMacro2-taxonomy-normalization-v1-phaseMacro4-human-read-curation-v1-phaseMacroFinalCleanup-v1-phaseMacroOpenEconomy-v1
- Library SHA-256: eb31a559d75564f6d356ff3eceb55eb2383654b48363a2691eab0c72c1b399e0

## Summary

- ERROR: 0
- WARNING: 0
- REVIEW: 8
- Total findings: 8
- Unique questions affected: 8
- Questions with multiple findings: 0

ERROR means a deterministic defect. WARNING means a strong machine-detectable reason to inspect. REVIEW requires semantic or pedagogical judgment.

## Rule counts

| Severity | Rule | Count |
|---|---|---:|
| REVIEW | possible-difficulty-overstatement | 6 |
| REVIEW | weak-absolute-distractors | 2 |

## Findings by concept

| Concept | Findings |
|---|---:|
| foreign-exchange-market | 4 |
| nominal-exchange-rates | 2 |
| capital-flows-and-net-capital-outflow | 1 |
| real-exchange-rates-and-purchasing-power | 1 |
| international-transactions-and-identities | 0 |
| open-economy-policy-transmission | 0 |

## Findings by pool

| Pool | Findings |
|---|---:|
| legendary | 4 |
| hard | 2 |
| elite | 1 |
| legendaryBoss | 1 |
| boss | 0 |
| bridge | 0 |
| easy | 0 |
| medium | 0 |
| repair | 0 |

## Findings

### REVIEW — PMOE-NCO-L-004 — weak-absolute-distractors

- Concept: capital-flows-and-net-capital-outflow
- Pools: legendary
- Current wording: In a period, residents acquire $300 billion of foreign securities. Foreign acquisitions of domestic factories are known only to lie between $180 and $240 billion; foreign acquisitions of domestic bonds lie between $50 and $90 billion. There are no other asset flows. What can be inferred about NCO?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMOE-FX-H-003 — possible-difficulty-overstatement

- Concept: foreign-exchange-market
- Pools: hard
- Current wording: Refer to the conceptual graph. Which event and equilibrium response fit the displayed demand shift?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — PMOE-FX-L-003 — possible-difficulty-overstatement

- Concept: foreign-exchange-market
- Pools: legendary
- Current wording: Refer to the graph showing S0 shifting right to S1 along D0. Prices are fixed. One explanation is lower domestic real returns; another is higher domestic political risk. What do the displayed rate and quantity changes identify, and what additional evidence distinguishes these explanations?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — PMOE-FX-L-006 — weak-absolute-distractors

- Concept: foreign-exchange-market
- Pools: legendary
- Current wording: Refer to the numbered graph showing A to B after both dollar-market curves shift right. If demand shifts first and supply second, estimate the intermediate rate to the nearest tenth from the displayed straight lines and compare the intermediate and final outcomes with A. Which statement fits?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — PMOE-FX-LB-002 — possible-difficulty-overstatement

- Concept: foreign-exchange-market
- Pools: legendaryBoss
- Current wording: Use the dollar market with downward-sloping demand, upward-sloping supply, and e quoted in foreign currency per U.S. dollar. At the original exchange rate, an export-demand shock increases dollars demanded by 70 units and an asset-purchase shock increases dollars supplied by 45 units. What happens to equilibrium e and quantity, and do those two shift amounts identify their exact changes?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — PMOE-NER-EL-002 — possible-difficulty-overstatement

- Concept: nominal-exchange-rates
- Pools: elite
- Current wording: The U.S. dollar buys 10 percent more euros but 5 percent fewer yen. From these bilateral changes alone, what follows about the euro price of one yen?
- Reason: elite metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — PMOE-NER-H-006 — possible-difficulty-overstatement

- Concept: nominal-exchange-rates
- Pools: hard
- Current wording: A Japanese product's yen price rises 4 percent while the yen depreciates 10 percent against the dollar. Approximately what happens to its dollar price?
- Reason: hard metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

### REVIEW — PMOE-RER-L-002 — possible-difficulty-overstatement

- Concept: real-exchange-rates-and-purchasing-power
- Pools: legendary
- Current wording: A domestic basket costs 200 domestic units and a comparable foreign basket costs 300 foreign units. Initially e is 1.50 foreign units per domestic unit. Later e falls to 1.35 and the foreign basket rises 8 percent. What domestic basket price would keep ε = eP/P* unchanged, and what if the actual price were 230?
- Reason: legendary metadata may overstate a direct recognition or graph-reading task.
- Suggested direction: Confirm that the item requires work appropriate to its assigned difficulty.

