import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import * as author from "../build/faculty-build-composer/authoring/saving_investment_loanable_funds_question_pool_author.mjs";

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,"..");
const composerDir=path.join(root,"build/faculty-build-composer"),dataDir=path.join(composerDir,"data");
const libraryPath=path.join(dataDir,"composer_library.js"),registryPath=path.join(dataDir,"composer_registry.json"),manifestPath=path.join(dataDir,"composer_library_manifest.json");
const incomingDir=path.join(dataDir,"question-assets/_incoming-loanable-funds"),finalDir=path.join(dataDir,`question-assets/${author.CONCEPT_ID}`);
const COMPOSER_VERSION="4.5s.3k",GENERATED_AT="2026-08-28T18:00:00.000Z";
const TITLE="Saving, Investment & Loanable Funds";
const DESCRIPTION="Connect saving to macroeconomic investment; calculate private, public, and national saving; analyze closed-economy saving-investment accounting and loanable-funds equilibrium; and trace shifts, crowding out, and capital formation.";
const SOURCE_GAME="saving-investment-loanable-funds-authoring";
const SOURCE_FILE="build/faculty-build-composer/authoring/saving_investment_loanable_funds_question_pool_author.mjs";
const PREREQUISITES=["federal-budgets-and-debt","gdp-components","gdp-measurement"];
const RELATED=["fiscal-multipliers-and-crowding-out","economic-growth-policy","federal-budgets-and-debt","real-versus-nominal-interest-rates"];
const EXCLUDED=[
  "Federal Budgets & Debt retains federal deficit, debt, debt-to-GDP, debt-service, and introductory public-saving records.",
  "Fiscal Multipliers and Crowding Out retains multiplier mechanics and the short-run aggregate-demand offset.",
  "Economic Growth Policy retains broad productivity and long-run-growth determinants; this bank only bridges investment to physical capital and productive capacity.",
  "Open-economy saving-investment relationships and international capital flows remain reserved for later Macro phases."
];
const NOTES="Standalone 160-record Phase 2 Macro bank with 60 genuinely graph-dependent questions across eight validated LOANABLE assets, explicit net-tax saving conventions, closed-economy safeguards, and adaptive Repair and Bridge support.";
const EXPECTED_ASSETS=new Set(Object.keys(author.GRAPH_ASSETS));
const EXPECTED_ASSET_METADATA=Object.freeze({
  "LOANABLE-01.webp":{bytes:64002,width:1720,height:1200,sha256:"ffcf2c288859e6670f30c4692c1d21b312ce00c767b98f64f9e7cd36ca96e172"},
  "LOANABLE-02.webp":{bytes:72358,width:1623,height:1161,sha256:"add4e97e9dcc463277b404e69b2d9286c9de10c1a8074affb9b23b208bb3065d"},
  "LOANABLE-03.webp":{bytes:76794,width:1720,height:1200,sha256:"1c1aa50c77e4ecb09838dd4b4089d53d4b3fe32277a35b110570a3f760556dcb"},
  "LOANABLE-04.webp":{bytes:79462,width:1720,height:1200,sha256:"55e31006196b53b5dccfd2e836f2b2874479d14784682c2f2720bd5a3e3afd8a"},
  "LOANABLE-05.webp":{bytes:71888,width:1720,height:1200,sha256:"bc92cb3b9d783df52a0b385d9cb434f0de5fc97f9ffbbcfb380f724d9db4fb4f"},
  "LOANABLE-06.webp":{bytes:73214,width:1646,height:1170,sha256:"b8e52bcb99e62e8a531fcf2abe38620dffdedbcdbdd62cb508c9a4948f9c8ec1"},
  "LOANABLE-07.webp":{bytes:74826,width:1653,height:1140,sha256:"70d6c2b1b959a05cf5670dca92d9b83abfbf74ffe90f85b87da8078b19633a65"},
  "LOANABLE-08.webp":{bytes:83980,width:1652,height:1200,sha256:"722f51bc317e6480b88c30cf29bdbbea8203b7e979ad253034417098d40ae8df"}
});

