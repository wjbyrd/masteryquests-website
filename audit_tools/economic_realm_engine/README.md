# Economic Realm engine alignment — 2026-10-11

The five published game pages now derive their gameplay engine and controls from the current Faculty Concept Composer template. Their old engines had Phase 1.5 hardening but lacked subsequent exam navigation, checkpoint outcomes and remediation safeguards, consumable artifacts, daily challenges, newer practice modes, and current mastery/measurement behavior.

| Game | Engine | Enabled modes | Question dependency deferred |
| --- | --- | --- | --- |
| The Market Gate | Current Composer | All 10 | None needed for engine launch; 48 existing graph-required candidates support Trial by Graph |
| The National Ledger | Current Composer | 9 | Trial by Graph needs graph-required/accessibility metadata |
| The Equilibrium Crisis | Current Composer | 9 | Trial by Graph needs graph-required/accessibility metadata |
| The Liquidity Grid | Current Composer | 9 | Trial by Graph needs graph-required/accessibility metadata |
| The Stabilization Protocol | Current Composer | 9 | Trial by Graph needs graph-required/accessibility metadata; no instructional-resource routing was published in the original engine |

The nine common modes are Standard, Timed, Exam, Quiz, Unlimited, Legendary, Score Attack, Fading Fortune, and Risk & Reward. Graph-mode gating follows the existing question metadata; it does not mean the other banks contain no images. No question wording, options, answer hashes, pool assignments, repair items, or source bank files were edited.

## Integration contracts

- `sync.mjs` uses the maintained Composer HTML as the engine source. It installs each original external bank rather than composing a new question selection from the canonical library.
- `profiles.json` retains each game's title, guide, bosses, artifacts, stage labels, streak artwork, feedback, audio, instructional-resource functions/styles, storage keys, and high-score behavior. Original automatic player aliases remain; the games do not ask for names.
- Existing save keys and Realm achievement/artifact keys remain compatible. Older artifact property names are mapped explicitly. Older checkpoint saves retain the successful hits already completed. New inventory, daily, and engine state use separate game namespaces.
- Checkpoint questions that historically encode `easyBoss`/`easyboss` and similar stage names in their difficulty field get a normalized **validation view**. The actual question records are unchanged.
- Current local measurement/CSV behavior is present. Anonymous collection remains disabled; no transport, endpoint, or research activation was added.
- The engine update also installs the current Composer interface required by its modes, exam navigation, guide/checkpoint screens, game menu, and reports. Existing game assets supply the theme.

## Validation

- **97 browser checks passed**, with zero page exceptions: every configured mode launches and accepts answers; exam drafts remain unscored until commit; revisions commit exactly once; three checkpoint misses complete without remediation; reports/CSV work; mobile start screens fit; original Realm keys and sound controls work.
- **15 actual legacy-engine save fixtures passed**: ordinary question, mid-checkpoint, and active remediation for each game. The tests create saves using the pinned old engine, then load the upgraded page at the same origin and compare question ID/order, run identity, room, attempts, boss health, remediation state, and artifact ownership.
- Source checks compare **22 complete engine functions per game** against Composer after formatting normalization. All **243 tracked companion files** are unchanged against the baseline (text comparisons normalize checkout line endings); all five question banks also retain their captured byte hashes. Regeneration with `--check` passes.
- The active Composer suite passed 36/37 initially. Its remaining hardening runner rejected the new release date because it only recognized the old August version format. The test now also accepts the explicit dated Composer-engine version; the hardening runner passed on rerun, covering all 16 target HTML files. The other 36 checks were not rerun unnecessarily.
- `git diff --check` passes. Screenshots and machine-readable evidence are in `validation_artifacts/economic_realm_engine/`. Browser coverage is bounded regression testing, not an exhaustive playthrough of every question.

## Maintenance

Run from the repository root:

```powershell
node audit_tools/economic_realm_engine/sync.mjs
node audit_tools/economic_realm_engine/sync.mjs --check
node audit_tools/economic_realm_engine/check.mjs
node audit_tools/economic_realm_engine/browser.mjs
```

Browser tests require Playwright and Edge. Set `NODE_PATH` or `PLAYWRIGHT_MODULE` to the installed package location as needed. They serve only local repository files, block external requests, and use disposable browser contexts. `MQ_TEST_FILTER` supports focused diagnosis and writes a separate results file.

`capture.mjs` is a one-time extractor pinned to baseline commit `4c4335bba1f98580bb39cae2fe397c0682ba094d`; do not recapture from generated pages. Intentional future question-bank work must update the content-preservation assertions separately. Regenerate the engine pages after changing bank metadata so mode eligibility reflects that change.

Only the five live game-directory `index.html` files are generated. Historical `*_index_fixed.html` files and the Realm hub are not deployment sources for these engines and remain unchanged. This work is local; no deployment was performed.
