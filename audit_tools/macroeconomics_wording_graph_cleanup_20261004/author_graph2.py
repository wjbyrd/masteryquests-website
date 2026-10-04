from draft_utils import *
K='KEEP GRAPH'
text('LG-Q-9142','A $60 billion tax cut has an MPC of 0.75; an alternative policy raises government purchases by $45 billion. With the same spending multiplier and no crowding out, how do their effects on aggregate demand and their budget costs compare?',
 'The tax cut initially raises consumption by 0.75 × $60 billion = $45 billion. Purchases also add $45 billion directly. Multiplying each by 4 gives $180 billion in total, but the tax cut costs the budget $60 billion versus $45 billion for purchases.')
draft('PMOE-FX-L-002','Foreign demand causes the shift from D0 to D1. With domestic and foreign price levels fixed, how does the exchange-rate response shown affect the original export stimulus?',[
 'The dollar appreciates 20%, making domestic goods dearer abroad and partly restraining the rise in net exports.',
 'The dollar appreciates 50%, making domestic goods dearer abroad and partly restraining the rise in net exports.',
 'The dollar appreciates 20%, making domestic goods cheaper abroad and reinforcing the rise in net exports.',
 'The dollar appreciates 20%, which establishes that the entire initial increase in export demand is canceled.'],
 'The rate rises from 1.0 to 1.2 foreign-currency units per dollar, a 20% appreciation. At fixed price levels this also is real appreciation, which restrains net exports along the new relationship. It does not measure the size of the original demand shift or prove a full offset.',K,'A/B exchange rates 1.0 and 1.2.')
draft('PMOE-FX-B3-003','The dollar market moves from A to B. An importer faces an unchanged foreign-currency price. How do the dollar, traded quantity and dollar cost of the import change?',[
 'The dollar depreciates 20%, quantity rises 50%, and the import costs 25% more in dollars.',
 'The dollar depreciates 25%, quantity rises 50%, and the import costs about 33.3% more in dollars.',
 'The dollar depreciates 20%, quantity rises 50%, and the import costs 20% more in dollars.',
 'The dollar depreciates 20%, quantity rises about 33.3%, and the import costs 25% less in dollars.'],
 'The graph gives e: 1.0 to 0.8 and quantity: 100 to 150. Thus e falls 20% and quantity rises 50%. An unchanged foreign price costs 1/0.8 = 1.25 times as many dollars. Reciprocal percentage changes are not symmetric.',K,'A=(100,1.0), B=(150,0.8).')
draft('PMOE-FX-L-003','The dollar market changes from the solid curves to the dashed curve, with price levels fixed. Lower domestic real returns and higher domestic political risk are proposed explanations. What does the figure establish, and what remains unresolved?',[
 'Dollar supply rises and the dollar depreciates; separate return or risk evidence is needed to distinguish the causes.',
 'Dollar supply falls and the dollar appreciates; separate return or risk evidence is needed to distinguish the causes.',
 'Dollar supply rises and the dollar depreciates; the downward rate change rules out a rise in political risk.',
 'Dollar demand rises and the dollar depreciates; depreciation identifies lower domestic returns as the only cause.'],
 'S1 lies right of S0, and B has a lower exchange rate and greater quantity than A. With fixed prices this is also real depreciation. Both lower returns and greater risk can encourage foreign-asset purchases; the figure does not separately identify them.',K,'S0/S1 and A/B directions.')
draft('PMOE-FX-EL-002','A report claims that dollar demand did not change between A and B because the final exchange rate is unchanged. What does the diagram show, and does it reveal which market shift occurred first?',[
 'Quantity rises from 100 to 200 and D1 differs from D0; the final equilibrium does not identify the order of the shifts.',
 'Quantity rises from 100 to 150 and D1 differs from D0; the final equilibrium does not identify the order of the shifts.',
 'Quantity rises from 100 to 200 and D1 differs from D0; the unchanged final rate proves demand shifted first.',
 'Quantity rises from 100 to 200, but an unchanged exchange rate means the demand curve remained fixed.'],
 'The figure shows both curves shifting right and quantity doubling from 100 to 200 at rate 1.0. Offsetting effects on the rate do not mean unchanged demand. The final curves reveal no chronology.',K,'D0/D1 distinction and A/B quantities.')
