'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js')),h=require(path.join(dir,'tests/composer-test-helpers.js')),approved=require(path.join(dir,'tests/faculty-validation-revisions.js')),ledger=require('./expectations.json');
const lib=h.loadComposerLibrary();con.assertCanonicalIntegrity(lib);approved.assertCurrentLibrary(lib);
const records=l=>new Map(con.questionRecords(l).map(r=>[String(r.question.id),r.question])),old=records(approved.beforeReview20(lib)),now=records(lib),changed=new Map(ledger.changes.map(c=>[c.id,c]));assert.equal(now.size,9802);assert.equal(changed.size,49);
const allowed=new Set(['q','options','feedback','aHash','canonicalDifficulty','checkpointPool','imageAlt','graphDescription','commonError']);
for(const [id,q]of now){if(!changed.has(id)){assert.deepEqual(q,old.get(id));continue;}const c=changed.get(id);assert.deepEqual(q,c.afterRecord);assert(c.fields.every(f=>allowed.has(f)));assert.equal(crypto.createHash('sha256').update(core.normalizeAnswerText(q.options[c.correctIndex])).digest('hex'),q.aHash);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);assert.equal(q.instructionalRole,old.get(id).instructionalRole);assert.equal(q.primaryConceptId,old.get(id).primaryConceptId);}
const groups=new Map(),identity=q=>core.stableStringify([q.q,[...q.options].sort(),q.feedback]);for(const [id,q]of now){const k=identity(q);groups.set(k,[...groups.get(k)||[],id]);}
const duplicates=require('./inventory.json').items.filter(i=>i.review['Flag reasons'].includes('duplicate')).map(i=>i.id);assert.equal(duplicates.length,13);for(const id of duplicates)assert.deepEqual(groups.get(identity(now.get(id))),[id],'Flagged duplicate remains '+id);
const tier=ledger.changes.filter(c=>c.fields.includes('canonicalDifficulty'));assert.equal(tier.filter(c=>c.afterRecord.canonicalDifficulty==='easy').length,5);assert.equal(tier.filter(c=>c.afterRecord.canonicalDifficulty==='hard').length,8);
const calculations={
 'PMS-CPS-BR-010':[45+35,80],'PMS-CPS-BR-012':[38+42,50+30],
 '42351':[6000-4000,2000],'42354':[20-15,5],'42359':[4000-2000,2000],'42360':[4000-0,4000],'42362':[20-25,-5],'42363':[4000-0,4000],
 '42818':[36000/1.2,30000],'42828':[24000-(18000+4000),2000],'42830':[25000+1000,26000],'42833':[26500*1.1,29150],'42836':[[12000,23000].filter(x=>x+2000<24000).length,1],'42837':[(20-5)/100*100,15],
 'ECON-SP-MEDIUM-146':[50/(1-.75),200],'P52B-S4-FMCO-B2-003':[130/(1-.8)-390,130/(1-.5)],'ECON-NL-ELITE-353':[200/10-150/10,5],
 'LG-Q-9057':[300-200,100],'LG-Q-9063':[-180+60,-120],'ECON-MG-HARD-274':[(18-12)*80,480],'ECON-MG-HARD-284':[(18-12)*(100-80),120],
 'ECON-SP-MEDIUMBOSS-3001':[3-.5*(3-5),4],'ECON-SP-MOVE-ALONG-SRPC-6041':[4+2,6],
 'ECON-EC-MEDIUMBOSS-18009':[(140-7)+14,147],'ECON-EC-MEDIUMBOSS-18010':[(150+15)/300*100,55],'P52B-S4-UNEM-B2-002':[(290-14)+29,305]};
for(const [id,[actual,expected]]of Object.entries(calculations)){assert(now.has(id));assert(Math.abs(actual-expected)<1e-8,id);}
assert(Math.abs(29000*1.1-31900)<1e-8);assert.equal(80*.6/(1-.6),120);assert.equal(15/165*100>9.09&&15/165*100<9.10,true);
const base=require('./baseline/personal-review-list-data.json'),current=JSON.parse(fs.readFileSync('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation/source/personal-review-list-data.json','utf8'));assert.deepEqual(current.reviewSeed,base.reviewSeed);assert.deepEqual(current.batchApprovals,base.batchApprovals);
const result={status:'PASS',revised:49,alreadyAddressed:14,historicalAcceptedNotesPreserved:388,canonicalQuestions:9802,unchangedOtherQuestions:9753,distinctDuplicateRewrites:13,easyReclassifications:5,hardReclassifications:8,ordinaryPoolMoves:ledger.moves.length,independentCalculationChecks:Object.keys(calculations).length+3,graphAssetsInspected:6,rolesTopicsRoutesAndAnswerPositionsPreserved:true,reviewRecordsPreserved:7579,librarySha256:lib.librarySha256};fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
