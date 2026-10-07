import json
from pathlib import Path
H=Path(__file__).resolve().parent
records={r['id']:r for r in json.loads((H/'records.json').read_text(encoding='utf-8'))}
patches={}
def edit(id,pattern,rationale,**fields):
 r=records[id];assert r['areas']==['macro'] and not r['marketGateDerived'],id
 p=patches.setdefault(id,{'patterns':[],'rationales':[]})
 if pattern not in p['patterns']:p['patterns'].append(pattern)
 if rationale not in p['rationales']:p['rationales'].append(rationale)
 for k,v in fields.items():assert k in ('q','options','feedback','difficulty','canonicalDifficulty');p[k]=v
def current(id,f):return patches.get(id,{}).get(f,records[id]['q'].get(f,''))
def replace(id,pattern,reason,f,old,new):
 v=current(id,f)
 if isinstance(v,list):assert any(old in s for s in v),(id,old);v=[s.replace(old,new) for s in v]
 else:assert old in v,(id,old);v=v.replace(old,new)
 edit(id,pattern,reason,**{f:v})
def key(id,text,reason='Remove explanation or redundant setup from the keyed alternative; retain its economic conclusion and the explanation in feedback.'):
 opts=current(id,'options').copy();opts[records[id]['key']]=text
 edit(id,'answer-choice parallelism',reason,options=opts)

edit('PMOE-FX-B1-003','internal taxonomy','Faculty repair: ask directly about the determinant of currency supply; preserve the Easy checkpoint.',q='In the standard open-economy model, what causes the supply of dollars in the foreign-exchange market to shift?',options=['A change in net capital outflow.','A change in the current exchange rate.','A change in domestic consumption alone.','A change in the domestic price level alone.'],feedback='Net capital outflow determines the supply of domestic currency in the foreign-exchange market. A change in net capital outflow shifts that supply.')
edit('PMOE-FX-B1-003','noun stack','Replace the compressed curve label with ordinary prose.')
edit('LG-Q-9024','internal taxonomy','Faculty repair: ask why actual deposit expansion can fall short of the simple multiplier prediction.',q='Why can the actual increase in bank deposits be smaller than the simple money multiplier predicts?',options=['Banks may hold excess reserves, and the public may hold some funds as currency.','Fractional reserve banking gives the Fed exact control over the quantity of bank deposits.','The simple money multiplier applies only when banks lend commodity money to the public.','Currency withdrawn by the public adds to bank reserves and allows banks to lend more.'])
edit('LG-Q-9024','answer-choice parallelism','Give all four alternatives a direct causal form without adding explanation only to the key.')
edit('ECON-SP-EASYBOSS-2014','internal taxonomy','Faculty repair: state the reserve and currency leakages and ask for the resulting money increase; preserve the checkpoint.',q='After the Fed buys bonds, banks hold some of the additional reserves as excess reserves and households keep some of the proceeds as currency. How will the resulting increase in the money supply compare with the simple multiplier prediction?')
edit('PMOE-POL-L-003','overloaded multi-task','Faculty repair: make the observed $20 billion rebound one accounting-consistency decision. The required $27 billion and the $7 billion discrepancy remain in feedback.',q='A trade restriction initially lowers targeted imports by $64 billion. After exchange-rate adjustment, exports are $37 billion lower. Saving and investment are unchanged. If other imports rise by only $20 billion, what does this imply?',options=['The figures are consistent: unchanged net exports require other imports to rise by $101 billion.','The figures are consistent: the $20 billion increase leaves net exports unchanged.','The figures are inconsistent: unchanged net exports require other imports to rise by $27 billion.','The figures imply greater net capital outflow: unchanged net exports require a $37 billion increase.'])
edit('PMOE-POL-L-003','answer-choice parallelism','Use four consistency judgments; keep the correct index and all relevant numerical alternatives.')
edit('PMOE-POL-L-003','difficulty','Legendary → Hard: one NX = S − I consistency task requires signed import/export arithmetic, not independent mechanisms or advanced transfer.',difficulty='hard',canonicalDifficulty='hard')
edit('43263','noun stack','Faculty repair: describe the household incentive and ask directly about loanable funds.',q='A tax incentive encourages households to save more for retirement. What happens in the market for loanable funds?')
edit('43263','internal taxonomy','Remove the internal loanable-funds effect label.')
edit('43261','actor wrapper','Faculty repair: ask directly whether the equilibrium change measures the shift at a common interest rate.',q='In the graph, the equilibrium quantity of loanable funds falls from 100 to 80. Does this mean the supply of loanable funds shifted left by 20 units?',options=['No. At a common interest rate, supply shifts left by 60 units.','No. At a common interest rate, supply shifts left by 40 units.','Yes. With investment demand fixed, the equilibrium decline measures the supply shift.','No. The 40-unit horizontal difference measures a shift in investment demand.'])
edit('43261','noun stack','Replace saving-supply shift with a direct description of supply.')
edit('43261','answer-choice parallelism','State the competing measurements concisely; the original feedback explains the equilibrium movement and the 40-unit shift.')
edit('ECON-NL-SUBSTITUTION-BIAS-6011','difficulty','Faculty decision: Medium → Hard. Compare changes in the original and equally satisfactory substitute baskets, then interpret their difference as substitution bias. Keep bridge placement and structural difficulty label.',canonicalDifficulty='hard')
edit('LG-B-6023','internal taxonomy','Faculty repair: state fixed prices as an assumption. Retain that $80 is the total crowding-out offset including induced effects, so it is not multiplied again.',q='An economy has a $250 demand gap. Fiscal policy would increase aggregate demand by $300, but crowding out reduces that increase by a total of $80, including induced spending effects. Assume the price level is fixed. How much of the original demand gap remains?')
edit('LG-B-6023','noun stack','Replace the planning-model label with the economic assumption.')
edit('ECON-SP-ELITE-320','graph narration','Faculty repair: retain the three economically necessary stages and price-P comparison, but remove repeated narration of the figure.',q='The graph shows aggregate demand before fiscal expansion (AD1), after the direct increase in government purchases (AD2), and after the multiplier effect (AD3). At price P, how large can a positive crowding-out effect be if final demand must remain strictly between AD2 and AD3?',options=['Less than about half of the total increase.','Exactly half of the total increase.','More than half but less than the total increase.','Equal to the total increase.'],feedback='At price P, the AD2-to-AD3 distance is approximately half of the full AD1-to-AD3 increase. Positive crowding out moves demand left from AD3. To remain strictly between AD2 and AD3, that reduction must be smaller than the AD2-to-AD3 distance, leaving some of the additional spending generated by the multiplier.')
edit('ECON-SP-ELITE-320','answer-choice parallelism','Faculty alternatives keep explanations in feedback and make the four bounds parallel.')
edit('ECON-SP-ELITE-320','overloaded multi-task','Ask for the bound once; explain why in feedback.')
edit('ECON-SP-ELITE-320','noun stack','Replace induced-spending gain with ordinary explanatory prose.')
edit('ECON-SP-ELITE-320','difficulty','Elite → Hard: interpret horizontal graph distances and apply a bounded crowding-out condition. The shorter task requires substantive graph reasoning but no competing unknown mechanisms.',difficulty='hard',canonicalDifficulty='hard')

