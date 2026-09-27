from author import *

task('LG-Q-9',
 'In the Federal Reserve\'s current ample-reserves framework, which responsibility belongs to the FOMC?',
 ['Setting the monetary-policy target range for the federal funds rate, implemented mainly through administered rates', 'Setting the interest rate paid by each commercial bank to every checking-account customer', 'Setting federal tax rates so Treasury receipts keep overnight rates in a target range', 'Setting bank loan quantities by requiring every new reserve dollar to become a loan'],
 'The FOMC sets the federal funds target range. In an ample-reserves framework, administered rates, including interest on reserve balances set by the Board of Governors, help keep overnight market rates in that range. Open-market operations remain available for reserve management.',
 'definition', 'Confuses the monetary-policy target with fiscal decisions or direct control of bank lending.')
task('LG-Q-2004',
 'Reserve balances are ample. The FOMC raises its federal funds target range, but overnight rates initially remain near the old range. Which implementation response best fits the current framework?',
 ['Raise the relevant administered rates to support the new range; reserves need not first become scarce', 'Lower the relevant administered rates to support the new range; reserves need not first become scarce', 'Hold administered rates fixed and increase reserve balances to push overnight rates upward', 'Hold administered rates fixed and require Treasury to raise tax rates to implement the new range'],
 'A higher return on reserve balances and the relevant overnight facility rates support higher overnight market rates. The FOMC sets the target range; the Board sets interest on reserve balances. Ample-reserves implementation does not require first withdrawing enough reserves to make them scarce.',
 'application','Uses the scarce-reserves quantity mechanism as the necessary first step in current ample-reserves implementation.')
task('ECON-SP-EASYBOSS-2002',
 'Using the current U.S. monetary-aggregate definitions, the public holds $900 in currency, $1,100 in checkable deposits, $1,500 in savings deposits, and $500 in small time deposits. These are distinct balances. What are M1 and M2?',
 ['M1 = $3,500; M2 = $4,000','M1 = $2,000; M2 = $4,000','M1 = $3,500; M2 = $5,500','M1 = $4,000; M2 = $4,000'],
 'Current M1 includes currency, checkable deposits and savings deposits: 900 + 1,100 + 1,500 = 3,500. M2 adds the $500 in small time deposits: 3,500 + 500 = 4,000. Savings are not added a second time.',
 'calculation','Excludes savings from current M1 or counts savings twice in M2.',
 {'expressions':[['900+1100+1500',3500],['900+1100+1500+500',4000]],'basis':'Current M1 includes savings; M2 includes M1 plus small time deposits in this ledger.'})
for id in ['PM2D2-MULT-L-001','PM2D2-MULT-L-002','ECON-SP-HARD-230']:
 old=q(id)
 if id=='PM2D2-MULT-L-001':
  stem='Two governments each increase purchases by $60 billion. Economy A has MPC 0.80 and a total $100 billion reduction in aggregate demand from crowding out; Economy B has MPC 0.60 and a total $20 billion reduction. These offsets already include induced spending effects. Using the simple spending multiplier, which comparison is correct?'
  fb='A: 60/(1−0.80)−100 = 300−100 = $200 billion. B: 60/(1−0.60)−20 = 150−20 = $130 billion. A\'s net increase is $70 billion larger. Each stated crowding-out amount is already a total AD offset and is subtracted once, not multiplied again.'
  checks=[['60/(1-.8)-100',200],['60/(1-.6)-20',130]]
 elif id=='PM2D2-MULT-L-002':
  stem='Government purchases rise by $80 billion and MPC is 0.75. The observed net AD increase is $230 billion. Define crowding out here as the total reduction in AD after induced spending effects, not an autonomous investment change. How much of the gross spending-multiplier effect was offset?'
  fb='The gross increase is 80/(1−0.75) = $320 billion. The total AD offset is 320−230 = $90 billion. It already incorporates induced spending effects and does not receive another multiplier.'
  checks=[['80/(1-.75)-230',90]]
 else:
  stem='Government purchases rise by $80 billion and MPC is 0.75. Crowding out reduces aggregate demand by a total of $100 billion after induced spending effects. Using the simple spending multiplier, what is the net increase in AD?'
  fb='The gross AD increase is 80/(1−0.75) = $320 billion. Subtract the already-total AD offset once: 320−100 = $220 billion. Multiplying the $100 billion again would apply induced effects twice.'
  checks=[['80/(1-.75)-100',220]]
 patch(id,'Instructor-adjudicated total AD offset; preserve original arithmetic and key.',q=stem,feedback=fb)
 PROOFS[id]={'expressions':checks,'basis':'Subtract total AD offsets after the purchase multiplier.'}

