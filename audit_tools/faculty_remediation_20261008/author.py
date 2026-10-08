"""Explicit faculty-directed revisions; builds a reviewable patch manifest."""
from pathlib import Path
import json,re,copy,hashlib,unicodedata
D=Path(__file__).resolve().parent;R=D.parents[1]
direct=json.loads((D/'direct.json').read_text(encoding='utf8'));candidates=json.loads((D/'pattern_candidates.json').read_text(encoding='utf8'))
lib=json.loads((D/'baseline/composer_library.js').read_text(encoding='utf8')[len('window.MQ_COMPOSER_LIBRARY='):].strip()[:-1]);qs={}
def walk(x):
 if isinstance(x,dict):
  if 'q'in x and 'options'in x:qs[str(x['id'])]=x
  else:
   for v in x.values():walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
walk(lib)
pop={p['id']:p for p in json.loads((R/'faculty_exports/audits/faculty_validation_20261007/population.json').read_text(encoding='utf8'))}
entries={}
def key(q):return next(i for i,o in enumerate(q['options']) if hashlib.sha256(re.sub(r'\s+',' ',unicodedata.normalize('NFKC',o).strip()).lower().encode()).hexdigest()==q['aHash'])
def edit(id,reason,stem=None,options=None,feedback=None,tier=None,economic=False,source='direct sample',seed=None):
 q=qs[id];e=entries.setdefault(id,{'id':id,'source':source,'patternSeed':seed,'reason':reason,'disposition':'IMPLEMENTED','economicContentChanged':economic,'before':q,'after':copy.deepcopy(q),'key':key(q),'areas':pop[id]['areas']})
 e['reason']=reason;e['economicContentChanged']|=economic
 for field,value in [('q',stem),('options',options),('feedback',feedback),('canonicalDifficulty',tier)]:
  if value is not None:e['after'][field]=value
 return e
def retain(id,reason,status='RETAINED WITH REASON'):
 e=edit(id,reason);e['disposition']=status
def replace(id,old,new,reason):edit(id,reason,stem=qs[id]['q'].replace(old,new))
def choice(id,index,new,reason,**kw):
 opts=copy.deepcopy(entries[id]['after']['options'] if id in entries else qs[id]['options']);opts[index]=new;return edit(id,reason,options=opts,**kw)

