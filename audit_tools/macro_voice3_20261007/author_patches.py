"""Bounded, individually reviewed Macro prose edits; no canonical mutation here."""
import json,pathlib,re
D=pathlib.Path(__file__).resolve().parent
rows=json.loads((D/'records.json').read_text(encoding='utf-8')); by={r['id']:r for r in rows}; patches={}
def edit(id,pattern,reason,**fields):
 r=by[id];assert r['areas']==['macro'] and not r['marketGateDerived']
 p=patches.setdefault(id,{'patterns':[],'rationales':[]})
 if pattern not in p['patterns']:p['patterns'].append(pattern)
 if reason not in p['rationales']:p['rationales'].append(reason)
 p.update(fields)
def replace(id,old,new,pattern='Meta/textbook',field='q',reason=None):
 text=patches.get(id,{}).get(field,by[id]['q'][field]);assert old in text,(id,old)
 edit(id,pattern,reason or 'Replace course/meta wording with the actual economic assumption; preserve all inputs and the task.',**{field:text.replace(old,new)})
def options(id,values,reason='Put competing results in the alternatives and retain the explanation in feedback.'):
 edit(id,'Answer-choice parallelism',reason,options=values)
def key(id,value,reason='Shorten the keyed result without removing an economic condition; the feedback retains the explanation.'):
 o=patches.get(id,{}).get('options',by[id]['q']['options']).copy();o[by[id]['key']]=value;options(id,o,reason)

# Explicit faculty seeds and the closely related multiplier family.
for id,invest,fiscal in [('LG-Q-4004',30,60),('P52B-S4-MPTX-B1-003',70,140),('PM2C3-MPTX-LB-001',110,220)]:
 edit(id,'Meta/textbook','Name monetary easing directly; distinguish the multiplied investment increase from the already-total fiscal contraction.',q=f'Suppose monetary easing lowers the interest rate and increases investment by ${invest}. At the same time, fiscal tightening reduces aggregate demand by a total of ${fiscal} after induced effects. If the spending multiplier on the investment increase is 3, what is the net effect on aggregate demand?',feedback=f'The ${invest} increase in investment raises AD by 3 × ${invest} = ${invest*3}. The ${fiscal} fiscal contraction is already stated as a total effect, so subtract it once. Net AD rises by ${invest}.')
 old=by[id]['q']['options'];new=[]
 for s in old:
  m=re.search(r'AD (?:rises|falls) (?:by )?\$[\d,]+',s);assert m,(id,s);v=m.group(0);v=re.sub(r'AD (rises|falls) (?!by)',r'AD \1 by ',v);new.append(v+'.')
 options(id,new)
edit('P52B-S1-LRPC-L-002','AI abstraction','Replace decomposition/durable wording with three direct economic questions. Two differences plus natural/cyclical unemployment and expectations adjustment support Hard; preserve the legendary structural role and source metadata.',q='A labor-market reform lowers the natural unemployment rate from 6.4% to 5.6%. At the same time, an unexpected demand expansion pushes actual unemployment down to 4.9%. After inflation expectations fully adjust, the reform remains in place and there are no new demand surprises. How much did the natural rate change, how large was the temporary unemployment gap, and where does unemployment settle in the long run?',difficulty='hard',canonicalDifficulty='hard')
options('P52B-S1-LRPC-L-002',['Natural rate falls 1.5 points; no temporary gap; long-run unemployment is 4.9%.','Natural rate is unchanged; temporary gap is 1.5 points; long-run unemployment is 6.4%.','Natural rate falls 0.8 point; temporary gap is 0.7 point; long-run unemployment is 4.9%.','Natural rate falls 0.8 point; temporary gap is 0.7 point; long-run unemployment is 5.6%.'])
edit('43313','Graph state','Establish A/S0/D0 as initial and B/S1/D1 as final; preserve the graph-specific result and the general relative-shift qualification in feedback.',q='The loanable-funds market begins at A, where S0 and D0 intersect. Saving and investment demand both increase, shifting the curves to S1 and D1 and moving equilibrium to B. What happens to the real interest rate?',feedback='In this graph, the increases in supply and demand leave the equilibrium real interest rate at 6%. In general, simultaneous increases in supply and demand do not imply an unchanged interest rate; the outcome depends on the relative shifts.')
options('43313',['It rises to 8%.','It remains at 6%.','It falls below 6%.','It cannot be determined from the graph.'])

