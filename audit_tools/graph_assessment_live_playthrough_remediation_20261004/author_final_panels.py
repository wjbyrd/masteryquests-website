from review_tools import *
d=load()
patch(d,'P62F-PC-EL-043','Use the equilibrium price from the market panel to choose this firm\u2019s output. What output should it produce, and how do the two panels determine that decision?',options=[
'50 units; take market price as MR and choose the rising-MC intersection.',
'75 units; take market price as MR and choose the rising-MC intersection.',
'75 units; assign the market equilibrium quantity to each firm.',
'50 units; assign the market equilibrium quantity to each firm.'],correct_index=0,
feedback='The market panel gives price $25. In the firm panel, rising MC reaches $25 at Q = 50, so that is the profit-maximizing output. The market quantity is 100 thousand units, not the output of one firm.',
reason='Final hide-one-panel test: the earlier price-plus-rule alternatives still bypassed firm evidence. The final task requires market price and the actual rising-MC output from the firm panel; both panels are indispensable.')
patch(d,'P62F-PC-EL-018','Use the current market price to find this firm\u2019s profit-maximizing output. If market price then rises while costs stay fixed, how will the firm\u2019s revenue line and output change?',tier='hard',options=[
'About 80 units; the revenue line rises and output increases along unchanged MC.',
'About 61 units; the revenue line rises and output increases along unchanged MC.',
'About 61 units; higher price shifts MC upward while the revenue line stays fixed.',
'About 80 units; higher price shifts MC upward while the revenue line stays fixed.'],correct_index=1,
feedback='Market equilibrium gives price $42. The firm takes that price as MR and chooses about 61 units on rising MC. A further price increase raises the horizontal revenue line and moves the chosen output rightward along the unchanged MC curve. The market quantity of 80 is not this firm\u2019s output.',
reason='Final hide-one-panel test: add the firm\u2019s actual output decision to the price-change explanation. Market price, rising-MC output and comparative statics now require several linked steps, so the final cognitive tier is Hard.')
patch(d,'P62F-PC-H-015','Demand has increased from an initial zero-profit equilibrium, before entry and with firm costs unchanged. Use the new market price to find this firm\u2019s output. How have its revenue line and economic profit changed?',options=[
'About 62 units; higher market price raises the revenue line and creates short-run economic profit.',
'About 75 units; higher market price raises the revenue line and creates short-run economic profit.',
'About 62 units; higher demand shifts the firm\u2019s MC upward and leaves its revenue line unchanged.',
'About 75 units; higher demand shifts the firm\u2019s MC upward and leaves its revenue line unchanged.'],correct_index=0,
feedback='The market panel gives a new price of $45. On the firm panel, rising MC reaches $45 at about 62 units; ATC there is about $30. The higher market price raises the firm\u2019s horizontal MR and output, creating profit before entry. The market quantity of 75 is not the firm\u2019s output.',
reason='Final hide-one-panel test: require the firm\u2019s actual output at the new market price, rather than price plus general demand-shift theory. Keep the original short-run profit and revenue-line construct with indispensable evidence from both panels.')
patch(d,'P62F-PC-L-068','Use the equilibrium price in the market panel to find this price-taking firm\u2019s output. Why does its output differ from market quantity?',options=[
'About 75 units; market price becomes firm MR and determines the rising-MC output.',
'About 62 units; each firm takes the market quantity as its own output.',
'About 75 units; each firm takes the market quantity as its own output.',
'About 62 units; market price becomes firm MR and determines the rising-MC output.'],correct_index=3,
feedback='The market panel gives price $45 and total quantity 75. At that price, the firm panel\u2019s rising MC selects about 62 units. The panels share a price, but market quantity and one firm\u2019s output measure different things.',
reason='Final hide-one-panel test: replace market-price-plus-rule alternatives with the actual firm output decision. Market price and firm cost evidence are both necessary; Medium standard application.')
patch(d,'P62F-PC-M-043','Use the market equilibrium price to find this firm\u2019s profit-maximizing output. Why is the firm\u2019s output different from the market quantity?',options=[
'75 units; the firm takes market price as MR and chooses where rising MC equals MR.',
'90 units; market quantity must be assigned to every firm.',
'90 units; the firm takes market price as MR and chooses where rising MC equals MR.',
'75 units; market quantity must be assigned to every firm.'],correct_index=2,
feedback='The market panel gives price $40. The firm chooses 90 units where rising MC equals that price. Market quantity is 75 thousand units, the total for the market; it is not the output of one firm.',
reason='Final hide-one-panel test: firm output at the market-determined price replaces price-only recognition. Preserve price-taking and market-versus-firm aggregation at Medium.')
patch(d,'P62F-PC-LB-013','An analyst recommends producing at minimum ATC. Use the market and firm panels to evaluate that advice: what output should the firm choose, should it operate, and does it earn an economic profit?',tier='hard',options=[
'About 75 units; operate at a profit because price exceeds both AVC and ATC at the rising-MC crossing.',
'About 62 units; shut down because every output above minimum ATC is unprofitable.',
'About 62 units; operate at a profit because price exceeds both AVC and ATC at the rising-MC crossing.',
'About 75 units; shut down because every output above minimum ATC is unprofitable.'],correct_index=2,
feedback='Market price is $45. The firm\u2019s rising MC reaches $45 at about 62 units, where ATC is about $30 and AVC about $24. It should operate and earns positive economic profit. Minimum ATC identifies the lowest cost per unit, not the profit-maximizing output at every price.',
reason='Final hide-one-panel test: require actual output and cost comparisons rather than a price plus memorized checklist. Preserve integrated competitive-firm analysis; calibrate this linked standard application to Hard while retaining the legendary checkpoint role.')
for r in d['questions'].values():
    if 'pending' in r:
        r['closedPending']=r.pop('pending')
        r['closure']='Completed: final canonical graph references, numerical checks and rendered inspection recorded in the remediation ledger.'
save(d)
