'use strict';
// Instructor decisions from the completed easy review. Never reads instructions from CSV cells.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer');
const core=require(path.join(dir,'composer-core.js'));
require('./baseline.cjs')();
const {questionRecords}=require(path.join(dir,'tests/composer-integrity-contracts.js'));
const load=p=>JSON.parse(fs.readFileSync(p,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
const baseline=load(path.join(__dirname,'baseline/composer_library.js'));
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'review.json'),'utf8'));
const old=new Map(questionRecords(baseline).map(r=>[String(r.question.id),r.question]));
const edits=new Map(),reasons=new Map();
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const key=q=>q.options.findIndex(s=>sha(core.normalizeAnswerText(s))===q.aHash);
function edit(id,patch,why){
 id=String(id);assert(old.has(id),id);const q=edits.get(id)||structuredClone(old.get(id));
 Object.assign(q,patch);edits.set(id,q);reasons.set(id,[...new Set([...(reasons.get(id)||[]),why])]);return q;
}
const text=(id,q,feedback)=>edit(id,{q,...(feedback?{feedback}:{})},'Natural, explicit wording from instructor review');
const options=(id,values)=>edit(id,{options:values},'Parallel answer choices without a distinctive long correct answer');

text('ECON-SP-EASY-25','What does the vertical axis of an aggregate demand–aggregate supply graph measure?');
text('ECON-SP-EASY-26','What does the horizontal axis of an aggregate demand–aggregate supply graph measure?');
text('43092','Public saving equals T − G, where G is government purchases. How should T account for transfer payments?',
 'T is tax revenue minus transfer payments. Public saving is therefore taxes minus transfers minus government purchases.');
text('43093','Government purchases exceed tax revenue after transfer payments have been subtracted. If T is that net tax revenue and G is government purchases, which relationship explains why public saving is negative?');
text('43097','Other things equal, how does a larger government budget deficit affect public saving?',
 'A larger deficit means the government saves less or borrows more, reducing public saving.');
text('PMOE-NCO-E-005','Other things equal, how does a higher domestic real interest rate affect the attractiveness of domestic assets compared with foreign assets?');
text('LG-Q-2005','The legislature approves government spending while the central bank changes interest rates. Which statement correctly describes their responsibilities?',
 'The legislature authorizes public spending. The central bank conducts monetary policy within its legal mandate and remains accountable for its actions.');
options('LG-Q-2005',[
 'The central bank approves public spending; the legislature sets monetary policy.',
 'The legislature approves public spending; the central bank operates without legal obligations.',
 'The legislature approves public spending; the Treasury must approve every private bank loan.',
 'The legislature approves public spending; the central bank conducts monetary policy under its legal mandate.'
]);
text('P62C-CPS-B1-018','In a competitive market with no externalities, what is true of the last unit produced at the quantity that maximizes total surplus?',
 'At the efficient quantity, the last unit’s marginal benefit equals its marginal cost. Producing less leaves gains from trade unrealized; producing more costs more than buyers value those additional units.');
text('LG-Q-9042','As prices rise, firms repeatedly spend time and money updating their posted prices. What is this cost of inflation called?',
 'Menu costs are the resources firms use to change posted prices, catalogs, labels, or other price information.');
text('P62E-COP-B1-001','Which item is an implicit cost rather than an explicit cost?');
text('P62E-COP-B1-008','Five workers are hired one at a time. They add 8, 12, 15, 13, and 10 units of output, respectively. With which worker does diminishing marginal product begin?',
 'The fourth worker adds 13 units, fewer than the third worker’s 15. That is the first decline in marginal product.');
text('P62E-COP-B1-009','Each additional worker adds less output than the previous worker, but still adds some output. What happens to total output?',
 'Total output continues to rise, but each additional worker increases it by a smaller amount.');
text('P62E-COP-B1-011','If hiring another worker makes marginal product negative, what happens to total output?',
 'Negative marginal product means the additional worker reduces total output.');
