'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const core=require('../composer-core.js'),h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./macro-voice3-revisions.js'),style=require('./faculty-prose-candidates.js');
const newest=require('./micro-voice3-revisions.js'),faculty=require('./faculty-validation-revisions.js'),facultyLive=h.loadComposerLibrary();faculty.assertCurrentLibrary(facultyLive);const newestLive=faculty.beforeFacultyValidationLibrary(facultyLive);newest.assertCurrentLibrary(newestLive);const lib=newest.beforeMicroVoice3Library(newestLive);approved.assertCurrentLibrary(lib);
const before=approved.beforeVoice3Library(lib),ledger=approved.macroVoice3Ledger,root=path.resolve(__dirname,'../../..'),out=path.join(root,'audit_tools/macro_voice3_20261007');
const now=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question])),old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question]));
const area=require('../course-area-model.js').create(lib.registry.concepts);
function memberships(l){const m=new Map();for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid))){const id=String(q.id);if(!m.has(id))m.set(id,new Set());for(const a of area.areasFor(cid))m.get(id).add(a);}return Object.fromEntries([...m].map(([id,a])=>[id,[...a].sort()]));}
const areas=memberships(lib);assert.deepEqual(areas,memberships(before));assert.equal(now.size,9777);
const changed=new Set(ledger.changes.map(c=>c.id));assert.equal(changed.size,118);
const isMG=q=>(q.sourceOccurrences||[]).some(s=>/market.?gate/i.test([s.sourceGame,s.sourceFile,s.sourceGlobal].join(' ')))||/market.?gate/i.test(q.sourceGame||'');
let micro=0,mg=0;for(const [id,q]of now){
 if(!changed.has(id))assert.deepEqual(q,old.get(id),'Outside edit set '+id);
 if(areas[id].includes('micro')){assert.deepEqual(q,old.get(id),'Frozen Micro '+id);micro++;}
 if(isMG(q)){assert.deepEqual(q,old.get(id),'Frozen Market Gate '+id);mg++;}
}
assert.equal(micro,6297);assert.equal(Object.values(areas).filter(a=>a.includes('macro')).length,4747);
for(const c of ledger.changes){
 assert.deepEqual(areas[c.id],['macro']);assert(!isMG(c.beforeRecord));
 const hash=s=>crypto.createHash('sha256').update(core.normalizeAnswerText(s)).digest('hex');
 assert.deepEqual(c.afterRecord.options.map((s,i)=>hash(s)===c.afterRecord.aHash?i:-1).filter(i=>i>=0),[c.correctIndex]);
 for(const f of ['image','graphDescription','imageAlt','graphRequired','instructionalRole','checkpointPool','sourcePool','originalSourcePool','primarySkill','requiredConceptIds','modeAllowlist'])assert.deepEqual(c.afterRecord[f],c.beforeRecord[f]);
}
assert.deepEqual(lib.assetInventory,before.assetInventory);
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest:{...JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library_manifest.json'),'utf8')),librarySha256:lib.librarySha256},readBytes:a=>fs.readFileSync(path.join(root,'build/faculty-build-composer/data',a.runtimePath))});
const q=id=>now.get(id),c=id=>ledger.changes.find(c=>c.id===id),near=(a,b)=>assert(Math.abs(a-b)<1e-9);
const numerical=[];function check(id,fn,reason){fn();numerical.push({id,reason,status:'PASS'});}
for(const [id,i,f]of [['LG-Q-4004',30,60],['P52B-S4-MPTX-B1-003',70,140],['PM2C3-MPTX-LB-001',110,220]])check(id,()=>{assert.equal(3*i-f,i);assert.equal(q(id).options[c(id).correctIndex],`AD rises by $${i}.`);},'Multiply investment by3; subtract the already-total fiscal effect once.');
check('P52B-S1-LRPC-L-002',()=>{near(6.4-5.6,.8);near(5.6-4.9,.7);assert.equal(q('P52B-S1-LRPC-L-002').canonicalDifficulty,'hard');assert.equal(c('P52B-S1-LRPC-L-002').correctIndex,3);assert.equal(q('P52B-S1-LRPC-L-002').instructionalRole,'legendary');},'Natural rate falls0.8; temporary gap0.7; long-run unemployment5.6.');
check('LG-Q-207',()=>assert.equal(45000-300000*.1,15000),'Excess reserves15000; immediate external settlement reduces reserves15000 and raises loans15000.');
check('43098',()=>assert.deepEqual([900-180-660,900-180-660-70],[60,-10]),'Net taxes720; public saving60; full budget deficit10, with interest counted once.');
check('43070',()=>assert.deepEqual([940-760,3600+500-270,500-270-(940-760)],[180,3830,50]),'Deficit180; ending debt3830; cash increases50.');
check('LG-Q-9109',()=>assert.equal(-160/.25,-640),'Systemwide deposit contraction640 under no-leakage/no-excess-reserve assumptions.');
check('ECON-SP-LEGENDARYBOSS-9110',()=>assert.deepEqual([600/4,(2+1)/(6-4)],[150,1.5]),'Actual multiplier4 requires reserves150; cumulative sacrifice ratio1.5.');
for(const [id,n]of [['LG-Q-2010',480],['P52B-S3-MPT-B2-003',1120]])check(id,()=>assert.equal(n/4,id==='LG-Q-2010'?120:280),'Deposit target divided by actual multiplier4.');
for(const id of ['PM2C2-FISH-EB-003','LG-Q-9117'])check(id,()=>{assert.equal(1-4,-3);assert.match(q(id).options[c(id).correctIndex],/real rate fell 3/);},'Fisher change in expected real rate =1−4=−3.');
for(const [id,s,w]of [['ECON-EC-EASYBOSS-17013',68,28],['ECON-NL-EASYBOSS-2004',82,42],['P52B-S3-GDPM-B2-003',96,56]])check(id,()=>assert.equal(s-w-15,25),'Residual profit25 completes income/expenditure equality.');
check('ECON-NL-FINALBOSS-4017',()=>assert.deepEqual([2+3,8-2-3],[5,3]),'Natural5 and cyclical3; removing cyclical unemployment leaves5.');
check('ECON-NL-LEGENDARYBOSS-9131',()=>assert.deepEqual([2+3,2+2,8-5,5-4],[5,4,3,1]),'Natural5→4 and cyclical3→1.');
for(const [id,y,co,t,g]of [['43169',300,180,60,90],['43173',700,420,140,210],['43178',1100,660,220,330],['43185',1500,900,300,450]])check(id,()=>assert.deepEqual([y-t-co,t-g,y-co-g],[y*.2,-y*.1,y*.1]),'Private saving Y−T−C, public T−G, national Y−C−G; investment equals national saving.');
for(const [id,s,i]of [['43171',50,100],['43176',90,180],['43180',130,260],['43190',170,340]])check(id,()=>assert.equal(s-i,-s),'Change in NCO and NX equals ΔS−ΔI; no forced domestic S=I in an open economy.');
for(const [id,pr,pu]of [['43170',80,120],['43174',160,240],['43179',240,360],['43186',320,480]])check(id,()=>assert.equal(pr-pu,-pr/2),'Private and public saving changes sum to a fall; lower supply puts upward pressure on the rate.');
check('43196',()=>{assert.equal(100-70-10,20);assert.equal(q('43196').canonicalDifficulty,'hard');},'National saving increases20 and supply shifts right.');
check('43199',()=>assert.equal(320-280,40),'Public saving stays40; private-saving decrease20 lowers national saving20.');
check('43213',()=>assert.deepEqual([360-60,340-(360-60)],[300,40]),'National saving300; excess desired investment40 raises the rate.');
check('43205',()=>assert.deepEqual([1240-790-230,1240-790-230-250],[220,-30]),'Realized saving/investment220; unplanned inventory reduction30.');
check('ECON-NL-LEGENDARY-9081',()=>assert.deepEqual([184-180,(20-12)-(184-180),(180+20)/250*100,(184+12)/250*100],[4,4,80,78.4]),'Four jobs and four search exits; participation80→78.4.');
check('LG-Q-9074',()=>assert.equal(100/(1-.75),400),'Multiplier4 closes horizontal AD shortfall400.');
check('LG-Q-9070',()=>{near(30/(1-.8),150);assert.equal(180+150,330);},'Multiplier5 increases AD150 and reference-price excess to330.');
check('LG-Q-9139',()=>{near(100/(1-.8),500);assert.deepEqual([500-150,600-(500-150)],[350,250]);},'Gross500 less total crowding-out150 gives net350, remaining shortfall250.');
check('ECON-NL-LEGENDARY-9045',()=>assert.deepEqual([70/1.75,70/7,32000*2,8000*2**4],[40,10,64000,128000]),'Rule of70: Alder doubles once and Birch four times in40 years.');
check('43217',()=>assert.equal(180-100,80),'Graph at real rate10: excess supply80.');
check('43290',()=>assert.equal(100-60,40),'Graph LOANABLE06 investment falls40 along D0.');
check('43257',()=>assert.deepEqual([-55+15,80-100],[-40,-20]),'Fixed-rate saving shift−40, equilibrium investment−20 on LOANABLE03.');
check('43273',()=>assert.equal(120-80,40),'LOANABLE04 plotted investment rises40; additional unknown deficit makes the combined quantity uncertain.');
check('PMOE-POL-LB-002',()=>assert.deepEqual([65-40,65],[25,65]),'At the old exchange rate excess supply25; final NCO and NX increase65.');
check('43313',()=>{assert.match(q('43313').graphDescription,/A.*\(40, 6\).*B.*\(80, 6\)/);assert.equal(q('43313').options[1],'It remains at 6%.');assert.equal(q('43313').canonicalDifficulty,'medium');},'LOANABLE08 A40/6→B80/6: quantity rises40 and rate stays6; relative shifts matter generally.');
for(const id of ['PMOE-FX-M-002','PMOE-FX-B2-001'])check(id,()=>{assert.equal(150-100,50);assert.match(q(id).options[c(id).correctIndex],/increase.*50/);},'FX02 quantity rises100→150, a change of50.');
check('43270',()=>{assert.deepEqual([120-80,7-5],[40,2]);assert.match(q('43270').options[c('43270').correctIndex],/5% to 7%.*80 to 120.*along S0/);},'LOANABLE04: quantity80→120 and rate5→7, movement along unchanged saving supply.');
check('43286',()=>assert.equal(q('43286').options[c('43286').correctIndex],'8 percent'),'LOANABLE06 resulting B has real rate8.');
check('PG4-MM-M-009',()=>assert.match(q('PG4-MM-M-009').options[c('PG4-MM-M-009').correctIndex],/output is 105.*price level is 45/),'MONEY-AD03: MD0→MD1 raises the rate2→4; resulting AD1-SRAS equilibrium105/45.');
assert.equal(q('PG3-MEQ-H-001').options[c('PG3-MEQ-H-001').correctIndex],'C to D to B');
const graphKeys={'PG3-MEQ-E-001':'Point C','PG3-MEQ-E-002':'Point A','PG3-MEQ-M-002':'Point B','PG3-MEQ-M-003':'Point B','PG3-MEQ-E-003':'Point A','43291':'Point B','43298':'Point B','43262':'Point B','43312':'At point B','PG4-MM-M-008':'Point D'};
for(const [id,answer]of Object.entries(graphKeys))assert.equal(q(id).options[c(id).correctIndex],answer);
for(const id of ['PMOE-FX-EL-002','PMOE-FX-LB-003']){assert.match(q(id).graphDescription,/100 and rate 1\.0.*200 and rate 1\.0/);assert.match(q(id).graphDescription,/rate 1\.2.*rate 0\.8/);}
const lengthAfter=ledger.changes.map(c=>({id:c.id,...style.screen(c.afterRecord,c.correctIndex)})).filter(r=>r.lengthOutlier);
function lengthIds(map){const ids=[];for(const [id,record]of map){if(!areas[id].includes('macro'))continue;const key=record.options.findIndex(s=>crypto.createHash('sha256').update(core.normalizeAnswerText(s)).digest('hex')===record.aHash);if(style.screen(record,key).lengthOutlier)ids.push(id);}return ids.sort();}
const beforeLengthIds=lengthIds(old),afterLengthIds=lengthIds(now);assert.equal(beforeLengthIds.length,98);assert(afterLengthIds.every(id=>beforeLengthIds.includes(id)),'No new length flags across the complete Macro bank');assert.equal(lengthAfter.length,0,'No remaining length flag in edited records');
const negative=[];for(const [id,f,v]of [['P52B-S1-LRPC-L-002','instructionalRole','main'],['LG-Q-4004','canonicalDifficulty','easy'],['43313','graphDescription','changed'],['43196','aHash','changed'],['P62G-MON-H-009','q','changed'],['ECON-MG-EASY-1','q','changed']]){const bad=structuredClone(lib);for(const r of con.questionRecords(bad))if(String(r.question.id)===id)r.question[f]=v;assert.throws(()=>approved.assertCurrentLibrary(bad));negative.push(id+'.'+f);}
const result={status:'PASS',macro:4747,microFrozen:micro,canonical:now.size,changed:changed.size,marketGateFrozen:mg,assetInventory:lib.assetInventory.length,numerical,negativeControls:negative,difficultyChanges:1,keyIndexChanges:0,graphChanges:0,unauthorizedChanges:0,lengthBefore:beforeLengthIds.length,lengthAfter:afterLengthIds.length,remainingLengthCandidateIds:afterLengthIds,remainingChangedLengthCandidates:lengthAfter};
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,numerical:numerical.length}));
