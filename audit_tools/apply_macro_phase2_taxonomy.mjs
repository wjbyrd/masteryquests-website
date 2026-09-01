#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(process.argv.find(arg=>!arg.startsWith('--')&&arg!==process.argv[0]&&arg!==process.argv[1])||scriptRoot);
const dryRun=process.argv.includes('--dry-run');
const PHASE='phaseMacro2-taxonomy-normalization-v1';
const GENERATED_AT='2026-09-01T12:00:00.000Z';
const composerRoot=path.join(repo,'build','faculty-build-composer');
const dataRoot=path.join(composerRoot,'data');
const libraryPath=path.join(dataRoot,'composer_library.js');
const registryPath=path.join(dataRoot,'composer_registry.json');
const manifestPath=path.join(dataRoot,'composer_library_manifest.json');
const reviewSourcePath=path.join(dataRoot,'concept-reviews','concept_review_source.json');
const humanReadLedgerPath=path.join(repo,'validation_artifacts','question_quality','question_rewrite_master_execution_ledger.json');
const taxonomyPath=path.join(repo,'audit_tools','macro_phase1','macro_phase1_taxonomy_map.json');
const inventoryPath=path.join(repo,'audit_tools','macro_phase1','macro_phase1_inventory.json');

const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value))).digest('hex');
const deep=value=>JSON.parse(JSON.stringify(value));
const unique=values=>[...new Set((values||[]).filter(value=>value!=null&&value!==''))];
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const readLibrary=()=>{const text=fs.readFileSync(libraryPath,'utf8').trim();const prefix='window.MQ_COMPOSER_LIBRARY=';if(!text.startsWith(prefix)||!text.endsWith(';'))throw new Error('Unexpected Composer library wrapper.');return JSON.parse(text.slice(prefix.length,-1));};
const writeJson=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');
const allQuestionOccurrences=module=>[
  ...Object.entries(module?.questions||{}).flatMap(([pool,items])=>(items||[]).map(question=>({pool,question}))),
  ...(module?.repairQuestions||[]).map(question=>({pool:'repairQuestions',question})),
  ...(module?.repairSeedQuestions||[]).map(question=>({pool:'repairSeedQuestions',question})),
  ...(module?.bridgeQuestions||[]).map(question=>({pool:'bridgeQuestions',question}))
];
const uniqueQuestions=module=>{const seen=new Set();return allQuestionOccurrences(module).filter(({question})=>{const id=qid(question);if(!id||seen.has(id))return false;seen.add(id);return true;}).map(row=>row.question);};
const allLibraryQuestions=library=>Object.values(library.concepts||{}).flatMap(uniqueQuestions);

const studentFields=q=>({
  canonicalId:qid(q),q:q.q??null,options:q.options??null,feedback:q.feedback??null,a:q.a??null,aHash:q.aHash??null,
  image:q.image??null,graphRequired:q.graphRequired??null,imageAlt:q.imageAlt??null,graphDescription:q.graphDescription??null,
  accessibility:q.accessibility??null,alt:q.alt??null,difficulty:q.difficulty??null,
  canonicalDifficulty:q.canonicalDifficulty??null,instructionalRole:q.instructionalRole??null
});
const contentFingerprints=(library,ids)=>{
  const wanted=new Set(ids),out=new Map();
  for(const module of Object.values(library.concepts||{}))for(const {question} of allQuestionOccurrences(module)){
    const id=qid(question);if(!wanted.has(id))continue;const hash=sha(studentFields(question));
    if(out.has(id)&&out.get(id)!==hash)throw new Error(`Student-facing duplicate occurrence differs for ${id}.`);
    out.set(id,hash);
  }
  if(out.size!==wanted.size)throw new Error(`Fingerprint coverage ${out.size}/${wanted.size}.`);
  return out;
};