options('P62E-COP-B1-011',['Total output falls','Total output rises faster','Total output stays constant','Average output must rise']);
text('P62E-COP-E-026','If workers become more productive while the wage stays the same, what happens to the marginal cost of output?',
 'Each worker produces more at the same wage, so the labor cost of an additional unit falls.');
options('P62E-COP-E-026',['It rises','It falls','It stays fixed','It equals total fixed cost']);
text('43300','Other things equal, how does a larger government budget deficit affect the loanable-funds market?');
text('43304','Why can a government budget deficit reduce private investment without eliminating it?',
 'Crowding out means investment falls relative to what it would otherwise have been. Higher interest rates can discourage some projects while others remain profitable.');
text('43325','Crowding out reduces private investment by $30 billion. What does this imply for the economy’s capital formation?',
 'The economy adds less new capital than it otherwise would. A reduction in new investment does not itself remove existing capital.');
text('43141','If the amount of government debt stays the same, which change raises the government’s annual interest payments?');
text('P52B-S4-FMCO-B1-001','Before allowing for crowding out, an $80 increase in government purchases raises aggregate demand by $320. What marginal propensity to consume does the spending multiplier imply, and can we determine the final increase after crowding out?');
options('P52B-S4-FMCO-B1-001',[
 'MPC is 0.25; the final increase cannot be determined from these figures.',
 'MPC is 4; the final increase cannot be determined from these figures.',
 'MPC is 0.75; the final increase must still be $320.',
 'MPC is 0.75; the final increase cannot be determined from these figures.'
]);
text('PM2C2-FISH-EB-001','A lender agrees to a fixed nominal interest rate of 7% when expected inflation is 3%. Actual inflation turns out to be 6%. What were the approximate expected and actual real interest rates?',
 'Expected real interest was approximately 7% − 3% = 4%. Actual real interest was approximately 7% − 6% = 1%. Unexpected inflation reduces the lender’s purchasing-power return without changing the fixed nominal rate.');
options('PM2C2-FISH-EB-001',['Expected: 1%; actual: 4%','Expected: 4%; actual: 4%','Expected: 7%; actual: 6%','Expected: 4%; actual: 1%']);
text('PMOE-FX-E-005','One unit of domestic currency now buys more foreign currency than before. What has happened to the domestic currency?');
text('PM2C2-ITAX-EB-001','Inflation slows from 8% last year to 3% this year. The price index starts this year at 100, and a debt remains fixed at $103. What is the debt worth at year-end when measured in start-of-year purchasing power?');
text('P62D-ITP-B1-003','At the prevailing world price, domestic quantity demanded is 62 units and domestic quantity supplied is 18 units. How many units are imported?');
text('P62D-ITP-B1-012','If the world price equals a country’s no-trade equilibrium price, what does the supply-and-demand model predict?');
text('P62D-ITP-E-014','What does it mean for a country to gain from international trade when gains are measured using consumer and producer surplus?');
text('43308','Refer to the graph. The loanable-funds market moves from A to B. Which curves shift?');
text('P77-MVM-E-006','An analyst studies growth in real GDP per person over twenty years. Which branch of economics studies this question?');
text('P77-MVM-EASYB-023','A café chooses how many baristas to schedule. Which branch of economics studies this decision?');
text('P77-MVM-EASYB-024','A report explains changes in the national inflation rate. Which branch of economics studies this question?');
for(const id of ['P77-MVM-E-006','P77-MVM-EASYB-023','P77-MVM-EASYB-024']){
 const q=edits.get(id);q.options=q.options.map(s=>s==='Microeconomic'?'Microeconomics':s==='Macroeconomic'?'Macroeconomics':s);
}
text('PM2C2-NEUT-EB-001','Over the long run, a worker’s pay doubles from $180 to $360, and the prices of everything the worker buys also double. Technology and available resources stay the same. What happens to the worker’s real wage and the economy’s productive capacity?');
options('PM2C2-NEUT-EB-001',[
 'The real wage falls; productive capacity stays the same.',
 'The real wage and productive capacity stay the same.',
 'The real wage doubles; productive capacity stays the same.',
 'The real wage stays the same; productive capacity doubles.'
]);
text('PM2C2-NEUT-EB-002','After the money supply doubles, output rises temporarily. Eventually all prices double and real output returns to its original level. Which claim misunderstands long-run monetary neutrality?');
text('LG-Q-2009','Suppose bank lending is limited by available reserves. The central bank buys $100 of securities from banks, and reserve requirements stay unchanged. What happens to banks’ assets, and how can this affect lending?',
 'Banks exchange $100 of securities for $100 of reserves. When reserves constrain lending, additional reserves can ease credit conditions. The purchase changes the mix of bank assets; it does not directly increase bank capital or cut taxes.');
