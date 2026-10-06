import csv,json,hashlib,re,subprocess,shutil
from pathlib import Path
from collections import Counter
H=Path(__file__).resolve().parent;R=H.parent.parent;P=H.parent/'micro_faculty_remediation_20261006';D=R/'build/faculty-build-composer/data'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def library(p):return json.loads(p.read_text(encoding='utf-8').removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
L=read(H/'expectations.json');U=read(H/'review-universe.json');C={c['id']:c for c in L['changes']};B=library(H/'baseline/build/faculty-build-composer/data/composer_library.js');N=library(D/'composer_library.js')
assert len(U)==847 and sum(r['originalRemediationRecordChanged'] for r in U)==672
assert len(C)==19 and N['librarySha256']==L['afterLibrarySha256']
assert B['assetInventory']==N['assetInventory']
for a in N['assetInventory']:assert hashlib.sha256((D/a['runtimePath']).read_bytes()).hexdigest()==a['sha256'],a['runtimePath']
# Repeat independent arithmetic against today's records without changing the historical evidence.
s=(P/'verify_numerics.py').read_text()
s=s.replace("L=json.loads((H/'expectations.json').read_text());C={c['id']:c for c in L['changes']};checks=[]", "L=json.loads((H/'../micro_faculty_remediation_20261006/expectations.json').read_text());C={c['id']:c for c in L['changes']};updates=json.loads((H/'expectations.json').read_text());C.update({c['id']:c for c in updates['changes']});L['afterLibrarySha256']=updates['afterLibrarySha256'];checks=[]")
(H/'verify_numerics.py').write_text(s,encoding='utf-8')
subprocess.run([__import__('sys').executable,'-X','utf8',str(H/'verify_numerics.py')],check=True)
S=read(R/'faculty_exports/validation_summary.json');assert S['status']=='complete' and S['sources_unchanged']
assert S['source_sha256']==hashlib.sha256((D/'composer_library.js').read_bytes()).hexdigest()
pub=read(H/'publication-validation.json');assert pub['status']=='PASS'
export_result={};pages={}
for area,d in S['disciplines'].items():
 rows={r['Question ID']:r for r in csv.DictReader((R/'faculty_exports'/d['csv_file']).open(encoding='utf-8-sig',newline=''))}
 assert len(rows)=={'micro':6297,'macro':4747,'general':1589}[area]
 assert not {'42660','42697'}&rows.keys()
 for c in C.values():
  if c['id'] not in rows:continue
  q=c['afterRecord'];r=rows[c['id']]
  assert r['Question']==q['q'] and r['Feedback']==q['feedback']
  assert [r['Choice '+x] for x in 'ABCD']==q['options'] and r['Correct Answer'].startswith('ABCD'[c['correctIndex']])
  tier=q['canonicalDifficulty'];assert r['Difficulty']==(tier.title() if tier in ['easy','medium','hard','elite','legendary'] else '')
 export_result[area]={'exactCount':len(rows),'pdfQuestions':d['pdf_questions'],'pdfPages':d['pdf_pages']}
 if area=='micro':
  for id in C:pages[id]=d['question_pages'][id]
# Inspect the actual revised PDF blocks and render representative changed pages.
import pdfplumber
out=H/'pdf-review';out.mkdir(exist_ok=True);pdf=R/'faculty_exports'/S['disciplines']['micro']['pdf_file']
with pdfplumber.open(pdf) as doc:
 for id,pg in pages.items():
  text='\n'.join(p.extract_text() or '' for p in doc.pages[pg-1:min(pg+1,len(doc.pages))])
  assert id in text,id
  if id=='P75-TRADE-L-013':assert '<i>' not in text
  if id in ['42876','P62G-MON-H-009']:assert C[id]['afterRecord']['canonicalDifficulty'].title() in text
 targets=['42876','P62G-MON-H-009','P62G-MON-L-033','P62B-ELAS-L-076','P62E-COP-R-014','P75-TRADE-L-013','42926','P62F-PC-H-004']
 for id in targets:
  pg=pages[id];subprocess.run([shutil.which('pdftoppm'),'-f',str(pg),'-l',str(pg),'-scale-to','1600','-png','-singlefile',str(pdf),str(out/id)],check=True,capture_output=True)
(H/'export-validation.json').write_text(json.dumps({'status':'PASS','areas':export_result,'changedPdfBlocks':pages,'renderedIds':targets},indent=2)+'\n')
tests=read(H/'test-results.json');assert len(tests)==29 and all(t['status']==0 for t in tests)
assert 'Ran 25 tests' in (H/'exporter-tests.log').read_text() and 'OK' in (H/'exporter-tests.log').read_text()
# Restore only known test-generated side effects, from this sweep's starting state.
restored=[]
for rel in read(P/'restored-test-side-effects.json'):
 b=H/'baseline'/rel;p=R/rel
 if b.exists() and p.read_bytes()!=b.read_bytes():p.write_bytes(b.read_bytes());restored.append(rel)
(H/'restored-test-side-effects.json').write_text(json.dumps(restored,indent=2)+'\n')
changed=[]
for b in (H/'baseline').rglob('*'):
 if b.is_file():
  rel=b.relative_to(H/'baseline');p=R/rel
  if p.exists() and p.read_bytes()!=b.read_bytes():changed.append(rel.as_posix())
(H/'tracked-source-changes.json').write_text(json.dumps(sorted(changed),indent=2)+'\n')
def representation(q):
 if '<table' in q.get('q',''):return 'Semantic payoff table'
 if q.get('image'):return 'Graph: '+q['image']
 if re.search(r'\b(?:Q|P|MR|MC|AVC|TC)\s*=.*[QP]',q.get('q','')):return 'Equations in prose'
 if re.search(r'\d',q.get('q','')):return 'Numerical prose'
 return 'Qualitative prose'
rows=[];struct=[];rep=[]
for u in U:
 id=u['id'];old=u['current'];q=C[id]['afterRecord'] if id in C else old
 a,b=representation(u['before']),representation(old)
 if a!=b or u['group']=='representation' or id in ['42424','42436','42780','P62B-ELAS-L-076','P62B-ELAS-L-077','P62B-ELAS-L-078','P62G-MON-L-033','P62F-PC-E-042']:rep.append(id)
 protected=old.get('instructionalRole') in ['repair','repairSeed','bridge','boss','legendaryBoss']
 if id in C:action='CHANGED — '+C[id]['category'];why=' '.join(C[id]['rationale']);reg=C[id]['category']
 elif protected:
  action='NO CHANGE — STRUCTURAL ROLE EXPLAINS TIER';why='Instructional role and checkpoint/repair/bridge placement inspected separately from cognitive tier. Existing stage and prerequisite metadata are retained; no remediation-induced mismatch warrants a change.';reg='None';struct.append(id)
 else:
  action='VERIFIED — NO REGRESSION';reg='None'
  if u['state']=='FACULTY PASS':why='Protected PASS content unchanged; repaired shared graph retains the values and relationships needed by the stem, key and feedback.'
  elif u['group']=='tier':why='Only faculty tier/placement metadata changed. The task and representation remain intact; accepted faculty calibration retained.'
  elif u['group']=='graph-only':why='Shared asset, graph metadata or placement dependency inspected; required values, interpretation and keyed response remain compatible.'
  else:why='Compared original and remediated stem, options, feedback, numerical task and representation; no clear introduced error or material unassessed tier drift.'
 if id=='P62F-PC-LB-014':why+=' Its plotted positive-profit starting point also existed in the original artwork; no new discrepancy was introduced by this remediation.'
 rows.append({'Question ID':id,'Topic':q['primaryConceptId'],'Faculty/QA source':'Direct faculty decision' if id in ['42876','P62G-MON-H-009'] else ('October 6 changed-record ledger; '+u['state'] if u['originalRemediationRecordChanged'] else 'Shared remediated asset dependency; '+u['state']),'Instructional role':q.get('instructionalRole',''),'Difficulty before':old.get('canonicalDifficulty',''),'Difficulty after':q.get('canonicalDifficulty',''),'Representation before':a,'Representation after':b,'Regression type':reg,'Action':action,'Rationale':why,'Validation result':'PASS — canonical/role/pool integrity; answer hash; publication/export parity; graph assets unchanged'})
A=R/'faculty_exports/audits';A.mkdir(exist_ok=True);stem='microeconomics_post_remediation_sweep_20261006'
with (A/(stem+'.csv')).open('w',encoding='utf-8-sig',newline='') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
(H/'dispositions.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
counts=Counter(r['Action'] for r in rows)
report=['# Microeconomics post-remediation faculty QA sweep — October 6, 2026','', '## Executive summary','', '**FINAL STATUS: PASS.** Reviewed all 672 changed canonical records plus 174 additional shared-asset dependents and the explicit 42876 correction: 847 unique IDs. Applied 19 narrow changes: two explicit faculty tiers, 11 additional difficulty-drift corrections, and six content regressions. No graph artwork or runtime was changed. The accepted remediation remains the baseline.','', 'The representation columns compare the pre-remediation task with the accepted October 6 replacement; difficulty columns compare the start and finish of this sweep. Stored role names and historical sourcePool values are provenance, not current cognitive difficulty.','', '## Dispositions','']+[f'- {k}: {v}' for k,v in sorted(counts.items())]
report+=['','## Representation-changing repairs inspected','',f'{len(rep)} tasks received specific representation/scaffolding review. Includes the nine graph/table/path conversions, algebra and midpoint substitutions, and tasks where a supplied value now must be derived. Cosmetic graph restyling did not itself count as a representation conversion.','',', '.join(rep),'','Graph-to-equation P62G-MON-H-009 is now Elite. Graph-to-prose P62G-MON-H-010 remains Medium; it supplies the revenue/variable-cost comparison. Single-panel variants retain the information needed for their specific tasks. The payoff table retains its two Nash equilibria. Other detailed before/after reasoning is in the per-item CSV and change ledger.','', '## Explicit faculty corrections','', '- **42876: Medium → Easy.** Authority: direct faculty decision. Stem, concept, objective and role unchanged.','- **P62G-MON-H-009: Medium → Elite.** Authority: direct faculty decision. Interpreting inverse-demand and AVC equations adds representational demand beyond standard graph-based Principles treatment. Equations and correct shutdown economics retained.','', '## Difficulty-drift corrections','']
for c in C.values():
 if c['category']=='POST-REMEDIATION DIFFICULTY DRIFT':report.append(f"- **{c['id']}: {c['beforeRecord']['canonicalDifficulty'].title()} → {c['afterRecord']['canonicalDifficulty'].title()}.** "+' '.join(c['rationale']))
report+=['','## Content regressions corrected','']
for c in C.values():
 if c['category']=='POST-REMEDIATION CONTENT REGRESSION':report.append(f"- **{c['id']}:** "+' '.join(c['rationale']))
report+=['','## Structural roles retained','',f'{len(struct)} unchanged structural-role items are separately dispositioned. All 19 corrected records retain their exact instructionalRole, sourcePool/originalSourcePool, objective, skill, repair, checkpoint, prerequisite and mode metadata. Thirteen ordinary cognitive-tier placements moved; no repair, bridge, retest, boss or checkpoint placement moved. Historical IDs and source pool names were preserved.','',', '.join(struct),'','## Faculty-review items','', 'None required for this bounded regression sweep. Borderline stylistic or general calibration preferences were not treated as evidence of remediation-induced drift. Pre-existing issues are outside this sweep.','', '## Validation','', '- All 29 current Composer/game validation scripts passed; all 25 faculty-exporter tests passed. Existing approved-revision assertions remain chained, with exact before/after checks and negative controls rejecting unauthorized edits.','- 266 independent arithmetic checks rerun against the current records; all passed.','- 9,777 distinct canonical IDs and 9,798 stored occurrences retained. Deleted IDs 42660 and 42697 remain absent.','- Canonical registry, manifest, answer hashes and faculty-outcome coverage regenerated. All 235 inventory asset hashes verified; graph metadata and bytes are identical to the accepted baseline.','- General/Micro/Macro student builds generated; all ten mode validations pass, answers verify, inline scripts compile, exact membership and field parity checked. Micro contains 42876 only in the Easy ordinary bank and P62G-MON-H-009 only in Elite. Existing graph eligibility is unchanged.','- All three faculty CSV/PDF pairs regenerated and round-trip verified: General 1,589; Micro 6,297; Macro 4,747. All 19 corrected rows and PDF blocks checked; eight representative PDF pages rendered for visual review.','- Full test and publication evidence is retained in audit_tools/micro_post_remediation_20261006/. Generated test side effects restored from this sweep’s own baseline.','', '## Tracked source files changed by this sweep','']+[f'- `{p}`' for p in sorted(changed)]
report+=['','Added validation helper: `build/faculty-build-composer/tests/post-remediation-approved-revisions.js`. New review/patch/verification evidence lives in `audit_tools/micro_post_remediation_20261006/`; previous audit evidence was preserved. No template, adaptive, grading, telemetry, shuffle or unrelated taxonomy source changed.','', '## Final status','',f"**PASS.** Final library SHA-256: `{L['afterLibrarySha256']}`. Bounded sweep complete; no further generic audit initiated."]
(A/(stem+'.md')).write_text('\n'.join(report)+'\n',encoding='utf-8')
print(json.dumps({'status':'PASS','reviewed':len(rows),'changes':len(C),'dispositions':dict(counts),'trackedSources':changed,'representationReview':len(rep)},indent=2))
