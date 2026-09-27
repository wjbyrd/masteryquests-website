from checkpoint_support import *

for concept in ['money-functions-and-measures','central-bank-and-federal-reserve','bank-balance-sheets-reserves-and-capital','deposit-creation-and-money-multiplier','monetary-policy-tools','monetary-control-limits']:
 for j,id in enumerate(candidates(concept)):
    a=100+20*j;mode=j%4
    if concept=='money-functions-and-measures':
      cases=[
       (f'A customer deposits ${a} of currency into checking. A bank later makes a separate loan by crediting a borrower\'s checking account. Which comparison correctly separates the two events?',
        ['The currency deposit changes M1 composition; the later loan can create a new deposit and raise M1','Both events create new M1 equal to the amounts credited because checking balances rise','Neither event can change M1 because every bank deposit merely replaces currency','The currency deposit creates new M1; lending changes only the ownership of existing currency'],
        'In the first event, public currency falls as checking rises; in the second, a loan asset and deposit liability are created together. The initial transfer and subsequent credit creation must not be conflated.',None),
       (f'A household holds ${a} in checking, ${2*a} in savings, and ${a} in a small time deposit. Under current U.S. definitions, it transfers the time deposit into savings. Which M1/M2 changes follow?',
        [f'M1 rises ${a}; M2 is unchanged',f'M1 is unchanged; M2 rises ${a}',f'Both M1 and M2 rise ${a}',f'M1 falls ${a}; M2 is unchanged'],
        'Current M1 includes savings but not small time deposits. The transfer moves funds into M1 while remaining inside M2, so it is a reclassification within broad money, not an M2 increase.',None),
       (f'A store quotes a ${a} price in dollars but accepts a card that transfers dollars from a deposit account. A student calls the card a fourth function of money. Which correction connects the instrument and functions?',
        ['The dollar quote is a unit of account; the deposit money is the payment medium, while the card is a transfer instrument','The card is the unit of account; the dollar quote is the store of value','The quote is a medium of exchange; the card creates new money whenever it transfers a deposit','The card is itself commodity money; the deposit balance is excluded from payment'],
        'Distinguish the monetary unit and balances from the technology used to access them. Quoting prices uses a unit of account; paying transfers money through the card system.',None),
       (f'A report lists currency ${a}, checking ${2*a}, savings ${3*a}, and small time deposits ${a}. It adds savings to an M1 total that already includes savings. Using current U.S. definitions, which corrected pair avoids double counting?',
        [f'M1 = ${6*a}; M2 = ${7*a}',f'M1 = ${6*a}; M2 = ${10*a}',f'M1 = ${3*a}; M2 = ${4*a}',f'M1 = ${7*a}; M2 = ${7*a}'],
        f'M1 = {a}+{2*a}+{3*a} = {6*a}. M2 adds the time deposit once: {6*a}+{a} = {7*a}. Savings already inside M1 must not be added again.',proof((f'{a}+{2*a}+{3*a}',6*a),(f'{6*a}+{a}',7*a)))]
    elif concept=='central-bank-and-federal-reserve':
      cases=[
       (f'A solvent bank faces ${a} million of withdrawals before sound long-term assets mature. A different bank has assets below its liabilities. Which distinction guides central-bank liquidity support?',
        ['Temporary liquidity can bridge the first bank\'s timing gap; lending alone does not erase the second bank\'s capital loss','Both banks become solvent whenever a central bank supplies reserves, regardless of asset values','Neither bank can face a liquidity problem because every asset can always be sold instantly at book value','The first bank needs only a fiscal tax cut; the second needs only a new deposit classification'],
        'A sound but illiquid balance sheet can have a cash-timing problem. Insolvency is insufficient asset value relative to liabilities; a loan adds an asset and a liability and does not automatically restore net worth.',None),
       (f'A legislature authorizes ${a} million of spending while the central bank adjusts its monetary stance. Which accountability distinction is valid?',
        ['Fiscal authorities authorize spending; the central bank implements monetary policy under its legal mandate and accountability framework','The central bank writes the spending appropriation whenever monetary policy is independent','Independence means the central bank has no legal mandate or reporting obligation','The Treasury must approve every private bank loan because it authorizes public spending'],
        'Institutional separation distinguishes fiscal appropriations from monetary policy. Operational independence is compatible with a legislated mandate and accountability, not an absence of constraints.',None),
       (f'A central bank supplies ${a} million of reserves, but banks facing weak loan demand do not expand credit. Which conclusion correctly distinguishes central-bank money from commercial-bank lending?',
        ['Reserves can rise without an equal increase in loans; banks still evaluate demand, risk and capital','Every new reserve dollar must immediately become a commercial loan of the same amount','Weak loan demand prevents the central bank from creating reserve balances in the first place','A reserve injection directly raises every bank\'s capital by the amount supplied'],
        'Reserves are central-bank liabilities held by banks. Commercial lending creates bank assets and deposits and depends on additional constraints; reserves alone do not compel lending or create equity.',None),
       (f'A government wants a central bank to finance ${a} million of spending to avoid current taxes. The central bank\'s mandate instead prioritizes its stated stabilization objectives. Which institutional rationale for independence fits?',
        ['It can reduce pressure to trade monetary stability for short-run financing, while retaining legal accountability','It guarantees that monetary policy never makes an economic forecasting error','It gives the central bank authority to set tax brackets instead of the legislature','It removes the need to explain policy choices because independent agencies have no mandate'],
        'Independence can limit short-run political financing pressure and support credible policy. It is not a guarantee of perfect forecasts or a transfer of fiscal lawmaking powers.',None)]
    elif concept=='bank-balance-sheets-reserves-and-capital':
      cases=[
       (f'A bank has deposits ${10*a}, reserves ${2*a}, and a required reserve ratio of 10% in a simplified model. A depositor withdraws ${a} in currency. Assume no other balance-sheet change. Which reserve diagnosis follows?',
        [f'Reserves become ${a}, required reserves ${.9*a:g}, and excess reserves ${.1*a:g}',f'Reserves become ${a}, required reserves remain ${a}, and excess reserves are zero',f'Reserves stay ${2*a}, required reserves become ${.9*a:g}, and excess reserves ${1.1*a:g}',f'Reserves become ${a}, required reserves become ${1.1*a:g}, and there is a ${.1*a:g} shortfall'],
        f'The cash withdrawal reduces deposits and reserves by {a}. Required reserves are 10% of {9*a} = {.9*a:g}; actual reserves {a} leave {.1*a:g} excess. Both sides of the reserve calculation must reflect the withdrawal.',proof((f'({10*a}-{a})*.1',.9*a),(f'{a}-{.9*a}',.1*a))),
       (f'A bank has assets ${12*a}, deposit liabilities ${10*a} and capital ${2*a}. Loan losses reduce assets by ${3*a}; liabilities do not fall. Which remedy addresses the resulting problem?',
        [f'Capital becomes −${a}; new equity or loss resolution is needed, since a liquidity loan alone adds equal assets and liabilities',f'Capital remains ${2*a}; only cash withdrawals can reduce equity',f'Capital becomes ${5*a}; writing off loans removes liabilities rather than assets',f'A central-bank loan of ${a} automatically restores capital to zero because only assets rise'],
        f'After losses, assets are {9*a} and liabilities {10*a}; capital is −{a}. Borrowed liquidity raises assets and liabilities equally, leaving net worth unchanged.',proof((f'{12*a}-{3*a}-{10*a}',-a))),
       (f'A bank grants a ${a} loan by crediting the borrower\'s checking account; no cash leaves initially. Which entries and subsequent constraint are correct?',
        [f'Loan assets and deposit liabilities each rise ${a}; later payments may require reserve settlement',f'Reserve assets and capital each rise ${a}; no deposit liability is created',f'Deposit liabilities fall ${a} while loan assets rise; the bank\'s net worth rises immediately',f'The bank must first reduce another customer\'s deposit by ${a}; total deposits cannot increase'],
        'Loan origination creates a bank asset and a matching deposit liability, not instant bank equity. If the deposit is spent to another bank, settlement can create a reserve need.',None),
       (f'A bank has reserves ${2*a} and deposits ${10*a}; the simplified required reserve ratio is 10%. Management says it can lend all ${2*a} without acquiring reserves. Which correction is justified before considering capital and credit risk?',
        [f'Only ${a} is initially excess reserves; the ${a} required portion must remain against existing deposits',f'All ${2*a} is excess because required reserves are calculated only after lending',f'No reserves are excess because every reserve dollar is bank capital',f'It can lend ${20*a} immediately from its own reserves because the system multiplier applies to one bank\'s first loan'],
        f'Required reserves are .10×{10*a} = {a}; excess is {2*a}−{a} = {a}. A single bank\'s immediate capacity is distinct from a system-wide redepositing maximum.',proof((f'{10*a}*.1',a),(f'{2*a}-{a}',a)))]
    elif concept=='deposit-creation-and-money-multiplier':
      cases=[
       (f'In a simplified system with a 20% reserve ratio, no currency leakage and no excess reserves, ${a} of new reserves enters. A student calls the first bank\'s ${.8*a:g} initial loan the system\'s total deposit increase. Which correction is correct?',
        [f'The maximum total deposit increase is ${5*a}; repeated lending and redepositing extends beyond the first loan',f'The maximum total deposit increase is ${.8*a:g}; later deposits are excluded from money',f'The maximum total deposit increase is ${a}; banks cannot create deposits by lending',f'The maximum total deposit increase is ${6*a}; add the original reserve injection to the multiplier result again'],
        f'The simple maximum is ΔR/rr = {a}/.20 = {5*a}. The first-round loan is not the total expansion; the multiplier result already includes the deposits supported by the initial reserves.',proof((f'{a}/.2',5*a))),
       (f'The public deposits ${a} of previously held currency in a system with rr=10%, no later currency leakage and no excess reserves. At the simple maximum, how does total deposit expansion compare with the net increase in M1?',
        [f'Deposits can rise ${10*a}, while net M1 rises ${9*a} because public currency initially falls ${a}',f'Deposits and net M1 both rise ${10*a}; ignore the reduction in public currency',f'Deposits rise ${9*a} while net M1 rises ${10*a}; subtract the currency from deposits only',f'Deposits and net M1 both rise ${a}; all subsequent loans transfer existing deposits only'],
        f'The deposit maximum is {a}/.1 = {10*a}. M1 includes public currency, which falls {a}; net M1 change is {10*a}−{a} = {9*a}. Deposit growth and net new money differ for an initial currency deposit.',proof((f'{a}/.1',10*a),(f'{10*a}-{a}',9*a))),
       (f'New reserves of ${a} arrive. A 10% required ratio suggests a simple multiplier of 10, but banks also hold reserves equal to 10% of deposits; assume no currency leakage. Which maximum uses both reserve needs?',
        [f'${5*a} in total deposits; the effective reserve fraction is 20%',f'${10*a} in total deposits; excess reserves never constrain lending',f'${20*a} in total deposits; add the reciprocals of the two ratios',f'${2*a} in total deposits; multiply reserves by the percentage expressed as 2'],
        f'Required plus additional reserves total 20% of deposits. Thus deposits supported by {a} new reserves are {a}/.20 = {5*a}, rather than the required-ratio-only maximum.',proof((f'{a}/(.1+.1)',5*a))),
       (f'A textbook system has rr=25%, no currency leakage and no excess reserves. Policy removes ${a} in reserves. Which statement combines the direction and meaning of the model\'s maximum adjustment?',
        [f'Deposits contract by up to ${4*a}; this is a system redepositing result, not the size of the first bank\'s immediate loan recall',f'Deposits expand by up to ${4*a}; a lower reserve supply frees funds for lending',f'Deposits contract only ${a}; required reserves never link banks through redepositing',f'Deposits contract ${.25*a:g}; multiply by the required ratio instead of its reciprocal'],
        f'With the stated simplified assumptions, ΔD=ΔR/rr = −{a}/.25 = −{4*a}. The first-round reserve loss and cumulative system adjustment are different quantities.',proof((f'-{a}/.25',-4*a)))]
    elif concept=='monetary-policy-tools':
      cases=[
       (f'In an explicitly simplified scarce-reserves model, a central bank buys ${a} of securities from banks while the required ratio is unchanged. Which balance-sheet change begins the expansionary transmission?',
        ['Bank securities fall and reserves rise; easier reserve conditions can support lower short-term rates and lending','Bank securities rise and reserves fall; tighter reserve conditions support lower short-term rates','Bank capital rises by the purchase amount; no reserve or securities asset changes','Government tax liabilities fall by the purchase amount; reserves are unaffected'],
        'The purchase exchanges securities for reserve balances on bank balance sheets. Under the stated scarce-reserves model, greater reserve availability eases money-market conditions; it is not a fiscal tax cut or automatic equity gain.',None),
       (f'A central bank wants to contract broad deposits by ${4*a}. The estimated actual deposit multiplier is 4 rather than the textbook maximum of 10. Which reserve operation matches the estimate?',
        [f'Remove ${a} of reserves; using the maximum multiplier would understate the required removal',f'Add ${a} of reserves; a purchase is needed for contraction',f'Remove ${.4*a:g} of reserves; the maximum must be used even when actual behavior differs',f'Remove ${16*a} of reserves; multiply the desired deposit change by the actual multiplier'],
        f'Using the stated actual multiplier, ΔR=ΔD/m = −{4*a}/4 = −{a}. A maximum that overstates the actual multiplier would imply too small a reserve operation.',proof((f'-{4*a}/4',-a))),
       (f'In a simplified reserve-ratio exercise, a bank has deposits ${10*a} and reserves ${2*a}. The required ratio rises from 10% to 15%, with balances otherwise unchanged. Which result and limitation are correct?',
        [f'Excess reserves fall from ${a} to ${.5*a:g}; this tightens the stated constraint but does not prove actual lending falls by exactly that amount',f'Excess reserves rise from ${a} to ${1.5*a:g}; a higher requirement releases reserves',f'Total deposits automatically fall to ${5*a}; ratios alone rewrite existing deposit liabilities',f'Bank capital falls by ${.5*a:g}; a reserve requirement is a write-down of assets'],
        f'Old required reserves={a}; new required reserves=.15×{10*a}={1.5*a:g}. Excess falls from {a} to {.5*a:g}. Balance-sheet capacity is not a complete behavioral lending forecast.',proof((f'{2*a}-.15*{10*a}',.5*a))),
       (f'A policy package supplies ${a} of reserves but also increases the return banks can earn by holding reserves. Which assessment avoids assigning a mechanical loan-growth result?',
        ['More reserves ease one constraint, while the higher holding return can discourage lending; the net response needs behavior and magnitudes','Both actions necessarily expand loans equally because they both involve reserves','Both actions necessarily contract loans equally because reserve holdings cannot support deposits','Loan growth equals the reserve injection times a fixed multiplier regardless of the changed holding incentive'],
        'Reserve availability and the incentive to hold reserves are different margins. Their combination does not determine lending without the relevant behavior, risk, demand and magnitudes.',None)]
    else:
      cases=[
       (f'A simplified rr=10% model predicts a ${10*a} deposit maximum from ${a} in new reserves. Actual deposits rise only ${4*a}. Which diagnosis and inference are justified?',
        ['Reserve hoarding or currency leakage can lower the expansion; the effective multiplier here is 4','The required ratio must be 25%; behavior can never lower expansion below the reciprocal rule','The banks must have created negative reserves because every prediction is an accounting identity','The shortfall proves the central bank cannot create reserves in the first place'],
        f'Observed deposit growth divided by new reserves is {4*a}/{a}=4. The 1/rr rule is a maximum under restrictive assumptions, not a behavioral guarantee; the data alone do not uniquely identify which leakage caused the shortfall.',proof((f'{4*a}/{a}',4))),
       (f'Banks receive ${a} in reserves but face few creditworthy loan applications. A proposal assumes more reserves alone will create a fixed proportional lending boom. Which missing link matters?',
        ['Reserve capacity must be followed by willing banks and qualified borrowers; weak loan demand can interrupt transmission','Qualified borrowers determine reserve creation, so a central bank cannot supply reserves before lending','Every reserve dollar is a loan request, so demand is already guaranteed','Banks can expand lending only by lowering existing deposit balances one for one'],
        'Having liquidity is different from finding loans acceptable to both lender and borrower. Reserve supply alone does not establish demand, risk-adjusted profitability or capital headroom.',None),
       (f'Households withdraw ${a} from checking into currency while the total of M1 initially stays constant. In a bank-reserve model, which change can still weaken later deposit expansion?',
        ['Banks lose reserves and deposits; unchanged initial M1 does not imply unchanged bank lending capacity','Banks gain reserves and deposits; currency withdrawals expand the redepositing base','Bank capital automatically rises by the currency withdrawal, raising lending capacity','M1 must fall initially because currency held by households is outside money'],
        'Checking falls while public currency rises, initially preserving M1. The banking system loses reserves and a deposit liability; less reserve availability can constrain later deposit creation despite unchanged initial money.',None),
       (f'Two otherwise comparable banking systems receive ${a} in reserves. In A, banks lend available funds and payments are redeposited. In B, banks hold additional reserves and customers retain more currency. Which comparison is supported?',
        ['A can support a larger deposit expansion; the simple multiplier is less descriptive of B\'s behavior','B must support a larger expansion because holding reserves is itself lending','Both expansions must be equal because the required reserve ratio alone determines actual lending','A\'s expansion must be zero because redepositing cancels every loan'],
        'Extra reserve holdings and currency retention reduce successive lending/redepositing rounds. The same reserve injection and formal required ratio need not produce the same actual multiplier.',None)]
    stem,ans,fb,p=cases[mode];emit(id,stem,ans,fb,tier='elite' if mode==3 else 'hard',error='Confuses reserve capacity, commercial-bank money creation and the behavioral limits of the stated model.',proof=p)

