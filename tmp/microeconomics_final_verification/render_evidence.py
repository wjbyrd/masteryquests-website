import json,sys
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
R=Path(__file__).resolve().parents[2];W=Path(__file__).resolve().parent
S=json.loads((W/'substantive.json').read_text(encoding='utf-8'))
assets=sorted({s['q']['image'] for s in S if s['q'].get('image')})
manifest=[]
for start in range(0,len(assets),6):
 sheet=Image.new('RGB',(1600,1560),'white');draw=ImageDraw.Draw(sheet)
 for i,path in enumerate(assets[start:start+6]):
  im=Image.open(R/'build/faculty-build-composer/data'/path).convert('RGB');thumb=ImageOps.contain(im,(790,470))
  x=(i%2)*800;y=(i//2)*520
  sheet.paste(thumb,(x+(800-thumb.width)//2,y+35));draw.text((x+5,y+5),path.split('/')[-1],fill='black')
  manifest.append({'asset':path,'sheet':start//6+1,'slot':i+1,'ids':[s['id'] for s in S if s['q'].get('image')==path]})
 sheet.save(W/f'assets_{start//6+1:02}.png')
(W/'image_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'assets':len(assets),'sheets':(len(assets)+5)//6}))
