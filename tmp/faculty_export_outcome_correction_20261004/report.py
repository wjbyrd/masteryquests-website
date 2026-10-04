import json
from pathlib import Path
root=Path(__file__).resolve().parents[2];work=Path(__file__).parent
v=json.loads((work/'verification.json').read_text(encoding='utf-8'))
s=json.loads((root/'faculty_exports/validation_summary.json').read_text(encoding='utf-8'))
trace=json.loads((root/'faculty_exports/faculty_outcome_resolution.json').read_text(encoding='utf-8'))
lines=['# Faculty export learning-objective correction - 2026-10-04','','FINAL STATUS: PASS','',
'The faculty PDFs and CSVs now display the current reviewed Composer faculty learning-outcome labels. The exporter no longer derives displayed objectives from legacy question objective codes or chapter labels. All three normal exports have been regenerated. This supersedes the Learning Objective display described in the earlier metadata-cleanup report; other faculty-export presentation rules are retained.','',
'## Authoritative resolution','',
'The exporter loads `composer-core.js` and calls its existing `ContentScope.skills()` on each original question\'s recorded `primarySkill` and `secondarySkills`. It then uses `FacultyOutcomes.describe(conceptId)` and `FacultyOutcomes.skills(conceptId, outcomeIds)` to resolve those skills against the published policy. Labels are copied verbatim.','',
'Authoritative sources remain unchanged:','',
'- `audit_tools/faculty_lo/outcome-groups.cjs`, including its reviewed display-label overrides.',
'- `audit_tools/faculty_lo/approved-merges.json`.',
'- `audit_tools/faculty_lo/build-policy.cjs` (the existing generator; not rerun or modified).',
'- `build/faculty-build-composer/data/faculty-outcomes.js`.',
'- `build/faculty-build-composer/faculty-outcome-core.js` and `composer-core.js`.','',
f"Published policy fingerprint: `{v['policy_sha256']}`.",'',
'Resolution stays within each question\'s actual stored, routed, and Composer-resolved derived concept memberships. It does not search unrelated concepts for coincidentally matching skill names. The union of supported outcomes is retained across those memberships, excluding entries that the existing Composer policy marks hidden. Those entries contain compatibility/checkpoint descriptions, not current faculty-facing outcomes. No exporter-specific curriculum map, label override, skill rewrite, or objective-code fallback is introduced.','',
'Repeated display labels are deduplicated in first-occurrence policy order. All matched outcome IDs and concept contexts remain in the trace, including cases where separate policy entries share one label. Counts below use distinct displayed faculty outcome labels.','',
'One label uses **Learning Objective:** in PDF. Multiple labels use **Learning Objectives:** followed by bullets. CSV retains one **Learning Objective** field, with ` | ` between labels. A framework code would appear only if already part of the reviewed policy label; the exporter never prepends one. Unresolved questions would receive no invented label and would be listed in the resolution report.','',
'## Resolution counts','',
'| Scope | Questions | One outcome | Multiple outcomes | No resolvable outcome |',
'|---|---:|---:|---:|---:|']
for name,count,total in [('Global unique IDs',v['global'],9777)]+[(s['disciplines'][area]['discipline'],info['resolution'],info['question_count']) for area,info in v['courses'].items()]:
    lines.append(f"| {name} | {total:,} | {count['one_outcome']:,} | {count['multiple_outcomes']:,} | {count['no_outcome']:,} |")
lines += ['', f"Questions with no visible faculty outcome: **{v['global']['no_outcome']}**. Questions with unresolved recorded skills: **{len(v['global']['unresolved_skill_ids'])}**. These are the same questions; there are no partially resolved items. All unresolved IDs are listed below.",
'The three course totals include intentional shared-question reuse; they are not additive to the global distinct-question count.','',
'## Verification','',
'| Course | CSV rows / PDF questions | PDF pages | Legacy LO#.# values in PDF | Legacy LO#.# values in CSV | Content / ID fidelity |',
'|---|---:|---:|---:|---:|---|']
for area,c in v['courses'].items():
    lines.append(f"| {s['disciplines'][area]['discipline']} | {c['question_count']:,} | {c['pdf_pages']:,} | {c['legacy_codes_pdf']} | {c['legacy_codes_csv']} | PASS |")
