from review_tools import *
from PIL import Image,ImageOps,ImageDraw
OUT=EVIDENCE/'graph-drafts'
rows=json.loads((OUT/'asset-changes.json').read_text(encoding='utf8'))
for start in range(0,len(rows),4):
 sheet=Image.new('RGB',(1480,1130),'#dddddd');draw=ImageDraw.Draw(sheet)
 for k,asset in enumerate(list(rows)[start:start+4]):
  im=Image.open(OUT/asset).convert('RGB');im=ImageOps.contain(im,(720,510))
  x=(k%2)*740;y=(k//2)*565
  draw.text((x+5,y+5),f'{start+k:02}: {asset.split("/")[-1]}',fill='black')
  sheet.paste(im,(x+(740-im.width)//2,y+32))
 sheet.save(OUT/f'review-{start:02}.png')
