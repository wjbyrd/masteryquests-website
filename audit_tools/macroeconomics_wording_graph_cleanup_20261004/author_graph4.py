from draft_utils import *
K='KEEP GRAPH'
draft('PG4-MPT-M-001','How does interest-sensitive spending connect the two panels\' move from A to B?',[
 'Spending rises as borrowing costs fall; output reaches 125 and the price level 56.25 on the new AD curve.',
 'Spending rises as borrowing costs fall; output reaches 150 and the price level 60 on the new AD curve.',
 'Spending rises as borrowing costs fall; output 125 and price 56.25 are reached by a movement along unchanged AD.',
 'Output 125 and price 56.25 result from lower production costs shifting SRAS, with planned spending unchanged.'],
 'The rate falls from 6% to 4%, encouraging spending. The right-panel B is at output 125 and price 56.25 where higher AD intersects unchanged SRAS. A borrowing-cost change shifts spending plans rather than merely changing the price level along AD.',K,'Rate decline and B=(125,56.25).')
draft('PG4-MPT-EL-002','A student says the central bank directly chose the real-output level at B. Which explanation uses the mechanism and evidence in both panels?',[
 'Money supply falls from 125 to 100, raising the rate from 2.75% to 4%; lower spending then reduces output.',
 'Money supply falls from 150 to 100, raising the rate from 4% to 6%; lower spending then reduces output.',
 'Money supply falls from 125 to 100; matching money and output quantities means the bank directly sets real GDP.',
 'Money supply falls from 125 to 100, and output falls because the policy directly reduces productive capacity.'],
 'The monetary instrument changes money supply, not an output quota. The left panel supplies the rate response; borrowing costs affect investment and AD, with the output result determined by the right-panel intersection.',K,'Money 125/100 and rates 2.75/4; spending-mediated AD shift.')
draft('PG4-MPT-L-002','What economic response connects the move from A to B in the two panels?',[
 'Money supply falls and the rate rises; weaker spending lowers output and the price level on unchanged SRAS.',
 'Money supply rises and the rate falls; stronger spending raises output and the price level on unchanged SRAS.',
 'Money demand rises and the rate rises; weaker spending lowers output and the price level on unchanged SRAS.',
 'Money supply falls and the rate rises; output falls because policy shifts LRAS left.'],
 'The graph shows a leftward money-supply shift at fixed money demand, followed by lower AD. Higher rates restrain spending; output and prices fall along unchanged SRAS. This does not establish a loss of productive capacity.',K,'Which money curve changes and whether the goods-market change is AD or supply.')
draft('ECON-SP-HARD-227','Read the policy path in reverse, from MS2 to MS1. Which mechanism explains the associated aggregate-demand change?',[
 'The money supply expands, the rate falls, and investment raises AD from AD2 toward AD1.',
 'The money supply contracts, the rate rises, and investment lowers AD from AD2 toward AD1.',
 'The money supply expands and the rate falls, but the resulting AD change is a movement along a fixed demand curve.',
 'Money demand falls rather than money supply changing, so investment raises AD from AD2 toward AD1.'],
 'MS1 is right of MS2, with a lower interest rate r1. The expansion stimulates investment and shifts AD from the leftward AD2 toward AD1. The graph distinguishes the policy supply change from a demand change in the money market.',K,'MS2/MS1 and AD2/AD1 ordering.')
text('LG-Q-158','Which variables belong in the money-market model used to explain monetary-policy transmission?',
 'The money market relates desired money holdings to the supplied quantity at different nominal interest rates. Its equilibrium rate affects interest-sensitive spending in the aggregate-demand model.',
 ['Money supply, money demand and the nominal interest rate.','Aggregate demand, short-run supply and real output.','Government purchases, tax revenue and the budget deficit.','Capital per worker, productivity and technological progress.'],reason='Identifying a model by its variables is a conceptual task; requiring the student to name a panel would add only visual label lookup.')
