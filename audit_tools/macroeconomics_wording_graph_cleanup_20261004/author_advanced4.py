from draft_utils import *
def F(i,stem,choices,feedback,kind,new):draft(i,stem,choices,feedback,inference={'type':kind,'new':new})
F('ECON-NL-LEGENDARYBOSS-9118','A plant initially produces1,000 units in100 hours. Output then rises20% while hours rise25%. Management claims productivity improved and that the current1,200 units could be produced in the original100 hours without any further change. Is that plan feasible at observed productivity?',[
 'No. Productivity fell4% to9.6 units per hour;100 hours would produce960 units, so meeting1,200 requires a further productivity improvement.',
 'Yes. Output grew20%, so productivity is12 units per hour regardless of the increase in hours.',
 'No. Productivity fell25%, because output growth is irrelevant to output per hour.',
 'Yes. Faster hours growth raises productivity by5%, enough to maintain the higher output with fewer hours.'],
 'Observed output per hour is1,200/125=9.6, down from10. With that productivity,100 hours yield960, not1,200. A claim about feasible output must use the observed output-per-hour ratio, not total output growth.', 'binding constraint','Test an hours-reduction plan using the actual productivity implied by observed output and labor.')
F('LG-Q-9122','Money is $200 and velocity is5. A report gives price level2 and real output1,000. An independent production count confirms real output1,000 while money and velocity are verified. Under MV=PY, which reported measure must be reconsidered?',[
 'The price level must be1 rather than2; nominal spending is1,000, which cannot support that output at price2.',
 'The price level must be4; a larger output measure requires multiplying nominal spending by prices.',
 'The verified real output must be500 regardless of the independent count; accounting identities cannot reveal a price-measure error.',
 'None; nominal spending1,000 and real output1,000 are consistent with any price level.'],
 'Verified MV=200×5=1,000. If verified real output is also1,000, the consistent price level isP=MV/Y=1. The original price2 would instead imply output500. The identity locates the inconsistency given which measurements are independently confirmed.', 'reverse inference','Use independently verified quantities to locate the inconsistent nominal-versus-real measurement.')
F('PMOE-RER-L-001','The nominal rate rises from1.20 to1.26 foreign units per domestic unit. Domestic prices rise4% and foreign prices10%. An exporter says nominal appreciation must make domestic goods relatively dearer abroad. Does the real exchange rate support that claim?',[
 'No. Its factor is1.05×1.04/1.10, a slight real depreciation; faster foreign inflation outweighs the nominal appreciation.',
 'Yes. A5% nominal appreciation guarantees a5% real appreciation regardless of relative inflation.',
 'Yes. Adding the nominal and domestic price increases gives9% real appreciation; foreign prices do not enter.',
 'No. It depreciates10% because only foreign inflation matters for international competitiveness.'],
 'The real factor is1.26/1.20×1.04/1.10≈0.9927, a0.7% depreciation. The nominal exchange-rate direction alone is insufficient: relative prices slightly reverse its competitive implication.', 'competing mechanisms','Explain why relative inflation can overturn a nominal-appreciation conclusion.')
F('PMOE-RER-LB-002','Let e be foreign currency per domestic currency and ε=eP/P*. A domestic basket rises250 to270, its foreign counterpart400 to408, and e falls1.60 to1.50. Would holding the domestic basket price at250 instead of270 strengthen or weaken the real depreciation?',[
 'Strengthen it. The actual real rate falls1.00 to about0.993; domestic inflation offsets much of the nominal depreciation.',
 'Weaken it. The actual real rate falls1.00 to about0.993 because domestic inflation reinforces nominal depreciation.',
 'Leave it unchanged. The real rate depends only on e, which falls from1.60 to1.50 in both cases.',
 'Reverse it into appreciation. Lower domestic prices necessarily make domestic goods more expensive relative to foreign goods.'],
 'Actual ε is1.50×270/408≈0.9926 versus initial1.00. Without domestic inflation it would be1.50×250/408≈0.9191, a larger depreciation. Rising domestic prices partially offset the competitiveness effect of the cheaper currency.', 'counterfactual','Remove domestic inflation to identify its offsetting role in the real exchange-rate change.')
