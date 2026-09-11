# Telemetry contract hardening — release report

**READY TO FREEZE** the locally validated measurement baseline. This verdict does not authorize deployment or settle institutional retention/access policy. No material current measurement, join, provenance, collection-control, privacy or compatibility defect remains in the tested scope. Historical missing evidence remains explicitly unknown.

## Scope and baseline

Repository: Mastery Quests website. Baseline was clean before edits. Read current code and the prior telemetry/local CSV/published parity/dictionary/Composer maintenance reports as supporting evidence. The prior 57- and 75-column Managerial schemas reused CostDirective-local-telemetry-v5-engine2 despite timing changes; future rows now identify their actual measurement contract. No historical rows are restamped.

Baseline Composer: **27/27 PASS**. Baseline synthetic timing/backend: **16/16 PASS**. Baseline synchronization PASS and dictionary **75 fields across 12 schemas PASS**. Historical public static gate: **10/11**, with the already-stale composer_library_manifest.json hash. See baseline logs and inventory in [evidence](validation_artifacts/telemetry_contract_hardening/README.md).

Final protected-file comparison: **4844 baseline files, 30 deliberately changed existing files, 4814 byte-identical files, zero out-of-scope changes**. All twelve Managerial engine comparisons pass after removing only the exact telemetry metadata additions (collection meta/resource ID attributes and the two original-option-index lines). Original options, RNG calls, answer verification, save logic and educational rules remain unchanged. Frozen student-active Macro games/hubs, older Micro/Macro games, content banks, graph assets, PDFs, LO mappings and unrelated refreshed documentation are unchanged. No generator rewrote frozen games. Composer affects future generated files only.

## Five-area completeness matrix

Status describes the baseline; Action describes the final repair or intentional boundary. Machine-readable source: [requirements.json](audit_tools/telemetry_contract/requirements.json). Every added field/event/component has necessity, destination, granularity, units, null and privacy rationale in [additions.md](audit_tools/telemetry_contract/additions.md).

