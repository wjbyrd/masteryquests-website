# Capability operator — current production

Production capability ingest, issuance and exact legacy grace are ON. Current versions, quotas, sunset and phase-file review are in the [production runbook](../../PRODUCTION_RUNBOOK_portable_telemetry.md). Production smoke evidence is in the [final report](../../FINAL_REPORT_portable_telemetry_production_rollout.md).

> **Never use `CAPABILITY_INGEST_ENABLED=false` as a post-capability kill switch. It restores legacy admission semantics. Deploy the rehearsed pause configuration.**

## Authorization and transport

The canonical header is **X-MQ-Ingest-Token**. The retired X-MQ-Ingest-Capability header rejects whenever capability ingest is enabled, including empty values or both headers. Invalid capabilities never fall back to grace. Operator UUIDs, cookies, Authorization, query strings and request JSON are not ingest capability authority. Keep raw capabilities and their digests out of reports, CSVs, logs and troubleshooting commands. There is no raw-token retrieval procedure.

Only official Composer origins may issue capabilities. Enabled `/v1/events` preflight permits POST and content-type, x-telemetry-phase, x-mq-ingest-token from serialized valid HTTPS origins, without credentials. It does not open issuance or administration CORS. A copied generated file carries its existing build authorization, not faculty/learner identity or admin authority.

## HTTPS hosts, local files and LMS limits

Telemetry-enabled generated games can submit from supported HTTPS hosts. Arbitrary valid HTTPS origin is transport permission only; a valid build-scoped capability remains authorization. Issuance is only from official Mastery Quests Composer origins.

A telemetry-enabled generated game opened as `file://...` has an opaque/null browser Origin. Production intentionally rejects null origins; remote preflight may return 403. Gameplay and local telemetry CSV remain available. The exact same build, hosted on a supported HTTPS origin with its valid capability, may submit remotely. This is expected security behavior. Restrictive LMS sandbox/CSP or network policies can also prevent remote collection; test the actual student context. No cross-host browser identity continuity or learner identity assurance is provided.

Faculty opt-in is required; browser opt-out, expiry or revocation stops future remote collection. Capability lifetime is 365 days; telemetry retention remains 730 days. Revocation does not delete accepted telemetry. National Engine is outside this rollout and remains its separate known legacy transport exception.

## Read-only operator queries

Use authenticated Cloudflare operator access and the runbook’s `Invoke-Wrangler` function from the repository root. Confirm D1 name `managerial-telemetry-poc`, UUID `16b248ff-20cb-429c-a4a1-dd50d17c1fd0`, before any operation. These projections deliberately omit capability hashes, activation digests, raw payloads and learner identifiers. Never use SELECT * or export the authorization tables.

### List active capabilities

```powershell
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT c.capability_id,c.game_id,c.build_id,c.build_version,c.schema_version,c.issued_at,c.expires_at,c.accepted_event_count,c.accepted_bytes,p.blocked_at FROM telemetry_build_capabilities c JOIN telemetry_build_policies p ON p.game_id=c.game_id AND p.build_id=c.build_id WHERE c.revoked_at IS NULL AND c.expires_at>unixepoch() ORDER BY c.expires_at,c.capability_id LIMIT 100"
```

### Check active and usable counts

```powershell
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT COUNT(*) AS active_unrevoked_unexpired,COALESCE(SUM(CASE WHEN p.blocked_at IS NULL THEN 1 ELSE 0 END),0) AS usable_unblocked FROM telemetry_build_capabilities c JOIN telemetry_build_policies p ON p.game_id=c.game_id AND p.build_id=c.build_id WHERE c.revoked_at IS NULL AND c.expires_at>unixepoch()"
```

### Inspect aggregate receipts in the last day

```powershell
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT capability_id,COUNT(*) AS receipts,SUM(inserted_count) AS accepted_events,SUM(duplicate_count) AS duplicates,MIN(received_at) AS first_receipt,MAX(received_at) AS last_receipt FROM telemetry_ingest_batches WHERE received_at>=datetime('now','-1 day') GROUP BY capability_id ORDER BY last_receipt DESC LIMIT 100"
```

### Inspect current scope counters and lifetime global accounting

```powershell
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT unixepoch() AS server_time,scope_type,scope_key,window_seconds,window_start,request_count,event_count,byte_count FROM telemetry_scope_windows WHERE window_seconds=0 OR expires_at>unixepoch() ORDER BY scope_type,window_start DESC LIMIT 200"
```

### Inspect client limiter without exporting client identifiers