for id,answers in {
 'ECON-EC-LEGENDARYBOSS-20019':[
  'Productivity and potential living standards can rise while displaced workers face a structural skill mismatch requiring adjustment',
  'Productivity can rise while displaced workers face only cyclical unemployment that disappears as soon as the new machines operate',
  'Productivity must fall when workers are displaced, even if output per worker rises and unit costs fall',
  'Productivity can rise while displaced workers face only frictional search, even when their old skills no longer fit vacancies'],
 'ECON-NL-FINALBOSS-4039':[
  'Part-time employment can hide unmet hours, discouraged exits are outside unemployment, and the excess above natural signals cyclical weakness',
  'Part-time employment counts as unemployment, discouraged exits are outside unemployment, and the excess above natural signals cyclical weakness',
  'Part-time employment can hide unmet hours, discouraged exits remain unemployed, and the excess above natural signals cyclical weakness',
  'Part-time employment can hide unmet hours, discouraged exits are outside unemployment, and the excess above natural proves only structural unemployment'],
 'PM2B4-UTYPE-L-002':[
  'Listings can shorten matching for skilled movers; workers with obsolete qualifications may additionally need retraining or mobility support',
  'Listings can resolve the obsolete-qualification mismatch; skilled movers additionally need new qualifications before any matching can occur',
  'Listings can shorten matching for both groups; information alone removes the missing-qualification constraint just as it removes search friction',
  'Listings cannot affect either group; both need aggregate-demand expansion rather than matching or qualification changes']
}.items():
    old=q(id);task(id,old['q'],answers,old['feedback'],old['type'],keep_image=True)
save()
