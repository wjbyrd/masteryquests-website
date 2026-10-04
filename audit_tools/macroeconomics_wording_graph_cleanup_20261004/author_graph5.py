from draft_utils import *
K='KEEP GRAPH'
draft('43261','An analyst measures the saving-supply shift using only the change in equilibrium quantity from A to B. Is that measure correct for this graph?',[
 'No. Supply shifts left 40 units at a common rate, while equilibrium investment falls only 20 units.',
 'No. Supply shifts left 60 units at a common rate, while equilibrium investment falls only 20 units.',
 'Yes. The 20-unit equilibrium decline is the supply shift because investment demand stays fixed.',
 'No. The 40-unit horizontal difference is an investment-demand shift rather than a saving change.'],
 'At rate 8%, S0 supplies 120 and S1 supplies 80, a 40-unit shift. A to B changes equilibrium quantity from 100 to 80. The higher rate induces movement along the schedules, so the equilibrium decline is not the fixed-rate shift.',K,'Common-rate S0/S1 gap 40; A/B quantity gap 20.')
draft('43290','A larger deficit causes the shift shown in saving supply. How should the resulting change in firms\' investment from A to B be interpreted?',[
 'Investment falls 40 units as firms move along D0 in response to the higher real rate.',
 'Investment falls 80 units as firms move along D0 in response to the higher real rate.',
 'Investment falls 40 units because the higher real rate shifts the entire investment-demand curve left.',
 'Investment falls 40 units because the deficit directly reduces project profitability at every real rate.'],
 'A is at 100 and B at 60, so equilibrium investment falls 40 units. D0 remains fixed: the saving contraction raises the real rate from 6% to 8%, making fewer projects worthwhile along the existing demand schedule.',K,'A/B quantity 100/60 and unchanged D0.')
draft('43257',original['43257']['q'],[
 'Saving supply shifts left $40 billion, while investment falls $20 billion; the higher rate induces some additional saving.',
 'Saving supply shifts left $40 billion, while investment falls $30 billion; the higher rate induces some additional saving.',
 'Saving supply shifts left $40 billion and investment falls $20 billion; the remaining $20 billion is a rightward shift of investment demand.',
 'Saving supply shifts left $20 billion and investment falls $40 billion; the equilibrium change measures the fixed-rate supply shift.'],
 original['43257']['feedback'],K,'40-unit fixed-rate supply shift versus A/B decline 100 to80.')
draft('43259',original['43259']['q'],[
 '$25 billion; together with the $15 billion private-saving increase, this restores the 40-unit supply shortfall.',
 '$45 billion; together with the $15 billion private-saving increase, this restores a 60-unit supply shortfall.',
 '$5 billion; adding the $15 billion private increase to the 20-unit equilibrium gap restores the original supply schedule.',
 '$55 billion; the private-saving increase must be added to, rather than deducted from, the 40-unit shortfall.'],
 original['43259']['feedback'],K,'Horizontal S0/S1 difference 40, not equilibrium difference20.')
draft('43269','Saving behavior is unchanged as the market moves from A to B. Which economic change is consistent with the pattern shown?',[
 'Higher expected project profitability increases investment demand at each real rate.',
 'Lower expected project profitability reduces investment demand at each real rate.',
 'The higher real rate itself shifts investment demand right rather than causing movement along it.',
 'A larger public deficit shifts saving supply left while investment demand stays fixed.'],
 'Both the rate and quantity rise on unchanged S0, with D1 right of D0. Greater project profitability can shift investment demand. A higher rate is part of the equilibrium response, not the cause of a demand shift.',K,'A/B rate and quantity rise; D0/D1 with fixed S0.')
draft('43275','With saving behavior unchanged, what could explain the move from A to B?',[
 'Firms expect weaker future sales, reducing planned investment at each real rate.',
 'Firms expect stronger future sales, increasing planned investment at each real rate.',
 'The lower real rate itself reduces planned investment at every real rate.',
 'Households become more willing to save, shifting the supply of funds right.'],
 'B has a lower rate and smaller quantity on unchanged S0. D1 is left of D0, consistent with weaker expected sales. Lower borrowing costs alone would move along investment demand rather than shifting it.',K,'A=(80,5), B=(60,4), demand shift left.')
