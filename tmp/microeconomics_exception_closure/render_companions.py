from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image
w=Path(__file__).resolve().parent
root=w.parents[1]
images=[]
for name in ['general_economics','macroeconomics']:
    doc=pdfium.PdfDocument(root/'faculty_exports'/f'{name}_question_bank.pdf')
    page=doc[0]
    im=page.render(scale=1.5).to_pil().convert('RGB')
    images.append(im)
    page.close()
    doc.close()
sheet=Image.new('RGB',(sum(im.width for im in images),max(im.height for im in images)),'white')
offset=0
for im in images:
    sheet.paste(im,(offset,0))
    offset+=im.width
sheet.save(w/'companion_covers.png')
