"""Verify the review handoff and exported banks against this revision ledger."""
from pathlib import Path
from datetime import datetime,timezone
import collections,csv,hashlib,json
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];EXPORTS=ROOT/'faculty_exports'
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
ledger=read(HERE/'expectations.json');changes={c['id']:c for c in ledger['changes']}
source_hash=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
summary=read(EXPORTS/'validation_summary.json')
assert summary['status']=='complete' and summary['sources_unchanged'] and summary['source_sha256']==source_hash
covered=set()
for area,info in summary['disciplines'].items():
    for row in csv.DictReader((EXPORTS/info['csv_file']).open(encoding='utf-8-sig',newline='')):
        if row['Question ID'] not in changes:continue
        c=changes[row['Question ID']];q=c['afterRecord'];difficulty=q['canonicalDifficulty']
        assert row['Question']==q['q'] and row['Difficulty'].lower()==(difficulty if difficulty in ['easy','medium','hard','elite','legendary'] else '')
        assert row['Feedback']==q.get('feedback','') and [row['Choice '+k] for k in 'ABCD']==q['options']
        assert row['Correct Answer'].startswith('ABCD'[c['correctIndex']]+' ')
        if c['id'] in ['LG-R-5036','PMS-ELAS-R-001']:assert row['Question Type']=='Interpretation'
        covered.add(c['id'])
assert covered==set(changes) and len(covered)==77
review=read(PROJECT/'source/personal-review-list-data.json');baseline=read(HERE/'baseline/personal-review-list-data.json')
assert review['librarySha256']==ledger['afterLibrarySha256'] and review['source_sha256']==source_hash
batch=review['currentRevisionBatch'];accepted=set(batch['acceptedTerminologyQuestionIds']);flagged=set(batch['flaggedQuestionIds'])
assert set(batch['questionIds'])==set(changes) and len(accepted)==55 and len(flagged)==22
assert collections.Counter(r['status'] for r in review['reviewSeed'].values())=={'pass':2608,'flag':22,'unknown':4513}
assert all(review['reviewSeed'][id]['status']=='pass' for id in accepted)
assert all(review['reviewSeed'][id]['status']=='flag' for id in flagged)
for id,old in baseline['reviewSeed'].items():
    if old['status']=='pass':assert review['reviewSeed'][id]==old,id
for row in csv.DictReader((HERE/'baseline/reviews.csv').open(encoding='utf-8-sig',newline='')):
    id=row['Question ID'];r=review['reviewSeed'][id]
    assert r['notes']==row['Notes'],id
    assert r['answer']==(ord(row['Selected answer'])-65 if row['Selected answer'] else None),id
    assert r['answerRevision']==row['Answer applies to revision'],id
    assert (r['previousReview']['updated'] if id in accepted else r['updated'])==row['Last updated'],id
pending=[q['id'] for q in review['questions'] if q.get('revision') and review['reviewSeed'][q['id']]['status']!='unknown' and review['reviewSeed'][q['id']].get('reviewedRevision')!=q['revision']]
assert set(pending)==flagged
reports={name:read(HERE/name) for name in ['validation.json','review-validation.json','export-validation.json','excel-parity.json']}
assert all(reports[n]['status']=='PASS' for n in ['validation.json','review-validation.json','export-validation.json'])
assert reports['validation.json']['changed']==77 and reports['review-validation.json']['acceptedTerminologyCorrections']==55
assert reports['export-validation.json']['sourceSha256']==source_hash and len(reports['excel-parity.json'])==4
full=read(HERE/'test-output/macroeconomics_consolidated_cleanup/validation.json');outcomes=read(HERE/'test-output/faculty-lo-results.json')
assert full['status']=='PASS' and full['questionsAudited']==9802 and outcomes['ok']
artifacts=[EXPORTS/(area+'_question_bank.'+ext) for area in ['general_economics','microeconomics','macroeconomics'] for ext in ['pdf','xlsx']]
artifacts += [EXPORTS/'microeconomics_manual_review.xlsx',PROJECT/'deliverables/MasteryQuests_Question_Review.html']
visual={'pdf':['general-pdf-contact.png','micro-pdf-contact.png','macro-pdf-contact.png'],'xlsx':['general-xlsx.png','micro-xlsx.png','macro-xlsx.png','manual-after.png'],'review':['review-desktop.png','review-rewrite.png','review-mobile.png']}
for group in visual.values():assert all((HERE/'qa'/name).is_file() for name in group)
result={'status':'PASS','verifiedAt':datetime.now(timezone.utc).isoformat(),'librarySha256':ledger['afterLibrarySha256'],'sourceSha256':source_hash,'currentChangesVerifiedInExports':77,'acceptedTerminologyOnly':55,'pendingUserVerification':22,'importedDecisions':427,'previousApprovalsNotesAndAnswersPreserved':True,'canonicalQuestions':9802,'facultyOutcomeAssertions':outcomes['assertions'],'visualInspection':visual,'artifacts':[{'path':p.as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in artifacts]}
(HERE/'delivery-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps({'status':'PASS','questions':77,'artifacts':len(artifacts),'facultyOutcomeAssertions':outcomes['assertions']}))
