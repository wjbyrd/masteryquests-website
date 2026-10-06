"""Explicit faculty-directed patches. Does not modify the canonical bank."""
import json, re
from pathlib import Path
HERE=Path(__file__).parent
B=json.loads((HERE/'baseline_records.json').read_text(encoding='utf-8'))
M={r['id']:r for r in json.loads((HERE/'faculty_decisions.json').read_text(encoding='utf-8'))}
P={}; D={}
def edit(id, reason, **fields):
    assert M[id]['state']=='FACULTY FLAG', id
    q=B[id]['q']; patch=P.setdefault(id,{'correct_index':B[id]['answer'],'rationale':[]})
    patch.update(fields)
    patch['rationale'].append(reason)
    D[id]={'disposition':'CHANGED','rationale':' '.join(patch['rationale'])}
def stem(id,text,reason='Faculty-requested natural wording; economics and keyed answer preserved.'):
    edit(id,reason,q=text)
def key(id,text):
    opts=P.get(id,{}).get('options',B[id]['q']['options']).copy(); opts[B[id]['answer']]=text
    edit(id,'Shorten the keyed answer while preserving its economic claim.',options=opts)
def replace(id,q,options,answer,feedback,reason='Diversify the flagged repeated task while preserving its concept.'):
    edit(id,reason,q=q,options=options,correct_index=answer,feedback=feedback)
