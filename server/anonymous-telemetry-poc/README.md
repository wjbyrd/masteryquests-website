# Private anonymous telemetry Worker

Current measurement contract: mq-measurement/1. Current owner-approved governance/disclosure: mq-governance/2 and mq-disclosure/2. This Worker serves explicitly enabled private classroom/POC and generated Composer builds. Public Managerial and default Composer builds remain local-only. A separate legacy National Engine identifying transport is outside this anonymous D1 system and is unchanged.

## Faculty permission and build-scoped transport

Composer's **Allow anonymous data collection** checkbox defaults OFF. Its strict boolean `allowAnonymousDataCollection` is preserved in the existing recipe and generated FACULTY_COMPOSITION_CONFIG, never sent as an event field or added to the measurement manifest allowlist. Only boolean true includes the maintained generated adapter; its runtime also checks the setting. Missing, malformed, unknown or unreadable permission/build identity/storage fails closed. A browser can restrict collection but cannot enable an OFF build. Opt-out cancels pending events and retries; re-enable is prospective. Local Download Game Data continues in every state.

Private builders accept explicit options, default disabled:

```text
node audit_tools/anonymous_telemetry_poc/create_private_build.mjs .
node audit_tools/managerial_classroom/build.mjs .
```

For a deliberately enabled private QA/release artifact add `--allow-anonymous-data-collection`. Programmatic classroom generation uses `instrumentHTML(root, game, {allowAnonymousDataCollection:true})` or `build(root, options)`. Output meta explicitly says enabled/disabled. These are local build commands, not deployment. Recheck/generate the contract registry and derived adapters after local generation:

```text
node audit_tools/telemetry_contract/generate.mjs
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs
node audit_tools/telemetry_governance/composer-transport.mjs
```

Composer transport derives from the existing private adapter, using Composer's existing local measurements; it does not install another measurement tracker. It sends to the fixed Mastery Quests HTTPS endpoint. POC retains its existing QA endpoint controls. Classroom has no endpoint override.

Client ID, queue, sequence, active-run mapping, quality and browser opt-out use a v2 namespace. For private games it combines existing buildId and measurement buildRevision. For Composer it uses the existing compositionFingerprint and measurement buildRevision, with `composer-<compositionFingerprint>` in existing buildId. Identical recipe/artifact regeneration is the same logical build; different configurations/artifact revisions are isolated. No new course or identity field. A pseudonym is not a unique student.

An old restrictive browser opt-out is carried forward until explicitly re-enabled. Old family-scoped UUIDs/queues are not adopted, rewritten or replayed by the new client; they remain dormant local historical state. Existing central records are untouched. A valid current queue retains original event/client IDs across retries/reloads; inconsistent or malformed current state cancels transport and fails closed rather than relabeling events. Clearing storage produces a new UUID. D1 retention remains 730-day whole-run.

## Operational limits and spreadsheet-safe export

The owner accepts unauthenticated anonymous ingestion for operational analytics. CORS controls browser origins, not authentication; client UUIDs can change. The 300-event/client/minute limit is best effort, including a non-atomic reservation boundary. `transport-safety.mjs` accepts integer limits 50–10,000; any invalid/out-of-range value uses 300, never NaN/unlimited. This does not add student authentication, device fingerprints or tamper-proof claims. Do not base high-stakes decisions on these signals alone.

Admin CSV serialization prefixes dangerous string cells with an apostrophe (formula prefixes after whitespace, or leading tab/CR/LF). Numbers, stored D1 values and local gameplay exports are unchanged. CSV is a spreadsheet-facing safe representation, not byte-identical malicious raw text; do not strip the prefix on import. Existing `/v1/admin/runs/<UUID>` JSON provides raw structured values when needed. The governance sidecar hashes the exact emitted safe CSV. Columns and contract versions are unchanged. Spreadsheet applications/import settings vary; import untrusted text as text.

See [activation runbook](PRODUCTION_ACTIVATION_RUNBOOK.md) for conditional release/rollback and provider checks. Worker-only activation does not require a root-site deployment or National Engine edit. A later Composer/static release must preserve National Engine unchanged and must not claim universal public local-only behavior.

## Current activation instructions

Use [the governance operator guide](../../audit_tools/telemetry_governance/README.md) and [approved owner decisions](../../audit_tools/telemetry_governance/OWNER_DECISIONS.md). Canonical policy is governance-policy.mjs; generated Wrangler vars and cron must match it. The current D1 binding already exists in repository configuration. This governance release requires no new database or migration; do not repeat historical provisioning/migration instructions as part of activation.

The prepared daily Worker trigger calls scheduled-retention.mjs, which uses the same govern() preview/execute logic as manual retention. It enforces the approved whole-run policy using server receipt time. The schedule and duration are defined in the canonical policy and generated Wrangler configuration, not duplicated here. No remote trigger or deployment was registered in this task.

## Access and routes

Every HTTP /v1/admin/* route requires ADMIN_TOKEN. Manual maintenance additionally requires a distinct MAINTENANCE_TOKEN in x-telemetry-maintenance; there is no fallback. Routine read/export does not require maintenance capability. Successful admin responses are no-store/noindex. Never embed credential values in games, source, URLs, logs or exported files. Internal scheduled execution does not use an embedded secret and has no public bypass route.

- POST /v1/events: existing validated private ingestion (also under /api/anonymous-telemetry-poc); public health contains no records.
- GET /v1/admin/governance: approved current policy/disclosure and environment consistency.
- GET /v1/admin/summary, /v1/admin/anomalies: existing administrative summaries/quality indicators.
- GET /v1/admin/runs/{runId} and /reconstruct: existing ordered events and reconstruction.
- GET /v1/admin/export.csv: current unchanged CSV schema; optional buildId/includeSynthetic filters. Current governance/disclosure/retention headers support the CLI's optional hash-bound sidecar.
- POST /v1/admin/retention: dry-run by default; explicit reviewed cutoff and PURGE_EXPIRED_RUNS confirmation for manual execution.
- POST /v1/admin/delete-run: UUID preview; explicit DELETE_RUN:<UUID> confirmation for deletion.
- POST /v1/admin/cleanup: existing synthetic/build scopes, preview/execute and explicit DELETE compatibility; whole-run selection preserves mixed runs.

Ingestion still enforces origins, rate/body/batch limits, UUIDs, supported envelopes and typed allowlists. Current envelope 3 retains legacy 1/2 support. New governance context does not add telemetry measurements or CSV columns. The existing telemetry-core.mjs and measurement-contract.mjs remain the authoritative field validation; extras_json persists permitted metadata.

## Boundaries and history

Prospective opt-out cancels pending transmission but accepted records remain subject to normal retention. Application deletion does not erase downloads, submissions, backups/provider logs or separately designated research datasets. Provider-account verification remains external; see PROVIDER_VERIFICATION.md in governance tooling. No actual provider setting or secret was inspected/changed.

Historical implementation detail is retained in [Contract 1 report](../../FINAL_REPORT_telemetry_contract_hardening.md), [governance mechanism report](../../FINAL_REPORT_telemetry_governance.md), [parity report](../../FINAL_REPORT_managerial_telemetry_parity.md), and [POC stabilization report](../../validation_artifacts/anonymous_telemetry_poc/STABILIZATION_REPORT.md). Their historical deployment instructions do not replace the current activation sequence. Applied migrations are unchanged.
