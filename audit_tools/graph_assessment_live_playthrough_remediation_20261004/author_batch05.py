from review_tools import *
d=load()
patch(d,'P62E-COP-L-046',correct_index=2)
for g in range(51,67):review(d,g,'Reviewed current text/options/feedback. Preserve cumulative versus group shares, relative versus absolute income, trade welfare distribution, and externality/incentive comparisons. Numerical evidence must be visible; remove compressed compound questions.')
visual(d,range(51,67),'Inspected rendered graphs. Trade price/quantity guides and externality intersections/gaps are readable. Lorenz 01/02 need selected cumulative share labels for arithmetic; avoid distinguishing unlabeled near values by pixel estimates.')
for g in [51,52]:
    d['assets'][INDEX[g]['asset']]['repairRequired']=True
    d['assets'][INDEX[g]['asset']]['issue']='Label cumulative shares at quintile points, including 5/55 in LORENZ-01 and 40 in LORENZ-02, rather than require close estimates. Inspect all 14 shared users of each.'
edits={
'42722':(None,'medium'),
'42724':(None,'medium'),
'42725':('For the bottom 40% of households, express average income as a percentage of the economy-wide average. Why must the group\u2019s income share be adjusted for its population share?',None),
'42729':('The graph shows the initial distribution of $100 million of income. Later, total income is $120 million: the bottom quintile receives 4% and the top quintile 40%. How much did each group receive initially? Does each group\u2019s dollar income rise or fall?', 'elite'),
'42753':('At the marked population share, how far below the equality line is the Lorenz curve? Is that vertical gap the Gini coefficient?','medium'),
'42731':('Total income is $100 million in economy A and $400 million in B. How much does the bottom 40% receive in each? Does the economy giving this group the larger share also give it more dollars?',None),
'42734':('In economy B, the income outside the bottom 80% belongs to which group? What is that group\u2019s average income relative to the economy-wide average?',None),
'42737':('An analyst says the middle quintile in economy A earns twice the overall average income. Calculate this quintile\u2019s income share and its average income relative to the overall average. Is the claim correct?',None),
'42739':('Which economy has the lower Gini coefficient, and how does the position of its Lorenz curve show this?','medium'),
'42740':('Read the before-and-after Gini coefficients. What do they show about relative inequality, and what can they tell us about average income or poverty?','medium'),
'42741':('Average real income falls from $20,000 to $18,000 while the Gini changes as shown. Calculate both changes. Does the lower Gini prove that every group has a higher standard of living?','hard'),
'42743':('Calculate the change in the Gini coefficient shown. Could cutting every household\u2019s income by the same 10% produce this change? Explain.',None),
'42747':('Read the bottom 40%\u2019s income share before and after the policy. Does this change prove that every low-income household receives more real income?',None),
'42761':('Read the two Gini coefficients. Explain how their change follows from the movement of the Lorenz curve.','medium'),
'P62D-ITP-B1-019':('At the world price shown, how much does the country import? Explain using domestic production and purchases.','medium'),
'P62D-ITP-B1-020':('At the world price shown, how much does the country export? Explain using domestic production and purchases.','medium'),
'P62D-ITP-H-003':(None,'medium'),
'42028':('What tax per garment would correct the externality shown? Explain how it changes the producer\u2019s incentive.',None),
'42038':('What tax per vape would correct the externality shown? Explain how it changes the consumer\u2019s incentive.',None),
'42047':('The council sets a maximum of 150 gardens but offers no subsidy or purchase commitment. How many gardens will the private market provide, and why does the cap have that effect?',None),
'42048':('What subsidy per garden would correct the externality shown? Explain how it changes the producer\u2019s incentive.',None),
'42058':('What subsidy per transit ride would correct the externality shown? Explain how it changes the rider\u2019s incentive.',None),
'42065':('What quantity of garments is socially efficient? Which marginal benefit and cost must be equal?','medium'),
'42066':('Sellers remit the corrective tax shown. Compared with the unregulated equilibrium, how much more do buyers pay and how much less do sellers receive? Does legal remittance determine who bears the burden?','hard'),
'42067':('What tax per garment would align private incentives with social costs in this market?',None),
'42068':('A regulator says any tax that reduces sales will fully correct the externality. What tax per garment is appropriate here, and why is reducing quantity alone insufficient?',None),
'42074':('What quantity of vapes is socially efficient? Which marginal benefit and cost must be equal?','medium'),
'42075':('At the socially efficient quantity, what price do buyers pay and what amount do sellers keep? What does the difference measure?',None),
'42076':('What tax per vape would align private incentives with social costs in this market?',None),
'42077':('A regulator says any tax that reduces sales will fully correct the externality. What tax per vape is appropriate here, and why is reducing quantity alone insufficient?',None)}
for id,(stem,tier) in edits.items():patch(d,id,stem,tier)
for g in range(57,61):
    id=INDEX[g]['ids'][0];country='Faron' if g<59 else 'Lydon'
    patch(d,id,f'{country} opens to trade at the world price shown. Calculate the trade quantity and the changes in consumer, producer and total surplus. Can the country gain overall while one domestic group loses?',tier='elite',reason='Preserved the full trade/welfare synthesis and distribution distinction. Four linked calculations justify Elite; no interacting constraint or transfer beyond the standard model supports Legendary.')
save(d)
