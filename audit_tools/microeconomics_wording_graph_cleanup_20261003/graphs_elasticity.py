from common import *
p=paired
for i in ['P62B-ELAS-E-029','P62B-ELAS-M-008','P62B-ELAS-H-016','P62B-ELAS-H-034']:
 p(i,'Refer to the linear demand curve. Which point elasticities in absolute value at C and A, and explanation of their difference, are correct?',
 '3 at C and 1/3 at A; the price-to-quantity ratio changes even though slope is constant.',
 '2 at C and 1/2 at A; the price-to-quantity ratio changes even though slope is constant.',
 '3 at C and 1/3 at A; a constant slope means equal percentage responsiveness at both points.',
 '2 at C and 1/2 at A; a constant slope means equal percentage responsiveness at both points.',
 'The intercepts are P=16 and Q=120, so |dQ/dP|=7.5. At C, P=12 and Q=30 give 7.5×12/30=3; at A, P=4 and Q=90 give 7.5×4/90=1/3. Elasticity falls through one at B because percentage bases change, not because the straight line changes slope.',
 'Intercepts P=16,Q=120; C=(30,12), A=(90,4).','Distinguish constant slope from varying percentage responsiveness.','(120/16)*(12/30)=3;(120/16)*(4/90)=1/3')
p('P62B-ELAS-M-028','Refer to the demand curve. Which change in quantity per $1 price decrease and interpretation of elasticity are correct?',
 '7.5 units; the constant unit response does not imply constant percentage responsiveness.',
 '5 units; the constant unit response does not imply constant percentage responsiveness.',
 '7.5 units; the constant unit response implies constant percentage responsiveness.',
 '5 units; the constant unit response implies constant percentage responsiveness.',
 'The line connects P=16,Q=0 to P=0,Q=120, giving 120/16=7.5 additional units per $1 decrease. Elasticity also uses P/Q, which varies along the line. Constant slope is not constant elasticity.',
 'Price intercept 16 and quantity intercept 120.','Separate slope measured in units from elasticity measured in percentages.','120/16=7.5')
p('P62B-ELAS-E-028','For the marked price decrease on D1 and D2, which midpoint elasticities in absolute value and interpretation are correct?',
 'About 1.43 for D1 and 0.89 for D2; elasticity uses percentage changes, not just slopes in axis units.',
 'About 1.20 for D1 and 0.75 for D2; elasticity uses percentage changes, not just slopes in axis units.',
 'About 1.43 for D1 and 0.89 for D2; a curve’s slope in axis units is its elasticity at every point.',
 'About 1.20 for D1 and 0.75 for D2; a curve’s slope in axis units is its elasticity at every point.',
 'Price falls 10 to 6. D1 quantity rises 45 to 95: (50/70)/(4/8)=1.43. D2 quantity rises 35 to 55: (20/45)/(4/8)=0.89. These use percentage bases; visual steepness or a unit slope alone is not an elasticity.',
 'P=10→6; D1 Q=45→95 and D2 Q=35→55.','Measure percentage responsiveness to explain why slope alone is insufficient.','(50/70)/(4/8)=10/7;(20/45)/(4/8)=8/9')
for i in ['P62B-ELAS-EL-033','P62B-ELAS-B1-019']:
 p(i,'Refer to the graph. Which total revenue at B and interpretation of a small movement in either direction along demand are correct?',
 '$480; revenue is maximized there because demand is unit elastic.',
 '$360; revenue is maximized there because demand is unit elastic.',
 '$480; revenue is maximized there because demand is perfectly inelastic.',
 '$360; revenue is maximized there because demand is perfectly inelastic.',
 'B has P=8 and Q=60, so revenue is $480. It is the midpoint of the linear demand curve, with unit elasticity. Revenue decreases for a small movement to either side, though its first-order change is zero at the maximum.',
 'B=(60,8), midpoint of the demand line.','Link the revenue maximum to unit elasticity, not zero responsiveness.','8*60=480')
