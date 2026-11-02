"""Record the instructor's approval of the 189 revisions and resume Medium."""
from pathlib import Path
from datetime import datetime,timezone
from collections import Counter
import copy,hashlib,json,shutil,subprocess,sys

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
SOURCE=PROJECT/'source';source=SOURCE/'personal-review-list-data.json';template=SOURCE/'review-template.html'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
raw=source.read_bytes();template_raw=template.read_bytes();data=json.loads(raw.decode('utf-8-sig'));before=copy.deepcopy(data)
batch=data['currentRevisionBatch'];ledger=read(ROOT/'audit_tools/medium_revision_20261102/expectations.json')
assert batch['id']=='medium-revision-20261102' and batch['count']==189 and 'approval' not in batch
ids=set(batch['questionIds']);assert ids=={c['id'] for c in ledger['changes']}
assert data['librarySha256']==ledger['afterLibrarySha256']
questions={q['id']:q for q in data['questions']};records=data['reviewSeed']
approved_at=datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z')
for id in ids:
    r=records[id];q=questions[id]
    assert r['status']=='flag' and q['revision'].startswith('medium-20261102-')
    assert approved_at>r['updated'] and not r.get('previousReview')
    r['previousReview']=copy.deepcopy(r)
    r.update(status='pass',reviewedRevision=q['revision'],updated=approved_at)
batch['approval']={'approvedAt':approved_at,'count':189,'statement':'Go ahead and mark these revisions as accepted so I can continue reviewing the remaining medium questions.'}
for id,r in records.items():
    if id not in ids:assert r==before['reviewSeed'][id]
    else:
        old=before['reviewSeed'][id]
        assert r['previousReview']==old
        for field in ['notes','reasons','answer','answerRevision']:assert r[field]==old[field]
assert data['questions']==before['questions']
pending=[q['id'] for q in data['questions'] if q.get('revision') and records[q['id']]['status']!='unknown' and records[q['id']].get('reviewedRevision')!=q['revision']]
assert not pending
text=template_raw.decode('utf8').replace('\r\n','\n')
replacements=[
 ('Your 189 flagged questions have been updated using your Medium review notes. Review the changes across all difficulty levels, or continue with unmarked Medium questions. Your approvals, notes, and review history are preserved.','All 189 revisions are accepted. Continue with Medium questions not yet marked. Your earlier approvals, notes, and review history are preserved.'),
 ('<button id="verifyElite" class="primary">Review updated questions</button><button id="continueMedium">Continue Medium review</button>','<button id="continueMedium" class="primary">Continue Medium review</button><button id="verifyElite">Review updated questions</button>'),
 ("revisionQueue();\n}\n</script>","difficultyQueue('medium','unknown');\n}\n</script>")
]
for old,new in replacements:assert text.count(old)==1; text=text.replace(old,new)
baseline=HERE/'baseline';baseline.mkdir(exist_ok=True)
for name in ['personal-review-list-data.json','review-template.html','build-review-html.py']:
    assert not (baseline/name).exists(),'Baseline already captured'
    shutil.copy2(SOURCE/name,baseline/name)
assert source.read_bytes()==raw and template.read_bytes()==template_raw,'Concurrent review-source update'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
template.write_text(text,encoding='utf8');(HERE/'review-template.html').write_text(text,encoding='utf8')
subprocess.run([sys.executable,str(SOURCE/'build-review-html.py')],check=True)
delivery=read(ROOT/'audit_tools/medium_revision_20261102/delivery-verification.json')
assert hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()==delivery['sourceSha256']
for a in delivery['artifacts']:
    p=Path(a['path'])
    if p.suffix in ['.pdf','.xlsx']:assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256']
medium=Counter(records[q['id']]['status'] for q in data['questions'] if q['q'].get('canonicalDifficulty')=='medium')
assert medium=={'unknown':1644,'pass':598}
report={'status':'PASS','approval':batch,'reviewStatusCounts':dict(Counter(r['status'] for r in records.values())),'mediumReviewQueue':dict(medium),'defaultDifficulty':'medium','defaultStatus':'unknown','pendingRevisionVerification':0,'otherReviewRecordsPreserved':len(records)-len(ids),'notesAndAnswerHistoryPreserved':True,'canonicalBankAndSevenPdfExcelArtifactsUnchanged':True,'librarySha256':data['librarySha256'],'reviewDataSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'reviewHtmlSha256':hashlib.sha256((PROJECT/'deliverables/MasteryQuests_Question_Review.html').read_bytes()).hexdigest()}
(HERE/'acceptance.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps({'status':'PASS','accepted':189,'pendingRevisionVerification':0,'mediumReviewQueue':dict(medium),'notesAndAnswerHistoryPreserved':True}))
