#!/usr/bin/env node

import assert from 'node:assert/strict';
import {productionQuestions as openEconomyQuestions} from '../authoring/open_economy_question_pool_author.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const {assertCanonicalIntegrity}=require('./composer-integrity-contracts.js');
const {writeTestArtifact}=require('./composer-test-helpers.js');
const composerRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(composerRoot,'..','..');
const libraryPath=path.join(composerRoot,'data','composer_library.js');
const registryPath=path.join(composerRoot,'data','composer_registry.json');
const manifestPath=path.join(composerRoot,'data','composer_library_manifest.json');
const reviewPath=path.join(composerRoot,'data','concept-reviews','manifest.json');
const phase1Root=path.join(repo,'audit_tools','macro_phase1');
const inventoryPath=path.join(phase1Root,'macro_phase1_inventory.json');
const taxonomyPath=path.join(phase1Root,'macro_phase1_taxonomy_map.json');
const issuesPath=path.join(phase1Root,'macro_phase1_question_assignment_issues.json');
const resourcePath=path.join(phase1Root,'macro_phase1_resource_alignment.json');
const reportPath=path.join(phase1Root,'macro_phase1_taxonomy_report.md');
const core=require(path.join(composerRoot,'composer-core.js'));
const modelModule=require(path.join(composerRoot,'course-area-model.js'));

const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const librarySource=fs.readFileSync(libraryPath,'utf8').trim();
const library=JSON.parse(librarySource.slice('window.MQ_COMPOSER_LIBRARY='.length,-1));
const registry=readJson(registryPath);
const manifest=readJson(manifestPath);
const reviews=readJson(reviewPath);
const inventory=readJson(inventoryPath);
const taxonomy=readJson(taxonomyPath);
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const occurrences=module=>[
  ...Object.entries(module?.questions||{}).flatMap(([pool,items])=>(items||[]).map(question=>({pool,question}))),
  ...(module?.repairQuestions||[]).map(question=>({pool:'repair',question})),
  ...(module?.repairSeedQuestions||[]).map(question=>({pool:'repairSeed',question})),
  ...(module?.bridgeQuestions||[]).map(question=>({pool:'bridge',question}))
];
const uniqueEntries=(module,conceptId)=>{
  const byId=new Map();
  for(const row of occurrences(module)){
    const id=qid(row.question);if(!id)continue;
    if(!byId.has(id))byId.set(id,{...row,conceptId,pools:[]});
    if(!byId.get(id).pools.includes(row.pool))byId.get(id).pools.push(row.pool);
  }
  return [...byId.values()];
};
const category=row=>{
  const role=row.question.instructionalRole||row.pool;
  if(row.conceptId==='integrated-macroeconomic-analysis')return'supplemental';
  if(['repair','repairSeed','bridge'].includes(role)||['repair','repairSeed','bridge'].includes(row.pool))return'adaptiveSupport';
  if(['boss','legendaryBoss'].includes(role)||['boss','legendaryBoss'].includes(row.pool))return'checkpoint';
  return'practice';
};
const calculation=row=>row.question.type==='calculation'||row.question.instructionalRole==='calculation'||row.pool==='calculation'||row.pools?.includes('calculation');
const metrics=rows=>({
  total:rows.length,practice:rows.filter(row=>category(row)==='practice').length,
  checkpoint:rows.filter(row=>category(row)==='checkpoint').length,
  adaptiveSupport:rows.filter(row=>category(row)==='adaptiveSupport').length,
  supplemental:rows.filter(row=>category(row)==='supplemental').length,
  imageBearing:rows.filter(row=>row.question.image).length,
  graphRequired:rows.filter(row=>row.question.graphRequired===true).length,
  calculation:rows.filter(calculation).length,
  difficulty:Object.fromEntries(['easy','medium','hard','elite','legendary','unknown'].map(key=>[key,rows.filter(row=>(row.question.canonicalDifficulty||row.question.difficulty||'unknown')===key).length]))
});
const checks=[];
const check=(name,condition,details={})=>{checks.push({name,status:condition?'PASS':'FAIL',...details});if(!condition)throw new Error(`${name}: ${JSON.stringify(details)}`);};