edit('P77-MFAIL-BR-039','Replace the hyphenated label and abstract prompt with a direct free-rider question.',stem='People can benefit from a public good without helping to pay for it. How can this affect voluntary contributions?',options=['People will contribute because others can easily be excluded.','People will contribute because one person’s use leaves less for others.','People may contribute less because they can benefit without paying.','People will contribute only when the government sells the good.'])
edit('P62F-PC-LB-035','Turn the opening fragment into a complete scenario.',stem='A firm earns zero economic profit in a market with a binding barrier to entry. What can be concluded about competition in this market?')
edit('P72-OPPC-B2-004','A single best-forgone-alternative comparison warrants Easy; retain the boss role and pool.',tier='easy')
edit('P62G-MON-EL-014','Use faculty wording while specifying profit-maximizing output.',stem='A firm faces demand P=116−2.4Q, marginal cost MC=26+0.25Q, and fixed cost of $900. What economic profit or loss does it earn at its profit-maximizing output?')
edit('42066','Remove legal-remittance wording; retain the tax wedge and before/after comparison needed to read the graph.',stem='The graph shows a corrective tax that reduces output from the unregulated equilibrium to the socially efficient level. How much more do buyers pay, how much less do sellers receive, and how is the tax burden shared?',options=['Buyers pay $2 more and sellers receive $4 less; sellers bear two-thirds of the tax.','Buyers pay $3 more and sellers receive $3 less; sellers bear the entire tax.','Buyers pay $3 more and sellers receive $3 less; the burden is shared equally.','Buyers pay $2 more and sellers receive $4 less; buyers bear two-thirds of the tax.'],feedback='Before the tax, price is $12. At the efficient quantity, buyers pay $15 and sellers receive $9. Each side bears $3 of the $6 tax, so the burden is shared equally.')
edit('P73-MARG-L-026','Use the faculty’s school-class wording; preserve the sequencing information.',stem='A school can offer a class with a gross benefit of 44 points, a delivery cost of 30 points, and a teacher fatigue cost of 9 points. A later class would yield a gross benefit of 50 points but requires this class first. Should the school offer or skip the first class?')
retain('PMC-COP-BR-070','The item is a Bridge question, satisfying the faculty’s explicit condition for unspecified difficulty.','ALREADY RESOLVED')
choice('P52A-MARG-EL-002',0,'Cancel. Its $0.5 million cost is less than the $1 million loss from finishing.','Shorten the key but preserve the cleanup-cost comparison; simply saying benefits are below costs omits a relevant alternative.',feedback='Finishing gives $4 million of future benefits at a $5 million cost, a net loss of $1 million. Cancellation costs $0.5 million, so cancellation is better by $0.5 million. The $8 million already spent is sunk.')
edit('ECON-NL-MEDIUMBOSS-3023','Make all alternatives comparable statements about the constraint on resource productivity.',options=['Transport limits consumption but cannot limit mineral production.','More resources remove the need for skills and sound institutions.','New resources may contribute little without adequate technology and transport.','More resources raise output per worker in the same proportion immediately.'])
edit('PG5-PC-L-018','Reduce reading load while preserving adaptive expectations, timing, slope, and both policy comparisons.',stem='In the graph, expected inflation initially equals inflation at A, but the economy is at B. Next period, expectations adjust to B’s inflation, shifting SRPC vertically by the same amount. Its slope, the natural rate, and supply conditions stay fixed. Compare keeping unemployment at B’s rate with keeping inflation at B’s rate. What happens next period?')
replace('P62D-ITP-L-041',"Demer's tablets market has P = 104 - Qd and P = 24 + Qs.","Demer's tablets market has demand P = 104 - Qd and supply P = 24 + Qs.",'Identify demand and supply explicitly, as requested.')
choice('ECON-MG-HARD-241',0,'Surplus output','Remove redundant “unsold” in the explicitly flagged shared Market Gate record.')
edit('P62F-PC-M-044','Direct attention to the firm panel. Retain the composite image: the firm’s price and ATC are required; removing the image would remove data and cropping is prohibited.',stem='Use only the representative firm’s panel in the graph. At its chosen output, what is the loss per unit?')
edit('P62I-OLI-L-089','Ask directly about the merger’s cost savings and effect on competition; align all alternatives.',stem='A merger reduces duplicated fixed costs but removes the nearest product substitute. What potential benefit and cost should be weighed?',options=['Lower production costs versus higher prices from reduced competition.','Lower production costs versus stronger competition from new substitutes.','Higher production costs versus lower prices from reduced competition.','Higher production costs versus stronger competition from identical products.'],feedback='Combining operations can save fixed costs, while losing a close substitute can let the merged firm raise prices. Neither effect alone establishes the net benefit to consumers or society.')
edit('ECON-NL-MEDIUMBOSS-3017','Remove explanatory imbalance while retaining the conditional catch-up result.',options=['The capital-poor economy must grow faster, regardless of investment or institutions.','The capital-rich economy must grow faster because its output is already higher.','Equal worker counts require equal output per worker despite differences in capital.','The capital-poor economy may catch up if investment and institutions support growth.'])
replace('P62B-ELAS-H-039','the common starting point','the black point where the two supply curves intersect','Identify the starting point by location and shape without supplying the numerical calculation.')
edit('ECON-EC-LEGENDARYBOSS-20004','Shorten the key and give every option a comparable claim about the two income sources.',options=['No. Real savings returns rise and real wages fall; their amounts determine the combined effect.','Yes. A positive real savings return ensures that total purchasing power rises despite falling real wages.','No. Both real savings returns and real wages fall whenever inflation is positive.','Yes. Add the 8% interest rate and 4% wage increase, then subtract 6% inflation.'])
retain('LG-Q-9107','Positive faculty feedback; retain the effective distractor and multi-step question unchanged.')
replace('LG-Q-9029','Which diagnosis uses both curve evidence and the vertical-axis scale?',"Is the analyst’s conclusion correct?",'Use the faculty’s direct question; all curve and inverse-price-scale evidence remains available.')
for id in ['42816','42850','42812','42801']:
 edit(id,'Remove a standalone administrative case/proposal label; it is not used to compare alternatives.',stem=re.sub(r'^(?:Labor-market case [A-Z]|Redistribution proposal [A-Z]):\s*','',qs[id]['q']))
