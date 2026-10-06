from author import *

for id in ['42681','42682','42683','42685','42686']:
    mu=list(map(int,re.findall(r'is (\d+)',B[id]['q']['q']))); x,y=mu
    opts=['The market’s price of X measured in units of Y.','The consumer’s total utility from both goods.','The number of X units affordable with all income.']
    opts.insert(B[id]['answer'],f'Willingness to give up {x}/{y} units of Y for one more X.')
    edit(id,'Balance answer lengths using nearby interpretations of price, utility, and affordability.',options=opts)
for id in ['P62H-MCMP-L-026','P62H-MCMP-L-029','P62H-MCMP-LB-002','P62H-MCMP-LB-005','P62H-MCMP-LB-020']:
    s=B[id]['q']['q'].replace('After choosing output, which operating result follows? Keep full precision until rounding profit or loss to cents.','Should the firm operate, and what profit or loss would it earn at its best output? Round the final amount to cents.')
    stem(id,s,'Replace the mechanical ending while preserving the required final rounding.')
for n in range(5,10):
    id=f'P62H-MCMP-C-{n:03}'; q=B[id]['q']['q']; arr=re.findall(r'\[([^]]+)\]',q); prices=[int(v.strip()) for v in arr[0].split(',')]; costs=[int(v.strip()) for v in arr[1].split(',')]; profits=[i*p-costs[i] for i,p in enumerate(prices)]; best=max(range(len(profits)),key=profits.__getitem__)
    assert best==2
    stem(id,q.replace('A firm has prices by quantity','For quantities 0 through 5, a firm has prices in dollars').replace('using the discrete marginal rule','').replace('profit ?','profit?'),'State the quantity indexing and ask for profit maximization without an unexplained rule name.')
    edit(id,'Verify the discrete output choice by comparing revenue minus total cost at every output.',feedback='For quantities 0 through 5, profit (P × Q − TC) is '+', '.join(f'${v}' for v in profits)+f'. The largest value occurs at Q = {best}; this minimizes the loss.')
for n in [14,15]:
    id=f'P62H-MCMP-C-{n:03}'; stem(id,B[id]['q']['q'].replace(' Use the displayed values and round to the nearest cent.',''),'Remove the unnecessary final instruction as faculty requested.')
stem('P62H-MCMP-E-024','What relationship characterizes long-run equilibrium for a monopolistically competitive firm?')
for n in [16,18,20,22]:
    id=f'P62H-MCMP-EL-{n:03}'; stem(id,B[id]['q']['q'].replace('Using the displayed values,','Given this information,'))
for id in ['P62H-MCMP-L-065','P62H-MCMP-L-068','P62H-MCMP-L-077','P62H-MCMP-L-080','P62H-MCMP-L-083','P62H-MCMP-L-089']:
    q=B[id]['q']; a=B[id]['answer']; opts=q['options'].copy()
    correct='Demand may rise or become less elastic without a quality change.' if id.endswith(('065','068')) else 'Demand becomes less elastic, allowing a larger markup.' if id.endswith('080') else 'Higher customer value may raise demand, but added costs matter.'
    distract=['Higher sales guarantee lasting profit despite free entry.','Differentiation makes the firm accept a fixed market price.','Greater customer loyalty eliminates the possibility of entry.']
    opts=distract; opts.insert(a,correct); edit(id,'Shorten the key and make the alternative mechanisms comparable in length.',options=opts)
