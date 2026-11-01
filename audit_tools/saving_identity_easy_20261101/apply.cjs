'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),data=path.join(root,'build/faculty-build-composer/data'),core=require('../../build/faculty-build-composer/composer-core.js'),con=require('../../build/faculty-build-composer/tests/composer-integrity-contracts.js');
const BASELINE='2c59df2481587e4b4ad2612c1c8426efc7ef08a1',cid='saving-and-investment-identities';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),stable=core.stableStringify;
const parse=s=>JSON.parse(s.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
const baselineFile=name=>execFileSync('git',['show',`${BASELINE}:build/faculty-build-composer/data/${name}`],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024});
const before=parse(baselineFile('composer_library.js')),lib=structuredClone(before);
const authored=JSON.parse(fs.readFileSync(path.join(__dirname,'questions.json'),'utf8'));
const objective={SLF1:['saving-versus-investment','distinguish_saving_and_investment'],SLF2:['private-public-national-saving','calculate_national_saving'],SLF3:['closed-economy-saving-investment-identity','apply_closed_economy_saving_identity']};
const sourceFile='audit_tools/saving_identity_easy_20261101/questions.json',phase='saving-identity-conceptual-easy-20261101';
const additions=authored.map((row,i)=>{
 const {correctIndex,...content}=row,[tag,skill]=objective[row.objective];
 const q={...content,tag,difficulty:'easy',canonicalDifficulty:'easy',primarySkill:skill,secondarySkills:[],repairSkill:skill,primaryConceptId:cid,secondaryConceptIds:[],familyConceptId:'saving-fiscal-foundations',subtopicIds:[cid],instructionalRole:'main',conceptCluster:cid,canonicalId:row.id,sourceId:row.id,sourceGame:phase,sourceChapter:[],sourcePool:'easy',originalSourcePool:'easy',originalBossTier:null,sourceCurationPhase:phase,aHash:sha(core.normalizeAnswerText(row.options[correctIndex]))};
 const payload=Object.fromEntries(['id','q','options','image','primarySkill','primaryConceptId','difficulty','objective'].map(k=>[k,q[k]??null]));
 q.sourceHash=sha(stable(payload));q.sourceOccurrences=[{sourceGame:phase,sourceFile,sourceGlobal:'questions',sourcePool:'easy',routeKey:q.objective,sourceRecordOrder:i,sourceId:q.id,sourceHash:q.sourceHash,sourceCurationPhase:phase}];
 return {conceptId:cid,pool:'easy',correctIndex,question:q};
});
const oldIds=new Set(con.questionRecords(before).map(r=>String(r.question.id)));
assert.equal(additions.length,5);for(const a of additions){assert(!oldIds.has(a.question.id));con.assertSourceProvenance(a.question,a.question);}
lib.concepts[cid].questions.easy.push(...additions.map(a=>a.question));
const entry=lib.registry.concepts.find(c=>c.canonicalConceptId===cid),rows=con.questionRecords({concepts:{[cid]:lib.concepts[cid]}});
entry.questionCountByDifficulty.easy+=5;entry.questionCountByRole.main+=5;
for(const k of ['repairCoverage','bridgeCoverage'])entry[k].mainWithUsableSkill=rows.length;
entry.sourceGames=[...new Set([...entry.sourceGames,phase])];
entry.notes+=' Five conceptual Easy questions added by instructor request on 2026-11-01; historical taxonomy memberships are preserved.';
lib.canonicalQuestionCount=oldIds.size+5;lib.registry.canonicalQuestionCount=lib.canonicalQuestionCount;
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=JSON.parse(baselineFile('composer_library_manifest.json'));manifest.librarySha256=lib.librarySha256;manifest.canonicalQuestionCount=lib.canonicalQuestionCount;
const context={module:{exports:{}}};vm.runInNewContext(baselineFile('faculty-outcomes.js'),context);const policy=JSON.parse(JSON.stringify(context.module.exports));
for(const o of policy.concepts[cid].outcomes){
 const c=core.compose(lib,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}});
 const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,c.banks[k].length]));
 o.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+c.banks[k].length,0),repair:c.repairQuestions.length,bridge:c.bridgeQuestions.length,seed:Object.values(c.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode)};
}
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
con.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest});
const ledger={schemaVersion:1,baselineCommit:BASELINE,beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,beforeCanonicalCount:before.canonicalQuestionCount,afterCanonicalCount:lib.canonicalQuestionCount,registryBefore:before.registry,additions};
const priorPath=path.join(__dirname,'expectations.json'),prior=fs.existsSync(priorPath)?JSON.parse(fs.readFileSync(priorPath,'utf8')):null;
const current=parse(fs.readFileSync(path.join(data,'composer_library.js'),'utf8'));
assert([before.librarySha256,lib.librarySha256,prior?.afterLibrarySha256].includes(current.librarySha256),'Concurrent library change');
const check=structuredClone(current);delete check.librarySha256;delete check.registry.librarySha256;assert.equal(sha(stable(check)),current.librarySha256);
if(process.argv.includes('--write')){
 fs.writeFileSync(path.join(data,'composer_library.js'),'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n');
 fs.writeFileSync(path.join(data,'composer_registry.json'),JSON.stringify(lib.registry,null,2)+'\n');
 fs.writeFileSync(path.join(data,'composer_library_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(data,'faculty-outcomes.js'),"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n');
 fs.writeFileSync(priorPath,JSON.stringify(ledger,null,2)+'\n');
}
console.log(JSON.stringify({written:process.argv.includes('--write'),added:additions.length,canonicalCount:lib.canonicalQuestionCount,easyBefore:before.concepts[cid].questions.easy.length,easyAfter:lib.concepts[cid].questions.easy.length,librarySha256:lib.librarySha256}));
