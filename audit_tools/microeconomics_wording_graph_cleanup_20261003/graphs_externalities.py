from common import *
p=paired
families=[
 dict(ids=['42023','42067','42065','42028'],market='garments',unit='million garments',private=240,social=160,wedge=6,alt=4,curve='MSC and MPB',effect='external cost of production',policy='tax',ev='MPC–MPB Q=240; MSC–MPB Q=160; at Q=160, MSC=$15 and MPC=$9.'),
 dict(ids=['42033','42076','42074','42038'],market='vapes',unit='thousand vapes',private=180,social=140,wedge=4,alt=2,curve='MSB and MPC',effect='external cost of consumption',policy='tax',ev='MPB–MPC Q=180; MSB–MPC Q=140; at Q=140, MPB=$12 and MSB=$8.'),
 dict(ids=['42043','42085','42083','42048'],market='gardens',unit='gardens',private=100,social=150,wedge=5,alt=3,curve='MSC and MPB',effect='external benefit of production',policy='producer subsidy',ev='MPC–MPB Q=100; MSC–MPB Q=150; at Q=150, MPC=$15 and MSC=$10.'),
 dict(ids=['42053','42094','42092','42058'],market='transit rides',unit='thousand rides per day',private=150,social=200,wedge=2,alt=1,curve='MSB and MPC',effect='external benefit of consumption',policy='rider subsidy',ev='MPB–MPC Q=150; MSB–MPC Q=200; at Q=200, MSB=$6 and MPB=$4.')]
for f in families:
 priv,soc,w,alt=f['private'],f['social'],f['wedge'],f['alt'];unit=f['unit'];pol=f['policy'];ev=f['ev'];gap=abs(priv-soc);other=gap//2
 i=f['ids'][0]
 p(i,f'Use the {f["market"]} graph. How far apart are the private and socially efficient quantities, and why do they differ?',
 f'{gap} {unit}; private decisions omit the {f["effect"]}.',f'{other} {unit}; private decisions omit the {f["effect"]}.',
 f'{gap} {unit}; a change in the market price alone makes private incentives account for every spillover.',f'{other} {unit}; a change in the market price alone makes private incentives account for every spillover.',
 ev+f' The quantity difference is {gap}. Private choices use MPC and MPB; efficiency incorporates the {f["effect"]} through the social marginal curve.',ev,'Distinguish private equilibrium from social marginal efficiency.',f'abs({priv}-{soc})={gap}')
 for i in [f['ids'][1],f['ids'][3]]:
  p(i,f'Which per-unit correction fits the {f["market"]} graph, and how does it change private incentives?',
  f'A ${w} {pol}; it makes the decision-maker account for the marginal external effect.',
  f'A ${alt} {pol}; it makes the decision-maker account for the marginal external effect.',
  f'A ${w} {pol}; it works by ignoring the difference between private and social marginal values.',
  f'A ${alt} {pol}; it works by ignoring the difference between private and social marginal values.',
  ev+f' The marginal gap is ${w}, so a matching {pol} internalizes it and supports {soc} {unit}. The correction must match the marginal external effect, not merely point in the right direction.',ev,'Calibrate internalization to the external marginal effect shown.')
 i=f['ids'][2]
 p(i,f'Which quantity and marginal comparison identify social efficiency in the {f["market"]} graph?',
 f'{soc} {unit}; {f["curve"]} meet, equating social marginal benefit and cost.',
 f'{soc+20} {unit}; {f["curve"]} meet, equating social marginal benefit and cost.',
 f'{soc} {unit}; equality of private benefit and private cost is sufficient even with an unpriced spillover.',
 f'{soc+20} {unit}; equality of private benefit and private cost is sufficient even with an unpriced spillover.',
 ev+f' At {soc}, the relevant social marginal curves meet. Moving toward this quantity adds units with social benefit above cost or removes units with cost above benefit. Private equality alone omits the spillover.',ev,'Identify efficiency using social rather than merely private marginal equality.')
for i,w,alt,ev in [('42068',6,4,families[0]['ev']),('42077',4,2,families[1]['ev'])]:
 p(i,'A regulator says any tax that reduces the market quantity will fully correct the externality. Which optimal tax and diagnosis are supported by the graph?',
 f'${w} per unit; the tax must match the marginal external cost, so direction alone is insufficient.',
 f'${alt} per unit; the tax must match the marginal external cost, so direction alone is insufficient.',
 f'${w} per unit; any positive tax is equally efficient once it reduces quantity.',
 f'${alt} per unit; any positive tax is equally efficient once it reduces quantity.',
 ev+f' The required wedge is ${w}. A smaller tax leaves excess quantity; a larger one can overcorrect. The regulator must calibrate size as well as direction.',ev,'Diagnose an uncalibrated corrective-policy claim.')
