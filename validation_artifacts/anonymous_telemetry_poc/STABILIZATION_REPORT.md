# Anonymous telemetry POC stabilization — 2026-09-05

Implemented in `C:\Users\Jennings\Documents\GitHub\masteryquests-website` for `phaseAnonymousTelemetryPOC-v1`. Client build version is `2026.09.05-poc2`; the envelope remains schema version 1 with additive, allowlisted extras. **93 checks passed, 0 failed. Nothing was deployed or committed.**

## Root causes and fixes

| Item | Root cause | Patch |
|---|---|---|
| 1. Missing artifacts | Checkpoint victory writes directly to the vault/storage and calls `showArtifact`; it bypasses the adapter's `unlockArtifact` wrapper. | Add a fail-open `recordArtifactAward` gameplay hook immediately after the actual grants in all four private titles, including the existing unlock helper. Forward `artifact_unlocked`; remove the old wrapper to prevent double capture. No reward/display/restoration logic changed. |
| 2. Overloaded completion | Adaptive and browser lifecycle reasons occupied `completionStatus`; the run upsert accepted any nonempty value. | Client uses `lifecycleReason`; Worker normalization also repairs queued older-client events. Run upsert accepts status only from `run_completed`. Data migration repairs already-stored events and run summaries. Existing terminal variants and the engine's bust/student-ended terminal events are recognized. |
| 3. Stale initial context | Standard sends `start` before resetting globals; the adapter samples the previous `currentQuestion`, room, and adaptive state. | Construct explicit pre-question start/resume context: position 0, empty question/concept/type/difficulty/boss/adaptive fields. Fresh starts also get zero counters and elapsed time. The first actual `question_shown` supplies question context. No question is fabricated and the engine reset order is unchanged. |
| 4. Stale max streak | The same early start event could copy the previous streak (24), which reconstruction later included in its maximum. | Fresh `mode_selected`/`run_started` get streak 0 and clean counters; existing per-run adapter caches reset on creation. Resume preserves engine-restored streak, mapping, and sequence. |
| 5. Rapid-guess analytics | Both engine branches became `answer_evaluated`, so reconstruction counted raw attempts. The non-engaged branch also omitted `rapidGuessing` on the source payload. | Keep `answerCount`, `correctAnswers`, and `accuracy` as raw aliases. Add raw/accepted metrics and `acceptedAttempt`. Derive acceptance from the actual `question` versus `rapid_guessing` branch, never timing thresholds. Mark the rapid branch explicitly. Historical `sourceEvent` supports classification; missing evidence is reported as unclassified. |
| 6. Duplicate pause | `pagehide` emitted a pause without setting the latch that visibility handling checks. | Both use one pause latch. Visible resume, gameplay resume/new start, and BFCache `pageshow` release it. Both callback orders and later legitimate pauses are tested. |
| 7. Mode selection on resume | A combined start/resume block emitted `mode_selected` for both. | Emit mode selection only on start. Resume retains the original source-to-telemetry mapping and sequence. |
| 8. Debug close | Close removed the `<details>` element. | Set `open=false`; its visible summary reopens it. |
| 9. Fresh debug UUID | Debug minted a `debug:` source mapping before gameplay established its real source. | The action now explains how to start a new game run without minting or changing IDs. Pre-game/unmapped debug state is labeled explicitly; the current mapped run remains valid until a real new start. |
| 10. Copy | Disclosure described research. | “Anonymous gameplay telemetry”; accompanying disclosure describes a private QA build and gameplay telemetry database. |

Artifacts have `artifact` (key), `artifactName`, `artifactSource`, and existing position/boss context. `artifactAlreadyOwned` reflects storage immediately before the grant. `artifactOwnedBeforeRun` comes from a snapshot before launch helpers clear run-local state, persisted with the telemetry run and preserved on resume; it is null when an old run has no snapshot. `artifactNewlyEarned` is false for pre-owned/repeated grants. `artifacts` contains only explicit grants in this run; `artifactAwards` gives details and `newlyEarnedArtifacts` gives the newly acquired subset. Merely restoring or opening the vault emits no award.

