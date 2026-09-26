import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {loadComposerLibrary,collectComposerQuestions,auditQuestionConstruction} from '../../../audit_tools/question_quality_auditor.mjs';
const require=createRequire(import.meta.url),core=require('../composer-core.js');
const integrity=require('./composer-integrity-contracts.js');
const approved=require('./general-economics-approved-revisions.js');
const out='validation_artifacts/question_bank_audit_20260919';
const baselineRef='c171eca5645e27baef4e36a4eb990bb0b07f61c7';
const relative='build/faculty-build-composer/data/composer_library.js';
const source=execFileSync('git',['show',`${baselineRef}:${relative}`],{encoding:'utf8',maxBuffer:64*1024*1024});
const baseline=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
const current=loadComposerLibrary(),changes=JSON.parse(fs.readFileSync(out+'/revisions.json','utf8'));
const before=collectComposerQuestions(baseline),after=collectComposerQuestions(current);
const byId=new Map(after.map(e=>[String(e.id),e])),beforeById=new Map(before.map(e=>[String(e.id),e]));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const norm=s=>s.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
assert.deepEqual([...byId.keys()].sort(),[...beforeById.keys()].sort(),'No question IDs added, removed or duplicated');
assert.equal(changes.length,new Set(changes.map(c=>c.id)).size);
for(const e of before){
 const revision=changes.find(c=>c.id===e.id),actual=byId.get(e.id);
 if(revision)assert.deepEqual(revision.before,e.question,'Revision before-state matches immutable Git baseline: '+e.id);
 let expected=structuredClone(revision?.after||e.question);if(expected.image===null)delete expected.image;
 expected=approved.applyApprovedRevisions(expected);
 assert.deepEqual(actual.question,expected,'Canonical after-state, including untouched fields: '+e.id);
 if(revision)assert.equal(actual.conceptId,revision.after.primaryConceptId,'Concept routing '+e.id);
 assert.equal(actual.question.options.filter(o=>sha(norm(o))===actual.question.aHash).length,1,'Unique answer key '+e.id);
 assert(typeof actual.question.tag==='string'&&actual.question.tag.trim(),'Required tag '+e.id);
 const module=current.concepts[actual.conceptId];
 assert(new Set([...(module.legacyObjectives||[]),...Object.keys(module.objectiveLabels||{})]).has(actual.question.objective),'Declared objective reference '+e.id);
}
const raw=integrity.questionRecords(current),aliases=new Map();
for(const [concept,module] of Object.entries(current.concepts))for(const [pool,qs] of Object.entries(module.questions||{}))assert.equal(new Set(qs.map(q=>q.id)).size,qs.length,`Duplicate ID within ${concept}/${pool}`);
for(const {question:q} of raw){if(aliases.has(q.id))assert.deepEqual(q,aliases.get(q.id),'Alias parity '+q.id);else aliases.set(q.id,q);}
const canonical=integrity.assertCanonicalIntegrity(current);
const payoffTables=[];
for(const id of ['P62I-OLI-LB-001','P62I-OLI-LB-004']){
 const q=byId.get(id).question;
 const payoffs=[...q.q.matchAll(/<td>\((\d+), (\d+)\)<\/td>/g)].map(m=>[Number(m[1]),Number(m[2])]);
 assert.equal(payoffs.length,4,'Four labelled payoff cells');
 assert(q.q.includes('scope="col"')&&q.q.includes('scope="row"'),'Accessible table headers');
 const labels=['A/X','A/Y','B/X','B/Y'];
 const nash=labels.filter((_,i)=>payoffs[i][0]>=payoffs[(i+2)%4][0]&&payoffs[i][1]>=payoffs[i^1][1]);
 const totals=payoffs.map(p=>p[0]+p[1]);const joint=labels.filter((_,i)=>totals[i]===Math.max(...totals));
 assert.equal(nash.length,1);assert.equal(joint.length,1);
 const key=q.options.find(o=>sha(norm(o))===q.aHash);
 assert.equal(key,`${nash[0]} is the unique equilibrium; ${joint[0]} maximizes joint payoff`);
 payoffTables.push({id,payoffs,nash,joint});
}
fs.writeFileSync(out+'/boss-payoff-table-proof.json',JSON.stringify(payoffTables,null,2)+'\n');
const composer=fs.readFileSync('build/faculty-build-composer/composer.js','utf8');
const presetText=composer.match(/const PRESETS = (\[[\s\S]*?\n\]);/)[1];
const presets=vm.runInNewContext('('+presetText+')');
const generated=[];
for(const preset of presets){
 for(const id of preset.conceptIds)assert(current.concepts[id],'Broken preset '+id);
 const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Audit',slug:'question-bank-audit',selectedConceptIds:[...preset.conceptIds],supportedModes:[...core.MODE_ORDER],checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
 const composition=core.compose(current,recipe),old=core.compose(baseline,recipe);
 assert.deepEqual(composition.errors,old.errors,'No new composition errors '+preset.id);
 const qs=[...Object.values(composition.banks).flat(),...Object.values(composition.challengeQuestionBanks).flat(),...composition.repairQuestions,...composition.bridgeQuestions];
 for(const q of qs){
   assert(!Object.hasOwn(q,'answer')&&!Object.hasOwn(q,'correct'),'Student-safe key handling '+q.id);
   assert.equal(q.options.filter(o=>sha(norm(o))===q.aHash).length,1,'Published answer hash '+q.id);
   const canonical=byId.get(String(q.canonicalId||q.id));
   assert(canonical,'Generated ID exists '+q.id);
   assert.equal(q.q,canonical.question.q,'Generated stem parity '+q.id);
   assert.deepEqual([...q.options].sort(),[...canonical.question.options].sort(),'Generated option parity '+q.id);
 }
 generated.push({preset:preset.id,selectedConceptIds:preset.conceptIds.length,generatedOccurrences:qs.length,modes:composition.validation.modes.map(m=>({mode:m.mode,ok:m.ok}))});
}
const general=generated.find(p=>p.preset==='general-foundations');assert.equal(general.selectedConceptIds,10,'General Quick Build contains ten explicitly selected IDs');
const construction=auditQuestionConstruction(after),beforeConstruction=auditQuestionConstruction(before);
const countBy=(items,key)=>Object.fromEntries([...new Set(items.map(key))].sort().map(k=>[k,items.filter(x=>key(x)===k).length]));
const legendary=entries=>entries.filter(e=>e.question.canonicalDifficulty==='legendary'||e.pools.has('legendaryBoss'));
const cues=(findings,entries)=>new Set(findings.filter(f=>f.rule==='key-length-145-percent'&&legendary(entries).some(e=>e.id===f.questionId)).map(f=>f.questionId));
const beforeCues=cues(beforeConstruction,before),afterCues=cues(construction,after);
const allAfterLengthFlags=new Set(construction.filter(f=>f.rule==='key-length-145-percent').map(f=>f.questionId));
const report={status:'PASS',baselineRef,baselineSha256:sha(source),canonical,questionsAudited:after.length,questionsChanged:changes.length,unchanged:after.length-changes.length,changesByConcept:countBy(changes,c=>c.concept),changesByOriginalDifficulty:countBy(changes,c=>c.difficulty),difficultyBefore:countBy(before,e=>e.question.canonicalDifficulty||'unknown'),difficultyAfter:countBy(after,e=>e.question.canonicalDifficulty||'unknown'),reclassifications:changes.filter(c=>c.before.canonicalDifficulty!==c.after.canonicalDifficulty).map(c=>({id:c.id,from:c.before.canonicalDifficulty,to:c.after.canonicalDifficulty})),routingCorrections:changes.filter(c=>c.before.primaryConceptId!==c.after.primaryConceptId).map(c=>c.id),graphsRemoved:changes.filter(c=>c.before.image&&!c.after.image).map(c=>c.id),legendaryLengthCueFlagsBefore:beforeCues.size,legendaryLengthCueFlagsAfter:afterCues.size,originalFlagsResolved:[...beforeCues].filter(id=>!afterCues.has(id)).length,generated,constructionRuleCounts:countBy(construction,f=>f.rule)};
report.originalLegendaryLengthFlagsClearedByContent=[...beforeCues].filter(id=>!allAfterLengthFlags.has(id)).length;
report.originalLegendaryLengthFlagsReclassifiedOnly=[...beforeCues].filter(id=>allAfterLengthFlags.has(id)&&!afterCues.has(id)).length;
fs.writeFileSync(out+'/validation.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(out+'/legendary-review-index.json',JSON.stringify(legendary(before).map(e=>({id:e.id,concept:e.conceptId,primarySkill:e.question.primarySkill,changed:changes.some(c=>c.id===e.id),difficultyAfter:byId.get(e.id).question.canonicalDifficulty,flagsBefore:beforeConstruction.filter(f=>f.questionId===e.id).map(f=>f.rule),flagsAfter:construction.filter(f=>f.questionId===e.id).map(f=>f.rule)})),null,2)+'\n');
console.log(JSON.stringify({status:report.status,questions:after.length,changed:changes.length,legendaryCueFlags:[beforeCues.size,afterCues.size],presets:generated.length}));
