# Telemetry governance, retention, access and transparency

## Executive Summary

**GOVERNANCE MECHANISM READY — OWNER DECISIONS REQUIRED.** The private Worker now has configurable, manual whole-run retention, dry-run and explicitly confirmed execution, scoped run deletion, optional maintenance credential separation, and export policy context. Student/faculty notices explain local versus transmitted data, shared visibility, opt-out consequences and file custody. No retention period, administrator identity or institutional policy has been invented.

Measurement Contract 1 remains frozen: mq-measurement/1, tracker measurement revision, ordered 87/116/81 field schemas, telemetry runtime, educational models and applied migrations are unchanged. Only conservative artifact source fingerprints changed to identify the revised disclosure source; these are not a new measurement/model release. New governance identity is mq-governance/1; disclosure identity is mq-disclosure/1.

Resolved technical boundaries: public Managerial/default Composer local-only; student Download Game Data preserved; no added measurements; prospective opt-out with pending cancellation; whole-run retention; authenticated explicit deletion; bounded provider claims. Unresolved owner selections remain documented below. The protected inventory has **4,911 baseline files, 12 changed existing files and 4,899 byte-identical files**. New maintained files and isolated synthetic evidence are listed under Files Changed.

**Deployment status: not deployed.** No production D1 query/deletion, remote telemetry access, commit/push, credential rotation, provider setting change or paper/PDF modification occurred. Local test fixtures used in-memory SQLite with the two existing migrations and a D1-compatible transactional batch interface.

## Governance Architecture

Measurement contract → separate governance policy → local/private collection and storage → authenticated access → manual retention/deletion → export and recipient custody.

Canonical policy/default/environment interpretation: [governance-policy.mjs](server/anonymous-telemetry-poc/governance-policy.mjs). Canonical technical/governance description: [TELEMETRY_GOVERNANCE.md](TELEMETRY_GOVERNANCE.md). The baseline matrix records technical behavior, public/private wording, enforcement, documentation, gap and recommendation for ten governance areas: [baseline.json](audit_tools/telemetry_governance/baseline.json).

The pre-edit audit found event/run receipt timestamps and shared-token admin routes, but no time-based retention. Existing cleanup was broad synthetic/build deletion with explicit DELETE and no preview. Batch receipts retained browser IDs; rate-limit windows had probabilistic old-window cleanup. Disclosures were incomplete about current enabled/disabled status, accepted records and export custody, and public privacy still referred to schema 2. These findings were based on current source, not inferred institutional policy.

Governance is administration context, not a new field on every gameplay event. An authenticated governance endpoint and CSV response headers expose current policy. An optional hash-bound sidecar preserves export context. Historical event governance stays unknown; distributed immutable builds do not automatically receive changed notices/settings. The same existing offline validator is extended only for optional governance metadata; no second measurement validator was built.

## Data Classification

| Class | Purpose and location | Transmission/linkability/access | Retention/deletion and visibility |
|---|---|---|---|
| Local game telemetry | Browser progress, reports, retained interaction rows and downloadable CSV | Public Managerial/default Composer do not send telemetry centrally; browser profile and file holders can access local data | Existing storage/caps/site-data clearing; student Download Game Data retained; arbitrary downloaded copies cannot be centrally deleted |
| Private anonymous telemetry | Enabled classroom/POC Worker/D1 events/runs, batch receipts and rate-limit windows | Existing random browser UUID links browser runs without verifying a person; ADMIN_TOKEN gates administrative access | Configurable manual whole-run age purge and separate run UUID deletion; current local download remains available |
| Run/build/configuration provenance | Immutable manifests/digests in local CSV and private extras_json | Run/segment-linked, content-free analytical configuration; access follows containing stream | Follows event/export copy; retain approved controlled source/build artifacts separately for reconstruction |
| Content references | Question/concept/outcome/resource IDs for interpretation | Game/bank-linked identifiers, not newly exported question/answer text or identity | Follows containing row/export; field meanings remain in dictionary |
| Infrastructure metadata | Provider/network request and diagnostic records outside application telemetry tables | Provider account/network access can differ; repository cannot establish all real logs or retention | External custodian verification required; D1 row deletion does not delete provider logs/backups |

The full classification adds student/faculty visibility and location-specific custody detail in TELEMETRY_GOVERNANCE.md. A persistent random UUID is linkable, not “non-linkable.” No new person, cross-device or browser fingerprint identifier was added.

## Retention

