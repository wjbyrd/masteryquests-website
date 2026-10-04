from common import *
p=paired
for i,imports,qd,qs in [('P62D-ITP-B1-019',True,225,125),('P62D-ITP-B1-020',False,100,250)]:
 trade='Imports' if imports else 'Exports';opposite='exports' if imports else 'imports';qty=abs(qd-qs);other=qty-50
 p(i,'At the world price shown, which trade quantity and economic interpretation follow from domestic demand and supply?',
 f'{trade} of {qty} thousand units; '+('domestic purchases exceed domestic production.' if imports else 'domestic production exceeds domestic purchases.'),
 f'{trade} of {other} thousand units; '+('domestic purchases exceed domestic production.' if imports else 'domestic production exceeds domestic purchases.'),
 f'{trade} of {qty} thousand units; '+('domestic production exceeds domestic purchases.' if imports else 'domestic purchases exceed domestic production.'),
 f'{trade} of {other} thousand units; '+('domestic production exceeds domestic purchases.' if imports else 'domestic purchases exceed domestic production.'),
 f'At the plotted world price, Qd={qd} thousand and Qs={qs} thousand. {trade} are '+('excess domestic demand' if imports else 'excess domestic supply')+f', giving {qty} thousand units. The autarky quantity is not the appropriate comparison.',
 f'At Pw, Qd={qd},Qs={qs}, in thousands.','Distinguish imports as excess demand from exports as excess supply.',f'abs({qd}-{qs})={qty} thousand')
p('42724','Use the vertical guide drawn to the Lorenz curve. What income share would the equality line assign to that same group of households, and why?',
 '40%; under equality the group’s income share equals its population share.',
 '60%; under equality the group’s income share equals its population share.',
 '40%; under equality the group’s income share equals the observed Lorenz share even if the shares differ.',
 '60%; under equality the group’s income share equals the observed Lorenz share even if the shares differ.',
 'The guide is at the bottom 40% of households, whose observed income share is 15%. Perfect equality would give them 40% of income. The equality line is a benchmark, not the observed distribution.',
 'Guide at population share 40%, observed income share 15%.','Interpret equality as matching cumulative population and income shares.')
p('42726','Suppose redistribution raises the bottom 40%’s income share by five percentage points from the plotted value and leaves the new Lorenz curve nowhere below the old curve. Which new share and Gini change follow?',
 '20%; the Gini falls because the area between the curve and equality shrinks.',
 '25%; the Gini falls because the area between the curve and equality shrinks.',
 '20%; the Gini rises because a smaller gap from equality means greater inequality.',
 '25%; the Gini rises because a smaller gap from equality means greater inequality.',
 'The plotted bottom-40% share is 15%, so it becomes 20%. With a higher Lorenz curve and no offsetting declines elsewhere, the area below equality shrinks, lowering the Gini.',
 'Bottom 40% receives 15% of income.','Relate Lorenz improvement to a lower area-based inequality index.','15+5=20%')
p('42725','An analyst treats the bottom 40%’s income share in the graph as that group’s average income relative to the economy-wide mean. Which corrected mean and method are right?',
 '37.5% of the overall mean; divide the group’s income share by its population share.',
 '50% of the overall mean; divide the group’s income share by its population share.',
 '37.5% of the overall mean; use the group’s income share without adjusting for its population share.',
 '50% of the overall mean; use the group’s income share without adjusting for its population share.',
 'The bottom 40% receives 15% of total income. Its mean relative to the overall mean is 0.15/0.40=0.375. A cumulative income share alone is not a relative group mean.',
 'Bottom-40% income share 15%.','Correct confusion between cumulative income share and group mean.','15/40=.375')
