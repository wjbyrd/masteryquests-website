from draft_utils import *
def F(i,stem,choices,feedback,kind,new):draft(i,stem,choices,feedback,inference={'type':kind,'new':new})
F('43089','Debt rises from $300 to $330 while nominal GDP rises from $600 to $720. An official treats the lower debt-to-GDP ratio as proof that debt was repaid and real production rose. What do the figures actually establish?',[
 'The ratio falls from50% to about45.8%, although debt rises; real-output growth still requires price information.',
 'The ratio falls from50% to about45.8%, proving both debt repayment and real-output growth.',
 'The ratio rises10% because debt rises10%, regardless of GDP growth.',
 'The ratio falls, so debt must have fallen in dollars even though its reported stock rose.'],
 'Debt rises10% and nominal GDP20%, lowering330/720 to45.8% from50%. A lower ratio is not repayment. Nominal GDP growth also combines prices and quantities, so it does not by itself establish real-output growth.', 'identification limit','Reject claims about repayment and real output that do not follow from a nominal ratio.')
F('LG-Q-303','In a hypothetical20% reserve system, banks start with exactly required reserves, lend all excess reserves, and receive every loan payment back as a deposit, with no currency drain or other constraint. The public deposits $8,000 of existing currency. A report calls the $40,000 maximum total deposit expansion a $40,000 increase in money held by the public. Is that correct?',[
 'No. The first loan is $6,400, but net money rises at most $32,000 because the initial deposit replaces public currency.',
 'Yes. The first loan is $6,400 and all $40,000 of deposits are additional money beyond the original currency.',
 'No. The first loan is $1,600 and total deposits can rise only $8,000 because currency cannot support lending.',
 'Yes. The first loan is $8,000; required reserves can be held after all funds have been lent.'],
 'The first bank retains$1,600 and lends$6,400. Total deposit expansion is8,000/0.2=$40,000, including the initial deposit. Since public currency initially falls$8,000, currency plus deposits rises only$32,000. Deposit expansion and net money creation differ.', 'diagnosis','Distinguish gross deposit expansion from net public money creation.')
F('LG-Q-308','In a hypothetical10% reserve system, a bank receives $5,000 in new deposits and lends all excess reserves. With full redepositing, the next bank would lend $4,050. Instead, it makes a $3,600 loan while still lending all excess reserves. Which departure from full redepositing could explain the result?',[
 'Recipients kept $500 of the first $4,500 loan in currency, leaving a $4,000 deposit at the next bank.',
 'Recipients redeposited all $4,500, and unchanged10% required reserves alone reduced the next loan to $3,600.',
 'The first bank lent only $500 because required reserves are the amount available to lend.',
 'Recipients kept $900 in currency, leaving a $3,600 deposit that the next bank could lend in full.'],
 'The first loan is0.9×5,000=$4,500. Lending$3,600 at a10% reserve ratio requires a$4,000 deposit. A$500 currency withdrawal from the payment explains the smaller redeposit, rather than treating the full loan as new lending capacity.', 'reverse inference','Infer currency leakage from a smaller-than-predicted second-bank loan.')
F('LG-Q-310','A bank has $2 million in deposits, $260,000 in reserves and a10% reserve requirement. It lends all excess reserves, and the payment is deposited at a second bank. The second bank holds $10,000 from that deposit. A report says all $10,000 must be required reserves. Is that supported?',[
 'No. The new deposit is $60,000, requiring $6,000; the remaining $4,000 is voluntarily held excess reserves.',
 'Yes. Required reserves are $10,000 because any reserves actually held must satisfy the legal requirement.',
 'No. The new deposit is $260,000, requiring $26,000, so the second bank is short $16,000.',
 'Yes. The first bank\'s $200,000 requirement transfers proportionally into a $10,000 requirement at the next bank.'],
 'The first bank needs$200,000 and can lend$60,000. A full redeposit creates a$6,000 requirement at the second bank. Holding$10,000 exceeds that requirement by$4,000, showing why actual reserve holdings need not equal required reserves.', 'diagnosis','Distinguish an observed reserve holding from the binding requirement.')
