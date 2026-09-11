# Governance operator and maintenance guide

Read TELEMETRY_GOVERNANCE.md and OWNER_DECISIONS.md before activation. Canonical policy/defaults are server/anonymous-telemetry-poc/governance-policy.mjs. These tools never automatically deploy, rotate credentials or invoke a remote operation. Tests use only in-memory SQLite with applied existing migrations and a D1-compatible batch wrapper.

## Validate locally

From the repository root, with Node and Playwright/Edge available:

```text
node audit_tools/telemetry_governance/render.mjs --check
node audit_tools/telemetry_governance/check.mjs
node audit_tools/telemetry_governance/browser.mjs
node audit_tools/telemetry_contract/check.mjs
node audit_tools/telemetry_contract/browser.mjs
node audit_tools/managerial_telemetry_parity/run-parity.mjs
node audit_tools/managerial_telemetry_parity/run-browser.mjs
node audit_tools/published_managerial_parity/browser.mjs
node build/faculty-build-composer/tests/run_active_composer_suite.js
```

Set MQ_EVIDENCE_DIR to a new output location and PLAYWRIGHT_MODULE if needed. Do not overwrite historical evidence. Governance rendering updates notices only, then run contract generate.mjs and sync-composer-behavior.mjs to refresh actual source fingerprints and derived adapters. Measurement release/schema/runtime remain frozen. Dictionary render.mjs --check verifies unchanged field content.

## Reviewed deployment/configuration sequence — NOT executed

1. Record owner approvals: duration, manual operational responsibility, access/maintenance custodians, accepted-data treatment, export disposal, local custody notice and provider log/backup responsibility. Update governance/disclosure version and approved wording as needed. Do not activate merely because tests pass.
2. Configure TELEMETRY_RETENTION_DAYS as the approved positive integer string and TELEMETRY_RETENTION_MODE as manual in the telemetry Worker's reviewed deployment environment/configuration. Leaving days absent refuses time purge; disabled refuses time purge even with days. No schedule is installed. Keep secrets out of vars. Resolve public/course notice alignment with the actual deployed policy before release.
3. For approved secret provisioning/rotation, from repository root: npx wrangler secret put ADMIN_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc. Enter the value at the protected prompt, not in command history/source. Optional write separation: npx wrangler secret put MAINTENANCE_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc. These commands change real secrets and require separate owner authorization; none was run here.
4. To revoke all application admin access after approval: npx wrangler secret delete ADMIN_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc. Ingestion is independent. To revoke maintenance holders, rotate MAINTENANCE_TOKEN to a withheld value; deleting it reverts to shared-admin capability. Verify effective access and distribute replacement credentials only through the approved secret channel.
5. Deploy the reviewed telemetry Worker only after separate approval: npx wrangler deploy --config server/anonymous-telemetry-poc/wrangler.jsonc. No D1 migration is required. Publish the reviewed static notices/derived clients through the established website release process; frozen Macro/Micro files remain unchanged. Verify the actual production configuration and disclosure before institutional/research activation.
6. In a private operator environment set MQ_ADMIN_ENDPOINT to the approved HTTPS base ending /api/anonymous-telemetry-poc, MQ_ADMIN_TOKEN from approved secret storage, and MQ_MAINTENANCE_TOKEN if separation is configured. Do not include credentials in endpoint URLs. The CLI rejects redirects and insecure nonlocal endpoints. Run node audit_tools/telemetry_governance/admin.mjs policy and compare current settings to approval.
7. Preview: node audit_tools/telemetry_governance/admin.mjs retention. Review cutoff and counts. Only after explicit operator approval execute: node audit_tools/telemetry_governance/admin.mjs retention --execute --cutoff <reviewed-UTC-ISO-cutoff> --confirm PURGE_EXPIRED_RUNS. The angle-bracket values are placeholders to replace, not shell syntax to copy literally. Save returned operation/count report in the approved administrative record location. Rerun preview to verify the remaining state. No remote preview or execute was run here.
8. Targeted deletion: node audit_tools/telemetry_governance/admin.mjs delete-run --run-id <UUID> previews only. Execute adds --execute --confirm DELETE_RUN:<same-lowercase-UUID>. Verify scope before invocation. No client/person lookup is provided.

Scheduling is not activated. If the owner later authorizes it, an external authorized runner could invoke the same reviewed mechanism and retain reports; approve cadence, credential custody, failures and notices first. This release intentionally accepts only manual/disabled modes.

## Exports and validator

The admin export tool takes --build-id <controlled-build-id>, optional --include-synthetic and --output <new-file.csv>. It saves a separate .governance.json with CSV SHA-256, current policy, timestamp and scope; it refuses to overwrite existing files. No token, URL or local path enters the sidecar. Direct existing browser/API CSV exports remain compatible and simply lack this optional retained sidecar. Export helper policy headers must match its policy fetch or it refuses the export.

```text
node audit_tools/telemetry_governance/admin.mjs export --build-id managerial-directorate-classroom --output reviewed-export.csv
node audit_tools/telemetry_contract/validate.mjs reviewed-export.csv validation.json reviewed-export.csv.governance.json
```

The existing validator is reused. Governance context does not restamp measurement rows or enforce a deletion policy on local files. The sidecar is an integrity/context aid, not a signed assertion of historical policy. CSV and sidecar files are now the recipient's custody responsibility.

## Provider documentation consulted

D1 executes batched statements transactionally; the implementation tests rollback and uses prepared bindings: [D1 database API](https://developers.cloudflare.com/d1/worker-api/d1-database/). Credential provisioning/rotation/revocation use the existing mechanisms: [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/) and [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/). Repository configuration alone does not establish actual provider logging/retention or backup behavior. These references are technical documentation, not compliance approval.
