from pathlib import Path
import json
from PIL import Image,ImageDraw
D=Path(__file__).resolve().parent;R=D.parents[1]
rows=json.loads((D/'manifest.json').read_text(encoding='utf8'));direct={r['before'].get('image') for r in rows if r['source']=='direct sample'}
graphs={r['before']['image']:r['id'] for r in rows if r['before'].get('image') and r['before']['image'] not in direct}
for start in range(0,len(graphs),4):
 page=Image.new('RGB',(1600,1250),'white');draw=ImageDraw.Draw(page)
 for j,(impath,id) in enumerate(list(graphs.items())[start:start+4]):
  im=Image.open(R/'build/faculty-build-composer/data'/impath).convert('RGB');im.thumbnail((775,570));x=j%2*800;y=j//2*625;page.paste(im,(x+(800-im.width)//2,y+35));draw.text((x+15,y+5),id+' | '+Path(impath).name,fill='black')
 page.save(D/'graphs'/f'patterns-{start//4+1}.png')
print(json.dumps(graphs))
