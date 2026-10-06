'use strict';
// Preserve every historical approval; restore only the two authorized deletions
// for the older snapshot assertions, after checking the current exact state.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prior=require('./microeconomics-second-polish-approved-revisions.js'),core=require('../composer-core.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const ledger=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../audit_tools/microeconomics_duplicate_deletions_20261003/deletions.json'),'utf8'));
const deletedIds=new Set(ledger.authorizedDeletedIds);
assert.deepEqual([...deletedIds].sort(),['42660','42697']);
function assertCurrentLibrary(current){
 assert.equal(current.librarySha256,ledger.afterLibrarySha256,'Exact approved post-deletion library');
 assert(questionRecords(current).every(r=>!deletedIds.has(String(r.question.id))),'Deleted IDs must be absent');
 const restored=structuredClone(current);
 for(const r of [...ledger.removed].sort((a,b)=>a.index-b.index))restored.concepts[r.conceptId].questions[r.pool].splice(r.index,0,structuredClone(r.record));
 for(const m of ledger.metadata){let target=restored;for(const k of m.path.slice(0,-1))target=target[k];const key=m.path.at(-1);assert.deepEqual(target[key],m.after,'Deletion-derived metadata '+m.path.join('.'));target[key]=m.before;}
 delete restored.librarySha256;delete restored.registry.librarySha256;
 const hash=crypto.createHash('sha256').update(core.stableStringify(restored)).digest('hex');
 assert.equal(hash,ledger.beforeLibrarySha256,'All unrelated content, ordering, routing and metadata preserved');
 restored.librarySha256=hash;restored.registry.librarySha256=hash;prior.assertCurrentLibrary(restored);
}
function applyApprovedRevisions(q){return q&&deletedIds.has(String(q.id))?undefined:prior.applyApprovedRevisions(q);}
function approvedQuestion(id){return deletedIds.has(String(id))?undefined:prior.approvedQuestion(id);}
module.exports={...prior,assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,deletedIds,deletionLedger:ledger};