text('LG-Q-9053','A monetary contraction raises interest rates and reduces aggregate demand by $240 billion. MPC is 0.75, and investment is the only autonomous spending component that changes. What investment change accounts for the total demand loss?',
 'The multiplier is 1/(1 − 0.75) = 4. Dividing the $240 billion total demand loss by 4 gives a $60 billion autonomous investment decline, occurring after the rate increase and before induced spending falls.')
text('LG-Q-9055','A monetary expansion lowers rates and raises investment by $40 billion. A separate loss of confidence reduces investment by $25 billion. With MPC = 0.5, what is the net change in aggregate demand?',
 'The autonomous investment effects net to $15 billion. The spending multiplier is 2, so total demand rises $30 billion. The monetary stimulus must be combined with the confidence effect before the multiplier is applied.')
text('LG-Q-9056','The interest rate rises by the same amount in two economies. Investment falls by $20 billion in A and $5 billion in B. Both have MPC = 0.8 and no other shocks. What explains the difference in their total demand responses?',
 'Both multipliers equal 5, giving demand declines of $100 billion and $25 billion. With the same rate increase and multiplier, the difference reflects investment sensitivity, not reserve accounting.')
text('LG-Q-9059','A monetary contraction reduces investment by $40 billion, with MPC = 0.8. A fiscal program adds $200 billion to aggregate demand in total after induced effects. Compare implementing it immediately with implementing it only after the original contraction has ended.',
 'The monetary effect is −40/(1 − 0.8) = −$200 billion, so the immediate fiscal total offsets it. If the program arrives after the original gap closes, the same stimulus can create excess demand. A total effect should not be multiplied again.')
text('LG-Q-9064','Policymakers want to reduce aggregate demand by $300 billion. MPC is 0.5, and each one-percentage-point increase in the interest rate reduces investment by $50 billion. Under this spending model, how much must the rate rise?',
 'The multiplier is 2. A $300 billion total demand reduction requires investment to fall $150 billion. At $50 billion per percentage point, that requires a 3-percentage-point rate increase.')
text('LG-Q-9072','A reduction in money supply raises the interest rate when money demand is fixed. Now suppose money demand also falls. Without the relative sizes of the shifts, what can be predicted about the interest-rate and spending responses?',
 'A supply reduction puts upward pressure on the rate, while lower money demand puts downward pressure on it. Without their relative sizes, the net rate movement and the resulting investment and AD directions remain uncertain.')
text('LG-Q-9131','In a fixed-price spending model, monetary tightening reduces investment by $90 billion while improved business expectations independently raise autonomous investment by $30 billion. MPC is 0.6, with no taxes, imports or further interest-rate feedbacks. What is the net AD change, and what independent investment recovery would exactly offset the monetary effect?',
 'Net autonomous investment changes by −90 + 30 = −$60 billion. The multiplier is 2.5, so AD falls $150 billion. An independent $90 billion recovery would cancel the autonomous monetary loss before any multiplication.')
text('LG-Q-9132','The Fed wants to reduce aggregate demand by $300 billion. MPC is 0.75, and each one-percentage-point rise in the interest rate lowers investment by $25 billion. Under these assumptions, how much must the rate rise?',
 'A multiplier of 4 means investment must fall $75 billion to lower total demand by $300 billion. Dividing by $25 billion per percentage point gives a 3-percentage-point rate increase.')
draft('LG-Q-9138','Compare the displayed money-supply change with a counterfactual in which interest rates respond but firms no longer change investment. Which link would fail, and what does the original money-market panel establish?',[
 'The rate-to-investment link fails; the original rate changes from r1 to r2, so that panel does not show a liquidity trap.',
 'The rate-to-investment link fails; the original rate stays at r1, consistent with a flat-rate liquidity-trap segment.',
 'The supply-to-rate link fails; the original rate changes from r1 to r2 despite the assumed investment insensitivity.',
 'The rate-to-investment link fails; the original rate change proves policy has the same output effect even when investment stops responding.'],
 'The figure shows the rate moving from r1 to r2 as supply contracts. The hypothetical failure is farther along the chain: the rate no longer changes investment. A rate-responsive money market is different from the flat near-zero-rate case used to illustrate a liquidity trap.',K,'Distinct r1/r2 equilibrium rates and downward MD.')
