# Public Documentation Currency Audit and Refresh

## Executive Summary

**PASS WITH NOTES — implemented locally, not deployed.** Audited all 17 current public information pages and eight linked instructional/authoring DOCX references. Revised 16 page bodies or navigation sets, regenerated only the inherited footer of the already-current Learning Outcome Coverage guide, and corrected four teaching downloads. Four other authoring/converter downloads remain unchanged. All 17 information pages now pass targeted currency checks; the LO guide's instructional content was confirmed current before editing.

Removed six duplicated adaptive explanations: Games, four collection pages, and Build. Condensed the separate deployment-hardening repeat on Evidence and the repeated Build card. Faculty Resources remains the canonical explanation home. Corrected the Composer step order and outcome workflow, obsolete Exam Drill directions, overly broad local-only privacy claims, private-only dictionary framing, stale navigation names, and undated demonstration claims. Two broken section links were repaired.

Validation: **542 internal references, zero failures; 34 desktop/mobile page checks, zero failures; four DOCX guards pass; 13 rendered Word pages inspected; Composer suite 27/27 PASS; both generated reference checks pass.** Only the 21 expected existing documentation/download files changed. All other 4,787 baseline tracked files are byte-identical. New files are maintenance checks, audit evidence, and this report. No gameplay, telemetry, curricular, question, resource-sheet, or Worker/D1 changes occurred.

The note concerns intentionally excluded interactive hub help text, described under Remaining Documentation Opportunities. It is not a regression from this refresh.

## Documentation Architecture

| Page | Final role |
| --- | --- |
| Home | Introduce Mastery Quests and route readers to building, games, and examples; concise mode-qualified learning summary. |
| Games | Choose among the four collections and launch a hub or collection page. |
| Faculty Resources | Find Composer, learning outcomes, telemetry, Canvas, adaptive-engine, Mastery Report, and publishing guidance. Existing /how-to/ URLs remain. |
| Evidence / See It in Action | Show real product examples and a preserved demonstration CSV with honest snapshot context; no claim of a controlled efficacy study. |
| About | Explain the project's educational purpose, authorship, and design commitments. |
| Resources / Downloads | Supply reusable downloadable assets, guides, authoring references, and tools; link online guidance back to Faculty Resources. |

No new public page or top-level section was created. Existing collection identities and mission descriptions remain. The pre-edit currency matrix records purpose, claims, status, source references, and proposed action. The final matrix records dispositions. Runtime/progression hubs, private classroom/POC builds, the converter tool, generated regions, and historical material are classified separately.

## Games Page Cleanup

Removed the Engine transparency heading, full-evidence/remediation card, Legendary explanation, short-run explanation, evidence-threshold card, and their technical calls to action. Games now leads into collection choices. One concise link, “Learn how Mastery Quests adapts practice,” points to /how-to/#adaptive-engine. The old #adaptive-engine fragment remains as the link container so existing bookmarks still reach useful guidance.

The canonical mode explanation remains at /how-to/#adaptive-engine, alongside existing Repair → Bridge → Retest, calibration, and sample-aware reporting guidance. The current template's limited-run mode sets, calibration function, and evidence-label functions support the retained explanations. Availability remains explicitly dependent on the game and eligible content.

## Currency Corrections

