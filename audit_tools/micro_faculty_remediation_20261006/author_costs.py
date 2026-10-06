from author import *

for id,fb in {
'P62C-CPS-M-009':'At E, Q = 8 and P = $10; the demand intercept is $18. Consumer surplus = ½ × 8 × (18 − 10) = $32.',
'P62C-CPS-M-010':'At E, Q = 8 and P = $10; the supply intercept is $2. Producer surplus = ½ × 8 × (10 − 2) = $32.',
'P62C-CPS-M-011':'At E, Q = 8 and P = $10. Consumer surplus = ½ × 8 × (18 − 10) = $32; producer surplus = ½ × 8 × (10 − 2) = $32. Total surplus = $64.',
'P62C-CPS-M-012':'At E, Q = 8 and P = $14; the demand intercept is $30. Consumer surplus = ½ × 8 × (30 − 14) = $64.',
'P62C-CPS-M-013':'At E, Q = 8 and P = $14; the supply intercept is $6. Producer surplus = ½ × 8 × (14 − 6) = $32.',
'P62C-CPS-M-014':'At E, Q = 5 and P = $14. Consumer surplus = ½ × 5 × (24 − 14) = $25; producer surplus = ½ × 5 × (14 − 4) = $25. Total surplus = $50.'}.items(): edit(id,'Add independently recomputed surplus calculations from the inspected graph.',feedback=fb)
for id,text in {
'P62C-CPS-LB-009':'Refer to the graph. A student calculates consumer surplus as 8 × 10 = $80. What is the error and correct result?',
'P62C-CPS-C-021':'Refer to the graph. What is total buyer expenditure at equilibrium?',
'P62C-CPS-C-022':'Refer to the graph. What total revenue do sellers receive at equilibrium?',
'P62C-CPS-C-023':'Refer to the graph. How tall is the producer-surplus triangle?',
'P62C-CPS-C-024':'Refer to the graph. What is sellers’ total production cost at equilibrium?',
'P62C-CPS-C-025':'Refer to the graph. What is the difference between consumer surplus and producer surplus at equilibrium?',
'P62C-CPS-R-015':'A student claims that any proposed exchange can create nonnegative gains from trade. What condition is missing?',
'PMS-CPS-BR-023':'A price control changes the quantity traded. To assess the effect on total surplus, what should an economist examine?',
'P62E-COP-L-082':'The owner uses land for the business that could instead be rented out for $30,000 a year. How should the business account for using this land?',
'P62E-COP-M-036':'Refer to the graph. At Q = 400, what is average fixed cost?',
}.items(): stem(id,text)
edit('P62C-CPS-R-015','Distinguish positive surplus from the zero-surplus boundary.',feedback='An exchange can create nonnegative surplus when the buyer’s value is at least the seller’s cost. Strictly positive gains require value to exceed cost.')
replace('P62C-CPS-R-016','A buyer values a service at $17, but providing it costs the seller $22. With no subsidy or other benefit, will they voluntarily agree to an exchange?', ['Yes, at any price above $22.','Yes, at any price below $17.','Yes, at a price between $17 and $22.','No, no price can cover cost while staying within the buyer’s value.'],3,'The seller needs at least $22 while the buyer will pay at most $17. No price makes both willing to trade; the exchange would reduce total surplus by $5.','Apply the faculty-requested exchange question and make each alternative a plausible pricing claim.')
edit('P62C-CPS-EL-026','Balance choices around the buyer at the cutoff.',options=['The marginal buyer is the lowest-cost seller.','The marginal buyer is just willing to pay the market price.','The marginal buyer must receive the greatest surplus.','The marginal buyer is the person who never purchases.'])
stem('P62C-CPS-H-014','In a competitive market with no external costs or benefits, why does equilibrium maximize total surplus?')
difficulty('P62C-CPS-H-014','medium')
for id in ['P62E-COP-H-003','P62E-COP-H-006','P62E-COP-H-009','P62E-COP-H-012','P62E-COP-C-009','P62E-COP-C-010']:
    s=B[id]['q']['q']; s=s.replace('output schedule','output schedule (workers: total units produced)').replace('production schedule','production schedule (workers: total units produced)')
    s=re.sub(r'MP of worker (\d)\?',r'What is the marginal product of worker \1?',s); stem(id,s,'Label both entries in each production-schedule pair.')
