'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js')),h=require(path.join(dir,'tests/composer-test-helpers.js')),approved=require(path.join(dir,'tests/faculty-validation-revisions.js'));
const lib=h.loadComposerLibrary(),ledger=require('./expectations.json');con.assertCanonicalIntegrity(lib);approved.assertCurrentLibrary(lib);
const before=approved.beforeSeedActivation(lib),old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question])),now=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question])),targets=new Set(ledger.changes.map(c=>c.id));
assert.equal(now.size,9802);assert.equal(targets.size,15);
for(const [id,q]of now){if(targets.has(id)){assert.deepEqual(q,{...old.get(id),instructionalRole:'repair'});}else assert.deepEqual(q,old.get(id));}
assert(!con.questionRecords(lib).some(r=>r.question.instructionalRole==='repairSeed'));
const compositionProof=[];
for(const cid of Object.keys(ledger.supportPlacementsBefore)){
 const input={title:'Seed activation',slug:'seed-activation',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER},a=core.compose(before,input),b=core.compose(lib,input);
 assert.deepEqual(a.banks,b.banks);assert.deepEqual(a.bridgeQuestions,b.bridgeQuestions);
 const modes=c=>c.validation.modes.map(m=>({mode:m.mode,deficiencies:m.deficiencies.filter(r=>r.pool!=='repair'),issues:m.issues,requirements:m.requirements.filter(r=>r.pool!=='repair')}));assert.deepEqual(modes(a),modes(b));
 for(let i=0;i<a.validation.modes.length;i++)assert(!a.validation.modes[i].ok||b.validation.modes[i].ok,'No supported mode lost');
 const qids=qs=>[...new Set(qs.map(q=>String(q.id)))].sort();assert.deepEqual(qids(b.repairQuestions),qids([...a.repairQuestions,...Object.values(a.skillRepairSeedPools).flat()]));
 for(const skill of new Set([...Object.keys(a.microSkillRepairPools),...Object.keys(a.skillRepairSeedPools)]))assert.deepEqual(qids(b.microSkillRepairPools[skill]||[]),qids([...(a.microSkillRepairPools[skill]||[]),...(a.skillRepairSeedPools[skill]||[])]));
 for(const r of ledger.routes.filter(r=>r.conceptId===cid)){
  assert(b.repairQuestions.some(q=>String(q.id)===r.id),'Flat Repair eligibility '+r.id);
  assert(b.microSkillRepairPools[r.skill]?.some(q=>String(q.id)===r.id),'Skill Repair eligibility '+r.id);
  assert(!Object.values(b.skillRepairSeedPools).flat().some(q=>String(q.id)===r.id));
 }
 compositionProof.push({conceptId:cid,beforeRepair:a.counts.repair,afterRepair:b.counts.repair,beforeSeed:a.counts.repairSeed,afterSeed:b.counts.repairSeed});
}
const result={status:'PASS',librarySha256:lib.librarySha256,promoted:15,canonicalQuestions:9802,unchangedOtherQuestions:9787,allQuestionWordingAnswersAndDifficultyUnchanged:true,remainingSeedQuestions:0,skillRoutesVerified:ledger.routes.length,ordinaryBanksUnchanged:true,noSupportedModeLost:true,compositionProof};
fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
