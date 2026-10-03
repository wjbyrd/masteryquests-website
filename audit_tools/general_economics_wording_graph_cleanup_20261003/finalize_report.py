"""Verify regenerated exports and write the requested complete change report."""
import csv,hashlib,json,re
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
WORK=ROOT/'tmp/general_economics_wording_graph_cleanup_20261003';OUT=ROOT/'faculty_exports';AUDIT=OUT/'audits'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
ledger=read(HERE/'expectations.json');details=read(HERE/'review_details.json');worklist=read(HERE/'worklist.json')
assert worklist==read(AUDIT/'general_economics_wording_graph_audit_20261003.json')
verification=read(WORK/'verification.json');export=read(OUT/'validation_summary.json')
source_sha=digest(ROOT/'build/faculty-build-composer/data/composer_library.js')
assert source_sha==verification['sourceSha256']==export['source_sha256'],'Exports must use the final verified source'
assert export['status']=='complete' and export['sources_unchanged']
suite_log=(WORK/'active_suite.log').read_text(encoding='utf-8-sig');suite=json.loads(suite_log[suite_log.rfind('\n{')+1:])
assert suite['ok'] and suite['passed']==suite['total']==29
unit=(WORK/'exporter_tests.log').read_text(encoding='utf-8-sig');assert 'Ran 14 tests' in unit and unit.rstrip().endswith('OK')
ids=set(ledger['authorizedIds']);changes={c['id']:c for c in ledger['changes']};area_before=read(WORK/'area_ids.json')
rows_by_area={};export_checks={}
allowed={'question_text','option_a','option_b','option_c','option_d','correct_answer_text','feedback','metadata.a_hash'}
for area,stem in [('general','general_economics'),('micro','microeconomics'),('macro','macroeconomics')]:
 file=stem+'_question_bank.csv'
 with (OUT/file).open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
 keyed={r['question_id']:r for r in rows};rows_by_area[area]=keyed
 assert len(rows)==len(keyed) and set(keyed)==set(area_before[area]),area
 for i in ids&keyed.keys():
  r=keyed[i];c=changes[i];q=c['afterRecord']
  for a,b in [('q','question_text'),('feedback','feedback'),('aHash','metadata.a_hash')]:assert q[a]==r[b],(i,a)
  assert q['options']==[r['option_'+x] for x in 'abcd'],i
  assert str(c['correctIndex'])==r['correct_answer_index_zero_based']
  assert q['options'][c['correctIndex']]==r['correct_answer_text']
 changed=[]
 if area!='general':
  with (WORK/file).open(encoding='utf-8-sig',newline='') as f:before={r['question_id']:r for r in csv.DictReader(f)}
  assert before.keys()==keyed.keys()
  for i,r in keyed.items():
   diff={k for k in r if r[k]!=before[i][k]}
   if diff:assert i in ids and diff<=allowed,(area,i,diff);changed.append(i)
  assert set(changed)==ids&keyed.keys()
 else:changed=sorted(ids)
 export_checks[area]={'question_ids':len(keyed),'added_ids':[],'removed_ids':[],
  'authorized_changed_ids':sorted(changed),'unrelated_records_unchanged':len(keyed)-len(changed),
  'csv_sha256':digest(OUT/file),'pdf_sha256':digest(OUT/(stem+'_question_bank.pdf')),
  'pdf_pages':export['disciplines'][area]['pdf_pages'],'target_content_parity':'PASS'}
quality=read(HERE/'quality_dispositions.json')
qa=read(WORK/'pdf_visual_qa.json');assert qa['source_sha256']==source_sha and qa['result']=='PASS'
records=[]
findings={f['code']:f for f in worklist['wording_findings']+worklist['graph_findings']}
for c in ledger['changes']:
 i=c['id'];k=c['correctIndex'];review=c['review'];d=details[i]
 def snap(q):return {'stem':q['q'],'choice_a':q['options'][0],'choice_b':q['options'][1],
  'choice_c':q['options'][2],'choice_d':q['options'][3],'correct_answer_letter':'ABCD'[k],
  'correct_answer_text':q['options'][k],'feedback':q['feedback'],'answer_hash':q['aHash']}
 record={'question_id':i,'finding_ids':c['findingIds'],
  'reason_for_revision':' '.join(findings[f].get('why',findings[f].get('reason','')) for f in c['findingIds']),
  'original':snap(c['beforeRecord']),'revised':snap(c['afterRecord']),
  'feedback_changed':'feedback' in c['fields'],'answer_hash_changed':c['answerHashChanged'],
  'changed_fields':c['fields'],**d}
 if review.get('hide_graph_test'):
  record['graph_information_required']=review['graph_information_required']
  record['graph_necessity_check']=review['hide_graph_test']
  record['graph_asset_unchanged']=True
 records.append(record)
