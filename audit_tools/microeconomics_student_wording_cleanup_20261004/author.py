import json,re,copy
from pathlib import Path
H=Path(__file__).parent
old=json.loads((H/'drafts.json').read_text(encoding='utf-8'))
d=copy.deepcopy(old)
def stem(i,s):d[i]['q']=s
def opt(i,n,s):d[i]['options'][n]=s
def fb(i,s):d[i]['feedback']=s
def sub(i,a,b,fields=('q','options','feedback')):
 for f in fields:
  if f=='options':d[i][f]=[x.replace(a,b) for x in d[i][f]]
  else:d[i][f]=d[i][f].replace(a,b)
sub('40020','Compare the two determinant effects and infer which labeled point becomes the new equilibrium.','Which labeled point is the new equilibrium after both changes?')
for i,good in [('42027','fast-fashion garments'),('42037','disposable vapes')]:
 stem(i,f'Regulators want to reach the efficient outcome by setting a quantity limit rather than changing the price through a tax or subsidy. According to the graph, what quantity of {good} should they allow?')
for i in ['42057','42095']:sub(i,'social-intersection quantity','socially efficient quantity')
sub('42086','Which graph-based gain and institutional comparison are correct?','Using the graph, how much does each arrangement increase total surplus, and how do the payment arrangements differ?')
sub('42095','Which net gains over the plotted private outcome and conclusion follow?','Compared with the private outcome shown in the graph, what is the net gain from each approach, and why do those gains differ?')
opt('42142',2,'Giving permits away changes who receives their value but need not change the least-cost outcome when trading is competitive and has no transaction costs')
fb('42142','Giving permits away rather than auctioning them changes who receives their value. With competitive trading and no transaction costs, the fixed cap still determines total emissions, and firms can trade permits to achieve that cap at the lowest total cost.')
sub('42145','What must be separated?','Which two effects should be distinguished when comparing these systems?')
opt('42145',1,'How emissions reductions are achieved at the lowest cost and who receives the value of the permits')
sub('42148','because it bears lost fishery value','because its pollution now reduces its own fishing income')
opt('42150',0,'Norms always make marginal social benefit equal marginal social cost')
opt('42151',3,'Before coordination costs, insulation benefits society; the added rent alone does not cover its cost, and organizing the payment costs more than the total net benefit.')
for i in ['42192','42198']:
 sub(i,'Which aggregate reading and marginal rule correct the recommendation?','At four displays, what is the total marginal benefit, and how should the neighborhoods’ benefits be combined to evaluate the recommendation?')
stem('42210','A town hires private contractors to provide three services. Each packed meal can be consumed only once, so the town proposes charging per meal. Its archive requires a login and is not crowded; the town proposes opening access after a sponsor covers the full cost. Anyone can receive its warning broadcast without reducing others’ ability to listen; the town proposes a binding community agreement to fund it. Which statement correctly explains these funding choices?')
sub('42285','Which diagnosis explains why the two remedies target different margins?','Why do these two services need different funding or pricing policies?')
sub('42334','Compare the direction of the resulting VMP change with the demand shift shown. Which plotted change at the old wage and assessment are correct?','First read the change in labor demanded at the old wage from the graph. Then determine whether the stated productivity and price changes would shift labor demand in the same direction. Which answer gives both conclusions?')
sub('42343','Which plotted final employment and judgment about whether these two changes produce the depicted shift are correct?','What final employment level does the graph show, and would the stated productivity and price changes together produce the demand shift shown?')
stem('42407','At a car wash, one additional worker washes 3 more cars per hour. Each wash sells for $15. Should the firm hire this worker at a wage of $40 per hour?')
sub('42584','Which curve represents the most-preferred bundles under monotonic preferences?','Assume the consumer prefers more of either good when the amount of the other is unchanged. Which indifference curve contains the most-preferred bundles?')
opt('42656',0,'The curves contradict consistent preferences in which more of either good is preferred, holding the other good constant')
sub('42795','without imposing an equity preference','without assuming which income distribution is fairer')
sub('42795','from Lorenz dominance alone','from the higher Lorenz curve alone')
sub('42795','Lorenz dominance ranks relative inequality, not income levels.','One Lorenz curve lying above another indicates less relative inequality, not higher income levels.')
opt('42807',3,'Training explains part of the gap; the rest could reflect compensation for risk, but other explanations may remain.')
sub('42849','Cash weakly expands private choice','Cash gives recipients at least as much choice')
stem('42943','An insurer can perfectly verify how carefully a driver behaves but cannot make enforceable contract terms or penalties depend on that behavior. Does observing the driver’s behavior alone remove the incentive to take less care?')
opt('42943',3,'No; observing an action does not ensure that contract terms can reward or penalize it, so incentives may remain unchanged.')
stem('42944','If an insurer can observe every safety action and enforce contract terms that reward or penalize those actions, what happens to hidden-action moral hazard?')
fb('42944','When enforceable contract terms reward or penalize observed safety actions, they can reduce the hidden-action problem.')
for i in ['42948','42952','42956','42960','42964']:
 opt(i,0,'The cost difference can make the credential a credible way to distinguish high-productivity workers from low-productivity workers')
