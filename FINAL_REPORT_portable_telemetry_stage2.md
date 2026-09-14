# Portable telemetry capabilities — Stage 2 local integration report

**Stage 2 is NOT COMPLETE. Stage 3 recommendation: NO-GO. NOT DEPLOYED.**

Implementation stopped at the requested local-runtime verification gate. The shared transactional paths, no-fallback rule and existing regressions pass, but actual local HTTP cannot yet prove reliable readable error responses for oversized uploads. The required runtime suite remains 36/39, with three failures retained. No security assertion was relaxed to declare success.

## Baseline and preserved work

Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`.
Branch: `main`.
Starting HEAD: `a248c116c66ab509686e9234b8d343c93c12ef1e`.

The initial working tree contained accepted, uncommitted Stage 1 implementation/tests/evidence and the accepted LMS wording synchronization. Nothing was reset or discarded. The design report, Stage 1 report/machine-readable artifact and wording-sync report were reviewed. Initial status and SHA-256 hashes of 10,673 pre-existing files are in `validation_artifacts/portable_telemetry_stage2/baseline/source.json`.

Before integration, the focused Stage 1 suite passed 56/56, governance 14/14, readiness 27/27, scheduled retention 11/11, backend integration 18/18, client/backend regressions 21/21 and measurement contract 16/16. Stage 2 implementation began only after these prerequisite results were green.

## Exact implementation changes

Modified relative to this task's starting working tree:

- `server/anonymous-telemetry-poc/worker.mjs`: feature-gated dual-mode POST routing and route-scoped enabled-mode preflight handling.
- `server/anonymous-telemetry-poc/capability-admission.mjs`: common transactional persistence for capability and exact legacy-grace authority; early capability lookup; HTTP-oriented validation classification.
- `server/anonymous-telemetry-poc/wrangler.jsonc`: added only `CAPABILITY_LEGACY_GRACE_ENABLED: "false"` to the accepted Stage 1 configuration.

New server modules:

- `server/anonymous-telemetry-poc/dual-mode-ingest.mjs`: bounded HTTP error mapping, no-store and first-party ingest CORS.
- `server/anonymous-telemetry-poc/legacy-builds.mjs`: exact Composer beta candidate with pending production sunset.
- `server/anonymous-telemetry-poc/legacy-grace.mjs`: strict server-owned inventory validation, tuple/origin/sunset matching and SQL permission guard.
- `server/anonymous-telemetry-poc/scope-window-cleanup.mjs`: bounded expired short-window cleanup, with no production invocation or schedule.

New local test tools:

- `audit_tools/telemetry_governance/capability-http-fixture.mjs`
- `audit_tools/telemetry_governance/capability-http-check.mjs`
- `audit_tools/telemetry_governance/capability-runtime-diagnostic.mjs`

Reporting/evidence: this report and `validation_artifacts/portable_telemetry_stage2/`, including `stage2.json`, baseline/final regressions, HTTP suites, transport diagnostics, source verification and local performance samples.

The source hash comparison found only the three expected pre-existing files changed. Stage 1's token helper, migration 0003, focused test assertions and prior evidence remain byte-identical. The wording renderer and public Responsible Telemetry Use page remain unchanged. The internal operation/rollback notes below document the current stopped state; public faculty documentation was not updated.

## Flags and routing

All committed/default configuration remains OFF:

```text
CAPABILITY_ISSUANCE_ENABLED = "false"
CAPABILITY_INGEST_ENABLED = "false"
CAPABILITY_LEGACY_GRACE_ENABLED = "false"
```

Only the exact server-owned string `"true"` enables a flag. Missing, malformed, boolean/numeric and request-supplied values cannot enable a server mode.

| Mode | Actual Worker POST behavior |
| --- | --- |
| Ingest flag OFF | Original legacy-compatible ingest path, including original schema 1/2/3 and originless behavior. |
| Ingest ON; capability header present | Capability path exclusively, including empty, malformed or invalid values. |
| Ingest ON; header absent; grace OFF | 403 ingest_not_authorized. |
| Ingest ON; header absent; grace ON | Exact validated server inventory, Origin and sunset required; shared safe persistence. |

The Worker delegates to canonical modules; it does not reproduce ownership or SQL admission logic. No HTTP issuance route was opened, and no challenge verifier, Turnstile key or Composer activation was added. A capability cannot be minted through HTTP.

Authority is carried only in `X-MQ-Ingest-Capability`, using the Stage 1 canonical opaque-token syntax. Empty, comma-combined, malformed, unknown, expired, revoked, blocked and scope-mismatched credentials do not fall back to legacy. Operator capability UUIDs, Authorization, cookies, request JSON and query strings are not substitutes. Actual loopback HTTP confirms that an empty header reaches workerd and is rejected rather than grandfathered.

## Exact legacy inventory and sunset

The only inventoried candidate is:

```text
game_id: faculty-composer
build_id: composer-ede71cd5d8134f4b3997592ae992e19f5014d27d17d6c5a626232fc5ef9c4a8a
build_version: 296544b1222894d84c67298257964b1bfa4808212cad18c5e6e0fd4c1cafd09f
schema_version: 3
allowed_origin: https://masteryquests.org
sunset_at: null — PENDING OWNER ACTIVATION, never unlimited grace
```

Source: `beta-testing/composer-telemetry-live-test/index.html`. Its SHA-256 is `6931b46906b8f1a047a0bc0890f70422702269ec4adb514c36f107a1fc7f0bb5`.

The fixture extracts the artifact's maintained configuration, question-pool declarations and embedded measurement registry, then invokes its existing measurement helper through an inert getter to recompute the immutable build revision. It verifies the exact tuple and the artifact's collection-enabled setting. It does not boot the artifact against a remote endpoint or change any artifact bytes. The selected apex origin matches this repository-hosted beta's intended first-party location and the existing Worker allowlist. No other origin is inferred as grandfathering authority.

All eight checked-in private Managerial POC/classroom game pages were inspected and are explicitly collection-disabled. They were not inventoried: there is no evidence in those artifacts that they require transmitting grace traffic. Public polished games and National Engine are excluded. No capability was issued or seeded for the beta tuple; beta tests use only capability-less grace.

Active inventory validation rejects null/missing/invalid sunset, wildcard or malformed tuples, duplicate tuple/origin records, unsupported schemas/families and unapproved origins. It fails the entire inventory instead of skipping bad rows. An isolated server fixture can supply a validated JSON inventory through `CAPABILITY_LEGACY_INVENTORY`; request data cannot set that binding. The committed candidate's pending sunset prevents activation even if someone turns on grace without completing owner configuration.

Fixtures use generated synthetic future/past timestamps. No real production grace date was selected. Admission requires database time strictly before sunset, and SQL rechecks the cutoff inside the transaction. Missing Origin, wrong Origin, unknown tuple, expired entry and spoofed adapter fields reject. Build blocking is also enforced for grace.

## Shared transaction, ownership and attribution

Capability and grace modes now share the accepted Stage 1 guard/constraint persistence pipeline. The authority-specific predicate is either the capability's active hash/tuple policy or the legacy entry's finite sunset and unblocked build policy. Both use the same immutable owner, event-snapshot, absent-ID/sequence, manifest, quota, receipt and aggregation machinery.

Both modes enforce run UUID, anonymous client UUID, game, build and revision ownership against summaries and stored events, with schema 3 for these new paths. Mixed/corrupt or orphaned/inflated histories reject rather than being rewritten. Global event borrowing, changed payload under the same event ID and a different event occupying a run/sequence return conflict.

Exact duplicates compare all normalized stored payload fields, with canonical extras comparison. They acknowledge existing event IDs with accepted=0, do not increment run or accepted-event/byte counters and do not refresh event/run retention receipts. Submitted-work counters still charge retries.

Only guarded novel INSERTs are followed by aggregation. CHECK failures abort the batch, including events, summaries, receipt, client limiter and scope/cumulative counters. There is no in-memory mutex or application-level BEGIN with network round trips. Local SQL failures at event insertion, run update, capability/build counters, receipts and window writes leave snapshots unchanged for both authority modes.

Capability receipts contain the operator capability UUID. Grace receipts contain NULL capability attribution and do not create capabilities. Grace uses the existing client limiter plus build/global windows and cumulative budgets; build policy creation occurs atomically with its first accepted receipt.

## HTTP mapping and CORS

The new HTTP module returns the existing 202 acknowledgment shape only after commit. Intended bounded mappings are:

| Status | Error category |
| --- | --- |
| 400 | invalid_batch / invalid_json / invalid_request |
| 403 | ingest_not_authorized or ingest_scope_mismatch |
| 409 | event_conflict or manifest_required |
| 413 | request_too_large |
| 415 | unsupported_media_type |
| 429 | ingest_rate_limited, with Retry-After: 60 |
| 503 | ingest_unavailable |

New dual-mode responses use Cache-Control: no-store. Only known internal error codes reach responses; arbitrary storage exceptions become fixed 503 categories and bypass the old raw-error logger. Raw tokens/hashes/operator credentials are not logged or persisted in telemetry, receipts, CSV or test evidence. The suite deliberately injects a database exception containing a synthetic raw capability and verifies redaction.

Allowed origins were not broadened: only configured apex/www first-party origins are eligible. Enabled `/v1/events` preflight advertises content-type, x-telemetry-phase and x-mq-ingest-capability. It varies by Origin and preflight request method/headers. Actual controlled errors carry first-party CORS and Vary: Origin; Retry-After is exposed; Access-Control-Allow-Credentials is never added. Admin and activation preflight remain closed in enabled dual-mode. Flags-OFF CORS behavior remains on the original route. Unsupported HTTPS hosts, null Origin and localhost origins receive no permission.

**Limitation:** application-level 413 mapping exists, but actual local HTTP sometimes resets the response body. Therefore reliable readable 413/error-CORS behavior is not yet proven end-to-end; this is a failed acceptance requirement, not a successful capability release.

## Local Cloudflare-runtime evidence and stop reason

The available cached runtime is Miniflare `5.20260910.0-alpha`, powered by workerd `1.20260910.1`. No package was downloaded. Tests disable runtime telemetry, block Worker outbound networking, block Node external networking and use disposable local D1 without the production database ID. The final direct-HTTP run uses the actual committed compatibility date `2026-08-07`.

A preliminary local D1 probe confirmed named CHECK recognition and rollback. Initial suite execution through Miniflare's convenience `dispatchFetch` helper exposed an empty-header discrepancy: that helper stripped empty values before the Worker received them. A minimal echo Worker proved the helper lost the header while direct loopback HTTP preserved it. The harness was changed to actual loopback HTTP with the no-fallback assertion unchanged. The resulting no-fallback tests pass, including empty-header rejection. This was a test-transport defect; no authorization rule was relaxed.

Actual loopback HTTP then exposed a separate issue with early rejection of oversized uploads. A minimal Worker that only returns `Response.json({error:"request_too_large"}, {status:413})`, without telemetry code or D1, reproduced truncated/reset response bodies. The saved bounded diagnostic contains a readable small request and ten 131,073-byte requests: one readable 413 body and nine `terminated` / `ECONNRESET` bodies despite 413 headers. This behavior is intermittent and is not attributed to a proven production Cloudflare defect.

The final HTTP suite has three retained failures:

1. Controlled-error CORS/no-store test: response-body termination during an oversized rejection.
2. UTF-8/body-boundary test: response-body termination during an oversized rejection.
3. Misleading Content-Length: actual HTTP rejects through `UND_ERR_SOCKET`, while the fixture expected the convenience transport's `UND_ERR_REQ_CONTENT_LENGTH_MISMATCH`. This mismatch is a test-transport classification issue; it is not evidence of oversized admission. It remains failing rather than being silently changed after the stop.

The lifetime-cleanup comparison in the first exploratory runtime run initially compared a D1 response envelope to a row array. It was corrected to compare stored rows on both sides. The cleanup invariant passes in the final run. Exploratory results are retained separately; only the direct-HTTP result is treated as the final runtime result.

Implementation stopped when the real HTTP response-boundary failure was confirmed. No change to admission/body limits and no switch back to `dispatchFetch` was used to conceal it. The local runtime suite must become green with equivalent or stronger assertions before declaring Stage 2 complete.

## Local concurrency and scale

SQLite HTTP tests pass 39/39. Final Miniflare/direct-HTTP tests pass 36/39. Their passing cases include capability/grace exact retries; both modes' identical, sequence-conflict and owner-conflict concurrent first writers; different-build capability writers; revocation, block and expiry between read and transaction; quota exhaustion; full rollback at every dependent SQL stage; inventory rejection; capability/operator separation; and redaction.

Deterministic pre-batch barriers are provided only by test wrappers. Runtime requests share one disposable local D1 per fixture and execute actual D1 batches. There is no production hook or request field that enables these barriers. These are local concurrency observations, not multi-region or production multi-isolate proof.

Final local samples below include test-wrapper instrumentation and host load. Prepared statements count all `prepare` calls; batch statements are the atomic batch size. Rows read/written cover batch metadata where available, excluding preliminary lookup reads. They are not physical-size or production-capacity measurements.

| Request | Prepared SQL | Batch statements | Approx. local latency | Batch rows read / written |
| --- | ---: | ---: | ---: | ---: |
| 1 novel event | 35 | 21 | 417 ms | 28 / 41 |
| 25 novel events | 203 | 117 | 763 ms | 110 / 346 |
| 50 novel events | 378 | 217 | 1,753 ms | 185 / 671 |
| 50 exact duplicates | 228 | 117 | 1,156 ms | 10,438 / 119 |
| 25 duplicate + 25 novel | 303 | 167 | 745 ms | 10,438 / 394 |

The maximum event batch succeeds locally without removing guards. No local batch-limit exception was observed. Applicable production plan limits, throughput and latency remain unverified and require review before exposure. No production capacity claim is made.

## Short-window cleanup and operation notes

`cleanupExpiredScopeWindows()` deletes at most a bounded configured count of rows with window_seconds>0, non-null expiry and expiry at/before database time. Default is 100, maximum accepted limit is 1,000; malformed limits fall back safely. It excludes lifetime rows and never deletes capabilities, build policies or accepted telemetry.

The helper is not connected to ingest or a cron. Future cleanup should run as a separately authorized bounded maintenance job. This task adds no production schedule and leaves 730-day whole-run retention unchanged.

Local commands use the existing network-denial preload for regression suites and isolated `MQ_EVIDENCE_DIR` directories. Runtime tools require `MQ_LOCAL_RUNTIME_MODULES` pointing to an already-installed directory containing Miniflare and esbuild. They seed a random capability's hash into local D1 and hold the raw token only in process memory. Do not use the production Wrangler binding or a remote migration command for these fixtures.

```powershell
node audit_tools/telemetry_governance/capability-http-check.mjs
node audit_tools/telemetry_governance/capability-http-check.mjs --runtime
node audit_tools/telemetry_governance/capability-runtime-diagnostic.mjs
```

These commands currently reproduce an incomplete/NO-GO runtime result; they are not deployment instructions.

## Existing regressions after integration

| Suite | Result |
| --- | --- |
| Stage 1 capabilities | 56/56 PASS |
| Governance | 14/14 PASS |
| Readiness/remediation, including browser fixtures | 27/27 PASS |
| Scheduled retention | 11/11 PASS |
| Backend integration | 18/18 PASS |
| Client/backend regressions | 21/21 PASS |
| Measurement contract | 16/16 PASS |
| Private refresh | 33 cases PASS |
| Published Managerial/local-only browser | 103/103 PASS |
| git diff --check | PASS |

All seven required baseline suites passed both before and after integration. The additional public/browser and private-refresh checks passed. A separate governance-page browser rerun was unnecessary: its pages were unchanged, and the required readiness plus published-game browser coverage ran locally. No assertion in an existing suite was weakened.

## Scope and production confirmations

The source proof confirms Composer source/core/UI/adapter, all telemetry clients, the beta HTML, public polished games, National Engine, question banks, public documentation and dist remain byte-identical to the starting working tree. Stage 1 capability helper, migration 0003 and prior evidence remain unchanged except the explicitly integrated admission module. Disposable generated builder copies existed only inside this task's evidence directory and were removed after testing.

mq-measurement/1, mq-governance/2, mq-disclosure/2, schema 3, centralized fields, CSV schema, local Download Game Data, anonymousClientId semantics, operational/research separation and faculty default OFF remain unchanged. Retention remains 730-day whole-run with cron `17 4 * * *`. ADMIN_TOKEN and distinct MAINTENANCE_TOKEN semantics are unchanged.

No production D1 was read or mutated. Migration 0003 was NOT remotely applied. No production telemetry endpoint or real Turnstile service was called. No production capability was created by this work. No public activation or arbitrary-host CORS was enabled. Nothing was deployed.

## Rollback and next gate

For this undeployed stage, all flags are already OFF, preserving the current compatible behavior. Issuance remains closed. The additive schema can remain unused; no down-migration is needed. This work has not created production capabilities.

After a future capability-aware deployment, rollback must preserve authorization and revocation semantics. Permanently returning to the old unauthenticated Worker would not be an acceptable rollback design. No production rollback was attempted here.

**NO-GO for Stage 3.** First resolve or isolate the actual local HTTP early-response issue in an authorized follow-up and rerun the unchanged body/error guarantees. Correct the misleading-Content-Length transport classification with explicit no-write proof. Re-run the complete runtime HTTP suite and required regressions. Then review provisional quotas and real deployment plan limits, approve any production legacy sunset, and separately authorize Stage 3. Do not proceed with Composer activation or public capability exposure from this stopped state.
