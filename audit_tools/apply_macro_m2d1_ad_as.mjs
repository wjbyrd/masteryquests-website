import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repo=path.resolve(process.argv[2]||process.cwd());
const dryRun=process.argv.includes('--dry-run');
const PHASE='phaseM2d1-ad-as-macro-equilibrium-family-maturation-v1';
const STAMP=new Date().toISOString();
const SOURCE='macro-m2d1-ad-as-macro-equilibrium-family';
const familyIds=['aggregate-demand','aggregate-supply','macroeconomic-equilibrium-and-shocks','long-run-macroeconomic-adjustment'];
const modifiedSet=new Set(familyIds);
const composer=path.join(repo,'build','faculty-build-composer');
const dataDir=path.join(composer,'data');
const libraryPath=path.join(dataDir,'composer_library.js');
const registryPath=path.join(dataDir,'composer_registry.json');
const manifestPath=path.join(dataDir,'composer_library_manifest.json');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const answerHash=a=>sha(String(a).trim().replace(/\s+/g,' ').toLowerCase());
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const questionHash=q=>sha(JSON.stringify(stable({q:q.q,options:q.options,aHash:q.aHash,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,repairSkill:q.repairSkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[],bossStage:q.bossStage||null,image:q.image||null})));
const rawBefore=fs.readFileSync(libraryPath,'utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(rawBefore,sandbox,{filename:libraryPath});const library=sandbox.window.MQ_COMPOSER_LIBRARY;
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(!String(library.libraryVersion).endsWith('phaseM2c3-money-market-policy-transmission-family-maturation-v1'))throw new Error('Unexpected baseline: completed M2c-3 library required.');
for(const id of familyIds)if(!library.concepts[id])throw new Error(`Missing F8 concept ${id}`);

function tagged(module){return [...Object.entries(module.questions||{}).flatMap(([pool,list])=>(list||[]).map(question=>({pool,question}))),...(module.repairQuestions||[]).map(question=>({pool:'repair',question})),...(module.repairSeedQuestions||[]).map(question=>({pool:'repairSeed',question})),...(module.bridgeQuestions||[]).map(question=>({pool:'bridge',question}))];}
function unique(module){const seen=new Set();return tagged(module).filter(({question})=>{const id=qid(question);if(seen.has(id))return false;seen.add(id);return true;});}
function bankSnapshot(module){return unique(module).map(({pool,question})=>({pool,id:qid(question),question:stable(question)})).sort((a,b)=>a.id.localeCompare(b.id));}
function bankHash(module){return sha(JSON.stringify(stable(bankSnapshot(module))));}
function bossTier(q){const d=String(q?.difficulty||'').toLowerCase();if(d==='easyboss')return'easyBoss';if(d==='mediumboss')return'mediumBoss';if(d==='finalboss'||d==='hardboss')return'finalBoss';return'';}
function countModule(module){const boss=module.questions?.boss||[];return{easy:(module.questions?.easy||[]).length,medium:(module.questions?.medium||[]).length,hard:(module.questions?.hard||[]).length,elite:(module.questions?.elite||[]).length,legendary:(module.questions?.legendary||[]).length,calculation:(module.questions?.calculation||[]).length,integration:(module.questions?.integration||[]).length,easyBoss:boss.filter(q=>bossTier(q)==='easyBoss').length,mediumBoss:boss.filter(q=>bossTier(q)==='mediumBoss').length,finalBoss:boss.filter(q=>bossTier(q)==='finalBoss').length,legendaryBoss:(module.questions?.legendaryBoss||[]).length,repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length,bridge:(module.bridgeQuestions||[]).length,total:unique(module).length};}
const protectedIds=Object.keys(library.concepts).filter(id=>!modifiedSet.has(id));
const protectedBefore=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const beforeCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
const beforeTotal=library.canonicalQuestionCount,previousVersion=library.libraryVersion;
const changes=[];let serial=9300000;

const meta={
 'long-run-macroeconomic-adjustment':{code:'LRADJ',tag:'long_run_adjustment',objective:'LO34.5',chapter:[34],cluster:'ad_as_graphs'}
};
const lessonMap={
 explain_long_run_adjustment:['Assumes aggregate demand must shift back on its own for the economy to return to potential output.','With aggregate demand unchanged, wage, cost, and price-expectation adjustment can shift SRAS so real output returns toward potential.'],
 classify_output_gap:['Confuses the highest output shown with potential output or reverses recessionary and inflationary gaps.','Compare current real output with the LRAS/potential-output level: below potential is recessionary; above potential is inflationary.'],
 natural_output_determinants:['Treats potential output as determined by the current price level or aggregate demand.','Potential output is anchored by real productive capacity—labor, capital, resources, technology, and institutions.'],
 adjustment_speed:['Assumes self-correction is instantaneous even when wages and expectations are sticky.','Long-run adjustment can take time because wage contracts, input costs, and price expectations may change gradually.'],
 lras_shift_vs_gap:['Assumes every fall in real GDP is a temporary gap around an unchanged potential-output level.','Before forecasting self-correction back to the old output level, check whether productive capacity changed and LRAS shifted.'],
 self_correction_vs_policy:['Attributes any recovery toward potential to active policy even when wages and expectations are adjusting with no policy change.','Self-correction is the endogenous SRAS response to an output gap; stabilization policy is a separate deliberate intervention.'],
 bridge_to_stabilization:['Stops at the existence of an output gap and does not distinguish passive self-correction from an active policy choice.','After identifying the gap and self-correcting path, stabilization analysis asks whether policymakers should deliberately shift aggregate demand instead of waiting.']
};
function lesson(skill){return lessonMap[skill]||['Uses a short-run label without tracing the long-run adjustment mechanism.','Identify the output gap, hold the initiating demand position fixed unless told otherwise, and trace how wages, costs, expectations, SRAS, and potential output change over time.'];}
function rotate(options,answer,index){const n=index%options.length,out=options.slice(n).concat(options.slice(0,n));if(!out.includes(answer))throw new Error(`Answer missing: ${answer}`);return out;}
function spec(stem,answer,wrong,skill,extra={}){return{stem,answer,options:[answer,...wrong],skill,...extra};}
function setSourceHash(q){q.sourceHash=questionHash(q);if(Array.isArray(q.sourceOccurrences)&&q.sourceOccurrences.length)q.sourceOccurrences[q.sourceOccurrences.length-1].sourceHash=q.sourceHash;}
function addQuestion(conceptId,pool,s,index){
 const module=library.concepts[conceptId],m=meta[conceptId],boss=pool==='boss',lb=pool==='legendaryBoss',tier=boss?s.tier:null;
 const canonicalDifficulty=boss?({easyBoss:'easy',mediumBoss:'medium',finalBoss:'hard'})[tier]:lb?'legendary':pool;
 const marker=boss?({easyBoss:'EB',mediumBoss:'MB',finalBoss:'FB'})[tier]:({easy:'E',medium:'M',hard:'H',legendary:'L',legendaryBoss:'LB'})[pool];
 const id=`PM2D1-${m.code}-${marker}-${String(index+1).padStart(3,'0')}`,[commonError,feedback]=lesson(s.skill);
 const q={id,sourceGame:SOURCE,q:s.stem,options:rotate(s.options,s.answer,index),tag:m.tag,type:s.type||'application',objective:m.objective,difficulty:boss?tier:lb?'legendaryBoss':pool,conceptCluster:m.cluster,primarySkill:s.skill,secondarySkills:s.secondarySkills||[],repairSkill:s.repairSkill||s.skill,commonError:s.commonError||commonError,feedback:s.feedback||feedback,aHash:answerHash(s.answer),canonicalId:id,sourceId:++serial,sourceChapter:m.chapter,sourcePool:boss?tier:s.skill,primaryConceptId:conceptId,secondaryConceptIds:s.secondaryConceptIds||[],instructionalRole:boss?'boss':lb?'legendaryBoss':pool,canonicalDifficulty,originalSourcePool:boss?tier:s.skill,originalBossTier:boss?tier:lb?'legendaryBoss':null,sourceCurationPhase:PHASE};
 if(s.image)q.image=s.image;if(boss)q.boss=({easyBoss:'Checkpoint One',mediumBoss:'Checkpoint Two',finalBoss:'Final Checkpoint'})[tier];if(lb)q.bossStage=s.bossStage;
 q.sourceHash=questionHash(q);q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:`${PHASE}_questions.json`,sourceGlobal:'questions',sourcePool:q.sourcePool,routeKey:q.primarySkill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];
 module.questions[pool].push(q);changes.push({questionId:id,canonicalConceptId:conceptId,action:'ADD',oldPool:null,newPool:boss?tier:pool,reason:s.reason||'Closes the verified Long-Run Macroeconomic Adjustment structural gap.'});return q;
}
function findQuestion(conceptId,id){for(const row of tagged(library.concepts[conceptId]))if(qid(row.question)===id)return row;throw new Error(`Question not found ${conceptId}/${id}`);}
function rewrite(conceptId,id,s,reason,action='BRIDGE_REWRITE'){
 const {pool,question:q}=findQuestion(conceptId,id),beforeHash=questionHash(q),oldSkill=q.primarySkill,oldRepairSkill=q.repairSkill;q.q=s.stem;q.options=rotate(s.options,s.answer,0);q.aHash=answerHash(s.answer);q.primarySkill=s.skill||q.primarySkill;q.repairSkill=s.repairSkill||s.skill||q.repairSkill;q.secondaryConceptIds=s.secondaryConceptIds||[];q.secondarySkills=s.secondarySkills||[];q.type=s.type||q.type||'bridge';const [commonError,feedback]=lesson(q.primarySkill);q.commonError=s.commonError||commonError;q.feedback=s.feedback||feedback;if(s.image!==undefined){if(s.image)q.image=s.image;else delete q.image;}setSourceHash(q);changes.push({questionId:id,canonicalConceptId:conceptId,action,oldPool:pool,newPool:pool,reason,beforeHash,afterHash:questionHash(q),oldSkill,newSkill:q.primarySkill,oldRepairSkill,newRepairSkill:q.repairSkill});
}
function metadataUpdate(conceptId,id,patch,reason,action='METADATA_FIX'){const {pool,question:q}=findQuestion(conceptId,id),beforeHash=questionHash(q);Object.assign(q,patch);setSourceHash(q);changes.push({questionId:id,canonicalConceptId:conceptId,action,oldPool:pool,newPool:pool,reason,beforeHash,afterHash:questionHash(q)});}

