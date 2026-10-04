from draft_utils import *
def F(i,stem,choices,feedback,kind,new):draft(i,stem,choices,feedback,inference={'type':kind,'new':new})
F('P52A-AD-EL-001','Consumer confidence and foreign income rise while expected business profits fall. At each price level, total planned spending nevertheless declines. What can be inferred about the three spending channels?',[
 'The fall in investment exceeds the combined increases in consumption and net exports.',
 'Investment falls, but its decline must be smaller than the increases in consumption and net exports.',
 'Consumption and net exports fall, outweighing the investment increase.',
 'The observation implies government purchases fell, even though the three stated channels could not reduce AD.'],
 'Confidence raises consumption, foreign income raises export demand, and lower expected profits reduce investment. Given a net spending decline with these changes, investment\'s negative effect must exceed the other two positive effects.', 'competing mechanisms','Infer the dominant channel from the observed net demand change.')
F('P52A-AD-L-001','The domestic price level rises, consumer confidence strengthens and foreign income declines. At the original price level, planned spending would be unchanged. What explains a fall in quantity demanded at the new, higher price level?',[
 'The confidence and export-demand shifts offset at the original price; the price rise reduces quantity demanded along the resulting AD curve.',
 'The price rise shifts AD left, while confidence and foreign income merely move the economy along it.',
 'The offsetting spending changes guarantee unchanged quantity demanded even at a different price level.',
 'The foreign-income decline must outweigh confidence at the original price, despite the stated unchanged spending there.'],
 'Confidence and foreign income exert opposite shift effects. The fixed-price counterfactual says their net effect there is zero. The higher price then explains lower quantity demanded along the resulting schedule, not a new price-caused shift.', 'counterfactual','Use a fixed-price comparison to separate net curve shifts from movement.')
F('P52A-AD-L-003','Businesses become optimistic, households become pessimistic and the currency depreciates. Assume the usual net-export response to depreciation. Total planned spending at a fixed price level remains unchanged. What would happen without the household-confidence decline, holding the other changes fixed?',[
 'Spending would rise; stronger investment and net exports are being offset by weaker consumption.',
 'Spending would fall; household pessimism is the only expansionary force in the scenario.',
 'Spending would remain unchanged; a zero observed net change means none of the components changed.',
 'Spending would rise only if government purchases also changed, since the stated channels cannot affect AD.'],
 'Business optimism raises investment and depreciation supports net exports. Pessimism lowers consumption enough to offset them. Removing that negative channel leaves a positive net spending effect.', 'counterfactual','Remove one offsetting channel from an observed zero net outcome.')
F('P52A-AD-LB-001','The price level rises, taxes fall and foreign income declines. Despite the higher price level, the quantity of domestic output demanded increases. What must be true about the two shifts in spending plans?',[
 'The tax-cut stimulus exceeds the export-demand loss by enough to overcome the price-level restraint on quantity demanded.',
 'The export-demand loss exceeds the tax-cut stimulus, because a higher price level directly shifts AD right.',
 'The two spending shifts exactly cancel, leaving the price rise to increase quantity demanded along AD.',
 'The observation proves the price rise strengthened tax-cut spending rather than causing movement along AD.'],
 'A higher price level reduces quantity demanded along AD. Lower taxes shift AD right, while lower foreign income shifts it left. For quantity demanded to rise despite the price effect, the positive net shift must more than offset that restraint.', 'competing mechanisms','Infer the necessary dominance of a shift from an outcome opposing the price-level effect.')
F('P52A-AD-LB-003','Consumer spending plans rise by $100 at every price level. An unexpected price-level increase then leaves the observed quantity of output demanded unchanged. Does the unchanged quantity mean aggregate demand did not shift?',[
 'No. AD shifted right, but movement along the new curve at the higher price offset the increase in observed quantity.',
 'Yes. An unchanged observed quantity proves that spending plans did not change at any price level.',
 'No. The higher price itself shifted AD left, while higher spending caused movement along the old curve.',
 'Yes. Price-level changes and spending-plan changes are both movements along one unchanged AD curve.'],
 'The $100 fixed-price spending increase is an AD shift. A higher price lowers quantity demanded along the new curve. An unchanged final quantity can conceal both changes; it does not establish an unchanged demand schedule.', 'diagnosis','Explain how unchanged observed quantity can coexist with an AD shift.')
