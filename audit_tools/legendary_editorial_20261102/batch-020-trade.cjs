'use strict';
const assert=require('assert/strict');
module.exports=({items,edit,keep})=>{
 const money=s=>s.replace(/\$(\d{4,})(\.\d+)?/g,(_,n,d)=>'$'+Number(n).toLocaleString('en-US')+(d||''));
 const products={Arden:'solar panels',Bellora:'coffee beans',Caspia:'bicycles',Demer:'tablets',Estara:'wool blankets',Faron:'ceramic tiles',Galena:'medical gloves',Haven:'garden tools',Ilyria:'paper rolls',Juno:'olive oil',Kestrel:'backpacks',Lydon:'steel bolts'};
 function option(o){let m;const s=o.replace(/\.$/,'');
  if(m=s.match(/^Price (\$[\d.]+); (\d+) (imports|exports); domestic consumers (gain|lose)$/))return `The price is ${m[1]}, the country ${m[3]} ${m[2]} units, and domestic consumers ${m[4]}.`;
  if(m=s.match(/^Price (\$[\d.]+); (\d+) (imports|exports); the world price cannot change$/))return `The price stays at ${m[1]} and the country ${m[3]} ${m[2]} units, because world prices cannot change.`;
  if(m=s.match(/^(\$[\d,.]+); compensation changes distribution without removing the trade gain$/))return `The winners retain ${m[1]}; compensation redistributes surplus without eliminating the national gain from trade.`;
  if(m=s.match(/^(\$[\d,.]+); compensation does not reduce what the winners retain$/))return `The winners retain ${m[1]}, because paying compensation does not reduce their gain.`;
  if(m=s.match(/^(\$[\d,.]+); the transfer is the gain created by trade$/))return `The winners retain ${m[1]}, because the compensation payment itself creates the national gain from trade.`;
  if(m=s.match(/^(\$[\d,.]+); restoring the losers necessarily exhausts the national gain$/))return `The winners retain ${m[1]}, because fully compensating the losing group uses up all national gains from trade.`;
  if(m=s.match(/^Tariff (\$[\d.]+); revenue (\$[\d.]+); producer gain (\$[\d.]+); deadweight loss (\$[\d.]+)$/))return `The tariff is ${m[1]} per unit and raises ${m[2]} in revenue. Producer surplus rises by ${m[3]}, and deadweight loss is ${m[4]}.`;
  if(m=s.match(/^Tariff (\$[\d.]+); revenue (\$[\d.]+); deadweight loss (\$[\d.]+)$/))return `A tariff of ${m[1]} per unit raises ${m[2]} in revenue and causes ${m[3]} in deadweight loss.`;
  if(m=s.match(/^Post-tariff imports: (\d+) units; government revenue: (\$[\d.]+); production distortion: (\$[\d.]+); consumption distortion: (\$[\d.]+); total deadweight loss: (\$[\d.]+)$/))return `The country imports ${m[1]} units and collects ${m[2]} in tariff revenue. Production and consumption distortions cost ${m[3]} and ${m[4]}, respectively, for a total deadweight loss of ${m[5]}.`;
  if(m=s.match(/^(Imports|Exports)=(\d+); consumers (gain|lose) (\$[\d,.]+); producers (gain|lose) (\$[\d,.]+); total surplus (.+)$/))return `The country ${m[1].toLowerCase()} ${m[2]} units. Consumers ${m[3]} ${m[4]} and producers ${m[5]} ${m[6]}, so total surplus ${m[7]}.`;
  if(m=s.match(/^Consumers lose (\$[\d.]+)k; producers gain (\$[\d.]+)k; government gets (\$[\d.]+)k; net welfare falls (\$[\d.]+)k$/))return `Consumers lose ${m[1]} thousand and producers gain ${m[2]} thousand. Government revenue is ${m[3]} thousand, leaving national surplus ${m[4]} thousand lower.`;
  if(m=s.match(/^Consumers lose (\$[\d.]+)k; producers gain (\$[\d.]+)k; quota rents are (\$[\d.]+)k; net welfare falls (\$[\d.]+)k$/))return `Consumers lose ${m[1]} thousand and producers gain ${m[2]} thousand. Domestic license holders receive ${m[3]} thousand in quota rents, leaving national surplus ${m[4]} thousand lower.`;
  if(m=s.match(/^Domestic price (\$[\d.]+); rents (\$[\d.]+) thousand; distortion loss (\$[\d.]+) thousand$/))return `The domestic price is ${m[1]}, quota rents are ${m[2]} thousand, and the distortion loss is ${m[3]} thousand.`;
  if(m=s.match(/^(\d+) thousand (exports|imports); gains from trade (fall|rise) (\$[\d.]+) thousand$/))return `The country ${m[2]} ${m[1]} thousand units, and its gains from trade ${m[3]} by ${m[4]} thousand.`;
  if(m=s.match(/^(\$[\d.]+) thousand transfer; (\$[\d.]+) thousand remaining producer gain$/))return `The transfer is ${m[1]} thousand, leaving producers with a gain of ${m[2]} thousand.`;
  if(m=s.match(/^(\$[\d.]+) thousand transfer; no producer gain$/))return `The transfer is ${m[1]} thousand, leaving producers with no gain.`;
  if(m=s.match(/^(\$[\d.]+) thousand transfer; no national gain because compensation cancels trade$/))return `The transfer is ${m[1]} thousand, and no national gain remains because compensation cancels the gain from trade.`;
  return o;
 }
 for(const item of items.filter(r=>r.conceptId==='international-trade-and-trade-policy')){
  const old=item.question;let q=old.q,options=old.options.map(option),m;
  if(old.options.every(o=>o.startsWith('After fully compensating '))){
   const eq=q.match(/Domestic curves are (P = \d+ - Qd) and (P = \d+ \+ Qs); Pw = (\$\d+)\./),cost=q.match(/uses (\$\d+) of real administrative resources/),groups=old.options[0].match(/^After fully compensating (producers|consumers) and paying administrative costs, (consumers|producers)/),country=Object.keys(products).find(c=>q.includes(c));assert(eq&&cost&&groups&&country,item.id);
   q=`In ${country}'s market for ${products[country]}, domestic demand is ${eq[1]} and domestic supply is ${eq[2]}. The world price is ${eq[3]}. Opening trade reduces domestic ${groups[1]}' surplus. The ${groups[2]} fully compensate them through a lump-sum transfer and pay ${cost[1]} in real administrative costs. Compared with no trade, what net gain do the ${groups[2]} retain?`;
   options=old.options.map(o=>{const amount=o.match(/net change in surplus of ([-$\d,.]+) relative to autarky\.$/);assert(amount,item.id);return amount[1].replace('$-','-$');});
  } else {
   q=q.replace(/^(\w+) has (P = \d+ - Qd) and (P = \d+ \+ Qs)\./,(_,country,demand,supply)=>`In ${country}, domestic demand is ${demand} and domestic supply is ${supply}.`)
    .replace(/^(\w+)'s (.+) market has (P = \d+ - Qd) and (P = \d+ \+ Qs)\./,(_,country,product,demand,supply)=>`In ${country}'s market for ${product}, domestic demand is ${demand} and domestic supply is ${supply}.`)
    .replace(/Free trade creates (\d+) (imports|exports), but the price is unreported\./,(_,n,type)=>`The country ${type} ${n} units at the initial world price, which is not reported.`)
    .replace(/Free trade produces (\d+) (imports|exports)\./,(_,n,type)=>`With free trade, the country ${type} ${n} units.`)
    .replace(/If that world price then (falls|rises) by (\$\d+), which new outcome follows\?/,(_,direction,amount)=>`If the world price then ${direction} by ${amount}, how do the domestic price, trade quantity, and consumer surplus change?`)
    .replace('If a costless lump-sum transfer fully restores the losing domestic group\'s autarky surplus, what gain remains with the winners?','A lump-sum transfer, with no administrative cost, restores the losing domestic group to its surplus before trade. What gain does the other group retain, and why?')
    .replace('which option correctly gives the tariff per unit, government revenue, and deadweight loss?','what tariff per unit, government revenue, and deadweight loss result?')
    .replace(/Which (?:complete )?trade-and-welfare outcome is correct\?/,'How much does the country trade, and how do consumer, producer, and total surplus change relative to no trade?')
    .replace(/which (?:complete )?trade-and-welfare outcome is correct\?/,'how much does the country trade, and how do consumer, producer, and total surplus change relative to no trade?')
    .replace(/which outcome correctly combines (?:imports|exports) and surplus changes\?/,'how much does the country trade, and how do consumer, producer, and total surplus change relative to no trade?')
    .replace(/\bPw\s*=\s*/g,'a world price of ').replace(/\bPw is\b/g,'the world price is').replace(/\bPw falls\b/g,'the world price falls');
  }
  if(old.options[0].startsWith('Post-tariff imports:')){
   q=q.replace(/Which (?:option correctly reports imports, tariff revenue, the production and consumption losses, and total deadweight loss|option correctly separates government revenue from the production and consumption distortion losses|result correctly tracks the change in imports and national deadweight loss)\?/,'After the tariff, how much is imported, how much revenue does the government receive, and what are the production, consumption, and total deadweight losses?');
   if(old.image&&!/graph/i.test(q))q='Use the accompanying trade graph. '+q;
  }
  const custom={
   'P62D-ITP-L-081':{q:'An importing country has domestic demand Qd = 110 − P, domestic supply Qs = P − 10, and a world price of $30. It is comparing an auctioned quota permitting 40 imports with a $10 tariff. Demand then rises by 20 units at every price. Assume competitive bidding for licenses and no administrative costs. After the shift, how do the policies compare in domestic price and government revenue?',options:['Under the quota, the price is $50 and revenue is $800; under the tariff, the price is $40 and revenue is $600.','Under either policy, the price is $40 and revenue is $400.','Under the quota, the price is $40 and revenue is $600; under the tariff, the price is $50 and revenue is $800.','Under either policy, the price is $50 and revenue is $800.']},
   'P62D-ITP-L-082':{q:'An importing country has domestic demand Qd = 96 − P, domestic supply Qs = P − 16, and a world price of $28. A voluntary export restraint gives foreign firms free rights to ship 32 units. Compared with free trade, how much national surplus does the importing country lose, and how much of that loss goes to foreign firms?',options:['National surplus falls by $144, with no transfer to foreign firms.','National surplus falls by $528, including $384 in rents received by foreign firms.','National surplus falls by $384, all of which is deadweight loss.','National surplus falls by $912, counting the same foreign rents as a loss twice.']},
   'P62D-ITP-L-083':{q:'An importing country initially has domestic demand Qd = 92 − P, domestic supply Qs = P − 12, and a world price of $26. A $10 tariff and a quota of 32 units initially produce the same trade outcome. Demand then falls by 28 units at every price. How do the two policies affect the new price and imports?'},
   'P62D-ITP-L-085':{q:'Domestic demand is P = 86 − Qd, domestic supply is P = 14 + Qs, and the world price is $30. A ministry compares tariffs of $6 and $14 per unit. How do the two tariffs compare in government revenue and national welfare?'},
   'P62D-ITP-L-090':{q:'Opening trade raises consumer surplus by $720 and lowers producer surplus by $420. Consumers fully compensate producers through a $420 lump-sum transfer and also pay $75 in real resources to administer the assistance. Compared with no trade, what gains remain?',options:['Consumers retain $300 because the resources used to administer assistance count only as a transfer.','Producers are fully compensated, and consumers retain a net gain of $225 after both payments.','National surplus rises by $720 because compensating producers cancels their original loss without using resources.','National surplus falls by $195 because the compensation must be deducted twice.']},
   'P62D-ITP-L-091':{q:'Use the avocado import graph, where quantities are measured in thousands. A tariff raises the domestic price by $1 above the world price shown. The world price and both straight curves remain unchanged. How much tariff revenue is raised, and how much national gain from trade remains relative to no trade?'},
   'P62D-ITP-L-092':{q:'Use the avocado import graph. Consumers would fully compensate domestic producers for their losses from opening trade through a lump-sum transfer. Consumers would also pay $30 thousand in real administrative costs. How much of their gain from opening trade would remain after both payments?'},
  };
  if(custom[item.id]){q=custom[item.id].q;if(custom[item.id].options)options=custom[item.id].options;}
  if(item.id==='P62D-ITP-L-086')q=q.replace('audited reserves','verified stockpiles');
  options=options.map(s=>s.replace('counting the same foreign rents as a loss twice','including $384 in rents received by foreign firms').replace('because the compensation must be deducted twice','after treating the compensation payment as an additional resource cost'));
  q=money(q);options=options.map(money);
  const patch={};if(q!==old.q)patch.q=q;if(JSON.stringify(options)!==JSON.stringify(old.options))patch.options=options;
  if(Object.keys(patch).length)edit(item.id,patch,'Make the trade scenario and the requested comparison explicit; replace result-label strings and repeated answer clauses with clear prose while preserving prices, quantities, transfers, welfare calculations, and graph context.');
  else keep([item.id],'The policy or welfare comparison already uses a clear scenario and readable complete answer statements.');
 }
};
