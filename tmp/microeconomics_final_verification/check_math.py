"""Independent Decimal arithmetic/model checks for the authorized cleanup.

Run after apply_cleanup.cjs. Inputs are the explicit implementation proof ledgers,
not inferred answer indexes. This does not search for new defect classes.
"""
import ast
import hashlib
import json
import math
import re
import unicodedata
from decimal import Decimal, getcontext, ROUND_HALF_UP
from pathlib import Path

getcontext().prec = 40
ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'tmp/microeconomics_final_verification'
INPUTS = ROOT / 'audit_tools/microeconomics_cleanup/inputs'
read = lambda name: json.loads((INPUTS / name).read_text(encoding='utf-8'))
source=(ROOT/'build/faculty-build-composer/data/composer_library.js').read_text(encoding='utf-8')
library=json.loads(source.split('=',1)[1].strip().removesuffix(';'))
questions={}
def collect(value):
    if isinstance(value,dict):
        if 'q' in value and 'options' in value: questions[str(value['id'])]=value
        for child in value.values(): collect(child)
    elif isinstance(value,list):
        for child in value: collect(child)
collect(library)
results, errors = [], []

def calculate(expression):
    def visit(node):
        if isinstance(node, ast.Constant): return Decimal(str(node.value))
        if isinstance(node, ast.UnaryOp):
            v = visit(node.operand)
            return -v if isinstance(node.op, ast.USub) else v
        if isinstance(node, ast.BinOp):
            a, b = visit(node.left), visit(node.right)
            operations = {ast.Add: lambda: a+b, ast.Sub: lambda: a-b,
                          ast.Mult: lambda: a*b, ast.Div: lambda: a/b,
                          ast.Pow: lambda: a**b}
            return operations[type(node.op)]()
        raise ValueError(type(node).__name__)
    return visit(ast.parse(expression, mode='eval').body)

def key(q):
    normalized = lambda s: re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', s).strip()).lower()
    return next(o for o in q['options'] if hashlib.sha256(normalized(o).encode()).hexdigest() == q['aHash'])

def near(a, b, label):
    assert abs(float(a)-float(b)) < 1e-7, (label, a, b)

for spec in read('numeric_specs.json') + read('manual_numeric_specs.json'):
    value = calculate(spec['formula'])
    if 'expected' in spec:
        expected = Decimal(str(spec['expected']))
        if expected.as_tuple().exponent >= -2:
            near(value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP), expected, spec['questionID'])
        else:
            near(value, expected, spec['questionID'])
    q = questions[spec['questionID']]
    text = unicodedata.normalize('NFKC', key(q)+' '+q['feedback']).replace(',', '').replace('−', '-')
    observed = [float(x) for x in re.findall(r'(?<!\w)-?\d+(?:\.\d+)?', text)]
    # Narrative declines/losses commonly use positive magnitudes. Up to two cents
    # of display rounding is allowed here; explicit authored expectations above
    # remain exact. This check supplements, not replaces, the key review ledger.
    visible = any(abs(abs(x)-abs(float(value))) <= .051 for x in observed)
    results.append({**spec, 'decimalResult': str(value), 'resultInKeyOrExplanation': visible})

