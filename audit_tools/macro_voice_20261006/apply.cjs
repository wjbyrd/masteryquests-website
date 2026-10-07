'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data'),base=path.join(__dirname,'baseline');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const source=fs.readFileSync(path.join(base,'composer_library.js'),'utf8'),before=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1)),lib=structuredClone(before);
assert.equal(before.librarySha256,'869604194dbf645a33c326390c059fd67df7b5c9596a41fa06e0c25c5ae6a5d2');
const records=new Map(read(path.join(__dirname,'records.json')).map(r=>[r.id,r])),patches=read(path.join(__dirname,'patches.json')),changes=[];
for(const [id,p] of Object.entries(patches)){
 const r=records.get(id);assert(r.areas.includes('macro')&&!r.areas.includes('micro')&&!r.marketGateDerived,id+' must be editable Macro');
 const q=structuredClone(r.q);for(const f of Object.keys(p)){if(['patterns','rationales'].includes(f))continue;assert(['q','options','feedback'].includes(f));q[f]=structuredClone(p[f]);}
 assert(r.key>=0);q.aHash=sha(core.normalizeAnswerText(q.options[r.key]));assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);
 const fields=Object.keys(q).filter(f=>core.stableStringify(q[f])!==core.stableStringify(r.q[f]));
 changes.push({id,fields,patterns:p.patterns,rationale:p.rationales.join(' '),correctIndex:r.key,areas:r.areas,beforeRecord:r.q,afterRecord:q});
}
const map=new Map(changes.map(c=>[c.id,c]));
for(const r of con.questionRecords(lib)){const c=map.get(String(r.question.id));if(c){assert.deepEqual(r.question,c.beforeRecord);for(const f of Object.keys(r.question))delete r.question[f];Object.assign(r.question,structuredClone(c.afterRecord));}}
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(core.stableStringify(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=read(path.join(base,'composer_library_manifest.json'));manifest.librarySha256=lib.librarySha256;
const ctx={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(base,'faculty-outcomes.js'),'utf8'),ctx);const policy=JSON.parse(JSON.stringify(ctx.module.exports));
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(core.stableStringify(policy));
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest,readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
const outputs={'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n','composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n','composer_library_manifest.json':JSON.stringify(manifest,null,2)+'\n','faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'};
const ledger={schemaVersion:1,beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,changes};
fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify(ledger,null,2)+'\n');
if(process.argv.includes('--write'))for(const [name,s]of Object.entries(outputs)){
 const actual=fs.readFileSync(path.join(data,name),'utf8');assert(actual===fs.readFileSync(path.join(base,name),'utf8')||actual===s,'Intervening changes: '+name);fs.writeFileSync(path.join(data,name),s);
}
console.log(JSON.stringify({changed:changes.length,hash:lib.librarySha256}));
