"""Refresh the offline queue from canonical records and preserve review state by ID."""
from pathlib import Path
import json,hashlib,csv,shutil,subprocess
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
BASE=HERE/'baseline/review';BASE.mkdir(parents=True,exist_ok=True)
for rel in ['source/review-template.html','source/build-review-html.py','source/personal-review-list-data.json','deliverables/MasteryQuests_Question_Review.html']:
    target=BASE/Path(rel).name
    if not target.exists():shutil.copy2(PROJECT/rel,target)
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
data=read(BASE/'personal-review-list-data.json')
src=(ROOT/'build/faculty-build-composer/data/composer_library.js').read_text(encoding='utf8')
lib=json.loads(src.removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
ledger=read(HERE/'expectations.json');changes={r['id']:r for r in ledger['changes']}
questions={}
def walk(x):
    if isinstance(x,dict):
        if 'id' in x and 'q' in x:
            identity=str(x['id'])
            if identity in questions:assert questions[identity]==x
            questions[identity]=x
        for v in x.values():walk(v)
    elif isinstance(x,list):
        for v in x:walk(v)
walk(lib['concepts'])
# Match the composer's normalization for the existing four-choice keys.
def norm(s):
    import re,html,unicodedata
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]*>','',s))).strip().lower()
# Use the canonical ledger's known key for edits and existing queue key otherwise;
# then validate all keys with the composer in the browser/source parity test.
for row in data['questions']:
    identity=str(row['id']);q=questions[identity];row['q']=q
    if identity in changes:
        c=changes[identity];row['answer_index']=c['correctIndex']
        old=c['beforeRecord']
        row['revision']='elite-20261101-'+hashlib.sha256(json.dumps(q,sort_keys=True).encode()).hexdigest()[:12]
        row['previous']=dict(stem=old['q'],options=old['options'],answer=c['correctIndex'],feedback=old.get('feedback',''))
        row['revision_reason']=c['reason']
    if q.get('image'):
        row['graph_url']=(ROOT/'build/faculty-build-composer/data'/q['image']).as_uri()
    else:row['graph_url']=''
assert len(data['questions'])==7143
data['librarySha256']=lib['librarySha256'];data['canonicalQuestionCount']=9802
status={'Not yet marked':'unknown','Previously reviewed':'previous','Reviewed — pass':'pass','Reviewed — flag':'flag'}
reasons={'Rewrite awkward or compressed wording.':'wording','Balance answer-choice lengths.':'length','Improve distractors / remove answer clues.':'distractors','Check the answer or calculation.':'answer','Clarify assumptions / ambiguous answers.':'assumptions','Improve the explanation.':'explanation','Fix the graph or its labels.':'graph','Reconsider difficulty or course scope.':'difficulty','Check for a duplicate question.':'duplicate'}
seed={}
for identity,r in read(HERE/'review-records.json').items():
    a=r['Selected answer'].strip()
    seed[identity]=dict(status=status[r['Review status']],answer=ord(a)-65 if a in ['A','B','C','D'] else None,notes=r['Notes'],reasons=[reasons[x.strip()] for x in r['Flag reasons'].split('|') if x.strip()],updated=r['Last updated'])
