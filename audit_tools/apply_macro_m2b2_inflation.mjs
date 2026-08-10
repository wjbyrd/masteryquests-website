import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repo=path.resolve(process.argv[2]||process.cwd());
const dryRun=process.argv.includes('--dry-run');
const PHASE='phaseM2b2-inflation-real-values-family-maturation-v1';
const STAMP='2026-08-10T23:30:00.000Z';
const SOURCE='macro-m2b2-inflation-family';
const protectedConceptId='cpi-and-inflation-measurement';
const ids=['cpi-versus-gdp-deflator','cpi-bias','indexing-and-real-values','real-versus-nominal-interest-rates'];
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
const questionHash=q=>sha(JSON.stringify(stable({q:q.q,options:q.options,aHash:q.aHash,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[],bossStage:q.bossStage||null})));
const contentHash=q=>sha(JSON.stringify(stable({q:q.q,options:q.options,aHash:q.aHash,feedback:q.feedback,commonError:q.commonError,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[]})));
const loadLibrary=raw=>{const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(raw,sandbox,{filename:libraryPath});return sandbox.window.MQ_COMPOSER_LIBRARY;};
const rawBefore=fs.readFileSync(libraryPath,'utf8');
const library=loadLibrary(rawBefore);
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(!String(library.libraryVersion).endsWith('phaseM2b1-gdp-national-output-family-maturation-v1'))throw new Error('Unexpected live baseline: completed Phase M2b-1 library required.');
for(const id of familyIds)if(!library.concepts[id])throw new Error(`Missing canonical F2 concept: ${id}`);

function tagged(module){return [...Object.entries(module.questions||{}).flatMap(([pool,list])=>(list||[]).map(question=>({pool,question}))),...(module.repairQuestions||[]).map(question=>({pool:'repair',question})),...(module.repairSeedQuestions||[]).map(question=>({pool:'repairSeed',question})),...(module.bridgeQuestions||[]).map(question=>({pool:'bridge',question}))];}
function unique(module){const seen=new Set();return tagged(module).filter(({question})=>{const id=qid(question);if(seen.has(id))return false;seen.add(id);return true;});}
function bankSnapshot(module){return unique(module).map(({pool,question})=>({pool,id:qid(question),question:stable(question)})).sort((a,b)=>a.id.localeCompare(b.id));}
function bankHash(module){return sha(JSON.stringify(stable(bankSnapshot(module))));}
function contentBankHash(module){return sha(JSON.stringify(unique(module).map(({pool,question})=>({pool,id:qid(question),hash:contentHash(question)})).sort((a,b)=>a.id.localeCompare(b.id))));}
function countModule(module){
  const out={easy:0,medium:0,hard:0,elite:0,legendary:0,calculation:(module.questions?.calculation||[]).length,integration:(module.questions?.integration||[]).length,easyBoss:0,mediumBoss:0,finalBoss:0,legendaryBoss:(module.questions?.legendaryBoss||[]).length,repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length,bridge:(module.bridgeQuestions||[]).length,total:unique(module).length};
  for(const pool of ['easy','medium','hard','elite','legendary'])out[pool]=(module.questions?.[pool]||[]).length;
  for(const q of module.questions?.boss||[])out[q.difficulty]=(out[q.difficulty]||0)+1;
  return out;
}

const protectedIds=Object.keys(library.concepts).filter(id=>!idSet.has(id));
const protectedBefore=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const protectedAggregateBefore=sha(JSON.stringify(stable(protectedBefore)));
const cpiContentHashBefore=contentBankHash(library.concepts[protectedConceptId]);
const beforeCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
const beforeTotal=library.canonicalQuestionCount;
const previousVersion=library.libraryVersion;
const changes=[];
let serial=8400000;

const lessons={
  deflator_scope:['Treats CPI and the GDP deflator as interchangeable measures of the same set of prices.','CPI follows a consumer-basket framework; the GDP deflator follows prices of current domestically produced final output.'],
  deflator_composition:['Ignores whether a priced item is imported, exported, consumed, or part of domestic investment.','Identify the buyer and production location, then match the price change to the index whose scope includes it.'],
  index_choice:['Chooses an index by familiarity rather than by the purpose of the comparison.','Use CPI for consumer purchasing-power questions and the GDP deflator for the price level of current domestic GDP.'],
  substitution_bias:['Assumes a fixed basket fully reflects how households respond to changes in relative prices.','Substitution bias arises when consumers shift toward relatively cheaper alternatives but the fixed basket does not fully reflect that response.'],
  new_goods_bias:['Treats a newly available product as if it creates no gain until it enters an old basket.','New goods expand choice and can improve purchasing power before a fixed basket fully incorporates them.'],
  quality_change_bias:['Treats every observed price increase as pure inflation even when product quality changes.','Separate the value of quality improvement from the pure price change when interpreting cost-of-living inflation.'],
  cpi_bias_interpretation:['Concludes that known index limitations make CPI useless.','CPI remains useful, while substitution, new-good, and quality challenges can make measured inflation differ from true cost-of-living growth.'],
  indexation_purchasing_power:['Equates a higher nominal payment with a higher real payment.','Compare the nominal change with the relevant price-index change to determine purchasing-power change.'],
  indexation_contracts:['Assumes an indexed contract guarantees an exact real outcome in every circumstance.','Indexation adjusts a nominal amount using a specified index; lags or an imperfectly matched index can still change real value.'],
  real_value_comparison:['Compares dollar amounts from different periods without a common price level.','Put nominal amounts in common purchasing-power units before making the real comparison.'],
  real_interest_rate:['Uses the nominal rate alone to infer the purchasing-power return.','For introductory approximation, real interest is nominal interest minus inflation.'],
  ex_ante_ex_post_real_rate:['Uses actual inflation to describe an expected return or expected inflation to describe the realized return.','Ex ante real interest uses expected inflation; ex post real interest uses actual inflation.'],
  borrower_lender_inflation:['Misses how unexpected inflation changes the real burden of a fixed nominal loan.','Higher-than-expected inflation lowers the realized real repayment burden and shifts purchasing power from lender to borrower.'],
  fisher_boundary:['Turns a measurement question into a claim about long-run nominal-rate adjustment.','F2 measures and interprets nominal versus real returns; the later Fisher Effect explains long-run nominal-rate responses to expected inflation.']
};
function lesson(skill){return lessons[skill]||['Uses a surface cue instead of the relevant measurement rule.','Identify the index, nominal value, real value, and timing concept required by the task.'];}
function rotate(options,answer,index){const n=index%options.length;const out=options.slice(n).concat(options.slice(0,n));if(!out.includes(answer))throw new Error(`Answer missing: ${answer}`);return out;}
function spec(stem,answer,wrong,skill,extra={}){return{stem,answer,options:[answer,...wrong],skill,...extra};}
const codeById={'cpi-versus-gdp-deflator':'DEF','cpi-bias':'BIAS','indexing-and-real-values':'INDEX','real-versus-nominal-interest-rates':'RNI'};
const chapterById={'cpi-versus-gdp-deflator':[25,2],'cpi-bias':[25,3],'indexing-and-real-values':[25,4],'real-versus-nominal-interest-rates':[25,5]};
const objectiveById={'cpi-versus-gdp-deflator':'LO25.2','cpi-bias':'LO25.3','indexing-and-real-values':'LO25.4','real-versus-nominal-interest-rates':'LO25.5'};

