# Capability ingest transport (Stage 2)

The canonical future capability header is **X-MQ-Ingest-Token**. Send the opaque capability only as that header's value. Header names are case-insensitive.

When capability ingest is enabled, the presence of X-MQ-Ingest-Capability rejects the request, even if empty or accompanied by a valid new header. It is not an alias and cannot fall back to legacy grace. An invalid or empty new token likewise cannot fall back. Authorization, cookies, query strings, request JSON, operator capability IDs and alternate custom headers are not capability authority.

Enabled POST /v1/events preflight allows only content-type, x-telemetry-phase and x-mq-ingest-token, on existing approved first-party origins. It does not allow the retired header, arbitrary origins, admin CORS or credentials. With feature flags OFF, the existing legacy-compatible Worker behavior and CORS remain unchanged; neither custom header grants capability authority in that mode.

Production configuration keeps issuance, ingest and legacy grace OFF. No Composer/client integration or production deployment is part of this change. The body ceiling remains 131,072 actual bytes, and all existing scope, duplicate, transaction, receipt, quota and retention rules remain unchanged.

Provider redaction must be demonstrated in isolated staging, rather than inferred from the word Token. Inspect live-tail and console surfaces separately; document any persisted-log visibility limit. Keep raw fixture credentials in memory, and delete staging resources after evidence capture. Historical reports describe their original header and must not be rewritten. The current decision is recorded in FINAL_REPORT_portable_telemetry_stage2_redaction.md.
