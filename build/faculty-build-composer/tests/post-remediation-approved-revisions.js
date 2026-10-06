'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prior=require('./faculty-micro-remediation-approved-revisions.js'),core=require('../composer-core.js');
const {questionRecords}=require('./composer-integrity-contracts.js');
const dir=path.resolve(__dirname,'../../../audit_tools/micro_post_remediation_20261006');
const ledger=JSON.parse(fs.readFileSync(path.join(dir,'expectations.json'),'utf8'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),stable=core.stableStringify;
const source=fs.readFileSync(path.join(dir,'baseline/build/faculty-build-composer/data/composer_library.js'),'utf8');
const baseline=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
assert.equal(baseline.librarySha256,'c651fbb3a908b1fc27fd8bc9e23c415430d934ef0a52299442736d757c47b210');
const changes=new Map(ledger.changes.map(c=>[c.id,c]));
assert.equal(changes.size,19);
for(const c of changes.values()){
 for(const f of ['primarySkill','repairSkill','objective','secondaryConceptIds','instructionalRole','sourcePool','originalSourcePool','originalBossTier','sourceHash','sourceOccurrences','checkpointPool','modeAllowlist','requiredConceptIds'])assert.deepEqual(c.afterRecord[f],c.beforeRecord[f],'Protected '+c.id+'.'+f);
 assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash);
 assert.equal(new Set(c.afterRecord.options.map(core.normalizeAnswerText)).size,4);
}
function assertCurrentLibrary(current){
 assert.equal(current.librarySha256,ledger.afterLibrarySha256);
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored))if(changes.has(String(r.question.id))){const c=changes.get(String(r.question.id));assert.deepEqual(r.question,c.afterRecord,'Exact faculty revision '+c.id);for(const k of Object.keys(r.question))delete r.question[k];Object.assign(r.question,structuredClone(c.beforeRecord));seen.add(c.id);}
 assert.deepEqual([...seen].sort(),[...changes.keys()].sort());
 const restoredMap=new Map(questionRecords(restored).map(r=>[String(r.question.id),r.question]));
 for(const [cid,pools]of Object.entries(ledger.placementsBefore)){
  if(pools===null){assert.equal(current.concepts[cid].questions,undefined);continue;}
  const actual=Object.fromEntries(Object.entries(current.concepts[cid].questions||{}).map(([p,qs])=>[p,qs.map(q=>String(q.id))]));assert.deepEqual(actual,ledger.placementsAfter[cid],'Exact faculty placements '+cid);
  restored.concepts[cid].questions=Object.fromEntries(Object.entries(pools).map(([p,ids])=>[p,ids.map(id=>{assert(restoredMap.has(id));return structuredClone(restoredMap.get(id));})]));
 }
 for(const c of ledger.metadataChanges){let o=restored;for(const k of c.path.slice(0,-1))o=o[k];const k=c.path.at(-1);if(Object.hasOwn(c,'before'))o[k]=structuredClone(c.before);else delete o[k];}
 assert.deepEqual(restored,baseline,'No unapproved field or routing changes');
 const payload=structuredClone(restored);delete payload.librarySha256;delete payload.registry.librarySha256;assert.equal(sha(stable(payload)),ledger.beforeLibrarySha256);
 prior.assertCurrentLibrary(restored);
}
function applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q||!changes.has(String(q.id)))return q;const c=changes.get(String(q.id));assert.deepEqual(q,c.beforeRecord);return structuredClone(c.afterRecord);}
function approvedQuestion(id){return changes.has(String(id))?structuredClone(changes.get(String(id)).afterRecord):prior.approvedQuestion(id);}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,changes.has(String(id))?structuredClone(changes.get(String(id)).beforeRecord):fallback);}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,beforeApprovedRevisions,postRemediationLedger:ledger};
