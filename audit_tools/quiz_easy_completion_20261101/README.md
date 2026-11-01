# Conceptual Easy questions to complete six Quiz pools

Adds 13 Easy questions at the instructor's request. The questions use definitions
and short qualitative scenarios, with no equations or arithmetic.

| Topic | Added | Easy before | Easy after | Medium | Hard |
| --- | ---: | ---: | ---: | ---: | ---: |
| Trade Policy: Efficiency and Distribution | 1 | 4 | 5 | 7 | 9 |
| Long-Run Macroeconomic Self-Adjustment | 4 | 1 | 5 | 5 | 9 |
| Competitive Markets | 1 | 4 | 5 | 6 | 5 |
| Deposit Creation and Money Multiplier | 2 | 3 | 5 | 8 | 6 |
| Monopolistic Competition: Efficiency, Variety, and Model Limits | 2 | 3 | 5 | 8 | 16 |
| Statutory versus Economic Tax Incidence | 3 | 2 | 5 | 6 | 5 |

These counts follow the composer's ordinary Quiz pools, excluding checkpoint and
support questions. Every topic now meets the five-question minimum at each
difficulty, and each generated standalone Quiz compiles. The canonical bank grows
from 9,782 to 9,795 questions. All existing questions, including the five previously
approved Saving and Investment Identities questions, remain unchanged.

`questions.json` is the authored source. `apply.cjs` builds records and provenance,
stores derived-topic questions in their existing parent modules, updates count
metadata, and recalculates faculty-outcome coverage. `expectations.json` records
the exact additions and prior registry at baseline commit
`528672cdcd2f383d27469a28064821825fff07f7`. Historical checks remove only these
verified additions to reconstruct the prior semantic hash. Current comprehensive
and taxonomy checks include the new IDs explicitly.

All three faculty PDF/CSV banks and native Excel banks are rebuilt with the
existing exporters and formatting. The manual Microeconomics review files receive
updated PDF page references while retaining their existing rows, reviewer entries,
dropdowns, and hidden lookup sheet. A fresh local backup protects those entries.
Faculty files stay in the ignored `faculty_exports/` directory. No website
update-page entry is added.

Final exports contain 1,594 General Economics questions (828 PDF pages), 6,304
Microeconomics questions (3,489 pages), and 4,763 Macroeconomics questions (2,508
pages). Shared questions appear in each applicable course bank.

Six targeted checks cover the new questions and generated Quizzes, preservation
of the Saving and Investment additions, the comprehensive question-bank audit,
Macro taxonomy, faculty outcomes, and Quiz mode. Export checks reconcile every
earlier easy-review change plus all 18 additions with PDF and CSV content, and
compare every Excel bank cell against its CSV. New PDF pages and Excel rows are
rendered for visual inspection. Reports are stored here; logs, backups, and
renderings are ignored.

```powershell
node audit_tools/quiz_easy_completion_20261101/apply.cjs --write
node audit_tools/quiz_easy_completion_20261101/run-validation.cjs
python tools/export_faculty_question_bank.py --node <node-executable>
node audit_tools/easy_pool_review_20261101/excel.mjs --report-directory=audit_tools/quiz_easy_completion_20261101 --preview-id=QEC-TRADE-E-001
python audit_tools/easy_pool_review_20261101/restore_review_sheet_state.py --baseline-directory audit_tools/quiz_easy_completion_20261101/baseline
python audit_tools/easy_pool_review_20261101/verify_exports.py --report-directory audit_tools/quiz_easy_completion_20261101 --additions audit_tools/saving_identity_easy_20261101/expectations.json --additions audit_tools/quiz_easy_completion_20261101/expectations.json
python audit_tools/easy_pool_review_20261101/verify_excel.py --report-directory audit_tools/quiz_easy_completion_20261101 --baseline-directory audit_tools/quiz_easy_completion_20261101/baseline
```

Excel authoring uses the bundled `@oai/artifact-tool` dependency documented in the
original easy-pool review audit. Its unsupported worksheet-visibility metadata is
restored separately from the fresh backup; cell authoring stays in Artifact Tool.
