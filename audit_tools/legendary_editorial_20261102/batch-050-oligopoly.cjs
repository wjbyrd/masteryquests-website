'use strict';
module.exports=({items,edit,keep})=>{
 const custom={
 '085':['Innovation may benefit customers, but those gains must be weighed against higher prices from market power.','High research spending shows that the industry’s high prices do not reduce total surplus.','High prices show that the research spending cannot create benefits for customers.','Research spending measures market power more directly than prices or entry conditions do.'],
 '086':['The two networks’ combined share is enough to assess competitive pressure.','Network effects, switching options, use of multiple networks, and entry conditions all affect competitive pressure.','Using more than one network means network effects cannot create an entry barrier.','Customers’ ability to switch makes the number of competing networks irrelevant.'],
 '087':['The domestic four-firm ratio fully captures the competition facing domestic producers.','Expanding imports show that domestic producers have no ability to influence prices.','Responsive imports may limit domestic firms’ ability to raise prices.','Import competition matters only after foreign suppliers own domestic production facilities.'],
 '088':['Matching list prices establishes that the firms charge the same transaction prices.','Private discounts show that the firms cannot coordinate any part of their pricing.','The public list prices are a better measure of coordination than prices customers actually pay.','Similar list prices can exaggerate coordination when customers receive different private discounts.'],
 '090':['The number of firms is sufficient to make information and timing assumptions irrelevant.','Predictions should be checked because information and the order of decisions can change strategic outcomes.','A single predicted outcome establishes that all firms have dominant strategies.','Changing the timing affects total profit but cannot change firms’ individual choices.'],
 'B033':['The increase in concentration establishes the size of the price increase.','The claimed savings outweigh the loss of a close substitute even without verification.','Losing a close substitute, with little evidence of savings, points toward competitive harm.','The remaining firms will replace the lost competitive pressure regardless of entry conditions.'],
 'B034':['Any increase in concentration outweighs the evidence of entry and lower costs.','Verified savings ensure that the merger has no possible competitive harm.','Rapid entry makes evidence about demand and price effects unnecessary.','Easy entry and savings likely to lower prices can reduce concerns about greater concentration.'],
 'B035':['Stronger network effects and restrictions on using rivals may make entry harder and exclude competitors.','The acquisition’s effect can be assessed from market shares without considering user restrictions.','Combining the networks makes access easier for new rivals because the user base is larger.','Preventing use of competing platforms primarily reduces the acquired platform’s market power.'],
 'B036':['High concentration can preserve the cartel even when imports and member cheating increase.','Outside competition and incentives to cheat both make coordination harder to sustain.','New technology stabilizes cartel quotas by keeping production costs the same across members.','Member cheating is evidence that outside competition no longer affects the cartel.']
 };
 for(const item of items.filter(x=>x.conceptId==='oligopoly')){
  const old=item.question;let q=old.q,options=[...old.options],feedback=old.feedback;
  const pv=q.match(/^Assume the firms interact indefinitely\. Cooperating pays (\d+) each period, starting now\. Cheating pays (\d+) now, followed by (\d+) every period forever starting next period\. Multiply each future payoff by ([\d.]+) for every period ahead\./);
  if(pv){
   const [c,t,p,d]=pv.slice(1).map(Number),cv=c/(1-d),dv=t+d*p/(1-d),fmt=n=>n.toFixed(2),coop=cv>dv;
   q=`Firms in an oligopoly expect to interact indefinitely. A firm earns $${c} each period if it keeps cooperating. If it cheats, it earns $${t} now and $${p} each period from next period onward. A payoff one period ahead is worth ${d} times as much today; apply that factor again for each additional period.`;
   let right,wrong;
   if(/absolute difference/.test(old.q)){
    q+=' Which strategy has the higher present value, and by how much?';
    const diff=Math.abs(cv-dv),name=coop?'Cooperating':'Cheating',other=coop?'Cheating':'Cooperating';
    right=`${name} is worth $${fmt(diff)} more.`;
    wrong=[`${other} is worth $${fmt(diff)} more.`,`${name} is worth $${fmt(diff+p)} more.`,`${other} is worth $${fmt(t-c)} more.`];
   }else{
    q+=' What are the present values of cooperating and cheating, and which strategy is better?';
    const line=(a,b)=>`Cooperating is worth $${fmt(a)} and cheating $${fmt(b)}, so ${a>b?'cooperating':'cheating'} is better.`;
    right=line(cv,dv);wrong=[line(cv,t+p/(1-d)),line(d*cv,d*dv),line(c+d*c,t+d*p)];
   }
   options=[...wrong];options.splice(item.correctIndex,0,right);
   feedback=`Cooperating is worth ${c}/(1 − ${d}) = $${fmt(cv)}. Cheating is worth ${t} + ${d} × ${p}/(1 − ${d}) = $${fmt(dv)}. ${coop?'Cooperating':'Cheating'} therefore has the higher present value, by $${fmt(Math.abs(cv-dv))}.`;
  }
  const suffix=item.id.replace(/^P62I-OLI-L(B?)-/,'$1');if(custom[suffix])options=custom[suffix];
  q=q.replace('Which integrated conclusion is strongest?','What does this evidence imply for competition?').replace('Which inference is best?','What can be concluded from these price changes?');
  if(/^Firms increase quality/.test(q))q='In an oligopoly, firms improve product quality and increase advertising while avoiding large price cuts. How might this affect competition?';
  q=q.replace('Which analysis is strongest?','What should the merger assessment consider?');
  if(/A merger raises concentration by/.test(q))options=options.map(s=>s.replace('Approve based on claimed savings without checking whether they will lower customer prices','The claimed cost savings are enough to offset the loss of competition.')
   .replace('Reject on concentration alone without examining entry or substitution','The concentration increase is sufficient to establish harm, regardless of entry or substitutes.')
   .replace('Evaluate productive savings while excluding effects on market power','The decision should depend on production savings rather than changes in pricing power.')
   .replace('Weigh reduced competition against verified cost savings and how much they will lower customer prices','Weigh reduced competition against verified savings and the share of those savings likely to reach customers.'));
  q=q.replace('Refer to the game tree. Use backward induction. Which path is sequentially rational?','Use the game tree to predict the entrant’s decision and the incumbent’s response. What outcome follows when each firm anticipates the other’s best choice?');
  options=options.map(s=>s.replace(/^Enter, then Accommodate; the threat to fight is (not )?credible$/,(_,n)=>`The entrant enters and the incumbent accommodates it. The threat to fight is ${n||''}credible.`)
   .replace(/^Enter, then Fight; the threat to fight is credible$/,'The entrant enters and the incumbent fights. The threat to fight is credible.')
   .replace('Stay out; every threat is credible','The entrant stays out because an announced threat is enough to deter entry.')
   .replace('Stay out; the threat to fight is credible','The entrant stays out because fighting would be the incumbent’s best response to entry.')
   .replace('Choose the highest joint-payoff terminal node','The firms choose the outcome with the highest combined profit, regardless of their individual incentives.')
   .replace('Choose the terminal node with the highest combined payoff','The firms choose the outcome with the highest combined profit, regardless of their individual incentives.')
   .replace(/^Enter, then Accommodate$/,'The entrant enters, and the incumbent accommodates it.')
   .replace(/^Enter, then Fight\.?$/,'The entrant enters, and the incumbent fights.')
   .replace(/^Stay out$/,'The entrant stays out.')
   .replace(/^Joint profit (\$[\d,.]+); DWL (\$[\d,.]+)$/,'The cartel earns $1 in joint operating profit and creates $2 of deadweight loss.')
   .replace(/^License: (\$[\d,.]+); unit tax: (\$[\d,.]+)\./,'Profit is $1 with the license charge and $2 with the tax per unit.')
   .replace(/; (A\/[XY]|B\/[XY]|both|none|all four|neither|only) /g,(_,w)=>`. ${w[0].toUpperCase()+w.slice(1)} `));
  if(/-LB-002$/.test(item.id))options=options.map(s=>s.replace('; A/X and B/Y are equilibria; Row prefers A/X and Column prefers B/Y','. Both A/X and B/Y are equilibria, but Row prefers A/X and Column prefers B/Y').replace('; A/X and B/Y are equilibria; both firms prefer A/X','. Both A/X and B/Y are equilibria, and both firms prefer A/X'));
  options=options.map(s=>/[.!?]$/.test(s)?s:s+'.');
  const patch={};if(q!==old.q)patch.q=q;if(JSON.stringify(options)!==JSON.stringify(old.options))patch.options=options;if(feedback!==old.feedback)patch.feedback=feedback;
  if(Object.keys(patch).length)edit(item.id,patch,'Use direct strategic questions and readable comparisons; replace unrelated or self-defeating distractors with economic or calculation errors.');
  else keep([item.id],'The graph-based task and compact choices already state the intended economic comparison clearly.');
 }
};
