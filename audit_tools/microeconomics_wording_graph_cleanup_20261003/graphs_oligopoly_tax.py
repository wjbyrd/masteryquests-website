from common import *
p=paired
p('P62I-OLI-LB-021','Use the plotted demand and constant MC. Two identical cartel members split the joint-profit-maximizing output equally. One secretly adds one unit while the other holds its quota. Which profit comparison and incentive assessment are correct?',
 'The deviator gains $18 while joint profit falls $2; the deviation is privately attractive despite harming the cartel.',
 'The deviator gains $14 while joint profit falls $2; the deviation is privately attractive despite harming the cartel.',
 'The deviator gains $18 while joint profit falls $2; lower joint profit by itself removes the unilateral incentive.',
 'The deviator gains $14 while joint profit falls $2; lower joint profit by itself removes the unilateral incentive.',
 'Demand is P=100−2Q and MC=$20. MR=MC gives Q=20,P=60 and each member profit (60−20)×10=$400. Deviation gives Q=21,P=58 and deviator profit (58−20)×11=$418. Joint profit falls from $800 to $798. Individual incentives differ from the joint objective.',
 'Demand intercept100,slope−2; MC20; MR–MC Q20.','Compare unilateral deviation incentives with joint-profit maximization.','(58-20)*11-(60-20)*10=18;(58-20)*21-(60-20)*20=-2')
p('P62I-OLI-LB-027','Use the demand and MC in the cartel graph. Compare a $200 lump-sum license charge with a $10 tax per unit. The cartel remains active and reoptimizes jointly. Which net profits and output effects are correct?',
 'License: $600; unit tax: $612.50. Only the unit tax changes MR=MC and the chosen output.',
 'License: $500; unit tax: $512.50. Only the unit tax changes MR=MC and the chosen output.',
 'License: $600; unit tax: $612.50. The license changes marginal cost, while the unit tax leaves it unchanged.',
 'License: $500; unit tax: $512.50. The license changes marginal cost, while the unit tax leaves it unchanged.',
 'The figure gives P=100−2Q and MC=20. Original Q=20,P=60,profit800. A fixed $200 charge leaves Q unchanged and profit600. The unit tax raises effective MC to30: Q=17.5,P=65,profit=(65−30)×17.5=612.50. A fixed charge reduces profit without entering MC.',
 'Demand100−2Q,MR100−4Q,MC20.','Separate fixed and marginal policy costs in a joint-profit decision.','800-200=600;(65-30)*17.5=612.5')
p('P62I-OLI-LB-024','The cartel faces the plotted demand and constant MC. Demand price falls $2.50 for each extra unit of total output. Two members split cartel output equally; one adds two units while the other holds its quota. Which incentive and deterrence threshold follow?',
 'The deviator gains $45 and joint profit falls $10; an expected present-value punishment greater than $45 deters it.',
 'The deviator gains $35 and joint profit falls $10; an expected present-value punishment greater than $35 deters it.',
 'The deviator gains $45 and joint profit falls $10; a punishment just above the $10 joint loss is sufficient.',
 'The deviator gains $35 and joint profit falls $10; a punishment just above the $10 joint loss is sufficient.',
 'The intercept is140 and MC30, so joint MR=140−5Q gives Q22,P85. Each earns(85−30)×11=605. Deviation gives totalQ24,P80 and deviator output13, profit650, a gain45. Joint profit falls1210→1200. Deterrence compares the deviator’s own gain with its expected discounted penalty.',
 'Demand intercept140 and MC30; joint optimum Q22.','Evaluate cartel deviation and the individual punishment needed for deterrence.','(80-30)*13-(85-30)*11=45;(85-30)*22-(80-30)*24=10')
p('P62I-OLI-L-073','Using the kinked demand and MR shown, compare raising constant MC to $45 with raising it to $55. Hold demand fixed. Which results and explanation are correct?',
 'At $45: Q=20,P=$60; at $55: Q=15,P=$62.50. The first cost lies within the MR gap, while the second lies above it.',
 'At $45: Q=30,P=$60; at $55: Q=25,P=$62.50. The first cost lies within the MR gap, while the second lies above it.',
 'At $45: Q=20,P=$60; at $55: Q=15,P=$62.50. Any cost change inside the MR gap must change the profit-maximizing quantity.',
 'At $45: Q=30,P=$60; at $55: Q=25,P=$62.50. Any cost change inside the MR gap must change the profit-maximizing quantity.',
 'The kink is(20,60) with MR dropping50→30. MC45 lies in the gap and keeps the kink optimal. The upper MR branch is70−Q; MC55 givesQ15 and P=70−0.5×15=62.50. Rigidity applies within the gap, not to every cost change.',
 'Kink(20,60),MRgap30–50,upper demand intercept70.','Compare a cost change within and beyond a kinked-demand MR gap.','70-Q=55 =>Q15;70-.5*15=62.5')