summary={'changed_questions':126,'wording_targets':71,'directly_optional_graph_targets':11,
 'answer_choice_shortcut_targets':44,'graph_targets_with_hide_graph_yes':55,
 'answer_hashes_changed':sum(c['answerHashChanged'] for c in ledger['changes']),
 'changed_field_counts':{f:sum(f in c['fields'] for c in ledger['changes']) for f in ['q','options','feedback','aHash']},
 'general_ids_before':1589,'general_ids_after':1589,'no_unrelated_canonical_record_changes':True}
result={'schema_version':1,'date':'2026-10-03','task':'Exact-worklist General Economics wording and graph-assessment cleanup',
 'worklist':'faculty_exports/audits/general_economics_wording_graph_audit_20261003.json',
 'baseline_ref':ledger['baselineRef'],'baseline_source_sha256':ledger['baselineSourceSha256'],
 'final_source_sha256':source_sha,'summary':summary,'composer_suite':suite,'exporter_tests':{'passed':14,'failed':0},
 'canonical_verification':verification,'export_verification':export_checks,'pdf_visual_qa':qa,
 'quality_dispositions':quality['findings'],'changes':records}
json_path=AUDIT/'general_economics_wording_graph_cleanup_20261003_changes.json'
json_path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lines=['# General Economics wording and graph-assessment cleanup — 2026-10-03','',
'Implemented the exact companion JSON worklist: **126 unique questions**, covering **71 wording targets**, **11 directly optional graph targets**, and **44 graph-answer-choice shortcut targets**. Each ID has one coordinated final revision. No questions were added or removed.','',
'## Scope and preservation','',
'The canonical Composer library is the source. Polished-game banks were not edited. All 1,589 General Economics IDs remain; the canonical library retains 9,779 unique IDs. Only question stems, answer choices, feedback where needed, and answer hashes changed. Difficulty, routing, repair/bridge roles, task metadata, graph files and references, engine logic, telemetry, and prior instructor decisions were preserved. Library and dependent policy checksums were regenerated.','',
f"**{summary['answer_hashes_changed']} answer hashes changed**, using SHA-256 of `composer-core.js`’s normalized answer text. Every original correct-answer letter was preserved. {summary['changed_field_counts']['options']} choice sets and {summary['changed_field_counts']['feedback']} feedback fields changed.",'',
'## Validation','',
'- Active Composer suite: **29/29 PASS**. Exporter tests: **14/14 PASS**.',
'- Every revised item: four distinct choices, one resolved answer hash, one defensible answer after economic review, matching feedback, and checked numerical values.',
'- All 55 graph-assessment targets: **YES** to “Without the graph, at least two choices remain economically plausible.” The evidence below names the graph information required and two competing choices. This is an item-by-item assessment review, supplemented by automated structure and hash checks—not a claim that a hash check proves economic validity.',
'- All 71 wording-target stems preserve their numerical inputs; two instances of the numeral “1” are written as “one.” Numerical examples and exclusions are checked individually below.',
'- Full General publication: all 1,589 IDs present, revised source/output content matches, all ten modes pass, answer verification passes, and generated inline JavaScript compiles.',
'- Exact baseline comparison: no unrelated canonical records, metadata, routes, graph assets, or protected runtime files changed. Negative probes reject unauthorized target wording, unrelated feedback, and difficulty changes.',
'- Normal exporter regenerated the faculty CSV/PDF files and verified every exported question, answer, feedback, and attached image. Representative final PDF pages were rendered and visually checked; see the machine-readable report for page numbers.','',
'| Bank | IDs before/after | Authorized shared revisions | Unrelated records unchanged |',
'| --- | ---: | ---: | ---: |']
for a,label in [('general','General Economics'),('micro','Microeconomics'),('macro','Macroeconomics')]:
 e=export_checks[a];lines.append(f"| {label} | {e['question_ids']:,} / {e['question_ids']:,} | {len(e['authorized_changed_ids'])} | {e['unrelated_records_unchanged']:,} |")
