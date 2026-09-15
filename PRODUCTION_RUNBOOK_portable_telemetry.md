# Portable telemetry production runbook — BLOCKED / DO NOT EXECUTE YET

This is the subsequent rollout task's runbook. **Every production mutation below is DO NOT RUN IN THIS REHEARSAL.** Production remains NO-GO until the engineering evidence in FINAL_REPORT_portable_telemetry_quota_boundary_fix.md is accepted, the production Turnstile widget/sitekey is ready, and the owner approves the pilot quota/tier and exact legacy sunset. No push is authorized by this document. Refresh resource versions and bookmarks at release time; the values here are rehearsal observations.

## Corrected ingest retry contract

`429 ingest_rate_limited` means a short-window limit, with Retry-After equal to the remaining database-clock seconds in the minute (1–60). The generated Composer client honors delta-seconds or HTTP-date Retry-After, uses a one-second minimum and a 60-second fallback for malformed/missing values, then adds 0–1 second jitter above the greater of the server delay and exponential backoff. It permits at most three retries after the initial request within five minutes. New gameplay events and manual flushes cannot bypass the delay. Late background wake beyond that horizon stops sending.

Retry exhaustion cancels this page's queued remote work and pauses its transport; it does not persistently invalidate a healthy capability. The queue remains capped at 2,000 events. Original event IDs/sequences survive retries. Browser/faculty opt-out and expiry cancel pending transport. A revocation/authorization `403` and `403 ingest_budget_exhausted` remain terminal for the descriptor; they never trigger renewal or legacy fallback. Unknown 429 codes also fail closed. Network/503 recovery uses the same bounded Composer retry budget. Gameplay and local CSV remain available.

The server reclassifies a stale minute snapshot within a maximum of three admission attempts, retaining every transactional freshness and quota guard. Repeated transitions return controlled 503 with no partial writes. Lifetime budgets take precedence over minute throttles and return terminal 403; increasing a minute limit cannot repair lifetime exhaustion.

For unexplained 429s, do not force repeated Generate or flush operations. Record server time, Retry-After, submitted event count, relevant capability/build/global/client counters and limits, and whether a boundary was crossed. Keep token values, raw headers and learner data out of evidence. Investigate recurrent rejection below quota even if a bounded retry succeeds. The original Stage 3 incident remains historically unproven; the deterministic defect and its regression evidence are documented separately.

The blocker-fix read-only check observed website version `e0cff283-c818-4524-9a35-489933a3b74a`, newer than the rehearsal's site baseline. This task did not deploy it. Reconcile its provenance and refresh the reviewed website rollback target at the release hold; do not assume the rehearsal version is still current.

## Release inputs and read-only preparation

Run from Windows PowerShell in the repository. Use pinned Wrangler through npx rather than a transient cache path. The rehearsal used 4.72.0 successfully; upgrading it requires a fresh dry run.

```powershell
Set-Location 'C:\Users\Jennings\Documents\GitHub\masteryquests-website'
function Invoke-Wrangler {
  & npx --yes wrangler@4.72.0 @args
  if ($LASTEXITCODE -ne 0) { throw 'Wrangler failed; stop the release' }
}
git status --short
git branch --show-current
git rev-parse HEAD
git log -5 --oneline
git ls-remote origin refs/heads/main
Invoke-Wrangler --version
Invoke-Wrangler whoami
Invoke-Wrangler deployments list --name masteryquests-anonymous-telemetry-poc --config server/anonymous-telemetry-poc/wrangler.jsonc
Invoke-Wrangler deployments list --name masteryquests-website --config wrangler.jsonc
Invoke-Wrangler d1 info managerial-telemetry-poc --config server/anonymous-telemetry-poc/wrangler.jsonc
Invoke-Wrangler d1 migrations list managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc
Invoke-Wrangler d1 time-travel info managerial-telemetry-poc --config server/anonymous-telemetry-poc/wrangler.jsonc --json
node audit_tools/telemetry_governance/stage5-production-baseline.mjs
```

Require production D1 `16b248ff-20cb-429c-a4a1-dd50d17c1fd0`, TELEMETRY_DB binding, and route `masteryquests.org/api/anonymous-telemetry-poc/*`. Rehearsal telemetry rollback version: `afaa4ada-d6cf-48a5-bdde-13cc35f52f80`. Website current rollback version: `edebb0d2-6ecd-4b82-860d-233ed6b4e37d`; previous: `8681fb11-550a-47dd-bb3e-f6070ab17ca5`. Record any newer reviewed versions before proceeding. Never substitute a staging resource.

Owner approves an exact UTC rollout instant, pilot limits, and the single beta legacy entry. Generate local phase configs; this command does not deploy:

