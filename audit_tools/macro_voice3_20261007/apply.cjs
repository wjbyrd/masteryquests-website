'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer'),data=path.join(cdir,'data');
const core=require(path.join(cdir,'composer-core.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=x=>crypto.createHash('sha256').update(x).digest('hex'),clone=structuredClone,stable=core.stableStringify;
const base=path.join(__dirname,'baseline');
const previousOutputs=Object.fromEntries(['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js'].map(n=>[n,fs.existsSync(path.join(__dirname,'staged',n))?fs.readFileSync(path.join(__dirname,'staged',n),'utf8'):null]));
const patches=read(path.join(__dirname,'patches.json')),universe=read(path.join(__dirname,'records.json'));
const source=fs.readFileSync(path.join(base,'composer_library.js'),'utf8'),before=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1)),lib=clone(before);
assert.equal(before.librarySha256,'0fbe5ff4beb0ab909c300d8b8cd6456d8c392b6fb52910be13ed42d8a9f4d66a');
const bRows=contracts.questionRecords(before),beforeMap=new Map(bRows.map(r=>[String(r.question.id),r.question])),newMap=new Map(),changes=[];
function editable(row){assert(row);assert(!row.marketGateDerived,'Protected mature Market Gate '+row.id);assert(row.areas.every(a=>a==='macro'),'Unapproved shared edit');assert(!row.areas.includes('micro'),'Frozen Micro '+row.id);}
if(process.argv.includes('--negative-controls')){
 const probes=[universe.find(r=>r.marketGateDerived),universe.find(r=>!r.marketGateDerived&&r.areas.includes('micro'))];
 for(const row of probes)assert.throws(()=>editable(row));
 fs.writeFileSync(path.join(__dirname,'protection-validation.json'),JSON.stringify({status:'PASS',rejectedStyleMutations:probes.map(r=>r.id)},null,2)+'\n');console.log('PASS: apply tool rejects protected Market Gate and frozen Micro style edits');process.exit(0);
}
for(const [id,p]of Object.entries(patches)){
 const row=universe.find(r=>r.id===id);editable(row);
 const old=beforeMap.get(id);assert.deepEqual(old,row.q);const q=clone(old),key=old.options.findIndex(o=>sha(core.normalizeAnswerText(o))===old.aHash);assert(key>=0);
 for(const [f,v]of Object.entries(p)){if(['patterns','rationales'].includes(f))continue;assert(['q','options','feedback','difficulty','canonicalDifficulty'].includes(f));if(['difficulty','canonicalDifficulty'].includes(f))assert(['P52B-S1-LRPC-L-002'].includes(id));q[f]=clone(v);}
 q.aHash=sha(core.normalizeAnswerText(q.options[key]));assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);
 const fields=Object.keys(q).filter(f=>stable(q[f])!==stable(old[f]));assert(fields.length);
 changes.push({id,fields,beforeRecord:old,afterRecord:q,correctIndex:key,rationale:p.rationales.join(' '),patterns:p.patterns,areas:row.areas,marketGateDerived:row.marketGateDerived});newMap.set(id,q);
}
for(const r of contracts.questionRecords(lib))if(newMap.has(String(r.question.id))){const replacement=clone(newMap.get(String(r.question.id)));for(const k of Object.keys(r.question))delete r.question[k];Object.assign(r.question,replacement);}
const moves=[];
for(const [cid,m]of Object.entries(lib.concepts)){
 const pending=[];
 for(const pool of ['easy','medium','hard','elite','legendary'])if(m.questions?.[pool])m.questions[pool]=m.questions[pool].filter(q=>{
  if(!newMap.has(String(q.id))||q.canonicalDifficulty===pool)return true;
  assert(['easy','medium','hard','elite','legendary'].includes(q.canonicalDifficulty));pending.push(q);moves.push({conceptId:cid,id:String(q.id),from:pool,to:q.canonicalDifficulty});return false;
 });
 for(const q of pending)(m.questions[q.canonicalDifficulty]||=[]).push(q);
}
const afterMap=new Map(contracts.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const changedConcepts=new Set([...bRows,...contracts.questionRecords(lib)].filter(r=>newMap.has(String(r.question.id))).map(r=>r.conceptId));
for(const e of lib.registry.concepts){
 const m=lib.concepts[e.canonicalConceptId];if(!changedConcepts.has(e.canonicalConceptId)&&!changedConcepts.has(m.derivedFromConceptId))continue;
 const mod=core.resolveConceptModule(lib,e.canonicalConceptId),p=mod.questions||{},rows=contracts.questionRecords({concepts:{x:mod}}),unique=[...new Map(rows.map(r=>[String(r.question.id),r.question])).values()];
 e.questionCountByDifficulty={easy:0,medium:0,hard:0,elite:0,legendary:0,unknown:0};for(const q of unique){const t=q.canonicalDifficulty||q.difficulty;e.questionCountByDifficulty[t in e.questionCountByDifficulty?t:'unknown']++;}
 e.questionCountByRole={boss:(p.boss||[]).length,bridge:(mod.bridgeQuestions||[]).length,calculation:(p.calculation||[]).length,elite:(p.elite||[]).length,integration:(p.integration||[]).length,legendary:(p.legendary||[]).length,legendaryBoss:(p.legendaryBoss||[]).length,main:['easy','medium','hard'].reduce((n,k)=>n+(p[k]||[]).length,0),repair:(mod.repairQuestions||[]).length,repairSeed:(mod.repairSeedQuestions||[]).length};
 e.calculationCoverage=unique.filter(q=>/calculat/i.test(q.type||'')||q.instructionalRole==='calculation').length;
 if(e.runtimeAdaptiveCounts){const counts=Object.fromEntries(['easy','medium','hard'].map(k=>[k,(p[k]||[]).length]));for(const q of [...p.calculation||[],...p.integration||[]]){const t=q.canonicalDifficulty||q.difficulty;if(t in counts)counts[t]++;}e.runtimeAdaptiveCounts=counts;}
}
assert.deepEqual([...afterMap.keys()].sort(),[...beforeMap.keys()].sort(),'No IDs lost or added');
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=read(path.join(base,'composer_library_manifest.json'));Object.assign(manifest,{librarySha256:lib.librarySha256,assets:lib.assetInventory,assetCount:lib.assetInventory.length});
const ctx={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(base,'faculty-outcomes.js'),'utf8'),ctx);const policy=JSON.parse(JSON.stringify(ctx.module.exports));
for(const [cid,record]of Object.entries(policy.concepts)){
 const m=lib.concepts[cid];if(!m||(!changedConcepts.has(cid)&&!changedConcepts.has(m.derivedFromConceptId)))continue;
 const validSkills=new Set(core.describeContentScope(lib,cid).full);
 for(const o of record.outcomes)assert(o.skillIds.every(s=>validSkills.has(s)),'Preserved skills');
 assert.deepEqual(record.outcomes.flatMap(o=>o.skillIds).sort(),[...validSkills].sort(),'Exact affected faculty skill partition '+cid);
 for(const o of record.outcomes){const c=core.compose(lib,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}});const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,c.banks[k].length]));o.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+c.banks[k].length,0),repair:c.repairQuestions.length,bridge:c.bridgeQuestions.length,seed:Object.values(c.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode)};}
}
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
contracts.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest,readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
const metadataChanges=[];function diff(a,b,p=[]){if(stable(a??null)===stable(b??null))return;if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],[...p,k]);return;}metadataChanges.push({path:p,before:a,after:b});}
const strip=l=>{const x=clone(l);for(const m of Object.values(x.concepts))for(const f of ['questions','repairQuestions','repairSeedQuestions','bridgeQuestions'])delete m[f];return x;};diff(strip(before),strip(lib));
const placements=l=>Object.fromEntries(Object.entries(l.concepts).map(([cid,m])=>[cid,m.questions?Object.fromEntries(Object.entries(m.questions).map(([p,qs])=>[p,qs.map(q=>String(q.id))])):null]));
const result={schemaVersion:1,beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,changes,moves,metadataChanges,placementsBefore:placements(before),placementsAfter:placements(lib),assets:[]};
const outputs={'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n','composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n','composer_library_manifest.json':JSON.stringify(manifest,null,2)+'\n','faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'};
fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify(result,null,2)+'\n');
const staged=path.join(__dirname,'staged');fs.mkdirSync(staged,{recursive:true});for(const [n,s]of Object.entries(outputs))fs.writeFileSync(path.join(staged,n),s);

if(process.argv.includes('--write'))for(const [n,s]of Object.entries(outputs)){
 const actual=fs.readFileSync(path.join(data,n),'utf8');assert(actual===fs.readFileSync(path.join(base,n),'utf8')||actual===s||actual===previousOutputs[n],'Intervening change '+n);fs.writeFileSync(path.join(data,n),s);
}
console.log(JSON.stringify({changes:changes.length,moves:moves.length,hash:lib.librarySha256}));
