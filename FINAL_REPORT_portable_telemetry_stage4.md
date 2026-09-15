# Stage 4 external HTTPS portability proof

**Stage 4: COMPLETE. Stage 5: GO for a separately authorized rollout rehearsal. Production remains disabled and NOT DEPLOYED.**

Repository: C:\Users\Jennings\Documents\GitHub\masteryquests-website. Branch: main. Starting HEAD: 3cbb3a383cc8c9ff839fffaf8b1f5b05a161b7c1. Starting working tree was clean. Stage 3 final reports were read; accepted prior proofs remain unchanged.

## Implementation and authorization boundary

The sole application source change is `server/anonymous-telemetry-poc/dual-mode-ingest.mjs`. Its exported origin validator uses the URL parser and requires exact serialized HTTPS origin equality, no credentials, and no whitespace/comma smuggling. Paths, query, fragments, opaque/null origins, non-HTTPS schemes, malformed hosts and combined Origin fields reject. Raw input tests cover whitespace/newline values; HTTP runtimes may normalize header whitespace before application code receives it.

Only capability-enabled `/v1/events` preflight accepts arbitrary valid HTTPS origins. It requires POST and limits allowed headers to content-type, x-telemetry-phase and x-mq-ingest-token. It echoes the validated origin, varies on Origin/request method/request headers, and never allows credentials. No preflight max-age was introduced.

For POST, presence of X-MQ-Ingest-Token selects capability admission exclusively, including malformed/empty values. Valid HTTPS origins receive readable controlled success/error responses with no-store; absent Origin remains supported for non-browser capability clients. The original capability checks and exact build scope remain mandatory. Headerless traffic retains exact first-party legacy/grace admission and receives no arbitrary-origin CORS. Invalid tokens never fall back to legacy.

Issuance, admin/maintenance and health routing were not modified. Tests prove external-origin activation/admin preflight remains closed and official-origin activation preflight remains restricted to content-type. No credentials or maintenance headers are advertised by portable ingest. Client endpoint policy, credentials omission, no-referrer and redirect rejection are unchanged. Origin/host/referrer were not added to telemetry rows, schemas or CSV.

## Retained staging and artifact

Worker: masteryquests-telemetry-stage3-staging. D1: 993f49a5-4dd4-41ee-9007-bbf4bb4856c9. First-party surface: https://stage3.masteryquests.org/. Existing Worker/D1 binding identity was checked before edits. The existing GitHub artifact has an active, unexpired capability matching staging D1 and the expected staging endpoint.

Before version: 22c766ea-be10-481e-8e4a-8d5eadf5666d. Stage 4 staging version: **4a63b1f3-aa40-4522-89c0-fb913ca7315c**. Only the staged ingest module changed. Preparation verified all 709 other enumerated staged files unchanged, including Composer assets, and a byte-identical canonical verifier. Wrangler uploaded no changed assets. Staging flags remain issuance=true, ingest=true, legacy-grace=false. No secret value was read.

External page: https://wjbyrd.github.io/test/. Scheme: https. Host: wjbyrd.github.io. Serialized Origin: https://wjbyrd.github.io. The HTML was read in memory, never patched or republished. Its artifact fingerprint matches before/after deployment. No raw capability or capability digest was persisted in evidence.

## Local verification

| Suite | Passed |
|---|---:|
| Stage 4 CORS SQLite | 24/24 |
| Stage 4 CORS Workers runtime | 24/24 |
| Stage 1 capabilities | 56/56 |
| Governance | 14/14 |
| Readiness | 27/27 |
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
| Stage 3 browser, including accepted pattern hotfix | 17/17 |
| Canonical verifier | 19/19 |
| Composer active runners | 27/27 |

All 43 required regression suite/runner entries passed. Existing assertions were not changed. The new Workers CORS test initially encountered the previously known oversized-stream transport termination. That evidence is retained; Workers 413 CORS was verified using the existing 51-event batch rejection, while SQLite retains byte-size rejection coverage. This does not claim the inherited local oversized-stream limitation was fixed.

Seven deployed staging checks passed: external preflight 204; unsupported method 403; null Origin 403 without ACAO; malformed token 403 with readable CORS; missing token 403 without broad CORS; external activation OPTIONS 403 without ACAO; admin OPTIONS 404 without ACAO. These server probes do not replace the required manual browser proof.