p('42103','Compare the taxed equilibrium shown with both the private and socially efficient quantities. Which residual overconsumption and evaluation of the policy are correct?',
 '20 thousand vapes remain above the efficient quantity; the tax improves efficiency without fully restoring it.',
 '10 thousand vapes remain above the efficient quantity; the tax improves efficiency without fully restoring it.',
 '20 thousand vapes remain above the efficient quantity; any reduction from the private quantity proves full efficiency.',
 '10 thousand vapes remain above the efficient quantity; any reduction from the private quantity proves full efficiency.',
 'The private quantity is 180 thousand, the taxed quantity 160 thousand and social efficiency 140 thousand. The tax reduces the distortion but leaves 20 thousand excess vapes and a residual welfare loss.',
 'Private Q180,taxed Q160,social Q140, in thousands.','Evaluate partial versus full internalization.','160-140=20 thousand')
p('42164','Which number of sirens and decision rule maximize net social benefits in the graph?',
 '40; stop where marginal social benefit equals marginal cost.',
 '60; stop where marginal social benefit equals marginal cost.',
 '40; expand until total benefit falls to zero.',
 '60; expand until total benefit falls to zero.',
 'MSB intersects MC at 40 sirens and $20,000 per siren. Further sirens have cost above their added benefit even though total benefit remains positive. The decision rule is marginal.',
 'MSB–MC intersection at Q40, value20 thousands.','Use marginal benefit versus cost rather than the largest quantity or total benefit.')
for i in ['42173','42181']:
 p(i,'In the public-radio graph, how much provision is omitted by relying on Private Benefit rather than MSB, and what explains the difference?',
 '40 hours; free riding can keep voluntary payments below the value of shared benefits.',
 '20 hours; free riding can keep voluntary payments below the value of shared benefits.',
 '40 hours; voluntary payments necessarily capture every nonpayer’s benefit.',
 '20 hours; voluntary payments necessarily capture every nonpayer’s benefit.',
 'Private Benefit meets MC at 40 hours; MSB meets MC at 80. Between them MSB exceeds cost. Nonexcludability allows nonpayers to benefit, so observed private contributions can understate the relevant social marginal benefit.',
 'Private Benefit–MC Q40; MSB–MC Q80.','Explain public-good underprovision using omitted benefits and free riding.','80-40=40 hours')
p('42047','A council sets only an upper cap of 150 gardens, with no subsidy or purchase commitment. Starting from the private equilibrium shown, which quantity and policy assessment are correct?',
 '100 gardens remain privately supported; the cap permits expansion but provides no incentive for it.',
 '125 gardens remain privately supported; the cap permits expansion but provides no incentive for it.',
 '100 gardens remain privately supported; a maximum of 150 forces private production up to the maximum.',
 '125 gardens remain privately supported; a maximum of 150 forces private production up to the maximum.',
 'MPC and MPB intersect at 100 gardens, while the social intersection is 150. A maximum of 150 is nonbinding at the private quantity. Internalizing the benefit or arranging provision is needed to induce expansion.',
 'Private intersection Q100; social intersection Q150.','Evaluate whether a cap creates an incentive to correct underproduction.')
p('42057','A transport authority wants to achieve the social-intersection quantity in the graph. Which policy and explanation directly support that target?',
 'A $2 rider subsidy; it internalizes the marginal external benefit and supports 200 thousand rides.',
 'A $1 rider subsidy; it internalizes the marginal external benefit and supports 175 thousand rides.',
 'An upper limit of 200 thousand rides; merely permitting that quantity forces riders to choose it.',
 'An upper limit of 175 thousand rides; merely permitting that quantity forces riders to choose it.',
 'MSB and MPC meet at 200 thousand rides; the gap above MPB there is $2. A matching rider subsidy rewards the external benefit. A maximum above private demand does not itself induce more trips.',
 'MSB–MPC Q200; MSB6 versus MPB4.','Compare an incentive that induces efficient provision with a nonbinding cap.')
