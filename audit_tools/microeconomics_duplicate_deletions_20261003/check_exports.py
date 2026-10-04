"""Check the two deletions in all exports and render adjacent Micro pages."""
from pathlib import Path
import json,csv,hashlib,collections
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
H=Path(__file__).resolve().parent;ROOT=H.parents[1];W=ROOT/'tmp'/H.name;OUT=ROOT/'faculty_exports'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
deleted={'42660','42697'};checks={}
for name,count in [('general_economics',1589),('microeconomics',6299),('macroeconomics',4745)]:
 def rows(p):
  with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
 before=rows(W/(name+'_question_bank.csv'));after=rows(OUT/(name+'_question_bank.csv'))
 assert after==[r for r in before if r['question_id'] not in deleted],name
 assert len(after)==count and len({r['question_id'] for r in after})==count
 checks[name]={'rows':count,'remaining_rows_exactly_unchanged':True,'removed':[r['question_id'] for r in before if r['question_id'] in deleted]}
summary=read(OUT/'validation_summary.json');source=ROOT/'build/faculty-build-composer/data/composer_library.js';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert summary['source_sha256']==sha(source) and summary['status']=='complete'
old=read(W/'validation_summary.json')['disciplines']['micro']['question_pages'];new=summary['disciplines']['micro']['question_pages'];assert set(old)-set(new)==deleted and not(set(new)-set(old))
ids=list(old);neighbors=sorted({ids[n] for i in deleted for n in [ids.index(i)-1,ids.index(i)+1] if 0<=n<len(ids)});pages=sorted({new[i] for i in neighbors})
doc=pdfium.PdfDocument(str(OUT/'microeconomics_question_bank.pdf'));ims=[];texts=[]
for n in range(len(doc)):
 p=doc[n];t=p.get_textpage();texts.append(t.get_text_range());t.close();p.close()
counts=collections.Counter()
import re
for text in texts:counts.update(re.findall(r'Question ID:\s*([^\s]+)',text))
assert set(counts)==set(new) and all(v==1 for v in counts.values()),'Every remaining ID appears once'
for pn in pages:
 p=doc[pn-1];bm=p.render(scale=1.3);ims.append(bm.to_pil().convert('RGB'));bm.close();p.close()
w=max(im.width for im in ims);h=max(im.height for im in ims)+25
sheet=Image.new('RGB',(w*2,h*((len(ims)+1)//2)),'#ddd');draw=ImageDraw.Draw(sheet)
for n,(pn,im) in enumerate(zip(pages,ims)):
 x=n%2*w;y=n//2*h;draw.text((x+5,y+5),f'PDF page {pn}',fill='black');sheet.paste(im,(x,y+25))
sheet.save(W/'deletion-adjacent-pages.png')
result={'status':'PENDING_VISUAL_REVIEW','source_sha256':sha(source),'csv_checks':checks,'micro_pdf_ids_once':len(counts),'deleted_ids_absent':True,'pdf_pages':len(doc),'adjacent_question_ids':neighbors,'adjacent_pages':pages,'pdf_sha256':sha(OUT/'microeconomics_question_bank.pdf'),'normal_exporter_full_question_verification':'PASS'}
(H/'export_verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result,indent=2))