F('PM2B1-RNGDP-LB-001','Initially160 books cost $4 each and80 meals cost $10 each. Both quantities rise10% and both prices20%, so nominal GDP rises32%. An analyst says using different positive base prices could change real growth from10% to32%. Is that possible here?',[
 'No. Because both quantities rise by the same10%, any fixed positive price weights give10% real growth;32% includes price growth.',
 'Yes. Choosing current prices as fixed weights always turns nominal growth into real growth.',
 'No. Real growth is12% under every weighting because32 minus20 is exact deflation.',
 'Yes. A higher weight on either good changes its quantity growth from10% to32%.'],
 'With uniform quantity growth, the whole fixed-price sum is multiplied by1.10 regardless of the chosen positive weights. Nominal growth is1.10×1.20−1=32%. This weight-invariance depends on uniform quantity growth; it is not a general rule for changing output composition.', 'assumption test','Identify uniform quantity growth as the assumption making the real-growth result independent of fixed weights.')
F('ECON-NL-LEGENDARYBOSS-9103','Nominal GDP rises from $715 billion to $756 billion while a common-base deflator rises130 to140. A report subtracts the10 index-point increase from nominal growth of about5.7%, claiming real GDP fell about4.3%. What is the error?',[
 'It treats index points as percentage inflation; correct deflation gives real GDP550 then540 billion, a decline of about1.8%.',
 'It should add the10 index points to nominal growth, giving real growth of about15.7%.',
 'It should use nominal growth alone because common-base deflators cannot change real-output comparisons.',
 'It correctly measures inflation as10%; the only error is rounding the nominal growth rate.'],
 'The price factor is140/130, not1.10. Real levels are715/1.30=550 and756/1.40=540. Their decline is10/550≈1.8%; subtracting index points from a growth percentage mixes incompatible measures.', 'diagnosis','Find the measurement error in a plausible but incorrect nominal-minus-inflation argument.')
F('ECON-EC-LEGENDARYBOSS-20005','A $140 fixed-rate loan pays8% nominal interest. Expected inflation was3%, but actual inflation is6%. An alternative inflation-indexed loan would have preserved the expected real return. Using the Fisher approximation, how does the inflation surprise affect the fixed loan relative to that alternative?',[
 'Its realized real return falls from the expected5% to2%, transferring purchasing power toward the borrower compared with the indexed contract.',
 'Its realized real return rises from2% to5%, transferring purchasing power toward the lender compared with the indexed contract.',
 'Both contracts yield5% in real terms because a fixed nominal rate also fixes purchasing-power interest.',
 'The fixed loan yields2% and the indexed loan also yields2%, because indexing cannot respond to unexpected inflation.'],
 'The fixed loan has expected real return8−3=5% but realized return8−6=2%. A contract that preserves the expected real return would adjust nominal payments for inflation; the fixed borrower therefore benefits relative to that counterfactual.', 'counterfactual','Compare fixed and inflation-protected contracts under an inflation surprise.')
F('ECON-EC-LEGENDARYBOSS-20004','A person earns8% nominal interest on savings, faces6% inflation and receives a4% wage increase. They claim their overall purchasing power must have risen because the savings return is positive in real terms. Is that conclusion established?',[
 'No. Savings earn a positive real return while the real wage falls; balances and the importance of wage income are needed for the overall comparison.',
 'Yes. Any positive real return on one source guarantees that total purchasing power rises.',
 'No. Both the real return and real wage fall because all nominal amounts are eroded equally by inflation.',
 'Yes. The nominal interest and wage increases add to12%, exceeding inflation regardless of income weights.'],
 'The savings return exceeds inflation, while wage growth falls short of it. Combining those effects requires their economic weights; adding percentage changes on different bases cannot establish an overall purchasing-power gain.', 'identification limit','Identify missing income and balance weights needed to combine opposing real effects.')
F('PM2A-SAC-LB-023','Annual output gaps are−2%,−1% and−1%, each measured against the same benchmark annual output of $260. Inflation falls7% to5%. Officials have a6% cumulative output-loss budget and expect the observed sacrifice ratio to apply to further disinflation. Does the remaining budget permit lowering inflation to3%?',[
 'No. The ratio is2 and only2% of the loss budget remains, enough for one more inflation point, to4%.',
 'Yes. Dividing the4% loss by final inflation5% gives0.8, so a further two-point reduction fits.',
 'Yes. Only the final1% annual gap counts against the budget, leaving5% for further reduction.',
 'No. All6% of the budget has already been spent because the initial inflation rate was7%.'],
 'Cumulative loss is4% and disinflation2 points, so the sacrifice ratio is2. The remaining2% budget buys one additional point if that ratio continues. A further two-point reduction would require4% more loss and exceed the stated budget.', 'binding constraint','Use the correctly measured sacrifice ratio to evaluate a remaining-budget policy target.')