for n in [14,16,18,20,22,24]: key(f'P62E-COP-L-{n:03}','MP falls from worker 4; output rises while MP is positive.')
stem('P62E-COP-L-027','Northstar Bakery produces 20 cakes with two workers earning $120 each. With one worker, it produced 8 cakes. Fixed cost is $240 at either output, and labor is the only variable input. Which set of current costs and marginal cost over the output increase is correct?')
edit('P62E-COP-L-027','Make the before-period labor input explicit and show the full calculation.',feedback='TVC = 2 × $120 = $240; TC = $240 + $240 = $480; ATC = $480/20 = $24. Adding the second worker raises cost by $120 and output by 12 cakes, so MC = $10 per cake.')
stem('P62E-COP-L-028','Ironwood Furniture produces 29 sofas. At this output, AVC is $13.97 and ATC is $24.31, rounded to cents. Which average and total fixed costs are most consistent with these figures?')
edit('P62E-COP-L-028','Explain the approximation created by rounded average costs.',feedback='AFC = $24.31 − $13.97 = $10.34. TFC ≈ 29 × $10.34 = $299.86, or about $300.')
stem('P62E-COP-L-030','Cedar Trail Bikes produces 54 bikes with five workers earning $150 each, up from 45 bikes with four workers. Fixed cost is $420 at either output, and labor is the only variable input. Which set of costs is correct?')
edit('P62E-COP-L-030','Specify the previous wage bill and verify the calculation.',feedback='TVC = 5 × $150 = $750; TC = $420 + $750 = $1,170; ATC = $1,170/54 ≈ $21.67. MC = $150/(54 − 45) ≈ $16.67 per bike.')
stem('P62E-COP-LB-035','Prairie Solar hires a sixth worker, raising output from 74 to 85 units. Each of its six workers earns $155, labor is its only variable input, and fixed cost is $450. Which set of marginal product and cost values is correct?')
edit('P62E-COP-LB-035','Show all independently recomputed checkpoint quantities.',feedback='MP = 85 − 74 = 11; MC = $155/11 ≈ $14.09; TVC = 6 × $155 = $930; TC = $450 + $930 = $1,380; ATC = $1,380/85 ≈ $16.24.')
stem('P62E-COP-C-013','Blue Peak Printing produces 18 printers with two workers earning $110 each. Fixed cost is $210, and labor is the only variable input. What is total cost?')
edit('P62E-COP-C-013','Show the cost components.',feedback='TVC = 2 × $110 = $220. TC = TFC + TVC = $210 + $220 = $430.')
strengthened={
17:('A firm produces 34 units. It pays $180 in rent and $60 in insurance regardless of output, plus $360 for labor used in production. What is average fixed cost?','Fixed cost = $180 + $60 = $240. Labor is variable, so AFC = $240/34 ≈ $7.06.'),
18:('A firm produces 41 units. Labor costs $360 and materials cost $180, both varying with production. Rent is $300 regardless of output. What is average variable cost?','TVC = $360 + $180 = $540. Exclude fixed rent: AVC = $540/41 ≈ $13.17.'),
19:('A firm produces 56 units. Its production labor costs $350 and its materials cost $175. It also pays $180 for a fixed lease. What is average variable cost?','Variable labor and materials total $525. Exclude the lease: AVC = $525/56 = $9.375, or $9.38.'),
20:('At 34 units of output, a firm pays $420 in fixed rent, $300 for production labor and $150 for materials. It earns $1,020 in revenue. What is average total cost?','TC = $420 + $300 + $150 = $870. Revenue is not a cost: ATC = $870/34 ≈ $25.59.'),
21:('A firm produces 43 units, paying $210 for a fixed lease, $300 for labor and $140 for materials. Revenue is $860. What is average total cost?','TC = $210 + $300 + $140 = $650. ATC = $650/43 ≈ $15.12; revenue is not part of cost.'),
23:('Juniper Foods raises output from 32 to 44 units. Variable cost rises from $345 to $470, and its $300 fixed cost is unchanged. What is marginal cost over this output change?','Fixed cost does not change. MC = ($470 − $345)/(44 − 32) = $125/12 ≈ $10.42.'),
24:('Summit Glassworks raises output from 57 to 69 units. Its fixed cost remains $500; variable cost rises from $620 to $780. What is marginal cost over this output change?','MC = ($780 − $620)/(69 − 57) = $160/12 ≈ $13.33. The unchanged fixed cost cancels.'),
25:('Maple Street Media raises output from 15 to 26 units. Labor and materials together rise from $195 to $295, while its $200 lease payment stays unchanged. What is marginal cost over this output change?','MC = ($295 − $195)/(26 − 15) = $100/11 ≈ $9.09. The fixed lease does not contribute to the cost increase.'),
27:('Lakeside Ceramics produces 58 units. It pays $225 for a fixed lease, $400 for production labor and $175 for materials. Revenue is $1,160. What is average total cost?','TC = $225 + $400 + $175 = $800. ATC = $800/58 ≈ $13.79; revenue is irrelevant to average cost.'),
28:('Prairie Solar produces 100 units at a total cost of $1,624. Variable labor costs $700 and materials cost $394. What is average fixed cost?','TVC = $700 + $394 = $1,094. TFC = $1,624 − $1,094 = $530; AFC = $530/100 = $5.30.')}
for n,(q,fb) in strengthened.items():
    id=f'P62E-COP-C-{n:03}'; edit(id,'Strengthen the cost task by requiring selection and combination of relevant costs; preserve the existing numeric key.',q=q,feedback=fb); difficulty(id,'medium')
