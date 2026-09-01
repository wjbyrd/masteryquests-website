#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const scriptDir=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(process.argv.find((arg,index)=>index>1&&!arg.startsWith('--'))||path.join(scriptDir,'..','..'));
const dryRun=process.argv.includes('--dry-run');
const PHASE='phaseMacro4-human-read-curation-v1';
const GENERATED_AT='2026-09-01T19:00:00.000Z';
const phaseDir=path.join(repo,'audit_tools','macro_phase4');
const changesPath=path.join(phaseDir,'macro_phase4_authorized_changes.json');
const structuralPath=path.join(phaseDir,'macro_phase4_structural_resolution.json');
const ledgerPath=path.join(phaseDir,'macro_phase4_execution_ledger.json');
const dataDir=path.join(repo,'build','faculty-build-composer','data');
const libraryPath=path.join(dataDir,'composer_library.js');
const registryPath=path.join(dataDir,'composer_registry.json');
const manifestPath=path.join(dataDir,'composer_library_manifest.json');
const reviewDir=path.join(dataDir,'concept-reviews');
const reviewSourcePath=path.join(reviewDir,'concept_review_source.json');
const reviewManifestPath=path.join(reviewDir,'manifest.json');
const reviewAuditPath=path.join(reviewDir,'concept_review_integration_audit.json');
const priorHumanReadLedgerPath=path.join(repo,'validation_artifacts','question_quality','question_rewrite_master_execution_ledger.json');
const progressPath=path.join(repo,'audit_tools','macro_phase3','macro_phase3_progress.json');
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const sha=value=>crypto.createHash('sha256').update(Buffer.isBuffer(value)?value:String(value)).digest('hex');
const answerHash=value=>sha(String(value??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase());
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const questionHash=q=>sha(JSON.stringify(stable({q:q.q,options:q.options,aHash:q.aHash,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[],bossStage:q.bossStage||null,image:q.image||null})));
const readLibrary=()=>{const raw=fs.readFileSync(libraryPath,'utf8').trim(),prefix='window.MQ_COMPOSER_LIBRARY=';if(!raw.startsWith(prefix)||!raw.endsWith(';'))throw new Error('Unexpected Composer library wrapper.');return JSON.parse(raw.slice(prefix.length,-1));};
const occurrences=module=>[...Object.entries(module.questions||{}).flatMap(([pool,list])=>(list||[]).map((question,index)=>({container:'questions',pool,index,question}))),...(module.repairQuestions||[]).map((question,index)=>({container:'repairQuestions',pool:'repair',index,question})),...(module.repairSeedQuestions||[]).map((question,index)=>({container:'repairSeedQuestions',pool:'repairSeed',index,question})),...(module.bridgeQuestions||[]).map((question,index)=>({container:'bridgeQuestions',pool:'bridge',index,question}))];
const stateMatches=(question,change,state)=>change.changedFields.every(field=>JSON.stringify(question[field]??null)===JSON.stringify(change[state][field]??null));
const fingerprint=question=>sha(JSON.stringify(stable({q:question.q??null,options:question.options??null,aHash:question.aHash??null,feedback:question.feedback??null,canonicalDifficulty:question.canonicalDifficulty??null,image:question.image??null})));
const correctIndex=question=>{const matches=(question.options||[]).map((option,index)=>answerHash(option)===question.aHash?index:-1).filter(index=>index>=0);return matches.length===1?matches[0]:null;};

const authorized=JSON.parse(fs.readFileSync(changesPath,'utf8'));
const structural=JSON.parse(fs.readFileSync(structuralPath,'utf8'));
const progress=JSON.parse(fs.readFileSync(progressPath,'utf8'));
if(authorized.changes.length!==292||new Set(authorized.changes.map(change=>change.questionId)).size!==292)throw new Error('Authorized source must contain exactly 292 unique changes.');
if(structural.scope?.macroQuestionCount!==2870||structural.scope?.authorizedQuestionCount!==292)throw new Error('Structural baseline is not the approved Phase 4 baseline.');
const library=readLibrary();
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const conceptIds=progress.concepts.map(row=>row.childConceptId);
const byId=new Map();
for(const conceptId of conceptIds){const module=library.concepts[conceptId];if(!module)throw new Error(`Missing Macro concept ${conceptId}`);for(const occurrence of occurrences(module)){const id=qid(occurrence.question);if(!byId.has(id))byId.set(id,[]);byId.get(id).push({conceptId,...occurrence});}}
if(byId.size!==2870)throw new Error(`Macro question universe drift: ${byId.size}/2870.`);
const execution=[];
for(const change of authorized.changes){
  const items=byId.get(change.questionId);if(!items?.length)throw new Error(`BLOCKED missing authorized question ${change.questionId}`);
  const states=items.map(item=>stateMatches(item.question,change,'expectedAfter')?'AFTER':stateMatches(item.question,change,'expectedBefore')?'BEFORE':'MISMATCH');
  if(states.includes('MISMATCH')||new Set(states).size!==1)throw new Error(`BLOCKED baseline mismatch or partial application for ${change.questionId}: ${states.join(',')}`);
  const beforeFingerprint=fingerprint({...items[0].question,...change.expectedBefore});
  for(const item of items){
    if(states[0]==='BEFORE')for(const field of change.changedFields)item.question[field]=JSON.parse(JSON.stringify(change.expectedAfter[field]));
    item.question.sourceHash=questionHash(item.question);
    if(Array.isArray(item.question.sourceOccurrences))for(const source of item.question.sourceOccurrences)source.sourceHash=item.question.sourceHash;
    const index=correctIndex(item.question);if(index!==change.correctIndexAfter)throw new Error(`Answer-key position drift for ${change.questionId}: ${index} != ${change.correctIndexAfter}`);
  }
  if(change.changeScope==='Difficulty metadata')for(const item of items){
    if(item.container!=='questions')throw new Error(`Difficulty relocation requires a question pool: ${change.questionId}`);
    if(item.pool!=='medium'){
      const module=library.concepts[item.conceptId],source=module.questions[item.pool],sourceIndex=source.indexOf(item.question);
      if(sourceIndex<0)throw new Error(`Difficulty source location missing: ${change.questionId}`);
      source.splice(sourceIndex,1);module.questions.medium??=[];module.questions.medium.push(item.question);item.pool='medium';item.index=module.questions.medium.length-1;
    }
  }
  const afterQuestion=items[0].question;
  execution.push({questionId:change.questionId,questionSet:change.questionSet,concept:change.concept,conceptId:change.conceptId,sourceFile:change.sourceFile,sourceGame:change.sourceGame,sourceCurationPhase:change.sourceCurationPhase,changeScope:change.changeScope,changedFields:change.changeScope==='Difficulty metadata'?[...change.changedFields,'pool']:change.changedFields,result:'APPLIED',outcome:'APPLIED',notes:'Workbook-approved after-state and preservation constraints verified.',occurrenceCount:items.length,occurrences:items.map(item=>({conceptId:item.conceptId,container:item.container,pool:item.pool,index:item.index})),correctIndexBefore:change.correctIndexBefore,correctIndexAfter:correctIndex(afterQuestion),beforeFingerprint,afterFingerprint:fingerprint(afterQuestion),expectedAfter:change.expectedAfter});
}
const expectedIds=new Set(authorized.changes.map(change=>change.questionId));
if(execution.length!==292||execution.some(row=>!expectedIds.has(row.questionId)))throw new Error('Execution ledger did not resolve exactly the approved 292 IDs.');
const growthConceptIds=['productivity-measurement','sources-of-productivity','economic-growth-policy'];
library.assetInventory??=[];
for(const conceptId of growthConceptIds){
  const metadata=(library.concepts[conceptId]?.assetMetadata||[]).find(asset=>asset.filename==='GROWTH-01.webp');
  if(!metadata)throw new Error(`Missing verified GROWTH-01 metadata for ${conceptId}`);
  const source=path.join(path.dirname(dataDir),String(metadata.sourceUrl).replaceAll('/',path.sep));
  if(!fs.existsSync(source)||sha(fs.readFileSync(source))!==metadata.sha256)throw new Error(`Verified GROWTH-01 file mismatch for ${conceptId}`);
  if(!library.assetInventory.some(asset=>asset.runtimePath===metadata.runtimePath))library.assetInventory.push(JSON.parse(JSON.stringify(metadata)));
}
const previousVersion=library.libraryVersion;
if(!String(library.libraryVersion).endsWith(PHASE))library.libraryVersion=`${library.libraryVersion}-${PHASE}`;
library.sourceCurationPhase=PHASE;library.generatedAt=GENERATED_AT;
Object.assign(library.registry||={}, {libraryVersion:library.libraryVersion,generatedAt:GENERATED_AT,canonicalQuestionCount:library.canonicalQuestionCount});
Object.assign(registry,{libraryVersion:library.libraryVersion,generatedAt:GENERATED_AT,canonicalQuestionCount:library.canonicalQuestionCount});
delete library.librarySha256;delete library.registry.librarySha256;
library.librarySha256=sha(JSON.stringify(stable(library)));
library.registry.librarySha256=library.librarySha256;registry.librarySha256=library.librarySha256;
Object.assign(manifest,{assetCount:library.assetInventory.length,assets:library.assetInventory,conceptCount:library.conceptCount,canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:GENERATED_AT});
const reviewSource=JSON.parse(fs.readFileSync(reviewSourcePath,'utf8')),reviewManifest=JSON.parse(fs.readFileSync(reviewManifestPath,'utf8')),reviewAudit=JSON.parse(fs.readFileSync(reviewAuditPath,'utf8'));
for(const artifact of [reviewSource,reviewManifest,reviewAudit]){artifact.generatedAt=GENERATED_AT;artifact.composerLibraryVersion=library.libraryVersion;}
const priorHumanReadLedger=JSON.parse(fs.readFileSync(priorHumanReadLedgerPath,'utf8'));Object.assign(priorHumanReadLedger,{generatedAt:GENERATED_AT,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256});
const ledger={schemaVersion:'1.0.0',phase:PHASE,generatedAt:GENERATED_AT,authorization:{workbook:'audit_tools/macro_question_rewrite_master.xlsx',sheet:'Proposed Changes',range:'A2:J293',approvedRows:292,approval:'All Proposed rows approved by repository owner'},summary:{authorizedRows:292,uniqueQuestionIds:292,resolvedRows:execution.length,appliedRows:execution.length,alreadyMatchedRows:0,blockedRows:0,failedRows:0,changedFieldCounts:Object.fromEntries(['q','options','aHash','feedback','canonicalDifficulty','image','pool'].map(field=>[field,execution.filter(row=>row.changedFields.includes(field)).length])),sourceBatchCounts:Object.fromEntries([...new Set(execution.map(row=>row.sourceFile||'(none)'))].sort().map(source=>[source,execution.filter(row=>(row.sourceFile||'(none)')===source).length]))},before:{libraryVersion:structural.baseline.libraryVersion,librarySha256:structural.baseline.librarySha256},after:{libraryVersion:library.libraryVersion,librarySha256:library.librarySha256},records:execution};
const outputs={library:`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`,registry:JSON.stringify(registry,null,2)+'\n',manifest:JSON.stringify(manifest,null,2)+'\n',reviewSource:JSON.stringify(reviewSource,null,2)+'\n',reviewManifest:JSON.stringify(reviewManifest,null,2)+'\n',reviewAudit:JSON.stringify(reviewAudit,null,2)+'\n',priorHumanReadLedger:JSON.stringify(priorHumanReadLedger,null,2)+'\n',ledger:JSON.stringify(ledger,null,2)+'\n'};
const paths={library:libraryPath,registry:registryPath,manifest:manifestPath,reviewSource:reviewSourcePath,reviewManifest:reviewManifestPath,reviewAudit:reviewAuditPath,priorHumanReadLedger:priorHumanReadLedgerPath,ledger:ledgerPath};
const semanticChangedFiles=Object.entries(outputs).filter(([key,value])=>!fs.existsSync(paths[key])||fs.readFileSync(paths[key],'utf8')!==value).map(([key])=>paths[key]);
if(!dryRun){fs.mkdirSync(phaseDir,{recursive:true});for(const [key,value] of Object.entries(outputs))fs.writeFileSync(paths[key],value);}
console.log(JSON.stringify({phase:PHASE,dryRun,previousVersion,libraryVersion:library.libraryVersion,authorizedRows:292,resolvedRows:execution.length,blockedRows:0,failedRows:0,semanticChangedFiles,librarySha256:library.librarySha256},null,2));