## Completed external proof

The owner supplied an ordinary Edge screenshot showing preflight 204 and POST 202 from the unchanged GitHub-hosted game. Before automated follow-up, live tail independently showed five OPTIONS 204 and six POST 202 with no console or exception entries. The successful responses and subsequent browser checks establish no blocking CORS failure. No Turnstile challenge was automated.

The post-gate D1 records contain the expected faculty-composer build/version/schema-3 scope and resolvable run manifests. The owner did not provide an individual run ID, so the post-baseline record set is not claimed to identify one unique manual run. The follow-up browser proof directly correlated its actual GitHub request's transported run ID with the exact D1 run, events and capability-attributed receipt. Measurement rows and CSV exclude the capability/digest and external Origin. All activity was owner/harness test activity in isolated staging, not a learner cohort.

Six follow-up checks passed on Edge 153.0.4234.32:

- D1 scope, manifest and receipt validation after the manual gate.
- Actual unchanged GitHub page sends X-MQ-Ingest-Token, receives 202, and preserves gameplay and local CSV.
- Existing external opt-out checkbox stops future transport while gameplay/CSV remain available.
- One exact external batch replay returns accepted=0 and acknowledges all duplicates, with no run-event, accepted-event or accepted-byte inflation and no change to the run's last server receipt. Normal request accounting is not treated as accepted-event inflation.
- The same unchanged HTML bytes and capability submit from both external HTTPS and first-party staging browser contexts. The first-party comparison used a browser-local fixture serving those exact bytes; it did not publish or alter the GitHub file. No cross-origin identity synchronization was added or assumed.
- Revoking the specific capability causes the unchanged GitHub artifact to receive 403 and stop remote sending; gameplay and local CSV remain available.

A supplemental opt-out test answered two questions across a reload using the existing checkbox, made zero remote requests, and downloaded CSV successfully. The capability remained revoked throughout; no reactivation or replacement was performed.

The first harness attempt used the game's local run ID rather than its existing transport-mapped UUID for a D1 lookup. That test lookup was corrected and the failure evidence retained; no client/server behavior changed.

Final external-origin live tail: 21 events, 14 redacted token headers, seven omitted headers (preflights), zero raw capability matches, zero capability-hash matches, zero unexpected header values, and zero application-console/exception entries. Raw tail payloads were never persisted. The tail was closed through the staging API and its local listener stopped.

No unexpected Stage 4 429 occurred. The local quota fixture intentionally tested 429 with a one-event limit. The inherited Stage 3 429 remains historical and was not reproduced or claimed fixed.

## Cleanup and retention

The specific hosted-game capability was revoked, along with one additional unused capability for the exact same test game/build/version (zero accepted requests/events). Final staging counts: five capabilities total, zero active. Accepted telemetry was not deleted. Worker, D1, domain and widget remain retained for Stage 5. The hosted artifact still matches its initial fingerprint and remains locally playable; remote ingestion is now disabled by revocation.

Capability-enabled generated games have been validated from an independent HTTPS host. This is staging proof, not a production availability claim.

## Production protection and files

Production Workers/D1 were not called, deployed or reconfigured. Production migration 0003 was not applied; production capability flags remain false. Production Composer, public polished games, National Engine, production CORS, telemetry contracts, measurement fields and retention remain unchanged. No public portability claim was added. Controlled dist was not rebuilt because no public authored files changed.

Changed implementation: `server/anonymous-telemetry-poc/dual-mode-ingest.mjs`.

Added tooling: `audit_tools/telemetry_governance/stage4-cors-check.mjs`, `stage4-regressions.mjs`, `stage4-external-artifact.mjs`, `stage4-prepare-staging.mjs`, `stage4-deployed-check.mjs`, `stage4-tail.mjs`, `stage4-game-proof.mjs`, and `stage4-optout-continuity.mjs`.

Additional changes: this report, sanitized evidence under `validation_artifacts/portable_telemetry_stage4/`, and retained staging resource bookkeeping. Machine-readable status: `validation_artifacts/portable_telemetry_stage4/stage4.json`. `git diff --check` passed.

Recommendation: retain isolated staging for a separately authorized Stage 5 rollout rehearsal. Stage 4 acceptance is complete; production enablement and deployment still require separate authorization.
