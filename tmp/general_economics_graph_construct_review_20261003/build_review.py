"""Read-only question-bank review. Writes proposals only; never applies them."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'audit_tools/general_economics_wording_graph_cleanup_20261003'
OUT=ROOT/'faculty_exports/audits'
source=ROOT/'build/faculty-build-composer/data/composer_library.js'
before_hash=hashlib.sha256(source.read_bytes()).hexdigest()
ledger=json.loads((BASE/'expectations.json').read_text(encoding='utf-8'))
targets={c['id']:c for c in ledger['changes'] if c['review'].get('hide_graph_test')}
assert len(targets)==55
library=json.loads(source.read_text(encoding='utf-8').removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
seen=set()
def walk(v):
 if isinstance(v,dict):
  if 'q' in v and 'options' in v:
   i=str(v.get('id'))
   if i in targets:assert v==targets[i]['afterRecord'],i;seen.add(i)
   return
  for child in v.values():walk(child)
 elif isinstance(v,list):
  for child in v:walk(child)
walk(library);assert seen==set(targets)
flags={}
def add(i,construct,drift,stem,choices,evidence):
 assert i in targets and i not in flags
 assert len(choices)==len(set(choices))==4
 # The first two authored choices are economically plausible without the graph.
 # Preserve the existing keyed letter in the proposal for easy comparison.
 k=targets[i]['correctIndex'];key=choices[0];other=choices[1]
 arranged=choices[1:];arranged.insert(k,key)
 flags[i]={'question_id':i,'original_construct':construct,'construct_drift':drift,
 'proposed_stem':stem,'proposed_choices':arranged,'proposed_key':'ABCD'[k],
 'graph_evidence_and_key_reason':evidence,
 'plausible_without_graph':['ABCD'[arranged.index(key)],'ABCD'[arranged.index(other)]]}

add('40001','Infer increasing opportunity cost from the changing slope of a bowed PPF.',
 'Every revised choice says opportunity cost rises farther right. The original conclusion is supplied; only the A-to-B average distinguishes the answers.',
 'Using A and B and the shape of PPF0, which statement correctly gives the average opportunity cost of a pizza from A to B and explains what happens to opportunity cost farther to the right?',
 ['The average is 1 robot per pizza; the increasingly steep frontier means later pizzas cost more robots.',
  'The average is 2 robots per pizza; the increasingly steep frontier means later pizzas cost more robots.',
  'The average is 1 robot per pizza; opportunity cost remains constant along PPF0.',
  'The average is 2 robots per pizza; opportunity cost remains constant along PPF0.'],
 'Read A=(20,120) and B=(60,80): 40/40=1 robot per pizza. Interpret the visibly increasing absolute slope as rising opportunity cost. The two choices with the correct average have different economic conclusions.')
add('40004','Distinguish reallocation along a PPF from expansion of productive capacity.',
 'The revised stem calls the second change an increase in maximum output, and the choices vary only fries sacrificed and burgers added. Neither reallocation nor capacity expansion must be identified.',
 'Which statement correctly distinguishes the move from A to B from the shift of PPF0 to PPF1, using the changes shown in the graph?',
 ['A to B reallocates existing resources and gives up 40 orders of fries; PPF1 expands capacity and raises maximum burger output by 10.',
  'A to B reallocates existing resources and gives up 20 orders of fries; PPF1 expands capacity and raises maximum burger output by 10.',
  'A to B expands productive capacity by giving up 40 orders of fries; PPF1 only reallocates existing resources toward 10 more burgers.',
  'A to B expands productive capacity by giving up 20 orders of fries; PPF1 only reallocates existing resources toward 10 more burgers.'],
 'Read 120 versus 80 orders of fries and the 50 versus 60 burger intercepts. Explain why changing the output mix on PPF0 differs from shifting the frontier.')
add('40008','Distinguish a decrease in supply from a decrease in quantity supplied.',
 'The revision explicitly states that supply decreases from S0 to S1. All choices share the correct price/quantity directions, so only equilibrium differences are tested.',
 'Which explanation of the move from A to B is supported by comparing what sellers offer at the price marked at A?',
 ['Supply decreases: at that same price, sellers offer 100 thousand fewer tickets on S1 than on S0.',
  'Supply decreases: at that same price, sellers offer 50 thousand fewer tickets on S1 than on S0.',
  'Only quantity supplied decreases: a lower ticket price moves sellers along S0 by 100 thousand tickets.',
  'Only quantity supplied decreases: a lower ticket price moves sellers along S0 by 50 thousand tickets.'],
 'At A’s $10 price, S0 offers 200 thousand and S1 100 thousand. The fixed-price change identifies a supply shift; the observed A-to-B price rises rather than falls. These additional fixed-price readings were checked against the existing image.')
add('40011','Separate a demand shift from movement along an unchanged supply curve.',
 'The revised question tells students which two comparisons to make and labels one as movement along S0. All options repeat that decomposition and differ only in amounts.',
 'Between equilibrium A and equilibrium B, which curve shifts, and what quantity change reflects movement along the other curve?',
 ['Demand shifts right; quantity supplied increases by 50 thousand along S0.',
  'Demand shifts right; quantity supplied increases by 100 thousand along S0.',
  'Supply shifts right; quantity demanded increases by 50 thousand along D0.',
  'Supply shifts right; quantity demanded increases by 100 thousand along D0.'],
 'Identify the change from D0 to D1 and the unchanged S0; read equilibrium quantities 200 and 250 thousand. Both rightward-demand and rightward-supply stories are possible before the graph is seen.')
add('40014','Evaluate a causal explanation using two determinants and the resulting equilibrium endpoints.',
 'The revision supplies the formerly tested inference: “Those events reduce demand and increase supply.” It drops the evaluation and asks only for endpoint differences.',
 'An analyst attributes the move from B back to A to cheaper streaming substitutes and lower theater operating costs. Which evaluation correctly connects these events to the changes shown in the movie-ticket graph?',
 ['Consistent: demand falls and supply rises; price falls $4 while quantity remains 200 thousand.',
  'Consistent: demand falls and supply rises; price falls $2 while quantity remains 200 thousand.',
  'Consistent: demand and supply both fall; price falls $4 while quantity remains 200 thousand.',
  'Consistent: demand and supply both fall; price falls $2 while quantity remains 200 thousand.'],
 'Infer demand falling from cheaper substitutes and supply rising from lower operating costs. Read B=(200,14) and A=(200,10). The two $4 alternatives deliberately differ in their economic explanation; the two coherent demand-down/supply-up alternatives need the graph to distinguish them.')
add('40016','Explain why simultaneous demand and supply shifts can leave quantity unchanged while lowering price.',
 'The revision supplies both curve directions and removes the explanation about offsetting quantity effects. Choosing the key requires only B-to-D differences.',
 'Cheaper alternative transportation reduces gasoline demand while refinery costs fall. For the move from B to D, which outcome and explanation fit the graph?',
 ['Price falls $2 and quantity stays at 200 thousand gallons per day; the two shifts have offsetting effects on quantity.',
  'Price falls $1 and quantity stays at 200 thousand gallons per day; the two shifts have offsetting effects on quantity.',
  'Price falls $2 and quantity stays at 200 thousand gallons per day; unchanged quantity means neither curve shifted.',
  'Price falls $1 and quantity stays at 200 thousand gallons per day; unchanged quantity means neither curve shifted.'],
 'Read B=($6,200 thousand) and D=($4,200 thousand). Lower refinery costs increase supply; its positive quantity effect offsets the negative effect of reduced demand. Identical quantities do not imply unchanged curves.')

# Preserve policy classification, with both a graph-value and a conceptual choice.
for i,level,eq,alt,policy in [
 ('40021',1000,1500,1250,'rent ceiling'),('40027',15,12,13,'minimum wage'),
 ('ECON-MG-MEDIUM-171',20,30,25,'price ceiling'),('ECON-MG-MEDIUM-175',40,30,35,'price floor')]:
 ceiling='ceiling' in policy;rel='below' if ceiling else 'above';price='wage' if policy=='minimum wage' else 'price'
 add(i,'Determine whether a price control binds by comparing its legal level with competitive equilibrium.',
  'Every revised option says “Binding” and places the control on the binding side of equilibrium. The question no longer distinguishes understanding of binding controls; only the gap differs.',
  f'The graph shows a ${level:,} {policy}. Which statement correctly classifies the policy and identifies the competitive equilibrium {price}?',
  [f'Binding: the equilibrium {price} is ${eq:,}, so the legal level is {rel} equilibrium.',
   f'Binding: the equilibrium {price} is ${alt:,}, so the legal level is {rel} equilibrium.',
   f'Nonbinding: the equilibrium {price} is ${eq:,}, so the market still clears at that {price}.',
   f'Nonbinding: the equilibrium {price} is ${alt:,}, so the market still clears at that {price}.'],
  f'Read equilibrium {price} ${eq:,} from the intersection; apply the rule that a '+('ceiling below equilibrium' if ceiling else 'floor above equilibrium')+' binds. Reading the correct equilibrium alone leaves two different classifications.')

for i,first,last,general,wrong in [
 ('ECON-MG-HARD-258','D1/S1','D2/S2','Quantity must rise; price could rise, fall, or stay unchanged.','Quantity must rise; price must stay unchanged.'),
 ('ECON-MG-HARD-259','D1/S2','D2/S1','Price must rise; quantity could rise, fall, or stay unchanged.','Price must rise; quantity must stay unchanged.')]:
 if i.endswith('258'):
  stem='Demand and supply both increase, taking the market from D1/S1 to D2/S2. Which statement distinguishes what theory guarantees from the particular outcome shown?'
  actual='Here price stays P2 and quantity rises from Q1 to Q3.';other='Here price stays P2 and quantity rises from Q1 to Q2.'
  evidence='Read the D1/S1 and D2/S2 intersections: (P2,Q1) and (P2,Q3). Explain that the two price effects oppose each other, so this unchanged price is one possible outcome, not a general guarantee.'
 else:
  stem='Demand increases from D1 to D2 while supply decreases from S2 to S1. Which statement distinguishes what theory guarantees from the particular outcome shown?'
  actual='Here price rises from P1 to P3 and quantity stays Q2.';other='Here price rises from P2 to P3 and quantity stays Q2.'
  evidence='Read the D1/S2 and D2/S1 intersections: (P1,Q2) and (P3,Q2). Explain that both shifts raise price but have opposing quantity effects; unchanged quantity is particular to this graph.'
 add(i,'Distinguish a guaranteed comparative-static direction from an ambiguous direction resolved by the particular graph.',
  'The revised stem supplies the complete general prediction. All choices then list coordinates; students no longer distinguish a theoretical guarantee from a contingent outcome.',stem,
  [general+' '+actual,general+' '+other,wrong+' '+actual,wrong+' '+other],evidence)

for i,initial,condition,right,good,bad in [
 ('ECON-MG-HARD-261','D1/S1','A substitute becomes more expensive',True,'(P2, Q1) to (P3, Q2)','(P1, Q2) to (P2, Q3)'),
 ('ECON-MG-HARD-262','D2/S2','A close substitute becomes cheaper',False,'(P2, Q3) to (P1, Q2)','(P3, Q2) to (P2, Q1)'),
 ('ECON-MG-MEDIUM-167','D1/S2','Consumer income rises for this normal good',True,'(P1, Q2) to (P2, Q3)','(P2, Q1) to (P3, Q2)')]:
 direction='right' if right else 'left';opposite='left' if right else 'right'
 add(i,'Connect a demand determinant to the curve shift and the resulting equilibrium change.',
  ('The original asks for a chain of economic explanation; the revision asks only for starting and ending coordinates. Its options no longer distinguish a demand shift from another explanation.' if i!='ECON-MG-MEDIUM-167' else
   'The revision supplies the missing inference that higher income shifts demand from D1 to D2. The original required students to infer that response for a normal good; now only coordinates differ.'),
  f'The market initially clears at {initial}. {condition}, while supply conditions remain unchanged. Which explanation and equilibrium movement fit the graph?',
  [f'Demand shifts {direction}; equilibrium moves from {good}.',f'Demand shifts {direction}; equilibrium moves from {bad}.',
   f'Demand shifts {opposite}; equilibrium moves from {good}.',f'Demand shifts {opposite}; equilibrium moves from {bad}.'],
  f'Infer a {direction}ward demand shift from the stated determinant, then locate the initial and new intersections on the unchanged supply curve. The plotted movement is {good}. The alternate movement with the same correct theory cannot be rejected without the graph.')

add('ECON-MG-LEGENDARY-9003','Distinguish using idle resources from a tradeoff along the production frontier.',
 'The revised stem labels the first move as using idle capacity and the second as a tradeoff. Every option has both outputs rising first and X rising at Y’s expense second; only arithmetic distinguishes them.',
 'Production moves from F to C and then from C to D with resources and technology unchanged. Which explanation, supported by the graph’s output changes, explains why only the second move sacrifices Y for more X?',
 ['F to C uses idle resources to add 7 X and 15 Y; C to D reallocates fully employed resources, adding 6 X at a cost of 15 Y.',
  'F to C uses idle resources to add 7 X and 10 Y; C to D reallocates fully employed resources, adding 6 X at a cost of 15 Y.',
  'F to C expands productive capacity to add 7 X and 15 Y; C to D uses idle resources to add 6 X at a cost of 15 Y.',
  'F to C expands productive capacity to add 7 X and 10 Y; C to D uses idle resources to add 6 X at a cost of 15 Y.'],
 'Read F=(8,20), C=(15,35), D=(21,20); identify F inside and C/D on the same frontier. The key combines these output differences with the appropriate resource-use explanation.')
add('ECON-MG-LEGENDARY-9004','Explain increasing opportunity cost through differences in resource suitability.',
 'The revised stem gives the resource-suitability explanation. All choices show rising costs, leaving only two ratios to calculate; the original causal explanation is no longer assessed.',
 'Compare the average opportunity cost of Good X over B to C and C to D. Which costs and explanation best fit the PPF?',
 ['About 1.43 then 2.5 Y per X; expanding X production uses resources increasingly less suited to producing X.',
  'About 0.63 then 1.43 Y per X; expanding X production uses resources increasingly less suited to producing X.',
  'About 1.43 then 2.5 Y per X; the change shows that resources are equally well suited to producing X and Y.',
  'About 0.63 then 1.43 Y per X; the change shows that resources are equally well suited to producing X and Y.'],
 'Read B=(8,45), C=(15,35), D=(21,20); compute 10/7 and 15/6. Select the standard resource-suitability explanation rather than merely a pair of increasing numbers.')
add('ECON-MG-LEGENDARY-9017','Distinguish a change in demand from a change in quantity demanded.',
 'The revised stem and option labels already classify the two changes as a demand shift and movement along D1. Only labeled intersections remain to be matched.',
 'Compare two changes: first, D1/S1 to D2/S1; second, D1/S1 to D1/S2. Which statement correctly classifies both changes and gives their ending equilibria?',
 ['First, demand increases and ends at (P3, Q2); second, quantity demanded increases along D1 and ends at (P1, Q2).',
  'First, demand increases and ends at (P3, Q3); second, quantity demanded increases along D1 and ends at (P1, Q3).',
  'First, quantity demanded changes along an unchanged demand curve and ends at (P3, Q2); second, demand shifts and ends at (P1, Q2).',
  'First, quantity demanded changes along an unchanged demand curve and ends at (P3, Q3); second, demand shifts and ends at (P1, Q3).'],
 'Identify whether each change switches demand curves or stays on D1, then read the ending intersections. Correct endpoint readings alone leave competing economic classifications.')

for i,policy,level in [('ECON-MG-LEGENDARY-9037','ceiling',50),('ECON-MG-LEGENDARY-9038','floor',10)]:
 rel='above' if policy=='ceiling' else 'below'
 add(i,'Classify a nonbinding price control and explain why it leaves equilibrium unaffected.',
  'All current answers are candidate equilibrium coordinates on the nonbinding side of the legal price. Students can select the visible intersection without ever classifying or explaining the control.',
  f'A ${level} price {policy} is imposed with demand and supply unchanged. Which statement correctly classifies the policy using the equilibrium shown?',
  [f'Nonbinding: the legal price is {rel} the $30 equilibrium price, so the market stays at equilibrium.',
   f'Nonbinding: the legal price is {rel} the $40 equilibrium price, so the market stays at equilibrium.',
   f'Binding: the legal price is {rel} the $30 equilibrium price, so transactions must occur at ${level}.',
   f'Binding: the legal price is {rel} the $40 equilibrium price, so transactions must occur at ${level}.'],
  f'Read the $30 intersection and apply the meaning of a legal '+('maximum' if policy=='ceiling' else 'minimum')+f'. Both $30 and $40 would make this ${level} {policy} nonbinding, so theory alone cannot select the key.')
add('ECON-MG-LEGENDARY-9039','Infer nonprice rationing from a shortage created by a binding price ceiling.',
 'The revised stem supplies both excess demand and the need to ration by something other than price. Every answer is only a shortage magnitude.',
 'An enforced $20 price ceiling is imposed. What additional consequence, beyond the lower posted price, follows from the quantities shown in the graph?',
 ['A shortage of 100 units makes waiting, search, or another form of nonprice rationing necessary.',
  'A shortage of 50 units makes waiting, search, or another form of nonprice rationing necessary.',
  'A surplus of 100 units leaves sellers competing to dispose of unsold goods.',
  'A surplus of 50 units leaves sellers competing to dispose of unsold goods.'],
 'At $20, Qd=250 and Qs=150: shortage=100. Interpret the unsatisfied demand as a need for nonprice allocation. Shortage and surplus stories are each economically coherent until the quantities are read.')
add('ECON-MG-MEDIUM-157','Infer increasing opportunity cost from the shape of the PPF.',
 'All revised pairs have a larger later opportunity cost. The original increasing-versus-constant-versus-decreasing distinction is absent; only the correct magnitudes matter.',
 'Compare the opportunity cost of Good X over A to B and D to E. Which numerical evidence and conclusion fit the PPF?',
 ['The costs are 0.625 and 5 Y per X; opportunity cost rises as more X is produced.',
  'The costs are 0.5 and 4 Y per X; opportunity cost rises as more X is produced.',
  'The costs are 0.625 and 5 Y per X; opportunity cost stays constant as more X is produced.',
  'The costs are 0.5 and 4 Y per X; opportunity cost stays constant as more X is produced.'],
 'Read the changes in X and Y: 5/8 and 20/4. Connect the rising cost to the frontier’s shape. Two options use the actual graph values but offer different economic conclusions.')
add('P62D-ITP-H-015','Classify auctioned quota rent as domestic government revenue, a transfer rather than deadweight loss.',
 'The revised question asks for revenue and deadweight-loss amounts. It no longer explicitly asks how rectangle R is classified; its choices differ only in arithmetic.',
 'The domestic government auctions all import licenses competitively with no administrative costs. What is the value of rectangle R in the quota graph, and how does it enter domestic welfare?',
 ['R is $200 of government revenue, a domestic transfer rather than deadweight loss.',
  'R is $100 of government revenue, a domestic transfer rather than deadweight loss.',
  'R is $200 of deadweight loss because domestic firms pay it to the government.',
  'R is $100 of deadweight loss because domestic firms pay it to the government.'],
 'Read the $40-$30 price gap and 40-20 import quantity: R=10×20=$200. Separately classify its payment to the domestic government as a transfer, preserving the original accounting distinction.')
for i,world,direction,other,relation in [('P62D-ITP-M-032',5,'imports','exports','below'),('P62D-ITP-M-034',10,'exports','imports','above')]:
 add(i,'Explain trade direction by comparing the world price with the no-trade equilibrium price.',
  f'Every revised choice says the country {direction}, and all proposed no-trade prices imply that same direction. Students only need to locate the no-trade price; the trade-direction explanation is supplied.',
  f'Trade opens at a world price of ${world}. Which statement correctly explains the trade direction using the no-trade equilibrium shown in the graph?',
  [f'The country {direction}: ${world} is {relation} the $7 no-trade price.',
   f'The country {direction}: ${world} is {relation} the $9 no-trade price.',
   f'The country {other}: ${world} is {relation} the $7 no-trade price.',
   f'The country {other}: ${world} is {relation} the $9 no-trade price.'],
  f'Read the $7 domestic intersection, then explain why a world price {relation} it leads to {direction}. Two alternatives use $7 but disagree about trade direction; two alternatives state the correct general trade rule but need the graph to distinguish $7 from $9.')

add('PG1-DMD-EL-001','Distinguish an own-price change in quantity demanded from a change in demand.',
 'The revised stem says demand is unchanged and asks only how much quantity rises. The original shift-versus-movement conclusion is supplied.',
 'The only change in the donut market is the good’s own price, taking the market from A to B. Which conclusion fits the graph?',
 ['Quantity demanded rises by 125 thousand along the existing curve; demand is unchanged.',
  'Quantity demanded rises by 75 thousand along the existing curve; demand is unchanged.',
  'Demand increases by 125 thousand because the lower price shifts the demand curve right.',
  'Demand increases by 75 thousand because the lower price shifts the demand curve right.'],
 'Read quantity changing from 100 to 225 thousand. Apply the distinction between an own-price movement along demand and a shift in demand; the stem no longer gives that classification.')
add('PG1-DMD-EL-003','Explain a demand shift and a later movement along demand, including their partially offsetting quantity effects.',
 'The explanation has been replaced by an unlabeled three-number sequence. All sequences fall and then rise, so students need not explain why one stage is a shift and the other a movement or why the offset is partial.',
 'Compare the initial point on D0 at $6 with the final point on D1 at $4. Which explanation correctly separates the demand change from the price change?',
 ['The demand decrease cuts quantity from 150 to 50 thousand at $6; the later price fall moves along D1 to 100 thousand, partly offsetting that decrease.',
  'The demand decrease cuts quantity from 150 to 75 thousand at $6; the later price fall moves along D1 to 125 thousand, partly offsetting that decrease.',
  'Demand is unchanged; the price fall alone changes quantity from 150 to 50 and then 100 thousand along D0.',
  'Demand is unchanged; the price fall alone changes quantity from 150 to 75 and then 125 thousand along D0.'],
 'Read D0 at $6=150, D1 at $6=50, and D1 at $4=100 thousand. Interpret the fixed-price gap as a demand change and the second change as a response to price on D1.')
for i,side,priceword,curve,unit in [('PG1-DMD-H-001','demanded','decrease','demand','donuts'),('PG1-SUP-H-001','supplied','increase','supply','units')]:
 add(i,f'Calculate quantity response per dollar and identify movement along {curve}, rather than a shift.',
  f'The revision retains the calculation but removes the requested inference about the {curve} relationship. All options are quantities per dollar.',
  f'From A to B, what is the quantity response per $1 price {priceword}, and what economic change does it represent?',
  [f'Quantity {side} rises by 25 thousand {unit} per dollar through movement along the existing {curve} curve.',
   f'Quantity {side} rises by 20 thousand {unit} per dollar through movement along the existing {curve} curve.',
   f'{curve.capitalize()} increases by 25 thousand {unit} per dollar because the price change shifts the curve right.',
   f'{curve.capitalize()} increases by 20 thousand {unit} per dollar because the price change shifts the curve right.'],
  f'Read the 125-thousand quantity change and $5 price change: 125/5=25. Also identify movement along the unchanged {curve} curve; the two options with rate 25 differ on that construct.')
add('PG1-DMD-L-001','Evaluate a claimed demand shift using both the graph and an unchanged fixed-price demand schedule.',
 'Every revised alternative already calls the curve unchanged. “Which numerical correction” bypasses the original diagnosis of the report’s mistaken inference.',
 'A report attributes the A-to-B change to stronger tastes for donuts. A survey finds that quantity desired at every fixed price is unchanged. Which diagnosis fits both sources of evidence?',
 ['The report confuses a movement with a shift: price falls $5 and quantity demanded rises 125 thousand along unchanged demand.',
  'The report confuses a movement with a shift: price falls $4 and quantity demanded rises 100 thousand along unchanged demand.',
  'The report is supported: price falls $5 and quantity demanded rises 125 thousand because demand shifts right.',
  'The report is supported: price falls $4 and quantity demanded rises 100 thousand because demand shifts right.'],
 'Use the unchanged schedule to reject the taste-shift claim, then read A=($10,100 thousand) and B=($5,225 thousand). Two options contain the actual differences but disagree on the report’s validity.')
for i,side,curve,good,dp,action in [
 ('PG1-DMD-M-001','demanded','demand','donuts',5,'falls'),
 ('PG1-SUP-M-001','supplied','supply','coffee',5,'rises'),
 ('PG1-SUP-M-005','supplied','supply','tacos',1,'rises')]:
 add(i,f'Identify a change in quantity {side} along an existing curve, rather than an increase in {curve}.',
  f'The revised options all describe price and quantity {side}; none requires distinguishing a curve shift from movement along a curve. The task has become a comparison of two coordinates.',
  f'What economic change does the move from A to B in the {good} graph represent?',
  [f'Price {action} ${dp}; quantity {side} increases by 125 thousand along the existing curve.',
   f'Price {action} ${dp}; quantity {side} increases by 100 thousand along the existing curve.',
   f'Price {action} ${dp}; {curve} increases by 125 thousand because the curve shifts right.',
   f'Price {action} ${dp}; {curve} increases by 100 thousand because the curve shifts right.'],
  f'Read the A-to-B price change of ${dp} and quantity change of 125 thousand. Identify A and B on the same {curve} curve; classify the change as quantity {side}, not a shift.')
add('PG1-EQ-L-001','Explain how shortages and surpluses create opposing price pressures toward equilibrium.',
 'Every revised choice already says shortage at $2 and surplus at $4. None states the direction of price adjustment. Only the magnitude of each imbalance is discriminated.',
 'With the curves fixed, compare the gas market at $2 and $4 per gallon. Which imbalances and price pressures would move the market toward the equilibrium shown?',
 ['At $2, a 100-thousand-gallon shortage pushes price up; at $4, a 100-thousand-gallon surplus pushes price down.',
  'At $2, a 50-thousand-gallon shortage pushes price up; at $4, a 50-thousand-gallon surplus pushes price down.',
  'At $2, a 100-thousand-gallon shortage pushes price down; at $4, a 100-thousand-gallon surplus pushes price up.',
  'At $2, a 50-thousand-gallon shortage pushes price down; at $4, a 50-thousand-gallon surplus pushes price up.'],
 'Read Qd-Qs=200-100=100 thousand at $2 and Qs-Qd=200-100=100 thousand at $4. Apply the price-adjustment mechanism; the two options with correct magnitudes give opposite pressures.')

for i,stem,correct,alternative,evidence in [
 ('PG1-SUP-EL-002',
  'Compare the initial point on S0 at $9 with the final point on S1 at $13. Which explanation separates the supply change from the later price change?',
  'The supply decrease reduces quantity from 200 to 100 thousand at $9; the price rise moves along S1 to 200 thousand without shifting supply back.',
  'The supply decrease reduces quantity from 250 to 150 thousand at $9; the price rise moves along S1 to 250 thousand without shifting supply back.',
  'Read S0 at $9=200, S1 at $9=100, and S1 at $13=200 thousand. Explain why the restored quantity does not undo the supply decrease.'),
 ('PG1-SUP-EL-003',
  'Compare A on S0 with the final point on S1 at $2. Which explanation separates the supply change from the later price change?',
  'The supply increase raises quantity from 100 to about 225 thousand at A’s price; the price fall moves along S1 to about 100 thousand without shifting supply back.',
  'The supply increase raises quantity from 125 to about 250 thousand at A’s price; the price fall moves along S1 to about 125 thousand without shifting supply back.',
  'Read A at $3 and 100 thousand, S1 at $3 about 225 thousand, and S1 at $2 about 100 thousand. Explain why the restored quantity does not undo the supply increase.')]:
 wrong1=correct.replace('without shifting supply back.','because supply shifts back to S0.')
 wrong2=alternative.replace('without shifting supply back.','because supply shifts back to S0.')
 add(i,'Separate a supply shift from a subsequent movement along supply; explain unchanged final quantity despite changed supply.',
  'The revised alternatives are three-number sequences. They remove the economic explanation of the two stages, including why returning to the original quantity does not mean returning to the original supply curve.',
  stem,[correct,alternative,wrong1,wrong2],evidence)

for i,level,eq,alt,legal,kind,rel in [
 ('PG2-CEIL-E-001',1000,2000,1500,'maximum rent','ceiling','below'),
 ('PG2-FLR-E-001',10,7,8,'minimum wage','floor','above')]:
 other='floor' if kind=='ceiling' else 'ceiling'
 add(i,'Identify the legal maximum/minimum as a ceiling/floor and determine whether it binds.',
  'The revised choices all say “Binding” and give the same side of equilibrium. The ceiling item also names the policy in its stem. Classification is replaced by the size of a price gap.',
  f'A legal {legal} of ${level:,} is shown. Which classification and equilibrium reading are correct?',
  [f'A binding {kind}; ${level:,} is {rel} the ${eq:,} equilibrium level.',
   f'A binding {kind}; ${level:,} is {rel} the ${alt:,} equilibrium level.',
   f'A nonbinding {kind}; ${level:,} is {rel} the ${eq:,} equilibrium level.',
   f'A binding {other}; ${level:,} is {rel} the ${eq:,} equilibrium level.'],
  f'Identify a legal '+('maximum as a ceiling' if kind=='ceiling' else 'minimum as a floor')+f', read equilibrium ${eq:,}, and determine whether the control restricts that equilibrium. The two binding-{kind} choices remain plausible without the graph.')

assert len(flags)==38,len(flags)
assert set(targets)-set(flags)==set('40002 40007 40010 40038 40044 40047 ECON-MG-FINALBOSS-4018 ECON-MG-HARD-265 ECON-MG-HARD-278 ECON-MG-HARD-281 ECON-MG-MEDIUM-150 P62D-ITP-B3-054 P62D-ITP-L-099 PG1-DMD-L-003 PG1-DMD-M-004 PG1-DMD-M-006 PG2-STX-EL-001'.split())
lines=['# General Economics graph question construct drift review','',
'Reviewed all 55 graph-assessment revisions against their recorded original stems and alternatives, and checked that the current canonical records still match the cleanup ledger. **38 questions show construct drift or a material weakening of the original reasoning requirement; 17 do not warrant a drift flag.** Only the 38 flagged cases are presented below.','',
'No questions, answers, hashes, metadata, graphs, or exports were changed. The revisions below are proposals for instructor review.','',
'## Review standard','',
'An added calculation is not automatically construct drift. A flag means that an economic classification, causal explanation, comparison, or evaluation originally required to choose the answer is now supplied in the stem, repeated in every alternative, or omitted from the response task. Merely mentioning the original concept in the question or feedback does not show that the student can use it.','',
'The proposals preserve the existing graph and original economic target. Each offers four distinct choices with one supported answer. Two economically coherent choices remain plausible before the graph is read. Where practical, another choice uses the correct graph values with a different economic interpretation, so reading the coordinates alone does not resolve the item. Distractors can reveal conceptual misunderstandings, but three conceptually impossible alternatives cannot identify the key without the graph.','',
'These are item-level assessment judgments, not a new difficulty calibration. The report does not propose graph, routing, engine, or metadata changes. Proposal answer letters retain the current keyed positions for easy comparison; no hashes were generated because nothing is being applied.','',
'## Flagged questions','',
'| Question ID | Economic construct weakened or lost |',
'| --- | --- |']
for i,r in sorted(flags.items()):lines.append(f"| {i} | {r['original_construct']} |")
for i,r in sorted(flags.items()):
 c=targets[i]
 lines += ['',f'## {i}','',f"**Original economic construct:** {r['original_construct']}",'','**Original task**','',c['beforeRecord']['q'],'']
 for label,opt in zip('ABCD',c['beforeRecord']['options']):lines.append(f'- {label}. {opt}')
 lines += ['',f"Original key: **{'ABCD'[c['correctIndex']]}**.",'','**Current revised task**','',c['afterRecord']['q'],'']
 for label,opt in zip('ABCD',c['afterRecord']['options']):lines.append(f'- {label}. {opt}')
 lines += ['',f"Current key: **{'ABCD'[c['correctIndex']]}**.",'',f"**Construct drift:** {r['construct_drift']}",'','**Proposed revision**','',r['proposed_stem'],'']
 for label,opt in zip('ABCD',r['proposed_choices']):lines.append(f'- {label}. {opt}')
 lines += ['',f"Proposed key: **{r['proposed_key']}**.",'',f"**Why this preserves the construct and requires the graph:** {r['graph_evidence_and_key_reason']}",'',
 f"**Hide-the-graph check:** YES — proposed choices {' and '.join(r['plausible_without_graph'])} remain economically plausible. The stem does not provide the graph readings that distinguish them."]
lines += ['','## Source and preservation check','',
'Compared the 55 graph targets in `audit_tools/general_economics_wording_graph_cleanup_20261003/expectations.json`, using its original and final records. Every current record was checked against `build/faculty-build-composer/data/composer_library.js`. The original snapshot predates the wording and graph cleanup; no inference from difficulty labels was used to establish drift.','',
f'Canonical library SHA-256 before and after this read-only review: `{before_hash}`.','']
assert hashlib.sha256(source.read_bytes()).hexdigest()==before_hash,'Bank changed during review'
out=OUT/'general_economics_graph_construct_drift_review_20261003.md'
out.write_text('\n'.join(lines),encoding='utf-8')
json_out=OUT/'general_economics_graph_construct_drift_review_20261003.json'
json_out.write_text(json.dumps({'reviewed_count':55,'flagged_count':38,'not_flagged_count':17,'source_sha256':before_hash,'questions_changed':0,'flags':[
 {**r,'original':targets[i]['beforeRecord'],'current':targets[i]['afterRecord']} for i,r in sorted(flags.items())]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'report':str(out),'json':str(json_out),'reviewed':55,'flagged':38,'questions_changed':0,'source_sha256':before_hash},indent=2))