task('P52B-S4-IEA-L-001',
 'Nominal GDP rises 8 percent while the GDP deflator rises 5 percent. The measured unemployment rate falls, but employment and participation data are not supplied. Using the usual approximate real-growth calculation, which conclusion is supported?',
 ['Real output rose about 3 percent; measured unemployment fell, but labor-force exits could explain the rate decline', 'Real output rose about 3 percent; measured unemployment fell, which establishes that employment increased', 'Real output rose about 13 percent; measured unemployment fell, but labor-force exits could explain the rate decline', 'Real output was unchanged; measured unemployment fell, which establishes that employment increased'],
 'Approximate real growth is 8−5 = 3 percent (the exact ratio gives about 2.9 percent). A lower unemployment rate alone does not prove stronger employment: unemployed workers may have stopped searching. Employment and participation evidence would distinguish the possibilities.',
 'integration','Treats a lower measured unemployment rate as proof of increased employment.',{'expressions':[['8-5',3],['(1.08/1.05-1)*100',2.857142857]],'basis':'Approximation is explicitly requested; labor-force exit is an alternative explanation.'})
task('ECON-SP-DISTINGUISH-M1-M2-6001',
 'Households deposit currency from their wallets into checking accounts. The initial transfer leaves total M1 unchanged while changing its composition. Under a banking model in which banks can lend some additional reserves, which consequence is possible?',
 ['Banks gain deposits and reserves that can support lending; the initial currency-to-deposit transfer does not itself create extra M1', 'Banks gain deposits but lose an equal amount of reserves; the initial transfer creates extra M1', 'Banks gain reserves but no deposit liability; the initial transfer lowers M1 by the currency deposited', 'Banks gain deposits and reserves and must lend the maximum amount; the initial transfer already creates that full expansion'],
 'Currency held by the public falls as checking deposits rise by the same amount, so M1 composition changes but its initial total does not. Banks receive the cash/reserves and a matching deposit liability. Later lending may expand deposits, subject to reserve, capital, demand and lending constraints.',
 'application','Confuses a change in M1 composition with initial creation of new money.')
task('ECON-NL-LEGENDARYBOSS-9124',
 'Initially 150 million adults are employed, 12 million are unemployed and 88 million are outside the labor force. Four million unemployed people find jobs. Then six million other unemployed people stop searching and leave the labor force. Adult population is unchanged. Which calculation and interpretation are correct?',
 ['The new unemployment rate is about 1.28%; employment rises, but discouraged exits also contribute to the rate decline', 'The new unemployment rate is about 4.94%; employment rises, and the denominator remains the original labor force', 'The new unemployment rate is about 0.80%; employment rises, and adult population is the unemployment-rate denominator', 'The new unemployment rate is about 5.13%; employment rises, and the six exits are subtracted from employment'],
 'Employment becomes 154 million. Unemployment becomes 12−4−6 = 2 million, and the labor force is 154+2 = 156 million. Thus UR = 2/156×100 ≈ 1.28%. Job finding improves employment, while discouraged exits separately lower both unemployment and participation; the rate decline is not solely job creation.',
 'multi-step','Fails to remove discouraged unemployed workers from both unemployment and the labor force.',{'expressions':[['150+4',154],['12-4-6',2],['154+2',156],['2/156*100',1.282051282]],'basis':'All six exits explicitly originate among the remaining unemployed.'})
task('P52A-CPI-LB-002',
 'A fixed basket contains 5 units of A and 4 units of B. Base prices are $8 and $15; current prices are $10 and $18; next year\'s prices are $11 and $19. A report uses the base year as the inflation denominator as well as the CPI base. Which pair corrects the report: current CPI and next-year inflation?',
 ['122 and about 7.4 percent','122 and 9.0 percent','131 and about 7.4 percent','122 and about 6.9 percent'],
 'Base cost = 5×8+4×15 = $100; current cost = 5×10+4×18 = $122; next cost = 5×11+4×19 = $131. Current CPI is 122/100×100 = 122. Next-year inflation uses the current basket cost: (131−122)/122×100 ≈ 7.4%. Dividing by the base cost gives 9%, while dividing by next year\'s cost gives about 6.9%.',
 'multi-step','Uses the CPI base-year cost rather than the previous period as the inflation denominator.',{'expressions':[['5*8+4*15',100],['5*10+4*18',122],['5*11+4*19',131],['(131-122)/122*100',7.37704918]],'basis':'Visible fixed basket; denominator selection distinguishes CPI level from inflation.'})
