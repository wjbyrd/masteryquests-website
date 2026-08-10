import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repo=path.resolve(process.argv[2]||process.cwd());
const dryRun=process.argv.includes('--dry-run');
const PHASE='phaseM2b4-unemployment-labor-family-maturation-v1';
const STAMP=new Date().toISOString();
const SOURCE='macro-m2b4-unemployment-labor-family';
const familyIds=['unemployment-measurement','unemployment-types','natural-rate-of-unemployment','labor-market-institutions'];
const modifiedIds=['unemployment-types','natural-rate-of-unemployment','labor-market-institutions'];
const modifiedSet=new Set(modifiedIds);
const protectedContentId='unemployment-measurement';
const composer=path.join(repo,'build','faculty-build-composer');
const dataDir=path.join(composer,'data');
const libraryPath=path.join(dataDir,'composer_library.js');
const registryPath=path.join(dataDir,'composer_registry.json');
const manifestPath=path.join(dataDir,'composer_library_manifest.json');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const answerHash=answer=>sha(String(answer).trim().replace(/\s+/g,' ').toLowerCase());
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const questionHash=q=>sha(JSON.stringify(stable({q:q.q,options:q.options,aHash:q.aHash,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[],bossStage:q.bossStage||null,image:q.image||null})));
const contentHash=q=>sha(JSON.stringify(stable({q:q.q,options:q.options,aHash:q.aHash,feedback:q.feedback,commonError:q.commonError,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[],image:q.image||null})));
const loadLibrary=raw=>{const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(raw,sandbox,{filename:libraryPath});return sandbox.window.MQ_COMPOSER_LIBRARY;};
const rawBefore=fs.readFileSync(libraryPath,'utf8');
const library=loadLibrary(rawBefore);
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(!String(library.libraryVersion).endsWith('phaseM2b3-growth-productivity-family-maturation-v1'))throw new Error('Unexpected baseline: completed M2b-3 library required.');
for(const id of familyIds)if(!library.concepts[id])throw new Error(`Missing F4 concept ${id}`);

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
const protectedIds=Object.keys(library.concepts).filter(id=>!modifiedSet.has(id));
const protectedBefore=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const measurementContentBefore=contentBankHash(library.concepts[protectedContentId]);
const beforeCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
const beforeTotal=library.canonicalQuestionCount;
const previousVersion=library.libraryVersion;
const changes=[];
let serial=8700000;

const lessonMap={
 frictional_unemployment:['Confuses normal job search with skill mismatch or recession layoffs.','Frictional unemployment comes from normal search and matching as workers move between jobs or enter the labor market.'],
 structural_unemployment:['Confuses persistent skill or location mismatch with temporary search or weak aggregate demand.','Structural unemployment reflects a durable mismatch between workers and available jobs, skills, or locations.'],
 cyclical_unemployment:['Confuses recession-driven unemployment with the natural-rate components.','Cyclical unemployment is the deviation associated with weak aggregate demand and business-cycle downturns.'],
 natural_rate:['Treats the natural rate as zero, fixed forever, or identical to current unemployment.','The natural rate is the frictional-plus-structural benchmark; actual unemployment can differ because of cyclical conditions.'],
 natural_rate_not_fixed:['Treats the natural rate as an immutable constant.','Changes in matching, worker skills, mobility, and labor-market institutions can change frictional or structural unemployment and therefore the natural rate.'],
 minimum_wage_surplus:['Forgets that a binding wage floor can leave more workers seeking jobs than firms want to hire.','A binding minimum wage above equilibrium can create a labor surplus: labor supplied exceeds labor demanded.'],
 unions_efficiency_wages:['Treats union wage setting and efficiency wages as identical mechanisms or ignores their tradeoffs.','Unions bargain over wages, while firms may voluntarily pay efficiency wages; both can keep wages above market-clearing levels under some conditions.']
};
function lesson(skill){return lessonMap[skill]||['Uses a surface cue instead of the relevant labor-market mechanism.','Identify whether the task concerns measurement, unemployment type, the natural-rate benchmark, or a labor-market institution.'];}
function rotate(options,answer,index){const n=index%options.length;const out=options.slice(n).concat(options.slice(0,n));if(!out.includes(answer))throw new Error(`Answer missing: ${answer}`);return out;}
function spec(stem,answer,wrong,skill,extra={}){return{stem,answer,options:[answer,...wrong],skill,...extra};}
const codeById={'unemployment-types':'UTYPE','natural-rate-of-unemployment':'NRU','labor-market-institutions':'LMI'};
const objectiveById={'unemployment-types':'LO29.3','labor-market-institutions':'LO29.4','natural-rate-of-unemployment':'LO29.5'};
const tagById={'unemployment-types':'unemployment_types','labor-market-institutions':'labor_market_policy','natural-rate-of-unemployment':'natural_unemployment'};

