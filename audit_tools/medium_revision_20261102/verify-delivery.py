"""Reconcile every changed record and final artifact with the current library."""
from pathlib import Path
import csv,hashlib,json,collections
from datetime import datetime,timezone
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];EXPORTS=ROOT/'faculty_exports'
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
ledger=read(HERE/'expectations.json');changes={c['id']:c for c in ledger['changes']}
summary=read(EXPORTS/'validation_summary.json');source_hash=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert summary['status']=='complete' and summary['sources_unchanged'] and summary['source_sha256']==source_hash
covered=set();topic_rows={}
for area,info in summary['disciplines'].items():
    for row in csv.DictReader((EXPORTS/info['csv_file']).open(encoding='utf-8-sig',newline='')):
        if row['Question ID'] not in changes:continue
        c=changes[row['Question ID']];q=c['afterRecord']
        assert row['Question']==q['q'] and row['Difficulty'].lower()==q['canonicalDifficulty']
        assert row['Feedback']==q.get('feedback','') and [row['Choice '+k] for k in 'ABCD']==q['options']
        assert row['Correct Answer'].startswith('ABCD'[c['correctIndex']]+' ')
        if 'primaryConceptId' in c['fields']:topic_rows[c['id']]=row['Topic']
        covered.add(c['id'])
assert covered==set(changes) and len(topic_rows)==12
review=read(PROJECT/'source/personal-review-list-data.json');baseline=read(HERE/'baseline/personal-review-list-data.json')
assert review['librarySha256']==ledger['afterLibrarySha256'] and set(review['currentRevisionBatch']['questionIds'])==set(changes)
assert all(review['reviewSeed'][id]['status']=='flag' for id in changes)
assert collections.Counter(r['status'] for r in review['reviewSeed'].values())=={'pass':2014,'flag':189,'unknown':4940}
for id,old in baseline['reviewSeed'].items():
    if old['status']=='pass':assert review['reviewSeed'][id]==old,id
for row in csv.DictReader((HERE/'baseline/reviews.csv').open(encoding='utf-8-sig',newline='')):
    r=review['reviewSeed'][row['Question ID']];assert r['notes']==row['Notes'] and r['updated']==row['Last updated']
reports={name:read(HERE/name) for name in ['validation.json','review-validation.json','export-validation.json','excel-parity.json']}
assert all(reports[n]['status']=='PASS' for n in ['validation.json','review-validation.json','export-validation.json'])
assert len(reports['excel-parity.json'])==4
full=read(HERE/'test-output/macroeconomics_consolidated_cleanup/validation.json');outcomes=read(HERE/'test-output/faculty-lo-results.json');easy=read(ROOT/'audit_tools/remaining_easy_completion_20261101/validation.json')
assert full['status']=='PASS' and full['questionsAudited']==9802 and outcomes['ok'] and easy['status']=='PASS' and easy['remainingEasyShortfalls']==0
artifacts=[EXPORTS/(area+'_question_bank.'+ext) for area in ['general_economics','microeconomics','macroeconomics'] for ext in ['pdf','xlsx']]
artifacts += [EXPORTS/'microeconomics_manual_review.xlsx',PROJECT/'deliverables/MasteryQuests_Question_Review.html']
visual={'pdf':['general-pdf-contact.png','micro-pdf-contact.png','macro-pdf-contact.png'],'xlsx':['general-xlsx.png','micro-xlsx.png','macro-xlsx.png','manual-after.png'],'review':['review-desktop.png','review-graph.png','review-mobile-table.png']}
for group in visual.values():assert all((HERE/'qa'/name).is_file() for name in group)
result={'status':'PASS','verifiedAt':datetime.now(timezone.utc).isoformat(),'librarySha256':ledger['afterLibrarySha256'],'sourceSha256':source_hash,'currentChangesVerifiedInExports':len(covered),'movedTopicExportLabels':topic_rows,'pendingUserVerification':189,'importedMediumDecisions':533,'previousApprovalsAndNotesPreserved':True,'canonicalQuestions':full['questionsAudited'],'facultyOutcomeAssertions':outcomes['assertions'],'easyShortfalls':0,'visualInspection':visual,'artifacts':[{'path':p.as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in artifacts]}
(HERE/'delivery-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps({'status':'PASS','questions':189,'artifacts':len(artifacts),'facultyOutcomeAssertions':outcomes['assertions']}))
