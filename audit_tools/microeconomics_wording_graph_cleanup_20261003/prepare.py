from pathlib import Path
import json,hashlib,shutil,subprocess,importlib.util
ROOT=Path.cwd();HERE=ROOT/'audit_tools/microeconomics_wording_graph_cleanup_20261003';WORK=ROOT/'tmp/microeconomics_wording_graph_cleanup_20261003'
source=ROOT/'build/faculty-build-composer/data/composer_library.js';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
w=json.loads((ROOT/'faculty_exports/audits/microeconomics_wording_graph_audit_20261003.json').read_text(encoding='utf8'))
assert len(w['records'])==672 and sha(source)==w['preservation_checks']['source_sha256_after']
if not (HERE/'baseline.json').exists():
 (HERE/'baseline.json').write_text(json.dumps({'baseline_ref':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'source_sha256':sha(source),'target_ids':sorted(w['records'])},indent=2)+'\n')
 (HERE/'worklist.json').write_text(json.dumps(w,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 for n in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:shutil.copy2(source.parent/n,WORK/n)
 for area in ['general_economics','microeconomics','macroeconomics']:shutil.copy2(ROOT/'faculty_exports'/f'{area}_question_bank.csv',WORK/f'{area}_question_bank.csv')
 hashes={str(p.relative_to(ROOT)).replace('\\','/'):sha(p) for base in ['build','tools','faculty_exports'] for p in (ROOT/base).rglob('*') if p.is_file() and '__pycache__' not in str(p)}
 (WORK/'protected_files.json').write_text(json.dumps(hashes,indent=2)+'\n')
 shutil.copy2(ROOT/'tmp/general_economics_graph_construct_closure_20261003/isolate_outputs.cjs',WORK/'isolate_outputs.cjs')
spec=importlib.util.spec_from_file_location('e',ROOT/'tools/export_faculty_question_bank.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
lib=e.load_library(WORK/'composer_library.js');records,_=e.collect(lib)
assert len(records)==9779
(HERE/'originals.json').write_text(json.dumps({i:records[i]['q'] for i in w['records']},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Frozen 672-ID worklist, 9,779-record source and protected-file/CSV baselines.')
