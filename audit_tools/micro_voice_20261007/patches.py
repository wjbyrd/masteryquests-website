"""Reviewed editorial decisions for the fixed faculty-authorized subset."""
import json,pathlib,re,copy
D=pathlib.Path(__file__).resolve().parent
rows=json.loads((D/'authority.json').read_text(encoding='utf-8')); by={r['id']:r for r in rows}; patches={}
def edit(id,**fields):
 r=by[id]; assert r['areas']==['micro'] and not r['marketGateDerived'],id
 patches.setdefault(id,{}).update(fields)
def key(id,text):
 opts=copy.deepcopy(by[id]['q']['options']);opts[by[id]['key']]=text;edit(id,options=opts)
def opts(id,*texts):assert len(texts)==4;edit(id,options=list(texts))

# The illustrative drafts below were reviewed against every complete source item.
# Explicit overrides further below resolve prompts that would otherwise reveal the key.
for r in rows:
 if r['reviewStatus']!='Confirmed editorial candidate' or r['areas']!=['micro']:continue
 f=r['finding'];id=r['id']
 if f['suggestedStem']:edit(id,q=f['suggestedStem'])
 if f['suggestedKey']:key(id,f['suggestedKey'])

for id in ['P62B-ELAS-EL-'+n for n in ['001','002','003','005','006','007','008','009','010']]:
 s=patches[id]['q'];m=re.search(r'price moves from \$(\d+(?:\.\d+)?) to \$(\d+(?:\.\d+)?)',s)
 s=s.replace('price moves','price rises' if float(m[2])>float(m[1]) else 'price falls')
 s=s.replace('quantity demanded moves','quantity demanded falls' if id!='P62B-ELAS-EL-008' else 'quantity demanded rises')
 edit(id,q=s)

edit('PMC-COP-BR-147',q='How does the choice of plant size differ between short-run and long-run average-cost curves?')
edit('PM5-PC-BR-013',q='For a price-taking firm, how do average revenue and marginal revenue compare with the market price?')
edit('P62F-PC-EL-017',q='A competitive firm is producing where P = MC, but MC is falling. What does this imply about its output choice?')
edit('P62C-CPS-H-024',q=by['P62C-CPS-H-024']['q']['q'])
key('P62C-CPS-H-030','Willingness to pay reflects purchasing power as well as preferences.')
key('P62C-CPS-R-001','Willingness to pay is the maximum the buyer would pay.')
key('P62E-COP-BR-017','Marginal cost determines the minimum acceptable price.')
key('P62H-MCMP-R-020','Competing through quality, service, location and branding.')
key('P62G-MON-H-024','Prices or cost-control incentives may be poorly chosen.')
key('P62G-MON-R-016','Cost recovery, but P > MC and inefficiently low output.')
edit('P62G-MON-R-019',q='In the standard monopoly model, does perfect first-degree price discrimination eliminate the deadweight loss from single-price pricing?')
key('P62G-MON-R-019','Yes, because output reaches the efficient level.')
key('PM6-MON-BR-068','Cost recovery, but potentially P > MC and too little output.')
key('PMC-COP-BR-149','Higher productivity can lower cost per unit.')
key('PM6-MON-M-060','The cost advantage of a single firm may weaken.')
key('PM6-MON-R-044','Additional output could create gains because willingness to pay exceeds MC.')
key('P62F-PC-H-023','Price and profit rise; entry restores their original long-run levels.')
key('PM5-PC-R-068','Profit falls, but MC, AVC and short-run supply stay unchanged.')

# Comparable numerical fields in every alternative; original key positions retained.
opts('P62C-CPS-B3-011',
 'Buyer: $7 to $27; seller: $27 to $7; gross total: $34; net total after administration: $31.',
 'Buyer: $7 to $27; seller: $27 to $27; gross total: $54; net total after administration: $51.',
 'Buyer: $7 to $7; seller: $27 to $7; gross total: $14; net total after administration: $11.',
 'Buyer: $7 to $27; seller: $27 to $27; gross total: $54; net total after administration: $54.')
edit('P62C-CPS-LB-030',q=by['P62C-CPS-LB-030']['q']['q'].replace('Which assessment is correct?','Which comparison correctly gives the buyer/seller split before administration, gross total surplus, and net total after administration?'))
opts('P62C-CPS-LB-030',
 'Buyer/seller: $17/$38; gross total: $55; net total: $52.',
 'Buyer/seller: $2/$23; gross total: $25; net total: $22.',
 'Buyer/seller: $17/$23; gross total: $40; net total: $40.',
 'Buyer/seller: $17/$23; gross total: $40; net total: $37.')
