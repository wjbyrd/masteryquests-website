# Mastery Quests approved telemetry governance

Governance **mq-governance/2**; disclosure **mq-disclosure/2**; owner approval **2026-09-10**. Measurement **mq-measurement/1** remains unchanged. Canonical values, role and cadence live in [governance-policy.mjs](server/anonymous-telemetry-poc/governance-policy.mjs), with generated deployment configuration, decisions and notices. This is the project owner's policy, not a legal or institutional requirement. **Prepared locally; not deployed.**

## Policy and architecture

Measurement contract → approved governance policy → local/private collection/storage → authenticated access → automatic/manual retention → export and recipient custody.

Raw anonymous application telemetry has a **730-day whole-run retention window**, measured from latest stored server receipt. Eligible runs are evaluated daily at **04:17 UTC** using the Cloudflare Worker Cron Trigger. This minute is a stable technical scheduling choice, away from the hour boundary, not a different retention policy. Daily processing means deletion occurs at the next successful evaluation after eligibility, not at an exact per-event anniversary. Recent events preserve the whole run. Failed jobs retain data and must be investigated by the custodian; no uptime/absolute-expiry guarantee is made.

The approved runtime environment is generated from the canonical policy: TELEMETRY_GOVERNANCE_POLICY identifies this release, TELEMETRY_RETENTION_DAYS matches its duration and TELEMETRY_RETENTION_MODE is automatic. All three must match exactly. Missing, malformed or contradictory values reject governance operations and scheduled purge before deletion. There is no shorter-duration fallback or secret-dependent internal scheduler. To suspend a faulty deployment, the custodian must separately review trigger/code/config changes; this release does not silently accept a policy-contradicting mode.

## Data classification and custody domains

| Class | Purpose/location | Transmission and linkability | Access, retention/deletion and visibility |
|---|---|---|---|
| Local game telemetry | Browser progress, reports, interaction records and downloaded CSV | Public Managerial/default Composer remains local-only; browser profile and file holders may see local state | Existing local storage/caps and site-data clearing; student Download Game Data retained. Scheduled D1 purge does not touch the browser or files |
| Private anonymous telemetry | Enabled classroom/POC Worker/D1 events and run summaries; auxiliary batch/window records | Existing random browser UUID can link runs but is not verified personal identity | Project Owner / Telemetry Custodian initially holds admin/export access. Whole-run retention, confirmed deletion and auxiliary age cleanup apply |
| Run/build/configuration provenance | Immutable analytical manifests/digests in local CSV/private extras_json | Run/segment-linked configuration; no new personal identity or raw question/answer content | Follows containing event/export; controlled authoring/build artifacts are separately retained for reconstruction |
| Content references | Question/concept/outcome/resource IDs | Link through game and bank revision; no new public answer-key endpoint | Follows event/export copy; dictionary remains field reference; content/PDFs unchanged |
| Infrastructure metadata | Provider/network request, diagnostic and account records outside application tables | Provider settings/access differ; request metadata may exist | Project Owner / Platform Custodian must verify actual logging, D1 access/backups and provider retention. Application purge does not erase these systems |

No copied/selected content, clipboard contents, keystrokes, screenshots, unrelated-tab URLs/history, personal identity, browser fingerprint or cross-device tracking was introduced. Existing local saved display state remains local. Role names do not enter telemetry rows.

## One retention implementation

[governance.mjs](server/anonymous-telemetry-poc/governance.mjs) is the sole eligibility, cutoff validation, transactional deletion and auxiliary-cleanup implementation. [scheduled-retention.mjs](server/anonymous-telemetry-poc/scheduled-retention.mjs) calls its preview and execute paths; it has no second SQL eligibility rule. Manual tools call the same implementation. Scheduled cutoff uses trusted Worker server time; malformed/future scheduled context is rejected. Client event_timestamp is not the expiration clock.

Eligibility requires run last_received_at strictly before cutoff and no stored event with invalid received_at or received_at at/after cutoff. Exact cutoff, straddling, newer or malformed-time runs survive. Legacy/current/incomplete runs follow the same rule. Duplicate-only batches do not extend stored event/run receipt timestamps; their separate receipts retain their own age. A late new receipt before transactional execution protects the run, even after an earlier preview counted it. Orphan/invalid data is not guessed away by age purge; explicit UUID deletion can target orphan events.

Dry-run reports cutoff and eligible run/event/auxiliary counts without deleting. Manual execute still requires reviewed cutoff and confirm=PURGE_EXPIRED_RUNS. A D1 batch atomically rechecks eligibility and deletes events then their empty eligible run summaries, plus old auxiliary records. On failure it rolls back. Concurrent batches remain safe through transactional reevaluation; there is no in-memory lock claiming to coordinate Worker isolates. Repeated jobs may report zero. Preview eligible counts are a pre-execution observation; actual deleted counts may be lower after a concurrent job or new arrival.

Old ingest-batch receipts and rate-limit windows use their own server receipt/window clock with the same cutoff; they lack run membership. Run/build deletion does not delete unrelated receipts. A later retry/new event can recreate a deleted run; deletion is not a permanent collection block or identity blacklist. Large-scale query cost and provider runtime limits remain operational checks; a timed-out/failed job is not a successful purge.

## Operations and access

