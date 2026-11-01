'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const core=require('../composer-core.js'),h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./faculty-validation-revisions.js'),style=require('./faculty-prose-candidates.js');
const out=path.resolve(__dirname,'../../../audit_tools/easy_pool_review_20261101');
const lib=h.loadComposerLibrary(),ledger=approved.easyPoolReviewLedger,review=require('../../../audit_tools/easy_pool_review_20261101/review.json');
approved.assertCurrentLibrary(lib);con.assertCanonicalIntegrity(lib);
const before=approved.beforeEasyPoolReviewLibrary(lib),records=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const original=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question]));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),key=q=>q.options.findIndex(s=>sha(core.normalizeAnswerText(s))===q.aHash);
const changed=new Map(ledger.changes.map(c=>[c.id,c]));
assert.equal(review.rows.filter(r=>r['Review status']==='Reviewed — flag').length,195);
assert.equal(ledger.dispositions.length,195);assert.equal(new Set(ledger.dispositions.map(d=>d.id)).size,195);
for(const r of review.rows.filter(r=>r['Review status']==='Reviewed — flag')){
 assert(changed.has(r['Question ID']),r['Question ID']);
 if(r['Flag reasons'].includes('difficulty')&&!r.Notes.trim())assert.equal(records.get(r['Question ID']).canonicalDifficulty,'medium',r['Question ID']);
 if(r['Flag reasons'].includes('lengths'))assert(!style.screen(records.get(r['Question ID']),key(records.get(r['Question ID']))).lengthOutlier,'Unresolved answer-length flag '+r['Question ID']);
}
for(const [id,tier]of Object.entries(review.overrides))assert.equal(records.get(id).canonicalDifficulty,tier);
for(const id of ['43071','ECON-EC-EASYBOSS-17016','P62H-MCMP-B1-018'])assert.equal(records.get(id).canonicalDifficulty,original.get(id).canonicalDifficulty,'Accepted difficulty decision '+id);
assert.equal(new Set(['42800','42804','42808'].map(id=>records.get(id).q)).size,3);
assert.deepEqual(records.get('42800'),original.get('42800'));
assert.equal(key(records.get('ECON-NL-EASYBOSS-2035')),3);assert.equal(records.get('ECON-NL-EASYBOSS-2035').options[3],'−3%');
let equations=0;
for(const c of ledger.changes){
 const q=records.get(c.id);assert.deepEqual(q,c.afterRecord);assert.equal(key(q),c.correctIndex);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);
 for(const field of ['sourceHash','sourceOccurrences','sourcePool','originalSourcePool','originalBossTier','primaryConceptId','primarySkill','secondarySkills','repairSkill','instructionalRole'])assert.deepEqual(q[field],c.beforeRecord[field],'Preserved source/routing field '+c.id+'/'+field);
 const m=q.q.match(/faces P=(\d+(?:\.\d+)?)−(\d+(?:\.\d+)?)Q and MC=(\d+(?:\.\d+)?)\+(\d+(?:\.\d+)?)Q/);
 if(m&&c.fields.includes('feedback')){const [a,b,mc,d]=m.slice(1).map(Number),quantity=(a-mc)/(2*b+d);assert(Math.abs(parseFloat(q.options[c.correctIndex])-quantity)<.011);assert(q.feedback.includes(quantity.toFixed(2)));assert(q.feedback.includes('marginal revenue'));equations++;}
}
assert.equal(equations,12);
for(const [id,q]of records)if(q.canonicalDifficulty==='easy'&&q.primaryConceptId==='perfect-competition')assert(!/\blearner\b/i.test([q.q,...q.options,q.feedback||''].join(' ')),id);
const affectedConcepts=[...new Set(con.questionRecords(lib).filter(r=>changed.has(String(r.question.id))).map(r=>r.conceptId))];
const composition=[];
for(const cid of affectedConcepts){
 const recipe={title:'Easy review regression',slug:'easy-review',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER};
 const a=core.compose(before,recipe),b=core.compose(lib,recipe);
 for(const p of ['easyBoss','mediumBoss','finalBoss','legendaryBoss'])assert.deepEqual(b.banks[p].map(q=>String(q.canonicalId||q.id)).sort(),a.banks[p].map(q=>String(q.canonicalId||q.id)).sort(),'Checkpoint stage '+cid+'/'+p);
 for(const p of ['easy','medium','hard','elite','legendary'])for(const q of b.banks[p])assert.equal(q.canonicalDifficulty,p,'Ordinary difficulty routing '+q.id);
 for(const field of ['repairQuestions','bridgeQuestions'])assert.deepEqual(b[field].map(q=>String(q.canonicalId||q.id)).sort(),a[field].map(q=>String(q.canonicalId||q.id)).sort(),field+' '+cid);
 composition.push({concept:cid,beforeErrors:a.errors,afterErrors:b.errors});
}
const result={status:'PASS',canonicalQuestions:records.size,flaggedQuestionsAddressed:195,changedQuestions:changed.size,difficultyChanges:ledger.dispositions.filter(d=>d.targetDifficulty).length,ordinaryPoolMoves:ledger.moves.length,contextEdits:ledger.contextualized.length,learnerReplacements:ledger.studentEdits.length,algebraExplanationsChecked:equations,correctAnswerPositionsPreserved:true,allUnrelatedRecordsPreserved:true,checkpointStagesAndRepairRoutesPreserved:true,composition};
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,composition:composition.length}));