draft('PMOE-FX-LB-003','Compare demand-first and supply-first adjustment from the solid to the dashed curves. Each market clears before the second shift. Approximately how do the intermediate exchange rates differ, and does the order change the final equilibrium?',[
 'Demand first gives 1.2 and supply first 0.8; both paths end at B once both shifts occur.',
 'Demand first gives 1.4 and supply first 0.6; both paths end at B once both shifts occur.',
 'Demand first gives 1.2 and supply first 0.8; these different temporary rates imply different final equilibria.',
 'Both intermediate rates are 1.0; an unchanged final rate rules out a temporary exchange-rate response.'],
 'D1 intersects S0 near 1.2, while D0 intersects S1 near 0.8. The two sequences therefore have different temporary rates but the same final D1-S1 intersection at B. Endpoint evidence cannot establish an unchanged path.',K,'Unlabeled intermediate intersections near rates 1.2 and 0.8.')
text('PMOE-FX-M-006','What condition defines equilibrium in the market for U.S. dollars?',
 'At the equilibrium exchange rate, the quantity of dollars people want to buy equals the quantity they want to sell. Equality of quantities at that rate, rather than identical motives or curve intercepts, clears the market.',
 ['The quantity of dollars demanded equals the quantity supplied at the prevailing exchange rate.','The exchange rate equals the value at which demand for dollars would fall to zero.','Everyone buying dollars has the same reason for doing so as everyone selling dollars.','The quantity of dollars supplied stays fixed regardless of the quantity demanded.'],reason='The unmarked asset adds no discriminating evidence to an equilibrium-definition task. Text directly tests market clearing without invented markers or color lookup.')
draft('PMOE-FX-LB-001','Foreign export demand shifts D0 to D1 and residents\' foreign-asset purchases shift S0 to S1. Foreign purchases of domestic assets are unchanged. What can be inferred from the diagram and the separate asset-flow information?',[
 'The exchange rate is unchanged and gross dollar quantity rises; the asset flows imply higher NCO and therefore higher NX.',
 'The exchange rate rises and gross dollar quantity rises; the asset flows imply higher NCO and therefore higher NX.',
 'The exchange rate is unchanged and gross dollar quantity rises; the increase in gross quantity directly measures the increase in NCO.',
 'The exchange rate is unchanged and gross dollar quantity rises; the unchanged rate implies unchanged NCO despite the asset flows.'],
 'The final intersection is farther right at the same rate. NCO rises because residents buy more foreign assets with foreign purchases of domestic assets unchanged. In consistent accounts NX equals NCO; gross FX turnover itself is not a measure of that net flow.',K,'Final intersection rightward at unchanged vertical level.')
draft('PMOE-POL-M-003','As NCO-determined supply changes from S0 to S1, how does the dollar change in value?',[
 'It appreciates 50%, because the foreign-currency price of a dollar rises from 1.0 to 1.5.',
 'It appreciates 20%, because the foreign-currency price of a dollar rises from 1.0 to 1.2.',
 'It depreciates 50%, because a dollar buys 1.5 rather than 1.0 foreign-currency units.',
 'Its value is unchanged; the smaller quantity of dollars supplied affects trading volume alone.'],
 'The graph moves from A at 1.0 to B at 1.5 foreign-currency units per dollar. Each dollar buys more foreign currency, so it appreciates by 50%. The lower NCO-determined quantity is consistent with that rise.',K,'Rates at A/B and quotation convention.')
draft('PMOE-POL-B2-001','A larger deficit raises domestic real rates and reduces net capital outflow. Which policy transmission fits the supply change shown from S0 to S1?',[
 'Fewer dollars are supplied for foreign-asset purchases, and the dollar appreciates.',
 'More dollars are supplied for foreign-asset purchases, and the dollar depreciates.',
 'Fewer dollars are supplied for foreign-asset purchases, and the dollar depreciates.',
 'Foreign demand for domestic exports rises; this is represented by shifting the dollar-supply curve.'],
 'S1 lies left of S0 and crosses demand at a higher exchange rate. Lower NCO reduces dollar supply for foreign-asset purchases, causing appreciation. The fiscal channel operates through supply, not export demand.',K,'Supply direction and new intersection.',reason='Review graph test carefully: the deficit premise discloses the supply direction; this draft needs a further graph-specific distinction.')