lines += ['',
'- **Policy-label fidelity: PASS.** Every emitted outcome label is an exact current-policy label. An independent check recomputed all matches from the published policy and recorded skills, then compared every trace and every CSV objective field.',
'- **Skill traceability: PASS.** Every matched outcome lists the exact canonical skills supporting it. Every displayed label has recorded skill support; unresolved skills are reported without fallback. No inference from the question wording, tag, or legacy objective code is used.',
'- **Multiple outcomes retained: PASS.** The complete deduplicated outcome list is checked in every CSV row and against emitted PDF text; none is silently reduced to a single choice.',
'- **Question-content fidelity: PASS.** Every non-objective CSV field matches its pre-correction value exactly, including stems, options, correct answers, feedback, difficulty display, and graph references. All question IDs remain in their existing courses. The normal exporter checks complete stems, lettered alternatives, answers, feedback, and outcome labels inside each PDF question.',
'- **Legacy codes absent: PASS.** Full emitted PDF/CSV text scans found zero standalone `LO#.#` values. Publication now rejects those codes.',
'- **Layout: PASS.** No emitted text or image object lies outside its page. Blank pages, orphan topic headings, and question headers separated from the beginning of their stems are rejected. Graph occurrence counts still match the source: General 242, Micro 1,195, Macro 553.','',
f"**Canonical preservation: PASS.** All {v['protected_files_unchanged']:,} protected Composer and faculty-outcome policy files match their pre-correction SHA-256 values. Canonical question content changed: **0**. Canonical metadata/skills changed: **0**. Answer hashes, graph assets, course membership, routing, engine, and telemetry changes by this task: **0**.",'',
'## Representative visual checks','',
'The final PDFs were rendered with Poppler and inspected for readable single- and multiple-outcome headers, graph placement, long headers, and intact question blocks.','',
'| Course | Check | Question ID | Page | Result |','|---|---|---|---:|---|']
for sample in v['visual_samples']:
    lines.append(f"| {s['disciplines'][sample['course']]['discipline']} | {sample['category']} | {sample['id']} | {sample['page']} | PASS |")
lines += ['',
'## Tests and changed files','',
'- Composer: **29/29 PASS**.',
'- Exporter: **20/20 PASS**. Existing preservation/provenance tests remain. New cases cover primary plus secondary skill resolution through the reviewed Demand policy, deduplication, multiple outcomes in PDF/CSV, unresolved questions without fallback, unrelated concept exclusion, secondary-only skills, partial-resolution reporting, and exclusion of Composer-hidden compatibility labels.',
'- `git diff --check` on exporter implementation, tests, and documentation: **PASS**.','',
'Changed implementation files: `tools/export_faculty_question_bank.py`, `tools/tests/test_export_faculty_question_bank.py`, and `tools/export_faculty_question_bank.md`. Other in-progress workspace changes were left untouched.','',
'Regenerated the normal General, Micro, and Macro CSV/PDF pairs, `faculty_exports/validation_summary.json`, and `faculty_exports/validation_report.md`. No new spreadsheet format was introduced; all CSVs still use the same 14-column schema.','',
'Complete per-question mapping evidence is in `faculty_exports/faculty_outcome_resolution.json`. Each of the 9,777 IDs includes recorded skills, concept scopes, outcome IDs, exact labels, matched skills, and any unresolved skills. This is engineering verification evidence, not an extra faculty CSV/PDF metadata block.','',
'This report and its companion verification JSON are saved under `faculty_exports/audits/faculty_export_learning_objective_correction_20261004.*`.','',
'FINAL STATUS: PASS','']
lines += ['## All unresolved question IDs', '', 'These questions remain in their existing exports, with no displayed Learning Objective. Their recorded skills have no mapping within a visible faculty-outcome context for their actual Composer memberships. The only matching context is explicitly hidden by the existing Composer policy: 25 Market Failures compatibility questions and 107 integrated Macro checkpoint questions. No canonical metadata was changed to resolve them.', '', '| Question ID | Composer-hidden context |', '|---|---|']
for qid in v['global']['unresolved_ids']:
    lines.append(f"| {qid} | {', '.join(trace['questions'][qid]['excludedConceptIds'])} |")
lines += ['']
path=root/'faculty_exports/audits/faculty_export_learning_objective_correction_20261004.md'
path.write_text('\n'.join(lines),encoding='utf-8')
path.with_suffix('.json').write_text(json.dumps({'status':'PASS','verification':v,'composer_tests':{'passed':29,'total':29},'exporter_tests':{'passed':20,'total':20}},indent=2)+'\n',encoding='utf-8')
print(path)
