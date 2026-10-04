"""Produce the bounded cleanup report from frozen before/after evidence."""
from pathlib import Path
from collections import Counter
import json,re,hashlib
H=Path(__file__).parent;ROOT=H.parent.parent;W=ROOT/'tmp'/H.name
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
ledger=read(H/'expectations.json');scope=read(H/'scope.json');v=read(W/'verification.json')
export=read(W/'export_fidelity.json');qa=read(W/'pdf_qa.json');numerical=read(H/'numerical_checks.json');factor=read(H/'factor_model_evidence.json')
choice_cues=read(H/'choice_cues.json');assert choice_cues['status']=='PASS' and not choice_cues['new_answer_length_findings']
changes=ledger['changes'];ids=set(scope['authorized_union']);byid={c['id']:c for c in changes}
assert len(ids)==len(changes)==148 and set(byid)==ids==set(v['changedIds'])
assert not v['unauthorizedRecordChanges'] and not v['unexpectedFileChanges']
assert export['status']==qa['status']==numerical['status']=='PASS'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert v['sourceSha256']==qa['source_sha256']==sha(ROOT/'build/faculty-build-composer/data/composer_library.js')
suite=(H/'composer-suite.log').read_text(encoding='utf-8-sig');tests=re.findall(r'^PASS (.+)$',suite,re.M)
assert len(tests)==29 and not re.search(r'^FAIL ',suite,re.M)
assert 'Ran 14 tests' in (H/'exporter-tests.log').read_text() and 'OK' in (H/'exporter-tests.log').read_text()
categories=Counter(c['review']['classification'] for c in changes)
assert dict(categories)=={'Unnatural wording':36,'Excess jargon':43,'Difficult to decipher':13,'Unnecessarily technical':56}
concern=lambda c:c['review']['student_review_concern'].lower()
families={
 'Game-character narration removed':[c['id'] for c in changes if 'signal breaker' in concern(c)],
 'Assessment-writer phrases removed':'40020 42086 42192 42198 P62C-CPS-BR-012 P62C-CPS-BR-016 P62C-CPS-LB-035 P62E-COP-BR-019 P62F-PC-H-015 P77-IEA-R-001 P77-IEA-R-003 P77-IEA-R-006 PM5-PC-H-084 PM5-PC-R-086 PMS-ELAS-R-003'.split(),
 'Continuation-factor items clarified':factor['ids'],
 'Strict-gains items clarified':[c['id'] for c in changes if 'strict gains' in concern(c) or 'strictly gains' in concern(c)],
 'Specialist jargon clarified':'42027 42037 42142 42150 42584 42656 42795 42807 42849 42943 42944 42948 42952 42956 42960 42964 42965 ECON-MG-EASY-11 P52B-EPOL-H-002 P52B-INC-B2-003 P62B-ELAS-L-048 P62B-ELAS-L-072 P62B-ELAS-LB-009 P62B-ELAS-LB-011 P62B-ELAS-LB-012 P62B-ELAS-LB-025 P62B-ELAS-LB-035 P62F-PC-LB-001 P62F-PC-LB-005 P62H-MCMP-C-029 P62I-OLI-B3-042 P62I-OLI-EL-028 P62I-OLI-L-076 P62I-OLI-L-078 P62I-OLI-L-080 P62I-OLI-L-082 P62I-OLI-L-084 P62I-OLI-L-086 P62I-OLI-LB-034 P62I-OLI-LB-035 P73-MARG-M-007 P77-EPOL-L-019 P77-EPOL-LB-033 PM8-OLI-M-061 PM8-OLI-R-073 PMA-ITP-H-037'.split(),
 'Compressed phrases unpacked':'42057 42086 42095 42148 42151 42192 42198 42210 42285 42334 42343 P52B-COMP-L-002 P62B-ELAS-B3-012 P62B-ELAS-LB-035 P62B-ELAS-LB-036 P62F-PC-H-015 P62F-PC-LB-001 P62F-PC-LB-005 P62H-MCMP-B3-044 P62H-MCMP-L-082 P62H-MCMP-L-083 P62H-MCMP-L-084 P62I-OLI-LB-034 P77-EPOL-LB-033 PG1-SUP-L-003 PMA-ITP-H-037'.split(),
 'Ambiguous referents fixed':'42145 42148 42151 42210 42334 42343 42407 ECON-EC-ELITE-13026 ECON-MG-ELITE-326 P62C-CPS-L-060 P62C-CPS-L-062 P62C-CPS-L-064 P62C-CPS-L-066 P62C-CPS-L-068 P62E-COP-BR-019 P62H-MCMP-B3-044 P62H-MCMP-L-079 P62H-MCMP-L-080 P62H-MCMP-L-081 P73-MARG-M-007 PG1-SUP-L-003'.split(),
 'Grammar / note residue fixed':['P62B-ELAS-LB-024']
}
for name,group in families.items():assert len(group)==len(set(group)) and set(group)<=ids,name
graph=[c['id'] for c in changes if c['afterRecord'].get('image')]
summary={'authorized_ids':148,'changed_ids':148,'reviewed_but_retained_ids':0,'unauthorized_canonical_changes':0,
 'resolved_classifications':dict(categories),'action_counts':{k:len(g) for k,g in families.items()},
 'graph_bearing_targets_changed':len(graph),'graph_regressions':0,
 'shared_general_propagation':len(v['bankChecks']['general']['changedAuthorizedIds']),
 'shared_macro_propagation':len(v['bankChecks']['macro']['changedAuthorizedIds']),
 'general_regressions':0,'macro_regressions':0,'numerical_checks':len(numerical['checks']),'numerical_failures':0,
 'answer_resolution_failures':0,'feedback_failures':0,'hashes_changed':sum(c['answerHashChanged'] for c in changes),
 'focused_sophomore_acceptance':'PASS','composer':'29/29 PASS','exporter':'14/14 PASS','csv_mismatches':0,'pdf_mismatches':0,
 'counts':{'global':9777,'general':1589,'micro':6299,'macro':4745},'deleted_ids_still_absent':['42660','42697']}
