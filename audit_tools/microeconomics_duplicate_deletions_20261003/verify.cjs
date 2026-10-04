'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),work=path.join(root,'tmp/microeconomics_duplicate_deletions_20261003');
const core=require(path.join(dir,'composer-core.js')),h=require(path.join(dir,'tests/composer-test-helpers.js')),contracts=require(path.join(dir,'tests/composer-integrity-contracts.js')),approved=require(path.join(dir,'tests/microeconomics-deletions-approved-revisions.js'));
const parse=s=>JSON.parse(s.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
const prior=parse(fs.readFileSync(path.join(work,'composer_library.js'),'utf8')),current=h.loadComposerLibrary(),deleted=approved.deletedIds;
approved.assertCurrentLibrary(current);const integrity=contracts.assertCanonicalIntegrity(current);
const records=contracts.questionRecords(current),old=contracts.questionRecords(prior),before=new Map(old.map(r=>[String(r.question.id),r.question])),now=new Map(records.map(r=>[String(r.question.id),r.question]));
assert.deepEqual([...now.keys()].sort(),[...before.keys()].filter(i=>!deleted.has(i)).sort());for(const[id,q]of now)assert.deepEqual(q,before.get(id),'Remaining record unchanged '+id);
const area=require(path.join(dir,'course-area-model.js')).create(current.registry.concepts);
const areas=l=>{const a={general:new Set(),micro:new Set(),macro:new Set()};for(const id of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,id)))for(const key of area.areasFor(id))a[key].add(core.idOf(q));return a;};
const prev=areas(prior),next=areas(current),memberships={};for(const a of Object.keys(next)){assert.deepEqual([...next[a]].sort(),[...prev[a]].filter(id=>!deleted.has(id)).sort());memberships[a]={before:prev[a].size,after:next[a].size,removed:[...prev[a]].filter(id=>!next[a].has(id)).sort()};}
assert.deepEqual(Object.fromEntries(Object.entries(memberships).map(([k,v])=>[k,v.after])),{general:1589,micro:6299,macro:4745});
const policy=require(path.join(dir,'data/faculty-outcomes.js')),oldPolicy=require(path.join(work,'faculty-outcomes.js'));const projected=structuredClone(policy);projected.concepts['consumer-choice']=oldPolicy.concepts['consumer-choice'];projected.librarySha256=oldPolicy.librarySha256;projected.policySha256=oldPolicy.policySha256;assert.deepEqual(projected,oldPolicy,'All unrelated outcome policy unchanged');
const all=area.conceptsForArea('micro').map(c=>c.canonicalConceptId),selected=all.filter(id=>!current.concepts[id].derivedFromConceptId||!all.includes(current.concepts[id].derivedFromConceptId));
const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Micro duplicate deletion check',slug:'micro-deletion-check',selectedConceptIds:selected,supportedModes:[...core.MODE_ORDER],checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
const allQ=c=>[...Object.values(c.banks).flat(),...Object.values(c.challengeQuestionBanks).flat(),...c.repairQuestions,...c.bridgeQuestions,...Object.values(c.microSkillRepairPools).flat(),...Object.values(c.microSkillBridgePools).flat(),...Object.values(c.skillRepairSeedPools).flat()];
(async()=>{
 const beforeComp=core.compose(prior,recipe),comp=core.compose(current,recipe);assert.deepEqual(comp.errors,beforeComp.errors);assert(comp.validation.modes.length===10&&comp.validation.modes.every(m=>m.ok));
 const oldIds=new Set(allQ(beforeComp).map(core.idOf)),newIds=new Set(allQ(comp).map(core.idOf));assert.deepEqual([...newIds].sort(),[...oldIds].filter(i=>!deleted.has(i)).sort());assert.equal(newIds.size,6274);
 const answers=await core.verifyAnswers(comp);assert(answers.ok);
 for(const q of allQ(comp))for(const f of ['q','options','feedback','aHash'])assert.deepEqual(q[f],now.get(core.idOf(q))[f]);
 comp.embeddedQuestionAssets=Object.fromEntries(comp.assets.map(a=>[a.runtimePath,'data:image/webp;base64,'+fs.readFileSync(path.join(dir,a.sourceUrl)).toString('base64')]));
 const game=await h.buildFacultyGame(core,recipe,{library:current,composition:comp}),compiled=h.assertInlineScriptsCompile(game.html);
 for(const[id,field,value]of [['42656','q','unauthorized'],['42656','difficulty','hard']]){const bad=structuredClone(current);for(const r of contracts.questionRecords(bad))if(String(r.question.id)===id)r.question[field]=value;assert.throws(()=>approved.assertCurrentLibrary(bad));}
 const result={status:'PASS',sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,'data/composer_library.js'))).digest('hex'),deletedIds:[...deleted],unchangedRecords:now.size,integrity,memberships,graphAssetsUnchanged:true,metadataChanges:approved.deletionLedger.metadata,publication:{before:oldIds.size,after:newIds.size,onlyRequestedIdsRemoved:true,allTenModesPass:true,answerVerification:answers.ok,inlineScriptsCompiled:compiled},negativeMutationProbes:'PASS'};
 fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