for id,old,new in [
 ('LG-Q-207','the textbook reserve-constrained model','a reserve-constrained banking model'),
 ('43098','For this exercise define T','Define T'),
 ('43098','textbook public saving','public saving'),
 ('LG-Q-9109','A textbook system','A reserve-constrained banking system'),
 ('LG-R-5013','the textbook balance-sheet effect','the balance-sheet effect'),
 ('ECON-SP-LEGENDARYBOSS-9110','a textbook multiplier of 10','an assumed deposit multiplier of 10'),
 ('LG-Q-2010','textbook maximum','theoretical maximum'),
 ('P52B-S3-MPT-B2-003','textbook maximum','theoretical maximum'),
 ('LG-R-5020','textbook effect','effect'),
 ('P52B-S3-MFM-H-001','Under standard textbook definitions, ','')]:replace(id,old,new)
for id in ['P52A-FISCAD-B1-001','P52A-FISCAD-B2-002']:replace(id,'the textbook MPC-based estimate','the estimate based on the marginal propensity to consume')
replace('LG-Q-236','A textbook says money is neutral in the long run.','Money is neutral in the long run.')
replace('LG-Q-9109',"Which statement combines the direction and meaning of the model's maximum adjustment?",'What is the maximum change in systemwide deposits under these assumptions?')
options('LG-Q-9109',['System deposits expand by up to $640.','System deposits contract by $160.','System deposits contract by $40.','System deposits contract by up to $640.'])
key('LG-R-5013','It adds a loan asset and a deposit liability.')
edit('LG-R-5013','Answer-choice parallelism','Keep the reserve-settlement distinction in feedback.',feedback=by['LG-R-5013']['q']['feedback']+' Reserves are separate interbank settlement balances.')

abstract={
 '43070':('which reconciliation is correct?','what are the budget balance, ending debt and change in cash?'),
 'PMOE-NCO-L-002':('which inference separates the observed change from the interest-rate effect?',"what is wrong with the analyst’s conclusion?"),
 'ECON-NL-FINALBOSS-4017':('Which decomposition and policy limit are consistent?','How much unemployment is natural versus cyclical, and how much would remain if weak demand were eliminated?'),
 'ECON-NL-LEGENDARYBOSS-9131':('Which decomposition avoids crediting the whole decline to demand recovery?','How did natural and cyclical unemployment each change?'),
 '43205':('Which reconciliation is consistent with national accounting?','What are realized saving and investment, including the unplanned inventory change?'),
 'LG-Q-9074':('which decomposition gives the AD shift and remaining horizontal AD gap?','what are the AD shift and remaining horizontal AD gap?'),
 'LG-Q-9139':('Which decomposition gives the net AD shift and remaining shortfall at that reference price?','What are the net AD shift and remaining shortfall at that reference price?'),
 'ECON-NL-LEGENDARY-9081':('Which decomposition and participation change are implied?','How many unemployed people found jobs, how many stopped searching, and how did labor-force participation change?')}
for id,(a,b) in abstract.items():replace(id,a,b,'AI abstraction',reason='Ask directly for the economic quantities or conclusion; preserve the linked reasoning and assumptions.')
for id in ['PM2C2-FISH-EB-003','LG-Q-9117']:
 replace(id,'which reconciliation is correct?','what happened to the expected real interest rate?','AI abstraction')
 options(id,[s.split(';')[0]+'.' if ';' in s else s.replace(' because expected and actual inflation are interchangeable','').replace(' because the real rate cannot change','')+'.' for s in by[id]['q']['options']])
for id in ['ECON-EC-EASYBOSS-17013','ECON-NL-EASYBOSS-2004','P52B-S3-GDPM-B2-003']:replace(id,'Which reconciliation is correct?',"Which calculation corrects the reviewer’s claim?",'AI abstraction')
for id in ['43169','43173','43178','43185']:replace(id,'Which saving decomposition reconciles the identity?','What are private saving, public saving, and national saving and investment?','AI abstraction')
for id in ['43171','43176','43180','43190']:replace(id,'Which reconciliation is correct?',"Which statement corrects the student’s claim?",'AI abstraction')

# Only the individually screened Macro-only noun-stack candidates are eligible.
candidates=json.loads((D/'candidates.json').read_text(encoding='utf-8'))
def natural(text):
 pairs=[('household-saving supply shift','shift in the supply of loanable funds from household saving'),('saving-supply and investment-demand curves','curves for the supply of loanable funds and investment demand'),('saving-supply schedule','supply schedule for loanable funds'),('saving-supply curve','supply curve for loanable funds'),('loanable-funds supply curve','supply curve for loanable funds'),('loanable-funds supply slope','slope of the supply curve for loanable funds'),('loanable-funds supply','the supply of loanable funds'),('loanable-funds demand','the demand for loanable funds'),('saving-supply shift','shift in the supply of loanable funds'),('saving supply','the supply of loanable funds')]
 for a,b in pairs:
  text=re.sub(a,lambda m: b[0].upper()+b[1:] if m.group(0)[0].isupper() else b,text,flags=re.I)
 text=re.sub(r'\bthe the\b','the',text,flags=re.I)
 text=text.replace('Both the supply','Both the supply').replace('reduced the supply of loanable funds puts','a reduced supply of loanable funds puts')
 return text
