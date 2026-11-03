"""Import the supplied progress export and fix review queue navigation."""
from pathlib import Path
from collections import Counter
import copy,csv,hashlib,json,shutil,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
BASE=HERE/'baseline';SOURCE=PROJECT/'source';EXPORT=Path('C:/Users/Jennings/Downloads/MasteryQuests-review-results(20).csv')
assert not BASE.exists(),'Baseline already captured; do not overwrite'
BASE.mkdir();(HERE/'qa').mkdir()
for name in ['personal-review-list-data.json','review-template.html','build-review-html.py']:shutil.copy2(SOURCE/name,BASE/name)
shutil.copy2(PROJECT/'deliverables/MasteryQuests_Question_Review.html',BASE/'review-before.html')
shutil.copy2(EXPORT,BASE/'reviews.csv')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
before=read(SOURCE/'personal-review-list-data.json');data=copy.deepcopy(before)
statuses={'Reviewed — pass':'pass','Reviewed — flag':'flag','Not yet marked':'unknown','Previously reviewed':'previous'}
reasons=dict(zip(['Rewrite awkward or compressed wording.','Balance answer-choice lengths.','Improve distractors / remove answer clues.','Check the answer or calculation.','Clarify assumptions / ambiguous answers.','Improve the explanation.','Fix the graph or its labels.','Reconsider difficulty or course scope.','Check for a duplicate question.'],['wording','length','distractors','answer','assumptions','explanation','graph','difficulty','duplicate']))
with EXPORT.open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
assert len(rows)==len({r['Question ID'] for r in rows})==len(data['questions'])
changed=[]
for row in rows:
    identity=row['Question ID'];prior=data['reviewSeed'][identity]
    r=dict(status=statuses[row['Review status']],answer=ord(row['Selected answer'])-65 if row['Selected answer'] else None,notes=row['Notes'],reasons=[reasons[v] for v in row['Flag reasons'].split(' | ') if v],updated=row['Last updated'],reviewedRevision=row['Review applies to revision'],answerRevision=row['Answer applies to revision'])
    if 'previousReview' in prior:r['previousReview']=prior['previousReview']
    if r['updated']>=prior['updated']:
        if r!=prior:changed.append(identity)
        data['reviewSeed'][identity]=r
