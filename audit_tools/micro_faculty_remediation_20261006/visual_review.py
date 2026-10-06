import json, csv, hashlib, subprocess, shutil
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
H=Path(__file__).resolve().parent; R=H.parent.parent
L=json.loads((H/'expectations.json').read_text()); B=H/'browser'; O=H/'visual-review'; O.mkdir(exist_ok=True)
rows=json.loads((B/'render-index.json').read_text())['assets']
# All asset hashes still match the rendered graphs after metadata-only regeneration.
for a in L['assets']:assert hashlib.sha256((R/'build/faculty-build-composer/data'/a['path']).read_bytes()).hexdigest()==a['sha256']
for mode in ['desktop','lightbox','grayscale','mobile']:
 for start in range(0,len(rows),4):
  sheet=Image.new('RGB',(1800,1200),'#ddd');draw=ImageDraw.Draw(sheet)
  for i,row in enumerate(rows[start:start+4]):
   x=(i%2)*900;y=(i//2)*600
   draw.text((x+8,y+5),f"{row['index']:02} {row['asset'].split('/')[-1]} | {mode}",fill='black')
   im=Image.open(B/f"{row['index']:02}-{mode}.png").convert('RGB');im=ImageOps.contain(im,(890,570));sheet.paste(im,(x,y+28))
  sheet.save(O/f'{mode}-{start:02}.jpg',quality=94)
print('Created 56 browser review sheets')
