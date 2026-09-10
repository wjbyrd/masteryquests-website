# Private Managerial Telemetry Parity

## Executive Summary

**PASS WITH NOTES — implemented and validated locally; not deployed.** Both current private paths are upgraded: managerial-directorate-telemetry-poc and its generated managerial-directorate-classroom client, covering The Cost Directive, The Market Signal, The Strategy Desk, and The Agency Protocol.

Seventeen visibility/focus/selection/copy measurements are added alongside the existing responseTimeMs. Client schemaVersion is **2**. POC buildVersion is **2026.09.10-parity3**; classroom is **2026.09.10-classroom-parity3**. Existing build IDs, phaseAnonymousTelemetryPOC-v1, run UUID mapping, random client ID, sequence numbers, queue storage keys, endpoint, and classroom/POC synthetic distinctions remain intact.

The exact Composer behavioral helper functions are extracted at build time, not independently reimplemented. Composer itself, public games, question banks, resources, faculty learning outcomes, gameplay/adaptive timers, and deployment configuration are unchanged. The existing D1 extras_json stores the new validated fields; **no migration or data rewrite** is needed. CSV exposes explicit stable columns with null/blank historical values.

Validation: **16/16 targeted synthetic checks; 29/29 actual-browser checks; 21/21 existing telemetry regressions**. Full classroom suite: **76/80**, with the same four historical exam assertions reproduced using pre-change clients. The older POC validator is **32/34**, with the same two pre-existing protected-hash assertions. No new unresolved feature failure remains. File list and deployment limits follow below.

## Architecture Before

**Composer:** build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html is the canonical generated-game template. createQuestionVisibilityTimingState / createQuestionBehaviorTelemetryState initialize state; resetQuestionVisibilityTiming runs at presentation and Fading Fortune readiness; answer flushes selection and snapshots timing before asynchronous verification. handleQuestionVisibilityChange, markQuestionFocusLost/Regained, selectionchange, and copy listeners maintain the state. sendGameData constructs faculty-local-v4 rows and TELEMETRY_COLUMNS exposes their local CSV schema. run_visibility_aware_telemetry_validation.js and run_generated_telemetry_smoke.js validate integration. Composer stores local telemetry; it does not use this anonymous Worker envelope.

**Managerial:** play/managerial-directorate-telemetry-poc/telemetry-client.js is the maintained anonymous adapter. The POC HTML entries load it after the game engine; audit_tools/anonymous_telemetry_poc/create_private_build.mjs is the historical clone builder, but rerunning it would overwrite later validated hooks and is unnecessary here. The current classroom pipeline is audit_tools/managerial_classroom/build.mjs: it derives classroomClient from the POC adapter and instruments the current public game HTML. Classroom loads the adapter before managerial-parity.js, which owns later UI/exam navigation wrappers. The generated classroom client and disclosure were regenerated through this pipeline. Game HTML/engine bodies were not patched.

Existing hooks wrap sendGameData, displayQuestion, Fading Fortune readiness, Risk & Reward reveal, launch ownership, and mastery report callbacks. The adapter maps engine source runs to UUIDs, persists a random client UUID, assigns sequences before queueing, batches 25 records, retains at most 2,000 queued records, and retries with exponential backoff capped at 30 seconds. Visibility/pagehide lifecycle events already used a pause latch. The classroom build strips debug/query/synthetic overrides and uses a fixed endpoint; the POC retains those test features.

**Backend:** server/anonymous-telemetry-poc/worker.mjs routes /v1/health, /v1/events, /v1/admin/summary, run/reconstruct routes, and /v1/admin/export.csv, also under /api/anonymous-telemetry-poc. telemetry-core.mjs is the validator/reconstruction source. Existing numbered migrations 0001 and 0002 define storage/completion behavior. tools/reconstruct-run.mjs delegates to the same reconstruction function. The current Worker configuration binds TELEMETRY_DB to managerial-telemetry-poc and restricts origins to the existing site origins. The root Worker separately protects classroom asset access; its code/configuration is untouched.

