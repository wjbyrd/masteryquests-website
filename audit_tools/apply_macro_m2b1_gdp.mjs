import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repo=path.resolve(process.argv[2]||process.cwd());
const dryRun=process.argv.includes('--dry-run');
const PHASE='phaseM2b1-gdp-national-output-family-maturation-v1';
const STAMP='2026-08-10T22:00:00.000Z';
const SOURCE='macro-m2b1-gdp-family';
const protectedConceptId='gdp-measurement';
const ids=['gdp-components','real-versus-nominal-gdp','limits-of-gdp'];
const familyIds=[protectedConceptId,...ids];
const idSet=new Set(ids);
const composer=path.join(repo,'build','faculty-build-composer');
const dataDir=path.join(composer,'data');
const libraryPath=path.join(dataDir,'composer_library.js');
const registryPath=path.join(dataDir,'composer_registry.json');
const manifestPath=path.join(dataDir,'composer_library_manifest.json');

const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const answerHash=answer=>sha(String(answer).trim().replace(/\s+/g,' ').toLowerCase());
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const questionHash=q=>sha(JSON.stringify({q:q.q,options:q.options,aHash:q.aHash,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[],bossStage:q.bossStage||null}));
const loadLibrary=raw=>{const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(raw,sandbox,{filename:libraryPath});return sandbox.window.MQ_COMPOSER_LIBRARY;};
const rawBefore=fs.readFileSync(libraryPath,'utf8');
const library=loadLibrary(rawBefore);
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(!String(library.libraryVersion).endsWith('phaseM2a-phillips-disinflation-family-maturation-v1'))throw new Error('Unexpected live baseline: Phase M2a library required.');
for(const id of familyIds)if(!library.concepts[id])throw new Error(`Missing canonical F1 concept: ${id}`);

function tagged(module){return [...Object.entries(module.questions||{}).flatMap(([pool,list])=>(list||[]).map(question=>({pool,question}))),...(module.repairQuestions||[]).map(question=>({pool:'repair',question})),...(module.repairSeedQuestions||[]).map(question=>({pool:'repairSeed',question})),...(module.bridgeQuestions||[]).map(question=>({pool:'bridge',question}))];}
function unique(module){const seen=new Set();return tagged(module).filter(({question})=>{const id=qid(question);if(seen.has(id))return false;seen.add(id);return true;});}
function bankSnapshot(module){return unique(module).map(({pool,question})=>({pool,id:qid(question),question:stable(question)})).sort((a,b)=>a.id.localeCompare(b.id));}
function bankHash(module){return sha(JSON.stringify(stable(bankSnapshot(module))));}
function countModule(module){
  const out={easy:0,medium:0,hard:0,elite:0,legendary:0,calculation:(module.questions?.calculation||[]).length,integration:(module.questions?.integration||[]).length,easyBoss:0,mediumBoss:0,finalBoss:0,legendaryBoss:(module.questions?.legendaryBoss||[]).length,repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length,bridge:(module.bridgeQuestions||[]).length,total:unique(module).length};
  for(const p of ['easy','medium','hard','elite','legendary'])out[p]=(module.questions?.[p]||[]).length;
  for(const q of module.questions?.boss||[])out[q.difficulty]=(out[q.difficulty]||0)+1;
  return out;
}

const protectedIds=Object.keys(library.concepts).filter(id=>!idSet.has(id));
const protectedBefore=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const beforeCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
const beforeTotal=library.canonicalQuestionCount;
const changes=[];
let serial=8300000;

const lessons={
  component_classification:['Classifies by the buyer label instead of the economic transaction.','Classify final spending by household consumption, business/residential investment, government purchases, or net exports.'],
  transfer_vs_purchase:['Counts a government transfer as government purchases before any recipient buys output.','Transfers redistribute income and are excluded from G; a later purchase can enter the appropriate spending component.'],
  imports_accounting:['Treats the subtraction of imports as a claim that imported goods are inherently harmful or absent from spending.','Imports are subtracted because imported final spending may already appear in C, I, or G and foreign production must not enter domestic GDP.'],
  inventory_residential_investment:['Treats only machines as investment and misses new homes or inventory changes.','GDP investment includes business fixed investment, residential construction, and changes in inventories.'],
  expenditure_identity:['Adds financial transfers, used goods, or imported production to domestic GDP.','Use C + I + G + X − M, counting current domestic final production once.'],
  nominal_real_definition:['Uses current prices for real GDP or fixed prices for nominal GDP.','Nominal GDP uses current prices; real GDP consistently values current quantities at designated base-year prices.'],
  price_output_decomposition:['Infers output growth directly from nominal GDP growth.','Compare nominal and real GDP to separate price changes from changes in production.'],
  real_growth_rate:['Uses the new level rather than the initial real-GDP level as the percentage-growth denominator.','Real-GDP growth equals the change in real GDP divided by the initial real GDP.'],
  real_gdp_calculation:['Mixes current and base-year prices while valuing current output.','Multiply current quantities by the designated base-year prices and add across final goods.'],
  gdp_welfare_scope:['Treats GDP as either a complete welfare index or a useless statistic.','GDP is a strong measure of market production for its purpose, but it omits some dimensions of welfare.'],
  nonmarket_underground:['Assumes valuable activity must appear in GDP even without a recorded market transaction.','Unpaid household production and unreported underground activity can be omitted from measured GDP.'],
  leisure_environment_safety:['Assumes higher measured production automatically settles the welfare comparison.','Leisure, environmental quality, and health or safety can change independently of measured output.'],
  distribution_quality:['Uses an average output measure to infer distribution or every quality improvement.','GDP per person does not show distribution and may incompletely capture product-quality change.'],
  marketization_free_services:['Equates a change in market spending with the same change in total useful services.','Moving activity into or out of markets can change GDP even when useful services or consumer benefit move differently.']
};
function lesson(skill){return lessons[skill]||['Uses a surface cue instead of the national-output accounting rule.','Identify the production, price, expenditure, and welfare dimension required by the task.'];}
function rotate(options,answer,index){const n=index%options.length;const out=options.slice(n).concat(options.slice(0,n));if(!out.includes(answer))throw new Error(`Answer missing: ${answer}`);return out;}
function spec(stem,answer,wrong,skill,extra={}){return{stem,answer,options:[answer,...wrong],skill,...extra};}
const codeById={'gdp-components':'GDPC','real-versus-nominal-gdp':'RNGDP','limits-of-gdp':'GDPL'};