| Analysis question | Existing evidence | Source | Export location | Status | Action |
|---|---|---|---|---|---|
| Provenance: Which implementation generated a response? | Legacy gameVersion and reused v5-engine2 label; recipe and phase were independent | release.json; generate.mjs; runtime.js build/stamp | All current CSVs; private extras_json | MISSING | Resolved: stamp measurement revision and immutable manifest reference at creation; actual engine/tracker/content/assets/configuration digests. |
| Provenance: Can configuration be recovered offline after refresh? | Config existed in the generated HTML; no retained export manifest | runtime.js config/exportRows | export_manifest / run_manifest | MISSING | Resolved: allowlisted immutable manifest embedded in the same CSV, persisted per run/segment; preserve old segments. |
| Provenance: Can historical bank contents be reconstructed from a CSV alone? | Original controlled authoring/build artifact and bank identifiers | TELEMETRY_CONTRACT.md | Controlled release archive, outside telemetry | INTENTIONALLY EXCLUDED | Keep question/answer text out of telemetry; retain reviewed generated HTML/authoring artifacts. Old unversioned saved questions remain unresolved. |
| Attempts/options: Which rows are accepted responses? | Local question; private answer_evaluated and acceptedAttempt/legacy rules | sendGameData; telemetry-client; validate.mjs | Stream-specific existing event columns | ALREADY CAPTURED | Preserve filters and exclude drafts, rapid guesses, metadata and duplicate transport/feedback from response counts. |
| Attempts/options: Which view, revision and commitment belong together? | runID + room/questionID ambiguous for repetitions; exam navigation exists | runtime.js show/stamp; existing reset hook | All current streams | MISSING | Resolved: view-scoped presentationID, attemptID shared with private stream; exam revisits retain attempt, rapid rejection advances it. |
| Attempts/options: Which canonical option was selected after shuffling? | selectedIndex is displayed order; questionID alone cannot invert shuffle | shuffleOptions and runtime.js | canonicalSelectedIndex + contentRevision | MISSING | Resolved: carry original option ordinals through the exact existing swaps; no extra RNG call, text export or answer-verification change. |
| Attempts/options: Was this a lifetime-first learner exposure? | Existing firstExposure/priorExposureCount have bounded producer scope | Dictionary exposure definitions | Existing local fields only | INTENTIONALLY EXCLUDED | Document actual run/browser scope. No learner identity or cross-device history added. |
| Assistance/remediation: Was an artifact earned, owned, activated or applied? | Existing artifact award/ownership/action fields distinguish stages | Existing Composer/private artifact hooks | Existing artifact fields; supportJSON | ALREADY CAPTURED | Keep award/action events; supplement submission-time effect snapshot, without duplicate reward events. |
| Assistance/remediation: What help/removal existed before this answer? | Runtime hint, artifact removal and mode-faded state; export insufficient | runtime.js stamp | supportJSON | MISSING | Resolved: immutable hint/effect flags, canonical removed-option arrays and remaining count. Exam commitment reuses recorded draft support. |
| Assistance/remediation: Which miss initiated remediation? | Existing stage and question IDs cannot reliably disambiguate repeated misses | runtime.js lastMiss/stamp | originAttemptID | MISSING | Resolved for newly observed ordinary miss to repair/bridge/retest; null for unobserved historical origin. |
| Assistance/remediation: Was a recommended resource offered or activated? | Existing report anchors and stable authored resource IDs | report wrapper and delegated activation listener | resource_offered/resource_activated + resourceID | MISSING | Resolved: observe existing offers/activations, omit raw URLs. Offer once per resource/run. |
| Assistance/remediation: Was feedback/PDF read or did it improve cognition? | Policy/engine identifies availability; clicks do not prove reading | Engine manifest; existing mode policy | Manifest availability; no reading event | INTENTIONALLY EXCLUDED | Remove unobserved duplicate private feedback_shown emission; keep legacy support. No dwell, PDF-load, graph-zoom or cognition inference. |
| Delivery: Can measured visible/hidden/focus time be interpreted? | Synchronized validated clocks and behavioral counts | Composer tracker; sync-composer-behavior.mjs | Existing timing fields | ALREADY CAPTURED | Retain units, overlapping focus, conditional nulls, exam aggregation, reset and readiness boundaries. |
| Delivery: Can retry duplicates and missing ranges be detected? | Private event UUID/sequence exist; local UUID exists but no creation sequence | Private queue; runtime.js stamp | Existing remote sequence; new localSequence | MISSING | Resolved local sequence; preserve private IDs across retries. Validator detects duplicates/gaps, missing manifests and uncertain completion. |
| Delivery: Is queue/storage loss observable and can valid records progress? | Existing bounded queue silently evicted; poison batch could repeat | telemetry-client; runtime.js exportRows | deliveryQuality, manifest metadata | MISSING | Resolved counted overflow/cancellation/storage/rejection, required-manifest retention, singleton poison isolation and explicit acknowledgments. |
| Delivery: Can we prove completeness after total storage loss? | No surviving browser evidence can prove discarded history | Contract delivery limits | Validator limitations | INTENTIONALLY EXCLUDED | Report observed loss and absent completion only; no heartbeat or abandonment inference. |
| Collection: Does private disabled collection prevent future queue replay? | Private disclosure existed; effective persisted control was insufficient | Maintained builders and private client | Checkbox + build meta; local quality metadata | MISSING | Resolved real persisted switch, initialization/enqueue/flush/retry/page-exit guards, pending cancellation and refresh/re-enable tests. |
| Collection: Are public/default Composer builds local-only? | Public derived adapter excludes transport and private identity | Public sync and generated Composer browser tests | Local storage/CSV only | ALREADY CAPTURED | Preserve zero remote telemetry requests and no new persistent browser identity. |
| Collection: Does disabling erase previously accepted records? | Browser cannot retract in-flight/accepted data | Contract governance handoff | Owner/admin process, outside this task | INTENTIONALLY EXCLUDED | Cancel pending events only; owner decides retention, access and treatment of accepted data. |

## Before/after identities and current educational-model provenance

Canonical identities are maintained in [release.json](audit_tools/telemetry_contract/release.json); the actual artifact fingerprints are in [registry.json](audit_tools/telemetry_contract/registry.json), retained also with validation evidence. This table is the release comparison, not a second editable registry.

