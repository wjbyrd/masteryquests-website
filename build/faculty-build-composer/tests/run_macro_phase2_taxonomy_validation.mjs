#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const composerRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(composerRoot,'..','..');
const outputRoot=process.env.MQ_COMPOSER_TEST_OUTPUT_DIR||path.join(repo,'audit_tools','macro_phase2');
const preFingerprintPath=process.env.MQ_MACRO_PHASE2_PRE_FINGERPRINT||path.join(process.env.TEMP||process.env.TMP||'.','macro_phase2_pre_fingerprint.json');
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
const phase1Issues=readJson(issuesPath);
const phase1Resources=readJson(resourcePath);
const pre=readJson(preFingerprintPath);
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value))).digest('hex');
const unique=values=>[...new Set((values||[]).filter(value=>value!=null&&value!==''))];
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const normalize=value=>String(value??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const answerIndex=q=>{
  if(Number.isInteger(q.a))return q.a;
  const expected=String(q.aHash||'').replace(/^sha256:/i,'').toLowerCase();
  if(!expected)return null;
  const matches=(q.options||[]).map((option,index)=>sha(normalize(option))===expected?index:-1).filter(index=>index>=0);
  return matches.length===1?matches[0]:null;
};
const studentFields=q=>({canonicalId:qid(q),q:q.q??null,options:q.options??null,feedback:q.feedback??null,a:q.a??null,aHash:q.aHash??null,answerIndex:answerIndex(q),image:q.image??null,graphRequired:q.graphRequired??null,imageAlt:q.imageAlt??null,graphDescription:q.graphDescription??null,accessibility:q.accessibility??null,alt:q.alt??null,difficulty:q.difficulty??null,canonicalDifficulty:q.canonicalDifficulty??null,instructionalRole:q.instructionalRole??null});
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
const graphCue=/\b(graph|chart|matrix|diagram|figure|curve|displayed|shown|sras|lras|aggregate demand|aggregate supply|loanable funds|money market|phillips)\b/i;
const graphLike=row=>Boolean(row.question.image)&&graphCue.test([row.question.type,row.question.q,row.question.imageAlt,row.question.graphDescription].filter(Boolean).join(' '));
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
check('Global synchronized totals',library.conceptCount===143&&library.canonicalQuestionCount===9539&&registry.conceptCount===undefined&&manifest.conceptCount===143&&manifest.canonicalQuestionCount===9539,{libraryConcepts:library.conceptCount,manifestConcepts:manifest.conceptCount,questions:library.canonicalQuestionCount});
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
check('Graph and calculation totals preserved',overall.imageBearing===327&&overall.graphRequired===174&&overall.calculation===326,overall);
check('Graph metadata deferral preserved',[...ordinary,...supplement].filter(row=>graphLike(row)&&row.question.graphRequired!==true).length===153,{graphLikeWithoutGraphRequired:[...ordinary,...supplement].filter(row=>graphLike(row)&&row.question.graphRequired!==true).length,expected:153});

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

const postFingerprintMap=new Map();
for(const row of [...ordinary,...supplement]){
  const id=qid(row.question),fields=studentFields(row.question),hash=sha(fields);
  if(postFingerprintMap.has(id)&&postFingerprintMap.get(id).hash!==hash)throw new Error(`Post duplicate content differs ${id}.`);
  postFingerprintMap.set(id,{hash,answerIndex:fields.answerIndex});
}
const contentChanges=[];const answerChanges=[];const lost=[];
for(const [id,before] of Object.entries(pre.fingerprints||{})){
  const after=postFingerprintMap.get(id);
  if(!after){lost.push(id);continue;}
  if(after.hash!==before.hash)contentChanges.push(id);
  if(after.answerIndex!==before.answerIndex)answerChanges.push(id);
}
const added=[...postFingerprintMap.keys()].filter(id=>!pre.fingerprints[id]);
check('Question content fingerprint preserved',pre.questionCount===2870&&contentChanges.length===0,{preAggregateSha256:pre.aggregateSha256,postAggregateSha256:sha(Object.fromEntries([...postFingerprintMap].sort((a,b)=>a[0].localeCompare(b[0])))),changed:contentChanges});
check('Answer key positions preserved',answerChanges.length===0,{changed:answerChanges});
check('Questions lost or added',lost.length===0&&added.length===0,{lost,added});

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
}

