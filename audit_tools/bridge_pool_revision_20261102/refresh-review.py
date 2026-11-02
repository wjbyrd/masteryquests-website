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
        row={'id':id,'q':c['beforeRecord'],'answer_index':c['correctIndex'],'areas':areas,'topic':item['topic'],'graph_url':None}
        data['questions'].append(row);byid[id]=row;added.append(id)
        data['reviewSeed'][id]={'status':'unknown','answer':None,'notes':'','reasons':[],'updated':'','reviewedRevision':'','answerRevision':''}
    row=byid[id];old=c['beforeRecord'];q=c['afterRecord'];assert row['q']==old
    if row.get('revision'):
        row.setdefault('revisionHistory',[]).append({k:copy.deepcopy(row[k]) for k in ['revision','previous','revision_reason'] if k in row})
    row['previous']={'stem':old['q'],'options':old['options'],'answer':c['correctIndex'],'feedback':old.get('feedback',''),'difficulty':old.get('canonicalDifficulty',old.get('difficulty','unknown')),'topic':row['topic'],'role':old['instructionalRole']}
    row['q']=q;row['answer_index']=c['correctIndex'];row['revision']='bridge-20261102-'+hashlib.sha256(json.dumps(q,sort_keys=True).encode()).hexdigest()[:12];row['revision_reason']=c['reason']
assert len(added)==76
for id,r in original['reviewSeed'].items():assert data['reviewSeed'][id]==r,'Preserve all original decisions, notes, answers, timestamps and history'
for row in original['questions']:
    if row['id'] not in changes:assert byid[row['id']]==row
data.setdefault('revisionBatchHistory',[]).append(data['currentRevisionBatch'])
data['currentRevisionBatch']={'id':'bridge-pool-revision-20261102','questionIds':list(changes),'count':len(changes),'audited':564,'retained':228,'addedToQueue':added,'accepted':False,'scope':'All canonical Bridge questions; revised earlier-excluded questions return for verification.'}
data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest();data['current']=9802;data['known']=9802-len(data['questions']);data['unknown']=len(data['questions'])
pending=[q['id'] for q in data['questions'] if q.get('revision') and data['reviewSeed'][q['id']]['status']!='unknown' and data['reviewSeed'][q['id']].get('reviewedRevision')!=q['revision']]
t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
def replace(old,new):
    global t
    assert t.count(old)==1,old
    t=t.replace(old,new)
replace('All 22 revisions are accepted. The CPI inflation-rate question is back in Repair, as requested. Continue with Medium questions not yet marked. Your earlier approvals and notes are preserved.','The Bridge pool has been checked: 336 questions are updated and ready to review. Each revision focuses on a manageable application of the concept. Your earlier approvals, answers, and notes are preserved; review the new versions before accepting them.')
t=t.replace('7,143','7,219')
replace('<option value="needsVerification">','<option value="bridgePending">Bridge revisions — not yet reviewed</option><option value="needsVerification">')
replace('<button id="continueMedium" class="primary">Continue Medium review</button>','<button id="reviewBridgeRevisions" class="primary">Review Bridge revisions</button><button id="reviewBridge">All Bridge questions</button><button id="continueMedium">Continue Medium review</button>')
replace('Question role identifies Repair and Bridge items. Use Review support questions to open unmarked items with unspecified difficulty.','Review Bridge revisions opens the 336 updated questions, including previously excluded questions that changed. All Bridge questions includes unchanged Bridge items already in your queue. Review support questions opens unmarked items with unspecified difficulty.')
replace('The original queue is preserved; earlier documented reviews and the 25 approved easy additions remain outside it.','The original queue is preserved, with 76 revised Bridge questions added back for verification. Other earlier documented reviews and the 25 approved easy additions remain outside it.')
replace("$('status').value==='needsVerification'?needsVerification(q):", "$('status').value==='bridgePending'?(q.revision.startsWith('bridge-20261102-')&&state[q.id]?.reviewedRevision!==q.revision):$('status').value==='needsVerification'?needsVerification(q):")
replace("$('continueMedium').onclick=()=>difficultyQueue('medium','unknown');", "function bridgeQueue(revised){for(const id of ['search','course','topic','difficulty'])$(id).value='';$('role').value='bridge';$('status').value=revised?'bridgePending':'';filter();}\n$('reviewBridgeRevisions').onclick=()=>bridgeQueue(true);\n$('reviewBridge').onclick=()=>bridgeQueue(false);\n$('continueMedium').onclick=()=>difficultyQueue('medium','unknown');")
replace("difficultyQueue('medium','unknown');\n}\n</script>","bridgeQueue(true);\n}\n</script>")
assert source.read_bytes()==raw,'Concurrent review source update'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');(PROJECT/'source/review-template.html').write_text(t,encoding='utf8');(HERE/'review-template.html').write_text(t,encoding='utf8');(HERE/'build-review-html.py').write_bytes((PROJECT/'source/build-review-html.py').read_bytes())
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
result={'status':'PASS','reviewQuestions':len(data['questions']),'bridgeQuestionsInQueue':sum(r['q']['instructionalRole']=='bridge' for r in data['questions']),'revisedBridgeQuestions':len(changes),'addedRevisedQuestions':len(added),'priorReviewsToVerify':len(pending),'newVersionsAccepted':0,'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'allPriorRecordsPreserved':True,'librarySha256':data['librarySha256']}
(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
