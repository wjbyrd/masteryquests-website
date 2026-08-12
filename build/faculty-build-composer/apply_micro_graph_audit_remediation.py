import json, re, hashlib, unicodedata, copy
from pathlib import Path
from collections import Counter, defaultdict

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
AUDIT=Path('/mnt/data/MICRO_GRAPH_QUESTION_AUDIT_2026-08-12.json')
RECENT=Path('/mnt/data/TODAYS_GRAPH_QUESTIONS_AUDIT_CORRECTED.json')
PHASE='phaseMicroGraphAudit-remediation-v1'
GEN='2026-08-12T20:40:00.000Z'
RELEASE='4.5s.2j'

SOURCE_FILES={
 'Elasticity': ROOT/'phase6_2b_elasticity_graph_expansion_v2_questions.json',
 'Trade': ROOT/'phase6_2d_international_trade_graph_expansion_v2_questions.json',
 'Costs': ROOT/'phase6_2e_cost_graph_expansion_v2_questions.json',
 'Perfect Competition': ROOT/'phase6_2f_perfect_competition_graph_expansion_v2_questions.json',
 'Monopoly': ROOT/'phase6_2g_monopoly_graph_expansion_v2_questions.json',
 'Monopolistic Competition': ROOT/'phase6_2h_monopolistic_competition_graph_expansion_v2_questions.json',
}

def norm(s): return ' '.join(unicodedata.normalize('NFKC',str(s)).strip().split()).lower()
def ah(s): return hashlib.sha256(norm(s).encode()).hexdigest()
def th(s): return hashlib.sha256(s.encode()).hexdigest()
def load_lib():
 s=LIB.read_text(); return json.loads(s.split('=',1)[1].strip().rstrip(';'))
def save_lib(lib): LIB.write_text('window.MQ_COMPOSER_LIBRARY='+json.dumps(lib,separators=(',',':'),ensure_ascii=False)+';\n')

def iter_all(lib):
 for cid,c in lib['concepts'].items():
  for pool,arr in c.get('questions',{}).items():
   for q in arr: yield cid,pool,q
  for key in ['repairQuestions','bridgeQuestions','repairSeedQuestions']:
   for q in c.get(key,[]): yield cid,key,q

def source_hash(q):
 payload={k:q.get(k) for k in ['id','q','options','image','primarySkill','primaryConceptId','difficulty','objective']}
 return th(json.dumps(payload,sort_keys=True,ensure_ascii=False,separators=(',',':')))

def finalize_record(q, correct=None):
 if correct is None:
  hits=[o for o in q['options'] if ah(o)==q.get('aHash')]
  if len(hits)!=1:
   raise RuntimeError(f"cannot resolve answer for {q['id']}: {hits}")
  correct=hits[0]
 if correct not in q['options']:
  raise RuntimeError(f"correct option missing {q['id']}")
 q['aHash']=ah(correct)
 q['sourceHash']=source_hash(q)
 for occ in q.get('sourceOccurrences') or []:
  occ['sourceHash']=q['sourceHash']
 return correct

lib=load_lib()
audit=json.loads(AUDIT.read_text())
recent=json.loads(RECENT.read_text())
idx={q['id']:(cid,pool,q) for cid,pool,q in iter_all(lib)}
audit_by_id={r['id']:r for r in audit}
recent_ids={r['id'] for r in recent}
audit_ids={r['id'] for r in audit}

# Snapshot target records for integrity/change accounting.
before={qid:copy.deepcopy(idx[qid][2]) for qid in (audit_ids|recent_ids)}

