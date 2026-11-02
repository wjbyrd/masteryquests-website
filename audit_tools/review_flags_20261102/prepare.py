"""Capture the approved bank and the 54 genuinely outstanding review requests."""
from pathlib import Path
import json,shutil,hashlib
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
BASE=HERE/'baseline';BASE.mkdir(exist_ok=True)
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
for name in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:
    target=BASE/name
    if not target.exists():shutil.copy2(ROOT/'build/faculty-build-composer/data'/name,target)
for name in ['personal-review-list-data.json','review-template.html','build-review-html.py']:
    target=BASE/name
    if not target.exists():shutil.copy2(PROJECT/'source'/name,target)
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
data=read(BASE/'personal-review-list-data.json')
items=[dict(id=str(row['id']),topic=row['topic'],question=row['q'],review=data['reviewSeed'][str(row['id'])]) for row in data['questions'] if data['reviewSeed'][str(row['id'])]['status']=='flag']
assert len(items)==54
inventory=dict(baselineCommit='0d89ff0febcbb0565c81f303706f6a177584d080',beforeLibrarySha256=data['librarySha256'],sourceSha256=hashlib.sha256((BASE/'composer_library.js').read_bytes()).hexdigest(),items=items)
(HERE/'inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'pending':len(items),'librarySha256':data['librarySha256']}))
