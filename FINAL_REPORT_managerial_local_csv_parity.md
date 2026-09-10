# Private Managerial Local Download CSV Parity

## Executive Summary

**PASS.** The existing **Download Game Data** action now exports the current schema-2 visibility/focus/selection/copy measurements in both private builds. No PowerShell, ADMIN_TOKEN, or Worker access is required to download the local data.

All 57 previous columns remain in their original order. Seventeen behavioral columns and gameplayResponseTimeMs are appended, giving 75 columns. Existing responseTimeMs is aligned to the Worker measurement for new response rows; its former gameplay value is retained in gameplayResponseTimeMs. The local file now carries a UTF-8 marker so Excel opens Unicode correctly.

Validation: **29/29 browser/download checks, 16/16 tracker regressions, 21/21 adapter regressions, and direct read-only Excel verification pass.** The classroom client was regenerated locally. No production deployment occurred. Worker/D1/schema, Composer, polished public games, question content, gameplay/adaptive logic, and save mechanics are unchanged. The pre-existing untracked managerial-telemetry-export-20260910-134641.csv was left untouched.

## Architecture

The source trace found Download Game Data buttons calling downloadTelemetryCsv in the private game HTML (for example, the Cost Directive local telemetry section around lines 10780–10940). sendGameData builds a local record, appends it to the run-specific readLocalTelemetry/getTelemetryKey store, caps it at 1,500 rows, and records the latest run. TELEMETRY_COLUMNS determines the export order, and escapeCsvValue quotes cells and doubles embedded quotes. The filename uses the existing composition slug, mode, and local run ID.

The canonical anonymous adapter is play/managerial-directorate-telemetry-poc/telemetry-client.js. Its answer wrapper already captures the Composer-derived tracker before asynchronous answer verification. responseMeasurements resolves that snapshot, including per-room Exam accumulation. Previously, originalSend saved the older local record before mapGameEvent attached richer measurements only to anonymous events.

The shared adapter now resolves responseMeasurements **once**, invokes the original local collector with its original arguments, enriches only the newly written row, and passes the same snapshot object to mapGameEvent. There is no second timing calculation, extra response event, or export-time reconstruction. Event IDs distinguish the newly appended row even when the local store is at its cap. Enrichment failures are caught and cannot interrupt the original gameplay callback.

installLocalTelemetryColumns extends the existing ordered array. installLocalCsvDownload keeps the existing button/function name, local reader, column list, quoting function, empty-data behavior, and filename convention. Its only encoding addition is a UTF-8 BOM; CRLF rows and quoted cells remain standard CSV. No behavioral calculation occurs in this download path.

audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs regenerates the classroom adapter through the existing classroomClient builder. Both private clients therefore receive one canonical implementation. No generated/downloaded CSV was patched to obtain a passing result; samples came from browser downloads.

### Response rows and the existing name collision

The local event vocabulary is retained. Analyze **event=question** for accepted response rows; these correspond to anonymous **eventType=answer_evaluated** with acceptedAttempt=true. Local rapid_guessing rows correspond to rejected/non-engaged attempts. Classroom Exam initial/revision rows contain draft measurements; committed event=question rows contain the existing room-level aggregate. Do not count both drafts and commits as separate final scored responses.

The anonymous stream still has its existing submitted/evaluated/feedback event family. The local export does not gain that duplication or rename its events.

The old local responseTimeMs name already existed but contained gameplay timing, which can differ from visibility telemetry (notably Fading Fortune). Keeping two different meanings under the required Worker name would violate parity. All original columns remain, but newly measured rows use responseTimeMs for telemetry and preserve the former numeric value in appended gameplayResponseTimeMs. Existing consumers needing the old timing should use this compatibility column for new rows. Legacy stored rows retain their original responseTimeMs and are not retroactively converted.

## Local CSV Columns

Duration values are milliseconds. Definitions come directly from the existing tracker; this change adds no new definition.