The sole initial accountable holder is **Project Owner / Telemetry Custodian**. ADMIN_TOKEN authorizes routine summary, anomalies, run records, reconstruction, governance inspection and export. Manual retention preview/execute, cleanup and run deletion require ADMIN_TOKEN **and a distinct MAINTENANCE_TOKEN** in the maintenance header. Missing, wrong, equal-to-admin or removed maintenance credentials fail closed. There is no shared-admin fallback. No complex person/RBAC system or identity lookup was added.

The internal scheduled Worker entry point uses platform execution authority, not a source-embedded token or publicly reachable bypass. It can operate without either secret; all HTTP admin routes retain their credential checks. No credential value is included in source, reports, URLs, client code, logs or exported sidecars.

Scheduled reporting includes governance version, operation ID, scheduled source, cutoff, preview eligible runs, actual deleted run/event/auxiliary counts and success/failure. It excludes run/client IDs, payloads, question data and raw exceptions. Failure emits a bounded error marker and rejects the handler promise so the platform sees failure. Manual operation response includes source=manual and existing reviewed scope/counts. No new surveillance or person-attributed audit database exists. Log availability/retention is subject to provider settings and must be verified externally.

ADMIN_TOKEN rotation/revocation affects routine access; MAINTENANCE_TOKEN rotation/revocation independently affects manual maintenance. Removing maintenance credentials now blocks manual maintenance rather than reverting privilege. Rotating/removing either token does not itself stop scheduled internal retention or public ingestion. The custodian must separately control a deployed trigger if pausing it is necessary. Shared credentials do not identify which person made a request; only the initial custodian is authorized to hold them.

## Prospective opt-out

Disabling future private collection stops new remotely destined events, cancels pending unsent events/retries and does not replay cancelled data after re-enabling. Local recording and supported Download Game Data remain. Persistence across refresh depends on browser storage; cleared/unavailable storage cannot preserve a previous choice, and the build-level setting remains authoritative.

Already accepted records remain under the normal approved retention policy. Opt-out does not erase accepted/completed requests, downloaded/submitted copies or provider logs/backups. Secure confirmed run-specific deletion remains available for legitimate approved circumstances. Current collection-control logic is unchanged; no new public/default-Composer transmission is enabled.

## Student shared visibility and responsible use

Students can inspect/download their own supported telemetry, including behavioral timing/visibility/selection/copy fields. Download creates a local file; it does not centrally submit it. A later Canvas/email/institutional-storage submission transfers custody to the receiving person/system. Any requirement to submit is course-specific, not a universal Mastery Quests requirement. Clearing site data may erase retained progress and telemetry. No behavioral fields are hidden because faculty might review them.

The privacy notice and Responsible Telemetry Use guide retain neutral interpretation: visible-document time is not attention/cognition; hidden and unfocused time can overlap; tab changes do not reveal destinations; copy/selection counts do not record content or purpose. No single signal proves misconduct or intent. Automated cheating scores, single-field accusations and unsupported intent inference are discouraged. Contextual assessment QA, participation patterns, response-time comparison and remediation research remain possible under appropriate procedures.

## Export and separately designated research custody

Ordinary admin/research exports use institution-approved restricted storage, minimum practical copies/recipients, and a normal **730-day disposal horizon**. Record the disposal decision/date and custody for each dataset/copy. D1 cannot automatically enforce this on local files or receiving systems; the custodian/recipient must dispose of copies through those systems. This policy does not silently extend a file's lifecycle by copying it.

A dataset needed longer must be **separately designated**, with purpose, custodian, dataset/version, creation date, source measurement/governance versions, access boundary, extended retention and disposal decision. Use [RESEARCH_DATASET_DESIGNATION.md](audit_tools/telemetry_governance/RESEARCH_DATASET_DESIGNATION.md). This is not a keep-forever switch or an exemption for raw D1 telemetry. No local files, research datasets, Canvas submissions, institutional/provider backups or provider logs are deleted by scheduled purge.

The existing export helper stores unchanged CSV plus an optional hash-bound governance sidecar with current policy/disclosure, retention and export scope/time. The existing offline validator recognizes current and legacy governance sidecars, missing/unknown policy, hash mismatch and policy contradiction. It does not restamp historical events, enforce retention on files or prove historical policy/identity. CSV schemas and the measurement contract remain unchanged.

## Provider responsibility and readiness

**RESPONSIBILITY RESOLVED — EXTERNAL VERIFICATION PENDING.** Project Owner / Platform Custodian must verify actual Cloudflare account holders, logging/observability, D1 access, backup/time-travel behavior and provider retention. See [PROVIDER_VERIFICATION.md](audit_tools/telemetry_governance/PROVIDER_VERIFICATION.md). No account-specific fact was inferred or remotely inspected.

Repository configuration establishes the Worker route, D1 binding, rate/origin settings and prepared Cron Trigger. It does not establish all provider/network logging or retained backups. Scheduled aggregate console reporting is newly explicit; actual provider retention/access is still external. No legal, institutional, FERPA or IRB approval is claimed.

Local implementation is ready for the reviewed activation sequence, with external provider verification pending. No deployment, remote cron registration, production D1 operation, credential change or commit/push occurred. Pre-paper gates still include provider/account verification, deployment/smoke evidence, applicable institutional/research procedures and **PDF structural accessibility**. The paper and PDFs were not modified.
