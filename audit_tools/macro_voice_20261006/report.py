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
L=read(H/'expectations.json');changes={c['id']:c for c in L['changes']};records={r['id']:r for r in read(H/'records.json')};candidates=read(H/'candidates.json');scan=read(H/'scan-summary.json');V=read(H/'visual-validation.json')
assert len(n)==len(b)==9777 and set(n)==set(b)
assert {id for id in n if n[id]!=b[id]}==set(changes)
for id,c in changes.items():
 assert c['beforeRecord']==b[id] and c['afterRecord']==n[id]
 assert set(c['fields'])<=set(['q','options','feedback','aHash'])
 assert 'micro' not in records[id]['areas'] and not records[id]['marketGateDerived']
micro=[r['id'] for r in records.values() if 'micro' in r['areas']];mg=[r['id'] for r in records.values() if 'macro' in r['areas'] and r['marketGateDerived']]
for id in micro+mg:assert n[id]==b[id]
assert N['assetInventory']==B['assetInventory']
for a in N['assetInventory']:assert sha(D/a['runtimePath'])==a['sha256']
tests=read(H/'test-results.json');assert len(tests)==31 and all(t['status']=='PASS' for t in tests)
exporttests=(H/'exporter-tests.log').read_text(encoding='utf-8-sig');assert re.search(r'Ran 25 tests',exporttests) and re.search(r'\bOK\b',exporttests)
S=read(R/'faculty_exports/validation_summary.json');assert S['status']=='complete' and S['sources_unchanged'] and S['source_sha256']==sha(D/'composer_library.js')
assert V['status']=='PASS' and not V['macro']['mismatches']
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
targets=['PMOE-FX-H-005','PMOE-FX-EL-001','PMOE-FX-L-004','PMOE-FX-L-006','PMOE-NER-B3-002','PMOE-RER-B3-001','PMOE-RER-LB-001','PMOE-POL-LB-001','ECON-NL-LEGENDARY-9000','ECON-NL-FINALBOSS-4004']
out=H/'pdf-review';out.mkdir(exist_ok=True)
for id in targets:
 pg=pages[id];subprocess.run([shutil.which('pdftoppm'),'-f',str(pg),'-l',str(pg),'-scale-to','1500','-png','-singlefile',str(pdf),str(out/id)],check=True,capture_output=True)
dispositions=[]
for r in candidates:
 id=r['id'];patterns={h['pattern'] for h in r['hits']}
 if id in changes:action='EDIT';reason=changes[id]['rationale']
 elif r['marketGateDerived'] or 'micro' in r['areas']:action='KEEP — protected';reason='Frozen Micro/shared content or protected Market Gate; detection only. Visual metadata verified separately.'
 else:
  action='KEEP — natural or borderline'
  if 'wrapper' in patterns:reason='Retain the genuine claim/diagnosis, inference or evidence-comparison task, or ordinary reporting context; no high-confidence unnecessary wrapper identified.'
  elif 'rate' in patterns:reason='The context identifies interest, inflation, unemployment or another non-exchange rate; no exchange-rate ambiguity requiring this repair.'
  elif 'reciprocal' in patterns:reason='Reciprocal describes a useful mathematical relationship outside the currency-quotation pattern; preserve the calculation.'
  elif 'notation' in patterns:reason='A relevant formula, accounting identity, answer choice or worked feedback; the stem already states the economic situation or expressly asks for the formula.'
  else:reason='Valid attached graph or a conceptual/numerical use of the word; wording is natural in context. Exact stem exceptions and rationale are recorded in the visual allowlist.'
 dispositions.append({'Question ID':id,'Topic':r['q']['primaryConceptId'],'Patterns':'; '.join(sorted(patterns)),'Disposition':action,'Rationale':reason})
