from author import *

for id in ['ECON-EC-LEGENDARYBOSS-20022','ECON-EC-LEGENDARYBOSS-20023']:
    edit(id,'Faculty explicitly requests Macro placement. Move the same ID from integrated-economic-analysis/legendaryBoss to integrated-macroeconomic-analysis/legendaryBoss, preserving the legendary boss role and original skill structure. This is a documented course-area count exception, not a deletion or new ID.',primaryConceptId='integrated-macroeconomic-analysis',move_to_concept='integrated-macroeconomic-analysis')
    required=['indexing-and-real-values','unemployment-measurement'] if id.endswith('20022') else ['unemployment-measurement','cpi-and-inflation-measurement','productivity-measurement']
    edit(id,'Map the moved boss into the existing Macro checkpoint supplement with explicit current concept prerequisites and remediation destination; retain all historical source metadata.',isCheckpointChallenge=True,challengeStage='legendary',requiredConceptIds=required,challengeFocusConceptIds=required,remediationConceptId=required[0],challengePathway='two-family-synthesis' if len(required)==2 else 'three-plus-family-synthesis',challengeSource='faculty-micro-remediation-20261006',challengeBossStage='final')
for id,text in {
'P62F-PC-H-043':'Refer to the graph. At Q = 50, what is the firm’s total revenue?',
'P62F-PC-E-036':'Refer to the graph. What output level minimizes the firm’s loss?',
'P62F-PC-E-042':'Refer to the graph. At the market price, what output level does the firm choose?',
'P62F-PC-E-043':'Refer to the graph. What price does the firm take from the market?',
'P62F-PC-E-044':'Refer to the graph. At the given market price, what output level minimizes losses?',
'P62F-PC-E-046':'Refer to the graph. At the long-run equilibrium price of $25, what output level does the firm choose?',
}.items(): stem(id,text)
# H-043 requires its firm-only graph variant before final disposition is complete.
replace('P62F-PC-EL-042','The graph shows total market output and the output of a representative firm. Why can’t these quantities alone tell you the exact number of firms in the market?', ['You would need to assume all firms charge different prices for the same product.','You would need to assume total market output equals one firm’s output.','You would need to assume all firms produce the representative firm’s quantity, using compatible units.','You would need to assume the market quantity measures the number of sellers.'],2,'Dividing market output by one firm’s output gives a firm count only if the units are compatible and every firm produces that amount. The representative-firm drawing alone does not establish those conditions.','Follow the faculty’s concept question, removing forced coordinate lookup and balancing the explanations.')
pc_cases=[('Delta Berries',18,20,[7,11,16,22,29,37]),('Harbor Salt',10,30,[5,12,17,23,30,38]),('Juniper Paper',40,40,[6,9,18,20,31,39]),('Keystone Tiles',6,25,[7,10,14,21,27,40]),('Lumen Glass',29,50,[5,11,15,22,28,35]),('Mesa Beans',18,55,[6,12,16,23,29,36]),('Northline Steel',8,3,[7,9,17,20,30,37]),('Orchard Fiber',22,30,[5,10,18,21,31,38])]
for n,(name,price,fixed,mc) in enumerate(pc_cases,3):
    id=f'P62F-PC-H-{n:03}'; profits=[price*q-fixed-sum(mc[:q]) for q in range(7)]; best=max(range(7),key=profits.__getitem__); correct=profits[best]
    def choice(q,val): return f'{"Shut down" if q==0 else "Produce "+str(q)+" units"}; economic {"profit" if val>=0 else "loss"} of ${abs(val)}.'
    opts=[choice(best,correct),choice((best+1)%7,profits[(best+1)%7]),choice(best,correct+fixed),choice((best-1)%7,profits[(best-1)%7])]
    # Rotate to preserve the existing key position without keeping a uniform key pattern.
    a=B[id]['answer']; opts=opts[1:a+1]+[opts[0]]+opts[a+1:]
    assert len(set(opts))==4
    replace(id,f'{name} is a price-taking firm facing price ${price}. Fixed cost is ${fixed} and is unavoidable this period. Marginal costs of units 1–6 are '+', '.join('$'+str(x) for x in mc)+'. Variable cost is zero at zero output. Which output and profit or loss should the firm choose?',opts,a,f'For quantities 0–6, profit is '+', '.join('$'+str(x) for x in profits)+f'. Its maximum is ${correct} at Q = {best}. Fixed cost remains payable even if the firm shuts down.','Vary the optimal quantity and the profit/loss/shutdown result across the faculty-flagged repeated family; independently evaluate every feasible output.')
replace('P62F-PC-L-091','Refer to the graph. What is the firm’s economic profit, and how should its output and profit be determined?', ['$400; use Q = 40 and multiply Q by P − ATC.','$500; choose minimum ATC and multiply Q by P − AVC.','$500; choose MR = MC and multiply Q by P − ATC.','$400; choose minimum ATC and multiply Q by P − AVC.'],2,B['P62F-PC-L-091']['q']['feedback'],'Use the faculty-requested question and parallel marginal-rule/cost-measure alternatives.')
for n in range(5,10):
    id=f'P62F-PC-C-{n:03}'; stem(id,B[id]['q']['q'].replace('Calculate the output selected by the marginal rule.','What profit-maximizing or loss-minimizing output will the firm choose?')); difficulty(id,'medium')
edit('P62F-PC-EL-016','Use plausible marginal-versus-average-cost confusions instead of terse distractors.',options=['Output falls until the higher ATC again equals price.','Output rises to spread the larger fixed cost over more units.','The firm shuts down because its total loss becomes larger.','Output is unchanged because MC and AVC are unchanged.'])
replace('P62F-PC-LB-018','A competitive firm has a minimum average variable cost of $14. Compare two separate cost increases: higher unavoidable fixed rent, or an extra $3 of variable cost on every unit. What is the shutdown-price threshold under each change, and which change shifts short-run supply?', ['$14 with higher rent and $17 with variable cost; only variable cost shifts supply.','$18 with higher rent and $21 with variable cost; only variable cost shifts supply.','$17 under either change; both changes shift supply.','$14 under either change; neither change shifts supply.'],0,'The shutdown threshold is minimum AVC. Higher fixed rent changes neither AVC nor MC, leaving the threshold at $14. Adding $3 to variable cost per unit raises AVC and MC by $3, so the threshold becomes $17 and short-run supply shifts upward.','Replace the graph with the faculty-supplied minimum AVC and make both comparative-static effects explicit.')
edit('P62F-PC-LB-018','Remove the now-unneeded graph and its graph-specific metadata.',remove_fields=['image','imageAlt','graphDescription','graphRequired','graphAccessible','graphAccessibility'])
difficulty('P62F-PC-LB-018','elite')

if __name__=='__main__': save()
