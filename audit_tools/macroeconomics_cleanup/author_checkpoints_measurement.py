from checkpoint_support import *

for j,id in enumerate(candidates('gdp-measurement')):
    a=20+2*j;b=a+15;c=b+25;mode=j%7
    if mode==0:
        emit(id,f'A domestic farm sells grain for ${a} to a domestic mill, which sells flour for ${b} to a domestic bakery. The bakery sells all bread to households for ${c}. No inventories change. An accountant adds all three sales to GDP. Which correction reconciles expenditure with value added?',
             [f'Count ${c}; summing each producer\'s value added gives the same final-output value',f'Count ${a+b+c}; every sale is separate current output',f'Count ${c-b}; only the bakery creates final value',f'Count ${b+c}; exclude the farm but retain the mill\'s intermediate sale'],
             f'Value added is {a} + ({b}−{a}) + ({c}−{b}) = ${c}, equal to the bread\'s final sale. Adding gross intermediate sales counts embedded production repeatedly.',error='Adds intermediate sales to the final value.',proof=proof((f'{a}+({b}-{a})+({c}-{b})',c)))
    elif mode==1:
        emit(id,f'A household buys a used domestic machine for ${c} through a dealer charging a current service fee of ${a}. The machine was produced last year. Which pair correctly compares current GDP with the household\'s total payment?',
             [f'Current GDP rises ${a}; the larger payment includes transfer of an existing asset',f'Current GDP rises ${a+c}; both the machine and dealer service are newly produced',f'Current GDP rises ${c}; the dealer fee is only a transfer',f'Current GDP is unchanged; anything connected to a used asset is excluded'],
             f'The ${c} used asset is not current production. The newly provided dealer service contributes ${a}, even though the transaction concerns a used asset.',tier='medium',error='Excludes a current transaction service because the underlying asset is used.')
    elif mode==2:
        emit(id,f'A domestic factory produces ${c} of final goods, sells ${b}, and holds the remainder as new inventory. A report uses sales alone and says GDP will rise when the inventory is sold next year without new production. Which correction is valid?',
             [f'Current GDP includes ${c}; next year\'s inventory sale is offset by inventory disinvestment',f'Current GDP includes ${b}; next year\'s sale adds the remaining output again',f'Current GDP includes ${c+b}; next year\'s sale contributes nothing',f'Current GDP includes ${c-b}; only unsold goods are counted this year'],
             f'Production, not only sales, is counted: sales {b} plus inventory investment {c-b} equals {c}. A later sale of that inventory is offset by a fall in inventories, avoiding a second count.',error='Uses sales timing instead of production timing.',proof=proof((f'{b}+({c}-{b})',c)))
    elif mode==3:
        emit(id,f'A foreign-owned factory produces ${c} of final output inside the country and sends ${a} of profit to its foreign owners. A domestically owned factory produces ${b} abroad. For domestic GDP, which ledger is correct?',
             [f'Include ${c}; location of production, not ownership or profit remittance, sets the GDP boundary',f'Include ${b}; ownership determines which output belongs to GDP',f'Include ${c-a}; subtract the foreign owners\' profit from domestic production',f'Include ${c+b}; both ownership and location independently add production'],
             'GDP measures production within the country. Profit remittance concerns cross-border income, not whether the domestic factory produced output. Output made abroad is excluded from domestic GDP.',tier='medium',error='Uses nationality of ownership instead of domestic production location.')
    elif mode==4:
        emit(id,f'A current domestic final sale is ${c}. Wages are ${a}, other production income is ${b-a}, and profit is the residual. A reviewer claims expenditure exceeds income because profit is omitted from the income account. Which reconciliation is correct?',
             [f'Profit is ${c-b}; adding it makes income equal the ${c} expenditure',f'Profit is ${c-a}; only wages count as costs in the income account',f'Profit is ${b}; adding it doubles total income',f'Profit is zero; the expenditure-income gap is genuine output'],
             f'The listed non-profit income totals ${b}. Residual profit is {c}−{b} = ${c-b}, bringing income to ${c}. Income and expenditure are two views of this same current production.',error='Omits profit when reconciling production income and expenditure.',proof=proof((f'{c}-{b}',c-b),(f'{a}+({b}-{a})+({c}-{b})',c)))
    elif mode==5:
        emit(id,f'A household buys a ${c} newly produced domestic computer and a ${b} existing corporate share. A broker supplies a new service charging ${a}. Which revision to a report counting all three payments is correct?',
             [f'Subtract the ${b} share transfer; the computer and brokerage service contribute ${c+a}',f'Subtract the ${a} service; the computer and share contribute ${c+b}',f'Subtract the ${c} computer; financial transactions contribute ${a+b}',f'Subtract both the share and service; only ${c} counts'],
             f'The share is a financial-asset transfer. The current computer and brokerage service are production, totaling {c}+{a} = ${c+a}. A service is not excluded merely because it accompanies finance.',error='Counts an existing financial asset as current investment output.',proof=proof((f'{c}+{a}',c+a)))
    else:
        emit(id,f'A producer reports ${c} of final output. A supplier\'s ${a} input is already embodied in it. The national accounts also record ${b} of unrelated domestic services. Which proposed GDP total counts each unit of current output once?',
             [f'${c+b}; count final output and unrelated services, without adding its embodied input',f'${c+b+a}; every observed sale is added',f'${c+b-a}; subtract the input from final output even though it was never added',f'${c}; services are excluded when goods have intermediate inputs'],
             f'The final good already embodies the supplier\'s contribution. GDP is {c}+{b} = ${c+b}; neither add the input again nor subtract it from final expenditure.',error='Double counts or double subtracts intermediate production.',proof=proof((f'{c}+{b}',c+b)))

