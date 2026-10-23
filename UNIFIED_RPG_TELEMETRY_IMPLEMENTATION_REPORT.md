# Unified RPG telemetry implementation report

## 1. Baseline and isolation

Started from freshly fetched origin/main **9d42672a** on October 23, 2026. Work is on **unified-rpg-telemetry**, in the separate worktree at C:/Users/Jennings/Documents/Mastery Quests Website/masteryquests-telemetry. The audit and proposed contract preceded product edits. The owner checkout and main were not used for implementation. This report describes the local feature commit; no push, merge, deployment, Worker configuration or production route change was performed.

## 2. Complete inventory and supported-mode matrix

There are 14 published RPG games plus the Composer/Arcane Archive template, covering **142 supported game/mode pairs**. Every row below supports Standard Campaign, Timed Trial, Exam Drill, Quiz, Unlimited Practice, Legendary, Score Attack, Fading Fortune and Risk & Reward. Trial by Graph availability is shown separately. Faculty recipes may intentionally enable a subset; the full template's ten modes were tested using an actual Composer-generated build.

| Game | Collection | Historical → current columns | Trial by Graph | Validated mode samples |
| --- | --- | --- | --- | --- |
| Arcane Archive / faculty-generated games | faculty-composer | 117 → 137 | Yes | 10/10 |
| equilibrium-crisis | economic-realm | 117 → 137 | Yes | 10/10 |
| liquidity-grid | economic-realm | 117 → 137 | Unavailable | 9/9 |
| market-gate | economic-realm | 117 → 137 | Yes | 10/10 |
| national-ledger | economic-realm | 117 → 137 | Unavailable | 9/9 |
| stabilization-protocol | economic-realm | 117 → 137 | Yes | 10/10 |
| command-nexus | macro-command-system | 117 → 137 | Unavailable | 9/9 |
| exchange-citadel | macro-command-system | 117 → 137 | Unavailable | 9/9 |
| mint-ash-gold | macro-command-system | 117 → 137 | Unavailable | 9/9 |
| national-engine | macro-command-system | 117 → 137 | Unavailable | 9/9 |
| agency-protocol | managerial-intelligence-directorate | 88 → 137 | Unavailable | 9/9 |
| cost-directive | managerial-intelligence-directorate | 88 → 137 | Unavailable | 9/9 |
| market-signal | managerial-intelligence-directorate | 88 → 137 | Yes | 10/10 |
| strategy-desk | managerial-intelligence-directorate | 88 → 137 | Yes | 10/10 |
| labyrinth-of-choice | micro-domains | 70 → 137 | Yes | 10/10 |

The Managerial classroom and private telemetry-POC delivery variants use the same maintained four-game adapter; they also pass eight live transport browser cases. Both distributed manual faculty templates are synchronized. Econ-nections, frozen builds, unrelated analytics and the private 82-column administrative export remain separate systems.

## 3. Canonical contract and historical comparison

**Exactly 137 columns; csvSchemaVersion = mq-rpg-csv/1.** The canonical ordered registry is [schema.json](audit_tools/unified_rpg_telemetry/schema.json). The historical 117 names/order remain first, followed by the 17 meaningful fields missing from that format, then three explicit export metadata columns. Historical local formats had 70, 88 and 117 columns; their union contains 134 distinct names. The original mq-measurement/1 identity and tracker revisions are preserved independently of the new CSV version.

The extension consists of 16 existing Risk & Reward measurements (bankroll before/after, wager amount/percent/tier, all-in flag, starting/final/net/peak bankroll, largest wager, all-in attempts, bust, completed questions, target and wager distribution), Managerial gameplayResponseTimeMs, csvSchemaVersion, collectionID and fieldAvailabilityJSON. The two response clocks represent distinct observations. No existing field was retired, renamed or consolidated, and no redundant alias was added.

## 4. Field-by-field crosswalk and definitions

