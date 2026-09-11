# Telemetry governance activation and automatic retention

## Executive Summary

**READY TO ACTIVATE WITH EXTERNAL VERIFICATION PENDING.** The owner's decisions dated **2026-09-10** are encoded in **mq-governance/2** and **mq-disclosure/2**. Raw anonymous application telemetry follows the approved **730-day whole-run policy**, automatically evaluated **daily at 04:17 UTC**. Manual preview/confirmed execution and run-specific deletion remain. The sole initial custodian is the **Project Owner / Telemetry Custodian**; manual maintenance requires ADMIN_TOKEN plus a distinct MAINTENANCE_TOKEN. Internal scheduled execution uses Worker authority without embedded secrets.

Measurement **mq-measurement/1**, tracker semantics, CSV schemas, educational models, questions and modes remain unchanged. Current measurement field counts stay 87 Managerial local, 116 Composer local and 81 private admin export. Governance/disclosure context is added only to the existing optional export sidecar/header workflow. Disclosure-source edits refresh conservative artifact source fingerprints without changing measurement meanings or educational-model fingerprints.

Validation: governance **14/14**, automatic-retention/equivalence/negative **11/11**, Contract 1 **16/16**, backend **16/16**, actual downloads/opt-out **17/17**, private browser **29/29**, public browser **103/103**, disclosure/browser **8 checks plus no-JavaScript**, active Composer **27/27**. All passed. 4949 baseline files were compared: 25 allowed existing files changed, 4924 remained byte-identical.

**Not deployed.** No real cron registration, production D1 access/deletion, learner-record inspection, secret rotation, provider-account access, commit or push occurred. Real provider settings remain unverified. PDF structural accessibility remains a separate pre-paper gate.

## Owner Decisions

The generated [decision worksheet](audit_tools/telemetry_governance/OWNER_DECISIONS.md) and [machine-readable decisions](audit_tools/telemetry_governance/owner-decisions.json) record selection, status, implementation, approval date and governance revision. They derive from the canonical policy source; no personal name is written into telemetry.

| Prior decision area | Status and approved selection |
|---|---|
| Application retention | **RESOLVED** — 730 days, whole runs, latest stored server receipt; project-owner policy, not a legal/institutional requirement |
| Maintenance cadence | **RESOLVED** — automatic daily rolling purge; manual review/execution retained |
| Admin/export custody and separation | **RESOLVED** — Project Owner is sole initial accountable custodian; additional distinct maintenance credential required for manual maintenance |
| Accepted records after opt-out | **RESOLVED** — prospective cancellation only; accepted data stays under normal retention; approved exceptional run deletion remains |
| Ordinary admin/research export files | **RESOLVED** — institution-approved restricted storage, minimum copies/recipients, normal 730-day disposal horizon; longer retention requires separately designated dataset |
| Browser/student download custody | **RESOLVED** — local download is not submission; receiving system/person takes custody upon deliberate submission; course-specific submission requirements; student visibility retained |
| Provider/platform responsibility | **RESPONSIBILITY RESOLVED — EXTERNAL VERIFICATION PENDING** — Project Owner / Platform Custodian assigned; actual account settings not verified |

No resolved owner policy is still marked Pending. Provider verification itself correctly remains pending rather than being inferred from role assignment. The selected policies do not establish institutional, IRB or legal approval.

## Automated Retention

The canonical [governance-policy.mjs](server/anonymous-telemetry-poc/governance-policy.mjs) defines policy/disclosure identities, approved duration, automatic mode, role and daily UTC schedule. The existing renderer generates matching Wrangler variables and triggers.crons. Prepared cron is **17 4 * * *** (04:17 UTC daily), chosen as a stable minute away from the hour boundary. No weekly fallback or different duration was introduced.

