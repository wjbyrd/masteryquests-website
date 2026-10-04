from review_tools import *
d=load()
for id in ['P62F-PC-H-011','P62F-PC-L-061']:
 patch(d,id,'Approximately what output should the firm choose, and will it earn an economic profit or loss at that output?',tier='medium',options=[
  'About 60 units; a profit because price exceeds ATC.',
  'About 40 units; a profit because price exceeds ATC.',
  'About 60 units; a loss because price is below ATC.',
  'About 40 units; a loss because price is below ATC.'],correct_index=0,
  feedback='The horizontal price line meets rising MC near 60 units. At that output price is above ATC, so (P−ATC)Q is positive. First choose output using MC; then use ATC at that output to measure profit.',
  reason='Removed an unrelated price-range check. The graph now determines the output decision and its profit consequence; both numerical and economic alternatives remain possible without the image.')
for id in ['P62F-PC-H-012','P62F-PC-L-064']:
 patch(d,id,'Fixed cost cannot be avoided this period. What should the firm do, and will it earn an economic profit or loss?',tier='medium',options=[
  'Produce at the rising-MC intersection; price covers AVC but not ATC, so the firm earns a loss.',
  'Produce at the rising-MC intersection; price covers ATC, so the firm earns a profit.',
  'Shut down; price lies below minimum AVC, so every positive output loses more than fixed cost.',
  'Either operate or shut down; price equals minimum AVC, so the two choices give the same loss.'],correct_index=0,
  reason='The price/AVC/ATC relationship itself distinguishes four possible firm positions. Removed a price-number appendage and conceptually impossible distractors.')
patch(d,'P62F-PC-L-065','All firms are initially identical. Current fixed costs are unavoidable, and survivors\u2019 cost curves stay unchanged as firms enter or exit. Given the position shown, what happens in the short run and as the industry adjusts?',tier='hard',options=[
 'Firms operate at a loss now; exit later raises market price and surviving firms\u2019 output until losses disappear.',
 'Firms operate at a profit now; entry later lowers market price and incumbent output until profit disappears.',
 'Firms shut down now because price fails to cover AVC; losses can later cause exit.',
 'Firms break even now; there is no profit incentive for entry or exit.'],correct_index=0,
 reason='Cost comparisons in the graph determine the adjustment path; removed the unrelated price-range clause.')
patch(d,'P62F-PC-LB-015','An unavoidable fixed fee this year raises ATC at Q1 by $20 per unit, leaving MC and AVC unchanged. The fee can be avoided by leaving before next year. How should the firm respond now, and what happens in the long run if these conditions persist?',tier='hard',options=[
 'Keep current output at a loss this year; exit can avoid the fee next year.',
 'Keep current output at a profit this year; profitable firms have no incentive to exit next year.',
 'Shut down this year because the fee puts price below AVC; exit can avoid the fee next year.',
 'Expand this year because the fixed fee raises marginal revenue; continue expanding next year.'],correct_index=0,
 feedback='At Q1, price is about $36 and ATC about $22, a profit margin near $14. Adding $20 to ATC turns that margin into a loss. The fee leaves MR, MC and AVC unchanged, so the short-run output decision and positive contribution toward fixed cost remain. If the loss persists, avoiding the fee next year supports exit.',
 reason='The plotted profit margin determines whether a specified fee causes a loss. Replaced the stem\u2019s disclosure that the fee already exceeds profit and removed an arbitrary price-range check.')
patch(d,'P62F-PC-LB-016','Fixed cost cannot be avoided this period. A student says shutdown would eliminate the entire loss. Compare price, AVC and ATC at Q1. What would shutting down do to the firm\u2019s loss?',tier='hard',options=[
 'Increase it; production covers variable cost and part of fixed cost.',
 'Reduce it, but leave fixed cost; production fails to cover variable cost.',
 'Leave it unchanged; revenue exactly covers variable cost.',
 'Eliminate it; shutdown avoids fixed cost as well as variable cost.'],correct_index=0,
 reason='Graphical cost recovery determines whether shutdown reduces or increases the loss. Removed the unrelated price-range test; unavoidable fixed cost alone cannot distinguish the first three alternatives.')
