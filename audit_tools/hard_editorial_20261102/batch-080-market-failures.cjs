'use strict';
const {table,money,finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{
 for(const item of items.filter(r=>r.conceptId==='market-failures')){
  const old=item.question;let q=old.q,options=[...old.options];
  if(['P77-MFAIL-H-010','P77-MFAIL-L-021'].includes(item.id)){
   q=item.id==='P77-MFAIL-H-010'?'A product is expensive because the inputs needed to make it are scarce. Does the high price alone establish market failure?':'A poor neighborhood has few grocery stores because operating costs are high. Does this outcome alone establish market failure?';
   options=['No. An undesirable outcome alone does not show that private decisions waste resources or miss gains from trade.','Yes. Any price that some households cannot afford proves that the market is inefficient.','Yes. Differences in access necessarily mean firms are producing at more than the lowest possible cost.','No. Scarce inputs rule out externalities, market power, and information problems in the market.'];
  }
  if(item.id==='P77-MFAIL-H-011'){q='A city is concerned about unequal access to restaurants. What additional evidence would establish market failure?';options[1]='Evidence that private incentives lead to an inefficient use of resources or missed gains from trade.';}
  if(item.id==='42116'){q='When consumption imposes an external cost, why can the quantity chosen using only private benefits and costs be inefficient?';options[0]='Private marginal benefit exceeds social marginal benefit, so some chosen units cost society more than they are worth.';}
  if(item.id==='42117')q='A market supplies 90 units, while the socially efficient quantity is 60. Marginal external cost is $8 per unit. The relevant curves are linear. What is the triangular deadweight loss?';
  if(item.id==='42131')q='Consumption imposes a marginal external cost of $7 per unit, but the corrective tax is only $4 per unit. How much external cost remains unaccounted for in the buyer’s decision?';
  if(item.id==='42140')q='Two plants must reduce emissions by a combined two tons. The table shows the cost of each successive ton removed. Permits are enforceable and can be traded without cost. How should the reduction be allocated?'+table('Emission-reduction costs',['Plant','First ton','Second ton'],[['A','$20','$30'],['B','$60','$90']]);
  if(item.id==='42299')q='A lake’s water quality falls as unrestricted boat traffic rises. Which fact shows that use of the lake has the characteristics of a common resource?';
  if(item.id==='42306')options[2]='Each withdrawal uses part of a limited allowance, making households weigh current use against later needs.';
  if(item.id==='42158')q='Thousands of people are affected by pollution. They have incomplete information, and some refuse to agree unless they receive larger payments. Which condition for efficient Coasean bargaining is least likely to hold?';
  if(item.id==='P77-MFAIL-FINALB-025'){
   q=q.replace('Which diagnosis and targeted response distinguish scarcity from market failure?','Which explanation distinguishes the two problems and identifies a suitable policy target?');
   options=['The drought makes the crop scarcer; the unpriced waste creates an external cost that policy could target.','Both the drought and the waste are market failures that a price ceiling would correct.','Both outcomes are efficient because they arise from private production decisions.','The drought creates asymmetric information, while the waste merely transfers income; policy should target information.'];
  }
  if(item.id==='P77-MFAIL-FINALB-026')q=q.replace('Which comparison is defensible?','How do the two disclosure formats compare?');
  if(item.id==='P77-MFAIL-FINALB-027')options=options.map(o=>o.replace(/^Full policy: ([+−]\$\d+); simpler policy: ([+−]\$\d+); (.+)\.$/,'The full policy has a net result of $1, compared with $2 for the simpler policy; $3.'));
  q=q.replace('the native-plant gardens spillover','the spillover from native-plant gardens').replace('the public-transit rides spillover','the spillover from public-transit rides').replace('the fast-fashion garments spillover','the spillover from fast-fashion garments').replace('the disposable vapes spillover','the spillover from disposable vapes');
  options=options.map(o=>o.replace('it makes the decision-maker account for the marginal external effect.','it makes the private decision reflect the external effect of one more unit.'));
  q=money(q);options=options.map(money);
  finish(item,{q,options},'Replace vague policy jargon and compressed comparisons, clarify external costs and resource assumptions, and remove overlapping alternatives without changing the intended concept.',edit,keep);
 }
};
