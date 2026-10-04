from review_tools import *
from PIL import Image,ImageDraw,ImageOps
B=EVIDENCE/'browser'
rows=json.loads((B/'render-index.json').read_text())['assets']
for mode in ['inline','expanded']:
 for start in range(0,len(rows),3):
  sheet=Image.new('RGB',(1420,1380),'#d9d9d9');draw=ImageDraw.Draw(sheet)
  for i,row in enumerate(rows[start:start+3]):
   y=i*460
   draw.text((8,y+5),f"{row['index']:02} {row['asset']} — {mode}",fill='black')
   for kind,x,w in ([('desktop',8,970),('mobile',1000,400)] if mode=='inline' else [('lightbox',8,970),('mobile-lightbox',1000,400)]):
    img=Image.open(B/f"{row['index']:02}-{kind}.png").convert('RGB')
    img=ImageOps.contain(img,(w,420))
    sheet.paste(img,(x,y+30))
  sheet.save(B/f'{mode}-{start:02}.png')
for start in range(0,len(rows),4):
 sheet=Image.new('RGB',(1560,1320),'#d9d9d9');draw=ImageDraw.Draw(sheet)
 for i,row in enumerate(rows[start:start+4]):
  x=(i%2)*780;y=(i//2)*660
  draw.text((x+5,y+5),f"{row['index']:02} {row['asset'].split('/')[-1]} (mobile pan edges)",fill='black')
  for j,side in enumerate(['left','right']):
   img=Image.open(B/f"{row['index']:02}-mobile-pan-{side}.png").convert('RGB')
   # Native viewport crops retain the graph, closing control and swipe guidance.
   img=ImageOps.contain(img,(385,630))
   sheet.paste(img,(x+j*390,y+25))
 sheet.save(B/f'pan-{start:02}.png')