const OLD_IDS=[
  'saving-investment-and-loanable-funds','federal-budgets-and-debt','bank-money-creation',
  'aggregate-supply','macroeconomic-equilibrium-and-shocks','long-run-macroeconomic-adjustment'
];
const CHANGED_FAMILIES=['saving-fiscal-foundations','money-banking-fed','ad-as-equilibrium'];
const DEFINITIONS={
  'saving-and-investment-identities':{title:'Saving, Investment, and National-Saving Identities',description:'Apply private, public, and national saving identities and the saving-investment relationship.',prerequisiteConceptIds:['gdp-components'],relatedConceptIds:['loanable-funds-equilibrium','budget-accounting-and-public-saving']},
  'loanable-funds-equilibrium':{title:'Loanable-Funds Equilibrium',description:'Analyze loanable-funds equilibrium and distinguish movement along curves from curve shifts.',prerequisiteConceptIds:['saving-and-investment-identities'],relatedConceptIds:['loanable-funds-shifts']},
  'loanable-funds-shifts':{title:'Loanable-Funds Shifts',description:'Analyze saving-supply, investment-demand, and simultaneous shifts in loanable-funds markets.',prerequisiteConceptIds:['loanable-funds-equilibrium'],relatedConceptIds:['crowding-out-and-capital-formation']},
  'crowding-out-and-capital-formation':{title:'Crowding Out and Capital Formation',description:'Trace government borrowing through real interest rates, private investment, and capital formation.',prerequisiteConceptIds:['loanable-funds-shifts'],relatedConceptIds:['deficits-debt-and-government-borrowing','fiscal-multipliers-and-crowding-out']},
  'budget-accounting-and-public-saving':{title:'Budget Accounting and Public Saving',description:'Analyze budget balances, revenues, outlays, public saving, and fiscal accounting identities.',prerequisiteConceptIds:['gdp-components','gdp-measurement'],relatedConceptIds:['saving-and-investment-identities','deficits-debt-and-government-borrowing']},
  'deficits-debt-and-government-borrowing':{title:'Deficits, Debt, and Government Borrowing',description:'Distinguish deficits from debt and analyze persistent deficits and government borrowing.',prerequisiteConceptIds:['budget-accounting-and-public-saving'],relatedConceptIds:['debt-measures-burden-and-fiscal-data','crowding-out-and-capital-formation']},
  'debt-measures-burden-and-fiscal-data':{title:'Debt Measures, Debt Burden, and Fiscal Data',description:'Interpret debt measures, debt-to-GDP, debt service, interest burdens, and real fiscal data.',prerequisiteConceptIds:['deficits-debt-and-government-borrowing'],relatedConceptIds:['budget-accounting-and-public-saving']},
  'bank-balance-sheets-reserves-and-capital':{title:'Bank Balance Sheets, Reserves, and Capital',description:'Analyze bank assets and liabilities, required and excess reserves, lending capacity, capital, leverage, and losses.',prerequisiteConceptIds:['money-functions-and-measures'],relatedConceptIds:['deposit-creation-and-money-multiplier','central-bank-and-federal-reserve']},
  'deposit-creation-and-money-multiplier':{title:'Deposit Creation and the Money Multiplier',description:'Analyze fractional-reserve deposit creation, redeposit chains, multiplier mechanics, and reserve-ratio reasoning.',prerequisiteConceptIds:['bank-balance-sheets-reserves-and-capital'],relatedConceptIds:['monetary-policy-tools','monetary-control-limits']},
  'short-run-aggregate-supply':{title:'Short-Run Aggregate Supply',description:'Analyze the SRAS slope, expected prices, input costs, productivity, and short-run aggregate-supply shifts.',prerequisiteConceptIds:['sources-of-productivity'],relatedConceptIds:['aggregate-demand','long-run-aggregate-supply-and-potential-output','demand-and-supply-shocks']},
  'long-run-aggregate-supply-and-potential-output':{title:'Long-Run Aggregate Supply and Potential Output',description:'Analyze LRAS, natural or potential output, productive capacity, and long-run aggregate-supply shifts.',prerequisiteConceptIds:['living-standards-and-growth'],relatedConceptIds:['short-run-aggregate-supply','ad-as-equilibrium-and-output-gaps']},
  'ad-as-equilibrium-and-output-gaps':{title:'AD-AS Equilibrium and Output Gaps',description:'Read static AD-AS equilibrium and distinguish recessionary and inflationary gaps relative to potential output.',prerequisiteConceptIds:['aggregate-demand','short-run-aggregate-supply','long-run-aggregate-supply-and-potential-output'],relatedConceptIds:['demand-and-supply-shocks','long-run-macroeconomic-self-adjustment']},
  'demand-and-supply-shocks':{title:'Demand and Supply Shocks',description:'Classify and trace demand shocks, supply shocks, stagflation, and simultaneous short-run shocks.',prerequisiteConceptIds:['ad-as-equilibrium-and-output-gaps'],relatedConceptIds:['aggregate-demand','short-run-aggregate-supply','stabilization-policy']},
  'long-run-macroeconomic-self-adjustment':{title:'Long-Run Macroeconomic Self-Adjustment',description:'Trace short-run-to-long-run self-correction and movement back toward potential output.',prerequisiteConceptIds:['ad-as-equilibrium-and-output-gaps','demand-and-supply-shocks'],relatedConceptIds:['stabilization-policy','phillips-curve-expectations']}
};
const NEW_IDS=Object.keys(DEFINITIONS);
const EXPECTED_COUNTS={
  'saving-and-investment-identities':49,'loanable-funds-equilibrium':32,'loanable-funds-shifts':52,'crowding-out-and-capital-formation':27,
  'budget-accounting-and-public-saving':37,'deficits-debt-and-government-borrowing':28,'debt-measures-burden-and-fiscal-data':43,
  'bank-balance-sheets-reserves-and-capital':53,'deposit-creation-and-money-multiplier':37,
  'short-run-aggregate-supply':48,'long-run-aggregate-supply-and-potential-output':15,'ad-as-equilibrium-and-output-gaps':30,
  'demand-and-supply-shocks':69,'long-run-macroeconomic-self-adjustment':33
};