// Repair all nine pre-existing F8 Legendary Boss stages without changing question content.
const stageAssignments={
 'aggregate-demand':{'P52A-AD-LB-003':'opening','P52A-AD-LB-002':'middle','P52A-AD-LB-001':'final'},
 'aggregate-supply':{'P52A-AS-LB-003':'opening','P52A-AS-LB-002':'middle','P52A-AS-LB-001':'final'},
 'macroeconomic-equilibrium-and-shocks':{'P52B-S3-MEQS-LB-002':'opening','P52B-S3-MEQS-LB-001':'middle','P52B-S3-MEQS-LB-003':'final'}
};
for(const [conceptId,map] of Object.entries(stageAssignments))for(const [id,stage] of Object.entries(map)){const before=findQuestion(conceptId,id).question.bossStage??null;metadataUpdate(conceptId,id,{bossStage:stage},`Assigns semantically appropriate ${stage} stage without changing question content.`,'BOSS_STAGE_FIX');const last=changes.at(-1);last.beforeBossStage=before;last.afterBossStage=stage;}

// Turn four generic Bridges into explicit F7→F8→F9 conceptual links without increasing Bridge volume.
rewrite('aggregate-demand','ECON-SP-IDENTIFY-AD-SHIFTERS-6020',spec(
 'Business investment falls and shifts aggregate demand left. To determine the economy\'s new short-run real output and price level, what analysis comes next?',
 'Find the new intersection of aggregate demand and short-run aggregate supply.',
 ['Shift LRAS left by the same amount as investment falls.','Hold output fixed and change only the price level.','Calculate the money multiplier without using the AD–AS equilibrium.'],
 'identify_ad_shifters',{secondaryConceptIds:['macroeconomic-equilibrium-and-shocks'],commonError:'Stops after identifying an aggregate-demand shift and does not carry it into equilibrium analysis.',feedback:'After identifying the AD shift, use its intersection with SRAS to determine the new short-run output and price level.'}),
 'Converts a same-concept check into an explicit Aggregate Demand → Macroeconomic Equilibrium bridge.');
