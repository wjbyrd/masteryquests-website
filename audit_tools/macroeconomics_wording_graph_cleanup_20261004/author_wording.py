import json,re
from pathlib import Path
H=Path(__file__).resolve().parent
scope=json.loads((H/'scope.json').read_text(encoding='utf8'))
original=json.loads((H/'originals.json').read_text(encoding='utf8'))
patches={}; reviews={}
keys={s['question_id']:'ABCD'.index(s['correct_answer_letter']) for f in scope['findings'] for s in f['current']}
def put(i,stem=None,options=None,feedback=None,**review):
 q=patches.setdefault(i,{'q':original[i]['q'],'options':original[i]['options'][:],'feedback':original[i].get('feedback',''),'correct_index':keys[i]})
 if stem is not None:q['q']=stem
 if options is not None:q['options']=options
 if feedback is not None:q['feedback']=feedback
 reviews.setdefault(i,{}).update(review)
def sub(i,a,b):
 put(i)
 q=patches[i]
 for f in ['q','feedback']:q[f]=q[f].replace(a,b)
 q['options']=[x.replace(a,b) for x in q['options']]
def group(seed,changes):
 f=next(f for f in scope['findings'] if seed in f['question_ids'] and f['category'] in 'ABC')
 for i in f['question_ids']:
  for a,b in changes:sub(i,a,b)
  reviews[i]['wording']='Replaced the identified wording while preserving the economics and stated assumptions.'

# H first: preserve the original key and all institutional assumptions.
i='PM2E-CH-FINAL-002'; opts=original[i]['options'][:]
opts[2]='Demand restraint can lower inflation without an additional output cost because the original loss of output came from supply.'
put(i,options=opts,feedback='An adverse supply shock raises inflation while reducing output and employment. Supporting demand can limit the output loss but add inflation pressure; restraining demand can reduce inflation pressure but deepen the output loss. The fact that the original shock came from supply does not remove the output cost of demand restraint.',high_priority='Removed a true subset of the key; the rival now confuses the source of the original shock with the effect of the policy response.')
put('LG-Q-358',stem='Money demand increases while the money supply remains fixed. What is the likely effect on the interest rate and interest-sensitive investment?',high_priority='Supplied the missing rightward-demand premise; no image added.')

group('ECON-SP-MEDIUM-139', [('If a price-level increase raises money demand, the interest rate rises, and investment falls. This explains:', 'A higher price level raises money demand and the interest rate, reducing investment. Which feature of aggregate demand does this explain?')])
group('P52A-AD-B1-001',[('Which two-part diagnosis distinguishes these events?','How does each change affect the AD curve?')])
group('P52A-AD-B1-003',[('Which aggregate-demand assessment uses both channels?','What can be concluded about aggregate demand when both changes occur?')])
for seed in ['LG-Q-2007','P52A-BANK-B2-001','P52A-BANK-B3-001','LG-Q-2011']:
 f=next(f for f in scope['findings'] if seed in f['question_ids'] and f['category'] in 'ABC')
 for i in f['question_ids']:
  put(i);patches[i]['q']=re.sub(r'\b(deposits|reserves|assets|deposit liabilities|capital) (\$)',r'\1 of \2',patches[i]['q']);reviews[i]['wording']='Added missing prepositions to balance-sheet amounts.'
