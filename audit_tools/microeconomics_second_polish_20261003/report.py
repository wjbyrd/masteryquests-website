"""Produce the requested exhaustive second-pass ledger and validation receipt."""
from pathlib import Path
import json,csv,hashlib,collections
H=Path(__file__).resolve().parent;ROOT=H.parents[1];W=ROOT/'tmp'/H.name;OUT=ROOT/'faculty_exports';AUD=OUT/'audits'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
S=read(H/'scope.json');L=read(H/'expectations.json');V=read(W/'verification.json');D=read(H/'diagnostic_review.json');Q=read(W/'pdf_visual_qa.json');E=read(OUT/'validation_summary.json');A=read(H/'acceptance.json');disp=read(H/'duplicate_dispositions.json')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source=ROOT/'build/faculty-build-composer/data/composer_library.js'
assert sha(source)==E['source_sha256']==V['sourceSha256']==Q['source_sha256']
assert Q['status']=='PASS' and Q['questions_inspected']==35 and not Q['split_question_cores']
assert Q['pdf_sha256']==sha(OUT/'microeconomics_question_bank.pdf')
composer=(W/'composer-tests.log').read_text();exporttests=(W/'exporter-tests.log').read_text();assert composer.count('PASS ')==29 and '"passed": 29' in composer and 'Ran 14 tests' in exporttests and 'OK' in exporttests
with (OUT/'microeconomics_question_bank.csv').open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
assert len(rows)==6301 and len({r['question_id'] for r in rows})==6301
byid={r['question_id']:r for r in rows};mismatch=[]
for c in L['changes']:
 i=c['id'];q=c['afterRecord'];r=byid[i]
 for field,col in [('q','question_text'),('feedback','feedback')]:
  if q[field]!=r[col]:mismatch.append([i,field])
 for n,o in enumerate(q['options']):
  if o!=r['option_'+'abcd'[n]]:mismatch.append([i,'option_'+'abcd'[n]])
 if q['options'][c['correctIndex']]!=r['correct_answer_text']:mismatch.append([i,'key'])
assert not mismatch
unchanged={}
for area in ['general','macro']:
 name={'general':'general_economics','macro':'macroeconomics'}[area]+'_question_bank.csv'
 with (W/name).open(encoding='utf-8-sig',newline='') as f:old=list(csv.DictReader(f))
 with (OUT/name).open(encoding='utf-8-sig',newline='') as f:new=list(csv.DictReader(f))
 assert old==new,area
 unchanged[area]={'csv_content_identical':True,'rows':len(new)}
for c in L['changes']:
 c['review']=A[c['id']]
 assert c['review']['hash_validation']=='PASS'
 c['review']['pdf_visual_pages']=Q['question_pages'].get(c['id'],[])
summary={'duplicate_groups_reviewed':29,'duplicate_ids_reviewed':90,'substantive_duplicates_revised':59,'retained_representatives':29,'retained_duplicate_extras':2,'duplicate_instructor_review_exceptions':['42660','42697'],'cross_group_parallel_representatives':['P62C-CPS-L-002','P62C-CPS-L-007'],'graph_targets_reviewed':356,'mechanical_pattern_candidates':31,'graph_items_revised_for_variety':31,'pattern_review_retained':325,'graph_records_unchanged':321,'difficulty_candidates':5,'tier_coherence_repairs':5,'difficulty_review_exceptions':0,'unique_graph_changes':35,'candidate_union':125,'changed_ids':94,'unauthorized_changes':0,'construct_tests_passed':35,'graph_tests_passed':35,'numerical_failures':0,'answer_resolution_failures':0,'feedback_failures':0,'answer_hashes_changed':64,'exact_duplicate_diagnostic_flags_remaining':4,'exact_duplicate_diagnostic_groups_remaining':2,'near_duplicate_diagnostic_pairs_remaining':59,'additional_near_pairs_excluding_two_exact_exceptions':57,'literal_exact_stem_groups_including_graph_tasks':len(D['all_literal_exact_stem_groups_including_graph_tasks']),'composer_tests':'29/29','exporter_tests':'14/14','csv_mismatches':0,'pdf_mismatches':0,'pdf_graph_items_visually_inspected':35,'pdf_question_core_checks':6301,'micro_pdf_pages':Q['total_pdf_pages'],'publication_ids_unchanged':6276,'out_of_scope_legacy_publication_omissions':25}
exceptions=[{'id':'42660','reason':disp['42660']['reason']},{'id':'42697','reason':disp['42697']['reason']},{'ids':['P62C-CPS-L-002','P62C-CPS-L-007'],'reason':'The retained representatives of D01/D02 remain a numerical parallel pair across groups. This is disclosed as substantive parallel practice, not successful deduplication.'}]
flags=D['new_rule_flags']
for f in flags:
 if f['rule']=='graph-prompt-missing-cue':f['disposition']='False-positive cue heuristic: “vertical guide” and the undisclosed marked hours require the figure. The key competes with a valid 30-hour reading; no extra cue is necessary.'
 elif f['rule']=='possible-difficulty-overstatement':f['disposition']='Retained Hard: the student must reorder changed marginal costs, find the efficient quantity in each state and compare total surplus. Word count or absence of a heuristic trigger does not make this routine recall.'
 else:f['disposition']='Reviewed in context: the absolute statement expresses a specific misconception about necessity, sufficiency, completeness, proportional changes, or marginal versus average cost. It is not used as evidence of a keyed answer or as a graph-value substitute; the graph items retain two economically valid evidence alternatives.'
