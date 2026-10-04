from common import *
p=paired
p('P62H-MCMP-H-032','Which price does the firm charge at its profit-maximizing output in the graph, and how is it determined?',
 '$37; choose output at MR=MC, then read price from demand.',
 '$33; choose output at MR=MC, then read price from demand.',
 '$37; the MR=MC intersection directly gives the selling price.',
 '$33; the MR=MC intersection directly gives the selling price.',
 'MR=MC at Q=50, where the marginal value is $23. Demand at that output is $37. A firm with downward-sloping demand sets the output by its marginal rule and uses demand to find the price buyers will pay.',
 'At Q50: MR=MC23, demand37.','Distinguish the marginal output rule from the demand-curve price.')
for i in ['P62H-MCMP-L-091','P62H-MCMP-EL-031']:
 p(i,'Use the graph to evaluate the firm’s current economic profit. If this position attracts entry, which profit and adjustment are consistent with monopolistic competition?',
 '$200; entry reduces incumbent demand until it is tangent to ATC at the new MR=MC output.',
 '$150; entry reduces incumbent demand until it is tangent to ATC at the new MR=MC output.',
 '$200; entry leaves incumbent demand fixed and makes the firm choose minimum ATC regardless of MR.',
 '$150; entry leaves incumbent demand fixed and makes the firm choose minimum ATC regardless of MR.',
 'At Q=50, price is $37 and ATC $33, so economic profit is (37−33)×50=$200. Entry adds substitutes and reduces each incumbent’s demand until the profit-maximizing output has P=ATC.',
 'Q50,P37,ATC33.','Connect measured short-run profit to entry and long-run tangency.','(37-33)*50=200')
p('P62H-MCMP-H-034','At the profit-maximizing output shown, which total revenue and interpretation explain why the firm can keep operating?',
 '$972; revenue covers all explicit and implicit economic costs, including normal return.',
 '$864; revenue covers all explicit and implicit economic costs, including normal return.',
 '$972; zero economic profit means the owner receives no return and implicit costs are uncovered.',
 '$864; zero economic profit means the owner receives no return and implicit costs are uncovered.',
 'At Q=36, price and ATC both equal $27. Revenue and total economic cost are 36×27=$972. Zero economic profit includes coverage of opportunity costs and the normal return required to remain.',
 'Q36,P=ATC27.','Interpret zero economic profit as full economic cost recovery.','36*27=972')
for i,price,q in [('P62H-MCMP-EL-033',27,36),('P62H-MCMP-EL-035',27,36),('P62H-MCMP-H-016',76,24),('P62H-MCMP-EL-023',82,28),('P62H-MCMP-L-094',27,36)]:
 p(i,'Suppose the plotted outcome follows an earlier period of short-run profit and entry. Which current price and description of the adjustment are correct?',
 f'${price}; entry shifted incumbent demand inward until price equaled ATC at the MR=MC output.',
 f'${price-4}; entry shifted incumbent demand inward until price equaled ATC at the MR=MC output.',
 f'${price}; entry eliminated profit by making each firm choose minimum ATC regardless of demand and MR.',
 f'${price-4}; entry eliminated profit by making each firm choose minimum ATC regardless of demand and MR.',
 f'The plotted profit-maximizing quantity is {q}, where demand is tangent to ATC at ${price}. Entry reduces incumbent demand until economic profit is zero. The firm still chooses output using MR=MC, and the tangency lies below the minimum-ATC output.',
 f'Demand–ATC tangency at Q{q},P{price}, with Q below minimum ATC.','Infer entry-driven adjustment from a long-run differentiated-firm outcome.')
p('P62H-MCMP-L-092','A student says zero economic profit makes the firm both allocatively and productively efficient. Which markup in the graph and evaluation of the claim are correct?',
 '$12; zero profit proves neither P=MC nor production at minimum ATC.',
 '$8; zero profit proves neither P=MC nor production at minimum ATC.',
 '$12; zero profit is sufficient to prove both forms of efficiency despite the markup.',
 '$8; zero profit is sufficient to prove both forms of efficiency despite the markup.',
 'At Q=36, P=ATC=$27 but MC=$15, so the markup is $12. ATC continues falling to the right of this output. Zero profit establishes cost recovery, not marginal efficiency or minimum average cost.',
 'AtQ36 P=ATC27,MC15; ATC minimum right of36.','Diagnose conflating zero economic profit with two efficiency conditions.','27-15=12')
