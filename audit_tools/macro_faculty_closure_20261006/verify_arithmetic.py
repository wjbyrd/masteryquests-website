import json,math
from pathlib import Path
H=Path(__file__).parent;checks=[]
def check(id,label,actual,expected):
 assert math.isclose(actual,expected,rel_tol=1e-10,abs_tol=1e-10),(id,label,actual,expected)
 checks.append({'id':id,'check':label,'actual':actual,'expected':expected,'status':'PASS'})
cases={
'LG-Q-9123': [('inflation 1',8-2,6),('inflation 2',11-2,9),('nominal raise 2',(8-2)+1,7),('real wage 1',5-(8-2),-1),('real wage 2',7-(11-2),-2)],
'LG-Q-9107':[('initial required',.10*1000,100),('initial excess',150-.10*1000,50),('new excess',(150-30)-.08*1000,40)],
'LG-Q-9122':[('corrected P1',200*5/500,2),('M2',200*1.2,240),('V2',5*.9,4.5),('nominal spending 2',240*4.5,1080),('Y2',1080/2.16,500),('inflation',2.16/2-1,.08)],
'PM2A-SRPC-EB-009':[('expected inflation',4+.5*(3-5),3)],
'PM2B3-PROD-EB-001':[('A productivity',1700/170,10),('B initial',1700/340,5),('B final',1700/(340*.6),25/3),('B percent gain',(1/.6-1)*100,200/3)],
'ECON-NL-EASYBOSS-2013':[('real GDP 1',1100/1,1100),('real GDP 2',1320/1.2,1100),('real per person change',(1/1.05-1)*100,-100/21)],
'LG-Q-9102':[('effective reserves',.1+.1,.2),('deposit capacity',140/.2,700)],
'LG-Q-9010':[('old requirement',600000*.1,60000),('new requirement',600000*.15,90000),('new excess',90000-600000*.15,0)],
'PM2B4-UTYPE-LB-001':[('old search stock',40*6,240),('new search stock',40*3,120),('reduction',40*(6-3),120)],
'PMOE-NER-LB-001':[('initial dollars',1000*1.2,1200),('final dollars',1000*1.12*1.05,1176),('return',1176/1200-1,-.02)],
'PMOE-RER-L-003':[('offsetting nominal change',-(9-3),-6),('real appreciation',-2+9-3,4)],
'ECON-SP-LEGENDARYBOSS-9110':[('initial plan',600/10,60),('revised removal',600/4,150),('sacrifice ratio',(2+1)/(6-4),1.5)],
'ECON-NL-MEDIUMBOSS-3016':[('positive diminished increment ratio',60/120,.5)],
'ECON-EC-FINALBOSS-19011':[('poor marginal contribution',60/20,3),('rich marginal contribution',30/20,1.5)],
'ECON-NL-LEGENDARYBOSS-9121':[('A initially',120/10,12),('B initially',400/20,20),('A afterward',160/10,16),('B afterward',440/20,22),('initial gap',400/20-120/10,8),('final gap',440/20-160/10,6)],
'ECON-NL-MEDIUMBOSS-3021':[('third marginal output',200-160,40),('output per worker',200/10,20)],
'ECON-NL-FINALBOSS-4016':[('cyclical percentage points',8-5,3)],
'LG-Q-9069':[('multiplier',1/(1-.75),4),('initial policy',240/(4-1),80),('revised policy',240/(4-.5),480/7)],
'ECON-EC-MEDIUMBOSS-18000':[('substitution difference',8-5,3)],
'ECON-EC-FINALBOSS-19001':[('indexed payment',1000*1.08,1080),('utility cost',1000*1.05,1050),('overcompensation',1080-1050,30)],
'PM2B2-BIAS-FB-004':[('quality adjusted relative price',1.2/2,.6),('price change',1.2/2-1,-.4)],
'ECON-NL-EASYBOSS-2035':[('real rate',7-4,3)],
'ECON-EC-MEDIUMBOSS-18004':[('expected',7-2,5),('realized',7-4,3)],
'PM2B2-RNI-MB-003':[('positive inflation surprise',5-2,3)],
'PM2B2-RNI-LB-001':[('A expected',7-2,5),('B expected',9-5,4),('A realized',7-4,3),('B realized',9-4,5),('A surprise',4-2,2),('B surprise',4-5,-1)],
'PG5-PC-L-024':[('graph slope',(1.5-2.5)/(7-5),-.5),('next inflation',1.5-.5*(7-5),.5),('nonnegative constraint',5+.5/.5,6)],
'LG-Q-9139':[('net AD',100/(1-.8)-150,350),('remaining gap',600-350,250)]}
for id,rows in cases.items():
 for label,a,e in rows:check(id,label,a,e)
result={'status':'PASS','checks':len(checks),'questionCount':len(cases),'results':checks}
(H/'numerical-validation.json').write_text(json.dumps(result,indent=2)+'\n');print('PASS',len(checks),'independent arithmetic checks across',len(cases),'changed or explicitly retained numerical tasks')