The optional `sourceRunId` is the existing opaque game-generated run ID, not a player identifier. It is available in payload extras, reconstruction and CSV. `wallClockDurationMs` spans first event to completion (or last event for an incomplete run). `activeGameplayElapsedMs` exposes the engine's existing completion elapsed value, using `totalTime` when supplied. It does not introduce an activity detector or subtract every kind of pause: its precise timing behavior remains the engine's behavior. Incomplete runs return null for that completed elapsed value.

New reconstruction metrics: `rawAttempts`, `rawCorrect`, `rawAccuracy`, `acceptedAttempts`, `acceptedCorrect`, `acceptedAccuracy`, `unclassifiedAttempts`. `rapidGuessCount` remains the count of detection events. The authenticated reconstruction endpoint is the detailed analytics view; `/admin/summary` retains its compact recent-run schema with the repaired durable completion status. CSV retains event rows and existing columns, adding explicit QA columns from validated `extras_json`, including `acceptedAttempt`. Historical answers with `sourceEvent` are classifiable even if their old rapid flag was false. Historical missing artifact events, stale initial question IDs, and contaminated streak values are not fabricated or rewritten.

## Files changed

Runtime:

- `play/managerial-directorate-telemetry-poc/telemetry-client.js`
- `play/managerial-directorate-telemetry-poc/cost-directive/index.html`
- `play/managerial-directorate-telemetry-poc/market-signal/index.html`
- `play/managerial-directorate-telemetry-poc/strategy-desk/index.html`
- `play/managerial-directorate-telemetry-poc/agency-protocol/index.html`
- `server/anonymous-telemetry-poc/telemetry-core.mjs`
- `server/anonymous-telemetry-poc/worker.mjs`
- `server/anonymous-telemetry-poc/migrations/0002_completion_semantics.sql` (new)
- `server/anonymous-telemetry-poc/README.md`

QA and documentation:

- `audit_tools/anonymous_telemetry_poc/run_validation.mjs` (required disclosure assertion updated)
- `audit_tools/anonymous_telemetry_poc/run_regressions.mjs` (new)
- `audit_tools/anonymous_telemetry_poc/run_browser_regressions.mjs` (new)
- `validation_artifacts/anonymous_telemetry_poc/validation_results.json`
- `validation_artifacts/anonymous_telemetry_poc/backend_integration_results.json`
- `validation_artifacts/anonymous_telemetry_poc/synthetic_scenarios.json`
- `validation_artifacts/anonymous_telemetry_poc/run_reconstruction_example.json`
- `validation_artifacts/anonymous_telemetry_poc/regression_results.json` (new)
- `validation_artifacts/anonymous_telemetry_poc/browser_regression_results.json` (new)
- `validation_artifacts/anonymous_telemetry_poc/debug_regression.png` (new, synthetic localhost screenshot)
- `validation_artifacts/anonymous_telemetry_poc/STABILIZATION_REPORT.md` (this report)

The pre-existing untracked `server/anonymous-telemetry-poc/.wrangler/` directory was left alone.

## Tests executed

| Suite | Pass | Fail |
|---|---:|---:|
| Existing static/semantic/inline syntax and protected public hashes | 34 | 0 |
| Existing Worker + in-memory SQLite/D1 integration | 18 | 0 |
| New client VM + Worker/data-migration regression suite | 21 | 0 |
| New browser regressions using actual private games in headless Edge | 20 | 0 |
| Total | **93** | **0** |

Commands, from the canonical repository:

```powershell
node audit_tools/anonymous_telemetry_poc/run_validation.mjs .
node audit_tools/anonymous_telemetry_poc/run_backend_integration.mjs .
node audit_tools/anonymous_telemetry_poc/run_regressions.mjs .
$env:PLAYWRIGHT_MODULE = 'C:\Users\Jennings\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
node audit_tools/anonymous_telemetry_poc/run_browser_regressions.mjs .
git diff --check
```

