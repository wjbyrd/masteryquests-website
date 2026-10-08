'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js')),style=require(path.join(dir,'tests/faculty-prose-candidates.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),stable=core.stableStringify;
const load=p=>JSON.parse(fs.readFileSync(p,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
(async()=>{
 const before=load(path.join(__dirname,'baseline/composer_library.js')),lib=structuredClone(before),manifest=read(path.join(__dirname,'manifest.json'));
 const rows=con.questionRecords(before),old=new Map();for(const r of rows){const id=String(r.question.id);if(old.has(id))assert.deepEqual(old.get(id),r.question);old.set(id,r.question);}
 const area=require(path.join(dir,'course-area-model.js')).create(before.registry.concepts),areas={};
 for(const cid of Object.keys(before.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(before,cid))){const id=String(q.id);areas[id]??=new Set();for(const a of area.areasFor(cid))areas[id].add(a);}
 const isMG=q=>(q.sourceOccurrences||[]).some(s=>/market.?gate/i.test([s.sourceGame,s.sourceFile,s.sourceGlobal].join(' ')))||/market.?gate/i.test(q.sourceGame||'');
 assert.equal(manifest.candidates.length,94);assert.equal(new Set(manifest.candidates.map(c=>c.id)).size,94);
 const changes=[],dispositions=[],styleResults=[],graphs=[];const edited=new Map();
 for(const c of manifest.candidates){
  const q=old.get(c.id);assert(q,'Missing target '+c.id);const membership=[...areas[c.id]].sort();
  if(stable(membership)!==stable(['micro'])||isMG(q)){dispositions.push({...c,action:'PROTECTED — unexpected shared record',areas:membership});continue;}
  const keyHashes=await Promise.all(q.options.map(s=>core.sha256Hex(core.normalizeAnswerText(s))));const key=keyHashes.indexOf(q.aHash);assert.equal(key,c.before.key);assert.equal(keyHashes.filter(h=>h===q.aHash).length,1);
  const content=x=>({q:x.q,options:x.options,feedback:x.feedback});
  if(stable(content(q))===stable(content(c.final))){dispositions.push({...c,action:'ALREADY RESOLVED',areas:membership});continue;}
  assert.deepEqual(content(q),content(c.before),'Review baseline mismatch '+c.id);
  const after={...structuredClone(q),...content(c.final)};after.aHash=await core.sha256Hex(core.normalizeAnswerText(after.options[key]));
  assert.equal(new Set(after.options.map(core.normalizeAnswerText)).size,4);
  const fields=Object.keys(after).filter(k=>stable(after[k])!==stable(q[k]));assert(fields.every(k=>['q','options','feedback','aHash'].includes(k)));
  const b=style.screen(q,key),a=style.screen(after,key);assert(!(a.lengthOutlier&&!b.lengthOutlier),'New answer length flag '+c.id);
  styleResults.push({id:c.id,before:b,after:a,newLengthFlag:a.lengthOutlier&&!b.lengthOutlier});
  if(q.image){const hash=await core.sha256BytesHex(fs.readFileSync(path.join(data,q.image)));assert.deepEqual(c.reviewGraph,{sha256:hash,imageAlt:q.imageAlt||'Existing question graph',graphDescription:q.graphDescription||''},'Review image/description matches current '+c.id);graphs.push({id:c.id,image:q.image,imageAlt:q.imageAlt,graphDescription:q.graphDescription,sha256:hash,chronologyCandidate:c.patterns.includes('Graph state')});}
  changes.push({id:c.id,fields,beforeRecord:q,afterRecord:after,correctIndex:key,rationale:c.rationale,patterns:c.patterns,areas:membership,marketGateDerived:false,facultyOverride:c.facultyOverride,priorPdfPage:c.page});edited.set(c.id,after);dispositions.push({...c,action:'EDITED',areas:membership});
 }
 assert.equal(dispositions.length,94);assert.equal(changes.length,94,'Do not proceed with unresolved targets');
 for(const r of con.questionRecords(lib))if(edited.has(String(r.question.id)))Object.assign(r.question,structuredClone(edited.get(String(r.question.id))));
 delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=await core.sha256Hex(stable(lib));lib.registry.librarySha256=lib.librarySha256;
 const libraryManifest=read(path.join(__dirname,'baseline/composer_library_manifest.json'));libraryManifest.librarySha256=lib.librarySha256;
 const ctx={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'baseline/faculty-outcomes.js'),'utf8'),ctx);const policy=JSON.parse(JSON.stringify(ctx.module.exports));const policyBefore=structuredClone(policy);
 policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=await core.sha256Hex(stable(policy));assert.deepEqual(policy.concepts,policyBefore.concepts);
 con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest:libraryManifest,readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
 const assets=[];for(const a of lib.assetInventory){const hash=await core.sha256BytesHex(fs.readFileSync(path.join(data,a.runtimePath)));assert.equal(hash,a.sha256);assets.push({path:a.runtimePath,sha256:hash});}
 const outcomeContent=structuredClone(policyBefore);delete outcomeContent.librarySha256;delete outcomeContent.policySha256;
 const ledger={schemaVersion:1,reviewSha256:manifest.reviewSha256,facultyOutcomeContentSha256:await core.sha256Hex(stable(outcomeContent)),beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,changes,moves:[],metadataChanges:[{path:['librarySha256'],before:before.librarySha256,after:lib.librarySha256},{path:['registry','librarySha256'],before:before.registry.librarySha256,after:lib.librarySha256}],assets};
 const outputs={'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n','composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n','composer_library_manifest.json':JSON.stringify(libraryManifest,null,2)+'\n','faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'};
 for(const [n,v] of Object.entries({'expectations.json':ledger,'dispositions.json':dispositions,'style-validation.json':{newLengthFlags:styleResults.filter(x=>x.newLengthFlag).length,retainedLengthFlags:styleResults.filter(x=>x.after.lengthOutlier).map(x=>x.id),records:styleResults},'graph-review.json':graphs}))fs.writeFileSync(path.join(__dirname,n),JSON.stringify(v,null,2)+'\n');
 fs.mkdirSync(path.join(__dirname,'staged'),{recursive:true});for(const [n,v]of Object.entries(outputs))fs.writeFileSync(path.join(__dirname,'staged',n),v);
 if(process.argv.includes('--write'))for(const [n,v]of Object.entries(outputs)){const current=fs.readFileSync(path.join(data,n),'utf8');assert(current===fs.readFileSync(path.join(__dirname,'baseline',n),'utf8')||current===v,'Concurrent change '+n);fs.writeFileSync(path.join(data,n),v);}
 console.log(JSON.stringify({edited:changes.length,answerHashesChanged:changes.filter(c=>c.fields.includes('aHash')).length,graphs:graphs.length,newAnswerLengthFlags:0,librarySha256:lib.librarySha256}));
})().catch(e=>{console.error(e);process.exitCode=1;});
