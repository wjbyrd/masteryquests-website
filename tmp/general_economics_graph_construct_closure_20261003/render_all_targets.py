from pathlib import Path
import re,json,hashlib
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
ROOT=Path.cwd();HERE=ROOT/'tmp/general_economics_graph_construct_closure_20261003'
ledger=json.loads((ROOT/'audit_tools/general_economics_graph_construct_closure_20261003/expectations.json').read_text())
summary=json.loads((ROOT/'faculty_exports/validation_summary.json').read_text())
source_sha=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert source_sha==summary['source_sha256']
pdf=ROOT/'faculty_exports/general_economics_question_bank.pdf'
doc=pdfium.PdfDocument(str(pdf));anchors=summary['disciplines']['general']['question_pages']
ordered=list(anchors);question_pages={}
# Include all continuation pages, excluding a subsequent page that starts
# directly with the next question after its running header and footer.
for i in ledger['authorizedIds']:
 pos=ordered.index(i);first=anchors[i];last=anchors[ordered[pos+1]] if pos+1<len(ordered) else len(doc)
 if last>first and pos+1<len(ordered):
  p=doc[last-1];tp=p.get_textpage();text=tp.get_text_range();tp.close();p.close()
  pre=text.split('Question ID: '+ordered[pos+1],1)[0]
  pre=re.sub(r'MASTERY QUESTS / GENERAL ECONOMICS / FACULTY INSPECTION','',pre)
  pre=re.sub(r'2026-10-03\s+\d+','',pre)
  if not pre.strip():last-=1
 question_pages[i]=list(range(first,last+1))
pages=sorted({p for v in question_pages.values() for p in v});sheets=[]
for offset in range(0,len(pages),2):
 ims=[]
 for p in pages[offset:offset+2]:
  page=doc[p-1];im=page.render(scale=1.35).to_pil().convert('RGB');page.close();ims.append((p,im))
 canvas=Image.new('RGB',(sum(im.width for _,im in ims),max(im.height for _,im in ims)+28),'#eeeeee');draw=ImageDraw.Draw(canvas);x=0
 for p,im in ims:
  labels=', '.join(i for i,ps in question_pages.items() if p in ps)
  draw.text((x+8,6),f'Page {p} / {labels}',fill='black');canvas.paste(im,(x,28));x+=im.width
 name=f'qa-{offset//2+1:02}.png';canvas.save(HERE/name);sheets.append({'file':name,'pages':pages[offset:offset+2]})
pending={'source_sha256':source_sha,'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'question_pages':question_pages,'inspected_pages':pages,'sheets':sheets}
(HERE/'pdf_visual_qa_pending.json').write_text(json.dumps(pending,indent=2)+'\n')
print(json.dumps({'questions':len(question_pages),'pages':len(pages),'sheets':sheets},indent=2))
