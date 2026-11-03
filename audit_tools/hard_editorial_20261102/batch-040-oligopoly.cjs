'use strict';
const {finish}=require('./helpers.cjs');
module.exports=({items,edit,keep,optionEdit})=>{
 for(const item of items.filter(r=>r.conceptId==='oligopoly')){
  const old=item.question;let q=old.q,options=[...old.options],m;
  if(m=q.match(/^In the (.+) market, an incumbent announces a severe post-entry price cut\./)){
   const industry={'airlines':'airline','wireless carriers':'wireless-service','soft-drink producers':'soft-drink','cement companies':'cement','chip manufacturers':'computer-chip'}[m[1]];
   q=`In an oligopolistic ${industry} market, an established firm threatens a sharp price cut if a rival enters. Its own analysis shows that carrying out the cut would earn less than accepting the rival's entry. Is the threat credible?`;
   const wrong=['Yes. A price cut would hurt the entrant, so the incumbent would necessarily carry it out.','Yes. Announcing the price cut commits the incumbent to carrying it out after entry.','No. Once a rival enters, the incumbent is unable to change its price.'];
   options=[...wrong];options.splice(item.correctIndex,0,'No. After entry, the incumbent would earn more by accepting the rival than by cutting price.');
  }
  if(m=q.match(/^Calculate the four-firm concentration ratio for shares \[([^\]]+)\]\.$/))q='Five firms have market shares of '+m[1].split(', ').map(s=>s+'%').join(', ')+'. What is the four-firm concentration ratio?';
  if(m=q.match(/^Calculate the HHI for (?:this market|market C\d+) with percentage shares \[([^\]]+)\]\.$/))q='Five firms have market shares of '+m[1].split(', ').map(s=>s+'%').join(', ')+'. What is the Herfindahl–Hirschman Index (HHI)?';
  q=q.replace('Refer to market-share chart. Other combines smaller firms, each with a share below firm D.','Refer to the market-share chart. The “Other” category combines smaller firms, each with a smaller share than firm D.').replace('For this calculation, assume the bar labeled Other represents one additional firm, not several small firms.','For this calculation, treat “Other” as one additional firm.').replace('What is the HHI?','What is the Herfindahl–Hirschman Index (HHI)?');
  q=q.replace('Which contingent plan gives Row a best response to each possible Column action?','How should the Row firm respond if the Column firm chooses X, and if it chooses Y?').replace('Payoffs are ordered (Row, Column).','The first payoff is Row’s and the second is Column’s.');
  options=options.map(o=>o.replace(/^([AB]) against X and ([AB]) against Y$/,'Choose $1 against X and $2 against Y.').replace(/^Row A, Column X; Row A, Column Y; Row B, Column X; Row B, Column Y$/,'All four cells.'));
  if(/^P62I-OLI-C-02[67]$/.test(item.id))q=q.replace('Assume the firms interact indefinitely.','Two firms in an oligopoly expect to interact indefinitely.').replace(/Cooperating pays (\d+) each period/,'Cooperating pays $$$1 each period').replace(/Cheating pays (\d+) now, followed by (\d+) every period/,'Cheating pays $$$1 now, followed by $$$2 every period').replace('By how much does the cooperation path exceed the cheating path?','How much greater is the present value of cooperating than the present value of cheating?');
  if(item.id==='P62I-OLI-C-028')options=['Future punishment matters less because each future payoff receives a larger weight.','A future dollar now has less value relative to a dollar earned today.','The immediate gain from cheating rises even though current payoffs are unchanged.','Future punishment matters more relative to the immediate gain from cheating.'];
  if(item.id==='PM8-OLI-H-068'){q=q.replace('What is the most careful conclusion?','What can be concluded about competition?');options[1]='Network effects favor large platforms, but customers’ ability to use several platforms can preserve competition.';}
  if(item.id==='P62I-OLI-B3-043'){
   q='Why should an economic assessment of market concentration consider innovation as well as current prices?';
   options=['Market power can harm current buyers, while the prospect of future profit can encourage risky investment.','Higher research spending alone proves that greater concentration will benefit consumers.','Current prices alone determine the best market structure, regardless of investment incentives.','Future product quality does not affect consumer welfare, so innovation can be assessed separately.'];
  }
  if(item.id==='P62I-OLI-B3-044')q='How should concentration measures be used when assessing competition in a market?';
  if(item.id==='PM8-OLI-H-070')q=q.replace('Which analysis is strongest?','How should the industry’s effects on consumers be assessed?');
  finish(item,{q,options},'Use natural game-theory and concentration language, clarify payoff timing and labels, and replace unrelated alternatives with plausible misunderstandings of the same concept.',edit,keep);
 }
};