for r in candidates:
 if 'Noun stack' not in r['flags'] or r['areas']!=['macro'] or r['marketGateDerived']:continue
 q={**r['q'],**patches.get(r['id'],{})};fields={}
 for f in ['q','options','feedback']:
  before=q[f];after=[natural(s) for s in before] if isinstance(before,list) else natural(before)
  if after!=before:fields[f]=after
 if fields:edit(r['id'],'Noun stack','Use natural supply-of-loanable-funds phrasing; no curve, direction, numeric value or mechanism changes.',**fields)
edit('43196','Noun stack','Faculty seed: national saving rises 100 − 70 − 10 = 20; retain Hard and the original key.',feedback='Using S = Y − C − G, national saving rises by $20. Higher national saving shifts the supply of loanable funds to the right.')

graphs={
 'PG3-MEQ-E-001':'Before aggregate demand shifts from AD0 to AD1, the economy is in long-run equilibrium with SRAS0 and LRAS0. Which point shows this equilibrium?',
 'PG3-MEQ-E-002':'Before a supply-side improvement, AD0, SRAS0 and LRAS0 determine the long-run equilibrium. Which labeled point shows it?',
 'PG3-MEQ-M-002':'Following the increase in aggregate demand from AD0 to AD1, wages and expectations adjust and SRAS shifts from SRAS0 to SRAS1. With LRAS0 unchanged, which point shows the resulting long-run equilibrium?',
 'PG3-MEQ-M-003':'The economy begins at A with AD0, SRAS0 and LRAS0. A supply-side improvement shifts SRAS to SRAS1 and LRAS to LRAS1 while AD0 is unchanged. Which point shows the new long-run equilibrium?',
 'PG3-MEQ-E-003':'Before AD shifts from AD0 to AD1, which point shows equilibrium on AD0 and AS0?',
 'PG3-MEQ-L-002':'A student attributes the move from A to B to higher aggregate demand because real GDP rises. Which correction best fits the graph?',
 '43291':'The market starts at A on S0 and D0. A larger deficit lowers national saving, shifting supply from S0 to S1 while demand stays at D0. Which point shows the resulting equilibrium?',
 '43298':'The market starts at A on S0 and D0. Saving increases, shifting supply from S0 to S1 while demand stays at D0. Which point shows the resulting equilibrium?',
 '43262':'The market starts at A on S0 and D0. Saving decreases, shifting supply from S0 to S1 while demand stays at D0. Which point shows the resulting equilibrium?',
 '43260':'The market moves from A, where S0 and D0 intersect, to B. Which change could produce this move?',
 '43312':'The market begins at A on S0 and D0. Saving and investment demand increase, shifting the curves to S1 and D1. Where do the resulting curves intersect?',
 '43308':'The market moves from A to B. Which two curves shift?',
 '43305':'The market begins at A. Both the supply of loanable funds and investment demand increase, moving equilibrium to B. Which statement distinguishes the general prediction from the plotted outcome?',
 'PG4-MM-M-008':'Money supply increases from MS0 to MS1 while MD0 stays unchanged. Which point shows the resulting equilibrium?',
 'PMOE-FX-LB-003':'The market begins at A, where S0 and D0 intersect, and ends at B on S1 and D1. Compare two paths: demand shifts first, or supply shifts first. Each market clears before the second shift. Approximately how do the intermediate exchange rates differ, and does the order change the final equilibrium?'}
for id,q in graphs.items():edit(id,'Graph state','State the initial and final curve/point relationship explicitly; preserve every graph byte, coordinate and accessibility field.',q=q)
replace('PMOE-FX-EL-002','between A and B','between initial equilibrium A and final equilibrium B','Graph state',reason='Clarify the endpoint order while preserving the question about the unknown order of the two shifts.')
edit('43298','Noun stack','Use natural supply terminology in feedback.',feedback='Point B is where the new supply curve for loanable funds, S1, intersects investment demand D0.')