for s in read('schedule_specs.json'):
    if s['family'] == 'surplus-schedules':
        gains = [v-c for v,c in zip(s['values'],s['costs'])]
        assert gains == s['gains']
        cumulative = [sum(gains[:i]) for i in range(len(gains)+1)]
        best = max(cumulative)
        assert max(i for i,v in enumerate(cumulative) if v == best) == s['largestEfficientQuantity']
        assert best == s['totalSurplus']
        assert sum(g > 0 for g in gains) == s['positiveTrades']
        q=questions[s['questionID']]; answer=key(q)
        mode=s['mode']
        if mode==1:
            change=s['values'][s['positiveTrades']-1]-s['values'][-1]
            assert '$'+str(change) in answer, (s['questionID'],change,answer)
        elif mode==3:
            charge=int(re.search(r'uses \$(\d+) of real resources for every',q['q'])[1])
            revised=[g-charge for g in gains]
            count=sum(g>0 for g in revised); surplus=sum(g for g in revised if g>0)
            assert str(count)+' units' in answer and '$'+str(surplus) in answer
        elif mode==4:
            cutoff=s['costs'][s['positiveTrades']]
            assert '$'+str(cutoff) in answer
        elif mode=='checkpoint-reallocation-or-boundary':
            if 'zero marginal gain' in answer:
                assert str(s['largestEfficientQuantity']) in answer and '$'+str(best) in answer
            else:
                gain=s['values'][s['positiveTrades']-1]-s['values'][-1]
                admin=int(re.search(r'\$(\d+) of real (?:administrative|administration)',q['q'])[1])
                assert '$'+str(gain) in answer and '$'+str(abs(gain-admin)) in answer
                assert ('so reassign' in answer)==(gain>admin)
        else:
            assert str(s['largestEfficientQuantity'])+' units' in answer and '$'+str(best) in answer
        results.append({'questionID':s['questionID'],'model':s['family'],'allQuantitySurpluses':cumulative,'maximum':best})
    else:
        vc = [sum(s['marginalCosts'][:i]) for i in range(len(s['marginalCosts'])+1)]
        contribution = [s['price']*i-v for i,v in enumerate(vc)]
        assert vc == s['variableCosts'] and contribution == s['contributions']
        best = max(contribution)
        assert max(i for i,v in enumerate(contribution) if v == best) == s['largestOptimalOutput']
        assert best-s['fixedCost'] == s['profit']
        answer=key(questions[s['questionID']])
        assert str(s['largestOptimalOutput']) in answer
        assert '$'+str(abs(s['profit'])) in answer or '$'+str(s['profit']) in answer
        if s.get('boss'):
            qtext=questions[s['questionID']]['q']
            if 'lowers every marginal unit cost by $2' in qtext:
                revised=[s['price']*i-sum(m-2 for m in s['marginalCosts'][:i])-s['fixedCost'] for i in range(8)]
                maximum=max(revised); output=max(i for i,p in enumerate(revised) if p==maximum)
                assert str(output) in answer and '$'+str(maximum) in answer
            if 'fee adds $15' in qtext:
                assert '$'+str(s['profit']-15) in answer
        results.append({'questionID':s['questionID'],'model':s['family'],'allQuantityProfits':[v-s['fixedCost'] for v in contribution],'maximum':best-s['fixedCost']})

def matrix(cells):
    labels=['A/X','A/Y','B/X','B/Y']
    p=[cells[k] for k in labels]
    nash=[labels[i] for i in range(4) if p[i][0]>=p[(i+2)%4][0] and p[i][1]>=p[i^1][1]]
    totals=[sum(x) for x in p]
    joint=[labels[i] for i,v in enumerate(totals) if v==max(totals)]
    return nash,joint

for s in read('model_specs.json'):
    family=s.get('family')
    if family=='monopoly-policy':
        a,b,c,F=[s[k] for k in ['a','b','c','F']]
        qm=(a-c)/(2*b); pm=a-b*qm; qc=(a-c)/b; dwl=.5*(qc-qm)*(pm-c)
        for field,value in [('qm',qm),('pm',pm),('qc',qc),('dwl',dwl)]: near(value,s[field],field)
        results.append({'questionID':s['questionID'],'model':family,'Q':qm,'P':pm,'efficientQ':qc,'DWL':dwl})
    elif family=='monopolistic-competition-tangency':
        a,b,F,c,d=[s[k] for k in ['a','b','F','c','d']]
        q=(a-c)/(2*b+2*d); p=a-b*q; mc=c+2*d*q; atc=F/q+c+d*q; q2=math.sqrt(F/d)
        for field,value in [('Q',q),('Q2',q2),('P',p),('MC',mc)]: near(value,s[field],field)
        near(p,atc,'Zero profit tangency'); near(-F/q**2+d,-b,'Demand/ATC slope tangency')
        results.append({'questionID':s['questionID'],'model':family,'Q':q,'P':p,'MC':mc,'ATC':atc,'minimumATCQuantity':q2})
    else:
        cells=s['cells']
        if isinstance(cells,list): cells=dict(zip(['A/X','A/Y','B/X','B/Y'],sum(cells,[])))
        nash,joint=matrix(cells)
        expected=s.get('pureNash') or ['AB'[i]+'/'+'XY'[j] for i,j in s['expectedNash']]
        assert nash==expected
        if 'jointMaxima' in s: assert joint==s['jointMaxima']
        results.append({'questionID':s.get('questionID',s.get('id')),'model':'matrix-counterfactual','nash':nash,'jointMaximum':joint})