edit('P62B-ELAS-B3-006',q='Demand is Q = 120 − 3P. Compare point elasticity and the effect of a small price rise on total revenue at P = $30 and P = $10. Which pair is correct?')
opts('P62B-ELAS-B3-006',
 'At $30: |Ed| = 3, revenue falls; at $10: |Ed| = 3, revenue falls.',
 'At $30: |Ed| = 3, revenue falls; at $10: |Ed| = 1/3, revenue rises.',
 'At $30: |Ed| = 1/3, revenue rises; at $10: |Ed| = 3, revenue falls.',
 'At $30: |Ed| = 1, revenue has no first-order change; at $10: |Ed| = 1, revenue has no first-order change.')
edit('P62B-ELAS-EL-016',feedback='Total revenue changes from $15 × 2,000 = $30,000 to $17 × 1,700 = $28,900. Revenue falls when price rises, indicating elastic demand over this interval.')
opts('P62B-ELAS-EL-016','Revenue rises; demand is inelastic.','Revenue falls; demand is elastic.','Revenue is unchanged; demand is unit elastic.','Revenue falls; demand is inelastic.')
opts('P62C-CPS-H-018','Consumer surplus rises to $50; producer surplus falls to $0; total surplus falls to $50.','Consumer surplus stays $32; producer surplus stays $32; total surplus stays $64.','Consumer surplus falls to $25; producer surplus falls to $25; total surplus falls to $50.','Consumer surplus rises to $50; producer surplus rises to $50; total surplus rises to $100.')
opts('P77-MFAIL-FINALB-027','Full policy: +$85; simpler policy: +$60; choose the full policy.','Full policy: +$60; simpler policy: +$60; either policy is equally good.','Full policy: −$15; simpler policy: +$60; choose the simpler policy.','Full policy: −$15; simpler policy: −$20; choose neither policy.')
opts('P62F-PC-LB-030','Per-unit tax: MC becomes $24; license payment: MC becomes $24.','Per-unit tax: MC stays $18; license payment: MC becomes $24.','Per-unit tax: MC stays $18; license payment: MC stays $18.','Per-unit tax: MC becomes $24; license payment: MC stays $18.')
edit('P62F-PC-LB-030',q=by['P62F-PC-LB-030']['q']['q'].replace('Which comparison targets the external-cost distortion?','At that output, how does each policy change the marginal cost faced by the firm?'))
opts('PM8-OLI-M-060','30² < 18² + 12².','30² > 18² + 12².','30² = 18² + 12².','30² = 2 × (18² + 12²).')
edit('PM8-OLI-M-060',feedback='The merged share is 18% + 12% = 30%. Its squared share is 900, compared with 324 + 144 = 468 before the merger. HHI rises by 432 = 2 × 18 × 12, with other shares unchanged.')
for id in ['43034','43038','43042']:
 key(id,'Majority preferences form a cycle: A > B > C > A.')
 edit(id,feedback='Two-thirds prefer A to B, two-thirds prefer B to C, and two-thirds prefer C to A. This creates a majority cycle even though each voter has a transitive ranking.')