F('LG-Q-307','A bank has $50 million in assets and $47 million in liabilities. Asset values fall 8%. Management proposes borrowing $2 million to restore positive capital. Would borrowing solve the stated problem?',[
 'No. Capital falls to −$1 million, and borrowing adds equal assets and liabilities without repairing that shortfall.',
 'Yes. Capital falls to −$1 million, but a $2 million loan raises capital to $1 million.',
 'Yes. Capital falls by only 8% of its initial $3 million, leaving enough equity to absorb the loan.',
 'No. Capital stays at $3 million, so the issue is solely a shortage of reserves.'],
 'The loss is 0.08×50 = $4 million. Assets become $46 million against $47 million of liabilities, so capital is −$1 million. Borrowing may add liquidity but also creates a liability; new equity or another loss-absorbing improvement is needed to repair solvency.', 'binding constraint','Distinguish a liquidity loan from a remedy for negative capital.')
F('LG-Q-313','A bank has $100 million in assets and $92 million in liabilities. Asset values fall 6%. Its manager says the bank lost only 6% of its capital and can absorb another identical loss. How should that claim be evaluated?',[
 'The first loss uses 75% of capital, leaving $2 million; another $6 million loss would make capital negative.',
 'The first loss uses 6% of capital, leaving $7.52 million; another $6 million loss would leave it solvent.',
 'The first loss uses 75% of capital, but unchanged liabilities guarantee that the next loss cannot exhaust equity.',
 'The first loss makes capital negative immediately because any asset-price decline creates insolvency.'],
 'Initial capital is $8 million. The $6 million loss consumes 6/8=75%, leaving $2 million. A second $6 million loss exceeds the remaining buffer; leverage magnifies asset losses relative to capital.', 'binding constraint','Use the residual capital buffer to test the bank\'s loss-absorption claim.')
F('LG-Q-326','In a hypothetical reserve-requirement system, a bank is below required reserves but has adequate capital. It can borrow reserves overnight or make a new loan by crediting a borrower\'s deposit. Which action addresses today\'s reserve shortfall, and why?',[
 'Borrow reserves; a new loan creates a deposit but does not itself provide the reserves needed for settlement or the requirement.',
 'Create the loan deposit; every dollar of a new deposit automatically creates a dollar of central-bank reserves.',
 'Create the loan deposit; adequate capital makes the separate reserve requirement irrelevant.',
 'Borrow reserves; the borrowing also raises capital by the full amount and permanently removes all lending constraints.'],
 'Reserve liquidity and capital are separate constraints. Borrowing reserves addresses the immediate reserve shortage while adding a liability. Creating a loan and deposit does not create central-bank reserve balances and can add payment and reserve needs.', 'binding constraint','Compare feasible actions against the specific reserve constraint rather than generic lending capacity.')
F('ECON-NL-LEGENDARY-9023','A fixed basket contains 3 tickets and 2 repairs. Base prices are $8 and $18; last year the basket cost $72. This year CPI is 135 and tickets cost $9 each. An agency plans to rebase last year\'s CPI to 100. Would that change the implied repair price or this year\'s inflation?',[
 'No. Repairs still cost $27 and annual inflation is 12.5%; rebasing changes index units, not the underlying price ratio.',
 'Yes. Repairs fall to $24 and inflation to zero because the new base year removes the earlier price rise.',
 'No. Repairs remain $27, but annual inflation is 35% because this year\'s old index was 135.',
 'Yes. Inflation becomes 35% even though basket prices are unchanged, because the base now measures last year.'],
 'Base cost is $60, so current cost is $81. Subtracting $27 for tickets leaves $54 for two repairs. Inflation is 81/72−1=12.5%. Rebasing would express the current index as112.5 with last year100, preserving both prices and the growth ratio.', 'assumption test','Distinguish an index-unit change from actual price and inflation changes.')