replace('P62E-COP-C-026','Granite Toolworks produces 40 units. Average fixed cost is $7.50 and average variable cost is $16.75. What is total cost?', ['$24.25','$970','$670','$300'],1,'TFC = 40 × $7.50 = $300; TVC = 40 × $16.75 = $670; TC = $970.','Require recovery of both total fixed and total variable cost, as faculty requested.')
replace('P62E-COP-B2-019','A firm produces 20 units with AFC = $8 and AVC = $12. What is total cost?', ['$400','$240','$160','$20'],0,'TFC = 20 × $8 = $160 and TVC = 20 × $12 = $240. TC = $400.','Use positive output so both average costs are defined; retain the checkpoint role and reconstruct both totals.')
replace('P62E-COP-B2-020','A firm produces 60 units with AFC = $5 and AVC = $15. What is total cost?', ['$900','$1,200','$300','$20'],1,'TFC = 60 × $5 = $300 and TVC = 60 × $15 = $900. TC = $1,200.','Require recovery of both cost totals within the existing checkpoint.')
stem('P62E-COP-B2-026','ATC and AVC differ by $4 when output is 80 units. What is total fixed cost?')
stem('P62E-COP-R-014','As output expands, why does average fixed cost get smaller?')
stem('P62E-COP-R-016','When marginal cost is below average total cost, what happens to average total cost as output increases?')
stem('P62E-COP-L-048',B['P62E-COP-L-048']['q']['q'].replace('Q = 40','Q = 30'),'Use the faculty-specified output to avoid reading at an ambiguous crossing; verify against the graph during the graph pass.')
replace('P62E-COP-L-013','Northstar Bakery’s production schedule is (workers, cakes): (0, 0), (1, 8), (2, 20), (3, 34). New equipment raises output with two workers to 24 cakes and with three workers to 36 cakes. Comparing the third worker before and after the change, which statement correctly relates marginal product to average product?', ['MP falls from 14 to 12; AP rises with the third worker before the change but stays at 12 afterward.','MP rises from 12 to 14; AP stays unchanged before the change but rises afterward.','MP falls from 14 to 12; AP must fall with the third worker after the change.','MP is 34 before and 36 after; AP rises by 2 cakes per worker.'],0,'Before: MP3 = 34 − 20 = 14; AP2 = 10 and AP3 = 34/3 ≈ 11.33. After: MP3 = 36 − 24 = 12; AP2 = AP3 = 12. An added worker raises AP when MP exceeds prior AP, and leaves AP unchanged when they are equal.','Add the requested before-and-after reasoning about marginal and average product.')
replace('P62E-COP-L-015','Harbor Roasters produces 36 units with three workers and 47 with four workers, holding other inputs fixed. What happens to average product when the fourth worker is hired?', ['It falls from 12 to 11 units per worker.','It rises from 12 to 47 units per worker.','It falls from 12 to 11.75 units per worker.','It stays at 12 units per worker.'],2,'AP3 = 36/3 = 12; AP4 = 47/4 = 11.75. The fourth worker adds 11 units, below the previous average, so average product falls.','Require both average-product calculations instead of supplying marginal product.')
id='P62E-COP-L-052'; edit(id,'Explicitly mark graph readings as approximate.',options=[re.sub(r'From (\$\d+) to (\$\d+)',r'From about \1 to about \2',s) for s in B[id]['q']['options']])
stem('P62E-COP-L-060',B['P62E-COP-L-060']['q']['q'].replace('Q = 75','Q = 65'),'Use the faculty-specified quantity; final graph verification must confirm the selected plant.')
edit('P62E-COP-L-072','Spell out the scale concepts rather than truncated labels.',options=['Economies of scale','Diseconomies of scale','Negative marginal product','Constant returns to scale'])

if __name__=='__main__': save()
