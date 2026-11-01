'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {questionRecords}=require('./composer-integrity-contracts.js'),core=require('../composer-core.js');
const ledger=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../audit_tools/easy_pool_review_20261101/expectations.json'),'utf8'));
const changes=new Map(ledger.changes.map(c=>[c.id,c]));
const additions=require('./saving-identity-easy-additions.js');
const quizAdditions=require('./quiz-easy-completion-additions.js');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function beforeEasyPoolReviewLibrary(current){
 current=additions.beforeSavingIdentityAdditions(current);
 if(current.librarySha256===ledger.beforeLibrarySha256)return structuredClone(current);
 assert.equal(current.librarySha256,ledger.afterLibrarySha256);
 const payload=structuredClone(current);delete payload.librarySha256;delete payload.registry.librarySha256;assert.equal(sha(core.stableStringify(payload)),ledger.afterLibrarySha256);
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored)){const c=changes.get(String(r.question.id));if(!c)continue;assert.deepEqual(r.question,c.afterRecord,'Approved easy review '+c.id);for(const f of Object.keys(r.question))delete r.question[f];Object.assign(r.question,structuredClone(c.beforeRecord));seen.add(c.id);}
 assert.deepEqual([...seen].sort(),[...changes.keys()].sort());
 const map=new Map(questionRecords(restored).map(r=>[String(r.question.id),r.question]));
 for(const [cid,pools]of Object.entries(ledger.placementsBefore)){
  assert.deepEqual(Object.fromEntries(Object.entries(current.concepts[cid].questions).map(([p,qs])=>[p,qs.map(q=>String(q.id))])),ledger.placementsAfter[cid]);
  restored.concepts[cid].questions=Object.fromEntries(Object.entries(pools).map(([p,ids])=>[p,ids.map(id=>structuredClone(map.get(id)))]));
 }
 for(const c of ledger.metadataChanges){let obj=restored;for(const k of c.path.slice(0,-1))obj=obj[k];obj[c.path.at(-1)]=structuredClone(c.before);}
 const check=structuredClone(restored);delete check.librarySha256;delete check.registry.librarySha256;assert.equal(sha(core.stableStringify(check)),ledger.beforeLibrarySha256,'All unrelated question data, placements, and metadata preserved');
 return restored;
}
function wrap(prior){
 return {...prior,easyPoolReviewLedger:ledger,beforeEasyPoolReviewLibrary,
  savingIdentityAdditions:additions.ledger.additions,beforeSavingIdentityAdditions:additions.beforeSavingIdentityAdditions,
  approvedAdditions:[...additions.ledger.additions,...quizAdditions.ledger.additions],addedIds:new Set([...additions.addedIds,...quizAdditions.addedIds]),beforeQuizEasyAdditions:quizAdditions.beforeQuizEasyAdditions,
  approvedIds:new Set([...prior.approvedIds,...changes.keys()]),
  assertCurrentLibrary(current){prior.assertCurrentLibrary(beforeEasyPoolReviewLibrary(current));},
  beforeFacultyValidationLibrary(current){return prior.beforeFacultyValidationLibrary(beforeEasyPoolReviewLibrary(current));},
  applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q)return q;const c=changes.get(String(q.id));if(!c)return q;assert.deepEqual(q,c.beforeRecord);return structuredClone(c.afterRecord);},
  approvedQuestion(id){const c=changes.get(String(id));return c?structuredClone(c.afterRecord):prior.approvedQuestion(id);},
  beforeApprovedRevisions(id,fallback){const c=changes.get(String(id));return prior.beforeApprovedRevisions(id,c?structuredClone(c.beforeRecord):fallback);}
 };
}
module.exports={wrap,beforeEasyPoolReviewLibrary,ledger};
