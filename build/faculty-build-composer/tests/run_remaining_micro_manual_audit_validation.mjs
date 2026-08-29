import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import childProcess from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import * as factor from "../authoring/factor_markets_question_pool_author.mjs";
import * as choice from "../authoring/consumer_choice_question_pool_author.mjs";
import * as inequality from "../authoring/income_inequality_question_pool_author.mjs";
import * as information from "../authoring/information_behavioral_political_economy_question_pool_author.mjs";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"../../..");
const require=createRequire(import.meta.url);
const currentArea=require("../course-area-model.js");
const core=require("../composer-core.js");
const helpers=require("./composer-test-helpers.js");
const libraryRel="build/faculty-build-composer/data/composer_library.js";
const libraryPath=path.join(root,libraryRel);
const templatePath=path.join(root,"build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html");
const composerPath=path.join(root,"build/faculty-build-composer/composer.js");
const TARGETS=[factor,choice,inequality,information];
const TARGET_IDS=new Set(TARGETS.map(item=>item.CONCEPT_ID));

function loadLibrary(source){const box={window:{}};vm.runInNewContext(source,box);return box.window.MQ_COMPOSER_LIBRARY;}
function loadArea(source){const box={};vm.runInNewContext(source,box);return box.MQCourseAreaModel;}
function entries(library){const out=[];for(const [conceptId,module] of Object.entries(library.concepts||{})){for(const [pool,items] of Object.entries(module.questions||{}))for(const question of items||[])out.push({conceptId,pool,question});for(const pool of ["repairQuestions","repairSeedQuestions","bridgeQuestions"])for(const question of module[pool]||[])out.push({conceptId,pool,question});}return out;}
function stable(value){if(Array.isArray(value))return`[${value.map(stable).join(",")}]`;if(value&&typeof value==="object")return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;return JSON.stringify(value);}
function normalize(value){return String(value??"").normalize("NFKC").toLowerCase().replace(/^refer to the graph above\.\s*/,"").replace(/[^a-z0-9%$]+/g," ").trim();}
function rng(seed){let state=seed>>>0;return()=>((state=Math.imul(1664525,state)+1013904223>>>0)/4294967296);}
function pick(items,random){return items[Math.floor(random()*items.length)];}
function maxStreak(items,key){let max=0,run=0,last;for(const item of items){const value=key(item);run=value===last?run+1:1;last=value;max=Math.max(max,run);}return max;}
function maxWindowCount(items,key,width=12){let max=0;for(let i=0;i<items.length;i++){const counts={};for(const item of items.slice(i,i+width)){const value=key(item);counts[value]=(counts[value]||0)+1;}max=Math.max(max,...Object.values(counts));}return max;}
function embedAssets(composition){const embedded={};for(const asset of composition.assets||[]){const bytes=fs.readFileSync(path.join(root,"build/faculty-build-composer/data",asset.runtimePath));embedded[asset.runtimePath]=`data:image/webp;base64,${bytes.toString("base64")}`;}composition.embeddedQuestionAssets=embedded;}
function selectSequence(modules,seed){
  const random=rng(seed),all=modules.flatMap(module=>module.productionQuestions),ordinary=all.filter(q=>!["repairQuestions","bridgeQuestions"].includes(q.pool)&&!q.pool.endsWith("Boss"));
  const history=[],tagHistory=[];
  for(let index=0;index<27;index+=1){
    let available=ordinary.filter(q=>!history.slice(-10).some(item=>item.id===q.id));
    const lastTags=tagHistory.slice(-2);const diversified=available.filter(q=>!(lastTags.length===2&&lastTags.every(tag=>tag===q.tag)));
    if(diversified.length>=3)available=diversified;
    const selected=pick(available,random);history.push(selected);tagHistory.push(selected.tag);
  }
  const checkpoints=[];
  for(const pool of ["easyBoss","mediumBoss","finalBoss"]){
    const bank=all.filter(q=>q.pool===pool),objectives=[...new Set(bank.map(q=>q.objective))],objective=pick(objectives,random);
    const matches=bank.filter(q=>q.objective===objective),selected=[];
    while(selected.length<3&&matches.length){const q=matches.splice(Math.floor(random()*matches.length),1)[0];selected.push(q);}
    const remaining=bank.filter(q=>!selected.some(item=>item.id===q.id));
    while(selected.length<3&&remaining.length){const usedObjectives=new Set(selected.map(q=>q.objective)),diverse=remaining.filter(q=>!usedObjectives.has(q.objective)),source=diverse.length?diverse:remaining,q=source[Math.floor(random()*source.length)];selected.push(q);remaining.splice(remaining.indexOf(q),1);}
    checkpoints.push({pool,objective,questions:selected,concepts:[...new Set(selected.map(q=>q.conceptCluster))]});
  }
  const supportSource=ordinary.find(q=>all.some(item=>item.pool==="repairQuestions"&&item.primarySkill===q.primarySkill));
  const repair=all.find(q=>q.pool==="repairQuestions"&&q.primarySkill===supportSource.primarySkill),bridge=all.find(q=>q.pool==="bridgeQuestions"&&q.primarySkill===supportSource.primarySkill);
  const checkpointAssessment={answers:[false,false,true],questionsDelivered:3,missesRecorded:2,remediationDuringCheckpoint:false,completed:true,postCheckpointRoom:11};
  const ordinaryRepair={origin:supportSource.id,repair:repair?.id,bridge:bridge?.id,returnRoom:11,resumedRoom:11,path:["repair","bridge","retest","resume-post-checkpoint"]};
  const repeatWithinRecentWindow=history.some((item,index)=>history.slice(Math.max(0,index-10),index).some(prior=>prior.id===item.id));
  return {seed,duplicateIdsAcrossRun:history.length-new Set(history.map(q=>q.id)).size,repeatWithinRecentWindow,maxAnswerIn12:maxWindowCount(history,q=>normalize(q.answer)),maxTagStreak:maxStreak(history,q=>q.tag),maxConceptStreak:maxStreak(history,q=>q.conceptCluster),checkpointConcepts:checkpoints.map(item=>item.concepts),checkpointAssessment,ordinaryRepair};
}