F('43177','A household saves $100 and buys an existing corporate share. A firm separately produces $200 of new domestic equipment but leaves it in inventory until next year. An analyst counts the share purchase as this year\'s GDP investment and delays counting the equipment until its sale. What should be corrected?',[
 'The existing share adds no current production; the new equipment enters this year\'s inventory investment even before sale.',
 'The share is current GDP investment, while unsold equipment cannot enter any current account.',
 'Both should wait until next year because investment requires a household to buy newly produced equipment.',
 'Both enter this year\'s GDP investment because every saving transaction creates physical capital.'],
 'Buying an existing share transfers a financial claim. Producing new equipment creates current output, recorded as inventory investment if unsold. A later sale reduces inventory while recording the buyer\'s acquisition, avoiding counting the same production twice.', 'diagnosis','Reconcile the timing of new production with financial-asset transactions and inventory accounting.')
F('43191','Initially Y=$900, T=$150, C=$600 and G=$180. Net taxes rise$20 and purchases rise$35, while Y and C stay fixed. An official says the higher taxes fully finance the purchases so national saving does not fall. What consumption change would instead be needed to keep national saving unchanged?',[
 'Consumption would have to fall$35; with it fixed, private saving falls$20 and public saving$15, so national saving falls$35.',
 'Consumption would have to fall$15; the tax increase already raises national saving$20 independently of private saving.',
 'No change is needed; taxes are new national resources and exactly offset any government purchase increase.',
 'Consumption would have to rise$35; more household spending releases funds for public purchases.'],
 'National saving isY−C−G. With Y and C fixed, higher G reduces it$35 regardless of the tax transfer between sectors. A$35 decline in C would offset that change. The stated sector changes are−20 private and−15 public.', 'counterfactual','Infer the household response needed for fiscal neutrality rather than equate tax finance with saving neutrality.')
F('P52A-AS-EL-004','Two economies experience the same rise in actual output prices. In A, wages and expected prices remain fixed; in B, wage contracts reset upward with expectations. A student predicts identical output responses because actual prices changed equally. What is missing?',[
 'A moves along its existing SRAS, while B\'s higher expected costs also shift SRAS left, restraining its output response.',
 'Both actual-price increases shift SRAS right by the same amount, so wage-setting differences cannot matter.',
 'Only B moves along SRAS; fixed wages in A force an immediate rightward LRAS shift.',
 'B\'s higher expected wage costs shift SRAS right, reinforcing the output effect of the actual-price rise.'],
 'Actual prices are the vertical-axis variable: changing them moves along a given supply schedule. Changed expectations and wage costs alter that schedule. Equal observed price changes therefore need not imply equal output responses under different contract conditions.', 'competing mechanisms','Explain different output responses by distinguishing an axis-variable movement from a cost-driven shift.')
F('P52A-AS-LB-002','Nominal wages are initially fixed when the price level unexpectedly rises; contracts later reset with higher expected inflation. Compare this with contracts that had fully incorporated the higher price level before it occurred. Which difference follows?',[
 'The surprise initially raises output along SRAS before wage adjustment contracts supply; prior contract adjustment removes that particular temporary cost advantage.',
 'Both cases give the same permanent output increase because expected and actual prices have identical supply effects.',
 'Prior contract adjustment strengthens the temporary output gain by keeping real wage costs even lower.',
 'The surprise immediately shifts LRAS right, so contract timing affects only the final price level.'],
 'With fixed nominal wages, unexpectedly higher output prices initially improve production incentives along SRAS. Later higher expected prices and wages shift supply left. If contracts already reflect the higher level, that initial real-cost surprise is absent.', 'counterfactual','Compare the surprise response with advance contract adjustment rather than merely list two stages.')