# Options in this item use different policy types; retain explicit two-test comparison in the ledger.
R['42057']['construct_test']['same_readings_different_economics']='A target quantity does not establish that a cap induces it; distinguish permission from a marginal incentive.'
p('42086','Enforceable agreements could let affected neighbors jointly pay $5 per garden without bargaining costs or wealth effects. Compare this with a $5 producer subsidy funded by costless lump-sum taxes. Which graph-based gain and institutional comparison are correct?',
 'Both can create a $125 gain over the private outcome; the payment arrangements distribute purchasing power differently.',
 'Both can create a $100 gain over the private outcome; the payment arrangements distribute purchasing power differently.',
 'Both can create a $125 gain over the private outcome; payments themselves are additional real resource benefits.',
 'Both can create a $100 gain over the private outcome; payments themselves are additional real resource benefits.',
 'Private and social quantities are 100 and 150; the marginal external benefit is $5. The recovered gain is 0.5×50×5=$125. Either stated arrangement internalizes it. The $750 paid on 150 gardens is a transfer, not the gain itself.',
 'Private Q100,social Q150,marginal gap5.','Compare bargaining and a subsidy while separating transfers from real welfare gains.','.5*(150-100)*5=125;150*5=750')
p('42095','A $2 rider subsidy implements the social-intersection quantity at a real administration cost of $12 thousand per day. A private agreement achieves the same quantity but costs $18 thousand to arrange and enforce. Ignore financing distortions. Which net gains over the plotted private outcome and conclusion follow?',
 '$38 thousand for the subsidy and $32 thousand for bargaining; real implementation costs determine this ranking.',
 '$28 thousand for the subsidy and $22 thousand for bargaining; real implementation costs determine this ranking.',
 '$38 thousand for the subsidy and $32 thousand for bargaining; subsidy payments themselves create additional resource benefits.',
 '$28 thousand for the subsidy and $22 thousand for bargaining; subsidy payments themselves create additional resource benefits.',
 'Expansion from 150 to 200 thousand rides closes a $2 marginal gap, giving gross gains 0.5×50×2=$50 thousand. Subtracting the respective real costs gives $38 thousand and $32 thousand. Transfers are not resource gains, and this ranking depends on the stated costs.',
 'Qprivate150,Qsocial200,gap2.','Compare policy and bargaining by net real gains rather than transfer amounts.','.5*50*2=50;50-12=38;50-18=32 thousand')
p('42096','A regulator calls the dashed policy-adjusted curve a full correction because it intersects MPC. Which plotted discrepancy and diagnosis refute that claim?',
 'It remains $2 above MSB and yields 160 rather than 140 thousand vapes; private equilibrium need not be socially efficient.',
 'It remains $1 above MSB and yields 150 rather than 140 thousand vapes; private equilibrium need not be socially efficient.',
 'It remains $2 above MSB and yields 160 rather than 140 thousand vapes; any intersection with MPC establishes full efficiency.',
 'It remains $1 above MSB and yields 150 rather than 140 thousand vapes; any intersection with MPC establishes full efficiency.',
 'The dashed curve is $2 above MSB. Its intersection with MPC is 160 thousand rather than the social 140 thousand. Clearing a market with a remaining private-social gap does not remove the externality distortion.',
 'Dashed curve2 above MSB; intersections160 and140.','Diagnose incomplete internalization despite a private equilibrium.')
p('42179','A fund expands radio provision from the Private Benefit–MC intersection to the MSB–MC intersection. Real administration costs are $10,000 per week; transfers have no resource cost. Which net gain and explanation are supported?',
 '$70,000; the expansion captures benefits that voluntary payments omit.',
 '$50,000; the expansion captures benefits that voluntary payments omit.',
 '$70,000; transfers collected to fund programming are themselves the extra social benefit.',
 '$50,000; transfers collected to fund programming are themselves the extra social benefit.',
 'Provision rises from 40 to 80 hours. At 40, MSB is 60 hundreds and MC 20 hundreds, a $4,000 gap. Gross gains are 0.5×40×4,000=$80,000; subtracting administration leaves $70,000. The gains are benefits above real costs, not transfers.',
 'Q40→80; MSB(40)=60 hundreds, MC20 hundreds.','Evaluate net public-good provision gains including implementation cost.','.5*40*(60-20)*100-10000=70000')
p('42182','A council can afford 20, 30 or 40 miles of protection. Which target in the graph maximizes net social benefit, and what is the economic reason?',
 '30 miles; stop adding protection when marginal social benefit equals marginal cost.',
 '40 miles; stop adding protection when marginal social benefit equals marginal cost.',
 '30 miles; any affordable target is equally efficient regardless of marginal benefits and costs.',
 '40 miles; any affordable target is equally efficient regardless of marginal benefits and costs.',
 'MSB meets MC at 30 miles. The units between 20 and 30 add positive net benefits, while units beyond 30 cost more than their added benefit. Affordability permits a choice; it does not establish efficiency.',
 'MSB–MC intersection at Q30,value30 million.','Choose among affordable targets by marginal net benefit.')
