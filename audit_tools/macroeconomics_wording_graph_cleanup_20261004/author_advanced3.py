from draft_utils import *
def F(i,stem,choices,feedback,kind,new):draft(i,stem,choices,feedback,inference={'type':kind,'new':new})
F('PM2B2-INDEX-L-003','A $40,000 threshold at CPI100 is adjusted each year using the previous year\'s inflation. CPI rises to110 and then121, while the second-year threshold has received only the first10% increase. If inflation now stops and the delayed second adjustment arrives, does that establish that the rule protected purchasing power throughout?',[
 'No. The threshold is temporarily $4,400 below full indexation; catching up later does not remove the earlier purchasing-power shortfall.',
 'Yes. Eventual catch-up proves there was no interval in which the real threshold differed from its original value.',
 'No. The shortfall is $8,400 because the rule made no adjustment before the second year.',
 'Yes. The lagged threshold is already $48,400 because each announced CPI rise enters immediately.'],
 'The paid threshold is$44,000 versus the current-indexed$48,400, a$4,400 gap. With prices then fixed, the delayed adjustment can restore the level, but the intervening real shortfall still occurred. Endpoints and timing are distinct.', 'counterfactual','Distinguish eventual catch-up from continuous real protection under lagged indexation.')
F('ECON-NL-LEGENDARYBOSS-9113','A $140 benefit rises by the previous year\'s4% CPI increase. This year both CPI and the recipient\'s own living costs rise6%. An official blames the real loss on a mismatch between the CPI basket and the recipient\'s purchases. Does that explanation fit?',[
 'No. The price measures agree here; the roughly1.9% real loss comes from using last year\'s inflation.',
 'Yes. Any real loss under indexation proves that the recipient\'s basket rose faster than CPI.',
 'No. The benefit gains about1.9% in real value because4% adjustment exceeds6% inflation.',
 'Yes. The benefit rises10%, but differing index bases turn that gain into a real loss.'],
 'The real factor is1.04/1.06≈0.9811. Because CPI and the recipient\'s costs rise at the same rate, basket mismatch cannot explain the loss. The timing mismatch is sufficient.', 'diagnosis','Isolate indexation lag rather than household-basket mismatch as the source of loss.')
F('PM2B2-INDEX-LB-001','A $180 benefit rises by last year\'s4% CPI increase while this year\'s living costs rise6%. Suppose an alternative rule used current CPI, but the recipient\'s own costs still rose faster than that CPI. Would removing the lag necessarily preserve this person\'s purchasing power?',[
 'No. It would remove the timing error, but a mismatch between current CPI and the person\'s costs could still leave a real loss.',
 'Yes. Any current-period CPI adjustment preserves every person\'s purchasing power regardless of consumption patterns.',
 'No. The original4% adjustment already raises real purchasing power by about1.9%, making catch-up unnecessary.',
 'Yes. Removing the lag also forces every household\'s cost-of-living increase to equal CPI.'],
 'The original real factor1.04/1.06 gives about a1.9% loss. Current-period indexation addresses the lag. It does not guarantee that the chosen index matches each recipient\'s own price exposure.', 'counterfactual','Separate the remedy for timing lag from an independent basket-coverage limitation.')
F('LG-Q-9120','A firm spends $180 repeatedly updating posted prices, and households make extra account transfers to avoid idle cash. Inflation is fully anticipated. A proposal indexes every nominal debt contract and claims to eliminate these two costs. Is that claim justified?',[
 'No. Indexing debt can address contract exposure, but menu and shoe-leather costs still use resources even when inflation is anticipated.',
 'Yes. Once real debt payments are fixed, firms no longer need to update prices and households no longer avoid idle cash.',
 'No. The two activities are borrower-lender transfers, so their cost is independent of resources used.',
 'Yes. Perfectly anticipated inflation cannot create any resource cost, with or without debt indexation.'],
 'Repricing is a menu cost; rearranging money holdings is a shoe-leather cost. Debt indexation changes contract payments but does not remove the underlying incentive to reprice or economize on cash. Forecast accuracy does not make those activities costless.', 'policy evaluation','Test a contract-indexation remedy against costs outside the contract channel.')
