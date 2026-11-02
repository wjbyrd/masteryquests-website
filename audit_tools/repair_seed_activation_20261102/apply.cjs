'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),vm=require('vm');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),load=p=>JSON.parse(fs.readFileSync(p,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),stable=core.stableStringify;
const before=load(path.join(__dirname,'baseline/composer_library.js')),lib=structuredClone(before),changes=[],placementsBefore={},placementsAfter={},metadataChanges=[];
assert.equal(before.librarySha256,'270770556299da4a5fa9695f7d818af4c090f67b1feed67e970fea54de9a4c01');
const ids=new Set(con.questionRecords(before).filter(r=>r.question.instructionalRole==='repairSeed').map(r=>String(r.question.id)));assert.equal(ids.size,15);
const oldRegistry=structuredClone(lib.registry),routes=[];
for(const [cid,m]of Object.entries(lib.concepts)){
 const seeds=m.repairSeedQuestions||[];if(!seeds.length)continue;
 const pools=['repairQuestions','repairSeedQuestions'];placementsBefore[cid]=Object.fromEntries(pools.map(k=>[k,(m[k]||[]).map(q=>String(q.id))]));
 for(const key of ['microSkillRepairPools','skillRepairSeedPools'])metadataChanges.push({path:['concepts',cid,key],before:structuredClone(m[key]||{})});
 for(const q of seeds){assert(ids.has(String(q.id)));const old=structuredClone(q);q.instructionalRole='repair';assert(!(m.repairQuestions||[]).some(r=>r.id===q.id));(m.repairQuestions||=[]).push(q);const correctIndex=q.options.findIndex(o=>sha(core.normalizeAnswerText(o))===q.aHash);assert(correctIndex>=0);changes.push({id:String(q.id),conceptId:cid,beforeRecord:old,afterRecord:structuredClone(q),fields:['instructionalRole'],correctIndex,reason:'Promote the approved seed question into regular Repair and preserve its existing skill route.'});}
 for(const [skill,refs]of Object.entries(m.skillRepairSeedPools||{})){
  const target=(m.microSkillRepairPools||={})[skill]||=[];
  for(const ref of refs){assert(ids.has(String(ref)));if(!target.includes(ref))target.push(ref);routes.push({conceptId:cid,skill,id:String(ref)});}
 }
 m.repairSeedQuestions=[];m.skillRepairSeedPools={};
 placementsAfter[cid]=Object.fromEntries(pools.map(k=>[k,m[k].map(q=>String(q.id))]));
 const entry=lib.registry.concepts.find(e=>e.canonicalConceptId===cid);entry.questionCountByRole.repair=m.repairQuestions.length;entry.questionCountByRole.repairSeed=0;
}
assert.equal(changes.length,15);assert.deepEqual(new Set(routes.map(r=>r.id)),ids);
const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'baseline/faculty-outcomes.js'),'utf8'),context);
const policyBefore=JSON.parse(JSON.stringify(context.module.exports)),policy=structuredClone(policyBefore),coverageChanges=[];
const coverage=(l,cid,o)=>{const c=core.compose(l,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}}),difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,c.banks[k].length]));return {ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+c.banks[k].length,0),repair:c.repairQuestions.length,bridge:c.bridgeQuestions.length,seed:Object.values(c.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode)};};
for(const [cid,p]of Object.entries(policy.concepts)){
 const module=core.resolveConceptModule(before,cid);if(!con.questionRecords({concepts:{[cid]:module}}).some(r=>ids.has(String(r.question.id))))continue;
 for(const o of p.outcomes){const a=coverage(before,cid,o),b=coverage(lib,cid,o);if(stable(a)===stable(b))continue;const unaffected=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!['repair','seed'].includes(k)));assert.deepEqual(unaffected(a),unaffected(b),'Only support coverage changes: '+o.id);assert.equal(o.coverage.repair,a.repair);assert.equal(o.coverage.seed,a.seed);const old=structuredClone(o.coverage);o.coverage={...o.coverage,repair:b.repair,seed:b.seed};coverageChanges.push({id:o.id,before:old,after:o.coverage});}
}
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
const manifest=read(path.join(__dirname,'baseline/composer_library_manifest.json'));manifest.librarySha256=lib.librarySha256;
metadataChanges.push({path:['librarySha256'],before:before.librarySha256},{path:['registry'],before:oldRegistry});
for(const c of metadataChanges)c.after=structuredClone(c.path.reduce((o,k)=>o[k],lib));
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest});
const ledger={schemaVersion:1,beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,changes,supportPlacementsBefore:placementsBefore,supportPlacementsAfter:placementsAfter,metadataChanges,facultyOutcomePolicyBefore:policyBefore,coverageChanges,routes,canonicalCount:9802};
const current=load(path.join(data,'composer_library.js'));assert([before.librarySha256,lib.librarySha256].includes(current.librarySha256),'Concurrent bank update');
if(process.argv.includes('--write')){
 const outputs={'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n','composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n','composer_library_manifest.json':JSON.stringify(manifest,null,2)+'\n','faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'};
 for(const [name,value]of Object.entries(outputs))fs.writeFileSync(path.join(data,name),value);
}
fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify({written:process.argv.includes('--write'),promoted:15,concepts:Object.keys(placementsBefore).length,routes:routes.length,coverageChanges:coverageChanges.length,librarySha256:lib.librarySha256}));