patch(d,'P62F-PC-LB-017','Fixed cost cannot be avoided this period. Compare an unconditional grant, paid whether the firm produces or shuts down, with a subsidy of $7 per unit sold. At the market price shown, which policy would make producing preferable to shutdown?',tier='hard',options=[
 'Only the $7 per-unit subsidy.',
 'Neither policy.',
 'Only the unconditional grant.',
 'Both policies.'],correct_index=0,
 feedback='Price is about $12, below minimum AVC near $17. The per-unit subsidy raises receipts to $19 per unit, enough to cover variable cost at some positive output. The unconditional grant adds the same amount to the payoffs from producing and shutdown, so it does not change their difference.',
 reason='Students must compare the specified subsidy with the graph\u2019s variable-cost shortfall. The stem no longer declares that the subsidy is sufficient, and no irrelevant price lookup is added.')
patch(d,'P62F-PC-LB-018','Compare two separate cost increases: higher unavoidable fixed rent, or an extra $3 of variable cost on every unit. What would the shutdown-price threshold be under each change, and which change shifts the firm\u2019s short-run supply?',tier='hard',options=[
 'About $14 with higher rent and $17 with the variable cost; only the variable cost shifts supply.',
 'About $18 with higher rent and $21 with the variable cost; only the variable cost shifts supply.',
 'About $17 under either change; both changes shift supply equally.',
 'About $14 under either change; neither change shifts supply.'],correct_index=0,
 feedback='Minimum AVC is about $14. Fixed rent changes neither AVC nor MC, so the shutdown threshold and short-run supply stay unchanged. Adding $3 to each unit\u2019s variable cost raises both AVC and MC by $3, moving the threshold to about $17 and shifting supply upward.',
 reason='The initial graph value is used in a substantive cost-change comparison, rather than appended to a generic statement.')
for id in ['P62F-PC-H-014','P62F-PC-L-063']:
 patch(d,id,'At the firm\u2019s best output, does it cover the owner\u2019s normal return, and is it productively efficient?',tier='medium',options=[
 'Yes to both; price equals minimum ATC, covering all economic costs at the lowest average cost.',
 'It covers normal return but is not productively efficient; price exceeds ATC at an output beyond the ATC minimum.',
 'It does not cover normal return; price is below ATC even though it covers AVC.',
 'It is productively efficient but does not cover normal return because zero economic profit excludes implicit costs.'],correct_index=0,
 reason='Graph relationships determine normal return and productive efficiency; removed an unrelated price reading.')
patch(d,'P62F-PC-L-074','At Q1, is the firm allocatively efficient, productively efficient, both, or neither?',tier='medium',options=[
 'Both: price equals MC and output is at minimum ATC.',
 'Only allocatively efficient: price equals MC but output is beyond minimum ATC.',
 'Only productively efficient: output is at minimum ATC but price exceeds MC.',
 'Neither: price exceeds MC and output is below minimum ATC.'],correct_index=0,
 feedback='At Q1 the price line meets MC and the ATC minimum. P = MC establishes allocative efficiency; output at minimum ATC establishes productive efficiency. The two relationships must each be checked in the graph.',
 reason='The graph establishes two distinct efficiency conditions. Removed an arbitrary common-price reading.')
for id,key in [('P62F-PC-L-073',0),('P62F-PC-L-072',1)]:
 patch(d,id,'As this industry expands along its long-run supply curve, how does the break-even price change? Which cost change is consistent with that pattern?',options=[
 'It falls; external economies can reduce firms\u2019 costs as the industry expands.',
 'It rises; greater industry demand for inputs can raise firms\u2019 costs.',
 'It stays constant; industry expansion leaves firms\u2019 cost curves unchanged.',
 'It falls; higher input prices raise firms\u2019 minimum average costs.'],correct_index=key,
 feedback=('The downward-sloping long-run supply curve shows a lower break-even price at larger industry output. External economies can lower firms\u2019 costs as the industry expands.' if key==0 else 'The upward-sloping long-run supply curve shows a higher break-even price at larger industry output. Higher input prices or other costs associated with industry expansion can raise firms\u2019 minimum average costs.'),
 reason='Industry output and long-run price move together in the graph; removed the arbitrary Q=80 reading and retained the cost explanation.')
save(d)
