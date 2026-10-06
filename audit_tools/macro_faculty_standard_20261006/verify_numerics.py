import json
from fractions import Fraction as F
from pathlib import Path
H=Path(__file__).resolve().parent;checks=[]
def eq(id,label,actual,expected):
 assert actual==expected,(id,label,actual,expected)
 checks.append(dict(id=id,check=label,value=str(actual),expected=str(expected),status='PASS'))
eq('43188','public saving',240-290,-50)
eq('43188','national saving',180+(240-290),130)
eq('43202','repair public saving',500-450,50)
eq('ECON-NL-MEDIUM-162','LFPR',F(150,200)*100,75)
eq('ECON-NL-MEDIUM-162','outside labor force share',F(200-150,200)*100,25)
eq('P52A-CPI-B3-003','old current CPI',F(312,260)*100,120)
eq('P52A-CPI-B3-003','old next CPI',F('343.2')/260*100,132)
eq('P52A-CPI-B3-003','inflation',F(132-120,120)*100,10)
eq('P52A-CPI-B3-003','rebased first CPI',120*F(100,120),100)
eq('P52A-CPI-B3-003','rebased second CPI',132*F(100,120),110)
eq('P52A-CPI-B3-003','rebased inflation',F(110-100,100)*100,10)
eq('PM2B2-BIAS-MB-003','quality-adjusted relative price',F(120,100)/2,F(60,100))
eq('PM2B2-BIAS-MB-003','quality-adjusted percent change',(F(120,100)/2-1)*100,-40)
eq('P52B-S4-UNEM-B2-003','initial labor force',300+30,330)
eq('P52B-S4-UNEM-B2-003','final employment',300-30,270)
eq('P52B-S4-UNEM-B2-003','final unemployment',30+30,60)
eq('P52B-S4-UNEM-B2-003','final labor force',270+60,330)
eq('P52B-S4-UNEM-B2-003','initial UR rounded',round(F(30,330)*100,1),F('9.1'))
eq('P52B-S4-UNEM-B2-003','final UR rounded',round(F(60,330)*100,1),F('18.2'))
eq('P52B-S4-STAB-B2-002','total net AD offset',60-20,40)
(H/'numerical-validation.json').write_text(json.dumps({'status':'PASS','checks':checks},indent=2)+'\n')
print('PASS',len(checks),'independent arithmetic checks across',len(set(c['id'] for c in checks)),'changed numerical items')
