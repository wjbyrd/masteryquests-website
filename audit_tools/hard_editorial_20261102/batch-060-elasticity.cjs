'use strict';
const {money,finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{
 for(const item of items.filter(r=>r.conceptId==='elasticity')){
  const old=item.question;let q=old.q,options=[...old.options],m;
  if(m=q.match(/^Using the midpoint method, (.+) What is (?:the )?price elasticity of (demand|supply)\?$/))q=m[1][0].toUpperCase()+m[1].slice(1)+` Using the midpoint method, what is the price elasticity of ${m[2]}${m[2]==='demand'?' in absolute value':''}?`;
  if(m=q.match(/^Calculate midpoint price elasticity of (demand|supply) for (.+?)(?: when price changes|: price changes) from (\$[\d,.]+) to (\$[\d,.]+),? and quantity (demanded|supplied) changes from ([\d,]+) to ([\d,]+)\.$/))q=`For ${m[2]}, price changes from ${m[3]} to ${m[4]}, and quantity ${m[5]} changes from ${m[6]} to ${m[7]} units. Using the midpoint method, what is the price elasticity of ${m[1]}${m[1]==='demand'?' in absolute value':''}?`;
  q=q.replace('price for ','the price of ').replace('Which statement is most defensible?','How might demand respond now and when the contracts expire?').replace('Compare the C→B and B→A intervals','Compare the intervals from C to B and from B to A').replace('Use the midpoint method and the observed revenue totals. Which statement is correct?','Using midpoint elasticity in absolute value, how elastic is demand, and how does total revenue change?').replace('which calculation and revenue decision are supported for these two prices?','which price earns more revenue, and what does the elasticity estimate show?').replace('Which correction is correct?','What are the correct elasticity and predicted quantity change?');
  if(item.id==='P62B-ELAS-H-022')options[1]='Demand may be inelastic during the contracts but more elastic when customers can renew or switch.';
  if(item.id==='P62B-ELAS-H-025')q='Two otherwise comparable markets start at the same price and quantity and face the same per-unit tax. Demand and supply are both more elastic in Market A than in Market B. Which market would lose more mutually beneficial trades?';
  if(item.id==='PMA-ELAS-H-045')q='Two otherwise comparable markets start at the same price and quantity and face identical per-unit fees. Demand and supply are less elastic in Market X than in Market Y. Which market would have the larger quantity reduction and greater deadweight loss?';
  if(/^P62B-ELAS-L-0(0[1-9]|1[0-5])$/.test(item.id)){
   const amounts=[...old.q.matchAll(/price changes from (\$[\d,.]+) to (\$[\d,.]+)/g)][0];const increase=Number(amounts[2].replace(/[$,]/g,''))>Number(amounts[1].replace(/[$,]/g,''));
   options=options.map(o=>o.replace('total revenue moves oppositely','total revenue '+(increase?'falls':'rises')).replace('; demand is',', so demand is'));
  }
  if(item.id==='P62B-ELAS-L-095')options=options.map(o=>o.replace(/^D1: (\$\d+)→(\$\d+); D2: (\$\d+)→(\$\d+)\. /,'Revenue on D1 rises from $1 to $2; revenue on D2 falls from $3 to $4. ').replace('More close substitutes is a plausible explanation for','More close substitutes could explain'));
  if(item.id==='P62B-ELAS-B3-007')options=options.map(o=>o.replace('Elasticity is 2×20/60≈0.67; the approximate quantity response is 6.7%, not 20%.','Elasticity is about 0.67, so a 10% price increase raises quantity supplied by about 6.7%.'));
  q=money(q);options=options.map(money);
  finish(item,{q,options},'Make elasticity instructions and revenue comparisons natural to read, distinguish percentages from unit changes, and state comparable-market assumptions where needed.',edit,keep);
 }
};