for j,id in enumerate(candidates('gdp-components')):
    a=30+5*j;b=10+j;mode=j%5
    if mode==0:
        emit(id,f'Government sends households ${a} in transfers. Recipients buy ${b} of imported goods and ${a-b} of current domestic services. No other spending changes. Which expenditure-account entry and GDP change are correct?',
             [f'C rises ${a} and M rises ${b}; GDP rises ${a-b}, with no direct G from the transfer',f'G and C both rise ${a}; GDP rises ${2*a-b}',f'C rises ${a}; GDP rises ${a} because imports are consumption',f'C rises only ${a-b} and M rises ${b}; GDP rises ${a-2*b}'],
             f'The transfer is not a government purchase. Recipient consumption enters C; imported consumption also enters M. Thus ΔGDP = {a}−{b} = ${a-b}, the domestic services alone.',error='Counts a transfer in G or subtracts imports twice.',proof=proof((f'{a}-{b}',a-b)))
    elif mode==1:
        emit(id,f'A firm adds ${a} of current unsold output to inventories while a household buys a newly built domestic home for ${3*a}. A student classifies only the firm\'s inventory as investment. Which correction is needed?',
             [f'Both are investment; their combined GDP contribution is ${4*a}',f'Only the home is investment; inventories count when sold later',f'The home is consumption and inventory is investment; GDP excludes the home',f'Both are financial saving; neither is production until resold'],
             f'Inventory accumulation and new residential construction are both investment in the GDP accounts. Their current production adds {a}+{3*a} = ${4*a}. Buying an existing home would differ.',tier='medium',error='Treats new residential construction as ordinary consumption.',proof=proof((f'{a}+{3*a}',4*a)))
    elif mode==2:
        emit(id,f'GDP is ${10*a}, C is ${6*a}, G is ${2*a}, exports are ${a}, and imports are ${2*a}. An analyst reports investment of ${a}. Which reconciliation is required?',
             [f'Investment must be ${3*a}; net exports are −${a}',f'Investment must be ${a}; subtracting imports would count them twice',f'Investment must be ${a}; net exports are +${a}',f'Investment must be ${5*a}; subtract both imports and exports from spending'],
             f'NX = {a}−{2*a} = −{a}. From Y=C+I+G+NX, I = {10*a}−{6*a}−{2*a}+{a} = ${3*a}.',error='Reverses the sign of net exports when solving the identity.',proof=proof((f'{10*a}-{6*a}-{2*a}-({a}-{2*a})',3*a)))
    elif mode==3:
        emit(id,f'Imported machinery costing ${a} is purchased by a domestic firm; installation supplied domestically costs ${b}. Assume both enter gross investment. Which accounting adjustment avoids counting foreign production in domestic GDP?',
             [f'I rises ${a+b} and M rises ${a}; domestic GDP rises ${b}',f'I rises ${b} and M rises ${a}; domestic GDP falls ${a-b}',f'I rises ${a+b} and M is unchanged; domestic GDP rises ${a+b}',f'G rises ${a} and I rises ${b}; domestic GDP rises ${a+b}'],
             f'Gross investment includes the installed purchase, {a}+{b}; subtracting imported machinery once through M leaves the ${b} domestic installation service.',error='Subtracts the imported machinery from investment and again from net exports.',proof=proof((f'({a}+{b})-{a}',b)))
    else:
        emit(id,f'A domestic firm sells ${a} of last year\'s inventory to households and produces ${b} of new goods that remain unsold. No other production occurs. Which C, inventory-I and GDP entries are consistent?',
             [f'C = ${a}, inventory I = ${b-a}, GDP = ${b}',f'C = ${a}, inventory I = ${b}, GDP = ${a+b}',f'C = $0, inventory I = ${b-a}, GDP = ${b-a}',f'C = ${a}, inventory I = ${a-b}, GDP = ${2*a-b}'],
             f'Consumption records the sale, but inventory investment is new accumulation {b} minus withdrawal {a}. C+I = {a}+({b}−{a}) = ${b}, this year\'s production.',error='Counts an old inventory sale again as new production.',proof=proof((f'{a}+({b}-{a})',b)))

