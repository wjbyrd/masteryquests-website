from draft_utils import *
K='KEEP GRAPH'
draft('PG3-AD-EL-001','A student calls the change from AD0 to AD1 an increase in aggregate supply because more output is shown. At a price level of 50, which response fits the diagram?',[
 'Quantity demanded rises by about 55 units; this is a demand shift, not evidence of increased productive capacity.',
 'Quantity demanded falls by about 55 units; this is a demand contraction, not a reduction in productive capacity.',
 'Output capacity rises by about 55 units; the horizontal distance measures the shift in long-run supply.',
 'Quantity demanded rises by about 155 units; the new quantity is also the size of the demand shift.'],
 'At price 50 the two demand curves show roughly 100 and 155 units. Their difference is about 55. Comparing quantities at a common price identifies an AD shift; it does not measure productive capacity.',K,'At P=50, AD0≈100 and AD1≈155.')
draft('PG3-AD-L-001','Government purchases rise while private investment partly offsets the increase. The net change is shown by AD0 to AD1. At price level 50, what does the diagram establish about spending and equilibrium output?',[
 'Desired spending rises by about 55 units; the equilibrium output response still requires aggregate-supply information.',
 'Desired spending falls by about 55 units; the equilibrium output response still requires aggregate-supply information.',
 'Equilibrium output rises by about 55 units; the common-price distance already includes any price adjustment.',
 'Desired spending rises by about 155 units; the graph identifies that entire amount as the increase in government purchases.'],
 'AD0 is near 100 and AD1 near 155 at price 50. This is a net common-price demand increase of about 55, after the investment offset. The figure has no supply curve, so it cannot determine the final output increase or separate gross spending changes.',K,'Common-price distance near 55 at P=50; absence of an AS curve.')
draft('PG3-AD-M-002',original['PG3-AD-M-002']['q'],['Households increase planned consumption at each price level.','Firms cut planned investment at each interest rate.','Input costs rise while planned spending is unchanged.','The price level falls with spending plans otherwise unchanged.'],'AD1 lies right of AD0: more real output is demanded at each price level. Higher planned consumption can produce that shift; falling investment would shift AD the other way.',K,'AD1 right of AD0.')
draft('PG3-AD-M-004',original['PG3-AD-M-004']['q'],['Firms reduce planned investment as their sales outlook weakens.','Foreign income rises, increasing demand for domestic exports.','Production becomes less costly after an input-price decline.','The domestic price level rises along an unchanged AD curve.'],'AD1 lies left of AD0. A weaker investment outlook reduces spending at each price level. Export growth would shift demand right, and a change in the price level alone moves along AD.',K,'AD1 left of AD0.')
draft('PG3-AD-L-002','Falling confidence reduces consumption while higher government purchases raise spending. The result is the change from AD0 to AD1. What can be inferred about these competing effects?',[
 'The consumption reduction is larger; the graph gives their net effect, not each separate amount.',
 'The purchases increase is larger; the graph gives their net effect, not each separate amount.',
 'The consumption reduction is larger; its full amount equals the horizontal distance between the curves.',
 'The two effects are equal; the distance between the curves reflects only a lower price level.'],
 'AD1 lies left of AD0, so the negative consumption effect dominates. The distance measures the net change at a common price, not either gross effect. A price-level change would be a movement along a curve.',K,'Leftward net AD displacement.')
draft('ECON-SP-ELITE-341','The economy begins at AD2-AS2. Higher input costs then move supply to AS1 while demand stays fixed. A commentator says the resulting output loss proves demand must also have fallen. Does the graph support that claim?',[
 'No. Output falls from Y2 to Y1 while the price level rises from P2 to P3; a supply contraction can produce both changes.',
 'No. Output falls from Y1 to Y3 while the price level rises from P1 to P2; a supply contraction can produce both changes.',
 'Yes. The move from Y2/P2 to Y1/P3 requires a demand contraction because supply alone changes only prices.',
 'Yes. The move from Y2/P2 to Y1/P3 shows that lower spending is the cause of every fall in equilibrium output.'],
 'On fixed AD2, AS2 to AS1 changes equilibrium from Y2/P2 to Y1/P3. Costlier production lowers output and raises the price level without a demand decline; output alone does not identify the shock.',K,'AD2-AS2 at Y2/P2 and AD2-AS1 at Y1/P3.',inference={'type':'diagnosis','new':'Reject inferring a demand shock solely from an output decline.'})