draft('PG5-PC-M-002','At the natural unemployment rate shown, how much higher is inflation on SRPC1 than on SRPC0, and what could explain the difference with supply conditions unchanged?',[
 '3.6 percentage points; higher expected inflation shifts the short-run curve upward.',
 '3 percentage points; higher expected inflation shifts the short-run curve upward.',
 '3.6 percentage points; a fall in the natural unemployment rate moves LRPC left.',
 '3.6 percentage points; a change in actual inflation alone moves the economy along SRPC0.'],
 'At unemployment 5%, SRPC0 gives inflation 3% and SRPC1 gives 6.6%, a 3.6-point gap. With supply conditions unchanged, higher expectations can explain the curve shift. The LRPC stays fixed.',K,'SRPC intersections at u=5: 3 and 6.6.')
draft('PG5-PC-X-005','What does the diagram imply about the natural unemployment rate when SRPC changes from SRPC0 to SRPC1?',[
 'It remains 5%; shifting the short-run inflation relationship does not itself change the long-run unemployment benchmark.',
 'It remains 6%; shifting the short-run inflation relationship does not itself change the long-run unemployment benchmark.',
 'It becomes 6% because point B always determines the natural rate, even off LRPC.',
 'It remains 5%, so unemployment cannot deviate from 5% anywhere on either short-run curve.'],
 'LRPC stays vertical at 5%. Point B is a short-run observation at 6% unemployment, not a new natural-rate marker. Short-run and long-run unemployment need not coincide.',K,'Fixed LRPC at 5 versus B unemployment 6.')
draft('ECON-SP-MEDIUMBOSS-3007','After a demand surprise moves the economy from c to a, actual inflation is held at the rate shown at a. Compare fully adjusted expectations with expectations remaining at their old level.',[
 'Full adjustment brings the economy to b at U2; old expectations keep it at a at U1.',
 'Full adjustment brings the economy to c at U2; old expectations keep it at d at U3.',
 'Full adjustment brings the economy to b at U2 because expectations permanently raise the natural rate.',
 'Both cases reach b immediately because holding actual inflation constant also fixes expected inflation.'],
 'At I2, a lies on SRPC1 below natural unemployment and b lies on SRPC2 at U2. Adapting expectations moves the short-run relationship; maintaining actual inflation alone is not the same adjustment.',K,'a/b at I2 and their relation to LRPC.')
draft('ECON-SP-ELITE-326','How should the change from c to f be interpreted in the short-run Phillips diagram?',[
 'Inflation rises at unchanged unemployment, indicating a shift of the short-run relationship.',
 'Inflation falls at unchanged unemployment, indicating a shift of the short-run relationship.',
 'Inflation rises at unchanged unemployment, indicating a demand-driven movement along SRPC1.',
 'Unemployment rises at unchanged inflation, indicating a movement along SRPC1.'],
 'c and f share unemployment U3 but have inflation I2 and I4 on different curves. The change therefore involves an upward SRPC shift, not a movement along one fixed curve.',K,'c/f at common U3 on different curves.')
draft('ECON-SP-MEDIUM-162','Supply conditions and the natural rate are unchanged, so only expected inflation can shift the short-run Phillips curve. What explains the change from c to f?',[
 'Higher expected inflation raises inflation at the same unemployment rate.',
 'Lower expected inflation reduces inflation at the same unemployment rate.',
 'Higher actual inflation moves the economy along the original SRPC without changing expectations.',
 'Lower natural unemployment shifts the long-run benchmark to U3.'],
 'f lies above c at the same unemployment rate U3, on the higher short-run curve. With other shifters excluded, this identifies higher expected inflation.',K,'f above c at common U3.')
draft('ECON-SP-LEGENDARY-9048','What can be inferred when the economy\'s short-run relationship changes from SRPC1 to SRPC2?',[
 'Inflation is higher at a given unemployment rate; expectations or a supply disturbance could explain the shift.',
 'Inflation is lower at a given unemployment rate; expectations or a supply disturbance could explain the shift.',
 'Inflation is higher at a given unemployment rate; the graph alone proves that expected inflation rose.',
 'Inflation is higher at a given unemployment rate because stronger demand moved the economy along unchanged SRPC1.'],
 'SRPC2 lies above SRPC1. The less favorable short-run tradeoff can result from higher expectations or an adverse supply disturbance; the shift itself does not identify which cause occurred.',K,'SRPC2 above SRPC1 at common unemployment.')