edit('P62H-MCMP-C-010','Replace the MR=MC instruction with the requested profit-maximizing task.',stem='A firm faces demand P=100−2Q and marginal cost MC=20+0.4Q. If it chooses the profit-maximizing output, what price does it charge?')
replace('P62E-COP-H-037',' at Point C','', 'Remove the point label that identifies the fixed-cost curve; keep Q=120 and the original image.')
edit('42145','Define the emissions cap and present parallel policy comparisons.',stem='Two pollution-permit systems impose the same cap, meaning the same total limit on emissions. One gives firms equal numbers of permits; the other auctions them. Permits can be traded in both systems. Which comparison separates the cost of cutting emissions from who receives the permits’ value?',options=['Trading changes the emissions limit; the initial allocation leaves permit income unchanged.','Trading can lower cleanup costs in both; giving away or auctioning permits distributes their value differently.','Auctioning alone guarantees lower cleanup costs; trading cannot affect those costs.','Equal permit allocations guarantee equal cleanup costs; auctioning makes permit revenue disappear.'],feedback='With the same cap and functioning permit trading, firms can trade toward the least-cost allocation of emissions reductions. Giving permits away transfers their value to recipients; auctioning them raises revenue for the seller. Those distributional effects differ from the cost of achieving the cap.',economic=True)
edit('ECON-SP-LEGENDARYBOSS-9102','Remove the supplied post-shock curve label so students identify the adverse supply shift; preserve the initial state and policy comparison.',stem='The economy initially lies where AD1 and AS2 intersect. An adverse supply shock occurs and persists. Compare leaving demand at AD1 with expanding it to AD2. Which option correctly identifies the resulting equilibria and the expansion’s effect relative to output and prices before the shock?')
choice('42546',2,'Demand for complementary medical equipment can fall.','Keep the requested effect in the alternative and explain the marginal-product mechanism in feedback.',feedback='Nurses and medical equipment work together. A shortage of nurses can lower the marginal product of equipment, reducing hospitals’ demand for it.')
edit('P62E-COP-EL-009','Make plausible alternatives start from the same correctly calculated initial ATC, requiring both calculations.',options=['ATC falls from $30 to $28','ATC remains $30 at both outputs','ATC falls from $30 to $29','ATC rises from $30 to $33'],feedback='ATC equals AFC plus AVC. At Q=50 it is $6+$24=$30; at Q=60 it is $5+$23=$28. Both fixed cost per unit and variable cost per unit fall by $1.')
replace('P62C-CPS-H-020','At price $10','At a price of $10','Apply the faculty’s preferred wording.')
edit('P74-INC-L-013','Medium fits comparing two margins of incentive response; Hard overstates the required reasoning.',tier='medium')
edit('ECON-MG-MEDIUMBOSS-3003','Replace technical fixed-price-plan wording with ordinary demand language.',options=['Movement down the same demand curve; a lower price raises quantity demanded.','A rightward demand shift; selling more always means buyers want more at every price.','Movement up the same demand curve; a lower price reduces quantity demanded.','A leftward demand shift; unchanged buying intentions mean demand has fallen.'],feedback='The price cut raises quantity demanded along the same demand curve. Because buyers want the same quantities at each fixed price, the survey provides no evidence that demand shifted.')
retain('ECON-SP-READ-AD-SHIFT-5087','The item is a Repair question, satisfying the faculty’s condition for unspecified difficulty.','ALREADY RESOLVED')
retain('ECON-NL-HARD-236','Final faculty decision: retain Medium. The separate derived adjudication changes only its validation assessment to PASS.','ALREADY RESOLVED')
for id,tier,reason in [('P62E-COP-B2-025','easy','A single addition of AFC and AVC; retain boss membership.'),('P62H-MCMP-M-025','easy','A single subtraction using supplied output levels.'),('PM2B2-INDEX-M-003','easy','A direct comparison of a 2% nominal increase with 5% inflation.'),('P62E-COP-M-034','easy','Read the labeled MC–AVC intersection on the graph.'),('PG4-MM-EL-003','medium','Identify a money-supply shift and movement along unchanged demand; preserve Elite role and stored pool.'),('PM2B3-POL-EB-002','medium','Compare transition costs with the same future output; retain boss role.'),('PMA-ITP-H-003','elite','Faculty explicitly requests Elite for solving initial/final demand and supply and linking imports to consumer surplus.'),('PG3-MEQ-M-008','easy','Identify the intersection of two specified curves.')]:edit(id,reason,tier=tier)
edit('P77-MVM-MEDIUMB-026','Use household and economy-wide language in parallel alternatives.',options=['Household buying decisions and conditions in the whole economy.','Only household decisions, because the recession has no wider effects.','Only the whole economy, because individual buying decisions do not matter.','Neither household decisions nor conditions in the whole economy.'])
edit('P73-MARG-M-010','Use the faculty’s direct proceed/not-proceed question and parallel yes/no alternatives.',stem='A sixth quality inspection lowers expected defect losses by $260 and costs $210 in labor. Should the firm proceed?',options=['Yes. The $260 benefit exceeds the $210 cost.','No. Any positive labor cost makes an inspection unprofitable.','Yes, but only if it eliminates all defect losses.','No, unless it also lowers average inspection cost.'])
edit('P62F-PC-LB-003','Use “a price of” and comparable two-period alternatives so length does not identify the correct proposal.',stem=qs['P62F-PC-LB-003']['q'].replace('faces price $34','faces a price of $34'),options=['Produce 4 now: lose $20 instead of $86; exit before the fixed cost recurs if conditions persist.','Shut down now: lose $0 instead of $20; remain next period because shutdown avoids all fixed costs.','Produce 4 now: earn $66 of economic profit; remain next period because contribution equals profit.','Produce 7 now: higher revenue eliminates the loss; remain next period because more output always raises profit.'])
edit('42370','Use the instructor’s direct employment correction question.',stem='Refer to the graph. A student says the wage floor creates an employment level of 6,000 workers. Which statement corrects this reasoning?')
edit('P52A-AS-B2-001','Replace the choppy diagnosis prompt with a direct shock and policy question.',stem='An economy initially produces 40 units. A single shock lowers output and raises the price level, while aggregate demand and long-run aggregate supply remain unchanged. What caused the change, and what would a policy that reduces aggregate demand do?',options=['Short-run supply decreased; lower demand reduces price pressure but further lowers output.','Demand decreased; lower demand then raises both output and the price level.','Short-run supply increased; lower demand then raises output and lowers the price level.','Long-run supply increased; lower demand then restores the original output without changing prices.'])
for id in ['P62H-MCMP-B2-030','P62H-MCMP-B2-021']:
 replace(id,'A long-run firm','A monopolistically competitive firm in long-run equilibrium','Name the market structure and equilibrium setting explicitly.')