function addQuestion(conceptId,pool,s,index){
  const module=library.concepts[conceptId],boss=pool==='boss',lb=pool==='legendaryBoss',tier=boss?s.tier:null;
  const canonicalDifficulty=boss?({easyBoss:'easy',mediumBoss:'medium',finalBoss:'hard'})[tier]:lb?'legendary':pool;
  const marker=boss?({easyBoss:'EB',mediumBoss:'MB',finalBoss:'FB'})[tier]:({easy:'E',medium:'M',hard:'H',legendary:'L',legendaryBoss:'LB'})[pool];
  const id=`PM2B4-${codeById[conceptId]}-${marker}-${String(index+1).padStart(3,'0')}`;
  const [commonError,feedback]=lesson(s.skill);
  const q={id,sourceGame:SOURCE,q:s.stem,options:rotate(s.options,s.answer,index),tag:tagById[conceptId],type:s.type||'application',objective:objectiveById[conceptId],difficulty:boss?tier:lb?'legendaryBoss':pool,conceptCluster:'labor_market',primarySkill:s.skill,secondarySkills:s.secondarySkills||[],repairSkill:s.repairSkill||s.skill,commonError:s.commonError||commonError,feedback:s.feedback||feedback,aHash:answerHash(s.answer),canonicalId:id,sourceId:++serial,sourceChapter:[29],sourcePool:boss?tier:s.skill,primaryConceptId:conceptId,secondaryConceptIds:s.secondaryConceptIds||[],instructionalRole:boss?'boss':lb?'legendaryBoss':pool,canonicalDifficulty,originalSourcePool:boss?tier:s.skill,originalBossTier:boss?tier:lb?'legendaryBoss':null,sourceCurationPhase:PHASE};
  if(s.roundingRule)q.roundingRule=s.roundingRule;
  if(boss)q.boss=({easyBoss:'Checkpoint One',mediumBoss:'Checkpoint Two',finalBoss:'Final Checkpoint'})[tier];
  if(lb)q.bossStage=s.bossStage;
  q.sourceHash=questionHash(q);
  q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:`${PHASE}_questions.json`,sourceGlobal:'questions',sourcePool:q.sourcePool,routeKey:q.primarySkill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];
  module.questions[pool].push(q);
  changes.push({questionId:id,canonicalConceptId:conceptId,action:'ADD',oldPool:null,newPool:boss?tier:pool,reason:s.reason||'Closes a verified F4 engine or instructional gap.'});
}
function addAux(conceptId,role,s,index){
  const module=library.concepts[conceptId];
  const marker=role==='repair'?'R':'BR';
  const id=`PM2B4-${codeById[conceptId]}-${marker}-${String(index+1).padStart(3,'0')}`;
  const [commonError,feedback]=lesson(s.skill);
  const q={id,sourceGame:SOURCE,q:s.stem,options:rotate(s.options,s.answer,index),tag:tagById[conceptId],type:role==='bridge'?'bridge':'application',objective:objectiveById[conceptId],difficulty:role==='bridge'?'bridge':'microRepair',conceptCluster:'labor_market',primarySkill:s.skill,secondarySkills:s.secondarySkills||[],repairSkill:s.repairSkill||s.skill,commonError:s.commonError||commonError,feedback:s.feedback||feedback,aHash:answerHash(s.answer),canonicalId:id,sourceId:++serial,sourceChapter:[29],sourcePool:role,primaryConceptId:conceptId,secondaryConceptIds:s.secondaryConceptIds||[],instructionalRole:role,canonicalDifficulty:'unknown',originalSourcePool:role,originalBossTier:null,sourceCurationPhase:PHASE};
  q.sourceHash=questionHash(q);
  q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:`${PHASE}_questions.json`,sourceGlobal:role==='bridge'?'microSkillBridgePools':'microSkillRepairPools',sourcePool:role,routeKey:q.primarySkill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];
  if(role==='repair'){module.repairQuestions.push(q);module.microSkillRepairPools=module.microSkillRepairPools||{};(module.microSkillRepairPools[q.primarySkill]||=[]).push(id);}else{module.bridgeQuestions.push(q);module.microSkillBridgePools=module.microSkillBridgePools||{};(module.microSkillBridgePools[q.primarySkill]||=[]).push(id);}
  changes.push({questionId:id,canonicalConceptId:conceptId,action:'ADD',oldPool:null,newPool:role,reason:s.reason||`Adds a targeted ${role} connection required by the F4 blueprint.`});
}
function setBossStage(conceptId,questionId,bossStage){
  const q=library.concepts[conceptId].questions.legendaryBoss.find(item=>qid(item)===questionId);if(!q)throw new Error(`Missing Legendary Boss ${questionId}`);
  const beforeHash=questionHash(q),before=q.bossStage??null;q.bossStage=bossStage;q.sourceHash=questionHash(q);
  changes.push({questionId,canonicalConceptId:conceptId,action:'BOSS_STAGE_FIX',oldPool:'legendaryBoss',newPool:'legendaryBoss',reason:`Assigns semantically appropriate ${bossStage} stage without changing question content.`,beforeBossStage:before,afterBossStage:bossStage,beforeHash,afterHash:q.sourceHash});
}

