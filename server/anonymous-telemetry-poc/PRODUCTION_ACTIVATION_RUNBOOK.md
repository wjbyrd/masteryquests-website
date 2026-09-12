# Operational telemetry controlled activation runbook

Task: OPERATIONAL_TELEMETRY_READINESS_REMEDIATION_V1. Updated 2026-09-12; **NOT EXECUTED**. This is operational product/instructional analytics. No research/IRB workflow is required by this runbook.

The targeted remediation closes B1 and I1 locally. I2 is a documented separate legacy exception; I3 is an owner-accepted operational limitation with rate parsing and CSV safety hardening. See FINAL_REPORT_operational_telemetry_readiness_remediation.md for final evidence. Production/provider checks below still require verification during separately authorized activation. These instructions do not authorize deployment, secrets, production writes or deletion. Commands below are PowerShell from the exact repository; credential values must be loaded through the custodian's private environment without command transcripts. Run steps individually and inspect results; stop on unexpected results.


## Remediated Build Controls and Release Boundary

Composer: Game details -> **Allow anonymous data collection**, initially unchecked. The strict boolean is saved in the existing recipe and generated FACULTY_COMPOSITION_CONFIG. OFF outputs omit the adapter entirely. ON outputs include the maintained adapter, which checks the boolean again at runtime. Missing/invalid/empty/unknown/unreadable permission, unresolved build identity, or unreadable/inconsistent transport storage is OFF. Browser opt-out further restricts ON; it cannot override OFF and cancelled records are never replayed. Local CSV remains independent.

Private POC/classroom local generators default OFF. Explicit local generation for an approved enabled artifact:

```powershell
node audit_tools/anonymous_telemetry_poc/create_private_build.mjs . --allow-anonymous-data-collection
node audit_tools/managerial_classroom/build.mjs . --allow-anonymous-data-collection
node audit_tools/telemetry_contract/generate.mjs
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs
node audit_tools/telemetry_governance/composer-transport.mjs
```

These modify local generated artifacts only and are not deployment commands. Omit the enable flag to generate disabled artifacts. Re-review the resulting source/registry diff and tests before release. The committed/prepared defaults in this remediation are OFF.

Transport identity/state uses v2 storage keyed by existing build identity: private buildId + buildRevision; Composer compositionFingerprint + buildRevision. Identical recipe/artifact regeneration is the same logical build. Distinct configuration or artifact identity gets a distinct UUID in the same browser. Different browser profiles or cleared storage also get distinct UUIDs. An old restrictive browser opt-out is carried forward until explicitly re-enabled. Old family-scoped IDs/queues remain dormant; they are neither adopted nor rewritten under new IDs. Valid current queued events retain their original identities; malformed/inconsistent state fails closed and is cancelled. Historical D1 records are unchanged.

Worker-only activation can proceed without a root-site/static deployment or any National Engine modification. It does not deliver the new faculty UI/defaults to existing browsers: the Composer/static adapters and newly distributed generated artifacts need their own reviewed release. That release must preserve National Engine unchanged. Public Managerial/default Composer builds are local-only unless explicitly configured for anonymous collection; a separate legacy National Engine transport exists outside this anonymous system. Do not call its endpoint or claim it has been fixed.

CORS is browser-origin control, not authentication. Client UUIDs are not proof of identity and can change; the limiter is best effort. Invalid rate config falls back to 300; valid integer range is 50–10,000. Operational signals are not tamper-proof records and must not be used alone for high-stakes decisions. Admin CSV neutralizes dangerous STRING prefixes with an apostrophe; numeric values and stored D1 values are unchanged. Existing authenticated run JSON provides exact raw values. The sidecar hashes the emitted spreadsheet-safe file; never remove safety prefixes before spreadsheet import.

## Current Local Regression Commands

Use a fresh MQ_EVIDENCE_DIR; set PLAYWRIGHT_MODULE to the approved installed Playwright module if needed. These tests use local synthetic Worker/SQLite and intercepted browser traffic, not production POSTs.