# -----------------------------------------------------------------------------
# 1) Graph-dependency rewrites from the audit.
# -----------------------------------------------------------------------------
leak_stems={
# Elasticity
'P62B-ELAS-M-031':'Using the labeled price and quantity at point C, what total revenue is implied?',
'P62B-ELAS-M-032':'Using the labeled price and quantity at point B, what total revenue is implied?',
'P62B-ELAS-M-033':'Compare points C and B and calculate total revenue at each. What does the change imply about demand over that interval?',
'P62B-ELAS-H-031':'Using the labeled coordinates at points C and B, what is the midpoint price elasticity of demand?',
'P62B-ELAS-H-032':'Using the labeled coordinates at points B and A, what is the midpoint price elasticity of demand?',
'P62B-ELAS-H-033':'Using the labeled coordinates at points C and A, what is the midpoint price elasticity of demand?',
'P62B-ELAS-EL-031':'Use the price, quantity, and total-revenue change from C to B. Which elasticity conclusion follows?',
'P62B-ELAS-EL-032':'Use the price, quantity, and total-revenue change from B to A. Which elasticity conclusion follows?',
'P62B-ELAS-L-091':'Compare the C→B and B→A intervals on the graph. Why can their elasticity classifications differ?',
'P62B-ELAS-B2-019':'Checkpoint: Calculate total revenue at C, B, and A. Which pattern is correct as price falls across those points?',
'P62B-ELAS-M-034':'On D1, compare the labeled quantities at the two marked prices. What is the change in quantity demanded?',
'P62B-ELAS-M-035':'On D2, compare the labeled quantities at the two marked prices. What is the change in quantity demanded?',
'P62B-ELAS-H-035':'Using the two labeled points on D1, what is the midpoint price elasticity of demand?',
'P62B-ELAS-H-036':'Using the two labeled points on D2, what is the midpoint price elasticity of demand?',
'P62B-ELAS-EL-034':'Calculate total revenue at the two labeled points on D1. What does the change confirm about elasticity?',
'P62B-ELAS-EL-035':'Calculate total revenue at the two labeled points on D2. What does the change confirm about elasticity?',
'P62B-ELAS-L-094':'Use the labeled intervals to calculate midpoint elasticity on D1 and D2. Which statement follows?',
'P62B-ELAS-M-037':'Follow the two labeled points on vertical D2. What happens to quantity demanded when price changes between them?',
'P62B-ELAS-B3-019':'Checkpoint: Use points A and B on vertical D2. What elasticity property does their price-quantity pattern demonstrate?',
'P62B-ELAS-M-039':'Compare the short-run and long-run supply responses to the same price change. Why is the long-run response larger?',
'P62B-ELAS-H-039':'Using the common starting point and point A on the short-run supply curve, what is midpoint price elasticity of supply?',
'P62B-ELAS-EL-037':'Using the common starting point and point B on the long-run supply curve, what is midpoint price elasticity of supply?',
'P62B-ELAS-L-097':'Calculate midpoint PES for the short-run and long-run curves. Approximately how many times larger is the long-run elasticity?',
'P62B-ELAS-B2-020':'Checkpoint: Compare the two supply curves over the marked price change. Which curve is more elastic?',
# Costs
'P62E-COP-L-091':'For an output between the AVC minimum and the AC minimum shown, which ordering of AVC, MC, and AC is consistent with the graph?',
'P62E-COP-H-039':'At zero output, what explains the vertical gap between the total-cost and variable-cost curves?',
'P62E-COP-EL-035':'Use the horizontal TFC line and the marked output of 200 units. What average fixed cost is implied?',
'P62E-COP-B2-037':'At the marked output Q = 120, which cost identity is demonstrated by points A, B, and C?',
'P62E-COP-M-040':'At the labor input where the displayed total-product curve reaches its maximum, what is marginal product?',
'P62E-COP-M-041':'For labor inputs to the right of the total-product maximum, what sign does marginal product have?',
'P62E-COP-H-040':'Use the shape of total product between about 6 and 9 workers. Which description of marginal product fits that region?',
'P62E-COP-H-041':'Use the portion of the total-product curve after its maximum. Which combination of total product and marginal product is consistent with the graph?',
'P62E-COP-EL-037':'Which visual feature shows that diminishing marginal product begins before total product starts falling?',
'P62E-COP-EL-038':'At the total-product maximum, use the labeled output and labor input to calculate average product.',
'P62E-COP-L-095':'Move one worker beyond the total-product maximum. Which pair of statements must be true?',
'P62E-COP-B1-019':'Checkpoint: Use the total-product curve to correct the claim that “TP is maximized where MP is maximized.”',
'P62E-COP-H-042':'At the marked labor input where MP lies above AP, what should happen to AP when another worker is added?',
'P62E-COP-H-043':'At the marked labor input where MP is below AP but still positive, what happens to TP and AP as another worker is added?',
'P62E-COP-H-044':'At the point where the MP and AP curves intersect, what is true of average product?',
'P62E-COP-EL-039':'Just to the right of the point where MP crosses zero, how should the positive AP reading and the shape of TP be interpreted together?',
'P62E-COP-L-096':'Compare the locations of the MP peak and AP peak. What does their ordering demonstrate about marginal and average product?',
'P62E-COP-L-097':'At the labor input near the TP maximum, use the displayed AP value to infer total product.',
'P62E-COP-B1-020':'Checkpoint: At the MP–AP intersection, what is happening to AP?',
'P62E-COP-B2-038':'Checkpoint: In the region where MP is below AP but still positive, which product measure has already passed its maximum while total product has not?',
# Trade
'P62D-ITP-EL-031':'Using the autarky equilibrium and free-trade outcome, calculate the loss in domestic producer surplus when this importing market opens to trade.',
'P62D-ITP-EL-032':'Using the surplus areas before and after trade opens, what is the net national gain?',
'P62D-ITP-L-092':'Use the consumer- and producer-surplus changes shown when trade opens. Which welfare statement is correct?',
'P62D-ITP-EL-033':'Using the autarky equilibrium and free-trade outcome, calculate the loss in domestic consumer surplus when this exporting market opens to trade.',
'P62D-ITP-EL-034':'Using the surplus areas before and after trade opens, what is the net national gain in this exporting market?',
'P62D-ITP-EL-035':'Using the free-trade and post-tariff markers, calculate the consumer-surplus loss caused by the tariff.',
'P62D-ITP-EL-036':'Using the free-trade and post-tariff markers, calculate the producer-surplus gain caused by the tariff.',
'P62D-ITP-L-096':'Compare domestic production and consumption before and after the tariff. What do the two changes represent?',
'P62D-ITP-L-097':'Compare the free-trade import gap with the post-tariff import gap. Which statement is economically accurate?',
'P62D-ITP-H-040':'Compare the free-trade import gap with the quota import gap. By how much do imports fall?',
'P62D-ITP-EL-038':'Using the world-price and quota-price outcomes, calculate the consumer-surplus loss caused by the quota.',
'P62D-ITP-L-099':'Calculate the quota rents from the price wedge and remaining imports. If foreign exporters received those rents, what would happen to domestic national welfare?',
'P62D-ITP-L-100':'Compare the free-trade and quota outcomes. Which interpretation of production, consumption, and welfare is correct?',
# Perfect competition
'P62F-PC-H-031':'Using the firm’s profit-maximizing output and the market price shown, calculate total revenue.',
'P62F-PC-H-032':'Using the displayed ATC at the profit-maximizing output, calculate the firm’s total cost.',
'P62F-PC-H-033':'Using the displayed AVC at the chosen output, calculate total variable cost.',
'P62F-PC-L-092':'At the selected output, compare price with ATC. Which statement about economic profit is most accurate?',
'P62F-PC-M-038':'At the firm’s chosen output in the loss graph, what is the loss per unit?',
'P62F-PC-H-037':'Use the vertical gap between ATC and AVC at the chosen output to calculate total fixed cost.',
'P62F-PC-B2-037':'Checkpoint: Compare the firm’s operating loss with the fixed cost implied by the graph. What does that comparison tell the firm?',
'P62F-PC-H-040':'Using the market price and representative firm output in the paired profit graph, calculate total revenue.',
'P62F-PC-H-042':'The firm panel shows positive economic profit. If that condition persists, which market adjustment follows?',
'P62F-PC-EL-038':'Trace the representative firm’s output choice as entry lowers the market price while its cost curves stay fixed. What happens to output?',
'P62F-PC-B3-056':'Checkpoint: If the profit shown in the firm panel persists, what completes the long-run adjustment?',
'P62F-PC-M-044':'Use the price and ATC at the representative firm’s chosen output. What is the loss per unit?',
'P62F-PC-M-046':'Use price and AVC at the chosen output. Why does the representative firm continue producing in the short run?',
'P62F-PC-H-044':'Use the gap between ATC and AVC at the chosen output to calculate total fixed cost.',
'P62F-PC-H-045':'The firm panel shows an economic loss. If that loss persists, which market adjustment follows?',
'P62F-PC-EL-040':'Trace the surviving firm’s output choice as exit raises market price while its cost curves stay fixed. What happens to output?',
'P62F-PC-B3-057':'Checkpoint: Use the market price, ATC, and AVC at the chosen output. What is the correct combined short-run and long-run decision?',
'P62F-PC-H-046':'At the selected output, which efficiency condition is illustrated by the equality of price and marginal cost?',
'P62F-PC-H-047':'At the selected output, which efficiency condition is illustrated by production at the minimum of ATC?',
# Monopoly
'P62G-MON-M-039':'At the profit-maximizing output in the natural-monopoly graph, use price and ATC to calculate profit per unit.',
'P62G-MON-M-044':'At the marginal-cost-pricing output, use ATC and the regulated price to calculate the loss per unit.',
'P62G-MON-H-031':'At the profit-maximizing output, why is the price read from demand above marginal revenue?',
# Monopolistic competition
'P62H-MCMP-H-031':'Using the chosen output, price, and ATC in the short-run graph, which statement correctly describes the firm’s economic result?',
'P62H-MCMP-L-091':'If entry eliminates the short-run profit shown while the firm remains monopolistically competitive, which long-run condition should emerge?',
'P62H-MCMP-H-034':'Use the long-run graph to explain why zero economic profit is consistent with the firm continuing to operate.',
'P62H-MCMP-H-035':'At the chosen output in the long-run zero-profit graph, compare price with marginal cost. What does the gap imply?',
'P62H-MCMP-EL-033':'If the displayed zero-profit outcome is a long-run equilibrium, what market force has already done its work?',
'P62H-MCMP-L-092':'Use the long-run zero-profit graph to evaluate the claim that zero profit makes the firm both productively and allocatively efficient.',
'P62H-MCMP-B2-037':'Checkpoint: Compare price with ATC at the chosen output. What conclusion follows immediately?',
'P62H-MCMP-EL-035':'Compare the long-run demand curve with a profitable short-run position. What happened to the demand facing the incumbent as entry occurred?',
'P62H-MCMP-L-094':'Use the long-run graph to trace the adjustment after short-run profit attracts entry. Which sequence is correct?',
}

