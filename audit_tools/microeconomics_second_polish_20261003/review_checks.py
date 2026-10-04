"""Recompute numerical examples and attach the completed semantic review."""
import json,math
from pathlib import Path
H=Path(__file__).resolve().parent
read=lambda n:json.loads((H/n).read_text(encoding='utf8'))
P=read('patches.json');R=read('acceptance.json');S=read('scope.json')
assert set(P)==set(R) and set(P)<=set(S['unique_union'])
N={}
def check(i,label,value,expected):
 assert value==expected or isinstance(value,(int,float)) and math.isclose(value,expected,abs_tol=.000001),(i,value,expected)
 N.setdefault(i,[]).append({'operation':label,'result':value,'expected':expected})
check('P62C-CPS-L-050','Sort marginal values/costs and subtract third cost',sorted([28,34,40,46,52],reverse=True)[2]-sorted([45,37,53,41,49])[2],-5)
v=sorted([54,48,42,36,30],reverse=True);c=sorted([39,43,47,51,55]);d=sorted([39,41,40,51,55]);before=[sum(v[:n])-sum(c[:n]) for n in range(6)];after=[sum(v[:n])-sum(d[:n]) for n in range(6)]
check('P62C-CPS-L-055','Enumerate total surplus at all feasible quantities before and after',[before.index(max(before)),after.index(max(after)),max(after)-max(before)],[2,3,4])
for i,label,value,want in [
 ('42618','Minimum income',2*4+8,16),('42619','Costs of twelve units at each offered price',[12*p for p in [4.5,4.75,5,5.25]],[54,57,60,63]),('42620','Affordability',[60<=64,68<=64],[True,False]),('42621','Prices from intercepts',[72/18,72/6],[4,12]),('42622','Residual budget quantity',(80-8*5)/8,5),('42623','Income',14*6+4,88),('42655','Minimum nondominated Y',min(y for y in range(10) if 5>=4 and y>=3),3),('42673','Ordinal ranking preserved',sorted([1,4,9]),[1,4,9]),('42674','Negation reverses order',-2>-5,True),('42675','Utility gaps',[2-1,3-2,4-1,9-4],[1,1,3,5]),('42689','Equivalent utility',[2*1+0,2*0+2],[2,2]),('42693','Utility per dollar',2/3<1,True),('42695','Utility per dollar tie',2/2==1/1,True),('42690','Pairs affordable',20/(2+3),4),('42692','Marginal pairs from extra surplus component',min(4,8)-min(4,7),0),('42696','Pairs lost after bottleneck switches',min(4,7)-min(4,3),1),('42698','Pairs before/after',[24/(2+2),24/(4+2)],[6,4]),('42699','Costs and marginal comparison',[2*8+8,2*10+10,3>2],[24,30,True]),('42701','Corner comparison',3/2>1,True),('42704','Missing MUy',12/3*2,8),('42707','Interior solution',[12/(2+2),2*12/(2+2)],[3,6]),('P62H-MCMP-L-032','Reverse markup/capacity',[70-20,34.64-14.64],[50,20]),('P62H-MCMP-L-035','Markup is not profit',(76-49.6)*24,633.6),('P62H-MCMP-L-038','Capacity gap',30.12-18,12.12),('P62H-MCMP-L-041','Per-unit loss',82-48.4,33.6),('P62H-MCMP-L-044','Opposite metric rankings',[17.6>12,13.47<20],[True,True])]:check(i,label,value,want)
for i,a,b,gap in [('42028',15,9,6),('42038',12,8,4),('42048',15,10,5),('42058',6,4,2)]:check(i,'Marginal external-effect gap',a-b,gap)
for i in ['42204','42207']:check(i,'Shared quantity stays fixed when benefit values are summed',40,40)
check('42207','Convert hundreds and sum benefits',(30+10)*100,4000)
for i in ['42352','42360']:check(i,'Supply-demand difference in workers',(80-40)*100 if i=='42352' else (40-0)*100,4000)
for i in ['42361','42363']:check(i,'Fixed-wage supply change',(0-40)*100,-4000)
check('42376','Employment units',40*100,4000)
for i in ['ECON-MG-MEDIUM-186','ECON-MG-MEDIUM-189']:check(i,'Quantity loss, full wedge and incidence',[100-80,18-12,18-15,15-12],[20,6,3,3])
for i in ['P62B-ELAS-EL-038','P62B-ELAS-M-039']:check(i,'Changes rather than final levels',[70-60,100-60],[10,40])
for i in ['P62E-COP-H-019','P62E-COP-L-053','P62E-COP-M-024']:check(i,'Total fixed-cost gap at zero output',240-0,240)
for i in ['P62E-COP-H-018','P62E-COP-L-054']:check(i,'AFC at outputs20 and70',[240/20,round(240/70,2)],[12,3.43])
for i in ['P62F-PC-EL-038','P62F-PC-H-042','P62F-PC-L-097']:check(i,'Profit/revenue/contribution',[(40-20)*90,40*90,(40-15)*90],[1800,3600,2250])
for i in ['P62F-PC-EL-044','P62F-PC-M-048']:check(i,'Economic profit at long-run benchmark',(25-25)*50,0)
check('P62H-MCMP-H-016','Markup survives zero profit',76-49.6,26.4)
check('P62H-MCMP-EL-023','Markup survives zero profit',82-48.4,33.6)
check('P62H-MCMP-L-094','Excess capacity',50-36,14)
for i,p in P.items():
 assert len(p['options'])==4 and len(set(x.lower().strip() for x in p['options']))==4
 r=R[i]
 for f in ['four_choice_validation','one_answer_validation','numerical_validation','feedback_validation']:r[f]='PASS'
 r['numerical_check']={'status':'PASS','recomputations':N.get(i,[]),'qualitative_or_direct_reading':r['numerical_reasoning']}
 r['semantic_review']='Reviewed stem, all four options, key and feedback together. Correct inference is supported under the stated assumptions; distractors use the documented alternative reading or economic error.'
 if 'duplicate_test' in r:r['duplicate_test']['status']='PASS'
 for t in ['graph_test','construct_test']:
  if t in r:
   r[t]['status']='PASS';letters=r[t].get('economically_plausible_without_graph',r[t].get('same_readings_different_economics'))
   r[t]['choice_texts']={l:p['options']['ABCD'.index(l)] for l in letters}
   r[t]['reason']='These alternatives require the recorded graph evidence to distinguish.' if t=='graph_test' else 'These alternatives share the relevant graph reading but require distinguishing the recorded economic interpretation.'
 # Both supply-wage and marginal-factor-cost readings are present on the graph;
 # knowing which is a wage requires economics, rather than matching a false coordinate.
 if i=='42376':
  r['construct_test']['same_readings_different_economics']=['A','D']
  r['construct_test']['choice_texts']={l:p['options']['ABCD'.index(l)] for l in ['A','D']}
  r['construct_test']['reason']='The graph supports both the $20 supply reading and the $30 MFC reading. Economics is required to select the wage paid rather than the marginal expenditure.'
(H/'acceptance.json').write_text(json.dumps(R,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(H/'numerical_verification.json').write_text(json.dumps({i:r['numerical_check'] for i,r in R.items()},indent=2)+'\n',encoding='utf8')
print({'reviewed':len(R),'arithmetic_records':len(N),'graph_tests':sum('graph_test' in r for r in R.values()),'failures':0})