p('42186','A cost-saving method lowers the graphed MC by $15 million per mile at every quantity, leaving MSB unchanged. Treat quantity as continuous. Which revised target and decision rule are correct?',
 '40 miles; equate MSB to the new MC.',
 '50 miles; equate MSB to the new MC.',
 '40 miles; retain the old MC when evaluating the additional miles.',
 '50 miles; retain the old MC when evaluating the additional miles.',
 'The graph implies MSB=60−Q and original MC=15+0.5Q, in millions. New MC is 0.5Q. Equating 60−Q=0.5Q gives 40 miles, with both margins at $20 million. The efficiency rule uses the changed cost.',
 'MSB intercept60,Qintercept60; MC intercept15 and value30 atQ30.','Recalculate an efficient target under a changed marginal-cost constraint.','60-Q=.5Q => Q40;MC20')
p('42189','Treat quantity as continuous. A council budgets $700 million to expand from 10 to 30 miles, with no fixed or financing costs. Which expansion cost, net benefit and budget assessment follow from the graph?',
 'Cost $500 million and net benefit $300 million; the budget is sufficient and the expansion raises welfare.',
 'Cost $600 million and net benefit $200 million; the budget is sufficient and the expansion raises welfare.',
 'Cost $500 million and net benefit $300 million; affordability alone proves that any further expansion raises welfare.',
 'Cost $600 million and net benefit $200 million; affordability alone proves that any further expansion raises welfare.',
 'MC rises from 20 to 30 million per mile, so cost is 20×(20+30)/2=$500 million. MSB falls from 50 to 30, so benefit is 20×(50+30)/2=$800 million. Net gain is $300 million. Budget sufficiency is separate from whether additional units have positive net benefit.',
 'AtQ10,MC20,MSB50; atQ30,MC30,MSB30 (millions).','Integrate changing marginal costs and benefits and distinguish affordability from efficiency.','20*(20+30)/2=500;20*(50+30)/2=800;800-500=300')
p('42102','Using the tax wedge and taxed quantity in the vaping graph, what revenue is collected, and how should it be treated in welfare accounting?',
 '$320 thousand; revenue is a transfer, not the residual deadweight loss.',
 '$280 thousand; revenue is a transfer, not the residual deadweight loss.',
 '$320 thousand; revenue is the residual deadweight loss.',
 '$280 thousand; revenue is the residual deadweight loss.',
 'At the taxed quantity of 160 thousand, buyers pay $11 and sellers receive $9. Revenue is (11−9)×160=$320 thousand. This payment to government is not the lost surplus from the remaining excess consumption.',
 'TaxedQ160,buyer11,seller9.','Measure tax receipts from the wedge and quantity while distinguishing transfers from lost surplus.','(11-9)*160=320 thousand')
for i,b,s,policy in [('42093',4,6,'subsidy'),('42075',12,8,'tax')]:
 difference=abs(b-s)
 p(i,'At the socially efficient quantity in the graph, which buyer price and seller receipt are consistent with the corrective policy, and what does their difference represent?',
 f'Buyers pay ${b}, sellers receive ${s}; the ${difference} difference is the per-unit {policy}.',
 f'Buyers pay ${b+1}, sellers receive ${s+1}; the ${difference} difference is the per-unit {policy}.',
 f'Buyers pay ${b}, sellers receive ${s}; the ${difference} difference is total deadweight loss.',
 f'Buyers pay ${b+1}, sellers receive ${s+1}; the ${difference} difference is total deadweight loss.',
 f'At the corrected quantity the graph gives buyer price ${b} and seller receipt ${s}. The ${difference} wedge is the per-unit {policy}. A price difference per unit is not the total area measuring deadweight loss.',
 f'Corrected quantity has buyer price{b},seller receipt{s}.','Interpret policy incidence through buyer and seller prices, not as a welfare-loss area.')
for i in ['42195','42197']:
 p(i,'At four shared fireworks displays, which aggregate marginal benefit and summation rule are correct?',
 '$50,000; add the neighborhoods’ willingness to pay for the same additional display.',
 '$40,000; add the neighborhoods’ willingness to pay for the same additional display.',
 '$50,000; add the separate numbers of displays consumed at a common price.',
 '$40,000; add the separate numbers of displays consumed at a common price.',
 'At Q=4, North MB is $30,000 and South MB $20,000. Both consume the same four displays, so the value of the shared marginal display is their vertical sum, $50,000.',
 'AtQ4,North30 and South20 (thousands).','Vertically aggregate nonrival public-good benefits at a common quantity.','(30+20)*1000=50000')