for i in ['P62H-MCMP-H-037','P62H-MCMP-EL-036']:
 p(i,'The firm could produce at minimum ATC. Which current profit-maximizing quantity and explanation show why it stops earlier in the graph?',
 '36 units; beyond that output MC exceeds MR, so expanding merely to lower ATC reduces profit.',
 '30 units; beyond that output MC exceeds MR, so expanding merely to lower ATC reduces profit.',
 '36 units; lower ATC always guarantees higher profit even when MC exceeds MR.',
 '30 units; lower ATC always guarantees higher profit even when MC exceeds MR.',
 'MR crosses MC at Q=36, while minimum ATC is at Q=50. Between them, added units cost more than their added revenue. Minimizing ATC is not the firm’s profit-maximizing output rule.',
 'MR–MC crossing36; minimum ATC50.','Distinguish the marginal profit rule from minimizing average cost.')
p('P62H-MCMP-H-015','At Q1 in the graph, which price and equality establish zero economic profit?',
 '$76; price equals average total cost.','$70; price equals average total cost.',
 '$76; price equals marginal cost.','$70; price equals marginal cost.',
 'At Q1=24, demand is tangent to ATC at $76, giving (P−ATC)Q=0. MC is $49.60, so zero profit here is not P=MC.',
 'Q1=24,price=ATC76,MC49.6.','Use P=ATC to establish zero profit rather than P=MC.')
for i in ['P62H-MCMP-H-017','P62H-MCMP-EL-021']:
 p(i,'Which markup at Q1 is shown, and why does it matter for allocative efficiency even when profit is zero?',
 '$16.20; price exceeds marginal cost, so P=ATC does not establish marginal efficiency.',
 '$12.20; price exceeds marginal cost, so P=ATC does not establish marginal efficiency.',
 '$16.20; price equaling ATC automatically establishes marginal efficiency despite P exceeding MC.',
 '$12.20; price equaling ATC automatically establishes marginal efficiency despite P exceeding MC.',
 'At Q1=18, price and ATC are $64 and MC is $47.80. The markup is $16.20. P=ATC means zero profit; allocative efficiency requires price, a marginal willingness to pay, to equal MC.',
 'AtQ1 P=ATC64,MC47.8.','Distinguish average-cost recovery from allocative marginal equality.','64-47.8=16.2')
p('P62H-MCMP-H-018','After entry restores the plotted long-run equilibrium, which markup and profit combination can persist?',
 'A $16.20 markup with zero economic profit; price exceeds MC but equals ATC.',
 'A $12.20 markup with zero economic profit; price exceeds MC but equals ATC.',
 'A $16.20 markup with zero economic profit; any markup must also be economic profit per unit.',
 'A $12.20 markup with zero economic profit; any markup must also be economic profit per unit.',
 'The graph gives P=ATC=64 and MC=47.8 at Q1. Markup is16.2, while profit per unit P−ATC is zero. Marginal and average costs serve different comparisons.',
 'P=ATC64,MC47.8 atQ1.','Explain a positive markup coexisting with zero economic profit.','64-47.8=16.2;64-64=0')
p('P62H-MCMP-H-019','What is the difference between the two labeled output levels in the graph, and how should it be interpreted?',
 'About 23.63 units of excess capacity: efficient scale exceeds the profit-maximizing output.',
 'About 18.63 units of excess capacity: efficient scale exceeds the profit-maximizing output.',
 'About 23.63 units of unsold inventory: every unit below efficient scale has already been produced.',
 'About 18.63 units of unsold inventory: every unit below efficient scale has already been produced.',
 'Q1=28 and Q2=51.63, so excess capacity is51.63−28=23.63. This measures the gap to minimum-ATC output, not goods already produced and left unsold.',
 'Q1=28,Q2=51.63 at minimumATC.','Interpret excess capacity as an output-scale gap rather than inventory.','51.63-28=23.63')
p('P62H-MCMP-H-020','Which price and cost relationship explain why entry stops at the long-run position in the graph?',
 '$82; price equals ATC, so no positive economic profit remains to attract entry.',
 '$72; price equals ATC, so no positive economic profit remains to attract entry.',
 '$82; price equals MC, which by itself guarantees zero economic profit.',
 '$72; price equals MC, which by itself guarantees zero economic profit.',
 'At Q1=28, demand and ATC meet at $82. This eliminates economic profit and the entry incentive, while MC remains only $48.40. P=MC is not the zero-profit test.',
 'Q1P=ATC82,MC48.4.','Explain the cessation of entry by economic profit rather than markup.')
