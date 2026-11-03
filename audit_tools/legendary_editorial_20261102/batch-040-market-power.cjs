'use strict';
module.exports=({items,edit,keep})=>{
 const group=items.filter(x=>['Monopoly','Monopolistic Competition'].includes(x.topic));
 const end=s=>/[.!?]$/.test(s)?s:s+'.';
 for(const item of group){
  const old=item.question;let q=old.q,options=[...old.options],feedback=old.feedback;
  const mono=item.topic==='Monopoly';
  // Context is essential when these items appear outside a topic-specific quest.
  if(!/monopolis|monopoly|monopolistic competition/i.test(q)){
   if(/^[A-Z].+? (?:faces|has demand|separates Markets)/.test(q))q=q.replace(/^(.+?) (faces|has demand|separates Markets)/,`$1, ${mono?'a monopolist':'a monopolistically competitive firm'}, $2`);
   else q=`${mono?'Consider a monopoly.':'Consider a firm in monopolistic competition.'} ${q}`;
  }else if(mono && /^.+? faces P=/.test(q))q=q.replace(/^(.+?) faces P=/,'$1, a monopolist, faces demand P=');
  q=q.replace(/ faces P(?=\s*=)/,' faces demand P').replace(/ and MC(?=\s*=)/,' and marginal cost MC').replace(/, MC(?=\s*=)/,', marginal cost MC').replace(/constant MC(?=\s*=)/,'constant marginal cost MC');
  q=q.replace('After choosing output, which operating result follows?','Should the firm operate this period, and what economic profit or loss would it earn at its best output?');
  q=q.replace('Which output-price pair maximizes profit?','What output and price maximize profit?').replace('Determine the short-run output and price.','What output and price maximize short-run profit?').replace('Determine its short-run output and price.','What output and price maximize its short-run profit?');
  q=q.replace('Which diagnosis is correct?','How would this decision affect profit?').replace('Which interpretation reconciles the initial and final outcomes?','Why can output be lower after entry even though fixed cost has fallen?').replace('Which price comparison and profit conclusion follow?','How do the firm’s price and maximum economic profit change?');
  q=q.replace('which welfare accounting is correct?','how do output and total surplus change?').replace('Which comparison of gains over monopoly is right?','Which policy produces the larger net gain in total surplus compared with unregulated monopoly?');
  options=options.map(s=>s.replace(/^Q=([\d.]+), P=\$([\d.]+)\.?$/,(_,a,b)=>`Produce ${a} units and charge $${b.replace(/\.$/,'')} per unit.`)
   .replace(/^QA=([\d.]+), QB=([\d.]+)$/,'Sell $1 units in market A and $2 units in market B.')
   .replace(/^A: Q=([\d.]+), P=\$([\d.]+); B: Q=([\d.]+), P=\$([\d.]+)\.$/,'Sell $1 units at $$ $2 in market A and $3 units at $$ $4 in market B.').replace(/\$ /g,'$')
   .replace(/^Qm=([\d.]+), Qefficient=([\d.]+), deadweight loss \$([\d.]+)\.$/,'The monopolist produces $1 units, compared with an efficient output of $2, leaving a deadweight loss of $$$3.')
   .replace(/Produce about ([\d.]+) units and count (?:revenue of )?\$([\d,.]+) as economic profit/,'Produce about $1 units and earn an economic profit of $$$2')
   .replace(/Produce about ([\d.]+) units with an economic (profit|loss) of/,'Produce about $1 units and earn an economic $2 of'));
  if(!mono){
   if(/success attracts entry/.test(q)){
    q=q.replace('Which immediate change is most likely?','Costs are unchanged and the firm continues operating. How does entry affect its best output, price, and profit?');
    options=options.map(s=>s.replace('MC and ATC both fall automatically','Marginal and average total cost fall as rivals enter'));
   }
   options=options.map(s=>s.replace('Losses encourage exit; survivors face stronger demand','Losses encourage some firms to exit, increasing demand for the remaining firms’ products.')
    .replace('Losses encourage entry; survivors face weaker demand','Losses encourage new firms to enter, reducing demand for existing firms’ products.')
    .replace('Higher fixed cost raises MC; output immediately falls','Higher fixed cost raises marginal cost, so firms immediately reduce output.')
    .replace('Higher fixed cost lowers ATC; entry eliminates profit','Higher fixed cost lowers average total cost, attracting entry that eliminates profit.'));
   // These questions compare two stages; make that sequence explicit in prose.
   options=options.map(s=>s.replace(/; maximum economic profit also falls\./,', and maximum economic profit also falls.')
    .replace(/; reoptimizing preserves maximum economic profit\./,', while adjusting output keeps maximum economic profit unchanged.')
    .replace(/; output and maximum profit stay unchanged\./,', while output and maximum profit stay unchanged.')
    .replace(/; lower sales raise price along the original demand curve\./,' because lower sales move the firm up its original demand curve.')
    .replace(/^From ([\d.]+) to ([\d.]+) units\./,'Output changes from $1 to $2 units.')
    .replace(/MC falls; the firm initially/,'Lower marginal cost leads the firm to initially')
    .replace(/; minimum ATC is not the profit-maximizing rule\./,'. Minimizing average total cost does not maximize profit.')
    .replace(/Short-run output stays (\d+) and profit falls to −\$(\d+); losses encourage exit, strengthening the remaining firms’ demand\./,'Output stays at $1 units initially, but the firm loses $$$2. These losses encourage exit, increasing demand for the remaining firms’ products.'));
   // Spell out cost measures in discussion, but leave symbols intact inside equations.
   q=q.replace(/shifts ATC above demand/,'raises average total cost above the demand curve').replace(/ATC lies above its demand curve/,'average total cost lies above its demand curve').replace(/pushes ATC above demand/,'raises average total cost above the demand curve').replace(/covers ATC/,'covers average total cost').replace(/lifts ATC above demand/,'raises average total cost above the demand curve');
   q=q.replace(/Its initial long-run optimum is Q=(\d+), where P=ATC=\$([\d.]+); minimum ATC occurs at Q=(\d+)\./,'Initially, long-run equilibrium is at $1 units, where price and average total cost both equal $$$2. Average total cost is lowest at $3 units.');
   q=q.replace('solely to minimize ATC','to minimize average total cost').replace('with minimum ATC at','with average total cost lowest at');
  }
  if(mono){
   let m=old.q.match(/^In (.+?)’s market, the demand–MC gap at Qm is \$([\d.]+) and Qc−Qm is ([\d.]+)\./);
   if(m)q=`${m[1]} is a monopolist. At its chosen output, buyers’ willingness to pay for the last unit exceeds marginal cost by $${m[2]}. Efficient output would be ${m[3]} units higher. Demand and marginal cost are linear, with no externalities. What is the deadweight loss, rounded to the nearest cent?`;
   m=old.q.match(/^At (.+?)’s optimum, Q=([\d.]+), P=\$([\d.]+), ATC=\$([\d.]+), and AVC=\$([\d.]+)\./);
   if(m)q=`${m[1]}, a monopolist, can sell ${m[2]} units at $${m[3]} each at its best operating output. Average total cost is $${m[4]}, and average variable cost is $${m[5]}. Fixed costs are unavoidable this period. Should it operate, and what economic profit or loss would it earn?`;
   m=old.q.match(/^Which regulatory comparison for (.+?) is correct\?/);
   if(m)q=`${m[1]} is a natural monopolist with constant marginal cost and positive fixed cost. Average total cost declines as output rises and remains above marginal cost. How do pricing at average total cost and pricing at marginal cost differ in their need for a subsidy?`;
   q=q.replace('Which appraisal best addresses the regulatory dilemma?','What should officials consider before adopting this policy?');
   q=q.replace('If a regulator required the firm to operate at the D = MC outcome','If a regulator required the monopolist to produce where demand intersects marginal cost');
   q=q.replace(/^Given the demand and cost conditions—(.+), fixed cost \$([\d,]+)—what is the economic result at the optimum\?/,'A monopolist faces demand $1 and fixed cost of $$$2. What economic profit or loss does it earn at its best output?');
   q=q.replace('For a monopolist, Given the','Given the');
   options=options.map(s=>s.replace('Average-cost pricing covers cost; MC pricing needs a subsidy','Pricing at average total cost covers total cost, while pricing at marginal cost requires a subsidy.')
    .replace('Average-cost pricing maximizes output; MC pricing covers fixed cost','Pricing at average total cost maximizes output, while pricing at marginal cost covers fixed cost.')
    .replace(/An economic (profit|loss) of \$([\d,.]+); operate because revenue covers variable cost\./,'Operate and earn an economic $1 of $$$2 because revenue covers variable cost.')
    .replace(/An economic (profit|loss) of \$([\d,.]+); shut down because fixed cost must always be avoided\./,'Shut down to avoid an economic $1 of $$$2 at the best operating output.')
    .replace(/An economic (profit|loss) of \$([\d,.]+); operate after (?:excluding fixed cost from economic profit|treating marginal cost as average variable cost)\./,'Operate and earn an economic $1 of $$$2 after accounting for production costs.')
    .replace(/Choose Q≈([\d.]+), P≈\$([\d.]+); P=MC would raise output to ([\d.]+) (.+)\./,'Set output at $1 units and price at $$$2. Marginal-cost pricing would raise output to $3 units $4.')
    .replace(/Choose Q≈([\d.]+), P≈\$([\d.]+); the smaller break-even output serves the greatest number of buyers\./,'Set output at $1 units and price at $$$2, the smaller of the two outputs that cover costs.')
    .replace(/Choose Q≈([\d.]+), P=\$([\d.]+); equality of price and MC also covers the \$([\d]+) fixed cost\./,'Set output at $1 units and price at $$$2, which also covers the $$$3 fixed cost.')
    .replace(/; a \$800 subsidy/,'; an $800 subsidy')
    .replace(/Monopoly price rises from (\$[\d.]+) to (\$[\d.]+), and the efficient-output benchmark stays/,'Monopoly price falls from $1 to $2, and the efficient-output benchmark stays'));
   if(/-LB-(006|018|030)$/.test(item.id))options[2]='Policy A leaves deadweight loss, so policy B is preferable because it achieves efficient output despite a $25 net loss.';
   options=options.map(s=>s.replace(/Q stays (\d+), P stays (\$[\d.]+), and DWL stays (\$[\d.]+); profit falls \$100, transferred to government\./,'Output stays at $1 units, price at $2, and deadweight loss at $3. The $$100 fall in profit becomes government revenue.')
    .replace(/Output rises from (\d+) to (\d+); eliminating DWL adds (\$[\d.]+), and net surplus rises (\$[\d.]+) after administration\./,'Output rises from $1 to $2 units, recovering $3 of lost surplus. After administration costs, the net gain is $4.'));
  }
  q=q.replace('A firm, a monopolist,','A monopolist').replace(/^Consider a monopoly\. Given the demand and cost conditions—(.+), fixed cost \$([\d,]+)—what is the economic result at the optimum\?/,'A monopolist faces demand $1 and fixed cost of $$$2. What economic profit or loss does it earn at its best output?');
  if(/P62G-MON-EL-(002|004|006|008|010)$/.test(item.id)){
   const fixed=old.q.match(/TC=(\d+)\+/)[1];
   options=options.map(s=>s.replace(/^Shut down to avoid an economic (?:profit|loss) of .+ at the best operating output\.$/,`Shut down and incur a loss of $${fixed}, the unavoidable fixed cost.`));
  }
  options=options.map(end);
  const patch={};if(q!==old.q)patch.q=q;if(JSON.stringify(options)!==JSON.stringify(old.options))patch.options=options;
  if(Object.keys(patch).length)edit(item.id,patch,'Make the market structure explicit, replace compressed result labels with readable outcomes, and clarify the decision without changing the required calculations.');
  else keep([item.id],'The market context, mathematical task, and choices already read clearly.');
 }
};