options('LG-Q-2009',[
 'Securities rise and reserves fall, easing the banks’ reserve constraint.',
 'Capital rises and reserves stay fixed, easing the banks’ reserve constraint.',
 'Tax liabilities fall and reserves stay fixed, easing the banks’ reserve constraint.',
 'Securities fall and reserves rise, easing the banks’ reserve constraint.'
]);
text('LG-Q-2011','A bank has $1,400 in deposits and $280 in reserves. Its required reserve ratio rises from 10% to 15%, with deposits and reserves unchanged. How do excess reserves change, and what can we conclude about lending?',
 'Required reserves rise from 0.10 × $1,400 = $140 to 0.15 × $1,400 = $210. Excess reserves fall from $280 − $140 = $140 to $280 − $210 = $70. Actual lending also depends on banks’ willingness to lend and borrowers’ demand for loans.');
text('P52B-S4-MPTX-B1-002','The central bank lowers interest rates, but firms become less optimistic about future sales. Why might aggregate demand rise only slightly?',
 'Lower borrowing costs encourage investment, but weaker expected sales can discourage it. Aggregate demand responds only to the spending that actually occurs.');
text('P62H-MCMP-E-026','For a monopolistically competitive firm in long-run equilibrium, what does excess capacity mean?');
text('PM6-MON-E-049','A regulator wants a monopolist to produce the quantity at which buyers’ willingness to pay equals the cost of the last unit. What should the regulated price equal?');
text('PM6-MON-E-050','A regulator wants a monopolist to cover all economic costs, including a normal return, without earning economic profit. What should the regulated price equal?');
text('P62F-PC-B1-018','In perfect competition, how are the market price and an individual firm’s output determined?',
 'Market supply and demand determine the price. A price-taking firm treats that price as marginal revenue and chooses its profit-maximizing output, subject to the shutdown decision.');
options('P62F-PC-B1-018',[
 'The firm chooses the price; market demand determines each firm’s output.',
 'Average total cost determines the price; market demand determines marginal cost.',
 'Entry determines fixed cost; each firm chooses its own demand curve.',
 'Market supply and demand determine price; the firm chooses output using that price.'
]);
text('P62F-PC-E-014','A perfectly competitive firm finds an output where marginal revenue equals marginal cost. Why must it check that marginal cost is rising through marginal revenue?',
 'At a rising-MC crossing, producing less leaves MR above MC and producing more makes MC exceed MR. This is a candidate for the best positive output; the firm must also compare producing with shutting down. A falling-MC crossing does not establish a profit maximum.');
text('PM5-PC-R-043','A student uses price below average total cost as the shutdown rule for a perfectly competitive firm. Which comparison should the student use instead?',
 'For short-run shutdown, compare price with average variable cost at the best positive output. Price below minimum AVC calls for shutdown. Average total cost determines economic profit or loss: a firm can operate at a loss when price covers variable cost and part of fixed cost.');
options('PM5-PC-R-043',['Compare price with total fixed cost','Compare price with average total cost','Compare price with average variable cost','Compare price with average fixed cost']);
text('PMOE-RER-B1-002','Domestic goods become cheaper relative to foreign goods after prices are expressed in the same currency. What is this change called?',
 'This is a real depreciation: domestic goods become less expensive relative to foreign goods. It concerns relative purchasing power, so it need not involve a change in the nominal exchange rate.');