F('ECON-EC-LEGENDARYBOSS-20020','Two economies each employ120 workers and share similar technology and institutions. The capital-poor economy has higher marginal returns to capital but cannot finance new investment; the capital-rich economy continues investing. Does diminishing returns alone establish that the poorer economy will catch up during this period?',[
 'No. Higher potential returns do not produce catch-up without capital accumulation; the financing constraint can prevent the gains from being realized.',
 'Yes. Higher marginal returns automatically raise the poor economy\'s capital stock even without investment.',
 'No. The richer economy must have higher marginal returns because its output per worker is higher.',
 'Yes. Equal worker counts guarantee equal productivity after any period regardless of capital accumulation.'],
 'Diminishing returns describe the output gain from an additional unit of capital. They do not supply that capital. A binding financing constraint can prevent accumulation despite attractive returns, so conditional catch-up potential is not a prediction of realized convergence.', 'binding constraint','Evaluate catch-up when a concrete constraint prevents exploiting high marginal returns.')
F('LG-Q-9135','In a recession, existing rules reduce taxes by$40 and raise benefits. A separate purchases bill is enacted later. Recovery begins before the bill takes effect. Which parts can reverse with recovery without another policy vote?',[
 'The tax and benefit responses can reverse under existing rules; the scheduled purchases remain discretionary even if they now arrive at an inconvenient time.',
 'All changes reverse automatically because each originally supported aggregate demand.',
 'Only the purchases reverse automatically, because passage during a recession makes them an automatic stabilizer.',
 'None can reverse without a new vote, because every change in a budget amount is discretionary.'],
 'Automatic stabilizers depend on economic conditions under already-enacted rules, so recovery can reverse their recession response. A separately legislated purchases program remains discretionary; its timing does not reclassify its institutional origin.', 'counterfactual','Apply the automatic/discretionary distinction to a reversal in economic conditions.')
F('LG-Q-9140','Monetary restraint reduces aggregate demand by a total$150 while an already-enacted fiscal program adds a total$100. Output initially equals potential and supply is fixed. Fiscal policy cannot be changed. To leave net demand unchanged, how should the monetary restraint be recalibrated?',[
 'Reduce its total demand contraction to$100; the current combination leaves a$50 net decline.',
 'Increase its total demand contraction to$250, because opposing policies require adding both magnitudes.',
 'Keep it at$150, because opposite directions guarantee an exact offset regardless of amounts.',
 'Reverse it into a$50 expansion, because a positive fiscal effect always requires positive monetary support.'],
 'Current total effects sum to−150+100=−50. With the fiscal total fixed, a monetary total of−100 gives zero net demand change. These are already-total effects, so no additional multiplier is applied.', 'policy evaluation','Choose the adjustable policy response needed to meet a fixed coordination target.')
F('ECON-NL-LEGENDARY-9067','A survey begins with132 employed,12 unemployed and56 adults outside the labor force. Then4 unemployed find jobs,3 stop searching,5 adults enter the labor force without finding work, and2 employed retire. All job seekers are available. Participation ends unchanged. Does that prove nobody entered or left the labor force?',[
 'No. Five entries offset five exits; participation remains72% while unemployment falls to about6.9%.',
 'Yes. An unchanged participation rate means every individual kept the same labor-force status.',
 'No. Participation rises to75.5% because people who stop searching must remain counted as unemployed.',
 'Yes. Retirements and discouraged exits are ignored in both participation and unemployment statistics.'],
 'Employment becomes134 and unemployment10, so the labor force stays144 of200. Five entrants offset three search exits and two retirements. An unchanged aggregate participation rate can hide substantial flows; unemployment is10/144≈6.9%.', 'diagnosis','Distinguish unchanged participation stocks from offsetting labor-force flows.')
F('ECON-NL-LEGENDARY-9068','Among200 adults, participation is75% and unemployment8%. Next month6 unemployed stop searching,6 employed retire, and4 adults enter the labor force but find no work. Other statuses are unchanged and seekers are available. A report calls the lower unemployment rate evidence of net job creation. Is that justified?',[
 'No. Employment falls to132 even as unemployment drops to about7.0% and participation to71%; labor-force exits help explain the lower rate.',
 'Yes. Any lower unemployment rate means the number of employed people increased.',
 'No. Employment stays138 and participation75%, because retirees remain employed for this calculation.',
 'Yes. Employment rises to144 when the four new job seekers and six retirees are added to the initial workforce.'],
 'Initially LF=150, U=12 and E=138. Employment becomes132; unemployment12−6+4=10; LF=142. Thus unemployment isabout7.0% and participation71%. A falling unemployment rate can accompany employment losses when participation also declines.', 'diagnosis','Reject a job-creation inference from a rate decline driven partly by labor-force exits.')
save()
