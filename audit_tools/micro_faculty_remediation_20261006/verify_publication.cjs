'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer');
const core=require(path.join(cdir,'composer-core.js')),h=require(path.join(cdir,'tests/composer-test-helpers.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js')),approved=require(path.join(cdir,'tests/faculty-micro-remediation-approved-revisions.js'));
const current=h.loadComposerLibrary(),prior=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline_composer_library.js'),'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1)),ledger=require('./expectations.json');
const records=contracts.questionRecords(current),now=new Map(records.map(r=>[String(r.question.id),r.question])),old=new Map(contracts.questionRecords(prior).map(r=>[String(r.question.id),r.question]));
approved.assertCurrentLibrary(current);assert.deepEqual([...now.keys()].sort(),[...old.keys()].sort());
assert.deepEqual([...now].filter(([id,q])=>core.stableStringify(q)!==core.stableStringify(old.get(id))).map(([id])=>id).sort(),ledger.changes.map(c=>c.id).sort());
const area=require(path.join(cdir,'course-area-model.js')).create(current.registry.concepts);
const projection=l=>{const r={general:new Set(),micro:new Set(),macro:new Set()};for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid)))for(const a of area.areasFor(cid))r[a].add(String(q.id));return r;};
const beforeAreas=projection(prior),afterAreas=projection(current);
const all=c=>[...Object.values(c.banks).flat(),...Object.values(c.challengeQuestionBanks).flat(),...c.repairQuestions,...c.bridgeQuestions,...Object.values(c.microSkillRepairPools).flat(),...Object.values(c.microSkillBridgePools).flat(),...Object.values(c.skillRepairSeedPools).flat()];
const moved=approved.facultyMacroTransfers.map(m=>m.id),result={librarySha256:current.librarySha256,canonicalIds:now.size,unauthorizedQuestionChanges:0,areas:{},negativeControls:[]};
for(const c of ledger.changes.filter(c=>c.afterRecord.checkpointPool)){
 const q=c.afterRecord;assert.deepEqual(core.validateFacultyQuestionRecord(q,q.checkpointPool,new Set([q.image])),[]);
 const wrong=q.checkpointPool==='easyBoss'?'mediumBoss':'easyBoss';assert(core.validateFacultyQuestionRecord(q,wrong,new Set([q.image])).includes('pool/checkpoint-stage'));
}
for(const [id,field,value]of [[ledger.changes[0].id,'primarySkill','unapproved'],['ECON-MG-EASY-1','q','unapproved']]){
 const bad=structuredClone(current);for(const r of contracts.questionRecords(bad))if(String(r.question.id)===id)r.question[field]=value;assert.throws(()=>approved.assertCurrentLibrary(bad));result.negativeControls.push(`${id}.${field}: rejected`);
}
(async()=>{
for(const a of ['general','micro','macro']){
 const expected=new Set(beforeAreas[a]);if(a==='micro')moved.forEach(id=>expected.delete(id));if(a==='macro')moved.forEach(id=>expected.add(id));assert.deepEqual([...afterAreas[a]].sort(),[...expected].sort(),'Exact area transfer '+a);
 const ids=area.conceptsForArea(a).map(c=>c.canonicalConceptId),selected=ids.filter(id=>!current.concepts[id].derivedFromConceptId||!ids.includes(current.concepts[id].derivedFromConceptId));if(a==='macro'&&!selected.includes('integrated-macroeconomic-analysis'))selected.push('integrated-macroeconomic-analysis');
 const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:`${a} faculty remediation validation`,slug:`${a}-faculty-remediation-validation`,selectedConceptIds:selected,supportedModes:core.MODE_ORDER,checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
 const comp=core.compose(current,recipe),oldComp=core.compose(prior,recipe);assert(comp.validation.modes.every(m=>m.ok),JSON.stringify(comp.errors));assert((await core.verifyAnswers(comp)).ok);
 comp.embeddedQuestionAssets=Object.fromEntries(comp.assets.map(asset=>[asset.runtimePath,'data:image/webp;base64,'+fs.readFileSync(path.join(cdir,asset.sourceUrl)).toString('base64')]));
 const game=await h.buildFacultyGame(core,recipe,{library:current,composition:comp}),scripts=h.assertInlineScriptsCompile(game.html),published=all(game.composition),pids=new Set(published.map(core.idOf)),beforeIds=new Set(all(oldComp).map(core.idOf));
 if(a==='micro')moved.forEach(id=>beforeIds.delete(id));if(a==='macro')moved.forEach(id=>beforeIds.add(id));assert.deepEqual([...pids].sort(),[...beforeIds].sort(),'Publication membership '+a);
 for(const q of published)for(const f of ['q','options','aHash','feedback','image','graphRequired','canonicalDifficulty','type','checkpointPool'])assert.deepEqual(q[f],now.get(core.idOf(q))[f],`${a} ${q.id} ${f}`);
 result.areas[a]={canonicalCount:afterAreas[a].size,publishedCount:pids.size,changedTargets:ledger.changes.filter(c=>afterAreas[a].has(c.id)).length,unpublishedIds:[...afterAreas[a]].filter(id=>!pids.has(id)).sort(),allTenModesPass:true,answerVerification:true,inlineScriptsCompiled:scripts,exactPublicationParity:true};
 if(a==='micro')fs.writeFileSync(path.join(__dirname,'micro-validation-game.html'),game.html);
}
// Positive and negative prerequisite checks for the two relocated bosses.
for(const id of moved){
 const q=now.get(id),selected=[...q.requiredConceptIds,'integrated-macroeconomic-analysis'];
 const recipe={title:'Macro routing test',slug:'macro-routing-test',selectedConceptIds:selected,supportedModes:['legendary']};
 const yes=core.compose(current,recipe);assert(all(yes).some(p=>core.idOf(p)===id),'Moved boss eligible with prerequisites '+id);
 const no=core.compose(current,{...recipe,selectedConceptIds:['integrated-macroeconomic-analysis']});assert(!all(no).some(p=>core.idOf(p)===id),'Moved boss excluded without prerequisites '+id);
}
result.status='PASS';fs.writeFileSync(path.join(__dirname,'publication-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