sub('42965','what happens to its separating rationale?','does the warranty become a stronger or weaker signal of product quality, and why?')
stem('ECON-EC-EASYBOSS-17000','What is a tradeoff?')
stem('ECON-EC-EASYBOSS-17009','A model uses a simplified diagram of households, firms, markets, and money flows. Why do economists use models like this?')
stem('ECON-EC-EASYBOSS-17012','Prices guide the use of resources without a central planner directing each decision. What is this describing?')
stem('ECON-EC-EASYBOSS-17015','Which statement is positive?')
stem('ECON-EC-EASYBOSS-17021','Which question is macroeconomic?')
stem('ECON-EC-EASYBOSS-17023','Which pairing correctly distinguishes macroeconomics from microeconomics?')
stem('ECON-EC-FINALBOSS-19020','Why do a tax on buyers and an equal tax on sellers lead to similar market outcomes?')
stem('ECON-EC-LEGENDARYBOSS-20011','A policy improves pay for some workers, reduces job opportunities for others, and may raise consumer prices. Which policy is most likely being described?')
sub('ECON-EC-LEGENDARYBOSS-20017','The Market Marshal compares two taxes. ','')
sub('ECON-EC-LEGENDARYBOSS-20023','The Market Marshal presents a final scenario: unemployment falls','Unemployment falls')
opt('ECON-EC-ELITE-13026',2,'Buyers or sellers respond strongly to the tax-related price change, sharply reducing the quantity traded')
opt('ECON-MG-ELITE-326',0,'Buyers or sellers respond strongly to the tax-related price change, sharply reducing the quantity traded.')
opt('ECON-MG-EASY-11',0,'No; both parties gaining from a trade does not by itself show a market failure')
sub('P52B-COMP-L-002','A market appears fragmented by seller count','A market appears to have many separate sellers')
opt('P52B-COMP-L-002',3,'Which firms actually control production capacity, rather than just how many brands exist.')
sub('P52B-EPOL-H-002','preferred specification','chosen model')
sub('P52B-EPOL-H-002','alternative specifications','other reasonable versions of the model')
opt('P52B-INC-B2-003',3,'Much of the money pays for actions already planned.')
# Preserve the positive-gain / indifference boundary in every authorized trade item.
for i in d:
 if 'TRADE' not in i:continue
 for a,b in [('strict and exactly equal gains','positive and exactly equal gains'),('strict mutual-gain interval','range of trading prices that makes both producers better off'),('strict specialization gains','positive gains for both producers from specialization'),('strict mutual gains','positive gains for both producers'),('strict gains','positive gains'),('a strict gain','a positive gain'),('both gain strictly','both receive a positive gain'),('Both now gain strictly','Both now receive a positive gain'),('strictly gains','receives a positive gain'),('strictly gain','receive a positive gain'),('A strict mutual-gain rate lies strictly between the relevant opportunity costs.','For both producers to be better off, the trading price must be above the lower opportunity cost and below the higher one.')]:sub(i,a,b)
