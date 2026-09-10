# Published Managerial Architecture and Telemetry Parity

## Executive Summary

**PASS WITH NOTES — implemented and validated locally; not deployed.** Audited the four currently linked public targets: The Cost Directive, The Market Signal, The Strategy Desk, and The Agency Protocol under /play/managerial-intelligence-directorate/.

Current dailies, utility-menu cleanup, guide/boss introductions, boss reveal, exam navigation, modes, save/resume, artifacts, adaptive engine and Mastery Report already match the classroom architecture. They were preserved. The genuine telemetry gap was the public 57-column local exporter without the richer tracker. A generated local-only adapter now supplies the validated 75-column vocabulary, retaining gameplay timing in gameplayResponseTimeMs. No anonymous ingestion was enabled. An existing Strategy Desk background filename mismatch was repaired with an exact artwork alias.

Validation: **103/103 targeted browser checks**, **11/11 source/regeneration checks**, **16/16 shared tracker/Worker regression checks**, and dictionary coverage across **12 game/build schemas** with 75 fields each and zero missing/stale names. Existing public UI suite: **53/57 both before and after**, with the same four historical Exam Drill assertions. Existing static suite: **22/24 both before and after**, with the same two historical assumptions. No new regression remains. Exact changed files are below.

## Source of Truth

The public collection page games/managerial-intelligence-directorate/index.html links to the public hub and four current game directories. The hub resolves the same game paths. The public game index.html files are the maintained runtime engines; instructional_resources.js and the external *_question_bank_student.js files supply course content. Shared managerial-parity.js/.css own current dailies, presentation and exam navigation.

Bank-file headers identify **generated student-facing artifacts** from Gauntlet Question Bank Publisher, with private faculty sources as their authoring input. Those external inputs/publisher are not tracked here. No content source was guessed or regenerated. Entire bank files and inline engine scripts remain identical, proving question IDs, choices, answer hashes, counts, tags, objectives, difficulties and pool membership unchanged. Header conversion counts are historical and were not substituted for a current inventory.

audit_tools/managerial_classroom/build.mjs instrumentHTML reads the current public game, adds private artifact research hooks and private base/storage/client markup, and retains public assets and the public UI adapter. Its classroom client is derived from play/managerial-directorate-telemetry-poc/telemetry-client.js. The POC is a private historical clone, not the current public gameplay/content source. The Composer helper in build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html remains the behavioral semantic source; the existing sync/check verifies the maintained private helper against it.

The pre-implementation classification matrix is audit_tools/published_managerial_parity/AUDIT.md; the task baseline commit and 1,652 file hashes are recorded in validation_artifacts/published_managerial_parity/baseline.json. All **1,648 protected files** remain byte-identical; the four allowed public HTML files each gain only a script include. A shared local adapter and one byte-identical artwork alias are generated additions. No current maintained dist copy or separate public engine generator was found. Historical migrations/POC clone builders should not replace current public sources.

## Architecture Parity Matrix

