'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const core=require('../composer-core.js'),h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./faculty-validation-revisions.js'),add=require('./saving-identity-easy-additions.js');
const lib=h.loadComposerLibrary(),before=add.beforeSavingIdentityAdditions(lib),cid='saving-and-investment-identities';
con.assertCanonicalIntegrity(lib);approved.assertCurrentLibrary(lib);
assert.equal(lib.canonicalQuestionCount,9782);assert.equal(before.canonicalQuestionCount,9777);
assert.deepEqual([...add.addedIds].sort(),['SLF-ID-E-001','SLF-ID-E-002','SLF-ID-E-003','SLF-ID-E-004','SLF-ID-E-005']);
const oldStems=new Set(con.questionRecords(before).map(r=>core.normalizeAnswerText(r.question.q)));
for(const a of add.ledger.additions){
 const q=a.question;assert.equal(q.canonicalDifficulty,'easy');assert.equal(q.instructionalRole,'main');
 assert(!/[0-9=+×÷]/.test([q.q,...q.options,q.feedback].join(' ')),'Conceptual content without equations or arithmetic');
 assert(!oldStems.has(core.normalizeAnswerText(q.q)),'Distinct new stem');
 assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);
 assert.equal(crypto.createHash('sha256').update(core.normalizeAnswerText(q.options[a.correctIndex])).digest('hex'),q.aHash);
 con.assertSourceProvenance(q,q);
}
const recipe={title:'Saving and Investment Identities',slug:'saving-identities-quiz',selectedConceptIds:[cid],supportedModes:['quiz']};
const old=core.compose(before,recipe),now=core.compose(lib,recipe);
assert(old.errors.some(e=>/easy needs 5, found 4/.test(e)));
assert.deepEqual(now.errors,[],'Standalone quiz now available');
assert.equal(now.banks.easy.length,9);assert.equal(now.banks.medium.length,10);assert.equal(now.banks.hard.length,5);
for(const id of add.addedIds)assert(now.banks.easy.some(q=>String(q.canonicalId||q.id)===id));
for(const pool of Object.keys(old.banks).filter(k=>k!=='easy'))assert.deepEqual(now.banks[pool],old.banks[pool],'Unchanged pool '+pool);
(async()=>{
 const game=await h.buildFacultyGame(core,recipe,{library:lib});h.assertInlineScriptsCompile(game.html);
 const result={status:'PASS',added:5,canonicalQuestions:9782,easyBefore:4,easyAfter:9,medium:10,hard:5,quizAvailable:true,generatedQuizCompiles:true,allExistingQuestionsAndRoutesPreserved:true,ids:[...add.addedIds]};
 fs.writeFileSync(path.resolve(__dirname,'../../../audit_tools/saving_identity_easy_20261101/validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