text('ECON-SP-LEGENDARYBOSS-9114','A monetary contraction reduces investment by $40 billion in an economy already below potential. MPC is 0.75. A timely fiscal program adds a total $100 billion to aggregate demand after induced effects. What is the net demand change, and does the fiscal program fully offset the monetary contraction?',
 'The investment decline reduces demand by $40/(1 − 0.75) = $160 billion. The already-total fiscal effect offsets $100 billion of that loss, leaving a $60 billion contraction. Applying the multiplier again to the fiscal total would double-count induced spending.')
draft('ECON-SP-FINALBOSS-4006','Demand expands from AD1-AS2 to AD2-AS2. An analyst calls the new output level permanent capacity growth. If demand then stays at AD2, what does the graph imply?',[
 'Potential remains Y1; rising wage costs move SRAS toward AS1, removing the temporary output gain.',
 'Potential remains Y3; rising wage costs move SRAS toward AS1, removing the temporary output gain.',
 'Potential remains Y1; wage adjustment closes the gap by shifting AD2 back to AD1.',
 'Potential rises to Y2; reaching that output through demand expansion permanently moves LRAS.'],
 'LRAS remains at Y1, while AD2-AS2 is at Y2. Above-potential output raises wage and expected-price pressure, shifting SRAS left toward AS1 and returning output to Y1 on fixed AD2.',K,'LRAS at Y1 versus actual Y2; final intersection.')
draft('ECON-SP-LEGENDARYBOSS-9103','At AD2-AS2, officials call the increase in output permanent capacity growth. There is no resource or technology change, AD2 stays fixed, and expected prices rise. How do the AD-AS and Phillips-curve models challenge their claim?',[
 'Output returns to Y1 as SRAS moves toward AS1; rising expected inflation also removes the temporary below-natural unemployment gain.',
 'Output returns to Y3 as SRAS moves toward AS1; rising expected inflation also removes the temporary below-natural unemployment gain.',
 'Output returns to Y1 as SRAS moves toward AS1; this means the natural unemployment rate permanently rises.',
 'Output stays at Y2 as LRAS moves right; rising expected inflation permanently increases productive capacity.'],
 'The graph places LRAS at Y1, not the demand-driven Y2. Higher wage and price expectations move SRAS left with AD2 fixed. In the Phillips model, the upward expectations adjustment returns unemployment to the unchanged natural rate.',K,'Current Y2 and LRAS at Y1.')
draft('ECON-SP-LEGENDARYBOSS-9102','An adverse supply shock moves the economy from AD1-AS2 to AD1-AS1. While AS1 persists, compare keeping AD1 with expanding demand to AD2. How should the output-restoration claim be evaluated?',[
 'Expansion reaches Y1/P3 instead of Y3/P2; it restores output but leaves prices above the original P1.',
 'Expansion reaches Y2/P3 instead of Y1/P2; it overshoots potential and leaves prices above the original P1.',
 'Expansion reaches Y1/P3 instead of Y3/P2; returning to Y1 proves that the original supply conditions have been restored.',
 'Expansion reaches Y1/P1; recovering original output also restores the original price level despite AS1 remaining in place.'],
 original['ECON-SP-LEGENDARYBOSS-9102']['feedback'],K,'Counterfactual outcomes Y3/P2 and Y1/P3 versus original Y1/P1.')
draft('ECON-SP-LEGENDARYBOSS-9104','At AD1-AS1, wage expectations gradually fall with AD1 fixed. Alternatively, officials could move demand to AD2 before wages adjust. How do the two routes back toward potential compare?',[
 'Wage adjustment reaches Y1/P1; demand support reaches Y1/P3. Equal output recovery need not give equal prices.',
 'Wage adjustment reaches Y2/P1; demand support reaches Y2/P3. Equal output recovery need not give equal prices.',
 'Wage adjustment reaches Y1/P1; demand support reaches Y1/P3. The latter must therefore have raised productive capacity.',
 'Both routes reach Y1/P1; once output is restored, the price level is independent of how recovery occurred.'],
 original['ECON-SP-LEGENDARYBOSS-9104']['feedback'],K,'Two recovery intersections and LRAS.')