const taxonomy=readJson(taxonomyPath);
const inventory=readJson(inventoryPath);
const macroQuestionIds=inventory.questions.map(row=>row.questionId);
const assignmentById=new Map();
const familyByNewId=new Map();
for(const family of taxonomy.recommendedTaxonomy.filter(row=>CHANGED_FAMILIES.includes(row.familyConceptId))){
  for(const child of family.children){
    if(!DEFINITIONS[child.recommendedConceptId])continue;
    familyByNewId.set(child.recommendedConceptId,family.familyConceptId);
    if(child.questionCount!==EXPECTED_COUNTS[child.recommendedConceptId])throw new Error(`Phase 1 count drift for ${child.recommendedConceptId}.`);
    for(const id of child.questionIds){if(assignmentById.has(id))throw new Error(`Phase 1 map duplicates ${id}.`);assignmentById.set(id,child.recommendedConceptId);}
  }
}
if(assignmentById.size!==553)throw new Error(`Expected 553 changed question IDs; found ${assignmentById.size}.`);
// Phase 2 explicitly resolves PG3-MEQ-H-002 to SRAS, although the Phase 1 JSON
// membership still placed it in shocks. PG3-AS-M-001 is the narrowest
// compensating boundary case: it traces the equilibrium result of an AS shock.
// This preserves the approved 48/69 counts without changing either question.
const PHASE2_ASSIGNMENT_OVERRIDES={
  'PG3-MEQ-H-002':{newConceptId:'short-run-aggregate-supply',reason:'Explicit Phase 2 ambiguity resolution: SRAS-specific skill and content.'},
  'PG3-AS-M-001':{newConceptId:'demand-and-supply-shocks',reason:'Count-preserving boundary reconciliation: traces the equilibrium effect of an aggregate-supply shock.'}
};
for(const [id,override] of Object.entries(PHASE2_ASSIGNMENT_OVERRIDES))assignmentById.set(id,override.newConceptId);
for(const [id,count] of Object.entries(EXPECTED_COUNTS)){
  const actual=[...assignmentById.values()].filter(value=>value===id).length;
  if(actual!==count)throw new Error(`Approved assignment count ${id}: ${actual}/${count}.`);
}
for(const id of ['ECON-SP-MEDIUM-124','ECON-SP-MEDIUM-125','PG3-MEQ-H-002'])if(assignmentById.get(id)!=='short-run-aggregate-supply')throw new Error(`Approved ambiguity mapping missing for ${id}.`);

