'use strict';
// Layer the exact Macro whitelist on the immutable approved General/Micro state.
// No historical expectation is discarded or replaced with live source values.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const prior=require('./microeconomics-approved-revisions.js');
const {questionRecords}=require('./composer-integrity-contracts.js');
const root=path.resolve(__dirname,'../../..');
const macroLedger=JSON.parse(fs.readFileSync(path.join(root,'validation_artifacts/question_quality/macroeconomics_consolidated_cleanup_expectations.json'),'utf8'));
const source=execFileSync('git',['show',macroLedger.baselineRef+':build/faculty-build-composer/data/composer_library.js'],{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024});
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),macroLedger.baselineSourceSha256,'Immutable pre-Macro source');
const macroBaselineLibrary=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
prior.assertCurrentLibrary(macroBaselineLibrary);
const baseline=new Map(questionRecords(macroBaselineLibrary).map(r=>[String(r.question.id),r.question]));
const exactScope=JSON.parse(fs.readFileSync(path.join(root,'audit_tools/macroeconomics_cleanup/inputs/baseline.json'),'utf8'));
const target=new Set(exactScope.targets),macroIds=new Set(macroLedger.changedQuestionIds),expected=new Map([...baseline].map(([id,q])=>[id,structuredClone(q)]));
assert.equal(target.size,2179,'Audit-authorized scope');assert.equal(macroIds.size,2123,'Explicit final Macro changed-ID whitelist');
assert.deepEqual(macroLedger.changes.map(c=>c.id).sort(),[...macroIds].sort(),'One change per approved ID');
for(const c of macroLedger.changes){
 assert(target.has(c.id),'Audit authorizes exact ID '+c.id);
 assert(!exactScope.protectedQuestionIDs.includes(c.id),'No General/Micro final-pass edit '+c.id);
 const q=expected.get(c.id);assert(q);
 assert.deepEqual(Object.keys(c.before).sort(),c.fields.slice().sort());assert.deepEqual(Object.keys(c.after).sort(),c.fields.slice().sort());
 for(const f of c.fields)assert.deepEqual(q[f]??null,c.before[f],'Frozen Macro before '+c.id+'.'+f);
 Object.assign(q,c.after);for(const f of c.removedFields)delete q[f];
}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,macroIds.has(String(id))?structuredClone(baseline.get(String(id))):fallback);}
function applyApprovedRevisions(historical){
 const previous=prior.applyApprovedRevisions(historical);if(!previous||!macroIds.has(String(previous.id)))return previous;
 assert.deepEqual(previous,baseline.get(String(previous.id)),'Verified Macro before-state '+previous.id);
 return structuredClone(expected.get(String(previous.id)));
}
function approvedQuestion(id){return macroIds.has(String(id))?structuredClone(expected.get(String(id))):prior.approvedQuestion(id);}
function assertCurrentLibrary(library){
 const records=questionRecords(library);assert.deepEqual([...new Set(records.map(r=>String(r.question.id)))].sort(),[...baseline.keys()].sort(),'All canonical IDs retained');
 for(const r of records)assert.deepEqual(r.question,expected.get(String(r.question.id)),'Exact approved current state '+r.question.id);
 const locations=new Map();
 for(const r of questionRecords(macroBaselineLibrary)){
  const id=String(r.question.id),route=macroLedger.routing.find(x=>x.id===id),move=macroLedger.moves.find(x=>x.id===id&&x.conceptId===r.conceptId&&x.from===r.pool);
  const key=[id,route?.to||r.conceptId,move?.to||r.pool].join('|');locations.set(key,(locations.get(key)||0)+1);
 }
 for(const r of records){const key=[r.question.id,r.conceptId,r.pool].join('|');assert(locations.get(key)>0,'Exact approved location '+key);locations.set(key,locations.get(key)-1);}
 assert([...locations.values()].every(n=>n===0),'All approved storage occurrences retained');
}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...macroIds]),beforeApprovedRevisions,applyApprovedRevisions,approvedQuestion,assertCurrentLibrary,macroLedger,macroBaselineLibrary,macroIds};
