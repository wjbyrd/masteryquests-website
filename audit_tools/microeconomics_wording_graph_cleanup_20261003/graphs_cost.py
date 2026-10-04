from common import *
p=paired
p('P62E-COP-L-091','Refer to the graph. At Q=40, which ordering holds, and what does it imply about a small increase in output?',
 'AVC < MC < AC; AVC rises while AC falls.','MC < AVC < AC; both averages fall.',
 'AVC < MC < AC; AVC falls while AC rises.','MC < AVC < AC; both averages rise.',
 'At Q=40, MC lies above AVC but below AC. A marginal cost above an average pulls that average up; a marginal cost below an average pulls it down. Thus AVC rises and AC falls.',
 'At Q=40 the red MC curve lies between purple AVC and blue AC.','Apply marginal-average relationships to two cost measures.')
p('P62E-COP-H-035','Refer to the graph. At Q=420, is MC above or below $20, and what does its position relative to AC imply as output increases?',
 'MC is above $20 and above AC, so AC rises.','MC is below $20 and below AC, so AC falls.',
 'MC is above $20 and above AC, so AC falls.','MC is below $20 and below AC, so AC rises.',
 'At Q=420, MC is above the $20 crossing and above AC. The next units cost more than the existing average, raising AC.',
 'At Q=420, MC exceeds $20 and AC.','Use marginal cost to infer the direction of average cost.')
for i in ['P62E-COP-H-038','P62E-COP-H-039','P62E-COP-L-053','P62E-COP-M-024','P62E-COP-H-019','P62E-COP-B2-034']:
 cost3=O[i]['image'].endswith('COST-03.webp');gap=400 if cost3 else 240;alt=200 if cost3 else 120
 stem='Refer to the graph. What is the vertical difference between total cost and total variable cost, and why does it remain at that amount as output changes?'
 if i.endswith('H-039'):stem='Refer to the graph. What cost remains when output is zero, and how does it relate to the gap between total cost and total variable cost at positive output?'
 p(i,stem,f'${gap} of total fixed cost; TC equals TVC plus this constant amount.',f'${alt} of total fixed cost; TC equals TVC plus this constant amount.',f'${gap} of marginal cost; TC equals TVC plus the cost of the next unit.',f'${alt} of marginal cost; TC equals TVC plus the cost of the next unit.',
 f'The horizontal fixed-cost line is at ${gap}. '+('At Q=120, TC=$1,200 and TVC=$800.' if cost3 else 'TC starts at $240 while TVC starts at zero.')+f' Their difference is ${gap} at every output because TC=TVC+TFC. This is a total, not a marginal or per-unit cost.',
 f'TFC line and TC intercept ${gap}; '+('A=$1200,B=$800 at Q=120.' if cost3 else 'Constant vertical gap $240.'),'Identify the fixed component of total cost and explain why it does not vary with output.')
p('P62E-COP-H-041','Refer to the total-product graph. When labor increases from 10 to 12 workers, which approximate output change and marginal-product interpretation are correct?',
 'Output falls from about 150 to 132; marginal product over the interval is negative.',
 'Output rises from about 132 to 150; marginal product over the interval is positive.',
 'Output falls from about 150 to 132; marginal product over the interval is positive.',
 'Output rises from about 132 to 150; marginal product over the interval is negative.',
 'TP is about 150 at 10 workers and 132 at 12. Adding labor reduces total output, so the marginal product over that interval is negative. A falling TP curve does not mean total output is itself negative.',
 'TP(10)≈150, TP(12)≈132.','Distinguish the sign of additional output from the level of total output.','(132-150)/(12-10)≈-9')
