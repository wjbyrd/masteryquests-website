const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const parentId='elasticity';
const childIds=[
  'price-elasticity-of-demand',
  'price-elasticity-of-supply',
  'income-elasticity-of-demand',
  'cross-price-elasticity-of-demand',
  'elasticity-and-total-revenue',
  'applications-of-elasticity'
];
const expectedTotals={
  'price-elasticity-of-demand':171,
  'price-elasticity-of-supply':54,
  'income-elasticity-of-demand':27,
  'cross-price-elasticity-of-demand':33,
  'elasticity-and-total-revenue':53,
  'applications-of-elasticity':80
};
function recipe(ids,modes=['standard','timed','exam','legendary','score']){
  return {schemaVersion:'1.2.0',title:'Elasticity Granularity Validation',slug:'elasticity-granularity-validation',supportedModes:modes,selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
}
function allIds(comp){return new Set([...Object.values(comp.banks).flat(),...comp.repairQuestions,...comp.bridgeQuestions,...Object.values(comp.skillRepairSeedPools||{}).flat()].map(core.idOf));}
function setDiff(a,b){return [...a].filter(x=>!b.has(x));}
(async()=>{
  const issues=[];
  const parent=library.concepts[parentId];
  const sourceRecords=[...Object.values(parent.questions||{}).flat(),...(parent.repairQuestions||[]),...(parent.bridgeQuestions||[]),...(parent.repairSeedQuestions||[])];
  if(sourceRecords.length!==418) issues.push(`Parent source record count expected 418, found ${sourceRecords.length}`);
  const assignmentCounts={};
  for(const q of sourceRecords){
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
  if(parentSet.size!==418 || childSet.size!==418) issues.push(`Union size mismatch parent=${parentSet.size} children=${childSet.size}`);
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
    for(const qid of ids){ if(seen.has(qid)) issues.push(`Question ${qid} overlaps between child subtopics`); seen.add(qid); }
    const runtimeQs=[...Object.values(c.banks).flat(),...c.repairQuestions,...c.bridgeQuestions];
    for(const q of runtimeQs){
      if(q.primaryConceptId!==id || q.tag!==id) issues.push(`${core.idOf(q)} runtime identity did not remap to ${id}`);
      if(q.familyConceptId!==parentId) issues.push(`${core.idOf(q)} lost family identity`);
      if(q.image && !q.image.startsWith('question-assets/elasticity/')) issues.push(`${core.idOf(q)} asset path escaped elasticity family: ${q.image}`);
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
    childDetails[id]={counts:c.counts,examModeOk:c.validation.modes[0]?.ok,compositionErrors:c.errors,answerAuditOk:answerAudit.ok,assetCount:c.assets.length};
  }
  if(seen.size!==418) issues.push(`Pairwise-disjoint child union expected 418, found ${seen.size}`);

  const ped=core.compose(library,recipe(['price-elasticity-of-demand']));
  if(ped.errors.length || !ped.validation.modes.every(m=>m.ok)) issues.push(`PED should support all current modes but did not: ${ped.errors.join(' | ')}`);
  const supporting=core.compose(library,recipe(['price-elasticity-of-demand','income-elasticity-of-demand','cross-price-elasticity-of-demand']));
  if(supporting.errors.length || !supporting.validation.modes.every(m=>m.ok)) issues.push(`PED + Income + Cross combination should support all current modes: ${supporting.errors.join(' | ')}`);

  const conflict=core.compose(library,recipe([parentId,'price-elasticity-of-demand'],['exam']));
  if(!conflict.errors.some(e=>e.includes('cannot be selected together with its parent family'))) issues.push('Parent+child recipe conflict was not rejected');

  const legacyDir=path.join(root,'tests','recipes');
  const legacy=[];
  for(const file of fs.readdirSync(legacyDir).filter(f=>f.endsWith('.json')).sort()){
    const r=JSON.parse(fs.readFileSync(path.join(legacyDir,file),'utf8'));
    const c=core.compose(library,r);
    legacy.push({file,ok:c.errors.length===0 && c.validation.modes.every(m=>m.ok),errors:c.errors});
  }
  if(legacy.some(x=>!x.ok)) issues.push(`Legacy recipe regression: ${legacy.filter(x=>!x.ok).map(x=>x.file).join(', ')}`);

  const result={
    phase:'phaseMicro1-elasticity-granularity-pilot-v1',
    ok:issues.length===0,
    composerVersion:core.COMPOSER_VERSION,
    libraryVersion:library.libraryVersion,
    librarySha256:library.librarySha256,
    canonicalQuestionCount:library.canonicalQuestionCount,
    conceptCount:library.conceptCount,
    parentRecordCount:sourceRecords.length,
    recombination:{parentCanonical:parentSet.size,childrenCanonical:childSet.size,parentOnly:parentOnly.length,childOnly:childOnly.length,countsMatch:countKeys.every(k=>parentComp.counts[k]===childComp.counts[k])},
    pedAllModes:ped.validation.modes,
    pedIncomeCrossAllModes:supporting.validation.modes,
    childDetails,
    legacyRecipes:{passed:legacy.filter(x=>x.ok).length,total:legacy.length},
    issues
  };
  fs.writeFileSync(path.join(root,'phaseMicro1_elasticity_granularity_validation_results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(!result.ok) process.exit(1);
})();
