from author import *
import hashlib
import pypdfium2 as pdfium
from PIL import Image,ImageDraw

checks=json.loads((WORK/'export_checks.json').read_text())
path=ROOT/'faculty_exports/macroeconomics_question_bank.pdf'
sha=hashlib.sha256(path.read_bytes()).hexdigest()
assert checks['pdfSHA256']==sha
required=['P52A-CPI-LB-002','LG-Q-9','LG-Q-2004','ECON-SP-EASYBOSS-2002','PM2D2-MULT-L-001','PM2D2-MULT-L-002','ECON-SP-HARD-230']
required+=TARGETS['J']
required+=['LG-Q-9119','PM2A-SRPC-LB-013','PM2B3-SRC-FB-006','PM2B3-PROD-EB-003','ECON-NL-LEGENDARYBOSS-9124','ECON-NL-IMPORTS-EXPORTS-NX-6004','LG-B-6009','PMOE-NER-BR-001','ECON-NL-EMPLOYMENT-CLASSIFICATION-6029']
pages=sorted(set([checks['question_pages'][i] for i in required]+[checks['question_pages'][i]+1 for i in required if i in checks['metadata_on_prior_page']]))
vdir=ROOT/'validation_artifacts/macroeconomics_consolidated_cleanup/visual';vdir.mkdir(exist_ok=True,parents=True)
pdf=pdfium.PdfDocument(str(path));files=[]
for n in pages:
    pg=pdf[n-1];bmp=pg.render(scale=1.4);im=bmp.to_pil();im.save(vdir/f'macro-page-{n}.png');bmp.close();pg.close()
for k in range(0,len(pages),2):
    nums=pages[k:k+2];images=[Image.open(vdir/f'macro-page-{n}.png').convert('RGB') for n in nums]
    w=max(i.width for i in images);h=max(i.height for i in images)
    sheet=Image.new('RGB',(2*w,h+35),'#dddddd');draw=ImageDraw.Draw(sheet)
    for j,(n,im) in enumerate(zip(nums,images)):
        sheet.paste(im,(j*w,35));draw.text((j*w+15,8),f'Final Macro PDF - page {n}',fill='black')
    file=vdir/f'review-{k//2+1:02d}.png';sheet.save(file);files.append(str(file.relative_to(ROOT)))
    for im in images:im.close()
pdf.close()
manifest={'pdfSHA256':sha,'requiredQuestionIDs':required,'questionPages':{i:checks['question_pages'][i] for i in required},'reviewedPages':pages,'contactSheets':files,'status':'AWAITING VISUAL INSPECTION'}
(WORK/'visual_review_pending.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
print(json.dumps({'pages':pages,'sheets':files},indent=2))