rewrite('aggregate-supply','ECON-SP-IDENTIFY-SRAS-SHIFTERS-6023',spec(
 'Oil prices fall and shift SRAS to the right while aggregate demand is unchanged. What should be done next to determine the macroeconomic outcome?',
 'Locate the new intersection of SRAS and aggregate demand to infer output and the price level.',
 ['Move along the old SRAS curve without finding a new equilibrium.','Shift LRAS right automatically because oil became cheaper.','Treat the change as an aggregate-demand shock and ignore SRAS.'],
 'identify_sras_shifters',{secondaryConceptIds:['macroeconomic-equilibrium-and-shocks'],commonError:'Identifies a supply shift but does not translate it into an equilibrium outcome.',feedback:'A supply shift changes the short-run equilibrium where the new SRAS curve intersects aggregate demand.'}),
 'Converts a same-concept check into an explicit Aggregate Supply → Macroeconomic Equilibrium bridge.');
rewrite('macroeconomic-equilibrium-and-shocks','ECON-SP-TRACE-DEMAND-SHOCK-6025',spec(
 'Consumer confidence collapses, shifting AD left and leaving real output below potential. With no new policy response, which process becomes relevant next?',
 'Weak wage and price pressures can shift SRAS right over time, moving output back toward potential.',
 ['Aggregate demand must automatically shift right to its original position.','LRAS must shift left until it reaches the depressed output level.','A permanent adverse supply shock must occur before output can recover.'],
 'trace_demand_shock',{secondaryConceptIds:['long-run-macroeconomic-adjustment'],commonError:'Stops at the short-run demand-shock outcome and does not connect the recessionary gap to long-run self-correction.',feedback:'A negative AD shock can create a recessionary gap; with no policy response, wage and expectation adjustment can shift SRAS right over time.'}),
 'Creates an explicit Macroeconomic Equilibrium/Shocks → Long-Run Adjustment bridge.');
