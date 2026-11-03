from pathlib import Path
from collections import Counter
import copy,json,hashlib,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
source=PROJECT/'source/personal-review-list-data.json';raw=source.read_bytes();data=read(HERE/'baseline/personal-review-list-data.json');original=copy.deepcopy(data)
ledger=read(HERE/'expectations.json');changes={c['id']:c for c in ledger['changes']};byid={r['id']:r for r in data['questions']}
for identity,c in changes.items():
    row=byid[identity];old=c['beforeRecord'];q=c['afterRecord'];assert row['q']==old,identity
    assert data['reviewSeed'][identity]['status']=='unknown'
    if row.get('revision'):row.setdefault('revisionHistory',[]).append({k:copy.deepcopy(row[k]) for k in ['revision','previous','revision_reason'] if k in row})
    row['previous']={'stem':old['q'],'options':old['options'],'answer':c['correctIndex'],'feedback':old.get('feedback',''),'difficulty':old['canonicalDifficulty'],'topic':row['topic'],'role':old['instructionalRole']}
    if row['graph_url']:row['previous']['graph']=row['graph_url']
    row['q']=q;row['answer_index']=c['correctIndex'];row['revision']='medium-editorial-20261102-'+hashlib.sha256(json.dumps(q,sort_keys=True).encode()).hexdigest()[:12];row['revision_reason']=c['reason']
for identity,r in original['reviewSeed'].items():assert data['reviewSeed'][identity]==r
for row in original['questions']:
    if row['id'] not in changes:assert byid[row['id']]==row
data.setdefault('revisionBatchHistory',[]).append(data['currentRevisionBatch'])
data['currentRevisionBatch']={'id':'medium-editorial-20261102','questionIds':list(changes),'count':len(changes),'audited':ledger['audited'],'retained':ledger['retained'],'addedToQueue':[],'accepted':False,'scope':'Editorial pass over the remaining unmarked Medium questions in the current queue. Already approved and previously excluded Medium questions are unchanged. No difficulty or role changes.'}
data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest();data['current']=9802;data['known']=9802-len(data['questions']);data['unknown']=len(data['questions'])
t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
def replace(a,b):
    global t
    assert t.count(a)==1,a
    t=t.replace(a,b)
replace('640 Hard questions have updated wording and are ready for review. Difficulty levels are unchanged. Your Legendary revisions and earlier reviews, answers, and notes are preserved.',f'{len(changes):,} remaining Medium questions have updated wording and are ready for review. Difficulty levels are unchanged. Your approved questions, earlier notes, and pending Hard and Legendary revisions are preserved.')
replace('<option value="hardPending">','<option value="mediumPending">Medium revisions — not yet reviewed</option><option value="hardPending">')
replace('<button id="reviewHardRevisions" class="primary">','<button id="reviewMediumRevisions" class="primary">Review Medium revisions</button><button id="reviewMedium">All Medium questions</button><button id="reviewHardRevisions">')
replace('Review Hard revisions opens the updated Hard questions awaiting your review. Review Legendary revisions still opens your pending Legendary revisions. Both include revised questions returned from earlier exclusions.','Review Medium revisions opens the updated Medium questions awaiting your review. Continue Medium review opens all unmarked Medium questions. The Hard and Legendary revision buttons still open those pending versions.')
replace("$('status').value==='hardPending'?","$('status').value==='mediumPending'?(q.revision.startsWith('medium-editorial-20261102-')&&state[q.id]?.reviewedRevision!==q.revision):$('status').value==='hardPending'?")
replace("$('reviewHardRevisions').onclick=","$('reviewMediumRevisions').onclick=()=>difficultyQueue('medium','mediumPending');\n$('reviewMedium').onclick=()=>difficultyQueue('medium','');\n$('reviewHardRevisions').onclick=")
replace("difficultyQueue('hard','hardPending');\n}\n</script>","difficultyQueue('medium','mediumPending');\n}\n</script>")
assert source.read_bytes()==raw==(HERE/'baseline/personal-review-list-data.json').read_bytes(),'Review source changed since baseline; reconcile before writing'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');(PROJECT/'source/review-template.html').write_text(t,encoding='utf8');(HERE/'review-template.html').write_text(t,encoding='utf8');(HERE/'build-review-html.py').write_bytes((PROJECT/'source/build-review-html.py').read_bytes())
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
result={'status':'PASS','reviewQuestions':len(data['questions']),'mediumQuestionsInQueue':sum(r['q'].get('canonicalDifficulty')=='medium' for r in data['questions']),'revisedQuestions':len(changes),'addedRevisedQuestions':0,'newVersionsAccepted':0,'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'preservedReviewRecords':len(original['reviewSeed']),'allPriorRecordsPreserved':True,'batchApprovalsPreserved':data.get('batchApprovals')==original.get('batchApprovals'),'librarySha256':data['librarySha256']}
(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