```powershell
$RolloutUTC = Read-Host 'Owner-approved rollout UTC, e.g. YYYY-MM-DDTHH:MM:SS.000Z'
node audit_tools/telemetry_governance/stage5-release-config.mjs $RolloutUTC
Get-Content .wrangler/stage5-release/release-inputs.json
Invoke-Wrangler deploy --dry-run --config .wrangler/stage5-release/off.json --outdir .wrangler/release-dryrun-off
Invoke-Wrangler deploy --dry-run --config .wrangler/stage5-release/pause.json --outdir .wrangler/release-dryrun-pause
```

The illustrative rehearsal timestamp was 2026-09-16T00:00:00.000Z, yielding 2026-12-15T00:00:00.000Z sunset. **Those dates are not approved release dates. Regenerate all configs with the actual approved instant.** Do not use the example configs left under `.wrangler` without regeneration and review.

## HOLD 1 — bounded collection pause and migration

Owner must explicitly approve both the pause deployment and migration. Require green release regressions, exact migration SHA `d67432d1c9ed8c85f5a407cf7e606ff05cc00d63effe2ce909797fa6efb61951`, current Time Travel bookmark, matching resources, and a collection window avoiding the 04:17 UTC retention cron. Notify affected beta operators of the bounded pause. Estimate minutes operationally; local index timings are not production downtime guarantees.

**DO NOT RUN IN THIS REHEARSAL:**

```powershell
Invoke-Wrangler deploy --config .wrangler/stage5-release/pre-migration-pause.json --name masteryquests-anonymous-telemetry-poc
```

The pause entry rejects ingest and issuance with 503, including legacy submissions, while preserving health/admin and existing scheduled behavior. Verify the deployed version and endpoint behavior after propagation. Then owner confirms migration:

```powershell
# DO NOT RUN IN THIS REHEARSAL
Invoke-Wrangler d1 migrations apply managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc
```

Read-only verification:

```powershell
Invoke-Wrangler d1 migrations list managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "PRAGMA table_info(telemetry_ingest_batches)"
```

If migration fails, stop. Inspect its transaction status and migration table; never blindly reapply individual statements. If it succeeds but release is aborted, leave additive tables/columns/indexes intact. Before any production capability exists, the known-good old Worker remains a valid code rollback. Do not drop tables/indexes as routine rollback.

## HOLD 2 — capability-aware Worker, all flags OFF

Require migration verification, rollback ID, and an approved candidate commit containing the 429 fix. This transition ends the bounded collection pause and restores legacy behavior.

```powershell
# DO NOT RUN IN THIS REHEARSAL
Invoke-Wrangler deploy --config .wrangler/stage5-release/off.json --name masteryquests-anonymous-telemetry-poc
```

Read-only checks:

```powershell
Invoke-RestMethod 'https://masteryquests.org/api/anonymous-telemetry-poc/v1/health'
Invoke-Wrangler deployments list --name masteryquests-anonymous-telemetry-poc --config server/anonymous-telemetry-poc/wrangler.jsonc
```

Owner runs one designated synthetic interaction in the exact beta artifact before continuing. Confirm its expected legacy 202 and aggregate D1 change. Do not use students. Capture the new capability-aware version as `$CapabilityAwareVersion` for post-launch rollback, validating its UUID format before use.

## HOLD 3 — capability ingest and exact bounded grace

Require successful flags-off legacy proof, resource identity, approved pilot tier/budgets, and exact approved legacy sunset. Review `.wrangler/stage5-release/ingest.json`: ingest=true, issuance=false, grace=true, one inventoried tuple only.

```powershell
# DO NOT RUN IN THIS REHEARSAL
Invoke-Wrangler deploy --config .wrangler/stage5-release/ingest.json --name masteryquests-anonymous-telemetry-poc
```

Verify external valid-HTTPS preflight 204, missing/invalid capability rejection, closed external activation/admin CORS, and exact beta grace. Do not manually mint a production capability to test this phase. Issuance remains OFF. Existing proof plus preflight/rejection tests establish server readiness until real owner generation after HOLD 5.

## Production Turnstile owner setup — separate approval required

Create a dedicated widget named **Mastery Quests Composer Production**, Managed mode, hostname masteryquests.org. Keep the existing staging widget unchanged. The server enforces action `mq_build_activate`, apex/www hostname and cData binding. The public sitekey is not secret. The dedicated secret goes only into the production telemetry Worker secret store through Wrangler's secure prompt.