const library=readLibrary();
const reviewSource=readJson(reviewSourcePath);
const humanReadLedger=readJson(humanReadLedgerPath);
const beforeFingerprints=contentFingerprints(library,macroQuestionIds);
const oldPresent=OLD_IDS.filter(id=>library.concepts[id]);
const newPresent=NEW_IDS.filter(id=>library.concepts[id]);
const alreadyApplied=oldPresent.length===0&&newPresent.length===NEW_IDS.length;
if(!alreadyApplied&&(oldPresent.length!==OLD_IDS.length||newPresent.length!==0))throw new Error(`Mixed Phase 2 state: old=${oldPresent.length}, new=${newPresent.length}.`);

const execution=[];
if(!alreadyApplied){
  const sourceModules=Object.fromEntries(OLD_IDS.map(id=>[id,library.concepts[id]]));
  const sourceOccurrences=[];
  for(const [oldId,module] of Object.entries(sourceModules))for(const row of allQuestionOccurrences(module))sourceOccurrences.push({oldId,...row});
  const uniqueSourceIds=new Set(sourceOccurrences.map(row=>qid(row.question)));
  if(uniqueSourceIds.size!==553)throw new Error(`Changed source universe ${uniqueSourceIds.size}/553.`);
  for(const id of uniqueSourceIds)if(!assignmentById.has(id))throw new Error(`Phase 1 map omits ${id}.`);

  const routeSources=Object.values(sourceModules);
  const allAssets=library.assetInventory||[];
  const assetFor=image=>{const normalized=String(image||'').replaceAll('\\','/').replace(/^data\//,'');const filename=path.posix.basename(normalized);return allAssets.find(asset=>[asset.runtimePath,asset.sourceAssetPath,asset.sourceUrl].some(value=>String(value||'').replaceAll('\\','/').replace(/^data\//,'')===normalized))||allAssets.find(asset=>asset.filename===filename);};
  const routeMapFor=(key,allowed)=>{
    const out={};
    for(const source of routeSources)for(const [skill,refs] of Object.entries(source[key]||{})){
      const filtered=(refs||[]).filter(ref=>allowed.has(typeof ref==='string'?ref:qid(ref)));
      if(filtered.length)out[skill]=unique([...(out[skill]||[]),...deep(filtered)]);
    }
    return out;
  };

  const modules={};
  for(const newId of NEW_IDS){
    const allowed=new Set([...assignmentById].filter(([,target])=>target===newId).map(([id])=>id));
    const assigned=sourceOccurrences.filter(row=>allowed.has(qid(row.question)));
    const representedSources=unique(assigned.map(row=>row.oldId));
    const sourceMeta=representedSources.map(id=>sourceModules[id]);
    const questions={};
    for(const source of sourceMeta)for(const pool of Object.keys(source.questions||{}))questions[pool]??=[];
    for(const pool of ['easy','medium','hard','elite','legendary','calculation','boss','legendaryBoss','integration'])questions[pool]??=[];
    const repairQuestions=[],repairSeedQuestions=[],bridgeQuestions=[];
    for(const {oldId,pool,question} of assigned){
      const copy=deep(question);
      copy.sourcePrimaryConceptId=copy.sourcePrimaryConceptId||copy.primaryConceptId||oldId;
      copy.primaryConceptId=newId;
      copy.familyConceptId=familyByNewId.get(newId);
      copy.subtopicIds=[newId];
      if(pool==='repairQuestions')repairQuestions.push(copy);
      else if(pool==='repairSeedQuestions')repairSeedQuestions.push(copy);
      else if(pool==='bridgeQuestions')bridgeQuestions.push(copy);
      else questions[pool].push(copy);
    }
    const uniqueAssigned=[...new Map([...Object.values(questions).flat(),...repairQuestions,...repairSeedQuestions,...bridgeQuestions].map(q=>[qid(q),q])).values()];
    if(uniqueAssigned.length!==EXPECTED_COUNTS[newId])throw new Error(`${newId} built ${uniqueAssigned.length}/${EXPECTED_COUNTS[newId]}.`);
    const usedImages=new Set(uniqueAssigned.map(q=>q.image).filter(Boolean));
    const assetMetadata=uniqueAssigned.map(q=>assetFor(q.image)).filter(Boolean).filter((asset,index,list)=>list.findIndex(row=>row.runtimePath===asset.runtimePath)===index).map(deep);
    const assetPaths=unique(assetMetadata.map(asset=>asset.runtimePath||asset.sourceAssetPath));
    const labels=Object.assign({},...sourceMeta.map(source=>source.objectiveLabels||{}));
    const objectives=unique(uniqueAssigned.map(q=>q.objective));
    const objectiveLabels=Object.fromEntries(Object.entries(labels).filter(([key])=>objectives.includes(key)));
    objectiveLabels[newId]=DEFINITIONS[newId].title;
    modules[newId]={
      schemaVersion:'1.0.0',canonicalConceptId:newId,title:DEFINITIONS[newId].title,description:DEFINITIONS[newId].description,
      sourceChapters:unique(sourceMeta.flatMap(source=>source.sourceChapters||[])),legacyObjectives:objectives,objectiveLabels,
      questions,repairQuestions,repairSeedQuestions,bridgeQuestions,
      directSkillRepairRoutes:routeMapFor('directSkillRepairRoutes',allowed),
      microSkillRepairPools:routeMapFor('microSkillRepairPools',allowed),
      skillRepairSeedPools:routeMapFor('skillRepairSeedPools',allowed),
      microSkillBridgePools:routeMapFor('microSkillBridgePools',allowed),
      assets:assetPaths,assetMetadata,assetPaths,standaloneRecommendation:'standalone-ready',taxonomyPhase:PHASE,
      legacySourceConceptIds:representedSources
    };
    for(const question of uniqueAssigned){
      const oldChild=question.sourcePrimaryConceptId;
      const override=PHASE2_ASSIGNMENT_OVERRIDES[qid(question)];
      execution.push({questionId:qid(question),oldChild,newChild:newId,family:familyByNewId.get(newId),objective:question.objective||null,primarySkill:question.primarySkill||null,sourceFile:question.sourceOccurrences?.[0]?.sourceFile||question.sourceGame||null,result:override?'MOVED_WITH_PHASE2_BOUNDARY_OVERRIDE':'MOVED',reason:override?.reason||'Exact approved Phase 1 taxonomy-map membership.'});
    }
  }

  for(const id of OLD_IDS)delete library.concepts[id];
  Object.assign(library.concepts,modules);
  library.concepts=Object.fromEntries(Object.entries(library.concepts).sort(([a],[b])=>a.localeCompare(b)));

  const roleKeys=['boss','bridge','calculation','elite','integration','legendary','legendaryBoss','main','repair','repairSeed'];
  const diffKeys=['easy','medium','hard','elite','legendary','unknown'];
  const registryRecord=(id,module)=>{
    const questions=uniqueQuestions(module);
    const roles=Object.fromEntries(roleKeys.map(key=>[key,0]));
    const difficulties=Object.fromEntries(diffKeys.map(key=>[key,0]));
    for(const q of questions){const role=q.instructionalRole||'main';roles[role]=(roles[role]||0)+1;const difficulty=q.canonicalDifficulty||(['easyBoss'].includes(q.difficulty)?'easy':['mediumBoss'].includes(q.difficulty)?'medium':['finalBoss','hardBoss'].includes(q.difficulty)?'hard':q.difficulty)||'unknown';difficulties[diffKeys.includes(difficulty)?difficulty:'unknown']++;}
    return {canonicalConceptId:id,title:module.title,description:module.description,includedSkills:unique(questions.map(q=>q.primarySkill)).sort(),excludedNeighboringSkills:['Questions assigned to neighboring Phase 2 Macro children are excluded by the approved exact canonical-ID map.'],prerequisiteConceptIds:DEFINITIONS[id].prerequisiteConceptIds,relatedConceptIds:DEFINITIONS[id].relatedConceptIds,sourceChapters:unique(module.sourceChapters).sort(),sourceObjectives:unique(questions.map(q=>q.objective)).sort(),sourceGames:unique(questions.map(q=>q.sourceGame)).sort(),questionCountByRole:roles,questionCountByDifficulty:difficulties,repairCoverage:{directSkillMatches:module.repairQuestions.length,mainWithUsableSkill:questions.filter(q=>q.primarySkill).length},bridgeCoverage:{directSkillMatches:module.bridgeQuestions.length,mainWithUsableSkill:questions.filter(q=>q.primarySkill).length},calculationCoverage:questions.filter(q=>q.type==='calculation'||q.instructionalRole==='calculation').length,graphCoverage:questions.filter(q=>q.image).length,status:'active',notes:'Phase 2 Principles Macro taxonomy normalization. Exact question membership is governed by audit_tools/macro_phase1/macro_phase1_taxonomy_map.json.',instructionalClassification:'Phase 2 normalized Macro child concept',coverageStatus:'ready-focused',coverageStatusLabel:'Ready for focused use',coverageStatusNote:'Selectable and diagnosable as an independent child under its Macro navigation family.',coverageFloorVersion:PHASE,selectionRole:'standalone',taxonomyPhase:PHASE,legacySourceConceptIds:module.legacySourceConceptIds};
  };
  library.registry.concepts=library.registry.concepts.filter(record=>!OLD_IDS.includes(record.canonicalConceptId));
  for(const id of NEW_IDS)library.registry.concepts.push(registryRecord(id,modules[id]));
  library.registry.concepts.sort((a,b)=>a.canonicalConceptId.localeCompare(b.canonicalConceptId));
}

const phaseSuffix=`-${PHASE}`;
library.libraryVersion=String(library.libraryVersion).replace(new RegExp(`${phaseSuffix}$`),'')+phaseSuffix;
library.sourceCurationPhase=PHASE;
library.sourceGeneratedAt=GENERATED_AT;
library.generatedAt=GENERATED_AT;
library.conceptCount=Object.keys(library.concepts).length;
library.canonicalQuestionCount=new Set(allLibraryQuestions(library).map(qid)).size;
library.registry.generatedAt=GENERATED_AT;
library.registry.curationPhase=PHASE;
library.registry.libraryVersion=library.libraryVersion;
library.registry.canonicalQuestionCount=library.canonicalQuestionCount;
library.registry.composerVersion=library.composerVersion;
delete library.librarySha256;delete library.registry.librarySha256;
library.librarySha256=sha(library);
library.registry.librarySha256=library.librarySha256;
if(library.conceptCount!==143||library.canonicalQuestionCount!==9539)throw new Error(`Global totals ${library.conceptCount}/143 concepts, ${library.canonicalQuestionCount}/9539 questions.`);
for(const id of OLD_IDS)if(library.concepts[id])throw new Error(`Legacy concept remains current: ${id}.`);
for(const [id,count] of Object.entries(EXPECTED_COUNTS))if(uniqueQuestions(library.concepts[id]).length!==count)throw new Error(`Post count mismatch ${id}.`);

const reviewReplacementByCode={
  'MACRO-20':['bank-balance-sheets-reserves-and-capital','deposit-creation-and-money-multiplier'],
  'MACRO-34':['short-run-aggregate-supply','long-run-aggregate-supply-and-potential-output'],
  'MACRO-35':['ad-as-equilibrium-and-output-gaps','demand-and-supply-shocks','long-run-macroeconomic-self-adjustment'],
  'MACRO-36':['ad-as-equilibrium-and-output-gaps','long-run-macroeconomic-self-adjustment']
};
for(const review of reviewSource.reviews||[])if(reviewReplacementByCode[review.code])review.canonicalConceptIds=reviewReplacementByCode[review.code];
reviewSource.conceptDispositionOverrides??={};
delete reviewSource.conceptDispositionOverrides['saving-investment-and-loanable-funds'];
delete reviewSource.conceptDispositionOverrides['federal-budgets-and-debt'];
for(const id of Object.keys(EXPECTED_COUNTS).filter(id=>familyByNewId.get(id)==='saving-fiscal-foundations'))reviewSource.conceptDispositionOverrides[id]={disposition:'NO_SHEET_INTEGRATION_META',discipline:'macro',reason:'Phase 2 created this independently diagnosable Macro child without fabricating a review PDF; a dedicated review resource is deferred to the resource-authoring phase.'};
reviewSource.generatedAt=GENERATED_AT;
reviewSource.composerLibraryVersion=library.libraryVersion;
// This ledger's entries remain immutable question-content provenance, while its
// library pointer follows the current generated Composer snapshot.
humanReadLedger.generatedAt=GENERATED_AT;
humanReadLedger.libraryVersion=library.libraryVersion;
humanReadLedger.librarySha256=library.librarySha256;

const manifest={assetCount:library.assetInventory.length,assets:library.assetInventory,conceptCount:library.conceptCount,canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:GENERATED_AT};
const afterFingerprints=contentFingerprints(library,macroQuestionIds);
const contentChanges=[...beforeFingerprints].filter(([id,hash])=>afterFingerprints.get(id)!==hash).map(([id])=>id);
if(contentChanges.length)throw new Error(`Unexpected student-facing content changes: ${contentChanges.slice(0,10).join(', ')}.`);

const outputs={
  library:`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`,
  registry:JSON.stringify(library.registry,null,2)+'\n',
  manifest:JSON.stringify(manifest,null,2)+'\n',
  reviewSource:JSON.stringify(reviewSource,null,2)+'\n',
  humanReadLedger:JSON.stringify(humanReadLedger,null,2)+'\n'
};
const currentOutputs={library:fs.readFileSync(libraryPath,'utf8'),registry:fs.readFileSync(registryPath,'utf8'),manifest:fs.readFileSync(manifestPath,'utf8'),reviewSource:fs.readFileSync(reviewSourcePath,'utf8'),humanReadLedger:fs.readFileSync(humanReadLedgerPath,'utf8')};
const semanticChangedFiles=Object.keys(outputs).filter(key=>outputs[key]!==currentOutputs[key]);
if(!dryRun){
  fs.writeFileSync(libraryPath,outputs.library);
  fs.writeFileSync(registryPath,outputs.registry);
  fs.writeFileSync(manifestPath,outputs.manifest);
  fs.writeFileSync(reviewSourcePath,outputs.reviewSource);
  fs.writeFileSync(humanReadLedgerPath,outputs.humanReadLedger);
}

console.log(JSON.stringify({phase:PHASE,dryRun,alreadyApplied,semanticChangedFiles,changedQuestionIds:alreadyApplied?0:execution.length,contentChangedUnexpectedly:contentChanges.length,conceptCount:library.conceptCount,canonicalQuestionCount:library.canonicalQuestionCount,librarySha256:library.librarySha256,newConceptCounts:Object.fromEntries(NEW_IDS.map(id=>[id,uniqueQuestions(library.concepts[id]).length]))},null,2));
