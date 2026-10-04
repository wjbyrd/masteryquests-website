'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer'),out=path.join(root,'faculty_exports/audits/graph_assessment_live_playthrough_remediation_20261004_evidence');
const core=require(path.join(cdir,'composer-core.js')),h=require(path.join(cdir,'tests/composer-test-helpers.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js')),approved=require(path.join(cdir,'tests/graph-playthrough-approved-revisions.js'));
const current=h.loadComposerLibrary(),prior=JSON.parse(fs.readFileSync(path.join(out,'composer_library.js'),'utf8').slice(27).trim().slice(0,-1)),ledger=require('./expectations.json');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const records=contracts.questionRecords(current),now=new Map(records.map(r=>[String(r.question.id),r.question])),old=new Map(contracts.questionRecords(prior).map(r=>[String(r.question.id),r.question]));
approved.assertCurrentLibrary(current);assert.deepEqual([...now.keys()].sort(),[...old.keys()].sort());
assert.deepEqual([...now].filter(([id,q])=>core.stableStringify(q)!==core.stableStringify(old.get(id))).map(([id])=>id).sort(),ledger.changes.map(c=>c.id).sort());
const area=require(path.join(cdir,'course-area-model.js')).create(current.registry.concepts);
const projection=l=>{const result={general:new Set(),micro:new Set(),macro:new Set()};for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid)))for(const a of area.areasFor(cid))result[a].add(String(q.id));return result;};
const beforeAreas=projection(prior),afterAreas=projection(current);
const allPublished=c=>[...Object.values(c.banks).flat(),...Object.values(c.challengeQuestionBanks).flat(),...c.repairQuestions,...c.bridgeQuestions,...Object.values(c.microSkillRepairPools).flat(),...Object.values(c.microSkillBridgePools).flat(),...Object.values(c.skillRepairSeedPools).flat()];
const result={librarySha256:current.librarySha256,canonicalIds:now.size,unauthorizedQuestionChanges:0,areas:{},negativeControls:[]};
for(const c of ledger.changes.filter(c=>c.afterRecord.checkpointPool)){
 const q=c.afterRecord,valid=core.validateFacultyQuestionRecord(q,q.checkpointPool,new Set([q.image]));assert.deepEqual(valid,[]);
 const wrong=q.checkpointPool==='easyBoss'?'mediumBoss':'easyBoss';const invalid=core.validateFacultyQuestionRecord(q,wrong,new Set([q.image]));assert(invalid.includes('pool/checkpoint-stage'));
}
result.negativeControls.push('All 51 recalibrated checkpoint records validate only at their preserved checkpoint stage');
for(const [id,field,value]of [[ledger.changes[0].id,'primarySkill','unapproved'],['ECON-MG-EASY-1','q','unapproved']]){const bad=structuredClone(current);for(const r of contracts.questionRecords(bad))if(String(r.question.id)===id)r.question[field]=value;assert.throws(()=>approved.assertCurrentLibrary(bad));result.negativeControls.push(`${id}.${field}: rejected`);}
(async()=>{
for(const a of ['general','micro','macro']){
 assert.deepEqual([...afterAreas[a]].sort(),[...beforeAreas[a]].sort());
 const all=area.conceptsForArea(a).map(c=>c.canonicalConceptId),selected=all.filter(id=>!current.concepts[id].derivedFromConceptId||!all.includes(current.concepts[id].derivedFromConceptId));if(a==='macro'&&!selected.includes('integrated-macroeconomic-analysis'))selected.push('integrated-macroeconomic-analysis');
 const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:`${a} remediation validation`,slug:`${a}-remediation-validation`,selectedConceptIds:selected,supportedModes:core.MODE_ORDER,checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
 const comp=core.compose(current,recipe),oldComp=core.compose(prior,recipe);assert(comp.validation.modes.every(m=>m.ok),JSON.stringify(comp.errors));
 const answers=await core.verifyAnswers(comp);assert(answers.ok);
 comp.embeddedQuestionAssets=Object.fromEntries(comp.assets.map(asset=>[asset.runtimePath,'data:image/webp;base64,'+fs.readFileSync(path.join(cdir,asset.sourceUrl)).toString('base64')]));
 const game=await h.buildFacultyGame(core,recipe,{library:current,composition:comp}),scripts=h.assertInlineScriptsCompile(game.html),published=allPublished(game.composition),ids=new Set(published.map(core.idOf)),beforeIds=new Set(allPublished(oldComp).map(core.idOf));assert.deepEqual([...ids].sort(),[...beforeIds].sort());
 for(const q of published)for(const f of ['q','options','aHash','feedback','image','graphRequired','canonicalDifficulty','type','checkpointPool'])assert.deepEqual(q[f],now.get(core.idOf(q))[f],`${a} ${q.id} ${f}`);
 const targets=ledger.changes.filter(c=>afterAreas[a].has(c.id));const unpublished=[...afterAreas[a]].filter(id=>!ids.has(id)).sort();
 result.areas[a]={canonicalCount:afterAreas[a].size,publishedCount:ids.size,changedTargets:targets.length,unchangedUnpublishedIds:unpublished,unpublishedTargets:targets.filter(c=>!ids.has(c.id)).map(c=>c.id),allTenModesPass:true,answerVerification:true,inlineScriptsCompiled:scripts,exactPublicationParity:true};
 if(a==='micro')fs.writeFileSync(path.join(out,'micro-validation-game.html'),game.html);
}
const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline.json'),'utf8'));
const permitted=new Set(['composer-core.js','template/mastery-quests-faculty-template-composer-ready.html','data/composer_library.js','data/composer_registry.json','data/composer_library_manifest.json','data/faculty-outcomes.js',...['composer-audit-contracts.js','run_content_scope_validation.js','run_fading_fortune_validation.js','run_macro_phase2_taxonomy_validation.mjs','run_phase3e_graph_question_sync_validation.mjs','run_question_bank_comprehensive_validation.mjs','run_trial_by_graph_validation.js','run_risk_reward_validation.js'].map(x=>'tests/'+x)].map(x=>'build/faculty-build-composer/'+x));
ledger.assets.forEach(a=>permitted.add('build/faculty-build-composer/data/'+a.path));
const changedFiles=Object.entries(baseline.files).filter(([f,v])=>sha(fs.readFileSync(path.join(root,f)))!==v).map(([f])=>f.replaceAll('\\','/'));
const testArtifacts=new Set(['build/faculty-build-composer/tests/phase3e-market-gate-sample.html','tools/tests/__pycache__/test_export_faculty_question_bank.cpython-312.pyc']);
result.generatedTestArtifacts=changedFiles.filter(f=>testArtifacts.has(f));
result.unexpectedProtectedFileChanges=changedFiles.filter(f=>!permitted.has(f)&&!testArtifacts.has(f)&&!f.startsWith('faculty_exports/'));assert.deepEqual(result.unexpectedProtectedFileChanges,[]);
result.changedProtectedFiles=changedFiles;result.status='PASS';fs.writeFileSync(path.join(out,'publication-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