p('P62I-OLI-L-072','Rivals match fare cuts but not fare increases in the kinked-demand market shown. Constant MC rises from $48 to $54, with demand and fixed cost unchanged. Which fare, quantity and profit assessment follow?',
 'Fare $72 and quantity30 remain unchanged; profit falls $180 because MC stays within the MR gap.',
 'Fare $72 and quantity20 remain unchanged; profit falls $120 because MC stays within the MR gap.',
 'Fare $72 and quantity30 remain unchanged; profit is unchanged because price rigidity prevents costs from affecting profit.',
 'Fare $72 and quantity20 remain unchanged; profit is unchanged because price rigidity prevents costs from affecting profit.',
 'The kink is atQ30,P72 and the MR gap36–60. Both cost levels lie inside it, so output and price stay fixed. Costs rise6×30=$180, reducing economic profit by that amount.',
 'Kink(30,72); MRgap36–60.','Separate kinked-demand price rigidity from the effect of higher costs on profit.','(54-48)*30=180')
p('P62I-OLI-L-074','The firm starts at the kink shown. An input improvement lowers constant MC from $48 to $42, while a recurring license fee adds $300 to fixed cost. Demand is unchanged and the firm stays active. Which evaluation is correct?',
 'Price and quantity stay at $72 and30; the $180 variable-cost saving is smaller than the fee, reducing profit $120.',
 'Price and quantity stay at $72 and20; the $120 variable-cost saving is smaller than the fee, reducing profit $180.',
 'Price and quantity stay at $72 and30; the $300 fixed fee must enter MC and outweigh the $180 saving in the output rule.',
 'Price and quantity stay at $72 and20; the $300 fixed fee must enter MC and outweigh the $120 saving in the output rule.',
 'The kink isQ30,P72 with MRgap36–60. MC42 remains in the gap. Variable-cost savings are(48−42)×30=$180, less than the300 fee, so profit falls120. The fixed fee affects profit, not the marginal output decision.',
 'Kink(30,72); MRgap36–60.','Separate fixed-cost profit effects and marginal-cost changes within a rigidity range.','(48-42)*30-300=-120')
p('P62I-OLI-L-004','In the port-services matrix, payoffs are ordered (Row, Column). Which comparison of pure Nash equilibria and joint profit is supported?',
 'A/X and B/Y are equilibria; A/X has joint profit23 versus21 at B/Y, but the larger total does not eliminate B/Y as an equilibrium.',
 'A/Y and B/X are equilibria; A/Y has joint profit23 versus21 at B/X, but the larger total does not eliminate B/X as an equilibrium.',
 'A/X alone is an equilibrium; its joint profit23 versus21 at B/Y makes B/Y fail the Nash condition even without a profitable unilateral deviation.',
 'A/Y alone is an equilibrium; its joint profit23 versus21 at B/X makes B/X fail the Nash condition even without a profitable unilateral deviation.',
 'At A/X, neither Row(14 versus1) nor Column(9 versus2) wants to deviate. At B/Y, neither Row(8 versus2) nor Column(13 versus1) wants to deviate. The totals are23 and21. Nash equilibrium concerns unilateral incentives, not whether another cell has a larger sum.',
 'Matrix AX(14,9),AY(2,2),BX(1,1),BY(8,13).','Compare individual best responses with the joint-profit ranking.')
