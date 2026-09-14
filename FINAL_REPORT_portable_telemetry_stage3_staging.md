# Stage 3 first-party staging proof

Result: PASS for manual real-provider issuance and generated-game staging integration. Production was not deployed or changed. Stage 4 portability was not attempted.

Owner completed real Turnstile at https://stage3.masteryquests.org/ and observed HTTP 201. Safe provider diagnostics confirmed success; staging D1 held one issued capability with the exact 365-day lifetime. The owner-provided local ZIP was read in memory and was not copied into the repository or evidence.

Seven generated-game checks passed:
- Descriptor matches hash-only D1 capability and exact game/build/version/schema tuple.
- Generated game starts and sends X-MQ-Ingest-Token; staging returns HTTP 202; local CSV excludes the capability and its digest.
- Persisted events/runtime manifest match the build and receipts attribute its capability.
- Exact duplicate returns 202 with zero newly accepted events.
- Browser opt-out stops remote traffic while gameplay and CSV continue.
- Real D1 revocation causes 403 and stops remote sending without breaking gameplay/CSV.
- Four provider live-tail header observations were redacted; zero raw capability or digest matches.

The tested capability remains revoked following the negative test. The downloaded game still works locally. No extra challenge or issuance was automated for this proof.

An initial game assertion checked network status before the asynchronous response arrived. A bounded response wait fixed the test; the rerun passed. No production logic was altered for that test issue.

The isolated verifier required a runtime compatibility fix: Workers rejects fetch redirect error before making a request. Staging uses manual instead, with its existing non-2xx rejection preserving refusal to follow redirects. Seven local workerd response/redirect cases passed. This fix is encoded in the staging preparation script. Canonical verifier source still has the incompatible setting and requires a separate source correction and validation before release; this report does not declare the canonical release candidate ready.

Earlier regression reruns: governance 14/14, readiness 27/27, retention 11/11. Final git diff --check passed. No canonical application source changed during this staging follow-up. Contracts mq-measurement/1, mq-governance/2, mq-disclosure/2, schema 3, 730-day retention and production cron remain unchanged. Production website Worker, Composer, telemetry Worker/D1, navigation, sitemap, public games, National Engine and controlled dist are unchanged.

Evidence: validation_artifacts/portable_telemetry_stage3_staging/manual-game-results.json, manual-issuance-success.json, provider-redirect-runtime.json, manual-host-reachability.json, final-artifact-scan.json and resources.json. Prior setup/failure evidence remains historical. Final artifact scan: 31 text files, zero live capability-pattern matches. Exact capability/digest comparisons were performed in memory against CSV, event/receipt rows and live-tail data. Stored-log access was unavailable; redaction acceptance here is based on live-tail observations.

All recorded tails are closed. Worker masteryquests-telemetry-stage3-staging, custom domain stage3.masteryquests.org, D1 993f49a5-4dd4-41ee-9007-bbf4bb4856c9 and secret are retained under the latest instruction not to delete staging yet. Cleanup is not claimed complete. No secret file was read, and no secret value was printed or persisted.

Stage 4: real-provider/manual gate CLEARED; arbitrary-host proof NOT STARTED. Canonical verifier runtime correction and outstanding cleanup/release decisions remain explicit follow-ups. Production deployment status: NOT DEPLOYED.
