'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),data=path.join(root,'build/faculty-build-composer/data'),core=require('../../build/faculty-build-composer/composer-core.js'),con=require('../../build/faculty-build-composer/tests/composer-integrity-contracts.js');
const BASELINE='5714f7996e53c82e60e995ce206d246eb4ef84b4';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),stable=core.stableStringify;
const parse=s=>JSON.parse(s.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
const baselineFile=name=>execFileSync('git',['show',`${BASELINE}:build/faculty-build-composer/data/${name}`],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024});
const before=parse(baselineFile('composer_library.js'));let lib=structuredClone(before);
const authored=JSON.parse(fs.readFileSync(path.join(__dirname,'questions.json'),'utf8'));
const requested={'long-run-aggregate-supply-and-potential-output':3,'market-power':3,'price-signals':1};
const sourceFile='audit_tools/remaining_easy_completion_20261101/questions.json',phase='remaining-conceptual-easy-completion-20261101';
const additions=authored.map((row,i)=>{
 const {correctIndex,topic,...content}=row,raw=lib.concepts[topic],cid=raw.derivedFromConceptId||topic;
 assert(core.describeContentScope(lib,topic).full.includes(content.primarySkill),'Existing faculty skill '+row.id);
 const samples=con.questionRecords({concepts:{[cid]:lib.concepts[cid]}}).map(r=>r.question);
 const sample=samples.find(q=>q.primarySkill===content.primarySkill)||samples[0];
 assert(Object.hasOwn(lib.concepts[cid].objectiveLabels,content.objective),'Existing objective '+row.id);
 const q={...content,difficulty:'easy',canonicalDifficulty:'easy',secondarySkills:[],repairSkill:content.primarySkill,primaryConceptId:cid,secondaryConceptIds:[],subtopicIds:[topic],instructionalRole:'main',conceptCluster:sample.conceptCluster||cid,canonicalId:row.id,sourceId:row.id,sourceGame:phase,sourceChapter:[],sourcePool:'easy',originalSourcePool:'easy',originalBossTier:null,sourceCurationPhase:phase,aHash:sha(core.normalizeAnswerText(row.options[correctIndex]))};
 const family=raw.familyConceptId||sample.familyConceptId;if(family)q.familyConceptId=family;
 const payload=Object.fromEntries(['id','q','options','image','primarySkill','primaryConceptId','difficulty','objective'].map(k=>[k,q[k]??null]));
 q.sourceHash=sha(stable(payload));q.sourceOccurrences=[{sourceGame:phase,sourceFile,sourceGlobal:'questions',sourcePool:'easy',routeKey:q.objective,sourceRecordOrder:i,sourceId:q.id,sourceHash:q.sourceHash,sourceCurationPhase:phase}];
 return {conceptId:cid,targetConceptId:topic,pool:'easy',correctIndex,question:q};
});
assert.equal(additions.length,7);
for(const [cid,n]of Object.entries(requested))assert.equal(additions.filter(a=>a.targetConceptId===cid).length,n);
const oldIds=new Set(con.questionRecords(before).map(r=>String(r.question.id)));
for(const a of additions){assert(!oldIds.has(a.question.id));con.assertSourceProvenance(a.question,a.question);lib.concepts[a.conceptId].questions.easy.push(a.question);}
// Scope inspection above memoizes resolved derived modules by library identity.
// Rebind after adding questions so runtime counts and outcomes see the new rows.
lib=structuredClone(lib);
const affected=new Set(additions.flatMap(a=>[a.conceptId,a.targetConceptId]));
for(const cid of affected){
 const m=core.resolveConceptModule(lib,cid),entry=lib.registry.concepts.find(c=>c.canonicalConceptId===cid),rows=[...new Map(con.questionRecords({concepts:{[cid]:m}}).map(r=>[String(r.question.id),r.question])).values()],p=m.questions;
 entry.questionCountByDifficulty=Object.fromEntries(['easy','medium','hard','elite','legendary','unknown'].map(t=>[t,rows.filter(q=>(q.canonicalDifficulty||q.difficulty||'unknown')===t).length]));
 entry.questionCountByRole={boss:(p.boss||[]).length,bridge:(m.bridgeQuestions||[]).length,calculation:(p.calculation||[]).length,elite:(p.elite||[]).length,integration:(p.integration||[]).length,legendary:(p.legendary||[]).length,legendaryBoss:(p.legendaryBoss||[]).length,main:['easy','medium','hard'].reduce((n,k)=>n+(p[k]||[]).length,0),repair:(m.repairQuestions||[]).length,repairSeed:(m.repairSeedQuestions||[]).length};
 for(const k of ['repairCoverage','bridgeCoverage'])if(entry[k])entry[k].mainWithUsableSkill=rows.length;
 const c=core.compose(lib,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:['quiz']});
 const counts=Object.fromEntries(['easy','medium','hard'].map(k=>[k,c.banks[k].length]));
 if(entry.runtimeAdaptiveCounts)entry.runtimeAdaptiveCounts=counts;
 if(entry.quizEligibleNonLegendary!=null)entry.quizEligibleNonLegendary=Object.values(counts).reduce((a,b)=>a+b,0);
 if(entry.quiz15Status)entry.quiz15Status=c.errors.length?'limited':'ready';
 if(entry.coverageStatusNote)entry.coverageStatusNote=entry.coverageStatusNote.replace(/Runtime adaptive depth: [^;]+;/,`Runtime adaptive depth: ${counts.easy} Easy / ${counts.medium} Medium / ${counts.hard} Hard;`).replace(/Quiz-eligible ordinary\/non-Legendary pool: \d+\./,`Quiz-eligible ordinary/non-Legendary pool: ${entry.quizEligibleNonLegendary}.`);
 entry.sourceGames=[...new Set([...entry.sourceGames,phase])];entry.notes+=' Conceptual Easy questions added by instructor request on 2026-11-01 to meet the five-question Easy minimum. Remaining Medium/Hard gaps are unchanged.';
}
lib.canonicalQuestionCount=oldIds.size+7;lib.registry.canonicalQuestionCount=lib.canonicalQuestionCount;
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=JSON.parse(baselineFile('composer_library_manifest.json'));manifest.librarySha256=lib.librarySha256;manifest.canonicalQuestionCount=lib.canonicalQuestionCount;
const context={module:{exports:{}}};vm.runInNewContext(baselineFile('faculty-outcomes.js'),context);const policy=JSON.parse(JSON.stringify(context.module.exports)),policyBefore=structuredClone(policy);
for(const cid of affected)for(const o of policy.concepts[cid].outcomes){
 const c=core.compose(lib,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}});
 const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,c.banks[k].length]));
 o.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+c.banks[k].length,0),repair:c.repairQuestions.length,bridge:c.bridgeQuestions.length,seed:Object.values(c.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode)};
}
const definitions=p=>{p=structuredClone(p);for(const c of Object.values(p.concepts))for(const o of c.outcomes)delete o.coverage;delete p.librarySha256;delete p.policySha256;return p;};assert.deepEqual(definitions(policy),definitions(policyBefore));
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest});
const ledger={schemaVersion:1,baselineCommit:BASELINE,beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,beforeCanonicalCount:before.canonicalQuestionCount,afterCanonicalCount:lib.canonicalQuestionCount,registryBefore:before.registry,requested,additions};
const priorPath=path.join(__dirname,'expectations.json'),prior=fs.existsSync(priorPath)?JSON.parse(fs.readFileSync(priorPath,'utf8')):null;
const current=parse(fs.readFileSync(path.join(data,'composer_library.js'),'utf8'));assert([before.librarySha256,lib.librarySha256,prior?.afterLibrarySha256].includes(current.librarySha256),'Concurrent library change');
const check=structuredClone(current);delete check.librarySha256;delete check.registry.librarySha256;assert.equal(sha(stable(check)),current.librarySha256);
if(process.argv.includes('--write')){
 fs.writeFileSync(path.join(data,'composer_library.js'),'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n');
 fs.writeFileSync(path.join(data,'composer_registry.json'),JSON.stringify(lib.registry,null,2)+'\n');
 fs.writeFileSync(path.join(data,'composer_library_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(data,'faculty-outcomes.js'),"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n');
 fs.writeFileSync(priorPath,JSON.stringify(ledger,null,2)+'\n');
}
console.log(JSON.stringify({written:process.argv.includes('--write'),added:additions.length,canonicalCount:lib.canonicalQuestionCount,librarySha256:lib.librarySha256}));
