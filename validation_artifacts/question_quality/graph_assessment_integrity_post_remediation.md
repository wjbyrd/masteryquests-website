# Question Quality Audit

Generated: 2026-08-31T18:09:40.117Z

## Scope

- Concepts: demand, supply, market-equilibrium, production-possibilities-frontier
- Pools: all pools
- Pool inventory: calculation, easy, elite, hard, legendary, medium
- Unique questions inspected: 115
- Library: phase6.2i-oligopoly-rich-bank-v1-costs-graph-v2-pc-graph-v2-monopoly-graph-v2-mcomp-graph-v2-elasticity-graph-v2-trade-graph-v2-phase6.3-targeted-production-repair-v1-phase6.4-graph-accessibility-v1-phase7.1-scarcity-standalone-expansion-v1-phase7.2-opportunity-cost-standalone-expansion-v1-phase7.3-marginal-analysis-standalone-expansion-v1-phase7.4-incentives-standalone-expansion-v1-phase7.5-comparative-advantage-gains-trade-standalone-expansion-v1-phase7.6-models-assumptions-light-touch-pilot-v1-phase7.7-general-economics-final-maturation-v1-phaseM2a-phillips-disinflation-family-maturation-v1-phaseM2b1-gdp-national-output-family-maturation-v1-phaseM2b2-inflation-real-values-family-maturation-v1-phaseM2b3-growth-productivity-family-maturation-v1-phaseM2b4-unemployment-labor-family-maturation-v1-phaseM2c1-money-banking-fed-family-maturation-v1-phaseM2c2-money-growth-inflation-neutrality-family-maturation-v1-phaseM2c3-money-market-policy-transmission-family-maturation-v1-phaseM2d1-ad-as-macro-equilibrium-family-maturation-v1-phaseM2d2-fiscal-stabilization-family-maturation-v1-phaseM2d3-stabilization-block-closure-v1-phaseM2e-advanced-macro-checkpoint-supplement-v1-phaseM4-final-macro-release-closure-v1-phaseMicro1-elasticity-granularity-pilot-v1-phaseMicro2-surplus-granularity-v1-phaseMicro3-trade-granularity-v1-phaseMicro3a-adaptive-depth-backfill-v1-phaseMicro3b-adaptive-support-backfill-v1-phaseMicro4-costs-granularity-adaptive-backfill-v1-phaseMicro5-perfect-competition-granularity-adaptive-backfill-v1-phaseMicro6-monopoly-granularity-adaptive-backfill-v1-phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1-phaseMicro8-oligopoly-granularity-adaptive-backfill-v1-phaseQH1-question-independence-graph-hygiene-v1-phaseGraph1-demand-supply-core-v1-phaseGraph2-price-controls-taxes-v1-phaseGraph3-macro-ad-as-core-v1-phaseGraph4-money-market-ad-transmission-v1-phaseGraphAudit-remediation-v1-phaseMicroGraphAudit-remediation-v1-phaseTrialGraph-mode8-v1-phaseQH2-question-quality-remediation-v1-phase3e-market-gate-graph-sync-v1-phase-public-goods-common-resources-question-pool-v1-phase-externalities-question-pool-v1-phase-factor-markets-question-pool-v1-phase-remaining-principles-micro-question-pools-v1-phase-macro-federal-budgets-debt-v1-phase-saving-investment-loanable-funds-question-pool-v1-phaseQH3-core-question-quality-gate-v1-phaseQH4-supply-demand-equilibrium-audit-remediation-v1-phaseQH5-foundations-curation-graph-evidence-v1-phaseQH6-graph-assessment-integrity-v1
- Library SHA-256: fb44fd1abf25b0dcfffecef3b3fb6d7790767e52f2c45e04b3bed4058b26bbee

## Summary

- ERROR: 0
- WARNING: 0
- REVIEW: 5
- Total findings: 5
- Unique questions affected: 5
- Questions with multiple findings: 0

ERROR means a deterministic defect. WARNING means a strong machine-detectable reason to inspect. REVIEW requires semantic or pedagogical judgment.

## Rule counts

| Severity | Rule | Count |
|---|---|---:|
| REVIEW | near-duplicate-stem | 4 |
| REVIEW | weak-absolute-distractors | 1 |

## Findings by concept

| Concept | Findings |
|---|---:|
| production-possibilities-frontier | 5 |
| demand | 0 |
| market-equilibrium | 0 |
| supply | 0 |

## Findings by pool

| Pool | Findings |
|---|---:|
| calculation | 3 |
| legendary | 2 |
| easy | 0 |
| elite | 0 |
| hard | 0 |
| medium | 0 |

## Findings

### REVIEW — 40005 — weak-absolute-distractors

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to the graph. What can the outward shift establish without knowing society's preferences?
- Reason: 2 distractors rely on absolute wording while the correct answer does not.

### REVIEW — ECON-MG-HARD-250 — near-duplicate-stem

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. What is the opportunity cost per additional unit of Good X when production moves from A to B?
- Reason: Stem is 100% token-similar to ECON-MG-HARD-251. Automated comparison indicates differences in: graph point.
- Suggested direction: Confirm that the pair tests meaningfully different reasoning rather than a trivial wording variant; the listed differences are heuristic review aids, not a redundancy verdict.

### REVIEW — ECON-MG-HARD-251 — near-duplicate-stem

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. What is the opportunity cost per additional unit of Good X when production moves from B to C?
- Reason: Stem is 100% token-similar to ECON-MG-HARD-252. Automated comparison indicates differences in: graph point.
- Suggested direction: Confirm that the pair tests meaningfully different reasoning rather than a trivial wording variant; the listed differences are heuristic review aids, not a redundancy verdict.

### REVIEW — ECON-MG-HARD-252 — near-duplicate-stem

- Concept: production-possibilities-frontier
- Pools: calculation
- Current wording: Refer to the PPF graph. What is the opportunity cost per additional unit of Good X when production moves from D to E?
- Reason: Stem is 100% token-similar to ECON-MG-HARD-255. Automated comparison indicates differences in: graph point, scenario or wording.
- Suggested direction: Confirm that the pair tests meaningfully different reasoning rather than a trivial wording variant; the listed differences are heuristic review aids, not a redundancy verdict.

### REVIEW — ECON-MG-LEGENDARY-9002 — near-duplicate-stem

- Concept: production-possibilities-frontier
- Pools: legendary
- Current wording: Refer to the PPF graph. What is the opportunity cost per additional unit of Good X when production moves from C to D?
- Reason: Stem is 100% token-similar to ECON-MG-HARD-250. Automated comparison indicates differences in: graph point, pedagogical role/pool (legendary vs calculation).
- Suggested direction: Confirm that the pair tests meaningfully different reasoning rather than a trivial wording variant; the listed differences are heuristic review aids, not a redundancy verdict.