Environment must exactly match TELEMETRY_GOVERNANCE_POLICY=mq-governance/2, TELEMETRY_RETENTION_DAYS=730 and TELEMETRY_RETENTION_MODE=automatic. Missing, malformed or contradictory values reject governance operations and scheduled deletion before database work; there is no alternate-duration or manual/disabled fallback. Scheduled context must have the expected cron and a valid nonfuture scheduled timestamp. Cutoff derives from trusted server invocation time, not client data.

The Worker scheduled entry point calls [scheduled-retention.mjs](server/anonymous-telemetry-poc/scheduled-retention.mjs), which calls the existing **govern()** preview and execute paths in [governance.mjs](server/anonymous-telemetry-poc/governance.mjs). It contains no second eligibility SQL or purge algorithm. The original retention selection and transactional deletion SQL are independently compared against the baseline and remain unchanged.

A run expires only when last_received_at is strictly before cutoff and no event has an invalid or at/after-cutoff received_at. Exact-cutoff, straddling, recent, malformed-time and late-receipt runs survive. Incomplete, legacy and current-schema old runs follow the same rule. Duplicate-only batches do not reset stored run/event receipt time; their separate batch receipts retain their own clock. A new event between preview and execution protects the run.

Execution reevaluates eligibility inside a D1 transaction and deletes events, eligible empty run summaries and eligible auxiliary receipt/window data as before. Failure rolls back, reruns are idempotent and overlapping invocations cannot double-delete. The synthetic wrapper serializes batches to model D1 transaction behavior; the Worker does not rely on an in-memory cross-isolate lock. No new migration or audit database was needed.

Daily evaluation is a processing cadence, not an exact-instant expiry promise: a whole run may remain until the next successful daily check after its latest receipt crosses the window. Recent events preserve old prefixes as required. Failure retains data and requires custodian attention; logs/status must be checked after activation. Invalid/orphan age data is not silently guessed away, and future retries can recreate a deleted run. Large-scale query/runtime cost remains an operational check, not a claimed production performance validation.

Bounded reports include governance version, operation ID, source, cutoff, preview eligible runs, actual deleted runs/events/batches/rate windows, and success/failure. Preview and actual counts can differ after concurrent deletion or late receipt. Failure records contain a generic error marker and the handler rejects so the platform can mark failure. No event payload, run/client ID, question data, selected/copied data, identity, secret or raw exception is added to scheduled logs. Manual responses retain reviewed scope/count reporting with source=manual.

Cloudflare's [Cron Trigger documentation](https://developers.cloudflare.com/workers/configuration/cron-triggers/) supports UTC scheduled Worker execution; the [scheduled handler reference](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/) supports awaiting the job and exposing failure. Atomic behavior relies on the existing [D1 batch interface](https://developers.cloudflare.com/d1/worker-api/d1-database/), exercised through local synthetic transactions. No account-specific provider behavior was inferred from these public technical references.

## Access

The Project Owner / Telemetry Custodian alone initially holds admin/export privilege. ADMIN_TOKEN permits routine authenticated summary, anomalies, run/reconstruction, governance inspection and CSV export. Manual retention preview/execute, run deletion and broad cleanup additionally require a distinct MAINTENANCE_TOKEN in x-telemetry-maintenance. Missing/wrong maintenance, equal admin/maintenance values or missing admin fail. Removing maintenance no longer falls back to shared-admin privilege.

Internal scheduled execution needs neither secret and creates no public credential bypass endpoint. Rotating/removing manual credentials does not disable the internal trigger or ingestion; operational suspension requires a separately reviewed trigger/configuration action. No actual credential was provisioned, exposed, read or rotated. Shared credentials do not provide person-level attribution; account/D1 provider access is an external boundary.

## Opt-Out

Collection-control code remains unchanged: disabling future private collection stops new remotely destined events, cancels queued unsent records and retries, and does not replay cancelled records after re-enabling. Local recording/download stays available. Refresh persistence requires available browser storage, with the build setting still authoritative.

