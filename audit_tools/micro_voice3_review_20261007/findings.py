"""Review proposals only. Never writes canonical bank data."""
import pathlib,json
D=pathlib.Path(__file__).resolve().parent
records=json.loads((D/'records.json').read_text(encoding='utf-8')); by={r['id']:r for r in records}; findings={}
def add(id,patterns,reason,*,stem=None,key=None,options=None,feedback=None,recommendation=None):
 r=by[id];assert r['areas']==['micro'] and not r['marketGateDerived'],id
 p=findings.setdefault(id,{'id':id,'patterns':[],'reason':[],'proposed':{}})
 for x in patterns.split('; '):
  if x not in p['patterns']:p['patterns'].append(x)
 p['reason'].append(reason)
 if stem is not None:p['proposed']['q']=stem
 if options is not None:p['proposed']['options']=options
 if key is not None:
  p['proposed']['options']=p['proposed'].get('options',r['q']['options']).copy();p['proposed']['options'][r['key']]=key
 if feedback is not None:p['proposed']['feedback']=feedback
 if recommendation:p['recommendation']=recommendation

add('P77-MFAIL-H-011','Meta/textbook','The question concerns market failure itself; textbook adds course framing.',stem='A city dislikes unequal restaurant access. What must be shown to establish market failure?')
add('PM7-MCMP-M-043','Meta/textbook','The national-versus-local market distinction matters; attributing the classification to a textbook does not.',stem='An industry is classified as monopolistically competitive because it has many differentiated sellers. In one rural town, however, only two sellers actually serve customers. What is the best caution?')
add('P62F-PC-L-087','Meta/textbook','Name the competitive benchmark directly rather than labeling it textbook.',key='Realized total surplus may fall short of the competitive benchmark.')
add('P62B-ELAS-EL-018','AI abstraction','Market configuration can be replaced with the relevant economic characteristics.',stem='A carbon tax is intended to reduce emissions. Which combination of demand and supply elasticities creates the strongest quantity response to a given tax wedge?')
add('P62G-MON-R-001','Answer-choice parallelism','The key explains easy entry at greater length than the alternatives; retain the explanation in feedback.',key='No; easy entry may make its position temporary.')
add('P62C-CPS-H-008','Answer-choice parallelism','The keyed answer includes the graph explanation and result; feedback already explains value versus cost.',key='Omitting them loses $4 of total surplus.')
add('P62C-CPS-H-009','Answer-choice parallelism','Move the marginal-cost explanation into feedback, leaving the welfare result as the answer.',key='Producing them destroys $4 of total surplus.')
add('P62C-CPS-H-019','Answer-choice parallelism','The correct answer is substantially longer; its three welfare results can be stated concisely without losing any.',key='CS and PS fall; total surplus falls to $36.')
add('P62C-CPS-L-074','Answer-choice parallelism','The key repeats willingness-to-pay wording and adds reading length without another economic step.',key='Measured willingness to pay reflects ability to pay.')
add('P62C-CPS-B1-018','Meta/model wording; Answer-choice parallelism','The qualifier under the standard model is generic course framing inside the key; preserve it in feedback.',key='The last unit’s value equals its cost.',feedback='Under the standard competitive model, efficiency is determined at the margin: the last unit’s value equals its cost.')
add('P62C-CPS-B3-016','Answer-choice parallelism','The keyed option includes both the numeric result and the full transfer/forced-trade explanation. The feedback already contains the calculation.',options=['A yields $36 and B yields $32.','A yields $26 and B yields $22.','Both yield $26.','A yields $16 and B yields $12.'])
add('P62C-CPS-LB-024','Noun stack; Answer-choice parallelism','Ask directly for the change in total surplus and move explanations out of all four alternatives.',stem=by['P62C-CPS-LB-024']['q']['q'].replace('What is the combined total-surplus effect?','How much does total surplus change?'),options=['A $115 loss.','A $40 loss.','A $35 gain.','A $30 loss.'])
add('P62C-CPS-R-016','Answer-choice parallelism','The keyed no contains an explanation, while the yes alternatives are short price outcomes; the feedback already gives the reason.',key='No; there is no mutually acceptable price.')