TELEMETRY_RETENTION_DAYS is unset by default. A configured value must be a positive decimal integer string from 1 through 36500 days; these are engineering bounds, not a recommended policy period. TELEMETRY_RETENTION_MODE supports manual (default) or disabled. Unconfigured/disabled age purge refuses execution. No automatic schedule or scheduled handler is installed. Malformed configuration is rejected by governance operations rather than silently choosing a period; existing ingestion is independent.

**Unit: whole run. Clock: latest stored server receipt.** The run's last_received_at must be strictly older than the cutoff, and no event in that run may have an invalid or at/after-cutoff received_at. Client event_timestamp cannot make data expire early. Exact equality, a straddling run or a newly received event protects the whole run. Incomplete, legacy and current runs follow the same rule. Duplicate-only retries do not reset stored event/run receipt times; their batch receipts have their own clock.

POST /v1/admin/retention defaults to dry-run, returning cutoff plus affected runs/events and old auxiliary batch/window counts. Execution requires action=execute, the reviewed cutoff and confirm=PURGE_EXPIRED_RUNS; a cutoff newer than current policy permits is rejected. Eligibility is reevaluated inside a transactional D1 batch. Actual deletion counts are returned, and repeat execution is safe. Old ingest-batch receipts and old rate-limit windows are independently aged with the same cutoff; their schemas do not have per-run membership. No migration was necessary and neither applied migration was edited.

Synthetic example: three eligible runs/four events, one old batch receipt and one old rate window. Dry-run deletes nothing; execute deletes exactly those objects. New, straddling and exact-cutoff records survive. A second execute returns zero. A deliberately raised database error rolls back event and run deletion together. A late receipt between preview and execution protects the run.

No identity lookup is introduced. POST /v1/admin/delete-run previews one bounded UUID and requires confirm=DELETE_RUN:<same-lowercase-UUID> for explicit execution. It can remove named orphan events if the run summary is missing. The existing cleanup endpoint preserves explicit legacy DELETE calls, gains dry-run/execute, and selects whole synthetic/build runs so mixed runs are not partly deleted. Run/build deletion leaves batch receipts because they cannot be attributed to one run; age retention handles them separately. No client-history deletion capability was added without a defensible identity mapping.

Operation reports include current governance version, operation ID, action, scope/identifier, cutoff, exact affected counts and execution time. Operator report custody is an owner decision; no permanent person-attributed audit system is claimed. A later retry or new event can recreate a deleted run: deletion is not a permanent collection block. Orphaned/invalid-time records are not silently aged away. Large-scale query/index performance remains an activation review if this grows beyond the limited POC.

## Opt-Out

The tested Contract 1 implementation was not rewritten. Disabling private future collection stops creation/enqueueing and delivery of remotely destined events, cancels pending unsent events/retry timers, and preserves local recording/download. With browser storage available it persists across refresh. Re-enabling does not replay cancelled records. A build-level disabled setting remains authoritative. If storage is cleared/unavailable, browser persistence cannot be promised; current build settings apply.

Opt-out cannot retract requests already in flight, delete accepted D1 records, delete downloaded copies/backups or modify previously distributed immutable builds. Accepted-data treatment is a separate owner policy and administrative deletion decision. The new wording reflects this boundary and displays the current enabled/disabled transmission status. Public/default Composer remain local-only.

## Access

