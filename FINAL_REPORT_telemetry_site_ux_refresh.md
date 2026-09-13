# Telemetry disclosure and Composer UX refresh

Deployment status: **NOT DEPLOYED**.

The requested copy and UX changes are implemented. Final acceptance is **blocked** by a pre-existing private telemetry browser regression: `audit_tools/managerial_telemetry_parity/run-browser.mjs` reports 11 passes and 18 failures, reproduced with committed HEAD telemetry clients as well as the refreshed clients. No transport fix was made outside the authorized editorial scope. All other executed final suites listed below pass.

## Repository and starting state

- Authoritative root: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`.
- Branch: `main`.
- Starting/current HEAD: `adcaee339c24a8d92c3a59bfc3f2736db168b144`.
- Initial `git status --short`: clean. No commit, push, or deployment was performed.
- Work was confined to this repository. No legacy National Engine or identifying Power Automate transport was edited.
- Pre-edit source searches established the relationships below; `validation_artifacts/telemetry_site_ux_refresh/inventory-head.json` records the requested phrase inventory against the original HEAD. Historical reports/evidence were not rewritten.

## Canonical sources and generated outputs

- `audit_tools/telemetry_governance/render.mjs` owns the shared private notice, the governance section of Privacy, and the full Responsible Telemetry Use page. It supplies the disclosure text in `audit_tools/managerial_classroom/build.mjs`, the private POC client, and classroom hub.
- `audit_tools/managerial_classroom/build.mjs` derives the classroom client from the maintained POC client. Only that derived client was refreshed; the classroom game HTML was not rebuilt or enabled.
- `audit_tools/telemetry_contract/generate.mjs` refreshes the source fingerprint in `registry.json` and embedded registries. `composer-transport.mjs` derives the Composer anonymous adapter. `published_managerial_parity/sync.mjs` derives the public LOCAL-ONLY client. The public client change is solely its embedded tracker source fingerprint; executable local tracking and its absence of network transport were verified unchanged.
- Composer `index.html` and `composer.js` are canonical authored UI. `composer-core.js` is unchanged. No second telemetry state variable was added.
- `privacy/index.html` outside the renderer-owned section, `how-to/composer/index.html`, and `how-to/index.html` are authored pages. The dictionary renderer owns only its field tables; explanatory prose in `how-to/telemetry-data-dictionary/index.html` is authored in place. No fields or tables were changed.
- `dist` is a controlled, ignored generated publication directory; it was rebuilt, not deployed.

## Identifier wording

Adopted exactly:

> Names, email addresses, LMS account identifiers, university identifiers, and free-text responses are not intentionally included in application telemetry.

This appears in Composer, canonical/private notices, Privacy, and Responsible Telemetry Use. The old institution/platform-specific identifier phrases are absent from current telemetry disclosure sources and their generated copies. Legitimate Canvas submission instructions and `how-to/canvas/` remain intact. Historical evidence and negative-test search strings retain their historical wording.

## Composer UX

1. **Step 1:** the secondary footer now says: “The Composer runs locally in your browser, and your faculty selections are not transmitted. Generated games can optionally send anonymous gameplay data when you enable that setting in Game details.” The same shared footer appears on the other steps.
2. **Step 2:** the existing checkbox now sits beneath “Anonymous gameplay data,” with the label “Allow anonymous gameplay data collection.” The section states OFF by default, explicit enablement, operational/instructional/product purpose, excluded identifiers, Download Game Data visibility, prospective browser opt-out where supported, and the accepted-record boundary. Links lead to Privacy, Responsible Telemetry Use, and the dictionary. Existing secondary panel styling is retained.
3. **Step 6:** the existing readiness message now displays **Anonymous data collection: OFF** or **ON**, with the requested transmission explanation, using `state.allowAnonymousDataCollection === true`. It recalculates with the existing readiness workflow.
4. **Recipe/generation:** the key remains `allowAnonymousDataCollection`; default false and strict boolean semantics are unchanged. Actual downloaded ON/OFF recipes preserve explicit booleans. OFF builds omit the remote adapter; ON builds use the maintained adapter. Browser restriction cannot override faculty OFF.

## Public policy and private notices

Public Privacy, Responsible Telemetry Use, the dictionary introduction, Composer guide, and faculty guide index now distinguish local public games from explicitly enabled private/class-specific/Composer builds. Ordinary analytics are operational, instructional, and product analytics, **not research by default**. Separately designated research requires its own institutional decisions and dataset handling.

The shared private notice retains local download visibility, prospective opt-out and cancellation boundaries, persistence qualifications, neutral interpretation of interaction signals, and 730-day whole-run retention with automatic daily evaluation. It now uses the generalized identifiers and operational framing. Provider logs are explicitly included among copies server deletion cannot erase. Administrative exports are described as restricted owner-controlled copies with the ordinary 730-day disposal horizon.

Public polished Managerial Intelligence Directorate, Economic Realm, Macro Command System, Micro Domains, and other public polished games remain **LOCAL-ONLY** for telemetry. No public remote adapter/control was added. Private HTML configuration and defaults were not enabled or changed. The legacy `#classroom-research` anchor is retained for existing links; its visible title now says private and class-specific builds.

## Frozen scope

