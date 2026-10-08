'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prior=require('./micro-voice-revisions.js'),core=require('../composer-core.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const ledger=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../audit_tools/macro_voice3_20261007/expectations.json'),'utf8'));
const changes=new Map(ledger.changes.map(c=>[c.id,c]));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const tiers=new Map([['P52B-S1-LRPC-L-002',['legendary','hard']]]);
for(const c of changes.values()){
 assert.deepEqual(c.areas,['macro']);assert(!c.marketGateDerived);
 assert(c.fields.every(f=>['q','options','feedback','aHash','difficulty','canonicalDifficulty'].includes(f)),'Authorized fields only: '+c.id);
 const restored=structuredClone(c.afterRecord);for(const f of c.fields)restored[f]=structuredClone(c.beforeRecord[f]);assert.deepEqual(restored,c.beforeRecord);
 if(tiers.has(c.id)){assert.deepEqual([c.beforeRecord.canonicalDifficulty,c.afterRecord.canonicalDifficulty],tiers.get(c.id));assert.equal(c.afterRecord.difficulty,'hard');}
 else for(const f of ['difficulty','canonicalDifficulty'])assert.equal(c.beforeRecord[f],c.afterRecord[f]);
 for(const f of ['instructionalRole','sourcePool','originalSourcePool','checkpointPool','primarySkill','repairSkill','objective','image','imageAlt','graphDescription','graphRequired','requiredConceptIds','modeAllowlist'])assert.deepEqual(c.afterRecord[f],c.beforeRecord[f],'Preserved '+c.id+'.'+f);
 assert.equal(sha(core.normalizeAnswerText(c.beforeRecord.options[c.correctIndex])),c.beforeRecord.aHash);
 assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash);
 assert.equal(new Set(c.afterRecord.options.map(core.normalizeAnswerText)).size,4);
}
assert.deepEqual(ledger.moves.map(m=>m.id).sort(),['P52B-S1-LRPC-L-002']);
function beforeVoice3Library(current){
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored)){const c=changes.get(String(r.question.id));if(c){assert.deepEqual(r.question,c.afterRecord,'Exact approved pass-3 edit '+c.id);for(const f of Object.keys(r.question))delete r.question[f];Object.assign(r.question,structuredClone(c.beforeRecord));seen.add(c.id);}}
 assert.deepEqual([...seen].sort(),[...changes.keys()].sort());
 const restoredMap=new Map(questionRecords(restored).map(r=>[String(r.question.id),r.question]));
 for(const [cid,pools]of Object.entries(ledger.placementsBefore)){
  if(pools===null){assert.equal(current.concepts[cid].questions,undefined);continue;}
  const actual=Object.fromEntries(Object.entries(current.concepts[cid].questions||{}).map(([p,qs])=>[p,qs.map(q=>String(q.id))]));assert.deepEqual(actual,ledger.placementsAfter[cid],'Exact pass-3 placements '+cid);
  restored.concepts[cid].questions=Object.fromEntries(Object.entries(pools).map(([p,ids])=>[p,ids.map(id=>structuredClone(restoredMap.get(id)))]));
 }
 for(const c of ledger.metadataChanges){let o=restored;for(const k of c.path.slice(0,-1))o=o[k];const k=c.path.at(-1);if(Object.hasOwn(c,'before'))o[k]=structuredClone(c.before);else delete o[k];}
 return restored;
}
function assertCurrentLibrary(current){
 assert.equal(current.librarySha256,ledger.afterLibrarySha256);
 const payload=structuredClone(current);delete payload.librarySha256;delete payload.registry.librarySha256;assert.equal(sha(core.stableStringify(payload)),ledger.afterLibrarySha256);
 const restored=beforeVoice3Library(current),beforePayload=structuredClone(restored);delete beforePayload.librarySha256;delete beforePayload.registry.librarySha256;assert.equal(sha(core.stableStringify(beforePayload)),ledger.beforeLibrarySha256);
 prior.assertCurrentLibrary(restored);
}
function applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q||!changes.has(String(q.id)))return q;const c=changes.get(String(q.id));assert.deepEqual(q,c.beforeRecord);return structuredClone(c.afterRecord);}
function approvedQuestion(id){return changes.has(String(id))?structuredClone(changes.get(String(id)).afterRecord):prior.approvedQuestion(id);}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,changes.has(String(id))?structuredClone(changes.get(String(id)).beforeRecord):fallback);}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,beforeApprovedRevisions,beforeVoice3Library,macroVoice3Ledger:ledger};
