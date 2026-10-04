from common import *
def p(i,stem,good,alt,bad,altbad,fb,ev,reason,calc=None):paired(i,stem,good,alt,bad,altbad,fb,ev,reason,calc)
for i,q0,price,other in [('P62C-CPS-M-029',8,10,6),('P62C-CPS-L-020',8,10,6),('P62C-CPS-L-028',5,14,4),('P62C-CPS-L-024',8,14,6)]:
 advanced=i!='P62C-CPS-M-029'
 stem=('Refer to the graph. A student argues that the allocation at E is efficient only if buyers and sellers receive equal surplus. Which quantity and explanation correctly evaluate this claim under the standard competitive assumptions?' if advanced else 'Refer to the graph. Which quantity and explanation identify the efficient allocation under the standard competitive assumptions?')
 good=f'{q0} units: marginal willingness to pay equals marginal cost; equal surplus shares are not required.'
 alt=f'{other} units: marginal willingness to pay equals marginal cost; equal surplus shares are not required.'
 bad=f'{q0} units: equality of buyer and seller surplus is the condition required for efficiency.'
 altbad=f'{other} units: equality of buyer and seller surplus is the condition required for efficiency.'
 p(i,stem,good,alt,bad,altbad,f'Demand and supply intersect at E, with quantity {q0} and marginal value and cost both ${price}. This equality identifies the efficient quantity. Efficiency concerns total gains from trade, not an equal division of those gains.',f'E has Q={q0}, demand=supply=${price}.','Use equality of marginal value and marginal cost to identify efficiency; distinguish efficiency from distribution.')
p('P62C-CPS-B2-009','Refer to the graph. A report adds sales revenue at E to consumer and producer surplus when measuring total gains from exchange. Which total and diagnosis are correct?',
 'Total surplus is $96; sales revenue is a transfer, not an additional gain.','Total surplus is $80; sales revenue is a transfer, not an additional gain.',
 'Total surplus is $96; sales revenue should be added because it is an additional gain.','Total surplus is $80; sales revenue should be added because it is an additional gain.',
 'At E, Q=8 and P=$14. CS=0.5×8×(30−14)=$64 and PS=0.5×8×(14−6)=$32, giving $96. The $112 sales revenue is a payment from buyers to sellers, not an additional resource benefit.',
 'Demand intercept $30, supply intercept $6, E=(8,$14).','Diagnose double-counting of a payment when measuring total surplus.','0.5*8*(30-6)=96; 8*14=112.')
p('P62C-CPS-B2-010','Refer to the graph. A quota limits production to four units, allocated to the highest-value buyers and lowest-cost sellers. What gain would removing the quota create, and why?',
 '$2 of additional total surplus, because the missing units have value above resource cost.','$1 of additional total surplus, because the missing units have value above resource cost.',
 '$2 of additional total surplus, because buyers’ payments are an extra social benefit.','$1 of additional total surplus, because buyers’ payments are an extra social benefit.',
 'Demand is $16 and supply $12 at Q=4, and both meet at Q=5. The missing gain is 0.5×(5−4)×(16−12)=$2. Payments transfer income; value above resource cost creates the gain.',
 'D(4)=$16, S(4)=$12, E quantity 5.','Identify forgone mutually beneficial trades and measure their net surplus.','0.5*(5-4)*(16-12)=2.')
p('P62C-CPS-M-030','Refer to the graph. Which amount is buyer expenditure at E, and how should it be interpreted?',
 '$80, the payment to sellers; it is not consumer surplus.','$60, the payment to sellers; it is not consumer surplus.',
 '$80, the buyers’ net gain above what they pay.','$60, the buyers’ net gain above what they pay.',
 'At E, price is $10 and quantity is 8, so expenditure is 10×8=$80. Consumer surplus is willingness to pay above that expenditure, not the payment itself.',
 'E=(8,$10).','Distinguish the price-times-quantity payment from consumer surplus.','10*8=80.')
p('P62C-CPS-H-005','Refer to the graph. Which amount and region represent consumer surplus at E?',
 '$32, below demand and above price through the traded quantity.','$24, below demand and above price through the traded quantity.',
 '$32, above supply and below price through the traded quantity.','$24, above supply and below price through the traded quantity.',
 'E is Q=8, P=$10, and demand intercepts price at $18. Consumer surplus is 0.5×8×(18−10)=$32. The region above supply and below price is producer surplus, even when the two areas happen to be equal.',
 'Q=8, P=$10, demand intercept $18.','Identify buyer net gains rather than the equally sized producer-surplus area.','0.5*8*(18-10)=32.')
p('P62C-CPS-H-007','Refer to the graph. At E, what is total surplus, and how does it differ from buyer expenditure?',
 '$50; it measures value above resource cost, while expenditure is a payment.','$40; it measures value above resource cost, while expenditure is a payment.',
 '$50; it measures the payment to sellers, while expenditure is the gain above resource cost.','$40; it measures the payment to sellers, while expenditure is the gain above resource cost.',
 'The demand and supply intercepts are $24 and $4 and E has Q=5, P=$14. Total surplus is 0.5×5×(24−4)=$50. Expenditure is 14×5=$70 and transfers income between participants.',
 'Intercepts $24 and $4; E=(5,$14).','Separate total net gains from payments.','0.5*5*(24-4)=50;14*5=70.')