p('P62E-COP-EL-037','A manager claims that diminishing marginal product begins only when total output falls. Which labor interval in the graph and diagnosis challenge the claim?',
 'From 6 to 8 workers, TP rises with a declining slope; diminishing MP need not be negative MP.',
 'From 2 to 4 workers, TP rises with a declining slope; diminishing MP need not be negative MP.',
 'From 6 to 8 workers, TP rises with a declining slope; diminishing MP means total output is already falling.',
 'From 2 to 4 workers, TP rises with a declining slope; diminishing MP means total output is already falling.',
 'The curve is still rising but flattening between 6 and 8 workers. Additional workers add output, but by smaller amounts. Diminishing marginal product begins before negative marginal product and the decline in TP beyond the peak.',
 'TP is concave and increasing from L=6 to 8, whereas it steepens from 2 to 4.','Diagnose confusion between diminishing and negative marginal product.')
p('P62E-COP-L-095','A firm adds one worker beyond the total-product maximum in the graph. Which worker is this, and what can be inferred about marginal and average product?',
 'The 11th worker; MP is negative but AP remains positive.','The 13th worker; MP is negative but AP remains positive.',
 'The 11th worker; both MP and AP must be negative.','The 13th worker; both MP and AP must be negative.',
 'TP peaks at 10 workers. The 11th worker lowers TP, giving negative MP, but TP remains positive. AP=TP/L therefore remains positive. Marginal and average product need not have the same sign.',
 'TP peak at L=10, positive TP at L=11.','Distinguish the marginal contribution of an extra worker from average output.')
for i,l,mp,ap,rise in [('P62E-COP-H-042',3,19,13,True),('P62E-COP-H-043',8,13,17,False)]:
 correct='AP rises' if rise else 'TP rises while AP falls';wrong='AP falls' if rise else 'TP falls while AP rises'
 p(i,f'Refer to the MP–AP graph. At {l} workers, which approximate readings and implication of a small increase in labor are correct?',f'MP≈{mp} and AP≈{ap}; {correct}.',f'MP≈{mp+4} and AP≈{ap+4}; {correct}.',f'MP≈{mp} and AP≈{ap}; {wrong}.',f'MP≈{mp+4} and AP≈{ap+4}; {wrong}.',
 f'At L={l}, MP is about {mp} and AP about {ap}. '+('MP exceeds AP, so additional output per worker pulls the average up.' if rise else 'MP is positive but below AP. More labor adds to TP while pulling average product down.'),
 f'MP({l})≈{mp}, AP({l})≈{ap}.','Use the level of MP and its relation to AP to infer changes in product measures.')
p('P62E-COP-EL-039','A manager says positive output per worker proves that more labor raises total output. Use the graph at 10.5 workers to assess that claim.',
 'AP is about 15 while MP is below zero; total output is falling despite positive average output.',
 'AP is about 12 while MP is below zero; total output is falling despite positive average output.',
 'AP is about 15 while MP is below zero; positive AP proves that total output is rising.',
 'AP is about 12 while MP is below zero; positive AP proves that total output is rising.',
 'At 10.5 workers, the AP curve is near 15 while MP is negative. AP measures the positive level TP/L; MP measures the effect of more labor. Positive AP therefore does not refute falling TP.',
 'At L=10.5 AP≈15 and MP<0.','Diagnose confusing average output with the marginal effect of hiring.')
for i in ['P62E-COP-B1-020','P62E-COP-EL-040']:
 p(i,'Refer to the MP–AP graph. At approximately what labor input does MP cross AP from above, and what does that crossing imply?',
 'Seven workers; AP changes from rising to falling and reaches its maximum.','Five workers; AP changes from rising to falling and reaches its maximum.',
 'Seven workers; AP changes from falling to rising and reaches its minimum.','Five workers; AP changes from falling to rising and reaches its minimum.',
 'MP crosses AP from above near L=7. Before the crossing, the marginal worker produces more than the average and raises it; afterwards the marginal worker produces less and lowers it. AP is maximized at the crossing.',
 'MP–AP crossing near L=7.','Explain the average-product turning point using marginal contributions.')
