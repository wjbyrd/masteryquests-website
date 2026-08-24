# Phase 1.5 Production Hardening Report

Date: 2026-08-24

Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`

The retired workspace `C:\Users\Jennings\Documents\Mastery Quests Website` was not modified or used as production.

## Baseline

- Initial `git status --short`: clean.
- Pre-change active Composer suite: 12/12 passed.
- Initial canonical Composer version: `4.5s.2o` (read from `COMPOSER_VERSION`).
- No pre-existing working-tree changes were incorporated.

## Production Scope And Versions

All included games received the applicable save/resume, lifecycle, elapsed-time, media, reporting, and tablet-layout hardening. The permanent Phase 1.5 validator compiles every listed HTML target and applies family-wide contract checks.

| Game / Template | Family | Status | Version Before | Version After | Validation |
|---|---|---|---|---|---|
| Composer-ready faculty template | Template | Included | Faculty-Blank-2026.07.28 | Faculty-Blank-2026.08.24-phase1.5 | PASS |
| Downloadable faculty template | Template | Included | Faculty-Blank-2026.07.28 | Faculty-Blank-2026.08.24-phase1.5 | PASS |
| The Market Gate | Economic Realm | Included | Market-Gate-2026.07.24.1 | Market-Gate-2026.08.24-phase1.5 | PASS + browser |
| The National Ledger | Economic Realm | Included | National-Ledger-2026.07.24.1 | National-Ledger-2026.08.24-phase1.5 | PASS |
| The Equilibrium Crisis | Economic Realm | Included | Equilibrium-Crisis-2026.07.24.1 | Equilibrium-Crisis-2026.08.24-phase1.5 | PASS |
| The Liquidity Grid | Economic Realm | Included | Liquidity-Gate-2026.07.24.1 | Liquidity-Gate-2026.08.24-phase1.5 | PASS |
| The Stabilization Protocol | Economic Realm | Included | Stabilization-Protocol-2026.07.24.2 | Stabilization-Protocol-2026.08.24-phase1.5 | PASS |
| The National Engine | Macro Command System | Included | No dedicated gameVersion | National-Engine-2026.08.24-phase1.5 | PASS + browser |
| Mint, Ash & Gold | Macro Command System | Included | Mint-Ash-Gold-2026.07.24.1 | Mint-Ash-Gold-2026.08.24-phase1.5 | PASS + browser |
| The Command Nexus | Macro Command System | Included | Command-Nexus-2026.07.24.1 | Command-Nexus-2026.08.24-phase1.5 | PASS |
| The Exchange Citadel | Macro Command System | Included | Exchange-Citadel-2026.07.24.1 | Exchange-Citadel-2026.08.24-phase1.5 | PASS |
| The Cost Directive | Managerial Intelligence Directorate | Included | Cost-Directive-2026.08.15-v2 | Cost-Directive-2026.08.24-phase1.5 | PASS + browser |
| The Market Signal | Managerial Intelligence Directorate | Included | Market-Signal-2026.08.15-v2 | Market-Signal-2026.08.24-phase1.5 | PASS |
| The Strategy Desk | Managerial Intelligence Directorate | Included | Strategy-Desk-2026.08.16-v2 | Strategy-Desk-2026.08.24-phase1.5 | PASS |
| The Agency Protocol | Managerial Intelligence Directorate | Included | Agency-Protocol-2026.07.25.1 | Agency-Protocol-2026.08.24-phase1.5 | PASS |
| The Labyrinth of Choice | Micro Domains | Included | Labyrinth-of-Choice-2026.08.16-engine2 | Labyrinth-of-Choice-2026.08.24-phase1.5 | PASS + browser |

Composer version: `4.5s.2o` -> `4.5s.2p`. The template recipe identifier is now `phase4.5s.2p-phase1.5-hardening`. Existing telemetry schema versions were preserved except National Engine, whose payload schema now explicitly adds `telemetryVersion` and `gameVersion`; it therefore moves from the incorrect generic historical label to `NationalEngine-local-telemetry-v2`. National Engine events are also labeled `The National Engine`, not the unrelated `The Dominion of Power`.

## Intentional Exclusions

- The Strategic Vault - **INTENTIONALLY DEFERRED UNTIL ENGINE UPGRADE**.
- The Foundry - **INTENTIONALLY DEFERRED UNTIL ENGINE UPGRADE**.
- Dominion of Power - **INTENTIONALLY DEFERRED UNTIL ENGINE UPGRADE**.
- Macro, Managerial, Micro, and catalog hubs were not modified. The Economic Realm hub was modified only for the generic restored-card layout fix.
- `legacy/**`, `validation_artifacts/**`, `previews/**`, fixed/dated copies, snapshots, backups, `nationalengine.html`, and historical one-off validators were not modified.
- No question-bank file, ordinary question wording, choice, answer key, objective/skill label, mastery/adaptive threshold, or scoring rule was changed.

## Hardening Architecture

- Standard-only persistence extends each canonical save after a completed scored attempt and meaningful lifecycle transition. Practice modes do not write the Standard key.
- `runPhase` and the current question/UI, remediation, detour, boss, and anti-repeat histories distinguish unanswered questions from resolved transitions. A resolved question advances on resume; an active Repair/Bridge question restores exactly and cannot score twice.
- `accumulatedElapsedMs` stores prior active sessions; `startTime` measures only the current visible session; completion freezes once in `finalElapsedTimeMs`. Closed/offline and hidden-tab time are excluded. Individual response timing remains on `questionStartTime`.
- New optional save fields default safely. National Engine additionally migrates its prior `gauntletRoom` save and artifact keys, while suppressing duplicate start telemetry during resume.
- `renderQuestionMedia(question)` is the shared clear/render path for normal, boss, Legendary, Repair, Bridge, Recovery Retest, and resume routes. It clears stale media, preserves native zoom where supported, and supplies accessible fallback rendering.
- Mastery Report recommendations use the same 85% accuracy and 1.35 fluency signals as the existing report, with distinct accuracy-only, fluency-only, combined, and limited-evidence wording.
- Completion locks prevent duplicate victory/practice completion and prevent pagehide from recreating a cleared Standard save.
- Tablet landscape places targeted status and End Practice above/with the game area at full available width; phone/portrait behavior remains intact.

## Remediation Audit

The separate audit reviews 1,929 Repair/Bridge items across 435 skill pools and records an original miss candidate, Concept Repair, Bridge, and fresh ordinary Retest ladder for every upgraded game.

| Game | Repair | Bridge | Correctly Staged | Faculty-Review Flags | Gap Skills | Thin Pools |
|---|---:|---:|---:|---:|---:|---:|
| Market Gate | 41 | 40 | 49 | 32 | 28 | 22 |
| National Ledger | 57 | 37 | 65 | 29 | 19 | 34 |
| Equilibrium Crisis | 98 | 77 | 114 | 61 | 47 | 56 |
| Liquidity Grid | 60 | 26 | 79 | 7 | 4 | 30 |
| Stabilization Protocol | 87 | 55 | 105 | 37 | 59 | 78 |
| National Engine | 36 | 36 | 59 | 13 | 0 | 0 |
| Mint, Ash & Gold | 90 | 81 | 136 | 35 | 0 | 3 |
| Command Nexus | 88 | 88 | 92 | 84 | 0 | 0 |
| Exchange Citadel | 90 | 90 | 134 | 46 | 0 | 0 |
| Cost Directive | 108 | 108 | 154 | 62 | 3 | 0 |
| Market Signal | 54 | 54 | 78 | 30 | 5 | 0 |
| Strategy Desk | 78 | 78 | 99 | 57 | 9 | 0 |
| Agency Protocol | 44 | 44 | 53 | 35 | 14 | 0 |
| Labyrinth of Choice | 92 | 92 | 145 | 39 | 3 | 0 |

These are automated faculty-review classifications, not silent content changes. Detailed skill-level gaps, item IDs, cognitive-demand evidence, and recommended actions are in `PHASE-1.5-REMEDIATION-AUDIT.md`. Existing least-recently-seen anti-repeat behavior remains covered by the Phase 1 suite; one-item pools may reuse their only valid item and thin pools are explicitly reported.

## Market Gate Chapter 4 / 6 Graph Audit

- 44 objective/skill groups inventoried.
- 42 Hard/Elite/Legendary ordinary graph questions found.
- Existing graph assets are present: `ceilingfloor.webp` (24 references), `supplydemand1.webp` (22), `taxincidence.webp` (27).
- The files are heavily reused; graph coverage, difficulty, interpretation, calculation, and remediation gaps are reported per objective/skill.
- Market Gate currently has no graph-specific mode/`graphRequired` eligibility metadata, so graph-mode eligible count is zero. No new questions or image metadata were authored in Phase 1.5.

See `PHASE-1.5-MARKET-GATE-CH4-CH6-GRAPH-AUDIT.md`.

## Realm And Unlimited Artwork

The Economic Realm cards now use growable height and safe overflow. Browser restoration codes marked all five missions restored; all five Enter buttons remained visible/enabled, replayable, and unclipped at 1440x900, 1024x768, 768x1024, and 390x844. Sequential unlock behavior was verified before restoration.

`unlimited-mode.webp` wiring was added to both templates and the nine games whose Phase 1 Unlimited card was text-only: all five Economic games plus National Engine, Mint/Ash/Gold, Command Nexus, and Exchange Citadel. The four Managerial games and Labyrinth already had Unlimited cards with their established `mode_unlimited.webp`/fallback structure, so those cards were not rewritten.

**Unresolved asset dependency:** `unlimited-mode.webp` has not been supplied anywhere in the repository. The new references and template fallback are correct, but the nine deployed cards cannot display the new artwork until that file is placed in each relevant game directory. No substitute image or alternate filename was created.

## Tests And Browser Results

- Pre-change Phase 1 suite: 12/12 passed.
- Post-change active suite: original Phase 1 runners 12/12 passed; new Phase 1.5 runner 1/1 passed; total 13/13.
- Permanent validator: 16 HTML targets (14 games + 2 templates) passed inline syntax and hardening contracts.
- JavaScript syntax: Composer core, active runner, Phase 1.5 runner, and audit tool passed `node --check`.
- Covered: correct/miss persistence contract, resolved lifecycle, exact remediation resume, legacy save migration, active/offline/hidden elapsed time, completion freeze, Standard isolation, shared media clearing/accessibility, Mastery wording, Realm layout, artwork wiring, reports, and excluded Micro protection.
- Existing mode runners for targeted repair, Concept Review, Mastery Reports, mode availability, Quiz, Unlimited, Trial by Graph, Fading Fortune, and Risk & Reward all remained green.
- Browser Standard resume: a resolved missed question advanced without replay; an active Concept Repair restored the exact same question.
- Browser targeted repair: miss -> Repair -> Bridge -> Recovery Retest -> fresh Mastery Report -> Repair Weak Areas -> targeted Unlimited worked; End Practice remained available.
- Responsive targeted controls: zero horizontal overflow and no control/question overlap at 1440x900, 1024x768, 768x1024, and 390x844.
- Live Market Gate Legendary graph question rendered with an accessible zoom button and working dialog; zero tablet-width overflow.
- Representative production mode screens loaded for Economic, modern Macro, National Engine, Managerial, and upgraded Micro families.
- Representative asset-free Composer output launched with selected Standard/Unlimited modes and attached preflight/Concept Review runtime. No Phase 1.5 browser errors were observed. Mint emitted only its pre-existing browser autoplay-policy warnings for sound unlock.

## Files Changed

Modified tracked files:

- `build/faculty-build-composer/composer-core.js`
- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`
- `build/faculty-build-composer/tests/run_active_composer_suite.js`
- `downloads/resources/mastery-quests-faculty-template.html`
- `play/economic-realm/index.html`
- `play/economic-realm/{market-gate,national-ledger,equilibrium-crisis,liquidity-grid,stabilization-protocol}/index.html`
- `play/macro-command-system/{national-engine,mint-ash-gold,command-nexus,exchange-citadel}/index.html`
- `play/managerial-intelligence-directorate/{cost-directive,market-signal,strategy-desk,agency-protocol}/index.html`
- `play/micro-domains/labyrinth-of-choice/index.html`

New files:

- `build/faculty-build-composer/tests/run_phase15_production_hardening_validation.js`
- `audit_tools/phase15_content_audit.mjs`
- `PHASE-1.5-PRODUCTION-INVENTORY.md`
- `PHASE-1.5-REMEDIATION-AUDIT.md`
- `PHASE-1.5-MARKET-GATE-CH4-CH6-GRAPH-AUDIT.md`
- `PHASE-1.5-PRODUCTION-HARDENING-REPORT.md`

## Git Review

- `git diff --check`: passed; only Git line-ending conversion notices were printed.
- Tracked `git diff --stat`: 19 files changed, 6,091 insertions, 104 deletions. New untracked reports/tools/tests are not included in Git's default diff stat.
- Final tree: 19 modified tracked files and 6 intentional untracked Phase 1.5 files.
- No commit was created.