opt('P52B-TRADE-LB-002',0,'Yes: delegation allows 6 additional sales because the assistant’s forgone sales are the only cost to compare.')
sub('P52B-TRADE-LB-002','Delegation is not strictly better','Delegation does not improve the outcome')
sub('P75-TRADE-R-008','Is that producer strictly better off?','Does that producer receive a positive gain from trade?')
sub('P62B-ELAS-B3-012','under the stated fixed-demand-determinant estimates','from these estimates, holding other factors affecting labor demand constant')
sub('P62B-ELAS-L-048','a very small price change has what first-order effect on total revenue?','approximately what effect does a very small price change have on total revenue?')
stem('P62B-ELAS-L-072','A regression estimates how many units quantity demanded changes when price rises by one dollar. Why must this estimate be converted before it can be reported as a price elasticity?')
fb('P62B-ELAS-L-072','The estimate measures a change in units per dollar. Elasticity compares percentage changes, so the conversion also requires the current price and quantity.')
sub('P62B-ELAS-LB-009','What is the core identification problem?','Why might the estimate fail to isolate the effect of price on quantity demanded?')
fb('P62B-ELAS-LB-009','Income and competitor prices can shift demand, so the observed quantity change cannot necessarily be attributed to the product’s own price alone.')
opt('P62B-ELAS-LB-011',0,'Demand stays unchanged, and a separate change in supply causes the price change')
fb('P62B-ELAS-LB-011','If demand stays unchanged, a price change caused by an independent change in supply traces a movement along the demand curve.')
opt('P62B-ELAS-LB-012',1,'Supply stays unchanged, and a separate change in demand causes the price change')
fb('P62B-ELAS-LB-012','If supply stays unchanged, a price change caused by an independent change in demand traces a movement along the supply curve.')
sub('P62B-ELAS-LB-024','because use the old quantity at the new price.','because the calculation uses the old quantity at the new price.')
sub('P62B-ELAS-LB-025','higher contribution margins','more revenue left per sale after variable costs')
fb('P62B-ELAS-LB-025','Revenue and profit are different objectives. A price increase reduces quantity sold when demand is elastic, but whether profit rises also depends on variable costs and the revenue left from the remaining sales.')
sub('P62B-ELAS-LB-035','compare incremental contribution across feasible uses','compare the extra revenue minus extra cost from using capacity to serve each group')
sub('P62B-ELAS-LB-035','their incremental contribution is lower','the extra revenue minus extra cost from serving them is lower')
sub('P62B-ELAS-LB-035','the contribution of extra units','the extra revenue minus extra cost from additional units')
opt('P62B-ELAS-LB-036',1,'Over a decade, innovation and relocation give households more ways to respond, so demand may be more elastic than a first-month estimate suggests')
stem('P62C-CPS-BR-012','A tax reduces quantity traded from 10 units to 8. Which measure captures the resulting loss of gains from trade?')
d['P62C-CPS-BR-012']['options']=['The form of the tax law','The relationship between the tax rate and tax revenue','The best overall tax policy for the country','The reduction in total surplus when quantity falls from 10 to 8']
stem('P62C-CPS-BR-016','When evaluating how a price control affects total surplus, which change should an economist examine?')
d['P62C-CPS-BR-016']['options']=['How every method of rationing works','The city’s long-run construction plans','The best way to enforce the control','Whether the control changes the number of mutually beneficial exchanges']
for i in ['P62C-CPS-L-060','P62C-CPS-L-062','P62C-CPS-L-064','P62C-CPS-L-066','P62C-CPS-L-068']:
 s=d[i]['q'];s=s.replace('a buyer valued at','a buyer who values one unit at').replace('A nonrecipient valued at','A buyer who did not receive a unit and values it at')
 s=re.sub(r'In the (.*?) allocation,',r'When allocating \1,',s)
 stem(i,s)
