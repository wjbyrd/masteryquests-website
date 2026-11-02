"""Capture the current bank and classify the instructor's elite review queue."""
from pathlib import Path
import csv,json,hashlib,subprocess,collections
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
DATA=ROOT/'build/faculty-build-composer/data'
BASE=HERE/'baseline';BASE.mkdir(exist_ok=True)
BASELINE_COMMIT='7a86aefd70045d315fc56e066eccafc41cd5a58e'
for name in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:
    if not (BASE/name).exists():
        blob=subprocess.check_output(['git','show',f'{BASELINE_COMMIT}:build/faculty-build-composer/data/{name}'],cwd=ROOT)
        (BASE/name).write_bytes(blob)
review_path=Path('C:/Users/Jennings/Downloads/MasteryQuests-review-results(5).csv')
easy_path=Path('C:/Users/Jennings/Downloads/MasteryQuests-review-results(3).csv')
read_csv=lambda p:{r['Question ID']:r for r in csv.DictReader(p.open(encoding='utf-8-sig',newline=''))}
reviews,easy=read_csv(review_path),read_csv(easy_path)
src=(BASE/'composer_library.js').read_text(encoding='utf8')
lib=json.loads(src.removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
by={}
def walk(x):
    if isinstance(x,dict):
        if 'id' in x and 'q' in x:
            identity=str(x['id'])
            if identity in by:assert by[identity]==x,identity
            by[identity]=x
        for v in x.values():walk(v)
    elif isinstance(x,list):
        for v in x:walk(v)
walk(lib['concepts'])
out=[]
for identity,q in by.items():
    if q.get('canonicalDifficulty')!='elite':continue
    r=reviews.get(identity)
    if r and r!=easy.get(identity) and r['Review status']=='Reviewed — flag':group='flagged'
    elif r and r['Review status']=='Not yet marked':group='unreviewed'
    elif r and r['Review status']=='Reviewed — pass':group='approved'
    elif r:group='earlier-review'
    else:group='previously-documented'
    out.append({'id':identity,'group':group,'review':r,'question':q})
out.sort(key=lambda r:(r['question']['primaryConceptId'],r['id']))
payload={'baselineCommit':'7a86aefd70045d315fc56e066eccafc41cd5a58e','beforeLibrarySha256':lib['librarySha256'],'sourceSha256':hashlib.sha256((BASE/'composer_library.js').read_bytes()).hexdigest(),'reviewSource':str(review_path),'reviewSha256':hashlib.sha256(review_path.read_bytes()).hexdigest(),'groups':dict(collections.Counter(r['group'] for r in out)),'items':out}
(HERE/'inventory.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(HERE/'review-records.json').write_text(json.dumps(reviews,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for name in ['content-edits.json','decisions.json']:
    if not (HERE/name).exists():(HERE/name).write_text('{}\n',encoding='utf8')
print(json.dumps(payload['groups']))
