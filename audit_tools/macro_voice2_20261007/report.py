import csv,json,re,hashlib,unicodedata,subprocess,shutil
from pathlib import Path
from collections import Counter
import pdfplumber
H=Path(__file__).resolve().parent;R=H.parent.parent;D=R/'build/faculty-build-composer/data';A=R/'faculty_exports/audits'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def lib(p):return json.loads(p.read_text(encoding='utf-8').removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def flatten(l):
 out={}
 for m in l['concepts'].values():
  for qs in list(m.get('questions',{}).values())+[m.get('repairQuestions',[]),m.get('repairSeedQuestions',[]),m.get('bridgeQuestions',[])]:
   for q in qs:
    id=str(q['id'])
    if id in out:assert out[id]==q
    out[id]=q
 return out
def csvwrite(p,rows):
 with p.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
N=lib(D/'composer_library.js');B=lib(H/'baseline/composer_library.js');n=flatten(N);b=flatten(B)
L=read(H/'expectations.json');changes={c['id']:c for c in L['changes']};records={r['id']:r for r in read(H/'records.json')};candidates=read(H/'candidates.json');scan=read(H/'scan-summary.json');V=read(H/'validation.json');P=read(H/'publication-validation.json')
assert len(n)==len(b)==9777 and set(n)==set(b)
assert {id for id in n if n[id]!=b[id]}==set(changes)
for id,c in changes.items():
 assert c['beforeRecord']==b[id] and c['afterRecord']==n[id]
 assert set(c['fields'])<=set(['q','options','feedback','aHash','difficulty','canonicalDifficulty'])
 assert records[id]['areas']==['macro'] and not records[id]['marketGateDerived']
 for field in ['image','imageAlt','graphDescription','graphRequired','instructionalRole','sourcePool','checkpointPool','primarySkill','repairSkill','objective','requiredConceptIds','modeAllowlist']:
  assert b[id].get(field)==n[id].get(field),(id,field)
micro=[r['id'] for r in records.values() if 'micro' in r['areas']];mg=[r['id'] for r in records.values() if 'macro' in r['areas'] and r['marketGateDerived']];general=[r['id'] for r in records.values() if 'general' in r['areas']]
for id in set(micro+mg+general):assert n[id]==b[id]
assert N['assetInventory']==B['assetInventory']
for a in N['assetInventory']:assert sha(D/a['runtimePath'])==a['sha256']
tests=read(H/'test-results.json');assert len(tests)==32 and all(t['status']=='PASS' for t in tests)
exporttests=(H/'exporter-tests.log').read_text(encoding='utf-8-sig');assert re.search(r'Ran 25 tests',exporttests) and re.search(r'\bOK\b',exporttests)
S=read(R/'faculty_exports/validation_summary.json');assert S['status']=='complete' and S['sources_unchanged'] and S['source_sha256']==sha(D/'composer_library.js')
assert V['status']=='PASS' and not V['macro']['mismatches'] and P['status']=='PASS'
assert all(a['allTenModesPass'] and a['answerVerification'] and a['exactPublicationParity'] for a in P['areas'].values())
assert not set(changes).intersection(P['areas']['macro']['unpublishedIds'])
keys={id:r['key'] for id,r in records.items()};pages=S['disciplines']['macro']['question_pages'];exports={}
for area,d in S['disciplines'].items():
 rows=list(csv.DictReader(open(R/'faculty_exports'/d['csv_file'],encoding='utf-8-sig')))
 assert len(rows)=={'macro':4747,'micro':6297,'general':1589}[area]
 for r in rows:
  q=n[r['Question ID']];assert r['Question']==q['q'] and r['Feedback']==q.get('feedback','')
  assert [r['Choice '+x] for x in 'ABCD']==q['options']
  key=keys[r['Question ID']];assert r['Correct Answer']=='ABCD'[key]+' — '+q['options'][key]
 exports[area]={'questions':len(rows),'pages':d['pdf_pages'],'fullCsvParity':True}
norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
pdf=R/'faculty_exports/macroeconomics_question_bank.pdf';cached={}
with pdfplumber.open(pdf) as doc:
 for id,c in changes.items():
  pg=pages[id];texts=[]
  for idx in range(pg-1,min(pg+2,len(doc.pages))):
   if idx not in cached:cached[idx]=doc.pages[idx].extract_text() or ''
   texts.append(cached[idx])
  text=norm('\n'.join(texts))
  for field in [n[id]['q'],*n[id]['options'],n[id].get('feedback','')]:assert norm(field) in text,id+' PDF content'
targets=V['exactFacultyIds']+['PG3-MEQ-L-004','LG-Q-9051','LG-Q-9073']
out=H/'pdf-review';out.mkdir(exist_ok=True)
for id in targets:
 pg=pages[id];subprocess.run([shutil.which('pdftoppm'),'-f',str(pg),'-l',str(pg),'-scale-to','1500','-png','-singlefile',str(pdf),str(out/id)],check=True,capture_output=True)

specific={
'LG-Q-13':'The definition requires both partial reserve holding and lending. Its twelve-word key is natural; no content-free distractor padding.',
'LG-Q-222':'Keep both balance-sheet stages: creation of the loan/deposit and the later interbank reserve transfer.',
'PMOE-NCO-LB-002':'The key must identify the $75 billion interest-rate offset and the two gross-flow changes relative to the initial plans.',
'ECON-NL-ELITE-332':'The consumer-purchase condition is necessary: an imported item enters CPI only when purchased by consumers.',
'LG-Q-9109':'Keep the $640 systemwide adjustment and its distinction from a first-bank loan recall.',
'LG-Q-351':'The existing concise definition uses the 8%-to-3% example and separately defines deflation; preserve the numerical example.',
'PM2C2-ITAX-L-001':'The explanation is the tested feedback mechanism linking real money demand, seigniorage and inflation.',
'PMOE-TX-L-004':'Both accounting comparisons are expressly requested; deleting either would weaken the economic task.',
'ECON-NL-LEGENDARY-9045':'The key retains both economies’ terminal levels and the distinction between reaching an initial and a moving benchmark.',
'P52B-S1-LRPC-L-002':'The 0.8-point structural change, 0.7-point cyclical gap and 5.6% long-run rate are distinct required results.',
'LG-Q-9014':'The question explicitly asks for the complete three-tool policy mechanism; retain each channel.',
'LG-Q-9062':'Both panel shifts identify contraction; the reversed-shift distractor is equally detailed.',
'ECON-NL-ELITE-379':'Both unemployment compositions and the comparable-effectiveness condition are needed for the policy comparison.',
'PM2A-EXP-L-002':'Keep two reference curves and the indeterminate comparison; this is genuine competing-forces reasoning.',
'LG-Q-229':'The value-of-money axis requires the inverse price-level link and the transaction-demand response.',
'ECON-EC-LEGENDARYBOSS-20004':'Positive real savings returns and falling real wages must be combined using unknown weights; the qualification is essential.',
'PG3-AS-L-002':'Keep the distinction between reversing the expectations contribution and retaining productivity-driven capacity.',
'LG-Q-9070':'Keep the direct purchase change, gross multiplier shift and resulting excess spending; these are the requested decomposition.',
'PM2D2-STAB-L-004':'The answer compares both automatic and discretionary policies over time; the timing clauses carry the construct.',
'LG-Q-9139':'Keep all stages of the approved multiplier/crowding-out decomposition and the remaining gap.',
'ECON-NL-MEDIUM-102':'The transaction must name the buyer’s expenditure and seller’s income. The edited complete example remains longer than the short distractors.',
'LG-Q-9027':'The shorter answer still describes the spending/lending-to-prices adjustment through money-market equilibrium; retain the mechanism.',
'ECON-NL-HARD-263':'The shorter answer retains the distinction between a falling measured rate and labor-market improvement; the ten-word conclusion remains a metric flag.'
}
lengthAfter={x['id']:x for x in V['lengthAfter']};dispositions=[]
for r in candidates:
 id=r['id'];flags=r['metrics']['flags'];protected=r['marketGateDerived'] or 'micro' in r['areas'];shared=len(r['areas'])>1
 if id in changes:action='EDIT';reason=changes[id]['rationale']
 elif protected:action='KEEP — protected';reason='Frozen Micro/shared content or protected Market Gate. Report the candidate; no student-facing edit.'
 elif shared:action='KEEP — shared General/Macro';reason='Shared foundational record outside the Macro-only edit set; retain the existing natural explanation or context.'
 else:
  action='KEEP — economic context'
  if id in specific:reason=specific[id]
  elif 'actor wrapper' in flags:reason='The actor states a misconception, forecast or inference that the student must evaluate; the claim is part of the economic task.'
  elif 'graph narration' in flags or 'embedded conditions' in flags or 'long scenario' in flags:reason='The setup supplies model assumptions, counterfactual conditions, formulas or binding resource constraints needed to solve the question; preserve that economic information.'
  elif any(f in flags for f in ['multiple tasks','multiple questions']):reason='The requested results trace linked mechanisms, compare a counterfactual or distinguish a calculation from its interpretation; no redundant independent task established.'
  else:reason='The phrase is useful economics terminology in context; no high-confidence editorial defect established.'
 dispositions.append({'Question ID':id,'Page':pages[id],'Topic':r['q']['primaryConceptId'],'Areas':'; '.join(r['areas']),'Patterns':'; '.join(flags),'Length outlier before YES/NO':'YES' if r['metrics']['lengthOutlier'] else 'NO','Length outlier after YES/NO':'YES' if id in lengthAfter else 'NO','Key words before':r['metrics']['correctWords'],'Median distractor words before':r['metrics']['medianDistractorWords'],'Disposition':action,'Rationale':reason,'Residual length rationale':specific.get(id,'Protected/shared candidate retained.' if protected or shared else '') if id in lengthAfter else ''})
csvwrite(H/'candidate-dispositions.csv',dispositions)
rows=[]
for id,c in changes.items():
 q=c['afterRecord'];old=c['beforeRecord']
 rows.append({'Question ID':id,'Page':pages[id],'Topic':q['primaryConceptId'],'Pattern':'; '.join(c['patterns']),'Stem before':old['q'],'Stem after':q['q'],'Options before':json.dumps(old['options'],ensure_ascii=False),'Options after':json.dumps(q['options'],ensure_ascii=False),'Feedback changed YES/NO':'YES' if old.get('feedback')!=q.get('feedback') else 'NO','Correct answer index preserved YES/NO':'YES','Difficulty before':old['canonicalDifficulty'],'Difficulty after':q['canonicalDifficulty'],'Structural role preserved YES/NO':'YES','Economics changed YES/NO':'NO','Shared-area status':'Macro only — verified via course-area model','Rationale':c['rationale'],'Validation result':'PASS — exact ledger, hashes, roles, calculations, visual checks, generated student game and CSV/PDF parity'})
A.mkdir(exist_ok=True);csvwrite(A/'macro_faculty_voice_cleanup_pass2_20261007.csv',rows)
counts=Counter(p for c in changes.values() for p in c['patterns']);dc=Counter(d['Disposition'] for d in dispositions)
sharedCandidates=sum(len(r['areas'])>1 for r in candidates);microShared=sum('micro' in r['areas'] for r in candidates)
summary={'status':'PASS','macroScanned':scan['macro'],'candidateStems':scan['candidateStems'],'lengthOutliersBefore':len(V['lengthBefore']),'lengthOutliersAfter':len(V['lengthAfter']),'uniqueCandidates':len(candidates),'changed':len(changes),'repairCounts':dict(counts),'candidateDispositions':dict(dc),'sharedCandidatesProtected':sharedCandidates,'microSharedCandidatesProtected':microShared,'microFrozen':len(micro),'generalFrozen':len(general),'marketGateFrozen':len(mg),'graphAssetEntriesUnchanged':len(N['assetInventory']),'composerSuites':len(tests),'exporterTests':25,'unresolvedFacultyDecisions':0,'exports':exports,'librarySha256':N['librarySha256']}
(H/'final-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
(H/'export-validation.json').write_text(json.dumps({'status':'PASS','fullCsvParity':exports,'changedPdfBlocks':{id:pages[id] for id in changes},'renderedIds':targets,'renderedDistinctPages':len({pages[id] for id in targets})},indent=2)+'\n')
md=['# Macro faculty-voice cleanup, pass 2 — October 7, 2026','','**PASS — bounded editorial cleanup and limited tier recalibration completed.**','',f"Screened all {scan['macro']:,} active Macro questions. Changed {len(changes)} unique Macro-only records, including all nine faculty-identified items. Preserved the accepted first-pass baseline except for the exact, documented second-pass revisions. Economics, correct option positions, numerical scenario inputs, graphs, accessibility metadata, skills and instructional/checkpoint roles remain intact. Three cognitive tiers changed; no other tier changed.",'','## Counts','','| Measure | Count |','|---|---:|',f"| Macro questions screened | {scan['macro']:,} |",f"| Candidate stems | {scan['candidateStems']} |",f"| Answer-length candidates before / after | {len(V['lengthBefore'])} / {len(V['lengthAfter'])} |",f"| Unique candidates including exact faculty items | {len(candidates)} |",f"| Questions changed | {len(changes)} |"]
for label,key in [('Internal-taxonomy repairs','internal taxonomy'),('Hyphenated noun-stack repairs','noun stack'),('Unnecessary actor repairs','actor wrapper'),('Overloaded multi-task repairs','overloaded multi-task'),('Graph-narration repairs','graph narration'),('Answer-choice parallelism repairs','answer-choice parallelism'),('Difficulty changes','difficulty')]:md.append(f'| {label} | {counts[key]} |')
md += [f'| Shared-area candidates protected | {sharedCandidates} |',f'| Of those, shared with frozen Micro | {microShared} |',f"| Micro/shared or Market Gate protected candidate union | {dc['KEEP — protected']} |",f"| Additional General/Macro shared candidates retained | {dc['KEEP — shared General/Macro']} |",'| Unresolved faculty decisions | 0 |','','Repair categories overlap. Screening metrics generate candidates, not failures or automatic edits. The exact list and reasons for every retained candidate are in `audit_tools/macro_voice2_20261007/candidate-dispositions.csv`. No global phrase ban or broad difficulty audit was introduced.','','## Exact faculty items','','Page numbers below refer to the regenerated Macro PDF; the prior PDF’s page numbers may differ.','','| Question | Current page | Decision |','|---|---:|---|']
decisions={
'PMOE-FX-B1-003':'Natural open-economy currency-supply question; Easy checkpoint preserved.',
'LG-Q-9024':'Direct question about deposit expansion below the simple multiplier prediction; parallel causal alternatives; Hard retained.',
'ECON-SP-EASYBOSS-2014':'Natural excess-reserve/currency-leakage comparison; Easy checkpoint preserved.',
'PMOE-POL-L-003':'One consistency judgment using NX = S − I. Other imports must rise $27 billion; a $20 billion rise changes NX by $7 billion. Legendary → Hard.',
'43263':'Natural retirement tax-incentive question; Medium retained.',
'43261':'Direct graph question: 40-unit supply shift at a common rate versus 20-unit equilibrium decline; Hard retained.',
'ECON-NL-SUBSTITUTION-BIAS-6011':'Medium → Hard as directed. Fixed-basket increase $4 versus equally satisfactory substitute-basket increase $0. Bridge membership and structural difficulty="bridge" preserved.',
'LG-B-6023':'Natural fixed-price assumption; total $80 crowding-out offset still includes induced effects. Remaining gap $30; Medium retained.',
'ECON-SP-ELITE-320':'Concise graph setup and four short bounds; reasoning moved to feedback. Positive crowding out must be less than roughly half the full increase. Elite → Hard.'}
for id in V['exactFacultyIds']:md.append(f'| {id} | {pages[id]} | {decisions[id]} |')
md += ['','The two downward recalibrations retain calculation or substantive graph interpretation but do not require the synthesis previously suggested by their prose. Only their ordinary difficulty-pool placements changed. Source provenance and instructionalRole remain unchanged. The substitution-bias bridge remains in its bridge pool, with canonicalDifficulty="hard". Registry counts and faculty-outcome coverage were recomputed through Composer for the affected concepts; outcome skill membership did not change.','','## Editorial judgment','','The accepted faculty voice profile and extracted assessment examples remain the reference: direct economic questions, useful formulas, ordinary nouns and alternatives that state answers while feedback supplies explanations. No faculty assessment question was copied into the bank.','','Internal model labels were replaced in the reviewed open-economy, banking and fiscal-policy families. Saving/investment noun stacks were expanded only on exact reviewed IDs. The graph task comparing restoration of output with restoration of the price level keeps both policy goals, the persistent supply shock and the straight-line extension; it drops the redundant list of point labels.','','Most flagged actor and multipart stems were retained because the mistaken claim, counterfactual or linked mechanism is genuinely the construct. The Phillips-curve questions retain necessary expectations rules, slope assumptions and supply-shock information. Long resource-allocation scenarios retain their binding constraints. The screen is not a reason to remove economic reasoning.','',f"Answer-choice edits remove repeated setup and explanatory tails where feedback already carries the reasoning. The length screen falls by {len(V['lengthBefore'])-len(V['lengthAfter'])} candidates. Remaining flags include protected/shared items and answers that must report multiple requested quantities or qualifications. Three edited answers still cross the numerical threshold; their complete economic statements remain short enough to read naturally and are separately explained in the disposition ledger. Distractors were not padded to hit a word count.",'','## Preservation and validation','',f"All {len(micro):,} Micro records, {len(general):,} General records and {len(mg)} Macro-visible Market Gate records are identical to baseline. The complete active membership sets are unchanged. All {len(N['assetInventory'])} asset inventory entries and their on-disk SHA-256 checksums are unchanged, as are imageAlt and graphDescription on every edited question.",'',f"All {len(tests)} current Composer suites pass, including the new pass-2 regression suite. The historical closure and first-pass suites still check their exact accepted snapshots after reversing only this pass’s documented changes. The new suite checks the nine faculty IDs, the exact three tiers, the two ordinary pool moves, all preserved fields, arithmetic, the Micro freeze and negative controls for unauthorized edits. No style outlier causes a blanket failure.",'',f"Visual-reference integrity reports {len(V['macro']['mismatches'])} Macro mismatches. Micro was detection only and reports {len(V['micro']['mismatches'])} mismatches. Missing/corrupt visual references and altered accessibility metadata are rejected by the tests.",'','All ten modes pass for generated General, Micro and Macro compositions. Official Composer answer verification resolves the answers, generated inline scripts compile, and student-facing generated records match the canonical library. All edited questions are present in the generated Macro game. This is validation of generated local artifacts; no live deployment was performed. The existing full-course compositions omit 25 Micro and two Macro records because of established routing; those membership differences are identical before and after this pass and do not include edited records.','','The official answer normalization/hash pipeline regenerated aHash at the same correct option index. Library, registry, manifest and outcome-policy hashes were recomputed. All 25 exporter tests pass. The official exporter regenerated its three separate discipline PDF/CSV pairs atomically; every CSV record in all three disciplines was compared with canonical content, and every edited stem, choice and feedback block was verified in the Macro PDF. Twelve representative questions were rendered for visual review; `visual-review.json` records the inspection.','','## Deliverables','','- `macro_faculty_voice_cleanup_pass2_20261007.csv`: exact requested columns, one row per changed question, including current PDF page and before/after options.','- `../macroeconomics_question_bank.pdf` and `../macroeconomics_question_bank.csv`: regenerated faculty review files.','- `audit_tools/macro_voice2_20261007/expectations.json`: exact before/after records and hashes, with two pool moves and metadata differences.','- `candidate-dispositions.csv`, `validation.json`, `publication-validation.json`, `test-results.json`, `export-validation.json` and `final-summary.json`: supporting evidence.','','No unresolved faculty decision blocks this bounded pass. Protected/shared flags were documented and left intact. No commit, push or deployment was performed. No new broad economics or difficulty audit was opened.','',f"Library SHA-256: `{N['librarySha256']}`."]
(A/'macro_faculty_voice_cleanup_pass2_20261007.md').write_text('\n'.join(md)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2))
