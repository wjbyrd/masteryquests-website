# Economic Realm question alignment — 2026-10-11

All 3,463 existing game-local question IDs were examined against the current Composer library. 3,424 now reference corresponding Composer records: 3,384 provenance matches and 40 reviewed equivalents/collision resolutions. Of those existing records, 1,907 changed assessment content (stem, options, answer hash, feedback, or image). Other matches already agreed on those fields or needed only metadata/routing updates. No original local ID was removed.

The 39 unmatched phase-2 supplements remain exactly as published: 14 Market Gate repair questions and 25 National Ledger ordinary/repair/bridge questions. They postdate the Composer import and address specific coverage gaps. In particular, National Ledger's 42000–42011 and 43000–43004 are **not** the unrelated externality/behavioral-economics questions with the same bare numeric IDs in Composer. Matching requires source-game provenance, never a bare numeric ID.

| Game | Existing IDs | Existing content updated | Added ordinary/checkpoint | Added repair/bridge | Total after |
| --- | ---: | ---: | ---: | ---: | ---: |
| The Market Gate | 628 | 391 | 166 | 55 | 849 |
| The National Ledger | 676 | 337 | 126 | 5 | 807 |
| Equilibrium Crisis | 1,042 | 539 | 352 | 65 | 1,459 |
| Liquidity Grid | 591 | 291 | 123 | 69 | 783 |
| Stabilization Protocol | 526 | 349 | 293 | 91 | 910 |
| **Total** | **3,463** | **1,907** | **1,060** | **285** | **4,808** |

The 1,345 additions are exact Composer questions. Each game's additions stay within concepts already evidenced in its original bank. Selection favors additional skills and different scenarios within those concepts, with up to two ordinary items per concept/difficulty, one checkpoint per concept/stage, and two support items per covered route. It does not copy entire neighboring modules. New canonical IDs and normalized stems are deduplicated against the game's existing selection. Existing local IDs are retained even where Composer consolidated corresponding source questions.

Market Gate receives more introductory reasoning, demand/supply, market equilibrium, PPF, price-control and tax practice. National Ledger receives measurement, prices, productivity/growth and labor-market practice. Equilibrium Crisis receives additional practice across its existing micro/measurement coverage. Liquidity Grid receives money, banking, inflation, transmission and stabilization practice. Stabilization Protocol also receives AD–AS, shocks, expectations, short- and long-run Phillips curves, disinflation and sacrifice-ratio practice. International finance, exchange-rate modules, trade-policy modules, loanable-funds modules and broader synthesis modules were not added. Introductory mentions of competitive markets, trade gains and price signals permit only skills already represented; incidental market-failure/political-economy references do not open those families for expansion.

## Evidence and maintenance

- `selection.json` records every retained mapping and selected addition. `overrides.mjs` records the 40 reviewed correspondences. `retained.mjs` identifies the 39 verbatim supplements. `scope.mjs` defines the instructional boundary.
- `../../validation_artifacts/economic_realm_questions/id-comparison.csv` gives a row for every final question ID, including old/new pool, Composer ID, changed fields and rationale. `summary.json` gives counts and additions by concept.
- `sync.mjs` pins the reviewed Composer library hash, verifies answer keys and schema, copies registered graph assets byte-for-byte, and writes the five public banks. It omits plaintext answer keys and author-machine provenance paths.
- Ordinary questions follow Composer's cognitive difficulty. Checkpoint stage is recorded separately and preserved. Two former legendary simplification questions now occupy Composer's bridge role. Existing skill names replaced by Composer terminology still have corresponding assessed coverage (e.g. `model_simplification` → `models_to_ppf`, `opportunity_cost_full_cost` → `full_cost_opportunity_cost_analysis`).
- Engine regeneration updates asset references, readable objective labels and mode eligibility. It retains storage keys and the underlying Composer engine. Frozen saves keep their saved current question/options, while subsequent questions use the refreshed bank.
- Historical Market Gate/National Ledger phase publishers now refuse to overwrite these banks. Their authoring records and all original instructional resources remain intact.

```powershell
# Existing reviewed selection; refuses an unexpected Composer library revision:
node audit_tools/economic_realm_questions/sync.mjs
node audit_tools/economic_realm_engine/sync.mjs
node audit_tools/economic_realm_questions/quality.mjs
node audit_tools/economic_realm_questions/check.mjs
node audit_tools/economic_realm_engine/check.mjs
node audit_tools/economic_realm_engine/browser.mjs
```

For a future Composer revision, deliberately rerun `audit.mjs`, review changed/unmatched provenance and coverage, update overrides/retained records if needed, then run `plan.mjs` and review the new selection before publishing. The original question baseline is commit `f98cbdf5e0c4d60d0c0adb8cadbe7006a695b600`; do not recapture it from the generated banks.

Content checks passed for every original ID, retained-supplement equality, source provenance, exact canonical assessment fields, unique valid hashed answers, in-scope additions and reproducible output. Engine checks passed for 22 complete Composer functions per game and 238 original presentation/resource files. **All 104 browser checks passed with zero page exceptions**, covering all enabled modes, all 107 copied question-asset instances, reports/CSV, mobile layout, checkpoint/exam behavior and 15 saves created with the actual frozen engines **and frozen banks**. These are bounded regression checks, not an independent economics re-review of every canonical question.

See `QUALITY_REVIEW.md` for the inherited editorial findings and the two reviewed duplicate-stem flags. The Composer source library itself was not modified. This update is local; nothing has been deployed.
