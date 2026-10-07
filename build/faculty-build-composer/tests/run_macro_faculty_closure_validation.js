'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const h=require('./composer-test-helpers.js'),c=require('./composer-integrity-contracts.js'),core=require('../composer-core.js'),approved=require('./macro-closure-revisions.js');
const voice=require('./macro-voice-revisions.js'),pass2=require('./macro-voice2-revisions.js'),latest=require('./micro-voice-revisions.js'),live=h.loadComposerLibrary();latest.assertCurrentLibrary(live);
const actual=latest.beforeMicroVoiceLibrary(live);pass2.assertCurrentLibrary(actual);
const current=pass2.beforeVoice2Library(actual);voice.assertCurrentLibrary(current);
// Preserve the exact historical closure checks after independently verifying
// every subsequent editorial change against its own before/after ledger.
const lib=voice.beforeVoiceLibrary(current);approved.assertCurrentLibrary(lib);
const ledger=approved.macroClosureLedger,questions=new Map(c.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const expected={
 'PMOE-POL-L-004':'elite','PM2A-SRPC-EB-009':'medium','PM2B3-PROD-EB-001':'medium','ECON-NL-EASYBOSS-2013':'medium','PM2C2-ICOST-EB-002':'medium','PM2A-EXP-EB-006':'hard','LG-Q-9105':'elite','LG-Q-9102':'hard','LG-Q-9010':'hard','LG-Q-9130':'medium','PMOE-NER-LB-001':'elite','PG5-PC-L-024':'legendary','P52A-AD-L-004':'medium','P52A-AD-L-006':'hard','PM2A-LRPC-L-010':'hard','PM2A-LRPC-L-011':'elite','P77-MVM-L-020':'medium','P76-MODL-EL-003':'hard','ECON-NL-EASYBOSS-2026':'medium','LG-Q-9139':'legendary','LG-Q-9122':'legendary','PM2B2-RNI-LB-001':'legendary'
};
for(const [id,tier]of Object.entries(expected))assert.equal(questions.get(id).canonicalDifficulty,tier,id);
assert.equal(questions.size,9777);
const q=questions.get('PMOE-POL-L-004');assert.equal(q.q,'In the short run, suppose monetary tightening raises the domestic real interest rate while political risk simultaneously rises. Assuming other determinants of net capital outflow are unchanged, what can be concluded about the domestic currency?');
assert.equal(q.options[1],'Its direction is ambiguous because the higher real interest rate reduces NCO while greater political risk raises NCO');
const hash=s=>crypto.createHash('sha256').update(core.normalizeAnswerText(s)).digest('hex');assert.equal(q.aHash,hash(q.options[1]));
const concept=questions.get('P76-MODL-EL-003');assert.equal(concept.primaryConceptId,'models-and-assumptions');assert.equal(concept.primarySkill,'model_selection');
const exchange=questions.get('PMOE-RER-L-003');assert.equal(exchange.primaryConceptId,'real-exchange-rates-and-purchasing-power');assert.equal(exchange.primarySkill,'infer_nominal_change_from_real_stability');assert.equal(exchange.repairSkill,exchange.primarySkill);assert.equal(exchange.canonicalDifficulty,'legendary');
assert.match(questions.get('PM2A-LRPC-L-011').feedback,/Full anticipation.*eliminating the inflation surprise/);
const exactKeep=['PG5-PC-L-024','LG-Q-9139','ECON-NL-FINALBOSS-4010','PM2B2-BIAS-MB-002','ECON-NL-MEDIUMBOSS-3026','ECON-EC-FINALBOSS-19004','P77-MVM-L-021'];
const root=path.resolve(__dirname,'../../..'),scope=require(path.join(root,'audit_tools/macro_faculty_closure_20261006/scope.json'));
for(const id of exactKeep)assert.deepEqual(questions.get(id),scope.find(r=>r.id===id).q,'Exact faculty keep / inspected dependency '+id);
const retierOnly=['PM2A-SRPC-EB-009','PM2B3-PROD-EB-001','ECON-NL-EASYBOSS-2013','PM2C2-ICOST-EB-002','PM2A-EXP-EB-006','LG-Q-9105','LG-Q-9102','LG-Q-9010','LG-Q-9130','PMOE-NER-LB-001','P52A-AD-L-004','P52A-AD-L-006','PM2A-LRPC-L-010','P77-MVM-L-020','P76-MODL-EL-003','ECON-NL-EASYBOSS-2026'];
for(const id of retierOnly){const change=ledger.changes.find(r=>r.id===id);assert(change.fields.every(f=>['difficulty','canonicalDifficulty','checkpointPool'].includes(f)),id+' retier only with explicit unchanged checkpoint stage');}
for(const change of ledger.changes){
 for(const f of ['instructionalRole','sourcePool','originalSourcePool','originalBossTier','requiredConceptIds','modeAllowlist','image','imageAlt','graphDescription','graphRequired'])assert.deepEqual(change.afterRecord[f],change.beforeRecord[f],change.id+'.'+f);
 assert.equal(questions.get(change.id).aHash,hash(questions.get(change.id).options[change.correctIndex]));
}
// Arithmetic and required linked operations, tied to exact reviewed records by
// assertCurrentLibrary above; the workbook ledger is not a broad exemption.
assert.equal((11-2)-((8-2)+1),2);assert.match(questions.get('LG-Q-9123').q,/two-year wage contract/);assert.doesNotMatch(questions.get('LG-Q-9123').q,/one-time increase/);
assert.equal((150-30)-.08*1000,40);assert.match(questions.get('LG-Q-9107').q,/sells \$30.*cuts the required ratio.*raises interest paid/);
assert.equal(240*4.5,1080);assert(Math.abs(1080/2.16-500)<1e-10);assert.match(questions.get('LG-Q-9122').q,/period 1.*period 2/i);assert.match(questions.get('LG-Q-9122').q,/independently verified nominal spending/i);
assert.equal(40*6-40*3,120);assert.match(questions.get('PM2B4-UTYPE-LB-001').q,/Average search lasts/);assert.doesNotMatch(questions.get('PM2B4-UTYPE-LB-001').q,/miners|graduates/i);
assert.equal(7-2,5);assert.equal(9-5,4);assert.equal(7-4,3);assert.equal(9-4,5);assert.match(questions.get('PM2B2-RNI-LB-001').q,/which borrowers benefit/);assert.match(questions.get('PM2B2-RNI-LB-001').feedback,/opposite directions/);
const families=[['ECON-SP-MEDIUMBOSS-3011','ECON-SP-FINALBOSS-4016','ECON-SP-LEGENDARYBOSS-9110'],['ECON-NL-MEDIUMBOSS-3016','ECON-EC-FINALBOSS-19011','ECON-NL-LEGENDARYBOSS-9121','ECON-NL-MEDIUMBOSS-3021','ECON-NL-MEDIUMBOSS-3026'],['ECON-NL-EASYBOSS-2035','ECON-EC-MEDIUMBOSS-18004','ECON-EC-FINALBOSS-19004','PM2B2-RNI-MB-003','PM2B2-RNI-LB-001']];
for(const ids of families)assert.equal(new Set(ids.map(id=>questions.get(id).q.replace(/\d+(\.\d+)?/g,'#'))).size,ids.length,'Different operations, not scaled copies');
// Negative controls: both protected questions and unapproved fields must fail.
for(const [id,field]of [['ECON-MG-EASY-1','q'],['LG-Q-9123','primarySkill']]){const bad=structuredClone(lib);for(const r of c.questionRecords(bad))if(String(r.question.id)===id)r.question[field]='Unauthorized change';assert.throws(()=>approved.assertCurrentLibrary(bad));}
console.log(JSON.stringify({status:'PASS',canonicalIds:questions.size,changedIds:ledger.changes.length,explicitTierAssertions:Object.keys(expected).length,exactKeeps:exactKeep.length,negativeControls:2}));
