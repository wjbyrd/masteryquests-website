'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),work=path.join(root,'tmp/macroeconomics_exception_closure'),cdir=path.join(root,'build/faculty-build-composer');
const core=require(path.join(cdir,'composer-core.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),stable=core.stableStringify,read=n=>JSON.parse(fs.readFileSync(path.join(__dirname,'inputs',n),'utf8'));
const b=read('baseline.json'),patches=read('patches.json'),routes=read('routing.json'),allowed=new Set(b.targets);
const previousStagedHashes=Object.fromEntries(['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js'].filter(n=>fs.existsSync(path.join(work,'staged',n))).map(n=>[n,sha(fs.readFileSync(path.join(work,'staged',n)))]));
const at=p=>execFileSync('git',['show',b.ref+':'+p],{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024});
const frozen=at('build/faculty-build-composer/data/composer_library.js');assert.equal(sha(frozen),b.sourceSHA256);
const baseline=JSON.parse(frozen.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,'')),lib=structuredClone(baseline),manifest=JSON.parse(at('build/faculty-build-composer/data/composer_library_manifest.json'));
const map=library=>new Map(contracts.questionRecords(library).map(r=>[String(r.question.id),r.question]));
const locations=library=>{const m={};for(const r of contracts.questionRecords(library))(m[String(r.question.id)]||=[]).push([r.conceptId,r.pool]);for(const a of Object.values(m))a.sort();return m};
const before=map(baseline),beforeLocations=locations(baseline),touched=new Set(),moves=[];
assert.deepEqual(Object.keys(patches).sort(),b.targets,'Exactly the 45 authorized targets');
function walk(value){
 if(!value||typeof value!=='object')return;if(Array.isArray(value)){value.forEach(walk);return;}
 const id=String(value.id||'');if(value.q&&Array.isArray(value.options)&&patches[id]){
  const p=patches[id];touched.add(value.primaryConceptId);
  for(const[k,v]of Object.entries(p))if(!k.startsWith('$'))value[k]=structuredClone(v);
  if(p.$correct){assert(value.options.filter(x=>x===p.$correct).length===1);value.aHash=sha(core.normalizeAnswerText(p.$correct));}
  assert.equal(value.options.filter(x=>sha(core.normalizeAnswerText(x))===value.aHash).length,1,'One resolved key '+id);
  assert.equal(new Set(value.options.map(core.normalizeAnswerText)).size,4,'Distinct alternatives '+id);
  return;
 }
 Object.values(value).forEach(walk);
}
walk(lib.concepts);
for(const[cid,m]of Object.entries(lib.concepts)){
 const pending=[];
 for(const pool of ['easy','medium','hard','elite','legendary'])if(m.questions?.[pool])m.questions[pool]=m.questions[pool].filter(q=>{
  if(m.supplementType==='checkpoint-challenge'&&q.isCheckpointChallenge)return true;
  const tier=patches[String(q.id)]?.canonicalDifficulty;
  if(tier&&tier!==pool){pending.push({q,tier});moves.push({id:String(q.id),conceptId:cid,from:pool,to:tier});return false;}return true;
 });
 for(const{q,tier}of pending)(m.questions[tier]||=[]).push(q);
}
const routingChanges=[];
for(const r of routes){
 const m=lib.concepts[r.concept];assert(m);m[r.map]||={};const old=structuredClone(m[r.map]);
 if(r.id){assert(allowed.has(r.id));const refs=m[r.map][r.from];assert(refs?.includes(r.id),'Existing exact route');m[r.map][r.from]=refs.filter(id=>id!==r.id);if(!m[r.map][r.from].length)delete m[r.map][r.from];if(r.to){m[r.map][r.to]||=[];if(!m[r.map][r.to].includes(r.id))m[r.map][r.to].push(r.id);}}
 else {assert(!m[r.map][r.skill],'Do not replace an existing repair map');for(const id of r.ids)assert(before.has(id)&&before.get(id).primaryConceptId===r.concept,'Existing local canonical reference '+id);m[r.map][r.skill]=r.ids;}
 routingChanges.push({...r,before:old,after:structuredClone(m[r.map])});touched.add(r.concept);
}
require('../macroeconomics_cleanup/metadata.cjs')(lib,core,contracts,touched);
const after=map(lib),afterLocations=locations(lib),changes=[];
assert.deepEqual([...after.keys()].sort(),[...before.keys()].sort());
for(const[id,q]of after){
 const old=before.get(id),changed=stable(old)!==stable(q)||stable(beforeLocations[id])!==stable(afterLocations[id]);
 if(!changed)continue;assert(allowed.has(id),'STOP: unauthorized canonical change '+id);
 const fields=[...new Set([...Object.keys(old),...Object.keys(q)])].filter(k=>stable(old[k]??null)!==stable(q[k]??null));
 for(const k of fields)assert(!k.startsWith('source')&&!['canonicalId','instructionalRole','challengeStage','bossStage','originalBossTier','originalSourcePool','primaryConceptId'].includes(k),'Preserved identity/role/route/provenance '+id+'.'+k);
 changes.push({id,fields,before:Object.fromEntries(fields.map(k=>[k,old[k]??null])),after:Object.fromEntries(fields.map(k=>[k,q[k]??null])),removedFields:fields.filter(k=>!(k in q)),beforeRecord:old,afterRecord:q,beforeLocations:beforeLocations[id],afterLocations:afterLocations[id]});
}
assert.deepEqual(changes.map(x=>x.id).sort(),b.targets,'All and only 45 records changed');
for(const id of b.protectedIDs){assert.deepEqual(after.get(id),before.get(id));assert.deepEqual(afterLocations[id],beforeLocations[id]);}
for(const r of contracts.questionRecords(lib))assert.deepEqual(r.question,after.get(String(r.question.id)),'Alias parity');
const stamp='2026-09-27T13:00:00.000Z';lib.generatedAt=stamp;lib.registry.generatedAt=stamp;delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
Object.assign(manifest,{assets:lib.assetInventory,assetCount:lib.assetInventory.length,librarySha256:lib.librarySha256,generatedAt:stamp});contracts.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest});
const policy=core.FacultyOutcomes.policy,context={module:{exports:{}}};vm.runInNewContext(at('build/faculty-build-composer/data/faculty-outcomes.js'),context);for(const k of Object.keys(policy))delete policy[k];Object.assign(policy,JSON.parse(JSON.stringify(context.module.exports)));
const outcomeChanges=[];
for(const[cid,record]of Object.entries(policy.concepts)){
 const module=core.resolveConceptModule(lib,cid);if(!module)continue;
 const wanted=new Set(core.ContentScope.describe(module).full),seen=new Set(),old=structuredClone(record);
 for(const o of record.outcomes)o.skillIds=o.skillIds.filter(s=>wanted.has(s)&&!seen.has(s)&&seen.add(s));
 const missing=[...wanted].filter(s=>!seen.has(s));
 if(missing.length){assert(touched.has(cid),'New skills only in touched concept '+cid);assert.equal(record.outcomes.length,1,'Explicit outcome required '+cid+' '+missing.join(','));record.outcomes[0].skillIds.push(...missing);record.outcomes[0].skillIds.sort();}
 if(stable(old)!==stable(record))outcomeChanges.push({conceptId:cid,before:old,after:structuredClone(record)});
}
for(const[cid,record]of Object.entries(policy.concepts)){
 const module=lib.concepts[cid];if(!module||(!touched.has(cid)&&!touched.has(module.derivedFromConceptId)))continue;
 for(const o of record.outcomes){const comp=core.compose(lib,{title:'Closure coverage',slug:'closure-coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}});const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,comp.banks[k].length]));o.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+comp.banks[k].length,0),repair:comp.repairQuestions.length,bridge:comp.bridgeQuestions.length,seed:Object.values(comp.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:comp.validation.modes.filter(m=>m.ok).map(m=>m.mode)};}
}
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
const area=require(path.join(cdir,'course-area-model.js')).create(lib.registry.concepts),areas={general:new Set(),micro:new Set(),macro:new Set()};
for(const cid of Object.keys(lib.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(lib,cid)))for(const a of area.areasFor(cid))areas[a].add(String(q.id));
for(const a in areas)assert.deepEqual([...areas[a]].sort(),b.areaIDs[a],'STOP: course membership changed '+a);
const expectations={schemaVersion:'1.0',baselineRef:b.ref,baselineSourceSha256:b.sourceSHA256,authorizedIds:b.targets,changedQuestionIds:changes.map(x=>x.id).sort(),changes,moves,routingChanges,outcomeChanges,afterLibrarySha256:lib.librarySha256};
fs.writeFileSync(path.join(work,'expectations.json'),JSON.stringify(expectations,null,2));
const outputs=new Map([['composer_library.js','window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n'],['composer_registry.json',JSON.stringify(lib.registry,null,2)+'\n'],['composer_library_manifest.json',JSON.stringify(manifest,null,2)+'\n'],['faculty-outcomes.js',"// Generated by audit_tools/faculty_lo/build-policy.cjs from reviewed grouping proposals.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n']]);
fs.mkdirSync(path.join(work,'staged'),{recursive:true});for(const[n,s]of outputs)fs.writeFileSync(path.join(work,'staged',n),s);
if(process.argv.includes('--write')){
 for(const[n,s]of outputs){const rel='build/faculty-build-composer/data/'+n,current=sha(fs.readFileSync(path.join(root,rel)));assert(current===b.fileHashes[rel]||current===sha(s)||current===previousStagedHashes[n],'Refuse to overwrite subsequent work '+rel);}
 for(const[n,s]of outputs)fs.writeFileSync(path.join(cdir,'data',n),s);
 fs.writeFileSync(path.join(root,'validation_artifacts/question_quality/macroeconomics_exception_closure_expectations.json'),JSON.stringify(expectations,null,2)+'\n');
}
console.log(JSON.stringify({written:process.argv.includes('--write'),changed:changes.length,ordinaryStorageMoves:moves.length,routeChanges:routingChanges.length,protectedRecords:b.protectedIDs.length,global:after.size,counts:Object.fromEntries(Object.entries(areas).map(([a,s])=>[a,s.size])),outcomeChanges:outcomeChanges.map(x=>x.conceptId)},null,2));
