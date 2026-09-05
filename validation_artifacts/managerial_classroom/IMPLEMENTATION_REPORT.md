# Managerial classroom telemetry build

Created in the canonical repository `C:\Users\Jennings\Documents\GitHub\masteryquests-website`, using current HEAD `44889e7` as the captured source. No existing tracked file was modified. Nothing was committed or deployed.

## Entry path and identifiers

- Repository entry: `play/managerial-directorate-classroom/index.html`
- Stable classroom path: `/play/managerial-directorate-classroom/`
- Intended URL after static deployment: `https://masteryquests.org/play/managerial-directorate-classroom/`
- buildId: `managerial-directorate-classroom`
- buildVersion: `2026.09.05-classroom1`
- phase: `phaseAnonymousTelemetryPOC-v1`
- schemaVersion: `1`
- API: `/api/anonymous-telemetry-poc/v1/events` (unchanged)

The intended URL has not been deployed or live-tested by this task. The hub and four pages are unlinked from public navigation and have `noindex,nofollow,noarchive`. No existing repository robots/header mechanism was present to extend. Access control remains a separate step: unlinked/noindex pages do not restrict access to someone who knows the URL.

## Exact production files added

- `play/managerial-directorate-classroom/index.html`
- `play/managerial-directorate-classroom/cost-directive/index.html`
- `play/managerial-directorate-classroom/market-signal/index.html`
- `play/managerial-directorate-classroom/strategy-desk/index.html`
- `play/managerial-directorate-classroom/agency-protocol/index.html`
- `play/managerial-directorate-classroom/telemetry-client.js`
- `play/managerial-directorate-classroom/telemetry-storage-isolation.js`

Audit tools added:

- `audit_tools/managerial_classroom/build.mjs`
- `audit_tools/managerial_classroom/run_validation.mjs`
- `audit_tools/managerial_classroom/run_browser.mjs`
- `audit_tools/managerial_classroom/browser-checks.js`
- `audit_tools/managerial_classroom/browser-hub-checks.js`
- `audit_tools/managerial_classroom/worker-harness.mjs`
- `audit_tools/managerial_classroom/run_existing.mjs`
- `audit_tools/managerial_classroom/evidence-redirect.cjs`

Evidence is under `validation_artifacts/managerial_classroom/`. `FILES_ADDED.txt` lists every added file, including individual screenshots, logs, reference-suite outputs, the preservation manifest and this report. Files modified: **none**.

## Inspection and integration approach

For each of `cost-directive`, `market-signal`, `strategy-desk` and `agency-protocol`:

- Gameplay/UI source: `play/managerial-intelligence-directorate/<title>/index.html`
- Telemetry reference: `play/managerial-directorate-telemetry-poc/<title>/index.html`
- Classroom output: `play/managerial-directorate-classroom/<title>/index.html`

The classroom pages are generated from the current published HTML, not the older POC copies. They reuse the public artwork and `managerial-parity.css`/`managerial-parity.js` through the same authoritative asset-base approach used by the POC. This keeps the current menus, Fullscreen, Daily system, guide/boss cinematics, neutral human portraits, boss-name cleanup and mobile fixes. No question banks or artwork were duplicated as separate assets.

Comparison with the POC identified its additional artifact-award instrumentation: `recordArtifactAward`, the before/after ownership reads at real checkpoint grants, and the `unlockArtifact` hook. These exact validated hooks were transplanted into the current engine. Agency Protocol has six checkpoint hook sites across its original and override definitions; the other titles have three. The hooks observe actual grants, not save restoration or artifact display. All other gameplay code remains the current published source.

The classroom telemetry client is derived from `play/managerial-directorate-telemetry-poc/telemetry-client.js`. It retains the phase/schema, random anonymous client UUID, run/source-run mapping, sequence numbers, event names and fields, raw/accepted answer semantics, rapid guesses, adaptive stages, checkpoints, artifact ownership, mastery-report timing, lifecycle reason separation, pause deduplication, queue/retry/batching and fail-open transmission. The same backend reconstruction provides `wallClockDurationMs` and `activeGameplayElapsedMs`.

The client loads after the engine and before the presentation adapter. Thus the adapter captures the instrumented original question-display callback; the boss intro does not emit `question_shown` until Proceed renders the existing encounter. Guide entry similarly starts the existing run only when Proceed is selected. No boss selection, scoring, adaptive routing, timers, artifact award rules or Daily logic was changed to accommodate telemetry.

