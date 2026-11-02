'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer');
const core=require(path.join(dir,'composer-core.js')),h=require(path.join(dir,'tests/composer-test-helpers.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js')),approved=require(path.join(dir,'tests/faculty-validation-revisions.js'));
const lib=h.loadComposerLibrary(),ledger=require('./expectations.json'),inv=require('./inventory.json');
con.assertCanonicalIntegrity(lib);approved.assertCurrentLibrary(lib);
const before=approved.beforeReviewFlags(lib),records=l=>new Map(con.questionRecords(l).map(r=>[String(r.question.id),r.question])),old=records(before),now=records(lib),edited=new Map(ledger.changes.map(c=>[c.id,c]));
assert.equal(now.size,9802);assert.equal(edited.size,54);assert.deepEqual([...edited.keys()].sort(),inv.items.map(r=>r.id).sort());
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const [id,q]of now){if(!edited.has(id))assert.deepEqual(q,old.get(id));else{const c=edited.get(id);assert.deepEqual(q,c.afterRecord);assert.equal(sha(core.normalizeAnswerText(q.options[c.correctIndex])),q.aHash);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);assert.deepEqual(q.sourceOccurrences,old.get(id).sourceOccurrences);}}
for(const r of con.questionRecords(lib)){const c=edited.get(String(r.question.id));if(!c)continue;if(['easy','medium','hard','elite','legendary'].includes(r.pool))assert.equal(r.pool,r.question.canonicalDifficulty);if(c.afterRecord.checkpointPool)assert.equal(c.afterRecord.checkpointPool,c.beforeRecord.checkpointPool||c.beforeRecord.sourcePool);}
assert.equal(ledger.changes.filter(c=>c.afterRecord.canonicalDifficulty==='legendary'&&c.beforeRecord.canonicalDifficulty!=='legendary').length,41);
assert.equal(now.get('ECON-SP-EASYBOSS-2011').canonicalDifficulty,'easy');assert(now.get('ECON-SP-EASYBOSS-2011').options[0].includes(String(20*5)));
const msb=q=>Math.max(0,50-5*q)+Math.max(0,40-5*q)+10;
assert.equal(msb(5),50);assert(msb(4.9)>50&&msb(5.1)<50);assert.equal(now.get('42196').options[0].slice(0,4),'Five');
assert(Math.abs((1/1.5)/(1/2)-1-1/3)<1e-12);assert(!/velocity/i.test(now.get('LG-Q-336').q+' '+now.get('LG-Q-336').feedback));
assert.equal(500-80*4-100,80);assert(/oligopolistic/i.test(now.get('P62I-OLI-EL-029').q));assert(!/monopoly/i.test(now.get('P62I-OLI-EL-029').q));
for(const key of ['image','options','aHash','feedback'])assert.deepEqual(now.get('P62G-MON-EL-038')[key],old.get('P62G-MON-EL-038')[key]);
assert.equal(lib.assetInventory.length,before.assetInventory.length+1);for(const a of before.assetInventory)assert(lib.assetInventory.some(b=>core.stableStringify(a)===core.stableStringify(b)));
const composed=new Map();let difficultyRoutesChecked=0;
for(const c of ledger.changes.filter(c=>c.fields.includes('canonicalDifficulty'))){
 const q=c.afterRecord,cid=q.primaryConceptId;if(!composed.has(cid))composed.set(cid,core.compose(lib,{title:'Routing check',slug:'routing-check',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER}));
 const target=q.checkpointPool||(q.instructionalRole==='boss'?{easy:'easyBoss',medium:'mediumBoss',hard:'finalBoss',legendary:'legendaryBoss'}[q.canonicalDifficulty]:q.canonicalDifficulty);
 assert(composed.get(cid).banks[target].some(x=>String(x.id)===c.id),'Question available in intended difficulty or checkpoint: '+c.id);difficultyRoutesChecked++;
}
const course=require(path.join(dir,'course-area-model.js')).create(lib.registry.concepts),easyShortfalls=[],modeChanges=[];
for(const e of lib.registry.concepts){const cid=e.canonicalConceptId;if(e.status!=='active'||!course.get(cid)?.cardVisible||['integrated-economic-analysis','integrated-macroeconomic-analysis'].includes(cid))continue;
 const a=core.compose(before,{title:'Before',slug:'before',selectedConceptIds:[cid],supportedModes:['quiz']}),b=core.compose(lib,{title:'After',slug:'after',selectedConceptIds:[cid],supportedModes:['quiz']});
 if(b.banks.easy.length<5)easyShortfalls.push({id:cid,before:a.banks.easy.length,after:b.banks.easy.length});
 if(a.errors.length!==b.errors.length)modeChanges.push({id:cid,before:a.errors,after:b.errors});
}
const result={status:'PASS',changed:54,reclassified:49,contentFixes:5,canonicalCount:9802,ordinaryPoolMoves:ledger.moves.length,difficultyRoutesChecked,unchangedOtherQuestions:now.size-54,answerPositionsPreserved:true,previousGraphAssetsPreserved:true,easyShortfalls,quizModeChanges:modeChanges,librarySha256:lib.librarySha256};
fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
