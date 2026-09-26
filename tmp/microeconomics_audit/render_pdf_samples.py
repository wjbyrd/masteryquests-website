import json, math
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[2]
w=root/'tmp/microeconomics_audit'
e=json.loads((w/'export_checks.json').read_text())
ids=json.loads((w/'pdf_visual_ids.json').read_text())
pages=sorted(set(p for i in ids for p in (e['question_pages'][i],e['question_pages'][i]+1)))
doc=pdfium.PdfDocument(root/'faculty_exports/microeconomics_question_bank.pdf')
for b in range(math.ceil(len(pages)/4)):
 canvas=Image.new('RGB',(1600,1100),'#ddd');d=ImageDraw.Draw(canvas)
 for j,p in enumerate(pages[b*4:b*4+4]):
  im=doc[p-1].render(scale=1).to_pil();im.thumbnail((780,520))
  x=(j%2)*800;y=(j//2)*550;canvas.paste(im,(x,y+24));d.text((x+5,y+5),str(p),fill='black')
 canvas.save(w/f'pdf-sample-{b:02}.png')
(w/'pdf_visual_pages.json').write_text(json.dumps(pages))
print(len(pages))