F('LG-Q-9125','A $200 fixed nominal debt was agreed with expected inflation2%, but actual inflation is7%. Firms also incur real repricing costs. An analyst nets borrowers\' gains against lenders\' losses and concludes that inflation has no social cost in this case. What is missing?',[
 'The debt surprise redistributes purchasing power, but repricing uses real resources that do not disappear when transfers are netted.',
 'Borrowers\' gains are additional real output, so they necessarily exceed all repricing costs.',
 'Lenders gain from higher-than-expected inflation, so netting the debt transfer is impossible.',
 'Repricing is itself only a transfer between borrower and lender, with no resource use.'],
 'Unexpected inflation reduces the real value of fixed repayments, favoring borrowers over lenders. That redistribution is distinct from resources spent changing prices. Offsetting financial gains and losses therefore does not eliminate menu costs.', 'diagnosis','Identify a resource cost omitted by an argument based only on net financial transfers.')
F('LG-Q-9124','A household keeps $180 in currency as prices rise25%, with no interest paid. An analyst predicts the same dollar amount of real purchasing-power loss from another25% price rise while the cash balance stays fixed. Is that prediction correct?',[
 'No. The first rise removes20% of initial real balances; another equal inflation rate acts on a smaller remaining real balance.',
 'Yes. Equal percentage inflation always removes an equal absolute amount of purchasing power from fixed nominal cash.',
 'No. The first rise removes25% of nominal currency, leaving fewer physical dollars to tax next time.',
 'Yes. The household\'s real cash balance is fixed because its nominal dollars do not change.'],
 'Each25% price rise multiplies real balances by1/1.25=0.8. After the first rise only80% of the original real balance remains; the next20% erosion applies to that smaller base. Nominal dollars stay$180 throughout.', 'assumption test','Recognize erosion of the real balance on which a repeated inflation loss acts.')
F('PM2C2-ITAX-LB-001','A household owes a fixed nominal $300. Prices fall10%. A lender proposes reducing nominal principal by10% to keep the debt\'s real burden at its pre-deflation level. Would that adjustment accomplish the stated goal?',[
 'Yes. Without adjustment the real burden rises about11.1%; reducing principal to $270 offsets the price decline exactly.',
 'No. Principal must fall11.1% because the unadjusted real-burden increase and required nominal reduction have the same percentage.',
 'Yes. The adjustment is unnecessary, however, because fixed nominal debt always has a fixed real burden.',
 'No. Deflation lowers the real burden already, so preserving it requires a larger nominal principal.'],
 'The unadjusted real factor is1/0.9≈1.1111. With a10% principal reduction, the factor becomes0.9/0.9=1. A reciprocal11.1% real increase does not mean the offsetting nominal adjustment must also be11.1%.', 'policy evaluation','Evaluate a nominal-contract adjustment that neutralizes a real deflation burden.')
F('LG-Q-9121','Government finances $160 of purchases by creating money. With stable velocity and fixed long-run real output, an official calls this costless finance because no statutory tax bill is issued. What would a comparison of households with different cash holdings reveal?',[
 'Existing money holders lose purchasing power as prices rise; larger unprotected money balances create greater exposure even without a tax bill.',
 'All households bear equal real losses because the government purchase amount is the same for everyone.',
 'No household loses purchasing power because money creation adds the same amount of real output as the purchases.',
 'Only borrowers lose purchasing power, while holding currency fully protects households from inflation.'],
 'Money financing gives government a claim on real goods under the stated output constraint. Inflation erodes M/P for existing money holders. The burden depends on balances and timing rather than equal statutory assessments, so absence of a tax bill does not establish costless finance.', 'policy evaluation','Evaluate the incidence and costless-finance claim using unequal money holdings.')
F('ECON-SP-FINALBOSS-4015','Productivity raises potential output from500 to600, while a temporary demand expansion raises actual output to700. Officials propose returning demand to a level that would restore output500. Would reaching the old output benchmark close the current gap?',[
 'No. It would replace a100-unit inflationary gap with a100-unit recessionary gap relative to the new potential600.',
 'Yes. The old potential500 remains the correct target even after productive capacity increases.',
 'No. Actual output700 is now potential, so any reduction below700 destroys capacity.',
 'Yes. Demand restraint automatically reverses the productivity gain and returns LRAS to500.'],
 'Current output exceeds new potential by700−600=100. Returning actual output to500 would place it100 below that new benchmark. Demand stabilization should not mistake the old capacity level for the current one.', 'policy evaluation','Evaluate an output target against updated productive capacity.')