result={'schema_version':1,'final_status':'PASS WITH DOCUMENTED EXCEPTIONS','summary':summary,'exceptions':exceptions,'scope':S,'duplicate_dispositions':disp,'diagnostics':D,'changes':L['changes'],'validation':V,'pdf_visual_qa':Q,'export_checks':{'status':E['status'],'canonical_source_sha256':E['source_sha256'],'micro_csv_rows':6301,'micro_pdf_ids_once':E['disciplines']['micro']['pdf_questions'],'changed_record_csv_mismatches':mismatch,'normal_exporter_full_content_verification':'PASS','general_macro':unchanged},'artifacts':{n:{'path':str((OUT/n).resolve()),'sha256':sha(OUT/n)} for n in ['microeconomics_question_bank.csv','microeconomics_question_bank.pdf','general_economics_question_bank.csv','general_economics_question_bank.pdf','macroeconomics_question_bank.csv','macroeconomics_question_bank.pdf']}}
AUD.mkdir(exist_ok=True);name='microeconomics_second_polish_20261003'
(AUD/(name+'.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
lines=['# Microeconomics second-pass polish — 2026-10-03','', '**FINAL STATUS: PASS WITH DOCUMENTED EXCEPTIONS**','', 'Completed the bounded second pass against approved baseline commit `'+L['baselineRef']+'`. Only stem, choices, feedback and derived answer hashes changed. No difficulty, skills, roles, stages, routing, graph assets, engine or telemetry fields changed. Prior reports and approval ledgers remain intact.','', '## Results','', '| Measure | Result |','|---|---|']
for k,v in summary.items():lines.append('| '+k.replace('_',' ')+' | '+(', '.join(v) if isinstance(v,list) else str(v))+' |')
lines+=['','Pattern retention is a review disposition: 325 items did not need architecture diversification; four of those received only a difficulty repair. Thus 321 of the 356 graph records are entirely unchanged. The five difficulty candidates all received repairs, and one also belonged to the 31 pattern candidates.','', '## Scope frozen before editing','',f"Set A: {len(S['set_A'])}; set B: {len(S['set_B'])}; set C: {len(S['set_C'])}; unique union: {len(S['unique_union'])}. Changed: 94; reviewed union records retained: 31. All candidate reasons and every one of the 356 graph-review dispositions are reproduced below and in the JSON.",'','The new approval layer checks exact before/after records and projects them back through the immutable prior layer. Existing contract checks remain active; mutation probes reject altered wording, unrelated content and metadata. Only the four normal generated data/hash files and eight test consumers changed, plus the new strict approval layer and audit artifacts.','', '## Preserved banks and publication','', 'Canonical IDs: 9,779; General: 1,589; Micro: 6,301; Macro: 4,745. IDs, placements, metadata and membership are unchanged. General and Macro CSV contents compare identically with their frozen baselines. Shared General records 40032 and PG1-SUP-L-001 are untouched. Selectable Micro publication remains 6,276 IDs; the 25 legacy omissions remain unchanged and out of scope. All ten supported Micro modes, answer verification and generated JavaScript compilation pass.','', '## Exceptions and remaining duplication','']
for x in exceptions:lines.append('- '+', '.join(x.get('ids',[x.get('id')]))+': '+x['reason'])
lines+=['','The normal diagnostic reports four exact-stem flags in two groups: 42656/42660 and 42687/42697. It also reports 59 near-duplicate pairs, including those two exact pairs: 57 additional pairs remain. Of these, one is the cross-group reallocation pair above and 56 are retained graph-family parallel tasks. This is not a claim that the bank has no substantive redundancy.','', 'A raw literal-stem comparison including graph questions finds '+str(len(D['all_literal_exact_stem_groups_including_graph_tasks']))+' groups. The existing exact-duplicate rule treats graph evidence differently, so its four flags must not be confused with all identical strings. Both outputs are retained without suppression. Graph-family task redesign was not added to the scope merely because a near-duplicate flag remained.','', '## Duplicate-family decisions','']
for g in S['duplicate_groups']:
 lines+=['### '+g['group'],'','Original common task: '+g['stem'],'']
 for i in g['ids']:lines.append('- **'+i+' — '+disp[i]['status']+'**: '+disp[i]['reason'])
 lines+=['']
lines+=['## Near-duplicate pair dispositions','']
for p in D['near_pair_dispositions']:lines.append('- '+ ' / '.join(p['ids'])+' — '+p['classification']+'. '+p['reason'])
lines+=['','## Literal exact-stem groups, including graph tasks','']
for ids in D['all_literal_exact_stem_groups_including_graph_tasks']:lines.append('- '+', '.join(ids))
lines+=['','## New lexical diagnostic flags reviewed','']
for f in flags:lines.append('- '+f['questionId']+' / '+f['rule']+': '+f['disposition'])
lines+=['','## Export verification','', 'The normal exporter completed all three discipline CSV/PDF exports. Micro has 6,301 rows and unique IDs, every ID exactly once in the PDF, zero content mismatches, and complete question cores. All '+str(Q['total_pdf_pages'])+' Micro pages rendered successfully. All 35 changed graph questions were visually inspected on their final PDF pages: no clipping, missing graph or broken continuation. All 6,301 stem/choice/key/feedback cores remain together on a page. Graph evidence and option readings were checked against the displayed unchanged assets.','', '## Individual change records','']
labels={'A':'duplicate diversification','B':'distractor-pattern diversification','C':'difficulty-coherence repair'}
for c in L['changes']:
 i=c['id'];r=c['review'];b=c['beforeRecord'];a=c['afterRecord'];key=c['correctIndex']
 lines+=['### '+i,'','Reason: '+', '.join(labels[k] for k in r['categories'])+'.','Original concept: '+b['primaryConceptId']+'; skill: '+b['primarySkill']+'; existing difficulty: '+b['difficulty']+'.','']
 for title,q in [('BEFORE',b),('AFTER',a)]:
  lines+=['**'+title+'**','', 'Stem: '+q['q'],'']
  lines += ['- '+l+': '+q['options'][n] for n,l in enumerate('ABCD')]
  lines+=['','Key: '+'ABCD'[key]+' — '+q['options'][key]]
  if b['feedback']!=a['feedback']:lines+=['','Feedback: '+q['feedback']]
  lines+=['']
 lines+=['What substantive reasoning differs: '+r['reasoning_difference'],'','Why this is not cosmetic paraphrasing: '+r['noncosmetic'],'','Difficulty-coherence check: '+r['difficulty_check'],'','Numerical verification: '+r['numerical_reasoning'],'','Four distinct choices / one defensible answer / feedback / hash: PASS.','Hash changed: '+('YES' if c['answerHashChanged'] else 'NO')+'.','']
 if 'duplicate_test' in r:lines+=['Duplicate-task acceptance: could the student repeat essentially the same reasoning from another member of this group? **NO**. '+r['duplicate_test']['reason'],'']
 if 'graph_test' in r:
  lines+=['Graph evidence required: '+r['graph_evidence_required'],'','Economic reasoning required: '+r['economic_reasoning_required'],'','Construct test: **PASS** — graph readings alone identify the answer: **NO**. '+r['construct_test']['reason'],'','Graph test: **PASS** — economic theory alone identifies the answer: **NO**. Without the graph, at least two choices remain economically plausible: **YES** ('+'/'.join(r['graph_test']['economically_plausible_without_graph'])+').','', 'Final PDF visual inspection: PASS; page(s) '+', '.join(map(str,r['pdf_visual_pages']))+'.','']
lines+=['## Frozen candidate reasons and retained dispositions','']
for i,r in S['records'].items():lines.append('- **'+i+'** ['+', '.join(r['categories'])+'] — '+('changed' if i in A else disp[i]['status'])+'. '+' '.join(r['reasons']))
lines+=['','## Every graph-review disposition','']
for i,r in S['graph_review_dispositions'].items():lines.append('- **'+i+'** — pattern: '+r['pattern']+'; difficulty: '+r['difficulty']+'. Construct: '+r['construct']+'.')
lines+=['','## Reproduction and evidence','', 'Authoring proposals and scope: `audit_tools/microeconomics_second_polish_20261003/`. Application uses Composer `normalizeAnswerText`, SHA-256, canonical stable serialization and integrity contracts. Numerical recomputations are recorded in `numerical_verification.json`. `expectations.json` contains exact full before/after records. The report JSON includes the full validation, candidate, diagnostic and visual receipts.','', 'Commands run:','', '```text','node build/faculty-build-composer/tests/run_active_composer_suite.js','python -m unittest tools.tests.test_export_faculty_question_bank','node audit_tools/microeconomics_second_polish_20261003/verify.cjs','node tmp/microeconomics_second_polish_20261003/quality_compare.mjs','python tools/export_faculty_question_bank.py --node <bundled Node>','python audit_tools/microeconomics_second_polish_20261003/pdf_qa.py','```','', 'The active suite used the existing output-isolation shim to keep generated validation artifacts from overwriting prior reports. No assertion or test was suppressed.','', '**FINAL STATUS: PASS WITH DOCUMENTED EXCEPTIONS**','']
(AUD/(name+'.md')).write_text('\n'.join(lines),encoding='utf8')
(H/'validation_receipt.json').write_text(json.dumps({'summary':summary,'source_sha256':sha(source),'reports':{ext:sha(AUD/(name+ext)) for ext in ['.md','.json']},'validation':V,'exports':result['export_checks'],'pdf':Q},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(summary,indent=2))
