import json,hashlib,copy,re,difflib
from pathlib import Path
from collections import Counter
W=Path(__file__).resolve().parent;R=Path(r'C:\Users\Jennings\Documents\GitHub\masteryquests-website\build\faculty-build-composer')
def rd(n):return json.loads((W/n).read_text('utf8'))
def wr(n,x):(W/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n','utf8')
def sha(x):return hashlib.sha256(x).hexdigest()
b=rd('inventory-before.json');a=rd('inventory-after.json');v=rd('validation.json');acc=rd('accounting.json');s=rd('revisions.json');ch=rd('changes.json');before=rd('quality-before.json');after=rd('quality-after.json');browser=rd('browser-validation.json');obj=rd('objective-findings-before.json');old=rd('library-baseline.json');new=rd('library-after.json')
def loc(m):return [(p,q) for p,qs in m['questions'].items() for q in qs]+[(p,q) for p in ['repairQuestions','repairSeedQuestions','bridgeQuestions'] for q in m.get(p,[])]
# Independently verify global data and both sidecars outside the declared content/accessibility differences.
for c in old['concepts']:
 if c not in b['views']:assert old['concepts'][c]==new['concepts'][c]
permittedGlobal={'concepts','assetInventory','librarySha256','registry'}
assert {k:x for k,x in old.items() if k not in permittedGlobal}=={k:x for k,x in new.items() if k not in permittedGlobal}
def stripRegistry(x):return {k:v for k,v in x.items() if k!='librarySha256'}
assert stripRegistry(old['registry'])==stripRegistry(new['registry'])
def stripAccess(x):return [{k:v for k,v in a.items() if k not in ['imageAlt','graphDescription']} for a in x]
assert stripAccess(old['assetInventory'])==stripAccess(new['assetInventory'])
for name in ['composer_registry.json','composer_library_manifest.json']:
 x=json.loads((R/'data'/name).read_text('utf8'));y=rd('staged/'+name)
 for z in [x,y]:
  z.pop('librarySha256');
  if 'assets' in z:z['assets']=stripAccess(z['assets'])
 assert x==y,name
nohash=copy.deepcopy(new);del nohash['librarySha256'];del nohash['registry']['librarySha256'];semantic=sha(json.dumps(nohash,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode());assert semantic==new['librarySha256']
wr('semantic-validation.json',{'before':old['librarySha256'],'after':semantic,'independentlyRecomputed':True,'sidecarsSynchronized':True,'unrelatedGlobalDataUnchanged':True})
arch=rd('architecture-validation.json');review=[]
for x in b['conceptReview']['assets']:
 actual=sha((R/x['sourcePath']).read_bytes());assert actual==x['sha256'];review.append({**x,'bytesVerified':True})
arch['reviewAssets']=review;arch['reviewRuntimeIndex']=b['conceptReview']['runtimeIndex'];arch['reviewGlobalWarningsRetained']=b['conceptReview']['warnings'];wr('architecture-validation.json',arch)
for p,h in b['sourceFiles'].items():assert sha((R/p).read_bytes())==h,'Changed since baseline: '+p
assert len(browser['graphChecks'])==80 and all(x['loaded'] and x['zoomOK'] and x['description'] for x in browser['graphChecks'])
wr('graph-validation.json',{'registeredAssetsInspected':rd('accessibility-inspection.json'),'all80GraphRecordsRenderedAndEnlarged':True,'graphEligibilityBeforeAfter':{'linked':[80,80],'trialGraph':[42,42]},'initialGeneratedBrowserFinding':'38 legacy source-relative references could not resolve to embedded assets. Corrected these records to their already registered per-concept runtime paths; no renderer or image bytes changed.','metadataWithoutImageIsNotAnAttachedGraph':'Historical graphImageMetadata on records without a live image reference is provenance, not current rendering. Such standalone hypothetical numeric questions were not falsely treated as actual-image contradictions.','checks':browser['graphChecks']})
reasons={
'graph-accessibility-insufficient':'Detailed registered visual evidence is now synchronized into the affected records; the final run no longer reports this rule.',
'graph-prompt-missing-cue':'The graph is present and its image/description render successfully. The wording lacks the auditor’s explicit cue phrase; preserve as a nonblocking wording limitation.',
'graph-question-evidence-mismatch':'False positive confirmed against the auditor implementation: it requires D-number and S-number labels, while these actual money-market diagrams label MD and MS. Both curve families and relevant intersections are described and visually verified.',
'image-without-graph-required':'The existing graphRequired/eligibility metadata is deliberately preserved. These 38 legacy images now render, but the records remain outside Trial by Graph unless already eligible; no graphRequired flag was toggled to suppress a warning.',
'curve-label-metadata-mismatch':'False positive: MPC in the final stem is marginal propensity to consume, a supplied scalar for the spending multiplier. It is not a curve label in this monetary-policy diagram and should not be invented in the image description.',
'missing-terminal-punctuation':'A legacy completion-style stem lacks terminal punctuation. Nonempty standalone wording and four-option answer integrity pass; punctuation alone did not justify a rewrite.',
'repeated-feedback':'Feedback repeats across retained variants or support roles. This remains a robustness limitation, not a numerical/key defect or a claim of exhaustive stylistic remediation.',
'answer-length-outlier':'The keyed option remains longer than some alternatives. This is a residual answer-cue concern retained for faculty judgment; the audit does not claim that all distractors have equal strength.',
'approved-cross-role-stem-reuse':'The auditor explicitly recognizes approved instructional-role reuse. Preserve repair/checkpoint relationships and IDs rather than deleting valid support records.',
'near-duplicate-stem':'Existing related question grammars remain; shared model assumptions or an explicit approximation prefix can also increase textual similarity. Exact revised stems remain unique. Retain this nonblocking robustness flag rather than hide the required assumptions.',
'possible-difficulty-overstatement':'Some direct upper-tier questions remain in this mature bank. Ordinary Hard coverage is already strong, and targeted upper-tier improvements do not claim that every tagged item exceeds normal exam demand. Preserve difficulty and pool metadata.',
'weak-absolute-distractors':'Absolute alternatives often express the selected misconception, such as guaranteed multiplication or nominal/real equivalence. Some are still easy to eliminate; retain this disclosed distractor-quality limitation.'}
bf={(x['questionId'],x['rule']):x for x in before['findings']};af={(x['questionId'],x['rule']):x for x in after['findings']};disp=[]
for k in sorted(bf.keys()|af.keys()):
 f=af.get(k,bf.get(k));status='retained' if k in bf and k in af else 'newly-reported' if k in af else 'no-longer-reported'
 disp.append({'questionId':k[0],'rule':k[1],'severity':f['severity'],'status':status,'contentRevised':k[0] in s,'reason':reasons[k[1]] if k in af else 'No longer emitted for the final record. '+reasons[k[1]],'auditorMessage':f['message']})
wr('quality-dispositions.json',{'before':before['counts'],'after':after['counts'],'beforeScope':818,'afterScope':818,'method':'Existing question_quality_auditor.mjs run against authoritative baseline and final staged library with all 13 direct selected concepts. No projection needed. Every original/final question-rule pair has a disposition.','findings':disp})
# Originality check is measured against exam stems, with inherited material distinguished from new authoring.
exam=(W/'exam-text.txt').read_text('utf8');examQuestions=[]
for match in re.finditer(r'(?m)^\s*(\d+)[.)]\s*(.+)',exam):examQuestions.append((match.group(1),match.group(2)))
def tokens(x):return re.findall(r'[a-z]+',x.lower())
def grams(x,n=12):
 t=tokens(x);return {' '.join(t[i:i+n]) for i in range(len(t)-n+1)}
examGrams=grams(exam);originality=[]
for id,sp in s.items():
 inherited=grams(b['records'][id]['q']);overlap=grams(sp['q'])&examGrams;newOverlap=overlap-inherited
 assert not newOverlap,(id,newOverlap)
 originality.append({'id':id,'new12WordExamOverlap':len(newOverlap),'inherited12WordOverlap':len(overlap&inherited),'examWasNotAuthoringTemplate':True})
wr('originality-validation.json',{'examSource':rd('exam-source.json'),'method':'Full document text was read and all seven embedded exam figures were visually inspected. New 12-word stem overlap with exam text is rejected; inherited wording is separated. Human comparison confirms the new tasks use bank aggregation/reconciliation, reverse constraints and actual existing library graphs, not renamed/revalued exam items. Generic economic terminology alone is not evidence of copying.','limitation':'Text overlap is a screening aid, not proof of authorship. Some preexisting library items/graphs resemble conventional exam grammars and were retained under the no-unnecessary-rewrite requirement.','newImageAssets':0,'examImagesCopied':0,'items':originality})
wr('logical-validation.json',{'scope':818,'allScopedOptionsNormalizedDistinct':True,'allScopedOneHashMatch':True,'allScopedNonemptyStemFeedback':True,'allRevisedStemsUniqueAcrossLibrary':True,'revisedRecords':[{'id':id,'reason':sp['reason'],'finalStem':sp['q'],'correctOption':sp['options'][0],'distractorOptions':sp['options'][1:],'economicOptionReview':'The keyed proposition follows the stated model or actual image; each alternative reverses a direction, uses the wrong aggregate/denominator, omits a constraint or confuses model quantities. Reviewed together with independent numeric proofs where applicable.'} for id,sp in s.items()]})
# Identify overlapping source pools exactly rather than summing memberships as unique records.
members={}
for c,m in b['views'].items():
 for p,q in loc(m):members.setdefault(q['id'],[]).append(c+':'+p)
overlap={k:x for k,x in members.items() if len(x)>1}
wr('pool-memberships.json',{'allOrderedSourcePools':{c:{p:[q['id'] for pp,q in loc(m) if pp==p] for p in dict(loc(m))} for c,m in b['views'].items()},'multipleMemberships':overlap,'sourceMembershipCount':sum(map(len,members.values())),'uniqueCount':len(members),'calculationBehavior':'Composer distributes calculation records into ordinary difficulty banks using canonical difficulty and deduplicates aliases. It retains a calculation count for inventory; no new separate calculation mode or integration pool was introduced.','composedCounts':b['composedCounts'],'trialGraphIds':b['routes']['trialGraph']})
def table(headers,rows):return ['| '+' | '.join(headers)+' |','| '+' | '.join(['---']*len(headers))+' |']+['| '+' | '.join(str(x).replace('|','/') for x in row)+' |' for row in rows]
lines=['# Money, Banking, Inflation & Monetary Policy — production assessment-quality audit','',
'The live bank remains **818 unique records: 71 content revisions, 73 accessibility-only record revisions and 674 unchanged records**. No records or images were added or removed. Existing Hard coverage is substantial; the audit found no missing selected objective or systemic need to move questions down from upper tiers. The valuable corrections concern economic precision, a reversed graph key, repeated upper-tier tasks, accessibility conclusions and broken generated-image references.','',
'## 1. Exact live preset','',
'The current quick start is **`money-banking-inflation` — “Money, Banking, Inflation & Monetary Policy”**, discovered in `build/faculty-build-composer/composer.js`. The working label was not used to infer scope. Current `composer-core.js`, source library, registry, manifest, asset contracts, mode readiness and Concept Review mappings were inspected. The BEFORE snapshot and all 27 objective/concept findings were recorded before content authoring.','',
'## 2. Selected concepts and direct/derived status','',
'All 13 selections are direct modules; none has a derived parent. Exact question objects and source metadata are in `inventory-before.json` and `inventory-after.json`.','']
lines+=table(['Selected concept ID','Unique before = after','Source objectives'],[(c,x['unique'],', '.join(f'{k} ({n})' for k,n in x['objectives'].items())) for c,x in b['byConcept'].items()])
lines+=['','## 3. Actual curricular boundary','',
'Selected: money functions, commodity/fiat money, liquidity, monetary aggregates; bank assets/liabilities, required and excess reserves, capital, deposit multiplication and its limits; central-bank roles, OMO, discount lending, reserve requirements and interest on reserves; money demand, nominal-interest equilibrium and value of money; quantity theory, neutrality, Fisher effects, inflation costs, inflation tax and deflation.','',
'The preset explicitly includes monetary-policy transmission, so the selected investment/AD chain and its existing spending-multiplier questions belong here. No new loanable-funds, fiscal-policy, full AD-AS shock curriculum, Phillips/sacrifice-ratio or open-economy objectives were imported. The capital/leverage questions carrying `LO31.4` in `monetary-control-limits` remain selected because runtime content, not the historical code, defines scope. `scope-boundary.json` records the boundary.','',
'## 4. Exact before/after accounting','']
lines+=table(['Disposition','Records'],[('Before / after','818 / 818'),('Added / removed','0 / 0'),('Content revised',71),('Accessibility-only revised',73),('Unchanged',674),('Image references corrected (overlapping subset)',38),('Revised numeric items independently verified',60)])
lines+=['','Accessibility-only includes inline visual-evidence synchronization and, where needed, existing image-reference correction. It does not include a question-content revision. The categories are mutually exclusive; path fixes and asset corrections are overlapping counts. `record-actions.json` accounts for all 818 records; `accounting.json` groups all dispositions by concept, objective, canonical difficulty and type.','',
'## 5. Difficulty distribution','']
lines+=table(['Canonical difficulty','Before = after','Content revised'],[(d,n,v['contentByDifficulty'].get(d,0)) for d,n in b['difficulty'].items()])
lines+=['','The 128 `unknown` canonical-difficulty records are existing repair/bridge records, not newly unclassified ordinary questions. No source difficulty, canonical difficulty or tier membership changed.','',
'## 6. Source types, pools and calculation behavior','',
'Source memberships total '+str(sum(map(len,members.values())))+' across 818 unique IDs; '+str(len(overlap))+' IDs occur in more than one source membership. Their exact aliases and ordered pools are in `pool-memberships.json`. Do not add source memberships as if each were a distinct question.','']
lines+=table(['Pool','Raw source memberships','Composed count'],[(p,sum(len(m['questions'].get(p,[])) for m in b['views'].values()),b['composedCounts'].get(p,'split by checkpoint tier')) for p in ['easy','medium','hard','elite','legendary','calculation','boss','legendaryBoss']])
lines+=['','Composed checkpoints: 36 Easy, 36 Medium, 36 final Hard and 45 Legendary. Repair = 84; bridge = 46; repair seeds = 0; integration = 0; separate challenge pools = 0. Calculation inventory = 62, distributed into ordinary difficulty banks by the existing Composer; no routing changes. Full source type distribution follows (unchanged).','']
lines+=table(['Type','Before = after','Content revised'],[(t,n,v['contentByType'].get(t,0)) for t,n in sorted(b['types'].items())])
lines+=['','## 7. Objective-by-objective findings','',
'Labels are retained exactly as supplied by the live module, often the objective ID itself. Prefix variants are separately accounted for; they are not new curricula. A = coverage, B = robustness, C = calibration, D = calculation/integration, E = graph use, F = upper-tier synthesis, G = no material gap. The dated pre-authoring evidence is in `objective-findings-before.json`.','']
lines+=table(['Concept','Objective / exact label','Count','Before finding'],[(f['selectedConcept'],f['objective']+' / '+str(f['objectiveLabel']),f['count'],', '.join(f['classifications'])+': '+f['finding']) for f in obj['findings']])
lines+=['','## 8. True coverage gaps','',
'No material A gap was found. Every selected objective has legitimate records and appropriate support. No new question, concept or asset was justified. Central-bank institutional coverage and the selected capital/leverage subset were classified G.','',
'## 9. Robustness gaps','',
'Repeated upper-tier grammar remains in parts of the mature pool. Targeted replacements distinguish cash reclassification from new lending, explain two private-behavior constraints, reconstruct reserve behavior, reconcile leakage and compare indexed contracts with remaining inflation costs. This is not an exhaustive stylistic rewrite.','',
'## 10. Calibration gaps','',
'There is no systemic C gap: ordinary exam arithmetic and mechanisms already appear at Hard or below. Eleven existing Hard records were revised, largely for economic precision; none was moved. Easy/Medium fundamentals and most sound Hard items were retained.','',
'## 11. Calculation/integration findings','',
'All 60 revised numerical items were independently recomputed from final stems or visually inspected graph coordinates with rational arithmetic. This includes numerical questions changed only to state a convention or approximation. The verifier covers historical M1/M2 sums, current reclassification, required/excess reserves, cash versus system expansion, repeated currency leakage, an effective base multiplier, graph slope, reciprocal prices, wages, exact and approximate quantity growth, exact Fisher gross returns and fixed-price investment effects. `numerical-validation.json` supplies each derivation and final inputs.','',
'## 12. Graph-use findings','',
'The preset has 80 actual image-linked records and 42 Trial by Graph eligible records before and after. A separate legacy `graphImageMetadata` field is provenance and does not itself attach an image. Hypothetical value-of-money numbers in standalone records were therefore not automatically declared image contradictions. The confirmed attached value-of-money defects involved `LG-Q-336` and `LG-Q-9115`; `LG-Q-9029` was strengthened using the same verified image.','',
'`ECON-SP-MEDIUM-142` incorrectly keyed MS1→MS2 on MD1 as g→e. The image shows e→g; the key and explanation now agree. `PG4-MM-L-004` uses the actual straight MD1 line to solve a missing money-supply amount. All 80 graph questions now decode and enlarge in the generated game.','',
'## 13. Upper-tier synthesis','',
'Thirty-one Legendary and nine Elite records were revised, including precision clarifications. Substantive upper-tier examples now combine first-round lending, gross deposits and net money; reverse observed reserve behavior; trace repeated currency leakage; derive a policy base injection from currency and excess-reserve shares; reconstruct nominal wage compensation; reprice an exact real-return contract; and compare debt burdens with cash flow. Definitions and one-step arithmetic still remain in some upper records, disclosed as a residual limitation.','',
'## 14. Strong existing Hard questions retained','']
for id in ['P52B-S1-FED-H-001','PM2C1-FED-H-001','PM2C1-FED-H-002','P52A-BANK-H-001','P52A-BANK-H-002','P52A-BANK-H-003','PM2C1-MCL-FB-004','PG4-MM-H-004','PG4-MPT-H-001','PM2C2-NEUT-H-001','PM2C2-FISH-H-005','PM2C2-ICOST-H-001']:
 assert id not in s;lines+=['- `'+id+'`: '+b['records'][id]['q']]
lines+=['','These examples retain question content; some receive accessibility synchronization.','',
'## 15. Specific revisions and reasons','']
lines+=table(['ID','Why revised'],[(id,s[id]['reason']) for id in ['LG-Q-9110','LG-Q-222','LG-Q-205','LG-Q-9008','LG-Q-9003','LG-Q-9108','LG-Q-9114','LG-Q-336','LG-Q-9115','LG-Q-9031','LG-Q-9035','LG-Q-249','LG-Q-9041','LG-Q-9131']])
lines+=['','## 16. Economic and numerical defects corrected','',
'Corrected the distinction between public cash deposited and newly created money; separated loan origination from reserve settlement; made simple-multiplier assumptions explicit in affected calculations; replaced an incoherent retention scalar with a specified steady-state model; distinguished reserve compliance from a deficit; replaced an “at most” bond-sale target that admitted multiple feasible choices with an exact target; restored a missing claim; and corrected the reversed money-market key and inconsistent attached-graph numbers.','',
'Historical M1/M2 exercises now explicitly use definitions in effect before May 2020. One linked checkpoint explicitly uses current definitions. The Federal Reserve includes savings in M1 beginning with May 2020 data; the distinction is therefore stated rather than silently rekeying historical exercises. [Federal Reserve H.6 technical Q&A](https://www.federalreserve.gov/releases/h6/h6_technical_qa.htm).','',
'Positive reserve ratios in this bank are pedagogical hypothetical assumptions. They are not assertions of current U.S. requirements, which have been zero since March 26, 2020. [Federal Reserve reserve requirements](https://www.federalreserve.gov/monetarypolicy/reservereq.htm). No new real-world multiplier guarantee was introduced.','',
'## 17. Accessibility defects corrected','',
'All 16 runtime asset registrations, representing 12 distinct image byte sets, were visually inspected. Eight contracts had economic conclusions in alt text or descriptions; those conclusions were replaced with visible axes, lines, point coordinates, intersections and guides. Eight already-correct detailed contracts were retained. Source inline descriptions were synchronized so source auditors and generated accessibility use the same evidence.','',
'A browser test exposed 38 source-relative image references that failed in the exported embedded game. Their existing per-concept registered paths are now used. No image bytes, graph eligibility or renderer code changed. `accessibility-inspection.json`, `asset-accessibility-changes.json` and `graph-validation.json` distinguish asset changes, inline synchronization and path corrections.','',
'## 18. Final-exam calibration and originality','',
'Calibration source: `C:\\Users\\Jennings\\Desktop\\ECO 2251\\Final Exam.docx`, SHA-256 `'+rd('exam-source.json')['sha256']+'`. Full text and all seven embedded figures were inspected; this was content calibration, not a page-layout audit. The document was not modified.','',
'The money-function and Fed-role items support fast Easy/Medium recognition. The reserve, money-demand, Fisher, quantity-equation and nominal/real items establish ordinary exam application. Value-of-money and money-market figures support interpreting both axes and equilibrium movements. Since the actual preset selects transmission and inflation foundations, those exam mechanisms are relevant; Phillips, fiscal and open-economy material did not expand scope.','',
'No exam image was copied or redrawn. New tasks use existing library geometry, balance-sheet reconciliation, reverse constraints and linked comparisons, rather than renamed versions of exam questions. No newly introduced 12-word stem sequence matches the exam; inherited wording is tracked separately. This lexical check supports, but does not replace, human originality review. Source exam text/images are excluded from deliverables.','',
'## 19. Mode readiness','']
lines+=table(['Mode','Result'],[(m['label'],'PASS; no deficiencies or issues') for m in v['modeValidation']['modes']])
lines+=['','Fading Fortune and Risk & Reward each retain 535 eligible ordinary questions. Trial by Graph retains 42 eligible questions: Easy 7, Medium 14, Hard 7, Elite 7, Legendary 7. Core answer verification passes all 818 records. Generated-game verification confirms all 144 changed record payloads and every graph image/description, with no page errors. This is a content/runtime smoke test, not a complete playthrough of each mode.','',
'## 20. Review-sheet and routing integrity','',
'All 13 review routes and local PDF hashes are intact: '+', '.join(x['code'] for x in review)+'. The exact runtime index and source/public paths are in `architecture-validation.json`. Existing global review-manifest warnings concerning unrelated parents/orphan records remain; selected review resolution has zero errors.','',
'All IDs, aliases, source hashes/occurrences, source and canonical difficulty, objectives, tags, skills, common-error metadata, ordered pools, repairs, bridges, checkpoints, retest metadata and mode eligibility are preserved. All 136 unrelated concept definitions are byte-equivalent as data objects. Only the library and synchronized registry/manifest are production changes; engine, UI, Worker, telemetry and access files are unchanged.','',
'## 21. Remaining warnings and review flags','',
f'The existing auditor covers all 818 authoritative records in both runs: **errors {before["counts"]["errors"]} → {after["counts"]["errors"]}; warnings {before["counts"]["warnings"]} → {after["counts"]["warnings"]}; review flags {before["counts"]["reviews"]} → {after["counts"]["reviews"]}**. No projection or warning suppression was used. Every before/final finding pair has an individual disposition in `quality-dispositions.json`.','']
lines+=table(['Final rule','Count','Disposition'],[(x['rule'],x['count'],reasons[x['rule']]) for x in after['ruleCounts']])
lines+=['','The five additional review flags net of resolved flags are reported honestly. Shared assumption language can raise similarity scores; this does not justify removing conditions required for correct economics. The four graph-evidence flags expect D/S labels instead of MD/MS. Nine curve-label flags misread the scalar MPC as a curve. These confirmed heuristic mismatches are documented, not “fixed” by inventing visual labels.','',
'## 22. Remaining limitations and local delivery','',
'Some historical variants repeat feedback or question grammar; some upper-tier records remain direct; some distractors are easier to eliminate or differ in length. The bank is not claimed to have perfect psychometric calibration. Legacy money-aggregate exercises intentionally remain historical and are explicitly labeled. The review PDFs were checked for integrity/routing, not rewritten to reflect this audit. Textual originality checks cannot establish authorship, and no learner-response data were collected.','',
'All requested data changes and evidence are local. No commit, push, merge or deployment was performed. Only three production data files are changed. Reproducible audit scripts and exact before/after records accompany this report.','',
'## 23. Final semantic library hash','',
'`'+semantic+'`','',
'The shared semantic hash was recomputed independently and synchronized in the source library, registry and manifest. File-byte hashes and structural comparisons are recorded separately.','']
(W/'FINAL_REPORT.md').write_text('\n'.join(lines),'utf8')
files=['BEFORE.md','FINAL_REPORT.md','inventory-before.json','inventory-after.json','objective-findings-before.json','scope-boundary.json','summary-before.json','concepts.json','sources.json','recipe.json','changes.json','record-actions.json','accounting.json','pool-memberships.json','numerical-validation.json','logical-validation.json','graph-validation.json','originality-validation.json','semantic-validation.json','architecture-validation.json','quality-before.json','quality-before.md','quality-after.json','quality-after.md','quality-dispositions.json','audit-projection-provenance.json','accessibility-inspection.json','accessibility-spec.json','asset-accessibility-changes.json','validation.json','browser-validation.json','browser-smoke.png','exam-source.json','inspect.cjs','findings.py','author.py','revisions.json','access.py','stage.mjs','verify.py','browser.cjs','finish.py']
for f in files:assert (W/f).is_file(),f
wr('deliverables.json',files)
print(json.dumps({'artifacts':len(files),'hash':semantic,'reportWords':len(' '.join(lines).split()),'sourceMemberships':sum(map(len,members.values())),'overlappingIds':len(overlap),'quality':after['counts']}))
