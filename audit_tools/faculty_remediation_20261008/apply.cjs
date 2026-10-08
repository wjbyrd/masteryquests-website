'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js')),style=require(path.join(dir,'tests/faculty-prose-candidates.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),stable=core.stableStringify;
const load=p=>JSON.parse(fs.readFileSync(p,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
(async()=>{
 const before=load(path.join(__dirname,'baseline/composer_library.js')),lib=structuredClone(before),manifest=read(path.join(__dirname,'manifest.json'));
 const old=new Map();for(const r of con.questionRecords(before)){const id=String(r.question.id);if(old.has(id))assert.deepEqual(old.get(id),r.question);old.set(id,r.question);}
 const area=require(path.join(dir,'course-area-model.js')).create(before.registry.concepts),areas={};
 for(const cid of Object.keys(before.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(before,cid))){const id=String(q.id);areas[id]??=new Set();for(const a of area.areasFor(cid))areas[id].add(a);}
 const changes=[],dispositions=[],styleResults=[],edited=new Map(),previousOutputs={};
 const currentLibrary=load(path.join(data,'composer_library.js'));
 const ownIntermediate=['3b65d2362e536797fcddd7a7d37ba8811ea2924345318c341977a6c49d7244fc','a778c91ab35c68393d5612847e95ffd10510d0766a11ad6f66d3ea662fe3617f'].includes(currentLibrary.librarySha256);
 if(ownIntermediate)con.assertCanonicalIntegrity(currentLibrary,{registry:read(path.join(data,'composer_registry.json')),manifest:read(path.join(data,'composer_library_manifest.json')),readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
 for(const n of ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js'])if(fs.existsSync(path.join(__dirname,'staged',n)))previousOutputs[n]=fs.readFileSync(path.join(__dirname,'staged',n),'utf8');
 for(const c of manifest){
  const q=old.get(c.id);assert.deepEqual(q,c.before);const membership=[...areas[c.id]].sort();assert.deepEqual(membership,[...c.areas].sort());assert(membership.some(a=>a==='micro'||a==='macro'));
  const keyHashes=await Promise.all(q.options.map(s=>core.sha256Hex(core.normalizeAnswerText(s))));assert.deepEqual(keyHashes.map((v,i)=>v===q.aHash?i:-1).filter(i=>i>=0),[c.key]);
  if(c.disposition!=='IMPLEMENTED'){assert.deepEqual(c.after,c.before);dispositions.push(c);continue;}
  const after=structuredClone(c.after);after.aHash=await core.sha256Hex(core.normalizeAnswerText(after.options[c.key]));
  assert.equal(new Set(after.options.map(core.normalizeAnswerText)).size,4);
  const fields=Object.keys(after).filter(k=>stable(after[k])!==stable(q[k]));assert(fields.length);assert(fields.every(k=>['q','options','feedback','aHash','canonicalDifficulty','checkpointPool'].includes(k)));
  if(fields.includes('checkpointPool')){assert(['P72-OPPC-B2-004','P62E-COP-B2-025','PM2B3-POL-EB-002'].includes(c.id));assert.equal(after.checkpointPool,q.sourcePool);}
  const b=style.screen(q,c.key),a=style.screen(after,c.key);styleResults.push({id:c.id,before:b,after:a,newLengthFlag:a.lengthOutlier&&!b.lengthOutlier});
  changes.push({id:c.id,fields,beforeRecord:q,afterRecord:after,correctIndex:c.key,rationale:c.reason,patterns:[c.patternSeed||'direct faculty note'],areas:membership,source:c.source,economicContentChanged:c.economicContentChanged});edited.set(c.id,after);dispositions.push({...c,after});
 }
 fs.writeFileSync(path.join(__dirname,'style-validation.json'),JSON.stringify({newLengthFlags:styleResults.filter(x=>x.newLengthFlag).map(x=>x.id),retainedLengthFlags:styleResults.filter(x=>x.after.lengthOutlier).map(x=>x.id),records:styleResults},null,2));
 assert.equal(styleResults.filter(x=>x.newLengthFlag).length,0,'New length flag; inspect style-validation.json');
 for(const r of con.questionRecords(lib))if(edited.has(String(r.question.id)))Object.assign(r.question,structuredClone(edited.get(String(r.question.id))));
 const tierIds=new Set(changes.filter(c=>c.fields.includes('canonicalDifficulty')).map(c=>c.id)),moves=[];
 const placements=l=>Object.fromEntries(Object.entries(l.concepts).filter(([cid])=>moves.some(m=>m.conceptId===cid)).map(([cid,m])=>[cid,Object.fromEntries(Object.entries(m.questions).map(([p,qs])=>[p,qs.map(q=>String(q.id))]))]));
 for(const [cid,m]of Object.entries(lib.concepts)){
  const pending=[];for(const pool of ['easy','medium','hard','elite','legendary'])if(m.questions?.[pool])m.questions[pool]=m.questions[pool].filter(q=>{
   if(!tierIds.has(String(q.id))||q.canonicalDifficulty===pool)return true;
   pending.push(q);moves.push({conceptId:cid,id:String(q.id),from:pool,to:q.canonicalDifficulty});return false;
  });for(const q of pending)(m.questions[q.canonicalDifficulty]||=[]).push(q);
 }
 const changedConcepts=new Set(con.questionRecords(lib).filter(r=>tierIds.has(String(r.question.id))).map(r=>r.conceptId));
 for(const e of lib.registry.concepts){
  const m=lib.concepts[e.canonicalConceptId];if(!changedConcepts.has(e.canonicalConceptId)&&!changedConcepts.has(m.derivedFromConceptId))continue;
  const mod=core.resolveConceptModule(lib,e.canonicalConceptId),p=mod.questions||{},unique=[...new Map(con.questionRecords({concepts:{x:mod}}).map(r=>[String(r.question.id),r.question])).values()];
  e.questionCountByDifficulty={easy:0,medium:0,hard:0,elite:0,legendary:0,unknown:0};for(const q of unique){const t=q.canonicalDifficulty||q.difficulty;e.questionCountByDifficulty[t in e.questionCountByDifficulty?t:'unknown']++;}
  e.questionCountByRole={boss:(p.boss||[]).length,bridge:(mod.bridgeQuestions||[]).length,calculation:(p.calculation||[]).length,elite:(p.elite||[]).length,integration:(p.integration||[]).length,legendary:(p.legendary||[]).length,legendaryBoss:(p.legendaryBoss||[]).length,main:['easy','medium','hard'].reduce((n,k)=>n+(p[k]||[]).length,0),repair:(mod.repairQuestions||[]).length,repairSeed:(mod.repairSeedQuestions||[]).length};
  if(e.runtimeAdaptiveCounts){const counts=Object.fromEntries(['easy','medium','hard'].map(k=>[k,(p[k]||[]).length]));for(const q of [...p.calculation||[],...p.integration||[]]){const t=q.canonicalDifficulty||q.difficulty;if(t in counts)counts[t]++;}e.runtimeAdaptiveCounts=counts;}
 }
 delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=await core.sha256Hex(stable(lib));lib.registry.librarySha256=lib.librarySha256;
 const libraryManifest=read(path.join(__dirname,'baseline/composer_library_manifest.json'));libraryManifest.librarySha256=lib.librarySha256;
 const ctx={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'baseline/faculty-outcomes.js'),'utf8'),ctx);const policy=JSON.parse(JSON.stringify(ctx.module.exports)),policyBefore=structuredClone(policy);
 for(const [cid,record]of Object.entries(policy.concepts)){
  const m=lib.concepts[cid];if(!m||(!changedConcepts.has(cid)&&!changedConcepts.has(m.derivedFromConceptId)))continue;
  for(const o of record.outcomes){const c=core.compose(lib,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}});const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,c.banks[k].length]));o.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+c.banks[k].length,0),repair:c.repairQuestions.length,bridge:c.bridgeQuestions.length,seed:Object.values(c.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode)};}
 }
 policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=await core.sha256Hex(stable(policy));
 const withoutCoverage=p=>{p=structuredClone(p);for(const c of Object.values(p.concepts))for(const o of c.outcomes)delete o.coverage;delete p.librarySha256;delete p.policySha256;return p;};assert.deepEqual(withoutCoverage(policy),withoutCoverage(policyBefore));
 con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest:libraryManifest,readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
 const assets=[];for(const a of lib.assetInventory){const hash=await core.sha256BytesHex(fs.readFileSync(path.join(data,a.runtimePath)));assert.equal(hash,a.sha256);assets.push({path:a.runtimePath,sha256:hash});}
 const outcomeContent=structuredClone(policyBefore);delete outcomeContent.librarySha256;delete outcomeContent.policySha256;
 const metadataChanges=[{path:['librarySha256'],before:before.librarySha256,after:lib.librarySha256},{path:['registry'],before:before.registry,after:lib.registry}];
 const ledger={schemaVersion:1,facultyOutcomePolicyBefore:policyBefore,facultyOutcomeContentSha256:await core.sha256Hex(stable(outcomeContent)),facultyOutcomeDefinitionsSha256:await core.sha256Hex(stable(withoutCoverage(policy))),beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,changes,moves,placementsBefore:placements(before),placementsAfter:placements(lib),metadataChanges,assets};
 const outputs={'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n','composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n','composer_library_manifest.json':JSON.stringify(libraryManifest,null,2)+'\n','faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'};
 for(const [n,v]of Object.entries({'expectations.json':ledger,'dispositions.json':dispositions}))fs.writeFileSync(path.join(__dirname,n),JSON.stringify(v,null,2)+'\n');
 fs.mkdirSync(path.join(__dirname,'staged'),{recursive:true});for(const [n,v]of Object.entries(outputs))fs.writeFileSync(path.join(__dirname,'staged',n),v);
 if(process.argv.includes('--write'))for(const [n,v]of Object.entries(outputs)){const current=fs.readFileSync(path.join(data,n),'utf8');assert(current===fs.readFileSync(path.join(__dirname,'baseline',n),'utf8')||current===v||current===previousOutputs[n]||ownIntermediate,'Concurrent change '+n);fs.writeFileSync(path.join(data,n),v);}
 console.log(JSON.stringify({edited:changes.length,answerHashesChanged:changes.filter(c=>c.fields.includes('aHash')).length,tierChanges:changes.filter(c=>c.fields.includes('canonicalDifficulty')).length,newAnswerLengthFlags:0,librarySha256:lib.librarySha256}));
})().catch(e=>{console.error(e);process.exitCode=1;});