Already accepted records remain under the approved normal retention window. Opt-out cannot retract completed/in-flight requests, erase accepted D1 data automatically, or remove downloads, submitted copies or provider backups/logs. Secure confirmed run-specific deletion remains for legitimate approved circumstances. Public Managerial/default Composer continue to transmit no telemetry.

## Export / Research Custody

Ordinary admin/research exports require institution-approved restricted storage, minimum practical copies/recipients and the normal 730-day disposal horizon. The receiving custodian must track copies and apply the disposal decision; no attempt was made to delete local files or control external storage.

Longer retention requires an explicitly separate research dataset. [RESEARCH_DATASET_DESIGNATION.md](audit_tools/telemetry_governance/RESEARCH_DATASET_DESIGNATION.md) records purpose, custodian, dataset/version, creation/export dates, source measurement/governance versions, access, extended retention and disposal approval. There is no automatic keep-forever exemption, and raw D1 telemetry is not exempted for possible future research.

D1 purge does not erase student Download Game Data, faculty/admin CSVs, Canvas/email/institutional submissions, backups/provider logs or designated research datasets. Downloaded copies and raw server records are distinct custody domains.

The existing export helper adds disclosure version to its optional hash-bound sidecar and checks matching Worker headers. The existing offline validator accepts current policy with the approved duration/automatic mode/disclosure, retains legacy governance-1 sidecar support, reports missing/unknown or contradictory context and preserves measurement completeness/mixed-version checks. It does not delete/modify input files, restamp historical rows or claim export-time policy was historical collection policy. No CSV measurement column or envelope was changed.

## Student Transparency

Private/public notices now derive retention and versions from policy. They preserve neutral descriptions of timing, visibility transitions, selection/copy counts and content exclusions; students can inspect their supported Download Game Data, including behavioral fields. No single signal establishes misconduct or intent. No new suspiciousness/violation scoring or surveillance feature was added.

Local download creates a file and does not centrally send it to Mastery Quests. A later deliberate submission transfers custody to the receiving system/person; any submission requirement belongs to course instructions. Clearing browser/site data may erase locally retained progress/telemetry. Default Composer/public Managerial remain local-only; private transmission status is still shown accurately, including after disable/refresh. Current source changes affect future/released artifacts, not already distributed immutable files.

Responsible Telemetry Use keeps field interpretation concise and adds the approved ordinary-export lifecycle and separate-research designation. It does not duplicate the dictionary or present this project policy as a legal requirement.

## Provider Governance

**RESPONSIBILITY RESOLVED — EXTERNAL VERIFICATION PENDING.** [PROVIDER_VERIFICATION.md](audit_tools/telemetry_governance/PROVIDER_VERIFICATION.md) assigns the Project Owner / Platform Custodian and leaves account-specific entries **TO BE VERIFIED BY PLATFORM CUSTODIAN**: verification date, account/project, authorized holders, logging/observability, D1 access, backups/time travel, provider retention, other products, evidence location and next review.

Repository configuration establishes the prepared application schedule, route and D1/rate/origin settings; it does not prove actual registration, account access or provider retention. Aggregate scheduled console reporting is implemented, but its retained availability/access depends on real provider settings. Provider/network metadata may exist separately from application telemetry. No Cloudflare account was accessed or modified.

## Validation

Baseline Git status was clean. Pre-edit checks confirmed governance 1/disclosure 1, frozen measurement 1, and the prior mechanism-ready/owner-decisions-required state. Baseline governance **14/14** and Contract 1 **16/16** passed. A before-state SHA-256 inventory covered **4,949 tracked files**.

