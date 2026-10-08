from pathlib import Path
import json,hashlib,shutil,re,collections
from PIL import Image,ImageOps,ImageDraw
D=Path(__file__).resolve().parent;R=D.parents[1];S=R/'faculty_exports/audits/faculty_validation_20261007';C=R/'build/faculty-build-composer/data'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
study=read(S/'study.json');summary=read(S/'faculty_responses/batch3_20261008/batch3_summary.json');response_path=S/'faculty_responses/batch3_20261008/faculty-validation-responses.original.json';responses=read(response_path)
assert sha(response_path)==summary['sourceBackupSha256']=='5563146faa367cbef227dbf8fbf13bac643e612fbdc67dd461746bf730bee8a9'
assert responses['sampleSha256']==summary['sampleSha256']==study['provenance']['sampleSha256']=='5442b88493c7a22a420a44102811560ee5b3fac1e6e654e0db1322b8ce05cf5d'
assert sha(C/'composer_library.js')==study['provenance']['sourceSha256']
assert len(responses['responses'])==300 and collections.Counter(r['assessment'] for r in responses['responses'].values())=={'PASS':244,'MINOR EDITORIAL ISSUE':53,'SUBSTANTIVE DEFECT':2,'UNCERTAIN / NEEDS REVISIT':1}
assert sum(bool(r['notes'].strip()) for r in responses['responses'].values())==68
assert sum(r['wordingConcern'] for r in responses['responses'].values())==55 and sum(r['difficultyConcern'] for r in responses['responses'].values())==13
(D/'baseline').mkdir(parents=True,exist_ok=True)
for name in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:
 p=D/'baseline'/name
 if p.exists():assert p.read_bytes()==(C/name).read_bytes()
 else:shutil.copyfile(C/name,p)
protected=[p for p in S.iterdir() if p.is_file()]+[p for p in (S/'faculty_responses').rglob('*') if p.is_file()]
(D/'frozen_evidence.json').write_text(json.dumps({str(p.relative_to(R)):sha(p) for p in protected},indent=2))
lib=json.loads((C/'composer_library.js').read_text(encoding='utf8')[len('window.MQ_COMPOSER_LIBRARY='):].strip()[:-1]);records={}
def walk(x):
 if isinstance(x,dict):
  if 'q' in x and 'options'in x and 'id'in x:
   qid=str(x['id']);assert qid not in records or records[qid]==x;records[qid]=x
  else:
   for v in x.values():walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
walk(lib)
population={p['id']:p for p in read(S/'population.json')}
sample={q['id']:q for q in study['questions']};direct=[]
for qid,r in responses['responses'].items():
 assert records[qid]==sample[qid]['original'],qid
 if r['assessment']!='PASS' or r['notes'].strip() or r['difficultyConcern'] or r['wordingConcern']:
  direct.append({'id':qid,'order':sample[qid]['order'],'response':r,'question':records[qid],'key':sample[qid]['answer'],'areas':population[qid]['areas']})
direct.sort(key=lambda c:c['order']);(D/'direct.json').write_text(json.dumps(direct,ensure_ascii=False,indent=2))
adjudicated=json.loads(json.dumps(responses));adjudicated['responses']['ECON-NL-HARD-236']['assessment']='PASS'
(D/'adjudicated_responses.json').write_text(json.dumps(adjudicated,ensure_ascii=False,indent=2))
(D/'adjudication.json').write_text(json.dumps({'id':'ECON-NL-HARD-236','authority':'User remediation instructions, 8 October 2026','originalBackupSha256':sha(response_path),'sampleSha256':responses['sampleSha256'],'originalAssessment':'UNCERTAIN / NEEDS REVISIT','adjudicatedAssessment':'PASS','originalNote':responses['responses']['ECON-NL-HARD-236']['notes'],'canonicalDifficulty':'medium','originalResponsePreserved':True,'finalCounts':dict(collections.Counter(r['assessment'] for r in adjudicated['responses'].values()))},indent=2))
# Contact sheets are QA derivatives; original image bytes are never edited.
(D/'graphs').mkdir(exist_ok=True);graphrows=[r for r in direct if r['question'].get('image')]
for start in range(0,len(graphrows),4):
 page=Image.new('RGB',(1600,1250),'white');draw=ImageDraw.Draw(page)
 for j,r in enumerate(graphrows[start:start+4]):
  p=C/r['question']['image'];im=Image.open(p).convert('RGB');im.thumbnail((775,570));x=(j%2)*800;y=(j//2)*625;page.paste(im,(x+(800-im.width)//2,y+35));draw.text((x+15,y+5),r['id']+' | '+r['question'].get('image',''),fill='black')
 page.save(D/'graphs'/f'direct-{start//4+1}.png')
patterns={'case-label':r'^(?:Labor-market case [A-Z]|Redistribution proposal [A-Z]):','long-run-firm':r'\b[Aa] long-run firm\b','single-price':r'\bone-price monopol','internal-task':r'incremental comparison|correct next-step decision|Which diagnosis uses both curve evidence|What problem is indicated|Which judgment is best|classroom example','undefined-case':r'(?:in the|from the|for the) [A-Z][a-z]+(?: [A-Z][a-z]+)? case','repeated-horizon':r'present.value|each period ahead','labor-notation':r'\b[SD] L[012]?\b','graph-initial':r'common starting point|unregulated equilibrium','harmful':r'\bharmful conduct\b'}
additional=[]
for qid,q in records.items():
 if not set(population[qid]['areas'])&{'micro','macro'}:continue
 labels=[label for label,pat in patterns.items() if re.search(pat,q['q'])]
 options=q['options'];lens=[len(re.findall(r'\w+',o)) for o in options];key=next((i for i,o in enumerate(options) if hashlib.sha256(re.sub(r'\s+',' ',__import__('unicodedata').normalize('NFKC',o).strip()).lower().encode()).hexdigest()==q['aHash']),None)
 if key is not None and lens[key]>=20 and lens[key]>=1.6*max(v for i,v in enumerate(lens) if i!=key) and lens[key]-max(v for i,v in enumerate(lens) if i!=key)>=8:labels.append('long-key')
 if labels and qid not in {r['id'] for r in direct}:additional.append({'id':qid,'patterns':labels,'areas':population[qid]['areas'],'question':q,'key':key,'lengths':lens})
(D/'pattern_candidates.json').write_text(json.dumps(additional,ensure_ascii=False,indent=2))
print(json.dumps({'sourceVerified':True,'directRecords':len(direct),'graphs':len(graphrows),'graphSheets':(len(graphrows)+3)//4,'additionalScreenHits':len(additional),'patterns':dict(collections.Counter(p for a in additional for p in a['patterns']))},indent=2))
