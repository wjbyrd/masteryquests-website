from common import *
p=paired
p('P62F-PC-B1-019','At the profit-maximizing output in the graph, what is profit per unit, and which comparison measures it?',
 '$10, from price minus ATC.','$15, from price minus ATC.',
 '$10, from price minus AVC.','$15, from price minus AVC.',
 'Rising MC meets price at Q=50. Price is $30, ATC $20 and AVC $10. Profit per unit is P−ATC=$10; P−AVC instead measures contribution toward fixed cost.',
 'Q50,P30,ATC20,AVC10.','Distinguish profit per unit from contribution above variable cost.','30-20=10')
for i in ['P62F-PC-B1-020','P62F-PC-L-092']:
 p(i,'At the profit-maximizing output shown, which price and profit interpretation are correct?',
 '$25; P=ATC gives zero economic profit while covering the normal return included in economic cost.',
 '$20; P=ATC gives zero economic profit while covering the normal return included in economic cost.',
 '$25; P=ATC means the owner’s opportunity cost and normal return are not covered.',
 '$20; P=ATC means the owner’s opportunity cost and normal return are not covered.',
 'The firm choosesQ50 atP=MC=25, andATC is also25. Revenue covers all economic costs, including implicit opportunity costs; zero economic profit is break-even, not no return.',
 'Q50,P=MC=ATC25,AVC15.','Interpret break-even as coverage of all economic costs.')
for i,loss,amount in [('P62F-PC-B2-025',True,'between$4 and$6'),('P62F-PC-B2-024',False,'between$10 and$15'),('P62F-PC-L-062',False,'between$10 and$15')]:
 measure='loss' if loss else 'profit';method='ATC minus price' if loss else 'price minus ATC'
 p(i,f'At Q1 in the graph, what is the approximate height of the {measure} rectangle, and what does that height measure?',
 f'{amount} per unit; {method} measures economic {measure} per unit.',
 f'between$6 and$10 per unit; {method} measures economic {measure} per unit.',
 f'{amount} per unit; the vertical gap alone is total economic {measure}.',
 f'between$6 and$10 per unit; the vertical gap alone is total economic {measure}.',
 ('AtQ1, price is20 andATC around25. ' if loss else 'AtQ1, the price–ATC gap is about13–14 dollars. ')+f'The height is {method}, an amount per unit. Multiply it byQ1 to obtain total {measure}.',
 'AtQ1: '+('P20,ATC≈25.' if loss else 'P≈37,ATC≈24.' if i.endswith('024') else 'P≈40,ATC≈26.'),f'Distinguish the per-unit {measure} gap from the total rectangle.')
p('P62F-PC-L-093','Market price falls slightly below its plotted level but remains above AVC, with cost curves fixed. Which original price and short-run adjustment are correct?',
 '$25; choose a lower output on rising MC and operate at a loss while price covers AVC.',
 '$20; choose a lower output on rising MC and operate at a loss while price covers AVC.',
 '$25; shut down as soon as price falls below ATC even while variable cost is covered.',
 '$20; shut down as soon as price falls below ATC even while variable cost is covered.',
 'The graph starts atP=ATC=25 atQ50. A slightly lower price intersects risingMC at lower output and lies belowATC, creating a loss. Since price still coversAVC, operation contributes toward unavoidable fixed cost.',
 'OriginalP25 atminimumATC,Q50.','Evaluate a price decline by the marginal output and shutdown rules separately.')
for i in ['P62F-PC-H-012','P62F-PC-L-064']:
 p(i,'Which market price and short-run decision are supported by the graph?',
 '$20; produce at the rising-MC intersection despite an economic loss because price covers AVC.',
 '$22; produce at the rising-MC intersection despite an economic loss because price covers AVC.',
 '$20; shut down because price below ATC is sufficient for shutdown.',
 '$22; shut down because price below ATC is sufficient for shutdown.',
 'The horizontal price is20, betweenAVC andATC atQ1. Revenue covers variable cost and contributes toward fixed cost, making production less costly than shutdown even though economic profit is negative.',
 'Price20;atQ1 AVC≈16<20<ATC≈25.','Distinguish short-run loss minimization from shutdown.')
