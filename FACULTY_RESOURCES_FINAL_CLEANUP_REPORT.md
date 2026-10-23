# Faculty Resources Final Cleanup Report

## Executive summary and baseline

Removed the premature assignment-planning section and made **Understanding Game Data** the consistent faculty-facing resource name. The data guide now starts with supported analysis, export identification, and responsible handling, while explicitly limiting its detailed dictionary to Managerial's 88-column local CSV. Existing teaching resources and application behavior are preserved.

- Starting branch: `faculty-resources-cleanup`.
- Starting HEAD: `4688f78dc61080ec031615b273faca0ee141dc4a`.
- Starting `git status --short`: empty (clean, no untracked files reported).
- Previous cleanup commit `dc22c984` is already an ancestor of main. After fetching origin, the existing feature branch, main, and origin/main all pointed to the starting HEAD.
- Working branch: `codex/faculty-resources-final-cleanup`, created from refreshed `origin/main`. Main was not checked out or modified. No push, merge, or deployment performed.

## Files modified

- `how-to/index.html`
- `how-to/telemetry-data-dictionary/index.html`
- `how-to/canvas/index.html`
- `how-to/responsible-telemetry-use/index.html`
- `tools/answer-analysis/index.html` (introductory prose only)
- `resources/index.html`
- `FACULTY_RESOURCES_FINAL_CLEANUP_REPORT.md`

## Removed content and navigation

Removed the entire `game-data` section, its “Assign activities and read results” jump link and card, and assignment-planning language in the hero, metadata, and closing resource overview. The removed section used shared styling still needed by existing content; no orphan styles or empty cards remain.

Contextual replacements:

- Mastery Reports: link to Understanding Game Data for export identification and available fields.
- LMS guide: preserve its submission instructions; point to Mastery Reports and Class Answer Analysis for their distinct functions, and the export comparison for Composer formats.
- Answer Analysis: point to the export comparison and Responsible Telemetry Use.
- Responsible Telemetry Use: point to Understanding Game Data and describe its scoped Managerial reference.
- Dictionary introduction: replace assignment guidance with direct routes to analysis, export identification, and responsible handling.

The Faculty Pedagogy Guide, LMS guide, Composer guide, Mastery Reports, Class Answer Analysis, Learning Outcome Coverage, Faculty Question Banks, and existing practice-mode guidance remain available.

## Titles and descriptions

| Location | Before | After |
| --- | --- | --- |
| Resource card and jump link | Managerial Telemetry Data Dictionary | Understanding Game Data |
| Data card description | “Look up fields in Managerial Intelligence Directorate’s local game-data CSV and compare export versions. The detailed definitions cover Managerial games; other collections can use different fields.” | “Learn how to interpret downloaded game records, identify export formats, and use supported files with Class Answer Analysis. Available fields vary by collection and game version.” |
| Data guide title, H1, breadcrumb and metadata | Managerial-first dictionary introduction | General game-record introduction, with an explicit limit on detailed field coverage |
| Downloads, LMS, report, analysis and responsible-use references | Managerial-specific name or removed assignment anchor | Understanding Game Data, with destination-specific descriptions |
| Faculty Resources hero | Choose an activity and plan submissions | Find teaching guides, review supported results, and create/host practice games |

## Data guide organization and retained terminology

Moved the existing export comparison ahead of the technical material. Added **Managerial Intelligence Directorate — Detailed Field Dictionary** before the existing starting-field guidance and technical examples. Retained every original dictionary ID and all 88 field rows unchanged; the generated region still matches the renderer. Added the missing Answer choices category link to the already-existing category. Moved the collection-authorization notice outside the searchable dictionary section and retained its collection/privacy distinctions.

The two introduction jump destinations have local scroll spacing so their headings remain visible below the sticky header. No global CSS, header, footer, navigation, or JavaScript changed.

Managerial naming remains in the technical scope, actual export comparison, supported analysis collections, and policy context. Other collection names remain where they distinguish supported formats. The Micro Domains comparison now explicitly names **Labyrinth of Choice**, avoiding a claim about unreleased worlds. No preview activities or new simulation guides were added.

## Export accuracy and interpretation

Verified against current source, without changing producers or parsers:

| Export | Verification |
| --- | --- |
| Managerial local: 88 columns | Existing checker executes actual adapter installation against all four games in each of public, classroom and telemetry-POC builds: 12 matching exports. |
| Economic Realm: 117 columns | Actual TELEMETRY_COLUMNS arrays in all five maintained game routes. |
| Macro Command System: 117 columns | Actual arrays in all four maintained game routes. |
| Faculty Composer: 117 columns | Actual template array; identical field ordering to the nine Economic Realm/Macro arrays. This does not imply equal populated values. |
| Micro Domains — Labyrinth of Choice: 70 columns | Actual playable game's array, including answerSnapshotJSON. |

Historical comparison rows and the separate private-admin row are preserved, not promoted as new field dictionaries. The existing analysis parser accepts local question events and supported accepted answer_evaluated records; saved supported snapshots determine available wording and answer distributions. Its parsing and analysis code is unchanged.

## Validation

- No `#game-data` references or old Managerial Telemetry navigation labels remain in tracked HTML. Historical reports are retained as records.
- Public documentation checker: **22 pages, 758 links, 90 unique targets, zero broken links**, with two passing negative controls.
- Focused Faculty Resources and linked-guide validation: **662 internal link/asset/fragment checks across 10 pages in source and 10 in dist**, all passing.
- Compared all original dictionary IDs and the exact 88 field-row strings against the starting commit: preserved. Dictionary coverage and renderer checks pass.
- Manually reviewed changed descriptions against their destinations and inspected the analysis parser's supported-event/snapshot conditions.
- Publication build: **2,408 files**, 151 Composer review PDFs, zero forbidden or incoming assets. Build output remains ignored local validation material.
- Publication tests: **6 pass, 1 skip**. The existing private-export byte-hash test cannot read restricted private files; no permissions were changed.
- Teaching-guide download content checks: all four pass.
- Edge at **1440×1000 and 390×1000**, six edited pages per viewport: no page overflow, one H1 per page, logical heading progression, named links, and **zero axe violations**. Visually reviewed cards and data-guide views.
- Keyboard skip link, visible link/table focus, mobile menu/Enter/Escape, search/no-results/reset, category navigation clearing search, mobile table overflow, and introduction anchor visibility pass. All 88 fields remain present without JavaScript.
- `git diff --check`: pass. Compared changed paths with the starting commit: only the six documentation HTML files and this report are included.
- Local browser runner, screenshots and JSON results: ignored `tmp/accessibility_cleanup/faculty-resources-final/`. The runner adapts the previous focused audit; no tracked test or production scripts changed.

## Limitations and deliberately avoided changes

There is still no complete 117- or 70-field dictionary. The general introduction explains format differences without inventing field meanings or cross-game equivalencies. Historical format labels were preserved; historical exporters were not recreated. Browser checks are local Edge checks, not a physical-device or screen-reader certification, and do not verify a deployed site.

No engines, banks, answer keys, adaptive/scoring/remediation logic, report generators, telemetry collection/serialization, analysis parsing, Composer functionality, Worker configuration, subscriptions, access settings, production routes, environment variables, or downloadable artifacts were modified. Unrelated gameplay suites and the previously reported outcome-generator mismatch were not revisited. Existing legitimate practice-assignment instructions were retained.

Requested local commit: `Simplify faculty resources and clarify game data guidance`.