p('P62C-CPS-LB-010','Refer to the graph. A proposal would redistribute surplus solely because the current buyer and seller shares differ. Which calculation and efficiency judgment evaluate that justification?',
 'CS=$64 and PS=$32; unequal shares alone do not establish inefficiency.','CS=$48 and PS=$24; unequal shares alone do not establish inefficiency.',
 'CS=$64 and PS=$32; unequal shares alone establish inefficiency.','CS=$48 and PS=$24; unequal shares alone establish inefficiency.',
 'E gives Q=8 and P=$14. CS=0.5×8×16=$64; PS=0.5×8×8=$32. Marginal value equals marginal cost at E, so unequal shares do not establish an efficiency problem. Redistribution may reflect an equity objective.',
 'E=(8,$14), demand intercept $30, supply intercept $6.','Evaluate a distributional justification separately from allocative efficiency.','0.5*8*16=64;0.5*8*8=32.')
p('P62C-CPS-LB-011','Refer to the graph. A student uses the surplus shares at E to argue that every efficient market must divide its gains equally. Which reading and judgment are correct?',
 'CS and PS are each $25; their equality here does not establish a general efficiency requirement.','CS and PS are each $20; their equality here does not establish a general efficiency requirement.',
 'CS and PS are each $25; their equality here establishes a general efficiency requirement.','CS and PS are each $20; their equality here establishes a general efficiency requirement.',
 'At E, Q=5 and P=$14, with demand and supply intercepts $24 and $4. Each area is 0.5×5×10=$25. Efficiency depends on marginal value equaling marginal cost, not equal surplus shares.',
 'Q=5; both surplus-triangle heights $10.','Reject a general equity requirement inferred from one efficient allocation.','0.5*5*10=25.')
p('P62C-CPS-EL-017','Refer to the graph. A seller claims that its revenue at E measures its producer surplus. Which calculation and explanation evaluate the claim?',
 'Revenue=$72 and producer surplus=$0; receipts just cover the marginal cost of every unit.','Revenue=$60 and producer surplus=$0; receipts just cover the marginal cost of every unit.',
 'Revenue=$72 and producer surplus=$0; the $72 payment itself is the seller’s gain above resource cost.','Revenue=$60 and producer surplus=$0; the $60 payment itself is the seller’s gain above resource cost.',
 'Supply is horizontal at $6 and E has Q=12. Revenue is 6×12=$72. Because marginal cost is also $6 for every unit, the area above supply and below price is zero. Revenue does not measure producer surplus.',
 'Horizontal supply at $6; equilibrium quantity 12.','Distinguish receipts from producer surplus when price equals constant marginal cost.','6*12=72; (6-6)*12=0.')
p('P62C-CPS-LB-016','Refer to the graph. A report adds seller revenue to the consumer-surplus area to measure total gains from trade. Which surplus calculation and correction are appropriate?',
 'CS=$72, PS=$0, total surplus=$72; adding revenue would double-count a transfer.','CS=$60, PS=$0, total surplus=$60; adding revenue would double-count a transfer.',
 'CS=$72, PS=$0, total surplus=$72; adding revenue would capture an extra resource benefit.','CS=$60, PS=$0, total surplus=$60; adding revenue would capture an extra resource benefit.',
 'Demand intercepts at $18, supply is horizontal at $6 and Q=12. CS=0.5×12×(18−6)=$72 and PS=0. Total surplus is $72; seller revenue is not an additional gain.',
 'Demand intercept $18, supply $6, Q=12.','Combine surplus division with the distinction between payments and social gains.','0.5*12*(18-6)=72.')
p('P62C-CPS-L-031','Refer to the graph. Output is held at the vertical line through A and B. Which marginal comparison supports reducing output toward the competitive quantity?',
 'At that output, value is $8 and cost is $12; reducing the units with cost above value raises total surplus.','At that output, value is $6 and cost is $10; reducing the units with cost above value raises total surplus.',
 'At that output, value is $8 and cost is $12; reducing those units only redistributes surplus.','At that output, value is $6 and cost is $10; reducing those units only redistributes surplus.',
 'At Q=10, A on demand is $8 and B on supply is $12. Between Q=8 and Q=10, marginal cost exceeds willingness to pay. Removing these units avoids negative gains, rather than merely transferring income.',
 'A=(10,$8), B=(10,$12); equilibrium Q=8.','Diagnose overproduction using marginal cost versus marginal value.')
p('P62C-CPS-L-029','Refer to the graph. Output is held at the vertical line through A and B. Which marginal comparison supports expanding output toward E?',
 'Value is $12 and cost is $8 at the restriction; additional units before E create net gains.','Value is $14 and cost is $10 at the restriction; additional units before E create net gains.',
 'Value is $12 and cost is $8 at the restriction; additional units before E only redistribute existing gains.','Value is $14 and cost is $10 at the restriction; additional units before E only redistribute existing gains.',
 'At Q=6, A on demand is $12 and B on supply is $8. Value exceeds cost until Q=8 at E. Expansion recovers positive gains from trade, not merely a payment transfer.',
 'A=(6,$12), B=(6,$8); E quantity 8.','Use marginal gains to diagnose underproduction.')
