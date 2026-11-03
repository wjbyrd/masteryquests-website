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
    row['q']=q;row['answer_index']=c['correctIndex'];row['revision']='medium-complete-20261103-'+hashlib.sha256(json.dumps(q,sort_keys=True).encode()).hexdigest()[:12];row['revision_reason']=c['reason']
for identity,r in original['reviewSeed'].items():assert data['reviewSeed'][identity]==r
for row in original['questions']:
    if row['id'] not in changes:assert byid[row['id']]==row
data.setdefault('revisionBatchHistory',[]).append(data['currentRevisionBatch'])
data['currentRevisionBatch']={'id':'medium-complete-review-20261103','questionIds':list(changes),'count':len(changes),'audited':ledger['audited'],'retained':ledger['retained'],'addedToQueue':[],'accepted':False,'scope':'Complete reading and consistency review of all 1,586 remaining unmarked Medium questions in the current queue, including every choice, explanation, and referenced graph. Already approved and previously excluded Medium questions are unchanged. No difficulty or role changes.'}
data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest();data['current']=9802;data['known']=9802-len(data['questions']);data['unknown']=len(data['questions'])
t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
old_notice='615 remaining Medium questions have updated wording and are ready for review. Difficulty levels are unchanged. Your approved questions, earlier notes, and pending Hard and Legendary revisions are preserved.'
assert old_notice in t
t=t.replace(old_notice,f'All 1,586 remaining Medium questions received a complete review. This pass revised {len(changes):,} questions, answers, or explanations. Use the comparison in each revised question to see what changed. Your earlier reviews and notes are preserved.')
old_filter="q.revision.startsWith('medium-editorial-20261102-')"
assert old_filter in t
t=t.replace(old_filter,"(q.revision.startsWith('medium-editorial-20261102-')||q.revision.startsWith('medium-complete-20261103-'))")
t=t.replace('bank refreshed November 2, 2026','bank refreshed November 3, 2026')
needle=" let s='<div class=\"revision-note\"><strong>Updated question</strong>';"
assert needle in t
t=t.replace(needle,needle+"\n if(q.previous){const fields=[];if(q.stem!==q.previous.stem)fields.push('question');if(JSON.stringify(q.options)!==JSON.stringify(q.previous.options))fields.push('answer choices');if(q.feedback!==q.previous.feedback)fields.push('explanation');if(fields.length)s+='<p><strong>Changed:</strong> '+fields.join(', ')+'.</p>';} ")
assert source.read_bytes()==raw==(HERE/'baseline/personal-review-list-data.json').read_bytes(),'Review source changed since baseline; reconcile before writing'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');(PROJECT/'source/review-template.html').write_text(t,encoding='utf8');(HERE/'review-template.html').write_text(t,encoding='utf8');(HERE/'build-review-html.py').write_bytes((PROJECT/'source/build-review-html.py').read_bytes())
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
pending=sum(r.get('revision','').startswith(('medium-editorial-20261102-','medium-complete-20261103-')) and data['reviewSeed'][r['id']].get('reviewedRevision')!=r['revision'] for r in data['questions'])
result={'status':'PASS','pendingMediumRevisions':pending,'reviewQuestions':len(data['questions']),'mediumQuestionsInQueue':sum(r['q'].get('canonicalDifficulty')=='medium' for r in data['questions']),'revisedQuestions':len(changes),'addedRevisedQuestions':0,'newVersionsAccepted':0,'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'preservedReviewRecords':len(original['reviewSeed']),'allPriorRecordsPreserved':True,'batchApprovalsPreserved':data.get('batchApprovals')==original.get('batchApprovals'),'librarySha256':data['librarySha256']}
(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
