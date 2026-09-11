# Mastery Quests measurement contract 1

Status: release candidate; the final report records the release-gate verdict. This contract describes measurements, not educational policy or a claim of regulatory compliance.

## Canonical sources and version responsibilities

`audit_tools/telemetry_contract/release.json` is the maintained release registry. `registry.json` is its deterministic artifact inventory. `schema.json` is the machine-readable ordered schema and field inventory. The faculty dictionary remains `how-to/telemetry-data-dictionary/fields.json` and its generated page.

Current identities are measurement contract `mq-measurement/1`, tracker label `mq-tracker-2026.09.10-contract1`, manifest `mq-run-manifest/1`, local schema family `mq-local-csv/1`, and private anonymous envelope 3. The ordered schemas distinguish Managerial local (87 fields), Composer local (116), and private admin CSV (81). Recipe schema belongs to the actual Composer recipe; it is null for hand-authored Managerial games. The anonymous phase/endpoint namespace remains unchanged. Envelope versions 1 and 2 remain supported.

Product identity is the existing game/build ID. `buildRevision` in the manifest fingerprints the analytical configuration, available runtime pools, engine, tracker source and graph/assets. Private `buildVersion` carries that artifact digest. Legacy local `gameVersion` remains for compatibility; it is not the authoritative artifact revision. `engineRevision` is an initial SHA-256 source baseline, covering the actual game HTML plus the maintained Managerial parity script, or the Composer engine template. There was no independently maintained numerical educational-model release to reuse. This source baseline identifies the implemented adaptive/scoring/mastery rules without inventing historical model numbers. It is conservative: an engine source change need not imply an educational rule change. Algorithms were not changed by this contract.

The graph/asset inventory hashes actual repository bytes. The runtime content fingerprint covers available banks and repair/bridge pools once, before play; it does not hash the bank per answer. Source fingerprints include uncommitted bytes, not just Git HEAD. Canonical JSON sorts keys and excludes volatile timestamps. The generated embedded registry and `hash.mjs` derive from the same maintained helper. No browser characteristic enters a fingerprint.

## Compatibility changelog

The old Managerial `*-local-telemetry-v5-engine2` label was reused for 57-column and 75-column exports, although response timing semantics changed. Its historical label is preserved. It cannot prove which measurement implementation created a row. A newer downloader must not supply missing historical visibility measurements or relabel these rows.

Contract 1 adds twelve justified metadata columns: contract/manifest identities, provenance status, presentation and attempt IDs, canonical option position, local sequence, manifest JSON, delivery quality, assistance JSON, originating attempt and resource ID. Existing Managerial columns retain their order as the first 75 columns. Existing event vocabularies, scoring, clocks and answer verification remain intact. `question_presented`, `resource_offered`, and `resource_activated` are observational local events. Private `run_manifest` carries the segment configuration. Local `export_manifest` is export metadata, not an observed gameplay event.

Unknown future schemas/contracts must be rejected for interpretation by an older validator. A semantic change requires a new measurement revision even if column names remain unchanged. A transport envelope revision is independent of local CSV and recipe schema revisions.

## Run manifests and offline recovery

New rows are stamped when saved. The manifest and sequence state are retained alongside that run's existing local telemetry. The CSV exporter copies original rows without modifying them and appends one `export_manifest` row for each referenced manifest. Its `manifestJSON` resolves the configuration offline, after refresh, in the same one-action CSV download; no second download or network lookup is required. Missing stored manifests are reported, not reconstructed from today's configuration. Private manifest events survive in `extras_json` and flattened admin-export columns.

Manifests allowlist selected concept/outcome IDs, checkpoint focus IDs, actual recipe schema and policy hash, supported modes, sampling strategies, daily setting, fading intervals, wager ratios and mode parameters. They exclude faculty title/name, student name/initials, institution/course/email, access codes, arbitrary properties, custom asset URLs, query strings, local paths, question text and answer keys. The content fingerprint is a reference to retained authoring/build artifacts, not an answer-key service. Owners must retain released generated HTML and controlled authoring artifacts to recover historical question content; a CSV intentionally does not contain it.

