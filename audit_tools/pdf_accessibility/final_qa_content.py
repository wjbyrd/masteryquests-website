"""Faculty final-pass corrections. Applied to a frozen baseline, never cumulatively."""
import copy

def revise(records):
    rows=copy.deepcopy(records)
    def put(code, **fields): rows[code]['content'].update(fields)
    def replace(code, field, old, new):
        c=rows[code]['content'];assert old in c[field],(code,field,old)
        c[field]=c[field].replace(old,new)
    def keep(code,field,indices):
        c=rows[code]['content'];c[field]=[c[field][i] for i in indices]
    put('GEN-ECON-17',recognition=[
        'At $2 per gallon, buyers want 200 thousand gallons while sellers offer 100 thousand: a shortage.',
        'Above equilibrium, quantity supplied exceeds quantity demanded: a surplus.',
        'Compare quantities at the same price, then identify the pressure on price.'])
    put('GEN-ECON-02',recognition=['A toll changes the cost of driving and can change travel choices.', 'A reward raises the benefit of an action, even when the reward is not money.', 'A policy can change behavior in unintended ways; consider the incentives it creates.'])
    keep('GEN-ECON-05','recognition',[0,2,3])
    put('MACRO-15',core='Frictional unemployment comes from ordinary job search. Structural unemployment comes from lasting mismatches between workers\' skills and available jobs. Cyclical unemployment comes from weak demand during a recession.',recognition=['Search between jobs or after graduation is frictional unemployment.', 'A lasting technology or industry change can create structural unemployment.', 'Recession-related layoffs indicate cyclical unemployment.'])
    keep('MACRO-16','recognition',[2,3,4])
    put('MACRO-16',watch='A binding wage floor creates a surplus of labor: workers want more jobs than firms offer. The result assumes a competitive labor market; it is not a universal prediction for every wage increase.')
    replace('MACRO-19','core','the FOMC directs monetary policy','the Federal Open Market Committee (FOMC) directs monetary policy')
    keep('MACRO-19','recognition',[0,1,4])
    put('MACRO-20',outcome='Explain how bank capital absorbs asset losses.',check='If another $10 loan loss occurs and liabilities stay fixed, what happens to capital and reserves?')
    keep('MACRO-22','recognition',[1,3,4])
    put('MACRO-23',core='The quantity equation M × V = P × Y links the money stock (M), velocity (V), price level (P), and real output (Y). Velocity is the average number of times money finances final spending in a period. With velocity stable and output determined by productive capacity, sustained money growth above real-output growth raises long-run inflation.',worked='Hold V = 2 and Y = 10,000 fixed. At M = 2,500, P = (2,500 × 2) / 10,000 = 0.50. Doubling M to 5,000 raises P to 1.00. The graph plots the reciprocal, 1/P: the value of money falls from 2 at a to 1 at b. Both calculations describe the same 100% price-level increase.',recognition=['Use M × V = P × Y to solve for a missing variable.', 'With velocity and real output fixed, a proportional money increase produces the same proportional price increase.', 'Distinguish the price level P from the value of money 1/P.'])
    put('MACRO-24',core='Monetary neutrality means that a lasting money-supply change affects nominal variables but not real output or employment in the long run. Nominal values are measured in money; real values measure goods, services, or purchasing power. Proportional increases in nominal wages and prices leave the real wage unchanged.')
    put('MACRO-25',recognition=['At a given real rate, higher expected inflation raises the nominal rate lenders require.', 'A fixed nominal contract reflects inflation expected when the contract is set.', 'Actual inflation determines the realized real return; it can differ from the expected return.'])
    put('MACRO-26',core='Unexpected inflation causes arbitrary redistribution of purchasing power between borrowers and lenders on fixed nominal contracts. Even expected inflation has costs: changing prices uses resources (menu costs), economizing on cash takes effort (shoeleather costs), and uneven price changes obscure relative-price signals. Taxes on nominal interest or gains can also distort real returns when tax rules are not fully indexed.')
    put('MACRO-28',recognition=['At a fixed money supply, greater money demand raises the equilibrium interest rate.', 'Higher income or prices can increase money demand for transactions.', 'A lower interest rate raises the quantity of money demanded along the existing curve.'])
    replace('MACRO-28','core','Higher money demand with fixed money supply raises interest rates. ','')
    replace('MACRO-29','core','Expansionary policy increases reserves and tends to lower interest rates','In the limited-reserves model, expansionary policy adds reserves and tends to lower interest rates')
    put('MACRO-30',worked='At the displayed price level 100, higher government purchases shift aggregate demand from AD1 to AD2. Real output demanded rises from Y1 = 100 to Y2 = 150. A tax cut can also shift demand right through disposable income and consumption. These are quantities demanded at a fixed price level; equilibrium output also depends on supply.')
    put('MACRO-31',core='A fiscal expansion can generate further income-consumption rounds. The marginal propensity to consume (MPC) is the share of extra disposable income spent. With fixed prices, lump-sum taxes, and no import leakage, the spending multiplier is 1 / (1 - MPC) and the tax multiplier is -MPC / (1 - MPC). Higher interest rates can offset part of the expansion by crowding out private investment.',recognition=['Separate the initial spending change from induced consumption rounds.', 'A tax cut affects consumption only through the share of extra income spent.', 'Higher interest rates reduce private investment, offsetting part of the gross expansion.'])
    replace('MACRO-32','worked','With MPC = 0.8','With a marginal propensity to consume (MPC) of 0.8 and no import leakage or crowding out')
    put('MACRO-33',recognition=['Movement along AD: a change in the current price level changes real output demanded.', 'Shift of AD: consumption, investment, purchases, or net exports change independently of the price level.', 'Compare quantities at the same price level to identify a shift.'],watch='A current price-level change moves along aggregate demand (AD). A change in planned spending at every price level shifts AD. Identify which variable changes first.')
    replace('MACRO-34','core','Short-run aggregate supply shows','Short-run aggregate supply (SRAS) shows')
    replace('MACRO-36','core','changes SRAS over time','changes short-run aggregate supply (SRAS) over time')
    replace('MACRO-36','core','Output returns toward LRAS.','Output returns toward potential, marked by long-run aggregate supply (LRAS).')
    put('MACRO-37',core='The short-run Phillips curve (SRPC) shows an inverse relationship between inflation and unemployment while expected inflation and supply conditions are fixed. A demand expansion moves the economy up and left along the curve; weaker demand moves it down and right.',recognition=['Identify inflation on the vertical axis and unemployment on the horizontal axis.', 'With expectations and supply conditions fixed, a demand change moves along one SRPC.', 'Changed inflation expectations or supply conditions shift the curve.'],watch='Lower unemployment and higher inflation describe movement along one SRPC only when expectations and supply conditions stay fixed. A shift changes inflation at a given unemployment rate.')
    put('MACRO-38',core='The long-run Phillips curve (LRPC) is vertical at the natural unemployment rate because expected inflation eventually adjusts. A demand expansion can temporarily reduce unemployment, but rising inflation expectations shift the short-run Phillips curve (SRPC) upward. Changes in job matching or skill mismatches can change the natural rate and shift LRPC.',recognition=['A demand expansion initially moves along the short-run curve.', 'As inflation expectations rise, the short-run curve shifts upward and unemployment returns to the natural rate.', 'Improved job matching can lower the natural rate, shifting LRPC left.'])
    put('MACRO-41',core='The sacrifice ratio is cumulative output lost, as a percentage of one year\'s potential output, per percentage-point reduction in inflation. Add annual percentage output gaps before dividing by the inflation decline. Credibility and faster expectations adjustment can reduce the cost of disinflation.',recognition=['Use percentage output gaps, not unscaled dollar losses.', 'Add losses across all years of the disinflation.', 'Divide by the percentage-point fall in inflation.'])
    put('MACRO-42',core='Let Y be income/output, T net taxes, C consumption, G government purchases, I investment, and S national saving. Private saving is Y - T - C; public saving is T - G. Thus S = Y - C - G. In a closed economy, S = I. In simplified open-economy accounting without net income or transfers from abroad, S = I + NCO and NX = NCO, where NCO is net capital outflow and NX is net exports.')
    replace('MACRO-45','core','investment falls along the demand curve: crowding out.','investment falls along the demand curve. This reduction is crowding out.')
    put('MACRO-45',recognition=['A larger deficit reduces public saving and, other things equal, national saving.', 'Lower national saving shifts loanable-funds supply left.', 'The higher real interest rate reduces private investment along the demand curve.', 'Less investment can slow the growth of the future capital stock.'])
    put('MACRO-46',core='Let T be net taxes (taxes minus transfers) and G government purchases. In simplified saving accounting, public saving is T - G: positive for a surplus, negative for a deficit. The deficit G - T has the opposite sign. Published budgets may include broader outlays, such as interest payments; match revenue and spending categories before comparing balances.',watch='A $40 deficit means public saving is -$40 in this simplified accounting. Transfers are already deducted in net taxes; do not also count them as government purchases.')
    replace('MACRO-48','core','also matter at a Principles level','also matter')
    replace('MACRO-49','core','m = 1 / rr','m = 1 / rr, where rr is the required reserve ratio,')
    replace('MACRO-50','core','Long-run aggregate supply is','Long-run aggregate supply (LRAS) is')
    replace('MACRO-50','worked','SRAS shifting','short-run aggregate supply (SRAS) shifting')
    replace('MACRO-50','worked','With AD0 unchanged','With aggregate demand AD0 unchanged')
    put('MACRO-51',core='Short-run equilibrium occurs where aggregate demand (AD) intersects short-run aggregate supply (SRAS). Long-run aggregate supply (LRAS) marks potential output. An intersection left of LRAS is a recessionary gap; one right of LRAS is an inflationary gap. Long-run equilibrium requires all three curves to meet at potential output.')
    replace('MACRO-52','core','Net capital outflow is','Net capital outflow (NCO) is')
    replace('MACRO-52','core','In the course accounting model','In simplified accounting without net income or transfers from abroad')
    put('MACRO-52',watch='A trade deficit is consistent with negative net capital outflow: foreign purchases of domestic assets exceed domestic purchases of foreign assets. Use the same period and accounting assumptions for both measures.')
    put('MACRO-53',core='A nominal exchange rate states how much one currency trades for another. With a quotation in foreign currency per unit of domestic currency, a higher rate means domestic appreciation and a lower rate means depreciation. Write the units before converting currencies or calculating a percentage change.',worked='At 0.90 euros per dollar, $200 buys 200 × 0.90 = 180 euros. A rise to 0.99 is (0.99 - 0.90) / 0.90 = 10% dollar appreciation; $200 buys 198 euros. Alternatively, a fall from 0.90 to 0.81 is 10% depreciation; $200 buys 162 euros.')
    put('MACRO-54',core='Let e be foreign currency per domestic currency, P the domestic basket price, and P* the price of the same basket abroad. The real exchange rate is ε = e × P / P*. Higher ε means domestic goods are relatively more expensive: real appreciation. Purchasing-power parity (PPP) implies ε = 1 for identical baskets under frictionless arbitrage. Transport costs, trade barriers, and nontraded goods limit this benchmark.',recognition=['Nominal e compares currencies; real ε compares converted basket prices.', 'Higher e or P raises ε; higher P* lowers ε, other things equal.', 'Real appreciation tends to reduce exports and raise imports.'],watch='State the quotation and compare equivalent baskets. Price indexes with arbitrary base years need not yield ε = 1 even when comparable goods obey purchasing-power parity.',worked='A basket costs $50 at home and 40 foreign units abroad; e = 0.80 foreign units per dollar. Then ε = 0.80 × 50 / 40 = 1.00. With e and P* fixed, a rise in P to $55 gives ε = 1.10, a 10% real appreciation. Alternatively, a fall in P to $45 gives ε = 0.90, a 10% real depreciation.',check='With e and P fixed, foreign basket prices rise. Does ε rise or fall, and is this a real appreciation or depreciation?')
    replace('MACRO-55','core','Net capital outflow equals','Net capital outflow (NCO) equals')
    put('MACRO-55',watch='Net capital outflow (NCO) records asset transactions; net exports (NX) record goods and services. Their equality in simplified accounting assumes no net income or transfers from abroad. An asset purchase is not itself an export.')
    put('MACRO-56',core='The foreign-exchange market determines an exchange rate and the quantity of currency traded. This diagram quotes foreign currency per U.S. dollar: a higher value means dollar appreciation. Demand for dollars slopes downward and gross-flow supply slopes upward. Greater foreign demand for U.S. goods or assets can shift demand right; greater U.S. demand for foreign goods or assets can shift supply right.')
    put('MACRO-57',core='A larger deficit reduces national saving and raises the real interest rate, other things equal. Domestic assets become more attractive, so net capital outflow (NCO) falls. Dollar supply shifts left, the dollar appreciates, and net exports (NX) fall. Here price levels are fixed, and vertical dollar supply equals NCO at the domestic real interest rate determined in the loanable-funds market.')
    put('MICRO-06',core='Income elasticity measures the percentage change in quantity demanded divided by the percentage change in income, holding prices fixed. A normal good has positive income elasticity: demand rises with income. An inferior good has negative income elasticity: demand falls as income rises. Among normal goods, elasticity above one indicates a luxury and between zero and one a necessity.')
    put('MICRO-07',recognition=['A positive cross-price elasticity indicates substitutes; a negative value indicates complements.', 'If Y\'s price falls 8%, a rise in demand for X indicates complements; a fall indicates substitutes.', 'Use the price of the other good, not the good\'s own price.'])
    put('MICRO-09',recognition=['An elasticity of 2.1 means a 1% price increase reduces quantity demanded by about 2.1%, other things equal.', 'Compare the elasticity coefficient with one to judge proportional responsiveness.', 'For tax incidence, the less elastic side bears more of the burden.'],check='Demand is less elastic than supply. Which side bears more of a per-unit tax, and why?')
    put('MICRO-17',worked='Without trade, price is $50 and quantity is 30. At the $30 world price, domestic production is 10 and consumption is 50, so imports are 40. Each gain-from-trade triangle has height $50 - $30 = $20. The production-side base is 30 - 10 = 20; the consumption-side base is 50 - 30 = 20. Total gains are 2 × (1/2 × 20 × 20) = $400.')
    put('MICRO-22',core='Average fixed cost (AFC) is fixed cost per unit; average variable cost (AVC) is variable cost per unit. Average total cost (ATC) is their sum: ATC = AFC + AVC. AFC falls as output spreads fixed cost over more units. Marginal cost (MC) pulls each average down when below it and up when above it.',watch='AVC is the thick dashed curve; the fine dotted lines are reading guides. The vertical gap between ATC and AVC is AFC, not marginal cost.')
    # The existing PC-04 and MON-02 originals are retained as the clearer shared figures.
    put('MICRO-32',core='For a competitive firm, short-run supply follows marginal cost (MC) at or above minimum average variable cost (AVC). Below minimum AVC, shutdown minimizes loss. Higher variable input costs shift MC and supply; higher fixed cost alone does not shift the short-run supply curve.')
    put('MICRO-33',core='Economic profit attracts entry; economic loss encourages exit. Entry increases market supply and lowers price, while exit does the reverse. With free entry and identical firms, long-run equilibrium has zero economic profit: price equals minimum average total cost (ATC). Firms still earn the normal return included in economic cost.',recognition=['Positive economic profit attracts entry and shifts market supply right.', 'Persistent losses encourage exit and shift market supply left.', 'At long-run equilibrium, price, marginal cost (MC), and minimum ATC are equal.'],watch='Zero economic profit includes a normal return to owners. It does not mean zero accounting profit or zero revenue.',worked='The market price is $25 at quantity 100. The representative firm produces 50 where price equals MC and minimum ATC, so economic profit is zero. Average variable cost (AVC) is $17, below price. Entry or exit has removed the incentive for further changes in the number of firms.')
    put('MICRO-34',core='Long-run industry supply depends on input costs as firms enter or exit. In a constant-cost industry, expansion leaves input costs unchanged and long-run supply is horizontal. In an increasing-cost industry, expansion raises costs and supply slopes upward. In a decreasing-cost industry, expansion lowers costs and supply slopes downward.',recognition=['Track input costs as the entire industry expands, not just one firm.', 'Unchanged, rising, or falling costs imply horizontal, upward, or downward long-run supply.', 'The displayed upward curve represents an increasing-cost industry.'],check='If industry expansion leaves input prices unchanged, what shape does long-run industry supply take?')
    replace('MICRO-37','watch','equate mr and price','equate MR and price')
    replace('MICRO-37','core','marginal revenue less than price','marginal revenue (MR) less than price')
    put('MICRO-38',core='A single-price monopolist chooses output where marginal revenue (MR) crosses marginal cost (MC) from above, so extra units change from adding to reducing profit. It then reads price from demand at that output. This interior rule must be checked against shutdown; MR = MC alone does not guarantee positive profit.',watch='Read quantity where MR crosses MC, then price on demand. An upward-sloping MC curve is not essential; the relevant condition is MR crossing MC from above.')
    for field in ['core','watch','worked']:
        c=rows['MICRO-39']['content'];c[field]=c[field].replace('(P - ATC)Q','(P - ATC) × Q').replace('(P - ATC) x Q','(P - ATC) × Q')
    put('MICRO-40',watch='A single-price monopolist restricts quantity and raises price relative to the competitive benchmark. Lost trades create deadweight loss; the transfer from consumers to the firm is not itself deadweight loss.')
    put('MICRO-42',core='Price discrimination charges different prices for reasons beyond cost differences. It requires market power, information about willingness to pay (WTP), and limits on resale. Perfect first-degree discrimination charges each buyer their WTP; it can expand output to the efficient quantity and transfer consumer surplus to the seller.',watch='Different prices alone do not prove discrimination; costs may differ. Perfect first-degree discrimination is a special case, not a description of every student discount or coupon.')
    for field in ['core','watch','worked','check']:
        rows['MICRO-42']['content'][field]=rows['MICRO-42']['content'][field].replace('wtp','WTP')
    put('MICRO-44',core='A firm with a differentiated product faces downward-sloping demand. At an interior optimum, choose quantity where marginal revenue (MR) crosses marginal cost (MC) from above, then read price from demand. Compare price with average total cost (ATC) for profit or loss and with average variable cost (AVC) for the short-run shutdown decision.')
    put('MICRO-45',core='In monopolistic competition, profit attracts entry and losses encourage exit. Entry reduces demand for each existing firm until price equals average total cost (ATC), eliminating economic profit. With downward-sloping demand, price remains above marginal cost (MC), and output is below the quantity minimizing ATC: excess capacity.')
    put('MICRO-47',core='Product differentiation provides variety that consumers value, but firms may produce below the quantity that minimizes average total cost. Assess the benefit of a better product match alongside higher unit costs and markups. Productive efficiency alone does not measure the full welfare effect of variety.',recognition=['More varieties can better match different preferences.', 'Smaller production runs can raise average cost.', 'Compare the value of variety with costs and markups before judging welfare.'],check='A town gains more fitness-class options, but each provider serves fewer customers at a higher average cost. What benefit and cost should be compared?')
    put('MICRO-48',core='Oligopoly is a market in which a few large firms account for much of sales and must anticipate rivals\' responses. Concentration describes the distribution of market shares. It can signal strategic interdependence, but market definition, entry, and actual conduct also matter.',worked='Firms A and B hold 38% and 32%, together 70% of sales. The four named firms hold 91%; the remaining 9% is a fringe of smaller firms. A large firm considering a price cut must anticipate how its major rivals will respond.',check='Why does the 9% Other category not necessarily represent one large rival?')
    put('MICRO-50',core='A cartel coordinates output restrictions and higher prices. A prisoner\'s dilemma arises when each firm benefits from undercutting regardless of its rival\'s action, yet mutual undercutting leaves both worse off than cooperation.',recognition=['Compare a firm\'s payoffs separately for each possible rival action.', 'Undercutting is dominant if it pays more in both comparisons.', 'Check whether mutual undercutting pays less than mutual cooperation.'],watch='A jointly profitable agreement may be unstable when each firm can gain by breaking it. Compare individual incentives, not just the sum of payoffs.')
    replace('MICRO-51','core','Repeated interaction can make future consequences matter, but no present-value calculation is needed here.','Repeated interaction can make future retaliation outweigh an immediate gain from cheating.')
    put('MICRO-52',core='Tacit coordination aligns firms\' behavior without an explicit agreement. With price leadership, rivals follow a leading firm\'s price changes. Kinked demand illustrates price rigidity when rivals match cuts but not increases, creating a gap in marginal revenue (MR). Firms can still compete through quality, service, and advertising.',recognition=['Price leadership occurs when rivals follow a leading firm\'s price changes.', 'A kink and an MR gap can explain unchanged price after a modest cost change.', 'Improved quality or service is nonprice competition.'],check='In the displayed model, MC rises from $36 to $38. Do price and quantity change, and why?')
    put('MICRO-53',core='Merger policy weighs reduced rivalry against verifiable efficiencies, innovation, entry, and consumer effects. Reduced competition can raise prices, restrict output, and create deadweight loss. Concentration is evidence about market structure, not a complete welfare verdict.',watch='Higher profit is not the same as deadweight loss. A transfer from consumers to firms differs from surplus lost when beneficial trades disappear. Evaluate entry, efficiencies, and likely price and output effects.',worked='A merger raises market concentration and may increase market power. Suppose it also cuts marginal cost by $4 per unit and entry remains easy. Compare the likely effects of reduced rivalry with the verifiable cost reduction and entry evidence before judging the merger.',check='Does higher post-merger concentration alone settle the welfare question?')
    put('MICRO-54',core='An externality affects someone outside a transaction and is not reflected in its price. Marginal social cost (MSC) includes marginal private cost (MPC) and external cost. Marginal social benefit (MSB) includes marginal private benefit (MPB) and external benefit. Efficiency compares MSB with MSC; private choices compare MPB with MPC.')
    rows['MICRO-55']['content']['core'] += ' For efficient provision, marginal social benefit (MSB) equals marginal cost (MC).'
    put('MICRO-58',core='Consumers choose the most preferred affordable bundle. The budget line shows combinations that exhaust income; indifference curves connect equally preferred bundles. The optimum lies on the highest attainable indifference curve. With smooth, convex preferences and an interior solution, that curve is tangent to the budget line; some preferences instead yield a corner solution.',watch='Tangency applies to a smooth interior optimum. A bundle on a higher curve is irrelevant if it is unaffordable; a corner optimum need not satisfy tangency.')
    replace('MICRO-65','core','nearly the same','the same') if 'nearly the same' in rows['MICRO-65']['content']['core'] else None
    # Additional findings from the complete-library reading, beyond faculty IDs.
    put('MICRO-01',recognition=['A higher price discourages quantity demanded and encourages quantity supplied.', 'Improved production technology can reduce scarcity and lower price.', 'A legal ceiling can prevent price adjustment and leave a shortage.'])
    keep('MICRO-03','recognition',[0,2,4])
    replace('MICRO-04','core','PED = absolute percentage change in quantity demanded divided by percentage change in price','PED = the absolute value of percentage quantity change divided by percentage price change')
    put('MICRO-05',core='Price elasticity of supply is percentage quantity-supplied change divided by percentage price change. The midpoint method divides each change by the average of its starting and ending values. Elasticity above one means a more-than-proportional quantity response. Spare capacity, storage, and time to adjust production generally make supply more elastic.')
    replace('MICRO-09','core','Labor demand is a derived factor demand. ','')
    put('MICRO-11',core='Producer surplus is price received minus the seller\'s minimum acceptable price. Supply represents marginal willingness to accept, reflecting opportunity cost. On a graph, producer surplus is the area above supply and below price up to quantity traded.')
    put('MICRO-12',check='If a buyer values an additional unit more than its production cost, would making that trade increase total surplus?')
    put('MICRO-15',check='If a policy raises total surplus but leaves low-income households worse off, what efficiency and equity questions should be considered separately?')
    put('MICRO-24',core='Fixed costs affect average fixed cost (AFC) and average total cost (ATC). Variable-input costs affect average variable cost (AVC), ATC, and marginal cost (MC). A higher fixed cost alone raises ATC but leaves AVC and MC unchanged.',recognition=['A higher lease payment changes fixed cost at every output.', 'Higher variable-input prices change the cost of producing additional units.', 'A technology improvement can reduce variable inputs needed at each output.'])
    put('MICRO-25',core='A sunk cost has already been incurred and cannot be recovered. It is identical across current alternatives, so it should not affect the choice. Avoidable costs change with the action chosen and belong in the comparison of future benefits and costs.',watch='Fixed does not necessarily mean sunk. A refundable license payment is recoverable, so the refund forgone by continuing is relevant to a shutdown decision.')
    replace('MICRO-26','core','Long-run average cost shows','Long-run average cost (LRAC) shows')
    put('MICRO-26',recognition=['A downward LRAC segment means economies of scale; an upward segment means diseconomies.', 'In the long run, every input and plant size can change.', 'Diminishing marginal product instead holds at least one input fixed.'],check='At Q = 30 the LRAC curve is falling, while at Q = 90 it is rising. Which point shows economies of scale and which shows diseconomies?')
    put('MICRO-27',core='Minimum efficient scale (MES) is the smallest output attaining minimum long-run average cost (LRAC). If the minimum is flat, MES is the start of that range. Output can expand across the flat range without changing cost per unit.',check='If LRAC first reaches its minimum at 5,000 units and remains flat until 8,000, what is MES?')
    put('MICRO-28',core='A perfectly competitive firm takes market price (P) as given. Each additional unit adds the same amount to revenue without lowering the price on previous units. Thus average revenue (AR) and marginal revenue (MR) both equal price: P = AR = MR.')
    replace('MICRO-28','worked','Choosing the profit-maximizing output is a separate later step.','This revenue relationship does not by itself identify the best output; costs also matter.')
    put('MICRO-29',core='For a price-taking firm, marginal revenue (MR) equals market price. An additional unit raises profit when MR exceeds marginal cost (MC) and lowers profit when MC exceeds MR. The operating optimum is where rising MC crosses MR, provided producing covers avoidable costs.',watch='The marginal crossing identifies the best positive output. Compare revenue with avoidable costs before choosing that output over shutdown.')
    put('MICRO-30',core='Choose the best operating output by comparing marginal revenue (MR) and marginal cost (MC). Then compare price (P) with average total cost (ATC): above ATC means profit, equal means break-even, and below means loss. Profit = (P - ATC) × Q. A loss does not imply shutdown if revenue covers variable costs.')
    put('MICRO-35',watch='The competitive efficiency result assumes prices reflect social marginal benefits and costs. Externalities, market power, or incomplete information can break that connection.',check='Why does price equal to marginal cost indicate allocative efficiency only when private benefits and costs reflect social benefits and costs?')
    put('MICRO-43',core='Monopolistic competition combines many sellers and relatively easy entry with differentiated products. Differentiation gives each firm a downward-sloping demand curve and some pricing discretion. Close substitutes limit that discretion; entry can eliminate economic profit in the long run.')
    # Remove precisely identified redundant sentences without rewriting sound examples.
    put('MACRO-04',core='GDP measures market production, not complete well-being. It omits much unpaid work and does not directly measure leisure, environmental quality, income distribution, or all changes in product quality. A higher GDP can accompany either improvements or declines in these dimensions.',recognition=['Unpaid household production can create value without entering measured GDP.', 'Environmental damage or less leisure can offset gains from additional market output.', 'Average GDP does not show how income is distributed.'])
    keep('MACRO-06','recognition',[0,1,3])
    keep('MACRO-09','recognition',[0,2,4])
    put('MACRO-11',core='Labor productivity is real output per unit of labor input, often per hour worked. Divide real output by labor hours and keep the measurement period consistent. Higher total output alone does not prove productivity rose; hours may have risen faster.')
    for code in rows:
        c=rows[code]['content']
        # Literal x between numbers is mathematical multiplication, not a variable.
        for field in ['core','worked','watch','check','outcome']:
            c[field]=c[field].replace('  ',' ')
        # No generic shortening, stem rewriting, or concept substitution is applied.
    replace('MICRO-04','core','PED = the absolute value','PED is the absolute value')
    replace('MICRO-30','core','Profit = (P - ATC) × Q.','Calculate total profit as (P - ATC) × Q.')
    put('MACRO-19',recognition=['The Federal Reserve conducts monetary policy; the Treasury manages federal finances.', 'The FOMC sets the monetary-policy stance and directs open-market operations.', 'Commercial banks issue deposits; the central bank issues the reserve balances banks use for payments.'])
    put('MICRO-45',watch='Zero economic profit includes the normal return to owners. It does not mean zero accounting profit, and it does not prove allocative or productive efficiency.')
    put('GEN-ECON-08',recognition=['Points on the frontier use current resources efficiently; inside points leave capacity unused.', 'Using idle resources changes the production point, while resources or technology shift the frontier.', 'A bowed-out frontier indicates increasing opportunity cost.'],watch='Moving from inside to the frontier uses idle capacity. Moving the frontier outward requires more resources or better technology.')
    put('GEN-ECON-25',recognition=['Read the free-trade outcome at the world price, then apply the import limit.', 'A binding quota raises domestic price, increasing production and reducing consumption.', 'Distinguish quota rent from deadweight loss and identify who receives the rent.'],watch='Import-right holders receive quota rent. An auction can transfer it to government; foreign rent recipients reduce the importing country\'s national-surplus gain.',worked='Without trade, price is $7. Free trade at $3 gives domestic supply of 75 and demand of 275 thousand units: imports of 200 thousand. At the quota price $6, supply is 150 and demand 200 thousand, leaving 50 thousand imports. Each permitted import earns $6 - $3 = $3 of quota rent.')
    put('MICRO-04',core='Price elasticity of demand (PED) is the absolute value of percentage quantity change divided by percentage price change. The midpoint method divides each change by the average of its starting and ending values, giving the same result in either direction. PED above one is elastic, one is unit elastic, and below one is inelastic.',recognition=['Use midpoint averages when comparing two price-quantity points.', 'Close substitutes, time to adjust, a larger budget share, and a narrower market make demand more elastic.', 'A straight demand curve has constant slope but varying elasticity.'],watch='Elasticity compares percentage changes; slope compares changes in the original units. A steep-looking curve is not automatically less elastic.')
    put('MICRO-13',recognition=['Match the highest-value buyers with the lowest-cost sellers.', 'Complete trades while willingness to pay covers opportunity cost.', 'Stop when the next unit costs more than the buyer values it.'])
    put('MICRO-14',workedLabel='CONSUMER SURPLUS BEFORE AND AFTER',recognition=['Calculate the relevant surplus areas before and after the change.', 'Separate transfers between buyers and sellers from gains that disappear.', 'Demand alone identifies consumer surplus; total-surplus effects also require supply.'])
    put('MICRO-16',core='At the world price, read domestic consumption from demand and production from supply. Imports fill any excess of consumption over production; exports absorb excess production over consumption. Use the same world price for both readings.',recognition=['Compare world price with the no-trade equilibrium price.', 'Read consumption and production at the world price.', 'Consumption above production means imports; production above consumption means exports.'],watch='When world price exceeds the no-trade price, domestic production exceeds consumption: the difference is exports. This free-trade example has no tariff revenue.')
    put('MICRO-22',recognition=['ATC equals AFC plus AVC.', 'The ATC-AVC gap is fixed cost per unit and shrinks as output increases.', 'MC below an average pulls it down; MC above it pulls it up.'])
    put('MICRO-40',core='A single-price monopoly restricts output and raises price relative to competition. Some consumer surplus transfers to the seller; that transfer stays in total surplus. Deadweight loss is the gain lost on units whose buyer value exceeds marginal cost but that the monopoly does not produce.',recognition=['Find monopoly quantity where marginal revenue (MR) crosses marginal cost (MC).', 'Compare it with the efficient quantity where demand meets MC.', 'Separate a surplus transfer from the loss on unproduced trades.'],workedLabel='MONOPOLY AND EFFICIENT OUTPUT')
    put('MICRO-44',recognition=['Choose the operating output where MR crosses MC, then read price from demand.', 'Compare price with ATC to identify profit or loss.', 'Compare revenue with variable cost before deciding whether to shut down.'])
    put('MICRO-52',workedLabel='PRICE RIGIDITY AT A KINK',worked='The kink is at Q = 20 and P = $50. Rivals match price cuts but not increases, so demand is steeper below the kink. Marginal revenue jumps down from $40 to $20 at Q = 20. MC = $36 lies in that gap: cost changes that remain within it leave the chosen price and quantity unchanged.')
    put('MICRO-57',core='Marginal product of labor (MPL) is the extra output from one more worker. For a price-taking seller, the value of marginal product (VMP) equals output price times MPL. A firm that also takes the wage as given hires to the point where VMP equals the wage.',workedLabel='LABOR DEMAND AND THE WAGE',recognition=['A wage change moves along labor demand; productivity or output-price changes shift it.', 'Worker preferences, population, training, and alternative jobs can shift labor supply.', 'Market labor demand and supply determine the competitive wage and employment.'])
    put('MICRO-58',recognition=['Inside or on the budget line is affordable; outside is unaffordable.', 'Income changes shift the line in parallel; a one-price change pivots it.', 'Choose the highest attainable indifference curve, allowing for a corner solution.'])
    put('MACRO-30',core='Fiscal policy changes aggregate demand (AD) through government purchases, taxes, and consumption. Higher purchases directly raise spending; a tax cut raises disposable income and can increase consumption. Induced spending rounds magnify the initial effect, while crowding out can offset part of it.',recognition=['Higher purchases or lower taxes shift AD right; opposite policies shift it left.', 'Taxes affect consumption through disposable income.', 'A fiscal action shifts AD; a price-level change moves along it.'])
    put('MACRO-57',recognition=['Lower national saving raises the real rate and lowers NCO, other things equal.', 'Lower NCO shifts vertical dollar supply left, appreciating the dollar.', 'Appreciation reduces NX when price levels stay fixed.'],workedLabel='A DEFICIT AND THE DOLLAR')
    put('GEN-ECON-12',watch='A change in the good\'s own price moves along demand. Only a nonprice determinant shifts the demand curve.')
    put('MICRO-30',recognition=['Locate the operating output where MR crosses MC.', 'Compare price with ATC for per-unit profit or loss; multiply by output for the total.', 'A loss-making firm can still operate if revenue covers variable costs.'])
    put('MICRO-35',core='With price-taking firms and no market failures, price equal to marginal cost gives allocative efficiency: the last unit\'s value equals its cost. Production at minimum average total cost (ATC) gives productive efficiency. Free entry and exit can deliver both in long-run competitive equilibrium.',recognition=['Allocative efficiency compares price with marginal cost.', 'Productive efficiency requires minimum ATC.', 'Check whether private benefits and costs capture all social effects.'])
    replace('MACRO-42','core','income/output','income')
    replace('MACRO-50','worked','right/down','right and down')
    for field in ['core','watch']:
        rows['MICRO-39']['content'][field]=rows['MICRO-39']['content'][field].replace('(P−ATC)Q','(P - ATC) × Q')
    put('MICRO-39',recognition=['Choose quantity where MR crosses MC from above, then read price from demand.', 'Compare price with average total cost to identify per-unit profit or loss.', 'A loss-making firm operates only if revenue covers avoidable variable cost.'])
    put('MICRO-65',core='A framing effect occurs when different presentations of economically equivalent information change choice. Gain and loss frames can draw attention to different features even though costs, probabilities, and consequences are unchanged.',recognition=['First verify that the underlying alternatives are economically equivalent.', 'Compare gain wording with loss wording, such as survival versus mortality.', 'A choice change caused by presentation, rather than different outcomes, indicates framing.'])
    for code,phrase in [('MICRO-31','competitive firm'),('MICRO-43','monopolistic competition'),('MICRO-47','monopolistic competition')]:
        replace(code,'watch',f'A common mistake is to misapply {phrase} rule. ','')
    replace('MICRO-48','worked','The four named firms hold 91%','Firms A through D hold 91%')
    put('MICRO-49',watch='A cell with the largest combined payoff need not be an equilibrium. Check each player\'s incentive to switch while holding the other player\'s action fixed.')
    replace('MACRO-03','core','GDP is a strong measure of market production for its purpose, but it omits some dimensions of welfare. ','')
    return rows

