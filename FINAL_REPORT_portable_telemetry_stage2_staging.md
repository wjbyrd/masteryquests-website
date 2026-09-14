# Portable telemetry Stage 2 deployed staging gate

**Deployed HTTP validation: PASS, 300/300 ordinary oversized trials. Overall Stage 2: NOT COMPLETE. Stage 3: NO-GO. Production: NOT DEPLOYED / UNCHANGED.**

The real deployed Worker consistently delivered readable controlled 413 responses in the recorded Node and Edge matrix. This demonstrates a difference from the local emulator for these tested paths. However, authenticated Cloudflare live-tail request metadata contained the synthetic capability header. Application console logs did not contain it. The requested strict log/redaction criterion therefore fails, and this task does not recommend advancing to Stage 3.

Both temporary remote resources were deleted and verified absent after evidence capture. No production telemetry data or resources were accessed or changed.

## Baseline and deployment identity

Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`.
Branch: `main`. Starting HEAD: `a248c116c66ab509686e9234b8d343c93c12ef1e`.

Captured status, branch, HEAD and starting SHA-256 hashes in `validation_artifacts/portable_telemetry_stage2_staging/baseline/source.json`. The complete Stage 2 and HTTP-follow-up reports were read before changes. All accepted uncommitted work was preserved.

| Resource | Value |
| --- | --- |
| Temporary Worker | `masteryquests-telemetry-http-staging` |
| Deployed version | `9798f3db-7ed9-4bbc-b53b-5d6c6f97da1d` |
| Test endpoint | `https://masteryquests-telemetry-http-staging.wjbyrd.workers.dev/v1/events` |
| Temporary D1 name | `masteryquests-telemetry-http-staging` |
| Temporary D1 UUID | `4dc4825c-a83c-4216-8185-c0096d694f2a` |
| Compatibility date | `2026-08-07` |
| Deployment CLI | Cached Wrangler `4.131.0` |
| Remote resource status | Worker and D1 deleted; API absence verified |

The standalone configuration had no custom production route, no cron and only the new D1 binding. The API helper permitted only the named staging Worker, its tails and the newly created D1 UUID; it explicitly rejected the production D1 UUID. The production Worker was never deployed, replaced or reconfigured. The production database was never queried, exported, migrated or mutated.

Unchanged migrations `0001_initial.sql`, `0002_completion_semantics.sql` and `0003_build_ingest_capabilities.sql` were applied through the D1 API only to the new staging database. Their exact hashes are recorded in `resources.json`. Migration 0003 was not applied to production.

## Canonical behavior and flags

The temporary entry point exposed only POST/OPTIONS `/v1/events`, importing the existing `dualModeIngest` and `capabilityPreflight` functions. All other routes returned 404, including admin, export, retention and issuance paths. The wrapper added only a fixed status-only console record after the canonical response. It did not alter the response body, encoding, headers, body reader or transaction machinery.

| Flag | Staging | Production repository configuration |
| --- | --- | --- |
| CAPABILITY_ISSUANCE_ENABLED | false | false, unchanged |
| CAPABILITY_INGEST_ENABLED | true | false, unchanged |
| CAPABILITY_LEGACY_GRACE_ENABLED | false | false, unchanged |

No issuance endpoint or real challenge provider was installed. Canonical `generateCapability` and `hashCapability` helpers created random synthetic fixture credentials in test memory; only their hashes and synthetic scope metadata were inserted into staging D1. No raw credential was written to repository files, evidence or deployment bindings. ADMIN_TOKEN, MAINTENANCE_TOKEN and production secrets were absent from staging.

The single allowed origin was `https://masteryquests.org`. Headless Edge loaded a document fulfilled in memory at that origin, then used actual HTTPS requests to the deployed staging endpoint with normal browser CORS. Other network destinations were blocked in the browser context. No beta/public page was created or modified. Production CORS was not broadened, and no wildcard, arbitrary HTTPS origin, null Origin or credentialed CORS was enabled.

The accepted reader remained byte-identical: **131,072 actual bytes**, early rejection for larger declared Content-Length, streamed byte counting when length is absent or misleading, cancellation on the first excess chunk, and no unbounded buffering or draining. No identity-encoding or drain workaround from the previous investigation was deployed.

## Matrix and results

The final complete run contains **320 ordinary trials** plus **five special upload trials**. Ordinary oversized cases had **10 repetitions per client/framing/encoding/size condition**.

| Client | Ordinary trials | Oversized trials | Readable controlled oversized 413 |
| --- | ---: | ---: | ---: |
| Node HTTPS/HTTP client | 128 | 120 | 120/120 |
| undici/fetch | 128 | 120 | 120/120 |
| Headless Microsoft Edge | 64 | 60 | 60/60 |
| Total | 320 | 300 | **300/300** |

