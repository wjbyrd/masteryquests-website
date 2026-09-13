from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image,ImageDraw
import json
out=Path('validation_artifacts/free_faculty_template_parity/documents/rendered')
pop='C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin'
counts={}
for pdf in out.glob('*.pdf'):
    pages=convert_from_path(str(pdf),dpi=110,poppler_path=pop)
    counts[pdf.name]=len(pages)
    for n,page in enumerate(pages,1):page.save(out/f'{pdf.stem}-{n}.png')
    for part in range(0,len(pages),4):
        canvas=Image.new('RGB',(1300,1800),'#dddddd');draw=ImageDraw.Draw(canvas)
        for i,page in enumerate(pages[part:part+4]):
            page.thumbnail((630,855));x=(i%2)*650;y=(i//2)*900;canvas.paste(page,(x,y+25));draw.text((x+8,y+6),f'{pdf.stem} / {part+i+1}',fill='black')
        canvas.save(out/f'{pdf.stem}-contact-{part//4+1}.png')
(out/'page-counts.json').write_text(json.dumps(counts,indent=2))
print(json.dumps(counts,indent=2))