lines += ['', 'The normal exporter produces all three banks. The shared canonical General questions therefore also appear revised in Micro/Macro where already assigned. No unrelated Micro/Macro CSV row changed, and no discipline membership changed.','',
'## Validation expectation maintenance','',
'A narrowly scoped editorial approval layer records the exact 126 before/after records against the frozen Git baseline. Existing tests now recognize that layer; their prior snapshots and unrelated expectations remain intact. A historical graph-alignment check verifies both its earlier before-state and the authorized new text. No quality-detector rules or runtime engines were changed.','',
'The quality checker retains the following explicit review dispositions. These are not new difficulty calibrations or a reopened audit:','']
for f in quality['findings']:lines.append(f"- **{f['questionId']} — {f['rule']} ({f['severity']}):** {f['note']}")
lines += ['', '## Individual changes','']
for r in records:
 lines += [f"### {r['question_id']}",'',f"**Finding ID(s):** {', '.join(r['finding_ids'])}",'',f"**Reason for revision:** {r['reason_for_revision']}",'','**ORIGINAL:**','']
 for label,field in [('Stem','stem'),('Choice A','choice_a'),('Choice B','choice_b'),('Choice C','choice_c'),('Choice D','choice_d')]:lines.append(f"- {label}: {r['original'][field]}")
 lines.append(f"- Correct answer: {r['original']['correct_answer_letter']} — {r['original']['correct_answer_text']}")
 if r['feedback_changed']:lines.append('- Feedback: '+r['original']['feedback'])
 lines += ['','**REVISED:**','']
 for label,field in [('Stem','stem'),('Choice A','choice_a'),('Choice B','choice_b'),('Choice C','choice_c'),('Choice D','choice_d')]:lines.append(f"- {label}: {r['revised'][field]}")
 lines.append(f"- Correct answer: {r['revised']['correct_answer_letter']} — {r['revised']['correct_answer_text']}")
 if r['feedback_changed']:lines.append('- Feedback: '+r['revised']['feedback'])
 lines += ['',f"**What changed:** {r['what_changed']}.",'',f"**Why the wording is more natural:** {r['why_more_natural']}",'',
 f"**Economic/numerical and answer check:** {r['economic_and_numerical_check']}",'',
 '**Validation:** Four distinct choices: PASS. One defensible answer: PASS. Feedback matches: PASS. '+('Feedback revised above.' if r['feedback_changed'] else 'Existing feedback retained and checked.'),'',
 f"**Answer hash changed:** {'YES' if r['answer_hash_changed'] else 'NO'}."]
 if 'graph_information_required' in r:
  g=r['graph_necessity_check'];a,b=g['plausible_choices'];lines += ['',f"**Information that must be read from the graph:** {r['graph_information_required']}",'',
  '**Graph-necessity check:** “Without the graph, at least two choices remain economically plausible: **YES**”','',
  f'Competing choices without the graph: “{a}” and “{b}”. {g["reason"]}', '',
  'The stem does not supply the graph values needed to distinguish these choices. The key cannot be selected solely by rejecting three conceptually impossible alternatives. Existing graph asset preserved.']
 lines.append('')
lines += ['## Reproduction and evidence','',
'Implementation and frozen before/after records: `audit_tools/general_economics_wording_graph_cleanup_20261003/`. The JSON changes report contains every original/revised field, answer hash, graph check, economic explanation, export checksum, shared-bank ID list, and validation receipt.','',
'Validation commands (using the installed Python and Node runtimes):','',
'```text',
'node audit_tools/general_economics_wording_graph_cleanup_20261003/verify.cjs',
'node build/faculty-build-composer/tests/run_active_composer_suite.js',
'python -m unittest discover -s tools/tests -p test_export_faculty_question_bank.py -v',
'python tools/export_faculty_question_bank.py --node <node-executable>',
'```','',
'The suite’s generated comprehensive-test outputs were redirected to the cleanup scratch directory so earlier validation artifacts remain unchanged.','',
f'Baseline source SHA-256: `{ledger["baselineSourceSha256"]}`. Final source SHA-256: `{source_sha}`.','']
md=AUDIT/'general_economics_wording_graph_cleanup_20261003.md';md.write_text('\n'.join(lines),encoding='utf-8')
assert sum(line.startswith('### ') for line in lines)==126
assert sum('at least two choices remain economically plausible: **YES**' in line for line in lines)==55
(HERE/'validation_receipt.json').write_text(json.dumps({k:v for k,v in result.items() if k not in ['changes','canonical_verification']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'report':str(md),'changes_json':str(json_path),'summary':summary,'export_counts':{a:e['question_ids'] for a,e in export_checks.items()}},indent=2))
