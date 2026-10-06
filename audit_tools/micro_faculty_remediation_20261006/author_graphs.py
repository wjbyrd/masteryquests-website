from author import *

graph_reason='Rebuild the graph with direct curve labels, redundant line styles and exact needed coordinate guides; verify all shared references against the same explicit model.'
# Every graph-only flag below is tied to an actual staged asset, checked in the
# final validator. It is not a declaration of completed visual QA.
for id,r in M.items():
    if r['state']=='FACULTY FLAG' and r['issue']=='Graph' and B[id]['q'].get('image'):
        edit(id,graph_reason)
stem('42753','Refer to the graph. At a cumulative population share of 40%, how far below the equality line is the Lorenz curve? Is that vertical gap the Gini coefficient?','Specify the population coordinate: equality40 minus Lorenz15 is25 percentage points. The faculty note’s15 is the curve height, not the gap; retain the validated current key25.')
edit('42325','Add $15 and $25 guides at employment6000 to LABOR01; preserve product value, opportunity cost, and surplus reasoning.')
for id in ['P62G-MON-H-009','P62G-MON-H-010']:
    replace(id,('A monopolist faces inverse demand P = 40 − 1.5Q and average variable cost AVC = 45 + 0.1Q. Fixed cost is unavoidable this period. Which operating decision maximizes profit?' if id.endswith('009') else 'At every positive output, a monopolist’s sales revenue is below its variable cost. Its fixed cost is unavoidable this period. Which costs can sales cover, and what should the firm do?'),
        ['Produce where demand equals marginal cost.','Shut down and bear the unavoidable fixed cost.','Produce enough to spread fixed cost over more units.','Produce because fixed cost is already committed.'] if id.endswith('009') else ['Sales cover variable cost; produce and bear fixed cost.','Sales cover all economic costs; produce at a profit.','Sales do not cover variable cost; shut down and bear fixed cost.','Sales do not cover fixed cost; shutting down eliminates it.'],
        1 if id.endswith('009') else 2,
        'At every positive output, total revenue is less than variable cost. Producing adds an operating loss to unavoidable fixed cost. Shutdown avoids variable cost and leaves only fixed cost.',
        'Replace the faculty-rejected shutdown graph with an explicit worded economic decision.')
    edit(id,'Remove graph-specific fields after replacing the image task.',remove_fields=['image','imageAlt','graphDescription','graphRequired','graphAccessible','graphAccessibility'])
replace('P62I-OLI-H-023','Refer to the graph. If the cartel expands joint output from 24 to 48 units, how does its operating profit change?', ['$864 to $0','$432 to $864','$864 to $432','$0 to $864'],0,'At Q=24, price is $54 and constant marginal cost is $18, so operating profit is (54−18)×24=$864. At Q=48, price equals $18, so operating profit is zero.','Replace the flagged repeated output-selection question with a comparison of cartel and competitive output using the same graph.')
for id,name in {'P62F-PC-E-041':'PC-06-market-only','P62F-PC-E-045':'PC-08-market-only','P62F-PC-H-043':'PC-07-firm-only','P62F-PC-E-043':'PC-07-price-transfer','P62F-PC-B2-024':'pc_profit_a-original-price'}.items():
    edit(id,'Use a dedicated graph variant to implement the faculty request while protecting other users of the shared original.',image='question-assets/perfect-competition/'+name+'.webp')
stem('P62F-PC-EL-043','Use the equilibrium price from the market panel. What output should the firm produce, and how is that determined?')
opts=B['P62F-PC-EL-043']['q']['options'].copy();opts[0]='50 units; determine where MR = MC.';opts[1]='75 units; determine where MR > MC.'
edit('P62F-PC-EL-043','Apply faculty’s explicit A/B alternatives; retain remaining choices and the validated key.',options=opts)
for id in ['P62F-PC-H-011','P62F-PC-L-061','P62F-PC-H-016','P62F-PC-B1-005']:
    q=B[id]['q'];s=q['q'].replace('Approximately what','What');opts=[re.sub(r'\bAbout\s+','',o) for o in q['options']]
    edit(id,'Use exact P40/Q60 guides, remove Q1 and approximate language as requested.',q=s,options=opts)
for id in ['P62F-PC-L-062','P62F-PC-B2-024','P62F-PC-B2-025']:
    q=B[id]['q'];stem(id,q['q'].replace('At Q1 in the graph','At the marked output').replace('approximate height','height'))
