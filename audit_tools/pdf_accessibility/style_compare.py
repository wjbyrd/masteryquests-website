"""Render immutable v1/v2 references and experimental style candidates."""
import style_restoration as s
q=s.q
from PIL import Image,ImageDraw,ImageFont
from qa_plot import FONT
POPPLER='C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'

def pilot():
    out=q.contained(s.EVIDENCE+'/pilot_comparisons');out.mkdir(parents=True,exist_ok=True)
    for code in s.PILOT+['MICRO-49']:
        domain=code.rsplit('-',1)[0];images=[]
        for version in ['v1','v2','restored']:
            pdf=q.contained(f'validation_artifacts/concept_review_owner_review/{version}/{domain}/{code}.pdf') if version!='restored' else q.contained(f'tmp/pdf_accessibility/{s.RUN}/prepared/{code}.pdf')
            if version=='restored' and code=='MICRO-49':pdf=q.contained(f'validation_artifacts/concept_review_owner_review/v2/MICRO/{code}.pdf')
            dest=out/(code+'-'+version)
            q.subprocess.run([POPPLER,'-scale-to','1400','-singlefile','-png',str(pdf),str(dest)],check=True,capture_output=True)
            images.append(Image.open(str(dest)+'.png').convert('RGB'))
        board=Image.new('RGB',(sum(im.width for im in images)+40,1440),'#ddd');d=ImageDraw.Draw(board);x=10
        for label,im in zip(['V1 visual authority','V2 content authority','Restored pilot' if code!='MICRO-49' else 'Unchanged control'],images):
            d.text((x,4),label,font=ImageFont.truetype(str(FONT),22),fill='black');board.paste(im,(x,35));x+=im.width+10
        board.save(out/(code+'-comparison.png'))
        print(code,flush=True)
if __name__=='__main__':pilot()