edit('P62C-CPS-L-074','Clarify how purchasing ability affects measured willingness to pay; a zero-surplus question would change the intended construct.',stem='A buyer would value an extra unit at $50 but cannot afford the market price. Why can willingness to pay measured from purchasing choices understate what the buyer would value if they had more income?',options=['The buyer receives $50 of consumer surplus without purchasing.','Measured willingness to pay depends on both preferences and ability to pay.','The buyer’s limited income makes the market price fall to zero.','The seller must accept the buyer’s need instead of payment.'],feedback='Purchasing choices depend on preferences and the budget constraint. A buyer’s inability to afford a unit does not show that the unit has no value to them. This limits the use of measured willingness to pay as a measure of need.')
choice('P62I-OLI-L-085',0,'Weigh innovation benefits against the costs of market power.','Shorten the correct conclusion and leave the evidentiary explanation in feedback.')
edit('P62G-MON-L-065','State the loss first and the constant-marginal-cost assumption needed for zero contribution.',stem='National Gridline has constant marginal cost of $15. When regulated to charge $15, it sells 70 units and incurs an economic loss of $1,200. Why does it incur this loss?',feedback='At P=MC with constant marginal cost, revenue exactly covers variable cost. It leaves nothing to cover fixed cost, so the $1,200 loss equals fixed cost.',economic=True)
replace('42297','What problem is indicated?','What is the current issue?','Use the faculty’s direct wording.')
edit('P62B-ELAS-C-026','Explicit follow-up faculty authorization: add the elasticity classification and preserve Hard. This is an approved content enhancement, not a silent tier justification.',stem='A seller lowers price from $12 to $10, and quantity demanded rises from 1,000 to 1,280 units. Calculate total revenue at each price and classify demand over this price range as elastic, unit elastic, or inelastic.',options=['Revenue rises from $12,000 to $12,800; demand is inelastic.','Revenue rises from $12,000 to $12,800; demand is elastic.','Revenue falls from $12,800 to $12,000; demand is elastic.','Revenue is $12,000 at both prices; demand is unit elastic.'],feedback='Total revenue is $12×1,000=$12,000 initially and $10×1,280=$12,800 afterward. Revenue rises when price falls, so demand is elastic over this range. The midpoint elasticity is (280/1,140)/(2/11), about 1.35 in absolute value.',tier='hard',economic=True)
edit('P62H-MCMP-B3-053','Restore the specialized-program facts from companion canonical item P62H-MCMP-B3-052 and state the monopolistically competitive setting. The question now stands alone.',stem='In a monopolistically competitive fitness market, Lotus Fitness introduces a specialized program that better matches some customers’ needs. What can this added variety mean for customers and market efficiency?',options=['Customers gain variety only if every gym charges marginal cost.','Customers gain variety only if gyms earn permanent economic profit.','Customers can value the variety even while markups and excess capacity remain.','Customers gain variety only if new gyms are prevented from entering.'],feedback='The program better matches some customers’ preferences, so differentiation can create value. That benefit can coexist with prices above marginal cost and output below the level that minimizes ATC. The case does not establish that the benefit outweighs every cost.',economic=True)
replace('P62F-PC-EL-007','faces price $30','faces a price of $30','Apply the faculty’s preferred wording.')
edit('PG1-DMD-H-003','Use the instructor’s direct question about the distance between curves.',stem='Refer to the tea graph. What can be concluded from the horizontal distance between D0 and D1 at the same prices?')
choice('P62B-ELAS-R-006',3,'Slope and elasticity are not identical.','Apply the faculty’s shorter answer; retain the explanation in feedback.')
edit('42356','Use readable plain-text curve labels, with the labor context already explicit; no unsupported HTML is introduced.',stem='Construction labor supply shifts left from SL0 to SL1, with DL unchanged. What is the new equilibrium?',feedback='The solid SL1 curve intersects demand at 2,000 construction workers and $25 per hour.')
edit('ECON-NL-LEGENDARYBOSS-9119','Explicitly introduce the two policy proposals before asking about the limitation.',stem='A plant buys new machines but lacks workers trained to operate them. One proposal subsidizes machines alone; another subsidizes machines and worker training. Why might the first proposal produce a smaller productivity gain?')
edit('P62F-PC-EL-030','Distinguish possible price-taking from efficient informed purchases in ordinary language. Buyer price knowledge is separated from inability to judge benefits; the original conclusion remains qualified rather than guaranteed.',stem='Many small firms sell an identical product. Buyers know the prices but have difficulty judging the product’s benefits. Does this information problem necessarily stop firms from taking the market price, and can we still be sure buyers make efficient choices?',options=['Poor information rules out price-taking, so firms must each set their own market price.','Firms may still take the market price, but buyers can make inefficient choices.','Firms take the market price, and identical products guarantee efficient choices despite poor information.','Firms may take the market price, and entry alone guarantees efficient choices despite poor information.'],feedback='Small firms can face a given market price even when buyers misjudge the benefits of the product. Price-taking alone does not ensure efficient purchases: the usual efficiency conclusion also depends on buyers having relevant information. Identical products or entry do not by themselves correct the buyers’ mistakes.',economic=True)
edit('P52A-CPI-LB-001','Use parallel two-basket results; keep at least one developed, credible percentage-point distractor.',options=['It gains about 3% against both baskets; a nominal payment increase is also a real increase.','It loses about 2% against the index basket but gains about 1% against the personal basket; the index rose five percentage points.','It loses about 1% against the index basket but gains about 1% against the personal basket; their price increases differ.','It gains about 1% against the index basket but loses about 1% against the personal basket; reverse the price comparisons.'])
replace('P62G-MON-H-029','one-price monopoly','single-price monopoly','Use conventional single-price terminology.')
edit('P62I-OLI-E-029','Specify the consumer harm at issue.',stem='Why is a high market concentration alone insufficient to show that firms are harming consumers through higher prices or lower output?')
replace('P62E-COP-LB-031','Which recommendation follows from the incremental comparison?','Should the firm adopt the new technology?','Apply the faculty’s direct decision question.')