| Feature | Published implementation | Private/classroom implementation | Status | Action taken | Validation |
|---|---|---|---|---|---|
|Daily challenges, progress, completion, achievement hooks|Existing shared deterministic daily core and accepted-response hook|Same public adapter via base URL|ALREADY PRESENT|None|Daily suite, UI/browser baseline and after; file hash|
|Utility menu / cleanup|Existing consolidated menu, sound, fullscreen, daily details|Same HTML and adapter|ALREADY PRESENT|None|Four-game desktop/mobile/keyboard UI tests|
|Guide intro / boss intro / boss reveal|Current guide and checkpoint presentation wrappers|Same public markup, assets, wrapper|ALREADY PRESENT|None|Intro, reveal, encounter identity, keyboard and screenshots|
|Save/resume and run ownership|Existing save keys, run-session guards and restore|Same engine; private storage namespace differs|ALREADY PRESENT|Add independent tracker reset around existing callbacks|Same local run ID restored; clean measurement state; protected engine hash|
|Artifacts / duplicate ownership|Existing ownership, award, storage, and local artifact event|Same gameplay plus research award metadata|ALREADY PRESENT / INTENTIONALLY DIFFERENT|Preserve award logic; no private research metadata port|Boss awards/ownership browser suite; entire engine/UI hash|
|Consumable powers|Existing mode-gated powers and saved inventory|Same engine restrictions, including exam restrictions|ALREADY PRESENT|None|Engine and UI byte identity; existing mode regressions|
|Standard|Current public engine/pools|Classroom derives this engine|ALREADY PRESENT|Only local tracker integration|Normal/slow/next/selection/copy/tab scenarios on all four games|
|Exam Drill|Shared navigation, drafts, revision, section commitment|Same shared UI adapter|ALREADY PRESENT|Late finalize wrapper for telemetry views|Nine unique commits per section, revision, copy/hide accumulation, repeat-commit guard|
|Timed / Legendary / Score / Unlimited / Quiz|Supported public modes|Same engine|ALREADY PRESENT|Only response telemetry hooks|Each mode answered and downloaded on each game|
|Fading Fortune|Existing readiness, fade score, pause mechanics|Same engine; validated readiness hook|ALREADY PRESENT + PORTED TELEMETRY|Derive awaited readiness and independent clock|Mode answers; visible gameplay pause included in telemetry and preserved separately|
|Risk & Reward|Existing wager then reveal mechanics|Same engine; validated reveal hook|ALREADY PRESENT + PORTED TELEMETRY|Derive reveal hook|600ms wager wait excluded; response time begins after reveal|
|Trial by Graph|Market Signal and Strategy Desk only|Same bank eligibility|ALREADY PRESENT / NOT APPLICABLE|Do not add to Cost Directive or Agency Protocol|Both supported targets answered/downloaded|
|Mastery Report / completion|Existing report and completion flows|Same engine|ALREADY PRESENT|Preserve report; attach rich CSV to existing buttons|Report-button downloads; completion/new-run reset; no post-end rows|
|Adaptive repair / bridge / retest / streak / boss / rapid fluency|Existing inline engine and current shared wrappers|Copied from public engine|ALREADY PRESENT|No scheduler/economics changes|Controlled phase/boss snapshots; existing rapid/Daily checks; inline hash|
|Response timing|Original gameplay timer in responseTimeMs|Independent telemetry clock plus preserved gameplay value|PORTED|Derive snapshot at submission before verification|Wall = visible + hidden; gameplay clock mutation does not move telemetry clock|
|Visibility / focus|Absent richer local fields|Validated Composer-derived helper|PORTED|Same helper, accumulation and hooks|Single/multiple/deduplicated visibility; independent blur/focus; return intervals|
|Selection / copy|Absent richer local fields|Validated selection/count/copy helper|PORTED|Same helper; no content capture|Real DOM selections, copy signal, copy→hide/blur, next-question reset|
|Local CSV|57 original columns and UTF-8 serializer|75 columns with measured/legacy distinction and BOM|PORTED|Reuse exact local enrichment/export functions|All targets: 75 ordered columns; zero/blank; legacy Unicode/quoting; no extra rows|
|Anonymous ingestion / gate / storage isolation|Local-only; no transport or persistent anonymous identity|Private Worker collection and isolated storage|INTENTIONALLY DIFFERENT|Do not port transport, queue, identity, access gate or research events|No fetch/XHR/beacon requests; no anonymous keys; static forbidden-transport check|
|Pause/resume / interrupted runs|Existing engine lifecycle; local incomplete run rows only|Additional private interrupted/run lifecycle events|PORTED TELEMETRY / INTENTIONALLY DIFFERENT|Reset/suspend local tracker; do not add research event stream|Save/reload/Continue, incomplete CSV, independent focus and visible pause tests|
|Strategy Desk background|CSS names underscore path; original artwork filename contains spaces|Private base URL has the same missing alias|PORTED ASSET REPAIR|Generate byte-identical underscore alias from existing artwork|Source/alias byte equality; browser requested-assets check|

## Already Current

