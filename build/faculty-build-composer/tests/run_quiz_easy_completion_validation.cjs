'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const core=require('../composer-core.js'),h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./faculty-validation-revisions.js'),add=require('./quiz-easy-completion-additions.js'),style=require('./faculty-prose-candidates.js');
const lib=h.loadComposerLibrary(),before=add.beforeQuizEasyAdditions(lib);
con.assertCanonicalIntegrity(lib);approved.assertCurrentLibrary(lib);
assert.equal(lib.canonicalQuestionCount,9795);assert.equal(before.canonicalQuestionCount,9782);assert.equal(add.addedIds.size,13);
const original=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question])),current=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
for(const [id,q]of original)assert.deepEqual(current.get(id),q,'Preserve existing question '+id);
const oldStems=new Set([...original.values()].map(q=>core.normalizeAnswerText(q.q)));
for(const a of add.ledger.additions){
 const q=a.question;assert.equal(q.canonicalDifficulty,'easy');assert.equal(q.instructionalRole,'main');
 assert(!/[0-9=+×÷]/.test([q.q,...q.options,q.feedback].join(' ')),'Conceptual content without equations or arithmetic');
 assert(!oldStems.has(core.normalizeAnswerText(q.q)),'Distinct new stem');assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);
 assert.equal(crypto.createHash('sha256').update(core.normalizeAnswerText(q.options[a.correctIndex])).digest('hex'),q.aHash);
 assert(!style.screen(q,a.correctIndex).lengthOutlier,'No conspicuously long correct answer '+q.id);con.assertSourceProvenance(q,q);
 assert(core.resolveConceptModule(lib,a.targetConceptId).questions.easy.some(x=>String(x.id)===q.id),'Visible in requested subtopic');
}
(async()=>{
 const topics=[];
 for(const [cid,expectedAdded]of Object.entries(add.ledger.requested)){
  const recipe={title:'Conceptual quiz',slug:'conceptual-quiz',selectedConceptIds:[cid],supportedModes:['quiz']},old=core.compose(before,recipe),now=core.compose(lib,recipe);
  assert(old.errors.some(e=>/easy needs 5/.test(e)));assert.deepEqual(now.errors,[],'Standalone quiz available '+cid);assert.equal(now.banks.easy.length,5);
  assert.equal(now.banks.easy.length-old.banks.easy.length,expectedAdded);
  const entry=lib.registry.concepts.find(c=>c.canonicalConceptId===cid),counts=Object.fromEntries(['easy','medium','hard'].map(k=>[k,now.banks[k].length]));
  if(entry.runtimeAdaptiveCounts)assert.deepEqual(entry.runtimeAdaptiveCounts,counts,'Stored adaptive depth matches runtime '+cid);
  if(entry.quiz15Status)assert.equal(entry.quiz15Status,'ready','Stored Quiz readiness '+cid);
  if(entry.quizEligibleNonLegendary!=null)assert.equal(entry.quizEligibleNonLegendary,Object.values(counts).reduce((a,b)=>a+b,0));
  if(/Runtime adaptive depth:/.test(entry.coverageStatusNote||''))assert(entry.coverageStatusNote.includes(`Runtime adaptive depth: ${counts.easy} Easy / ${counts.medium} Medium / ${counts.hard} Hard;`));
  for(const outcome of core.FacultyOutcomes.describe(cid).outcomes){
   const scoped=core.compose(lib,{...recipe,supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[outcome.id]}}});
   assert.deepEqual(outcome.coverage.difficulty,Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,scoped.banks[k].length])),'Stored faculty-outcome depth '+outcome.id);
   assert.deepEqual(outcome.coverage.supportedModes,scoped.validation.modes.filter(m=>m.ok).map(m=>m.mode),'Stored faculty-outcome modes '+outcome.id);
  }
  for(const p of Object.keys(old.banks).filter(k=>k!=='easy'))assert.deepEqual(now.banks[p],old.banks[p],'Preserved pool '+cid+'/'+p);
  const game=await h.buildFacultyGame(core,recipe,{library:lib});h.assertInlineScriptsCompile(game.html);
  topics.push({conceptId:cid,added:expectedAdded,easyBefore:old.banks.easy.length,easy:now.banks.easy.length,medium:now.banks.medium.length,hard:now.banks.hard.length,quizAvailable:true,generatedQuizCompiles:true});
 }
 const result={status:'PASS',added:13,canonicalQuestions:9795,allExistingQuestionsPreserved:true,originalFiveSavingQuestionsPreserved:true,topics};
 fs.writeFileSync(path.resolve(__dirname,'../../../audit_tools/quiz_easy_completion_20261101/validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
