'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),core=require('../composer-core.js');
const ledger=require('../../../audit_tools/saving_identity_easy_20261101/expectations.json');
const addedIds=new Set(ledger.additions.map(a=>a.question.id));
const hash=l=>{const p=structuredClone(l);delete p.librarySha256;delete p.registry.librarySha256;return crypto.createHash('sha256').update(core.stableStringify(p)).digest('hex');};
function beforeSavingIdentityAdditions(current){
 if(current.librarySha256!==ledger.afterLibrarySha256)return current;
 assert.equal(hash(current),ledger.afterLibrarySha256,'Current bank checksum');
 const restored=structuredClone(current);
 for(const a of ledger.additions){
  const pool=restored.concepts[a.conceptId].questions[a.pool],matches=pool.filter(q=>String(q.id)===a.question.id);
  assert.equal(matches.length,1);assert.deepEqual(matches[0],a.question,'Exact authorized addition '+a.question.id);
  restored.concepts[a.conceptId].questions[a.pool]=pool.filter(q=>String(q.id)!==a.question.id);
 }
 restored.registry=structuredClone(ledger.registryBefore);restored.canonicalQuestionCount=ledger.beforeCanonicalCount;restored.librarySha256=ledger.beforeLibrarySha256;
 assert.equal(hash(restored),ledger.beforeLibrarySha256,'All pre-existing questions, routes, and unrelated metadata preserved');
 return restored;
}
module.exports={ledger,addedIds,beforeSavingIdentityAdditions};
