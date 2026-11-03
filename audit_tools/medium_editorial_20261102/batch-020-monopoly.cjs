'use strict';
const {table,money,finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{for(const item of items.filter(r=>r.conceptId==='monopoly')){
 const old=item.question;let q=old.q,options=[...old.options],m;
 if(m=q.match(/^A monopolist’s prices for quantities 0–5 are (.+)\. (What is marginal revenue .+)$/))q='A single-price monopolist faces the demand schedule below. '+m[2]+table('Price buyers will pay',['Quantity (units)','Price per unit'],m[1].split(', ').map((p,i)=>[i,p]));
 if(m=q.match(/^At its MR=MC output, a monopolist sells ([\d.]+) units at (\$[\d.]+); ATC is (\$[\d.]+) and AVC is (\$[\d.]+)\. What is the correct short-run outcome\?$/)){
  q=`A monopolist’s best positive output is about ${m[1]} units, selling for ${m[2]} per unit. Average total cost is ${m[3]} and average variable cost is ${m[4]}. Fixed costs cannot be avoided this period. The figures are rounded. Which short-run outcome is closest?`;
 }
 if(m=q.match(/^(.+) lowers price from (\$[\d.]+) at (\d+) units to (\$[\d.]+) at (\d+) units\. The output effect is (\$[\d.]+)\. What is the price effect on prior units\?$/))q=`${m[1]} is a single-price monopolist. It lowers price from ${m[2]} to ${m[4]} to increase sales from ${m[3]} to ${m[5]} units. What is the change in revenue on the units it was already selling?`;
 if(m=q.match(/^(.+) would produce Qc=([\d.]+) under the P=MC benchmark but chooses Qm=([\d.]+) as a monopoly\. Which units generate the standard DWL\?$/))q=`${m[1]} is a monopolist producing ${m[3]} units (Qm). The efficient benchmark is ${m[2]} units (Qc), where price equals marginal cost. Which forgone trades account for the deadweight loss?`;
 if(/^P62G-MON-L-0(62|68|71|74)$/.test(item.id))q=q.replace(/^At marginal-cost pricing, (.+) charges (\$[\d.]+) and produces ([\d.]+) units\. Why does it incur a loss of (\$[\d,]+) in this simplified case\?$/,'$1 is a natural monopoly with constant marginal cost of $2 and fixed cost of $4. Under marginal-cost pricing, it supplies $3 units. Why is its economic loss equal to the fixed cost?');
 if(m=q.match(/^(.+) separates Markets A and B with demands (.+)\. At the profit-maximizing quantities QA=([\d.]+) and QB=([\d.]+), which price pair follows\?$/))q=`${m[1]} is a monopolist charging separate prices in Markets A and B. Demand is ${m[2]}. It produces approximately ${m[3]} units in A and ${m[4]} in B. Which pair is closest to the prices it charges?`;
 options=options.map(o=>o.replace(/^PA=(\$[\d.]+), PB=(\$[\d.]+)$/,'Charge $1 in Market A and $2 in Market B.').replace('P<ATC','price is below average total cost'));
 if(m=q.match(/^Suppose only (.+)’s fixed cost increases by \$200\. What changes in the short run\?$/)){
  q=`${m[1]} is a monopolist whose unavoidable fixed cost rises by $200. Demand and variable costs are unchanged, and it continues producing. How do its costs, profit, output, and price change?`;
  options=options.map(o=>o.replace(/^ATC rises; profit falls; output and price stay unchanged\.$/,'Average total cost rises and profit falls, while output and price stay unchanged.').replace(/^MC rises; profit falls; output falls and price rises\.$/,'Marginal cost rises and profit falls, so output falls and price rises.').replace(/^Costs stay unchanged; profit falls; output and price fall\.$/,'Costs stay unchanged, but profit, output, and price all fall.').replace(/^AVC rises; profit falls; output falls to zero and price stays unchanged\.$/,'Average variable cost rises and profit falls, so output falls to zero while price stays unchanged.'));
 }
 if(item.id==='P62G-MON-M-028')q='For a natural monopoly, how do price, output, and the need for a subsidy under average-cost pricing compare with marginal-cost pricing?';
 if(item.id==='P62G-MON-M-030')q='A monopolist can prevent resale between two customer groups. Marginal cost is the same for both, but Group A has less elastic demand than Group B. Which pricing choice would usually maximize profit?';
 if(item.id==='PM6-MON-M-082')q=q.replace('What is the most defensible welfare conclusion?','What can be concluded about total surplus and its distribution?');
 if(item.id==='PM6-MON-M-079')q='A monopolist charges separate prices in different markets. Why does it compare marginal revenue in each market with its common marginal cost?';
 if(item.id==='PM6-MON-M-080')q='A monopolist prevents resale between seniors and students and faces the same marginal cost for both. Seniors have less elastic demand. Which group receives the larger optimal markup?';
 if(item.id==='PM6-MON-M-081')q=q.replace('can eliminate the standard output deadweight loss when:','can eliminate the usual deadweight loss under which condition?');
 if(item.id==='P62G-MON-M-026')q='A single-price monopolist charges $74.33, compared with $32.04 at the competitive benchmark. Demand slopes downward and marginal cost slopes upward, with no externalities. How does restricting output affect surplus?';
 if(!/monopol/i.test(q)&&!['PM6-MON-M-084'].includes(item.id)){
  if(old.image)q='Use the monopolist’s graph. '+q.replace(/^Refer to the graph\. /,'');
  else if(/^A firm/.test(q))q=q.replace(/^A firm/,'A monopolist');
  else if(/^At (.+)’s optimum,/.test(q))q=q.replace(/^At (.+)’s optimum,/,'At the profit-maximizing output for $1, a monopolist,');
  else q='In a market with monopoly power, '+q[0].toLowerCase()+q.slice(1);
 }
 q=q.replace(/a profit-maximizing discriminator/gi,'a profit-maximizing monopolist').replace(/\bP>\$MC\$/,'price above marginal cost');
 if(!old.image){q=q.replace(/\bATC\s*=\s*(\$[\d.]+)/g,'average total cost of $1').replace(/\bAVC\s*=\s*(\$[\d.]+)/g,'average variable cost of $1').replace(/\bMC\s*=\s*(\$[\d.]+)/g,'marginal cost of $1');}
 q=money(q);options=options.map(money);
 finish(item,{q,options},'Read the complete monopoly family; identify the market, replace cryptic schedules and price-cost lists, and clarify rounded inputs and fixed-cost assumptions without increasing the task difficulty.',edit,keep);
}};
