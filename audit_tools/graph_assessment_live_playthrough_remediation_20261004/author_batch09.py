from review_tools import *
d=load()
for g in [0,*range(125,138)]:review(d,g,'Read every current stem/options/feedback. Preserve marginal conditions, operation versus shutdown, tax wedges and surplus concepts; remove unrelated coordinate checks and match difficulty to actual reasoning.')
visual(d,range(125,138),'Viewed actual graphs. Legacy PC figures require separated Q1 labels and explicit prices where close numeric alternatives demand them. TAX-02 omits the necessary $10.50 original equilibrium label. Supply and tax-revenue figures have readable guides and units.')
for g in range(125,135):
    d['assets'][INDEX[g]['asset']]['repairRequired']=True
    d['assets'][INDEX[g]['asset']]['issue']='Separate labels from numerical ticks and identify required price/shutdown values. Preserve plotted geometry and all shared tasks; TAX-02 explicitly label original equilibrium $10.50.'
patch(d,'P75-TRADE-L-027','A static two-good model predicts gains from specialization and trade. Which additional conclusion would require evidence beyond this model?',tier='medium',options=[
'Workers displaced from the import-competing industry will recover their previous earnings after retraining.',
'The country with the lower opportunity cost of a good has a comparative advantage in that good.',
'Both countries can gain if the terms of trade lie between their opportunity costs.',
'Specialization according to comparative advantage can increase combined output under the model\u2019s assumptions.'],
feedback='The model compares production and consumption possibilities. It does not describe job search, retraining, adjustment costs or how gains are distributed among workers. Evidence about those processes is needed to predict displaced workers\u2019 earnings.',
reason='Replaced an extreme every-policy/every-worker claim with a plausible labor-adjustment conclusion beyond a static model. Current canonical tier was already Hard despite the L ID; reclassified the actual concept application as Medium.')
for id in ['P62F-PC-H-011','P62F-PC-L-061']:
    patch(d,id,'Estimate the market price. How should the firm choose output and use ATC to determine whether it earns a profit?',tier='hard')
for id in ['P62F-PC-B1-005','P62F-PC-H-016']:
    patch(d,id,'Approximately what output maximizes profit? Explain why the relevant price–MC crossing is on rising MC.',tier='medium',reason='The task requires choosing the rising-MC intersection and explaining the sign change in marginal profit. Medium rather than Easy; preserve the checkpoint role of B1-005. Separate Q1 from the 60 tick in the asset.')
patch(d,'P62F-PC-EL-012','The plotted costs include a tax on every unit sold. Read market price and compare it with minimum AVC. Should the firm produce, and how does the per-unit tax affect this decision?',tier='hard')
for id in ['P62F-PC-H-013','P62F-PC-L-066']:
    patch(d,id,'Read market price and compare it with minimum AVC. Should the firm produce or shut down, and what cost remains unavoidable?',tier='medium')
patch(d,'P62F-PC-LB-017','At the price shown, compare an unconditional grant with a subsidy per unit large enough to raise net receipts above minimum AVC. Fixed cost cannot be avoided this period. What is market price, and which policy can change the decision to operate?',tier='hard',
feedback='Price is $12, below minimum AVC near $17. An unconditional grant is received whether the firm produces or shuts down, so it does not change the difference between those payoffs. A per-unit subsidy is earned only on output and can make net receipts cover variable cost.')
patch(d,'P62F-PC-H-017',tier='medium')
patch(d,'P62F-PC-LB-018','Read the current shutdown-price threshold. Compare a rise in unavoidable fixed rent with a higher variable cost on every unit. How does each affect short-run supply and the shutdown threshold?',tier='hard')
patch(d,'P62F-PC-H-014','Estimate the price shown. Does the firm cover the owner\u2019s normal return, and is its output productively efficient?')
patch(d,'P62F-PC-L-063','Estimate market price. What do its relationships with MC and ATC show about economic profit, normal return and productive efficiency?')
patch(d,'PG2-STX-M-002','Buyers legally pay the tax shown. Compared with the original equilibrium price, how much of the tax is borne by buyers and how much by sellers?',options=[
'Buyers bear $3 per unit and sellers bear $3 per unit.',
'Buyers bear $4.50 per unit and sellers bear $1.50 per unit.',
'Buyers bear $1.50 per unit and sellers bear $4.50 per unit.',
'Buyers bear $6 per unit and sellers bear $0 per unit.'],
reason='All four burden splits are arithmetically possible for a $6 tax until the graph is read. The repaired graph must explicitly label the original price $10.50; legal payment alone does not identify the economic split.')
patch(d,'PG1-SUP-L-001','A producer says the movement from A to B shows an increase in supply. How much does quantity change, and does this movement shift the supply curve?')
patch(d,'40040','Calculate the changes in the buyer\u2019s price, the seller\u2019s receipt and quantity traded after the tax. What separates the two prices?')
patch(d,'40041','Suppose the per-trip tax shown is halved while demand and supply stay fixed. Calculate tax revenue before and after the change. Does the increase in trips fully offset the lower tax per trip?')
patch(d,'ECON-MG-HARD-274','Calculate tax revenue. Which quantity should be multiplied by the full tax per unit?',tier='medium')
patch(d,'ECON-MG-HARD-284','A student uses the original quantity to calculate tax revenue. Calculate the correct revenue and explain which transactions are taxed.',tier='medium')
patch(d,'ECON-MG-LEGENDARY-9055','A clerk multiplies only the buyer-price increase by the original quantity and reports $300 of revenue. Calculate the correct revenue and identify both errors.',tier='hard')
patch(d,'ECON-MG-LEGENDARY-9057','Compare the quantities sold before and after the tax. How does the gap between buyer and seller prices explain the lost sales?')
save(d)
print('Text reviewed:',sum(x.get('textReviewed',False) for x in d['questions'].values()))
print('Draft patches:',sum(bool(x['patch']) for x in d['questions'].values()))
print('Pending:',{i:r['pending'] for i,r in d['questions'].items() if r.get('pending')})
