# Stage 3 isolated staging setup

Status: AWAITING_OWNER_SECRET_INSTALLATION. Real-provider acceptance and Stage 4 readiness remain unproven.

Baseline: main at 61bc7fd7a4ed84990cf8991cfeb65a8b38567eec; clean working tree before setup.

Deployed only Worker masteryquests-telemetry-stage3-staging at https://masteryquests-telemetry-stage3-staging.wjbyrd.workers.dev, version f5eedc03-d47e-49b8-90ee-6c2bf657b1a1, with new D1 993f49a5-4dd4-41ee-9007-bbf4bb4856c9. Applied exactly migrations 0001, 0002 and 0003; their digests are recorded in validation_artifacts/portable_telemetry_stage3_staging/resources.json. Wrangler 4.72.0 dry-run and deployment passed.

Staging issuance/ingest are true; legacy grace false; allowed origin https://masteryquests.org; no zone routes or scheduled triggers. The canonical real Turnstile verifier is used. The supplied public sitekey is stored only in the isolated Composer configuration.

No Turnstile secret was requested, read, echoed, copied or installed. No activation request, capability issuance, gameplay ingest, provider proof or log-tail proof has run.

Existing tracked files are unchanged. Production Worker/D1/configuration/secrets, contracts, retention policy, public games and National Engine are untouched. Production migration 0003 was not applied. No production calls or production deployment occurred. Only staging was deployed.

New files: audit_tools/telemetry_governance/stage3-staging/control.mjs, setup.mjs, worker.mjs, wrangler.staging.json, composer.staging.json, README.md; validation_artifacts/portable_telemetry_stage3_staging/resources.json; this report.

Resources intentionally remain pending owner action. Follow the exact interactive command in the staging README, then confirm installation. Cleanup follows the later staging proof.

## Follow-up after owner secret installation

The owner confirmed installation. Two real-provider attempts loaded the real Turnstile widget, which displayed a human-verification checkbox. Neither completed before the challenge timeout. There were zero issuance requests, so this is not evidence of a secret mismatch or server-verifier failure. No capability was minted by the harness; generated-game ingest and redaction acceptance remain unproven. The screenshot challenge-state.png contains only the public Composer/widget UI.

Governance 14/14, readiness 27/27, retention 11/11 passed again. Incidental regenerated prior-suite evidence was restored. Canonical source remains unchanged.

Status: AWAITING_OWNER_HUMAN_VERIFICATION. Browser attempts closed and their tails were closed. The isolated Worker/D1 and owner-installed secret remain in place for the manual challenge retry; cleanup is pending completion or cancellation of the proof. No production calls, configuration changes or deployment occurred. Stage 4 remains NO-GO.

## Owner-ready retry

The real provider returned client-side error 600010 before any issuance request. Permitting documented Turnstile subdomains in the isolated harness did not resolve it. Cloudflare documents 600* as generic challenge failure associated with bot detection. Thus an automated-browser provider acceptance limitation now blocks proof; a missing secret has not been established. No verifier bypass, mock substitution, or browser stealth changes were made. Stage 4 remains NO-GO. The temporary resources remain preserved pending an owner-operated ordinary-browser first-party staging approach.

## Manual-browser gate clarification

No hosted first-party staging Composer page exists: the previous surface was browser-harness interception only. The normal-browser gate requires an authorized first-party hosting destination or an approved browser-local override workflow. See audit_tools/telemetry_governance/stage3-staging/MANUAL_BROWSER_GATE.md for exact success and safe failure-reporting criteria. No resource was deleted and no production/security configuration changed.

## Hosted manual gate ready

The owner authorized stage3.masteryquests.org. The existing isolated Worker now serves the Composer runtime bundle on that custom domain, version 38fe7f4f-c090-4412-b8fc-9e96e1c25dbf. Final bundle: 689 files; authoring reports excluded. Twelve HTTPS asset and CORS preflight checks passed. No challenge or issuance attempt occurred during hosting setup. Isolated staging source copies substitute only the exact approved hostname/origin and endpoint; canonical files and real challenge-verification requirements remain unchanged. Existing D1 and secret binding are retained. Production Worker, Composer, telemetry Worker/D1, navigation, sitemap and controlled dist were not changed. Status: AWAITING_OWNER_MANUAL_201.

## Manual 503 root cause and staging-only fix

Live markers showed TypeError before the provider response. A local workerd probe reproduced the exact failure: Workers fetch rejects redirect error and supports follow/manual. The isolated staging verifier now requests manual redirects; its existing non-2xx response check rejects every redirect without following it. A local workerd test passed seven cases: valid 200, 301/302/303/307/308, and 500; exactly one fetch per case. No real provider call was used in this test. The canonical verifier source remains unchanged and still needs this runtime compatibility correction before any eventual production release. Production was not deployed or modified. Owner manual retry remains required.

## Real provider manual issuance passed

Owner screenshot confirms build-capabilities HTTP 201. Safe live diagnostic markers confirm Siteverify HTTP 200 and success true. Scoped D1 aggregate check confirms exactly one capability with a 31,536,000-second lifetime and zero ingest events at this checkpoint. The manual provider gate is passed; generated-game ingest, receipt/manifest, duplicate, failure-continuity and tail-redaction proof remain pending the local downloaded artifact path. No further Turnstile automation is required or planned. Staging remains preserved.

## Final integration outcome

Manual provider issuance and all seven generated-game checks passed. See FINAL_REPORT_portable_telemetry_stage3_staging.md for final evidence, retained-resource status, test capability revocation and canonical runtime-fix limitation. Historical blocked statuses above are superseded by this result.