opts('P62C-CPS-LB-036','Demand: marginal cost; supply: marginal willingness to pay; total surplus: cost minus value.','Demand: marginal willingness to pay; supply: marginal cost; total surplus: value minus cost.','Demand: total consumer surplus; supply: total producer surplus; total surplus: price times quantity.','Demand: marginal willingness to pay; supply: marginal cost; total surplus: consumer surplus minus producer surplus.')
edit('P62C-CPS-LB-036',feedback='Demand represents marginal willingness to pay and supply represents marginal cost. Total surplus sums value minus cost over traded units; it equals consumer surplus plus producer surplus.')
key('P62C-CPS-H-014','It trades units with value at least cost, excluding those with cost above value.')
opts('PMC-COP-BR-033','Short run: some inputs fixed; long run: all inputs variable.','Short run: all inputs variable; long run: all inputs fixed.','Short run: all inputs variable; long run: all inputs variable.','Short run: all inputs fixed; long run: all inputs fixed.')
opts('PMC-COP-BR-034','Above the average: average falls; below the average: average rises.','Above the average: average rises; below the average: average rises.','Above the average: average stays unchanged; below the average: average stays unchanged.','Above the average: average rises; below the average: average falls.')
opts('PMC-COP-BR-035','Fixed inputs: variable cost; variable inputs: fixed cost.','Fixed inputs: marginal revenue; variable inputs: accounting profit.','Fixed inputs: fixed cost; variable inputs: variable cost.','Fixed inputs: variable cost; variable inputs: variable cost.')
opts('PMC-COP-BR-047','Revenue.','Marginal revenue.','Fixed cost.','Variable cost.')
opts('PMC-COP-BR-147','SRATC allows a plant choice; LRAC holds plant size fixed.','SRATC and LRAC both hold plant size fixed.','SRATC holds plant size fixed; LRAC allows the least-cost plant choice.','SRATC and LRAC both allow the least-cost plant choice.')
opts('PMC-COP-BR-148','Economies of scale: short-run effect; falling AFC: long-run effect.','Economies of scale: all inputs vary; falling AFC: fixed cost is spread over more units.','Economies of scale: fixed cost is spread over more units; falling AFC: all inputs vary.','Economies of scale: requires a fixed input; falling AFC: requires a larger plant.')
opts('PMC-COP-R-117','Fixed: unchanged with current output; sunk: unrecoverable.','Fixed: unrecoverable; sunk: varies with current output.','Fixed: always implicit; sunk: always explicit.','Fixed: already paid forever; sunk: recoverable.')
edit('42142',q='With a fixed emissions cap, competitive permit trading and no transaction costs, what changes if permits are given away instead of auctioned?')
opts('42142','The emissions cap rises, allowing more pollution.','Total emissions fall even though the cap is unchanged.','Who receives the permit value changes; least-cost abatement need not change.','Who receives the permit value and the least-cost outcome must both stay unchanged.')
opts('P77-MFAIL-FINALB-025','Drought: scarcity; unpriced waste: external cost; target the waste.','Drought and waste: market failures; a price ceiling corrects both.','Drought and waste: efficient outcomes; neither needs a policy response.','Drought: asymmetric information; waste: a transfer; target the information gap.')
opts('P77-MFAIL-FINALB-026','Both formats necessarily eliminate the information problem because both are accurate.','Both address the information gap; the tested label makes risk information more usable.','The unreadable format corrects an externality; the label creates monopoly power.','Neither addresses market failure because information costs cannot affect gains from trade.')
key('P62I-OLI-LB-034','Easy entry and likely price-reducing efficiencies can lessen concentration concerns.')
key('P62D-ITP-EL-019','Sales to higher-value buyers and expansion of production with value above cost.')
key('PM6-MON-BR-065','One network avoids duplicate infrastructure and can lower average cost.')
opts('PM6-MON-BR-066','P = ATC.','MR = MC.','P = MR.','P = MC.')
opts('P62F-PC-H-021','ATC and MC fall; output rises.','ATC and MC rise; output falls.','ATC falls; MC and output stay unchanged.','ATC rises; MC and output stay unchanged.')
for id in ['P62G-MON-B2-'+n for n in ['021','024','027','030','033','036']]:
 original=by[id]['q']['options']; out=[]
 for s in original:
  if s.startswith('ATC'):out.append('ATC rises; profit falls; output and price stay unchanged.')
  elif s.startswith('MC'):out.append('MC rises; profit falls; output falls and price rises.')
  elif s.startswith('Demand'):out.append('Costs stay unchanged; profit falls; output and price fall.')
  else:out.append('AVC rises; profit falls; output falls to zero and price stays unchanged.')
 edit(id,options=out,feedback='The $200 increase raises total fixed cost and ATC and lowers profit by $200. It leaves demand, MR, MC and AVC unchanged, so the profit-maximizing quantity and its demand-based price do not change.')

