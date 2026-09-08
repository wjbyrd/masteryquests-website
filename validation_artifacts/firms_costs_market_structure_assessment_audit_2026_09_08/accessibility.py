import json,re
from pathlib import Path
W=Path(__file__).resolve().parent;assets=json.loads((W/'used-assets.json').read_text());out={}
specific={
'cop_average_costs.webp':'Quantity is horizontal and cost per unit vertical. Blue AFC declines toward zero; orange AVC is U-shaped; green ATC lies above AVC. The ATC–AVC vertical gap narrows as quantity rises. No MC curve is drawn.',
'cop_lratc_regions.webp':'Quantity is horizontal and long-run average cost vertical. LRATC declines to about $30 at Q = 45, is flat through Q = 80, then rises. These are output positions on the same long-run curve.',
'cop_mes.webp':'Quantity is horizontal and long-run average cost vertical. The U-shaped LRATC curve reaches its marked minimum near Q = 60 and cost $28; the curve rises on either side.',
'cop_mp_standard.webp':'Worker added is horizontal and marginal product vertical. MP at workers 1 through 8 is 8, 12, 14, 12, 10, 8, 6, 4. The zero reference is below all plotted observations.',
'cop_mp_ap.webp':'Workers are horizontal and product per worker vertical. MP at workers 1 through 8 is 8, 12, 14, 12, 10, 8, 6, 4. AP is the orange curve: it rises from 8 to about 11.5 by worker 4, then falls toward 9.25 at worker 8. MP is above AP at workers 2–4 and below it at workers 5–8.',
'cop_productivity_shift.webp':'Quantity is horizontal and cost per unit vertical. Solid blue MC1 and solid orange MC2 are U-shaped, with MC2 below MC1 at a given output. Dashed ATC2 lies below dashed ATC1. Both MC curves rise on the right side.',
'cop_total_costs.webp':'Quantity is horizontal and total cost vertical. TFC is the horizontal line at $240. TVC starts at zero and rises, becoming steeper at higher output. TC starts at $240 and stays $240 above TVC.',
'cop_tp_standard.webp':'Workers are horizontal and total output vertical. At workers 0 through 8, TP is 0, 8, 20, 34, 46, 56, 64, 70, 74. Successive observations are joined by lines.',
'cop_tp_congestion.webp':'Workers are horizontal and total output vertical. At workers 0 through 8, TP is 0, 10, 23, 36, 47, 56, 63, 68, 71. The curve keeps rising while its later segments become flatter.',
'cop_tp_negative.webp':'Workers are horizontal and total output vertical. At workers 0 through 8, TP is 0, 9, 21, 34, 45, 54, 60, 62, 60. The final segment slopes downward.',
'COST-01.webp':'Quantity is horizontal and dollars per unit vertical. Curves are MC, AC (average total cost), and AVC. At Q = 25, MC crosses AVC at its minimum of $30. At Q = 50, MC crosses AC at its minimum of $40, and AVC is $32. Between these quantities MC is above AVC and below AC.',
'COST-02.webp':'Quantity is horizontal and dollars per unit vertical. At Q = 200, MC crosses AVC at its minimum of $10. At Q = 400, MC crosses AC (average total cost) at its minimum of $20; AVC there is $12. MC lies between the averages between their two crossings.',
'COST-03.webp':'Quantity is horizontal and total cost vertical. The upper curve starts at $400, the middle curve starts at zero, and the lower horizontal line is $400. At Q = 120, point A on the upper curve is $1,200, point B on the middle curve is $800, and point C on the horizontal line is $400. These are total-cost observations; average costs such as ATC and AVC require division by quantity.',
'COST-04.webp':'Labor is horizontal and total product vertical. TP starts at zero, first steepens, then flattens while still rising; it peaks near labor 10 and output 150, then falls. The vertical scale runs from 0 to 200.',
'COST-05.webp':'Labor is horizontal and output per worker vertical. Red MP peaks near labor 4.5, then falls, crossing green AP near labor 7 and product 17. AP rises before that crossing and falls afterward. MP crosses zero near labor 10 while AP remains positive.',
'COST-06.webp':'Quantity is horizontal and LRAC in dollars per unit vertical. The U-shaped LRAC minimum is approximately Q = 60, cost $12. At Q = 30 and Q = 90 LRAC is about $20; it is higher toward both ends of the plotted range.',
'MCOMP-01.webp':'Quantity is horizontal and price/cost per unit vertical. D = AR slopes downward and MR is steeper. MR and MC meet at Q = 50, value $23. At this same quantity D is marked $37 and ATC $33. MC rises to the right of the crossing.',
'MCOMP-02.webp':'Quantity is horizontal and price/cost per unit vertical. At Q = 36, MR and MC meet at $15; the downward-sloping D = AR curve touches ATC at $27. ATC is lower at larger quantities before turning upward. No AVC curve is drawn.',
'MCOMP-03.webp':'Quantity is horizontal and price/cost per unit vertical. At Q = 36, MR intersects MC at $15.50, and demand D = AR touches ATC at $27. ATC reaches its marked minimum of $25 at Q = 50, where MC crosses it. No AVC curve is drawn.',
'MON-01.webp':'Quantity is horizontal and price/cost per unit vertical. MR meets MC at Q = 36, value $24; at the same quantity D is $42 and ATC is $27. D meets MC at Q = 60, value $30. No AVC curve is drawn.',
'MON-02.webp':'Quantity is horizontal and price/cost per unit vertical. At Q = 40, MR meets MC at $20, D is marked $40 and ATC is $45. D meets MC at approximately Q = 67 and $27. No AVC curve is drawn.',
'MON-03.webp':'Quantity is horizontal and price/cost per unit vertical. MC is horizontal at $20. MR meets MC at Q = 45; at that quantity demand is marked $47 and ATC is $24. Demand meets MC at Q = 90. ATC declines through the relevant range.',
'MON-04.webp':'Quantity is horizontal and price/cost per unit vertical. MC is horizontal at $10 and ATC declines. MR meets MC near Q = 70; demand there is about $27. Demand meets ATC near Q = 116 and $16. Demand meets MC at Q = 140 and $10, while ATC at Q = 140 is about $15.',
'mon_zero_1.webp':'Quantity is horizontal and price/cost per unit vertical. Demand D = AR slopes downward; MR is steeper and crosses rising MC at Q1, near 21. P1 on demand is above the plotted ATC at Q1. The drawn demand and ATC curves cross farther right; the filename does not establish zero profit at Q1.',
'PC-01.webp':'Firm quantity is horizontal and price/cost per unit vertical. Horizontal P = MR = AR is $30 and meets rising MC at Q = 50. ATC is marked $20 at Q = 50. The AVC curve lies below ATC and is about $9 there.',
'PC-02.webp':'Firm quantity is horizontal and price/cost per unit vertical. Horizontal P = MR = AR is $25. At Q = 50 it meets MC and ATC; ATC is at its minimum. AVC at that quantity is $15.',
'PC-03.webp':'Firm quantity is horizontal and price/cost per unit vertical. Horizontal P = MR = AR is $30 and meets rising MC at Q = 30. ATC at Q = 30 is $40, and AVC is $20.',
'PC-04.webp':'Firm quantity is horizontal and price/cost per unit vertical. P = MR = AR is horizontal at $10. Point A is the MC–AVC crossing at AVC minimum, Q = 22 and $20. Point B is on rising MC near Q = 36 and $30. Point C is the MC–ATC crossing at ATC minimum, Q = 44 and $40. Point D is on rising MC near Q = 50 and $50.',
'PC-06.webp':'Two panels: market quantity is in thousands on the left; individual firm quantity on the right. Market S and D cross at quantity 75 thousand and price $40. The firm has horizontal P = MR = AR at $40, meeting rising MC at Q = 90. At Q = 90, ATC is $20 and AVC $15.',
'PC-07.webp':'Two panels: market quantity is in thousands on the left; individual firm quantity on the right. Market S and D cross at quantity 75 thousand and price $15. The firm has horizontal P = MR = AR at $15, meeting rising MC at Q = 50. At Q = 50, ATC is $18 and AVC $10.',
'PC-08.webp':'Two panels: market S and D cross at Q = 100 and P = $25 on the left. On the right, horizontal P = MR = AR at $25 meets rising MC and minimum ATC at firm Q = 50. AVC at that quantity is labeled $17.',
'pc_efficiency.webp':'Firm quantity is horizontal and price/cost per unit vertical. Horizontal D = AR = MR meets rising MC and the minimum of ATC at the marked Q1. The price is near $24. No AVC curve is drawn.',
'pc_entry_1.webp':'The market panel shows downward demand and S2 to the right of S1. The firm panel shows MC, ATC and a horizontal price line P1 above the dashed lower P2 line. P2 meets MC at minimum ATC. No AVC curve is drawn.',
'pc_exit_3.webp':'The market panel shows downward demand and S2 to the left of S1. The firm panel shows MC, ATC and the lower horizontal price P1 below dashed P2. P2 meets MC at minimum ATC. No AVC curve is drawn.'}
for a in assets:
 n=a['filename'];old=a.get('graphDescription','');desc=specific.get(n)
 if not desc:
  if n.startswith('matrix_'):
   pairs=re.findall(r'\((-?\d+),\s*(-?\d+)\)',old);assert len(pairs)==4
   desc='A two-by-two payoff matrix. Rows are A and B; columns are X and Y. Payoffs are ordered (Row firm, Column firm). '+ '; '.join(cell+' = ('+x+', '+y+')' for cell,(x,y) in zip(['A/X','A/Y','B/X','B/Y'],pairs))+'.'
  elif n.startswith('shares_'):
   shares=[[34,27,18,11,10],[42,24,16,10,8],[28,22,18,14,18],[50,20,12,8,10],[26,24,20,15,15],[38,32,12,9,9],[31,29,17,13,10],[45,18,14,12,11]][int(n[7])-1]
   desc='The horizontal axis lists firms A, B, C, D and Other. Market share in percent is vertical. Bars: '+', '.join(f'{c} {v}%' for c,v in zip(['A','B','C','D','Other'],shares))+'. The axis says Firm or fringe; the question must specify how to interpret Other when individual shares matter.'
  elif n.startswith('tree_'):
   pairs=re.findall(r'\((-?\d+),\s*(-?\d+)\)',old);assert len(pairs)==3
   desc='A sequential game. The entrant first chooses Stay out or Enter. After Enter the incumbent chooses Accommodate or Fight. Payoffs are ordered (Entrant, Incumbent). '+ '; '.join(cell+' = ('+x+', '+y+')' for cell,(x,y) in zip(['Stay out','Enter then Accommodate','Enter then Fight'],pairs))+'.'
  else:
   desc=old.split(' Visible numeric scale markings')[0]
   desc=desc.replace('upward-sloping MC','MC that falls at low quantity and then rises') if n.startswith(('cop_cost_family','pc_')) else desc
   if n.startswith('pc_supply'):desc='Firm quantity is horizontal and cost per unit vertical. MC and AVC both initially fall and then rise. Rising MC crosses AVC at its minimum; MC lies above AVC to the right of the crossing.'
  if n.startswith('cartel_'):
   vals=[(100,2,20),(120,2,24),(90,1.5,18),(140,2.5,30),(110,1,30),(150,3,24)][int(n[7])-1];a0,b,c=vals
   desc=f'Market quantity is horizontal and price/cost vertical. Demand is a straight line from price {a0} to quantity {a0/b:g} at zero price. MR shares the price intercept and reaches zero at quantity {a0/(2*b):g}. MC is horizontal at {c}.'
  if n.startswith('mcmp_long_run_'):
   q,p,mc,q2=[(20,70,50,36.67),(24,76,49.6,39.71),(18,64,47.8,34.07),(28,82,48.4,43),(22,68,50.4,38)][int(n[14])-1]
   desc=f'Quantity is horizontal and price/cost per unit vertical. At Q1 = {q}, downward-sloping D = AR meets ATC at P1 = {p}, while MR meets MC at {mc}. ATC reaches its minimum near Q2 = {q2}. MR lies below demand.'
 out[n]={'graphDescription':desc,'imageAlt':('Payoff matrix' if n.startswith('matrix') else 'Sequential game tree' if n.startswith('tree') else 'Market-share bar chart' if n.startswith('shares') else 'Economics diagram')+': '+n.replace('.webp','').replace('_',' ')+'. Details are provided in the graph description.'}
(W/'accessibility-spec.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('Accessibility records',len(out))
