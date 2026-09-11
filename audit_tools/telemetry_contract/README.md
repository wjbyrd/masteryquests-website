# Maintained measurement contract tooling

Read [the contract](../../TELEMETRY_CONTRACT.md) and [release report](../../FINAL_REPORT_telemetry_contract_hardening.md). The requirement matrix is [requirements.json](requirements.json); ordered stream schemas and per-field definitions/applicability are [schema.json](schema.json). New metadata component definitions and necessity/privacy rationale are in [additions.md](additions.md).

Canonical release identities live only in release.json; generate.mjs creates registry.json, embeds runtime.js and derives hash.mjs. The existing private client is the maintained Managerial adapter; classroom and public clients are generated. Do not edit embedded copies. Changing a semantic meaning requires reviewing the measurement revision even if headers are unchanged. Retain the released registry and controlled generated HTML/authoring artifacts.

From the repository root, with Node available:

```text
node audit_tools/telemetry_contract/generate.mjs
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs
node audit_tools/telemetry_data_dictionary/render.mjs
node audit_tools/telemetry_contract/generate.mjs --check
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs --check
node audit_tools/telemetry_contract/inventory.mjs
node audit_tools/telemetry_data_dictionary/check.mjs
node audit_tools/anonymous_telemetry_poc/create_private_build.mjs . --check
node audit_tools/telemetry_contract/check.mjs
node audit_tools/telemetry_contract/browser.mjs
node build/faculty-build-composer/tests/run_active_composer_suite.js
node audit_tools/telemetry_contract/validate.mjs export.csv report.json
```

Set MQ_EVIDENCE_DIR to a fresh output directory for targeted/browser runners. Set PLAYWRIGHT_MODULE to an installed Playwright module; browser fixtures use Edge headlessly and synthetic local Worker/D1 fixtures. The active Composer suite isolates its output. Do not regenerate frozen games or overwrite historical evidence. scope.mjs accepts a baseline SHA-256 inventory and an output JSON path and checks all baseline files plus the twelve exact allowed engine integrations.

The CSV validator performs no upload and does not edit its input. PASS can include limitations (legacy provenance or unobserved completion); NEEDS_REVIEW identifies findings; UNSUPPORTED_SCHEMA stops interpretation. Exit 1 means findings/unsupported input, exit 2 means missing arguments. It parses quoted multiline CSV and emits JSON plus a short human summary. It is the reusable core of planned export QA; study-specific analysis and bank reconstruction remain separate.

If deployment is separately authorized: release the Worker validator before schema-3 private clients, then the static adapters/Composer and generated dictionary. Existing extras_json accommodates the additions; no migration is needed. Public/default Composer remain local-only. This task performs no deployment.
