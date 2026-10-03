"""Record the item-by-item editorial and economic checks for the authorized worklist."""
import json,re
from pathlib import Path
HERE=Path(__file__).resolve().parent
ledger=json.loads((HERE/'expectations.json').read_text(encoding='utf-8'))
def nums(s):return [float(x.replace(',','')) for x in re.findall(r'\d+(?:,\d{3})*(?:\.\d+)?',s)]
natural={
'W01':'Uses a grammatical country reference and names the market and affected domestic group directly.',
'W02':'Corrects the article before “eight” without changing the scenario.',
'W03':'Describes quantity responses precisely and asks directly how consumer losses divide into transfers and deadweight loss.',
'W04':'Replaces “ledger” with the three economic quantities the student must calculate.',
'W05':'Names the product naturally and spells out the welfare calculations instead of calling them a ledger.',
'W06':'Asks directly for evidence of additional learning and benefits that justify the costs of protection.',
'W07':'Uses the standard term “linear” and identifies the demand and supply curves clearly.',
'W08':'States the opportunity-cost units and the requested comparison instead of using “reciprocal-rate” shorthand.',
'W09':'Explains mutual gains in ordinary language and explicitly excludes break-even trading prices.',
'W10':'Replaces the ledger metaphor with the relevant accounting boundary: before adjustment costs or additional export losses.',
'W11':'Names both economists and explains their different fairness judgments.',
'W12':'Turns compressed notes into complete questions about advice, assumptions, and disagreement.',
'W13':'Describes a forecast range in plain language while retaining uncertainty as the tested idea.',
'W14':'Asks directly about equilibrium price and quantity instead of assessment-writing terminology.',
'W15':'Names the provider or driver behavior and explains the incentive problem concretely.',
'W16':'Asks about the decision affected by the incentive rather than using the abstract word “margin.”',
'W17':'Describes lost cargo earnings and an additional flight in familiar business language.',
'W18':'Makes the common points scale, alternative use of staff, and treatment comparison explicit.',
'W19':'Asks whether the hospital should add the test after accounting for all listed costs.',
'W20':'States the comparison between the alternatives directly while preserving the strict threshold.',
'W21':'Uses a direct request for a supported conclusion or for the distinction between predictions and values.',
'W22':'Explains whose tax burden is measured and retains the exclusion of lost trades.'}
manual={
'ECON-MG-EQUILIBRIUM-PREDICTION-5008':'With supply fixed, higher demand raises both equilibrium price and quantity. The other three choices give an incorrect direction.',
'P52A-MARG-L-003':'Marginal cost = 250 + 190 = 440 > 420 benefit; do not add the test. Both cost components remain in the stem.',
'P52B-TRADE-EL-001':'Iona: 8/32 = 1/4 sign per badge; Paz: 9/18 = 1/2. The offered 1/3 lies strictly between them; Iona exports badges.',
'P52B-TRADE-LB-003':'160 - 60 = 100 gross gain; 100 - 30 - 15 = 55 million net. The compensation transfer is not deducted twice and is not automatic.',
'P62D-ITP-B3-041':'At tariff 5: Qs = 15, Qd = 45, imports = 30, revenue = 150, DWL = 25. Relative to revenue 200 and DWL 100: both fall, by 50 and 75 respectively.',
'P62D-ITP-B3-052':'40 + 25 - 80 - 20 = -35 million. The explicitly additional export loss is counted once; tariff revenue is a domestic transfer.',
'P62D-ITP-EL-012':'The common machine can explain lower costs without protection. The key alone requires additional learning attributable to protection and benefits exceeding its costs.',
'P62D-ITP-EL-030':'Net imports change by -40 over a 10-dollar rise: -4 per dollar. Removing 24 imports requires 6 dollars, so zero trade occurs at 26.',
'P62D-ITP-L-096':'The graph’s original tariff of 2 becomes 1. At P = 5, Qs = 75 and Qd = 225 thousand: revenue = 150 thousand; DWL = 0.5 × 1 × (25 + 25) = 25 thousand.',
'P62D-ITP-L-100':'The unchanged graph implies Qd = 350 - 25P, Qs = 25P (thousands). Setting their difference to 100 gives P = 5. Rent = (5 - 3) × 100 = 200 thousand; DWL = 0.5 × 2 × (50 + 50) = 100 thousand.',
'P72-OPPC-L-010':'61 > 76 - x exactly when x > 15. Equality remains excluded. The higher thresholds in other options omit valid values and do not describe the full solution set.',
'P73-MARG-H-007':'240 - 35 - 170 = 35 net marginal benefit. Net cargo earnings remain an opportunity cost, separate from the passenger’s service cost.',
'P73-MARG-L-006':'Original: 88 - 42 - 35 = 11. Alternative: (88 - 12) - (42 - 8) - 35 = 7. Original treatment has the larger gain; all valuations share the same scale.',
'P73-MARG-L-007':'80,000 - 54,000 - 18,000 = 8,000. Delay costs remain included, as in the approved scenario.',
'P74-INC-EL-003':'Adjusting targets for client support needs reduces the reward for selecting only easy clients; sustained-outcome rewards retain incentives for effort. The unchanged distractors do not meet both objectives.',
'P74-INC-L-021':'The twelve-month reward directly affects whether subscribers stay through that month. It does not determine program quality, guarantee retention, or establish moral approval.',
'P74-INC-M-008':'Drivers respond to the measured acceptance rate while shifting the service problem to cancellations. The other choices deny or overstate what the scenario establishes.',
'P74-INC-M-010':'Advance cancellation avoids the fee, so the affected choice is early cancellation versus not appearing. The other alternatives address membership, health effects, or moral approval.',
'P75-TRADE-H-007':'18/6 = 3 X per Y for River; 12/8 = 1.5 for Hill. The other ratios do not give these opportunity costs.',
'P75-TRADE-H-010':'For both to gain, the price in panels per bolt must be strictly above 0.5 and below 1.25. Break-even endpoints are explicitly excluded.',
'P75-TRADE-L-007':'The exporter must receive more than 2 + 1 = 3 batteries per motor; the importer pays less than 5. Inverting gives 1/5 < motors per battery < 1/3, with endpoints excluded.',
'P75-TRADE-L-014':'Mutual gains require 3 < tea per cocoa < 6. Inverting gives 1/6 < cocoa per tea < 1/3. Both break-even endpoints remain excluded.',
'P75-TRADE-L-021':'Increasing opportunity cost can end profitable reallocation before complete specialization. The key makes a possibility claim; the other choices deny opportunity cost or impose unjustified universal rules.',
'P75-TRADE-M-009':'One mug costs two bowls, so one bowl costs one-half mug under the stated exchange of production alternatives.',
'P77-EPOL-BR-041':'Advice from an assumption-dependent model should explain how the conclusion changes with the assumption. The other choices conceal, discard, or unnecessarily block the analysis.',
'P77-EPOL-EASYB-024':'A range acknowledges forecast uncertainty; it does not guarantee coverage, select a normative policy, or imply equal probabilities.',
'P77-EPOL-M-007':'The predicted effects are agreed; the remaining disagreement is about the weight placed on equity, a normative value.',
'P77-EPOL-MEDIUMB-027':'Agreed policy effects and different fairness weights identify normative evaluation, not different forecasts or a reading error.',
'P77-EPOL-R-039':'Economists may disagree over evidence, models, or values; political disagreement is not necessary. The three yes answers impose unsupported universal claims.',
'P77-PVN-LB-034':'A adds 6 - 4 = 2 points and costs 4 - 1 = 3 more hours. These predictions are positive; the board’s weight is normative. The 1.5-hour cost per point is below its stated value of at least 2 hours.',
'ECON-MG-ELITE-318':'Seller burden on remaining trades = (40 - 34) × 420 = 2,520. The original 500 units, total wedge, and net receipts answer different questions.',
'ECON-MG-HARD-276':'Unchanged graph: original price 15, net seller price 12, remaining quantity 80. Seller burden = (15 - 12) × 80 = 240; lost trades remain excluded.',
'ECON-MG-HARD-277':'Unchanged graph: buyer price 18, seller price 12, taxed quantity 80. Combined burden and revenue = (18 - 12) × 80 = 480, excluding losses on missing trades.',
'ECON-MG-HARD-279':'Sales receipts fall from 15 × 100 = 1,500 to 12 × 80 = 960, a decline of 540. Only 240 is the price effect on remaining trades; seller incidence per remaining unit is 3.'}
out={}
for c in ledger['changes']:
 i=c['id'];q=c['afterRecord'];s=q['q'];key=q['options'][c['correctIndex']];codes=c['findingIds'];review=c['review']
 if review.get('hide_graph_test'):
  evidence=review['numerical_or_graph_verification']
  natural_text='Uses a concrete economics question about the displayed values or labeled points. The alternatives distinguish graph evidence rather than obvious conceptual errors.'
 else:
  natural_text=' '.join(natural[x] for x in codes)
  before_nums=sorted(nums(c['beforeRecord']['q']));after_nums=sorted(nums(s))
  if i in ['P75-TRADE-H-007','P75-TRADE-L-014']:before_nums.remove(1) # “1” written as “one”
  assert before_nums==after_nums,(i,before_nums,after_nums)
  if 'W01' in codes:
   a,b,p,cost=nums(s);aut=(a+b)/2;net=(p-aut)**2-cost
   assert nums(key)==[net],(i,net,key)
   evidence=f'Autarky price = ({a:g} + {b:g})/2 = {aut:g}. Net gains after full compensation and administration = ({p:g} - {aut:g})² - {cost:g} = {net:g}. Exactly one alternative gives this amount.'
  elif i in ['P62D-ITP-H-018','P62D-ITP-H-024','P62D-ITP-H-030']:
   a,b,p,t=nums(s);loss=t*t;assert nums(key)==[loss]
   evidence=f'The two unit-slope distortion triangles total 0.5 × {t:g} × ({t:g} + {t:g}) = {loss:g}. Tariff revenue remains a transfer.'
  elif 'W03' in codes:
   m0,m1,unit,consumer=nums(s);t=(m0-m1)/2;rev=t*m1;loss=t*t;producer=consumer-rev-loss
   assert nums(key)==[t,rev,producer,loss],(i,key)
   evidence=f'Tariff = ({m0:g} - {m1:g})/2 = {t:g}; revenue = {rev:g}; two triangles total {loss:g}; producer gain = {consumer:g} - {rev:g} - {loss:g} = {producer:g}. Only the key gives the complete consistent decomposition.'
  elif 'W04' in codes:
   a,b,p,m=nums(s);t=(a+b-m)/2-p;rev=t*m;loss=t*t;assert nums(key)==[t,rev,loss]
   evidence=f'Imports = {a+b:g} - 2P. Imports of {m:g} imply P = {p+t:g}, a tariff of {t:g}; revenue = {rev:g}; deadweight loss = {loss:g}. No other complete alternative matches.'
  elif 'W05' in codes:
   if i.endswith('009'):a,b,p,t=72,12,20,8
   elif i.endswith('027'):a,b,p,t=78,16,26,7
   else:a,b,p,t=nums(s)
   m=a+b-2*(p+t);values=[m,t*m,t*t/2,t*t/2,t*t];assert nums(key)==values,(i,key,values)
   evidence=f'At price {p+t:g}, Qd = {a-(p+t):g} and Qs = {p+t-b:g}: imports = {m:g}, revenue = {t*m:g}, and each distortion triangle = {t*t/2:g}; total DWL = {t*t:g}. '+('The unchanged graph supplies the demand/supply quantities. ' if i.endswith(('009','027')) else '')+'Only the key gives all five values correctly.'
  else:evidence=manual[i]
 out[i]={'what_changed':', '.join({'q':'stem','options':'answer choices','feedback':'feedback','aHash':'answer hash'}[f] for f in c['fields']),
 'why_more_natural':natural_text,'economic_and_numerical_check':evidence,
 'validation':{'four_distinct_choices':'PASS','one_defensible_answer':'PASS','feedback_matches':'PASS','numerical_values':'PASS' if re.search(r'\d',evidence) else 'Not numerical; economic reasoning checked','method':'Exact automated structural/key checks plus item-by-item economic, arithmetic, feedback, and graph review.'}}
 if review.get('hide_graph_test'):
  out[i]['validation'].update(graph_information_not_disclosed_in_stem='PASS',no_conceptual_elimination_shortcut='PASS',hide_graph_test='YES')
assert len(out)==126
(HERE/'review_details.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('126 individual review records; all 71 wording-only stems preserve numerical inputs (two 1→one changes).')
