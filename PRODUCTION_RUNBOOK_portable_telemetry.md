# Portable telemetry — current production operations runbook

**PORTABLE TELEMETRY PRODUCTION ROLLOUT — COMPLETE.** State below records the owner-operated production closeout, reconciled with repository source. See [final report](FINAL_REPORT_portable_telemetry_production_rollout.md) and [owner evidence](validation_artifacts/portable_telemetry_production_rollout/owner-production-attestation.md). Historical Stage 1–5 reports describe their original gates and are not current operating instructions. Refresh metadata before a later incident.

> **Never use `CAPABILITY_INGEST_ENABLED=false` as a post-capability kill switch. It restores legacy admission semantics. Use the rehearsed ingest pause.**

## Normal current state

Production is live as recorded by the owner on 2026-09-15.

| Field | Value |
|---|---|
| telemetry_Worker | `masteryquests-anonymous-telemetry-poc` |
| current_telemetry_version | `333d2d44-edf3-45f8-b0ff-9b1e9065977d` |
| website_Worker | `masteryquests-website` |
| current_website_version | `d0cb7115-58f1-4671-ad1e-8eb914e80ea5` |
| D1 | `managerial-telemetry-poc` |
| D1_UUID | `16b248ff-20cb-429c-a4a1-dd50d17c1fd0` |
| binding | `TELEMETRY_DB` |
| migrations | `0001 / 0002 / 0003_build_ingest_capabilities.sql applied` |
| CAPABILITY_INGEST_ENABLED | `true` |
| CAPABILITY_ISSUANCE_ENABLED | `true` |
| CAPABILITY_LEGACY_GRACE_ENABLED | `true` |

A dedicated production Turnstile widget is provisioned. Public sitekey: `0x4AAAAAAE2FLWXPDiiJsAFx`. `TURNSTILE_SECRET_KEY` is installed as a production Worker secret. Never read or record its value. Issuance is restricted to official Composer origins `https://masteryquests.org` and `https://www.masteryquests.org`; server verification checks action `mq_build_activate`, approved hostname and context binding. The smoke closeout observed zero active capabilities after test revocations; this is a dated count, not a required steady-state zero.

**Deployment hazard:** committed `server/anonymous-telemetry-poc/wrangler.jsonc` retains all capability flags false. It is a base configuration, not the live release configuration. Do not deploy it directly to production. Reviewed phase configs supply the production flags, pilot quotas and exact inventory. This closeout does not alter configuration.

## Approved pilot quotas

Owner-confirmed plan: **Workers Free**. These are approved pilot ceilings, not a class-capacity guarantee. Release variables use the prefix `MQ_CAP_`.

| Field | Value |
|---|---|
| LIVE_PER_TUPLE | `3` |
| ISSUES_BUILD_DAY | `5` |
| ISSUES_GLOBAL_HOUR | `10` |
| ISSUES_GLOBAL_DAY | `25` |
| CAP_REQUESTS_MINUTE | `600` |
| CAP_EVENTS_MINUTE | `6000` |
| BUILD_EVENTS_MINUTE | `12000` |
| GLOBAL_REQUESTS_MINUTE | `1200` |
| GLOBAL_EVENTS_MINUTE | `24000` |
| CAP_ACCEPTED_EVENTS | `50000` |
| CAP_ACCEPTED_BYTES | `16777216` |
| BUILD_ACCEPTED_EVENTS | `100000` |
| BUILD_ACCEPTED_BYTES | `33554432` |
| GLOBAL_ACCEPTED_BYTES | `67108864` |

Existing `MAX_EVENTS_PER_CLIENT_MINUTE=300` remains unchanged. Accepted logical bytes are not physical D1 size. Lifetime counters are not reset by retention. Retention remains 730 days for whole runs from latest stored server receipt, with daily cron `17 4 * * *` (04:17 UTC).

## Exact legacy grace and sunset

Only this exact tuple and origin receive grace:

| Field | Value |
|---|---|
| game_id | `faculty-composer` |
| build_id | `composer-ede71cd5d8134f4b3997592ae992e19f5014d27d17d6c5a626232fc5ef9c4a8a` |
| build_version | `296544b1222894d84c67298257964b1bfa4808212cad18c5e6e0fd4c1cafd09f` |
| schema_version | `3` |
| allowed_origin | `https://masteryquests.org` |
| sunset_at | `2026-12-14T14:30:00.000Z` |