draft('ECON-SP-FINALBOSS-4010','Demand surprise moves the economy from c to a. Officials promise to maintain the unemployment rate at a with inflation fixed at the rate shown there. With the natural rate unchanged, what happens as expectations catch up?',[
 'The unemployment target is below U2; maintaining it requires renewed inflation surprises rather than fixed inflation I2.',
 'The unemployment target is below U3; maintaining it requires renewed inflation surprises rather than fixed inflation I1.',
 'The unemployment target is U1; holding inflation at I2 permanently lowers the natural rate to that target.',
 'The unemployment target is U1; expected inflation shifts the short-run curve downward until fixed I2 sustains it.'],
 'Point a is U1/I2, left of natural unemployment U2. Once I2 is expected, b is the corresponding natural-rate equilibrium. Keeping unemployment below natural requires continuing inflation surprises, not the same fixed I2.',K,'a left of LRPC, I2 at a/b.')
draft('ECON-SP-LEGENDARYBOSS-9107','After the demand surprise c to a, compare repeatedly keeping unemployment at a with accepting b once its inflation rate is expected. What tradeoff does the graph illustrate?',[
 'Keeping U1 requires renewed inflation surprises; accepting b returns unemployment to U2 while stabilizing inflation at I2.',
 'Keeping U2 requires renewed inflation surprises; accepting b returns unemployment to U3 while stabilizing inflation at I1.',
 'Keeping U1 requires renewed inflation surprises; accepting b permanently raises the natural rate from U1 to U2.',
 'Both strategies sustain U1 at I2 because the original demand surprise permanently changes the long-run tradeoff.'],
 'a lies left of the LRPC at U2, while b lies on it at I2. Repeatedly pushing unemployment below natural requires inflation above updated expectations. Accepting b gives up the temporary employment gain without changing the natural rate.',K,'a/b relative to LRPC and their common inflation rate.')
draft('ECON-SP-FINALBOSS-4012','Starting at b, policymakers reduce inflation to I1 before expectations change. If expectations later adapt to I1 and the natural rate stays fixed, how should the transition be interpreted?',[
 'The path is b-d-c: unemployment first rises, then returns to its natural rate as the short-run curve shifts down.',
 'The path is b-a-c: unemployment first rises, then returns to its natural rate as the short-run curve shifts down.',
 'The path is b-d-c: the return occurs because the natural rate falls permanently from U3 to U2.',
 'The path stops at d: changing expectations cannot alter unemployment when actual inflation stays at I1.'],
 'With initial expectations, I1 intersects SRPC2 at d, U3. Lower expectations shift the curve to SRPC1 and allow c at U2. The change in actual unemployment is temporary; LRPC stays fixed.',K,'b/d/c and curves through them.')
draft('ECON-SP-FINALBOSS-4013','At d after disinflation, actual inflation is held at I1. Compare a credible policy whose lower inflation becomes expected with a policy that leaves expectations at their old level.',[
 'Lower expectations allow c at U2; old expectations leave d at U3, so commitment alone is not the same as belief.',
 'Lower expectations allow a at U1; old expectations leave d at U3, so commitment alone is not the same as belief.',
 'Lower expectations allow c at U2; this shows credibility permanently reduces the natural rate.',
 'Both cases reach c at U2 immediately, because announcing a fixed actual rate also fixes expectations.'],
 original['ECON-SP-FINALBOSS-4013']['feedback'],K,'c/d at the same inflation rate but different expectations curves.')
draft('ECON-SP-LEGENDARYBOSS-9108','During the disinflation from b, a credible announcement immediately lowers expectations, but existing wage contracts adjust gradually. Which endpoint and transition-cost claim fit the diagram?',[
 'c is the eventual endpoint; gradual contract adjustment can still leave temporary unemployment above U2.',
 'a is the eventual endpoint; gradual contract adjustment can still leave temporary unemployment above U2.',
 'c is the eventual endpoint; immediate belief alone eliminates all unemployment costs despite the contract lag.',
 'd is the eventual endpoint; a contract lag permanently prevents the lower expectations from affecting supply.'],
 'At lower inflation I1 and unchanged natural unemployment U2, the endpoint is c. Credibility supports the lower SRPC, but contracts can delay cost adjustment, leaving temporary costs before reaching it.',K,'c at lower inflation on LRPC; d above natural unemployment.')