```powershell
Invoke-Wrangler d1 execute managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc --command "SELECT unixepoch() AS server_time,window_minute,COUNT(*) AS clients,MIN(event_count) AS minimum_events,MAX(event_count) AS maximum_events,SUM(event_count) AS submitted_events FROM telemetry_rate_limits WHERE window_minute>=CAST(unixepoch()/60 AS INTEGER)-1 GROUP BY window_minute"
```

Active here means unrevoked and unexpired; blocked builds are excluded only from the separate usable count. The closeout observed active=0. NULL receipt capability_id includes historical/grace traffic and is not a new capability. Aggregate receipt times may advance on duplicate requests; use telemetry_runs.last_received_at to assess retention. Limit queries to the incident time/scope and inspect further pages if a LIMIT is reached.

For 429 diagnosis correlate the exact affected client counter in the protected operator session when necessary; record only its count/window, not the client identifier. Compare capability/build cumulative accepted_event_count and accepted_bytes with the runbook limits as well as the minute windows. The global lifetime row has window_seconds=0. Client time is not the database clock.

## Revoke one capability or block one build

These are production mutations for a separately authorized incident, not closeout checks. Before UPDATE, use a SELECT with the same validated identifier to confirm exactly one intended capability or build-policy row. Stop on a missing or unexpected row; do not create a replacement policy or broaden the predicate. After UPDATE, repeat the scoped SELECT to verify revoked_at or blocked_at. Record the nonsecret identifier, reason, operator approval, time and affected scope.

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


## Corrected ingest retry contract

`429 ingest_rate_limited` means a short-window limit, with Retry-After equal to the remaining database-clock seconds in the minute (1–60). The generated Composer client honors delta-seconds or HTTP-date Retry-After, uses a one-second minimum and a 60-second fallback for malformed/missing values, then adds 0–1 second jitter above the greater of the server delay and exponential backoff. It permits at most three retries after the initial request within five minutes. New gameplay events and manual flushes cannot bypass the delay. Late background wake beyond that horizon stops sending.

Retry exhaustion cancels this page's queued remote work and pauses its transport; it does not persistently invalidate a healthy capability. The queue remains capped at 2,000 events. Original event IDs/sequences survive retries. Browser/faculty opt-out and expiry cancel pending transport. A revocation/authorization `403` and `403 ingest_budget_exhausted` remain terminal for the descriptor; they never trigger renewal or legacy fallback. Unknown 429 codes also fail closed. Network/503 recovery uses the same bounded Composer retry budget. Gameplay and local CSV remain available.

The server reclassifies a stale minute snapshot within a maximum of three admission attempts, retaining every transactional freshness and quota guard. Repeated transitions return controlled 503 with no partial writes. Lifetime budgets take precedence over minute throttles and return terminal 403; increasing a minute limit cannot repair lifetime exhaustion.

For unexplained 429s, do not force repeated Generate or flush operations. Record server time, Retry-After, submitted event count, relevant capability/build/global/client counters and limits, and whether a boundary was crossed. Keep token values, raw headers and learner data out of evidence. Investigate recurrent rejection below quota even if a bounded retry succeeds. The original Stage 3 incident remains historically unproven; the deterministic defect and its regression evidence are documented separately.


## Emergency issuance stop

For issuance abuse or provider outage, deploy the reviewed capability-aware issuance-off configuration: ingest=true, issuance=false, exact grace=true. Existing valid capabilities remain usable; new issuance is unavailable. Commands below are procedures for an authorized incident, not actions performed by closeout.

```powershell
Invoke-Wrangler deploy --config .wrangler/stage5-release/issuance-off.json --name masteryquests-anonymous-telemetry-poc
```

## Emergency ingest stop

For ingest abuse or D1 instability, deploy the rehearsed pause entry. It rejects ingest and issuance with 503 before D1 access, including legacy traffic, while preserving health (200), admin and scheduled dispatch. Health alone does not prove intake is open.

```powershell
Invoke-Wrangler deploy --config .wrangler/stage5-release/pause.json --name masteryquests-anonymous-telemetry-poc
```

**Never use `CAPABILITY_INGEST_ENABLED=false` as a post-capability kill switch: it restores legacy admission semantics.**

Verify the new deployed version, route behavior and flags after propagation. In-flight requests may finish; unsent data may be lost. Gameplay and local CSV continue. Resume only after diagnosis and incident approval, using reviewed `on.json` (normal) or `issuance-off.json` (ingest only). Never reset lifetime counters as a recovery shortcut.

Prepare/review phase files and verify production versions using the [runbook](../../PRODUCTION_RUNBOOK_portable_telemetry.md#operator-setup-and-configuration-review). Expiry/revocation stops future remote collection and does not delete accepted telemetry. Block affects all capabilities/revisions for the exact game/build and its grace path. Do not silently un-revoke a compromised capability.
