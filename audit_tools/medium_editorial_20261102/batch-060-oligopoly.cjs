'use strict';
const {finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{for(const item of items.filter(r=>r.conceptId==='oligopoly')){
 const old=item.question;let q=old.q,options=[...old.options],m;
 q=q.replace('A cell is a Nash equilibrium when:','Which condition makes an outcome in a payoff matrix a Nash equilibrium?').replace('What is the HHI?','What is the Herfindahl–Hirschman Index (HHI)?').replace('Refer to the payoff matrix. Identify the joint-payoff-maximizing cell.','Use the firms’ payoff matrix. Which outcome gives them the largest combined payoff?').replace('Refer to the cartel graph. Determine the joint-profit-maximizing output.','Use the cartel graph. Which output maximizes the members’ combined profit?');
 if(m=q.match(/^Shares (\d+)% and (\d+)% combine\. What is the direct HHI increase\?$/))q=`Two firms with market shares of ${m[1]}% and ${m[2]}% merge. All other shares stay fixed. By how many points does the Herfindahl–Hirschman Index (HHI) rise?`;
 if(item.id==='P62I-OLI-M-019'){
  q='An established firm threatens to slash prices if a rival enters. Once entry occurs, carrying out the threat would leave it worse off than accepting the rival. Should the entrant regard the threat as credible?';
  options=['No. The firm would have an incentive to abandon the threat after entry.','Yes. Announcing a price cut guarantees that carrying it out is profitable.','Yes. Hurting the entrant makes the cut worthwhile regardless of its cost.','No. An established firm is unable to change its price after entry.'];
 }
 if(item.id==='P62I-OLI-M-022')q='In the kinked-demand model, marginal cost changes within the gap in the marginal-revenue curve. What does the model predict about price and output?';
 if(item.id==='P62I-OLI-M-027')q='An oligopolist improves product quality while keeping its price unchanged. How is it competing for customers?';
 if(item.id==='PM8-OLI-M-034')q=q.replace('Economically, the rebates are best interpreted as:','How do these rebates affect the agreement?');
 if(item.id==='PM8-OLI-M-021')options=options.map(o=>o.replace('Compare Row’s first-number payoffs across Row’s available actions in column Y','Hold Column’s choice at Y and compare the first payoff for each action available to Row.').replace('Compare Column’s second-number payoffs across every column, regardless of which action Column has already chosen','Compare Column’s payoffs across all columns, allowing its action to change.'));
 const stems={
 'P62I-OLI-B2-021':'How can monitoring members’ sales help a cartel maintain its agreement?',
 'P62I-OLI-B2-022':'Firms expect to keep competing without a known final round. Why can that make cooperation easier to sustain?',
 'P62I-OLI-B2-023':'A cartel member threatens to punish a rival that cheats. What would make carrying out that threat credible?',
 'P62I-OLI-B2-024':'A firm mistakes a rival’s temporary discount for cheating and cuts its own price. Why might a price war continue?',
 'P62I-OLI-B2-026':'Firms raise their prices at about the same time. Why is this evidence alone insufficient to establish collusion?',
 };
 if(stems[item.id])q=stems[item.id];
 if(m=old.q.match(/^Assume the firms interact indefinitely\. Cooperating pays (\d+) each period, starting now\. Cheating pays (\d+) now, followed by (\d+) every period forever starting next period\. Multiply each future payoff by ([\d.]+) for every period ahead\..+$/)){
  q=`Two oligopolists expect to interact indefinitely. A firm earns $${m[1]} each period if it cooperates. Cheating pays $${m[2]} now and $${m[3]} each period thereafter. Discount each payoff one period ahead by ${m[4]}, applying that factor again for every additional period. Is continued cooperation preferable to cheating?`;
  options=['No. The immediate payoff from cheating is larger, so future payoffs cannot change the choice.','Yes. Repeated interaction guarantees cooperation regardless of the payoff amounts.','No. Future punishment can matter only when the game has a known final round.'];
  options.splice(item.correctIndex,0,'Yes. Continuing cooperation has a higher present value than cheating and receiving the later punishment payoff.');
 }
 finish(item,{q,options},'Read the complete oligopoly family; replace terse prompts with complete questions, clarify strategic context and payoff timing, and make alternatives address the same decision.',edit,keep);
}};
