from pathlib import Path
from PIL import Image
import numpy as np,json,colorsys
r=Path.cwd();stage=r/'tmp/pdf_accessibility/full_batch_v1';rows=[]
for p in sorted((stage/'graphs').glob('*.png')):
 a=np.array(Image.open(p).convert('RGB')); pix=a.reshape(-1,3).astype(float)/255; mx=pix.max(1);mn=pix.min(1);sat=mx-mn
 # Significant orange/bright-green curves found during visual inspection.
 masks={'orange':(pix[:,0]>.75)&(pix[:,1]>.3)&(pix[:,1]<.75)&(pix[:,2]<.25),'bright_green':(pix[:,1]>.55)&(pix[:,0]<.5)&(pix[:,2]<.65)&(sat>.3)}
 metrics=[]
 for name,mask in masks.items():
  selected=pix[mask]
  if len(selected)<150:continue
  lin=np.where(selected<=.04045,selected/12.92,((selected+.055)/1.055)**2.4);lum=lin@np.array([.2126,.7152,.0722]);ratios=1.05/(lum+.05)
  metrics.append({'colorFamily':name,'pixels':len(selected),'contrastP10':float(np.quantile(ratios,.1)),'contrastMedian':float(np.median(ratios)),'contrastP90':float(np.quantile(ratios,.9))})
 if metrics:
  print(p.stem,[(m['colorFamily'],round(m['contrastMedian'],3),round(m['contrastP90'],3)) for m in metrics],flush=True)
 rows.append({'code':p.stem,'measurements':metrics,'note':'Color-family sample is diagnostic, not an automatic conformance decision. Core stroke and actual adjacent background require visual review.'})
(r/'validation_artifacts/pdf_accessibility/full_batch_v1/graph_color_review_samples.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