// Existing F4 Legendary Boss stage repair.
setBossStage('unemployment-measurement','ECON-NL-LEGENDARYBOSS-9126','opening');
setBossStage('unemployment-measurement','ECON-NL-LEGENDARYBOSS-9125','middle');
setBossStage('unemployment-measurement','ECON-NL-LEGENDARYBOSS-9124','final');
setBossStage('unemployment-types','ECON-NL-LEGENDARYBOSS-9127','final');
setBossStage('natural-rate-of-unemployment','ECON-NL-LEGENDARYBOSS-9131','opening');
setBossStage('natural-rate-of-unemployment','ECON-NL-LEGENDARYBOSS-9130','middle');
setBossStage('labor-market-institutions','ECON-NL-LEGENDARYBOSS-9128','opening');
setBossStage('labor-market-institutions','ECON-NL-LEGENDARYBOSS-9129','final');

const types={
 medium:[
  spec('A worker leaves a job to move to another city and spends six weeks searching for a similar position while local demand remains strong. Which type of unemployment best fits the case?','Frictional unemployment',['Structural unemployment','Cyclical unemployment','The worker is outside the labor force'],'frictional_unemployment')
 ],
 hard:[
  spec('A worker is laid off when a recession cuts sales. By the time demand recovers, the firm has automated the old job and the worker lacks the new required skills. What best describes the worker’s unemployment now?','It began as cyclical but is now primarily structural',['It remains purely cyclical because the original layoff occurred in a recession','It is frictional because every unemployed worker is searching','It is no longer unemployment once the original recession ends'],'structural_unemployment')
 ],
 legendary:[
  spec('A regional downturn eliminates jobs at several firms. One year later overall demand has recovered, but many displaced workers remain unemployed because growing industries require different credentials. Which diagnosis is most accurate?','Cyclical unemployment fell, while structural unemployment remains',['The remaining unemployment must still be entirely cyclical','The recovery eliminates both structural and frictional unemployment','The remaining unemployment is frictional simply because workers are looking for jobs'],'structural_unemployment',{secondaryConceptIds:['natural-rate-of-unemployment']}),
  spec('Two unemployed workers are actively searching. One left a job voluntarily and is comparing similar offers; the other lost a job after the occupation disappeared permanently. Why are they classified differently by unemployment type?','The first faces normal search time; the second faces a durable job-skill mismatch',['The first is cyclical because quitting is voluntary; the second is frictional because the old job disappeared','Both are structural because both currently lack jobs','Both are frictional because both are actively searching'],'frictional_unemployment')
 ],
 boss:[
  {...spec('A recent graduate is actively searching for a first job that matches their training. Which unemployment type is most likely?','Frictional unemployment',['Structural unemployment from a persistent skill mismatch','Cyclical unemployment caused by a recession','Outside the labor force because the worker is not searching'],'frictional_unemployment'),tier:'easyBoss'},
  {...spec('A machinist’s occupation disappears after a permanent technology change, and available jobs require different skills. Which type is most likely?','Structural unemployment',['Frictional unemployment','Cyclical unemployment','Discouraged-worker unemployment'],'structural_unemployment'),tier:'easyBoss'},
  {...spec('A restaurant cuts staff because a recession sharply reduces customer spending. Which type is most likely?','Cyclical unemployment',['Frictional unemployment from normal job search','Structural unemployment from a permanent mismatch','No unemployment because the staffing cut is temporary'],'cyclical_unemployment'),tier:'easyBoss'},
  {...spec('A worker is unemployed for four weeks while comparing similar jobs in a strong labor market. Which fact most strongly supports a frictional diagnosis?','The worker has marketable skills and needs time to find a match',['The worker’s occupation has permanently disappeared','Aggregate demand has collapsed across the economy','The worker stopped searching and left the labor force'],'frictional_unemployment'),tier:'mediumBoss'},
  {...spec('A recession ends, but workers from a permanently closed industry still cannot fill expanding jobs because their skills do not match. Which unemployment remains most directly?','Structural unemployment',['Cyclical unemployment','Frictional unemployment only','No unemployment once the recession ends'],'structural_unemployment'),tier:'mediumBoss'},
  {...spec('A firm temporarily lays off workers because economy-wide spending falls, while another worker voluntarily searches for a better job. Which pair is present?','Cyclical and frictional unemployment',['Structural and cyclical unemployment only','Two cases of structural unemployment','Two cases of frictional unemployment'],'cyclical_unemployment'),tier:'mediumBoss'}
 ],
 legendaryBoss:[
  spec('A worker quits a suitable job and spends several weeks comparing similar openings. Which unemployment type is the best starting diagnosis?','Frictional unemployment',['Structural unemployment caused by obsolete skills','Cyclical unemployment caused by weak economy-wide demand','Outside the labor force because active job search has stopped'],'frictional_unemployment',{bossStage:'opening'}),
  spec('A recession causes a layoff, but after spending recovers the worker still cannot find work because the occupation now requires different skills. What changed in the diagnosis?','The unemployment shifted from cyclical toward structural',['It shifted from structural toward frictional','It stayed purely cyclical because the layoff happened first','It stopped being unemployment when the recession ended'],'structural_unemployment',{bossStage:'middle'})
 ]
};