F('PM2A-DIS-LB-018','After disinflation, unemployment returns to its original natural rate and inflation stabilizes at2%. The price index is260, up from240 before the policy. An official says the return to natural unemployment proves the policy had no real transition cost. Is that warranted?',[
 'No. Current excess unemployment has ended, but the endpoint does not reveal unemployment accumulated during adjustment; prices also remain higher and rising.',
 'Yes. Returning to the natural rate erases all unemployment experienced earlier, regardless of duration.',
 'No. The higher price index proves unemployment is still above its natural rate.',
 'Yes. Inflation of2% means the price index is falling back toward240, compensating workers for every earlier loss.'],
 'The endpoint establishes that excess unemployment has ended, not that its cumulative cost was zero. A positive2% inflation rate also means the higher price level continues rising; disinflation does not reverse all prior price increases.', 'identification limit','Separate an endpoint recovery from cumulative transition costs.')
F('PM2A-DIS-LB-020','Inflation falls to1%, unemployment returns to its natural rate and prices remain higher than before. A second disinflation plan would have reached the same endpoint. Can these facts establish which plan imposed less unemployment during the transition?',[
 'No. The time paths of excess unemployment are needed; the same endpoint can follow different real costs without either plan causing deflation.',
 'Yes. The plan with the higher final price level necessarily had more excess unemployment.',
 'Yes. A return to natural unemployment means every plan reaching it has zero cumulative cost.',
 'No. Comparing costs is impossible because1% inflation necessarily means deflation rather than disinflation.'],
 'Lower positive inflation is disinflation, not a falling price level. Returning to the natural rate ends current excess unemployment, but comparing transition costs requires information about its size and duration along each path.', 'identification limit','Specify the missing evidence needed to compare two paths with identical endpoints.')
F('PM2A-DIS-LB-019','Two plans reach the same inflation target with unchanged natural unemployment. Faster expectation adjustment under plan A produces excess unemployment of2 percentage points for one year. Under B it is1 point for three years. Which comparison explains why the same target need not imply the same real cost?',[
 'A has the larger peak but the smaller cumulative unemployment gap:2 point-years rather than3.',
 'A has the larger peak, so it necessarily has the larger cumulative cost regardless of duration.',
 'Both have equal cost because their final inflation targets are identical.',
 'B has3 point-years, proving that its final natural unemployment rate is3 points higher.'],
 'Peak unemployment and accumulated unemployment are different measures. A totals2×1=2 point-years; B totals1×3=3. A brief larger gap can cost less cumulatively than a smaller persistent gap without changing the natural rate.', 'policy evaluation','Compare peak severity with duration when evaluating transition costs.')
F('P52A-FISCAD-LB-001','Government raises purchases and lump-sum taxes by $110 each. MPC is0.8, prices are fixed, resources are idle and there is no other leakage or crowding out. An analyst claims the balanced budget leaves demand unchanged. Which assumption would make that cancellation plausible, and why does it fail here?',[
 'It would require the full tax increase to reduce initial consumption; here consumption falls only $88, leaving a multiplied net increase of $110.',
 'It requires MPC0.8, because equal dollar tax and purchase changes always have equal initial spending effects.',
 'It requires fixed prices, because fixed prices prevent any induced consumption from a government purchase.',
 'It requires the spending multiplier to be5, which turns the $110 purchase increase into a zero net effect.'],
 'Purchases add$110 directly, while taxes reduce initial consumption by0.8×110=$88. The$22 initial net impulse times5 gives$110. Budget balance is not demand balance because some of the tax increase reduces saving rather than consumption.', 'assumption test','Identify the false full-consumption-response assumption behind zero net demand.')
F('P52A-FISCAD-LB-002','Government pays $120 in transfers instead of buying output. MPC is0.6 in a fixed-price model with no other changes. A report predicts the same $300 demand increase as a $120 purchases program. Why does replacing purchases with transfers change the result?',[
 'Transfers do not enter G; recipients initially spend $72, yielding a $180 total rather than $300.',
 'Transfers enter G just like purchases, so both programs initially add $120 and total $300.',
 'Transfers do not enter G, so they cannot affect consumption or aggregate demand at all.',
 'Transfers initially add $72 to consumption, but applying the spending multiplier again would always double-count it.'],
 'Purchases directly buy output. Transfers raise disposable income, of which0.6×120=$72 is initially spent. With multiplier2.5, the total is$180. The remaining initial$48 is saved, explaining the difference from a purchases program.', 'counterfactual','Explain why equal budget costs do not imply equal demand effects for transfers and purchases.')