# Shared numerical template: preserve every amount and answer position, but make
# every option report tariff, revenue, producer transfer and deadweight loss.
def tariff(id,source='direct sample'):
 q=qs[id];correct=q['options'][key(q)];m=re.search(r'tariff is \$(\d+(?:\.\d+)?); \$(\d+(?:\.\d+)?) is government revenue and \$(\d+(?:\.\d+)?) is a gain in producer surplus, leaving \$(\d+(?:\.\d+)?)',correct);assert m,id
 t,rev,ps,dwl=map(float,m.groups());loss=float(re.search(r'entire \$(\d+(?:\.\d+)?) loss',q['q']).group(1));assert abs(rev+ps+dwl-loss)<1e-8
 values=[(t,0,0,loss),(t,rev,ps,dwl),(2*t,2*rev,ps,loss-ps),(t,rev,dwl,ps)]
 k=key(q);good=values.pop(1);values.insert(k,good)
 f=lambda x:f'{x:g}'
 options=[f'Tariff ${f(a)}; revenue ${f(b)}; producer gain ${f(c)}; deadweight loss ${f(d)}.' for a,b,c,d in values]
 return edit(id,'Replace the unique explanatory key with four parallel numerical decompositions; independently verify the tariff, transfers and welfare loss.',options=options,source=source,seed='P62D-ITP-L-074; P62D-ITP-L-062')
