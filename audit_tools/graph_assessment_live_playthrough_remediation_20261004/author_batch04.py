from review_tools import *
d=load()
for g in range(38,51):review(d,g,'Read all current stems/options/feedback. Reviewed plotted demand/supply points, labor units, shifted equilibria, minimum-wage gaps and monopsony rules. Preserve competing explanations but ask directly; assign tiers to economic steps.')
visual(d,range(37,51),'Viewed actual graphs at contact-sheet student-like scale. Demand coordinates and labor axes/intersections are clear. ELAS-02 has crowded 30/35 and 90/95 ticks: separate required ticks from regular grid ticks. TP standard requires point-value labels for subtraction.')
d['assets'][INDEX[39]['asset']]['repairRequired']=True
d['assets'][INDEX[39]['asset']]['issue']='Closely spaced regular ticks crowd required 35/45/55/95 values. Use only economically relevant guides plus sparse main ticks; inspect all 13 shared users.'
for id in ['P62B-ELAS-B1-019','P62B-ELAS-EL-033']:
    patch(d,id,'At B, what is total revenue? Would a small price increase or decrease raise revenue, and how does elasticity explain the result?',tier='medium',options=[
    '$480; either change lowers revenue because demand is unit elastic at B.',
    '$360; either change lowers revenue because demand is unit elastic at B.',
    '$480; a small price increase raises revenue because demand is inelastic at B.',
    '$360; a small price decrease raises revenue because demand is elastic at B.'],
    feedback='B has price $8 and quantity 60, so total revenue is $480. At the midpoint of this linear demand curve, demand is unit elastic and revenue is at its maximum. Moving a small distance in either direction lowers revenue.')
patch(d,'P62B-ELAS-B2-019','Calculate total revenue at C, B and A. Why does a price cut raise revenue on one part of this demand curve but lower it on another?',tier='hard')
for id in ['P62B-ELAS-H-016','P62B-ELAS-H-034']:
    patch(d,id,'Using point elasticity, what are the elasticities at C and A? Why do they differ even though the demand curve has a constant slope?',
    feedback='The intercepts show that quantity rises by 120/16 = 7.5 units for each $1 price decrease. Point elasticity is 7.5 times price divided by quantity: at C, 7.5 × 12/30 = 3; at A, 7.5 × 4/90 = 1/3. The same changes in dollars and units represent different percentage changes at different starting prices and quantities.')