F('LG-Q-9134','With MPC0.75 and fixed prices, government purchases rise $60. Crowding out reduces total AD by $60 after induced effects, leaving a $180 net increase. An analyst instead treats that same $60 as an autonomous investment loss. What changes under the analyst\'s interpretation?',[
 'The predicted net effect becomes zero because an autonomous $60 loss would itself be multiplied by4; that is a different assumption from a total $60 offset.',
 'The predicted net effect remains $180 because autonomous and total effects are interchangeable.',
 'The predicted net effect becomes $300 because investment losses must be added to fiscal expansion.',
 'The predicted net effect stays $240 because crowding out cannot affect demand in a fixed-price model.'],
 'The original gross increase is60×4=240 and the total offset is60, leaving180. If60 instead denotes the initial autonomous loss, its total is240 and the effects cancel. Distinguishing what the number measures prevents multiplying an already-total offset twice.', 'assumption test','Show how misclassifying a total offset as an autonomous impulse changes the policy estimate.')
F('LG-Q-9127','For a $180 loan, expected inflation rises from2% to5% while the required expected real return falls from4% to3%. The nominal rate rises from6% to8%. Does its two-point increase refute the Fisher approximation?',[
 'No. The three-point expectation increase is partly offset by the one-point real-return decline; a one-for-one nominal response requires a fixed real rate.',
 'Yes. Any expectation increase must produce an equal nominal-rate increase even when the required real rate changes.',
 'No. Nominal rates equal expected inflation minus the real return, which gives the observed increase.',
 'Yes. Opposite changes in real returns and expectations must always leave the nominal rate unchanged.'],
 'Initially i≈4+2=6; later i≈3+5=8. The two components still sum correctly. Treating the conditional one-for-one expectation response as unconditional would mistakenly hold the supplied changing real return fixed.', 'assumption test','Distinguish the Fisher identity from its fixed-real-rate comparative-static prediction.')
F('ECON-NL-LEGENDARYBOSS-9106','Government transfers $80 to households, who buy $20 of imports and $60 of current domestic services. No other spending changes. An expenditure report records G +$80, C +$80 and M +$20, while production records show only $60 of new domestic services. What explains the discrepancy?',[
 'The transfer was wrongly included in G; removing it gives GDP +$60, matching domestic production.',
 'Imports were wrongly subtracted; removing M gives GDP +$160, matching the services plus imported goods.',
 'Consumption should exclude both transfers and imports, leaving C zero and GDP +$60 from government purchases.',
 'The production records must omit $80 of government output because every cash transfer purchases current output.'],
 'The report totals80+80−20=140, exceeding production by80. Transfers are not purchases of output. Excluding them from G leaves consumption80 minus imports20, or60, consistent with the domestic services.', 'diagnosis','Reconcile expenditure and independent production evidence by identifying the duplicated transfer.')
F('PM2B1-GDPC-LB-001','Households buy $3 million of domestic services and $2 million of imports; firms buy $4 million of domestic machinery and $2 million of stock; government buys $5 million of domestic bridges and pays $1 million in transfers; exports are $2 million. An accountant totals all payments as $19 million of GDP. Which exclusions reconcile that total with production?',[
 'Exclude $2 million of imports, $2 million of financial assets and $1 million of transfers, leaving $14 million of domestic output.',
 'Exclude only the $2 million of imports, leaving $17 million because shares and transfers are current output.',
 'Exclude the $2 million of stock and $1 million transfer but retain imports as domestic production, leaving $16 million.',
 'Exclude machinery as an intermediate purchase and exports as foreign output, leaving $13 million.'],
 'Domestic production is3+4+5+2=14. The$5 million discrepancy consists of imported production, ownership claims and transfers. These expenditures can move money without adding current domestic output.', 'diagnosis','Reconcile a payments total with production by tracing the sources of overstatement.')