F('ECON-NL-LEGENDARY-9025','A basket has 4 units of A at a base price of $6 and an unknown quantity of B at $12; base cost is $72. Current prices are $9 and $15. Next period the same basket costs $100.80. An analyst says A must have risen in price next period. Does the basket evidence establish that?',[
 'No. Current CPI is about133.3 and next inflation is5%, but the total basket increase does not identify which good became dearer.',
 'Yes. CPI about133.3 and inflation5% imply every item rose5%, including A.',
 'No. Current CPI is140 and next inflation40%, but the total does not identify the individual price changes.',
 'Yes. Knowing both basket totals uniquely determines each next-period price even without a second price observation.'],
 'There are4 units of B: (72−4×6)/12=4. Current cost is96 and CPI133.3; 100.80/96−1=5%. Many combinations of next-period A and B prices can produce that total, so the individual A change is not identified.', 'identification limit','Separate aggregate basket inflation from an unobserved individual-good price change.')
F('P52A-CPI-LB-002','A basket contains 5 units of A and 4 of B. Base prices are $8 and $15; current prices $10 and $18; next prices $11 and $19. A report divides the next cost increase by the base-year cost. Would simply rebasing the index correct its inflation calculation?',[
 'Only if it also uses the preceding period as the denominator; current CPI is122 and next inflation is about7.4%.',
 'Yes, any new base fixes the denominator; current CPI is122 and next inflation is9%.',
 'No, annual inflation must always divide by the original base; current CPI is122 and next inflation is9%.',
 'Yes, using next year as the base gives the correct annual rate of about6.9%.'],
 'Basket costs are100,122 and131. The annual increase is9/122≈7.4%, not9/100 or9/131. Index rebasing rescales levels; the substantive correction is to compare the increase with the immediately preceding cost.', 'diagnosis','Explain why relabeling an index base is not a substitute for correcting the inflation denominator.')
F('P52A-CPI-LB-001','A fixed-basket index rises from125 to130 while a $270 payment rises3%. The recipient\'s own cost of living rises only2%. How can the payment lose purchasing power under one comparison and gain it under the other?',[
 'The payment loses about1% against the index basket but gains about1% against the recipient\'s basket because their price changes differ.',
 'It gains against both baskets because a larger nominal payment always buys more goods.',
 'It loses5% against the index basket and gains1% against the recipient\'s basket because index points are percentage changes.',
 'The comparisons are inconsistent because one payment must have the same real change under every price measure.'],
 'The index basket rises4%, giving a real factor1.03/1.04≈0.9904. The recipient\'s cost rises2%, giving1.03/1.02≈1.0098. Different relevant consumption baskets can yield different real changes without contradiction.', 'competing mechanisms','Reconcile purchasing-power conclusions using different applicable price changes.')
F('ECON-EC-LEGENDARYBOSS-20000','A payment of $110 rises3% as its fixed-basket index rises from125 to130. A clerk proposes rebasing the index to100 in the initial period so the payment will keep pace. Would rebasing eliminate the real loss?',[
 'No. The rebased index rises100 to104, so a3% payment rise still falls short of4% inflation.',
 'Yes. Rebasing makes the five-point increase disappear and therefore removes the inflation loss.',
 'No. The rebased index rises100 to105, so the real payment necessarily falls exactly2%.',
 'Yes. A new base year changes the payment\'s nominal growth from3% to4%.'],
 'Rebasing divides both index values by125 and multiplies by100, giving100 and104. It changes labels, not the4% price ratio. The payment\'s real factor remains1.03/1.04, about a0.96% decline.', 'assumption test','Reject a rebasing remedy for an unchanged real purchasing-power loss.')
F('ECON-NL-LEGENDARYBOSS-9108','A basket costs $200 before its index rises from160 to168. A clerk budgets $216 by treating the eight-point increase as8%. If the index were rebased so the initial value was100, what would happen to the purchasing-power calculation?',[
 'The new index would be105 and the basket would still cost $210; the clerk\'s $6 excess budget would remain.',
 'The new index would be108 and the basket would still cost $216; rebasing validates the clerk\'s method.',
 'The new index would be105, but the basket cost would return to $200 because the old price increase is removed.',
 'The basket would cost $336 because rebasing requires applying168% to its old dollar price.'],
 'The price ratio is168/160=1.05, so cost is$210. Rebasing gives105 and leaves that ratio unchanged. An eight-point rise on a160 index is not8% inflation; changing the base cannot alter the needed dollars.', 'counterfactual','Check whether an index rebasing changes a real budget error.')