data['reviewSeed']=seed
(PROJECT/'source/personal-review-list-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
builder=(BASE/'build-review-html.py').read_text(encoding='utf8')
builder=builder.replace("alt=q.get('imageAlt',q.get('graphDescription','Question graph'))))","alt=q.get('imageAlt',q.get('graphDescription','Question graph')),revision=r.get('revision',''),previous=r.get('previous'),revisionReason=r.get('revision_reason','')))")
builder=builder.replace('dict(questions=questions,images=images)','dict(questions=questions,images=images,reviewSeed=data.get("reviewSeed",{}),librarySha256=data.get("librarySha256",""))')
(PROJECT/'source/build-review-html.py').write_text(builder,encoding='utf8')
t=(BASE/'review-template.html').read_text(encoding='utf8')
t=t.replace('7,143 questions without a recorded personal review. Some may be familiar from gameplay. Mark those <strong>Previously reviewed</strong>, or review them here and choose <strong>Pass</strong> or <strong>Flag</strong>.','Your original 7,143-question queue, refreshed from the current bank. Elite revisions are ready to check. Your latest exported reviews are included, and newer reviews saved in this browser are kept.')
t=t.replace('<b id="flagged">0</b> flagged</span>','<b id="flagged">0</b> flagged</span><span><b id="verification">0</b> revised reviews to verify</span>')
t=t.replace('<option value="unknown">Not yet marked</option>','<option value="needsVerification">Revised — verify prior review</option><option value="unknown">Not yet marked</option>')
t=t.replace('<div class="tools"><button id="export"','<div class="tools"><button id="continueElite" class="primary">Continue elite review</button><button id="verifyElite">Verify revised elite flags</button><button id="allQuestions">All questions</button></div><div class="tools"><button id="export"')
t=t.replace('Source: shared Composer bank last revised October 8, 2026. This queue excludes 2,634 documented personal review IDs from 9,777 current question IDs.','Source: shared Composer bank refreshed November 1, 2026 (9,802 question IDs). The original queue is preserved; earlier documented reviews and the 25 approved easy additions remain outside it.')
t=t.replace('Flag a question to choose quick revision prompts and add notes.','Revised questions keep your prior status and notes until you verify them. A previous answer is labeled separately from a new attempt. Flag a question to add revision prompts and notes.')
t=t.replace("let state={}, page=0, filtered=Q, storageOK=true;","let state={}, page=0, filtered=Q, storageOK=true;")
start=t.index('function validRecords(');end=t.index('function persist()',start)
t=t[:start]+"""
function validRecords(records){
 if(!records||typeof records!=='object'||Array.isArray(records))throw Error('Missing review records.');
 const out={};
 for(const [id,r] of Object.entries(records)){
  if(!byId.has(id))continue;
  if(!r||!Object.hasOwn(statuses,r.status)||typeof r.notes!=='string'||r.notes.length>20000||!(r.answer===null||Number.isInteger(r.answer)&&r.answer>=0&&r.answer<byId.get(id).options.length))throw Error('Invalid review record for '+id);
  const reasons=r.reasons??[];
  if(!Array.isArray(reasons)||reasons.some(reason=>!Object.hasOwn(flagReasons,reason)))throw Error('Invalid flag reasons for '+id);
  out[id]={status:r.status,answer:r.answer,notes:r.notes,reasons:[...new Set(reasons)],updated:typeof r.updated==='string'?r.updated:''};
  for(const k of ['reviewedRevision','answerRevision'])if(typeof r[k]==='string')out[id][k]=r[k];
  if(r.previousReview&&typeof r.previousReview==='object'&&!Array.isArray(r.previousReview)){
   const old={...r.previousReview};delete old.previousReview;out[id].previousReview=validRecords({[id]:old})[id];
  }
 }
 return out;
}
function mergeRecords(base,incoming){for(const [id,r]of Object.entries(incoming))if(!base[id]||r.updated>=base[id].updated)base[id]=r;return base;}
state=validRecords(DATA.reviewSeed||{});
try{
 const saved=localStorage.getItem(KEY);
 if(saved){const b=JSON.parse(saved);mergeRecords(state,validRecords(b.records));$('saved').textContent='Saved progress and latest review export restored';}
 localStorage.setItem(KEY,JSON.stringify({version:1,records:state}));
}catch(e){storageOK=false;notify('Browser saving is unavailable or saved data could not be read. The latest exported reviews are loaded; save a backup to keep this session.',true);}
function needsVerification(q,r=state[q.id]){return !!(q.revision&&r&&r.status!=='unknown'&&r.reviewedRevision!==q.revision);}
function answerCurrent(q,r){return !q.revision||r.answerRevision===q.revision;}
function preservePrior(q,r){if(q.revision&&!r.previousReview&&r.reviewedRevision!==q.revision&&(r.status!=='unknown'||r.answer!==null||r.notes)){const old={...r};delete old.previousReview;r.previousReview=JSON.parse(JSON.stringify(old));}}
function revisionNotice(q,r){
 if(!q.revision)return '';
 let s='<div class="revision-note"><strong>Revised elite question</strong>';
 if(needsVerification(q,r))s+='<p>Your earlier status ('+esc(statuses[r.status])+') and notes are preserved. Verify this version, then choose a review status.</p><button data-confirm-revision="true">Keep this status for the revised question</button>';
 else if(r.reviewedRevision===q.revision)s+='<p>Your review applies to this version.</p>';
 if(r.answer!==null&&!answerCurrent(q,r))s+='<p>Previous version: selected '+String.fromCharCode(65+r.answer)+'. Choose an answer below to record a new attempt.</p>';
 if(q.previous)s+='<details><summary>Compare previous question and answer</summary><div class="feedback">'+rich(q.previous.stem)+'</div><ol type="A">'+q.previous.options.map(o=>'<li>'+rich(o)+'</li>').join('')+'</ol><p><strong>Previous correct answer: '+String.fromCharCode(65+q.previous.answer)+'.</strong> '+rich(q.previous.feedback)+'</p></details>';
 return s+'</div>';
}
""" +t[end:]
t=t.replace("$('flagged').textContent=flag.toLocaleString()","$('flagged').textContent=flag.toLocaleString();$('verification').textContent=Q.filter(q=>needsVerification(q)).length.toLocaleString()")
t=t.replace("(!$('status').value||(state[q.id]?.status||'unknown')===$('status').value)","(!$('status').value||($('status').value==='needsVerification'?needsVerification(q):(state[q.id]?.status||'unknown')===$('status').value))")
t=t.replace('<div class="stem">'+chr(36)+'{rich(q.stem)}</div>','<div class="stem">'+chr(36)+'{rich(q.stem)}</div>'+chr(36)+'{revisionNotice(q,r)}')
t=t.replace("r.answer===j?'checked':''","answerCurrent(q,r)&&r.answer===j?'checked':''")
t=t.replace("r.answer===null?'No answer selected':", "r.answer===null?'No answer selected':!answerCurrent(q,r)?'Previous version answer retained':")
t=t.replace("const card=e.target.closest('.card'),r=record(card.dataset.id);if(kind==='answer'){r.answer=Number(e.target.value);","const card=e.target.closest('.card'),r=record(card.dataset.id),q=byId.get(card.dataset.id);preservePrior(q,r);if(kind==='answer'){r.answer=Number(e.target.value);r.answerRevision=q.revision||'';")
t=t.replace("else if(kind==='status'){r.status=e.target.value;","else if(kind==='status'){r.status=e.target.value;r.reviewedRevision=q.revision||'';")
t=t.replace("r.updated=new Date().toISOString();persist();stats()});","r.updated=new Date().toISOString();persist();stats();const notice=card.querySelector('.revision-note');if(notice)notice.outerHTML=revisionNotice(q,r)});")
t=t.replace("const r=record(e.target.closest('.card').dataset.id);r.notes=e.target.value;","const id=e.target.closest('.card').dataset.id,r=record(id);preservePrior(byId.get(id),r);r.notes=e.target.value;")
t=t.replace("$('questions').addEventListener('click',e=>{if(!e.target.closest('[data-next]'))return;","$('questions').addEventListener('click',e=>{if(e.target.closest('[data-confirm-revision]')){const card=e.target.closest('.card'),q=byId.get(card.dataset.id),r=record(q.id);preservePrior(q,r);r.reviewedRevision=q.revision;r.updated=new Date().toISOString();persist();stats();card.querySelector('.revision-note').outerHTML=revisionNotice(q,r);updateCounts();return;}if(!e.target.closest('[data-next]'))return;")
t=t.replace("'Notes','Last updated']","'Notes','Last updated','Question revision','Review applies to revision','Needs verification','Answer applies to revision']")
t=t.replace("r.notes||'',r.updated||'']","r.notes||'',r.updated||'',q.revision||'',r.reviewedRevision||'',needsVerification(q,r)?'Yes':'No',r.answerRevision||'']")
t=t.replace("updateCounts();render();\n}","""function eliteQueue(status){$('search').value='';$('course').value='';$('topic').value='';$('difficulty').value='elite';$('status').value=status;filter();}
$('continueElite').onclick=()=>eliteQueue('unknown');
$('verifyElite').onclick=()=>eliteQueue('needsVerification');
$('allQuestions').onclick=()=>{for(const id of ['search','course','topic','difficulty','status'])$(id).value='';filter();};
eliteQueue('unknown');
}""")
t=t.replace('</style>','.revision-note{padding:14px 16px;margin:12px 0 18px;border:1px solid #bd985c;border-radius:8px;background:#fff8e9;font-size:14px}.revision-note p{margin:8px 0}.revision-note details{background:#fffdf7}.revision-note li{margin-bottom:8px}</style>')
assert "revisionNotice(q,r)" in t and "eliteQueue('unknown');" in t
(PROJECT/'source/review-template.html').write_text(t,encoding='utf8')
# Keep exact refreshed source templates with the tracked maintenance tools, without embedding private review notes.
shutil.copy2(PROJECT/'source/review-template.html',HERE/'review-template.html')
shutil.copy2(PROJECT/'source/build-review-html.py',HERE/'build-review-html.py')
print(json.dumps({'questions':len(data['questions']),'revisions':len(changes),'seedRecords':len(seed),'librarySha256':lib['librarySha256']}))
