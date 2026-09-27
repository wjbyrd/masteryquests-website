from checkpoint_support import *

for concept in ['budget-accounting-and-public-saving','deficits-debt-and-government-borrowing','debt-measures-burden-and-fiscal-data','saving-and-investment-identities']:
 for j,id in enumerate(candidates(concept)):
    a=20+10*j;mode=j%4
    if concept=='budget-accounting-and-public-saving':
      cases=[
       (f'In a simplified closed-economy account, net taxes are ${5*a} and government purchases ${6*a}. A new policy raises both by ${a}. Which conclusion separates the budget position from the balanced policy change?',
        [f'Public saving remains −${a}; equal changes leave the initial deficit unchanged',f'Public saving becomes zero; any equal tax-and-spending change balances the whole budget',f'Public saving becomes −${2*a}; count higher purchases but ignore higher net taxes',f'Public saving becomes +${a}; the larger tax total makes the initial deficit irrelevant'],
        f'Before: T−G={5*a}−{6*a}=−{a}. After: {6*a}−{7*a}=−{a}. Equal changes do not erase the initial imbalance.',proof((f'{6*a}-{7*a}',-a))),
       (f'Government receives ${6*a} in taxes, pays ${a} in transfers and buys ${5*a} of current output. Define net taxes as taxes minus transfers. A report calls the transfers an additional purchase. Which accounts are consistent?',
        [f'Net taxes are ${5*a}, purchases ${5*a}, public saving zero; transfers are not G',f'Net taxes are ${6*a}, purchases ${6*a}, public saving zero; transfers are G',f'Net taxes are ${5*a}, purchases ${6*a}, public saving −${a}; count transfers twice',f'Net taxes are ${6*a}, purchases ${5*a}, public saving +${a}; ignore transfers in the budget'],
        'Transfers reduce net taxes in this convention and are not purchases of current output. Tnet−G = (gross taxes−transfers)−purchases = 0.',proof((f'({6*a}-{a})-{5*a}',0))),
       (f'During a recession, tax receipts fall ${a} and unemployment-benefit payments rise ${a//2}, with tax rates and benefit rules unchanged. Which budget interpretation is supported?',
        [f'The deficit rises ${1.5*a:g} through automatic stabilizers; no new discretionary law is required',f'The deficit falls ${.5*a:g} because lower taxes are government saving',f'The deficit is unchanged because unchanged rules imply unchanged receipts and outlays',f'The deficit rise proves a new spending law passed during the recession'],
        f'Lower receipts and higher benefit payments both widen the deficit: {a}+{a//2} = {a+a//2}. Endogenous budget changes under existing rules are automatic stabilization.',proof((f'{a}+{a//2}',a+a//2))),
       (f'A forecast shows revenues ${5*a}, outlays ${7*a}, and borrowing ${2*a}. A later forecast raises revenues by ${a} with outlays fixed. Which revision and limit follow?',
        [f'The projected deficit falls to ${a}; this is a revised forecast, not proof actual debt already fell',f'The projected deficit becomes a ${a} surplus; any revenue gain eliminates all borrowing',f'The projected deficit remains ${2*a}; forecasts cannot respond to revenue assumptions',f'Actual debt immediately falls ${a}; a forecast revision is a realized repayment'],
        f'New projected deficit = {7*a}−{6*a}={a}. A projection is conditional; it is not a record of completed borrowing or repayment.',proof((f'{7*a}-{6*a}',a)))]
    elif concept=='deficits-debt-and-government-borrowing':
      cases=[
       (f'Public debt begins at ${10*a}. The government runs deficits of ${a} and ${2*a} in two years. Ignore valuation changes and other stock-flow adjustments. Which ending stock and explanation are correct?',
        [f'${13*a}; deficits accumulate into the debt stock rather than replacing it',f'${2*a}; the latest deficit is the whole debt stock',f'${3*a}; only deficits during the displayed years count as debt',f'${7*a}; deficits reduce outstanding liabilities'],
        f'Ending debt is initial {10*a}+{a}+{2*a}={13*a}. A deficit is a period flow; debt is the accumulated outstanding stock under the stated assumptions.',proof((f'{10*a}+{a}+{2*a}',13*a))),
       (f'Debt rises from ${10*a} to ${11*a}, but nominal GDP rises from ${20*a} to ${24*a}. Which pair can be true?',
        ['The debt stock rises while debt/GDP falls from 50% to about 45.8%','The debt stock and debt/GDP both fall because GDP grows faster','The debt stock rises and debt/GDP must rise by the same 10%','Debt/GDP remains 50% because debt and GDP both rise'],
        'The numerator rises 10%, but the denominator rises 20%. Ratios are 10/20=.50 and 11/24≈.4583; a lower ratio does not mean debt was repaid.',proof(('10/20*100',50),('11/24*100',45.83333333))),
       (f'The overall deficit is ${a}, including interest outlays of ${2*a}. Define the primary balance as revenues minus noninterest outlays. Which diagnosis follows?',
        [f'The primary balance is a ${a} surplus even though the overall budget is in deficit',f'The primary balance is a ${3*a} deficit because interest is added a second time',f'The primary balance is zero because all deficits consist entirely of interest',f'The primary balance equals the outstanding debt stock of ${a}'],
        f'Overall deficit = primary deficit + interest. Primary deficit = {a}−{2*a}=−{a}, so there is a primary surplus of {a}. Flow definitions matter.',proof((f'{a}-{2*a}',-a))),
       (f'A government refinances ${3*a} of maturing debt and borrows another ${a} to finance its deficit. Ignore other adjustments. What is the net change in debt?',
        [f'+${a}; refinancing replaces maturing obligations rather than adding all gross issuance',f'+${4*a}; every newly issued security is a net addition to debt',f'−${2*a}; subtract maturities without the replacement borrowing',f'$0; refinancing prevents any deficit from increasing debt'],
        f'Gross issuance {4*a} minus redeemed principal {3*a} yields net borrowing {a}. Refinancing and financing a new deficit are distinct.',proof((f'{4*a}-{3*a}',a)))]
    elif concept=='debt-measures-burden-and-fiscal-data':
      cases=[
       (f'Federal debt held by the public is ${10*a}; intragovernmental holdings are ${2*a}. A report adds foreign-held debt, already inside public holdings, again. Which correction avoids double counting?',
        [f'Gross federal debt is ${12*a}; foreign holdings are a subset of public debt, not a third component',f'Gross debt is ${10*a}; intragovernmental holdings are never part of gross federal debt',f'Gross debt is ${2*a}; only accounts within government create debt',f'Gross debt requires adding foreign holdings again because residence changes the liability\'s identity'],
        f'Gross debt = public {10*a}+intragovernmental {2*a}={12*a}. A residence breakdown of public holders does not create another liability.',proof((f'{10*a}+{2*a}',12*a))),
       (f'Government pays ${a} in interest and repays ${4*a} in principal on maturing debt. Which fiscal-data comparison keeps debt service concepts distinct?',
        [f'Interest expense is ${a}; principal repayment reduces liabilities or is refinanced, rather than becoming interest expense',f'Interest expense is ${5*a}; every cash payment on debt is interest',f'Interest expense is ${4*a}; only the maturing face value measures financing cost',f'Interest expense is zero if new securities finance the cash payment'],
        'Interest is the cost of borrowing over the period. Principal retires an existing liability; refinancing changes financing flows but does not reclassify principal as interest.',None),
       (f'A projection has public debt of ${10*a} and GDP ${20*a}. An alternative has debt ${12*a} and GDP ${30*a}. Which ranking respects both nominal levels and the debt ratio?',
        ['The alternative has more nominal debt but a lower ratio: 40% rather than 50%','The alternative has less nominal debt because its debt ratio is lower','The alternative has a higher ratio because its nominal debt is higher','The two ratios are equal because both debt and GDP changed'],
        'Use the same measure in each numerator and its matching GDP denominator: 10/20=50%, 12/30=40%. A ratio and its numerator can rank differently.',proof(('12/30*100',40),('10/20*100',50))),
       (f'An outlook projects interest costs rising from ${a} to ${2*a} while the debt stock and effective interest rate also rise. Which conclusion separates an accounting explanation from a causal claim?',
        ['Both a larger debt base and a higher effective rate can raise interest costs; the totals alone do not isolate their contributions','The cost increase must come only from debt because interest rates never affect government outlays','The cost increase must come only from rates because the debt base is irrelevant','Higher interest outlays prove the principal stock doubled, regardless of the rate change'],
        'Interest costs depend on the debt base, rate and maturity/repricing structure. Observing the total change alone does not identify one cause or a unique decomposition.',None)]
    else:
      cases=[
       (f'A household saves ${a} and buys an existing corporate share. A firm separately builds ${2*a} of new domestic equipment. Which national-accounts distinction and financing inference are correct?',
        ['The share is a financial-asset purchase; the new equipment is investment, and saving may finance investment without being the same transaction','Both are GDP investment because both buyers expect future returns','Only the share is GDP investment because the equipment is a business expense','Neither can be investment unless the same household directly operates the equipment'],
        'Saving is income not consumed; buying an existing share changes asset ownership. GDP investment records new capital production. Financial intermediation can connect savers and investors without making the purchases identical.',None),
       (f'In a closed economy, Y=${10*a}, C=${6*a}, net taxes T=${2*a}, and G=${3*a}. Which saving decomposition reconciles the identity?',
        [f'Private saving ${2*a}, public saving −${a}, national saving and investment ${a}',f'Private saving ${4*a}, public saving −${a}, national saving ${3*a}',f'Private saving ${2*a}, public saving +${a}, national saving ${3*a}',f'Private saving ${a}, public saving ${2*a}, national saving ${3*a}'],
        f'Private saving=Y−T−C={2*a}; public=T−G=−{a}; national=Y−C−G={a}. In the stated closed-economy identity, I=S={a}.',proof((f'{10*a}-{2*a}-{6*a}',2*a),(f'{2*a}-{3*a}',-a),(f'{10*a}-{6*a}-{3*a}',a))),
       (f'Private saving rises ${2*a} while public saving falls ${3*a}. Investment demand is initially unchanged in a closed-economy loanable-funds model. Which accounting change and behavioral pressure follow?',
        [f'National saving falls ${a}; reduced saving supply puts upward pressure on the real rate',f'National saving rises ${a}; public deficits are added as positive saving',f'National saving falls ${a}; investment demand must shift left by identity',f'National saving is unchanged; private and public saving are unrelated to national saving'],
        f'ΔS=ΔSprivate+ΔSpublic={2*a}−{3*a}=−{a}. In the specified market model the supply shift raises the rate and reduces equilibrium investment along demand; the identity does not require a demand-curve shift.',proof((f'{2*a}-{3*a}',-a))),
       (f'In an open economy, national saving rises ${a} while domestic investment rises ${2*a}. A student applies the closed-economy S=I condition and says the data are impossible. Which reconciliation is correct?',
        [f'Net capital outflow and net exports fall ${a}; the open-economy identity is S−I=NCO=NX',f'Net capital outflow rises ${a}; reverse the saving-investment subtraction',f'National saving must be revised upward by ${a}; open economies also require domestic S=I each period',f'Net exports are unchanged because only exports, not investment, enter the saving identity'],
        f'Δ(S−I)={a}−{2*a}=−{a}. Cross-border investment and trade permit domestic saving and domestic investment to differ; this is an identity, not proof of which behavioral shock occurred.',proof((f'{a}-{2*a}',-a)))]
    stem,ans,fb,p=cases[mode]
    emit(id,stem,ans,fb,tier='elite' if mode==3 else 'hard',error='Confuses a stock, flow, component or accounting identity with the comparison requested.',proof=p)
save()
