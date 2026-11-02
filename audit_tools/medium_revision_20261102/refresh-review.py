"""Import the latest instructor export and present the 189 revised questions."""
from pathlib import Path
import json,hashlib,csv,copy,collections
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
source=PROJECT/'source/personal-review-list-data.json';raw=source.read_bytes()
data=read(HERE/'baseline/personal-review-list-data.json');original=copy.deepcopy(data['reviewSeed'])
ledger=read(HERE/'expectations.json');changes={c['id']:c for c in ledger['changes']}
libpath=ROOT/'build/faculty-build-composer/data/composer_library.js'
lib=json.loads(libpath.read_text(encoding='utf8').removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
canonical={}
def walk(x):
    if isinstance(x,dict):
        if 'id' in x and 'q' in x:canonical[str(x['id'])]=x
        for v in x.values():walk(v)
    elif isinstance(x,list):
        for v in x:walk(v)
walk(lib['concepts'])
statuses={'Reviewed — pass':'pass','Reviewed — flag':'flag','Not yet marked':'unknown','Previously reviewed':'previous'}
reasons={'Rewrite awkward or compressed wording.':'wording','Balance answer-choice lengths.':'length','Improve distractors / remove answer clues.':'distractors','Check the answer or calculation.':'answer','Clarify assumptions / ambiguous answers.':'assumptions','Improve the explanation.':'explanation','Fix the graph or its labels.':'graph','Reconsider difficulty or course scope.':'difficulty','Check for a duplicate question.':'duplicate'}
imported=[]
for row in csv.DictReader((HERE/'baseline/reviews.csv').open(encoding='utf-8-sig',newline='')):
    id=row['Question ID'];prior=data['reviewSeed'][id]
    incoming=dict(status=statuses[row['Review status']],answer=ord(row['Selected answer'])-65 if row['Selected answer'] else None,notes=row['Notes'],reasons=[reasons[r] for r in row['Flag reasons'].split(' | ') if r],updated=row['Last updated'],reviewedRevision=row['Review applies to revision'],answerRevision=row['Answer applies to revision'])
    if 'previousReview' in prior:incoming['previousReview']=prior['previousReview']
    if incoming['updated']>=prior['updated']:
        if incoming!=prior:imported.append(id)
        data['reviewSeed'][id]=incoming
seed=copy.deepcopy(data['reviewSeed'])
assert collections.Counter(r['status'] for r in seed.values())=={'pass':2014,'flag':189,'unknown':4940}
for row in data['questions']:
    id=str(row['id']);q=canonical[id]
    if id not in changes:assert row['q']==q,id
    else:
        c=changes[id];old=c['beforeRecord'];row['answer_index']=c['correctIndex']
        row['revision']='medium-20261102-'+hashlib.sha256(json.dumps(q,sort_keys=True).encode()).hexdigest()[:12]
        row['previous']=dict(stem=old['q'],options=old['options'],answer=c['correctIndex'],feedback=old.get('feedback',''),difficulty=old.get('canonicalDifficulty',old.get('difficulty','unknown')),topic=row['topic'])
        if old.get('image') and old.get('image')!=q.get('image'):row['previous']['graph']=(ROOT/'build/faculty-build-composer/data'/old['image']).as_uri()
        if 'primaryConceptId' in c['fields']:
            cid=q['subtopicIds'][0] if q.get('subtopicIds') else q['primaryConceptId']
            row['topic']=lib['concepts'][cid]['title']
        row['revision_reason']=c['reason'];row['q']=q
        row['graph_url']=(ROOT/'build/faculty-build-composer/data'/q['image']).as_uri() if q.get('image') else ''
data['librarySha256']=lib['librarySha256'];data['source_sha256']=hashlib.sha256(libpath.read_bytes()).hexdigest()
data.setdefault('revisionBatchHistory',[]).append(data['currentRevisionBatch'])
data['currentRevisionBatch']={'id':'medium-revision-20261102','questionIds':list(changes),'count':189}
data.setdefault('reviewReconciliations',[]).append({'source':'MasteryQuests-review-results(15).csv','sourceSha256':hashlib.sha256((HERE/'baseline/reviews.csv').read_bytes()).hexdigest(),'newDecisions':533,'pass':344,'flag':189,'appliedRevisions':189})
assert data['reviewSeed']==seed and len(data['questions'])==7143
pending=[r['id'] for r in data['questions'] if r.get('revision') and seed[r['id']]['status']!='unknown' and seed[r['id']].get('reviewedRevision')!=r['revision']]
assert set(pending)==set(changes)
for id in data['eliteReviewApproval']['ids']:assert seed[id]==original[id],id
for id in data['revisionBatchHistory'][-1]['questionIds']:assert seed[id]==original[id],id
t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
def replace(old,new):
    global t
    assert t.count(old)==1,old
    t=t.replace(old,new)
replace('All 54 updates from your latest flagged reviews are accepted. Continue with Medium questions not yet marked. Your earlier approvals, notes, and review history are preserved.','Your 189 flagged questions have been updated using your Medium review notes. Review the changes across all difficulty levels, or continue with unmarked Medium questions. Your approvals, notes, and review history are preserved.')
replace('<button id="continueMedium" class="primary">Continue Medium review</button><button id="verifyElite">Review updated questions</button>','<button id="verifyElite" class="primary">Review updated questions</button><button id="continueMedium">Continue Medium review</button>')
replace("difficultyQueue('medium','unknown');\n}","revisionQueue();\n}")
replace('max-height:380px;object-fit:contain','max-height:520px;object-fit:contain')
replace(" if(needsVerification(q,r))s+=", " if(q.previous?.topic&&q.previous.topic!==q.topic)s+='<p><strong>Topic changed:</strong> '+esc(q.previous.topic)+' → '+esc(q.topic)+'.</p>';\n if(needsVerification(q,r))s+=")
assert source.read_bytes()==raw,'Concurrent review source update'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(PROJECT/'source/review-template.html').write_text(t,encoding='utf8');(HERE/'review-template.html').write_text(t,encoding='utf8')
(HERE/'build-review-html.py').write_bytes((HERE/'baseline/build-review-html.py').read_bytes())
result={'updated':189,'pendingReverification':len(pending),'importedChangedRecords':len(imported),'statusCounts':dict(collections.Counter(r['status'] for r in seed.values())),'librarySha256':lib['librarySha256']}
(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