draft('43270','How does the investment-demand change shown affect the equilibrium, and what induces savers to provide the new quantity?',[
 'The rate rises from 5% to 7% and quantity rises from 80 to 120; the higher return induces movement along S0.',
 'The rate rises from 5% to 6% and quantity rises from 80 to 100; the higher return induces movement along S0.',
 'The rate rises from 5% to 7% and quantity rises from 80 to 120 because the rate increase shifts S0 right.',
 'Quantity rises from 80 to 120 while the rate falls, because stronger investment demand reduces borrowing costs.'],
 'The graph shows A at 80/5 and B at 120/7. Investment demand shifts right, and the higher real rate encourages additional saving along the unchanged supply schedule.',K,'A/B coordinates and unchanged supply.')
text('43276','If firms reduce investment demand at every real interest rate while saving supply is unchanged, what happens to the equilibrium real rate and quantity of loanable funds?',
 'A leftward investment-demand shift lowers both the real rate and equilibrium quantity on an upward-sloping saving-supply curve.',
 ['Both the real rate and quantity fall.','Both the real rate and quantity rise.','The real rate rises and quantity falls.','The real rate falls and quantity rises.'],reason='A basic comparative-statics question fits its Easy tier; adding multiple coordinate readings would increase load without improving the intended concept.')
text('43288','National saving falls at every real interest rate while investment demand is unchanged. What happens in the loanable-funds market?',
 'Lower saving shifts supply left. The real rate rises, and firms reduce investment along the unchanged demand curve.',
 ['The real interest rate rises and equilibrium investment falls.','The real interest rate falls and equilibrium investment rises.','Both the real interest rate and investment rise.','Both the real interest rate and investment fall.'],reason='The Easy task tests the direction of crowding out; a numerical graph add-on would impose unnecessary additional work.')
draft('43272','Which change could account for D0 moving to D1?',[
 'New technology raises expected profitability of investment projects.',
 'A weaker sales outlook reduces expected profitability of investment projects.',
 'Households decide to save more at every real interest rate.',
 'A larger government surplus increases public saving.'],
 'D1 is right of D0, showing stronger demand for investment funds at each rate. Higher expected project returns can explain that shift; household and public saving affect supply.',K,'D1 right of D0.')
draft('43273','The graph shows the investment-demand response to new technology. Suppose a deficit also reduces saving supply by an unknown amount. Which statement separates the plotted result from that added scenario?',[
 'The graph alone raises quantity from 80 to 120; with the added saving decline, the net quantity change from 80 is uncertain.',
 'The graph alone raises quantity from 80 to 140; with the added saving decline, the net quantity change from 80 is uncertain.',
 'The graph alone raises quantity from 80 to 120; the extra deficit leaves that final quantity unchanged because both shocks raise the rate.',
 'The graph alone raises quantity from 80 to 120; the extra deficit must reduce quantity below 80 regardless of its size.'],
 'A/B give the demand-only quantity response 80 to 120 on fixed supply. A saving decline shifts supply left, adding upward rate pressure but opposing the demand-driven quantity increase. Its unknown size prevents determining the combined quantity relative to 80.',K,'A/B quantities80/120 on fixed S0.')
text('43287','A government deficit increases by $30 billion while planned private saving rises by $10 billion at each real interest rate. With investment demand unchanged, how does the net saving change affect the loanable-funds market?',
 'Public saving falls $30 billion while private saving rises $10 billion, reducing national saving by $20 billion at a given rate. Supply shifts left; the real rate rises and investment falls along unchanged demand.',
 ['National saving falls $20 billion, shifting supply left; a higher rate crowds out investment.','National saving rises $40 billion, shifting supply right; a lower rate raises investment.','National saving falls $20 billion, shifting investment demand left and lowering the rate.','National saving is unchanged because an increase in private saving fully offsets any deficit.'],reason='The stem supplies the fiscal accounting and the figure has no dollar scale. Retaining it would require an extra arbitrary scale assignment.')