patch(d,'P62B-ELAS-L-093','A seller can supply at most 70 units. Compare charging the prices at B and A. At each price, sales equal the smaller of quantity demanded and capacity. Which choice correctly calculates revenue and identifies where capacity limits sales?',tier='hard',options=[
'B earns $560 and A earns $360; neither price leaves unused capacity.',
'B earns $480 and A earns $360; only A is limited by capacity.',
'B earns $560 and A earns $280; both prices are limited by capacity.',
'B earns $480 and A earns $280; only A is limited by capacity.'],reason='Removed irrelevant C setup. Retained demand, actual sales, capacity and revenue comparison; classify Hard for linked calculations and the binding-constraint distinction rather than an unsupported Legendary label.')
patch(d,'P62B-ELAS-E-029','Which points show elastic, unit-elastic and inelastic demand, in that order?',tier='medium',options=[
'C, B and A.','B, C and A.','A, B and C.','C, A and B.'],
feedback='C is on the upper half of the linear demand curve, where demand is elastic. B is its midpoint, where demand is unit elastic. A is on the lower half, where demand is inelastic. The point locations are needed to apply these classifications.')
patch(d,'P62B-ELAS-M-008','At which labeled point would a small price cut raise total revenue, and at which would it lower total revenue?',options=[
'Raise revenue at B; lower it at C.','Raise revenue at C; lower it at A.','Raise revenue at A; lower it at C.','Raise revenue at C; lower it at B.'],feedback='C is in the elastic portion of the curve: a small price cut increases quantity by a larger percentage and raises revenue. A is in the inelastic portion, so a small price cut lowers revenue. At B revenue is already maximized.')
patch(d,'P62B-ELAS-M-028','How much does quantity demanded rise for each $1 price decrease? Does this constant change in units mean that elasticity is constant?')
patch(d,'P62B-ELAS-E-028',tier='medium')
patch(d,'P62B-ELAS-L-095','For the marked price decrease, calculate total revenue before and after on D1 and D2. Which product could plausibly have more close substitutes, given the difference in responsiveness?',tier='hard')
for id in INDEX[41]['ids']:patch(d,id,'For the price increase shown, how much does quantity supplied rise in the short run and in the long run? Why might the long-run response be larger?')
edits={
'42322':('A wage floor holds pay at $30. If it is removed while both curves stay fixed, what wage will the market reach? How will hiring and the number willing to work adjust?','medium'),
'42324':('What wage and employment does this market reach, and does that employment figure describe one firm or the whole market?','medium'),
'42325':('A proposal requires employment of 6,000 workers, with productivity and workers\u2019 opportunity costs unchanged. At that employment level, compare the value of a worker\u2019s output with the opportunity cost of working. Do these marginal hires increase total surplus?',None),
'42329':(None,'hard'),
'42331':('A manager says the change shown was caused by more workers becoming available at each wage. What is the new equilibrium, and does the graph support that explanation?',None),
'42334':('At the old wage, how much labor do firms demand on each curve? A separate proposal raises marginal product by 25% while the competitive output price falls 10%. Would this raise or lower the value of marginal product, and does that direction agree with the plotted shift?',None),
'42337':(None,'medium'),
'42338':('How much does equilibrium employment rise after the demand shift? Why is this less than the increase in labor demanded at the original wage?',None),
'42341':(None,'hard'),
'42343':('The graph shows a fall in labor demand. What is the new equilibrium employment? Could a 20% fall in every worker\u2019s marginal product, combined with a 25% rise in the competitive output price, explain this shift?',None),
'42344':('After the demand shift, the wage initially remains $20. How large is the labor shortage or surplus, and which way will it push wages?','medium'),
'42346':('At $15 per hour, how many workers do firms want to hire on each demand curve? Why is this a shift in demand rather than movement along a curve?','medium'),
'42349':('After the supply shift, what are the new wage and employment? Does the adjustment shift labor demand or move the market along it?','medium'),
'42350':('A licensing reform lets more trained healthcare workers enter the occupation. At $20, how many workers are available before and after the change? Does this show a supply shift or movement along a curve?',None),
'42352':('After the supply shift, the wage initially remains $20. How large is the labor surplus, and which way will it push wages?','medium'),
'42353':('Expanded nursing programs cause the supply shift shown. Hospitals then face an increase in demand for care of unknown size. What wage results from the first shift? After both shifts, what can be concluded about wage and employment relative to the original equilibrium?','hard'),
'42355':('What are equilibrium employment before and after the supply shift? Does this adjustment shift labor demand or move the market along it?','medium'),
'42357':('After the supply shift, what are the new wage and employment? Does the adjustment shift labor demand or move the market along it?',None),
'42358':('Many construction workers leave the region. At $20, how many workers are available on each supply curve? Does this represent a supply shift or movement along a curve?','medium'),
'42360':('After the supply shift, the wage initially remains $20. How large is the shortage of labor, and which way will it push wages?','medium'),
'42361':('Better jobs in another industry draw workers away from construction. At a construction wage of $20, how many workers are available before and after this change? What does that comparison tell us?','medium'),
'42363':('A student says the two supply curves show only the effect of a change in wages. Compare labor supplied on the two curves at $20. Does that comparison support the claim?',None),
'42364':(None,'medium'),
'42365':('A report calls every excess job seeker at the minimum wage a lost job. Calculate the decline in employment and the surplus of workers. Why are those numbers different?','hard'),
'42371':('How far is the legal minimum below the market-clearing wage? Does this minimum wage create a surplus of workers?',None),
'42373':('Compare the legal minimum with the market-clearing wage. How large is the gap, and will this policy create a labor surplus?','medium'),
'42375':('How many nurses will the monopsonist hire, and which marginal comparison determines that choice?','medium'),
'42376':(None,'medium'),
'42377':('How many more nurses would be hired under competition than under monopsony? Why would those additional hires create gains from trade?','hard'),
'42378':(None,'hard'),
'42381':('After both labor demand and supply increase, what is the wage shown? Must simultaneous increases always have this effect on wages?',None),
'42383':('Read the wage after both shifts. Does this example establish that simultaneous increases in labor demand and supply always leave wages unchanged?',None)}
for id,(stem,tier) in edits.items():patch(d,id,stem,tier)
save(d)
