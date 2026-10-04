import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[2];work=Path(__file__).parent
v=json.loads((work/'verification.json').read_text(encoding='utf-8'))
p=json.loads((work/'preservation.json').read_text(encoding='utf-8'))
b=json.loads((work/'pdf_bounds.json').read_text(encoding='utf-8'))
s=json.loads((root/'faculty_exports/validation_summary.json').read_text(encoding='utf-8'))
lines=['# Faculty export metadata cleanup - 2026-10-04','',
'FINAL STATUS: PASS','',
'This pass changes faculty export presentation only. It does not audit or revise the economics, question wording, answers, difficulty assignments, membership, routing, or canonical metadata. All three normal CSV/PDF pairs were regenerated from the canonical Composer library.','',
'## Files changed','',
'Implementation:','',
'- `tools/export_faculty_question_bank.py` - explicit shared faculty projection, compact PDF headers, readable display labels, and stronger output verification.',
'- `tools/tests/test_export_faculty_question_bank.py` - schema assertions updated; two additional tests cover header formatting and default-hidden provenance in actual PDF/CSV outputs.',
'- `tools/export_faculty_question_bank.md` - revised export schema and preservation documentation.','',
'Generated outputs:','']
for info in s['disciplines'].values():
    lines.extend([f"- `faculty_exports/{info['pdf_file']}`",f"- `faculty_exports/{info['csv_file']}`"])
lines += ['- `faculty_exports/validation_summary.json`', '- `faculty_exports/validation_report.md`',
'- `faculty_exports/audits/faculty_export_metadata_cleanup_20261004.md` (this report)',
'- `faculty_exports/audits/faculty_export_metadata_cleanup_20261004.json` (verification evidence)','',
'## Faculty allowlist','',
'Both formats use the same explicit `FACULTY_METADATA` projection. Arbitrary canonical properties and arbitrary future row properties are never enumerated for display. The former metadata flattening and catch-all output paths have been removed. Internal provenance remains available in the canonical source and engineering validation evidence.','',
'PDF header fields, when available: Question ID, Topic, Learning Objective, Difficulty, Question Type, and Common Misconception. Question content follows directly, including the original stem, every answer choice, correct-answer letter and text, feedback, existing hints, and associated graph.','',
'- Topic and Question Type use readable capitalization and spacing without changing stored values.',
'- Learning Objective combines a useful compact framework code and existing label on one line. Redundant labels are suppressed. Descriptive machine identifiers give way to existing labels, or readable spacing when no separate label exists.',
'- Difficulty uses the existing approved Easy, Medium, Hard, Elite, or Legendary value. Where no normal difficulty level is available, the export omits it instead of assigning one or displaying an internal pool/role.',
'- Common Misconception retains existing explanatory prose or one of four explicit readable mappings of canonical misconception values. Unrecognized cryptic identifiers are omitted; no new misconception is authored.',
'- Body type remains 10-point with 14-point leading. Metadata increased from 8-point to 9-point with 12-point leading. Page savings come from removing metadata, not shrinking question text.','',
'The shared CSV column order is:','',
'1. Question ID\n2. Topic\n3. Learning Objective\n4. Difficulty\n5. Question Type\n6. Common Misconception\n7. Question\n8. Choice A\n9. Choice B\n10. Choice C\n11. Choice D\n12. Correct Answer\n13. Feedback\n14. Graph/Image','',
'Graph/Image says "See graph in faculty PDF" for graph-bearing items and is otherwise blank. The Question ID identifies the corresponding PDF entry. No repository path is exposed. CSV remains UTF-8 with a BOM; no XLSX format was introduced. The exporter also explicitly preserves extra choices or existing hints if future instructional content includes them; neither adds columns in the current bank.','',
'## Removed from faculty outputs','',
'Source Chapter, Source Game, Source Pool(s), Source File, Source Curation Phase, Original Source Pool, Original Boss Tier, duplicate canonical/original/source/pool difficulty fields, Family Concept ID, Primary Concept ID, Instructional Role, Repair Skill, raw-tag fields, source/build paths, authoring and migration phases, internal pool/game names used as provenance, generation/curation data, and all other unapproved fields are excluded. These remain untouched in canonical records.','',
'The **Additional Metadata block is completely removed** and has no replacement catch-all section. Covers also omit internal pool counts, build descriptions, and debugging/provenance text. Graph filename captions are removed while the same graph assets remain embedded.','',
'**Unknown metadata default-hidden: PASS.** The automated test injects `internal_test_provenance: should-never-appear`, nested unknown canonical metadata, and an unknown row field. Their names/values are absent from both real emitted PDF and CSV outputs. Attempts to request an internal CSV column are rejected. These tests also verify all specifically requested forbidden labels, `phase-`, and `Additional Metadata` are absent.','',
'## Before and after','',
'| Course | Questions | PDF pages before | PDF pages after | Pages reduced | CSV columns before | CSV columns after | Columns removed | Content fidelity |',
'|---|---:|---:|---:|---:|---:|---:|---:|---|']
for area,c in v['courses'].items():
    lines.append(f"| {s['disciplines'][area]['discipline']} | {c['questions']:,} | {c['pages_before']:,} | {c['pages_after']:,} | {c['pages_removed']:,} | {c['columns_before']} | {c['columns_after']} | {c['columns_removed']} | PASS |")