rewrite('long-run-macroeconomic-adjustment','ECON-SP-EXPLAIN-LONG-RUN-ADJUSTMENT-6028',spec(
 'Output is above potential and self-correction through rising wages and costs is expected to be slow. If policymakers instead consider a deliberate demand-reducing intervention, which neighboring analysis becomes relevant?',
 'Stabilization policy—whether and how to use an active policy response instead of waiting for self-correction.',
 ['Money measurement—whether currency should be counted in M1 or M2.','Growth accounting—how much of productivity comes from capital deepening.','CPI measurement—whether the market basket overstates cost-of-living changes.'],
 'bridge_to_stabilization',{secondaryConceptIds:['stabilization-policy'],commonError:'Treats passive long-run adjustment and deliberate stabilization as the same mechanism.',feedback:'Long-run adjustment describes self-correction; stabilization policy asks whether policymakers should actively shift aggregate demand rather than wait.'}),
 'Creates an explicit Long-Run Adjustment → F9 Stabilization Policy bridge.');

const LR='long-run-macroeconomic-adjustment',IMG='question-assets/adaslras.webp';
// Exactly one new E/M/H item closes ordinary engine floors.
addQuestion(LR,'easy',spec(
 'Real GDP is below potential and labor-market slack is putting downward pressure on nominal wage growth. If aggregate demand does not change again, which adjustment helps the economy self-correct?',
 'SRAS shifts right as wage and production-cost pressures ease.',
 ['AD shifts right automatically because unemployment is high.','LRAS shifts left until it reaches the depressed output level.','SRAS shifts left because firms are producing below potential.'],
 'explain_long_run_adjustment'),0);
addQuestion(LR,'medium',spec(
 'A temporary demand boom pushes production above potential. Policymakers do nothing, and wage contracts are gradually renegotiated as workers and firms revise price expectations upward. Which change is most consistent with self-correction?',
 'Higher wages and input costs shift SRAS left while aggregate demand stays at its post-boom position.',
 ['Aggregate demand shifts left automatically as soon as wages rise.','LRAS shifts right because the economy briefly produced above potential.','SRAS shifts right because firms respond to the higher price level by cutting costs.'],
 'explain_long_run_adjustment'),0);
addQuestion(LR,'hard',spec(
 'A hurricane permanently destroys part of an economy\'s productive capital, and real GDP falls below its old potential level. Why would it be wrong to assume ordinary recessionary-gap self-correction must restore the old level of output?',
 'The loss of productive capital can shift LRAS left, so the economy\'s new potential output may be lower.',
 ['Any fall in real GDP forces aggregate demand to shift permanently left.','Nominal wages cannot adjust after a supply-side disturbance.','SRAS always shifts right enough to restore the pre-shock LRAS position.'],
 'lras_shift_vs_gap',{secondaryConceptIds:['aggregate-supply']}),0);

// Three Legendary items bring F8 ordinary Legendary depth to one clean 27-question run.
[
 spec('Refer to the graph. A demand increase has moved the economy to the intersection of AD2 and AS2 at Y2 and P2. If no policy reverses AD2 and long-run adjustment is completed, which comparison between the short-run and long-run effects is supported by the graph?',
 'The temporary output gain disappears as output returns to Y1, while the price level rises further toward P3.',
 ['Output remains at Y2 because long-run adjustment changes only the price level, which falls all the way back toward P1.','Output falls to Y3 as SRAS shifts left past AS1, while the price level stays fixed at the short-run level P2.','Both real output and the price level return to their original Y1 and P1 values once wage contracts and expectations adjust.'],
 'explain_long_run_adjustment',{image:IMG}),
 spec('Two economies have identical recessionary gaps. In Economy A, most wages can be reset monthly; in Economy B, most wages are fixed by three-year contracts. With no policy response, which prediction best follows from the long-run adjustment model?',
 'Economy A should tend to self-correct faster because wages and production costs can adjust sooner.',
 ['Economy B should self-correct faster because longer wage contracts make SRAS respond more quickly to the recessionary gap.','Both economies must return to potential at exactly the same speed because a vertical LRAS fixes the timing as well as the destination.','Neither economy can self-correct without an aggregate-demand policy change because wage and cost adjustment cannot move SRAS.'],
 'adjustment_speed'),
 spec('After a negative aggregate-demand shock, real output begins recovering toward potential even though policymakers make no fiscal or monetary change. Nominal wage growth has slowed and firms report easing unit labor costs. What is the strongest interpretation?',
 'The evidence is consistent with self-correction through a rightward SRAS shift, not necessarily an active stabilization policy.',
 ['The recovery proves aggregate demand was shifted right by discretionary policy even though no fiscal or monetary action is observed.','The evidence requires LRAS to have shifted left until it met current output, converting the recessionary gap into long-run equilibrium.','The recovery shows wage adjustment is irrelevant because only changes in aggregate demand can move real output back toward potential.'],
 'self_correction_vs_policy',{secondaryConceptIds:['stabilization-policy']})
].forEach((s,i)=>addQuestion(LR,'legendary',s,i));

