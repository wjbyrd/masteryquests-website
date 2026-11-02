'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),vm=require('vm');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),load=p=>JSON.parse(fs.readFileSync(p,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),stable=core.stableStringify;
const before=load(path.join(__dirname,'baseline/composer_library.js')),lib=structuredClone(before),id='ECON-NL-INFLATION-RATE-5021',cid='cpi-and-inflation-measurement',skill='inflation_rate',m=lib.concepts[cid];
assert.equal(before.librarySha256,'02ecab7d94216f1231f79bb914e5e93a25925aa0a5a5f45395a2a9bc4f4a7d90');
const old=m.bridgeQuestions.find(q=>String(q.id)===id);assert(old);assert.equal(old.instructionalRole,'bridge');const afterRecord={...structuredClone(old),instructionalRole:'repair'};
const placements=l=>({[cid]:Object.fromEntries(['repairQuestions','bridgeQuestions'].map(k=>[k,l.concepts[cid][k].map(q=>String(q.id))]))});
const supportPlacementsBefore=placements(before),prior=read(path.join(root,'audit_tools/repair_review_20261102/expectations.json'));
const originalRepairIds=prior.supportPlacementsBefore[cid].repairQuestions;
assert.deepEqual(m.repairQuestions.map(q=>String(q.id)),originalRepairIds.filter(qid=>qid!==id));
m.bridgeQuestions=m.bridgeQuestions.filter(q=>String(q.id)!==id);m.repairQuestions.splice(originalRepairIds.indexOf(id),0,afterRecord);
const routeBefore=prior.metadataChanges.find(c=>c.path.join('.')===['concepts',cid,'microSkillRepairPools'].join('.')).before[skill];
assert.deepEqual(m.microSkillRepairPools[skill],routeBefore.filter(qid=>qid!==id));m.microSkillRepairPools[skill]=structuredClone(routeBefore);
assert(m.microSkillBridgePools[skill].includes(id));m.microSkillBridgePools[skill]=m.microSkillBridgePools[skill].filter(qid=>qid!==id);
// Restore an absent empty route instead of retaining a vestige of the earlier move.
const oldBridge=prior.metadataChanges.find(c=>c.path.join('.')===['concepts',cid,'microSkillBridgePools'].join('.')).before;
if(!m.microSkillBridgePools[skill].length&&!Object.hasOwn(oldBridge,skill))delete m.microSkillBridgePools[skill];
const entry=lib.registry.concepts.find(e=>e.canonicalConceptId===cid);entry.questionCountByRole.repair=m.repairQuestions.length;entry.questionCountByRole.bridge=m.bridgeQuestions.length;
const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'baseline/faculty-outcomes.js'),'utf8'),context);
const policyBefore=JSON.parse(JSON.stringify(context.module.exports)),policy=structuredClone(policyBefore),coverageChanges=[];
for(const o of policy.concepts[cid].outcomes){const input={title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}},a=core.compose(before,input),b=core.compose(lib,input);assert.deepEqual(a.banks,b.banks);assert.deepEqual(a.validation.modes.map(m=>[m.mode,m.ok]),b.validation.modes.map(m=>[m.mode,m.ok]));assert.equal(o.coverage.repair,a.repairQuestions.length);assert.equal(o.coverage.bridge,a.bridgeQuestions.length);const old=structuredClone(o.coverage);o.coverage={...o.coverage,repair:b.repairQuestions.length,bridge:b.bridgeQuestions.length};if(stable(old)!==stable(o.coverage))coverageChanges.push({id:o.id,before:old,after:o.coverage});}
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
const manifest=read(path.join(__dirname,'baseline/composer_library_manifest.json'));manifest.librarySha256=lib.librarySha256;
const metadataChanges=[['librarySha256'],['registry'],['concepts',cid,'microSkillRepairPools'],['concepts',cid,'microSkillBridgePools']].map(p=>({path:p,before:p.reduce((o,k)=>o[k],before),after:p.reduce((o,k)=>o[k],lib)}));
const correctIndex=old.options.findIndex(o=>sha(core.normalizeAnswerText(o))===old.aHash);assert(correctIndex>=0);
const changes=[{id,conceptId:cid,beforeRecord:old,afterRecord,fields:['instructionalRole'],correctIndex,reason:'Return to Repair at the instructor’s explicit request; wording, answer and difficulty unchanged.'}];
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest});
const ledger={schemaVersion:1,beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,changes,supportPlacementsBefore,supportPlacementsAfter:placements(lib),metadataChanges,facultyOutcomePolicyBefore:policyBefore,coverageChanges,canonicalCount:9802};
const current=load(path.join(data,'composer_library.js'));assert([before.librarySha256,lib.librarySha256].includes(current.librarySha256),'Concurrent bank update');
if(process.argv.includes('--write')){
 const outputs={'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n','composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n','composer_library_manifest.json':JSON.stringify(manifest,null,2)+'\n','faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'};
 for(const [name,value]of Object.entries(outputs))fs.writeFileSync(path.join(data,name),value);
}
fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify({written:process.argv.includes('--write'),returnedToRepair:id,repair:m.repairQuestions.length,bridge:m.bridgeQuestions.length,librarySha256:lib.librarySha256}));