Each client covered 100, 131,072, 131,073, 524,288 and 2,097,152 bytes, with ASCII and multibyte UTF-8 content. Node clients covered declared Content-Length and chunked/no-length framing. Edge used browser-managed framing; browsers do not expose a freely writable Content-Length header.

The 100-byte cases were small invalid-envelope controls, returning readable 400 with no writes. The exact 128 KiB cases contained valid scoped events padded with whitespace and returned 202. Oversized cases padded otherwise valid event JSON to the exact byte sizes. Multibyte cases used UTF-8 byte length, not JavaScript string length.

All 300 ordinary oversized responses satisfied status 413, readable JSON error `request_too_large`, JSON Content-Type and no-store. Node response headers and all 60 Edge network-observed 413 header sets also satisfied the exact first-party ACAO, `Vary: Origin` and absence of Access-Control-Allow-Credentials. Browser JavaScript response observations and network header observations are recorded separately. No browser page exception was observed.

The unchanged canonical response retains its established envelope:

```json
{"ok":false,"phase":"phaseAnonymousTelemetryPOC-v1","error":"request_too_large"}
```

There were zero observed delivery failures in this matrix. This is a finite sample, not a universal reliability claim or a deployment of the production telemetry service.

## Slow upload and malformed transport

A controlled slow chunked upload supplied at most 2 MiB in 4 KiB chunks, with a 10 ms pacing interval and a hard 10-second deadline. It returned a readable canonical 413 in approximately **8,581 ms**, with unchanged D1 state and a successful valid request afterward. This was a bounded fixture, not an indefinite denial-of-service test.

Application boundedness is supported by the unchanged canonical code, a fresh **9/9** bounded-reader check, and the deployed slow-upload outcome. The reader retains at most the configured byte ceiling before bounded concatenation/decoding, and does not accumulate the first excess chunk. No deployed heap profile was collected; no platform-wide memory or universal server-timeout claim is made.

| Malformed case | Observed outcome | Accepted state |
| --- | --- | --- |
| Node false-small Content-Length | HTTP 400 | Unchanged |
| Node false-large Content-Length | Controlled client timeout, approximately 10,012 ms | Unchanged |
| undici false-small Content-Length | Transport rejection | Unchanged |
| undici false-large Content-Length | Transport rejection | Unchanged |

The exact undici exception names are recorded but were not acceptance conditions. Every malformed case was followed by a successful valid request. A malformed transport frame was not required to expose a Worker application response.

## D1 no-write and health proofs

Deterministic snapshots were captured before and after **40 rejected ordinary groups**: 30 oversized groups and 10 small-invalid controls. All were equal. The five special cases also had equal before/after snapshots. The comparison included complete rows of:

- telemetry_events, telemetry_runs and telemetry_ingest_batches;
- telemetry_rate_limits;
- telemetry_build_policies and telemetry_build_capabilities, including accepted counters;
- telemetry_scope_windows, including accepted and lifetime accounting.

No attempted-work counter exception was used: these rejection snapshots were fully unchanged.

There were **56 successful valid-request health checks** in the final run. Each required HTTP 202, accepted=1, the expected event row and the exact synthetic capability attribution on its receipt. A final independent SQL consistency check confirmed **84 events, 84 runs, 84 receipts, 84 summarized events, 84 receipt-inserted events, 84 capability accepted events and 84 build accepted events**, with zero unattributed receipts.

An initial partial run was restarted to fix binary-frame decoding in the log collector. It left 18 accepted synthetic events in the isolated database. Those rows were preserved and included in later snapshots. The final complete run added 66 accepted events: 10 exact-boundary cases and 56 health checks. The initial database was empty; the main complete-run before/after counts were:

| Table | Before complete run | After complete run |
| --- | ---: | ---: |
| telemetry_events | 18 | 84 |
| telemetry_runs | 18 | 84 |
| telemetry_ingest_batches | 18 | 84 |
| telemetry_rate_limits | 18 | 84 |
| telemetry_build_policies | 1 | 2 |
| telemetry_build_capabilities | 1 | 2 |
| telemetry_scope_windows | 10 | 24 |

All rows belonged to this task's synthetic fixtures. Entire-database deletion subsequently removed them; no production cleanup tool or token was used.

## Log/redaction failure

The collector inspected **302 live-tail events**, of which **301 frames contained the final run's synthetic credential** in request metadata. Console/exception payloads had **zero credential matches and zero exceptions** in the inspected sample. A separate non-admitting marker probe identified the exact location:

```text
event.request.headers.x-mq-ingest-capability
```

Sensitive values were examined only in process memory. Evidence retains counts, field paths and status-only console logs, not raw headers, capabilities or capability hashes. The probe's unknown credential returned 403. It ran alongside the matrix and was not used as a standalone snapshot proof.