assert data['questions']==before['questions'] and data.get('batchApprovals')==before.get('batchApprovals')
(SOURCE/'personal-review-list-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
t=(BASE/'review-template.html').read_text(encoding='utf8')
def replace(old,new):
    global t
    assert old in t,old[:120]
    t=t.replace(old,new)
replace('Revised — verify prior review','Updated since your review')
replace('>Review updated questions</button>','>Verify previously reviewed questions</button>')
replace('<label>Page <input type="number" id="page" min="1" value="1" aria-label="Page number"></label>', '<label>Start at question <input type="number" id="page" min="1" value="1" aria-label="Starting question number"></label>')
replace('Review Medium revisions opens the updated Medium questions awaiting your review. Continue Medium review opens all unmarked Medium questions. The Hard and Legendary revision buttons still open those pending versions. Choose Reviewed — pass to accept a revision.', 'The revision queues show only questions you have not yet marked. Passed and flagged questions stay out of those queues. Continue Medium review includes all unmarked Medium questions. Use Verify previously reviewed questions to check changes made after an earlier review. Choose Reviewed — pass to accept the version shown. Next question and Next batch use your latest saved reviews. Your filters and place are restored when you return.')
replace('Bridge revisions awaiting review shows updated Bridge versions that still need review.', 'Bridge revisions awaiting review shows revised Bridge questions you have not yet marked.')
replace('Revised questions keep your prior status and notes until you verify them.', 'Later revisions preserve your earlier status and notes in the separate verification view.')
replace('let state={}, page=0, filtered=Q, storageOK=true;', "let state={}, cursor=0, filtered=Q, storageOK=true;\nconst questionOrder=new Map(Q.map((q,i)=>[q.id,i])), VIEW_KEY=KEY+'-view-v2';\nconst viewFields=['search','course','topic','difficulty','role','status','size'];")
replace("if(needsVerification(q,r))s+='<p>Your earlier status ('+esc(statuses[r.status])+') and notes are preserved. Verify this version, then choose a review status.</p><button data-confirm-revision=\"true\">Keep this status for the revised question</button>';", "if(needsVerification(q,r))s+='<p><strong>Earlier version: '+esc(statuses[r.status])+'.</strong> This version changed afterward. Your earlier review and notes are preserved; this question stays out of the not-yet-reviewed queues.</p><button data-confirm-revision=\"true\">'+(r.status==='pass'?'Accept this revised question':r.status==='flag'?'Keep flagged for this version':'Confirm this version as reviewed')+'</button>';" )
start=t.index('function matches(q,skip=');end=t.index('function updateCounts()',start)
t=t[:start]+(HERE/'status-filter.js').read_text(encoding='utf8')+'\n'+t[end:]
replace("function filter(){filtered=Q.filter(q=>matches(q));page=0;updateCounts();render()}", "function refreshSelection(){filtered=Q.filter(q=>matches(q));updateCounts();}\nfunction filter(){clearTimeout(searchTimer);cursor=0;refreshSelection();render();rememberView();}")
start=t.index('function render(){');end=t.index(" $('questions').innerHTML=",start)
t=t[:start]+'''function render(){
 const size=pageSize(),pages=Math.max(1,Math.ceil(filtered.length/size));
 cursor=Math.max(0,Math.min(cursor,Math.max(0,filtered.length-1)));
 const start=cursor,items=filtered.slice(start,start+size);
 $('range').textContent=filtered.length?`${(start+1).toLocaleString()}–${Math.min(start+size,filtered.length).toLocaleString()} of ${filtered.length.toLocaleString()} questions`:'No matching questions';
 $('page').value=filtered.length?start+1:1;$('page').max=Math.max(1,filtered.length);$('pages').textContent='of '+filtered.length.toLocaleString();
 for(const id of ['prev','bottomprev'])$(id).disabled=start===0;
 for(const id of ['next','bottomnext'])$(id).disabled=start+size>=filtered.length;
'''+t[end:]
replace('<legend>My review status</legend>', '<legend>${needsVerification(q,r)?\'Review this revised version\':\'My review status\'}</legend>')
replace("${r.status===s?'checked':''}","${!needsVerification(q,r)&&r.status===s?'checked':''}")
replace('<button data-next="true">Next question ↓</button>', '<span class="review-saved" role="status"></span><button data-next="true">Next question ↓</button>')
start=t.index('function move(delta)');end=t.index("$('questions').addEventListener('change'",start)
t=t[:start]+(HERE/'navigation.js').read_text(encoding='utf8')+'\n'+t[end:]
replace("r.status=e.target.value;r.reviewedRevision=q.revision||'';", "r.status=e.target.value;r.reviewedRevision=r.status==='unknown'?'':q.revision||'';")
replace("if(notice)notice.outerHTML=revisionNotice(q,r)});", "if(notice)notice.outerHTML=revisionNotice(q,r);if(kind==='status')savedReview(card,r);});")
start=t.index("$('questions').addEventListener('click'");end=t.index('function download(',start)
t=t[:start]+'''$('questions').addEventListener('click',e=>{
 if(e.target.closest('[data-confirm-revision]')){
  const card=e.target.closest('.card'),q=byId.get(card.dataset.id),r=record(q.id);
  preservePrior(q,r);r.reviewedRevision=q.revision;r.updated=new Date().toISOString();persist();stats();
  card.querySelector('.revision-note').outerHTML=revisionNotice(q,r);
  card.querySelector('.review legend').textContent='My review status';
  card.querySelector('[data-kind="status"][value="'+r.status+'"]').checked=true;
  updateCounts();savedReview(card,r);return;
 }
 if(e.target.closest('[data-next]'))nextQuestion(e.target.closest('.card').dataset.id);
});
'''+t[end:]
replace("difficultyQueue('medium','mediumPending');\n}","let restoredView=false;\ntry{const saved=localStorage.getItem(VIEW_KEY);if(saved){restoreView(JSON.parse(saved));restoredView=true;}}catch(e){}\nif(!restoredView){$('difficulty').value='medium';$('status').value='mediumPending';refreshSelection();render();rememberView(true);}\nwindow.addEventListener('popstate',e=>{if(e.state?.reviewView)restoreView(e.state.reviewView);});\n}")
(SOURCE/'review-template.html').write_text(t,encoding='utf8');(HERE/'review-template.html').write_text(t,encoding='utf8');shutil.copy2(SOURCE/'build-review-html.py',HERE/'build-review-html.py')
subprocess.run([sys.executable,str(SOURCE/'build-review-html.py')],check=True)
result={'status':'PASS','importedChangedRecords':len(changed),'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'questionsUnchanged':True,'batchApprovalsPreserved':True,'sourceCsvSha256':hashlib.sha256(EXPORT.read_bytes()).hexdigest(),'example42352':data['reviewSeed']['42352']}
(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