```powershell
# DO NOT RUN IN THIS REHEARSAL; owner pastes the secret directly into Wrangler's prompt
Invoke-Wrangler secret put TURNSTILE_SECRET_KEY --name masteryquests-anonymous-telemetry-poc --config server/anonymous-telemetry-poc/wrangler.jsonc
# Names only, safe read-only verification
Invoke-Wrangler secret list --name masteryquests-anonymous-telemetry-poc --config server/anonymous-telemetry-poc/wrangler.jsonc
```

Do not read a secret file, echo a secret, pass it as an argument, copy it into JSON, or reuse the staging sitekey/secret. Record only widget name, public sitekey and binding name. Verify production provider behavior through manual owner generation, never headless Turnstile.

## HOLD 5 — enable issuance before publishing the configured Composer

This deliberately precedes HOLD 4. Require the production widget/secret, ingest/grace proof, fixed quota-boundary behavior, approved origin restrictions, and a prepared Composer artifact. The current public Composer already includes activation modules but lacks a sitekey; enabling the ready backend before publishing the key avoids an additional configured-UI/server-unavailable interval. No successful activation occurs without the real challenge.

```powershell
# DO NOT RUN IN THIS REHEARSAL
Invoke-Wrangler deploy --config .wrangler/stage5-release/on.json --name masteryquests-anonymous-telemetry-poc
```

Confirm official activation preflight and external denial. Do not announce availability yet. Emergency issuance-only rollback is the `issuance-off.json` deployment below, retaining capability ingest and exact grace.

## HOLD 4 — configured public Composer / website release

Require the ready server and dedicated production public sitekey. In the separately authorized release task, add only the approved public meta setting to canonical Composer HTML, review the diff, and rebuild. No staging endpoint is permitted. This local source mutation is **not performed by Stage 5**:

```powershell
# DO NOT RUN IN THIS REHEARSAL
$ProductionSitekey = Read-Host 'Dedicated PUBLIC production Turnstile sitekey'
if ($ProductionSitekey -notmatch '^0x[A-Za-z0-9_-]+$') { throw 'Invalid public sitekey' }
$ComposerIndex = Join-Path (Get-Location) 'build/faculty-build-composer/index.html'
$ComposerHTML = [System.IO.File]::ReadAllText($ComposerIndex)
if ($ComposerHTML.Contains('name="mq-turnstile-sitekey"')) { throw 'Existing meta requires review before replacement' }
$ComposerHTML = $ComposerHTML.Replace('</head>', '<meta name="mq-turnstile-sitekey" content="' + $ProductionSitekey + '"></head>')
[System.IO.File]::WriteAllText($ComposerIndex, $ComposerHTML)
node audit_tools/public_site_publication/build-dist.mjs .
git diff --check
Invoke-Wrangler deploy --dry-run --config wrangler.jsonc --outdir .wrangler/release-dryrun-site
```

Require ok=true, 151 review PDFs, zero forbidden/incoming files, production endpoints, no staging key/domain and no secret/capability artifacts. Review the exact source diff and follow the owner's commit workflow; do not push without explicit authorization. Then owner approves publication:

```powershell
# DO NOT RUN IN THIS REHEARSAL
Invoke-Wrangler deploy --config wrangler.jsonc --name masteryquests-website
```

## HOLD 6 — synthetic smoke before leaving issuance active

Owner uses ordinary Edge, no students:

1. Health endpoint returns 200; exact beta legacy path remains within its approved grace.
2. Public Composer OFF Generate downloads a ZIP with zero Turnstile/activation requests.
3. Public Composer ON Generate: manual real Turnstile, POST build-capabilities 201, ZIP download.
4. Run the unchanged generated HTML on an approved first-party surface: POST events 202. Verify exact transported run/build/version/schema and capability receipt in D1; do not confuse local game IDs with transport UUIDs.
5. Host that exact file unchanged on the owner's GitHub Pages test site. Observe OPTIONS 204, POST 202, no CORS error, and token-header presence without sharing its value.
6. Verify opt-out, duplicate accepted=0 without event/byte or retention inflation, revocation 403, and gameplay/CSV continuity. No token, digest, HAR, raw headers or raw event export in evidence.
7. Authenticated tail redaction check: token REDACTED/omitted; zero raw credential matches, console or exception exposure. Close tail afterward.
8. Revoke only designated smoke capability IDs. Do not delete accepted records because authorization was revoked. Check no unused smoke capabilities remain.

Read-only structural/aggregate commands:

```powershell
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT COUNT(*) AS runs FROM telemetry_runs"
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT COUNT(*) AS events FROM telemetry_events"
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT COUNT(*) AS receipts FROM telemetry_ingest_batches"
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT COUNT(*) AS active FROM telemetry_build_capabilities WHERE revoked_at IS NULL AND expires_at>unixepoch()"
```

