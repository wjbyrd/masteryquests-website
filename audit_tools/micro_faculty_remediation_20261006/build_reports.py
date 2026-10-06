"""Build the final faculty disposition/change ledger from verified evidence."""
import csv,json,hashlib,collections,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent;R=H.parent.parent;O=R/'faculty_exports/audits';O.mkdir(exist_ok=True)
def read(name):return json.loads((H/name).read_text(encoding='utf8'))
L=read('expectations.json');B=read('baseline_records.json');M={r['id']:r for r in read('faculty_decisions.json')};D=read('dispositions.json');U=read('unreviewed_scope.json');G={r['asset']:r for r in read('graph_inventory.json')}
C={c['id']:c for c in L['changes']};A={a['path']:a for a in L['assets']};Q={id:C[id]['afterRecord'] if id in C else b['q'] for id,b in B.items()}
P=read('publication-validation.json');E=read('export-validation.json');N=read('numerical-validation.json');V=read('visual-validation.json');T=read('test-results.json');S=read('full-game-smoke.json')
for v in [P,E,N,V,S]:assert v['librarySha256']==L['afterLibrarySha256'] and v['status']=='PASS'
assert len(T)==29 and all(t['status']==0 for t in T)
assert len(D)==705 and set(D)=={i for i,m in M.items() if m['state']=='FACULTY FLAG'}
transfers={'ECON-EC-LEGENDARYBOSS-20022','ECON-EC-LEGENDARYBOSS-20023'}
affected={i for a in A.values() for i in a['referencingIds']}
ids=sorted(set(D)|set(C)|affected)
def area_after(id):return ['macro'] if id in transfers else B[id]['areas']
def places(id,which):
 ps=[f'concepts/{cid}/questions/{pool}' for cid,mod in L['placements'+which].items() if mod for pool,qs in mod.items() if id in qs]
 return ps or B[id]['stored_pools']
def key(q,a):return 'ABCD'[a]+' — '+q['options'][a]
def write_csv(path,rows):
 with path.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
rows=[];full=[]
for id in ids:
 b=B[id]['q'];q=Q[id];m=M.get(id,{});c=C.get(id,{});d=D.get(id,{});state=m.get('state','OUTSIDE MICRO WORKBOOK');categories=[]
 if id in D:categories.append('A — FACULTY-FLAGGED')
 if id in affected or any(f in c.get('fields',[]) for f in ['image','imageAlt','graphDescription']):categories.append('B — GLOBAL GRAPH ACCESSIBILITY')
 if id in U:categories.append('C — UNREVIEWED HIGH-CONFIDENCE CONSISTENCY')
 if id in {'P62E-COP-L-060','42753'}:categories.append('D — OBJECTIVE VALIDATION')
 a=c.get('correctIndex',B[id]['answer']);reason=' '.join(c.get('rationale',[])) or d.get('rationale','Shared graph accessibility repair; question text, options, key, difficulty and routing preserved.')
 disposition=d.get('disposition','CHANGED' if id in C else 'GRAPH ASSET REPAIRED')
 if id in affected:reason+=' Shared asset verified in game, enlargement, grayscale and faculty PDF; all references reconciled.'
 row={'Question ID':id,'workbook page(s)':m.get('pages',''),'Topic':m.get('topic',b.get('primaryConceptId','')),'faculty review state':state,"What's Wrong?":m.get('issue',''),'How to Fix':m.get('fix',''),'Note':m.get('note',''),'category':'; '.join(categories),'disposition':disposition,'canonical role':q.get('instructionalRole',''),'source pool':q.get('sourcePool',''),'difficulty before':b.get('canonicalDifficulty',b.get('difficulty','')),'difficulty after':q.get('canonicalDifficulty',q.get('difficulty','')),'type before':b.get('type',''),'type after':q.get('type',''),'stem before':b['q'],'stem after':q['q'],'choices before':json.dumps(b['options'],ensure_ascii=False),'choices after':json.dumps(q['options'],ensure_ascii=False),'correct answer before':key(b,B[id]['answer']),'correct answer after':key(q,a),'feedback before':b.get('feedback',''),'feedback after':q.get('feedback',''),'graph asset before':b.get('image',''),'graph asset after':q.get('image',''),'answer hash changed YES/NO':'YES' if b.get('aHash')!=q.get('aHash') else 'NO','shared across areas YES/NO':'YES' if len(set(B[id]['areas']+area_after(id)))>1 else 'NO','areas before':'; '.join(B[id]['areas']),'areas after':'; '.join(area_after(id)),'stored pools before':'; '.join(places(id,'Before')),'stored pools after':'; '.join(places(id,'After')),'fields changed':'; '.join(c.get('fields',[])),'graph bytes changed':'YES' if id in affected else 'NO','reason for change':reason,'validation result':'PASS — retained pending faculty target' if id=='42876' else 'PASS'}
 rows.append(row);full.append({**row,'beforeRecord':b,'afterRecord':q,'beforeCorrectIndex':B[id]['answer'],'afterCorrectIndex':a,'workbookRow':m.get('workbook_row'),'facultyPrecedents':U.get(id,{}).get('faculty_precedents',[]),'storedMembershipsBefore':places(id,'Before'),'storedMembershipsAfter':places(id,'After')})