The browser runner also supports a locally installed `playwright` package and `BROWSER_CHANNEL`. The existing browser smoke evidence was a saved checklist, not an executable runner; the new browser runner provides reproducible current checks. Browser fixtures use real answer verification, actual reward and completion handlers, accelerated clock/checkpoint positioning, and localhost-only transport; they do not claim a full unassisted 30-room playthrough or a remote Cloudflare test. The browser test verifies all four artifact grant paths and the actual Cost Directive adaptive/Legendary/timed/resume paths. The final screenshot was visually inspected. Git diff whitespace validation passes; protected public file hashes match.

## Deployment handoff

**D1 migration required: yes, data repair only.** No table/column/index schema changes are needed. `0002_completion_semantics.sql` moves old nonterminal values into `extras_json.lifecycleReason`, clears those event completion fields, then reconstructs durable run status from the last terminal event. It preserves event IDs, ordering, counts, payload attempt evidence and transient reasons. The migration was tested against polluted historical rows and repeated safely in local SQLite.

**Worker redeployment required: yes. Static Pages/site redeployment required: yes.** Neither was performed. Deploy Worker first so older queued events are normalized and new extras are accepted; then apply the data repair and deploy the static files.

Using the existing configuration (which names the D1 database `managerial-telemetry-poc`):

```powershell
Set-Location 'C:\Users\Jennings\Documents\GitHub\masteryquests-website\server\anonymous-telemetry-poc'
npx wrangler deploy
npx wrangler d1 migrations apply managerial-telemetry-poc --remote
```

Then redeploy through the existing configured static Pages/site pipeline from this canonical checkout. The Pages project name and build command are not recorded here, so no project or deployment command has been invented. Publish the updated shared client and all four patched private HTML entrypoints; these reuse the existing public assets. The bootstrap `create_private_build.mjs` copies public HTML and is not a deployment step for this patch: running it again would overwrite the private grant hooks. Deployment configuration and secrets are unchanged.

## Exact post-patch manual QA sequence

