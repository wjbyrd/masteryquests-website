from pathlib import Path
from PIL import Image
from collections import Counter
import json
r=Path.cwd();stage=r/'tmp/pdf_accessibility/full_batch_v1';rows=[]
def ratio(rgb):
 c=[v/255 for v in rgb];c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c];return 1.05/(.2126*c[0]+.7152*c[1]+.0722*c[2]+.05)
for p in sorted((stage/'graphs').glob('*.png')):
 counts=Counter(Image.open(p).convert('RGB').get_flattened_data());colors=[{'rgb':list(rgb),'hex':'#%02X%02X%02X'%rgb,'count':count,'whiteContrast':ratio(rgb)} for rgb,count in counts.most_common(150) if max(rgb)-min(rgb)>80 and count>=150]
 low=[c for c in colors if c['whiteContrast']<3]
 rows.append({'code':p.stem,'dominantColors':colors,'below3':low})
 if low:print(p.stem,[(c['hex'],round(c['whiteContrast'],3),c['count']) for c in low[:4]])
(r/'validation_artifacts/pdf_accessibility/full_batch_v1/graph_contrast_measurements.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
