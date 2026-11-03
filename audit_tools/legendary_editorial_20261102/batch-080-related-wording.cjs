'use strict';
// Extend the resolved wording patterns to the rest of the pool. Retention here
// records a screening decision, not a claim of a fresh individual substantive audit.
module.exports=({items,edit,keep})=>{
 const fs=require('fs'),path=require('path'),decided=new Set();
 for(const file of fs.readdirSync(__dirname).filter(f=>/^batch-0[1-7].*\.cjs$/.test(f)).sort())require('./'+file)({items,byId:new Map(items.map(x=>[x.id,x])),keep:ids=>ids.forEach(id=>decided.add(id)),edit:id=>decided.add(id),optionEdit:id=>decided.add(id)});
 for(const item of items.filter(x=>!decided.has(x.id))){
  const old=item.question;let q=old.q,options=[...old.options];
  q=q.replace(/cost of maintaining the recipient's utility/g,'cost of maintaining the recipient’s standard of living').replace(/Which diagnosis (?:is correct|fits the evidence)\?/g,'Which explanation fits the evidence?').replace(/What is the best interpretation\?/g,'What can be concluded from these changes?');
  options=options.map(s=>s.replace(/recipient's utility/g,'recipient’s standard of living').replace(/Reserves rise; lending still depends on demand, risk and capital\./,'Reserves increase, but lending still depends on loan demand, risk, and bank capital.').replace(/Reserves stay fixed; weak loan demand prevents central-bank reserve creation\./,'Reserves stay fixed because weak loan demand prevents the central bank from creating reserves.').replace(/Reserves rise; bank equity rises equally through the reserve injection\./,'Reserves increase, and the reserve injection raises bank equity by the same amount.').replace(/Reserves rise; each added reserve dollar becomes an immediate commercial loan\./,'Reserves increase, and every additional dollar immediately becomes a commercial loan.'));
  if(q!==old.q||JSON.stringify(options)!==JSON.stringify(old.options))edit(item.id,{...(q!==old.q?{q}:{}),...(JSON.stringify(options)!==JSON.stringify(old.options)?{options}:{})},'Extend a resolved editorial pattern to another occurrence without changing the economic task.');
  else keep([item.id],'No additional wording change identified by the full-pool screen and topic-coverage audit; preserve the existing question. This is a screening disposition, not a new difficulty approval.');
 }
};