| Field | Definition |
| --- | --- |
| responseTimeMs | Existing column, now the total schema-2 telemetry response interval for newly measured response rows. |
| activeResponseTimeMs | Visible-document response time: responseTimeMs minus hiddenTimeMs. |
| hiddenTimeMs | Accumulated hidden-document duration, including an open hidden interval at submission. |
| tabSwitchCount | Distinct visible-to-hidden transitions; duplicate hidden/browser signals do not inflate it. |
| timeAfterReturnMs | Time since final hidden-to-visible return; null if never returned or still hidden. |
| focusLossCount | Distinct blur transitions, measured independently from visibility. |
| unfocusedTimeMs | Accumulated blur-to-focus time; may overlap hiddenTimeMs. |
| timeAfterFocusMs | Time since final refocus; null if never refocused or still unfocused. |
| selectionCount | Settled relevant selections, using the existing 250ms debounce and submission flush. |
| maxSelectedChars | Maximum trimmed selection length in question/answer regions, using existing JavaScript string-length semantics. |
| questionSelected / answersSelected | Numeric 1/0 flags for whether a relevant selection intersected each region. |
| copyCount | Relevant copy-event count; no clipboard contents are read. |
| questionCopied / answersCopied | Numeric 1/0 flags for whether a relevant copy intersected each region. |
| lastCopyElapsedMs | Offset of the latest relevant copy from its response interval start. |
| timeCopyToHideMs / timeCopyToBlurMs | Time from the latest copy to its first subsequent hide/blur; null if no such transition followed. |
| gameplayResponseTimeMs | Compatibility column retaining the original local responseTimeMs value calculated by the unchanged game engine. |

The 17 behavioral fields follow their established Worker order. gameplayResponseTimeMs is last. responseTimeMs stays in its existing position. Focus time is independent of visibility and can overlap hidden time. Visible modal/graph pauses follow the existing Composer model; menu exit/Continue establishes the existing fresh response baseline. Exam aggregate copy offsets retain the existing per-view convention.

## Null/Zero Semantics

- A measured response with no hiding, switching, selection, or copying exports numeric **0** for those measurements.
- Missing legacy measurements and non-response measurements export blank cells. No zero is fabricated.
- A conditional interval such as timeAfterReturnMs or timeCopyToHideMs remains blank until the associated return/transition occurs.
- Historical responseTimeMs and other older columns retain their pre-existing values; a populated activeResponseTimeMs identifies a newly measured response row.

The original escapeCsvValue distinguishes null/undefined from numeric zero. A seeded legacy row with responseTimeMs=777 retained that value and exported blank behavioral cells. Excel confirmed blank legacy hidden time and numeric zero hidden/copy values on the new response row.

## Worker / Local Parity

Every controlled response row in the browser suite was matched to its outgoing schema-2 event by build, game, source run, question, room, and response type. All 18 required values matched **exactly**, including nulls. There is no snapshot timing tolerance or independently sampled second clock.

Representative Cost Directive classroom results below show **local / anonymous** values:

| Scenario | Wall ms | Visible ms | Hidden ms | Switches | Selection count | Copy count |
| --- | --- | --- | --- | --- | --- | --- |
| normal | 209 / 209 | 209 / 209 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| tab-switch | 573 / 573 | 337 / 337 | 236 / 236 | 1 / 1 | 0 / 0 | 0 / 0 |
| selection-only | 512 / 512 | 512 / 512 | 0 / 0 | 0 / 0 | 1 / 1 | 0 / 0 |
| copy | 524 / 524 | 524 / 524 | 0 / 0 | 0 / 0 | 1 / 1 | 1 / 1 |
| copy-leave | 855 / 855 | 623 / 623 | 232 / 232 | 1 / 1 | 1 / 1 | 1 / 1 |
| next-question | 117 / 117 | 117 / 117 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| pause-resume | 114 / 114 | 114 / 114 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| exam | 74 / 74 | 74 / 74 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |

The full [comparison evidence](validation_artifacts/managerial_local_csv_parity/browser-results.json) includes return, focus, region, and copy-to-hide/blur fields. Test answers deliberately set the existing gameplay timer to at least six seconds while leaving the tracker untouched; gameplayResponseTimeMs preserved that old value while local and Worker responseTimeMs remained identical. This proves the exporter does not substitute gameplay timing for telemetry timing.