draft('ECON-SP-ELITE-340','Starting at AD1-AS2, higher input costs reduce short-run aggregate supply. Which outcome in the graph illustrates stagflation?',[
 'Y3/P2: lower output and a higher price level.',
 'Y1/P3: lower output and a higher price level.',
 'Y3/P2: lower output caused by weaker aggregate demand.',
 'Y2/P2: higher output caused by improved productive capacity.'],
 'AD1-AS2 is Y1/P1. Moving to AS1 with AD1 fixed gives Y3/P2: output falls and the price level rises. That combination is the adverse-supply pattern, not a demand recession.',K,'Initial and adverse-supply intersections.')
draft('ECON-SP-ELITE-312','An oil shock moves the economy from AD1-AS2 to AD1-AS1. Policymakers then move demand to AD2. A claim says this response restores the economy to its original condition. What does the diagram show?',[
 'Output returns to Y1, but prices reach P3 rather than P1; restoring output does not reverse the supply shock.',
 'Output rises to Y2 and prices reach P2; the response overshoots the original output level.',
 'Output returns to Y1 and prices reach P3; this means productive capacity has increased enough to undo the oil shock.',
 'Output remains at Y3 with prices at P2; the stimulus only prevents a further output decline.'],
 'The original equilibrium is Y1/P1; the supply shock gives Y3/P2; AD2-AS1 gives Y1/P3. Demand support offsets the output loss at a higher price level and does not restore the original supply conditions.',K,'All three intersections and the LRAS benchmark.',inference={'type':'policy evaluation','new':'Evaluate whether restoring output also restores the pre-shock economy.'})
draft('ECON-SP-ELITE-339','Starting at AD1-AS2, the economy ends at AD2-AS1. Which combination of shocks explains the unchanged output level and the change in prices shown?',[
 'An adverse supply shock and demand stimulus offset in output, while both raise the price level.',
 'A favorable supply shock and demand restraint offset in output, while both lower the price level.',
 'An adverse supply shock and demand restraint reinforce the output loss while their price effects offset.',
 'Demand stimulus alone raises prices while output stays at potential immediately because short-run supply is vertical.'],
 'The figure moves from Y1/P1 to Y1/P3. AS shifts left and AD shifts right, with opposing output effects of the depicted sizes. Both shifts raise prices. Unchanged output does not imply that neither curve changed.',K,'AD1-AS2 versus AD2-AS1; directions of both shifts.')
draft('ECON-SP-HARD-216','At AD2-AS2, demand and productive capacity remain unchanged. How would wage adjustment move the economy toward long-run equilibrium?',[
 'Wages rise; SRAS contracts, bringing output toward Y1 and prices toward P3.',
 'Wages fall; SRAS expands, bringing output toward Y2 and prices toward P1.',
 'Wages rise; demand contracts, bringing output toward Y1 and prices toward P3.',
 'Wages fall; lower production costs bring output toward Y1 while LRAS shifts left.'],
 'The starting output Y2 exceeds potential Y1. Upward wage and expected-price pressure shifts SRAS from AS2 toward AS1. On AD2 the long-run endpoint is Y1/P3; capacity and demand need not change.',K,'Y2 relative to LRAS at Y1; endpoint on AD2.')
