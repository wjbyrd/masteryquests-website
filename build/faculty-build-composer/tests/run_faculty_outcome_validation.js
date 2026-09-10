'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=process.env.MQ_SCOPE_COMPOSER_ROOT || path.resolve(__dirname,'..');
const core=require(path.join(root,'composer-core')),F=core.FacultyOutcomes;
const helper=require(path.join(root,'tests/composer-test-helpers'));
const library=helper.loadComposerLibrary();
const all=c=>[...Object.values(c.banks).flat(),...Object.values(c.challengeQuestionBanks).flat(),...c.repairQuestions,...c.bridgeQuestions,...Object.values(c.microSkillRepairPools).flat(),...Object.values(c.skillRepairSeedPools).flat(),...Object.values(c.microSkillBridgePools).flat()];
const ids=q=>[...new Set(q.map(core.idOf))].sort();
const input=(id,scope,modes=core.MODE_ORDER)=>({title:'Faculty outcomes',slug:'faculty-outcomes',selectedConceptIds:[id],supportedModes:[...modes],contentScopes:{[id]:scope}});
let assertions=0;function check(v,message){assert(v,message);assertions++;}
const representatives=['demand','supply','market-equilibrium','scarcity-and-tradeoffs','monopoly','consumer-choice','real-versus-nominal-gdp','quantity-theory-of-money','capital-flows-and-net-capital-outflow','unemployment-measurement','monetary-policy-transmission','ad-as-equilibrium-and-output-gaps','tariffs-revenue-deadweight-loss','long-run-aggregate-supply-and-potential-output'];
async function run(){
 const snapshot=JSON.stringify(library),proof=[];let outcomeCount=0,combinations=0;
 for(const record of library.registry.concepts){
  const id=record.canonicalConceptId,p=F.describe(id),canonicalSkills=core.describeContentScope(library,id).full;
  check(p.outcomes.length>0,id+' has outcome policy');
  const mapped=p.outcomes.flatMap(g=>g.skillIds);
  check(new Set(mapped).size===mapped.length,id+' skill partition is unambiguous');
  assert.deepStrictEqual([...mapped].sort(),canonicalSkills,id+' all canonical skills mapped');assertions++;
  for(const g of p.outcomes){
   outcomeCount++;check(g.conceptId===id && g.id.startsWith(id+'-'),g.id+' stable namespace');
   check(!/_/.test(g.label) && g.label.length>10,g.id+' faculty-readable label');
   check(g.skillIds.length>0,g.id+' supported skill mapping');
   if(!p.hidden && p.outcomes.length>1)check(g.coverage.supportedModes.length>0,g.id+' independently usable under existing mode rules');
  }
  for(const preset of ['brief','standard','full']){
   const selected=F.selectPreset(id,preset);
   assert.deepStrictEqual(selected.outcomeIds,p.presets[preset]);assertions++;
   const migrated=core.canonicalRecipe({...input(id,{depth:preset}),schemaVersion:'1.5.0'},library);
   if(record.status!=='legacy')assert.deepStrictEqual([...migrated.contentScopes[id].outcomeIds].sort(),[...selected.outcomeIds].sort());assertions++;
  }
  if(p.hidden)continue;
  const source=core.resolveConceptModule(library,id),sourceById=new Map(core.ContentScope.allQuestions(source).map(q=>[core.idOf(q),q]));
  const full=core.compose(library,input(id,F.selectPreset(id,'full')));
  for(let mask=0;mask<(1<<p.outcomes.length);mask++){
   combinations++;
   const outcomeIds=p.outcomes.filter((_,i)=>mask&(1<<i)).map(g=>g.id);
   const scope=F.normalize(id,{preset:'custom',outcomeIds});
   const recipe=input(id,scope),composition=core.compose(library,recipe),allowed=new Set(p.outcomes.filter(g=>outcomeIds.includes(g.id)).flatMap(g=>g.skillIds));
   if(!outcomeIds.length){check(composition.errors.length>0 && all(composition).length===0,id+' empty outcomes block generation');continue;}
   for(const q of all(composition)){
    const required=core.ContentScope.skills(q);
    check(required.every(s=>allowed.has(s)),id+' no unchecked outcome leaks across ordinary/checkpoint/support pools');
    check(required.length || outcomeIds.length===p.outcomes.length,id+' untagged only in complete scope');
    check(q.canonicalDifficulty===sourceById.get(core.idOf(q)).canonicalDifficulty,id+' published difficulty unchanged');
   }
   const canonical=core.canonicalRecipe(recipe,library);
   assert.deepStrictEqual(core.canonicalRecipe(JSON.parse(JSON.stringify(canonical)),library),canonical);assertions++;
   if(mask===1 && representatives.includes(id))proof.push({conceptId:id,selectedOutcomeIds:outcomeIds,selectedLabels:p.outcomes.filter(g=>outcomeIds.includes(g.id)).map(g=>g.label),allowedSkills:[...allowed].sort(),eligibleQuestionIds:ids(all(composition)),excludedQuestionIds:ids(all(full)).filter(q=>!ids(all(composition)).includes(q)),difficulty:composition.counts,supportedModes:composition.validation.modes.filter(m=>m.ok).map(m=>m.mode)});
  }
  const requested=[canonicalSkills[0]];
  const migrated=core.canonicalRecipe({...input(id,{depth:'full',skillIds:requested}),schemaVersion:'1.5.0'},library);
  const compiled=F.compile(id,migrated.contentScopes[id]);
  assert.deepStrictEqual(compiled.skillIds || canonicalSkills,requested,id+' old manual skills never broaden');assertions++;
 }
 check(JSON.stringify(library)===snapshot,'No source question or metadata mutated');
 const demand=F.describe('demand'),coreOutcome=demand.presets.brief;
 const custom=F.normalize('demand',{preset:'custom',outcomeIds:[demand.outcomes[1].id]});
 check(custom.preset==='custom','Manual unmatched selection displays Custom');
 check(F.normalize('demand',{preset:'custom',outcomeIds:coreOutcome}).preset==='brief','Manual return to Brief recognized');
 check(F.normalize('demand',{preset:'custom',outcomeIds:demand.presets.full}).preset==='full','Manual return to Full recognized');
 const exact=F.normalize('demand',{depth:'full',skillIds:demand.outcomes[0].skillIds});
 check(!exact.legacySkillIds && exact.outcomeIds.includes(demand.outcomes[0].id),'Exact legacy skill group maps to outcomes');
 const legacy=F.normalize('demand',{depth:'full',skillIds:['law_of_demand']});
 check(legacy.legacySkillIds?.length===1 && legacy.outcomeIds.length===0,'Inexact legacy manual coverage retained explicitly');
 const mixed={...input('demand',F.selectPreset('demand','brief')),selectedConceptIds:['demand','monopoly','real-versus-nominal-gdp'],contentScopes:{demand:F.selectPreset('demand','brief'),monopoly:F.selectPreset('monopoly','full'),'real-versus-nominal-gdp':F.selectPreset('real-versus-nominal-gdp','standard'),supply:{depth:'exclude'}}};
 const composition=core.compose(library,mixed);
 check(!composition.errors.length,'Mixed outcomes support all ten modes: '+composition.errors.join('; '));
 check(composition.validation.modes.length===10 && composition.validation.modes.every(m=>m.ok),'All game modes remain available inside eligible pool');
 const game=await helper.buildFacultyGame(core,mixed,{library});helper.assertInlineScriptsCompile(game.html);assertions++;
 check(game.config.contentScopes.demand.outcomeIds.includes(coreOutcome[0]),'Generated configuration preserves outcomes');
 const changed=await core.createConfig({...mixed,contentScopes:{...mixed.contentScopes,demand:F.selectPreset('demand','full')}},library,'test');
 const original=await core.createConfig(mixed,library,'test');check(changed.compositionFingerprint!==original.compositionFingerprint,'Outcome choices affect fingerprint');
 check(changed.saveKeyNamespace!==original.saveKeyNamespace,'Outcome choices affect save namespace');
 const narrow=core.compose(library,input('demand',custom,['standard']));check(narrow.errors.length>0,'Insufficient campaign coverage blocks generation');
 check(core.compose(library,input('demand',{preset:'custom',outcomeIds:['monopoly-power']})).errors.some(e=>e.includes('Unknown learning outcome')),'Cross-concept outcome IDs rejected');
 const excluded=core.compose(library,input('demand',{depth:'exclude'}));check(all(excluded).length===0,'Old Exclude preserved');
 const retired=core.compose(library,input('market-failures',{depth:'exclude'}));check(all(retired).length===0,'Retired-parent exclusion propagated');
 const raw=fs.readFileSync(path.join(root,'composer.js'),'utf8');const presets=vm.runInNewContext(raw.slice(raw.indexOf('const PRESETS = '),raw.indexOf('\nconst state ='))+'\nPRESETS');
 for(const preset of presets){const r={...mixed,selectedConceptIds:Array.from(preset.conceptIds),contentScopes:{}};const canon=core.canonicalRecipe(r,library);check(Object.values(canon.contentScopes).every(s=>s.preset==='full'),preset.id+' resolves through Full outcome preset');assert.deepStrictEqual(core.compose(library,r).banks,core.compose(library,canon).banks);assertions++;}
 const review=core.resolveConceptReviews(library,helper.loadConceptReviewManifest(),mixed.selectedConceptIds);check(!review.errors.length && review.reviewCodes.includes('GEN-ECON-12'),'Concept Review routing preserved');
 const area=require(path.join(root,'course-area-model')).create(library.registry.concepts);check(area.areasFor('demand').includes('general')&&area.areasFor('demand').includes('micro'),'Shared General Economics');check(area.disciplineFor('real-versus-nominal-gdp')==='macro','Macro selection');
 const result={ok:true,assertions,concepts:library.registry.concepts.length,outcomes:outcomeCount,combinations,presets:presets.length,modes:10,proof};
 if(process.env.MQ_COMPOSER_TEST_OUTPUT_DIR){const out=process.env.MQ_COMPOSER_TEST_OUTPUT_DIR;fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'faculty-lo-results.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(out,'faculty-lo-recipe.json'),JSON.stringify(core.canonicalRecipe(mixed,library),null,2));}
 console.log(JSON.stringify({...result,proof:undefined}));
}
run().catch(e=>{console.error(e);process.exitCode=1;});
