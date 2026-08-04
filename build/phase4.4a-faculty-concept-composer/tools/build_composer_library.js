#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
function stable(value){if(Array.isArray(value))return value.map(stable);if(value&&typeof value==='object'){const out={};for(const key of Object.keys(value).sort())out[key]=stable(value[key]);return out;}return value;}
function stableStringify(value){return JSON.stringify(stable(value));}
const source=path.resolve(process.argv[2]||path.join(__dirname,'..','..','phase4.3-economic-concept-library'));
const out=path.resolve(process.argv[3]||path.join(__dirname,'..','data'));
fs.mkdirSync(path.join(out,'question-assets'),{recursive:true});
const registry=JSON.parse(fs.readFileSync(path.join(source,'concept_registry.json'),'utf8'));
const concepts={},assets=[];let questionCount=0;
for(const meta of registry.concepts){
  const id=meta.canonicalConceptId,file=path.join(source,'concepts',id,'concept_bank.js'),context={window:{}};
  context.globalThis=context.window;vm.createContext(context);vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  const module=JSON.parse(JSON.stringify(context.window.MQ_ECON_CONCEPTS[id]));module.assetMetadata=[];
  for(const rel of module.assets||[]){
    const src=path.join(source,'concepts',id,rel),name=path.basename(src),dest=path.join(out,'question-assets',id,name);
    fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);
    const a={conceptId:id,filename:name,sourceAssetPath:rel,sourceUrl:`data/question-assets/${id}/${name}`,runtimePath:`question-assets/${id}/${name}`,sha256:crypto.createHash('sha256').update(fs.readFileSync(src)).digest('hex'),sizeBytes:fs.statSync(src).size};
    module.assetMetadata.push(a);assets.push(a);
  }
  module.assetPaths=module.assetMetadata.map(a=>a.runtimePath);module.assets=module.assetPaths;
  concepts[id]=module;
  questionCount+=Object.values(module.questions).flat().length+(module.repairQuestions||[]).length+(module.repairSeedQuestions||[]).length+(module.bridgeQuestions||[]).length;
}
const payload={schemaVersion:'1.1.0',composerVersion:'4.4.0',libraryVersion:'phase4.3a-browser-validated',sourceCurationPhase:'4.3a',sourceGeneratedAt:registry.generatedAt,conceptCount:Object.keys(concepts).length,canonicalQuestionCount:questionCount,registry,concepts,assetInventory:assets.sort((a,b)=>a.runtimePath.localeCompare(b.runtimePath))};
payload.librarySha256=crypto.createHash('sha256').update(stableStringify(payload)).digest('hex');
fs.writeFileSync(path.join(out,'composer_registry.json'),JSON.stringify(registry,null,2)+'\n');
fs.writeFileSync(path.join(out,'composer_library.js'),'window.MQ_COMPOSER_LIBRARY = '+JSON.stringify(payload).replace(/<\/script/gi,'<\\/script')+';\n');
fs.writeFileSync(path.join(out,'composer_library_manifest.json'),JSON.stringify({schemaVersion:'1.1.0',libraryVersion:payload.libraryVersion,librarySha256:payload.librarySha256,conceptCount:payload.conceptCount,canonicalQuestionCount:payload.canonicalQuestionCount,assetCount:assets.length,assets:payload.assetInventory,sourceRegistrySha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(source,'concept_registry.json'))).digest('hex')},null,2)+'\n');
console.log(JSON.stringify({concepts:payload.conceptCount,questions:payload.canonicalQuestionCount,assets:assets.length,librarySha256:payload.librarySha256},null,2));