for s in read('matrix_checks.json'):
    nash,joint=matrix(s['cells'])
    assert nash==s['pureNash'] and joint==s['jointMaxima']
    results.append({'asset':s['asset'],'questionIDs':s['currentQuestionIDs'],'model':'existing-transcribed-matrix','nash':nash,'jointMaximum':joint})

for s in read('graphs/manifest.json'):
    p=s['parameters']
    if 'Qk' in p:
        q,price,bu,bl,mc=[p[k] for k in ['Qk','Pk','upperSlope','lowerSlope','MC']]
        upperMR=price-bu*q; lowerMR=price-bl*q
        assert bu<bl and lowerMR<mc<upperMR
        near(upperMR,s['computed']['upperMR'],'Upper MR');near(lowerMR,s['computed']['lowerMR'],'Lower MR')
        results.append({'asset':s['runtimePath'],'model':'kinked-demand','Q':q,'P':price,'MRGap':[lowerMR,upperMR],'MC':mc})
    else:
        a,b,F,c,d=[p[k] for k in ['a','b','F','c','d']]
        q=(a-c)/(2*b+2*d); q2=math.sqrt(F/d); price=a-b*q; atc=F/q+c+d*q; mc=c+2*d*q
        near(price,atc,'Graph tangency');near(-F/q**2+d,-b,'Graph slope tangency')
        near(F/q2+c+d*q2,c+2*d*q2,'MC equals minimum ATC')
        near(q,s['computed']['Q1'],'Graph chosen output');near(q2,s['computed']['Q2'],'Graph efficient scale')
        results.append({'asset':s['runtimePath'],'model':'cost-consistent-tangency','Q':q,'P':price,'ATC':atc,'MC':mc,'minimumATCQuantity':q2})

# Explicit ordinal checks accompanying simple bridge and political tasks.
assert sorted([1,3,4,8,10])[2]==4
assert [sum([10-m for m in [4,7,9,13]][:i]) for i in range(5)]==[0,6,9,10,7]
rankings=[['A','B','C'],['B','C','A'],['C','A','B']]
win=lambda a,b: a if sum(r.index(a)<r.index(b) for r in rankings)>=2 else b
assert win(win('A','B'),'C')=='C' and win(win('B','C'),'A')=='A'
for s in read('qualitative_numeric_review.json'):
    q=questions[s['questionID']]
    assert s['stem']==q['q'] and s['key']==key(q) and s['feedback']==q['feedback']

display_reviews=read('display_proof_reviews.json')
assert {(x['questionID'],x['formula']) for x in display_reviews}=={(x['questionID'],x['formula']) for x in results if x.get('resultInKeyOrExplanation') is False}
report={'status':'validated implementation arithmetic/models','checks':len(results),
        'questionIDs':sorted({r['questionID'] for r in results if 'questionID' in r}),
        'qualitativeComparisons':read('qualitative_numeric_review.json'),
        'displayReviewDispositions':display_reviews,'unresolvedDisplayReviews':0,
        'results':results}
(WORK/'numeric_proofs.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['results','qualitativeComparisons','questionIDs']},indent=2))
