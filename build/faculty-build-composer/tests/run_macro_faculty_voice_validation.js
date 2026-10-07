'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./macro-voice-revisions.js'),visual=require('./visual-reference-integrity.js');
const pass2=require('./macro-voice2-revisions.js'),actual=h.loadComposerLibrary();pass2.assertCurrentLibrary(actual);
const lib=pass2.beforeVoice2Library(actual);approved.assertCurrentLibrary(lib);
const before=approved.beforeVoiceLibrary(lib),current=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const macro=visual.detect(lib,'macro'),micro=visual.detect(lib,'micro'),baselineMacro=visual.detect(before,'macro');
assert.equal(macro.mismatches.length,0,JSON.stringify(macro.mismatches));
// Micro is detection only: report findings without changing its records or
// making this Macro-only editorial pass a prerequisite for Micro remediation.
for(const r of con.questionRecords(before))if(!approved.macroVoiceLedger.changes.some(c=>c.id===String(r.question.id)))assert.deepEqual(current.get(String(r.question.id)),r.question);
assert.deepEqual(lib.assetInventory,before.assetInventory);
for(const id of ['PMOE-FX-H-005','PMOE-FX-EL-001'])assert.doesNotMatch(current.get(id).q,/use the dollar market|graph|figure|diagram/i);
for(const q of current.values())if(q.primaryConceptId==='real-exchange-rates-and-purchasing-power')assert.doesNotMatch([q.q,...q.options,q.feedback].join(' '),/\b(?:nominal|real) rates?\b/);
const mutate=(id,fn)=>{const bad=structuredClone(lib);for(const r of con.questionRecords(bad))if(String(r.question.id)===id)fn(r.question);return bad;};
assert(visual.detect(mutate('PMOE-FX-H-005',q=>q.q='Refer to the graph. What happens?'),'macro').mismatches.some(r=>r.id==='PMOE-FX-H-005'));
assert(visual.detect(mutate('43082',q=>q.q='Refer to the figure above.'),'macro').mismatches.some(r=>r.id==='43082'),'Allowlisting is tied to exact approved wording');
assert(visual.detect(mutate('ECON-SP-EASY-38',q=>q.image='missing.png'),'macro').mismatches.some(r=>r.id==='ECON-SP-EASY-38'));
assert(visual.detect(lib,'macro',()=>Buffer.from('invalid bytes')).mismatches.length>0);
for(const [id,field]of [['PMOE-FX-H-005','canonicalDifficulty'],['P62G-MON-H-009','q'],['ECON-MG-EASY-1','q']])assert.throws(()=>approved.assertCurrentLibrary(mutate(id,q=>q[field]='Unauthorized edit')));
const result={status:'PASS',changed:approved.macroVoiceLedger.changes.length,baselineMacro,macro,micro,negativeControls:7};
fs.writeFileSync(path.resolve(__dirname,'../../../audit_tools/macro_voice_20261006/visual-validation.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,changed:result.changed,macro:{scanned:macro.scanned,references:macro.references,validImages:macro.validImages.length,allowlisted:macro.allowlisted.length,mismatches:macro.mismatches.length},baselineMacroMismatches:baselineMacro.mismatches.length,micro:{scanned:micro.scanned,references:micro.references,allowlisted:micro.allowlisted.length,mismatches:micro.mismatches.length},negativeControls:result.negativeControls}));
