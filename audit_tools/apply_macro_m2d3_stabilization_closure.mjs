import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repo=path.resolve(process.argv[2]||process.cwd());
const dryRun=process.argv.includes('--dry-run');
const PHASE='phaseM2d3-stabilization-block-closure-v1';
const STAMP=new Date().toISOString();
const f8=['aggregate-demand','aggregate-supply','macroeconomic-equilibrium-and-shocks','long-run-macroeconomic-adjustment'];
const f9=['fiscal-policy-and-aggregate-demand','fiscal-multipliers-and-crowding-out','stabilization-policy'];
const f10=['short-run-phillips-curve','phillips-curve-expectations','long-run-phillips-curve','sacrifice-ratio','disinflation-and-policy'];
const block=[...f8,...f9,...f10];
const composer=path.join(repo,'build','faculty-build-composer');
const dataDir=path.join(composer,'data');
const libraryPath=path.join(dataDir,'composer_library.js');
const registryPath=path.join(dataDir,'composer_registry.json');
const manifestPath=path.join(dataDir,'composer_library_manifest.json');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const raw=fs.readFileSync(libraryPath,'utf8'),sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(raw,sandbox,{filename:libraryPath});const library=sandbox.window.MQ_COMPOSER_LIBRARY;
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(!String(library.libraryVersion).endsWith('phaseM2d2-fiscal-stabilization-family-maturation-v1')) throw new Error('Unexpected baseline: completed M2d-2 library required.');
for(const cid of block)if(!library.concepts[cid])throw new Error(`Missing stabilization-block concept ${cid}`);
function tagged(m){return [...Object.entries(m.questions||{}).flatMap(([pool,list])=>(list||[]).map(question=>({pool,question}))),...(m.repairQuestions||[]).map(question=>({pool:'repair',question})),...(m.repairSeedQuestions||[]).map(question=>({pool:'repairSeed',question})),...(m.bridgeQuestions||[]).map(question=>({pool:'bridge',question}))];}
function unique(m){const seen=new Set();return tagged(m).filter(({question})=>{const id=qid(question);if(seen.has(id))return false;seen.add(id);return true;});}
function bankSnapshot(m){return unique(m).map(({pool,question})=>({pool,id:qid(question),question:stable(question)})).sort((a,b)=>a.id.localeCompare(b.id));}
function bankHash(m){return sha(JSON.stringify(stable(bankSnapshot(m))));}
function bossTier(q){const d=String(q?.difficulty||'').toLowerCase();if(d==='easyboss')return'easyBoss';if(d==='mediumboss')return'mediumBoss';if(d==='finalboss'||d==='hardboss')return'finalBoss';return'';}
function counts(m){const boss=m.questions?.boss||[];return{total:unique(m).length,easy:(m.questions?.easy||[]).length,medium:(m.questions?.medium||[]).length,hard:(m.questions?.hard||[]).length,elite:(m.questions?.elite||[]).length,legendary:(m.questions?.legendary||[]).length,calculation:(m.questions?.calculation||[]).length,integration:(m.questions?.integration||[]).length,easyBoss:boss.filter(q=>bossTier(q)==='easyBoss').length,mediumBoss:boss.filter(q=>bossTier(q)==='mediumBoss').length,finalBoss:boss.filter(q=>bossTier(q)==='finalBoss').length,legendaryBoss:(m.questions?.legendaryBoss||[]).length,repair:(m.repairQuestions||[]).length,repairSeed:(m.repairSeedQuestions||[]).length,bridge:(m.bridgeQuestions||[]).length,graphLinked:unique(m).filter(r=>Boolean(r.question.image)).length};}
const beforeVersion=library.libraryVersion,beforeTotal=library.canonicalQuestionCount;
const beforeCounts=Object.fromEntries(block.map(cid=>[cid,counts(library.concepts[cid])]));
const bankHashesBefore=Object.fromEntries(Object.keys(library.concepts).map(cid=>[cid,bankHash(library.concepts[cid])]));
const manifestBeforeHash=sha(fs.readFileSync(manifestPath));
const changes=[];
const assetText={
  'srpc.webp':{
    imageAlt:'Phillips-curve graph with two downward-sloping short-run Phillips curves, labeled unemployment rates U1 through U4, inflation rates I1 through I4, and points a through f.',
    graphDescription:'The horizontal axis is unemployment rate and the vertical axis is inflation rate. SRPC1 is the lower downward-sloping curve and SRPC2 is the higher/rightward downward-sloping curve. On SRPC1, point a is at U1/I4, b at U2/I3, c at U3/I2, and d at U4/I1. On SRPC2, point f is at U3/I4 and point e is at U4/I3. Dashed guides connect the labeled points to unemployment rates U1-U4 and inflation rates I1-I4.'
  },
  'lrpc.webp':{
    imageAlt:'Phillips-curve graph with two downward-sloping short-run Phillips curves and a vertical long-run Phillips curve at unemployment rate U2, with labeled points a through d.',
    graphDescription:'The horizontal axis is unemployment rate and the vertical axis is inflation rate. A vertical LRPC stands at U2. SRPC1 is the lower/left downward-sloping curve and SRPC2 is the higher/right downward-sloping curve. Point a is at U1/I2 on SRPC1, point b is at U2/I2 where SRPC2 meets the LRPC, point c is at U2/I1 where SRPC1 meets the LRPC, and point d is at U3/I1 on SRPC2. Dashed guides mark unemployment rates U1-U3 and inflation rates I1-I2.'
  }
};
for(const cid of f10){
  const module=library.concepts[cid];
  for(const rec of module.assetMetadata||[]){
    const text=assetText[rec.filename]; if(!text)continue;
    const before={imageAlt:rec.imageAlt||null,graphDescription:rec.graphDescription||null};
    if(rec.imageAlt!==text.imageAlt||rec.graphDescription!==text.graphDescription){
      rec.imageAlt=text.imageAlt;rec.graphDescription=text.graphDescription;
      changes.push({assetId:`${cid}/${rec.filename}`,conceptId:cid,action:'ASSET_ACCESSIBILITY_METADATA',reason:'Adds concise non-revealing imageAlt and detailed graphDescription for the existing Phillips-curve runtime asset copy.',before,after:text});
    }
  }
}
for(const a of manifest.assets||[]){if(!f10.includes(a.conceptId))continue;const text=assetText[a.filename];if(!text)continue;a.imageAlt=text.imageAlt;a.graphDescription=text.graphDescription;}
const bankHashesAfter=Object.fromEntries(Object.keys(library.concepts).map(cid=>[cid,bankHash(library.concepts[cid])]));
const bankMismatches=Object.keys(bankHashesBefore).filter(cid=>bankHashesBefore[cid]!==bankHashesAfter[cid]);
if(bankMismatches.length)throw new Error(`Question content changed unexpectedly: ${bankMismatches.join(', ')}`);
const afterCounts=Object.fromEntries(block.map(cid=>[cid,counts(library.concepts[cid])]));
const groupTotal=ids=>ids.reduce((n,cid)=>n+afterCounts[cid].total,0);
if(groupTotal(f8)!==206||groupTotal(f9)!==212||groupTotal(f10)!==238)throw new Error(`Unexpected block counts F8/F9/F10 ${groupTotal(f8)}/${groupTotal(f9)}/${groupTotal(f10)}`);
library.libraryVersion=`${beforeVersion}-${PHASE}`;library.sourceCurationPhase=PHASE;library.generatedAt=STAMP;
library.canonicalQuestionCount=Object.values(library.concepts).reduce((n,m)=>n+unique(m).length,0);
if(library.canonicalQuestionCount!==beforeTotal)throw new Error(`Canonical total changed ${beforeTotal}->${library.canonicalQuestionCount}`);
Object.assign(library.registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
Object.assign(registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
delete library.librarySha256;library.librarySha256=sha(JSON.stringify(stable(library)));registry.librarySha256=library.librarySha256;
Object.assign(manifest,{canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:STAMP});
const sourceData={phase:PHASE,generatedAt:STAMP,summary:{canonicalAdded:0,canonicalRemoved:0,questionContentChanged:0,assetMetadataUpdated:changes.length,newGraphAssets:0,blockCounts:{F8:206,F9:212,F10:238,total:656}},changes};
const provenance={phase:PHASE,generatedAt:STAMP,scope:{family:'M2d stabilization-block closure',questionContentProtected:true,canonicalConceptIds:block},before:{libraryVersion:beforeVersion,canonicalQuestionCount:beforeTotal,counts:beforeCounts,bankHashes:bankHashesBefore,manifestSha256:manifestBeforeHash},after:{libraryVersion:library.libraryVersion,canonicalQuestionCount:library.canonicalQuestionCount,librarySha256:library.librarySha256,counts:afterCounts,bankHashes:bankHashesAfter},protectedSummary:{canonicalBanksChecked:Object.keys(library.concepts).length,questionBankMismatches:bankMismatches},assetAccessibility:{metadataUpdatedCopies:changes.length,targetConcepts:f10,allF10GraphCopiesNowDescribeExistingVisuals:true,newGraphAssets:0}};
if(!dryRun){
 fs.writeFileSync(libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);
 fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(composer,`${PHASE}_questions.json`),JSON.stringify(sourceData,null,2)+'\n');
 fs.writeFileSync(path.join(composer,`${PHASE}.json`),JSON.stringify(provenance,null,2)+'\n');
 for(const file of [path.join(repo,'build','index.html'),path.join(composer,'index.html')])if(fs.existsSync(file)){let text=fs.readFileSync(file,'utf8');text=text.replaceAll('20260810-macro-m2d2-fiscal-stabilization-v1','20260810-macro-m2d3-stabilization-closure-v1');fs.writeFileSync(file,text);}
}
console.log(JSON.stringify({phase:PHASE,dryRun,beforeTotal,afterTotal:library.canonicalQuestionCount,blockCounts:{F8:groupTotal(f8),F9:groupTotal(f9),F10:groupTotal(f10),total:groupTotal(block)},questionBankMismatches:bankMismatches,assetMetadataUpdated:changes.length,librarySha256:library.librarySha256},null,2));
