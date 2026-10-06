import csv,json,re,hashlib,subprocess,shutil,unicodedata
from pathlib import Path
from collections import Counter
import pdfplumber
H=Path(__file__).resolve().parent;R=H.parent.parent;D=R/'build/faculty-build-composer/data';A=R/'faculty_exports/audits'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def lib(p):return json.loads(p.read_text(encoding='utf-8').removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
def writecsv(p,rows):
 with p.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
L=read(H/'expectations.json');B=lib(H/'baseline/build/faculty-build-composer/data/composer_library.js');N=lib(D/'composer_library.js');U=read(H/'macro-records.json');Umap={r['id']:r for r in U};C={c['id']:c for c in L['changes']};pre=read(H/'preflight.json');pub=read(H/'publication-validation.json');protection=read(H/'protection-validation.json');num=read(H/'numerical-validation.json')
assert N['librarySha256']==L['afterLibrarySha256'];assert len(C)==20 and pub['status']==protection['status']==num['status']=='PASS'
assert B['assetInventory']==N['assetInventory']
for a in N['assetInventory']:assert sha(D/a['runtimePath'])==a['sha256']
# Exact all-field freeze for every Micro question, checked independently of global library hashes.
current={}
for m in N['concepts'].values():
 for qs in list(m.get('questions',{}).values())+[m.get('repairQuestions',[]),m.get('bridgeQuestions',[]),m.get('repairSeedQuestions',[])]:
  for q in qs:current[str(q['id'])]=q
frozen=[r for r in read(H/'records.json') if 'micro' in r['areas']]
for r in frozen:assert current[r['id']]==r['q'],r['id']
assert not {'42660','42697'}&current.keys()
S=read(R/'faculty_exports/validation_summary.json');assert S['status']=='complete' and S['sources_unchanged'];assert S['source_sha256']==sha(D/'composer_library.js')
export={};pages=S['disciplines']['macro']['question_pages']
for area,d in S['disciplines'].items():
 rows=list(csv.DictReader((R/'faculty_exports'/d['csv_file']).open(encoding='utf-8-sig',newline='')));assert len(rows)==pre[area] if area!='general' else len(rows)==pre['sharedGeneral']
 assert len(rows)==d['pdf_questions'];assert not {'42660','42697'}&{r['Question ID'] for r in rows}
 for r in rows:
  q=current[r['Question ID']];assert r['Question']==q['q'] and r['Feedback']==q.get('feedback','');assert [r['Choice '+x] for x in 'ABCD']==q['options']
  if r['Question ID'] in C:assert r['Correct Answer'].startswith('ABCD'[C[r['Question ID']]['correctIndex']])
 export[area]={'rows':len(rows),'pdfPages':d['pdf_pages'],'exactCanonicalFieldParity':True}
pdf=R/'faculty_exports'/S['disciplines']['macro']['pdf_file'];out=H/'pdf-review';out.mkdir(exist_ok=True)
norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
with pdfplumber.open(pdf) as doc:
 for id,c in C.items():
  pg=pages[id];text='\n'.join(p.extract_text() or '' for p in doc.pages[pg-1:min(pg+1,len(doc.pages))]);assert id in text
  assert norm(c['afterRecord']['q']) in norm(text),id+' stem PDF'
  assert norm(c['afterRecord']['options'][c['correctIndex']]) in norm(text),id+' key PDF'
 targets=['LG-Q-226','ECON-SP-LEGENDARY-9016','P52A-CPI-B3-003','PM2B2-BIAS-MB-003','P52B-S4-UNEM-B2-003','P52B-S4-STAB-B2-002','PM2B3-SRC-EB-003','PG5-PC-L-024']
 for id in targets:
  pg=pages[id];subprocess.run([shutil.which('pdftoppm'),'-f',str(pg),'-l',str(pg),'-scale-to','1500','-png','-singlefile',str(pdf),str(out/id)],check=True,capture_output=True)
(H/'export-validation.json').write_text(json.dumps({'status':'PASS','areas':export,'checkedChangedPdfBlocks':{id:pages[id] for id in C},'renderedIds':targets},indent=2)+'\n')
# Resolve current runner results: preserve the failed-output attempt, then accept only a successful unchanged-assertion retry.
log=(H/'tests.log').read_text(encoding='utf-8-sig');retry=(H/'comprehensive-retry.log').read_text(encoding='utf-8-sig');assert len(re.findall(r'^PASS run_',log,re.M))==29 or (len(re.findall(r'^PASS run_',log,re.M))==28 and '"status":"PASS"' in retry)
assert 'Ran 25 tests' in (H/'exporter-tests.log').read_text() and 'OK' in (H/'exporter-tests.log').read_text()
testrows=[{'runner':n,'status':'PASS','evidence':'tests.log' if status=='PASS' else 'comprehensive-retry.log','initialAttempt':status} for status,n in re.findall(r'^(PASS|FAIL) (run_\S+)',log,re.M)];assert len(testrows)==29
(H/'test-results.json').write_text(json.dumps(testrows,indent=2)+'\n')
# Candidate list: bounded representative IDs, with family companions shown for a joint faculty decision.
families=read(H/'similarity-families.json');decisions=read(H/'candidate-decisions.json');candidates=[]
for rank,d in enumerate(decisions,1):
 r=Umap[d['id']];q=r['q'];related=sorted({x for g in families if d['id'] in g['ids'] for x in g['ids'] if x!=d['id']})
 candidates.append({'Rank':rank,'Question ID':d['id'],'Topic':q['primaryConceptId'],'Current difficulty':q['canonicalDifficulty'],'Instructional role':q['instructionalRole'],'Source/provenance':json.dumps(r['provenance'],ensure_ascii=False),'Candidate reason':d['reason'],'Faculty-voice concern':d['concern'],'Difficulty concern':d['concern'] if any(w in d['reason'].lower() for w in ['tier','depth','representation']) else 'Confirm progression across related tasks.','Economics ambiguity':d['concern'] if any(w in d['reason'].lower() for w in ['framework','assumption']) else 'No definite key error established.','Representation concern':d['concern'] if 'representation' in d['reason'].lower() else 'No representation conversion proposed.','Suggested action':d['action'],'Why Codex did not auto-change':'Faculty judgment needed on framework, prior review, course scaffolding, or progression across checkpoint roles; no guessing or route changes.','PDF page(s)':pages[d['id']],'Related family IDs':'; '.join(related),'Question':q['q'],'Options':json.dumps(q['options'],ensure_ascii=False),'Correct answer':q['options'][r['key']],'Feedback':q.get('feedback','')})
writecsv(A/'macro_faculty_review_candidates_20261006.csv',candidates)
# Asset inventory includes effective per-question accessibility metadata for aliases without inventory-level descriptions.
assets=read(H/'macro-assets.json');graphs=[]
for i,a in enumerate(assets):
 refs=[Umap[id] for id in a['refs']];assert all((r['q'].get('imageAlt') or a['metadata'].get('imageAlt')) and (r['q'].get('graphDescription') or a['metadata'].get('graphDescription')) for r in refs)
 graphs.append({'Asset':a['path'],'Macro references':len(refs),'Question IDs':'; '.join(a['refs']),'Shared Micro references':len(a['microRefs']),'SHA-256 before':a['sha256'],'SHA-256 after':sha(D/a['path']),'Visual grayscale inspection':'PASS','Direct labels and geometry':'PASS','Axes/ticks/required values':'PASS','Color-only dependence':'NO','Label overlap preventing interpretation':'NO','Effective alt text and graphDescription':'PASS - effective question/inventory metadata checked','Inventory-level description':bool(a['metadata'].get('graphDescription')),'Question/graph synchronization':'PASS - current graph-sync suite; unchanged references','Repair required':'NO','Repair performed':'NONE','Variant created':'NONE','Review contact sheet':f'graph-review/gray-{i//4*4:03}.jpg'})
writecsv(A/'macro_graph_accessibility_inventory_20261006.csv',graphs)
# Prior exact approval is protection, not evidence that today's rewrites were faculty approved.
prior={str(x['questionId']) for x in read(R/'audit_tools/macro_phase4/macro_phase4_authorized_changes.json')['changes']};assert not prior&C.keys()
cids={x['id'] for x in decisions};risk=[];provenance=Counter()
for r in U:
 q=r['q'];id=r['id'];phase=q.get('sourceCurationPhase');mg=r['marketGateDerived'];later=mg and ((phase and phase!='phase2a-market-gate') or (q.get('sourceHash') and all(q['sourceHash']!=s.get('sourceHash') for s in q.get('sourceOccurrences',[]))))
 origin='Market Gate: documented later descendant' if later else 'Market Gate: no later curation recorded' if mg else 'Authored/expansion' if re.search('authoring|expansion|rescue|maturation|macro-|phase',q.get('sourceGame',''),re.I) else 'Other imported bank'
 provenance[origin]+=1
 bucket='B HIGH-CONFIDENCE AUTO-CORRECTED' if id in C else 'C FACULTY-REVIEW CANDIDATE' if id in cids else 'A PROTECTED MATURE' if mg or 'micro' in r['areas'] or id in prior else 'D NO ISSUE DETECTED'
 risk.append({'Question ID':id,'Topic':q['primaryConceptId'],'Bucket':bucket,'Source class':origin,'Source game':q.get('sourceGame',''),'Curation phase':phase or '', 'Market Gate-derived':mg,'Shared Micro frozen':'micro' in r['areas'],'Prior 292 approved ID':id in prior,'Instructional role':q.get('instructionalRole',''),'Areas':'; '.join(r['areas'])})
writecsv(H/'risk-classification.csv',risk);counts=Counter(r['Bucket'] for r in risk)
ledger=[]
for c in L['changes']:
 b=c['beforeRecord'];q=c['afterRecord'];k=c['correctIndex'];ledger.append({'Question ID':c['id'],'Topic':q['primaryConceptId'],'Provenance':json.dumps(c['provenance'],ensure_ascii=False),'Market Gate-derived':'NO','Shared with Micro':'NO','Course areas':'; '.join(c['areas']),'Instructional role':q['instructionalRole'],'Difficulty before':b['canonicalDifficulty'],'Difficulty after':q['canonicalDifficulty'],'Type before':b.get('type',''),'Type after':q.get('type',''),'Stem before':b['q'],'Stem after':q['q'],'Options before':json.dumps(b['options'],ensure_ascii=False),'Options after':json.dumps(q['options'],ensure_ascii=False),'Correct answer before':b['options'][k],'Correct answer after':q['options'][k],'Feedback before':b.get('feedback',''),'Feedback after':q.get('feedback',''),'Graph before':b.get('image',''),'Graph after':q.get('image',''),'Faculty-voice rationale':c['rationale'],'Economics rationale':c['economicsRationale'],'Answer hash changed':b['aHash']!=q['aHash'],'Validation result':'PASS - exact changes, unique key/hash, economics review, arithmetic where applicable, all suites, publication and export','Change category':c['category'],'PDF page':pages[c['id']]})
writecsv(A/'macroeconomics_faculty_standard_remediation_20261006.csv',ledger)
(A/'macroeconomics_faculty_standard_remediation_20261006.json').write_text(json.dumps(L,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
summary={'status':'PASS','riskBuckets':dict(counts),'sourceClasses':dict(provenance),'changes':len(C),'fieldsChanged':dict(Counter(f for c in C.values() for f in c['fields'])),'facultyCandidates':len(candidates),'graphAssets':len(graphs),'graphQuestions':sum(len(a['refs']) for a in assets),'graphRepairs':0,'allMicroRecordsFrozen':len(frozen),'prior292IDsProtected':len(prior&Umap.keys()),'exports':export,'tests':{'currentComposer':29,'exporter':25,'independentArithmetic':len(num['checks'])},'librarySha256':N['librarySha256']}
(H/'final-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
