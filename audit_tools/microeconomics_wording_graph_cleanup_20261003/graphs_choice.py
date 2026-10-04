from common import *
p=paired
p('42562','Use the prices and bundle C shown in the graph. Income rises to $52 without a price change. Which budget assessment is correct?',
 'C is still unaffordable: income is $4 below its cost.','C is still unaffordable: income is $8 below its cost.',
 'C is affordable: the $4 difference between its cost and income does not restrict the feasible set.','C is affordable: the $8 difference between its cost and income does not restrict the feasible set.',
 'C contains eight yogurts and three cereal boxes. At the plotted prices it costs 8×4+3×8=$56. Income of $52 leaves a $4 shortfall; another $4 would just make C feasible.',
 'C=(8,3), yogurt price $4 and cereal price $8.','Apply the budget constraint after an income grant.','8*4+3*8-52=4')
p('42565','Starting from bundle B in the graph, cereal rises to $10 per box while income and the yogurt price stay fixed. If the consumer keeps B’s yogurt quantity, what is the most cereal the consumer can afford, and how does the budget change?',
 '1.6 boxes; the budget pivots inward.','1.2 boxes; the budget pivots inward.',
 '1.6 boxes; the budget shifts inward in parallel.','1.2 boxes; the budget shifts inward in parallel.',
 'B contains six yogurts. They cost 6×$4=$24, leaving $16 of the $40 income for cereal: 16/10=1.6 boxes. Only the cereal intercept changes, so the line pivots rather than shifting in parallel.',
 'B has six yogurts; income $40 and yogurt price $4.','Combine feasibility under a changed price with pivot-versus-shift reasoning.','(40-6*4)/10=1.6')
p('42571','The consumer moves from BC0 to BC1 in the graph; only the cereal price changes. Income then falls to $32. Compared with BC0, what happens to cereal’s opportunity cost and to the affordability of four yogurts plus four cereal boxes?',
 'The opportunity cost falls from two yogurts to one; the bundle changes from unaffordable to just affordable.',
 'The opportunity cost falls from three yogurts to one; the bundle changes from unaffordable to just affordable.',
 'The opportunity cost falls from two yogurts to one; falling income by itself proves the bundle remains unaffordable.',
 'The opportunity cost falls from three yogurts to one; falling income by itself proves the bundle remains unaffordable.',
 'BC0 has prices $4 and $8 and income $40. BC1 retains the yogurt intercept of 10 and raises the cereal intercept to 10, implying a cereal price of $4. Cereal’s opportunity cost falls from 8/4=2 yogurts to 4/4=1. The bundle costs $48 originally and $32 finally; both prices and income matter for feasibility.',
 'Original prices $4/$8, income $40; BC1 intercepts 10/10.','Combine relative-price opportunity cost and affordability after two changes.','8/4=2;4/4=1;4*4+4*8=48;4*4+4*4=32')
p('42569','The move from BC0 to BC1 changes only the cereal price. Income then falls to $32. What are the final yogurt and cereal intercepts, and is the final budget a parallel shift of BC0?',
 'Eight of each good; no, the price ratio differs from BC0.','Six of each good; no, the price ratio differs from BC0.',
 'Eight of each good; yes, an income change reverses the change in the price ratio.','Six of each good; yes, an income change reverses the change in the price ratio.',
 'BC1’s intercepts are both 10 with income $40, so both prices are $4. Final intercepts are 32/4=8. BC0 had intercepts 10 and 5. Income scales a budget without restoring the original relative price.',
 'BC0 intercepts 10/5; BC1 intercepts 10/10; original income $40.','Separate income and relative-price effects after successive changes.','32/(40/10)=8')