text('PMOE-RER-E-003','Domestic goods become more expensive relative to foreign goods after prices are expressed in the same currency. What is this change called?');
text('PMOE-RER-E-005','The nominal exchange rate and foreign prices stay fixed, while domestic prices rise. What happens to the domestic currency’s real value?',
 'Domestic goods become more expensive relative to foreign goods when measured in the same currency. That is a real appreciation, even though the nominal exchange rate is unchanged.');
text('PG3-AS-E-002','Refer to the graph. How should AS1 be classified relative to AS0?');
text('ECON-SP-EASY-60','What does the vertical axis of a Phillips-curve graph measure?');
text('ECON-SP-EASY-61','What does the horizontal axis of a Phillips-curve graph measure?');

// Two exact duplicates become distinct discrimination applications; accepted 42800 stays intact.
text('42804','Two applicants have the same skills, experience, and expected productivity. An employer rejects one solely because of the applicant’s ethnicity. What does this illustrate?',
 'Using ethnicity rather than qualifications or expected productivity to make a hiring decision is labor-market discrimination. It can limit access to income even before wages are negotiated.');
options('42804',['Labor-market discrimination','A compensating wage differential','A difference in human capital','A difference in worker productivity']);
text('42808','A firm gives equally qualified employees different access to promotion because of their gender. Which explanation best accounts for the resulting earnings gap?',
 'Unequal access to promotion based on gender is labor-market discrimination. The scenario holds qualifications constant, so it does not attribute the gap to differences in human capital or productivity.');
options('42808',['Labor-market discrimination','Different education and training','Compensation for hazardous work','Different marginal productivity']);
text('ECON-NL-EASYBOSS-2035','A loan pays 4% nominal interest while inflation is 7%. What is the approximate real interest rate?',
 'The approximate real interest rate is nominal interest minus inflation: 4% − 7% = −3%. The lender receives more dollars but loses purchasing power.');
options('ECON-NL-EASYBOSS-2035',['11%','7%','3%','−3%']);

options('P62C-CPS-EL-020',['Buyers should each receive the same quantity','Low-income buyers should receive priority access','Buyers and sellers should split gains equally','Lower-cost production increases the total surplus']);
options('P62C-CPS-EL-021',['Lower-income households should receive more of the gains','Goods should go to buyers who value them most','Production should go to sellers with the lowest costs','Trade should continue while benefits exceed production costs']);
text('P62E-COP-B1-013','Marginal product crosses average product from above. At that point, average product is:',
 'When marginal product is above average product, it raises the average. When it falls below average product, it lowers the average. The crossing from above therefore marks maximum average product.');
options('P62E-COP-B1-013',['Equal to zero','At a local minimum','At a local maximum','Equal to total product']);
text('P62E-COP-B1-014','How do diminishing marginal product and diseconomies of scale differ?',
 'Diminishing marginal product concerns adding a variable input while at least one other input is fixed. Diseconomies of scale concern rising average cost when the firm expands all inputs in the long run.');
