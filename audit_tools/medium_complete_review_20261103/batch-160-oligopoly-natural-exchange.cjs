'use strict';
module.exports=({items,finish})=>{
const explanations={
'P62I-OLI-M-001':'Add the four largest shares: 35% + 25% + 20% + 10% = 90%. The remaining firms are excluded from the four-firm ratio.',
'P62I-OLI-M-006':'Strategy B gives Row a higher payoff under either of Column’s choices. Because it is best regardless of what Column does, B is Row’s dominant strategy.',
'P62I-OLI-M-007':'At a Nash equilibrium, each firm’s strategy is a best response to the other’s. Neither can improve its own payoff by changing strategy while the other stays put.',
'P62I-OLI-M-008':'Each of the two outcomes is a Nash equilibrium because both players are best responding there. A game can have more than one such outcome.',
'P62I-OLI-M-017':'The same input-cost increase can make higher prices profitable for each firm independently. Similar price changes alone do not establish that firms agreed to coordinate.',
'P62I-OLI-M-018':'Once the capacity is built, using it to compete after entry can become profitable. The investment can therefore make an aggressive response more credible and discourage entry.',
'P62I-OLI-M-019':'After the rival enters, accepting the rival is more profitable than carrying out the price cut. The entrant should therefore expect the incumbent to abandon the threat.',
'P62I-OLI-M-020':'Pricing below the level that would maximize current profit sacrifices some profit now in the hope of reducing future competition. Entry deterrence is not guaranteed.',
'P62I-OLI-M-021':'If rivals match price cuts but not increases, the firm gains few customers by cutting price and loses many by raising it. That difference in responsiveness creates the demand kink.',
'P62I-OLI-M-022':'Within the marginal-revenue gap, a change in marginal cost need not change the output where profit is maximized. The firm can therefore keep the same output and price.',
'P62I-OLI-M-023':'Some consumer surplus transfers to producers through the higher price. The surplus from mutually beneficial trades that no longer occur is lost to everyone; that part is deadweight loss.',
'P62I-OLI-M-024':'Higher concentration may weaken competition, while verified cost savings may improve efficiency. Assessing the merger requires considering both effects and how they affect customers.',
'P62I-OLI-M-025':'Lower costs do not guarantee an equally large price cut. If rivalry weakens, the merged firm may retain more of the savings as profit rather than passing them to consumers.',
'P62I-OLI-M-026':'If buyers can switch to imported goods, foreign suppliers limit domestic firms’ ability to raise prices. Ignoring those alternatives can overstate domestic market power.',
'P62I-OLI-M-027':'The firm seeks customers by improving quality rather than changing price. Quality, service, and product features are forms of nonprice competition.',
'P62I-OLI-M-028':'Brand loyalty makes buyers less willing to switch in response to a price difference. Less elastic demand can reduce the pressure on firms to compete through lower prices.',
'P62I-OLI-M-030':'A firm’s best choice depends on its payoffs, what it knows, when decisions occur, and whether rivals meet again. Different market settings can therefore lead to different game-theory predictions.',
'P62I-OLI-B2-019':'A cartel can raise combined profit while each member has an incentive to sell more at the agreed high price. That private incentive to cheat can undermine the jointly profitable outcome.',
'P62I-OLI-B2-020':'An effective cartel chooses total output like a monopolist. It compares the extra revenue from industry output with the extra industry cost and selects the quantity where marginal revenue equals marginal cost.',
'P62I-OLI-B2-021':'Monitoring makes secret sales more likely to be discovered. The prospect of a credible punishment after detection can discourage cheating.',
'P62I-OLI-B2-022':'If firms expect to keep interacting, cheating today can lead to lost profits through future retaliation. Those future losses can make continued cooperation preferable.',
'P62I-OLI-B2-023':'A threat is credible when the firm would still find it worthwhile to carry out the punishment after cheating occurs. Announcing a costly response is not enough.',
'P62I-OLI-B2-024':'One firm’s price cut may look like further cheating to the other, prompting another cut. Repeated retaliation can sustain a price war even after the original misunderstanding.',
'P62I-OLI-B2-025':'Tacit coordination results from firms responding to one another without an explicit agreement. Explicit collusion involves an agreement to coordinate their behavior.',
'P62I-OLI-B2-026':'Firms facing the same change in demand or costs may independently choose similar price changes. Parallel pricing alone does not distinguish that response from collusion.',
'PM2B4-NRU-M-002':'Successful retraining reduces the mismatch between workers’ skills and available jobs. Lower structural unemployment can reduce the natural rate.',
'PM2B4-NRU-H-002':'Faster matching shortens normal job searches and reduces frictional unemployment. With other conditions unchanged, the natural rate can fall.',
'PM2B4-NRU-H-003':'Workers cannot readily reach the locations where jobs are available. That geographic mismatch can raise structural unemployment and the natural rate.',
'PM2B4-NRU-MB-004':'Frictional and structural unemployment add to 2% + 3% = 5%, the natural rate. Actual unemployment initially exceeds it by 1 percentage point. Removing that cyclical component leaves 5% unemployment.',
'PM2B4-NRU-MB-006':'Better matching lowers frictional unemployment, but new skill mismatches raise structural unemployment. Because the natural rate includes both, their relative sizes determine its net change.'
};
for(const item of items.filter(x=>['oligopoly','natural-rate-of-unemployment','nominal-exchange-rates'].includes(x.conceptId))){const p={};if(explanations[item.id])p.feedback=explanations[item.id];if(item.id==='P62I-OLI-M-006')p.q='The row player has two strategies, A and B. B gives a higher payoff whether the column player chooses X or Y. What does this establish?';if(item.id==='P62I-OLI-M-024')p.q='A merger raises the Herfindahl–Hirschman Index (HHI) but also creates verified large cost savings. What is the sound economic conclusion?';if(item.id==='PM2B4-NRU-MB-006')p.q='A reform improves job matching, while rapid technological change creates new skill mismatches. What can be concluded about the natural unemployment rate before the sizes of these effects are known?';if(item.id==='PMOE-NER-BR-001')p.q='The real exchange rate is eP/P*, where e is foreign currency per unit of domestic currency, P is the domestic price level, and P* is the foreign price level. If e rises by 10% while both price levels stay fixed, does the domestic currency also appreciate in real terms?';finish(item,p,Object.keys(p).length?'Read all components; replace terse rule statements with the causal explanation, clarify the players or rate definitions, and remove irrelevant quantities.':'Read the complete item; verified the concentration or exchange-rate arithmetic and the stated strategic or unemployment interpretation.');}
};
