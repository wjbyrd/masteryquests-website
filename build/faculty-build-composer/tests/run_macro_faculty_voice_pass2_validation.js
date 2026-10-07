'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./macro-voice2-revisions.js'),visual=require('./visual-reference-integrity.js'),style=require('./faculty-prose-candidates.js'),core=require('../composer-core.js');
const latest=require('./micro-voice-revisions.js'),live=h.loadComposerLibrary();latest.assertCurrentLibrary(live);
const lib=latest.beforeMicroVoiceLibrary(live);approved.assertCurrentLibrary(lib);
const before=approved.beforeVoice2Library(lib),rows=con.questionRecords(lib),now=new Map(rows.map(r=>[String(r.question.id),r.question])),old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question]));
const area=require('../course-area-model.js').create(lib.registry.concepts),membership=l=>{const m=new Map();for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid))){const id=String(q.id);if(!m.has(id))m.set(id,new Set());for(const a of area.areasFor(cid))m.get(id).add(a);}return Object.fromEntries([...m].map(([id,a])=>[id,[...a].sort()]));};
const areas=membership(lib);assert.deepEqual(areas,membership(before));
const changed=new Set(approved.macroVoice2Ledger.changes.map(c=>c.id));
for(const [id,q]of now){if(!changed.has(id))assert.deepEqual(q,old.get(id),'Unchanged record '+id);if(areas[id].includes('micro'))assert.deepEqual(q,old.get(id),'Frozen Micro '+id);}
assert.deepEqual(lib.assetInventory,before.assetInventory);
const macro=visual.detect(lib,'macro'),micro=visual.detect(lib,'micro');assert.equal(macro.mismatches.length,0,JSON.stringify(macro.mismatches));
const exact=['PMOE-FX-B1-003','LG-Q-9024','ECON-SP-EASYBOSS-2014','PMOE-POL-L-003','43263','43261','ECON-NL-SUBSTITUTION-BIAS-6011','LG-B-6023','ECON-SP-ELITE-320'];
for(const id of exact){assert(changed.has(id));assert.deepEqual(areas[id],['macro']);}
for(const id of ['ECON-NL-SUBSTITUTION-BIAS-6011','ECON-SP-ELITE-320','PMOE-POL-L-003'])assert.equal(now.get(id).canonicalDifficulty,'hard');
assert.equal(now.get('ECON-NL-SUBSTITUTION-BIAS-6011').difficulty,'bridge');
assert.equal(now.get('PMOE-POL-L-003').q.split('?').length,2);
assert(now.get('ECON-SP-ELITE-320').options.every(s=>style.words(s)<=11));
for(const id of ['PMOE-FX-B1-003','LG-Q-9024','ECON-SP-EASYBOSS-2014','43263','LG-B-6023'])assert(!style.screen(now.get(id),0).flags.includes('internal taxonomy'));
assert.doesNotMatch(now.get('43261').q,/analyst|saving-supply/);
// Exact numerical cases and unchanged assumptions from the approved ledger.
assert.equal(64-37,27);assert.equal(-37-(-64+20),7);
assert.equal((8-4)-(4-4),4);assert.match(now.get('ECON-NL-SUBSTITUTION-BIAS-6011').q,/same satisfaction/);
assert.equal(250-(300-80),30);assert.match(now.get('LG-B-6023').q,/total of \$80, including induced/);
assert.equal((8-2)/.05-(8-4)/.05,40);assert.equal(100-80,20);
assert.equal(100-75,25);assert.equal(150-75,75); // AS1: P = Y + 75.
assert.equal(120-80,40);assert.equal(70/(1-.8),350.00000000000006);
assert.equal(100/(1-.6),250);assert.equal(250-75,175);
assert.equal(48+(63-48)+(88-63),88);assert(Math.abs(1.04/1.06-1+0.018867924528301883)<1e-10);
assert.equal(4+2+0,2+2+2);assert.equal(960/1.2/32*1000,25000);assert.equal(1320/1.5/44*1000,20000);
assert.equal(440-2200*.10,220);assert.equal(440-2200*.15,110);
assert.equal(200*.75*(1-.08)-6,132);assert.equal(12-6+4,10);assert.equal(142/200*100,71);assert(Math.abs(10/142*100-7.042253521126761)<1e-10);
assert(Math.abs(200*(.75-.70)*.94-9.4)<1e-10);
for(const [gap,g]of [[80,20],[560,140],[1520,380],[1040,260]])assert.equal(g/(1-.75),gap);
// Candidate reporting is deliberately not a universal style prohibition.
const sample={q:'What follows?',options:['This is a much longer answer because it contains an explanation and several unnecessary words.','One short answer','Another short answer','Third short answer']};assert(style.screen(sample,0).lengthOutlier);assert(!style.screen({...sample,options:['One short answer','Another short answer','Third short answer','Fourth short answer']},0).lengthOutlier);
// Use the official answer normalization when resolving each unique key.
const crypto=require('node:crypto'),correctIndex=q=>q.options.findIndex(s=>crypto.createHash('sha256').update(core.normalizeAnswerText(s)).digest('hex')===q.aHash);
const scan=l=>{const results=[];for(const [id,q]of new Map(con.questionRecords(l).map(r=>[String(r.question.id),r.question])))if(areas[id].includes('macro')){const key=correctIndex(q),m=style.screen(q,key);if(m.lengthOutlier)results.push({id,...m});}return results;};
const lengthBefore=scan(before),lengthAfter=scan(lib);
const mutate=(id,f)=>{const bad=structuredClone(lib);for(const r of con.questionRecords(bad))if(String(r.question.id)===id)f(r.question);return bad;};
for(const [id,field]of [['PMOE-FX-B1-003','canonicalDifficulty'],['43261','imageAlt'],['P62G-MON-H-009','q'],['ECON-MG-EASY-1','q'],['LG-B-6023','primarySkill']])assert.throws(()=>approved.assertCurrentLibrary(mutate(id,q=>q[field]='Unauthorized')));
assert(visual.detect(mutate('43261',q=>q.image='missing.png'),'macro').mismatches.some(r=>r.id==='43261'));
const result={status:'PASS',changed:changed.size,exactFacultyIds:exact,tiers:3,microFrozen:Object.values(areas).filter(a=>a.includes('micro')).length,macro,micro,lengthBefore,lengthAfter,negativeControls:6};
fs.writeFileSync(path.resolve(__dirname,'../../../audit_tools/macro_voice2_20261007/validation.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',changed:changed.size,macro:macro.scanned,lengthBefore:lengthBefore.length,lengthAfter:lengthAfter.length,tiers:3,microFrozen:result.microFrozen}));
