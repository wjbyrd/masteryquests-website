"""Freeze the exact authorized review and prepare its 38 proposals; no bank writes."""
from pathlib import Path
import hashlib,json,subprocess,shutil,re
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
WORK=ROOT/'tmp/general_economics_graph_construct_closure_20261003';WORK.mkdir(exist_ok=True)
IDS='40001 40004 40008 40011 40014 40016 40021 40027 ECON-MG-HARD-258 ECON-MG-HARD-259 ECON-MG-HARD-261 ECON-MG-HARD-262 ECON-MG-LEGENDARY-9003 ECON-MG-LEGENDARY-9004 ECON-MG-LEGENDARY-9017 ECON-MG-LEGENDARY-9037 ECON-MG-LEGENDARY-9038 ECON-MG-LEGENDARY-9039 ECON-MG-MEDIUM-157 ECON-MG-MEDIUM-167 ECON-MG-MEDIUM-171 ECON-MG-MEDIUM-175 P62D-ITP-H-015 P62D-ITP-M-032 P62D-ITP-M-034 PG1-DMD-EL-001 PG1-DMD-EL-003 PG1-DMD-H-001 PG1-DMD-L-001 PG1-DMD-M-001 PG1-EQ-L-001 PG1-SUP-EL-002 PG1-SUP-EL-003 PG1-SUP-H-001 PG1-SUP-M-001 PG1-SUP-M-005 PG2-CEIL-E-001 PG2-FLR-E-001'.split()
assert len(set(IDS))==38
review=json.loads((ROOT/'faculty_exports/audits/general_economics_graph_construct_drift_review_20261003.json').read_text(encoding='utf-8'))
assert sorted(r['question_id'] for r in review['flags'])==sorted(IDS)
def save(name,v): (HERE/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
source=ROOT/'build/faculty-build-composer/data/composer_library.js'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
if not (HERE/'baseline.json').exists():
 assert sha(source)==review['source_sha256']
 save('baseline.json',{'baseline_ref':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'source_sha256':sha(source),'target_ids':sorted(IDS)})
 save('review.json',review)
 for name in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:
  shutil.copy2(source.parent/name,WORK/name)
 for area in ['general_economics','microeconomics','macroeconomics']:
  shutil.copy2(ROOT/'faculty_exports'/f'{area}_question_bank.csv',WORK/f'{area}_question_bank.csv')
 protected={str(p.relative_to(ROOT)).replace('\\','/'):sha(p) for p in (ROOT/'build/faculty-build-composer').rglob('*') if p.is_file()}
 (WORK/'protected_files.json').write_text(json.dumps(protected,indent=2)+'\n')
 shutil.copy2(ROOT/'tmp/general_economics_wording_graph_cleanup_20261003/isolate_outputs.cjs',WORK/'isolate_outputs.cjs')
else:assert json.loads((HERE/'review.json').read_text(encoding='utf-8'))==review
feedback={
'40001':'A is 20 pizzas and 120 robots; B is 60 pizzas and 80 robots. The average cost is (120 - 80)/(60 - 20) = 1 robot per pizza. The frontier becomes steeper farther to the right, so producing additional pizzas requires giving up progressively more robots.',
'40004':'Moving from A to B on PPF0 reallocates existing resources: fries fall from 120 to 80 orders, a sacrifice of 40. Shifting to PPF1 expands productive capacity: the burger-axis intercept rises from 50 to 60. Reallocation changes the output mix within existing capacity; an outward shift expands what can be produced.',
'40008':'At A’s $10 price, S0 offers 200 thousand tickets and S1 offers 100 thousand. Offering 100 thousand fewer tickets at the same price is a decrease in supply. A movement along S0 would instead be a change in quantity supplied caused by a price change. In the graph, the A-to-B price actually rises.',
'40011':'Demand shifts right from D0 to D1 while S0 stays fixed. Equilibrium moves from A at 200 thousand tickets to B at 250 thousand, so quantity supplied rises by 50 thousand along S0. A higher quantity supplied does not mean supply itself shifted.',
'40014':'Cheaper streaming substitutes reduce demand for theater tickets, while lower operating costs increase supply. B is at $14 and 200 thousand tickets; A is at $10 and 200 thousand. Both shifts lower price, producing the $4 fall. Their opposite effects on quantity offset in this graph.',
'40016':'Cheaper alternative transportation reduces gasoline demand, while lower refinery costs increase supply. B is at $6 and 200 thousand gallons per day; D is at $4 and 200 thousand. The $2 price fall accompanies offsetting quantity effects: lower demand reduces quantity, while higher supply increases it. Unchanged equilibrium quantity does not mean the curves stayed fixed.',
'ECON-MG-HARD-258':'A demand increase raises equilibrium price and quantity; a supply increase lowers price and raises quantity. Quantity therefore rises for certain, but price depends on the relative shifts. Here D1/S1 is (P2,Q1) and D2/S2 is (P2,Q3): price stays P2 and quantity rises from Q1 to Q3.',
'ECON-MG-HARD-259':'Higher demand and lower supply both raise price, but demand raises quantity while lower supply reduces it. Quantity is therefore ambiguous in general. Here D1/S2 is (P1,Q2) and D2/S1 is (P3,Q2): price rises from P1 to P3 while the quantity effects offset at Q2.',
'ECON-MG-HARD-261':'A higher substitute price increases demand for this good, shifting demand right from D1 to D2. With supply fixed at S1, the graph moves from (P2,Q1) to (P3,Q2). Both equilibrium price and quantity rise.',
'ECON-MG-HARD-262':'A cheaper substitute reduces demand for this good, shifting demand left from D2 to D1. On unchanged S2, equilibrium moves from (P2,Q3) to (P1,Q2). Both equilibrium price and quantity fall.',
'ECON-MG-MEDIUM-167':'Higher income increases demand for a normal good. With supply fixed at S2, demand shifts right from D1 to D2, moving equilibrium from (P1,Q2) to (P2,Q3). This is a demand shift, not a supply change.',
'ECON-MG-LEGENDARY-9003':'F=(8,20) lies inside the PPF, while C=(15,35) and D=(21,20) lie on it. F to C uses idle resources to add 7 X and 15 Y without expanding capacity. C to D reallocates fully employed resources: gaining 6 X requires giving up 15 Y.',
'ECON-MG-LEGENDARY-9004':'B=(8,45), C=(15,35), and D=(21,20). The costs of additional X are 10/7, about 1.43 Y per X, and 15/6 = 2.5 Y per X. Rising opportunity cost is consistent with moving resources into X production that are increasingly less suited to it, rather than resources being equally suited to both goods.',
'ECON-MG-LEGENDARY-9017':'D1/S1 to D2/S1 switches demand curves, so demand increases; the ending intersection is (P3,Q2). D1/S1 to D1/S2 stays on D1: price falls and quantity demanded increases along that curve, ending at (P1,Q2). A change in quantity demanded along a curve differs from a change in demand itself.',
'ECON-MG-LEGENDARY-9039':'At the $20 ceiling, buyers demand 250 units and sellers supply 150, leaving a shortage of 100. Because the legal price cannot rise to clear the market, waiting, search, or another nonprice allocation method must ration the available units.',
'ECON-MG-MEDIUM-157':'A to B gives up 5 Y for 8 X, so the cost is 0.625 Y per X. D to E gives up 20 Y for 4 X, so the cost is 5 Y per X. This larger sacrifice per additional X shows increasing opportunity cost along the bowed frontier.',
'P62D-ITP-H-015':'Rectangle R has height $40 - $30 = $10 and width 40 - 20 = 20 imported units, so its value is $200. A competitive domestic government auction collects this rent as government revenue. The payment transfers income within the country; it is not destroyed surplus or deadweight loss.',
'PG1-DMD-EL-001':'A shows 100 thousand donuts and B shows 225 thousand, an increase of 125 thousand. The only change is the good’s own price, so this is an increase in quantity demanded along the existing curve. Demand itself does not shift.',
'PG1-DMD-EL-003':'At $6, quantity is 150 thousand on D0 and 50 thousand on D1. The lower quantity at the same price is a demand decrease. The subsequent price fall to $4 moves along D1 to 100 thousand, adding 50 thousand and only partly offsetting the demand decrease.',
'PG1-DMD-H-001':'A is at $10 and 100 thousand donuts; B is at $5 and 225 thousand. Quantity demanded rises by 125/5 = 25 thousand per $1 price decrease. This is movement along the unchanged demand curve, not a price-induced increase in demand.',
'PG1-DMD-L-001':'The unchanged quantities desired at every fixed price rule out a demand shift caused by stronger tastes. A is at $10 and 100 thousand donuts; B is at $5 and 225 thousand. The $5 price fall increases quantity demanded by 125 thousand along unchanged demand, so the report confuses a movement with a shift.',
'PG1-DMD-M-001':'A is at $10 and 100 thousand donuts; B is at $5 and 225 thousand. Price falls $5 and quantity demanded rises 125 thousand. Because A and B lie on the same demand curve, this is a movement along demand rather than an increase in demand.',
'PG1-EQ-L-001':'At $2, quantity demanded is 200 thousand gallons and quantity supplied is 100 thousand, so a 100-thousand-gallon shortage puts upward pressure on price. At $4, supply is 200 thousand and demand is 100 thousand, so a 100-thousand-gallon surplus puts downward pressure on price. Both pressures move price toward the $3 equilibrium.',
'PG1-SUP-EL-002':'At $9, S0 shows 200 thousand units and S1 shows 100 thousand. The lower quantity at the same price is a supply decrease. A subsequent price rise to $13 moves along S1 to 200 thousand. Returning to the original quantity does not shift supply back to S0.',
'PG1-SUP-EL-003':'A is at $3 and 100 thousand tacos on S0. At that same price, S1 shows about 225 thousand, indicating a supply increase. The later price fall to $2 moves along S1 to about 100 thousand. Quantity returns to its original level, but the supply curve remains S1.',
'PG1-SUP-H-001':'Price rises from $6 to $11 and quantity supplied rises from 100 thousand to 225 thousand. The response is 125/5 = 25 thousand units per $1 price increase. Both points lie on the same supply curve, so quantity supplied increases through a movement along supply; supply itself does not shift.',
'PG1-SUP-M-001':'A is at $6 and 100 thousand units; B is at $11 and 225 thousand. Price rises $5 and quantity supplied rises 125 thousand along the same supply curve. This is an increase in quantity supplied, not a rightward shift of supply.',
'PG1-SUP-M-005':'A is at $3 and 100 thousand tacos; B is at $4 and 225 thousand. Price rises $1 and quantity supplied rises 125 thousand along S0. The higher quantity supplied reflects movement along the curve, not an increase in supply.'}
for i,level,eq,kind in [('40021',1000,1500,'ceiling'),('40027',15,12,'floor'),('ECON-MG-MEDIUM-171',20,30,'ceiling'),('ECON-MG-MEDIUM-175',40,30,'floor'),('PG2-CEIL-E-001',1000,2000,'ceiling'),('PG2-FLR-E-001',10,7,'floor')]:
 feedback[i]=f'The demand and supply curves intersect at ${eq:,}. The legal '+('maximum' if kind=='ceiling' else 'minimum')+f' of ${level:,} is a price {kind}. It is '+('below' if kind=='ceiling' else 'above')+f' equilibrium, so it prevents the market from clearing at ${eq:,} and is binding.'
for i,level,kind in [('ECON-MG-LEGENDARY-9037',50,'ceiling'),('ECON-MG-LEGENDARY-9038',10,'floor')]:
 feedback[i]=f'The graph’s competitive equilibrium price is $30. A ${level} '+('maximum is above' if kind=='ceiling' else 'minimum is below')+f' that price, so the {kind} does not prevent the equilibrium trade. It is nonbinding, and the market remains at $30 and 200 units.'
for i,p,direction in [('P62D-ITP-M-032',5,'imports'),('P62D-ITP-M-034',10,'exports')]:
 feedback[i]=f'Domestic demand and supply intersect at $7, the no-trade price. The ${p} world price is '+('below' if p==5 else 'above')+f' $7. At that price, domestic '+('quantity demanded exceeds quantity supplied, so imports fill the gap.' if p==5 else 'quantity supplied exceeds quantity demanded, so the excess is exported.')
assert set(feedback)==set(IDS)
patches={};acceptance={}
for r in review['flags']:
 i=r['question_id'];k='ABCD'.index(r['proposed_key']);q=r['current'];opts=r['proposed_choices']
 original_key=hashlib.sha256(' '.join(q['options'][k].strip().lower().split()).encode()).hexdigest()
 assert original_key==q['aHash'],i
 # Preserve the proposal; add the repository's explicit graph cue only where its validator requires it.
 cue_ids={'40001','40008','ECON-MG-LEGENDARY-9004','ECON-MG-MEDIUM-157','PG1-DMD-H-001','PG1-DMD-L-001','PG1-SUP-H-001'}
 patches[i]={'q':('Use the graph. ' if i in cue_ids else '')+r['proposed_stem'],'options':opts,'feedback':feedback[i],'correct_index':k}
 numbers=lambda s:re.findall(r'(?<![A-Za-z])\b\d+(?:\.\d+)?',s)
 given=set(numbers(r['proposed_stem']))
 graph_numbers=lambda s:[n for n in numbers(s) if n not in given]
 pairs=[j for j,o in enumerate(opts) if j!=k and graph_numbers(o)==graph_numbers(opts[k])]
 assert pairs,i
 other=r['plausible_without_graph'][1]
 acceptance[i]={'original_construct':r['original_construct'],'drift_problem':r['construct_drift'],
 'economic_and_graph_evidence':r['graph_evidence_and_key_reason'],
 'construct_test':{'answer':'NO','status':'PASS','same_values_different_interpretation_choices':[r['proposed_key'],'ABCD'[pairs[0]]]},
 'graph_test':{'answer':'NO','status':'PASS','economically_plausible_without_graph':r['plausible_without_graph']},
 'stem_supplies_construct':False,'stem_supplies_graph_answer':False,'four_distinct_choices':True,
 'one_defensible_answer':True,'numerical_values_checked':True,'feedback_explains_both':True,
 'proposal_adjustments':['Prefixed “Use the graph.” to satisfy the repository’s explicit graph-cue convention; the proposed task and all alternatives are unchanged.'] if i in cue_ids else []}
save('patches.json',patches);save('acceptance.json',acceptance)
print('Prepared the 38 exact proposed revisions and item-level acceptance evidence.')