Unchanged: `mq-measurement/1`, `mq-governance/2`, `mq-disclosure/2`, anonymous envelope schema 3, all centralized/CSV fields, measurement semantics, pseudonym algorithms/scope rules, 730-day whole-run retention, daily cron `17 4 * * *`, all server/Worker code/configuration, D1, CORS, tokens/secrets, rate limits, routes, migrations, public game HTML, banks, artwork, PDFs, and Canvas instructional pages.

Only generated tracker source fingerprints changed as required by the existing generators after editing a disclosure source. Semantic comparisons remove only disclosure text blocks and embedded contract registries and assert the remaining executable client/template source matches HEAD. The UX scope guard covers 922 protected tracked files and rejects protected changes. No contract/version bump was needed.

## Validation

| Final suite/check | Result |
| --- | --- |
| Active Composer regression suite | 27/27 runners passed |
| Governance readiness/remediation | 27/27 passed |
| Governance checks | 14/14 passed |
| Scheduled retention, synthetic in-memory database only | 11/11 passed |
| Measurement contract checks | 16/16 passed |
| Measurement contract browser tests | 17/17 passed |
| Deterministic Managerial telemetry parity | 16/16 passed |
| Governance disclosure/browser checks | 8 checks passed; no-JavaScript guide passed |
| Published Managerial browser suite | 103/103 passed; no telemetry network requests |
| Classroom-access regression | 27/27 passed |
| Dictionary validation | Passed; 87 fields, no schema drift |
| Public documentation validation | 17 pages, 548 links, zero broken links |
| New site-ux-refresh regression | Passed at 1440px and 390px; default OFF, Steps 1/2/6, ON/OFF readiness and recipe downloads, links, no horizontal overflow, no runtime errors |
| Governance/contract/Composer adapter/behavior generator `--check` | All passed |
| `git diff --check` | Passed |
| Private browser telemetry parity | **11 passed, 18 failed; also reproduced with original HEAD clients** |

Stale tests were updated without weakening transport assertions: the documentation suite no longer requires obsolete schema-2 prose; the governance browser suite explicitly enables collection only in its localhost fixture; classroom-access preservation checks permit only canonical notice and embedded registry changes while retaining exact checks on access/game code. The readiness preflight hashes come from this task's HEAD, not a prior activation task's pre-activation configuration. Initial missing-fixture and stale-test failures were resolved and rerun.

## Browser copy/layout QA

Screenshots were inspected for Steps 1, 2, and 6 at desktop and narrow widths, including the Step 1 footer and both readiness states. Copy wraps without clipping, the opt-in section is visually secondary and readable, OFF is prominent, and links work. The narrow layout uses the existing horizontally scrollable step navigation. The long concept list is unchanged; Step 1 viewport and footer are captured separately. No new duplicate full disclosure is added outside Step 2. These are local headless Edge/Playwright checks, not a production browser verification.

## Publication

`node audit_tools/public_site_publication/build-dist.mjs .` completed successfully:

- Total files: 1,793.
- Composer Concept Review PDFs: **151**.
- `forbiddenFileCount`: **0**.
- `incomingQuestionAssetCount`: **0**.
- No authoring/test/audit source leaks into dist.
- Deployment status: **NOT DEPLOYED**.

## Remaining issue / acceptance boundary

The private parity browser suite's Cost Directive save/refresh/Continue check fails for both private families. Diagnostics show remote collection enabled and the queue empty before reload, then disabled afterward; the prior answer retains copyCount 1 instead of receiving a new answer with copyCount 0. The following eight mode checks per family then fail to receive remote responses. The final result is 18 failures, with no browser exceptions or Worker ingestion errors.

Running the unchanged suite while serving both original telemetry clients from `git show HEAD:<path>` reproduces the same 18 named failures. Evidence is in `baseline-parity-browser/browser-results.json` and `parity-browser/browser-results.json`; `baseline-clients.cjs` is the local baseline-only serving shim. No learner data or remote service was involved. This establishes a pre-existing regression, but does not claim its root cause is fixed. The separately run readiness and contract browser opt-out/refresh tests pass.

Because the user requires all relevant tests to pass, **final acceptance is not complete**. Resolving this existing transport/refresh issue would require a separate, explicitly scoped investigation beyond this disclosure/UX refresh. Transport behavior was not changed to make the suite pass.

## Exact changed files

The following source/generated files and this report are changed or added. Full fresh evidence paths are listed in `validation_artifacts/telemetry_site_ux_refresh/evidence-files.json`; existing historical evidence is unchanged.

- `FINAL_REPORT_telemetry_site_ux_refresh.md`
- `audit_tools/classroom_access/run_validation.mjs`
- `audit_tools/managerial_classroom/build.mjs`
- `audit_tools/public_documentation/check.cjs`
- `audit_tools/telemetry_contract/registry.json`
- `audit_tools/telemetry_governance/browser.mjs`
- `audit_tools/telemetry_governance/render.mjs`
- `audit_tools/telemetry_governance/site-ux-refresh.mjs`
- `build/faculty-build-composer/anonymous-telemetry-source.js`
- `build/faculty-build-composer/composer.js`
- `build/faculty-build-composer/index.html`
- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`
- `how-to/composer/index.html`
- `how-to/index.html`
- `how-to/responsible-telemetry-use/index.html`
- `how-to/telemetry-data-dictionary/index.html`
- `play/managerial-directorate-classroom/index.html`
- `play/managerial-directorate-classroom/telemetry-client.js`
- `play/managerial-directorate-telemetry-poc/telemetry-client.js`
- `play/managerial-intelligence-directorate/local-telemetry.js`
- `privacy/index.html`