options('P62E-COP-B1-014',[
 'Both describe higher costs when every input is fixed.',
 'Both describe higher costs when every input can change.',
 'Diminishing marginal product varies all inputs; diseconomies hold some fixed.',
 'Diminishing marginal product holds some inputs fixed; diseconomies vary all inputs.'
]);
options('42490',['Computers replace designers, lowering demand for their labor','Computers leave designer productivity and labor demand unchanged','Computers raise designer productivity and demand for their labor','Computers raise designer productivity but necessarily reduce labor demand']);
for(const [id,value,wrong] of [['ECON-EC-EASYBOSS-17004',60,[115,25,95]],['ECON-NL-EASYBOSS-2000',74,[157,25,123]]])options(id,[
 `$${wrong[0]}; count all sales rather than each producer’s value added.`,
 `$${wrong[1]}; count the bakery’s value added rather than the whole chain.`,
 `$${wrong[2]}; count mill and bakery sales rather than all value added.`,
 `$${value}; count final sales or, equivalently, each producer’s value added.`
]);
options('42280',['Estimating future benefits and comparing them with current costs','Treating all future benefits as having no value today','Counting construction costs while ignoring their timing','Classifying flood protection as a private consumer good']);
options('PM6-MON-E-040',['No; monopoly changes prices but never changes total surplus','No; transfers redistribute surplus, while deadweight loss destroys surplus','Yes; all monopoly profit represents gains from trade destroyed','Yes; lost consumer surplus always equals lost total surplus']);
options('PM6-MON-E-053',['Price may exceed marginal cost while the firm covers costs','Price must fall below variable cost and force immediate shutdown','The firm’s demand must become horizontal at the regulated price','The firm must earn increasing profit at every possible output']);
options('PM6-MON-E-071',['Resale makes every customer group equally willing to pay','Resale reduces the seller’s average cost to zero','Resale lets low-price buyers undercut the higher group price','Resale gives the seller control over all secondary prices']);
options('PM6-MON-R-046',['They reduce the resources needed to produce every unit','They expand production until all potential trades occur','They make the firm face perfectly elastic demand','They use resources to secure privileges instead of producing goods']);
options('PM8-OLI-E-056',['Concentration proves that the innovation benefits exceed the costs','Market-power costs and innovation benefits both require evaluation','Research spending proves that the industry maximizes total surplus','High markups prove that the research has no social value']);
options('PM8-OLI-E-057',['Coordinated output restrictions can raise prices and reduce sales','Coordinated pricing makes each firm a competitive price taker','Coordinated decisions remove barriers and ensure free market entry','Coordinated output choices necessarily maximize consumer surplus']);
options('PM8-OLI-E-058',['Every few-firm market has the same strategic incentives','Firms choose their strategies without considering their rivals','Concentration alone determines each firm’s price and output','Costs, products, information, and rivals can change firms’ behavior']);
options('PM8-OLI-E-059',['Welfare depends on firm numbers regardless of prices or costs','Every oligopoly produces the same price and output as monopoly','Market power, rivalry, innovation, and costs all affect welfare','Four firms imply inefficiency regardless of their market behavior']);
options('PM8-OLI-R-040',['Whether the firms are identical in both size and cost','Whether either firm gains by departing from the agreement','Whether the firms can remove all barriers to entry','Whether joint profit equals the larger firm’s individual profit']);
options('PM8-OLI-R-041',['A cartel requires coordination to restrict competition, not concentration alone','A cartel means any market containing fewer than ten active firms','A cartel exists whenever concentration exceeds a particular HHI value','A cartel means one firm owns all production in the market']);
options('PM8-OLI-R-072',['The firm’s accounting profit from its total sales revenue','Surplus transferred to producers from gains from trade destroyed','The change in market price from the change in costs','The industry’s HHI from its four-firm concentration ratio']);
options('PM8-OLI-R-073',['Higher concentration warrants analysis of rivalry, entry, costs, and prices','Higher concentration directly measures the decline in total consumer surplus','Higher concentration makes the merged firm the market’s sole supplier','Higher concentration provides no information useful for evaluating the merger']);
options('PM8-OLI-R-074',['How research spending guarantees a lower concentration index','Why only perfectly competitive firms can create valuable innovations','How research spending automatically eliminates firms’ market power','How innovation benefits compare with the costs of market power']);
options('PM5-PC-R-099',['Market demand alone determines the long-run supply curve’s slope','A horizontal long-run supply curve requires a single monopolist','Long-run supply can slope up or down as industry costs change','Price-taking behavior requires a vertical long-run industry supply curve']);
options('PM5-PC-R-100',['Competitive firms expand without purchasing additional productive inputs','Industry expansion can raise input prices even when firms take output prices','Price-taking firms face permanently fixed prices for all their inputs','Industry expansion necessarily lowers the price of every productive input']);
options('PM5-PC-R-101',['Expansion can lower firms’ costs through external economies','A downward slope means firms must be coordinating prices','A downward slope means market demand must be horizontal','Expansion requires every firm to produce below variable cost']);

