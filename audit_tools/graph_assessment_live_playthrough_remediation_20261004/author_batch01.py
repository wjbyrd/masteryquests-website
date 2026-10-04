from review_tools import *
d=load()
for g in range(1,10):review(d,g,'Reviewed stem, all alternatives and feedback: graph supplies surplus areas or marginal values; two alternatives survive conceptual elimination. Recalibrate higher tiers where the task is standard calculation plus explanation.')
visual(d,range(1,10),'Viewed 700px contact-sheet rendering. Intercepts, equilibrium, price and quantity guides are separated and readable; linear curves support surplus areas. Compact quota question needs an additional Q=4 guide for arithmetic.')
d['assets'][INDEX[5]['asset']]['repairRequired']=True
d['assets'][INDEX[5]['asset']]['issue']='Quota task requires D(4)=16 and S(4)=12; add guides and values without obscuring E. Inspect all 11 users first.'
edits={
'40032':('A student says the minimum wage shown will create a surplus of workers. What wage and employment will actually result? How would the outcome differ if the same legal wage were a maximum rather than a minimum?','hard'),
'P62C-CPS-LB-014':('Price falls from P1 to P2. How much does consumer surplus increase, and how much of that gain comes from units consumers were already buying?','hard'),
'P62C-CPS-B2-007':('A student treats spending at E as consumer surplus. What is consumer surplus at E, and what does the price-times-quantity rectangle measure?',None),
'P62C-CPS-B2-009':('A report adds sales revenue to consumer and producer surplus at E. What is total surplus, and should sales revenue be added?',None),
'P62C-CPS-L-024':('A student says an allocation is efficient only when buyers and sellers receive equal surplus. At what quantity does this market maximize total surplus, and is the student correct?',None),
'P62C-CPS-LB-010':('Calculate consumer and producer surplus at E. Does the difference between them show that the market is inefficient?','hard'),
'P62C-CPS-H-005':('How much consumer surplus is earned at E, and which area of the graph represents it?','medium'),
'P62C-CPS-L-020':('A student says equal consumer and producer surplus is necessary for efficiency. What quantity is efficient in this market, and what economic condition makes it efficient?',None),
'P62C-CPS-M-029':('What quantity maximizes total surplus in this competitive market, and why?',None),
'P62C-CPS-H-007':(None,'medium'),
'P62C-CPS-L-028':('A student says equal consumer and producer surplus is necessary for efficiency. What quantity is efficient in this market, and what economic condition makes it efficient?',None),
'P62C-CPS-LB-011':('Calculate consumer and producer surplus at E. Do their equal values show that every efficient market must divide its gains equally?','hard'),
'P62C-CPS-EL-017':('A seller claims that revenue at E is the same as producer surplus. Calculate both amounts and evaluate the claim.','medium'),
'P62C-CPS-LB-016':('A report adds seller revenue to consumer surplus at E to measure gains from trade. What are consumer, producer and total surplus, and should revenue be added?','hard'),
'P62C-CPS-L-031':('Output is held at the vertical line through A and B. Compare the value and cost of the last unit. Would reducing output toward E increase total surplus?',None),
'P62C-CPS-LB-013':(None,'hard'),
'P62C-CPS-LB-015':('Price rises from P1 to P2. How much does producer surplus increase, and how much of that gain comes from units sellers were already supplying?','hard'),
'P62C-CPS-L-029':('Output is held at the vertical line through A and B. Compare the value and cost of the last unit. Would expanding output toward E create additional gains from trade?',None),
'P62C-CPS-L-030':('Removing the quantity restriction shown restores equilibrium at E. It also transfers $9 from producers to consumers on units already traded. Assuming efficient allocation and no other effects, how much does total surplus change? How should the $9 transfer be counted?','hard'),
'P62C-CPS-LB-012':(None,'hard')}
for id,(stem,tier) in edits.items():patch(d,id,stem,tier)
# Remove an internally contradictory distractor while retaining two graph-dependent numerical candidates.
patch(d,'P62C-CPS-EL-017',options=[
'Revenue is $72 and producer surplus is $0; receipts cover the marginal cost of every unit.',
'Revenue is $60 and producer surplus is $0; receipts cover the marginal cost of every unit.',
'Revenue is $72 and producer surplus is $72; no part of revenue pays for variable costs.',
'Revenue is $60 and producer surplus is $60; no part of revenue pays for variable costs.'])
save(d)