draft('ECON-SP-HARD-217','The economy is at AD1-AS1. If demand and potential output do not change, how would flexible wages help close the gap shown?',[
 'Lower wages shift SRAS right, raising output from Y3 toward Y1 and lowering prices toward P1.',
 'Higher wages shift SRAS left, lowering output from Y2 toward Y1 and raising prices toward P3.',
 'Lower wages shift LRAS right, raising potential output from Y3 to Y1.',
 'Lower wages shift AD right, moving output from Y3 to Y1 at a higher price level.'],
 'The graph places current output at Y3, left of potential Y1. Lower wage costs move AS1 toward AS2. The resulting Y1/P1 is reached along AD1, without a capacity change.',K,'Recessionary gap and wage-only endpoint.')
text('ECON-SP-HARD-218','A tax increase reduces consumption and aggregate demand. Productive capacity is unchanged, and equilibrium output falls below potential. What kind of gap has opened, and through which curve did the tax increase create it?',
 'Lower consumption shifts AD left. With potential output unchanged, the resulting output shortfall is a recessionary gap.',
 ['A recessionary gap caused by a leftward AD shift.','An inflationary gap caused by a rightward AD shift.','A recessionary gap caused by a leftward LRAS shift.','An inflationary gap caused by a movement up an unchanged AD curve.'])
draft('ECON-SP-LEGENDARY-9003',original['ECON-SP-LEGENDARY-9003']['q'],[
 'It ends at Y3/P2; returning to Y1/P1 now requires wage and cost adjustment toward AS2.',
 'It ends at Y2/P2; returning to Y1/P1 now requires wage and cost adjustment toward AS2.',
 'It ends at Y3/P2; that is the new potential output because the earlier wage adjustment shifted LRAS.',
 'It ends at Y1/P1; restoring the old demand curve is sufficient even though supply has changed.'],
 original['ECON-SP-LEGENDARY-9003']['feedback'],K,'Delayed-policy endpoint Y3/P2 versus the original Y1/P1.')
draft('ECON-SP-LEGENDARY-9004','The economy starts at AD1-AS1. Officials choose between allowing wage adjustment to AS2 and expanding demand to AD2. What happens if the full demand expansion takes effect after wage adjustment has already reached AS2?',[
 'It reaches Y2/P2, above potential; a stimulus sized for the original gap is excessive after self-correction.',
 'It reaches Y3/P2, below potential; the full stimulus is insufficient after the supply adjustment.',
 'It reaches Y2/P2, the new potential; combining the policies permanently raises productive capacity.',
 'It reaches Y1/P3; prior wage adjustment has no effect on the endpoint of a fixed demand expansion.'],
 'Either change alone can reach Y1 from the initial gap. Together AD2 and AS2 intersect at Y2/P2, above LRAS. The demand intervention should be reassessed after the supply adjustment.',K,'Separate counterfactual intersections and AD2-AS2 relative to LRAS.')
text('PM2D1-LRADJ-EB-002','An economy produces below potential while aggregate demand remains unchanged. Which wage adjustment would help close the recessionary gap?',
 'A recessionary gap puts downward pressure on wages. Lower labor costs increase short-run aggregate supply, allowing output to rise toward unchanged potential.',
 ['Falling wages reduce costs and shift SRAS right toward potential output.','Rising wages reduce costs and shift SRAS right toward potential output.','Falling wages shift AD left and reduce the output gap.','Rising wages raise potential output by shifting LRAS right.'],reason='The Easy task tests wage-based self-correction. Extra labeled endpoints would add graph work without improving that concept check.')
draft('PM2D1-LRADJ-L-001','Demand has moved the economy to AD2-AS2. With AD2 and productive capacity unchanged, how do the short-run and long-run outcomes compare?',[
 'Output falls from Y2 to Y1 as wage costs adjust; the price level rises from P2 to P3.',
 'Output rises from Y3 to Y1 as wage costs adjust; the price level falls from P2 to P1.',
 'Output falls from Y2 to Y1 because potential output falls; the price level rises from P2 to P3.',
 'Output stays at Y2 because the demand expansion permanently raises capacity; prices stay at P2.'],
 'Y2 is above the fixed potential level Y1. Wage and expectation adjustment contracts SRAS toward AS1, leaving output at Y1 and prices at P3. The short-run demand-driven output gain is temporary.',K,'Initial Y2/P2 and final Y1/P3 on fixed AD2.')