add('PMS-CPS-BR-003','Answer-choice parallelism','Put the fixed willingness-to-pay condition in the stem, then give only the surplus result.',stem='A price decrease lets an existing buyer pay less for the same unit, with willingness to pay unchanged. What happens to that buyer’s surplus?',key='It rises by the amount of the price decrease.')
add('42653','Answer-choice parallelism','The key lists all three possible rankings; a concise statement of indeterminacy conveys the same result.',key='The information does not determine their relative ranking.')
add('42705','Answer-choice parallelism','The key explains the interior tangency condition at length; state the necessary condition directly.',key='No. An interior optimum also requires MRS = Px/Py.')
add('42666','Answer-choice parallelism','The stem already establishes equally ranked endpoints and mixtures; avoid repeating that setup in the key.',key='No. Strict convexity requires an interior mixture to be preferred to both endpoints.')
add('42701','Answer-choice parallelism','Retain the corner solution and tangency exception; put the utility-per-dollar explanation in feedback.',key='All-X is optimal; tangency is not required at a corner.')
add('42617','Answer-choice parallelism','The comparison already gives the quantity result; the because clause belongs in feedback.',key='Four X; the maximum at four Y falls from 5⅓ to 4.')
add('PMC-COP-M-086','Answer-choice parallelism','The explanation that the fee is fixed is already given in the stem and belongs in feedback.',key='MC is unchanged.')
add('PMC-COP-M-110','Answer-choice parallelism','The keyed action carries a sunk-cost explanation plus the incremental comparison. Keep the decision and one concise reason.',key='Buy the update; its benefits exceed its additional cost.')
add('PMC-COP-H-115','Answer-choice parallelism','Move the sunk editing-cost explanation from the keyed numeric outcome to feedback, preserving the comparison with not printing.',key='Printing raises profit by $3,000 relative to not printing.')
add('P62E-COP-EL-001','Answer-choice parallelism','The positive accounting profit is already in the stem; remove that redundant contrast from the keyed result.',key='Economic profit is −$5,000.')
add('P62E-COP-EL-008','Answer-choice parallelism','State the three affected curves and common change concisely; the per-unit condition is already in the stem.',key='AVC, ATC and MC each rise $4.')
add('P62E-COP-EL-010','Answer-choice parallelism','The repeated falling-ATC result is explanatory; the decisive comparison is MC below ATC.',key='MC remains below ATC.')
add('PMC-COP-R-010','Answer-choice parallelism','The stem already says no check was written; do not repeat that condition in a long keyed answer.',key='Owner-supplied resources may still have opportunity costs.')
add('PMC-COP-R-025','Answer-choice parallelism','Remove repeated zero-economic-profit framing while preserving explicit costs, implicit costs and normal profit.',key='Revenue covers explicit and implicit costs, including normal profit.')
add('PMC-COP-R-068','Answer-choice parallelism','Leave the fixed-cost-spreading explanation in feedback and state the corrected cost-curve outcome.',key='AFC continues falling as output increases.')
add('PMC-COP-R-118','Answer-choice parallelism','All necessary sunk-cost conditions are in the stem; the key should give the decision rule.',key='Exclude the payment from the comparison.')
for id,stem in {
 '42582':'Income falls, moving the budget line from BC0 to BC1. What is the maximum amount of cereal the consumer can buy?',
 '42570':'The budget line changes from BC0 to BC1. At six yogurts, how much cereal is affordable on BC1?',
 '42576':'The budget line changes from BC0 to BC1. At four yogurts, how much cereal lies on BC1?',
 '42580':'The budget line changes from BC0 to BC1. What happens to purchasing power?'
}.items():add(id,'Graph state','Name the initial and final budget lines; new line or after the shift otherwise leaves the chronology implicit.',stem=stem)

add('P62B-ELAS-L-060','Answer-choice parallelism','The key repeats the comparison already made in the stem.',key='Labor demand is more elastic in that industry.')
add('P62B-ELAS-B3-005','Answer-choice parallelism','Keep the marginal-revenue link but move the additional output-reduction explanation into feedback.',key='Reject it; marginal revenue is negative, so a small output expansion reduces total revenue.')
add('P62B-ELAS-LB-036','Answer-choice parallelism','The key repeats innovation and relocation from the stem before giving the elasticity conclusion.',key='Long-run demand may be more elastic than the first-month estimate.')
add('42389','Answer-choice parallelism','Give the two hiring decisions in the answer and leave the marginal-revenue calculations in feedback.',key='Hire the worker adding 22 parcels; do not hire the one adding 14.')
add('42487','Answer-choice parallelism','The question asks for the input relationship; the labor-demand consequence is an extra explanation.',key='Robots substitute for those workers.')
for id in ['42871','42875','42879','42867']:
 add(id,'Answer-choice parallelism','The key names a benefits cliff and then explains it, while the alternatives name policy types. The mechanism is already in the stem.',key='A benefits cliff.')
