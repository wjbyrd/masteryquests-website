from common import *
p=paired
for i,price,other in [('P62F-PC-M-043',40,30),('P62F-PC-L-068',45,35),('P62F-PC-EL-043',25,20)]:
 p(i,'How do the two panels determine the representative firm’s price and output?',
 f'The market sets price at about${price}; the firm takes it as horizontal MR and selects output on rising MC.',
 f'The market sets price at about${other}; the firm takes it as horizontal MR and selects output on rising MC.',
 f'The market sets price at about${price}; the firm uses the whole market quantity as its own output regardless of MC.',
 f'The market sets price at about${other}; the firm uses the whole market quantity as its own output regardless of MC.',
 f'Market supply and demand meet at price about{price}. That price becomes the individual price taker’sP=MR=AR line. The firm uses its own risingMC to choose output; aggregate market quantity is not assigned to each firm.',
 f'Marketintersectionprice≈{price};matchinghorizontalfirmMR.','Link market price determination to the individual firm’s marginal decision.')
p('P62F-PC-EL-039','Which plotted market and firm quantities and interpretation respect the difference between the panels?',
 'Market75 thousand, firm90; the market total and one firm’s output use different aggregation levels and scales.',
 'Market100 thousand, firm80; the market total and one firm’s output use different aggregation levels and scales.',
 'Market75 thousand, firm90; market quantity must be assigned to each firm because both face the same price.',
 'Market100 thousand, firm80; market quantity must be assigned to each firm because both face the same price.',
 'The left equilibrium is75 on a thousands scale, while the right panel’s risingMC crossing is90 firm units. Price40 links the panels, but their quantity axes describe different economic objects.',
 'MarketQ75thousand;firmQ90.','Distinguish aggregate market output from a representative firm’s output.')
p('P62F-PC-LB-013','An analyst assigns the market quantity to each firm and recommends minimum-ATC output whenever it differs from MR=MC. Which market price and corrected method fit the panels?',
 'About$45; use it as firm MR, choose rising MC=MR, check AVC for operation and ATC for profit.',
 'About$35; use it as firm MR, choose rising MC=MR, check AVC for operation and ATC for profit.',
 'About$45; use market quantity for the firm, then let minimum ATC determine output without an AVC check.',
 'About$35; use market quantity for the firm, then let minimum ATC determine output without an AVC check.',
 'The market sets price near45. The firm’s risingMC crossing lies around60–65 units, with price aboveATC andAVC. The panels transmit price, not identical quantities. MC determines operating output,AVC tests shutdown, andATC measures profit.',
 'Marketprice≈45;firmrisingMCcrossingabout60–65 withP>ATC>AVC.','Correct aggregation and output-rule errors while preserving operation and profit checks.')
p('P62F-PC-EL-018','Market price rises from the level plotted while the firm’s cost curves stay fixed. Which starting price range and changes on the firm panel are correct?',
 'Between$40 and$45; the horizontal P=MR line rises and output increases along unchanged MC.',
 'Between$30 and$35; the horizontal P=MR line rises and output increases along unchanged MC.',
 'Between$40 and$45; the price increase itself shifts the firm’s MC curve upward.',
 'Between$30 and$35; the price increase itself shifts the firm’s MC curve upward.',
 'The current price is slightly above40. A higher market price raises the firm’s horizontal revenue line; its risingMC crossing moves right. With costs held fixed,MC does not shift.',
 'CurrentP1justabove40 onbothpanels.','Distinguish a higher revenue line and movement along MC from a cost shift.')
for i in ['P62F-PC-H-042','P62F-PC-B3-056','P62F-PC-EL-038','P62F-PC-L-097']:
 p(i,'Use the paired panels. Assume free entry, identical firms and unchanged input prices and cost curves. Which current firm profit and long-run adjustment follow?',
 '$1,800; entry expands market supply, lowering price and each firm’s output along rising MC until economic profit is zero.',
 '$1,500; entry expands market supply, lowering price and each firm’s output along rising MC until economic profit is zero.',
 '$1,800; entry reduces market supply and raises each survivor’s price and output until profit is zero.',
 '$1,500; entry reduces market supply and raises each survivor’s price and output until profit is zero.',
 'The market setsP40. The firm choosesQ90, withATC20, earning(40−20)×90=1800. Entry adds market supply and lowers the shared price. Each firm’sMR falls and its output contracts along fixed risingMC. Under the stated conditions adjustment ends atP=MC=minimumATC.',
 'MarketP40;firmQ90,ATC20.','Trace profit-driven entry from the market through firm revenue, output and long-run break-even.','(40-20)*90=1800')
