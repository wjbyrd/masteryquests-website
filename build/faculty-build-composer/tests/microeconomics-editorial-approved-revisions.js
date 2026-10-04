'use strict';
// Exact 672-item Micro wording and graph repair layer. Earlier approved snapshots remain immutable.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const prior=require('./general-economics-construct-approved-revisions.js');
const {questionRecords}=require('./composer-integrity-contracts.js');
const root=path.resolve(__dirname,'../../..'),dir=path.join(root,'audit_tools/microeconomics_wording_graph_cleanup_20261003');
const ledger=JSON.parse(fs.readFileSync(path.join(dir,'expectations.json'),'utf8'));
const worklist=JSON.parse(fs.readFileSync(path.join(dir,'worklist.json'),'utf8'));
const ids=new Set(Object.keys(worklist.records));
assert.equal(ids.size,672,'Exact Micro cleanup worklist');
assert.deepEqual(ledger.authorizedIds,[...ids].sort());
assert.deepEqual(ledger.changes.map(r=>r.id),[...ids].sort(),'One final change per ID');
const source=execFileSync('git',['show',ledger.baselineRef+':build/faculty-build-composer/data/composer_library.js'],{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024});
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),ledger.baselineSourceSha256,'Frozen pre-editorial source');
assert.equal(ledger.baselineSourceSha256,worklist.preservation_checks.source_sha256_after,'Audit and implementation baseline agree');
const library=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
prior.assertCurrentLibrary(library);
const baseline=new Map(questionRecords(library).map(r=>[String(r.question.id),r.question]));
const changes=new Map(ledger.changes.map(c=>[c.id,c]));
for(const c of ledger.changes){
 assert.deepEqual(c.originalRecord,baseline.get(c.id),'Frozen original '+c.id);
 assert.deepEqual(c.beforeRecord,baseline.get(c.id),'Exact before state '+c.id);
 const fields=[...new Set([...Object.keys(c.beforeRecord),...Object.keys(c.afterRecord)])].filter(k=>JSON.stringify(c.beforeRecord[k])!==JSON.stringify(c.afterRecord[k]));
 assert.deepEqual(fields.slice().sort(),c.fields.slice().sort());
 assert(fields.every(k=>['q','options','feedback','aHash'].includes(k)),'Editorial fields only '+c.id);
 assert.deepEqual({...c.afterRecord,...Object.fromEntries(fields.map(k=>[k,c.beforeRecord[k]]))},c.beforeRecord,'All other fields preserved '+c.id);
}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,ids.has(String(id))?structuredClone(baseline.get(String(id))):fallback);}
function applyApprovedRevisions(historical){
 const q=prior.applyApprovedRevisions(historical);if(!q||!ids.has(String(q.id)))return q;
 const c=changes.get(String(q.id));assert.deepEqual(q,c.beforeRecord,'Prior approved state '+q.id);return structuredClone(c.afterRecord);
}
function approvedQuestion(id){return ids.has(String(id))?structuredClone(changes.get(String(id)).afterRecord):prior.approvedQuestion(id);}
function assertCurrentLibrary(current){
 const projected=structuredClone(current),seen=new Set();
 for(const r of questionRecords(projected))if(ids.has(String(r.question.id))){
  const c=changes.get(String(r.question.id));assert.deepEqual(r.question,c.afterRecord,'Exact approved editorial state '+c.id);
  Object.assign(r.question,structuredClone(c.beforeRecord));seen.add(c.id);
 }
 assert.deepEqual([...seen].sort(),[...ids].sort(),'No editorial target missing');
 prior.assertCurrentLibrary(projected);
}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...ids]),beforeApprovedRevisions,applyApprovedRevisions,approvedQuestion,assertCurrentLibrary,microEditorialLedger:ledger};
