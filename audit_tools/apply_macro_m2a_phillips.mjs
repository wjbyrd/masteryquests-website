import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repo = path.resolve(process.argv[2] || process.cwd());
const dryRun = process.argv.includes('--dry-run');
const allowQuality = process.argv.includes('--allow-quality');
const PHASE = 'phaseM2a-phillips-disinflation-family-maturation-v1';
const STAMP = '2026-08-10T18:00:00.000Z';
const SOURCE = 'macro-m2a-phillips-family';
const ids = ['short-run-phillips-curve','phillips-curve-expectations','long-run-phillips-curve','sacrifice-ratio','disinflation-and-policy'];
const idSet = new Set(ids);
const composer = path.join(repo,'build','faculty-build-composer');
const dataDir = path.join(composer,'data');
const libraryPath = path.join(dataDir,'composer_library.js');
const registryPath = path.join(dataDir,'composer_registry.json');
const manifestPath = path.join(dataDir,'composer_library_manifest.json');

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key,stable(value[key])])) : value;
const answerHash = answer => sha(String(answer).trim().replace(/\s+/g,' ').toLowerCase());
const qid = q => String(q?.canonicalId || q?.id || q?.questionId || '');
const questionHash = q => sha(JSON.stringify({q:q.q,options:q.options,aHash:q.aHash,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds || []}));
const loadLibrary = raw => { const sandbox={window:{}}; vm.createContext(sandbox); vm.runInContext(raw,sandbox,{filename:libraryPath}); return sandbox.window.MQ_COMPOSER_LIBRARY; };
const rawBefore = fs.readFileSync(libraryPath,'utf8');
const library = loadLibrary(rawBefore);
const registry = JSON.parse(fs.readFileSync(registryPath,'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));

if(!String(library.libraryVersion).endsWith('phase7.7-general-economics-final-maturation-v1')) throw new Error('Unexpected live baseline: Phase 7.7 library required.');
for(const id of ids) if(!library.concepts[id]) throw new Error(`Missing canonical F10 concept: ${id}`);

function tagged(module){
  return [
    ...Object.entries(module.questions || {}).flatMap(([pool,list]) => (list || []).map(question => ({pool,question}))),
    ...(module.repairQuestions || []).map(question => ({pool:'repair',question})),
    ...(module.repairSeedQuestions || []).map(question => ({pool:'repairSeed',question})),
    ...(module.bridgeQuestions || []).map(question => ({pool:'bridge',question}))
  ];
}
function unique(module){ const seen=new Set(); return tagged(module).filter(({question}) => { const id=qid(question); if(seen.has(id)) return false; seen.add(id); return true; }); }
function bankSnapshot(module){ return unique(module).map(({pool,question}) => ({pool,id:qid(question),question:stable(question)})).sort((a,b)=>a.id.localeCompare(b.id)); }
function bankHash(module){ return sha(JSON.stringify(stable(bankSnapshot(module)))); }

const protectedIds = Object.keys(library.concepts).filter(id => !idSet.has(id));
const protectedBefore = Object.fromEntries(protectedIds.map(id => [id,bankHash(library.concepts[id])]));
const beforeCounts = Object.fromEntries(ids.map(id => [id,countModule(library.concepts[id])]));
const beforeTotal = library.canonicalQuestionCount;
const changes=[];
const reviews=[];
let serial=8200000;

const lessons={
  srpc_relation:['Treats the short-run association as a permanent menu of policy choices.','On a given SRPC, lower unemployment is associated with higher inflation only in the short run.'],
  srpc_movement:['Shifts the entire SRPC when aggregate demand changes unexpectedly.','With expected inflation initially fixed, a demand change moves the economy along the current SRPC.'],
  srpc_shift:['Calls a supply or expectations shock a movement along one unchanged SRPC.','A changed inflation-unemployment relationship shifts the SRPC; it is not movement along the same curve.'],
  expected_inflation_shift:['Moves along the SRPC instead of shifting it when expected inflation changes.','Higher expected inflation shifts the SRPC upward; lower expected inflation shifts it downward.'],
  expectations_adjustment:['Assumes a surprise to actual inflation remains a surprise indefinitely.','As expected inflation adapts, the temporary unemployment effect fades and the SRPC shifts.'],
  credibility_expectations:['Assumes credibility mechanically eliminates every short-run output cost.','Credibility can speed expectations adjustment, but disinflation costs depend on model assumptions and wage-price adjustment.'],
  lrpc_vertical:['Infers a permanent unemployment gain from the downward-sloping SRPC.','The LRPC is vertical at the natural rate because expected inflation adjusts in the long run.'],
  natural_rate_shift:['Moves the economy along a fixed LRPC when the natural rate changes.','A change in labor-market structure can shift the vertical LRPC to a new natural rate.'],
  long_run_adjustment:['Stops the causal chain at the initial short-run Phillips movement.','Expected inflation adjusts, the SRPC shifts, and unemployment returns toward its natural rate.'],
  sacrifice_ratio_meaning:['Treats the sacrifice ratio as an inflation rate or unemployment change.','The sacrifice ratio measures cumulative output loss per percentage-point reduction in inflation.'],
  sacrifice_ratio_denominator:['Uses the final inflation rate rather than the reduction in inflation.','The denominator is the fall in inflation measured in percentage points.'],
  sacrifice_ratio_calculation:['Mixes annual and cumulative output loss or omits units.','Add output-gap losses across the disinflation period, then divide by the percentage-point inflation reduction.'],
  disinflation_definition:['Confuses a lower positive inflation rate with a falling price level.','Disinflation is a decline in the inflation rate; deflation is a decline in the price level.'],
  disinflation_policy:['Claims contractionary policy lowers inflation with no short-run output or unemployment cost.','Contraction reduces aggregate demand and inflation pressure, normally creating a short-run output gap and higher unemployment.'],
  policy_path:['Assumes either rapid or gradual disinflation is unconditionally best.','The preferred path depends on credibility, expectations, adjustment speed, uncertainty, and cumulative costs.']
};
function lesson(skill){ return lessons[skill] || ['Uses a surface cue instead of the Phillips-curve mechanism.','Trace inflation, unemployment, expectations, and the natural rate in the required time horizon.']; }
function rotate(options,answer,index){ const n=index%options.length; const out=options.slice(n).concat(options.slice(0,n)); if(!out.includes(answer)) throw new Error(`Answer missing: ${answer}`); return out; }
function spec(stem,answer,wrong,skill,extra={}){ return {stem,answer,options:[answer,...wrong],skill,...extra}; }

const codeById={
  'short-run-phillips-curve':'SRPC',
  'phillips-curve-expectations':'EXP',
  'long-run-phillips-curve':'LRPC',
  'sacrifice-ratio':'SAC',
  'disinflation-and-policy':'DIS'
};
function addQuestion(conceptId,pool,s,index){
  const module=library.concepts[conceptId];
  const boss=pool==='boss';
  const lb=pool==='legendaryBoss';
  const repair=pool==='repair';
  const bridge=pool==='bridge';
  const tier=boss?s.tier:null;
  const canonicalDifficulty=boss?({easyBoss:'easy',mediumBoss:'medium',finalBoss:'hard'})[tier]:lb?'legendary':repair||bridge?'unknown':pool;
  const marker=boss?({easyBoss:'EB',mediumBoss:'MB',finalBoss:'FB'})[tier]:({easy:'E',medium:'M',hard:'H',legendary:'L',legendaryBoss:'LB',repair:'R',bridge:'BR'})[pool];
  const id=`PM2A-${codeById[conceptId]}-${marker}-${String(index+1).padStart(3,'0')}`;
  const [commonError,feedback]=lesson(s.skill);
  const q={
    id,sourceGame:SOURCE,q:s.stem,options:rotate(s.options,s.answer,index),tag:conceptId.replaceAll('-','_'),type:s.type || (bridge?'bridge':repair?'repair':'application'),objective:'MACRO.M2A',difficulty:boss?tier:lb?'legendaryBoss':repair?'microRepair':bridge?'microBridge':pool,conceptCluster:'macro_phillips_disinflation',primarySkill:s.skill,secondarySkills:s.secondarySkills || [],repairSkill:s.skill,commonError:s.commonError || commonError,feedback:s.feedback || feedback,aHash:answerHash(s.answer),canonicalId:id,sourceId:++serial,sourceChapter:[35],sourcePool:boss?tier:s.skill,primaryConceptId:conceptId,secondaryConceptIds:s.secondaryConceptIds || [],instructionalRole:boss?'boss':lb?'legendaryBoss':repair?'repair':bridge?'bridge':pool,canonicalDifficulty,originalSourcePool:boss?tier:s.skill,originalBossTier:boss?tier:lb?'legendaryBoss':null,sourceCurationPhase:PHASE
  };
  if(s.image) q.image=s.image;
  if(s.roundingRule) q.roundingRule=s.roundingRule;
  if(boss) q.boss=({easyBoss:'Checkpoint One',mediumBoss:'Checkpoint Two',finalBoss:'Final Checkpoint'})[tier];
  if(lb) q.bossStage=s.bossStage || ['opening','middle','final'][index%3];
  q.sourceHash=questionHash(q);
  q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:'phaseM2a-phillips-disinflation-family-maturation-v1_questions.json',sourceGlobal:repair?'microSkillRepairPools':bridge?'microSkillBridgePools':'questions',sourcePool:q.sourcePool,routeKey:q.primarySkill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];
  const target=repair?module.repairQuestions:bridge?module.bridgeQuestions:module.questions[pool];
  target.push(q);
  changes.push({canonicalConceptId:conceptId,questionId:id,action:'ADD',oldPool:null,newPool:boss?tier:pool,reason:s.reason || 'Closes a verified engine floor or family progression gap.'});
  return q;
}
function rewriteAux(conceptId,kind,specs){
  const module=library.concepts[conceptId];
  const rows=kind==='repair'?module.repairQuestions:module.bridgeQuestions;
  if(rows.length!==specs.length) throw new Error(`${conceptId} ${kind} rewrite count changed: ${rows.length} != ${specs.length}`);
  rows.forEach((q,index)=>{
    const s=specs[index],before={q:q.q,options:q.options,aHash:q.aHash,primarySkill:q.primarySkill,secondaryConceptIds:q.secondaryConceptIds || [],commonError:q.commonError || '',feedback:q.feedback || ''};
    const [commonError,feedback]=lesson(s.skill);
    Object.assign(q,{q:s.stem,options:rotate(s.options,s.answer,index),aHash:answerHash(s.answer),primarySkill:s.skill,repairSkill:s.skill,secondarySkills:s.secondarySkills || [],primaryConceptId:conceptId,secondaryConceptIds:s.secondaryConceptIds || [],commonError:s.commonError || commonError,feedback:s.feedback || feedback,type:kind,sourceCurationPhase:PHASE});
    if(s.image) q.image=s.image; else delete q.image;
    q.sourceHash=questionHash(q);
    q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:'phaseM2a-phillips-disinflation-family-maturation-v1_questions.json',sourceGlobal:kind==='repair'?'microSkillRepairPools':'microSkillBridgePools',sourcePool:q.sourcePool || s.skill,routeKey:s.skill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];
    changes.push({canonicalConceptId:conceptId,questionId:qid(q),action:kind==='repair'?'REPAIR_REWRITE':'BRIDGE_REWRITE',oldPool:kind,newPool:kind,reason:kind==='repair'?'Converted a weak generic check into a one-error diagnostic repair.':'Converted a same-skill check into an explicit routed concept connection.',before,after:{q:q.q,options:q.options,aHash:q.aHash,primarySkill:q.primarySkill,secondaryConceptIds:q.secondaryConceptIds,commonError:q.commonError,feedback:q.feedback}});
  });
}
function qualityRewrite(conceptId,questionId,s,index=0){
  const module=library.concepts[conceptId],row=tagged(module).find(({question})=>qid(question)===questionId);if(!row)throw new Error(`Quality rewrite missing ${questionId}`);const q=row.question,before={q:q.q,options:q.options,aHash:q.aHash,primarySkill:q.primarySkill,commonError:q.commonError||'',feedback:q.feedback||''};const [commonError,feedback]=lesson(s.skill);Object.assign(q,{q:s.stem,options:rotate(s.options,s.answer,index),aHash:answerHash(s.answer),primarySkill:s.skill,repairSkill:s.skill,commonError:s.commonError||commonError,feedback:s.feedback||feedback,sourceCurationPhase:PHASE});if(s.image)q.image=s.image;q.sourceHash=questionHash(q);q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:'phaseM2a-phillips-disinflation-family-maturation-v1_questions.json',sourceGlobal:'questions',sourcePool:row.pool,routeKey:s.skill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];changes.push({canonicalConceptId:conceptId,questionId,action:'QUALITY_FIX',oldPool:row.pool,newPool:row.pool,reason:s.reason||'Replaced a material near-duplicate or number-swap task with a distinct cognitive structure.',before,after:{q:q.q,options:q.options,aHash:q.aHash,primarySkill:q.primarySkill,commonError:q.commonError,feedback:q.feedback}});
}