const natural={
 easy:[
  spec('If actual unemployment equals the natural rate, which unemployment component is approximately zero?','Cyclical unemployment',['Frictional unemployment','Structural unemployment','All unemployment'],'natural_rate'),
  spec('Which change is most likely to raise the natural rate rather than merely raise cyclical unemployment?','A lasting increase in worker-skill mismatch',['A temporary recession that reduces aggregate demand','A one-quarter fall in consumer spending','A short-lived decline in business confidence'],'natural_rate_not_fixed')
 ],
 medium:[
  spec('A strong expansion lowers actual unemployment, but worker matching, skills, and labor-market institutions are unchanged. What is the most careful conclusion?','Cyclical unemployment may have fallen without changing the natural rate',['The natural rate must have fallen by the same amount as actual unemployment','Structural unemployment must have disappeared permanently','The natural rate becomes zero whenever aggregate demand is strong'],'natural_rate'),
  spec('A retraining program successfully moves displaced workers into growing occupations. If other conditions are unchanged, what is the most likely effect on the natural rate?','It may fall because structural unemployment is reduced',['It must rise because more workers have changed occupations','It changes only if cyclical unemployment rises','It cannot change because the natural rate is fixed forever'],'natural_rate_not_fixed')
 ],
 hard:[
  spec('Two economies both have 6% actual unemployment. Economy A has a 4% natural rate and Economy B has a 6% natural rate. Which comparison is strongest?','Economy A has more positive cyclical unemployment than Economy B',['Both economies have the same cyclical unemployment because actual unemployment is equal','Economy B must be in a deeper recession because its natural rate is higher','Neither economy can have frictional or structural unemployment'],'natural_rate'),
  spec('A new nationwide matching system shortens the average time between jobs without changing aggregate demand. Which effect is most plausible?','Frictional unemployment and the natural rate may decline',['Cyclical unemployment rises permanently','Structural unemployment must rise by the same amount','The natural rate cannot respond to matching efficiency'],'natural_rate_not_fixed'),
  spec('A long-lasting geographic mismatch develops: job openings expand in regions that displaced workers cannot easily move to. What is the most likely natural-rate effect?','Structural unemployment can rise, pushing the natural rate upward',['Only cyclical unemployment rises because location never affects structural mismatch','The natural rate falls automatically because jobs exist somewhere','The natural rate is unchanged whenever total vacancies are positive'],'natural_rate_not_fixed'),
  spec('Expansionary demand policy lowers actual unemployment from 7% to 5%, while the estimated natural rate remains 5%. Which interpretation fits the change?','A positive cyclical unemployment gap was eliminated',['The natural rate fell from 7% to 5% because demand increased','Frictional unemployment was permanently eliminated','Structural unemployment became negative'],'natural_rate'),
  spec('A policy improves occupational retraining but also makes job search somewhat longer by allowing workers to search for better matches. What is the best conclusion about the natural rate?','The net effect is ambiguous because structural unemployment may fall while frictional search may rise',['The natural rate must fall because every labor-market policy lowers unemployment','The natural rate must rise because longer search is the only relevant channel','Only cyclical unemployment can be affected by either policy'],'natural_rate_not_fixed')
 ],
 legendary:[
  spec('An economy recovers fully from a recession, yet unemployment settles at a higher level than before because displaced workers lost skills during the long downturn. Which explanation best fits?','Lasting labor-market damage may have raised the natural rate',['Cyclical unemployment must still equal the entire unemployment rate','The natural rate cannot change after any recession','A higher natural rate means all remaining unemployment is frictional'],'natural_rate_not_fixed'),
  spec('A government wants to reduce the natural rate rather than only reduce recessionary unemployment. Which policy is most directly aligned with that goal?','Improve job matching and retraining to reduce frictional and structural unemployment',['Use a temporary demand stimulus with no effect on matching or skills','Change the CPI base year used to report inflation','Increase aggregate spending only until actual unemployment falls for one quarter'],'natural_rate_not_fixed',{secondaryConceptIds:['labor-market-institutions']}),
  spec('Actual unemployment falls below the estimated natural rate during a strong expansion. Later it returns to the natural rate with no change in worker skills or matching. What is the best interpretation?','The temporary gap reflected cyclical conditions rather than a permanent change in the natural rate',['The natural rate permanently fell and then rose because actual unemployment moved','Structural unemployment must have been negative during the expansion','The return to the natural rate proves frictional unemployment disappeared temporarily'],'natural_rate')
 ],
 boss:[
  {...spec('Which unemployment is included in the natural rate?','Frictional and structural unemployment',['Cyclical unemployment only','Discouraged workers only','All unemployment caused by recessions'],'natural_rate'),tier:'easyBoss'},
  {...spec('Why can a healthy economy have positive unemployment at the natural rate?','Workers still search for jobs and some skills do not match openings',['Every healthy economy must retain recession-driven cyclical unemployment at all times','The natural rate is a policy target chosen to match the current inflation rate','All workers between paychecks are automatically classified as unemployed'],'natural_rate'),tier:'easyBoss'},
  {...spec('Which change can lower the natural rate?','Faster job matching that reduces normal search time',['A temporary fall in aggregate demand that raises recession-related layoffs','A short recession that increases cyclical unemployment for several months','A one-month decline in consumer confidence with no lasting matching change'],'natural_rate_not_fixed'),tier:'easyBoss'},
  {...spec('Actual unemployment falls after aggregate demand recovers, while the natural rate estimate is unchanged. What most likely fell?','Cyclical unemployment',['Structural unemployment necessarily','The natural rate itself','Frictional unemployment necessarily'],'natural_rate'),tier:'mediumBoss'},
  {...spec('A permanent occupational shift leaves displaced workers without skills needed in expanding industries. What is the likely effect?','Structural unemployment and the natural rate may rise',['Only cyclical unemployment rises','The natural rate must fall because some industries expanded','Frictional unemployment becomes zero'],'natural_rate_not_fixed'),tier:'mediumBoss'},
  {...spec('A policy improves retraining and job matching at the same time. What is the strongest natural-rate prediction?','The natural rate may fall as structural mismatch and search time decline',['The natural rate must rise because more workers change jobs','Only cyclical unemployment can respond','The natural rate remains fixed by definition'],'natural_rate_not_fixed'),tier:'mediumBoss'}
 ],
 legendaryBoss:[
  spec('A country improves worker retraining and job matching for several years, reducing both persistent mismatch and average search time. What is the strongest long-run labor-market conclusion?','The natural rate can fall because structural and frictional unemployment are lower',['Only cyclical unemployment can fall because training and matching cannot affect the long-run benchmark','The natural rate must remain fixed even when persistent mismatch and search time both decline','The natural rate becomes exactly zero once matching improves enough to shorten normal job searches'],'natural_rate_not_fixed',{bossStage:'final',secondaryConceptIds:['labor-market-institutions']})
 ],
 repair:[
  spec('Actual unemployment is above the natural rate during a recession. Which part of the gap is not itself part of the natural rate?','Cyclical unemployment',['Frictional unemployment','Structural unemployment','Normal job-search unemployment'],'natural_rate',{commonError:'Adding recession-driven cyclical unemployment into the natural-rate benchmark.',feedback:'The natural rate reflects frictional and structural unemployment. Cyclical unemployment is the business-cycle deviation of actual unemployment from that benchmark.'})
 ]
};