sub('P62C-CPS-LB-035','Which comparison correctly handles the equality boundary?','How does the added cost change whether producing the eighth unit increases total surplus?')
sub('P62E-COP-BR-019','What differs later?','Which conditions differ when they determine revenue and choose output?')
fb('P62E-COP-BR-019','The same cost relationships apply to both firms, but the demand and marginal revenue they face differ.')
sub('P62F-PC-H-015','Which displayed price range and transmission explain the firm’s outcome?','What price range does the graph show, and how does the higher market price affect the firm’s revenue, output, and profit?')
for i in ['P62F-PC-LB-001','P62F-PC-LB-005']:
 sub(i,'the output contribution schedule','the marginal revenue or marginal cost of producing additional units')
 sub(i,'the best contribution is','the largest amount of revenue left after variable cost is')
opt('P62H-MCMP-B3-044',1,'The campaign can signal confidence that quality will remain high over repeated visits')
sub('P62H-MCMP-C-029','raises contribution margin by $15,500','increases revenue minus variable costs by $15,500')
fb('P62H-MCMP-C-029','Subtract the $12,000 campaign cost from the $15,500 increase in revenue minus variable costs: profit rises by $3,500.')
for i in ['P62H-MCMP-L-079','P62H-MCMP-L-080','P62H-MCMP-L-081']:
 sub(i,'creates switching benefits that make members less responsive to price','offers benefits that members keep by staying with the gym and lose if they switch, making them less responsive to its price')
 sub(i,'Switching benefits make buyers','Benefits from staying with the gym make buyers')
for i in ['P62H-MCMP-L-082','P62H-MCMP-L-083','P62H-MCMP-L-084']:
 sub(i,'a specialized low-sensory lodging format','accommodation designed to reduce sensory stimulation for guests who prefer it')
 sub(i,'A low-sensory format','Accommodation designed to reduce sensory stimulation')
# The actual stored present values support a geometric payoff weight, not an
# assertion that this is the probability of continuation. Define its calculation role.
factor_ids=[]
for i,q in d.items():
 s=q['q']
 if 'continuation factor' not in s and 'continue with factor' not in s:continue
 factor_ids.append(i)
 if i=='P62I-OLI-C-028':
  stem(i,'In a present-value calculation, future payoffs are weighted by multiplying by the same factor for each period ahead. Holding all current payoffs fixed, this factor rises from 0.40 to 0.85. What changes most directly?')
  fb(i,'A higher factor gives future consequences more weight relative to current payoffs in the present-value calculation.')
 elif 'continue with factor' in s:
  s=re.sub(r'Two firms expect the relationship to continue with factor ([0-9.]+)\.',r'Two firms interact repeatedly. In their present-value calculation, each payoff is weighted by multiplying by \1 for each period ahead.',s)
  stem(i,s)
 else:
  s=re.sub(r'(?:and the |and )?continuation factor is ([0-9.]+)\.',r'In the present-value calculation, each payoff is weighted by multiplying by \1 for each period ahead.',s)
  s=s.replace(', In the','. In the').replace('; In the','. In the')
  stem(i,s)
assert len(factor_ids)==31
sub('P62I-OLI-EL-028','multi-home across rivals','use several competing platforms at the same time')
sub('P62I-OLI-EL-028','multi-homing may preserve competition','using several platforms at once may preserve competition')
sub('P62I-OLI-EL-028','Easy multi-homing','Easily using several platforms at once')
sub('P62I-OLI-L-086','tips toward two large networks','becomes dominated by two large networks')
sub('P62I-OLI-L-086','users can switch and multi-home','users can switch networks and use several at the same time')
sub('P62I-OLI-L-086','switching, multi-homing, and entry conditions','switching between networks, using several at once, and entry conditions')
sub('P62I-OLI-L-086','Every efficiency must be passed through fully','Every cost saving must be fully reflected in lower customer prices')
sub('P62I-OLI-LB-035','prevents users from multi-homing','prevents users from using competing platforms at the same time')
opt('P62I-OLI-LB-035',0,'Barriers to entry and the risk that rivals will be blocked from competing become central')
for i in ['P62I-OLI-L-076','P62I-OLI-L-078','P62I-OLI-L-080','P62I-OLI-L-082','P62I-OLI-L-084']:
 sub(i,'Approve on claimed savings without testing consumer pass-through','Approve based on claimed savings without checking whether they will lower customer prices')
 sub(i,'Weigh reduced rivalry against verified efficiencies and consumer pass-through','Weigh reduced competition against verified cost savings and how much they will lower customer prices')