[UNIFIED_RPG_TELEMETRY_AUDIT.md](UNIFIED_RPG_TELEMETRY_AUDIT.md) records the baseline audit. [baseline.json](audit_tools/unified_rpg_telemetry/baseline.json) contains each game's exact historical ordered header, mode inventory, historical schema positions, source assignment expressions/line numbers, and per-column meanings/types/units. [UNIFIED_RPG_TELEMETRY_CONTRACT.md](UNIFIED_RPG_TELEMETRY_CONTRACT.md) lists all 137 final positions, definitions, units and applicability rules. The registry carries the machine-readable final field rules and source aliases. These documents together form the complete historical-to-final crosswalk.

## 5. Collection logic and architecture

No new behavioral observation listener or learner identifier was introduced. Newly preserved fields come from existing emitted event payloads previously dropped by a narrower serializer: especially Composer/Economic/Macro wagering and Managerial/Micro Exam, checkpoint, artifact and Daily data where the engine actually supplies them. Source absence remains explicit. Labyrinth receives no invented visibility/focus/copy measurements.

The shared pure normalization function is maintained in audit_tools/unified_rpg_telemetry/runtime.js and embedded by the existing telemetry generator. MQContract.stamp stores a compact typed normalization delta and availability status next to the original raw event. Unchanged values, particularly large answer snapshots, are referenced rather than duplicated. Gameplay-facing raw values, private payloads and persistence namespaces are retained. Export creates normalized copies and disclosure-safe snapshots. No new clock reads, randomness, gameplay calls, timer manipulation or progression logic are introduced.

Managerial's visibility-aware responseTimeMs and original gameplayResponseTimeMs remain distinct. All observed duration sources already use milliseconds, so no speculative conversion was added. UTC timestamps and local-calendar Daily dates retain their original meanings. Visibility-aware response time includes its measured hidden component; activeResponseTimeMs identifies the measured visible component. Labyrinth wall-clock responses cannot be decomposed retrospectively.

Existing maintained generation paths synchronize Composer, manual templates, Economic Realm, Macro, Micro and Managerial variants. [README.md](audit_tools/unified_rpg_telemetry/README.md) provides the exact regeneration sequence. Historical define.mjs is a bootstrap/audit scaffold, not a normal regeneration command.

## 6. Missing values and mode applicability

Observed zero remains zero and observed booleans remain 0/1. Blank cells have explicit fieldAvailabilityJSON reasons: not-applicable, not-measured, unavailable, or legacy-ambiguous. Invalid/nonfinite intervals are unavailable; old zero defaults whose provenance cannot be recovered become legacy-ambiguous. Accepted wrong answers remain observed correct=0. Lifecycle/draft rows never become accepted wrong answers or instantaneous responses.

Risk & Reward fields apply only in that mode; Fading Fortune fields only there; Exam navigation/revision fields only in Exam; summary fields apply to terminal events. Accepted correctness applies only to question events, while provisional responses remain separate. Daily fields require a real Daily context; completion-dependent Daily durations require completion. Checkpoint/artifact fields require their actual source events/mechanics; no standardized guardian label is translated into correctness. Detailed per-field applicability is in the registry and contract. Game/mode availability is the matrix above; no mode was enabled to make a test pass.

## 7. Exam disclosure and event integrity

Active Exam exports withhold answer keys, correctness, revision direction, streak/score indicators, checkpoint results/target labels and Daily progress, including earlier committed rows. Draft snapshots never gain answer keys. Completed accepted-response reports retain authorized snapshots. Stored unfinished Exam reports retain the same restrictions after reload or switching runs: disclosure is authorized only by a recorded complete, exam_complete or exam_ended_by_student event, never by the current screen or a Daily completion event. Existing Macro active-Exam download deferral is preserved. The exporter does not change the game's completion or early-exit policy.

Baseline comparisons and full Exam checks preserve Labyrinth's 36 accepted responses, exactly-once commitments, three sections, delayed feedback, no Exam artifacts/setbacks, neutral introductions and unchanged randomness/progression. Standard guardian failures still occur on the first wrong answer with the established three-room setback and no failed-encounter reward. Repeated downloads add no gameplay attempts or stored events. Reloads preserve recorded timing, visibility and copy values.