| Final gate | Result | Evidence |
|---|---|---|
| Existing governance targeted/negative/CLI | 14/14 PASS | governance-results.json |
| Automatic retention, equivalence, overlap, failures and drift | 11/11 PASS | scheduled-results.json |
| Contract 1 measurements/identity/privacy/transport | 16/16 PASS | contract-results.json |
| Backend/Worker timing and ingestion | 16/16 PASS | backend-results.json |
| Real downloads across 12 Managerial targets + Composer, refresh and opt-out | 17/17 PASS | download-optout-results.json |
| Private browser/Worker | 29/29 PASS | private-browser-results.json |
| Public Managerial modes/behavior/no transmission | 103/103 PASS | public-browser-results.json |
| Responsible-use/disclosure desktop/mobile/keyboard/refresh | 8 checks PASS; no-JavaScript PASS; no exceptions | disclosure-browser-results.json |
| Active Composer | 27/27 PASS | composer-results.log |
| Dictionary/schema, source generation/synchronization and whitespace | PASS | final-checks.json |
| Baseline scope, unchanged gameplay/tracker and canonical retention SQL | PASS | protected-files.json |

All evidence is synthetic/local in [validation_artifacts/telemetry_governance_activation](validation_artifacts/telemetry_governance_activation/README.md). Scheduled operation summaries, dry-run/execute counts and CSV/sidecar examples are retained. The fixed-time fixture includes clearly old and just-before-cutoff runs, exact boundary, straddling/recent, incomplete, legacy/current, invalid time, late new event and old auxiliary records. In the full scheduled fixture, **four runs/five events** and one old batch/window are eligible; repeat invocation deletes zero.

Negative tests prove missing/contradictory config, missing D1, query/transaction failure, invalid/future context/time, wrong cutoff, missing/invalid/equal maintenance credential, absent admin, stale disclosure, missing cron, duplicated scheduler SQL, accidental public transmission, secret sentinel, provider overclaim, false file-deletion wording and sidecar mismatch are detected. Manual/scheduled results match exactly for identical data. Late receipt protects a previously counted run; duplicate-only receipts do not extend raw-event retention. Overlap deletes the eligible set only once.

Existing behavior assertions were retained. Shared synthetic fixtures now consume canonical approved environment values and model serialized D1 batches; former unselected/manual assumptions were updated to the explicit owner policy. No baseline was rewritten to make behavior pass. The protected check confirms **24 allowed existing changes, 4,925 byte-identical files**, including frozen Macro/Micro game/hub content, all Managerial game HTML, banks/answers/graphs/PDFs/LO data, measurement release/schema/runtime/core, applied migrations and previous reports/evidence. The Composer/public/private adapter changes outside disclosure and embedded source registry are forbidden by the check. Canonical retention selection/deletion SQL is unchanged.

## Files Changed

Existing files (25):

- TELEMETRY_GOVERNANCE.md
- audit_tools/managerial_classroom/build.mjs
- audit_tools/managerial_classroom/worker-harness.mjs
- audit_tools/managerial_telemetry_parity/run-parity.mjs
- audit_tools/telemetry_contract/registry.json
- audit_tools/telemetry_contract/validate.mjs
- audit_tools/telemetry_governance/OWNER_DECISIONS.md
- audit_tools/telemetry_governance/README.md
- audit_tools/telemetry_governance/admin.mjs
- audit_tools/telemetry_governance/browser.mjs
- audit_tools/telemetry_governance/check.mjs
- audit_tools/telemetry_governance/owner-decisions.json
- audit_tools/telemetry_governance/render.mjs
- build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html
- how-to/responsible-telemetry-use/index.html
- play/managerial-directorate-classroom/index.html
- play/managerial-directorate-classroom/telemetry-client.js
- play/managerial-directorate-telemetry-poc/telemetry-client.js
- play/managerial-intelligence-directorate/local-telemetry.js
- privacy/index.html
- server/anonymous-telemetry-poc/README.md
- server/anonymous-telemetry-poc/governance-policy.mjs
- server/anonymous-telemetry-poc/governance.mjs
- server/anonymous-telemetry-poc/worker.mjs
- server/anonymous-telemetry-poc/wrangler.jsonc

