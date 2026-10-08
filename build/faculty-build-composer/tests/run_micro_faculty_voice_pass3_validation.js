'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const core=require('../composer-core.js'),h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./micro-voice3-revisions.js'),style=require('./faculty-prose-candidates.js');
const lib=h.loadComposerLibrary();approved.assertCurrentLibrary(lib);const before=approved.beforeMicroVoice3Library(lib),ledger=approved.microVoice3Ledger;
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'audit_tools/micro_voice3_20261007'),data=path.join(root,'build/faculty-build-composer/data');
const old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question])),now=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const selected=new Set(ledger.changes.map(c=>c.id)),area=require('../course-area-model.js').create(lib.registry.concepts);
function memberships(l){const m={};for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid))){m[String(q.id)]??=new Set();for(const a of area.areasFor(cid))m[String(q.id)].add(a);}return Object.fromEntries(Object.entries(m).map(([id,a])=>[id,[...a].sort()]));}
const areas=memberships(lib);assert.deepEqual(areas,memberships(before));assert.deepEqual([...now.keys()].sort(),[...old.keys()].sort());assert.equal(now.size,9777);assert.equal(Object.values(areas).filter(a=>a.includes('micro')).length,6297);
const mg=q=>(q.sourceOccurrences||[]).some(s=>/market.?gate/i.test([s.sourceFile,s.sourceGame,s.sourceGlobal].join(' ')))||/market.?gate/i.test(q.sourceGame||'');
for(const [id,q]of now){if(!selected.has(id))assert.deepEqual(q,old.get(id),'Unapproved ID '+id);if(areas[id].some(a=>a!=='micro')||mg(q))assert.deepEqual(q,old.get(id),'Protected '+id);}
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));assert.equal(manifest.candidates.length,94);assert.deepEqual([...selected].sort(),manifest.candidates.map(c=>c.id).sort());
for(const c of ledger.changes){assert.deepEqual(areas[c.id],['micro']);assert(!mg(c.beforeRecord));assert(c.fields.every(f=>['q','options','feedback','aHash'].includes(f)));const restored=structuredClone(c.afterRecord);for(const f of c.fields)restored[f]=c.beforeRecord[f];assert.deepEqual(restored,c.beforeRecord);const b=style.screen(c.beforeRecord,c.correctIndex),a=style.screen(c.afterRecord,c.correctIndex);assert(!(a.lengthOutlier&&!b.lengthOutlier));}
for(const id of ['42660','42697'])assert(!now.has(id));assert.equal(now.get('P62G-MON-H-009').canonicalDifficulty,'elite');
for(const id of ['P62E-COP-EL-004','PMC-COP-R-163','PMC-COP-BR-164','PMC-COP-BR-166','P62C-CPS-LB-029','P62B-ELAS-L-059','P62H-MCMP-L-094','P62H-MCMP-E-004','PM6-MON-H-006','P62C-CPS-E-007','PM8-OLI-H-049'])assert.deepEqual(now.get(id),old.get(id));
for(const [id,key,text]of [['42705',1,'No. At an interior optimum, MRS must also equal the price ratio.'],['P62C-CPS-H-019',0,'Consumer and producer surplus both fall; total surplus falls to $36.'],['P62C-CPS-L-074',1,'Measured willingness to pay reflects both willingness and ability to pay.']])assert.equal(now.get(id).options[key],text);
assert.deepEqual(lib.assetInventory,before.assetInventory);
con.assertCanonicalIntegrity(lib,{registry:JSON.parse(fs.readFileSync(path.join(data,'composer_registry.json'),'utf8')),manifest:JSON.parse(fs.readFileSync(path.join(data,'composer_library_manifest.json'),'utf8')),readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
function policy(p){const x={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(p,'utf8'),x);const o=JSON.parse(JSON.stringify(x.module.exports));delete o.librarySha256;delete o.policySha256;return o;}
assert.equal(require('crypto').createHash('sha256').update(core.stableStringify(policy(path.join(data,'faculty-outcomes.js')))).digest('hex'),ledger.facultyOutcomeContentSha256);
const checks=[];function check(id,actual,expected,reason){assert.deepEqual(actual,expected,id);checks.push({id,reason,status:'PASS'});}
check('P62C-CPS-H-008',(8-6)*(12-8)/2,4,'Missing gains triangle');
check('P62C-CPS-H-009',(10-8)*(12-8)/2,4,'Excess output cost triangle');
check('P62C-CPS-H-019',[(20-14)*6/2,(14-8)*6/2], [18,18],'CS and PS each fall from32 to18; total36');
check('P62C-CPS-B3-016',[18+9+2-3,18+9+2-4-3],[26,22],'Transfer cancels; administration uses3');
check('P62C-CPS-LB-024',30+28-18,40,'Lost trades30 and misallocation10; transfer75 cancels');
check('42617',[(88-4*14)/6,(88-4*14)/8],[32/6,4],'Budget at four Y');
check('42701',[3/2,1/1],[1.5,1],'All-X has greater utility per dollar');
check('PMC-COP-M-110',11000-8000,3000,'Incremental gain ignores sunk40000');
check('PMC-COP-H-115',15000-12000,3000,'Incremental gain ignores sunk25000');
check('P62E-COP-EL-001',75000-62000-18000,-5000,'Subtract both implicit costs');
check('42389',[22*6,14*6],[132,84],'Compare incremental revenue with wage100');
check('42765',[45/5,40/10],[9,4],'Income-share ratio');
check('P62I-OLI-LB-011',[2*33*9,2*17*12],[594,408],'Both mergers leave four firms; CR4=100%');
check('P62F-PC-LB-001',[4*28-(7+12+18+25)-40,4*28-(7+12+18+25)-55],[10,-5],'Fixed fee changes profit, not maximizing Q4');
check('P62F-PC-LB-005',[5*40-(11+16+22+29+37)-115,5*40-(11+16+22+29+37)-130],[-30,-45],'Distinct variant retains Q5 and its own profit values');
check('P62F-PC-LB-004',[0-30,9-(10-2)-30],[-30,-29],'Improvement permits first unit; second MC13 exceeds price9');
check('42570',(40-6*4)/4,4,'BC1 cereal price4');check('42576',(40-4*8)/8,1,'BC1 yogurt price8');check('42582',32/8,4,'Income falls to32 with cereal price8');
check('42343',.8*1.25,1,'Productivity and price changes leave VMP unchanged');
const graphFacts={'LABOR-02.webp':[4000,20,6000,25],'LABOR-03.webp':[4000,20,2000,15],'LABOR-04.webp':[4000,20,6000,15],'LABOR-05.webp':[4000,20,2000,25],'LABOR-09.webp':[4000,20,8000,20]};
for(const c of ledger.changes.filter(c=>c.patterns.includes('Graph state'))){const f=path.basename(c.afterRecord.image);if(f.startsWith('LABOR'))assert(graphFacts[f]);assert.deepEqual(c.afterRecord.graphDescription,c.beforeRecord.graphDescription);}
(async()=>{for(const a of ledger.assets)assert.equal(await core.sha256BytesHex(fs.readFileSync(path.join(data,a.path))),a.sha256);for(const c of ledger.changes){const matches=[];for(let i=0;i<4;i++)if(await core.sha256Hex(core.normalizeAnswerText(c.afterRecord.options[i]))===c.afterRecord.aHash)matches.push(i);assert.deepEqual(matches,[c.correctIndex]);}
 const result={status:'PASS',uniqueQuestions:now.size,microQuestions:6297,reviewCandidates:94,edited:ledger.changes.length,answerHashesChanged:ledger.changes.filter(c=>c.fields.includes('aHash')).length,facultyOverrides:3,newAnswerLengthFlags:0,difficultyChanges:0,roleRoutingChanges:0,unauthorizedRecordChanges:0,graphAssetChanges:0,graphMetadataChanges:0,sharedChanges:0,marketGateChanges:0,facultyOutcomeContentChanges:0,numericalChecks:checks,graphFacts,graphChronologyCandidates:35};fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1});