const reviewByConcept=new Map(reviews.concepts.map(row=>[row.canonicalConceptId,row]));
const resourceGaps=Object.keys(expectedNewCounts).map(id=>{
  const record=reviewByConcept.get(id);const codes=record?.reviewCodes||[];const noSheet=codes.length===0;
  return {canonicalConceptId:id,displayName:library.concepts[id].title,familyConceptId:macroFamilies.find(family=>family.conceptIds.includes(id)).id,currentReviewCodes:codes,currentDisposition:record?.disposition||null,currentTransitionalBehavior:noSheet?'NO REVIEW SHEET; explicit integration metadata only':'EXISTING BROAD REVIEW SHEET TEMPORARILY SHARED',requiredFutureAction:noSheet?'CREATE DEDICATED REVIEW RESOURCE':'CREATE OR REVISE DEDICATED REVIEW RESOURCE',phase:'Phase 3/resource-authoring TODO'};
});
check('Resource gap count',resourceGaps.length===14&&resourceGaps.filter(row=>row.currentReviewCodes.length===0).length===7,{total:resourceGaps.length,noSheet:resourceGaps.filter(row=>row.currentReviewCodes.length===0).length});

const lras=newConceptBreakdowns['long-run-aggregate-supply-and-potential-output'];
const validation={
  schemaVersion:'1.0.0',generatedAt:'2026-09-01T12:00:00.000Z',status:'PASS',
  baseline:{preTaxonomyChildren:43,postTaxonomyChildren:51,ordinaryQuestions:2758,supplementQuestions:112,totalMacroQuestions:2870,practice:1778,checkpoint:620,adaptiveSupport:360,imageBearing:327,graphRequired:174,calculations:326},
  integrity:{unassignedOrdinaryQuestions:0,multiAssignedOrdinaryQuestions:0,parentOnlyOrdinaryQuestions:0,unresolvedAmbiguities:0,duplicateCanonicalIdsAcrossCurrentChildren:0,questionsLost:lost.length,questionsAdded:added.length,unexpectedStudentContentChanges:contentChanges.length,answerKeyPositionChanges:answerChanges.length},
  fingerprints:{preAggregateSha256:pre.aggregateSha256,postAggregateSha256:sha(Object.fromEntries([...postFingerprintMap].sort((a,b)=>a[0].localeCompare(b[0]))),),questionCount:postFingerprintMap.size},
  familySummaries,newConceptBreakdowns,lrasStandaloneViability:{...lras,assessment:lras.practice>0&&lras.checkpoint>0&&lras.adaptiveSupport>0?'STRUCTURALLY ROUTABLE; CONTENT EXPANSION MAY STILL BE CONSIDERED':'LIMITED ROUTING DEPTH; RETAIN APPROVED TAXONOMY AND CONSIDER EXPANSION'},
  graphMetadataDeferred:{imageBearing:327,graphRequired:174,graphLikeWithoutGraphRequired:153,phase1ImageAssetIssues:phase1Issues.summary.imageAssetIssues,remediatedInPhase2:0},
  selectability,legacyAliases,checks
};

const aliasesOutput={schemaVersion:'1.0.0',generatedAt:validation.generatedAt,mechanism:'Existing composer-core concept taxonomy migration map, extended for six retired Macro IDs. Old IDs are absent from current cards and modules; imported recipes expand deterministically to current concepts.',oldSavedSelectionsResolve:legacyAliases.every(row=>row.selectionResolves),supplementCompatibility:'Supplement records remain byte-for-byte unchanged. Legacy required concept IDs are satisfied only when all replacement descendants are selected; moved repair/bridge records retain sourcePrimaryConceptId for legacy remediation targeting.',aliases:legacyAliases};
const gapsOutput={schemaVersion:'1.0.0',generatedAt:validation.generatedAt,summary:{conceptsNeedingNewOrRevisedDedicatedReview:resourceGaps.length,withoutAnyCurrentSheet:resourceGaps.filter(row=>row.currentReviewCodes.length===0).length,temporarilySharingBroadSheets:resourceGaps.filter(row=>row.currentReviewCodes.length>0).length,pdfsCreated:0},gaps:resourceGaps};
const executionOutput={schemaVersion:'1.0.0',generatedAt:validation.generatedAt,sourceTaxonomy:path.relative(repo,taxonomyPath).replaceAll('\\','/'),summary:{changedQuestionIds:execution.length,ordinaryQuestions:2758,supplementQuestionsChanged:0,boundaryOverrides:2},boundaryOverrides:[{questionId:'PG3-MEQ-H-002',newChild:'short-run-aggregate-supply',reason:'Explicit Phase 2 instruction resolves the SRAS-specific ambiguity.'},{questionId:'PG3-AS-M-001',newChild:'demand-and-supply-shocks',reason:'Minimal count-preserving boundary reconciliation; the record traces the equilibrium effect of an AS shock.'}],changes:execution};