text('43293','Planned private saving rises by $30 billion and public saving falls by $10 billion at each real rate. What happens to investment in the loanable-funds model if investment demand is unchanged?',
 'The net national-saving increase is $20 billion at a given rate. Supply shifts right, lowering the real rate and encouraging investment along its unchanged demand curve.',
 ['Higher national saving lowers the real rate and raises investment along the existing demand curve.','Lower national saving raises the real rate and reduces investment along the existing demand curve.','The $20 billion net saving increase shifts investment demand right and raises the real rate.','Investment is unchanged because opposing saving changes must cancel completely.'],reason='The accounting determines the qualitative supply change; forcing an unscaled diagram into this task would add redundant reading.')
text('43295','A budget improvement raises planned public saving by $25 billion while private saving falls by $10 billion at each real rate. An analyst says this directly raises firms\' investment demand. How should that claim be corrected?',
 'National saving rises by $15 billion at each rate, shifting supply right. The lower equilibrium real rate then increases investment along unchanged demand. A saving increase does not itself raise project profitability at every rate.',
 ['National saving rises $15 billion; supply shifts right, and the lower rate induces investment along unchanged demand.','National saving rises $15 billion; investment demand shifts right because all additional saving is a new project.','National saving falls $35 billion; supply shifts left and investment falls.','National saving is unchanged; any change in public saving is canceled by private saving.'],reason='The original task is fiscal accounting and induced investment. Text keeps that causal distinction without assigning arbitrary dollar units to the image.')
draft('43289','Which fiscal change is consistent with the move from S0 to S1, holding other saving determinants fixed?',[
 'A larger deficit reduces public and national saving.',
 'A larger surplus increases public and national saving.',
 'An investment tax credit raises the profitability of private projects.',
 'The higher equilibrium rate by itself shifts the entire saving curve left.'],
 'S1 is left of S0, so saving supplied at each real rate falls. A larger government deficit can create that shift. The rate increase is a response to the contraction, not a shift determinant.',K,'S1 left of S0.')
draft('43292','Which description of the plotted move from A to B illustrates crowding out?',[
 'The rate rises from 6% to 8% and investment falls from 100 to 60 as borrowing becomes more costly.',
 'The rate rises from 6% to 7% and investment falls from 100 to 80 as borrowing becomes more costly.',
 'The rate rises from 6% to 8% and investment falls from 100 to 60 because higher rates shift investment demand left.',
 'The rate falls from 8% to 6% and investment rises from 60 to 100, so reduced saving crowds investment in.'],
 'A is 100/6 and B is 60/8. The saving-supply contraction raises borrowing costs and reduces investment along unchanged D0. Crowding out is this induced investment decline, not a shift in investment demand.',K,'A/B rate and quantity readings.')
draft('43297',original['43297']['q'],[
 'Public saving rises $80 billion; lower rates induce a $40 billion decline in private saving.',
 'Public saving rises $60 billion; lower rates induce a $20 billion decline in private saving.',
 'Public saving rises $80 billion; the fixed private-saving schedule means private saving cannot change.',
 'Public saving rises $40 billion; the equilibrium investment increase directly measures the policy-induced supply shift.'],
 original['43297']['feedback'],K,'Fixed-rate supply gap80 and equilibrium quantity change40.')
draft('43305','Both saving supply and investment demand increase. Which statement distinguishes the general prediction from the outcome at A and B?',[
 'Quantity must rise; the rate is generally ambiguous, but the plotted rate is unchanged.',
 'Quantity must rise; the rate is generally ambiguous, and the plotted rate rises.',
 'Quantity rises and the rate is unchanged; every pair of rightward saving and investment shifts has that rate result.',
 'Quantity is generally ambiguous; the unchanged plotted rate means national saving did not rise.'],
 'Both shifts raise quantity, but they exert opposing pressures on the rate. A and B are both at 6%, so those pressures offset in this drawing. That particular offset is not a universal rule.',K,'A/B common rate6 and quantity40/80.')