p('P62H-MCMP-EL-025','Which markup at Q1 and explanation reconcile the firm’s pricing with zero economic profit?',
 '$17.60; price equals ATC but lies above MC.',
 '$13.60; price equals ATC but lies above MC.',
 '$17.60; price above MC necessarily equals profit per unit.',
 '$13.60; price above MC necessarily equals profit per unit.',
 'At Q1=22, P=ATC=68 while MC=50.4. The markup is17.6, but P−ATC=0. Covering fixed and other costs can require a markup without positive economic profit.',
 'P=ATC68,MC50.4 atQ1.','Distinguish markup from profit per unit.','68-50.4=17.6')
for i in ['P62H-MCMP-B3-055','P62H-MCMP-H-038']:
 p(i,'Which excess-capacity measure and profit interpretation fit the graph?',
 '14 units; the firm earns zero economic profit because price equals ATC at its chosen output.',
 '10 units; the firm earns zero economic profit because price equals ATC at its chosen output.',
 '14 units; unused efficient scale necessarily means the firm is making an economic loss.',
 '10 units; unused efficient scale necessarily means the firm is making an economic loss.',
 'The firm produces36 where MR=MC and P=ATC=27. Minimum ATC occurs at50, leaving14 units of excess capacity. Producing below efficient scale is productive inefficiency, but it does not contradict zero profit.',
 'Output36,minATC output50,P=ATC27.','Distinguish productive inefficiency from economic loss.','50-36=14')
for i,price,mc,q in [('P62H-MCMP-EL-032',37,23,50),('P62H-MCMP-H-039',27,15.5,36)]:
 mark=price-mc
 p(i,'Which markup at the profit-maximizing output and allocative assessment are correct?',
 f'${mark:g}; marginal willingness to pay exceeds marginal cost, so the allocation is not marginally efficient.',
 f'${mark-4:g}; marginal willingness to pay exceeds marginal cost, so the allocation is not marginally efficient.',
 f'${mark:g}; any profit-maximizing output must be allocatively efficient even when price exceeds MC.',
 f'${mark-4:g}; any profit-maximizing output must be allocatively efficient even when price exceeds MC.',
 f'At Q={q}, price is ${price} and MC ${mc:g}, giving markup ${mark:g}. Allocative efficiency compares marginal willingness to pay on demand with MC. The private rule MR=MC does not make P=MC.',
 f'AtQ{q},P{price},MC{mc}.','Distinguish private profit maximization from allocative efficiency.',f'{price}-{mc}={mark}')
p('P62H-MCMP-H-036','Which price-cost gap distinguishes the plotted zero-profit outcome from perfectly competitive long-run equilibrium?',
 'A $12 markup; P=ATC can coexist with P>MC.',
 'An $8 markup; P=ATC can coexist with P>MC.',
 'A $12 markup; zero economic profit requires P=MC regardless of demand.',
 'An $8 markup; zero economic profit requires P=MC regardless of demand.',
 'At Q36, P=ATC=27 and MC=15, leaving a12 markup. In monopolistic competition downward-sloping firm demand permits this markup at zero profit, unlike the standard competitive long-run equality P=MC=minATC.',
 'P=ATC27,MC15,Q36.','Compare differentiated-firm long-run equilibrium with perfect competition.','27-15=12')
p('P62H-MCMP-EL-034','Which markup and output gap are shown, and what inefficiencies do they identify?',
 '$11.50 and14 units; the markup indicates allocative inefficiency and the scale gap productive inefficiency.',
 '$8.50 and10 units; the markup indicates allocative inefficiency and the scale gap productive inefficiency.',
 '$11.50 and14 units; the markup and scale gap are eliminated automatically by zero economic profit.',
 '$8.50 and10 units; the markup and scale gap are eliminated automatically by zero economic profit.',
 'AtQ36,P27 exceedsMC15.5 by11.5. MinimumATC occurs atQ50,14 units above output. The first gap concerns marginal value versus cost, the second producing above minimum average cost. P=ATC does not remove either.',
 'Q36,P27,MC15.5,minATC Q50.','Distinguish allocative and productive inefficiency at zero profit.','27-15.5=11.5;50-36=14')
