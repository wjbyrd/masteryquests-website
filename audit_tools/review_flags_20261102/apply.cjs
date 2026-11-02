'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js'));
// Immutable baseline captured by prepare.py.
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),stable=core.stableStringify;
const load=p=>JSON.parse(fs.readFileSync(p,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
const before=load(path.join(__dirname,'baseline/composer_library.js')),lib=structuredClone(before),draft=read(path.join(__dirname,'content-edits.json'));
const previousLedgerPath=path.join(__dirname,'expectations.json');
const previousLedger=fs.existsSync(previousLedgerPath)?read(previousLedgerPath):null;
assert.equal(before.librarySha256,draft.beforeLibrarySha256);
const old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question]));
const changes=new Map(draft.changes.map(c=>[c.id,c]));
for(const c of changes.values()){
 assert.deepEqual(c.beforeRecord,old.get(c.id));
 assert(c.fields.every(f=>['q','options','feedback','hint','aHash','canonicalDifficulty','checkpointPool','image','imageAlt','graphDescription'].includes(f)),c.id);
 const restored=structuredClone(c.afterRecord);for(const f of c.fields){if(Object.hasOwn(c.beforeRecord,f))restored[f]=structuredClone(c.beforeRecord[f]);else delete restored[f];}assert.deepEqual(restored,c.beforeRecord);
 assert.equal(c.afterRecord.options.filter(o=>sha(core.normalizeAnswerText(o))===c.afterRecord.aHash).length,1,c.id);
 assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash,c.id);
}
for(const r of con.questionRecords(lib)){const c=changes.get(String(r.question.id));if(c)Object.assign(r.question,structuredClone(c.afterRecord));}
const moves=[];
for(const [cid,m]of Object.entries(lib.concepts)){
 const pending=[];for(const p of ['easy','medium','hard','elite','legendary'])if(m.questions?.[p])m.questions[p]=m.questions[p].filter(q=>{
  if(!changes.has(String(q.id))||q.canonicalDifficulty===p)return true;
  pending.push(q);moves.push({conceptId:cid,id:String(q.id),from:p,to:q.canonicalDifficulty});return false;
 });for(const q of pending)(m.questions[q.canonicalDifficulty]||=[]).push(q);
}
const placements=l=>Object.fromEntries(Object.entries(l.concepts).filter(([cid])=>moves.some(m=>m.conceptId===cid)).map(([cid,m])=>[cid,Object.fromEntries(Object.entries(m.questions).map(([p,qs])=>[p,qs.map(q=>String(q.id))]))]));
const tierIds=new Set(draft.dispositions.filter(d=>d.targetDifficulty).map(d=>d.id));
const changedConcepts=new Set(con.questionRecords(lib).filter(r=>tierIds.has(String(r.question.id))).map(r=>r.conceptId));
for(const e of lib.registry.concepts){
 const m=lib.concepts[e.canonicalConceptId];if(!changedConcepts.has(e.canonicalConceptId)&&!changedConcepts.has(m.derivedFromConceptId))continue;
 const mod=core.resolveConceptModule(lib,e.canonicalConceptId),p=mod.questions||{},unique=[...new Map(con.questionRecords({concepts:{x:mod}}).map(r=>[String(r.question.id),r.question])).values()];
 e.questionCountByDifficulty={easy:0,medium:0,hard:0,elite:0,legendary:0,unknown:0};for(const q of unique){const t=q.canonicalDifficulty||q.difficulty;e.questionCountByDifficulty[t in e.questionCountByDifficulty?t:'unknown']++;}
 e.questionCountByRole={boss:(p.boss||[]).length,bridge:(mod.bridgeQuestions||[]).length,calculation:(p.calculation||[]).length,elite:(p.elite||[]).length,integration:(p.integration||[]).length,legendary:(p.legendary||[]).length,legendaryBoss:(p.legendaryBoss||[]).length,main:['easy','medium','hard'].reduce((n,k)=>n+(p[k]||[]).length,0),repair:(mod.repairQuestions||[]).length,repairSeed:(mod.repairSeedQuestions||[]).length};
 if(e.runtimeAdaptiveCounts){const counts=Object.fromEntries(['easy','medium','hard'].map(k=>[k,(p[k]||[]).length]));for(const q of [...p.calculation||[],...p.integration||[]]){const t=q.canonicalDifficulty||q.difficulty;if(t in counts)counts[t]++;}e.runtimeAdaptiveCounts=counts;}
}
const graph=changes.get('42196').afterRecord,graphBytes=fs.readFileSync(path.join(data,graph.image));
const newAsset={conceptId:'market-failures',filename:path.basename(graph.image),sourceAssetPath:'audit_tools/review_flags_20261102/PUBLIC-04-readable.svg',sourceUrl:'data/'+graph.image,runtimePath:graph.image,sha256:sha(graphBytes),sizeBytes:graphBytes.length,width:1600,height:1080,imageAlt:graph.imageAlt,graphDescription:graph.graphDescription,sourceCurationPhase:'instructor-review-flags-20261102'};
lib.assetInventory.push(newAsset);lib.concepts['market-failures'].assetMetadata.push(structuredClone(newAsset));
const assetMetadataChanges=[{path:['assetInventory'],before:before.assetInventory,after:lib.assetInventory},{path:['concepts','market-failures','assetMetadata'],before:before.concepts['market-failures'].assetMetadata,after:lib.concepts['market-failures'].assetMetadata}];
if(Object.hasOwn(lib,'assetCount')){lib.assetCount=lib.assetInventory.length;assetMetadataChanges.push({path:['assetCount'],before:before.assetCount,after:lib.assetCount});}
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=read(path.join(__dirname,'baseline/composer_library_manifest.json'));manifest.librarySha256=lib.librarySha256;manifest.assets=structuredClone(lib.assetInventory);manifest.assetCount=manifest.assets.length;
const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'baseline/faculty-outcomes.js'),'utf8'),context);
const policy=JSON.parse(JSON.stringify(context.module.exports)),policyBefore=structuredClone(policy);
for(const [cid,record]of Object.entries(policy.concepts)){
 const m=lib.concepts[cid];if(!m||(!changedConcepts.has(cid)&&!changedConcepts.has(m.derivedFromConceptId)))continue;
 for(const o of record.outcomes){
  const c=core.compose(lib,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}});
  const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,c.banks[k].length]));
  o.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+c.banks[k].length,0),repair:c.repairQuestions.length,bridge:c.bridgeQuestions.length,seed:Object.values(c.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode)};
 }
}
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
const definitions=p=>{p=structuredClone(p);for(const c of Object.values(p.concepts))for(const o of c.outcomes)delete o.coverage;delete p.librarySha256;delete p.policySha256;return p;};assert.deepEqual(definitions(policy),definitions(policyBefore));
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest,readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
const aliases=new Map();for(const r of con.questionRecords(lib)){const id=String(r.question.id);if(aliases.has(id))assert.deepEqual(r.question,aliases.get(id));else aliases.set(id,r.question);}
for(const [id,q]of old)if(!changes.has(id))assert.deepEqual(aliases.get(id),q,'Unrelated question '+id);
const ledger={...draft,afterLibrarySha256:lib.librarySha256,moves,placementsBefore:placements(before),placementsAfter:placements(lib),metadataChanges:[{path:['librarySha256'],before:before.librarySha256,after:lib.librarySha256},{path:['registry'],before:before.registry,after:lib.registry},...assetMetadataChanges],facultyOutcomePolicyBefore:policyBefore,facultyOutcomeDefinitionsSha256:sha(stable(definitions(policy))),canonicalCount:aliases.size};
const outputs={
 'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n',
 'composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n',
 'composer_library_manifest.json':JSON.stringify(manifest,null,2)+'\n',
 'faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'
};
fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify(ledger,null,2)+'\n');
if(process.argv.includes('--write')){
 const current=load(path.join(data,'composer_library.js'));assert([before.librarySha256,lib.librarySha256,previousLedger?.afterLibrarySha256].includes(current.librarySha256),'Concurrent library change');
 const payload=structuredClone(current);delete payload.librarySha256;delete payload.registry.librarySha256;assert.equal(sha(stable(payload)),current.librarySha256);
 for(const [name,value]of Object.entries(outputs))fs.writeFileSync(path.join(data,name),value);
}
console.log(JSON.stringify({written:process.argv.includes('--write'),changed:changes.size,ordinaryPoolMoves:moves.length,canonicalCount:aliases.size,librarySha256:lib.librarySha256}));