p('P62I-OLI-L-010','In the delivery-slot matrix, payoffs are ordered (Row, Column). Which joint-payoff reading and pure-equilibrium assessment are correct?',
 'Every cell totals8; none is a pure equilibrium because every cell permits a profitable unilateral deviation.',
 'Every cell totals10; none is a pure equilibrium because every cell permits a profitable unilateral deviation.',
 'Every cell totals8; all are pure equilibria because equal joint totals eliminate unilateral incentives.',
 'Every cell totals10; all are pure equilibria because equal joint totals eliminate unilateral incentives.',
 'The cells are(6,2),(2,6),(2,6),(6,2), all totaling8. Row prefersA againstX andB againstY; Column prefersY againstA andX againstB. Each pure cell has a profitable deviation. Equal sums do not imply mutual best responses.',
 'Matrix AX(6,2),AY(2,6),BX(2,6),BY(6,2).','Distinguish individual best-response stability from equal joint returns.')
p('P62I-OLI-LB-007','Starting from the displayed matrix, a program adds6 to each firm’s payoff only at A/X. All other payoffs stay fixed. Which pure equilibria and joint-payoff conclusion follow?',
 'A/X and B/Y are both equilibria; A/X has the highest joint payoff,32.',
 'A/X and B/Y are both equilibria; A/X has the highest joint payoff,36.',
 'Only A/X is an equilibrium; its highest joint payoff of32 automatically eliminates the unchanged B/Y equilibrium.',
 'Only A/X is an equilibrium; its highest joint payoff of36 automatically eliminates the unchanged B/Y equilibrium.',
 'A/X becomes(16,16); each prefers16 there to the14 from deviating. B/Y remains(7,7), where deviating gives either player5. Both are mutual best responses. A/X totals32, the highest total, but that does not erase B/Y’s unilateral stability.',
 'Baseline AX(10,10),AY(5,14),BX(14,5),BY(7,7).','Recompute best responses after a cell-specific payoff intervention and compare joint payoffs.','2*(10+6)=32')
p('40040','Which price and quantity changes occur after the tax in the graph, and what economic effect do they represent?',
 'Buyer price rises$2, seller receipt falls$2 and quantity falls50 thousand; a tax separates buyer and seller prices.',
 'Buyer price rises$3, seller receipt falls$3 and quantity falls75 thousand; a tax separates buyer and seller prices.',
 'Buyer price rises$2, seller receipt falls$2 and quantity falls50 thousand; both sides still face the same price after tax.',
 'Buyer price rises$3, seller receipt falls$3 and quantity falls75 thousand; both sides still face the same price after tax.',
 'The untaxed point isP12,Q250 thousand. After tax buyers pay14,sellers receive10 andQ200 thousand. The wedge changes both prices and reduces the amount traded.',
 'Original(250,12),taxedQ200,buyer14,seller10.','Interpret both sides of a tax wedge and the equilibrium quantity effect.','14-12=2;12-10=2;250-200=50')
for i in ['ECON-MG-MEDIUM-186','ECON-MG-LEGENDARY-9057','ECON-MG-MEDIUM-189']:
 p(i,'How does the tax change the quantity traded in the graph, and what accounts for the change?',
 'From100 to80 units; the wedge between buyer payment and seller receipt removes some mutually beneficial trades.',
 'From100 to65 units; the wedge between buyer payment and seller receipt removes some mutually beneficial trades.',
 'From100 to80 units; the tax leaves buyer and seller prices identical, so it creates no wedge.',
 'From100 to65 units; the tax leaves buyer and seller prices identical, so it creates no wedge.',
 'Original supply meets demand atQ100. Supply plus tax meets demand atQ80. Buyers pay18 and sellers receive12 at the taxed quantity, so the wedge prevents trades that would occur without tax.',
 'UntaxedQ100,taxedQ80,buyer18,seller12.','Explain the reduced market quantity through a tax wedge rather than mere coordinate identification.')
p('ECON-MG-LEGENDARY-9059','At Q=80 in the tax graph, how much higher is Supply + tax than Supply, and what does this vertical distance mean?',
 '$6; sellers need a buyer price$6 above their net supply price to cover the per-unit tax.',
 '$4; sellers need a buyer price$4 above their net supply price to cover the per-unit tax.',
 '$6; the tax makes sellers willing to receive$6 less net of tax at every quantity.',
 '$4; the tax makes sellers willing to receive$4 less net of tax at every quantity.',
 'AtQ80 the original supply price is12 and supply-plus-tax price18. The vertical gap6 is the tax. The shifted curve expresses the required buyer price inclusive of tax; it does not change the underlying net-of-tax supply schedule.',
 'AtQ80 Supply12,Supply+tax18.','Interpret a seller-side tax representation in buyer-price units.','18-12=6')