add('42809','Answer-choice parallelism','Keep the wealth and capital-income distinction without repeating the claim about equal wages.',key='The wealth gap and associated capital-income gap remain.')
add('42765','Answer-choice parallelism','The question asks only for the share ratio; move the unasked Gini qualification and calculations into feedback, and make all four options parallel.',options=['It falls from 9 to 8.','It falls from 9 to 4.','It rises from 9 to 10.','It stays at 9.'])
for id in ['43055','43059','43051','43047']:
 add(id,'Answer-choice parallelism','State the convergence tendency directly; the feedback explains the incentive.',key='Both tend toward the median voter.')
add('43051','Meta/model wording','Classroom example is unnecessary course framing.',stem='Two office-seeking candidates care only about winning, and voters choose the closer one on a single policy dimension. What tendency follows?')
add('43058','Meta/model wording','Remove classroom framing while keeping the single-peaked, one-dimensional, majority-rule assumptions.',stem='Voters have single-peaked preferences over one tax-rate line and choose by majority rule. Which position is pivotal?')
add('42987','Answer-choice parallelism','The key states a challenged claim at much greater length than the alternatives; the explanation belongs in feedback.',key='The claim that choice architecture is irrelevant.')
add('42097','AI abstraction','Shifting the private consumption incentive is abstract wording for the tax already specified.',stem='With the $2 vaping tax shown in the graph, what quantity is traded?')
for id in ['P62G-MON-EL-019','P62G-MON-EL-022']:
 add(id,'Noun stack','Unpack standard output-restriction DWL into a direct description of the welfare loss.',key='Add to social cost beyond the loss from restricted output.')
add('P62G-MON-R-014','Answer-choice parallelism','The correct classification carries a because clause; the other options are short classifications.',key='Allocative inefficiency.')
add('PM6-MON-M-058','Answer-choice parallelism','Nonbinding and does not constrain the chosen price repeat the same conclusion.',key='The cap is nonbinding.')
add('P62I-OLI-LB-011','Answer-choice parallelism','The final sentence repeats what the two numerical results already show; keep the explanation in feedback.',key='Both give CR4 = 100%; A raises HHI by 594 and B by 408.')
add('PM8-OLI-BR-052','Meta/model wording; Answer-choice parallelism','Ask about the economic application directly, rather than a learner’s next curriculum step.',stem='Firms compete through quality or advertising rather than prices. How should they account for rivals?',key='Anticipate rivals’ responses to these nonprice actions.')
add('PM5-PC-BR-015','Meta/model wording','Prior market concept describes curriculum sequencing instead of asking the economic question directly.',stem='Why can an individual competitive firm face a horizontal demand line even though market demand slopes downward?')
add('PM5-PC-BR-036','Answer-choice parallelism','The key repeats the setup about measuring a loss; give the required comparison directly.',key='Compare price with AVC.')
for id,key in {'P62F-PC-LB-001':'Output remains 4; profit changes from $10 to −$5.','P62F-PC-LB-005':'Output remains 5; profit changes from −$30 to −$45.'}.items():
 add(id,'Answer-choice parallelism','Retain both the output and profit comparisons, moving the fixed-versus-marginal-cost explanation to feedback.',key=key)
add('P62F-PC-LB-004','Answer-choice parallelism','The final so clause restates the implications of the output and profit results.',key='Output changes from 0 to 1; profit changes from −$30 to −$29.')

# Add only initial conditions when identifying the shift is part of the task.
for ids,start in [
 (['42342','42335','42331','42337','42341'],'The market begins where D L0 and S L intersect. '),
 (['42350','42361','42353'],'The market begins where S L0 and D L intersect. '),
]:
 for id in ids:add(id,'Graph state','State the initial curves explicitly while leaving the economic cause and direction for the student to determine.',stem=start+by[id]['q']['q'])
