const fs=require('fs');
const path=require('path');
const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const supportAdditions=JSON.parse(fs.readFileSync(path.join(root,'phaseMicro3b-adaptive-support-backfill-v1_questions.json'),'utf8')).questions;
const nearDup=JSON.parse(fs.readFileSync(path.join(root,'phaseMicro3b_adaptive_support_near_duplicate_results.json'),'utf8'));

const families={
  elasticity:{
    expected:495,
    children:['price-elasticity-of-demand','price-elasticity-of-supply','income-elasticity-of-demand','cross-price-elasticity-of-demand','elasticity-and-total-revenue','applications-of-elasticity'],
    supportPair:['income-elasticity-of-demand','cross-price-elasticity-of-demand']
  },
  'consumer-and-producer-surplus':{
    expected:442,
    children:['consumer-surplus','producer-surplus','total-surplus-gains-from-exchange','efficient-quantity-allocation','surplus-changes-policy-effects','efficiency-equity-surplus-limits'],
    supportPair:['surplus-changes-policy-effects','efficiency-equity-surplus-limits']
  },
  'international-trade-and-trade-policy':{
    expected:487,
    children:['trade-world-price-status','trade-domestic-production-consumption-quantities','trade-gains-surplus-winners-losers','tariffs-revenue-deadweight-loss','import-quotas-quota-rents','trade-policy-efficiency-distribution'],
    supportPair:['trade-world-price-status','trade-policy-efficiency-distribution']
  }
};
function recipe(ids,modes=['standard','timed','exam','legendary','score']){
  return {schemaVersion:'1.2.0',title:'Adaptive Retrofit Validation',slug:'adaptive-retrofit-validation',supportedModes:modes,selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
}
function moduleRecords(m){return [...Object.values(m.questions||{}).flat(),...(m.repairQuestions||[]),...(m.bridgeQuestions||[]),...(m.repairSeedQuestions||[])];}
function idsOf(records){return new Set(records.map(core.idOf));}
function difference(a,b){return [...a].filter(x=>!b.has(x));}
function routeIds(map){return new Set(Object.values(map||{}).flat().map(x=>typeof x==='string'?x:core.idOf(x)));}
function runtimeAdaptive(module){
  const out={easy:0,medium:0,hard:0};
  for(const [pool,items] of Object.entries(module.questions||{})){
    for(const q of items||[]){
      let target=pool;
      if(pool==='calculation'||pool==='integration') target=q.canonicalDifficulty||q.difficulty||'hard';
      if(Object.prototype.hasOwnProperty.call(out,target)) out[target]++;
    }
  }
  return out;
}
function quizEligible(module){
  let n=0;
  for(const [pool,items] of Object.entries(module.questions||{})) if(['easy','medium','hard','elite','calculation'].includes(pool)) n+=(items||[]).length;
  return n;
}
(async()=>{
  const issues=[]; const details={};
  if(core.COMPOSER_VERSION!=='4.5j.0') issues.push(`Core version ${core.COMPOSER_VERSION}`);
  if(library.composerVersion!=='4.5j.0') issues.push(`Library composer version ${library.composerVersion}`);
  if(library.canonicalQuestionCount!==7484) issues.push(`Canonical count ${library.canonicalQuestionCount}`);
  if(library.conceptCount!==90) issues.push(`Concept count ${library.conceptCount}`);
  if(nearDup.flags?.length) issues.push(`Adaptive-support near-duplicate flags: ${nearDup.flags.length}`);

  const allSupportNewIds=new Set(supportAdditions.map(core.idOf));
  const foundSupportNewIds=new Set();

  for(const [parentId,cfg] of Object.entries(families)){
    const parent=library.concepts[parentId];
    const parentRecs=moduleRecords(parent); const parentIds=idsOf(parentRecs);
    if(parentIds.size!==cfg.expected) issues.push(`${parentId} expected ${cfg.expected} canonical records, found ${parentIds.size}`);
    const assignmentCounts={};
    for(const q of parentRecs){
      const subs=q.subtopicIds||[];
      if(subs.length!==1) issues.push(`${core.idOf(q)} has ${subs.length} child assignments in ${parentId}`);
      if(subs[0]&&!cfg.children.includes(subs[0])) issues.push(`${core.idOf(q)} unknown child ${subs[0]}`);
      if(subs[0]) assignmentCounts[subs[0]]=(assignmentCounts[subs[0]]||0)+1;
    }

    const union=new Set(); const childInfo={};
    for(const childId of cfg.children){
      const m=core.resolveConceptModule(library,childId);
      if(!m){issues.push(`${childId} failed to resolve`);continue;}
      const recs=moduleRecords(m); const ids=idsOf(recs);
      for(const id of ids){if(union.has(id)) issues.push(`${parentId} overlap at ${id}`); union.add(id);}
      if(ids.size!==(assignmentCounts[childId]||0)) issues.push(`${childId} resolved ${ids.size} but assignment count ${assignmentCounts[childId]||0}`);
      const meta=library.registry.concepts.find(x=>x.canonicalConceptId===childId);
      const supporting=library.concepts[childId].standaloneRecommendation==='supporting-subtopic';
      const depthFloor=supporting?5:10, supportFloor=supporting?3:6;
      const rt=runtimeAdaptive(m); const support={repair:m.repairQuestions.length,bridge:m.bridgeQuestions.length};
      for(const k of ['easy','medium','hard']) if(rt[k]<depthFloor) issues.push(`${childId} ${k} ${rt[k]} < ${depthFloor}`);
      if(support.repair<supportFloor||support.bridge<supportFloor) issues.push(`${childId} support ${support.repair}/${support.bridge} < ${supportFloor}/${supportFloor}`);
      if(meta?.adaptiveDepthStatus!=='ready'||meta?.adaptiveSupportStatus!=='ready') issues.push(`${childId} registry adaptive status not ready`);
      if(JSON.stringify(meta?.runtimeAdaptiveCounts)!==JSON.stringify(rt)) issues.push(`${childId} registry/runtime adaptive count mismatch`);
      if(meta?.adaptiveSupportCounts?.repair!==support.repair||meta?.adaptiveSupportCounts?.bridge!==support.bridge) issues.push(`${childId} registry/support count mismatch`);

      // Runtime identity must be granular while family identity survives.
      for(const q of recs){
        if(q.primaryConceptId!==childId||q.tag!==childId) issues.push(`${core.idOf(q)} did not remap identity to ${childId}`);
        if(q.familyConceptId!==parentId) issues.push(`${core.idOf(q)} lost family identity ${parentId}`);
      }
      // New repair/bridge questions must survive the filtered route maps.
      const rr=routeIds(m.microSkillRepairPools); const br=routeIds(m.microSkillBridgePools);
      for(const q of m.repairQuestions){if(allSupportNewIds.has(core.idOf(q))){foundSupportNewIds.add(core.idOf(q));if(!rr.has(core.idOf(q))) issues.push(`${core.idOf(q)} missing filtered repair route`);}}
      for(const q of m.bridgeQuestions){if(allSupportNewIds.has(core.idOf(q))){foundSupportNewIds.add(core.idOf(q));if(!br.has(core.idOf(q))) issues.push(`${core.idOf(q)} missing filtered bridge route`);}}

      const eligible=quizEligible(m);
      if(!supporting && eligible<15) issues.push(`${childId} standalone/focused Quiz viability ${eligible}<15`);
      if(!supporting){
        const c=core.compose(library,recipe([childId],['timed','exam']));
        if(c.errors.length||!c.validation.modes.every(x=>x.ok)) issues.push(`${childId} should pass Timed+Exam: ${c.errors.join(' | ')}`);
      }
      childInfo[childId]={role:supporting?'supporting':'standalone/focused',canonical:ids.size,runtimeAdaptive:rt,adaptiveSupport:support,quizEligible:eligible};
    }
    if(union.size!==parentIds.size||difference(parentIds,union).length||difference(union,parentIds).length) issues.push(`${parentId} child recombination mismatch parent=${parentIds.size}, children=${union.size}`);

    // Parent and recombined children remain all-mode valid.
    for(const ids of [[parentId],cfg.children]){
      const c=core.compose(library,recipe(ids));
      if(c.errors.length||!c.validation.modes.every(x=>x.ok)) issues.push(`${ids.length===1?parentId:parentId+' children'} all-mode validation failed: ${c.errors.join(' | ')}`);
    }
    // Supporting topics are intentionally paired rather than forced standalone.
    const pair=core.compose(library,recipe(cfg.supportPair,['timed','exam']));
    if(pair.errors.length||!pair.validation.modes.every(x=>x.ok)) issues.push(`${parentId} supporting pair Timed+Exam failed: ${pair.errors.join(' | ')}`);

    // Parent+child conflict guard.
    const conflict=core.compose(library,recipe([parentId,cfg.children[0]],['exam']));
    if(!conflict.errors.some(e=>e.includes('cannot be selected together with its parent family'))) issues.push(`${parentId} parent+child conflict not rejected`);

    // Full-family answer hash validation.
    const parentComp=core.compose(library,recipe([parentId]));
    const answerAudit=await core.verifyAnswers(parentComp);
    if(!answerAudit.ok) issues.push(`${parentId} answer hash audit failed: ${answerAudit.issues.length}`);
    details[parentId]={parentCanonical:parentIds.size,childUnionCanonical:union.size,answerAuditOk:answerAudit.ok,supportPair:cfg.supportPair,children:childInfo};
  }

  if(foundSupportNewIds.size!==allSupportNewIds.size) issues.push(`Only ${foundSupportNewIds.size}/${allSupportNewIds.size} new adaptive-support IDs appeared in derived children/routes`);

  // Legacy faculty recipes must remain valid.
  const legacyDir=path.join(root,'tests','recipes'); const legacy=[];
  for(const file of fs.readdirSync(legacyDir).filter(f=>f.endsWith('.json')).sort()){
    const r=JSON.parse(fs.readFileSync(path.join(legacyDir,file),'utf8'));
    const c=core.compose(library,r); const ok=c.errors.length===0&&c.validation.modes.every(m=>m.ok);
    legacy.push({file,ok,errors:c.errors});
  }
  if(legacy.some(x=>!x.ok)) issues.push(`Legacy recipe regression: ${legacy.filter(x=>!x.ok).map(x=>x.file).join(', ')}`);

  const result={phase:'phaseMicro3b-adaptive-support-backfill-v1',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,canonicalQuestionCount:library.canonicalQuestionCount,conceptCount:library.conceptCount,nearDuplicateFlags:nearDup.flags?.length||0,newAdaptiveSupportRouted:`${foundSupportNewIds.size}/${allSupportNewIds.size}`,families:details,legacyRecipes:{passed:legacy.filter(x=>x.ok).length,total:legacy.length},issues};
  fs.writeFileSync(path.join(root,'phaseMicro3b_adaptive_retrofit_validation_results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(!result.ok) process.exit(1);
})();
