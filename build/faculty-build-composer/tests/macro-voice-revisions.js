'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prior=require('./macro-closure-revisions.js'),core=require('../composer-core.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const ledger=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../audit_tools/macro_voice_20261006/expectations.json'),'utf8'));
const changes=new Map(ledger.changes.map(c=>[c.id,c]));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const c of changes.values()){
 assert(c.areas.includes('macro')&&!c.areas.includes('micro'));
 assert(c.fields.every(f=>['q','options','feedback','aHash'].includes(f)),'Editorial fields only: '+c.id);
 const restored=structuredClone(c.afterRecord);for(const f of c.fields)restored[f]=structuredClone(c.beforeRecord[f]);assert.deepEqual(restored,c.beforeRecord);
 assert.equal(sha(core.normalizeAnswerText(c.beforeRecord.options[c.correctIndex])),c.beforeRecord.aHash);
 assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash);
 assert.equal(new Set(c.afterRecord.options.map(core.normalizeAnswerText)).size,4);
}
function beforeVoiceLibrary(current){
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored)){const c=changes.get(String(r.question.id));if(c){assert.deepEqual(r.question,c.afterRecord,'Exact approved voice edit '+c.id);for(const f of Object.keys(r.question))delete r.question[f];Object.assign(r.question,structuredClone(c.beforeRecord));seen.add(c.id);}}
 assert.deepEqual([...seen].sort(),[...changes.keys()].sort());
 restored.librarySha256=ledger.beforeLibrarySha256;restored.registry.librarySha256=ledger.beforeLibrarySha256;return restored;
}
function assertCurrentLibrary(current){assert.equal(current.librarySha256,ledger.afterLibrarySha256);const payload=structuredClone(current);delete payload.librarySha256;delete payload.registry.librarySha256;assert.equal(sha(core.stableStringify(payload)),ledger.afterLibrarySha256);prior.assertCurrentLibrary(beforeVoiceLibrary(current));}
function applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q||!changes.has(String(q.id)))return q;const c=changes.get(String(q.id));assert.deepEqual(q,c.beforeRecord);return structuredClone(c.afterRecord);}
function approvedQuestion(id){return changes.has(String(id))?structuredClone(changes.get(String(id)).afterRecord):prior.approvedQuestion(id);}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,changes.has(String(id))?structuredClone(changes.get(String(id)).beforeRecord):fallback);}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,beforeApprovedRevisions,beforeVoiceLibrary,macroVoiceLedger:ledger};
