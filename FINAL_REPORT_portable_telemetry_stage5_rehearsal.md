# Stage 5 production rollout rehearsal

**Rehearsal executed. Actual production rollout: NO-GO. Production writes: zero. Production deployment: NOT DEPLOYED.**

The primary blocker is a reproduced minute-boundary 429 below quota. The client treats 429 as terminal, so a legitimate build can stop sending despite having quota available. Fix and revalidate that boundary before production enablement. The exact original Stage 3 incident is not retrospectively proven. Additional release prerequisites are a dedicated production Turnstile widget/sitekey, owner approval of the exact legacy sunset and pilot capacity limits, and reconciliation of the already-published Composer activation UI with the still-legacy backend.

The exact ordered commands, emergency actions and human hold points are in [PRODUCTION_RUNBOOK_portable_telemetry.md](PRODUCTION_RUNBOOK_portable_telemetry.md). Every production mutation there is explicitly marked DO NOT RUN IN THIS REHEARSAL.

## Baseline and production identity

Repository: C:\Users\Jennings\Documents\GitHub\masteryquests-website. Branch main; starting HEAD `52379af7fed54ebc09b27a4f352df2eea0479a9f` (Updated and completed stage 4). Initial tree was clean; accepted Stage 1–4 work was committed. Local origin/main and a live read-only `git ls-remote` both matched HEAD. Local main was not ahead. No push was performed.

