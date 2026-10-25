# Answer Analysis Dashboard Enhancement Report

Implemented locally, October 24, 2026. No push, merge, or deployment was performed.

## Result

The Answer Analysis tool now presents performance, practice and instructional support, progression, coverage, and intervention in distinct sections. Existing imports, deduplication, response filters, choice counts, authoritative saved answer keys, summary copying, and CSV downloads remain supported.

The dashboard deliberately distinguishes unavailable measures from measured zeroes. It never treats responses or runs as unique students. It reads files locally, adds no telemetry, and makes no question-bank or service requests.

## Architecture and sources examined

The existing tool was a standalone static page with `analysis.js` handling CSV parsing, normalization, snapshot validation, deduplication, rollups, run context, and feedback; `report.js` handled imports, rendering, filters, clipboard, and downloads. No framework, backend, or database was required.

Sources inspected without modification:

- `audit_tools/telemetry_contract/schema.json`: all 11 registered CSV layouts, including 70-column Micro, 88-column Managerial, 117-column Composer, and 82-column private snapshot exports, plus historical layouts.
- `audit_tools/telemetry_contract/hash.mjs`, `additions.md`, and `validate.mjs`: snapshot revisions, prior-exposure semantics, sequence counters, support snapshots, and `originAttemptID`.
- `how-to/telemetry-data-dictionary/index.html`: published field definitions and limitations.
- Cost Directive, National Engine, Labyrinth of Choice, and Market Gate runtime exporters: local difficulty fallback, encounter counters, stage metadata, and ending events.
- Cost Directive's public student question pool and its `__mqDifficulty`, `primarySkill`, and `repairSkill` handling. Authored metadata exists in game content, but it is not always preserved with unambiguous provenance in local CSVs.
- `play/managerial-directorate-telemetry-poc/telemetry-client.js`: private adapter question difficulty, separate remediation/bridge/retest columns, `sourceEvent`, and completion status.
- `server/anonymous-telemetry-poc/telemetry-core.mjs`: private export field meanings; inspected only.
- `audit_tools/public_site_publication/build-dist.mjs`: publication allowlist and exclusions.

The new `dashboard-analysis.js` enriches the existing analysis result with deterministic aggregates. It receives accepted, deduplicated responses, their snapshots, and raw run records. Raw run records retain conflicting ending claims even when an event identifier is duplicated. `dashboard-view.js` renders the new sections and question navigation. The original parser and data collection remain in place.

## Measures implemented

| Measure | Definition / denominator |
|---|---|
| Accuracy | Correct / graded accepted responses with usable snapshots; numerator and denominator remain visible. |
| Timing | Median is primary; mean and timed-response coverage remain visible. Positive finite times are retained without trimming. |
| Response distribution | `(0,15s)`, `[15s,30s)`, `[30s,60s)`, `[60s,120s]`, and `(120s,infinity)`. Fractional milliseconds are covered without overlap. |
| Difficulty | Recorded `difficulty` from accepted answers in local and private CSVs. Missing or conflicting labels for an exact question version are Unknown. Mode is not used to fill missing labels. Standard and game-specific labels are preserved. |
| Conflicting difficulty labels | An expandable raw-label breakdown appears when question versions have conflicting difficulty labels. |
| Exact-version encounters | Within-run saved question ID + revision, positive integer sequence ordering, and recorded prior exposure. A prior count of zero identifies the first retained encounter. Repeats require an earlier matching revision. A changed version can be first when the earlier ID history is fully accounted for. Otherwise unavailable. |
| Original exposure counts | Retained separately for compatibility with the existing Attempts filter; includes earlier retained answers and rapid guesses for the question ID. |
| Repair / bridge / retest accuracy | Response counts and graded accuracy using explicit stage fields, including private snake-case aliases. Conflicting simultaneous roles are not assigned to a normal role. |
| Post-remediation retests | Subset with an observed incorrect origin attempt, same run, matching `originAttemptID`, and an ordered repair/bridge before the retest. Link evidence can come from outside the response filter; only selected retest responses enter the result. |
| Run outcomes | Recognized normal mode completions, explicit early endings, `riskReward_bust`, or unknown. Generic `run_completed`, unknown status values, and contradictory ending claims are not successes. |
| Successful completion rate | Observed successful / all represented runs. Unknown runs stay in the denominator. If no outcome can be identified, the rate is unavailable. Successful means normal mode completion, not mastery or a passing score. |
| Successful duration | Median recorded successful ending time, with the number of timed successes shown. |
| Answers per success | Median valid exported end-of-run attempt count, with coverage. Partial observed response counts are not substituted. |
| Other run context | Median maximum recorded clock; total recorded run time; longest streak; mean ended-run duration including early and unsuccessful endings. |
| Coverage | Distinct question versions; versions with at least 5 and 10 graded responses; corresponding coverage and depth in topic/objective tables. |