// Explicit notes override defaults. Range choices are adjudicated from the actual task.
const rangeTargets={
 'ECON-NL-EASYBOSS-2018':['medium','Compute a CPI and one year-over-year percentage change.'],
 'ECON-NL-EASYBOSS-2019':['hard','Combine index inflation with a nominal-to-real growth calculation.'],
 'P62G-MON-B1-003':['medium','Substitute the supplied output into a linear demand equation.'],
 'P62G-MON-B1-015':['medium','Substitute a supplied output; no marginal-revenue derivation is required.'],
 'P62G-MON-B1-018':['medium','Substitute a supplied output into demand.'],
 'P52B-S4-QTM-B1-001':['elite','Solve multiplicative money, price, output, and velocity changes and explain the shortcut error.'],
 'P52B-S4-QTM-B1-002':['hard','Combine two percentage-change factors and identify why they do not cancel.'],
 'PM2A-EXP-EB-007':['elite','Rearrange an expectations equation and analyze an unidentified supply-shock parameter.']
};
const dispositions=[];
for(const row of review.rows.filter(r=>r['Review status']==='Reviewed — flag')){
 const id=row['Question ID'],note=row.Notes.trim().toLowerCase(),flag=row['Flag reasons'];
 let target=review.overrides[id],reason=target?'Explicit instructor follow-up classification':'';
 if(!target&&(flag.includes('difficulty')||/^(medium|hard|elite|legendary|move to |raise to |should be easy)/.test(note))){
  if(rangeTargets[id]) [target,reason]=rangeTargets[id];
  else if(/elite or legendary/.test(note)){target='elite';reason='Derive marginal revenue and solve MR=MC; advanced quantitative treatment without a multi-stage synthesis.';}
  else if(/hard or elite/.test(note)){target=/What output/.test(old.get(id).q)?'elite':'hard';reason=target==='elite'?'Derive marginal revenue and solve the profit-maximization equation.':'Apply the stated demand equation to a supplied profit-maximizing output.';}
  else if(note==='should be easy'){target='easy';reason='Explicit instructor request to lower this graph-reading item.';}
  else if(/\bhard\b/.test(note)){target='hard';reason='Explicit instructor difficulty note.';}
  else {target='medium';reason=note?'Instructor difficulty flag; wording note does not specify a different tier.':'Instructor rule: difficulty flag with a blank note means medium.';}
  assert(target,`${id}: unresolved target`);
 }
 if(target) edit(id,{canonicalDifficulty:target},reason);
 dispositions.push({id,topic:row.Topic,flagReasons:flag,note:row.Notes,targetDifficulty:target||null,rationale:reason||'Apply the specific content edits recorded for this question.'});
}

// Make the algebra explicit in feedback while retaining the equations and keyed quantities.
for(const row of review.rows.filter(r=>r['Review status']==='Reviewed — flag'&&r['Flag reasons'].includes('explanation'))){
 const id=row['Question ID'],q=old.get(id);
 const match=q.q.match(/faces P=(\d+(?:\.\d+)?)−(\d+(?:\.\d+)?)Q and MC=(\d+(?:\.\d+)?)\+(\d+(?:\.\d+)?)Q/);
 if(!match)continue;
 const [a,b,c,d]=match.slice(1).map(Number),slope=2*b,denom=slope+d,output=(a-c)/denom;
 const fmt=n=>String(Number(n.toFixed(6)));
 assert(Math.abs(parseFloat(q.options[key(q)])-output)<0.011,id);
 edit(id,{feedback:`For linear demand P = ${fmt(a)} − ${fmt(b)}Q, total revenue is ${fmt(a)}Q − ${fmt(b)}Q², so marginal revenue is MR = ${fmt(a)} − ${fmt(slope)}Q. Set MR equal to MC: ${fmt(a)} − ${fmt(slope)}Q = ${fmt(c)}${d?` + ${fmt(d)}Q`:''}. Rearranging gives ${fmt(a-c)} = ${fmt(denom)}Q, so Q = ${fmt(a-c)}/${fmt(denom)} ≈ ${output.toFixed(2)} units. Marginal revenue falls while marginal cost ${d?'rises':'is constant'}, so this crossing identifies the profit-maximizing output.`},'Show the marginal-revenue equation, rearrangement, calculation, and economic interpretation');
}