opt('P62I-OLI-B3-042',2,'They guarantee that all cost savings will be reflected in lower customer prices')
sub('P62I-OLI-LB-034','large verifiable marginal-cost savings are likely to pass through','large, verifiable marginal-cost savings are likely to lower customer prices')
opt('P62I-OLI-LB-034',3,'The cost savings and easy entry can substantially reduce concerns about the merger’s increase in concentration')
stem('P73-MARG-M-007','A warehouse’s average handling cost is $9 per box. Handling the next box costs $13 and brings in $15 after other variable costs have been deducted, but before deducting this handling cost. What should it do?')
sub('P77-EPOL-L-019','one assumed take-up rate','one assumed participation rate')
sub('P77-EPOL-L-019','take-up rates','participation rates')
sub('P77-EPOL-L-019','take-up rate','participation rate')
opt('P77-EPOL-L-019',2,'Uncertainty about how many people will participate, beyond the forecast uncertainty calculated using one assumed rate')
fb('P77-EPOL-L-019','A precise forecast based on one assumed participation rate does not capture uncertainty about that rate itself. Report how other plausible rates change the recommendation.')
opt('P77-EPOL-LB-033',1,'Track riders’ previous travel methods and compare changes with a similar group not receiving the subsidy; matching total ridership alone does not show how many car trips were replaced.')
fb('P77-EPOL-LB-033','The same increase in transit use could come from former drivers or from riders switching buses. Knowing previous travel methods and comparing with similar travelers who did not receive the subsidy helps identify how many car trips it replaced.')
stem('P77-IEA-R-001','Which explanation connects scarcity with opportunity cost?')
d['P77-IEA-R-001']['options']=['Limited resources force a choice; opportunity cost is the value of the best alternative given up','Using both terms is enough without explaining how they are related','Either concept alone is enough, so their relationship can be ignored','Mentioning a policy shows the relationship without examining the choice']
fb('P77-IEA-R-001','Scarcity forces a choice, and opportunity cost is the value of the next-best alternative given up.')
stem('P77-IEA-R-003','How does a movement along a PPF show opportunity cost?')
d['P77-IEA-R-003']['options']=['Either concept can be used alone, so their relationship can be ignored','Naming a policy establishes the relationship without examining the tradeoff','The slope or production tradeoff shows what must be given up to produce more of the other good','Using both terms is enough without explaining how they are related']
stem('P77-IEA-R-006','What should two producers compare to decide how to specialize and whether both can gain from trade?')
d['P77-IEA-R-006']['options']=['The names of the concepts alone, without relating them to the production choices','Their opportunity costs and the possible terms of trade','Whichever concept is more familiar, without examining the other','Whether a policy is mentioned, without examining the production choices']
stem('PG1-SUP-L-003','Refer to the graph. A technology improvement shifts supply from S0 to S1. At the unchanged price of $3, quantity supplied rises. Half of this increase in quantity is later lost, leaving a parallel supply curve halfway between S0 and S1. What price would now be needed to supply the quantity originally available on S1 at $3, and how would the market reach that quantity?')
sub('PM5-PC-H-084','Ignoring industry-cost-condition complications, what completes the long-run adjustment?','Focus on entry and market supply, setting aside changes in industry costs. What completes the long-run adjustment?')
sub('PM5-PC-R-086','What is the long-run repair?','Which statement correctly explains the long-run adjustment?')
opt('PM8-OLI-M-061',0,'Compare reduced competition with verified cost savings and how much they lower customer prices')
opt('PM8-OLI-R-073',0,'HHI measures concentration; consumer effects also depend on competition, entry, cost savings, and resulting price reductions')
opt('PMA-ITP-H-037',0,'If domestic output cannot expand, the tariff may do little to make supply more reliable; compare buying from several allied suppliers with the tariff’s added costs.')
sub('PMA-ITP-H-037','Reliable allied diversification','Buying from several reliable allied suppliers')
sub('PMS-ELAS-R-003','Best repair?','Which statement corrects this mistake?')
# Keep explanations concise so decoding fixes do not create a new longest-key cue.
opt('ECON-MG-EASY-11',0,'No; gains for both parties do not establish market failure')
opt('P52B-COMP-L-002',3,'Which firms control capacity, rather than the number of brands.')
opt('P62I-OLI-LB-035',0,'Entry barriers and risks of blocking rivals deserve attention')
opt('P62B-ELAS-LB-012',0,'Supply shifts at the same time as demand')
opt('P62B-ELAS-LB-012',2,'Demand is perfectly inelastic over the price range considered')
opt('P62B-ELAS-LB-012',3,'The product is a normal good for its buyers')
opt('42142',0,'Giving permits away raises the total emissions cap, allowing more pollution than auctioning them')
opt('42142',1,'Auctioning the same permits creates more emissions than giving them away to firms')
opt('42142',3,'The initial allocation of permits never affects how their value is distributed among recipients')
opt('42145',1,'Achieving emissions reductions at least cost and distributing the permits’ value')
opt('42656',0,'The curves violate consistent, more-is-better preferences')
for i in ['42948','42952','42956','42960','42964']:
 opt(i,0,'Different costs can make the credential credibly distinguish workers by productivity')
