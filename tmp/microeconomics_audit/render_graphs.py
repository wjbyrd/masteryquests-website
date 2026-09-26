import json,math
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[2];w=root/'tmp/microeconomics_audit';items=json.loads((w/'images.json').read_text());font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
for batch in range(math.ceil(len(items)/6)):
 page=Image.new('RGB',(1800,850),'#d5d5d5');d=ImageDraw.Draw(page)
 for j,x in enumerate(items[batch*6:batch*6+6]):
  im=Image.open(root/'build/faculty-build-composer/data'/x['path']).convert('RGB'); im.thumbnail((590,375));left=(j%3)*600;top=(j//3)*425;page.paste(im,(left+(600-im.width)//2,top+42));d.text((left+5,top+3),str(x['index'])+' '+Path(x['path']).name,fill='black',font=font)
 page.save(w/f'graphs-{batch:02}.png')
print(len(items))
