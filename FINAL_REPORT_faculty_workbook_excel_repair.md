# Faculty workbook Excel table repair

Status: fixed and validated in native Microsoft Excel. **NOT DEPLOYED.**

## Baseline and source of truth

- Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`
- Branch: `main`
- Starting HEAD: `dcb84a025a10ba76deac66ce85f59fe66c0e8489`
- Starting working tree: clean, captured before edits.
- Canonical generator: `audit_tools/free_faculty_template/workbook.mjs`.
- Public output: `downloads/resources/faculty-question-bank-validator.xlsx`.
- Generator uses bundled `@oai/artifact-tool` (`SpreadsheetFile.importXlsx`, worksheet/table APIs, recalculate/render/export). Its existing source seed is `validation_artifacts/free_faculty_template_parity/workbook/before.xlsx`.
- Existing checks used artifact-tool formula recalculation/rendering and workbook readback, plus `audit_tools/free_faculty_template/check.mjs` and `browser.mjs`. They did not compare table metadata to cell headers or require native Excel normal-load acceptance.

## Symptom and isolated root cause

The reported warning was “We found a problem with some content...” and the recovery log identified **“Repaired Records: Table from /xl/tables/table1.xml part (Table)”**.

Before changing the generator, its unmodified source was run with an isolated repository-relative staging root, the historical seed, and current sample JSON. Both the original download and that fresh output fail native Excel 16.0 `Workbooks.Open` with explicit `CorruptLoad=0`, returning “Unable to get the Open property of the Workbooks class” (HRESULT -2146827284). No repair fallback was used.

The generator edited worksheet header cells but retained the imported table's old column definitions. These five disagreements trigger the failure:

| Cell | Stale tableColumn name | Actual worksheet header |
| --- | --- | --- |
| V1 | ImageAccessibilityNote | LegacyImageNote |
| AB1 | IDRangeAudit | IDConventionNote |
| AC1 | ValidationStatus | DraftStatus |
| AD1 | ValidationMessage | DraftMessage |
| AE1 | ExportObject | NextStep |

To isolate the cause, a diagnostic ZIP copy changed **only those five table names**, retaining the old 31-column range and absent autoFilter. That copy opens successfully in Excel normal mode and passes recalculation. Thus the header disagreement, rather than merely having adjacent worksheet columns outside a table, is the demonstrated repair trigger. The diagnostic copy is evidence only, not the public output.

The table also had stale coverage: `A1:AE301` while the intended drafting area is `A1:AJ301`. GraphRequired, AnswerHash, ImageAlt, GraphDescription, and BossStage were outside the table. The final fix corrects this coverage and adds an explicit matching filter.

## OOXML inspection and correction

| Property | Before | Final |
| --- | --- | --- |
| table id | 1, valid | 1 |
| name / displayName | QuestionBankTable, valid Excel identifier | Same |
| table ref | A1:AE301 | A1:AJ301 |
| autoFilter ref | Element absent | A1:AJ301 |
| headerRowCount | Omitted (default 1) | Explicit 1 |
| totalsRowCount / totalsRowShown | Omitted | Explicit 0 / 0 |
| tableColumns count / actual elements | 31 / 31 | 36 / 36 |
| column IDs | Sequential 1–31 | Sequential 1–36 |
| column names | Nonempty and unique, but five stale | Exactly match all 36 worksheet headers |
| worksheet populated extent | A1:AJ301 | A1:AJ301 |
| style | TableStyleMedium2, row banding | Preserved |

All XML parts parse successfully; there are no invalid XML characters. The worksheet omits the optional dimension element, so the guard derives its extent from actual cells. The worksheet-to-table relationship resolves correctly to `/xl/tables/table1.xml`; its ID matches the worksheet tablePart, and the part has the required table content-type registration. These relationships were not the failure source. The final guard resolves the workbook-to-worksheet relationship as well and rejects missing/extra table parts, inconsistent names/counts/IDs, and invalid schema coverage.

The generator now recreates `QuestionBankTable` after writing the final headers, using the documented table API, retaining the original table name/style and enabling filters. The table remains useful for filtering and row banding. No faculty workflow changes were needed. Export now writes artifact-tool's diagnostic sidecar under validation evidence and copies only the XLSX into public downloads. `MQ_WORKBOOK_EVIDENCE_DIR` allows fresh generation evidence without overwriting historical evidence or changing the source seed.

## New guards and preserved behavior

- `audit_tools/faculty_workbook_excel_repair/check.py`: deterministic OOXML semantic guard, full 300-row extent, 36 exact headers, filters, counts, IDs, relationships, content types, table style, data validations, completeness formulas and cached summary. It rejects the real broken baseline and eight independent negative fixtures (range, filter, count, stale name, duplicate/blank names, duplicate ID, invalid table name).
- Read-only comparison confirms **all cell values, formulas, and number formats on all five sheets are identical** to the previous public workbook. openpyxl is used only for reading, never authoring/saving. Its warnings about unsupported extension preservation do not affect an output because it saves none.
- Pool, Difficulty, A–D answer, and TRUE/FALSE graph validations remain present over rows 2–301. Instructions, Lists, Examples, summary and the clipboard workflow remain. Columns Z–AE retain their existing formulas, including the browser URL instead of executable JavaScript export.
- Artifact-tool and native Excel both pass: clear P2 (RepairSkill) → INCOMPLETE; restore → CHECK ONLINE. Summary is 5 rows started, 0 incomplete, 5 ready for online checks.
- `sample.mjs` sends the extracted A1:AJ6 TSV through the actual `MQManualPackage.fromTSV` and `validatePackage` implementation: **5 unique sample questions accepted, 0 errors**. IDs: demo-1, demo-13, demo-61, demo-73, demo-76. The existing local-image reminder for sample-bars.svg remains expected; these five examples are not a complete playable bank for every mode.
- Generated Question_Bank input/status regions were visually reviewed. The 300-row layout, header styling and status text remain, with the table's banding extended through AJ.

## Native Excel acceptance

`audit_tools/faculty_workbook_excel_repair/excel-smoke.ps1` creates an invisible Excel instance, disables macros/events, opens read-only with explicit normal load, verifies the table and headers, exercises recalculation, checks for new `error*.xml` recovery logs in the temp directory, closes without saving, and exits nonzero on failure. It never requests repair or data extraction. The optional expected-range/count arguments are used only for the isolated 31-column diagnostic.

Microsoft documents that normal object-model loading does not attempt recovery; see [Workbooks.Open](https://learn.microsoft.com/en-us/office/vba/api/excel.workbooks.open) and [XlCorruptLoad](https://learn.microsoft.com/en-us/office/vba/api/excel.xlcorruptload).

| Native Excel case | Result |
| --- | --- |
| Original public workbook | Normal-load failure, exit 1 |
| Fresh output from unchanged generator | Same normal-load failure, exit 1 |
| Diagnostic with only five header names corrected | Normal-load PASS, no recovery logs |
| Final generated public download | Normal-load PASS, A1:AJ301, 36 matching columns, mutation PASS, no recovery logs, no save |

This provides automated native Excel acceptance for the final bytes; no repaired workbook was accepted or saved. A human Excel-open check is not outstanding for this task.

## Regressions and controlled publication build

- Free faculty template package/schema checks: **18 PASS**.
- Existing Edge browser checks: **18 PASS**, including validator UI negatives, offline launch, all ten modes, save/refresh/resume, adaptive repair/bridge, graph accessibility/mobile, completion/download and no runtime errors/unintended telemetry.
- Documentation guard: **17 pages, 552 links, 79 unique targets, 0 broken links**, both negative controls pass.
- Downloadable documentation guard: **4 DOCX guides PASS**.
- New workbook semantics/negative fixtures, mutation and five-row conversion: **PASS**.
- `git diff --check`: **PASS**.
- `node audit_tools/public_site_publication/build-dist.mjs .`: **PASS**, 1,789 files, 151 Composer Concept Review PDFs, 0 forbidden files, 0 incoming question assets.
- Source and dist XLSX SHA-256 both: `ed5419290fe3a573008eac680c654a2551f3e36cb52307ec74dc3c462903fade`.

All evidence is under `validation_artifacts/faculty_workbook_excel_repair/`, including pre-fix XML parts and XLSX, unchanged-generator reproduction, header-only diagnostic, three native comparison reports plus final acceptance, generated XLSX/renders, package checks, sample TSV/conversion, browser results, and dist counts. Earlier workstream evidence is preserved.

## Files changed and rerun commands

Modified:

- `audit_tools/free_faculty_template/workbook.mjs`
- `downloads/resources/faculty-question-bank-validator.xlsx`

Added:

- `audit_tools/faculty_workbook_excel_repair/check.py`
- `audit_tools/faculty_workbook_excel_repair/excel-smoke.ps1`
- `audit_tools/faculty_workbook_excel_repair/sample.mjs`
- `audit_tools/faculty_workbook_excel_repair/evidence-redirect.cjs`
- `FINAL_REPORT_faculty_workbook_excel_repair.md`
- Task evidence beneath `validation_artifacts/faculty_workbook_excel_repair/` (see its `manifest.json` for the exact file list).

The ignored `dist` directory was rebuilt. No other public source files changed.

Using the bundled Node/Python runtimes and existing artifact-tool dependency:

```powershell
$env:MQ_WORKBOOK_EVIDENCE_DIR='validation_artifacts/faculty_workbook_excel_repair/generated'
node audit_tools/free_faculty_template/workbook.mjs
python audit_tools/faculty_workbook_excel_repair/check.py --baseline validation_artifacts/faculty_workbook_excel_repair/before.xlsx
node audit_tools/faculty_workbook_excel_repair/sample.mjs
./audit_tools/faculty_workbook_excel_repair/excel-smoke.ps1 -WorkbookPath downloads/resources/faculty-question-bank-validator.xlsx -ReportPath validation_artifacts/faculty_workbook_excel_repair/excel-after.json
node --require ./audit_tools/faculty_workbook_excel_repair/evidence-redirect.cjs audit_tools/free_faculty_template/check.mjs
node --require ./audit_tools/faculty_workbook_excel_repair/evidence-redirect.cjs audit_tools/free_faculty_template/browser.mjs
node audit_tools/public_documentation/check.cjs
python audit_tools/public_documentation/check-downloads.py
node audit_tools/public_site_publication/build-dist.mjs .
git diff --check
```

The browser check requires Playwright (set `PLAYWRIGHT_MODULE` to the bundled module when needed) and installed Edge. Native Excel requires access to the Windows desktop COM session. **Deployment status: NOT DEPLOYED.**