## Parity Matrix

Locations below use the canonical Composer template above and POC client above; the classroom implementation is the generated equivalent.

| Composer field/behavior and implementation | Managerial implementation | Equivalent semantics / validation | Notes |
| --- | --- | --- | --- |
| Wall, visible, hidden timing: getQuestionVisibilityTiming | Same extracted function inside createComposerQuestionTracker; responseMeasurements | Yes — A/B/C/D and browser tests | Independent local telemetry clock; does not mutate gameplay questionStartTime |
| tabSwitchCount, final return: markQuestionVisibilityHidden/Visible | Same extracted functions; visibilitychange adapter | Yes — duplicate hide/pagehide/blur test | Only visibility transitions count as tab switches |
| focusLossCount, unfocusedTimeMs, timeAfterFocusMs: markQuestionFocusLost/Regained and getQuestionBehaviorTelemetry | Same extracted functions; blur/focus adapter | Yes — D/G | Separate overlapping measure, never subtracted twice |
| selectionCount, maxSelectedChars, region flags: getRelevantSelectionSummary, schedule/flushQuestionSelectionTelemetry | Same extracted functions; question/answers DOM roots | Yes — E and real DOM ranges in all eight private pages | 250ms debounce and generation guard retained |
| copyCount, region flags, lastCopyElapsedMs: recordRelevantQuestionCopy | Same extracted function; copy listener | Yes — F/G/O | Only counts/flags/timing leave browser |
| timeCopyToHideMs and timeCopyToBlurMs | Same pending-copy state and reset rules | Yes — G, Worker persistence, CSV | Latest copy’s first subsequent hide/blur; null until observed |
| Snapshot at answer before verification: answer | Adapter wraps answer, snapshots before calling original, attaches to mapped response events | Yes — actual answers and clock-independence test | Original answer promise/result and gameplay timer are preserved |
| Question reset / restored presentation: resetQuestionVisibilityTiming, displayQuestion | beginInterval, displayQuestion and phase15RestoreSavedQuestion hooks | Yes — H/I and save-refresh-Continue in both clients | Reset on resumed question; stale state not serialized into saves |
| Fading Fortune ready state: beginFadingFortuneQuestion | Await existing asynchronous initializer, then capture | Yes — mode browser tests | Existing Managerial pause-adjusted gameplay clock intentionally remains unchanged |
| Risk & Reward revealed question | renderRiskRewardQuestion and reveal guard | Yes — mode browser tests | Wager choice does not start a response interval |
| Exam viewed-room accumulation: addExamRoomVisibilityTiming / finalizeExamRoomView | finishInterval, room-keyed examViews, late finalize hook and exam-commit mapping | Yes — synthetic multiple-view commit and exam draft browser tests | Counts/durations sum by room; maxima/flags and latest copy follow Composer aggregation |
| Visible modal/graph pause handling | Independent tracker continues while visible | Yes — extracted clock semantics; pause/resume lifecycle tests | Composer includes this time; active gameplay clocks remain separate |
| Run visibility pause/resume | Existing pauseForLifecycle latch plus visibility tracker | Yes — D/H/J/K and existing regression | Lifecycle reason distinguishes menu, pagehide, visibility-hidden/visible |
| Local telemetry envelope faculty-local-v4 / CSV | Anonymous schema 2, existing UUID/sequence/Worker envelope | Intentionally different transport | Stable anonymous identifiers and accepted-event semantics retained; no attempt to rename the envelope to Composer’s schema |
| Composer local completion/review data | Existing run_completed, mastery summary, raw/accepted counts | Preserved — existing 21 checks and full classroom suite | New questionResponses view augments admin reconstruction |

The parity checker verifies the entire extracted helper region byte-for-byte after newline normalization. Run node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs --check. To regenerate after reviewing a Composer update, omit --check; this also regenerates the classroom client. Physical copies exist only as generated artifacts; their calculations have one authoritative source.