const macroFamilies=modelModule.NAVIGATION_FAMILIES.macro.filter(family=>[
  'gdp-national-income','inflation-real-values','growth-productivity','unemployment-labor','saving-fiscal-foundations',
  'money-banking-fed','money-growth-inflation','ad-as-equilibrium','stabilization-policy','phillips-disinflation'
].includes(family.id));
const currentChildIds=macroFamilies.flatMap(family=>family.conceptIds);
const supplementId='integrated-macroeconomic-analysis';
const removedIds=['saving-investment-and-loanable-funds','federal-budgets-and-debt','bank-money-creation','aggregate-supply','macroeconomic-equilibrium-and-shocks','long-run-macroeconomic-adjustment'];
const expectedNewCounts={
  'saving-and-investment-identities':49,'loanable-funds-equilibrium':32,'loanable-funds-shifts':52,'crowding-out-and-capital-formation':27,
  'budget-accounting-and-public-saving':37,'deficits-debt-and-government-borrowing':28,'debt-measures-burden-and-fiscal-data':43,
  'bank-balance-sheets-reserves-and-capital':53,'deposit-creation-and-money-multiplier':37,
  'short-run-aggregate-supply':48,'long-run-aggregate-supply-and-potential-output':15,'ad-as-equilibrium-and-output-gaps':30,
  'demand-and-supply-shocks':69,'long-run-macroeconomic-self-adjustment':33
};
const expectedFamilyCounts={'gdp-national-income':230,'inflation-real-values':303,'growth-productivity':231,'unemployment-labor':238,'saving-fiscal-foundations':268,'money-banking-fed':326,'money-growth-inflation':243,'ad-as-equilibrium':254,'stabilization-policy':403,'phillips-disinflation':262};
const expectedFamilyChildCounts={'gdp-national-income':4,'inflation-real-values':6,'growth-productivity':4,'unemployment-labor':4,'saving-fiscal-foundations':7,'money-banking-fed':6,'money-growth-inflation':4,'ad-as-equilibrium':6,'stabilization-policy':5,'phillips-disinflation':5};

check('Phase 1 files consumed',[inventoryPath,taxonomyPath,issuesPath,resourcePath,reportPath].every(fs.existsSync),{files:[inventoryPath,taxonomyPath,issuesPath,resourcePath,reportPath].map(file=>path.relative(repo,file))});
check('Macro family parent count',macroFamilies.length===10,{actual:macroFamilies.length,expected:10});
check('Current child concept count',currentChildIds.length===51&&new Set(currentChildIds).size===51,{actual:currentChildIds.length,expected:51});
const integrity=assertCanonicalIntegrity(library);
check('Library registry IDs synchronized',new Set(Object.keys(library.concepts)).size===library.registry.concepts.length&&library.registry.concepts.length===registry.concepts.length,{moduleCount:Object.keys(library.concepts).length,embeddedRegistry:library.registry.concepts.length,fileRegistry:registry.concepts.length});
check('Library semantic hashes synchronized',library.librarySha256===registry.librarySha256&&library.librarySha256===manifest.librarySha256,{librarySha256:library.librarySha256});

const ordinary=currentChildIds.flatMap(id=>uniqueEntries(library.concepts[id],id));
const supplement=uniqueEntries(library.concepts[supplementId],supplementId);
const ordinaryIds=ordinary.map(row=>qid(row.question));
const supplementIds=supplement.map(row=>qid(row.question));
check('Ordinary Macro count',ordinary.length===2758&&new Set(ordinaryIds).size===2758,{actual:ordinary.length,unique:new Set(ordinaryIds).size,expected:2758});
check('Supplement count',supplement.length===112&&new Set(supplementIds).size===112,{actual:supplement.length,unique:new Set(supplementIds).size,expected:112});
check('Total Macro count',new Set([...ordinaryIds,...supplementIds]).size===2870,{actual:new Set([...ordinaryIds,...supplementIds]).size,expected:2870});
check('No ordinary/supplement overlap',ordinaryIds.every(id=>!new Set(supplementIds).has(id)));
const overall=metrics([...ordinary,...supplement]);
check('Category totals',overall.practice===1778&&overall.checkpoint===620&&overall.adaptiveSupport===360&&overall.supplemental===112,overall);

