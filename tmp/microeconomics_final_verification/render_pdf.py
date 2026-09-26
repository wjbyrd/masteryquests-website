import json
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
W=Path(__file__).resolve().parent;R=W.parents[1]
d=json.loads((W/'pdf_selection.json').read_text());doc=pdfium.PdfDocument(R/'faculty_exports/microeconomics_question_bank.pdf')
pages={1,2,len(doc)}
pages.update(d['questionPages'][id] for id in d['ids'])
for id in d['metadata']:
 p=d['questionPages'][id];pages.update([p-1,p,p+1])
items=[]
for p in sorted(pages):
 page=doc[p-1]; im=page.render(scale=1.5).to_pil().convert('RGB');im.save(W/f'pdf_page_{p:04d}.png');items.append((p,im));page.close()
for i in range(0,len(items),2):
 pair=items[i:i+2];sheet=Image.new('RGB',(max(im.width for p,im in pair)*2,max(im.height for p,im in pair)+35),'#ddd');draw=ImageDraw.Draw(sheet)
 for j,(p,im) in enumerate(pair):sheet.paste(im,(j*im.width,35));draw.text((j*im.width+10,10),f'Final regenerated PDF: page {p}',fill='black')
 sheet.save(W/f'pdf_sheet_{i//2+1:02d}.png')
doc.close();(W/'pdf_visual_pages.json').write_text(json.dumps(sorted(pages)));print(len(pages))
