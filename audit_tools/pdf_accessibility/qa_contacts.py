"""Read-only candidate render contact sheets; never writes PDF bytes."""
import qa_remediation as q
from PIL import Image,ImageDraw,ImageFont
from qa_plot import FONT
def main():
    out=q.contained(q.EVIDENCE+'/contacts');out.mkdir(exist_ok=True)
    for path in q.contained(q.EVIDENCE+'/batches').glob('*/checkpoint.json'):
        batch=q.read_json(path)
        if not batch.get('complete'):continue
        rows=batch['records']
        for start in range(0,len(rows),4):
            canvas=Image.new('RGB',(1660,2230),'#dddddd');d=ImageDraw.Draw(canvas)
            for i,r in enumerate(rows[start:start+4]):
                p=q.contained(r['validation']['validatorReport']).parent/'rendered_after'/(r['code']+'.png')
                im=Image.open(p).convert('RGB');im.thumbnail((810,1060))
                x=10+i%2*830;y=40+i//2*1115
                canvas.paste(im,(x,y));d.text((x,y-34),r['code'],font=ImageFont.truetype(str(FONT),24),fill='black')
            dest=out/(batch['batch']+'-'+str(start//4+1)+'.png');canvas.save(dest)
            print(dest.relative_to(q.EXPECTED_ROOT))
if __name__=='__main__':main()