text('PM2D1-LRADJ-LB-002','An economy is below potential, and falling wages begin to increase short-run aggregate supply. Before adjustment is complete, aggregate demand falls further. Without knowing the sizes of these changes, what can be predicted about output?',
 'Lower wage costs support output, while the new demand decline reduces it. Their relative sizes determine the net movement. Neither change by itself establishes a loss of productive capacity.',
 ['The wage adjustment supports recovery, but the additional demand loss makes the net output change uncertain.','Falling wages guarantee a return to potential before the demand decline can affect output.','The demand decline guarantees falling output even if the supply response is larger.','Both changes reduce potential output because both shift long-run aggregate supply.'])
text('PM2D1-LRADJ-MB-004','Output is below unchanged potential, but nominal wages are fixed by contracts for one year. Officials predict an immediate recovery caused solely by lower wages. What is wrong with this forecast?',
 'Lower wages could reduce costs and expand short-run supply, but the stipulated contracts prevent that wage channel from operating immediately. The expected direction does not establish the timing.',
 ['The direction is reasonable, but the stated contracts prevent this wage adjustment from occurring immediately.','The timing is reasonable, but lower wages would contract short-run supply.','The forecast fails because returning to potential requires lower productive capacity.','The forecast is valid because fixed wage contracts have no effect on the timing of cost adjustment.'])
text('PG3-AS-L-001','A temporary energy bottleneck and a permanent loss of equipment both reduce short-run aggregate supply. Once energy costs normalize, what additional evidence is needed to predict whether wage adjustment can restore the old level of potential output?',
 'Lower energy costs can reverse a temporary supply restraint. Destroyed equipment may leave productive capacity lower, so restoring the old output level requires evidence that capacity was restored; wage adjustment alone does not replace equipment.')
text('PG3-AS-L-002','Lower expected prices and a lasting productivity gain both increase short-run aggregate supply. If expected prices return to their original level while the productivity gain remains, what can be predicted?',
 'Returning expected prices reverses only that contribution to SRAS. The productivity gain can still support higher supply and potential output. The final SRAS position depends on the sizes of the original contributions.',
 ['Some supply increase can remain, and potential output can be higher; the exact final SRAS position depends on the two contributions.','SRAS must return to its original position because expected prices returned, regardless of productivity.','SRAS cannot move again because a lasting productivity gain prevents expectation effects.','Potential output must fall because higher expected prices erase the physical productivity gain.'])
draft('PG3-AS-M-002',original['PG3-AS-M-002']['q'],['An increase in input prices raises production costs.','Lower wage costs make production more profitable at each price level.','Stronger consumer confidence raises planned spending.','A lower price level reduces output along the original supply curve.'],'AS1 lies above and left of AS0, indicating less output supplied at each price level. Higher input costs can produce that contraction; lower costs would move supply the other way.',K,'Direction of AS0-to-AS1 displacement.')
draft('PG3-AS-M-004','Which change could explain the shift from AS0 to AS1 in the diagram?', ['Lower input costs increase short-run aggregate supply.','Higher expected prices reduce short-run aggregate supply.','Higher government purchases increase aggregate demand.','A higher current price level raises output along AS0.'],'AS1 lies below and right of AS0, so more output is supplied at each price. Lower input costs can explain this shift. Higher expected prices would shift SRAS in the opposite direction.',K,'AS1 below/right of AS0.')
draft('ECON-SP-ELITE-349','What does the path b to d to c show about disinflation when expected inflation adjusts gradually?',[
 'Unemployment temporarily rises from U2 to U3, then returns to U2 as expectations fall.',
 'Unemployment temporarily falls from U2 to U1, then returns to U2 as expectations rise.',
 'Unemployment rises from U2 to U3 because disinflation permanently raises the natural rate.',
 'Unemployment returns from U3 to U2 through a rise in demand along the unchanged upper SRPC.'],
 'The path first moves down SRPC2 from b to d, raising unemployment to U3. Falling expected inflation then shifts the short-run curve down, reaching c at the unchanged natural rate U2.',K,'b/d/c relative to LRPC and both SRPCs.')
