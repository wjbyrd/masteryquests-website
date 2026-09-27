import json,hashlib
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[2];WORK=ROOT/'tmp/macroeconomics_exception_closure'
checks=json.loads((WORK/'export_checks.json').read_text());required=json.loads((Path(__file__).parent/'inputs/baseline.json').read_text())['targets']
pdfpath=ROOT/'faculty_exports/macroeconomics_question_bank.pdf';digest=hashlib.sha256(pdfpath.read_bytes()).hexdigest();assert checks['pdfSHA256']==digest
pages=sorted(set([checks['question_pages'][id] for id in required]+[checks['question_pages'][id]+1 for id in required if id in checks['metadata_on_prior_page']]))
directory=ROOT/'validation_artifacts/macroeconomics_exception_closure/visual';directory.mkdir(parents=True,exist_ok=True)
pdf=pdfium.PdfDocument(str(pdfpath));sheets=[]
for n in pages:
    page=pdf[n-1];bitmap=page.render(scale=1.5);im=bitmap.to_pil();im.save(directory/f'page-{n}.png');bitmap.close();page.close()
for k in range(0,len(pages),2):
    nums=pages[k:k+2];images=[Image.open(directory/f'page-{n}.png').convert('RGB') for n in nums];width=max(im.width for im in images);height=max(im.height for im in images)
    sheet=Image.new('RGB',(2*width,height+35),'#dddddd');draw=ImageDraw.Draw(sheet)
    for j,(n,im) in enumerate(zip(nums,images)):
        sheet.paste(im,(j*width,35));draw.text((j*width+15,8),f'Macro exception closure - page {n}',fill='black')
    path=directory/f'review-{k//2+1:02d}.png';sheet.save(path);sheets.append(str(path.relative_to(ROOT)))
    for im in images:im.close()
pdf.close()
manifest={'pdfSHA256':digest,'requiredIDs':required,'questionPages':{id:checks['question_pages'][id] for id in required},'reviewedPages':pages,'contactSheets':sheets,'status':'AWAITING VISUAL INSPECTION'}
(WORK/'visual_review.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');print(json.dumps({'targetIDs':len(required),'pages':len(pages),'sheets':len(sheets),'pageNumbers':pages},indent=2))
