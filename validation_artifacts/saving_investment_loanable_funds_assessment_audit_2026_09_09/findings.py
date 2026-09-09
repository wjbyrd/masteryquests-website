import json
from pathlib import Path
W=Path(__file__).resolve().parent
b=json.loads((W/'inventory-before.json').read_text('utf8'))
findings={
'SLF1':('G','Saving versus financial-asset purchases and current capital formation already have distinct applications; retain the adequate instructional range.',['43177','43180']),
'SLF2':('D','Saving-component arithmetic is well covered at Hard. Some behavior questions give realized changes while inferring a whole saving-supply shift; distinguish changes at a given rate.',['43187','43189']),
'SLF3':('D,F','Hard already distinguishes planned imbalance from aggregate accounting. Legendary 43205 incorrectly calls S=I an equilibrium relationship; repair realized versus planned investment and replace recall with reconciliation.',['43205','43203','43210']),
'SLF4':('F','Strong Hard disequilibrium applications exist. Upper graph variants repeat them; use actual line geometry for excess supply and reverse inference.',['43217','43219','43231']),
'SLF5':('F','Movement versus shift applications are adequate at Hard. Legendary 43245 repeats the Elite technology/rate-offset grammar; integrate a reverse behavioral calculation.',['43245','43283']),
'SLF6':('D,F','There is substantial graph coverage, including Hard 43261 separating horizontal shift from equilibrium change. Upper fiscal/graph items should make units and fixed-rate changes explicit and add reconstruction.',['43257','43259','43261']),
'SLF7':('G','Demand determinants, movement along demand, reverse shock diagnosis and partial identification are present. Existing Hard 43269/43275/43281 and upper 43273/43285 are adequate; preserve them.',['43269','43273','43285']),
'SLF8':('F','The complete deficit-to-saving-to-rate-to-investment mechanism already appears at Hard. Upper graph 43297 can deepen the distinction between the fiscal shift and final private-saving response.',['43287','43295','43297']),
'SLF9':('D,F','Hard already handles opposing rate effects and ambiguous quantity. Legendary 43309 combines unspecified dollar changes with unitless graph movements; use an explicit scale and reverse fiscal reconstruction. Hard 43317 also repeats a one-direction Medium grammar.',['43309','43317','43318']),
'SLF10':('G','Investment versus capital stock and longer-run capital formation are represented. Do not import AD-AS or advanced project valuation.',['43323','43327']),
'FB1':('F','Budget arithmetic and borrowing versus revenue are present. Upper 43069/43070 are largely missing-value arithmetic or recognition; strengthen classification and financing reconciliation.',['43069','43070']),
'FB2':('F','Hard stock/flow and financing-adjustment distinctions are sound. Upper dimensional critique can use a real multi-period financing reconciliation without changing scope.',['43083','43087']),
'FB3':('D','43098 leaves net-tax and interest conventions implicit, so its reconciliation is incomplete. Define gross receipts, transfers, purchases and interest explicitly.',['43096','43098']),
'FB4':('F','Purchases/transfers and budget categories are covered. Upper 43111 is category recall; distinguish budget growth from current-purchase growth using classified outlays.',['43107','43111']),
'FB5':('G','Treasury measure definitions, decomposition and comparison boundaries are covered. Preserve useful measure distinctions despite some direct upper items.',['43118','43119','43120']),
'FB6':('F','Hard ratio calculations and simultaneous numerator/denominator changes are solid. Several Legendary records only subtract ratios; strengthen reverse growth and deficit/ratio reconciliation, with explicit financing assumptions.',['43130','43134','43135','43137']),
'FB7':('D,F','Basic interest arithmetic and budget feedback exist. Elite 43145 states only that one rate is a simplification; use an explicitly simplified refinancing portfolio and the resulting budget effect.',['43142','43144','43145']),
'FB8':('F','Persistent-deficit mechanism is covered. Upper 43156/43158 give broad conditional claims without a substantive constraint; use policy offsets and competing capital-formation evidence.',['43154','43156','43158']),
'FB9':('F','Source/date/status discipline is represented. 43167 simply repeats the two given projected ratios; strengthen what ratios identify and do not identify. 43162 has a moving last-updated claim that should be removed.',['43162','43166','43167'])}
out=[]
for c,m in b['views'].items():
 for obj in b['byConcept'][c]['objectives']:
  codes,reason,ids=findings[obj]
  rows=[(i,q) for i,q in b['records'].items() if q['primaryConceptId']==c and q['objective']==obj]
  out.append({'concept':c,'objective':obj,'label':m['objectiveLabels'].get(obj,obj),'count':len(rows),'classifications':codes.split(','),'finding':reason,'evidenceIds':ids,'coverageGap':False,'systemicCalibrationGap':False,'graphUseGap':False,'beforeAuthoring':True})
(W/'objective-findings-before.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n','utf8')
lines=['# Objective findings recorded before content authoring','','No materially absent selected objective (A), systemic concentration of ordinary application above Hard (C), or missing meaningful graph-use coverage (E) was found. G does not assert every item is ideal. B/D/F are targeted depth or precision concerns; no revision quota applies.','']
for x in out:lines += [f"## {x['objective']} — {x['label']}",f"{x['count']} records; {', '.join(x['classifications'])}. {x['finding']} Evidence: {', '.join(x['evidenceIds'])}.",'']
lines+=['## Graph contracts','All eight existing images were visually inspected. Retain image bytes. LOANABLE-06 describes the economic crowding-out conclusion; LOANABLE-08 performs the quantity-change subtraction. Remove those conclusions. Supply/investment parenthetical labels are visible only on LOANABLE-01; elsewhere describe the actual S0/S1/D0/D1 labels. Supply all visible axes, straight-line endpoints, labeled intersections and guides needed to reconstruct numeric evidence. No bad path was observed; verify generated rendering before declaring zero path defects.']
(W/'OBJECTIVE_FINDINGS_BEFORE.md').write_text('\n'.join(lines)+'\n','utf8')
print('19 objective findings written before revisions.')