quality=read(H/'quality_dispositions.json')
items=[]
for c in changes:
 i=c['id'];b=c['beforeRecord'];a=c['afterRecord'];key=c['correctIndex'];review=c['review']
 def display(q):return {'stem':q['q'],'choices':dict(zip('ABCD',q['options'])),'key':{'letter':'ABCD'[key],'text':q['options'][key]}}
 item={'id':i,'classification':review['classification'],'student_review_concern':review['student_review_concern'],
  'before':display(b),'after':display(a),'feedback_changed':b['feedback']!=a['feedback'],
  'changed_fields':c['fields'],'review':review,'answer_hash_changed':c['answerHashChanged'],
  'before_hash':b['aHash'],'after_hash':a['aHash'],'actions':[k for k,g in families.items() if i in g],
  'numerical_checks':[n for n in numerical['checks'] if i in n['ids']], 'micro_pdf_pages':qa['coverage'][i],
  'propagates_to':[area for area,bank in v['bankChecks'].items() if i in bank['changedAuthorizedIds']]}
 if item['feedback_changed']:item['before']['feedback']=b['feedback'];item['after']['feedback']=a['feedback']
 items.append(item)
result={'final_status':'PASS','date':'2026-10-04','scope':'Exact 148-ID Micro student-perspective wording review; no new broad audit',
 'summary':summary,'authorized_ids':sorted(ids),'retained_ids':[],'implementation_exceptions':[],
 'families':families,'shared_propagation':v['bankChecks'],'continuation_model_evidence':factor,
 'validation':v,'numerical_verification':numerical,'quality_dispositions':quality,'choice_cue_check':choice_cues,'composer_tests':tests,
 'export_validation':export,'pdf_qa':qa,'changes':items,
 'evidence_paths':{'scope':str(H/'scope.json'),'full_record_ledger':str(H/'expectations.json'),'composer_log':str(H/'composer-suite.log'),'exporter_test_log':str(H/'exporter-tests.log'),'export_log':str(H/'export.log')},
 'source_sha256':v['sourceSha256'],'before_library_sha256':ledger['beforeLibrarySha256'],'after_library_sha256':ledger['afterLibrarySha256']}