function addQuestion(conceptId,pool,s,index){
  const module=library.concepts[conceptId],boss=pool==='boss',lb=pool==='legendaryBoss',tier=boss?s.tier:null;
  const canonicalDifficulty=boss?({easyBoss:'easy',mediumBoss:'medium',finalBoss:'hard'})[tier]:lb?'legendary':pool;
  const marker=boss?({easyBoss:'EB',mediumBoss:'MB',finalBoss:'FB'})[tier]:({easy:'E',medium:'M',hard:'H',legendary:'L',legendaryBoss:'LB'})[pool];
  const id=`PM2B2-${codeById[conceptId]}-${marker}-${String(index+1).padStart(3,'0')}`;
  const [commonError,feedback]=lesson(s.skill);
  const q={id,sourceGame:SOURCE,q:s.stem,options:rotate(s.options,s.answer,index),tag:conceptId.replaceAll('-','_'),type:s.type||'application',objective:objectiveById[conceptId],difficulty:boss?tier:lb?'legendaryBoss':pool,conceptCluster:'prices_inflation',primarySkill:s.skill,secondarySkills:s.secondarySkills||[],repairSkill:s.skill,commonError:s.commonError||commonError,feedback:s.feedback||feedback,aHash:answerHash(s.answer),canonicalId:id,sourceId:++serial,sourceChapter:chapterById[conceptId],sourcePool:boss?tier:s.skill,primaryConceptId:conceptId,secondaryConceptIds:s.secondaryConceptIds||[],instructionalRole:boss?'boss':lb?'legendaryBoss':pool,canonicalDifficulty,originalSourcePool:boss?tier:s.skill,originalBossTier:boss?tier:lb?'legendaryBoss':null,sourceCurationPhase:PHASE};
  if(s.roundingRule)q.roundingRule=s.roundingRule;
  if(boss)q.boss=({easyBoss:'Checkpoint One',mediumBoss:'Checkpoint Two',finalBoss:'Final Checkpoint'})[tier];
  if(lb)q.bossStage=s.bossStage;
  q.sourceHash=questionHash(q);
  q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:`${PHASE}_questions.json`,sourceGlobal:'questions',sourcePool:q.sourcePool,routeKey:q.primarySkill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];
  module.questions[pool].push(q);
  changes.push({questionId:id,canonicalConceptId:conceptId,action:'ADD',oldPool:null,newPool:boss?tier:pool,reason:s.reason||'Closes a verified engine floor with a distinct inflation-family task.'});
}

function rewriteBridge(conceptId,questionId,s,index=0){
  const rows=library.concepts[conceptId].bridgeQuestions,q=rows.find(item=>qid(item)===questionId);if(!q)throw new Error(`Missing Bridge ${questionId}`);
  const beforeHash=questionHash(q),[commonError,feedback]=lesson(s.skill);
  Object.assign(q,{q:s.stem,options:rotate(s.options,s.answer,index),aHash:answerHash(s.answer),primarySkill:s.skill,repairSkill:s.skill,secondarySkills:s.secondarySkills||[],secondaryConceptIds:s.secondaryConceptIds||[],commonError:s.commonError||commonError,feedback:s.feedback||feedback,type:'bridge',sourceCurationPhase:PHASE});
  q.sourceHash=questionHash(q);
  changes.push({questionId,canonicalConceptId:conceptId,action:'BRIDGE_REWRITE',oldPool:'bridge',newPool:'bridge',reason:'Replaces a same-skill check with a genuine source-to-destination connection.',beforeHash,afterHash:q.sourceHash});
}

function setBossStage(conceptId,questionId,bossStage){
  const q=library.concepts[conceptId].questions.legendaryBoss.find(item=>qid(item)===questionId);if(!q)throw new Error(`Missing Legendary Boss ${questionId}`);
  const beforeHash=questionHash(q),before=q.bossStage??null;q.bossStage=bossStage;q.sourceHash=questionHash(q);
  changes.push({questionId,canonicalConceptId:conceptId,action:'BOSS_STAGE_FIX',oldPool:'legendaryBoss',newPool:'legendaryBoss',reason:`Assigns semantically appropriate ${bossStage} stage without changing question content.`,beforeBossStage:before,afterBossStage:bossStage,beforeHash,afterHash:q.sourceHash});
}