for id in ['P62D-ITP-L-074','P62D-ITP-L-062']:tariff(id)

# Repeated-game family: independently reconstruct timing and infinite sums.
def repeated(id,source='direct sample'):
 q=qs[id];text=q['q'];factor=float(re.search(r'multiplying by (0\.\d+)',text).group(1))
 coop=float(re.search(r'[Cc]ooperation (?:pays|yields) (\d+)',text).group(1))
 cheat=float(re.search(r'(?:cheating pays|one-time deviation yields) (\d+)',text).group(1))
 punish=float(re.search(r'(?:punishment payoff|punishment yields|and) (\d+) (?:each future period|thereafter)',text).group(1)) if 'punishment payoff of' not in text else float(re.search(r'punishment payoff of (\d+)',text).group(1))
 pv=coop/(1-factor);dv=cheat+factor*punish/(1-factor);better='Cooperate' if pv>dv else 'Cheat' if dv>pv else 'Either strategy'
 ending='Which strategy gives the larger present value?'
 if 'By how much' in text:ending='By how much does the cooperation path exceed the cheating path?'
 if 'absolute difference' in text:ending='Which strategy gives the larger present value, and what is the absolute difference?'
 if '-B2-' in id:ending='Under these payoffs, is continuing cooperation preferable to cheating?'
 correct=q['options'][key(q)]
 if 'PV difference' in correct or 'By how much' in text:
  amount=float(re.search(r'\$(\d+(?:\.\d+)?)',correct).group(1));assert abs(amount-abs(pv-dv))<0.011,(id,amount,pv-dv)
 else:assert ('cooperat' in correct.lower())==(pv>dv),(id,correct,pv,dv)
 stem=f'Assume the firms interact indefinitely. Cooperating pays {coop:g} each period, starting now. Cheating pays {cheat:g} now, followed by {punish:g} every period forever starting next period. Multiply each future payoff by {factor:.2f} for every period ahead. {ending}'
 feedback=f'Cooperation: {coop:g}/(1−{factor:.2f}) = {pv:.2f}. Cheating: {cheat:g} + {factor:.2f}×{punish:g}/(1−{factor:.2f}) = {dv:.2f}. '+('The present values are equal.' if abs(pv-dv)<1e-9 else f'{better} to receive the larger present value; the difference is {abs(pv-dv):.2f}.')+' Current payoffs are not discounted; punishment begins next period and continues indefinitely.'
 return edit(id,'State the indefinite horizon, current deviation and next-period permanent punishment; reconstruct both discounted sums. No ten-round assumption is used.',stem=stem,feedback=feedback,source=source,seed='P62I-OLI-EL-022; P62I-OLI-L-052')
