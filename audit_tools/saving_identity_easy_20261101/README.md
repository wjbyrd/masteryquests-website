# Five conceptual Easy questions for Saving and Investment Identities

Adds `SLF-ID-E-001` through `SLF-ID-E-005` at the instructor's request following
the completed easy-pool review. The questions cover household saving, investment
in GDP, positive public saving, the components of national saving, and the use
of national saving in a closed economy. None requires equations or arithmetic.

The topic now has **9 Easy, 10 Medium, and 5 Hard ordinary questions**. Its
standalone Quiz meets all three difficulty minimums and generates successfully.
The canonical bank grows from 9,777 to 9,782 unique questions. All pre-existing
questions and checkpoint/support routes are unchanged.

`questions.json` is the authored source. `apply.cjs` appends exactly those five
records, computes answer/provenance hashes, updates count metadata, and
recalculates faculty-outcome coverage. The immutable baseline is commit
`2c59df2481587e4b4ad2612c1c8426efc7ef08a1`. `expectations.json` records the exact
additions and before/after metadata. Historical checks remove only those verified
additions and reconstruct the previous semantic hash; current comprehensive and
taxonomy checks explicitly include the five new IDs.

The three faculty PDF/CSV banks are regenerated through the existing exporter.
Only Macroeconomics gains questions (4,752 total); the General and Micro content
is unchanged. Its Excel workbook is refreshed in the established layout. All
faculty files remain in the local ignored `faculty_exports/` directory. No
website update-page entry is added.

Validation includes the focused addition/quiz check, comprehensive bank audit,
Macro taxonomy audit, faculty-outcome validation, and Quiz runtime test. Export
checks reconcile the new questions and all earlier easy-review changes with PDF
and CSV content, and every bank workbook cell with its CSV. The new question
pages and workbook rows are rendered for visual inspection. Reports are stored
beside this file; logs and renderings are ignored.

```powershell
node audit_tools/saving_identity_easy_20261101/apply.cjs --write
node audit_tools/saving_identity_easy_20261101/run-validation.cjs
python tools/export_faculty_question_bank.py --node <node-executable>
node audit_tools/easy_pool_review_20261101/excel.mjs --area=macro --report-directory=audit_tools/saving_identity_easy_20261101 --preview-id=SLF-ID-E-001
python audit_tools/easy_pool_review_20261101/verify_exports.py --report-directory audit_tools/saving_identity_easy_20261101 --additions audit_tools/saving_identity_easy_20261101/expectations.json
python audit_tools/easy_pool_review_20261101/verify_excel.py --report-directory audit_tools/saving_identity_easy_20261101
```

The Excel builder uses the bundled `@oai/artifact-tool` dependency as documented
in the original easy-review audit. The bank and export scripts reject source
drift or mismatched answer keys instead of silently accepting them.