function addQuestion(conceptId,pool,s,index){
  const module=library.concepts[conceptId],boss=pool==='boss',lb=pool==='legendaryBoss',tier=boss?s.tier:null;
  const canonicalDifficulty=boss?({easyBoss:'easy',mediumBoss:'medium',finalBoss:'hard'})[tier]:lb?'legendary':pool;
  const marker=boss?({easyBoss:'EB',mediumBoss:'MB',finalBoss:'FB'})[tier]:({easy:'E',medium:'M',hard:'H',legendary:'L',legendaryBoss:'LB'})[pool];
  const id=`PM2B1-${codeById[conceptId]}-${marker}-${String(index+1).padStart(3,'0')}`;
  const [commonError,feedback]=lesson(s.skill);
  const q={id,sourceGame:SOURCE,q:s.stem,options:rotate(s.options,s.answer,index),tag:conceptId.replaceAll('-','_'),type:s.type||'application',objective:'MACRO.M2B1',difficulty:boss?tier:lb?'legendaryBoss':pool,conceptCluster:'macro_gdp_national_output',primarySkill:s.skill,secondarySkills:s.secondarySkills||[],repairSkill:s.skill,commonError:s.commonError||commonError,feedback:s.feedback||feedback,aHash:answerHash(s.answer),canonicalId:id,sourceId:++serial,sourceChapter:[24],sourcePool:boss?tier:s.skill,primaryConceptId:conceptId,secondaryConceptIds:s.secondaryConceptIds||[],instructionalRole:boss?'boss':lb?'legendaryBoss':pool,canonicalDifficulty,originalSourcePool:boss?tier:s.skill,originalBossTier:boss?tier:lb?'legendaryBoss':null,sourceCurationPhase:PHASE};
  if(s.roundingRule)q.roundingRule=s.roundingRule;
  if(boss)q.boss=({easyBoss:'Checkpoint One',mediumBoss:'Checkpoint Two',finalBoss:'Final Checkpoint'})[tier];
  if(lb)q.bossStage=s.bossStage||'final';
  q.sourceHash=questionHash(q);
  q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:`${PHASE}_questions.json`,sourceGlobal:'questions',sourcePool:q.sourcePool,routeKey:q.primarySkill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];
  module.questions[pool].push(q);
  changes.push({canonicalConceptId:conceptId,questionId:id,action:'ADD',oldPool:null,newPool:boss?tier:pool,reason:s.reason||'Closes a verified engine floor with a distinct GDP-family task.'});
}

function rewriteById(conceptId,kind,questionId,s,index=0){
  const module=library.concepts[conceptId],rows=kind==='repair'?module.repairQuestions:module.bridgeQuestions,q=rows.find(x=>qid(x)===questionId);
  if(!q)throw new Error(`Missing ${kind} record ${questionId}`);
  const before={q:q.q,options:q.options,aHash:q.aHash,primarySkill:q.primarySkill,secondaryConceptIds:q.secondaryConceptIds||[],commonError:q.commonError||'',feedback:q.feedback||''};
  const [commonError,feedback]=lesson(s.skill);
  Object.assign(q,{q:s.stem,options:rotate(s.options,s.answer,index),aHash:answerHash(s.answer),primarySkill:s.skill,repairSkill:s.skill,secondarySkills:s.secondarySkills||[],primaryConceptId:conceptId,secondaryConceptIds:s.secondaryConceptIds||[],commonError:s.commonError||commonError,feedback:s.feedback||feedback,type:kind,sourceCurationPhase:PHASE});
  q.sourceHash=questionHash(q);
  q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:`${PHASE}_questions.json`,sourceGlobal:kind==='repair'?'microSkillRepairPools':'microSkillBridgePools',sourcePool:q.sourcePool||s.skill,routeKey:s.skill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];
  changes.push({canonicalConceptId:conceptId,questionId,action:kind==='repair'?'REPAIR_REWRITE':'BRIDGE_REWRITE',oldPool:kind,newPool:kind,reason:kind==='repair'?'Replaces a repetitive recall item with a demonstrated one-error misconception route.':'Replaces a same-skill exercise with an explicit source-to-destination connection.',before,after:{q:q.q,options:q.options,aHash:q.aHash,primarySkill:q.primarySkill,secondaryConceptIds:q.secondaryConceptIds,commonError:q.commonError,feedback:q.feedback}});
}

function setBossStage(conceptId,questionId,bossStage){
  const q=library.concepts[conceptId].questions.legendaryBoss.find(x=>qid(x)===questionId);if(!q)throw new Error(`Missing Legendary Boss ${questionId}`);
  const before=q.bossStage??null;q.bossStage=bossStage;q.sourceHash=questionHash(q);
  changes.push({canonicalConceptId:conceptId,questionId,action:'QUALITY_FIX',oldPool:'legendaryBoss',newPool:'legendaryBoss',reason:'Adds required Legendary checkpoint stage metadata without changing canonical question content.',before:{bossStage:before},after:{bossStage}});
}

function qualityOptions(conceptId,questionId,answer,wrong,index=0){
  const row=tagged(library.concepts[conceptId]).find(({question})=>qid(question)===questionId);if(!row)throw new Error(`Missing quality record ${questionId}`);
  const q=row.question,before={options:q.options,aHash:q.aHash};q.options=rotate([answer,...wrong],answer,index);q.aHash=answerHash(answer);q.sourceCurationPhase=PHASE;q.sourceHash=questionHash(q);
  changes.push({canonicalConceptId:conceptId,questionId,action:'QUALITY_FIX',oldPool:row.pool,newPool:row.pool,reason:'Removes a material answer-length giveaway while preserving the tested concept and correct answer.',before,after:{options:q.options,aHash:q.aHash}});
}

