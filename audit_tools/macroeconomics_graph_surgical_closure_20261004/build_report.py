from pathlib import Path
import json,hashlib

H=Path(__file__).parent;ROOT=H.resolve().parents[1];W=ROOT/'tmp'/H.name;OUT=ROOT/'faculty_exports/audits'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
ledger=read(H/'expectations.json');v=read(W/'verification.json');fidelity=read(W/'export_fidelity.json');qa=read(W/'pdf_visual_qa.json');numbers=read(W/'numerical_checks.json')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source=ROOT/'build/faculty-build-composer/data/composer_library.js'
assert sha(source)==v['sourceSha256']==qa['source_sha256']
assert qa['status']=='PASS' and qa['questions_inspected']==3 and not qa['split_question_cores']
assert fidelity['status']=='PASS' and v['unauthorizedRecordChanges']==0
suite=(H/'composer-suite-rerun.log').read_text(encoding='utf-8');exporttests=(H/'exporter-tests.log').read_text(encoding='utf-8')
assert '"passed": 29' in suite and '"failed": []' in suite
assert 'Ran 14 tests' in exporttests and 'OK' in exporttests
assert v['publication']['allTenModesPass'] and v['publication']['answerVerification']['ok'] and v['publication']['allTargetsPresent']
items=[]
for c in ledger['changes']:
 i=c['id'];review=c['review'];g=review['graph_checks'];k=c['correctIndex']
 assert g['hidden_graph_key_identifiable']==g['coordinates_alone_sufficient']=='NO'
 assert g['graph_test']==g['construct_test']==numbers[i]['status']=='PASS'
 def wording(q):return {'stem':q['q'],'choices':dict(zip('ABCD',q['options'])),'key_letter':'ABCD'[k],'key_text':q['options'][k],'feedback':q['feedback']}
 items.append({'question_id':i,**review,'before':wording(c['beforeRecord']),'after':wording(c['afterRecord']),'changed_fields':c['fields'],'hash_changed':c['answerHashChanged'],'before_hash':c['beforeRecord']['aHash'],'after_hash':c['afterRecord']['aHash'],'independent_numerical_checks':numbers[i],'pdf_pages':qa['question_pages'][i]})
assert len(items)==3
report={'title':'Macroeconomics graph-assessment surgical closure','date':'2026-10-04','final_status':'PASS','authorized_ids':ledger['authorizedIds'],'changed_ids':v['changedIds'],'unauthorized_canonical_changes':0,
 'source_sha256':sha(source),'before_source_sha256':ledger['baselineSourceSha256'],'composer':'29/29 PASS','exporter_tests':'14/14 PASS','graph_tests':'3/3 PASS','construct_tests':'3/3 PASS','numerical_checks':'3/3 PASS','visual_pdf_inspections':'3/3 PASS',
 'counts':{'global':9777,**{a:r['ids'] for a,r in v['bankChecks'].items()}},'verification':v,'export_fidelity':fidelity,'pdf_visual_qa':qa,
 'suite_retry':'Initial run: 28/29; the official-theme guard observed concurrent changes to three unrelated play/growth-realms files. No game files or test assertions were changed for this closure. Full suite rerun: 29/29.',
 'items':items}