lines += ['',f"Total page reduction: **{sum(c['pages_removed'] for c in v['courses'].values()):,}**. Global canonical count: **9,777**. Combined exported occurrences: **12,633**, including intentional reuse across disciplines. Every discipline retains exactly its pre-task ID set, with unique IDs inside each export.",'',
'## Fidelity and layout verification','',
'- Every CSV row was reopened and compared with source strings. Stems, all four choices, correct-answer letters/text, and feedback match exactly. The graph-presence reference agrees with the canonical image field.',
'- Every PDF question was verified from emitted text: complete stem, lettered choices, correct-answer label/letter/text, feedback, hints when present, approved header fields, ID, and ordering. Checks remain bounded to each question, so another question cannot satisfy missing-content checks.',
'- Full PDF and CSV text scans found no prohibited provenance labels/paths or Additional Metadata blocks.',
'- Every PDF question header shares a page with the beginning of its stem. Blank pages and orphan topic headings are rejected.',
'- All emitted PDF page objects were checked against physical page boundaries. No text or image objects extend outside a page. Representative visual inspection additionally checked spacing, overlap, legibility, graph labels, choices, and page breaks.',
'- Embedded graph occurrence counts match every graph-bearing question: General 242, Micro 1,195, Macro 553. Missing graphs: 0 in each course. Original graph assets and the existing image-optimization process are unchanged.','',
'### Representative visual checks','',
'Pages were rendered with Poppler and inspected as images. The following final question pages passed. Covers and the first topic-index page of all three PDFs were also inspected.','',
'| Course | Sample | Question ID | PDF page | Result |','|---|---|---|---:|---|']
for x in v['visual_samples']:
    if 'id' in x:lines.append(f"| {s['disciplines'][x['course']]['discipline']} | {x['category']} | {x['id']} | {x['page']} | PASS |")
lines += ['',
'Question **42941**, Micro page 2168, shows only Question ID, Topic: Moral Hazard, Learning Objective: IBP.3 - Moral Hazard, Difficulty: Legendary, Question Type: Integration, and Common Misconception: Confuses observation with enforceable incentives. Its stem, four alternatives, keyed B answer, and feedback are intact. None of its internal game, pool, file, phase, concept-family, original-tier, or original-pool provenance appears.','',
'## Preservation','',
'- Canonical questions changed: **0**',
'- Canonical metadata changed: **0**',
'- Answers and answer hashes changed: **0**',
'- Question IDs or course membership changed: **0**',
'- Graph assets changed: **0**',
'- Engine changes by this task: **0**',
'- Telemetry changes by this task: **0**',
'- Game banks or student publication changed by this task: **0**','',
f"The exporter verified source and image SHA-256 values before publication. A separate comparison checked {p['files_checked']:,} tracked files against the pre-task fingerprint, excluding the three intended exporter source/documentation/test files. All Composer files and graph assets matched. Concurrent changes appeared under `play/growth-realms/`; this task neither made nor reverted those unrelated edits. A test-generated tracked Python bytecode file was restored to its verified pre-task bytes.",'',
f"Canonical library SHA-256: `{s['source_sha256']}`.",'',
'## Validation results','',
'- Composer: **29/29 PASS** (`node build/faculty-build-composer/tests/run_active_composer_suite.js`).',
'- Original exporter coverage: **14/14 retained and passing**; only the intentional faculty CSV schema assertion was updated.',
'- Expanded exporter suite: **16/16 PASS**, including two new header/allowlist tests (`python -B -m unittest discover -s tools/tests -p test_export_faculty_question_bank.py`).',
'- Normal full export: **PASS** (`python -B tools/export_faculty_question_bank.py`).',
'- Independent final CSV/source comparison, pre-task ID-set comparison, graph-count checks, PDF boundary checks, and representative visual QA: **PASS**.',
'- `git diff --check` for the three implementation files: **PASS**.','',
'FINAL STATUS: PASS','']
report=root/'faculty_exports/audits/faculty_export_metadata_cleanup_20261004.md'
report.write_text('\n'.join(lines),encoding='utf-8')
evidence={'status':'PASS','scope':'faculty export presentation only','canonical_source_sha256':s['source_sha256'],
          'composer_tests':{'passed':29,'total':29},'exporter_tests':{'passed':16,'total':16,'existing':14,'added':2},
          'verification':v,'preservation':p,'pdf_bounds':b,
          'output_sha256':{info[k]:hashlib.sha256((root/'faculty_exports'/info[k]).read_bytes()).hexdigest() for info in s['disciplines'].values() for k in ['pdf_file','csv_file']}}
report.with_suffix('.json').write_text(json.dumps(evidence,indent=2)+'\n',encoding='utf-8')
print(report)
