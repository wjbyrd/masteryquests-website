'use strict';
// Exact 361-ID authorization for the live-playthrough graph remediation.
// Restore all questions, pool placements and derived asset/count metadata before
// invoking the complete earlier approval chain. This is not a snapshot bypass.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prior=require('./microeconomics-student-wording-approved-revisions.js');
const core=require('../composer-core.js'),{questionRecords}=require('./composer-integrity-contracts.js');
const dir=path.resolve(__dirname,'../../../audit_tools/graph_assessment_live_playthrough_remediation_20261004');
const ledger=JSON.parse(fs.readFileSync(path.join(dir,'expectations.json'),'utf8'));
const scope=JSON.parse(fs.readFileSync(path.join(dir,'scope.json'),'utf8'));
const originals=JSON.parse(fs.readFileSync(path.join(dir,'originals.json'),'utf8'));
const changes=new Map(ledger.changes.map(c=>[c.id,c])),authorized=new Set(scope.authorized_ids);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
assert.equal(scope.historical_recovered,356);assert.equal(authorized.size,361);
assert.deepEqual(ledger.authorizedIds,scope.authorized_ids);
for(const c of changes.values()){
 assert(authorized.has(c.id));assert.deepEqual(c.beforeRecord,originals[c.id]);
 assert(c.fields.every(f=>['q','options','feedback','aHash','a','difficulty','canonicalDifficulty','type','image','imageAlt','graphDescription','graphRequired','checkpointPool'].includes(f)),'Bounded fields '+c.id);
 if(c.fields.includes('checkpointPool')){
  assert.notEqual(c.beforeRecord.canonicalDifficulty,c.afterRecord.canonicalDifficulty);
  const pools=Object.values(ledger.placementsBefore).filter(Boolean).flatMap(p=>Object.entries(p).filter(([,ids])=>ids.includes(c.id)).map(([pool])=>pool));
  assert(pools.includes('boss')||pools.includes('legendaryBoss'));
  assert.equal(c.afterRecord.checkpointPool,pools.includes('legendaryBoss')?'legendaryBoss':{easy:'easyBoss',medium:'mediumBoss',hard:'finalBoss'}[c.beforeRecord.canonicalDifficulty]);
 }
 const restored=structuredClone(c.afterRecord);
 for(const f of c.fields){if(Object.hasOwn(c.beforeRecord,f))restored[f]=c.beforeRecord[f];else delete restored[f];}
 assert.deepEqual(restored,c.beforeRecord,'All other question metadata unchanged '+c.id);
 assert.equal(c.afterRecord.options.length,4);assert.equal(new Set(c.afterRecord.options.map(core.normalizeAnswerText)).size,4);
 assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash,'Normal answer hash '+c.id);
}
for(const m of ledger.moves){assert(authorized.has(m.id));assert(['easy','medium','hard','elite','legendary'].includes(m.from)&&['easy','medium','hard','elite','legendary'].includes(m.to),'Only ordinary pools move');}
for(const c of ledger.metadataChanges){
 const p=c.path;
 assert(p[0]==='librarySha256'||p[0]==='assetInventory'||(p[0]==='registry'&&['librarySha256','concepts'].includes(p[1]))||(p[0]==='concepts'&&['assets','assetPaths','assetMetadata'].includes(p[2])),'Derived metadata only '+p.join('.'));
 if(p[0]==='registry'&&p[1]==='concepts'){
  assert.equal(c.before.length,c.after.length);
  for(let i=0;i<c.before.length;i++){
   const old=c.before[i],now=structuredClone(c.after[i]);
   for(const f of ['questionCountByDifficulty','questionCountByRole','calculationCoverage','runtimeAdaptiveCounts']){if(Object.hasOwn(old,f))now[f]=old[f];else delete now[f];}
   assert.deepEqual(now,old,'Registry routing/outcomes unchanged '+old.canonicalConceptId);
  }
 }
}
const replace=(t,v)=>{for(const k of Object.keys(t))delete t[k];Object.assign(t,structuredClone(v));};
function assertCurrentLibrary(current){
 assert.equal(current.librarySha256,ledger.afterLibrarySha256);
 const restored=structuredClone(current),seen=new Set();
 for(const r of questionRecords(restored))if(changes.has(String(r.question.id))){const c=changes.get(String(r.question.id));assert.deepEqual(r.question,c.afterRecord,'Approved graph closure '+c.id);replace(r.question,c.beforeRecord);seen.add(c.id);}
 assert.deepEqual([...seen].sort(),[...changes.keys()].sort());
 for(const [cid,pools]of Object.entries(ledger.placementsBefore)){
  if(pools===null){assert.equal(current.concepts[cid].questions,undefined,'Derived views remain unstored '+cid);continue;}
  const m=restored.concepts[cid],byId=new Map(Object.values(m.questions||{}).flat().map(q=>[String(q.id),q]));
  const actual=Object.fromEntries(Object.entries(current.concepts[cid].questions||{}).map(([p,qs])=>[p,qs.map(q=>String(q.id))]));
  assert.deepEqual(actual,ledger.placementsAfter[cid],'Exact ordinary-pool moves '+cid);
  m.questions=Object.fromEntries(Object.entries(pools).map(([p,ids])=>[p,ids.map(id=>{assert(byId.has(id));return byId.get(id);})]));
 }
 for(const c of ledger.metadataChanges){let obj=restored;for(const p of c.path.slice(0,-1))obj=obj[p];const k=c.path.at(-1);if(Object.hasOwn(c,'before'))obj[k]=structuredClone(c.before);else delete obj[k];}
 const payload=structuredClone(restored);delete payload.librarySha256;delete payload.registry.librarySha256;
 assert.equal(sha(core.stableStringify(payload)),ledger.beforeLibrarySha256,'Exact restoration of every unrelated field and placement');
 prior.assertCurrentLibrary(restored);
}
function applyApprovedRevisions(historical){const q=prior.applyApprovedRevisions(historical);if(!q||!changes.has(String(q.id)))return q;const c=changes.get(String(q.id));assert.deepEqual(q,c.beforeRecord);return structuredClone(c.afterRecord);}
function approvedQuestion(id){return changes.has(String(id))?structuredClone(changes.get(String(id)).afterRecord):prior.approvedQuestion(id);}
function beforeApprovedRevisions(id,fallback){return prior.beforeApprovedRevisions(id,changes.has(String(id))?structuredClone(changes.get(String(id)).beforeRecord):fallback);}
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,beforeApprovedRevisions,graphPlaythroughLedger:ledger};
