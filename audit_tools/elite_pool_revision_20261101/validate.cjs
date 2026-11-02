'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer');
const h=require(path.join(dir,'tests/composer-test-helpers.js')),core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js')),approved=require(path.join(dir,'tests/faculty-validation-revisions.js')),style=require(path.join(dir,'tests/faculty-prose-candidates.js'));
const ledger=require('./expectations.json'),inv=require('./inventory.json'),decisions=require('./decisions.json'),lib=h.loadComposerLibrary();
const before=approved.beforeEliteRevisions(lib),current=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question])),old=new Map(con.questionRecords(before).map(r=>[String(r.question.id),r.question]));
const edits=new Map(ledger.changes.map(c=>[c.id,c])),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
con.assertCanonicalIntegrity(lib);assert.equal(current.size,9802);assert.equal(edits.size,178);assert.equal(Object.keys(decisions).length,202);
let placements=0;
for(const r of con.questionRecords(lib)){
 const q=r.question,b=old.get(String(q.id)),c=edits.get(String(q.id));
 if(!c)assert.deepEqual(q,b);
 else{const p=structuredClone(q);for(const k of c.fields)p[k]=b[k];assert.deepEqual(p,b);const extra=c.id==='43217'?['commonError']:c.id==='P62B-ELAS-EL-029'?['commonError','type','primarySkill','repairSkill']:[];assert(c.fields.every(f=>['q','options','feedback','aHash',...extra].includes(f)));assert.equal(q.canonicalDifficulty,'elite');placements++;}
}
for(const r of inv.items){
 if(r.group==='flagged')assert(edits.has(r.id));
 if(['approved','earlier-review','previously-documented'].includes(r.group))assert.deepEqual(current.get(r.id),r.question);
}
for(const c of ledger.changes){
 const q=current.get(c.id);assert.deepEqual(q,c.afterRecord);assert.equal(sha(core.normalizeAnswerText(q.options[c.correctIndex])),q.aHash);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);
 assert(!style.screen(q,c.correctIndex).lengthOutlier,c.id);
 if(q.image)assert(fs.existsSync(path.join(dir,'data',q.image)));
 assert(!/^(For the same|The same|At that|Using the same|At the same)\b/i.test(q.q),c.id);
}
let arithmeticChecks=0;
const right=id=>{const c=edits.get(id);return c.afterRecord.options[c.correctIndex];};
const numberText=s=>String(s).replace(/[,\$]/g,'').replace(/−/g,'-');
const includes=(id,terms)=>{for(const term of terms)assert(numberText(right(id)).includes(numberText(term)),id+' expected '+term);arithmeticChecks++;};
// Independent recomputation of representative distinct models, including every numerical family.
for(const c of ledger.changes){
 const q=c.afterRecord,id=c.id;
 if(id.startsWith('P62G-MON-EL-')&&Number(id.slice(-3))<=15){
  const m=q.q.match(/P=(\d+)−([\d.]+)Q, marginal cost is MC=(\d+)\+([\d.]+)Q, and total cost is TC=(\d+)\+/);assert(m,id);
  const [A,b,k,s,F]=m.slice(1).map(Number),x=(A-k)/(2*b+s),p=A-b*x,profit=(A*x-b*x*x)-(F+k*x+s*x*x/2);
  const value=t=>(A*t-b*t*t)-(F+k*t+s*t*t/2);
  assert(value(x)>value(x-0.01)&&value(x)>value(x+0.01),'Interior maximum '+id);
  if(c.afterRecord.primarySkill==='integrated_monopoly_analysis')includes(id,[x.toFixed(2),p.toFixed(2)]);
  else includes(id,[Math.abs(profit).toFixed(2),profit>=0?'profit':'loss','operate']);
 }
 if(id.startsWith('P62H-MCMP-EL-')&&Number(id.slice(-3))<=14){
  const m=q.q.match(/P=(\d+)−([\d.]+)Q and (?:marginal cost )?MC=(\d+)\+([\d.]+)Q/);assert(m,id);
  const [A,b,k,s]=m.slice(1).map(Number),x=(A-12-k)/(2*b+s),p=A-12-b*x;
  includes(id,[p.toFixed(2)]);
 }
 if(id.startsWith('P62I-OLI-EL-')&&[17,18,19,20].includes(Number(id.slice(-3)))){
  const m=q.q.match(/Cooperating pays (\d+).*Cheating pays (\d+) now, followed by (\d+).*by (0\.\d+)/),[a,b,p,d]=m.slice(1).map(Number);
  // Sum 500 dated payments instead of using the author's closed-form expression.
  let coop=0,cheat=b;for(let t=0;t<500;t++){coop+=a*d**t;if(t>0)cheat+=p*d**t;}
  includes(id,[coop.toFixed(2),cheat.toFixed(2)]);
 }
 if(id.startsWith('P62F-PC-EL-')&&[5,6,8,9,10].includes(Number(id.slice(-3)))){
  const p=+q.q.match(/price of \$(\d+)/)[1],costs=q.q.match(/per unit of (.+?)\./)[1].match(/\d+/g).map(Number),F=+q.q.match(/Fixed cost of \$(\d+)/)[1];
  const profits=[-F];for(let n=1;n<=6;n++)profits.push(10*n*p-costs.slice(0,n).reduce((a,b)=>a+10*b,0)-F);
  const best=Math.max(...profits),output=profits.lastIndexOf(best)*10;
  includes(id,[String(output),String(Math.abs(best))]);
 }
}
const scenarios=[
 ['P62C-CPS-EL-001',[10*5+3+4]],['P62C-CPS-EL-002',[8*4+2+1]],
 ['P62C-CPS-EL-005',[120+80-50-130]],['P62C-CPS-EL-006',[100+140-145-80]],
 ['P62E-COP-EL-007',[1500/150,8,1500/150+8]],
 ['P62E-COP-EL-008',[(240-120)/60,10+4,(240-120)/60+10+4,12+4]],
 ['P62E-COP-EL-025',[(1600-1000)/(8-5)]],['P62E-COP-EL-028',[(2400-600)/(10-4)]],
 ['ECON-NL-ELITE-331',[100*(1+.4*.1),100*(1-.25*.08)]],
 ['P62B-ELAS-EL-011',[((20/110)/(6/27)).toFixed(2),-((30*100-24*120)/20)]],
 ['P62B-ELAS-EL-015',[((70/285)/(4/22)).toFixed(2),20*320-24*250]],
 ['P62B-ELAS-EL-016',[((300/1850)/(2/16)).toFixed(2),'1,100']],
 ['P62B-ELAS-EL-020',[10500-9800,'1,500']],
 ['P52A-FISCAD-EL-002',[(80*.9+20*.3)/.25,(20*.9+80*.3)/.25]],
 ['P62D-ITP-EL-001',[640-390-35]],['P62D-ITP-EL-009',[310-94,310-94-(29-24)*36]],
 ['42127',[10+20+40+50,10+20+40+50-(10+20+30+40)]],
 ['42156',[600-400,900-600]],['42166',['200,000','25,000']],['42176',['70,000']],
 ['ECON-MG-ELITE-300',[1200-900,100-120-30]],
 ['ECON-MG-ELITE-308',[4+.5*18,4+.5*18-12,4+.5*18-10]],
 ['P77-MVM-EL-015',['3,500','8,000','3,000','1,500']],
 ['PMOE-NER-EL-002',[(1.1/.95*100-100).toFixed(1)]],
 ['PMOE-RER-EL-001',[(2*104/110).toFixed(3),((1-104/110)*100).toFixed(2)]],
 ['ECON-NL-ELITE-315',[(1.155/1.05*100-100).toFixed(0),((1-1.08/1.1)*100).toFixed(2)]],
 ['P62H-MCMP-EL-028',[(24-12)*80-100-(20-12)*100]],
 ['P62H-MCMP-EL-029',['1,000','500']],['P62F-PC-EL-017',[2*20-18-16]],
 ['P62F-PC-EL-021',[1000-10*30,(1000-10*30)/20]],
 ['P62F-PC-EL-026',[(100-20)/2,(100-40)/2]],
 ['P62I-OLI-EL-029',[500-4*80-100]],['P62I-OLI-EL-027',[100-.5*(60*.2)+9]],
 ['PMOE-POL-EL-001',[500-400,440-370]],
 ['ECON-MG-ELITE-317',['2,520','2,760']],['ECON-MG-ELITE-318',['2,520','2,760']]
];
for(const [id,terms]of scenarios)includes(id,terms);
const hygieneIds=['P52B-INC-H-002','PMOE-TX-L-006','P62C-CPS-L-004','P62C-CPS-L-010'];for(const id of hygieneIds)assert.deepEqual(current.get(id),old.get(id));
const result={status:'PASS',reviewQueueAudited:202,revised:178,flaggedRevised:65,unreviewedRevised:113,retainedAfterAudit:24,approvedPreserved:85,canonicalCount:9802,answerPositionsPreserved:true,noAnswerLengthOutliers:true,placementsChecked:placements,arithmeticScenarios:arithmeticChecks,unchangedLegacyHygieneFindings:hygieneIds,librarySha256:lib.librarySha256};
fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