Dailies retain deterministic calendar scheduling, eligible challenge families, progress persistence and completion-once behavior. Menu cleanup, sound/fullscreen controls, daily details, guide introduction and boss encounter reveals were already present. The classroom build uses the same public shared UI file, so textual porting would have duplicated working architecture. Exam drafts, revisions, room navigation and deliberate section commitments also already exist in that file. Mode support, save ownership, consumable restrictions, artifacts, mastery reporting and adaptive repair/bridge/retest logic remain unchanged.

## Architecture Ported

- Generated local-telemetry.js: exact maintained Composer tracker region, private interval accumulation/reset/readiness logic, pre-verification snapshot wrapper, late exam-finalize wrapper, local row enrichment and CSV download functions. Public glue supplies only local context/run state and intentionally inert private lifecycle emits.
- One public script include per game, before managerial-parity.js. A global installation guard makes duplicate script loading inert.
- Classroom builder strips this public-only include before installing its own adapter; generated classroom HTML is identical to the existing checked-in output, so no private regeneration rewrite was necessary.
- Existing Composer synchronization now refreshes/checks the public derivative too. Public-only sync/check is available independently. Dictionary coverage now recognizes the four public targets.
- Strategy Desk question_background_image.webp is generated byte-for-byte from its existing question background image.webp. This resolves an observed pre-existing missing URL without changing art, CSS, question references or branding.

## Telemetry Parity

The adapter reuses calculations; it does not introduce another timing implementation. responseTimeMs measures the current telemetry interval; activeResponseTimeMs plus hiddenTimeMs equals that interval in controlled browser observations. The gameplay timer remains untouched and its original exported value is copied into gameplayResponseTimeMs. Visible modal/Fading Fortune pause time stays in visible telemetry. Window focus measurements remain independent and can overlap hidden time.

Selections use the shared settling/flush logic; only relevant question/answer-region counts, maximum trimmed UTF-16 length and flags are recorded. Copy timing uses the latest relevant copy and its first subsequent hide/blur. New questions and fresh/resumed runs use the maintained reset rules; menu activity does not become another response. Duplicate visibility/blur signals do not inflate counts. All four games passed duplicate-script checks with one response row and one copy count.

Exam drafts and revisions have their own view snapshots. Committed question rows aggregate the room's views with summed durations/counts, maximum selected length, any-region flags and the validated conditional timing conventions. The late finalize hook is installed only after the shared UI adapter is available; ordinary lifecycle wrappers are not installed twice. Each tested section produced nine unique committed rows; committing again produced no additional answer rows.

Fading Fortune starts after its asynchronous readiness step; Risk & Reward starts at reveal, excluding a tested 600ms wager-selection interval. All nine universally supported modes were exercised; Trial by Graph was also exercised in the two eligible games. Controlled repair/bridge/retest and boss views retained independent response snapshots without changing the selector or scoring.

## Local CSV

Final runtime schema: **75 fields**, in the same order as the private export: 57 original columns, 17 appended behavior fields, and gameplayResponseTimeMs. responseTimeMs already existed and keeps its column position. The base HTML array remains 57 until the maintained adapter installs the additional columns.

Newly measured zero counts/durations remain numeric 0. Conditional absence, unmeasured/non-response/legacy values remain blank. Older responseTimeMs values are not retroactively reinterpreted. Nonblank activeResponseTimeMs identifies a new measurement. Old unrelated numeric placeholders retain their established semantics, as the dictionary explains.

Real report-button downloads passed header order/count, equal row width, quoted commas/newlines/double-quotes/Unicode, UTF-8 BOM, exact stored-row values, retained legacy timing, blank versus zero, no exported behavioral content, and no export-created rows. The 18 richer timing/behavior measurements are scalar columns; they require no JSON parsing. Two pre-existing mode distribution columns remain JSON text and were preserved.

The public schema matches the existing Faculty Resources dictionary exactly. Coverage now checks public, classroom and POC targets (12 schemas); dictionary definitions were not casually rewritten. Its introductory scope still refers to the private Managerial reference, whose vocabulary these public games now match.

## Anonymous Collection