F('ECON-SP-MEDIUMBOSS-3008','Potential output rises from1700 to2040 after a productivity improvement, and temporary demand expansion raises actual output to2380. An official calls the full680-unit actual-output gain permanent. What would happen if demand pressure disappeared while the productivity gain remained?',[
 'Output could settle near2040: the340-unit capacity gain remains, while the340-unit positive demand gap closes.',
 'Output must return to1700 because any reduction in demand erases all productivity gains.',
 'Output remains2380 because reaching a level once makes it productive capacity.',
 'Output falls below1700 because a productivity improvement lowers the long-run supply of output.'],
 'Capacity increases2040−1700=340, while actual output exceeds it by2380−2040=340. Removing temporary demand pressure need not remove the independently established productivity gain.', 'short-run/long-run reconciliation','Separate the persistent capacity gain from the temporary demand-driven part of observed growth.')
F('ECON-SP-LEGENDARYBOSS-9106','Productivity raises potential output from1100 to1320, and demand expansion raises actual output to1540. A proposal promises to sustain1540 indefinitely through demand support alone, with no further capacity change. What limitation does the updated output gap reveal?',[
 'The220-unit gap above1320 is demand-driven; sustained demand support alone does not create the additional capacity needed for1540.',
 'The440-unit increase above1100 is entirely capacity growth, so no further supply improvement is needed.',
 'There is no gap because1320 replaces1100 only after demand returns to its old level.',
 'The economy is220 units below potential, so permanently higher demand removes a recessionary gap.'],
 'The capacity gain is220, but actual output1540 exceeds new potential1320 by another220. Demand can sustain pressure on prices and activity; it is not itself an increase in the productive benchmark.', 'policy evaluation','Assess the feasibility of a permanent demand-only output target above updated capacity.')
F('ECON-NL-LEGENDARY-9047','At comparable base prices, Cedar has nominal GDP $960 billion, deflator120 and32 million residents; Delta has $1,320 billion, deflator150 and44 million residents. Does the real-GDP-per-person comparison establish that every Cedar resident has a higher living standard than every Delta resident?',[
 'No. The averages are $25,000 and $20,000, but averages alone do not establish how output or income is distributed among residents.',
 'Yes. Once the average is deflated, it gives the real income of each individual resident.',
 'No. Both averages are $30,000 because comparable base prices make deflation unnecessary.',
 'Yes. Delta\'s larger nominal GDP necessarily means every Cedar resident is poorer regardless of population.'],
 'Real totals are960/1.2=800 and1320/1.5=880 billion. Dividing by populations gives$25,000 and$20,000 per person. Those are averages of measured production, not individual income observations or complete welfare measures.', 'identification limit','Distinguish a real per-capita ranking from an unsupported claim about every person.')
F('LG-Q-9107','In a stated deposit-multiplier model, a central bank seeks an $800 deposit contraction. The estimated actual multiplier is4, while the textbook maximum is10. An $80 reserve removal based on the maximum contracts deposits by only $320. What explains the miss?',[
 'The operation used an overly large multiplier; under the estimate, a total $200 reserve removal is needed for the target.',
 'The operation removed too many reserves; the smaller actual multiplier requires only $32 of reserve removal.',
 'The multiplier estimate must be ignored because a theoretical maximum is always the realized response.',
 'The contraction proves reserves must be added to reduce deposits in the same model.'],
 'With actual multiplier4, removing80 predicts a320 contraction, matching the miss. Reaching800 requires800/4=200 total reserve removal,120 beyond the original operation. A maximum can overstate actual deposit response; this remains a stipulated model exercise.', 'diagnosis','Use an observed policy miss to distinguish actual from maximum multiplier calibration.')
F('LG-Q-9113','In a simplified reserve-ratio exercise, a bank has deposits of $2,200 and reserves of $440. The requirement rises from10% to15%, with balances unchanged. The bank was already unwilling to lend because no applicant met its credit standards. Does the reserve change establish a $110 reduction in actual lending?',[
 'No. Excess reserves fall from $220 to $110, but credit standards were already binding; reserve capacity alone does not determine actual lending.',
 'Yes. Every dollar decline in excess reserves must remove a dollar of loans regardless of borrower quality.',
 'No. Excess reserves rise to $330 because the larger requirement increases lending capacity.',
 'Yes. The requirement writes down bank capital by $110, forcing the same loan reduction.'],
 'Required reserves rise from220 to330, leaving110 excess. That accounting change does not reveal an actual loan reduction when the bank already rejects applicants. Reserve availability, capital and creditworthiness are distinct constraints.', 'binding constraint','Identify borrower quality as the preexisting binding condition rather than infer lending mechanically from reserves.')