## Field Definitions

All durations use **milliseconds**. New measurements are nullable; null/blank means not collected or not applicable, never “observed zero.” Non-response events carry null new fields. Answer, exam draft/commit, and interrupted-question snapshots carry measured values.

| Field | Definition | Zero/null convention |
| --- | --- | --- |
| responseTimeMs | Milliseconds from current question presentation/reset to answer submission, using an independent telemetry clock. Includes hidden time and visible modal/graph pauses. Exam commit sums the room’s view intervals. Existing field; response_time_ms remains the original database/CSV column and responseTimeMs is its new CSV alias. | 0 is a measured instantaneous interval (or existing non-response default); never borrowed from the gameplay timer. |
| activeResponseTimeMs | responseTimeMs minus hiddenTimeMs. “Active” follows Composer’s document visibility model, not window focus. | 0 means measured zero visible time; null means not measured/not applicable. |
| hiddenTimeMs | Accumulated hidden document intervals, including an open interval at submission, clamped to wall response time. | 0 means measured no hidden time; null means unmeasured. |
| tabSwitchCount | Number of distinct visible-to-hidden transitions during the response interval. Duplicate hidden events do not count twice. Starting an interval while already hidden does not increment the count. | Nonnegative integer; 0 measured none; null unmeasured. |
| timeAfterReturnMs | Milliseconds since the most recent hidden-to-visible return until submission. | null if never returned or still hidden at submission; 0 for same-tick return/answer. |
| focusLossCount | Number of distinct blur transitions while an unfocused interval is not already open. Independent of tabSwitchCount. | Integer; 0 measured none; null unmeasured. |
| unfocusedTimeMs | Accumulated blur-to-focus durations, including an open blur interval, clamped to responseTimeMs. Can overlap hiddenTimeMs. | 0 measured none; null unmeasured. Do not add this to hidden time. |
| timeAfterFocusMs | Milliseconds since the final refocus to submission. | null if never refocused or still unfocused; 0 same-tick refocus. |
| selectionCount | Count of settled, nonempty selections intersecting the question or answer DOM. Uses the Composer 250ms debounce; pending selection is flushed at answer submission. | Integer; 0 measured none; null unmeasured. Repeated settled selections can count separately. |
| maxSelectedChars | Largest trimmed selected-character count intersecting those DOM regions; sums relevant ranges. Uses JavaScript string length (UTF-16 code units), matching Composer. | Integer; 0 measured none; null unmeasured. Content is discarded locally after counting. |
| questionSelected / answersSelected | Whether any meaningful selection intersected the question / answer area in this interval. | Numeric 1 yes, 0 measured no, null unmeasured. |
| copyCount | Number of copy events with a nonempty selection intersecting the question or answer area. Other page selections are ignored. | Integer; 0 measured none; null unmeasured. No clipboard read is performed. |
| questionCopied / answersCopied | Whether any relevant copy event intersected the question / answer area. | Numeric 1 yes, 0 measured no, null unmeasured. |
| lastCopyElapsedMs | Milliseconds from response interval start to the latest relevant copy event. For an exam aggregate this remains the last copied view’s local interval offset, matching Composer. | null when no copy was recorded; 0 copy at interval start. |
| timeCopyToHideMs | Milliseconds from the latest copy to its first subsequent hidden transition. Each new copy clears the previous relationship and starts a new pending relationship. | null when no subsequent hide occurred after the latest copy; 0 same-tick hide. No arbitrary “suspicious” time threshold. |
| timeCopyToBlurMs | Milliseconds from the latest copy to its first subsequent blur. Independent of copy-to-hide, with the same reset convention. | null when no subsequent blur occurred after the latest copy; 0 same-tick blur. |

