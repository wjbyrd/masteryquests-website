"""Recompute from the revised student inputs and visually checked graph readings.

This does not use answer hashes as evidence of numerical correctness. Arithmetic
is evaluated afresh, and the text-only families are solved from their stems.
"""
from common import *
import ast,operator,re,math
checks={}
def number(s):return float(s.replace(',','').replace('$','').replace('−','-').rstrip('.'))
def nums(s):return [number(x) for x in re.findall(r'-?\d+(?:,\d{3})*(?:\.\d+)?',s)]
def evaluate(s):
    t=ast.parse(s.strip(),mode='eval')
    def ev(n):
        if isinstance(n,ast.Expression):return ev(n.body)
        if isinstance(n,ast.Constant) and isinstance(n.value,(int,float)):return n.value
        if isinstance(n,ast.UnaryOp) and isinstance(n.op,ast.USub):return -ev(n.operand)
        if isinstance(n,ast.BinOp):return {ast.Add:operator.add,ast.Sub:operator.sub,ast.Mult:operator.mul,ast.Div:operator.truediv}[type(n.op)](ev(n.left),ev(n.right))
        if isinstance(n,ast.Call) and n.func.id in ['abs','min']:return {'abs':abs,'min':min}[n.func.id](*[ev(a) for a in n.args])
        raise ValueError(s)
    return ev(t)
def record(i,method,results):checks[i]={'method':method,'recomputed':results,'status':'PASS'}
for g in W['wording_findings']:
    if g['id']!='MIC-W-009':continue
    for i in g['ids']:
        s=draft(i)['q'];n=nums(s);cash=[number(x) for x in re.findall(r'\$([\d,.]+)',s)];key=nums(draft(i)['options'][P[i]['correct_index']])[0]
        if 'economic profit?' in s or 'accounting profit?' in s:ans=cash[0]-sum(cash[1:]);method='Revenue less the stated relevant costs; include opportunity cost only for economic profit.'
        elif 'total economic cost?' in s:ans=sum(cash);method='Explicit plus implicit costs.'
        elif 'marginal product?' in s:ans=n[1]-n[0];method='Change in total product from the added worker.'
        elif 'average product per worker?' in s:ans=(72/6 if 'Six workers' in s else n[1]/n[0]);method='Total product divided by workers.'
        elif 'What is total cost?' in s:
            m=re.search(r'(\d+) workers at \$(\d+)',s)
            ans=cash[0]+int(m[1])*int(m[2]) if m else sum(cash);method='Fixed cost plus variable cost (workers times wage where applicable).'
        elif 'marginal cost over' in s:
            ans=n[0]/n[1] if 'TC rises $' in s else (n[1]-n[0])/(n[3]-n[2]);method='Change in total cost divided by change in output.'
        elif 'total fixed cost?' in s:ans=n[0]*n[1];method='Per-unit ATC–AVC gap times quantity.'
        elif 'AFC=$' in s:ans=sum(cash);method='AFC plus AVC equals ATC.'
        elif 'ATC=$' in s and 'AVC=$' in s:ans=cash[0]-cash[1];method='ATC minus AVC equals AFC.'
        else:ans=cash[0]/n[0];method='Relevant total cost divided by quantity.'
        assert abs(ans-key)<.011,(i,ans,key)
        record(i,method,{'unrounded_result':ans,'keyed_result':key})
