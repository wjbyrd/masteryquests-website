# Unified RPG telemetry audit

Production baseline: origin/main 9d42672a, fetched October 23, 2026. Dedicated branch: unified-rpg-telemetry. This audit was completed before product edits.

## Active inventory

| Game | Collection | Columns | Supported mode keys |
| --- | --- | --- | --- |
| Arcane Archive / faculty-generated games | faculty-composer | 117 | standard, timed, exam, quiz, unlimited, legendary, score, trialGraph, fadingFortune, riskReward |
| equilibrium-crisis | economic-realm | 117 | standard, timed, exam, quiz, unlimited, legendary, score, trialGraph, fadingFortune, riskReward |
| liquidity-grid | economic-realm | 117 | standard, timed, exam, quiz, unlimited, legendary, score, fadingFortune, riskReward |
| market-gate | economic-realm | 117 | standard, timed, exam, quiz, unlimited, legendary, score, trialGraph, fadingFortune, riskReward |
| national-ledger | economic-realm | 117 | standard, timed, exam, quiz, unlimited, legendary, score, fadingFortune, riskReward |
| stabilization-protocol | economic-realm | 117 | standard, timed, exam, quiz, unlimited, legendary, score, trialGraph, fadingFortune, riskReward |
| command-nexus | macro-command-system | 117 | standard, timed, exam, quiz, unlimited, legendary, score, fadingFortune, riskReward |
| exchange-citadel | macro-command-system | 117 | standard, timed, exam, quiz, unlimited, legendary, score, fadingFortune, riskReward |
| mint-ash-gold | macro-command-system | 117 | standard, timed, exam, quiz, unlimited, legendary, score, fadingFortune, riskReward |
| national-engine | macro-command-system | 117 | standard, timed, exam, quiz, unlimited, legendary, score, fadingFortune, riskReward |
| agency-protocol | managerial-intelligence-directorate | 88 | standard, timed, exam, quiz, unlimited, legendary, score, fadingFortune, riskReward |
| cost-directive | managerial-intelligence-directorate | 88 | standard, timed, exam, quiz, unlimited, legendary, score, fadingFortune, riskReward |
| market-signal | managerial-intelligence-directorate | 88 | standard, timed, exam, quiz, unlimited, legendary, score, trialGraph, fadingFortune, riskReward |
| strategy-desk | managerial-intelligence-directorate | 88 | standard, timed, exam, quiz, unlimited, legendary, score, trialGraph, fadingFortune, riskReward |
| labyrinth-of-choice | micro-domains | 70 | standard, timed, exam, quiz, unlimited, legendary, score, trialGraph, fadingFortune, riskReward |

The Composer template is the maintained Arcane Archive/faculty-generated engine; arbitrary faculty recipes change game identity and mode availability, not measurement definitions. The two distributed manual templates are additional delivery artifacts. Managerial classroom and telemetry-POC copies are transport variants of the same four games; their local CSV adapter is maintained separately from the private admin envelope. Econ-nections, simulations, legacy frozen builds and question-bank analysis are excluded.

## Exact headers, column crosswalk and event sources

[baseline.json](audit_tools/unified_rpg_telemetry/baseline.json) freezes every game's exact ordered runtime header (including Managerial adapter additions), declared header, supported modes, source event vocabulary, generator, every column's definition/type/unit/event applicability, historical positions, and source assignment expressions with line numbers. It is machine readable, pinned to 9d42672a, and reproducible with audit.mjs. The maintained historical dictionary is the semantic starting point; the corrections below override its ambiguous default interpretation.

| Historical schema | Fields |
| --- | --- |
| micro-local-contract1-answers1 | 70 |
| managerial-local-contract1-answers1 | 88 |
| composer-local-contract1-answers1 | 117 |

The union contains 134 distinct existing fields. The 117-column format omits riskRewardBankrollBefore, riskRewardWagerAmount, riskRewardWagerPercent, riskRewardWagerTier, riskRewardBankrollAfter, riskRewardAllIn, riskRewardStartingBankroll, riskRewardFinalBankroll, riskRewardNet, riskRewardPeakBankroll, riskRewardLargestWager, riskRewardAllInAttempts, riskRewardBusted, riskRewardQuestionsCompleted, riskRewardTarget, riskRewardWagerDistribution, gameplayResponseTimeMs. No existing field is retired.