# Additional exact-ID repairs after contextual review, not global replacements.
edit('PMOE-FX-E-002','internal taxonomy','Replace the internal model label with the standard economic setting.',q='In the standard open-economy model, what determines the supply of domestic currency in the foreign-exchange market?')
replace('PMOE-FX-R-001','internal taxonomy','Retain the genuine mistaken claim about vertical supply; name the model naturally.','q','In the NCO-based FX model, NCO is fixed.','In the standard open-economy model, net capital outflow is fixed.')
replace('PMOE-FX-L-005','noun stack','Retain the vertical-supply assumption, competing forces and inference task; expand the compressed noun phrase.','q','currency-supply curve','supply curve for domestic currency')
for id in ['ECON-SP-FINALBOSS-4000','ECON-SP-FINALBOSS-4019','PM2E-CH-OPEN-001','ECON-SP-LEGENDARYBOSS-9113']:
 replace(id,'internal taxonomy','Keep the immediate-versus-delayed policy comparison and all checkpoint routing; state the price assumption naturally.','q','In a fixed-price planning model MPC is 0.75.','Assume the price level is fixed and MPC is 0.75.')
 edit(id,'noun stack','Remove the planning-model noun stack.')
edit('LG-Q-255','internal taxonomy','Ask directly about the long-run effects instead of naming two curriculum constructs.',q='In the long run, how does money growth affect prices and real output?')
key('LG-Q-255','It mainly affects prices; real output depends on real resources and productivity.')
for id,f,old,new in [
 ('43246','options','saving-supply shift','shift in the supply of loanable funds'),('43246','options','investment-demand shift','shift in the demand for loanable funds'),
 ('43219','feedback','saving-supply shift','shift in the supply of loanable funds'),('43276','feedback','investment-demand shift','shift in investment demand'),('43281','feedback','investment-demand shift','shift in investment demand'),
 ('43257','feedback','saving-supply change','change in national saving'),('43307','options','investment-demand shift','shift in investment demand'),('43203','q','the investment-demand shift magnitude','how much investment demand increases')]:
 replace(id,'noun stack','Expand the compressed noun phrase without changing the shift, movement, direction or numerical reasoning.',f,old,new)