draft('43309',original['43309']['q'],[
 'Private saving must rise $50 billion: together with public saving falling $10 billion, this gives the plotted $40 billion supply increase.',
 'Private saving must rise $70 billion: together with public saving falling $10 billion, this gives a $60 billion supply increase.',
 'Private saving must rise $30 billion: subtract the $10 billion public-saving loss from the plotted $40 billion increase.',
 'Private saving must rise $10 billion: an unchanged equilibrium rate implies no national-saving change.'],
 original['43309']['feedback'],K,'Horizontal saving-supply shift40 at common rate.')
draft('43311','Which pair of events could produce the changes from the solid to the dashed curves?',[
 'Households plan more saving, and firms expect investment projects to be more profitable.',
 'Households plan less saving, and firms expect investment projects to be less profitable.',
 'Households plan more saving, while firms expect investment projects to be less profitable.',
 'The higher quantity itself shifts both schedules, without any change in saving or investment plans.'],
 'S1 is right of S0 and D1 is right of D0. Higher planned saving explains the supply shift, while higher expected project returns explain investment demand. Equilibrium quantity is a result, not a determinant that shifts both curves.',K,'Directions of both curve shifts.')
draft('43313','What can the marked new equilibrium tell us that the directions of the two shifts alone cannot?',[
 'The real rate is 6%; this is the particular result of the relative supply and demand shifts drawn.',
 'The real rate is 8%; this is the particular result of the relative supply and demand shifts drawn.',
 'The real rate is 6%; every simultaneous rightward supply and demand shift must leave rates unchanged.',
 'The real rate is 6%; the quantity increase proves that only saving supply changed.'],
 'B is at 6%, the same rate as A. Theory alone leaves the rate effect of the two increases ambiguous; their actual sizes and slopes in this figure locate the new intersection.',K,'B rate6 and both rightward shifts.')
draft('43314','The market changes from A to B after saving and investment plans both change. What explains the interest-rate outcome shown?',[
 'The opposing pressures offset here, leaving the rate at 6%; different relative shifts could change the rate.',
 'Investment demand dominates here, raising the rate to 8%; different relative shifts could change the rate.',
 'The rate stays at 6% because every equal-direction pair of supply and demand shifts leaves the rate fixed.',
 'The rate stays at 6% because a doubling of quantity prevents any change in the price of loanable funds.'],
 'Both marked equilibria are at 6%, though quantity rises from 40 to 80. Greater saving puts downward pressure on the rate and greater investment demand puts upward pressure on it. Their offset is specific to the drawn shifts.',K,'Equal A/B rate and larger quantity.')
draft('PG5-PC-H-016','Consumer spending unexpectedly strengthens while expectations, supply conditions and the natural rate remain unchanged. How does A to B represent the short-run response?',[
 'Unemployment becomes 2 points below natural and inflation rises 1 point; this is movement along the existing SRPC.',
 'Unemployment becomes 1 point below natural and inflation rises 2 points; this is movement along the existing SRPC.',
 'Unemployment becomes 2 points below natural and inflation rises 1 point because LRPC shifts left.',
 'Unemployment becomes 2 points below natural and inflation rises 1 point because expectations immediately shift SRPC upward.'],
 original['PG5-PC-H-016']['feedback'],K,'A5/2.5, B3/3.5 and LRPC5.')
draft('PG5-PC-H-022','An unexpected fall in investment occurs before expectations adjust. Supply conditions and the natural rate are unchanged. What does the plotted move from A to B imply?',[
 'Unemployment is 2 points above natural and inflation is 1 point lower; demand weakness moves the economy along SRPC0.',
 'Unemployment is 1 point above natural and inflation is 2 points lower; demand weakness moves the economy along SRPC0.',
 'Unemployment is 2 points above natural and inflation is 1 point lower; the change establishes a permanent rise in structural unemployment.',
 'Unemployment is 2 points above natural and inflation is 1 point lower; lower expected inflation has already shifted SRPC0 downward.'],
 original['PG5-PC-H-022']['feedback'],K,'A5/2.5, B7/1.5 relative to LRPC5.')