`sourceRunMapped` remains the validated mapping condition: the current sourceRunId has a durable telemetry runId mapping. It was a POC debug readout, not a new schema field. Classroom tests verify that condition through actual events, persisted mapping and refresh continuity without adding a payload property the Worker does not accept.

Storage isolation is copied from the POC with only the namespace changed to `mq:managerial-directorate-classroom:`. Classroom saves, Dailies, artifact state, anonymous client ID, queues and run mappings cannot overwrite the public or POC namespace during normal operation. Storage-denial handling in the classroom client is guarded, with an in-memory random identifier fallback, so capture failures cannot block gameplay.

## Debug and synthetic exclusion

The classroom client physically omits the POC debug panel, all debug action handlers, status-rendering functions, failure simulator, Fresh/Flush/Reset/Verify controls, diagnostic global API and query-parameter parsing. No CSS hiding is used. Hostile `telemetryDebug`, `telemetrySynthetic` and `telemetryEndpoint` query strings are ignored. There is no exposed synthetic toggle or arbitrary endpoint override. Classroom events always use `synthetic: false`, stored as `0` by the unchanged Worker.

The POC files retain their diagnostic API, debug controls and synthetic switch unchanged. Browser QA separately loads the original POC with its existing switches, confirms the panel and synthetic events, and verifies namespace separation from the classroom pages.

## Student disclosure

The hub and each game's Game Menu contain a compact, expandable **About this class build** disclosure:

> This private class build records anonymous gameplay activity to help evaluate and improve the game. It does not collect your name, email, student ID, or course identity.

The classroom hub is a simple four-link entry page, with no POC implementation details or identity form. There is no research/IRB/consent-form language. Instrumentation adds no names, email, student/LMS/school/account IDs, IP payloads, location, fingerprints, credentials or free-response fields. The Worker retains its validated allowlist and identifier rejection.

## Worker compatibility and exports

The existing Worker validates nonempty schema-v1 build identifiers rather than requiring the POC buildId. The classroom can therefore use the existing route and database without backend edits.

The existing CSV endpoint is **build-scoped**, and omitting buildId defaults to the POC. For ordinary non-synthetic classroom export, use the existing authenticated admin route:

`/api/anonymous-telemetry-poc/v1/admin/export.csv?buildId=managerial-directorate-classroom`

No `includeSynthetic` parameter is needed for classroom runs. For POC synthetic QA export, use:

`/api/anonymous-telemetry-poc/v1/admin/export.csv?buildId=managerial-directorate-telemetry-poc&includeSynthetic=1`

These are admin operations using the existing authorization mechanism; no admin token or endpoint UI is included in the classroom build. No all-build export behavior was invented, and the Worker default was not changed.

## Validation commands and results

From the canonical repository:

```powershell
node audit_tools/managerial_classroom/build.mjs .
node audit_tools/managerial_classroom/run_existing.mjs .
node audit_tools/managerial_classroom/run_validation.mjs .
$env:PLAYWRIGHT_MODULE='C:\Users\Jennings\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
node audit_tools/managerial_classroom/run_browser.mjs .
git diff --check
```

The existing-suite runner executes these existing scripts without editing them:

```text
build/faculty-build-composer/tests/run_daily_challenges_v1_validation.js
build/faculty-build-composer/tests/run_guide_intro_validation.js
build/faculty-build-composer/tests/run_exam_navigation_boss_reveal_validation.js
audit_tools/managerial_ui_parity/run_validation.mjs
audit_tools/anonymous_telemetry_poc/run_validation.mjs
audit_tools/anonymous_telemetry_poc/run_backend_integration.mjs
audit_tools/anonymous_telemetry_poc/run_regressions.mjs
```

| Final validation | Pass | Fail |
| --- | ---: | ---: |
| Existing Daily suite | 26 | 0 |
| Existing guide suite | 19 | 0 |
| Existing exam/navigation/boss suite | 59 | 0 |
| Existing Managerial static/core parity suite | 24 | 0 |
| Existing POC validation, current-baseline preservation rerun | 34 | 0 |
| Existing Worker/backend integration | 18 | 0 |
| Existing telemetry stabilization regressions | 21 | 0 |
| New classroom static/core/preservation checks | 21 | 0 |
| Classroom browser parity + telemetry + Worker/export checks | 80 | 0 |
| Total, current-baseline validation | **302** | **0** |