text('PM2B3-PROD-EB-002','Capital per worker doubles from 20 to 40, while output per worker rises from about 28.53 to 36.37. Employment is unchanged. A report says total output must also have doubled. Which correction is appropriate?',
 'Total output equals output per worker times employment. With employment fixed, its growth is (36.37/28.53 − 1) × 100, about 27.5%, not 100%. A doubling of one input need not double output.',reason='The Easy item already supplies the productivity observations. Requiring several graph readings would add load to a basic fixed-employment inference.')
draft('PM2B3-PROD-FB-004','Use the displayed coordinates for A and B. Approximately how much does output per worker rise, and what would another equal addition to capital imply with other inputs fixed?',[
 'About 27.5%; the next equal capital addition would produce a smaller output gain.',
 'About 21.6%; the next equal capital addition would produce a smaller output gain.',
 'About 27.5%; the next equal capital addition would produce an equal output gain.',
 'About 7.84%; the next capital addition would reduce the total level of output per worker.'],
 'Output per worker rises from 28.53 to 36.37, so growth is 7.84/28.53 ≈ 27.5%. The curve flattens at higher capital levels: further equal additions give smaller positive gains, not equal gains or falling total output.',K,'A/B productivity coordinates and curvature.')
draft('PM2B3-PROD-H-001','After moving from A to B, an economy adds the same amount of capital per worker again, with all other productivity determinants fixed. What does the curve imply?',[
 'A smaller additional output gain because the marginal product of capital declines.',
 'A larger additional output gain because the marginal product of capital rises.',
 'A smaller additional output gain because technology has deteriorated as the economy moves along the curve.',
 'A fall in the level of output per worker because declining marginal returns mean negative marginal returns.'],
 'The curve is rising but flatter beyond B. This means additional capital still raises output, with a smaller gain per unit. The movement holds technology fixed, and diminishing returns are not negative returns.',K,'Positive slope that flattens beyond B.')
draft('PM2B3-SRC-EB-002','Two economies start at A and B on this productivity curve. Each adds the same small amount of capital per worker, with other inputs fixed. Which comparison follows?',[
 'The gain is larger near A; capital has a higher marginal product there.',
 'The gain is larger near B; capital has a higher marginal product there.',
 'The gain is larger near A because total output per worker is already higher there.',
 'The gain is zero near B because a smaller marginal product means capital adds nothing.'],
 'The curve is steeper near A than B, indicating a larger marginal output gain at A. B has higher total productivity, but that does not imply a higher marginal gain from capital.',K,'Relative slopes at A/B; distinction from their vertical levels.')
draft('PM2B3-PROD-L-001','Two otherwise similar economies begin at A and B. Each receives the same small addition to capital per worker. What does the figure establish about catch-up?',[
 'The marginal gain is larger at A, but that advantage alone does not guarantee convergence.',
 'The marginal gain is larger at B, but that advantage alone does not guarantee convergence.',
 'The marginal gain is larger at A, which guarantees it will overtake B regardless of institutions or technology.',
 'The productivity level is higher at B, so A cannot gain output from any additional capital.'],
 'A lies on the steeper part of the curve, so its marginal gain is larger. Catch-up still depends on accumulation and complementary conditions; the curve does not guarantee that the poorer economy overtakes the richer one.',K,'Relative slope and level at A/B.')
draft('PM2B3-PROD-LB-002','Output per worker changes from A to B, while employment falls by 25%. A report concludes that higher productivity must mean higher total output. Is that conclusion supported?',[
 'No. Productivity rises about 27.5%, but total output falls about 4.4% after the employment decline.',
 'Yes. Productivity rises about 40%, so total output rises about 5% after the employment decline.',
 'Yes. Productivity rises about 27.5%; subtracting 25% gives a total-output increase of about 2.5%.',
 'No. Productivity itself falls about 4.4%, because employment is part of the vertical-axis measure.'],
 'The plotted productivity ratio is 36.37/28.53 ≈ 1.2748. Total output changes by 1.2748 × 0.75 − 1 ≈ −4.4%. A productivity gain and an employment decline can therefore coexist with lower total output.',K,'A/B output-per-worker readings; distinction from total output.')