# -----------------------------------------------------------------------------
# 2) Redundant-task replacements. Keep IDs but change the task so pools deepen.
# -----------------------------------------------------------------------------
replacements={
# Elasticity checkpoint differentiation
'P62B-ELAS-B1-019': dict(q='Checkpoint: At point B, what does the graph imply about total revenue for a small movement in either direction along the same linear demand curve?', options=['Total revenue is locally maximized','Total revenue must rise in either direction','Total revenue must fall as price falls','Total revenue is zero at the midpoint'], correct='Total revenue is locally maximized', feedback='Point B is the unit-elastic midpoint of the linear demand curve, where total revenue is at its maximum among nearby points.', skill='total_revenue_test'),
'P62B-ELAS-B3-019': dict(q='Checkpoint: Using the two labeled points on vertical D2, what is the midpoint price elasticity of demand?', options=['0','0.50','1.00','Undefined because price changes'], correct='0', feedback='Quantity is unchanged between the two points, so the percentage change in quantity is zero and PED equals zero.', skill='midpoint_formula'),
'P62B-ELAS-B2-020': dict(q='Checkpoint: The two supply curves share the same starting point and face the same price increase. Which graph-based reason makes the long-run curve more elastic?', options=['Its quantity response is larger','Its price change is larger','Its starting quantity is smaller','Its curve is vertical'], correct='Its quantity response is larger', feedback='With the same price change and starting point, the long-run curve shows the larger percentage quantity response.', skill='time_horizon_supply'),
# Costs checkpoint differentiation
'P62E-COP-B2-038': dict(q='Checkpoint: In the region where MP is below AP but still positive, which product measure has already passed its maximum while total product has not?', options=['Average product','Total product','Both average and total product','Neither average nor total product'], correct='Average product', feedback='When MP is below AP, AP is falling and has already passed its peak; because MP is still positive, TP is still rising.', skill='marginal_average_relationship'),
# Monopoly checkpoint differentiation
'P62G-MON-B1-055': dict(q='Checkpoint: At the profit-maximizing output, what percentage of the $42 price is economic profit per unit?', options=['About 36 percent','About 15 percent','About 57 percent','About 64 percent'], correct='About 36 percent', feedback='Profit per unit is $15 and price is $42, so $15/$42 is about 35.7 percent.', skill='monopoly_profit'),
'P62G-MON-B2-056': dict(q='Checkpoint: Using the monopoly output and ATC shown, what total cost is implied before comparing it with revenue?', options=['$1,800','$1,600','$1,400','$2,000'], correct='$1,800', feedback='ATC is $45 at Q = 40, so total cost is $45 × 40 = $1,800.', skill='monopoly_profit'),
# CPS balanced
'P62C-CPS-H-005': dict(q='Which expression correctly calculates consumer surplus in the balanced equilibrium graph?', options=['½ × 8 × ($18 − $10)','8 × $10','½ × 8 × ($10 − $2)','½ × 16 × $10'], correct='½ × 8 × ($18 − $10)', feedback='Consumer surplus is the triangle above the $10 equilibrium price and below demand through Q = 8.', skill='consumer_surplus_graph_area'),
'P62C-CPS-L-017': dict(q='Using the balanced equilibrium graph, what is buyers’ total willingness to pay for the 8 units traded?', options=['$112','$80','$64','$48'], correct='$112', feedback='Total willingness to pay is the area under demand through Q = 8: expenditure $80 plus consumer surplus $32 = $112.', skill='total_surplus_graph'),
'P62C-CPS-C-019': dict(q='What is total buyer expenditure at the balanced competitive equilibrium?', options=['$80','$32','$64','$112'], correct='$80', feedback='Equilibrium expenditure is P × Q = $10 × 8 = $80.', skill='consumer_surplus_graph_area'),
'P62C-CPS-B1-015': dict(q='Checkpoint: What is the vertical height of the consumer-surplus triangle in the balanced equilibrium graph?', options=['$8','$10','$16','$32'], correct='$8', feedback='The demand intercept is $18 and equilibrium price is $10, so the triangle height is $8.', skill='consumer_surplus_graph_area'),
'P62C-CPS-L-018': dict(q='Using the balanced equilibrium graph, what is sellers’ total production cost for the 8 units traded?', options=['$48','$80','$32','$112'], correct='$48', feedback='Seller revenue is $80 and producer surplus is $32, so total production cost is $48.', skill='producer_surplus_graph_area'),
'P62C-CPS-C-022': dict(q='What total revenue do sellers receive at the balanced competitive equilibrium?', options=['$80','$32','$48','$112'], correct='$80', feedback='Equilibrium revenue is P × Q = $10 × 8 = $80.', skill='producer_surplus_graph_area'),
'P62C-CPS-B1-016': dict(q='Checkpoint: What is the vertical height of the producer-surplus triangle in the balanced equilibrium graph?', options=['$8','$10','$16','$32'], correct='$8', feedback='Equilibrium price is $10 and the supply intercept is $2, so the triangle height is $8.', skill='producer_surplus_graph_area'),
'P62C-CPS-L-019': dict(q='At the balanced competitive equilibrium, what share of total surplus goes to consumers?', options=['50 percent','25 percent','75 percent','100 percent'], correct='50 percent', feedback='Consumer surplus and producer surplus are each $32, so consumers receive half of the $64 total surplus.', skill='total_surplus_graph'),
'P62C-CPS-C-025': dict(q='At the balanced competitive equilibrium, what is the difference between consumer surplus and producer surplus?', options=['$0','$16','$32','$64'], correct='$0', feedback='Consumer surplus and producer surplus are both $32, so the difference is zero.', skill='total_surplus_graph'),
# CPS asymmetric
'P62C-CPS-L-021': dict(q='At the asymmetric competitive equilibrium, what is total buyer expenditure?', options=['$112','$64','$96','$176'], correct='$112', feedback='Equilibrium price is $14 and quantity is 8, so buyer expenditure is $112.', skill='consumer_surplus_graph_area'),
'P62C-CPS-C-020': dict(q='What is the vertical height of the consumer-surplus triangle in the asymmetric equilibrium graph?', options=['$16','$8','$14','$30'], correct='$16', feedback='The demand intercept is $30 and equilibrium price is $14, giving a height of $16.', skill='consumer_surplus_graph_area'),
'P62C-CPS-B2-007': dict(q='Checkpoint: What competitive-equilibrium price is shown in the asymmetric market graph?', options=['$14','$8','$22','$30'], correct='$14', feedback='The dashed horizontal guide through E marks the equilibrium price at $14.', skill='consumer_surplus_graph_area'),
'P62C-CPS-H-006': dict(q='Which expression correctly calculates producer surplus in the asymmetric equilibrium graph?', options=['½ × 8 × ($14 − $6)','8 × $14','½ × 8 × ($30 − $14)','½ × 14 × $8'], correct='½ × 8 × ($14 − $6)', feedback='Producer surplus is the triangle below the $14 equilibrium price and above supply through Q = 8.', skill='producer_surplus_graph_area'),
'P62C-CPS-L-022': dict(q='At the asymmetric competitive equilibrium, what is sellers’ total production cost?', options=['$80','$112','$32','$176'], correct='$80', feedback='Seller revenue is $112 and producer surplus is $32, leaving $80 as total production cost.', skill='producer_surplus_graph_area'),
'P62C-CPS-C-023': dict(q='What is the vertical height of the producer-surplus triangle in the asymmetric equilibrium graph?', options=['$8','$14','$16','$32'], correct='$8', feedback='Equilibrium price is $14 and the supply intercept is $6, so the triangle height is $8.', skill='producer_surplus_graph_area'),
'P62C-CPS-B2-008': dict(q='Checkpoint: What competitive-equilibrium quantity is shown in the asymmetric market graph?', options=['8 units','6 units','12 units','14 units'], correct='8 units', feedback='The dashed vertical guide through E marks the equilibrium quantity at 8 units.', skill='producer_surplus_graph_area'),
'P62C-CPS-C-026': dict(q='What fraction of total surplus is consumer surplus in the asymmetric equilibrium graph?', options=['Two-thirds','One-third','One-half','Three-fourths'], correct='Two-thirds', feedback='Consumer surplus is $64 out of $96 total surplus, which is two-thirds.', skill='total_surplus_graph'),
'P62C-CPS-B2-009': dict(q='Checkpoint: What total revenue is exchanged at the asymmetric competitive equilibrium?', options=['$112','$96','$64','$80'], correct='$112', feedback='Equilibrium price is $14 and quantity is 8, so total expenditure and seller revenue are $112.', skill='total_surplus_graph'),
# CPS compact
'P62C-CPS-H-007': dict(q='Which price-and-quantity pair identifies the competitive equilibrium in the compact market graph?', options=['$14 and 5 units','$18 and 5 units','$14 and 8 units','$24 and 5 units'], correct='$14 and 5 units', feedback='The demand and supply curves cross at E, where price is $14 and quantity is 5.', skill='total_surplus_graph'),
'P62C-CPS-L-027': dict(q='How is the $50 total surplus divided between consumers and producers in the compact equilibrium graph?', options=['$25 each','$30 to consumers and $20 to producers','$20 to consumers and $30 to producers','$50 to consumers and $0 to producers'], correct='$25 each', feedback='The two surplus triangles have equal height and base, so each side receives $25.', skill='total_surplus_graph'),
'P62C-CPS-C-027': dict(q='What is the difference between consumer surplus and producer surplus in the compact equilibrium graph?', options=['$0','$25','$50','$10'], correct='$0', feedback='Consumer surplus and producer surplus are each $25.', skill='total_surplus_graph'),
'P62C-CPS-B2-010': dict(q='Checkpoint: What efficient quantity is identified by the demand-supply intersection in the compact graph?', options=['5 units','8 units','10 units','14 units'], correct='5 units', feedback='The competitive intersection E occurs at Q = 5, where marginal buyer value equals marginal seller cost.', skill='efficient_quantity'),
'P62C-CPS-C-021': dict(q='What is total buyer expenditure at the compact competitive equilibrium?', options=['$70','$25','$50','$95'], correct='$70', feedback='Equilibrium price is $14 and quantity is 5, so expenditure is $70.', skill='consumer_surplus_graph_area'),
'P62C-CPS-C-024': dict(q='What is sellers’ total production cost at the compact competitive equilibrium?', options=['$45','$70','$25','$95'], correct='$45', feedback='Seller revenue is $70 and producer surplus is $25, so total production cost is $45.', skill='producer_surplus_graph_area'),
}