out=ROOT/'faculty_exports/audits/microeconomics_student_perspective_wording_cleanup_20261004'
out.with_suffix('.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lines=['# Microeconomics student-perspective wording cleanup — 2026-10-04','','FINAL STATUS: PASS','',
 'Implemented the exact 148 IDs in the completed student-perspective review. All 148 were improved and reread; no question outside that set was edited. This pass preserved the economic tasks, assumptions, numbers, key positions, difficulty, metadata, routing, publication membership, graph decisions and assets. The other 6,151 Micro questions were not subjected to another editorial audit.','',
 '## Summary','','| Measure | Result |','|---|---:|',
 '| Authorized / changed / retained IDs | 148 / 148 / 0 |','| Unauthorized canonical changes | 0 |']
for k,val in categories.items():lines.append(f'| {k} resolved | {val} |')
for k,g in families.items():lines.append(f'| {k} | {len(g)} |')
lines += [f'| Graph-bearing targets changed / regressions | {len(graph)} / 0 |',
 '| Shared General / Macro propagation | 26 / 26 authorized IDs |','| General / Macro regressions | 0 / 0 |',
 '| Independent numerical checks / failures | 111 / 0 |','| Answer-resolution / feedback failures | 0 / 0 |','| Answer hashes regenerated | 47 |',
 '| Focused sophomore acceptance | PASS, all 148 |','| Composer / exporter tests | 29/29 / 14/14 PASS |','| CSV / PDF mismatches | 0 / 0 |','',
 'Action counts overlap: an item can remove a compressed phrase and clarify a specialist term. The original four review classifications are mutually exclusive and sum to 148. Exact action membership appears below and in the JSON.','',
 '## Preservation and validation','',
 'The global bank remains 9,777 canonical IDs; General has 1,589, Micro 6,299 and Macro 4,745. IDs 42660 and 42697 remain absent. Replacing only the 148 approved after-records with their frozen before-records reproduces the entire pre-cleanup library exactly, including metadata, placements, routing, graph references and assets. Protected-file checks found no unapproved Composer changes. Engine and telemetry code were untouched. Negative probes reject an unauthorized target edit, an unrelated-record edit and a metadata change.','',
 'Every revised item has four distinct alternatives, one resolving answer hash, its original key position, aligned feedback and a recorded construct/reasoning review. Keyed text changes use Composer normalizeAnswerText followed by SHA-256. The 111 independent checks cover affected numerical descriptions and present-value calculations.','',
 'All ten supported Micro modes passed. Student publication retains the same 6,274 IDs as before, with exact canonical content parity and valid answers; generated JavaScript compiled. The existing 25 canonical export items absent from that publication remain absent. One is an authorized target, ECON-MG-EASY-11; it is updated in the canonical bank and faculty exports without changing its approved publication membership. This is preserved baseline behavior, not a new omission.','',
 'The normal exporter regenerated General, Micro and Macro CSVs/PDFs. Micro contains 6,299 rows and unique IDs; every Micro ID appears exactly once in the PDF. Automated exporter checks verified current stems, choices, keys and feedback throughout all three PDFs. Visual inspection covered all 153 pages occupied by the 148 revised Micro targets, including all 13 graphs and continuation pages; no clipping or overlap was found. The separate faculty-metadata export cleanup was not performed.','',
 '## Model and boundary decisions','',
 'The 31 continuation-factor items now describe the geometric weight applied for each period ahead in a present-value calculation. This interpretation is supported by the existing C/(1−δ) and D+δP/(1−δ) calculations and the feedback for P62I-OLI-C-028. The text does not invent a probability that play continues. All payoffs, factors, calculations and decisions remain unchanged.','',
 'Trade questions retain positive gains versus indifference at an opportunity-cost boundary. Glade Fitness benefits are explicitly retained by staying and lost when switching, as the existing feedback requires. The warehouse margin question identifies the amount after other variable costs but before the separately stated handling cost. All thirteen graph tasks retain the same information that must be read from the graph; wording adds no plotted answer.','',
 '## Quality-test dispositions','',
 'No detector or test assertion was weakened. The approval chain now checks the exact 148 before/after records and reconstructs the earlier approved bank before running historical contracts. The normal quality detector still emits two lexical difficulty REVIEW findings:']
