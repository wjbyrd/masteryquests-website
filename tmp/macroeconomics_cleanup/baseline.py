import hashlib, importlib.util, json, subprocess, sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]; work=root/'tmp/macroeconomics_cleanup'; work.mkdir(exist_ok=True)
out=root/'audit_tools/macroeconomics_cleanup/inputs'; out.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('exporter',root/'tools/export_faculty_question_bank.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
source=root/e.SOURCE; sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
audit=json.loads((root/'faculty_exports/audits/macroeconomics_audit_findings.json').read_text(encoding='utf8'))
assert sha(source)==audit['canonicalSHA256'],'Source drift: STOP'
lib=e.load_library(source); records,occ=e.collect(lib);e.audit_answers_and_routes(lib,records,root,sys.argv[1]);areas=e.partition_disciplines(records,e.course_area_memberships(lib,root,sys.argv[1]))
counts={k:len(v) for k,v in areas.items()};assert counts=={'general':1589,'micro':6301,'macro':4745} and len(records)==9779
targets=sorted({i for f in audit['findings'] for i in f['affectedQuestionIDs']});assert len(targets)==2179
protected=set(areas['general'])|set(areas['micro']);assert not set(targets)&protected
paths=[root/'build/faculty-build-composer/data'/n for n in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']]
paths += [root/'faculty_exports/audits'/('macroeconomics_audit'+s) for s in ['.md','_findings.json','_coverage.json','_evidence.json']]
paths += [root/'build/faculty-build-composer/data'/a['runtimePath'] for a in lib['assetInventory']]
hashes={str(p.relative_to(root)).replace('\\','/'):sha(p) for p in paths}
def serial(r):return {k:sorted(v) if isinstance(v,set) else v for k,v in r.items()}
(work/'baseline_records.json').write_text(json.dumps({i:serial(r) for i,r in records.items()}),encoding='utf8')
(work/'baseline_library.json').write_text(json.dumps(lib),encoding='utf8')
baseline={'ref':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'sourceSHA256':sha(source),'counts':counts,'global':len(records),'targets':targets,'protectedQuestionIDs':sorted(protected),'areaIDs':{k:sorted(v) for k,v in areas.items()},'fileHashes':hashes}
(out/'baseline.json').write_text(json.dumps(baseline,indent=2),encoding='utf8')
print(json.dumps({'counts':counts,'global':len(records),'targets':len(targets),'protected':len(protected),'hashes':len(hashes)}))