| Stream | Before | Contract 1 |
|---|---|---|
| Public Managerial local | 75 columns; ambiguous per-game v5-engine2 label, also used for historical 57 | 87 columns; tracker mq-tracker-2026.09.10-contract1; contract mq-measurement/1; Managerial ordered schema |
| Private classroom/POC local | Same 75-column analytical CSV | Same 87-column ordered schema; private queue quality additionally available |
| Composer local | 104-column template export; existing v4 measurement label | 116 columns; same new measurement contract; distinct Composer ordered schema |
| Private transmission/admin CSV | Envelope 2, supported legacy 1; 69 admin fields | Envelope 3, legacy 1/2 still accepted; 81 fields; extras_json persistence; unchanged phase/auth/endpoint |
| Educational engine/model | Actual engine/parity/template source; no independent trustworthy numerical model release | Initial SHA-256 baseline of current source; engineRevision is conservative source provenance, not a claim of a new educational algorithm |
| Content/assets/config | Runtime banks, graphs and configuration existed but were not immutably recoverable from export | contentRevision/assetRevision/configurationRevision/buildRevision; allowlisted offline segment manifest |
| Recipe | Actual Composer recipe schema; none for hand-authored games | Actual recipe schema preserved in Composer manifests; null for hand-authored Managerial |

The registry hashes actual working-tree bytes, including uncommitted source/assets. Runtime hashes available question and repair/bridge pools once before play. Configuration captures concept/outcome IDs, checkpoint focus, policy hash, supported modes, sampling, daily and existing mode parameters. No educational/scoring/mastery/timing algorithm changed. Full-bank reconstruction requires retaining the controlled authoring/generated artifact; this deliberately is not a public answer-key endpoint.

## Historical integrity and offline manifests

Provenance is stamped at record creation. Export copies existing rows and appends export_manifest metadata for each referenced segment, preserving legacy labels, blanks and unknown fields. Old downloads remain supported as ordered legacy schemas; the unresolved historical 57/75 label is documented, not guessed. New build/resume or mode boundaries retain old manifests and create an explicit new segment. A saved unversioned question without reliable mapping remains provenanceStatus=unresolved; it is not silently credited to today's bank.

The final real-browser suite downloaded all twelve Managerial targets plus a generated Composer game and resolved the embedded manifest without a network lookup. Managerial reload/download preserved manifest resolution. Synthetic mixed-local.csv preserves old and current rows together. The two explicitly synthetic legacy examples demonstrate the identical old label across 57/75 fields without manufacturing missing visibility measurements.

## Findings and repairs

Presentation IDs distinguish views; attempt IDs distinguish repeated questions and rejected rapid guesses while linking exam drafts, revisits and one commitment. Local and remote attempt IDs agree although event names differ. Existing local question and private answer_evaluated/acceptedAttempt response filters remain authoritative. Duplicate private feedback_shown was removed because it did not observe rendered feedback; historical records remain compatible.

Exact canonical option ordinals travel through the existing shuffle swaps, including duplicate option text. A targeted comparison verifies unchanged choice ordering, correct answer and RNG calls. Legacy unresolved mappings remain null. Exposure fields retain their actual bounded scope; no lifetime-first learner claim is made.

Existing artifact award/ownership/action hooks remain. Assistance snapshots freeze hint availability and applied artifact/mode option removal before submission; exam commits reuse the draft snapshot. originAttemptID links newly observed miss-to-repair/bridge/retest. Stable resource offer/activation IDs observe existing anchors without exporting raw URLs or claiming PDF reading. Later actions cannot retroactively assist earlier answers.

Validated Composer-derived elapsed/visible/hidden/focus/copy/selection calculations and synchronization remain intact, including conditional nulls, overlapping focus, exam multi-view aggregation and Fading Fortune/Risk & Reward boundaries. No Trial by Graph was added to ineligible games.

Local creation sequence and delivery-quality metadata expose surviving gaps/loss. Private retry preserves UUID/sequence; acknowledgments must explicitly name accepted batch IDs. Overflow is counted and needed queued manifests retained. Permanent 400/413/422 failures isolate singleton records so poison input cannot indefinitely block valid peers; transient/auth/rate-limit failures retain the queue. Null queue entries and unavailable storage are tested. A completely lost storage namespace or missing terminal event cannot establish total completeness or abandonment intent.

The real private disclosure switch persists disabled collection. Initialization, creation, scheduling, flush, retry and page exit obey it. Disabling cancels timers and clears pending events; refresh/re-enable does not replay cancelled data. A maintained builder disabled setting cannot be overridden by the checkbox. Local download remains available. Public Managerial/default Composer have zero remote telemetry transmission and no new persistent browser identity. Existing POC synthetic and classroom distinctions are preserved.

