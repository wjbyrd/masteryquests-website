from review_tools import *
d=load()
# These are authored economic replacements, not text-generated mapping rules.
patch(d,'P62B-ELAS-M-008',options=[
    'Raise revenue at C; lower it at A.',
    'Raise revenue at A; lower it at C.',
    'Raise revenue at B; lower it at A.',
    'Raise revenue at A; lower it at B.'],correct_index=0)
# Labeled bundles replace an unrelated coordinate test. Each distractor describes
# a possible graph, rather than relying on a violation of the definition.
choice='question-assets/consumer-choice/CHOICE-05-bundles.webp'
patch(d,'42585','Which pair of labeled bundles gives the consumer the same level of satisfaction?',tier='easy',image=choice,
 options=['A and B.','A and D.','B and D.','C and D.'],correct_index=0,
 feedback='A and B lie on IC2, so the consumer is indifferent between them even though their combinations of X and Y differ. D lies on IC1.',
 reason='The graph determines which bundles share an indifference curve. Removed irrelevant ranges of Y; direct recognition is Easy.')
patch(d,'42587','Compare the moves from A to B and from B to C. In which move does the consumer give up more Y per additional unit of X, and what does this show about the marginal rate of substitution?',image=choice,
 options=['A to B; willingness to give up Y for another X diminishes as X increases.',
          'B to C; willingness to give up Y for another X rises as X increases.',
          'The same in both moves; willingness to substitute stays constant.',
          'B to C; willingness to give up Y for another X diminishes as X increases.'],correct_index=0,
 feedback='All three bundles lie on IC2. A to B gives up 9 units of Y for 5 of X, or 1.8 per X. B to C gives up 4.5 units of Y for 10 of X, or 0.45 per X. The flatter curve to the right shows diminishing MRS.',
 reason='Compare economically meaningful trade-offs along one indifference curve instead of an obvious direction paired with three definition errors.')
patch(d,'42588','Compare bundles B and D. Assuming more of either good is preferred, what can the indifference curves establish?',tier='medium',image=choice,
 options=['B is preferred; the curves do not measure how many times greater satisfaction is.',
          'D is preferred; the curves do not measure how many times greater satisfaction is.',
          'B and D are equally preferred because they contain the same amount of X.',
          'B gives exactly twice as much satisfaction because its curve is labeled IC2.'],correct_index=0,
 feedback='B and D have the same X, but B contains more Y and lies on the higher indifference curve. The graph ranks B above D; the curve numbers do not measure amounts or ratios of satisfaction.',
 reason='The plotted bundle ranking is essential to an ordinal-utility interpretation; no arbitrary coordinate identification.')
for id in ['42585','42587','42588']:d['questions'][id]['pending']='Generate labeled-bundle variant and inspect.'
mono='question-assets/monopoly/MON-01.webp'
loss='question-assets/monopoly/MON-02-variable-cost.webp'
patch(d,'P62G-MON-H-005','An unavoidable fixed-cost increase of $540 leaves demand, MR and MC unchanged. At the best output, will the firm still cover all economic costs, including the owner\u2019s normal return?',image=mono,
 options=['Yes; economic profit becomes zero and the normal return is covered.',
          'Yes; economic profit remains $540 and the normal return is covered.',
          'No; economic profit becomes a $540 loss.',
          'No; zero economic profit means the normal return is not covered.'],correct_index=0,
 feedback='MR = MC gives Q = 36; demand gives P = $42 and ATC is $27. Initial profit is (42−27) × 36 = $540. The additional fixed cost eliminates that profit without changing output or price. Zero economic profit covers both explicit and implicit costs, including normal return.')
patch(d,'P62G-MON-H-006','Fixed cost cannot be avoided this period. Should this monopolist operate or shut down, and how much of its fixed cost would operating cover?',image=loss,
 options=['Operate; revenue covers $1,000 of fixed cost.',
          'Operate; revenue covers $200 of fixed cost.',
          'Shut down; operating would leave variable cost uncovered by $200.',
          'Shut down; operating would leave variable cost uncovered by $1,000.'],correct_index=0,
 feedback='MR = MC gives Q = 40, and demand gives P = $40. AVC is $15 and ATC is $45. Operating contributes (40−15) × 40 = $1,000 toward fixed cost of (45−15) × 40 = $1,200, leaving a $200 loss. Shutdown would lose all $1,200.')
patch(d,'P62G-MON-H-007','Calculate the monopolist\u2019s economic loss at its profit-maximizing output. Which area measures that loss?',image=loss,
 options=['$200; the gap between ATC and price, multiplied by output.',
          '$1,200; the gap between ATC and AVC, multiplied by output.',
          '$1,000; the gap between price and AVC, multiplied by output.',
          '$150; the gap between ATC and price, multiplied by output.'],correct_index=0,
 feedback='MR = MC gives Q = 40; demand gives P = $40, below ATC of $45. The loss rectangle is (45−40) × 40 = $200. Fixed cost is $1,200 and contribution toward it is $1,000; neither is the operating loss.')
