'use strict';
// Bounded 3-ID graph-assessment closure approval. Reconstruct the exact pre-cleanup library
// before running every earlier approval, including the two Micro deletions.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prior=require('./macroeconomics-student-wording-approved-revisions.js');
const core=require('../composer-core.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const dir=path.resolve(__dirname,'../../../audit_tools/macroeconomics_graph_surgical_closure_20261004');
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
const ledger=read('expectations.json'),scope=read('scope.json'),originals=read('originals.json');
const ids=new Set(scope.authorized_union),changes=new Map(ledger.changes.map(c=>[c.id,c]));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
assert.equal(ids.size,3);
assert.deepEqual(ledger.authorizedIds,[...ids].sort());
assert.deepEqual(ledger.changes.map(c=>c.id),ledger.authorizedIds);
assert.equal(ledger.beforeLibrarySha256,scope.beforeLibrarySha256);
const replace=(target,value)=>{for(const k of Object.keys(target))delete target[k];Object.assign(target,structuredClone(value));};
for(const c of changes.values()){
 assert.deepEqual(c.beforeRecord,originals[c.id]);
 const fields=[...new Set([...Object.keys(c.beforeRecord),...Object.keys(c.afterRecord)])].filter(k=>JSON.stringify(c.beforeRecord[k])!==JSON.stringify(c.afterRecord[k]));
 assert.deepEqual(fields.slice().sort(),c.fields.slice().sort());
 assert(fields.every(k=>['q','options','feedback','aHash'].includes(k)));
 const restored=structuredClone(c.afterRecord);
 for(const k of fields){if(Object.hasOwn(c.beforeRecord,k))restored[k]=c.beforeRecord[k];else delete restored[k];}
 assert.deepEqual(restored,c.beforeRecord,'Metadata preserved '+c.id);
 if(fields.some(k=>['image','imageAlt','graphDescription','graphRequired','graphImageMetadata'].includes(k))){
  assert.equal(c.review.decision,'CONVERT TO TEXT-ONLY');
  assert.equal(c.afterRecord.graphRequired,false);assert(!c.afterRecord.image);
 }
 assert.equal(c.afterRecord.options.length,4);
 assert.equal(new Set(c.afterRecord.options.map(core.normalizeAnswerText)).size,4);
 assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash);
}
function assertCurrentLibrary(current){
 assert.equal(current.librarySha256,ledger.afterLibrarySha256,'Approved current Macro library hash');
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored))if(ids.has(String(r.question.id))){
  const c=changes.get(String(r.question.id));assert.deepEqual(r.question,c.afterRecord,'Exact Macro approved state '+c.id);
  replace(r.question,c.beforeRecord);seen.add(c.id);
 }
 assert.deepEqual([...seen].sort(),ledger.authorizedIds);
 delete restored.librarySha256;delete restored.registry.librarySha256;
 const hash=sha(core.stableStringify(restored));
 assert.equal(hash,scope.beforeLibrarySha256,'All unrelated records, placements, metadata, assets and routes preserved');
 restored.librarySha256=hash;restored.registry.librarySha256=hash;
 prior.assertCurrentLibrary(restored);
}
function applyApprovedRevisions(historical){
 const q=prior.applyApprovedRevisions(historical);if(!q||!ids.has(String(q.id)))return q;
 const c=changes.get(String(q.id));assert.deepEqual(q,c.beforeRecord,'Prior approved state '+q.id);return structuredClone(c.afterRecord);
}
function approvedQuestion(id){return ids.has(String(id))?structuredClone(changes.get(String(id)).afterRecord):prior.approvedQuestion(id);}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,ids.has(String(id))?structuredClone(changes.get(String(id)).beforeRecord):fallback);}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...ids]),assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,beforeApprovedRevisions,macroGraphClosureLedger:ledger};