## Field/event coverage and validator reuse

Machine inventory: **179 distinct fields**, with ordered current **87/116/81** schemas and legacy **75/57/104/69** schemas. The maintained faculty dictionary now covers all **87 Managerial fields across twelve target pages**; its existing help organization remains. Stream applicability is explicit in schema.json; there is no false universal parity claim.

New local observational events are question_presented, resource_offered and resource_activated; private question presentation reuses question_shown. Private run_manifest and local export_manifest are metadata, not accepted responses. Twelve new columns are documented individually in additions.md and the dictionary.

The offline validator now completes the reusable export-QA core: quoted CSV parsing, supported ordered schema recognition, unknown-future fail-closed behavior, manifest/config hashes and references, legacy/mixed-version notices, accepted-response filtering, duplicate IDs/commits/sequences, gaps, linkage limitations, conditional null/timing checks and observed delivery/completion limitations. It emits JSON and a human summary without upload or editing input. Remaining research work is study-specific joining, controlled bank reconstruction, assessment validity and owner policy; do not build this validator twice.

## Validation results

| Gate | Final result | Evidence |
|---|---|---|
| Active Composer suite | 27/27 PASS | composer-final.log |
| Contract targeted/negative tests | 16/16 PASS | targeted-results.json |
| Synthetic backend/timing regressions | 16/16 PASS | backend-results.json |
| Actual downloads, manifest/refresh/control/storage | 17/17 PASS | contract-browser-results.json |
| Private local CSV browser regressions | 29/29 PASS | private-csv-results.json |
| Private timing/Worker browser regressions | 29/29 PASS | private-timing-results.json |
| Published Managerial browser regressions | 103/103 PASS | public-browser-results.json |
| Dictionary browser/navigation | 17 checks PASS, no-JS PASS, no browser errors | dictionary-browser-results.json |
| Twelve engine equivalences/all-file protection | PASS | protected-files.json |
| Registry regeneration, helper/public/classroom sync, POC integration, dictionary render/drift, schema inventory | PASS | final-checks.json |
| Git whitespace/conflict diff check | PASS | final-checks.json |

Evidence paths are relative to [the evidence directory](validation_artifacts/telemetry_contract_hardening/README.md). Public/private timing regressions were completed during implementation; final contract/download/backend/targeted and active Composer gates followed the final transport/storage guards. Actual downloads and final registry are retained, rather than relying only on column constants.

Negative fixtures detect stale labels, wrong/missing manifests, ambiguous accepted-attempt joins, wrong shuffle identity, duplicate exam commitment, impossible timing, forbidden support metadata and undocumented columns. Collection tests exercise the actual checkbox plus refresh/re-enable and assert no replay. Retry/overflow/poison tests assert stable IDs and valid-peer progression. SHA-256 is checked against an independent implementation; configuration/content/asset changes alter the appropriate fingerprints while an excluded faculty title does not.

The historical public static checker is retained unchanged and now reports **6/11**: four hash failures caused by the expressly authorized two-line option-index metadata additions, plus the pre-existing Composer library hash mismatch. These are not reported as five pre-existing failures. The current scope check independently compares all twelve engines after removing exactly those allowed metadata additions and protects all other baseline files. The 103-case browser regression verifies behavior. Intermediate old-schema assertions and a private forced-report fixture lifecycle error were corrected without deleting behavior assertions; isolated VM writer tests now load their actual metadata dependency. Composer's theme guard compares production bytes before/after its test instead of rejecting unrelated pre-existing workspace edits. No historical hash baseline was rewritten to make the old gate green.

## Privacy and governance handoff

Collected data: existing performance/timing/behavior counts and bounded new run/attempt/support/delivery metadata. Purpose: interpret mastery/adaptive evidence and export quality. Granularity: run/segment/view/attempt/lifecycle/resource action. Location: browser storage and CSV; private builds additionally use the existing Worker/D1 path. Existing private random browser UUID links browser runs, not a verified person. No new public persistent identity, browser fingerprint, demographics, unrelated-tab surveillance, clipboard contents, keystrokes, question/answer text, personal title/name, email, access code, secret, local path or private URL enters new metadata. Allowlisted JSON is validated at ingestion and export is round-trip tested using local synthetic D1-compatible fixtures. Existing local display-title fields are preserved; the privacy claim concerns the added analytical metadata and private allowlist, not deletion of existing local data.