p('42729','Initially the distribution is the one plotted and total income is $100 million. Later income is $120 million, with the bottom quintile receiving 4% and the top quintile 40%. Which original group incomes and interpretation of the later change are correct?',
 'Originally $5 million and $45 million; the bottom loses dollars while the top gains dollars despite both shares falling.',
 'Originally $6 million and $46 million; the bottom loses dollars while the top gains dollars despite both shares falling.',
 'Originally $5 million and $45 million; both groups must lose dollars because both shares fall.',
 'Originally $6 million and $46 million; both groups must lose dollars because both shares fall.',
 'The graph gives the bottom quintile 5% and the bottom 80% 55%, leaving 45% for the top quintile. Initial incomes are $5m and $45m. Later they are 0.04×120=$4.8m and 0.40×120=$48m. Changing shares and changing dollar income are distinct.',
 'Lorenz shares at 20%=5% and 80%=55%.','Compare relative shares with absolute income when the total changes.','100*.05=5;100*(1-.55)=45;120*.04=4.8;120*.40=48')
p('42753','A student subtracts the Lorenz share at the marked population guide from the equality-line share and calls that difference the Gini coefficient. Which gap and diagnosis are correct?',
 '25 percentage points; this single vertical gap is not the area-based Gini.',
 '20 percentage points; this single vertical gap is not the area-based Gini.',
 '25 percentage points; any one vertical gap equals the Gini for the entire distribution.',
 '20 percentage points; any one vertical gap equals the Gini for the entire distribution.',
 'The guide is at population share 40%, where income share is 15%. The vertical gap is 25 percentage points. The Gini uses the normalized area over the entire curve, not one height.',
 'Marked Lorenz point (40%,15%).','Distinguish a pointwise share gap from an area-based inequality measure.','40-15=25 percentage points')
p('42731','Economy A has total income of $100 million and B has $400 million. Using the plotted distributions, which bottom-40% incomes and comparison are correct?',
 'A: $22 million; B: $28 million. A gives the group a larger share, but B gives it more dollars.',
 'A: $20 million; B: $24 million. A gives the group a larger share, but B gives it more dollars.',
 'A: $22 million; B: $28 million. A’s larger share proves the group receives more dollars in A.',
 'A: $20 million; B: $24 million. A’s larger share proves the group receives more dollars in A.',
 'At the bottom 40%, A has 22% of income and B 7%. Thus group income is $22m in A and 0.07×400=$28m in B. A relative share and an absolute dollar total answer different questions.',
 'Bottom-40% shares A=22%,B=7%.','Distinguish relative distribution from absolute group income.','100*.22=22;400*.07=28')
p('42734','For economy B, a student assigns the income outside the bottom 80% to the top 40% of households. Which correct group mean and diagnosis follow from the graph?',
 'About three times the overall mean for the top 20%; use the complement’s income and population shares.',
 'About twice the overall mean for the top 20%; use the complement’s income and population shares.',
 'About three times the overall mean for the top 40%; the complement of 80% is 40%.',
 'About twice the overall mean for the top 40%; the complement of 80% is 40%.',
 'B’s bottom 80% receives about 40% of income. The remaining 60% belongs to the top 20%, giving a relative group mean of 60/20=3. Cumulative shares must be complemented on both axes.',
 'B at population 80% has income share about 40%.','Identify the complement group and convert its income share to a relative mean.','(100-40)/(100-80)=3')
p('42737','An analyst says the middle quintile in economy A has average income twice the overall mean. Which share and correction are supported by the graph?',
 'Its share is about 18%; its mean is about 90% of the overall mean.',
 'Its share is about 16%; its mean is about 80% of the overall mean.',
 'Its share is about 18%; a quintile’s cumulative endpoint alone determines its mean.',
 'Its share is about 16%; a quintile’s cumulative endpoint alone determines its mean.',
 'A’s cumulative shares at population 40% and 60% are about 22% and 40%. The middle quintile receives 40−22=18%, and 18/20=0.9 of the overall mean. The upper cumulative endpoint includes earlier quintiles.',
 'A shares 22% at population 40%, about 40% at population 60%.','Recover a noncumulative group share and compare its mean with the overall mean.','40-22=18;18/20=.9')
