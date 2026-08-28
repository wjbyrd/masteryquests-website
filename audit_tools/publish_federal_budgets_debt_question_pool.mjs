import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import * as author from "../build/faculty-build-composer/authoring/federal_budgets_debt_question_pool_author.mjs";

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,"..");
const composerDir=path.join(root,"build/faculty-build-composer"),dataDir=path.join(composerDir,"data");
const libraryPath=path.join(dataDir,"composer_library.js"),registryPath=path.join(dataDir,"composer_registry.json"),manifestPath=path.join(dataDir,"composer_library_manifest.json");
const reviewManifestPath=path.join(dataDir,"concept-reviews/manifest.json"),reviewSourcePath=path.join(dataDir,"concept-reviews/full-library-production/concept_review_source.json");
const COMPOSER_VERSION="4.5s.3k",GENERATED_AT="2026-08-27T18:00:00.000Z";
const TITLE="Federal Budgets & Debt";
const DESCRIPTION="Analyze federal budget accounting, deficits and debt, public saving, federal debt measures, debt-to-GDP, interest costs, government borrowing, and dated official fiscal data.";
const SOURCE_GAME="federal-budgets-debt-authoring";
const SOURCE_FILE="build/faculty-build-composer/authoring/federal_budgets_debt_question_pool_author.mjs";
const PREREQUISITES=["gdp-components","gdp-measurement"];
const RELATED=["fiscal-policy-and-aggregate-demand","fiscal-multipliers-and-crowding-out"];
const EXCLUDED=[
  "Deliberate tax and government-purchases changes and their aggregate-demand effects remain in Fiscal Policy and Aggregate Demand.",
  "Multiplier mechanics and graphical crowding out remain in Fiscal Multipliers and Crowding Out.",
  "Saving-investment equilibrium, the full loanable-funds model, and loanable-funds graphs belong to the future Phase 2 concept."
];
const NOTES="Standalone 108-record Phase 1 Macro bank with official CBO and Treasury data interpretation, exact deficit/debt and public-saving conventions, adaptive Repair and Bridge support, and no manufactured graph dependency.";

const sha256=value=>crypto.createHash("sha256").update(value).digest("hex");
const normalize=value=>String(value??"").trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g," ");
function stableStringify(value){if(Array.isArray(value))return`[${value.map(stableStringify).join(",")}]`;if(value&&typeof value==="object")return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;return JSON.stringify(value);}
function readLibrary(){const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(libraryPath,"utf8"),sandbox,{filename:libraryPath});return sandbox.window.MQ_COMPOSER_LIBRARY;}
function conceptEntries(module,conceptId){const out=[];for(const [pool,items] of Object.entries(module?.questions||{}))for(const question of items||[])out.push({conceptId,pool,question});for(const pool of ["repairQuestions","repairSeedQuestions","bridgeQuestions"])for(const question of module?.[pool]||[])out.push({conceptId,pool,question});return out;}
function allQuestionEntries(library){return Object.entries(library.concepts||{}).flatMap(([id,module])=>conceptEntries(module,id));}

function validateAuthor(library){
  const errors=[],legalPools=new Set(["easy","medium","hard","elite","legendary","easyBoss","mediumBoss","finalBoss","legendaryBoss","repairQuestions","bridgeQuestions"]);
  const existing=allQuestionEntries(library).filter(({conceptId,question})=>conceptId!==author.CONCEPT_ID&&question.sourceCurationPhase!==author.PHASE);
  const existingIds=new Set(existing.map(({question})=>String(question.id))),existingStems=new Set(existing.map(({question})=>normalize(question.q))),ids=new Set(),stems=new Set();
  if(author.productionQuestions.length!==108)errors.push("Author source does not contain exactly 108 questions.");
  author.productionQuestions.forEach((q,index)=>{
    if(q.id!==author.ID_FIRST+index)errors.push(`Noncontiguous ID ${q.id}.`);
    if(ids.has(String(q.id))||existingIds.has(String(q.id)))errors.push(`ID collision ${q.id}.`);ids.add(String(q.id));
    const stem=normalize(q.q);if(stems.has(stem)||existingStems.has(stem))errors.push(`Stem collision ${q.id}.`);stems.add(stem);
    if(!legalPools.has(q.pool))errors.push(`Unsupported pool ${q.pool} on ${q.id}.`);
    if(!author.OBJECTIVES[q.objective])errors.push(`Unknown objective ${q.objective} on ${q.id}.`);
    if(!q.type||!q.primarySkill)errors.push(`Missing taxonomy on ${q.id}.`);
    if(q.distractors?.length!==3||new Set([q.answer,...(q.distractors||[])].map(normalize)).size!==4)errors.push(`Invalid answer set ${q.id}.`);
    if(!q.feedback||q.feedback.split(/\s+/).length<8)errors.push(`Underexplained feedback ${q.id}.`);
    if(q.graphRequired||q.asset)errors.push(`Graph metadata is forbidden on ${q.id}.`);
    if(q.dataSourceKey&&!author.DATA_SOURCES[q.dataSourceKey])errors.push(`Unknown data source ${q.dataSourceKey} on ${q.id}.`);
  });
  if(errors.length)throw new Error(errors.join("\n"));
}

