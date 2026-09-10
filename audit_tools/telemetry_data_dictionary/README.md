# Telemetry dictionary maintenance

The authored inventory is `how-to/telemetry-data-dictionary/fields.json`. It contains definitions, units, populated events, possible values, blank/zero rules, interpretation, caution, and faculty/technical classifications. The public HTML is pre-rendered so every definition works without JavaScript.

After reviewing a telemetry implementation change:

1. Update the inventory using the actual event producers and normalization code. Do not infer meanings from names.
2. Run `node audit_tools/telemetry_data_dictionary/render.mjs` to refresh field tables. Update introductory field counts/category navigation when the schema/categories change.
3. Run `node audit_tools/telemetry_data_dictionary/render.mjs --check` and `node audit_tools/telemetry_data_dictionary/check.mjs`.
4. Run `node audit_tools/telemetry_data_dictionary/browser.mjs` with Playwright installed (or `PLAYWRIGHT_MODULE` pointing to its package directory). Microsoft Edge is the tested browser. `MQ_EVIDENCE_DIR` optionally redirects screenshots/results.

Coverage reads each game's actual TELEMETRY_COLUMNS and executes the adapter's actual installLocalTelemetryColumns function with its actual BEHAVIOR_FIELDS in an isolated VM. It checks all four games in both private builds, duplicate entries, missing and stale fields, rendered names, required inventory properties, and sensitive administration text. A synthetic addition/removal self-test verifies drift detection. Source extraction fails closed if the schema/installer structure changes.

The browser suite serves local files, blocks external browser requests, tests both viewports, search/no-results/reset, no-JavaScript content, skip link, mobile menu/Escape, semantic headers, page overflow, all affected navigation links, and retained help anchors. Screenshots support visual review. It is not a full assistive-technology certification.

No package framework or production dependency is added. There was no current executable public-navigation test suite found; the historical nav_patch_validation.json is an old result artifact and is preserved.