# -----------------------------------------------------------------------------
# Apply graph-dependency stems, then replacement specs.
# -----------------------------------------------------------------------------
changed=set()
for qid,newstem in leak_stems.items():
 if qid not in idx: raise KeyError(qid)
 q=idx[qid][2]; q['q']=newstem; changed.add(qid)

for qid,spec in replacements.items():
 q=idx[qid][2]
 q['q']=spec['q']; q['options']=spec['options']; q['feedback']=spec['feedback']; q['primarySkill']=spec.get('skill',q.get('primarySkill')); q['repairSkill']=q['primarySkill']
 finalize_record(q,spec['correct']); changed.add(qid)

# Metadata mismatch.
q=idx['P62F-PC-H-041'][2]
q['primarySkill']='integrated_competitive_firm_analysis'; q['repairSkill']='integrated_competitive_firm_analysis'
if q.get('sourceOccurrences'): q['sourceOccurrences'][0]['routeKey']=q['primarySkill']
changed.add(q['id'])

# Normalize all CPS graph paths in the audited set.
for r in audit:
 if r['family']=='Consumer & Producer Surplus':
  q=idx[r['id']][2]
  if q.get('image') and '/' not in q['image']:
   q['image']='question-assets/consumer-and-producer-surplus/'+q['image']; changed.add(q['id'])