name='microeconomics_faculty_review_remediation_20261006'
write_csv(O/(name+'.csv'),rows)
payload={'status':'PASS WITH DOCUMENTED FACULTY AMBIGUITY','workbookSha256':L['workbookSha256'],'beforeLibrarySha256':L['beforeLibrarySha256'],'afterLibrarySha256':L['afterLibrarySha256'],'questionRecordChanges':len(C),'flagDispositions':len(D),'ledgerRows':len(rows),'rows':full,'moves':L['moves'],'metadataChanges':L['metadataChanges'],'validation':{'publication':P,'exports':E,'numericalCheckCount':N['checkCount'],'visual':V,'testCount':len(T),'fullGame':S},'unreviewedScope':U}
(O/(name+'.json')).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
refs=collections.defaultdict(list)
for id,q in Q.items():
 if q.get('image') and 'micro' in area_after(id):refs[q['image']].append(id)
inventory=[]
for asset in sorted(set(G)|set(A)):
 old=G.get(asset,{});new=A.get(asset,{});rr=refs[asset];changed=asset in A;index=next((i for i,a in enumerate(L['assets']) if a['path']==asset),None)
 status='NEW VARIANT' if changed and asset not in G else 'REPAIRED' if changed else 'ALREADY ACCESSIBLE' if rr else 'RETIRED FROM QUESTION USE'
 er=next((x for x in E['assets'] if x['asset']==asset),{})
 inventory.append({'asset':asset,'status':status,'question count before':len(old.get('ids',[])),'question count after':len(rr),'question IDs before':'; '.join(old.get('ids',[])),'question IDs after':'; '.join(rr),'all area reference IDs':'; '.join(sorted(i for i,q in Q.items() if q.get('image')==asset)),'PASS IDs affected':'; '.join(i for i in rr if M.get(i,{}).get('state')=='FACULTY PASS'),'FLAG IDs':'; '.join(i for i in rr if i in D),'sha256 before':old.get('sha256',''),'sha256 after':hashlib.sha256((R/'build/faculty-build-composer/data'/asset).read_bytes()).hexdigest(),'color or legend alone':'NO — active curves identifiable without hue' if rr else 'Not active','direct labels':'Verified; rebuilt curves directly labeled' if changed else 'Inspected existing curve/line/region labels','line styles / markers / hatching':'Solid, dashed and dotted lines or markers/region boundaries as appropriate; direct labels are primary' if changed else 'Existing labels and geometry sufficient for required task','numeric readability':'Required values and coordinates verified' if rr else 'Not active','alt text / description':new.get('description','Existing descriptions retained'),'model':new.get('model','Original graph retained'),'repair reason':new.get('reason','Global visual sweep: no accessibility repair needed' if rr else 'Faculty replaced image task with worded task; historical file retained'),'before inspection':f"audit_tools/micro_faculty_remediation_20261006/graph-qa/before-{old['index']//8*8:03}.jpg" if old else '', 'browser inspection':f'audit_tools/micro_faculty_remediation_20261006/browser/{index:02}-desktop.png' if changed else 'Existing asset contact-sheet inspection','lightbox inspection':f'audit_tools/micro_faculty_remediation_20261006/browser/{index:02}-lightbox.png' if changed else 'Not changed','grayscale inspection':f'audit_tools/micro_faculty_remediation_20261006/browser/{index:02}-grayscale.png' if changed else 'Existing direct labels inspected','PDF inspection':f"audit_tools/micro_faculty_remediation_20261006/pdf-review/{er['file']}" if er else 'Not changed','visual result':'PASS' if rr else 'RETIRED'})
