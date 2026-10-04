import json
from pathlib import Path
p=Path(__file__).parent;n=json.loads((p/'review_notes.json').read_text())
def a(ids,why):
 for i in ids.split():n['advanced_candidates'][i]=why
a('P52A-AD-EL-001 P52A-AD-L-001 P52A-AD-L-003 P52A-AD-LB-001','Bundles routine component directions or shift/movement classifications; no reconciliation is demanded. Upgrade by using an observed net outcome to infer the dominant channel and an informative counterfactual, retaining all original determinants.')
a('P52B-S4-IEA-EL-002 P52A-AD-L-004 P52A-AD-L-006 P52A-AD-EL-003','Identifying opposite AD pressures yields the stock answer ambiguous; no evidence constrains the competing mechanisms. Require reverse inference or evaluate a conditional policy claim with a meaningful bound, not added arithmetic.')
a('P52A-AD-LB-003','Repeats the easy/medium two-way shift-versus-movement classification with only a larger unused spending amount. Preserve that distinction but introduce a counterfactual that explains why observed spending can move differently from the AD schedule.')
a('LG-Q-307 LG-Q-313','Difficulty is percentage/subtraction arithmetic on assets and capital. Retain leverage/solvency but require choosing between a liquidity remedy and a capital remedy, or infer a loss threshold from an observed capital constraint.')
a('LG-Q-326','Single-step reserve-shortfall remedy recognition with three conceptually untenable choices. Retain reserve management but require comparing feasible balance-sheet actions under a stated settlement/capital constraint.')
n['wording_candidates']['ECON-SP-CALCULATE-REQUIRED-RESERVES-6004']='Recommended: $8,000 deposits and $1,200 reserves omit in; use ordinary balance-sheet prose.'
n['wording_candidates']['LG-B-6003']='Recommended: $900,000 deposits and $100,000 reserves omit in; use ordinary balance-sheet prose.'
n['remaining_packets_reviewed']=[1,2]
(p/'review_notes.json').write_text(json.dumps(n,indent=2),encoding='utf8')
