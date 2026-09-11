# Approved governance operations — revision 2

Read TELEMETRY_GOVERNANCE.md and resolved OWNER_DECISIONS.md. Canonical policy is server/anonymous-telemetry-poc/governance-policy.mjs. The renderer derives owner decisions, public/private disclosures and telemetry Wrangler vars/cron from that source. No secret belongs in source or vars.

## Local validation and regeneration

```text
node audit_tools/telemetry_governance/render.mjs
node audit_tools/telemetry_contract/generate.mjs
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs
node audit_tools/telemetry_governance/render.mjs --check
node audit_tools/telemetry_governance/check.mjs
node audit_tools/telemetry_governance/scheduled-check.mjs
node audit_tools/telemetry_governance/browser.mjs
node audit_tools/telemetry_contract/check.mjs
node audit_tools/telemetry_contract/browser.mjs
node audit_tools/managerial_telemetry_parity/run-parity.mjs
node audit_tools/managerial_telemetry_parity/run-browser.mjs
node audit_tools/published_managerial_parity/browser.mjs
node audit_tools/telemetry_data_dictionary/check.mjs
node build/faculty-build-composer/tests/run_active_composer_suite.js
```

Set MQ_EVIDENCE_DIR to fresh local output, PLAYWRIGHT_MODULE if needed. Tests apply existing migrations only to synthetic in-memory SQLite with serialized transactional batches. No production binding is used. Changes to disclosure source refresh source fingerprints but do not change measurement semantics. Do not regenerate frozen games or overwrite prior reports/evidence.

## Exact activation order — prepared, NOT executed

1. Review the resolved owner decisions dated 2026-09-10, current governance/disclosure versions, provider checklist and research-dataset boundary. The Project Owner is the sole initial telemetry and platform custodian.
2. Run renderer --check and inspect server/anonymous-telemetry-poc/wrangler.jsonc. Its generated governance identity, duration and automatic mode must exactly match the policy source; triggers.crons must match the canonical daily UTC expression. No environment override may silently change the approved duration/mode. Missing/contradictory settings fail closed. No migration is required.
3. Through approved secret handling, provision or verify ADMIN_TOKEN. If separately authorized to provision/rotate, from repository root: npx wrangler secret put ADMIN_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc. Enter values only at the protected prompt, never as arguments, URL, documentation or source.
4. Provision/verify a distinct MAINTENANCE_TOKEN with npx wrangler secret put MAINTENANCE_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc. Both are required for manual maintenance; routine reads/export need only admin. Neither secret is needed by the internal scheduled entry point. Never use identical values.
5. Only after separate deployment authorization: npx wrangler deploy --config server/anonymous-telemetry-poc/wrangler.jsonc. This registers the prepared trigger and can begin deleting eligible real data at its next invocation. Review that consequence before this command. No deployment or real deletion occurred during development.
6. Publish revised static disclosures/governance guidance and derived clients through the established site release process, preserving frozen Macro/Micro bytes.
7. In an approved private operator environment set MQ_ADMIN_ENDPOINT to the HTTPS base ending /api/anonymous-telemetry-poc and MQ_ADMIN_TOKEN from approved secret storage. Set MQ_MAINTENANCE_TOKEN only for maintenance operations. Run node audit_tools/telemetry_governance/admin.mjs policy and verify policy, disclosure, automatic mode, duration, schedule and role against the source. Do not print or store secret values in evidence.
8. The platform custodian verifies actual trigger registration and subsequent execution status in the provider account, records evidence and completes the logging/access/backup checklist. Allow provider propagation; code/config alone is not remote registration evidence.
9. Run a NON-DESTRUCTIVE preview: node audit_tools/telemetry_governance/admin.mjs retention. Review cutoff/eligible counts against the approved policy. This task did not run a remote preview. Routine preview uses the protected maintenance route and both credentials.
10. Perform the approved synthetic/private smoke test and check current notice, opt-out, local download, export headers/sidecar and accepted-data handling. Do not use learner records for smoke tests.
11. Verify public Managerial/default Composer remain local-only and Download Game Data remains available. Record deployment/provider evidence before institutional/research or paper-ready claims.

The schedule is daily UTC, as shown in canonical policy/renderer output. Scheduled calls preview then execute the same govern() logic, with aggregate bounded reports and failure rejection. No separate purge SQL or credential bypass route exists. If a failure must be investigated, use policy inspection and non-destructive preview, then review provider status. To suspend a deployed faulty trigger, the custodian must separately authorize configuration/deployment changes. Removing admin/maintenance credentials does not stop the internal schedule or ingestion.

## Manual operations retained

After reviewing a preview, explicit manual purge remains: node audit_tools/telemetry_governance/admin.mjs retention --execute --cutoff <reviewed-UTC-ISO-cutoff> --confirm PURGE_EXPIRED_RUNS. The angle-bracket text is a placeholder, not literal shell syntax. Run deletion: node audit_tools/telemetry_governance/admin.mjs delete-run --run-id <UUID> previews; add --execute --confirm DELETE_RUN:<same-lowercase-UUID> only after review. Cross-scope fields, malformed IDs/cutoffs and missing confirmation are rejected. The broad legacy cleanup remains protected and whole-run safe.

For approved revocation, npx wrangler secret delete MAINTENANCE_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc blocks manual maintenance; there is no fallback. Deleting ADMIN_TOKEN similarly blocks application admin routes. These are real secret operations requiring separate authorization and were not run here. Scheduled internal retention and provider account access are distinct capabilities.

## Export context

```text
node audit_tools/telemetry_governance/admin.mjs export --build-id managerial-directorate-classroom --output reviewed-export.csv
node audit_tools/telemetry_contract/validate.mjs reviewed-export.csv validation.json reviewed-export.csv.governance.json
```

The helper refuses existing output paths, redirects and insecure nonlocal endpoints. It writes unchanged CSV plus a SHA-256-bound sidecar with current governance/disclosure, measurement identity, retention and scope/time. The existing validator recognizes current and legacy policy context; it never deletes/modifies its input or assigns current policy to old events. The sidecar is not a signature or guarantee of complete historical collection. Ordinary exports follow the approved disposal horizon in restricted storage; longer retention needs RESEARCH_DATASET_DESIGNATION.md completed separately. D1 purge does not delete files/submissions/backups.

## Technical references and external limits

[Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) define UTC schedules; [scheduled handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/) supports awaiting the job and surfacing rejection. [D1 batch API](https://developers.cloudflare.com/d1/worker-api/d1-database/) supplies transactional execution. [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/) describes protected credential configuration. These technical references do not verify account-specific retention/logging or establish institutional approval. Provider verification and PDF structural accessibility remain separate pre-paper gates.
