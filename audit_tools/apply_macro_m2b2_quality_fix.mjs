import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repo=path.resolve(process.argv[2]||process.cwd());
const PHASE='phaseM2b2-inflation-real-values-family-maturation-v1';
const composer=path.join(repo,'build','faculty-build-composer'),dataDir=path.join(composer,'data');
const libraryPath=path.join(dataDir,'composer_library.js'),registryPath=path.join(dataDir,'composer_registry.json'),manifestPath=path.join(dataDir,'composer_library_manifest.json'),sourcePath=path.join(composer,`${PHASE}_questions.json`),provenancePath=path.join(composer,`${PHASE}.json`);
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const answerHash=answer=>sha(String(answer).trim().replace(/\s+/g,' ').toLowerCase());
const questionHash=q=>sha(JSON.stringify(stable({q:q.q,options:q.options,aHash:q.aHash,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[],bossStage:q.bossStage||null})));
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(libraryPath,'utf8'),sandbox);const library=sandbox.window.MQ_COMPOSER_LIBRARY;
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8')),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8')),sourceData=JSON.parse(fs.readFileSync(sourcePath,'utf8')),provenance=JSON.parse(fs.readFileSync(provenancePath,'utf8'));
if(!String(library.libraryVersion).endsWith(PHASE))throw new Error('M2b-2 library required.');
const fixes=[
  ['cpi-versus-gdp-deflator','PM2B2-DEF-LB-001','CPI covers the tablet; the GDP deflator covers the robot',['The GDP deflator covers both the imported tablet and the domestic business robot','CPI covers both prices','Neither index covers a business purchase'],0],
  ['indexing-and-real-values','PM2B2-INDEX-E-002','To help preserve the payment’s purchasing power',['To convert the pension into a new category of private business investment','To guarantee a real gain every year','To replace CPI with nominal GDP'],1],
  ['indexing-and-real-values','PM2B2-INDEX-E-003','To keep inflation alone from lowering the threshold’s real value',['To make every taxpayer’s nominal income fall even when purchasing power is unchanged','To measure domestic capital-goods prices','To set the real interest rate on loans'],2],
  ['real-versus-nominal-interest-rates','PM2B2-RNI-FB-004','Expected real rate about 5%; realized real rate about 2%',['Expected about 2%; realized about 5% after reversing the two inflation measures','Expected about 13%; realized about 16%','Both real rates equal 9%'],3]
];
const rotate=(values,index)=>values.slice(index%values.length).concat(values.slice(0,index%values.length));
for(const [conceptId,questionId,answer,wrong,index] of fixes){const module=library.concepts[conceptId],rows=[...Object.values(module.questions).flat(),...module.repairQuestions,...module.bridgeQuestions],question=rows.find(item=>(item.canonicalId||item.id)===questionId);if(!question)throw new Error(`Missing ${questionId}`);const beforeHash=questionHash(question);question.options=rotate([answer,...wrong],index);question.aHash=answerHash(answer);question.sourceHash=questionHash(question);sourceData.changes.push({questionId,canonicalConceptId:conceptId,action:'QUALITY_FIX',oldPool:question.difficulty,newPool:question.difficulty,reason:'Balances answer length without changing the stem or correct answer.',beforeHash,afterHash:question.sourceHash});}
sourceData.summary.qualityFixed=fixes.length;
delete library.librarySha256;library.librarySha256=sha(JSON.stringify(stable(library)));registry.librarySha256=library.librarySha256;manifest.librarySha256=library.librarySha256;provenance.after.librarySha256=library.librarySha256;provenance.qualityFixes=fixes.length;
fs.writeFileSync(libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(sourcePath,JSON.stringify(sourceData,null,2)+'\n');fs.writeFileSync(provenancePath,JSON.stringify(provenance,null,2)+'\n');
console.log(JSON.stringify({phase:PHASE,qualityFixes:fixes.length,librarySha256:library.librarySha256},null,2));