function rotateOptions(q){const options=[...q.distractors];options.splice(q.id%4,0,q.answer);return options;}
function publishQuestion(q){
  const safe={id:String(q.id),sourceGame:SOURCE_GAME,q:q.q,options:rotateOptions(q),tag:q.tag,type:q.type,objective:q.objective,difficulty:q.difficulty,conceptCluster:author.CONCEPT_ID,primarySkill:q.primarySkill,secondarySkills:q.secondarySkills,repairSkill:q.repairSkill,commonError:q.commonError,feedback:q.feedback,sourceCurationPhase:author.PHASE,aHash:sha256(normalize(q.answer))};
  if(q.dataSourceKey)safe.dataSourceKey=q.dataSourceKey;
  const sourceHash=sha256(stableStringify(safe));
  const bossTier=({easyBoss:"stageOne",mediumBoss:"stageTwo",finalBoss:"stageThree",legendaryBoss:"legendary"})[q.pool]||null;
  const instructionalRole=q.pool==="repairQuestions"?"repair":q.pool==="bridgeQuestions"?"bridge":q.pool==="legendaryBoss"?"legendaryBoss":["easyBoss","mediumBoss","finalBoss"].includes(q.pool)?"boss":q.pool==="elite"?"elite":q.pool==="legendary"?"legendary":"main";
  return{...safe,canonicalId:String(q.id),sourceId:q.id,sourceChapter:[],sourcePool:q.pool,sourceHash,sourceOccurrences:[{sourceGame:SOURCE_GAME,sourceFile:SOURCE_FILE,sourceGlobal:"productionQuestions",sourcePool:q.pool,routeKey:q.objective,sourceRecordOrder:q.id-author.ID_FIRST,sourceId:q.id,sourceHash,sourceCurationPhase:author.PHASE}],primaryConceptId:author.CONCEPT_ID,secondaryConceptIds:[],familyConceptId:author.CONCEPT_ID,subtopicIds:[],instructionalRole,canonicalDifficulty:q.difficulty,originalSourcePool:q.pool,originalBossTier:bossTier};
}

function createModule(){
  const module={schemaVersion:"1.0.0",canonicalConceptId:author.CONCEPT_ID,title:TITLE,description:DESCRIPTION,sourceChapters:[],legacyObjectives:[],objectiveLabels:{...author.OBJECTIVES},questions:{easy:[],medium:[],hard:[],elite:[],legendary:[],calculation:[],boss:[],legendaryBoss:[],integration:[]},repairQuestions:[],repairSeedQuestions:[],bridgeQuestions:[],directSkillRepairRoutes:{},microSkillRepairPools:{},skillRepairSeedPools:{},microSkillBridgePools:{},assets:[],assetMetadata:[],assetPaths:[],standaloneRecommendation:"standalone-ready"};
  for(const authored of author.productionQuestions){const published=publishQuestion(authored);if(["repairQuestions","bridgeQuestions"].includes(authored.pool))module[authored.pool].push(published);else module.questions[["easyBoss","mediumBoss","finalBoss"].includes(authored.pool)?"boss":authored.pool].push(published);}
  for(const q of module.repairQuestions)(module.microSkillRepairPools[q.primarySkill]||=[]).push(q.id);
  for(const q of module.bridgeQuestions)(module.microSkillBridgePools[q.primarySkill]||=[]).push(q.id);
  return module;
}
function countRecords(entries){const ordinary=entries.filter(({pool})=>!["repairQuestions","repairSeedQuestions","bridgeQuestions"].includes(pool));const difficulty=entries.reduce((o,{question})=>(o[question.canonicalDifficulty||question.difficulty||"unknown"]=(o[question.canonicalDifficulty||question.difficulty||"unknown"]||0)+1,o),{});return{ordinary,difficulty,role:{boss:entries.filter(e=>e.pool==="boss").length,bridge:entries.filter(e=>e.pool==="bridgeQuestions").length,calculation:ordinary.filter(e=>/calculation/i.test(e.question.type||"")).length,elite:entries.filter(e=>e.pool==="elite").length,integration:ordinary.filter(e=>/integration/i.test(e.question.type||"")).length,legendary:entries.filter(e=>e.pool==="legendary").length,legendaryBoss:entries.filter(e=>e.pool==="legendaryBoss").length,main:entries.filter(e=>["easy","medium","hard"].includes(e.pool)).length,repair:entries.filter(e=>e.pool==="repairQuestions").length,repairSeed:0}};}
function registryRecord(module){const entries=conceptEntries(module,author.CONCEPT_ID),counts=countRecords(entries);return{canonicalConceptId:author.CONCEPT_ID,title:TITLE,description:DESCRIPTION,includedSkills:[...new Set(entries.map(e=>e.question.primarySkill).filter(Boolean))].sort(),excludedNeighboringSkills:EXCLUDED,prerequisiteConceptIds:PREREQUISITES,relatedConceptIds:RELATED,sourceChapters:[],sourceObjectives:Object.keys(author.OBJECTIVES),sourceGames:[SOURCE_GAME],questionCountByRole:counts.role,questionCountByDifficulty:counts.difficulty,repairCoverage:{directSkillMatches:counts.role.repair,mainWithUsableSkill:counts.ordinary.length},bridgeCoverage:{directSkillMatches:counts.role.bridge,mainWithUsableSkill:counts.ordinary.length},calculationCoverage:counts.role.calculation,graphCoverage:0,status:"active",notes:NOTES,instructionalClassification:"Standalone-ready",coverageStatus:"ready-focused",coverageStatusLabel:"Ready for focused use",coverageStatusNote:NOTES,coverageFloorVersion:author.SOURCE_VERSION,selectionRole:"standalone"};}