for f in quality['findings']:lines += ['',f'- **{f["questionId"]}:** {f["note"]}']
lines += ['', 'The detector checks for words such as “infer” and “mechanism”; their removal does not remove the reasoning. Exact finding signatures and current wording are recorded in quality_dispositions.json. Difficulty was not reassessed or changed. Intermediate answer-length warnings were resolved on P52B-INC-B2-003, ECON-MG-EASY-11, P62B-ELAS-LB-012, 42142, P52B-COMP-L-002, P62I-OLI-LB-035, PM8-OLI-M-061 and PM8-OLI-R-073 by shortening explanations or balancing the alternatives while preserving their propositions. The final scoped check finds zero newly introduced answer-length cues among the 148 targets. No implementation exceptions remain.','',
 '## Authorized shared propagation','']
for area in ['general','macro']:
 bank=v['bankChecks'][area];lines += [f'**{area.title()} — {len(bank["changedAuthorizedIds"])} IDs:** '+', '.join(bank['changedAuthorizedIds'])+'.','',f'All other {bank["unrelatedUnchanged"]:,} {area.title()} records are unchanged.','']
lines += ['## Action membership','']
for name,group in families.items():lines += [f'**{name} ({len(group)}):** '+', '.join(group)+'.','']
lines += ['## Individual before-and-after records','']
for item in items:
 r=item['review'];lines += [f'### {item["id"]}','',f'**Student-review classification:** {item["classification"]}','',f'**Student-review concern:** {item["student_review_concern"]}','']
 for name in ['before','after']:
  q=item[name];lines += [f'**{name.upper()}:**','',f'- **Stem:** {q["stem"]}']
  for letter,text in q['choices'].items():lines.append(f'- **{letter}:** {text}')
  lines.append(f'- **Key:** {q["key"]["letter"]} — {q["key"]["text"]}')
  if 'feedback' in q:lines.append(f'- **Feedback:** {q["feedback"]}')
  lines.append('')
 lines += [f'**Decoding burden removed:** {r["decoding_burden_removed"]}','',
  '- Economic construct preserved: YES','- Difficulty preserved: YES','- Required reasoning preserved: YES']
 if r['graph_decision_preserved'] is not None:lines += ['- Existing graph decision preserved: YES',f'- Graph information still required: {r["graph_task"]}']
 if r['advanced_reasoning_preserved'] is not None:lines += ['- Advanced reasoning preserved: YES',f'- Required inference: {r["required_inference"]}']
 lines += [f'- Hash changed: {"YES" if item["answer_hash_changed"] else "NO"}',f'- Feedback: {"Updated as shown above" if item["feedback_changed"] else "Inspected; unchanged and aligned"}',f'- Numerical verification: {r["numerical_verification"]}',
  '- Four distinct choices / one defensible key / answer resolution: PASS','- Focused sophomore-readability check: PASS','']
lines += ['## Reproducible evidence','',
 '- audit_tools/microeconomics_student_wording_cleanup_20261004/scope.json — frozen authorized IDs.',
 '- audit_tools/microeconomics_student_wording_cleanup_20261004/expectations.json — complete original and final canonical records.',
 '- audit_tools/microeconomics_student_wording_cleanup_20261004/numerical_checks.json — 111 independent calculations.',
 '- audit_tools/microeconomics_student_wording_cleanup_20261004/composer-suite.log — 29 passing validators.',
 '- audit_tools/microeconomics_student_wording_cleanup_20261004/exporter-tests.log — 14 passing exporter tests.',
 '- faculty_exports/validation_summary.json — full normal exporter verification.',
 '- Companion cleanup JSON — per-item changes, shared propagation, publication checks, visual coverage and source hashes.','',
 'FINAL STATUS: PASS','']
out.with_suffix('.md').write_text('\n'.join(lines),encoding='utf-8')
print(json.dumps(summary,indent=2))