const sha256=value=>crypto.createHash("sha256").update(value).digest("hex");
const normalize=value=>String(value??"").trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g," ");
function stableStringify(value){if(Array.isArray(value))return`[${value.map(stableStringify).join(",")}]`;if(value&&typeof value==="object")return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;return JSON.stringify(value);}
function readLibrary(){const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(libraryPath,"utf8"),sandbox,{filename:libraryPath});return sandbox.window.MQ_COMPOSER_LIBRARY;}
function conceptEntries(module,conceptId){const out=[];for(const [pool,items] of Object.entries(module?.questions||{}))for(const question of items||[])out.push({conceptId,pool,question});for(const pool of ["repairQuestions","repairSeedQuestions","bridgeQuestions"])for(const question of module?.[pool]||[])out.push({conceptId,pool,question});return out;}
function allQuestionEntries(library){return Object.entries(library.concepts||{}).flatMap(([id,module])=>conceptEntries(module,id));}
function locateAsset(filename){const final=path.join(finalDir,filename);return fs.existsSync(final)?final:path.join(incomingDir,filename);}
function webpDimensions(bytes){
  if(bytes.toString("ascii",0,4)!=="RIFF"||bytes.toString("ascii",8,12)!=="WEBP")throw new Error("Asset is not a valid WebP container.");
  const chunk=bytes.toString("ascii",12,16);
  if(chunk==="VP8X")return{width:1+bytes.readUIntLE(24,3),height:1+bytes.readUIntLE(27,3)};
  if(chunk==="VP8 ")return{width:bytes.readUInt16LE(26)&0x3fff,height:bytes.readUInt16LE(28)&0x3fff};
  if(chunk==="VP8L"){const bits=bytes.readUInt32LE(21);return{width:1+(bits&0x3fff),height:1+((bits>>>14)&0x3fff)};}
  throw new Error(`Unsupported WebP chunk ${chunk}.`);
}
function validateAsset(filename){const bytes=fs.readFileSync(locateAsset(filename)),actual={bytes:bytes.length,...webpDimensions(bytes),sha256:sha256(bytes)},expected=EXPECTED_ASSET_METADATA[filename];for(const key of ["bytes","width","height","sha256"])if(actual[key]!==expected[key])throw new Error(`${filename} ${key} changed: ${actual[key]} instead of ${expected[key]}.`);return{bytes,actual};}
function publishAssets(){
  fs.mkdirSync(finalDir,{recursive:true});
  for(const filename of EXPECTED_ASSETS){const incoming=path.join(incomingDir,filename),final=path.join(finalDir,filename);if(fs.existsSync(final)){if(fs.existsSync(incoming)&&!fs.readFileSync(incoming).equals(fs.readFileSync(final)))throw new Error(`Filename collision ${filename}.`);if(fs.existsSync(incoming))fs.unlinkSync(incoming);}else{if(!fs.existsSync(incoming))throw new Error(`Missing staged asset ${filename}.`);fs.renameSync(incoming,final);}}
  const remaining=fs.readdirSync(incomingDir).sort(),quarantined=Object.keys(author.QUARANTINED_ASSETS).sort();if(JSON.stringify(remaining)!==JSON.stringify(quarantined))throw new Error(`Quarantine mismatch: ${remaining.join(", ")}.`);
}
function registerAsset(library,module,filename){const {bytes,actual}=validateAsset(filename),runtimePath=`question-assets/${author.CONCEPT_ID}/${filename}`,metadata={conceptId:author.CONCEPT_ID,filename,sourceAssetPath:runtimePath,sourceUrl:`data/${runtimePath}`,runtimePath,sha256:actual.sha256,sizeBytes:bytes.length,width:actual.width,height:actual.height,imageAlt:author.GRAPH_ASSETS[filename].imageAlt,graphDescription:author.GRAPH_ASSETS[filename].graphDescription,sourceCurationPhase:author.PHASE};module.assets.push(runtimePath);module.assetPaths.push(runtimePath);module.assetMetadata.push(metadata);library.assetInventory.push(metadata);}