draft('ECON-SP-LEGENDARY-9008','Compare disinflations from b to the lower sustained inflation rate in the diagram. Supply conditions and natural unemployment do not change. Old contracts initially preserve expected inflation in one case; in the other, credibility and immediate contract adjustment reduce expectations before spending changes. Which comparison fits?',[
 'Old contracts allow b-d-c; prompt expectation adjustment can allow b-c without the same temporary unemployment increase.',
 'Old contracts allow c-a-b; prompt expectation adjustment can allow c-b without the same temporary unemployment decline.',
 'Old contracts allow b-d-c; prompt expectation adjustment still requires d because credibility cannot affect wage setting.',
 'Old contracts allow b-d-c; prompt adjustment shifts the natural rate to U3 and makes d the permanent endpoint.'],
 'The plotted disinflation is from b at I2 to c at I1. With old expectations it can pass through d at U3. If expectations and relevant contracts already adjust, the lower SRPC supports c without that initial gap. This conclusion depends on prompt contract adjustment, not credibility alone.',K,'b/d/c and which path lies on unchanged SRPC2.')
draft('ECON-SP-LEGENDARY-9047','After moving from b to d, inflation is held at the rate shown at d. Supply conditions and natural unemployment stay unchanged. A forecast predicts a return to the natural rate. Which expectation adjustment is consistent with the diagram?',[
 'Expected inflation falls, shifting the short-run curve through c; staying on SRPC2 would leave the economy at d.',
 'Expected inflation rises, shifting the short-run curve through b; staying on SRPC1 would leave the economy at a.',
 'Expected inflation falls, shifting the short-run curve through c; this permanently lowers natural unemployment from U3 to U2.',
 'Expected inflation is unchanged; demand growth alone moves d to c along SRPC2.'],
 'At the fixed lower inflation rate, c is on SRPC1 at natural unemployment U2, while d remains on SRPC2 at U3. With the supply offset fixed, lower expectations are needed to change the short-run curve.',K,'c and d at I1 on different SRPCs.')
draft('ECON-SP-MEDIUMBOSS-3010','Starting at b, policymakers reduce inflation. Why could the economy reach c directly instead of first passing through d?',[
 'Expectations and wage contracts adjust promptly to lower inflation, so the lower SRPC applies immediately.',
 'Expectations and wage contracts adjust promptly to higher inflation, so the upper SRPC applies immediately.',
 'Expectations stay fixed, and moving along SRPC2 takes the economy directly from b to c.',
 'A change in demand lowers the natural rate, turning d into the new long-run equilibrium.'],
 'The graph places c on the lower SRPC at the same natural unemployment rate as b. Reaching c immediately requires lower expected inflation and prompt contract adjustment; demand restraint with old expectations leads to d.',K,'c lies on lower SRPC; d on original upper SRPC.')
text('PM2B3-POL-FB-006','A low-capital economy could earn high marginal returns from investment, but unreliable contract enforcement deters investors. Why might improving enforcement alongside investment be more effective than subsidizing machines alone?',
 'High physical returns do not guarantee investment when investors cannot retain the proceeds. Better enforcement addresses that incentive constraint and complements capital accumulation; it does not itself create machines or guarantee catch-up.',
 ['It addresses investors\' ability to retain returns as well as the cost of adding capital.','Machine subsidies already eliminate any risk that investors will lose their returns.','Improved enforcement raises the capital stock immediately without requiring investment.','High marginal returns remove the need for either reliable institutions or investment finance.'])
