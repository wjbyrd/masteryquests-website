from review_tools import *
d=load()
for g in range(106,125):review(d,g,'Read all current tasks/options/feedback. Check price-taking output, ATC/AVC comparisons, entry/exit, and true market-versus-firm integration. Convert ceremonial paired-panel instructions to firm-only tasks except explicit integration items needing variants.')
visual(d,range(103,125),'Viewed rendered payoff matrices and firm diagrams. PC-07 needs explicit $15 on the firm axis. PC-04 has no MC intersection at price $10. Older firm diagrams have detached curve labels and some Q1 collisions; PC-06/08 integration needs variants without a duplicated firm price.')
for g in [111,114,115,116,117,118,119,123,124]:
    d['assets'][INDEX[g]['asset']]['repairRequired']=True
    d['assets'][INDEX[g]['asset']]['issue']='Improve graph labels: explicit required price, separate Q1/ticks and clear curve identity. Keep all shared uses valid; use variants for distinct panel requirements.'
patch(d,'P62F-PC-B1-019',tier='medium',feedback='Rising MC meets price at Q = 50. Price is $30 and ATC is $20, so profit per unit is P−ATC = $10. P−AVC instead measures contribution toward fixed cost.',reason='Medium requires selecting operating output and comparing price with ATC. Removed an unnecessary AVC=$10 claim: the plotted AVC point is below $10.')
patch(d,'P62F-PC-L-091','Calculate the firm\u2019s economic profit. Explain how to choose output before selecting the cost measure for profit.',tier='hard')
patch(d,'P62F-PC-B1-020','What price does the firm receive, and which cost comparison shows that it breaks even while covering the owner\u2019s normal return?',tier='medium')
patch(d,'P62F-PC-EL-033',tier='hard')
patch(d,'P62F-PC-L-092','What price does the firm receive? Does it cover both explicit costs and the owner\u2019s normal return?')
patch(d,'P62F-PC-L-093','Market price falls slightly below the level shown but remains above AVC, with costs unchanged. What is the starting price? How should the firm adjust output, and should it continue operating?',tier='hard')
for id in ['P62F-PC-B2-037','P62F-PC-EL-034']:patch(d,id,'Calculate the loss from operating and the loss from shutting down. If fixed cost cannot be avoided, which choice minimizes the firm\u2019s loss?',tier='hard')
patch(d,'P62F-PC-L-094','Calculate the firm\u2019s current loss. Should it operate in the short run, and what would persistent losses imply in the long run?',tier='hard')
patch(d,'P62F-PC-EL-036',tier='medium')
patch(d,'P62F-PC-L-095','At the price line shown, should the firm produce or shut down? How far is price below the lowest average variable cost?',tier='medium',options=[
'Shut down; price is $5 below minimum AVC.','Produce; price is $10 below minimum AVC.',
'Produce; price is $5 below minimum AVC.','Shut down; price is $10 below minimum AVC.'],
feedback='The price line is at $10 and minimum AVC is $20 at A. Price is $10 below the shutdown threshold, so no positive output covers variable cost. The graph does not show an MC crossing at the $10 price line.',reason='Removed the false premise of a low-output MC intersection at $10; the plotted MC never reaches that price. Retained the shutdown comparison and assigned Medium.')
patch(d,'P62F-PC-L-096','If price equals the level at A, what is that price? Compare the firm\u2019s short-run loss from operating at A with its loss from shutting down.',tier='medium')
pc6='question-assets/perfect-competition/PC-06-integration.webp'
patch(d,'P62F-PC-B3-055','Use the market equilibrium price and the firm\u2019s cost curves to find its profit-maximizing output and economic profit.',image=pc6,
options=['75 units and $1,500 profit.','90 units and $2,250 profit.','90 units and $1,800 profit.','75 units and $2,250 profit.'],
feedback='Market supply and demand determine a price of $40. Taking this price as MR, the firm chooses 90 units on rising MC. ATC there is $20, so profit is (40−20) × 90 = $1,800. The market provides price; the firm panel provides output and costs.',reason='Genuine cross-panel integration: the new firm panel has cost curves but no chosen price/MR line. Market price is necessary to select output and calculate profit.')
patch(d,'P62F-PC-M-043','Use market supply and demand to find price. How does the representative firm use that price to choose output?',image=pc6)
for id in ['P62F-PC-B3-055','P62F-PC-M-043']:d['questions'][id]['pending']='Generate PC-06-integration variant without firm price, and validate all required cost readings.'
for id in ['P62F-PC-B3-056','P62F-PC-EL-038','P62F-PC-H-042','P62F-PC-L-097']:
    patch(d,id,'Using the firm panel, calculate current economic profit. Assume free entry, identical firms and unchanged input prices and cost curves. How will entry affect market supply, the price facing each firm, and incumbent output until profit is zero?',tier='elite' if id.endswith('L-097') else None,
    reason='The task legitimately uses the firm panel for profit and economic reasoning for entry; removed the claim that reading the redundant market price is required.')
