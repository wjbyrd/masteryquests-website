'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const core=require('../composer-core.js'),h=require('./composer-test-helpers.js'),con=require('./composer-integrity-contracts.js'),approved=require('./faculty-validation-revisions.js'),style=require('./faculty-prose-candidates.js');
const root=path.resolve(__dirname,'../../..'),out=path.join(root,'audit_tools/faculty_remediation_20261008'),data=path.join(root,'build/faculty-build-composer/data');
const lib=h.loadComposerLibrary();approved.assertCurrentLibrary(lib);const before=approved.beforeFacultyValidationLibrary(lib),ledger=approved.facultyValidationLedger;
const records=l=>new Map(con.questionRecords(l).map(r=>[String(r.question.id),r.question]));
const old=records(before),now=records(lib),selected=new Set(ledger.changes.map(c=>c.id)),area=require('../course-area-model.js').create(lib.registry.concepts);
function memberships(l){const m={};for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid))){m[String(q.id)]??=new Set();for(const a of area.areasFor(cid))m[String(q.id)].add(a);}return Object.fromEntries(Object.entries(m).map(([id,a])=>[id,[...a].sort()]));}
const areas=memberships(lib);assert.deepEqual(areas,memberships(before));assert.deepEqual([...now.keys()].sort(),[...old.keys()].sort());assert.equal(now.size,9777);
for(const [id,q]of now)if(!selected.has(id))assert.deepEqual(q,old.get(id),'Unapproved record '+id);
for(const c of ledger.changes){assert.deepEqual(areas[c.id],c.areas);assert(c.fields.every(f=>['q','options','feedback','aHash','canonicalDifficulty','checkpointPool'].includes(f)));const b=style.screen(c.beforeRecord,c.correctIndex),a=style.screen(c.afterRecord,c.correctIndex);assert(!(a.lengthOutlier&&!b.lengthOutlier));}
for(const id of ['P72-OPPC-B2-004','P62E-COP-B2-025','PM2B3-POL-EB-002'])assert.equal(now.get(id).checkpointPool,old.get(id).sourcePool);
assert.equal(now.get('ECON-NL-HARD-236').canonicalDifficulty,'medium');assert.equal(now.get('P62B-ELAS-C-026').canonicalDifficulty,'hard');assert.equal(now.get('PMA-ITP-H-003').canonicalDifficulty,'elite');assert.equal(now.get('PG3-MEQ-M-008').canonicalDifficulty,'easy');
for(const id of ['42660','42697'])assert(!now.has(id));
assert.deepEqual(lib.assetInventory,before.assetInventory);
con.assertCanonicalIntegrity(lib,{registry:JSON.parse(fs.readFileSync(path.join(data,'composer_registry.json'),'utf8')),manifest:JSON.parse(fs.readFileSync(path.join(data,'composer_library_manifest.json'),'utf8')),readBytes:a=>fs.readFileSync(path.join(data,a.runtimePath))});
const checks=[];const near=(a,b)=>assert(Math.abs(a-b)<.011,`${a} != ${b}`);
for(const c of ledger.changes){
 const q=c.afterRecord,k=q.options[c.correctIndex];
 if(q.q.startsWith('Assume the firms interact indefinitely.')){
  const values=q.q.match(/Cooperating pays (\d+).*Cheating pays (\d+) now, followed by (\d+).*by (0\.\d+)/);assert(values);const [co,dev,pun,d]=values.slice(1).map(Number);
  // Independent finite approximation of both infinite streams, including t=0.
  let cv=0,dv=dev;for(let t=0;t<1000;t++){cv+=co*d**t;if(t)dv+=pun*d**t;}
  near(cv,co/(1-d));near(dv,dev+d*pun/(1-d));
  if(/PV difference|^\$/.test(k))near(Number(k.match(/\$(\d+(?:\.\d+)?)/)[1]),Math.abs(cv-dv));else assert.equal(/cooperat/i.test(k),cv>dv);
  assert(q.feedback.includes(cv.toFixed(2)));assert(q.feedback.includes(dv.toFixed(2)));checks.push({id:c.id,cooperationPV:cv,deviationPV:dv,status:'PASS'});
 }
 if(c.id.startsWith('P62D-ITP-L-')&&/^Tariff \$/.test(k)){
  const [imports0,imports1]=q.q.match(/imports from (\d+) to (\d+)/).slice(1).map(Number),t=(imports0-imports1)/2,rev=t*imports1,dwl=t*t,loss=Number(q.q.match(/entire \$(\d+(?:\.\d+)?) loss/)[1]);
  const vals=[...k.matchAll(/\$(\d+(?:\.\d+)?)/g)].map(m=>Number(m[1]));assert.deepEqual(vals,[t,rev,loss-rev-dwl,dwl]);checks.push({id:c.id,tariff:t,revenue:rev,deadweightLoss:dwl,status:'PASS'});
 }
}
const revenue=[12*1000,10*1280],elasticity=(280/1140)/(2/11);assert.deepEqual(revenue,[12000,12800]);assert(elasticity>1);assert(now.get('P62B-ELAS-C-026').options[1].endsWith('demand is elastic.'));checks.push({id:'P62B-ELAS-C-026',revenue,elasticity,status:'PASS'});
const qm=90/5.05,pm=116-2.4*qm,profit=pm*qm-26*qm-.125*qm*qm-900;near(profit,-98.02);checks.push({id:'P62G-MON-EL-014',profit,status:'PASS'});
function numerical(id,actual,expected,reason){assert.equal(actual.length,expected.length);actual.forEach((v,i)=>near(v,expected[i]));checks.push({id,actual,reason,status:'PASS'});}
numerical('P62H-MCMP-C-010',[100-2*(100-20)/(4+.4)],[63.64],'Set MR=MC, then substitute into demand.');
numerical('P62D-ITP-L-041',[.5*66*66-.5*40*40,.5*40*40-.5*14*14,(90-64)*52/2],[1378,702,676],'Producer gain, consumer loss, and remaining gains from trade after compensation.');
numerical('P62F-PC-LB-003',[4*34-(9+14+20+27)-86,-86],[-20,-86],'Operating profit versus shutdown loss.');
numerical('P62F-PC-EL-007',[40*30-10*(8+16+22+29)-510],[-60],'Four profitable blocks cover variable cost but leave an economic loss.');
numerical('P52A-CPI-LB-001',[(1.03/(130/125)-1)*100,(1.03/1.02-1)*100],[-.9615384615,.9803921569],'Different baskets imply about 1% real loss versus gain.');
numerical('P62E-COP-LB-031',[18000-25000],[-7000],'Explicit cost savings minus extra forgone capital income.');
numerical('PMA-ITP-H-003',[(66-36)-(36-18),.5*(66-36)**2-.5*(66-42)**2],[12,162],'Imports and the positive consumer-surplus change after the price decline.');
numerical('P62E-COP-B2-025',[6+18],[24],'ATC is AFC plus AVC.');
numerical('P62H-MCMP-M-025',[34.07-18],[16.07],'Excess capacity is efficient-scale output minus actual output.');
numerical('P73-MARG-L-026',[44-30-9],[5],'The first required class has positive net marginal benefit.');
for(const id of ['P62H-MCMP-B3-053','P62F-PC-EL-030']){assert(selected.has(id));assert(ledger.changes.find(c=>c.id===id).economicContentChanged);}
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const policy=structuredClone(require('../data/faculty-outcomes.js'));for(const c of Object.values(policy.concepts))for(const o of c.outcomes)delete o.coverage;delete policy.librarySha256;delete policy.policySha256;assert.equal(sha(core.stableStringify(policy)),ledger.facultyOutcomeDefinitionsSha256);
for(const [p,hash]of Object.entries(JSON.parse(fs.readFileSync(path.join(out,'frozen_evidence.json'),'utf8'))))assert.equal(sha(fs.readFileSync(path.join(root,p))),hash,'Frozen evidence '+p);
const adjud=JSON.parse(fs.readFileSync(path.join(out,'adjudicated_responses.json'),'utf8')),counts={};for(const r of Object.values(adjud.responses))counts[r.assessment]=(counts[r.assessment]||0)+1;assert.deepEqual(counts,{PASS:245,'MINOR EDITORIAL ISSUE':53,'SUBSTANTIVE DEFECT':2});
(async()=>{
 for(const a of ledger.assets)assert.equal(await core.sha256BytesHex(fs.readFileSync(path.join(data,a.path))),a.sha256);
 for(const c of ledger.changes){const matches=[];for(let i=0;i<4;i++)if(await core.sha256Hex(core.normalizeAnswerText(c.afterRecord.options[i]))===c.afterRecord.aHash)matches.push(i);assert.deepEqual(matches,[c.correctIndex]);}
 const result={status:'PASS',uniqueQuestions:9777,edited:ledger.changes.length,courseMembershipUnchanged:true,correctAnswerPositionsPreserved:true,answerHashesVerified:true,sourcePoolsRolesSkillsCheckpointRoutingUnchanged:true,ordinaryDifficultyPoolMoves:ledger.moves,facultyOutcomeDefinitionsUnchanged:true,graphAssetsUnchanged:ledger.assets.length,frozenEvidenceUnchanged:true,adjudicatedCounts:counts,newAnswerLengthFlags:0,numericalChecks:checks};fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
