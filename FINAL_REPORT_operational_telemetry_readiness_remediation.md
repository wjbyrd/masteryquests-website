# Operational telemetry readiness remediation

## Task Identity

OPERATIONAL_TELEMETRY_READINESS_REMEDIATION_V1. Completed locally on 2026-09-12.

**READY FOR CONTROLLED ACTIVATION.** This is readiness of the remediated local implementation, not evidence that production has been updated. Activation remains a separate authorized task with provider verification and rollback preparation.

Mastery Quests telemetry is operational product/instructional analytics: improve games/content, understand aggregate usage and support future aggregate faculty views. This task adds no research/IRB workflow, consent requirement or research retention policy.

## Repository

Authorized root and working directory: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`. Branch `main`; HEAD `6a5bbba835fcc9ce2b3c212e57580563db52b43d`. Write access verified by creating the requested evidence directory. No reset, commit or push. The forbidden alternate workspace was not accessed.

Initial untracked work was the prior readiness report, activation runbook and `validation_artifacts/operational_telemetry_readiness/`. The historical report/evidence were preserved; the runbook was updated as requested. [preflight.json](validation_artifacts/operational_telemetry_readiness_remediation/preflight.json) records initial state and tracked-file hashes. Final scope evidence checks protected files and unchanged contract/policy sources against that baseline.

## Inherited Findings

| Finding | Inherited issue | Remediation disposition |
|---|---|---|
| B1 | Missing/invalid permission enabled transport; no Composer faculty control | CLOSED: explicit default-OFF faculty setting and fail-closed runtime hierarchy. |
| I1 | Browser UUID reused throughout a build family | CLOSED: build-specific transport namespace; no adoption of old family UUID/queue. |
| I2 | National Engine identifying Power Automate transport | DOCUMENTED EXCEPTION / NON-BLOCKING FOR ANONYMOUS D1 ACTIVATION. Not fixed or modified. |
| I3 | Unauthenticated/best-effort ingestion and spreadsheet interpretation risk | OWNER-ACCEPTED OPERATIONAL LIMITATION; rate parsing and CSV serialization hardened. |

These supersede the corresponding readiness dispositions in the historical audit; they do not revise the historical evidence.

## Faculty Toggle Implementation

Location: Composer **Game details → Allow anonymous data collection**, in `build/faculty-build-composer/index.html`. The checkbox is initially unchecked and includes the requested concise operational-purpose/application-identifier explanation. Layout and keyboard-native checkbox behavior remain part of the existing Composer UI.

`composer.js` stores the choice in its existing state/recipe path. `composer-core.js` handles import migration, canonical recipe and generated config. The sole valid enabled representation is boolean `true` in **allowAnonymousDataCollection**. Every other value normalizes to false. Existing recipes without the property reopen OFF. Actual UI recipe downloads were checked with ON and OFF, not just source-string inspection.

Generated FACULTY_COMPOSITION_CONFIG contains the choice. The measurement manifest allowlist excludes it; it is not an event field. OFF builds omit the anonymous adapter entirely. ON builds embed `anonymous-telemetry-source.js`, maintained by `audit_tools/telemetry_governance/composer-transport.mjs`, and that adapter independently checks the runtime boolean. The faculty generation choice is inspectable in both the recipe and generated config.

The generated Composer transport derives from the existing private adapter. It maps already-recorded local rows and reuses Composer's existing measurement contract instance. It does not install a second local measurement tracker or restamp local rows. Empty local timing cells become null in the existing remote timing fields, preserving “not observed” rather than inventing zero. The fixed Composer endpoint is `https://masteryquests.org/api/anonymous-telemetry-poc/v1/events`. Test traffic is intercepted locally.

Both maintained private builders now default disabled and accept an explicit option:

```text
node audit_tools/anonymous_telemetry_poc/create_private_build.mjs . --allow-anonymous-data-collection
node audit_tools/managerial_classroom/build.mjs . --allow-anonymous-data-collection
```

Omitting the flag generates disabled output. Classroom's programmatic option is `{allowAnonymousDataCollection:true}`; strings/truthy values do not enable it. The eight prepared private game HTML files are OFF; only their collection metadata changed. Existing synthetic browser fixtures explicitly opt in rather than relying on permissive defaults. Builder tests exercise both options in isolated local output.