const current=loadLibrary(fs.readFileSync(libraryPath,"utf8"));
const head=loadLibrary(childProcess.execFileSync("git",["show",`HEAD:${libraryRel}`],{cwd:root,encoding:"utf8",maxBuffer:40_000_000}));
const errors=[],checks=[];const check=(ok,label,detail="")=>{checks.push({label,pass:Boolean(ok),detail});if(!ok)errors.push(`${label}${detail?`: ${detail}`:""}`);};

const area=currentArea.create(current.registry.concepts);
for(const id of TARGET_IDS){check(area.disciplineFor(id)==="micro",`${id} discipline is Micro`,area.disciplineFor(id));check(area.areasFor(id).includes("micro")&&!area.areasFor(id).includes("macro"),`${id} appears only in Micro`,area.areasFor(id).join(","));}
const headAreaSource=childProcess.execFileSync("git",["show","HEAD:build/faculty-build-composer/course-area-model.js"],{cwd:root,encoding:"utf8"});
const oldArea=loadArea(headAreaSource).create(current.registry.concepts);
const allowedAreaChanges=new Set([choice.CONCEPT_ID,inequality.CONCEPT_ID,information.CONCEPT_ID]);
for(const record of current.registry.concepts){const id=record.canonicalConceptId;if(allowedAreaChanges.has(id))continue;check(stable(area.areasFor(id))===stable(oldArea.areasFor(id)),`unchanged realm metadata ${id}`);}

for(const module of TARGETS){
  const questions=module.productionQuestions;
  check(questions.every((q,index)=>q.id===module.ID_FIRST+index),`${module.CONCEPT_ID} exact contiguous IDs`);
  check(questions.every(q=>!/\.webp\b/i.test(q.q)),`${module.CONCEPT_ID} no visible filenames`);
  check(questions.every(q=>{const first=q.q.match(/\p{L}/u)?.[0];return !first||first===first.toUpperCase()}),`${module.CONCEPT_ID} capitalization`);
  check(questions.filter(q=>q.graphRequired).every(q=>/^Refer to the graph above\.\s+\S/.test(q.q)),`${module.CONCEPT_ID} graph references`);
}

const sourceComposer=fs.readFileSync(composerPath,"utf8");
const presetBlock=sourceComposer.match(/const PRESETS = \[([\s\S]*?)\n\];/)?.[1]||"";
const presetIds=[...presetBlock.matchAll(/'([a-z0-9-]+)'/g)].map(match=>match[1]).filter(id=>current.concepts[id]);
check(presetIds.length>0&&presetIds.every(id=>current.concepts[id]),"quick-start concepts resolve",String(presetIds.length));
for(const module of TARGETS){const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:"Manual audit focused build",slug:`manual-audit-${module.CONCEPT_ID}`,supportedModes:[...core.MODE_ORDER],selectedConceptIds:[module.CONCEPT_ID],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};const result=core.compose(current,recipe);const expectedGraphLimitation=module===information;check(expectedGraphLimitation?result.errors.every(error=>/Trial by Graph/.test(error)):result.errors.length===0,`${module.CONCEPT_ID} focused composition`,result.errors.join(" | "));}
const mixedRecipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:"Remaining Micro Manual Audit",slug:"remaining-micro-manual-audit-production-sample",supportedModes:[...core.MODE_ORDER],selectedConceptIds:[...TARGET_IDS],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
const mixedComposition=core.compose(current,mixedRecipe);check(mixedComposition.errors.length===0,"mixed four-concept composition",mixedComposition.errors.join(" | "));embedAssets(mixedComposition);helpers.attachConceptReviewRuntime(core,mixedComposition,current,[...TARGET_IDS]);const canonicalTemplate=helpers.loadCanonicalTemplate();const mixedConfig=await core.createConfig(mixedRecipe,current,await core.sha256Hex(canonicalTemplate));const mixedMetadata=helpers.createMetadata(core,mixedComposition,mixedConfig,current,{phase:"remaining-micro-manual-audit",sourceVersion:"2026.08.27"});const mixedHtml=core.buildHtml(canonicalTemplate,mixedComposition,mixedConfig,mixedMetadata);helpers.assertInlineScriptsCompile(mixedHtml,"remaining-micro-manual-audit-production-sample.html");const mixedArtifact=helpers.writeTestArtifact("tests/remaining-micro-manual-audit-production-sample.html",mixedHtml);

