# Mastery Quests telemetry governance

**GOVERNANCE MECHANISM READY — OWNER DECISIONS REQUIRED.** Governance policy mq-governance/1 and disclosure mq-disclosure/1 describe this technical mechanism release. They are not institutional approval. Owner policy selections remain pending in [OWNER_DECISIONS.md](audit_tools/telemetry_governance/OWNER_DECISIONS.md).

## Architecture and version responsibilities

Measurement mq-measurement/1 defines what an interaction record means. Governance policy defines current access, retention mechanism, notice and collection consequences. Collection produces local records and, only for enabled private builds, existing anonymous Worker/D1 records. Authenticated access creates exports; manual retention deletes eligible application records. Export recipients then control downloaded copies.

Canonical mechanism/version/default configuration is [governance-policy.mjs](server/anonymous-telemetry-poc/governance-policy.mjs). Owner-deployed values are read from its named environment variables. Missing TELEMETRY_RETENTION_DAYS means no configured retention duration and time purge refuses to run. TELEMETRY_RETENTION_MODE defaults to manual; disabled blocks time purge. Only decimal integer durations 1–36500 days are accepted (engineering bounds, not recommended policy). No automatic schedule exists. Malformed settings are rejected by governance/admin operations; ingestion is not silently disabled. Reviewed owner policy changes require a new governance/disclosure revision and notice, not a measurement-version bump.

The frozen measurement release, schema, counters, timing calculations and events are unchanged. UI disclosure source changes require refreshed source artifact fingerprints; those conservative hashes are build provenance, not new measurement semantics. Distributed immutable games do not receive later notices or settings automatically.

## Data classification

| Class | Purpose / location / transmission | Linkability and access | Retention and deletion | Visibility |
|---|---|---|---|---|
| Local game telemetry | Game progress, reports and interaction QA; browser storage and local CSV; public Managerial/default Composer do not transmit | Run identifiers and local saved display state; anyone with that browser profile/file access may see it | Existing local caps and site-data clearing; no central expiration on downloaded files; clearing can erase progress | Supported Download Game Data exposes the student's own retained record, including behavioral fields |
| Private anonymous telemetry | Explicitly enabled classroom/POC collection; Worker/D1 events/runs; auxiliary batch and rate-limit tables | Existing persistent random browser UUID links browser runs, not verified identity; ADMIN_TOKEN protects reads | Configurable manual whole-run purge; separate UUID run deletion; age-limited receipt/window cleanup when purge runs | Local download remains; aggregate admin export restricted |
| Run/build/configuration provenance | Immutable analytical manifest and digests needed to interpret runs; local CSV/private extras_json | Run/segment-linked; no new person ID, title, secret or custom URL | Follows local/event copy lifecycle; retain controlled release/authoring artifacts separately as approved | Same CSV manifest; hashes reference controlled artifacts rather than public answer keys |
| Content references | Question/concept/outcome/resource IDs; local/private records | Link by game/bank revision; no question/answer or copied/selected text in added metadata | Follows its containing event/export; resource/content files unchanged | CSV IDs and dictionary explain scope; no new content endpoint |
| Infrastructure metadata | Ordinary provider/network delivery, security/diagnostic records outside application table | Provider/account access may differ and network metadata may identify requests | Actual provider logs/backups/retention not verified from repository; D1 row deletion is not infrastructure deletion | Account custodian must verify provider settings; no claim that IPs never exist anywhere |

The application tables do not add copied or selected content, clipboard contents, keystrokes, screenshots, unrelated-tab activity, browsing history, personal identity or browser fingerprints. Existing local display names are local game state, not proof of identity or a new private analytical field.

## Retention and deletion

POST /v1/admin/retention defaults to dry-run. It computes a UTC cutoff from server time minus configured days. A run is eligible only when its last_received_at is strictly earlier than the cutoff and no stored event has an invalid received_at or received_at at/after cutoff. Client event_timestamp is not the eligibility clock. Duplicate-only retry batches do not extend the stored event/run receipt time; their separate batch receipts follow their own retention clock. Equality protects a run. A recent receipt protects the whole run, including old prefixes; incomplete and legacy runs follow the same rule. Unknown/orphaned data is not guessed away. Existing run/sequence indexes support lookup; no migration is needed for this limited POC. Review query cost before large-scale use.

Dry-run reports runs/events, cutoff, old batch receipts and old rate-limit windows; it deletes nothing. Execute requires action=execute, the reviewed cutoff and confirm=PURGE_EXPIRED_RUNS. The server rejects a cutoff newer than the current policy allows. Eligibility is reevaluated inside a transactional D1 batch, then events and empty eligible run summaries are deleted atomically. Counts are actual changes. A late arrival before execution protects the run. Rerunning is safe and may report zero. Batch receipts and rate-limit windows are independently purged by their own server receipt/window time; they have no run membership and are reported separately. A later retry/new event can recreate a previously deleted run; no tombstone or identity system was added.