for i in ['42742','42740','42761']:
 p(i,'Which Gini change and conclusion about the plotted policy comparison are correct?',
 '0.380 to 0.252; relative inequality falls, but this alone does not establish higher mean income or eliminate poverty.',
 '0.420 to 0.300; relative inequality falls, but this alone does not establish higher mean income or eliminate poverty.',
 '0.380 to 0.252; the change alone proves that average income rises and poverty is eliminated.',
 '0.420 to 0.300; the change alone proves that average income rises and poverty is eliminated.',
 'The figure reports Gini values 0.380 before transfers and 0.252 after. The after-transfer curve is higher and closer to equality, leaving a smaller inequality area. This is evidence about relative distribution, not mean income or a poverty threshold.',
 'Printed Ginis 0.380 and 0.252; after-transfer curve above before-transfer curve.','Interpret the Gini and its relation to Lorenz distance without inferring income levels.')
p('42747','A report says the policy makes every low-income household richer. Which bottom-40% share change and limitation of that claim follow from the graph?',
 '15% to 22%; higher cumulative relative shares do not establish every household’s absolute income change.',
 '10% to 18%; higher cumulative relative shares do not establish every household’s absolute income change.',
 '15% to 22%; a higher cumulative share proves every household in the group has more real income.',
 '10% to 18%; a higher cumulative share proves every household in the group has more real income.',
 'The bottom-40% share rises from 15% to 22%. Lorenz curves give cumulative relative shares, not the total income level, individual income paths or whether the same households occupy each rank.',
 'At population 40%, before=15%,after=22%.','Identify the limits of aggregate relative shares for individual welfare claims.')
p('42743','Could reducing every household’s income by 10%, with nothing else changing, produce the Gini change shown? Which plotted change and explanation are correct?',
 'A decline of 0.128; no, proportional income changes leave relative shares and the Gini unchanged.',
 'A decline of 0.100; no, proportional income changes leave relative shares and the Gini unchanged.',
 'A decline of 0.128; yes, a common proportional reduction makes relative income shares more equal.',
 'A decline of 0.100; yes, a common proportional reduction makes relative income shares more equal.',
 'The plotted decline is 0.380−0.252=0.128. Multiplying every income and the total by 0.9 leaves all income shares unchanged, so it cannot generate the plotted Lorenz or Gini change.',
 'Gini before .380,after .252.','Test a proposed explanation using proportional invariance of relative inequality.','.380-.252=.128')
p('42722','Total income is $200 million. Using the Lorenz curve, how much goes to the bottom 60%, and why is applying their population percentage directly to income incorrect?',
 '$60 million; population share differs from the plotted income share.',
 '$80 million; population share differs from the plotted income share.',
 '$60 million; a population share is always the same as an income share.',
 '$80 million; a population share is always the same as an income share.',
 'At population 60%, the curve gives income share 30%. Thus the group receives 0.30×200=$60 million. $120 million would use the equality benchmark instead of the observed distribution.',
 'Lorenz income share at population 60% is 30%.','Distinguish cumulative population and income shares.','200*.30=60')
p('42739','Which Lorenz ordering is shown, and what does it imply about relative inequality?',
 'A lies above B between the endpoints; A has the lower Gini.',
 'B lies above A between the endpoints; B has the lower Gini.',
 'A lies above B between the endpoints; A has the higher Gini.',
 'B lies above A between the endpoints; B has the higher Gini.',
 'A’s curve is everywhere above B’s except their shared endpoints. It leaves a smaller area below equality, implying a lower Gini. This noncrossing ordering is Lorenz dominance and says nothing by itself about mean income.',
 'A above B throughout interior population shares.','Use Lorenz dominance to order relative inequality.')