for j,id in enumerate(candidates('limits-of-gdp')):
    a=10+j;mode=j%5
    cases=[
      (f'Households begin paying ${a} million for domestic childcare they formerly provided unpaid, with the same hours and quality of care. GDP rises by that fee. Which conclusion and limitation follow?',
       ['Measured market production rises; unchanged care services mean that rise alone does not establish a welfare gain','Measured market production rises; the full fee therefore measures an equal increase in welfare','Measured market production is unchanged; shifting an unpaid service into markets cannot affect GDP','Measured market production falls; payment replaces household income rather than creating output'],
       'Paid current childcare enters measured production; the same unpaid care was largely outside GDP. Marketization can raise GDP without an equal increase in services or welfare.'),
      (f'Real GDP per person rises {a}% while leisure falls and air quality deteriorates. An analyst calls the GDP increase a complete measure of the welfare gain. Which assessment is justified?',
       ['Output per person increased, but the net welfare change requires valuing the omitted losses','Output per person increased, so welfare must have increased by exactly the same percentage','Output per person decreased because environmental damage is automatically deducted from GDP','Output per person is unknown because GDP cannot be measured when leisure changes'],
       'Real GDP per person measures average production, not a complete welfare index. Leisure and environmental quality can offset some or all benefits; their values are not supplied.'),
      (f'Two countries have the same real GDP per person of ${20000+100*j}. One has greater inequality and poorer health outcomes. Which conclusion respects both the production data and their limits?',
       ['Average measured output is equal; distribution and health can still support different welfare rankings','Every resident has equal income; different health outcomes therefore cannot change the ranking','The less equal country has lower real GDP per person once inequality is read into the given measure','The data establish neither output nor welfare because all averages exclude distribution'],
       'Equal GDP per person establishes equality of average measured production, not individual incomes or a complete welfare ranking. Distribution and health are separate evidence.'),
      (f'A storm destroys existing homes. Rebuilding produces ${a} million of current construction, while families lose housing services during repairs. Which GDP-versus-welfare comparison is correct?',
       ['Rebuilding adds to current GDP; loss of existing wealth and services prevents treating it as a net welfare gain','Destruction and rebuilding both add to current GDP; their sum measures the welfare gain','Rebuilding is excluded because it replaces old assets; neither GDP nor welfare changes','Destruction is automatically subtracted from GDP by the replacement value; GDP equals the net welfare effect'],
       'Current reconstruction is production. Destruction of existing assets is a wealth loss, not automatically a negative final purchase; lost services also matter for welfare.'),
      (f'A formerly paid domestic information service worth ${a} million becomes freely available at the same quality. Its paid output disappears from measured GDP, with no replacement market sales. Which inference is supported?',
       ['Measured market output can fall while users retain the service; welfare need not fall with the measured amount','Measured output must be unchanged because useful free services always receive an imputed market price','Measured output falls, so users necessarily lose services worth exactly the former fees','Measured output rises by the former fees because zero price is recorded as additional consumption'],
       'The market transaction disappears, while usefulness need not. GDP and access to valuable services can diverge when a service becomes free.')]
    stem,ans,fb=cases[mode];emit(id,stem,ans,fb,tier='elite' if RECORDS[id]['q']['canonicalDifficulty']=='legendary' else 'hard',error='Treats measured market output as a complete welfare measure.')