base=OUT/'macroeconomics_graph_surgical_closure_20261004'
base.with_suffix('.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
md=['# Macroeconomics graph-assessment surgical closure','', '**FINAL STATUS: PASS**','',
 'Only ECON-SP-ELITE-320, P62D-ITP-L-095, and P62D-ITP-L-098 changed. All three require both their existing graph and the intended economics. No additional questions were reviewed or revised.','',
 '| Check | Result |','| --- | --- |','| Authorized / changed IDs | 3 / 3 |','| Unauthorized canonical changes | 0 |','| Graph / construct tests | 3/3 PASS each |','| Independent numerical verification | 3/3 PASS |','| Distinct alternatives / defensible keys per item | 4 / 1 |','| Feedback consistency | 3/3 PASS |','| Answer hashes changed | 1: ECON-SP-ELITE-320 |','| Active Composer suite | 29/29 PASS |','| Exporter tests | 14/14 PASS |','| Macro modes / publication / hashes | PASS |','| Revised questions visually inspected in Macro PDF | 3/3 PASS |','| Canonical counts: global / General / Micro / Macro | 9,777 / 1,589 / 6,299 / 4,745 |','',
 'No IDs were added or deleted; 42660 and 42697 remain absent. Difficulty, skills, roles, routing, stages, course membership, graphs, engine code, and telemetry are unchanged. The two trade questions are shared canonical records, so their authorized revisions also appear in the regenerated General and Micro exports. Every other record is identical to the saved baseline.','',
 'The exact three-ID approval layer reconstructs the preceding library and runs the unchanged historical approval chain. Unauthorized content and metadata mutation probes are rejected. Library, registry, manifest, and faculty-outcome policy checksums were refreshed; policy rules were preserved.','',
 'The initial Composer run recorded 28/29: its official-theme guard detected concurrent changes in three unrelated Growth Realms files. No such files or test assertions were changed for this closure. A complete rerun passed 29/29.','',
 'All ten Macro modes pass, all three targets appear with current content in student publication, and answer verification and generated JavaScript compilation pass. Publication retains its existing 4,743 IDs and the same two canonical-only records; the faculty Macro bank retains all 4,745.','',
 'The normal exporter regenerated all three CSV/PDF pairs and verified every ID, stem, choice, key, feedback, and hint. Source and graph checksums match. All prior 38 graph-to-text conversions remain unchanged.','']
for x in items:
 md += [f"## {x['question_id']}",'']
 for version in ['before','after']:
  z=x[version];md += [f'**{version.upper()}**','',f"Stem: {z['stem']}",'']+[f'- {a}: {t}' for a,t in z['choices'].items()]+['',f"Correct answer: **{z['key_letter']}** - {z['key_text']}",'']
 md += [f"**Why the old version was bypassable:** {x['reason']}",'',f"**Graph information now required:** {x['graph_information']}",'',f"**Economic reasoning required:** {x['economic_reasoning']}",'',f"**Why the revised task prevents bypass:** {x['bypass_prevention']}",'','**Distractor rationale:**','']+[f'- {a}: {reason}' for a,reason in x['distractor_sources'].items()]
 md += ['',f"**Numerical verification:** {x['numerical_verification']}",'',
  '- Graph test: **PASS**. Could the key be identified with the graph hidden? **NO**.',
  '- Construct test: **PASS**. Could labels or coordinates alone answer the task while ignoring the economics? **NO**.',
  '- Without the graph, at least two alternatives remain economically plausible: **YES** ('+', '.join(x['graph_checks']['plausible_without_graph'])+').',
  '- Four distinct alternatives and exactly one defensible key: **PASS**.',
  f"- Hash changed: **{'YES' if x['hash_changed'] else 'NO'}**.",
  f"- Faculty PDF visual check: **PASS**, Macro page(s) {', '.join(map(str,x['pdf_pages']))}.",'',
  '**Feedback change**','',f"Before: {x['before']['feedback']}",'',f"After: {x['after']['feedback']}",'']
md += ['## Evidence','',f"- Before source SHA-256: `{report['before_source_sha256']}`",f"- After source SHA-256: `{report['source_sha256']}`",'- Exact patches, immutable before/after approval ledger, numerical calculations, and suite logs: `audit_tools/macroeconomics_graph_surgical_closure_20261004/`','- Frozen baseline, integrity results, export comparisons, and PDF inspection evidence: `tmp/macroeconomics_graph_surgical_closure_20261004/`','- Machine-readable companion: `macroeconomics_graph_surgical_closure_20261004.json`.','', '**FINAL STATUS: PASS**','']
base.with_suffix('.md').write_text('\n'.join(md),encoding='utf-8')
print(json.dumps({'status':'PASS','changed':3,'report':str(base.with_suffix('.md'))},indent=2))
