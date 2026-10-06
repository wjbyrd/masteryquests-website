const fs = require('fs');
const path = require('path');
const core = require('../composer-core.js');
const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library = JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/, '').replace(/;\s*$/, ''));
const registry = new Map(library.registry.concepts.map(c => [c.canonicalConceptId,c]));
const results = {libraryVersion: library.libraryVersion, tests: [], legacyRecipes: [], statuses: []};
async function run(name, selectedConceptIds, supportedModes=['standard','timed','exam','legendary','score']){
  const recipe={schemaVersion:'1.2.0',title:name,slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),supportedModes,selectedConceptIds,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const composition=core.compose(library,recipe);
  const answerAudit=await core.verifyAnswers(composition);
  const record={name,selectedConceptIds,supportedModes,errors:composition.errors,warnings:composition.warnings.length,counts:composition.counts,answerAudit};
  results.tests.push(record); return record;
}
(async()=>{
  await run('Phillips Curve Policy Sequence',['short-run-phillips-curve','long-run-phillips-curve','phillips-curve-expectations','disinflation-and-policy','aggregate-demand','aggregate-supply','stabilization-policy']);
  await run('Unemployment Baseline',['unemployment-measurement','natural-rate-of-unemployment','labor-market-institutions','gdp-measurement','cpi-and-inflation-measurement','living-standards-and-growth']);
  await run('Inflation and Real Values',['cpi-and-inflation-measurement','indexing-and-real-values','real-versus-nominal-interest-rates','fisher-effect']);
  await run('Central Banking System',['central-bank-and-federal-reserve','money-functions-and-measures','bank-money-creation','monetary-policy-tools']);
  await run('Long-Run Adjustment',['aggregate-demand','aggregate-supply','macroeconomic-equilibrium-and-shocks','long-run-macroeconomic-adjustment']);
  await run('Stage One Combined',['long-run-phillips-curve','disinflation-and-policy','natural-rate-of-unemployment','indexing-and-real-values','central-bank-and-federal-reserve','real-versus-nominal-interest-rates','long-run-macroeconomic-adjustment','aggregate-demand','aggregate-supply','cpi-and-inflation-measurement','unemployment-measurement']);
  const recipeDir=path.join(root,'tests','recipes');
  for(const filename of fs.readdirSync(recipeDir).filter(x=>x.endsWith('.json')).sort()){
    const recipe=JSON.parse(fs.readFileSync(path.join(recipeDir,filename),'utf8'));
    const composition=core.compose(library,recipe);
    const answerAudit=await core.verifyAnswers(composition);
    results.legacyRecipes.push({name:filename,errors:composition.errors,warnings:composition.warnings.length,answerAudit,counts:composition.counts});
  }
  const targetIds=['long-run-phillips-curve','disinflation-and-policy','natural-rate-of-unemployment','indexing-and-real-values','central-bank-and-federal-reserve','real-versus-nominal-interest-rates','long-run-macroeconomic-adjustment'];
  results.statuses=targetIds.map(id=>({id,title:registry.get(id).title,classification:registry.get(id).instructionalClassification,status:registry.get(id).coverageStatus,label:registry.get(id).coverageStatusLabel}));
  results.statusPass=results.statuses.every(x=>x.status==='best-paired');
  results.compositionPass=results.tests.every(t=>t.errors.length===0 && t.answerAudit.ok);
  results.legacyPass=results.legacyRecipes.every(t=>t.errors.length===0 && t.answerAudit.ok);
  results.pass=results.statusPass && results.compositionPass && results.legacyPass;
  fs.writeFileSync(path.join(root,'tests','phase5_2b_stage1_validation_results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({pass:results.pass,statusPass:results.statusPass,compositionPass:results.compositionPass,legacyPass:results.legacyPass,tests:results.tests.map(x=>({name:x.name,errors:x.errors,audit:x.answerAudit.ok,counts:x.counts})),legacyFailures:results.legacyRecipes.filter(x=>x.errors.length||!x.answerAudit.ok).map(x=>x.name)},null,2));
  if(!results.pass) process.exit(1);
})();
