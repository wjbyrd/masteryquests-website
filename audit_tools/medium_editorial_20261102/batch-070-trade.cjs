'use strict';
const {finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{for(const item of items.filter(r=>r.conceptId==='international-trade-and-trade-policy')){
 const old=item.question;let q=old.q,options=[...old.options];
 q=q.replace('Assume a small competitive country, unchanged domestic curves, free trade and no transport costs.','Assume competitive markets in a small country that takes the world price as given. Trade is unrestricted, transport costs are zero, and domestic demand and supply are unchanged.');
 // The two-country comparison needs plural assumptions rather than one country.
 if(item.id==='P62D-ITP-M-008')q=q.replace('markets in a small country that takes','markets in two small countries that take');
 const stems={
 'P62D-ITP-M-038':'Use the trade graph. Compared with free trade at a world price of $4, by how many units does the tariff reduce imports?',
 'P62D-ITP-M-039':'Use the trade graph. At the domestic price of $6 created by the quota, how much do domestic producers supply?',
 'P62D-ITP-B2-019':'Opening to trade raises consumer surplus by $780 and lowers producer surplus by $460. With no other effects, what is the change in total surplus?',
 'P62D-ITP-B2-020':'Opening to trade raises producer surplus by $900 and lowers consumer surplus by $540. With no other effects, what is the change in total surplus?',
 'P62D-ITP-B2-025':'Total surplus is $900 without trade and $1,300 with free trade. How large are the gains from trade?',
 'P62D-ITP-B2-029':'Trade raises total surplus but lowers income in one region. What does this show about efficiency and distribution?',
 'P62D-ITP-B2-030':'A report finds that gains from trade are large enough to compensate those who lose. What does this establish about compensation?',
 'P62D-ITP-B2-034':'Why can trade raise total surplus even when some people lose?',
 'P62D-ITP-B2-035':'At the world price, domestic buyers demand 50 units and domestic producers supply 10. How is the 40-unit gap filled?',
 'P62D-ITP-B2-036':'At the world price, domestic producers supply 50 units and domestic buyers demand 10. What happens to the 40-unit difference?',
 };
 if(stems[item.id])q=stems[item.id];
 q=q.replace(/^At Pw=(\$\d+) in the (import|export) graph, (consumer|producer) surplus equals:$/,'Use the $2 graph. At a world price of $1, what is $3 surplus?');
 if(item.id==='P62D-ITP-B2-037')options=['Domestic firms supply 50 thousand units, buyers demand 250 thousand, and imports are 200 thousand.','Domestic firms supply 200 thousand units, buyers demand 100 thousand, and exports are 100 thousand.','Domestic supply and demand are both 150 thousand units, so there are no imports.','Domestic firms supply 100 thousand units, buyers demand 200 thousand, and imports are 100 thousand.'];
 finish(item,{q,options},'Read the complete trade family; make assumptions and prompts readable, retain the small-country framework, and replace compressed quantity bundles with clear statements.',edit,keep);
}};
