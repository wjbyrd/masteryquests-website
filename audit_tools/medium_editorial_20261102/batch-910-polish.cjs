'use strict';
module.exports=({items,decisions,refine})=>{
 const stems={
 'P52A-FISCAD-B2-003':'In an economy with fixed prices, idle resources, and a marginal propensity to consume of 0.75, compare a $100 tax cut with a separate $100 increase in government purchases. How do their initial and total effects on aggregate demand differ?',
 'P62H-MCMP-L-041':'A monopolistically competitive firm charges $82 at its chosen output. Marginal cost is $48.40 and average total cost is $82. A regulator requires the firm to charge marginal cost at that same output, with costs unchanged. Would it cover total cost?',
 'P62H-MCMP-L-047':'A monopolistically competitive firm produces 26 units in long-run equilibrium at a price of $74 and marginal cost of $48. It would minimize average total cost at 41.62 units. What are its markup and excess capacity?',
 'P62H-MCMP-EL-024':'A monopolistically competitive firm produces 22 units in long-run equilibrium, but would minimize average total cost at 35.47 units. Price is $68 and marginal cost is $50.40. What are its markup and excess capacity?',
 'PM5-PC-M-107':'Why does setting price equal to marginal cost achieve allocative efficiency in a competitive market without externalities?',
 'P62F-PC-B2-023':'Why might a competitive firm continue producing in the short run while making an economic loss?',
 'P62F-PC-EL-014':'Higher demand creates short-run profit in a competitive industry. Entry raises the price of an input used by every firm. What type of industry is this?',
 'PM5-PC-M-096':'A competitive industry expands after demand rises. Higher land rents and skilled-worker wages raise firms’ average total cost. How does the new long-run price compare with its original level?',
 };
 const costs={MC:'marginal cost',MR:'marginal revenue',ATC:'average total cost',AVC:'average variable cost',AFC:'average fixed cost'};
 const expand=s=>s.includes('=')?s:s.replace(/\b(MC|MR|ATC|AVC|AFC)\b/g,m=>costs[m]).replace(/minimum-average total cost/g,'minimum average total cost').replace(/^[a-z]/,m=>m.toUpperCase());
 for(const item of items){const d=decisions.get(item.id);if(!d||d.action!=='revise')continue;const current={...item.question,...d.patch};let q=stems[item.id]||current.q,options=[...current.options];
  q=q.replace(/\b([Aa])n competitive\b/g,'$1 competitive');
  if(item.conceptId==='monopolistic-competition'){
   q=q.replace(/A long-run monopolistically competitive firm produces Q1=([\d.]+) while average total cost is minimized at Q2=([\d.]+)\. What is excess capacity\?/,'A monopolistically competitive firm produces $1 units in long-run equilibrium. It would minimize average total cost at $2 units. What is its excess capacity?');
   q=q.replace(/In monopolistic competition, at a long-run equilibrium, price is (\$[\d.]+) and marginal cost is (\$[\d.]+)\. What is the markup\?/,'A monopolistically competitive firm charges $1 in long-run equilibrium, with marginal cost of $2. What is its markup per unit?');
   q=q.replace('how does demand for its product become more or less responsive to price?','how does the price elasticity of demand for its product change?');
  }
  options=options.map(expand);
  if(item.id==='PM7-MCMP-M-044')options[3]='Entry must eliminate all market power, so this firm cannot be in long-run equilibrium.';
  const patch={};if(q!==current.q)patch.q=q;if(JSON.stringify(options)!==JSON.stringify(current.options))patch.options=options;if(Object.keys(patch).length)refine(item.id,patch,'Polish generated context and cost terminology after reading the revised wording.');
 }
};