## Authority Hierarchy

| Faculty/build setting | Browser preference | Result |
|---|---|---|
| OFF, absent or invalid | Missing, ON attempt or any other state | OFF |
| Explicit ON | No opt-out | ON |
| Explicit ON | Opted out | OFF |
| Explicit ON | Explicitly re-enabled | Future events only |

`remoteEnabled()` is checked during emission, scheduling and flushing. `setRemoteCollection(true)` cannot override a disabled build. Disabling clears pending unsent events, retry timer and sent-manifest state and records cancellation. Already in-flight/accepted requests cannot be recalled; retained accepted rows still follow normal retention. Local recording/download remains independent.

An old restrictive browser opt-out is carried forward into the new scope until the user explicitly re-enables. Old opt-in, UUID and queued records are not adopted. This avoids undoing an existing privacy restriction during upgrade.

## Fail-Closed Validation

Private meta permits only the exact value `enabled`. Composer permits only boolean true. No permissive string/number truthiness. Missing config, empty string, whitespace, unknown string, string true, numeric 1, null, invalid browser preference, unresolved build identity, throwing configuration access, storage access exceptions, malformed JSON transport state and inconsistent queued client/build identity prohibit transport.

[toggle-state-matrix.json](validation_artifacts/operational_telemetry_readiness_remediation/toggle-state-matrix.json) records 35 private meta/preference combinations, including every previously reproduced fail-open case. Exception/build-resolution cases are tested separately. Actual generated HTML variants exercise absent/false/empty/whitespace/unknown/string-true/number/null/unreadable permission with working gameplay and real local CSV downloads. Corrupt whole-file JavaScript is not claimed to be recoverable; the tested guarantee concerns missing/invalid setting and storage values within a functioning generated artifact.

## Pseudonym Scope

Old behavior: a family-level localStorage UUID persisted across the family's games and builds.

New behavior: identity, queue, sequence counters, run mapping, active run, quality and browser preference are in an `anonymousTelemetry:build:v2:` namespace. Private game scope uses existing buildId plus measurement buildRevision. Composer uses existing compositionFingerprint plus measurement buildRevision; existing central buildId is `composer-<compositionFingerprint>`. No new centrally transmitted identity/config field was introduced.

The composition fingerprint distinguishes existing canonical faculty build configurations, including their slug/settings. Measurement buildRevision distinguishes artifact/engine/content/tracker configuration. Exact regeneration of the same recipe/artifact is deliberately the same logical build; this is not a new random identity on every download. Different configuration or artifact identity is isolated. Private game artifacts can have separate pseudonyms even within the same family, a narrower scope than before.

Migration: old family UUID and queue remain dormant local historical state. They are never merged, rewritten, restamped or replayed by the new client. Historical D1 data remains unchanged under 730-day retention. Valid current queued events keep their original IDs on retries/reload; malformed or inconsistent current transport state fails closed and cancels unsent delivery. Local game history/downloads remain available. Clearing storage generates a new UUID.

Real browser tests prove stable pseudonym across runs/reload for the same build/browser, distinct pseudonyms for different generated configurations in one browser, distinct fresh profiles, and fresh identity after storage clearing. Old family UUID is not adopted; old queued sentinel never reaches the Worker. A restrictive old opt-out remains OFF until explicitly re-enabled. [pseudonym-scope.json](validation_artifacts/operational_telemetry_readiness_remediation/pseudonym-scope.json) and the full remediation results preserve outcomes.

A pseudonym is not a unique student. Runs can still be linked inside one build, and source-run identifiers or exact timestamps can support external linkage to submitted local records. This remediation narrows linkage; it does not promise anonymity against all auxiliary information.

## Legacy National Engine

**LEGACY IDENTIFYING TELEMETRY — OUTSIDE OPERATIONAL ANONYMOUS D1 ACTIVATION.**

National Engine files are unchanged, including `play/macro-command-system/national-engine/index.html` and `nationalengine.html`. Their separate user/email/userAgent Power Automate transport remains a future cleanup task requiring its own authorization. No endpoint call or identifying test data was sent. No endpoint credential is reproduced here.

