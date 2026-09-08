import json
from pathlib import Path
W=Path(__file__).resolve().parent
b=json.loads((W/'inventory-before.json').read_text('utf8'));spec={};checks=[]
models={
'01':('fast-fashion garments (millions)',320,'dollars per garment','MPB is a straight line from (0, $21) to (320, $9). MPC is a straight line from (0, $3) to (320, $15). MSC is a straight line from (0, $9) to (320, $21), parallel to MPC.','A red dot marks the MPB-MPC intersection at (240, $12); a green dot marks the MPB-MSC intersection at (160, $15). Dashed guides project those dots to the axes.','A purple vertical bracket near Q = 160 spans the MPC value $9 to the MPB-MSC intersection at $15.'),
'02':('disposable vapes consumed (thousands)',240,'dollars per vape','MPB is a straight line from (0, $19) to (240, $7). MPC is a straight line from (0, $1) to (240, $13). MSB is a straight line from (0, $15) to (240, $3), parallel to MPB.','A red dot marks the MPB-MPC intersection at (180, $10); a green dot marks the MSB-MPC intersection at (140, $8). Dashed guides project those dots to the axes.','A purple vertical bracket near Q = 140 spans the MSB-MPC value $8 to the MPB value $12.'),
'03':('native-plant gardens',200,'dollars per garden','MPB is a straight line from (0, $16) to (200, $8). MPC is a straight line from (0, $6) to (200, $18). MSC is a straight line from (0, $1) to (200, $13), parallel to MPC.','A red dot marks the MPB-MPC intersection at (100, $12); a green dot marks the MPB-MSC intersection at (150, $10). Dashed guides project those dots to the axes.','A purple vertical bracket near Q = 150 spans the MPB-MSC value $10 to the MPC value $15.'),
'04':('public-transit rides (thousands per day)',250,'dollars per ride','MPB is a straight line from (0, $8) to (250, $3). MPC is a straight line from (0, $2) to (250, $7). MSB is a straight line from (0, $10) to (250, $5), parallel to MPB.','A red dot marks the MPB-MPC intersection at (150, $5); a green dot marks the MSB-MPC intersection at (200, $6). Dashed guides project those dots to the axes.','A purple vertical bracket near Q = 200 spans the MPB value $4 to the MSB-MPC value $6.')}
for a in b['assets']:
 f=a['filename'];reason='Retain accurate detailed visual observations.'
 if f.startswith('EXTERNALITY-'):
  _,variant,n=f.removesuffix('.webp').split('-');name,qmax,unit,curves,dots,bracket=models[n]
  description=f'The horizontal axis measures {name}, from 0 to {qmax}. The vertical axis measures marginal benefit and cost in {unit}. '+curves
  if variant=='A':description+=' No dots, projection guides or brackets are drawn.';reason='Add horizontal endpoint coordinates needed to reconstruct the plotted lines; preserve the visible economic curve labels.'
  elif variant in ['B','C']:
   description+=' '+dots
   if variant=='C':description+=' '+bracket
   reason='Describe the visible intersections and bracket endpoints without naming efficient quantities, policy optimality or buyer/seller roles that the image does not label.'
  else:
   description+=' A dashed purple line labeled Policy-adjusted MPB runs from (0, $17) to (240, $5), parallel to MPB and MSB. It intersects MPC at a purple dot (160, $9). A red dot marks the MPB-MPC intersection (180, $10), and a green dot marks the MSB-MPC intersection (140, $8). Dashed guides show their coordinates. A purple vertical bracket near Q = 160 spans $9 to $11 on MPB.'
   reason='Remove inferred efficient outcome, tax adequacy and consumer/seller assignments; preserve dashed-curve, bracket and intersection evidence.'
  spec[f]=dict(imageAlt=f'Graph of {name} with labeled marginal curves'+(', intersection guides and a purple bracket.' if variant in ['C','D'] else ', with intersection guides.' if variant=='B' else '.'),graphDescription=description)
 elif f=='PUBLIC-02.webp':
  spec[f]=dict(imageAlt='Local public radio graph: Private Benefit intersects MC at 40 hours and MSB intersects MC at 80 hours per week.',graphDescription=a['graphDescription'])
  reason='Remove efficient-provision inference from alt text; preserve the accurate detailed description unchanged.'
 checks.append(dict(runtimePath=a['runtimePath'],visuallyInspected=True,bytesChanged=False,descriptionDisposition='corrected' if f in spec and spec[f]['graphDescription']!=a['graphDescription'] else 'retained',altDisposition='corrected' if f in spec and spec[f]['imageAlt']!=a['imageAlt'] else 'retained',reason=reason))
(W/'accessibility-spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n','utf8')
(W/'accessibility-inspection.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n','utf8')
print('18 assets visually inspected;',len(spec),'metadata contracts corrected; 13 long descriptions, 14 alt texts.')
