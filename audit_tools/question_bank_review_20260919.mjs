import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {loadComposerLibrary, collectComposerQuestions, auditQuestionConstruction} from './question_quality_auditor.mjs';

const baselineArg=process.argv.indexOf('--baseline-json');
const baselineRef='c171eca5645e27baef4e36a4eb990bb0b07f61c7';
const original=execFileSync('git',['show',`${baselineRef}:build/faculty-build-composer/data/composer_library.js`],{encoding:'utf8',maxBuffer:64*1024*1024});
const base = baselineArg>=0 ? JSON.parse(fs.readFileSync(process.argv[baselineArg+1],'utf8')) : JSON.parse(original.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
const root = 'build/faculty-build-composer/data/';
const out = 'validation_artifacts/question_bank_audit_20260919';
fs.mkdirSync(out,{recursive:true});
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const norm = s => s.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const stable = x => Array.isArray(x) ? x.map(stable) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])) : x;
const entries=collectComposerQuestions(base), revisions=new Map();
function edit(id, fields, reason){
  const entry=entries.find(e=>String(e.id)===id); assert(entry, id);
  const old=revisions.get(id)||{id,concept:entry.conceptId,difficulty:entry.question.canonicalDifficulty,before:structuredClone(entry.question),after:structuredClone(entry.question),reasons:[]};
  Object.assign(old.after,fields);old.reasons.push(reason);revisions.set(id,old);
}
function choices(id, correct, distractors, reason){
  const q=revisions.get(id)?.after||entries.find(e=>e.id===id).question;
  const index=q.options.findIndex(o=>sha(norm(o))===q.aHash);assert(index>=0,id);
  const options=[...distractors];options.splice(index,0,correct);
  edit(id,{options,aHash:sha(norm(correct))},reason);
}
const wording = [
  [/compact[- ]market graph/g,'graph'],[/compact equilibrium graph/g,'graph'],
  [/movie graph with Demand with tax/g,'tax graph'],
  [/price ceiling and price floor graph/g,'price-control graph'],[/ceiling\/floor graph/g,'price-control graph'],
  [/production-distortion (?:loss|triangle)/g,'production-side deadweight loss'],
  [/consumption-distortion (?:loss|triangle)/g,'consumption-side deadweight loss'],
  [/buyer-burden rectangle/g,'buyers’ tax burden'],[/continuing trades/g,'units still traded']
];
for(const e of entries){
  let q=e.question.q;
  for(const [pattern,replacement] of wording)q=q.replace(pattern,replacement);
  if(e.conceptId==='oligopoly') q=q.replace(/^(?:Farm-equipment makers review dealer rivalry|Wireless-carrier managers evaluate a rival response|Online platforms examine network competition)\. /,'');
  if(q!==e.question.q)edit(e.id,{q},'Use standard welfare terminology or remove a noninformative graph/scenario label.');
}
edit('ECON-MG-LEGENDARY-9002',{q:'Refer to the PPF. Moving from point C to point D increases production of X but reduces production of Y. Suppose each additional unit of X generates a benefit equivalent to 3 units of Y. What is the net benefit, measured in units of Y, from moving from C to D?'},'Preserve the net-benefit calculation with natural wording.');
edit('P62C-CPS-L-025',{q:'Refer to the graph. A $4 per-unit tax reduces trade to four units. Use the original demand and supply curves to determine the prices paid by buyers and received by sellers. How much consumer surplus is lost, and how much of that loss is buyers’ tax burden on the units still traded?',feedback:'Initially consumer surplus is $25. At Q = 4, demand gives the buyer price of $16 and supply gives the seller price of $12. Consumer surplus becomes 0.5 × 4 × (24 − 16) = $16. The $9 loss consists of an $8 tax burden ($2 × 4) and $1 of consumption-side deadweight loss.'},'Explicitly require price derivation and distinguish tax burden from lost surplus.');
choices('P62C-CPS-L-025','$9 lost; $8 is buyers’ tax burden',['$9 lost; all $9 is buyers’ tax burden','$8 lost; all $8 is buyers’ tax burden','$16 lost; $8 is buyers’ tax burden'],'Replace geometry labels with the economic quantities.');
edit('P62C-CPS-L-026',{q:'Refer to the graph. Calculate producer surplus at equilibrium.'},'Ask for the economic quantity.');
edit('P62E-COP-L-008',{q:'Summit Glassworks earns $356,000 in revenue and incurs $229,000 in explicit costs. Priya gives up a $79,000 outside salary, and the opportunity cost of her invested capital is $26,000. What is the firm’s economic profit?'},'Complete sentence; economic profit remains $22,000.');
edit('P62E-COP-L-056',{q:'With a constant wage, marginal cost reaches its minimum when which production measure reaches its maximum?',image:null,graphRequired:false},'Remove an unnecessary graph and correct the marginal-product relationship.');
choices('P62E-COP-L-056','Marginal product',['Total product','Average product','Average variable cost'],'Use production and cost concepts as plausible distractors.');
edit('P62E-COP-L-059',{q:'Refer to the graph. What does a quantity of 60 represent?',graphRequired:true},'The actual graph has a single U-shaped minimum, not a plateau.');
choices('P62E-COP-L-059','Minimum efficient scale',['The output where marginal product is highest','The shutdown output in the short run','The output that maximizes total revenue'],'Use interpretable economics distractors.');
edit('P62F-PC-H-037',{q:'Refer to the graph. At the firm’s profit-maximizing output, use the gap between ATC and AVC to calculate total fixed cost.'},'Identify the relevant output explicitly.');
for(const id of ['P62E-COP-L-056','P62E-COP-L-059','P62F-PC-C-024','P62C-CPS-L-026'])edit(id,{canonicalDifficulty:'medium',difficulty:'medium',instructionalRole:'main',type:id.includes('CPS')?'graph_calculation':id.includes('059')?'graph_interpretation':'conceptual'},'Reclassify direct recognition or a single area calculation to Medium.');
edit('P62I-OLI-LB-002',{q:'Refer to the payoff matrix. Which outcome maximizes total payoff, which outcomes are Nash equilibria, and why might the firms prefer different equilibria?',feedback:'B/Y maximizes total payoff: 7 + 12 = 19, versus 11 + 7 = 18 at A/X. Both diagonal cells are mutual best responses. Row prefers A/X (11 rather than 7), while Column prefers B/Y (12 rather than 7).'},'Keep the (11,7)/(1,1)/(2,2)/(7,12) matrix and test its actual coordination conflict.');
choices('P62I-OLI-LB-002','B/Y maximizes total payoff; A/X and B/Y are equilibria; Row prefers A/X and Column prefers B/Y',['A/X maximizes total payoff; A/X and B/Y are equilibria; both firms prefer A/X','B/Y maximizes total payoff; only B/Y is an equilibrium; both firms prefer B/Y','B/Y maximizes total payoff; A/Y and B/X are equilibria; Row prefers B/X and Column prefers A/Y'],'Make every option answer all three judgments.');
for(const id of ['P62I-OLI-LB-001','P62I-OLI-LB-004','P62I-OLI-LB-007'])edit(id,{q:'Refer to the payoff matrix. Which strategies form the pure-strategy Nash equilibrium?'},'Remove the interpretation demand that cell-only options cannot answer.');
edit('P62I-OLI-LB-005',{q:'Refer to the payoff matrix. Which outcome maximizes the firms’ combined payoff?'},'Match the single-cell options to the task.');
for(const id of ['P62I-OLI-LB-003','P62I-OLI-LB-006']){
 edit(id,{q:'Refer to the payoff matrix. Which statement correctly identifies the pure-strategy Nash equilibrium and the joint-payoff maximum?',feedback:'B is Row’s best response to either column and Y is Column’s best response to either row, so B/Y is the unique Nash equilibrium. Adding both firms’ payoffs in each cell shows that A/X maximizes joint payoff.'},'Make both requested judgments explicit and remove the decorative scenario.');
 choices(id,'Only B/Y is a Nash equilibrium; A/X maximizes joint payoff',['Only A/X is a Nash equilibrium; B/Y maximizes joint payoff','A/X and B/Y are Nash equilibria; A/X maximizes joint payoff','Only B/Y is a Nash equilibrium; B/Y maximizes joint payoff'],'Each option answers both the equilibrium and joint-payoff question.');
}
edit('P62I-OLI-LB-008',{q:'Refer to the payoff matrix. Which statement correctly describes its joint payoffs and pure-strategy Nash equilibria?',feedback:'Every cell has total payoff 8. None is a pure-strategy Nash equilibrium: at every cell one firm can raise its own payoff from 2 to 6 by switching strategies.'},'The attached matrix has no pure equilibrium and equal joint payoff in all cells; it is not the coordination matrix from the other reported item.');
choices('P62I-OLI-LB-008','All four outcomes maximize joint payoff; none is a pure-strategy Nash equilibrium',['Only A/X and B/Y maximize joint payoff; both are pure-strategy Nash equilibria','All four outcomes maximize joint payoff; all four are pure-strategy Nash equilibria','Only A/Y and B/X maximize joint payoff; neither is a pure-strategy Nash equilibrium'],'Compute both criteria from the unchanged matrix.');