function validateAuthor(library){
  const errors=[],legalPools=new Set(["easy","medium","hard","elite","legendary","easyBoss","mediumBoss","finalBoss","legendaryBoss","repairQuestions","bridgeQuestions"]);
  const existing=allQuestionEntries(library).filter(({conceptId,question})=>conceptId!==author.CONCEPT_ID&&question.sourceCurationPhase!==author.PHASE);
  const existingIds=new Set(existing.map(({question})=>String(question.id))),existingStems=new Set(existing.map(({question})=>normalize(question.q))),ids=new Set(),stems=new Set();
  if(author.productionQuestions.length!==160)errors.push("Author source does not contain exactly 160 questions.");
  author.productionQuestions.forEach((q,index)=>{
    if(q.id!==author.ID_FIRST+index)errors.push(`Noncontiguous ID ${q.id}.`);
    if(ids.has(String(q.id))||existingIds.has(String(q.id)))errors.push(`ID collision ${q.id}.`);ids.add(String(q.id));
    const stem=normalize(q.q);if(stems.has(stem)||existingStems.has(stem))errors.push(`Stem collision ${q.id}.`);stems.add(stem);
    if(!legalPools.has(q.pool))errors.push(`Unsupported pool ${q.pool} on ${q.id}.`);
    if(!author.OBJECTIVES[q.objective])errors.push(`Unknown objective ${q.objective} on ${q.id}.`);
    if(!q.type||!q.primarySkill)errors.push(`Missing taxonomy on ${q.id}.`);
    if(q.distractors?.length!==3||new Set([q.answer,...(q.distractors||[])].map(normalize)).size!==4)errors.push(`Invalid answer set ${q.id}.`);
    if(!q.feedback||q.feedback.split(/\s+/).length<8)errors.push(`Underexplained feedback ${q.id}.`);
    if(q.graphRequired!==Boolean(q.asset))errors.push(`Graph metadata mismatch on ${q.id}.`);
    if(q.asset&&!EXPECTED_ASSETS.has(q.asset))errors.push(`Unknown graph asset ${q.asset} on ${q.id}.`);
  });
  if(author.productionQuestions.filter(q=>q.graphRequired).length!==60)errors.push("Expected exactly 60 graph-dependent questions.");
  for(const filename of EXPECTED_ASSETS)validateAsset(filename);
  if(errors.length)throw new Error(errors.join("\n"));
}