Response filters apply to accuracy, response timing, difficulty, encounter performance, remediation responses, and coverage. Whole-run measures use the runs represented by selected responses and retain their full imported context. Runs without any selected usable response are not represented. No anonymous learner identities are joined into student counts.

## Field-support matrix and deferrals

| Format / family | Responses and timing | Difficulty | Exact question encounters | Remediation | Outcomes |
|---|---|---|---|---|---|
| Current Managerial local | Snapshot-based | Supported from the recorded difficulty field | Conditional on retained counters, revisions, and ordering | Explicit stage roles; linked retests when origin/order exists | Recognized named endings |
| Current Composer local | Same | Supported from the recorded difficulty field | Same | Same field-based rules | Recognized named endings |
| Current Macro / Micro / Economic Realm local | Same shared response contract where supplied | Supported from the recorded difficulty field | Same field-based rules | Same field-based rules; no inferred missing roles | Recognized named endings |
| Contract-1 private CSV | Flattened fields or `extras_json` with snapshots | Supported from the recorded difficulty field | Conditional on snapshots and ordering | Separate stage columns + origin linkage | Explicit completion status or source ending; generic end event is insufficient |
| Historical layouts without snapshots | Accepted records reported as unavailable; no reconstructed answer analysis | Unavailable | Unavailable | Unavailable in question analysis | Not inferred for unrepresented runs |

The matrix is also available in the dashboard's expandable methodology section.

Deferred measurements are displayed as **Not available**, not manufactured zeroes:

- **Skill first/repeat encounters:** local CSVs do not consistently preserve an actual skill ID and encounter history. The private `concept_id` can be populated from concept, skill, or tag fallbacks; it is not safely interchangeable with a skill identifier.
- **Sequences initiated, completed, or abandoned:** stage roles and origin links do not define those lifecycle states. The tool reports observed linked groups without calling them completed sequences. A missing follow-up is not an abandonment event.
- **Checkpoint/boss retry rate:** checkpoint starts and repeated stage labels do not consistently identify distinct retry attempts. Question IDs, room numbers, or temporal proximity are not used to invent a retry denominator.
- **Bank percentage:** no authoritative complete, version-matched bank inventory was supplied. No private keys or current banks are downloaded to reconstruct historical content.
- **Unique students and cross-run learning trajectories:** no appropriate identity assumptions are introduced.

## Layout and workflow changes

Before: import controls, several large metric rows, repeated explanatory paragraphs, topic/review tables, and a long question list.

After:

- Compact import area, collapsible file list, explicit imported-file versus represented-run counts, game/run filters, active-selection description, and reset controls.
- Six compact headline cards, with median response time and accuracy numerator/denominator emphasized.
- Instructor summary immediately after performance, with three visible highlights and a collapsible full summary; Questions to review comes next, before topic results. Difficulty follows the review section; practice and instructional support are paired; outcomes are separated from response timing.
- Coverage depth, timing distribution, sortable topics/objectives, and direct topic-to-question browsing.
- Numbered review links, stable game/question/revision anchors, compatibility with the old `question-N` anchors, and keyboard-operable “Review next.”
- Question IDs, full stems, topic/objective, recorded difficulty, type/role, runs, timing, saved version, and choice-count bars. Cards remain collapsible.
- Search and 25-card pagination for large banks. Browsing/pagination never changes dashboard totals or exports.
- Instructor feedback preview, editable copy workflow, plain-text teaching-summary download, and expanded CSV outputs.
- Persistent data-quality warnings; secondary definitions and support limitations in expandable sections.

No external charting library is used. Decorative bars are hidden from assistive technology; all numerical information remains textual.

## Validation

Passed:

1. `node build/faculty-build-composer/tests/run_answer_analysis_validation.mjs` — existing parser, snapshot, deduplication, filters, timing, feedback, and 17-engine integration regressions.
2. `node audit_tools/answer_analysis/dashboard-check.mjs` — outcomes/denominators, early and unsuccessful endings, duplicate/conflicting endings, recorded difficulty across local/private exports, aliases and unknown labels, question revisions, sequence ordering, explicit remediation links, filtered linkage, timing boundaries, missing data, and all 11 registered CSV layouts.
3. `node audit_tools/answer_analysis/class-browser.mjs` — cumulative imports, duplicate imports, removal, malformed files, 30-file batches, filters, clear during pending reads, rapid sequential imports, drag/drop, and responsive layout.
4. `node audit_tools/answer_analysis/review-browser.mjs` — five review links, duplicate stems across revisions, keyboard focus, summary numbering, filtered links, exports, unknown outcomes, and mobile layout.
5. `node audit_tools/answer_analysis/release-browser.mjs` — native clipboard and denied-clipboard fallback, exported totals, authoritative zero-selected correct answers, table keyboard scrolling, long strings, labels/headings, malformed import alerts, and existing resource links.
6. `node audit_tools/answer_analysis/dashboard-browser.mjs` — new filters, topic sorting/drill-down, search, next-review navigation, legacy anchors, consistent whole-run denominators, CSV/text exports, offline operation after local assets load, pagination, and accessibility/visual checks.
7. Local publication build — 2,410 files, 151 Composer review PDFs, zero forbidden files, zero incoming question assets. Build only; no publication command was run.
8. `git diff --check`.