p('P62F-PC-LB-016','Fixed cost is unavoidable this period. A student says shutting down removes the entire operating loss in the graph. Which price reading and comparison correctly evaluate that claim?',
 'Price is below$20 but above$15; production covers part of fixed cost, whereas shutdown leaves all fixed cost unpaid.',
 'Price is above$20 but below$25; production covers part of fixed cost, whereas shutdown leaves all fixed cost unpaid.',
 'Price is below$20 but above$15; shutdown avoids fixed as well as variable cost and removes the whole loss.',
 'Price is above$20 but below$25; shutdown avoids fixed as well as variable cost and removes the whole loss.',
 'Price is around18.5, aboveAVC near15.5 but belowATC near23 atQ1. Operating loss is(ATC−P)Q1, smaller than fixed cost(ATC−AVC)Q1 by the positive contribution(P−AVC)Q1. Shutdown cannot avoid the stated fixed commitment.',
 'AtQ1,price15–20 withAVC belowP andATC aboveP.','Compare operating loss with unavoidable fixed cost rather than assuming shutdown erases it.')
for i in ['P62F-PC-H-013','P62F-PC-L-066']:
 p(i,'Which price reading and operating decision are supported by the graph?',
 '$14; shut down because price is below minimum AVC, bearing unavoidable fixed cost.',
 '$10; shut down because price is below minimum AVC, bearing unavoidable fixed cost.',
 '$14; produce at a price–MC crossing even though no positive output covers variable cost.',
 '$10; produce at a price–MC crossing even though no positive output covers variable cost.',
 'The price line is14, below minimumAVC near19. At any positive output revenue fails to cover variable cost. Shutdown avoids that extra loss, but fixed cost remains.',
 'Price14,minimumAVC≈19.','Apply the shutdown condition in addition to the marginal output rule.')
p('P62F-PC-EL-012','The cost curves shown include a per-unit tax. Which market price and assessment of the firm’s taxed short-run decision are correct?',
 '$14; shut down because the tax-adjusted AVC minimum is above price.',
 '$10; shut down because the tax-adjusted AVC minimum is above price.',
 '$14; keep producing because a per-unit tax is fixed cost and cannot affect the shutdown threshold.',
 '$10; keep producing because a per-unit tax is fixed cost and cannot affect the shutdown threshold.',
 'The plotted price is14, below the taxedAVC minimum near19. A tax paid per unit enters avoidable costs and can raise the operating threshold. It is not a lump-sum fixed charge.',
 'Price14 belowplottedminimumAVC≈19.','Assess a variable tax through its effect on avoidable cost and shutdown.')
p('P62F-PC-LB-017','At the plotted price, compare an unconditional lump-sum grant with a per-unit subsidy large enough to lift net receipts above minimum AVC. Fixed cost is unavoidable this period. Which price reading and operating comparison are correct?',
 'Price is about$12; the unconditional grant leaves shutdown incentives unchanged, while the per-unit subsidy can make production worthwhile.',
 'Price is about$8; the unconditional grant leaves shutdown incentives unchanged, while the per-unit subsidy can make production worthwhile.',
 'Price is about$12; an unconditional grant and a per-unit subsidy necessarily change marginal operating incentives in the same way.',
 'Price is about$8; an unconditional grant and a per-unit subsidy necessarily change marginal operating incentives in the same way.',
 'The price is12, belowminimumAVC near17. A grant received whether producing or not adds equally to both payoffs, leaving their difference unchanged. A per-unit subsidy is earned only with output and can change net receipts relative toMC andAVC.',
 'Price12,minimumAVC≈17.','Compare lump-sum and marginal incentives in an operating decision.')
