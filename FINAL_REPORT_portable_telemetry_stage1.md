# Portable telemetry capabilities — Stage 1 implementation report

Stage 1 server foundation is implemented and its local transactional invariants pass. **Stage 2 recommendation: NO-GO** until the inherited governance disclosure regression is resolved in an authorized scope. Nothing has been deployed or enabled. This report does not claim that active legacy ingest has acquired the new ownership or concurrency protections.

## Baseline and scope

- Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`.
- Branch: `main`.
- Starting HEAD: `a248c116c66ab509686e9234b8d343c93c12ef1e`.
- Initial working tree: clean.
- Read the approved `FINAL_REPORT_portable_telemetry_capability_design.md` and `validation_artifacts/portable_telemetry_capability_design/design.json`, then checked actual Worker, validators, persistence, governance, migrations, configuration and regression fixtures.
- Current source was used as implementation authority. No locked policy or measurement contract was changed.

The active `worker.mjs` is unchanged and imports neither new helper. There is no new HTTP route, CORS expansion, real challenge-provider implementation, Composer adapter or client integration. The helpers are exercised directly by disposable local fixtures with explicitly enabled fixture environments. The future activation route returns the existing 404 through the active Worker, regardless of request-supplied flags or credentials.

## Files changed

New server files:

- `server/anonymous-telemetry-poc/capabilities.mjs`
- `server/anonymous-telemetry-poc/capability-admission.mjs`
- `server/anonymous-telemetry-poc/migrations/0003_build_ingest_capabilities.sql`

Modified server configuration:

- `server/anonymous-telemetry-poc/wrangler.jsonc`: only two explicit string `false` vars added.

New test files:

- `audit_tools/telemetry_governance/capabilities-check.mjs`
- `audit_tools/telemetry_governance/local-network-only.mjs`

Updated existing test fixtures:

- `audit_tools/anonymous_telemetry_poc/run_backend_integration.mjs`
- `audit_tools/anonymous_telemetry_poc/run_regressions.mjs`

Reporting and evidence:

- This report.
- `validation_artifacts/portable_telemetry_stage1/stage1.json`.
- Focused and existing-suite result JSON, logs, synthetic CSVs, browser evidence, baseline-drift diagnostic and source inventory beneath that evidence directory. The exact individual artifact paths are listed in `stage1.json`.

No effective changes remain in `audit_tools/telemetry_governance/check.mjs`: a diagnostic line-ending normalization attempt was discarded after proving the mismatch was substantive. Its test has not been weakened. Generated disposable builder HTML was removed from the evidence directory after testing; no generated game was published or updated.

## Feature flags

`featureFlags()` requires the exact server-owned string `"true"`. Missing values, booleans, numbers, whitespace, other strings, objects and arrays remain OFF. Both committed vars are `"false"`:

- `CAPABILITY_ISSUANCE_ENABLED`
- `CAPABILITY_INGEST_ENABLED`

The helpers check the relevant flag before processing and again before each commit attempt. Tests also flip flags between preliminary work and the transaction and prove no writes occur. Request headers, query parameters and body fields cannot set these environment flags. The ingest helper rejects query-bearing requests; it accepts authority only from its designated header. These decisions do not change the active Worker's handling of legacy requests.

## Additive data model and migration

Migration 0003 adds:

| Storage | Purpose |
| --- | --- |
| `telemetry_build_policies` | Composite game/build key, creation/block state, cumulative accepted events and normalized bytes shared across capabilities and revisions. |
| `telemetry_build_capabilities` | Operator UUID, unique token digest, exact game/build/revision/schema tuple, issuance/expiry/revocation, unique issuance attempt and activation digest, cumulative request/event/byte counts and last use. |
| `telemetry_scope_windows` | Composite scope/key/window/start key, atomic request/event/byte counts, bounded short-window expiry and a persistent global lifetime row. |
| `telemetry_ingest_batches.capability_id` | Nullable attribution; all prior and flags-OFF legacy rows remain valid with NULL. |
| `telemetry_ingest_batches.admission_valid` | Default 1, with named CHECK constraint requiring 1; failed transactional predicates abort the entire batch. |

Indexes cover build/revision/live expiry, unrevoked expiry, scope expiry, capability receipt lookup and run-manifest resolution. The machine-readable report contains actual SQLite column/index introspection.

Two small corrections to the proposed SQL were justified:

1. The manifest expression is `CASE WHEN json_valid(extras_json) THEN json_extract(extras_json, '$.manifestID') END`. Unconditional `json_extract` would fail on malformed historical JSON. The CASE preserves those rows and indexes a null expression instead of rewriting or deleting data.
2. The proposed admission CHECK is named `mq_ingest_admission`, so a failed guard can be recognized internally and retried without returning database errors or credentials.

Migrations 0001 and 0002 remain unchanged. A local fixture applies 0001, then 0002, inserts representative valid, legacy and malformed manifest JSON plus an old receipt, and applies 0003. All event rows and event-schema columns survive, the old receipt has NULL attribution, indexes are valid, and SQLite integrity checking passes. Existing old-schema and migrated-schema CSV headers are identical. No foreign-key cascade from capability revocation deletes telemetry.

## Token and activation foundation

Generation uses native `crypto.getRandomValues(new Uint8Array(32))`: 256 random bits, encoded as `mqic1_` plus exactly 43 canonical unpadded base64url characters. Parsing rejects the wrong prefix, alphabet, length, padding, comma-combined values and noncanonical unused bits. Native Web Crypto SHA-256 hashes the full canonical ASCII token into 64 lowercase hexadecimal characters. Tests independently compare the result with Node SHA-256. No cryptographic dependency was added.

Raw tokens are returned only by successful issuance and are never written to storage. A separate UUID is an operator reference, not authority. Capability rows contain only the digest, never a recovery field. Issuance persists one year (365 days) of validity using the database clock; status evaluation rejects invalid, not-yet-valid, expired, revoked or blocked records.

Activation validates exactly the approved eleven fields, strict boolean collection opt-in, exact contract/governance/disclosure/schema versions, canonical attempt UUID, bounded challenge string, and Composer tuple. Unknown fields, wrong primitives and unsupported versions reject. A streamed JSON reader supplies byte and nesting bounds for future HTTP integration; the activation model itself also limits its serialized size to 8,192 bytes. No title, recipe, identity, question content or learner payload is accepted.

Challenge verification is injectable and has no production network implementation. It requires success, action `mq_build_activate`, approved hostname and matching activation context digest. Fixtures cover failure, expired/replayed challenge results, wrong action/hostname/context and provider unavailability. The activation digest excludes the attempt UUID and challenge; it covers the stable authorized activation scope.

Issuance uses one database batch for policy creation, guarded capability insertion, issuance window increments and response metadata lookup. A unique issuance UUID prevents concurrent duplicate minting. An expiry CHECK also makes block/live-token/window failures abort issuance. Stale guard outcomes retry with fresh reads, up to three attempts. Lost-response retries of the same attempt return conflict without a second token or recovery; a fresh attempt is subject to the same limits. SQL-trigger failures prove rollback at policy, capability and window insertion.

## Immutable tuple and runtime manifests

The initial family is exactly:

- `game_id = faculty-composer`
- `build_id = composer-` plus 64 lowercase hex characters
- `build_version =` 64 lowercase hex characters
- `schema_version = 3`

Raw tuple values are checked before legacy normalization can coerce or trim them. Every event must match the capability's complete tuple. Authorization never rests on one fixed manifest ID.

The implementation reuses existing measurement validation and `contractHash` / `stableContractJSON`. It checks the manifest's complete hash, configuration hash and build revision, projects away runtime `buildRevision`, `mode` and `modeParameters`, and hashes the immutable base back to `build_version`. The manifest mode must be supported and match the event's mode. Multiple legitimate mode-specific manifests pass for one build; changed engine/content/configuration revisions fail. Manifest resolution uses a same-batch manifest or a stored manifest for the same run and exact tuple. Stored manifest snapshots are rechecked inside admission, so a concurrent deletion aborts.

A null manifest is allowed only for the approved unresolved lifecycle list with empty question/concept/response context and no presentation, attempt, support, resource or manifest payload. A measured answer or resource event cannot use this exception.

## Transactional admission actually implemented

Preliminary reads classify requests and produce useful rejection statuses; they are not the authorization boundary. The final authority is a single atomic `db.batch()` containing:

1. The attributed receipt.
2. Named CHECK guard updates that re-evaluate permission, expiry/revocation/block, immutable ownership, summary integrity, exact existing-event snapshots or absent new IDs/sequences, stored manifest snapshots, window clocks, client throttling and cumulative budgets.
3. Plain event INSERTs for the planned novel set, each followed by run aggregation.
4. Capability, build, short-window, lifetime-window and existing client-limiter increments.
5. A final permission guard before commit.

Each guard sets `admission_valid` to 0 on failure, which violates the database constraint and rolls back the entire batch, including its receipt. Guards are separate bounded statements; no statement exceeded 41 parameters in the tested maximum-size requests. A 50-event novel request used 217 statements. Provider-specific capacity and latency remain a prerequisite before exposure; local SQLite success is not a production D1 load test.

The module uses no mutex, Worker-instance lock, `INSERT OR IGNORE`, or JavaScript BEGIN with network round trips. The fixture's D1 adapter executes a real synchronous SQLite `BEGIN IMMEDIATE` / statement set / COMMIT transaction with rollback on SQL failure. Deterministic barriers stage both requests after their preliminary reads; no arbitrary sleeps establish a race outcome. Production code delegates transaction boundaries to D1 batch semantics.

Guard failures retry at most three times, then produce a sanitized conflict. Re-reading recognizes another request's exact insert as a duplicate; changed payload/owner/sequence becomes conflict; newly exhausted quotas become 429; revoked, blocked and expired capability becomes 403. Arbitrary SQL failures return a fixed 503 and never expose a database error string.

### Ownership and duplicate semantics

Immutable run ownership comprises run UUID, anonymous client UUID, game, build and revision. Historical events must also have schema 3 and match that owner. Both summaries and stored events are checked. Mixed ownership, orphaned events and inflated summaries reject new writes instead of silently repairing history.

An exact duplicate has the same event UUID, authorized owner and equivalent values across all 38 normalized stored payload columns. Extras are compared as canonical JSON objects, so harmless key order changes do not create a conflict; the transaction still guards the exact stored snapshot. Changed payload under an existing event UUID, another owner's global event UUID, or a different event occupying the run/sequence pair returns conflict.

Only genuinely inserted events reach run aggregation. Novel-row guards and ordinary INSERT uniqueness prevent a stale pre-read from inflating a summary. Exact retries return accepted 0 and acknowledge the existing IDs, without changing event receipt time, run receipt time, run count, accepted-event count or accepted bytes. Duplicate requests still charge submitted-work windows and the accepted request count, as designed. This prevents duplicate retries from extending whole-run retention.

## Quota foundation

All numbers below remain provisional and require capacity review before traffic exposure:

| Scope | Default |
| --- | --- |
| Live capabilities per exact tuple | 3 |
| Issuance per build/day | 10 |
| Issuance global/hour and global/day | 100 / 500 |
| Existing client UUID submitted events/minute | 300 |
| Capability requests/events per minute | 3,000 / 60,000 |
| Build submitted events/minute | 90,000 |
| Global requests/events per minute | 10,000 / 180,000 |
| Capability accepted events/bytes | 2,000,000 / 512 MiB |
| Build accepted events/bytes | 5,000,000 / 1 GiB |
| Global accepted bytes | 2 GiB |

The capability limits accept bounded positive integer configuration through `MQ_CAP_` keys with safe defaults on malformed values. Existing client-limit parsing remains unchanged. Request/body limits remain 50 events and 128 KiB. Short windows count admitted submitted work, including duplicates. Accepted bytes are UTF-8 canonical normalized novel event payload, not a claim about physical D1 disk consumption. Build and global cumulative counters survive replacement tokens and revisions. Tests verify exact byte boundaries, concurrent quota exhaustion, duplicate charging, clock-window rollover and rollback of counters.

## Credential separation and redaction

No new module logs a request, token, hash or provider result. Errors are fixed codes; a fixture that throws a raw token from database preparation still produces only a sanitized error. Known capability/operator credentials in event JSON are rejected before storage. Tests inspect telemetry rows, receipts, CSV, error strings, captured console output and publishable results. No raw capability was persisted or included in published evidence. Hashes occur only in control storage and internal bound statements, never telemetry rows, receipts or responses.

Ingest capabilities fail all tested existing admin paths, including summary, anomalies, reconstruction, export, retention, cleanup and deletion. They do not provide a challenge verifier or issuance authority. Unexposed revoke/block/unblock helpers require the existing ADMIN_TOKEN plus distinct MAINTENANCE_TOKEN. Blocking also revokes existing tokens in the same batch; unblocking does not revive them. Accepted telemetry is retained. Existing Worker admin and maintenance semantics are unchanged.

## Validation results

| Suite | Passed | Failed |
| --- | ---: | ---: |
| Focused capabilities | 56 | 0 |
| Governance | 13 | 1 inherited disclosure mismatch |
| Readiness/remediation, including browser fixtures | 27 | 0 |
| Scheduled retention | 11 | 0 |
| Backend integration | 18 | 0 |
| Existing client/backend regressions | 21 | 0 |
| Measurement contract | 16 | 0 |
| **Total** | **162** | **1** |

In addition, contract generation, Composer behavior synchronization, field inventory and dictionary rendering each pass their independent check commands. These were run separately because the governance suite's compound drift test stops at its first failure. `git diff --check` passes.

Focused race coverage includes identical first writes; conflicting event IDs at a run/sequence; changed payload under one global event ID; different client and different build first writers; revocation/block/expiry between lookup and commit; expiry during dependent SQL writes; concurrent issuance; concurrent request/event/byte/client quota exhaustion; and clock-boundary retry. SQL-trigger failures at event insertion, run update, capability counter, build counter, receipt and window writes leave complete database snapshots unchanged. Issuance failures also roll back all dependent rows. No core transactional or concurrency invariant failed locally.

Legacy parity is tested with schemas 1, 2 and 3 on both old and migrated schemas, with flags missing/OFF and arbitrary capability headers. Active legacy requests remain valid, capability tables/windows are unused, attribution stays NULL, CORS excludes the new header, and activation remains unavailable. Scheduled/manual governance suites retain the unchanged 730-day latest-server-receipt whole-run behavior. Measurement fields, CSV schema, local downloads and browser collection hierarchy pass their existing checks.

### Existing fixture corrections

The backend integration baseline initially passed 15/18 checks. It omitted current governance configuration, used only ADMIN_TOKEN for cleanup, expected an empty CSV instead of its header, and read an obsolete cleanup count field. The fixture now uses approved policy configuration, a separate synthetic maintenance token, asserts a header with zero synthetic rows by default, and checks the current `counts.events` response. No production behavior or test invariant was weakened.

The client regression fixture needed `addEventListener` on its mock checkbox. Its simulated-failure case also used an obsolete global storage key; it now activates the same failure through the existing debug UI. Its local Worker environment receives the approved governance configuration. Both old tools support `MQ_EVIDENCE_DIR`, preserving historical evidence rather than overwriting it.

### Unresolved inherited regression

The unchanged governance renderer expects “Submission through Canvas or another system”; the unchanged checked-in responsible-use page says “Submission through your LMS or another system.” The mismatch remains after LF/CRLF normalization. Both files match starting HEAD. Evidence is in `governance-baseline-drift.json`; the source proof in `stage1.json` records their canonical text hashes and starting-HEAD equality.

Public documentation changes are explicitly outside this request. Therefore the mismatch was neither overwritten nor ignored, and the required suite remains honestly marked FAIL. This is the basis for the conservative Stage 2 NO-GO recommendation; it is not a failed capability transaction invariant.

## Local execution and operational boundaries

The focused suite imports the local network-denial helper itself:

```powershell
node audit_tools/telemetry_governance/capabilities-check.mjs
```

Existing suites were run with `NODE_OPTIONS=--import=./audit_tools/telemetry_governance/local-network-only.mjs` and separate `MQ_EVIDENCE_DIR` subdirectories. This blocks external Node fetch/HTTP/HTTPS/socket calls while allowing loopback fixtures. Browser readiness used the bundled Playwright module and local headless Microsoft Edge, with telemetry requests fulfilled by the in-process local Worker and all other external requests aborted. Its preflight hashes were captured immediately before that run; it wrote only disposable evidence fixtures. No production secret was used.

The work performed **no production D1 read or write, no remote endpoint request, no real Turnstile verification, no remote migration and no deployment**. Merely constructing a synthetic Request or holding a production endpoint constant does not perform a network call. Migrations were applied only to disposable in-memory SQLite databases. Public Composer, generated adapter, games, National Engine, question banks, static pages, dist and contract/policy sources are unchanged. All Wrangler content apart from the two false flags equals the baseline configuration.

## Stage 2 prerequisites and decision

**NO-GO for Stage 2 now.** The server foundation's local acceptance invariants pass, but one required inherited governance regression remains unresolved. First reconcile the public disclosure and generator in a separately authorized scope, then rerun that suite without weakening its check.

After that, Stage 2 still requires explicit authorization. Before exposure, integrate guarded HTTP routes and redacted/no-store responses; connect and configure a real challenge verifier; integrate ownership/exact-duplicate protections with the legacy grace path; validate actual D1 batch error wrapping, multi-isolate behavior, limits and latency; review provisional quotas; and define bounded short-window cleanup while preserving cumulative budgets. Subsequent Composer/runtime/CORS work remains in its approved stage. The current active legacy path still has its pre-existing weaker deduplication/concurrency pattern because this Stage 1 deliberately provides an isolated replacement foundation without changing deployed-compatible routing.
