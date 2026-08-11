# Perfect Competition — Granularity + Adaptive Coverage Audit

## Verdict

The authoritative post-Costs build contains **454 canonical Perfect Competition records**. The family is healthy, publisher-scale, graph-rich, and continues to pass its existing family-level validation. The remaining issue is taxonomy and adaptive balance: several distinct instructional ideas are packed into the parent selector, and some child lanes are thin in ordinary Easy/Medium/Hard or Repair/Bridge coverage.

The cleanest taxonomy is **8 child subtopics**. This is more granular than the six inherited `PC.1`–`PC.6` objectives without creating artificial one-rule selectors.

## Recommended child taxonomy

| # | Proposed child | Role | Existing records | Runtime Easy / Medium / Hard | Repair / Bridge | Quiz-eligible now | Targeted fill |
|---:|---|---|---:|---:|---:|---:|---:|
| 1 | Market Structure, Price Taking & Firm Revenue | Standalone/focused | 39 | 12 / 1 / 8 | 6 / 2 | 21 | **15** |
| 2 | Profit-Maximizing Output & the MR = MC Rule | Standalone/focused | 98 | 14 / 12 / 17 | 2 / 4 | 58 | **6** |
| 3 | Profit, Loss & Break-Even | Standalone/focused | 57 | 4 / 16 / 16 | 2 / 1 | 38 | **15** |
| 4 | Shutdown & Short-Run Loss Minimization | Standalone/focused | 71 | 7 / 7 / 10 | 2 / 3 | 34 | **13** |
| 5 | Short-Run Supply & Cost Shifts | Standalone/focused | 42 | 2 / 3 / 8 | 2 / 4 | 14 | **23** |
| 6 | Entry, Exit & Long-Run Equilibrium | Standalone/focused | 54 | 4 / 5 / 8 | 4 / 3 | 23 | **18** |
| 7 | Long-Run Industry Supply & Cost Conditions | Supporting | 45 | 0 / 3 / 4 | 0 / 0 | 13 | **14** |
| 8 | Competitive Efficiency & Model Limits | Supporting | 48 | 3 / 1 / 7 | 2 / 3 | 15 | **7** |

The eight proposed slices partition the bank exactly: **454 in, 454 out, zero overlap, zero unclassified records** under the audit rules.

## Why eight

### Market Structure, Price Taking & Firm Revenue

`PC.1` and `PC.2` belong together pedagogically. The firm's horizontal demand curve and the relationship `P = AR = MR` are direct consequences of price-taking behavior. Splitting "revenue" into its own tiny selector would create granularity for its own sake rather than a useful instructor-facing topic.

### Profit, Loss & Break-Even vs. Shutdown

The original `PC.4` is two different decisions:

- measuring whether the firm earns profit, loss, or zero economic profit; and
- deciding whether a loss-making firm should produce or shut down in the short run.

Those deserve separate selectors. A student can know how to calculate a loss and still blow the AVC shutdown rule. Mixing the two hides that distinction.

### Entry/Exit vs. Industry Cost Conditions

The original `PC.6` contains too much. Entry, exit, zero economic profit, and the long-run representative-firm equilibrium form one core topic. Constant-, increasing-, and decreasing-cost industries are a narrower extension of that long-run story, so they remain separately selectable but are classified as supporting.

### Efficiency & Model Limits

Allocative efficiency, productive efficiency, and the limits of the competitive benchmark form a coherent final layer. It has enough ordinary content for a future 15-question quiz already, but its natural use is alongside the long-run competitive benchmark rather than as a full standalone campaign.

## Adaptive-standard audit

The Micro standard remains:

- **Standalone/focused:** at least **10 Easy + 10 Medium + 10 Hard**, plus **6 Repair + 6 Bridge**.
- **Supporting:** at least **5 Easy + 5 Medium + 5 Hard**, plus **3 Repair + 3 Bridge**.

Calculations count toward their canonical runtime difficulty because the composer routes them into the adaptive difficulty pools at composition time.

Perfect Competition needs a measured maximum of:

- **67 ordinary Easy/Medium/Hard questions**
- **44 Repair/Bridge adaptive-support questions**
- **111 targeted additions total**

No additional Legendary, checkpoint, calculation, or graph questions are justified by this audit.

### Backfill detail

| Child | Ordinary E/M/H needed | Repair/Bridge needed | Total |
|---|---:|---:|---:|
| Market Structure, Price Taking & Firm Revenue | 11 | 4 | 15 |
| Profit-Maximizing Output & MR = MC | 0 | 6 | 6 |
| Profit, Loss & Break-Even | 6 | 9 | 15 |
| Shutdown & Short-Run Loss Minimization | 6 | 7 | 13 |
| Short-Run Supply & Cost Shifts | 17 | 6 | 23 |
| Entry, Exit & Long-Run Equilibrium | 13 | 5 | 18 |
| Long-Run Industry Supply & Cost Conditions | 8 | 6 | 14 |
| Competitive Efficiency & Model Limits | 6 | 1 | 7 |
| **Total** | **67** | **44** | **111** |

## The main weak lanes

### Short-Run Supply & Cost Shifts

This child has **42 existing records**, but much of the depth is Elite/Legendary/checkpoint material. Runtime ordinary coverage is only **2 Easy / 3 Medium / 8 Hard**, and it currently has **14 quiz-eligible ordinary questions**. The 23-question targeted fill fixes both adaptive depth and future Quiz viability without touching advanced material.

### Long-Run Industry Supply & Cost Conditions

This is the clearest adaptive gap: **45 existing records**, but runtime coverage is only **0 Easy / 3 Medium / 4 Hard**, with **0 Repair / 0 Bridge**. The bank is not conceptually thin; it is difficulty-distribution thin. Existing material is concentrated in Elite, Legendary, and checkpoint work.

Treating it as a supporting child keeps the remedy proportional: **8 ordinary + 6 support questions**, not a pointless 30-per-tier expansion.

## Quiz implications

Six children already have at least 15 ordinary non-Legendary questions. Short-Run Supply has 14 and Long-Run Industry Supply has 13. The proposed adaptive fill automatically pushes both above the future 15-question Quiz ceiling.

After the proposed fill, all eight Perfect Competition children can be selected for a ≤15-question quiz, while the two supporting children remain pedagogically intended to pair naturally with related long-run concepts for larger adaptive sessions.

## Existing family quality

The current package-level Perfect Competition validation passes before any granularity work:

- **454 canonical records**
- **120 graph-linked question records**
- **41 assets**
- All five current modes: PASS
- Answer audit: PASS
- Asset audit: PASS
- Existing family checkpoint coverage: PASS

The original publisher-scale family therefore does **not** need rebuilding. This is a taxonomy and adaptive-balance operation.

## Recommendation

Lock these **8** Perfect Competition child concepts and proceed with the now-standard Micro production sequence:

1. Apply child taxonomy metadata without duplicating the physical bank.
2. Preserve the parent `perfect-competition` family selector.
3. Add only the measured **111-question** adaptive retrofit.
4. Recompute child Repair/Bridge routes so all new support questions are actually consumed by the adaptive router.
5. Validate exact 454+111 parent/child recombination with zero overlap or loss.
6. Validate standalone/focused Timed + Exam operation and paired-support operation.
7. Re-run the original Perfect Competition family, graph, composer, source-integrity, and legacy-recipe regression gates.

No other Perfect Competition expansion is justified by this audit.
