const fs=require('fs'), path=require('path');
const core=require('../composer-core.js'); const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8'); const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const qfile=JSON.parse(fs.readFileSync(path.join(root,'phaseMicro4-costs-granularity-adaptive-backfill-v1_questions.json'),'utf8')).questions;
const quality=JSON.parse(fs.readFileSync(path.join(root,'phaseMicro4_costs_quality_audit_results.json'),'utf8'));
const parentId='costs-of-production';
const children=['economic-costs','profit-concepts','short-run-production','cost-components-schedules','average-costs','marginal-cost-production-linkages','short-run-cost-curves','sunk-avoidable-costs','long-run-average-cost-scale','minimum-efficient-scale'];
const supporting=new Set(['economic-costs','sunk-avoidable-costs','minimum-efficient-scale']);
const supportPairs=[['economic-costs','profit-concepts'],['sunk-avoidable-costs','short-run-cost-curves'],['minimum-efficient-scale','long-run-average-cost-scale']];
const expectedParents={
  'elasticity':495,
  'consumer-and-producer-surplus':442,
  'international-trade-and-trade-policy':487,
  'costs-of-production':608
};
function recipe(ids,modes=['standard','timed','exam','legendary','score']){return {schemaVersion:'1.2.0',title:'M4 Costs Validation',slug:'m4-costs-validation',supportedModes:modes,selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}}}
function records(m){return [...Object.values(m.questions||{}).flat(),...(m.repairQuestions||[]),...(m.bridgeQuestions||[]),...(m.repairSeedQuestions||[])];}
function idsOf(rs){return new Set(rs.map(core.idOf));}
function runtime(m){const c={easy:0,medium:0,hard:0}; for(const [pool,arr] of Object.entries(m.questions||{})){for(const q of arr||[]){let t=pool;if(pool==='calculation'||pool==='integration')t=q.canonicalDifficulty||q.difficulty||'hard'; if(c[t]!==undefined)c[t]++;}} return c;}
function quiz(m){let n=0; for(const [p,a] of Object.entries(m.questions||{}))if(['easy','medium','hard','elite','calculation'].includes(p))n+=(a||[]).length; return n;}
function routeIds(map){return new Set(Object.values(map||{}).flat().map(x=>typeof x==='string'?x:core.idOf(x)));}
(async()=>{
 const issues=[], detail={};
 if(core.COMPOSER_VERSION!=='4.5k.0')issues.push(`core version ${core.COMPOSER_VERSION}`);
 if(library.composerVersion!=='4.5k.0')issues.push(`library version ${library.composerVersion}`);
 if(library.canonicalQuestionCount!==7650)issues.push(`canonical count ${library.canonicalQuestionCount}`);
 if(library.conceptCount!==100)issues.push(`concept count ${library.conceptCount}`);
 if(!quality.ok)issues.push('quality audit failed');
 const newIds=new Set(qfile.map(core.idOf)), routed=new Set();
 // Costs exact partition and child viability.
 const parent=library.concepts[parentId], parentIds=idsOf(records(parent)); const union=new Set();
 if(parentIds.size!==608)issues.push(`Costs parent ${parentIds.size} != 608`);
 for(const q of records(parent)){
   const subs=q.subtopicIds||[]; if(subs.length!==1)issues.push(`${core.idOf(q)} costs assignments=${subs.length}`); else if(!children.includes(subs[0]))issues.push(`${core.idOf(q)} unknown costs child ${subs[0]}`);
 }
 for(const id of children){
   const m=core.resolveConceptModule(library,id); if(!m){issues.push(`${id} resolve failed`);continue;}
   const rs=records(m), ids=idsOf(rs); for(const x of ids){if(union.has(x))issues.push(`Costs overlap ${x}`);union.add(x);}
   const rt=runtime(m), sf=supporting.has(id)?5:10, af=supporting.has(id)?3:6;
   if(!['easy','medium','hard'].every(k=>rt[k]>=sf))issues.push(`${id} adaptive depth ${JSON.stringify(rt)} floor ${sf}`);
   if(m.repairQuestions.length<af||m.bridgeQuestions.length<af)issues.push(`${id} support ${m.repairQuestions.length}/${m.bridgeQuestions.length} floor ${af}`);
   if(quiz(m)<15)issues.push(`${id} quiz pool ${quiz(m)} < 15`);
   const reg=library.registry.concepts.find(x=>x.canonicalConceptId===id);
   if(reg?.adaptiveDepthStatus!=='ready'||reg?.adaptiveSupportStatus!=='ready'||reg?.quiz15Status!=='ready')issues.push(`${id} registry status not ready`);
   // derived runtime identity
   for(const q of rs){if(q.primaryConceptId!==id||q.tag!==id)issues.push(`${core.idOf(q)} runtime identity not ${id}`);if(q.familyConceptId!==parentId)issues.push(`${core.idOf(q)} family identity lost`);}
   const rr=routeIds(m.microSkillRepairPools), br=routeIds(m.microSkillBridgePools);
   for(const q of m.repairQuestions){if(newIds.has(core.idOf(q))){routed.add(core.idOf(q));if(!rr.has(core.idOf(q)))issues.push(`${core.idOf(q)} missing repair route`);}}
   for(const q of m.bridgeQuestions){if(newIds.has(core.idOf(q))){routed.add(core.idOf(q));if(!br.has(core.idOf(q)))issues.push(`${core.idOf(q)} missing bridge route`);}}
   if(!supporting.has(id)){
     const c=core.compose(library,recipe([id],['timed','exam'])); if(c.errors.length||!c.validation.modes.every(x=>x.ok))issues.push(`${id} Timed/Exam failed: ${c.errors.join(' | ')}`);
   }
   const comp=core.compose(library,recipe([id],supporting.has(id)?[]:['timed','exam']));
   if(!supporting.has(id)){const aa=await core.verifyAnswers(comp);if(!aa.ok)issues.push(`${id} answer audit ${aa.issues.length}`);}
   detail[id]={canonical:ids.size,runtimeAdaptive:rt,repair:m.repairQuestions.length,bridge:m.bridgeQuestions.length,quizEligible:quiz(m),supporting:supporting.has(id)};
 }
 if(union.size!==parentIds.size||[...parentIds].some(x=>!union.has(x)))issues.push(`Costs recombination parent=${parentIds.size} children=${union.size}`);
 if(routed.size!==64)issues.push(`new repair/bridge routed ${routed.size}/64`);
 for(const pair of supportPairs){const c=core.compose(library,recipe(pair,['timed','exam']));if(c.errors.length||!c.validation.modes.every(x=>x.ok))issues.push(`support pair ${pair.join('+')} failed: ${c.errors.join(' | ')}`);}
 for(const ids of [[parentId],children]){const c=core.compose(library,recipe(ids));if(c.errors.length||!c.validation.modes.every(x=>x.ok))issues.push(`${ids.length===1?'parent':'all children'} all-modes failed: ${c.errors.join(' | ')}`);}
 const conflict=core.compose(library,recipe([parentId,children[0]],['exam']));if(!conflict.errors.some(e=>e.includes('cannot be selected together with its parent family')))issues.push('parent-child conflict not rejected');
 const pcomp=core.compose(library,recipe([parentId]));const paa=await core.verifyAnswers(pcomp);if(!paa.ok)issues.push(`Costs parent answer audit ${paa.issues.length}`);
 // Regression: all four granular families must still partition exactly.
 const familyChildren={
  elasticity:['price-elasticity-of-demand','price-elasticity-of-supply','income-elasticity-of-demand','cross-price-elasticity-of-demand','elasticity-and-total-revenue','applications-of-elasticity'],
  'consumer-and-producer-surplus':['consumer-surplus','producer-surplus','total-surplus-gains-from-exchange','efficient-quantity-allocation','surplus-changes-policy-effects','efficiency-equity-surplus-limits'],
  'international-trade-and-trade-policy':['trade-world-price-status','trade-domestic-production-consumption-quantities','trade-gains-surplus-winners-losers','tariffs-revenue-deadweight-loss','import-quotas-quota-rents','trade-policy-efficiency-distribution'],
  'costs-of-production':children
 };
 const regression={};
 for(const [pid,ch] of Object.entries(familyChildren)){const pids=idsOf(records(library.concepts[pid])), u=new Set(); for(const c of ch){for(const x of idsOf(records(core.resolveConceptModule(library,c)))){if(u.has(x))issues.push(`${pid} regression overlap ${x}`);u.add(x);}} const ok=pids.size===expectedParents[pid]&&u.size===pids.size&&[...pids].every(x=>u.has(x));if(!ok)issues.push(`${pid} regression partition ${pids.size}/${u.size}`);regression[pid]={parent:pids.size,children:u.size,ok};}
 // Legacy recipes.
 const legacyDir=path.join(root,'tests','recipes'); let pass=0,total=0; for(const f of fs.readdirSync(legacyDir).filter(f=>f.endsWith('.json'))){total++;const r=JSON.parse(fs.readFileSync(path.join(legacyDir,f),'utf8'));const c=core.compose(library,r);if(!c.errors.length&&c.validation.modes.every(x=>x.ok))pass++;else issues.push(`legacy recipe ${f} failed`);}
 const result={phase:'phaseMicro4-costs-granularity-adaptive-backfill-v1',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,canonicalQuestionCount:library.canonicalQuestionCount,conceptCount:library.conceptCount,costsParentCanonical:parentIds.size,costsChildrenUnion:union.size,newAdaptiveSupportRouted:`${routed.size}/64`,qualityAuditOk:quality.ok,costsChildren:detail,regression,legacyRecipes:{passed:pass,total},issues};
 fs.writeFileSync(path.join(root,'phaseMicro4_costs_granularity_validation_results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.ok)process.exit(1);
})();