p('42574','The graph shows the change from BC0 to BC1 with income fixed. The consumer previously bought six yogurts and one cereal box. Retaining the cereal box, which adjustment to yogurt restores feasibility, and what constraint determines it?',
 'Reduce yogurt to four; the new prices and income determine the affordable maximum.','Reduce yogurt to three; the new prices and income determine the affordable maximum.',
 'Reduce yogurt to four; the consumer’s preference ranking determines which bundles are affordable.','Reduce yogurt to three; the consumer’s preference ranking determines which bundles are affordable.',
 'BC1 has both intercepts at five. With income $40, each price is $8. One cereal box leaves $32, enough for four yogurts. Preferences rank feasible bundles; they do not determine affordability.',
 'BC1 intercepts five yogurts and five cereal boxes; income $40.','Apply the new budget constraint while retaining one good; distinguish feasibility from preferences.','(40-40/5)/(40/5)=4')
p('42577','After the price change from BC0 to BC1, income rises to $80 with prices fixed at their BC1 levels. Which final intercepts and comparison with BC0 are correct?',
 'Ten of each good; the original price ratio is not restored.','Eight of each good; the original price ratio is not restored.',
 'Ten of each good; the income increase restores the original price ratio.','Eight of each good; the income increase restores the original price ratio.',
 'BC1 has intercepts 5 and 5 at income $40, implying prices of $8 each. At income $80 both intercepts are 10. BC0’s intercepts were 10 and 5. Income cannot undo the relative-price change.',
 'BC0 intercepts 10/5; BC1 intercepts 5/5 at income $40.','Distinguish compensation of purchasing power from restoration of relative prices.','80/(40/5)=10')
p('42583','With prices and tastes fixed, the budget changes from BC0 to BC1 in the graph. The consumer’s chosen bundle changes from four yogurts and three cereal boxes to six yogurts and one cereal box. Which income change and classification follow?',
 'Income falls $8; yogurt behaves as inferior and cereal as normal over this change.','Income falls $12; yogurt behaves as inferior and cereal as normal over this change.',
 'Income falls $8; yogurt behaves as normal and cereal as inferior over this change.','Income falls $12; yogurt behaves as normal and cereal as inferior over this change.',
 'At the plotted yogurt price of $4, the intercept falls from 10 to 8, so income falls from $40 to $32. Yogurt consumption rises when income falls, the inferior-good pattern. Cereal consumption falls with income, the normal-good pattern. The observed choices, not the budget lines alone, establish these responses.',
 'Yogurt price $4; yogurt intercepts BC0=10, BC1=8.','Infer income and use observed choices to distinguish normal from inferior goods.','(10-8)*4=8')
p('42581','The graph shows BC0 and BC1 with unchanged prices. After the move to BC1, both prices fall 20%. What are the final yogurt and cereal intercepts, and how do the relative prices compare with BC0?',
 '10 and 5; the relative price is unchanged.','12 and 6; the relative price is unchanged.',
 '10 and 5; proportional price cuts change the relative price.','12 and 6; proportional price cuts change the relative price.',
 'BC1’s intercepts are 8 and 4. Dividing by 0.8 gives 10 and 5, exactly BC0’s intercepts, so the original feasible set is restored. The two prices fall by the same proportion, leaving their ratio unchanged.',
 'BC1 intercepts 8/4; BC0 intercepts 10/5.','Evaluate offsetting income and proportional-price changes.','8/.8=10;4/.8=5')
