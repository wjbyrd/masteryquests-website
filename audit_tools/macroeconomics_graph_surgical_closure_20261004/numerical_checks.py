"""Independent area checks from graph lines, plus alternative accounting checks."""
from pathlib import Path
from fractions import Fraction as F
import json,re

ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).parent;WORK=ROOT/'tmp'/HERE.name
patches=json.loads((HERE/'patches.json').read_text(encoding='utf-8'))
results={}
# From plotted intercepts: inverse demand P=14-Q/25 in both figures.
# Inverse supply P=2+Q/25 for tariff, P=Q/25 for quota.
# All Q are thousands; area results are thousands of dollars.
for id,pw,pp,supply_intercept in [('P62D-ITP-L-095',4,6,2),('P62D-ITP-L-098',3,6,0)]:
    demand=lambda p:25*(14-p)
    supply=lambda p:25*(p-supply_intercept)
    cs=lambda p:F((14-p)*demand(p),2)
    ps=lambda p:F((p-supply_intercept)*supply(p),2)
    loss=cs(pw)-cs(pp);gain=ps(pp)-ps(pw)
    receipts=(pp-pw)*(demand(pp)-supply(pp))
    net=loss-gain-receipts
    production_triangle=F((pp-pw)*(supply(pp)-supply(pw)),2)
    consumption_triangle=F((pp-pw)*(demand(pw)-demand(pp)),2)
    assert net==production_triangle+consumption_triangle>0
    expected=(loss,gain,receipts,net)
    choices=[]
    for i,o in enumerate(patches[id]['options']):
        values=tuple(F(x) for x in re.findall(r'\$([\d.]+)k',o))
        assert len(values)==4 and all(v>0 for v in values)
        assert values[0]-values[1]-values[2]==values[3]
        choices.append({'letter':'ABCD'[i],'values_thousand_dollars':list(map(float,values)),'welfare_identity':True,'matches_graph':values==expected})
    assert [c['letter'] for c in choices if c['matches_graph']]==['A']
    results[id]={'status':'PASS','method':'Subtract original and post-policy surplus triangles using plotted inverse demand and supply lines; cross-check the two distortion triangles.',
        'consumer_loss':float(loss),'producer_gain':float(gain),'revenue_or_domestic_rents':float(receipts),'welfare_loss':float(net),
        'production_distortion':float(production_triangle),'consumption_distortion':float(consumption_triangle),'choices':choices}
results['ECON-SP-ELITE-320']={
 'status':'PASS','exact_condition':'Y2 < Y3 - C < Y3 if and only if 0 < C < Y3 - Y2',
 'graph_reading':'The drawn Y1-to-Y2 and Y2-to-Y3 widths are approximately equal; (Y3-Y2)/(Y3-Y1) is approximately 1/2. No absolute output values or exact numerical multiplier are asserted.',
 'boundary_checks':['C=0 leaves demand at AD3, excluded.','C=Y3-Y2 leaves demand at AD2, excluded.','0<C<Y3-Y2 leaves a positive but reduced induced gain.','Y3-Y2<C<Y3-Y1 retains positive overall stimulus but fails the required region.'],
 'coordinate_only_counterexample':'A and B have the same graphical bound, but B incorrectly claims that positive crowding out leaves all induced spending intact.',
 'theory_only_counterexample':'A and C use the same economic criterion with different fractions. Without the graph, the induced fraction of the total expansion is unknown.'}
# Boundary checks in units normalized to the graph's approximately equal widths.
for c,inside in [(F(0),False),(F(1,2),True),(F(1),False),(F(3,2),False),(F(2),False)]:
    assert (1<2-c<2)==inside
for id,p in patches.items():
    assert len(p['options'])==len(set(p['options']))==4 and p['correct_index']==0
(WORK/'numerical_checks.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
print(json.dumps(results,indent=2))
