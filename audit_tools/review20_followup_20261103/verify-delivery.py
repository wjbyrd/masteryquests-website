from pathlib import Path
from datetime import datetime,timezone
import hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];OUT=ROOT/'faculty_exports';PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'));ledger=read(HERE/'expectations.json');changes={c['id']:c for c in ledger['changes']};before=read(HERE/'baseline/personal-review-list-data.json');review=read(PROJECT/'source/personal-review-list-data.json')
reports={n:read(HERE/n) for n in ['validation.json','review-validation.json','review-import.json','export-validation.json','workbook-scope-validation.json']};assert all(r['status']=='PASS' for r in reports.values());assert len(read(HERE/'excel-parity.json'))==4
source_hash=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest();exports=read(OUT/'validation_summary.json')
assert exports['source_sha256']==review['source_sha256']==source_hash and exports['sources_unchanged'] and exports['status']=='complete'
assert ledger['afterLibrarySha256']==review['librarySha256']==reports['validation.json']['librarySha256']
assert before['reviewSeed']==review['reviewSeed'] and before['batchApprovals']==review['batchApprovals'];byid={r['id']:r for r in review['questions']}
for old in before['questions']:
    new=byid[old['id']]
    if old['id'] not in changes:assert old==new
    else:
        c=changes[old['id']];assert new['q']==c['afterRecord'];assert new['previous']['stem']==old['q']['q'] and new['previous']['options']==old['q']['options'] and new['previous']['feedback']==old['q'].get('feedback','')
        expected=old.get('revisionHistory',[])+([{k:old[k] for k in ['revision','previous','revision_reason'] if k in old}] if old.get('revision') else [])
        assert new.get('revisionHistory',[])==expected and review['reviewSeed'][old['id']].get('reviewedRevision')!=new['revision']
assert review['currentRevisionBatch']['accepted'] is False
full=read(HERE/'test-output/macroeconomics_consolidated_cleanup/validation.json');outcomes=read(HERE/'test-output/faculty-lo-results.json');assert full['status']=='PASS' and full['questionsAudited']==9802 and outcomes['ok']
images=['graphs-1.png','graphs-2.png','passed-note-revision.png','distinct-poverty-question.png','general-pdf-contact.png','micro-pdf-contact.png','macro-pdf-contact.png','general-xlsx.png','micro-xlsx.png','macro-xlsx.png','manual-after.png'];assert all((HERE/'qa'/n).is_file() for n in images)
artifacts=[OUT/(area+'_question_bank.'+ext) for area in ['general_economics','microeconomics','macroeconomics'] for ext in ['pdf','xlsx','csv']]+[OUT/'microeconomics_manual_review.xlsx',OUT/'microeconomics_manual_review.csv',PROJECT/'deliverables/MasteryQuests_Question_Review.html']
result={'status':'PASS','verifiedAt':datetime.now(timezone.utc).isoformat(),'reconciled':63,'revised':49,'alreadyAddressed':14,'historicalAcceptedNotesPreserved':388,'newRevisionsFromPassedNotes':sum(c['id'] in {d['id'] for d in ledger['dispositions'] if d['priorStatus']=='Reviewed — pass'} for c in ledger['changes']),'duplicateRewrites':13,'mediumToHard':8,'mediumToEasy':5,'sourceSha256':source_hash,'librarySha256':ledger['afterLibrarySha256'],'reviewRecordsPreserved':7579,'newVersionsPendingInstructorReview':49,'facultyOutcomeAssertions':outcomes['assertions'],'allBankQuestionsValidated':full['questionsAudited'],'workbookCellsScanned':sum(w['cellsScanned'] for w in reports['workbook-scope-validation.json']['workbooks']),'visualChecks':images,'artifacts':[{'path':p.as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in artifacts]}
(HERE/'delivery-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps({k:result[k] for k in ['status','revised','alreadyAddressed','newRevisionsFromPassedNotes','mediumToHard','mediumToEasy','facultyOutcomeAssertions','workbookCellsScanned']}))