Sunset is **2026-12-14T14:30:00.000Z**, checked using database time. Planned operator reminders: approximately 30 days before (2026-11-14), seven days before (2026-12-07), and sunset day (2026-12-14). These are documented plans; no reminder automation was created in this task. At/after the exact sunset verify that the grandfathered beta no longer remotely ingests under grace, local gameplay still works, and capability-authenticated builds remain unaffected. Record status-only evidence. Do not remove grace early or extend the sunset without separate approval.

## Operator setup and configuration review

From the repository in PowerShell, use the previously rehearsed pinned Wrangler:

```powershell
function Invoke-Wrangler {
  & npx --yes wrangler@4.72.0 @args
  if ($LASTEXITCODE -ne 0) { throw "Wrangler failed; stop" }
}
Invoke-Wrangler deployments list --name masteryquests-anonymous-telemetry-poc --config server/anonymous-telemetry-poc/wrangler.jsonc
Invoke-Wrangler deployments list --name masteryquests-website --config wrangler.jsonc
Invoke-Wrangler d1 info managerial-telemetry-poc --config server/anonymous-telemetry-poc/wrangler.jsonc
Invoke-Wrangler d1 migrations list managerial-telemetry-poc --remote --config server/anonymous-telemetry-poc/wrangler.jsonc
```

Confirm the production D1 UUID above and current reviewed source before any authorized incident mutation. If phase files need reconstruction, the existing generator is local-only and overwrites phase files. Use the original release input below; **never substitute today’s incident time**, which would extend grace by another 90 days:

```powershell
node audit_tools/telemetry_governance/stage5-release-config.mjs 2026-09-15T14:30:00.000Z
```

This generator input is the instant implied by the approved 90-day sunset, not an independently timestamped deployment observation. Inspect `release-inputs.json` and the selected phase file: exact sunset, one tuple, all approved quotas, D1 UUID, production route, main entry, flags, retention cron and invocation-log setting. Pause main must be `audit_tools/telemetry_governance/stage5-production-pause-entry.mjs`; issuance-off main must be the canonical Worker. Do not deploy `off.json` or `pre-migration-pause.json` now. Dry-run the selected file with `Invoke-Wrangler deploy --dry-run --config <reviewed-phase-file> --outdir .wrangler/incident-dryrun` before deployment. A dry run does not establish live secret availability or behavior.

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

## Current rollback anchors

| Field | Value |
|---|---|
| telemetry_current | `333d2d44-edf3-45f8-b0ff-9b1e9065977d` |
| telemetry_capability_aware_issuance_off | `31b216a5-587f-4060-86fb-4bac4d96079e` |
| website_current | `d0cb7115-58f1-4671-ad1e-8eb914e80ea5` |
| website_immediate_prior_known_good | `622b581f-28ea-43b1-ab7a-8972168a8335` |
| website_pre_sitekey_fallback | `fef3a8ae-5c6a-4f38-82bc-772bd5dca0fe` |

Production capabilities have existed. Do not routinely roll back to a pre-capability legacy Worker, even when active capability count is zero. Prefer reviewed capability-aware phase deployment with enforcement retained; an ingest incident uses the pause deployment. Verify version-bound flags, bindings, secret availability and exact grace before using the issuance-off anchor.

Website rollback is independent of D1 authorization state: it does not revoke capabilities, undo migrations or delete telemetry. The pre-sitekey fallback removes configured Composer activation from the website; existing authorized games can still ingest. Coordinate an issuance stop when appropriate.

D1 Time Travel is separate disaster recovery, never routine code rollback. It can lose accepted records, resurrect revocations, remove blocks and rewind quota accounting. A separately approved incident plan must reconcile authorization state and quotas while intake stays paused. Do not reuse a rehearsal bookmark or drop additive tables.

## Corrected ingest retry contract

`429 ingest_rate_limited` means a short-window limit, with Retry-After equal to the remaining database-clock seconds in the minute (1–60). The generated Composer client honors delta-seconds or HTTP-date Retry-After, uses a one-second minimum and a 60-second fallback for malformed/missing values, then adds 0–1 second jitter above the greater of the server delay and exponential backoff. It permits at most three retries after the initial request within five minutes. New gameplay events and manual flushes cannot bypass the delay. Late background wake beyond that horizon stops sending.