# -----------------------------------------------------------------------------
# 3) Remove internal asset filenames from student-facing stems in BOTH the 426
#    Micro graph set and the 186 just-built graph set. Use the actual image base.
# -----------------------------------------------------------------------------
def descriptor(q):
 p=(q.get('image') or '').lower()
 if 'international-trade' in p: return 'the displayed trade graph'
 if '/monopoly/' in p: return 'the displayed monopoly graph'
 if 'monopolistic-competition' in p: return 'the displayed monopolistic-competition graph'
 if 'perfect-competition' in p: return 'the displayed competitive-market graph'
 if 'elasticity' in p: return 'the displayed elasticity graph'
 if 'costs-of-production' in p: return 'the displayed cost graph'
 if 'consumer-and-producer-surplus' in p: return 'the displayed surplus graph'
 if 'phillips' in p: return 'the displayed Phillips-curve graph'
 if 'money' in p or 'monetary' in p: return 'the displayed graph'
 if 'aggregate' in p: return 'the displayed graph'
 return 'the displayed graph'

def remove_filename(q):
 img=q.get('image')
 if not img: return False
 base=Path(img).stem
 stem=q.get('q','')
 pat=re.compile(r'(?<![A-Za-z0-9])'+re.escape(base)+r'(?![A-Za-z0-9])',re.I)
 if not pat.search(stem): return False
 desc=descriptor(q)
 s=pat.sub(desc,stem)
 # clean common doubled constructions
 s=re.sub(r'\bUsing the displayed (?:trade |monopoly |monopolistic-competition |competitive-market |elasticity |cost |surplus |Phillips-curve )?graph,\s*',lambda m:m.group(0),s)
 s=s.replace('In the displayed trade graph, is','Using the displayed trade graph, is')
 s=s.replace('using the displayed graph,', 'using the displayed graph,')
 q['q']=s
 return True

