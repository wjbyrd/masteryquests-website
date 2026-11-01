"""Combine the completed regression runs and independently verified exports."""
from pathlib import Path
import hashlib, json

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
ledger=read(HERE/'expectations.json')

def passed_log(name, field='status', value='PASS'):
    lines=(HERE/name).read_text(encoding='utf-8-sig').splitlines()
    records=[json.loads(line) for line in lines if line.startswith('{')]
    assert records and records[-1][field]==value,name
    return records[-1]

focused=passed_log('validation-final.log')
comprehensive=passed_log('comprehensive-final.log')
remediation=passed_log('remediation-final.log')
outcomes=passed_log('outcomes.log','ok',True)
results=read(HERE/'suite-results.json')
for row in results:
    if row['runner']=='run_faculty_validation_remediation.js':
        row.update(initialStatus=row['status'],status='PASS',exitCode=0,
                   rerunEvidence='remediation-final.log',
                   note='Historical content is restored; current registry and manifest are checked against the current library.')
for runner,evidence in [
    ('run_easy_pool_review_validation.cjs','validation-final.log'),
    ('run_question_bank_comprehensive_validation.mjs','comprehensive-final.log'),
    ('run_faculty_outcome_validation.js','outcomes.log')
]:
    if not any(r['runner']==runner for r in results):
        results.append(dict(runner=runner,status='PASS',evidence=evidence))
assert len(results)==len({r['runner'] for r in results})==42
failed=[r['runner'] for r in results if r['status']!='PASS']
assert failed==['run_phase15_production_hardening_validation.js'],failed
assert 'Ran 25 tests' in (HERE/'exporter-tests.log').read_text()
assert (HERE/'exporter-tests.log').read_text().strip().endswith('OK')

export=read(HERE/'export-validation.json')
assert export['status']=='PASS'
source=ROOT/'build/faculty-build-composer/data/composer_library.js'
assert export['sourceSha256']==sha(source)
excel=read(HERE/'excel-parity.json')
assert len(excel)==4
assert all(r.get('allCellsMatchCsv',r.get('reviewerColumnsAndDropdownsPreserved')) for r in excel)
files=[]
for stem in ['general_economics_question_bank','microeconomics_question_bank','macroeconomics_question_bank']:
    for ext in ['pdf','csv','xlsx']:
        p=ROOT/'faculty_exports'/f'{stem}.{ext}'
        files.append(dict(file=p.name,bytes=p.stat().st_size,sha256=sha(p)))
for ext in ['csv','xlsx']:
    p=ROOT/'faculty_exports'/f'microeconomics_manual_review.{ext}'
    files.append(dict(file=p.name,bytes=p.stat().st_size,sha256=sha(p)))
report=dict(
    status='PASS_WITH_DOCUMENTED_BASELINE_FAILURE',
    librarySha256=ledger['afterLibrarySha256'],sourceFileSha256=sha(source),
    regressionPassed=41,regressionTotal=42,regressions=results,
    knownBaselineFailure='Untouched Labyrinth of Choice game version fails the existing Phase 1.5 version-pattern assertion; also documented in authoring/hybrid/README.md.',
    finalStemRefinements=['P62I-OLI-E-009','PM8-OLI-E-032','P62I-OLI-E-008','PM8-OLI-E-012'],
    finalReruns=['run_easy_pool_review_validation.cjs','run_question_bank_comprehensive_validation.mjs','run_faculty_validation_remediation.js'],
    focused=focused,comprehensive=comprehensive,facultyOutcomes=outcomes,
    exporterTestsPassed=25,pdfCsvVerification=export,excelVerification=excel,
    facultyFiles=files,
    websiteUpdatePageChanged=False
)
(HERE/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:report[k] for k in ['status','regressionPassed','regressionTotal','librarySha256']}))