for id in ['P62I-OLI-EL-022','P62I-OLI-L-052']:repeated(id)

assert set(r['id'] for r in direct)==set(entries),set(r['id'] for r in direct)-set(entries)
for r in direct:
 e=entries[r['id']];e['facultyResponse']=r['response'];e['sampleOrder']=r['order']
(D/'phase_a.json').write_text(json.dumps(list(entries.values()),ensure_ascii=False,indent=2))
print('Phase A entries',len(entries))

# Targeted extension: every rule below is seeded by a reviewed faculty item.
for c in candidates:
 id=c['id'];q=qs[id];p=c['patterns'];seed=None
 if 'case-label' in p:
  edit(id,'Remove a standalone administrative label; no later part refers to it.',stem=re.sub(r'^(?:Labor-market case [A-Z]|Redistribution proposal [A-Z]):\s*','',q['q']),source='cross-bank pattern',seed='42816; 42850; 42812; 42801')
 if 'labor-notation' in p:
  compact=lambda s:re.sub(r'\b([SD]) L(\d*)\b',r'\1L\2',s)
  edit(id,'Use compact plain-text labor-curve labels consistently in prose; preserve original graph and accessibility metadata.',stem=compact(q['q']),options=[compact(o) for o in q['options']],feedback=compact(q.get('feedback','')),source='cross-bank pattern',seed='42356')
 if 'long-run-firm' in p:
  edit(id,'State the monopolistically competitive market and long-run equilibrium explicitly.',stem=re.sub(r'\b([Aa]) long-run firm\b',lambda m:m[1]+' monopolistically competitive firm in long-run equilibrium',q['q']),source='cross-bank pattern',seed='P62H-MCMP-B2-030; P62H-MCMP-B2-021')
 if 'internal-task' in p:
  edit(id,'Use the faculty’s direct technology-adoption question for the identical decision structure.',stem=q['q'].replace('Which recommendation follows from the incremental comparison?','Should the firm adopt the new technology?'),source='cross-bank pattern',seed='P62E-COP-LB-031')
 if 'graph-initial' in p:
  edit(id,'Identify the shared starting intersection on the same reviewed graph without providing the calculation.',stem=q['q'].replace('the common starting point','the black point where the two supply curves intersect'),source='cross-bank pattern',seed='P62B-ELAS-H-039')
 if 'long-key' in p:
  if id.startswith('P62D-ITP-'):tariff(id,'cross-bank pattern')
  elif id=='ECON-MG-FINALBOSS-4019':choice(id,0,'Lower rent can bring longer waits and inefficient allocation.','Move explanatory detail into existing feedback; preserve the shared Market Gate allocation conclusion.',source='cross-bank pattern',seed='P62I-OLI-L-085; P52A-MARG-EL-002')
  elif id=='42823':choice(id,3,'Measured status changes from below to above; well-being requires a separate assessment.','Report the classification and retain its qualification without a uniquely long explanation.',source='cross-bank pattern',seed='ECON-EC-LEGENDARYBOSS-20004')
  elif id=='42872':choice(id,0,'The cliff disappears, but earnings face a 20% phaseout over a wider range.','Keep both policy effects; detailed marginal-incentive explanation stays in feedback.',source='cross-bank pattern',seed='ECON-EC-LEGENDARYBOSS-20004')
  elif id=='42151':choice(id,3,'Insulation yields a $200 social gain before coordination; the $250 coordination cost makes the bargain unprofitable.','Report the welfare and coordination results in the choice; retain mechanism in feedback.',source='cross-bank pattern',seed='P52A-MARG-EL-002')
 if 'repeated-horizon' in p:
  if id.startswith('P62I-OLI-') and 'multiplying by' in q['q'] and id!='P62I-OLI-C-028':repeated(id,'cross-bank pattern')
  elif id not in entries:
   retain(id,'The question already supplies the relevant present values or finite dates, or asks only about a change in discounting. No missing horizon is needed to answer it.');entries[id].update(source='cross-bank pattern',patternSeed='P62I-OLI-EL-022; P62I-OLI-L-052')