for j,id in enumerate(candidates('real-versus-nominal-gdp')):
    n=100+10*j;mode=j%4
    if mode==0:
        emit(id,f'Current output is {n} units at $12 each; the base-year price is $10. A report values current output at current prices and calls the result real GDP. Which correction and interpretation are right?',
             [f'Real GDP is ${10*n}; the ${12*n} current-price value mixes output and prices',f'Real GDP is ${12*n}; using the latest price removes inflation',f'Real GDP is ${2*n}; subtract prices instead of selecting the base price',f'Real GDP is ${n}; quantity alone is a monetary measure'],
             f'Nominal GDP is {n}×12 = {12*n}; real GDP uses the designated base price, {n}×10 = {10*n}.',tier='medium',error='Uses current prices for real GDP.',proof=proof((f'{n}*10',10*n),(f'{n}*12',12*n)))
    elif mode==1:
        emit(id,f'Nominal GDP rises from ${10*n} to ${12*n}, while the deflator rises from 100 to 120. Population rises 5%. Which combined real-output conclusion is supported?',
             ['Aggregate real GDP is unchanged; real GDP per person falls about 4.8%','Aggregate real GDP rises 20%; real GDP per person rises about 14.3%','Aggregate real GDP is unchanged; real GDP per person is unchanged','Aggregate real GDP falls 20%; population growth raises output per person'],
             f'Real GDP is {10*n}/1 = {10*n} initially and {12*n}/1.2 = {10*n} later. Per-person output changes by 1/1.05−1 ≈ −4.8%.',tier='elite',error='Infers real or per-capita growth directly from nominal GDP.',proof=proof((f'{12*n}/1.2',10*n),('(1/1.05-1)*100',-4.761904762)))
    elif mode==2:
        emit(id,f'The base-year economy produces {n} books at $4 and {n//2} meals at $10. Current quantities of both goods are 10% higher, but each current price is 20% higher. Which assessment of a reported 32% real-GDP growth rate is correct?',
             ['32% is nominal growth; real growth is 10% because the price vector must be held fixed','32% is real growth; both quantity and price increases measure added production','Real growth is 12%; subtract the price rise from the compounded nominal growth exactly','Real growth is 20%; the change in the price vector determines real output'],
             'Quantities rise 10%, so valuation at unchanged base prices gives 10% real growth. Nominal growth compounds quantity and price factors: 1.10×1.20−1 = 32%. Exact deflation recovers 1.32/1.20−1 = 10%.',tier='hard',error='Calls combined price and quantity growth real growth.',proof=proof(('(1.1*1.2-1)*100',32),('(1.32/1.2-1)*100',10)))
    else:
        emit(id,f'An economy reports nominal GDP ${12*n} and real GDP ${10*n}. Next year nominal GDP remains ${12*n} while its deflator falls from 120 to 100. Which inference is valid?',
             ['Real GDP rises 20%; unchanged nominal GDP can conceal increased output when prices fall','Real GDP is unchanged; equal nominal spending implies equal physical output','Real GDP falls 20%; lower prices reduce real output at any nominal spending','Real GDP rises 16.7%; divide the output change by the final output level'],
             f'Initial real GDP is {10*n}; next real GDP is {12*n}/1 = {12*n}. Growth uses initial real output: ({12*n}−{10*n})/{10*n} = 20%.',error='Uses nominal stability or the final level to infer real growth.',proof=proof((f'({12*n}-{10*n})/{10*n}*100',20)))