draft('ECON-SP-LEGENDARYBOSS-9115','Compare e to d with g to a in the money-market diagram. How do money-supply changes help explain the interest-rate outcomes?',[
 'e-d combines opposing pressures yet raises the rate from r2 to r3; g-a combines reinforcing upward pressures and raises it from r1 to r4.',
 'e-d combines opposing pressures and lowers the rate from r3 to r2; g-a combines reinforcing upward pressures and raises it from r1 to r4.',
 'e-d raises the rate from r2 to r3 because higher money demand and higher supply both push rates upward.',
 'g-a raises the rate from r1 to r4, proving that a money-demand increase has the same rate effect regardless of the supply response.'],
 'e-d raises both MD and MS: demand pushes rates up while supply pushes them down, with r3 above r2 in this drawing. g-a raises MD but reduces MS, reinforcing the increase r1 to r4. The net result of opposing shifts depends on their sizes.',K,'e/d/g/a rates and associated curves.')
draft('ECON-SP-LEGENDARYBOSS-9109','A report attributes both b-c and c-f to weaker aggregate demand with unchanged expectations. Which correction uses the plotted evidence?',[
 'b-c fits weaker demand; c-f raises inflation at unchanged unemployment, requiring a change in the short-run relationship.',
 'b-c fits stronger demand; c-f lowers inflation at unchanged unemployment, requiring a change in the short-run relationship.',
 'b-c fits weaker demand; c-f also reflects weaker demand because every change in inflation is movement along one SRPC.',
 'c-f raises inflation at unchanged unemployment; that observation alone proves the change came from expectations rather than supply.'],
 'b-c moves down and right along SRPC1. c and f share U3 but have inflation I2 and I4 on different curves. This second change cannot be a fixed-expectations demand movement; the graph alone need not distinguish expectations from a supply disturbance.',K,'b/c on SRPC1 and c/f vertically separated at U3.')
text('PG4-MM-EL-001','A student says a fall in the nominal interest rate from 8% to 6%, with income and the price level unchanged, shifts the money-demand curve right. What is the error?',
 'The nominal interest rate is the opportunity cost represented on the money-demand curve. A rate change alters quantity demanded along that curve; a change in income or prices would shift it.',
 ['The rate change increases quantity demanded along the existing money-demand curve.','The rate change increases money demand at every interest rate, shifting the entire curve.','The rate change directly increases the fixed money supply while money demand remains constant.','The rate change shifts both money supply and money demand by the same amount.'])
text('PG4-MM-H-001','Holding income and the price level fixed, how does a lower nominal interest rate affect the quantity of money people want to hold?',
 'A lower nominal rate reduces the interest forgone by holding money rather than bonds. Quantity demanded therefore rises along the unchanged money-demand curve.',
 ['It increases because the opportunity cost of holding money falls.','It decreases because money earns less interest than before.','It stays unchanged because only the central bank chooses desired money holdings.','It increases because a lower rate directly shifts the central bank\'s money supply.'])
draft('PG4-MM-L-001','Suppose the nominal interest rate is temporarily 8% while the displayed money supply stays fixed. What adjustment would move this market toward equilibrium?',[
 'People hold more money than they want, so bond purchases raise bond prices and push the interest rate down.',
 'People want more money than they hold, so bond sales lower bond prices and push the interest rate up.',
 'People hold more money than they want, so they sell bonds and push the interest rate up.',
 'People want more money than they hold, so the imbalance automatically shifts money supply right.'],
 'At 8%, MD0 shows quantity demanded below the fixed supply of 100. People try to exchange excess balances for bonds. Bond prices rise and yields fall toward the plotted equilibrium rate of 6%.',K,'Money demanded at 8% relative to MS0=100.')
text('PG4-MM-M-002','In a liquidity-preference model where the central bank fixes the nominal quantity of money, why is the money-supply curve vertical?',
 'The model holds nominal money supply constant at every interest rate. A change in the interest rate can alter quantity demanded, but does not change the supplied quantity under this assumption.',
 ['The quantity supplied stays the same at different nominal interest rates.','The quantity demanded stays the same at different nominal interest rates.','The interest rate stays fixed regardless of money demand.','Income and the price level must both remain zero.'])
