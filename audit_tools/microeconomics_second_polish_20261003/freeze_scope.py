"""Freeze the bounded A/B/C review before changing canonical content."""
import json
from pathlib import Path
H=Path(__file__).resolve().parent
read=lambda n:json.loads((H/n).read_text(encoding='utf8'))
groups=read('duplicate_groups.json');graph=read('prior_graph_reviews.json')
clusters=[['42203','42204','42207'],['42344','42352','42360'],['42358','42361','42363'],['ECON-MG-LEGENDARY-9057','ECON-MG-MEDIUM-186','ECON-MG-MEDIUM-189'],['P62B-ELAS-B2-020','P62B-ELAS-EL-038','P62B-ELAS-M-039'],['P62C-CPS-L-020','P62C-CPS-L-024','P62C-CPS-M-029'],['P62E-COP-B2-034','P62E-COP-H-019','P62E-COP-L-053','P62E-COP-M-024'],['P62E-COP-B2-035','P62E-COP-H-018','P62E-COP-L-054'],['P62F-PC-B3-056','P62F-PC-EL-038','P62F-PC-H-042','P62F-PC-L-097'],['P62F-PC-B3-058','P62F-PC-EL-044','P62F-PC-M-048']]
A={i:'Same substantive task in '+g['group']+'; retain a representative and differentiate only where concept, skill and tier permit.' for g in groups for i in g['ids']}
B={i:'Identical four-choice set recurs within this reviewed family: '+', '.join(c)+'. Diversify the repeated distractor errors.' for c in clusters for i in c[1:]}
B.update({i:'Four Hard externality items reuse the same policy-amount by internalize/ignore-effect matrix. Diversify errors without weakening the marginal-external-effect construct.' for i in ['42028','42038','42048','42058']})
B.update({i:'Repeated entry-to-zero-profit family pairs two readings with the same cost-minimization misconception.' for i in ['P62H-MCMP-H-016','P62H-MCMP-EL-023','P62H-MCMP-L-094']})
B.update({i:'Profit-maximization family repeatedly crosses MR=MC versus D=MC with two output-price readings.' for i in ['P62G-MON-H-032','P62G-MON-H-036']})
C={'42204':'Easy shared-quantity diagnosis acquired multiple benefit readings and unit conversions.', '42376':'Easy wage reading originally supplied employment; cleanup added selecting employment from MFC=MRP.', '42587':'Medium convexity interpretation acquired two average-MRS calculations from three coordinates.', '42588':'Easy ordinal-label interpretation acquired two coordinate-band readings.', 'P62B-ELAS-E-028':'Easy slope-versus-elasticity distinction acquired two midpoint-elasticity calculations.'}
assert len(A)==90 and len(graph)==356 and set(B)|set(C)<=set(graph)
records={i:{'categories':[k for k,s in [('A',A),('B',B),('C',C)] if i in s], 'reasons':[s[i] for s in [A,B,C] if i in s]} for i in sorted(set(A)|set(B)|set(C))}
scope={'baseline':read('baseline.json'),'frozen_before_canonical_edit':True,'set_A':A,'set_B':B,'set_C':C,'unique_union':sorted(records),'records':records,'duplicate_groups':groups,'graph_clusters':clusters,'graph_review_population':sorted(graph), 'graph_review_dispositions':{i:{'pattern':'candidate' if i in B else 'retained: no high-confidence mechanical architecture problem; a valid evidence/interpretation distinction remains useful', 'difficulty':'candidate' if i in C else 'retained: no clear load drift attributable to the approved cleanup', 'construct':g['original_construct']} for i,g in graph.items()}}
(H/'scope.json').write_text(json.dumps(scope,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print({k:len(v) for k,v in [('A',A),('B',B),('C',C),('union',records)]})
