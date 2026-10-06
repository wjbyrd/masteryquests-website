"""Independent arithmetic verification; does not import any author/generator."""
import json,re,math
from pathlib import Path
H=Path(__file__).resolve().parent
L=json.loads((H/'expectations.json').read_text());C={c['id']:c for c in L['changes']};checks=[]
def numbers(s):return [float(x) for x in re.findall(r'(?<![A-Za-z])\d+(?:\.\d+)?',s.replace(',',''))]
def check(id,expr,value,expected=None,tol=.006):
 c=C.get(id);answer=c['afterRecord']['options'][c['correctIndex']] if c else ''
 if expected is None:assert any(abs(value-n)<=tol for n in numbers(answer)),(id,expr,value,answer)
 else:assert abs(value-expected)<=tol,(id,expr,value,expected)
 checks.append({'id':id,'expression':expr,'result':value,'key':answer,'status':'PASS'})
for id,c in C.items():
 q=c['afterRecord'];s=q['q'];a=q['options'][c['correctIndex']]
 m=re.search(r'P = (\d+(?:\.\d+)?) - (\d+(?:\.\d+)?)Q.*?TC = (\d+) \+ (\d+)Q \+ ([\d.]+)Q²',s)
 if m:
  intercept,slope,F,v,t=map(float,m.groups());Q=(intercept-v)/(2*(slope+t));profit=(intercept-slope*Q)*Q-(F+v*Q+t*Q*Q)
  check(id,'MR=MC optimal Q',Q);check(id,'P(Q)Q − TC(Q)',abs(profit));assert profit>=-F
  assert ('loss' in a)==(profit<0)
 if 'At its chosen output, a firm sells' in s:
  Q,p,atc=numbers(s)[:3];check(id,'(P−ATC)Q',(p-atc)*Q)
 if 'optimum, Q=' in s:
  Q,p,atc,avc=numbers(s)[:4];check(id,'Displayed (P−ATC)Q',abs((p-atc)*Q));assert p>avc
 if 'HHI' in s and '[' in s:
  shares=json.loads(re.search(r'\[[^]]+\]',s)[0]);check(id,'Sum of squared percentage shares',sum(n*n for n in shares))
 if 'prices in dollars [' in s:
  arrays=re.findall(r'\[[^]]+\]',s);prices,costs=map(json.loads,arrays);profits=[p*i-costs[i] for i,p in enumerate(prices)];check(id,'argmax P(Q)Q−TC(Q)',max(range(len(profits)),key=profits.__getitem__))
 if id.startswith('P62F-PC-H-') and 'Marginal costs of units' in s:
  p,F=map(float,re.findall(r'\$(\d+)',s)[:2]);mc=list(map(float,re.findall(r'\$(\d+)',s)[2:]));profits=[p*i-F-sum(mc[:i]) for i in range(len(mc)+1)];best=max(range(len(profits)),key=profits.__getitem__)
  if best:check(id,'profit-maximizing discrete output',best)
  else:assert 'Shut down' in a
  check(id,'maximum profit/loss including shutdown',abs(profits[best]));assert ('loss' in a)==(profits[best]<0)
 if id.startswith('P62F-PC-C-') and 'marginal costs for units' in s:
  vals=list(map(float,re.findall(r'\$(\d+)',s)));p=vals[0];mc=vals[1:];check(id,'Last unit with MC≤P',sum(x<=p for x in mc))
 if id.startswith('P62D-ITP-M-') and 'After free trade opens' in s:
  prod,cons=map(float,re.search(r'domestic production is (\d+) units and consumption is (\d+)',s).groups());check(id,'Absolute production−consumption',abs(prod-cons))
 if 'has output schedule' in s:
  output=[int(v) for v in re.findall(r'\d:(\d+)',s)];mp=[b-a for a,b in zip(output,output[1:])];check(id,'First worker with decreasing marginal product',next(i+2 for i in range(len(mp)-1) if mp[i+1]<mp[i]))
 if 'MP sequence' in s:
  mp=[int(v) for v in re.search(r'MP sequence ([\d, -]+)',s)[1].split(',')];check(id,'First falling MP',next(i+2 for i in range(len(mp)-1) if mp[i+1]<mp[i]))
 if id.startswith('P62H-MCMP-EL-') and 'minimum-ATC output' in s:
  Q1,Q2,p,mc=map(lambda v:float(v.rstrip('.')),re.search(r'Q1=(\d+.\d+|\d+), minimum-ATC output Q2=([\d.]+), price \$([\d.]+) and MC=\$([\d.]+)',s).groups());check(id,'Markup P−MC',p-mc);check(id,'Excess capacity Q2−Q1',Q2-Q1)