const familySummaries={};
for(const family of macroFamilies){
  const rows=family.conceptIds.flatMap(id=>uniqueEntries(library.concepts[id],id));
  familySummaries[family.id]={childCount:family.conceptIds.length,questionCount:rows.length,childIds:family.conceptIds};
  check(`Family ${family.id} reconciliation`,family.conceptIds.length===expectedFamilyChildCounts[family.id]&&rows.length===expectedFamilyCounts[family.id],familySummaries[family.id]);
}

const newConceptBreakdowns={};
const selectability=[];
const model=modelModule.create(library.registry.concepts);
for(const id of currentChildIds){
  const rows=uniqueEntries(library.concepts[id],id),record=model.get(id);
  const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:`Phase 2 ${id}`,slug:`phase-2-${id}`,supportedModes:['quiz'],selectedConceptIds:[id],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const composed=core.compose(library,recipe);
  const composedIds=new Set(Object.values(composed.banks||{}).flat().map(qid));
  const row={conceptId:id,familyConceptId:macroFamilies.find(family=>family.conceptIds.includes(id)).id,questionCount:rows.length,selectionResolved:Boolean(record&&library.concepts[id]),composedQuestionCount:composedIds.size,unknownConceptErrors:(composed.errors||[]).filter(error=>/Unknown concept/.test(error)),modeLimitations:(composed.errors||[]).filter(error=>!/Unknown concept/.test(error))};
  selectability.push(row);
  check(`Selectable ${id}`,row.selectionResolved&&row.questionCount>0&&row.composedQuestionCount>0&&row.unknownConceptErrors.length===0,row);
  if(expectedNewCounts[id]!=null){newConceptBreakdowns[id]=metrics(rows);check(`New concept ${id} count`,rows.length===expectedNewCounts[id],newConceptBreakdowns[id]);}
  for(const {question} of rows){
    check(`Primary assignment ${qid(question)}`,question.primaryConceptId===id,{conceptId:id,primaryConceptId:question.primaryConceptId});
    if(expectedNewCounts[id]!=null){
      check(`Family assignment ${qid(question)}`,question.familyConceptId===row.familyConceptId,{conceptId:id,familyConceptId:question.familyConceptId,expected:row.familyConceptId});
      check(`Subtopic assignment ${qid(question)}`,Array.isArray(question.subtopicIds)&&question.subtopicIds.length===1&&question.subtopicIds[0]===id,{conceptId:id,subtopicIds:question.subtopicIds});
    }
  }
}
check('Removed IDs are not current cards',removedIds.every(id=>!library.concepts[id]&&!model.get(id)),{removedIds});
check('Supplement remains hidden',Boolean(library.concepts[supplementId]?.supplementType==='checkpoint-challenge'&&!model.get(supplementId)?.cardVisible&&reviews.concepts.find(row=>row.canonicalConceptId===supplementId)?.disposition==='HIDDEN_SUPPLEMENTAL'));
check('No duplicate canonical IDs across current children',new Set(ordinaryIds).size===ordinaryIds.length,{duplicates:ordinaryIds.length-new Set(ordinaryIds).size});

