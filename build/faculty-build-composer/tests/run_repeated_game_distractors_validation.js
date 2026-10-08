'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const core=require('../composer-core.js'),h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./faculty-validation-revisions.js');
const ledger=require('../../../audit_tools/repeated_game_distractors_20261008/expectations.json');
const lib=h.loadComposerLibrary();approved.assertCurrentLibrary(lib);
const data=path.resolve(__dirname,'../data');
con.assertCanonicalIntegrity(lib,{registry:JSON.parse(fs.readFileSync(path.join(data,'composer_registry.json'),'utf8')),manifest:JSON.parse(fs.readFileSync(path.join(data,'composer_library_manifest.json'),'utf8')),readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
(async()=>{
 const results=[];
 for(const c of ledger.changes){
  const q=con.questionRecords(lib).find(r=>String(r.question.id)===c.id).question;
  const [co,cheat,pun,d]=q.q.match(/Cooperating pays (\d+).*Cheating pays (\d+) now, followed by (\d+).*by (0\.\d+)/).slice(1).map(Number);
  // Independent stream summation, including the current period at t=0.
  let cv=0,dv=cheat;for(let t=0;t<1000;t++){cv+=co*d**t;if(t>0)dv+=pun*d**t;}
  const pairs=q.options.map(s=>s.match(/cooperation PV = ([\d.]+); cheating PV = ([\d.]+)\./).slice(1).map(Number));
  const near=(a,b)=>Math.abs(a-b)<.005;
  assert.deepEqual(pairs.map(([a,b],i)=>near(a,cv)&&near(b,dv)?i:-1).filter(i=>i>=0),[3]);
  assert.equal(q.options.filter(s=>s.startsWith('Cooperate:')).length,3);
  for(let i=0;i<4;i++)assert.equal(q.options[i].startsWith('Cooperate:'),pairs[i][0]>pairs[i][1]);
  assert(q.feedback.includes(cv.toFixed(2))&&q.feedback.includes(dv.toFixed(2)));
  assert.equal(q.feedback,c.beforeRecord.feedback);assert.equal(q.canonicalDifficulty,c.beforeRecord.canonicalDifficulty);
  const hashes=await Promise.all(q.options.map(s=>core.sha256Hex(core.normalizeAnswerText(s))));assert.deepEqual(hashes.map((v,i)=>v===q.aHash?i:-1).filter(i=>i>=0),[3]);
  const errorPairs=c.id==='P62I-OLI-EL-022'?[[cv,cheat/(1-d)],[cv,cheat+pun/(1-d)],[d*cv,dv]]:[[cv,cheat+pun/(1-d)],[d*cv,d*dv],[cv,cheat/(1-d)]];
  errorPairs.forEach((p,i)=>p.forEach((v,j)=>assert(near(v,pairs[i][j]))));
  results.push({id:c.id,tier:q.canonicalDifficulty,cooperationPV:Number(cv.toFixed(2)),cheatingPV:Number(dv.toFixed(2)),key:'D',plausibleCalculationErrors:3});
 }
 const result={status:'PASS',onlyTwoQuestionsChanged:true,originalFeedbackPreserved:true,librarySha256:lib.librarySha256,questions:results};
 fs.writeFileSync(path.resolve(__dirname,'../../../audit_tools/repeated_game_distractors_20261008/validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