F('P52B-S3-MFM-LB-002','A household has $280 in checking, $560 in savings and $280 in a small time deposit. Under current U.S. definitions, it moves the time deposit into savings. A report records M1 up $280 and M2 up $280, attributing both to this transfer. Can that account be reconciled without another transaction?',[
 'No. M1 rises $280, but M2 is unchanged; the reported M2 increase requires another source or a reporting error.',
 'Yes. Entering savings creates $280 of new broad money even though the funds were already in a time deposit.',
 'No. M1 must fall $280 because savings is excluded while small time deposits are included.',
 'Yes. Moving any deposit between accounts increases both aggregates by the amount transferred.'],
 'Under the stated current convention, savings belongs to M1 and small time deposits do not; both belong to M2. The transfer changes the narrower classification while leaving broad money unchanged. It cannot alone explain both reported increases.', 'diagnosis','Identify an aggregate change that cannot result from a pure within-M2 portfolio transfer.')
F('PMOE-NER-LB-002','A British product\'s pound price rises6%, the pound depreciates8% against the dollar and U.S. sales volume rises5%. An analyst says the depreciation must have reduced the exporter\'s dollar revenue. How does the price-volume decomposition bear on that claim?',[
 'Dollar unit revenue falls about2.5%, but higher volume more than offsets it, raising total dollar revenue about2.4%.',
 'Dollar unit revenue rises14%, so volume is irrelevant to the total revenue increase.',
 'Dollar unit revenue falls8%, and multiplying by the5% volume gain guarantees total revenue also falls8%.',
 'Total dollar revenue rises about2.4%, proving that the dollar price paid by each buyer also rose.'],
 'Dollar unit price changes by1.06×0.92−1=−2.48%. Total revenue changes by1.06×0.92×1.05−1=2.396%. The quantity response reverses the unit-revenue decline, so exchange-rate direction alone does not determine total receipts.', 'competing mechanisms','Separate the unit-price effect from the volume response in an observed revenue change.')
F('PMOE-NER-LB-003','The dollar-per-yen quote rises10% then falls10%, and a yen-denominated asset gains4%. A costless hedge could have fixed the original conversion rate. A dealer says the currency changes cancel, so the hedge would not change the dollar return. Is that claim correct?',[
 'No. The unhedged return is2.96% versus4% with the hedge; restoring the original quote alone requires about1.01% appreciation.',
 'Yes. The changes cancel exactly, giving4% with or without the hedge and no remaining quote difference.',
 'No. The unhedged return is3% exactly; a1% appreciation exactly restores the currency quote.',
 'No. The unhedged return is5.04%, so the currency movement improves on the fixed-conversion return.'],
 'The quote factor is1.10×0.90=0.99, so the unhedged asset return is0.99×1.04−1=2.96%. A fixed original conversion preserves the4% yen return under the stated costless hedge. Restoring the quote requires1/0.99−1≈1.01%, not an exact1%.', 'counterfactual','Evaluate a fixed-conversion hedge rather than treating opposite percentage moves as cancellation.')
F('PM2B3-PROD-LB-001','A firm produces2,100 units at10 units per labor hour. Training raises productivity to12 units per hour while required output rises to2,520. Management plans to cut total hours because of the training. Can it meet the new output requirement with fewer hours if no further productivity change occurs?',[
 'No. Both plans require210 hours; a cut would require further productivity gains or a lower output target.',
 'Yes. New required hours are175 because only the productivity change affects labor needs.',
 'No. New required hours are252 because only output growth affects labor needs.',
 'Yes. A rise in productivity guarantees fewer total hours regardless of the quantity required.'],
 'Initial hours are2,100/10=210; new hours2,520/12=210. The proportional output increase uses the full productivity gain. The output requirement is a constraint that prevents cutting hours under unchanged new productivity.', 'binding constraint','Test an hours-cut proposal against the output requirement and available productivity.')
save()