Each run retains immutable configuration segments. Re-entering with a changed build creates a new segment reference without rewriting prior records or saved game progress. A resume row is labelled `resume-segment`. Existing historical responses stay historical. A question restored from an older save without an option mapping has unknown canonical selection; the validator reports that limitation rather than manufacturing a mapping. A current manifest describes the executing build and available bank; it does not prove that an unversioned legacy saved question came from that bank.

## Relationships and accepted-response rules

Local `event=question` is the accepted-response convention. `rapid_guessing` is rejected rapid-guess evidence, not another accepted response. Private accepted responses use `event_type=answer_evaluated` and `acceptedAttempt`; `answer_submitted`, `feedback_shown`, graph, stage and score events must not be counted again. Legacy private accepted-attempt rules remain in `telemetry-core.mjs`.

`question_presented` identifies a view. Repeated presentations get new presentation IDs. Exam revisits have distinct view IDs but retain the attempt identity for the room. Initial and revision records are drafts; their default zero correctness is not a committed wrong answer. Only final `question` / accepted `answer_evaluated` commits count. The local sequence is independent of private `sequenceNumber`, which is scoped to the private run. Local and private records of the same outcome share attempt/presentation IDs and the originating local sequence.

`selectedIndex`/private `selectedResponse` remains a displayed position. `canonicalSelectedIndex` is the zero-based authoring position in the referenced content bank. An index array follows the exact same swaps as the existing shuffle, including equal-text options. The metadata wrapper preserves this mapping and its content revision. There are no new random draws, option-order changes, answer text exports or verification changes. Canonical mapping correctness is tested against the actual shuffle; offline CSV alone cannot authenticate an intentionally falsified in-range canonical index without the controlled authoring artifact.

Existing `priorExposureCount` and `firstExposure` count retained local `question` and `rapid_guessing` rows. They do not count every view, span browser history, identify lifetime-first exposure, or link devices. Truncation can undercount prior exposures.

## Assistance, remediation and timing

`supportJSON` freezes the available hint flag, applied artifact removal, automatic Fading Fortune removal, canonical removed positions and remaining option count at response recording. Exam commitment reuses the last draft support snapshot. Later actions do not rewrite earlier responses. Composer's existing artifact earned/activated/failure/inventory columns remain event-specific. Older Managerial vault awards are not evidence that Composer-style active powers exist there. `originAttemptID` links an observed ordinary miss to subsequent repair/bridge/retest records; absent originating history stays unknown.

`resource_offered` observes a rendered recommendation through the existing report path; `resource_activated` observes the link action and stable resource ID. Neither proves a PDF loaded, was read, or caused improvement. No PDF-view, graph-zoom, external-tab or dwell surveillance was added. The old private feedback_shown emission was a duplicate answer-pipeline signal, not a rendering observation; contract 1 stops creating it. Historical events remain exportable. Immediate correctness feedback availability is defined by the existing mode policy (disabled in Exam Drill). No new feedback-reading claim is made. No new hints or help features were added.

`responseTimeMs` is current measured elapsed time; `activeResponseTimeMs` is visible-document time, not attention. Visible plus hidden equals elapsed within the existing two-millisecond validation tolerance. Focus overlaps visibility and must not be added to hidden time. `gameplayResponseTimeMs` retains the original Managerial gameplay clock. Existing exam multi-view sums/copy offsets, selection settling, next-question resets, Fading Fortune readiness and Risk & Reward reveal boundaries use the existing synchronized tracker. No new timer calculation was introduced.

Null/blank means unknown, uncollected or inapplicable as defined per event. A measured zero is different. Return timing requires the relevant return; copy-to-transition timing requires both a scoped copy and that subsequent transition. Draft/non-response legacy zeros remain legacy defaults. They are not measured wrong answers or misconduct evidence.

## Delivery and collection controls

