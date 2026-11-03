'use strict';
const {table,costs,finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{for(const item of items.filter(r=>r.conceptId==='perfect-competition')){
 const old=item.question;let q=old.q,options=[...old.options],m;
 if(m=q.match(/^A competitive firm faces price (\$\d+)\. Marginal costs for units 1–6 are (.+)\. Which output maximizes profit or minimizes loss\?$/))q=`A competitive firm receives ${m[1]} per unit. Its fixed costs cannot be avoided this period. Which output maximizes profit or minimizes loss?`+table('Cost of each additional unit',['Unit','Marginal cost'],m[2].split(', ').map((v,i)=>[i+1,v]));
 if(m=q.match(/^At price (\$\d+), a firm is producing (\d+) units and the next unit has MC (\$\d+)\. What should the firm do\?$/))q=`A competitive firm receives ${m[1]} per unit and currently produces ${m[2]} units. The next unit would add ${m[3]} to cost. Should it increase output?`;
 if(m=q.match(/^At its MR=MC output of (\d+) units, a competitive firm has P=(\$[\d.]+), ATC=(\$[\d.]+), and AVC=(\$[\d.]+)\. What is the correct short-run conclusion\?$/))q=`A competitive firm chooses ${m[1]} units where marginal revenue equals marginal cost. Price is ${m[2]}, average total cost is ${m[3]}, and average variable cost is ${m[4]}. Fixed costs cannot be avoided this period. What should it do in the short run?`;
 q=q.replace('A competitive firm produces','A competitive firm produces').replace(/ATC at that output is/,'Average total cost at that output is');
 if(item.id==='PM5-PC-M-042')q='A competitive firm must pay a higher annual license fee, whether or not it produces this period. Market price, marginal cost, and average variable cost are unchanged. How does this affect its short-run output decision?';
 if(item.id==='PM5-PC-M-063')q='Ten competitive firms each increase quantity supplied by 3 units when price rises. No firms enter or exit. By how many units does total market quantity supplied rise?';
 if(item.id==='PM5-PC-M-082')q='A competitive firm temporarily stops producing because price is below average variable cost. Managers expect conditions to improve next season. How should this decision be classified?';
 if(item.id==='P62F-PC-M-030')q='A competitive firm produces where price equals marginal cost, but its output is not at minimum average total cost. There are no externalities. Which type of efficiency does it achieve?';
 if(/^P62F-PC-M-02[345]$/.test(item.id))q=q.replace('In a ','In a competitive, ').replace('After long-run adjustment, price typically:','How does price compare with its original level after long-run adjustment?').replace('Long-run price typically ends:','How does the new long-run price typically compare with the original and short-run prices?').replace('Long-run price can end:','How can the new long-run price compare with its original level?');
 if(item.id==='P62F-PC-M-029')q='A technology improvement lowers a competitive firm’s marginal cost. Market price stays unchanged. How does its profit-maximizing output generally respond?';
 if(item.id==='PM5-PC-M-096')q=q.replace('the new long-run price is most likely:','how does the new long-run price compare?');
 const stems={
 'P62F-PC-B2-019':'A competitive firm produces 50 units at a price of $38 per unit. Average total cost at that output is $30. What is its total economic profit?',
 'P62F-PC-B2-020':'A competitive firm’s best positive output is 60 units. Price is $24, average total cost is $31, and average variable cost is $18. Fixed costs cannot be avoided this period. What should it do?',
 'P62F-PC-B2-021':'A competitive firm receives $14 per unit, while its minimum average variable cost is $17. Should it produce in the short run?',
 'P62F-PC-B2-022':'A competitive firm’s price exactly equals minimum average variable cost. How does producing at that output compare with shutting down for the period?',
 'PM5-PC-M-041':'A competitive firm receives $11 per unit. At its best positive output, average variable cost is $8 and average total cost is $15. What should it do in the short run?',
 'PM5-PC-M-042':'A competitive firm must pay a higher annual license fee, whether or not it produces this period. Market price, marginal cost, and average variable cost are unchanged. How does this affect its short-run output decision?',
 'PM5-PC-M-061':'A competitive firm pays a new $2 fee on every unit sold, raising marginal and average variable cost by $2. How does this affect its short-run supply?',
 'PM5-PC-M-062':'A competitive firm has minimum average variable cost of $9. It supplies nothing at a price of $8, but at $12 it produces where price equals marginal cost. What does this imply about its supply curve?',
 };
 if(stems[item.id])q=stems[item.id];
 if(item.id==='PM5-PC-M-041'||/^P62F-PC-M-01[579]$/.test(item.id))options=options.map(o=>o.replace('P<ATC','price is below average total cost').replace('P<AVC','price is below average variable cost'));
 if(!/competiti|price-taking|price taker/i.test(q)){
  if(old.image)q='Use the graph for a perfectly competitive market. '+q.replace(/^Refer to the (?:paired market and firm )?graph\. /,'');
  else if(/^A firm/.test(q))q=q.replace(/^A firm/,'A competitive firm');
  else if(/\bindustry\b/.test(q))q=q.replace(/\bindustry\b/,'competitive industry');
  else q='For a competitive firm, '+q[0].toLowerCase()+q.slice(1);
 }
 if(!old.image){q=q.replace(/\bATC\b/g,'average total cost').replace(/\bAVC\b/g,'average variable cost').replace(/\bMC\b/g,'marginal cost');}
 finish(item,{q,options},'Read the complete competitive-firm family; clarify market context and cost language, organize discrete costs, and make short-run assumptions explicit while preserving Medium reasoning.',edit,keep);
}};
