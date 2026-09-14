# Portable Telemetry Stage 3

**Stage 3 implementation is complete and locally verified. Stage 4: NO-GO pending real-provider isolated staging proof. NOT DEPLOYED TO PRODUCTION.** No real Turnstile acceptance, deployed Stage 3 end-to-end result, or Stage 3 provider-redaction result is claimed.

## Baseline and scope

Repository: C:\Users\Jennings\Documents\GitHub\masteryquests-website. Branch: main. Starting HEAD: f6447453367cb280a26d690039d25777f85e28e4 (pushed Stage 2 checkpoint). Initial working tree was clean. All specified Stage 1/2 reports were reviewed; the final redaction report supersedes earlier historical NO-GO results. Baseline status and 11606 tracked file hashes are retained in baseline/source.json. No unrelated starting changes existed.

Files changed or added, excluding the individual evidence files under validation_artifacts/portable_telemetry_stage3/:

- `FINAL_REPORT_portable_telemetry_stage3.md`
- `audit_tools/public_site_publication/build-dist.mjs`
- `audit_tools/published_managerial_parity/sync.mjs`
- `audit_tools/telemetry_contract/public-release-registry.json`
- `audit_tools/telemetry_contract/registry.json`
- `audit_tools/telemetry_governance/composer-activation-source.mjs`
- `audit_tools/telemetry_governance/composer-transport.mjs`
- `audit_tools/telemetry_governance/readiness-remediation.mjs`
- `audit_tools/telemetry_governance/stage3-browser-check.mjs`
- `audit_tools/telemetry_governance/stage3-composer-check.mjs`
- `audit_tools/telemetry_governance/stage3-fixture.mjs`
- `audit_tools/telemetry_governance/stage3-issuance-check.mjs`
- `build/faculty-build-composer/anonymous-telemetry-source.js`
- `build/faculty-build-composer/composer-core.js`
- `build/faculty-build-composer/composer.js`
- `build/faculty-build-composer/index.html`
- `build/faculty-build-composer/ingest-activation.js`
- `build/faculty-build-composer/measurement-build.js`
- `build/faculty-build-composer/telemetry-activation.js`
- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`
- `play/managerial-directorate-classroom/telemetry-client.js`
- `play/managerial-directorate-telemetry-poc/telemetry-client.js`
- `server/anonymous-telemetry-poc/CAPABILITY_OPERATOR.md`
- `server/anonymous-telemetry-poc/capabilities.mjs`
- `server/anonymous-telemetry-poc/capability-issuance.mjs`
- `server/anonymous-telemetry-poc/turnstile-verifier.mjs`
- `server/anonymous-telemetry-poc/worker.mjs`

The capability foundation has only a descriptive comment change; token generation, tuple rules, atomic issuance/quota logic, capability lifetime and migration remain unchanged. The private classroom client and Composer adapter were regenerated through their maintained generators. No encoded adapter was hand-edited. Public Managerial's prior published measurement registry is now an explicit frozen release input to its generator; generated public bytes remain unchanged despite the private tracker release revision. Measurement runtime/contract semantics are unchanged.

## Issuance and challenge

POST /v1/build-capabilities calls the existing canonical issuance helper. Exact server string true is required. Disabled mode returns bounded 404 activation_unavailable without verifying or minting; enabled success returns HTTP 201, no-store and the approved response fields. JSON input is bounded to 8192 actual bytes and its exact field allowlist; unknown fields, wrong primitive/version/scope, queries and unsupported encoding reject. No faculty identity, full recipe, title, selected-concept list, questions or learner data is sent.

Request fields: activationVersion, issuanceRequestId, allowAnonymousDataCollection, gameId, buildId, buildVersion, schemaVersion, measurementContract, governanceVersion, disclosureVersion, turnstileToken. Fixed activation version mq-build-activation/1; strict true; faculty-composer; schema 3; mq-measurement/1; mq-governance/2; mq-disclosure/2. Responses echo scope and governance plus the one-time raw capability, operator ID, issued/expiry times and the fixed approved endpoint. Server control storage contains only the capability digest. A repeated attempt never remints; a changed digest conflicts. A lost raw response requires a fresh attempt/challenge under existing caps. Lifetime remains **365 days**, independent of retention.

Activation CORS accepts only configured https://masteryquests.org and https://www.masteryquests.org, POST/OPTIONS and content-type. It never adds credentials CORS or opens admin routes. Production ingest CORS is unchanged.

The server-only Turnstile adapter calls Siteverify with secret, response and idempotency_key, a 10-second deadline, redirect:error and bounded response parsing. It sends no remote IP. It checks provider success and a five-minute challenge timestamp; the canonical boundary checks action mq_build_activate, approved hostname and exact digest cData. Siteverify supplies single-use enforcement. Deterministic tests inject the verifier through a Worker factory, never through request/environment flags; no public bypass credential or production mock mode exists.

No real staging widget/secret was found in checked local configuration or supplied during this task. The interface is implemented and mocked tests pass; real challenge-provider acceptance is **NOT TESTED**. Configuration requires a dedicated hosted-Composer widget, Worker TURNSTILE_SECRET_KEY secret and public mq-turnstile-sitekey meta setting. No keys were invented or committed. OFF workflows never load the third-party script; the browser loads/executes it only during ON Generate. Generated games contain no Turnstile code. Provider behavior was implemented against the official [Siteverify documentation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) and [widget configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/).

## Composer and generated builds

Generate freezes an exact recipe snapshot, validates/prepares its content/assets and existing composition fingerprint, then computes the immutable measurement revision using a generated copy of the maintained pure measurement helper. Activation binds game/build/revision/schema, never one runtime manifest. Input version and snapshot equality prevent embedding stale results. Programmatic recipe recalculation also invalidates cached authorization. Double Generate is guarded; another download of the unchanged build reuses valid activation in memory. Reload keeps no recoverable token or issuance attempt in faculty state. Editing, preview, estimates, asset preparation and recipe save/import never activate.

Separate global MQ_INGEST_ACTIVATION descriptor fields: activationVersion, capability, capabilityId, endpoint, gameId, buildId, buildVersion, schemaVersion, issuedAt, expiresAt. Exact response validation checks versions, tuple, token syntax, operator UUID, timestamps and the sole approved HTTPS ingest endpoint. Different capability values leave composition fingerprint, build ID, immutable build revision and all measurement hashes identical; generated HTML differs only in its safely escaped descriptor. The descriptor is excluded from recipe, canonical config, measurement manifest, CSV, Download Game Data and saved faculty state. Imported activation extras are discarded by the existing recipe allowlist.

The canonical maintained client supplies only **X-MQ-Ingest-Token**, never the retired header. Composer remote enablement additionally requires strict faculty true, valid logical scope, restrictive browser preference, valid matching descriptor, eligible expiry and no remembered terminal rejection. Browser identity/preferences retain the original logical-build scope; replacing a token does not reset anonymousClientId, opt-out or local game data. Private Managerial remains on its descriptor-absent compatible branch.

Requests use credentials:omit, referrerPolicy:no-referrer and redirect:error. Invalid response endpoints are rejected before embedding. An Edge redirect fixture proved no request or capability reached the disallowed redirect host; this was a rejection check, not an external-host portability test. Terminal 401/403/429 suspends the descriptor and cancels queued remote work. Network/503 failures use existing bounded queue/backoff while still eligible. Games never mint/renew tokens. Missing, malformed, expired or mismatched descriptors disable remote sending while gameplay and local data download continue.

Step 2 explains default OFF, minimal Generate-time activation metadata and local continuity. Readiness distinguishes pending activation from successful authorization with expiry and explicitly defers external-host validation. Failure blocks the ON download and offers Retry or an explicit OFF/local-only download without losing selections. The checkbox is never silently changed. Composer footer and generated README now distinguish local editing from optional activation/transmission. Generated Privacy, Responsible Telemetry Use and Data Dictionary links are absolute Mastery Quests HTTPS URLs. No policy/disclosure version bump or broad portability claim was introduced.

## Verification

New local issuance suite: **24/24**. Composer activation suite: **11/11**. Edge Composer/generated-game suite: **16/16**. The browser used in-memory first-party routing, injected challenge verification and disposable SQLite with all three migrations; no production endpoint or real provider was called.

The Edge flow exercised ON → Generate → real issuance route → generated ZIP/HTML → gameplay → X-MQ-Ingest-Token → 202 → correct event/run/receipt scope and runtime manifests. Exact duplicates returned accepted=0. OFF generation made zero activation/challenge requests; repeated download reused authorization; failure and stale-response paths blocked ON downloads. Gameplay, local CSV and opt-out passed under 403/429/503 and invalid descriptors. A fresh replacement token preserved browser identity and opt-out. Telemetry bodies, rows, runs, receipts, downloaded recipes/manifests and CSVs were checked against in-memory credentials.

| Existing suite | Before | After |
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
| public-browser | 103/103 | 103/103 |
| header-sqlite | 8/8 | 8/8 |
| header-runtime | 8/8 | 8/8 |
| Composer active runners | 27/27 | 27/27 |

The known 37/39 workerd oversized-body result was not rerun or reopened; accepted deployed Stage 2 evidence remains authoritative for that limitation. No existing assertion was weakened. Readiness's initial after-run was 26/27 because its unreadable-config injection marker no longer matched the prefixed descriptor helper. The fixture now asserts one transport marker and injects the same throwing getter there; its full rerun passed 27/27. The initial failed result/log remains preserved. The browser fixture was also corrected to supply the game's existing required synthetic display name.

Local dist rebuilt successfully: ok=true, **151 Concept Review PDFs**, forbiddenFileCount=0, incomingQuestionAssetCount=0. Its explicit file list includes the new Composer modules. Dist was not deployed. git diff --check passes. Final evidence credential-pattern scan is recorded in credential-scan.json; no live usable capability or hash was committed, logged or included in reports. Generated credential-bearing HTML/ZIP existed only in browser-private temporary downloads and process memory, and browser fixtures were closed.

## Boundaries and remaining gate

All public polished games, National Engine, game/question banks, existing beta HTML and prior evidence remain byte-identical to baseline. Source comparison confirms no missing files. Production Worker was not called/deployed/reconfigured; production D1 was not read or written; migration 0003 was not applied to it. Repository capability flags remain false; production CORS, cron 17 4 * * *, 730-day whole-run retention, CSV schema, anonymous envelope schema 3, browser identity semantics, operational/research separation and admin/maintenance authority remain unchanged.

No Stage 3 remote Worker/D1, deployment configuration or tail was created. Cleanup: zero remote resources/tails to retain; local browser and SQLite fixtures closed. Stage 2 resources remain historical deleted resources and were not reused.

**Stage 4 NO-GO.** Remaining prerequisite: supply/provision dedicated real Turnstile staging configuration and complete first-party isolated activation → generated-game → ingest staging proof, including provider live-tail redaction and deletion/absence verification for that new Worker/D1. Real provider/persisted-log behavior is not inferred from mocks or Stage 2 evidence. No arbitrary-host portability test or Stage 4 implementation occurred.

Deployment status: **NOT DEPLOYED TO PRODUCTION**.