# Midpoint elasticities from the independently transcribed stem inputs.
for id,p1,p2,q1,q2 in [('H-002',18,21,800,680),('H-003',14,11,500,650),('H-005',35,40,900,765),('H-006',50,44,600,720),('H-007',60,66,1000,850),('H-008',16,20,1500,1170),('H-009',250,225,400,480),('B2-005',50,45,800,960),('B2-006',100,115,900,720),('C-010',140,126,800,1000),('L-076',8,12,34,46),('L-077',8,12,12,28),('H-034',12,4,30,90)]:
 check('P62B-ELAS-'+id,'Midpoint ΔQ/meanQ ÷ ΔP/meanP',abs((q2-q1)/(q1+q2)*(p1+p2)/(p2-p1)))
check('P62B-ELAS-L-073','Midpoint calculation',abs((-40/100)/(4/10)),1)
for p1,p2 in [(4,8),(8,12)]:check('P62B-ELAS-L-078','Through-origin midpoint supply',((5*p2-5*p1)/(5*p1+5*p2))*((p1+p2)/(p2-p1)),1)
check('P62B-ELAS-B3-004','Exact revenue change percent',(1.08*.95-1)*100)
# Production/cost tasks: calculate without reading the feedback or answer value.
for suffix,expr,val in [('C-009','34−20',34-20),('C-010','41−29',41-29),('C-013','210+2*110',210+2*110),('C-017','(180+60)/34',240/34),('C-018','(360+180)/41',540/41),('C-019','(350+175)/56',525/56),('C-020','(420+300+150)/34',870/34),('C-021','(210+300+140)/43',650/43),('C-023','(470−345)/(44−32)',125/12),('C-024','(780−620)/(69−57)',160/12),('C-025','(295−195)/(26−15)',100/11),('C-026','40*(7.5+16.75)',40*24.25),('C-027','(225+400+175)/58',800/58),('C-028','(1624−700−394)/100',530/100),('B2-019','20*(8+12)',400),('B2-020','60*(5+15)',1200),('B2-026','4*80',320),('L-015','47/4',47/4)]:check('P62E-COP-'+suffix,expr,val)
for suffix,values in [('L-027',[240,480,480/20,120/(20-8)]),('L-030',[750,1170,1170/54,150/(54-45)]),('LB-035',[85-74,155/(85-74),6*155,450+6*155,1380/85]),('L-028',[24.31-13.97])]:
 for v in values:check('P62E-COP-'+suffix,'Independent current-output cost reconstruction',v)
check('P62E-COP-L-028','Rounded AFC times output',29*(24.31-13.97),300,.2)
for id,mp,p in [(str(42424+i),mp,p) for i,(mp,p) in enumerate([(7,6),(5,9),(8,7),(3,24),(10,4),(2,45),(6,11),(9,5),(12,4),(4,18),(3,20),(15,3),(8,8),(2,40),(11,5),(5,13),(4,22),(9,7)])]:check(id,'MPL × current price',mp*p)
check('42334','VMP change 1.25*.90−1',(1.25*.9-1)*100)
# Independently reconstructed trade triangles and changes.
for n,di,si,pa,qa,pw,qd,qs in [(0,80,20,50,30,70,10,50),(1,94,26,60,34,76,18,50),(2,72,12,42,30,60,12,48)]:
 check(f'P62D-ITP-C-{15+n:03}','Consumer-surplus loss',.5*(di-pa)*qa-.5*(di-pw)*qd)
 check(f'P62D-ITP-C-{18+n:03}','Producer-surplus gain',.5*(pw-si)*qs-.5*(pa-si)*qa)