// Reviewed recurring constructions: preserve calculations, remove an extra
// judgment found only in the key, or give every choice the requested quantities.
for(const e of entries){
  const q=e.question, key=q.options.find(o=>sha(norm(o))===q.aHash);
  if(e.conceptId==='monopolistic-competition' && /After choosing output, which operating result follows/.test(q.q) && /; positive profit creates entry pressure$/.test(key)){
    choices(e.id,key.replace(/; positive profit creates entry pressure$/,''),q.options.filter(o=>o!==key),'Remove an unsolicited entry-pressure clause from the key; retain output and calculated profit.');
  }
  if(e.conceptId==='consumer-and-producer-surplus' && /efficient cutoff/.test(q.q) && /last accepted buyer/.test(key)){
    const values=[...q.q.matchAll(/\[([\d, ]+)\]/g)].map(m=>m[1].split(',').map(Number));
    assert.equal(values.length,2);const [v,c]=values;assert(v[2]>c[2]&&v[3]<c[3]);
    const option=(n,b,s)=>`${n} trades; marginal buyer value $${b}, marginal seller cost $${s}`;
    choices(e.id,option(3,v[2],c[2]),[option(4,v[3],c[3]),option(2,v[1],c[1]),option(3,v[4],c[4])],'Use matched cutoff evidence; distractors stop early, accept a loss-making trade, or use the wrong marginal participants.');
  }
  if(e.conceptId==='monopoly' && key==='Units between Qm and Qc for which demand exceeds MC'){
    choices(e.id,'Units between Qm and Qc with value above MC',['Units below Qm with value above the monopoly price','Units beyond Qc with MC above buyer value','Units below Qm with positive marginal revenue'],'Compare economically plausible ranges and conditions.');
  }
  if(e.conceptId==='monopoly' && key==='As an additional real resource cost of maintaining monopoly power'){
    choices(e.id,'As resources used to maintain monopoly power',['As surplus received by buyers of the product','As a transfer with no resources used','As a saving in the cost of producing output'],'Tighten the rent-seeking key while retaining competing welfare interpretations.');
  }
}
for(const [id,correct,distractors] of [
 ['P62F-PC-LB-007','Produce 70; profit $560; entry pressure',['Produce 70; profit $840; entry pressure','Shut down; loss $840; exit pressure','Produce 70; profit $560; exit pressure']],
 ['P62F-PC-LB-008','Produce 65; loss $390; exit pressure',['Shut down; loss $1,040; exit pressure','Produce 65; profit $650; entry pressure','Produce 65; loss $390; entry pressure']],
 ['P62F-PC-LB-009','Produce 80; zero economic profit; no entry or exit pressure',['Shut down; loss $640; exit pressure','Produce 80; profit $640; entry pressure','Produce 80; zero economic profit; entry pressure']],
 ['P62F-PC-LB-010','Produce 75; loss $675; exit pressure',['Shut down; loss $975; exit pressure','Produce 75; profit $300; entry pressure','Produce 75; loss $675; entry pressure']],
 ['P62F-PC-LB-011','Shut down; loss $540; exit pressure',['Produce 60; loss $780; exit pressure','Shut down; zero economic loss; no exit pressure','Produce 60; loss $240; entry pressure']],
 ['P62F-PC-LB-012','Produce or shut down; loss $440 either way; exit pressure',['Produce only; zero economic profit; no exit pressure','Shut down only; zero economic loss; exit pressure','Produce or shut down; loss $770 either way; entry pressure']],
 ['P52A-AS-L-002','Ambiguous: expectations shift SRAS left, productivity and oil shift it right',['Left: expected inflation and productivity shift SRAS left, oil shifts it right','Right: all three changes shift the SRAS curve right','Unchanged: the opposing SRAS shifts necessarily cancel each other']],
 ['P52A-AD-L-006','Ambiguous: consumption rises while net exports fall',['Left: consumption and net exports both fall','Right: consumption and net exports both rise','Unchanged: higher consumption exactly offsets lower net exports']]
])choices(id,correct,distractors,'Give all options comparable economic judgments, including plausible sign, horizon, and cost errors.');
for(const [id,oldCost,newCost] of [['P62F-PC-LB-011','$720','$540'],['P62F-PC-LB-012','$770','$440']]){
 const q=revisions.get(id).after;
 edit(id,{q:q.q.replace('TFC = '+oldCost,'TFC = '+newCost),feedback:id.endsWith('011')?'TFC = (28 − 19) × 60 = $540. Price is below AVC, so shutdown minimizes the short-run loss to fixed cost. Persistent losses create exit pressure.':'TFC = (32 − 24) × 55 = $440. Price equals minimum AVC at the candidate output, so producing and shutting down both lose fixed cost. Persistent losses create exit pressure.'},'Correct inconsistent fixed-cost data and recognize indifference at the shutdown price.');
}
// Make the candidate output assumption explicit; a P/ATC/AVC snapshot alone
// cannot establish that marginal revenue equals rising marginal cost.
for(const id of ['007','008','009','010','011','012']){
 const name='P62F-PC-LB-'+id,q=revisions.get(name).after;
 edit(name,{q:q.q.replace('Which answer correctly covers','Q is the output where price equals rising marginal cost. Which answer correctly covers')},'State why the supplied output is the operating candidate.');
}
const reviewedKeys = new Map([
 ['There is movement upward along AD, a rightward pressure from consumption, and a leftward pressure from net exports.',['Movement up AD; consumption shifts it right; net exports shift it left','Movement down AD; consumption shifts it right; net exports shift it left','A price rise shifts AD right; both spending changes move along AD','Movement up AD; consumption shifts it left; net exports shift it right']],
 ['Total surplus is unchanged, while an equity judgment requires criteria beyond efficiency',['Total surplus is unchanged; equity requires a separate judgment','Total surplus rises by $200; equity necessarily improves','Total surplus falls by $200; equity necessarily worsens','Total surplus is unchanged; its distribution cannot change']],
 ['AFC and ATC rise; AVC and MC do not',['AFC and ATC rise; AVC and MC are unchanged','AVC and MC rise; AFC and ATC are unchanged','All four per-unit cost measures rise by the same amount','TFC rises; TC and all per-unit cost measures are unchanged']],
 ['A relatively large price increase but modest quantity increase because supply constrains expansion',['A large price rise and small quantity rise, given inelastic supply','A small price rise and large quantity rise, given elastic demand','A large price fall and small quantity rise, given inelastic supply','An unchanged price and quantity, given opposing elasticities']],
 ['It may look lower because patients pay only part of the price',['Response to the provider’s price may weaken when insurance absorbs increases','Response to the provider’s price becomes identical to provider supply elasticity','Response to the provider’s price becomes unlimited whenever insurance is offered','Response to the provider’s price becomes income elasticity rather than price elasticity']],
 ['The observed quantity change may not be caused solely by the product’s price',['Income and competitor prices may also explain the quantity change','The midpoint formula requires quantity to remain unchanged','A time series cannot contain movements along a demand curve','Changing income establishes that demand is perfectly elastic']],
 ['The movement reflects a shift of demand, not movement along a stable demand curve',['The observations reflect a demand shift, not a fixed demand curve','The observations prove a positive own-price demand elasticity','The observations establish that the product is an inferior good','The observations are invalid unless supply is perfectly inelastic']],
 ['Domestic output falls while the consumer price remains pinned near the world price',['Domestic output falls; the consumer price stays at the world price','Domestic output stays fixed; the consumer price rises by the tax','Domestic output rises; the consumer price stays at the world price','Domestic output falls; the consumer price falls below the world price']],
 ['Buyers receive the benefit through a lower net price and quantity expands',['Buyer net price falls; seller price is unchanged; quantity rises','Buyer net price is unchanged; seller price rises; quantity is fixed','Buyer net price rises; seller price is unchanged; quantity falls','Buyer net price falls; seller price rises equally; quantity is fixed']],
 ['No; the negative sign is essential because it identifies an inferior good',['No; the negative sign identifies an inferior good','Yes; the magnitude alone identifies a luxury good','No; the negative sign identifies complementary goods','Yes; income elasticities are reported as absolute values']],
 ['Movement upward along AD, a rightward tax-cut shift, and a leftward net-export shift.',['Movement up AD; tax cuts shift AD right; lower foreign income shifts AD left','Movement up AD; tax cuts shift AD left; lower foreign income shifts AD right','A price-level increase shifts AD right; tax cuts and foreign income cause movements along AD','Movement down AD; tax cuts shift AD right; lower foreign income shifts AD right']],
 ['Marginal costs are higher, so fewer units have value at least as large as cost',['Higher marginal cost leaves fewer units with value above cost','Higher marginal cost lowers every buyer’s willingness to pay','Higher marginal cost makes every remaining trade create a loss','Higher marginal cost raises marginal benefit by the same amount']],
 ['The added fixed cost per unit falls as output rises',['The additional fixed payment is spread over more units','The additional payment raises marginal cost as output rises','The additional payment reduces variable cost as output rises','The additional payment becomes a variable cost at high output']],
 ['Each unit and each marginal unit carries the added cost',['The same added cost applies to each additional unit','The fixed payment is spread across increasing output','Higher productivity offsets part of each unit’s extra cost','Average fixed cost rises by the same amount as MC']],
 ['TVC rises $3Q, and AVC, ATC, and MC rise $3',['TVC rises $3Q; AVC, ATC, and MC rise $3','TFC rises $3Q; AFC and ATC rise $3','TVC rises $3; AVC and MC rise $3Q','TC rises $3Q; ATC rises $3 but MC is unchanged']],
 ['The lender may price or ration credit without observing individual risk',['Unobserved borrower risk can distort loan pricing and credit allocation','Observed borrower risk forces every risky project to fail','Private borrower information eliminates the lender’s opportunity cost','Unobserved risk makes every loan carry the same social value']],
 ['LRAS shifts right, while SRAS may shift left in the short run.',['LRAS shifts right; opposing SRAS effects make its net shift uncertain','LRAS shifts left; both changes move SRAS to the left','LRAS is unchanged; both changes move SRAS to the right','LRAS shifts right; compliance costs necessarily outweigh productivity gains']],
 ['MC and AVC rise; output may fall and shutdown becomes more likely',['MC and AVC rise; output can fall; shutdown is more likely','AFC alone rises; output is unchanged; shutdown is more likely','MC stays fixed; output rises; shutdown becomes less likely','Demand shifts right; price rises; output necessarily increases']],
 ['AFC and ATC fall while MC, AVC, and short-run output remain unchanged',['AFC and ATC fall; MC, AVC, and current output are unchanged','MC and AVC fall; current output rises at the market price','AFC and ATC fall; the minimum AVC shutdown price also falls','Demand becomes downward sloping; the firm cuts its chosen price']],
 ['ATC rises and economic profit falls, but the current P=MC output is unchanged',['ATC rises and profit falls; output at P = MC stays unchanged','MC rises and output falls; the shutdown price rises','AVC rises and profit falls; output remains at minimum ATC','Demand shifts down and output falls; cost curves stay unchanged']],
 ['Marginal and variable cost fall, shifting the operating portion of supply right',['MC and AVC fall; short-run firm supply shifts right','AFC alone falls; short-run firm supply stays unchanged','MC and AVC rise; short-run firm supply shifts left','ATC alone falls; the shutdown price stays unchanged']],
 ['MC and AVC fall; output tends to rise at the same market price',['MC and AVC fall; output rises at the same price','AFC falls but MC stays fixed; output stays unchanged','MC and AVC rise; output falls at the same price','MC falls but AVC rises; the firm must shut down']],
 ['Firm MC and AVC rise; market supply contracts in the short run and long-run industry price may rise',['MC and AVC rise; supply contracts; long-run price may rise','AFC alone rises; supply is unchanged; long-run price stays fixed','MC rises but AVC falls; supply expands; long-run price falls','Firm demand rises; supply is unchanged; long-run profit persists']],
 ['MC and AVC fall, output and profit can rise, and entry can follow',['MC and AVC fall; output and profit can rise; entry may follow','AFC alone falls; output stays fixed; entry cannot follow','MC and AVC rise; output falls; profitable firms exit','Demand falls; output and profit fall; entry may follow']],
 ['ATC falls and profit rises, but short-run output at a given price is unchanged',['ATC falls and profit rises; output at a given price is unchanged','MC falls and output rises; the shutdown price falls','AVC falls and output rises; ATC remains unchanged','Firm demand shifts right; output and the chosen price rise']],
 ['MC and AVC rise, output can fall, and shutdown becomes more likely',['MC and AVC rise; output can fall; shutdown is more likely','ATC alone rises; output is unchanged; shutdown is more likely','MC and AVC fall; output can rise; entry is more likely','AFC alone rises; output falls; exit is impossible']],
 ['Each incumbent reevaluates its output along MC and its profit at the new price',['Incumbents compare the new price with MC, AVC, and ATC','Incumbents keep output fixed until new firms have entered','Incumbents choose output at minimum ATC regardless of price','Incumbents raise their own price without changing output']],
 ['Use P1 as MR, choose Q where rising MC meets it, compare P1 with AVC and ATC',['Set MR = P1; find rising MC = MR; compare price with AVC and ATC','Use market output as firm output; compare P1 with AVC and ATC','Choose minimum ATC output first; set MR equal to ATC rather than P1','Choose firm price above P1 first; find output from the market demand curve']],
 ['Dollar willingness to pay can reflect income as well as the value or need attached to the medication',['Willingness to pay reflects income as well as medical need','Willingness to pay ranks medical need independently of income','Maximizing surplus gives every buyer the same access','Efficient allocation requires all suppliers to earn zero surplus']],
 ['Distribution changed, but total surplus did not change from the transfer alone',['Distribution changes; total surplus is unchanged by the transfer','Distribution changes; total surplus increases by $100','Distribution changes; total surplus decreases by $100','Distribution is unchanged; both sides gain $100 in surplus']],
 ['Zero profit alone does not prove free entry or the full competitive adjustment mechanism',['Zero profit alone does not establish free entry or competitive adjustment','Zero profit establishes free entry despite the stated entry barrier','Zero profit establishes both allocative and productive efficiency','Zero profit establishes that accounting profit is also zero']],
 ['Exit reduces market supply and raises the price received by survivors',['Exit reduces supply and raises the survivors’ market price','Entry expands supply and raises the survivors’ market price','Exit expands supply and lowers the survivors’ market price','Entry reduces supply and lowers the survivors’ market price']],
 ['Shut down now; exit may follow if conditions persist',['Shut down now; persistent losses can lead to exit','Produce now; persistent losses necessarily attract entry','Shut down now; fixed costs are thereby eliminated','Produce at minimum ATC; all fixed costs are covered']],
 ['The output gap contains unrealized trades for which willingness to pay exceeds MC',['Output between Qm and Qc has value above MC','Output below Qm has price below marginal cost','Output beyond Qc has value above marginal cost','The output gap consists solely of monopoly profit']],
 ['It earns zero economic profit while charging a positive markup',['Zero economic profit with a positive markup','Positive economic profit equal to markup times output','Zero economic profit with price equal to marginal cost','Positive economic profit at minimum average total cost']],
 ['The firm incurs loss, encouraging exit and strengthening demand for survivors',['Losses encourage exit; survivors face stronger demand','Losses encourage entry; survivors face weaker demand','Higher fixed cost raises MC; output immediately falls','Higher fixed cost lowers ATC; entry eliminates profit']],
 ['Compare added information or consumer value with resource cost and market-power effects',['Compare consumer benefits, resource costs, and market-power effects','Count additional seller revenue as the entire social benefit','Count all advertising expenditure as a loss without benefits','Infer full efficiency from the eventual zero-profit condition']],
 ['Revenue covers variable cost but none of the fixed cost',['Revenue covers variable cost but not fixed cost','Revenue covers fixed cost but not variable cost','Revenue exceeds total cost at the regulated output','Revenue falls below variable cost at the regulated output']],
 ['Average-cost pricing sacrifices some output to cover cost, while MC pricing is efficient but needs support',['Average-cost pricing covers cost; MC pricing needs a subsidy','Average-cost pricing maximizes output; MC pricing covers fixed cost','Both pricing rules cover total cost without a subsidy','Both pricing rules reproduce the unregulated monopoly output']],
 ['Arbitrage undermines the price difference and pushes the firm toward a common price',['Resale undermines price differences between the two groups','Resale raises the high-price group’s willingness to pay','Resale creates different marginal production costs across groups','Resale allows each buyer to be charged their maximum value']],
 ['Parallel pricing is consistent with both independent response and coordination, so more evidence is needed',['Both independent response and coordination could explain parallel prices','Parallel prices after a common shock establish an explicit agreement','Parallel prices establish that all firms lack market power','Parallel prices establish that price equals marginal cost']],
 ['Differentiation may soften direct price rivalry while intensifying nonprice competition',['Differentiation can soften price rivalry and intensify nonprice competition','Differentiation makes firms price takers and removes strategic interaction','Differentiation intensifies price rivalry but prevents quality competition','Differentiation leaves demand unchanged and removes advertising incentives']],
 ['Evaluate both loss of rivalry and verifiable efficiencies, including likely pass-through',['Weigh reduced rivalry against verified efficiencies and consumer pass-through','Approve on claimed savings without testing consumer pass-through','Reject on concentration alone without examining entry or substitution','Evaluate productive savings while excluding effects on market power']]
]);
for(const e of entries){
 const q=e.question,key=q.options.find(o=>sha(norm(o))===q.aHash),replacement=reviewedKeys.get(key);
 if(replacement)choices(e.id,replacement[0],replacement.slice(1),'Replace a repeated conspicuous key with comparable, economically competing interpretations.');
}
choices('PMOE-NCO-L-001','Approximately 5.77% < growth < 21.15%',['Approximately 0% < growth < 5.77%','Approximately 21.15% < growth < 25%','Approximately 25% < growth < 40%'],'Express every alternative as a growth interval; preserve the two-boundary calculation.');
edit('LG-Q-9016',{q:'A bank’s assets fall by 4 percent while its liabilities remain unchanged. Before the loss, capital was 5 percent of assets. What percentage of the initial capital is lost?',feedback:'Taking initial assets as 100, initial capital is 5. The asset loss is 4, so 4/5 = 80 percent of the initial capital is lost.'},'State the balance-sheet assumption and ask for the calculated loss rather than cueing it in the stem.');
choices('LG-Q-9016','80 percent',['4 percent','20 percent','100 percent'],'Use plausible percentage-base errors.');
for(const id of ['029','032','035','038','041','044']){
 const name='P62E-COP-L-'+id,q=entries.find(e=>e.id===name).question;
 const quantity=Number(q.q.match(/Q=(\d+)/)[1]),delta=(120/quantity).toFixed(2);
 edit(name,{q:q.q.replace('Which result is correct?','How do average costs and marginal cost change? Round per-unit changes to cents.'),feedback:`The fixed-cost increase adds $120/${quantity} = $${delta} to AFC and ATC. AVC and MC are unchanged because the payment does not vary with output.`,canonicalDifficulty:'hard',difficulty:'hard',instructionalRole:'main',type:'application'},'Ask for changes that can actually be derived from the stated data; the original new cost levels required missing initial costs.');
 choices(name,`AFC and ATC rise $${delta}; AVC and MC are unchanged`,[`AVC and MC rise $${delta}; AFC is unchanged`,`AFC rises $120; ATC and MC rise $${delta}`,`ATC and MC rise $120; AFC and AVC are unchanged`],'Use calculable cost changes and meaningful fixed-versus-variable errors.');
}
edit('P62E-COP-L-075',{q:'LRATC reaches its minimum of $18 at 40,000 units and remains at that minimum through 70,000 units. Which statement is correct?',canonicalDifficulty:'medium',difficulty:'medium',instructionalRole:'main',type:'application'},'State that the plateau is a global minimum; recognizing MES and constant returns is Medium application.');
choices('P62E-COP-L-075','MES is 40,000; the plateau exhibits constant returns',['MES is 70,000; the plateau exhibits constant returns','MES is 40,000; the plateau exhibits increasing returns','MES is 70,000; the plateau exhibits decreasing returns'],'Make each choice identify both MES and returns to scale.');
// Random selection makes prior questions unavailable as context. Restore the
// concrete action from each authored three-item case, without importing answers.
for(const [n,direction,costs] of [[19,'rises','constant'],[20,'rises','increasing'],[21,'rises','decreasing'],[22,'falls','constant'],[23,'falls','increasing'],[24,'falls','decreasing']]){
 const id='P62F-PC-LB-0'+n,q=entries.find(e=>e.id===id).question;
 assert(q.q.includes(`Demand ${direction}`)&&q.q.includes(costs+'-cost'));
 const up=direction==='rises',initial=up?'Price rises; profit attracts entry':'Price falls; losses induce exit';
 const end=costs==='constant'?'returns to its original level':((costs==='increasing')===up?'ends above its original level':'ends below its original level');
 choices(id,`${initial}; long-run price ${end}`,[`${initial}; the short-run price persists with ongoing economic profit`,`${up?'Price falls; losses induce exit':'Price rises; profit attracts entry'}; long-run price ${end}`,`${initial}; long-run price ${end==='ends above its original level'?'ends below its original level':'ends above its original level'}`],'Compare complete short-run and long-run adjustment paths; retain the cost-industry distinction.');
}
edit('P62F-PC-L-077',{q:'A student describes a firm with smooth cost curves as producing at minimum ATC while P = ATC > MC. Which assessment is correct?',feedback:'At an interior minimum of a smooth ATC curve, MC equals ATC. The stated combination P = minimum ATC > MC is internally inconsistent.'},'Replace an impossible cost-curve configuration with a diagnosis of the inconsistency.');
choices('P62F-PC-L-077','The description is inconsistent: MC equals ATC at its interior minimum',['The description establishes productive but not allocative efficiency','The description establishes allocative but not productive efficiency','The description implies shutdown because price is below average variable cost'],'Correct the economics rather than endorsing an impossible minimum.');
for(let n=61;n<=90;n+=3){
 const id=i=>'P62H-MCMP-L-'+String(i).padStart(3,'0');
 const source=entries.find(e=>e.id===id(n)).question.q.split(' Which economic classification')[0];
 for(const i of [n+1,n+2]){
  const q=revisions.get(id(i))?.after||entries.find(e=>e.id===id(i)).question;
  edit(id(i),{q:source+' '+q.q,canonicalDifficulty:'hard',difficulty:'hard',instructionalRole:'main',type:'analysis'},'Restore the missing case action so a randomly selected item is independently answerable; place the qualitative application at Hard.');
 }
 edit(id(n),{canonicalDifficulty:'medium',difficulty:'medium',instructionalRole:'main',type:'application'},'A single classification of a stated advertising or cost example is Medium application.');
}
for(const e of entries.filter(e=>e.conceptId==='opportunity-cost' && !e.pools.has('bridge') && /economic profit/i.test(e.question.q))){
 edit(e.id,{primaryConceptId:'costs-of-production',familyConceptId:'costs-of-production',objective:'COP.1',primarySkill:'economic_profit',repairSkill:'economic_profit',tag:'costs_of_production',conceptCluster:'micro_costs_of_production',subtopicIds:['profit-concepts'],secondaryConceptIds:['opportunity-cost']},'The assessed result is economic profit; route to Costs of Production / COP.1 and retain opportunity cost as a secondary connection.');
 if(e.question.canonicalDifficulty==='legendary')edit(e.id,{canonicalDifficulty:'hard',difficulty:'hard',instructionalRole:'main',type:'application'},'Subtracting stated explicit and implicit costs is a multistep application, not Legendary synthesis.');
}
for(const id of ['ECON-MG-LEGENDARYBOSS-9130','ECON-MG-LEGENDARYBOSS-9123','ECON-MG-LEGENDARY-9033','P52B-COMP-L-003','P62C-CPS-L-076','P62C-CPS-LB-036','42661','P62B-ELAS-L-060','P62B-ELAS-LB-032','P62C-CPS-L-089','P62E-COP-L-050','P62E-COP-L-051','P62E-COP-L-061','P62E-COP-L-062']){
 edit(id,{canonicalDifficulty:'medium',difficulty:'medium',instructionalRole:'main',type:'application'},'Direct identification or one-step application of a standard relationship does not justify a Legendary label.');
}
choices('ECON-MG-LEGENDARYBOSS-9130','No effect: the ceiling is nonbinding',['Shortage: the ceiling is binding','Surplus: the ceiling is binding','Tax wedge: the difference is $150'],'Remove unnecessary explanatory length while retaining the binding/nonbinding distinction.');
choices('42661','Equal utility requires compensation between the two goods',['More of both goods leaves utility unchanged','Moving along the curve changes the consumer’s income','Equal utility requires both goods to have negative prices'],'Use competing explanations of an indifference curve.');
for(let n=31;n<=45;n++){
 const id='P62F-PC-L-0'+n;
 if(n<=33||n>=43){
  const direction=n<=33?'rise':'fall',opposite=n<=33?'fall':'rise';
  choices(id,`AFC and ATC ${direction}; MC and AVC are unchanged; current output is unchanged`,[`MC and AVC ${direction}; current output ${n<=33?'falls':'rises'} at the given price`,`AFC and ATC ${opposite}; MC is unchanged; current output is unchanged`,`AFC alone ${direction==='rise'?'rises':'falls'}; ATC is unchanged; the firm changes its price`],'Compare cost curves and output in every fixed-cost alternative.');
 }else{
  const improves=n>=37&&n<=39,direction=improves?'fall':'rise',output=improves?'rises':'falls';
  choices(id,`MC and AVC ${direction}; the firm’s quantity supplied ${output} at a given price`,[`AFC alone ${improves?'falls':'rises'}; MC is unchanged; current output is unchanged`,`MC and AVC ${improves?'rise':'fall'}; the firm’s quantity supplied ${improves?'falls':'rises'} at a given price`,`ATC alone ${improves?'falls':'rises'}; the firm independently changes the market price`],'Compare curve and operating responses in every alternative; preserve the input-price versus productivity distinction.');
 }
 edit(id,{canonicalDifficulty:'hard',difficulty:'hard',instructionalRole:'main',type:'analysis'},'A qualitative cost-shift/output application is Hard rather than Legendary synthesis.');
}
choices('P62F-PC-L-076','Allocatively efficient; productively inefficient',['Allocatively and productively efficient','Productively efficient; allocatively inefficient','Neither allocatively nor productively efficient'],'Express each option as the requested pair of efficiency judgments.');
choices('P62F-PC-LB-031','Allocatively and productively efficient; zero economic profit',['Allocatively efficient only; positive economic profit','Productively efficient only; zero economic profit','Neither form of efficiency; negative economic profit'],'Remove a potentially overlapping efficiency distractor and compare all three judgments.');
choices('P62F-PC-LB-034','Output exceeds the social optimum because social MC exceeds price',['Output is below the social optimum because private MC equals price','Output is socially optimal because competition internalizes every cost','Output is socially optimal because zero profit eliminates external harm'],'Test social versus private marginal cost with competing explanations.');
choices('LG-Q-9069','Direct AD shift $50 billion; multiplied shift $200 billion; net shift $160 billion; gap $90 billion',['Direct AD shift $50 billion; multiplied shift $150 billion; net shift $110 billion; gap $140 billion','Direct AD shift $50 billion; multiplied shift $200 billion; net shift $200 billion; gap $50 billion','Direct AD shift $50 billion; multiplied shift $200 billion; net shift $40 billion; gap $210 billion'],'Each option supplies the full requested decomposition; distractors misuse the multiplier, omit crowding out, or multiply the already-total offset.');
const payoffTable=p=>'<table><caption>Payoffs (Row firm, Column firm)</caption><thead><tr><th scope="col">Row strategy</th><th scope="col">Column X</th><th scope="col">Column Y</th></tr></thead><tbody>'+['A','B'].map((row,i)=>`<tr><th scope="row">${row}</th><td>(${p[i*2].join(', ')})</td><td>(${p[i*2+1].join(', ')})</td></tr>`).join('')+'</tbody></table>';
for(const [id,payoffs,equilibrium,joint,proof] of [
 ['P62I-OLI-LB-001',[[12,2],[7,7],[10,10],[2,12]],'A/Y','B/X','A strictly dominates B for Row (12 > 10 and 7 > 2). Y strictly dominates X for Column (7 > 2 and 12 > 10). A/Y is the unique equilibrium with total payoff 14, while B/X maximizes total payoff at 20.'],
 ['P62I-OLI-LB-004',[[2,8],[10,10],[6,6],[12,2]],'B/X','A/Y','B strictly dominates A for Row (6 > 2 and 12 > 10). Column’s best response to B is X (6 > 2), so B/X is the unique equilibrium with total payoff 12. A/Y maximizes total payoff at 20.']
]){
 edit(id,{q:'Refer to the payoff table. Which outcome is the pure-strategy Nash equilibrium, and which maximizes joint payoff?'+payoffTable(payoffs),image:null,graphRequired:false,feedback:proof},'Introduce an economically verified off-diagonal equilibrium using an accessible payoff table; do not modify shared graph assets or the protected coordination matrix.');
 choices(id,`${equilibrium} is the unique equilibrium; ${joint} maximizes joint payoff`,[`${joint} is the unique equilibrium; ${equilibrium} maximizes joint payoff`,`${equilibrium} is the unique equilibrium and maximizes joint payoff`,`${equilibrium} and ${joint} are equilibria; ${joint} maximizes joint payoff`],'Compute the new answer from the new payoff structure while preserving its option position.');
}

