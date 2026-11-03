from pathlib import Path
import copy,hashlib,json,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
source=PROJECT/'source/personal-review-list-data.json';before=read(HERE/'baseline/personal-review-list-data.json');data=copy.deepcopy(before)
ledger=read(HERE/'expectations.json');change=ledger['changes'][0];identity=change['id'];row=next(r for r in data['questions'] if r['id']==identity)
assert row['q']==change['beforeRecord']
row.setdefault('revisionHistory',[]).append({k:copy.deepcopy(row[k]) for k in ['revision','previous','revision_reason'] if k in row})
old=change['beforeRecord'];row['previous']={'stem':old['q'],'options':old['options'],'answer':2,'feedback':old['feedback'],'difficulty':'medium','topic':row['topic'],'role':old['instructionalRole']}
row['q']=change['afterRecord'];row['answer_index']=2;row['revision']='medium-complete-20261103-'+hashlib.sha256(json.dumps(row['q'],sort_keys=True).encode()).hexdigest()[:12];row['revision_reason']=change['reason']
data.setdefault('revisionBatchHistory',[]).append(data['currentRevisionBatch'])
data['currentRevisionBatch']={'id':'medium-fiscad-clarity-20261103','questionIds':[identity],'count':1,'audited':1,'retained':0,'addedToQueue':[],'accepted':False,'scope':'Follow-up correction to the wording and answer choices of P52A-FISCAD-B2-001.'}
data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert source.read_bytes()==(HERE/'baseline/personal-review-list-data.json').read_bytes(),'Concurrent review change'
assert data['reviewSeed']==before['reviewSeed'] and data.get('batchApprovals')==before.get('batchApprovals')
for a,b in zip(before['questions'],data['questions']):
    if a['id']!=identity:assert a==b
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
print('Review updated; all other records, notes, and statuses preserved.')
