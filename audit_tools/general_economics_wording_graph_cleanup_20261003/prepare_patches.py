"""Exact-scope editorial patches; run before apply.cjs. Does not edit the bank."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
audit=json.loads((HERE/'worklist.json').read_text(encoding='utf-8'))
old={x['id']:x for x in audit['evidence']}
patches={}
reviews={}
def edit(i,stem=None,options=None,feedback=None):
    p=patches.setdefault(i,{})
    if stem is not None:p['q']=stem
    if options is not None:p['options']=options
    if feedback is not None:p['feedback']=feedback
def stem(i):return patches.get(i,{}).get('q',old[i]['stem'])
def opts(i):return patches.get(i,{}).get('options',old[i]['options']).copy()
def replace(i,a,b):
    assert a in stem(i),(i,a)
    edit(i,stem(i).replace(a,b))

for finding in audit['wording_findings']:
    code=finding['code']
    for i in finding['ids']:
        reviews.setdefault(i,{'wording_reason':[]})['wording_reason'].append(finding['why'])
        if code=='W01':
            s=re.sub(r'^A (\w+) report opposes opening the (.+?) market because (producers|consumers) would lose\.',r'A report in \1 opposes opening the market for \2 to international trade because domestic \3 would lose.',stem(i));edit(i,s)
        elif code=='W02':replace(i,'a $8','an $8')
        elif code=='W03':
            replace(i,'Straight domestic supply and demand each change by one unit for every $1 price change.','For each $1 increase in price, quantity supplied rises by one unit and quantity demanded falls by one unit.')
            s=re.sub(r'A report calls all (\$[\d.]+) of consumer loss deadweight loss\. What is the correct correction\?',r'A report describes the entire \1 loss of consumer surplus as deadweight loss. Which statement correctly separates transfers from deadweight loss?',stem(i));edit(i,s)
            o=opts(i)
            o=[re.sub(r'(\$[\d.]+) a producer transfer, leaving (\$[\d.]+) destroyed',r'\1 is a gain in producer surplus, leaving \2 in deadweight loss',x) for x in o]
            o=[re.sub(r'all (\$[\d.]+) is destroyed because consumers pay it',r'the entire \1 consumer loss is deadweight loss',x) for x in o]
            o=[x.replace('revenue uses the original','revenue is calculated using the original') for x in o]
            edit(i,options=o)
        elif code=='W04':
            s=re.sub(r'^(\w+) has (P = .+?) and (P = .+?), with Pw = (\$\d+)\.',r'In \1, domestic demand is \2 and domestic supply is \3. The world price is \4.',stem(i))
            s=re.sub(r'A tariff is chosen to leave (\d+) imports\. Which ledger follows if the world price is unchanged\?',r'The government sets a tariff that reduces imports to \1 units. With the world price unchanged, which option correctly gives the tariff per unit, government revenue, and deadweight loss?',s);edit(i,s)
        elif code=='W05':
            s=re.sub(r"(\w+)'s (.+?) market has",r"In \1, the market for \2 has",stem(i))
            s=s.replace('Which complete import, revenue and distortion ledger is correct?','Which option correctly reports imports, tariff revenue, the production and consumption losses, and total deadweight loss?').replace('Which welfare ledger is correct?','Which option correctly reports imports, tariff revenue, the production and consumption losses, and total deadweight loss?');edit(i,s)
        elif code=='W06':replace(i,'Which additional evidence is most needed before crediting protection to infant-industry learning?','What additional evidence is needed to show that protection encouraged learning and that the resulting benefits justified its costs?')
        elif code=='W07':
            s=stem(i).replace('Domestic supply and demand are unchanged and straight.','The domestic demand and supply curves are linear and remain unchanged.').replace('the straight domestic curves stay fixed','the linear domestic demand and supply curves remain unchanged').replace('with straight curves and world price unchanged','with linear demand and supply curves and an unchanged world price').replace('with both straight curves and Pw unchanged','with both linear demand and supply curves and the world price unchanged');edit(i,s)
        elif code=='W08':
            if i=='P75-TRADE-H-007':replace(i,'What are their reciprocal costs of 1 Y?','What is each producer’s opportunity cost of one unit of Y, measured in units of X?')
            elif i=='P75-TRADE-M-009':replace(i,'what is the reciprocal opportunity cost of one bowl?','what is the opportunity cost of one bowl, measured in mugs?')
            else:replace(i,'Which reciprocal-rate assessment is correct?','Express the offered trading price in signs per badge. Which statement correctly identifies the exporter of badges and compares that price with both producers’ opportunity costs?')
            if i.startswith('P75'):edit(i,feedback=('River gives up 18/6 = 3 units of X per unit of Y; Hill gives up 12/8 = 1.5 units of X per unit of Y.' if i.endswith('H-007') else 'If one mug costs two bowls, one bowl costs half a mug.'))
        elif code=='W09':
            if i.endswith('H-010'):replace(i,'Which interval states strict mutual-gain rates in panels per bolt?','What range of trading prices, measured in panels per bolt, makes both producers better off than producing the goods themselves? Exclude prices at which either producer only breaks even.')
            elif i.endswith('L-007'):replace(i,'In motors per battery, which strict price range benefits both?','Measured in motors per battery, what range of trading prices makes both partners better off after shipping costs? Exclude break-even prices.')
            else:edit(i,'Coast’s opportunity cost of one unit of cocoa is 3 units of tea; Ridge’s is 6 units of tea. What range of trading prices, measured in units of cocoa per unit of tea, makes both producers better off? Exclude break-even prices.',feedback='Both gain when one unit of cocoa trades for more than 3 but less than 6 units of tea. In cocoa per unit of tea, the range is greater than 1/6 and less than 1/3. At either endpoint, one producer only breaks even.')
            if i.endswith('H-010'):edit(i,feedback='Both producers gain when the trading price is above East’s opportunity cost of 0.5 panel per bolt and below West’s cost of 1.25 panels per bolt. At either endpoint, one producer only breaks even.')
        elif code=='W10':
            if i.startswith('P52'):
                replace(i,'Within the gross ledger,','Before adjustment costs,')
                edit(i,options=[x.replace('full compensation is feasible in this ledger but requires the stated transfer','full compensation is feasible under the stated estimates but requires the transfer to be made') for x in opts(i)])
            else:replace(i,'Assume those export losses are not included in the first ledger. Which national assessment is correct?','These export losses are additional to the gains and losses already listed. What is the overall effect on national welfare?')
        elif code=='W11':edit(i,'Two economists agree on a policy’s effects but place different weight on fairness when judging the policy. What explains their different recommendations?')
        elif code=='W12':
            s={'P77-EPOL-M-007':'Two advisers agree on a policy’s predicted effects but place different weight on equity. What explains their disagreement?','P77-EPOL-R-039':'Must disagreement between economists reflect different political views?','P77-EPOL-BR-041':'A model’s conclusion depends on a particular assumption. What should an economist explain when using the model to advise policymakers?'}[i];edit(i,s)
        elif code=='W13':edit(i,'A forecast gives a range of possible effects rather than a single estimate. What does the range acknowledge?')
        elif code=='W14':edit(i,'Demand shifts to the right while supply remains unchanged. What happens to equilibrium price and quantity?')
        elif code=='W15':
            if i.endswith('EL-003'):
                replace(i,'A nonprofit grant rewards clients placed in jobs for 30 days.','A nonprofit grant rewards providers for placing clients in jobs that last at least 30 days.')
                replace(i,'Which redesign best preserves effort while limiting selection?','Which redesign would reward successful placements without encouraging providers to avoid clients who need more support?')
                edit(i,feedback='Rewarding sustained employment and adjusting targets for clients’ support needs encourages providers to help harder-to-place clients as well as those who can find jobs more easily.')
            else:
                replace(i,'A delivery app rewards acceptance rate. Some drivers accept poor-fit jobs and cancel later. Which design issue appears?','A delivery app rewards drivers for accepting a high share of requests. Some drivers accept deliveries they are unlikely to complete and cancel later. What problem does this reveal?')
                edit(i,options=[x.replace('The measured target encourages substitution into a different undesirable action','The reward encourages drivers to improve their acceptance rating by taking requests they later cancel') for x in opts(i)])
        elif code=='W16':
            edit(i,re.sub(r'Which margin (does the rule most directly target|is most directly affected)\?','Which decision does the rule most directly influence?',stem(i)))
        elif code=='W17':
            if i.endswith('H-007'):
                replace(i,'accepting the passenger displaces cargo margin of $170','carrying the passenger means giving up $170 in net earnings from cargo')
                edit(i,feedback='The added passenger brings $240 in revenue, costs $35 to serve, and replaces cargo that would have earned $170 net. The net marginal benefit is $240 - $35 - $170 = $35.')
            else:edit(i,'Adding one more flight would bring in $80,000 in revenue, incur $54,000 in operating costs, and impose $18,000 in expected delay costs on other flights. What is its net marginal benefit?')
        elif code=='W18':edit(i,'A hospital evaluates all benefits and costs using the same points scale. One treatment provides 88 benefit points and has a 42-point supply cost. The staff could instead remain available for emergencies, an alternative valued at 35 points. A different treatment method reduces the supply cost by 8 points but also reduces the benefit by 12 points. Which treatment method provides the greater net benefit compared with keeping the staff available for emergencies?')
        elif code=='W19':replace(i,'The marginal social decision is:','Taking all the listed benefits and costs into account, should the hospital add the test?')
        elif code=='W20':replace(i,'At what setup cost does C begin to set the opportunity cost strictly instead of B?','For what values of x would C have a higher net value than B and therefore determine A’s opportunity cost?')
        elif code=='W21':
            if i.startswith('P75'):
                replace(i,'Which claim is safest?','Which conclusion is supported?')
                edit(i,options=[x.replace('Comparative advantage can guide reallocation without universal complete specialization','Both producers can gain through specialization without either specializing completely') for x in opts(i)])
            else:replace(i,'Which assessment is exact?','Which statement correctly distinguishes the predictions from the board’s value judgment?')
        elif code=='W22':
            if i.endswith('318') or i.endswith('276'):
                s=re.sub(r'What is the seller-burden rectangle on (?:the )?units still traded, excluding (?:the )?surplus lost on missing trades\?', 'On the units still sold after the tax, what is the sellers’ total loss from receiving a lower price? Exclude surplus lost on sales that no longer occur.',stem(i));edit(i,s)
            elif i.endswith('277'):replace(i,'What is the combined buyer- and seller-burden rectangle on units still traded, which becomes government revenue?','On the units still traded, what is the combined tax burden on buyers and sellers, equal to government tax revenue?')
            else:
                replace(i,'total net-of-tax sales receipts','total sales revenue after paying the tax')
                replace(i,'tax burden per continuing unit','tax burden per unit still sold')
                edit(i,options=[x.replace('receipt decline','decline in sales revenue').replace('price burden on each continuing unit','tax burden per unit still sold') for x in opts(i)])

def graph(i,s,choices,feedback,read,check):
    """Choices supplied key-first; preserve each original keyed letter."""
    assert len(choices)==len(set(choices))==4
    index=old[i]['options'].index(old[i]['correct_option'])
    key=choices[0]; arranged=choices[1:].copy();arranged.insert(index,key)
    edit(i,s,arranged,feedback)
    reviews[i]={'graph_information_required':read,'numerical_or_graph_verification':check,'hide_graph_test':{'result':'YES','question':'Without the graph, at least two choices remain economically plausible','plausible_choices':[key,choices[1]],'reason':'The alternatives use the same valid economic relationship. The stem supplies no plotted values that distinguish these two answers; the labeled positions or measurements must be read from the unchanged image.'}}

# Graph-specific revisions follow. All image files and metadata remain unchanged.
graph('40001','On PPF0, what is the average opportunity cost of an additional pizza when production moves from A to B?',
 ['1 robot','0.5 robot','2 robots','3 robots'],
 'A is 20 pizzas and 120 robots; B is 60 pizzas and 80 robots. Giving up 40 robots for 40 additional pizzas costs 1 robot per pizza.',
 'The pizza and robot coordinates of A and B.','(120-80)/(60-20) = 1 robot per pizza.')
edit('40001','On PPF0, what is the average opportunity cost of an additional pizza over A to B, and how does opportunity cost change as production moves farther to the right?',
     [v+' per pizza; opportunity cost rises farther to the right' for v in opts('40001')],
     'A is 20 pizzas and 120 robots; B is 60 pizzas and 80 robots. Giving up 40 robots for 40 additional pizzas costs 1 robot per pizza on average. The frontier becomes steeper farther to the right, showing increasing opportunity cost.')
reviews['40001']['hide_graph_test']['plausible_choices']=[x+' per pizza; opportunity cost rises farther to the right' for x in reviews['40001']['hide_graph_test']['plausible_choices']]
graph('ECON-MG-MEDIUM-157','Compare the average opportunity cost of Good X over A to B and D to E. Which pair of costs, in units of Y per additional X, does the PPF show?',
 ['A to B: 0.625; D to E: 5','A to B: 0.5; D to E: 4','A to B: 1; D to E: 3','A to B: 1.25; D to E: 2.5'],
 'A to B gives up 5 Y for 8 X, so the cost is 0.625 Y per X. D to E gives up 20 Y for 4 X, so the cost is 5. The larger cost on the later segment illustrates increasing opportunity cost.',
 'Coordinates of A, B, D, and E; the relative slopes of those segments.','5/8=0.625; 20/4=5; both compared segments lie on the frontier.')
graph('ECON-MG-LEGENDARY-9004','Calculate the average opportunity cost of Good X over B to C and C to D. Which comparison supports the explanation that resources become less suited to producing additional X?',
 ['About 1.43 Y per X, then 2.5 Y per X','About 0.63 Y per X, then 1.43 Y per X','About 2.5 Y per X, then 5 Y per X','About 1 Y per X, then 2 Y per X'],
 'B=(8,45), C=(15,35), and D=(21,20). The costs are (45-35)/(15-8)=10/7, about 1.43, and (35-20)/(21-15)=2.5 Y per X. Rising costs are consistent with reallocating resources that are less well suited to X production.',
 'X and Y coordinates of B, C, and D.','10/7 and 15/6; all four alternatives rise, so increasing-cost theory alone does not select the key.')
graph('ECON-MG-LEGENDARY-9017','Demand shifts from D1 to D2 while supply stays at S1. Compare that equilibrium change with a movement along D1 from its intersection with S1 to its intersection with S2. Which pair of movements matches the graph?',
 ['Demand shift: (P2, Q1) to (P3, Q2); along D1: (P2, Q1) to (P1, Q2)',
  'Demand shift: (P2, Q2) to (P3, Q3); along D1: (P2, Q2) to (P1, Q3)',
  'Demand shift: (P1, Q2) to (P2, Q3); along D1: (P2, Q1) to (P1, Q2)',
  'Demand shift: (P2, Q1) to (P3, Q2); along D1: (P3, Q1) to (P2, Q2)'],
 'On S1, demand shifting from D1 to D2 moves equilibrium from (P2,Q1) to (P3,Q2). D1 intersects S1 at (P2,Q1) and S2 at (P1,Q2). The first movement reflects a change in demand; the second changes quantity demanded along D1.',
 'The intersections of D1 and D2 with S1, and of D1 with S2.','Graph intersections: D1/S1=P2,Q1; D2/S1=P3,Q2; D1/S2=P1,Q2.')
graph('40008','For the supply change from S0 to S1, compare the market equilibria A and B. Which changes in price and quantity accompany the decrease in supply?',
 ['Price rises $2; quantity falls 50 thousand tickets','Price rises $4; quantity falls 50 thousand tickets','Price rises $2; quantity falls 100 thousand tickets','Price rises $4; quantity falls 100 thousand tickets'],
 'A is at $10 and 200 thousand tickets. B is at $12 and 150 thousand tickets. Supply shifts left, raising price by $2 and reducing equilibrium quantity by 50 thousand tickets.',
 'The price and quantity coordinates of A and B.','12-10=2; 200-150=50 thousand.')
graph('40002','With the resources and technology represented by PPF0, which production combination would require greater productive capacity?',
 ['80 pizzas and 60 robots','20 pizzas and 120 robots','60 pizzas and 80 robots','100 pizzas and 0 robots'],
 'At 80 pizzas, PPF0 permits fewer than 60 robots, so that combination lies outside the frontier. The other combinations are A, B, and the pizza-axis intercept, all on PPF0.',
 'The location of each numerical combination relative to PPF0, including A, B, and the intercept.','A=(20,120); B=(60,80); X intercept=(100,0); at X=80 the curve is below Y=60.')
for i,world,direction in [('P62D-ITP-M-032',5,'imports'),('P62D-ITP-M-034',10,'exports')]:
    vals=[7,6,8,9] if world==10 else [7,6,8,9]
    graph(i,f'At the world price of ${world}, compare that price with the no-trade equilibrium in the graph. Which statement correctly gives the no-trade price and the resulting trade direction?',
     [f'No-trade price ${v}; the country {direction}' for v in vals],
     f'Domestic demand and supply intersect at $7. The ${world} world price is '+('below' if world==5 else 'above')+f' that price, so the country {direction}.',
     'The price at the domestic demand-supply intersection.','The plotted no-trade price is $7; compare $5<7 or $10>7.')
graph('PG1-EQ-L-001','With both curves fixed, compare the gas market at $2 and $4 per gallon. Which pair of imbalances would push the market toward its plotted equilibrium?',
 ['At $2: shortage of 100 thousand gallons; at $4: surplus of 100 thousand gallons',
  'At $2: shortage of 50 thousand gallons; at $4: surplus of 50 thousand gallons',
  'At $2: shortage of 200 thousand gallons; at $4: surplus of 200 thousand gallons',
  'At $2: shortage of 150 thousand gallons; at $4: surplus of 150 thousand gallons'],
 'At $2, buyers want 200 thousand gallons and sellers offer 100 thousand, a shortage of 100 thousand. At $4, sellers offer 200 thousand and buyers want 100 thousand, a surplus of 100 thousand. These pressures move price toward the $3 equilibrium.',
 'Demanded and supplied quantities at both stated prices.','200-100=100 thousand at each price; equilibrium is $3 and 150 thousand.')
graph('ECON-MG-FINALBOSS-4018','The tax in the graph is currently collected from sellers. If the same per-unit tax were collected from buyers instead, with demand, supply, and compliance unchanged, which buyer price, net seller price, and quantity would result?',
 ['Buyer price $18; seller price $12; quantity 80','Buyer price $20; seller price $14; quantity 80','Buyer price $18; seller price $12; quantity 100','Buyer price $20; seller price $14; quantity 100'],
 'The graph shows an after-tax buyer price of $18, a net seller price of $12, and 80 units traded. Changing who sends the tax to the government leaves this economic outcome unchanged.',
 'Both post-tax prices and the post-tax quantity.','The plotted tax wedge is 18-12=6; shifting legal remittance preserves 18,12,80.')
graph('ECON-MG-LEGENDARY-9039','At an enforced $20 price ceiling, how many units of excess demand does the graph show, creating a need to ration purchases by something other than price?',
 ['100 units','50 units','150 units','200 units'],
 'At $20, quantity demanded is 250 and quantity supplied is 150. The 100-unit shortage creates a need for nonprice rationing, such as waiting or allocation rules.',
 'Quantity demanded and quantity supplied at $20.','250-150=100.')

for i,kind,level,keygap,gaps in [
 ('40021','rent ceiling',1000,500,[250,750,1000]),('40027','minimum wage',15,3,[1,2,5]),
 ('ECON-MG-MEDIUM-171','price ceiling',20,10,[5,15,20]),('ECON-MG-MEDIUM-175','price floor',40,10,[5,15,20]),
 ('PG2-CEIL-E-001','rent ceiling',1000,1000,[500,750,1500]),('PG2-FLR-E-001','minimum wage',10,3,[1,2,4])]:
    below='ceiling' in kind; rel='below' if below else 'above'
    equilibrium=level+keygap if below else level-keygap
    graph(i,f'The graph shows a ${level:,} {kind}. Which classification and difference from the competitive equilibrium price or wage are correct?',
     [f'Binding; ${gap:,} {rel} equilibrium' for gap in [keygap,*gaps]],
     f'The competitive equilibrium is ${equilibrium:,}. The ${level:,} '+kind+f' is ${keygap:,} {rel} equilibrium, so it is binding.',
     'The equilibrium price or wage at the intersection, compared with the stated policy level.',f'Equilibrium {equilibrium}; policy {level}; absolute difference {keygap}.')

graph('ECON-MG-HARD-261','A substitute becomes more expensive, shifting demand from D1 to D2 while supply stays at S1. Which starting and ending equilibrium coordinates match this change?',
 ['(P2, Q1) to (P3, Q2)','(P1, Q2) to (P2, Q3)','(P1, Q1) to (P3, Q3)','(P1, Q1) to (P2, Q2)'],
 'D1 intersects S1 at (P2,Q1); D2 intersects S1 at (P3,Q2). Demand rises, and equilibrium price and quantity both rise.',
 'The two demand-curve intersections with S1.','D1/S1=P2,Q1; D2/S1=P3,Q2. All options have rising price and quantity.')
graph('ECON-MG-HARD-262','A substitute becomes cheaper, shifting demand from D2 to D1 while supply stays at S2. Which starting and ending equilibrium coordinates match the graph?',
 ['(P2, Q3) to (P1, Q2)','(P3, Q2) to (P2, Q1)','(P3, Q3) to (P1, Q1)','(P3, Q3) to (P2, Q2)'],
 'D2 intersects S2 at (P2,Q3); D1 intersects S2 at (P1,Q2). The decrease in demand lowers equilibrium price and quantity.',
 'The intersections of S2 with D2 and D1.','D2/S2=P2,Q3; D1/S2=P1,Q2. All options have falling price and quantity.')
graph('ECON-MG-MEDIUM-167','Consumer income rises for a normal good, shifting demand from D1 to D2 while supply remains S2. Which equilibrium movement does the graph show?',
 ['(P1, Q2) to (P2, Q3)','(P2, Q1) to (P3, Q2)','(P1, Q1) to (P2, Q2)','(P2, Q2) to (P3, Q3)'],
 'With supply at S2, the initial intersection with D1 is (P1,Q2) and the new intersection with D2 is (P2,Q3). Both equilibrium price and quantity rise.',
 'The intersections on S2 before and after the demand shift.','D1/S2=P1,Q2; D2/S2=P2,Q3. All options raise price and quantity.')
graph('ECON-MG-HARD-258','Demand increases from D1 to D2 and supply increases from S1 to S2. Quantity must rise, but the price effect depends on the shifts. Which pair of equilibria shows the particular outcome in this graph?',
 ['Initial (P2, Q1); final (P2, Q3)','Initial (P1, Q1); final (P2, Q3)','Initial (P3, Q1); final (P2, Q3)','Initial (P2, Q1); final (P2, Q2)'],
 'The initial D1/S1 intersection is (P2,Q1); the final D2/S2 intersection is (P2,Q3). In this drawing the price effects offset, so price stays P2 while quantity rises from Q1 to Q3.',
 'The initial D1/S1 and final D2/S2 intersections.','Both plotted equilibria have price P2; quantities are Q1 and Q3. All alternatives increase quantity with an economically possible price outcome.')
graph('ECON-MG-HARD-259','Demand increases from D1 to D2 while supply decreases from S2 to S1. Price must rise, but the quantity effect depends on the shifts. Which pair of equilibria matches the drawing?',
 ['Initial (P1, Q2); final (P3, Q2)','Initial (P1, Q1); final (P3, Q2)','Initial (P1, Q3); final (P3, Q2)','Initial (P2, Q2); final (P3, Q2)'],
 'D1/S2 gives (P1,Q2), and D2/S1 gives (P3,Q2). Price rises from P1 to P3, while quantity remains Q2 in this drawing.',
 'The D1/S2 and D2/S1 intersections.','Initial P1,Q2; final P3,Q2. All alternatives raise price, with possible increases, decreases, or no change in quantity.')
graph('ECON-MG-HARD-265','Compare the equilibrium at D1/S2 with the equilibrium at D2/S1. Which outcome is shown when demand increases and supply decreases?',
 ['Price rises from P1 to P3; quantity stays Q2','Price rises from P1 to P3; quantity rises from Q1 to Q2','Price rises from P1 to P3; quantity falls from Q3 to Q2','Price rises from P2 to P3; quantity stays Q2'],
 'The graph places D1/S2 at (P1,Q2) and D2/S1 at (P3,Q2). The price increase is from P1 to P3; the two shifts have offsetting quantity effects here.',
 'The prices and quantities at D1/S2 and D2/S1.','P1,Q2 to P3,Q2; every alternative correctly allows rising price.')

graph('PG1-DMD-EL-001','The only change in the donut market is a fall in the good’s own price, moving the market from A to B. By how much does quantity demanded rise, with demand otherwise unchanged?',
 ['125 thousand donuts','75 thousand donuts','100 thousand donuts','150 thousand donuts'],
 'A shows 100 thousand donuts and B shows 225 thousand. Quantity demanded rises by 225-100=125 thousand along the unchanged demand curve.',
 'The quantities at A and B.','225-100=125 thousand.')
graph('PG1-DMD-H-001','From A to B, how much does quantity demanded increase for each $1 decrease in price?',
 ['25 thousand donuts','20 thousand donuts','15 thousand donuts','30 thousand donuts'],
 'Price falls from $10 to $5, and quantity demanded rises from 100 thousand to 225 thousand. The response is 125/5=25 thousand donuts per $1 price decrease.',
 'Both price and quantity coordinates of A and B.','(225-100)/(10-5)=25 thousand per dollar.')
graph('PG1-DMD-L-001','A report attributes the A-to-B change to stronger tastes for donuts. A survey instead finds that the quantity desired at each fixed price is unchanged. Which numerical correction matches the graph?',
 ['Price falls $5 and quantity demanded rises 125 thousand along the unchanged curve','Price falls $4 and quantity demanded rises 125 thousand along the unchanged curve','Price falls $5 and quantity demanded rises 100 thousand along the unchanged curve','Price falls $4 and quantity demanded rises 100 thousand along the unchanged curve'],
 'A is ($10,100 thousand) and B is ($5,225 thousand). The price falls $5 and quantity demanded rises 125 thousand. The unchanged quantities desired at fixed prices rule out a demand shift.',
 'The price decrease and quantity increase from A to B.','10-5=5; 225-100=125 thousand; all choices describe the same valid movement along demand.')
graph('PG1-DMD-M-001','The market moves from A to B along the displayed donut demand curve. Which price and quantity changes occur?',
 ['Price falls $5; quantity demanded rises 125 thousand','Price falls $4; quantity demanded rises 100 thousand','Price rises $5; quantity demanded falls 125 thousand','Price rises $4; quantity demanded falls 100 thousand'],
 'A is at $10 and 100 thousand donuts; B is at $5 and 225 thousand. The movement lowers price by $5 and increases quantity demanded by 125 thousand.',
 'The relative positions and coordinates of A and B.','A(100,10), B(225,5); both rising-price and falling-price alternatives obey the law of demand.')
for i,dp,dq,detail in [('PG1-SUP-M-001',5,125,'A is at $6 and 100 thousand units; B is at $11 and 225 thousand.'),('PG1-SUP-M-005',1,125,'A is at $3 and 100 thousand tacos; B is at $4 and 225 thousand.')]:
    graph(i,'The market moves from A to B along the displayed supply curve. Which changes in price and quantity supplied occur?',
     [f'Price rises ${dp}; quantity supplied rises {dq} thousand',f'Price rises ${dp}; quantity supplied rises 100 thousand',f'Price falls ${dp}; quantity supplied falls {dq} thousand',f'Price falls ${dp}; quantity supplied falls 100 thousand'],
     detail+f' Price rises ${dp} and quantity supplied rises {dq} thousand along the unchanged supply curve.',
     'The prices and quantities at A and B.',f'Quantity change=225-100=125 thousand; price change={dp}. All alternatives obey the law of supply.')
graph('PG1-DMD-M-004','Coffee is a normal good. At a price of $10, compare D0 and D1. Which income change and quantity change are consistent with the graph?',
 ['Income rises; quantity demanded rises by 75 thousand','Income rises; quantity demanded rises by 100 thousand','Income falls; quantity demanded falls by 75 thousand','Income falls; quantity demanded falls by 100 thousand'],
 'At $10, D0 shows 50 thousand units and D1 shows 125 thousand. The 75-thousand increase at the same price is consistent with higher income for a normal good.',
 'The direction and horizontal distance from D0 to D1 at $10.','125-50=75 thousand; all income/quantity direction pairs are valid for a normal good.')
graph('PG1-DMD-M-006','Tea is a normal good. At a price of $4, compare D0 and D1. Which income change and quantity change are consistent with the graph?',
 ['Income falls; quantity demanded falls by 100 thousand','Income falls; quantity demanded falls by 75 thousand','Income rises; quantity demanded rises by 100 thousand','Income rises; quantity demanded rises by 75 thousand'],
 'At $4, quantity demanded is 200 thousand on D0 and 100 thousand on D1. This 100-thousand decrease at the same price is consistent with lower income for a normal good.',
 'The direction and horizontal distance from D0 to D1 at $4.','200-100=100 thousand; all alternatives pair income and demand consistently.')

graph('PG1-DMD-EL-003','Start on D0 at $6. Demand changes to D1 while price is still $6, then price falls to $4. Which sequence of quantities, in thousands, matches the graph?',
 ['150 to 50 to 100','150 to 75 to 125','200 to 100 to 150','200 to 50 to 100'],
 'At $6, D0 gives 150 thousand and D1 gives 50 thousand. Moving down D1 to $4 raises quantity demanded to 100 thousand. The demand decrease is partly offset by the later price fall.',
 'D0 at $6 and D1 at both $6 and $4.','150-50=100 thousand shift loss; 100-50=50 thousand regained along D1.')
graph('PG1-DMD-L-003','Starting on D0 at $6, demand shifts to D1 at that price and then price falls to $4. What are the separate quantity changes caused by the shift and by the later movement along D1?',
 ['The shift reduces quantity by 100 thousand; the price fall adds 50 thousand','The shift reduces quantity by 75 thousand; the price fall adds 50 thousand','The shift reduces quantity by 100 thousand; the price fall adds 75 thousand','The shift reduces quantity by 125 thousand; the price fall adds 75 thousand'],
 'At $6 the shift changes quantity from 150 thousand on D0 to 50 thousand on D1, a decrease of 100 thousand. At $4, D1 shows 100 thousand, so the price fall adds 50 thousand.',
 'The fixed-price gap at $6 and the quantity change along D1 from $6 to $4.','Shift=50-150=-100; movement=100-50=50 thousand.')
graph('PG1-SUP-EL-002','Start on S0 at $9. Supply changes to S1 at that price, then price rises to $13. Which sequence of quantities supplied, in thousands, matches the graph?',
 ['200 to 100 to 200','200 to 150 to 250','250 to 150 to 250','250 to 100 to 200'],
 'At $9, S0 shows 200 thousand and S1 shows 100 thousand. At $13, S1 shows 200 thousand. The price increase restores the original quantity supplied without shifting supply back.',
 'S0 and S1 at $9 and S1 at $13.','200 to100 to200 thousand; all options allow a supply decrease followed by increasing quantity supplied.')
graph('PG1-SUP-EL-003','Start at A on S0. Supply increases to S1 at A’s price, then price falls to $2. Which sequence of quantities supplied, in thousands, matches the taco graph?',
 ['100 to 225 to 100','100 to 200 to 125','125 to 225 to 100','125 to 250 to 125'],
 'A is at $3 and 100 thousand tacos. At $3, S1 gives about 225 thousand; at $2, S1 gives about 100 thousand. The later price fall offsets the fixed-price increase in quantity supplied.',
 'A’s coordinates and the quantities on S1 at A’s price and at $2.','S0 at3=100; S1 at3=225; S1 at2=100 thousand.')
graph('PG1-SUP-H-001','From A to B, how much does quantity supplied increase for each $1 increase in price?',
 ['25 thousand units','20 thousand units','15 thousand units','30 thousand units'],
 'Price rises from $6 to $11 and quantity supplied rises from 100 thousand to 225 thousand. The response is 125/5=25 thousand units per $1 price increase.',
 'Both coordinates at A and B.','(225-100)/(11-6)=25 thousand per dollar.')

graph('P62D-ITP-B3-054','In the quota-rent graph, import licenses are initially given free to foreign firms. The domestic government instead sells all licenses at a costless competitive auction, with the quota and prices unchanged. What domestic welfare gain follows, and how much deadweight loss remains relative to free trade?',
 ['Gain of $200; remaining deadweight loss $100','Gain of $100; remaining deadweight loss $100','Gain of $200; remaining deadweight loss $200','Gain of $400; remaining deadweight loss $200'],
 'Rectangle R has height $40-$30=$10 and width 40-20=20 imports, so the auction brings $200 home instead of transferring it abroad. Each distortion triangle is half of $10 times 10 units, or $50. Their $100 total remains because prices and quantities are unchanged.',
 'The price gap, quota quantity, and production and consumption changes in the graph.','R=(40-30)*(40-20)=200; DWL=.5*10*((20-10)+(50-40))=100.')
graph('P62D-ITP-H-015','If the domestic government auctions all import licenses in the quota-rent graph, what government revenue and deadweight loss relative to free trade would result? Assume a competitive auction with no administrative costs.',
 ['Revenue $200; deadweight loss $100','Revenue $100; deadweight loss $100','Revenue $200; deadweight loss $200','Revenue $400; deadweight loss $100'],
 'Auction revenue equals R: the $10 price gap times 20 imports, or $200. The production and consumption triangles each have area $50, so deadweight loss is $100. Domestic auction revenue is a transfer, not deadweight loss.',
 'The dimensions of R and the two distortion triangles.','R=10*20=200; both triangles=.5*10*10=50 each.')
graph('P62D-ITP-L-099','Using the phone-case quota graph, replace free domestic import licenses with a voluntary export restraint that gives foreign firms the same rights free. Prices and quantities remain unchanged, with no additional costs. Relative to free trade, what is the domestic welfare loss, and how much of it is transferred abroad?',
 ['$375 thousand loss, including $150 thousand transferred abroad','$300 thousand loss, including $150 thousand transferred abroad','$375 thousand loss, including $225 thousand transferred abroad','$450 thousand loss, including $225 thousand transferred abroad'],
 'The price gap is $6-$3=$3 and quota imports are 200-150=50 thousand, so foreign firms receive $150 thousand. Production and consumption each change by 75 thousand, giving total deadweight loss of 0.5*$3*(75+75)=$225 thousand. Domestic loss is $225 thousand plus $150 thousand, or $375 thousand.',
 'World and quota prices; production and consumption at both prices.','Rent=3*50=150 thousand; DWL=.5*3*(75+75)=225 thousand; national loss=375 thousand.')
graph('40007','The movie-ticket market moves from A to B after one production cost changes. Which explanation and changes in equilibrium price and quantity match the graph?',
 ['Higher operating costs reduce supply; price rises $2 and quantity falls 50 thousand','Higher operating costs reduce supply; price rises $4 and quantity falls 50 thousand','Lower operating costs increase supply; price falls $2 and quantity rises 50 thousand','Lower operating costs increase supply; price falls $4 and quantity rises 50 thousand'],
 'A is ($10,200 thousand) and B is ($12,150 thousand). The move follows a decrease in supply, consistent with higher operating costs: price rises $2 and quantity falls 50 thousand.',
 'The supply curves through A and B, plus their price and quantity coordinates.','A=10,200; B=12,150; all choices correctly pair a cost change with supply and equilibrium effects.')
graph('40010','Streaming subscriptions are substitutes for theater visits. With production conditions unchanged, the movie-ticket market moves from A to B. Which explanation and equilibrium changes match the graph?',
 ['Streaming becomes more expensive; ticket price rises $2 and sales rise 50 thousand','Streaming becomes more expensive; ticket price rises $4 and sales rise 50 thousand','Streaming becomes cheaper; ticket price falls $2 and sales fall 50 thousand','Streaming becomes cheaper; ticket price falls $4 and sales fall 50 thousand'],
 'A is ($10,200 thousand) and B is ($12,250 thousand). A higher streaming price increases demand for theater tickets, consistent with the $2 price increase and 50-thousand increase in ticket sales.',
 'The direction of the demand shift and the coordinates of A and B.','A=10,200; B=12,250. All alternatives correctly describe substitute-price effects.')
graph('40011','Compare D0 with D1 at the price marked at A, then compare equilibrium A with B. Which pair gives the fixed-price increase in quantity demanded and the increase in equilibrium quantity along S0?',
 ['Fixed-price increase: 100 thousand; equilibrium increase: 50 thousand','Fixed-price increase: 50 thousand; equilibrium increase: 50 thousand','Fixed-price increase: 100 thousand; equilibrium increase: 100 thousand','Fixed-price increase: 50 thousand; equilibrium increase: 100 thousand'],
 'At A’s $10 price, quantity demanded rises from 200 thousand on D0 to 300 thousand on D1, a 100-thousand demand shift. Equilibrium moves along S0 from A at 200 thousand to B at 250 thousand, an increase of 50 thousand.',
 'A’s price; both demand quantities at that price; the quantities at A and B.','At P10, D0=200,D1=300. Equilibrium Q:200 to250. Changes=100 and50 thousand.')
graph('40014','An analyst explains the move from B back to A in the movie-ticket graph by cheaper streaming substitutes and lower theater operating costs. Those events reduce demand and increase supply. Which equilibrium changes are shown?',
 ['Price falls $4; quantity stays at 200 thousand','Price falls $2; quantity stays at 200 thousand','Price falls $4; quantity rises from 150 thousand to 200 thousand','Price falls $4; quantity falls from 250 thousand to 200 thousand'],
 'B is at $14 and 200 thousand tickets; A is at $10 and 200 thousand. Demand falls and supply rises, lowering price by $4. Their quantity effects offset in this graph.',
 'The price and quantity coordinates of B and A.','14-10=4; 200-200=0. All options lower price and allow a theoretically possible quantity response.')
graph('40016','Cheaper alternative transportation reduces gasoline demand while lower refinery costs increase supply. The market moves from B to D in the gasoline graph. Which equilibrium changes match the drawing?',
 ['Price falls $2; quantity remains 200 thousand gallons per day','Price falls $1; quantity remains 200 thousand gallons per day','Price falls $2; quantity rises from 150 to 200 thousand gallons per day','Price falls $2; quantity falls from 250 to 200 thousand gallons per day'],
 'B is ($6,200 thousand gallons per day) and D is ($4,200 thousand). Price falls $2. Quantity remains 200 thousand because the two quantity effects offset in this drawing.',
 'The price and quantity coordinates of B and D.','6-4=2; Q remains200 thousand; every alternative is consistent with the general directions of the two shifts.')
graph('ECON-MG-LEGENDARY-9003','Production moves from F to C and then from C to D, with resources and technology unchanged. Which output changes show the first move using idle capacity and the second involving a tradeoff?',
 ['F to C: gain 7 X and 15 Y; C to D: gain 6 X and give up 15 Y',
  'F to C: gain 7 X and 10 Y; C to D: gain 6 X and give up 15 Y',
  'F to C: gain 6 X and 15 Y; C to D: gain 7 X and give up 10 Y',
  'F to C: gain 8 X and 10 Y; C to D: gain 6 X and give up 20 Y'],
 'F=(8,20), C=(15,35), and D=(21,20). F to C adds 7 X and 15 Y by moving from inside the frontier to it. C to D adds 6 X at the cost of 15 Y along the frontier.',
 'The coordinates of F, C, and D and their positions relative to the PPF.','F to C=(7,15); C to D=(6,-15). Every alternative describes both-output gains followed by a tradeoff.')
graph('ECON-MG-MEDIUM-150','Which list contains all and only the efficient production points labeled in the PPF graph?',
 ['A, B, C, D, E','A, B, C, D, F','A, B, C, E, G','A, B, D, E, F'],
 'A, B, C, D, and E lie on the production possibilities frontier. F lies inside it and is inefficient; G lies outside it and is currently unattainable.',
 'Which labeled points lie on, inside, or outside the frontier.','A-E on frontier; F inside; G outside. Labels alone convey none of those locations.')
graph('40004','Compare the move from A to B along PPF0 with the increase in maximum burger output when the frontier shifts to PPF1. Which pair of changes is shown?',
 ['A to B gives up 40 orders of fries; maximum burger output rises by 10','A to B gives up 20 orders of fries; maximum burger output rises by 10','A to B gives up 40 orders of fries; maximum burger output rises by 20','A to B gives up 20 orders of fries; maximum burger output rises by 20'],
 'A has 120 orders of fries and B has 80, so the move along PPF0 gives up 40 orders. PPF0 reaches 50 burgers at its horizontal intercept; PPF1 reaches 60, a capacity increase of 10 burgers. Reallocation and expanded capacity are different changes.',
 'Fries at A and B, and both burger-axis intercepts.','120-80=40 fries; 60-50=10 burgers.')
for i,policy,level in [('ECON-MG-LEGENDARY-9037','price ceiling',50),('ECON-MG-LEGENDARY-9038','price floor',10)]:
    graph(i,f'With demand and supply unchanged, a ${level} {policy} is imposed. Which market price and quantity would result in the graph?',
     ['Price $30; quantity 200','Price $25; quantity 175','Price $35; quantity 225','Price $40; quantity 250'],
     f'The graph’s competitive equilibrium is $30 and 200 units. The ${level} {policy} is nonbinding, so the market remains at that equilibrium.',
     'The demand-supply intersection and its position relative to the legal price.',f'Equilibrium=30,200; ceiling50>30 or floor10<30 is nonbinding. All numerical alternatives could be unregulated equilibria without the figure.')
graph('40038','Using the original equilibrium and the after-tax buyer and seller prices, which burden split and relative-elasticity conclusion fit the graph?',
 ['Buyers bear $6 and sellers $2; demand is less elastic','Buyers bear $5 and sellers $3; demand is less elastic','Buyers bear $2 and sellers $6; supply is less elastic','Buyers bear $3 and sellers $5; supply is less elastic'],
 'The original price is $10, the buyer price is $16, and the net seller price is $8. Buyers bear $6 and sellers $2 of the $8 tax. The larger buyer burden indicates less elastic demand over this change.',
 'The original equilibrium price and both after-tax prices.','Buyer=16-10=6; seller=10-8=2; each alternative totals8 and correctly assigns greater burden to the less-elastic side.')
graph('40044','The $8 tax is legally collected from sellers. Using the original equilibrium as the benchmark, which division of the economic burden does the graph show?',
 ['Buyers bear $2 per unit; sellers bear $6 per unit','Buyers bear $3 per unit; sellers bear $5 per unit','Buyers bear $6 per unit; sellers bear $2 per unit','Buyers bear $5 per unit; sellers bear $3 per unit'],
 'The original price is $10. After the tax, buyers pay $12 and sellers keep $4. Buyers therefore bear $2 and sellers $6. Legal collection from sellers does not determine the economic division.',
 'The original price and the buyer and net seller prices after the tax.','12-10=2;10-4=6; each option splits the same8 tax without contradicting incidence theory.')
graph('40047','The tax in the graph is legally collected from buyers. Which economic burden split and relative-elasticity conclusion match the plotted prices?',
 ['Buyers bear $6 and sellers $2; demand is less elastic','Buyers bear $5 and sellers $3; demand is less elastic','Buyers bear $2 and sellers $6; supply is less elastic','Buyers bear $3 and sellers $5; supply is less elastic'],
 'The original price is $10. Buyers now pay sellers $8 and remit the $8 tax, for a total price of $16. Buyers bear $6 and sellers $2. The larger buyer burden indicates less elastic demand; buyers also remain the legal remitters.',
 'The original price, post-tax seller price, and vertical tax wedge.','Buyer total=8+8=16; burden=16-10=6; seller burden=10-8=2. All options have a coherent8 split and elasticity inference.')
graph('ECON-MG-HARD-278','For the units still purchased after the tax, what is the buyers’ total additional payment compared with paying the original price for those same units? Exclude the welfare effect of purchases forgone.',
 ['$240: $3 extra on each of 80 units','$200: $2.50 extra on each of 80 units','$300: $3 extra on each of 100 units','$250: $2.50 extra on each of 100 units'],
 'The graph shows the buyer price rising from $15 to $18 and after-tax quantity falling to 80. The extra payment on purchases still made is ($18-$15)*80=$240. Lost gains on the 20 forgone purchases are excluded.',
 'The before-tax price, after-tax buyer price, and after-tax quantity.','(18-15)*80=240. Each option multiplies an economically plausible price increase by a possible remaining quantity.')
graph('ECON-MG-HARD-281','Using the original equilibrium price as the benchmark, how is the per-unit tax burden divided in the graph?',
 ['Buyers bear $3; sellers bear $3','Buyers bear $2; sellers bear $4','Buyers bear $4; sellers bear $2','Buyers bear $1; sellers bear $5'],
 'The original price is $15. Buyers pay $18 after the tax and sellers receive $12, so each side bears $3 of the $6 tax.',
 'The original price and both post-tax prices.','18-15=3;15-12=3. Every option totals6 and is a possible tax-incidence split.')
graph('PG2-STX-EL-001','The movie tax in the graph is currently collected from buyers. Collection shifts to sellers, with the tax, demand, supply, and compliance unchanged. A cinema proposes adding the tax again to the buyer’s current total payment. Which corrected tax-inclusive invoice and burden calculation preserve the competitive outcome?',
 ['Invoice $13.50; buyers bear $3 and sellers $3','Invoice $13.50; buyers bear $2 and sellers $4','Invoice $12.50; buyers bear $2 and sellers $4','Invoice $12.50; buyers bear $3 and sellers $3'],
 'The graph shows a $6 tax, a $7.50 net seller receipt, and a $13.50 total buyer price, compared with $10.50 before tax. After the collection change the invoice remains $13.50 including tax; the seller remits $6 and keeps $7.50. Each side bears $3. Adding another $6 would charge the tax twice.',
 'The pre-tax equilibrium, post-tax prices, and tax wedge; none is supplied in the revised stem.','13.50-7.50=6;13.50-10.50=3;10.50-7.50=3. Both13.50 choices are plausible until the pre-tax benchmark is read.')

expected={i for f in audit['wording_findings']+audit['graph_findings'] for i in f['ids']}
for i in ['PG1-DMD-EL-001','PG1-DMD-H-001','PG1-EQ-L-001','PG1-SUP-H-001','40001','40002','ECON-MG-LEGENDARY-9003','ECON-MG-LEGENDARY-9004','ECON-MG-MEDIUM-157']:
    edit(i,'Use the graph. '+stem(i))
edit('PG1-SUP-M-001','Using the coffee supply graph, calculate the changes in price and quantity supplied from A to B.')
edit('PG1-SUP-M-005','On the taco supply graph, which price and quantity changes describe the movement along S0 from A to B?')
edit('P73-MARG-L-006',options=[v.replace('The original slot','The original treatment') for v in opts('P73-MARG-L-006')])
replace('P62D-ITP-LB-009','the market for bicycle','the market for bicycles')
replace('P62D-ITP-LB-027','the market for paper-roll','the market for paper rolls')
edit('P74-INC-L-021',options=[v.replace('The relative payoff to staying through the twelfth month','Whether subscribers stay through the twelfth month') for v in opts('P74-INC-L-021')])
edit('P75-TRADE-L-007',feedback='The exporter needs more than 2 + 1 = 3 batteries per motor to cover production and shipping costs. The importer gains when the price is below 5 batteries per motor. Expressing these prices in motors per battery gives a range greater than 1/5 and less than 1/3.')
edit('P77-EPOL-R-039',options=[v.replace('Yes; economists using the same field must otherwise agree','Yes; economists working in the same field would otherwise reach the same conclusion') for v in opts('P77-EPOL-R-039')])
assert set(patches)==expected,(expected-set(patches),set(patches)-expected)
assert len(patches)==126
for i,p in patches.items():
    assert any(p[k]!=old[i][{'q':'stem','options':'options','feedback':'feedback'}[k]] for k in p),i
    p['correct_index']=old[i]['options'].index(old[i]['correct_option'])
    reviews[i]['finding_ids']=[f['code'] for f in audit['wording_findings']+audit['graph_findings'] if i in f['ids']]
(HERE/'patches.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(HERE/'item_reviews.json').write_text(json.dumps(reviews,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Prepared {len(patches)} exact-scope revisions, including {sum("hide_graph_test" in v for v in reviews.values())} graph reviews.')
