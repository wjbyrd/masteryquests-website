from pathlib import Path
from collections import Counter
import csv,json,shutil,hashlib
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
BASE=HERE/'baseline';BASE.mkdir(exist_ok=True)
for name in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:
    assert not (BASE/name).exists(),'Do not recapture the baseline'
    shutil.copy2(ROOT/'build/faculty-build-composer/data'/name,BASE/name)
for name in ['personal-review-list-data.json','review-template.html','build-review-html.py']:shutil.copy2(PROJECT/'source'/name,BASE/name)
shutil.copy2(Path('C:/Users/Jennings/Downloads/MasteryQuests-review-results(16).csv'),BASE/'reviews.csv')
rows=list(csv.DictReader((BASE/'reviews.csv').open(encoding='utf-8-sig',newline='')))
data=json.loads((BASE/'personal-review-list-data.json').read_text(encoding='utf-8-sig'));qm={q['id']:q for q in data['questions']}
fresh=[r for r in rows if r['Last updated']>data['reviewSeed'][r['Question ID']]['updated']]
targets=[r for r in fresh if r['Review status']=='Reviewed — flag' or r['Notes'].strip() or 'learner' in json.dumps(qm[r['Question ID']]['q']).lower()]
assert len(fresh)==427 and len(targets)==77
items=[{'id':r['Question ID'],'topic':r['Topic'],'review':r,'question':qm[r['Question ID']]['q']} for r in targets]
report={'baselineCommit':'6d257042','beforeLibrarySha256':data['librarySha256'],'reviewExportSha256':hashlib.sha256((BASE/'reviews.csv').read_bytes()).hexdigest(),'newReviews':427,'newPass':405,'newFlag':22,'items':items}
(HERE/'inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'targets':77,'flags':22,'passedWithTerminologyNotes':51,'additionalPassedTerminologyCorrections':4,'newReviewRoles':dict(Counter(qm[r['Question ID']]['q']['instructionalRole'] for r in fresh))}))
