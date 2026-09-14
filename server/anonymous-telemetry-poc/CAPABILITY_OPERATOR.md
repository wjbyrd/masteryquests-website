# Capability ingest transport (Stage 2)

The canonical future capability header is **X-MQ-Ingest-Token**. Send the opaque capability only as that header's value. Header names are case-insensitive.

When capability ingest is enabled, the presence of X-MQ-Ingest-Capability rejects the request, even if empty or accompanied by a valid new header. It is not an alias and cannot fall back to legacy grace. An invalid or empty new token likewise cannot fall back. Authorization, cookies, query strings, request JSON, operator capability IDs and alternate custom headers are not capability authority.

Enabled POST /v1/events preflight allows only content-type, x-telemetry-phase and x-mq-ingest-token, on existing approved first-party origins. It does not allow the retired header, arbitrary origins, admin CORS or credentials. With feature flags OFF, the existing legacy-compatible Worker behavior and CORS remain unchanged; neither custom header grants capability authority in that mode.

Production configuration keeps issuance, ingest and legacy grace OFF. No Composer/client integration or production deployment is part of this change. The body ceiling remains 131,072 actual bytes, and all existing scope, duplicate, transaction, receipt, quota and retention rules remain unchanged.

Provider redaction must be demonstrated in isolated staging, rather than inferred from the word Token. Inspect live-tail and console surfaces separately; document any persisted-log visibility limit. Keep raw fixture credentials in memory, and delete staging resources after evidence capture. Historical reports describe their original header and must not be rewritten. The current decision is recorded in FINAL_REPORT_portable_telemetry_stage2_redaction.md.

## Stage 3 activation (production remains OFF)

POST /v1/build-capabilities is now routed through the canonical issuance helper. Only exact server string true enables issuance; disabled requests receive bounded 404 activation_unavailable. Enabled activation requires the configured apex/www Composer Origin, exact bounded request fields and verified challenge. The successful 201 response returns the raw capability once with no-store; repeats never recover it. Lifetime remains 365 days, separate from 730-day retention.

Production verification uses TURNSTILE_SECRET_KEY through the server-only Siteverify adapter. Provision a dedicated widget restricted to masteryquests.org and www.masteryquests.org and configure its public site key in the hosted Composer meta element named mq-turnstile-sitekey. No key is supplied by this change. Keep the secret in a Worker secret binding, never source, HTML or reports. Verification checks the existing action mq_build_activate, approved hostname, activation digest cData, provider success and a five-minute timestamp window; the provider enforces token single use. No remote IP is submitted. OFF Composer users never load the widget. Generated games never load it.

The local Worker factory permits code-injected test verification. There is no request field, environment flag, public bypass credential or production mock mode. Do not deploy local mocks. Real-provider acceptance and first-party staging end-to-end proof remain separate prerequisites until documented in the Stage 3 report.

Composer activates only after Generate validates and freezes the build. It caches the descriptor only in session memory, invalidates it on input changes, checks returned scope/endpoint and blocks the ON download on failure. An explicit user action can generate OFF. Descriptor metadata is outside recipes and analytical hashes. The maintained client requires a valid, unexpired, matching descriptor for Composer only; private Managerial retains descriptor-absent behavior. Terminal 401/403/429 responses suspend that descriptor and cancel its queue. Network/503 failures retain bounded queue/backoff. A replacement token does not change build-scoped browser preferences or anonymousClientId.

Public Managerial's published measurement registry is pinned in audit_tools/telemetry_contract/public-release-registry.json so private transport updates do not rewrite public local-only artifacts. It is an explicit release input, not a new public-game release.
