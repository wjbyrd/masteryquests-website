from pathlib import Path
from collections import Counter
import copy,csv,json,hashlib,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
source=PROJECT/'source/personal-review-list-data.json';raw=source.read_bytes();data=read(HERE/'baseline/personal-review-list-data.json');baseline=copy.deepcopy(data)
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
assert len(imported)==8 and all(id in changes and data['reviewSeed'][id]['status']=='pass' for id in imported)
updated=[]
for row in data['questions']:
    if row['id'] not in changes:continue
    c=changes[row['id']];assert row['q']==c['beforeRecord'];row['q']=c['afterRecord'];updated.append(row['id'])
assert set(updated)==set(imported)
for id,r in baseline['reviewSeed'].items():
    if id not in imported:assert data['reviewSeed'][id]==r
data.setdefault('roleChangesHistory',[]).append({'id':'repair-seed-activation-20261102','from':'repairSeed','to':'repair','questionIds':list(changes),'contentUnchanged':True,'authorizedByInstructor':True})
data['reviewReconciliations'].append({'source':'MasteryQuests-review-results(17).csv','newDecisions':8,'pass':8,'flag':0})
data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
pending=[q['id'] for q in data['questions'] if q.get('revision') and data['reviewSeed'][q['id']]['status']!='unknown' and data['reviewSeed'][q['id']].get('reviewedRevision')!=q['revision']]
assert len(pending)==22 and set(pending)==set(data['currentRevisionBatch']['flaggedQuestionIds'])
template=(HERE/'baseline/review-template.html').read_text(encoding='utf8');old='Your latest export adds 427 reviews. The 55 passed questions receiving terminology edits now use “student” and remain accepted. The 22 flagged questions are updated and ready to verify. Your earlier approvals and notes are preserved.';new='Your eight newly approved Repair seeds are accepted and now appear as Repair. All 15 seed questions in the full bank use regular Repair pools. The 22 earlier revisions remain ready to verify. Your approvals and notes are preserved.'
assert template.count(old)==1;template=template.replace(old,new)
template=template.replace('Question role identifies Repair, Bridge, and Repair seed items.','Question role identifies Repair and Bridge items.')
assert source.read_bytes()==raw,'Concurrent review update';source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');(PROJECT/'source/review-template.html').write_text(template,encoding='utf8');(HERE/'review-template.html').write_text(template,encoding='utf8');(HERE/'build-review-html.py').write_bytes((PROJECT/'source/build-review-html.py').read_bytes())
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
result={'status':'PASS','librarySha256':data['librarySha256'],'importedApprovals':8,'reviewQuestionsPromoted':8,'bankQuestionsPromoted':15,'pendingEarlierRevisionVerification':22,'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'unmarkedRepair':sum(r['q']['instructionalRole']=='repair' and data['reviewSeed'][r['id']]['status']=='unknown' for r in data['questions']),'unmarkedSeeds':0}
(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
