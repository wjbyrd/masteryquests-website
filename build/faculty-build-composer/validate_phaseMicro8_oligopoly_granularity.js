const fs=require('fs'),path=require('path');
const core=require('./composer-core.js');
const root=__dirname;
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const lib=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const qfile=JSON.parse(fs.readFileSync(path.join(root,'phaseMicro8-oligopoly-granularity-adaptive-backfill-v1_questions.json'),'utf8'));
const ids=['oligopoly-structure-concentration','oligopoly-game-theory-foundations','oligopoly-collusion-cartels','oligopoly-dynamic-strategy','oligopoly-rivalry-coordination','oligopoly-welfare-policy'];
const standalone=['oligopoly-structure-concentration','oligopoly-game-theory-foundations','oligopoly-collusion-cartels','oligopoly-welfare-policy'];
const supportPairs=[['oligopoly-dynamic-strategy','oligopoly-game-theory-foundations'],['oligopoly-rivalry-coordination','oligopoly-structure-concentration']];
const coreChildren=['oligopoly-structure-concentration','oligopoly-game-theory-foundations','oligopoly-collusion-cartels','oligopoly-rivalry-coordination','oligopoly-welfare-policy'];
function records(cid){
 const m=lib.concepts[cid],out=[];if(!m)return out;
 for(const [p,a] of Object.entries(m.questions||{}))for(const q of (a||[]))out.push([p,q]);
 for(const [k,p] of [['repairQuestions','repair'],['bridgeQuestions','bridge'],['repairSeedQuestions','repairSeed']])for(const q of (m[k]||[]))out.push([p,q]);
 return out;
}
const parentRecords=records('oligopoly');
const parentIds=new Set(parentRecords.map(([p,q])=>q.canonicalId||q.id));
const childSets={};for(const sid of ids)childSets[sid]=new Set(parentRecords.filter(([p,q])=>(q.subtopicIds||[]).includes(sid)).map(([p,q])=>q.canonicalId||q.id));
const union=new Set();let overlaps=[];const seen=new Map();for(const sid of ids)for(const qid of childSets[sid]){if(seen.has(qid))overlaps.push([qid,seen.get(qid),sid]);else seen.set(qid,sid);union.add(qid);}
function runtime(sid){let c={easy:0,medium:0,hard:0};for(const [p,q] of parentRecords){if(!(q.subtopicIds||[]).includes(sid))continue;if(['easy','medium','hard'].includes(p))c[p]++;else if(['calculation','integration'].includes(p)){let d=q.canonicalDifficulty||q.difficulty||'hard';if(!['easy','medium','hard'].includes(d))d='hard';c[d]++;}}return c;}
function support(sid){let repair=0,bridge=0,quiz=0,canonical=0;for(const [p,q] of parentRecords){if(!(q.subtopicIds||[]).includes(sid))continue;canonical++;if(p==='repair')repair++;if(p==='bridge')bridge++;if(['easy','medium','hard','elite','calculation'].includes(p))quiz++;}const role=String(lib.concepts[sid].standaloneRecommendation||'');return {canonical,runtimeAdaptive:runtime(sid),repair,bridge,quizEligible:quiz,supporting:role.startsWith('supporting'),role,advancedOptional:!!lib.registry.concepts.find(e=>e.canonicalConceptId===sid)?.advancedOptional};}
function recipe(selected,modes,title){return {schemaVersion:'1.2.0',title,slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),supportedModes:modes,selectedConceptIds:selected,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};}
async function checkCompose(selected,modes,title){const c=core.compose(lib,recipe(selected,modes,title));const aa=await core.verifyAnswers(c);return {ok:c.errors.length===0&&aa.ok&&c.validation.modes.every(m=>m.ok),errors:c.errors,warnings:c.warnings,counts:c.counts,modes:c.validation.modes.map(m=>({mode:m.mode,ok:m.ok,issues:m.issues||[]})),answerAudit:aa.ok};}
(async()=>{
 const issues=[];const checks={};
 if(parentIds.size!==445)issues.push(`parent ${parentIds.size}`);if(union.size!==445)issues.push(`union ${union.size}`);if(overlaps.length)issues.push(`overlaps ${overlaps.length}`);
 for(const sid of ids){const s=support(sid),floor=s.supporting?5:10,sf=s.supporting?3:6;if(s.runtimeAdaptive.easy<floor||s.runtimeAdaptive.medium<floor||s.runtimeAdaptive.hard<floor||s.repair<sf||s.bridge<sf||s.quizEligible<15)issues.push(`floor ${sid}`);checks[sid]=s;}
 const dyn=lib.registry.concepts.find(e=>e.canonicalConceptId==='oligopoly-dynamic-strategy');if(!dyn||dyn.coverageStatus!=='supporting-advanced'||!dyn.advancedOptional)issues.push('dynamic advanced metadata');
 const parentEntry=lib.registry.concepts.find(e=>e.canonicalConceptId==='oligopoly');if(!parentEntry||!Array.isArray(parentEntry.childConceptIds)||parentEntry.childConceptIds.length!==6)issues.push('parent child metadata');
 const repairMap=lib.concepts['oligopoly'].microSkillRepairPools||{},bridgeMap=lib.concepts['oligopoly'].microSkillBridgePools||{};
 const repairIds=Object.values(repairMap).flat(),bridgeIds=Object.values(bridgeMap).flat();
 const newRepair=qfile.questions.filter(q=>q.sourcePool==='repair').filter(q=>repairIds.includes(q.id)).length;
 const newBridge=qfile.questions.filter(q=>q.sourcePool==='bridge').filter(q=>bridgeIds.includes(q.id)).length;
 if(newRepair!==10||newBridge!==11)issues.push(`new support routed ${newRepair}/${newBridge}`);
 const parentCompose=await checkCompose(['oligopoly'],['standard','timed','exam','legendary','score'],'Oligopoly Parent Validation');if(!parentCompose.ok)issues.push('parent compose');
 const allChildren=await checkCompose(ids,['standard','timed','exam','legendary','score'],'Oligopoly Children Validation');if(!allChildren.ok)issues.push('all children compose');
 const coreCompose=await checkCompose(coreChildren,['standard','timed','exam','legendary','score'],'Oligopoly Core Children Validation');if(!coreCompose.ok)issues.push('core children compose');
 const focused={};for(const sid of standalone){focused[sid]=await checkCompose([sid],['timed','exam'],`OLI ${sid}`);if(!focused[sid].ok)issues.push(`focused ${sid}`);}
 const paired={};for(const pair of supportPairs){const key=pair.join('+');paired[key]=await checkCompose(pair,['timed','exam'],`OLI ${key}`);if(!paired[key].ok)issues.push(`pair ${key}`);}
 // parent/child conflict must be rejected
 const conflict=core.compose(lib,recipe(['oligopoly','oligopoly-game-theory-foundations'],['exam'],'OLI Conflict'));if(conflict.errors.length===0)issues.push('parent child conflict accepted');
 const regress={};for(const e of lib.registry.concepts.filter(e=>e.selectionRole==='family-parent'&&Array.isArray(e.childConceptIds))){const pid=e.canonicalConceptId,pset=new Set(records(pid).map(([p,q])=>q.canonicalId||q.id));let u=new Set(),ov=0;for(const sid of e.childConceptIds){for(const [p,q] of records(pid)){if((q.subtopicIds||[]).includes(sid)){const id=q.canonicalId||q.id;if(u.has(id))ov++;u.add(id);}}}regress[pid]={parent:pset.size,children:u.size,overlap:ov,ok:pset.size===u.size&&ov===0};if(!regress[pid].ok)issues.push(`regress ${pid}`);}
 const legacyFiles=fs.readdirSync(path.join(root,'tests','recipes')).filter(x=>x.endsWith('.json'));let legacyPass=0;const legacy=[];for(const f of legacyFiles){const r=JSON.parse(fs.readFileSync(path.join(root,'tests','recipes',f),'utf8'));const c=core.compose(lib,r);const ok=c.errors.length===0&&c.validation.modes.every(m=>m.ok);legacy.push({file:f,ok,errors:c.errors});if(ok)legacyPass++;else issues.push(`legacy ${f}`);}
 const graphQuestions=parentRecords.filter(([p,q])=>q.image).length;const assetCount=(lib.assetInventory||[]).filter(a=>String(a.runtimePath||'').startsWith('question-assets/oligopoly/')).length;if(graphQuestions!==123)issues.push(`graphs ${graphQuestions}`);if(assetCount!==42)issues.push(`assets ${assetCount}`);
 const result={phase:'phaseMicro8-oligopoly-granularity-adaptive-backfill-v1',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,canonicalQuestionCount:lib.canonicalQuestionCount,conceptCount:lib.conceptCount,parentCanonical:parentIds.size,childrenUnion:union.size,newAdaptiveSupportRouted:`${newRepair+newBridge}/21`,graphCoverage:{graphQuestions,assets:assetCount},children:checks,parentCompose:{ok:parentCompose.ok,counts:parentCompose.counts,modes:parentCompose.modes},allChildrenCompose:{ok:allChildren.ok,counts:allChildren.counts,modes:allChildren.modes},coreChildrenCompose:{ok:coreCompose.ok,counts:coreCompose.counts,modes:coreCompose.modes},focused:Object.fromEntries(Object.entries(focused).map(([k,v])=>[k,{ok:v.ok,counts:v.counts,modes:v.modes}])),paired:Object.fromEntries(Object.entries(paired).map(([k,v])=>[k,{ok:v.ok,counts:v.counts,modes:v.modes}])),parentChildConflictRejected:conflict.errors.length>0,regression:regress,legacyRecipes:{passed:legacyPass,total:legacyFiles.length,details:legacy},issues};
 fs.writeFileSync(path.join(root,'phaseMicro8_oligopoly_granularity_validation_results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.ok)process.exit(1);
})();