Offline scenarios also downloaded successfully with the endpoint unavailable; parity was checked against the exact queued anonymous payload. Other scenarios passed through the existing local Worker/D1 harness. No live service or learner data was used.

## Browser Validation

The browser suite exercised Cost Directive in both classroom and POC builds for normal visible responses, tab switch/return, selection only, copy, copy followed by hide/blur, next-question reset, save/menu/refresh/Continue, incomplete run, Exam, legacy/quoting, and offline export. Market Signal additionally covered normal, copy-to-leave, and Exam in both builds. Classroom Exam validation answered and committed all nine questions in a section, verifying both draft and aggregate response rows.

All tests clicked the actual visible Download Game Data button, saved the resulting CSV, parsed its quoted records, checked original column order, compared measurements with the anonymous payload, and verified that download did not create rows. **29 passed, zero failed.**

Excel was opened invisibly with the synthetic fixture read-only and closed without saving. The final file opened as **75 columns and 4 rows**, with Unicode Ω, embedded quotes, and an embedded newline intact. Measured hidden/copy cells were numeric zero; the corresponding legacy measurement was blank. The initial no-BOM file exposed Unicode misdecoding, which is why the private download now includes the UTF-8 marker.

The unchanged behavioral-helper synchronization check passes, as do all 16 existing tracker checks and all 21 existing adapter regressions. Git diff verification confirms no Worker/server, Composer, public-game, or gameplay-source changes. A broad unrelated gameplay-suite rerun was not necessary for this local persistence/export change.

## Privacy

Only existing numeric timing/counter/length/region-flag measurements are copied into the local row. No selected text, copied text, clipboard contents, question text, typed keys, other-tab information, screenshots, pointer paths, or new identity fields are exported. Existing local faculty columns, including verificationCode and runID, remain intentionally available as before. The downloaded files were checked for forbidden new columns and for accidental question-stem inclusion. The quoted Unicode probe is synthetic formatting data, not captured learner content.

## Files Changed

- play/managerial-directorate-telemetry-poc/telemetry-client.js
- play/managerial-directorate-classroom/telemetry-client.js
- audit_tools/managerial_local_csv_parity/run-browser.mjs
- FINAL_REPORT_managerial_local_csv_parity.md
- validation_artifacts/managerial_local_csv_parity/browser-results.json
- validation_artifacts/managerial_local_csv_parity/excel-results.json
- validation_artifacts/managerial_local_csv_parity/regression-results.json
- validation_artifacts/managerial_local_csv_parity/normal.csv
- validation_artifacts/managerial_local_csv_parity/copy-leave.csv
- validation_artifacts/managerial_local_csv_parity/legacy-quoting.csv

The classroom client is generated; the POC client is the maintained source. The three sample CSVs contain synthetic QA data only.

## Deployment

**No production deployment occurred.** Anonymous schemaVersion 2 and existing build/version identifiers are unchanged because this is a local export extension. No Worker redeployment or D1 migration is needed.

From the repository root, regenerate/verify the private assets:

```powershell
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs --check
```

The root wrangler.jsonc publishes the complete site from dist and preserves the classroom-access Worker. After explicit deployment authorization, update these two files in the existing complete site staging tree, then deploy that tree:

```powershell
if (!(Test-Path -LiteralPath 'dist/index.html')) { throw 'Prepare the complete site staging tree first.' }
Copy-Item -LiteralPath 'play/managerial-directorate-classroom/telemetry-client.js' -Destination 'dist/play/managerial-directorate-classroom/telemetry-client.js'
Copy-Item -LiteralPath 'play/managerial-directorate-telemetry-poc/telemetry-client.js' -Destination 'dist/play/managerial-directorate-telemetry-poc/telemetry-client.js'
npx wrangler deploy --config wrangler.jsonc
```

The repository did not contain a current complete dist tree during this task; no partial site bundle was created or published. The commands above describe the remaining staging/deployment step, not actions performed.

## Final Verdict

**PASS.** Faculty can retrieve the schema-2 measurements through the existing private Download Game Data action. Local and anonymous measurements use the identical snapshot, Excel reads the file correctly, and the backend/gameplay/privacy boundaries remain intact. Deployment remains a separate authorized step.
