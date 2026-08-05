const fs = require('fs');
const path = require('path');
const core = require('../composer-core.js');
const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const jsonText = raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/, '').replace(/;\s*$/, '');
const library = JSON.parse(jsonText);
const targetIds = [
  'scarcity-and-tradeoffs','opportunity-cost','marginal-analysis','cpi-and-inflation-measurement',
  'bank-money-creation','fiscal-policy-and-aggregate-demand','aggregate-demand','aggregate-supply'
];
const results = {composerVersion: core.COMPOSER_VERSION, libraryVersion: library.libraryVersion, targetConcepts: [], legacyRecipes: []};
async function runRecipe(name, recipe){
  const composition = core.compose(library, recipe);
  const answerAudit = await core.verifyAnswers(composition);
  return {
    name,
    selected: composition.recipe.selectedConceptIds.length,
    modes: composition.recipe.supportedModes,
    errors: composition.errors,
    warnings: composition.warnings.length,
    counts: composition.counts,
    answerAudit
  };
}
(async()=>{
  for(const id of targetIds){
    const title = library.concepts[id].title;
    const recipe = {
      schemaVersion:'1.2.0', title:`${title} Standalone Test`, slug:`phase5-2a-${id}`,
      supportedModes:['standard','timed','exam','legendary','score'], selectedConceptIds:[id],
      checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
    };
    results.targetConcepts.push(await runRecipe(id, recipe));
  }
  const recipeDir = path.join(root,'tests','recipes');
  for(const filename of fs.readdirSync(recipeDir).filter(x=>x.endsWith('.json')).sort()){
    results.legacyRecipes.push(await runRecipe(filename, JSON.parse(fs.readFileSync(path.join(recipeDir,filename),'utf8'))));
  }
  results.pass = [...results.targetConcepts,...results.legacyRecipes].every(r=>r.errors.length===0 && r.answerAudit.ok);
  fs.writeFileSync(path.join(root,'tests','phase5_2a_validation_results.json'), JSON.stringify(results,null,2));
  console.log(JSON.stringify({pass:results.pass,targetPass:results.targetConcepts.filter(r=>r.errors.length===0&&r.answerAudit.ok).length,legacyPass:results.legacyRecipes.filter(r=>r.errors.length===0&&r.answerAudit.ok).length},null,2));
  if(!results.pass) process.exit(1);
})();