patch(d,'P62G-MON-H-008','Fixed cost cannot be avoided. A manager proposes expanding to the demand–MC intersection to eliminate the loss. Should the firm expand, keep its current positive output, or shut down?',image=loss,
 options=['Keep 40 units; MR = MC minimizes the operating loss, and price covers AVC.',
          'Keep 30 units; MR = MC minimizes the operating loss, and price covers AVC.',
          'Expand to about 67 units; the price–MC equality eliminates the loss.',
          'Shut down; at the best positive output, price fails to cover AVC.'],correct_index=0,
 feedback='MR = MC gives 40 units. Price $40 exceeds AVC $15, so operating contributes toward unavoidable fixed cost. Expanding toward demand = MC adds units whose MC exceeds MR and increases the loss. The marginal rule selects the best output without guaranteeing profit.')
patch(d,'P62G-MON-H-009','Fixed cost cannot be avoided this period. Which operating decision is supported by the demand and cost curves?',tier='medium',
 options=['Shut down; demand lies below AVC at every positive output.',
          'Produce at MR = MC; price there covers AVC but not ATC.',
          'Produce at MR = MC; price there covers ATC.',
          'Either produce or shut down; revenue exactly covers variable cost at the best positive output.'],correct_index=0,
 feedback='Even the highest demand price, $40, is below AVC, which starts around $45 and stays above demand. No positive output covers its variable cost, so shutting down minimizes the loss. Unavoidable fixed cost remains.')
patch(d,'P62G-MON-H-010','With fixed cost unavoidable this period, which cost can the firm cover from sales at a positive output? What operating decision follows?',tier='medium',
 options=['Not even variable cost; shut down and bear the fixed cost.',
          'Variable cost but not total cost; operate to contribute toward fixed cost.',
          'Total cost; operate and earn an economic profit.',
          'Exactly variable cost at the best output; operating and shutdown give the same loss.'],correct_index=0,
 feedback='The demand curve starts at $45 while AVC starts around $52 and remains above demand. Sales at every positive output fail to cover variable cost. Shutdown avoids variable expenses, but the fixed commitments remain.')
patch(d,'P62G-MON-H-011','At Q = 48, compare consumers\u2019 marginal willingness to pay with marginal cost. Would expanding output near this quantity increase total surplus, and by approximately how much per additional unit?',image='question-assets/monopoly/MON-01-welfare.webp',
 options=['Increase it by $9 per unit; marginal value exceeds marginal resource cost.',
          'Increase it by $18 per unit; marginal value exceeds marginal resource cost.',
          'Decrease it by $9 per unit; marginal resource cost exceeds marginal value.',
          'Leave it unchanged; the price–cost gap only transfers surplus.'],correct_index=0,
 feedback='At Q = 48, demand gives marginal value $36 and MC is $27. The $9 difference is a marginal gain in total surplus from additional output, not merely a payment transfer. This output lies between the monopoly quantity 36 and efficient quantity 60.')
patch(d,'P62G-MON-H-012','Calculate the deadweight loss from monopoly output restriction. Why is this amount a social loss rather than a transfer to the monopolist?',image=mono,
 options=['$216; the omitted units would create value above their resource cost.',
          '$432; the omitted units would create value above their resource cost.',
          '$216; all consumer payments on the units still sold are destroyed surplus.',
          '$540; the monopolist\u2019s economic profit measures the lost gains from trade.'],correct_index=0,
 feedback='Monopoly output is 36 and efficient output is 60. At 36, demand is $42 and MC is $24. The lost-surplus triangle is ½ × (60−36) × (42−24) = $216. It represents mutually beneficial units not produced; payments on existing sales transfer surplus.')
for id in ['P62G-MON-H-005','P62G-MON-H-006','P62G-MON-H-007','P62G-MON-H-008','P62G-MON-H-011','P62G-MON-H-012']:
 d['questions'][id]['review']='Replace unreadable legacy asset with a clean MON-family asset or cost-consistent variant. Preserve the recorded economic skill; numerical examples change explicitly with the graph. Replace unrelated range identification with cost recovery, marginal choice or welfare reasoning.'
 d['questions'][id]['pending']='Generate/validate replacement graph.'
for id in ['P62G-MON-H-009','P62G-MON-H-010']:d['questions'][id]['pending']='Repair legacy curve labels without changing geometry.'
# All four market/firm questions need genuinely independent market evidence.
for id in ['P62F-PC-H-015','P62F-PC-L-068','P62F-PC-LB-013']:
 patch(d,id,image='question-assets/perfect-competition/pc_market_firm_1-integration.webp')
patch(d,'P62F-PC-L-068','Find equilibrium price in the market panel. How does the price-taking firm use that price and its cost curves to choose output?',tier='medium')
patch(d,'P62F-PC-H-015','Demand has increased from an initial zero-profit equilibrium, before entry and with firm costs unchanged. Find the new price in the market panel. How does it affect the firm\u2019s revenue line, output and economic profit?')
patch(d,'P62F-PC-LB-013','An analyst assigns total market quantity to each firm and recommends minimum-ATC output. Find market price, then explain how the firm should choose output, decide whether to operate and measure profit.',tier='elite')
patch(d,'P62F-PC-EL-018','Find the current price in the market panel. If market price then rises while firm costs stay fixed, how will the firm\u2019s revenue line and chosen output change?',image='question-assets/perfect-competition/pc_market_firm_2-integration.webp')
save(d)
