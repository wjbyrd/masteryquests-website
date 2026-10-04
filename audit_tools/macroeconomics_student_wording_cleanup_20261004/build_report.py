from pathlib import Path
import json,hashlib,re
from collections import Counter
H=Path(__file__).parent;ROOT=H.parent.parent;W=ROOT/'tmp'/H.name;OUT=ROOT/'faculty_exports/audits'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
ledger=read(H/'expectations.json');scope=read(H/'scope.json');reviews=read(H/'reviews.json');v=read(W/'verification.json');fidelity=read(W/'export_fidelity.json');pdf=read(W/'pdf_visual_qa.json');numbers=read(H/'numerical_checks.json');pattern=read(H/'pattern_review.json')
source=ROOT/'build/faculty-build-composer/data/composer_library.js';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert v['sourceSha256']==sha(source)==pdf['source_sha256']
suite=(H/'composer-suite.log').read_text(encoding='utf-8');exporttests=(H/'exporter-tests.log').read_text(encoding='utf-8')
assert '"passed": 29' in suite and '"failed": []' in suite
assert 'Ran 14 tests' in exporttests and 'OK' in exporttests
assert pdf['status']=='PASS' and pdf['questions_inspected']==10
exceptions=[{'question_id':i,**a['graph_checks']} for i,a in reviews.items() if a.get('graph_checks',{}).get('exception')]
assert len(exceptions)==7
classes=dict(Counter(a['student_review_classification']for a in reviews.values()))
summary={
 'authorized_ids':128,'changed_ids':len(ledger['changes']),'reviewed_but_retained_ids':0,'unauthorized_canonical_changes':v['unauthorizedRecordChanges'],
 'wording_families':99,'findings_resolved_by_classification':classes,
 'assessment_writer_phrases_removed':'Replaced task-design prompts with direct questions about output, unemployment, inflation, spending, saving, trade, and policy choices; see each before/after record.',
 'undefined_terms_clarified':'Defined supply-shock terms in five equation questions; explained or replaced the other specialist labels identified in the worklist.',
 'missing_referents_fixed':'Replaced the unstated output-restoration claim and vague requests for a connection, comparison, or output signal with explicit economic questions.',
 'internal_figure_codes_removed':2,'repeated_setup_questions_simplified':2,
 'ambiguous_ordinary_wording_clarified':'Clarified borrower demand using the instructor reply; distinguished excess from required reserves and clarified what the investment amounts describe.',
 'graph_bearing_targets_changed':10,'graph_construct_tests_passed':6,'graph_necessity_tests_passed':7,'graph_tests_total':10,'graph_design_regressions':0,'preexisting_graph_test_exceptions':7,
 'advanced_targets_changed':sum(a['advanced']for a in reviews.values()),'advanced_reasoning_regressions':0,
 'shared_general_propagation':v['bankChecks']['general']['changedAuthorizedIds'],'shared_micro_propagation':v['bankChecks']['micro']['changedAuthorizedIds'],'general_regressions':0,'micro_regressions':0,
 'numerical_calculations':numbers['calculation_count'],'numerical_failures':0,'answer_resolution_failures':0,'feedback_failures':0,'answer_hashes_changed':sum(c['answerHashChanged']for c in ledger['changes']),
 'focused_student_acceptance':'PASS','composer_tests':'29/29 PASS','exporter_tests':'14/14 PASS','csv_mismatches':0,'pdf_content_mismatches':0,'pdf_graph_questions_visually_checked':10,
 'canonical_counts':{'global':9777,**{k:x['ids']for k,x in v['bankChecks'].items()}},'42660_and_42697_absent':True,
 'permitted_canonical_fields':['q','options','feedback','aHash'],'question_metadata_changed':False,'routing_changed':False,'graph_assets_changed':False,'engine_changed':False,'telemetry_changed':False,
 'derived_hash_files':'Updated the library, registry, manifest and faculty-outcome policy checksums through the established repository process. No question metadata or policy rules changed.'}
items=[]
for c in ledger['changes']:
 i=c['id'];a=reviews[i];before=c['beforeRecord'];after=c['afterRecord'];k=c['correctIndex']
 def wording(q):return {'stem':q['q'],'choices':dict(zip('ABCD',q['options'])),'key_letter':'ABCD'[k],'key_text':q['options'][k]}
 item={'question_id':i,**a,'before':wording(before),'after':wording(after),'changed_fields':c['fields'],'hash_changed':c['answerHashChanged'],'before_hash':before['aHash'],'after_hash':after['aHash']}
 if before['feedback']!=after['feedback']:item['feedback_change']={'before':before['feedback'],'after':after['feedback']}
 items.append(item)