# High-confidence length findings. Retain longer answers when qualifications
# or linked reasoning are the construct, rather than treating flags as errors.
key('LG-Q-13','Hold only a fraction of deposits as reserves.')
key('ECON-NL-ELITE-332','CPI rises more if households buy oil.')
key('ECON-NL-MEDIUM-102','$40 of meal spending becomes $40 of restaurant revenue.')
key('LG-Q-351','Disinflation: slower price increases; deflation: a falling price level.')
edit('LG-Q-351','Answer-choice parallelism','Move the numerical illustration to feedback without losing it.',feedback='Disinflation means inflation slows, for example from 8 percent to 3 percent. Deflation means the price level actually falls.')
key('ECON-NL-LEGENDARY-9045','After 40 years, Alder is near $64,000 and Birch near $128,000.')
replace('LG-Q-9014','What is the most complete expected effect?','Overall, what effect does this policy package tend to have?','Answer-choice parallelism')
options('LG-Q-9014',['Bank borrowing and deposit creation weaken.','Bank borrowing and deposit creation expand.','Government spending rises and taxes fall.','Money demand falls to zero.'])
key('LG-Q-229','Higher prices require more money for transactions.')
key('LG-Q-9027','Spending or lending excess balances raises prices until the market clears.')
key('LG-Q-9070','AD shifts right by $150 billion; excess desired spending rises to $330 billion.')
key('PM2D2-STAB-L-004','Automatic stabilizers cushion the downturn; the delayed program may add demand after recovery.')
key('LG-Q-9139','AD shifts right by $350 billion net, leaving a $250 billion shortfall.')
key('ECON-NL-HARD-263','Discouraged workers can lower the rate without employment gains.')
replace('P52B-S3-MFM-H-001','. what happens?','. What happens?')
replace('43317','With upward-sloping the supply of loanable funds and downward-sloping investment demand','With an upward-sloping supply curve for loanable funds and a downward-sloping investment demand curve','Noun stack')
key('LG-Q-13','hold only a fraction of deposits as reserves')
options('LG-Q-9139',['AD shifts right by $350 billion net, leaving a $250 billion shortfall.','AD shifts right by $450 billion net, leaving a $150 billion shortfall.','AD shifts left by $500 billion, worsening the shortfall.','AD shifts right by only $100 billion.'])
edit('PM2D2-STAB-L-004','Answer-choice parallelism','Retain the automatic reversal with recovery in feedback.',feedback=by['PM2D2-STAB-L-004']['q']['feedback']+' Automatic stabilizers recede as the economy recovers.')
for id,n in [('43170',40),('43174',80),('43179',120),('43186',160)]:
 key(id,f'National saving falls ${n}, putting upward pressure on the real interest rate.')
options('43308',['Both curves shift right.','Both curves shift left.','Only the supply of loanable funds shifts right.','Only investment demand shifts right.'])
for id,q in {
 '43286':'The market starts at A on S0 and D0. National saving falls, shifting supply to S1 while demand stays at D0. What is the resulting real interest rate?',
 'PG3-MEQ-H-001':'The economy begins in long-run equilibrium on AD0, SRAS0 and LRAS0. Aggregate demand rises to AD1. Which sequence traces the short-run response and the long-run adjustment as wages and expectations catch up?',
 'PMOE-FX-M-002':'The market begins at A on D0 and S0. Demand shifts to D1 while S0 stays fixed. By how much does equilibrium quantity change?',
 'PMOE-FX-B2-001':'The market begins at A on D0 and S0. Demand shifts to D1 while S0 stays fixed. What is the change in equilibrium quantity?',
 'PMOE-FX-B3-001':'In the conceptual graph, the market begins where D0 and S0 intersect. Demand shifts to D1 and supply shifts to S1. Which combined outcome is shown?',
 '43270':'The market begins at A on D0 and S0. Investment demand shifts to D1 while S0 stays fixed. How does equilibrium change, and what induces savers to provide the new quantity?',
 'PG4-MM-M-009':'In the left panel, the market begins at A on MD0 and MS0. Money demand shifts to MD1 while MS0 stays fixed. After the resulting interest-rate change, what happens to spending and the output-market equilibrium on the right?',
 'LG-Q-9138':'Money supply falls from MS1 to MS2 in the displayed diagram. Compare that change with a counterfactual in which interest rates respond but firms no longer change investment. Which link would fail, and what does the original money-market panel establish?'
}.items():edit(id,'Graph state','Semantic follow-up: establish starting curves and direction explicitly rather than relying on original/after wording or subscripts; preserve the required inference.',q=q)

# Remove no-op fields and verify all edits preserve the positional key.
for id,p in patches.items():
 for f in list(p):
  if f not in ['patterns','rationales'] and p[f]==by[id]['q'].get(f):del p[f]
 assert len(p)>2,id
 if 'options' in p:assert len(p['options'])==len(set(p['options']))==4
(D/'patches.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'edits':len(patches),'optionEdits':sum('options' in p for p in patches.values())}))
