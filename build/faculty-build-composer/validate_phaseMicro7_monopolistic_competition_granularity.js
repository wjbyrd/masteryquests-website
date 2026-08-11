const fs=require('fs'),path=require('path');
const core=require('./composer-core.js');
const root=__dirname;
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const lib=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const qfile=JSON.parse(fs.readFileSync(path.join(root,'phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1_questions.json'),'utf8'));
const newIds=new Set(qfile.questions.map(q=>q.id));
const ids=['mcomp-structure-differentiation','mcomp-short-run-choice','mcomp-entry-exit-long-run','mcomp-advertising-nonprice','mcomp-efficiency-variety-limits'];
const standalone=['mcomp-short-run-choice','mcomp-entry-exit-long-run','mcomp-advertising-nonprice'];
const supportPairs=[['mcomp-structure-differentiation','mcomp-short-run-choice'],['mcomp-efficiency-variety-limits','mcomp-advertising-nonprice']];
function records(cid){
 const m=lib.concepts[cid], out=[]; if(!m) return out;
 for(const [p,a] of Object.entries(m.questions||{}))for(const q of (a||[]))out.push([p,q]);
 for(const [k,p] of [['repairQuestions','repair'],['bridgeQuestions','bridge'],['repairSeedQuestions','repairSeed']])for(const q of (m[k]||[]))out.push([p,q]);
 return out;
}
const parentRecords=records('monopolistic-competition');
const parentIds=new Set(parentRecords.map(([p,q])=>q.canonicalId||q.id));
const childSets={}; for(const sid of ids)childSets[sid]=new Set(parentRecords.filter(([p,q])=>(q.subtopicIds||[]).includes(sid)).map(([p,q])=>q.canonicalId||q.id));
const union=new Set(); let overlaps=[]; const seen=new Map();
for(const sid of ids)for(const qid of childSets[sid]){if(seen.has(qid))overlaps.push([qid,seen.get(qid),sid]);else seen.set(qid,sid);union.add(qid);}
function runtime(sid){let c={easy:0,medium:0,hard:0};for(const [p,q] of parentRecords){if(!(q.subtopicIds||[]).includes(sid))continue;if(['easy','medium','hard'].includes(p))c[p]++;else if(['calculation','integration'].includes(p)){let d=q.canonicalDifficulty||q.difficulty||'hard';if(!['easy','medium','hard'].includes(d))d='hard';c[d]++;}}return c;}
function support(sid){let repair=0,bridge=0,quiz=0,canonical=0;for(const [p,q] of parentRecords){if(!(q.subtopicIds||[]).includes(sid))continue;canonical++;if(p==='repair')repair++;if(p==='bridge')bridge++;if(['easy','medium','hard','elite','calculation'].includes(p))quiz++;}return {canonical,runtimeAdaptive:runtime(sid),repair,bridge,quizEligible:quiz,supporting:lib.concepts[sid].standaloneRecommendation==='supporting-subtopic'};}
function recipe(selected,modes,title){return {schemaVersion:'1.2.0',title,slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),supportedModes:modes,selectedConceptIds:selected,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};}
async function checkCompose(selected,modes,title){const c=core.compose(lib,recipe(selected,modes,title));const aa=await core.verifyAnswers(c);return {ok:c.errors.length===0&&aa.ok&&c.validation.modes.every(m=>m.ok),errors:c.errors,warnings:c.warnings,counts:c.counts,modes:c.validation.modes.map(m=>({mode:m.mode,ok:m.ok,issues:m.issues||[]})),answerAudit:aa.ok};}
(async()=>{
 const issues=[]; const checks={};
 if(parentIds.size!==459)issues.push(`parent ${parentIds.size}`);
 if(union.size!==459)issues.push(`union ${union.size}`);
 if(overlaps.length)issues.push(`overlaps ${overlaps.length}`);
 for(const sid of ids){const s=support(sid), floor=s.supporting?5:10, sf=s.supporting?3:6;if(s.runtimeAdaptive.easy<floor||s.runtimeAdaptive.medium<floor||s.runtimeAdaptive.hard<floor||s.repair<sf||s.bridge<sf||s.quizEligible<15)issues.push(`floor ${sid}`);checks[sid]=s;}
 const repairMap=lib.concepts['monopolistic-competition'].microSkillRepairPools||{}, bridgeMap=lib.concepts['monopolistic-competition'].microSkillBridgePools||{};
 const routedRepair=new Set(Object.values(repairMap).flat()).size; const routedBridge=new Set(Object.values(bridgeMap).flat()).size;
 const newRepair=qfile.questions.filter(q=>q.sourcePool==='repair').filter(q=>Object.values(repairMap).flat().includes(q.id)).length;
 const newBridge=qfile.questions.filter(q=>q.sourcePool==='bridge').filter(q=>Object.values(bridgeMap).flat().includes(q.id)).length;
 if(newRepair!==6||newBridge!==6)issues.push(`new support routed ${newRepair}/${newBridge}`);
 const parentCompose=await checkCompose(['monopolistic-competition'],['standard','timed','exam','legendary','score'],'MC Parent Validation');if(!parentCompose.ok)issues.push('parent compose');
 const allChildren=await checkCompose(ids,['standard','timed','exam','legendary','score'],'MC Children Validation');if(!allChildren.ok)issues.push('all children compose');
 const focused={};for(const sid of standalone){focused[sid]=await checkCompose([sid],['timed','exam'],`MC ${sid}`);if(!focused[sid].ok)issues.push(`focused ${sid}`);}
 const paired={};for(const pair of supportPairs){const key=pair.join('+');paired[key]=await checkCompose(pair,['timed','exam'],`MC ${key}`);if(!paired[key].ok)issues.push(`pair ${key}`);}
 const regress={};for(const e of lib.registry.concepts.filter(e=>e.selectionRole==='family-parent'&&Array.isArray(e.childConceptIds))){const pid=e.canonicalConceptId;const pset=new Set(records(pid).map(([p,q])=>q.canonicalId||q.id));let u=new Set(),ov=0;for(const sid of e.childConceptIds){for(const [p,q] of records(pid)){if((q.subtopicIds||[]).includes(sid)){const id=q.canonicalId||q.id;if(u.has(id))ov++;u.add(id);}}}regress[pid]={parent:pset.size,children:u.size,overlap:ov,ok:pset.size===u.size&&ov===0};if(!regress[pid].ok)issues.push(`regress ${pid}`);}
 const legacyFiles=fs.readdirSync(path.join(root,'tests','recipes')).filter(x=>x.endsWith('.json'));let legacyPass=0;const legacy=[];for(const f of legacyFiles){const r=JSON.parse(fs.readFileSync(path.join(root,'tests','recipes',f),'utf8'));const c=core.compose(lib,r);const ok=c.errors.length===0&&c.validation.modes.every(m=>m.ok);legacy.push({file:f,ok,errors:c.errors});if(ok)legacyPass++;else issues.push(`legacy ${f}`);}
 const graphQuestions=parentRecords.filter(([p,q])=>q.image).length; const assetCount=(lib.assetInventory||[]).filter(a=>String(a.runtimePath||'').startsWith('question-assets/monopolistic-competition/')).length;if(graphQuestions!==55)issues.push(`graphs ${graphQuestions}`);if(assetCount!==38)issues.push(`assets ${assetCount}`);
 const result={phase:'phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,canonicalQuestionCount:lib.canonicalQuestionCount,conceptCount:lib.conceptCount,parentCanonical:parentIds.size,childrenUnion:union.size,newAdaptiveSupportRouted:`${newRepair+newBridge}/12`,graphCoverage:{graphQuestions,assets:assetCount},children:checks,parentCompose:{ok:parentCompose.ok,counts:parentCompose.counts,modes:parentCompose.modes},allChildrenCompose:{ok:allChildren.ok,counts:allChildren.counts,modes:allChildren.modes},focused:Object.fromEntries(Object.entries(focused).map(([k,v])=>[k,{ok:v.ok,counts:v.counts,modes:v.modes}])),paired:Object.fromEntries(Object.entries(paired).map(([k,v])=>[k,{ok:v.ok,counts:v.counts,modes:v.modes}])),regression:regress,legacyRecipes:{passed:legacyPass,total:legacyFiles.length,details:legacy},issues};
 fs.writeFileSync(path.join(root,'phaseMicro7_monopolistic_competition_granularity_validation_results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.ok)process.exit(1);
})();
