"""Retain each original task's emphasis where graph repairs had collapsed stems."""
from common import *
stems={
'42740':'Which before-and-after Gini values are printed in the graph, and what change in relative income inequality do they indicate?',
'42742':'What do the graph’s two Gini values establish about inequality, and what can they establish about income levels or poverty?',
'ECON-MG-MEDIUM-186':'Refer to the tax graph. Which before-and-after quantities describe the change in sales, and why does the tax affect sales?',
'ECON-MG-MEDIUM-189':'Refer to the tax graph. Which quantity change accompanies the wedge between the price buyers pay and the amount sellers receive?',
'ECON-MG-LEGENDARY-9057':'Refer to the graph. A report attributes the smaller market after the tax to the buyer–seller price wedge. Which quantity comparison and explanation support that account?',
'P62B-ELAS-E-029':'Refer to the linear demand curve. Identify the price at C and classify demand as you move from C through B to A.',
'P62B-ELAS-M-008':'Refer to the graph. Starting at C, which initial price and sequence of elasticity classifications describe movement down the demand curve through B to A?',
'P62B-ELAS-H-016':'The upper and lower portions of the plotted demand curve have the same slope. Which point elasticities at C and A, and explanation, reconcile that slope with different percentage responses?',
'P62B-ELAS-H-034':'Refer to the linear demand graph. Which point elasticities at C and A illustrate the role of the price-to-quantity ratio in elasticity?',
'P62E-COP-B1-020':'Refer to the MP–AP graph. At approximately how many workers does MP equal AP, and what happens to average product there?',
'P62E-COP-EL-040':'Refer to the MP–AP graph. Locate the crossing where MP moves below AP. Which labor input and change in AP immediately before and after it follow from marginal-average reasoning?',
'P62E-COP-L-053':'Refer to the total-cost graph. Which cost accounts for the unchanged vertical distance between TC and TVC, and how large is that cost?',
'P62E-COP-B2-034':'Use the graph to complete the cost identity TC = TVC + ____. Which amount and explanation fit the missing term?',
'P62F-PC-B1-020':'Refer to the graph. Which price and price–cost comparison establish that the firm breaks even at its profit-maximizing output?',
'P62F-PC-L-092':'At the price shown in the graph, how should the firm interpret its economic profit and the return included in total economic cost?',
'P62F-PC-B3-056':'Use the paired graphs. Under free entry with identical firms and unchanged input prices and cost curves, which current profit and eventual market adjustment eliminate the incentive to enter?',
'P62F-PC-EL-038':'Use the paired graphs. Assume free entry, identical firms and unchanged input prices and cost curves. Which current profit and subsequent changes in market supply, firm MR and firm output describe the path to long-run equilibrium?',
'P62F-PC-L-097':'Starting from the market price and the firm’s costs in the paired graphs, which current profit and chain of entry, price and output changes follow under free entry with identical firms and unchanged costs?',
'P62F-PC-B3-057':'Use the paired graphs to compare the firm’s revenue, variable cost and total cost. Which operating loss and decisions distinguish the short run from the long run?',
'P62F-PC-L-099':'Trace the loss case in the paired graphs from market price to the firm’s operating decision and then to exit. Which current loss and adjustment sequence follow?',
'P62F-PC-EL-044':'Which price and firm output in the paired graphs, together with the economic conditions, establish a long-run competitive benchmark rather than only current break-even?',
'P62F-PC-B3-058':'Starting with market price in the paired graphs, which firm output and cost relationships summarize the long-run competitive equilibrium?',
'P62G-MON-B3-057':'Use the graph to compare the unregulated monopoly with the allocatively efficient benchmark. Which price–quantity pairs and decision rules belong to the two outcomes?',
'P62G-MON-EL-037':'A regulator proposes moving from the monopoly outcome to D = MC in the graph. Which before-and-after price–quantity pairs and decision-rule comparison describe this proposal?',
'P62G-MON-L-094':'Refer to the graph. Which price would marginal-cost regulation set, and why might the regulator need to pair that price with a subsidy?',
'P62G-MON-EL-036':'Use the graph to evaluate the financing of marginal-cost pricing. Which regulated price and cost comparison explain whether the firm could recover its total costs?',
'P62H-MCMP-EL-031':'If the short-run profit shown persists initially, which current profit and entry response follow in monopolistic competition?',
'P62H-MCMP-L-091':'Refer to the graph. If entry eliminates the current short-run profit while the firm remains monopolistically competitive, which profit amount and eventual relationship between demand and ATC are consistent?',
'P62H-MCMP-EL-035':'Compare the plotted long-run outcome with an earlier profitable position. Which current price and change in incumbent demand describe the effect of entry?',
'P62H-MCMP-L-094':'Refer to the graph. Which final price and sequence of changes in incumbent demand, economic profit and efficient scale describe adjustment after short-run profit attracts entry?',
'P62H-MCMP-EL-037':'Refer to the graph. A policymaker argues that zero economic profit means consumers cannot gain from additional mutually beneficial trades. Which markup and excess-capacity readings, and assessment of the claim, are supported?',
'P62H-MCMP-L-095':'Refer to the long-run graph. A proposal would force the firm to produce at minimum ATC while pricing at MC. Which current markup and excess capacity, and limits on the policy conclusion, should inform the evaluation?'
}
for i,s in stems.items():
    edit(i,q=s)
    R[i]['task_emphasis_review']='Restored the distinct original task emphasis rather than collapsing the item into a shared generic stem.'
# Match the explanatory length of the actual-reading distractor to the key.
i='P62E-COP-L-091'
P[i]['options']=[s.replace('AVC < MC < AC; AVC falls while AC rises.','AVC < MC < AC; the next units cost more than AVC but less than AC, lowering AVC and raising AC.').replace('MC < AVC < AC; both averages fall.','MC < AVC < AC; the next units cost less than either average, lowering both AVC and AC.').replace('MC < AVC < AC; both averages rise.','MC < AVC < AC; the next units cost less than either average, raising both AVC and AC.') for s in P[i]['options']]
save()
