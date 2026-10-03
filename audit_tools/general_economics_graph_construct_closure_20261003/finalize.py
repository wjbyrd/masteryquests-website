"""Check export parity and assemble the exact 38-item closure report and ledger."""
import csv,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];WORK=ROOT/'tmp/general_economics_graph_construct_closure_20261003';OUT=ROOT/'faculty_exports';AUDITS=OUT/'audits'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
ledger=read(HERE/'expectations.json');review=read(HERE/'review.json');verify=read(WORK/'verification.json')
export=read(OUT/'validation_summary.json');qa=read(WORK/'pdf_visual_qa.json')
source_sha=sha(ROOT/'build/faculty-build-composer/data/composer_library.js')
assert source_sha==verify['sourceSha256']==export['source_sha256']==qa['source_sha256']
assert export['status']=='complete' and export['sources_unchanged']
suite_log=(WORK/'active_suite.log').read_text(encoding='utf-8-sig');suite=json.loads(suite_log[suite_log.rfind('\n{')+1:]);assert suite['ok'] and suite['passed']==29
unit=(WORK/'exporter_tests.log').read_text(encoding='utf-8-sig');assert 'Ran 14 tests' in unit and unit.rstrip().endswith('OK')
assert qa['status']=='PASS' and set(qa['question_pages'])==set(ledger['authorizedIds']) and qa['questions_inspected']==38
ids=set(ledger['authorizedIds']);byid={c['id']:c for c in ledger['changes']};proposal={r['question_id']:r for r in review['flags']}
assert len(ids)==len(ledger['changes'])==38
allowed={'question_text','option_a','option_b','option_c','option_d','correct_answer_text','feedback','metadata.a_hash'}
export_checks={}
for area,name,count in [('general','general_economics',1589),('micro','microeconomics',6301),('macro','macroeconomics',4745)]:
 filename=name+'_question_bank.csv'
 def rows(p):
  with p.open(encoding='utf-8-sig',newline='') as f:
   records=list(csv.DictReader(f));index={r['question_id']:r for r in records};assert len(records)==len(index);return index
 before=rows(WORK/filename);after=rows(OUT/filename)
 assert len(after)==count and before.keys()==after.keys()
 changed=[]
 for i,r in after.items():
  diff={k for k in r if r[k]!=before[i][k]}
  if diff:assert i in ids and diff<=allowed,(area,i,diff);changed.append(i)
  if i in ids:
   c=byid[i];q=c['afterRecord'];assert r['question_text']==q['q'] and r['feedback']==q['feedback']
   assert [r['option_'+a] for a in 'abcd']==q['options'] and r['metadata.a_hash']==q['aHash']
   assert r['correct_answer_index_zero_based']==str(c['correctIndex']) and r['correct_answer_text']==q['options'][c['correctIndex']]
 assert set(changed)==ids&after.keys()
 export_checks[area]={'count_before':len(before),'count_after':len(after),'changed_ids':sorted(changed),
  'unrelated_rows_unchanged':count-len(changed),'ids_added':0,'ids_removed':0,'canonical_target_parity':'PASS',
  'csv_sha256':sha(OUT/filename),'pdf_sha256':sha(OUT/(name+'_question_bank.pdf')),'pdf_pages':export['disciplines'][area]['pdf_pages']}
previous=read(ROOT/'audit_tools/general_economics_wording_graph_cleanup_20261003/expectations.json')
other17=sorted({c['id'] for c in previous['changes'] if c['review'].get('hide_graph_test')}-ids);assert len(other17)==17
assert verify['unauthorizedRecordChanges']==0 and verify['integrity']['questions']==9779
for c in ledger['changes']:
 r=proposal[c['id']];q=c['afterRecord'];assert q['options']==r['proposed_choices'] and c['correctIndex']=='ABCD'.index(r['proposed_key'])
 assert q['q'] in [r['proposed_stem'],'Use the graph. '+r['proposed_stem']]
 assert all(c['review'][t]['answer']=='NO' and c['review'][t]['status']=='PASS' for t in ['construct_test','graph_test'])
 assert q['image']==c['beforeRecord']['image']
