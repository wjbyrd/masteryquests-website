'use strict';
// Exact faculty workbook authorization. Validate this revision, then restore
// every changed record, placement and derived field for the full prior chain.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prior=require('./graph-playthrough-approved-revisions.js'),core=require('../composer-core.js');
const {questionRecords}=require('./composer-integrity-contracts.js');
const dir=path.resolve(__dirname,'../../../audit_tools/micro_faculty_remediation_20261006');
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8')),ledger=read('expectations.json');
const faculty=read('faculty_decisions.json'),fMap=new Map(faculty.map(r=>[r.id,r])),patches=read('patches.json'),unreviewed=read('unreviewed_scope.json'),dispositions=read('dispositions.json');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),stable=core.stableStringify;
const source=fs.readFileSync(path.join(dir,'baseline_composer_library.js'),'utf8');
assert.equal(sha(source),read('baseline_hashes.json')['build/faculty-build-composer/data/composer_library.js']);
const baseline=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
const beforeMap=new Map(questionRecords(baseline).map(r=>[String(r.question.id),r.question]));
const changes=new Map(ledger.changes.map(c=>[c.id,c]));
assert.equal(faculty.length,6299);assert.equal(faculty.filter(r=>r.state==='FACULTY PASS').length,1628);
const flags=faculty.filter(r=>r.state==='FACULTY FLAG').map(r=>r.id).sort();assert.equal(flags.length,705);assert.deepEqual(Object.keys(dispositions).sort(),flags,'Every faculty flag accounted');
const statuses=['CHANGED','VERIFIED ALREADY RESOLVED','NO CHANGE — FACULTY INTENT CONFLICT','NO CHANGE — STRUCTURAL ROLE PROTECTED','NO CHANGE — REQUIRES MANUAL DECISION'];
for(const id of flags){assert(statuses.includes(dispositions[id].disposition));assert(dispositions[id].rationale);}
for(const c of changes.values()){
 assert.deepEqual(c.beforeRecord,beforeMap.get(c.id),'Immutable before state '+c.id);
 const status=fMap.get(c.id)?.state;
 if(status!=='FACULTY FLAG'&&!unreviewed[c.id])assert(c.fields.every(f=>['imageAlt','graphDescription','graphRequired'].includes(f)),'Graph-only exception '+c.id);
 if(status==='FACULTY PASS')assert(c.fields.every(f=>['imageAlt','graphDescription','graphRequired'].includes(f)),'PASS protected '+c.id);
 if(c.id.startsWith('ECON-MG')&&status!=='FACULTY FLAG')assert(c.fields.every(f=>['imageAlt','graphDescription','graphRequired'].includes(f)),'Mature Market Gate protected');
 for(const f of ['primarySkill','repairSkill','objective','secondaryConceptIds','instructionalRole','sourcePool','originalSourcePool','originalBossTier','sourceHash','sourceOccurrences'])assert.deepEqual(c.afterRecord[f],c.beforeRecord[f],'Protected '+c.id+'.'+f);
 assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash);
 assert.equal(new Set(c.afterRecord.options.map(core.normalizeAnswerText)).size,4);
 const restored=structuredClone(c.afterRecord);for(const f of c.fields){if(Object.hasOwn(c.beforeRecord,f))restored[f]=structuredClone(c.beforeRecord[f]);else delete restored[f];}assert.deepEqual(restored,c.beforeRecord);
}
const transfers=ledger.moves.filter(m=>m.fromConcept);
assert.deepEqual(transfers.map(m=>m.id).sort(),['ECON-EC-LEGENDARYBOSS-20022','ECON-EC-LEGENDARYBOSS-20023']);
for(const m of transfers){assert.equal(m.fromConcept,'integrated-economic-analysis');assert.equal(m.toConcept,'integrated-macroeconomic-analysis');assert.equal(m.from,'legendaryBoss');assert.equal(m.to,'legendaryBoss');assert.equal(patches[m.id].move_to_concept,m.toConcept);}
for(const m of ledger.moves.filter(m=>!m.fromConcept))assert(['easy','medium','hard','elite','legendary'].includes(m.from)&&['easy','medium','hard','elite','legendary'].includes(m.to));
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
module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,beforeApprovedRevisions,facultyMicroLedger:ledger,facultyMacroTransfers:transfers};