draft('PG5-PC-L-018',original['PG5-PC-L-018']['q'],[
 'Keeping unemployment at B\'s 3% requires inflation of 4.5%; holding inflation at 3.5% instead returns unemployment to 5%.',
 'Keeping unemployment at B\'s 3% requires inflation of 5.5%; holding inflation at 4% instead returns unemployment to 5%.',
 'Keeping unemployment at B\'s 3% requires inflation of 3.5%; expected inflation cannot alter a point already reached.',
 'Keeping unemployment at B\'s 3% requires inflation of 4.5%; holding inflation at 3.5% instead permanently lowers the natural rate to 3%.'],
 original['PG5-PC-L-018']['feedback'],K,'Initial inflation at A2.5 and B3.5; B unemployment3 and LRPC5.')
draft('PG5-PC-X-017','Suppose actual inflation is held at B\'s rate while expectations adjust to it. With supply conditions and the natural rate unchanged, what adjustment does this graph predict?',[
 'SRPC shifts upward, and unemployment returns to the natural rate of 5%.',
 'SRPC shifts downward, and unemployment returns to the natural rate of 5%.',
 'SRPC shifts upward, permanently raising the natural rate from 3% to 5%.',
 'LRPC shifts left, allowing unemployment to remain at B\'s 3% once expectations catch up.'],
 'B is above A\'s inflation rate and left of LRPC. Expectations catch up to the higher actual rate, shifting SRPC upward. At that sustained inflation, unemployment returns to the unchanged natural rate 5%.',K,'B above/left of A; LRPC5.')
draft('PG5-PC-X-023','Actual inflation is held at B\'s rate while expectations gradually adjust to it. With the natural rate and supply conditions unchanged, which long-run adjustment fits the figure?',[
 'SRPC shifts downward, and unemployment returns from 7% toward 5%.',
 'SRPC shifts upward, and unemployment returns from 3% toward 5%.',
 'SRPC shifts downward, permanently reducing the natural rate from 7% to 5%.',
 'LRPC shifts right to 7%, making the demand-induced unemployment increase permanent.'],
 'B has unemployment7 and inflation1.5, compared with A at natural unemployment5 and inflation2.5. Adapting to lower inflation shifts SRPC down; the eventual return to5 does not change the natural rate.',K,'B7/1.5 relative to A5/2.5 and LRPC.')
draft('PG5-PC-M-021','How should the change from A to B be interpreted?',[
 'A movement along SRPC0 consistent with weaker demand while expected inflation is unchanged.',
 'A movement along SRPC0 consistent with stronger demand while expected inflation is unchanged.',
 'A downward shift of SRPC0 caused by lower expected inflation.',
 'A rightward shift of LRPC caused by a permanent increase in structural unemployment.'],
 'A and B lie on the same downward-sloping SRPC0, with B showing higher unemployment and lower inflation. That is a demand-related movement along a fixed short-run relationship, not evidence of changed expectations or natural unemployment.',K,'A/B on same curve; B down/right.')
draft('ECON-SP-ELITE-348','Why is it a mistake to treat point a as a permanent outcome when actual inflation stays at its displayed rate and the natural rate is unchanged?',[
 'a lies below natural unemployment; expectations catch up and move the economy toward b on the same inflation line.',
 'a lies above natural unemployment; expectations fall and move the economy toward c on the same inflation line.',
 'a lies below natural unemployment; reaching it permanently shifts LRPC left to U1.',
 'a lies below natural unemployment; the return toward b occurs because the natural rate rises from U1 to U2.'],
 'a is left of LRPC at U2 and at inflation I2. As I2 becomes expected, the short-run curve shifts up and the fixed-inflation outcome approaches b. The initial departure from natural unemployment is temporary.',K,'a below natural U2 and b on LRPC at sameI2.')
