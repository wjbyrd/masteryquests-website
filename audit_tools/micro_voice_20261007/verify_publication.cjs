'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer');
const core=require(path.join(dir,'composer-core.js')),h=require(path.join(dir,'tests/composer-test-helpers.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js')),approved=require(path.join(dir,'tests/micro-voice-revisions.js'));
const current=h.loadComposerLibrary();approved.assertCurrentLibrary(current);const before=approved.beforeMicroVoiceLibrary(current),ledger=approved.microVoiceLedger;
const area=require(path.join(dir,'course-area-model.js')).create(current.registry.concepts),now=new Map(con.questionRecords(current).map(r=>[String(r.question.id),r.question]));
const all=c=>[...Object.values(c.banks).flat(),...Object.values(c.challengeQuestionBanks).flat(),...c.repairQuestions,...c.bridgeQuestions,...Object.values(c.microSkillRepairPools).flat(),...Object.values(c.microSkillBridgePools).flat(),...Object.values(c.skillRepairSeedPools).flat()];
const result={status:'PASS',librarySha256:current.librarySha256,areas:{}};
(async()=>{
 for(const a of ['general','micro','macro']){
  const ids=area.conceptsForArea(a).map(c=>c.canonicalConceptId),selected=ids.filter(id=>!current.concepts[id].derivedFromConceptId||!ids.includes(current.concepts[id].derivedFromConceptId));
  if(a==='macro'&&!selected.includes('integrated-macroeconomic-analysis'))selected.push('integrated-macroeconomic-analysis');
  // Three approved market-failure items belong to the existing legacy parent.
  // Explicitly exercise that supported recipe path; do not change selectors.
  if(a==='micro')selected.push('market-failures');
  const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:`${a} faculty voice verification`,slug:`${a}-faculty-voice-verification`,selectedConceptIds:selected,supportedModes:core.MODE_ORDER,contentScopes:Object.fromEntries(selected.map(id=>[id,{depth:'full'}])),checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
  const comp=core.compose(current,recipe),oldComp=core.compose(before,recipe);
  assert.equal(comp.errors.length,0,JSON.stringify(comp.errors));assert(comp.validation.modes.every(m=>m.ok));assert((await core.verifyAnswers(comp)).ok);
  const published=all(comp),prior=all(oldComp),pids=new Set(published.map(core.idOf)),oldIds=new Set(prior.map(core.idOf));assert.deepEqual([...pids].sort(),[...oldIds].sort());
  if(a!=='micro')assert.deepEqual(published,prior,'Exact shared-area publication freeze '+a);
  for(const q of published)for(const f of ['q','options','aHash','feedback','image','imageAlt','graphDescription','graphRequired','canonicalDifficulty','instructionalRole','checkpointPool'])assert.deepEqual(q[f],now.get(core.idOf(q))[f],`${a}/${q.id}/${f}`);
  const targets=ledger.changes.filter(c=>c.areas.includes(a));assert(targets.every(c=>pids.has(c.id)),'Every edited target reaches full-scope student publication: '+targets.filter(c=>!pids.has(c.id)).map(c=>c.id));
  comp.embeddedQuestionAssets=Object.fromEntries(comp.assets.map(asset=>[asset.runtimePath,'data:image/webp;base64,'+fs.readFileSync(path.join(dir,asset.sourceUrl)).toString('base64')]));
  const game=await h.buildFacultyGame(core,recipe,{library:current,composition:comp});const scripts=h.assertInlineScriptsCompile(game.html);
  fs.writeFileSync(path.join(__dirname,a+'-validation-game.html'),game.html);
  result.areas[a]={published:pids.size,editedTargets:targets.length,allEditedTargetsPublished:true,explicitLegacyConcepts:a==='micro'?['market-failures']:[],modes:comp.validation.modes.map((m,i)=>({mode:core.MODE_ORDER[i],ok:m.ok})),answersVerified:true,recordParity:true,inlineScriptsCompiled:scripts,publicationMembershipUnchanged:true};
 }
 fs.writeFileSync(path.join(__dirname,'publication-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1});