// Two additions to each regular boss tier close the missing checkpoint geometry.
[
 spec('Output is below potential and unemployment is unusually high. If policymakers do nothing, which pressure is part of the opening self-correction mechanism?',
 'Weak labor demand restrains wage and cost growth, creating pressure for SRAS to shift right.',
 ['High unemployment automatically shifts aggregate demand right.','Weak labor demand shifts LRAS left by definition.','High unemployment causes SRAS to shift left through higher wage growth.'],
 'explain_long_run_adjustment',{tier:'easyBoss'}),
 spec('Refer to the graph. If the economy is operating at Y3 rather than the LRAS level Y1, which condition is consistent with the gap shown?',
 'A recessionary gap with unemployment above its natural rate.',
 ['An inflationary gap with unemployment below its natural rate.','Long-run equilibrium with no pressure on wages or expected prices.','A permanent increase in potential output from Y1 to Y3.'],
 'classify_output_gap',{tier:'easyBoss',image:IMG})
].forEach((s,i)=>addQuestion(LR,'boss',s,i));
[
 spec('An economy is above potential because of a temporary surge in household spending. Which observation would be the strongest evidence that long-run self-correction has begun?',
 'Nominal wage and unit-cost growth are rising, putting leftward pressure on SRAS.',
 ['Potential output is falling simply because current output is high.','Aggregate demand is automatically shifting left with no change in spending.','Nominal wage growth is falling, pushing SRAS farther to the right.'],
 'explain_long_run_adjustment',{tier:'mediumBoss'}),
 spec('Refer to the graph. At AD1 and AS1 the economy is at Y3, below Y1. If AD1 remains fixed, which change must occur for self-correction toward Y1?',
 'Falling wage and price expectations shift SRAS right from AS1 toward AS2.',
 ['Aggregate demand shifts from AD1 to AD2 while SRAS remains at AS1.','LRAS shifts left from Y1 to Y3 because output is currently low.','SRAS shifts farther left from AS1, reducing output below Y3.'],
 'explain_long_run_adjustment',{tier:'mediumBoss',image:IMG})
].forEach((s,i)=>addQuestion(LR,'boss',s,i+2));
[
 spec('Real GDP is below its old potential level after a permanent decline in labor-force participation. Which diagnostic prevents a mistaken forecast that ordinary self-correction must restore the old output level?',
 'Check whether LRAS itself shifted left; if potential output fell, the old level is no longer the long-run anchor.',
 ['Assume every output decline is caused by aggregate demand.','Hold LRAS fixed because productive capacity cannot change.','Assume falling wages always restore the pre-shock quantity of labor and output.'],
 'lras_shift_vs_gap',{tier:'finalBoss',secondaryConceptIds:['aggregate-supply']}),
 spec('Refer to the graph. The economy begins at AD1-AS2 at Y1 and then a demand boom shifts AD to AD2, moving output to Y2. With no policy response, which pair of changes completes long-run adjustment?',
 'SRAS shifts left toward AS1; output returns to Y1 while the price level rises toward P3.',
 ['AD shifts back to AD1 automatically; output returns to Y1 at P1.','LRAS shifts right to Y2; output remains above its original potential.','SRAS shifts right beyond AS2; output rises further while the price level falls.'],
 'explain_long_run_adjustment',{tier:'finalBoss',image:IMG})
].forEach((s,i)=>addQuestion(LR,'boss',s,i+4));

