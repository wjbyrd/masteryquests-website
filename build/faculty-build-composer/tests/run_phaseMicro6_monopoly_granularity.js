const fs=require('fs'), path=require('path'), crypto=require('crypto');
const core=require('../composer-core.js'); const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8'); const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const qfile=JSON.parse(fs.readFileSync(path.join(root,'phaseMicro6-monopoly-granularity-adaptive-backfill-v1_questions.json'),'utf8')).questions;
const quality=JSON.parse(fs.readFileSync(path.join(root,'phaseMicro6_monopoly_quality_audit_results.json'),'utf8'));
const parentId='monopoly';
const children=['monopoly-power-barriers','monopoly-demand-revenue','monopoly-output-price','monopoly-profit-loss-shutdown','monopoly-welfare-efficiency','natural-monopoly-regulation','monopoly-price-discrimination'];
const supporting=new Set(['monopoly-power-barriers']);
const supportPairs=[['monopoly-power-barriers','monopoly-demand-revenue']];
const expectedParents={elasticity:495,'consumer-and-producer-surplus':442,'international-trade-and-trade-policy':487,'costs-of-production':608,'perfect-competition':565,monopoly:524};
function recipe(ids,modes=['standard','timed','exam','legendary','score']){return {schemaVersion:'1.2.0',title:'M6 Monopoly Validation',slug:'m6-monopoly-validation',supportedModes:modes,selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}}}
function records(m){return [...Object.values(m.questions||{}).flat(),...(m.repairQuestions||[]),...(m.bridgeQuestions||[]),...(m.repairSeedQuestions||[])];}
function idsOf(rs){return new Set(rs.map(core.idOf));}
function runtime(m){const c={easy:0,medium:0,hard:0};for(const [pool,arr] of Object.entries(m.questions||{})){for(const q of arr||[]){let t=pool;if(pool==='calculation'||pool==='integration')t=q.canonicalDifficulty||q.difficulty||'hard';if(c[t]!==undefined)c[t]++;}}return c;}
function quiz(m){let n=0;for(const [p,a] of Object.entries(m.questions||{}))if(['easy','medium','hard','elite','calculation'].includes(p))n+=(a||[]).length;return n;}
function routeIds(map){return new Set(Object.values(map||{}).flat().map(x=>typeof x==='string'?x:core.idOf(x)));}
(async()=>{
 const issues=[],detail={};
 if(core.COMPOSER_VERSION!=='4.5m.0')issues.push(`core version ${core.COMPOSER_VERSION}`);
 if(library.composerVersion!=='4.5m.0')issues.push(`library version ${library.composerVersion}`);
 if(library.canonicalQuestionCount!==7855)issues.push(`canonical count ${library.canonicalQuestionCount}`);
 if(library.conceptCount!==115)issues.push(`concept count ${library.conceptCount}`);
 if(!quality.ok)issues.push('quality audit failed');
 const newIds=new Set(qfile.map(core.idOf)),routed=new Set();
 const parent=library.concepts[parentId],parentIds=idsOf(records(parent)),union=new Set();
 if(parentIds.size!==524)issues.push(`Monopoly parent ${parentIds.size} != 524`);
 for(const q of records(parent)){const subs=q.subtopicIds||[];if(subs.length!==1)issues.push(`${core.idOf(q)} Monopoly assignments=${subs.length}`);else if(!children.includes(subs[0]))issues.push(`${core.idOf(q)} unknown Monopoly child ${subs[0]}`);}
 for(const id of children){
  const m=core.resolveConceptModule(library,id);if(!m){issues.push(`${id} resolve failed`);continue;}
  const rs=records(m),ids=idsOf(rs);for(const x of ids){if(union.has(x))issues.push(`Monopoly overlap ${x}`);union.add(x);}
  const rt=runtime(m),df=supporting.has(id)?5:10,sf=supporting.has(id)?3:6;
  if(!['easy','medium','hard'].every(k=>rt[k]>=df))issues.push(`${id} adaptive depth ${JSON.stringify(rt)} floor ${df}`);
  if(m.repairQuestions.length<sf||m.bridgeQuestions.length<sf)issues.push(`${id} support ${m.repairQuestions.length}/${m.bridgeQuestions.length} floor ${sf}`);
  if(quiz(m)<15)issues.push(`${id} quiz pool ${quiz(m)} < 15`);
  const reg=library.registry.concepts.find(x=>x.canonicalConceptId===id);
  if(reg?.adaptiveDepthStatus!=='ready'||reg?.adaptiveSupportStatus!=='ready'||reg?.quiz15Status!=='ready')issues.push(`${id} registry status not ready`);
  for(const q of rs){if(q.primaryConceptId!==id||q.tag!==id)issues.push(`${core.idOf(q)} runtime identity not ${id}`);if(q.familyConceptId!==parentId)issues.push(`${core.idOf(q)} family identity lost`);}
  const rr=routeIds(m.microSkillRepairPools),br=routeIds(m.microSkillBridgePools);
  for(const q of m.repairQuestions){if(newIds.has(core.idOf(q))){routed.add(core.idOf(q));if(!rr.has(core.idOf(q)))issues.push(`${core.idOf(q)} missing repair route`);}}
  for(const q of m.bridgeQuestions){if(newIds.has(core.idOf(q))){routed.add(core.idOf(q));if(!br.has(core.idOf(q)))issues.push(`${core.idOf(q)} missing bridge route`);}}
  if(!supporting.has(id)){const c=core.compose(library,recipe([id],['timed','exam']));if(c.errors.length||!c.validation.modes.every(x=>x.ok))issues.push(`${id} Timed/Exam failed: ${c.errors.join(' | ')}`);const aa=await core.verifyAnswers(c);if(!aa.ok)issues.push(`${id} answer audit ${aa.issues.length}`);}
  detail[id]={canonical:ids.size,runtimeAdaptive:rt,repair:m.repairQuestions.length,bridge:m.bridgeQuestions.length,quizEligible:quiz(m),supporting:supporting.has(id)};
 }
 if(union.size!==parentIds.size||[...parentIds].some(x=>!union.has(x)))issues.push(`Monopoly recombination parent=${parentIds.size} children=${union.size}`);
 if(routed.size!==38)issues.push(`new repair/bridge routed ${routed.size}/38`);
 for(const pair of supportPairs){const c=core.compose(library,recipe(pair,['timed','exam']));if(c.errors.length||!c.validation.modes.every(x=>x.ok))issues.push(`support pair ${pair.join('+')} failed: ${c.errors.join(' | ')}`);const aa=await core.verifyAnswers(c);if(!aa.ok)issues.push(`support pair ${pair.join('+')} answer audit`);}
 for(const ids of [[parentId],children]){const c=core.compose(library,recipe(ids));if(c.errors.length||!c.validation.modes.every(x=>x.ok))issues.push(`${ids.length===1?'parent':'all children'} all-modes failed: ${c.errors.join(' | ')}`);const aa=await core.verifyAnswers(c);if(!aa.ok)issues.push(`${ids.length===1?'parent':'all children'} answer audit ${aa.issues.length}`);}
 const conflict=core.compose(library,recipe([parentId,children[0]],['exam']));if(!conflict.errors.some(e=>e.includes('cannot be selected together with its parent family')))issues.push('parent-child conflict not rejected');
 // Monopoly graph expansion remains untouched: 60 source questions over MON-01..04; total graph coverage remains 72.
 const graphSource='phase6.2g-monopoly-graph-expansion-v2';
 const graphQs=Object.values(parent.questions||{}).flat().filter(q=>(q.sourceOccurrences||[]).some(o=>o.sourceFile===graphSource));
 const graphCounts={};for(const q of graphQs){const m=(q.image||'').match(/MON-(\d\d)\.webp$/);if(m)graphCounts[m[1]]=(graphCounts[m[1]]||0)+1;}
 const expectedGraphs={'01':16,'02':16,'03':14,'04':14};for(const [g,n] of Object.entries(expectedGraphs))if(graphCounts[g]!==n)issues.push(`Monopoly graph ${g} ${graphCounts[g]||0}/${n}`);if(graphQs.length!==60)issues.push(`Monopoly graph source count ${graphQs.length}/60`);
 const totalGraph=records(parent).filter(q=>q.image).length;if(totalGraph!==72)issues.push(`Monopoly total graph coverage ${totalGraph}/72`);
 const monAssets=library.assetInventory.filter(a=>a.conceptId===parentId);if(monAssets.length!==98)issues.push(`Monopoly assets ${monAssets.length}/98`);for(const a of monAssets){const p=path.join(root,'data',a.runtimePath);if(!fs.existsSync(p)){issues.push(`missing asset ${a.runtimePath}`);continue;}const h=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');if(h!==a.sha256)issues.push(`asset hash ${a.runtimePath}`);}
 // Regression: all six granular families partition exactly.
 const familyChildren={
  elasticity:['price-elasticity-of-demand','price-elasticity-of-supply','income-elasticity-of-demand','cross-price-elasticity-of-demand','elasticity-and-total-revenue','applications-of-elasticity'],
  'consumer-and-producer-surplus':['consumer-surplus','producer-surplus','total-surplus-gains-from-exchange','efficient-quantity-allocation','surplus-changes-policy-effects','efficiency-equity-surplus-limits'],
  'international-trade-and-trade-policy':['trade-world-price-status','trade-domestic-production-consumption-quantities','trade-gains-surplus-winners-losers','tariffs-revenue-deadweight-loss','import-quotas-quota-rents','trade-policy-efficiency-distribution'],
  'costs-of-production':['economic-costs','profit-concepts','short-run-production','cost-components-schedules','average-costs','marginal-cost-production-linkages','short-run-cost-curves','sunk-avoidable-costs','long-run-average-cost-scale','minimum-efficient-scale'],
  'perfect-competition':['competitive-market-price-taking-revenue','competitive-output-choice','competitive-profit-loss','competitive-shutdown','competitive-short-run-supply','competitive-entry-exit-long-run','competitive-industry-cost-conditions','competitive-efficiency-limits'],
  monopoly:children
 };
 const regression={};for(const [pid,ch] of Object.entries(familyChildren)){const pids=idsOf(records(library.concepts[pid])),u=new Set();for(const c of ch){for(const x of idsOf(records(core.resolveConceptModule(library,c)))){if(u.has(x))issues.push(`${pid} regression overlap ${x}`);u.add(x);}}const ok=pids.size===expectedParents[pid]&&u.size===pids.size&&[...pids].every(x=>u.has(x));if(!ok)issues.push(`${pid} regression partition ${pids.size}/${u.size}`);regression[pid]={parent:pids.size,children:u.size,ok};}
 // Legacy recipes.
 const legacyDir=path.join(root,'tests','recipes');let pass=0,total=0;for(const f of fs.readdirSync(legacyDir).filter(f=>f.endsWith('.json'))){total++;const r=JSON.parse(fs.readFileSync(path.join(legacyDir,f),'utf8'));const c=core.compose(library,r);if(!c.errors.length&&c.validation.modes.every(x=>x.ok))pass++;else issues.push(`legacy recipe ${f} failed`);}
 const result={phase:'phaseMicro6-monopoly-granularity-adaptive-backfill-v1',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,canonicalQuestionCount:library.canonicalQuestionCount,conceptCount:library.conceptCount,monopolyParentCanonical:parentIds.size,monopolyChildrenUnion:union.size,newAdaptiveSupportRouted:`${routed.size}/38`,qualityAuditOk:quality.ok,graphExpansion:{sourceQuestions:graphQs.length,graphCounts,totalGraphCoverage:totalGraph,assets:monAssets.length},children:detail,regression,legacyRecipes:{passed:pass,total},issues};
 fs.writeFileSync(path.join(root,'phaseMicro6_monopoly_granularity_validation_results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.ok)process.exit(1);
})();
