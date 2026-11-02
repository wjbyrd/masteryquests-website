"""Present the 54 updates together across their new difficulties; retain all reviews."""
from pathlib import Path
import json,hashlib,shutil,copy
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
source=PROJECT/'source/personal-review-list-data.json';raw=source.read_bytes();data=json.loads(raw.decode('utf-8-sig'))
seed=copy.deepcopy(data['reviewSeed'])
ledger=read(HERE/'expectations.json');changes={c['id']:c for c in ledger['changes']}
src=(ROOT/'build/faculty-build-composer/data/composer_library.js').read_text(encoding='utf8')
lib=json.loads(src.removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
canonical={}
def walk(x):
    if isinstance(x,dict):
        if 'id' in x and 'q' in x:canonical[str(x['id'])]=x
        for v in x.values():walk(v)
    elif isinstance(x,list):
        for v in x:walk(v)
walk(lib['concepts'])
for row in data['questions']:
    id=str(row['id']);q=canonical[id]
    if id not in changes:assert row['q']==q,id
    else:
        c=changes[id];old=c['beforeRecord'];row['answer_index']=c['correctIndex']
        row['revision']='review-20261102-'+hashlib.sha256(json.dumps(q,sort_keys=True).encode()).hexdigest()[:12]
        row['previous']=dict(stem=old['q'],options=old['options'],answer=c['correctIndex'],feedback=old.get('feedback',''),difficulty=old.get('canonicalDifficulty',old.get('difficulty','unknown')))
        if old.get('image') and old.get('image')!=q.get('image'):
            row['previous']['graph']=(ROOT/'build/faculty-build-composer/data'/old['image']).as_uri()
        row['revision_reason']=c['reason'];row['q']=q
        row['graph_url']=(ROOT/'build/faculty-build-composer/data'/q['image']).as_uri() if q.get('image') else ''
data['librarySha256']=lib['librarySha256']
data['currentRevisionBatch']={'id':'review-flags-20261102','questionIds':list(changes),'count':54}
assert data['reviewSeed']==seed
assert len(data['questions'])==7143
pending=[r['id'] for r in data['questions'] if r.get('revision') and seed[r['id']]['status']!='unknown' and seed[r['id']].get('reviewedRevision')!=r['revision']]
assert set(pending)==set(changes)
assert not set(changes)&set(data['eliteReviewApproval']['ids'])
t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
def replace(old,new):
    global t
    assert t.count(old)==1,old
    t=t.replace(old,new)
replace('Your original 7,143-question queue, refreshed from the current bank. Elite revisions are ready to check. Your latest exported reviews are included, and newer reviews saved in this browser are kept.','Your question bank includes 54 updates from your latest flagged reviews. Review updated questions brings them together across all difficulty levels. Your earlier approvals and notes are preserved.')
replace('<button id="continueElite" class="primary">Continue elite review</button><button id="verifyElite">Verify revised elite flags</button>','<button id="verifyElite" class="primary">Review updated questions</button><button id="continueElite">All elite questions</button>')
replace('>Export review CSV</button>','>Export all reviews (CSV)</button>')
replace('Category counts reflect your other filters.','Category counts reflect your other filters. CSV exports and backups include all questions, regardless of filters.')
replace('refreshed November 1, 2026','refreshed November 2, 2026')
replace('<strong>Revised elite question</strong>','<strong>Updated question</strong>')
replace(" if(needsVerification(q,r))s+=", " if(q.previous?.difficulty&&q.previous.difficulty!==q.difficulty)s+='<p><strong>Difficulty changed:</strong> '+esc(q.previous.difficulty)+' → '+esc(q.difficulty)+'.</p>';\n if(needsVerification(q,r))s+=")
replace("rich(q.previous.feedback)+'</p></details>'", "rich(q.previous.feedback)+'</p>'+(q.previous.graph?'<p><strong>Previous graph</strong></p><img class=\"graph\" alt=\"Previous version graph\" src=\"'+DATA.images[q.previous.graph]+'\">':'')+'</details>'")
replace("$('continueElite').onclick=()=>eliteQueue('unknown');\n$('verifyElite').onclick=()=>eliteQueue('needsVerification');", "function revisionQueue(){for(const id of ['search','course','topic','difficulty'])$(id).value='';$('status').value='needsVerification';filter();}\n$('continueElite').onclick=()=>eliteQueue('');\n$('verifyElite').onclick=revisionQueue;")
replace("eliteQueue('unknown');\n}","revisionQueue();\n}")
replace("'Needs verification','Answer applies to revision']", "'Needs verification','Answer applies to revision','Current difficulty','Previous difficulty']")
replace("r.answerRevision||'']})]", "r.answerRevision||'',q.difficulty,q.previous?.difficulty||'']})]")
assert source.read_bytes()==raw,'Concurrent review source update'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(PROJECT/'source/review-template.html').write_text(t,encoding='utf8')
(HERE/'review-template.html').write_text(t,encoding='utf8')
shutil.copy2(HERE/'build-review-html.py',PROJECT/'source/build-review-html.py')
print(json.dumps({'updated':len(changes),'pendingReverification':len(pending),'reviewsPreserved':len(seed),'librarySha256':lib['librarySha256']}))