edit('43255','actor wrapper','Ask directly how to classify the graph change; preserve the distinction between a movement along D0 and a shift.',q='How should the increase in investment from A to B in the graph be classified?')
replace('43255','noun stack','Describe the saving increase directly in both parallel alternatives.','options','the saving-supply shift lowers the rate','increased saving lowers the interest rate')
edit('PG3-MEQ-L-004','graph narration','Remove redundant point-list narration; retain the persistent supply shock, both fiscal targets and permission to extend the straight supply line.',q='A supply disruption shifts AS0 to AS1, moving the economy from A to D. AS1 remains fixed. Using its straight line, extended if needed, what would fiscal policy require to restore the original output versus the original price level?')

# Reviewed length outliers with a shorter equivalent keyed conclusion.
short={
'PM2D1-LRADJ-H-001':'Destroyed capital can shift LRAS left and lower potential output.',
'PM2D1-LRADJ-FB-005':'Check whether lower productive capacity shifted LRAS left.',
'P52A-AD-B3-002':'Ambiguous; the two effects oppose each other.',
'ECON-NL-EASY-21':'The cost of a fixed consumer basket over time',
'P52A-CPI-H-006':'The CPI change depends on each item’s expenditure weight.',
'ECON-NL-EASY-28':'The CPI may miss their added choice and purchasing power',
'ECON-NL-MEDIUM-128':'The CPI may miss gains from variety and purchasing power',
'ECON-NL-ELITE-328':'Some of the price increase may reflect improved quality',
'ECON-NL-LEGENDARY-9034':'Their baskets differ; the CPI’s fixed basket can introduce bias',
'P52B-S3-MEQS-B3-003':'The price level may rise further.',
'PM2A-DIS-LB-018':'No. Returning to natural unemployment does not reveal the cumulative transition cost.',
'PM2A-DIS-LB-020':'No. Comparing costs requires the size and duration of excess unemployment under each plan.',
'ECON-NL-MEDIUM-156':'Weakening property rights',
'PM2B3-POL-L-002':'More capital raises output, but does not guarantee sustained productivity growth.',
'LG-Q-9066':'AD shifts right $70 billion directly and $350 billion in total.',
'LG-Q-9073':'Direct increase: $100 billion; gross increase: $250 billion; net increase: $175 billion.',
'P52A-FISCAD-EL-002':'The allocation between the two groups',
'PM2C2-FISH-M-003':'Expected inflation influenced the nominal rate; actual inflation determines the realized real return.',
'PM2C2-FISH-L-002':'It should rise because the equilibrium real interest rate rose.',
'PMOE-FX-EL-001':'Whether supply contracted more than demand at the original exchange rate',
'ECON-NL-HARD-211':'Consumption: +$40,000; net exports: −$40,000; GDP: unchanged',
'ECON-NL-ELITE-312':'The condo counts as investment; the tax is excluded',
'ECON-NL-EASY-1':'A buyer’s spending becomes a seller’s income',
'ECON-NL-MEDIUM-102':'A customer spends $40 on a meal, giving the restaurant $40 in revenue',
'ECON-NL-LEGENDARYBOSS-9102':'No. The farm adds $48, bringing total value added to $88.',
'PM2B2-INDEX-LB-001':'No. Current CPI can still understate this recipient’s cost increase.',
'LG-Q-247':'Inflation leads firms to spend resources updating prices.',
'LG-Q-345':'Individual prices adjust at different times and rates.',
'LG-Q-248':'Because individual prices adjust at different times and rates.',
'PM2C2-ICOST-H-001':'Unexpected inflation benefits the borrower; repricing uses real resources even when inflation is anticipated.',
'ECON-SP-LEGENDARYBOSS-9101':'Both lose 6% cumulatively and have the same cumulative sacrifice ratio',
'PMOE-TX-H-003':'It shows imports exceed exports, without establishing the change in domestic output',
'PMOE-TX-EL-001':'Their signs are uncertain, but NX and NCO must be equal',
'ECON-NL-EASY-78':'Creates excess labor supply at an above-equilibrium wage',
'ECON-NL-MEDIUM-176':'It supports income while workers seek better matches',
'ECON-NL-LEGENDARY-9077':'Duration fell, but the benefit extension’s separate effect is unknown',
'PM2C3-LPMM-L-002':'Excess money supply prompts asset purchases, lowering interest toward r3.',
'PM2C3-LPMM-L-003':'Excess money demand prompts asset sales, raising the interest rate toward r2.',
'PM2C3-LPMM-L-005':'A lower interest rate means movement along money demand, unless another determinant changed.',
'ECON-NL-LEGENDARY-9047':'No. Cedar averages $25,000 and Delta $20,000; neither average describes every resident.',
'PM2D1-LRADJ-M-001':'Rising wages and input costs shift SRAS left; AD stays unchanged.',
'LG-Q-216':'makes holding reserves more attractive relative to lending',
'LG-Q-227':'Creating money does not automatically create real goods and services.',
'LG-Q-327':'Banks may still consider borrowers too risky.',
'LG-Q-9015':'Risk concerns can outweigh the incentive of cheaper borrowing.',
'LG-Q-137':'Money growth can raise nominal wages while long-run real wages stay unchanged.',
'PM2C2-NEUT-M-001':'It can return to about its previous level.',
'LG-Q-9113':'No. Excess reserves fall from $220 to $110, but lending was already constrained by credit standards.',
'ECON-SP-CHOOSE-FED-TOOL-EFFECT-6007':'Reserves can rise while deposit expansion falls short of the simple multiplier prediction',
'LG-Q-265':'Near-zero interest rates leave little room for traditional cuts.',
'LG-Q-366':'Lowering interest rates enough to stimulate investment',
'LG-Q-1':'It serves as a medium of exchange',
'LG-Q-107':'Bank-held currency is reserves; public-held currency is circulating money.',
'PMOE-POL-L-004':'Its direction is uncertain because the two forces affect NCO in opposite directions',
'PMOE-POL-L-001':'NCO may rise; the deficit alone cannot establish the currency or NX response',
'PMOE-POL-LB-003':'It rises $45 billion; the demand shock changes the exchange rate',
'PMOE-POL-BR-001':'The direction is uncertain: higher government purchases compete with lower investment and net exports',
'ECON-NL-EASY-47':'It allows more output per worker',
'LG-Q-230':'spending or lending it, raising demand and prices',
'LG-Q-9027':'People spend or lend excess money, raising demand and prices until the money market clears.',
'LG-Q-329':'Real factors determine long-run output; extra money mainly raises prices.',
'ECON-NL-MEDIUM-115':'Nominal GDP rises; real GDP stays unchanged using year 1 prices',
'P52A-AS-M-003':'Output prices rise before wages, lowering real labor costs.',
'ECON-NL-MEDIUM-153':'A production method requiring fewer inputs per unit',
'ECON-NL-LEGENDARY-9056':'A improved technological knowledge; B improved human capital',
'ECON-NL-LEGENDARYBOSS-9120':'No; the third gain includes a change in technology',
'LG-Q-84':'policy lags can make intervention arrive too late',
'LG-Q-380':'Both policies shift AD left, worsening the recession.',
'PM2D2-STAB-L-001':'The stimulus may arrive after recovery and push demand beyond potential output.',
'LG-R-5056':'It can push demand beyond potential output after recovery.',
'ECON-NL-HARD-263':'The lower rate may reflect discouraged workers rather than improvement',
'ECON-NL-LEGENDARY-9068':'No. Employment falls to 132; unemployment is about 7.0% and participation 71%.',
'ECON-NL-LEGENDARY-9070':'Employment falls by 9.4 despite the unchanged unemployment rate',
'ECON-EC-FINALBOSS-19021':'The labor force grew faster than employment',
'ECON-NL-EASY-71':'Time spent searching for a suitable job',
'ECON-NL-HARD-272':'An accountant leaves a job and searches for another locally'
}
for id,s in short.items():
 # General/Macro shared records are reported, not needed for this Macro-only pass.
 if records[id]['areas']==['macro']:key(id,s)

