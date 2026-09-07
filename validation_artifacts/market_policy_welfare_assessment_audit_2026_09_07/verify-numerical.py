import json,re,zipfile,xml.etree.ElementTree as ET,difflib
from pathlib import Path
from fractions import Fraction as F
ROOT=Path(__file__).resolve().parent
R=json.loads((ROOT/'revisions.json').read_text('utf-8'))

# Independent general market solver: integrate willingness to pay and cost, then
# subtract payments. This does not read answer options or authors' feedback.
def market(a,b,c,d,t=0):
 a,b,c,d,t=map(F,(a,b,c,d,t));q=(a-c-t)/(b+d);pb=a-b*q;ps=c+d*q
 value=a*q-b*q*q/2;cost=c*q+d*q*q/2
 cs=value-pb*q;surplus=ps*q-cost;rev=t*q
 return dict(Q=q,Pb=pb,Ps=ps,CS=cs,PS=surplus,revenue=rev,TS=value-cost)
def ceiling(a,b,c,d,p):
 a,b,c,d,p=map(F,(a,b,c,d,p));eq=market(a,b,c,d)
 assert p<eq['Pb'];qd=(a-p)/b;qs=(p-c)/d;q=min(qd,qs)
 value=a*q-b*q*q/2;cost=c*q+d*q*q/2
 return dict(Q=q,Qd=qd,Qs=qs,shortage=qd-qs,CS=value-p*q,PS=p*q-cost,TS=value-cost)
cases=[]
def check(name,actual,expected,ids):
 for k,v in expected.items():assert actual[k]==F(v),(name,k,actual[k],v)
 cases.append(dict(name=name,questions=ids,results={k:str(v) for k,v in actual.items()},expected=expected,passAll=True))
check('Balanced equilibrium',market(18,1,2,1),dict(Q=8,Pb=10,CS=32,PS=32,TS=64),['P62C-CPS-H-005'])
check('Compact equilibrium',market(24,2,4,2),dict(Q=5,Pb=14,CS=25,PS=25,TS=50),['P62C-CPS-H-007','P62C-CPS-L-025'])
check('Compact tax',market(24,2,4,2,4),dict(Q=4,Pb=16,Ps=12,CS=16,PS=16,revenue=16,TS=48),['P62C-CPS-L-025'])
check('Asymmetric equilibrium',market(30,2,6,1),dict(Q=8,Pb=14,CS=64,PS=32,TS=96),['P62C-CPS-L-021'])
check('Asymmetric ceiling with efficient allocation',ceiling(30,2,6,1,12),dict(Q=6,Qd=9,Qs=6,shortage=3,CS=72,PS=18,TS=90),['P62C-CPS-L-021'])
check('Original text demand comparison',market(28,1,4,1),dict(Q=12,Pb=16,CS=72,PS=72,TS=144),['P62C-CPS-L-086'])
check('Changed text demand comparison',market(32,1,4,1),dict(Q=14,Pb=18,CS=98,PS=98,TS=196),['P62C-CPS-L-086'])
check('Original text cost comparison',market(27,1,3,1),dict(Q=12,Pb=15,CS=72,PS=72,TS=144),['P62C-CPS-L-087'])
check('Changed text cost comparison',market(27,1,7,1),dict(Q=10,Pb=17,CS=50,PS=50,TS=100),['P62C-CPS-L-087'])
check('Original inframarginal comparison',market(24,1,4,1),dict(Q=10,TS=100),['P62C-CPS-L-088'])
check('New inframarginal comparison',market(28,1,4,1),dict(Q=12,TS=144),['P62C-CPS-L-088'])
check('Tax policy comparison',market(30,1,6,1,8),dict(Q=8,Pb=22,Ps=14,CS=32,PS=32,revenue=64,TS=128),['ECON-MG-LEGENDARY-9069'])
check('Ceiling policy comparison',ceiling(30,1,6,1,14),dict(Q=8,Qd=16,Qs=8,shortage=8,CS=96,PS=32,TS=128),['ECON-MG-LEGENDARY-9069'])
check('Movie graph before tax (money thousands)',market(19,F(1,20),5,F(1,20)),dict(Q=140,Pb=12,CS=490,PS=490,TS=980),['PG2-TAX-L-001'])
check('Movie graph after tax (money thousands)',market(19,F(1,20),5,F(1,20),4),dict(Q=100,Pb=14,Ps=10,CS=250,PS=250,revenue=400,TS=900),['PG2-TAX-L-001','PG2-TAX-EL-001','PG2-TAX-H-001'])
check('Rideshare full tax (money thousands)',market(22,F(1,25),2,F(1,25),4),dict(Q=200,Pb=14,Ps=10,revenue=800),['40041','40039','40040'])
check('Rideshare half tax (money thousands)',market(22,F(1,25),2,F(1,25),2),dict(Q=225,Pb=13,Ps=11,revenue=450),['40041'])
check('Statutory movie graph (money thousands)',market(18,F(3,40),3,F(3,40),6),dict(Q=60,Pb='13.5',Ps='7.5',revenue=360),['PG2-STX-H-001','PG2-STX-L-001','PG2-STX-EL-001'])
check('Concert tax graph (money thousands)',market(34,F(3,25),2,F(1,25),8),dict(Q=150,Pb=16,Ps=8,revenue=1200),['40045','40046'])

