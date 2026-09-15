# Portable telemetry production rollout closeout

**PORTABLE TELEMETRY PRODUCTION ROLLOUT — COMPLETE**

## Evidence and provenance

Production outcomes below are the owner-operated observations supplied with this closeout request, preserved in [owner-production-attestation.md](validation_artifacts/portable_telemetry_production_rollout/owner-production-attestation.md). They are reconciled with canonical source, migration schema and historical implementation/staging/rehearsal reports. This task did not independently repeat production smoke, query D1 or observe current remote deployments. The completion status records owner acceptance of the rollout; it is not a new production test certification. Earlier NO-GO statements remain historically accurate for their stages and are superseded for current operations by the owner’s rollout evidence.

Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`. Branch: `main`. Final existing HEAD: `7f5582e381ca29862890a4f98cae175d595eb8fa`. Working tree was clean at start; documentation changes remain uncommitted. No new commit or push was made. Rollout date: **2026-09-15**, supported by the production-sitekey commit date and the 90-day sunset input; individual hold timestamps were not supplied. Closeout date: 2026-09-15.

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

## HOLD 1 — bounded pause and migration

**PASS — owner evidence.** Owner observed expected intake 503 while health remained 200. Migration 0003 applied successfully; capability, policy and scope-window tables were created and initially empty. telemetry_ingest_batches gained capability_id and admission_valid. Migrations 0001/0002 remained applied.

## HOLD 2 — capability-aware Worker, flags OFF

**PASS — owner evidence.** Owner observed the capability-aware deployment with flags OFF, the exact production beta returning 202 and consistently increasing D1 legacy counts. This was a rollout transition, not the current operating mode.

## HOLD 3 — capability ingest and exact grace

**PASS — owner evidence.** Capability ingest enabled. Arbitrary valid HTTPS capability preflight returned 204; external issuance stayed blocked; malformed capability returned 403; exact grandfathered beta continued 202.

## HOLD 5 — issuance enabled

**PASS — owner evidence.** Dedicated production Turnstile configuration was installed and production issuance enabled. Official Composer activation preflight returned 204; GitHub activation origin returned 403. HOLD 5 intentionally preceded HOLD 4.

## HOLD 4 — public Composer sitekey

**PASS — owner evidence.** Production public sitekey was deployed to Composer. Current reviewed website and rollback versions are recorded below. The live adapter was hash-verified against canonical source by the owner.

## HOLD 6 — owner-operated production smoke

**PASS — owner evidence.** Telemetry-OFF Generate caused no activation traffic. Telemetry-ON Generate successfully issued a capability. The unchanged first fresh production-generated game on GitHub received OPTIONS 204 / POST 202. D1 attributed receipts/events to its exact capability. Browser opt-out stopped subsequent remote requests. A second freshly generated production Composer game hosted on GitHub Pages independently received 204/202. No per-build UUIDs, counts or timestamps beyond those supplied are invented.

## Duplicate, revocation and continuity proof

Owner-observed exact duplicate replay returned HTTP 202, accepted=0, duplicates=1. Run event count and run last_received_at were unchanged. Capability accepted events/bytes, build accepted events/bytes and global accepted events/bytes were unchanged. Submitted-work/request counters are distinct and are not asserted unchanged.

Revocation returned terminal 403 and subsequent remote sends stopped. Gameplay continued and local CSV remained downloadable. Opt-out independently stopped future requests. Final production active capability count was **0** after the smoke sequence. This is a closeout snapshot; later faculty issuance may legitimately increase it.

Live-tail exposed no raw X-MQ-Ingest-Token in the owner’s observed production sample. No raw tail payload, token or secret was retained here. This does not establish persisted-provider-log redaction; that historical access limitation remains open.

## HTTPS hosts, local files and LMS limits

Telemetry-enabled generated games can submit from supported HTTPS hosts. Arbitrary valid HTTPS origin is transport permission only; a valid build-scoped capability remains authorization. Issuance is only from official Mastery Quests Composer origins.

A telemetry-enabled generated game opened as `file://...` has an opaque/null browser Origin. Production intentionally rejects null origins; remote preflight may return 403. Gameplay and local telemetry CSV remain available. The exact same build, hosted on a supported HTTPS origin with its valid capability, may submit remotely. This is expected security behavior. Restrictive LMS sandbox/CSP or network policies can also prevent remote collection; test the actual student context. No cross-host browser identity continuity or learner identity assurance is provided.

Faculty opt-in is required; browser opt-out, expiry or revocation stops future remote collection. Capability lifetime is 365 days; telemetry retention remains 730 days. Revocation does not delete accepted telemetry. National Engine is outside this rollout and remains its separate known legacy transport exception.

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

## Git and website auto-deploy

**Pushes to main trigger production website deployment. Treat push-to-main as a production website action.** Avoid pushing unrelated preparation work during a controlled rollout. After an authorized push, verify the resulting Cloudflare website version; when provenance matters, compare the live asset SHA-256 against canonical repository source.

The owner reports that live `build/faculty-build-composer/anonymous-telemetry-source.js` was hash-verified against canonical source after rollout. The release hash was not supplied and is not a permanent invariant. No push or live hash recheck was performed by this documentation closeout.

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

## Known limitations and deferred work

