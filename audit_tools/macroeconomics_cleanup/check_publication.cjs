'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const h=require('../../build/faculty-build-composer/tests/composer-test-helpers.js'),core=require('../../build/faculty-build-composer/composer-core.js');
const integrity=require('../../build/faculty-build-composer/tests/composer-integrity-contracts.js');
const approved=require('../../build/faculty-build-composer/tests/macroeconomics-approved-revisions.js');
const lib=h.loadComposerLibrary(),area=require('../../build/faculty-build-composer/course-area-model.js').create(lib.registry.concepts);
const canonical=new Map(integrity.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const universe=JSON.parse(fs.readFileSync(path.join(__dirname,'inputs/baseline.json'),'utf8')).areaIDs.macro;
const questions=c=>[...Object.values(c.banks).flat(),...Object.values(c.challengeQuestionBanks).flat(),...c.repairQuestions,...c.bridgeQuestions,...Object.values(c.microSkillRepairPools||{}).flat(),...Object.values(c.microSkillBridgePools||{}).flat(),...Object.values(c.skillRepairSeedPools||{}).flat()];
(async()=>{
 const all=area.conceptsForArea('macro').map(c=>c.canonicalConceptId);
 const selected=all.filter(id=>!lib.concepts[id].derivedFromConceptId||!all.includes(lib.concepts[id].derivedFromConceptId));
 // Include the existing hidden integrated supplement explicitly, as in the
 // instructor's full-bank scope; it remains outside the selectable card list.
 if(!selected.includes('integrated-macroeconomic-analysis'))selected.push('integrated-macroeconomic-analysis');
 const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Macroeconomics Consolidated Cleanup',slug:'macroeconomics-consolidated-cleanup',selectedConceptIds:selected,supportedModes:[...core.MODE_ORDER],checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
 const before=core.compose(approved.macroBaselineLibrary,recipe),oldIds=new Set(questions(before).map(q=>String(q.canonicalId||q.id)));
 const composition=core.compose(lib,recipe);
 composition.embeddedQuestionAssets=Object.fromEntries(composition.assets.map(a=>[a.runtimePath,'data:image/webp;base64,'+fs.readFileSync(path.resolve(__dirname,'../../build/faculty-build-composer/data',a.runtimePath)).toString('base64')]));
 const game=await h.buildFacultyGame(core,recipe,{library:lib,composition}),scripts=h.assertInlineScriptsCompile(game.html),qs=questions(game.composition),ids=new Set(qs.map(q=>String(q.canonicalId||q.id)));
 const oldMissing=universe.filter(id=>!oldIds.has(id)),newMissing=universe.filter(id=>!ids.has(id)),newOmissions=newMissing.filter(id=>!oldMissing.includes(id));
 assert.deepEqual(newOmissions,[],'No new publication omission');
 for(const id of ids)assert(universe.includes(id),'Only Macro IDs publish '+id);
 for(const q of qs){const id=String(q.canonicalId||q.id);if(!approved.macroIds.has(id))continue;for(const f of ['q','options','aHash','feedback','type'])assert.deepEqual(q[f],canonical.get(id)[f],'Revised publication parity '+id+'.'+f);}
 const answerCheck=await core.verifyAnswers(game.composition);assert(answerCheck.ok,'All published answer hashes resolve');
 assert(game.composition.validation.modes.every(m=>m.ok),'All supported modes');
 const graphIds=approved.macroLedger.changes.filter(c=>c.after.graphRequired===true).map(c=>c.id);
 for(const id of graphIds){const q=qs.find(q=>String(q.canonicalId||q.id)===id);assert(q&&q.image,'Revised graph published '+id);assert(game.composition.embeddedQuestionAssets[q.image],'Graph asset embedded '+id);}
 const result={integrity:integrity.assertCanonicalIntegrity(lib),macroProjection:universe.length,publishedUniqueIDs:ids.size,priorPublishedUniqueIDs:oldIds.size,revisedIdsPublished:[...approved.macroIds].filter(id=>ids.has(id)).length,unchangedLegacyUnpublishedIds:newMissing,priorUnpublishedIds:oldMissing,newOmissions,restoredPublicationIds:oldMissing.filter(id=>ids.has(id)),inlineScripts:scripts,answerHashesValid:answerCheck.ok,qualifiedGraphsEmbedded:graphIds,modes:game.composition.validation.modes.map(m=>({mode:m.mode,ok:m.ok}))};
 fs.writeFileSync('tmp/macroeconomics_cleanup/macroeconomics-student.html',game.html);
 fs.writeFileSync('tmp/macroeconomics_cleanup/publication.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