## Measured values versus declarations

Composer, Economic Realm and Macro share the Composer serializer and visibility/interaction tracker. They emit Risk & Reward payloads but their serializer drops those 16 fields. Managerial stores them and appends gameplayResponseTimeMs to preserve the original gameplay clock alongside its visibility-aware responseTimeMs. Labyrinth stores Risk & Reward and Fading Fortune fields in its later overriding sendGameData; its first serializer is superseded. Labyrinth declares no visibility/focus/copy tracker. Adding columns cannot establish those measurements.

Composer serializes Daily Tasks, Exam navigation/revisions, guardian checkpoints and artifact payloads. Managerial's engine emits additional events but its historical header omits those fields. Labyrinth's revised Exam records initial/revised answers and section commits but does not supply Composer's revision-direction metadata; that metadata must remain unmeasured. Its Daily observer runs outside the fixed serializer. A question-presented row may inherit the current question version/difficulty without a submitted response. Placeholder -1 selection and default-zero correctness on lifecycle/draft rows are not observations.

## Clocks and counts

Local timestamp is new Date().toISOString() at row creation (UTC). All active RPG responseTime payloads inspected use milliseconds (Date.now minus questionStartTime, or accumulated view milliseconds). The TimeMs suffix is retained. Managerial distinguishes gameplayResponseTimeMs from visibility-aware responseTimeMs; Labyrinth's responseTimeMs is its gameplay interval and cannot be decomposed into active/hidden time. Exam timestamp is commitment time, while response duration may aggregate revisits. Background time must not be called active time. No seconds-to-milliseconds conversion is justified for these active sources. Historical labels remain unchanged.

Accepted responses are event=question; rapid_guessing is rejected, and exam_answer_initial/exam_answer_revision are provisional. Attempts, maxStreak, score and completion summaries come from the engine, not a row-count estimate. Prior exposures count retained local question/rapid-guess records (Labyrinth's older writer counted only question). Counts can understate earlier exposure after truncation. Boss event terminology is collection-specific: Labyrinth Exam boss_defeated records encounter completion even if the checkpoint is not secured. Do not infer correctness from that name.

## Persistence, resume and downloads

Each engine retains local rows per run, capped at 1,500. Existing save namespaces and run IDs survive resume; contract state stores sequences, immutable manifests and view/attempt slots beside the local stream. exportRows copies retained rows and appends export_manifest rows without adding gameplay events. Manifest deliveryQuality reports prefix truncation/storage failures; a missing history cannot be reconstructed. LocalStorage denial can prevent complete evidence. New exports must preserve original versions and explicit unavailable status for legacy rows.

Downloads use one Blob-backed CSV, quoted cells with doubled quotes, CRLF record separators and game/mode/run filenames. Managerial currently supplies a UTF-8 BOM; Composer and Labyrinth do not. Macro intentionally defers active Exam downloads; Labyrinth permits its existing provisional-safe early export. Keep those entry-point restrictions. No clipboard contents are collected.

## Consumers and legacy compatibility

Class Answer Analysis (tools/answer-analysis/analysis.js) maps header names, recognizes question versus draft/rapid rows, joins attempt IDs, and uses immutable answerSnapshotJSON. Its timing currently uses positive responseTimeMs and warns about pauses; it does not infer active attention. The local validator (audit_tools/telemetry_contract/validate.mjs) recognizes exact ordered historical schemas, including 70/88/117 and earlier variants. Existing inventory/dictionary tests assume different headers and need explicit version-aware updates. The private Worker/admin 82-column envelope is a separate contract and must remain unchanged.

## Recommended decisions before implementation

Use the 134-field union plus csvSchemaVersion, collectionID and fieldAvailabilityJSON: **137 columns**, version **mq-rpg-csv/1**. Preserve existing column names and original measurement revisions. Store a typed normalization snapshot alongside new local rows; leave gameplay-facing raw row values unchanged. Export absent numeric/boolean values as blank; fieldAvailabilityJSON distinguishes not-applicable, not-measured and unavailable, plus legacy-ambiguous when an old default cannot be resolved. Retain measured zero. Do not retrofit Labyrinth with fabricated visibility metrics. Capture already-emitted payloads lost by historical writers; do not add event listeners or consume randomness.