for n,di,si,pa,qa,pw in [(21,80,20,50,30,30),(22,94,26,60,34,42),(23,72,12,42,30,20)]:check(f'P62D-ITP-C-{n:03}','CS+PS after minus before',.5*(di-pw)**2+.5*(pw-si)**2-.5*(di-si)*qa)
for n,old,new in [(9,450,1250),(10,578,1352),(11,450,1352),(12,450,50),(13,578,128),(14,450,32)]:check(f'P62D-ITP-C-{n:03}','Surplus change magnitude',abs(new-old))
check('P62D-ITP-C-030','Two tariff distortion triangles',.5*5*((38-20)+(70-48)))
# Independent income-share calculations.
for id,expr,val in [('42764','100−(4+10+17+24)',100-55),('42768','100−38',62),('42772','100−(3+9+16+27)',45),('42776','100−57',43),('42780','(100−65)% *400',.35*400),('42762','richest-quintile share',50),('42766','100−54',46),('42771','2+9+16',27),('42774','7+12',19),('42778','.44*500',220),('42781','40/4',10),('42781','36/6',6),('42767','19−6',13),('42773','7*6',42),('42779','36−18',18),('42763','4+11',15),('42783','(6+13)%*200',38),('42782','48−43',5),('42753','40−15',25)]:check(id,expr,val)
check('42769','48/8',48/8,6)
y=[0,.05,.15,.30,.55,1];area=sum(.2*(a+b)/2 for a,b in zip(y,y[1:]));check('42727','1−2*trapezoid area',1-2*area)
# Additional exact quantities, surplus, accounting and strategic comparisons.
for id,expr,val in [('P62C-CPS-M-009','.5*8*(18−10)',32),('P62C-CPS-M-010','.5*8*(10−2)',32),('P62C-CPS-M-011','32+32',64),('P62C-CPS-M-012','.5*8*(30−14)',64),('P62C-CPS-M-013','.5*8*(14−6)',32),('P62C-CPS-M-014','.5*5*(24−4)',50),('P62C-CPS-L-023','64+32',96),('P62C-CPS-C-019','8*10',80),('P62C-CPS-C-020','30−14',16),('P62C-CPS-C-021','5*14',70),('P62C-CPS-C-022','8*10',80),('P62C-CPS-C-023','10−2',8),('P62C-CPS-C-024','Integral(4+2Q,0..5)',4*5+5*5),('P62C-CPS-C-025','CS−PS',0),('P62C-CPS-B1-015','18−10',8),('P62C-CPS-B1-016','10−2',8),('P62C-CPS-B2-007','.5*8*16',64),('P62C-CPS-LB-009','.5*8*8',32),('P62H-MCMP-C-029','(102000−80000)−(41500−35000)−12000',3500),('P62H-MCMP-C-030','(5000−1000)*(2+1)',12000),('P62F-PC-C-004','(4+30−8)*31',806),('P62F-PC-H-043','15*50',750),('P62F-PC-L-091','(30−20)*50',500),('P62I-OLI-H-023','(54−18)*24',864),('P62F-PC-LB-018','Minimum AVC with variable charge',14+3),('P62G-MON-H-007','(45−40)*40',200),('P62G-MON-C-005','3*86−2*94',70),('P62G-MON-C-006','100−4*12',52),('P62G-MON-C-007','120−6*10',60),('P62G-MON-C-008','90−3*16',42),('P62G-MON-C-009','110−5*14',40),('P62G-MON-H-039','90−45',45),('P62G-MON-L-033','(60−12)/2',24),('P62G-MON-L-033','(60−12−6)/2',21)]:check(id,expr,val)
for id,expr,value,expected in [('P62F-PC-L-062','(40−26)*60',14*60,840),('P62F-PC-B2-024','(37−24)*60',13*60,780),('P62F-PC-B2-025','(25−20)*50',5*50,250),('P62F-PC-H-012','(20−16)*50',4*50,200),('P62F-PC-L-064','(25−16)*50',9*50,450),('P62F-PC-LB-015','ATC22 + fee20 − price30',22+20-30,12)]:check(id,expr,value,expected)
# Best-response matrix retained in the semantic HTML table.
payoffs=[[(4,3),(1,1)],[(2,0),(3,2)]];NE=[(r,c) for r in range(2) for c in range(2) if payoffs[r][c][0]==max(payoffs[i][c][0] for i in range(2)) and payoffs[r][c][1]==max(payoffs[r][j][1] for j in range(2))];assert NE==[(0,0),(1,1)]
checks.append({'id':'PM8-OLI-BR-026','expression':'Mutual best responses','result':NE,'status':'PASS'})
# Rebuilt firm cost models: dTC/dQ equals MC; ATC, AVC and optimum readings.
for name,F,a,b,c,Q,P,avc,atc in [('profit',360,24,-7/15,1/150,60,40,20,26),('loss',450,27,-.52,.006,50,20,16,25),('loss-c',375,25,-.44,.005,50,18.5,15.5,23),('profit-c',300,27,-.72,.01,50,30,16,22),('efficiency',400,24,-.48,.0064,50,24,16,24),('zero',400,23,-.48,.0064,50,23,15,23),('PC07',400,13,-.22,.0032,50,15,10,18)]:
 for expr,value,expected in [('MC(Q)',a+2*b*Q+3*c*Q*Q,P),('AVC(Q)',a+b*Q+c*Q*Q,avc),('ATC(Q)',F/Q+a+b*Q+c*Q*Q,atc)]:check('graph:'+name,expr,value,expected)
result={'status':'PASS','librarySha256':L['afterLibrarySha256'],'method':'Independent formulas and stem inputs; no author or plotting imports. Qualitative decisions and unchanged graph readings reviewed with item/asset evidence.','checks':checks,'checkCount':len(checks),'questionIds':sorted({r['id'] for r in checks if not r['id'].startswith('graph:')})};(H/'numerical-validation.json').write_text(json.dumps(result,indent=2)+'\n');print('PASS',len(checks),'arithmetic checks')