for i in ['P62H-MCMP-EL-037','P62H-MCMP-L-095']:
 p(i,'A policymaker proposes eliminating the firm’s markup and requiring production at minimum ATC, arguing that zero economic profit leaves no further welfare issue. Which graph evidence and assessment are supported?',
 'Markup$11.50 and excess capacity14 units; potential allocative gains must be weighed against cost recovery and product-variety benefits absent from this diagram.',
 'Markup$8.50 and excess capacity10 units; potential allocative gains must be weighed against cost recovery and product-variety benefits absent from this diagram.',
 'Markup$11.50 and excess capacity14 units; zero profit alone proves that the proposal cannot involve either gains or tradeoffs.',
 'Markup$8.50 and excess capacity10 units; zero profit alone proves that the proposal cannot involve either gains or tradeoffs.',
 'The figure givesQ36,P=ATC27,MC15.5 and minimumATC atQ50. Markup11.5 signals a marginal-efficiency issue and the14-unit gap is excess capacity. Zero profit is not proof of efficiency. The firm graph does not quantify benefits of differentiated products or establish cost recovery under the proposal.',
 'Q36,P=ATC27,MC15.5,efficient scale50.','Evaluate a policy claim while recognizing variety and cost-recovery limitations.','27-15.5=11.5;50-36=14')
p('P62H-MCMP-L-093','Suppose the firm must charge marginal cost at its current profit-maximizing quantity, with that quantity and costs held fixed. Which loss and policy tension follow from the graph?',
 '$414; marginal-cost pricing at that quantity fails to cover total economic costs.',
 '$306; marginal-cost pricing at that quantity fails to cover total economic costs.',
 '$414; price equaling marginal cost necessarily covers total economic costs.',
 '$306; price equaling marginal cost necessarily covers total economic costs.',
 'AtQ36,MC15.5 and ATC27. Holding quantity fixed, pricing atMC gives profit(15.5−27)×36=−414. Matching marginal value and cost does not itself recover total costs. A full policy evaluation would also need to account for quantity responses.',
 'Q36,MC15.5,ATC27.','Evaluate the tension between marginal-cost pricing and cost recovery.','(27-15.5)*36=414')
p('P62H-MCMP-H-013','At Q1 in the graph, which markup and combined assessment of profit and productive efficiency are correct?',
 '$20; zero economic profit coexists with excess capacity.',
 '$15; zero economic profit coexists with excess capacity.',
 '$20; a positive markup guarantees positive economic profit and production at efficient scale.',
 '$15; a positive markup guarantees positive economic profit and production at efficient scale.',
 'Q1=20 hasP=ATC70 andMC50, giving markup20 and zero profit. The minimum-ATC output isQ2=34.64, aboveQ1, so excess capacity remains.',
 'Q1=20,P=ATC70,MC50,Q2=34.64.','Combine markup, zero-profit and productive-efficiency distinctions.','70-50=20')
p('P62H-MCMP-H-014','Suppose demand shifts outward from the plotted position while costs remain unchanged. Which original price and likely short-run-to-long-run adjustment are correct?',
 '$70; the firm can earn economic profit before entry reduces incumbent demand.',
 '$60; the firm can earn economic profit before entry reduces incumbent demand.',
 '$70; an outward demand shift must leave economic profit zero immediately, so it cannot encourage entry.',
 '$60; an outward demand shift must leave economic profit zero immediately, so it cannot encourage entry.',
 'The starting tangency isP=ATC70 atQ1=20. A higher demand curve can support price above cost and positive short-run profit. Entry then offers substitutes and reduces incumbent demand; it need not eliminate profit immediately.',
 'Original demand–ATC tangency atQ20,P70.','Distinguish an immediate demand shock from later entry adjustment.')
p('P62H-MCMP-EL-017','The firm considers increasing output from Q1 toward minimum ATC at Q2. Which starting output and profit assessment are supported by the graph?',
 '20 units; MC exceeds MR beyond that point, so lowering ATC by expansion does not maximize profit.',
 '24 units; MC exceeds MR beyond that point, so lowering ATC by expansion does not maximize profit.',
 '20 units; falling ATC guarantees higher profit even when MC exceeds MR.',
 '24 units; falling ATC guarantees higher profit even when MC exceeds MR.',
 'Q1=20 is theMR–MC crossing, whileQ2=34.64 minimizes ATC. Between them,MC exceedsMR, so extra units reduce profit despite lowering average cost.',
 'Q1=20,Q2=34.64; MC aboveMR to the right ofQ1.','Evaluate expansion using marginal profit rather than average-cost savings.')
save();print('Graph proposals prepared:',len(R))