p('P62E-COP-B2-038','Refer to the MP–AP graph. At eight workers, which approximate marginal product and comparison of product maxima are correct?',
 'MP is about 13; AP has passed its maximum, while TP has not.','MP is about 10; AP has passed its maximum, while TP has not.',
 'MP is about 13; TP has passed its maximum, while AP has not.','MP is about 10; TP has passed its maximum, while AP has not.',
 'At L=8, MP≈13 is positive and below AP≈17. AP is already falling, but positive MP means TP still rises. Their maxima occur at different labor inputs.',
 'At L=8 MP≈13, AP≈17; MP zero near 10.','Distinguish average-product and total-product maxima.')
p('P62E-COP-L-026','Refer to the MP–AP graph. Between which two worker counts does MP cross AP, and why does the crossing locate the average-product maximum?',
 'Between four and five; marginal output switches from pulling the average up to pulling it down.',
 'Between five and six; marginal output switches from pulling the average up to pulling it down.',
 'Between four and five; equality of marginal and average output makes total output zero.',
 'Between five and six; equality of marginal and average output makes total output zero.',
 'MP is above AP at four workers and below AP at five, placing the plotted crossing between them. A marginal value above an average raises it; a marginal value below lowers it. Equality does not imply zero TP.',
 'MP/AP at L=4:12/≈11.5; at L=5:10/≈11.2.','Explain the MP–AP crossing as a change in its effect on the average.')
p('P62E-COP-B1-018','Refer to the graph. Which added worker first has a lower marginal product than the previous worker, and what does that change indicate?',
 'The fourth worker; diminishing marginal product begins.','The fifth worker; diminishing marginal product begins.',
 'The fourth worker; total output becomes negative.','The fifth worker; total output becomes negative.',
 'MP rises to 14 for the third worker, then falls to 12 for the fourth. This is the first decline in additional output. MP remains positive, so TP continues to rise.',
 'MP sequence 8,12,14,12,10,8,6,4.','Identify diminishing marginal product without confusing it with negative output.')
for i,vals in [('P62E-COP-L-025',(47,56,63)),('P62E-COP-M-021',(46,56,64))]:
 a,b,c=vals;m1=b-a;m2=c-b
 p(i,'Refer to the TP graph. Compare the contributions of the fifth and sixth workers. Which changes and production interpretation are correct?',
 f'They add {m1} and {m2} units; TP rises at a decreasing rate.',f'They add {m1+2} and {m2+2} units; TP rises at a decreasing rate.',
 f'They add {m1} and {m2} units; diminishing MP means TP falls.',f'They add {m1+2} and {m2+2} units; diminishing MP means TP falls.',
 f'TP at four, five and six workers is {a}, {b} and {c}. The marginal products are {m1} and {m2}. They remain positive but decrease, so TP continues rising more slowly.',
 f'TP(4)={a},TP(5)={b},TP(6)={c}.','Interpret diminishing positive MP from total-product increments.',f'{b}-{a}={m1};{c}-{b}={m2}')
p('P62E-COP-L-057','Refer to the TP graph. The firm hires an eighth worker at a positive wage. Which output change and production implication follow?',
 'Output falls from 62 to 60; this hire cannot be a way to produce additional output.',
 'Output falls from 64 to 62; this hire cannot be a way to produce additional output.',
 'Output falls from 62 to 60; the positive wage ensures that this hire increases output.',
 'Output falls from 64 to 62; the positive wage ensures that this hire increases output.',
 'TP falls from 62 at seven workers to 60 at eight, so the eighth worker has MP=−2. Paying more for labor on this segment lowers rather than expands production.',
 'TP(7)=62, TP(8)=60.','Connect negative marginal product to the inability to expand output by adding labor.','60-62=-2')