const components={
  easy:[
    spec('A domestic winery ships newly produced wine to customers in Canada. Which expenditure entry records the sale?','Exports, which increase net exports',['Consumption by domestic households','Business fixed investment','Government purchases'],'component_classification')
  ],
  medium:[
    spec('The federal government sends pension benefits and separately buys new rescue vehicles. Which transaction enters G directly?','Only the purchase of rescue vehicles',['Only the payment of pension benefits','Both government transactions enter G directly','Neither transaction enters current government purchases'],'transfer_vs_purchase'),
    spec('A developer completes a new apartment building that will be rented to households. How is the construction classified?','Residential investment',['Household consumption','Government purchases','A financial transfer'],'inventory_residential_investment'),
    spec('Why are imports subtracted in C + I + G + X − M?','To remove foreign production already embedded in domestic spending',['Because imported goods provide no value to domestic buyers','Because every import directly reduces household consumption spending','To force exports and imports to carry opposite accounting signs'],'imports_accounting')
  ],
  hard:[
    spec('A household buys a $2,000 imported laptop, a firm buys a $5,000 domestic machine, and the government sends a $1,000 benefit check. What directly adds to domestic GDP?','$5,000 from the domestic machine',['$8,000 from all three transactions','$7,000 from the laptop and machine','$6,000 from the machine and benefit'],'expenditure_identity',{type:'calculation'}),
    spec('A retailer sells $4 million of goods produced last year and produces $6 million of new goods this year. What production enters this year’s GDP?','$6 million of current production',['$4 million of current sales','$10 million of sales plus production','$2 million of net new production'],'inventory_residential_investment',{type:'calculation'}),
    spec('A city buys $3 million of domestic buses and sends $2 million in transfers. Recipients spend $1.5 million on imported services. What is the direct increase in domestic GDP?','$3 million',['$6.5 million','$5 million','$4.5 million'],'expenditure_identity',{type:'calculation'}),
    spec('A domestic software firm exports $4 million of services, imports $1.5 million of servers, and adds $0.5 million of current domestic output to inventory. What is the direct contribution to domestic GDP?','$4.5 million',['$6 million','$3 million','$2.5 million'],'imports_accounting',{type:'calculation'})
  ],
  boss:[
    {...spec('A county buys new snowplows and sends households heating-assistance checks. Which classification is correct?','The snowplows enter G; the checks are transfers',['Both enter G because the county pays','Only the checks enter G','Neither can affect measured spending'],'transfer_vs_purchase'),tier:'mediumBoss'},
    {...spec('A household buys an imported television. Why do C and M both change?','C records the purchase, while subtracting M removes foreign production',['C excludes the television, while M adds its retail value','Both entries reduce GDP because the good is imported','M records a transfer from government to the household'],'imports_accounting'),tier:'mediumBoss'},
    {...spec('Which pair is classified as investment in GDP accounting?','A new home plus added business inventories',['A used home plus a corporate bond purchase','A pension payment plus a household appliance purchase','An imported restaurant meal plus a tax refund'],'inventory_residential_investment'),tier:'mediumBoss'},
    {...spec('C includes $8 million of spending, including $2 million on imports. I is $3 million, G is $4 million, and exports are $1 million. What is GDP?','$14 million',['$16 million','$18 million','$12 million'],'expenditure_identity',{type:'calculation'}),tier:'finalBoss'},
    {...spec('A factory produces $10 million of goods, sells $7 million domestically and $1 million abroad, and stores the rest. How much enters current GDP?','$10 million',['$8 million','$9 million','$12 million'],'inventory_residential_investment',{type:'calculation'}),tier:'finalBoss'},
    {...spec('Government buys $5 million of foreign equipment and $4 million of domestic road repair, then sends $3 million in transfers whose recipients spend $2 million on domestic services. What raises domestic GDP?','$6 million: road repair plus recipients’ domestic services',['$14 million: every payment and purchase','$11 million: government purchases plus domestic services','$9 million: both government purchases only'],'imports_accounting',{type:'calculation'}),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('Households buy $3 million of domestic services and $2 million of imports; firms buy $4 million of domestic machinery and $2 million of stock; government buys $5 million of domestic bridges and sends $1 million in transfers; exporters sell $2 million abroad. What is GDP from these transactions?','$14 million',['$19 million','$17 million','$12 million'],'expenditure_identity',{type:'calculation',secondaryConceptIds:['gdp-measurement'],bossStage:'final'})
  ]
};

const realNominal={
  easy:[
    spec('Quantity is unchanged, but the current price of the only final good falls. With the same base year, what happens?','Nominal GDP falls while real GDP is unchanged',['Both nominal and real GDP fall','Nominal GDP is unchanged while real GDP falls','Both measures remain unchanged'],'price_output_decomposition'),
    spec('The base-year price is $10 and current production is 8 units. What is current real GDP?','$80',['$18','$8','$100'],'real_gdp_calculation',{type:'calculation'})
  ],
  medium:[
    spec('Current output is 20 units, the current price is $9, and the base-year price is $6. What are nominal and real GDP?','$180 nominal and $120 real',['$120 nominal and $180 real','$180 nominal and $180 real','$120 nominal and $120 real'],'real_gdp_calculation',{type:'calculation'}),
    spec('Real GDP rises from $100 billion to $110 billion. What is the percentage growth rate?','10%',['9.1%','11%','110%'],'real_growth_rate',{type:'calculation'})
  ],
  hard:[
    spec('Nominal GDP grows 18% while the GDP deflator grows 10%. To one decimal place, what is the exact real-GDP growth implied by the ratio of the indexes?','7.3%',['8.0%','10.0%','28.0%'],'real_growth_rate',{type:'calculation',roundingRule:'Round real-GDP growth to one decimal place.'}),
    spec('Nominal GDP rises from $600 billion to $660 billion while the GDP deflator rises from 100 to 105. To one decimal place, what is real-GDP growth?','4.8%',['5.0%','10.0%','15.5%'],'real_growth_rate',{type:'calculation',roundingRule:'Round real-GDP growth to one decimal place.'})
  ],
  boss:[
    {...spec('Current quantity is 30 units, current price is $8, and base-year price is $5. Which pair is correct?','$240 nominal GDP and $150 real GDP',['$150 nominal GDP and $240 real GDP','$240 for both measures','$150 for both measures'],'real_gdp_calculation',{type:'calculation'}),tier:'mediumBoss'},
    {...spec('Nominal GDP grows 10% while real GDP grows 2%. What is the best interpretation?','Production rose, and prices also rose',['Production rose 10% with no price change','Prices fell while production rose','Real output did not change'],'price_output_decomposition'),tier:'mediumBoss'},
    {...spec('Real GDP rises from $500 billion to $525 billion. Which growth calculation uses the correct denominator?','$25 billion ÷ $500 billion = 5%',['$25 billion ÷ $525 billion = 4.8%','$525 billion ÷ $500 billion = 105%','$500 billion ÷ $25 billion = 20%'],'real_growth_rate',{type:'calculation'}),tier:'mediumBoss'},
    {...spec('An analyst values base-year quantities at current prices and labels the result current real GDP. What correction is required?','Use current quantities valued at base-year prices',['Use base-year quantities valued at current prices again','Use current quantities valued at current prices for real GDP','Subtract the inflation rate from the nominal dollar total'],'real_gdp_calculation'),tier:'finalBoss'},
    {...spec('Nominal GDP is $840 billion with a deflator of 120, then $990 billion with a deflator of 132. What happens to real GDP?','It rises from $700 billion to $750 billion',['It stays at $700 billion','It rises from $840 billion to $990 billion','It falls from $700 billion to $660 billion'],'price_output_decomposition',{type:'calculation'}),tier:'finalBoss'},
    {...spec('A country produces more units while their prices fall enough to leave nominal GDP unchanged. What can real GDP do?','Real GDP can rise because fixed-price output increased',['Real GDP must remain unchanged with nominal GDP','Real GDP must fall because current prices fell','Real GDP equals nominal GDP minus the price decline'],'price_output_decomposition'),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('Base-year prices are $4 for books and $10 for meals. Base quantities are 100 books and 20 meals. Current quantities are 120 books and 24 meals, at current prices of $5 and $12. What are current nominal GDP, current real GDP, and real-GDP growth?','$888, $720, and 20%',['$720, $888, and 23.3%','$888, $600, and 48%','$720, $600, and 20%'],'real_gdp_calculation',{type:'calculation',secondaryConceptIds:['gdp-components'],bossStage:'final'})
  ]
};

const limits={
  easy:[
    spec('A parent provides full-time unpaid child care at home. How is this usually treated in GDP?','The valuable nonmarket service is generally omitted',['It is counted as government purchases','It is counted as business investment','It is added to exports'],'nonmarket_underground'),
    spec('Two economies have equal GDP per person, but workers in one have much more leisure. What can GDP alone establish?','Their measured output is equal, not their total well-being',['Their total well-being must be equal','The economy with less leisure is necessarily better off','Leisure is already fully priced in GDP'],'leisure_environment_safety'),
    spec('Average GDP per person rises while nearly all gains go to a small group. Which limitation matters?','The average does not show how income is distributed',['GDP cannot measure the value of any recorded market production','The higher average establishes that every household received an equal gain','Income distribution is already deducted when real GDP is calculated'],'distribution_quality'),
    spec('A business produces market services but hides the sales from official records. What is the likely measurement issue?','Underground activity can make measured GDP understate production',['The hidden sales automatically enter government purchases','GDP must overstate output by the same amount','Only nonmarket household work can be omitted'],'nonmarket_underground')
  ],
  medium:[
    spec('A software update greatly improves usefulness while its market price is unchanged. What difficulty can arise?','GDP may not fully capture the quality improvement',['Real GDP must fall because price is unchanged','The update counts only as a transfer','GDP already measures every consumer benefit exactly'],'distribution_quality'),
    spec('A factory expands output while causing more pollution. What is the careful conclusion?','GDP rises, while the net welfare effect remains uncertain',['GDP and welfare must rise by the same percentage','Welfare must fall because production increased','Pollution is subtracted automatically from nominal GDP'],'leisure_environment_safety'),
    spec('A family replaces unpaid home cooking with otherwise similar restaurant meals. What can happen?','GDP rises because more activity is purchased in markets',['GDP falls because restaurant work is intermediate','GDP is unchanged because meals are identical','Real output must double'],'marketization_free_services'),
    spec('Production is unchanged, but workplace injuries fall after a safety improvement. What does GDP alone miss?','A welfare gain from greater safety',['A decline in all final output','A required increase in imports','A transfer counted in government purchases'],'leisure_environment_safety')
  ],
  hard:[
    spec('Two countries have the same real GDP per person, but one has longer life expectancy, safer streets, and cleaner water. What follows?','Equal measured output does not imply equal well-being',['Both countries must have equal welfare','The safer country must have lower real GDP','Health and safety are fully included in the GDP average'],'gdp_welfare_scope'),
    spec('Pollution causes more medical and cleanup spending, raising measured output. Why can the welfare conclusion differ from the GDP change?','GDP counts the services produced but not the full damage that made them necessary',['Medical and cleanup services never count as final output','GDP subtracts pollution damage twice','Any rise in GDP proves the damage was beneficial'],'leisure_environment_safety'),
    spec('Workers choose shorter workweeks, measured output falls, and leisure rises. Which inference is justified?','GDP falls, but well-being could rise or fall',['Both GDP and well-being must fall','GDP is unchanged because leisure replaces work','The leisure gain is automatically added to investment'],'gdp_welfare_scope')
  ],
  legendary:[
    spec('Country A has higher market output but more pollution and inequality; Country B has more leisure and unpaid household production. Which comparison is defensible?','GDP compares market production, but these facts do not settle overall well-being',['Country A must have higher well-being because GDP is higher','Country B must have higher GDP after adding leisure','GDP is useless for comparing production'],'gdp_welfare_scope'),
    spec('A free digital service replaces a paid service while users receive greater benefit. Measured GDP falls. What does this illustrate?','Market spending can fall even when consumer benefit rises',['The free service must be counted as exports','Real GDP always measures free-service quality exactly','Lower spending proves users are worse off'],'marketization_free_services'),
    spec('A storm destroys productive assets, followed by a surge in rebuilding services. What distinction is essential?','Current production can rise while lost wealth and hardship leave welfare lower',['Rebuilding cannot enter GDP because it follows destruction','The asset loss is added to current GDP as consumption','Higher rebuilding output proves the storm improved welfare'],'gdp_welfare_scope')
  ],
  boss:[
    {...spec('Unpaid elder care becomes an otherwise similar paid service. What is most likely?','GDP rises although useful care changes little',['GDP falls because all paid care becomes intermediate production','GDP stays fixed whenever the underlying service appears similar','Business investment rises by the full wage paid for care'],'marketization_free_services'),tier:'mediumBoss'},
    {...spec('Output rises while leisure and air quality decline. What can GDP alone determine?','Market production rose; the welfare change is ambiguous',['Overall well-being definitely rose','Overall well-being definitely fell','The environmental loss is already netted from GDP'],'leisure_environment_safety'),tier:'mediumBoss'},
    {...spec('GDP per person rises, but the median household’s income is unchanged. What limitation is relevant?','The average conceals how gains are distributed',['GDP fails to measure any current market production','The median household must always equal the national average','Income distribution determines only the nominal price level'],'distribution_quality'),tier:'mediumBoss'},
    {...spec('Two policies produce the same real GDP. One also yields cleaner air and more leisure. What is the best assessment?','Equal output does not erase the second policy’s other benefits',['Equal real GDP establishes identical well-being under both policies','Cleaner air necessarily makes measured real GDP lower','Additional leisure is already recorded as government purchases'],'gdp_welfare_scope'),tier:'finalBoss'},
    {...spec('A flood destroys homes, and rebuilding later raises current GDP. What must a welfare analysis also consider?','The destruction of wealth and household hardship',['Only the construction wages in nominal GDP','A required subtraction of all rebuilding services','The fact that every household received a transfer'],'gdp_welfare_scope'),tier:'finalBoss'},
    {...spec('Real GDP per person grows while preventable illness and workplace injuries rise. Which conclusion is sound?','Output rose, while the broader welfare change remains uncertain',['The health evidence proves that measured real GDP actually fell','Real-GDP growth already contains a complete health and safety adjustment','Broader well-being must rise at exactly the measured output rate'],'leisure_environment_safety'),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('Country A’s real GDP per person rises 4% as leisure falls and pollution increases. Country B’s rises 2% while leisure and environmental quality improve. What can the data establish?','A grew faster, but GDP alone cannot rank welfare changes',['A necessarily experienced the larger overall gain in well-being','B necessarily produced more recorded market output per person','Both countries experienced identical welfare changes because both grew'],'gdp_welfare_scope',{secondaryConceptIds:['real-versus-nominal-gdp'],bossStage:'middle'}),
    spec('A free technology replaces paid translation services, measured GDP falls, and users translate more text with less effort. Which diagnosis is complete?','Measured market output falls, while an unpriced consumer benefit can rise',['Real GDP must rise by the value users assign to time saved','The technology is counted as government purchases','The GDP decline proves total welfare fell'],'marketization_free_services',{secondaryConceptIds:['real-versus-nominal-gdp'],bossStage:'final'})
  ]
};

for(const [conceptId,groups] of Object.entries({'gdp-components':components,'real-versus-nominal-gdp':realNominal,'limits-of-gdp':limits}))for(const [pool,specs] of Object.entries(groups))specs.forEach((s,i)=>addQuestion(conceptId,pool,s,i));

rewriteById('gdp-components','repair','ECON-NL-IMPORTS-EXPORTS-NX-5009',spec('Why are imports subtracted after imported spending may appear in C, I, or G?','To remove foreign production from domestic GDP',['Because imports are inherently harmful','To erase the buyer’s spending from every account','Because exports must always exceed imports'],'imports_accounting'));
rewriteById('gdp-components','repair','ECON-NL-INVENTORY-INVESTMENT-5011',spec('Does a government benefit payment enter G when it is sent?','No; it is a transfer, not a purchase of current output',['Yes; every government payment enters G','Yes; but only if the household saves it','No; it enters business investment'],'transfer_vs_purchase'),1);
rewriteById('real-versus-nominal-gdp','repair','ECON-NL-NOMINAL-VS-REAL-GDP-5012',spec('Nominal GDP rises while quantities are unchanged. Does that prove production increased?','No; higher current prices can raise nominal GDP',['Yes; nominal GDP measures only changes in physical quantities','Yes; every nominal increase establishes the same real growth','No; nominal GDP deliberately excludes every change in prices'],'price_output_decomposition'));
rewriteById('real-versus-nominal-gdp','repair','ECON-NL-NOMINAL-VS-REAL-GDP-5013',spec('Is real GDP calculated by simply subtracting the inflation rate from nominal GDP?','No; value current quantities at consistent base-year prices',['Yes; subtract the inflation percentage directly from the nominal dollar level','Yes; but only when the measured inflation rate remains positive','No; value current quantities at current prices in both measures'],'real_gdp_calculation'),1);

rewriteById('gdp-components','bridge','ECON-NL-GDP-COMPONENTS-IDENTITY-6003',spec('A newly produced domestic machine counts in GDP. Which next step locates that final expenditure inside the identity?','Classify the machine as business investment',['Treat the final machine as an intermediate input and omit it','Classify the domestic machine purchase as a government transfer','Subtract the machine as an import even though it is domestic'],'component_classification',{secondaryConceptIds:['gdp-measurement']}));
rewriteById('gdp-components','bridge','ECON-NL-IMPORTS-EXPORTS-NX-6004',spec('The expenditure identity reports current-dollar spending. Which neighboring concept is needed to tell whether higher spending reflects prices or output?','Real versus nominal GDP',['Limits of GDP alone','Unemployment measurement','Bank money creation'],'price_output_decomposition',{secondaryConceptIds:['real-versus-nominal-gdp']}),1);
rewriteById('gdp-components','bridge','ECON-NL-INVENTORY-INVESTMENT-6005',spec('Current production remains unsold and enters inventory investment. Which GDP-measurement rule explains why it still counts?','Current final production is counted when produced',['Used goods are counted again whenever later resold','Inventory is treated as a transfer from the firm','Foreign production is added before subtracting every import'],'inventory_residential_investment',{secondaryConceptIds:['gdp-measurement']}),2);
rewriteById('real-versus-nominal-gdp','bridge','ECON-NL-GDP-DEFLATOR-6007',spec('GDP measurement identifies current final output. Which added step makes output comparable across years with changing prices?','Value current quantities at consistent base-year prices',['Subtract all imports from every year twice','Add transfer payments to nominal GDP','Replace quantities with current interest rates'],'real_gdp_calculation',{secondaryConceptIds:['gdp-measurement']}));
rewriteById('real-versus-nominal-gdp','bridge','ECON-NL-NOMINAL-VS-REAL-GDP-6006',spec('Real GDP per person rises, but leisure and environmental quality worsen. Which family destination evaluates the remaining question?','Limits of GDP and welfare measurement',['GDP components and the expenditure identity alone','Inventory investment and unsold production accounting','Nominal GDP measured only with current market prices'],'gdp_welfare_scope',{secondaryConceptIds:['limits-of-gdp']}),1);

qualityOptions('real-versus-nominal-gdp','ECON-NL-GDP-DEFLATOR-5014','Nominal GDP to real GDP',['The GDP price index to the consumer price index','Real-GDP growth to nominal interest-rate growth','Current output quantities to base-year output quantities'],2);
qualityOptions('real-versus-nominal-gdp','ECON-NL-EASYBOSS-2013','Uses base-year prices to remove inflation',['Uses current prices to preserve every change in inflation','Uses base-year quantities instead of current output quantities','Subtracts the inflation rate directly from nominal GDP'],1);
qualityOptions('limits-of-gdp','ECON-NL-ELITE-318','GDP counts rebuilding, not the destruction’s welfare loss',['GDP excludes all construction completed after a natural disaster','Destroyed homes are recorded as current business investment spending','Rebuilding makes the original household losses irrelevant to welfare'],1);
qualityOptions('limits-of-gdp','ECON-NL-MEDIUM-118','GDP may ignore pollution, leisure loss, and unequal distribution',['GDP fails to record any final goods sold in legal markets','Every production increase automatically reduces leisure and environmental quality','Higher GDP guarantees equal gains for households across the income distribution'],1);
qualityOptions('limits-of-gdp','ECON-NL-MEDIUM-119','GDP is useful but misses nonmarket quality-of-life factors',['GDP is useless because it excludes all current market production','GDP is complete whenever nominal prices remain unchanged','GDP measures only leisure, safety, and environmental quality'],2);
qualityOptions('limits-of-gdp','ECON-NL-HARD-217','GDP may rise even when broader well-being does not clearly improve',['GDP must fall whenever pollution or illness increases after production','GDP automatically subtracts every environmental and health cost from output','Higher measured production proves that every resident became better off'],1);
qualityOptions('limits-of-gdp','ECON-NL-HARD-218','A country’s GDP doubles while its population triples',['A country’s GDP and population both double over the same period','A country’s total GDP rises while its population remains unchanged','A country’s real GDP per person rises while total GDP remains fixed'],2);
qualityOptions('limits-of-gdp','PM2B1-GDPL-H-002','GDP counts the services produced but not the full damage that made them necessary',['Medical and cleanup services are excluded whenever pollution caused the demand','GDP subtracts the environmental damage and then subtracts cleanup spending again','Any increase in measured cleanup output proves the original damage improved welfare'],1);
qualityOptions('limits-of-gdp','PM2B1-GDPL-H-003','GDP falls, but well-being could rise or fall',['Both measured GDP and total well-being must decline by the same amount','GDP stays unchanged because added leisure replaces every lost unit of production','The leisure gain is automatically valued and added to business investment'],2);
qualityOptions('limits-of-gdp','PM2B1-GDPL-L-001','GDP compares market production, but these facts do not settle overall well-being',['Country A must have higher well-being because its recorded market GDP is higher','Country B must have higher measured GDP after valuing every hour of leisure','GDP is useless because it measures neither legal market goods nor services'],1);
qualityOptions('limits-of-gdp','PM2B1-GDPL-L-002','Market spending can fall even when consumer benefit rises',['The free digital service must be recorded as an export to foreign users','Real GDP automatically measures every quality improvement in a free service','Lower recorded spending proves every user receives less benefit from translation'],2);
qualityOptions('limits-of-gdp','PM2B1-GDPL-L-003','Current production can rise while lost wealth and hardship leave welfare lower',['Rebuilding services cannot enter GDP because the storm destroyed assets first','The destroyed productive assets are added to current household consumption spending','Higher rebuilding output proves the storm created a net gain for every household'],3);
qualityOptions('limits-of-gdp','ECON-EC-EASYBOSS-17002','GDP measures production, not all well-being',['GDP measures every environmental and leisure dimension of welfare','GDP excludes all replacement investment from measured current production','GDP directly reports how national income is distributed across households'],1);
qualityOptions('limits-of-gdp','ECON-EC-EASYBOSS-17016','GDP is useful, but it does not capture every part of well-being',['Higher GDP proves every household receives exactly the same welfare gain','Pollution and longer work hours are fully deducted from real GDP already','GDP is useless because it measures no current market production at all'],2);
qualityOptions('limits-of-gdp','ECON-EC-EASYBOSS-17017','GDP can rise without well-being rising',['Rebuilding activity is excluded whenever a natural disaster occurred first','Higher construction spending guarantees that destroyed household wealth is restored','GDP automatically subtracts every hardship caused by the original disaster'],3);
qualityOptions('limits-of-gdp','ECON-NL-EASYBOSS-2016','GDP omits important welfare factors',['GDP excludes every final good produced in a legal market','GDP measures only the distribution of current household income','GDP includes complete adjustments for leisure and environmental quality'],1);
qualityOptions('limits-of-gdp','ECON-NL-EASYBOSS-2015','People generally prefer more income and output',['GDP records every environmental and leisure benefit','Higher production guarantees equal gains for each household','GDP measures only transfers rather than market output'],2);
qualityOptions('limits-of-gdp','ECON-NL-LEGENDARYBOSS-9105','GDP rises, but welfare may remain below its pre-flood level',['GDP falls because every rebuilding service is excluded after a disaster','Welfare fully recovers whenever current construction spending increases','Destroyed homes are added to current GDP as household consumption'],1);
qualityOptions('limits-of-gdp','ECON-NL-GDP-WELLBEING-LIMITS-5016','Leisure and environmental quality',['Recorded production of final market goods','Government purchases of current public services','Business investment in newly produced capital'],1);
qualityOptions('limits-of-gdp','ECON-NL-GDP-WELLBEING-LIMITS-5017','Useful for production, but incomplete for well-being',['A complete index of every household’s welfare','Useless for measuring current market production','A direct measure of leisure and environmental quality'],2);
qualityOptions('limits-of-gdp','ECON-NL-GDP-WELLBEING-LIMITS-6008','GDP counts rebuilding but not the original welfare loss',['Rebuilding services are excluded because the disaster happened first','Destroyed homes are added to GDP as current household consumption','GDP automatically subtracts every loss of wealth and personal hardship'],1);

setBossStage('gdp-components','ECON-NL-LEGENDARYBOSS-9100','opening');
setBossStage('gdp-components','ECON-NL-LEGENDARYBOSS-9106','middle');
setBossStage('real-versus-nominal-gdp','ECON-NL-LEGENDARYBOSS-9103','opening');
setBossStage('real-versus-nominal-gdp','ECON-NL-LEGENDARYBOSS-9104','middle');
setBossStage('limits-of-gdp','ECON-NL-LEGENDARYBOSS-9105','opening');
changes.push({canonicalConceptId:protectedConceptId,questionId:null,action:'NO_CHANGE_VERIFIED',oldPool:null,newPool:null,reason:'GDP Measurement canonical content and metadata hash verified unchanged.'});

const expected={
  'gdp-measurement':{easy:7,medium:6,hard:7,elite:8,legendary:8,calculation:6,easyBoss:13,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:6,repairSeed:0,bridge:3,total:73},
  'gdp-components':{easy:6,medium:6,hard:6,elite:5,legendary:6,calculation:7,easyBoss:9,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:6,repairSeed:0,bridge:3,total:63},
  'real-versus-nominal-gdp':{easy:6,medium:6,hard:6,elite:4,legendary:6,calculation:3,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:4,repairSeed:0,bridge:2,total:49},
  'limits-of-gdp':{easy:6,medium:6,hard:6,elite:3,legendary:6,calculation:0,easyBoss:6,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:2,repairSeed:0,bridge:1,total:45}
};
const afterCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
for(const id of familyIds)for(const [key,value] of Object.entries(expected[id]))if(afterCounts[id][key]!==value)throw new Error(`${id} ${key}: ${afterCounts[id][key]} != ${value}`);

const answerIssues=[],seenIds=new Set(),seenStems=new Map();
for(const [conceptId,module] of Object.entries(library.concepts))for(const {pool,question} of unique(module)){
  const id=qid(question);if(seenIds.has(id))answerIssues.push({type:'duplicate_id',id,conceptId,pool});seenIds.add(id);
  const matches=(question.options||[]).filter(o=>answerHash(o)===String(question.aHash||'').replace(/^sha256:/i,''));if(matches.length!==1)answerIssues.push({type:'answer_hash',id,conceptId,pool,matches:matches.length});
  const stem=String(question.q||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();if(seenStems.has(stem)&&familyIds.includes(conceptId))answerIssues.push({type:'exact_stem',id,other:seenStems.get(stem),conceptId});else seenStems.set(stem,id);
}
if(answerIssues.length)throw new Error(`Question validation failed: ${JSON.stringify(answerIssues.slice(0,10))}`);

function calcLinked(q){return q.type==='calculation'||/calculation|growth_rate|gdp_deflator/.test(q.primarySkill||'');}
function graphLinked(q){return Boolean(q.image);}
function updateRegistryEntry(entry,module){
  const ordinary=['easy','medium','hard'].flatMap(p=>module.questions[p]||[]),records=unique(module).map(x=>x.question);
  const role={boss:(module.questions.boss||[]).length,bridge:module.bridgeQuestions.length,calculation:(module.questions.calculation||[]).length,elite:(module.questions.elite||[]).length,integration:(module.questions.integration||[]).length,legendary:(module.questions.legendary||[]).length,legendaryBoss:(module.questions.legendaryBoss||[]).length,main:ordinary.length,repair:module.repairQuestions.length,repairSeed:(module.repairSeedQuestions||[]).length};
  const diff={easy:(module.questions.easy||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='easyBoss').length,medium:(module.questions.medium||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='mediumBoss').length,hard:(module.questions.hard||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='finalBoss').length,elite:(module.questions.elite||[]).length,legendary:(module.questions.legendary||[]).length+(module.questions.legendaryBoss||[]).length,unknown:module.repairQuestions.length+(module.repairSeedQuestions||[]).length+module.bridgeQuestions.length};
  Object.assign(entry,{includedSkills:[...new Set(records.map(q=>q.primarySkill).filter(Boolean))].sort(),questionCountByRole:role,questionCountByDifficulty:diff,repairCoverage:{directSkillMatches:module.repairQuestions.length,mainWithUsableSkill:records.length},bridgeCoverage:{directSkillMatches:module.bridgeQuestions.length,mainWithUsableSkill:records.length},calculationCoverage:records.filter(calcLinked).length,graphCoverage:records.filter(graphLinked).length,instructionalClassification:'Engine-safe GDP family slice',coverageStatus:'ready-family-slice',coverageStatusLabel:'Engine-safe alone; deepest in GDP family',coverageStatusNote:'Phase M2b-1 supplies solo floors with controlled reuse and family-first GDP depth.',coverageFloorVersion:PHASE,notes:'Supporting slice of GDP and National Output. Use the four-concept family for the richest progression.'});
}
for(const conceptId of ids)for(const list of [library.registry.concepts,registry.concepts]){const entry=list.find(x=>x.canonicalConceptId===conceptId);if(!entry)throw new Error(`Registry entry missing: ${conceptId}`);updateRegistryEntry(entry,library.concepts[conceptId]);}

for(const [id,hash] of Object.entries(protectedBefore))if(bankHash(library.concepts[id])!==hash)throw new Error(`Protected canonical bank changed: ${id}`);
const previousVersion=library.libraryVersion;
library.libraryVersion=`${previousVersion}-${PHASE}`;library.sourceCurationPhase=PHASE;library.generatedAt=STAMP;library.canonicalQuestionCount=Object.values(library.concepts).reduce((sum,module)=>sum+unique(module).length,0);
Object.assign(library.registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
Object.assign(registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
delete library.librarySha256;library.librarySha256=sha(JSON.stringify(stable(library)));registry.librarySha256=library.librarySha256;
Object.assign(manifest,{assetCount:manifest.assets.length,canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:STAMP});

const familyBefore=Object.values(beforeCounts).reduce((o,c)=>{for(const[k,v]of Object.entries(c))o[k]=(o[k]||0)+v;return o;},{}),familyAfter=Object.values(afterCounts).reduce((o,c)=>{for(const[k,v]of Object.entries(c))o[k]=(o[k]||0)+v;return o;},{});
const wordCount=text=>String(text||'').trim().split(/\s+/).filter(Boolean).length,qualityPools={},f1Records=[];
for(const conceptId of ids)for(const{pool,question}of unique(library.concepts[conceptId])){
  const group=pool==='boss'?question.difficulty:pool,key=`${conceptId}::${group}`,correct=(question.options||[]).find(o=>answerHash(o)===question.aHash),distractors=(question.options||[]).filter(o=>o!==correct),cw=wordCount(correct),dw=distractors.map(wordCount);
  (qualityPools[key]||=[]).push({id:qid(question),cw,dw,uniquelyLongest:dw.every(n=>cw>n)});f1Records.push({conceptId,pool:group,question});
}
const answerLengthAudit=Object.fromEntries(Object.entries(qualityPools).map(([key,rows])=>{const cm=rows.reduce((n,r)=>n+r.cw,0)/rows.length,dm=rows.reduce((n,r)=>n+r.dw.reduce((a,b)=>a+b,0)/r.dw.length,0)/rows.length;return[key,{records:rows.length,uniquelyLongestCorrect:rows.filter(r=>r.uniquelyLongest).length,uniquelyLongestShare:Number((rows.filter(r=>r.uniquelyLongest).length/rows.length).toFixed(3)),meanCorrectDistractorRatio:Number((cm/dm).toFixed(3))}];}));
const answerLengthFailures=Object.entries(answerLengthAudit).filter(([,m])=>m.uniquelyLongestShare>.5||m.meanCorrectDistractorRatio>1.35).map(([key,m])=>({key,...m,rows:qualityPools[key]}));
const tokenSet=text=>new Set(String(text||'').toLowerCase().replace(/\b\d+(?:\.\d+)?%?\b/g,'#').replace(/[^a-z#]+/g,' ').split(/\s+/).filter(w=>w.length>2));
const jac=(a,b)=>{const A=tokenSet(a),B=tokenSet(b),inter=[...A].filter(x=>B.has(x)).length;return inter/Math.max(1,new Set([...A,...B]).size);};
const changedIds=new Set(changes.map(c=>c.questionId).filter(Boolean)),nearDuplicates=[];
for(let i=0;i<f1Records.length;i++)for(let j=i+1;j<f1Records.length;j++){const a=f1Records[i],b=f1Records[j],score=jac(a.question.q,b.question.q);if((changedIds.has(qid(a.question))||changedIds.has(qid(b.question)))&&score>=.82)nearDuplicates.push({a:qid(a.question),b:qid(b.question),score:Number(score.toFixed(3))});}
const optionSets=new Map(),repeatedAnswerSets=[];
for(const{conceptId,question}of f1Records){const key=(question.options||[]).map(x=>String(x).toLowerCase().replace(/\s+/g,' ').trim()).sort().join('|');if(optionSets.has(key)&&(changedIds.has(qid(question))||changedIds.has(optionSets.get(key))))repeatedAnswerSets.push({a:optionSets.get(key),b:qid(question),conceptId});else optionSets.set(key,qid(question));}
const weakDistractors=[];
for(const{question}of f1Records)if(changedIds.has(qid(question))){const opts=(question.options||[]).map(x=>String(x).trim());if(opts.length!==4||new Set(opts.map(x=>x.toLowerCase())).size!==4||opts.some(x=>x.length<2))weakDistractors.push(qid(question));}
if(answerLengthFailures.length||nearDuplicates.length||repeatedAnswerSets.length||weakDistractors.length)throw new Error(`Quality thresholds failed: ${JSON.stringify({answerLengthFailures,nearDuplicates,repeatedAnswerSets,weakDistractors})}`);

const protectedAfter=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const provenance={phase:PHASE,generatedAt:STAMP,scope:{family:'F1 — GDP and National Output',protectedConceptId,modifiedCanonicalConceptIds:ids},before:{libraryVersion:previousVersion,canonicalQuestionCount:beforeTotal,counts:beforeCounts,familyCounts:familyBefore,protectedCanonicalBankHashes:protectedBefore},after:{libraryVersion:library.libraryVersion,canonicalQuestionCount:library.canonicalQuestionCount,librarySha256:library.librarySha256,counts:afterCounts,familyCounts:familyAfter,protectedCanonicalBankHashes:protectedAfter},protectedIds,canonicalQuestionsOutsideModifiedSlicesChanged:false,gdpMeasurementChanged:false,repairSeedFinding:'Current runtime uses Repair then Bridge; no Repair Seeds are required for F1.',quality:{answerLengthAudit,nearDuplicates,repeatedAnswerSets,weakDistractors}};
const sourceData={phase:PHASE,generatedAt:STAMP,scope:ids,added:changes.filter(c=>c.action==='ADD'),rewritten:changes.filter(c=>['REPAIR_REWRITE','BRIDGE_REWRITE','QUALITY_FIX'].includes(c.action)),reviewedUnchanged:changes.filter(c=>c.action==='NO_CHANGE_VERIFIED'),authoringPolicy:{soloFloors:{easy:6,medium:6,hard:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendary:6,legendaryBoss:3,repair:1,bridge:1},bridgeChain:familyIds,maximumAdditions:55,actualAdditions:50,noGraphs:true},quality:provenance.quality};

if(!dryRun){
  fs.writeFileSync(libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);
  fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  fs.writeFileSync(path.join(composer,`${PHASE}_questions.json`),JSON.stringify(sourceData,null,2)+'\n');
  fs.writeFileSync(path.join(composer,`${PHASE}.json`),JSON.stringify(provenance,null,2)+'\n');
  for(const file of [path.join(repo,'build','index.html'),path.join(composer,'index.html')]){const text=fs.readFileSync(file,'utf8').replaceAll('20260810-macro-m2a-phillips-v1','20260810-macro-m2b1-gdp-v1');fs.writeFileSync(file,text);}
}
console.log(JSON.stringify({dryRun,phase:PHASE,beforeTotal,afterTotal:library.canonicalQuestionCount,added:changes.filter(c=>c.action==='ADD').length,repairRewrites:changes.filter(c=>c.action==='REPAIR_REWRITE').length,bridgeRewrites:changes.filter(c=>c.action==='BRIDGE_REWRITE').length,qualityFixes:changes.filter(c=>c.action==='QUALITY_FIX').length,beforeCounts,afterCounts,familyBefore,familyAfter,protectedCanonicalBanks:protectedIds.length,quality:{answerLengthFailures,nearDuplicates,repeatedAnswerSets,weakDistractors}},null,2));