for i,stem,g,a,b,ab,fb,ev,reason in [
 ('42566','Income and the yogurt price are fixed. Which cereal-price change accounts for the move from BC0 to BC1, and why?', 'A fall from $8 to $4; the cereal intercept equals income divided by its price.','A fall from $8 to $5; the cereal intercept equals income divided by its price.','A fall from $8 to $4; a price decrease reduces the quantity affordable when all income buys cereal.','A fall from $8 to $5; a price decrease reduces the quantity affordable when all income buys cereal.', 'Income is $40. The cereal intercept rises from 5 to 10, so its price falls from 40/5=$8 to 40/10=$4. A lower own price raises that intercept.', 'Income $40; cereal intercepts 5 and 10.','Infer the cause of a pivot using the budget equation.'),
 ('42572','Income and the cereal price are fixed. Which yogurt-price change accounts for BC0 moving to BC1, and why?', 'A rise from $4 to $8; a higher own price lowers its budget intercept.','A rise from $4 to $10; a higher own price lowers its budget intercept.','A rise from $4 to $8; a higher own price raises its budget intercept.','A rise from $4 to $10; a higher own price raises its budget intercept.', 'The yogurt intercept falls from 10 to 5 at income $40. Its price rises from $4 to $8. The intercept is income divided by price, so it falls as the price rises.', 'Income $40; yogurt intercepts 10 and 5.','Infer a price change from a pivot, not an income shift.'),
 ('42578','Both prices are fixed at the values printed in the graph. Which income change produces BC1, and why are the lines parallel?', 'Income falls from $40 to $32; the price ratio stays fixed.','Income falls from $40 to $24; the price ratio stays fixed.','Income falls from $40 to $32; parallel lines imply that the price ratio has changed.','Income falls from $40 to $24; parallel lines imply that the price ratio has changed.', 'BC1’s yogurt intercept is 8 at a price of $4, implying income $32 rather than the original $40. Fixed prices preserve the slope while lower income reduces both intercepts.', 'Yogurt price $4; BC1 yogurt intercept 8.','Identify an income shift and explain unchanged relative prices.'),
 ('42567','Only cereal’s price changes between BC0 and BC1. Which intercept stays fixed, and what explains it?', 'Ten yogurts; income divided by the yogurt price is unchanged.','Eight yogurts; income divided by the yogurt price is unchanged.','Ten yogurts; a fixed preference ranking fixes the budget intercept.','Eight yogurts; a fixed preference ranking fixes the budget intercept.', 'Both lines meet the yogurt axis at 10. Income and the yogurt price are unchanged, so I/Pyogurt stays at 10. Preferences do not set budget intercepts.', 'Shared horizontal intercept 10.','Explain an unchanged intercept from income and the unaffected price.'),
 ('42575','Only yogurt’s price changes between BC0 and BC1. Which cereal intercept and explanation are correct?', 'Five boxes; neither income nor the cereal price changes.','Four boxes; neither income nor the cereal price changes.','Five boxes; indifference between bundles fixes the cereal intercept.','Four boxes; indifference between bundles fixes the cereal intercept.', 'Both lines meet the cereal axis at 5. The intercept is income divided by the cereal price; yogurt’s price does not enter that calculation.', 'Shared vertical intercept 5.','Explain an unchanged intercept using the budget constraint.'),
 ('42579','Prices are held fixed as BC0 moves to BC1. What is the opportunity cost of one additional yogurt along either line, and why is it unchanged?', 'Half a cereal box; income changes purchasing power but not the relative price.','A quarter of a cereal box; income changes purchasing power but not the relative price.','Half a cereal box; income changes the relative price by the same proportion as purchasing power.','A quarter of a cereal box; income changes the relative price by the same proportion as purchasing power.', 'BC0’s intercepts are 10 and 5 and BC1’s are 8 and 4. Both slopes have magnitude 0.5 cereal boxes per yogurt. A change in income at fixed prices leaves that opportunity cost unchanged.', 'Intercept pairs 10/5 and 8/4.','Interpret the budget slope as opportunity cost and separate it from income.')
]:p(i,stem,g,a,b,ab,fb,ev,reason)
p('42585','On IC2, compare the bundles at X=5 and X=20. Which Y quantities and preference comparison are correct?',
 'Y=20 and Y=5; the consumer is indifferent between the bundles.','Y=10 and Y=2.5; the consumer is indifferent between the bundles.',
 'Y=20 and Y=5; the bundle with more X must be preferred.','Y=10 and Y=2.5; the bundle with more X must be preferred.',
 'IC2 passes through (5,20) and (20,5). Being on the same indifference curve means the two bundles have the same preference rank, despite their different compositions.',
 'IC2 at X=5 has Y=20 and at X=20 has Y=5.','Interpret equal preference rank along an indifference curve.')
