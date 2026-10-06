'use strict';
// Exact post-verification layer. The consolidated cleanup and all earlier
// approved snapshots remain immutable and are checked before this layer applies.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const prior=require('./macroeconomics-approved-revisions.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const root=path.resolve(__dirname,'../../..');
const closureLedger=JSON.parse(fs.readFileSync(path.join(root,'validation_artifacts/question_quality/macroeconomics_exception_closure_expectations.json'),'utf8'));
const authorized=JSON.parse(fs.readFileSync(path.join(root,'audit_tools/macroeconomics_exception_closure/inputs/baseline.json'),'utf8'));
const source=execFileSync('git',['show',closureLedger.baselineRef+':build/faculty-build-composer/data/composer_library.js'],{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024});
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),closureLedger.baselineSourceSha256,'Immutable verified Macro baseline');
const closureBaselineLibrary=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
prior.assertCurrentLibrary(closureBaselineLibrary);
const baseline=new Map(questionRecords(closureBaselineLibrary).map(r=>[String(r.question.id),r.question])),closureIds=new Set(closureLedger.changedQuestionIds),expected=new Map([...baseline].map(([id,q])=>[id,structuredClone(q)]));
const retiredScopeSkills={'real-versus-nominal-gdp':{'gdp_welfare_scope':{id:'ECON-NL-NOMINAL-VS-REAL-GDP-6006',replacement:'nominal_vs_real_gdp'}}};
assert.equal(closureIds.size,45,'Exactly 45 post-verification IDs');
assert.deepEqual([...closureIds].sort(),authorized.targets,'Exact user-authorized whitelist');
assert.deepEqual(closureLedger.changes.map(x=>x.id).sort(),authorized.targets,'One explicit revision per authorized ID');
for(const c of closureLedger.changes){
 assert(!authorized.protectedIDs.includes(c.id),'No shared General/Micro revision');
 const q=expected.get(c.id);assert.deepEqual(q,c.beforeRecord,'Frozen full before-record '+c.id);
 assert.deepEqual(Object.keys(c.before).sort(),c.fields.slice().sort());assert.deepEqual(Object.keys(c.after).sort(),c.fields.slice().sort());
 for(const field of c.fields)assert.deepEqual(q[field]??null,c.before[field],'Before field '+c.id+'.'+field);
 Object.assign(q,c.after);for(const field of c.removedFields)delete q[field];
 assert.deepEqual(q,c.afterRecord,'Explicit full after-record '+c.id);
}
// The sole GDP-welfare extension was the misrouted bridge explicitly restored
// to nominal/real GDP. Preserve the legacy engine profile but certify this
// exact curriculum correction; no other missing profile skill is accepted.
const scope=require('../composer-core.js').ContentScope;
for(const[cid,skills]of Object.entries(retiredScopeSkills))for(const[skill,decision]of Object.entries(skills)){
 const oldIds=[...new Set(questionRecords(closureBaselineLibrary).filter(r=>r.conceptId===cid&&scope.skills(r.question).includes(skill)).map(r=>String(r.question.id)))];
 assert.deepEqual(oldIds,[decision.id],'Exact old owner of retired scope skill');
 assert.equal(expected.get(decision.id).primarySkill,decision.replacement);
 assert(!scope.skills(expected.get(decision.id)).includes(skill),'Obsolete welfare label removed from restored GDP bridge');
}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,closureIds.has(String(id))?structuredClone(baseline.get(String(id))):fallback);}
function applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q||!closureIds.has(String(q.id)))return q;assert.deepEqual(q,baseline.get(String(q.id)),'Prior approved state '+q.id);return structuredClone(expected.get(String(q.id)));}
function approvedQuestion(id){return closureIds.has(String(id))?structuredClone(expected.get(String(id))):prior.approvedQuestion(id);}
function assertCurrentLibrary(library){
 const rows=questionRecords(library);assert.deepEqual([...new Set(rows.map(r=>String(r.question.id)))].sort(),[...baseline.keys()].sort(),'Canonical universe retained');
 for(const r of rows)assert.deepEqual(r.question,expected.get(String(r.question.id)),'Exact closure-approved state '+r.question.id);
 const locations=new Map();
 for(const r of questionRecords(closureBaselineLibrary)){const id=String(r.question.id),move=closureLedger.moves.find(m=>m.id===id&&m.conceptId===r.conceptId&&m.from===r.pool);const key=[id,r.conceptId,move?.to||r.pool].join('|');locations.set(key,(locations.get(key)||0)+1);}
 for(const r of rows){const key=[r.question.id,r.conceptId,r.pool].join('|');assert(locations.get(key)>0,'Exact closure-approved location '+key);locations.set(key,locations.get(key)-1);}assert([...locations.values()].every(n=>n===0),'No missing canonical placement');
 for(const[cid,m]of Object.entries(closureBaselineLibrary.concepts))for(const key of ['directSkillRepairRoutes','microSkillRepairPools','skillRepairSeedPools','microSkillBridgePools']){
  const change=closureLedger.routingChanges.filter(x=>x.concept===cid&&x.map===key).at(-1);
  assert.deepEqual(library.concepts[cid][key],change?change.after:m[key],'Exact support route map '+cid+'/'+key);
 }
}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...closureIds]),beforeApprovedRevisions,applyApprovedRevisions,approvedQuestion,assertCurrentLibrary,closureLedger,closureBaselineLibrary,closureIds,retiredScopeSkills};