## 8. Legacy and instructor-tool compatibility

The validator recognizes the exact historical 70/88/117 headers and earlier documented schemas, separately from the new versioned registry. Class Answer Analysis remains header-name based and accepts the new 137-column samples; unsupported future csvSchemaVersion values stop interpretation. Historical data retains historical definitions and is not reconstructed from current banks. All 142 actual browser samples parse, validate and import. The complete seeded Labyrinth Exam imports 36 accepted answers, 21 correct, with zero duplicate accepted attempts. Legacy/future fixtures and existing answer-analysis regressions pass.

## 9. Faculty Resources dictionary

The existing [Faculty Resources telemetry data dictionary](how-to/telemetry-data-dictionary/index.html) and its fields.json now document all 137 fields, collection/mode applicability, measurement sources, units, blank reasons and limitations. Existing layout, category navigation and accessibility structure are preserved. The introduction explains that shared columns enable consistent interpretation without equating different games' scores. Focus/copy/timing observations are contextual measurements, not conclusions about learning, motivation or misconduct. Dictionary drift and rendering checks pass.

## 10. Tests executed and final results

All required test cases have passing final results. Counts below are case/runner counts within their own suites, not additive independent gameplay scenarios. Full completion is tested in the established gameplay suites; the 142-pair matrix separately proves real download/schema/value/import coverage and is not a claim of 142 complete campaigns.