// Persist an explicit, reviewable source revision ledger. Publication is opt-in.
const changes=[...revisions.values()].filter(r=>JSON.stringify(r.before)!==JSON.stringify(r.after));
fs.writeFileSync(out+'/revisions.json',JSON.stringify(changes,null,2)+'\n');
fs.writeFileSync(out+'/construction-before.json',JSON.stringify(auditQuestionConstruction(entries),null,2)+'\n');
console.log(JSON.stringify({questions:entries.length,revisions:changes.length,write:process.argv.includes('--write')}));
if(process.argv.includes('--write')){
  const live=loadComposerLibrary(),livePayload=structuredClone(live);
  delete livePayload.librarySha256;delete livePayload.registry.librarySha256;
  assert.equal(sha(JSON.stringify(stable(livePayload))),live.librarySha256,'Current library must have a valid checksum before publication');
  const priorHash=fs.existsSync(out+'/applied-library-sha256.txt')?fs.readFileSync(out+'/applied-library-sha256.txt','utf8').trim():null;
  assert([base.librarySha256,priorHash].includes(live.librarySha256),'Refusing to overwrite a later library revision; rebase the explicit review ledger first.');
  for(const m of Object.values(base.concepts)){
    for(const list of [...Object.values(m.questions||{}),m.repairQuestions||[],m.repairSeedQuestions||[],m.bridgeQuestions||[]])for(const q of list){
      const change=revisions.get(String(q.id));if(change){Object.assign(q,change.after);for(const [k,v] of Object.entries(q))if(v===null&&k==='image')delete q[k];}
    }
    for(const change of changes.filter(c=>c.concept===m.canonicalConceptId&&c.before.canonicalDifficulty!==c.after.canonicalDifficulty)){
      for(const [p,list] of Object.entries(m.questions||{})){
        const index=list.findIndex(q=>q.id===change.id);if(index<0||p===change.after.canonicalDifficulty)continue;
        const [q]=list.splice(index,1);(m.questions[change.after.canonicalDifficulty]??=[]).push(q);
      }
    }
  }
  // Move profit records through the existing canonical module/pool structure.
  for(const change of changes.filter(c=>c.before.primaryConceptId!==c.after.primaryConceptId)){
    const old=base.concepts[change.concept],dest=base.concepts[change.after.primaryConceptId];
    for(const [pool,list] of Object.entries(old.questions||{})){
      const index=list.findIndex(q=>String(q.id)===change.id);if(index<0)continue;
      const [q]=list.splice(index,1);const target=change.after.canonicalDifficulty;
      (dest.questions[target]??=[]).push(q);
    }
  }
  const afterEntries=collectComposerQuestions(base);
  const objectiveDeclarations=[];
  for(const [conceptId,module] of Object.entries(base.concepts)){
    const qs=afterEntries.filter(e=>e.conceptId===conceptId).map(e=>e.question);
    const known=new Set([...(module.legacyObjectives||[]),...Object.keys(module.objectiveLabels||{})]);
    const missing=[...new Set(qs.map(q=>q.objective).filter(id=>id&&!known.has(id)))].sort();
    if(!missing.length)continue;
    const registry=base.registry.concepts.find(r=>r.canonicalConceptId===conceptId);
    objectiveDeclarations.push({conceptId,addedExistingObjectiveIds:missing,questionIds:qs.filter(q=>missing.includes(q.objective)).map(q=>q.id),beforeLegacyObjectives:module.legacyObjectives||[],beforeRegistryObjectives:registry.sourceObjectives||[]});
    module.legacyObjectives=[...(module.legacyObjectives||[]),...missing];
    module.objectiveLabels??={};
    // These are retained legacy codes, not newly authored outcome labels.
    for(const id of missing)module.objectiveLabels[id]=id;
    registry.sourceObjectives=[...new Set([...(registry.sourceObjectives||[]),...missing])];
  }
  fs.writeFileSync(out+'/objective-declarations.json',JSON.stringify(objectiveDeclarations,null,2)+'\n');
  for(const row of base.registry.concepts){
    if(!changes.some(c=>c.concept===row.canonicalConceptId||c.after.primaryConceptId===row.canonicalConceptId))continue;
    const qs=afterEntries.filter(e=>e.conceptId===row.canonicalConceptId).map(e=>e.question);
    if(!qs.length)continue;
    row.graphCoverage=qs.filter(q=>q.image).length;
    row.calculationCoverage=qs.filter(q=>q.instructionalRole==='calculation').length;
    for(const [target,key] of [['questionCountByDifficulty','canonicalDifficulty'],['questionCountByRole','instructionalRole']]){
      const counts={...row[target]};for(const k of Object.keys(counts))counts[k]=0;for(const q of qs)counts[q[key]||'unknown']=(counts[q[key]||'unknown']||0)+1;row[target]=counts;
    }
  }
  delete base.librarySha256;delete base.registry.librarySha256;
  base.librarySha256=sha(JSON.stringify(stable(base)));base.registry.librarySha256=base.librarySha256;
  fs.writeFileSync(root+'composer_library.js','window.MQ_COMPOSER_LIBRARY='+JSON.stringify(base)+';\n');
  fs.writeFileSync(root+'composer_registry.json',JSON.stringify(base.registry,null,2)+'\n');
  const manifest=JSON.parse(fs.readFileSync(root+'composer_library_manifest.json','utf8'));manifest.librarySha256=base.librarySha256;
  fs.writeFileSync(root+'composer_library_manifest.json',JSON.stringify(manifest,null,2)+'\n');
  fs.writeFileSync(out+'/construction-after.json',JSON.stringify(auditQuestionConstruction(afterEntries),null,2)+'\n');
  fs.writeFileSync(out+'/applied-library-sha256.txt',base.librarySha256+'\n');
}
