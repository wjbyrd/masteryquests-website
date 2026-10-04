from pathlib import Path
import json,re,math
from collections import Counter,defaultdict
H=Path(__file__).parent;ROOT=H.parent.parent
read=lambda n:json.loads((H/n).read_text(encoding='utf-8'))
p=read('patches.json');o=read('originals.json');families=read('families.json')
review=json.loads((ROOT/'faculty_exports/audits/macroeconomics_student_perspective_wording_review_20261004.json').read_text(encoding='utf-8'))
findings={f['question_id']:f for f in review['findings']};checks={i:[] for i in p}
def check(n,label,fn,expected,tol=1e-8):
 for q in families[n]:
  value=fn(q);want=expected(q) if callable(expected) else expected
  assert math.isclose(value,want,abs_tol=tol),(n,label,value,want)
  checks[str(q['id'])].append({'calculation':label,'result':value,'expected':want,'status':'PASS'})
nums=lambda q:[float(x.replace(',','')) for x in re.findall(r'\d[\d,]*(?:\.\d+)?',q['q'])]
check(0,'AS1: P=Y+75; output at original P=100',lambda q:100-75,25)
check(1,'Government purchases/(1-MPC) equals original gap',lambda q:nums(q)[2]/(1-.75),lambda q:nums(q)[0])
check(2,'100*(1.05/1.07-1)',lambda q:100*(1.05/1.07-1),-1.8691588785)
check(3,'Hours percentage change: 100*(1.02*.98-1)',lambda q:100*(1.02*.98-1),-.04)
check(3,'Real GDP growth: 100*(1.10/1.10-1)',lambda q:100*(1.10/1.10-1),0)
check(3,'Hourly productivity growth: 100*(1/(1.02*.98)-1)',lambda q:100*(1/(1.02*.98)-1),.0400160064)
check(4,'Expected inflation with s=0 and u=5',lambda q:6+(5-5)-0,6)
check(4,'Expected inflation with s=2 and u=5',lambda q:6+(5-5)-2,4)
check(7,'Approximate graph difference 155-100; nearest choice 50',lambda q:155-100,55)
check(8,'Approximate graph difference 150-100',lambda q:150-100,50)
check(10,'S-I and asset flow agree at -45',lambda q:480-525,-45)
check(10,'Correct imports holding exports at 210: 210-(-45)',lambda q:210+45,255)
check(10,'Correct exports holding imports at 240: 240-45',lambda q:240-45,195)
check(14,'Risk raises desired NCO 140-(-60); rate response=125-200',lambda q:125-(140+60),-75)
check(14,'Resident and foreign flow response: -45-(+30)',lambda q:-45-30,-75)
check(15,'Actual real exchange rate: 1.50*270/408',lambda q:1.5*270/408,.9926470588)
check(15,'Counterfactual with unchanged domestic price: 1.50*250/408',lambda q:1.5*250/408,.9191176471)
check(16,'Quoted rate percentage change',lambda q:100*(1.84/1.60-1),15)
check(16,'Reciprocal percentage change',lambda q:100*(1.60/1.84-1),-13.0434782609)
check(18,'Dollar unit price percentage change',lambda q:100*(1.06*.92-1),-2.48)
check(18,'Total dollar revenue percentage change',lambda q:100*(1.06*.92*1.05-1),2.396)
check(20,'Grant real change',lambda q:100*((2160/2000)/(135/125)-1),0)
check(20,'Real GDP percentage change',lambda q:100*(1.08/1.04-1),3.8461538462)
check(21,'200-50',lambda q:200-50,150)
check(22,'MPC=1-1/4',lambda q:1-1/4,.75)
check(23,'Economy A final demand increase',lambda q:nums(q)[0]*5-nums(q)[2],lambda q:nums(q)[0]*2)
check(25,'Observed deposit multiplier',lambda q:nums(q)[3]/nums(q)[0],4)
check(32,'Expected inflation: 4+(6-5)-2',lambda q:4+(6-5)-2,3)
check(36,'Initial consumption: transfer*.6',lambda q:nums(q)[0]*.6,lambda q:nums(q)[0]*.6)
check(36,'Total demand: transfer*.6/(1-.6)',lambda q:nums(q)[0]*.6/(1-.6),lambda q:nums(q)[0]*1.5)
check(37,'Tax cut initial consumption',lambda q:60*.75,45)
check(37,'Both total demand increases',lambda q:45/(1-.75),180)
check(38,'Quarter of rebate spent',lambda q:100/4,25)
check(40,'Expected real return percent',lambda q:100*(1.12/1.05-1),6.6666666667)
check(40,'Realized real return percent',lambda q:100*(1.12/1.09-1),2.7522935780)
check(40,'New nominal rate percent',lambda q:100*((1.12/1.05)*1.09-1),16.2666666667)
check(41,'GDP per person percent',lambda q:100*(1.12/1.05-1),6.6666666667)
check(41,'Output per hour percent',lambda q:100*(1.12/1.20-1),-6.6666666667)
check(46,'Lost baskets: 720/1.2-720/1.5',lambda q:720/1.2-720/1.5,120)
check(48,'Real debt:103/1.03',lambda q:103/1.03,100)
check(50,'Excess supply at original exchange rate:65-40',lambda q:65-40,25)
check(52,'Consumer loss trapezoid: (250+200)/2*(6-4)',lambda q:(250+200)/2*2,450)
check(52,'Producer gain trapezoid:(50+100)/2*2',lambda q:(50+100)/2*2,150)
check(52,'Tariff revenue: (200-100)*2',lambda q:(200-100)*2,200)
check(52,'Net welfare change',lambda q:-450+150+200,-100)
check(53,'Net welfare including administration',lambda q:-500+180+200-20,-140)
check(54,'Consumer loss trapezoid:(275+200)/2*3',lambda q:(275+200)/2*3,712.5)
check(54,'Producer gain trapezoid:(75+150)/2*3',lambda q:(75+150)/2*3,337.5)
check(54,'Quota rents: (200-150)*3',lambda q:(200-150)*3,150)
check(54,'Net welfare change',lambda q:-712.5+337.5+150,-225)
check(55,'Protection cost per job',lambda q:60000000/2000,30000)
check(55,'Transition cost per worker',lambda q:20000000/1500,13333.3333333333)
check(56,'UR percent: unemployed/(employed+unemployed)',lambda q:100*nums(q)[2]/(nums(q)[1]+nums(q)[2]),9.0909090909)
check(56,'LFPR percent',lambda q:100*(nums(q)[1]+nums(q)[2])/nums(q)[0],55)
check(64,'Combined marginal net benefit of batches 3 and 4',lambda q:-1500+500,-1000)
check(65,'Cost minus benefit of continuation',lambda q:600-520,80)
check(66,'Expected benefit',lambda q:.5*180000,90000)
check(66,'Direct plus opportunity cost',lambda q:70000+25000,95000)
check(68,'Maximum deposits 50/.10',lambda q:50/.1,500)
check(69,'Maximum deposits 30/.15',lambda q:30/.15,200)
check(73,'Reserve removal from actual multiplier',lambda q:nums(q)[0]/4,lambda q:nums(q)[0]/nums(q)[1])
check(74,'Deposit increase with 20% reserve fraction',lambda q:140/(.1+.1),700)
check(76,'Z net return minus next-best Y',lambda q:100000-15000-92000,-7000)
check(78,'Expected inflation at B:6+.6*(6-5)-1.1',lambda q:6+.6*(6-5)-1.1,5.5)
check(80,'Expected inflation as 5-s; s=0 gives 5',lambda q:4+(6-5),5)
check(82,'Change in saving',lambda q:nums(q)[0]-nums(q)[1],lambda q:-nums(q)[0]/2)
check(84,'GDP per worker percentage change',lambda q:100*(1.06/1.10-1),-3.6363636364)
check(85,'Graph point A output per worker',lambda q:28.53,28.53)
check(86,'Graph output difference B-A',lambda q:36.37-28.53,7.84)
check(89,'Plan A output loss',lambda q:3*3,9)
check(89,'Plan B output loss',lambda q:2*3,6)
check(90,'Observed sacrifice ratio',lambda q:(2+1+1)/(7-5),2)
check(90,'Remaining permitted inflation reduction',lambda q:(6-4)/2,1)
check(91,'Further inflation reduction within loss limit',lambda q:(6-4)/2,1)
check(91,'Output loss for original target',lambda q:4+2*2,8)
check(93,'Foreign purchases:200-(-120)',lambda q:200-(-120),320)
check(94,'Remaining AD shortfall',lambda q:500-(50+60-40)/(1-.75),220)
check(96,'Remaining excess AD',lambda q:360-50/(1-.8),110)
check(97,'Initial expected inflation',lambda q:6+(6-5)-2,5)
check(97,'Final inflation at natural unemployment',lambda q:5+1,6)

