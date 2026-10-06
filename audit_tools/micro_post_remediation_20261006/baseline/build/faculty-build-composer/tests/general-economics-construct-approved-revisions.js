'use strict';
// Exact 38-item construct restoration layer. Earlier approved snapshots remain immutable.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const prior=require('./general-economics-editorial-approved-revisions.js');
const {questionRecords}=require('./composer-integrity-contracts.js');
const root=path.resolve(__dirname,'../../..'),dir=path.join(root,'audit_tools/general_economics_graph_construct_closure_20261003');
const ledger=JSON.parse(fs.readFileSync(path.join(dir,'expectations.json'),'utf8'));
const worklist=JSON.parse(fs.readFileSync(path.join(dir,'review.json'),'utf8'));
const ids=new Set(worklist.flags.map(r=>r.question_id));
assert.equal(ids.size,38,'Exact construct-closure worklist');
assert.deepEqual(ledger.authorizedIds,[...ids].sort());
assert.deepEqual(ledger.changes.map(r=>r.id),[...ids].sort(),'One final change per ID');
const source=execFileSync('git',['show',ledger.baselineRef+':build/faculty-build-composer/data/composer_library.js'],{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024});
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),ledger.baselineSourceSha256,'Frozen pre-editorial source');
assert.equal(ledger.baselineSourceSha256,worklist.source_sha256,'Audit and implementation baseline agree');
const library=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
prior.assertCurrentLibrary(library);
const baseline=new Map(questionRecords(library).map(r=>[String(r.question.id),r.question]));
const changes=new Map(ledger.changes.map(c=>[c.id,c]));
for(const c of ledger.changes){
 const proposal=worklist.flags.find(r=>r.question_id===c.id);
 assert.deepEqual(c.originalRecord,proposal.original,'Original pre-cleanup task '+c.id);
 assert.deepEqual(c.beforeRecord,proposal.current,'Reviewed drift state '+c.id);
 assert.deepEqual(c.afterRecord.options,proposal.proposed_choices,'Exact proposed alternatives '+c.id);
 assert.equal(c.correctIndex,'ABCD'.indexOf(proposal.proposed_key),'Preserved proposed keyed position '+c.id);
 const cueIds=new Set(['40001','40008','ECON-MG-LEGENDARY-9004','ECON-MG-MEDIUM-157','PG1-DMD-H-001','PG1-DMD-L-001','PG1-SUP-H-001']);
 assert.equal(c.afterRecord.q,(cueIds.has(c.id)?'Use the graph. ':'')+proposal.proposed_stem,'Exact proposed task with recorded graph cue '+c.id);
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
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...ids]),beforeApprovedRevisions,applyApprovedRevisions,approvedQuestion,assertCurrentLibrary,constructLedger:ledger};
