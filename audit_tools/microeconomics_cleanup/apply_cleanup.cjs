'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'tmp/microeconomics_cleanup'),composer=path.join(root,'build/faculty-build-composer');
const core=require(path.join(composer,'composer-core.js')), contracts=require(path.join(composer,'tests/composer-integrity-contracts.js'));
const {execFileSync}=require('node:child_process');
const sourceAt=relative=>execFileSync('git',['show','04f9ca7:'+relative],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024});
const frozenSource=sourceAt('build/faculty-build-composer/data/composer_library.js');
assert.equal(crypto.createHash('sha256').update(frozenSource).digest('hex'),'9b3dc7e1b647323cc35b789d6968633bef5f3249e022ac663ec37f78a4740db9','Immutable starting source');
const baselineInputs={
 'baseline_library.json':JSON.parse(frozenSource.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1)),
 'baseline_manifest.json':JSON.parse(sourceAt('build/faculty-build-composer/data/composer_library_manifest.json')),
 'baseline_outcomes.json':(()=>{const context={module:{exports:{}}};require('node:vm').runInNewContext(sourceAt('build/faculty-build-composer/data/faculty-outcomes.js'),context);return JSON.parse(JSON.stringify(context.module.exports));})(),
 'baseline.json':{auditSourceSha256:'9b3dc7e1b647323cc35b789d6968633bef5f3249e022ac663ec37f78a4740db9'}
};
const read=name=>baselineInputs[name]||JSON.parse(fs.readFileSync(path.join(__dirname,'inputs',name),'utf8')), clone=x=>structuredClone(x), stable=core.stableStringify, sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const baseline=read('baseline_library.json'), library=clone(baseline), patches=read('question_patches.json'), routes=read('routing_decisions.json'), graphs=process.argv.includes('--generated-graphs')?JSON.parse(fs.readFileSync(path.join(dir,'graphs/manifest.json'),'utf8')):read('graphs/manifest.json'), manifest=read('baseline_manifest.json');
const questionMap=lib=>new Map(contracts.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const before=questionMap(baseline), touched=new Set(), moves=[];
for(const r of contracts.questionRecords(library)){
 const id=String(r.question.id),patch=patches[id];if(!patch)continue;
 for(const [field,value]of Object.entries(patch))if(field!=='$unset')r.question[field]=clone(value);
 for(const field of patch.$unset||[])delete r.question[field];touched.add(r.conceptId);
 const matches=r.question.options.filter(o=>sha(core.normalizeAnswerText(o))===r.question.aHash);
 assert.equal(matches.length,1,'Exactly one hashed answer '+id);
 assert.equal(new Set(r.question.options.map(core.normalizeAnswerText)).size,4,'Unique options '+id);
 assert(!/NaN|undefined/.test(r.question.q+' '+r.question.options.join(' ')+' '+r.question.feedback),'No numerical sentinel '+id);
}
// Difficulty changes move only ordinary tier pools. Calculation, integration,
// checkpoint and support roles remain independently routed.
for(const [cid,module]of Object.entries(library.concepts)){
 const pending=[];
 for(const pool of ['easy','medium','hard','elite','legendary']){
  if(!module.questions?.[pool])continue;
  module.questions[pool]=module.questions[pool].filter(q=>{
   const tier=patches[String(q.id)]?.difficulty;
   if(tier&&tier!==pool&&['easy','medium','hard','elite','legendary'].includes(tier)){
    pending.push({q,tier});moves.push({id:String(q.id),conceptId:cid,from:pool,to:tier});return false;
   }return true;
  });
 }
 for(const {q,tier}of pending)(module.questions[tier]||=[]).push(q);
}
for(const decision of routes.filter(x=>x.removeFromMicro)){
 const source=library.concepts[decision.from],destination=library.concepts[decision.to];assert(destination,'Existing destination');
 let count=0;
 destination.legacyObjectives=[...new Set([...(destination.legacyObjectives||[]),...Object.values(source.questions).flat().filter(q=>String(q.id)===decision.id).map(q=>q.objective).filter(Boolean)])];
 for(const q of Object.values(source.questions).flat().filter(q=>String(q.id)===decision.id)){if(source.objectiveLabels?.[q.objective]){destination.objectiveLabels||={};destination.objectiveLabels[q.objective]=source.objectiveLabels[q.objective];}} 
 for(const [pool,questions]of Object.entries(source.questions)){
  const moved=questions.filter(q=>String(q.id)===decision.id);source.questions[pool]=questions.filter(q=>String(q.id)!==decision.id);
  for(const q of moved){q.primaryConceptId=decision.to;if(decision.to==='demand-and-supply-shocks'){q.familyConceptId='ad-as-equilibrium';q.subtopicIds=[decision.to];}else if(q.familyConceptId===decision.from)q.familyConceptId=decision.to;(destination.questions[pool]||=[]).push(q);count++;}
 }
 assert.equal(count,1,'Exactly one routed record '+decision.id);touched.add(decision.from);touched.add(decision.to);
}
const graphBytes=new Map(graphs.map(g=>[g.runtimePath,fs.readFileSync(path.resolve(root,g.stagedFile))]));
for(const asset of [...library.assetInventory,...Object.values(library.concepts).flatMap(m=>m.assetMetadata||[])]){
 const g=graphs.find(g=>g.runtimePath===asset.runtimePath);if(!g)continue;const bytes=graphBytes.get(g.runtimePath);
 Object.assign(asset,{sha256:sha(bytes),sizeBytes:bytes.length,imageAlt:g.imageAlt,graphDescription:g.graphDescription});touched.add(asset.conceptId);
}
// Resolve child views through the production core instead of duplicating records.
function entries(module){return contracts.questionRecords({concepts:{x:module}});}
function metadata(entry,module){
 const rows=entries(module),unique=[...new Map(rows.map(r=>[String(r.question.id),r.question])).values()],p=module.questions||{},boss=p.boss||[];
 entry.includedSkills=[...new Set(unique.map(q=>q.primarySkill).filter(Boolean))].sort();
 entry.questionCountByRole={boss:boss.length,bridge:(module.bridgeQuestions||[]).length,calculation:(p.calculation||[]).length,elite:(p.elite||[]).length,integration:(p.integration||[]).length,legendary:(p.legendary||[]).length,legendaryBoss:(p.legendaryBoss||[]).length,main:['easy','medium','hard'].reduce((n,k)=>n+(p[k]||[]).length,0),repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length};
 entry.questionCountByDifficulty={easy:0,medium:0,hard:0,elite:0,legendary:0,unknown:0};for(const q of unique){const tier=q.canonicalDifficulty||q.difficulty;entry.questionCountByDifficulty[tier in entry.questionCountByDifficulty?tier:'unknown']++;}
 entry.repairCoverage={directSkillMatches:(module.repairQuestions||[]).length,mainWithUsableSkill:unique.length};
 entry.bridgeCoverage={directSkillMatches:(module.bridgeQuestions||[]).length,mainWithUsableSkill:unique.length};
 entry.calculationCoverage=unique.filter(q=>/calculat/i.test(q.type||'')||q.instructionalRole==='calculation').length;
 entry.graphCoverage=unique.filter(q=>q.image).length;
 if(entry.runtimeAdaptiveCounts){const counts={easy:0,medium:0,hard:0};for(const pool of Object.keys(counts))counts[pool]=(p[pool]||[]).length;for(const q of [...p.calculation||[],...p.integration||[]]){const tier=q.canonicalDifficulty||q.difficulty;if(tier in counts)counts[tier]++;}entry.runtimeAdaptiveCounts=counts;}
}
for(const entry of library.registry.concepts){const module=library.concepts[entry.canonicalConceptId];if(touched.has(entry.canonicalConceptId)||touched.has(module.derivedFromConceptId))metadata(entry,core.resolveConceptModule(library,entry.canonicalConceptId));}
assert.equal(questionMap(library).size,before.size,'No canonical IDs deleted');
const after=questionMap(library);assert.deepEqual([...after.keys()].sort(),[...before.keys()].sort());
for(const id of ['ECON-MG-LEGENDARYBOSS-9138','P62B-ELAS-EL-022'])assert.deepEqual(after.get(id),before.get(id),'Accepted as written '+id);
const stamp='2026-09-26T12:00:00.000Z';
library.generatedAt=stamp;library.registry.generatedAt=stamp;
delete library.librarySha256;delete library.registry.librarySha256;library.librarySha256=sha(stable(library));library.registry.librarySha256=library.librarySha256;
Object.assign(manifest,{assets:library.assetInventory,assetCount:library.assetInventory.length,librarySha256:library.librarySha256,generatedAt:stamp});
contracts.assertCanonicalIntegrity(library,{registry:library.registry,manifest,readBytes:a=>graphBytes.get(a.runtimePath)||fs.readFileSync(path.join(composer,'data',a.runtimePath))});
// Keep outcome IDs/labels/presets; synchronize only exact skill membership and
// derived coverage affected by the approved record and tier changes.
const policy=core.FacultyOutcomes.policy, policyBase=read('baseline_outcomes.json');
for(const k of Object.keys(policy))delete policy[k];Object.assign(policy,clone(policyBase));
for(const [cid,record]of Object.entries(policy.concepts)){
 const module=core.resolveConceptModule(library,cid);if(!module)continue;
 const skills=core.ContentScope.describe(module).full, wanted=new Set(skills),seen=new Set();
 for(const outcome of record.outcomes){outcome.skillIds=outcome.skillIds.filter(s=>wanted.has(s)&&!seen.has(s)&&seen.add(s));}
 const missing=skills.filter(s=>!seen.has(s));
 if(missing.length){assert(touched.has(cid),'Unexpected new outcome skills '+cid);const target=record.outcomes.length===1?record.outcomes[0]:cid==='demand-and-supply-shocks'?record.outcomes.find(o=>o.id.endsWith('combined-policy')):cid==='aggregate-demand'?record.outcomes.find(o=>/shift/.test(o.id)):null;assert(target,'Explicit destination outcome required '+cid);target.skillIds.push(...missing);target.skillIds.sort();}
}
for(const [cid,record]of Object.entries(policy.concepts)){
 const module=library.concepts[cid];if(!module||(!touched.has(cid)&&!touched.has(module.derivedFromConceptId)))continue;
 for(const outcome of record.outcomes){const comp=core.compose(library,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[outcome.id]}}});const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,comp.banks[k].length]));outcome.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+comp.banks[k].length,0),repair:comp.repairQuestions.length,bridge:comp.bridgeQuestions.length,seed:Object.values(comp.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:comp.validation.modes.filter(m=>m.ok).map(m=>m.mode)};}
}
policy.librarySha256=library.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
const area=require(path.join(composer,'course-area-model.js')).create(library.registry.concepts);
const project=lib=>{const result={general:new Set(),micro:new Set(),macro:new Set()};for(const cid of Object.keys(lib.concepts)){const module=core.resolveConceptModule(lib,cid);for(const q of core.ContentScope.allQuestions(module))for(const a of area.areasFor(cid))result[a].add(String(q.id));}return result;};
const oldArea=project(baseline),newArea=project(library);
for(const r of routes.filter(r=>r.removeFromMicro)){assert(!newArea.micro.has(r.id));assert(newArea.macro.has(r.id));}
for(const id of oldArea.general)assert(newArea.general.has(id),'Preserve General membership '+id);
for(const id of oldArea.macro)assert(newArea.macro.has(id),'Preserve Macro membership '+id);
const changed=[...after].filter(([id,q])=>stable(q)!==stable(before.get(id))).map(([id,q])=>{const old=before.get(id),fields=[...new Set([...Object.keys(old),...Object.keys(q)])].filter(f=>stable(old[f]??null)!==stable(q[f]??null));return{id,fields,before:Object.fromEntries(fields.map(f=>[f,old[f]??null])),after:Object.fromEntries(fields.map(f=>[f,q[f]??null])),removedFields:fields.filter(f=>!(f in q))};});
const expectations={presetChanges:read('preset_changes.json'),baselineRef:'04f9ca7',baselineSourceSha256:read('baseline.json').auditSourceSha256,changedQuestionIds:changed.map(r=>r.id).sort(),changes:changed,moves,routing:routes,graphs:graphs.map(g=>({path:g.runtimePath,sha256:sha(graphBytes.get(g.runtimePath))})),afterLibrarySha256:library.librarySha256};
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'expected_changes.json'),JSON.stringify(expectations,null,2));
const outputs=new Map([['composer_library.js','window.MQ_COMPOSER_LIBRARY='+JSON.stringify(library)+';\n'],['composer_registry.json',JSON.stringify(library.registry,null,2)+'\n'],['composer_library_manifest.json',JSON.stringify(manifest,null,2)+'\n'],['faculty-outcomes.js',"// Generated by audit_tools/faculty_lo/build-policy.cjs from reviewed grouping proposals.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n']]);
fs.mkdirSync(path.join(dir,'staged'),{recursive:true});for(const[name,data]of outputs)fs.writeFileSync(path.join(dir,'staged',name),data);
if(process.argv.includes('--write')){for(const[name,data]of outputs)fs.writeFileSync(path.join(composer,'data',name),data);for(const[asset,bytes]of graphBytes)fs.writeFileSync(path.join(composer,'data',asset),bytes);}
const summary={written:process.argv.includes('--write'),changed:changed.length,moves:moves.length,graphs:graphs.length,countsBefore:Object.fromEntries(Object.entries(oldArea).map(([k,v])=>[k,v.size])),countsAfter:Object.fromEntries(Object.entries(newArea).map(([k,v])=>[k,v.size])),librarySha256:library.librarySha256};fs.writeFileSync(path.join(dir,'application_summary.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