for id in ['P62F-PC-H-012','P62F-PC-L-064']:
    opts=B[id]['q']['options'].copy();a=B[id]['answer'];opts[a]=opts[a].replace('Produce at the rising-MC intersection','Produce where MR = MC')
    edit(id,'Use the requested MR=MC phrasing with exact P20/Q50 readings.',options=opts)
difficulty('P62F-PC-H-012','hard')
for id in ['P62F-PC-EL-018','P62F-PC-H-015']:
    q=B[id]['q'];edit(id,'Call the horizontal firm line marginal revenue explicitly.',q=q['q'].replace('revenue line','marginal revenue line'),options=[o.replace('revenue line','marginal revenue line') for o in q['options']])
stem('P62F-PC-LB-015',B['P62F-PC-LB-015']['q']['q'].replace('at Q1','at Q = 50'),'The faculty requested removal of Q1; refer to the same marked numeric quantity50.')
disposition('P62F-PC-B2-032','VERIFIED ALREADY RESOLVED','Workbook graph comment does not match the current canonical record: it is a text-only per-unit-tax adjustment question, with no image and no18/22 readings. Current key correctly reduces output until new MC equals price subject to AVC. Do not attach an unrelated graph or change the current assessment.')
edit('P62E-COP-L-060','At the faculty-requested Q65, Plant2 is the lowest available plant curve. Update the key from optionD to optionA and synchronize feedback.',correct_index=0,feedback='At Q = 65, SRATC2 lies below SRATC1 and SRATC3. Choose the plant with the lowest average cost at the required output; do not average the costs of the available plants.')
edit('P62E-COP-L-048','Synchronize the explanation with the faculty-requested Q30; MC remains below ATC.',feedback='At Q = 30, MC is below ATC. An additional unit costs less than the current average, so a small increase in output lowers ATC even though MC is rising.')

for id in ['P62F-PC-H-011','P62F-PC-L-061']:
    edit(id,'Synchronize feedback with the exact rebuilt graph coordinates.',feedback='The horizontal price line meets rising MC at 60 units. Price is $40 and ATC is $26, so profit is ($40−$26)×60=$840. First choose output using MR=MC; then use ATC at that output to measure profit.')
for id in ['P62F-PC-H-016','P62F-PC-B1-005']:
    edit(id,'Replace the removed Q1 label with the marked numeric output in feedback.',feedback='At Q=60, price equals rising MC. Just below this output, MR=P exceeds MC; just above it, MC exceeds MR. This change in marginal profit identifies a maximum, unlike a falling-MC crossing.')
edit('P62F-PC-L-062','Synchronize the profit rectangle explanation with the numeric graph guides.',feedback='At Q=60, price is $40 and ATC is $26. The height is P−ATC=$14 per unit. Multiplying by 60 units gives total profit of $840.')
edit('P62F-PC-B2-024','Use the faculty-requested original price in the dedicated graph and explanation.',feedback='At Q=60, price is $37 and ATC is $24. The height is P−ATC=$13 per unit. Multiplying by 60 units gives total profit of $780.')
edit('P62F-PC-B2-025','Synchronize the loss rectangle explanation with numeric graph guides.',feedback='At Q=50, price is $20 and ATC is $25. The height is ATC−P=$5 per unit. Multiplying by 50 units gives total loss of $250.')
for id in ['P62F-PC-H-012','P62F-PC-L-064']:
    edit(id,'Replace the removed Q1 label and give exact cost comparisons.',feedback='At Q=50, price is $20, AVC is $16 and ATC is $25. Revenue covers variable cost and contributes $200 toward fixed cost. Producing loses $250, less than the $450 fixed cost lost on shutdown, so the firm should produce where MR=MC.')
edit('P62F-PC-L-065','Honor the faculty price correction and removal of Q1 in the explanation as well as the asset.',feedback='At Q=50, price is $20, above AVC of $16 but below ATC of $25. Current operation covers some fixed cost. Later exit reduces market supply, raising price and each survivor’s horizontal MR; with unchanged cost curves, output rises along MC until total costs are covered.')
edit('P62F-PC-LB-015','Reconcile the fixed-fee explanation with the rebuilt graph’s P30, ATC22 and Q50.',feedback='At Q=50, price is $30 and ATC is $22, a profit margin of $8 per unit. Adding $20 to ATC raises it to $42, creating a $12-per-unit loss. The fee leaves MR, MC and AVC unchanged, so the short-run output decision and positive contribution toward fixed cost remain. If the loss persists, avoiding the fee next year supports exit.')

if __name__=='__main__':save()