The browser fixture makes zero external requests during analysis. The accessibility package is installed only under ignored `tmp/answer-release/a11y`; it is not a runtime dependency or publication asset.

### Cost Directive reference

The actual student CSVs were not supplied. A deliberately constructed synthetic arithmetic fixture reproduces 18 runs, 881 responses, 354 versions, 787 correct responses (89% rounded), 33,000 ms median, and 94,000 ms mean. Those numbers are asserted only in tests; none are hardcoded into the dashboard. This is **not** evidence that the live Cost Directive dataset has been independently reproduced or validated. Its real exports still need to be loaded for that comparison.

### Accessibility

axe-core 4.11.0 scans at 1440, 768, and 390 pixels found zero violations for WCAG A/AA and best-practice checks. Native labels, table column scopes, named scroll regions, visible focus, status/alert regions, keyboard review navigation, and horizontal table scrolling were checked.

axe leaves contrast items for clipped horizontal-table content and the textarea as requiring review; these are recorded in the evidence rather than suppressed. Explicit computed text/background contrast checks cover the shared rate, note, link, review, card, and textarea styles and pass the 4.5:1 normal-text threshold. Screenshots were visually inspected. This is not a claim of exhaustive assistive-technology certification; no live screen-reader session was performed.

## Screenshots and evidence

All screenshots use invented data from `dashboard-fixtures.mjs`, never student records.

| View | Before | After |
|---|---|---|
| Desktop | [Before desktop](audit_tools/answer_analysis/dashboard-evidence/before-desktop.png) | [After desktop](audit_tools/answer_analysis/dashboard-evidence/after-desktop.png) |
| Mobile | [Before mobile](audit_tools/answer_analysis/dashboard-evidence/before-mobile.png) | [After mobile](audit_tools/answer_analysis/dashboard-evidence/after-mobile.png) |

Detail images: [desktop overview](audit_tools/answer_analysis/dashboard-evidence/after-overview-desktop.png), [mobile overview](audit_tools/answer_analysis/dashboard-evidence/after-overview-mobile.png), [question review](audit_tools/answer_analysis/dashboard-evidence/after-question-desktop.png), and [synthetic reference overview](audit_tools/answer_analysis/dashboard-evidence/synthetic-reference-overview.png).

Machine-readable evidence: [browser results](audit_tools/answer_analysis/dashboard-evidence/browser-results.json), [accessibility results](audit_tools/answer_analysis/dashboard-evidence/accessibility.json), [computed contrast](audit_tools/answer_analysis/dashboard-evidence/contrast-check.json), and [synthetic filtered export](audit_tools/answer_analysis/dashboard-evidence/filtered-summary.csv).

Evidence and fixtures live under `audit_tools/`, which the existing publication builder excludes. This report also remains outside the publication allowlist.

## Files changed

Runtime: `tools/answer-analysis/index.html`, `report.css`, `analysis.js`, `report.js`; new `dashboard-analysis.js` and `dashboard-view.js`.

Tests: existing `audit_tools/answer_analysis/class-browser.mjs`, `release-browser.mjs`, `review-browser.mjs`, and `run-stats-check.mjs` updated for intentional labels/layout changes. New `dashboard-fixtures.mjs`, `dashboard-check.mjs`, `dashboard-browser.mjs`, and `dashboard-evidence/`.

Documentation: this report.

No game banks, keys/hashes, difficulty assignments, game selection/remediation logic, Student Mastery Reports, telemetry clients, Composer implementation, Worker endpoints, or database schemas were modified.

## Local preview and tests