const institutions={
 easy:[
  spec('A firm deliberately pays above the market-clearing wage to reduce turnover and encourage effort. Which idea best describes the policy?','Efficiency wage theory',['Unemployment insurance','A binding minimum wage','Cyclical unemployment policy'],'unions_efficiency_wages'),
  spec('Workers bargain collectively with an employer over wages and working conditions. Which institution is most directly involved?','A labor union',['The CPI basket','The GDP deflator','A discouraged-worker rule'],'unions_efficiency_wages')
 ],
 medium:[
  spec('How do a union wage and an efficiency wage differ most directly?','A union wage is bargained collectively; an efficiency wage is voluntarily chosen by the firm',['A union wage is always below equilibrium; an efficiency wage is always legally mandated','A union wage affects only prices; an efficiency wage affects only GDP accounting','They are identical policies imposed by government in every labor market'],'unions_efficiency_wages'),
  spec('A state improves job-search assistance while leaving unemployment benefits unchanged. Which outcome is most directly targeted?','Shorter frictional unemployment spells through faster matching',['Higher cyclical unemployment through weaker aggregate demand','A larger labor surplus from a binding minimum wage','A permanent increase in structural mismatch'],'frictional_unemployment')
 ],
 hard:[
  spec('Unemployment benefits become more generous while a new matching platform sharply improves the quality and speed of job referrals. What is the best prediction for frictional unemployment?','The net effect is ambiguous because the two changes work in opposite directions',['It must rise because matching services cannot offset the weaker search incentives created by benefits','It must fall because unemployment benefits never change search incentives when matching technology improves','Only structural unemployment can change because neither policy affects normal search and matching'],'frictional_unemployment'),
  spec('A firm raises wages above equilibrium and worker effort rises enough to improve productivity, but fewer workers are hired at the higher wage. Which interpretation is most complete?','Efficiency-wage benefits can coexist with a labor surplus and fewer job opportunities',['Higher productivity guarantees every worker seeking a job will be hired despite the higher wage','The wage increase must be a legally binding minimum wage rather than a voluntary firm decision','The policy can raise worker effort only when cyclical unemployment has already fallen to zero'],'unions_efficiency_wages')
 ],
 boss:[
  {...spec('A legal wage floor is set above the equilibrium wage. What labor-market outcome can result?','A surplus of workers seeking jobs',['A shortage of workers because labor demand exceeds labor supply','Automatic full employment at the higher wage','No change in labor supplied or demanded'],'minimum_wage_surplus'),tier:'easyBoss'},
  {...spec('A firm pays above-equilibrium wages to reduce quits and raise effort. Which theory is being used?','Efficiency wage theory',['Unemployment insurance theory','Cyclical unemployment theory','Labor-force participation accounting'],'unions_efficiency_wages'),tier:'easyBoss'},
  {...spec('A program helps unemployed workers identify suitable openings more quickly. Which unemployment type is most directly targeted?','Frictional unemployment',['Cyclical unemployment','Structural unemployment from obsolete skills only','Discouraged-worker classification'],'frictional_unemployment'),tier:'easyBoss'},
  {...spec('A union negotiates an above-equilibrium wage while a firm in another market voluntarily pays an above-equilibrium wage to reduce turnover. What do the two cases share?','Both can keep wages above market clearing and reduce hiring relative to equilibrium',['Both are government-mandated wage floors imposed above equilibrium in their respective markets','Both necessarily eliminate worker turnover and therefore increase employment at the higher wage','Both can affect hiring only during recessions when aggregate demand is already weak'],'unions_efficiency_wages'),tier:'mediumBoss'},
  {...spec('Unemployment benefits increase search time, while improved job-placement services shorten search time. What is the most careful prediction?','The net effect on frictional unemployment depends on the relative strength of both channels',['Frictional unemployment must rise because more generous benefits always dominate any matching improvement','Frictional unemployment must fall because improved placement always dominates any change in search incentives','Only structural unemployment can respond because search incentives and matching do not affect frictional unemployment'],'frictional_unemployment'),tier:'mediumBoss'},
  {...spec('A binding minimum wage raises pay for workers who remain employed but reduces the number of low-skill workers firms hire. Which statement best captures the tradeoff?','Some employed workers gain higher wages while some job seekers lose opportunities',['Every worker gains from the higher wage because firms must continue hiring the same number of workers','Employment must rise because the higher wage brings more workers into the labor market seeking jobs','The policy changes only the nominal wage and therefore cannot alter firms’ demand for labor'],'minimum_wage_surplus'),tier:'mediumBoss'}
 ],
 legendaryBoss:[
  spec('A union secures an above-equilibrium wage in one industry, while a different firm voluntarily pays an above-equilibrium efficiency wage to reduce turnover and raise effort. Which statement best distinguishes the mechanisms?','The union wage comes from collective bargaining; the efficiency wage is chosen for productivity incentives',['Both wages are legally mandated minimum wages','The union wage is always below equilibrium while the efficiency wage is always at equilibrium','Only the union wage can affect hiring when wages are above market clearing'],'unions_efficiency_wages',{bossStage:'middle'})
 ],
 repair:[
  spec('Why can more generous unemployment insurance lengthen some unemployment spells even while protecting workers?','It can reduce search urgency while providing income support',['It permanently destroys worker skills by definition','It makes every unemployed worker leave the labor force','It raises labor demand above labor supply automatically'],'frictional_unemployment',{commonError:'Treating unemployment insurance as either purely harmful or guaranteed to reduce unemployment.',feedback:'Unemployment insurance protects income and may improve match quality, but more generous benefits can also reduce search urgency and lengthen some frictional unemployment spells.'})
 ],
 bridge:[
  spec('A new job-matching service reduces the average time workers spend between jobs. What family-level implication follows?','Lower frictional unemployment can reduce the natural rate',['Lower frictional unemployment must raise cyclical unemployment','The natural rate is fixed and cannot respond to matching','Only the measured CPI can change from better matching'],'frictional_unemployment',{secondaryConceptIds:['natural-rate-of-unemployment'],secondarySkills:['natural_rate_not_fixed'],commonError:'Failing to connect institutions that change search efficiency with the frictional component of the natural rate.',feedback:'Faster matching reduces frictional unemployment; because frictional unemployment is part of the natural rate, the natural rate can fall.'})
 ]
};

