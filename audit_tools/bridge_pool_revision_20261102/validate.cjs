'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js')),h=require(path.join(dir,'tests/composer-test-helpers.js')),approved=require(path.join(dir,'tests/faculty-validation-revisions.js'));
const lib=h.loadComposerLibrary(),ledger=require('./expectations.json'),inventory=require('./inventory.json');con.assertCanonicalIntegrity(lib);approved.assertCurrentLibrary(lib);
const before=approved.beforeBridgeRevision(lib),records=l=>new Map(con.questionRecords(l).map(r=>[String(r.question.id),r.question])),old=records(before),now=records(lib),changes=new Map(ledger.changes.map(c=>[c.id,c]));
assert.equal(now.size,9802);assert.equal(changes.size,336);assert.equal(ledger.audited,564);assert.equal(ledger.retained,228);
assert.deepEqual(ledger.decisions.map(d=>d.id).sort(),inventory.items.map(d=>d.id).sort());
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const [id,q]of now){if(!changes.has(id)){assert.deepEqual(q,old.get(id));continue;}const c=changes.get(id);assert.deepEqual(q,c.afterRecord);assert.equal(sha(core.normalizeAnswerText(q.options[c.correctIndex])),q.aHash);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);for(const f of ['instructionalRole','canonicalDifficulty','primarySkill','repairSkill','primaryConceptId','sourceOccurrences','sourceHash'])assert.deepEqual(q[f],c.beforeRecord[f],id+' '+f);assert.equal(q.instructionalRole,'bridge');assert(!/\blearners?\b/i.test([q.q,...q.options,q.feedback].join(' ')));}
for(const cid of Object.keys(lib.concepts)){
 for(const field of ['repairQuestions','bridgeQuestions'])assert.deepEqual((lib.concepts[cid][field]||[]).map(q=>String(q.id)),(before.concepts[cid][field]||[]).map(q=>String(q.id)));
 for(const field of ['microSkillRepairPools','microSkillBridgePools','skillRepairSeedPools'])assert.deepEqual(lib.concepts[cid][field],before.concepts[cid][field]);
}
assert.deepEqual(lib.assetInventory,before.assetInventory);
const q=now.get('P62C-CPS-BR-020');assert.equal(q.options[3],'Producer surplus is positive, and profit is negative.');assert(q.q.includes('variable costs'));assert(q.q.includes('total costs'));
assert(!now.get('PM8-OLI-BR-026').q.includes('<table'));assert(!now.get('PM7-MCMP-BR-012').q.includes('40−2Q'));
const policy=require(path.join(dir,'data/faculty-outcomes.js')),p=structuredClone(policy),pb=structuredClone(ledger.facultyOutcomePolicyBefore);for(const v of [p,pb]){delete v.librarySha256;delete v.policySha256;}assert.deepEqual(p,pb,'Outcome definitions and coverage unchanged');
const substantive=ledger.changes.filter(c=>c.fields.includes('options')),contextOnly=ledger.changes.filter(c=>c.fields.length===1&&c.fields[0]==='q');
const result={status:'PASS',audited:564,rewritten:substantive.length,contextClarifications:contextOnly.length,revised:336,retained:228,canonicalQuestions:9802,unchangedOtherQuestions:9466,roleMoves:0,difficultyChanges:0,answerPositionsAndProvenancePreserved:true,outcomeDefinitionsAndSupportRoutesPreserved:true,assetsUnchanged:true,librarySha256:lib.librarySha256};
fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
