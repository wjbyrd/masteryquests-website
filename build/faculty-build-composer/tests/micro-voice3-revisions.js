'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const prior=require('./macro-voice3-revisions.js'),core=require('../composer-core.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const ledger=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../audit_tools/micro_voice3_20261007/expectations.json'),'utf8'));
const changes=new Map(ledger.changes.map(c=>[c.id,c])),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
assert.equal(changes.size,94);assert.deepEqual(ledger.moves,[]);
for(const c of changes.values()){
 assert.deepEqual(c.areas,['micro']);assert(!c.marketGateDerived);assert(c.fields.every(f=>['q','options','feedback','aHash'].includes(f)));
 const restored=structuredClone(c.afterRecord);for(const f of c.fields)restored[f]=structuredClone(c.beforeRecord[f]);assert.deepEqual(restored,c.beforeRecord);
 for(const q of [c.beforeRecord,c.afterRecord]){const keys=q.options.map((s,i)=>sha(core.normalizeAnswerText(s))===q.aHash?i:-1).filter(i=>i>=0);assert.deepEqual(keys,[c.correctIndex]);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);}
}
function beforeMicroVoice3Library(current){
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored)){const c=changes.get(String(r.question.id));if(c){assert.deepEqual(r.question,c.afterRecord,'Exact approved Micro pass-3 edit '+c.id);for(const f of Object.keys(r.question))delete r.question[f];Object.assign(r.question,structuredClone(c.beforeRecord));seen.add(c.id);}}
 assert.deepEqual([...seen].sort(),[...changes.keys()].sort());
 restored.librarySha256=ledger.beforeLibrarySha256;restored.registry.librarySha256=ledger.beforeLibrarySha256;return restored;
}
function assertCurrentLibrary(current){
 assert.equal(current.librarySha256,ledger.afterLibrarySha256);const payload=structuredClone(current);delete payload.librarySha256;delete payload.registry.librarySha256;assert.equal(sha(core.stableStringify(payload)),ledger.afterLibrarySha256);
 const restored=beforeMicroVoice3Library(current),b=structuredClone(restored);delete b.librarySha256;delete b.registry.librarySha256;assert.equal(sha(core.stableStringify(b)),ledger.beforeLibrarySha256);prior.assertCurrentLibrary(restored);
}
function applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q||!changes.has(String(q.id)))return q;const c=changes.get(String(q.id));assert.deepEqual(q,c.beforeRecord);return structuredClone(c.afterRecord);}
function approvedQuestion(id){return changes.has(String(id))?structuredClone(changes.get(String(id)).afterRecord):prior.approvedQuestion(id);}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,changes.has(String(id))?structuredClone(changes.get(String(id)).beforeRecord):fallback);}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,beforeApprovedRevisions,beforeMicroVoice3Library,microVoice3Ledger:ledger};
