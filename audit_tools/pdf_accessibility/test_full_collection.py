import sys,copy
sys.path.insert(0,'audit_tools/pdf_accessibility');sys.path.insert(0,'build/faculty-build-composer/tools')
from repo_guard import *
from concept_review_lifecycle import generate_selected
from install_validated import prepare
from staged_gate import assess
root_guard();e=contained('validation_artifacts/pdf_accessibility/full_batch_v1');checks=[]
rows=generate_selected(contained('build/faculty-build-composer'),contained('tmp/pdf_accessibility/full_batch_v1/lifecycle_fixture'),['GEN-ECON-01'])
plan=prepare(rows,e/'review_receipt.json')
checks.append({'test':'maintained_lifecycle_reaches_reviewable_install_plan','passed':len(plan['records'])==1 and rows[0]['passed'] and contained(rows[0]['validatorReport']).is_relative_to(e),'activeInstall':False})
old=next(r for r in read_json(e/'final_validation.json') if r['code']=='GEN-ECON-01')
checks.append({'test':'maintained_lifecycle_reproduces_final_bytes','passed':old['sha256']==rows[0]['sha256']})
# Missing candidate must be reported against the real manifest, rather than silently shrinking scope.
result=assess([],e/'review_receipt.json')
checks.append({'test':'active_manifest_missing_staged_outputs_fail_closed','passed':result['activeCount']==len(read_json('build/faculty-build-composer/data/concept-reviews/manifest.json')['reviews']) and result['passed']==0 and all('MISSING_VALIDATED_CANDIDATE' in r['errors'] for r in result['records'])})
blocked=next(r for r in read_json(e/'final_validation.json') if r['code']=='MICRO-54')
try:prepare([blocked],e/'review_receipt.json');passed=False
except ValueError as exc:passed='semantic/visual' in str(exc)
checks.append({'test':'machine_pass_with_failed_visual_review_cannot_be_planned','passed':passed})
write_json(e/'full_collection_tests.json',{'checks':checks,'passed':all(r['passed'] for r in checks),'activeInstallPerformed':False})
print(checks)
assert all(r['passed'] for r in checks)