p('42586','At X=10, compare IC1 and IC2. Assuming more of either good is preferred, which readings and explanation show why these two indifference curves cannot cross elsewhere?',
 'IC1 has Y=4 and IC2 has Y=10; a crossing would contradict the preference ranking established by more Y at the same X.',
 'IC1 has Y=2 and IC2 has Y=8; a crossing would contradict the preference ranking established by more Y at the same X.',
 'IC1 has Y=4 and IC2 has Y=10; a crossing is consistent because bundles at the crossing can have two different preference ranks.',
 'IC1 has Y=2 and IC2 has Y=8; a crossing is consistent because bundles at the crossing can have two different preference ranks.',
 'At X=10, IC1 gives Y=4 and IC2 gives Y=10, so the IC2 bundle is preferred. At a crossing the common bundle would be indifferent to bundles on both curves. Transitivity would then equate ranks that more-is-better distinguishes.',
 'At X=10, IC1 Y=4 and IC2 Y=10.','Use monotonicity and transitivity to rule out crossing indifference curves.')
p('42587','Along IC2, compare the average amount of Y the consumer gives up per additional X from X=5 to 10 and from X=10 to 20. Which rates and interpretation are correct?',
 'Two units of Y, then half a unit; willingness to give up Y for X diminishes.','One unit of Y, then a quarter unit; willingness to give up Y for X diminishes.',
 'Two units of Y, then half a unit; willingness to give up Y for X increases.','One unit of Y, then a quarter unit; willingness to give up Y for X increases.',
 'IC2 passes through (5,20), (10,10) and (20,5). The average tradeoffs are (20−10)/(10−5)=2 and (10−5)/(20−10)=0.5 units of Y per X. These are willingness-to-trade measures along equal utility, illustrating diminishing MRS.',
 'IC2 points (5,20),(10,10),(20,5).','Interpret changing indifference-curve tradeoffs as diminishing MRS.','(20-10)/(10-5)=2;(10-5)/(20-10)=.5')
p('42588','At X=10, compare the bundles on IC2 and IC3. Which Y readings and utility interpretation are supported?',
 'Y=10 and Y=20; IC3 is preferred, but twice as much Y does not establish twice the utility.',
 'Y=5 and Y=10; IC3 is preferred, but twice as much Y does not establish twice the utility.',
 'Y=10 and Y=20; twice as much Y establishes twice the utility.',
 'Y=5 and Y=10; twice as much Y establishes twice the utility.',
 'At X=10, IC2 has Y=10 and IC3 has Y=20. The upper curve is preferred, but ordinal utility provides a ranking, not a meaningful ratio of utility levels.',
 'IC2 and IC3 at X=10 have Y=10 and Y=20.','Distinguish ordinal preference rankings from cardinal utility comparisons.')
for i,reason,stem,goodxy,altxy,fb,ev in [
 ('42591','Apply the interior tangency condition and highest attainable indifference curve.','Which bundle maximizes utility, and what economic condition supports that choice?','(10,10)','(5,15)','C=(10,10) is where IC2 is tangent to the budget line. The consumer’s marginal tradeoff matches the market tradeoff at the highest affordable curve. Exhausting the budget alone is insufficient.','C=(10,10), tangent IC2; A and B exhaust the same budget below IC2.'),
 ('42590','Distinguish full budget expenditure from utility maximization.','A and B exhaust the budget. Which alternative bundle improves utility, and why?','(10,10)','(8,12)','C=(10,10) reaches IC2, above the preference rank of A and B. An affordable tangency at the highest attainable curve improves utility; merely spending all income does not establish optimality.','C=(10,10) reaches IC2; A=(5,15) and B=(15,5) lie below IC2.'),
 ('42601','Maximize preference rank subject to affordability.','Which bundle is the optimum shown, and what makes it optimal?','(15,10)','(10,20)','A=(15,10) reaches the highest attainable indifference curve at tangency. Other points on the budget can exhaust income while providing lower utility.','A=(15,10) is tangent to IC2 on the budget line.')
]:
 p(i,'Refer to the graph. '+stem,f'{goodxy}; it reaches the highest attainable indifference curve.',f'{altxy}; it reaches the highest attainable indifference curve.',f'{goodxy}; exhausting the budget is sufficient to prove it optimal.',f'{altxy}; exhausting the budget is sufficient to prove it optimal.',fb,ev,reason)