Use the release task's scoped in-memory artifact verifier for exact run/receipt matching; do not dump tables. Keep issuance disabled if any gate fails. Monitor at 5, 15, 30 and 60 minutes, then daily during the pilot. Announcement follows owner acceptance, not deployment completion.

## Exact emergency commands — DO NOT RUN IN THIS REHEARSAL

Issuance abuse/provider outage: stop new issuance while existing capabilities remain usable:

```powershell
Invoke-Wrangler deploy --config .wrangler/stage5-release/issuance-off.json --name masteryquests-anonymous-telemetry-poc
```

Ingest abuse, D1 instability, emergency migration pause: reject all ingest and issuance while preserving authorization state:

```powershell
Invoke-Wrangler deploy --config .wrangler/stage5-release/pause.json --name masteryquests-anonymous-telemetry-poc
```

**Never use ingest=false as the post-capability kill switch. It restores legacy admission.** The pause intentionally interrupts legacy remote collection too. Local gameplay/CSV continue; in-flight requests may finish before deployment propagation, and unsent data may not all be recovered. Resume only after diagnosis and owner approval using the reviewed `ingest.json` or `on.json`. Do not reset lifetime counters casually.

Specific compromised/smoke capability: authenticated Cloudflare D1 operator action, not public HTTP authority. Validate the nonsecret operator UUID and record approval:

```powershell
$CapabilityId = Read-Host 'Exact reviewed capability operator UUID, NOT the raw token'
if ($CapabilityId -notmatch '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$') { throw 'Invalid operator UUID' }
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "UPDATE telemetry_build_capabilities SET revoked_at=unixepoch() WHERE capability_id='$CapabilityId' AND revoked_at IS NULL"
```

One compromised build:

```powershell
$BuildId = Read-Host 'Exact reviewed composer build ID'
if ($BuildId -notmatch '^composer-[a-f0-9]{64}$') { throw 'Invalid build ID' }
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "UPDATE telemetry_build_policies SET blocked_at=unixepoch() WHERE game_id='faculty-composer' AND build_id='$BuildId' AND blocked_at IS NULL"
```

These preserve accepted telemetry. Recovery from compromise is a new approved build/activation after investigation, not silently un-revoking credentials. ADMIN_TOKEN and MAINTENANCE_TOKEN HTTP requirements remain unchanged; no new public controls are introduced.

## Rollback eras

**Pre-capability only:** before any production capability is issued, old Worker rollback can restore legacy behavior while leaving unused migration 0003 schema in place:

```powershell
# DO NOT RUN IN THIS REHEARSAL; only valid before production capabilities exist
Invoke-Wrangler rollback afaa4ada-d6cf-48a5-bdde-13cc35f52f80 --name masteryquests-anonymous-telemetry-poc --config server/anonymous-telemetry-poc/wrangler.jsonc --message 'Pre-capability release rollback'
```

**Post-capability:** deploy the pause entry or a reviewed capability-aware version/config with capability enforcement retained. Do not roll back to the old unauthenticated Worker. A version rollback must preserve the intended flags, bindings, secret availability and exact grace sunset; verify them explicitly. The runbook prefers redeployment from a reviewed capability-aware commit/config over guessing version-bound configuration.

Website-only rollback does not revoke capabilities or restore D1:

```powershell
# DO NOT RUN IN THIS REHEARSAL; refresh the known-good ID before actual rollout
Invoke-Wrangler rollback edebb0d2-6ecd-4b82-860d-233ed6b4e37d --name masteryquests-website --config wrangler.jsonc --message 'Composer release rollback'
```

The current site baseline itself lacks a production sitekey, so pair UI rollback with issuance OFF as appropriate. Existing authorized game files may continue ingesting.

## Disaster recovery is separate

D1 Time Travel is available; the rehearsal bookmark is recorded in `time-travel.json`. Database restore is not routine code rollback: it can lose accepted events, resurrect revoked capabilities, remove blocks and rewind quota accounting. Require a separate incident approval, current authorization-state reconciliation plan and exact incident bookmark before considering restore. **No restore command was executed in Stage 5.**

```powershell
# DISASTER-RECOVERY ONLY; DO NOT RUN IN THIS REHEARSAL
$IncidentBookmark = Read-Host 'Separately reviewed incident recovery bookmark'
Invoke-Wrangler d1 time-travel restore managerial-telemetry-poc --bookmark $IncidentBookmark --config server/anonymous-telemetry-poc/wrangler.jsonc
```

Keep intake paused after restore until revocations, blocks and quotas are reconciled and smoke tests pass. Never use the rehearsal bookmark automatically for a later incident.
