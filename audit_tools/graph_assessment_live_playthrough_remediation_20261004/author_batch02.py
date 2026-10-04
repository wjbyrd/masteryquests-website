from review_tools import *
d=load()
for g in range(10,22):review(d,g,'Read all options and feedback. Budget tasks require plotted constraints; marginal-average tasks require curve ordering. Standard two-step applications should not carry higher-tier labels. Remove arbitrary numerical appendages where a substantive comparison suffices.')
visual(d,range(10,22),'Inspected rendered contact sheets: plotted curves and intersections are readable. Budget assumptions need larger text in CHOICE-01 through 03 and a missing assumptions header in CHOICE-04. COST-05 has a visible below-zero MP segment; avoid precision estimates that serve no economic purpose.')
for g in range(10,14):
    d['assets'][INDEX[g]['asset']]['repairRequired']=True
    d['assets'][INDEX[g]['asset']]['issue']='Make original income $40, yogurt price $4, cereal price $8 legible; CHOICE-04 currently omits these required assumptions. Preserve all existing geometry and labels; inspect shared users.'
edits={
'42562':('Using bundle C and the prices shown, calculate how much more income the consumer would need to afford C if income rose to $52.','medium'),
'42569':(None,'hard'),
'42572':(None,'medium'),
'42574':('After the budget changes from BC0 to BC1, the consumer still wants one cereal box. What is the most yogurt the consumer can afford, and what determines that limit?','medium'),
'42575':('Only the yogurt price changes between BC0 and BC1. How much cereal could the consumer buy by spending all income on cereal, and why is this amount unchanged?',None),
'42577':('After the move from BC0 to BC1, income rises to $80 and prices stay at their BC1 levels. How much of each good could the consumer buy if all income were spent on that good? Has the original price ratio been restored?',None),
'42578':('Both prices stay at the values shown. How much income produces BC1, and why is BC1 parallel to BC0?',None),
'42581':(None,'hard'),
'42583':('Prices and tastes stay fixed as the budget changes from BC0 to BC1. The chosen bundle changes from four yogurts and three cereal boxes to six yogurts and one cereal box. How much did income change? Over this change, which good behaves as a normal good and which as an inferior good?',None),
'42586':('At X = 10, read the Y quantities on IC1 and IC2. If more of either good is preferred, why would a crossing of these curves contradict consistent preferences?',None),
'42591':(None,'medium'),
'42593':('The consumer initially chooses the best affordable bundle shown. An unrestricted cash grant makes IC3 attainable. A cereal-only voucher of equal face value improves on the initial choice but cannot reach IC3. What is the initial optimum, and which grant permits higher utility?','hard'),
'42601':(None,'medium'),
'42602':('The consumer wants 15 units of X and 15 units of Y. At X = 15, how much Y does the budget allow? Can the consumer afford the preferred bundle?',None),
'42605':('At the interior optimum shown, the price of X falls while income and the price of Y stay fixed. Find the original price ratio Px/Py. At the old bundle, how does the price cut change marginal utility per dollar and the incentive to buy X? Assume diminishing marginal utility and an interior new optimum.','hard'),
'P62E-COP-L-091':(None,'hard'),
'P62E-COP-H-038':(None,'medium'),
'P62E-COP-H-039':(None,'medium'),
'P62E-COP-EL-037':('A manager says marginal product cannot fall while total output is still rising. Which labor interval shown disproves that claim, and why?','medium'),
'P62E-COP-H-041':('As labor rises from 10 to 12 workers, what happens to total output? What does this tell you about the additional workers\u2019 marginal product?','medium'),
'P62E-COP-L-095':(None,'hard'),
'P62E-COP-B1-020':(None,'medium'),
'P62E-COP-B2-038':('At eight workers, estimate marginal product. Has average product already reached its maximum? Has total product?','hard'),
'P62E-COP-EL-039':('A manager says positive output per worker proves that hiring more labor raises total output. At 10.5 workers, does the graph support the claim?','hard'),
'P62E-COP-EL-040':('At what labor input does average product reach its maximum? Explain using the marginal product of workers added before and after that point.','medium'),
'P62E-COP-H-042':('At three workers, estimate marginal and average product. Would a small increase in labor raise or lower average product?','medium'),
'P62E-COP-H-043':('At eight workers, estimate marginal and average product. Would a small increase in labor raise or lower total product and average product?',None)}
for id,(stem,tier) in edits.items():patch(d,id,stem,tier)
patch(d,'P62E-COP-H-035',
      'At Q = 420, compare marginal cost with average cost. Would a small increase in output raise or lower average cost?',tier='medium',options=[
      'MC is below AC, so the extra units lower AC.','MC is above AC, so the extra units lower AC.',
      'MC is below AC, so the extra units raise AC.','MC is above AC, so the extra units raise AC.'],
      feedback='At Q = 420, MC lies above AC. The extra units cost more than the current average, so producing them raises average cost.',
      reason='Removed the unrelated $20 threshold. The graph now supplies the economically relevant MC-versus-AC ordering; Medium reflects one inference.')
# These require a point-labeled variant rather than approximate coordinate appendages.
for id in ['42585','42587','42588']:
    d['questions'][id]['pending']='Rewrite against a labeled CHOICE-05 variant: preserve indifference/convexity/ordinal utility respectively without arbitrary range lookup.'
save(d)
