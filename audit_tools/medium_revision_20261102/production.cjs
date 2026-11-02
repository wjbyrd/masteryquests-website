module.exports=({edit,choices,items})=>{
const wording={
'P62E-COP-B2-027':'A firm’s marginal cost is below its average variable cost. As the firm produces an additional unit, what happens to average variable cost?',
'P62E-COP-B2-028':'In a graph with a U-shaped average variable cost curve, marginal cost crosses that curve from below. What does this intersection identify?',
'P62E-COP-B2-029':'A firm’s marginal cost is rising but remains below average total cost. What happens to average total cost as output increases?',
'P62E-COP-B2-031':'A firm must pay a larger annual license fee regardless of how much it produces. Which cost curves shift upward?',
'P62E-COP-B2-032':'The materials required for each unit of output become more expensive. Holding productivity and fixed costs constant, which cost curves shift upward?',
'P62E-COP-B2-033':'The wage per worker is unchanged, but each additional worker adds less output than the previous worker. What happens to the labor cost of producing an additional unit?',
'P62E-COP-B2-034':'Refer to the total-cost graph. Total cost equals total variable cost plus which cost? What is that cost’s dollar amount in the graph?',
'P62E-COP-EL-012':'In the average-cost and marginal-cost graph, marginal cost crosses average variable cost at a lower output than it crosses average total cost. What explains the order of these intersections?',
'P62E-COP-L-051':'A firm pays an additional $2 for materials for every unit it produces. With no other cost changes, why do average variable cost and marginal cost both rise by $2?',
'P62E-COP-L-061':'A firm’s annual business-license fee doubles, but its output stays the same. Which average and marginal costs change?',
'P62E-COP-L-062':'A firm begins paying a $3 packaging charge for every unit it produces. For an output of Q units, how does the charge affect total variable cost and the cost per unit?',
'P62E-COP-L-078':'At its planned output, a firm could use one of three plants. Their average total costs are $26, $22, and $25 per unit. What is the lowest average cost the firm can achieve by choosing its plant?',
'P62E-COP-L-079':'A small plant has the lowest average cost at low output, while a large plant has the lowest average cost at high output. What does this imply about the firm’s choice of plant size?',
'P62E-COP-M-023':'An additional worker produces more than the current average output per worker. What happens to average product when that worker is hired?',
'P62E-COP-M-025':'As output expands, the gap between average total cost and average variable cost narrows. Why does this happen when total fixed cost is unchanged?',
'P62E-COP-M-031':'Refer to the graph. Where marginal cost crosses the average variable cost curve at its minimum, what is the value of marginal cost?',
'P62E-COP-M-032':'Refer to the graph. Where marginal cost crosses the average total cost curve, labeled AC, at its minimum, what is the value of marginal cost?',
'P62E-COP-M-035':'Refer to the graph. Where marginal cost crosses the average total cost curve, labeled AC, at its minimum, what cost per unit is shown?',
'P62E-COP-M-040':'At the highest point of the total-product curve, what is the marginal product of labor?',
'P62E-COP-M-041':'Once hiring more workers causes total output to fall, what is the sign of the marginal product of labor?',
'PMC-COP-M-042':'A firm’s total cost is $200 at zero output and $470 at six units. What is its total fixed cost?',
'PMC-COP-M-054':'A firm has total fixed cost of $240 and produces 12 units. What is its average fixed cost?',
'PMC-COP-M-055':'A firm’s total variable cost is $360 at 18 units of output. What is its average variable cost?',
'PMC-COP-M-056':'A firm’s total cost is $600 at 20 units of output. What is its average total cost?',
'PMC-COP-M-057':'At 10 units of output, average fixed cost is $8 and average variable cost is $22. What is average total cost?'
};
for(const [id,q]of Object.entries(wording))edit(id,{q},'Replace compressed terminology with a direct question, retaining the intended economic task.');
choices('P62E-COP-B2-027','It falls.',['It rises.','It stays unchanged.','It equals average fixed cost.']);
choices('P62E-COP-B2-028','The minimum of average variable cost.',['The maximum of average variable cost.','The minimum of marginal cost.','The point where variable cost is zero.']);
choices('P62E-COP-B2-029','Average total cost continues to fall.',['Average total cost begins to rise.','Average total cost stays unchanged.','Average total cost equals marginal cost.']);
choices('P62E-COP-B2-031','Average fixed cost and average total cost.',['Average variable cost and marginal cost.','Marginal cost and average total cost.','Average fixed cost and average variable cost.']);
choices('P62E-COP-B2-032','Average variable cost, average total cost, and marginal cost.',['Average fixed cost alone.','Total fixed cost and average fixed cost.','Average fixed cost and marginal cost alone.']);
choices('P62E-COP-B2-033','Marginal cost rises.',['Marginal cost falls.','Marginal cost stays unchanged.','Marginal cost becomes total fixed cost.']);
choices('P62E-COP-B2-034','$240 in total fixed cost.',['$120 in total fixed cost.','$120 in marginal cost.','$240 in marginal cost.']);
edit('P62E-COP-B2-027',{feedback:'Producing an additional unit at a cost below the current average variable cost pulls that average down.'});
edit('P62E-COP-B2-028',{feedback:'Below the crossing, marginal cost is less than average variable cost and pulls the average down. Above the crossing, marginal cost is greater and pulls the average up. The crossing therefore identifies the minimum.'});
edit('P62E-COP-B2-029',{feedback:'The direction of the average depends on whether marginal cost is above or below it. Marginal cost still pulls average total cost down while it remains below that average, even if marginal cost itself is rising.'});
edit('P62E-COP-B2-031',{feedback:'The license fee raises total fixed cost. At each positive output, average fixed cost and average total cost rise. Variable cost and the cost of an additional unit are unchanged.'});
edit('P62E-COP-B2-032',{feedback:'More expensive materials raise variable cost at each output and the cost of producing an additional unit. Average variable cost, average total cost, and marginal cost shift upward; fixed costs are unchanged.'});
edit('P62E-COP-B2-033',{feedback:'The same wage now buys fewer additional units of output. Labor cost per additional unit equals the wage divided by marginal product, so lower marginal product raises marginal cost.'});
edit('P62E-COP-B2-034',{feedback:'The fixed-cost line is $240. Total cost is $240 at zero output, while total variable cost is zero. At every output, total cost exceeds total variable cost by this same fixed amount.'});
edit('P62E-COP-B2-035',{image:'question-assets/costs-of-production/cop_average_costs_review_20261102.webp',imageAlt:'Average total, variable, and fixed costs, with guides showing average variable cost $20 and average total cost $32 at output 20.',graphDescription:'The vertical axis shows dollars per unit with ticks every $4. At quantity 20, average variable cost is $20 and average total cost is $32. Average fixed cost equals 240 divided by quantity; the gap between total and variable averages narrows as output rises. Quantity 70 is also marked.'},'Use a dedicated, clearly labeled graph so the $12 gap is readable; retain the original asset for all other questions.');
choices('P62E-COP-EL-012','Average variable cost reaches its minimum at a lower output than average total cost.',['Average fixed cost reaches its maximum between the two intersections.','Average total cost must lie below average variable cost at every output.','Fixed costs cause marginal cost to shift upward as output expands.']);
choices('P62E-COP-L-061','Average fixed and total costs rise; average variable and marginal costs are unchanged.',['Average variable and marginal costs rise; average fixed and total costs are unchanged.','All four measures rise by the same amount because the fee is paid annually.','Total fixed cost rises, but every average and marginal cost remains unchanged.']);
choices('P62E-COP-L-062','Total variable cost rises by $3Q; average variable, average total, and marginal costs rise by $3.',['Total fixed cost rises by $3Q; average fixed and average total costs rise by $3.','Total variable cost rises by $3; average variable and marginal costs rise by $3Q.','Total cost rises by $3Q; average total cost rises by $3 while marginal cost is unchanged.']);
edit('P62E-COP-L-062',{feedback:'At Q units, packaging adds $3 × Q to variable cost. Dividing by Q gives an added $3 per unit, so average variable and average total costs rise by $3. Each additional unit also needs $3 of packaging, so marginal cost rises by $3. Fixed cost is unchanged.'});
edit('P62E-COP-L-076',{q:'As a firm expands beyond 90,000 units, additional management layers slow decisions and raise long-run average total cost. Which explanation fits this change?',feedback:'The firm’s larger scale creates coordination problems that raise cost per unit. This is a diseconomy of scale. It differs from diminishing marginal product in the short run, when at least one input is fixed.'},'Explain the long-run coordination mechanism and use competing production concepts as alternatives.');
choices('P62E-COP-L-076','Diseconomies of scale from increasing coordination costs.',['Diminishing marginal product from adding labor to a fixed plant.','Economies of scale from spreading a fixed administrative expense.','Constant returns to scale from proportional changes in inputs and output.']);
edit('P62E-COP-L-078',{feedback:'The firm chooses one plant for the planned output. The lowest available average total cost is $22 per unit. Long-run average cost follows the least-cost option; it does not add or average the costs of alternative plants.'});
const profitCases=[
 ['P62E-COP-M-004','Cedar Trail Bikes',311000,43000,120000,40000,25000],
 ['P62E-COP-M-006','Riverbend Textiles',274000,36000,100000,40000,25000],
 ['P62E-COP-M-008','Summit Glassworks',356000,49000,140000,40000,32000],
 ['P62E-COP-M-010','Granite Toolworks',298000,38000,110000,40000,29000]
];
const money=n=>'$'+n.toLocaleString('en-US');
for(const [id,name,revenue,rent,wages,materials,forgone]of profitCases){const expenses=rent+wages+materials,profit=revenue-expenses;
 edit(id,{q:`${name} receives ${money(revenue)} in annual revenue. It pays ${money(rent)} in rent, ${money(wages)} in wages, and ${money(materials)} for materials, with no other explicit expenses. The owner also gives up a ${money(forgone)} salary elsewhere. What is accounting profit?`,feedback:`Explicit expenses total ${money(rent)} + ${money(wages)} + ${money(materials)} = ${money(expenses)}. Accounting profit is ${money(revenue)} − ${money(expenses)} = ${money(profit)}. The forgone salary is an implicit opportunity cost used in economic profit, not accounting profit.`},'Provide individual costs and require the student to distinguish explicit expenses before calculating accounting profit.');
 choices(id,money(profit),[money(profit-forgone),money(expenses),money(revenue+expenses)]);
}
for(const [id,revenue,explicit,salary,capital]of [['P62E-COP-M-005',138000,83000,32000,7000],['P62E-COP-M-007',205000,132000,44000,11000],['P62E-COP-M-009',149000,89000,35000,8000]]){
 const implicit=salary+capital,total=explicit+implicit,profit=revenue-total;
 edit(id,{feedback:`The forgone salary and capital income are implicit opportunity costs: ${money(salary)} + ${money(capital)} = ${money(implicit)}. Adding explicit cost gives total economic cost of ${money(explicit)} + ${money(implicit)} = ${money(total)}. Economic profit is ${money(revenue)} − ${money(total)} = ${money(profit)}.`},'Show both the opportunity-cost classification and the economic-profit calculation.');
}
const productionCases=[
 ['P62E-COP-M-011','Northstar Bakery',[1,2,3,4],[8,20,34,44],2],
 ['P62E-COP-M-013','Harbor Roasters',[2,3,4,5],[24,36,47,56],4],
 ['P62E-COP-M-015','Blue Peak Printing',[4,5,6,7],[41,53,61,67],6],
 ['P62E-COP-M-017','Juniper Foods',[1,2,3,4],[7,19,32,47],3],
 ['P62E-COP-M-019','Maple Street Media',[3,4,5,6],[25,37,47,55],5]
];
for(const [id,name,workers,outputs,target]of productionCases){const i=workers.indexOf(target),mp=outputs[i]-outputs[i-1],next=outputs[i+1]-outputs[i],comparison=mp>next?'greater':'smaller',reverse=mp>next?'smaller':'greater';
 const table='<table><tr><th>Workers</th>'+workers.map(n=>`<td>${n}</td>`).join('')+'</tr><tr><th>Total output</th>'+outputs.map(n=>`<td>${n}</td>`).join('')+'</tr></table>';
 edit(id,{q:`${name} records the production schedule below, with other inputs fixed. What is the marginal product of worker ${target}, and how does it compare with the marginal product of worker ${target+1}?${table}`,feedback:`Worker ${target} adds ${outputs[i]} − ${outputs[i-1]} = ${mp} units. Worker ${target+1} adds ${outputs[i+1]} − ${outputs[i]} = ${next} units. Thus worker ${target} has a ${comparison} marginal product. Use the changes in total output, not total output itself or output divided by all workers.`},'Use a fuller production schedule and require selection and comparison of marginal products.');
 choices(id,`${mp} units; ${comparison} than worker ${target+1}'s marginal product.`,[`${mp} units; ${reverse} than worker ${target+1}'s marginal product.`,`${outputs[i]} units; ${comparison} than worker ${target+1}'s marginal product.`,`${next} units; equal to worker ${target+1}'s marginal product.`]);
}
edit('P62E-COP-M-022',{q:'With other inputs fixed, a firm adds workers and records each worker’s marginal product. What does the first decline in marginal product indicate?'},'Replace a tautological fragment with a clear production comparison and plausible misconceptions.');
choices('P62E-COP-M-022','The next worker adds less output than the previous worker.',['Total output has begun to fall as workers are added.','Average output per worker must already be zero.','The firm’s long-run average cost must have begun to rise.']);
edit('P62E-COP-M-022',{feedback:'Diminishing marginal product begins when an additional worker contributes less output than the preceding worker. Total output can still rise as long as marginal product remains positive. This short-run pattern does not by itself establish diseconomies of scale.'});
choices('P62E-COP-M-023','Average product rises.',['Average product falls.','Average product stays unchanged.','Average product becomes negative.']);
choices('P62E-COP-M-025','The same total fixed cost is spread over more units of output.',['Total fixed cost falls as the firm produces additional units.','Marginal cost falls by the same amount as average variable cost.','Total variable cost stops increasing once fixed costs are covered.']);
edit('P62E-COP-M-025',{feedback:'Average total cost equals average variable cost plus average fixed cost. The gap is therefore total fixed cost divided by output. With the numerator unchanged, more output reduces the gap.'});
choices('P62E-COP-M-029','The same inputs produce more output, reducing cost per unit.',['The firm spreads a larger fixed cost across fewer units.','The firm pays higher input prices without changing output.','The demand for the firm’s output rises without a production change.']);
choices('P62E-COP-M-030','Economies of scale.',['Diseconomies of scale.','Constant returns to scale.','Diminishing marginal product with plant size fixed.']);
edit('P62E-COP-M-030',{q:'A firm expands its scale of production and its long-run average total cost falls. What does this range of the cost curve represent?',feedback:'Falling cost per unit as the firm expands its long-run scale is economies of scale. A short-run marginal-product change with a fixed input is a different comparison.'},'Spell out long-run average total cost and distinguish related production concepts.');
edit('P62E-COP-M-040',{feedback:'Marginal product measures the change in total output from another unit of labor. At the peak of a smooth total-product curve, its slope is zero, so marginal product is approximately zero.'});
edit('P62E-COP-M-041',{feedback:'If an additional worker reduces total output, the change in output from that worker is negative. Marginal product is therefore negative in this part of the production schedule.'});
edit('PMC-COP-M-008',{q:'A business pays $20,000 in rent, $35,000 in employee wages, and $15,000 for materials. The owner gives up a $40,000 salary and $5,000 in interest by operating the business. There are no other costs. What are total explicit cost and total economic cost?',feedback:'The cash expenses are explicit costs: $20,000 + $35,000 + $15,000 = $70,000. The forgone salary and interest are implicit costs totaling $45,000. Total economic cost includes both, so it is $70,000 + $45,000 = $115,000.'},'Require classification and aggregation of explicit and implicit costs.');
choices('PMC-COP-M-008','$70,000 explicit cost and $115,000 economic cost.',['$115,000 explicit cost and $115,000 economic cost.','$70,000 explicit cost and $70,000 economic cost.','$45,000 explicit cost and $115,000 economic cost.']);
const expanded={
'PMC-COP-M-042':'At zero output, variable cost is zero. The $200 total cost at zero output is therefore total fixed cost; the additional cost at six units is variable cost.',
'PMC-COP-M-054':'Average fixed cost is total fixed cost divided by output: $240 ÷ 12 = $20 per unit.',
'PMC-COP-M-055':'Average variable cost is total variable cost divided by output: $360 ÷ 18 = $20 per unit.',
'PMC-COP-M-056':'Average total cost is total cost divided by output: $600 ÷ 20 = $30 per unit.',
'PMC-COP-M-057':'Average total cost equals average fixed cost plus average variable cost: $8 + $22 = $30 per unit.'
};for(const [id,feedback]of Object.entries(expanded))edit(id,{feedback});
edit('PMC-COP-M-101',{q:'At 20 units of output, a firm’s total cost is $600 and its total variable cost is $480. What is its average fixed cost?',feedback:'Total fixed cost is the difference between total and variable cost: $600 − $480 = $120. Divide by output to obtain average fixed cost: $120 ÷ 20 = $6 per unit.'},'Implement the requested total-cost and variable-cost calculation before finding average fixed cost.');
choices('PMC-COP-M-101','$6 per unit.',['$120 per unit.','$24 per unit.','$30 per unit.']);
edit('PMC-COP-M-135',{q:'What distinguishes the long-run average cost curve from the short-run average total cost curve for one plant?'},'Spell out the cost measures and balance the comparison across choices.');
choices('PMC-COP-M-135','The long-run curve allows plant choice at each output; the short-run curve holds plant size fixed.',['The long-run curve holds plant size fixed; the short-run curve allows plant choice at each output.','Both curves hold plant size fixed; only the long-run curve includes the firm’s variable costs.','Both curves allow plant choice at each output; only the short-run curve includes the firm’s fixed costs.']);
};
