"""Independent calculations for replacement models and key revised arithmetic.

Does not import the plotting generator or compute keys from answer strings.
Other unchanged calculations/qualitative decisions were reviewed item by item.
"""
from review_tools import *
from math import isclose
checks=[]
def check(ids,description,actual,expected,tolerance=1e-8):
    assert isclose(actual,expected,abs_tol=tolerance),(description,actual,expected)
    checks.append({'ids':ids.split(), 'calculation':description,'actual':actual,'expected':expected,'tolerance':tolerance,'status':'PASS'})
check('PG2-STX-M-002','Buyer burden = 13.5 - 10.5',13.5-10.5,3)
check('PG2-STX-M-002','Seller burden = 10.5 - 7.5',10.5-7.5,3)
check('P62B-ELAS-H-034','Point elasticity at C = (120/16)*(12/30)',120/16*12/30,3)
check('P62B-ELAS-H-034','Point elasticity at A = (120/16)*(4/90)',120/16*4/90,1/3)
check('P62B-ELAS-B1-019 P62B-ELAS-EL-033 P62B-ELAS-L-093','Revenue at B = 8*60',8*60,480)
check('P62B-ELAS-L-093','Revenue at A with capacity 70 = 4*min(90,70)',4*min(90,70),280)
for p in (7.9,8.1):
    assert p*(120-7.5*p)<480
check('P62F-PC-H-043','TR at firm output 50 = 15*50',15*50,750)
check('P62F-PC-EL-039','Market quantity is 75 thousand = 75000',75*1000,75000)
check('P62F-PC-B3-055 P62F-PC-M-043','PC06 MC(90) = 8 - (22/90)*90 + (3/450)*90^2',8-22/90*90+3/450*90**2,40)
check('P62F-PC-B3-055','PC06 ATC(90) = 450/90 + 8 - (11/90)*90 + 90^2/450',450/90+8-11/90*90+90**2/450,20)
check('P62F-PC-B3-055','PC06 profit = (40 - 20)*90',(40-20)*90,1800)
check('P62F-PC-EL-043','PC08 MC(50) = 17 - .32*50 + .0096*50^2',17-.32*50+.0096*50**2,25)
check('P62F-PC-H-015 P62F-PC-L-068 P62F-PC-LB-013','Legacy market-firm variant 1: MC(62)',35-1.4*62+(96.8/62**2)*62**2,45)
q=62;avc=35-.7*q+96.8/(3*62**2)*q*q;atc=avc+400/q
assert 23<avc<25 and 29<atc<31 and 45>atc>avc
check('P62F-PC-EL-018','Legacy market-firm variant 2: MC(61) = $42',36-1.3*61+(85.3/61**2)*61**2,42)
check('P62G-MON-H-001 P62G-MON-H-002 P62G-MON-H-003 P62G-MON-H-004','MON01 MR(36) = 60 - 36',60-36,24)
check('P62G-MON-H-001 P62G-MON-H-002 P62G-MON-H-003 P62G-MON-H-004','MON01 MC(36) = 15 + .25*36',15+.25*36,24)
check('P62G-MON-H-001 P62G-MON-H-002 P62G-MON-H-003 P62G-MON-H-004','MON01 price = 60 - .5*36',60-.5*36,42)
check('P62G-MON-H-002 P62G-MON-H-004 P62G-MON-H-005','MON01 initial profit = (42 - 27)*36',(42-27)*36,540)
check('P62G-MON-H-004','Profit after fixed cost +360 = 540 - 360',540-360,180)
check('P62G-MON-H-005','Profit after fixed cost +540 = 540 - 540',540-540,0)
check('P62G-MON-M-037 P62G-MON-H-006 P62G-MON-H-007 P62G-MON-H-008','MON02 price at MR=MC output 40 = 60 - .5*40',60-.5*40,40)
check('P62G-MON-H-006 P62G-MON-H-007 P62G-MON-H-008','Variant AVC(40) = 10 + .125*40',10+.125*40,15)
check('P62G-MON-H-006 P62G-MON-H-007 P62G-MON-H-008','Variant ATC(40) = 1200/40 + 10 + .125*40',1200/40+10+.125*40,45)
check('P62G-MON-H-006','Contribution toward fixed cost = (40 - 15)*40',(40-15)*40,1000)
check('P62G-MON-H-007 P62G-MON-H-008','Operating loss = (45 - 40)*40',(45-40)*40,200)
check('P62G-MON-H-011','Marginal surplus at Q48 = (60 - .5*48) - (15 + .25*48)',60-.5*48-(15+.25*48),9)
check('P62G-MON-H-012','Deadweight loss = .5*(60 - 36)*(42 - 24)',.5*(60-36)*(42-24),216)
check('P62G-MON-H-041','Demand equals MC at Q90: 74 - .6*90',74-.6*90,20)
check('P62G-MON-H-041','One firm total cost at Q90 = 180 + 20*90',180+20*90,1980)
check('P62G-MON-H-041','Two firms total cost at Q45 each = 2*(180 + 20*45)',2*(180+20*45),2160)
check('P62H-MCMP-L-093','Imposed Q36 and price15.5: profit = (15.5 - 27)*36',(15.5-27)*36,-414)
check('P62F-PC-B1-019','Profit per unit = price30 - ATC20',30-20,10)
check('P62F-PC-L-095','Shutdown gap = min AVC20 - price10',20-10,10)
check('P62F-PC-LB-017','Per-unit subsidy: net receipt12 + subsidy7',12+7,19)
check('P62F-PC-LB-018','Variable-cost increase: minAVC14 + 3',14+3,17)
check('P62I-OLI-LB-021','Cartel deviation gain = (58 - 20)*11 - (60 - 20)*10',(58-20)*11-(60-20)*10,18)
check('P62I-OLI-LB-024','Cartel deviation gain = (80 - 30)*13 - (85 - 30)*11',(80-30)*13-(85-30)*11,45)
result={'status':'PASS','checks':checks,'scopeNote':'Independent formula checks supplement the item-level manual economics/graph review; they are not an automated proof of every semantic claim.'}
(EVIDENCE/'numerical-validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
print('PASS:',len(checks),'independent numerical checks')