// Three Legendary Bosses create a complete opening → middle → final scaffold for Long-Run Adjustment.
[
 spec('A negative demand shock leaves the economy below potential, and no policy response occurs. Which statement best identifies the long-run adjustment mechanism before tracing the details?',
 'Slack puts downward pressure on wages and expected prices, allowing SRAS to shift right.',
 ['Aggregate demand must automatically shift right enough to restore potential output without any change in wages or expectations.','LRAS must move left until it passes through current output, eliminating the gap without any cost adjustment.','High unemployment raises wage growth and shifts SRAS left, moving output even farther below potential.'],
 'explain_long_run_adjustment',{bossStage:'opening'}),
 spec('Refer to the graph. Starting at AD1-AS1 at Y3, expected prices and nominal cost pressures fall gradually while AD1 stays fixed. Which sequence is consistent with the model?',
 'SRAS moves toward AS2, output rises toward Y1, and the price level falls toward P1.',
 ['SRAS moves farther left from AS1, pushing output below Y3 while the price level rises above its starting point.','AD shifts to AD2 and output jumps to Y2 even though the prompt holds aggregate demand fixed throughout the adjustment.','LRAS shifts left from Y1 to Y3, redefining the depressed output level as potential without any wage or expectation adjustment.'],
 'explain_long_run_adjustment',{bossStage:'middle',image:IMG}),
 spec('An economy has a recessionary gap after aggregate demand falls. While wages are adjusting downward, a permanent productivity improvement raises productive capacity. Which conclusion best separates the two long-run forces?',
 'SRAS adjustment helps close the demand-created gap, while higher productivity can shift LRAS right and change the potential-output target.',
 ['Both changes should be treated as the same SRAS movement, because productive capacity does not affect the location of LRAS in this model.','The productivity gain shifts aggregate demand right while wage adjustment shifts LRAS left, so both forces alter potential output in opposite directions.','The original demand shock permanently fixes real output below potential, so neither wage adjustment nor improved productivity can change the long-run outcome.'],
 'lras_shift_vs_gap',{bossStage:'final',secondaryConceptIds:['aggregate-supply']})
].forEach((s,i)=>addQuestion(LR,'legendaryBoss',s,i));

// Add accessibility metadata to the six existing F8 concept-scoped asset records; no image bytes change.
const assetDescriptions={
 'adas1.webp':{imageAlt:'Aggregate demand and short-run aggregate supply graph with two AD curves, two AS curves, and labeled output-price combinations.',graphDescription:'The horizontal axis is real output Y and the vertical axis is the price level. AD1 and AD2 slope downward, with AD2 to the right of AD1. AS1 and AS2 slope upward, with AS1 above/left of AS2. Dashed guides mark Y3, Y1, Y2 and P1, P2, P3. AD1 intersects AS2 at Y1/P1, AD1 intersects AS1 at Y3/P2, AD2 intersects AS2 at Y2/P2, and AD2 intersects AS1 at Y1/P3.'},
 'adaslras.webp':{imageAlt:'AD-AS graph with LRAS at Y1, two aggregate-demand curves, two short-run aggregate-supply curves, and labeled gaps.',graphDescription:'The horizontal axis is real output Y and the vertical axis is the price level. LRAS is vertical at Y1. AD1 and AD2 slope downward, with AD2 to the right of AD1. AS1 and AS2 slope upward, with AS1 above/left of AS2. Dashed guides mark Y3 left of LRAS, Y1 on LRAS, Y2 right of LRAS, and price levels P1, P2, P3. AD1-AS2 is Y1/P1; AD1-AS1 is Y3/P2; AD2-AS2 is Y2/P2; AD2-AS1 is Y1/P3.'}
};
let assetMetadataCopies=0;
for(const cid of familyIds){const module=library.concepts[cid];for(const rec of module.assetMetadata||[]){const desc=assetDescriptions[rec.filename];if(desc){Object.assign(rec,desc);assetMetadataCopies++;}}for(const rec of library.assetInventory||[]){if(rec.conceptId===cid&&assetDescriptions[rec.filename])Object.assign(rec,assetDescriptions[rec.filename]);}for(const rec of manifest.assets||[]){if(rec.conceptId===cid&&assetDescriptions[rec.filename])Object.assign(rec,assetDescriptions[rec.filename]);}}

const afterCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
const expected={
 'aggregate-demand':{total:47,easy:6,medium:6,hard:6,elite:4,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:5,bridge:2},
 'aggregate-supply':{total:51,easy:6,medium:6,hard:7,elite:4,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:6,bridge:4},
 'macroeconomic-equilibrium-and-shocks':{total:59,easy:7,medium:8,hard:7,elite:7,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:9,bridge:3},
 'long-run-macroeconomic-adjustment':{total:49,easy:6,medium:6,hard:6,elite:6,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:5,bridge:2}
};
for(const [cid,target] of Object.entries(expected))for(const [key,val] of Object.entries(target))if(afterCounts[cid][key]!==val)throw new Error(`Count mismatch ${cid} ${key}: ${afterCounts[cid][key]} != ${val}`);
const added=changes.filter(c=>c.action==='ADD').length;if(added!==15)throw new Error(`Expected 15 additions; got ${added}`);
const bossStageFixed=changes.filter(c=>c.action==='BOSS_STAGE_FIX').length;if(bossStageFixed!==9)throw new Error(`Expected 9 bossStage fixes; got ${bossStageFixed}`);
const bridgeRewritten=changes.filter(c=>c.action==='BRIDGE_REWRITE').length;if(bridgeRewritten!==4)throw new Error(`Expected 4 bridge rewrites; got ${bridgeRewritten}`);

