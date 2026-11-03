'use strict';
const {table,finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{for(const item of items.filter(r=>r.conceptId==='market-failures')){
 const old=item.question;let q=old.q,options=[...old.options];
 q=q.replace('the fast-fashion garments market','the market for fast-fashion garments').replace('the disposable vapes market','the market for disposable vapes').replace('the native-plant gardens market','the market for native-plant gardens').replace('the public-transit rides market','the market for public-transit rides');
 q=q.replace(/the unregulated (fast-fashion garments|disposable vapes|native-plant gardens|public-transit rides) quantity/,'the unregulated quantity of $1');
 if(item.id==='42111'){q='An externality can be harmful or beneficial, and it can arise from production or consumption. Why must these two distinctions be considered separately?';options[3]='Whether others gain or lose differs from which activity causes the effect.';}
 if(item.id==='42112')q=q.replace('Which private-social relationship is likely?','Which comparison of private and social benefits fits this case?');
 if(item.id==='42135')options[0]='Every subsidy payment is a deadweight loss.';
 if(item.id==='42137')q='Reducing the next ton of emissions costs Firm A $20 and Firm B $70. Emissions permits trade for $45 per ton. How can trading encourage the firms to reduce emissions at lower cost?';
 if(item.id==='42146')q='Each of three firms can eliminate up to one ton of emissions at the costs shown. What is the lowest total cost of eliminating two tons?'+table('Cost of removing one ton',['Firm','Cost'],[['A','$15'],['B','$35'],['C','$80']]);
 if(item.id==='42148')options[0]='The mill now bears the fishing losses itself, giving it an incentive to reduce the spillover.';
 if(item.id==='42193')q='Use the fireworks graph. At four displays, how much does South value one additional display?';
 if(item.id==='42276')options[0]='The provider can restrict access to paying subscribers.';
 options=options.map(o=>o.replace('it makes the decision-maker account for the marginal external effect.','it makes the private decision account for the external effect of one more unit.'));
 finish(item,{q,options},'Read the complete market-failure family; retain clear applied questions and improve awkward noun strings, externality language and numerical layout.',edit,keep);
}};