The release claim is limited: **Public Managerial/default Composer builds are local-only unless explicitly configured for anonymous collection; a separate legacy National Engine transport exists outside this anonymous telemetry system.** Public Managerial has no new opt-in transport; Composer's default remains OFF.

Worker-only activation does not require a root-site/static deployment or a National Engine edit. A later Composer/static release is necessary to deliver the new UI/adapters to browsers; that release must preserve National Engine byte-for-byte. No speculative exclusion or live-game breakage was introduced. I2 is documented, not “fixed.”

## CSV Export Safety

`server/anonymous-telemetry-poc/transport-safety.mjs` supplies the Worker CSV serialization transform. STRING cells beginning with =, +, -, @ after whitespace, or leading tab/CR/LF (including space-prefixed controls), receive an apostrophe. Normal strings remain unchanged. Numbers—including negative numeric scores—remain numbers and are not prefixed. CSV quoting continues to escape commas, quotes and embedded newlines.

The transform occurs only in Worker admin CSV serialization. D1 values, event field/column sets and local gameplay CSVs do not change. Admin CSV is a spreadsheet-safe representation rather than byte-identical malicious text. Existing authenticated `/v1/admin/runs/<UUID>` JSON provides exact structured raw values. The existing governance sidecar hashes the actual emitted safe file; no new format or contract version.

Tests insert permitted malicious strings including =1+1, +SUM(A1:A2), -1+2, @SUM(1,1), whitespace variants and control prefixes into local synthetic D1. Actual Worker CSV is parsed and compared, raw JSON is checked unchanged, negative numeric score -2 stays unchanged, ordinary quoted multiline text round-trips, and the hash-bound sidecar validates. [csv-safety.json](validation_artifacts/operational_telemetry_readiness_remediation/csv-safety.json) records input/output pairs. This verifies the conventional neutralizing representation, not every third-party spreadsheet/import setting; do not strip the prefix or interpret untrusted text as formulas.

## Rate Configuration Hardening

Approved default remains **300 events/client/minute**. Parser accepts numeric safe integers or decimal digit strings in **50–10,000**. Missing, empty, booleans, malformed, fractional, nonfinite, negative, zero, whitespace-padded, below-minimum and above-maximum values fall back to 300. NaN cannot disable comparison. Tests cover valid boundary/default values and invalid cases. Synthetic harness's previous out-of-range quota was changed to the valid test ceiling, not the production config.

CORS remains exact browser-origin control, not authentication. UUIDs can be changed; rate accounting remains best effort and its SELECT/UPSERT reservation is not atomic. No student authentication, Canvas identity or fingerprinting was added. The owner explicitly accepted this operational architecture in the remediation request. Analytics are instructional/product signals, not tamper-proof records; high-stakes decisions must not rely on them alone.

## Frozen Contract Verification

Unchanged: **mq-measurement/1**, **mq-governance/2**, **mq-disclosure/2**; anonymous envelope 3; local CSV/manifest versions. Canonical schema, release definitions, measurement runtime/validator, telemetry-core field allowlists, D1 migrations, retention policy, manual deletion and scheduled handler are hash-checked against preflight.

Generated artifact/registry fingerprints were refreshed because implementation/configuration changed. Those hashes are provenance, not new contracts or measurement fields. Public Managerial's generated local adapter and Composer template changed only in their embedded registry where applicable; protected engines/question banks were not redesigned. Generator, parity sync, dictionary and governance renderer check modes pass.

## Centralized Field Inventory

Before: **81 accepted event-level fields**. After: **81**, in the same ordered set. Added: **0**. Removed: **0**. Admin CSV remains **81 columns**; maintained local Managerial remains **87**, Composer **116**.

[field-inventory-diff.json](validation_artifacts/operational_telemetry_readiness_remediation/field-inventory-diff.json) verifies the inherited inventory and unchanged canonical sources. The original [complete field inventory](validation_artifacts/operational_telemetry_readiness/FIELD_INVENTORY.md) remains the reference for field meaning, with this report superseding its old cross-build pseudonym-scope and raw CSV representation descriptions.

