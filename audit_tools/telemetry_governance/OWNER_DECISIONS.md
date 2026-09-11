# Approved owner decisions

Governance mq-governance/2; disclosure mq-disclosure/2. Approved 2026-09-10 through explicit owner instructions. Values derive from governance-policy.mjs. These are project policies, not legal or institutional requirements. No personal name is added to telemetry.

## Application telemetry retention period

**RESOLVED**

Selection: 730 days; whole runs; latest stored server receipt.

Implementation: Runtime rejects missing/contradictory policy values. Whole-run eligibility unchanged.

Approval: 2026-09-10; revision mq-governance/2.

## Manual or automatic purge

**RESOLVED**

Selection: Automatic daily retention at 04:17 UTC daily; preview and confirmed manual execution remain.

Implementation: Scheduled handler uses the same govern() preview/execute logic; trigger prepared locally only.

Approval: 2026-09-10; revision mq-governance/2.

## Who may hold admin/export credentials

**RESOLVED**

Selection: One initial accountable Project Owner / Telemetry Custodian; mandatory additional maintenance credential for manual maintenance.

Implementation: Read/export uses ADMIN_TOKEN; maintenance additionally requires distinct MAINTENANCE_TOKEN. No fallback.

Approval: 2026-09-10; revision mq-governance/2.

## Previously accepted records after opt-out

**RESOLVED**

Selection: Prospective opt-out; accepted records remain under the normal 730-day retention policy; approved run deletion remains available.

Implementation: Collection implementation unchanged; notices now encode accepted-data policy.

Approval: 2026-09-10; revision mq-governance/2.

## Downloaded admin exports

**RESOLVED**

Selection: Institution-approved restricted storage; minimum copies/recipients; normal 730-day disposal horizon. Longer retention requires separately designated research dataset.

Implementation: Custody guidance and research template; no automatic local file deletion or raw D1 exemption.

Approval: 2026-09-10; revision mq-governance/2.

## Browser-local/downloaded-file custody language

**RESOLVED**

Selection: Approved factual local-only, intentional download/submission, receiving-system custody and student shared-visibility language. Submission requirements belong to course instructions.

Implementation: Student downloads retained; no behavioral fields hidden.

Approval: 2026-09-10; revision mq-governance/2.

## Infrastructure/provider logging responsibility

**RESPONSIBILITY RESOLVED — EXTERNAL VERIFICATION PENDING**

Selection: Project Owner / Platform Custodian assigned to verify provider logs, D1 access/backups, retention and account access.

Implementation: Checklist created; actual provider settings not accessed or verified.

Approval: 2026-09-10; revision mq-governance/2.

Deployment and real cron/secret provisioning have not occurred. External provider verification and PDF accessibility remain pre-paper gates.
