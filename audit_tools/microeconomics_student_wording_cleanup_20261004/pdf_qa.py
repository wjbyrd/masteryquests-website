from pathlib import Path
import json,re,csv,hashlib
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
H=Path(__file__).parent;ROOT=H.parent.parent;W=ROOT/'tmp'/H.name;OUT=ROOT/'faculty_exports'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
summary=read(OUT/'validation_summary.json');ledger=read(H/'expectations.json')
targets={c['id']:c for c in ledger['changes']}
anchors=summary['disciplines']['micro']['question_pages'];ordered=list(anchors)
pdf=OUT/'microeconomics_question_bank.pdf';doc=pdfium.PdfDocument(str(pdf))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(ROOT/'build/faculty-build-composer/data/composer_library.js')==summary['source_sha256']
coverage={}
for i in targets:
 n=ordered.index(i);first=anchors[i];last=anchors[ordered[n+1]] if n+1<len(ordered) else len(doc)
 if last>first and n+1<len(ordered):
  page=doc[last-1];tp=page.get_textpage();s=tp.get_text_range().split('Question ID: '+ordered[n+1],1)[0];tp.close();page.close()
  s=re.sub(r'MASTERY QUESTS / MICROECONOMICS / FACULTY INSPECTION|2026-10-04\s+\d+','',s)
  if not s.strip():last-=1
 coverage[i]=list(range(first,last+1))
pages=sorted({pn for arr in coverage.values() for pn in arr});boxes=[];rendered=[]
for pn in pages:
 page=doc[pn-1];tp=page.get_textpage();w,h=page.get_size()
 for n in range(tp.count_chars()):
  if not tp.get_text_range(n,1).strip():continue
  left,bottom,right,top=tp.get_charbox(n)
  if left < -1 or bottom < -1 or right>w+1 or top>h+1:boxes.append({'page':pn,'char':n,'box':[left,bottom,right,top]})
 tp.close();bitmap=page.render(scale=1);im=bitmap.to_pil().convert('RGB');assert im.getbbox();im.save(W/f'page-{pn}.png');rendered.append(pn);bitmap.close();page.close()
assert not boxes,boxes[:5]
# Contact sheets cover every page occupied by an authorized target; full-size
# renders are also available for inspecting the 13 graph targets and dense items.
sheets=[]
for offset in range(0,len(pages),6):
 group=pages[offset:offset+6];ims=[Image.open(W/f'page-{pn}.png') for pn in group]
 width=max(x.width for x in ims);height=max(x.height for x in ims)+24
 canvas=Image.new('RGB',(width*3,height*2),'#ddd');draw=ImageDraw.Draw(canvas)
 for k,(pn,im) in enumerate(zip(group,ims)):
  x=k%3*width;y=k//3*height;draw.text((x+5,y+5),f'Page {pn}',fill='black');canvas.paste(im,(x,y+24))
 name=f'qa-{offset//6+1:02}.png';canvas.save(W/name);sheets.append({'file':name,'pages':group})
result={'status':'PENDING_VISUAL_REVIEW','source_sha256':summary['source_sha256'],'pdf_sha256':sha(pdf),'total_pdf_pages':len(doc),'target_ids':list(targets),'coverage':coverage,'rendered_pages':rendered,'text_outside_page':boxes,'graph_target_ids':[i for i,c in targets.items() if c['afterRecord'].get('image')],'contact_sheets':sheets}
(W/'pdf_qa.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'rendered_target_pages':len(pages),'sheets':len(sheets),'out_of_page_text':len(boxes),'graph_targets':len(result['graph_target_ids'])}))