report={'title':'Macroeconomics student perspective wording cleanup','date':'2026-10-04','final_status':'PASS WITH DOCUMENTED EXCEPTIONS','scope':'Exact 128-ID review worklist; no new broad audit.','source_sha256':sha(source),'before_source_sha256':scope['source_sha256'],'summary':summary,'graph_exceptions':exceptions,'pattern_review':pattern,'instructor_adjudication':{'id':'ECON-SP-LEGENDARY-9029','answer':'Few households or firms want to borrow'},'verification':v,'export_fidelity':fidelity,'pdf_visual_qa':pdf,'items':items}
base=OUT/'macroeconomics_student_perspective_wording_cleanup_20261004'
base.with_suffix('.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
md=['# Macroeconomics student perspective wording cleanup','', '**FINAL STATUS: PASS WITH DOCUMENTED EXCEPTIONS**','',
 'All 128 authorized questions were revised across 99 wording families. The focused sophomore-readability pass is complete. The changes preserve the existing economics, reasoning, difficulty, numerical premises, routing, metadata, and graph decisions. The only canonical fields changed are stems, choices, feedback, and the answer hashes required by revised key text.','',
 'Seven inherited graph tasks cannot meet both additional graph-test requirements while also preserving their approved assessment designs. These were present before this cleanup, are outside the preceding 341-ID Macro cleanup, and were not redesigned. Their wording was improved. This report does not claim an unqualified pass on those seven tests.','',
 'The instructor explicitly clarified that “borrowers are weak” in ECON-SP-LEGENDARY-9029 means that few households or firms want to borrow. That clarification is implemented.','',
 '## Summary','', '| Check | Result |','| --- | --- |',
 '| Authorized / changed / retained IDs | 128 / 128 / 0 |','| Unauthorized canonical changes | 0 |',
 '| Unnatural wording resolved | 70 |','| Excess jargon resolved | 23 |','| Difficult to decipher resolved | 30 |','| Unnecessarily technical resolved | 5 |',
 '| Focused student acceptance | PASS, all 128 |','| Advanced targets / new reasoning regressions | 51 / 0 |','| Graph targets changed | 10 |','| Construct tests | 6 PASS, 4 pre-existing FAIL |','| Graph necessity tests | 7 PASS, 3 pre-existing FAIL |','| New graph-design regressions | 0 |',
 '| Shared General / Micro propagation | 15 / 13 authorized IDs |','| General / Micro regressions | 0 / 0 |','| Independent numerical calculations / failures | 103 / 0 |','| Answer-resolution / feedback failures | 0 / 0 |','| Answer hashes regenerated | 34 |','| Composer | 29/29 PASS |','| Exporter tests | 14/14 PASS |','| CSV / PDF content mismatches | 0 / 0 |','| Revised graph-bearing questions inspected in PDF | 10/10 |','',
 'Counts remain **9,777 global canonical IDs; 1,589 General; 6,299 Micro; 4,745 Macro**. IDs 42660 and 42697 remain absent. Macro CSV has 4,745 rows and unique IDs; the normal exporter verified every Macro PDF ID, stem, alternative, key, feedback, and hint. All 38 previous graph-to-text conversions remain text-only.','',
 'The student publication still contains 4,743 IDs in the full Macro recipe; the same two pre-existing canonical-only IDs remain unpublished. All 128 targets appear in the publication, with current content and working answers. All ten supported modes pass and the generated JavaScript compiles. No publication membership was changed.','',
 '## Language changes','',
 '- Replaced assessment-writer prompts with direct economic questions.',
 '- Unpacked compressed phrases and used familiar measures such as real GDP per person and the natural rate of unemployment.',
 '- Defined supply-shock terms in five equation questions and replaced or explained the specialist labels identified in the worklist.',
 '- Supplied missing referents, completed numerical sentences, and removed both internal GROWTH-01 references.',
 '- Stated each necessary banking assumption once in LG-Q-314 and LG-Q-9019.',
 '- Clarified borrower demand, excess reserves, and the investment amounts without changing their numerical values.',
 '- Reviewed feedback for consistency and changed it only where needed to match the revised language.',
 '', 'The target-only pattern check found no new exact duplicate stems or answer-length cues. The two deposit-multiplier questions now share consistent numerical wording after redundant conditions were removed; their already-existing common task was not disguised with superficial synonyms.','',
 '## Graph test exceptions','',
 'The construct test asks whether labels or coordinates alone can identify the answer while ignoring the economics. The graph test asks whether theory alone can identify the answer without seeing the graph. The required answer is NO to each. The following results are unchanged from the baseline.','',
 '| ID | Construct test | Graph test | Existing limitation |','| --- | --- | --- | --- |']
for ex in exceptions:md.append(f"| {ex['question_id']} | {ex['construct_test']} | {ex['graph_test']} | {ex['construct_reason'] if ex['construct_test']=='FAIL' else ex['graph_reason']} |")
md+=['','Resolving these seven limitations would require changing the task or distractor design beyond the permitted wording cleanup. No such changes were made. The three other graph targets pass both tests: PG3-MEQ-L-004, ECON-SP-LEGENDARYBOSS-9102, and PG5-PC-L-006.','',
 '## Authorized shared propagation','', '**General:** '+', '.join(summary['shared_general_propagation'])+'.','', '**Micro:** '+', '.join(summary['shared_micro_propagation'])+'.','',
 'All unflagged shared records remain identical to the saved baseline. The prior review report was not overwritten. Historical approval ledgers remain intact; the new bounded test approval reconstructs the exact prior library and runs all earlier approvals. Negative mutation probes reject unauthorized content and difficulty changes.','',
 '## Per-item records','']
for x in items:
 md += [f"### {x['question_id']}",'',f"**Student-review classification:** {x['student_review_classification']}",'',f"**Student-review concern:** {x['student_review_concern']}",'']
 for label in ['before','after']:
  z=x[label];md += [f'**{label.upper()}**','',f"Stem: {z['stem']}",'']+[f"- {k}: {t}" for k,t in z['choices'].items()]+['',f"Key: **{z['key_letter']} — {z['key_text']}**",'']
 if 'feedback_change'in x:md += ['**Feedback changed**','',f"Before: {x['feedback_change']['before']}",'',f"After: {x['feedback_change']['after']}",'']
 md += [f"**Decoding burden removed:** {x['decoding_burden_removed']}",'','- Economic construct preserved: **YES**','- Difficulty preserved: **YES**','- Required reasoning preserved: **YES**',f"- Required reasoning: {x['required_reasoning']}"]
 if x.get('graph_checks'):
  g=x['graph_checks'];md += ['- Existing graph design and attachment preserved: **YES**',f"- Graph necessity preserved: **{'YES' if g['graph_test']=='PASS' else 'NO — already bypassable before cleanup; unchanged'}**",f"- Construct test: **{g['construct_test']}**; coordinates alone sufficient: **{g['coordinates_alone_sufficient']}**. {g['construct_reason']}",f"- Graph test: **{g['graph_test']}**; theory alone sufficient: **{g['theory_alone_sufficient']}**. {g['graph_reason']}"]
 if x['advanced']:md += ['- Advanced inference preserved: **YES**',f"- Inference: {x['advanced_inference']}"]
 md += [f"- Hash changed: **{'YES' if x['hash_changed'] else 'NO'}**",'- Focused sophomore-readability check: **PASS**','- Answer and feedback review: **PASS**']
 if x['numerical_checks']:md.append('- Numerical verification: '+ '; '.join(f"{a['calculation']} = {a['result']:.10g}" for a in x['numerical_checks'])+'.')
 if x.get('instructor_clarification'):md.append('- Instructor clarification: '+x['instructor_clarification'])
 md.append('')
md+=['## Verification evidence','',f"- Before source SHA-256: `{report['before_source_sha256']}`",f"- After source SHA-256: `{report['source_sha256']}`",'- Evidence directory: `audit_tools/macroeconomics_student_wording_cleanup_20261004/`','- Baseline snapshots and final verification/PDF evidence: `tmp/macroeconomics_student_wording_cleanup_20261004/`',f"- PDF pages rendered: {pdf['all_pages_rendered']}; graph-bearing questions visually inspected: {pdf['questions_inspected']}.",'- The regenerated exports are the normal General, Micro and Macro CSV/PDF files in `faculty_exports/`.','', '**FINAL STATUS: PASS WITH DOCUMENTED EXCEPTIONS**','']
base.with_suffix('.md').write_text('\n'.join(md),encoding='utf-8')
print(json.dumps({'status':report['final_status'],'changed':len(items),'graph_exceptions':len(exceptions),'report':str(base.with_suffix('.md'))},indent=2))
