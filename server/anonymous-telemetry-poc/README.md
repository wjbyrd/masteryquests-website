# Private anonymous telemetry Worker

Current measurement contract: mq-measurement/1. Current owner-approved governance/disclosure: mq-governance/2 and mq-disclosure/2. This Worker serves the enabled private classroom/POC path; public Managerial/default Composer games remain local-only.

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