The validator accepts finite nonnegative numeric durations up to 48 hours; counters/character counts are integers up to 1,000,000 and flags are numeric 0/1. Return/copy/focus intervals cannot exceed responseTimeMs. Where active and hidden values are supplied, their sum must equal wall time within 2ms. The existing responseTimeMs maximum expands from one hour to the existing 48-hour event-duration horizon so long visible/hidden sessions do not fail solely because they exceed an hour. Missing v1 measurements remain missing.

## Behavioral Event Semantics

Visibility changes and focus changes are separate signals. Duplicate hidden or blur notifications cannot open a second interval. pagehide/pageshow do not add tab switches independently. Existing lifecycle latching avoids duplicate run_paused events when visibility-hidden and pagehide both fire. No raw mouse movement, key activity, or browser-event stream is emitted.

Selections/copies remain summary measurements, as in Composer. Composer has no selection timestamp or dedicated selection-before-copy flag; this port does not invent one. It can establish that both occurred within an interval and reconstruct the latest copy-to-hide/blur relationship. It does not infer intent or cheating.

A successful answer attaches one pre-verification snapshot to the existing answer_submitted/answer_evaluated/feedback event family. Analysis should use answer_evaluated to avoid counting the same measurement multiple times. Non-engaged rapid attempts remain excluded from accepted-attempt metrics exactly as before. Failed answer verification can retry within the active interval. Fresh displays and resumed questions clear timing, copy state, counters, and pending selection callbacks.

A menu exit records question_interrupted with a partial snapshot and run_paused with reason menu. Hidden/tab activity while in the menu is ignored. Continue preserves the mapped run and establishes a fresh question interval. A page exit records an interrupted snapshot without falsely completing the run. Completed runs no longer emit later visibility resume events.

Visible game menus/modals/graph views within an active question follow Composer’s convention: their visible time is included in response timing. In-game Fading Fortune pauses still pause its gameplay mechanics; the new telemetry clock does not inherit its questionStartTime adjustment. Standard’s active-run clock still pauses/resumes through phase15PauseActiveClock/phase15ResumeActiveClock. There is no change to rapid-guess, fluency, scoring, or adaptive input timing.

Question/repair/bridge/retest presentation is captured synchronously after a successful render, keyed by run, room, question, engine reset, and adaptive stage. Deferred callbacks cannot read Question N+1 as Question N. Only the exam navigation hook is installed after the classroom parity script loads; rewrapping the whole adapter would duplicate events. A dedicated regression now protects this boundary.

## Privacy Review

New application data consists exclusively of numeric durations, counts, character-length maxima, and question/answer-region flags. Selected text is briefly inspected locally only to count trimmed characters and is not retained in tracker state, events, storage, D1, reconstruction, or CSV. No clipboard API/content read is added. Real-browser DOM selections and synthetic copy events verified the path; serialized fixtures do not contain the sentinel question content.

The allowlist rejects selected/copied text, question/answer text fields, typed keys, Canvas/SIS identifiers, names, email, IP-address fields, user-agent/fingerprint fields, unrelated-tab URLs/history, application names, and arbitrary extras. Existing metadata includes question/concept/objective IDs, chosen option index, correctness, game/mode/build IDs, scores and anonymous run/client UUIDs. The random persistent anonymousClientId links runs within browser storage; it is **not** a browser fingerprint or a claim that sessions cannot be linked. No new identity-bearing field is introduced.

CORS, ADMIN_TOKEN checks, protected classroom access, credentials:omit, rate limiting by random client ID, and idempotent inserts remain intact. Infrastructure may retain ordinary request/network metadata outside the application tables; this work does not inspect or change infrastructure logging/retention and does not claim such metadata cannot exist. No production records or secrets were accessed for validation.

## Backend Changes

Schema **2** is a client-envelope evolution. Existing schema-1 payloads/queued events remain accepted. New measurements use the existing strict extras_json allowlist and typed validation. No numbered migration, table rewrite, CORS change, rate-limit change, origin change, admin-token change, or health-endpoint change is required. Existing rows remain exportable.