# Avoid making compound reasoning a giveaway by giving all alternatives the same form.
edit('P52A-AD-H-002','answer-choice parallelism','Use parallel price-level/tax responses; preserve shift-versus-movement reasoning.',options=['Price level: movement along AD; taxes: movement along AD.','Price level: AD shifts right; taxes: AD shifts left.','Price level: movement along AD; taxes: AD shifts left.','Price level: AD shifts left; taxes: AD shifts left.'])
edit('PG3-MEQ-M-004','answer-choice parallelism','Give all options the same two-coordinate format, preserving the original direction distractors.',options=['Real GDP: 100 to 115; price level: 125 to 110.','Real GDP: 115 to 100; price level: 110 to 125.','Real GDP: 100 to 115; price level: 110 to 125.','Real GDP: 115 to 100; price level: 125 to 110.'])
edit('LG-Q-9051','answer-choice parallelism','Keep the four-link policy mechanism in concise parallel clauses; graphical labels remain in the figure and feedback.',options=['Money supply falls; interest rises; AD falls; output falls.','Money supply rises; interest falls; AD rises; output rises.','Money demand falls; interest falls; investment rises; AD rises.',records['LG-Q-9051']['q']['options'][3]])
(H/'patches.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Authored',len(patches),'exact-ID revisions')
