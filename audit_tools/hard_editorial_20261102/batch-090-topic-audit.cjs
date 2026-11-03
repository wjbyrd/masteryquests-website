'use strict';
const crypto=require('crypto'),{table,money}=require('./helpers.cjs');
const excluded=new Set(['costs-of-production','perfect-competition','monopolistic-competition','monopoly','oligopoly','international-trade-and-trade-policy','elasticity','consumer-and-producer-surplus','market-failures']);
module.exports=({items,edit,keep})=>{
 // The first nine batches cover the large families in full. Smaller topics use
 // every screening candidate plus a deterministic two-question topic sample.
 const rows=items.filter(r=>!excluded.has(r.conceptId));
 const groups=new Map();for(const r of rows){const a=groups.get(r.conceptId)||[];a.push(r);groups.set(r.conceptId,a);}
 const sample=new Set([...groups.values()].flatMap(a=>a.sort((a,b)=>crypto.createHash('sha256').update(a.id).digest('hex').localeCompare(crypto.createHash('sha256').update(b.id).digest('hex'))).slice(0,2)).map(r=>r.id));
 const flagged=new Set(require('./screening.json').items.filter(r=>r.flags.length).map(r=>r.id));
 const replacements={
 'PM2D1-LRADJ-FB-005':['Which diagnostic prevents a mistaken forecast that ordinary self-correction must restore the old output level?','What should be checked before expecting wage adjustment to restore the old output level?'],
 'ECON-MG-LEGENDARY-9040':['What is the best economic diagnosis?','How can these changes be explained?'],
 'ECON-MG-FINALBOSS-4003':['What is the best diagnosis?','What effect does this minimum wage have?'],
 '42699':['What is the strongest diagnosis?','What did the student overlook?'],
 'ECON-NL-MEDIUMBOSS-3033':['Which diagnosis challenges its priority?','Why might this proposal fail to address the main obstacle to growth?'],
 'PM2B3-POL-FB-004':['Which package recognizes both the growth benefit and transition cost?','Which approach addresses both the growth benefit and the transition cost?'],
 'P52A-FISCAD-EL-001':['the package’s first-round effect on AD is:','what is the first-round change in aggregate demand?'],
 'P52A-FISCAD-L-003':['Relative to a package using domestic inputs, the increase in domestic aggregate demand is likely:','How does the increase in domestic aggregate demand compare with purchases using domestic inputs?'],
 'P74-INC-L-023':['Which conclusion is most defensible?','What does this outcome show about the bonus?'],
 'P74-INC-FB-004':['Which assessment is most defensible?','Why might households respond differently to this policy?'],
 '42885':['Which diagnosis and response fit the timing?','Which problem is developing, and what response addresses it before lending?'],
 'ECON-SP-LEGENDARY-9005':['Which diagnosis and policy pairing is strongest?','Which shock and policy response fit these conditions?'],
 'ECON-SP-LEGENDARY-9054':['Which response is most defensible?','Which assessment of the policy choices is correct?'],
 'PM2B1-GDPL-L-001':['Which comparison is defensible?','Do these differences establish which country has higher overall well-being?'],
 'LG-Q-359':['What chain follows?','How do interest rates, investment, and aggregate demand respond?'],
 'P52B-MVM-L-002':['Which distinction is defensible?','How do the two research questions differ?'],
 'PM2C1-MCL-FB-006':['Which diagnosis and inference are justified?','What might explain the shortfall, and what multiplier actually occurred?'],
 'LG-Q-311':['which package combines','which combination of policies links'],
 'LG-Q-312':['which package combines','which combination of policies links'],
 'LG-Q-9014':['this policy package','these policies'],
 'P52B-S3-MPT-B3-002':['A policy package supplies','The central bank supplies'],
 'ECON-SP-HARD-232':['Which chain is most accurate?','How could monetary policy increase aggregate demand?'],
 'LG-Q-261':['Which chain best explains','Which policy and sequence of effects describe'],
 'LG-Q-262':['Which chain best explains','Which policy and sequence of effects describe'],
 'LG-Q-360':['which chain correctly reaches aggregate demand?','how does this affect interest rates, investment, and aggregate demand?'],
 'LG-Q-361':['which chain correctly reaches aggregate demand?','how does this affect interest rates, investment, and aggregate demand?'],
 'LG-Q-366':['which part of the normal expansionary monetary-policy chain weakens?','which step in the usual transmission of expansionary monetary policy weakens?'],
 'PM2A-EXP-FB-010':['a simple expectations-only diagnosis','an explanation based only on changing inflation expectations'],
 'P52B-PSIG-H-001':['be insufficient for policy diagnosis','be insufficient to choose a policy response'],
 'P52A-SCAR-EL-002':['Which statement is most defensible?','What does this policy imply about benefits and tradeoffs?'],
 'P71-SCAR-B3-001':['Which claim is least defensible?','Which claim overlooks the limit imposed by the launch window?'],
 'PG2-STX-H-001':['which bundle would give','which combination gives'],
 'ECON-NL-LEGENDARY-9073':['unemployment diagnosis','classification of unemployment'],
 'PM2B4-UTYPE-L-001':['Which diagnosis is most accurate?','How has the type of unemployment changed?'],
 'ECON-NL-FINALBOSS-4010':['Which diagnosis and response pair is appropriate?','Which types of unemployment and policy responses fit these two groups?'],
 'ECON-NL-FINALBOSS-4011':['Which observation changes the diagnosis and policy emphasis?','What does the mismatch imply about the remaining unemployment and an appropriate policy response?'],
 'ECON-SP-LEGENDARY-9015':['What memo is strongest?','What happens to the interest rate?'],
 'ECON-MG-HARD-270':['What is the full market result?','What effect does this price control have?'],
 'P52A-AS-B3-001':['which conclusion should an AD-AS analysis carry forward?','what can be concluded about long-run and short-run aggregate supply?'],
 'ECON-MG-HARD-230':['Diagnose the disequilibrium and calculate the price toward which an unregulated market adjusts.','Is there a shortage or a surplus, and toward what price would an unregulated market adjust?']
 };
 for(const item of rows){const old=item.question;let q=old.q,options=[...old.options];const id=item.id;
  if(replacements[id]){const[a,b]=replacements[id];q=q.replace(a,b);}
  if(['ECON-MG-LEGENDARY-9037','ECON-MG-LEGENDARY-9038'].includes(id))options=options.map(o=>o.replace(/^(Nonbinding|Binding): the legal price/,(m,s)=>'The '+(id.endsWith('9037')?'ceiling':'floor')+' is '+s.toLowerCase()+' because the legal price'));
  if(id==='P52A-AD-B2-001')options=['Lower money demand and lower money supply both push interest rates down, so investment must rise.','Lower money demand and lower money supply both push interest rates up, so investment must fall.','Lower money demand pushes interest rates up and lower supply pushes them down, so their effects must cancel.','Lower money demand pushes interest rates down, while lower supply pushes them up. The net effect on investment is uncertain.'];
  if(id==='LG-Q-9073')options=['The direct increase is $100 billion and the multiplier raises it to $250 billion. Crowding out reduces the net increase to $175 billion.','The multiplier raises the initial increase to $250 billion. Crowding out then increases it to $325 billion.','Purchases reduce demand by $100 billion and the multiplier raises the decrease to $250 billion. Crowding out leaves a $175 billion decrease.','Demand rises by only $100 billion because crowding out exactly cancels the additional multiplier effect.'];
  if(id==='LG-Q-4008')options=['Government purchases rise $40, consumption initially stays unchanged, and total aggregate demand rises $100.','Government purchases stay unchanged, consumption initially falls $24, and total aggregate demand falls $60.','Government purchases stay unchanged, consumption initially rises $24, and total aggregate demand rises $60.','Government purchases, consumption, and total aggregate demand all stay unchanged.'];
  if(id==='P75-TRADE-L-020')options[0]='No. The gain must be measured against consumption before trade.';
  if(id==='ECON-NL-HARD-211')options[0]='Consumption rises $40,000 and net exports fall $40,000, leaving GDP unchanged.';
  if(id==='42737')options=options.map(o=>o.replace(/^Share: (\d+%); mean: ([\d.]+) (?:of|times) the overall mean; claim (rejected|supported)\.$/,(m,s,r,c)=>`The quintile receives ${s} of income, making its average ${r} times the overall mean. The claim is ${c}.`));
  if(id==='ECON-EC-FINALBOSS-19016'){q=q.replace('Which chain is best?','How does the price control explain these results?');options=['The binding ceiling creates a shortage, leading to rationing and weaker incentives for maintenance.','The binding floor creates a surplus, leading landlords to improve quality to attract tenants.','The ceiling reduces demand and creates a surplus, allowing tenants to choose better-maintained apartments.','The ceiling is nonbinding, so it leaves apartment availability and maintenance incentives unchanged.'];}
  if(id==='ECON-SP-HARD-269')options=['Aggregate demand shifts right. Output and inflation rise, while unemployment falls.','Aggregate demand shifts left. Output rises, while unemployment and inflation fall.','Short-run aggregate supply shifts left. Output rises, while unemployment and inflation fall.','Long-run aggregate supply shifts right, while unemployment and inflation rise.'];
  if(id==='ECON-NL-FINALBOSS-4021')options=['Firms choose efficiency wages; unions bargain for wages. Only union wages can exceed the market-clearing level.','Unions bargain for efficiency wages; firms independently choose union wages. Either can exceed the market-clearing level.','Firms choose efficiency wages; unions bargain for wages. Either can exceed the market-clearing level.','Legal wage floors determine both types. Neither depends on productivity incentives or bargaining.'];
  if(id==='LG-Q-359')options=options.map(o=>o.replace(/^r /,'The interest rate ').replace(/\bAD\b/g,'aggregate demand'));
  if(id==='LG-Q-4001')options=['Only the income change matters because prices do not affect money demand.','Compare how strongly higher income raises money demand with how strongly lower prices reduce it.','Only the price change matters because income does not affect money demand.','No further evidence is needed because the two effects must exactly offset.'];
  if(id==='PM2D1-LRADJ-FB-006'){q=q.replace('Demand has moved AD1→AD2','Demand has shifted from AD1 to AD2').replace('Which final price/output pairs follow?','What are the final price and output levels in each case?');options=options.map(o=>o.replace(/^Fixed AD2: (P\d)\/(Y\d); quick reversal: (P\d)\/(Y\d)\.$/,'With AD2 maintained, price is $1 and output is $2. Reversing to AD1 gives price $3 and output $4.'));}
  if(id==='P52B-S1-LRPC-L-002')options=options.map(o=>o.replace(/^Natural rate (.+); (.+); long-run unemployment is (.+)\.$/,(m,n,g,l)=>`The natural rate ${n}. ${g==='no temporary gap'?'There is no temporary gap':'The '+g}, and long-run unemployment settles at ${l}.`));
  if(id==='P52A-MARG-H-003')q='A clinic can extend its opening hours. The table gives the benefit and cost of each additional hour. How many extra hours maximize its net benefit?'+table('Benefits and costs of extending clinic hours',['Additional hour','Marginal benefit','Marginal cost'],[['First','$5,000','$2,000'],['Second','$3,000','$2,500'],['Third','$1,500','$2,200']]);
  if(id==='P73-MARG-H-010')q='Adding a hospital night shift would provide benefits worth $31,000 and require $22,000 in extra payroll. It would also divert nurses from training worth $11,000. Should the hospital add the shift?';
  if(id==='P52B-S3-MPT-B3-001')options=['Excess reserves fall from $300 to $150, so actual lending must fall by exactly $150.','Excess reserves rise from $300 to $450, releasing $150 for additional lending.','Excess reserves fall from $300 to $150, but actual lending also depends on banks and borrowers.','Bank capital falls from $300 to $150 because the reserve requirement writes down assets.'];
  if(id==='P52B-S3-MPT-B3-002')options=['Reserve capacity rises, and holding reserves becomes more attractive. Both changes encourage lending equally.','Reserve capacity rises, but holding reserves becomes more attractive. The net lending response is uncertain.','Reserve capacity falls, and holding reserves becomes more attractive. Both changes discourage lending equally.','Reserve capacity rises, and a fixed multiplier determines lending regardless of the return on reserves.'];
  if(['ECON-SP-HARD-232','LG-Q-261','LG-Q-262','LG-Q-360','LG-Q-361'].includes(id))options=options.map(o=>o.replace(/^Fed /,'The Fed ').replace(/^MS /,'Money supply ').replace(/^MD /,'Money demand ').replace(/\br (falls|rises)/g,'the interest rate $1').replace(/, (interest rate|investment) /g,', $1 ').replace(/, AD shifts (right|left)\.?$/,', and aggregate demand shifts $1.').replace(/, shift AD (right|left)\.?$/,', and shift aggregate demand $1.'));
  if(id==='LG-Q-9051')options=['Money supply falls, raising the interest rate and reducing aggregate demand and output.','Money supply rises, lowering the interest rate and increasing aggregate demand and output.','Money demand falls, lowering the interest rate and increasing investment and aggregate demand.','The price level falls as the economy moves along AD1 from Y1 to Y2.'];
  if(id==='P52B-S3-MFM-B3-002')options=['Dollars in the price quote store value, the deposit transfers funds, and the card serves as the unit of account.','Dollars in the price quote make payments, the deposit is the unit of account, and the card creates money.','Dollars in the price quote are the unit of account, the deposit funds the payment, and the card transfers those funds.','Dollars in the price quote are the unit of account, the deposit is outside money, and the card is commodity money.'];
  if(id==='PMOE-POL-H-001'){q='In the standard long-run open-economy model, how does a larger budget deficit affect saving, capital flows, and trade?';options=['Saving falls and the real interest rate rises, reducing net capital outflow. The currency appreciates and net exports fall.','Saving and the real interest rate fall, increasing net capital outflow. The currency appreciates and net exports rise.','Saving and the real interest rate rise, increasing net capital outflow. The currency depreciates and net exports fall.','Saving falls and net capital outflow rises, reducing currency supply. The currency depreciates and net exports rise.'];}
  if(id==='PMOE-POL-B3-001')options=options.map(o=>o.replace('strengthening the usual chain','amplifying the usual deficit effects').replace('the standard deficit chain need not begin','the usual effects of lower saving need not occur'));
  if(id==='P52A-OPPC-B3-001')q='A city assigns its only crew and an $8 million budget to a rail extension requiring all 12 available crew-weeks. The alternative projects below are indivisible but can be completed in sequence. Their resource use and net benefits add, and net benefits already deduct project spending. What is the best feasible alternative forgone?'+table('Alternative projects (dollar figures in millions)',['Project','Crew-weeks','Spending','Net benefit'],[['Water repairs','12','$8','$24'],['Drainage','5','$3','$14'],['Bridge work','7','$5','$15'],['Hospital upgrade','6','$5','$20']]);
  if(id==='ECON-MG-FINALBOSS-4018')options=options.map(o=>o.replace(/^Buyer price \$(\d+); seller price \$(\d+); quantity (\d+)$/,(m,b,s,n)=>`Buyers pay $${b}, sellers receive $${s}, and ${n} units trade.`));
  if(id==='ECON-NL-LEGENDARY-9071')options=options.map(o=>{const a=o.toLowerCase().split('; ');return `The first is ${a[0]}, the second is ${a[1]==='not in labor force'?'outside the labor force':a[1]}, and the third is ${a[2]==='not in labor force'?'outside the labor force':a[2]}.`;}).map(o=>o.replace('is not in labor force','is outside the labor force'));
  if(id==='P52A-AD-B3-001')q=q.replace('What occurs?','How do these changes affect movement along the aggregate-demand curve and the position of the curve?');
  if(id==='42334')q='Productivity rises 25% while the price of the firm’s output falls 10%. Does the resulting change in the value of marginal product support the shift from DL0 to DL1 shown at a $20 wage?';
  if(id==='ECON-NL-ELITE-311')q=q.replace(/\$(\d+)T/g,'$$$1 trillion');
  if(['ECON-SP-HARD-261','ECON-SP-HARD-262'].includes(id))options=options.map(o=>o.replace(/ and movement /,' and the economy moves ').replace(/^(AD|SRAS|LRAS)/,m=>({'AD':'Aggregate demand','SRAS':'Short-run aggregate supply','LRAS':'Long-run aggregate supply'}[m])).replace(/on SRPC/,'along the short-run Phillips curve').replace(/SRPC shifts/,'the short-run Phillips curve shifts').replace(/LRPC shifts/,'the long-run Phillips curve shifts')+'.');
  q=money(q);options=options.map(money);
  const patch={};if(q!==old.q)patch.q=q;if(JSON.stringify(options)!==JSON.stringify(old.options))patch.options=options;
  const depth=flagged.has(id)?'screening candidate read in full':sample.has(id)?'topic sample read in full':'whole-pool wording screen';
  if(Object.keys(patch).length)edit(id,patch,'Smaller-topic '+depth+': replace mechanical prompts or answer lists with natural prose, clarify context, or organize data while preserving the required reasoning.');
  else keep([id],'Smaller-topic '+depth+': retained; no change indicated by this editorial check. Difficulty placement remains for final review.');
 }
};
