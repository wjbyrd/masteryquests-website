'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),vm=require('vm');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),load=p=>JSON.parse(fs.readFileSync(p,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,'')),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const before=load(path.join(__dirname,'baseline/composer_library.js')),lib=structuredClone(before),draft=read(path.join(__dirname,'content-edits.json'));
const priorPath=path.join(__dirname,'expectations.json'),priorLedger=fs.existsSync(priorPath)?read(priorPath):null;
assert.equal(before.librarySha256,draft.beforeLibrarySha256);assert.equal(draft.audited,2159);
const old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question])),changes=new Map(draft.changes.map(c=>[c.id,c]));
for(const c of changes.values()){
 assert.deepEqual(c.beforeRecord,old.get(c.id));assert(c.fields.every(f=>['q','options','feedback','hint','aHash'].includes(f)),c.id);
 const restored=structuredClone(c.afterRecord);for(const f of c.fields){if(Object.hasOwn(c.beforeRecord,f))restored[f]=structuredClone(c.beforeRecord[f]);else delete restored[f];}assert.deepEqual(restored,c.beforeRecord);
 assert.equal(c.afterRecord.options.filter(o=>sha(core.normalizeAnswerText(o))===c.afterRecord.aHash).length,1,c.id);assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash,c.id);
 assert.equal(c.afterRecord.canonicalDifficulty,'hard');
}
for(const r of con.questionRecords(lib)){const c=changes.get(String(r.question.id));if(c)Object.assign(r.question,structuredClone(c.afterRecord));}
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(core.stableStringify(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=read(path.join(__dirname,'baseline/composer_library_manifest.json'));manifest.librarySha256=lib.librarySha256;
const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'baseline/faculty-outcomes.js'),'utf8'),context);
const policy=JSON.parse(JSON.stringify(context.module.exports)),policyBefore=structuredClone(policy);policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(core.stableStringify(policy));
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest,readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
const now=new Map();for(const r of con.questionRecords(lib)){const id=String(r.question.id);if(now.has(id))assert.deepEqual(r.question,now.get(id));else now.set(id,r.question);}
assert.equal(now.size,9802);for(const [id,q]of old)if(!changes.has(id))assert.deepEqual(now.get(id),q,'Unrelated question '+id);
const metadataChanges=[{path:['librarySha256'],before:before.librarySha256,after:lib.librarySha256},{path:['registry'],before:before.registry,after:lib.registry}];
const ledger={...draft,afterLibrarySha256:lib.librarySha256,metadataChanges,facultyOutcomePolicyBefore:policyBefore,canonicalCount:now.size};
if(process.argv.includes('--write')){
 const current=load(path.join(data,'composer_library.js'));assert([before.librarySha256,lib.librarySha256,priorLedger?.afterLibrarySha256].includes(current.librarySha256),'Concurrent library change');const payload=structuredClone(current);delete payload.librarySha256;delete payload.registry.librarySha256;assert.equal(sha(core.stableStringify(payload)),current.librarySha256);
 const outputs={'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n','composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n','composer_library_manifest.json':JSON.stringify(manifest,null,2)+'\n','faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'};
 for(const [name,value]of Object.entries(outputs))fs.writeFileSync(path.join(data,name),value);
}
fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify({written:process.argv.includes('--write'),audited:draft.audited,revised:changes.size,retained:draft.retained,canonicalCount:now.size,librarySha256:lib.librarySha256}));
