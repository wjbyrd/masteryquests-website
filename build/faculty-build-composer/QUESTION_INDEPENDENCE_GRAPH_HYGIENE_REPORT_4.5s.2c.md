# Question Independence + Graph Hygiene Report — Composer 4.5s.2c

Generated: 2026-08-11

## Verdict

**PASS — question-sequence dependence and high-confidence graph redundancy were patched without changing answer-bearing fields.**

## Why this pass was necessary

Two defects were reproduced in the current 7,977-question canonical library:

1. Some questions used phrases such as **“For the same … market”** or **“At that output”** even though the engine can draw the item without its predecessor.
2. Some graph attachments were decorative or gave away the requested fact directly, including AD-AS and Phillips-curve axis-label questions.

The game must treat every item as independently drawable unless the complete scenario is embedded in the current question.

## Changes

- Canonical questions: **7,977** (unchanged)
- Self-containment stem rewrites: **41**
- Graph attachments before: **1,024**
- Graph attachments after: **917**
- High-confidence decorative/giveaway graph attachments removed: **107**
- Answer choices changed: **0**
- Answer hashes changed: **0**
- Feedback/routing/difficulty changes: **0**

### Graph removals by concept

| Concept | Removed |
|---|---:|
| liquidity-preference-and-money-market | 24 |
| quantity-theory-of-money | 22 |
| fiscal-multipliers-and-crowding-out | 19 |
| stabilization-policy | 17 |
| monetary-policy-transmission | 12 |
| inflation-costs | 4 |
| aggregate-demand | 2 |
| fisher-effect | 2 |
| short-run-phillips-curve | 2 |
| costs-of-production | 1 |
| inflation-tax-and-deflation | 1 |
| long-run-phillips-curve | 1 |

## Self-containment corrections

The pass rewrote all 41 stems matching the unsafe deictic-start patterns found in the current library. This includes:

- the eight Legendary Consumer/Producer Surplus “same market” cutoff items (festival permits, lab kits, repair appointments, studio passes, garden plots, workshop seats, meal vouchers, archive tours), now with buyer values and seller costs embedded in each question;
- three additional surplus exchange follow-ups, now with buyer value, seller cost, and relevant price information embedded;
- six Monopolistic Competition checkpoint price follow-ups, now with each demand equation and its MR=MC output embedded;
- five Monopoly Legendary price-discrimination follow-ups, now with both market demand equations and the profit-maximizing quantities embedded;
- eight Monopoly Elite stems that were already numerically complete but misleadingly said “same stated conditions”; and
- smaller false-context cues in Elasticity, Incentives, Monopolistic Competition, and nominal-GDP items.

## Graph-hygiene corrections

The graph-removal rule was deliberately conservative: remove the image only when the stem already supplies the relationship/data needed to answer, or when the image itself literally exposes the requested label.

Major cleanup groups:

- **Axis-label giveaways:** AD-AS and Phillips-curve axis-identification questions are now text-only.
- **Quantity theory:** graph retained only for the one item that actually requires distinguishing the shown MS/MD shift; the remaining quantity-theory questions now stand on their stated shifts, values, and assumptions.
- **Liquidity preference:** point/curve intersection questions retain the graph; generic shift logic and arithmetic no longer carry it.
- **Monetary-policy transmission:** questions that depend on the displayed MS1/MS2 or AD1/AD2 direction retain the graph; fully stated policy chains/arithmetic do not.
- **Fiscal multipliers / crowding out:** AD1/AD2/AD3 path-reading questions retain the graph; fully stated multiplier arithmetic and policy logic do not.
- **Inflation costs, Fisher effect, inflation tax/deflation, stabilization arithmetic:** graph references were removed when all causal/numeric information already appears in the stem.
- **Costs of production:** the AFC identity item that displayed a graph explicitly labeled “AFC” is now text-only.

## Regression guards added

The patch script now fails if:

- a no-image question still tells the student to “refer to” a graph;
- any of the unsafe sequence-dependent start patterns remain;
- the four axis-label giveaway questions regain graph attachments;
- the pre-existing answer-hash exception set changes or a new answer-hash failure appears;
- answer choices, answer hashes, feedback, difficulty, routing role, or skill routing change; or
- the canonical question count changes from 7,977.

## Validation results

- Canonical IDs: **7,977 / 7,977**
- Pre-existing legacy answer-hash exceptions: **7**
- New answer-hash failures introduced by this pass: **0**
- Orphan graph references: **0**
- Unsafe context-start patterns remaining: **0**
- Axis-giveaway regression failures: **0**
- Unexpected answer/routing field changes: **0**
- Logical library SHA-256: `696e755ebcaea5c25d6d06f76db4a781eaf59c87bf4f0eee6dcdfea3c0faea80`

## Patched self-containment IDs

- `ECON-NL-LEGENDARY-9007`
- `P52B-INC-H-002`
- `P62B-ELAS-M-036`
- `P62C-CPS-B3-012`
- `P62C-CPS-EL-012`
- `P62C-CPS-H-023`
- `P62C-CPS-L-002`
- `P62C-CPS-L-004`
- `P62C-CPS-L-006`
- `P62C-CPS-L-008`
- `P62C-CPS-L-010`
- `P62C-CPS-L-012`
- `P62C-CPS-L-014`
- `P62C-CPS-L-016`
- `P62C-CPS-LB-018`
- `P62C-CPS-LB-020`
- `P62C-CPS-LB-022`
- `P62G-MON-EL-002`
- `P62G-MON-EL-004`
- `P62G-MON-EL-006`
- `P62G-MON-EL-008`
- `P62G-MON-EL-010`
- `P62G-MON-EL-012`
- `P62G-MON-EL-014`
- `P62G-MON-EL-016`
- `P62G-MON-L-077`
- `P62G-MON-L-080`
- `P62G-MON-L-083`
- `P62G-MON-L-086`
- `P62G-MON-L-089`
- `P62H-MCMP-B1-003`
- `P62H-MCMP-B1-006`
- `P62H-MCMP-B1-009`
- `P62H-MCMP-B1-012`
- `P62H-MCMP-B1-015`
- `P62H-MCMP-B1-018`
- `P62H-MCMP-M-022`
- `P62H-MCMP-M-024`
- `P62H-MCMP-M-026`
- `P62H-MCMP-M-028`
- `P62H-MCMP-M-030`

## Focused production validation

The dedicated post-patch validator passed after packaging preparation. It confirmed:

- **0** unsafe sequence-dependent context starts remain.
- **0** text-only questions still tell students to refer to a graph.
- **0** axis-label giveaway questions retain images.
- The two reproduced Consumer/Producer Surplus Legendary defects now contain their complete buyer/seller data.
- Representative Consumer/Producer Surplus, Monopolistic Competition, Monopoly, and Macro graph-hygiene compositions pass all enabled modes with **0 errors**, **0 warnings**, and clean answer audits.
- Quiz Mode regression validation also passes.
