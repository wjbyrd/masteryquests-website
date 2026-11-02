from pathlib import Path
from datetime import datetime,timezone
from collections import Counter
import copy,csv,json,hashlib,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
source=PROJECT/'source/personal-review-list-data.json';raw=source.read_bytes();data=read(HERE/'baseline/personal-review-list-data.json');original=copy.deepcopy(data)
ledger=read(HERE/'expectations.json');changes={c['id']:c for c in ledger['changes']};rows=list(csv.DictReader((HERE/'baseline/reviews.csv').open(encoding='utf-8-sig',newline='')))
statuses={'Reviewed — pass':'pass','Reviewed — flag':'flag','Not yet marked':'unknown','Previously reviewed':'previous'}
reasons={'Rewrite awkward or compressed wording.':'wording','Balance answer-choice lengths.':'length','Improve distractors / remove answer clues.':'distractors','Check the answer or calculation.':'answer','Clarify assumptions / ambiguous answers.':'assumptions','Improve the explanation.':'explanation','Fix the graph or its labels.':'graph','Reconsider difficulty or course scope.':'difficulty','Check for a duplicate question.':'duplicate'}
imported=[]
for row in rows:
    id=row['Question ID'];prior=data['reviewSeed'][id]
    r=dict(status=statuses[row['Review status']],answer=ord(row['Selected answer'])-65 if row['Selected answer'] else None,notes=row['Notes'],reasons=[reasons[v] for v in row['Flag reasons'].split(' | ') if v],updated=row['Last updated'],reviewedRevision=row['Review applies to revision'],answerRevision=row['Answer applies to revision'])
    if 'previousReview' in prior:r['previousReview']=prior['previousReview']
    if r['updated']>=prior['updated']:
        if r!=prior:imported.append(id)
        data['reviewSeed'][id]=r
assert len(imported)==427
imported_seed=copy.deepcopy(data['reviewSeed']);updated=datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z');auto_accepted=[];flags=[]
for row in data['questions']:
    id=row['id']
    if id not in changes:continue
    c=changes[id];q=c['afterRecord'];old=c['beforeRecord'];assert row['q']==old
    row['previous']={'stem':old['q'],'options':old['options'],'answer':c['correctIndex'],'feedback':old.get('feedback',''),'difficulty':old.get('canonicalDifficulty',old.get('difficulty','unknown')),'topic':row['topic'],'role':old['instructionalRole']}
    row['q']=q;row['answer_index']=c['correctIndex'];row['revision']='repair-20261102-'+hashlib.sha256(json.dumps(q,sort_keys=True).encode()).hexdigest()[:12];row['revision_reason']=c['reason']
    r=data['reviewSeed'][id]
    if r['status']=='pass':
        assert updated>r['updated'];assert not r.get('previousReview')
        r['previousReview']=copy.deepcopy(r);r['reviewedRevision']=row['revision'];r['updated']=updated;auto_accepted.append(id)
    else:assert r['status']=='flag';flags.append(id)
assert len(auto_accepted)==55 and len(flags)==22
data['revisionBatchHistory'].append(data['currentRevisionBatch'])
data['currentRevisionBatch']={'id':'repair-review-20261102','questionIds':list(changes),'count':77,'flaggedQuestionIds':flags,'acceptedTerminologyQuestionIds':auto_accepted,'acceptedTerminologyReason':'The instructor passed these questions. Only the requested learner-to-student terminology preference was applied: 51 noted questions and four additional newly passed questions using the same wording.'}
data['reviewReconciliations'].append({'source':'MasteryQuests-review-results(16).csv','newDecisions':427,'pass':405,'flag':22,'acceptedTerminologyCorrections':55})
libpath=ROOT/'build/faculty-build-composer/data/composer_library.js';data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256(libpath.read_bytes()).hexdigest()
for id,r in data['reviewSeed'].items():
    if id not in auto_accepted:assert r==imported_seed[id]
    else:
        assert r['previousReview']==imported_seed[id]
        for k in ['status','answer','answerRevision','notes','reasons']:assert r[k]==imported_seed[id][k]
pending=[q['id'] for q in data['questions'] if q.get('revision') and data['reviewSeed'][q['id']]['status']!='unknown' and data['reviewSeed'][q['id']].get('reviewedRevision')!=q['revision']]
assert set(pending)==set(flags)
for id,r in original['reviewSeed'].items():
    if r['status']=='pass':assert data['reviewSeed'][id]==r
t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
def replace(old,new):
    global t
    assert t.count(old)==1,old
    t=t.replace(old,new)
replace('All 189 revisions are accepted. Continue with Medium questions not yet marked. Your earlier approvals, notes, and review history are preserved.','Your latest export adds 427 reviews. The 55 passed questions receiving terminology edits now use “student” and remain accepted. The 22 flagged questions are updated and ready to verify. Your earlier approvals and notes are preserved.')
replace('<button id="continueMedium" class="primary">Continue Medium review</button>', '<button id="continueMedium">Continue Medium review</button>')
replace('<button id="verifyElite">Review updated questions</button>', '<button id="verifyElite" class="primary">Review updated questions</button>')
replace("difficultyQueue('medium','unknown');\n}\n</script>","revisionQueue();\n}\n</script>")
replace(" if(needsVerification(q,r))s+=", " if(q.previous?.role&&q.previous.role!==q.role)s+='<p><strong>Role changed:</strong> '+esc(roleLabels[q.previous.role]||q.previous.role)+' → '+esc(roleLabels[q.role]||q.role)+'.</p>';\n if(needsVerification(q,r))s+=")
assert source.read_bytes()==raw,'Concurrent review source update'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');(PROJECT/'source/review-template.html').write_text(t,encoding='utf8');(HERE/'review-template.html').write_text(t,encoding='utf8')
(HERE/'build-review-html.py').write_bytes((PROJECT/'source/build-review-html.py').read_bytes())
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
remaining=Counter(q['q']['instructionalRole']+' / '+q['q']['canonicalDifficulty'] for q in data['questions'] if data['reviewSeed'][q['id']]['status']=='unknown' and q['q']['instructionalRole'] in ['repair','repairSeed'])
report={'status':'PASS','importedReviews':427,'newPass':405,'newFlags':22,'acceptedTerminologyCorrections':55,'pendingRevisionVerification':len(pending),'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'remainingUnmarkedRepair':dict(remaining),'librarySha256':data['librarySha256']}
(HERE/'review-import.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8');print(json.dumps(report))