# Additional scope is exactly Micro-only bridge records using curriculum connections.
bridges={
'PMC-COP-BR-028':'Why is normal profit treated as an opportunity cost?',
'PMS-CPS-BR-001':'What does the height of a demand curve represent?',
'PMS-CPS-BR-005':'What does the height of a competitive supply curve represent?',
'PMS-CPS-BR-021':'How should resources be allocated to maximize gains from exchange?',
'PMS-CPS-BR-027':'What can surplus analysis establish about efficiency and fairness?',
'PMC-COP-BR-120':'Why should a current decision compare additional costs and benefits while excluding sunk costs?',
'PMC-COP-BR-145':'How can specialization lower average cost as a firm expands?',
'PMC-COP-BR-146':'Why can coordination problems raise average cost as an organization grows?',
'PMS-ELAS-BR-007':'How can stored inventory make supply more responsive to a price increase?',
'P77-IEA-BR-007':'Limited resources force a city to choose projects. What is the opportunity cost of choosing one project?',
'P77-IEA-BR-008':'A bonus changes effort until added benefit no longer exceeds added cost. What explains this response?',
'PM6-MON-BR-035':'After choosing output where MR = MC, how does a monopolist determine its profit or loss?',
'PM6-MON-BR-092':'How can resale erode a price difference between two customer groups?',
'PM5-PC-BR-020':'Why does a competitive firm expand output while marginal revenue exceeds marginal cost?',
'PM5-PC-BR-047':'Why does the short-run shutdown decision compare revenue with variable cost?',
'PM5-PC-BR-048':'When can producing at a loss still be better than shutting down in the short run?',
'PM5-PC-BR-089':'How does exit from a loss-making industry affect the allocation of resources?'
}
for id,q in bridges.items():edit(id,q=q)
# Avoid stale "both rules" phrasing while preserving the same marginal comparison.
edit('PMC-COP-BR-120',q='Why do marginal analysis and the sunk-cost rule both exclude past unrecoverable costs from a current decision?')
edit('PM6-MON-BR-035',q='How does a monopolist choose its output and then calculate profit or loss?')
edit('PM5-PC-BR-020',q='What marginal decision rule does a competitive firm use to choose output?')

edit('42367',q='At a $20 minimum wage, what labor surplus does the graph show?')
edit('42334',q='Marginal product rises 25% while the competitive output price falls 10%. Which comparison of labor demanded at the $20 wage correctly evaluates whether these changes support the direction of the shift from DL0 to DL1?')
edit('42334',feedback='At $20, DL0 gives 40 hundreds (4,000 workers) and DL1 gives 80 hundreds (8,000 workers). VMP = P × MP changes by 1.25 × 0.90 = 1.125, a 12.5% increase. This is consistent with the plotted rightward shift in labor demand, but does not establish the shift’s particular magnitude.')
edit('42737',q='An analyst claims that the middle quintile in economy A earns twice the overall average income. Which income-share and relative-mean calculation correctly evaluates the claim?')
opts('42737','Share: 16%; mean: 0.8 of the overall mean; claim rejected.','Share: 18%; mean: 0.9 of the overall mean; claim rejected.','Share: 40%; mean: 2.0 times the overall mean; claim supported.','Share: 18%; mean: 2.0 times the overall mean; claim supported.')
# The two loss/shutdown/exit sequences are retained in full as faculty directed.
# No rewrite is needed merely to reduce their number of question marks.