for i in ['P62E-COP-L-054','P62E-COP-H-018','P62E-COP-B2-035']:
 p(i,'Refer to the average-cost graph. Approximately how large is the ATC–AVC gap at Q=20, and why is the gap smaller at Q=70?',
 'About $12 per unit; the same fixed cost is spread over more units.','About $6 per unit; the same fixed cost is spread over more units.',
 'About $12 per unit; total fixed cost falls as output rises.','About $6 per unit; total fixed cost falls as output rises.',
 'At Q=20 the gap and the AFC curve are about $12; by Q=70 they are about $3.4. The gap is AFC=TFC/Q. With TFC=$240 unchanged, a larger denominator reduces fixed cost per unit.',
 'AFC≈12 at Q=20 and ≈3.4 at Q=70; same as ATC–AVC gaps.','Distinguish falling fixed cost per unit from falling total fixed cost.','240/20=12;240/70≈3.43')
for i,curve,q,alt in [('P62E-COP-H-017','AVC and ATC', (32,38),(25,30)),('P62E-COP-L-049','AVC and ATC',(32,36),(25,30)),('P62E-COP-M-026','AVC',32,25),('P62E-COP-B2-036','ATC',39,30)]:
 both=isinstance(q,tuple);read=f'roughly Q={q[0]} and Q={q[1]}, respectively' if both else f'roughly Q={q}';other=f'roughly Q={alt[0]} and Q={alt[1]}, respectively' if both else f'roughly Q={alt}'
 p(i,f'Refer to the graph. Where does MC cross {curve}, and what do the marginal-average relationships imply at the crossing'+('s?' if both else '?'),
 f'At {read}; each crossed average is at its minimum.',f'At {other}; each crossed average is at its minimum.',
 f'At {read}; each crossed average is at its maximum.',f'At {other}; each crossed average is at its maximum.',
 f'MC crosses {curve} at {read}. Before each crossing MC is below that average and pulls it down; after the crossing MC is above it and pulls it up. Thus the crossing identifies a minimum, not a maximum.',
 f'{curve} crossings at {read}.','Apply marginal-average logic to cost minima; distinguish the two minima where relevant.')
for i,q,actual,alt,result,bad in [
 ('P62E-COP-L-046',35,'AVC < MC < ATC','MC < AVC < ATC','AVC rises while ATC falls','AVC falls while ATC rises'),
 ('P62E-COP-L-047',50,'MC > ATC > AVC','ATC > MC > AVC','both averages rise','both averages fall'),
 ('P62E-COP-L-048',40,'MC < ATC','MC > ATC','ATC can still fall although MC is rising','ATC must rise whenever MC rises'),
 ('P62E-COP-H-013',35,'MC < ATC','MC > ATC','ATC continues falling','ATC rises simply because MC rises'),
 ('P62E-COP-L-045',25,'MC < AVC < ATC','AVC < MC < ATC','both averages fall','both averages rise')]:
 # Competing correct-theory reading uses a different output, not an inconsistent MC interpretation.
 altq=q-10 if i.endswith(('L-046','L-047')) else q-5
 p(i,f'Refer to the graph. Which statement correctly combines its reading at Q={q} with the marginal-average cost rule?',
 f'At Q={q}, {actual}; {result}.',f'At Q={q}, the same ordering first shown at Q={altq} has MC about $5 lower than plotted; {result}.',
 f'At Q={q}, {actual}; {bad}.',f'At Q={q}, the same ordering first shown at Q={altq} has MC about $5 lower than plotted; {bad}.',
 f'At Q={q}, the graph shows {actual}. A marginal cost below an average lowers it, while a marginal cost above an average raises it. Therefore {result}. A rising MC by itself does not determine whether an average rises.',
 f'At Q={q}, {actual}.','Use marginal-average comparisons rather than the direction of MC alone.')