- **Composer:** documentation starts with Concepts & scope, then Game details, Modes, Checkpoints, Appearance, Readiness, and Generate. The sequence is tested against the actual UI. Faculty choose broad learning outcomes, not raw skill IDs.
- **Coverage:** Standard is the normal initial UI coverage; Brief selects essentials, Full selects all outcomes, and a different manual combination shows Custom. Single-outcome presets can coincide. Matching manual combinations may display a preset name.
- **Exam Drill:** removed the obsolete “30-room practice without checkpoints” description from four downloads. Directions now describe nine-question sections, answer review/revision, hidden correctness during an active section, and deliberate checkpoint commitment. The web guide also reflects that behavior.
- **Telemetry/privacy:** public games and default Composer builds remain local-only. Separate classroom research builds may use anonymous schema-2 collection. The notice explains linkable random client/run identifiers and scalar timing, focus, visibility, selection, and copy measurements without implying text or clipboard-content capture.
- **Dictionary scope:** its authored introduction and metadata now include public and classroom Managerial local CSVs. All 75 generated field definitions remain identical.
- **Evidence:** screenshots are identified as demonstration snapshots, including older Composer views. The actual 41-column example CSV and its actual run statistics remain unchanged and are distinguished from current 75-column Managerial exports. Current report behavior is described conditionally rather than promising a Concept Review after every run.
- **Navigation:** public documentation uses Faculty Resources and Faculty Build Composer; collection/footer links use the current destinations and labels. The misleading advanced-video CTA now points to the real publishing guide.
- **Scale:** verified 149 canonical concepts, 9,779 canonical questions, 222 outcomes, and 220 public outcomes across 147 selectable concepts. These counts remain in audit evidence rather than being added throughout marketing prose. The downloadable overview's brittle review-library count was replaced with durable wording. The asset sampler's 20 images and eight audio files were verified against ZIP contents and retained.
- **Publishing/accessibility:** kept working hosting instructions, removed brittle GitHub sidebar-category wording, added a descriptive title to iframe examples, made the publishing code panel keyboard-scrollable, and fixed its mobile grid overflow.

