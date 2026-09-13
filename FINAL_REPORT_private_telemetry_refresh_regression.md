# Private telemetry save/refresh regression — final report

**PASS — root cause identified and fixed. NOT DEPLOYED.**

The defect was in the canonical private telemetry client: it wrote the active telemetry run ID as a plain UUID but tried to read it as JSON on refresh. The parse failure incorrectly triggered the intended fail-closed protection and persisted browser collection OFF. The fix reads and validates the existing plain UUID format; it does not change how IDs are created, scoped, written, or mapped to saved runs.

## Repository and preserved starting state

- Root: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`.
- Branch: `main`.
- Starting/current HEAD: `56177e06c24edbab477a6ff57cdabe6516f6429f`.
- Initial `git status --short`: clean. The completed telemetry UX refresh was already committed in this HEAD.
- No commits, pushes, deployments, production operations, or other repository work were performed.
- Existing evidence under `validation_artifacts/telemetry_site_ux_refresh/`, its original baseline serving shim, and its historical final report were preserved. All new evidence is under `validation_artifacts/private_telemetry_refresh_regression/`.

## Reproduction before production edits

1. The unmodified private parity browser suite reproduced **11 passes / 18 failures**.
2. The same suite using the existing `baseline-clients.cjs` mechanism to serve `git show HEAD:<client>` reproduced **11 passes / 18 failures**, with exactly the same 18 failing names.
3. The original archived evidence from the prior task also remains intact. This task's fresh HEAD-client reproduction uses the HEAD above, which already contains the committed UX refresh.
4. A minimal diagnostic then reproduced the failure in the POC family followed by the classroom family, capturing snapshots before save, before reload, immediately after reload, and after Continue/answer. Production source was not edited until this diagnostic identified the same parse-failure chain in both families.

Evidence: `before/browser-results.json`, `head-baseline/browser-results.json`, `diagnostic/trace.json`, and the matching baseline logs.

## Exact root cause and classification

**Classification: real client defect, not a stale test expectation or save-game defect.**

`createRun()` and `resumeRun()` write `ACTIVE_RUN_KEY` with `localStorage.setItem(ACTIVE_RUN_KEY, runId)` (the classroom generator applies its existing safe-storage wrapper). The stored value is a plain UUID, without JSON quotes.

The prior initializer was:

```js
activeRunId: readJSON(ACTIVE_RUN_KEY, "") || "",
```

`readJSON()` ran `JSON.parse()` on that valid raw UUID. The diagnostic captured the thrown parse at the initializer, followed by `memoryRemoteDisabled = true`. Initialization then called `setRemoteCollection(false)`, writing `remoteDisabled:v1 = "1"` and cancelling unsent events. The build meta remained `enabled` throughout; there was no learner opt-out.

The subsequent Continue flow could recover the original telemetry run ID from the run map, but the persisted OFF preference prevented new remote answers. The suite's “latest answer” was consequently still the pre-save answer with `copyCount = 1`. The next eight mode checks per family inherited the same OFF state, explaining all 18 failures.

Current source references in `play/managerial-directorate-telemetry-poc/telemetry-client.js`: `remoteEnabled()` at line 12, `setRemoteCollection()` at 25, the new reader at 511, state initialization at 542, `createRun()` at 590, `resumeRun()` at 610, and the initialization fail-closed check at 1225. The pre-fix diagnostic stack records the original line numbers as well.

## Narrow fix and canonical regeneration

The initializer now uses `readActiveRunId(ACTIVE_RUN_KEY)`. This helper:

- Reads the existing plain string using the storage accessor directly.
- Returns an empty in-memory value when no active run has yet been stored.
- Accepts a valid UUID using the same UUID shape already used by queue identity validation.
- Keeps collection fail-closed for malformed or unreadable values.

The bracket-form storage accessor is deliberate: the classroom generator must not replace it with a getter that swallows an unavailable-storage exception and makes it look like a first run.

Only the canonical POC client was changed for production behavior. Existing generators refreshed the classroom client, Composer anonymous adapter, and embedded source fingerprints. The generated public Managerial local client and Composer game template changed only in their embedded registry fingerprint. No public transport was added.

The following regeneration/check paths were used:

```text
node audit_tools/telemetry_contract/generate.mjs
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs
node audit_tools/telemetry_governance/composer-transport.mjs
```

Their `--check` modes and governance renderer `--check` all pass. No configuration renderer write, migration, or production operation was needed.

## State-machine findings

| Candidate | Finding |
| --- | --- |
| A — query loss | No. The same URL and `telemetrySynthetic=1` remain after reload. |
| B — intended default OFF on refresh | No. The unexpected OFF was a consequence of the parse error, not the approved refresh behavior. |
| C — namespace drift | No drift within an ordinary refresh. Build scope and physical namespace stay the same. |
| D — malformed/missing storage | The stored active-run UUID was valid; the wrong decoder falsely treated it as malformed. Truly malformed/unreadable data still fails closed. |
| E — harness clears/replaces storage | No. Snapshots and preference-write stacks identify client initialization as the writer. |
| F — another document/build | No. Cost Directive URL, build meta, source run save, and scope persist. |
| G — queue migration | No. There is no queue migration in this fix. The OFF write originates from the active-run parse failure. |
| H — absent build config | No. Meta is `enabled` at the exact preference-write stack. |
| I — test-only enablement | No misuse. The parity server explicitly serves enabled private HTML on each request, including reload. |
| J — real refresh defect | Yes: the client reads the plain active-run UUID as JSON. |

## Intended contract — explicit answers

1. **Enabled private build + no browser opt-out should remain enabled after ordinary refresh:** yes. `remoteEnabled()` permits an enabled build with a missing preference unless a legacy restrictive opt-out exists. The approved disclosures promise persistence when storage is available.
2. **`qaEnabled`:** a localhost harness-only query control, never a production client preference. Governance/readiness harnesses apply it when serving each request; ordinary reload retains the query. The parity server enables its private HTML fixture unconditionally and does not rely on that query. `telemetrySynthetic` marks POC test events; it does not enable collection. The classroom generator strips that debug/query behavior.
3. **Browser opt-out persists:** yes. `setRemoteCollection(false)` stores `"1"`, cancels unsent events, and keeps future transmission OFF after refresh.
4. **Browser re-enable persists:** yes, where the build permits it and storage is available. It stores `"0"`; it cannot override build OFF.
5. **Malformed/unreadable state fails closed:** yes. Preference parsing, queue isolation, and unavailable-storage boundaries are retained. The new active-run reader also rejects malformed or unreadable values. A missing active-run entry is normal before a first run, not missing build permission.
6. **Continue identity:** the same saved gameplay run maps to the same telemetry run UUID through `state.runs[gameId + ':' + sourceRunId]`. An ordinary same-build resume is not a new run. Existing changed-build measurement segment behavior is untouched.
7. **Copy count resets:** yes. Resume completes/resets the prior tracker, and a newly presented/answered question gets its own interaction measurements. The new remote answer must be a distinct event with `copyCount = 0` in this fixture.
8. **Parity suite expectation:** valid. No collection-persistence expectation was removed. The fix strengthens the suite by asserting enabled disclosure before/after reload, a NEW answer event ID, and the same browser pseudonym.

## Exact storage layout

The private storage facade prepends `mq:<family>:` to physical localStorage keys. Within it the transport uses:

```text
anonymousTelemetry:build:v2:<family>:<buildScope>:
```

Suffixes observed or defined: `remoteDisabled:v1`, `clientId:v1`, `queue:v1`, `runs:v1`, `sequences:v1`, `activeRun:v1:cost-directive`, `quality:v1`, and POC-only `debugFailure:v1`. The legacy `anonymousTelemetry:remoteDisabled:v1` is consulted only as a restrictive opt-out when the current scoped preference is absent; old UUIDs and queues are not adopted.

For example, the exact physical active-run key is `mq:<family>:anonymousTelemetry:build:v2:<family>:<buildScope>:activeRun:v1:cost-directive`. The family/scope values captured in this diagnostic are:

| Diagnostic | Family | Exact build scope |
| --- | --- | --- |
| Before fix | `managerial-directorate-telemetry-poc` | `1c3d4ea47426d3425d83795c33dff4794a7b283b1fc8176814a8049b06d076ed` |
| Before fix | `managerial-directorate-classroom` | `30536ef46aa2a1dceeb39bb33b04c8b3485da213efaeb943f39d4ed86cf2b06f` |
| After fix | `managerial-directorate-telemetry-poc` | `900505c237c3998f5a0890ec70fda12ad1d06f7fb0e921ea829d7a3050c46096` |
| After fix | `managerial-directorate-classroom` | `5e419017cf100671146912f19134ccf4a1f0bdb3196e2f44f9f28d93bf59f5ee` |

These scopes differ between rebuilt artifacts because the existing source fingerprint changes; the scope algorithm is unchanged. Within every before/after-reload scenario the scope and anonymousClientId are stable. Full exact keys and values, run UUIDs, URLs, and received-event IDs are preserved in both diagnostic trace files. Those identifiers belong only to synthetic fixtures.

- `managerial-directorate-telemetry-poc` save key: `costDirectiveSave_v1_standard`, with its existing family prefix at the native storage layer. The saved run remains in Standard mode at room 2.
- `managerial-directorate-classroom` save key: `costDirectiveSave_v1_standard`, with its existing family prefix at the native storage layer. The saved run remains in Standard mode at room 2.

The diagnostic captures the saved run ID, room, mode, and saved-state field names; it intentionally does not log the saved username or question content. No telemetry preference lives in sessionStorage. The only observed classroom session key was the unrelated daily-announcement marker `costDirective:daily:announced:2026-09-13`.

## Before/after behavior

Both families showed the same core transition:

| Stage | Before fix | After fix |
| --- | --- | --- |
| Before save | Enabled; missing browser restriction; prior answer copyCount 1 | Same |
| Before reload | Enabled; queue empty; plain active-run UUID stored | Same |
| Immediately after reload | OFF; preference written to `"1"`; activeRunId initially empty | Enabled; preference remains absent; same activeRunId and anonymousClientId |
| After Continue + answer | Run map recovers the same run but no new remote answer; latest answer is old copyCount 1 | Same run; distinct new answer event; copyCount 0; queue drains |

In the minimal traces, both pre-fix families reached 13 received events after reload and stayed at 13 after Continue/answer. Both fixed families reached 20 after Continue/answer. An immediately observed queue can contain lifecycle events in flight; the fixed classroom trace briefly contains three after reload and drains to zero after Continue. That is ordinary delivery, not queue corruption. The strengthened parity assertions use event identity rather than only last-row field values.

Existing stored restrictions are never erased automatically. If a browser already has `remoteDisabled = "1"`, it remains OFF until explicitly re-enabled in an enabled build. Cancelled events are not replayed.

## Regression matrix

| Required suite | Result |
| --- | --- |
| Private telemetry parity browser | **29/29** |
| Deterministic Managerial telemetry parity | **16/16** |
| Governance readiness/remediation | **27/27** |
| Governance checks | **14/14** |
| Scheduled retention | **11/11** |
| Measurement contract | **16/16** |
| Measurement contract browser | **17/17** |
| Published Managerial browser | **103/103**, zero remote telemetry requests |
| Classroom access | **27/27** |
| Composer regressions | All **27 runners** pass |
| Telemetry site UX refresh | **PASS**, desktop and narrow layouts |
| Focused refresh browser assertions | **20/20** across both families |
| Active-run reader cases, including malformed/unreadable values | **33/33** across POC, classroom, and Composer adapter |
| Generator drift checks | **PASS** |
| `git diff --check` | **PASS** |

The focused browser checks cover default/unrestricted enabled refresh, same run/pseudonym/scope, new answer identity/copy reset, persistent opt-out, persistent re-enable, faculty OFF supremacy, distinct build scope, malformed/unreadable preference and active-run storage, and malformed queues. The existing readiness/contract suites additionally verify cancelled-event non-replay, queue isolation, missing/malformed configuration, and transport boundaries.

The older HEAD preservation guards now permit only the exact reviewed reader helper and initializer substitution, using `private-refresh-scope.cjs`. All other executable differences remain rejected; UX disclosure assertions are retained. This is a specific authorized change allowance, not a blanket exception for telemetry code.

## Frozen contracts and UX preservation

Unchanged: `mq-measurement/1`, `mq-governance/2`, `mq-disclosure/2`, anonymous schema 3, centralized and CSV fields, measurements, pseudonym algorithms and build-scope rules, D1 schema, 730-day whole-run retention, cron `17 4 * * *`, CORS, routes, tokens/secrets, production configuration, and legacy National Engine transport.

Public polished games remain **LOCAL-ONLY**, including public Managerial. No game HTML or public transport changed. Only the generated public local client's embedded fingerprint changed.

Hashes against starting HEAD confirm the Composer index, controller, core and CSS, public privacy/guides, governance renderer, and classroom disclosure builder are unchanged. Thus generalized LMS/university identifier wording, Step 1 disclosure, Step 2 choice, default OFF, Step 6 readiness, operational/instructional/product framing, Download Game Data visibility, and neutral interpretation remain intact. The existing UX regression also passes.

## Controlled publication and deployment

`node audit_tools/public_site_publication/build-dist.mjs .` passes with 1,793 files, **151** Composer Concept Review PDFs, **0** forbidden files, and **0** incoming question assets. Audit/test/authoring sources do not leak into dist.

**NOT DEPLOYED.** All browser/Worker validation used localhost, synthetic data, and in-memory databases. No production settings or services were changed. No remaining acceptance blocker was found.

## Exact files changed or added

- `FINAL_REPORT_private_telemetry_refresh_regression.md`
- `audit_tools/classroom_access/run_validation.mjs`
- `audit_tools/managerial_telemetry_parity/run-browser.mjs`
- `audit_tools/telemetry_contract/registry.json`
- `audit_tools/telemetry_governance/private-refresh-check.mjs`
- `audit_tools/telemetry_governance/private-refresh-diagnostic.mjs`
- `audit_tools/telemetry_governance/private-refresh-scope.cjs`
- `audit_tools/telemetry_governance/site-ux-refresh.mjs`
- `build/faculty-build-composer/anonymous-telemetry-source.js`
- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`
- `play/managerial-directorate-classroom/telemetry-client.js`
- `play/managerial-directorate-telemetry-poc/telemetry-client.js`
- `play/managerial-intelligence-directorate/local-telemetry.js`

All fresh evidence files are listed in `validation_artifacts/private_telemetry_refresh_regression/evidence-files.json`. `validation-summary.json` records the required matrix, baseline failure-name comparison, and unchanged UX source hashes. Previous task evidence and reports were not overwritten.
