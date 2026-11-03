'use strict';
const {money,finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{
 for(const item of items.filter(r=>r.conceptId==='international-trade-and-trade-policy')){
  const old=item.question;let q=old.q,options=[...old.options],m;
  if(m=q.match(/^(.+) has demand (P=.+) and supply (P=.+)\. If the world price is (\$\d+), what is the gain from opening to (imports|exports)\?$/))q=`${m[1]} is a small country with domestic demand ${m[2]} and supply ${m[3]}, where P is price in dollars and Q is quantity. With no other costs or externalities, how much does domestic total surplus rise when free trade opens at a world price of ${m[4]}?`;
  if(m=q.match(/^(.+): demand (P=.+), supply (P=.+), and world price (\$\d+)\. Calculate exports\.$/))q=`${m[1]} is a small country with domestic demand ${m[2]} and supply ${m[3]}. The world price is ${m[4]}. How many units does it export under free trade?`;
  q=q.replace('what is the strongest conclusion?','what is the net change in national surplus?').replace('Which statement about domestic producer losses from imports is strongest?','How should domestic producer losses from imports be interpreted?').replace('Which statement about domestic consumer losses from exports is strongest?','How should domestic consumer losses from exports be interpreted?').replace('Because quantities are measured in thousands, government tariff revenue in the displayed trade graph is:','Quantities in the trade graph are measured in thousands of units. What is government tariff revenue?');
  if(/^P62D-ITP-C-02[45678]$/.test(item.id))q=q.replace(/(\$\d+) tariff/,'$1 per-unit tariff');
  if(/^P62D-ITP-C-02[67]$/.test(item.id))q=q.replace('Calculate the production-side deadweight loss.','Assume linear domestic supply and an unchanged world price. What is the production-side deadweight loss?');
  if(item.id==='P62D-ITP-C-028')q=q.replace('Calculate the consumption-side deadweight loss.','Assume linear domestic demand and an unchanged world price. What is the consumption-side deadweight loss?');
  if(item.id==='P62D-ITP-C-029')q='A binding import quota permits 24 units and keeps the domestic price $7 per unit above the world price. What is the total quota rent?';
  if(item.id==='P62D-ITP-B3-042')options=options.map(o=>o.replace('plus every $200 of quota rents','plus all $200 of quota rents'));
  if(item.id==='P62D-ITP-B3-043')options=options.map(o=>o.replace(/^Auction loss is (\$\d+) and free-license loss ([-$\d]+); /,'The auction causes a $1 loss, compared with $2 under free licenses. ').replace('the ownership transfer is not a resource loss, but lobbying dissipates resources.','Transferring rents within the country uses no resources, but lobbying does.'));
  if(item.id==='P62D-ITP-B3-045')options=options.map(o=>o.replace(/With the tariff, P=(\$\d+) and imports=(\d+); with the quota, P=(\$\d+) and imports=(\d+)\./,'The tariff leads to a price of $1 and $2 imports; the quota leads to a price of $3 and $4 imports.').replace(/keep P=(\$\d+) and imports=(\d+)/,'keep price at $1 and imports at $2').replace(/raise P=(\$\d+) and imports=(\d+)/,'raise price to $1 and imports to $2'));
  if(item.id==='P62D-ITP-B3-050')options=options.map(o=>o.replace('The reserve program nets $13 million while the tariff nets -$25 million; a real security concern does not establish that broad protection is the best instrument.','The reserve program provides a $13 million net benefit, while the tariff causes a $25 million net loss. The reserve program performs better.'));
  if(item.id==='P62D-ITP-B3-054')options=options.map(o=>o.replace(/^Gain of (\$\d+); remaining deadweight loss (\$\d+)$/,'Domestic welfare rises by $1, and $2 of deadweight loss remains.'));
  if(item.id==='P62D-ITP-B3-055')options=options.map(o=>o.replace(/^Qs = (\d+) thousand; Qd = (\d+) thousand; (imports|exports) = (\d+) thousand$/,'Domestic production is $1 thousand units, consumption is $2 thousand, and $3 are $4 thousand.').replace('Qs = Qd = 175 thousand; imports = 0','Domestic production and consumption are both 175 thousand units, with no imports.'));
  q=money(q);options=options.map(money);
  finish(item,{q,options},'Clarify domestic welfare and small-country assumptions, replace compressed trade-policy comparisons, and keep numerical results and policy distinctions intact.',edit,keep);
 }
};