// Static duplication and answer-length guards on changed content.
const changedContentIds=new Set(changes.filter(c=>['ADD','REPAIR_REWRITE','BRIDGE_REWRITE','QUALITY_REWRITE'].includes(c.action)).map(c=>c.questionId));
const allF8=familyIds.flatMap(cid=>unique(library.concepts[cid]).map(({pool,question})=>({cid,pool,question})));
const normalize=t=>String(t||'').toLowerCase().replace(/[^a-z0-9%$]+/g,' ').replace(/\s+/g,' ').trim();
const stemMap=new Map(),tplMap=new Map(),introducedExact=[],introducedNumberSwaps=[];
for(const r of allF8){const id=qid(r.question),stem=normalize(r.question.q),tpl=stem.replace(/\b\d+(?:[.,]\d+)?%?\b/g,'#');if(stemMap.has(stem)&&(changedContentIds.has(id)||changedContentIds.has(stemMap.get(stem))))introducedExact.push([stemMap.get(stem),id]);else if(!stemMap.has(stem))stemMap.set(stem,id);if(tplMap.has(tpl)&&(changedContentIds.has(id)||changedContentIds.has(tplMap.get(tpl))))introducedNumberSwaps.push([tplMap.get(tpl),id]);else if(!tplMap.has(tpl))tplMap.set(tpl,id);}
if(introducedExact.length)throw new Error(`Introduced exact duplicate ${JSON.stringify(introducedExact)}`);if(introducedNumberSwaps.length)throw new Error(`Introduced number-swap ${JSON.stringify(introducedNumberSwaps)}`);
function wc(t){return String(t||'').trim().split(/\s+/).filter(Boolean).length;}const lengthIssues=[];
for(const cid of familyIds){const groups={};for(const {pool,question:q} of unique(library.concepts[cid]))if(changedContentIds.has(qid(q))){const correct=(q.options||[]).find(o=>answerHash(o)===q.aHash),dist=(q.options||[]).filter(o=>o!==correct),g=pool;(groups[g]||=[]).push({c:wc(correct),d:dist.map(wc)});}for(const [g,rows] of Object.entries(groups)){const longest=rows.filter(r=>r.d.every(n=>r.c>n)).length/rows.length,cm=rows.reduce((a,r)=>a+r.c,0)/rows.length,dm=rows.reduce((a,r)=>a+r.d.reduce((x,y)=>x+y,0)/r.d.length,0)/rows.length,ratio=cm/dm;if(rows.length>=2&&(longest>.70||ratio>1.8))lengthIssues.push({cid,g,longest:Number(longest.toFixed(3)),ratio:Number(ratio.toFixed(3))});}}
if(lengthIssues.length)throw new Error(`Answer length issue ${JSON.stringify(lengthIssues)}`);

const protectedAfter=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));const protectedMismatches=protectedIds.filter(id=>protectedAfter[id]!==protectedBefore[id]);if(protectedMismatches.length)throw new Error(`Protected non-F8 bank changed: ${protectedMismatches.join(',')}`);

function calcLinked(q){return q.type==='calculation'||(/calculate|multiplier|required_rate|ad_effect/.test(String(q.primarySkill||''))&&/\d/.test(String(q.q||'')));}
function updateRegistryEntry(entry,module){const records=unique(module).map(x=>x.question),ordinary=['easy','medium','hard'].flatMap(pool=>module.questions[pool]||[]),boss=module.questions.boss||[];const role={boss:boss.length,bridge:(module.bridgeQuestions||[]).length,calculation:(module.questions.calculation||[]).length,elite:(module.questions.elite||[]).length,integration:(module.questions.integration||[]).length,legendary:(module.questions.legendary||[]).length,legendaryBoss:(module.questions.legendaryBoss||[]).length,main:ordinary.length,repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length};const diff={easy:(module.questions.easy||[]).length+boss.filter(q=>bossTier(q)==='easyBoss').length,medium:(module.questions.medium||[]).length+boss.filter(q=>bossTier(q)==='mediumBoss').length,hard:(module.questions.hard||[]).length+boss.filter(q=>bossTier(q)==='finalBoss').length,elite:(module.questions.elite||[]).length,legendary:(module.questions.legendary||[]).length+(module.questions.legendaryBoss||[]).length,unknown:(module.repairQuestions||[]).length+(module.repairSeedQuestions||[]).length+(module.bridgeQuestions||[]).length};Object.assign(entry,{includedSkills:[...new Set(records.map(q=>q.primarySkill).filter(Boolean))].sort(),questionCountByRole:role,questionCountByDifficulty:diff,repairCoverage:{directSkillMatches:(module.repairQuestions||[]).length,mainWithUsableSkill:records.length},bridgeCoverage:{directSkillMatches:(module.bridgeQuestions||[]).length,mainWithUsableSkill:records.length},calculationCoverage:records.filter(calcLinked).length,graphCoverage:records.filter(q=>Boolean(q.image)).length,instructionalClassification:'Engine-safe F8 AD-AS and Macroeconomic Equilibrium family slice',coverageStatus:'ready-family-slice',coverageStatusLabel:'Engine-safe alone; strongest as AD/AS → Equilibrium → Long-Run Adjustment sequence',coverageStatusNote:'Phase M2d-1 preserves healthy AD, AS, and equilibrium content; closes Long-Run Adjustment ordinary, checkpoint, and Legendary floors; repairs all F8 Legendary boss stages; strengthens genuine cross-concept Bridges; and adds accessibility metadata to existing AD-AS assets.',coverageFloorVersion:PHASE,notes:'AD-AS and macro-equilibrium family slice. No new graph image was added; existing AD-AS and AD-AS-LRAS assets are reused only where graph evidence is necessary.'});}
for(const cid of familyIds)for(const list of [library.registry.concepts,registry.concepts]){const e=list.find(x=>x.canonicalConceptId===cid);if(!e)throw new Error(`Registry missing ${cid}`);updateRegistryEntry(e,library.concepts[cid]);}