p('P62F-PC-H-045','Which firm loss in the graph and market response follow if the position persists?',
 '$150; exit reduces market supply and raises price for surviving firms.',
 '$100; exit reduces market supply and raises price for surviving firms.',
 '$150; exit expands market supply and lowers price for surviving firms.',
 '$100; exit expands market supply and lowers price for surviving firms.',
 'The firm hasP15,Q50 andATC18, so it loses(18−15)×50=150. Persistent losses encourage exit. With demand unchanged, reduced market supply raises the market price and survivors’MR.',
 'MarketP15;firmQ50,ATC18.','Connect economic loss to exit and its market-price effect.','(18-15)*50=150')
p('P62F-PC-EL-040','As exit raises market price with the surviving firm’s costs fixed, which initial quantity and output response are supported by the graph?',
 '50 units; the higher horizontal MR line selects more output on rising MC.',
 '40 units; the higher horizontal MR line selects more output on rising MC.',
 '50 units; the price increase shifts MC rather than changing the chosen point on it.',
 '40 units; the price increase shifts MC rather than changing the chosen point on it.',
 'The initial firm output is50 atP15. A higher price raisesMR=P and moves its intersection rightward on the unchanged risingMC curve. The firm expands output; its cost schedule does not shift.',
 'FirmQ50 atP15onrisingMC.','Trace exit’s price effect into the surviving firm’s marginal output choice.')
for i,entry in [('P62F-PC-L-069',True),('P62F-PC-H-018',True),('P62F-PC-H-019',False),('P62F-PC-L-070',False)]:
 why='entry expands supply and lowers price until positive economic profit disappears' if entry else 'exit reduces supply and raises price until economic losses disappear'
 wrong='entry stops only when the market price is zero' if entry else 'exit stops only when all firms have shut down'
 p(i,'Which approximate final price P2 and explanation of the long-run adjustment are correct?',
 f'$25; {why}.',f'$30; {why}.',f'$25; {wrong}.',f'$30; {wrong}.',
 'The dashed final firm priceP2 is near25 at theATC minimum. '+('InitiallyP1 is aboveATC at the firm’s optimum, attracting entry. ' if entry else 'InitiallyP1 is belowATC at the firm’s optimum, prompting exit. ')+why.capitalize()+'. Zero economic profit covers normal return.',
 'FinaldashedP2≈25 atminimumATC;'+('initialprofit.' if entry else 'initialloss.'),'Explain the entry or exit stopping condition using total economic cost coverage.')
p('P62F-PC-M-047','At the long-run position shown, what are the firm’s total revenue and economic profit?',
 'Revenue$1,250 and economic profit$0; price equals ATC.',
 'Revenue$1,000 and economic profit$0; price equals ATC.',
 'Revenue$1,250 and economic profit$1,250; revenue itself is the net return above economic cost.',
 'Revenue$1,000 and economic profit$1,000; revenue itself is the net return above economic cost.',
 'AtQ50,P=ATC25, so revenue and economic cost both equal1250. Their difference, not revenue alone, is economic profit: zero.',
 'FirmQ50,P=ATC25.','Distinguish total receipts from profit at long-run break-even.','50*25=1250;(25-25)*50=0')
p('P62F-PC-H-046','Which price and marginal equality at the chosen output establish allocative efficiency in the graph?',
 '$25; price equals MC, matching marginal willingness to pay with marginal cost.',
 '$20; price equals MC, matching marginal willingness to pay with marginal cost.',
 '$25; price equaling ATC is by itself the allocative-efficiency test.',
 '$20; price equaling ATC is by itself the allocative-efficiency test.',
 'The market and firm share price25, and the firm’sMC is25 atQ50. In the competitive benchmark, price reflects marginal willingness to pay. P=MC is the allocative test;P=ATC instead establishes zero profit.',
 'Price25;MC25atQ50.','Distinguish allocative marginal equality from break-even.')
p('P62F-PC-H-047','At what firm output does the graph show productive efficiency, and which cost comparison establishes it?',
 '50 units; the firm produces at minimum ATC.',
 '60 units; the firm produces at minimum ATC.',
 '50 units; any price–MC equality proves minimum ATC even without examining the average-cost curve.',
 '60 units; any price–MC equality proves minimum ATC even without examining the average-cost curve.',
 'The selectedQ50 is also theATC minimum. This establishes lowest average cost, or productive efficiency. Marginal equality alone need not place a short-run firm at minimumATC.',
 'FirmselectedQ50atATCminimum.','Identify productive efficiency by minimum average total cost.')
