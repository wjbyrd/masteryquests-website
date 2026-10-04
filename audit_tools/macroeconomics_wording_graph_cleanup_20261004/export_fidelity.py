from pathlib import Path
import json,csv,hashlib,importlib.util
ROOT=Path.cwd();H=ROOT/'audit_tools/macroeconomics_wording_graph_cleanup_20261004';W=ROOT/'tmp/macroeconomics_wording_graph_cleanup_20261004'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
spec=importlib.util.spec_from_file_location('exporter',ROOT/'tools/export_faculty_question_bank.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
node='C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
lib=e.load_library(ROOT/e.SOURCE);records,_=e.collect(lib);e.audit_answers_and_routes(lib,records,ROOT,node)
groups=e.partition_disciplines(records,e.course_area_memberships(lib,ROOT,node))
expected=e.make_rows(groups['macro'],ROOT,lib)
with (ROOT/'faculty_exports/macroeconomics_question_bank.csv').open(encoding='utf-8-sig',newline='')as f:
 reader=csv.DictReader(f);columns=reader.fieldnames;actual=list(reader)
assert len(actual)==len(expected)==4745
assert len({r['question_id']for r in actual})==4745
byid={r['question_id']:r for r in actual};mismatches=[]
for row in expected:
 current=byid[row['question_id']]
 for k in columns:
  if current[k]!=str(row.get(k,'')):mismatches.append({'id':row['question_id'],'field':k})
assert not mismatches,mismatches[:10]
ledger=read(H/'expectations.json');conversions=[c['id']for c in ledger['changes']if c['beforeRecord'].get('image')and not c['afterRecord'].get('image')]
assert all(not byid[i]['image']for i in conversions)
protected=read(W/'protected_files.json');sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
unchanged={}
for area in ['general','micro']:
 name=f'faculty_exports/{area}_economics_question_bank.csv' if area=='general' else 'faculty_exports/microeconomics_question_bank.csv'
 unchanged[area]=sha(ROOT/name)==protected[name]
assert all(unchanged.values()),unchanged
summary=read(ROOT/'faculty_exports/validation_summary.json')
assert summary['source_sha256']==sha(ROOT/e.SOURCE)
result={'status':'PASS','rows':4745,'unique_ids':4745,'columns':len(columns),'schema':columns,'canonical_field_mismatches':mismatches,'text_only_images_absent':len(conversions),'general_micro_csv_byte_identical':unchanged,'source_sha256':summary['source_sha256'],'files':{s['csv_file']:sha(ROOT/'faculty_exports'/s['csv_file'])for s in summary['disciplines'].values()}}
(W/'export_fidelity.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in result.items()if k not in ['schema','files']},indent=2))