**Published games intentionally remain local-only.** The existing public code had no anonymous client/transport, and the collection page explicitly describes browser-local question records. The generated adapter contains no fetch/XHR/beacon, remote endpoint, queue, anonymous client ID, research envelope, private debug controls, or persistent anonymous storage. Browser interception observed zero telemetry/network API requests. Private Worker ingestion, gate, storage isolation, research event families and award provenance remain private-only. Local CSV event=question remains the accepted-response filter; no answer_submitted/evaluated/feedback triplication was added.

## Privacy

Behavioral capture records durations, counts, 0/1 region flags, maximum selected length and timing relationships. It does not store selected/copied text, clipboard contents, question text for behavioral telemetry, keystrokes, pointer trajectories, screenshots, unrelated URLs, browser history, application names, student names, email, SIS/Canvas IDs or fingerprints. No new identity mechanism or suspicion score was introduced. Existing local event normalization continues to omit the engine's legacy user parameter from the CSV. Interaction data does not establish intent.

## Regression Results

- Targeted public browser suite: **103/103 PASS**. Includes real downloads for all games/modes, ordinary/slow responses, one/multiple tab changes, selection, copy, copy→hide/blur, return waiting, clean next-question state, save/reload/Continue, legacy records, duplicate loading, exam commitment, phase/boss snapshots, completion and independent focus/readiness/pause boundaries. Final run: zero runtime exceptions, zero broken requested assets, zero telemetry requests.
- Public UI browser suite: **53/57 baseline and after**. The identical four failures expect Exam Drill draft answers to increment totalAttempts immediately. Current validated architecture defers scoring to commitment; dedicated new commit tests pass. No stale test assertions were changed.
- Public static regression: **22/24 baseline and after**. One historical protected-file baseline predates the already committed private telemetry upgrade; another asserts the shared UI adapter contains no sendGameData calls, predating its current exam events. Failures preserved and compared by name/detail.
- Shared telemetry regression: **16/16 PASS**, including deterministic timing, selection/copy, reset, late wrapper, exam aggregation, privacy validation and existing Worker reconstruction. No production endpoint was contacted.
- Source/regeneration: **11/11 PASS**, including protected files, unchanged inline scripts, exact generated helpers, class-build identity and transport exclusion. The alias is byte-identical to its maintained artwork source.
- Dictionary: **12/12 schemas**, 75 entries each; missing/stale/duplicates zero. Composer/private/public synchronization passes.
- Desktop 1440px and mobile 390px menu/guide/boss checks, keyboard/Escape/focus/reduced-motion checks and screenshots passed in the public UI suite. Screenshots were visually inspected. No horizontal overflow was observed in those flows.

New-test fixture corrections were limited to capturing runID before menu exit clears the active variable, and ending a simulated run before directly opening its report. The latter avoids pending next-question callbacks trying to access DOM intentionally replaced by the test. The traced engine callback was unchanged from baseline; no production code was patched to conceal it. Controlled visibility/copy events and phase/room controls are bounded QA, not an exhaustive manual student playthrough or physical OS-tab automation.

## Files Changed

Canonical integration/build sources and maintenance documentation:

- audit_tools/managerial_classroom/build.mjs
- audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs
- audit_tools/published_managerial_parity/AUDIT.md
- audit_tools/published_managerial_parity/README.md
- audit_tools/published_managerial_parity/sync.mjs

Public entry points and generated targets (only script additions in the four game HTML files; generated adapter and image alias):

- play/managerial-intelligence-directorate/agency-protocol/index.html
- play/managerial-intelligence-directorate/cost-directive/index.html
- play/managerial-intelligence-directorate/local-telemetry.js
- play/managerial-intelligence-directorate/market-signal/index.html
- play/managerial-intelligence-directorate/strategy-desk/index.html
- play/managerial-intelligence-directorate/strategy-desk/question_background_image.webp

Tests and evidence:

- audit_tools/published_managerial_parity/browser.mjs
- audit_tools/published_managerial_parity/check.mjs
- audit_tools/telemetry_data_dictionary/check.mjs
- validation_artifacts/published_managerial_parity/baseline.json
- validation_artifacts/published_managerial_parity/boss-1440.png
- validation_artifacts/published_managerial_parity/browser/agency-protocol-completed.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-copy-leave.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-copy-only.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-duplicate-script.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-exam-commit.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-exam.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-fadingFortune.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-incomplete.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-legacy.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-legendary.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-multiple-switches.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-next-question.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-normal.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-one-switch.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-quiz.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-return-wait.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-riskReward.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-save-resume.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-score.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-selection.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-slow-visible.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-timed.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-timing-boundaries.csv
- validation_artifacts/published_managerial_parity/browser/agency-protocol-unlimited.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-completed.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-copy-leave.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-copy-only.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-duplicate-script.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-exam-commit.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-exam.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-fadingFortune.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-incomplete.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-legacy.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-legendary.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-multiple-switches.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-next-question.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-normal.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-one-switch.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-quiz.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-return-wait.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-riskReward.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-save-resume.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-score.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-selection.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-slow-visible.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-timed.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-timing-boundaries.csv
- validation_artifacts/published_managerial_parity/browser/cost-directive-unlimited.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-completed.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-copy-leave.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-copy-only.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-duplicate-script.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-exam-commit.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-exam.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-fadingFortune.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-incomplete.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-legacy.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-legendary.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-multiple-switches.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-next-question.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-normal.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-one-switch.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-quiz.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-return-wait.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-riskReward.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-save-resume.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-score.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-selection.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-slow-visible.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-timed.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-timing-boundaries.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-trialGraph.csv
- validation_artifacts/published_managerial_parity/browser/market-signal-unlimited.csv
- validation_artifacts/published_managerial_parity/browser/results.json
- validation_artifacts/published_managerial_parity/browser/strategy-desk-completed.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-copy-leave.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-copy-only.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-duplicate-script.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-exam-commit.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-exam.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-fadingFortune.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-incomplete.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-legacy.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-legendary.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-multiple-switches.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-next-question.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-normal.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-one-switch.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-quiz.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-return-wait.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-riskReward.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-save-resume.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-score.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-selection.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-slow-visible.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-timed.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-timing-boundaries.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-trialGraph.csv
- validation_artifacts/published_managerial_parity/browser/strategy-desk-unlimited.csv
- validation_artifacts/published_managerial_parity/menu-390.png
- validation_artifacts/published_managerial_parity/regression/after-browser.json
- validation_artifacts/published_managerial_parity/regression/after-static.json
- validation_artifacts/published_managerial_parity/regression/baseline-browser.json
- validation_artifacts/published_managerial_parity/regression/baseline-static.json
- validation_artifacts/published_managerial_parity/regression/shared-tracker.json
- validation_artifacts/published_managerial_parity/schema-results.json
- validation_artifacts/published_managerial_parity/source-check.txt

Report:

- FINAL_REPORT_published_managerial_parity.md

## Deployment

**Not performed.** From C:/Users/Jennings/Documents/GitHub/masteryquests-website, first validate:

```powershell
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs --check
node audit_tools/published_managerial_parity/check.mjs
node audit_tools/telemetry_data_dictionary/check.mjs
node audit_tools/published_managerial_parity/browser.mjs
```

After review and authorization, use the existing site workflow documented in server/classroom-access/README.md:

```powershell
npx wrangler deploy --config wrangler.jsonc --assets .
```

This publishes static assets through the existing site Worker while preserving the existing classroom gate. No telemetry Worker deployment, D1 migration, endpoint/CORS change or secret update is required. The root config also supports an existing dist workflow, but that must stage the complete current site before deployment. No deployment dry-run or upload was performed by this task.

## Remaining Differences

Public local-only collection versus private anonymous aggregation/access/storage remains intentional. Private artifact provenance and interrupted-question research snapshots are not added to the public 75-column local stream. Older local records remain older records; absent behavior is not fabricated. Trial by Graph remains unavailable in the two ineligible games. External private question authoring/publisher inputs were not present or modified; future wholesale HTML replacement must run the public sync/check to restore the maintained integration. Historical regression assertions remain follow-up maintenance items, not new game regressions.

## Final Verdict

PASS WITH NOTES