draft('ECON-SP-LEGENDARY-9007','Starting at c, policymakers use repeated demand expansion to keep unemployment at U1. Which graph-based criticism applies if they also promise to hold inflation at I2?',[
 'At I2, adjusted expectations support b at U2, so maintaining U1 instead requires further inflation surprises.',
 'At I2, adjusted expectations support d at U3, so maintaining U1 instead requires further inflation surprises.',
 'At I2, adjusted expectations support b at U2, proving that demand expansion raised natural unemployment.',
 'At I2, point a remains sustainable because keeping actual inflation fixed prevents expectations from changing.'],
 'The graph puts the natural rate at U2 and b at I2. a at U1 is on the old expectations curve. Once expectations adjust, holding U1 below natural requires renewed surprises rather than the original fixed inflation rate.',K,'a/b at I2; LRPC at U2.')
draft('ECON-SP-LEGENDARY-9046','After c to a, policymakers keep actual inflation at its new rate and assume unemployment will stay at a. With unchanged supply conditions, what is the likely correction as expectations adapt?',[
 'The economy approaches b on LRPC as higher expected inflation shifts SRPC upward.',
 'The economy approaches d on LRPC as higher expected inflation shifts SRPC upward.',
 'The economy approaches b because the natural rate rises to match the earlier demand expansion.',
 'The economy stays at a because demand expansion permanently lowers natural unemployment.'],
 'At the sustained inflation I2, b lies on LRPC and a does not. Expectations catch up, moving the short-run relationship upward and returning unemployment to U2. The natural rate does not change.',K,'b on LRPC atI2; a offLRPC.')
draft('ECON-SP-ELITE-351','With supply conditions and expectations unchanged, what does the move from c to b on SRPC1 represent?',[
 'Stronger demand: actual inflation rises while unemployment falls.',
 'Weaker demand: actual inflation falls while unemployment rises.',
 'Higher expected inflation: actual inflation rises at unchanged unemployment.',
 'Lower natural unemployment: LRPC shifts left as the economy moves along SRPC1.'],
 'b is above and left of c on the same short-run curve. That movement represents higher actual inflation and lower unemployment with the curve\'s expectations held fixed.',K,'c/b direction and common SRPC1.')
text('PM2B3-SRC-FB-004','Capital deepening initially raises output per worker with technology and other productivity determinants unchanged. Later, output per worker rises again even though capital per worker is fixed. How do the two increases differ?',
 'The first change is a movement along a production relationship as capital per worker rises. The later gain at unchanged capital requires another determinant, such as technology or human capital, to improve.',
 ['The first is capital deepening; the later gain requires an improvement in another productive factor or technology.','Both are movements along the same curve caused solely by more capital per worker.','The first is a technology improvement; the later gain is diminishing returns to unchanged capital.','Both show that a falling marginal product causes the level of productivity to fall.'])
draft('ECON-SP-LEGENDARY-9038','Starting at AD1-AS2, demand moves to AD2 and supply to AS1. An analyst generalizes the plotted output outcome to every demand expansion combined with a supply contraction. What is wrong with that claim?',[
 'Output is unchanged at Y1 here, but that requires the two output effects to offset; a different-sized pair need not do so.',
 'Output rises to Y2 here, but that requires the demand effect to dominate; a different-sized pair need not do so.',
 'Output is unchanged at Y1 here, proving that opposite-direction AD and SRAS shifts always cancel in output.',
 'Output is unchanged at Y1 here because neither shift can affect real output, only prices.'],
 'The initial and final intersections both have outputY1, while prices riseP1 toP3. AD expansion raises output and SRAS contraction lowers it; their equality is a feature of these plotted magnitudes, not a universal theorem.',K,'Initial/final Y1 and P1/P3.',inference={'type':'assumption test','new':'Identify offsetting magnitudes as the condition behind unchanged output.'})
