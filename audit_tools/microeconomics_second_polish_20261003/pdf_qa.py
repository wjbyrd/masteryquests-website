from pathlib import Path
import json,hashlib,re,csv,importlib.util
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
ROOT=Path.cwd();HERE=ROOT/'audit_tools/microeconomics_second_polish_20261003';WORK=ROOT/'tmp/microeconomics_second_polish_20261003';OUT=ROOT/'faculty_exports'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
summary=read(OUT/'validation_summary.json');targets={i:r for i,r in read(HERE/'acceptance.json').items() if 'graph_test' in r};anchors=summary['disciplines']['micro']['question_pages'];pdf=OUT/'microeconomics_question_bank.pdf'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(ROOT/'build/faculty-build-composer/data/composer_library.js')==summary['source_sha256']
doc=pdfium.PdfDocument(str(pdf));ordered=list(anchors);coverage={};rendered=0
for i in targets:
    n=ordered.index(i);first=anchors[i];last=anchors[ordered[n+1]] if n+1<len(ordered) else len(doc)
    if last>first and n+1<len(ordered):
        page=doc[last-1];tp=page.get_textpage();text=tp.get_text_range();tp.close();page.close()
        pre=text.split('Question ID: '+ordered[n+1],1)[0]
        pre=re.sub(r'MASTERY QUESTS / MICROECONOMICS / FACULTY INSPECTION','',pre)
        pre=re.sub(r'2026-10-03\s+\d+','',pre)
        if not pre.strip():last-=1
    coverage[i]=list(range(first,last+1))
pages=sorted({p for ps in coverage.values() for p in ps});selected=set(pages);texts=[]
spec=importlib.util.spec_from_file_location('exporter',ROOT/'tools/export_faculty_question_bank.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
for n in range(len(doc)):
    page=doc[n];bitmap=page.render(scale=.45);im=bitmap.to_pil();assert im.getbbox(),n+1
    bitmap.close();tp=page.get_textpage();texts.append(e.compact(tp.get_text_bounded()));tp.close();page.close();rendered+=1
    if rendered%500==0:print('Rendered',rendered,'pages',flush=True)
sheets=[]
for offset in range(0,len(pages),6):
    group=pages[offset:offset+6];ims=[]
    for pn in group:
        page=doc[pn-1];bitmap=page.render(scale=1);im=bitmap.to_pil().convert('RGB');bitmap.close();page.close();ims.append(im)
    w=max(im.width for im in ims);h=max(im.height for im in ims)+26
    canvas=Image.new('RGB',(w*3,h*2),'#ddd');draw=ImageDraw.Draw(canvas)
    for k,(pn,im) in enumerate(zip(group,ims)):
        x=k%3*w;y=k//3*h;draw.text((x+4,y+4),f'PDF page {pn}',fill='black');canvas.paste(im,(x,y+26))
    name=f'qa-{offset//6+1:02}.png';canvas.save(WORK/name);sheets.append({'file':name,'pages':group})
with (OUT/'microeconomics_question_bank.csv').open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
split=[]
for n,row in enumerate(rows):
    i=row['question_id'];first=anchors[i];last=anchors[rows[n+1]['question_id']] if n+1<len(rows) else len(doc)
    fragments=[e.compact(row[k]) for k in ['question_text','option_a','option_b','option_c','option_d','correct_answer_text','feedback']]
    if not any(all(part in texts[p-1] for part in fragments) for p in range(first,last+1)):split.append(i)
result={'status':'PENDING_VISUAL_INSPECTION','source_sha256':summary['source_sha256'],'pdf_sha256':sha(pdf),'total_pdf_pages':len(doc),'all_pages_rendered':rendered,'question_pages':coverage,'inspected_pages':pages,'sheets':sheets,'questions_inspected':0,'split_question_cores':split,'core_checks':len(rows)}
(WORK/'pdf_visual_qa_pending.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'pages':len(doc),'target_questions':len(coverage),'target_pages':len(pages),'contact_sheets':len(sheets)}),flush=True)