for qid in audit_ids|recent_ids:
 q=idx[qid][2]
 if remove_filename(q): changed.add(qid)

# Specifically smooth the three recent SRPC-03 stems after code removal.
recent_filename_stems={
 'PG5-PC-E-019':'How does point B compare with the natural-rate point A in the displayed Phillips-curve graph?',
 'PG5-PC-H-022':'At the right-hand point B, which inflation-unemployment comparison with A is correct?',
 'PG5-PC-M-021':'Points A and B lie on the same short-run Phillips curve. How should the change from A to B be classified?',
}
for qid,stem in recent_filename_stems.items(): idx[qid][2]['q']=stem; changed.add(qid)

# -----------------------------------------------------------------------------
# 4) Rebalance option-length cues. We preserve the keyed answer but ensure it is
#    not uniquely longest in the audited Micro + recent graph batches.
# -----------------------------------------------------------------------------
family_by_id={r['id']:r['family'] for r in audit}
context_suffix={
 'Elasticity':' over the shown interval',
 'Consumer & Producer Surplus':' in the displayed market',
 'Trade':' in the displayed market',
 'Costs':' at the shown output',
 'Perfect Competition':' for the displayed firm',
 'Monopoly':' for the displayed monopolist',
 'Monopolistic Competition':' for the displayed firm',
}

def resolve_correct(q):
 hits=[o for o in q['options'] if ah(o)==q.get('aHash')]
 if len(hits)!=1: raise RuntimeError(f'answer resolution {q["id"]}: {hits}')
 return hits[0]

def rebalance(q,fam=None):
 correct=resolve_correct(q)
 lengths=[len(str(o)) for o in q['options']]
 ci=q['options'].index(correct)
 max_other=max(lengths[i] for i in range(len(lengths)) if i!=ci)
 if lengths[ci] <= max_other: return False
 # Extend the longest distractor with a neutral context phrase, preserving wrongness.
 candidates=[i for i in range(len(lengths)) if i!=ci]
 di=max(candidates,key=lambda i:lengths[i])
 suffix=context_suffix.get(fam,' in the displayed graph')
 opt=str(q['options'][di])
 if opt.endswith('.'):
  opt=opt[:-1]
 q['options'][di]=opt+suffix
 finalize_record(q,correct)
 return True

for qid in audit_ids|recent_ids:
 q=idx[qid][2]
 fam=family_by_id.get(qid)
 if rebalance(q,fam): changed.add(qid)

# Finalize every changed record and refresh hashes after stem/path edits.
for qid in changed:
 q=idx[qid][2]
 finalize_record(q)
 if q.get('sourceOccurrences') and qid=='P62F-PC-H-041': q['sourceOccurrences'][0]['routeKey']=q['primarySkill']

# -----------------------------------------------------------------------------
# 5) Sync phase authoring/question-bank files to the corrected library records.
# -----------------------------------------------------------------------------
lib_records={qid:idx[qid][2] for qid in audit_ids|recent_ids}