| Production resource | Read-only observation |
|---|---|
| Telemetry Worker | masteryquests-anonymous-telemetry-poc |
| Current telemetry version | afaa4ada-d6cf-48a5-bdde-13cc35f52f80 |
| Route | masteryquests.org/api/anonymous-telemetry-poc/* |
| D1 / binding | managerial-telemetry-poc / TELEMETRY_DB |
| D1 UUID | 16b248ff-20cb-429c-a4a1-dd50d17c1fd0 |
| Website Worker / domain | masteryquests-website / masteryquests.org |
| Current website version | edebb0d2-6ecd-4b82-860d-233ed6b4e37d |
| Previous website version | 8681fb11-550a-47dd-bb3e-f6070ab17ca5 |
| Retention cron | 17 4 * * * |
| Retention | 730 days, automatic, mq-governance/2 |
| ALLOWED_ORIGINS | https://masteryquests.org,https://www.masteryquests.org |
| Deployed capability flags | absent, effectively OFF; repository config explicitly false |
| Telemetry secret names | ADMIN_TOKEN, MAINTENANCE_TOKEN |
| Website secret names | CLASSROOM_ACCESS_CODE, CLASSROOM_SESSION_SECRET |

No production TURNSTILE_SECRET_KEY binding exists. Secret values were never requested/read. Observability metadata reports legacy top-level enabled=false, nested logs enabled=true/persist=true/invocation_logs=true/head_sampling_rate=1, and traces disabled. This report preserves that distinction rather than inferring persisted-log availability from one field. The planned config uses explicit logs settings and disables invocation logs; an authenticated redaction spot check remains a launch gate. Website observability was not configured in the returned settings.

The downloaded deployed telemetry bundle has SHA-256 `5aabebc4968360f60bc082bc81149bee87d33c16529d32f79c1aa7927b12f169`, 70,502 bytes, and no capability route/header handling. It was retained only in ignored `.wrangler` workspace storage for local compatibility tests.

**Observed public-site drift:** the current production Composer already references telemetry-activation.js and ingest-activation.js but has no mq-turnstile-sitekey meta. Its backend remains the old Worker. Stage 5 did not cause or change this state. The release must configure the public key only when the production server/provider path is ready; prior claims that none of the activation UI had reached production cannot be used as the current baseline.

## Production D1 aggregates and recovery baseline

Production database size: 4,653,056 bytes (about 4.44 MiB). Tables: `_cf_KV`, `d1_migrations`, `sqlite_sequence`, `telemetry_events`, `telemetry_ingest_batches`, `telemetry_rate_limits`, `telemetry_runs`. Applied migrations: 0001_initial.sql and 0002_completion_semantics.sql only.

| Aggregate | Count |
|---|---:|
| runs | 53 |
| events | 3,427 |
| ingest batches | 1,225 |
| rate-limit rows | 15 |
| synthetic=1 events | 1,223 |
| synthetic=0 events | 2,204 |

Earliest/latest server batch receipts: 2026-09-05 11:17:54 through 2026-09-14 20:51:58. The observed daily event peak was 1,763; the latest populated day had 32. These small historical volumes are not a production adoption forecast. Only aggregates and schema metadata were queried; no learner/event contents were exported.

Read-only Time Travel returned bookmark `00000056-00000000-000050e7-aba7e54f42c29d361c7ab6aaf35ee1a8`. No restore was executed. Refresh the bookmark immediately before migration. Restore is disaster recovery, not ordinary code rollback: it can lose accepted events and resurrect revoked capabilities, remove blocks or rewind quota state. Post-launch recovery requires an explicit authorization-state reconciliation plan.

## Release-critical verification

All 45 required suite/runner entries passed without changing existing assertions:

| Suite | Passed |
|---|---:|
| Stage 1 capabilities | 56/56 |
| Governance | 14/14 |
| Readiness/remediation | 27/27 |
| Scheduled retention | 11/11 |
| Backend integration | 18/18 |
| Client/backend regressions | 21/21 |
| Measurement contract | 16/16 |
| Private refresh | 33/33 |
| Published Managerial/local-only | 103/103 |
| Stage 2 SQLite HTTP | 39/39 |
| Header SQLite / runtime | 8/8 each |
| Stage 3 issuance | 24/24 |
| Stage 3 Composer | 11/11 |
| Stage 3 browser, including pattern hotfix | 17/17 |
| Canonical verifier | 19/19 |
| Composer active runners | 27/27 |
| Stage 4 CORS SQLite / Workers | 24/24 each |

Additional rehearsal checks passed: five migration scenarios, four deployed/proposed compatibility combinations, six pause-route cases plus health/recovery, production-config CORS/grace, and five deployed staging phases. The known local oversized-stream limitation was not reopened or hidden; accepted Stage 4 runtime CORS coverage remains unchanged. `git diff --check` passed.

## Migration 0003 and rollback model

Exact SHA-256: `d67432d1c9ed8c85f5a407cf7e606ff05cc00d63effe2ce909797fa6efb61951`, matching retained Stage 1–4 staging evidence. Ten statements add three tables, five indexes, and two ingest-batch columns. The tables hold build policy, capability hash/control metadata and quota windows. The columns are nullable capability_id and admission_valid default 1 with its guard constraint. The manifest expression index uses CASE/json_valid to protect malformed historical JSON without deleting or rewriting rows.

Local disposable SQLite rehearsals covered empty old schema; 3,427 representative synthetic rows; malformed extras_json; old ingest batches; and 100,000 synthetic rows. All retained counts, extras sizes and receipt ranges, preserved default column behavior and passed integrity_check. Observed migration time was roughly 2–39 ms locally. The 100,000-row fixture grew from 74,833,920 to 75,583,488 bytes. This is an index-cost illustration, not a cloud lock-duration guarantee. No production records were copied, and no remote migration was applied.

DDL/index building requires write serialization and scans affected tables. Recommend a bounded intake pause around migration and verification, avoiding the retention cron. Do not assume zero downtime. If migration succeeds but rollout aborts, leave the additive schema unused. Both the actual deployed old bundle and the proposed all-flags-OFF Worker accepted schema 1/2/3 fixtures before and after migration, with no loss of existing semantics. Older writes omit new columns and receive their defaults. Routine destructive down-migration is unnecessary; it becomes unsafe once capability state exists or code depends on the added schema.

## Worker behavior review

| Area | Proposed behavior relative to deployed legacy Worker |
|---|---|
| Issuance route | New /v1/build-capabilities; exact server flag, bounded request, configured first-party Origin, real Siteverify and immutable build scope; otherwise unavailable |
| Ingest route | Capability-enabled branch uses X-MQ-Ingest-Token, exact scope and transactional admission; flags OFF retains old ingest |
| CORS | Only capability-enabled events transport accepts serialized HTTPS origins; issuance/admin/health do not inherit it |
| Legacy grace | Exact inventoried tuple/origin, enabled flag and finite sunset; no wildcard and no invalid-token fallback |
| Ownership/dedup | Transactional guards, exact event ownership, manifest dependency and receipt attribution; accepted event/byte counters do not inflate on exact duplicates |
| Provider | Canonical redirect:manual with redirected/non-2xx rejection, fixed endpoint and bounded response; no staging verifier patch |
| Errors/redaction | Controlled no-store capability errors; raw credentials do not enter the old logger; token header redaction proven in Stage 4 |
| Flags | Exact string true only; request data cannot change them. OFF preserves legacy behavior, not a global deny switch |
| Quotas | Capability/build/global issuance and ingest windows plus lifetime budgets and existing per-client minute limit |
| Cleanup | Expired quota-window cleanup helper exists but is not scheduled by this rollout; define a bounded operator task later rather than invent a production cron |
| Admin/retention | Existing admin/maintenance authority and 730-day whole-run retention unchanged; no new public capability-control endpoint |

The pause wrapper is a separate reviewed release entry point, not a canonical architecture change. It returns 503 for ingest/issuance before any D1 access, preserves health/admin/scheduled dispatch, and was locally and remotely rehearsed. Production has not received it.

## Flags, exact legacy inventory and release order

Recommended sequence: approved bounded pause → migration → normal capability-aware Worker all false → legacy proof → ingest true/issuance false/exact grace → dedicated production provider setup → issuance true once backend is ready → configured Composer publication → owner 201/202/external smoke → monitoring and acceptance. Issuance precedes configured Composer publication to avoid an unavailable backend; fail-closed activation still protects unfinished setup. HOLD 5 therefore intentionally precedes HOLD 4. The six human hold points and commands are detailed in the runbook.

Only this currently published, byte-identical, collection-enabled beta is proposed for grace:

| Field | Value |
|---|---|
| game_id | faculty-composer |
| build_id | composer-ede71cd5d8134f4b3997592ae992e19f5014d27d17d6c5a626232fc5ef9c4a8a |
| build_version | 296544b1222894d84c67298257964b1bfa4808212cad18c5e6e0fd4c1cafd09f |
| schema | 3 |
| allowed origin | https://masteryquests.org |
| reason | Preserve the explicitly enabled existing Composer beta during transition |
| proposed sunset | Exactly 90×86,400 seconds after the owner-approved UTC capability rollout instant |

No active course calendar evidence warrants a longer period. The owner must approve the exact instant and notify affected operators before activation, with reminders at 30 and seven days before sunset. Any extension requires separate bounded approval. Local gameplay survives sunset. Private Managerial artifacts remain excluded under accepted collection-disabled evidence; arbitrary Composer builds, all first-party traffic, public polished games and National Engine are not grandfathered.

## Turnstile, Composer and dist

Recommend a dedicated Managed **Mastery Quests Composer Production** widget for masteryquests.org, separate from **Mastery Quests Composer Staging**. The server explicitly accepts apex/www activation and verifies mq_build_activate/cData. The owner creates the widget and installs its secret using Wrangler's secure interactive prompt in the subsequent authorized task. Stage 5 did not create a widget, read a secret value, or reuse/reconfigure the staging widget.

Production public configuration requires only the dedicated public sitekey meta and the existing production activation/ingest path. Generated games contain the build capability, approved endpoint and ID/scope/expiry, not provider secrets. The canonical source is ready for a public key but none was invented or inserted in this rehearsal.

Controlled dist rebuilt: ok=true, 1,793 files, 151 Concept Review PDFs, forbiddenFileCount=0, incomingQuestionAssetCount=0. Required activation/measurement/Composer modules are present. The text scan found no staging endpoint/sitekey, live capability pattern or TURNSTILE_SECRET_KEY reference. Production telemetry, website and pause-entry Wrangler dry runs all succeeded; none deployed. The current local dist is not yet a configured production activation release because the dedicated production sitekey is missing.

## Quotas, capacity and the 429 blocker

Do not promote the provisional 2 GiB accepted-byte budget into an unverified Free-tier database. Current official limits are 500 MB/database on Free and 10 GB on Workers Paid; Time Travel is seven/30 days respectively. The account's Workers tier was not established by project evidence, so the plan conservatively assumes Free until the owner verifies it. [Cloudflare D1 limits](https://developers.cloudflare.com/d1/platform/limits/)

Proposed tightly bounded pilot values, subject to owner approval, are generated by stage5-release-config.mjs:

| Limit | Proposed |
|---|---:|
| live capabilities per tuple | 3 |
| issues per build/day; global/hour; global/day | 5; 10; 25 |
| capability requests/minute; events/minute | 600; 6,000 |
| build events/minute | 12,000 |
| global requests/minute; events/minute | 1,200; 24,000 |
| capability accepted events / bytes | 50,000 / 16 MiB |
| build accepted events / bytes | 100,000 / 32 MiB |
| global accepted bytes | 64 MiB |
| existing per-client events/minute | 300, unchanged |

These are pilot ceilings, not a class-capacity promise. Begin with at most one roughly 30-person owner-approved class-equivalent load, review measured batching/event rates, and obtain a paid-plan/adoption budget decision before expansion. Server budgets count accepted logical bytes, not physical D1 size; they are not a replacement for size monitoring. Lifetime counters are intentionally not reset by retention.

The old production sample is about 1.36 KiB total database storage per event including other tables and indexes; that is not a pure row-size measurement. Stage 4 non-manifest extras average roughly 0.94–1.20 KB, and manifest extras roughly 4.12 KB. The tiny staging DB includes substantial fixed schema overhead. Use a rough **2–4 KiB/event physical planning range**, with manifest/run/receipt overhead and batching variability. A 200-event run is about 0.4–0.8 MiB; 30 learners make about 12–24 MiB/session. One hundred such sessions/year is roughly 1.2–2.4 GiB; 730-day retention can approximately double accumulated volume. Actual adoption was not supplied, so this is a scenario, not a forecast.

Warn at 100 MiB physical D1 or 50% of the logical byte budget consumed; pause new intake at 250 MiB physical D1 or projected imminent exhaustion pending operator review. The physical threshold is an operator action, not an implemented automatic size guard. Check at each pilot session and daily initially, then weekly only after stable evidence. Keep 730-day retention unchanged.

The new deterministic clock fixture samples the prior minute while subsequent SQL guards see the next minute. It returns 429 with empty/below-limit counters and no writes; a normal-clock control returns 202. The first draft fixture also moved time before a just-issued capability and correctly returned 403; using a capability valid before the boundary isolated the intended guard behavior. This identifies a plausible mechanism for Stage 3, not proof of its original timing. Fix stale-window handling with bounded safe re-evaluation and regression coverage before launch. Also inspect the existing per-client minute counter, which can reject independently of capability/build/global counters.

## Monitoring, kill switches and rollback

Watch issuance 201/failures, provider failures, authorization/scope failures, 429/503, D1 errors, accepted events, duplicate ratio, quota headroom, D1 size, retention execution and revocations. At any unexplained 429, stop automatic retries after at most one bounded retry and record server time, window boundaries, submitted event count, all relevant counters/limits and Retry-After without capability values. Confirm expected redaction on live tail; no learner-identifying application logs or Origin/referrer measurement fields are added.

Issuance abuse/provider outage: deploy issuance-off config, retaining valid capability ingest. Ingest/cost/D1 incident: deploy the deny-ingest pause entry, not ingest=false. One compromised capability/build: scoped authenticated D1 operator revoke/block, preserving accepted data. Bad Composer release: website-only rollback; capability records remain intact. Recovery follows diagnosis and owner approval, with a new reviewed build/activation where compromise occurred.

Rollback has two eras. Before production capabilities exist, the current old Worker may be restored while additive schema remains. After capabilities exist, restore only a capability-aware enforcing configuration or keep intake paused. The old unauthenticated Worker is unsafe then. Website rollback is independent of D1; database Time Travel is a separately approved disaster action with authorization reconciliation. No restore occurred.

## Staging rehearsal and cleanliness

The retained Stage 3 Worker/D1/domain were used; production was not substituted. Five phases passed: all flags OFF, ingest-only, issuance-ready, deny-ingest pause, and restore. Existing Composer assets/config source were preserved. Brief endpoint propagation differences were observed immediately after deployment (old preflight 204 after flags-off, and old activation 400 after pause); bounded per-route checks observed the required new behavior without changing assertions. Production hold points must likewise verify more than one route after propagation.

Final staging version: `b1e4dcd3-9ce7-40e0-a29f-ba9c236d861c`. Ingest/issuance true; legacy grace false. Five capabilities total, zero active; zero tails; 98 events unchanged; zero new capabilities or events in this rehearsal. The real manual 201/external 202 and revocation proof remains the accepted Stage 3/4 evidence; Stage 5 did not repeat Turnstile or mint unnecessary capabilities.

All retained records derive from owner/harness testing, not students. **All 98 have runtime synthetic=0**; contextual test provenance must not be confused with that field. They were not relabeled or deleted to manufacture a synthetic-flag result. A generic synthetic=1 cleanup would not remove them. Retain clearly identified isolated staging until production smoke passes; do not copy these records into production. The existing staging secret binding stayed staging-only and its value was never read.

## Documentation drafts for the launch task

Do not publish these updates during rehearsal. Add factual launch wording to Privacy, Responsible Telemetry Use, Composer/faculty Build guides and the dictionary control-plane note:

> Telemetry-enabled generated games can submit from supported HTTPS hosts. Faculty explicitly opt in when generating a build. Activation authorizes that build for 365 days; it does not identify a learner. Browser opt-out, authorization expiry or revocation stops future remote collection while local gameplay and downloads remain available. Some LMS sandbox/CSP configurations, including null-origin contexts, prevent remote requests.

Explain separately that capability hashes, scope and expiry/revocation metadata are authorization controls, not new learner measurement fields, and that 730-day retention is independent of authorization lifetime. Avoid “host anywhere” and do not claim identity assurance or cross-host browser identity continuity. No policy/contract version bump is justified by this control-plane release alone. The internal CAPABILITY_OPERATOR.md also contains pre-Stage-4 first-party-only wording and should be updated at release.

National Engine remains a separate legacy identifying-transport exception outside this anonymous D1 path. Do not claim every public game is local-only and do not include its cleanup in this rollout.

## Deliverables and decision

No canonical application source, public Composer, production config, migration or public polished game was changed. Added Stage 5 audit/rehearsal helpers, this report, the blocked production runbook and sanitized evidence; retained staging resource bookkeeping records its restored version. Machine-readable equivalents: `validation_artifacts/portable_telemetry_stage5_rehearsal/rehearsal.json`.

**NO-GO for actual production enablement now.** Resolve the reproduced 429 boundary behavior; verify provider/key setup, exact approved sunset, account tier and bounded pilot budget; refresh production versions/bookmark; then obtain explicit human GO at every runbook hold. Stage 4 success and this rehearsal do not authorize production mutation.