task('ECON-SP-FINALBOSS-4004',
 'An unexpected oil-supply disruption raises firms\' costs. With aggregate demand initially unchanged, output falls and inflation rises; natural unemployment is unchanged. How does the shock map across AD-AS and Phillips curves, and what tradeoff would demand tightening create?',
 ['SRAS shifts left and SRPC shifts up; tightening can lower inflation pressure but worsen the output loss', 'AD shifts left and the economy moves down SRPC; tightening can lower inflation pressure but worsen the output loss', 'SRAS shifts left and LRPC shifts right; tightening can lower inflation and restore output simultaneously', 'SRAS shifts right and SRPC shifts down; tightening can lower inflation and restore output simultaneously'],
 'The locally stated adverse supply shock shifts SRAS left and worsens the short-run inflation-unemployment relation, shifting SRPC up. It does not by itself change the stated natural rate. Demand tightening reduces inflation pressure at the cost of lower output and higher unemployment in the short run.',
 'integration','Confuses an adverse supply shift with a demand movement and overlooks the stabilization tradeoff.')

for id,order,actions in [
 ('LG-B-6000',['Unit of account','medium of exchange','store of value'],'lists a coffee price, accepts dollars in payment, and retains dollars for a later purchase'),
 ('LG-Q-2001',['Medium of exchange','unit of account','store of value'],'uses dollars to buy groceries, compares dollar prices, and saves dollars for next month')]:
 a,b,c=order
 task(id,f'A person {actions}. Which ordered mapping correctly identifies the function used in each action?',
      [f'{a}; {b}; {c}',f'{b}; {a}; {c}',f'{a}; {c}; {b}',f'{c}; {b}; {a}'],
      'Payment uses money as a medium of exchange; expressing/comparing prices uses a unit of account; retaining purchasing power for later uses a store of value. Match each distinct action in its stated order.',
      'classification','Interchanges the payment, price-comparison and saving functions of money.')