replace('P62H-MCMP-C-029','A firm’s annual revenue would be $80,000 without a proposed campaign and $102,000 with it. Production-related variable cost would rise from $35,000 to $41,500. The campaign costs $12,000, and an unavoidable $8,000 lease payment is the same under either plan. What is the campaign’s incremental contribution to profit?', ['$3,500','$27,500','$15,500','−$4,500'],0,'Incremental revenue = $22,000; incremental variable cost = $6,500. Subtract the $12,000 campaign: $22,000 − $6,500 − $12,000 = $3,500. The unchanged lease payment cancels.','Require a comparison of two revenue/cost plans and distinguish incremental costs from unchanged fixed costs.')
replace('P62H-MCMP-C-030','A delivery guarantee is offered on 5,000 orders, but 1,000 customers collect their orders and incur no guarantee charge. The guarantee costs $2 for handling plus $1 for insurance on each delivered order. A separate annual advertising fee is $6,000, and product manufacturing costs are unchanged. What additional variable selling cost does the guarantee create?', ['$15,000','$12,000','$18,000','$3,000'],1,'Delivered orders = 5,000 − 1,000 = 4,000. Variable guarantee cost = ($2 + $1) × 4,000 = $12,000. Exclude the fixed advertising fee and unchanged manufacturing costs.','Require selection of the charged orders and variable cost components while excluding a fixed fee.')
cases={
37:('Grove Coffee publishes verified prices and wait times in its advertisements.','Which type of advertising is this?','Publishing verifiable information reduces customers’ search costs.'),
38:('Grove Coffee publishes verified prices and wait times in its advertisements.','How can customers benefit directly?','Verified prices and wait times help customers find an offer that better fits their needs, reducing search costs.'),
40:('Halo Cosmetics advertises its brand as a status symbol without providing new performance information.','Which type of advertising is this?','The campaign aims to change perceptions rather than communicate new product facts.'),
41:('Halo Cosmetics advertises its brand as a status symbol without providing new performance information.','What is a likely direct effect?','Changed perceptions may raise willingness to pay and shift demand; they do not prevent entry or guarantee lasting profit.'),
43:('Indigo Dental advertises a costly long-term warranty that would be expensive to honor if its work were poor.','What economic role can this warranty play?','A warranty is a credible quality signal when poor-quality providers would face higher costs of honoring it.'),
44:('Indigo Dental advertises a costly long-term warranty that would be expensive to honor if its work were poor.','What can the warranty communicate to potential customers?','The warranty can signal confidence in consistent quality because poor results would create costly claims.'),
46:('Jade Delivery pays the same annual sponsorship fee regardless of how many deliveries it makes.','How should the fee be classified?','The fee is fixed with respect to output.'),
47:('Jade Delivery adds an annual sponsorship fee that is the same at every output level.','Holding output and all other costs constant, what happens to its cost curves?','The fixed fee raises total cost and ATC at any positive output, but does not change the cost of an additional delivery, so MC is unchanged.'),
49:('Kestrel Meals pays a referral platform $2 for each order it receives.','How should this payment be classified?','The payment varies directly with the number of orders, making it a variable selling cost.'),
50:('Kestrel Meals begins paying a referral platform $2 for every order.','Holding all other costs constant, how does this affect its cost curves?','The extra $2 per order raises marginal cost, average variable cost, and average total cost by $2.')}
for n,(intro,ask,fb) in cases.items(): edit(f'P62H-MCMP-B3-{n:03}','Make the checkpoint fully standalone, replacing the case label or missing antecedent.',q=intro+' '+ask,feedback=fb)
replace('P62H-MCMP-H-036','Refer to the graph. How does the monopolistically competitive firm’s price compare with marginal cost, and how would this differ for a perfectly competitive firm in long-run equilibrium?', ['The markup is $8; the competitive firm also prices above marginal cost.','The markup is $12; the competitive firm also prices above marginal cost.','The markup is $12; the competitive firm’s price equals marginal cost.','The markup is $8; the competitive firm’s price equals marginal cost.'],2,B['P62H-MCMP-H-036']['q']['feedback'],'Follow the faculty’s price-comparison task with parallel distractors.')
stem('PM6-MON-R-010','What must accompany a single seller for its monopoly power to persist?')
key('PM6-MON-BR-012','Natural monopolies can achieve efficient scale but still have market power.')
key('PM6-MON-M-001','One seller today does not establish lasting monopoly power.')
key('PM6-MON-M-004','Control of the essential input prevents rival entry.')
id='PM6-MON-M-005'; opts=B[id]['q']['options'].copy(); opts[2]='The provider earns positive marginal revenue from every unit, regardless of market demand.'; edit(id,'Expand faculty-specified option C into a complete economic claim.',options=opts)
key('PM6-MON-H-006','Low entry barriers make future competition plausible.')
key('PM6-MON-H-009','The franchise blocks entry; demand still limits profitable pricing.')
key('P62G-MON-R-005','Raise total revenue and lower total cost')
key('PM6-MON-BR-020','A price taker keeps price fixed; a monopolist cuts price to sell more.')
key('P62G-MON-E-008','Price')
stem('P62G-MON-E-035','Refer to the graph. What quantity will the monopolist choose?')
stem('P62G-MON-E-041','Refer to the graph. What output does the unregulated monopolist choose?')

if __name__=='__main__': save()