p('42594','At the interior tangency in the graph, what is the consumer’s marginal willingness to give up Y for one more X, and which condition explains it?',
 'One unit of Y; MRS equals the price ratio.','Two units of Y; MRS equals the price ratio.',
 'One unit of Y; total utility equals income.','Two units of Y; total utility equals income.',
 'The budget has intercepts 20 and 20, so its slope has magnitude one. At C the indifference curve is tangent to it: the consumer’s MRS equals Px/Py=1. This equality concerns marginal tradeoffs, not utility measured in dollars.',
 'Budget intercepts 20/20 and tangency at C.','Interpret tangency as equality of marginal substitution and relative price.','20/20=1')
p('42602','A proposed bundle has X=15 and Y=15. With more of either good preferred, which budget reading and choice assessment are correct?',
 'The budget allows only Y=10 at X=15; the preferred bundle is unaffordable.',
 'The budget allows only Y=12 at X=15; the preferred bundle is unaffordable.',
 'The budget allows only Y=10 at X=15; being preferred makes the bundle feasible.',
 'The budget allows only Y=12 at X=15; being preferred makes the bundle feasible.',
 'The budget goes through A=(15,10). Raising Y to 15 at the same X would be preferred but would lie outside the feasible set. Preference does not remove the budget constraint.',
 'Budget at X=15 has Y=10.','Separate preference for a bundle from the ability to purchase it.')
p('42593','Using the graph as the starting budget, compare two grants of equal face value. Cash makes a bundle on IC3 attainable. A cereal-only voucher permits a better bundle than the starting optimum but cannot reach IC3 or any higher curve. Which starting optimum and policy conclusion are supported?',
 'The starting optimum is (10,10); cash permits higher utility than the voucher despite equal face values.',
 'The starting optimum is (8,12); cash permits higher utility than the voucher despite equal face values.',
 'The starting optimum is (10,10); equal face values imply equal utility despite the different feasible sets.',
 'The starting optimum is (8,12); equal face values imply equal utility despite the different feasible sets.',
 'C=(10,10) is tangent to IC2 and is the starting optimum. Under the stated policy conditions, cash attains IC3 while the voucher cannot. A spending restriction can change feasible choices and attained utility even when nominal benefits match.',
 'Starting tangency C=(10,10) on IC2.','Compare cash and restricted vouchers by feasible utility, not face value.')
p('42605','At the smooth interior optimum shown, the price of X falls while income and Y’s price stay fixed. What is the old price ratio Px/Py, and what adjustment is initially supported at the old bundle, assuming diminishing marginal utility and an interior new optimum?',
 'Two; MUx/Px rises relative to MUy/Py, favoring more spending on X subject to the new budget.',
 'One; MUx/Px rises relative to MUy/Py, favoring more spending on X subject to the new budget.',
 'Two; MUx/Px falls relative to MUy/Py, favoring less spending on X subject to the new budget.',
 'One; MUx/Px falls relative to MUy/Py, favoring less spending on X subject to the new budget.',
 'The budget intercepts are 20 for X and 40 for Y, so Px/Py=40/20=2. At the old tangency MUx/Px=MUy/Py. Lower Px raises MUx/Px at the unchanged bundle. Reallocation toward X helps restore equality, while the final bundle must satisfy the new budget.',
 'Budget intercepts X=20,Y=40 and interior tangency at A.','Apply equimarginal adjustment after a price change without assuming the old budget remains valid.','40/20=2')
save();print('Graph proposals prepared:',len(R))