// The broader edit covers the entire existing easy market-structure pool, including approvals.
const scopeTopics=new Set(['Perfect Competition','Monopoly','Monopolistic Competition','Oligopoly']);
const topicFor={'perfect-competition':'Perfect Competition','monopoly':'Monopoly','monopolistic-competition':'Monopolistic Competition','oligopoly':'Oligopoly'};
const scopeRows=new Map(review.rows.filter(r=>scopeTopics.has(r.Topic)).map(r=>[r['Question ID'],r]));
for(const q of old.values())if(q.canonicalDifficulty==='easy'&&topicFor[q.primaryConceptId])scopeRows.set(String(q.id),{'Question ID':String(q.id),Topic:topicFor[q.primaryConceptId]});
const contextualized=[],studentEdits=[];
const lowerFirst=s=>/^[A-Z]{2}\b/.test(s)?s:s.charAt(0).toLowerCase()+s.slice(1);
for(const row of scopeRows.values()){
 const id=row['Question ID'];let q=structuredClone(edits.get(id)||old.get(id));const before=q.q;
 if(row.Topic==='Perfect Competition'){
  const replace=s=>s.replace(/\blearners\b/gi,m=>m[0]==='L'?'Students':'students').replace(/\blearner\b/gi,m=>m[0]==='L'?'Student':'student');
  let changed=false;for(const field of ['q','feedback','hint'])if(typeof q[field]==='string'){const next=replace(q[field]);changed ||= next!==q[field];q[field]=next;}
  q.options=q.options.map(s=>{const next=replace(s);changed ||= next!==s;return next;});
  if(changed){edit(id,q,'Replace learner with student in the easy perfect-competition pool');studentEdits.push(id);}
  q.q=q.q.replace(/(?<!perfectly )\bcompetitive (firm|industry|market|equilibrium|benchmark)/gi,(m,n)=>'perfectly competitive '+n);
  if(!/perfect(?:ly)? competit|price.tak/i.test(q.q)){
   if(q.q.startsWith('A student '))q.q=q.q.replace('A student ','A student studying a perfectly competitive firm ');
   else if(q.q.startsWith('A firm '))q.q=q.q.replace('A firm ','A perfectly competitive firm ');
   else if(q.q.startsWith('Refer to the graph.'))q.q=q.q.replace('Refer to the graph.','Refer to the perfect-competition graph.');
   else q.q='In perfect competition, '+lowerFirst(q.q);
  }
 }else if(row.Topic==='Monopoly'){
  if(!/monopol/i.test(q.q)){
   const name=q.q.match(/^(?:After )?([A-Z][A-Za-zÀ-ž]*(?: [A-Z][A-Za-zÀ-ž]*)*) (?:faces|chooses)/);
   if(name){const firm=name[1];q.q=q.q.startsWith('After ')?`${firm} is a monopolist. `+q.q.replace(`After ${firm} chooses`,'After it chooses'):q.q.replace(firm,firm+', a monopolist,');}
   else if(q.q.startsWith('Refer to the graph.'))q.q=q.q.replace('Refer to the graph.','Refer to the graph of a monopolist.');
   else if(!/which market structure|what market structure/i.test(q.q))q.q='For a monopolist, '+lowerFirst(q.q);
  }
 }else if(row.Topic==='Monopolistic Competition'){
  if(!/monopolistic[- ]competition|monopolistically competitive/i.test(q.q)&&!/which market structure|what market structure/i.test(q.q)){
   const named=q.q.match(/^(.+?) (faces|sells a differentiated product)/);
   if(named)q.q=q.q.replace(named[1],named[1]+', a monopolistically competitive firm,');
   else if(q.q.startsWith('Refer to the graph.'))q.q=q.q.replace('Refer to the graph.','Refer to the graph of a monopolistically competitive firm.');
   else q.q='In monopolistic competition, '+lowerFirst(q.q);
  }
 }else if(!/oligopol|cartel|duopol|collus|concentration|\bHHI\b|concentrated industry|market concentration/i.test(q.q)&&!/which market structure|what market structure/i.test(q.q)){
  q.q=(/\bRow\b|payoff (?:pair|order|matrix)/.test(q.q)?'In a two-firm oligopoly game, ':'In an oligopoly, ')+lowerFirst(q.q);
 }
 if(q.q!==before){edit(id,q,'Make market structure explicit for independently selected questions');contextualized.push(id);}
}