This was an authenticated provider live-tail metadata exposure; no public exposure was observed. Nevertheless, it fails the task's strict requirement that staging logs contain no raw capability. Disabling invocation-log persistence did not prevent the live-tail metadata observation. Persisted provider log metadata was not separately audited, and the tail sample was not a complete transcript of every request. A narrower “application console logs are clean” result is not presented as a full redaction pass. Cloudflare's [tail event documentation](https://developers.cloudflare.com/workers/observability/logs/tail-workers/) also describes request metadata, including headers, separately from console logs.

The temporary credentials can no longer authorize ingestion: both the staging Worker and its database were deleted. Canonical behavior was not changed to hide this finding. A separately authorized follow-up must resolve the provider-metadata handling requirement before this strict gate can pass.

## Local versus deployed

| Observation | Local follow-up evidence | Deployed staging, final matrix |
| --- | --- | --- |
| Ordinary oversized sample | 54 real-Worker cases | 300 cases |
| Node/undici status | 413 observed in 36/36 | 413 in 240/240 Node cases |
| Node/undici readable bodies | 15/36 | 240/240 |
| Edge status/headers observed | 6/18 | 60/60 |
| Edge readable bodies | 2/18 | 60/60 |
| Browser failure | Some Failed to fetch/reset outcomes | None in ordinary matrix |
| Rejected accepted-state mutation | None observed | None observed |

For the HTTP-runtime question, outcome **A** is demonstrated for the tested matrix: staging passes while the local emulator fails with unchanged canonical logic. For the entire requested acceptance gate, the result is **mixed / NO-GO** because redaction fails. Local assertions were preserved rather than reclassified or relaxed based on staging success.

## Cleanup

Deleted Worker `masteryquests-telemetry-http-staging` and confirmed API not-found on **2026-09-14 at 19:33:18 UTC**. Deleted D1 `4dc4825c-a83c-4216-8185-c0096d694f2a` and confirmed not-found at **19:33:19 UTC**. Tail sessions were closed. No custom zone route existed.

The temporary local deployment configuration was removed after preserving its exact contents as `wrangler.deployed.json` in the evidence directory. No active staging configuration or remote database was retained. The cleanup identity guards excluded production resources. Exact cleanup output is in `cleanup.log` and `resources.json`.

After complete evidence and remote cleanup, lingering native transport handles required stopping the local matrix and log-probe processes. Explicit exits after awaited teardown were added to the new harnesses and syntax-checked; they return failure when the strict metadata-redaction gate fails. This lifecycle-only change did not alter or rerun the deployed HTTP behavior. The incomplete first collector attempt is retained separately and is not counted in the final 300-trial result.

## Post-staging regressions and files

| Suite | Result |
| --- | --- |
| Stage 2 SQLite HTTP | 39/39 PASS |
| Stage 2 local workerd HTTP | 37/39; same two readable-response failures |
| Canonical bounded reader | 9/9 PASS |
| Stage 1 capabilities | 56/56 PASS |
| Governance | 14/14 PASS |
| Readiness/remediation | 27/27 PASS |
| Scheduled retention | 11/11 PASS |
| Backend integration | 18/18 PASS |
| Client/backend regressions | 21/21 PASS |
| Measurement contract | 16/16 PASS |
| Private refresh | 33 cases PASS |
| Published Managerial/local-only | 103/103 PASS |
| git diff --check | PASS |

The local suites ran after deployed testing, with isolated evidence and external-network blocking. Readiness used starting hashes for its preflight. No existing assertion was weakened.

SHA-256 comparison covered **11,077 pre-existing files: zero changed, zero missing**. Accepted implementation source, production configuration, Composer, telemetry clients, beta HTML, public games, National Engine, public docs, telemetry contracts, retention, migration 0003 and prior reports/evidence remained byte-identical.

New source files only:

- `audit_tools/telemetry_governance/staging/worker.mjs`
- `audit_tools/telemetry_governance/staging/control.mjs`
- `audit_tools/telemetry_governance/staging/setup.mjs`
- `audit_tools/telemetry_governance/staging/test.mjs`
- `audit_tools/telemetry_governance/staging/log-probe.mjs`
- `audit_tools/telemetry_governance/staging/cleanup.mjs`

Reporting consists of this file and `validation_artifacts/portable_telemetry_stage2_staging/`, including the required `staging.json`, source baseline, archived deployed configuration, matrix records, local regression runner/results, row/accounting proofs and cleanup records.

**Stage 2 remains NOT COMPLETE / Stage 3 NO-GO because the strict credential-log criterion failed. No Stage 3 work was performed. Production deployment status: NOT DEPLOYED / UNCHANGED.**
