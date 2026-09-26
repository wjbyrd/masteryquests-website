import sys,json,importlib.util,hashlib,collections
from pathlib import Path
root=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('exporter',root/'tools/export_faculty_question_bank.py'); e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
lib=e.load_library(root/e.SOURCE); records,occ=e.collect(lib);e.audit_answers_and_routes(lib,records,root,sys.argv[1]);groups=e.partition_disciplines(records,e.course_area_memberships(lib,root,sys.argv[1]))
serial=lambda r:{k:sorted(v) if isinstance(v,set) else v for k,v in r.items()}
(root/'tmp/microeconomics_audit/projection.json').write_text(json.dumps({k:serial(v) for k,v in groups['micro'].items()},ensure_ascii=False),encoding='utf8')
(root/'tmp/microeconomics_audit/shared_general_ids.json').write_text(json.dumps(sorted(set(groups['micro'])&set(groups['general']))),encoding='utf8')
paths=[p for p in root.rglob('*') if p.is_file() and (str(p.relative_to(root)).startswith('build') or str(p.relative_to(root)).startswith('faculty_exports'))]
hashes={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
(root/'tmp/microeconomics_audit/initial_hashes.json').write_text(json.dumps(hashes),encoding='utf8')
print(json.dumps({'counts':{k:len(v) for k,v in groups.items()},'sharedGeneral':len(set(groups['micro'])&set(groups['general'])),'snapshotFiles':len(hashes),'sourceSHA256':hashes[str(e.SOURCE)]}))