POST /v1/admin/delete-run accepts one UUID (including events whose summary is missing), defaults to preview, and requires action=execute plus confirm=DELETE_RUN:<lowercase UUID> to delete that run's events and summary. This is an operator-mediated technical selection, not a student identity lookup. No anonymous-client-wide deletion was added: linkability is not identity and a shared browser can span people. Run/build deletion does not remove batch receipts because their schema cannot attribute a receipt to one run; they remain under the age-purge mechanism.

The existing /v1/admin/cleanup remains authenticated. It now previews without a destructive confirmation, supports explicit dry-run/execute, and preserves mixed synthetic/build runs rather than removing half a run. Existing scope + confirm=DELETE calls retain explicit execution compatibility. Its broad scope requires custodian review. It is not a retention schedule. None of these mechanisms removes downloaded files, backups or provider logs.

Audit/report output contains operation ID, current governance version, scope, action, cutoff, exact affected counts and execution time; retain it in the approved operator records location. No new permanent operator identity/audit database is claimed. Shared credentials cannot attribute an action to a named person.

## Access and credentials

All /v1/admin/* data/deletion routes require ADMIN_TOKEN, including summary, anomalies, run records, reconstruction, export and governance inspection. No public deletion endpoint exists. ADMIN_TOKEN alone retains existing limited-POC capability when optional MAINTENANCE_TOKEN is absent. If configured, destructive/preview routes additionally require that maintenance credential; routine reads still need only ADMIN_TOKEN. The owner should select a small set of accountable custodians and separate maintenance capability before broader export sharing. No complex identity/RBAC system was introduced.

Never embed credentials in games, public documentation, CSVs, URLs or source-controlled configuration. Use the existing Cloudflare secret mechanism. Rotating the shared secret revokes the old value for all callers after the update is effective; distribute the replacement only to approved custodians through an approved secret channel. Deleting ADMIN_TOKEN disables application admin access, not public ingestion; deleting MAINTENANCE_TOKEN would fall back to shared admin capability and is therefore NOT the way to revoke write access. Rotate MAINTENANCE_TOKEN to a new withheld value to revoke prior maintenance holders. Provider account holders with D1 access are a separate external access boundary.

## Opt-out and shared visibility

The private control stops new remotely destined events and cancels queued unsent records/retry timers. Local recording and Download Game Data remain available. With browser storage available, disabled persists after refresh. Re-enabling creates new future records and does not replay cancelled records. The build-level disabled setting cannot be overridden by the checkbox. If site storage is cleared/unavailable, persistence cannot be promised; the current build setting applies. The switch cannot retract in-flight requests or delete accepted records. Retention/admin deletion is a separate policy and action.

Public Managerial/default Composer remain local-only. Students can inspect their own supported Download Game Data file and the general behavioral record visible in that downloaded/submitted file. No fields are hidden merely because faculty may use them. The private notice reports enabled/disabled status and links to the neutral [privacy notice](privacy/index.html). It does not promise full aggregate server access to students.

## Faculty interpretation and file custody

[Responsible Telemetry Use](how-to/responsible-telemetry-use/index.html) explains visible/hidden/overlapping focus time, visibility transitions rather than destinations, copy actions rather than copied content, unknown selection purpose and incomplete-run/data-loss possibilities. It discourages automated cheating scores, single-signal accusations and unsupported intent inference. Appropriate contextual uses include assessment QA, participation pattern review, elapsed/visible-time comparison and remediation research under appropriate procedures. The dictionary remains the field reference.

Creating a local CSV does not submit it. Canvas or another receiving person/system assumes custody of a deliberately submitted copy. Admin export makes another copy outside D1. Recipients should use approved restricted storage, minimize recipients/copies, track where copies are held and apply the approved disposal decision to each location. Server deletion cannot enforce arbitrary file retention. No institutional record-management period is supplied here.

## Infrastructure boundary

Inspected root wrangler.jsonc (static assets, classroom access route and login rate limit) and server/anonymous-telemetry-poc/wrangler.jsonc (Worker route, D1 binding, allowed origins, per-client rate setting). Neither explicitly configures observability, logpush, analytics-engine or log retention. The telemetry Worker has console.error on server errors. This does not establish that provider logging is disabled or reveal account/dashboard defaults. Provider/network request records, backup/time-travel retention and account access require external custodian verification. No provider-wide setting, real credential or database was accessed or changed.

## Export policy context and remaining gates

Admin CSV columns/envelope remain unchanged. Responses expose current policy/mode/duration headers; the explicit admin export helper saves the unchanged CSV plus a hash-bound governance sidecar. The existing offline validator optionally checks the sidecar hash, policy/contract identity and retention metadata. It identifies current export-time policy only; old event governance remains unknown and a policy is never assigned from a measurement version. Missing sidecar is reported as unknown. It cannot enforce policy on arbitrary local files, prove provider compliance or authenticate a deliberately forged pair.

Before institutional/research activation: owner decisions, credential custody, deployed configuration/notice alignment, actual provider logging/backups/access review, and required institutional/research procedures. Before paper-ready claims: these gates plus separate PDF structural accessibility review. No paper edit, FERPA/IRB/legal/institutional approval or stronger anonymity claim is made. Deployment is not performed by this task.

Operator commands, verification and sources: [README](audit_tools/telemetry_governance/README.md).