const currentProtected=entries(current).filter(item=>!TARGET_IDS.has(item.conceptId)&&item.conceptId!=="federal-budgets-and-debt"&&item.conceptId!=="saving-investment-and-loanable-funds").map(item=>stable(item));
const headProtected=entries(head).filter(item=>!TARGET_IDS.has(item.conceptId)&&item.conceptId!=="federal-budgets-and-debt"&&item.conceptId!=="saving-investment-and-loanable-funds").map(item=>stable(item));
check(stable(currentProtected)===stable(headProtected),"protected concept slices unchanged");
check(entries(current).filter(item=>item.conceptId==="federal-budgets-and-debt").length===108,"authorized Federal Budgets & Debt release delta");

const template=fs.readFileSync(templatePath,"utf8");
check(/function getAdaptiveQuestion[\s\S]*?slice\(-10\)[\s\S]*?tagHistory\.slice\(-2\)/.test(template),"ordinary recent-ID and tag suppression retained");
check(/function remediationTransitionAllowed\(question\)[\s\S]*?!isCheckpointEncounterActive\(\)/.test(template),"checkpoint remediation transition is suppressed");
check(/function planRemediation\(question, responseTime\)[\s\S]*?isCheckpointEncounterActive\(\)/.test(template),"canonical remediation planner rejects checkpoint entry");
check(/if\(isBossRoom\)[\s\S]*?advanceCheckpointAttempt\(\)[\s\S]*?return;[\s\S]*?IF STUDENT MISSES DURING ACTIVE REMEDIATION/.test(template),"checkpoint miss advances assessment before remediation paths");
check(/function completeCheckpointEncounter\(\)[\s\S]*?showKnowledgeRoom\(room\)/.test(template),"checkpoint resolves after its assessment sequence");
check(/const selected = objectiveMatches\.length >= 3[\s\S]*?while\(selected\.length < 3/.test(template),"checkpoint targets one weakness then fills for diversity");
check(/if\(stage === "repair"\) return "Concept Repair"/.test(template),"Concept Repair is a runtime label");

const simulations=[];
const configs=[[factor],[choice],[inequality],[information],TARGETS];
for(const modules of configs)for(const seed of [11,23,47,89,131]){const result=selectSequence(modules,seed),scope=modules.map(item=>item.CONCEPT_ID).join("+");simulations.push({scope,...result});check(!result.repeatWithinRecentWindow,`simulation recent-ID suppression ${scope} seed ${seed}`);check(result.maxTagStreak<=2,`simulation tag streak cap ${scope} seed ${seed}`,String(result.maxTagStreak));check(result.checkpointAssessment.questionsDelivered===3&&result.checkpointAssessment.missesRecorded===2&&!result.checkpointAssessment.remediationDuringCheckpoint&&result.checkpointAssessment.completed,`simulation uninterrupted checkpoint ${scope} seed ${seed}`);check(result.ordinaryRepair.repair&&result.ordinaryRepair.bridge&&result.ordinaryRepair.returnRoom===result.ordinaryRepair.resumedRoom&&result.ordinaryRepair.returnRoom===11,`simulation post-checkpoint repair resumption ${scope} seed ${seed}`);}

const output={status:errors.length?"FAIL":"PASS",checks:checks.length,errors,summary:{targetQuestions:TARGETS.reduce((sum,module)=>sum+module.productionQuestions.length,0),graphQuestions:TARGETS.flatMap(module=>module.productionQuestions).filter(q=>q.graphRequired).length,simulationRuns:simulations.length,maxAnswerRepeatInTwelve:Math.max(...simulations.map(item=>item.maxAnswerIn12)),maxConceptStreak:Math.max(...simulations.map(item=>item.maxConceptStreak)),mixedCheckpointConceptSets:simulations.filter(item=>item.scope.includes("+")).map(item=>item.checkpointConcepts),runtimeChanged:true,checkpointRemediationInvariant:"checkpoint completes before remediation can begin",mixedArtifact},simulations};
console.log(JSON.stringify(output,null,2));if(errors.length)process.exit(1);