def sync_file(path):
 obj=json.loads(path.read_text())
 arr=obj if isinstance(obj,list) else obj.get('questions',[])
 n=0
 for rec in arr:
  qid=rec.get('id')
  if qid in lib_records:
   src=lib_records[qid]
   for key in ['q','options','feedback','image','aHash','primarySkill','repairSkill','sourceHash']:
    if key in src: rec[key]=copy.deepcopy(src[key])
   if rec.get('sourceOccurrences') is not None and src.get('sourceOccurrences') is not None:
    rec['sourceOccurrences']=copy.deepcopy(src['sourceOccurrences'])
   n+=1
 path.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')
 return n

synced={}
for fam,path in SOURCE_FILES.items(): synced[fam]=sync_file(path)

# Corrected CPS bank export (the older project stored these only in the library after cleanup).
cps=[copy.deepcopy(lib_records[r['id']]) for r in audit if r['family']=='Consumer & Producer Surplus']
(ROOT/'phase6_2c_consumer_producer_surplus_graph_questions_audit_corrected.json').write_text(json.dumps(cps,indent=2,ensure_ascii=False)+'\n')

# Sync recent corrected per-phase files if present.
for p in ROOT.glob('phaseGraph*-audit-corrected_questions.json'):
 sync_file(p)
for p in [ROOT/'phaseGraph5-phillips-curve-v1_questions.json']:
 if p.exists(): sync_file(p)

# -----------------------------------------------------------------------------
# 6) Library/registry/manifest metadata.
# -----------------------------------------------------------------------------
# Canonical count across main + adaptive records.
all_ids=[]
for cid,c in lib['concepts'].items():
 for pool,arr in c.get('questions',{}).items(): all_ids.extend(q.get('canonicalId') or q.get('id') for q in arr)
 for key in ['repairQuestions','bridgeQuestions','repairSeedQuestions']:
  all_ids.extend(q.get('canonicalId') or q.get('id') for q in c.get(key,[]))
lib['canonicalQuestionCount']=len(set(all_ids))
lib['sourceCurationPhase']=PHASE
lib['sourceGeneratedAt']=GEN
lib['generatedAt']=GEN
lib['libraryVersion']=lib.get('libraryVersion','')+'-'+PHASE
lib_nohash={k:v for k,v in lib.items() if k!='librarySha256'}
lib['librarySha256']=th(json.dumps(lib_nohash,separators=(',',':'),ensure_ascii=False,sort_keys=True))
save_lib(lib)

reg=json.loads(REG.read_text())
reg['generatedAt']=GEN; reg['curationPhase']=PHASE
reg['curationSummary']='Micro graph audit remediation: graph-dependency rewrites, duplicate-task diversification, answer-length cue cleanup, internal asset-code removal, CPS path normalization, and one Perfect Competition skill metadata correction. Also removes SRPC-03 filename wording from the latest Phillips questions.'
reg['libraryVersion']=lib['libraryVersion']; reg['canonicalQuestionCount']=lib['canonicalQuestionCount']; reg['librarySha256']=lib['librarySha256']
# Graph counts don't change, but refresh touched concept metrics.
for ent in reg.get('concepts',[]):
 cid=ent.get('canonicalConceptId')
 if cid not in lib['concepts']: continue
 c=lib['concepts'][cid]
 main=[q for arr in c.get('questions',{}).values() for q in arr]
 ent['graphCoverage']=sum(bool(q.get('image')) for q in main)
 if cid in ['elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy','costs-of-production','perfect-competition','monopoly','monopolistic-competition','short-run-phillips-curve']:
  ent['coverageFloorVersion']=PHASE
REG.write_text(json.dumps(reg,indent=2,ensure_ascii=False)+'\n')

man=json.loads(MAN.read_text())
man['assetCount']=len(lib.get('assetInventory',[])); man['assets']=lib.get('assetInventory',[]); man['conceptCount']=lib.get('conceptCount',len(lib.get('concepts',{}))); man['canonicalQuestionCount']=lib['canonicalQuestionCount']; man['libraryVersion']=lib['libraryVersion']; man['librarySha256']=lib['librarySha256']; man['generatedAt']=GEN
MAN.write_text(json.dumps(man,indent=2,ensure_ascii=False)+'\n')

# -----------------------------------------------------------------------------
# 7) Validation report data.
# -----------------------------------------------------------------------------
# Rebuild lookup after save is not necessary; object refs are live.
def has_filename(q):
 if not q.get('image'): return False
 base=Path(q['image']).stem
 return bool(re.search(r'(?<![A-Za-z0-9])'+re.escape(base)+r'(?![A-Za-z0-9])',q.get('q',''),re.I))

def length_cue(q,severe=False):
 correct=resolve_correct(q); lens=[len(str(o)) for o in q['options']]; ci=q['options'].index(correct); mo=max(lens[i] for i in range(len(lens)) if i!=ci)
 return lens[ci]>mo and ((lens[ci]-mo)>=10 if severe else True)

# High-overlap pairs among audited micro stems.
def jac(a,b):
 A=set(re.findall(r"[a-z0-9$%]+",a.lower())); B=set(re.findall(r"[a-z0-9$%]+",b.lower()));
 return len(A&B)/len(A|B) if A|B else 0
micro_q=[idx[r['id']][2] for r in audit]
recent_q=[idx[r['id']][2] for r in recent]
near=[]
for i in range(len(micro_q)):
 for j in range(i+1,len(micro_q)):
  s=jac(micro_q[i]['q'],micro_q[j]['q'])
  if s>=0.80: near.append({'idA':micro_q[i]['id'],'idB':micro_q[j]['id'],'score':round(s,3)})