// Smooth constructions that need more than a context prefix.
text('P62G-MON-E-013','A monopolist faces a downward-sloping linear demand curve. How does its marginal-revenue curve compare?');
text('PM6-MON-E-070','What does a monopolist generally need for price discrimination to be profitable?');
text('PM6-MON-E-072','A museum is the only seller of admission to its collection. It charges local students one price and tourists another based on verifiable group status. This is closest to:');
text('PM6-MON-E-075','A theater with market power can identify student status, but students can freely transfer discounted tickets to anyone. Which requirement for sustained price discrimination is missing?');
text('PM6-MON-E-076','A monopolist sells to two separated groups with the same marginal cost. Group A has more elastic demand than Group B. Which pricing pattern is generally expected?');
text('P62I-OLI-B1-004','Two oligopolists are labeled Row and Column. Their payoffs are listed in that order. How should the payoff pair (12, 7) be read?');
text('P62H-MCMP-E-017','When should a loss-making monopolistically competitive firm continue producing in the short run?');
text('P62H-MCMP-E-025','In long-run equilibrium under monopolistic competition, price is typically:');
text('P62G-MON-E-002','What does it mean for a monopolist to have market power?');
text('P62I-OLI-E-009','A payoff matrix describes a game between two oligopolists. In a payoff pair written (8, 5), the first number usually belongs to:');
text('PM8-OLI-E-032','Two oligopolists play a one-shot pricing game with prisoner’s-dilemma incentives. Why might both cut price even though both would prefer that neither cut?');
text('P62I-OLI-E-008','When game theory is used to study an oligopoly, a firm’s strategy is:');
text('PM8-OLI-E-012','In a game between two oligopolists, what does a payoff represent?');

// Cognitive difficulty and a checkpoint's position in a game are separate contracts.
// Preserve opening/middle/final routing instead of silently dropping advanced bosses.
for(const [id,q]of edits)if(q.canonicalDifficulty!==old.get(id).canonicalDifficulty&&old.get(id).instructionalRole==='boss'&&!old.get(id).isCheckpointChallenge){
 const source=old.get(id),stage=source.checkpointPool||({easy:'easyBoss',medium:'mediumBoss',hard:'finalBoss',legendary:'legendaryBoss'}[source.canonicalDifficulty]);
 assert(stage,'Missing checkpoint stage '+id);q.checkpointPool=stage;
 reasons.get(id).push('Preserve the checkpoint stage independently of its revised cognitive difficulty');
}

// A revised record keeps its correct answer position; hashes follow the final option text.
for(const [id,q]of edits){const k=key(old.get(id));assert(k>=0,id);q.aHash=sha(core.normalizeAnswerText(q.options[k]));assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4,id);}
for(const row of dispositions)assert(edits.has(row.id),'Unaddressed instructor flag '+row.id);
const changes=[...edits].map(([id,afterRecord])=>({id,beforeRecord:old.get(id),afterRecord,correctIndex:key(old.get(id)),fields:Object.keys(afterRecord).filter(k=>core.stableStringify(afterRecord[k])!==core.stableStringify(old.get(id)[k])),rationale:reasons.get(id)}));
assert(changes.every(c=>c.fields.length));
fs.writeFileSync(path.join(__dirname,'content-edits.json'),JSON.stringify({schemaVersion:1,beforeLibrarySha256:baseline.librarySha256,reviewSourceSha256:review.sourceSha256,dispositions,contextualized:[...new Set(contextualized)],studentEdits,changes},null,2)+'\n');
console.log(JSON.stringify({changes:changes.length,reviewFlags:dispositions.length,difficulty:dispositions.filter(d=>d.targetDifficulty).length,targets:Object.fromEntries(['easy','medium','hard','elite','legendary'].map(t=>[t,dispositions.filter(d=>d.targetDifficulty===t).length])),contextualized:[...new Set(contextualized)].length,studentEdits:studentEdits.length}));
