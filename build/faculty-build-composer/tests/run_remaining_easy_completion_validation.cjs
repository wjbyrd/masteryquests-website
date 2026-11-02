'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const core=require('../composer-core.js'),h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./faculty-validation-revisions.js'),add=require('./remaining-easy-completion-additions.js'),style=require('./faculty-prose-candidates.js');
const actual=h.loadComposerLibrary();con.assertCanonicalIntegrity(actual);approved.assertCurrentLibrary(actual);
const lib=approved.beforeEliteRevisions(actual),before=add.beforeRemainingEasyAdditions(lib);
approved.assertCurrentLibrary(lib);
assert.equal(lib.canonicalQuestionCount,9802);assert.equal(before.canonicalQuestionCount,9795);assert.equal(add.addedIds.size,7);
const original=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question])),current=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
for(const [id,q]of original)assert.deepEqual(current.get(id),q,'Preserve existing question '+id);
const oldStems=new Set([...original.values()].map(q=>core.normalizeAnswerText(q.q)));
for(const a of add.ledger.additions){
 const q=a.question;assert.equal(q.canonicalDifficulty,'easy');assert.equal(q.instructionalRole,'main');
 assert(!/[0-9=+×÷]/.test([q.q,...q.options,q.feedback].join(' ')),'Conceptual content without equations or arithmetic');
 assert(!oldStems.has(core.normalizeAnswerText(q.q)),'Distinct new stem');assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);
 assert.equal(crypto.createHash('sha256').update(core.normalizeAnswerText(q.options[a.correctIndex])).digest('hex'),q.aHash);
 assert(!style.screen(q,a.correctIndex).lengthOutlier,'No conspicuously long correct answer '+q.id);con.assertSourceProvenance(q,q);
 assert(core.resolveConceptModule(lib,a.targetConceptId).questions.easy.some(x=>String(x.id)===q.id),'Visible in requested topic');
}
const counts=c=>Object.fromEntries(['easy','medium','hard'].map(k=>[k,c.banks[k].length]));
const compose=(bank,ids)=>core.compose(bank,{title:'Easy coverage',slug:'easy-coverage',selectedConceptIds:ids,supportedModes:['quiz']});
const specialCases=['integrated-economic-analysis','integrated-macroeconomic-analysis'];
const model=require('../course-area-model.js').create(lib.registry.concepts);
(async()=>{
 const topics=[];
 for(const [cid,expectedAdded]of Object.entries(add.ledger.requested)){
  const old=compose(before,[cid]),now=compose(lib,[cid]),entry=lib.registry.concepts.find(c=>c.canonicalConceptId===cid);
  assert(old.errors.some(e=>/easy needs 5/.test(e)));assert(!now.errors.some(e=>/easy needs 5/.test(e)));assert.equal(now.banks.easy.length,5);
  assert.equal(now.banks.easy.length-old.banks.easy.length,expectedAdded);
  for(const p of Object.keys(old.banks).filter(k=>k!=='easy'))assert.deepEqual(now.banks[p],old.banks[p],'Preserved pool '+cid+'/'+p);
  const missing=Object.fromEntries(['medium','hard'].map(k=>[k,Math.max(0,5-now.banks[k].length)]));
  assert(Object.values(missing).some(n=>n>0),'Do not misrepresent remaining non-Easy gaps');
  if(entry.runtimeAdaptiveCounts)assert.deepEqual(entry.runtimeAdaptiveCounts,counts(now));
  if(entry.quiz15Status)assert.equal(entry.quiz15Status,'limited');
  for(const outcome of core.FacultyOutcomes.describe(cid).outcomes){
   // Published coverage describes the current library, including later approved revisions.
   const scoped=core.compose(actual,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[outcome.id]}}});
   assert.deepEqual(outcome.coverage.difficulty,Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,scoped.banks[k].length])));
   assert.deepEqual(outcome.coverage.supportedModes,scoped.validation.modes.filter(m=>m.ok).map(m=>m.mode));
  }
  const partner=cid==='long-run-aggregate-supply-and-potential-output'?'long-run-macroeconomic-self-adjustment':'competitive-markets';
  const recipe={title:'Combined conceptual quiz',slug:'combined-conceptual-quiz',selectedConceptIds:[cid,partner],supportedModes:['quiz']};
  assert.deepEqual(core.compose(lib,recipe).errors,[]);const game=await h.buildFacultyGame(core,recipe,{library:lib});h.assertInlineScriptsCompile(game.html);
  topics.push({conceptId:cid,title:entry.title,added:expectedAdded,easyBefore:old.banks.easy.length,...counts(now),remainingNeeded:missing,standaloneQuizAvailable:false,combinedQuizWith:partner,generatedCombinedQuizCompiles:true});
 }
 const audit=[];
 for(const entry of lib.registry.concepts){
  const cid=entry.canonicalConceptId,record=model.get(cid);if(entry.status!=='active'||!record?.cardVisible||specialCases.includes(cid))continue;
  const c=compose(lib,[cid]);assert(c.banks.easy.length>=5,'Every ordinary selectable topic meets Easy minimum: '+cid);
  audit.push({conceptId:cid,title:entry.title,...counts(c),quizAvailable:c.errors.length===0});
 }
 for(const cid of specialCases){assert.deepEqual(lib.concepts[cid],before.concepts[cid]);assert.equal(compose(lib,[cid]).banks.easy.length,0);}
 const result={status:'PASS',added:7,canonicalQuestions:9802,allExistingQuestionsPreserved:true,all18PreviouslyApprovedAdditionsPreserved:true,ordinarySelectableTopicsChecked:audit.length,remainingEasyShortfalls:0,excludedIntegrationBanks:specialCases,topics};
 const out=path.resolve(__dirname,'../../../audit_tools/remaining_easy_completion_20261101');
 fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(result,null,2)+'\n');fs.writeFileSync(path.join(out,'coverage-audit.json'),JSON.stringify(audit,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