- Supported HTTPS transport does not promise every host, LMS sandbox, CSP or network works. Local/null-origin rejection is intentional.
- Anonymous telemetry does not assure learner identity or synchronize browser identifiers between hosts. National Engine remains a separate legacy transport exception outside this rollout; this system does not cover every Mastery Quests game.
- Revocation/expiry does not delete accepted telemetry. Existing 730-day retention, measurement/governance/disclosure contracts and fields are unchanged.
- Pilot capacity must be reviewed against actual volume and physical D1 size before expansion. Logical-byte ceilings are not storage-size ceilings.
- The local emulator oversized-response readability limitation and historical unexplained Stage 3 429 remain historical observations; the quota-boundary fix provides separate deterministic regression proof, not a definitive retrospective cause for that incident.
- Define separately authorized bounded expired short-window cleanup; no new maintenance cron is introduced.
- Decide separately whether to retire retained staging Worker/D1/domain/widget; cleanup is not claimed here.
- Obtain persisted-provider-log visibility and verification separately. Live-tail proof covers the observed surface only.
- Schedule the documented sunset reminders, perform sunset verification, and continue pilot monitoring. No automations were created.
- Publish these documentation changes only through a reviewed website release; push-to-main is production deployment.

## Repository evidence reviewed

- [FINAL_REPORT_portable_telemetry_quota_boundary_fix.md](FINAL_REPORT_portable_telemetry_quota_boundary_fix.md)
- [FINAL_REPORT_portable_telemetry_stage1.md](FINAL_REPORT_portable_telemetry_stage1.md)
- [FINAL_REPORT_portable_telemetry_stage2.md](FINAL_REPORT_portable_telemetry_stage2.md)
- [FINAL_REPORT_portable_telemetry_stage2_http_followup.md](FINAL_REPORT_portable_telemetry_stage2_http_followup.md)
- [FINAL_REPORT_portable_telemetry_stage2_redaction.md](FINAL_REPORT_portable_telemetry_stage2_redaction.md)
- [FINAL_REPORT_portable_telemetry_stage2_staging.md](FINAL_REPORT_portable_telemetry_stage2_staging.md)
- [FINAL_REPORT_portable_telemetry_stage3.md](FINAL_REPORT_portable_telemetry_stage3.md)
- [FINAL_REPORT_portable_telemetry_stage3_sitekey_confirmation.md](FINAL_REPORT_portable_telemetry_stage3_sitekey_confirmation.md)
- [FINAL_REPORT_portable_telemetry_stage3_staging.md](FINAL_REPORT_portable_telemetry_stage3_staging.md)
- [FINAL_REPORT_portable_telemetry_stage3_staging_setup.md](FINAL_REPORT_portable_telemetry_stage3_staging_setup.md)
- [FINAL_REPORT_portable_telemetry_stage3_verifier_fix.md](FINAL_REPORT_portable_telemetry_stage3_verifier_fix.md)
- [FINAL_REPORT_portable_telemetry_stage4.md](FINAL_REPORT_portable_telemetry_stage4.md)
- [FINAL_REPORT_portable_telemetry_stage5_rehearsal.md](FINAL_REPORT_portable_telemetry_stage5_rehearsal.md)

Current guidance: [runbook](PRODUCTION_RUNBOOK_portable_telemetry.md), [capability operator](server/anonymous-telemetry-poc/CAPABILITY_OPERATOR.md). Machine-readable closeout: [production.json](validation_artifacts/portable_telemetry_production_rollout/production.json).

## Validation and production protection

See [validation.json](validation_artifacts/portable_telemetry_production_rollout/validation.json) for local documentation/source consistency, schema query verification and credential-pattern scan scope/results. No runtime, measurement field, contract version, quota, retention, migration, Turnstile secret, production flag or CORS change is part of this closeout. Deployments, D1 mutations, capability issuance/revocation, pushes and production requests by this task: **zero**.

## Files changed

Local validation passed: governance renderer consistency, dictionary rendering and all 87 dictionary fields against source, operator SQL against in-memory SQLite, and ten local browser checks across five pages at 390/1440-pixel widths. External browser requests were blocked. The full tracked-text credential scan found one unchanged injected-provider dummy key, recorded separately; no production key or complete raw capability pattern was found. Checker fixture/buffer errors were corrected before the successful run. No production regression suite was rerun.

Files changed or added:

- `PRODUCTION_RUNBOOK_portable_telemetry.md`
- `server/anonymous-telemetry-poc/CAPABILITY_OPERATOR.md`
- `audit_tools/telemetry_governance/render.mjs` (keeps the generated Responsible Telemetry Use page consistent)
- `privacy/index.html`
- `how-to/responsible-telemetry-use/index.html`
- `how-to/composer/index.html`
- `build/index.html`
- `how-to/telemetry-data-dictionary/index.html`
- `FINAL_REPORT_portable_telemetry_production_rollout.md`
- `validation_artifacts/portable_telemetry_production_rollout/owner-production-attestation.md`
- `validation_artifacts/portable_telemetry_production_rollout/production.json`
- `validation_artifacts/portable_telemetry_production_rollout/check.mjs`
- `validation_artifacts/portable_telemetry_production_rollout/validation.json`
- `validation_artifacts/portable_telemetry_production_rollout/browser-check.mjs`
- `validation_artifacts/portable_telemetry_production_rollout/browser.json`

Public documentation edits are local and await publication. The public Faculty Build guide updated here is `build/index.html`; downloadable Word guides and local-only manual template instructions are unchanged. No downloaded game or document binary was regenerated.
