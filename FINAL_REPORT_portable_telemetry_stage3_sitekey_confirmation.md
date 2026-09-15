# Stage 3 sitekey follow-up confirmation

The owner reported HTTP 201 and a successful ZIP download after the isolated staging redeployment. The downloaded `my-faculty-mastery-quest (22).zip` passed all four minimal generated-game checks. This follow-up preserves the prior Stage 3 acceptance; no Stage 4 work was performed.

Starting branch: main. HEAD: 71322f3a5703552866f4051c7300c9a036c97678. Initial working tree: clean.

The exact public sitekey was already present in local and served staging HTML before redeployment. No Composer implementation change was needed. Only the retained staging bundle was republished, version 22c766ea-be10-481e-8e4a-8d5eadf5666d. The cause of the earlier undefined browser query remains unconfirmed. Automated ordinary-browser inspection stopped because Computer Use could not determine the browser URL; the owner subsequently confirmed real-provider issuance and download. A final HTTP read confirms the public meta remains present.

## New download verification

- Exactly one D1 row matches the downloaded capability. Its hash, game/build/version/schema tuple, and timestamps match the descriptor; lifetime is 31,536,000 seconds (365 days). The raw capability is absent from the row.
- There are three issuance rows for this build, including prior proofs. No pre-issuance baseline was captured for this latest manual action, so this follow-up does not claim an independently observed one-row count increase.
- A short generated-game run sent X-MQ-Ingest-Token and received HTTP 202 from staging. Events and receipts match the build and exact capability. Local CSV excludes the credential and digest. Game automation did not interact with Turnstile or perform issuance.
- Live tail captured two ingest events with two redacted headers, zero raw capability matches, zero digest matches, and zero unrecognized header replacements. This follow-up tail started after manual issuance; it does not independently capture that issuance or replace the earlier accepted issuance-tail evidence. No secret or challenge token was read.
- The downloaded test capability was revoked after proof. Final staging capability counts: three total, zero active. The proof tail was closed.

The first harness attempt incorrectly assumed this reused build had only one issuance and stopped before gameplay. A subsequent staging API attempt returned HTTP 403; refreshing the existing Wrangler session allowed the proof to complete. Final checks passed without changing application behavior or security requirements.

## Scope and retained resources

Worker: masteryquests-telemetry-stage3-staging. D1: 993f49a5-4dd4-41ee-9007-bbf4bb4856c9. Domain: https://stage3.masteryquests.org/. Worker/D1 binding identity was checked. The staged verifier is byte-identical to canonical source. All resources remain retained for separately authorized Stage 4 work.

No production calls, deployments, configuration changes, migrations, secret access, architecture changes, contract changes, retention changes, or activation/verifier implementation changes occurred in this follow-up. The newly downloaded game remains locally playable; its revoked test capability no longer authorizes remote ingestion.

Changed files are this report, the follow-up harness `audit_tools/telemetry_governance/stage3-staging/sitekey-confirmation-game-proof.mjs`, sanitized evidence under `validation_artifacts/portable_telemetry_stage3_sitekey_confirmation/`, and staging resource bookkeeping in `validation_artifacts/portable_telemetry_stage3_staging/resources.json`. Prior acceptance evidence is preserved. Existing regression suites were not repeated because no application source changed. `git diff --check` passed.
