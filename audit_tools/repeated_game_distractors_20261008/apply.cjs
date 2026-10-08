'use strict';
// Follow-up to the faculty validation remediation: two option sets only.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),data=path.join(dir,'data');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js'));
const read=n=>JSON.parse(fs.readFileSync(path.join(data,n),'utf8'));
(async()=>{
 const lib=JSON.parse(fs.readFileSync(path.join(data,'composer_library.js'),'utf8').slice(27).trim().slice(0,-1));
 const original=JSON.parse(fs.readFileSync(path.join(root,'audit_tools/faculty_remediation_20261008/expectations.json'),'utf8'));
 assert.equal(lib.librarySha256,original.afterLibrarySha256,'Apply once to the completed faculty remediation.');
 const beforeLibrarySha256=lib.librarySha256,changes=[];
 const specifications=[
  {id:'P62I-OLI-EL-022',options:[
   'Cheat: cooperation PV = 150.00; cheating PV = 200.00.',
   'Cooperate: cooperation PV = 150.00; cheating PV = 90.00.',
   'Cooperate: cooperation PV = 135.00; cheating PV = 83.00.',
   'Cooperate: cooperation PV = 150.00; cheating PV = 83.00.'
  ],distractorRationales:[
   'Treats the one-time cheating payoff as recurring forever: 20/(1-0.90).',
   'Starts punishment now instead of next period: 20+7/(1-0.90).',
   'Omits the current cooperation payoff: 0.90*15/(1-0.90).'
  ]},
  {id:'P62I-OLI-L-052',options:[
   'Cooperate: cooperation PV = 65.00; cheating PV = 37.00.',
   'Cooperate: cooperation PV = 52.00; cheating PV = 26.40.',
   'Cheat: cooperation PV = 65.00; cheating PV = 85.00.',
   'Cooperate: cooperation PV = 65.00; cheating PV = 33.00.'
  ],distractorRationales:[
   'Starts punishment now instead of next period: 17+4/(1-0.80).',
   'Discounts both entire streams by an extra period: 0.80*65 and 0.80*33.',
   'Treats the one-time cheating payoff as recurring forever: 17/(1-0.80).'
  ]}
 ];
 for(const s of specifications){
  const matches=con.questionRecords(lib).filter(r=>String(r.question.id)===s.id);assert.equal(matches.length,1);
  const q=matches[0].question,beforeRecord=structuredClone(q);assert.deepEqual(q,original.changes.find(c=>c.id===s.id).afterRecord);
  assert.equal(await core.sha256Hex(core.normalizeAnswerText(q.options[3])),q.aHash);
  // Require a complete numerical comparison so several 'Cooperate' choices are unambiguous.
  q.q=q.q.replace('Which strategy gives the larger present value?','Which present-value comparison and strategy choice are correct?');
  q.options=s.options;q.aHash=await core.sha256Hex(core.normalizeAnswerText(q.options[3]));
  changes.push({id:s.id,beforeRecord,afterRecord:structuredClone(q),correctIndex:3,fields:['q','options','aHash'],distractorRationales:s.distractorRationales});
 }
 delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=await core.sha256Hex(core.stableStringify(lib));lib.registry.librarySha256=lib.librarySha256;
 const manifest=read('composer_library_manifest.json');manifest.librarySha256=lib.librarySha256;
 const policy=structuredClone(require(path.join(data,'faculty-outcomes.js')));policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=await core.sha256Hex(core.stableStringify(policy));
 con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest,readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
 fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify({schemaVersion:1,purpose:'Targeted pedagogical distractor repair; no economic correction or tier change.',beforeLibrarySha256,afterLibrarySha256:lib.librarySha256,changes},null,2)+'\n');
 fs.writeFileSync(path.join(data,'composer_library.js'),'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n');
 fs.writeFileSync(path.join(data,'composer_registry.json'),JSON.stringify(lib.registry,null,2)+'\n');
 fs.writeFileSync(path.join(data,'composer_library_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(data,'faculty-outcomes.js'),"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n');
 console.log(JSON.stringify({edited:changes.length,librarySha256:lib.librarySha256}));
})().catch(e=>{console.error(e);process.exitCode=1;});