patch(d,'P62F-PC-EL-039','What are the market equilibrium quantity and the representative firm\u2019s profit-maximizing output? Why are these different quantities even though firms face the same price?',tier='medium')
for id in ['P62F-PC-B3-057','P62F-PC-L-099']:
    patch(d,id,'Use the firm panel to calculate the current operating loss. Should the firm keep producing in the short run? If losses persist, how would exit affect the market price?',tier='elite' if id.endswith('L-099') else None,
    reason='Converted redundant paired-panel instructions to a firm-only cost comparison followed by short-run/long-run reasoning.')
patch(d,'P62F-PC-EL-040','Read the firm\u2019s initial output. As exit raises market price and the firm\u2019s costs stay fixed, how will its output respond?',tier='medium')
patch(d,'P62F-PC-EL-042','Read total market output and the representative firm\u2019s output. What additional assumptions would be needed to divide them and obtain the exact number of firms?',tier='hard')
patch(d,'P62F-PC-H-043','At Q = 50 in the firm panel, calculate total revenue using the price shown.',tier='medium')
patch(d,'P62F-PC-H-045','Use the firm panel to calculate its loss. If this situation persists, how would exit affect market supply and the price facing the remaining firms?')
patch(d,'P62F-PC-M-046','At the firm\u2019s chosen output, how much does price exceed AVC? Why can it be worthwhile to operate even with an economic loss?')
for id in ['P62F-PC-B3-058','P62F-PC-EL-044','P62F-PC-M-048']:
    patch(d,id,'In the firm panel, find the price and profit-maximizing output. Which cost relationships show that this is a long-run competitive equilibrium, with no incentive for entry or exit?',tier='hard' if id=='P62F-PC-EL-044' else None,
    reason='Legitimate firm-only task: cost recovery and minimum ATC supply the benchmark. The market panel is not claimed as independent evidence.')
patch(d,'P62F-PC-EL-043','Find price in the market panel. How does the firm use that price with its own cost curves to choose output?',tier='medium',image='question-assets/perfect-competition/PC-08-integration.webp')
d['questions']['P62F-PC-EL-043']['pending']='Generate PC-08-integration variant without firm price; neither panel alone selects the output.'
patch(d,'P62F-PC-H-046','In the firm panel, what price does the firm receive? Which marginal comparison establishes allocative efficiency?',tier='medium')
patch(d,'P62F-PC-H-047',tier='medium')
patch(d,'P62F-PC-L-075','Demand shifts from D1 to D2. Estimate the new long-run price. Why does entry not return price to its original level in this increasing-cost industry?',tier='hard')
patch(d,'P62F-PC-L-074','At Q1, estimate the common price and cost. Which curve relationships establish allocative efficiency and productive efficiency?')
for id in ['P62F-PC-H-018','P62F-PC-L-069']:
    patch(d,id,'In the firm panel, estimate the final price P2. Explain why entry ends at this price.',tier='medium')
for id in ['P62F-PC-H-019','P62F-PC-L-070']:
    patch(d,id,'In the firm panel, estimate the final price P2. Explain why exit ends at this price.',tier='medium')
patch(d,'P62F-PC-L-065','Initially all firms are identical and current fixed costs cannot be avoided. Survivors\u2019 costs stay unchanged as firms exit. Read the current price range. Explain why firms operate now and how exit changes surviving firms\u2019 MR and output until losses disappear.',tier='hard')
patch(d,'P62F-PC-LB-016','Fixed cost cannot be avoided this period. A student says shutdown removes the entire operating loss. Read the firm\u2019s price range and compare price with AVC and ATC. Would shutdown reduce or increase the loss?',tier='hard')
for g in [123,124]:
    for id in INDEX[g]['ids']:d['questions'][id]['pending']='Repair redundant-panel task through a price-free firm variant or a legitimate firm-only task without losing market-versus-firm skill.'
save(d)
