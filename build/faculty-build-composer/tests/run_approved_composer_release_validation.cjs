'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const core=require('../composer-core.js'),helpers=require('./composer-test-helpers.js');
const {assertCanonicalIntegrity,questionRecords}=require('./composer-integrity-contracts.js');
const approved=require('./faculty-validation-revisions.js');
const authored=require('../../../audit_tools/hard_pool_expansion_20261105/questions.json');
const library=helpers.loadComposerLibrary(),integrity=assertCanonicalIntegrity(library);
approved.assertCurrentLibrary(library);
console.log('Approved editorial and graph revision history verified.');
const records=new Map(questionRecords(library).map(r=>[r.question.id,r]));
assert.equal(authored.length,80);assert.equal(new Set(authored.map(q=>q.id)).size,80);
for(const expected of authored){
 const row=records.get(expected.id);assert(row,expected.id);const q=row.question;
 for(const field of ['q','options','feedback'])assert.deepEqual(q[field],expected[field],expected.id+' '+field);
 assert.equal(q.canonicalDifficulty,'hard');assert.equal(row.pool,expected.role==='checkpoint'?'boss':'hard');
 assert.equal(crypto.createHash('sha256').update(core.normalizeAnswerText(q.options[expected.correctIndex])).digest('hex'),q.aHash,expected.id+' answer');
 assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4,expected.id+' distinct choices');
}
const coverage=[];
for(const concept of new Set(authored.map(q=>q.concept))){
 const result=core.compose(library,{title:'Approved Hard coverage',slug:'approved-hard-coverage',selectedConceptIds:[concept],supportedModes:['quiz']});
 const quiz=result.validation.modes.find(m=>m.mode==='quiz'),hardRequirement=quiz.requirements.find(r=>r.pool==='hard');
 assert(hardRequirement.count>=hardRequirement.minimum,concept+' Hard quiz minimum');
 const subset=authored.filter(q=>q.concept===concept);
 assert.equal(subset.filter(q=>q.role==='main').length,10);assert.equal(subset.filter(q=>q.role==='checkpoint').length,6);
 for(const q of subset)assert(result.banks[q.role==='checkpoint'?'finalBoss':'hard'].some(x=>x.id===q.id),q.id+' selectable');
 coverage.push({concept,hard:result.banks.hard.length,checkpoints:result.banks.finalBoss.length,newMain:10,newCheckpoints:6});
}
const result={status:'PASS',integrity,approvedRevisionHistory:true,approvedAdditions:80,coverage};
helpers.writeTestArtifact('tests/approved-composer-release-validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
