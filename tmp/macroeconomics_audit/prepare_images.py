import csv,json,hashlib
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2];work=root/'tmp/macroeconomics_audit'; data=root/'build/faculty-build-composer/data'
with (root/'faculty_exports/macroeconomics_question_bank.csv').open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
assets={}
for r in rows:
    p=r.get('resolved_image_file')
    if not p: continue
    path=root/p
    if p not in assets:
        with Image.open(path) as im: im.load(); size=im.size
        assets[p]={'path':path.relative_to(data).as_posix(),'resolvedFile':p,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'size':size,'ids':[],'literalPaths':[]}
    assets[p]['ids'].append(r['question_id'])
items=sorted(assets.values(),key=lambda x:x['path'])
for i,x in enumerate(items): x['index']=i
(work/'images.json').write_text(json.dumps(items,indent=2),encoding='utf8')
print(json.dumps({'resolvedDistinctPaths':len(items),'distinctImageHashes':len({x['sha256'] for x in items}),'imageQuestionCount':sum(len(x['ids']) for x in items)}))
