'use strict';
const {money,table,costs,sentence,finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{
 for(const item of items.filter(r=>r.conceptId==='costs-of-production')){
  const old=item.question;let q=old.q,options=[...old.options],feedback=old.feedback,m;
  if(m=q.match(/^(.+) pays each worker (\$[\d,]+)\. Worker (\d+) raises output from (\d+) to (\d+)\. Which pair is correct\?$/)){
   q=`${m[1]} pays each worker ${m[2]} per period. Hiring worker ${m[3]} raises output from ${m[4]} to ${m[5]} units, with other inputs unchanged. Labor is the only variable cost. What are this worker's marginal product and the marginal cost of the added output?`;
   options=options.map(o=>{const a=o.match(/^(MP|AP)=(.+) units and MC=(\$[\d,.]+)(?: per unit)?$/);if(!a)throw new Error(o);return `${a[1]==='MP'?'Marginal':'Average'} product is ${a[2]} units, and marginal cost is ${a[3]} per unit.`;});
   feedback=`The worker adds ${+m[5]-+m[4]} units. Divide the ${m[2]} wage by that additional output to obtain marginal cost of $${(Number(m[2].replace(/[$,]/g,''))/(+m[5]-+m[4])).toFixed(2)} per unit.`;
  }else if(m=q.match(/^At (.+), Q=(\d+), TFC=(\$[\d,]+), and (\d+) workers each cost (\$[\d,]+)\. Which cost identity is correct\?$/)){
   q=`${m[1]} produces ${m[2]} units per period. Fixed cost is ${m[3]}, and each of its ${m[4]} workers earns ${m[5]} per period. Labor is the only variable cost. What are average fixed, average variable, and average total cost?`;
   options=options.map(o=>{const a=o.match(/^AFC=(.+), AVC=(.+), ATC=(.+)$/);if(!a)throw new Error(o);return `Average fixed cost is ${a[1]}, average variable cost is ${a[2]}, and average total cost is ${a[3]} per unit.`;});
  }else if(m=q.match(/^(.+) has output schedule \(workers: total units produced\) (.+)\. With all else fixed, diminishing marginal product first appears when which worker is added\?$/)){
   q=`${m[1]} produces the output shown below, with other inputs held fixed. With which additional worker does diminishing marginal product first appear?`+table('Production per period',['Workers','Total output (units)'],m[2].split(', ').map(s=>s.split(':')));
  }else if(m=q.match(/^(.+) production schedule \(workers: total units produced\) through worker (\d+): (.+)\. What is the marginal product of worker \d+\?$/)){
   q=`${m[1]} has the production schedule below, with other inputs held fixed. What is the marginal product of worker ${m[2]}?`+table('Production per period',['Workers','Total output (units)'],m[3].split(', ').map(s=>s.split(':')));
  }else if(m=q.match(/^(.+) TFC rises by (\$[\d,]+) while Q=(\d+) and variable spending are unchanged\.(.+)$/)){
   q=`${m[1]}'s total fixed cost rises by ${m[2]}. Output stays at ${m[3]} units, and the variable-cost schedule is unchanged.${m[4]}`;
   options=options.map(o=>sentence(costs(o).replace('; ','. ')));
  }else if(m=q.match(/^(.+) has TFC (\$[\d,]+), (\d+) workers at (\$[\d,]+), and Q=(\d+)\. What is total cost\?$/)){
   q=`${m[1]} produces ${m[5]} units per period with ${m[3]} workers earning ${m[4]} each. Fixed cost is ${m[2]}, and labor is the only variable cost. What is total cost?`;
  }else if(m=q.match(/^(.+) TC rises from (\$[\d,]+) to (\$[\d,]+) as Q rises from (\d+) to (\d+)\. What is marginal cost over this output change\?$/))q=`${m[1]}'s total cost rises from ${m[2]} to ${m[3]} as output rises from ${m[4]} to ${m[5]} units. What is marginal cost over this increase?`;
  const stems={
   'P62E-COP-H-016':'A process improvement raises output at every level of labor. Input prices are unchanged. What happens to the cost of producing a given quantity?',
   'P62E-COP-H-021':'What is the smallest output at which long-run average total cost reaches its flat minimum?',
   'P62E-COP-H-022':'What does the long-run average total cost curve show about the plant sizes available to a firm?',
   'P62E-COP-H-028':'With input prices unchanged, which change can lower marginal cost without changing total fixed cost?',
   'P62E-COP-H-029':'A firm has positive fixed cost. Its marginal cost is below average variable cost but above average total cost. Is this combination possible?',
   'PMC-COP-H-137':'The table gives the lowest average total cost available across three plant sizes at each output. How does long-run average cost change as output rises?'+table('Available plant choices',['Output (units)','Lowest average total cost'],[[1000,'$22'],[2000,'$17'],[3000,'$19']]),
   'PMC-COP-H-159':'The table shows long-run average cost. Which statement identifies minimum efficient scale and the range of constant returns to scale?'+table('Long-run costs',['Output (thousand units)','Average cost per unit'],[[1,'$22'],[2,'$18'],[3,'$15'],[4,'$15'],[5,'$17']]),
   'PMC-COP-H-161':'A firm can produce 6,000 units at a long-run average cost of $20, 8,000 or 10,000 units at $16, and 12,000 units at $18. What does this imply about minimum efficient scale?',
   'P62E-COP-C-029':'A firm doubles all inputs and total cost, increasing output from 1,000 to 2,400 units. Initially, long-run average cost is $30 per unit. What is the new long-run average cost?',
   'P62E-COP-C-030':'Long-run total cost is $480,000 at 12,000 units and $675,000 at 15,000 units. Which output has the lower average cost, and by how much?',
   'P62E-COP-B3-039':'At the same positive output, production wages rise while plant rent and technology are unchanged. Which cost measures rise?',
   'P62E-COP-B3-040':'A firm’s property tax rises by a fixed annual amount while output is unchanged. Which cost measures rise?',
   'P62E-COP-B3-049':'Why can an increase in fixed cost leave marginal cost unchanged?',
   'P62E-COP-B3-053':'Why does long-run average total cost follow the lower boundary of the available short-run average total cost curves?',
  };
  if(stems[item.id])q=stems[item.id];
  if(item.id==='P62E-COP-B3-049')options=['Marginal cost measures average cost, which always falls when output rises.','Fixed cost is recovered through revenue, so it is excluded from total cost.','Fixed cost does not change when output changes.','A larger fixed payment automatically lowers the variable cost of the next unit.'];
  if(['PMC-COP-H-159','PMC-COP-H-161','P62E-COP-B3-045'].includes(item.id)){q=q.replace(/\bMES is:/,'What is minimum efficient scale?');options=options.map(o=>o.replace(/\bMES\b/g,'Minimum efficient scale').replace('; ','. '));}
  if(!old.image&&!/^(P62E-COP-H-00[1-9]|P62E-COP-H-01[0-2])$/.test(item.id)){
   q=costs(q).replace(/\bQ\s*=\s*([\d,]+)/g,'an output of $1 units');
   if(!/=/g.test(options.join(' ')))options=options.map(o=>sentence(costs(o)));
  }
  q=money(q);options=options.map(money);
  finish(item,{q,options,feedback},'Replace compressed cost notation and dense schedules with readable prose or tables; clarify fixed and variable cost assumptions and retain the original economic task.',edit,keep);
 }
};