```powershell
node audit_tools/telemetry_governance/readiness-remediation.mjs
node audit_tools/telemetry_contract/check.mjs
node audit_tools/telemetry_contract/browser.mjs
node audit_tools/telemetry_governance/check.mjs
node audit_tools/telemetry_governance/scheduled-check.mjs
node audit_tools/managerial_telemetry_parity/run-parity.mjs
node audit_tools/managerial_telemetry_parity/run-browser.mjs
node audit_tools/published_managerial_parity/browser.mjs
node build/faculty-build-composer/tests/run_active_composer_suite.js
node audit_tools/telemetry_governance/render.mjs --check
node audit_tools/telemetry_contract/generate.mjs --check
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs --check
node audit_tools/telemetry_governance/composer-transport.mjs --check
```

The readiness-remediation test also uses the preserved local preflight/field-inventory baseline. Preserve that evidence directory when rerunning it. Existing private browser harnesses explicitly opt in synthetic fixture HTML; they do not change release defaults.

## Additional Activation Toggle/Export Smoke Matrix

Run these only after separate activation authorization. Use isolated synthetic generated artifacts, synthetic browser profiles and DevTools Network/Download tools. Record exact build/run IDs and apply the UUID cleanup section below. No new schema fields are required.

| Check | Exact tool/action | Expected / cleanup |
|---|---|---|
| Faculty OFF | Composer Game details checkbox unchecked -> generate -> open game -> answer | Zero central POST; download local CSV; no D1 cleanup needed. |
| Faculty ON | Check faculty checkbox -> generate -> synthetic game run | Central POST; local CSV works; UUID cleanup for synthetic runs. |
| Missing config | In isolated synthetic ON HTML omit allowAnonymousDataCollection from generated config | Zero central POST and working local CSV. Do not modify a live student artifact. |
| Invalid config | Repeat with empty string, whitespace, trueish, string true, numeric 1 and null | Every value OFF; local CSV works. |
| User opt-out | Under faculty ON disable future sending, continue and refresh | No future POST after already in-flight requests; local CSV works. Re-enable sends only new records. |
| OFF override attempt | In an isolated OFF artifact use the browser control/API if present | Stays OFF; no POST. |
| Local transparency | Download Game Data for all above states | Real downloadable CSV with current local fields, no submission implied. |
| Identity scope | Generate two distinct configurations/artifact identities in same profile; then repeat same build and a fresh profile | Distinct build pseudonyms; stable same-build pseudonym; distinct profile pseudonym. Never label these student counts. |
| Spreadsheet safety | Use the synthetic envelope's questionId =1+1 in step 4 and inspect admin CSV plus raw run JSON | CSV has apostrophe neutralization, JSON exact raw string, numbers unchanged, sidecar hash matches. |
| Pipeline continuity | Steps 4–7 below: synthetic ingestion, duplicate retry, reconstruction and export | Existing fields/sequence/completion and export still work; cleanup exact UUIDs. |

## Pre-Deployment

```powershell
Set-Location -LiteralPath 'C:\Users\Jennings\Documents\GitHub\masteryquests-website'
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git diff --check
node audit_tools/telemetry_governance/render.mjs --check
node audit_tools/telemetry_contract/generate.mjs --check
$mqConfig = 'server/anonymous-telemetry-poc/wrangler.jsonc'
npx --no-install wrangler --version
npx --no-install wrangler deployments list --config $mqConfig
npx --no-install wrangler d1 info managerial-telemetry-poc --config $mqConfig
npx --no-install wrangler secret list --config $mqConfig
```

Read-only discovery. Use an approved installed Wrangler version; if unavailable, owner prepares tooling separately, not an unreviewed upgrade mid-activation. Do not dump environment variables or authentication files. Secret list means names/types only. Record the active **version UUID** separately from deployment ID, deployment traffic allocation, date, environment, Worker routes/vars/bindings/cron and static release version. These values were not available to the audit; they are mandatory rollback inputs, not placeholders to guess.

Expected local target:

| Item | Value |
|---|---|
| Worker | masteryquests-anonymous-telemetry-poc |
| Main | server/anonymous-telemetry-poc/worker.mjs |
| Route | masteryquests.org/api/anonymous-telemetry-poc/* |
| workers_dev | false |
| D1 | managerial-telemetry-poc / 16b248ff-20cb-429c-a4a1-dd50d17c1fd0 |
| Binding | TELEMETRY_DB |
| Origins | https://masteryquests.org,https://www.masteryquests.org |
| Rate | MAX_EVENTS_PER_CLIENT_MINUTE=300 |
| Policy | TELEMETRY_GOVERNANCE_POLICY=mq-governance/2 |
| Retention | TELEMETRY_RETENTION_DAYS=730; TELEMETRY_RETENTION_MODE=automatic |
| Cron | 17 4 * * *; daily 04:17 UTC |
| Measurement/disclosure | mq-measurement/1; mq-disclosure/2 |

Verify actual D1 tables/constraints and applied migrations without running migrations. Existing migration 0002 performs data repair; do not replay it as a smoke test. No new migration is required by the audited release. Owner must capture the current route/trigger/configuration through UI because local files are not the remote baseline. Record the exact live-to-approved diff before deployment. Ensure the chosen prior Worker version is available and compatible with this unchanged database schema.

Review non-destructive production retention preview **before** enabling an automatic trigger, if the current deployed maintenance route supports it. If old code lacks it, determine eligible counts through a separately reviewed read-only procedure; do not deploy first merely to discover destructive scope. Daily activation authorizes normal policy retention of all eligible runs, not just synthetic ones. Do not proceed if owner has not reviewed that consequence.

## Deployment

Only following separate activation authorization and completion of the gates:

```powershell
npx --no-install wrangler deploy --config $mqConfig
```

This mutates Worker deployment/configuration and can register the automatic cron; the next successful invocation can delete eligible production data. Preserve output version/deployment identifiers without secrets. Do not run a root website deploy accidentally. Revised static clients/disclosures need the established website release process and separately reviewed built asset manifest; there is no ready dist artifact certified by this audit. Preserve all student-active files, including National Engine, byte-for-byte. National Engine is LEGACY IDENTIFYING TELEMETRY — OUTSIDE OPERATIONAL ANONYMOUS D1 ACTIVATION; do not create speculative exclusions or break that game. Publish only the authorized release after server schema-3 compatibility is confirmed.

## Secrets

Names only: **ADMIN_TOKEN**, **MAINTENANCE_TOKEN**. Distinct values; initial custodian is Project Owner / Telemetry Custodian. Verify presence and protected custody. No rotation by default. Only if missing and separately authorized, use protected prompts:

```powershell
npx --no-install wrangler secret put ADMIN_TOKEN --config $mqConfig
npx --no-install wrangler secret put MAINTENANCE_TOKEN --config $mqConfig
```

Never pass values as arguments or save them in source, configuration, reports or screenshots. Manual operator helper consumes MQ_ADMIN_ENDPOINT, MQ_ADMIN_TOKEN, MQ_MAINTENANCE_TOKEN from the private environment. Internal scheduled execution requires neither secret. Disabling secrets does not stop ingestion or scheduled deletion.

## Production Verification

Use a fresh isolated browser profile, synthetic input and a unique synthetic run ledger. No student names/emails. Capture response status/counts and synthetic IDs only; keep any admin-wide response privately because it can contain existing run pseudonyms. Do not call broad cleanup.

Prepare local variables and helpers (no network until a helper is called). MQ_ADMIN_TOKEN and MQ_MAINTENANCE_TOKEN must already be securely present; do not print them:

```powershell
$mqBase = 'https://masteryquests.org/api/anonymous-telemetry-poc'
$env:MQ_ADMIN_ENDPOINT = $mqBase
$mqAdmin = @{ Authorization = ('Bearer ' + $env:MQ_ADMIN_TOKEN) }
$mqBoth = @{ Authorization = ('Bearer ' + $env:MQ_ADMIN_TOKEN); 'x-telemetry-maintenance' = $env:MQ_MAINTENANCE_TOKEN }
function Read-Mq([string]$path, [hashtable]$headers) {
  Invoke-WebRequest -Uri ($mqBase + $path) -Method Get -Headers $headers -UseBasicParsing -MaximumRedirection 0
}
function Post-Mq([string]$path, [hashtable]$headers, $body) {
  Invoke-WebRequest -Uri ($mqBase + $path) -Method Post -Headers $headers -ContentType 'application/json' -Body ($body | ConvertTo-Json -Depth 20 -Compress) -UseBasicParsing -MaximumRedirection 0
}
$mqRun = [guid]::NewGuid().ToString()
$mqClient = [guid]::NewGuid().ToString()
$mqBuild = 'operational-smoke-' + [guid]::NewGuid().ToString()
$mqOrigin = @{ Origin = 'https://masteryquests.org' }
```

HTTP 4xx negative tests can throw in PowerShell: inspect the exception's response status, not a credential-bearing request dump. Expected failures are test success.

| # | Exact command/tool action | Expected | Mutation and cleanup |
|---|---|---|---|
| 1 | `Read-Mq '/v1/health' @{}` | 200, ok true, expected phase, storage true. Binding truthiness only. | Read-only; none. |
| 2 | `Invoke-WebRequest -Uri ($mqBase+'/v1/events') -Method Options -Headers @{Origin='https://masteryquests.org'; 'Access-Control-Request-Method'='POST'; 'Access-Control-Request-Headers'='content-type,x-telemetry-phase'} -UseBasicParsing`; repeat with www Origin | 204; exact echoed origin, allowed methods/headers, no allow-credentials. | Read-only; none. |
| 3 | Repeat OPTIONS with Origin `https://unapproved.invalid`; also `Post-Mq '/v1/events' @{Origin='https://unapproved.invalid'} @{}` | 403 before ingestion. | No row write expected. |
| 4 | Execute synthetic envelope block below, then `Post-Mq '/v1/events' $mqOrigin $mqEnvelope` | 202; accepted 3 and all three acknowledged IDs. Repeat the identical envelope: accepted 0, duplicates 3. | Writes synthetic events/run plus batch/rate diagnostics; exact UUID cleanup below. |
| 5 | `Read-Mq ('/v1/admin/runs/'+$mqRun+'/reconstruct') $mqAdmin`; also run read without /reconstruct | Ordered 1,2,3; one accepted correct answer; completed; wall=1000, active=800, hidden=200 on answer. | Read-only. Minimal fixture intentionally unresolved manifest provenance, not a full game-coverage proof. |
| 6 | `Read-Mq '/v1/admin/summary' $mqAdmin` | 200; test run present if within recent 50; global totals may change from concurrent users. | Read-only; do not publish unrelated run rows. |
| 7 | `node audit_tools/telemetry_governance/admin.mjs export --build-id $mqBuild --include-synthetic --output "$mqBuild.csv"` | Exactly test build rows; 81-column spreadsheet-safe CSV and hash-bound governance sidecar, policy 2/disclosure 2/730. question_id begins with an apostrophe before =1+1; raw run JSON retains =1+1. | Read-only server; creates local files in restricted custody. Validate below. |
| 8 | `Read-Mq '/v1/admin/summary' @{}` and `Read-Mq '/v1/admin/summary' @{Authorization='Bearer synthetic-invalid-credential'}` | Both 401. | No mutation. |
| 9 | `Post-Mq '/v1/admin/retention' $mqAdmin @{action='dry-run'}`; repeat with wrong maintenance header; maintenance-only headers; finally `$mqBoth` | Admin-only/wrong maintenance 403; maintenance-only 401; both 200. Never change real secrets to simulate equality. Equal-token rejection already locally tested. | Preview-only, no deletion. |
| 10 | `node audit_tools/telemetry_governance/admin.mjs policy`; `node audit_tools/telemetry_governance/admin.mjs retention` | Exact policy and reviewed cutoff/counts; preview only. | Read-only D1 through POST; preserve private counts. |
| 11 | Exact UUID preview/delete below | Preview 1 run/3 events (unless fixture changed); actual delete same. Read run afterward: events []; repeat preview 0. | Destructive synthetic-only UUID; never cleanup scope=synthetic/build globally. |
| 12 | Local fixed-time scheduled fixture command in Retention Verification; owner UI real Cron invocation inspection | Local old/boundary/late/rollback/overlap checks pass; production scheduled report success with approved counts. | Local synthetic deletion only for fixture. Production cron normally deletes policy-eligible data; it is not a dry-run. |
| 13 | Browser open approved private POC game with `?telemetrySynthetic=1` in fresh profile; generate the private artifact explicitly with --allow-anonymous-data-collection (never a browser URL permission override); start a synthetic run, answer, switch tab briefly, select/copy game text, finish a short mode; DevTools Network inspect events | Explicitly enabled state, no direct identifiers; schema3 manifest, contract/version/context/timing. Save actual run IDs. | Synthetic writes to POC build. Filter retained evidence by exact run; cleanup UUIDs individually. Classroom source forces synthetic=false, so do not use its normal production transport for a synthetic-only marked test. |
| 14 | In that isolated POC run turn off “Send future anonymous gameplay events”; wait for any already in-flight request; continue, refresh; exercise approved disabled build too | No new POST, queued unsent events cancelled, disabled persists, disabled build cannot be re-enabled in browser. Missing/invalid configuration must also stay off; verify using isolated synthetic generated artifacts. | No new writes after disable, aside from unavoidable previously in-flight request; cleanup actual test IDs. |
| 15 | Continue while disabled, Download Game Data; play public Managerial and freshly generated default Composer with DevTools Network capture | Local CSV grows/downloads; gameplay functional; zero anonymous POST. | Local-only. Close isolated profile after retaining synthetic evidence. |

Synthetic envelope for step 4 (current schema 3 accepts contract-only unresolved fixture; full manifest proof comes from step 13):

```powershell
$mqEvents = @()
$mqTypes = @('run_started','answer_evaluated','run_completed')
for ($mqIndex = 0; $mqIndex -lt 3; $mqIndex++) {
  $mqEvent = @{
    eventId=[guid]::NewGuid().ToString(); runId=$mqRun; anonymousClientId=$mqClient
    buildId=$mqBuild; buildVersion='synthetic-readiness-fixture-v1'; schemaVersion=3
    phase='phaseAnonymousTelemetryPOC-v1'; gameId='synthetic-readiness'; mode='quiz'
    eventType=$mqTypes[$mqIndex]; sequenceNumber=($mqIndex+1)
    eventTimestamp=[DateTime]::UtcNow.ToString('o'); synthetic=$true
    contractID='mq-measurement/1'; provenanceStatus='unresolved'
  }
  if ($mqIndex -eq 1) {
    $mqEvent.questionId='=1+1'; $mqEvent.conceptId='synthetic-topic'
    $mqEvent.learningObjective='synthetic-objective'; $mqEvent.questionType='mcq'
    $mqEvent.selectedResponse=0; $mqEvent.correct=$true; $mqEvent.acceptedAttempt=$true
    $mqEvent.responseTimeMs=1000; $mqEvent.activeResponseTimeMs=800
    $mqEvent.hiddenTimeMs=200; $mqEvent.tabSwitchCount=1
  }
  if ($mqIndex -eq 2) { $mqEvent.completionStatus='quiz_complete' }
  $mqEvents += $mqEvent
}
$mqEnvelope = @{phase='phaseAnonymousTelemetryPOC-v1';events=$mqEvents}
```

Do not regenerate IDs before the duplicate test. Preserve the exact synthetic UUID ledger for cleanup. Optional offline CSV check:

```powershell
node audit_tools/telemetry_contract/validate.mjs "$mqBuild.csv" "$mqBuild-validation.json" "$mqBuild.csv.governance.json"
```

The minimal fixture is intentionally unresolved and can yield NEEDS_REVIEW for missing manifest/provenance; do not reinterpret that as a complete measured gameplay run. The full browser-generated test must resolve its manifest and preserve versions. Verify exact CSV row count/build/run IDs and governance sidecar even when the minimal fixture's provenance is unresolved.

## Synthetic Cleanup

Stop/disable all synthetic producers first. For each exact run UUID in the test ledger, verify its events are synthetic and belong to this activation before proceeding:

```powershell
Read-Mq ('/v1/admin/runs/'+$mqRun) $mqAdmin
node audit_tools/telemetry_governance/admin.mjs delete-run --run-id $mqRun
# Only after inspecting the matching preview:
node audit_tools/telemetry_governance/admin.mjs delete-run --run-id $mqRun --execute --confirm ('DELETE_RUN:'+$mqRun)
node audit_tools/telemetry_governance/admin.mjs delete-run --run-id $mqRun
Read-Mq ('/v1/admin/runs/'+$mqRun) $mqAdmin
```

Deletion is whole-run and irreversible at the application layer. Repeat preview should report zero. Late retries can recreate rows, so close/disable synthetic clients first and recheck afterward. Run deletion leaves batch/rate diagnostics because batches lack run IDs; they age under existing retention/short-window cleanup. Do not claim zero remaining auxiliary rows. Synthetic exports remain files and require separate custodian disposal after preserving approved evidence. No broad real-data restore is a smoke-test cleanup mechanism.

## Retention Verification

Production preview is `node audit_tools/telemetry_governance/admin.mjs retention` with both credentials. Preserve cutoff/counts; do **not** append --execute merely for a smoke check.

The exact maintained eligibility/automatic-handler test uses isolated local synthetic SQLite and fixed server time:

```powershell
$env:MQ_EVIDENCE_DIR = 'validation_artifacts/activation-scheduled-' + [guid]::NewGuid().ToString()
node audit_tools/telemetry_governance/scheduled-check.mjs
```

Expected 11/11 pass: old/boundary/straddling/recent/incomplete/legacy/current/invalid/late receipt, actual atomic deletion, repeat/overlap, failures and internal authority. This does not test Cloudflare trigger registration. Owner separately observes the real scheduled invocation's cron, timestamp, success and bounded deletion counts after activation. It uses normal production retention authority and may delete any reviewed eligible real data.

A newly ingested synthetic run has fresh server receipts and cannot expire for 730 days. Client timestamp backdating cannot make it eligible. Do not change policy/clock, update production timestamps, trigger a broad manual purge or invent a public scheduler route. If owner insists on remote synthetic eligible deletion proof now, prepare a separately authorized isolated non-production D1/Worker fixture with reviewed synthetic rows; no such resource is created by this runbook. Record this proof boundary honestly.

## Rollback

Preserve before-state first: previous Worker version UUID, website release, routes, cron list, vars, binding identity and secret-name custody metadata. From separately authorized rollback context:

```powershell
# Set this from captured pre-deployment metadata, never guess:
$mqPriorVersion = Read-Host 'Previously captured telemetry Worker version UUID'
npx --no-install wrangler rollback $mqPriorVersion --config $mqConfig
```

Inspect the resulting deployment, health and bindings. Restore route/cron configuration separately to the captured baseline through the owner UI if needed, and verify actual trigger state. Do not assume code rollback restores triggers, secrets or database contents. Restore the matching static release via its established release process. If immediate containment is needed, owner disables distribution/collection for the affected build and separately suspends the trigger through provider controls; removing maintenance/admin tokens alone does not stop the trigger or ingestion. Configuration suspension is an explicitly authorized incident action, not a silent change to the 730-day policy.

Cloudflare supports rollback to a recorded prior Worker version, but connected resource contents are not rolled back. Therefore deleted rows cannot be recovered by Worker rollback, and restoration from backups is a separate owner-controlled recovery decision with wider data implications. See [Cloudflare rollback documentation](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/). Do not rotate secrets as an automatic rollback step.

## Provider/UI Verification

Owner records dated evidence for:

- Correct account, Worker deployment/version/environment and route assignment, including apex/www distinction.
- D1 database UUID/binding, schema/migrations and access rights; no mutation for discovery.
- Exact approved nonsecret vars and daily trigger; successful invocation/error visibility and alert responsibility.
- ADMIN_TOKEN/MAINTENANCE_TOKEN existence and distinct protected custody, account member/API token rights, MFA/SSO.
- Worker observability/logs/traces/Logpush, security/access logs and analytics: actual contents, retention, destinations and access. Application excludes IP fields; provider requests can contain IP/network data.
- D1 Time Travel/backups, restore behavior, provider-side copies, export recipients and disposal responsibilities.
- National Engine separate legacy transport boundary and unchanged-file release verification; no signed endpoint or credential values copied into evidence.

## Final Evidence

Preserve reviewed source HEAD/diff, generator checks, before/after deployment/config metadata, B1/I1 closure and owner-accepted I2/I3 boundaries, provider checklist, health/CORS status, exact synthetic event/run ledger, expected failures, reconstruction/counts, synthetic CSV/hash sidecar, manifest validation, browser screenshots/network captures with credentials and unrelated rows excluded, UUID deletion previews/results, actual cron status and local scheduled fixtures. Record remaining auxiliary receipts and copy custody. Record any rollback and actual restored config separately. Sign off on controlled activation only after all required evidence exists; do not convert audit-local passes into a production verification claim.