draft('ECON-SP-LEGENDARY-9039','The economy moves from AD2-AS1 to AD1-AS2. Compared with reducing AD alone while holding AS1 fixed, what does the simultaneous supply improvement accomplish?',[
 'It prevents the fall from Y1 to Y3 and leaves output at Y1, while prices fall farther to P1.',
 'It prevents the fall from Y2 to Y1 and leaves output at Y2, while prices fall farther to P2.',
 'It leaves output at Y1 because demand contraction has no real effect even without the supply improvement.',
 'It leaves output at Y1 by shifting aggregate demand back to AD2, reversing the original demand restraint.'],
 'AD restraint alone reaches AD1-AS1 atY3/P2. Adding the AS2 improvement instead gives AD1-AS2 atY1/P1. The supply gain offsets the demand-related output loss while reinforcing the price decline.',K,'AD1-AS1 counterfactualY3/P2 versus AD1-AS2Y1/P1.',inference={'type':'counterfactual','new':'Compare the combined shocks with the demand-only outcome.'})
draft('ECON-SP-LEGENDARY-9002','From AD1-AS2, a supply disruption moves the economy to AS1. Officials then choose AD2 to restore output. If their goal had instead been the original price level, would that same demand response achieve it?',[
 'No. AD2 restores Y1 but raises prices to P3; the original price target would require demand restraint and a larger output loss.',
 'No. AD2 raises output to Y2 and prices to P2; the original price target would require demand restraint and a larger output loss.',
 'Yes. Returning to Y1 at P3 restores the original price level because productive capacity is unchanged.',
 'Yes. Any demand change that restores potential output also reverses the price effect of a supply disruption.'],
 'The original point isY1/P1, the supply-shock pointY3/P2, and accommodationY1/P3. Supporting output worsens the price-level increase. With disrupted supply fixed, bringing prices back down instead requires lower demand and more output loss.',K,'Original and accommodated price/output relative to disrupted supply.',inference={'type':'policy evaluation','new':'Distinguish output restoration from the counterfactual original-price target.'})
draft('ECON-SP-ELITE-308','Starting at AD1-AS2, AD rises to AD2 and SRAS falls to AS1. Why would using the plotted final output as the effect of the demand expansion alone be misleading?',[
 'Final output is Y1; the supply contraction offsets the demand-driven increase that would otherwise reach Y2.',
 'Final output is Y2; the supply contraction offsets part of a demand increase that would otherwise reach Y3.',
 'Final output is Y1; that proves the demand expansion has no effect on output even with supply fixed.',
 'Final output is Y1 because the two curves shift in ways that always leave output unchanged regardless of size.'],
 'AD2-AS1 isY1/P3, but demand expansion alone would reach AD2-AS2 atY2/P2. The unchanged final output combines opposing effects; it does not show an ineffective demand channel.',K,'Demand-onlyY2/P2 and combinedY1/P3.',inference={'type':'counterfactual','new':'Separate the demand-only effect from the observed joint-shock result.'})
draft('ECON-SP-ELITE-309','Starting at AD2-AS1, AD falls to AD1 while SRAS rises to AS2. Output ends where it began. What does the figure imply about a claim that the supply improvement had no output benefit?',[
 'The claim is wrong: without the supply improvement, AD1-AS1 would leave output at Y3 rather than Y1.',
 'The claim is wrong: without the supply improvement, AD1-AS1 would leave output at Y2 rather than Y1.',
 'The claim is right: unchanged final output means each individual shock had zero effect on output.',
 'The claim is right: supply improvements affect the price level but cannot affect output in the short run.'],
 'The combined endpoint AD1-AS2 isY1/P1. Demand contraction without the supply improvement would giveY3/P2. The supply change has a positive output contribution even though the two effects cancel in the observed total.',K,'AD1-AS1Y3 versus final AD1-AS2Y1.',inference={'type':'counterfactual','new':'Identify a beneficial supply effect hidden by the joint unchanged-output result.'})
save()
