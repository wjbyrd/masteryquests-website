import sys,json,importlib.util,hashlib,collections
from pathlib import Path
root=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('exporter',root/'tools/export_faculty_question_bank.py'); e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
lib=e.load_library(root/e.SOURCE); records,occ=e.collect(lib);e.audit_answers_and_routes(lib,records,root,sys.argv[1]);groups=e.partition_disciplines(records,e.course_area_memberships(lib,root,sys.argv[1]))
serial=lambda r:{k:sorted(v) if isinstance(v,set) else v for k,v in r.items()}
(root/'tmp/macroeconomics_audit/projection.json').write_text(json.dumps({k:serial(v) for k,v in groups['macro'].items()},ensure_ascii=False),encoding='utf8')
(root/'tmp/macroeconomics_audit/shared_general_ids.json').write_text(json.dumps(sorted(set(groups['macro'])&set(groups['general']))),encoding='utf8')
import subprocess
(root/'tmp/macroeconomics_audit/shared_micro_ids.json').write_text(json.dumps(sorted(set(groups['macro'])&set(groups['micro']))),encoding='utf8')
(root/'tmp/macroeconomics_audit/all_area_ids.json').write_text(json.dumps({k:sorted(v) for k,v in groups.items()}),encoding='utf8')
paths=list({root/p for p in subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0') if p}|{p for p in (root/'faculty_exports').rglob('*') if p.is_file()})
hashes={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
(root/'tmp/macroeconomics_audit/initial_hashes.json').write_text(json.dumps(hashes),encoding='utf8')
print(json.dumps({'counts':{k:len(v) for k,v in groups.items()},'sharedGeneral':len(set(groups['macro'])&set(groups['general'])),'snapshotFiles':len(hashes),'sourceSHA256':hashes[str(e.SOURCE)]}))
