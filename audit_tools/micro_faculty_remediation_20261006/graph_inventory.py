"""Build a read-only graph inventory and legible visual inspection sheets."""
import json, hashlib, csv, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
from author import B, M, HERE
ROOT=HERE.resolve().parents[1]
DATA=ROOT/'build/faculty-build-composer/data'
OUT=HERE/'graph-qa'; OUT.mkdir(exist_ok=True)
refs={}
for id,r in B.items():
    asset=r['q'].get('image')
    if asset and id in M: refs.setdefault(asset,[]).append(id)
rows=[]
for i,(asset,ids) in enumerate(sorted(refs.items())):
    p=DATA/asset
    if not p.exists(): raise RuntimeError(p)
    with Image.open(p) as im: size=im.size
    rows.append(dict(index=i,asset=asset,ids=ids,all_ids=[id for id,r in B.items() if r['q'].get('image')==asset],pass_ids=[id for id in ids if M[id]['state']=='FACULTY PASS'],flag_ids=[id for id in ids if M[id]['state']=='FACULTY FLAG'],sha256=hashlib.sha256(p.read_bytes()).hexdigest(),size=size))
(HERE/'graph_inventory.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',20)
for start in range(0,len(rows),8):
    canvas=Image.new('RGB',(1800,1600),'#dddddd'); d=ImageDraw.Draw(canvas)
    for j,row in enumerate(rows[start:start+8]):
        x=(j%2)*900;y=(j//2)*400
        im=Image.open(DATA/row['asset']).convert('RGB');im.thumbnail((880,350))
        canvas.paste(im,(x+(900-im.width)//2,y+40))
        d.text((x+10,y+5),f"{row['index']:03} {Path(row['asset']).name}",fill='black',font=font)
    canvas.save(OUT/f'before-{start:03}.jpg',quality=92)
print(f'{len(rows)} unique graphs, {sum(len(r["ids"]) for r in rows)} Micro references')