// Preserve exact membership using the checked-in migration inventory, not an
// external TEMP file that froze content before subsequent assessment audits.
const historicalIds=inventory.questions.map(row=>row.questionId).sort();
assert.deepEqual([...ordinaryIds,...supplementIds].sort(),historicalIds,'Original Macro canonical membership changed');
const approved=readJson(path.join(repo,'audit_tools/macro_phase2/macro_phase2_validation.json'));
for(const family of macroFamilies) assert.deepEqual(family.conceptIds,approved.familySummaries[family.id].childIds,'Approved family child membership '+family.id);
const macroComposition=core.compose(library,{schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Current Macro integrity',slug:'current-macro-integrity',supportedModes:[...core.MODE_ORDER],selectedConceptIds:currentChildIds});
check('All original Macro answer keys resolve',(await core.verifyAnswers(macroComposition)).ok);
check('All ten original Macro modes ready',macroComposition.validation.modes.length===10&&macroComposition.validation.modes.every(row=>row.ok));

const ambiguousIds=['ECON-SP-MEDIUM-124','ECON-SP-MEDIUM-125','PG3-MEQ-H-002'];
const currentById=new Map(ordinary.map(row=>[qid(row.question),row]));
check('Three Phase 1 ambiguities resolved to SRAS',ambiguousIds.every(id=>currentById.get(id)?.conceptId==='short-run-aggregate-supply'),{assignments:Object.fromEntries(ambiguousIds.map(id=>[id,currentById.get(id)?.conceptId||null]))});

const phase1TaxonomyById=new Map();
for(const family of taxonomy.recommendedTaxonomy)for(const child of family.children)for(const id of child.questionIds||[])phase1TaxonomyById.set(id,{newChild:child.recommendedConceptId,family:family.familyConceptId});
phase1TaxonomyById.set('PG3-MEQ-H-002',{newChild:'short-run-aggregate-supply',family:'ad-as-equilibrium'});
phase1TaxonomyById.set('PG3-AS-M-001',{newChild:'demand-and-supply-shocks',family:'ad-as-equilibrium'});
const execution=ordinary.filter(row=>row.question.sourcePrimaryConceptId&&removedIds.includes(row.question.sourcePrimaryConceptId)).map(row=>({
  questionId:qid(row.question),oldChild:row.question.sourcePrimaryConceptId,newChild:row.conceptId,family:macroFamilies.find(family=>family.conceptIds.includes(row.conceptId)).id,objective:row.question.objective||null,primarySkill:row.question.primarySkill||null,sourceFile:row.question.sourceOccurrences?.[0]?.sourceFile||row.question.sourceGame||null,result:['PG3-MEQ-H-002','PG3-AS-M-001'].includes(qid(row.question))?'MOVED_WITH_PHASE2_BOUNDARY_OVERRIDE':'MOVED'
})).sort((a,b)=>a.questionId.localeCompare(b.questionId));
check('Taxonomy execution count',execution.length===553,{actual:execution.length,expected:553});
check('Execution matches approved effective assignments',execution.every(row=>phase1TaxonomyById.get(row.questionId)?.newChild===row.newChild),{mismatches:execution.filter(row=>phase1TaxonomyById.get(row.questionId)?.newChild!==row.newChild).map(row=>row.questionId)});

const legacyMap={
  'saving-investment-and-loanable-funds':['saving-and-investment-identities','loanable-funds-equilibrium','loanable-funds-shifts','crowding-out-and-capital-formation'],
  'federal-budgets-and-debt':['budget-accounting-and-public-saving','deficits-debt-and-government-borrowing','debt-measures-burden-and-fiscal-data'],
  'bank-money-creation':['bank-balance-sheets-reserves-and-capital','deposit-creation-and-money-multiplier'],
  'aggregate-supply':['short-run-aggregate-supply','long-run-aggregate-supply-and-potential-output'],
  'macroeconomic-equilibrium-and-shocks':['ad-as-equilibrium-and-output-gaps','demand-and-supply-shocks','long-run-macroeconomic-self-adjustment'],
  'long-run-macroeconomic-adjustment':['ad-as-equilibrium-and-output-gaps','long-run-macroeconomic-self-adjustment']
};
const oldCounts={'saving-investment-and-loanable-funds':160,'federal-budgets-and-debt':108,'bank-money-creation':90,'aggregate-supply':63,'macroeconomic-equilibrium-and-shocks':83,'long-run-macroeconomic-adjustment':49};
const legacyAliases=[];
for(const [oldId,replacements] of Object.entries(legacyMap)){
  const migrated=core.migrateRecipe({schemaVersion:'1.0.0',title:'Legacy Macro',slug:'legacy-macro',supportedModes:['quiz'],selectedConceptIds:[oldId],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}},library,{});
  const composed=core.compose(library,{schemaVersion:'1.0.0',title:'Legacy Macro',slug:'legacy-macro',supportedModes:['quiz'],selectedConceptIds:[oldId],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}});
  const resolvedRows=replacements.flatMap(id=>uniqueEntries(library.concepts[id],id));
  const row={removedFacultyFacingId:oldId,replacementIds:replacements,migratedSelectionIds:migrated.recipe.selectedConceptIds,oldQuestionUniverseCount:oldCounts[oldId],resolvedUniqueQuestionUniverseCount:new Set(resolvedRows.map(item=>qid(item.question))).size,selectionResolves:replacements.every(id=>migrated.recipe.selectedConceptIds.includes(id))&&!composed.errors.some(error=>/Unknown concept/.test(error)),compatibilityBehavior:['macroeconomic-equilibrium-and-shocks','long-run-macroeconomic-adjustment'].includes(oldId)?'SUPERSET_DUE_TO_APPROVED_CHILDREN_DRAWING_FROM_BOTH_LEGACY_POOLS':'EXACT_PARTITION'};
  legacyAliases.push(row);check(`Legacy alias ${oldId}`,row.selectionResolves,row);
  assert.deepEqual([...migrated.recipe.selectedConceptIds].sort(),[...replacements].sort(), 'Exact legacy expansion '+oldId);
}