for(const [conceptId,groups] of Object.entries({'unemployment-types':types,'natural-rate-of-unemployment':natural,'labor-market-institutions':institutions})){
  for(const [pool,specs] of Object.entries(groups)){
    if(pool==='repair'||pool==='bridge')specs.forEach((item,index)=>addAux(conceptId,pool,item,index));
    else specs.forEach((item,index)=>addQuestion(conceptId,pool,item,index));
  }
}
// Add the Measurement -> Types bridge in the Types bank.
addAux('unemployment-types','bridge',spec('A jobless worker has actively applied for jobs this week after voluntarily leaving a suitable job. How should the case be described across measurement and type?','Counted as unemployed, with frictional unemployment as the likely type',['Not in the labor force, with structural unemployment as the likely type','Counted as employed, with cyclical unemployment as the likely type','Not counted in labor statistics because leaving a job voluntarily prevents unemployment status'],'frictional_unemployment',{secondaryConceptIds:['unemployment-measurement'],secondarySkills:['employment_classification'],commonError:'Using the cause of unemployment to decide official employment status, or using official status without identifying the unemployment type.',feedback:'Active job search makes the worker officially unemployed; normal search after leaving a suitable job is frictional unemployment.'}),0);

const afterCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
const expected={
 'unemployment-measurement':{total:79,easy:7,medium:6,hard:9,legendary:9,easyBoss:3,mediumBoss:3,finalBoss:11,legendaryBoss:3,repair:5,bridge:5},
 'unemployment-types':{total:57,easy:6,medium:6,hard:6,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:12,legendaryBoss:3,repair:3,bridge:4},
 'natural-rate-of-unemployment':{total:44,easy:6,medium:6,hard:6,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:5,legendaryBoss:3,repair:3,bridge:1},
 'labor-market-institutions':{total:58,easy:6,medium:6,hard:6,legendary:7,easyBoss:3,mediumBoss:3,finalBoss:14,legendaryBoss:3,repair:3,bridge:3}
};
for(const [conceptId,target] of Object.entries(expected))for(const [key,value] of Object.entries(target))if(afterCounts[conceptId][key]!==value)throw new Error(`Count mismatch ${conceptId} ${key}: ${afterCounts[conceptId][key]} != ${value}`);
const added=changes.filter(c=>c.action==='ADD').length;
if(added!==48)throw new Error(`Expected 48 additions; got ${added}`);
if(changes.filter(c=>c.action==='BOSS_STAGE_FIX').length!==8)throw new Error('Expected 8 bossStage fixes.');