for i in ['42204','42203','42207']:
 p(i,'At the marked radio-programming quantity, which marginal benefits and treatment of the shared hours are correct?',
 'A values the next hour at $3,000 and B at $1,000; both receive the same 40 hours, so add benefits, not hours.',
 'A values the next hour at $2,000 and B at $1,000; both receive the same 40 hours, so add benefits, not hours.',
 'A values the next hour at $3,000 and B at $1,000; add their hours to obtain 80 hours of total programming.',
 'A values the next hour at $2,000 and B at $1,000; add their hours to obtain 80 hours of total programming.',
 'At the 40-hour guide, A MB=30 hundreds of dollars and B MB=10 hundreds. Nonrival programming supplies the same hours to both groups. Their marginal willingness to pay sums to $4,000; the shared quantity is still 40 hours.',
 'Q40: A MB30 hundreds,B MB10 hundreds.','Distinguish nonrival shared consumption and vertical benefit addition from horizontal quantity addition.')
p('42206','At 40 radio hours, how much social marginal benefit would valuing programming from Group A alone omit, and why?',
 '$1,000; Group B also benefits from the same marginal hour.',
 '$2,000; Group B also benefits from the same marginal hour.',
 '$1,000; Group B consumes a separate hour that must be added to the quantity.',
 '$2,000; Group B consumes a separate hour that must be added to the quantity.',
 'At Q=40, Group B’s MB is 10 hundreds, or $1,000. Omitting B misses a benefit of the same nonrival hour; it does not omit a separate unit of programming.',
 'B MB atQ40 =10 hundreds.','Explain omitted willingness to pay in public-good valuation.','10*100=1000')
for i in ['42198','42192']:
 p(i,'An analyst uses North’s benefit alone to recommend reducing fireworks below four displays. Which aggregate reading and marginal rule correct the recommendation?',
 'Total MB=$50,000, equal to MC; add both neighborhoods’ benefits from the shared marginal display.',
 'Total MB=$40,000, equal to MC; add both neighborhoods’ benefits from the shared marginal display.',
 'Total MB=$50,000, equal to MC; average the two neighborhoods’ benefits to value the shared display.',
 'Total MB=$40,000, equal to MC; average the two neighborhoods’ benefits to value the shared display.',
 'North’s MB is $30,000 and South’s $20,000 at four displays, summing to the $50,000 MC. The public-good decision compares the sum of marginal benefits with cost, not one person’s benefit or their average.',
 'AtQ4 North30,South20,MC50 (thousands).','Use aggregate marginal benefits to correct a public-good provision decision.')
p('42196','A previously omitted neighborhood has constant marginal benefit of $10,000 per display. MC and the two plotted benefit curves are unchanged. Using a continuous-quantity approximation, which target and aggregation rule follow?',
 'Five displays; add the new neighborhood’s marginal benefit vertically to the existing sum.',
 'Six displays; add the new neighborhood’s marginal benefit vertically to the existing sum.',
 'Five displays; add its desired display quantity horizontally to the old quantity.',
 'Six displays; add its desired display quantity horizontally to the old quantity.',
 'Over the relevant range, the plotted benefits sum to 90−10Q in thousands. Adding 10 gives 100−10Q. Equating this to the $50,000 MC yields Q=5. The new beneficiary adds value to the same shared units.',
 'NorthMB50−5Q,SouthMB40−5Q until relevant5; MC50 (thousands).','Recalculate efficient provision after adding an omitted public-good beneficiary.','100-10Q=50 =>Q5')
p('42066','Sellers legally remit the corrective tax in the garments graph. Which price changes from the unregulated equilibrium and incidence interpretation are correct?',
 'Buyers pay $3 more and sellers receive $3 less; legal remittance does not place the entire burden on sellers.',
 'Buyers pay $2 more and sellers receive $4 less; legal remittance does not place the entire burden on sellers.',
 'Buyers pay $3 more and sellers receive $3 less; sellers bear the whole economic burden because they remit the tax.',
 'Buyers pay $2 more and sellers receive $4 less; sellers bear the whole economic burden because they remit the tax.',
 'The original price is $12. At the corrected quantity buyers pay $15 and sellers receive $9, so each side bears $3 of the $6 wedge. Statutory remittance and economic incidence are different.',
 'OriginalP12,corrected buyer15,seller9.','Distinguish economic incidence from legal responsibility for payment.','15-12=3;12-9=3')
save();print('Graph proposals prepared:',len(R))