library.libraryVersion=`${previousVersion}-${PHASE}`;library.sourceCurationPhase=PHASE;library.generatedAt=STAMP;library.canonicalQuestionCount=Object.values(library.concepts).reduce((n,m)=>n+unique(m).length,0);Object.assign(library.registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});Object.assign(registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});delete library.librarySha256;library.librarySha256=sha(JSON.stringify(stable(library)));registry.librarySha256=library.librarySha256;Object.assign(manifest,{canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:STAMP});
const familyBefore=Object.values(beforeCounts).reduce((o,r)=>{for(const [k,v] of Object.entries(r))o[k]=(o[k]||0)+v;return o;},{}),familyAfter=Object.values(afterCounts).reduce((o,r)=>{for(const [k,v] of Object.entries(r))o[k]=(o[k]||0)+v;return o;},{});if(familyBefore.total!==191||familyAfter.total!==206)throw new Error(`Unexpected F8 totals ${familyBefore.total} -> ${familyAfter.total}`);
const provenance={phase:PHASE,generatedAt:STAMP,scope:{family:'F8 — AD-AS and Macroeconomic Equilibrium',modifiedCanonicalConceptIds:familyIds,protectedCanonicalConceptIds:protectedIds},before:{libraryVersion:previousVersion,canonicalQuestionCount:beforeTotal,counts:beforeCounts,familyCounts:familyBefore},after:{libraryVersion:library.libraryVersion,canonicalQuestionCount:library.canonicalQuestionCount,librarySha256:library.librarySha256,counts:afterCounts,familyCounts:familyAfter},protectedSummary:{canonicalBanksChecked:protectedIds.length,nonF8Mismatches:protectedMismatches},quality:{introducedExact,introducedNumberSwaps,answerLengthIssues:lengthIssues},assetAccessibility:{metadataUpdatedCopies:assetMetadataCopies,newGraphAssets:0}};
const sourceData={phase:PHASE,generatedAt:STAMP,scope:familyIds,changes,summary:{added,bossStageFixed,bridgeRewritten,assetMetadataCopiesUpdated:assetMetadataCopies,removed:0,relocated:0},authoringPolicy:{targetRange:[206,212],actualFamilyTotal:familyAfter.total,protectedSlices:['aggregate-demand','aggregate-supply','macroeconomic-equilibrium-and-shocks'],primaryBuildTarget:'long-run-macroeconomic-adjustment',newGraphAssets:0,legendaryOrdinaryTarget:27,bridgeChain:['monetary-policy-transmission','aggregate-demand','macroeconomic-equilibrium-and-shocks','long-run-macroeconomic-adjustment','stabilization-policy']},quality:provenance.quality};
if(!dryRun){fs.writeFileSync(libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(path.join(composer,`${PHASE}_questions.json`),JSON.stringify(sourceData,null,2)+'\n');fs.writeFileSync(path.join(composer,`${PHASE}.json`),JSON.stringify(provenance,null,2)+'\n');for(const file of [path.join(repo,'build','index.html'),path.join(composer,'index.html')])if(fs.existsSync(file)){let text=fs.readFileSync(file,'utf8');text=text.replaceAll('20260810-macro-m2c3-money-market-transmission-v1','20260810-macro-m2d1-ad-as-macro-equilibrium-v1');fs.writeFileSync(file,text);}}
console.log(JSON.stringify({dryRun,phase:PHASE,beforeTotal,afterTotal:library.canonicalQuestionCount,added,bossStageFixed,bridgeRewritten,assetMetadataCopies,beforeCounts,afterCounts,familyBefore,familyAfter,protectedMismatches,quality:{introducedExact,introducedNumberSwaps,lengthIssues},changeSummary:sourceData.summary},null,2));
