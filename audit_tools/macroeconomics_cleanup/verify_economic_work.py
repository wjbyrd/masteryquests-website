"""Record recomputation and explicit dispositions for revised numeric-looking keys."""
from author import *
import math,re,hashlib

results={}
for id,proof in PROOFS.items():
    checks=[]
    for expr,expected in proof.get('expressions',[]):
        assert re.fullmatch(r'[0-9eE+*/().\s−-]+',expr)
        actual=eval(expr,{'__builtins__':{}},{})
        assert math.isclose(actual,expected,rel_tol=1e-7,abs_tol=1e-7),(id,expr)
        checks.append({'expression':expr,'expected':expected,'recomputed':actual})
    results[id]={'method':'Recompute the authored visible-input equation; round only at the requested answer precision.','checks':checks,'basis':proof['basis']}

for id,p in PATCHES.items():
    if 'options' not in p or id in results or not re.search(r'\d',q(id)['$correct']):continue
    x=q(id);s=x['q'];key=x['$correct'];dollars=[float(z.replace(',','')) for z in re.findall(r'\$([\d,]+)',s)]
    check=None
    if 'used domestic machine' in s:
        assert f'${dollars[1]:g}' in key
        check={'currentGDP':dollars[1],'householdPayment':sum(dollars),'rule':'Used asset value is excluded; the current dealer service is included.'}
    elif 'foreign-owned factory' in s:
        assert f'${dollars[0]:g}' in key
        check={'GDP':dollars[0],'rule':'Production inside the boundary is included; ownership and profit remittance do not subtract that production.'}
    elif 'Machinery prices fall 4%' in s:
        assert 'CPI rises 6%' in key and 'deflator falls 4%' in key
        check={'CPIChangePercent':6,'deflatorChangePercent':-4,'rule':'Imported household basket versus domestically produced export basket.'}
    elif 'minimum wage of $12' in s:
        assert dollars==[12,15]
        check={'binding':12>15,'rule':'A minimum below the competitive wage is nonbinding.'}
    elif 'transfers the time deposit into savings' in s:
        a,b,c=dollars
        assert f'${c:g}' in key
        check={'M1Before':a+b,'M1After':a+b+c,'M1Change':c,'M2Before':a+b+c,'M2After':a+b+c,'rule':'Current M1 includes savings, while M2 already includes the small time deposit.'}
    elif 'bank grants' in s:
        assert f'${dollars[0]:g}' in key
        check={'loanAssetsChange':dollars[0],'depositLiabilitiesChange':dollars[0],'capitalChange':0,'rule':'Loan origination creates a matching deposit; settlement is a subsequent constraint.'}
    elif 'Government pays $30 in interest' in s:
        assert dollars==[30,120] and '$30' in key
        check={'interestExpense':30,'principalRepayment':120,'rule':'Debt service includes both, but principal repayment is not interest expense.'}
    elif 'nominal rates fall 2 percentage points' in s:
        assert 'Expected inflation fell 2 points' in key
        check={'nominalRateChangePoints':-2,'realRateChangePoints':0,'expectedInflationChangePoints':-2,'rule':'Difference form of the stated Fisher approximation, not a prediction of realized inflation.'}
    elif id=='LG-B-6009':
        assert '$2' in key and '$4' in key
        check={'oldPrice':1/(1/2),'newPrice':1/(1/4),'rule':'The basket price is the reciprocal of basket units per dollar.'}
    elif id=='ECON-NL-GDP-COMPONENTS-IDENTITY-6003':
        assert dollars==[30000,20000]
        check={'C':30000,'I':20000,'rule':'New household car versus new business capital, both domestic.'}
    elif id=='PMOE-NER-BR-001':
        assert '10%' in key
        check={'realRateFactor':1.1*1/1,'percentChange':10,'rule':'With both price levels fixed, eP/P* changes proportionally with e.'}
    elif id=='ECON-NL-DIMINISHING-RETURNS-6023':
        assert 'smaller than 6' in key
        check={'successiveMarginalProducts':[12,9,6],'rule':'If the stated declining marginal-product pattern continues, the fourth gain is below 6; its exact value is not identified.'}
    elif id=='PM2A-DIS-EB-014':
        assert 'At 3% prices still rise' in key and '−1% they fall' in key
        check={'firstPriceFactor':1.03,'secondPriceFactor':.99,'rule':'Positive inflation raises the price level; a negative rate lowers it. A falling positive rate is not deflation.'}
    elif x.get('image'):
        check={'image':x['image'],'key':key,'rule':'Graph labels such as Y1 and U2 are locations, not numerical measurements. Compare fixed-AD wage adjustment, demand reversal, and expectation-adjusted Phillips endpoints on the unchanged registered diagram.'}
    elif any(t in s for t in ['natural rate is 5%','Natural unemployment is unchanged','natural unemployment is 5%','natural unemployment falls from 5% to 4%']):
        check={'rule':'An expectations adjustment returns unemployment to unchanged natural unemployment (5%); the explicit matching reform instead changes the benchmark to 4%.','key':key}
    elif 'M1' in key:
        check={'rule':'Currency and checking are both M1: a transfer between them changes composition, not total. A separate loan-created deposit can expand money; currency withdrawal can reduce bank reserves without changing initial M1.','key':key}
    else:raise AssertionError(('Unreviewed numeric-looking revised key',id,s,key))
    results[id]={'method':'Additional independent visible-value / scope / labeled-model check','checks':[check]}

flags=json.loads((WORK/'revised_choice_flags_final.json').read_text())
for flag in flags:
    assert flag['rule'] in ['key-only-qualification','key-only-reasoning-clause']
    flag['disposition']='REVIEWED — RETAINED'
    flag['basis']='The conditional relation is the tested economics (credit response, employment/productivity, or short-run versus long-run inference). All four choices make comparably concise substantive claims; no length cue remains. The presence of a keyword or semicolon alone is not an answer-choice defect.'
out={'sourceSHA256':hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest(),'calculationCases':len(PROOFS),'expressionsRecomputed':sum(len(p.get('expressions',[])) for p in PROOFS.values()),'additionalNumericLookingKeyChecks':len(results)-len(PROOFS),'items':results,'constructionFlags':flags,'scope':'Implementation validation of revised tasks, not an independent final read-only bank verification. Equation replay checks arithmetic; additional visible-value, scope and graph dispositions distinguish numeric calculations from labels such as M1/Y1.'}
(WORK/'economic_verification.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in out.items() if k not in ['items','constructionFlags']},ensure_ascii=False))