for i in ['P62F-PC-H-011','P62F-PC-L-061']:
 p(i,'Which price reading and order of analysis correctly determine the firm’s output and profit?',
 'Price is between$35 and$40; use rising MC=P to choose output, then compare P with ATC there.',
 'Price is between$40 and$45; use rising MC=P to choose output, then compare P with ATC there.',
 'Price is between$35 and$40; choose minimum ATC first regardless of the price–MC intersection.',
 'Price is between$40 and$45; choose minimum ATC first regardless of the price–MC intersection.',
 'The price line is near37. It crosses risingMC atQ1 to the right of minimumATC. AtQ1 price exceedsATC, giving a profit rectangle(P−ATC)Q1. Average-cost minimization is not the general output rule.',
 'Price≈37;Q1risingMC crossingrightofminimumATC.','Sequence the output choice before evaluating the profit rectangle.')
for i in ['P62F-PC-H-016','P62F-PC-B1-005']:
 p(i,'Which approximate quantity at Q1 and marginal condition identify the firm’s profit-maximizing output?',
 'About60 units; MC rises through price, so extra units beyond it cost more than they add to revenue.',
 'About40 units; MC rises through price, so extra units beyond it cost more than they add to revenue.',
 'About60 units; any MC=price crossing is equally profit maximizing regardless of the direction of crossing.',
 'About40 units; any MC=price crossing is equally profit maximizing regardless of the direction of crossing.',
 'Q1 is near60 on risingMC. Just below itMR=P exceedsMC; just above itMC exceedsMR. This change in marginal profit identifies a maximum, unlike a falling-MC crossing.',
 'Q1≈60 onrisingMC atprice≈40.','Use the rising-MC condition rather than treating all marginal equalities as maxima.')
p('P62F-PC-LB-015','An unavoidable fee this year exceeds the firm’s initial total profit; it leaves demand, MC and AVC unchanged and is avoidable by leaving before next year. Which current price range and response fit the graph?',
 'Between$35 and$40; retain short-run output but incur a loss, with exit possible next year if the loss persists.',
 'Between$40 and$45; retain short-run output but incur a loss, with exit possible next year if the loss persists.',
 'Between$35 and$40; the unavoidable fee alone requires immediate shutdown even with unchanged contribution above variable cost.',
 'Between$40 and$45; the unavoidable fee alone requires immediate shutdown even with unchanged contribution above variable cost.',
 'Price is near36 and initially aboveATC atQ1. The fee changes neitherMR=MC nor the positive margin aboveAVC. Since it exceeds initial profit, current profit becomes negative, but the future avoidable fee creates a later exit consideration.',
 'Price≈36;atQ1P>ATC>AVC.','Distinguish unavoidable present fixed costs from avoidable future commitments.')
for i,threshold,alt in [('P62F-PC-L-067',16,20),('P62F-PC-H-017',16,20),('P62F-PC-B2-036',18,22)]:
 p(i,'What is the approximate shutdown-price threshold in the graph, and which part of MC supplies the firm’s positive short-run output?',
 f'${threshold}; rising MC at and above minimum AVC.',f'${alt}; rising MC at and above minimum AVC.',
 f'${threshold}; the entire MC curve, including prices below minimum AVC.',f'${alt}; the entire MC curve, including prices below minimum AVC.',
 f'The AVC minimum is about{threshold}, where risingMC meets it. Above this price the firm selects risingMC=P. Below it no positive output covers variable cost, so that lowerMC segment is not operating supply.',
 f'MinimumAVC≈{threshold},risingMCcrossingthere.','Derive the supply segment using both marginal choice and avoidable-cost coverage.')
p('P62F-PC-LB-018','Compare higher unavoidable fixed rent with a higher variable cost on every unit. Which approximate starting shutdown threshold and comparison of short-run supply are correct?',
 '$14; fixed rent leaves MC and AVC unchanged, while higher variable cost can raise both the supply curve and its threshold.',
 '$18; fixed rent leaves MC and AVC unchanged, while higher variable cost can raise both the supply curve and its threshold.',
 '$14; fixed rent and variable cost necessarily shift MC and the shutdown threshold equally.',
 '$18; fixed rent and variable cost necessarily shift MC and the shutdown threshold equally.',
 'The graph’sAVC minimum is near14. Unavoidable rent does not enterAVC orMC, though it reduces profit. A cost incurred for each unit changes the marginal and avoidable-cost comparisons that determine supply.',
 'MinimumAVC≈14.','Separate fixed-rent effects from variable-cost effects on operating supply.')