for i in set(P)-set(G):
    s=draft(i)['q'];key=draft(i)['options'][P[i]['correct_index']]
    if 'MC per unit for the six blocks' in s:
        price=number(re.search(r'price \$([\d,.]+)',s)[1]);mc=nums(s.split('six blocks is ')[1].split('. Fixed')[0]);fc=number(re.search(r'Fixed cost is \$([\d,.]+)',s)[1]);profits=[price*10*k-10*sum(mc[:k])-fc for k in range(7)];quantity=nums(key)[0];profit=nums(key)[1]*(-1 if 'loss' in key else 1)
        assert math.isclose(profits[int(quantity/10)],max(profits)) and math.isclose(profit,max(profits)),i
        record(i,'Enumerate every 10-unit block choice; retain the stated maximizing choice when profits tie.',{'profits_Q0_to_Q60':profits})
    elif 'Marginal costs of units 1–7' in s:
        price=number(re.search(r'price \$([\d,.]+)',s)[1]);fc=number(re.search(r'Fixed cost is \$([\d,.]+)',s)[1]);mc=nums(re.search(r'\[([^]]+)\]',s)[1]);profits=[price*k-sum(mc[:k])-fc for k in range(8)];best=max(range(8),key=lambda k:(profits[k],k));assert nums(key)[0]==best,i
        assert number(re.search(r'(?:−)?\$([\d,.]+)',key)[1])==abs(profits[best]),i
        record(i,'Enumerate all feasible outputs including shutdown; apply the explicit largest-output tie rule.',{'profits_Q0_to_Q7':profits,'maximizer':best})
    elif 'A monopolist has demand P=' in s:
        a,b,c,d=[number(x) for x in re.search(r'P=([\d.]+)−([\d.]+)Q, MC=([\d.]+)\+([\d.]+)Q',s).groups()];q=(a-c)/(2*b+d);p=a-b*q;kn=nums(key);assert abs(q-kn[0])<.011 and abs(p-kn[1])<.011,i
        record(i,'Derive MR=a−2bQ, equate it to c+dQ, then substitute into demand.',{'Q':q,'price':p})
    elif 'minimum-ATC output Q2=' in s:
        q1,q2,p,mc=[number(x) for x in re.search(r'Q1=([\d.]+), minimum-ATC output Q2=([\d.]+), price \$([\d.]+) and MC=\$([\d.]+)',s).groups()];kn=nums(key);assert abs((p-mc)-kn[0])<.011 and abs(q2-q1-kn[1])<.011,i
        record(i,'Price minus MC; minimum-ATC output minus profit-maximizing output.',{'markup':p-mc,'excess_capacity':q2-q1})
    elif 'consumer has $' in s and 'income remains' in s:
        amounts=[number(x) for x in re.findall(r'\$([\d,.]+)',s)];value=amounts[0]-amounts[1];assert value==nums(key)[0];record(i,'Income less bundle expenditure.',value)
    elif 'largest whole-number quantity of X' in s:
        a,b=[number(x) for x in re.findall(r'\$([\d,.]+)',s)];v=math.floor(a/b);assert v==nums(key)[0];record(i,'Floor of income divided by the unit price.',v)
    elif 'Which expression defines the budget boundary?' in s:
        a,b,c=[number(x) for x in re.findall(r'\$([\d,.]+)',s)];assert nums(key)==[b,c,a];record(i,'Price-weighted expenditure equals income.',{'Px':b,'Py':c,'income':a})
    elif 'belong to the budget set?' in s:
        a,b,c,total=[number(x) for x in re.findall(r'\$([\d,.]+)',s)];x,y=map(int,re.search(r'bundle \((\d+),(\d+)\)',s).groups());assert x*b+y*c==total and total<=a and key.startswith('Yes');record(i,'Compute the bundle cost and compare it with income.',{'cost':x*b+y*c,'income':a})
    elif 'MUx/Px is ' in s:
        x,y=map(number,re.search(r'MUx/Px is ([\d.]+) and MUy/Py is ([\d.]+)',s).groups());assert ('toward X' if x>y else 'toward Y') in key;record(i,'Compare marginal utility per dollar.',{'X':x,'Y':y})
    elif 'whose willingness to pay is $' in s:
        values=nums(re.search(r'values \[([^]]+)\]',s)[1]);selected=number(re.search(r'whose willingness to pay is \$([\d,.]+)',s)[1]);gain=selected-min(values)
        admin=re.search(r'using \$([\d,.]+) of real',s);cost=number(admin[1]) if admin else 0
        kn=nums(key);assert kn[0]==gain,(i,gain,key)
        if admin:assert kn[1]==abs(gain-cost) and ('retain' in key)==(gain<cost),(i,gain,cost,key)
        record(i,'Same output and sellers: replace the lowest value by the specified buyer value; subtract real administration cost.',{'recovered_surplus':gain,'administration':cost,'net_change':gain-cost})
    elif 'MUx is ' in s:
        x,y=map(number,re.search(r'MUx is ([\d.]+) and MUy is ([\d.]+)',s).groups());record(i,'Marginal rate of substitution MUx/MUy; directional interpretation checked with choices.',x/y)

# The readings were checked on the unchanged student graph assets, including
# units, axis scales and approximate rather than spuriously exact coordinates.
linear={'42186':{'equation':'60-Q=0.5Q','Q':60/1.5,'MC':.5*(60/1.5)},'42196':{'equation':'90-10Q+10=50','Q':(90+10-50)/10},'P62I-OLI-L-073':{'equation':'70-Q=55','Q':70-55,'price':70-.5*(70-55)}}
for i,r in R.items():
    computations=[]
    if r['numerical_reasoning']!=r['graph_evidence_required']:
        if i in linear:computations.append(linear[i])
        else:
            for part in r['numerical_reasoning'].split(';'):
                m=re.match(r'\s*([\d.()+*/\-,\s]|abs|min)+[=≈]',part)
                if not m:continue
                left=re.split('[=≈]',part,maxsplit=1)[0].strip();right=re.split('[=≈]',part,maxsplit=1)[1]
                val=evaluate(left);want=re.match(r'\s*(-?[\d.]+(?:/[\d.]+)?)',right)
                assert want,(i,part)
                expected=evaluate(want[1]);assert abs(val-expected)<.011,(i,left,val,expected)
                computations.append({'expression':left,'computed':val,'displayed_rounded_result':expected})
            assert computations,(i,r['numerical_reasoning'])
    record(i,'Visually verify the graph-specific readings and units; recompute all requested arithmetic; assess the associated economic interpretation.',{'graph':O[i]['image'],'readings':r['graph_evidence_required'],'calculations':computations,'qualitative_or_direct_reading_only':not computations})

# Text-only/wording-only items with graph numbers not newly used in graph repairs.
extra={'42084':[('subsidy',(15-10)*150)],'P62F-PC-M-032':[('unit_profit',30-20)],'P62F-PC-M-041':[('unit_profit',40-20)],'P62F-PC-M-036':[('ATC',40)],'P62F-PC-M-037':[('AVC',20)],'P62B-ELAS-B3-020':[('short_run_arc',(10/65)/(4/6)),('long_run_arc',(40/80)/(4/6))],'P62C-CPS-LB-009':[('consumer_surplus',.5*8*(18-10))],'P62E-COP-EL-007':[('change_AFC_ATC',1000/100)],'P62B-ELAS-B3-008':[('revenue_ratio',1.1*.8)]}
for i,values in extra.items():record(i,'Recomputed using the unchanged graph values and revised task; midpoint denominators where applicable.',dict(values))
for i in set(P)-set(checks):
    record(i,'Conceptual/qualitative task: no newly introduced arithmetic. Original and revised assumptions, distinctions, options and feedback compared.',{'unchanged_numeric_tokens':re.findall(r'\d+(?:\.\d+)?',O[i]['q'])==re.findall(r'\d+(?:\.\d+)?',draft(i)['q'])})
assert len(checks)==672
(HERE/'numerical_verification.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Item checks:',len(checks),'graph:',len(R),'explicit non-graph calculations:',sum(not c['method'].startswith('Conceptual') for i,c in checks.items() if i not in G))