for i in ['ECON-EC-ELITE-13026','ECON-MG-ELITE-326']:
 k=d[i]['correct_index']
 d[i]['options']=['The tax must be too small to affect purchases and sales','Buyers must bear the entire burden, leaving sellers unaffected by the tax','Imposing a tax always increases total revenue regardless of market responses']
 d[i]['options'].insert(k,'A strong response to the tax-related price change sharply reduces trade')
for i in ['P62F-PC-LB-001','P62F-PC-LB-005']:
 sub(i,'the marginal revenue or marginal cost of producing additional units','marginal revenue or marginal cost')
opt('P62H-MCMP-B3-044',1,'The campaign can signal confidence in consistently high quality')
for i in ['P62H-MCMP-L-082','P62H-MCMP-L-083','P62H-MCMP-L-084']:
 sub(i,'accommodation designed to reduce sensory stimulation for guests who prefer it','accommodation for guests who prefer less noise, light, and other sensory stimulation')
 sub(i,'Accommodation designed to reduce sensory stimulation','Reducing noise, light, and other sensory stimulation')
for i in factor_ids:
 if '-B2-' in i or '-LB-' in i:
  s=d[i]['q']
  s=re.sub(r'Cooperation pays (\d+), (?:cheating|deviation) pays (\d+) (?:once|now), punishment pays (\d+)(?: later)?\.',r'Cooperation pays \1 each period; cheating pays \2 now and a punishment payoff of \3 each later period.',s)
  s=s.replace('calculate the absolute PV difference','calculate the absolute difference in present values')
  stem(i,s)
assert len(d)==148
assert all(d[i]!=old[i] for i in d),[i for i in d if d[i]==old[i]]
(H/'patches.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(H/'factor_model_evidence.json').write_text(json.dumps({'ids':factor_ids,'interpretation':'Geometric weight on future payoffs in the present-value calculation; no claim about the probability of another round.','canonical_evidence':'All numeric family feedback uses C/(1-delta) and D+delta*P/(1-delta); C-028 explicitly states that the factor weights future consequences.','formula':'Cooperate: C/(1-d). Deviate: D+d*P/(1-d).'},indent=2)+'\n',encoding='utf-8')
print('Authored',len(d),'bounded patches; defined payoff weight in',len(factor_ids),'items.')
