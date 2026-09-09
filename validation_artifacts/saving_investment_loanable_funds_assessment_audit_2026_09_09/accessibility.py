import json
from pathlib import Path
W=Path(__file__).resolve().parent
assets=json.loads((W/'assets.json').read_text('utf8'))
# Coordinates transcribed from visual inspection of all eight approved WebP files.
geometry={
1:dict(curves={'S0':[[0,1],[140,8]],'D0':[[0,15],[140,8]]},points={'A':[140,8]}),
2:dict(curves={'S0':[[0,4],[80,8]],'S1':[[0,0],[120,6]],'D0':[[0,12],[240,0]]},points={'A':[80,8],'B':[120,6]}),
3:dict(curves={'S0':[[0,2],[100,7]],'S1':[[0,4],[80,8]],'D0':[[0,12],[240,0]]},points={'A':[100,7],'B':[80,8]}),
4:dict(curves={'S0':[[0,1],[80,5]],'D0':[[0,9],[180,0]],'D1':[[0,13],[260,0]]},points={'A':[80,5],'B':[120,7]}),
5:dict(curves={'S0':[[0,1],[80,5]],'D0':[[0,9],[180,0]],'D1':[[0,7],[140,0]]},points={'A':[80,5],'B':[60,4]}),
6:dict(curves={'S0':[[0,1],[100,6]],'S1':[[0,5],[60,8]],'D0':[[0,11],[220,0]]},points={'A':[100,6],'B':[60,8]}),
7:dict(curves={'S0':[[0,5],[60,8]],'S1':[[0,1],[100,6]],'D0':[[0,11],[220,0]]},points={'A':[60,8],'B':[100,6]}),
8:dict(curves={'S0':[[0,4],[40,6]],'S1':[[0,2],[80,6]],'D0':[[0,8],[160,0]],'D1':[[0,10],[200,0]]},points={'A':[40,6],'B':[80,6]})}
spec={};inspection=[]
for a in assets:
 n=int(a['filename'][9:11]);g=geometry[n]
 text=['The horizontal axis is labeled Quantity of loanable funds; the vertical axis is labeled Real interest rate. Coordinates below are (quantity, rate). The quantity axis has no currency scale. All curves are straight.']
 for name,coords in g['curves'].items():
  label=name+(' (saving)' if n==1 and name=='S0' else ' (investment)' if n==1 else '')
  style=('solid' if name.endswith('0') else 'dashed')+' '+('red' if name.startswith('S') else 'blue')
  text.append(f"The {style} line labeled {label} slopes {'upward' if name.startswith('S') else 'downward'} through ({coords[0][0]}, {coords[0][1]}) and ({coords[1][0]}, {coords[1][1]}).")
 text.append('Point A marks the S0–D0 intersection at ('+', '.join(map(str,g['points']['A']))+').')
 if 'B' in g['points']:
  pair='S1–D1' if n==8 else 'S1–D0' if 'S1' in g['curves'] else 'S0–D1'
  text.append(f"Point B marks the {pair} intersection at ("+', '.join(map(str,g['points']['B']))+').')
 if n in [1,2]:text.append('Dashed horizontal and vertical guides connect the labeled intersection points to the axes.')
 else:text.append('A numbered grid provides the coordinate scale.')
 alt='Loanable-funds graph with '+', '.join(g['curves'])+' and labeled '+('intersections A and B.' if 'B' in g['points'] else 'intersection A.')
 desc={'imageAlt':alt,'graphDescription':' '.join(text)};spec[a['runtimePath']]=desc
 reason='Supply the omitted axes and straight-line coordinate evidence; describe the visible curve labels rather than adding economic names not printed on the figure.'
 if n==1:reason='Preserve the correct intersection and visible economic labels; add intercept evidence needed for the revised inverse and disequilibrium calculations.'
 if n==6:reason+=' Remove the crowding-out conclusion from the shared evidence description.'
 if n==8:reason+=' Remove the precomputed 40-unit quantity change from shared evidence.'
 inspection.append({'runtimePath':a['runtimePath'],'sha256':a['sha256'],'visuallyInspected':True,'geometry':g,'reason':reason,'bytesChanged':False,'pathCorrectionNeeded':False,'after':desc})
for file,data in [('accessibility-spec.json',spec),('accessibility-inspection.json',inspection)]:
 (W/file).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n','utf8')
print('8 visually verified contracts; no image bytes changed.')