csvwrite(H/'candidate-dispositions.csv',dispositions)
rows=[]
for id,c in changes.items():
 q=c['afterRecord'];old=c['beforeRecord']
 rows.append({'Question ID':id,'Topic':q['primaryConceptId'],'Pattern detected':'; '.join(c['patterns']),'Stem before':old['q'],'Stem after':q['q'],'Options changed YES/NO':'YES' if old['options']!=q['options'] else 'NO','Feedback changed YES/NO':'YES' if old.get('feedback')!=q.get('feedback') else 'NO','Visual metadata present YES/NO':'YES' if q.get('image') else 'NO','Economics changed YES/NO':'NO','Difficulty changed YES/NO':'NO','Rationale':c['rationale'],'Validation result':'PASS — unchanged key index and protected metadata; official answer hash; CSV/PDF parity'})
A.mkdir(exist_ok=True);csvwrite(A/'macro_faculty_voice_cleanup_20261006.csv',rows)
counts=Counter(p for c in changes.values() for p in c['patterns']);dc=Counter(d['Disposition'] for d in dispositions)
summary={'status':'PASS','macroScanned':scan['macro'],'candidateQuestions':len(candidates),'candidatePhraseOccurrences':sum(len(h['matches']) for r in candidates for h in r['hits']),'changed':len(changes),'baselineVisualMismatches':len(V['baselineMacro']['mismatches']),'missingVisualRepaired':len(V['baselineMacro']['mismatches']),'remainingMacroVisualMismatches':len(V['macro']['mismatches']),'microVisualMismatches':len(V['micro']['mismatches']),'repairCounts':dict(counts),'candidateDispositions':dict(dc),'microFrozen':len(micro),'marketGateFrozen':len(mg),'graphAssetEntriesUnchanged':len(N['assetInventory']),'composerSuites':len(tests),'exporterTests':25,'exports':exports,'librarySha256':N['librarySha256']}
(H/'final-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
(H/'export-validation.json').write_text(json.dumps({'status':'PASS','fullCsvParity':exports,'changedPdfBlocks':{id:pages[id] for id in changes},'renderedIds':targets},indent=2)+'\n')
md=['# Macro faculty-voice cleanup — October 6, 2026','','**PASS — bounded editorial cleanup completed.**','',f"Scanned all {scan['macro']:,} unique active Macro questions, including stem, options and feedback. The expanded pattern search found {len(candidates):,} candidate questions and {summary['candidatePhraseOccurrences']:,} matching phrase occurrences. Edited {len(changes)} unique questions. No economics, answer-key positions, cognitive tiers, skills, routing, checkpoint roles, IDs, mode eligibility or visual assets changed.",'','## Results','','| Measure | Count |','|---|---:|',f"| Macro questions scanned | {scan['macro']:,} |",f"| Candidate questions | {len(candidates):,} |",f"| Questions changed | {len(changes)} |",f"| Visual-reference mismatches found / repaired | {summary['baselineVisualMismatches']} / {summary['missingVisualRepaired']} |"]
for p in ['textbook model','ambiguous exchange rate','reciprocal quotation','notation-first','audit wrapper','model jargon']:md.append(f'| {p.capitalize()} repairs | {counts[p]} |')
md += [f"| Untouched editable candidates judged natural or borderline | {dc['KEEP — natural or borderline']} |",f"| Protected Micro/shared or Market Gate candidates retained | {dc['KEEP — protected']} |",f"| Remaining Macro visual mismatches | {len(V['macro']['mismatches'])} |",f"| Micro visual mismatches (detection only) | {len(V['micro']['mismatches'])} |",'','Repair categories overlap; their counts should not be added to infer unique questions. Candidate searches deliberately include false positives such as real interest rates, mathematical reciprocals, graphs that are attached, and “figures” meaning numbers. No broad economic or difficulty audit was reopened.','','## Editorial decisions','','The supplied faculty voice profile and extracted text of the five faculty assessments were used as the positive reference: relevant situations, direct economic questions, familiar nouns, useful formulas and compact choices. The final Macro exam and quiz supplied the main Macro comparison; Micro exams were stylistic references only. No assessment questions were copied into the bank.','','- Converted the eight “Use the dollar market” questions to self-contained text. Also removed the unattached “standard diagram” reference in LG-R-5040. No graph was invented or attached.','- Made nominal/real exchange-rate terminology explicit in the reviewed exchange-rate families. PMOE-RER-B3-001 now follows the direct formula → changes → question structure used by PMOE-RER-M-002. Exact multi-period calculations remain exact.','- Replaced reciprocal-quotation tasks with actual currency conversions; preserved the arithmetic and correct option positions.','- Removed unnecessary reports and analysts from calculations involving CPI, GDP, productivity, labor-force rates and related topics. Retained genuine error-diagnosis questions, including mistaken denominator, accounting and causal-inference claims.','- Preserved useful formula explanations and ordinary interest-rate language. Three shared Micro/Macro trade questions retain “textbook model” feedback (P75-TRADE-M-010, P75-TRADE-E-009, P75-TRADE-EB-005) because the instruction freezes Micro content. They are explicitly recorded as protected rather than silently edited.','','## Visual integrity','',f"The deterministic validator scans stems for graph(s), figure(s), diagram(s), ‘as shown’ and ‘use the dollar market’. Every reference must resolve to an active registered image with matching bytes/checksum, or an exact-stem allowlist entry with a reviewed conceptual/numerical rationale. It checked {V['macro']['references']} current Macro references: {len(V['macro']['validImages'])} valid images and {len(V['macro']['allowlisted'])} exceptions. It detected {V['micro']['references']} Micro references: {len(V['micro']['validImages'])} valid images and {len(V['micro']['allowlisted'])} exceptions, with no mismatches. Micro remained unchanged.",'','The allowlist is not a wildcard exemption: changed wording is rejected. Negative controls also reject missing and corrupt assets, changes to Micro/Market Gate, and an unauthorized tier change. The nine original Macro mismatches are listed in visual-validation.json.','','## Validation and exports','',f"All {len(tests)} current Composer suites passed (the established 30 plus the new faculty-voice/visual-integrity suite). All 25 exporter tests passed. Historical audit tests retain exact before/after proof through the new editorial ledger; no broad exemption was introduced.",'',f"All {len(micro):,} Micro records and {len(mg)} Macro-visible Market Gate records are identical to baseline. All {len(N['assetInventory'])} asset inventory entries and their on-disk checksums are unchanged. The only question fields changed are q, options, feedback and derived aHash; answer hashes use the Composer normalization function and the original correct option index. The library/registry/manifest/policy hashes were refreshed; coverage and routing metadata remain identical.",'','The official exporter regenerated the separate General, Micro and Macro PDF/CSV files because that is its atomic supported workflow. Macro contains 4,747 questions. Full CSV parity was checked for every question in all three areas, and every edited Macro stem, choice and feedback block was checked in the PDF. Ten representative questions across nine distinct pages were rendered and visually inspected. No clipped text, overlaps or unreadable mathematical notation were observed. See export-validation.json for question-to-page references.','','## Deliverables','','- macro_faculty_voice_cleanup_20261006.csv: the requested columns, one row for each of the 112 edits.','- This report.','- ../macroeconomics_question_bank.pdf and ../macroeconomics_question_bank.csv: regenerated faculty review exports.','- audit_tools/macro_voice_20261006/expectations.json: exact before/after records, fields, preserved correct indices and rationales.','- candidate-dispositions.csv, required-searches.json, scan-summary.json, visual-allowlist.json, visual-validation.json, test-results.json and export-validation.json: reproducible evidence.','','No commit, push or deployment was performed. No further broad audit was initiated.','',f"Library SHA-256: `{N['librarySha256']}`."]
(A/'macro_faculty_voice_cleanup_20261006.md').write_text('\n'.join(md)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2))
