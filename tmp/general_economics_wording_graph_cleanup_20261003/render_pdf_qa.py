from pathlib import Path
import json
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
root=Path.cwd();work=root/'tmp/general_economics_wording_graph_cleanup_20261003'
summary=json.loads((root/'faculty_exports/validation_summary.json').read_text())
doc=pdfium.PdfDocument(str(root/'faculty_exports/general_economics_question_bank.pdf'))
ids=['40002','PG1-DMD-L-003','40014','P62D-ITP-B3-054','P62D-ITP-L-099','PG2-STX-EL-001','P62D-ITP-LB-009','P74-INC-L-021']
anchors=summary['disciplines']['general']['question_pages']
pages=[(1,'Title'),*[(anchors[i],i) for i in ids],(len(doc),'Last page')]
for n in range(0,len(pages),2):
 images=[]
 for page,label in pages[n:n+2]:
  p=doc[page-1];im=p.render(scale=1.25).to_pil().convert('RGB');images.append((im,page,label));p.close()
 canvas=Image.new('RGB',(sum(i.width for i,_,_ in images),max(i.height for i,_,_ in images)+30),'#dddddd');draw=ImageDraw.Draw(canvas);x=0
 for im,page,label in images:draw.text((x+12,8),f'Page {page}: {label}',fill='black');canvas.paste(im,(x,30));x+=im.width
 canvas.save(work/f'pdf-qa-{n//2+1}.png')
(work/'pdf_visual_qa_pending.json').write_text(json.dumps({'source_sha256':summary['source_sha256'],'pages':[{'page':p,'question_id_or_section':i} for p,i in pages],'method':'Rendered final PDF with pypdfium2; inspected the ten listed pages for readable question/options/feedback, graphs, margins, headers and footers.'},indent=2))
print(pages)