New maintained files:

- FINAL_REPORT_telemetry_governance_activation.md
- audit_tools/telemetry_governance/PROVIDER_VERIFICATION.md
- audit_tools/telemetry_governance/RESEARCH_DATASET_DESIGNATION.md
- audit_tools/telemetry_governance/activation-scope.mjs
- audit_tools/telemetry_governance/scheduled-check.mjs
- audit_tools/telemetry_governance/test-fixture.mjs
- server/anonymous-telemetry-poc/scheduled-retention.mjs

New synthetic evidence is confined to validation_artifacts/telemetry_governance_activation/. Its exact inventory is evidence-files.json. Historical reports/evidence are preserved. The backend README was updated because its old provisioning, shared-token cleanup and schema-2 instructions conflicted with current activation; it now points to the approved sequence and preserves historical references.

## Deployment Plan

**Prepared only; do not infer remote activation from these files.** Exact maintained instructions: [governance operator guide](audit_tools/telemetry_governance/README.md).

1. Review resolved owner decisions, current policy/disclosure and provider/research checklists.
2. Run node audit_tools/telemetry_governance/render.mjs --check. Confirm telemetry Wrangler vars are TELEMETRY_GOVERNANCE_POLICY=mq-governance/2, TELEMETRY_RETENTION_DAYS=730, TELEMETRY_RETENTION_MODE=automatic, with triggers.crons containing only the canonical daily UTC expression. No new migration is needed.
3. Provision/verify ADMIN_TOKEN through the approved secret channel; only after separate authorization use the protected prompt command below.
4. Provision/verify a distinct MAINTENANCE_TOKEN similarly. Do not place values in arguments/source/evidence.
5. After separate deployment approval, deploy the telemetry Worker with its prepared schedule. This can start real eligible deletion at its next scheduled invocation; review that consequence before deploying.
6. Publish revised static disclosures, policy guidance and derived adapters through the established website release path, keeping frozen games unchanged.
7. With approved operator environment credentials, inspect the governance endpoint through the CLI and compare identity, disclosure, duration, mode and schedule.
8. Platform custodian verifies actual Cron Trigger registration and execution status in the provider account, including propagation and accessible bounded logs.
9. Run a **non-destructive** remote retention preview with both admin and maintenance authorization; review cutoff/counts.
10. Perform an approved synthetic/private smoke test for notice, opt-out, downloads and export context.
11. Confirm public/default games remain local-only and student downloads remain available; retain deployment/provider evidence.

Commands below are reviewed instructions, **not executed**:

```text
npx wrangler secret put ADMIN_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc
npx wrangler secret put MAINTENANCE_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc
npx wrangler deploy --config server/anonymous-telemetry-poc/wrangler.jsonc
node audit_tools/telemetry_governance/admin.mjs policy
node audit_tools/telemetry_governance/admin.mjs retention
```

The CLI reads MQ_ADMIN_ENDPOINT (approved HTTPS base ending /api/anonymous-telemetry-poc), MQ_ADMIN_TOKEN and MQ_MAINTENANCE_TOKEN from a private operator environment. Manual confirmed purge and UUID deletion commands remain documented; they are not required for the non-destructive activation preview. No remote preview, actual token operation or production purge occurred.

## Pre-Paper Readiness

Remaining gates: real deployment/trigger/smoke evidence, actual provider/account logging/access/backup/retention verification by the assigned custodian, applicable institutional/research procedures, and **PDF structural accessibility**. Those gates remain explicit; the paper and resource PDFs were not edited. No FERPA compliance, IRB/institutional/legal approval or stronger anonymity claim is made.

## Final Verdict

**READY TO ACTIVATE WITH EXTERNAL VERIFICATION PENDING.** Owner policy decisions are resolved and the local implementation/regressions pass. Actual provider verification and the separately authorized deployment sequence remain outstanding; this task did not activate any remote service or delete real data.