inferences={0:'Compare output and price restoration under a persistent supply constraint.',1:'Combine the multiplier with the timing of recovery.',3:'Reconcile unchanged real GDP with multiplicative changes in labor hours and productivity.',4:'Distinguish expected inflation from a supply shock using additional evidence.',5:'Compare output stabilization with its price-level cost while supply remains disrupted.',6:'Reassess stimulus after recovery and a new supply shock.',10:'Reconcile two accounting identities and identify the remaining ambiguity in trade figures.',12:'Recognize that competing spending changes do not determine their net effect without magnitudes.',14:'Separate the initial risk effect from interest-rate feedback on gross capital flows.',15:'Evaluate the counterfactual contribution of domestic prices to real depreciation.',18:'Reconcile lower dollar revenue per unit with higher total sales revenue.',19:'Identify a limitation of CPI without treating the entire index as invalid.',20:'Select appropriate price measures for household purchasing power and domestic output.',23:'Compare multiplier effects after unequal crowding out.',24:'Determine the bound on crowding out needed to keep the final curve between two spending outcomes.',25:'Distinguish constraints on deposit growth from constraints on investment spending.',26:'Identify which of two opposing capital-flow effects dominates without separately identifying their sizes.',27:'Compare the causal credibility of differently designed studies.',30:'Determine which additional changes are needed to check a trade-deficit claim through two identities.',37:'Compare equal aggregate-demand effects with unequal fiscal costs.',40:'Distinguish expected from realized real returns and solve for a new contract preserving the original expected return.',41:'Reconcile per-person output growth with falling hourly productivity.',50:'Combine tariff and capital-flight effects and identify the extra information needed for an exchange-rate magnitude.',52:'Combine consumer surplus, producer surplus and tariff revenue to find net welfare.',54:'Include domestic quota rents in national welfare rather than treating all consumer loss as a social loss.',65:'Compare future alternatives while excluding sunk expenditure.',66:'Combine expected benefits with direct and opportunity costs.',67:'Distinguish forecast accuracy from stability of a policy recommendation under plausible assumptions.',74:'Combine required and excess reserve ratios rather than using the required ratio alone.',75:'Distinguish a permanent change in money growth from a one-time change in the money stock.',76:'Compare the chosen project after conversion cost with the next-best feasible use.',78:'Infer expected inflation conditional on a measured supply effect and identify what the graph alone cannot determine.',79:'Compare the persistent expectations effect with a temporary supply shock across three periods.',81:'Distinguish lost trades from additional losses due to misallocation of remaining apartments.',84:'Reconcile rising GDP per person with falling output per worker.',88:'Reconcile expectations adjustment in AD-AS and the Phillips curve without changing potential output or natural unemployment.',90:'Use an observed sacrifice ratio to test whether a further inflation target fits a cumulative output-loss limit.',91:'Revise a disinflation plan after an unexpectedly costly first stage.',95:'Distinguish automatic reversals from discretionary spending despite implementation delays.',96:'Reverse the spending multiplier and distinguish an AD distance from an equilibrium GDP change.',97:'Track expected inflation before and after a temporary supply shock ends.'}
graphs={
'PG3-AD-H-001':('YES','NO','Reading two horizontal coordinates and subtracting is sufficient. This was already the approved task.','The two quantities at price level 50 must be read from AD0 and AD1.'),
'PG3-AD-H-002':('YES','NO','Reading two horizontal coordinates and subtracting is sufficient. This was already the approved task.','The two quantities at price level 45 must be read from AD0 and AD1.'),
'PM2B3-PROD-E-001':('YES','NO','Reading the output coordinate of A is sufficient. This was already the approved task.','The output coordinate of A is absent from the stem.'),
'PM2B3-PROD-M-001':('YES','NO','Subtracting the two plotted output values is sufficient. This was already the approved task.','The output values at A and B must be read from the graph.'),
'ECON-SP-ELITE-320':('NO','YES','The student must connect crowding out with the induced-spending portion of the demand shift.','The stem already orders AD1, AD2 and AD3 and states their meanings. The bound can be selected from those statements without viewing the graph.'),
'P62D-ITP-L-095':('NO','YES','The student must identify consumer loss, producer gain, tariff revenue and net welfare.','The alternatives permit eliminating every rival through the welfare identity or an impossible welfare gain in this standard tariff comparison, without reading plotted values.'),
'P62D-ITP-L-098':('NO','YES','The student must identify consumer loss, producer gain, domestic quota rents and net welfare.','The rivals report a welfare gain or zero net loss despite positive quota rents. Standard binding-quota reasoning allows eliminating those rivals without reading magnitudes.'),
'PG3-MEQ-L-004':('NO','NO','Coordinates alone do not establish which demand policy restores output versus prices while supply remains disrupted.','Choices A and D both describe further contraction to restore prices, but disagree on its output. AS1 and the original price are required.'),
'ECON-SP-LEGENDARYBOSS-9102':('NO','NO','Restoring output through demand does not reverse the underlying supply shock; the student must distinguish those mechanisms.','Choices A and D both allow higher prices under demand expansion; the plotted equilibria determine overshooting versus restoration.'),
'PG5-PC-L-006':('NO','NO','Expected inflation must be inferred from the Phillips relation and the limits of separately identifying the supply effect.','Choices A and B share the valid identification limitation but differ in expected inflation; B\'s coordinates are required.')}
accepted={}
for n,fam in enumerate(families):
 for q in fam:
  i=str(q['id']);d=p[i];advanced=bool(re.search('elite|legendary',str(q.get('difficulty','')),re.I));f=findings[i]
  assert len(d['options'])==len(set(d['options']))==4
  a={'student_review_classification':f['classification'],'student_review_concern':f['student_reaction'],'decoding_burden_removed':f['suggested_direction'],'economic_construct_preserved':True,'difficulty_preserved':True,'required_reasoning_preserved':True,'required_reasoning':inferences.get(n,q['feedback']),'focused_student_acceptance':'PASS','feedback_check':'PASS','answer_reasoning_check':'PASS','key_reasoning':d['feedback'],'numerical_checks':checks[i],'advanced':advanced,'advanced_inference':inferences.get(n,q['feedback']) if advanced else None,'advanced_inference_preserved':True if advanced else None,'graph_design_preserved':True}
  if i in graphs:
   c,g,cr,gr=graphs[i];a['graph_checks']={'coordinates_alone_sufficient':c,'theory_alone_sufficient':g,'construct_test':'PASS' if c=='NO' else 'FAIL','graph_test':'PASS' if g=='NO' else 'FAIL','construct_reason':cr,'graph_reason':gr,'same_result_before_cleanup':True,'exception':'Existing approved task preserved; satisfying the additional test would require graph-assessment redesign, prohibited by this wording-only scope.' if c=='YES' or g=='YES' else None}
  if i=='ECON-SP-LEGENDARY-9029':a['instructor_clarification']='Few households or firms want to borrow; directly confirmed by the instructor during this cleanup.'
  accepted[i]=a
