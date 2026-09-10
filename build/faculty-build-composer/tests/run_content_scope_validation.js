'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = process.env.MQ_SCOPE_COMPOSER_ROOT || path.resolve(__dirname, '..');
const core = require(path.join(root, 'composer-core.js'));
const helper = require(path.join(root, 'tests/composer-test-helpers.js'));
const area = require(path.join(root, 'course-area-model.js'));
const library = helper.loadComposerLibrary();
const recipe = (id, depth, skillIds) => ({title:'Scope regression',slug:'scope-regression',supportedModes:['quiz'],selectedConceptIds:[id],...(depth ? {contentScopes:{[id]:{depth,...(skillIds ? {skillIds} : {})}}} : {})});
const all = composition => [...Object.values(composition.banks).flat(),...Object.values(composition.challengeQuestionBanks).flat(),...composition.repairQuestions,...composition.bridgeQuestions,...Object.values(composition.microSkillRepairPools).flat(),...Object.values(composition.skillRepairSeedPools).flat(),...Object.values(composition.microSkillBridgePools).flat()];
const ids = questions => [...new Set(questions.map(core.idOf))].sort();
const subset = (a,b) => a.every(id => b.includes(id));
let assertions=0;
function check(value, message){assert(value,message);assertions++;}
async function run(){
  const snapshot = JSON.stringify(library);
  const uniqueConcepts = library.registry.concepts.map(c=>c.canonicalConceptId);
  check(new Set(uniqueConcepts).size === uniqueConcepts.length,'Registry IDs unique');
  const cases=[];
  for(const id of uniqueConcepts){
    const description=core.describeContentScope(library,id);
    check(description.brief.length > 0,id+' has explicit Brief curriculum');
    check(subset(description.brief,description.standard),id+' core is within Standard');
    for(const skill of (core.ContentScope.BRIEF[id]||'').split(' ')) check(description.full.includes(skill),id+': existing canonical core skill '+skill);
    for(const skill of (core.ContentScope.EXTENSIONS[id]||'').split(' ').filter(Boolean)) check(description.full.includes(skill),id+': existing extension '+skill);
    if(core.migrateRecipe(recipe(id),library).recipe.selectedConceptIds.length>1){
      const excluded=core.compose(library,recipe(id,'exclude'));
      check(all(excluded).length===0,'Retired parent exclusion propagates to migrated children');
      continue;
    }
    const legacy=core.compose(library,recipe(id));
    const full=core.compose(library,recipe(id,'full'));
    check(JSON.stringify(legacy.banks)===JSON.stringify(full.banks),id+' legacy pool unchanged');
    const brief=core.compose(library,recipe(id,'brief'));
    const standard=core.compose(library,recipe(id,'standard'));
    check(core.ContentScope.allQuestions(core.scopedConceptModule(library,id,{depth:'brief'})).length>0,id+' Brief has content (supplements need prerequisite concepts)');
    check(subset(ids(all(brief)),ids(all(standard))),id+' Brief within Standard');
    check(subset(ids(all(standard)),ids(all(full))),id+' Standard within Full');
    for(const depth of ['brief','standard']){
      for(const q of all(depth==='brief'?brief:standard)){
        check(core.ContentScope.skills(q).every(skill=>description[depth].includes(skill)),id+' no excluded subskill in '+depth);
      }
    }
    const baseById=new Map(core.ContentScope.allQuestions(core.resolveConceptModule(library,id)).map(q=>[core.idOf(q),q]));
    for(const q of all(brief)) check(q.canonicalDifficulty===baseById.get(core.idOf(q)).canonicalDifficulty,id+' difficulty unchanged');
    // One arbitrary existing subskill is a deliberate manual choice, not a
    // curricular default. Verify all secondary skills must be selected too.
    const manual=core.compose(library,recipe(id,'full',[description.full[0]]));
    check(all(manual).every(q=>core.ContentScope.skills(q).length && core.ContentScope.skills(q).every(s=>s===description.full[0])),id+' manual scope cannot leak');
    const exclude=core.compose(library,recipe(id,'exclude'));
    check(all(exclude).length===0 && exclude.recipe.selectedConceptIds.length===0,id+' excluded everywhere');
    cases.push({id,brief:ids(all(brief)).length,standard:ids(all(standard)).length,full:ids(all(full)).length,note:description.note});
  }
  check(JSON.stringify(library)===snapshot,'Library/question content never mutated');
  for(const id of ['demand','monopoly','real-versus-nominal-gdp','scarcity-and-tradeoffs']){
    const row=cases.find(r=>r.id===id);
    check(row.brief<row.standard && row.standard<row.full,id+' has three distinct content pools');
    const brief=all(core.compose(library,recipe(id,'brief')));
    check(brief.some(q=>['hard','elite','legendary'].includes(q.canonicalDifficulty)),id+' Brief retains advanced difficulty');
    const full=all(core.compose(library,recipe(id,'full')));
    const std=new Set(ids(all(core.compose(library,recipe(id,'standard')))));
    check(full.some(q=>!std.has(core.idOf(q)) && ['easy','medium'].includes(q.canonicalDifficulty)),id+' Full extensions are not just hard questions');
  }
  const model=area.create(library.registry.concepts);
  check(model.areasFor('demand').includes('general') && model.areasFor('demand').includes('micro'),'Shared General Economics routing');
  check(model.disciplineFor('real-versus-nominal-gdp')==='macro','Macro routing');
  check(model.areasFor('monopoly').includes('micro'),'Micro routing');
  for(const areaId of ['general','micro','macro']) for(const family of model.navigationFamiliesForArea(areaId)) for(const id of family.conceptIds) check(uniqueConcepts.includes(id),'Navigation family has canonical ID');
  const uiSource=fs.readFileSync(path.join(root,'composer.js'),'utf8');
  const presets=vm.runInNewContext(uiSource.slice(uiSource.indexOf('const PRESETS = '),uiSource.indexOf('\nconst state ='))+'\nPRESETS');
  for(const preset of presets){
    const input={...recipe('demand'),selectedConceptIds:Array.from(preset.conceptIds),supportedModes:[...core.MODE_ORDER]};
    const canonical=core.canonicalRecipe(input,library);
    check(canonical.selectedConceptIds.every(id=>library.concepts[id]),preset.id+' canonical IDs');
    check(Object.values(canonical.contentScopes).every(s=>s.depth==='full'),preset.id+' preserves original scope');
    const legacy=core.compose(library,input), explicit=core.compose(library,canonical);
    check(JSON.stringify(legacy.banks)===JSON.stringify(explicit.banks),preset.id+' pool compatibility');
  }
  const mixed={...recipe('demand','brief'),supportedModes:[...core.MODE_ORDER],selectedConceptIds:['demand','monopoly','real-versus-nominal-gdp','supply'],contentScopes:{demand:{depth:'brief'},monopoly:{depth:'full'},'real-versus-nominal-gdp':{depth:'standard'},supply:{depth:'exclude'}}};
  const canonical=core.canonicalRecipe(mixed,library);
  check(!canonical.selectedConceptIds.includes('supply'),'Excluded concept omitted from config');
  assert.deepStrictEqual(core.canonicalRecipe(JSON.parse(JSON.stringify(canonical)),library),canonical);assertions++;
  const manualRecipe=core.canonicalRecipe(recipe('demand','standard',['law_of_demand','movement_vs_demand_shift']),library);
  assert.deepStrictEqual(core.canonicalRecipe(JSON.parse(JSON.stringify(manualRecipe)),library),manualRecipe);assertions++;
  const manualConfig=await core.createConfig(manualRecipe,library,'test');
  check(manualConfig.contentScopes.demand.skillIds.includes('law_of_demand'),'Manual IDs serialized in game config');
  const composition=core.compose(library,mixed);
  check(!composition.errors.length,'Mixed-depth quest passes all modes: '+composition.errors.join('; '));
  check(composition.validation.modes.length===10 && composition.validation.modes.every(m=>m.ok),'All ten modes within scoped pool');
  const {html,config}=await helper.buildFacultyGame(core,canonical,{library});
  check(config.contentScopes.supply.depth==='exclude','Runtime config retains explicit exclusion');
  check(config.contentScopes.demand.depth==='brief','Runtime config retains depth');
  helper.assertInlineScriptsCompile(html);assertions++;
  check(html.includes('"contentScopes"'),'Generated HTML serializes content scope');
  const changed=await core.createConfig({...canonical,contentScopes:{...canonical.contentScopes,demand:{depth:'full'}}},library,'test');
  const same=await core.createConfig(canonical,library,'test');
  check(changed.compositionFingerprint!==same.compositionFingerprint,'Fingerprint distinguishes scope');
  const reviews=core.resolveConceptReviews(library,helper.loadConceptReviewManifest(),canonical.selectedConceptIds);
  check(!reviews.errors.length && reviews.reviewCodes.includes('GEN-ECON-12'),'Resource routing preserved');
  check(core.compose(library,recipe('demand','full',[])).errors.some(e=>e.includes('at least one subskill')),'Empty manual refinement blocks generation');
  check(core.compose(library,recipe('demand','full',['unrelated-skill'])).errors.some(e=>e.includes('Unknown subskill')),'Unknown skills rejected');
  const malformed={...recipe('demand'),contentScopes:{demand:{depth:'easy'}}};
  check(core.compose(library,malformed).errors.some(e=>e.includes('Invalid coverage')),'Difficulty is not a depth');
  const synthetic={canonicalConceptId:'demand',questions:{easy:[{id:'multi',primarySkill:'law_of_demand',secondarySkills:['demand_shifters']},{id:'untagged'}]},repairQuestions:[]};
  check(core.ContentScope.allQuestions(core.ContentScope.filter(synthetic,{depth:'brief'})).length===0,'Secondary skill and untagged leakage blocked');
  const result={ok:true,assertions,concepts:cases.length,presets:presets.length,modes:10,cases};
  if(process.env.MQ_COMPOSER_TEST_OUTPUT_DIR){fs.mkdirSync(process.env.MQ_COMPOSER_TEST_OUTPUT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.MQ_COMPOSER_TEST_OUTPUT_DIR,'content-scope-results.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(process.env.MQ_COMPOSER_TEST_OUTPUT_DIR,'scope-game.html'),html);fs.writeFileSync(path.join(process.env.MQ_COMPOSER_TEST_OUTPUT_DIR,'scope-test-recipe.json'),JSON.stringify(canonical,null,2));}
  console.log(JSON.stringify({ok:true,assertions,concepts:cases.length,presets:presets.length,modes:10}));
}
run().catch(error=>{console.error(error);process.exitCode=1;});
