'use strict';
const assert=require('assert/strict'),crypto=require('crypto'),core=require('../composer-core.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const ledger=require('../../../audit_tools/elite_pool_revision_20261101/expectations.json'),changes=new Map(ledger.changes.map(c=>[c.id,c]));
const hash=l=>{const p=structuredClone(l);delete p.librarySha256;delete p.registry.librarySha256;return crypto.createHash('sha256').update(core.stableStringify(p)).digest('hex');};
function beforeEliteRevisions(current){
 current=require('./review-flags-20261102.js').beforeReviewFlags(current);
 if(current.librarySha256!==ledger.afterLibrarySha256)return current;
 assert.equal(hash(current),ledger.afterLibrarySha256,'Current elite bank checksum');
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored)){const c=changes.get(String(r.question.id));if(!c)continue;assert.deepEqual(r.question,c.afterRecord,'Exact elite revision '+c.id);for(const k of Object.keys(r.question))delete r.question[k];Object.assign(r.question,structuredClone(c.beforeRecord));seen.add(c.id);}
 assert.equal(seen.size,changes.size);
 restored.registry=structuredClone(ledger.metadataChanges.find(c=>c.path[0]==='registry').before);restored.librarySha256=ledger.beforeLibrarySha256;
 assert.equal(hash(restored),ledger.beforeLibrarySha256,'Every non-target field and placement preserved');
 return restored;
}
function wrap(prior){return {...prior,eliteRevisionLedger:ledger,beforeEliteRevisions,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),
 assertCurrentLibrary(current){prior.assertCurrentLibrary(beforeEliteRevisions(current));},
 beforeFacultyValidationLibrary(current){return prior.beforeFacultyValidationLibrary(beforeEliteRevisions(current));},
 applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q)return q;const c=changes.get(String(q.id));if(!c)return q;assert.deepEqual(q,c.beforeRecord);return structuredClone(c.afterRecord);},
 approvedQuestion(id){const c=changes.get(String(id));return c?structuredClone(c.afterRecord):prior.approvedQuestion(id);},
 beforeApprovedRevisions(id,fallback){const c=changes.get(String(id));return prior.beforeApprovedRevisions(id,c?structuredClone(c.beforeRecord):fallback);}
};}
module.exports={ledger,changes,beforeEliteRevisions,wrap};
