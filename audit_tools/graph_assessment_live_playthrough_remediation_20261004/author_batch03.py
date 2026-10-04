from review_tools import *
d=load()
for g in range(22,38):review(d,g,'Reviewed all current text, alternatives and explanations. Retain marginal-average reasoning and cost identities; remove artificial precise MC readings when curve ordering is sufficient. Standard applications do not justify Legendary.')
visual(d,range(22,37),'Inspected at 700px. Cost-curve labels remain distinguishable. Exact TP values used in subtraction and fixed cost $240 lack explicit numerical labels and require repair. MC near $19/$21 is unnecessarily close; replace that test with curve ordering.')
for g in [34,35,36,37]:
    d['assets'][INDEX[g]['asset']]={'visualReview':'Exact values needed for arithmetic are not labeled.','repairRequired':True,'issue':'Add required fixed-cost or total-product values; preserve original curves and inspect every shared user.'}
for id in ['P62E-COP-H-018','P62E-COP-B3-054','P62E-COP-L-026','P62E-COP-H-019','P62E-COP-L-057']:
    patch(d,id,tier='medium')
patch(d,'P62E-COP-L-025','How many units do the fifth and sixth workers each add? What does this imply about the rate at which total output is growing?',tier='hard')
patch(d,'P62E-COP-M-021','How many units do the fifth and sixth workers each add? What does this imply about the rate at which total output is growing?',tier='hard')
patch(d,'P62E-COP-L-053',tier='medium')
patch(d,'P62E-COP-L-052','Labor is the variable input and the wage stays fixed. At Q = 20, estimate marginal cost before and after the shift from MC1 to MC2. What does the change imply about marginal product?')
tasks=[
('P62E-COP-L-046',35,'AVC rises and ATC falls.',['Both AVC and ATC fall.','Both AVC and ATC rise.','AVC rises and ATC falls.','AVC falls and ATC rises.'],'MC lies above AVC but below ATC. Additional units raise AVC but lower ATC.','hard'),
('P62E-COP-L-047',50,'Both AVC and ATC rise.',['Both AVC and ATC fall.','AVC rises while ATC falls.','Both AVC and ATC rise.','AVC falls while ATC rises.'],'MC lies above both AVC and ATC, so additional units raise both averages.','hard'),
('P62E-COP-L-048',40,'ATC falls because MC is below ATC.',['ATC rises because MC is above ATC.','ATC rises because MC itself is rising.','ATC falls because MC itself is falling.','ATC falls because MC is below ATC.'],'Although MC is rising at Q = 40, it remains below ATC. An added unit costs less than the current average and lowers it.','medium'),
('P62E-COP-H-013',35,'ATC falls because MC is below ATC.',['ATC rises because MC is above ATC.','ATC rises because MC itself is rising.','ATC falls because MC is below ATC.','ATC falls because MC itself is falling.'],'At Q = 35, MC is rising but remains below ATC. Added units cost less than the current average, so ATC falls.','medium'),
('P62E-COP-L-045',25,'Both AVC and ATC fall.',['Both AVC and ATC fall.','AVC rises while ATC falls.','Both AVC and ATC rise.','AVC falls while ATC rises.'],'At Q = 25, MC is below both AVC and ATC, so an increase in output lowers both averages.','hard')]
for id,q,key,opts,fb,tier in tasks:
    two='AVC and ATC' if len(set(opts)) and 'Both' in opts[0] else 'ATC'
    patch(d,id,f'At Q = {q}, compare marginal cost with {two}. How would a small increase in output affect {two}?',tier,opts,fb,
          reason='Removed a closely spaced numerical MC lookup. The graph supplies relative curve positions needed to apply the marginal-average rule; difficulty follows the number of inferences.')
# Separate a graph-based diagnosis from the definitions that explain it.
patch(d,'P62E-COP-L-057','The firm pays a positive wage to hire an eighth worker. How does output change, and does this hire help the firm produce more?',options=[
'Output falls from 62 to 60; paying for the added worker reduces production.',
'Output falls from 64 to 62; paying for the added worker reduces production.',
'Output rises from 60 to 62; paying for the added worker expands production.',
'Output rises from 62 to 64; paying for the added worker expands production.'])
save(d)
