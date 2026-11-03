'use strict';
const {finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{for(const item of items.filter(r=>r.conceptId==='factor-markets')){
 const old=item.question;let q=old.q,options=[...old.options],m;
 q=q.replace('What relationship among productive inputs does the scenario imply?','How are these inputs related in production?').replace('What principle is operating?','What does this imply about marginal and total output?').replace('What is MPL over this change?','What is the marginal product per additional worker?').replace('Calculate marginal product per added worker.','What is the marginal product per additional worker?');
 if(options.some(o=>/total additional/.test(o))){
  const correct=options[item.correctIndex].match(/^([\d.]+) (.+) per added worker$/);if(!correct)throw Error(item.id);
  let replacement=+correct[1]/2;
  if(m=old.q.match(/increases labor from (\d+) to \d+ workers, and output rises from (\d+)/))replacement=+m[2]/+m[1];
  else if(m=old.q.match(/Output .+ rises from (\d+) to \d+ .+ when staffing rises from (\d+)/))replacement=+m[1]/+m[2];
  const nums=options.map(o=>Number((o.match(/^[\d.]+/)||[])[0]));
  if(nums.some(n=>Math.abs(n-replacement)<.01))replacement=+correct[1]*2;
  options=options.map((o,j)=>{const n=Number((o.match(/^[\d.]+/)||[])[0]);return `${j!==item.correctIndex&&n===+correct[1]?Number(replacement.toFixed(1)):n} ${correct[2]} per additional worker.`;});
 }
 const stems={
 '42407':'A competitive car wash can hire another worker who would wash 3 additional cars per hour, selling for $15 each. Should it pay this worker $40 per hour?',
 '42409':'A competitive landscaping firm’s next worker would complete 4 additional lawns per hour, selling for $14 each. Would hiring the worker for $60 per hour raise profit?',
 '42419':'An additional worker at a competitive laundry would wash 8 more loads per hour, selling for $5 each. Should the firm hire the worker for $44 per hour?',
 '42421':'A competitive nursery’s next worker would produce 6 additional flats of plants per hour, selling for $9 each. Would hiring the worker for $60 per hour raise profit?',
 '42422':'A competitive cabinet shop’s next worker would produce 2 additional cabinets per hour, selling for $28 each. Should the shop hire the worker for $50 per hour?',
 '42423':'An additional worker at a competitive packing plant would produce 10 more cases per hour, selling for $6 each. Should the plant hire the worker for $65 per hour?',
 };
 if(stems[item.id])q=stems[item.id];
 if(/^4240[479]$|^4241[269]$|^4242[123]$/.test(item.id)){
  q=q.replace('The wage is $42.','The wage is $42 per hour.').replace('The wage is $72.','The wage is $72 per hour.').replace('The wage is $58.','The wage is $58 per hour.');
  options=options.map(o=>o.replace('because VMP exceeds the wage','because the value of the added output exceeds the wage').replace('because VMP is below the wage','because the value of the added output is below the wage').replace('because any positive VMP raises profit','because any added revenue raises profit, regardless of the wage'));
 }
 q=q.replace('What is the labor-demand effect?','How does demand for labor respond?');
 options=options.map(o=>o.replace(/\bMPL\b/g,'marginal product of labor').replace('putting downward pressure on wage.','putting downward pressure on wages.').replace('putting upward pressure on wage.','putting upward pressure on wages.'));
 finish(item,{q,options},'Read the complete factor-market family; clarify time units and hiring decisions, expand compressed terminology, and remove numerically equivalent distractors from marginal-product questions.',edit,keep);
}};