for i in ['P62F-PC-EL-044','P62F-PC-B3-058','P62F-PC-M-048']:
 p(i,'Which firm price and output and interpretation characterize the two-panel long-run benchmark?',
 'P=$25,Q=50; P=MC=minimum ATC gives zero economic profit and no net entry or exit pressure.',
 'P=$20,Q=40; P=MC=minimum ATC gives zero economic profit and no net entry or exit pressure.',
 'P=$25,Q=50; P=AVC alone establishes long-run break-even and removes all entry or exit pressure.',
 'P=$20,Q=40; P=AVC alone establishes long-run break-even and removes all entry or exit pressure.',
 'The market supplies price25 to the firm. Its risingMC crosses atQ50, also theATC minimum. P=MC gives marginal efficiency;P=minATC gives productive efficiency and zero economic profit. CoveringAVC alone is only a short-run operating criterion.',
 'MarketP25;firmQ50,P=MC=minATC25.','Combine market price-taking, marginal choice, cost recovery and the long-run entry condition.')
p('P62F-PC-L-074','At Q1 in the graph, which approximate common price/cost and efficiency interpretation are correct?',
 '$24; P=MC establishes allocative efficiency and P=minimum ATC establishes productive efficiency.',
 '$30; P=MC establishes allocative efficiency and P=minimum ATC establishes productive efficiency.',
 '$24; P=MC establishes productive efficiency and P=minimum ATC is the definition of allocative efficiency.',
 '$30; P=MC establishes productive efficiency and P=minimum ATC is the definition of allocative efficiency.',
 'AtQ1 the horizontal price near24 meetsMC and theATC minimum. The first equality matches marginal value and cost; the second achieves the lowest average cost. These are distinct efficiency concepts.',
 'Price≈24atQ1,whereMCandminimumATCmeet.','Distinguish the two efficiency conditions at a competitive benchmark.')
p('P62F-PC-L-075','Demand rises from D1 to D2 in the increasing-cost industry shown. Which approximate new long-run price and explanation of its relation to the original price are correct?',
 '$50; expansion raises firms’ costs, so entry does not restore the original lower break-even price.',
 '$55; expansion raises firms’ costs, so entry does not restore the original lower break-even price.',
 '$50; entry must restore the original price regardless of how expansion changes input costs.',
 '$55; entry must restore the original price regardless of how expansion changes input costs.',
 'D2 meetsLRS near50, above the original intersection near46. In an increasing-cost industry, entry lowers price from its initial short-run peak but higher input costs leave the new long-run price above the original. The figure shows long-run intersections, not the size of the short-run peak.',
 'D1–LRS P≈46,D2–LRS P≈50.','Distinguish increasing-cost long-run adjustment from restoration of the original price.')
for i,price,alt,reason,bad in [
 ('P62F-PC-L-071',30,25,'industry expansion leaves firms’ minimum long-run average cost unchanged','a horizontal industry supply means each individual firm’s MC must be horizontal'),
 ('P62F-PC-L-073',38,44,'external economies can lower firms’ costs as the industry expands','falling long-run price must be caused by rising input costs'),
 ('P62F-PC-L-072',42,48,'industry expansion raises input or other firm costs and the break-even price','rising long-run price must reflect lower minimum firm costs')]:
 p(i,'At industry quantity80, which approximate long-run price and cost interpretation are supported by the graph?',
 f'${price}; {reason}.',f'${alt}; {reason}.',f'${price}; {bad}.',f'${alt}; {bad}.',
 f'AtQ80,LRS gives price near{price}. Its '+('horizontal' if i.endswith('071') else 'downward' if i.endswith('073') else 'upward')+f' slope means that {reason}. Industry supply does not automatically describe one firm’sMC.',
 f'LRSatQ80≈{price}.','Relate the long-run industry supply pattern to changing firm costs.')
p('P62F-PC-M-046','At the representative firm’s chosen output, which price–AVC margin and operating interpretation are correct?',
 '$5 per unit; production covers variable cost and contributes toward fixed cost.',
 '$3 per unit; production covers variable cost and contributes toward fixed cost.',
 '$5 per unit; covering variable cost necessarily establishes positive economic profit.',
 '$3 per unit; covering variable cost necessarily establishes positive economic profit.',
 'The market givesP15 and the firm choosesQ50 withAVC10 andATC18. The5 margin overAVC contributes toward fixed cost, thoughP belowATC means an economic loss.',
 'P15,AVC10,ATC18atQ50.','Distinguish the contribution supporting operation from economic profit.','15-10=5')