# Labels follow the actual worked task and transfer demanded by Check Yourself.
# B: recognition/one direct operation; I: linked distinctions or structured steps;
# A: competing effects, strategic anticipation, or a chain across several models.
DIFFICULTY = {
 'GEN-ECON': '''
B|Identify a scarce resource and the resulting choice.
B|Recognize the behavior encouraged by a changed incentive.
B|Identify the next-best forgone alternative.
B|Compare one marginal benefit with one marginal cost.
B|Classify a question by individual-market or economy-wide scope.
B|Distinguish a testable claim from a value judgment.
B|Recognize why a simplifying assumption is used.
I|Read frontier points, calculate opportunity cost, and distinguish efficiency from attainability.
I|Compute relative opportunity costs and identify mutually beneficial trade terms.
I|Separate evidence, assumptions, and values in a policy recommendation.
I|Apply price-taking conditions and assess how changed competition affects them.
I|Read a demand curve and distinguish own-price movement from a demand shift.
I|Identify a non-price determinant and infer a demand shift.
I|Read a supply curve and distinguish own-price movement from a supply shift.
I|Identify a cost determinant and infer the supply response.
I|Locate equilibrium and explain adjustment away from it.
I|Read two quantities at one price, calculate the imbalance, and infer adjustment.
I|Combine two shifts and identify the outcome that depends on relative magnitudes.
I|Test whether a ceiling binds, then infer quantities and shortage.
I|Test whether a floor binds, then infer quantities and surplus.
I|Distinguish statutory liability from the division of a tax wedge.
I|Calculate buyer and seller burdens and relate their division to elasticity.
I|Compare world and domestic prices and calculate trade quantities.
A|Combine tariff effects on price, quantities, revenue, and surplus.
A|Combine quota quantities with rent allocation and national-welfare effects.
A|Weigh distributional effects and policy claims against aggregate gains.
''',
 'MACRO': '''
I|Apply the production boundary and avoid double counting.
I|Classify expenditures while accounting for imports and inventories.
I|Calculate nominal and constant-price output from a price-and-quantity schedule.
B|Recognize why measured output is not a complete welfare measure.
I|Price a fixed basket and calculate an index and inflation rate.
I|Distinguish substitution, new-goods, and quality-measurement biases.
I|Compare coverage and weighting of two price indexes.
I|Use an index ratio to preserve purchasing power.
I|Separate nominal, expected real, and realized real returns.
I|Distinguish aggregate growth from real output per person.
B|Calculate output per hour using one ratio.
I|Distinguish capital deepening from technology and diminishing returns.
I|Connect a growth policy to productivity while considering its costs.
I|Classify labor-force status and calculate two differently denominated rates.
B|Classify the cause of unemployment using three explicit definitions.
I|Connect institutions to incentives, wages, and labor-market quantities.
I|Separate cyclical from natural unemployment and assess structural changes.
I|Distinguish functions of money and classify assets using stated monetary definitions.
B|Identify central-bank functions and distinguish the Treasury and commercial banks.
I|Apply the balance-sheet identity and trace a loss through capital and reserves.
I|Distinguish immediate tool effects from transmission in different reserve regimes.
I|Trace reserve holding and currency drain through deposit expansion.
I|Solve the quantity equation under stated assumptions and invert the price level.
I|Compare nominal changes with unchanged real purchasing power.
I|Separate expected inflation from realized inflation and calculate the nominal rate.
I|Compute realized returns and classify distributional and resource costs.
I|Calculate purchasing-power changes and distinguish deflation from disinflation.
I|Identify money-market equilibrium, shifts, and interest-rate adjustment.
A|Trace reserve changes through interest rates, spending, and aggregate demand across panels.
I|Connect fiscal action to spending and a fixed-price demand shift.
A|Combine multiplier rounds, tax timing, crowding out, and equilibrium qualifications.
A|Evaluate policy timing and a supply-shock stabilization tradeoff.
I|Separate price-level movements from independent spending shifts.
I|Separate a current-price movement from input-cost or expectation shifts.
I|Compare demand and supply shocks using output and price responses.
A|Trace an output gap through wage adjustment and the return to potential.
I|Map a demand change to movement along a curve with expectations fixed.
A|Trace the short-run expansion, expectations shift, and return to natural unemployment.
I|Distinguish an expectations shift from movement along the short-run curve.
A|Trace disinflation through temporary unemployment and expectations adjustment.
I|Convert annual losses to gaps, sum them, and divide by an inflation change.
I|Calculate private and public saving and reconcile closed/open-economy identities.
I|Read equilibrium and distinguish excess planned saving from excess investment.
I|Identify a saving or investment shift and trace interest-rate and quantity effects.
A|Trace deficits through national saving, interest rates, investment, and capital formation.
B|Subtract stated net taxes and purchases and interpret the sign.
I|Reconcile annual budget flows with an accumulated debt stock.
I|Compare levels with ratios and avoid treating one ratio as a sustainability verdict.
I|Trace repeated deposit rounds and calculate the multiplier under explicit restrictions.
I|Distinguish productive-capacity shifts from temporary changes in actual output.
A|Trace demand expansion and subsequent supply adjustment across three equilibria.
I|Classify trade and asset transactions and reconcile saving/investment identities.
I|Convert currencies and calculate appreciation and depreciation with explicit units.
I|Combine exchange quotations with basket prices and interpret real currency changes.
I|Calculate net capital outflow and infer the response to relative returns.
I|Read currency-market shifts using the stated exchange-rate quotation.
A|Trace policy or capital flight through saving, rates, capital flows, currency, and net exports.
''',
 'MICRO': '''
I|Connect a changed price signal to the allocation of scarce resources.
I|Read buyer/seller prices, calculate a tax wedge, and calculate revenue.
I|Compare private and social margins and calculate the surplus effect of an externality.
I|Calculate midpoint percentage changes and interpret price elasticity.
I|Compare short-run and long-run supply responsiveness using proportional changes.
I|Calculate an income elasticity and classify normal/inferior and luxury/necessity goods.
I|Calculate cross-price elasticity and interpret its sign with the other good's price.
I|Combine price and quantity changes to infer revenue and elasticity.
I|Apply responsiveness to revenue and tax-burden comparisons.
I|Read willingness to pay and calculate consumer surplus.
I|Read willingness to accept and calculate producer surplus.
I|Combine buyer and seller gains and distinguish transfers from total surplus.
I|Compare marginal benefit and cost to identify efficient quantity.
I|Calculate and compare surplus before and after a price change.
I|Compare total surplus and its distribution without equating efficiency with equity.
I|Read domestic production and consumption and calculate imports or exports.
A|Compare autarky with trade and calculate two welfare triangles and distributional effects.
I|Separate explicit expenditure from forgone opportunity costs.
I|Calculate accounting and economic profit and interpret a normal return.
I|Calculate marginal product from a schedule and identify diminishing returns.
I|Reconstruct fixed, variable, total, average, and marginal costs from a schedule.
I|Relate three average costs to marginal cost and identify the fixed-cost gap.
I|Link changes in productivity with marginal cost using schedule differences.
I|Distinguish fixed-cost shifts from variable-cost and marginal-cost changes.
B|Exclude an unrecoverable payment when comparing remaining alternatives.
I|Interpret scale economies and diseconomies along long-run average cost.
I|Identify the start of a minimum-cost range and distinguish it from the entire flat range.
I|Relate a price-taking firm's price to average and marginal revenue.
I|Find the relevant marginal crossing and check the operating condition.
I|Separate output choice from per-unit profit and calculate total profit or loss.
I|Compare price with variable and total costs to choose operation or shutdown.
I|Identify the supply segment and distinguish fixed from variable cost shifts.
A|Trace profit incentives through market entry, price adjustment, and firm equilibrium.
I|Distinguish three industry cost conditions and their long-run supply implications.
A|Connect firm and market outcomes to two efficiency concepts and model limits.
B|Recognize a barrier to entry and a source of monopoly power.
I|Distinguish demand from marginal revenue when a price cut applies to all units.
I|Choose quantity at the marginal crossing and read monopoly price from demand.
I|Combine monopoly output choice, average cost, profit, and shutdown conditions.
A|Compare monopoly and competitive quantities and separate transfers from deadweight loss.
A|Weigh efficient pricing, cost recovery, and subsidy incentives for a natural monopoly.
I|Distinguish price discrimination from cost differences and its perfect-information limit.
B|Recognize differentiated products and the resulting downward-sloping firm demand.
I|Apply quantity choice, demand pricing, profit, and the shutdown comparison.
A|Trace entry to tangency while distinguishing zero profit, markup, and excess capacity.
I|Distinguish informational and persuasive effects of nonprice competition.
A|Weigh consumers' value of variety against unit cost and markup effects.
I|Calculate concentration shares and explain strategic interdependence and fringe aggregation.
I|Compare payoffs conditional on each rival action to find dominant strategies and equilibrium.
I|Identify dominant undercutting and explain why cooperation is jointly better but unstable.
A|Use backward induction and credible responses to predict sequential entry decisions.
I|Connect rival responses to a kink and test a cost change within the marginal-revenue gap.
A|Weigh merger rivalry, efficiency, entry, and consumer effects without a single-statistic verdict.
I|Separate private from social margins and infer overproduction or underproduction.
I|Classify rivalry/excludability and vertically sum benefits for efficient provision.
I|Connect market power to output restrictions and evaluate a regulatory response.
I|Link marginal product, product price, labor demand, and the wage-taking hiring rule.
I|Compare affordability and preferences and recognize the scope of an interior tangency.
I|Read cumulative shares and compare inequality measures before and after transfers.
I|Trace hidden risk before contracting into selection and changes in the insurance pool.
B|Identify changed incentives and hidden action after a contract.
I|Distinguish informed-party signaling from uninformed-party screening and credibility.
I|Distinguish preference reversal from ordinary discounting and evaluate a commitment device.
B|Recognize asymmetric reactions to equivalent gains and losses.
B|Recognize changed choices under equivalent presentations.
A|Aggregate three pairwise comparisons into a cycle and infer agenda dependence.
B|Identify which unrestricted collective-choice guarantees cannot all be met; no proof is required.
I|Locate the median and test majority coalitions under single-peaked one-dimensional preferences.
'''
}

def difficulty_rows(records):
    result=[]
    for prefix,block in DIFFICULTY.items():
        for i,line in enumerate(block.strip().splitlines(),1):
            level,reason=line.split('|',1);code=f'{prefix}-{i:02}'
            result.append({'code':code,'title':records[code]['title'],'before':records[code]['content']['difficulty'],'after':{'B':'Beginner','I':'Intermediate','A':'Advanced'}[level],'rationale':reason})
    assert len(result)==151 and {r['code'] for r in result}==set(records)
    return result
