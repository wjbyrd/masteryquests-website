'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const prior=require('./micro-voice3-revisions.js'),core=require('../composer-core.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const ledger=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../audit_tools/faculty_remediation_20261008/expectations.json'),'utf8'));
const changes=new Map(ledger.changes.map(c=>[c.id,c])),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
assert.equal(changes.size,175);assert.equal(ledger.moves.length,7);
for(const c of changes.values()){
 assert(c.areas.some(a=>a==='micro'||a==='macro'));assert(c.fields.every(f=>['q','options','feedback','aHash','canonicalDifficulty','checkpointPool'].includes(f)));
 const restored=structuredClone(c.afterRecord);for(const f of c.fields){if(Object.hasOwn(c.beforeRecord,f))restored[f]=structuredClone(c.beforeRecord[f]);else delete restored[f];}assert.deepEqual(restored,c.beforeRecord);
 if(c.fields.includes('checkpointPool'))assert.equal(c.afterRecord.checkpointPool,c.beforeRecord.sourcePool);
 for(const q of [c.beforeRecord,c.afterRecord]){const keys=q.options.map((s,i)=>sha(core.normalizeAnswerText(s))===q.aHash?i:-1).filter(i=>i>=0);assert.deepEqual(keys,[c.correctIndex]);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);}
}
function beforeFacultyValidationLibrary(current){
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored)){const c=changes.get(String(r.question.id));if(c){assert.deepEqual(r.question,c.afterRecord,'Exact approved faculty validation edit '+c.id);for(const f of Object.keys(r.question))delete r.question[f];Object.assign(r.question,structuredClone(c.beforeRecord));seen.add(c.id);}}
 assert.deepEqual([...seen].sort(),[...changes.keys()].sort());
 const map=new Map(questionRecords(restored).map(r=>[String(r.question.id),r.question]));
 for(const [cid,pools]of Object.entries(ledger.placementsBefore)){
  assert.deepEqual(Object.fromEntries(Object.entries(current.concepts[cid].questions).map(([p,qs])=>[p,qs.map(q=>String(q.id))])),ledger.placementsAfter[cid]);
  restored.concepts[cid].questions=Object.fromEntries(Object.entries(pools).map(([p,ids])=>[p,ids.map(id=>structuredClone(map.get(id)))]));
 }
 for(const c of ledger.metadataChanges){let o=restored;for(const k of c.path.slice(0,-1))o=o[k];o[c.path.at(-1)]=structuredClone(c.before);}
 return restored;
}
function assertCurrentLibrary(current){
 assert.equal(current.librarySha256,ledger.afterLibrarySha256);const payload=structuredClone(current);delete payload.librarySha256;delete payload.registry.librarySha256;assert.equal(sha(core.stableStringify(payload)),ledger.afterLibrarySha256);
 const restored=beforeFacultyValidationLibrary(current),b=structuredClone(restored);delete b.librarySha256;delete b.registry.librarySha256;assert.equal(sha(core.stableStringify(b)),ledger.beforeLibrarySha256);prior.assertCurrentLibrary(restored);
}
function applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q||!changes.has(String(q.id)))return q;const c=changes.get(String(q.id));assert.deepEqual(q,c.beforeRecord);return structuredClone(c.afterRecord);}
function approvedQuestion(id){return changes.has(String(id))?structuredClone(changes.get(String(id)).afterRecord):prior.approvedQuestion(id);}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,changes.has(String(id))?structuredClone(changes.get(String(id)).beforeRecord):fallback);}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,beforeApprovedRevisions,beforeFacultyValidationLibrary,facultyValidationLedger:ledger};
