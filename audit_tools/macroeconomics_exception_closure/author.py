"""Explicit 45-ID closure authoring. Stages patches only; never edits source."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent
BEFORE=json.loads((HERE/'inputs/before_targets.json').read_text())
R={x['id']:x['question'] for x in BEFORE}
PATCH={}; REVIEWS={}; CALCS={}
def patch(id,**fields):
    assert id in R
    PATCH.setdefault(id,{}).update(fields)
def task(id,stem,choices,feedback,error,operation='analysis',comparison=None,added=None,calculation=None,**metadata):
    assert len(choices)==len(set(choices))==4
    # Preserve the old keyed position where possible; no manual hash values.
    import hashlib,re
    # Position uses the previously resolved canonical key in the frozen verification evidence.
    original=R[id]
    def norm(s):return re.sub(r'\s+',' ',s.strip()).lower()
    old=[i for i,v in enumerate(original['options']) if hashlib.sha256(norm(v).encode()).hexdigest()==original['aHash']]
    pos=old[0] if len(old)==1 else sum(map(ord,id))%4
    options=choices[1:];options.insert(pos,choices[0])
    patch(id,q=stem,options=options,feedback=feedback,commonError=error,type=operation,**metadata)
    PATCH[id]['$correct']=choices[0]
    if comparison:REVIEWS[id]={'ordinaryComparison':comparison,'oldOperation':original['q'],'checkpointOperation':stem,'addedMasteryEvidence':added,'result':'PASS — ADDITIONAL MASTERY EVIDENCE'}
    if calculation:CALCS[id]=calculation

task('43088',
 'Public debt starts at $200 and ends two years later at $260. The first-year budget deficit is $20. Assume deficits are financed entirely by borrowing and there are no other debt adjustments. An analyst calls the $260 ending debt the second-year deficit. What second-year deficit and correction follow?',
 ['$40; subtract initial debt and the first deficit from the ending stock', '$60; the entire two-year increase is the second-year deficit', '$260; an ending debt stock is the deficit for its final year', '$240; subtract only the first-year deficit from ending debt'],
 'The two-year debt increase is 260−200=60. Subtract the known first-year deficit 20 to infer the missing second-year deficit 40. The ending stock includes earlier borrowing; it is not a one-year flow.',
 'Treats the ending debt stock, or the whole two-year change, as a single-year deficit.',comparison=['43081'],added='Infer a missing period flow backward from two stocks and a known flow; diagnose the stock-flow error.',calculation={'expression':'260-200-20','expected':40})

task('ECON-EC-FINALBOSS-19010',
 'With worker hours, skills and methods fixed, two equal additions of machines raise output per hour first from 100 to 110, then from 110 to 116. Training then raises it to 124 without more machines. A report says diminishing returns made the second machine addition harmful and that only machines can raise productivity. Which assessment fits all the evidence?',
 ['Machine gains remain positive but shrink from 10 to 6; training adds human capital and a further gain of 8', 'Machine gains become negative after the first addition; training reverses a loss of 6 with a gain of 8', 'Machine gains rise from 10 to 16; training adds physical capital and a further gain of 8', 'Machine gains remain equal at 10; training adds worker hours rather than output per hour'],
 'The successive machine gains are 110−100=10 and 116−110=6: diminishing marginal gains are still positive. The further 124−116=8 occurs without new machines and is attributed to worker training, a human-capital improvement.',
 'Confuses diminishing positive gains with negative gains and treats training as machinery.',comparison=['ECON-NL-HARD-249','ECON-NL-HARD-254'],added='Compare marginal gains, reject a negative-return inference, and separate the subsequent human-capital effect.',calculation={'expression':'[110-100,116-110,124-116]','expected':[10,6,8]})
task('ECON-EC-MEDIUMBOSS-18022',
 'At fixed worker hours and methods, equal successive machine investments have raised output per hour by 10 and then 6 units. Assume positive diminishing marginal returns continue. An equally costly training option would raise output per hour by 8 units. Which choice gives the larger next productivity gain?',
 ['Training; its gain of 8 exceeds the next machine gain, which is below 6', 'Machines; their next gain must exceed 10 because the capital stock is larger', 'Machines; their next gain equals the accumulated gain of 16', 'Either; equal spending guarantees equal gains of 8'],
 'Continued diminishing marginal returns imply that the next equal machine investment adds less than 6 units, though its gain remains positive. The stated training gain of 8 is larger. Compare marginal gains from the next choice, not total past gains.',
 'Uses the accumulated capital gain as the return on the next machine investment.',comparison=['ECON-NL-HARD-254','ECON-NL-HARD-255'],added='Use diminishing returns to bound an unobserved marginal gain and choose between two investments.',calculation={'expression':'8-6','expected':2,'interpretation':'Training exceeds even the upper bound by 2; its advantage over the actual next gain is greater than 2.'})
task('ECON-NL-MEDIUMBOSS-3014',
 'A factory replaces failing machines while keeping worker hours and skills fixed. Output stays at 100 units per hour. Without replacement it would have fallen to 80. A manager says unchanged observed productivity proves the physical-capital investment added nothing. Which evaluation uses the relevant comparison?',
 ['The investment preserves 20 units per hour relative to no replacement, despite no rise from last year', 'The investment adds zero because only the comparison with last year can measure its contribution', 'The investment reduces productivity by 20 because the old machines would have produced 80', 'The investment adds 100 because all current output must be attributed to the new machines'],
 'The effect of replacement compares output with and without it: 100−80=20 units per hour. Comparing 100 this year with 100 last year misses the deterioration that replacement prevented.',
 'Treats an unchanged observed level as proof of zero effect, ignoring the stated counterfactual.',comparison=['ECON-NL-HARD-251'],added='Assess physical capital using a no-investment counterfactual rather than the observed time change.',calculation={'expression':'100-80','expected':20})
task('ECON-NL-MEDIUMBOSS-3019',
 'Two otherwise identical workshops keep the same machines, worker skills and total hours. Only Workshop A adopts a new production method: its output rises from 100 to 120, while B stays at 100. An analyst attributes A’s gain to capital deepening. Which explanation and productivity comparison are supported?',
 ['The method is the supported source; A’s output per hour rises 20% relative to its unchanged-hours baseline', 'Extra machines are the supported source; A’s output per hour rises 20% because capital must have increased', 'Extra hours are the supported source; A’s output per hour is unchanged because output growth is labor growth', 'Worker training is the supported source; A’s output per hour falls because unchanged machinery limits production'],
 'Machines, skills and hours are held constant, while method adoption differs. That supports technological knowledge rather than capital deepening or training. With hours fixed, output growth of (120−100)/100=20% is also productivity growth.',
 'Infers capital deepening from higher output even when machinery is explicitly unchanged.',comparison=['ECON-NL-HARD-252'],added='Use controlled evidence to reject competing productivity sources and infer output-per-hour growth.',calculation={'expression':'(120/100-1)*100','expected':20},primarySkill='technological_knowledge',repairSkill='technological_knowledge',secondarySkills=['physical_capital','productivity_calculation'])
task('ECON-NL-MEDIUMBOSS-3024',
 'A factory hires more workers using the same production method. Total output rises 20%, but total worker hours rise 25%. A report calls this a 20% productivity improvement. What correction follows?',
 ['Output per hour falls 4%; output growth alone does not establish a productivity gain', 'Output per hour rises 20%; additional worker hours do not affect productivity measurement', 'Output per hour rises 5%; subtract output growth from hours growth to obtain productivity growth', 'Output per hour is unchanged; hiring more workers always leaves productivity fixed'],
 'Productivity is output divided by hours. Its factor is 1.20/1.25=.96, so output per hour falls 4%. More labor can raise total production without raising productivity.',
 'Reports total-output growth as output-per-hour growth without accounting for increased hours.',comparison=['ECON-NL-HARD-249'],added='Reconcile opposing numerator/denominator changes and diagnose a productivity claim.',calculation={'expression':'(1.20/1.25-1)*100','expected':-4})
task('PM2B3-SRC-FB-005',
 'Two plants each initially produce 100 units in 100 worker hours. New machines raise A’s output per hour 20%; training raises B’s output per hour 15%. A then cuts hours to 80, while B keeps 100 hours. A report predicts A must have the larger total output because its productivity gain is larger. Which comparison is correct?',
 ['A produces 96 and B produces 115; A’s larger productivity gain is outweighed by its hours reduction', 'A produces 120 and B produces 115; different worker hours cannot change the productivity ranking', 'A produces 80 and B produces 100; only hours matter once the productivity changes are identified', 'A produces 100 and B produces 115; a 20% productivity rise exactly cancels a 20% hours cut'],
 'Initially each produces one unit per hour. A’s new rate is 1.2 and output is 1.2×80=96; B’s rate is 1.15 and output is 1.15×100=115. Productivity and total output need not rank plants the same way, and equal opposite percentage changes do not cancel multiplicatively.',
 'Ranks total output using productivity alone, ignoring different total hours.',comparison=['ECON-NL-HARD-249'],added='Use physical/human-capital gains with changed hours to distinguish productivity rankings from total-output rankings.',calculation={'expression':'[1.2*80,1.15*100]','expected':[96,115]},secondarySkills=['human_capital','productivity_calculation'])
task('ECON-NL-MEDIUMBOSS-3015',
 'After staff training and a new production method arrive together, output per hour rises. Management wants evidence that isolates the human-capital contribution. Which follow-up comparison best does that, with otherwise comparable workers?',
 ['Compare trained and untrained workers using the same machines and the same method for equal hours', 'Compare trained workers using the new method with untrained workers using the old method for equal hours', 'Compare total output before and after doubling both the number of workers and their hours', 'Compare output after installing more machines and the new method without recording worker training'],
 'Hold machines, methods and hours constant while comparing training status. That isolates productive worker skills. Changing the method along with training, or changing labor quantity, leaves competing explanations for the observed gain.',
 'Attributes a joint method-and-training improvement entirely to human capital without controlling the method.',comparison=['ECON-NL-HARD-249'],added='Select evidence that separates human capital from technology rather than merely label either source.')

task('ECON-NL-FINALBOSS-4009',
 'With a fixed labor force, unemployment initially consists of 2 percentage points from normal job search, 3 from persistent skill mismatch and 4 from recession layoffs. Recovery removes the recession component, while improved matching reduces normal search to 1 point. What happens to the natural rate and the final actual unemployment rate?',
 ['The natural rate falls from 5% to 4%, and final actual unemployment is 4%', 'The natural rate stays at 5%, and final actual unemployment is 4%', 'The natural rate falls from 9% to 4%, and final actual unemployment is 4%', 'The natural rate falls from 5% to 1%, and final actual unemployment is 1%'],
 'Normal search is frictional and persistent mismatch is structural, so the initial natural rate is 2+3=5%. Better matching makes it 1+3=4%. Recovery removes cyclical unemployment; final actual unemployment therefore equals that 4% natural rate.',
 'Includes cyclical unemployment in the natural rate or ignores the change in matching.',comparison=['ECON-NL-HARD-270','ECON-NL-ELITE-370'],added='Use classifications to distinguish a recovery from a change in the natural-rate benchmark.',calculation={'expression':'[2+3,1+3,1+3+0]','expected':[5,4,4]})
task('ECON-NL-FINALBOSS-4015',
 'A worker is first laid off because recession reduces sales. Sales later recover, but the old job has been permanently automated and available vacancies require skills the worker lacks. Why might restoring aggregate demand alone no longer remove this worker’s unemployment?',
 ['An initially cyclical loss has become a structural mismatch, so the remaining barrier requires skills or matching adjustment', 'An initially structural loss has become cyclical, so demand recovery is irrelevant to the original layoff', 'Both stages are frictional search, so training cannot affect access to the new vacancies', 'Both stages are necessarily cyclical, so recovered sales guarantee a job regardless of required skills'],
 'Weak aggregate demand explains the initial cyclical layoff. Once sales recover but skill mismatch blocks reemployment, the remaining unemployment is structural. Demand restoration does not by itself supply the newly required skills.',
 'Keeps the cyclical label after the causal obstacle changes to a persistent skills mismatch.',comparison=['ECON-NL-HARD-270'],added='Track a change in the mechanism over time and infer why the original remedy is no longer sufficient.')
task('ECON-NL-FINALBOSS-4036',
 'A retraining program reduces unemployment caused by persistent skill mismatch by 2 percentage points. At the same time a recession raises unemployment from weak sales by 2 points. Frictional unemployment and the labor force are unchanged. A report says the unchanged total proves retraining did not lower the natural rate. Which conclusion follows?',
 ['The natural rate falls 2 points, while rising cyclical unemployment offsets that improvement in the measured total', 'The natural rate is unchanged because equal changes in structural and cyclical unemployment cancel within it', 'The natural rate rises 2 points because recession unemployment is its only changing component', 'The natural rate falls 4 points because both changes reduce persistent skill mismatch'],
 'Retraining reduces structural unemployment, a component of the natural rate. Cyclical unemployment is outside that benchmark. Its increase offsets the structural fall in actual unemployment, not in the natural rate.',
 'Uses an unchanged total unemployment rate to deny an offset structural improvement.',comparison=['ECON-NL-ELITE-370','ECON-NL-ELITE-371'],added='Separate an underlying natural-rate improvement from an opposing cyclical movement.',calculation={'expression':'[-2,-2+2]','expected':[-2,0]})
task('PM2B4-UTYPE-EB-003',
 'Group A lost jobs because economy-wide sales fell; their skills still match the jobs firms would offer at normal sales. Group B is searching between jobs even at normal sales. If the economy returns to potential output with matching conditions unchanged, which forecast follows?',
 ['A’s cyclical unemployment should recede; B’s frictional search can remain', 'A’s structural unemployment must remain; B’s frictional search must disappear', 'A’s frictional unemployment should recede; B’s cyclical unemployment can remain', 'Both groups must remain unemployed because returning to potential never affects hiring'],
 'Restoring normal demand removes the stated cyclical reason for A’s layoff. Potential output is compatible with ongoing frictional job search, so it does not imply zero unemployment for B.',
 'Treats return to potential output as elimination of all job search.',comparison=['ECON-NL-HARD-270'],added='Apply the classifications to predict which unemployment a recovery removes and which can persist.')
task('PM2B4-UTYPE-MB-006',
 'Six of 100 labor-force participants are unemployed, including two laid off during a recession. Those two become discouraged and stop searching; nobody gains or loses a job. An official calls the resulting lower unemployment rate proof that recovery restored employment. Which assessment is correct?',
 ['Employment stays at 94 and the labor force falls to 98; the lower rate does not establish a jobs recovery', 'Employment rises to 96 and the labor force stays at 100; leaving search is equivalent to being hired', 'Employment stays at 94 and the labor force stays at 100; discouraged workers remain counted as unemployed', 'Employment falls to 92 and the labor force falls to 98; leaving unemployment requires losing another job'],
 'Initial employment is 100−6=94. The two unemployed searchers exit the labor force, leaving U=4 and LF=98, with E=94 unchanged. The measured rate falls from 6% to about 4.08% because of exit, not reemployment after the recession.',
 'Interprets the disappearance of recession-laid-off searchers from measured unemployment as new employment.',comparison=['ECON-NL-HARD-270'],added='Interpret a transition out of measured cyclical unemployment without confusing participation loss with recovery.',calculation={'expression':'[100-6,100-2,4/98*100]','expected':[94,98,4.081632653061225]},secondarySkills=['discouraged_workers','unemployment_rate'])

task('ECON-SP-EASYBOSS-2005',
 'Before an election, elected officials demand an immediate rate cut while inflation remains above the central bank’s target. The bank has instrument independence within a public mandate and must explain its decisions. Which response is consistent with that arrangement?',
 ['The bank may reject the requested cut on inflation grounds while explaining how its decision serves the mandate', 'The bank must grant the requested cut because public accountability transfers each rate decision to elected officials', 'The bank may avoid the rate decision by unilaterally raising income-tax rates instead', 'The bank may reject the requested cut without regard to its mandate or any duty to explain its decision'],
 'Instrument independence allows the bank to choose its policy tools under its mandate rather than obey an election-driven demand. Accountability remains: the bank must explain the decision. Independence does not give it fiscal taxing authority or remove its mandate.',
 'Confuses instrument independence with either automatic political obedience or freedom from accountability.',comparison=['LG-Q-9020','P52B-S1-FED-L-001'],added='Apply institutional independence to a conflicting rate demand while preserving mandate and accountability.',operation='application')
task('ECON-SP-EASYBOSS-2011',
 'In a textbook system with multiplier 5, all reserve adjustments work through deposits, with no currency leakage or excess-reserve holding. A central-bank bond sale is intended to cause a maximum $100 million deposit contraction. What initial reserve change is required, and how does it compare with the total deposit change?',
 ['$20 million decrease in reserves; the eventual deposit decrease is five times that initial change', '$100 million decrease in reserves; the eventual deposit decrease equals the initial change', '$500 million decrease in reserves; the eventual deposit decrease is one-fifth of the initial change', '$20 million increase in reserves; the eventual deposit decrease offsets the reserve increase'],
 'Work backward from the total deposit change: 100/5=20 million. The bond sale must withdraw reserves, not add them. The initial reserve withdrawal and eventual maximum deposit contraction are different magnitudes under the stated model.',
 'Confuses the desired final deposit contraction with the initial reserve withdrawal.',comparison=['ECON-SP-HARD-202'],added='Infer the initial policy input from the desired total effect and distinguish reserve change from deposit change.',operation='calculation',calculation={'expression':'100/5','expected':20})
task('LG-Q-2001',
 'A digital payment unit is widely accepted for purchases, and shops consistently quote and compare prices in that unit. Its purchasing power falls sharply between pay periods. Someone concludes it therefore performs none of money’s functions. Which assessment best fits the three stated uses?',
 ['Reliable for exchange and price comparison; impaired for preserving purchasing power between pay periods', 'Impaired for exchange; reliable for price comparison and preserving purchasing power between pay periods', 'Reliable for exchange and preserving purchasing power; impaired for price comparison', 'Impaired for exchange, price comparison and preserving purchasing power, despite the stated acceptance and quotes'],
 'Acceptance supports its medium-of-exchange function, and quoted prices support its unit-of-account function. Rapid loss of purchasing power impairs its store-of-value function. Failure in that dimension does not logically erase the two functions demonstrated in the case.',
 'Infers that a weak store of value prevents every other monetary function.',comparison=['LG-Q-200'],added='Evaluate an all-or-nothing claim using a constraint that impairs one money function while the others remain demonstrated.')
task('P52A-AD-B2-001',
 'In the liquidity-preference model, a lower price level reduces transaction money demand. At the same time the central bank independently reduces nominal money supply. The relative sizes of the changes are not given, and other investment determinants are fixed. Which interest-rate and investment conclusion is warranted?',
 ['Lower money demand lowers the rate; lower supply raises it; investment’s net change is undetermined', 'Lower money demand lowers the rate; lower supply also lowers it; investment must rise', 'Lower money demand raises the rate; lower supply also raises it; investment must fall', 'Lower money demand raises the rate; lower supply lowers it; the changes must cancel'],
 'Lower money demand tends to reduce the equilibrium rate; a lower money supply tends to increase it. Without relative magnitudes, the net rate and therefore interest-sensitive investment cannot be signed. The usual price-level channel is not a guarantee about the outcome when policy also changes.',
 'Treats the price-level interest-rate effect as decisive despite an opposing money-supply change.',comparison=['ECON-SP-MEDIUM-121','ECON-SP-MEDIUM-139'],added='Distinguish two opposing mechanisms and identify the outcome that cannot be signed.' )
task('P52A-AD-LB-002',
 'With nominal money supply fixed, the price level and borrowing rate both rise. Firms also become more optimistic, shifting desired investment outward at every rate, and observed investment rises. Other influences are unchanged. Which account fits the evidence, and what would investment have done had the price level stayed fixed?',
 ['The rate channel restrains investment but optimism outweighs it; with the price level fixed, investment would rise even more', 'The rate channel raises investment and optimism restrains it; with the price level fixed, investment would rise even more', 'The rate channel restrains investment and optimism is irrelevant; with the price level fixed, investment would fall', 'The rate channel raises investment and optimism reinforces it; with the price level fixed, investment would remain unchanged'],
 'At fixed nominal money supply, a higher price level raises money demand and the borrowing rate, restraining investment along its schedule. The separate optimistic shift raises investment enough to offset that restraint. Removing the price-level increase removes the restraint, so investment would rise more. A movement along AD is distinct from an independent spending shift.',
 'Attributes rising observed investment to the price-level channel when a separate investment shift outweighs its restraint.',comparison=['LG-Q-259'],added='Use observed signs to diagnose an offsetting investment-demand shift, then reason through a price-level counterfactual.')
task('PM2B4-LMI-MB-005',
 'A competitive labor market initially clears at $15 with a legal minimum of $12. Labor demand then falls so that the new market-clearing wage would be $10. The minimum stays $12; at that wage firms demand 90 workers and 120 offer labor. What changes under the competitive wage-floor model?',
 ['The minimum changes from nonbinding to binding; employment is 90 and the labor surplus is 30', 'The minimum stays nonbinding; employment is 120 and there is no labor surplus', 'The minimum changes from binding to nonbinding; employment is 90 and the labor surplus is 30', 'The minimum changes from nonbinding to binding; employment is 120 and the labor surplus is 90'],
 'Initially $12 is below equilibrium and does not bind. After equilibrium falls to $10, the unchanged $12 floor binds. Firms hire the 90 workers demanded at that wage; 120−90=30 workers are the excess supply of labor.',
 'Keeps the initial nonbinding diagnosis after the equilibrium wage changes.',comparison=['ECON-NL-EASY-78','ECON-NL-MEDIUM-175'],added='Reassess the same legal floor after a demand change and infer employment and labor surplus.',calculation={'expression':'120-90','expected':30},primarySkill='minimum_wage_surplus',repairSkill='minimum_wage_surplus')

# Bridges: unchanged repairs are resolved by the runtime validation, not inferred from an ID prefix.
BRIDGES={}
def bridge(id,repairs,skill,repair_operation,transfer,stem,choices,feedback,error,calculation=None,**metadata):
    task(id,stem,choices,feedback,error,operation='application',calculation=calculation,**metadata)
    BRIDGES[id]={'repairIDs':repairs,'runtimeSkill':skill,'repairOperation':repair_operation,'finalBridgeOperation':stem,'newTransferStep':transfer,'result':'PASS'}

bridge('ECON-NL-NOMINAL-VS-REAL-GDP-6006',
 ['ECON-NL-NOMINAL-VS-REAL-GDP-5012','ECON-NL-NOMINAL-VS-REAL-GDP-5013'],'nominal_vs_real_gdp',
 'Distinguish price changes from production changes and value current quantities at base-year prices.',
 'Use the repaired base-year rule to value a new year’s actual quantity.',
 'An economy produces only one good. In the base year its price is $5 and quantity is 100. In the next year price is $6 and quantity is 110. What is next-year real GDP measured at base-year prices?',
 ['$550', '$660', '$500', '$600'],
 'Real GDP uses current quantity at the base-year price: 110×$5=$550. Using $6 gives nominal GDP $660; holding quantity at 100 would miss the real production increase.',
 'Uses the current price instead of the base-year price to value current output.',
 {'expression':'5*110','expected':550},primarySkill='nominal_vs_real_gdp',repairSkill='nominal_vs_real_gdp')
bridge('ECON-NL-SUBSTITUTION-BIAS-6011',
 ['ECON-NL-SUBSTITUTION-BIAS-5022','ECON-NL-SUBSTITUTION-BIAS-5023'],'substitution_bias',
 'Recognize that a fixed basket misses substitution toward relatively cheaper goods.',
 'Compare fixed and adjusted basket costs to measure the overstatement in a new case.',
 'A household initially buys two apples and two pears at $1 each, costing $4. Apples then cost $3 and pears still $1. The old basket now costs $8, but four pears cost $4 and are stipulated to give this household the same satisfaction. How much does the fixed-basket cost increase overstate the increase needed for that satisfaction?',
 ['Overstates by $4: fixed-basket cost rises $4; the equally satisfactory basket’s cost is unchanged', 'Understates by $4: fixed-basket cost is unchanged; the equally satisfactory basket’s cost rises $4', 'Overstates by $8: the fixed basket’s entire $8 bill is an increase; substitute cost is unchanged', 'No overstatement: the fixed and equally satisfactory baskets each cost $4 more than before'],
 'The fixed basket’s increase is 8−4=4. The equally satisfactory adjusted basket’s increase is 4−4=0. The fixed basket therefore overstates the needed increase by $4. The supplied satisfaction assumption makes this a cost comparison rather than a claim that arbitrary bundles are equivalent.',
 'Compares total bills instead of their increases, or ignores the stipulated substitute basket.',
 {'expression':'(8-4)-(4-4)','expected':4})
bridge('ECON-SP-MOVE-ALONG-SRPC-6041',
 ['ECON-SP-MOVE-ALONG-SRPC-5050'],'expectations_adjustment',
 'Higher expected inflation shifts the SRPC upward at a fixed unemployment rate.',
 'Apply a specified expectations shift to the inflation coordinate of a supplied point.',
 'An SRPC predicts 4% inflation at 5% unemployment. Expected inflation then rises 2 percentage points; in this model it shifts the SRPC up one-for-one, with other supply conditions unchanged. At 5% unemployment, what inflation and curve change follow?',
 ['6% inflation; an upward shift of the SRPC', '6% inflation; movement along the original SRPC', '2% inflation; a downward shift of the SRPC', '4% inflation; no shift because unemployment is unchanged'],
 'At the same unemployment rate, the two-point expectations increase adds two points to predicted inflation: 4+2=6%. Changing inflation at fixed unemployment locates a shifted curve, not movement along the old curve.',
 'Calls a change in inflation at fixed unemployment a movement along an unchanged SRPC.',
 {'expression':'4+2','expected':6})
bridge('ECON-SP-TAX-CUT-AD-6033',
 ['ECON-SP-TAX-CUT-AD-5042'],'tax_cut_ad',
 'Apply the MPC to a tax cut to obtain first-round consumption.',
 'Use that first-round result to compare the initial spending impact with a direct purchase.',
 'A $100 tax cut with MPC=.8 generates $80 of first-round consumption. An alternative is $90 of additional government purchases. At fixed prices, ignoring offsets and later induced spending rounds, which policy adds more to initial aggregate demand, and by how much?',
 ['Government purchases add $10 more', 'The tax cut adds $10 more', 'Government purchases add $90 more', 'The policies add the same amount'],
 'The repaired consumption result is $80. Direct government purchases add $90 to initial spending, so the purchase policy adds 90−80=$10 more. This compares initial effects, not full multipliers.',
 'Uses the full tax cut as initial consumption instead of the supplied MPC-adjusted amount.',
 {'expression':'90-80','expected':10})
# Existing calculate_required_reserves repair already teaches the appropriate prerequisite.
patch('LG-B-6003',repairSkill='calculate_required_reserves')
BRIDGES['LG-B-6003']={'repairIDs':['ECON-SP-CALCULATE-REQUIRED-RESERVES-5006'],'runtimeSkill':'calculate_required_reserves','repairOperation':'Calculate the required reserve amount from deposits and the ratio.','finalBridgeOperation':R['LG-B-6003']['q'],'newTransferStep':'Compare the required amount with actual reserves to identify the additional reserves needed.','result':'PASS'}
CALCS['LG-B-6003']={'expression':'.12*900000-100000','expected':8000}
bridge('PM2A-DIS-BR-021',
 ['ECON-SP-DISINFLATION-UNEMPLOYMENT-COST-5057'],'policy_path',
 'Distinguish lower positive inflation from a falling price level.',
 'Apply the new lower inflation rate to a supplied price index rather than repeat the label.',
 'A price index is 200. Over the next year inflation slows from the previous year’s 6% to 3%, remaining positive. What is the new index, and does this year illustrate disinflation or deflation?',
 ['206; disinflation', '194; deflation', '212; disinflation', '200; deflation'],
 'The index rises to 200×1.03=206. A lower but positive inflation rate means prices rise more slowly: disinflation. Subtracting 3% would incorrectly turn it into deflation; using 6% would ignore the new rate.',
 'Subtracts a positive but lower inflation rate from the price level.',
 {'expression':'200*1.03','expected':206})
bridge('PM2A-LRPC-BR-022',
 ['ECON-SP-IDENTIFY-LRPC-5051','ECON-SP-IDENTIFY-NATURAL-UNEMPLOYMENT-5077'],'sacrifice_ratio_meaning',
 'Distinguish the natural-rate position of LRPC from temporary inflation surprises.',
 'Locate the long-run unemployment/inflation point after a persistent natural-rate change and full expectations adjustment.',
 'A persistent labor-market change raises natural unemployment from 4% to 5%. Policymakers maintain 6% inflation, which eventually becomes fully expected. What long-run point follows in the natural-rate model?',
 ['5% unemployment and 6% inflation, on an LRPC to the right of the old one', '4% unemployment and 6% inflation, on the old LRPC because higher inflation restores employment', '5% unemployment and 4% inflation, because the old unemployment rate fixes long-run inflation', '6% unemployment and 5% inflation, because the inflation and natural-rate coordinates exchange places'],
 'The new natural rate puts the vertical LRPC at 5% unemployment. Once 6% inflation is fully anticipated it does not keep unemployment below that benchmark, so the long-run point is (u=5%, inflation=6%).',
 'Assumes fully anticipated higher inflation can restore the former natural unemployment rate.')
# Preserve the existing bridge route key but use the already-existing actual LRPC task skill.
patch('PM2A-LRPC-BR-022',primarySkill='natural_rate_hypothesis',repairSkill='natural_rate_hypothesis')
BRIDGES['PM2A-LRPC-BR-022']['runtimeSkill']='natural_rate_hypothesis'
bridge('ECON-NL-UNIONS-EFFICIENCY-WAGES-6035',
 ['ECON-NL-UNIONS-EFFICIENCY-WAGES-5055'],'unions_efficiency_wages',
 'Above-equilibrium wages can create excess labor supply.',
 'Use supplied labor quantities at the retained efficiency wage to infer employment and labor surplus.',
 'A labor market would clear at $18. Firms instead maintain a $22 efficiency wage to reduce costly quits. At $22, 120 workers offer labor and firms want to hire 90. In this simple model, what employment and labor surplus result while firms maintain that wage?',
 ['90 employed; 30 workers in excess supply', '120 employed; no workers in excess supply', '90 employed; no workers in excess supply', '120 employed; 30 workers in excess supply'],
 'At the maintained wage, firms hire the 90 workers demanded. Labor supplied exceeds labor demanded by 120−90=30. The turnover incentive can explain maintaining the high wage without eliminating the associated excess supply.',
 'Treats all willing workers as employed despite firms’ lower demand at the efficiency wage.',
 {'expression':'120-90','expected':30})

DIFFICULTY=['43096','43132','ECON-NL-ELITE-349','ECON-NL-HARD-249','ECON-NL-ELITE-355','ECON-NL-HARD-270','ECON-NL-LEGENDARY-9064','ECON-SP-HARD-202','ECON-SP-LEGENDARY-9022','LG-Q-200','LG-Q-259','LG-Q-9044','LG-Q-9049']
for id in DIFFICULTY:
    tier='easy' if id=='ECON-NL-ELITE-355' else 'medium'
    patch(id,difficulty=tier,canonicalDifficulty=tier)

patch('ECON-SP-LEGENDARY-9000',type='integration')
for id in ['LG-Q-9111','PM2C1-FED-MB-003']:
    patch(id,primarySkill='reserve_supply_vs_lending',repairSkill='reserve_supply_vs_lending',secondarySkills=['central_commercial_money'])
for id in ['LG-Q-2011','LG-Q-9113']:
    patch(id,primarySkill='compare_excess_reserves_after_policy_change',repairSkill='reserve_requirement_effect',secondarySkills=['excess_reserves_formula'])

ROUTES=[
 {'concept':'bank-balance-sheets-reserves-and-capital','map':'microSkillBridgePools','from':'required_reserves_formula','to':'calculate_required_reserves','id':'LG-B-6003','reason':'Use unchanged repair ECON-SP-CALCULATE-REQUIRED-RESERVES-5006, then apply its result to a reserve shortfall.'},
 {'concept':'central-bank-and-federal-reserve','map':'directSkillRepairRoutes','skill':'reserve_supply_vs_lending','ids':['PM2C1-FED-M-001','PM2C1-FED-H-002'],'reason':'Reuse two unchanged, focused canonical questions as repair references: commercial deposits versus reserves; reserve creation does not guarantee lending. They remain in their ordinary storage pools.'},
 {'concept':'monetary-policy-tools','map':'directSkillRepairRoutes','skill':'reserve_requirement_effect','ids':['LG-R-5018'],'reason':'The existing repair explains how a reserve-ratio change alters required reserves and potential lending capacity.'}
]
# Drop only this target's obsolete sacrifice-ratio bridge alias; all of its existing LRPC aliases remain.
ROUTES.append({'concept':'long-run-phillips-curve','map':'microSkillBridgePools','from':'sacrifice_ratio_meaning','to':None,'id':'PM2A-LRPC-BR-022','reason':'The authorized bridge now applies the natural-rate/LRPC repair; it must not be served as sacrifice-ratio practice.'})
assert set(PATCH)==set(R),(set(R)-set(PATCH),set(PATCH)-set(R))
assert len(REVIEWS)==19 and len(BRIDGES)==8
for x in BEFORE:
    id=x['id'];REVIEWS.get(id,{}).update({'exceptionID':x['exception']['exceptionID']})
for name,obj in [('patches.json',PATCH),('checkpoint_reviews.json',REVIEWS),('bridge_reviews.json',BRIDGES),('economic_checks.json',CALCS),('routing.json',ROUTES)]:
    (HERE/'inputs'/name).write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(f'Staged {len(PATCH)} exact patches, {len(REVIEWS)} checkpoint reviews and {len(BRIDGES)} bridge reviews.')