function countModule(module){
  const out={easy:0,medium:0,hard:0,elite:0,legendary:0,easyBoss:0,mediumBoss:0,finalBoss:0,legendaryBoss:0,repair:module.repairQuestions?.length||0,repairSeed:module.repairSeedQuestions?.length||0,bridge:module.bridgeQuestions?.length||0,total:unique(module).length};
  for(const p of ['easy','medium','hard','elite','legendary']) out[p]=(module.questions?.[p]||[]).length;
  for(const q of module.questions?.boss||[]) out[q.difficulty]=(out[q.difficulty]||0)+1;
  out.legendaryBoss=(module.questions?.legendaryBoss||[]).length;
  return out;
}

const srpc={
  medium:[
    spec('Aggregate demand rises unexpectedly while expected inflation is fixed. Which Phillips-curve change best represents the immediate effect?','A move up and left along the current SRPC',['An upward shift of the SRPC at every unemployment rate','A rightward shift of the vertical LRPC','A move down and right along the current SRPC'],'srpc_movement'),
    spec('Inflation and unemployment both rise after a sharp increase in energy costs. What is the best diagnosis?','The adverse supply shock shifts the SRPC upward',['Aggregate demand causes movement up one unchanged SRPC','Lower expected inflation shifts the SRPC downward','The natural rate necessarily falls and shifts LRPC left'],'srpc_shift')
  ],
  hard:[
    spec('Two years have the same unemployment rate, but inflation is higher in the second after wage setters revise expected inflation upward. What changed?','The economy is on a higher SRPC',['The economy moved up one unchanged SRPC','The LRPC became downward sloping','Aggregate demand alone fixed both outcomes'],'srpc_shift')
  ],
  legendary:[
    spec('A demand expansion moves the economy to lower unemployment and higher inflation. A year later unemployment returns to its original rate while inflation remains higher. Which sequence fits?','Movement along an SRPC followed by an upward SRPC shift',['Two movements along one permanently fixed SRPC','An LRPC shift left followed by falling expectations','A supply improvement followed by movement down the SRPC'],'long_run_adjustment',{secondaryConceptIds:['phillips-curve-expectations','long-run-phillips-curve']}),
    spec('An adverse supply shock raises inflation while output falls. How should the AD-AS result transfer to the Phillips model?','Higher inflation and unemployment indicate an upward SRPC shift',['Higher inflation and lower unemployment indicate movement along SRPC','Lower inflation and unemployment indicate a downward SRPC shift','Unchanged inflation with lower unemployment indicates an LRPC shift'],'srpc_shift',{secondaryConceptIds:['aggregate-supply','macroeconomic-equilibrium-and-shocks']}),
    spec('A policymaker cites the downward-sloping SRPC as proof that permanently higher inflation will secure permanently lower unemployment. What is the decisive flaw?','Expected inflation adjusts, so the short-run unemployment gain is not permanent',['The SRPC actually slopes upward for every demand change','Inflation cannot respond to aggregate demand in the short run','The natural rate is always zero after an expansion'],'srpc_relation',{secondaryConceptIds:['phillips-curve-expectations','long-run-phillips-curve']})
  ],
  boss:[
    {...spec('On a given SRPC, which combination lies farther up and left?','Higher inflation and lower unemployment',['Lower inflation and higher unemployment','Higher inflation and higher unemployment','Lower inflation and lower unemployment'],'srpc_relation'),tier:'easyBoss'},
    {...spec('Expected inflation is unchanged and aggregate demand falls. What happens first?','The economy moves down and right along its SRPC',['The SRPC shifts upward at every unemployment rate','The LRPC shifts left of the natural rate','The economy moves up and left along its SRPC'],'srpc_movement'),tier:'easyBoss'},
    {...spec('Which event most directly shifts rather than moves along the SRPC?','A change in expected inflation',['An unexpected change in aggregate demand','A temporary change in real spending','A movement between two points on one curve'],'srpc_shift'),tier:'easyBoss'},
    {...spec('A demand boom first lowers unemployment, then wage expectations catch up. Which complete Phillips sequence is most defensible?','Move up-left along SRPC, then shift SRPC upward toward the natural rate',['Shift LRPC left, then move down the same SRPC as expectations rise','Shift SRPC downward, then keep unemployment permanently below natural','Move down-right along SRPC, then shift LRPC right after wages adjust'],'long_run_adjustment',{secondaryConceptIds:['phillips-curve-expectations','long-run-phillips-curve']}),tier:'finalBoss'},
    {...spec('A supply disruption raises inflation and unemployment together. Which interpretation survives both the graph and mechanism tests?','The SRPC shifts upward because the tradeoff worsens',['The economy moves up-left along a fixed SRPC','The LRPC shifts left because inflation increased','The SRPC shifts downward because output fell'],'srpc_shift',{secondaryConceptIds:['aggregate-supply']}),tier:'finalBoss'},
    {...spec('A central bank unexpectedly expands demand. Which claim correctly separates the short run from the long run?','Unemployment may fall temporarily, but expectations adjustment removes the permanent tradeoff',['Unemployment falls permanently because the SRPC stays downward sloping after expectations adjust','The SRPC immediately becomes vertical before output or nominal wages can change','Inflation falls temporarily and remains lower after all contracts adjust'],'srpc_relation',{secondaryConceptIds:['long-run-phillips-curve']}),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('A demand expansion moves unemployment below natural. Wage contracts later incorporate the higher inflation. What is the next Phillips-curve development?','The SRPC shifts upward and unemployment moves back toward natural',['The economy stays on the original SRPC at permanently lower unemployment','The LRPC shifts left because nominal wages increased','The SRPC shifts downward as expected inflation rises'],'long_run_adjustment',{secondaryConceptIds:['phillips-curve-expectations','long-run-phillips-curve'],bossStage:'opening'}),
    spec('One episode has rising inflation with falling unemployment; another has rising inflation with rising unemployment. What distinguishes them?','The first can be demand movement along SRPC; the second can be an adverse supply shift',['Both are identical movements along one unchanged SRPC despite their opposite unemployment changes in the two episodes','The first shifts LRPC left while the second shifts aggregate demand right','Both establish a permanent inflation-unemployment tradeoff without expectations adjustment'],'srpc_shift',{secondaryConceptIds:['aggregate-demand','aggregate-supply'],bossStage:'middle'}),
    spec('A government tries repeated demand expansions to hold unemployment one point below natural. Which model-consistent end state is most likely?','Unemployment returns toward natural at a higher inflation rate after expectations adjust',['Unemployment remains below natural with unchanged inflation after wage contracts renew','LRPC shifts left solely because repeated nominal spending increased','Expected inflation falls until deflation permanently restores the initial unemployment rate'],'srpc_relation',{secondaryConceptIds:['phillips-curve-expectations','long-run-phillips-curve'],bossStage:'final'})
  ],
  repair:[
    spec('A demand increase raises inflation and lowers unemployment while expectations are unchanged. Is this a movement or a shift?','A movement along the current SRPC',['An upward shift of the entire SRPC','A leftward shift of the LRPC','A downward shift of the entire SRPC'],'srpc_movement'),
    spec('Expected inflation rises while unemployment is held fixed. What happens to the SRPC?','It shifts upward',['The economy moves up the same SRPC','It shifts downward','The LRPC becomes horizontal'],'srpc_shift'),
    spec('On a Phillips graph, moving upward and left along one SRPC means what?','Inflation rises while unemployment falls',['Inflation and unemployment both rise','Inflation falls while unemployment rises','Inflation and unemployment both fall'],'srpc_relation'),
    spec('Can a downward-sloping SRPC guarantee permanently lower unemployment from higher inflation?','No, because expected inflation adjusts',['Yes, because the same SRPC is permanent','Yes, because natural unemployment becomes zero','No, because demand never affects unemployment'],'srpc_relation'),
    spec('An adverse supply shock raises inflation and unemployment together. What curve change is indicated?','An upward shift of the SRPC',['Movement up-left along the same SRPC','A downward shift of the SRPC','A vertical movement along the LRPC'],'srpc_shift')
  ],
  bridge:[
    spec('Aggregate demand expands unexpectedly, raising output and the price level. What linked Phillips result follows first?','Lower unemployment and higher inflation along the current SRPC',['Higher unemployment and higher inflation from an SRPC shift','Lower unemployment and lower inflation from an LRPC shift','Unchanged unemployment with a downward SRPC shift'],'srpc_movement',{secondaryConceptIds:['aggregate-demand','macroeconomic-equilibrium-and-shocks']}),
    spec('After a move to lower unemployment and higher inflation, wage setters revise inflation forecasts upward. What neighboring concept completes the next step?','Expected inflation shifts the SRPC upward',['Aggregate demand shifts the LRPC left','Productivity makes the SRPC vertical','Money demand shifts the SRPC downward'],'expectations_adjustment',{secondaryConceptIds:['phillips-curve-expectations']}),
    spec('A short-run unemployment gain disappears as expectations adjust. Which family destination explains the long-run endpoint?','The vertical LRPC at the natural rate',['A permanently flatter SRPC','A horizontal LRPC at zero inflation','A sacrifice ratio equal to unemployment'],'lrpc_vertical',{secondaryConceptIds:['long-run-phillips-curve']}),
    spec('A contraction moves the economy down the SRPC toward lower inflation and higher unemployment. Which applied destination studies that policy path?','Disinflation and its short-run costs',['GDP accounting identities for measuring current national output','Comparative advantage from differences in opportunity cost','Bank reserve creation through repeated lending and redepositing'],'disinflation_policy',{secondaryConceptIds:['disinflation-and-policy']})
  ]
};

const expectations={
  easy:[
    spec('Workers and firms begin expecting higher inflation next year. Holding unemployment fixed, what happens to the short-run Phillips curve?','It shifts upward',['It shifts downward','The economy moves down one unchanged curve','The vertical LRPC shifts left'],'expected_inflation_shift')
  ],
  legendary:[
    spec('A surprise demand expansion initially lowers unemployment. Contracts renew after actual inflation repeatedly exceeds prior forecasts. Which response is most likely?','Expected inflation rises and the SRPC shifts upward',['Expected inflation falls and the SRPC shifts downward','The LRPC shifts left because contracts renew','Unemployment remains permanently below natural'],'expectations_adjustment',{secondaryConceptIds:['short-run-phillips-curve','long-run-phillips-curve']}),
    spec('Two central banks announce the same lower inflation target. One has a stronger record of meeting targets. Under otherwise similar conditions, what can differ?','Expected inflation may fall faster where the announcement is more credible',['The natural rate must immediately fall only in the credible economy','Actual inflation must reach zero with no output cost','The less credible bank must cause immediate deflation'],'credibility_expectations',{secondaryConceptIds:['disinflation-and-policy']}),
    spec('Actual inflation is 5% while wage setters expected 3%, temporarily pushing unemployment below natural. What erodes that effect?','Forecasts adjust upward, shifting the SRPC until unemployment returns toward natural',['The LRPC shifts left because actual inflation is above expected','Forecasts adjust downward, moving unemployment farther below natural','The price level returns to its initial value automatically'],'expectations_adjustment',{secondaryConceptIds:['long-run-phillips-curve']})
  ],
  boss:[
    {...spec('If expected inflation increases, which SRPC change follows?','An upward shift',['A downward shift','Only movement down the same curve','A horizontal LRPC shift'],'expected_inflation_shift'),tier:'easyBoss'},
    {...spec('If expected inflation decreases, which SRPC change follows?','A downward shift',['An upward shift','Only movement up the same curve','A vertical AD shift'],'expected_inflation_shift'),tier:'easyBoss'},
    {...spec('Why can actual inflation above expected inflation temporarily reduce unemployment?','Some wages and prices were set using the lower forecast',['The natural rate immediately becomes lower','Higher inflation permanently raises labor productivity','The LRPC becomes downward sloping'],'expectations_adjustment'),tier:'easyBoss'},
    {...spec('A credible disinflation announcement lowers expected inflation before much demand contraction occurs. Which graph change is most consistent?','The SRPC shifts downward, potentially reducing the short-run cost',['The LRPC shifts right and permanently raises unemployment','The SRPC shifts upward because actual inflation may fall','The economy can only move up-left along the old SRPC'],'credibility_expectations',{secondaryConceptIds:['disinflation-and-policy']}),tier:'finalBoss'},
    {...spec('Actual inflation remains above expected inflation for several contract cycles. Which sequence best fits adaptive expectations?','Expected inflation rises, shifting SRPC upward and undoing the temporary unemployment gain',['Expected inflation falls, shifting SRPC downward and preserving the unemployment gain indefinitely','LRPC shifts left, locking in unemployment below natural after contracts renew','SRPC stays fixed because only actual inflation matters for wage setting'],'expectations_adjustment',{secondaryConceptIds:['long-run-phillips-curve']}),tier:'finalBoss'},
    {...spec('A supply shock raises inflation without a demand boom. Why might a simple expectations-only diagnosis be incomplete?','The shock can shift the SRPC even before expectations adapt',['Expected inflation is the only possible SRPC shifter in the introductory model','Every inflation increase is movement along a fixed SRPC regardless of its cause','Supply shocks shift only the vertical LRPC while leaving SRPC unchanged'],'srpc_shift',{secondaryConceptIds:['aggregate-supply','short-run-phillips-curve']}),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('A surprise expansion lifts inflation from 2% to 5% while expected inflation remains 2%. What makes the unemployment effect temporary?','Expected inflation eventually rises toward actual inflation and shifts the SRPC upward',['The natural rate permanently falls three points once actual inflation exceeds its forecast','Expected inflation falls below 2% and shifts SRPC downward after workers observe prices','The LRPC becomes flatter as actual inflation rises above expected inflation'],'expectations_adjustment',{secondaryConceptIds:['short-run-phillips-curve','long-run-phillips-curve'],bossStage:'opening'}),
    spec('A disinflation announcement is only partly credible and wage contracts reset slowly. Which conclusion is appropriately bounded?','Expectations may fall gradually, so some short-run output cost can remain',['Partial credibility must eliminate every unemployment cost as soon as policy is announced','Expected inflation cannot change until actual inflation reaches the announced target','The announcement necessarily causes the price level to fall for several years'],'credibility_expectations',{secondaryConceptIds:['disinflation-and-policy'],bossStage:'middle'}),
    spec('An adverse supply shock raises actual inflation, then wage setters incorporate it into next year’s contracts. What are the two stages?','An initial SRPC shift followed by reinforcement through higher expected inflation',['Two movements along one fixed SRPC with no change in the inflation-unemployment relation','An LRPC shift followed by lower expected inflation when contracts renew','A demand contraction followed by an SRPC shift downward at each unemployment rate'],'expectations_adjustment',{secondaryConceptIds:['aggregate-supply','short-run-phillips-curve'],bossStage:'final'})
  ],
  repair:[
    spec('Expected inflation rises from 2% to 4%. At a given unemployment rate, how does the SRPC move?','It shifts upward',['It shifts downward','The economy moves down the same SRPC','The LRPC shifts right'],'expected_inflation_shift'),
    spec('Actual inflation repeatedly exceeds the rate workers expected. Which forecast adjustment is likely?','Expected inflation rises',['Expected inflation falls','Expected inflation becomes permanently zero','Expected inflation cannot respond'],'expectations_adjustment'),
    spec('Does a credible announcement guarantee costless disinflation?','No; it can reduce costs without always eliminating them',['Yes; credibility removes all nominal rigidities','Yes; unemployment must immediately fall','No; credibility can never affect expectations'],'credibility_expectations')
  ],
  bridge:[
    spec('The economy moves up-left along SRPC after a demand surprise. Wage setters then revise forecasts upward. What connection is required?','A movement along SRPC becomes an upward shift as expectations adjust',['The LRPC shifts left as aggregate demand rises and nominal wages renew','The same fixed SRPC supports permanently lower unemployment after forecasts update','A downward expectations shift reinforces the initial unemployment gain'],'expectations_adjustment',{secondaryConceptIds:['short-run-phillips-curve','long-run-phillips-curve']}),
    spec('Expected inflation falls during a credible disinflation. Which applied family slice uses that change to assess policy costs?','Disinflation and policy',['GDP components','Money creation','Economic growth policy'],'credibility_expectations',{secondaryConceptIds:['disinflation-and-policy']}),
    spec('Expectations fully catch up after repeated inflation surprises. Which neighboring curve summarizes the remaining unemployment result?','The LRPC at the natural rate',['The SRPC as a permanent menu','The money-demand curve','The production possibilities frontier'],'lrpc_vertical',{secondaryConceptIds:['long-run-phillips-curve']})
  ]
};

const lrpc={
  easy:[
    spec('Where is the long-run Phillips curve drawn?','Vertically at the natural rate of unemployment',['Horizontally at the current inflation rate','Downward sloping through every short-run point','Vertically at zero unemployment'],'lrpc_vertical'),
    spec('What does a vertical LRPC imply?','There is no permanent inflation-unemployment tradeoff',['Higher inflation permanently lowers unemployment','Inflation is fixed in the long run','The natural rate always equals zero'],'lrpc_vertical')
  ],
  medium:[
    spec('Demand expansion temporarily pushes unemployment below natural. After expected inflation adjusts, where does unemployment tend to go?','Back toward the natural rate',['Permanently farther below the natural rate','To zero regardless of labor institutions','Above natural forever with no inflation change'],'long_run_adjustment'),
    spec('Job-matching technology improves and lowers structural unemployment. What Phillips-curve change can follow?','The LRPC shifts left to a lower natural rate',['The economy moves left along the same LRPC','The SRPC must shift upward at every point','The LRPC becomes downward sloping'],'natural_rate_shift'),
    spec('A rise in long-term mismatch raises the natural rate. What happens to the LRPC?','It shifts right',['It shifts left','It rotates to horizontal','It stays fixed at the old natural rate'],'natural_rate_shift'),
    spec('Why can many inflation rates appear on the same vertical LRPC?','Long-run unemployment equals natural after expectations adjust',['Inflation is unable to change nominal wages','Every point has zero expected inflation','Aggregate demand fixes the natural rate'],'lrpc_vertical')
  ],
  hard:[
    spec('Inflation rises permanently after repeated demand expansion, but labor-market structure is unchanged. Which long-run statement is strongest?','Unemployment returns toward the same natural rate on an unchanged LRPC',['The LRPC shifts left because higher inflation permanently improves job matching','Unemployment remains permanently below natural after expectations fully adjust','The LRPC shifts right because the price level rose over time'],'lrpc_vertical'),
    spec('The natural rate falls because job search becomes faster. How should SRPC and LRPC reasoning be separated?','LRPC shifts left; short-run curves may also reposition around the new natural rate',['The economy merely moves upward along the old LRPC as inflation changes','Only inflation expectations can shift LRPC in the long-run model','LRPC stays fixed while unemployment permanently departs from its vertical location'],'natural_rate_shift')
  ],
  legendary:[
    spec('Policy holds unemployment below natural with successive demand expansions. Expected inflation rises each round. Which path is consistent with the natural-rate model?','A sequence of upward-shifting SRPCs ending back at natural unemployment with higher inflation',['One unchanged SRPC delivering permanently lower unemployment after every contract renewal','A leftward LRPC shift caused solely by faster inflation with unchanged labor structure','A downward SRPC shift ending in deflation and a lower natural unemployment rate'],'long_run_adjustment',{secondaryConceptIds:['short-run-phillips-curve','phillips-curve-expectations']}),
    spec('Economy A lowers its natural rate through better job matching; Economy B only creates an unexpected demand boom. Which comparison is correct?','A can shift LRPC left; B can only move unemployment below natural temporarily',['Both economies permanently shift LRPC left because unemployment initially declines','Only Economy B changes long-run unemployment by raising aggregate demand','Neither economy can affect unemployment at either a short or long horizon'],'natural_rate_shift',{secondaryConceptIds:['natural-rate-of-unemployment','short-run-phillips-curve']}),
    spec('Inflation expectations instantly match a fully anticipated monetary expansion in the model. What Phillips prediction is most consistent?','Little or no temporary unemployment movement away from the natural rate',['A permanent unemployment decline along the SRPC once nominal spending increases','A rightward LRPC shift from higher money growth and unchanged labor institutions','A guaranteed fall in both inflation and unemployment after expectations adjust'],'lrpc_vertical',{secondaryConceptIds:['monetary-neutrality','phillips-curve-expectations']})
  ],
  boss:[
    {...spec('At what unemployment rate is the LRPC located?','The natural rate',['Zero unemployment','The current inflation rate','The cyclical unemployment rate alone'],'lrpc_vertical'),tier:'easyBoss'},
    {...spec('What makes the LRPC vertical?','Expected inflation adjusts in the long run',['Aggregate demand never changes output even temporarily','Inflation must remain constant at every natural-rate point','Unemployment cannot change during a short-run demand surprise'],'lrpc_vertical'),tier:'easyBoss'},
    {...spec('Which event can shift the LRPC?','A structural change in the natural rate',['A one-time surprise demand expansion with fixed expectations','A movement along the current SRPC after demand changes','A temporary inflation forecast error in wage contracts'],'natural_rate_shift'),tier:'easyBoss'},
    {...spec('Unemployment is below natural and actual inflation exceeds expected inflation. What long-run adjustment follows?','Expected inflation rises and unemployment returns toward natural',['LRPC shifts left and locks in the lower unemployment','Expected inflation falls and SRPC shifts downward','Natural unemployment disappears as inflation continues'],'long_run_adjustment'),tier:'mediumBoss'},
    {...spec('A policy claim says 6% inflation can permanently hold unemployment below natural. Which model result rejects it?','Expectations adjustment returns unemployment toward the vertical LRPC',['The SRPC is always vertical even in the short run','Inflation cannot influence nominal demand','The natural rate falls whenever inflation rises'],'lrpc_vertical',{secondaryConceptIds:['phillips-curve-expectations']}),tier:'finalBoss'},
    {...spec('Job-search reform lowers mismatch while inflation expectations are unchanged. Which graph change captures the durable labor effect?','The LRPC shifts left to the new natural rate',['Movement up the existing LRPC','An upward SRPC shift from higher expected inflation','A permanent move left along one SRPC'],'natural_rate_shift',{secondaryConceptIds:['natural-rate-of-unemployment']}),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('A surprise expansion moves unemployment below natural; later contracts incorporate the higher inflation. What identifies the long-run endpoint?','The same natural unemployment rate with higher expected and actual inflation',['A permanently lower natural rate caused by nominal demand after contracts renew','A horizontal LRPC at the new inflation rate with lower permanent unemployment','Lower inflation with unemployment still below natural after expectations fully adjust'],'long_run_adjustment',{secondaryConceptIds:['short-run-phillips-curve','phillips-curve-expectations'],bossStage:'opening'}),
    spec('A labor-market reform lowers the natural rate while a demand expansion temporarily lowers unemployment even further. Which distinction is essential?','The reform shifts LRPC; the demand expansion creates temporary movement relative to it',['Both changes are movements along one unchanged SRPC despite different mechanisms','Demand shifts LRPC permanently while reform only changes the current inflation rate','Neither change can alter a Phillips curve once expectations are specified'],'natural_rate_shift',{secondaryConceptIds:['natural-rate-of-unemployment','short-run-phillips-curve'],bossStage:'middle'}),
    spec('Two economies have different steady unemployment rates but the same long-run inflation. What can explain the difference without restoring a long-run tradeoff?','Different natural rates locate their vertical LRPCs differently',['Different inflation rates along the same downward LRPC','Permanent forecast errors in both economies','A common SRPC that never shifts'],'natural_rate_shift',{secondaryConceptIds:['natural-rate-of-unemployment'],bossStage:'final'})
  ],
  repair:[
    spec('Why does higher inflation not permanently lower unemployment in the natural-rate model?','Expected inflation adjusts and unemployment returns toward natural',['Aggregate demand has no short-run effect','The natural rate always falls with inflation','Nominal wages never respond to prices'],'lrpc_vertical'),
    spec('Structural unemployment falls because matching improves. Is that movement along or a shift of LRPC?','A leftward shift of the LRPC',['Movement upward along the LRPC','Movement left along a fixed LRPC','An upward shift of SRPC only'],'natural_rate_shift')
  ],
  bridge:[
    spec('Expected inflation has fully adjusted after an expansion. Which prior family idea now leads to the LRPC conclusion?','The temporary SRPC movement ends at natural unemployment',['The SRPC remains a permanent menu of choices','The sacrifice ratio becomes the natural rate','Deflation moves LRPC to zero unemployment'],'long_run_adjustment',{secondaryConceptIds:['phillips-curve-expectations','short-run-phillips-curve']})
  ],
  addedBridge:[
    spec('The LRPC places unemployment at its natural rate. Which labor-family concept supplies that location?','Natural-rate unemployment from frictional and structural forces',['Cyclical unemployment at every inflation rate','Zero unemployment after demand expansion','Labor-force participation alone'],'natural_rate_shift',{secondaryConceptIds:['natural-rate-of-unemployment']}),
    spec('A central bank begins disinflation from the natural rate. Which next family concept measures the possible output cost of the temporary adjustment?','The sacrifice ratio',['The GDP deflator base year','The money multiplier','Comparative advantage'],'sacrifice_ratio_meaning',{secondaryConceptIds:['sacrifice-ratio']})
  ]
};

const sacrifice={
  easy:[
    spec('What does a sacrifice ratio of 3 mean?','About 3% of one year’s output is lost per 1-percentage-point inflation reduction',['Inflation falls 3% whenever output falls 1%','Unemployment rises 3 percentage points permanently','The price level falls 3% during every disinflation'],'sacrifice_ratio_meaning'),
    spec('An analyst divides output loss by the final 4% inflation rate after inflation began at 7%. What denominator should replace 4%?','The 3-percentage-point reduction in inflation',['The initial 7% inflation rate before policy','The 11% sum of the two inflation rates','The final 4% inflation rate already used'],'sacrifice_ratio_denominator'),
    spec('Which loss belongs in the usual sacrifice-ratio numerator?','Cumulative output lost relative to potential during disinflation',['The permanent increase in the unemployment rate','The total fall in the price level','The final year’s inflation rate'],'sacrifice_ratio_meaning'),
    spec('A disinflation has a lower sacrifice ratio than another. Under comparable measurement, what does that indicate?','Less cumulative output loss per inflation point reduced',['A larger fall in the price level','A permanently higher natural unemployment rate','A higher inflation target after policy ends'],'sacrifice_ratio_meaning')
  ],
  medium:[
    spec('Cumulative output loss is 12% of one year’s GDP while inflation falls 3 percentage points. What is the sacrifice ratio?','4% of one year’s output per inflation point',['3% of output per inflation point','9% of output per inflation point','36% of output per inflation point'],'sacrifice_ratio_calculation',{type:'calculation'}),
    spec('A planned inflation reduction is 2.5 percentage points and the estimated sacrifice ratio is 3. What cumulative output loss is implied?','7.5% of one year’s output',['1.2% of one year’s output','5.5% of one year’s output','8.3% of one year’s output'],'sacrifice_ratio_calculation',{type:'calculation'}),
    spec('The output gap is −1.5% in year one and −2.5% in year two while inflation falls 2 percentage points. Using the sum of annual gaps, what is the sacrifice ratio?','2% of one year’s output per inflation point',['1% of output per inflation point','4% of output per inflation point','8% of output per inflation point'],'sacrifice_ratio_calculation',{type:'calculation'}),
    spec('Inflation declines from 8% to 5%. Which calculation uses the correct denominator?','Cumulative output loss divided by 3 percentage points',['Cumulative output loss divided by the final 5%','Cumulative output loss divided by the initial 8%','Final output divided by 13 percentage points'],'sacrifice_ratio_denominator',{type:'calculation'}),
    spec('Path A loses 6% of one year’s output to cut inflation 3 points. Path B loses 5% to cut inflation 2 points. Which has the lower sacrifice ratio?','Path A has a ratio of 2; Path B has a ratio of 2.5',['Path B has a ratio of 2; Path A has a ratio of 2.5','Both paths have a sacrifice ratio of 2','Path A has a ratio of 3; Path B has a ratio of 2'],'sacrifice_ratio_calculation',{type:'calculation'})
  ],
  hard:[
    spec('Potential GDP is $500 billion. Output is 2% below potential for one year and 1% below for two more years while inflation falls 4 points. What is the loss per inflation point?','$5 billion per inflation point',['$2.5 billion per inflation point','$10 billion per inflation point','$20 billion per inflation point'],'sacrifice_ratio_calculation',{type:'calculation',feedback:'The cumulative loss is $10 billion + $5 billion + $5 billion = $20 billion; $20 billion ÷ 4 = $5 billion per inflation point.'}),
    spec('A disinflation creates cumulative output loss equal to 9% of annual GDP. If the sacrifice ratio is 3, how far did inflation fall?','3 percentage points',['2 percentage points','6 percentage points','27 percentage points'],'sacrifice_ratio_calculation',{type:'calculation'}),
    spec('Real GDP growth slows from 4% to 1%, but output remains above potential. Why can the 3-point growth slowdown not automatically be the sacrifice-ratio numerator?','The numerator measures an output-level loss relative to a benchmark, not merely slower growth',['Any growth slowdown is exactly the cumulative output gap relative to potential','The numerator must be a permanent unemployment-rate change rather than output','Only the final inflation rate belongs in the numerator of this measure'],'sacrifice_ratio_meaning'),
    spec('Cumulative output loss is 6.5% of one year’s GDP and inflation falls 3 percentage points. Round the sacrifice ratio to two decimals.','2.17% of one year’s output per inflation point',['2.16% of output per inflation point','2.20% of output per inflation point','3.50% of output per inflation point'],'sacrifice_ratio_calculation',{type:'calculation',roundingRule:'Round to two decimal places.'})
  ],
  legendary:[
    spec('A three-year disinflation produces annual output gaps of −2%, −1%, and 0%, cutting inflation from 6.5% to 4.5%. A faster path produces one year at −4% and cuts inflation the same amount. Which comparison is correct?','The gradual path ratio is 1.5; the fast path ratio is 2',['The gradual path ratio is 3; the fast path ratio is 4','Both paths have a ratio of 2','The gradual path ratio is 2; the fast path ratio is 1.5'],'sacrifice_ratio_calculation',{type:'calculation',secondaryConceptIds:['disinflation-and-policy']}),
    spec('Economy A loses 8% of one year’s GDP while inflation falls from 9% to 5%. Economy B loses 6% while inflation falls from 5% to 2%. What can be concluded?','A has a ratio of 2 and B also has a ratio of 2',['A has a ratio of 4 and B has a ratio of 3','A has a ratio of 0.5 and B has a ratio of 0.67','A has a lower ratio because its inflation drop is larger'],'sacrifice_ratio_calculation',{type:'calculation',secondaryConceptIds:['disinflation-and-policy']})
  ],
  boss:[
    {...spec('Which formula states the sacrifice ratio?','Cumulative output loss ÷ inflation reduction in percentage points',['Inflation reduction in points ÷ cumulative output loss relative to potential','Permanent unemployment increase ÷ the final positive inflation rate','Price-level decline over the episode ÷ nominal GDP growth'],'sacrifice_ratio_meaning'),tier:'easyBoss'},
    {...spec('Inflation falls from 6% to 4%. What is the denominator?','2 percentage points',['4 percent','6 percent','10 percentage points'],'sacrifice_ratio_denominator'),tier:'easyBoss'},
    {...spec('A ratio of 2 is best read as what?','Two percent of one year’s output lost per inflation point reduced',['Inflation falls two percent for every percentage point of unemployment added','Unemployment stays two points above natural after expectations completely adjust','The price level declines two percent in each year of disinflation'],'sacrifice_ratio_meaning'),tier:'easyBoss'},
    {...spec('Loss is 10% of annual GDP and inflation falls 4 points. What is the ratio?','2.5% of one year’s output per inflation point',['1.5% of output per inflation point','4% of output per inflation point','14% of output per inflation point'],'sacrifice_ratio_calculation',{type:'calculation'}),tier:'mediumBoss'},
    {...spec('Annual output gaps are −1%, −2%, and −1%; inflation falls from 7% to 5%. What is the ratio?','2% of one year’s output per inflation point',['0.5% of output per inflation point','3% of output per inflation point','6% of output per inflation point'],'sacrifice_ratio_calculation',{type:'calculation'}),tier:'finalBoss'},
    {...spec('A report divides cumulative output loss by the final inflation rate. What correction is required?','Divide by the percentage-point reduction in inflation',['Divide by the initial inflation rate before the policy began','Multiply by the final inflation rate','Use the permanent unemployment rate'],'sacrifice_ratio_denominator'),tier:'finalBoss'},
    {...spec('Path X loses 7.2% of annual GDP to reduce inflation 3 points. Path Y loses 5% to reduce inflation 2 points. Which is more output-efficient?','Path X, with a ratio of 2.4 versus 2.5',['Path Y, with a ratio of 2 versus 2.4','Path X, with a ratio of 3 versus 2','They are equal because both lower inflation'],'sacrifice_ratio_calculation',{type:'calculation'}),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('A two-year policy creates output gaps of −2.4% and −1.8%, lowering inflation from 7.0% to 5.2%. Round the sacrifice ratio to two decimals.','2.33% of one year’s output per inflation point',['1.80% of output per inflation point','2.34% of output per inflation point','4.20% of output per inflation point'],'sacrifice_ratio_calculation',{type:'calculation',roundingRule:'Round to two decimal places.',secondaryConceptIds:['disinflation-and-policy'],bossStage:'opening'}),
    spec('A credible plan lowers expected inflation and produces a 3% cumulative output loss for a 2-point inflation reduction. A less credible plan loses 7.5% for a 3-point reduction. Which comparison is correct?','The credible plan ratio is 1.5; the other is 2.5',['The credible plan ratio is 2; the other is 2.5','The credible plan ratio is 0.67; the other is 0.4','The plans are equal because both reduce inflation'],'sacrifice_ratio_calculation',{type:'calculation',secondaryConceptIds:['phillips-curve-expectations','disinflation-and-policy'],bossStage:'middle'}),
    spec('Potential output is $800 billion. A policy creates gaps of 1.5% for two years and 0.5% for one year while inflation falls 2.8 points. What is cumulative loss per inflation point?','$10 billion per inflation point',['$4 billion per inflation point','$14 billion per inflation point','$28 billion per inflation point'],'sacrifice_ratio_calculation',{type:'calculation',roundingRule:'Report the exact dollar amount per inflation point.',secondaryConceptIds:['disinflation-and-policy'],bossStage:'final',feedback:'The cumulative loss is 3.5% of $800 billion = $28 billion. Dividing by 2.8 inflation points gives $10 billion per point.'})
  ],
  repair:[
    spec('Inflation falls from 8% to 5%. What number belongs in the sacrifice-ratio denominator?','3 percentage points',['5 percent','8 percent','13 percentage points'],'sacrifice_ratio_denominator'),
    spec('Should annual output gaps be added before calculating a multi-year sacrifice ratio?','Yes, to obtain cumulative output loss',['No, only the worst year counts','No, only the final year counts','Yes, but add inflation rates too'],'sacrifice_ratio_calculation'),
    spec('Does the sacrifice ratio normally measure an unemployment increase per inflation point?','No, it measures cumulative output loss per inflation point',['Yes, unemployment is always the numerator','Yes, but only when inflation stays positive','No, it measures the fall in the price level'],'sacrifice_ratio_meaning')
  ],
  bridge:[
    spec('The economy temporarily moves above natural unemployment during disinflation. What bridge converts that adjustment into a cost measure?','Sum the output losses and divide by the inflation-point reduction',['Divide the unemployment increase by the final positive inflation rate','Treat the change in the price level as the cumulative output numerator','Shift LRPC right by the cumulative inflation reduction during policy'],'sacrifice_ratio_calculation',{secondaryConceptIds:['long-run-phillips-curve','disinflation-and-policy']}),
    spec('Expected inflation falls faster after a credible announcement. How can that connect to the sacrifice ratio?','A smaller cumulative output loss can lower the measured ratio',['A lower final inflation rate automatically raises the ratio even with unchanged loss','Credibility changes the denominator from inflation reduction to unemployment','The ratio must become zero in every credible disinflation plan'],'credibility_expectations',{secondaryConceptIds:['phillips-curve-expectations','disinflation-and-policy']}),
    spec('Two disinflation paths reach the same inflation target. Which family destination uses their sacrifice ratios to compare costs?','Disinflation and policy',['Short-run curve axis reading','GDP component classification','Bank reserve accounting'],'policy_path',{secondaryConceptIds:['disinflation-and-policy']})
  ]
};

const disinflation={
  easy:[
    spec('Inflation slows from 6% to 3%, so the price level still rises more slowly. What is this?','Disinflation',['Deflation','Hyperinflation','A falling real interest rate by definition'],'disinflation_definition'),
    spec('Which short-run effect commonly accompanies contractionary disinflation policy?','Lower output and higher unemployment',['Higher output and lower unemployment','A permanently lower natural unemployment rate','An immediate rise in aggregate demand'],'disinflation_policy')
  ],
  medium:[
    spec('A central bank reduces aggregate demand to lower inflation. What Phillips movement is expected before expectations adjust?','Down and right along the current SRPC',['Up and left along the current SRPC','An immediate leftward LRPC shift','An upward SRPC shift from lower expected inflation'],'disinflation_policy',{secondaryConceptIds:['short-run-phillips-curve']}),
    spec('Why can a credible lower-inflation target reduce the short-run cost of disinflation?','It may lower expected inflation and shift the SRPC downward sooner',['It permanently lowers the natural rate by announcement','It guarantees wages and prices adjust instantly','It causes aggregate demand to expand during contraction'],'credibility_expectations',{secondaryConceptIds:['phillips-curve-expectations']}),
    spec('Inflation falls from 4% to 1%, but prices continue rising. Which statement is correct?','The economy has disinflation, not deflation',['The economy has deflation because inflation fell','The price level must be below its initial level','The natural rate must have declined'],'disinflation_definition'),
    spec('Why might gradual disinflation be chosen instead of a rapid contraction?','It can spread adjustment and reduce a severe short-run output gap',['It always produces zero cumulative output loss','It guarantees expected inflation never changes','It permanently shifts LRPC left'],'policy_path')
  ],
  hard:[
    spec('A disinflation announcement is not credible, and wage contracts embed 6% inflation. What makes immediate costless adjustment unlikely?','Expected inflation and nominal contracts may adjust slowly',['The LRPC must shift left before policy begins','Aggregate demand cannot affect inflation','Deflation is required before unemployment changes'],'credibility_expectations'),
    spec('Two paths reach 2% inflation. The rapid path has a deep one-year recession; the gradual path has smaller gaps for several years. What must be compared?','Their cumulative output losses and inflation reductions',['Only the largest annual unemployment rate','Only the final year’s output level','The price levels at the start, without output data'],'policy_path',{secondaryConceptIds:['sacrifice-ratio']})
  ],
  legendary:[
    spec('A credible central bank announces a lower inflation target, expected inflation falls partly, and policy still contracts demand. Which conclusion is most defensible?','The downward SRPC shift may reduce but need not eliminate the short-run output cost',['Credibility guarantees unemployment never rises during the contractionary adjustment','The LRPC shifts left because the announced target permanently lowers natural unemployment','Disinflation necessarily becomes deflation before expected inflation can decline'],'credibility_expectations',{secondaryConceptIds:['phillips-curve-expectations','sacrifice-ratio']}),
    spec('Inflation falls 3 points while cumulative output loss equals 6% of annual GDP. Unemployment later returns to natural. Which synthesis is correct?','The sacrifice ratio is 2, and the unemployment cost was temporary in the model',['The sacrifice ratio is 0.5, and unemployment stays permanently high','The ratio is 3, and LRPC shifts right permanently','The ratio is 6, and the price level must have fallen'],'sacrifice_ratio_calculation',{type:'calculation',secondaryConceptIds:['sacrifice-ratio','long-run-phillips-curve']}),
    spec('An adverse supply shock has raised inflation and unemployment. Why can disinflation policy face a harder near-term tradeoff than after a demand boom?','Contraction can lower inflation pressure while worsening an already weak output position',['Supply shocks automatically lower the sacrifice ratio to zero','The LRPC becomes downward sloping during supply shocks','Contraction shifts the SRPC downward with no demand effect'],'disinflation_policy',{secondaryConceptIds:['aggregate-supply','short-run-phillips-curve']})
  ],
  boss:[
    {...spec('Inflation drops from 5% to 2% while prices still rise. What is occurring?','Disinflation',['Deflation','A price-level collapse','A permanent output boom'],'disinflation_definition'),tier:'easyBoss'},
    {...spec('Which policy direction normally lowers aggregate demand to pursue disinflation?','Contractionary policy',['Expansionary policy','A permanent supply restriction','A higher inflation target'],'disinflation_policy'),tier:'easyBoss'},
    {...spec('What is the usual short-run Phillips cost of disinflation?','Higher unemployment while inflation falls',['Lower unemployment while inflation falls','Permanently higher natural unemployment','Higher inflation with higher output'],'disinflation_policy'),tier:'easyBoss'},
    {...spec('A trusted announcement lowers expected inflation. What is the relevant Phillips mechanism?','SRPC can shift downward before all actual inflation adjustment occurs',['LRPC shifts left and eliminates the natural rate before contracts reset','SRPC shifts upward because credibility raises the announced inflation target','Aggregate demand expands automatically without any change in policy instruments'],'credibility_expectations'),tier:'mediumBoss'},
    {...spec('A rapid plan loses 5% of annual GDP to cut inflation 2 points; a gradual plan loses 6% to cut it 3 points. Which has the lower sacrifice ratio?','The gradual plan has ratio 2 versus the rapid plan’s 2.5',['The rapid plan has ratio 2 versus the gradual plan’s 3','Both plans have a sacrifice ratio of 2.5','The gradual plan has ratio 3 versus the rapid plan’s 2'],'policy_path',{type:'calculation',secondaryConceptIds:['sacrifice-ratio']}),tier:'finalBoss'},
    {...spec('After contraction raises unemployment above natural, expected inflation falls. What long-run adjustment is expected?','SRPC shifts downward and unemployment returns toward natural',['LRPC shifts right and locks in higher unemployment','SRPC shifts upward and inflation rises','Unemployment remains above natural permanently'],'long_run_adjustment',{secondaryConceptIds:['phillips-curve-expectations','long-run-phillips-curve']}),tier:'finalBoss'}
  ],
  legendaryBoss:[
    spec('A central bank with mixed credibility begins rapid disinflation. Which full chain is most model-consistent?','Demand contracts, unemployment rises temporarily, expectations fall gradually, and output returns toward potential',['Demand expands, unemployment falls, and inflation drops immediately without any wage, price, or expectations adjustment','LRPC shifts right permanently because lower inflation raises the natural unemployment rate','Expected inflation rises first and shifts SRPC upward before the contraction begins'],'disinflation_policy',{secondaryConceptIds:['phillips-curve-expectations','long-run-phillips-curve'],bossStage:'opening'}),
    spec('Policy A cuts inflation 4 points with 8% cumulative output loss. Policy B cuts 2.5 points with 4% loss. Which cost comparison is correct?','A has ratio 2; B has ratio 1.6, so B loses less output per point',['A has ratio 0.5; B has ratio 0.625, so A has the lower cost','A has ratio 4; B has ratio 2.5, using final inflation as denominator','Both have ratio 2 because each lowers inflation from a positive starting rate'],'sacrifice_ratio_calculation',{type:'calculation',secondaryConceptIds:['sacrifice-ratio'],bossStage:'middle'}),
    spec('Inflation is down to 1% after disinflation, unemployment is back at natural, and the price level is higher than before. Which diagnosis is complete?','Disinflation succeeded without requiring deflation; the short-run labor cost has unwound',['Deflation occurred because the inflation rate fell even though prices remained higher','The natural rate must now be permanently lower because unemployment first increased','The price level should have returned to its starting value once unemployment normalized'],'disinflation_definition',{secondaryConceptIds:['long-run-phillips-curve'],bossStage:'final'})
  ],
  repair:[
    spec('Inflation falls from 5% to 2% but remains positive. Did the price level fall?','No; it rose more slowly',['Yes; any inflation decline lowers prices','Yes; disinflation and deflation are identical','No; the price level stayed exactly fixed'],'disinflation_definition'),
    spec('Contractionary disinflation raises unemployment in the short run. Is that necessarily permanent?','No; unemployment can return toward natural as expectations adjust',['Yes; every contraction shifts LRPC right','Yes; the SRPC never shifts after policy','No; unemployment must fall below natural immediately'],'disinflation_policy')
  ],
  bridge:[
    spec('Contractionary monetary policy reduces spending and inflation pressure. Which Phillips connection follows initially?','Movement toward higher unemployment and lower inflation along SRPC',['A permanent LRPC shift to higher unemployment after expected inflation adjusts','Movement toward lower unemployment and lower inflation along the same curve','An upward SRPC shift caused by lower expected inflation during contraction'],'disinflation_policy',{secondaryConceptIds:['monetary-policy-transmission','short-run-phillips-curve']}),
    spec('Expected inflation falls and the economy later returns to natural unemployment. Which family links explain the transition?','A downward SRPC shift followed by long-run return to LRPC',['A permanent move along one SRPC only','An LRPC shift caused by the price level','A sacrifice-ratio shift of aggregate demand'],'long_run_adjustment',{secondaryConceptIds:['phillips-curve-expectations','long-run-phillips-curve']})
  ],
  addedBridge:[
    spec('A policy team has computed cumulative output loss per inflation point. What applied question should that sacrifice ratio now inform?','How alternative disinflation paths trade speed against short-run cost',['How to classify liquid assets between M1 and broader monetary aggregates','How to calculate nominal GDP from current prices and quantities','How to shift the production frontier through resource accumulation'],'policy_path',{secondaryConceptIds:['sacrifice-ratio']})
  ]
};

const configs={
  'short-run-phillips-curve':srpc,
  'phillips-curve-expectations':expectations,
  'long-run-phillips-curve':lrpc,
  'sacrifice-ratio':sacrifice,
  'disinflation-and-policy':disinflation
};

for(const conceptId of ids){
  const cfg=configs[conceptId];
  rewriteAux(conceptId,'repair',cfg.repair);
  rewriteAux(conceptId,'bridge',cfg.bridge);
  let index=0;
  for(const pool of ['easy','medium','hard','legendary','boss','legendaryBoss']) for(const s of cfg[pool] || []) addQuestion(conceptId,pool,s,index++);
  for(const s of cfg.addedBridge || []) addQuestion(conceptId,'bridge',s,index++);
  const module=library.concepts[conceptId];
  const repairIds=module.repairQuestions.map(qid);
  const bridgeIds=module.bridgeQuestions.map(qid);
  const skills=[...new Set(unique(module).flatMap(({question})=>[question.primarySkill,question.repairSkill]).filter(Boolean))];
  module.microSkillRepairPools=Object.fromEntries(skills.map(skill=>{
    const direct=module.repairQuestions.filter(q=>q.primarySkill===skill).map(qid);
    return [skill,direct.length?direct:repairIds];
  }));
  module.microSkillBridgePools=Object.fromEntries(skills.map(skill=>{
    const direct=module.bridgeQuestions.filter(q=>q.primarySkill===skill).map(qid);
    return [skill,direct.length?direct:bridgeIds];
  }));
  reviews.push({canonicalConceptId:conceptId,action:'NO_CHANGE_VERIFIED',records:unique(module).filter(({question})=>!changes.some(c=>c.questionId===qid(question))).map(({pool,question})=>({questionId:qid(question),pool}))});
}
qualityRewrite('phillips-curve-expectations','ECON-SP-ELITE-350',spec('Refer to the SRPC graph. Which labeled move isolates an upward SRPC shift at unemployment U3?','The move from point c to point f',['The move from point a to point f','The move from point b to point e','The move from point c to point a'],'expected_inflation_shift',{image:'question-assets/srpc.webp',feedback:'Points c and f share unemployment U3; moving from c on SRPC1 to f on SRPC2 isolates higher inflation at the same unemployment rate.'}));
qualityRewrite('sacrifice-ratio','ECON-SP-HARD-249',spec('Potential GDP is $400 billion. Cumulative output loss is $24 billion while inflation falls from 8% to 5%. What is the sacrifice ratio?','2% of one year’s output per inflation point',['3% of output per inflation point','6% of output per inflation point','8% of output per inflation point'],'sacrifice_ratio_calculation',{type:'calculation',feedback:'The $24 billion loss is 6% of $400 billion. Inflation falls 3 percentage points, so the ratio is 6 ÷ 3 = 2.'}),1);
qualityRewrite('sacrifice-ratio','ECON-SP-ELITE-331',spec('If output loss is 14 percent and inflation falls by 4 percentage points, the sacrifice ratio is:','3.5% of one year’s output per inflation point',['4% of one year’s output per inflation point','10% of one year’s output per inflation point','18% of one year’s output per inflation point'],'sacrifice_ratio_calculation',{type:'calculation',feedback:'Divide the 14% cumulative output loss by the 4-percentage-point inflation reduction: 14 ÷ 4 = 3.5% of one year’s output per point.'}));
qualityRewrite('sacrifice-ratio','ECON-SP-HARD-250',spec('If inflation falls by 3 points and the output loss is 12 percent of one year’s GDP, the sacrifice ratio is:','4% of one year’s output per inflation point',['3% of one year’s output per inflation point','9% of one year’s output per inflation point','12% of one year’s output per inflation point'],'sacrifice_ratio_calculation',{type:'calculation',feedback:'Divide cumulative output loss by the inflation reduction: 12 ÷ 3 = 4% of one year’s output per inflation point.'}),3);

const expected={
  'short-run-phillips-curve':{easy:8,medium:6,hard:6,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:5,bridge:4,total:50},
  'phillips-curve-expectations':{easy:6,medium:6,hard:11,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:3,bridge:3,total:51},
  'long-run-phillips-curve':{easy:6,medium:6,hard:6,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:2,bridge:3,total:43},
  'sacrifice-ratio':{easy:6,medium:6,hard:6,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:3,bridge:3,total:51},
  'disinflation-and-policy':{easy:6,medium:6,hard:6,legendary:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendaryBoss:3,repair:2,bridge:3,total:43}
};
const afterCounts=Object.fromEntries(ids.map(id=>[id,countModule(library.concepts[id])]));
for(const id of ids) for(const [key,value] of Object.entries(expected[id])) if(afterCounts[id][key]!==value) throw new Error(`${id} ${key}: ${afterCounts[id][key]} != ${value}`);

const answerIssues=[];
const seenIds=new Set(),seenStems=new Map();
for(const [conceptId,module] of Object.entries(library.concepts)) for(const {pool,question} of unique(module)){
  const id=qid(question);
  if(seenIds.has(id)) answerIssues.push({type:'duplicate_id',id,conceptId,pool});
  seenIds.add(id);
  const matches=(question.options||[]).filter(o=>answerHash(o)===question.aHash);
  if(matches.length!==1) answerIssues.push({type:'answer_hash',id,conceptId,pool,matches:matches.length});
  const stem=String(question.q||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  if(seenStems.has(stem) && idSet.has(conceptId)) answerIssues.push({type:'exact_stem',id,other:seenStems.get(stem),conceptId});
  else seenStems.set(stem,id);
}
if(answerIssues.length) throw new Error(`Question validation failed: ${JSON.stringify(answerIssues.slice(0,10))}`);

function graphLinked(q){ return Boolean(q.image) || /\b(graph|curve|srpc|lrpc)\b/i.test(`${q.q||''} ${q.type||''}`); }
function calcLinked(q){ return q.type==='calculation' || /sacrifice_ratio_calculation/.test(q.primarySkill||''); }
function updateRegistryEntry(entry,module){
  const ordinary=['easy','medium','hard'].flatMap(p=>module.questions[p]||[]);
  const role={boss:(module.questions.boss||[]).length,bridge:module.bridgeQuestions.length,calculation:(module.questions.calculation||[]).length,elite:(module.questions.elite||[]).length,integration:(module.questions.integration||[]).length,legendary:(module.questions.legendary||[]).length,legendaryBoss:(module.questions.legendaryBoss||[]).length,main:ordinary.length,repair:module.repairQuestions.length,repairSeed:(module.repairSeedQuestions||[]).length};
  const diff={easy:(module.questions.easy||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='easyBoss').length,medium:(module.questions.medium||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='mediumBoss').length,hard:(module.questions.hard||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='finalBoss').length,elite:(module.questions.elite||[]).length,legendary:(module.questions.legendary||[]).length+(module.questions.legendaryBoss||[]).length,unknown:module.repairQuestions.length+(module.repairSeedQuestions||[]).length+module.bridgeQuestions.length};
  const records=unique(module).map(x=>x.question);
  Object.assign(entry,{includedSkills:[...new Set(records.map(q=>q.primarySkill).filter(Boolean))].sort(),questionCountByRole:role,questionCountByDifficulty:diff,repairCoverage:{directSkillMatches:module.repairQuestions.length,mainWithUsableSkill:records.length},bridgeCoverage:{directSkillMatches:module.bridgeQuestions.length,mainWithUsableSkill:records.length},calculationCoverage:records.filter(calcLinked).length,graphCoverage:records.filter(graphLinked).length,instructionalClassification:'Engine-safe family slice',coverageStatus:'ready-family-slice',coverageStatusLabel:'Engine-safe alone; deepest in Phillips family',coverageStatusNote:'Phase M2a provides solo engine floors with controlled reuse and family-first instructional depth.',coverageFloorVersion:PHASE,notes:'Diagnostic slice of the Phillips Curve and Disinflation family. Use the five-concept sequence for the richest progression.'});
}
for(const conceptId of ids){
  for(const list of [library.registry.concepts,registry.concepts]){
    const entry=list.find(x=>x.canonicalConceptId===conceptId);
    if(!entry) throw new Error(`Registry entry missing: ${conceptId}`);
    updateRegistryEntry(entry,library.concepts[conceptId]);
  }
}

// The manually corrected source copy is authoritative. M2a synchronizes only live production copies.
const correctedPath=path.join(dataDir,'question-assets','short-run-phillips-curve','srpc.webp');
const correctedBytes=fs.readFileSync(correctedPath);
const correctedSha=sha(correctedBytes);
if(correctedSha!=='66ca8eff669f9d6dfc9d3f92fe68e6e3c3e3cb5147237de9e069226438955df4') throw new Error(`Corrected SRPC baseline hash unexpected: ${correctedSha}`);
const assetConcepts=['short-run-phillips-curve','phillips-curve-expectations','long-run-phillips-curve','integrated-macroeconomic-analysis'];
for(const conceptId of assetConcepts){
  for(const entry of library.concepts[conceptId].assetMetadata || []) if(entry.filename==='srpc.webp') Object.assign(entry,{sha256:correctedSha,sizeBytes:correctedBytes.length});
  for(const entry of library.assetInventory || []) if(entry.conceptId===conceptId && entry.filename==='srpc.webp') Object.assign(entry,{sha256:correctedSha,sizeBytes:correctedBytes.length});
  for(const entry of manifest.assets || []) if(entry.conceptId===conceptId && entry.filename==='srpc.webp') Object.assign(entry,{sha256:correctedSha,sizeBytes:correctedBytes.length});
}

for(const [id,hash] of Object.entries(protectedBefore)) if(bankHash(library.concepts[id])!==hash) throw new Error(`Protected canonical bank changed: ${id}`);

const previousVersion=library.libraryVersion;
library.libraryVersion=`${previousVersion}-${PHASE}`;
library.sourceCurationPhase=PHASE;
library.generatedAt=STAMP;
library.canonicalQuestionCount=Object.values(library.concepts).reduce((sum,module)=>sum+unique(module).length,0);
Object.assign(library.registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
Object.assign(registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
delete library.librarySha256;
library.librarySha256=sha(JSON.stringify(stable(library)));
registry.librarySha256=library.librarySha256;
Object.assign(manifest,{assetCount:manifest.assets.length,canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:STAMP});

const protectedAfter=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const familyBefore=Object.values(beforeCounts).reduce((o,c)=>{ for(const [k,v] of Object.entries(c)) o[k]=(o[k]||0)+v; return o; },{});
const familyAfter=Object.values(afterCounts).reduce((o,c)=>{ for(const [k,v] of Object.entries(c)) o[k]=(o[k]||0)+v; return o; },{});
const provenance={phase:PHASE,generatedAt:STAMP,scope:{family:'F10 — Phillips Curve and Disinflation',canonicalConceptIds:ids},before:{libraryVersion:previousVersion,canonicalQuestionCount:beforeTotal,counts:beforeCounts,familyCounts:familyBefore,protectedCanonicalBankHashes:protectedBefore},after:{libraryVersion:library.libraryVersion,canonicalQuestionCount:library.canonicalQuestionCount,librarySha256:library.librarySha256,counts:afterCounts,familyCounts:familyAfter,protectedCanonicalBankHashes:protectedAfter},assetCorrection:{source:'build/faculty-build-composer/data/question-assets/short-run-phillips-curve/srpc.webp',sha256:correctedSha,sizeBytes:correctedBytes.length,productionCopies:assetConcepts.map(id=>`build/faculty-build-composer/data/question-assets/${id}/srpc.webp`).concat('play/economic-realm/stabilization-protocol/srpc.webp')},protectedIds,canonicalQuestionsOutsideF10Changed:false,f11QuestionBankChanged:false,repairSeedFinding:'Optional route pool supported by Composer, but Stabilization Protocol routes remediation through repair and bridge pools; no F10 Repair Seeds added.'};
const sourceData={phase:PHASE,generatedAt:STAMP,scope:ids,added:changes.filter(c=>c.action==='ADD'),rewritten:changes.filter(c=>c.action!=='ADD'),reviewedUnchanged:reviews,authoringPolicy:{soloFloors:{easy:6,medium:6,hard:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendary:6,legendaryBoss:3,repair:1,bridge:1},familyLegendary:27,familyLegendaryBoss:9,bridgeChain:ids}};

const wordCount=text=>String(text||'').trim().split(/\s+/).filter(Boolean).length;
const qualityPools={};
const f10Records=[];
for(const conceptId of ids) for(const {pool,question} of unique(library.concepts[conceptId])){
  const group=pool==='boss'?question.difficulty:pool;
  const key=`${conceptId}::${group}`;
  const correct=(question.options||[]).find(o=>answerHash(o)===question.aHash);
  const distractors=(question.options||[]).filter(o=>o!==correct);
  const cw=wordCount(correct),dw=distractors.map(wordCount);
  (qualityPools[key] ||= []).push({id:qid(question),cw,dw,uniquelyLongest:dw.every(n=>cw>n)});
  f10Records.push({conceptId,pool:group,question});
}
const answerLengthAudit=Object.fromEntries(Object.entries(qualityPools).map(([key,rows])=>{
  const correctWords=rows.reduce((n,r)=>n+r.cw,0);
  const distractorMeanWords=rows.reduce((n,r)=>n+r.dw.reduce((a,b)=>a+b,0)/Math.max(1,r.dw.length),0);
  return [key,{records:rows.length,uniquelyLongestCorrect:rows.filter(r=>r.uniquelyLongest).length,uniquelyLongestShare:Number((rows.filter(r=>r.uniquelyLongest).length/rows.length).toFixed(3)),meanCorrectDistractorRatio:Number(((correctWords/rows.length)/(distractorMeanWords/rows.length)).toFixed(3))}];
}));
const answerLengthFailures=Object.entries(answerLengthAudit).filter(([,m])=>m.uniquelyLongestShare>0.5||m.meanCorrectDistractorRatio>1.35).map(([key,m])=>[key,{...m,rows:qualityPools[key]}]);
const tokenSet=text=>new Set(String(text||'').toLowerCase().replace(/\b\d+(?:\.\d+)?%?\b/g,'#').replace(/[^a-z#]+/g,' ').split(/\s+/).filter(w=>w.length>2));
const jac=(a,b)=>{const A=tokenSet(a),B=tokenSet(b);const inter=[...A].filter(x=>B.has(x)).length;return inter/Math.max(1,new Set([...A,...B]).size);};
const nearDuplicates=[];
for(let i=0;i<f10Records.length;i++) for(let j=i+1;j<f10Records.length;j++){
  const a=f10Records[i],b=f10Records[j],score=jac(a.question.q,b.question.q);
  const changed=changes.some(c=>c.questionId===qid(a.question)||c.questionId===qid(b.question));
  if(changed&&score>=0.82) nearDuplicates.push({a:qid(a.question),b:qid(b.question),conceptA:a.conceptId,conceptB:b.conceptId,score:Number(score.toFixed(3))});
}
const optionSetMap=new Map(),repeatedAnswerSets=[];
for(const {conceptId,question} of f10Records){
  if(!changes.some(c=>c.questionId===qid(question))) continue;
  const key=(question.options||[]).map(x=>String(x).toLowerCase().replace(/\s+/g,' ').trim()).sort().join('|');
  if(optionSetMap.has(key)) repeatedAnswerSets.push({a:optionSetMap.get(key),b:qid(question),conceptId}); else optionSetMap.set(key,qid(question));
}
const quality={answerLengthAudit,answerLengthFailures,nearDuplicates,repeatedAnswerSets};
if(answerLengthFailures.length && !allowQuality) throw new Error(`Answer-length thresholds failed: ${JSON.stringify(answerLengthFailures)}`);
if(repeatedAnswerSets.length && !allowQuality) throw new Error(`Repeated answer sets introduced: ${JSON.stringify(repeatedAnswerSets)}`);
provenance.quality=quality;
sourceData.quality=quality;

if(!dryRun){
  const sourcePath=path.join(composer,`${PHASE}_questions.json`);
  const provenancePath=path.join(composer,`${PHASE}.json`);
  const scriptTarget=path.join(repo,'audit_tools','apply_macro_m2a_phillips.mjs');
  fs.writeFileSync(libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);
  fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  fs.writeFileSync(sourcePath,JSON.stringify(sourceData,null,2)+'\n');
  fs.writeFileSync(provenancePath,JSON.stringify(provenance,null,2)+'\n');
  fs.copyFileSync(new URL(import.meta.url),scriptTarget);
  for(const conceptId of assetConcepts){
    const target=path.join(dataDir,'question-assets',conceptId,'srpc.webp');
    if(path.resolve(target)!==path.resolve(correctedPath)) fs.copyFileSync(correctedPath,target);
  }
  fs.copyFileSync(correctedPath,path.join(repo,'play','economic-realm','stabilization-protocol','srpc.webp'));
  for(const file of [path.join(repo,'build','index.html'),path.join(composer,'index.html')]){
    const text=fs.readFileSync(file,'utf8').replaceAll('20260810-general-economics-final-v1','20260810-macro-m2a-phillips-v1');
    fs.writeFileSync(file,text);
  }
}

console.log(JSON.stringify({dryRun,phase:PHASE,beforeTotal,afterTotal:library.canonicalQuestionCount,added:changes.filter(c=>c.action==='ADD').length,repairRewrites:changes.filter(c=>c.action==='REPAIR_REWRITE').length,bridgeRewrites:changes.filter(c=>c.action==='BRIDGE_REWRITE').length,beforeCounts,afterCounts,familyBefore,familyAfter,protectedCanonicalBanks:protectedIds.length,correctedSrpc:{sha256:correctedSha,sizeBytes:correctedBytes.length},quality:{answerLengthFailures:quality.answerLengthFailures,nearDuplicateCount:quality.nearDuplicates.length,nearDuplicates:quality.nearDuplicates,repeatedAnswerSets:quality.repeatedAnswerSets}},null,2));