text('43220','In the loanable-funds model, why does firms\' desired investment form the demand for funds?',
 'Firms seek finance for investment projects. A higher real interest rate raises financing costs, making fewer projects worthwhile and reducing desired borrowing along the investment-demand schedule.',
 ['Investment projects create demand for finance, and higher real borrowing costs make fewer projects worthwhile.','Households supply funds for firms, so investment is the saving-supply schedule.','The central bank fixes investment at each rate, so desired borrowing is independent of financing costs.','Higher real borrowing costs make every investment project more profitable, increasing desired borrowing.'],reason='The original task identifies investment as loanable-funds demand. A numerical add-on would replace that identification task with a different calculation.')
text('43225','Which variable acts as the price coordinating saving and investment in the loanable-funds market?',
 'The real interest rate is the return to supplying funds and the real cost of borrowing. Changes in that price affect saving supplied and investment demanded.',
 ['The real interest rate.','The quantity of loanable funds.','The government budget balance.','The stock of productive capital.'],reason='The concept is the market price, not the placement of an axis label. Text preserves that concept without redundant visual lookup.')
text('43224','The real interest rate rises from 8% to 10% along unchanged saving-supply and investment-demand curves. How do the quantities supplied and demanded respond?',
 'A higher real rate encourages saving and makes fewer investment projects worthwhile. These are movements along the fixed schedules, not shifts of the schedules themselves.',
 ['Saving supplied rises and investment demanded falls.','Saving supplied falls and investment demanded rises.','Both quantities rise because the same interest rate applies to savers and borrowers.','Both schedules shift right because the real interest rate changes.'])
draft('43249','Which event could explain the movement from A to B with the other determinants unchanged?',[
 'An improvement in the government budget raises national saving at each real interest rate.',
 'A deterioration in the government budget lowers national saving at each real interest rate.',
 'An investment tax credit raises desired investment at each real interest rate.',
 'Reduced expected project profitability lowers desired investment at each real interest rate.'],
 'The graph shows saving supply moving right from S0 to S1 while D0 stays fixed. A budget improvement can increase public and national saving. Investment incentives instead change demand for funds.',K,'Supply shifts right, investment demand stays fixed.')
draft('43252','Government purchases fall while output is fixed and the consumption schedule is unchanged at each real rate. Which account connects this policy to the move from A to B?',[
 'Higher national saving lowers the rate from 8% to 6%, raising investment from 80 to 120 along D0.',
 'Higher national saving lowers the rate from 8% to 4%, raising investment from 80 to 160 along D0.',
 'Higher national saving lowers the rate from 8% to 6%; investment rises to 120 because D0 shifts right.',
 'The fall from 8% to 6% first raises government saving, so the observed supply shift is a response to the rate.'],
 'With Y and consumption at each rate fixed, lower G raises national saving. The supply increase moves equilibrium from 80/8 to 120/6. The resulting investment response is along unchanged D0, not an independent demand shift.',K,'A=(80,8), B=(120,6), same D0.')
draft('43255','A report calls the increase in investment from A to B a rightward shift of investment demand. How should the displayed change be classified?',[
 'Investment rises by 40 units along D0 because the saving-supply shift lowers the rate.',
 'Investment rises by 80 units along D0 because the saving-supply shift lowers the rate.',
 'Investment rises by 40 units because a lower rate shifts D0 right at every real rate.',
 'Investment rises by 40 units because stronger project profitability shifts D0 while S0 stays fixed.'],
 'The equilibrium quantity rises from 80 to 120 on unchanged D0, a 40-unit increase. The initiating shift is in saving supply; lower financing costs induce movement along investment demand.',K,'A/B quantities and unchanged D0.')
save()