GitHub branch/root publishing remains consistent with the [official Pages instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Canvas guidance retains institution-dependent iframe support and the external-link fallback, consistent with its [HTML allowlist](https://community.instructure.com/en/kb/articles/387066-canvas-html-editor-allowlist). The existing creator attribution was confirmed against the [Troy faculty directory](https://www.troy.edu/academics/colleges-schools/business/departments/economics-finance-risk-management-insurance/faculty-staff.html). Legal/FERPA guidance was not expanded or reinterpreted.

## Composer Documentation

The guide now matches the current LO-based workflow. Build, Home, About, and the advanced template entry describe that same path and link to the synchronized coverage guide. The four teaching DOCX files were edited in place, preserving their design and existing URLs. They now match the same workflow and Exam Drill behavior and link to current online references on masteryquests.org.

The actual Composer entry HTML, implementation, defaults, controls, policy, and mappings were not edited. Existing advanced authoring references appropriately retain internal skill metadata and draft answer indexes; those are not presented as the guided Composer workflow.

## Telemetry Documentation

The public Managerial adapter has no fetch/XHR/beacon transport; the classroom client separately defines schema version 2 and collection transport. Public pages do not claim that all gameplay is centrally tracked. Creating or downloading a local CSV does not submit it to an instructor. The private/classroom distinction is now explicit in Privacy, the Managerial landing page, the dictionary introduction, and teaching downloads.

The behavioral tracker records counts, durations, flags, and selected-length measurements, not selected/copied text or clipboard contents. Those measurements do not establish misconduct or intent. No administrative routes, tokens, credentials, or administration instructions were added. Dictionary precision, event-filter guidance, measured/legacy semantics, and generated definitions were retained.

## Game Collection Review

| Collection | Verified state and changes |
| --- | --- |
| Economic Realm | Five linked missions retained, including the integrated foundations/measurement scope of Equilibrium Crisis. Replaced repeated engine text with concise mode-availability guidance and a faculty link. |
| Macro Command System | Four linked missions retained, with their intermediate-macro identities and progression descriptions. Consolidated duplicate explanation. |
| Micro Domains | Labyrinth of Choice remains playable; Strategic Vault, Foundry, and Dominion of Power remain Coming Soon. Current graph-practice note retained without implying unlaunched games are available. |
| Managerial Intelligence Directorate | Four missions retained. Briefly documents current dailies, introductions, utility menu, artifacts, reports, and local CSV. Trial by Graph remains specific to Market Signal and Strategy Desk. No claim that every mode supports saving or artifact powers. |
| Faculty Template | Preserved the empty-content advanced ten-mode engine description and availability caveat. Updated the guided Composer alternative and repaired two section links. |

## Duplication Reduction

Six long adaptive explanations now resolve to the existing faculty reference. Evidence's three-card hardening explanation was replaced by a short canonical link; Build's hardening card is concise. Home retains only a short, mode-qualified overview. Faculty Resources adds a compact Mastery Report section at #mastery-reports instead of another standalone page. Existing illustrated deployment instructions, screenshots, thematic copy, and reusable downloads remain.

## Link Validation

Before revision: 517 local/canonical-domain page, image, script, stylesheet, download, and fragment references; two broken anchors. After revision: **542 references across 77 unique repository targets; zero failures**, including absolute masteryquests.org game links.

Fixed /resources/#advanced-manual-building → /resources/#authoring-files, and /how-to/#advanced-workflow → /how-to/#prepare. The latter CTA now accurately says Read the Publishing Guide. Existing /how-to/ paths and publishing anchors were preserved. Missing-file and missing-anchor negative controls both reject deliberate failures. This is repository-target validation plus browser local-request checks, not a claim that every external service was uptime-tested.

## Regression / Browser QA

| Check | Result |
| --- | --- |
| Public documentation check | PASS; 17 pages, 542 references, two negative controls, actual UI step-order comparison |
| Downloadable guide checks | PASS for all four revised DOCX files |
| Faculty LO guide validation | PASS; 147 public concepts, 220 outcomes, zero mismatches, seven negative controls, two generation checks |
| Telemetry dictionary schema validation | PASS; 75 fields across 12 public/classroom/POC schemas |
| Telemetry generated-region check | PASS |
| Composer active suite | 27/27 PASS; no runner or assertion weakened |
| Browser checks | 34/34 PASS: all 17 pages at 1440×1000 and 390×1000 |
| DOCX rendering | Four files, 13 pages rendered and visually inspected |
| Git scope / whitespace | Expected 21 existing files only; no unexpected changes; diff check clean |

Browser QA used local HTTP and Microsoft Edge/Playwright: one H1 per page, no skipped heading levels, useful navigation labels, skip-link focus, keyboard menu open/Escape, zero JavaScript errors, zero failed local requests, and no horizontal page overflow. The wide adaptive table stays in its labeled scroll region; the publishing code example scrolls with the keyboard at 390px. Newly edited cards, Composer steps, report guidance, and privacy copy were visually inspected. No site-wide accessibility certification is claimed.

The packaged DOCX renderer was attempted and diagnosed as unavailable because LibreOffice is absent. Installed Microsoft Word exported PDFs; bundled PDFium generated PNGs. Table row splitting and a section break were corrected before final verification. The original document styling was retained. QA intermediates are audit evidence, not additional public downloads.

Hash comparison covers all 4,808 baseline tracked files. Exactly 21 expected existing files changed; **4,787 are byte-identical**, including question libraries, runtime code, public/private telemetry adapters, Worker/D1, outcomes/presets, resource sheets, and the old Evidence screenshots/sample CSV. The entire generated LO policy is byte-identical. The dictionary's generated field region is identical. LO coverage JSON is unchanged; its HTML was regenerated solely for inherited footer terminology.

## Files Changed

Exact repository-relative list (57 files):

- FINAL_REPORT_public_documentation_refresh.md
- about/index.html
- audit_tools/public_documentation/README.md
- audit_tools/public_documentation/check-downloads.py
- audit_tools/public_documentation/check.cjs
- audit_tools/public_documentation/pages.json
- build/index.html
- downloads/resources/faculty-composer-quick-start-guide.docx
- downloads/resources/faculty-game-overview-guide.docx
- downloads/resources/faculty-implementation-guide.docx
- downloads/resources/student-instructions-and-faculty-customization-checklist.docx
- evidence/index.html
- games/economic-realm/index.html
- games/faculty-template/index.html
- games/index.html
- games/macro-command-system/index.html
- games/managerial-intelligence-directorate/index.html
- games/micro-domains/index.html
- how-to/canvas/index.html
- how-to/composer/index.html
- how-to/index.html
- how-to/learning-outcomes/index.html
- how-to/telemetry-data-dictionary/index.html
- index.html
- privacy/index.html
- resources/index.html
- validation_artifacts/public_documentation_refresh/browser-qa.json
- validation_artifacts/public_documentation_refresh/check.cjs.log
- validation_artifacts/public_documentation_refresh/check.mjs.log
- validation_artifacts/public_documentation_refresh/classification.json
- validation_artifacts/public_documentation_refresh/composer-workflow-1440.png
- validation_artifacts/public_documentation_refresh/composer-workflow-390.png
- validation_artifacts/public_documentation_refresh/currency-matrix-after.json
- validation_artifacts/public_documentation_refresh/currency-matrix-before.json
- validation_artifacts/public_documentation_refresh/docx-render-qa.json
- validation_artifacts/public_documentation_refresh/download-checks.json
- validation_artifacts/public_documentation_refresh/faculty-composer-quick-start-guide-render.png
- validation_artifacts/public_documentation_refresh/faculty-game-overview-guide-render.png
- validation_artifacts/public_documentation_refresh/faculty-guides-1440.png
- validation_artifacts/public_documentation_refresh/faculty-guides-390.png
- validation_artifacts/public_documentation_refresh/faculty-implementation-guide-render.png
- validation_artifacts/public_documentation_refresh/games-choice-1440.png
- validation_artifacts/public_documentation_refresh/games-choice-390.png
- validation_artifacts/public_documentation_refresh/links-after.json
- validation_artifacts/public_documentation_refresh/links-before.json
- validation_artifacts/public_documentation_refresh/mastery-reports-1440.png
- validation_artifacts/public_documentation_refresh/mastery-reports-390.png
- validation_artifacts/public_documentation_refresh/privacy-research-1440.png
- validation_artifacts/public_documentation_refresh/privacy-research-390.png
- validation_artifacts/public_documentation_refresh/protected-files.json
- validation_artifacts/public_documentation_refresh/regression.json
- validation_artifacts/public_documentation_refresh/render.mjs.log
- validation_artifacts/public_documentation_refresh/run_active_composer_suite.js.log
- validation_artifacts/public_documentation_refresh/student-instructions-and-faculty-customization-checklist-render.png
- validation_artifacts/public_documentation_refresh/validate-guide.cjs.log
- validation_artifacts/public_documentation_refresh/verified-facts.json
- validation_artifacts/public_documentation_refresh/visual-checks.json

## Items Intentionally Left Alone

- All 220 public learning-outcome labels, mappings, presets, and generated coverage data; the guide's introduction was already current.
- All 75 dictionary field definitions, field inventory, event semantics, and generated-data architecture; only surrounding authored framing changed.
- Current adaptive calibration and evidence rules after source verification; existing publishing anchors and valid deployment instructions.
- Evidence screenshots, the historical demonstration CSV, actual run statistics, and existing Concept Review previews.
- Four advanced-authoring/converter references, validator workbook, asset sampler, blank engine, and all Concept Review/resource PDFs.
- Game/runtime/hub code, private research builds, historical Composer versions, and prior final reports.

## Remaining Documentation Opportunities

The public interactive hub help still includes historical school-email/run-recording language (for example, Micro Domains). These hubs contain gameplay/progression logic and were classified as runtime surfaces, so their instructional strings were not edited under the documentation-only boundary. A separate narrowly scoped runtime-copy pass should reconcile that help with the public local-only workflow. No broader redesign or new documentation page is proposed.

## Deployment

**Not deployed.** No commit, push, or production publishing occurred. Changes remain local and reviewable.

## Final Verdict

**PASS WITH NOTES.** Public information pages and teaching downloads now describe the current platform, duplicated explanations are consolidated, generated references remain synchronized, and Composer regression remains fully green. The runtime-help wording noted above remains outside this pass.
