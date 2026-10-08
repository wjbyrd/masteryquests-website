"""Create a read-only faculty review. Does not modify the bank or faculty PDFs."""
import base64, collections, hashlib, html, json, pathlib, re
from html.parser import HTMLParser
from findings import findings, records, D, save

ROOT=D.parent.parent
OUT=ROOT/'faculty_exports/audits/micro_faculty_voice_pass3_review_20261007.html'
baseline=json.loads((D/'scan-summary.json').read_text())
data=ROOT/'build/faculty-build-composer/data'
actual={name:hashlib.sha256((data/name).read_bytes()).hexdigest() for name in baseline['protectedFiles']}
assert actual==baseline['protectedFiles'], 'Canonical data changed during read-only review'
save()
by={r['id']:r for r in records}
flagged=[r for r in records if r['flags']]
protected=[r for r in flagged if len(r['areas'])>1 or r['marketGateDerived']]
retained=[r for r in flagged if len(r['areas'])==1 and not r['marketGateDerived'] and r['id'] not in findings]
extra=[id for id in findings if not by[id]['flags']]
assert len(flagged)==len(protected)+len(retained)+len(findings)-len(extra)
patterns=collections.Counter(p for f in findings.values() for p in f['patterns'])
topics=collections.Counter(by[id]['q']['primaryConceptId'] for id in findings)
e=lambda s:html.escape(str(s),quote=True)
def table(headers,rows):
 return '<table><thead><tr>'+''.join('<th>'+e(h)+'</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+str(x)+'</td>' for x in row)+'</tr>' for row in rows)+'</tbody></table>'
def page(r):return f'<a href="../microeconomics_question_bank.pdf#page={r["page"]}">PDF p. {r["page"]}</a>'
def opts(options,key,changed=None):
 return '<ol type="A">'+''.join(f'<li class="{"key" if i==key else ""} {"changed" if changed and s!=changed[i] else ""}">{e(s)}'+(' <span class="keylabel">KEY</span>' if i==key else '')+'</li>' for i,s in enumerate(options))+'</ol>'
images={}
cards=[]; payload=[]
for id,f in sorted(findings.items(),key=lambda x:(by[x[0]]['q']['primaryConceptId'],by[x[0]]['page'],x[0])):
 r=by[id];q=r['q'];p=f['proposed'];new={**q,**p};key=r['key'];topic=q['primaryConceptId']
 assert set(p)<= {'q','options','feedback'} and len(new['options'])==4 and len(set(new['options']))==4
 assert new!=q and len(r['areas'])==1 and not r['marketGateDerived']
 tags=''.join('<span class="tag">'+e(x)+'</span>' for x in f['patterns'])
 reasons=' '.join(f['reason'])
 original=f'<p class="stem">{e(q["q"])}</p>'+opts(q['options'],key)
 proposed=f'<p class="stem {"changed" if "q" in p else ""}">{e(new["q"])}</p>'+opts(new['options'],key,q['options'])
 graph=''
 if q.get('image'):
  ip=q['image']
  if ip not in images:images[ip]='data:image/webp;base64,'+base64.b64encode((data/ip).read_bytes()).decode()
  graph=f'<details><summary>View existing graph · unchanged</summary><img loading="lazy" class="graph" src="{images[ip]}" alt="{e(q.get("imageAlt", "Existing question graph"))}"><p>{e(q.get("graphDescription",""))}</p></details>'
 feedback=f'<details><summary>Feedback and assessed skill</summary><p><b>Skill:</b> {e(q["primarySkill"])}</p><p><b>Current feedback:</b> {e(q.get("feedback",""))}</p>'
 if 'feedback' in p:feedback+=f'<p class="changed"><b>Suggested feedback:</b> {e(p["feedback"])}</p>'
 else:feedback+='<p>Feedback retained.</p>'
 feedback+='</details>'
 cards.append(f'<article data-patterns="{e("|".join(f["patterns"]))}" data-topic="{e(topic)}" id="q-{e(id)}"><header><h3>{e(id)}</h3><div>{page(r)} · {e(q["canonicalDifficulty"])} · {e(q["instructionalRole"])}</div></header><p class="topic">{e(topic.replace("-"," "))}</p><div>{tags}</div><p class="reason">{e(reasons)}</p><div class="comparison"><section><h4>Current wording</h4>{original}</section><section><h4>Suggested wording · review only</h4>{proposed}</section></div>{feedback}{graph}</article>')
 payload.append({**f,'page':r['page'],'topic':topic,'difficulty':q['canonicalDifficulty'],'role':q['instructionalRole'],'skill':q['primarySkill'],'keyIndex':key,'original':{k:q.get(k) for k in ['q','options','feedback','image','imageAlt','graphDescription']}})

retained_examples=[
 ('P62E-COP-EL-004','Diminishing marginal product: “but at a slower rate” is part of the assessed distinction, not disposable explanation.'),
 ('PMC-COP-R-163','The constant-returns-to-scale label connects the answer to the assessed skill.'),
 ('PMC-COP-BR-164','Minimum efficient scale needs a full definition; its relative length alone does not establish a defect.'),
 ('PMC-COP-BR-166','The long-run unit-cost qualification is substantive.'),
 ('P62C-CPS-LB-029','The numerical welfare comparison and distributional qualification serve different parts of the reasoning.'),
 ('P62B-ELAS-L-059','The revenue calculation does not establish the later tax base; retain that limitation.'),
 ('P62H-MCMP-L-094','Price, entry, profit and excess capacity are all requested. The answer must cover each.'),
 ('P62H-MCMP-E-004','“Durable” describes a shoe sole, not vague persistence.'),
 ('PM6-MON-H-006','“Durable monopoly power” is a meaningful entry-barrier distinction.'),
 ('P62C-CPS-E-007','“Textbook” refers to an actual good being traded.'),
 ('PM8-OLI-H-049','“Marginal-cost change” is standard economic language, not an opaque noun stack.'),
]
assert all(id in by and id not in findings for id,_ in retained_examples)
summary={**baseline,'confirmedCandidates':len(findings),'proposedPatternCounts':dict(patterns),'proposedTopicCounts':dict(topics),'protectedFlagged':len(protected),'screenedWithoutRecommendation':len(retained),'supplementalCandidates':extra,'bankUnchanged':actual==baseline['protectedFiles'],'reviewType':'Pattern screen of all Micro records; contextual review of eligible flagged records and targeted supplemental wording searches. Not a fresh economics or graph-accessibility audit.'}
(D/'review-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
(D/'review-findings.json').write_text(json.dumps({'summary':summary,'findings':payload},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
ledger=[]
for r in sorted(flagged,key=lambda r:r['page']):
 status='Candidate' if r['id'] in findings else 'Protected scope' if r in protected else 'No recommendation'
 ledger.append([e(r['id']),page(r),e(status),e(', '.join(r['flags'])),e(r['q']['q'])])
for id in extra:
 r=by[id];ledger.append([e(id),page(r),'Candidate','Supplemental meta-language search',e(r['q']['q'])])
css='''
:root{font-family:Segoe UI,Arial,sans-serif;color:#172c3b;background:#f3f5f6;font-size:16px}body{margin:0}main{max-width:1240px;margin:auto;padding:36px 30px 70px}h1{font-size:38px;letter-spacing:-1px;margin:8px 0 14px}h2{font-size:24px;margin-top:32px}h3{margin:0;font-size:19px}h4{margin:0 0 18px;color:#29526a}p{line-height:1.55}.eyebrow{color:#336675;font-weight:700;letter-spacing:2px;font-size:12px}.intro{max-width:920px}.notice{background:#e5f0ec;border-left:5px solid #27715a;padding:14px 20px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:25px 0}.stat{background:white;border:1px solid #d8e0e4;border-radius:10px;padding:18px}.stat b{display:block;font-size:34px;color:#20556c}.stat span{font-size:14px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}table{border-collapse:collapse;width:100%;font-size:14px;background:white}td,th{text-align:left;padding:10px 12px;border-bottom:1px solid #dce4e7;vertical-align:top}th{background:#e7eef2}a{color:#075f85}article{background:white;margin:20px 0;border:1px solid #d3dfe5;border-radius:12px;overflow:hidden;padding:24px}article header{display:flex;justify-content:space-between;gap:20px;align-items:baseline}article header div,.topic{font-size:14px;color:#526976}.topic{margin:8px 0}.tag{display:inline-block;background:#e7eff5;color:#244e67;padding:4px 9px;margin:3px 6px 3px 0;border-radius:20px;font-size:12px}.reason{background:#f6f8fa;padding:12px 15px;border-left:3px solid #9db6c5}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:26px}.comparison section+section{border-left:1px solid #dce5e8;padding-left:26px}.stem{font-weight:600}.key{background:#edf5ef}.keylabel{font-size:10px;font-weight:bold;margin-left:6px;color:#32623d}li{padding:7px 9px;line-height:1.5}.changed{box-shadow:inset 3px 0 #ba850c;padding-left:10px}.graph{display:block;max-width:100%;height:auto;margin:18px auto}details{margin-top:15px;border-top:1px solid #e0e7eb;padding-top:13px}summary{cursor:pointer;font-weight:600;color:#315b72}.filters{display:flex;gap:12px;flex-wrap:wrap;position:sticky;top:0;background:#f3f5f6f5;padding:15px 0;z-index:2}input,select,button{font:inherit;border:1px solid #adbdc6;border-radius:6px;padding:10px;background:white}input{flex:1;min-width:180px}button{cursor:pointer;color:#164c68}#visible{font-size:14px;color:#526976}footer{font-size:12px;color:#59717d;margin-top:35px;overflow-wrap:anywhere}.scroll{overflow-x:auto}.ledger th:first-child,.ledger td:first-child{min-width:170px}.ledger{font-size:12px}.hidden{display:none!important}@media(max-width:750px){main{padding:20px 14px}.stats{grid-template-columns:1fr 1fr}.grid,.comparison{grid-template-columns:1fr}.comparison section+section{border-left:0;border-top:1px solid #ddd;padding:18px 0 0}article header{display:block}h1{font-size:30px}article{padding:18px}.filters{position:static}}@media print{.filters{display:none}body{background:white}article{break-inside:avoid}details:not([open]){display:none}.stats{grid-template-columns:repeat(4,1fr)}}
'''
js='''
const cards=[...document.querySelectorAll('article')];
const search=document.getElementById('search'),pattern=document.getElementById('pattern'),topic=document.getElementById('topic');
function filter(){let n=0;const query=search.value.toLowerCase().trim();for(const card of cards){const show=(!query||card.textContent.toLowerCase().includes(query))&&(!pattern.value||card.dataset.patterns.split('|').includes(pattern.value))&&(!topic.value||card.dataset.topic===topic.value);card.classList.toggle('hidden',!show);if(show)n++;}document.getElementById('visible').textContent=n+' of '+cards.length+' candidates shown';}
search.addEventListener('input',filter);pattern.addEventListener('change',filter);topic.addEventListener('change',filter);document.getElementById('clear').addEventListener('click',()=>{search.value='';pattern.value='';topic.value='';filter();});filter();
'''
(D/'report-ui.js').write_text(js,encoding='utf-8')
doc=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Micro faculty-voice Pass 3 review · 7 October 2026</title><style>{css}</style></head><body><main>
<div class="eyebrow">FACULTY REVIEW · 7 OCTOBER 2026</div><h1>Microeconomics: remaining faculty-voice candidates</h1>
<p class="intro">Applying the accepted Macro Pass 3 rules identifies <b>{len(findings)} Micro-only editorial candidates</b>. The largest groups are explanations inside answer choices and graph questions that leave the initial and final curves implicit. These are recommendations for review, not applied edits.</p>
<p class="notice"><b>The question bank is unchanged.</b> No question, key, difficulty, routing, role, graph, accessibility description, or faculty PDF was changed in this review. Existing work from the completed Macro pass is preserved.</p>
<div class="stats"><div class="stat"><b>6,297</b><span>Micro records screened</span></div><div class="stat"><b>662</b><span>Initial pattern flags</span></div><div class="stat"><b>{len(findings)}</b><span>Editorial candidates</span></div><div class="stat"><b>{len(protected)}</b><span>Flagged records in protected scope</span></div></div>
<p>The screen examined stems and answer choices for meta-language, abstraction, compressed noun phrases, graph chronology and disproportionate answer length. Flagged Micro-only records were read in context. A targeted supplemental search added <b>43058</b>, whose “classroom example” framing was outside the initial literal screen. Of the initial flags, {len(retained)} eligible records receive no recommendation. Shared Macro/General and Market Gate records are listed as protected and have no proposed edits.</p>
<p>The length threshold was a correct option more than 1.5 times the median distractor length and at least six words longer, supplemented by an explanatory-clause screen. A flag alone is not a defect. Multi-part reasoning, needed economic qualifications and legitimate technical terms were retained. This is a bounded editorial review, not a fresh economics, graph-accessibility or difficulty audit.</p>
<div class="grid"><section><h2>Patterns found</h2>{table(['Pattern','Candidates'],[[e(p),n] for p,n in patterns.most_common()])}<p>Pattern counts overlap: four records fit two categories.</p></section><section><h2>Where they occur</h2>{table(['Topic','Candidates'],[[e(t.replace('-',' ')),n] for t,n in topics.most_common()])}</section></div>
<h2>Flagged wording worth retaining</h2>{table(['Record','Reason'],[[e(id)+' · '+page(by[id]),e(reason)] for id,reason in retained_examples])}
<h2>Candidate details</h2><p>Gold bars mark proposed text changes. The current answer position is preserved. Each card includes all four alternatives so answer length can be judged in context. Page links refer to the current Micro faculty PDF. Existing graphs are embedded for comparison.</p>
<div class="filters"><input id="search" type="search" aria-label="Search candidates" placeholder="Search ID, wording or reason"><select id="pattern" aria-label="Filter pattern"><option value="">All patterns</option>{''.join('<option>'+e(p)+'</option>' for p in sorted(patterns))}</select><select id="topic" aria-label="Filter topic"><option value="">All topics</option>{''.join('<option value="'+e(t)+'">'+e(t.replace('-',' '))+'</option>' for t in sorted(topics))}</select><button id="clear" type="button">Clear filters</button></div><p id="visible"></p>
{''.join(cards)}
<details><summary>Screening ledger · 662 initial flags plus 1 supplemental candidate</summary><p>“No recommendation” means no editorial change is proposed under this bounded review. “Protected scope” is not a finding that the wording is defective; those records were not selected for remediation.</p><div class="scroll ledger">{table(['ID','Page','Disposition','Screen flags','Current stem'],ledger)}</div></details>
<footer><p>Source SHA-256: {e(baseline['sourceSha256'])}<br>Library hash: {e(baseline['librarySha256'])}<br>Verified unchanged: composer_library.js, composer_registry.json, composer_library_manifest.json and faculty-outcomes.js.</p><p>Review proposals only. No canonical writes, PDF regeneration, commit or push.</p></footer></main><script>{js}</script></body></html>'''
OUT.write_text(doc,encoding='utf-8')
class Check(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.articles=0;self.images=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='article':self.articles+=1
  if tag=='img':self.images+=1;assert a['src'].startswith('data:image/webp;base64,') and a['alt']
c=Check();c.feed(doc);assert len(c.ids)==len(set(c.ids)) and c.articles==len(findings)
assert (OUT.parent.parent/'microeconomics_question_bank.pdf').exists()
validation={'candidates':len(findings),'cards':c.articles,'graphs':c.images,'uniqueGraphAssets':len(images),'uniqueIds':True,'allFourOptionsUnique':True,'allProposalsMicroOnlyAndNotMarketGate':True,'onlyEditorialFieldsProposed':True,'canonicalHashesUnchanged':True,'sourceHashMatchesCurrentPdfPageMap':baseline['sourceSha256']==json.loads((ROOT/'faculty_exports/validation_summary.json').read_text())['source_sha256']}
(D/'report-validation.json').write_text(json.dumps(validation,indent=2)+'\n')
print(json.dumps({'report':str(OUT),'summary':summary,'validation':validation},indent=2))
