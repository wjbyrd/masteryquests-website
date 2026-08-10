import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
const repo=path.resolve(process.argv[2]||'/mnt/data/phase_M4_work');
const composer=path.join(repo,'faculty-build-composer');
const dataDir=path.join(composer,'data');
const libPath=path.join(dataDir,'composer_library.js');
const regPath=path.join(dataDir,'composer_registry.json');
const manPath=path.join(dataDir,'composer_library_manifest.json');
const PHASE='phaseM4-final-macro-release-closure-v1';
const STAMP=new Date().toISOString();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync(libPath,'utf8'),sb);const library=sb.window.MQ_COMPOSER_LIBRARY;
const registry=JSON.parse(fs.readFileSync(regPath,'utf8'));const manifest=JSON.parse(fs.readFileSync(manPath,'utf8'));
const before={libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,canonicalQuestionCount:library.canonicalQuestionCount};
const target=library.concepts['gdp-measurement'];
const stageMap={
 'ECON-NL-LEGENDARYBOSS-9101':'opening',
 'ECON-NL-LEGENDARYBOSS-9102':'middle',
 'ECON-NL-LEGENDARYBOSS-9107':'final'
};
const changes=[];
for(const q of target.questions.legendaryBoss||[]){
 if(stageMap[q.canonicalId]){const beforeStage=q.bossStage??null;q.bossStage=stageMap[q.canonicalId];changes.push({questionId:q.canonicalId,conceptId:'gdp-measurement',field:'bossStage',before:beforeStage,after:q.bossStage,questionTextChanged:false,optionsChanged:false,answerChanged:false});}
}
if(changes.length!==3)throw new Error(`Expected 3 GDP Legendary bossStage fixes; found ${changes.length}`);
if((target.questions.legendaryBoss||[]).some(q=>!['opening','middle','final'].includes(q.bossStage)))throw new Error('GDP Legendary bossStage repair incomplete');
const previousVersion=library.libraryVersion;
library.libraryVersion=`${previousVersion}-${PHASE}`;
library.sourceCurationPhase=PHASE;
library.generatedAt=STAMP;
Object.assign(library.registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
Object.assign(registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
delete library.librarySha256;
library.librarySha256=sha(JSON.stringify(stable(library)));
registry.librarySha256=library.librarySha256;
Object.assign(manifest,{libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,canonicalQuestionCount:library.canonicalQuestionCount,generatedAt:STAMP});
fs.writeFileSync(libPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);
fs.writeFileSync(regPath,JSON.stringify(registry,null,2)+'\n');
fs.writeFileSync(manPath,JSON.stringify(manifest,null,2)+'\n');
const idxPath=path.join(composer,'index.html');let idx=fs.readFileSync(idxPath,'utf8');idx=idx.replaceAll('20260810-macro-m2e-checkpoint-supplement-v1','20260810-macro-m4-final-release-closure-v1');fs.writeFileSync(idxPath,idx);
const changeFile={phase:PHASE,generatedAt:STAMP,summary:{canonicalAdded:0,canonicalRemoved:0,questionTextRewrites:0,optionRewrites:0,answerChanges:0,metadataRepairs:3,repairType:'Legendary bossStage metadata'},changes};
const provenance={phase:PHASE,generatedAt:STAMP,scope:{finalMacroReleaseClosure:true,conceptId:'gdp-measurement',questionIds:Object.keys(stageMap)},before,after:{libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,canonicalQuestionCount:library.canonicalQuestionCount},changeControl:{questionAdditions:0,questionRemovals:0,questionTextChanges:0,optionChanges:0,answerChanges:0,metadataOnlyBossStageFixes:3},reason:'Final M4 safety validation found three protected GDP Measurement Legendary Boss records with missing bossStage metadata. Assigned opening/middle/final stages to restore a valid three-stage Legendary checkpoint scaffold.'};
fs.writeFileSync(path.join(composer,`${PHASE}_questions.json`),JSON.stringify(changeFile,null,2)+'\n');
fs.writeFileSync(path.join(composer,`${PHASE}.json`),JSON.stringify(provenance,null,2)+'\n');
console.log(JSON.stringify({phase:PHASE,changes,before,after:provenance.after,indexSha256:sha(fs.readFileSync(idxPath))},null,2));