# Exact Macro siblings: preserve each item's original option order by mapping
# identical original alternatives to the faculty-approved parallel revision.
for seed in ['ECON-NL-MEDIUMBOSS-3017','ECON-NL-MEDIUMBOSS-3023']:
 mapping=dict(zip(qs[seed]['options'],entries[seed]['after']['options']))
 for id,q in qs.items():
  if id not in entries and set(q['options'])==set(mapping) and 'macro' in pop[id]['areas']:
   edit(id,'Apply the same short, parallel alternatives to an exact Macro sibling; preserve its numerical scenario and answer position.',options=[mapping[o] for o in q['options']],source='cross-bank pattern',seed=seed)

contexts={39:'Grove Coffee publishes verified prices and wait times in its advertisements.',42:'Halo Cosmetics advertises its brand as a status symbol without providing new performance information.',45:'Indigo Dental advertises a long-term warranty that would be costly to honor if its work were poor.',48:'Jade Delivery pays the same annual sponsorship fee regardless of its delivery volume.',51:'Kestrel Meals pays a referral platform $2 for each order it receives.',54:'Lotus Fitness introduces a specialized program that better matches some customers’ needs.'}
replacements={'Compare added consumer value or information with resource cost and market-power effects':'Weigh customer benefits against resource costs and effects of market power.','All differentiation is wasteful':'Count differentiated products as waste, regardless of what customers value.','All advertising raises total surplus':'Count every advertisement as a net benefit, regardless of its cost.','Zero economic profit guarantees efficiency':'Treat zero economic profit as proof that the market is efficient.'}
for n,context in contexts.items():
 id=f'P62H-MCMP-B3-{n:03}';q=qs[id]
 edit(id,'Restore the named scenario from its companion canonical item and use parallel welfare comparisons; students no longer need an earlier question.',stem=context+' How should its net benefit to society be assessed?',options=[replacements[o] for o in q['options']],feedback='Consider any value or useful information customers gain, the resources used, and any effects of market power. The stated facts alone do not establish the net benefit. Differentiation, advertising, or zero economic profit does not settle that comparison.',source='cross-bank pattern',seed='P62H-MCMP-B3-053',economic=True)

choice('42853',1,'It may violate rights to legitimately acquired property.','Remove the administrative label and shorten the keyed rights-based objection; existing feedback preserves the process-based explanation.',source='cross-bank pattern',seed='42850; ECON-NL-MEDIUMBOSS-3023')
for id in ['P72-OPPC-B2-004','P62E-COP-B2-025','PM2B3-POL-EB-002']:
 entries[id]['after']['checkpointPool']=qs[id]['sourcePool']
 entries[id]['reason']+=' Record the existing checkpoint stage explicitly so recalibrating cognitive difficulty does not reroute the boss question.'
assert all(c['id'] in entries for c in candidates)
assert all(e['after']!=e['before'] for e in entries.values() if e['disposition']=='IMPLEMENTED')
original_responses=json.loads((R/'faculty_exports/audits/faculty_validation_20261007/faculty_responses/batch3_20261008/faculty-validation-responses.original.json').read_text(encoding='utf8'))['responses']
for id,e in entries.items():
 if id in original_responses:e['facultyResponse']=original_responses[id]
(D/'manifest.json').write_text(json.dumps(list(entries.values()),ensure_ascii=False,indent=2))
print('Total reviewed entries',len(entries))
