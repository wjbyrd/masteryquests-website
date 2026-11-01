# Remaining conceptual Easy gaps

Adds seven conceptual Easy questions at the instructor's request, following
approval of the five Saving and Investment and thirteen prior Quiz additions.
All 18 previously approved additions and every other existing question are
preserved exactly. The canonical bank grows from 9,795 to 9,802 questions.

| Topic | Added | Easy before | Easy after | Medium | Hard | Still needed for a standalone Quiz |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Long-Run Aggregate Supply and Potential Output | 3 | 2 | 5 | 1 | 3 | 4 Medium and 2 Hard |
| Market Power | 3 | 2 | 5 | 2 | 1 | 3 Medium and 4 Hard |
| Price Signals | 1 | 4 | 5 | 7 | 4 | 1 Hard |

The audit checks runtime ordinary Quiz pools, excluding checkpoint and support
questions. All 146 ordinary selectable topics now meet the five-question Easy
minimum. Integrated Economic Analysis and the Advanced Macro Checkpoint
Supplement retain their intentionally non-ordinary roles and are excluded from
that minimum. This change does not fill Medium or Hard gaps or claim these three
topics are standalone-Quiz ready. Each works in a verified combined Quiz with an
appropriate related topic.

`questions.json` is the authored source. `apply.cjs` appends the seven records,
using the existing compatibility parent for the derived Market Power topic, and
updates provenance, counts, hashes, and faculty-outcome coverage. It uses immutable
baseline commit `5714f7996e53c82e60e995ce206d246eb4ef84b4`.
`expectations.json` records the exact additions and previous registry. Regression
adapters remove only verified additions and reconstruct the prior semantic hash.

The PDF/CSV and native Excel banks are rebuilt through the existing exporters,
retaining their established formatting. Existing Microeconomics manual-review
files receive current page references; reviewer data, dropdowns, hidden lookup
sheet, and historical rows are preserved against a fresh local backup. All banks
remain in the ignored `faculty_exports/` directory. No website update-page entry
is added.

Final exports contain 1,594 General Economics questions (828 PDF pages), 6,308
Microeconomics questions (3,491 pages), and 4,766 Macroeconomics questions (2,509
pages). General Economics has no new questions in this batch; its files are
refreshed with the current bank metadata.

Seven targeted runners cover these additions and all-topic Easy coverage, prior
approved additions, the comprehensive question-bank audit, Macro taxonomy,
faculty outcomes, and Quiz mode. Export checks reconcile the earlier Easy-pool
revisions and all 25 additions with PDF and CSV content. Every bank workbook cell
is compared with its CSV. Renderings are visually inspected; report files are
tracked here while backups, logs, and renderings are ignored.

```powershell
node audit_tools/remaining_easy_completion_20261101/apply.cjs --write
node audit_tools/remaining_easy_completion_20261101/run-validation.cjs
python tools/export_faculty_question_bank.py --node <node-executable>
node audit_tools/easy_pool_review_20261101/excel.mjs --report-directory=audit_tools/remaining_easy_completion_20261101 --preview-ids=REC-LRAS-E-001,REC-MPOWER-E-001,REC-PSIG-E-001
python audit_tools/easy_pool_review_20261101/restore_review_sheet_state.py --baseline-directory audit_tools/remaining_easy_completion_20261101/baseline
python audit_tools/easy_pool_review_20261101/verify_exports.py --report-directory audit_tools/remaining_easy_completion_20261101 --additions audit_tools/saving_identity_easy_20261101/expectations.json --additions audit_tools/quiz_easy_completion_20261101/expectations.json --additions audit_tools/remaining_easy_completion_20261101/expectations.json
python audit_tools/easy_pool_review_20261101/verify_excel.py --report-directory audit_tools/remaining_easy_completion_20261101 --baseline-directory audit_tools/remaining_easy_completion_20261101/baseline
```

Excel authoring uses bundled `@oai/artifact-tool`. Its unsupported native sheet
visibility metadata is restored separately from the fresh backup, following the
existing export workflow; all cell authoring stays in Artifact Tool.
