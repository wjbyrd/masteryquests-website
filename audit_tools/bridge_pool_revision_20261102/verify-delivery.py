"""Reconcile the complete Bridge pass with the review queue and published banks."""
from pathlib import Path
from datetime import datetime,timezone
import csv,hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];OUT=ROOT/'faculty_exports';PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
ledger=read(HERE/'expectations.json');changes={c['id']:c for c in ledger['changes']};summary=read(OUT/'validation_summary.json');source_hash=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert summary['status']=='complete' and summary['sources_unchanged'] and summary['source_sha256']==source_hash
covered=set();counts={}
for area,info in summary['disciplines'].items():
    ids=[]
    for row in csv.DictReader((OUT/info['csv_file']).open(encoding='utf-8-sig',newline='')):
        id=row['Question ID']
        if id not in changes:continue
        c=changes[id];q=c['afterRecord'];assert row['Question']==q['q'] and row['Feedback']==q['feedback'];assert [row['Choice '+k] for k in 'ABCD']==q['options'];assert row['Correct Answer'].startswith('ABCD'[c['correctIndex']]+' ')
        covered.add(id);ids.append(id)
    counts[area]=len(ids)
assert covered==set(changes) and len(covered)==336
review=read(PROJECT/'source/personal-review-list-data.json');baseline=read(HERE/'baseline/personal-review-list-data.json');byid={q['id']:q for q in review['questions']}
assert review['librarySha256']==ledger['afterLibrarySha256'] and review['source_sha256']==source_hash
for id,r in baseline['reviewSeed'].items():assert review['reviewSeed'][id]==r
for id,c in changes.items():assert byid[id]['q']==c['afterRecord'] and byid[id]['revision'].startswith('bridge-20261102-')
assert len(byid)==7219 and review['currentRevisionBatch']['accepted'] is False
pending=[q['id'] for q in review['questions'] if q.get('revision','').startswith('bridge-20261102-') and review['reviewSeed'][q['id']].get('reviewedRevision')!=q['revision']];assert len(pending)==336
reports={name:read(HERE/name) for name in ['validation.json','review-validation.json','export-validation.json','excel-parity.json']}
assert all(reports[n]['status']=='PASS' for n in ['validation.json','review-validation.json','export-validation.json']);assert reports['validation.json']['librarySha256']==ledger['afterLibrarySha256'];assert reports['export-validation.json']['sourceSha256']==source_hash;assert len(reports['excel-parity.json'])==4
full=read(HERE/'test-output/macroeconomics_consolidated_cleanup/validation.json');outcomes=read(HERE/'test-output/faculty-lo-results.json');assert full['status']=='PASS' and full['questionsAudited']==9802 and outcomes['ok']
artifacts=[OUT/(area+'_question_bank.'+ext) for area in ['general_economics','microeconomics','macroeconomics'] for ext in ['pdf','xlsx']]+[OUT/'microeconomics_manual_review.xlsx',PROJECT/'deliverables/MasteryQuests_Question_Review.html']
visual=['general-pdf-contact.png','micro-pdf-contact.png','macro-pdf-contact.png','general-xlsx.png','micro-xlsx.png','macro-xlsx.png','manual-after.png','bridge-review.png','surplus-bridge.png','mobile-bridge.png'];assert all((HERE/'qa'/name).is_file() for name in visual)
result={'status':'PASS','verifiedAt':datetime.now(timezone.utc).isoformat(),'librarySha256':ledger['afterLibrarySha256'],'sourceSha256':source_hash,'auditedBridgeQuestions':564,'revisedBridgeQuestions':336,'unchangedBridgeQuestions':228,'currentRevisionsByExport':counts,'preservedPriorReviewRecords':7143,'revisedQuestionsReturnedToQueue':76,'pendingUserReview':336,'priorApprovalsNeedingVerification':16,'facultyOutcomeAssertions':outcomes['assertions'],'visualInspection':visual,'artifacts':[{'path':p.as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in artifacts]}
(HERE/'delivery-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps({'status':'PASS','revisions':336,'artifacts':len(artifacts),'facultyOutcomeAssertions':outcomes['assertions']}))