for i in ['P62F-PC-L-099','P62F-PC-B3-057']:
 p(i,'Which current operating loss and short-run/long-run sequence follow from the paired panels?',
 '$150; operate because P>AVC, while persistent losses lead to exit and higher market price.',
 '$100; operate because P>AVC, while persistent losses lead to exit and higher market price.',
 '$150; shut down immediately because P<ATC, even though producing covers avoidable cost.',
 '$100; shut down immediately because P<ATC, even though producing covers avoidable cost.',
 'The market setsP15; risingMC givesQ50. AVC10<P15<ATC18, so the operating loss is150 and shutdown would sacrifice a contribution to fixed cost. Persistent losses induce exit and raise price as market supply contracts.',
 'P15,Q50,AVC10,ATC18.','Trace market price through output, operating loss and long-run exit.','(18-15)*50=150')
p('P62F-PC-L-065','All firms start identical, current fixed costs are unavoidable, and survivors’ costs remain unchanged as firms exit. Which plotted price range and adjustment correctly distinguish current operation from eventual equilibrium?',
 'Between$20 and$25; operate now because price covers AVC, then exit raises survivors’ MR and output until losses disappear.',
 'Between$25 and$30; operate now because price covers AVC, then exit raises survivors’ MR and output until losses disappear.',
 'Between$20 and$25; covering AVC now eliminates any long-run incentive to exit despite persistent losses.',
 'Between$25 and$30; covering AVC now eliminates any long-run incentive to exit despite persistent losses.',
 'Price is near21 atQ1, aboveAVC but belowATC. Current operation covers some fixed cost. Later exit reduces market supply, raising price and each survivor’s horizontalMR; with fixed costs curves, output rises alongMC until total costs are covered.',
 'Price≈21,AVCbelowP,ATCaboveP atQ1.','Preserve the full distinction between loss-minimizing operation and exit-driven recovery.')
p('P62F-PC-B3-055','Starting with the market panel, which firm output and analysis correctly determine the representative firm’s current outcome?',
 '90 units; take market price as MR, use rising MC=MR, then compare price with ATC.',
 '75 units; take market price as MR, use rising MC=MR, then compare price with ATC.',
 '90 units; take market quantity as firm output and compare price with MC to measure total profit.',
 '75 units; take market quantity as firm output and compare price with MC to measure total profit.',
 'Market price is40. In the firm panel this horizontalMR meets risingMC at90. ATC is20 there, so the subsequent profit comparison uses price minusATC, not the market quantity or theMC gap.',
 'MarketP40;firmMCintersectionQ90,ATC20.','Apply market-to-firm transmission before the output and profit comparisons.')
p('P62F-PC-H-015','Suppose the plotted outcome followed higher buyer demand from an initial zero-profit equilibrium, before entry and with firm costs unchanged. Which displayed price range and transmission explain the firm’s outcome?',
 'Between$40 and$50; higher market price raises the firm’s horizontal MR, expands output along MC and creates short-run profit.',
 'Between$30 and$40; higher market price raises the firm’s horizontal MR, expands output along MC and creates short-run profit.',
 'Between$40 and$50; higher buyer demand shifts the individual firm’s MC upward while leaving its MR fixed.',
 'Between$30 and$40; higher buyer demand shifts the individual firm’s MC upward while leaving its MR fixed.',
 'The market price near45 appears as the firm’s horizontal revenue line aboveATC at its risingMC crossing. Relative to initial zero profit, the higher price raisesMR and chosen output without shifting costs, allowing short-run profit before entry.',
 'P1≈45;firmP>ATCatMCintersection.','Trace a market-demand shock through a price-taking firm’s revenue and output.')
p('P62F-PC-EL-042','Which market and firm quantities are plotted, and why is dividing them insufficient to establish an exact firm count?',
 '75 thousand and50; an exact count also requires compatible units and evidence that firms have identical output.',
 '100 thousand and40; an exact count also requires compatible units and evidence that firms have identical output.',
 '75 thousand and50; a representative-firm drawing by itself proves every firm has that identical output.',
 '100 thousand and40; a representative-firm drawing by itself proves every firm has that identical output.',
 'The market panel shows75 on a thousands axis and the firm panel shows50. Although price links the panels, an exact firm count requires knowing that the firm quantity uses compatible units and that every active firm produces that amount. The drawing alone does not supply those assumptions.',
 'Market75thousand;representativefirm50.','Recognize limits of aggregation inference from representative-firm diagrams.')
save();print('Graph proposals prepared:',len(R));print('Remaining:',sorted(set(G)-set(R)))