Faculty permission stays in build configuration and is absent from the envelope/measurement manifest. Build scoping reuses anonymousClientId, buildId and buildVersion. CSV changes serialization only. No names, emails, Troy/SIS/Canvas IDs, course ID, free-text response, device fingerprint or new direct identifier appears. Composer identity uses opaque existing configuration/artifact fingerprints rather than transmitting its entered title/slug as a new field.

## Public / Default / Private Transport Matrix

| Target/state | Central transport | Local CSV/gameplay | Evidence |
|---|---|---|---|
| Public Managerial | None | Works | Public suite 103/103 and real downloads across four games. |
| Default Composer OFF | Adapter omitted; none | Works | Generated real game plus downloaded CSV validation. |
| Explicit Composer ON | Allowed | Works | Real generated events accepted by local Worker; run manifest/answer context present. |
| Missing/invalid/unreadable Composer permission | None, including browser ON attempt | Works | Nine invalid/missing runtime variants; local downloads. |
| Browser opt-out under ON | No future delivery; no cancelled replay | Works | Reload, disabled play/download and future-only re-enable. |
| Private POC/classroom prepared defaults | None | Works | Both builders/default pages and browser checks. |
| Private POC/classroom explicitly enabled fixture | Allowed | Works | Actual synthetic Worker ingestion plus private mode regressions. |
| Legacy National Engine | Separate identifying transport remains | Untouched | Protected-file hash check; no endpoint test. |

[toggle-transport-matrix.json](validation_artifacts/operational_telemetry_readiness_remediation/toggle-transport-matrix.json) contains observed counts for the focused synthetic cases. Counts are events, not requests or students. Browser tests intercept central endpoint requests and invoke a local in-memory Worker fixture; no production POST occurred.

## Local Student Transparency

Local Download Game Data is preserved in every tested setting, including invalid config, browser opt-out and unavailable/malformed transport storage. Actual downloaded files pass the existing local CSV validator. Composer retains its own measurement producer; private adapters retain existing local parity logic. Local historical records are not relabeled during migration.

Existing mq-disclosure/2 remains in enabled adapter notices, with dynamic enabled/disabled status. OFF generated builds retain their local notice and contain no anonymous transport adapter. Names or deliberate student submissions elsewhere must not be confused with the anonymous event envelope. Provider logs/network metadata and downloaded copies remain separate custody domains.

## Dashboard Readiness

No dashboard built. Existing runId, mode, gameId/build provenance, questionId/conceptId/learningObjective/questionType, correct/acceptedAttempt and response/visibility fields still support aggregate run/mode counts, completion, accuracy, missed questions/topics/objectives and timing. Build-scoped pseudonyms do not change those denominators.

Do not use anonymousClientId as student count. Partition versions/builds, exclude synthetic runs, account for missing/incomplete delivery and the existing 50,000-row export cap, and avoid small-group identification or unnecessary pseudonym exposure. Behavioral fields remain contextual signals, never automatic cheating scores.

## Retention / Governance Regression

**730-day whole-run operational retention unchanged**, using latest stored server receipt and daily target **17 4 * * *** (04:17 UTC). No production cron activation. Exact boundary, straddling/recent/late events, incomplete/legacy runs, atomic rollback, repeat/overlap and failure reporting remain covered. Governance **14/14** and scheduled **11/11** pass. No research retention introduced.

## Authorization Regression

ADMIN_TOKEN remains required for reads/export. Manual destructive maintenance and its preview still require ADMIN_TOKEN plus distinct MAINTENANCE_TOKEN. Missing/wrong/equal maintenance fails. Scheduled retention remains internal authority without either token. CORS approved origins and rejected-origin behavior are preserved. No secret was provisioned, read from credential files, embedded in builds, rotated or exposed.

## Test Results

Evidence root: [operational_telemetry_readiness_remediation](validation_artifacts/operational_telemetry_readiness_remediation/).