Admin reconstruction adds questionResponses for shown/interrupted/answered/exam-response rows, including the new measurements, and adds lifecycleReason to the timeline. Existing raw/accepted answers, completion, ownership, and mastery summaries retain their semantics. An unanswered question is represented by question_shown without a matching response, optionally followed by question_interrupted; completed/incomplete run status remains separate.

The queue still preserves event IDs/sequences for retries. Fetch now has a 10-second AbortController timeout, followed by the existing retry policy. Offline, timeout, 400, 429, and 503 responses do not block answering. The existing bounded queue may drop its oldest entries after 2,000 unsent events, and an invalid queued event is retained for retry; those pre-existing limits are not presented as lossless delivery guarantees. Students see no telemetry error dialog.

## CSV Export

Existing snake_case columns remain in their original order. New explicit columns are:

activeResponseTimeMs, hiddenTimeMs, tabSwitchCount, timeAfterReturnMs, focusLossCount, unfocusedTimeMs, timeAfterFocusMs, selectionCount, maxSelectedChars, questionSelected, answersSelected, copyCount, questionCopied, answersCopied, lastCopyElapsedMs, timeCopyToHideMs, timeCopyToBlurMs.

responseTimeMs is appended as a clear alias for existing response_time_ms. QA fields remain present. Column order is fixed even for an empty result set. Schema-1 rows export blank cells for measurements they never collected, with no invented zeros. CSV quoting/escaping is preserved. [Synthetic export](validation_artifacts/managerial_telemetry_parity/synthetic-export.csv) is a local test artifact containing no learner data.

## Validation

| Synthetic scenario | Result |
| --- | --- |
| Late classroom initialization does not wrap lifecycle hooks twice | PASS |
| A fast visible | PASS |
| B slow visible | PASS |
| C one tab switch and return | PASS |
| D multiple switches; duplicate browser signals do not inflate counts | PASS |
| E selection only is debounced | PASS |
| F copy while visible has no invented hidden interval | PASS |
| G copy to blur/hide captures independent relationships without content | PASS |
| H menu pause and resume reset; paused tab activity is ignored | PASS |
| I next question resets counts, pending selection and timing | PASS |
| J incomplete question stays reconstructable on page exit | PASS |
| K completion durable; later visibility cannot resume ended run | PASS |
| L unavailable, timeout, rejected, rate-limited and offline posts retain exact IDs | PASS |
| Exam commit accumulates only this room’s views | PASS |
| M/N Worker ingestion, idempotency, legacy and CSV export | PASS |
| O privacy allowlist and numeric validation reject content/invalid measurements | PASS |

The Worker test executes actual ingestion, validation, SQL inserts, duplicate retry, protected admin routes, reconstruction, CSV, forbidden-origin rejection, rate limiting, and legacy rows through the existing SQLite-backed D1 interface. Empty and populated CSV headers match. The browser test uses actual game scripts, real DOM selection ranges, dispatched copy events, and controlled visibility/focus changes; it never reads/writes the clipboard or visits unrelated tabs. All ten supported modes are covered, using Market Signal for Trial by Graph because Cost Directive has no graph pool.

- Targeted synthetic: 16 PASS, 0 FAIL.
- Browser parity: 29 PASS, 0 FAIL, 255 locally ingested events in the recorded run.
- Existing POC regressions: 21 PASS, 0 FAIL (baseline also 21/21). VM fixture supplies the browser AbortController API.
- Full existing classroom gameplay/browser suite: 76 PASS, 4 pre-existing FAIL (baseline identical). Its four Exam checks expect immediate committed attempts after draft selection; current exam navigation commits later. They were not rewritten to mask the baseline issue. Schema/build assertions alone were updated for the new release.
- Historical POC validator: 32 PASS, same two FAIL before/after. The archived public-file and root-deployment hashes predate this repository state.
- Current Composer visibility/behavior reference test: PASS, with Composer source unchanged.
- Generated-helper/classroom synchronization: PASS.
- Protected-source diff and Git whitespace checks: PASS.