text('PM2B3-POL-H-001','With technology and other inputs fixed, successive increases in capital per worker produce smaller additions to output per worker. What does this imply for a policy that relies on capital accumulation alone?',
 'Capital deepening raises output per worker, but diminishing marginal returns limit repeated gains. Sustained productivity growth requires continuing improvements such as technology or human capital; additional physical capital does not become useless.',
 ['It can raise the level of output, but sustaining productivity growth also requires improvements beyond physical capital alone.','It cannot raise output after the first investment because diminishing returns mean a zero marginal product.','It lowers output as soon as marginal gains become smaller than earlier gains.','It preserves the initial output growth rate indefinitely if the same amount of capital is added each year.'])
text('PM2B3-POL-LB-001','A planner proposes ever larger additions to capital per worker to sustain the initial productivity growth rate indefinitely. Technology and all other productivity determinants remain fixed, and capital has diminishing marginal returns. What weakness in the plan separates a level gain from sustained growth?',
 'Capital additions still raise output, but each unit contributes less. A catch-up increase in the productivity level does not establish a self-sustaining growth mechanism with other productivity determinants fixed.',
 ['The plan assumes capital deepening can sustain its early gains despite diminishing marginal returns and unchanged technology.','The plan fails because diminishing returns mean further capital reduces total output per worker.','The plan succeeds because a higher productivity level continues growing even after capital accumulation stops.','The plan succeeds because larger capital stocks prevent marginal returns from diminishing.'])
text('ECON-SP-HARD-228','At a fixed price level, initial desired output is $500 billion. Government purchases rise by $40 billion and MPC is 0.5. Crowding out creates a total $20 billion AD offset, already including induced effects. Under the simple spending multiplier, what is the new quantity of output demanded?',
 'The spending multiplier is 2, so the gross demand increase is $80 billion. Subtract the already-total $20 billion offset once, leaving a $60 billion net increase and $560 billion demanded. Without supply information, this is not a prediction of equilibrium output.',
 ['$560 billion; subtract the already-total offset from the multiplied spending increase.','$540 billion; subtract the offset from purchases before multiplying both amounts.','$580 billion; the offset does not affect demand after the multiplier operates.','$620 billion; add the offset to the multiplied spending increase.'],reason='The existing figure has symbolic output labels; all numerical inputs would still come from the stem. A curve-label add-on would not improve the multiplier-versus-total-offset reasoning.')
draft('ECON-SP-HARD-229','Government purchases and induced spending move demand from AD1 to AD3. If crowding out leaves demand at AD2, how much of the original expansion has been offset?',[
 'Part of it: final demand remains above AD1 but below AD3.',
 'More than all of it: final demand lies below the original AD1.',
 'None of it: the distance from AD2 to AD3 is additional induced spending.',
 'All of it: reaching AD2 means spending has returned to its initial curve.'],
 'At a common price AD2 lies between AD1 and AD3. Crowding out reduces the gross expansion but does not reverse it. Identifying the offset requires distinguishing the original, gross and final demand positions.',K,'Ordering of all three AD curves.')
draft('ECON-SP-LEGENDARY-9024','A purchases change first moves AD1 to AD2; induced consumption then moves demand to AD3. Higher interest rates subsequently reduce private spending. Which account fits the directions shown?',[
 'The direct and induced effects expand demand; the interest-rate effect partly offsets that expansion.',
 'The direct and induced effects contract demand; the interest-rate effect partly offsets that contraction.',
 'The direct and induced effects expand demand; the later private-spending decline is another multiplier expansion.',
 'The first demand change is induced consumption; the second is the original purchases impulse.'],
 'AD2 is right of AD1 and AD3 farther right. The first shift is the direct purchases effect, the next is induced spending, and the reduction in private spending is crowding out. The initial impulse must not be confused with the rounds it induces.',K,'AD1/AD2/AD3 ordering and the meanings of the stipulated stages.')
save()
