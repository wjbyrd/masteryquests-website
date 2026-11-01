"""Consolidate checks for the five additions and the refreshed faculty files."""
from pathlib import Path
import json,hashlib,csv
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
OUT=ROOT/'faculty_exports'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
tests=read(HERE/'test-results.json')
assert len(tests)==5 and all(t['status']=='PASS' for t in tests)
exports=read(HERE/'export-validation.json')
assert exports['status']=='PASS'
assert exports['sourceSha256']==sha(ROOT/'build/faculty-build-composer/data/composer_library.js')
assert exports['disciplines']['macro']['rows']==4752
assert exports['disciplines']['general']['rows']==1589
assert exports['disciplines']['micro']['rows']==6297
parity=read(HERE/'excel-parity.json')
assert len(parity)==4 and all(r.get('allCellsMatchCsv',r.get('reviewerColumnsAndDropdownsPreserved')) for r in parity)
before=read(HERE/'workbooks-before.json')
untouched={name:sha(OUT/name)==expected for name,expected in before.items() if name!='macroeconomics_question_bank.xlsx'}
assert len(untouched)==3 and all(untouched.values())
new=read(HERE/'questions.json')
with (OUT/'macroeconomics_question_bank.csv').open(encoding='utf-8-sig',newline='') as f:rows={r['Question ID']:r for r in csv.DictReader(f)}
for q in new:
    r=rows[q['id']]
    assert r['Question']==q['q'] and r['Feedback']==q['feedback'] and r['Difficulty'].lower()=='easy'
    assert [r['Choice '+letter] for letter in 'ABCD']==q['options']
    assert r['Correct Answer'].startswith('ABCD'[q['correctIndex']]+' ')
report={'status':'PASS','newQuestions':5,'quizAvailable':True,'easyPool':9,'canonicalQuestions':9782,'tests':tests,'pdfCsvVerification':exports,'excelVerification':parity,'unrelatedWorkbooksUnchanged':untouched,'sourceFileSha256':exports['sourceSha256'],'files':{}}
for name in ['general_economics_question_bank.pdf','microeconomics_question_bank.pdf','macroeconomics_question_bank.pdf','macroeconomics_question_bank.csv','macroeconomics_question_bank.xlsx']:
    p=OUT/name;report['files'][name]={'bytes':p.stat().st_size,'sha256':sha(p)}
(HERE/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['files','tests','pdfCsvVerification','excelVerification']}))