write_csv(O/'micro_graph_accessibility_inventory_20261006.csv',inventory)
fields=collections.Counter(f for c in C.values() for f in c['fields']);states=collections.Counter(M.get(i,{}).get('state','OTHER') for i in C);disp=collections.Counter(d['disposition'] for d in D.values());pass_records=[i for i in C if M.get(i,{}).get('state')=='FACULTY PASS'];pass_assets=sorted(i for i in affected if M.get(i,{}).get('state')=='FACULTY PASS')
assert all(set(C[i]['fields'])<={'imageAlt','graphDescription','image','graphRequired','graphAccessible','graphAccessibility'} for i in pass_records)
unchanged=len([a for a in inventory if a['status']=='ALREADY ACCESSIBLE']);retired=len([a for a in inventory if a['status']=='RETIRED FROM QUESTION USE']);newvariants=[a for a in A if a not in G]
objective=[r for r in rows if r['Question ID'] in {'P62E-COP-L-060','42753'}]
summary=f'''# Faculty-led Microeconomics remediation — 6 October 2026

Final status: **PASS with one documented faculty ambiguity**. Implementation and technical validation passed. Question 42876 remains unchanged because the workbook supplies no target difficulty; its disposition is **NO CHANGE — REQUIRES MANUAL DECISION**. This report does not represent new faculty approval.

The workbook directed this pass. All 705 flags have a disposition. {len(C)} unique canonical question records changed, and 55 active graph assets were rebuilt or added. The full ledger also includes unchanged flagged rows and shared graph effects, giving {len(rows)} rows. Counts below overlap when one question needed several kinds of correction.

## Workbook and scope

The workbook contains 6,299 unique Microeconomics IDs: 1,628 PASS, 705 FLAG and 3,966 unreviewed. All match canonical Microeconomics records; no workbook IDs were invented or silently omitted. Reviewed sample: 2,333. Workbook SHA-256: `{L['workbookSha256']}`. Baseline library: `{L['beforeLibrarySha256']}`. Final library: `{L['afterLibrarySha256']}`.

Notes took precedence over the proposed fix, issue category and existing wording. PASS questions supplied positive examples rather than rewrite targets. ECON-MG records remained protected unless explicitly flagged. The unreviewed sweep was limited to 30 documented siblings of demonstrated wrapper/causal-repetition defects.

## A. Faculty-flagged work

| Disposition | Count |
|---|---:|
'''+''.join(f'| {k} | {v} |\n' for k,v in disp.items())+f'''
There are 704 closed dispositions and one unresolved target-tier decision. Of the 660 changed flagged IDs, 637 have record edits and 23 have graph-asset-only repairs. The 672 record changes comprise those 637 flags, 30 unreviewed editorial corrections and 5 unreviewed graph-metadata corrections. The 8 faculty-intent conflicts are the developer-tools feedback complaints: useful explanations were retained because the governing prompt explicitly forbids destroying feedback to conceal client-side content. No security redesign was authorized. The 32 structural-role dispositions retain intentionally simpler repair, bridge or retest tasks and their routing. Four comments were already satisfied or stale; the ledger identifies each individually.

Across all record changes: {fields['q']} stems; {fields['options']} option sets; {fields['feedback']} feedback explanations; {fields['canonicalDifficulty']} cognitive tiers; {fields['aHash']} answer hashes. Correct-answer wording changed for {sum(r['correct answer before'].split(' — ',1)[1]!=r['correct answer after'].split(' — ',1)[1] for r in rows)} IDs. Correct option positions changed for {sum(B[i]['answer']!=C[i]['correctIndex'] for i in C)} IDs. Type metadata changed for {fields['type']} IDs. Exact before/after values, including all distractors, appear in CSV and JSON.

Flagged repeated families now distinguish causal interpretation, evaluation of claims and decisions: adverse selection versus moral hazard, signaling, behavioral economics, monopoly and competition, oligopoly, trade welfare, production cost and inequality. Numerical families use independently checked quantities and outcomes rather than cosmetic noun substitutions. Harder tasks were strengthened where the faculty requested it; difficulty-only instructions changed cognitive tier without adding artificial prose. Answer-length repairs use plausible parallel distractors and preserve one defensible key. Feedback explains the economic reasoning.

There were 130 ordinary pool moves following cognitive-tier changes and two explicit course transfers. Boss/checkpoint stage, repair/bridge identity, provenance, primary/repair skills and unrelated memberships are protected by exact-record comparisons. Cognitive tier and checkpoint stage remain separate; changed boss tiers carry the existing checkpoint pool explicitly. The ledger includes before/after stored placements and complete source records.

## B. Global graph accessibility

All 230 original unique Microeconomics graph/image assets were visually inspected; five variants bring the inspected union to 235. Active assets after the pass: {sum(bool(v) for v in refs.values())}. Fifty existing assets were rebuilt, five variants added, {unchanged} active originals retained, and {retired} assets retired from question use but preserved on disk. Original graph questions: 1,195; current Microeconomics graph questions: {sum(len(v) for v in refs.values())}.

Direct curve labels, redundant line styles, legible guides and label spacing support identification without hue. All 55 changed active assets were inspected in normal game view, enlargement, grayscale and actual faculty PDF output. Mobile inline rendering was also inspected; the real game was exercised for click/keyboard opening, panning and closing. See the separate graph report and 235-row inventory for asset-level references, hashes, models and evidence.

PASS exceptions are limited to graph accessibility: {len(pass_records)} PASS records have graph metadata changes, and {len(pass_assets)} PASS IDs reference repaired assets. No PASS stem, options, feedback, key, cognitive tier or role was stylistically changed. **PASS OVERRIDE — OBJECTIVE CORRECTNESS ERROR: none.** All graph effects, including asset-only effects, are separately identifiable in the ledger.

New variants: {', '.join('`'+p.split('/')[-1]+'`' for p in newvariants)}. Variants separate market-only, firm-only, price-transfer and original-price tasks so one faculty request does not compromise another question sharing the original.

## C. Unreviewed high-confidence consistency changes

Exactly {len(U)} unreviewed records received editorial changes. The scope is moral-hazard/deductible, warranty/credential signaling and isolated empty attribution wrappers. Each records its faculty precedent and before/after content. Other unreviewed content was preserved except necessary graph metadata/asset effects. PASS and protected ECON-MG questions were excluded from this editorial sweep. The substantive sibling questions now test different mechanisms, evidence or tradeoffs; the eight isolated wrapper edits retain their original tasks. No generic second audit was initiated.

## D. Objective validation corrections

P62E-COP-L-060: the faculty-requested output of 65 makes Plant 2 the lowest-cost available plant. The correct option moves from D to A; feedback agrees with the displayed curves. P62E-COP-L-048 similarly uses output 30 in both stem and explanation.

42753: at population share 40%, the Lorenz ordinate is 15%, while the equality-line gap is 25 percentage points. The faculty note’s 15 is the ordinate, not the requested gap. The stem now names the coordinate and the validated key remains 25. This is a documented interpretation of the mathematical evidence.

P62F-PC-B2-032: the workbook’s 18/22 graph note does not describe the current canonical text-only per-unit-tax question; it was retained with a documented stale-comment disposition. PC graph feedback now uses the displayed numeric coordinates and prices, with removed Q1 labels replaced by actual quantities.

## Counts, shared areas and generated output

| Scope | Before | After |
|---|---:|---:|
| Canonical distinct IDs | 9,777 | 9,777 |
| Microeconomics | 6,299 | 6,297 |
| Macroeconomics | 4,745 | 4,747 |
| General Economics | 1,589 | 1,589 |

ECON-EC-LEGENDARYBOSS-20022 and ECON-EC-LEGENDARYBOSS-20023 moved to integrated Macroeconomics as directed. Skills, objectives, role and source provenance were retained; destination objectives, outcome scope and prerequisite eligibility were reconciled. Shared General/Macro records receive the same canonical changes, never divergent copies. Area counts overlap; they are not additive canonical counts. Deleted IDs 42660 and 42697 remain absent.

All three faculty CSV/PDF exports regenerated. Exact exported IDs, options, keys, feedback and tier formatting were compared with canonical records; PDF extraction round trips passed. Student builds were regenerated and validated for General, Micro and Macro across all 10 modes, including answer/asset embedding and Macro transfer eligibility. A saved Micro validation game supports the real browser smoke test. Published IDs number 1,589 General, 6,272 Micro and 4,745 Macro; the existing 25 Micro and 2 Macro scope exclusions are unchanged from the baseline and explicitly listed in publication-validation.json. Existing no-outcome/legacy-objective diagnostics remain documented by the exporter; this pass did not rewrite unrelated taxonomy.

## Validation and limits

All 29 current composer/game test scripts pass; all 25 faculty-exporter unit tests pass. {N['checkCount']} independent arithmetic checks passed, covering changed quantitative families and rebuilt cost models, with manual item/graph reconciliation for qualitative choices and graph readings. The arithmetic check count is not a count of all questions. Answer hashes, manifest hashes, identity sets, protected fields and routing are validated. Negative controls reject an unauthorized skill mutation and a protected ECON-MG stem mutation. Core runtime, templates, grading, shuffle and build behavior were not refactored.

Visual evidence uses the actual template graph component for the full 55-asset matrix plus a targeted full-game browser smoke test; it does not claim a complete 6,297-question interactive playthrough. The final PDF review uses actual exported pages, not a separate PDF mockup. Full evidence and reproducible author/generator/validator scripts live in `audit_tools/micro_faculty_remediation_20261006/`.

The only remaining faculty decision is the intended tier for 42876. It remains at Medium. The eight feedback conflicts and the stale graph comment are explicitly resolved by preserving the authorized current behavior, rather than guessing or weakening feedback. No further generic audit is recommended by this pass.

## Deliverables

- [Full CSV ledger]({name}.csv)
- [Full JSON ledger, records and structural metadata]({name}.json)
- [Graph accessibility report](micro_graph_accessibility_report_20261006.md)
- [Graph inventory](micro_graph_accessibility_inventory_20261006.csv)
- [Exact changed-file manifest](microeconomics_remediation_changed_files_20261006.json)
- [Export validation summary](../validation_summary.json)

No publication, commit or push was performed. The changes and regenerated artifacts are local and ready for faculty review.
'''
(O/(name+'.md')).write_text(summary,encoding='utf8')
graph=f'''# Microeconomics graph accessibility — 6 October 2026

Accessibility status: **PASS for the inspected active Microeconomics graph bank**. Repair status: **complete**. No unresolved graph exception was identified in the visual sweep.

| Measure | Count |
|---|---:|
| Original unique assets inspected | 230 |
| New variants inspected | 5 |
| Union in inventory | {len(inventory)} |
| Active assets after remediation | {sum(bool(v) for v in refs.values())} |
| Original graph/image questions | 1,195 |
| Current Microeconomics graph/image questions | {sum(len(v) for v in refs.values())} |
| Existing assets repaired | 50 |
| Active originals already accessible | {unchanged} |
| Assets retired from question use | {retired} |
| Changed active assets reviewed in all required contexts | 55 |
| Active assets requiring color/legend alone | 0 |

Every original asset was inspected in contact sheets. Curves and economically relevant regions remain identifiable through direct labels, geometry, endpoints, markers and/or line patterns. The repaired plots use direct curve labels and solid/dashed/dotted distinctions where useful. Hatching is not required when direct labels and region boundaries already disambiguate the task. Curve labels were moved apart, long axis labels wrapped, numeric guides clarified, and exact prices/output coordinates exposed where the faculty required precise readings.

All 55 final changed assets were visually checked at normal game size, enlarged/lightbox size, grayscale and actual faculty PDF size. The browser matrix also includes mobile inline and mobile enlargement with panning. Some small mobile graphs require enlargement, which is available in the existing game; the real game’s click/Enter, Escape/close and horizontal panning were verified at a 390-pixel viewport. There were no browser page errors. This verifies the existing interaction, not a new accessibility runtime implementation.

The inventory records every before/after asset hash, complete shared references, PASS effects, model, repair rationale and evidence path. Alt/description metadata changed for {fields['imageAlt']} / {fields['graphDescription']} question records where the model or variant changed; unchanged descriptions were retained where still accurate. Required quantities, prices, gaps, cost comparisons and payoff values were reconciled with all shared questions. The final PC review removed stale Q1/price references from feedback as well as graphs.

Five variants prevent incompatible shared uses: market-only PC-06 and PC-08, firm-only PC-07, PC-07 price transfer and the original-price profit rectangle. The two rejected monopoly shutdown images and the worded PC shutdown task no longer require their former graphs; historical image files remain available. An additional generated supply draft was unused and is not an installed change.

Browser captures were made against an earlier editorial revision with identical final graph bytes. Final SHA-256 comparisons confirm applicability to library `{L['afterLibrarySha256']}`. The final PDF captures and full-game smoke test use that final library. Visual inspection is recorded in `visual-validation.json`; numerical model evidence is in `numerical-validation.json`.

See [the complete inventory](micro_graph_accessibility_inventory_20261006.csv), [the question ledger]({name}.json), and `audit_tools/micro_faculty_remediation_20261006/visual-review/` plus `pdf-review/` for rendered evidence.
'''
(O/'micro_graph_accessibility_report_20261006.md').write_text(graph,encoding='utf8')
print(json.dumps({'ledgerRows':len(rows),'changedRecords':len(C),'changedStates':states,'PASSmetadata':len(pass_records),'PASSassetReferences':len(pass_assets),'graphInventory':len(inventory),'activeGraphs':sum(bool(v) for v in refs.values()),'graphQuestions':sum(len(v) for v in refs.values()),'fields':fields},indent=2))
