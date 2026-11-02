from pathlib import Path
from collections import Counter
import copy,csv,json,hashlib,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
source=PROJECT/'source/personal-review-list-data.json';raw=source.read_bytes();data=read(HERE/'baseline/personal-review-list-data.json');baseline=copy.deepcopy(data)
ledger=read(HERE/'expectations.json');change=ledger['changes'][0];rows=list(csv.DictReader((HERE/'baseline/reviews.csv').open(encoding='utf-8-sig',newline='')))
statuses={'Reviewed — pass':'pass','Reviewed — flag':'flag','Not yet marked':'unknown','Previously reviewed':'previous'}
reasons={'Rewrite awkward or compressed wording.':'wording','Balance answer-choice lengths.':'length','Improve distractors / remove answer clues.':'distractors','Check the answer or calculation.':'answer','Clarify assumptions / ambiguous answers.':'assumptions','Improve the explanation.':'explanation','Fix the graph or its labels.':'graph','Reconsider difficulty or course scope.':'difficulty','Check for a duplicate question.':'duplicate'}
imported=[]
for row in rows:
    id=row['Question ID'];prior=data['reviewSeed'][id]
    r=dict(status=statuses[row['Review status']],answer=ord(row['Selected answer'])-65 if row['Selected answer'] else None,notes=row['Notes'],reasons=[reasons[v] for v in row['Flag reasons'].split(' | ') if v],updated=row['Last updated'],reviewedRevision=row['Review applies to revision'],answerRevision=row['Answer applies to revision'])
    if 'previousReview' in prior:r['previousReview']=copy.deepcopy(prior['previousReview'])
    elif prior['status']=='flag' and r['status']=='pass':r['previousReview']=copy.deepcopy(prior)
    if r['updated']>=prior['updated']:
        if r!=prior:imported.append(id)
        data['reviewSeed'][id]=r
assert len(imported)==22 and set(imported)==set(data['currentRevisionBatch']['flaggedQuestionIds'])
assert all(data['reviewSeed'][id]['status']=='pass' for id in imported)
row=next(r for r in data['questions'] if r['id']==change['id']);q=change['beforeRecord'];assert row['q']==q
row['previous']={'stem':q['q'],'options':q['options'],'answer':change['correctIndex'],'feedback':q.get('feedback',''),'difficulty':q['canonicalDifficulty'],'topic':row['topic'],'role':'bridge'}
row['q']=change['afterRecord'];row['revision_reason']=change['reason']
for id,r in baseline['reviewSeed'].items():
    if id not in imported:assert data['reviewSeed'][id]==r
data['roleChangesHistory'].append({'id':'repair-review-acceptance-20261102','from':'bridge','to':'repair','questionIds':[change['id']],'contentUnchanged':True,'authorizedByInstructor':True})
data['reviewReconciliations'].append({'source':'MasteryQuests-review-results(18).csv','newDecisions':22,'pass':22,'flag':0})
data['currentRevisionBatch'].update(accepted=True,acceptedAt=max(data['reviewSeed'][id]['updated'] for id in imported),acceptedQuestionIds=data['currentRevisionBatch']['questionIds'],acceptedFlaggedQuestionIds=imported)
data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
pending=[q['id'] for q in data['questions'] if q.get('revision') and data['reviewSeed'][q['id']]['status']!='unknown' and data['reviewSeed'][q['id']].get('reviewedRevision')!=q['revision']]
assert pending==[]
template=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
replacements={
'Your eight newly approved Repair seeds are accepted and now appear as Repair. All 15 seed questions in the full bank use regular Repair pools. The 22 earlier revisions remain ready to verify. Your approvals and notes are preserved.':'All 22 revisions are accepted. The CPI inflation-rate question is back in Repair, as requested. Continue with Medium questions not yet marked. Your earlier approvals and notes are preserved.',
'<button id="continueMedium">Continue Medium review</button>':'<button id="continueMedium" class="primary">Continue Medium review</button>',
'<button id="verifyElite" class="primary">Review updated questions</button>':'<button id="verifyElite">Review updated questions</button>',
'revisionQueue();\n}\n</script>':"difficultyQueue('medium','unknown');\n}\n</script>"}
for old,new in replacements.items():assert template.count(old)==1,old;template=template.replace(old,new)
assert source.read_bytes()==raw,'Concurrent review update'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');(PROJECT/'source/review-template.html').write_text(template,encoding='utf8');(HERE/'review-template.html').write_text(template,encoding='utf8');(HERE/'build-review-html.py').write_bytes((PROJECT/'source/build-review-html.py').read_bytes())
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
result={'status':'PASS','librarySha256':data['librarySha256'],'importedApprovals':22,'returnedToRepair':change['id'],'pendingRevisions':0,'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'allPriorApprovalsPreserved':True,'priorFlagHistoryPreserved':True,'unmarkedMedium':sum(q['q']['canonicalDifficulty']=='medium' and data['reviewSeed'][q['id']]['status']=='unknown' for q in data['questions'])}
(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
