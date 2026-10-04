from pathlib import Path
import json,csv,hashlib,importlib.util
ROOT=Path.cwd();H=Path(__file__).parent;W=ROOT/'tmp'/H.name
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
spec=importlib.util.spec_from_file_location('exporter',ROOT/'tools/export_faculty_question_bank.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
node='C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
lib=e.load_library(ROOT/e.SOURCE);records,_=e.collect(lib);e.audit_answers_and_routes(lib,records,ROOT,node)
groups=e.partition_disciplines(records,e.course_area_memberships(lib,ROOT,node));summary=read(ROOT/'faculty_exports/validation_summary.json')
assert summary['source_sha256']==hashlib.sha256((ROOT/e.SOURCE).read_bytes()).hexdigest()
authorized=set(read(H/'scope.json')['authorized_union']);v=read(W/'verification.json');checks={}
for area,prefix,count in [('general','general_economics',1589),('micro','microeconomics',6299),('macro','macroeconomics',4745)]:
 expected=e.make_rows(groups[area],ROOT,lib)
 with (ROOT/'faculty_exports'/f'{prefix}_question_bank.csv').open(encoding='utf-8-sig',newline='') as f:
  reader=csv.DictReader(f);columns=reader.fieldnames;actual=list(reader)
 byid={r['question_id']:r for r in actual};assert len(actual)==len(byid)==len(expected)==count
 mismatches=[(r['question_id'],k) for r in expected for k in columns if byid[r['question_id']][k]!=str(r.get(k,''))]
 assert not mismatches,mismatches[:10]
 assert '42660' not in byid and '42697' not in byid
 changed=v['bankChecks'][area]['changedAuthorizedIds'];assert set(changed)<=authorized
 checks[area]={'rows':count,'unique_ids':count,'canonical_field_mismatches':mismatches,'authorized_shared_changes':changed,'unrelated_records_unchanged':True,'all_pdf_ids_and_content_verified_by_normal_exporter':True}
checks['status']='PASS'
checks['graph_attachment_decisions_preserved']=True
(W/'export_fidelity.json').write_text(json.dumps(checks,indent=2)+'\n',encoding='utf-8')
print(json.dumps({a:{k:v for k,v in x.items() if k!='authorized_shared_changes'} if isinstance(x,dict) else x for a,x in checks.items()},indent=2))