| Gate | Result | Evidence |
|---|---|---|
| Focused remediation: UI/builders, fail-closed matrix, generated games, pseudonym/migration, CSV/rate/CORS/auth, field inventory | 27/27 PASS | remediation-results.json; toggle-state-matrix.json; toggle-transport-matrix.json; pseudonym-scope.json; csv-safety.json |
| Measurement contract | 16/16 PASS | targeted-results.json; contract.log |
| Existing private timing/Worker parity | 16/16 PASS | parity-results.json |
| Governance/admin/CLI/export custody | 14/14 PASS | governance-results.json; governance.log |
| Scheduled retention | 11/11 PASS | scheduled-results.json; scheduled.log |
| Existing real downloads/refresh/opt-out: 12 Managerial targets + Composer | 17/17 PASS | existing-browser/browser-results.json |
| Private browser modes and Worker/D1 | 29/29 PASS | private-browser/browser-results.json |
| Public browser/local-only | 103/103 PASS | public-browser/results.json |
| Active Composer regression runners | 27/27 PASS | composer-suite.log |
| Dictionary, generated registry/adapters, private default config, governance renderer | PASS | final-readiness-evidence.json |
| Protected-file/contract scope and whitespace | PASS | final-readiness-evidence.json |

All data tests are synthetic/local. Tests initially exposed fixtures that assumed default ON and a Composer timing-empty-cell mapping issue. Fixtures now opt in explicitly and transport maps unavailable timings to null; passing final results do not suppress a runtime validation failure. Real UI recipe export was tested after importing a valid selected-concept recipe, matching the Composer's existing download requirement.

The new browser runner uses the maintained generated-game helpers and Worker fixture, allows only its local server/data URLs, and intercepts central telemetry before network transmission. It never invokes National Engine. Existing public/private browser suites also restrict traffic locally. No claim of production load, deployed version, actual Cloudflare trigger or provider logging validation is inferred.

## B1 / I1 / I2 / I3 Final Disposition

**B1: CLOSED.** Real faculty checkbox, recipe/config persistence, default OFF, explicit true only, browser restrictions and generated-game proof.

**I1: CLOSED — build-scoped pseudonym implemented and documented.** Same logical build/browser stability with cross-build isolation and safe historical-state handling; no new identity field.

**I2: DOCUMENTED EXCEPTION / NON-BLOCKING FOR ANONYMOUS D1 ACTIVATION.** National Engine remains unchanged outside this system. A separate future cleanup task is required to alter it.

**I3: OWNER-ACCEPTED OPERATIONAL LIMITATION.** Existing unauthenticated/best-effort architecture retained; invalid rate settings and spreadsheet-facing CSV hardened. No tamper-proof or unique-student claim.

## Updated Activation Runbook

`C:\Users\Jennings\Documents\GitHub\masteryquests-website\server\anonymous-telemetry-poc\PRODUCTION_ACTIVATION_RUNBOOK.md`.

Updated with faculty config/authority hierarchy, explicit private build options, scoped pseudonym/migration, preserved legacy boundary, safe CSV/raw JSON distinction, current test commands and ten specific toggle/export/identity smoke cases. Deployment/secrets/provider checks, exact synthetic UUID cleanup, 730-day test limits and rollback structure remain. Worker-only deployment does not release the Composer UI; later static/generated release must preserve National Engine unchanged. The runbook was not executed.

## Production State

**NOT DEPLOYED / NOT MUTATED.** No production event POST, D1 query/mutation/deletion, secret rotation/provisioning, cron modification or Worker deployment occurred in this remediation. The earlier audit's health response remains historical evidence only; no new production-state discovery was needed. Local synthetic SQLite mutations are test fixtures, not production D1 operations.

## Remaining Owner / Provider Checks

During separately authorized activation, verify actual Cloudflare account/Worker version and rollback version, route, D1 database UUID/binding/migrations, nonsecret vars, distinct named secrets, cron registration/execution, account/API access, logging/observability/security metadata, backups/Time Travel and downstream export custody. These remain external checks rather than local-code blockers or presumed failures.

Preserve the privacy boundary: the anonymous application excludes intentional direct participant fields but holds build-scoped pseudonyms and contextual events. Cloudflare can process IP/network metadata separately. D1 purge does not erase provider logs, backups or downloaded/submitted files. Do not claim completely anonymous everywhere.

## Final Status

READY FOR CONTROLLED ACTIVATION
