# Telemetry Data Dictionary

## Executive Summary

PASS. Implemented locally; not deployed. Faculty Resources replaces the visible How To section label across 15 existing public pages, retaining all existing URLs and instructional sections. The new dictionary documents all 75 current private Managerial local CSV fields and includes search, category navigation, timing examples, privacy boundaries, and practical faculty guidance. Changes comprise the 15 existing pages, new dictionary/data/styles/script, maintenance tools, validation evidence, and this report; exact list below.

## Information Architecture

The Faculty Resources landing page stays at /how-to/. The dictionary lives at /how-to/telemetry-data-dictionary/ and is linked from the landing-page jump navigation and a dedicated resource card. Existing /how-to/composer/ and /how-to/canvas/ guides are linked alongside the existing adaptive-engine/mastery evidence and publishing guidance. All six existing section anchors remain. Primary and footer labels, landing heading/title/description, and the home-page call to action are updated. The new page has a Faculty Resources breadcrumb. Shared mobile navigation uses the same updated labels. No redirects or invented resource pages were added.

## Source of Truth

- All four game index.html files under play/managerial-directorate-classroom/ and play/managerial-directorate-telemetry-poc/: TELEMETRY_COLUMNS, sendGameData, escapeCsvValue, downloadTelemetryCsv, accepted/rapid response emitters, summary emitters, and Fading Fortune / Risk & Reward mechanics.
- play/managerial-directorate-telemetry-poc/telemetry-client.js: BEHAVIOR_FIELDS, installLocalTelemetryColumns, attachLocalMeasurements, responseMeasurements, finishInterval, mapGameEvent and Composer-derived tracker. The classroom telemetry-client.js is the generated equivalent.
- build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html: visibility/focus/selection/copy helper definitions. The existing synchronization checker confirms the maintained adapter helper matches Composer.
- FINAL_REPORT_managerial_local_csv_parity.md and FINAL_REPORT_managerial_telemetry_parity.md: compatibility boundary, measured/legacy rows, local/aggregate event distinctions, prior verification findings.
- server/anonymous-telemetry-poc/telemetry-core.mjs: aggregate envelope, acceptedAttempt, and separate field names; used only to distinguish the collection paths.

The actual local schema is 57 original columns plus 17 behavioral fields and gameplayResponseTimeMs. responseTimeMs was already present. No anonymous-only schema/build/sequence/graph/mastery fields were added to the dictionary. Local accuracy is a 0–1 fraction; wager percent is 0–100. Wager-committed events use other source names and do not populate the similarly named local response columns. Exam draft correctness defaults to zero. These differences are explicitly documented.

## Dictionary Coverage

Current CSV fields: 75. Authored inventory: 75. Rendered dictionary: 75. Missing: 0. Stale: 0. Duplicate: 0.

Coverage passes for all eight game/build combinations. The test executes the actual column-installation function against actual base arrays, rather than maintaining a second expected-name list. Addition/removal drift self-test passes. Render checking protects every rendered field property against inventory drift. The JSON inventory supplies all requested metadata; the page is static HTML with optional vanilla-JavaScript filtering.

## Key Faculty Guidance

Use local event=question for accepted responses; examine rejected rapid_guessing separately. Exam draft/revision rows are not committed correctness evidence. For the separate anonymous export use answer_evaluated, filtering accepted attempts as appropriate, rather than counting submitted/evaluated/feedback copies together.

New measured responseTimeMs is elapsed telemetry time; visible plus hidden approximates elapsed. The example explicitly shows 12000 = 7000 + 5000 milliseconds and one visibility transition. Hidden and unfocused durations can overlap and must not be added. Exam commits sum view durations/counts, retain maximum/any selection properties, use final-view return/refocus fields, and preserve latest copied-view offsets. Legacy responseTimeMs has different gameplay-clock semantics; nonblank activeResponseTimeMs identifies newly measured rows and gameplayResponseTimeMs preserves the original engine value.

Blank means unavailable/inapplicable/older or a conditional event not observed. Measured behavioral zero means zero/false; older numeric columns can instead contain unused zero defaults. Filtering event and mode is essential. Behavioral interaction is not proof of cheating or intent. Selection/copy tracking stores counts, lengths, flags and timing, not selected/copied text, clipboard contents, keystrokes, screens, unrelated URLs or history. This scoped statement does not promise that the entire site collects no other data. No administrative endpoint instructions, tokens, or credentials are included publicly.

## Validation

- Schema coverage: PASS, eight sources, 75 fields each, zero mismatches; addition/removal self-test PASS.
- Inventory render check: PASS.
- Headless Edge desktop 1440px and mobile 390px: PASS. Screenshots visually reviewed. No horizontal page overflow; wide tables scroll within labeled, keyboard-focusable regions.
- Search match/no-results/reset, 75 no-JavaScript entries, one H1, scoped table headers, skip link, menu expanded state/Escape: PASS. Visible focus styles and navy/white, dark-text/light-background contrast reviewed. This is targeted accessibility validation, not a screen-reader certification.
- Navigation: PASS for all 15 updated pages and their local navigation targets. Existing Composer/Canvas pages resolve; dictionary discoverability and six retained help anchors pass.
- Browser script errors: zero. Browser external requests blocked during validation.
- Existing Composer/derived-client synchronization regression: PASS.
- No current executable public-navigation regression suite was found; historical nav_patch_validation.json remains unchanged. New browser coverage exercises those navigation paths.
- Git diff whitespace check: PASS. No game, question bank, LO, Composer, Worker, collection or gameplay files changed. Existing user CSV exports untouched.

Reproduce with node audit_tools/telemetry_data_dictionary/check.mjs, node audit_tools/telemetry_data_dictionary/render.mjs --check, and node audit_tools/telemetry_data_dictionary/browser.mjs (Playwright/Edge required for browser checks). See the tool README for inventory editing and evidence options.

## Files Changed

- about/index.html
- build/index.html
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
- index.html
- privacy/index.html
- resources/index.html
- how-to/telemetry-data-dictionary/index.html
- how-to/telemetry-data-dictionary/fields.json
- assets/css/telemetry-dictionary.css
- assets/js/telemetry-dictionary.js
- audit_tools/telemetry_data_dictionary/check.mjs
- audit_tools/telemetry_data_dictionary/render.mjs
- audit_tools/telemetry_data_dictionary/browser.mjs
- audit_tools/telemetry_data_dictionary/navigation-files.json
- audit_tools/telemetry_data_dictionary/README.md
- validation_artifacts/telemetry_data_dictionary/browser-results.json
- validation_artifacts/telemetry_data_dictionary/schema-results.json
- validation_artifacts/telemetry_data_dictionary/dictionary-1440.png
- validation_artifacts/telemetry_data_dictionary/dictionary-390.png
- validation_artifacts/telemetry_data_dictionary/fields-1440.png
- validation_artifacts/telemetry_data_dictionary/fields-390.png
- FINAL_REPORT_telemetry_data_dictionary.md

## Deferred Opportunities

Future game/version dictionaries can reuse the authored inventory and coverage pattern. A research analysis guide or assistive-technology user review could be added separately. No analytics dashboard or automatic misconduct classification was built. Deployment remains a separate action.

## Final Verdict

PASS