| Suite / command | Final result | Local evidence under tmp/unified-rpg-telemetry/ |
| --- | --- | --- |
| node audit_tools/unified_rpg_telemetry/check.mjs | 12/12 PASS | unit.log; unit-results.json |
| node audit_tools/unified_rpg_telemetry/browser.mjs; samples.mjs | 142/142 supported game/mode downloads validate and import | samples.json; samples.log; browser/; browser-final.log; agency-final.log |
| node audit_tools/unified_rpg_telemetry/semantics.mjs | 4/4 PASS | semantics.log; semantics/results.json; semantics/*.csv |
| node audit_tools/telemetry_contract/check.mjs | 16/16 PASS | contract-final.log; contract-final/targeted-results.json |
| node audit_tools/managerial_telemetry_parity/run-parity.mjs | 16/16 PASS | managerial-parity.log; managerial/parity-results.json |
| node audit_tools/managerial_telemetry_parity/run-browser.mjs | 9/9 PASS | managerial-browser.log |
| node build/faculty-build-composer/tests/run_active_composer_suite.js, plus the three corrected runners below | 40/40 runners PASS after corrections | composer.log and composer-*-rerun.log |
| node audit_tools/labyrinth_alignment/validate.mjs phase2, plus focused responsive/accessibility reruns | 24/24 PASS after environment correction | labyrinth-phase2.log; labyrinth-responsive.log; labyrinth-accessibility.log |
| node audit_tools/labyrinth_alignment/validate.mjs deep | 16/16 PASS | labyrinth-deep.log; labyrinth/deep-results.json |
| Labyrinth focused complete Exam on final code | 1/1 PASS; 36 accepted, 21 correct, zero duplicates | labyrinth-final-exam.log; labyrinth-final-exam/ |
| node audit_tools/economic_realm_engine/browser.mjs | 104/104 PASS | economic-final.log; economic-final/browser-results.json |
| node audit_tools/macro_command_engine/browser.mjs | 91/91 PASS | macro-final.log; macro-final/browser-results.json |
| node audit_tools/economic_realm_engine/check.mjs | PASS; 22 protected functions per game and 238 companion files | economic-source.log |
| node audit_tools/macro_command_engine/check.mjs | PASS; 22 protected functions per game and 159 companion files | macro-source.log |
| Maintained generators --check (contract, Managerial/Composer behavior, answer-analysis/Micro, activation, transport, Economic and Macro); dictionary render --check | PASS; generated outputs reproducible | generator-check.log; economic-sync-check.log; macro-sync-check.log; dictionary-render.log |
| node audit_tools/telemetry_data_dictionary/check.mjs; node audit_tools/telemetry_contract/inventory.mjs | PASS; 137 dictionary fields, all delivery variants and historical/private inventory | dictionary.log; inventory.log |
| node audit_tools/public_site_publication/build-dist.mjs | PASS; 2,408 files, zero forbidden files, zero incoming question assets | publication.log |
| git diff --check | PASS | diff-warnings.log |

The semantic browser tests control the clock and record exactly 2,000 ms hidden time, one visibility transition, one copy observation, valid focus/selection observations and active + hidden = response time in tracked engines. The Micro case verifies these unavailable fields remain blank. Tests also cover observed zero versus missing, escaped commas/quotes/newlines/Unicode, wager values, original clocks, legacy resume, private envelope compatibility and whole-source protection outside measurement/header blocks. Existing regression suites cover correct/wrong responses, revisions, guardian success/failure, timers, recovery/remediation, terminal reports, persistence, stale-state isolation, desktop/mobile layouts and accessibility. Browser automation used Edge and the installed Playwright runtime.

### Initial failures and their resolution

The broad Composer invocation passed 37 runners and failed three. One compared immutable fixture hashes across Windows line endings; two needed existing ignored faculty audit fixtures absent in the fresh worktree. Hash checking now normalizes line endings, original fixtures remain unchanged, the specific ignored audit fixtures were copied locally, and all three runners passed individually. The report does not describe the original broad invocation as a clean pass.

Six Labyrinth responsive/accessibility checks initially lacked axe-core. All six passed with the existing AXE_PATH supplied; the other 18 phase2 cases passed initially. Baseline comparisons explicitly use 9d42672a. The first mode inventory parser handled quoted supportedModes only and incorrectly included Agency Protocol Trial by Graph; it now handles the unquoted source too. Agency's actual nine modes passed, and the final 142-sample index contains only supported pairs.

Old tests expecting pre-modernization guardian failure/guide behavior or 70/88/117 current headers were updated to the inspected current baseline, with separate legacy assertions retained. Economic generated-file and protected fixture comparisons normalize Windows newlines, rather than changing question content. A sandboxed Worker test was rerun with the required local execution permissions and passed. Earlier diagnostic logs remain as evidence; final results above identify the authoritative reruns. After the broad suites, final review strengthened stored unfinished-Exam disclosure; the 12-case contract/source suite, four semantic browser cases, complete Labyrinth Exam parity, generator checks and publication build were repeated for that narrow export-only change.

### Complete Composer runner summary

| Runner | Final result | Evidence log |
| --- | --- | --- |
| run_macro_faculty_closure_validation.js | PASS | composer.log |
| run_faculty_outcome_validation.js | PASS | composer.log |
| run_content_scope_validation.js | PASS | composer.log |
| run_default_character_set_validation.js | PASS | composer.log |
| run_exam_navigation_boss_reveal_validation.js | PASS | composer.log |
| run_checkpoint_artifact_exam_integrity_validation.js | PASS | composer.log |
| run_standard_boss_progression_validation.mjs | PASS | composer.log |
| run_guide_intro_validation.js | PASS | composer.log |
| run_phase1_targeted_repair_validation.js | PASS | composer.log |
| run_phase15_production_hardening_validation.js | PASS | composer.log |
| run_visibility_aware_telemetry_validation.js | PASS | composer.log |
| run_generated_telemetry_smoke.js | PASS | composer.log |
| run_question_id_telemetry_validation.mjs | PASS | composer.log |
| run_answer_analysis_validation.mjs | PASS | composer.log |
| run_phase3a_official_theme_validation.js | PASS | composer.log |
| run_phase3b_custom_asset_validation.js | PASS | composer.log |
| run_phase3e_graph_question_sync_validation.mjs | PASS | composer.log |
| run_question_quality_auditor_validation.mjs | PASS (corrected rerun) | composer-quality-rerun.log |
| run_macro_phase2_taxonomy_validation.mjs | PASS | composer.log |
| run_checkpoint_remediation_design_change_validation.mjs | PASS | composer.log |
| run_legendary_final_checkpoint_validation.mjs | PASS | composer.log |
| run_question_bank_comprehensive_validation.mjs | PASS | composer.log |
| run_concept_review_integration.js | PASS | composer.log |
| run_mastery_report_concept_reviews.js | PASS | composer.log |
| run_mastery_report_2_validation.js | PASS | composer.log |
| run_mastery_report_state_leak_hotfix.js | PASS | composer.log |
| run_mode_availability_fix.js | PASS | composer.log |
| run_quiz_mode_validation.js | PASS | composer.log |
| run_unlimited_practice_validation.js | PASS | composer.log |
| run_trial_by_graph_validation.js | PASS (corrected rerun) | composer-graph-rerun.log |
| run_fading_fortune_validation.js | PASS | composer.log |
| run_risk_reward_validation.js | PASS | composer.log |
| run_risk_reward_state_validation.js | PASS | composer.log |
| run_macro_faculty_voice_validation.js | PASS | composer.log |
| run_macro_faculty_voice_pass2_validation.js | PASS | composer.log |
| run_macro_faculty_voice_pass3_validation.js | PASS | composer.log |
| run_micro_faculty_voice_validation.js | PASS | composer.log |
| run_micro_faculty_voice_pass3_validation.js | PASS | composer.log |
| run_faculty_validation_remediation.js | PASS (corrected rerun) | composer-faculty-rerun.log |
| run_repeated_game_distractors_validation.js | PASS | composer.log |

For reproduction, set PLAYWRIGHT_MODULE to the installed Playwright package, AXE_PATH to the existing axe-core script, and MQ_LABYRINTH_BASELINE/MQ_LABYRINTH_EXAM_BASELINE to 9d42672a. Route output using MQ_EVIDENCE_DIR, MQ_A11Y_OUT, MQ_REALM_OUT or MQ_MACRO_OUT as appropriate so artifacts remain ignored. The full Composer suite also needs the existing ignored faculty audit fixtures described above.

## 11. Export samples for every supported game and mode

The authoritative [samples.json](tmp/unified-rpg-telemetry/samples.json) records all **142** files, game/collection/mode, 137-column equality, accepted-count checks and passing status. All files below are actual browser downloads, retained locally in the ignored evidence directory. They are deliberately excluded from the commit.

| Game | Mode sample CSVs |
| --- | --- |
| Arcane Archive / faculty-generated games | [standard](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-score.csv), [trialGraph](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-trialGraph.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/Arcane-Archive-faculty-generated-games-riskReward.csv) |
| equilibrium-crisis | [standard](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-score.csv), [trialGraph](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-trialGraph.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/equilibrium-crisis-riskReward.csv) |
| liquidity-grid | [standard](tmp/unified-rpg-telemetry/browser/liquidity-grid-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/liquidity-grid-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/liquidity-grid-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/liquidity-grid-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/liquidity-grid-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/liquidity-grid-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/liquidity-grid-score.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/liquidity-grid-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/liquidity-grid-riskReward.csv) |
| market-gate | [standard](tmp/unified-rpg-telemetry/browser/market-gate-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/market-gate-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/market-gate-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/market-gate-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/market-gate-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/market-gate-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/market-gate-score.csv), [trialGraph](tmp/unified-rpg-telemetry/browser/market-gate-trialGraph.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/market-gate-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/market-gate-riskReward.csv) |
| national-ledger | [standard](tmp/unified-rpg-telemetry/browser/national-ledger-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/national-ledger-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/national-ledger-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/national-ledger-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/national-ledger-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/national-ledger-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/national-ledger-score.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/national-ledger-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/national-ledger-riskReward.csv) |
| stabilization-protocol | [standard](tmp/unified-rpg-telemetry/browser/stabilization-protocol-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/stabilization-protocol-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/stabilization-protocol-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/stabilization-protocol-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/stabilization-protocol-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/stabilization-protocol-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/stabilization-protocol-score.csv), [trialGraph](tmp/unified-rpg-telemetry/browser/stabilization-protocol-trialGraph.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/stabilization-protocol-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/stabilization-protocol-riskReward.csv) |
| command-nexus | [standard](tmp/unified-rpg-telemetry/browser/command-nexus-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/command-nexus-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/command-nexus-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/command-nexus-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/command-nexus-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/command-nexus-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/command-nexus-score.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/command-nexus-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/command-nexus-riskReward.csv) |
| exchange-citadel | [standard](tmp/unified-rpg-telemetry/browser/exchange-citadel-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/exchange-citadel-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/exchange-citadel-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/exchange-citadel-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/exchange-citadel-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/exchange-citadel-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/exchange-citadel-score.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/exchange-citadel-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/exchange-citadel-riskReward.csv) |
| mint-ash-gold | [standard](tmp/unified-rpg-telemetry/browser/mint-ash-gold-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/mint-ash-gold-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/mint-ash-gold-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/mint-ash-gold-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/mint-ash-gold-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/mint-ash-gold-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/mint-ash-gold-score.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/mint-ash-gold-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/mint-ash-gold-riskReward.csv) |
| national-engine | [standard](tmp/unified-rpg-telemetry/browser/national-engine-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/national-engine-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/national-engine-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/national-engine-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/national-engine-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/national-engine-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/national-engine-score.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/national-engine-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/national-engine-riskReward.csv) |
| agency-protocol | [standard](tmp/unified-rpg-telemetry/browser/agency-protocol-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/agency-protocol-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/agency-protocol-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/agency-protocol-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/agency-protocol-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/agency-protocol-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/agency-protocol-score.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/agency-protocol-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/agency-protocol-riskReward.csv) |
| cost-directive | [standard](tmp/unified-rpg-telemetry/browser/cost-directive-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/cost-directive-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/cost-directive-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/cost-directive-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/cost-directive-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/cost-directive-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/cost-directive-score.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/cost-directive-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/cost-directive-riskReward.csv) |
| market-signal | [standard](tmp/unified-rpg-telemetry/browser/market-signal-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/market-signal-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/market-signal-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/market-signal-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/market-signal-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/market-signal-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/market-signal-score.csv), [trialGraph](tmp/unified-rpg-telemetry/browser/market-signal-trialGraph.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/market-signal-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/market-signal-riskReward.csv) |
| strategy-desk | [standard](tmp/unified-rpg-telemetry/browser/strategy-desk-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/strategy-desk-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/strategy-desk-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/strategy-desk-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/strategy-desk-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/strategy-desk-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/strategy-desk-score.csv), [trialGraph](tmp/unified-rpg-telemetry/browser/strategy-desk-trialGraph.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/strategy-desk-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/strategy-desk-riskReward.csv) |
| labyrinth-of-choice | [standard](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-standard.csv), [timed](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-timed.csv), [exam](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-exam.csv), [quiz](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-quiz.csv), [unlimited](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-unlimited.csv), [legendary](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-legendary.csv), [score](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-score.csv), [trialGraph](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-trialGraph.csv), [fadingFortune](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-fadingFortune.csv), [riskReward](tmp/unified-rpg-telemetry/browser/labyrinth-of-choice-riskReward.csv) |

Additional complete-Exam, early-exit, repeated-download, visibility and reload samples are in labyrinth-final-exam/ and semantics/. Initial diagnostic outputs and screenshots are retained under the same ignored root. Existing tests that wrote tracked validation evidence were copied under tracked-test-output/ and their tracked files restored to baseline; no temporary evidence is committed.

## 12. Exact files changed

The following 57 source/documentation files comprise the feature change. Generated game/helper files derive from maintained sources; test-only changes adapt validation to the versioned contract and the current production baseline.

- .gitignore
- TELEMETRY_CONTRACT.md
- UNIFIED_RPG_TELEMETRY_AUDIT.md
- UNIFIED_RPG_TELEMETRY_CONTRACT.md
- UNIFIED_RPG_TELEMETRY_IMPLEMENTATION_REPORT.md
- audit_tools/economic_realm_engine/browser.mjs
- audit_tools/economic_realm_engine/check.mjs
- audit_tools/economic_realm_engine/sync.mjs
- audit_tools/economic_realm_questions/sync.mjs
- audit_tools/labyrinth_alignment/validate.mjs
- audit_tools/macro_command_engine/browser.mjs
- audit_tools/telemetry_contract/check.mjs
- audit_tools/telemetry_contract/generate.mjs
- audit_tools/telemetry_contract/hash.mjs
- audit_tools/telemetry_contract/inventory.mjs
- audit_tools/telemetry_contract/public-release-registry.json
- audit_tools/telemetry_contract/registry.json
- audit_tools/telemetry_contract/runtime.js
- audit_tools/telemetry_contract/validate.mjs
- audit_tools/telemetry_data_dictionary/check.mjs
- audit_tools/unified_rpg_telemetry/README.md
- audit_tools/unified_rpg_telemetry/audit.mjs
- audit_tools/unified_rpg_telemetry/baseline.json
- audit_tools/unified_rpg_telemetry/browser.mjs
- audit_tools/unified_rpg_telemetry/check.mjs
- audit_tools/unified_rpg_telemetry/define.mjs
- audit_tools/unified_rpg_telemetry/dictionary.mjs
- audit_tools/unified_rpg_telemetry/runtime.js
- audit_tools/unified_rpg_telemetry/samples.mjs
- audit_tools/unified_rpg_telemetry/schema.json
- audit_tools/unified_rpg_telemetry/semantics.mjs
- audit_tools/unified_rpg_telemetry/sync.mjs
- build/faculty-build-composer/anonymous-telemetry-source.js
- build/faculty-build-composer/measurement-build.js
- build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html
- build/faculty-build-composer/tests/faculty-micro-remediation-approved-revisions.js
- build/faculty-build-composer/tests/run_phase15_production_hardening_validation.js
- build/faculty-build-composer/tests/run_question_id_telemetry_validation.mjs
- build/faculty-build-composer/tests/run_question_quality_auditor_validation.mjs
- downloads/resources/mastery-quests-faculty-starter.html
- downloads/resources/mastery-quests-faculty-template.html
- how-to/telemetry-data-dictionary/fields.json
- how-to/telemetry-data-dictionary/index.html
- play/economic-realm/equilibrium-crisis/index.html
- play/economic-realm/liquidity-grid/index.html
- play/economic-realm/market-gate/index.html
- play/economic-realm/national-ledger/index.html
- play/economic-realm/stabilization-protocol/index.html
- play/macro-command-system/command-nexus/index.html
- play/macro-command-system/exchange-citadel/index.html
- play/macro-command-system/mint-ash-gold/index.html
- play/macro-command-system/national-engine/index.html
- play/managerial-directorate-classroom/telemetry-client.js
- play/managerial-directorate-telemetry-poc/telemetry-client.js
- play/managerial-intelligence-directorate/local-telemetry.js
- play/micro-domains/labyrinth-of-choice/index.html
- tools/answer-analysis/analysis.js

## 13. Remaining limitations and owner review

No unresolved failing supported-mode or gameplay regression case remains in the final results. Labyrinth still does not measure visibility/focus/copy; blanks describe that limitation. Legacy zero defaults cannot always be recovered; their missing reasons deliberately preserve uncertainty. Existing 1,500-row limits, browser storage denial/quota and prior prefix truncation can limit history; deliveryQuality and manifests report existing loss without inventing observations. Scores, adaptive routes and content are not equivalent across games merely because columns align. Older already-distributed faculty files are not retroactively modified; newly generated/downloaded templates use this contract. Browser evidence covers the established Edge harness; it does not certify every browser/storage environment.

Owner review before a future release should confirm the documented 137-field extension, the blank/reason-code convention (including legacy-ambiguous), and the decision to leave unmeasured Labyrinth behavioral fields blank. These are explicit proposed contract choices already implemented and tested, not requests to change gameplay. A release/migration note should tell instructors to identify the version and interpret missing values before combining old and new datasets. Push, merge and production deployment require separate authorization; no such action was taken here.