1. Deploy in the order above. Open `/api/anonymous-telemetry-poc/v1/health` and confirm `ok:true`. In a dedicated QA browser profile open `https://masteryquests.org/play/managerial-directorate-telemetry-poc/cost-directive/?telemetryDebug=1&telemetrySynthetic=1`. Confirm debug build `2026.09.05-poc2`, exact phase, and `syntheticMode:true`. Keep this profile for the ownership/resume checks.
2. Open debug, click Close, reopen via its visible summary. Before gameplay, click Fresh telemetry run: it must explain using the game menu and must not present a newly minted final UUID. Start Standard through the game's New Run control; record both IDs. Confirm `sourceRunMapped:true`, sequence 1 `mode_selected`, sequence 2 `run_started`, both with position 0, empty questionId and streak 0. The following `question_shown` must identify the actual displayed first question.
3. Turn on failure simulation. Submit a few answers and verify the queue grows while gameplay works. Refresh and choose Continue. Confirm the same telemetry UUID and source ID, continuing sequence, preserved saved streak/progress, and no extra `mode_selected`. Inspect lifecycle rows for only one pause per hide/unload transition. Switch tabs away/back twice: each separate transition should remain visible. Turn simulation off and click Flush now; wait for queue 0 and successful HTTP 202. Inspect reconstruction for contiguous sequence.
4. In Standard, make ordinary, non-rapid misses on the same concept until the existing adaptive rules trigger repair (a single miss need not trigger it). Answer the repair correctly, then bridge correctly, then retest correctly. For a run with one such detour, reconstruction must show `remediationDetours:1`, `bridgeTriggers:1`, `retestTriggers:1`. Adaptive events must have empty completion status and a stage/reason in their proper fields.
5. Clear checkpoint 10 through gameplay. Confirm the visual artifact and unlocked vault slot, then Flush now. In reconstruction verify an `artifact_unlocked` timeline row and matching `artifactAwards` key/name/source/position. For an artifact not previously owned, expect `artifactAlreadyOwned:false`, `artifactOwnedBeforeRun:false`, `artifactNewlyEarned:true`. Merely opening its display or vault must not add another award.
6. Complete Standard normally, flush, and check `completionStatus:complete` and `/admin/summary` `completed:1, completion_status:complete`. Before viewing the Mastery Report there must be no report-summary event. View it, flush, and verify the report event. Switch tabs and refresh afterward; the durable completion must stay `complete`. Compare wall-clock and engine elapsed fields as separate measures.
7. From that completed state, start a genuinely new Standard run without resetting the client or vault. Confirm a new telemetry/source run pair, clean initial context/streak, and no award event just from restored vault ownership. Clear checkpoint 10 again: its explicit grant should be present, with `artifactOwnedBeforeRun:true`, `artifactAlreadyOwned:true`, `artifactNewlyEarned:false`. Old vault visibility alone must never populate this new run's awards.
8. Start Legendary. Make a pattern of rapid incorrect attempts, observing lockouts and waiting for controls to unlock. Flush and compare `rawAttempts` with `acceptedAttempts`; non-engaged lockout attempts remain raw but are excluded from accepted. Check `rapidGuessCount` against observed detection events. Legendary must have zero repair, bridge and retest triggers. A fast answer alone is not automatically excluded. Legacy `answerCount/correctAnswers/accuracy` must still equal the raw metrics.
9. Start Timed and let the full 600-second run expire. Flush and verify `timed_complete`, engine elapsed 600000, and its independent wall-clock span. Switch tabs/refresh afterward and verify summary and reconstruction still say `timed_complete`. Start Score Attack, submit accepted correct/incorrect answers and a rapid pattern, and check existing score changes/penalties remain as before; this patch changes no scoring rules.
10. Repeat a checkpoint award smoke check in Market Signal, Strategy Desk and Agency Protocol using the same debug/synthetic flags. Check each title's actual artifact name/key; restored/pre-owned state and new grants must remain distinct. Cost Directive `graphAnswers:0` is expected; graph telemetry remains out of scope.
11. Export CSV both ways. All runs above are synthetic: the default must exclude them, `includeSynthetic=1` must include them. Use one existing normal run (or make one short run without `telemetrySynthetic=1`) to confirm normal rows remain in the default export. For each run verify increasing sequence numbers, unique event IDs and unique `(run_id,sequence_number)`, artifact QA columns, explicit accepted-attempt classification, and no lifecycle/adaptive values in event `completion_status`. The normalized transient reason remains available in `lifecycleReason`/`extras_json`.
12. After the migration, recheck the previously reported Timed run `38bf634b-7611-4627-9e50-50a3aef594e9` and Standard run `a99d456b-0653-4644-8051-6c49b31ab407`: recent summary status must agree with their terminal reconstruction. Old missing artifact events cannot be recovered retroactively; use the new award runs as acceptance evidence.

Authenticated inspection examples (reuse your existing admin credential; no credential belongs in telemetry or a URL):

```powershell
$api = 'https://masteryquests.org/api/anonymous-telemetry-poc/v1'
$headers = @{ Authorization = "Bearer $env:ADMIN_TOKEN" }
$runId = '<telemetry UUID copied from debug>'
Invoke-RestMethod "$api/admin/summary" -Headers $headers
Invoke-RestMethod "$api/admin/runs/$runId" -Headers $headers
Invoke-RestMethod "$api/admin/runs/$runId/reconstruct" -Headers $headers
Invoke-WebRequest "$api/admin/export.csv" -Headers $headers -OutFile 'telemetry-normal.csv'
Invoke-WebRequest "$api/admin/export.csv?includeSynthetic=1" -Headers $headers -OutFile 'telemetry-with-synthetic.csv'
```

Question banks, difficulty, routing, detector thresholds, Legendary remediation restrictions, scoring, boss targeting/mechanics, artifact rewards and vault behavior, modes, core timers, public Managerial, Principles, Composer and graph telemetry remain unchanged. No identity/fingerprint/free-response fields were added. Queue batching, retry, fail-open capture, duplicate constraints and synthetic filtering remain in place. Remote Cloudflare/D1 validation remains the manual post-deployment step.
