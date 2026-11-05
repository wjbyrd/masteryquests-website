'use strict';
const assert=require('assert/strict'),crypto=require('crypto'),core=require('../composer-core.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const ledger=require('../../../audit_tools/principles_scope_20261104/expectations.json'),changes=new Map(ledger.changes.map(c=>[c.id,c]));
const hash=l=>{const p=structuredClone(l);delete p.librarySha256;delete p.registry.librarySha256;return crypto.createHash('sha256').update(core.stableStringify(p)).digest('hex');};
function beforePrinciplesScope(current){
 if(current.librarySha256!==ledger.afterLibrarySha256)return current;
 assert.equal(hash(current),ledger.afterLibrarySha256);
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored)){const c=changes.get(String(r.question.id));if(!c)continue;assert.deepEqual(r.question,c.afterRecord);for(const k of Object.keys(r.question))delete r.question[k];Object.assign(r.question,structuredClone(c.beforeRecord));seen.add(c.id);}
 assert.equal(seen.size,changes.size);
 const map=new Map(questionRecords(restored).map(r=>[String(r.question.id),r.question]));
 for(const [cid,pools]of Object.entries(ledger.placementsBefore)){
  assert.deepEqual(Object.fromEntries(Object.entries(current.concepts[cid].questions).map(([p,qs])=>[p,qs.map(q=>String(q.id))])),ledger.placementsAfter[cid]);
  restored.concepts[cid].questions=Object.fromEntries(Object.entries(pools).map(([p,ids])=>[p,ids.map(id=>structuredClone(map.get(id)))]));
 }
 for(const c of ledger.metadataChanges){let obj=restored;for(const k of c.path.slice(0,-1))obj=obj[k];if(c.absentBefore)delete obj[c.path.at(-1)];else obj[c.path.at(-1)]=structuredClone(c.before);}
 assert.equal(hash(restored),ledger.beforeLibrarySha256,'All non-target content, placements, and metadata preserved');
 return restored;
}
function wrap(prior){return {...prior,principlesScopeLedger:ledger,beforePrinciplesScope,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),
 assertCurrentLibrary(current){prior.assertCurrentLibrary(beforePrinciplesScope(current));},
 beforeFacultyValidationLibrary(current){return prior.beforeFacultyValidationLibrary(beforePrinciplesScope(current));},
 applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q)return q;const c=changes.get(String(q.id));if(!c)return q;assert.deepEqual(q,c.beforeRecord);return structuredClone(c.afterRecord);},
 approvedQuestion(id){const c=changes.get(String(id));return c?structuredClone(c.afterRecord):prior.approvedQuestion(id);},
 beforeApprovedRevisions(id,fallback){const c=changes.get(String(id));return prior.beforeApprovedRevisions(id,c?structuredClone(c.beforeRecord):fallback);}
};}
module.exports={ledger,changes,beforePrinciplesScope,wrap};
