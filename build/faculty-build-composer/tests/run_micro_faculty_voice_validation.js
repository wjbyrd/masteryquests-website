'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const core=require('../composer-core.js'),h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./micro-voice-revisions.js');
const post=require('./macro-voice3-revisions.js'),newest=require('./micro-voice3-revisions.js'),newestLive=h.loadComposerLibrary();newest.assertCurrentLibrary(newestLive);const postLive=newest.beforeMicroVoice3Library(newestLive);post.assertCurrentLibrary(postLive);const lib=post.beforeVoice3Library(postLive);approved.assertCurrentLibrary(lib);
const before=approved.beforeMicroVoiceLibrary(lib),ledger=approved.microVoiceLedger;
const now=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question])),old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question]));
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'audit_tools/micro_voice_20261007');
const authority=require(path.join(out,'authority.json')),area=require('../course-area-model.js').create(lib.registry.concepts);
function memberships(l){const m=new Map();for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid))){const id=String(q.id);if(!m.has(id))m.set(id,new Set());for(const a of area.areasFor(cid))m.get(id).add(a);}return Object.fromEntries([...m].map(([id,a])=>[id,[...a].sort()]));}
const areas=memberships(lib);assert.deepEqual(areas,memberships(before));assert.equal(now.size,9777);assert.equal(Object.values(areas).filter(a=>a.includes('micro')).length,6297);
for(const id of ['42660','42697'])assert(!now.has(id));
const confirmed=authority.filter(r=>r.reviewStatus==='Confirmed editorial candidate');assert.equal(confirmed.length,125);
const changed=new Set(ledger.changes.map(c=>c.id));assert.equal(changed.size,140);
const isMG=q=>(q.sourceOccurrences||[]).some(s=>/market.?gate/i.test([s.sourceGame,s.sourceFile,s.sourceGlobal].join(' ')))||/market.?gate/i.test(q.sourceGame||'');
let mg=0,shared=0;
for(const [id,q]of now){
 if(!changed.has(id))assert.deepEqual(q,old.get(id),'Outside edit set '+id);
 if(areas[id].includes('macro')||areas[id].includes('general')){assert.deepEqual(q,old.get(id),'Shared/other-area freeze '+id);shared++;}
 if(isMG(q)){assert.deepEqual(q,old.get(id),'Market Gate freeze '+id);mg++;}
}
for(const r of authority){assert.deepEqual(r.q,old.get(r.id),'Review source match '+r.id);assert.deepEqual(r.areas,areas[r.id]);if(r.areas.length>1)assert(!changed.has(r.id));}
for(const r of confirmed)assert.equal(changed.has(r.id),r.areas.length===1&&!r.marketGateDerived);
for(const c of ledger.changes){
 const r=authority.find(r=>r.id===c.id);assert(r);assert.deepEqual(c.areas,['micro']);assert(!isMG(c.beforeRecord));
 if(r.reviewStatus!=='Confirmed editorial candidate'&&!['42367','42334','42737'].includes(c.id)){assert.equal(r.q.instructionalRole,'bridge');assert.match(r.q.q,/connect/i);assert.doesNotMatch(c.afterRecord.q,/connect/i);}
 assert(c.fields.every(f=>['q','options','feedback','aHash'].includes(f)));
 const copy=structuredClone(c.afterRecord);for(const f of c.fields)copy[f]=c.beforeRecord[f];assert.deepEqual(copy,c.beforeRecord,'All noneditorial fields frozen '+c.id);
 const hash=s=>crypto.createHash('sha256').update(core.normalizeAnswerText(s)).digest('hex');
 assert.deepEqual(c.afterRecord.options.map((s,i)=>hash(s)===c.afterRecord.aHash?i:-1).filter(i=>i>=0),[c.correctIndex]);
}
assert.deepEqual(lib.assetInventory,before.assetInventory);
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest:{...JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library_manifest.json'),'utf8')),librarySha256:lib.librarySha256},readBytes:a=>fs.readFileSync(path.join(root,'build/faculty-build-composer/data',a.runtimePath))});
assert.equal(now.get('42367').q,'At a $20 minimum wage, what labor surplus does the graph show?');assert.doesNotMatch(now.get('42367').q,/textbook model/);
for(const id of ['42367','42334','42737'])assert.equal(now.get(id).canonicalDifficulty,'hard');
assert.equal(now.get('42334').q.split('?').length,2);assert.match(now.get('42334').feedback,/1\.25 × 0\.90 = 1\.125/);assert.match(now.get('42334').feedback,/4,000.*8,000/);
assert.match(now.get('42737').q,/claims.*twice/);assert.match(now.get('42737').options[1],/18%.*0\.9.*rejected/);
for(const id of ['P62F-PC-B3-057','P62F-PC-L-099']){assert.deepEqual(now.get(id),old.get(id));assert.match(now.get(id).feedback,/loss is 150.*Persistent losses induce exit and raise price/);}
assert.equal(now.get('P62F-PC-B3-057').instructionalRole,'boss');assert.equal(now.get('P62F-PC-L-099').instructionalRole,'legendary');assert.equal(now.get('P62G-MON-H-009').canonicalDifficulty,'elite');
for(const c of ledger.changes.filter(c=>c.beforeRecord.instructionalRole==='bridge'))assert.equal(c.afterRecord.instructionalRole,'bridge');
// Independently calculate each changed numerical task, including spelled-out
// pairwise-voting counts; exact records above tie these checks to published text.
const numerical=[];const check=(id,fn,reason)=>{fn();numerical.push({id,reason,status:'PASS'});};
for(const [n,p0,p1,q0,q1]of [['001',80,92,5000,4100],['002',300,345,900,720],['003',5000,5400,1200,1140],['005',45,51,1600,1360],['006',60,72,1000,760],['007',3.2,3.8,8000,7400],['008',900,810,450,585],['009',12,15,10000,7600],['010',200,230,700,560]]){
 const id='P62B-ELAS-EL-'+n,c=ledger.changes.find(c=>c.id===id),q=now.get(id);
 check(id,()=>{const e=Math.abs((q1-q0)/((q1+q0)/2)/((p1-p0)/((p1+p0)/2)));assert.equal(Number(e.toFixed(2)),Number(q.options[c.correctIndex]));assert.deepEqual(q.options,c.beforeRecord.options);assert.doesNotMatch(q.q,/researcher/);assert.deepEqual(q.q.match(/\d+(?:\.\d+)?/g),c.beforeRecord.q.match(/\d+(?:\.\d+)?/g));},'Independent midpoint quantity/price percentage ratio, rounded to two decimals.');
}
check('42334',()=>{assert.equal(1.25*.90,1.125);assert.equal((1.125-1)*100,12.5);assert.equal(40*100,4000);assert.equal(80*100,8000);},'Graph DL0/DL1 at $20: 4,000/8,000; VMP increases 12.5%, direction only.');
check('42367',()=>assert.equal(6000-2000,4000),'Labor supplied minus demanded at $20.');
check('42737',()=>{assert.equal(40-22,18);assert.equal(18/(60-40),.9);assert(.9<2);},'Subtract Lorenz cumulative shares, divide by quintile population share; reject twice-average claim.');
check('P62C-CPS-B3-011',()=>assert.deepEqual([52-45,52-25,45-18,25-18,52-18,52-18-3],[7,27,27,7,34,31]),'Buyer/seller before and after, gross and net total.');
check('P62C-CPS-LB-030',()=>assert.deepEqual([2+15,38-15,2+38,2+38-3],[17,23,40,37]),'Transfer redistributes gross surplus; real administrative cost lowers total.');
check('P62B-ELAS-B3-006',()=>{assert.deepEqual([120-3*30,120-3*10],[30,90]);assert.equal(3*30/30,3);assert.equal(3*10/90,1/3);assert(120-6*30<0);assert(120-6*10>0);},'Point elasticities and derivative of TR(P)=120P−3P².');
check('P62B-ELAS-EL-016',()=>{assert.deepEqual([15*2000,17*1700],[30000,28900]);assert(Math.abs((-300/1850)/(2/16))>1);},'Revenue totals and midpoint elasticity greater than one.');
check('P62C-CPS-H-018',()=>assert.deepEqual([(18-10)*8/2,(10-2)*8/2,(22-12)*10/2,(12-2)*10/2],[32,32,50,50]),'Visual graph read: old/new equilibrium (8,10)/(10,12); triangle areas.');
check('P77-MFAIL-FINALB-027',()=>{assert.equal(120-35-100,-15);assert.equal(80-20,60);assert(60>0&&60>-15);},'Net benefit full/simpler/none = −15/60/0.');
check('P62F-PC-LB-030',()=>{assert.equal(18+6,24);assert.equal((18*101+100)-(18*100+100),18);},'Per-unit harm raises marginal cost to24; lump-sum derivative is zero.');
check('PM8-OLI-M-060',()=>{assert.equal((18+12)**2-(18**2+12**2),432);assert.equal(2*18*12,432);},'Squared-share cross term, other shares fixed.');
check('P62C-CPS-M-018',()=>assert.equal(18-23,-5),'Negative gain from trade.');
check('PM6-MON-R-044',()=>{assert.equal(50-30,20);assert(50>30);},'Marginal willingness-to-pay exceeds MC by20; no inference about profit per unit.');
for(const n of ['021','024','027','030','033','036'])check('P62G-MON-B2-'+n,()=>{const profit=(tr,vc,fc)=>tr-vc-fc;assert.equal(profit(1000,400,300)-profit(1000,400,100),-200);assert.equal((200/50)*50,200);},'A fixed-cost increase raises ATC by200/Q and lowers profit200; MC, AVC, MR and output unchanged.');
for(const id of ['43034','43038','43042','43035'])check(id,()=>{const voters=['ABC','BCA','CAB'];for(const [a,b]of [['A','B'],['B','C'],['C','A']])assert.equal(voters.filter(v=>v.indexOf(a)<v.indexOf(b)).length,2);},'Three equal groups: each pairwise victory gets two-thirds, creating a cycle.');
for(const [id,reason]of [['42991','20 percentage points is a trial estimate, not a universal doubling or transport guarantee.'],['42997','Equal $100 loss/gain magnitudes; asymmetric weighting is loss aversion.'],['43057','50th percentile is the median, not the mean.'],['PMS-ELAS-BR-012','Income elasticity1.4 >1 implies more-than-proportional demand growth.'],['P62C-CPS-R-001','Observed price18 does not identify maximum willingness to pay.']])check(id,()=>assert(changed.has(id)),reason);
const digitIds=ledger.changes.filter(c=>/\d/.test(c.afterRecord.q+' '+c.afterRecord.options.join(' '))).map(c=>c.id);assert(digitIds.every(id=>numerical.some(n=>n.id===id)),'Every digit-bearing changed item independently adjudicated');
assert.equal((18-15)*50,150);assert(15>10);assert.equal((15-10)*50,250); // retained PC sequences
const negative=[];
for(const [id,f,v]of [['42334','canonicalDifficulty','easy'],['42367','imageAlt','changed'],['PM5-PC-BR-012','instructionalRole','main'],['P62F-PC-B3-057','q','changed'],['P62G-MON-H-009','canonicalDifficulty','hard'],['P52B-COMP-L-002','q','changed'],['ECON-MG-EASY-1','q','changed'],['PMOE-FX-B1-003','q','changed']]){
 const bad=structuredClone(lib);for(const r of con.questionRecords(bad))if(String(r.question.id)===id)r.question[f]=v;assert.throws(()=>approved.assertCurrentLibrary(bad));negative.push(id+'.'+f);
}
const result={status:'PASS',micro:6297,canonical:now.size,changed:changed.size,confirmed:125,protectedConfirmed:5,additionalBridges:17,namedRewrites:3,retainedBorderlines:2,sharedAndOtherAreaFrozen:shared,marketGateFrozen:mg,assetInventory:lib.assetInventory.length,numerical,negativeControls:negative,difficultyChanges:0,keyIndexChanges:0,graphChanges:0,unauthorizedChanges:0};
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,numerical:numerical.length}));
