'use strict';
const {table,costs,finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{
 for(const item of items.filter(r=>r.conceptId==='perfect-competition')){
  const old=item.question;let q=old.q,options=[...old.options],m;
  if(m=q.match(/^(.+) is a price-taking firm(?: facing price|\. Price is) (\$\d+)(?:, fixed cost is (\$\d+), and marginal costs for units 1–6 are |\. Fixed cost is (\$\d+) and is unavoidable this period\. Marginal costs of units 1–6 are )([^.]+)\./)){
   q=`${m[1]} is a price-taking firm facing a price of ${m[2]} per unit. Fixed cost is ${m[3]||m[4]} and cannot be avoided this period. Variable cost is zero at zero output. Which output maximizes profit, and what economic profit or loss results?`+table('Cost of each additional unit',['Unit','Marginal cost'],m[5].split(', ').map((v,i)=>[i+1,v]));
   options=options.map(o=>o.replace(/Produce (\d+) units(?:;| with) economic (profit|loss) of (\$[\d,]+)/,'Produce $1 units and earn an economic $2 of $3').replace(/Shut down; economic loss of (\$[\d,]+)/,'Shut down and incur an economic loss of $1'));
  }
  if(/^P62F-PC-L-0(3[1-9]|4[0-5])$/.test(item.id)){
   q=q.replace('How does this change affect the firm’s cost curves and short-run output decision?','The firm takes market price as given. With other conditions unchanged, how do its costs and current output change?');
   if(/lease|insurance|license|annual grant|lump-sum|rebate/i.test(q))q+=' The fixed payment or subsidy does not depend on whether it produces this period.';
   options=options.map(o=>costs(o).replace(/; current output is unchanged/g,', so current output is unchanged.').replace(/; marginal cost is unchanged/g,', while marginal cost is unchanged').replace(/; /g,'. ').replace(/(^|\. )([a-z])/g,(m,p,c)=>p+c.toUpperCase()));
  }
  if(m=q.match(/^At its chosen output, a firm has P=(\$\d+), ATC=(\$\d+), and Q=(\d+)\. Calculate the economic loss\.$/))q=`A competitive firm produces ${m[3]} units at a price of ${m[1]} per unit. Average total cost at that output is ${m[2]}. What is its total economic loss?`;
  if(m=q.match(/^A firm faces P=(\$\d+), minimum AVC=(\$\d+), and fixed cost (\$\d+)\. Apply the shutdown rule\.$/))q=`A competitive firm faces a price of ${m[1]} per unit and minimum average variable cost of ${m[2]}. Fixed cost of ${m[3]} is unavoidable this period. Should it produce or shut down in the short run?`;
  if(m=q.match(/^A firm’s MC schedule is (.+)\. Minimum AVC is (\$\d+)\. At price (\$\d+), quantity supplied is:$/))q=`A competitive firm has the marginal-cost schedule below and minimum average variable cost of ${m[2]}. How much will it supply at a market price of ${m[3]}?`+table('Cost schedule',['Output (units)','Marginal cost'],m[1].split(', ').map(s=>{const x=s.match(/(\$\d+) at Q=(\d+)/);if(!x)throw new Error(s);return [x[2],x[1]];}));
  const stems={
   'P62F-PC-H-026':'A competitive firm has smooth, U-shaped average total cost. At its chosen output, price equals marginal cost and exceeds minimum average total cost. There are no externalities. Is this output allocatively efficient, productively efficient, both, or neither?',
   'P62F-PC-H-028':'In a market being compared with perfect competition, sellers know product quality but buyers cannot distinguish it. Which assumption of the competitive model is weakened?',
   'P62F-PC-C-030':'A competitive firm produces 60 units. Price and marginal cost both equal $24, and average total cost is $20. There are no externalities. What are its economic profit and allocative-efficiency status?',
   'P62F-PC-B3-043':'For a competitive firm, which condition represents productive efficiency?',
   'P62F-PC-B3-044':'In a competitive market without externalities, which condition represents allocative efficiency?',
   'P62F-PC-B3-046':'In a competitive industry with free entry, what condition removes the incentive for additional firms to enter?',
   'P62F-PC-B3-047':'In a competitive industry, what condition removes the incentive for remaining firms to exit?',
   'P62F-PC-B3-051':'In an otherwise competitive market, buyers cannot evaluate product quality. Which conclusion is threatened by this information problem?',
  };
  if(stems[item.id])q=stems[item.id];
  if(item.id==='P62F-PC-C-023')options[1]='Shut down because producing would cause a larger loss.';
  options=options.map(o=>o.replace(/Operate: lose (\$\d+); shut down: lose (\$\d+)\./,'Operating loses $1, while shutdown loses $2.').replace(/A loss alone requires shutdown regardless of the avoidable-cost comparison\./,'The firm should shut down because any economic loss makes production unprofitable.').replace(/Economic loss of -\$(\d+)/,'Economic loss of $$$1'));
  q=q.replace(/Which conclusion is strongest\?/g,'What does this imply?');
  if(!/competitive|competition|price-taking|price taker/i.test(q)){
   if(/^P62F-PC-L-0(7[89]|8[1258])$/.test(item.id))q='Compared with the perfect-competition model, '+q[0].toLowerCase()+q.slice(1);
   else if(/^Refer to the graph\./.test(q))q=q.replace('Refer to the graph.','Refer to the graph of a competitive firm.');
   else if(/^A firm\b/.test(q))q=q.replace(/^A firm/,'A competitive firm');
   else if(/^Firms\b/.test(q))q=q.replace(/^Firms/,'Competitive firms');
   else if(/\bindustry\b/.test(q))q=q.replace(/\bindustry\b/,'competitive industry');
   else q='In a perfectly competitive market, '+q[0].toLowerCase()+q.slice(1);
  }
  if(/^P62F-PC-L-0(7[89]|8[12358])$/.test(item.id))q='Consider a market being assessed against the assumptions of perfect competition. '+old.q.replace('Which conclusion is strongest?','What does this imply?');
  if(old.image&&q.startsWith('In a perfectly competitive market, ')){const rest=q.slice('In a perfectly competitive market, '.length).replace(/^use the graph\. /,'');q='Use the graph for a perfectly competitive market. '+rest[0].toUpperCase()+rest.slice(1);}
  q=q.replace('With other conditions unchanged, how do its costs and current output change? The fixed payment or subsidy does not depend on whether it produces this period.','The fixed payment or subsidy applies whether or not it produces this period. With other conditions unchanged, how do its costs and current output change?');
  if(item.id==='P62F-PC-C-029')q=q.replace('In a perfectly competitive market, a market has','A perfectly competitive market has');
  if(item.id==='P62F-PC-M-011')q='A competitive firm chooses 50 units, where marginal revenue equals marginal cost. Price is $40, average total cost is $32, and average variable cost is $22. What should the firm conclude about short-run production and profit?';
  finish(item,{q,options},'Make the competitive setting explicit, replace mechanical prompts and fragmented comparisons, and clarify the operating assumptions without changing difficulty or numerical results.',edit,keep);
 }
};