for i,over in [('P62C-CPS-LB-013',True),('P62C-CPS-LB-012',False)]:
 task='reducing output to E' if over else 'expanding output to E'
 reason='avoids producing units whose cost exceeds their value' if over else 'adds trades whose value exceeds their resource cost'
 p(i,f'Refer to the graph. Starting at the marked quantity through A and B, what change in total surplus would {task} cause, and why?',
 f'A $4 gain: it {reason}.',f'A $8 gain: it {reason}.',
 'A $4 gain: the change transfers that amount from sellers to buyers.','An $8 gain: the change transfers that amount from sellers to buyers.',
 ('The restricted quantity is 10 and E is at 8. At Q=10, cost is $12 and value $8.' if over else 'The restricted quantity is 6 and E is at 8. At Q=6, value is $12 and cost $8.')+' The surplus gain is 0.5×2×4=$4. A transfer by itself does not change total surplus.',
 'Marked output '+('10' if over else '6')+', E=8, marginal gap $4.','Distinguish recovered efficiency from redistribution.','0.5*2*4=4.')
p('P62C-CPS-L-030','Refer to the graph. Repealing the restriction at the marked quantity left of E restores E and transfers $9 from producers to consumers on continuing trades. Assuming efficient allocation and no other effects, which total-surplus change and explanation are correct?',
 'Total surplus rises $4; the $9 transfer changes its distribution.','Total surplus rises $8; the $9 transfer changes its distribution.',
 'Total surplus rises $4; the $9 transfer is an additional resource gain.','Total surplus rises $8; the $9 transfer is an additional resource gain.',
 'The omitted triangle has width 8−6=2 and height 12−8=$4, so restoring trade creates $4. The $9 transfer increases CS and decreases PS equally, leaving their sum unchanged apart from the recovered trades.',
 'Restricted Q=6, E Q=8, D(6)=$12, S(6)=$8.','Evaluate a policy combining efficiency gains with a transfer.','0.5*(8-6)*(12-8)=4;9-9=0.')
for i,consumer,old,new,change,alt,ev in [('P62C-CPS-LB-014',True,32,72,40,32,'Demand intercept $20; (Q,P) changes from (8,12) to (12,8).'),('P62C-CPS-LB-015',False,18,50,32,24,'Supply intercept $2; (Q,P) changes from (6,8) to (10,12).')]:
 side='consumer' if consumer else 'producer';existing=32 if consumer else 24;added=8
 p(i,f'Refer to the graph. As price moves from P1 to P2, a report counts only the gain on units already traded. Which full {side}-surplus change and explanation correct the omission?',
 f'An increase of ${change}, including ${existing} on original units and ${added} on additional units.',f'An increase of ${alt}, including ${alt-4} on original units and $4 on additional units.',
 f'An increase of ${change}; it consists entirely of the gain on original units.',f'An increase of ${alt}; it consists entirely of the gain on original units.',
 f'{ev} {side.capitalize()} surplus rises from ${old} to ${new}, an increase of ${change}. The price change on existing units contributes ${existing}; the additional-unit triangle contributes $8.',ev,'Account for both the inframarginal gain and the surplus on newly traded units.',f'{new}-{old}={change};{existing}+8={change}.')
p('P62C-CPS-B2-007','Refer to the graph. A student labels the price-times-quantity rectangle at E as consumer surplus. Which amount and explanation correct the mistake?',
 'Consumer surplus is $64; the rectangle measures expenditure.','Consumer surplus is $48; the rectangle measures expenditure.',
 'Consumer surplus is $64; the rectangle measures the buyers’ net gain.','Consumer surplus is $48; the rectangle measures the buyers’ net gain.',
 'Q=8, P=$14 and the demand intercept is $30. CS=0.5×8×(30−14)=$64. The rectangle 8×14=$112 is payment to sellers, not buyers’ net gain.',
 'E=(8,$14), demand intercept $30.','Correct expenditure being confused with consumer surplus.','0.5*8*(30-14)=64.')
p('P62C-CPS-B2-008','Refer to the graph. A lump-sum rule transfers $20 from buyers to sellers without changing quantity, allocation or resource costs. What is producer surplus after the transfer, and what happens to total surplus?',
 'Producer surplus becomes $52; total surplus is unchanged.','Producer surplus becomes $44; total surplus is unchanged.',
 'Producer surplus becomes $52; total surplus rises $20.','Producer surplus becomes $44; total surplus rises $20.',
 'The original PS is 0.5×8×(14−6)=$32. Adding the transfer gives sellers $52, while buyers lose the same $20. With no resource or allocation change, total surplus stays unchanged.',
 'Q=8, price $14, supply intercept $6.','Separate a transfer’s distributional effect from total surplus.','0.5*8*(14-6)+20=52;20-20=0.')
save();print('Graph proposals prepared:',len(R))