# Replace the five competing readings above with specific, graph-plausible values.
for i,actual,other,good,bad,ev in [
 ('P62E-COP-L-046','MC is about $21','MC is about $19','AVC rises while ATC falls','AVC falls while ATC rises','Q=35: AVC≈18, MC≈21, ATC≈23'),
 ('P62E-COP-L-047','MC is about $46','MC is about $40','both AVC and ATC rise','both AVC and ATC fall','Q=50: MC≈46 above both averages'),
 ('P62E-COP-L-048','MC is about $34','MC is about $30','ATC falls because MC remains below it','ATC rises merely because MC is rising','Q=40: MC≈34 below ATC≈38'),
 ('P62E-COP-H-013','MC is about $22','MC is about $18','ATC falls because MC remains below it','ATC rises merely because MC is rising','Q=35: MC≈22 below ATC≈27'),
 ('P62E-COP-L-045','MC is about $17','MC is about $15','both AVC and ATC fall','both AVC and ATC rise','Q=25: MC≈17 below AVC≈21 and ATC≈30')]:
 x=P[i];p(i,x['q'],f'{actual}; {good}.',f'{other}; {good}.',f'{actual}; {bad}.',f'{other}; {bad}.',ev+'. '+good.capitalize()+'. A marginal cost below an average lowers it; a marginal cost above an average raises it.',ev,'Apply marginal-average logic, including why rising MC need not raise ATC.')
p('P62E-COP-L-058','Refer to the LRATC graph. Between which outputs is average cost constant, and how should the regions on either side be interpreted?',
 'About 45 to 80; economies of scale precede this interval and diseconomies follow it.',
 'About 30 to 60; economies of scale precede this interval and diseconomies follow it.',
 'About 45 to 80; diseconomies of scale precede this interval and economies follow it.',
 'About 30 to 60; diseconomies of scale precede this interval and economies follow it.',
 'LRATC falls until about Q=45, is flat through Q=80, then rises. Falling, constant and rising long-run average cost represent economies, constant returns and diseconomies of scale, respectively.',
 'LRATC flat from approximately Q=45 to Q=80.','Distinguish scale economies, constant returns and diseconomies.')
for i in ['P62E-COP-B3-054','P62E-COP-L-059']:
 p(i,'Refer to the LRATC graph. What output is marked, and what does it represent for the firm’s scale?',
 '60 units; minimum efficient scale.','80 units; minimum efficient scale.',
 '60 units; the largest output the firm is technologically able to produce.','80 units; the largest output the firm is technologically able to produce.',
 'The marker is at Q=60, the lowest point of LRATC. Minimum efficient scale is the smallest output attaining minimum long-run average cost; it is not a technological capacity ceiling.',
 'Marked LRATC minimum at Q=60.','Interpret minimum efficient scale rather than maximum feasible production.')
p('P62E-COP-L-060','Refer to the plant-cost graph. At Q=75, which available plant has the lowest average cost, and how should a firm able to choose its plant use that comparison?',
 'Plant 3; choose the lowest available plant cost at the required output.','Plant 2; choose the lowest available plant cost at the required output.',
 'Plant 3; average all three plant costs to find the cost of the best plant.','Plant 2; average all three plant costs to find the cost of the best plant.',
 'At Q=75, SRATC3 lies below SRATC2 and SRATC1. The least-cost plant choice uses the minimum available cost at that output, not the mean of plant costs.',
 'At Q=75, SRATC3 is below the other available plants.','Choose plant scale by the lowest attainable average cost at the required output.')
p('P62E-COP-L-052','Refer to the shift from MC1 to MC2. At Q=20, approximately how does marginal cost change, and what productivity inference follows if the wage is fixed and labor is the variable input?',
 'From $14 to $4; marginal product rises.','From $18 to $8; marginal product rises.',
 'From $14 to $4; marginal product falls.','From $18 to $8; marginal product falls.',
 'At Q=20, MC1 is about $14 and MC2 about $4. With a fixed wage and labor as the variable input, MC=w/MP. Lower marginal cost therefore corresponds to higher marginal product, not a reduction in fixed cost.',
 'At Q=20, MC1≈14 and MC2≈4.','Use the inverse relationship between MP and MC at a fixed wage.')
save();print('Graph proposals prepared:',len(R))
