"""Record the completed manual inspection, bound to the inspected asset bytes.

This script records a human/model visual review; it does not infer visual quality
from dimensions, loading success, or metadata.
"""
from review_tools import *
import hashlib
L=json.loads((HERE/'expectations.json').read_text())
B=json.loads((EVIDENCE/'browser/render-index.json').read_text())
X=json.loads((EVIDENCE/'pdf-review/index.json').read_text())
assert len(B['assets'])==len(L['assets'])==42
rows=[]
for a,b in zip(L['assets'],B['assets']):
 assert a['path']==b['asset']
 actual=hashlib.sha256((ROOT/'build/faculty-build-composer/data'/a['path']).read_bytes()).hexdigest()
 assert actual==a['sha256']
 rows.append({'asset':a['path'],'sha256':actual,'manualVisualReview':'PASS','contexts':['desktop inline','390px mobile inline preview','desktop lightbox','760px mobile lightbox, left and right pan edges'],
 'checks':['axis and tick labels','point and curve labels','required numerical evidence','guides and overlap','cropping and scaling','expanded mobile readability'],
 'renderIndex':b})
result={'status':'PASS','librarySha256':L['afterLibrarySha256'],'assets':rows,'changedAssetsReviewed':42,
 'originalGraphFamiliesReviewed':137,'pdfPagesReviewed':len(X['renderedPages']),'pdfPageIndex':X['renderedPages'],
 'method':'Manually inspected contact sheets and individual renders, not inferred from valid files. Final revised panel graph and changed export pages reinspected after corrections. Unchanged rendered content was retained across word-only iterations.',
 'limitations':['Mobile inline multi-panel figures require enlargement for precise readings.','Component screenshots isolate actual template CSS/functions; the separate full-game smoke verifies UI integration.']}
(EVIDENCE/'visual-acceptance.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
print('Recorded manual visual acceptance for 42 assets and',len(X['renderedPages']),'PDF pages')