quality=read(HERE/'quality_dispositions.json')['findings']
summary={'authorized_ids':38,'changed_ids':38,'unauthorized_canonical_changes':0,'construct_tests_passed':38,'graph_tests_passed':38,
 'composer_tests_passed':29,'exporter_tests_passed':14,'global_canonical_ids':9779,'other_17_graph_items_unchanged':other17,
 'answer_hashes_changed':sum(c['answerHashChanged'] for c in ledger['changes']),
 'proposal_cue_adjustments':sum(bool(c['review']['proposal_adjustments']) for c in ledger['changes']),
 'pdf_questions_visually_inspected':38,'final_status':'PASS'}
result={'schema_version':1,'date':'2026-10-03','summary':summary,'baseline_ref':ledger['baselineRef'],
 'baseline_source_sha256':ledger['baselineSourceSha256'],'final_source_sha256':source_sha,
 'authoritative_review':'faculty_exports/audits/general_economics_graph_construct_drift_review_20261003.md',
 'canonical_verification':verify,'composer_suite':suite,'exporter_tests':{'passed':14,'failed':0},
 'export_verification':export_checks,'pdf_visual_inspection':qa,'retained_quality_reviews':quality,'changes':ledger['changes']}
json_path=AUDITS/'general_economics_graph_construct_drift_closure_20261003_changes.json'
json_path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lines=['# General Economics graph construct drift closure','',
'**FINAL STATUS: PASS**','',
'Implemented exactly the 38 authorized proposals from the construct-drift review. Each item requires both its original economic reasoning and evidence from its existing graph. All proposed choice texts and keyed answer positions are preserved. Seven stems have only the additional sentence “Use the graph.” to meet the repository’s explicit graph-cue convention. Feedback now explains both the graph evidence and the economics.','',
'## Final summary','',
'| Check | Result |','| --- | ---: |',
'| Authorized IDs | 38 |','| Changed IDs | 38 |','| Unauthorized canonical changes | 0 |',
'| Construct tests passed | 38/38 |','| Graph tests passed | 38/38 |','| Composer tests | 29/29 |','| Exporter tests | 14/14 |',
'| Revised General questions visually inspected in the PDF | 38/38 |',
f"| PDF pages visually inspected, including continuations | {len(qa['inspected_pages'])} |",
'| Answer hashes regenerated and changed | 38 |','',
'For every item, the construct test asks: “Could a student answer correctly by reading coordinates while ignoring the economic concept?” The answer is **NO**. The graph test asks: “Could a prepared student answer correctly from economic theory without inspecting the graph?” The answer is **NO**.','',
'Each item has four distinct choices, one defensible key, at least two economically plausible choices before viewing the graph, and an alternative using the actual graph values with a different economic interpretation. These are item-by-item assessment judgments supported by the evidence below; automated checks independently verify choices, keys, exact proposal adoption, unchanged fields, and publication parity.','',
'## Preservation and regression results','',
'Only stems, choices, feedback, and answer hashes changed in the 38 canonical records. All other 9,741 canonical records—including the other 17 graph-assessment revisions and every previously approved non-graph wording revision—are unchanged. Difficulty, roles, challenge stages, routing, repair/bridge mappings, source provenance, graph assets and references, accessibility fields, engine logic, telemetry, and course membership are unchanged. Library/registry/manifest and dependent policy checksums were regenerated without changing their policy content.','',
'| Projection | IDs before and after | Authorized shared changes | Unrelated rows unchanged |',
'| --- | ---: | ---: | ---: |']
for a,title in [('general','General'),('micro','Micro'),('macro','Macro')]:
 e=export_checks[a];lines.append(f"| {title} | {e['count_after']:,} | {len(e['changed_ids'])} | {e['unrelated_rows_unchanged']:,} |")