// Duplicate/template checks for introduced content.
const introducedIds=new Set(changes.filter(c=>c.action==='ADD').map(c=>c.questionId));
const allF4=familyIds.flatMap(conceptId=>unique(library.concepts[conceptId]).map(({pool,question})=>({conceptId,pool,question})));
const normalize=t=>String(t||'').toLowerCase().replace(/[^a-z0-9%]+/g,' ').replace(/\s+/g,' ').trim();
const stemMap=new Map(),templateMap=new Map(),introducedExact=[],introducedNumberSwaps=[];
for(const row of allF4){
 const id=qid(row.question),stem=normalize(row.question.q),tpl=stem.replace(/\b\d+(?:[.,]\d+)?%?\b/g,'#');
 if(stemMap.has(stem)&&(introducedIds.has(id)||introducedIds.has(stemMap.get(stem))))introducedExact.push([stemMap.get(stem),id]); else if(!stemMap.has(stem))stemMap.set(stem,id);
 if(templateMap.has(tpl)&&(introducedIds.has(id)||introducedIds.has(templateMap.get(tpl))))introducedNumberSwaps.push([templateMap.get(tpl),id]); else if(!templateMap.has(tpl))templateMap.set(tpl,id);
}
if(introducedExact.length)throw new Error(`Introduced exact duplicates: ${JSON.stringify(introducedExact)}`);
if(introducedNumberSwaps.length)throw new Error(`Introduced number-swap templates: ${JSON.stringify(introducedNumberSwaps)}`);

function wordCount(text){return String(text||'').trim().split(/\s+/).filter(Boolean).length;}
const lengthIssues=[];
for(const conceptId of modifiedIds){
 const groups={};
 for(const {pool,question} of unique(library.concepts[conceptId]))if(introducedIds.has(qid(question))){
  const group=pool==='boss'?question.difficulty:pool;
  const correct=(question.options||[]).find(option=>answerHash(option)===question.aHash);const dist=(question.options||[]).filter(option=>option!==correct);
  (groups[group]||=[]).push({correct:wordCount(correct),dist:dist.map(wordCount)});
 }
 for(const [group,rows] of Object.entries(groups)){
  const longest=rows.filter(r=>r.dist.every(n=>r.correct>n)).length/rows.length;
  const cm=rows.reduce((a,r)=>a+r.correct,0)/rows.length;
  const dm=rows.reduce((a,r)=>a+r.dist.reduce((x,y)=>x+y,0)/r.dist.length,0)/rows.length;
  if(longest>.5||cm/dm>1.35)lengthIssues.push({conceptId,group,longest:Number(longest.toFixed(3)),ratio:Number((cm/dm).toFixed(3))});
 }
}
if(lengthIssues.length)throw new Error(`Answer-length issue: ${JSON.stringify(lengthIssues)}`);

function calcLinked(q){return q.type==='calculation'||['labor_force_calculation','unemployment_rate','labor_force_participation','minimum_wage_surplus','natural_rate'].includes(q.primarySkill)&&/\d/.test(String(q.q||''));}
function updateRegistryEntry(entry,module,role){
 const records=unique(module).map(item=>item.question),ordinary=['easy','medium','hard'].flatMap(pool=>module.questions[pool]||[]);
 const roleCounts={boss:(module.questions.boss||[]).length,bridge:(module.bridgeQuestions||[]).length,calculation:(module.questions.calculation||[]).length,elite:(module.questions.elite||[]).length,integration:(module.questions.integration||[]).length,legendary:(module.questions.legendary||[]).length,legendaryBoss:(module.questions.legendaryBoss||[]).length,main:ordinary.length,repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length};
 const diff={easy:(module.questions.easy||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='easyBoss').length,medium:(module.questions.medium||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='mediumBoss').length,hard:(module.questions.hard||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='finalBoss').length,elite:(module.questions.elite||[]).length,legendary:(module.questions.legendary||[]).length+(module.questions.legendaryBoss||[]).length,unknown:(module.repairQuestions||[]).length+(module.repairSeedQuestions||[]).length+(module.bridgeQuestions||[]).length};
 Object.assign(entry,{includedSkills:[...new Set(records.map(q=>q.primarySkill).filter(Boolean))].sort(),questionCountByRole:roleCounts,questionCountByDifficulty:diff,repairCoverage:{directSkillMatches:(module.repairQuestions||[]).length,mainWithUsableSkill:records.length},bridgeCoverage:{directSkillMatches:(module.bridgeQuestions||[]).length,mainWithUsableSkill:records.length},calculationCoverage:records.filter(calcLinked).length,instructionalClassification:role==='protected'?'Deep family component; protected in M2b-4':'Engine-safe Unemployment and Labor family slice',coverageStatus:'ready-family-slice',coverageStatusLabel:'Engine-safe alone; deepest in F4 family',coverageStatusNote:'Phase M2b-4 supplies solo floors with controlled reuse, rebalances early checkpoints, strengthens Natural Rate, and connects Measurement → Types → Natural Rate → Institutions.',coverageFloorVersion:PHASE,notes:'Unemployment and Labor family slice. Measurement remains protected; causal classification, natural-rate reasoning, and labor-institution tradeoffs receive targeted maturation.'});
}
for(const conceptId of familyIds)for(const list of [library.registry.concepts,registry.concepts]){const entry=list.find(item=>item.canonicalConceptId===conceptId);if(!entry)throw new Error(`Registry entry missing ${conceptId}`);updateRegistryEntry(entry,library.concepts[conceptId],conceptId===protectedContentId?'protected':'modified');}