p('ECON-MG-HARD-283','What is the full per-unit tax in the graph, and why is the increase in buyer price alone insufficient to measure it?',
 '$6; buyers pay$3 more and sellers receive$3 less than before.',
 '$8; buyers pay$4 more and sellers receive$4 less than before.',
 '$6; only the buyer-price increase is part of the tax, and the seller-receipt decline should be excluded.',
 '$8; only the buyer-price increase is part of the tax, and the seller-receipt decline should be excluded.',
 'The original price is15; taxed buyers pay18 and sellers receive12. The wedge is18−12=6, combining each side’s3 burden. A tax wedge uses both prices, not just the change faced by buyers.',
 'P0=15,Pb18,Ps12.','Measure the full tax wedge and distinguish it from one side’s burden.','18-12=6;18-15=3;15-12=3')
for i in ['ECON-MG-HARD-284','ECON-MG-HARD-274']:
 p(i,('A student uses the original quantity to compute tax revenue. ' if i.endswith('284') else '')+'Which revenue calculation and explanation correctly use the graph?',
 '$6×80=$480; collect the full wedge on units actually traded after tax.',
 '$6×65=$390; collect the full wedge on units actually traded after tax.',
 '$6×80=$480; apply the tax to the original untaxed transactions even if some no longer occur.',
 '$6×65=$390; apply the tax to the original untaxed transactions even if some no longer occur.',
 'The wedge is18−12=$6 and the taxed quantity80, so receipts are$480. The original100 includes20 transactions prevented by the tax; revenue cannot be collected on those missing trades.',
 'Pb18,Ps12,taxedQ80,originalQ100.','Use the full wedge and post-tax tax base for revenue.','(18-12)*80=480')
p('ECON-MG-LEGENDARY-9055','A clerk uses only the buyer-price increase as the tax rate and multiplies by the original quantity, reporting$300. Which correction addresses both errors?',
 '$6 on80 units gives$480; use both sides of the wedge and the post-tax quantity.',
 '$8 on70 units gives$560; use both sides of the wedge and the post-tax quantity.',
 '$6 on80 units gives$480; the buyer-price increase alone and the untaxed quantity are the correct definitions.',
 '$8 on70 units gives$560; the buyer-price increase alone and the untaxed quantity are the correct definitions.',
 'The graph hasPb18,Ps12 and taxedQ80. Full tax6 times80 gives480, which is180 above the report. Using only the buyer increase3 misses the seller burden; using100 wrongly includes trades that no longer occur.',
 'OriginalP15,Q100; taxedPb18,Ps12,Q80.','Diagnose simultaneous errors in the tax rate and revenue base.','(18-12)*80=480;480-300=180')
p('40041','A proposal halves the per-trip tax shown in the rideshare graph. Keep the straight demand and supply curves fixed. Which revenue change and interpretation are correct?',
 '$800,000 to$450,000; extra trips offset part, but not all, of the lower tax rate.',
 '$600,000 to$350,000; extra trips offset part, but not all, of the lower tax rate.',
 '$800,000 to$450,000; a tax-rate cut leaves the number of trips fixed by definition.',
 '$600,000 to$350,000; a tax-rate cut leaves the number of trips fixed by definition.',
 'The original tax wedge is14−10=4 at200 thousand trips; untaxedQ is250 thousand. Halving the tax to2 moves quantity halfway to250, or225 thousand, under the fixed linear curves. Receipts change4×200,000=800,000 to2×225,000=450,000. The quantity response partially offsets the rate cut.',
 'TaxedQ200 thousand,Pb14,Ps10; untaxedQ250 thousand.','Evaluate a tax-rate change with an endogenous revenue base.','4*200000=800000;2*((200000+250000)/2)=450000')
# Keep ordinary spacing in authored money and quantity phrases.
import re
for i in list(R):
 if O[i]['primaryConceptId'] in ['oligopoly','tax-wedges-and-revenue']:
  for field in ['q','feedback']:
   if field in P[i]:P[i][field]=re.sub(r'(?<=[a-zA-Z])(?=\$|\d)', ' ',P[i][field])
  P[i]['options']=[re.sub(r'(?<=[a-zA-Z])(?=\$|\d)', ' ',x) for x in P[i]['options']]
save();print('Graph proposals prepared:',len(R))
