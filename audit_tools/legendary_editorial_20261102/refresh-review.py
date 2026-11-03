from pathlib import Path
from collections import Counter
import copy,json,hashlib,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
source=PROJECT/'source/personal-review-list-data.json';raw=source.read_bytes();data=read(HERE/'baseline/personal-review-list-data.json');original=copy.deepcopy(data)
ledger=read(HERE/'expectations.json');inventory=read(HERE/'inventory.json');items={r['id']:r for r in inventory['items']};changes={c['id']:c for c in ledger['changes']};exports=read(HERE/'baseline/export-summary.json')
byid={r['id']:r for r in data['questions']};added=[]
for id,c in changes.items():
    if id not in byid:
        item=items[id];areas=[area for area,info in exports['disciplines'].items() if id in info['question_pages']];assert areas,id
        graph=None
        if c['beforeRecord'].get('image'):
            image=(ROOT/'build/faculty-build-composer/data'/c['beforeRecord']['image']).resolve();assert image.is_file(),image;graph=image.as_uri()
        row={'id':id,'q':c['beforeRecord'],'answer_index':c['correctIndex'],'areas':areas,'topic':item['topic'],'graph_url':graph}
        data['questions'].append(row);byid[id]=row;added.append(id)
        data['reviewSeed'][id]={'status':'unknown','answer':None,'notes':'','reasons':[],'updated':'','reviewedRevision':'','answerRevision':''}
    row=byid[id];old=c['beforeRecord'];q=c['afterRecord'];assert row['q']==old,id
    if row.get('revision'):row.setdefault('revisionHistory',[]).append({k:copy.deepcopy(row[k]) for k in ['revision','previous','revision_reason'] if k in row})
    row['previous']={'stem':old['q'],'options':old['options'],'answer':c['correctIndex'],'feedback':old.get('feedback',''),'difficulty':old['canonicalDifficulty'],'topic':row['topic'],'role':old['instructionalRole']}
    if row['graph_url']:row['previous']['graph']=row['graph_url']
    row['q']=q;row['answer_index']=c['correctIndex'];row['revision']='legendary-20261102-'+hashlib.sha256(json.dumps(q,sort_keys=True).encode()).hexdigest()[:12];row['revision_reason']=c['reason']
for id,r in original['reviewSeed'].items():assert data['reviewSeed'][id]==r,'Preserve prior reviews, notes, answers and history'
for row in original['questions']:
    if row['id'] not in changes:assert byid[row['id']]==row
data.setdefault('revisionBatchHistory',[]).append(data['currentRevisionBatch'])
data['currentRevisionBatch']={'id':'legendary-editorial-20261102','questionIds':list(changes),'count':len(changes),'audited':ledger['audited'],'retained':ledger['retained'],'addedToQueue':added,'accepted':False,'scope':'Editorial pass over the Legendary pool, using the full-pool screen, topic audit and repeated-family review. Revised earlier-excluded items return for final review; difficulty is unchanged.'}
data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest();data['current']=9802;data['known']=9802-len(data['questions']);data['unknown']=len(data['questions'])
t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
def replace(a,b):
    global t
    assert t.count(a)==1,a
    t=t.replace(a,b)
replace('All 336 Bridge revisions are accepted following your sampling review. Continue with Medium questions not yet marked, or revisit the Bridge pool. Your earlier reviews, answers, and notes are preserved.',f'{len(changes):,} Legendary questions have updated wording and are ready for your final review. Difficulty levels are unchanged. Your earlier reviews, answers, notes, and accepted Bridge batch are preserved.')
t=t.replace('7,219',f"{len(data['questions']):,}")
replace('<option value="bridgePending">','<option value="legendaryPending">Legendary revisions — not yet reviewed</option><option value="bridgePending">')
replace('<button id="continueMedium" class="primary">Continue Medium review</button>','<button id="reviewLegendaryRevisions" class="primary">Review Legendary revisions</button><button id="reviewLegendary">All Legendary questions</button><button id="continueMedium">Continue Medium review</button>')
replace('Bridge revisions awaiting review shows updated Bridge versions that still need review.', 'Review Legendary revisions opens the updated versions awaiting your review, including revised questions returned from earlier exclusions. Choose Reviewed — pass to accept a revision. Bridge revisions awaiting review shows updated Bridge versions that still need review.')
replace('The original queue is preserved, with 76 revised Bridge questions added back for verification. Other earlier documented reviews and the 25 approved easy additions remain outside it.',f'The original queue and prior Bridge additions are preserved, with {len(added)} revised Legendary questions returned for verification. Other earlier documented reviews and the approved easy additions remain outside it.')
replace("$('status').value==='bridgePending'?","$('status').value==='legendaryPending'?(q.revision.startsWith('legendary-20261102-')&&state[q.id]?.reviewedRevision!==q.revision):$('status').value==='bridgePending'?")
replace("$('continueMedium').onclick=()=>difficultyQueue('medium','unknown');","$('reviewLegendaryRevisions').onclick=()=>difficultyQueue('legendary','legendaryPending');\n$('reviewLegendary').onclick=()=>difficultyQueue('legendary','');\n$('continueMedium').onclick=()=>difficultyQueue('medium','unknown');")
replace("difficultyQueue('medium','unknown');\n}\n</script>","difficultyQueue('legendary','legendaryPending');\n}\n</script>")
assert source.read_bytes()==raw,'Concurrent review update'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');(PROJECT/'source/review-template.html').write_text(t,encoding='utf8');(HERE/'review-template.html').write_text(t,encoding='utf8');(HERE/'build-review-html.py').write_bytes((PROJECT/'source/build-review-html.py').read_bytes())
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
result={'status':'PASS','reviewQuestions':len(data['questions']),'legendaryQuestionsInQueue':sum(r['q'].get('canonicalDifficulty')=='legendary' for r in data['questions']),'revisedQuestions':len(changes),'addedRevisedQuestions':len(added),'newVersionsAccepted':0,'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'preservedReviewRecords':len(original['reviewSeed']),'allPriorRecordsPreserved':True,'batchApprovalsPreserved':data.get('batchApprovals')==original.get('batchApprovals'),'librarySha256':data['librarySha256']}
(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