Retry exhaustion cancels this page's queued remote work and pauses its transport; it does not persistently invalidate a healthy capability. The queue remains capped at 2,000 events. Original event IDs/sequences survive retries. Browser/faculty opt-out and expiry cancel pending transport. A revocation/authorization `403` and `403 ingest_budget_exhausted` remain terminal for the descriptor; they never trigger renewal or legacy fallback. Unknown 429 codes also fail closed. Network/503 recovery uses the same bounded Composer retry budget. Gameplay and local CSV remain available.

The server reclassifies a stale minute snapshot within a maximum of three admission attempts, retaining every transactional freshness and quota guard. Repeated transitions return controlled 503 with no partial writes. Lifetime budgets take precedence over minute throttles and return terminal 403; increasing a minute limit cannot repair lifetime exhaustion.

For unexplained 429s, do not force repeated Generate or flush operations. Record server time, Retry-After, submitted event count, relevant capability/build/global/client counters and limits, and whether a boundary was crossed. Keep token values, raw headers and learner data out of evidence. Investigate recurrent rejection below quota even if a bounded retry succeeds. The original Stage 3 incident remains historically unproven; the deterministic defect and its regression evidence are documented separately.


## Production monitoring checklist

At pilot sessions and daily initially, review the following; after any incident or release, check at 5, 15, 30 and 60 minutes. Move to weekly review only after stable evidence.

- [ ] Issuance failures and unexpected loss of successful activation.
- [ ] Turnstile failures: distinguish browser challenge failure from server verification/provider unavailability.
- [ ] 403 authorization/scope failures: check expiry, revocation, build block, tuple and origin without credentials.
- [ ] Unexplained 429: record server time, Retry-After, submitted event count, capability/build/global/client counters, limits and whether a minute boundary occurred. Do not force repeated Generate/flush.
- [ ] 503: distinguish planned pause from bounded admission retry failure, provider outage or D1 failure; check health separately.
- [ ] D1 errors and quota headroom.
- [ ] Accepted event volume and receipt attribution; compare interval deltas.
- [ ] Duplicate count/ratio; duplicates must not inflate accepted counters or refresh run retention. Request/work accounting can still increase.
- [ ] Active capability count (unrevoked/unexpired), and separately unblocked usable count.
- [ ] Physical database size via D1 info. Rehearsed operator thresholds: warn at 100 MiB or 50% logical byte budget; pause new intake for review at 250 MiB or imminent exhaustion. These are manual thresholds, not automatic guards.
- [ ] Daily retention execution at 04:17 UTC and successful outcome; health does not prove the cron ran. Do not execute deletion just to test monitoring.
- [ ] Authenticated live-tail redaction spot check: X-MQ-Ingest-Token must be REDACTED or omitted; review console/exception exposure, record only sanitized counts/status, then close the tail. Never save raw tail payloads, headers, HARs or capability tokens. Persisted-log verification remains a separate open item.

## HTTPS hosts, local files and LMS limits

Telemetry-enabled generated games can submit from supported HTTPS hosts. Arbitrary valid HTTPS origin is transport permission only; a valid build-scoped capability remains authorization. Issuance is only from official Mastery Quests Composer origins.

A telemetry-enabled generated game opened as `file://...` has an opaque/null browser Origin. Production intentionally rejects null origins; remote preflight may return 403. Gameplay and local telemetry CSV remain available. The exact same build, hosted on a supported HTTPS origin with its valid capability, may submit remotely. This is expected security behavior. Restrictive LMS sandbox/CSP or network policies can also prevent remote collection; test the actual student context. No cross-host browser identity continuity or learner identity assurance is provided.

Faculty opt-in is required; browser opt-out, expiry or revocation stops future remote collection. Capability lifetime is 365 days; telemetry retention remains 730 days. Revocation does not delete accepted telemetry. National Engine is outside this rollout and remains its separate known legacy transport exception.

## Git and website auto-deploy

**Pushes to main trigger production website deployment. Treat push-to-main as a production website action.** Avoid pushing unrelated preparation work during a controlled rollout. After an authorized push, verify the resulting Cloudflare website version; when provenance matters, compare the live asset SHA-256 against canonical repository source.

The owner reports that live `build/faculty-build-composer/anonymous-telemetry-source.js` was hash-verified against canonical source after rollout. The release hash was not supplied and is not a permanent invariant. No push or live hash recheck was performed by this documentation closeout.

For active-capability listing, scoped revocation/build block and aggregate receipt SQL, use [CAPABILITY_OPERATOR.md](server/anonymous-telemetry-poc/CAPABILITY_OPERATOR.md). Mutation procedures require a separately authorized operator incident; none ran in this closeout.