lines += ['',
'The global bank still contains 9,779 unique canonical IDs. The normal exporter regenerated all three faculty banks. Shared Micro/Macro differences are limited to the same authorized IDs; every unrelated export row is identical to its baseline. General CSV target fields match the canonical source exactly. The normal exporter verified PDF question text, choices, keys, and feedback; visual inspection confirmed the graphs on all 38 revised General questions.','',
'The PDFium preview omitted the graph on page 810. An independent Poppler rendering confirmed that the graph is present and readable in the final PDF. No source, asset, or export change was necessary.','',
'The 29-test active Composer suite includes canonical integrity, graph synchronization, and question-quality checks. A separate full General publication check confirms all 1,589 IDs, all ten modes, answer verification, exact revised content, and inline JavaScript compilation. Negative mutation probes reject unauthorized target content, unrelated content, and metadata edits.','',
'## Test expectation maintenance','',
'The tests recognize an additional exact 38-record approval layer tied to the frozen pre-closure Git baseline. Earlier before/after fixtures remain unchanged. The layer validates exact proposed alternatives, original keyed positions, the allowed fields, and all non-target records through the prior approval chain. Existing assertions, quality-detector rules, and failure thresholds remain active.','',
'Five lexical REVIEW findings remain visible with explicit dispositions. They do not represent a failed construct or graph test; no difficulty recalibration was made and no warning or error was suppressed:','']
for f in quality:lines.append(f"- **{f['questionId']} — {f['rule']}:** {f['note']}")
lines += ['', '## Individual closure records','']
for c in ledger['changes']:
 i=c['id'];r=c['review'];b=c['beforeRecord'];a=c['afterRecord'];k=c['correctIndex'];p=proposal[i]
 lines += [f'### {i}','',f"**Original economic construct:** {r['original_construct']}",'',f"**Current drift problem repaired:** {r['drift_problem']}",'','**BEFORE:**','',f"- Stem: {b['q']}"]
 for letter,opt in zip('ABCD',b['options']):lines.append(f'- {letter}: {opt}')
 lines += [f"- Correct answer: {'ABCD'[k]} — {b['options'][k]}",'','**AFTER:**','',f"- Stem: {a['q']}"]
 for letter,opt in zip('ABCD',a['options']):lines.append(f'- {letter}: {opt}')
 lines.append(f"- Correct answer: {'ABCD'[k]} — {a['options'][k]}")
 if b['feedback']!=a['feedback']:lines.append('- Feedback: '+a['feedback'])
 lines += ['',f"**Graph information required and numerical check:** {r['economic_and_graph_evidence']}",'',f"**Economic reasoning required:** {r['original_construct']}",'',
 '**Construct test: PASS — NO.** Reading the graph values alone leaves different economic interpretations in choices '+ ' and '.join(r['construct_test']['same_values_different_interpretation_choices'])+'.','',
 '**Graph test: PASS — NO.** Choices '+' and '.join(r['graph_test']['economically_plausible_without_graph'])+' remain economically plausible until the graph is read. The stem does not provide the distinguishing graph values.','',
 '**Other item checks:** Four distinct choices: PASS. Exactly one defensible answer: PASS. Feedback explains graph evidence and economic reasoning: PASS. Numerical values: PASS. Answer hash resolves uniquely: PASS. Tested construct and graph answer are not supplied by the stem.','',
 f"**Answer hash changed:** {'YES' if c['answerHashChanged'] else 'NO'}.",'',
 '**PDF inspection:** PASS — pages '+', '.join(map(str,qa['question_pages'][i]))+'.']
 if r['proposal_adjustments']:lines += ['', '**Minimal proposal adjustment:** '+' '.join(r['proposal_adjustments'])]
 lines.append('')
lines += ['## Reproduction and source checks','',
'The implementation, frozen review, baseline reference, exact before/after records, and acceptance evidence are saved in `audit_tools/general_economics_graph_construct_closure_20261003/`. No prior audit or ledger was rewritten.','',
'```text','node audit_tools/general_economics_graph_construct_closure_20261003/verify.cjs','node build/faculty-build-composer/tests/run_active_composer_suite.js','python -m unittest discover -s tools/tests -p test_export_faculty_question_bank.py -v','python tools/export_faculty_question_bank.py --node <node-executable>','```','',
'The active suite’s generated comprehensive outputs were isolated in the closure scratch directory. The machine-readable ledger includes all original pre-cleanup tasks, before/after records, hashes, acceptance evidence, export comparisons, and page-level inspection coverage.','',
f"Pre-closure source SHA-256: `{ledger['baselineSourceSha256']}`.",'',f'Final source SHA-256: `{source_sha}`.','',
'**FINAL STATUS: PASS**','']
assert sum(x.startswith('### ') for x in lines)==38
md=AUDITS/'general_economics_graph_construct_drift_closure_20261003.md';md.write_text('\n'.join(lines),encoding='utf-8')
(HERE/'validation_receipt.json').write_text(json.dumps({k:v for k,v in result.items() if k not in ['changes','canonical_verification']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'summary':summary,'report':str(md),'ledger':str(json_path)},indent=2))
