const fs = require('fs');
const path = require('path');
const core = require('../composer-core.js');
const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library = JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/, '').replace(/;\s*$/, ''));
const registry = new Map(library.registry.concepts.map(c => [c.canonicalConceptId,c]));
const results = {libraryVersion: library.libraryVersion, tests: [], legacyRecipes: [], statuses: [], poolFloors: []};
const TARGETS=['monetary-policy-transmission','fiscal-multipliers-and-crowding-out','production-possibilities-frontier','stabilization-policy','quantity-theory-of-money','unemployment-measurement','integrated-economic-analysis'];
const STANDALONE=TARGETS.slice(0,6);
async function run(name, selectedConceptIds, supportedModes=['standard','timed','exam','legendary','score']){
  const recipe={schemaVersion:'1.2.0',title:name,slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),supportedModes,selectedConceptIds,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const composition=core.compose(library,recipe);
  const answerAudit=await core.verifyAnswers(composition);
  const record={name,selectedConceptIds,supportedModes,errors:composition.errors,warnings:composition.warnings.length,counts:composition.counts,answerAudit};
  results.tests.push(record); return record;
}
function tierCounts(module){
  const out={checkpointOne:0,checkpointTwo:0,finalCheckpoint:0,masteryCheckpoint:(module.questions.legendaryBoss||[]).length};
  for(const q of (module.questions.boss||[])){
    if(q.originalBossTier==='easyBoss') out.checkpointOne++;
    else if(q.originalBossTier==='mediumBoss') out.checkpointTwo++;
    else if(q.originalBossTier==='finalBoss'||q.originalBossTier==='hardBoss') out.finalCheckpoint++;
  }
  return out;
}
function poolFloor(id){
  const module=library.concepts[id];
  const reg=registry.get(id);
  const counts={
    easy:module.questions.easy.length,
    medium:module.questions.medium.length,
    hard:module.questions.hard.length,
    elite:module.questions.elite.length,
    legendary:module.questions.legendary.length,
    repair:module.repairQuestions.length,
    bridge:module.bridgeQuestions.length,
    ...tierCounts(module)
  };
  let ok;
  if(reg.instructionalClassification==='Standalone-ready'){
    ok=counts.easy>=6&&counts.medium>=6&&counts.hard>=6&&counts.elite>=4&&counts.legendary>=6&&counts.checkpointOne>=3&&counts.checkpointTwo>=3&&counts.finalCheckpoint>=3&&counts.masteryCheckpoint>=3&&counts.repair>=3&&counts.bridge>=2;
  }else if(reg.instructionalClassification==='Core supporting concept'){
    ok=counts.easy>=4&&counts.medium>=4&&counts.hard>=4&&counts.elite>=2&&counts.legendary>=3&&(counts.checkpointOne+counts.checkpointTwo+counts.finalCheckpoint)>=3&&counts.repair>=2&&counts.bridge>=1;
  }else{
    const practice=counts.easy+counts.medium+counts.hard+counts.elite+counts.legendary;
    ok=practice>=12&&(counts.hard+counts.elite+counts.legendary)>=4&&(counts.repair+counts.bridge)>=2;
  }
  return {id,title:reg.title,classification:reg.instructionalClassification,counts,ok};
}
(async()=>{
  for(const id of STANDALONE) await run(`${registry.get(id).title} Focused Mastery Quest`,[id]);
  await run('Integrated Analysis Combined Quest',['integrated-economic-analysis','production-possibilities-frontier','unemployment-measurement']);
  await run('Stage Four Combined',TARGETS);
  const recipeDir=path.join(root,'tests','recipes');
  for(const filename of fs.readdirSync(recipeDir).filter(x=>x.endsWith('.json')).sort()){
    const recipe=JSON.parse(fs.readFileSync(path.join(recipeDir,filename),'utf8'));
    const composition=core.compose(library,recipe);
    const answerAudit=await core.verifyAnswers(composition);
    results.legacyRecipes.push({name:filename,errors:composition.errors,warnings:composition.warnings.length,answerAudit,counts:composition.counts});
  }
  results.statuses=TARGETS.map(id=>({id,title:registry.get(id).title,classification:registry.get(id).instructionalClassification,status:registry.get(id).coverageStatus,label:registry.get(id).coverageStatusLabel}));
  results.poolFloors=TARGETS.map(poolFloor);
  results.statusPass=results.statuses.every(x=>x.status!=='insufficient');
  results.poolFloorPass=results.poolFloors.every(x=>x.ok);
  results.compositionPass=results.tests.every(t=>t.errors.length===0 && t.answerAudit.ok);
  results.legacyPass=results.legacyRecipes.every(t=>t.errors.length===0 && t.answerAudit.ok);
  results.pass=results.statusPass && results.poolFloorPass && results.compositionPass && results.legacyPass;
  fs.writeFileSync(path.join(root,'tests','phase5_2b_stage4_validation_results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({pass:results.pass,statusPass:results.statusPass,poolFloorPass:results.poolFloorPass,compositionPass:results.compositionPass,legacyPass:results.legacyPass,poolFloors:results.poolFloors,tests:results.tests.map(x=>({name:x.name,errors:x.errors,audit:x.answerAudit.ok,counts:x.counts})),legacyFailures:results.legacyRecipes.filter(x=>x.errors.length||!x.answerAudit.ok).map(x=>x.name)},null,2));
  if(!results.pass) process.exit(1);
})();