p('P62B-ELAS-B2-019','Refer to the graph. As price falls from C through B to A, which total-revenue sequence and economic explanation are correct?',
 '$360, $480, $360; price cuts raise revenue above the midpoint and lower it below the midpoint.',
 '$300, $400, $300; price cuts raise revenue above the midpoint and lower it below the midpoint.',
 '$360, $480, $360; price cuts raise revenue when demand is inelastic and lower it when elastic.',
 '$300, $400, $300; price cuts raise revenue when demand is inelastic and lower it when elastic.',
 'C=(30,12), B=(60,8) and A=(90,4), giving revenues 360,480,360. Above the midpoint demand is elastic, so quantity gains outweigh price cuts. Below it demand is inelastic, so the price loss dominates.',
 'C=(30,12),B=(60,8),A=(90,4).','Apply the total-revenue test across elastic and inelastic regions.','30*12=360;60*8=480;90*4=360')
p('P62B-ELAS-M-037','Refer to D2. Between the two labeled points, what quantity is demanded, and what does the response imply about price elasticity?',
 '50 units at both prices; demand is perfectly inelastic.',
 '40 units at both prices; demand is perfectly inelastic.',
 '50 units at both prices; demand is perfectly elastic.',
 '40 units at both prices; demand is perfectly elastic.',
 'D2 is vertical at Q=50. Price rises from 5 to 7 without a quantity change, so the percentage quantity response and demand elasticity are zero.',
 'D2 at Q=50 through prices 5 and 7.','Interpret unchanged quantity as zero elasticity.')
for i in ['P62B-ELAS-M-039','P62B-ELAS-EL-038','P62B-ELAS-B2-020']:
 p(i,'Refer to the common starting point and the higher marked price on the two supply curves. Which short-run and long-run quantity increases, and elasticity interpretation, are supported?',
 '10 and 40 units; the larger long-run response reflects more time to adjust inputs and capacity.',
 '20 and 60 units; the larger long-run response reflects more time to adjust inputs and capacity.',
 '10 and 40 units; the larger long-run response implies less percentage responsiveness over time.',
 '20 and 60 units; the larger long-run response implies less percentage responsiveness over time.',
 'Both curves start at Q=60,P=4. At P=8, short-run A has Q=70 and long-run B has Q=100. The increases are 10 and 40. With the same starting point and price change, more adjustment time yields the larger quantity response and greater supply elasticity.',
 'Start=(60,4), A=(70,8), B=(100,8).','Relate the time available for adjustment to supply elasticity.','70-60=10;100-60=40')
p('P62B-ELAS-L-093','A seller initially charges the price at C. Capacity is 70 units, and sales equal the smaller of demand and capacity. Using the graph, which alternative price earns more revenue, and why does the capacity constraint matter?',
 'B earns $480 versus $280 at A; using all quantity demanded at A would overstate actual sales.',
 'B earns $400 versus $210 at A; using all quantity demanded at A would overstate actual sales.',
 'B earns $480 versus $280 at A; demand elasticity guarantees all units demanded can be sold despite capacity.',
 'B earns $400 versus $210 at A; demand elasticity guarantees all units demanded can be sold despite capacity.',
 'B has P=8,Qd=60: sales are 60 and revenue $480. A has P=4,Qd=90: only 70 can be sold, earning $280. Capacity leaves B unconstrained but limits A. Demand elasticity describes desired purchases, not a seller’s capacity.',
 'B=(60,8),A=(90,4),C=(30,12).','Evaluate revenue under a capacity constraint instead of applying the demand revenue test mechanically.','8*min(60,70)=480;4*min(90,70)=280')
p('P62B-ELAS-L-095','The graph shows otherwise comparable products D1 and D2 over the marked price decrease. Which revenue changes and explanation using substitute availability are consistent with midpoint elasticity?',
 'D1: $450→$570; D2: $350→$330. More close substitutes is a plausible explanation for D1’s greater responsiveness.',
 'D1: $400→$520; D2: $300→$280. More close substitutes is a plausible explanation for D1’s greater responsiveness.',
 'D1: $450→$570; D2: $350→$330. More close substitutes is a plausible explanation for D2’s lower responsiveness.',
 'D1: $400→$520; D2: $300→$280. More close substitutes is a plausible explanation for D2’s lower responsiveness.',
 'On D1, revenue goes from 10×45=$450 to 6×95=$570, and midpoint elasticity is 1.43. On D2 it goes from 10×35=$350 to 6×55=$330, with elasticity 0.89. More close substitutes can explain greater responsiveness on D1, although the graph alone cannot establish the cause.',
 'P=10→6; D1 Q=45→95, D2 Q=35→55.','Combine the total-revenue test with a qualified explanation of elasticity using substitutes.','10*45=450;6*95=570;10*35=350;6*55=330')
save();print('Graph proposals prepared:',len(R))