F('ECON-NL-LEGENDARYBOSS-9102','A domestic farm sells grain for $48 to a mill, which sells flour for $63 to a bakery; bread sells to households for $88. No inventories change. An accountant sums value added but omits the farm, reporting GDP of $40. Would excluding the farm be justified because its grain is intermediate?',[
 'No. The mill and bakery add $40, but the farm adds $48; all value added totals the $88 final sale.',
 'Yes. Intermediate producers add nothing to GDP, so only downstream value added counts.',
 'No. All three gross sales should be added, making GDP $199.',
 'Yes. The farm\'s $48 has already been counted in the mill\'s $15 of value added.'],
 'Mill value added is63−48=15 and bakery value added88−63=25. Their$40 excludes the farm\'s$48 contribution. Intermediate sales are not added on top of final expenditure, but each domestic producer\'s value added belongs in the production account.', 'diagnosis','Distinguish excluding an intermediate gross sale from omitting the producer\'s value added.')
F('ECON-NL-LEGENDARYBOSS-9107','A household buys a machine produced last year for $90 and pays a dealer a $50 current service fee. Suppose the used-machine price were instead $60 while the fee and service stayed the same. How would that change current GDP from this transaction?',[
 'It would not change the $50 contribution; the lower payment changes the price of an existing asset, not current production.',
 'GDP would fall $30 because every reduction in the total household payment lowers current output.',
 'GDP would be $110 because both the used machine and dealer fee count as newly produced output.',
 'GDP would be zero because transactions involving used goods exclude even newly provided services.'],
 'The original$140 payment contains$90 for an existing asset and$50 for current service. The counterfactual$110 payment still buys the same$50 service. GDP records that service, not the resale price of last year\'s machine.', 'counterfactual','Separate changes in asset-transfer payments from unchanged current service output.')
F('ECON-NL-LEGENDARYBOSS-9101','A producer sells $86 of final output containing a domestic supplier\'s $46 input. Unrelated domestic services add $61. An accountant reports GDP of $101 after subtracting the input from final output. Which missing entry explains why this is below the expenditure total?',[
 'The supplier\'s $46 of value added; adding it to the producer\'s $40 and services of $61 gives $147.',
 'The supplier\'s $46 of gross sales must be added to the full $86 final sale and $61 services, giving $193.',
 'The $61 of services should be removed because goods and services cannot appear in the same GDP account.',
 'No entry is missing; subtracting inputs from final expenditure is how GDP avoids double counting.'],
 'Subtracting46 from86 yields the downstream producer\'s40 of value added, not total production. With the supplier\'s46 and unrelated services61 included, value added sums to147, matching final expenditure86+61.', 'reverse inference','Identify the omitted production stage from the gap between two accounts.')
F('ECON-NL-LEGENDARY-9035','A $2,400 grant at CPI120 is fully adjusted when CPI reaches132, then frozen while CPI reaches144. An official proposes a10% increase in the frozen grant because the last adjustment was10%. Would that restore the original purchasing power exactly?',[
 'No. The frozen grant is $2,640 and needs $240 more; a10% increase adds $264 and overshoots the required $2,880.',
 'Yes. Every ten-point increase in CPI requires a10% increase in the latest payment.',
 'No. The grant is still $2,400 and requires the full $480 increase from its original level.',
 'Yes. Applying the same percentage repeatedly always preserves purchasing power when index increases are equal.'],
 'The first grant is2,400×132/120=2,640. At144 the target is2,880, so the remaining increase is240/2,640≈9.09%. Repeating the earlier10% uses the wrong proportional change and adds$24 too much.', 'policy evaluation','Evaluate a repeated-percentage adjustment against the remaining price change.')
F('ECON-NL-LEGENDARY-9036','An indexed payment was $900 at CPI100. Purchasing power is unchanged at a later $1,260 payment, but that CPI observation is missing. The next payment is $1,350 at CPI150. An official infers the missing CPI and concludes every recipient\'s own living standard was preserved. What is established?',[
 'The missing CPI is140 and both payments preserve CPI-basket purchasing power; individual living standards need evidence about recipients\' own costs and circumstances.',
 'The missing CPI is140, proving every household experienced exactly the same cost increase and welfare outcome.',
 'The missing CPI is126 because payment dollars can be used directly as index points.',
 'The missing CPI is150, so the $1,350 payment buys7.1% more than the original CPI basket.'],
 'The implied index is100×1,260/900=140;1,350/1.50=900 also preserves base-year basket purchasing power. Those calculations use the CPI measure. They do not establish identical household-specific price exposure or overall living standards.', 'identification limit','Distinguish preserved index-basket purchasing power from a universal household welfare claim.')
save()