const measurementContentAfter=contentBankHash(library.concepts[protectedContentId]);
if(measurementContentAfter!==measurementContentBefore)throw new Error('Unemployment Measurement question content changed; only bossStage metadata was authorized.');
for(const [id,hash] of Object.entries(protectedBefore))if(id!==protectedContentId&&bankHash(library.concepts[id])!==hash)throw new Error(`Protected bank changed ${id}`);
const protectedAfter=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const protectedMismatches=protectedIds.filter(id=>id!==protectedContentId&&protectedAfter[id]!==protectedBefore[id]);

library.libraryVersion=`${previousVersion}-${PHASE}`;library.sourceCurationPhase=PHASE;library.generatedAt=STAMP;library.canonicalQuestionCount=Object.values(library.concepts).reduce((sum,module)=>sum+unique(module).length,0);
Object.assign(library.registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
Object.assign(registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
delete library.librarySha256;library.librarySha256=sha(JSON.stringify(stable(library)));registry.librarySha256=library.librarySha256;
Object.assign(manifest,{canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:STAMP});
const familyBefore=Object.values(beforeCounts).reduce((out,count)=>{for(const [key,value] of Object.entries(count))out[key]=(out[key]||0)+value;return out;},{});
const familyAfter=Object.values(afterCounts).reduce((out,count)=>{for(const [key,value] of Object.entries(count))out[key]=(out[key]||0)+value;return out;},{});
const provenance={phase:PHASE,generatedAt:STAMP,scope:{family:'F4 — Unemployment and Labor',protectedQuestionContent:[protectedContentId],modifiedCanonicalConceptIds:modifiedIds,metadataOnlyConceptIds:[protectedContentId]},before:{libraryVersion:previousVersion,canonicalQuestionCount:beforeTotal,counts:beforeCounts,familyCounts:familyBefore,measurementContentSha256:measurementContentBefore},after:{libraryVersion:library.libraryVersion,canonicalQuestionCount:library.canonicalQuestionCount,librarySha256:library.librarySha256,counts:afterCounts,familyCounts:familyAfter,protectedMismatchCount:protectedMismatches.length,measurementContentSha256:measurementContentAfter},protectedSummary:{canonicalBanksChecked:protectedIds.length,nonF4Mismatches:protectedMismatches,measurementQuestionContentUnchanged:measurementContentBefore===measurementContentAfter},quality:{introducedExact,introducedNumberSwaps,answerLengthIssues:lengthIssues}};
const sourceData={phase:PHASE,generatedAt:STAMP,scope:modifiedIds,changes,summary:{added,bossStageFixed:changes.filter(c=>c.action==='BOSS_STAGE_FIX').length,removed:0,relocated:0,repairAdded:2,bridgeAdded:2},authoringPolicy:{soloFloors:{easy:6,medium:6,hard:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendary:6,legendaryBoss:3,repair:1,bridge:1},targetRange:[234,239],actualFamilyTotal:familyAfter.total,protectedQuestionContent:[protectedContentId]},quality:provenance.quality};

if(!dryRun){
 fs.writeFileSync(libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);
 fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(composer,`${PHASE}_questions.json`),JSON.stringify(sourceData,null,2)+'\n');
 fs.writeFileSync(path.join(composer,`${PHASE}.json`),JSON.stringify(provenance,null,2)+'\n');
 for(const file of [path.join(repo,'build','index.html'),path.join(composer,'index.html')]){if(fs.existsSync(file)){const text=fs.readFileSync(file,'utf8').replaceAll('20260810-macro-m2b3-growth-v1','20260810-macro-m2b4-unemployment-v1');fs.writeFileSync(file,text);}}
}
console.log(JSON.stringify({dryRun,phase:PHASE,beforeTotal,afterTotal:library.canonicalQuestionCount,added,bossStageFixed:changes.filter(c=>c.action==='BOSS_STAGE_FIX').length,beforeCounts,afterCounts,familyBefore,familyAfter,protectedMismatches,measurementQuestionContentUnchanged:measurementContentBefore===measurementContentAfter,introducedExact,introducedNumberSwaps,lengthIssues},null,2));