for concept in ['cpi-and-inflation-measurement','indexing-and-real-values','real-versus-nominal-interest-rates','cpi-versus-gdp-deflator','cpi-bias']:
 for j,id in enumerate(candidates(concept)):
    mode=j%4;x=100+10*j
    if concept=='cpi-and-inflation-measurement':
      cases=[
       (f'A fixed basket costs ${x} in the base year, ${1.2*x:g} this year and ${1.32*x:g} next year. A report calls the next CPI-point increase the next inflation rate. Which pair corrects it?',
        ['The next CPI is 132; next inflation is 10%','The next CPI is 132; next inflation is 12%','The next CPI is 120; next inflation is 10%','The next CPI is 132; next inflation is 32%'],
        'CPI levels are 120 and 132. Inflation is (132−120)/120×100 = 10%, not the 12-point change or the 32% cumulative rise.',proof(('(132-120)/120*100',10))),
       (f'A fixed-basket index is 125 in the base comparison period and 130 in the next. A ${x} nominal payment rises 3%. Does its purchasing power keep pace?',
        ['No; prices rise 4%, and real purchasing power falls about 1.0%','Yes; prices rise only 3.8%, which is below the payment rise','Yes; a rising nominal payment guarantees more purchasing power','No; real purchasing power falls exactly 5% because the index rises five points'],
        'Inflation is (130−125)/125 = 4%. The real payment factor is 1.03/1.04, a decline of about 0.96%.',proof(('(130-125)/125*100',4),('(1.03/1.04-1)*100',-.961538462))),
       (f'A basket cost is ${x} before prices change. Its index rises from 160 to 168. A clerk multiplies the old cost by 1.08. Which corrected cost and reason are right?',
        [f'${1.05*x:g}; the relevant price factor is 168/160',f'${1.08*x:g}; index points are automatically percentages',f'${1.68*x:g}; apply the new index as though the old index were 100',f'${.95*x:g}; the higher index implies a lower basket cost'],
        'The price factor is new index/old index = 168/160 = 1.05. An eight-point rise from 160 is 5%, not 8%.',proof(('168/160',1.05))),
       (f'A worker earns ${x} before a 6% nominal raise. The relevant CPI rises 8%. A report says higher pay alone establishes a real gain. Which correction follows?',
        ['Nominal pay rises, but real pay falls about 1.9%; divide the nominal factor by the price factor','Nominal and real pay both rise 6%; wage changes are independent of prices','Real pay rises 14%; combine the two percentage changes by addition','Real pay falls 8%; disregard the nominal raise when deflating'],
        'Purchasing power changes by 1.06/1.08−1 ≈ −1.85%. A positive nominal raise can accompany a real loss.',proof(('(1.06/1.08-1)*100',-1.851851852)))]
    elif concept=='indexing-and-real-values':
      cases=[
       (f'A ${x} benefit is adjusted by the previous year\'s 4% CPI rise. This year\'s cost of living rises 6%. Which result explains the limitation of this indexation rule?',
        ['The benefit rises 4% but current real purchasing power falls about 1.9% because the adjustment lags','The benefit rises 6% and real purchasing power is unchanged because any indexation is contemporaneous','The benefit rises 4% and real purchasing power rises 2% because inflation is subtracted in the opposite direction','The benefit rises 10% and real purchasing power rises 4% because both years are added'],
        'The nominal factor is 1.04 and current prices rise by 1.06. Real value changes by 1.04/1.06−1 ≈ −1.89%; lagged indexation does not fully cover current inflation.',proof(('(1.04/1.06-1)*100',-1.886792453))),
       (f'A ${x} monthly benefit is fully indexed to a 5% CPI rise, but its recipient\'s actual fixed basket rises 8%. Which conclusion distinguishes index protection from household purchasing power?',
        ['CPI-adjusted value is preserved; purchasing power over this household basket falls about 2.8%','Both CPI-adjusted and household purchasing power are preserved because the contract is indexed','CPI-adjusted value falls 3%; household purchasing power is preserved','Both measures rise 13% because the index and basket changes add'],
        'The contract preserves value relative to CPI, not every household basket. For this basket the real factor is 1.05/1.08, or about a 2.78% decline.',proof(('(1.05/1.08-1)*100',-2.777777778))),
       (f'A past monthly payment was ${x} when CPI was 100. A current payment is ${1.3*x:g} when CPI is 125. Which comparison uses common purchasing-power units?',
        [f'The current payment is ${.05*x:g} higher in current dollars; the past payment converts to ${1.25*x:g}',f'The current payment is ${.3*x:g} higher in real terms; compare unadjusted dollar amounts',f'The past payment is ${.05*x:g} higher in current dollars; deflate the past payment again',f'The payments have equal purchasing power; both CPI and the payment increased'],
        f'The past payment in current dollars is {x}×125/100 = {1.25*x:g}. The current payment exceeds it by {1.3*x-1.25*x:g}.',proof((f'{x}*125/100',1.25*x),(f'{1.3*x}-{1.25*x}',.05*x))),
       (f'A ${x} indexed benefit resets once annually. Immediately after a reset, prices rise while the next reset is six months away. Which proposal addresses the specific loss without promising complete protection against a mismatched household basket?',
        ['Reset more frequently to reduce the lag; index mismatch can still leave real-value differences','Reset less frequently to reduce the lag; a CPI rule eliminates all household mismatch','Replace the index with the original nominal amount; fixed payments follow current prices','Use the GDP deflator regardless of consumption; domestic output prices always equal each household basket'],
        'More frequent adjustment can shorten the timing gap. Even prompt CPI indexation cannot guarantee unchanged purchasing power for a different household consumption basket.',None)]
    elif concept=='real-versus-nominal-interest-rates':
      cases=[
       (f'A ${x} loan carries 8% nominal interest. Expected inflation was 3%, but actual inflation is 6%. Using the Fisher approximation, which comparison explains the redistribution?',
        ['Expected real interest was 5% and realized real interest is 2%; the borrower gains relative to expectation','Expected real interest was 2% and realized real interest is 5%; the lender gains relative to expectation','Both expected and realized real interest are 5%; the contract fixes purchasing-power interest','Expected real interest was 11% and realized real interest is 14%; the lender gains from higher prices'],
        'Ex ante real interest uses expected inflation: 8−3=5%. Ex post real interest uses actual inflation: 8−6=2%. Unexpectedly higher inflation reduces the fixed nominal repayment\'s real return.',proof(('8-3',5),('8-6',2))),
       (f'Two lenders each advance ${x}. Loan A pays 7% nominal interest with expected inflation 2%; loan B pays 9% with expected inflation 5%. Actual inflation later equals 4% in both economies. Under the approximation, which ranking reverses?',
        ['A has the higher expected real return (5% versus 4%); B has the higher realized real return (5% versus 3%)','B has the higher expected and realized real returns because its nominal rate is larger','A has the higher expected and realized real returns because its expected inflation is lower','Expected returns are equal, but realized returns depend on expected rather than actual inflation'],
        'Expected: A=7−2=5, B=9−5=4. Realized: A=7−4=3, B=9−4=5. Different expectations can reverse the ranking when actual inflation differs from forecasts.',proof(('7-2',5),('9-5',4),('7-4',3),('9-4',5))),
       (f'A lender wants a 3% expected real return on a ${x} loan. Expected inflation rises from 2% to 5% before a new fixed-rate contract is signed. Actual inflation then turns out to be 7%. Using the approximation, which nominal rate and realized return follow?',
        ['The new nominal rate is 8%; realized real return is 1%','The new nominal rate is 5%; realized real return is 3%','The new nominal rate is 10%; realized real return is 3%','The new nominal rate is 8%; realized real return is 3%'],
        'The new nominal rate uses expected inflation: 3+5=8%. Realized return then uses actual inflation: 8−7=1%. Actual inflation cannot retroactively set the signed nominal rate.',proof(('3+5',8),('8-7',1))),
       (f'A ${x} fixed nominal loan is agreed when expected inflation is 4%. Actual inflation is 1%. A colleague says lower inflation necessarily benefits the borrower because goods are cheaper. Which correction is strongest?',
        ['The fixed repayment buys more than expected, benefiting the lender and raising the borrower\'s real burden','The fixed repayment buys less than expected, benefiting the borrower and reducing the lender\'s real return','The nominal repayment automatically falls by three points, leaving both parties unaffected','The real repayment is fixed by the nominal contract, so changing inflation changes neither party\'s position'],
        'Relative to the forecast, lower inflation makes each repaid dollar more valuable. The nominal obligation does not automatically adjust, so the lender gains and borrower loses relative to expectation.',None)]
    elif concept=='cpi-versus-gdp-deflator':
      cases=[
       (f'A domestic economy buys ${x} of imported household fuel and produces machinery only for export. Fuel prices rise while machinery prices are unchanged. Which index selection and direction are appropriate, holding quantities fixed?',
        ['CPI rises from imported consumption; the GDP deflator need not rise because the fuel is not domestic output','Both rise equally because every purchase is included in both baskets','Only the GDP deflator rises because imported fuel is subtracted through net exports','Neither rises because imported prices are outside all domestic price statistics'],
        'CPI covers household consumption including imports. The GDP deflator covers domestically produced final output, including exports; unchanged domestic output prices need not reflect imported fuel inflation.',None),
       (f'A household benefit of ${x} must track consumption costs, while an analyst must convert nominal domestic GDP into real output. Imported food becomes dearer and domestic investment equipment becomes cheaper. Which pairing and implication are supported?',
        ['Use CPI for the benefit and the GDP deflator for GDP; the indexes can move differently because their coverage differs','Use the GDP deflator for the benefit and CPI for GDP; imported food belongs only in the deflator','Use CPI for both; imported consumption and domestic investment always have identical weights','Use the GDP deflator for both; household consumption excludes imported food'],
        'The purpose determines index choice. CPI tracks consumption costs; the deflator matches domestic final output. Imports and investment equipment enter these measures differently, so divergent movements are possible.',None),
       (f'A country produces only ${x} of export machinery and households consume only imported food. Machinery prices fall 4% while food prices rise 6%, with quantities fixed. Which pair is consistent?',
        ['CPI rises 6%; the GDP deflator falls 4%','CPI falls 4%; the GDP deflator rises 6%','Both indexes rise 6% because households pay that inflation','Both indexes fall 4% because domestic output determines every index'],
        'Under the deliberately distinct baskets, CPI follows imported household food and the deflator follows domestic machinery, even though all machinery is exported.',None),
       (f'An economy with nominal output ${x} reports a higher GDP deflator but unchanged CPI. Which proposed explanation could reconcile the reports without concluding either index is wrong?',
        ['Prices of domestic investment goods rose while household-consumption prices stayed fixed','Prices of imported household goods rose while every domestic output price stayed fixed','Every household and domestic output price rose in exactly the same proportion','Only current quantities changed while all current and base-year prices stayed identical'],
        'Investment goods are domestic final output but not household consumption. Their prices can raise the deflator while CPI remains unchanged; different scopes can explain the divergence.',None)]
    else:
      cases=[
       (f'A fixed basket includes {x} units of a food whose price rises sharply. Households switch toward a cheaper substitute while maintaining utility. What does the fixed-basket index miss, and how does that affect a payment fully indexed to it?',
        ['It misses cost-saving substitution; the indexed payment can exceed the increase in minimum cost of maintaining utility','It misses cost-saving substitution; the indexed payment necessarily falls short of that increase','It fully reflects the new choices; the indexed payment must exactly preserve every household\'s utility','It counts the substitute twice; the index necessarily falls despite the dearer original food'],
        'Pricing the unchanged basket can overstate the cost increase when consumers substitute to maintain utility. Indexing to that measure can overcompensate relative to the minimum cost-of-living increase.',None),
       (f'A product originally costs ${x}. Its replacement costs 20% more but provides twice the measured service, with no other relevant quality changes. What should a quality-aware comparison avoid?',
        ['Calling the entire sticker-price increase inflation; cost per unit of service actually falls','Calling any of the sticker-price increase inflation; the price level of all other goods must fall','Treating the replacement as a new product; all quality gains must enter quantity only in every index','Holding service quality constant; comparable-price measurement should ignore quality'],
        'The replacement\'s price per service unit is 1.20/2 = 0.60 of the old level. A like-for-like comparison must adjust for quality rather than automatically calling the full 20% higher price inflation.',proof(('1.2/2',.6))),
       (f'A new product expands choice while the statistical basket still spends ${x} on older products. Which inference respects both the new-goods limitation and the continued use of CPI?',
        ['Delayed inclusion can miss gains in purchasing opportunities; that limitation does not make every observed CPI change meaningless','Delayed inclusion means CPI is a complete cost-of-living measure because consumers previously did not buy the new product','Delayed inclusion means actual prices cannot change until the product enters the official basket','Delayed inclusion proves CPI understates every household\'s inflation by the same fixed amount'],
        'New goods can improve purchasing opportunities before an index incorporates them. The limitation is specific; it does not invalidate all price evidence or establish one universal bias size.',None),
       (f'A ${x} payment is indexed to measured CPI. A careful study estimates measured inflation at 5% but the cost of maintaining the recipient\'s utility at 3%, owing to substitution and new choices. Which real-outcome comparison follows under these estimates?',
        ['The payment grows faster than the estimated cost of maintaining utility; its real value relative to that cost rises about 1.9%','The payment exactly preserves utility because any official index equals every household\'s cost of living','The payment falls 2% in real value because measured inflation exceeds true cost growth','The payment rises 8% in real value because the two inflation rates should be added'],
        'The relevant factor is 1.05/1.03, about a 1.94% gain relative to the estimated utility-maintaining cost. The conclusion is conditional on the supplied estimates, not an assertion that every index overstates inflation by two points.',proof(('(1.05/1.03-1)*100',1.941747573)))]
    stem,ans,fb,p=cases[mode]
    emit(id,stem,ans,fb,tier='elite' if RECORDS[id]['q']['canonicalDifficulty']=='legendary' else 'hard',error='Selects the wrong comparison base, price scope, or expected-versus-realized measure for this task.',proof=p)
save()