# Answer hash resolution.
ans_fail=[]
for q in micro_q+recent_q:
 try: resolve_correct(q)
 except Exception as e: ans_fail.append({'id':q['id'],'error':str(e)})

# Previously flagged leak set all received explicit stem rewrite or replacement.
leak_flag_ids={r['id'] for r in audit if 'GRAPH DEPENDENCY WEAK / STEM LEAK' in r['flags']}
leak_not_changed=sorted(leak_flag_ids-changed)

# Compare target content changes.
after={qid:idx[qid][2] for qid in before}
changed_target=[]
for qid,b in before.items():
 a=after[qid]
 fields=['q','options','feedback','image','aHash','primarySkill','repairSkill']
 if any(a.get(k)!=b.get(k) for k in fields): changed_target.append(qid)

# Non-target content integrity via compact hashes excluding metadata hash fields.
def content_sig(q):
 return th(json.dumps({k:q.get(k) for k in ['id','q','options','feedback','image','aHash','primarySkill','repairSkill','primaryConceptId','difficulty']},sort_keys=True,ensure_ascii=False))
before_non={}
# cannot reconstruct old lib now; use original build file as source
OLD=Path('/mnt/data/audit_work_2i/phase_graph_audit_corrected_build/faculty-build-composer/data/composer_library.js')
oldlib=json.loads(OLD.read_text().split('=',1)[1].strip().rstrip(';'))
for _,_,q in iter_all(oldlib):
 if q['id'] not in (audit_ids|recent_ids): before_non[q['id']]=content_sig(q)
after_non={q['id']:content_sig(q) for _,_,q in iter_all(lib) if q['id'] not in (audit_ids|recent_ids)}
non_target_changed=sorted([qid for qid,s in before_non.items() if after_non.get(qid)!=s])

results={
 'phase':PHASE,'release':RELEASE,'generatedAt':GEN,
 'microAudited':len(micro_q),'recentAudited':len(recent_q),
 'microTargetQuestionsChanged':len([x for x in changed_target if x in audit_ids]),
 'recentTargetQuestionsChanged':len([x for x in changed_target if x in recent_ids]),
 'previousGraphLeakFlags':len(leak_flag_ids),'previousLeakFlagsNotChanged':leak_not_changed,
 'filenameExposuresMicro':sum(has_filename(q) for q in micro_q),
 'filenameExposuresRecent':sum(has_filename(q) for q in recent_q),
 'uniqueLongestCorrectMicro':sum(length_cue(q) for q in micro_q),
 'severeLengthCueMicro':sum(length_cue(q,True) for q in micro_q),
 'uniqueLongestCorrectRecent':sum(length_cue(q) for q in recent_q),
 'severeLengthCueRecent':sum(length_cue(q,True) for q in recent_q),
 'answerHashFailures':ans_fail,
 'nearDuplicatePairsMicro80':near,
 'cpsNonCanonicalImagePaths':sum('/' not in idx[r['id']][2].get('image','') for r in audit if r['family']=='Consumer & Producer Surplus'),
 'pcSkillFix':{'id':'P62F-PC-H-041','primarySkill':idx['P62F-PC-H-041'][2].get('primarySkill')},
 'canonicalQuestionCount':lib['canonicalQuestionCount'],'assetCount':len(lib.get('assetInventory',[])),
 'nonTargetContentChanges':non_target_changed,
 'sourceFilesSynced':synced,
 'changedTargetIds':sorted(changed_target),
}
(ROOT/'MICRO_GRAPH_AUDIT_REMEDIATION_VALIDATION.json').write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n')

# Export corrected 426-question audit set for review.
export=[]
for r in audit:
 q=idx[r['id']][2]; correct=resolve_correct(q)
 export.append({'family':r['family'],'id':q['id'],'stem':q['q'],'options':q['options'],'correct':correct,'difficulty':q.get('difficulty'),'skill':q.get('primarySkill'),'image':q.get('image'),'feedback':q.get('feedback')})
(ROOT/'MICRO_GRAPH_QUESTIONS_AUDIT_CORRECTED.json').write_text(json.dumps(export,indent=2,ensure_ascii=False)+'\n')

# Export updated recent 186 for review.
rex=[]
for r in recent:
 q=idx[r['id']][2]; rex.append({'id':q['id'],'concept':q.get('primaryConceptId'),'pool':q.get('difficulty'),'asset':Path(q.get('image','')).name,'stem':q['q'],'options':q['options'],'correctAnswer':resolve_correct(q),'feedback':q.get('feedback')})
(ROOT/'TODAYS_GRAPH_QUESTIONS_AUDIT_CORRECTED_V2.json').write_text(json.dumps(rex,indent=2,ensure_ascii=False)+'\n')

print(json.dumps({k:results[k] for k in ['microAudited','recentAudited','microTargetQuestionsChanged','recentTargetQuestionsChanged','filenameExposuresMicro','filenameExposuresRecent','uniqueLongestCorrectMicro','severeLengthCueMicro','uniqueLongestCorrectRecent','severeLengthCueRecent','cpsNonCanonicalImagePaths','canonicalQuestionCount','nonTargetContentChanges']},indent=2))
