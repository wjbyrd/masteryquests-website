# Unified RPG local reports

The maintained registry is `schema.json` (mq-rpg-csv/1, 137 columns). `runtime.js` normalizes only local exports; `sync.mjs` embeds the minimal registry and runtime into the existing measurement helper and generates header copies. Raw gameplay records and the private envelope remain unchanged. Compact per-row availability status avoids duplicating large answer snapshots in local storage.

Normal regeneration, from the repository root:

```text
node audit_tools/telemetry_contract/generate.mjs
node audit_tools/answer_analysis/sync.mjs
node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs
node audit_tools/telemetry_governance/composer-activation-source.mjs
node audit_tools/telemetry_governance/composer-transport.mjs
node audit_tools/economic_realm_engine/sync.mjs
node audit_tools/macro_command_engine/sync.mjs
node audit_tools/unified_rpg_telemetry/dictionary.mjs
```

All existing generators support `--check`; the contract generator invokes the unified sync automatically. Dictionary rendering is checked with `audit_tools/telemetry_data_dictionary/render.mjs --check` and `check.mjs`. Do not use the historical bootstrap `define.mjs` for normal regeneration: it records the initial union/naming decision. `audit.mjs` reproduces the pinned pre-migration inventory at 9d42672a, including actual supported modes and the source column crosswalk.

Targeted tests:

```text
node audit_tools/unified_rpg_telemetry/check.mjs
node audit_tools/unified_rpg_telemetry/browser.mjs
node audit_tools/unified_rpg_telemetry/semantics.mjs
node audit_tools/unified_rpg_telemetry/samples.mjs
```

The browser matrix generates a real Composer game with embedded question assets, drives a seeded answer in every supported mode, downloads the actual CSV, validates values/header/privacy, and imports it in Class Answer Analysis. `semantics.mjs` adds controlled visibility, focus, copy, persistence, repeated-download and active Exam checks. It does not collect clipboard contents. Existing complete gameplay suites remain mandatory; commands/results are in the implementation report.

Evidence goes only under ignored `tmp/unified-rpg-telemetry`. Set `PLAYWRIGHT_MODULE` to the installed Playwright module and use Edge. Some old Composer tests require the existing ignored faculty audit fixtures; copy those specific fixtures from the owner's checkout when using a fresh worktree. Historical immutable JSON/source hash tests normalize Windows line endings without changing content.

No publishing or server configuration changes are part of this workflow.