[Regression comparison](validation_artifacts/managerial_telemetry_parity/regression-comparison.json) records baseline methods and unchanged failures.

## End-to-End POC

**Local only.** Actual private game → client envelope → actual Worker validator/router → SQLite through D1’s prepare/batch interface → admin reconstruction → CSV was exercised for both private builds and all four titles. No Cloudflare managed D1 instance was changed and no remote ingestion/deployment occurred. POC test events retain synthetic=true; classroom test traffic retains the production synthetic=false contract but exists only in the local test database.

To validate locally:

```powershell
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs --check
node audit_tools/managerial_telemetry_parity/run-parity.mjs
# Set PLAYWRIGHT_MODULE to the installed Playwright module if it is not on Node's path.
node audit_tools/managerial_telemetry_parity/run-browser.mjs
```

Deployment is consequential because the current Worker routes to the site’s existing API. After review/authorization, deploy the backend **before** the schema-2 private assets:

```powershell
npx wrangler deploy --config server/anonymous-telemetry-poc/wrangler.jsonc
```

No D1 migration command is needed. Regenerate private assets with node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs; then use the existing site staging/publishing workflow to populate dist before any root-config deployment. Running npx wrangler deploy --config wrangler.jsonc publishes that staged site and must be reviewed separately; this task neither stages dist nor performs that deployment. No token is printed or stored in this report.

## Files Changed

**Migrations:** none.

**Client/build, backend, tests, report, and evidence:**

- FINAL_REPORT_managerial_telemetry_parity.md
- audit_tools/anonymous_telemetry_poc/run_regressions.mjs
- audit_tools/managerial_classroom/browser-checks.js
- audit_tools/managerial_classroom/build.mjs
- audit_tools/managerial_telemetry_parity/run-browser.mjs
- audit_tools/managerial_telemetry_parity/run-parity.mjs
- audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs
- play/managerial-directorate-classroom/index.html
- play/managerial-directorate-classroom/telemetry-client.js
- play/managerial-directorate-telemetry-poc/telemetry-client.js
- server/anonymous-telemetry-poc/README.md
- server/anonymous-telemetry-poc/telemetry-core.mjs
- server/anonymous-telemetry-poc/worker.mjs
- validation_artifacts/managerial_telemetry_parity/browser-reconstruction.json
- validation_artifacts/managerial_telemetry_parity/browser-results.json
- validation_artifacts/managerial_telemetry_parity/classroom-baseline-results.json
- validation_artifacts/managerial_telemetry_parity/classroom-browser-results.json
- validation_artifacts/managerial_telemetry_parity/historical-validation-results.json
- validation_artifacts/managerial_telemetry_parity/parity-results.json
- validation_artifacts/managerial_telemetry_parity/reconstruction.json
- validation_artifacts/managerial_telemetry_parity/regression-comparison.json
- validation_artifacts/managerial_telemetry_parity/regression_results.json
- validation_artifacts/managerial_telemetry_parity/synthetic-export.csv

The two private clients are the only changed gameplay-loaded scripts. The classroom hub change updates the privacy disclosure only. Existing regression fixtures change only the browser API availability and release/schema expectations. Existing screenshots accidentally rewritten by a broad test runner were restored; new evidence is isolated to this task.

## Deferred Work

- Polished public-game telemetry parity.
- Faculty-facing telemetry data dictionary (the definitions above are its technical source).
- Optional neutral analytics/visualizations and retention policy decisions.
- Authorized remote Worker/private-asset deployment and a remote pilot smoke test.
- Independent repair of the four stale classroom Exam assertions and two historical POC hash fixtures.

## Final Verdict

**PASS WITH NOTES.** Visibility-aware timing and high-value selection/copy semantics match the current Composer and survive local ingestion, reconstruction, and CSV. Gameplay/adaptive code and anonymity controls are preserved. Deployment remains unperformed, and the documented pre-existing test failures remain outside this telemetry upgrade.