const reviewByConcept=new Map(reviews.concepts.map(row=>[row.canonicalConceptId,row]));
for(const id of Object.keys(expectedNewCounts)){
 const record=reviewByConcept.get(id);
 check('Current review resource '+id,record?.disposition==='REVIEW_SHEET'&&record.reviewCodes.length>0);
 const resolved=core.resolveConceptReviews(library,reviews,[id]);
 check('Review route '+id,resolved.errors.length===0);
}

const allMacroFamilies=modelModule.NAVIGATION_FAMILIES.macro;
const openFamily=allMacroFamilies.find(family=>family.id==='open-economy-macroeconomics');
const openManifest=readJson(path.join(repo,'audit_tools/macro_open_economy/macro_open_economy_question_manifest.json'));
assert.deepEqual([...openFamily.conceptIds].sort(),Object.keys(openManifest.byChild).sort(),'Open-economy children');
check('Open-economy expansion',openFamily.conceptIds.length===6&&openManifest.totalNewQuestions===240);
for(const id of openFamily.conceptIds){
 const rows=uniqueEntries(library.concepts[id],id);
 assert.deepEqual(rows.map(row=>qid(row.question)).sort(),openEconomyQuestions.filter(q=>q.child===id).map(q=>q.id).sort(),'Authored open-economy membership '+id);
 check('Open-economy count '+id,rows.length===openManifest.byChild[id].totalQuestions);
}
const sharedIds=allMacroFamilies.filter(family=>['macro-foundations','markets-policy','international-trade'].includes(family.id)).flatMap(family=>family.conceptIds);
const generalIds=modelModule.NAVIGATION_FAMILIES.general.flatMap(family=>family.conceptIds);
assert.deepEqual([...sharedIds].sort(),[...generalIds].sort(),'Macro intentionally shares the 22 General Economics concepts');
check('Shared General concept count',sharedIds.length===22);
const allSelectable=allMacroFamilies.flatMap(family=>family.conceptIds);
check('No duplicate Macro navigation IDs',new Set(allSelectable).size===allSelectable.length);
for(const id of allSelectable){
 check('Visible Macro card '+id,Boolean(model.get(id)?.cardVisible&&library.concepts[id]));
 const composed=core.compose(library,{schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Current Macro selection',slug:'current-macro-selection',supportedModes:['quiz'],selectedConceptIds:[id]});
 check('Current Macro selection '+id,!composed.errors.some(error=>/Unknown concept/.test(error))&&Object.values(composed.banks).flat().length>0);
}
const validation={status:'PASS',integrity,checks:checks.length,originalMacro:overall,originalChildren:currentChildIds.length,openEconomyQuestions:openManifest.totalNewQuestions,sharedGeneralConcepts:sharedIds.length,selectableMacroConcepts:allSelectable.length,familySummaries,newConceptBreakdowns,legacyAliases};
// Current regression evidence must not overwrite the completed migration report.
const artifact=writeTestArtifact('tests/macro-taxonomy-current-validation.json',JSON.stringify(validation,null,2)+'\n');
console.log(JSON.stringify({...validation,artifact},null,2));