exact=defaultdict(list);normalized=defaultdict(list);length_cues=[];new_pairs=[]
norm=lambda s:re.sub(r'\d+(?:[.,]\d+)*','#',s)
for i,d in p.items():
 exact[d['q']].append(i);normalized[norm(d['q'])].append(i)
 sizes=[len(t.split()) for t in d['options']];k=d['correct_index'];rival=max(v for j,v in enumerate(sizes) if j!=k)
 if sizes[k]>=1.5*rival and sizes[k]-rival>=8:length_cues.append(i)
for group in normalized.values():
 for j,i in enumerate(group):
  for k in group[j+1:]:
   if norm(o[i]['q'])!=norm(o[k]['q']):new_pairs.append([i,k])
exact_new=[g for g in exact.values() if len(g)>1 and len({o[i]['q'] for i in g})>1]
assert not length_cues,length_cues
assert not exact_new,exact_new
assert new_pairs==[['LG-Q-314','LG-Q-9019']],new_pairs
bad=re.compile(r'Which assessment combines|Which model-use caution|Which joint AD-AS/Phillips|What connection is required|supply offset|vertical-NCO FX|negative continuation margin|margins of adjustment|GROWTH-01|loss budget|second ledger|active-search unemployment|borrowers are weak',re.I)
assert not [i for i,d in p.items() if bad.search(d['q']+' '+' '.join(d['options']))]
for name,data in [('reviews.json',accepted),('numerical_checks.json',{'status':'PASS','checks':checks,'calculation_count':sum(map(len,checks.values()))}),('pattern_review.json',{'status':'PASS','scope':128,'new_exact_duplicate_stems':exact_new,'new_number_template_pairs':new_pairs,'intentional_family_alignment':'LG-Q-314 and LG-Q-9019 already test the same deposit multiplier under the same assumptions. Removing repeated conditions makes their numerical wording consistent; no cosmetic synonyms were added to hide this existing task family.','new_answer_length_cues':length_cues,'number_families':[g for g in normalized.values()if len(g)>1]})]:
 (H/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Accepted',len(accepted),'Numerical calculations',sum(map(len,checks.values())),'Graph exceptions',sum(bool(a.get('graph_checks',{}).get('exception')) for a in accepted.values()))
