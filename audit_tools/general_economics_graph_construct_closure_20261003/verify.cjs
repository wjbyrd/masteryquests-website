'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer'),work=path.join(root,'tmp/general_economics_graph_construct_closure_20261003');
const core=require(path.join(cdir,'composer-core.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js')),approved=require(path.join(cdir,'tests/general-economics-construct-approved-revisions.js')),h=require(path.join(cdir,'tests/composer-test-helpers.js'));
const parse=s=>JSON.parse(s.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
const prior=parse(fs.readFileSync(path.join(work,'composer_library.js'),'utf8')),current=h.loadComposerLibrary();
const ledger=JSON.parse(fs.readFileSync(path.join(__dirname,'expectations.json'),'utf8'));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const rows=contracts.questionRecords(current),oldRows=contracts.questionRecords(prior),old=new Map(oldRows.map(r=>[String(r.question.id),r.question])),now=new Map(rows.map(r=>[String(r.question.id),r.question]));
assert.deepEqual([...old.keys()].sort(),[...now.keys()].sort());
approved.assertCurrentLibrary(current);
const changed=[...now].filter(([id,q])=>core.stableStringify(q)!==core.stableStringify(old.get(id))).map(([id])=>id).sort();
assert.deepEqual(changed,ledger.authorizedIds);
const placement=r=>r.map(x=>[String(x.question.id),x.conceptId,x.pool].join('|')).sort();assert.deepEqual(placement(rows),placement(oldRows));
const projected=structuredClone(current);for(const r of contracts.questionRecords(projected))if(changed.includes(String(r.question.id)))Object.assign(r.question,structuredClone(old.get(String(r.question.id))));
projected.librarySha256=prior.librarySha256;projected.registry.librarySha256=prior.registry.librarySha256;
assert.deepEqual(projected,prior,'All other content, metadata, routes, graph references and assets unchanged');
const keyChecks=[];
for(const c of ledger.changes){
 const q=now.get(c.id);assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);
 const matches=q.options.map((o,i)=>sha(core.normalizeAnswerText(o))===q.aHash?i:null).filter(i=>i!==null);
 assert.deepEqual(matches,[c.correctIndex]);assert.deepEqual(q,c.afterRecord);
 assert.equal(c.review.construct_test.answer,'NO');assert.equal(c.review.graph_test.answer,'NO');assert.equal(q.image,c.beforeRecord.image);
 assert.equal(c.correctIndex,'ABCD'.indexOf(c.review.graph_test.economically_plausible_without_graph[0]));
 keyChecks.push({id:c.id,choices:4,distinctChoices:4,resolvedKeys:1,correctIndex:matches[0],hashChanged:c.answerHashChanged});
}
const area=require(path.join(cdir,'course-area-model.js')).create(current.registry.concepts);
const projection=l=>{const result={general:new Set(),micro:new Set(),macro:new Set()};for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid)))for(const a of area.areasFor(cid))result[a].add(String(q.id));return result;};
const beforeAreas=projection(prior),afterAreas=projection(current),bankChecks={};
for(const a in afterAreas){assert.deepEqual([...afterAreas[a]].sort(),[...beforeAreas[a]].sort());const shared=changed.filter(id=>afterAreas[a].has(id));bankChecks[a]={ids:afterAreas[a].size,changedAuthorizedIds:shared,unrelatedUnchanged:afterAreas[a].size-shared.length};}
const negative=[];
for(const[id,field,value]of [[changed[0],'q','Unauthorized question mutation'],['ECON-MG-EASY-1','feedback','Unauthorized unrelated mutation'],[changed[0],'difficulty','unauthorized']]){
 const bad=structuredClone(current);for(const r of contracts.questionRecords(bad))if(String(r.question.id)===id)r.question[field]=value;
 assert.throws(()=>approved.assertCurrentLibrary(bad));negative.push({id,field,rejected:true});
}
const checksums=JSON.parse(fs.readFileSync(path.join(work,'protected_files.json'),'utf8'));
const allowed=new Set(['data/composer_library.js','data/composer_registry.json','data/composer_library_manifest.json','data/faculty-outcomes.js',...['run_content_scope_validation.js','run_phase3e_graph_question_sync_validation.mjs','run_fading_fortune_validation.js','run_macro_phase2_taxonomy_validation.mjs','run_question_bank_comprehensive_validation.mjs','composer-audit-contracts.js','run_trial_by_graph_validation.js','run_risk_reward_validation.js'].map(n=>'tests/'+n)].map(n=>'build/faculty-build-composer/'+n));
const unexpected=[];for(const [f,digest]of Object.entries(checksums)){if(sha(fs.readFileSync(path.join(root,f)))!==digest&&!allowed.has(f.replaceAll('\\','/')))unexpected.push(f);}assert.deepEqual(unexpected,[],'No unapproved Composer file changes');
const recipe=ids=>({schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'General Economics editorial cleanup',slug:'general-editorial-check',selectedConceptIds:ids,supportedModes:[...core.MODE_ORDER],checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))});
(async()=>{
 const all=area.conceptsForArea('general').map(c=>c.canonicalConceptId),selected=all.filter(id=>!current.concepts[id].derivedFromConceptId||!all.includes(current.concepts[id].derivedFromConceptId));
 const comp=core.compose(current,recipe(selected));assert(comp.validation.modes.length===10&&comp.validation.modes.every(m=>m.ok));
 const answers=await core.verifyAnswers(comp);assert(answers.ok);
 comp.embeddedQuestionAssets=Object.fromEntries(comp.assets.map(a=>[a.runtimePath,'data:image/webp;base64,'+fs.readFileSync(path.join(cdir,a.sourceUrl)).toString('base64')]));
 const game=await h.buildFacultyGame(core,recipe(selected),{library:current,composition:comp}),inlineScriptsCompiled=h.assertInlineScriptsCompile(game.html);
 const published=[...Object.values(game.composition.banks).flat(),...Object.values(game.composition.challengeQuestionBanks).flat(),...game.composition.repairQuestions,...game.composition.bridgeQuestions,...Object.values(game.composition.microSkillRepairPools).flat(),...Object.values(game.composition.microSkillBridgePools).flat(),...Object.values(game.composition.skillRepairSeedPools).flat()];
 const ids=new Set(published.map(core.idOf));assert.deepEqual([...ids].sort(),[...afterAreas.general].sort());
 for(const id of changed)assert(ids.has(id));for(const q of published)for(const f of ['q','options','aHash','feedback'])assert.deepEqual(q[f],now.get(core.idOf(q))[f]);
 const result={sourceSha256:sha(fs.readFileSync(path.join(cdir,'data/composer_library.js'))),integrity:contracts.assertCanonicalIntegrity(current),changedIds:changed,keyChecks,bankChecks,unauthorizedRecordChanges:0,preservedMetadata:true,preservedRouting:true,preservedGraphAssets:true,protectedExistingFiles:Object.keys(checksums).length,unexpectedFileChanges:unexpected,negativeProbes:negative,publication:{publishedIds:ids.size,allTargetsPresent:true,exactContentParity:true,inlineScriptsCompiled,allTenModesPass:true,answerVerification:answers}};
 fs.writeFileSync(path.join(work,'verification.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({...result,changedIds:changed.length,keyChecks:keyChecks.length,publication:{...result.publication,answerVerification:answers.ok}},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