draft('PG4-MM-M-006','Which policy action is consistent with the change from MS0 to MS1, holding money demand fixed?',[
 'An action that reduces the money supply, putting upward pressure on the interest rate.',
 'An action that increases the money supply, putting downward pressure on the interest rate.',
 'An action that reduces the money supply, putting downward pressure on the interest rate.',
 'An action that raises desired money holdings without changing the money supply.'],
 'MS1 lies left of MS0, with the rate rising from 4% to 6%. A reduction in money supply produces this response on fixed MD0. A demand shift would be a different change.',K,'MS1=75 versus MS0=100; rates 6 versus 4.')
draft('PG4-MM-EL-005','A student treats higher money demand as higher aggregate spending. Using both panels, what is wrong with that argument for the move from A to B?',[
 'The rate rises from 2% to 4%; reduced interest-sensitive spending lowers equilibrium output to 105 rather than increasing AD.',
 'The rate rises from 2% to 6%; reduced interest-sensitive spending lowers equilibrium output to 125 rather than increasing AD.',
 'The rate rises from 2% to 4% and output falls to 105 because higher money demand directly lowers productive capacity.',
 'The rate rises from 2% to 4%; wanting more liquid balances is itself extra goods demand, so the output decline must be unrelated.'],
 'The left panel shows MD increasing at fixed money supply, raising the rate from 2% to 4%. The right panel shows AD falling and output moving from 150 to 105. Desired liquid balances and desired goods expenditure are different; the link runs through borrowing costs.',K,'Rates 2/4 and output 150/105; fixed MS/SRAS.')
draft('PG4-MM-L-005','Which transmission mechanism explains the changes from A to B in both panels?',[
 'Money demand rises, raising the rate; weaker interest-sensitive spending contracts AD and lowers output and prices.',
 'Money supply rises, lowering the rate; stronger interest-sensitive spending expands AD and raises output and prices.',
 'Money demand rises, raising the rate; lower output reflects a contraction of SRAS rather than lower spending.',
 'Money supply falls, raising the rate; weaker interest-sensitive spending contracts AD and lowers output and prices.'],
 'The supply of money stays fixed while MD shifts right. Higher rates reduce spending, shifting AD left along fixed SRAS. The fourth account has a valid transmission direction, but its money-supply trigger is not the one drawn.',K,'Which curve shifts in the money market and which remains fixed in the goods market.')
draft('PG4-MM-M-010','Which mechanism connects A to B in the money market with A to B in the output market?',[
 'A rise in borrowing costs reduces investment and other interest-sensitive spending.',
 'A fall in borrowing costs increases investment and other interest-sensitive spending.',
 'A rise in borrowing costs lowers firms\' production costs and expands short-run supply.',
 'A rise in desired money holdings directly increases spending on goods and services.'],
 'The left panel shows a higher rate at B. Higher borrowing costs reduce investment demand; the right panel consequently shows lower AD. A desire to hold money is not itself a demand for goods.',K,'Direction of the A/B interest-rate change and AD shift.')
draft('PG4-MM-M-009','After the interest-rate change shown on the left, what happens to spending and the output-market equilibrium on the right?',[
 'Lower interest-sensitive spending shifts AD left; output is 105 and the price level is 45 at B.',
 'Lower interest-sensitive spending shifts AD left; output is 125 and the price level is 50 at B.',
 'Lower production costs shift SRAS right; output is 105 and the price level is 45 at B.',
 'Only a movement along AD occurs; output is 105 and the price level is 45 with spending plans unchanged.'],
 'B is at output 105 and price 45. Higher interest rates reduce planned spending at a given price level, shifting AD rather than moving along it. SRAS is unchanged.',K,'B=(105,45), lower AD with unchanged SRAS.')
draft('PG4-MPT-M-003','Which output-market response matches the monetary change shown across the panels?',[
 'Borrowing costs restrain spending; AD shifts left to an equilibrium at output 100 and price level 45.',
 'Borrowing costs restrain spending; AD shifts left to an equilibrium at output 105 and price level 40.',
 'Borrowing costs lower production costs; SRAS shifts right to output 100 and price level 45.',
 'Output 100 and price level 45 result from moving along unchanged AD when money supply falls.'],
 'The rate rises as money supply contracts. Interest-sensitive spending falls, shifting AD left; the right-panel B is output 100, price 45, on unchanged SRAS.',K,'B=(100,45) and AD/SRAS positions.')
save()
