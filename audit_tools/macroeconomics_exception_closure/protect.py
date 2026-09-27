import json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];WORK=ROOT/'tmp/macroeconomics_exception_closure'
b=json.loads((Path(__file__).parent/'inputs/baseline.json').read_text())
allowed={'build/faculty-build-composer/data/'+n for n in ['composer_library.js','composer_library_manifest.json','composer_registry.json','faculty-outcomes.js']}
allowed|={'build/faculty-build-composer/tests/'+n for n in ['composer-audit-contracts.js','run_content_scope_validation.js','run_fading_fortune_validation.js','run_macro_phase2_taxonomy_validation.mjs','run_phase3e_graph_question_sync_validation.mjs','run_question_bank_comprehensive_validation.mjs','run_risk_reward_validation.js','run_trial_by_graph_validation.js']}
changes=[];protected=0
for name,before in b['fileHashes'].items():
    p=ROOT/name;after=hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None
    if before!=after:changes.append({'path':name,'before':before,'after':after,'authorizedDerivedOrAdapter':name in allowed})
    else:protected+=1
result={'baselineFiles':len(b['fileHashes']),'unchangedFiles':protected,'changes':changes,'unauthorizedFileChanges':[c for c in changes if not c['authorizedDerivedOrAdapter']]}
(WORK/'protected_files.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2));assert not result['unauthorizedFileChanges']