Transmission control cancels unsent private events only. It cannot retract in-flight requests, erase accepted records or update already distributed immutable builds. Admin authentication, CORS/origins, rate limits, endpoint configuration and database schema remain unchanged; extras_json avoids a migration. No production database operation, deployment, commit, push or learner-data access occurred.

Owner decisions still required: retention duration, export/admin access responsibilities, handling of previously accepted data, browser/download custody and infrastructure logging/retention. No retention period, institutional compliance or cognition/misconduct inference is invented. PDF accessibility remains a separate pre-paper task; PDFs are unchanged. These policy decisions do not prevent freezing this explicit technical measurement baseline, but remain necessary before an institutional collection decision.

## Canonical maintenance and deployment order

See [tooling README](audit_tools/telemetry_contract/README.md) for exact commands and [contract](TELEMETRY_CONTRACT.md) for semantics. Maintained release/runtime/private client sources generate the registry, embedded template, classroom and public adapters. Dictionary fields.json generates its page. POC refresh preserves reviewed engine/award hooks; do not reclone over them. Archive the reviewed registry/generated HTML/authoring artifacts with each release. If separately authorized, deploy Worker schema acceptance before private schema-3 clients, then static adapters/Composer/dictionary. No migration or deployment was performed here.

## Exact files changed

Existing files (30):

- audit_tools/anonymous_telemetry_poc/create_private_build.mjs
- audit_tools/managerial_classroom/build.mjs
- audit_tools/managerial_local_csv_parity/run-browser.mjs
- audit_tools/managerial_telemetry_parity/run-browser.mjs
- audit_tools/managerial_telemetry_parity/run-parity.mjs
- audit_tools/published_managerial_parity/browser.mjs
- audit_tools/published_managerial_parity/sync.mjs
- audit_tools/telemetry_data_dictionary/browser.mjs
- build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html
- build/faculty-build-composer/tests/run_phase3a_official_theme_validation.js
- build/faculty-build-composer/tests/run_visibility_aware_telemetry_validation.js
- how-to/telemetry-data-dictionary/fields.json
- how-to/telemetry-data-dictionary/index.html
- play/managerial-directorate-classroom/agency-protocol/index.html
- play/managerial-directorate-classroom/cost-directive/index.html
- play/managerial-directorate-classroom/market-signal/index.html
- play/managerial-directorate-classroom/strategy-desk/index.html
- play/managerial-directorate-classroom/telemetry-client.js
- play/managerial-directorate-telemetry-poc/agency-protocol/index.html
- play/managerial-directorate-telemetry-poc/cost-directive/index.html
- play/managerial-directorate-telemetry-poc/market-signal/index.html
- play/managerial-directorate-telemetry-poc/strategy-desk/index.html
- play/managerial-directorate-telemetry-poc/telemetry-client.js
- play/managerial-intelligence-directorate/agency-protocol/index.html
- play/managerial-intelligence-directorate/cost-directive/index.html
- play/managerial-intelligence-directorate/local-telemetry.js
- play/managerial-intelligence-directorate/market-signal/index.html
- play/managerial-intelligence-directorate/strategy-desk/index.html
- server/anonymous-telemetry-poc/telemetry-core.mjs
- server/anonymous-telemetry-poc/worker.mjs

New maintained files:

- audit_tools/telemetry_contract/additions.md
- audit_tools/telemetry_contract/browser.mjs
- audit_tools/telemetry_contract/check.mjs
- audit_tools/telemetry_contract/generate.mjs
- audit_tools/telemetry_contract/hash.mjs
- audit_tools/telemetry_contract/inventory.mjs
- audit_tools/telemetry_contract/README.md
- audit_tools/telemetry_contract/registry.json
- audit_tools/telemetry_contract/release.json
- audit_tools/telemetry_contract/requirements.json
- audit_tools/telemetry_contract/runtime.js
- audit_tools/telemetry_contract/schema.json
- audit_tools/telemetry_contract/scope.mjs
- audit_tools/telemetry_contract/validate.mjs
- server/anonymous-telemetry-poc/measurement-contract.mjs
- TELEMETRY_CONTRACT.md
- FINAL_REPORT_telemetry_contract_hardening.md

New synthetic evidence is confined to validation_artifacts/telemetry_contract_hardening/; its exact file inventory is evidence-files.json. No other prior reports or validation evidence were rewritten.