for id,stem in {
 '42348':'Healthcare labor supply shifts right from S L0 to S L1, with D L unchanged. What is the new equilibrium?',
 '42356':'Construction labor supply shifts left from S L0 to S L1, with D L unchanged. What is the new equilibrium?',
 '42338':'Labor demand shifts from D L0 to D L1, with S L unchanged. How much does equilibrium employment rise? Why is this less than the increase in labor demanded at the original wage?',
 '42345':'Labor demand shifts from D L0 to D L1, with S L unchanged. By how much does the equilibrium wage fall?',
 '42347':'Orchard labor demand shifts from D L0 to D L1, with S L unchanged. Which adjustment carries the market from the initial to the resulting equilibrium?',
 '42357':'Labor supply shifts from S L0 to S L1. What are the new wage and employment? Does the adjustment shift labor demand or move the market along it?',
 '42349':'Labor supply shifts from S L0 to S L1. What are the new wage and employment? Does the adjustment shift labor demand or move the market along it?',
 '42359':'Construction labor supply shifts from S L0 to S L1, with D L unchanged. How many fewer workers are employed at the new equilibrium?',
 '42362':'Construction labor supply shifts from S L0 to S L1, with D L unchanged. How much higher is the new equilibrium hourly wage?',
 '42381':'The market begins where D L0 and S L0 intersect. Demand and supply increase to D L1 and S L1. What is the new wage shown? Must simultaneous increases always have this effect on wages?',
 '42383':'The market begins where D L0 and S L0 intersect. Demand and supply increase to D L1 and S L1. What is the new equilibrium wage, and what can be concluded about other markets with these two shifts?',
 '42339':'Orchard labor demand shifts left from D L0 to D L1, with S L unchanged. What equilibrium does the graph show?',
 '42351':'Healthcare labor supply shifts from S L0 to S L1, with D L unchanged. How many additional workers are employed at the new equilibrium?',
 '42363':'Labor supply changes from S L0 to S L1. A student says this shows only the effect of a change in wages. Compare labor supplied on the two curves at $20. Does that comparison support the claim?',
 '42344':'Demand shifts from D L0 to D L1 while S L is unchanged. The wage initially remains $20. How large is the labor shortage or surplus, and which way will it push wages?',
 '42352':'Supply shifts from S L0 to S L1 while D L is unchanged. The wage initially remains $20. How large is the labor surplus, and which way will it push wages?',
 '42360':'Supply shifts from S L0 to S L1 while D L is unchanged. The wage initially remains $20. How large is the shortage of labor, and which way will it push wages?',
 '42355':'Labor supply shifts from S L0 to S L1. What are equilibrium employment before and after the shift? Does this adjustment shift labor demand or move the market along it?',
 '42379':'The nursing labor market begins where D L0 and S L0 intersect. Demand and supply then shift to D L1 and S L1. What new equilibrium does the graph show?',
 '42330':'Warehouse labor demand shifts from D L0 to D L1, with S L unchanged. What is the new equilibrium?',
 '42332':'Warehouse labor demand shifts from D L0 to D L1, with S L unchanged. How many additional workers are employed at the new equilibrium?',
 '42336':'Demand shifts from D L0 to D L1, with S L unchanged. At the original $20 wage, what does the graph imply?',
 '42343':'Labor demand falls from D L0 to D L1, with S L unchanged. What is the new equilibrium employment? Could a 20% fall in every worker’s marginal product, combined with a 25% rise in the competitive output price, explain this shift?'
}.items():add(id,'Graph state','Name the initial and resulting curves instead of relying on curve subscripts or old/new language to establish chronology. Preserve the plotted graph and all requested reasoning.',stem=stem)

add('P62H-MCMP-BR-019','AI abstraction','Central strategic interdependence is an awkward abstraction; state what the firms do.',key='Many firms make decisions without focusing on particular rivals.')
# Preserve explanations explicitly when the original feedback omits part of the removed clause.
for id,extra in {
 'PMC-COP-M-110':'The original $40,000 is sunk and does not change with the update decision.',
 'PMC-COP-H-115':'The $25,000 editing cost is sunk and is incurred whether or not the book is printed.',
 'PMC-COP-R-068':'With fixed cost unchanged, AFC = fixed cost divided by output, so it falls as output rises.',
 'P62C-CPS-B3-016':'The common $10 transfer changes distribution, not total surplus.',
 'P62G-MON-R-014':'Some buyers value additional output above its marginal cost, but those trades do not occur.'
}.items():findings[id]['proposed']['feedback']=by[id]['q']['feedback']+' '+extra

def save():
 for id,p in findings.items():
  q={**by[id]['q'],**p['proposed']};assert q!=by[id]['q'] or p.get('recommendation');assert len(set(q['options']))==4
 (D/'findings.json').write_text(json.dumps(list(findings.values()),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'confirmed':len(findings)}))
if __name__=='__main__':save()