ADMIN_TOKEN still protects every /v1/admin/* route: summary, anomalies, run events, reconstruction, CSV export, policy, retention, run deletion and cleanup. With optional MAINTENANCE_TOKEN configured, previews/destructive operations require that additional credential; routine reads require only ADMIN_TOKEN. Without it, existing shared-admin capability remains. This is appropriate as a bounded POC mechanism; the owner must decide credential holders and whether to enable separation before wider access.

No credential belongs in game code, source, URLs, public documentation or exports. The approved secret mechanism supports provisioning/rotation/revocation. Replacing ADMIN_TOKEN revokes the previous shared value once effective; deleting it removes application admin access but does not stop ingestion. To revoke maintenance holders, rotate MAINTENANCE_TOKEN to a withheld value; deleting it would fall back to shared-admin capability. No actual secret was read or rotated. Shared credentials cannot identify which human performed an operation; provider/D1 account access remains a separate external boundary.

## Student Transparency

Students retain supported **Download Game Data** and can inspect their own retained record, including the general behavioral fields visible when that file is downloaded/submitted. No fields were hidden because faculty may use them. Local download does not automatically send a file to Mastery Quests or an instructor.

The public [privacy page](privacy/index.html) distinguishes local-only public/default Composer from enabled anonymous private collection, explains content exclusions and linkability, and states that no retention duration was selected in this release. Private notices use current-state wording and a privacy link. Student-facing prose is neutral: a tab switch or copy action alone is not evidence of misconduct, intent, attention, cognition or learning. No claim is made that a student sees the administrator's aggregate database.

## Faculty Responsible Use

The new short [Responsible Telemetry Use guide](how-to/responsible-telemetry-use/index.html), linked from Faculty Resources and the dictionary, explains visible versus hidden time, overlapping unfocused time, visibility transitions rather than destinations, copy actions rather than copied content, unknown selection purpose, rapid-guess limitations and incomplete-run/data-loss possibilities. It explicitly discourages automated cheating scores, single-field accusations and unsupported intent inference. Appropriate contextual uses include assessment QA, participation-pattern review, elapsed/visible-time comparisons and remediation research under appropriate procedures.

A student/faculty download creates a local copy. Submission to Canvas or another recipient transfers custody to that system/person. An admin export creates another copy outside D1. Recipients should use approved restricted storage, minimize copies/recipients, record custody and apply the approved disposal decision to each copy. Server deletion cannot remove arbitrary downloads, submitted copies or backups. No institutional disposal period was invented.

## Infrastructure Logging

Inspected both Wrangler configurations. The root config defines static assets, the private classroom access route and login rate limit. The telemetry config defines its route, D1 binding, allowed origins and per-client rate setting. Neither explicitly declares observability/logpush/analytics-engine or log retention. The Worker has console.error on server faults. These facts do not prove provider logging is disabled or establish dashboard/account defaults, provider request/IP retention, backup/time-travel behavior or actual account access. Those remain external provider-custodian decisions. No provider-wide setting was changed.

D1 transactional behavior and secret commands were checked against primary technical references: [D1 database API](https://developers.cloudflare.com/d1/worker-api/d1-database/), [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/), and [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/). These do not establish institutional or legal compliance.

## Owner Decisions

The decision worksheet gives options, technical/privacy/research consequences, recommendations without arbitrary periods, unfilled owner selections and implementation status: [OWNER_DECISIONS.md](audit_tools/telemetry_governance/OWNER_DECISIONS.md).

1. Application retention duration.
2. Manual operating responsibility versus separately approved future scheduling.
3. Who holds admin/export privileges and whether to enable maintenance separation.
4. Treatment of accepted records following collection opt-out.
5. Storage/disposal and accountability for downloaded admin exports.
6. Approval of factual browser/download custody language and actual course submission expectations.
7. Provider logging, backup retention and account-access verification responsibility.

No owner selection is marked approved. The explicit task/Contract 1 settled factual local-only/download/opt-out boundaries, not institutional policies. Before activation, reconcile deployed environment, governance revision and the actual course/study/public notice; a code default is not a published retention policy.

## Validation

Baseline was clean. Baseline Composer **27/27**, Contract 1 **16/16**, and timing/backend **16/16** all passed. The baseline matrix and hash inventory were captured before edits.

| Final gate | Result | Evidence file |
|---|---|---|
| Governance synthetic/negative/CLI | 14/14 PASS | governance-results.json |
| Desktop/mobile disclosure, links, keyboard, disabled status/refresh | 8 checks PASS; no-JavaScript PASS; zero exceptions | disclosure-browser-results.json |
| Contract 1 targeted measurements/privacy/retry/opt-out | 16/16 PASS | contract-results.json |
| Synthetic timing/Worker/D1 regressions | 16/16 PASS | backend-results.json |
| Actual downloads across 12 Managerial targets + generated Composer, refresh and controls | 17/17 PASS | download-optout-results.json |
| Private timing/Worker browser | 29/29 PASS | private-browser-results.json |
| Public Managerial browser and modes | 103/103 PASS | public-browser-results.json |
| Active Composer | 27/27 PASS | final-composer.log |
| All-file hashes and unchanged measurement/template/adapter logic | PASS | protected-files.json |
| Governance/contract generation, synchronization, dictionary/inventory and git diff whitespace | PASS | final-checks.json |

All evidence is in [validation_artifacts/telemetry_governance](validation_artifacts/telemetry_governance/README.md). Synthetic purge/CSV/sidecar examples are retained. Negative tests cover invalid/disabled/unconfigured retention, wrong/future cutoff, partial-run protection, database rollback, malformed UUID, misleading cross-scope input, missing auth, write-capability separation, stale policy/disclosure wording, secret sentinel, accidental public transmission, queued replay after opt-out, mismatched policy/measurement identity and wrong export hash. The CLI was exercised against the actual local Worker; its output did not expose fixture credentials.

The existing validator reports unknown governance when a sidecar is absent. With a sidecar it validates current export policy, retention metadata and byte hash without adding CSV fields or enforcing policy on local copies. Legacy/mixed measurement versions and completeness warnings remain the existing validator's responsibility. Sidecars are context/integrity aids, not signatures or proof of historical policy. Dictionary still governs exactly 87 Managerial fields with distinct Composer/private stream applicability.

No passing behavioral assertion was removed or historical baseline rewritten. The current scope check proves template/public/private adapter code is unchanged outside the disclosure function and embedded source registry. Frozen game HTML, educational content, graphs, PDFs, LO mappings, measurement release/schema/runtime/core, migrations and previous reports/evidence are byte-identical.

## Files Changed

Existing files (12):

- audit_tools/managerial_classroom/build.mjs
- audit_tools/telemetry_contract/registry.json
- audit_tools/telemetry_contract/validate.mjs
- build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html
- how-to/index.html
- how-to/telemetry-data-dictionary/index.html
- play/managerial-directorate-classroom/index.html
- play/managerial-directorate-classroom/telemetry-client.js
- play/managerial-directorate-telemetry-poc/telemetry-client.js
- play/managerial-intelligence-directorate/local-telemetry.js
- privacy/index.html
- server/anonymous-telemetry-poc/worker.mjs

New maintained files:

- FINAL_REPORT_telemetry_governance.md
- TELEMETRY_GOVERNANCE.md
- audit_tools/telemetry_governance/OWNER_DECISIONS.md
- audit_tools/telemetry_governance/README.md
- audit_tools/telemetry_governance/admin.mjs
- audit_tools/telemetry_governance/baseline.json
- audit_tools/telemetry_governance/browser.mjs
- audit_tools/telemetry_governance/check.mjs
- audit_tools/telemetry_governance/owner-decisions.json
- audit_tools/telemetry_governance/render.mjs
- audit_tools/telemetry_governance/scope.mjs
- how-to/responsible-telemetry-use/index.html
- server/anonymous-telemetry-poc/governance-policy.mjs
- server/anonymous-telemetry-poc/governance.mjs

New evidence is confined to validation_artifacts/telemetry_governance/. Its exact file list is [evidence-files.json](validation_artifacts/telemetry_governance/evidence-files.json). No prior evidence/report was overwritten.

## Deployment / Activation

**Not executed.** The complete reviewed sequence and credential caveats are in [the operator guide](audit_tools/telemetry_governance/README.md). After owner approval, configure TELEMETRY_RETENTION_DAYS to the approved integer and TELEMETRY_RETENTION_MODE=manual in the telemetry deployment environment, review governance/disclosure alignment and approved custodians, then separately authorize these operations:

```text
npx wrangler secret put ADMIN_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc
npx wrangler secret put MAINTENANCE_TOKEN --config server/anonymous-telemetry-poc/wrangler.jsonc
npx wrangler deploy --config server/anonymous-telemetry-poc/wrangler.jsonc
```

Maintenance separation is optional pending owner selection. No migration command is needed. Publish the reviewed static notices/derived adapters through the established website release path; do not regenerate frozen games. Verify actual access/configuration before collection is approved for institutional/research use. No schedule is enabled by deployment.

In the approved operator environment set MQ_ADMIN_ENDPOINT (HTTPS base ending /api/anonymous-telemetry-poc), MQ_ADMIN_TOKEN and optional MQ_MAINTENANCE_TOKEN from approved secret storage. Preview with node audit_tools/telemetry_governance/admin.mjs retention; review the returned cutoff/counts. Only with explicit operator approval run retention --execute --cutoff <reviewed-UTC-ISO-cutoff> --confirm PURGE_EXPIRED_RUNS. Replace placeholders with reviewed values; do not put credentials in the command or URL. The operator guide also gives run-specific deletion, export/sidecar validation and safe revocation commands. No remote preview, deletion or secret operation was performed.

## Pre-Paper Readiness

Remaining gates: dated owner retention/access/accepted-data/custody decisions; actual deployment and disclosure alignment; provider logs/backups/access verification; applicable institutional/research review and participation arrangements; and the separate **PDF structural accessibility** task. The paper was not edited. No FERPA compliance, IRB approval, legal/institutional approval, automatic misconduct detection or stronger anonymity claim is made.

## Final Verdict

**GOVERNANCE MECHANISM READY — OWNER DECISIONS REQUIRED.** Mechanisms and tested factual transparency are ready for review. Activation and paper-ready governance claims remain gated by the explicitly unselected owner/external decisions above.