choices={
 'P52A-AD-EL-002':[
  'The price rise moves upward along AD; the tax cut shifts AD right',
  'The price rise moves downward along AD; the tax cut shifts AD right',
  'The price rise moves upward along AD; the tax cut shifts AD left',
  'The price rise shifts AD left; the tax cut moves downward along that curve'],
 'P52A-AD-EL-003':[
  'Investment rises and export demand falls; the net AD direction requires their relative effects',
  'Investment falls and export demand falls; both changes push AD left',
  'Investment rises and export demand rises; both changes push AD right',
  'Investment rises and export demand falls; equal numbers of opposing channels imply no AD shift'],
 'P52A-AD-EL-004':[
  'A fall in output could reflect AD shifting left, SRAS shifting left, or movement up AD; price and shock evidence is needed',
  'A fall in output could reflect AD shifting left or SRAS shifting right; price and shock evidence is needed',
  'A fall in output could reflect AD shifting right or SRAS shifting left; price and shock evidence is needed',
  'A fall in output could reflect only movement down AD; price and shock evidence is needed'],
 'P52A-AD-H-001':[
  'Consumption tends to rise and investment to fall; relative changes determine the net shift',
  'Consumption and investment both tend to rise; both changes shift AD right',
  'Consumption and investment both tend to fall; both changes shift AD left',
  'Consumption tends to rise and investment to fall; the two changes cancel because they oppose'],
 'P52A-AS-EL-002':[
  'Contract nominal wages are higher and real labor costs at actual prices are higher; SRAS lies farther left',
  'Contract nominal wages are higher and real labor costs at actual prices are lower; SRAS lies farther right',
  'Contract nominal wages are lower and real labor costs at actual prices are lower; SRAS lies farther right',
  'Contract nominal wages are lower and real labor costs at actual prices are higher; SRAS lies farther left'],
 'P52A-AS-EL-004':[
  'Actual price changes move along SRAS; changed expected prices or input costs shift SRAS',
  'Actual price changes shift SRAS; changed expected prices or input costs move along SRAS',
  'Actual and expected price changes both move along SRAS; only input costs shift SRAS',
  'Actual and expected price changes both shift SRAS; only input costs move along SRAS'],
 'P52A-AS-H-001':[
  'Oil costs push SRAS left and productivity pushes it right; magnitudes determine the net shift',
  'Oil costs push SRAS right and productivity pushes it right; both raise short-run supply',
  'Oil costs push SRAS left and productivity pushes it left; both lower short-run supply',
  'Oil costs push SRAS left and productivity pushes it right; opposing signs establish an unchanged curve'],
 'P52A-AS-L-004':[
  'Initially move up along SRAS; later wage resetting shifts SRAS left',
  'Initially move up along SRAS; later wage resetting shifts SRAS right',
  'Initially shift SRAS right; later wage resetting moves down the same curve',
  'Initially shift SRAS left; later wage resetting moves up the same curve'],
 'P52A-AS-LB-003':[
  'Capital loss reduces capacity and technology raises it; net LRAS direction requires relative effects',
  'Capital loss reduces capacity and technology raises it; opposite effects establish unchanged LRAS',
  'Capital loss reduces capacity and technology affects only current costs; LRAS shifts left',
  'Technology raises capacity and capital loss affects only current costs; LRAS shifts right'],
 'PG5-PC-L-006':[
  'Expected inflation is 5.5%; without the offset, only expected inflation plus the supply offset is identified',
  'Expected inflation is 6.6%; without the offset, only expected inflation plus the supply offset is identified',
  'Expected inflation is 5.5%; without the offset, expected inflation is still separately identified by the curve intercept',
  'Expected inflation is 4.3%; without the offset, expected inflation is still separately identified by actual inflation'],
 '43319':[
  'Saving supply shifts left and investment demand right; the rate rises while quantity depends on relative shifts',
  'Saving supply shifts left and investment demand right; quantity rises while the rate depends on relative shifts',
  'Saving supply shifts right and investment demand right; quantity rises while the rate depends on relative shifts',
  'Saving supply shifts left and investment demand left; quantity falls while the rate depends on relative shifts'],
 'PMOE-NCO-EL-001':[
  'Foreign returns rise relative to domestic returns, raising NCO, while lower domestic risk reduces it; the net direction is undetermined',
  'Domestic returns rise relative to foreign returns, reducing NCO, and lower domestic risk also reduces it; NCO falls',
  'Foreign returns rise relative to domestic returns, raising NCO, and lower domestic risk also raises it; NCO rises',
  'Foreign returns rise relative to domestic returns, raising NCO, while lower domestic risk reduces it; the opposing channels exactly cancel'],
 'PM2C2-ICOST-L-001':[
  'Indexation limits redistribution, but repricing and cash-management costs can remain under predictable inflation',
  'Indexation limits repricing costs, but only unexpected inflation creates cash-management costs',
  'Indexation limits cash-management costs, but only unexpected inflation creates repricing costs',
  'Indexation limits redistribution and resource costs alike, leaving only costs from unanticipated price changes'],
 'ECON-SP-LEGENDARY-9000':[
  'Demand tightening can close the gap sooner; without it, rising wages/expected prices can shift SRAS left toward potential',
  'Demand tightening can close the gap sooner; without it, rising wages/expected prices shift SRAS right farther above potential',
  'Demand expansion can close the gap sooner; without it, rising wages/expected prices shift SRAS left toward potential',
  'Demand expansion can close the gap sooner; without it, rising wages/expected prices permanently shift LRAS right'],
 'ECON-SP-LEGENDARY-9016':[
  'Higher money demand pushes the rate up and higher supply pushes it down; relative shifts determine the result',
  'Higher money demand pushes the rate up and higher supply pushes it up; the effects reinforce',
  'Higher money demand pushes the rate down and higher supply pushes it down; the effects reinforce',
  'Higher money demand pushes the rate up and higher supply pushes it down; opposite directions ensure an unchanged rate'],
 'PM2C3-LPMM-L-004':[
  'Higher income raises money demand and lower prices reduce it; their relative effects determine the rate change',
  'Higher income raises money demand and lower prices raise it; the unchanged supply yields a higher rate',
  'Higher income reduces money demand and lower prices reduce it; the unchanged supply yields a lower rate',
  'Higher income raises money demand and lower prices reduce it; opposing directions ensure an unchanged rate'],
 'P52A-AS-EL-003':[
  'Capital destruction reduces LRAS; its adverse SRAS effect competes with lower compliance costs, leaving net SRAS uncertain',
  'Capital destruction reduces LRAS; lower compliance costs also reduce SRAS, so both short-run forces shift supply left',
  'Lower compliance costs raise LRAS; capital destruction affects only SRAS, so long-run capacity rises',
  'Capital destruction reduces LRAS; cost relief shifts only AD, so the SRAS direction is certainly left'],
 'P52A-AS-LB-001':[
  'Productivity raises LRAS; higher expected prices oppose productivity and cheaper oil in SRAS, so its net direction is uncertain',
  'Productivity raises LRAS; expected prices and cheaper oil reinforce productivity in SRAS, so both curves shift right',
  'Higher expected prices lower LRAS; productivity and cheaper oil raise SRAS, so the curves move in opposite directions',
  'Productivity leaves LRAS fixed; expected prices and cheaper oil offset in SRAS, so both curves remain unchanged'],
}
for id,answers in choices.items():
 old=q(id)
 task(id,old['q'],answers,old['feedback'],old['type'],keep_image=True,
      proof={'expressions':[['6+.6-1.1',5.5],['6+.6',6.6]],'basis':'Visible B coordinate u=6, inflation=6; intercept identifies expectation plus offset.'} if id=='PG5-PC-L-006' else None)
patch('PM2C3-LPMM-L-004',feedback='Higher real income increases transactions demand for money; a lower price level reduces the nominal money needed for those transactions. Money supply is fixed. The net demand shift, and therefore the equilibrium interest-rate direction, depends on the relative magnitudes of those opposing effects.')
save()