const deflator={
  easy:[
    spec('The price of a domestically produced aircraft sold to a foreign airline rises. Which index directly includes that domestic export price?','The GDP deflator',['The CPI only','Neither price index','A consumer import index only'],'deflator_scope'),
    spec('Which index is designed for tracking the prices paid for a representative consumer basket?','The CPI',['The GDP deflator','A real-interest index','A domestic-export index'],'index_choice')
  ],
  medium:[
    spec('A domestic firm buys newly produced business software whose price rises. Which index directly covers that final domestic product?','The GDP deflator',['The CPI because every business purchase is consumer spending','Neither index because software is intangible','The CPI only when the firm imports the software'],'deflator_composition'),
    spec('Imported prescription-drug prices rise while prices of domestic hospital services are unchanged. Which outcome is plausible?','CPI inflation exceeds GDP-deflator inflation',['GDP-deflator inflation must exceed CPI inflation','Both indexes must change by the same amount','Neither index can reflect a medical price change'],'deflator_composition')
  ],
  hard:[
    spec('Prices of domestically produced aircraft exports rise while imported smartphones bought by households become cheaper. Which combination is plausible?','The GDP deflator rises while the CPI falls',['The CPI rises while the GDP deflator falls','Both indexes must rise because one price increased','Both indexes must fall because consumers buy smartphones'],'deflator_composition'),
    spec('Individual prices are unchanged, but current domestic production shifts toward goods with higher relative prices. Why can the GDP deflator change?','Its weights reflect the composition of current domestic output',['Its fixed consumer basket must be replaced every month','It includes every imported consumer purchase automatically','Its value is determined only by household expenditure shares'],'deflator_composition')
  ],
  legendary:[
    spec('Imported home solar panels become cheaper while domestically produced industrial turbines become more expensive. Why can CPI and the GDP deflator move in opposite directions?','The indexes cover different goods and use different weighting frameworks',['Both indexes measure only domestic consumer purchases','The CPI excludes imports while the deflator includes them','The GDP deflator fixes a household basket while CPI tracks current output'],'deflator_scope'),
    spec('An analyst must adjust a pension for consumer purchasing power and convert nominal GDP into real GDP. Which indexes fit the two purposes?','Use CPI for the pension and the GDP deflator for GDP',['Use the GDP deflator for both tasks','Use CPI for both tasks','Use a nominal interest rate for the pension and CPI for GDP'],'index_choice')
  ],
  boss:[
    {...spec('A city buys domestic transit vehicles while households buy imported fuel. Which mapping is correct?','Vehicle prices enter the GDP deflator; imported fuel can enter CPI',['Both prices enter only CPI','Both prices enter only the GDP deflator','Imported fuel enters the GDP deflator but not CPI'],'deflator_composition'),tier:'mediumBoss'},
    {...spec('Domestic food-export prices rise and imported-clothing prices fall. What can happen?','The GDP deflator rises while CPI falls',['CPI rises and the GDP deflator falls by definition','Both indexes must remain unchanged','Both indexes must move together because trade is involved'],'deflator_composition'),tier:'mediumBoss'},
    {...spec('Why can a changing mix of domestic output affect the GDP deflator more directly than CPI?','The deflator uses current-output weights',['CPI excludes every consumer service','The deflator uses a permanently fixed consumer basket','CPI includes only domestic investment goods'],'deflator_composition'),tier:'mediumBoss'},
    {...spec('Imported consumer electronics rise 20%, domestic investment equipment falls 10%, and other prices are stable. Which conclusion is best?','CPI can rise while the GDP deflator falls',['Both indexes must rise 10%','The GDP deflator must include the imported electronics','CPI must exclude the consumer electronics'],'deflator_scope'),tier:'finalBoss'},
    {...spec('An analyst deflates nominal GDP with CPI. What is the central scope problem?','CPI tracks consumer purchases, not all current domestic output',['CPI measures only exported capital goods','The GDP deflator excludes domestic services','Nominal GDP contains only household consumption'],'index_choice'),tier:'finalBoss'},
    {...spec('Consumer import prices fall, domestic export prices rise, and output shifts toward exports. Why might the GDP deflator rise as CPI falls?','Coverage and current-output weights reinforce the divergence',['Both indexes use the same fixed imported-goods basket','CPI assigns all weight to domestic exports','The deflator measures consumer purchasing power only'],'deflator_composition'),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('A household buys an imported tablet, a firm buys a domestic robot, and each price rises. Which index covers each price directly?','CPI covers the tablet; the GDP deflator covers the robot',['The GDP deflator covers both the imported tablet and the domestic business robot','CPI covers both prices','Neither index covers a business purchase'],'deflator_scope',{bossStage:'opening'}),
    spec('Imported consumer prices fall, domestic capital and export prices rise, and production shifts toward capital goods. Which explanation best supports a rising deflator alongside falling CPI?','Different coverage plus current domestic-output weights',['A shared fixed basket forces the indexes apart','CPI includes only exports while the deflator includes only imports','Nominal interest rates determine both price indexes'],'deflator_composition',{bossStage:'final'})
  ]
};

const bias={
  easy:[
    spec('A new low-cost streaming platform gives households an option that did not exist in the base period. Which CPI challenge is this?','Introduction of new goods',['Substitution among unchanged old goods','A change in nominal interest rates','GDP-deflator composition'],'new_goods_bias'),
    spec('A refrigerator sells for the same price but uses much less electricity and lasts longer. Which CPI issue matters?','Incomplete measurement of quality improvement',['Substitution toward a cheaper old good','Introduction of an imported good only','A decline in the nominal price level'],'quality_change_bias')
  ],
  medium:[
    spec('A name-brand medicine becomes expensive and buyers switch to an equivalent store brand. A fixed basket changes slowly. What is the main issue?','Substitution bias',['New-goods bias','Pure quality deterioration','GDP-deflator weighting'],'substitution_bias')
  ],
  hard:[
    spec('A treatment keeps the same sticker price but cuts side effects and recovery time. Why can CPI miss part of the consumer gain?','The measured price may not capture improved quality',['Consumers necessarily switch away from every treatment whose quality improves','The treatment becomes an imported capital good','The fixed basket counts the price twice'],'quality_change_bias')
  ],
  legendary:[
    spec('Coffee prices jump, households switch toward tea, and the fixed basket still gives coffee its old weight. Which mechanism is primary?','Substitution bias from outdated purchasing weights',['New-goods bias because tea already existed','Quality bias because coffee became expensive','A GDP-deflator error involving exports'],'substitution_bias'),
    spec('Statisticians update baskets and adjust for quality, yet CPI still requires judgment. What is the sound conclusion?','Measurement improvements reduce bias, but index-number challenges remain',['CPI becomes useless once any adjustment is required','Every quality adjustment eliminates substitution bias permanently','Updated baskets make CPI identical to the GDP deflator'],'cpi_bias_interpretation')
  ],
  boss:[
    {...spec('Substitution bias means consumers respond to a relative-price increase by doing what?','Buying relatively more of available cheaper alternatives',['Stopping all purchases of every good whose price rose','Treating every new good as lower quality','Replacing the CPI with the GDP deflator'],'substitution_bias'),tier:'mediumBoss'},
    {...spec('Why can a genuinely new product make an old fixed basket overstate the cost of maintaining well-being?','The new option can expand choice and purchasing power',['Every new product must have a lower sticker price','New products are automatically excluded from consumer spending','The GDP deflator fixes the CPI basket immediately'],'new_goods_bias'),tier:'mediumBoss'},
    {...spec('A laptop price rises while speed and battery life improve. What should a careful CPI interpretation separate?','Quality improvement from pure price inflation',['Domestic production from imported production only','Expected inflation from actual inflation','Nominal interest from real interest'],'quality_change_bias'),tier:'mediumBoss'},
    {...spec('A new generic drug enters below the brand price and patients switch rapidly. Which diagnosis is strongest?','New-goods gains and substitution can both reduce true living-cost growth',['Only quality deterioration can explain why patients switch to the lower-priced generic','CPI must understate inflation whenever a generic appears','The case concerns only the GDP deflator'],'cpi_bias_interpretation'),tier:'finalBoss'},
    {...spec('A pension is fully indexed to CPI, but CPI overstates true living-cost growth. What can happen over time?','The pension can rise in real purchasing-power terms',['The pension must lose nominal dollars','The CPI and true cost of living become identical','Indexation automatically removes every measurement issue'],'cpi_bias_interpretation'),tier:'finalBoss'},
    {...spec('Known CPI biases are found in a report. Which conclusion is defensible?','CPI remains useful, but measured inflation may differ from true living-cost growth',['CPI contains no useful information about consumer prices or their changes over time','Every measured price change is quality improvement','The GDP deflator is always the correct household index'],'cpi_bias_interpretation'),tier:'finalBoss'}
  ]
};

const indexing={
  easy:[
    spec('A worker receives a nominal raise equal to the inflation rate. What happens approximately to purchasing power?','It stays about the same',['It rises by the full nominal raise','It falls to zero','It doubles automatically'],'indexation_purchasing_power'),
    spec('What is the purpose of a cost-of-living adjustment in a pension?','To help preserve the payment’s purchasing power',['To convert the pension into a new category of private business investment','To guarantee a real gain every year','To replace CPI with nominal GDP'],'indexation_contracts'),
    spec('Why might a tax threshold be indexed to a price index?','To keep inflation alone from lowering the threshold’s real value',['To make every taxpayer’s nominal income fall even when purchasing power is unchanged','To measure domestic capital-goods prices','To set the real interest rate on loans'],'indexation_contracts'),
    spec('An indexed benefit rises in dollars at the same pace as prices. Which statement is best?','Its real purchasing power is approximately unchanged',['Its real value rises by the full nominal increase','Its nominal value is unchanged','Its purchasing power must fall'],'indexation_purchasing_power'),
    spec('To compare a scholarship from two different years, what should be done first?','Express both amounts at a common price level',['Compare only the printed dollar amounts','Subtract the nominal interest rate','Use current domestic-output weights'],'real_value_comparison')
  ],
  medium:[
    spec('A salary rises 6% while the relevant price index rises 4%. What happens to real purchasing power?','It rises modestly',['It falls by 10%','It is exactly unchanged','It rises by the full 6%'],'indexation_purchasing_power'),
    spec('A rent payment is indexed upward 3% when the relevant price index rises 3%. What is the intended real effect?','Keep the payment’s purchasing power roughly constant',['Raise the real rent by 6%','Cut the nominal rent by 3%','Convert rent into a real interest rate'],'indexation_contracts'),
    spec('A benefit rises 2% while consumer prices rise 5%. What happens to its purchasing power?','It falls',['It rises 7%','It remains exactly constant','It becomes a GDP deflator'],'indexation_purchasing_power'),
    spec('A nominal salary is unchanged while the consumer price level falls. What happens to its purchasing power?','It rises',['It falls by definition','It remains unchanged in real terms','It becomes an indexed tax threshold'],'real_value_comparison')
  ],
  hard:[
    spec('A nominal wage rises 8% while CPI rises 5%. Using the exact ratio and rounding to one decimal place, how much does the real wage rise?','About 2.9%',['Exactly 3.0%','About 13.4%','About 1.6%'],'real_value_comparison',{roundingRule:'Use (1.08 ÷ 1.05) − 1 and round to one decimal place.'}),
    spec('A tax threshold is adjusted by only half of CPI inflation. What happens to its real value?','It falls',['It rises faster than prices','It remains exactly constant','It becomes a nominal interest rate'],'indexation_contracts'),
    spec('A retiree benefit is indexed to overall CPI, but retirees buy a systematically different basket. What limitation remains?','The chosen index may not match the retiree’s actual cost changes',['Indexation guarantees identical costs for every household','The benefit should be deflated with the GDP deflator only','CPI cannot measure any consumer prices'],'indexation_contracts'),
    spec('A salary adjustment uses last year’s CPI while inflation accelerates this year. What can happen before the next adjustment?','Purchasing power can temporarily fall',['Real value must rise because the contract is indexed','The nominal salary must decline','Current inflation becomes irrelevant'],'indexation_contracts'),
    spec('A contract raises its nominal payment 3% each year while inflation is 6%. What happens to the real payment?','It declines',['It rises about 9%','It remains constant because the payment increased','It equals the nominal interest rate'],'indexation_purchasing_power')
  ],
  legendary:[
    spec('A scholarship rises 15% while CPI rises 10%. Using the exact ratio and rounding to one decimal place, what is its real increase?','About 4.5%',['Exactly 5.0%','About 25.0% because the two nominal changes are added together','About 1.5%'],'real_value_comparison',{roundingRule:'Use (1.15 ÷ 1.10) − 1 and round to one decimal place.'}),
    spec('A pension is fully CPI-indexed, but quality gains make CPI overstate true living-cost growth. What is the likely real effect?','The pension can gain purchasing power relative to the true cost of living',['The pension must lose nominal value throughout the entire inflation-adjustment period','Indexation eliminates quality measurement issues','The GDP deflator must rise by the same amount'],'indexation_contracts',{secondaryConceptIds:['cpi-bias']}),
    spec('Tax thresholds are indexed with a one-year lag during an inflation surge. What problem can occur before the adjustment catches up?','Nominal income can push taxpayers across thresholds whose real value has fallen',['Every taxpayer receives an immediate real tax cut when nominal thresholds lag behind inflation','The lag converts CPI into the GDP deflator','Real thresholds rise faster than prices'],'indexation_contracts')
  ],
  boss:[
    {...spec('A wage and CPI each rise 5%. What is the approximate real-wage change?','About zero',['A 10% increase','A 5% decrease','A 5% increase'],'indexation_purchasing_power'),tier:'mediumBoss'},
    {...spec('A pension is fully adjusted by the relevant consumer price index. What is the intended outcome?','Preserve purchasing power approximately',['Guarantee a real gain equal to inflation','Hold the nominal payment fixed','Track prices of all domestic investment goods'],'indexation_contracts'),tier:'mediumBoss'},
    {...spec('A past salary looks smaller only because prices were lower. What comparison corrects the problem?','Convert both salaries to a common price level',['Add expected inflation to both salaries','Use the current GDP level only','Compare their nominal dollar signs'],'real_value_comparison'),tier:'mediumBoss'},
    {...spec('A past salary was $54,000 when CPI was 180. Today’s salary is $75,000 and CPI is 240. Which salary has greater purchasing power?','Today’s salary, by $3,000 in today’s dollars',['The past salary, by $3,000 in today’s dollars','The salaries have equal purchasing power','Today’s salary, by $21,000 without an inflation adjustment'],'real_value_comparison'),tier:'finalBoss'},
    {...spec('A benefit is indexed to CPI, and CPI overstates true living-cost growth. Which result is possible?','The benefit’s true purchasing power rises',['The nominal benefit necessarily falls','The GDP deflator becomes the consumer basket','Indexation removes all index-number limitations'],'indexation_contracts',{secondaryConceptIds:['cpi-bias']}),tier:'finalBoss'},
    {...spec('Which pairing uses the most appropriate index?','CPI for a household benefit; GDP deflator for nominal GDP',['GDP deflator for both household benefits and imported consumption','CPI for all domestic investment output and nominal GDP','Nominal interest for benefits; CPI for domestic GDP'],'real_value_comparison',{secondaryConceptIds:['cpi-versus-gdp-deflator']}),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('A pension tracks CPI, CPI overstates true living-cost growth, and the adjustment arrives without a lag. What is the strongest conclusion?','Nominal payments rise with CPI and true purchasing power can increase',['The pension loses nominal value because CPI rose','Real purchasing power must remain exactly fixed even when CPI overstates true living-cost growth','The adjustment should use the GDP deflator for all retirees'],'indexation_contracts',{secondaryConceptIds:['cpi-bias'],bossStage:'final'})
  ]
};

const interest={
  easy:[
    spec('Inflation is higher than the nominal interest earned on an account. What is true of the approximate real return?','It is negative',['It is greater than the nominal rate','It must equal zero','It is unrelated to purchasing power'],'real_interest_rate'),
    spec('What does a real interest rate describe that a nominal rate does not?','The change in purchasing power',['The number of dollars deposited','The current CPI basket composition','The long-run money-supply growth rate'],'real_interest_rate'),
    spec('Unexpected inflation is higher than lenders and borrowers expected on a fixed-rate loan. Who generally benefits?','The borrower',['The lender','Both gain the same purchasing power','Neither party’s real outcome changes'],'borrower_lender_inflation')
  ],
  medium:[
    spec('Actual inflation exceeds expected inflation while a loan’s nominal rate is fixed. What happens to the lender’s realized real return?','It is lower than expected',['It is higher than expected','It equals the nominal rate','It becomes independent of inflation'],'ex_ante_ex_post_real_rate'),
    spec('Actual inflation is lower than expected on a fixed nominal loan. Who bears a higher real repayment burden than anticipated?','The borrower',['The lender','The central bank','The price-index compiler'],'borrower_lender_inflation'),
    spec('Which inflation rate belongs in an ex post real-interest calculation?','Actual inflation',['Expected inflation only','The base-year CPI level','Long-run money growth'],'ex_ante_ex_post_real_rate')
  ],
  hard:[
    spec('A savings account earns 5% nominal interest while inflation is 7%. What happens?','The balance rises in dollars but loses purchasing power',['Both the dollar balance and purchasing power fall 2%','Purchasing power rises by 12%','The real return equals the nominal return'],'real_interest_rate'),
    spec('A fixed loan carries 8% nominal interest. Expected inflation is 3%, but actual inflation is 6%. What are the approximate ex ante and ex post real rates?','5% ex ante and 2% ex post',['2% ex ante and 5% ex post','11% ex ante and 14% ex post','8% for both rates'],'ex_ante_ex_post_real_rate'),
    spec('Which task belongs in F2 rather than the later Fisher Effect family?','Interpreting a realized real return after observing inflation',['Predicting a one-for-one long-run nominal-rate response to expected inflation','Tracing long-run monetary neutrality through nominal rates','Explaining why expected inflation shifts the long-run nominal rate'],'fisher_boundary')
  ],
  legendary:[
    spec('A fixed-rate borrower and lender expected 2% inflation, but actual inflation is 8%. The nominal rate is 7%. What happened?','The real rate fell from about 5% to about −1%, helping the borrower',['The real rate rose from 5% to 15%, helping the lender','Both parties still received the expected five-percent real outcome because the nominal loan rate remained fixed','The nominal rate automatically adjusted to 13%'],'borrower_lender_inflation')
  ],
  boss:[
    {...spec('Why can a positive nominal interest rate still produce a negative real return?','Inflation can exceed the nominal rate',['The nominal account balance must decline whenever consumer prices rise faster','Expected inflation must be zero','CPI excludes interest income'],'real_interest_rate'),tier:'mediumBoss'},
    {...spec('Expected inflation is used to calculate which real rate?','The ex ante real rate',['The ex post real rate calculated after actual inflation is observed','The GDP-deflator growth rate','The indexed nominal payment'],'ex_ante_ex_post_real_rate'),tier:'mediumBoss'},
    {...spec('Unexpected inflation rises on a fixed-rate loan. What happens to the real burden?','It shifts downward for the borrower and reduces the lender’s real return',['It rises equally for both parties and preserves the lender’s expected purchasing-power return','It leaves every real outcome unchanged','It converts the loan into an indexed benefit'],'borrower_lender_inflation'),tier:'mediumBoss'},
    {...spec('A loan’s nominal rate is 9%, expected inflation is 4%, and actual inflation is 7%. Which pair is correct?','Expected real rate about 5%; realized real rate about 2%',['Expected about 2%; realized about 5% after reversing the two inflation measures','Expected about 13%; realized about 16%','Both real rates equal 9%'],'ex_ante_ex_post_real_rate'),tier:'finalBoss'},
    {...spec('Use the exact Fisher relation: nominal interest is 10% and inflation is 4%. Rounded to one decimal place, what is the real rate?','5.8%',['6.0%','14.4%','4.2%'],'real_interest_rate',{roundingRule:'Use (1.10 ÷ 1.04) − 1 and round to one decimal place.'}),tier:'finalBoss'},
    {...spec('Which statement preserves the F2/F6 boundary?','F2 interprets real returns; F6 explains long-run nominal-rate adjustment',['F2 and F6 both focus only on CPI basket costs','F2 predicts money neutrality; F6 compares historical salaries','F2 explains long-run Fisher causation; F6 measures realized returns'],'fisher_boundary'),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('A saver earns a positive nominal rate, but inflation is higher. What is the first real-value diagnosis?','The saver gains dollars while losing purchasing power',['The saver loses dollars and purchasing power at the same rate','The real return must equal the nominal rate','Expected inflation automatically raises the account balance'],'real_interest_rate',{bossStage:'opening'}),
    spec('A lender expected 2% inflation on a 7% fixed-rate loan; actual inflation is 8%. What is the complete outcome?','Expected real return was about 5%, realized return about −1%, benefiting the borrower',['Expected return was −5%, realized return 15%, benefiting the lender','Both real returns were 7% because the nominal rate was fixed','The loan automatically repriced to preserve the lender’s return'],'borrower_lender_inflation',{bossStage:'final'})
  ]
};

for(const [conceptId,groups] of Object.entries({'cpi-versus-gdp-deflator':deflator,'cpi-bias':bias,'indexing-and-real-values':indexing,'real-versus-nominal-interest-rates':interest}))for(const [pool,specs] of Object.entries(groups))specs.forEach((item,index)=>addQuestion(conceptId,pool,item,index));

rewriteBridge('cpi-bias','ECON-NL-QUALITY-NEW-GOODS-BIAS-6012',spec('If CPI overstates living-cost growth because quality gains are missed, what can happen to a benefit indexed fully to CPI?','Its true purchasing power can rise',['Its nominal payment must fall','Its real value must fall by the CPI rate','It becomes indexed to the GDP deflator'],'cpi_bias_interpretation',{secondaryConceptIds:['indexing-and-real-values']}));
rewriteBridge('cpi-bias','ECON-NL-SUBSTITUTION-BIAS-6011',spec('A fixed CPI basket misses consumers’ shift toward cheaper substitutes. Which measurement design creates this bias?','Holding the consumer basket fixed while buying patterns change',['Using current domestic-output weights','Subtracting imports from the expenditure identity','Using actual inflation in an ex post real rate'],'substitution_bias',{secondaryConceptIds:['cpi-and-inflation-measurement']}),1);

setBossStage('cpi-and-inflation-measurement','ECON-NL-LEGENDARYBOSS-9108','opening');
setBossStage('cpi-and-inflation-measurement','P52A-CPI-LB-001','middle');
setBossStage('cpi-and-inflation-measurement','P52A-CPI-LB-002','final');
setBossStage('cpi-versus-gdp-deflator','ECON-NL-LEGENDARYBOSS-9111','middle');
setBossStage('cpi-bias','ECON-NL-LEGENDARYBOSS-9109','opening');
setBossStage('cpi-bias','ECON-NL-LEGENDARYBOSS-9110','middle');
setBossStage('cpi-bias','ECON-NL-LEGENDARYBOSS-9115','final');
setBossStage('indexing-and-real-values','ECON-NL-LEGENDARYBOSS-9112','opening');
setBossStage('indexing-and-real-values','ECON-NL-LEGENDARYBOSS-9113','middle');
setBossStage('real-versus-nominal-interest-rates','ECON-NL-LEGENDARYBOSS-9114','middle');

const expected={
  'cpi-and-inflation-measurement':{easy:6,medium:6,hard:6,elite:4,legendary:6,calculation:21,easyBoss:6,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:4,repairSeed:0,bridge:2,total:60},
  'cpi-versus-gdp-deflator':{easy:6,medium:6,hard:6,elite:4,legendary:6,calculation:0,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:2,repairSeed:0,bridge:1,total:43},
  'cpi-bias':{easy:6,medium:6,hard:6,elite:5,legendary:6,calculation:0,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:4,repairSeed:0,bridge:2,total:47},
  'indexing-and-real-values':{easy:6,medium:6,hard:6,elite:3,legendary:6,calculation:7,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:2,repairSeed:0,bridge:1,total:49},
  'real-versus-nominal-interest-rates':{easy:6,medium:6,hard:6,elite:4,legendary:6,calculation:3,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:2,repairSeed:0,bridge:1,total:46}
};
const afterCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
for(const id of familyIds)for(const [key,value] of Object.entries(expected[id]))if(afterCounts[id][key]!==value)throw new Error(`${id} ${key}: ${afterCounts[id][key]} != ${value}`);
if(cpiContentHashBefore!==contentBankHash(library.concepts[protectedConceptId]))throw new Error('Protected CPI Measurement question content changed.');

const answerIssues=[],seenIds=new Set(),seenStems=new Map();
for(const [conceptId,module] of Object.entries(library.concepts))for(const {pool,question} of unique(module)){
  const id=qid(question);if(seenIds.has(id))answerIssues.push({type:'duplicate_id',id,conceptId,pool});seenIds.add(id);
  const matches=(question.options||[]).filter(option=>answerHash(option)===String(question.aHash||'').replace(/^sha256:/i,''));if(matches.length!==1)answerIssues.push({type:'answer_hash',id,conceptId,pool,matches:matches.length});
  const stem=String(question.q||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();if(seenStems.has(stem)&&familyIds.includes(conceptId))answerIssues.push({type:'exact_stem',id,other:seenStems.get(stem),conceptId});else seenStems.set(stem,id);
}
if(answerIssues.length)throw new Error(`Question validation failed: ${JSON.stringify(answerIssues.slice(0,10))}`);

const changedContentIds=new Set(changes.filter(change=>['ADD','BRIDGE_REWRITE'].includes(change.action)).map(change=>change.questionId));
const wordCount=text=>String(text||'').trim().split(/\s+/).filter(Boolean).length;
const qualityPools={},f2Records=[];
for(const conceptId of familyIds)for(const {pool,question} of unique(library.concepts[conceptId])){
  const group=pool==='boss'?question.difficulty:pool,key=`${conceptId}::${group}`,correct=(question.options||[]).find(option=>answerHash(option)===question.aHash),distractors=(question.options||[]).filter(option=>option!==correct),cw=wordCount(correct),dw=distractors.map(wordCount);
  if(changedContentIds.has(qid(question)))(qualityPools[key]||=[]).push({id:qid(question),cw,dw,uniquelyLongest:dw.every(n=>cw>n)});
  f2Records.push({conceptId,pool:group,question});
}
const answerLengthAudit=Object.fromEntries(Object.entries(qualityPools).map(([key,rows])=>{const cm=rows.reduce((n,row)=>n+row.cw,0)/rows.length,dm=rows.reduce((n,row)=>n+row.dw.reduce((a,b)=>a+b,0)/row.dw.length,0)/rows.length;return[key,{records:rows.length,uniquelyLongestCorrect:rows.filter(row=>row.uniquelyLongest).length,uniquelyLongestShare:Number((rows.filter(row=>row.uniquelyLongest).length/rows.length).toFixed(3)),meanCorrectDistractorRatio:Number((cm/dm).toFixed(3))}];}));
const answerLengthFailures=Object.entries(answerLengthAudit).filter(([,metric])=>metric.uniquelyLongestShare>.5||metric.meanCorrectDistractorRatio>1.35).map(([key,metric])=>({key,...metric}));
const tokenSet=text=>new Set(String(text||'').toLowerCase().replace(/\b\d+(?:\.\d+)?%?\b/g,'#').replace(/[^a-z#]+/g,' ').split(/\s+/).filter(word=>word.length>2));
const jac=(a,b)=>{const A=tokenSet(a),B=tokenSet(b),intersection=[...A].filter(x=>B.has(x)).length;return intersection/Math.max(1,new Set([...A,...B]).size);};
const nearDuplicates=[];
for(let i=0;i<f2Records.length;i++)for(let j=i+1;j<f2Records.length;j++){const a=f2Records[i],b=f2Records[j],score=jac(a.question.q,b.question.q);if((changedContentIds.has(qid(a.question))||changedContentIds.has(qid(b.question)))&&score>=.82)nearDuplicates.push({a:qid(a.question),b:qid(b.question),score:Number(score.toFixed(3))});}
const optionSets=new Map(),repeatedAnswerSets=[];
for(const {question} of f2Records){const key=(question.options||[]).map(value=>String(value).toLowerCase().replace(/\s+/g,' ').trim()).sort().join('|');if(optionSets.has(key)&&(changedContentIds.has(qid(question))||changedContentIds.has(optionSets.get(key))))repeatedAnswerSets.push({a:optionSets.get(key),b:qid(question)});else optionSets.set(key,qid(question));}
const weakDistractors=[];
for(const {question} of f2Records)if(changedContentIds.has(qid(question))){const options=(question.options||[]).map(value=>String(value).trim());if(options.length!==4||new Set(options.map(value=>value.toLowerCase())).size!==4||options.some(value=>value.length<2))weakDistractors.push(qid(question));}
if(answerLengthFailures.length||nearDuplicates.length||repeatedAnswerSets.length||weakDistractors.length)throw new Error(`Quality thresholds failed: ${JSON.stringify({answerLengthFailures,nearDuplicates,repeatedAnswerSets,weakDistractors})}`);

function calcLinked(q){return q.type==='calculation'||/cpi_calculation|inflation_rate|inflation_adjustment|real_value_comparison|real_interest_rate|ex_ante_ex_post/.test(q.primarySkill||'');}
function graphLinked(q){return Boolean(q.image);}
function updateRegistryEntry(entry,module){
  const ordinary=['easy','medium','hard'].flatMap(pool=>module.questions[pool]||[]),records=unique(module).map(item=>item.question);
  const role={boss:(module.questions.boss||[]).length,bridge:module.bridgeQuestions.length,calculation:(module.questions.calculation||[]).length,elite:(module.questions.elite||[]).length,integration:(module.questions.integration||[]).length,legendary:(module.questions.legendary||[]).length,legendaryBoss:(module.questions.legendaryBoss||[]).length,main:ordinary.length,repair:module.repairQuestions.length,repairSeed:(module.repairSeedQuestions||[]).length};
  const diff={easy:(module.questions.easy||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='easyBoss').length,medium:(module.questions.medium||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='mediumBoss').length,hard:(module.questions.hard||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='finalBoss').length,elite:(module.questions.elite||[]).length,legendary:(module.questions.legendary||[]).length+(module.questions.legendaryBoss||[]).length,unknown:module.repairQuestions.length+(module.repairSeedQuestions||[]).length+module.bridgeQuestions.length};
  Object.assign(entry,{includedSkills:[...new Set(records.map(q=>q.primarySkill).filter(Boolean))].sort(),questionCountByRole:role,questionCountByDifficulty:diff,repairCoverage:{directSkillMatches:module.repairQuestions.length,mainWithUsableSkill:records.length},bridgeCoverage:{directSkillMatches:module.bridgeQuestions.length,mainWithUsableSkill:records.length},calculationCoverage:records.filter(calcLinked).length,graphCoverage:records.filter(graphLinked).length,instructionalClassification:'Engine-safe inflation and real-values family slice',coverageStatus:'ready-family-slice',coverageStatusLabel:'Engine-safe alone; deepest in F2 family',coverageStatusNote:'Phase M2b-2 supplies solo floors with controlled reuse and family-first progression.',coverageFloorVersion:PHASE,notes:'Supporting slice of Inflation Measurement and Real Values. Use the five-concept family for the richest progression.'});
}
for(const conceptId of ids)for(const list of [library.registry.concepts,registry.concepts]){const entry=list.find(item=>item.canonicalConceptId===conceptId);if(!entry)throw new Error(`Registry entry missing: ${conceptId}`);updateRegistryEntry(entry,library.concepts[conceptId]);}

for(const [id,hash] of Object.entries(protectedBefore))if(bankHash(library.concepts[id])!==hash&&id!==protectedConceptId)throw new Error(`Protected canonical bank changed: ${id}`);
const protectedAfter=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const protectedMismatches=protectedIds.filter(id=>id!==protectedConceptId&&protectedAfter[id]!==protectedBefore[id]);
const cpiContentHashAfter=contentBankHash(library.concepts[protectedConceptId]);

library.libraryVersion=`${previousVersion}-${PHASE}`;library.sourceCurationPhase=PHASE;library.generatedAt=STAMP;library.canonicalQuestionCount=Object.values(library.concepts).reduce((sum,module)=>sum+unique(module).length,0);
Object.assign(library.registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
Object.assign(registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
delete library.librarySha256;library.librarySha256=sha(JSON.stringify(stable(library)));registry.librarySha256=library.librarySha256;
Object.assign(manifest,{assetCount:manifest.assets.length,canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:STAMP});

const familyBefore=Object.values(beforeCounts).reduce((out,count)=>{for(const [key,value] of Object.entries(count))out[key]=(out[key]||0)+value;return out;},{});
const familyAfter=Object.values(afterCounts).reduce((out,count)=>{for(const [key,value] of Object.entries(count))out[key]=(out[key]||0)+value;return out;},{});
const provenance={phase:PHASE,generatedAt:STAMP,scope:{family:'F2 — Inflation Measurement and Real Values',protectedConceptId,modifiedCanonicalConceptIds:ids},before:{libraryVersion:previousVersion,canonicalQuestionCount:beforeTotal,counts:beforeCounts,familyCounts:familyBefore,protectedAggregateSha256:protectedAggregateBefore,cpiContentSha256:cpiContentHashBefore},after:{libraryVersion:library.libraryVersion,canonicalQuestionCount:library.canonicalQuestionCount,librarySha256:library.librarySha256,counts:afterCounts,familyCounts:familyAfter,protectedMismatchCount:protectedMismatches.length,cpiContentSha256:cpiContentHashAfter},protectedSummary:{canonicalBanksChecked:protectedIds.length,nonF2Mismatches:protectedMismatches,cpiQuestionContentUnchanged:cpiContentHashBefore===cpiContentHashAfter},quality:{answerLengthAudit,nearDuplicates,repeatedAnswerSets,weakDistractors}};
const sourceData={phase:PHASE,generatedAt:STAMP,scope:ids,changes,summary:{added:changes.filter(change=>change.action==='ADD').length,bridgeRewritten:changes.filter(change=>change.action==='BRIDGE_REWRITE').length,bossStageFixed:changes.filter(change=>change.action==='BOSS_STAGE_FIX').length,removed:0,relocated:0},authoringPolicy:{soloFloors:{easy:6,medium:6,hard:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendary:6,legendaryBoss:3,repair:1,bridge:1},bridgeChain:familyIds,maximumAdditions:78,actualAdditions:changes.filter(change=>change.action==='ADD').length,noGraphs:true,cpiQuestionContentProtected:true},quality:provenance.quality};

if(!dryRun){
  fs.writeFileSync(libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);
  fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  fs.writeFileSync(path.join(composer,`${PHASE}_questions.json`),JSON.stringify(sourceData,null,2)+'\n');
  fs.writeFileSync(path.join(composer,`${PHASE}.json`),JSON.stringify(provenance,null,2)+'\n');
  for(const file of [path.join(repo,'build','index.html'),path.join(composer,'index.html')]){const text=fs.readFileSync(file,'utf8').replaceAll('20260810-macro-m2b1-gdp-v1','20260810-macro-m2b2-inflation-v1');fs.writeFileSync(file,text);}
}
console.log(JSON.stringify({dryRun,phase:PHASE,beforeTotal,afterTotal:library.canonicalQuestionCount,added:sourceData.summary.added,bridgeRewritten:sourceData.summary.bridgeRewritten,bossStageFixed:sourceData.summary.bossStageFixed,beforeCounts,afterCounts,familyBefore,familyAfter,protectedCanonicalBanks:protectedIds.length,protectedMismatches,cpiQuestionContentUnchanged:cpiContentHashBefore===cpiContentHashAfter,quality:{answerLengthFailures,nearDuplicates,repeatedAnswerSets,weakDistractors}},null,2));
