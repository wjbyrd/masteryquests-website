# Portable Telemetry Stage 2 final redaction gate

Stage 2 **COMPLETE**. Stage 3 **GO recommendation only**; no Stage 3 implementation occurred. Nothing deployed to production. Temporary staging resources are deleted.

## Baseline and change

Repository: C:\Users\Jennings\Documents\GitHub\masteryquests-website. Branch: main. Starting HEAD: a248c116c66ab509686e9234b8d343c93c12ef1e. Starting dirty status and hashes are preserved in baseline/source.json. Prior accepted reports and evidence were read and preserved.

The previous isolated deployment exposed the synthetic capability in authenticated live-tail request metadata under the old header. Application logs were already clean and the deployed 300-case body-limit matrix had passed. The sole transport change makes **X-MQ-Ingest-Token** canonical. The retired X-MQ-Ingest-Capability header rejects whenever capability ingest is enabled, including empty values, both headers, and otherwise valid legacy grace. Malformed or invalid new tokens never fall back. Flags-OFF legacy behavior is preserved.

Changed pre-existing files (relative to this task's captured working tree):

- `audit_tools/telemetry_governance/capabilities-check.mjs`
- `audit_tools/telemetry_governance/capability-body-runtime-check.mjs`
- `audit_tools/telemetry_governance/capability-http-check.mjs`
- `audit_tools/telemetry_governance/capability-http-fixture.mjs`
- `audit_tools/telemetry_governance/capability-runtime-diagnostic.mjs`
- `audit_tools/telemetry_governance/staging/log-probe.mjs`
- `audit_tools/telemetry_governance/staging/test.mjs`
- `server/anonymous-telemetry-poc/capability-admission.mjs`
- `server/anonymous-telemetry-poc/dual-mode-ingest.mjs`

Added: server/anonymous-telemetry-poc/CAPABILITY_OPERATOR.md; audit_tools/telemetry_governance/capability-header-check.mjs; audit_tools/telemetry_governance/redaction-staging/{control,setup,worker,test,cleanup}.mjs; this report; validation_artifacts/portable_telemetry_stage2_redaction/ evidence and local verification scripts. Historical reports retain their original header wording. Source comparison found no deleted baseline files and no other baseline content changes.

## Local regressions

| Suite | Before staging | After cleanup |
|---|---:|---:|
| capabilities | 56/56 | 56/56 |
| governance | 14/14 | 14/14 |
| readiness | 27/27 | 27/27 |
| scheduled | 11/11 | 11/11 |
| backend | 18/18 | 18/18 |
| regressions | 21/21 | 21/21 |
| contract | 16/16 | 16/16 |
| private-refresh | 33/33 | 33/33 |
| http-sqlite | 39/39 | 39/39 |
| http-runtime | 37/39 | 37/39 |
| public-browser | 103/103 | 103/103 |
| header-sqlite | 8/8 | 8/8 |
| header-runtime | 8/8 | 8/8 |

Both git diff --check runs passed. Runtime 37/39 preserves the two known local emulator oversized-response readability failures; the assertions and historical evidence were not weakened or rewritten. All other suites pass. Governance is 14/14, readiness 27/27, scheduled retention 11/11.

## Isolated staging

Worker: masteryquests-telemetry-redaction-staging. Version: 5cf4c85d-c20f-4bbd-b94c-cfcb35049a52. D1: masteryquests-telemetry-redaction-staging; UUID: 0a9035dd-2fc9-4715-88cd-d95c66fb024b. Only that new D1 received migrations 0001, 0002 and 0003; migration hashes are recorded in resources.json and redaction.json. No production data copied.

Issuance=false; ingest=true; legacy grace=false. No issuance route, real Turnstile, admin or maintenance credentials. Synthetic capabilities were generated and hashed through canonical helpers; raw values stayed in process memory. The database held the required capability hash as authorization state, never in exported evidence or telemetry rows. Browser origin was https://masteryquests.org using an in-memory document; no production page was requested or changed.

Five valid requests returned 202 and accepted=1, including exactly 131072 bytes and three final health requests. Event and run rows, exact tuple, event count and capability-attributed receipt were verified. An exact duplicate returned accepted=0 with the acknowledged ID, without event, run or accepted-counter inflation; submitted-work accounting can still charge. Telemetry rows and receipts contained no raw token or capability hash.

All 17 staging authorization negatives rejected with full seven-table before/after state equality: missing, malformed, random, expired, revoked, blocked, wrong build/game/version/schema, old header, both headers, Authorization, query, JSON, cookie, and operator capability ID. Retired/alternate carriers used nonsecret markers in deployed tests so live issued credentials stayed exclusively in the canonical header. Both-header rejection included a valid new token. Local authority tests additionally used real fixture credentials in retired and alternate carriers and tested valid legacy tuples.

Capability preflight advertised only content-type,x-telemetry-phase,x-mq-ingest-token. New header preflight returned 204; old and combined headers returned 403. No credentials CORS was added; origins, admin CORS and flags-OFF behavior remain unchanged. Controlled errors retained first-party CORS, Vary: Origin and no-store.

ASCII 131073-byte, representative multibyte oversized, and Edge oversized requests all returned readable controlled 413 responses with no D1 writes. The prior 300-case matrix was not repeated.

## Provider redaction

Authenticated live tail inspected **23 events**. Exact field: **event.request.headers.x-mq-ingest-token**. There were **16 header observations**, each with provider marker **REDACTED**; seven other events omitted the header. No provider input was encoded, disguised or truncated.

Raw token matches: **0**. Full capability hash matches: **0**. Partial token matches: **0**. Application console matches: **0**. Exception matches: **0**. Scanning covered the complete tail event, including request metadata, headers, console and exceptions. Admin and maintenance secrets were absent from staging and never loaded; their counters are zero by absence, not a test of production-secret redaction.

Persisted Worker Logs were enabled, but the Worker-scoped query was denied with HTTP 403 / code 10000. **Persisted metadata is unverified**, not declared clean. The required live-tail and application-log minimum passed independently.

Exact ephemeral raw values and hash were checked before evidence writes and on disk while still in memory: zero matches. All new evidence was also checked for complete raw capability patterns. The final artifact scan is recorded separately. No raw tail payload was persisted.

## Cleanup and invariants

Tail closed. Worker deleted 2026-09-14T20:02:22.450Z; D1 deleted 2026-09-14T20:02:23.280Z. Separate reads verified both resources absent. Active staging config was removed and its nonsecret deployed configuration archived. Final counts are in final-row-counts.json.

Production Worker and production D1 were untouched: all remote data-plane requests targeted the isolated URL and all database operations were guarded to the new UUID. No production migration, production deployment, Composer/client/public-game changes, or issuance enablement occurred. Production repository configuration remains all capability flags false. mq-measurement/1, mq-governance/2, mq-disclosure/2 and retention remain unchanged. Baseline hashes confirm preserved protected files and prior evidence.

The final Stage 2 blocker is cleared on the empirically tested live-tail surface. Stage 3 may proceed as separate authorized work. Deployment status: **NOT DEPLOYED TO PRODUCTION**.
