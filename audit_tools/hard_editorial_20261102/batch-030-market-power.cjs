'use strict';
const {money,table,costs,finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{
 for(const item of items.filter(r=>['monopoly','monopolistic-competition'].includes(r.conceptId))){
  const old=item.question,mc=item.conceptId==='monopolistic-competition';let q=old.q,options=[...old.options],m;
  if(mc){
   if(m=q.match(/^(.+) sells a differentiated service\. Its MR and rising MC intersect at (\d+) units; demand at that quantity gives a price of (\$\d+), and ATC is (\$\d+)\. What are its profit margin and total economic profit\?$/)){
    q=`${m[1]} operates in monopolistic competition. Marginal revenue equals rising marginal cost at ${m[2]} units. At that output, buyers will pay ${m[3]} per unit and average total cost is ${m[4]}. What are profit per unit and total economic profit?`;
    options=options.map(o=>o.replace(/^(\$\d+) per unit; (\$\d+) total$/,'Profit is $1 per unit and $2 in total.'));
   }
   if(m=q.match(/^For quantities 0 through 5, a firm has prices in dollars \[([^\]]+)\] and total costs \[([^\]]+)\]\. Which output maximizes profit\?$/)){
    const prices=m[1].split(', '),tc=m[2].split(', ');q='A monopolistically competitive firm faces the prices and costs shown below. Fixed costs cannot be avoided this period. Which output maximizes its economic profit?'+table('Prices and costs',['Output (units)','Price per unit','Total cost'],prices.map((p,i)=>[i,i===0?'No sales':'$'+p,'$'+tc[i]]));
   }
   q=q.replace(/Which welfare test should be applied to the .+ action\?/,'How should the benefits and costs to society be assessed?').replace(/What is the most defensible immediate implication of the .+ action\?/,'What is a likely immediate effect?').replace('genuinely improved tutoring format','tutoring format that improves learning').replace('Lotus Fitness: A new specialized program better matches a subset of customers.','Lotus Fitness introduces a specialized program that better meets some customers’ needs.');
   if(item.id==='PM7-MCMP-H-030')q='A monopolistically competitive firm compares two advertising campaigns with the same fixed cost. Campaign A raises the quantity demanded at each price without changing elasticity. Campaign B makes demand less elastic around the current price without changing quantity demanded at that price. Why might their effects on profit differ?';
   if(item.id==='P62H-MCMP-H-028')q='A monopolistically competitive firm pays a fixed advertising fee. At its current output, average total cost now exceeds price, while demand, marginal revenue, and marginal cost are unchanged. The firm still covers variable cost. How does this affect its short-run output and profit?';
   if(item.id==='P62H-MCMP-L-071')q='Dahlia Delivery operates in monopolistic competition and buys an annual sponsorship unrelated to delivery volume. Assume the sponsorship has not yet changed demand. What is its immediate effect on cost and chosen output?';
   if(item.id==='P62H-MCMP-L-068')q='Crown Dental operates in monopolistic competition and offers a warranty that would be costly to honor if its work were poor. Service quality is unchanged. How might the warranty affect demand?';
   if(item.id==='P62H-MCMP-C-027'){q='A monopolistically competitive firm produces 28 units in long-run equilibrium, but average total cost is lowest at 43 units. How much excess capacity does it have?';options[3]='71 units';}
   if(/^P62H-MCMP-B1-/.test(item.id))q=q.replace('what price does it charge?','which price is closest to the price it charges?');
   if(!/monopolistic(?:ally)? competiti/i.test(q)&&!/^PM7-MCMP-H-00[568]$/.test(item.id)){
    if(/^A firm\b/.test(q))q=q.replace(/^A firm/,'A monopolistically competitive firm');
    else if(/^Refer to the graph\./.test(q))q=q.replace('Refer to the graph.','Refer to the graph of a monopolistically competitive firm.');
    else q='In monopolistic competition, '+q[0].toLowerCase()+q.slice(1);
   }
   if(!old.image){q=q.replace(/\bATC\s*=\s*/g,'average total cost of ').replace(/\bATC\b/g,'average total cost').replace(/\bMC\s*\$([\d.]+)/g,'marginal cost of $$$1').replace(/\bMC\b(?!\s*=)/g,'marginal cost').replace(/\bAVC\b/g,'average variable cost');}
   options=options.map(o=>o.replace('not marginally efficient','not allocatively efficient').replace(/marginal efficiency/g,'allocative efficiency'));
  }else{
   if(m=q.match(/^(.+) faces demand (P=.+)\. At Q=([\d.]+), what are price and marginal revenue\?$/))q=`${m[1]} is a single-price monopolist with demand ${m[2]}, where P is price in dollars and Q is quantity. At an output of ${m[3]} units, what are price and marginal revenue?`;
   if(m=q.match(/^At the monopoly optimum, Q=([\d.]+), P=(\$[\d.]+), and ATC=(\$[\d.]+)\. Calculate the firm’s economic result\.$/))q=`A monopolist maximizes profit by producing ${m[1]} units at a price of ${m[2]} per unit. Average total cost is ${m[3]} at that output. What is the firm's total economic profit or loss? Use the displayed values and round to the nearest cent.`;
   if(m=q.match(/^For a linear market, Qm=([\d.]+), Qc=([\d.]+), and the demand–MC gap at Qm is (\$[\d.]+)\. Calculate monopoly deadweight loss\.$/))q=`A monopolist produces ${m[1]} units, compared with an efficient quantity of ${m[2]}. Demand and marginal cost are linear, and willingness to pay exceeds marginal cost by ${m[3]} at the monopoly output. What is the deadweight loss? Use the displayed values and round to the nearest cent.`;
   q=q.replace(/Which sequence determines the monopolist’s profit or loss\?/,'How should the monopolist determine its output, price, and economic profit or loss?').replace(/What is the most defensible welfare conclusion\?/,'What can be concluded about total welfare and its distribution?').replace('single-price monopoly DWL','deadweight loss from single-price monopoly').replace('A perfect first-degree discriminator','A monopolist using perfect first-degree price discrimination');
   if(/^P62G-MON-H-0(15|17|19)$/.test(item.id))options=options.map(o=>({
    'Set MR=MC for Q, use demand for P, then compare P with ATC':'Choose output where marginal revenue equals marginal cost, read price from demand, and compare price with average total cost.',
    'Set demand=MC for Q, use MR for P, then compare P with AVC':'Choose output where demand meets marginal cost, use marginal revenue as price, and compare it with average variable cost.',
    'Minimize ATC for Q, set P=MC, then calculate revenue':'Choose output at minimum average total cost, set price equal to marginal cost, and calculate revenue.',
    'Choose the highest price, then produce the demanded quantity':'Choose the highest possible price and then produce the quantity buyers demand at that price.',
   })[o]||o);
   options=options.map(o=>o.replace(/^P=(\$[\d.]+), MR=(\$[\d.]+)$/,'Price is $1, and marginal revenue is $2.').replace(/^Q=([\d.]+), P=(\$[\d.]+)$/,'Produce $1 units and charge $2 per unit.').replace(/^PA=(\$[\d.]+), PB=(\$[\d.]+)$/,'Charge $1 in Market A and $2 in Market B.').replace(/^Monopoly Q = ([\d.]+), P = (\$[\d.]+); efficient Q = ([\d.]+), P = (\$[\d.]+)\. /,'The monopoly sells $1 units at $2; the efficient outcome is $3 units at $4. ').replace(/Monopoly uses MR = MC; efficiency uses demand = MC\./,'Profit maximization equates marginal revenue and marginal cost; efficiency equates willingness to pay and marginal cost.').replace(/Monopoly uses demand = MC; efficiency uses MR = MC\./,'Profit maximization equates willingness to pay and marginal cost; efficiency equates marginal revenue and marginal cost.'));
   if(/^P62G-MON-C-01[6-9]$/.test(item.id)||item.id==='P62G-MON-C-020')options=options.map(o=>/^\$/.test(o)?'Economic loss of '+o:o);
   if(/^P62G-MON-B1-/.test(item.id))q=q.replace('chooses Q=','chooses approximately Q=').replace('what price follows?','which price is closest to its demand price?');
   if(/^P62G-MON-B3-0(38|41)$/.test(item.id))q=q.replace('The demand–MC gap','Demand and marginal cost are linear. The demand–MC gap');
   if(!/monopol/i.test(q)&&!/^PM6-MON-H-00[789]$/.test(item.id)){
    if(/^Refer to the graph\./.test(q))q=q.replace('Refer to the graph.','Refer to the monopolist’s graph.');
    else if(/^A seller\b/.test(q))q=q.replace(/^A seller/,'A monopolist');
    else if(/^Two separated markets/.test(q))q=q.replace(/^Two separated markets/,'A monopolist serves two separated markets that');
    else q='For the monopolist, '+q[0].toLowerCase()+q.slice(1);
   }
   q=q.replace(/(?:marginal cost )?MC\s*=\s*([\d.]+)\s*\+\s*0Q/g,'constant marginal cost of $$$1').replace(/MC=(\$[\d.]+)/g,'marginal cost of $1');
  }
  if(q.startsWith('In monopolistic competition, ')){
   const rest=q.slice('In monopolistic competition, '.length);
   if(old.image)q='The graph shows a monopolistically competitive firm. '+rest[0].toUpperCase()+rest.slice(1);
   else q=q.replace(/, (atlas|bloom|crown|dahlia|ember|flint|glade|haven|ivory|jasper)\b/, (m,n)=>', '+n[0].toUpperCase()+n.slice(1));
  }
  if(old.image&&q.startsWith('For the monopolist, ')){const rest=q.slice('For the monopolist, '.length);q='The graph shows a monopolist. '+rest[0].toUpperCase()+rest.slice(1);}
  if(item.id==='PM6-MON-H-086')q=q.replace('marginal cost of $30 in both.','Marginal cost is $30 in both markets.');
  if(item.id==='PM6-MON-M-021')q='A monopolist’s 40th unit has marginal revenue of $28 and marginal cost of $22. For the 41st unit, marginal revenue is $24 and marginal cost is $25. Which output is the better marginal choice?';
  q=money(q);options=options.map(money);
  finish(item,{q,options},'State the market structure, replace cryptic price-cost bundles and unnatural prompts, and present aligned numerical data or rounded comparisons clearly without changing the required reasoning.',edit,keep);
 }
};