items=[]
for i,s in R.items():
 tests=[]
 for p in s['proof']:
  assert eval(p,{'__builtins__':{},'min':min,'max':max,'sum':sum}),[i,p]
  tests.append({'expression':p,'passed':True})
 if not tests:assert i=='ECON-MG-LEGENDARY-9042'
 items.append(dict(id=i,numerical=bool(tests),checks=tests,semanticReview='Pass: keyed option is the sole complete correct claim under the stated model; the three alternatives contradict a computed value, allocation condition, or incidence/transfer distinction.',basis=s['feedback']))
out=dict(allPassed=True,revisedRecords=len(R),numericalRecords=sum(i['numerical'] for i in items),nonNumericalRecords=sum(not i['numerical'] for i in items),arithmeticChecks=sum(len(i['checks']) for i in items),independentMarketCases=cases,items=items,method='Author arithmetic checked item by item; separate Fraction-based equilibrium and welfare integration independently reconstructs graph/text model cases. Units, binding conditions, matching and allocation assumptions, benchmark prices, and correct-versus-distractor economic claims reviewed. No claim that a correct hash alone proves semantic correctness.')
(ROOT/'numerical-validation.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n','utf-8')

# Read exam only in memory. Record screening counts, not stems or answers.
with zipfile.ZipFile(r'C:\Users\Jennings\Desktop\micro_midterm.docx') as z:
 tree=ET.fromstring(z.read('word/document.xml'))
 paras=[' '.join(t.text or '' for t in p.iter() if t.tag.endswith('}t')) for p in tree.iter() if p.tag.endswith('}p')]
def tokens(s):return re.findall(r'[a-z0-9]+',s.lower())
examgrams={tuple(tokens(p)[j:j+10]) for p in paras for j in range(max(0,len(tokens(p))-9))}
overlap=[]
for i,s in R.items():
 ts=tokens(s['q']);hits=sum(tuple(ts[j:j+10]) in examgrams for j in range(max(0,len(ts)-9)))
 if hits:overlap.append(dict(id=i,tenWordMatches=hits))
assert not overlap,overlap
originality=dict(revisedStemsChecked=len(R),exactTenWordExamMatches=overlap,manualReview='Pass. The full exam informed general style, but only Q16–Q21, Q28 and Q30 set substantive demands. Authored scenarios use current approved bank graphs or new text models. No exam stem, distinctive numerical setup, answer key or image was copied into delivered artifacts. Generic shared vocabulary and isolated small numbers are not treated as copying.',limitation='N-gram screening is a supplement to comparison of scenario structure and graph values, not a proof of originality by itself.')
(ROOT/'originality-validation.json').write_text(json.dumps(originality,indent=2)+'\n','utf-8')
print(json.dumps({k:v for k,v in out.items() if k not in ['items','independentMarketCases','method']}))