# Retain existing substantive feedback; add only displaced explanations that
# are not already expressed there. These are item-specific faculty prose edits.
feedback={
'P62C-CPS-EL-024':'A price ceiling can transfer surplus from producers to buyers. Deadweight loss is the net gain destroyed by trades that no longer occur, not the entire producer loss.',
'P62C-CPS-H-014':'At equilibrium, every unit with value at least cost can trade, while units with cost above value are excluded. This cutoff maximizes total surplus under the stated assumptions.',
'P62C-CPS-H-024':'Under the stated market assumptions, efficiency maximizes measured total surplus. It does not guarantee equal surplus or resolve judgments about the fairness of its distribution.',
'PMS-CPS-BR-022':'The marginal buyer’s willingness to pay and the marginal seller’s willingness to accept show whether one more trade would add gains.',
'P62E-COP-BR-018':'Producer surplus is revenue less variable cost, whereas accounting profit also deducts fixed costs. The measures therefore differ when fixed costs are positive.',
'P62E-COP-R-019':'Diminishing marginal product varies one input while others remain fixed in the short run. Diseconomies of scale concern rising average cost when all inputs can vary in the long run.',
'PMC-COP-BR-034':'A marginal value above the average raises the average; one below it lowers the average. This arithmetic applies to MP versus AP and to MC versus AVC or ATC.',
'PMC-COP-BR-035':'Payments tied to fixed inputs generate fixed cost. Costs of variable inputs change as production changes in the short run.',
'PMC-COP-BR-047':'Payment for an input that cannot be adjusted in the short run contributes to fixed cost. Payments for adjustable inputs contribute to variable cost.',
'PMC-COP-BR-147':'Each SRATC curve holds plant size fixed. LRAC allows the least-cost plant choice at each output and traces the lower envelope of the short-run curves.',
'PMC-COP-BR-148':'Economies of scale lower average cost as output expands with all inputs variable. Falling AFC spreads a given short-run fixed cost over more units. Both can lower average cost, but they are different mechanisms.',
'PMC-COP-BR-165':'Constant returns to scale means a proportional increase in all inputs produces the same proportional increase in output. Diminishing marginal product adds one variable input while others remain fixed. The concepts describe different production experiments.',
'PMC-COP-R-117':'Fixed describes how cost behaves with current output; sunk describes whether it can be recovered. A fixed cost may be avoidable in a future decision, whereas a sunk cost is unrecoverable.',
'P62G-MON-H-024':'With imperfect information about cost and demand, a regulator may set a price too high or too low, or choose terms that weaken the incentive to control cost.',
'P62G-MON-R-019':'Perfect first-degree discrimination can make all units with willingness to pay at least MC profitable to sell. Output reaches the efficient level even though the seller extracts consumer surplus.',
'PM6-MON-BR-066':'The allocative-efficiency condition is P = MC: the last unit’s willingness to pay equals its marginal production cost. Marginal-cost regulation seeks to reproduce this competitive benchmark.',
'PM6-MON-BR-069':'A firm allowed to keep gains from lowering cost below the price cap has an incentive to reduce cost. The result depends on the cap’s design; simply reimbursing reported costs can weaken that incentive.',
'PM6-MON-M-059':'Lower price limits can improve consumer terms while reducing revenue available for cost recovery and investment. Regulation must account for both current consumer benefits and incentives to maintain and improve service.',
'PM6-MON-M-060':'A single firm’s cost advantage depends on cost conditions over the market’s relevant output range. Once demand extends beyond declining ATC, multiple firms may no longer duplicate production at a higher average cost.',
'P62F-PC-H-023':'Higher demand initially raises price and profit. Profit attracts entry; with constant input costs, entry returns price and economic profit to their original long-run levels.',
'P62C-CPS-B3-011':'Buyer surplus is initially 52 − 45 = $7 and becomes 52 − 25 = $27. Seller surplus is initially 45 − 18 = $27 and becomes 25 − 18 = $7. Gross total remains 52 − 18 = $34; using $3 of real resources leaves $31 net.',
'P62C-CPS-LB-030':'Before administration, the transfer raises buyer surplus to 2 + 15 = $17 and lowers seller surplus to 38 − 15 = $23. Gross total remains $40; the $3 real resource cost leaves $37 net. Whether the redistribution is worth this efficiency cost requires an equity judgment.',
'P62B-ELAS-B3-006':'Point elasticity is |dQ/dP| × P/Q. At $30, Q = 30 and |Ed| = 3; at $10, Q = 90 and |Ed| = 1/3. The P/Q ratio changes even though slope is constant. A small price rise lowers revenue at the elastic point and raises it at the inelastic point.',
'P62C-CPS-H-018':'Initially, consumer surplus is (18 − 10) × 8 / 2 = $32 and producer surplus is (10 − 2) × 8 / 2 = $32. After the shift, consumer surplus is (22 − 12) × 10 / 2 = $50 and producer surplus is (12 − 2) × 10 / 2 = $50. Total surplus rises from $64 to $100.',
'P62F-PC-LB-030':'At the stated output, social MC is $18 + $6 = $24. A $6 per-unit tax makes the firm face that marginal cost. An output-independent license payment changes profit but leaves marginal cost at $18; equal expected revenue does not imply equal marginal incentives.',
'42737':'A’s cumulative shares at population 40% and 60% are about 22% and 40%. The middle quintile receives 40 − 22 = 18%, and 18/20 = 0.9 of the overall mean, so the twice-average claim is false. The upper cumulative endpoint includes earlier quintiles.'
}
for id,fb in feedback.items():edit(id,feedback=fb)
for id,p in patches.items():
 old=by[id]['q'];r=by[id]
 # Remove unmodified fields so the actual scope is explicit.
 for f in list(p):
  if p[f]==old[f]:del p[f]
 assert p,id
confirmed={r['id'] for r in rows if r['reviewStatus']=='Confirmed editorial candidate' and r['areas']==['micro']}
assert confirmed<=set(patches),sorted(confirmed-set(patches))
assert len(confirmed)==120
assert set(patches)==confirmed|set(bridges)|{'42367','42334','42737'}
(D/'patches.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Reviewed Micro edits:',len(patches),'confirmed:',len(confirmed),'additional bridges:',len(bridges))
