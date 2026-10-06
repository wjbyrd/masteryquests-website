import csv,json,hashlib
from pathlib import Path
import openpyxl
R=Path.cwd();H=R/'audit_tools/macro_faculty_closure_20261006'
text=(H/'baseline/composer_library.js').read_text(encoding='utf-8');lib=json.loads(text.removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
assert lib['librarySha256']=='b38b4010a1cfacf0224c973f22174ab266f2b4c992642e9a55df30df59335a20'
u={x['id']:x for x in json.loads((R/'audit_tools/macro_faculty_standard_20261006/records.json').read_text())}
cs=list(csv.DictReader(open(R/'faculty_exports/audits/macro_faculty_review_candidates_20261006.csv',encoding='utf-8-sig')))
extra=['P77-MVM-L-021','ECON-SP-FINALBOSS-4016','ECON-SP-LEGENDARYBOSS-9110','ECON-EC-FINALBOSS-19011','ECON-NL-LEGENDARYBOSS-9121','ECON-NL-MEDIUMBOSS-3021','ECON-NL-MEDIUMBOSS-3026','ECON-EC-FINALBOSS-19012','ECON-NL-FINALBOSS-4016','ECON-NL-FINALBOSS-4041','LG-Q-9069','ECON-EC-FINALBOSS-19001','ECON-EC-MEDIUMBOSS-18000','PM2B2-BIAS-FB-004','PM2B2-BIAS-MB-002','ECON-EC-FINALBOSS-19004','ECON-EC-MEDIUMBOSS-18004','ECON-NL-EASYBOSS-2035','PM2B2-RNI-MB-003']
ids=list(dict.fromkeys([c['Question ID'] for c in cs]+extra+[i for c in cs[24:] for i in c['Related family IDs'].split('; ') if i]))
found={};places={}
for cid,m in lib['concepts'].items():
 for p,qs in m.get('questions',{}).items():
  for q in qs:
   if str(q['id']) in ids:found[str(q['id'])]=q;places.setdefault(str(q['id']),[]).append([cid,p])
 for p in ['repairQuestions','bridgeQuestions','repairSeedQuestions']:
  for q in m.get(p,[]):
   if str(q['id']) in ids:found[str(q['id'])]=q;places.setdefault(str(q['id']),[]).append([cid,p])
assert set(ids)==set(found)
scope=[{'id':i,'areas':u[i]['areas'],'marketGateDerived':u[i].get('marketGateDerived',False),'provenance':u[i]['provenance'],'placements':places[i],'q':found[i]} for i in ids]
(H/'scope.json').write_text(json.dumps(scope,ensure_ascii=False,indent=2),encoding='utf-8')
lines=[]
for r in scope:
 q=r['q'];lines += [r['id']+' AREAS '+str(r['areas'])+' PLACES '+str(r['placements']),json.dumps({k:q.get(k) for k in ['difficulty','canonicalDifficulty','instructionalRole','sourcePool','originalSourcePool','checkpointPool','primaryConceptId','primarySkill','repairSkill','requiredConceptIds','modeAllowlist','type','tag','objective']},ensure_ascii=False),q['q'],json.dumps(q['options'],ensure_ascii=False),'Feedback: '+q.get('feedback',''),'']
(H/'scoped-reading.txt').write_text('\n'.join(lines),encoding='utf-8')
w=openpyxl.load_workbook(r'C:\Users\Jennings\Desktop\macroeconomics_manual_review.xlsx',data_only=True)
dec=[list(r) for r in w['Question Review'].iter_rows(min_row=6,values_only=True) if any(r[3:7])]
assert {r[2] for r in dec}=={c['Question ID'] for c in cs}
(H/'workbook-decisions.json').write_text(json.dumps(dec,ensure_ascii=False,indent=2),encoding='utf-8')
print('Scope',len(scope),'workbook decisions',len(dec));print([(r['id'],r['areas']) for r in scope if r['areas']!=['macro']])