F('ECON-NL-ELITE-331','Imported household energy becomes dearer while domestic investment equipment becomes cheaper. An analyst sees rising CPI but a falling GDP deflator and declares one series wrong. What should be checked before accepting that claim?',[
 'Their coverage: imported consumption enters CPI, while domestic equipment enters the GDP deflator, so the movements can be consistent.',
 'Only which series has the larger base-year number; a higher base index must show higher inflation.',
 'Whether imports reduced net exports; that makes their prices part of the domestic GDP deflator.',
 'Whether nominal GDP rose; if it did, both price indexes must also have risen.'],
 'Household purchasing power and domestic-production prices use different coverage. More expensive imported energy can raise CPI while cheaper domestically produced equipment lowers the deflator. Conflicting directions do not by themselves establish a data error.', 'diagnosis','Evaluate an apparent conflict between two legitimate price measures.')
F('PM2B2-DEF-L-002','A household grant rises $2,000 to $2,160 as CPI rises125 to135. Nominal GDP rises8% and the GDP deflator4%. A report applies the8% consumer-price increase to both the grant and GDP, concluding that both real values are unchanged. Which part fails?',[
 'The grant conclusion is valid, but real GDP rises about3.8% because GDP needs its own4% price change.',
 'Both conclusions are valid because identical nominal growth requires identical real growth.',
 'The GDP conclusion is valid, but the grant gains about3.8% because households should use the GDP deflator.',
 'Both real values rise8% because neither consumer nor output prices affect real measurement.'],
 'The grant and CPI each rise8%, so its purchasing power is constant. Real GDP uses1.08/1.04−1≈3.8%. The incorrect inference comes from using the consumer price measure for domestic output.', 'diagnosis','Locate the incorrect index choice in an otherwise partly valid report.')
F('ECON-NL-LEGENDARYBOSS-9111','A country produces only $160 of export machinery and households consume only imported food. Machinery prices fall4% while food prices rise6%, with quantities fixed. Would indexing household payments to the GDP deflator preserve their purchasing power?',[
 'No. Payments would fall4% while food costs rise6%, reducing their real value by about9.4%.',
 'Yes. A4% payment reduction matches the prices of domestic output and therefore household purchases.',
 'No. Payments would rise6% while food prices fall4%, increasing their real value by about10.4%.',
 'Yes. Exported machinery and imported food have equal weight in both price indexes.'],
 'The deflator follows domestic machinery, while CPI follows imported food in this deliberately separated economy. A deflator-indexed payment has real factor0.96/1.06≈0.9057, a9.4% loss. Domestic-output price changes are the wrong compensation basis for these consumers.', 'policy evaluation','Assess the purchasing-power consequence of choosing the wrong index.')
F('PM2B2-DEF-LB-001','A country initially produces $200 of export machinery and households buy only imported food. Machinery prices fall4% and food prices rise6%, with quantities fixed. An analyst deflates the new nominal GDP using the food-price increase and reports a real contraction. Is that result sound?',[
 'No. Real machinery output is unchanged; dividing the4% nominal GDP decline by consumer-price growth uses the wrong price measure.',
 'Yes. Real GDP falls about9.4% because imported food prices determine the prices of all domestic output.',
 'No. Real GDP rises6% because household prices rise while domestic output prices fall.',
 'Yes. Any decline in nominal GDP proves real domestic production has declined.'],
 'Nominal GDP becomes$192, and the deflator factor is0.96. Dividing192 by0.96 returns$200 in base prices. Using1.06 instead would falsely suggest a9.4% real decline because CPI covers imported food rather than domestic machinery.', 'diagnosis','Reject a false real-GDP decline caused by an inappropriate deflator.')
save()