def disposition(id,status,reason): D[id]={'disposition':status,'rationale':reason}
def save():
    for name,data in [('patches.json',P),('dispositions.json',D)]:
        (HERE/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# The faculty's exact concept-prefix complaint has already been resolved for 42866.
disposition('42866','VERIFIED ALREADY RESOLVED','Current stem begins with the benefit phaseout, contains no concept label, and computes (1 − 0.60) × $100 = $40.')
for id in ['42868','42871','42874','42875','42877','42879','42867','42869','42873']:
    stem(id,re.sub(r'^Antipoverty design [A-Z]:\s*','',B[id]['q']['q']),'Remove the faculty-identified bookkeeping prefix only.')
for id in ['43023','43030','43006','42999','43013','42980','42973','42987','43037','42890']:
    s=re.sub(r'^In this setting,\s*','',B[id]['q']['q']); stem(id,s[0].upper()+s[1:],'Remove the specific empty introductory wrapper identified by faculty.')
for id in ['42840','42844','42848','42838','42839','42841','42842','42846']:
    s=re.sub(r'^Transfer-program case [A-Z]:\s*','',B[id]['q']['q']); stem(id,s,'Remove the transfer-program bookkeeping prefix identified by faculty.')
stem('42901','Customers who privately know their devices are fragile are especially likely to buy a warranty. Why is this adverse selection rather than moral hazard?')
edit('42901','Use direct, parallel explanations tied to nearby information problems.',options=['Coverage makes customers take less care of their devices.','Customers know their risk before buying coverage.','The seller reveals quality by offering a costly guarantee.','The insurer observes each customer’s risk before setting a premium.'])
stem('42910','An insurer verifies each applicant’s risk and charges a premium that reflects it. Does a high-risk customer buying coverage provide evidence of adverse selection?')
stem('42908','An insurer charges the same premium to applicants who privately know their own risks. Why might repeated premium increases drive the average risk of those insured even higher?')
edit('42908','Make the adverse-selection mechanism concise and distinguish it from hidden action and observed risk.',options=['Low-risk customers leave as premiums rise.','Insured customers take more risks after buying coverage.','High-risk customers leave before low-risk customers.','Higher premiums reveal each customer’s exact risk.'])
replace('42916','An insurer raises its uniform premium and then loses mostly low-risk customers. An analyst proposes another increase based on the remaining customers’ claims. What should the analyst consider?', ['Another increase may drive out more low-risk customers.','A higher premium necessarily improves the risk mix.','Leaving the premium unchanged eliminates private information.','Rising claims prove that coverage changed customers’ behavior.'],0,'When risk is privately known, raising a pooled premium can drive out lower-risk customers and raise average claims among those remaining.')
replace('43032','A designer claims that a ranked voting rule always produces a consistent social ranking and satisfies unrestricted preferences, unanimity, independence of irrelevant alternatives, and nondictatorship. What would refute that claim?', ['One preference profile with three or more alternatives where a required condition fails.','A profile where everyone agrees and the rule selects their shared favorite.','An election with only two alternatives and a clear majority.','Different voters ranking the same alternatives differently.'],0,'Arrow’s theorem rules out satisfying all these conditions for every preference profile with at least three alternatives. A single counterexample refutes the designer’s universal claim.')
replace('43031','A committee keeps a consistent ranked voting rule and refuses to let one voter dictate the result. Under Arrow’s theorem, what must it accept if it wants the rule to work for every possible ranking of three or more alternatives?', ['Every election must end in a tie.','The committee must abandon voting altogether.','Majority rule will satisfy every remaining condition.','At least one of unanimity or independence of irrelevant alternatives must fail.'],3,'With unrestricted preferences, a consistent social ranking and nondictatorship cannot also guarantee both unanimity and independence of irrelevant alternatives.')
replace('43010','A worker repeatedly postpones joining a savings plan, despite planning to join each payday. Which change most directly addresses the gap between the worker’s earlier plan and later choice?', ['Require the worker to forecast the stock market.','Show only last month’s investment return.','Let the worker commit now to automatic deductions from future pay.','Offer a larger immediate spending allowance.'],2,'A commitment made before the immediate spending temptation arrives can help a present-biased worker follow an earlier saving plan.')
replace('43014','A household prefers $110 in 31 days to $100 in 30 days, but prefers $100 today to $110 tomorrow. What changes between these choices?', ['The later reward becomes smaller.','The waiting time becomes longer.','The smaller reward becomes immediately available.','The household receives new information about default risk.'],2,'The amounts and one-day delay are unchanged. Reversing the ranking when one reward becomes immediate is consistent with present bias.')
replace('42996','Before receiving a mug, a student would pay $4 for it. After receiving it, the student refuses to sell it for $6, with no change in quality or information. What explains the difference?', ['Endowment effect','Anchoring on a posted retail price','Availability heuristic','Present bias'],0,'Ownership itself raises the student’s valuation, which is the endowment effect.')
replace('43004','A student says that a gap between willingness to accept and willingness to pay always proves an endowment effect. Which additional fact would most weaken that conclusion?', ['The owner learned valuable new information about the item after acquiring it.','Ownership was assigned randomly.','The item’s quality and uses were unchanged.','Buyers and sellers had the same information.'],0,'New information can change valuation without an ownership bias. To isolate the endowment effect, hold relevant information and other conditions constant.')
replace('43008','A researcher randomly gives identical pens to half a class. Owners demand more to sell than nonowners offer to pay. Which comparison would help test whether ownership caused the gap?', ['Compare valuations after randomly reversing who owns the pens.','Compare the pens’ colors without changing ownership.','Ask only owners how much they like writing.','Compare pen valuations with unrelated lunch prices.'],0,'Randomly changing ownership while keeping the good the same helps isolate the effect of ownership on valuation.')
replace('43016','An online seller offers a free trial with easy returns. After using the item, some customers value keeping it more than they valued buying it initially, despite learning nothing new about it. Which interpretation fits?', ['Temporary possession may create an endowment effect.','Returning the item necessarily involves a large monetary cost.','The product’s quality must have improved.','The customers must have become more patient.'],0,'Possession can raise valuation even without new information or a change in the product, consistent with the endowment effect.')
replace('43019','Two groups value identical mugs. One group is randomly given mugs before reporting a selling price; the other reports a buying price. Which result would provide the strongest evidence of an endowment effect?', ['Both groups report the same valuation.','Buyers report more than sellers because they received quality information.','Selling prices fall when the mugs are damaged.','Randomly assigned owners value the mugs more than otherwise similar nonowners.'],3,'Random assignment and identical goods isolate ownership as the relevant difference. A higher valuation among owners supports an endowment effect.')
edit('43017','Balance the choice lengths and retain the distinction between money and reference points.',options=['Equal rebates should create identical expectations.','Different expectations may produce different responses.','Only the final dollar amount affects the response.','The rebate’s legal value depends on expectations.'])
replace('42984','A cafeteria puts fruit at eye level while keeping the same foods and prices. Which feature makes this a nudge?', ['It changes presentation while preserving the available choices.','It bans less nutritious foods from the cafeteria.','It raises the relative price of less nutritious foods.','It requires customers to purchase fruit.'],0,'The intervention changes choice architecture without removing options or materially changing prices.')
replace('42988','A city wants to encourage water conservation through a nudge. Which proposal qualifies?', ['Show households how their usage compares with similar neighbors.','Double the price of every unit of water.','Ban outdoor watering throughout the year.','Fine households that exceed a legal quantity limit.'],0,'Comparative usage information changes the decision setting while leaving prices and legal options unchanged.')
replace('42992','A policy is described as a nudge, but households must pay a large penalty to reject the recommended option. Which fact challenges that description?', ['Rejecting the option materially changes the household’s financial incentives.','The policy affects how households make decisions.','The recommendation is visible at the time of choice.','Some households choose the recommended option.'],0,'A large penalty materially changes incentives. A nudge works through choice architecture while preserving alternatives without substantial price changes.')
replace('42995','An employer automatically enrolls workers in a savings plan and makes opting out simple and free. Participation rises. What can be concluded from this comparison?', ['Every enrolled worker prefers the plan to all alternatives.','Workers’ wages must have increased.','Opting out has become legally prohibited.','The default can affect choices even when the available options remain the same.'],3,'Changing the default changes choice architecture. Increased participation alone does not establish every worker’s preference or welfare gain.')
replace('42970','A rational-choice model repeatedly overpredicts how much people save. Which research step follows the behavioral-economics approach?', ['Ignore the saving data because the model is internally consistent.','Treat low saving as proof that people have no preferences.','Test whether present bias improves predictions of actual saving.','Choose the policy the researcher personally prefers.'],2,'Behavioral economics tests whether systematic psychological influences improve explanations and predictions of observed decisions.')
key('42971','That choice presentation cannot affect decisions')
replace('42978','A researcher adds loss aversion to a model of risky choice. What evidence would best justify the added assumption?', ['The revised model uses more psychological terminology.','The assumption makes every policy easier to defend.','It predicts choices in new data better than the original model.','It can explain any result after observing the data.'],2,'Predictive improvement on new data provides evidence that a behavioral assumption is useful rather than merely flexible.')
replace('42982','People sometimes choose an inferior option because comparing many alternatives is costly. Which change to a simple rational-choice benchmark could explain this?', ['Assume that scarcity no longer applies.','Assume that all choices reveal perfect information.','Include limits on attention and decision-making effort.','Remove prices and preferences from the model.'],2,'Bounded rationality allows cognitive limits and information-processing costs to affect choices without eliminating scarcity or preferences.')
replace('42990','A policy maker observes a decision bias in one experiment and immediately recommends a nationwide intervention. What is missing from that inference?', ['Proof that every rational-choice model is false.','A claim that individual preferences do not matter.','Evidence that the bias persists and that the intervention improves outcomes.','An assumption that the experiment applies equally to everyone.'],2,'A behavioral finding is positive evidence. A policy recommendation also requires evidence about generalizability, benefits, costs, and unintended effects.')
for id,text in {'42298':'Users gain from harvesting while sharing depletion costs.','42300':'Charge for use to reflect depletion or congestion costs.','42302':'Private gains exceed each user’s share of the depletion cost.','42284':'Catch benefits are private; depletion costs are shared.','42287':'The added benefit is private; pasture damage is shared.','42289':'Users receive private gains while sharing depletion costs.','42293':'The fisher imposes depletion costs on other fishers.'}.items(): key(id,text)

TIERS={'easy','medium','hard','elite','legendary'}
def difficulty(id,tier):
    q=B[id]['q']; role=q.get('instructionalRole'); fields={'canonicalDifficulty':tier}
    if q.get('difficulty') in TIERS: fields['difficulty']=tier
    if all(q.get(k)==v for k,v in fields.items()):
        if id not in D: disposition(id,'VERIFIED ALREADY RESOLVED',f'Current cognitive difficulty is already {tier}; existing role and routes retained.')
    else:
        edit(id,f'Apply faculty cognitive tier {tier}; preserve instructionalRole={role}, sourcePool, original pool/tier, skills, and routing references. Ordinary tier pools follow the new cognitive tier; structural pools remain intact.',**fields)

# Each stem was read with its role and before-tier. Range judgments use the lower
# tier when the task is direct, and Medium for the private/social-net-benefit comparison.
range_tiers={'42288':'medium','42292':'easy','P75-TRADE-E-007':'medium','P75-TRADE-E-008':'medium','P75-TRADE-E-009':'medium','P75-TRADE-E-010':'medium','P75-TRADE-L-011':'medium','P75-TRADE-H-011':'medium','P75-TRADE-EB-005':'easy',
 'ECON-MG-HARD-228':'elite','ECON-MG-HARD-229':'elite','PMA-ITP-H-001':'elite','P62H-MCMP-C-022':'elite','P62H-MCMP-C-023':'elite','P62G-MON-H-013':'elite','PM6-MON-M-021':'hard'}
for n in range(9,17): range_tiers[f'P62G-MON-M-{n:03}']='elite' if n in [14,16] else 'hard'
for id,r in M.items():
    if r['state']!='FACULTY FLAG' or r['issue']!='Difficulty': continue
    q=B[id]['q']; note=r['note']; role=q.get('instructionalRole')
    if role in {'repair','bridge','retest'}:
        disposition(id,'NO CHANGE — STRUCTURAL ROLE PROTECTED',f'Inspected {role} role, sourcePool={q.get("sourcePool")}, canonicalDifficulty={q.get("canonicalDifficulty")}, originalSourcePool={q.get("originalSourcePool")}, originalBossTier={q.get("originalBossTier")}, primary/repair skills and all stored/routed memberships. The prerequisite or reconnection task is intentionally simpler; preserve its content, cognitive metadata and remediation routing. Faculty note: '+note)
        continue
    if id in range_tiers: difficulty(id,range_tiers[id]); continue
    if re.fullmatch(r'(Easy|Medium|Hard|Elite|Legendary)\.?',note,re.I): difficulty(id,note.rstrip('.').lower())
    elif note.startswith('Elite. This is for principles'): difficulty(id,'elite')
    elif note.startswith('Elite. Drop'): difficulty(id,'elite'); stem(id,q['q'].replace(' Use the displayed values and round to cents.',' Round your answer to the nearest cent.'))
    elif id=='P62C-CPS-B2-007':
        difficulty(id,'hard'); stem(id,'Refer to the graph. A student labels the price-times-quantity rectangle as consumer surplus. What is consumer surplus at E, and what does that rectangle actually measure?')
disposition('42876','NO CHANGE — REQUIRES MANUAL DECISION','Faculty selected Reclassify Difficulty without a target or rationale. The current Medium item combines an earnings gain with a benefit loss; the note does not establish whether faculty wants a higher or lower tier. Preserve pending a faculty tier decision.')
for n in range(5,10):
    id=f'P62G-MON-C-{n:03}'; difficulty(id,'elite')
    if n==5: stem(id,B[id]['q']['q']+' Use marginal revenue = change in total revenue ÷ change in quantity.','Supply the requested marginal-revenue calculation rule; no calculus is needed.')
    else: stem(id,B[id]['q']['q']+' For a linear demand curve P = a − bQ, use MR = a − 2bQ.','Supply the specialized formula explicitly so the task tests use rather than calculus derivation.')

if __name__=='__main__': save()
