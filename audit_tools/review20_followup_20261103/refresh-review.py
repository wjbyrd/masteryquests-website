from pathlib import Path
from collections import Counter
import copy,hashlib,json,shutil,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation');SOURCE=PROJECT/'source'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
before=read(HERE/'baseline/personal-review-list-data.json');data=copy.deepcopy(before);ledger=read(HERE/'expectations.json');byid={r['id']:r for r in data['questions']}
for c in ledger['changes']:
    row=byid[c['id']];old=c['beforeRecord'];assert row['q']==old
    if row.get('revision'):row.setdefault('revisionHistory',[]).append({k:copy.deepcopy(row[k]) for k in ['revision','previous','revision_reason'] if k in row})
    row['previous']={'stem':old['q'],'options':old['options'],'answer':c['correctIndex'],'feedback':old.get('feedback',''),'difficulty':old['canonicalDifficulty'],'topic':row['topic'],'role':old['instructionalRole']}
    if row['graph_url']:row['previous']['graph']=row['graph_url']
    row['q']=c['afterRecord'];row['answer_index']=c['correctIndex'];row['revision']='review20-20261103-'+hashlib.sha256(json.dumps(row['q'],sort_keys=True).encode()).hexdigest()[:12];row['revision_reason']=c['reason']
data.setdefault('revisionBatchHistory',[]).append(data['currentRevisionBatch'])
data['currentRevisionBatch']={'id':'review20-followup-20261103','questionIds':[c['id'] for c in ledger['changes']],'count':len(ledger['changes']),'audited':63,'retained':14,'addedToQueue':[],'accepted':False,'scope':'Remaining flags and newer notes on passed questions in review export (20). Historical accepted notes and all saved reviews remain preserved.'}
data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert data['reviewSeed']==before['reviewSeed'] and data['batchApprovals']==before['batchApprovals']
if (SOURCE/'personal-review-list-data.json').read_bytes()!=(HERE/'baseline/personal-review-list-data.json').read_bytes():
    assert '--replace-staged' in sys.argv
    staged=read(SOURCE/'personal-review-list-data.json');assert staged['reviewSeed']==before['reviewSeed'] and staged['currentRevisionBatch']['id']=='review20-followup-20261103'
    for r in staged['questions']:
        final=byid[r['id']]
        assert {k:v for k,v in r['q'].items() if k!='commonError'}=={k:v for k,v in final['q'].items() if k!='commonError'}
current_template=(SOURCE/'review-template.html').read_text(encoding='utf8');t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
assert current_template==t or ('--replace-staged' in sys.argv and current_template==(HERE/'review-template.html').read_text(encoding='utf8'))
t=t.replace('<option value="mediumPending">','<option value="review20Pending">File (20) revisions — verify changes</option><option value="mediumPending">',1)
t=t.replace('<button id="reviewMediumRevisions" class="primary">','<button id="review20Revisions" class="primary">Review file (20) revisions</button><button id="reviewMediumRevisions">',1)
t=t.replace(" if(selected==='needsVerification')", " if(selected==='review20Pending')return (q.revision||'').startsWith('review20-20261103-')&&r?.reviewedRevision!==q.revision;\n if(selected==='needsVerification')",1)
t=t.replace("$('reviewMediumRevisions').onclick", "$('review20Revisions').onclick=()=>{for(const id of ['search','course','topic','difficulty','role'])$(id).value='';$('status').value='review20Pending';filter();};\n$('reviewMediumRevisions').onclick",1)
old='All 1,586 remaining Medium questions received a complete review. This pass revised 652 questions, answers, or explanations. Use the comparison in each revised question to see what changed. Your earlier reviews and notes are preserved.'
assert old in t;t=t.replace(old,'Review file (20) corrections are ready: 49 questions updated, including notes on passed questions. Use Review file (20) revisions to verify these changes. Your earlier reviews, notes, and place in the remaining queues are preserved.')
t=t.replace('The revision queues show only questions you have not yet marked.','Review file (20) revisions opens this correction batch for verification across all difficulty levels. The difficulty revision queues show only questions you have not yet marked.')
t=t.replace('function filter(){clearTimeout(searchTimer);',"function filter(){if(!$('message').classList.contains('error'))$('message').hidden=true;clearTimeout(searchTimer);")
(SOURCE/'personal-review-list-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');(SOURCE/'review-template.html').write_text(t,encoding='utf8');(HERE/'review-template.html').write_text(t,encoding='utf8');shutil.copy2(SOURCE/'build-review-html.py',HERE/'build-review-html.py')
subprocess.run([sys.executable,str(SOURCE/'build-review-html.py')],check=True)
result={'status':'PASS','newVersionsPending':49,'alreadyAddressed':14,'preservedReviewRecords':len(data['reviewSeed']),'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'librarySha256':data['librarySha256']};(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