function rotateOptions(q){const options=[...q.distractors];options.splice(q.id%4,0,q.answer);return options;}
function publishQuestion(q){
  const safe={id:String(q.id),sourceGame:SOURCE_GAME,q:q.q,options:rotateOptions(q),tag:q.tag,type:q.type,objective:q.objective,difficulty:q.difficulty,conceptCluster:author.CONCEPT_ID,primarySkill:q.primarySkill,secondarySkills:q.secondarySkills,repairSkill:q.repairSkill,commonError:q.commonError,feedback:q.feedback,sourceCurationPhase:author.PHASE,aHash:sha256(normalize(q.answer))};
  if(q.asset){const asset=author.GRAPH_ASSETS[q.asset];safe.image=`question-assets/${author.CONCEPT_ID}/${q.asset}`;safe.imageAlt=asset.imageAlt;safe.graphDescription=asset.graphDescription;safe.graphRequired=true;safe.loanableFundsScenario=asset.scenario;}
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
function registryRecord(module){const entries=conceptEntries(module,author.CONCEPT_ID),counts=countRecords(entries);return{canonicalConceptId:author.CONCEPT_ID,title:TITLE,description:DESCRIPTION,includedSkills:[...new Set(entries.map(e=>e.question.primarySkill).filter(Boolean))].sort(),excludedNeighboringSkills:EXCLUDED,prerequisiteConceptIds:PREREQUISITES,relatedConceptIds:RELATED,sourceChapters:[],sourceObjectives:Object.keys(author.OBJECTIVES),sourceGames:[SOURCE_GAME],questionCountByRole:counts.role,questionCountByDifficulty:counts.difficulty,repairCoverage:{directSkillMatches:counts.role.repair,mainWithUsableSkill:counts.ordinary.length},bridgeCoverage:{directSkillMatches:counts.role.bridge,mainWithUsableSkill:counts.ordinary.length},calculationCoverage:counts.role.calculation,graphCoverage:author.productionQuestions.filter(q=>q.graphRequired).length,status:"active",notes:NOTES,instructionalClassification:"Standalone-ready",coverageStatus:"ready-focused",coverageStatusLabel:"Ready for focused use",coverageStatusNote:NOTES,coverageFloorVersion:author.SOURCE_VERSION,selectionRole:"standalone"};}

function render(){
  const library=readLibrary();validateAuthor(library);
  delete library.concepts[author.CONCEPT_ID];library.registry.concepts=library.registry.concepts.filter(record=>record.canonicalConceptId!==author.CONCEPT_ID);library.assetInventory=(library.assetInventory||[]).filter(asset=>asset.conceptId!==author.CONCEPT_ID&&asset.sourceCurationPhase!==author.PHASE);
  const module=createModule();library.concepts[author.CONCEPT_ID]=module;for(const filename of EXPECTED_ASSETS)registerAsset(library,module,filename);library.registry.concepts.push(registryRecord(module));
  library.composerVersion=COMPOSER_VERSION;library.libraryVersion=`${library.libraryVersion.replace(new RegExp(`-${author.PHASE}`,"g"),"")}-${author.PHASE}`;library.sourceCurationPhase=author.PHASE;library.sourceGeneratedAt=GENERATED_AT;library.generatedAt=GENERATED_AT;library.conceptCount=Object.keys(library.concepts).length;library.canonicalQuestionCount=new Set(allQuestionEntries(library).map(e=>String(e.question.id))).size;library.registry.generatedAt=GENERATED_AT;library.registry.libraryVersion=library.libraryVersion;library.registry.composerVersion=COMPOSER_VERSION;library.registry.canonicalQuestionCount=library.canonicalQuestionCount;delete library.librarySha256;delete library.registry.librarySha256;library.librarySha256=sha256(stableStringify(library));library.registry.librarySha256=library.librarySha256;
  if(library.canonicalQuestionCount!==9539||library.conceptCount!==135||library.assetInventory.length!==494)throw new Error(`Unexpected totals ${library.canonicalQuestionCount}/${library.conceptCount}/${library.assetInventory.length}.`);
  const manifest={assetCount:library.assetInventory.length,assets:library.assetInventory,conceptCount:library.conceptCount,canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:GENERATED_AT};
  return{outputs:[[libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`],[registryPath,`${JSON.stringify(library.registry,null,2)}\n`],[manifestPath,`${JSON.stringify(manifest,null,2)}\n`]],summary:{sourceVersion:author.SOURCE_VERSION,questions:author.productionQuestions.length,graphQuestions:author.productionQuestions.filter(q=>q.graphRequired).length,assetsAdded:Object.keys(author.GRAPH_ASSETS).length,canonicalQuestionCount:library.canonicalQuestionCount,assetInventoryCount:library.assetInventory.length,conceptCount:library.conceptCount,librarySha256:library.librarySha256}};
}

validateAuthor(readLibrary());if(process.argv.includes("--write"))publishAssets();const generated=render();
if(process.argv.includes("--write")){for(const [file,contents] of generated.outputs)fs.writeFileSync(file,contents,"utf8");console.log(JSON.stringify({status:"WROTE",...generated.summary},null,2));}
else{const stale=generated.outputs.filter(([file,contents])=>fs.readFileSync(file,"utf8")!==contents);if(stale.length){console.error(`FAIL: stale outputs: ${stale.map(([file])=>path.relative(root,file)).join(", ")}`);process.exit(1);}console.log(JSON.stringify({status:"PASS",...generated.summary},null,2));}