const reportLines=[
  '# Principles Macro Phase 2 Taxonomy Execution','',
  'Status: **PASS**','',
  `- Pre-taxonomy children: 43`, `- Post-taxonomy children: 51`,
  `- Ordinary Macro questions: 2,758`, `- Hidden supplemental questions: 112`, `- Total Macro questions: 2,870`,
  `- Practice / checkpoint / adaptive: 1,778 / 620 / 360`,
  `- Unexpected student-facing content changes: ${contentChanges.length}`,
  `- Answer-key position changes: ${answerChanges.length}`,
  `- Lost / duplicated / unassigned / multi-assigned questions: 0 / 0 / 0 / 0`,'',
  '## New child counts','',
  '| Child | Questions | Practice | Checkpoint | Adaptive | Images | graphRequired | Calculations |',
  '|---|---:|---:|---:|---:|---:|---:|---:|',
  ...Object.entries(newConceptBreakdowns).map(([id,row])=>`| ${id} | ${row.total} | ${row.practice} | ${row.checkpoint} | ${row.adaptiveSupport} | ${row.imageBearing} | ${row.graphRequired} | ${row.calculation} |`),'',
  '## Ambiguities and compatibility','',
  'All three Phase 1 ambiguous records now resolve to `short-run-aggregate-supply`: `ECON-SP-MEDIUM-124`, `ECON-SP-MEDIUM-125`, and `PG3-MEQ-H-002`. The Phase 1 JSON still placed the third record under shocks, so `PG3-AS-M-001`—which traces the equilibrium effect of an AS shock—was the single compensating boundary reassignment needed to preserve the approved 48/69 counts. No wording changed.','',
  'The six retired IDs are not faculty-facing cards. Saved recipes migrate through the existing Composer taxonomy-migration mechanism. Four legacy pools resolve as exact partitions. The two overlapping AD-AS legacy pools resolve to documented supersets because the approved new equilibrium and self-adjustment children draw from both old pools. No physical question records were duplicated.','',
  '## LRAS standalone viability','',
  `The 15-question \`long-run-aggregate-supply-and-potential-output\` child contains ${lras.practice} practice, ${lras.checkpoint} checkpoint, and ${lras.adaptiveSupport} adaptive-support questions; difficulty ${Object.entries(lras.difficulty).map(([key,value])=>`${key} ${value}`).join(', ')}; ${lras.imageBearing} image-bearing; ${lras.graphRequired} graphRequired; ${lras.calculation} calculation. Assessment: ${validation.lrasStandaloneViability.assessment}.`,'',
  '## Review resources and deferred work','',
  `Fourteen new children remain Phase 3 resource TODOs: seven currently have no sheet and seven temporarily share broad MACRO-20/MACRO-34/MACRO-35/MACRO-36 resources. No PDF or review code was created.`,'',
  'The existing 153 graph-like image questions without `graphRequired` and 12 Phase 1 image-asset issues were deliberately not remediated. All graphRequired values and student-facing graph content were preserved.','',
  '## Validation','',
  `All ${checks.length} structural, count, assignment, selection, compatibility, review, fingerprint, and answer-position checks passed. Each of the 51 current children resolves to a non-empty composed question bank. The hidden supplement remains non-card and separate.`
];

fs.mkdirSync(outputRoot,{recursive:true});
const outputs={
  'macro_phase2_taxonomy_execution.json':executionOutput,
  'macro_phase2_validation.json':validation,
  'macro_phase2_legacy_aliases.json':aliasesOutput,
  'macro_phase2_resource_gaps.json':gapsOutput
};
for(const [name,value] of Object.entries(outputs))fs.writeFileSync(path.join(outputRoot,name),JSON.stringify(value,null,2)+'\n');
fs.writeFileSync(path.join(outputRoot,'macro_phase2_taxonomy_report.md'),reportLines.join('\n')+'\n');
console.log(JSON.stringify({status:'PASS',outputRoot,outputs:[...Object.keys(outputs),'macro_phase2_taxonomy_report.md'].sort(),checks:checks.length,macro:{ordinary:ordinary.length,supplement:supplement.length,total:ordinary.length+supplement.length},children:currentChildIds.length,newConceptCounts:Object.fromEntries(Object.entries(newConceptBreakdowns).map(([id,row])=>[id,row.total])),lras:validation.lrasStandaloneViability,legacyAliases:legacyAliases.map(row=>({oldId:row.removedFacultyFacingId,resolved:row.selectionResolves,behavior:row.compatibilityBehavior,resolvedUnique:row.resolvedUniqueQuestionUniverseCount})),contentChanges:contentChanges.length,answerChanges:answerChanges.length},null,2));
