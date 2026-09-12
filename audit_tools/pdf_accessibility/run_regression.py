"""Run the repository's active suite with all intentional outputs inside this checkout."""
from repo_guard import *
import re, sys
root = root_guard()
phase = sys.argv[1] if len(sys.argv)>1 else 'baseline'
if phase not in ('baseline','final','pilot_blockers_v1','full_batch_v1_baseline','full_batch_v1_general','full_batch_v1_micro','full_batch_v1_macro','full_batch_v1_final','blocked_25_v1','micro49_nash_fix_v1','micro49_unique_nash_v2'):
    raise ValueError('Unexpected phase')
scratch = contained(f'tmp/pdf_accessibility/full_batch_v1/regression/{phase}' if phase.startswith('full_batch_v1') else f'tmp/pdf_accessibility/{phase}/regression' if phase=='pilot_blockers_v1' else f'tmp/pdf_accessibility/repo_lock_v1/{phase}')
if phase=='blocked_25_v1':scratch=contained('tmp/pdf_accessibility/blocked_25_v1/regression')
if phase in ('micro49_nash_fix_v1','micro49_unique_nash_v2'):scratch=contained(f'tmp/pdf_accessibility/{phase}/regression')
scratch.mkdir(parents=True,exist_ok=True)
out = contained(f'validation_artifacts/pdf_accessibility/full_batch_v1/regression/{phase}' if phase.startswith('full_batch_v1') else f'validation_artifacts/pdf_accessibility/{phase}/regression' if phase=='pilot_blockers_v1' else f'validation_artifacts/pdf_accessibility/{phase}_regression')
if phase=='blocked_25_v1':out=contained('validation_artifacts/pdf_accessibility/blocked_25_v1/regression')
if phase in ('micro49_nash_fix_v1','micro49_unique_nash_v2'):out=contained(f'validation_artifacts/pdf_accessibility/{phase}/regression')
out.mkdir(parents=True,exist_ok=True)
runner = contained('build/faculty-build-composer/tests/run_active_composer_suite.js')
names = re.findall(r"'((?:run_)[^']+\.(?:js|mjs))'",runner.read_text(encoding='utf-8'))
env = os.environ.copy()
for key in list(env):
    if key.startswith('MQ_'):
        env.pop(key)
env.update({'TEMP':str(scratch),'TMP':str(scratch),'MQ_COMPOSER_TEST_OUTPUT_DIR':str(scratch),'MQ_SCOPE_COMPOSER_ROOT':str(contained('build/faculty-build-composer'))})
results = []
for name in names:
    path = contained('build/faculty-build-composer/tests/'+name)
    result = subprocess.run([r'C:\Program Files\nodejs\node.exe',str(path)],cwd=root,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf-8',errors='replace')
    (out/(name+'.log')).write_text(result.stdout,encoding='utf-8')
    results.append({'runner':name,'exitCode':result.returncode,'passed':result.returncode==0})
    print(('PASS ' if result.returncode==0 else 'FAIL ')+name,flush=True)
write_json(out/'results.json',{'task':'PDF_ACCESSIBILITY_BLOCKED_25_V1' if phase=='blocked_25_v1' else 'PDF_ACCESSIBILITY_FULL_BATCH_V1' if phase.startswith('full_batch_v1') else TASK,'phase':phase,'total':len(results),'passed':sum(r['passed'] for r in results),'results':results,'temporaryDirectory':str(scratch)})
