const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const parentId='consumer-and-producer-surplus';
const childIds=[
  'consumer-surplus',
  'producer-surplus',
  'total-surplus-gains-from-exchange',
  'efficient-quantity-allocation',
  'surplus-changes-policy-effects',
  'efficiency-equity-surplus-limits'
];
const expectedTotals={
  'consumer-surplus':54,
  'producer-surplus':56,
  'total-surplus-gains-from-exchange':72,
  'efficient-quantity-allocation':99,
  'surplus-changes-policy-effects':61,
  'efficiency-equity-surplus-limits':28
};
function recipe(ids,modes=['standard','timed','exam','legendary','score']){
  return {schemaVersion:'1.2.0',title:'Surplus Granularity Validation',slug:'surplus-granularity-validation',supportedModes:modes,selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
}
function allIds(comp){return new Set([...Object.values(comp.banks).flat(),...comp.repairQuestions,...comp.bridgeQuestions,...Object.values(comp.skillRepairSeedPools||{}).flat()].map(core.idOf));}
function setDiff(a,b){return [...a].filter(x=>!b.has(x));}
function sourceRecords(module){return [...Object.values(module.questions||{}).flat(),...(module.repairQuestions||[]),...(module.bridgeQuestions||[]),...(module.repairSeedQuestions||[])];}
function semanticFingerprint(q){
  const copy=JSON.parse(JSON.stringify(q));
  delete copy.familyConceptId; delete copy.subtopicIds; delete copy.composerSubtopicId; delete copy.sourcePrimaryConceptId;
  return crypto.createHash('sha256').update(JSON.stringify(copy)).digest('hex');
}
(async()=>{
  const issues=[];
  if(core.COMPOSER_VERSION!=='4.5g.0') issues.push(`Core version expected 4.5g.0, found ${core.COMPOSER_VERSION}`);
  if(library.composerVersion!=='4.5g.0') issues.push(`Library composer version expected 4.5g.0, found ${library.composerVersion}`);
  if(library.canonicalQuestionCount!==7274) issues.push(`Canonical question count changed: ${library.canonicalQuestionCount}`);
  const parent=library.concepts[parentId];
  const records=sourceRecords(parent);
  if(records.length!==370) issues.push(`Parent source record count expected 370, found ${records.length}`);
  const assignmentCounts={};
  for(const q of records){
    const subs=Array.isArray(q.subtopicIds)?q.subtopicIds:[];
    if(subs.length!==1) issues.push(`${core.idOf(q)} has ${subs.length} subtopic assignments`);
    if(subs[0] && !childIds.includes(subs[0])) issues.push(`${core.idOf(q)} has unknown subtopic ${subs[0]}`);
    if(q.familyConceptId!==parentId) issues.push(`${core.idOf(q)} missing familyConceptId`);
    if(subs[0]) assignmentCounts[subs[0]]=(assignmentCounts[subs[0]]||0)+1;
  }
  for(const id of childIds){
    if(!library.concepts[id]?.derivedFromConceptId) issues.push(`${id} missing derived descriptor`);
    const reg=library.registry.concepts.find(c=>c.canonicalConceptId===id);
    if(!reg || reg.parentConceptId!==parentId) issues.push(`${id} missing child registry metadata`);
    if(assignmentCounts[id]!==expectedTotals[id]) issues.push(`${id} source assignment expected ${expectedTotals[id]}, found ${assignmentCounts[id]||0}`);
  }

  const parentComp=core.compose(library,recipe([parentId]));
  const childComp=core.compose(library,recipe(childIds));
  const parentSet=allIds(parentComp), childSet=allIds(childComp);
  if(parentSet.size!==370 || childSet.size!==370) issues.push(`Union size mismatch parent=${parentSet.size} children=${childSet.size}`);
  const parentOnly=setDiff(parentSet,childSet), childOnly=setDiff(childSet,parentSet);
  if(parentOnly.length || childOnly.length) issues.push(`Parent/child union mismatch parentOnly=${parentOnly.length} childOnly=${childOnly.length}`);
  const countKeys=['easy','medium','hard','elite','legendary','easyBoss','mediumBoss','finalBoss','legendaryBoss','repair','bridge','calculation','integration','graph','assets','totalCanonical'];
  for(const k of countKeys) if(parentComp.counts[k]!==childComp.counts[k]) issues.push(`Recombined count mismatch ${k}: parent=${parentComp.counts[k]} children=${childComp.counts[k]}`);
  if(childComp.errors.length) issues.push(`All-child composition errors: ${childComp.errors.join(' | ')}`);

  const seen=new Set();
  const childDetails={};
  for(const id of childIds){
    const module=core.resolveConceptModule(library,id);
    if(!module) {issues.push(`${id} could not resolve`); continue;}
    const c=core.compose(library,recipe([id],['exam']));
    const ids=allIds(c);
    if(ids.size!==expectedTotals[id]) issues.push(`${id} expected ${expectedTotals[id]} canonical records, found ${ids.size}`);
    for(const qid of ids){if(seen.has(qid)) issues.push(`Question ${qid} overlaps between child subtopics`); seen.add(qid);}
    const runtimeQs=[...Object.values(c.banks).flat(),...c.repairQuestions,...c.bridgeQuestions];
    for(const q of runtimeQs){
      if(q.primaryConceptId!==id || q.tag!==id) issues.push(`${core.idOf(q)} runtime identity did not remap to ${id}`);
      if(q.familyConceptId!==parentId) issues.push(`${core.idOf(q)} lost family identity`);
      if(q.image && !q.image.startsWith('question-assets/consumer-and-producer-surplus/')) issues.push(`${core.idOf(q)} asset path escaped surplus family: ${q.image}`);
    }
    for(const asset of c.assets){
      const disk=path.join(root,'data',asset.runtimePath);
      if(!fs.existsSync(disk)) issues.push(`${id} missing asset ${asset.runtimePath}`);
      else {
        const hash=crypto.createHash('sha256').update(fs.readFileSync(disk)).digest('hex');
        if(hash!==asset.sha256) issues.push(`${id} asset hash mismatch ${asset.runtimePath}`);
      }
    }
    const answerAudit=await core.verifyAnswers(c);
    if(!answerAudit.ok) issues.push(`${id} answer audit failed: ${answerAudit.issues.length}`);
    const allModes=core.compose(library,recipe([id]));
    childDetails[id]={counts:c.counts,examModeOk:c.validation.modes[0]?.ok,allModeValidation:allModes.validation.modes,allModeErrors:allModes.errors,answerAuditOk:answerAudit.ok,assetCount:c.assets.length};
  }
  if(seen.size!==370) issues.push(`Pairwise-disjoint child union expected 370, found ${seen.size}`);

  const coreFour=core.compose(library,recipe(['consumer-surplus','producer-surplus','total-surplus-gains-from-exchange','efficient-quantity-allocation']));
  if(coreFour.errors.length || !coreFour.validation.modes.every(m=>m.ok)) issues.push(`Four core Surplus subtopics should support all current modes: ${coreFour.errors.join(' | ')}`);
  const allSix=core.compose(library,recipe(childIds));
  if(allSix.errors.length || !allSix.validation.modes.every(m=>m.ok)) issues.push(`All six Surplus subtopics should recombine to all-mode-valid parent: ${allSix.errors.join(' | ')}`);

  const conflict=core.compose(library,recipe([parentId,'consumer-surplus'],['exam']));
  if(!conflict.errors.some(e=>e.includes('cannot be selected together with its parent family'))) issues.push('Parent+child recipe conflict was not rejected');

  // Confirm the earlier Elasticity granularity remains intact after adding a second family.
  const elasticityChildren=['price-elasticity-of-demand','price-elasticity-of-supply','income-elasticity-of-demand','cross-price-elasticity-of-demand','elasticity-and-total-revenue','applications-of-elasticity'];
  const elastParent=core.compose(library,recipe(['elasticity']));
  const elastChildren=core.compose(library,recipe(elasticityChildren));
  const elastParentSet=allIds(elastParent), elastChildSet=allIds(elastChildren);
  if(elastParentSet.size!==418 || elastChildSet.size!==418 || setDiff(elastParentSet,elastChildSet).length || setDiff(elastChildSet,elastParentSet).length){
    issues.push('Elasticity regression: parent/child recombination no longer equals 418');
  }

  const legacyDir=path.join(root,'tests','recipes');
  const legacy=[];
  for(const file of fs.readdirSync(legacyDir).filter(f=>f.endsWith('.json')).sort()){
    const r=JSON.parse(fs.readFileSync(path.join(legacyDir,file),'utf8'));
    const c=core.compose(library,r);
    legacy.push({file,ok:c.errors.length===0 && c.validation.modes.every(m=>m.ok),errors:c.errors});
  }
  if(legacy.some(x=>!x.ok)) issues.push(`Legacy recipe regression: ${legacy.filter(x=>!x.ok).map(x=>x.file).join(', ')}`);

  const result={
    phase:'phaseMicro2-surplus-granularity-v1',
    ok:issues.length===0,
    composerVersion:core.COMPOSER_VERSION,
    libraryVersion:library.libraryVersion,
    librarySha256:library.librarySha256,
    canonicalQuestionCount:library.canonicalQuestionCount,
    conceptCount:library.conceptCount,
    parentRecordCount:records.length,
    recombination:{parentCanonical:parentSet.size,childrenCanonical:childSet.size,parentOnly:parentOnly.length,childOnly:childOnly.length,countsMatch:countKeys.every(k=>parentComp.counts[k]===childComp.counts[k])},
    coreFourAllModes:coreFour.validation.modes,
    allSixAllModes:allSix.validation.modes,
    childDetails,
    elasticityRegression:{parentCanonical:elastParentSet.size,childrenCanonical:elastChildSet.size,ok:elastParentSet.size===418 && elastChildSet.size===418 && !setDiff(elastParentSet,elastChildSet).length && !setDiff(elastChildSet,elastParentSet).length},
    legacyRecipes:{passed:legacy.filter(x=>x.ok).length,total:legacy.length},
    issues
  };
  fs.writeFileSync(path.join(root,'phaseMicro2_surplus_granularity_validation_results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(!result.ok) process.exit(1);
})();