Local recording retains the existing 1,500-row cap. Local sequences expose a missing prefix/range when current records survive. Export metadata carries retained-row/last-sequence and observed storage failure information. It cannot prove completeness after an entirely lost storage namespace. Missing completion means no completion was observed; it does not establish intentional abandonment. There are no heartbeats.

Private queues retain the existing 2,000-record cap and 25-record batches. Overflow is counted. Queued manifests needed by surviving queued events are retained; orphan metadata can be evicted. Transient retry preserves original IDs and uses the existing bounded backoff. Explicit acknowledgment IDs are required before removing records. HTTP 400/413/422 switches to singleton isolation; a permanently rejected singleton is discarded with a count, allowing valid peers to progress. 401/403/429 and network failures retain pending records. Queue quality counters describe the private browser queue across runs, not per-run outcomes. Private local CSV manifests separately expose remote pending/overflow/cancellation/rejection/storage counts. Server exports may reach the existing 50,000-row cap; a full-size export alone cannot prove exhaustiveness.

The existing private disclosure contains a real checkbox for future anonymous transmission. Its persisted disabled state is checked at initialization, creation, scheduling, flushing, retry and page exit. Disabling clears unsent queued events and cancels retries. Re-enabling does not replay cancelled events and allows manifests to be emitted again for new events. A maintained builder's `REMOTE_COLLECTION_ENABLED=false` emits a disabled meta setting that the browser checkbox cannot override. Public Managerial and default Composer have no remote transport or remote setting to activate.

A browser switch cannot retract requests already in flight, delete accepted records, modify already distributed immutable builds, or set server retention policy. Local recording/download is independent and remains available. Storage/network telemetry failures must not block gameplay. The private random browser ID can link runs in that browser; it is not a verified person's identity. No new public persistent cross-run identifier was introduced.

## Offline research-export QA

Run `node audit_tools/telemetry_contract/validate.mjs export.csv report.json`. It reads without uploading or altering the input and emits JSON plus a readable summary. It recognizes ordered current/legacy schemas, checks manifest/configuration hashes, mixed/stale versions, duplicate IDs/sequences, gaps, attempt/commit linkage, conditional fields, impossible timing, completion evidence and observed loss indicators. Unknown future schemas fail closed. Legacy missing fields are limitations, not invented zeros or misconduct flags.

This is the reusable core of the planned research-export QA task. Remaining research QA includes study-specific joins, controlled authoring-bank reconstruction, sampling/retention decisions and assessment validity. It is not a dashboard or a cheating classifier.

## Governance handoff

Data: question/attempt outcomes, timing/behavior counts, limited support/resource actions, analytical configuration and delivery metadata. Purpose: interpret mastery/adaptive evidence and export quality. Granularity: run, segment, presentation, attempt and existing lifecycle event. Location: browser local storage/CSV; private builds additionally use the existing Worker/D1 path. Linkability: run IDs locally, existing random browser ID privately. Control: private future-transmission switch and build setting; no new public remote collection. Deletion: this task cancels unsent queues only; existing authenticated server capabilities remain unchanged and were not executed.

Owner decisions remain: retention duration, who may access/administer exports, handling of previously accepted data, browser/local download custody, and infrastructure logging/retention. This implementation makes no institutional legal-policy or infrastructure-retention claim. PDF accessibility remains a separate task; PDFs are unchanged.

## Regeneration and release boundary

1. Review `release.json`, authored field definitions and implementation changes.
2. Refresh classroom integrations only with `instrumentHTML` for the four maintained targets; POC `create_private_build.mjs` now validates/refreshes its maintained integration without recloning reviewed engine hooks.
3. Run `node audit_tools/telemetry_contract/generate.mjs`, then `node audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs`.
4. Run both with `--check`, plus dictionary `render.mjs` / `check.mjs`, contract checks, real-browser checks and the active Composer suite.
5. Archive reviewed build artifacts/registry with the release. If approved separately for deployment, update the Worker validator before private schema-3 clients, then static adapters/Composer. No migration is needed; typed additions use `extras_json`. No deployment occurs in this task.

Composer changes apply to future generated games. Previously distributed files and frozen Micro/Macro games are unchanged.
