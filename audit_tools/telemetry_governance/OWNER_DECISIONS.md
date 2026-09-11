# Owner decisions — governance 1

No owner policy value is inferred from absent code. This file is a decision worksheet, not approval. Runtime values come from the environment interpreted by server/anonymous-telemetry-poc/governance-policy.mjs; do not add retention literals to game files or public prose. Record dated approval and publish a new governance/disclosure revision when actual policy changes. Measurement mq-measurement/1 is independent.

## Application telemetry retention period

- **Options:** A finite owner-approved duration; manual review without configured duration; explicitly disabled retention
- **Technical consequence:** TELEMETRY_RETENTION_DAYS accepts 1–36500 whole days (engineering bounds, not a recommendation). Missing value refuses time purge.
- **Privacy/research consequence:** Shorter retention reduces exposure; longer retention permits longitudinal/reproducibility work.
- **Recommended choice:** Select the shortest duration justified by the approved purpose; no numeric recommendation without that purpose.
- **Owner selection:** Pending; no period selected
- **Implementation status:** Mechanism implemented; unconfigured by default.

## Manual or automatic purge

- **Options:** Manual reviewed invocations; an externally scheduled authenticated job after separate approval
- **Technical consequence:** Only manual/disabled modes exist. No cron or scheduled Worker handler is installed.
- **Privacy/research consequence:** Manual review reduces accidental loss but requires accountable execution; scheduling improves consistency with added destructive operational risk.
- **Recommended choice:** Start with reviewed manual execution; approve scheduling separately if operational need is established.
- **Owner selection:** Pending
- **Implementation status:** Manual mechanism ready; automatic activation intentionally absent.

## Who may hold admin/export credentials

- **Options:** One accountable POC custodian; limited authorized analyst custodians; optional separate maintenance credential
- **Technical consequence:** ADMIN_TOKEN permits all reads and, unless MAINTENANCE_TOKEN is configured, destructive routes. With separation, writes require both admin authentication and maintenance credential.
- **Privacy/research consequence:** Shared tokens provide no individual audit attribution and rotation affects all holders.
- **Recommended choice:** Limit ADMIN_TOKEN holders to named approved custodians; configure separate MAINTENANCE_TOKEN before sharing export access.
- **Owner selection:** Pending; no person or role assigned
- **Implementation status:** Authentication retained; optional capability separation implemented.

## Previously accepted records after opt-out

- **Options:** Retain under approved retention basis; review an authorized run-specific deletion request
- **Technical consequence:** Collection switch cancels pending events only. Admin run deletion is separate, previewable and confirmed. Late retries can recreate records.
- **Privacy/research consequence:** Immediate deletion can harm longitudinal integrity; retention despite opt-out requires transparent approved arrangements.
- **Recommended choice:** Explain accepted-data handling before use; provide a custodian-mediated process where appropriate, without promising identity lookup.
- **Owner selection:** Pending
- **Implementation status:** Run deletion implemented; no automatic retrospective deletion.

## Downloaded admin exports

- **Options:** Approved restricted repository with disposal register; other institution-approved research storage
- **Technical consequence:** D1 cannot delete arbitrary downloaded, submitted or backup copies. Hash-bound sidecar documents export context.
- **Privacy/research consequence:** Extra copies enlarge access/retention scope and need recipient accountability.
- **Recommended choice:** Minimize copies and recipients; track custody and apply the approved disposal schedule to each location.
- **Owner selection:** Pending
- **Implementation status:** Custody guide and export sidecar ready; no invented institutional storage rule.

## Browser-local/downloaded-file custody language

- **Options:** Retain provided factual description; adapt course/study notice under institutional procedures
- **Technical consequence:** Public/default Composer remains local-only; local download alone does not submit. Browser site-data removal can erase progress.
- **Privacy/research consequence:** Shared browser profiles expose local records; submissions shift custody to receiving system/person.
- **Recommended choice:** Use the factual shared-visibility/custody wording and state actual course submission expectations.
- **Owner selection:** Pending approval of notice; local-only/download boundary already required by task and TELEMETRY_CONTRACT.md
- **Implementation status:** Factual wording implemented; policy approval remains open.

## Infrastructure/provider logging responsibility

- **Options:** Designated platform account custodian verifies dashboard settings, access, backups and retention
- **Technical consequence:** Repository has no explicit observability/logpush/log-retention setting; Worker has console.error on server faults. Account settings/provider defaults not inspected.
- **Privacy/research consequence:** Network/provider records can include request information beyond the content-free application table.
- **Recommended choice:** Assign an accountable provider administrator to verify/document real settings before institutional/research use.
- **Owner selection:** Pending
- **Implementation status:** External verification required; provider settings unchanged.

Resolved technical boundaries from the explicit task and Contract 1: public/default Composer local-only; no new measurements; student download preserved; opt-out is prospective/pending cancellation; provider claims remain bounded. These do not settle the pending policy choices above.