p('P62F-PC-L-091','Which calculation and sequence correctly determine economic profit from the graph?',
 '$500; choose Q=50 from rising MC=P, then multiply the price–ATC gap by output.',
 '$400; choose Q=40 from rising MC=P, then multiply the price–ATC gap by output.',
 '$500; choose output at minimum ATC regardless of price and use price–AVC as profit per unit.',
 '$400; choose output at minimum ATC regardless of price and use price–AVC as profit per unit.',
 'Price30 meets risingMC at50. ATC there is20, so profit=(30−20)×50=500. Choose output with the marginal rule before comparing price with total cost per unit.',
 'P30,Q50,ATC20.','Apply the output-to-profit reasoning chain.','(30-20)*50=500')
p('P62F-PC-EL-033','At the chosen output, what is the price–AVC margin, and why does the graph show break-even rather than the shutdown threshold?',
 '$10; price equals ATC and exceeds AVC, covering all economic costs.',
 '$5; price equals ATC and exceeds AVC, covering all economic costs.',
 '$10; zero economic profit means price must equal minimum AVC.',
 '$5; zero economic profit means price must equal minimum AVC.',
 'AtQ50,P=ATC25 andAVC15, leaving10 above variable cost per unit. The firm covers all economic costs. Shutdown indifference occurs at minimumAVC, not at zero economic profit.',
 'Q50,P=ATC25,AVC15.','Distinguish break-even from the shutdown threshold.','25-15=10')
for i in ['P62F-PC-EL-034','P62F-PC-B2-037']:
 p(i,'Which operating loss and shutdown loss are implied by the graph, and what should the firm do if fixed cost is unavoidable?',
 'Operate: lose$300; shut down: lose$600. Producing covers variable cost and part of fixed cost.',
 'Operate: lose$200; shut down: lose$500. Producing covers variable cost and part of fixed cost.',
 'Operate: lose$300; shut down: lose$600. A loss alone requires shutdown regardless of the avoidable-cost comparison.',
 'Operate: lose$200; shut down: lose$500. A loss alone requires shutdown regardless of the avoidable-cost comparison.',
 'AtQ30,P30,ATC40 andAVC20. Operating loss=(40−30)×30=300; fixed cost=(40−20)×30=600. Production contributes(30−20)×30=300 toward that unavoidable cost, reducing the loss.',
 'Q30,P30,ATC40,AVC20.','Compare short-run operating and shutdown losses.','(40-30)*30=300;(40-20)*30=600')
p('P62F-PC-L-094','Which current loss and short-run-to-long-run reasoning follow from the graph?',
 '$300; operate because price covers AVC, but persistent losses create pressure to exit.',
 '$200; operate because price covers AVC, but persistent losses create pressure to exit.',
 '$300; operate now because price covers AVC, which also guarantees no reason to exit in the long run.',
 '$200; operate now because price covers AVC, which also guarantees no reason to exit in the long run.',
 'P=MC atQ30; P30 lies betweenAVC20 andATC40. The loss is300 but production covers variable cost. Over time, persistent failure to cover total opportunity costs can induce exit.',
 'Q30,P30,AVC20,ATC40.','Separate the operating threshold from long-run viability.','(40-30)*30=300')
for i in ['P62F-PC-M-040','P62F-PC-EL-036']:
 p(i,'At what price does the positive-output portion of short-run supply begin in the graph, and why is lower MC excluded?',
 '$20 at A; lower prices do not cover minimum AVC.',
 '$30 at B; lower prices do not cover minimum AVC.',
 '$20 at A; any positive MC guarantees that producing covers total cost.',
 '$30 at B; any positive MC guarantees that producing covers total cost.',
 'A is at price20 and the minimum ofAVC. The risingMC segment from there gives operating supply. Below20, a possibleMC crossing is insufficient because revenue cannot cover variable cost.',
 'A at(22,20),minimumAVC;B at(36,30).','Identify supply using the shutdown threshold and rising marginal cost.')
