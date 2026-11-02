from pathlib import Path
import csv, json, shutil, hashlib
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
BASE=HERE/'baseline';BASE.mkdir(exist_ok=True)
for name in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:
    if not (BASE/name).exists():shutil.copy2(ROOT/'build/faculty-build-composer/data'/name,BASE/name)
for name in ['personal-review-list-data.json','review-template.html','build-review-html.py']:
    if not (BASE/name).exists():shutil.copy2(PROJECT/'source'/name,BASE/name)
export=Path('C:/Users/Jennings/Downloads/MasteryQuests-review-results(15).csv')
if not (BASE/'reviews.csv').exists():shutil.copy2(export,BASE/'reviews.csv')
rows=list(csv.DictReader((BASE/'reviews.csv').open(encoding='utf-8-sig',newline='')))
data=json.loads((BASE/'personal-review-list-data.json').read_text(encoding='utf-8-sig'))
qm={q['id']:q for q in data['questions']}
flags=[r for r in rows if r['Review status']=='Reviewed — flag']
assert len(flags)==189
items=[{'id':r['Question ID'],'topic':r['Topic'],'review':r,'question':qm[r['Question ID']]['q']} for r in flags]
report={'baselineCommit':'c3391416','beforeLibrarySha256':data['librarySha256'],'reviewExportSha256':hashlib.sha256((BASE/'reviews.csv').read_bytes()).hexdigest(),'items':items}
(HERE/'inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'flags':len(items),'topics':sorted({r['topic'] for r in items})}))
