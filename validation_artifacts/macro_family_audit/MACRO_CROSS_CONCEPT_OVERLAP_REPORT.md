# Macro Cross-Concept Overlap Report

## Duplicate scan

The scan normalized punctuation/case, compared numeric templates, answer sets, and token similarity within each family. It found no exact cross-concept stem duplicates. Candidate counts are deliberately conservative and must be interpreted pedagogically.

| Family | Exact stems | Semantic near | Cosmetic templates | Repeated answer sets | Disposition |
| --- | --- | --- | --- | --- | --- |
| F1 — GDP and National Output | 0 | 0 | 0 | 0 | No automated cross-sibling candidate |
| F2 — Inflation Measurement and Real Values | 0 | 0 | 0 | 0 | No automated cross-sibling candidate |
| F3 — Growth and Productivity | 0 | 0 | 0 | 0 | No automated cross-sibling candidate |
| F4 — Unemployment and Labor | 0 | 0 | 0 | 0 | No automated cross-sibling candidate |
| F5 — Money, Banking, and Fed Operations | 0 | 1 | 0 | 1 | Review candidates; no deletion in M1 |
| F6 — Money Growth, Inflation, and Neutrality | 0 | 2 | 0 | 1 | Review candidates; no deletion in M1 |
| F7 — Money Market and Policy Transmission | 0 | 1 | 0 | 0 | Review candidates; no deletion in M1 |
| F8 — AD-AS and Macroeconomic Equilibrium | 0 | 1 | 1 | 1 | Review candidates; no deletion in M1 |
| F9 — Fiscal and Stabilization Policy | 0 | 0 | 0 | 1 | Review candidates; no deletion in M1 |
| F10 — Phillips Curve and Disinflation | 0 | 0 | 0 | 1 | Review candidates; no deletion in M1 |
| F11 — Integrated Macro Analysis | 0 | 0 | 0 | 0 | No automated cross-sibling candidate |

| Family | Similarity | Record A | Record B |
| --- | --- | --- | --- |
| F5 | 0.818 | bank-money-creation: A bank has $2 million in assets and $100,000 in capital. If asset values fall by 5 percent, what happens to capital? | monetary-control-limits: A bank has $2 million in assets and $120,000 in capital. If asset values fall by 4 percent, capital falls to: |
| F6 | 1 | quantity-theory-of-money: If the value of money falls from 1/2 to 1/4, what happens to the price level? | inflation-tax-and-deflation: If the price level falls from 125 to 120, what happens to the value of money? |
| F6 | 0.857 | quantity-theory-of-money: Use value of money = 1/P. If value falls from 1/2 to 1/4, what happens to the price level? | inflation-tax-and-deflation: If the price level falls from 125 to 120, what happens to the value of money? |
| F7 | 0.857 | liquidity-preference-and-money-market: Higher interest rates tend to make investment: | monetary-policy-transmission: Higher interest rates tend to make investment spending |
| F8 | 1 | macroeconomic-equilibrium-and-shocks: Refer to the graph with LRAS. If the economy moves from AD1-AS2 to AD1-AS1, the short-run result is: | long-run-macroeconomic-adjustment: Refer to the graph with LRAS. If the economy moves from AD1-AS2 to AD2-AS2, the short-run result is: |

## Legitimate reinforcement

- GDP Measurement vs Components: counting boundaries and the expenditure identity reinforce measurement; component arithmetic belongs primarily in Components.
- CPI Measurement vs CPI/Deflator: comparison items need both concepts; the comparison task belongs in CPI/Deflator.
- Fed vs Tools: institutional mandate/FOMC belongs with the Fed; selecting or predicting a tool belongs with Tools.
- Tools vs Transmission: instrument choice belongs with Tools; the rates→investment→AD chain belongs with Transmission.
- AD vs Fiscal/AD: identifying an AD shifter belongs with AD; tracing a government action belongs with Fiscal/AD.
- Shocks vs Stabilization: classifying equilibrium consequences belongs with Shocks; choosing/evaluating response belongs with Stabilization.
- SRPC vs Expectations: movement along a given SRPC belongs with SRPC; shifting SRPC through expected inflation belongs with Expectations.

## Suspect overlap / boundary review

- The F8 numeric/cosmetic candidate repeats “move from AD1-AS2 …” across Equilibrium/Shocks and Long-Run Adjustment. Keep both only if one diagnoses the short-run state and the other requires the self-correction sequence.
- Quantity Theory and Fisher/Neutrality contain value-of-money and inflation calculations with number swaps; protect the conceptual distinction between price-level arithmetic, long-run neutrality, and nominal-rate adjustment.
- Monetary Policy Tools, Transmission, Fiscal Policy, and Stabilization share policy-chain distractors. Primary assignment should follow the first nontrivial reasoning step, not whichever policy noun appears first.
- Integrated Macro Analysis legitimately reuses component skills, but new synthesis must require at least two model links; a one-model question belongs in the component family.

Result: family membership is defensible; no registry boundary revision is required before M2. Flagged candidates should receive human review during authoring to distinguish `LEGITIMATE_REINFORCEMENT` from `REDUNDANT_CROSS_CONCEPT_DUPLICATION`.