From the repository root:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/tools/answer-analysis/`. Use a local server rather than opening the HTML as a file, because shared asset paths are root-relative.

Generate a synthetic CSV for an interactive preview:

```powershell
node --input-type=module -e "import fs from 'node:fs'; import {dashboardRows} from './audit_tools/answer_analysis/dashboard-fixtures.mjs'; import {csv} from './audit_tools/answer_analysis/release-fixtures.mjs'; fs.mkdirSync('tmp/answer-release',{recursive:true}); fs.writeFileSync('tmp/answer-release/synthetic-dashboard.csv',csv(dashboardRows()));"
```

Import `tmp/answer-release/synthetic-dashboard.csv` in the dashboard. It is synthetic and excluded from publication.

For browser checks, use an installed Playwright module and Edge. This workspace used:

```powershell
$env:PLAYWRIGHT_MODULE = 'C:\Users\Jennings\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
npm install --prefix tmp/answer-release/a11y --no-audit --no-fund --ignore-scripts axe-core@4.11.0
node audit_tools/answer_analysis/dashboard-check.mjs
node audit_tools/answer_analysis/dashboard-browser.mjs
```

`AXE_MODULE` can point to another installed `axe.min.js`. Running the browser script updates the **after** evidence; the captured before screenshots are preserved. The `--before` mode exists for baseline capture and should not be used to overwrite the original before evidence after implementation.

Build for local publication inspection only:

```powershell
node audit_tools/public_site_publication/build-dist.mjs
```

This regenerates the repository's `dist/` output; it does not deploy. Keep fixtures and student files outside public source trees. The unchanged builder explicitly excludes audit tooling, temporary data, private-course sources, faculty exports, and test directories.

## Difficulty and instructor workflow correction

Local CSV difficulty is now included in the main breakdown, question cards, teaching summary, and CSV download. The previous blanket private-contract requirement incorrectly hid populated local difficulty fields. Empty labels and contradictory labels for one saved question version remain Unknown. CSV output uses `difficulty` / `recorded_difficulty` sections and a `difficulty` column in place of the misleading authored/unverified names. No gameplay or telemetry changes were needed.

The instructor summary now follows the overview with three visible highlights and a collapsible full summary. Questions to review follows the summary, ahead of Results by topic. Navigation follows the same reading order. The live Cost Directive screenshot documents the reported issue; exact live totals still require the source CSVs, which are not attached.

Correction validation passed: the existing answer-analysis validation suite, dashboard calculation checks across all 11 registered CSV schemas, browser checks for difficulty totals/cards/feedback/CSV exports and the new section order, desktop/tablet/mobile accessibility scans, and the local publication build (2,411 files; no forbidden files). Refreshed dashboard screenshots and browser evidence are saved alongside the existing evidence.

## Visual polish

The instructor summary now shows class performance, the priority topic/objective, and a teaching action above a collapsed full narrative. Copy and download still use the complete summary. Review priorities use responsive cards with full question wording, visible accuracy/response counts, the observed incorrect choice, and direct answer-choice links. Boss difficulty names are spaced for display without merging categories or changing exports, and accuracy bars are more prominent. Secondary definitions and unavailable-metric notes are in expandable sections. Review rankings, filters, counts, and measurement rules are unchanged.

Validation: dashboard calculation and existing analysis suites, desktop/mobile browser checks, keyboard review navigation, WCAG A/AA scans, and contrast checks passed. The compact highlights were checked for filtered/empty selections, review thresholds, objective grouping, and all-correct results.

## First-use workflow and editable summaries

The opening screen now explains how to collect student game-data downloads and offers a fictional sample class (6 runs, 48 answers). A three-step guide explains how to read the overview, investigate priority questions, and save a teaching plan. Basic filters appear after import; attempt history, removed choices, and the review minimum live under More options. The header becomes compact after import and the first successful upload moves keyboard focus to the overview. Sample data is clearly labeled and replaced, never combined, when class files are imported; a malformed import preserves the sample.

Overview cards use plain language for questions and game runs. Completion is explicitly distinguished from mastery, and instructional-support stages have short explanations. Written-summary and CSV downloads have distinct names and file extensions. A visible notice explains that reloading or closing the page clears the report and edits.

Edit written summary opens a draft before copying. Copy and text download use that draft; repeated copying and filter/file changes preserve edits. Changed underlying results produce a persistent draft notice. Replace draft with current results is explicit and can be undone. The generated preview and dashboard highlights continue to show current results independently of the edited draft.

Validation: analysis and calculation suites, CSV/Excel/Numbers equivalence, class-sized uploads and import cancellation, review navigation, clipboard/export regressions, and the new `onboarding-browser.mjs` passed in Edge. The new browser check covers sample isolation, malformed imports, draft preservation, replacement/undo, clipboard denial, reset, and nine WCAG A/AA scans at 1440, 768, and 390 pixels. Screenshots and scan results for the walkthrough are written to `tmp/answer-release/onboarding/`. Firefox and WebKit browser binaries are unavailable in this environment. This is a source and browser review, not an observed study with first-time instructors.
