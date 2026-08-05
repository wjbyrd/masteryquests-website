const fs = require('fs');
const path = require('path');
const core = require('../composer-core.js');
const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library = JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/, '').replace(/;\s*$/, ''));
const registry = new Map(library.registry.concepts.map(c => [c.canonicalConceptId,c]));
const results = {libraryVersion: library.libraryVersion, tests: [], legacyRecipes: []};
async function run(name, selectedConceptIds, supportedModes){
  const recipe={schemaVersion:'1.2.0',title:name,slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),supportedModes,selectedConceptIds,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const composition=core.compose(library,recipe);
  const answerAudit=await core.verifyAnswers(composition);
  const record={name,selectedConceptIds,supportedModes,errors:composition.errors,warnings:composition.warnings.length,counts:composition.counts,answerAudit};
  results.tests.push(record); return record;
}
(async()=>{
  await run('Comparative Advantage Standalone',['gains-from-trade'],['standard','timed','exam','legendary','score']);
  await run('Core Rescue Mix',['competitive-markets','price-signals','market-failures','incentives'],['standard','timed','exam','legendary','score']);
  await run('Supplemental Rescue Mix',['economist-policy-role','models-and-assumptions','micro-versus-macro','gains-from-trade'],['standard','timed','exam','legendary','score']);
  await run('All Rescue Concepts',['gains-from-trade','economist-policy-role','competitive-markets','price-signals','models-and-assumptions','market-failures','micro-versus-macro','incentives'],['standard','timed','exam','legendary','score']);
  const recipeDir=path.join(root,'tests','recipes');
  for(const filename of fs.readdirSync(recipeDir).filter(x=>x.endsWith('.json')).sort()){
    const recipe=JSON.parse(fs.readFileSync(path.join(recipeDir,filename),'utf8'));
    const composition=core.compose(library,recipe);
    const answerAudit=await core.verifyAnswers(composition);
    results.legacyRecipes.push({name:filename,errors:composition.errors,warnings:composition.warnings.length,answerAudit,counts:composition.counts});
  }
  const targetIds=['gains-from-trade','economist-policy-role','competitive-markets','price-signals','models-and-assumptions','market-failures','micro-versus-macro','incentives'];
  results.statuses=targetIds.map(id=>({id,title:registry.get(id).title,classification:registry.get(id).instructionalClassification,status:registry.get(id).coverageStatus,label:registry.get(id).coverageStatusLabel}));
  const expected={
    'gains-from-trade':'ready-focused','economist-policy-role':'supplemental-ready','competitive-markets':'best-paired','price-signals':'best-paired',
    'models-and-assumptions':'supplemental-ready','market-failures':'best-paired','micro-versus-macro':'supplemental-ready','incentives':'best-paired'
  };
  results.statusPass=results.statuses.every(x=>x.status===expected[x.id]);
  results.compositionPass=results.tests.every(t=>t.errors.length===0 && t.answerAudit.ok);
  results.legacyPass=results.legacyRecipes.every(t=>t.errors.length===0 && t.answerAudit.ok);
  results.pass=results.statusPass && results.compositionPass && results.legacyPass;
  fs.writeFileSync(path.join(root,'tests','phase5_2b_validation_results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({pass:results.pass,statusPass:results.statusPass,compositionPass:results.compositionPass,legacyPass:results.legacyPass,tests:results.tests.map(x=>({name:x.name,errors:x.errors,audit:x.answerAudit.ok,counts:x.counts})),legacyFailures:results.legacyRecipes.filter(x=>x.errors.length||!x.answerAudit.ok).map(x=>x.name)},null,2));
  if(!results.pass) process.exit(1);
})();
