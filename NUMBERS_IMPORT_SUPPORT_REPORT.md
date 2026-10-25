# Apple Numbers and Excel import support

Implemented and tested locally on October 24, 2026. No push, merge, or deployment performed for this change.

## Result

Answer Analysis accepts CSV, Excel `.xlsx`, and Apple Numbers `.numbers` through file selection or drag-and-drop. Workbook parsing runs locally in a Web Worker. Recognized tables feed the existing normalization, deduplication, filters, question analysis, difficulty reporting, and instructor summary. The current dashboard layout is retained.

The original importer supported CSV only. This change adds both workbook formats without routing CSV through a new parser.

## Dependency and approach

The application vendors **SheetJS Community Edition 0.20.3** from its official distribution, with its Apache 2.0 license and attribution. The source is unchanged:

- Source: <https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js>
- SHA-256: `cc015130aa8521e7f088f88898eba949ccdcbfb38df0bd129b44b7273c3a6f41`
- Size: 951,904 bytes uncompressed; 335,530 bytes gzip in the local measurement.
- The browser loads it from this site's `tools/answer-analysis/vendor/` only when parsing a workbook; CSV imports do not load it.
- The separate Numbers-writing payload is used only to generate synthetic regression fixtures and is not a runtime dependency.

The [official installation documentation](https://docs.sheetjs.com/docs/getting-started/installation/standalone/) identifies 0.20.3 and recommends vendoring. The smaller build omits Numbers support, so the full build is required. The [format documentation](https://docs.sheetjs.com/docs/miscellany/formats/) describes extraction from modern IWA-based Numbers files and exposes each Numbers table as a worksheet. This avoids writing a custom, incomplete IWA converter. The [license](https://docs.sheetjs.com/docs/miscellany/license/) permits redistribution with attribution.

Maintenance/security review: the official project continues to publish documentation and compatibility tests. The version was checked against the publisher's advisories: [prototype pollution](https://cdn.sheetjs.com/advisories/CVE-2023-30533) is fixed from 0.19.3; [regular-expression denial of service](https://cdn.sheetjs.com/advisories/CVE-2024-22363) is fixed from 0.20.2. This is a dependency review, not a comprehensive security audit or guarantee against future issues. Future upgrades should check official releases/advisories and rerun the committed tests; do not substitute the older npm `xlsx` release.

## Supported structures and table selection

- Modern, unencrypted, single-file Numbers archives with `Index/Document.iwa` (Numbers 3 / iWork 2013 and later format family, within parser compatibility).
- Unencrypted `.xlsx` archives with `xl/workbook.xml`.
- Multiple Numbers tables/sheets or Excel worksheets. A non-telemetry cover sheet can precede the data.
- A table header within the first 50 used rows. Leading title rows and blank columns are allowed when they contain no telemetry data below the header.
- Local header signature: `event`, `runID`, `game`, `correct`, a question ID/snapshot column, and a response-time column. Private snake-case equivalents and `extras_json` are recognized. This is a field-based minimum, not an assumption that every file has exactly 88 columns.
- All recognized nonempty telemetry tables are imported together as one document. Their names appear in the imported-file list; skipped non-telemetry/header-only tables are listed. Existing attempt/event deduplication resolves overlap between tables and files.
- A telemetry-looking table with missing required columns fails the document import with a specific error. It is not silently omitted while another valid table imports.
- Multiple independent telemetry blocks in one Excel worksheet, duplicate headers, reserved internal headers, merged telemetry cells, and populated columns without headers are rejected.

The UI states the all-matching-tables rule before import. Instructors do not need to guess the first sheet or manually convert files.

## Fidelity

The importer reads underlying cell values rather than formatted display strings. Text cells stay text, including leading zeroes, long identifiers, Unicode, quoted commas, and embedded newlines. It does not convert identifier strings to numbers. All supplied columns are retained, in their table's order; blank cells become empty strings, matching the CSV pipeline. No missing telemetry columns are manufactured.

Native numeric cells become their raw numeric string representation without display rounding. Unsafe integers and formatted numeric identifiers are rejected rather than guessed. Date-converted cells are rejected because their original timestamp text/timezone cannot reliably be reconstructed. Spreadsheet errors and exposed formula cells are rejected. Formula execution, macro execution, HTML export, and external-link retrieval are not used.

The application cannot reverse changes a spreadsheet already made before the file was saved. In particular, numeric precision already lost, removed leading zeroes, changed timestamps, or changed text cannot be recovered. SheetJS uses JavaScript numeric precision for numeric cells; exact arbitrary-precision values must be stored as text. Numbers formula metadata is not guaranteed to be exposed, so cached values returned without formula metadata cannot be distinguished from original values. This remains a data-extraction tool, not a document-authenticity check.

Synthetic committed regression inputs use the registered **88-column Managerial snapshot schema**: 61 data rows, including 48 accepted answers, six runs, start events, boss events, five ending events, and missing cells. Equivalent CSV, XLSX, and binary IWA Numbers documents produce:

| Check | Result |
|---|---|
| Column count and ordered names | Exact match: 88 |
| All extracted cell strings, including run/question IDs | Exact match |
| Correctness, selections, timing, timestamps, snapshots | Exact match |
| Start, answer, boss, and ending records | Exact match |
| Full Answer Analysis result | Deep-equal to equivalent CSV |
| Duplicate file in another format | Rejected as already loaded |
| Duplicate telemetry table | Answers counted once |

Evidence: `audit_tools/answer_analysis/workbook-fixtures/fidelity-results.json`. A separately downloaded public Numbers sample from <https://docs.sheetjs.com/pres.numbers> also parsed successfully; it is not telemetry data and is kept only in ignored local scratch space.

**The two actual Cost Directive student Numbers submissions and equivalent CSVs were not available** in the workspace or attachments searched for this task. No real-student equivalence result is claimed. Those private files should still be tested before rollout; they must not be committed.

## Privacy and resource limits

- No conversion service, upload, server storage, student analytics, or external runtime CDN.
- Raw documents and extracted rows stay in browser memory; Clear removes report state and cancels active workbook workers.
- Each worker terminates after its result or error; a 30-second timeout prevents indefinitely blocking imports.
- 25 MB per input; ZIP-directory preflight bounds expanded ZIP data to 128 MB and entries to 20,000, and checks local/central entry consistency before parsing.
- Table extraction caps 100,000 rows per table, 512 columns, and 2 million aggregate used-range cells. Limits fail with an explanation, never partial import.
- These are practical limits, not a hard process-memory sandbox. Numbers has internal compression, and parsing can allocate memory before extraction limits are evaluated.
- ZIP64, multi-volume ZIP, encrypted archives, and obsolete Numbers ’09/package-folder structures are unsupported. Files merely renamed from CSV are explicitly rejected.
- Workbook labels, filenames, and values are rendered as text, not HTML. Existing CSV download escaping remains in place.

## Interface and student export changes

The import label is “Upload game data: CSV, Excel, or Apple Numbers.” Accepted extensions, the 25 MB limit, and the multiple-table rule are visible. The imported-file list identifies Apple Numbers or Excel and the selected/skipped tables. Malformed archives, wrong formats, empty data, missing headers, unsafe cells, and unsupported structures receive specific explanations.

Cost Directive's six existing game-data download buttons now say “Download Game Data (.csv)” and include “Submit the original downloaded file. Do not open and resave it in spreadsheet software.” The helper text wraps below flex action rows. No other games or gameplay logic were changed.

The game download function and its shared `local-telemetry.js` CSV wrapper were inspected and tested. They use an explicit `.csv` filename, `text/csv;charset=utf-8`, ordered telemetry headers, CSV quoting, and (in the wrapper) a UTF-8 BOM. The wrapper appends the existing schema columns to reach 88 and retains the existing export-contract behavior. Neither exporter implementation nor schema was modified.

## Validation

- `node audit_tools/answer_analysis/workbook-import-check.mjs`: PASS. Exact workbook/CSV fidelity; headers; multiple tables; text IDs; fractional numeric values; invalid integer precision; missing columns; duplicate headers/imports; empty, malformed, renamed, and oversized inputs; formulas/dates/errors; actual CSV download serialization and MIME/filename checks.
- `node build/faculty-build-composer/tests/run_answer_analysis_validation.mjs`: PASS. Existing snapshot, import, deduplication, filtering, question, key, summary, timing, and 17-engine integration checks.
- `node audit_tools/answer_analysis/dashboard-check.mjs`: PASS. Dashboard calculations and all 11 registered CSV layouts.
- `node audit_tools/answer_analysis/workbook-import-browser.mjs`: PASS in Chromium/Microsoft Edge. Picker and Numbers drag/drop, exact displayed totals, mixed-format duplicates, multiple tables, filters, malformed/empty failures, clear-during-read, and zero external requests.
- `node audit_tools/answer_analysis/class-browser.mjs`: PASS. Existing CSV batches, duplicate/removal behavior, filters, downloads, queued imports, and clear during read.
- `node audit_tools/answer_analysis/release-browser.mjs`: PASS. Existing clipboard, feedback, CSV downloads, review links, keyboard controls, mobile layouts and release navigation. Its accessible-label assertion was updated to match the requested format label.
- `node audit_tools/public_site_publication/build-dist.mjs .`: PASS. 2,417 public files, including the local worker/parser/license assets; 151 Composer concept-review PDFs; zero forbidden files and zero incoming question assets. No deployment was performed.
- Browser accessibility: axe WCAG A/AA and best-practice checks returned zero violations at 1440, 768, and 390 pixels. No horizontal page overflow. Import-panel screenshots were visually inspected. This is not a manual screen-reader audit.
- Firefox and WebKit: **not run**, because their Playwright executables are not installed on this host. The browser test attempts them and records the limitation.

Browser evidence is under `audit_tools/answer_analysis/workbook-evidence/`. The synthetic binary fixtures are committed candidates; the Numbers writer payload and the public sample remain ignored under `tmp/numbers-import/`. Normal regression runs use the saved fixtures without a download. To regenerate, obtain the official `xlsx.zahl.js` 0.20.3 payload at that scratch path and run `workbook-import-check.mjs --generate`.

## Files changed

- `tools/answer-analysis/file-import.js`: format dispatch, worker lifecycle, size checks and cancellation.
- `tools/answer-analysis/import-worker.js`: local workbook parser execution.
- `tools/answer-analysis/workbook-import.js`: archive checks, schema/table selection and cell fidelity rules.
- `tools/answer-analysis/vendor/`: pinned parser, license and attribution.
- `tools/answer-analysis/analysis.js`: shared row import path and canonical cross-format duplicate detection.
- `tools/answer-analysis/report.js`: workbook integration, format/table labels and cancellation.
- `tools/answer-analysis/index.html`: format UI, local importer script and methodology.
- `play/managerial-intelligence-directorate/cost-directive/index.html`: only student download wording and helper styling.
- `audit_tools/answer_analysis/workbook-fixtures.mjs`, `workbook-import-check.mjs`, `workbook-import-browser.mjs`, `workbook-fixtures/`, `workbook-evidence/`: synthetic fixtures, regression checks and evidence.
- `audit_tools/answer_analysis/release-browser.mjs`: updated the expected accessible import label.
- This report.

No question banks, answer hashes, progression, scoring, remediation, telemetry schemas, or live collection logic changed.