group('43100',[('Which revision and limit follow?','How does the projected deficit change, and does the revision show that debt has already been repaid?')])
group('ECON-SP-LEGENDARY-9002',[('Which interpretation survives?','How does the policy affect output and the price level?')])
group('ECON-SP-HARD-214',[('Expansionary gap','Inflationary gap')])
group('ECON-SP-CALCULATE-REQUIRED-RESERVES-6004',[('$8,000 deposits and $1,200 reserves','$8,000 in deposits and $1,200 in reserves')])
group('LG-B-6003',[('$900,000 deposits and $100,000 reserves','$900,000 in deposits and $100,000 in reserves')])
group('43122',[('Which fiscal-data comparison keeps debt service concepts distinct?','How much is interest expense, and how should the principal repayment be treated?')])
group('43151',[('Which sequence is correct at an introductory level?','How does financing a government deficit through borrowing affect public debt?')])
group('43326',[('Which statement best describes what the investment-to-capital-formation relationship explains?','What does the link between investment and capital formation tell us about productive capacity?')])
group('43302',[('Which conclusion stays within the loanable-funds mechanism rather than importing multiplier analysis?','In the loanable-funds model, how does this affect the real interest rate and private investment?')])
group('ECON-NL-EASYBOSS-2018',[('A report calls the next CPI-point increase the next inflation rate. Which pair corrects it?','A report treats the increase in CPI index points as the inflation rate. What are next year\'s CPI and inflation rate?')])
group('ECON-NL-EASYBOSS-2019',[('base comparison period','initial period')])
group('ECON-NL-LEGENDARY-9028',[('A basket agency','A statistical agency')])
group('ECON-NL-EASYBOSS-2025',[('Which real-outcome comparison follows under these estimates?','How does indexation affect the payment\'s purchasing power under these estimates?')])
group('PM2B2-BIAS-FB-005',[('What should a quality-aware comparison avoid?','How should the price change be interpreted after allowing for the improved service?')])
group('ECON-NL-EASYBOSS-2028',[('Which index selection and direction are appropriate, holding quantities fixed?','Holding quantities fixed, what happens to the CPI and GDP deflator?')])
group('ECON-NL-EASYBOSS-2029',[('Which pairing and implication are supported?','Which index should be used for each purpose, and must the two indexes move together?')])
group('P52B-S3-MEQS-B2-001',[('Which observation can be signed without their sizes?','Which direction of change can be predicted without knowing the sizes of the shifts?')])
group('P52A-BANK-M-006',[(' as the relevant economic conclusion','')])
group('LG-Q-2006',[('Which correction is correct?','What is wrong with that claim?')])
group('LG-Q-2008',[('At the simple maximum','At the maximum deposit expansion predicted by this model')])
group('LG-Q-9109',[('this is not a first-bank recall amount','this is the systemwide change, not the loans recalled by the first bank')])
group('LG-R-5013',[('it does not hand the borrower a pile of reserves','reserves settle payments between banks rather than being placed in the borrower\'s deposit account')])
group('PM2A-DIS-L-010',[('returns to natural','returns to its natural rate'),('Which synthesis is correct?','What is the sacrifice ratio, and is the unemployment increase permanent?')])
group('PM2A-DIS-EB-012',[('initial unemployment excursion','temporary increase in unemployment'),('the excursion','the temporary increase')])
group('PM2A-DIS-EB-013',[('Unemployment costs have unwound','The temporary increase in unemployment has ended'),('Unemployment costs cannot unwind','The temporary increase in unemployment cannot end'),('the labor cost has unwound','the temporary increase in unemployment has ended')])
group('ECON-SP-MONETARY-POLICY-PC-TRANSITION-6047',[('Which family links explain the transition?','How do the short-run and long-run Phillips curves explain this adjustment?')])
group('PM2B3-POL-FB-005',[('current stabilization and future capacity benefits are different margins in allocating scarce resources','stabilizing current demand and increasing future productive capacity are distinct benefits')])
group('ECON-SP-MEDIUM-146',[('first-pass AD increase','total increase in aggregate demand')])
group('LG-Q-9068',[('how does the order of AD shifts change?','how do the initial and total increases in aggregate demand change?')])
group('LG-Q-3007',[('signed nominal rate','contractual nominal rate')])
group('ECON-NL-EASYBOSS-2007',[('Which C, inventory-I and GDP entries are consistent?','How do the sales and inventory change enter consumption, investment and GDP?')])
group('ECON-EC-EASYBOSS-17011',[('For domestic GDP, which ledger is correct?','Which output counts in domestic GDP?')])
group('ECON-NL-INCOME-EXPENDITURE-IDENTITY-6000',[('wages $140 and rent/interest $30','wages of $140 and rent and interest of $30'),('income ledger','income account')])
group('LG-Q-355',[('best elite-level correction','best response')])
group('LG-Q-254',[('shoe-leather, menu, tax, signal, and redistribution costs','shoe-leather and menu costs, tax distortions, distorted relative-price signals, and redistribution')])
group('ECON-SP-HARD-269',[('Which answer best connects Chapters 34 and 36 during a demand expansion?','In the short run, how does a demand expansion affect output, unemployment and inflation in the AD-AS and Phillips-curve models?')])
group('ECON-SP-FINALBOSS-4023',[('Use approximate growth accounting.','Use the growth-rate approximation to the quantity equation, MV = PY.'),('Which pair corrects both steps','What are velocity growth and the nominal interest rate')])
group('PMOE-TX-B3-001',[('A trade ledger reports','The trade accounts report'),('reconciles the ledgers','makes the trade figures consistent with saving and investment')])
group('ECON-NL-FINALBOSS-4022',[('Longer search raises frictional costs; better retention adds nothing; welfare necessarily falls.','Longer job searches are costly, and improved retention provides no offsetting benefit, so welfare must fall.'),('Longer search raises frictional costs; better retention adds benefits; welfare needs both.','Longer job searches are costly, but improved retention provides a benefit; both matter for welfare.'),('Better retention adds benefits; longer search adds no cost; welfare necessarily rises.','Improved retention provides a benefit, and longer job searches have no cost, so welfare must rise.'),('Longer search is cyclical; better retention is structural; frictional costs remain unchanged.','Longer searches raise cyclical unemployment, while improved retention affects only structural unemployment.')])
group('ECON-NL-FINALBOSS-4026',[('twenty additional jobs leave ten unfilled requests','twenty additional jobs still leave ten workers unable to find a job')])
group('PM2B4-LMI-BR-001',[('What family-level implication follows?','How can this affect frictional unemployment and the natural rate?')])
group('LG-Q-4001',[('sign the rate change','determine whether the interest rate rises or falls')])
group('PM2C3-LPMM-BR-001',[('What is the next step if the student is bridging from the money market to monetary-policy transmission?','How does the higher interest rate affect investment and aggregate demand?')])
group('ECON-NL-RULE-OF-70-5032',[('Which doubling-time question can be answered with the Rule of 70?','What can the Rule of 70 estimate?')])
group('ECON-SP-IDENTIFY-LRAS-6021',[('A110-unit','A 110-unit'),('A10-unit','A 10-unit')])
group('LG-Q-9024',[("Chapter 30's banking model",'the simplified deposit-multiplier model')])
group('ECON-SP-LEGENDARY-9027',[('What correction survives?','How did workers\' real wages change?')])
group('P52B-S3-MPT-B2-001',[('Which assessment avoids assigning a mechanical loan-growth result?','What can be concluded about bank lending?'),('holding incentives strengthen','holding reserves becomes more attractive'),('holding incentives are irrelevant','the return on reserves is irrelevant')])
group('LG-Q-4005',[('supplies 40 of reserves','adds $40 to bank reserves'),('supplies 120 of reserves','adds $120 to bank reserves'),('Which policy assessment respects the transmission stages?','What happened to reserves, credit and spending?')])
group('LG-B-6000',[('Which ordered mapping correctly identifies the function used in each action?','Which function of money is used in each action, in that order?'),('Unit of account','unit of account')])
group('PM2B4-NRU-MB-004',[('the cyclical point disappears','the one percentage point of cyclical unemployment disappears')])
group('PMOE-POL-EL-002',[('Can the net AD change be signed without response magnitudes?','Can the direction of the net change in aggregate demand be determined without knowing the strength of each response?')])
group('PMOE-POL-L-002',[('Reconstruct the rate-induced NCO feedback and FX outcome with NX demand and price levels fixed.','With net-export demand and price levels fixed, how does the interest-rate response offset the initial capital flight, and what happens to the currency?')])
group('ECON-NL-MEDIUMBOSS-3006',[('Which conclusion follows about labor hours and its limit?','How many labor hours are needed after both changes?')])
f=next(f for f in scope['findings'] if 'LG-Q-3000' in f['question_ids'])
for i in f['question_ids']:
 put(i);patches[i]['q']=re.sub(r'Money is initially (\$[\d,]+), velocity (\d+) and real output (\d+)\.',r'The money supply is initially \1, velocity is \2, and real output is \3 units.',patches[i]['q'])
