'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer'),out=path.join(root,'faculty_exports/audits/graph_assessment_live_playthrough_remediation_20261004_evidence');
const core=require(path.join(cdir,'composer-core.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const load=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const before=load(path.join(out,'composer_library.js')),after=load(path.join(cdir,'data/composer_library.js')),ledger=read(path.join(__dirname,'expectations.json'));
const source=fs.readFileSync(path.join(cdir,'template/mastery-quests-faculty-template-composer-ready.html'),'utf8');
function extract(name){const start=source.indexOf(`function ${name}(`);assert(start>=0,name);let depth=0;for(let i=source.indexOf('{',start);i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}throw Error(name);}
function compose(lib,ids,modes=['trialGraph','exam']){return core.compose(lib,{schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Graph review validation',slug:'graph-review-validation',selectedConceptIds:ids,supportedModes:modes,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}});}
const tiers=['easy','medium','hard','elite','legendary'],bosses=['easyBoss','mediumBoss','finalBoss','legendaryBoss'];
const count=arr=>arr.reduce((o,k)=>(o[k]=(o[k]||0)+1,o),{});
const groups=[...new Set(contracts.questionRecords(after).filter(r=>ledger.authorizedIds.includes(String(r.question.id))).map(r=>r.conceptId))].sort();
const result={librarySha256:after.librarySha256,groups:[],runsPerTarget:100,errors:[],checkpointInventory:[],trialAdditions:[],trialRemovals:[]};
const allBefore=new Set(),allAfter=new Set();
for(const cid of groups){
 const b=compose(before,[cid]),a=compose(after,[cid]);
 const beforeIds=b.trialGraphQuestionIds.map(String),afterIds=a.trialGraphQuestionIds.map(String);beforeIds.forEach(x=>allBefore.add(x));afterIds.forEach(x=>allAfter.add(x));
 for(const pool of bosses)assert.deepEqual(a.banks[pool].map(q=>String(q.id)).sort(),b.banks[pool].map(q=>String(q.id)).sort(),`${cid} checkpoint-stage inventory ${pool}`);
 result.checkpointInventory.push({concept:cid,before:Object.fromEntries(bosses.map(p=>[p,b.banks[p].length])),after:Object.fromEntries(bosses.map(p=>[p,a.banks[p].length]))});
 let seed=1234567;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const ctx={questionBanks:a.banks,trialGraphQuestionIds:a.trialGraphQuestionIds,TRIAL_GRAPH_ALLOWED_TARGETS:[10,15,20],shuffle(arr){const x=[...arr];for(let i=x.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;},Math:Object.assign(Object.create(Math),{random})};
 vm.createContext(ctx);vm.runInContext(['getTrialGraphCandidates','getTrialGraphSupportedTargets','buildTrialGraphDeck'].map(extract).join('\n'),ctx);
 const candidates=Array.from(ctx.getTrialGraphCandidates()),supported=Array.from(ctx.getTrialGraphSupportedTargets());
 const detail={concept:cid,before:beforeIds.length,after:afterIds.length,added:afterIds.filter(x=>!beforeIds.includes(x)),removed:beforeIds.filter(x=>!afterIds.includes(x)),byDifficulty:count(candidates.map(q=>q.__mqDifficulty)),assetInventory:count(candidates.map(q=>q.image)),supportedTargets:supported,simulations:[]};
 assert.equal(a.validation.modes.find(m=>m.mode==='trialGraph').ok,candidates.length>=10);
 for(const q of candidates){assert(q.graphRequired===true&&q.image);assert(fs.existsSync(path.join(cdir,'data',q.image)));}
 for(const target of supported){let fallbacks=0,maxFamily=0;const frequencies={};const quota=({10:[3,3,2,1,1],15:[4,4,3,2,2],20:[5,5,4,3,3]})[target];
  for(let run=0;run<100;run++){const deck=Array.from(ctx.buildTrialGraphDeck(target));assert.equal(deck.length,target);assert.equal(new Set(deck.map(q=>String(q.id))).size,target);assert(deck.every(q=>afterIds.includes(String(q.id))));const actual=count(deck.map(q=>q.__mqDifficulty));const fullQuota=tiers.every((t,i)=>(detail.byDifficulty[t]||0)>=quota[i]);if(fullQuota)tiers.forEach((t,i)=>assert.equal(actual[t],quota[i]));else{fallbacks++;tiers.forEach((t,i)=>assert((actual[t]||0)>=Math.min(quota[i],detail.byDifficulty[t]||0)));}maxFamily=Math.max(maxFamily,...Object.values(count(deck.map(q=>q.image))));deck.forEach(q=>frequencies[q.image]=(frequencies[q.image]||0)+1);}
  detail.simulations.push({target,runs:100,quotaFallbackRuns:fallbacks,maxSingleAssetInDeck:maxFamily,assetSelectionCounts:frequencies});
 }
 detail.beforeIds=beforeIds;detail.afterIds=afterIds;
 result.groups.push(detail);
}
result.trialAdditions=[...allAfter].filter(x=>!allBefore.has(x)).sort();result.trialRemovals=[...allBefore].filter(x=>!allAfter.has(x)).sort();
assert(result.trialAdditions.every(id=>ledger.authorizedIds.includes(id)));
for(const id of ['P62G-MON-H-001','P62G-MON-H-002','P62G-MON-H-003','P62G-MON-H-004'])assert(!allAfter.has(id));
// Execute actual Exam section gates/commit handler, with scoring/telemetry stubs.
const sections=[{index:0,start:1,end:9,boss:10,difficulty:'easy'},{index:1,start:11,end:19,boss:20,difficulty:'medium'},{index:2,start:21,end:29,boss:30,difficulty:'hard'}];
const exam={EXAM_DRILL_SECTIONS:sections,gameMode:'exam',room:1,runID:'test',finalizeExamRoomView(){},scoreCommittedExamResponse(){exam.scored++;},sendGameData(){},loadQuestion(){exam.loads++;},scored:0,loads:0};
vm.createContext(exam);vm.runInContext(['createExamDrillState','getExamSectionForRoom','getExamSectionState','getExamRoomState','isExamSectionComplete','commitExamSection','selectExamCheckpoint'].map(extract).join('\n')+'\nexamDrillState=createExamDrillState();',exam);
for(const s of sections){exam.room=s.start;assert.equal(exam.selectExamCheckpoint(s.boss),false);for(let n=s.start;n<=s.end;n++)exam.getExamRoomState(n,true).selectedIndex=0;assert(exam.isExamSectionComplete(exam.examDrillState.sections[s.index]));assert.equal(exam.room,s.start,'Answering nine does not auto-enter');assert(exam.selectExamCheckpoint(s.boss));assert.equal(exam.room,s.boss);assert.equal(exam.bossHealth,3);assert.equal(exam.selectExamCheckpoint(s.boss),false);}
assert.equal(exam.scored,27);assert.equal(exam.loads,3);
const taxConcepts=after.registry.concepts.map(r=>r.canonicalConceptId).filter(id=>/tax|price-ceiling|price-floor|government-policy/.test(id)&&!/income-tax|inflation-tax/.test(id));
result.exam={sectionGates:'PASS: incomplete blocked; nine responses unlock deliberate checkpoint entry; duplicate commits blocked',conceptBuilds:[]};
for(const ids of [...taxConcepts.map(id=>[id]),taxConcepts]){const a=compose(after,ids,['exam']);const mode=a.validation.modes.find(m=>m.mode==='exam');result.exam.conceptBuilds.push({ids,advertised:mode.ok,counts:a.counts,errors:a.errors});if(mode.ok)for(const p of bosses.slice(0,3))assert(a.banks[p].length>=3);else assert(a.errors.length>0);}
const empty=structuredClone(after);for(const cid of taxConcepts){const mod=core.resolveConceptModule(empty,cid);if(mod.questions){mod.questions.boss=[];mod.questions.legendaryBoss=[];for(const p of bosses)if(mod.questions[p])mod.questions[p]=[];}}
// A known direct module is used for the missing-checkpoint negative control.
const missing=structuredClone(after);missing.concepts['perfect-competition'].questions.boss=[];
const deficient=compose(missing,['perfect-competition'],['exam']);assert(!deficient.validation.modes.find(m=>m.mode==='exam').ok);assert(deficient.errors.some(e=>/Boss/.test(e)));
result.exam.missingCheckpointNegativeControl=deficient.errors;
result.status='PASS';result.totalSimulations=result.groups.reduce((n,g)=>n+g.simulations.reduce((s,r)=>s+r.runs,0),0);
fs.writeFileSync(path.join(out,'mode-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,groups:groups.length,runs:result.totalSimulations,trialAdditions:result.trialAdditions.length,trialRemovals:result.trialRemovals.length,examBuilds:result.exam.conceptBuilds.length}));
