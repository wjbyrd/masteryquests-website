from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json
stage=Path('tmp/pdf_accessibility/full_batch_v1');rows=[];crops=[]
for p in sorted((stage/'graphs').glob('*.png')):
 im=Image.open(p).convert('RGB');a=np.asarray(im).astype('int16');h,w=a.shape[:2];mask=(a.max(2)-a.min(2)>70)&(a.min(2)<170);todo=set(np.flatnonzero(mask));found=[]
 while todo:
  seed=todo.pop();q=[seed];component=[seed]
  while q:
   v=q.pop();y,x=divmod(v,w)
   for yy,xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
    if yy<0 or yy>=h or xx<0 or xx>=w:continue
    n=yy*w+xx
    if n in todo:todo.remove(n);q.append(n);component.append(n)
  ys=np.array(component)//w;xs=np.array(component)%w;box=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
  if not(7<=box[3]-box[1]<=60 and 3<=box[2]-box[0]<=60 and len(component)>=18):continue
  rgb=a[ys,xs]/255;lin=np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4);rat=1.05/(lin@np.array([.2126,.7152,.0722])+.05);core=float(np.percentile(rat,95))
  if core<4.5:found.append({'box':box,'coreContrastP95':core,'pixels':len(component)})
 rows.append({'code':p.stem,'suspectComponents':found,'classification':'DIAGNOSTIC_REQUIRES_VISUAL_TEXT_IDENTIFICATION'})
 if found:
  annotated=im.copy();d=ImageDraw.Draw(annotated)
  for f in found:d.rectangle(f['box'],outline='magenta',width=2)
  annotated.thumbnail((610,425));crops.append((p.stem,annotated,len(found)))
for start in range(0,len(crops),6):
 sheet=Image.new('RGB',(1260,1410),'white');d=ImageDraw.Draw(sheet)
 for i,(code,im,count) in enumerate(crops[start:start+6]):
  x=i%2*630;y=i//2*470;d.text((x+5,y+5),code+' suspect text components '+str(count),fill='black',font_size=20);sheet.paste(im,(x,y+35))
 sheet.save(stage/f'contrast-labels-{start//6+1}.png')
Path('validation_artifacts/pdf_accessibility/full_batch_v1/label_contrast_diagnostics.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
print('suspect docs',len(crops),[c for c,_,_ in crops])