function render(){
  const library=readLibrary();validateAuthor(library);
  delete library.concepts[author.CONCEPT_ID];library.registry.concepts=library.registry.concepts.filter(record=>record.canonicalConceptId!==author.CONCEPT_ID);library.assetInventory=(library.assetInventory||[]).filter(asset=>asset.conceptId!==author.CONCEPT_ID&&asset.sourceCurationPhase!==author.PHASE);
  const module=createModule();library.concepts[author.CONCEPT_ID]=module;library.registry.concepts.push(registryRecord(module));
  library.composerVersion=COMPOSER_VERSION;library.libraryVersion=`${library.libraryVersion.replace(new RegExp(`-${author.PHASE}`,"g"),"")}-${author.PHASE}`;library.sourceCurationPhase=author.PHASE;library.sourceGeneratedAt=GENERATED_AT;library.generatedAt=GENERATED_AT;library.conceptCount=Object.keys(library.concepts).length;library.canonicalQuestionCount=new Set(allQuestionEntries(library).map(e=>String(e.question.id))).size;library.registry.generatedAt=GENERATED_AT;library.registry.libraryVersion=library.libraryVersion;library.registry.composerVersion=COMPOSER_VERSION;library.registry.canonicalQuestionCount=library.canonicalQuestionCount;delete library.librarySha256;delete library.registry.librarySha256;library.librarySha256=sha256(stableStringify(library));library.registry.librarySha256=library.librarySha256;
  if(library.canonicalQuestionCount!==9379||library.conceptCount!==134||library.assetInventory.length!==486)throw new Error(`Unexpected totals ${library.canonicalQuestionCount}/${library.conceptCount}/${library.assetInventory.length}.`);
  const reviewManifest=JSON.parse(fs.readFileSync(reviewManifestPath,"utf8")),reviewSource=JSON.parse(fs.readFileSync(reviewSourcePath,"utf8"));const federalReviewDisposition=reviewManifest.concepts.find(item=>item.canonicalConceptId===author.CONCEPT_ID);if(federalReviewDisposition?.disposition!=="NO_SHEET_INTEGRATION_META")throw new Error("Federal Budgets Concept Review disposition is missing from authoritative source.");if(reviewManifest.composerLibraryVersion!==library.libraryVersion||reviewSource.composerLibraryVersion!==library.libraryVersion)throw new Error("Concept Review library version is stale.");
  const manifest={assetCount:library.assetInventory.length,assets:library.assetInventory,conceptCount:library.conceptCount,canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:GENERATED_AT};
  return{outputs:[[libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`],[registryPath,`${JSON.stringify(library.registry,null,2)}\n`],[manifestPath,`${JSON.stringify(manifest,null,2)}\n`],[reviewManifestPath,`${JSON.stringify(reviewManifest,null,2)}\n`],[reviewSourcePath,`${JSON.stringify(reviewSource,null,2)}\n`]],summary:{sourceVersion:author.SOURCE_VERSION,questions:author.productionQuestions.length,realDataQuestions:author.productionQuestions.filter(q=>q.dataSourceKey).length,graphQuestions:0,assetsAdded:0,canonicalQuestionCount:library.canonicalQuestionCount,assetInventoryCount:library.assetInventory.length,conceptCount:library.conceptCount,librarySha256:library.librarySha256}};
}

const generated=render();
if(process.argv.includes("--write")){for(const [file,contents] of generated.outputs)fs.writeFileSync(file,contents,"utf8");console.log(JSON.stringify({status:"WROTE",...generated.summary},null,2));}
else{const stale=generated.outputs.filter(([file,contents])=>fs.readFileSync(file,"utf8")!==contents);if(stale.length){console.error(`FAIL: stale outputs: ${stale.map(([file])=>path.relative(root,file)).join(", ")}`);process.exit(1);}console.log(JSON.stringify({status:"PASS",...generated.summary},null,2));}