p('P62F-PC-H-038','If market price rises to the level at B in the graph, which output and rule apply?',
 '36 units; choose rising MC equal to price, since that price is above minimum AVC.',
 '44 units; choose rising MC equal to price, since that price is above minimum AVC.',
 '36 units; choose the minimum of ATC independently of the market price.',
 '44 units; choose the minimum of ATC independently of the market price.',
 'B is nearQ36,P30, above the shutdown pointA atP20. The operating output usesMC=P on its rising segment, not theATC minimum atC.',
 'B=(36,30),A=(22,20),C atQ44.','Apply the operating marginal output rule above the shutdown threshold.')
p('P62F-PC-L-095','Why does a low-output MC intersection not justify production at the plotted price line?',
 'Price is$10 below the minimum AVC; the shutdown condition must also be satisfied.',
 'Price is$5 below the minimum AVC; the shutdown condition must also be satisfied.',
 'Price is$10 below the minimum AVC; any MC=price intersection is sufficient for production.',
 'Price is$5 below the minimum AVC; any MC=price intersection is sufficient for production.',
 'The price line is10 while minimumAVC is20 atA, a10 gap. Marginal equality alone does not establish that operating beats shutdown. At this price variable cost cannot be covered.',
 'Price10,minimumAVC20.','Require avoidable-cost coverage in addition to marginal equality.','20-10=10')
p('P62F-PC-L-096','If price equals the level at A in the graph, which price and choice comparison are correct?',
 '$20; producing the shutdown output and producing zero give the same short-run profit.',
 '$30; producing the shutdown output and producing zero give the same short-run profit.',
 '$20; the firm necessarily earns zero economic profit and avoids all fixed cost.',
 '$30; the firm necessarily earns zero economic profit and avoids all fixed cost.',
 'A is theAVC minimum at20. At that price revenue exactly covers variable cost, so either operating atA or shutting down leaves the same unavoidable fixed-cost loss. This is not economic break-even.',
 'A price20 atminimumAVC.','Interpret shutdown indifference separately from zero economic profit.')
p('P62F-PC-EL-037','Fixed cost falls while MC and AVC remain as drawn. What happens to the shutdown price, and why?',
 'It remains$20; minimum AVC, not fixed cost, sets the operating threshold.',
 'It remains$30; minimum AVC, not fixed cost, sets the operating threshold.',
 'It remains$20; fixed cost is the avoidable cost that determines shutdown.',
 'It remains$30; fixed cost is the avoidable cost that determines shutdown.',
 'MinimumAVC is20 atA. Lower fixed cost reducesATC and affects economic profit, but unchangedAVC andMC leave the shutdown threshold at20.',
 'A minimumAVC=20.','Separate fixed-cost changes from the short-run shutdown threshold.')
for i in ['P62F-PC-L-063','P62F-PC-H-014']:
 p(i,'Which approximate price and interpretation describe the firm’s position in the graph?',
 '$23; P=MC=minimum ATC gives zero economic profit, normal return and productive efficiency.',
 '$28; P=MC=minimum ATC gives zero economic profit, normal return and productive efficiency.',
 '$23; zero economic profit means opportunity costs are uncovered despite P equaling ATC.',
 '$28; zero economic profit means opportunity costs are uncovered despite P equaling ATC.',
 'The price line is near23 and passes through theATC minimum and risingMC atQ1. The firm covers explicit and implicit economic costs at minimum average cost, giving normal return with zero economic profit.',
 'Price≈23 atminimumATC andrisingMC.','Combine zero economic profit, normal return and minimum-cost production.')
save();print('Graph proposals prepared:',len(R))
