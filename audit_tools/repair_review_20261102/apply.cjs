'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),vm=require('vm');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),load=p=>JSON.parse(fs.readFileSync(p,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,'')),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),stable=core.stableStringify;
const before=load(path.join(__dirname,'baseline/composer_library.js')),lib=structuredClone(before),draft=read(path.join(__dirname,'content-edits.json'));
const previousLedgerPath=path.join(__dirname,'expectations.json'),previousLedger=fs.existsSync(previousLedgerPath)?read(previousLedgerPath):null;
assert.equal(before.librarySha256,draft.beforeLibrarySha256);
const old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question])),changes=new Map(draft.changes.map(c=>[c.id,c]));
for(const c of changes.values()){
 assert.deepEqual(c.beforeRecord,old.get(c.id));assert(c.fields.every(f=>['q','options','feedback','hint','aHash','instructionalRole','type','imageAlt','graphDescription'].includes(f)),c.id);
 const restored=structuredClone(c.afterRecord);for(const f of c.fields){if(Object.hasOwn(c.beforeRecord,f))restored[f]=structuredClone(c.beforeRecord[f]);else delete restored[f];}assert.deepEqual(restored,c.beforeRecord);
 assert.equal(c.afterRecord.options.filter(o=>sha(core.normalizeAnswerText(o))===c.afterRecord.aHash).length,1,c.id);assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash,c.id);
}
for(const r of con.questionRecords(lib)){const c=changes.get(String(r.question.id));if(c)Object.assign(r.question,structuredClone(c.afterRecord));}
const id='ECON-NL-INFLATION-RATE-5021',cid='cpi-and-inflation-measurement',m=lib.concepts[cid],skill='inflation_rate';
assert.equal(m.repairQuestions.filter(q=>String(q.id)===id).length,1);assert(!m.bridgeQuestions.some(q=>String(q.id)===id));
m.repairQuestions=m.repairQuestions.filter(q=>String(q.id)!==id);m.bridgeQuestions.push(structuredClone(changes.get(id).afterRecord));
assert(m.microSkillRepairPools[skill].includes(id));m.microSkillRepairPools[skill]=m.microSkillRepairPools[skill].filter(x=>String(x)!==id);assert(m.microSkillRepairPools[skill].length>0,'Retain conceptual repair coverage');
(m.microSkillBridgePools[skill]||=[]).push(id);
for(const e of lib.registry.concepts){if(e.canonicalConceptId!==cid)continue;e.questionCountByRole.repair=m.repairQuestions.length;e.questionCountByRole.bridge=m.bridgeQuestions.length;}
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=read(path.join(__dirname,'baseline/composer_library_manifest.json'));manifest.librarySha256=lib.librarySha256;
const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'baseline/faculty-outcomes.js'),'utf8'),context);
const policy=JSON.parse(JSON.stringify(context.module.exports)),policyBefore=structuredClone(policy);
for(const o of policy.concepts[cid].outcomes){const c=core.compose(lib,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}}),difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,c.banks[k].length]));o.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+c.banks[k].length,0),repair:c.repairQuestions.length,bridge:c.bridgeQuestions.length,seed:Object.values(c.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode)};}
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
const definitions=p=>{p=structuredClone(p);for(const c of Object.values(p.concepts))for(const o of c.outcomes)delete o.coverage;delete p.librarySha256;delete p.policySha256;return p;};assert.deepEqual(definitions(policy),definitions(policyBefore));
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest,readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
const now=new Map();for(const r of con.questionRecords(lib)){const id=String(r.question.id);if(now.has(id))assert.deepEqual(r.question,now.get(id));else now.set(id,r.question);}
assert.equal(now.size,9802);for(const [id,q]of old)if(!changes.has(id))assert.deepEqual(now.get(id),q,'Unrelated question '+id);
const placements=l=>({[cid]:Object.fromEntries(['repairQuestions','bridgeQuestions'].map(k=>[k,l.concepts[cid][k].map(q=>String(q.id))]))});
const metadataPaths=[['librarySha256'],['registry'],['concepts',cid,'microSkillRepairPools'],['concepts',cid,'microSkillBridgePools']],at=(l,p)=>p.reduce((o,k)=>o[k],l);
const ledger={...draft,afterLibrarySha256:lib.librarySha256,supportPlacementsBefore:placements(before),supportPlacementsAfter:placements(lib),metadataChanges:metadataPaths.map(p=>({path:p,before:at(before,p),after:at(lib,p)})),facultyOutcomePolicyBefore:policyBefore,canonicalCount:now.size};
if(process.argv.includes('--write')){
 // Permit the verified 73-record draft from this same pass before the four additional wording fixes.
 const intermediateDraftSha256='a4e9453423e97b16ac66b0bbbfa08f47fa4985e49fea093526d77115b909776a';
 const current=load(path.join(data,'composer_library.js'));assert([before.librarySha256,lib.librarySha256,previousLedger?.afterLibrarySha256,intermediateDraftSha256].includes(current.librarySha256),'Concurrent library change');const payload=structuredClone(current);delete payload.librarySha256;delete payload.registry.librarySha256;assert.equal(sha(stable(payload)),current.librarySha256);
 const outputs={'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n','composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n','composer_library_manifest.json':JSON.stringify(manifest,null,2)+'\n','faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'};
 for(const [name,value]of Object.entries(outputs))fs.writeFileSync(path.join(data,name),value);
}
fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({written:process.argv.includes('--write'),changed:changes.size,roleChanges:1,canonicalCount:now.size,librarySha256:lib.librarySha256}));