Baseline qualification: the first unchanged legacy POC suite returned 33 passes and 1 failure because its historical public hashes predate the already-completed UI parity work. Its original inventory and evidence were not rewritten. The scoped rerun substitutes this task's captured baseline hashes in memory for that preservation check only, and passes 34/34. The original failure log, scoped rerun log and both exit statuses are retained. The independent classroom preservation suite verifies all **3,986 pre-existing tracked files byte-for-byte**, including POC, public pages, backend, Composer and historical validation files.

The classroom source comparison removes only the exact injected hooks/head/client tag and then compares the whole result to its published source. This verifies current question content and engine code, not merely selected snapshots. Browser testing reuses the existing 57 Managerial parity assertions and adds 23 classroom checks; all four titles are exercised in Standard, Exam, Score Attack, Risk & Reward, Timed, Legendary and Fading Fortune.

The local browser server invokes the actual unchanged Worker with an in-memory SQLite implementation of its D1 interface and existing migrations. The final run stored **848 classroom events across 56 classroom runs**, all `synthetic=0`, with no ingestion errors or browser runtime exceptions. Checks cover API acknowledgements, real queue failure/retry, duplicate ingestion protection, source mapping, refresh/resume, pause deduplication, repair/bridge/retest, Legendary raw/accepted attempts, selected boss encounter stability, pre-Proceed event suppression, correct artifact timing/ownership, Mastery Report emission and build-scoped CSV filtering.

No browser request was sent to a live Worker or external service. Rooms and clocks are accelerated for bounded local fixtures. Live routing/deployed Worker health, a complete student playthrough and real-device browser behavior remain manual QA. `git diff --check` passes.

## Screenshots

26 viewport screenshots were generated under `validation_artifacts/managerial_classroom/`:

- For each of `cost-directive`, `market-signal`, `strategy-desk`, `agency-protocol`: `<title>-guide-desktop.png`, `<title>-menu-desktop.png`, `<title>-boss-desktop.png`, `<title>-guide-mobile.png`, `<title>-menu-mobile.png`, `<title>-boss-mobile.png`.
- `hub-1440.png` and `hub-390.png`.

The browser result JSON and exact added-file manifest enumerate all names. Visual review included the expanded mobile hub disclosure and mobile game menu. Mobile checks use 390x844; desktop game checks use 1440x1000. Screenshots retain the source game's brief Daily announcement where active.

## Deployment requirements

- Static Pages deployment: **required** to publish the new classroom directory. Keep the current public Managerial assets available because classroom pages reuse them.
- Worker deployment: **not required by this integration**; source and configuration are unchanged.
- D1 migration: **not required by this integration**; schema and database are unchanged.
- Cloudflare Access/authentication: **not added**; separate follow-up.
- Commit/deployment performed: **none**.

## Manual QA after static deployment

1. Open the intended classroom hub on desktop and a phone. Confirm all four links stay within the classroom path and the short disclosure is readable. Confirm public navigation has no classroom link.
2. Start Standard in each title. Check guide Proceed, the consolidated Game Menu, Fullscreen, Daily progress, the classroom disclosure, current portrait/boss-name styling and no debug controls.
3. In browser network tools, verify successful POSTs to the existing API and acknowledgements. Confirm classroom buildId/version, schema 1, `synthetic:false`, anonymous UUID, sourceRunId and telemetry runId. No synthetic query parameter is needed.
4. Answer normally, then trigger an adaptive detour. Check repair/bridge/retest telemetry. In Legendary, confirm rapid guesses are recorded and remediation remains suppressed. Smoke-test the other supported modes.
5. Reach a checkpoint: the intro precedes question telemetry, Proceed enters the selected encounter, and an artifact is awarded only after victory. Refresh during the checkpoint, Continue, and confirm no duplicated completion or award. Check already-owned/newly-earned fields on a later run.
6. Refresh a normal run and Continue. Confirm the same source/telemetry run mapping, one lifecycle pause for hide/pagehide, run_resumed, no spurious mode_selected, and retained Daily/game progress. Briefly simulate an offline network in browser tools, play, then reconnect and confirm the queue retries.
7. Use the existing authenticated classroom build-scoped CSV export. Confirm classroom records are included without includeSynthetic. Check POC export still excludes synthetic QA by default and includes it with includeSynthetic=1. Finally open the unchanged POC with its diagnostic switches and confirm those controls remain available there.
