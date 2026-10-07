"""Freeze the authorized October 7 review subset; never discover new defects."""
import json, pathlib, shutil
R=pathlib.Path(__file__).resolve().parents[2]; D=pathlib.Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
rows=read(R/'faculty_exports/audits/micro_voice_review_20261007/review-findings.json')
records={r['id']:r for r in read(R/'faculty_exports/audits/micro_voice_review_20261007/records.json')}
special={'42367','42334','42737','P62F-PC-B3-057','P62F-PC-L-099'}
scope=[r for r in rows if r['reviewStatus']=='Confirmed editorial candidate' or r['id'] in special or ('connect' in r['q']['q'].lower() and r['q'].get('instructionalRole')=='bridge')]
assert sum(r['reviewStatus']=='Confirmed editorial candidate' for r in scope)==125
(D/'authority.json').write_text(json.dumps(scope,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(D/'baseline').mkdir(exist_ok=True)
for name in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:
 target=D/'baseline'/name
 if not target.exists():shutil.copyfile(R/'build/faculty-build-composer/data'/name,target)
print('Authorized dispositions:',len(scope))