p('42741','Average real income falls from $20,000 to $18,000 while the Gini changes as shown. A report says the Gini change proves higher living standards for every group. Which calculation and assessment are correct?',
 'Gini falls 0.128 and mean income 10%; lower relative inequality does not prove every group is better off.',
 'Gini falls 0.100 and mean income 10%; lower relative inequality does not prove every group is better off.',
 'Gini falls 0.128 and mean income 10%; the Gini decline proves every group’s real income rises.',
 'Gini falls 0.100 and mean income 10%; the Gini decline proves every group’s real income rises.',
 'The Gini falls from 0.380 to 0.252, or 0.128, while mean income falls 2,000/20,000=10%. Relative inequality and the level of income are distinct; a better Gini does not establish universal welfare gains.',
 'Gini .380 before,.252 after.','Evaluate a welfare claim by separating distribution from real-income levels.','.380-.252=.128;(20000-18000)/20000=.10')
p('P62D-ITP-H-003','In the closed-market graph, what is total surplus at equilibrium, and what does this measure?',
 '$900; willingness to pay above the resources’ opportunity cost.',
 '$600; willingness to pay above the resources’ opportunity cost.',
 '$900; the payment from buyers to sellers without deducting resource cost.',
 '$600; the payment from buyers to sellers without deducting resource cost.',
 'The demand and supply intercepts are $80 and $20 and equilibrium quantity is 30. Total surplus is 0.5×30×(80−20)=$900, the combined gains from exchange. Equilibrium expenditure is 30×50=$1,500, a different measure.',
 'Intercepts80/20; equilibrium Q30,P50.','Measure gains from exchange as total surplus rather than payments.','.5*30*(80-20)=900')
for i,country,imports,world,aut,q0,qd,qs,cs,ps,net in [
 ('P62D-ITP-LB-016','Faron',True,32,54,32,54,10,946,462,484),
 ('P62D-ITP-LB-017','Faron',False,70,54,32,16,48,384,640,256),
 ('P62D-ITP-LB-034','Lydon',True,36,61,41,66,16,1337.5,712.5,625),
 ('P62D-ITP-LB-035','Lydon',False,88,61,41,14,68,742.5,1471.5,729)]:
 qty=abs(qd-qs);kind='Imports' if imports else 'Exports';gain='consumers' if imports else 'producers';lose='producers' if imports else 'consumers';benefit=cs if imports else ps;loss=ps if imports else cs
 def read(n,b,l):return f'{kind}={n}; {gain} gain ${b:g}, {lose} lose ${l:g}'
 actual=read(qty,benefit,loss);other=read(qty-4,benefit-100,loss-80)
 p(i,f'{country} opens its market to trade at the world price shown. Which trade and welfare changes from autarky, and interpretation of their distribution, are correct?',
 actual+f'; total surplus rises ${net:g}, so a national gain can coexist with domestic losers.',
 other+f'; total surplus rises ${net-20:g}, so a national gain can coexist with domestic losers.',
 actual+'; the losing group’s loss means national surplus must fall despite the larger gain.',
 other+'; the losing group’s loss means national surplus must fall despite the larger gain.',
 f'Autarky is P=${aut},Q={q0}; trade has P=${world},Qd={qd},Qs={qs}. The price change is ${abs(world-aut)}. '+f'The consumer-surplus change has magnitude 0.5×({q0}+{qd})×{abs(world-aut)}=${cs:g}; the producer change has magnitude 0.5×({q0}+{qs})×{abs(world-aut)}=${ps:g}. '+f'{gain.capitalize()} gain, {lose} lose, and the net national gain is ${net:g}. Positive total gains do not imply that every group gains.',
 f'Autarky ({q0},${aut}); world price ${world}, demand {qd}, supply {qs}.','Evaluate the distribution and net national welfare effect of opening trade.',f'abs({qd}-{qs})={qty};.5*({q0}+{qd})*{abs(world-aut)}={cs};.5*({q0}+{qs})*{abs(world-aut)}={ps};{benefit}-{loss}={net}')
save();print('Graph proposals prepared:',len(R))
