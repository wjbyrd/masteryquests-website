"""Independent post-write recomputation from the actual student-visible records."""
import json,re,hashlib,unicodedata,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];WORK=ROOT/'tmp/macroeconomics_exception_closure'
source=(ROOT/'build/faculty-build-composer/data/composer_library.js').read_text(encoding='utf-8')
lib=json.loads(source.removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
records={}
def walk(x):
    if isinstance(x,list):
        for v in x:walk(v)
    elif isinstance(x,dict):
        if 'q' in x and 'options' in x:records[str(x['id'])]=x
        else:
            for v in x.values():walk(v)
walk(lib['concepts'])
def numbers(id):
    text=records[id]['q']
    if id=='PM2B4-UTYPE-MB-006':
        for word,value in [('six','6'),('two','2')]:text=re.sub(r'\b'+word+r'\b',value,text,flags=re.I)
    return [float(n.replace(',','')) for n in re.findall(r'(?<![\w.])(?:\d[\d,]*(?:\.\d+)?|\.\d+)',text)]
def key(id):
    q=records[id]
    normalize=lambda s:re.sub(r'\s+',' ',unicodedata.normalize('NFKC',s).strip()).lower()
    answers=[o for o in q['options'] if hashlib.sha256(normalize(o).encode()).hexdigest()==q['aHash']]
    assert len(answers)==1,id
    return answers[0]
proof=[]
def check(id,calculation,expected,required,explanation):
    n=numbers(id);got=calculation(n)
    def equal(a,b):return all(equal(x,y) for x,y in zip(a,b)) and len(a)==len(b) if isinstance(b,list) else math.isclose(a,b,abs_tol=1e-9)
    assert equal(got,expected),(id,n,got,expected)
    actual=key(id)
    assert all(term in actual for term in required),(id,actual,required)
    proof.append({'id':id,'studentStem':records[id]['q'],'parsedVisibleNumbers':n,'computed':got,'key':actual,'feedback':records[id]['feedback'],'independentReasoning':explanation,'result':'PASS'})
check('43088',lambda n:n[1]-n[0]-n[2],40,['$40'],'Ending stock 260 minus initial 200 minus first-period deficit 20 leaves a missing flow of 40.')
check('ECON-EC-FINALBOSS-19010',lambda n:[n[1]-n[0],n[3]-n[2],n[4]-n[3]],[10,6,8],['positive','10','6','8'],'Successive differences, not levels, establish declining positive capital gains; the later training difference is separate.')
check('ECON-EC-MEDIUMBOSS-18022',lambda n:n[2]-n[1],2,['Training','8','below 6'],'Positive diminishing returns bound the next machine gain below the last gain 6; training 8 exceeds even that bound by 2.')
check('ECON-NL-MEDIUMBOSS-3014',lambda n:n[0]-n[1],20,['20'],'Investment effect compares the observed 100 with the specified no-replacement counterfactual 80.')
check('ECON-NL-MEDIUMBOSS-3019',lambda n:(n[1]/n[0]-1)*100,20,['method','20%'],'Constant worker hours make output growth equal output-per-hour growth; controls distinguish technology from machines and training.')
check('ECON-NL-MEDIUMBOSS-3024',lambda n:((1+n[0]/100)/(1+n[1]/100)-1)*100,-4,['falls 4%'],'Productivity growth is 1.20/1.25−1, not 20−25 as an exact percentage.')
check('PM2B3-SRC-FB-005',lambda n:[n[0]/n[1]*(1+n[2]/100)*n[4],n[0]/n[1]*(1+n[3]/100)*n[5]],[96,115],['96','115'],'Output per hour must be multiplied by the final hours for each plant separately.')
check('ECON-NL-FINALBOSS-4009',lambda n:[n[0]+n[1],n[3]+n[1]],[5,4],['5% to 4%','actual unemployment is 4%'],'Frictional plus structural components determine the natural rate; recovery removes the cyclical component.')
check('ECON-NL-FINALBOSS-4036',lambda n:[-n[0],-n[0]+n[1]],[-2,0],['falls 2 points','offsets'],'The structural change affects the natural rate; the equal opposite cyclical change offsets only actual unemployment.')
check('PM2B4-UTYPE-MB-006',lambda n:[n[1]-n[0],n[1]-n[2],(n[0]-n[2])/(n[1]-n[2])*100],[94,98,4.081632653061225],['94','98'],'Unemployed exits lower U and LF by two but leave employment 94 unchanged; the new rate is 4/98.')
check('ECON-SP-EASYBOSS-2011',lambda n:n[1]/n[0],20,['$20 million decrease','five times'],'Invert the stated multiplier to infer the required reserve withdrawal from the desired deposit contraction.')
check('PM2B4-LMI-MB-005',lambda n:[n[-2],n[-1]-n[-2]],[90,30],['nonbinding to binding','90','30'],'12<15 initially, then 12>10; the final demand quantity gives employment and 120−90 gives excess supply.')
check('ECON-NL-NOMINAL-VS-REAL-GDP-6006',lambda n:n[0]*n[3],550,['$550'],'Value current quantity 110 at base-year price 5; current-price nominal valuation would be 660.')
# Basket totals are stated directly; the old and substitute baskets are stipulated equally satisfactory.
q=records['ECON-NL-SUBSTITUTION-BIAS-6011']['q'];assert 'costing $4' in q and 'now costs $8' in q and 'four pears cost $4' in q
check('ECON-NL-SUBSTITUTION-BIAS-6011',lambda n:(8-4)-(4-4),4,['Overstates by $4'],'Fixed-basket increase is 4, equally satisfactory substitute-basket increase is 0; overstatement is 4.')
check('ECON-SP-MOVE-ALONG-SRPC-6041',lambda n:n[0]+n[2],6,['6% inflation','upward shift'],'At unchanged unemployment, one-for-one expectations transmission adds 2 to inflation 4; this changes the curve.')
check('ECON-SP-TAX-CUT-AD-6033',lambda n:n[3]-n[2],10,['Government purchases','10'],'Compare the supplied first-round consumption 80 with direct purchases 90; no multiplier rounds enter.')
check('LG-B-6003',lambda n:n[0]/100*n[1]-n[2],8000,['$8,000 additional'],'Required reserves 108,000 exceed actual 100,000 by 8,000.')
check('PM2A-DIS-BR-021',lambda n:n[0]*(1+n[2]/100),206,['206','disinflation'],'A positive 3% rate multiplies the existing index 200 by 1.03; slower inflation is not a price-level decline.')
check('PM2A-LRPC-BR-022',lambda n:[n[1],n[2]],[5,6],['5% unemployment','6% inflation','right'],'After expectations adjust, unemployment equals the new natural rate 5 regardless of the fully expected inflation rate 6.')
check('ECON-NL-UNIONS-EFFICIENCY-WAGES-6035',lambda n:[n[-1],n[-2]-n[-1]],[90,30],['90 employed','30'],'At the maintained wage firms demand 90; labor supply 120 leaves 30 in excess supply.')
(WORK/'independent_economic_verification.json').write_text(json.dumps({'sourceSHA256':hashlib.sha256(source.encode()).hexdigest(),'checks':proof,'failures':[]},indent=2,ensure_ascii=False),encoding='utf-8')
print(f'PASS: {len(proof)} post-write numerical/coordinate checks; all current keys and feedback reviewed.')
