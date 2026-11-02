'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const load=p=>JSON.parse(fs.readFileSync(p,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
const before=load(path.join(__dirname,'baseline/composer_library.js')),lib=structuredClone(before),draft=require('./content-edits.json'),inv=require('./inventory.json'),decisions=require('./decisions.json'),retained=require('./retained.json');
for(const [id,reason]of Object.entries(retained)){assert(!draft[id]);decisions[id]={action:'retain',group:'unreviewed',reason};}
const target=inv.items.filter(r=>['flagged','unreviewed'].includes(r.group));
assert.equal(target.length,202);assert.equal(Object.keys(decisions).length,202);
for(const r of target){assert(decisions[r.id]);if(r.group==='flagged')assert(draft[r.id]);}
const old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question])),changes=[];
for(const [id,e]of Object.entries(draft)){
 const beforeRecord=old.get(id),r=inv.items.find(r=>r.id===id);assert(r&&['flagged','unreviewed'].includes(r.group));
 const afterRecord=structuredClone(beforeRecord);
 for(const k of ['q','options','feedback','commonError','type','primarySkill','repairSkill'])if(Object.hasOwn(e,k))afterRecord[k]=e[k];
 assert.equal(afterRecord.options.length,4);assert.equal(new Set(afterRecord.options.map(core.normalizeAnswerText)).size,4,id);
 afterRecord.aHash=sha(core.normalizeAnswerText(afterRecord.options[e.correctIndex]));
 assert.equal(sha(core.normalizeAnswerText(beforeRecord.options[e.correctIndex])),beforeRecord.aHash,'Keep answer positions '+id);
 const fields=Object.keys(afterRecord).filter(k=>JSON.stringify(afterRecord[k])!==JSON.stringify(beforeRecord[k]));assert(fields.length,id);
 changes.push({id,fields,correctIndex:e.correctIndex,reason:e.reason,group:r.group,beforeRecord,afterRecord});
}
const map=new Map(changes.map(c=>[c.id,c]));
for(const r of con.questionRecords(lib)){const c=map.get(String(r.question.id));if(c)Object.assign(r.question,structuredClone(c.afterRecord));}
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(core.stableStringify(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=read(path.join(__dirname,'baseline/composer_library_manifest.json'));manifest.librarySha256=lib.librarySha256;
const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'baseline/faculty-outcomes.js'),'utf8'),context);
const policy=JSON.parse(JSON.stringify(context.module.exports)),policyBefore=structuredClone(policy);
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(core.stableStringify(policy));
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest,readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
const unique=new Map();for(const r of con.questionRecords(lib)){const id=String(r.question.id);if(unique.has(id))assert.deepEqual(unique.get(id),r.question);unique.set(id,r.question);}
assert.equal(unique.size,9802);
for(const [id,q]of old)if(!map.has(id))assert.deepEqual(unique.get(id),q,'Preserve all non-target records '+id);
const ledger={beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,canonicalCount:unique.size,scope:{flagged:65,unreviewed:137,approvedPreserved:85,previouslyDocumentedExcluded:180,earlierReviewExcluded:14},changes,retained,metadataChanges:[{path:['librarySha256'],before:before.librarySha256,after:lib.librarySha256},{path:['registry'],before:before.registry,after:lib.registry}],facultyOutcomePolicyBefore:policyBefore};
const ledgerPath=path.join(__dirname,'expectations.json'),previous=fs.existsSync(ledgerPath)?read(ledgerPath):null;
if(process.argv.includes('--write')){
 const current=load(path.join(data,'composer_library.js'));assert([before.librarySha256,lib.librarySha256,previous?.afterLibrarySha256].includes(current.librarySha256),'Concurrent library change');
 const p=structuredClone(current);delete p.librarySha256;delete p.registry.librarySha256;assert.equal(sha(core.stableStringify(p)),current.librarySha256);
 fs.writeFileSync(path.join(data,'composer_library.js'),'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n');
 fs.writeFileSync(path.join(data,'composer_registry.json'),JSON.stringify(lib.registry,null,2)+'\n');
 fs.writeFileSync(path.join(data,'composer_library_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(data,'faculty-outcomes.js'),"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n');
}
fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'decisions.json'),JSON.stringify(decisions,null,2)+'\n');
console.log({written:process.argv.includes('--write'),revised:changes.length,retained:Object.keys(retained).length,canonicalCount:unique.size,librarySha256:lib.librarySha256});