group('P52B-S4-QTM-B1-001',[('money-growth factor','money-growth rate')])
f=next(f for f in scope['findings'] if 'ECON-SP-MEDIUMBOSS-3012' in f['question_ids'])
for i in f['question_ids']:
 put(i);patches[i]['q']=re.sub(r"percentages of one year's output (\$[\d,]+)",r"percentages of the same benchmark annual output of \1",patches[i]['q'])
group('PM2A-SAC-LB-024',[('A3-point','A 3-point'),('which claim about the original target and budget survives?','how much more disinflation fits the budget, and what would achieving the original target cost?')])
group('43192',[('Using the same economy with','In an economy with')])
group('43168',[('Which national-accounts distinction and financing inference are correct?','Which purchase counts as investment in GDP, and how can saving help finance it?')])
group('P52A-AS-B2-003',[('Which correction identifies the axis-variable error?','Why should this be shown as a movement along SRAS instead?')])
group('LG-R-5056',[('What problem should the student diagnose?','What risk does the delayed stimulus create?')])
group('LG-R-5058',[('what tradeoff should the student remember?','what tradeoff do policymakers face?')])
group('ECON-NL-LEGENDARY-9067',[('outsiders','adults previously outside the labor force')])
group('ECON-NL-FINALBOSS-4039',[('An economist synthesizes this evidence:','Consider three labor-market observations:'),('What is the combined lesson?','What do these observations tell us about labor-market conditions?')])
# Families with varying amounts need a unit correction, not a fixed-number substitution.
for i in next(f['question_ids'] for f in scope['findings'] if 'LG-Q-4005' in f['question_ids']):
 patches[i]['q']=re.sub(r'supplies (\d+) of reserves',r'adds $\1 to bank reserves',patches[i]['q'])
assert all(i in patches for f in scope['findings'] if f['category'] in 'ABCH' for i in f['question_ids'])
unchanged=[i for i,q in patches.items() if all(q[k]==original[i].get(k) for k in ['q','options','feedback'])]
print('Wording/H drafts',len(patches),'unchanged',unchanged)
(H/'patches.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2),encoding='utf8')
(H/'reviews.json').write_text(json.dumps(reviews,ensure_ascii=False,indent=2),encoding='utf8')
