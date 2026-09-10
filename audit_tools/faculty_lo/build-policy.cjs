'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const repo=process.env.MQ_LO_REPO_ROOT || path.resolve(__dirname,'../..');
const composer=path.join(repo,'build/faculty-build-composer');
const core=require(path.join(composer,'composer-core.js'));
const library=require(path.join(composer,'tests/composer-test-helpers.js')).loadComposerLibrary();
const proposals=require('./outcome-groups.cjs');
const approvedMerges=require('./approved-merges.json');
const reviews=JSON.parse(fs.readFileSync(path.join(composer,'data/concept-reviews/manifest.json')));
const policy={schemaVersion:1,policyVersion:'faculty-lo-1',librarySha256:library.librarySha256,concepts:{}};
const audit={librarySha256:library.librarySha256,concepts:[],merges:[]};
const unique=values=>[...new Set(values)].sort();
function coverage(id,skills,full=false){
 const recipe={title:'Outcome coverage',slug:'outcome-coverage',selectedConceptIds:[id],supportedModes:[...core.MODE_ORDER],contentScopes:{[id]:full?{depth:'full'}:{depth:'full',skillIds:skills}}};
 const c=core.compose(library,recipe);
 const qs=[...Object.values(c.banks).flat(),...c.repairQuestions,...c.bridgeQuestions,...Object.values(c.microSkillRepairPools).flat(),...Object.values(c.skillRepairSeedPools).flat(),...Object.values(c.microSkillBridgePools).flat()];
 return {ordinary:unique(['easy','medium','hard','elite','legendary'].flatMap(p=>c.banks[p].map(core.idOf))).length,checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,p)=>n+c.banks[p].length,0),repair:c.counts.repair,bridge:c.counts.bridge,seed:c.counts.repairSeed,difficulty:Object.fromEntries(['easy','medium','hard','elite','legendary'].map(p=>[p,c.banks[p].length])),supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode),questionIds:unique(qs.map(core.idOf)),modeDeficiencies:c.validation.modes.filter(m=>!m.ok).map(m=>({mode:m.mode,deficiencies:m.deficiencies}))};
}
for(const record of library.registry.concepts){
 const id=record.canonicalConceptId,module=core.resolveConceptModule(library,id),description=core.describeContentScope(library,id),questions=core.ContentScope.allQuestions(module);
 let groups=(proposals[id] || [['coverage',record.description || `Explain and apply ${record.title}`,'.*']]).map(([suffix,label,pattern])=>({id:`${id}-${suffix}`,conceptId:id,label,pattern,skillIds:[]}));
 for(const skill of description.full){const group=groups.find(g=>new RegExp(g.pattern).test(skill));assert(group,`${id}: unmapped skill ${skill}`);group.skillIds.push(skill);}
 groups=groups.filter(g=>g.skillIds.length);
 const hidden=record.status==='legacy'||module.supplementType==='checkpoint-challenge';
 // An outcome is independently viable when at least one EXISTING mode passes,
 // not when it meets a newly invented question-count threshold. Co-assessed
 // skills identify adjacent areas that can be combined when a split is thin.
 while(groups.length>1 && !hidden){
  const thin=groups.find(g=>!coverage(id,g.skillIds).supportedModes.length);
  if(!thin)break;
  const neighbors=groups.filter(g=>g!==thin).map(g=>({g,links:questions.filter(q=>{const s=core.ContentScope.skills(q);return s.some(x=>thin.skillIds.includes(x))&&s.some(x=>g.skillIds.includes(x));}).length}));
  neighbors.sort((a,b)=>b.links-a.links || groups.indexOf(a.g)-groups.indexOf(b.g));
  const target=groups.find(g=>g.id===approvedMerges[thin.id]);
  assert(target,`${thin.id}: a new thin split requires curricular review and an explicit approved merge`);
  audit.merges.push({conceptId:id,merged:thin.id,into:target.id,reason:'No current mode independently ready; reviewed merge of adjacent curricular areas',coassessedQuestions:neighbors.find(n=>n.g===target).links});
  target.skillIds=unique([...target.skillIds,...thin.skillIds]);
  target.label=target.label+'; '+thin.label[0].toLowerCase()+thin.label.slice(1);
  groups=groups.filter(g=>g!==thin);
 }
 if(groups.length===1) groups[0].label=proposals[id]?.length>1 ? record.description : groups[0].label;
 const presets={brief:[],standard:[],full:groups.map(g=>g.id)};
 for(const g of groups){
  if(g.skillIds.some(s=>description.brief.includes(s)))presets.brief.push(g.id);
  if(g.skillIds.some(s=>description.standard.includes(s)))presets.standard.push(g.id);
 }
 if(!presets.brief.length)presets.brief=[groups[0].id];
 if(!presets.standard.length)presets.standard=[...presets.brief];
 for(const name of Object.keys(presets))presets[name].sort();
 const unmappedQuestionIds=unique(questions.filter(q=>!core.ContentScope.skills(q).length).map(core.idOf));
 const fullCoverage=coverage(id,description.full,true);
 const warnings=[];
 if(groups.length===1)warnings.push('This bank is kept as one coherent outcome; finer independent choices are not supported by its current content and mode readiness.');
 if(!fullCoverage.supportedModes.length&&!hidden)warnings.push('Supporting coverage: combine this concept with related concepts and check the selected game modes.');
 if(unmappedQuestionIds.length)warnings.push('Some legacy questions have no recorded skills. They are retained only when all outcomes are selected; partial selections omit them.');
 if(hidden)warnings.push('Compatibility or supplemental concept; not an independent faculty outcome selector.');
 const outcomes=groups.map(g=>{const c=coverage(id,g.skillIds,groups.length===1);return {id:g.id,conceptId:id,label:proposals.labels?.[g.id] || g.label,skillIds:g.skillIds.sort(),presets:Object.keys(presets).filter(p=>presets[p].includes(g.id)),coverage:{ordinary:c.ordinary,checkpoints:c.checkpoints,repair:c.repair,bridge:c.bridge,seed:c.seed,difficulty:c.difficulty,supportedModes:c.supportedModes}};});
 outcomes.sort((a,b)=>(a.presets.includes('brief')?0:a.presets.includes('standard')?1:2)-(b.presets.includes('brief')?0:b.presets.includes('standard')?1:2));
 policy.concepts[id]={outcomes,presets,warnings,unmappedQuestionIds,hidden};
 audit.concepts.push({conceptId:id,sourceObjectives:record.sourceObjectives||module.objectiveLabels||{},sourceReviewCodes:(reviews.concepts||[]).find(c=>c.canonicalConceptId===id)?.reviewCodes||[],outcomes:outcomes.map(g=>({...g,evidence:coverage(id,g.skillIds,groups.length===1)})),presets:Object.fromEntries(Object.entries(presets).map(([p,ids])=>[p,{outcomeIds:ids,...coverage(id,unique(groups.filter(g=>ids.includes(g.id)).flatMap(g=>g.skillIds)),ids.length===groups.length)}])),unmappedQuestionIds,warnings,hidden});
}
policy.policySha256=require('crypto').createHash('sha256').update(JSON.stringify(policy)).digest('hex');
const text=`// Generated by audit_tools/faculty_lo/build-policy.cjs from reviewed grouping proposals.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,${JSON.stringify(policy,null,2)});\n`;
const destination=process.env.MQ_LO_OUTPUT_DIR || path.join(composer,'data');fs.mkdirSync(destination,{recursive:true});
if(process.argv.includes('--check')) assert.equal(fs.readFileSync(path.join(destination,'faculty-outcomes.js'),'utf8'),text,'Outcome policy is stale; review source changes and regenerate');
else fs.writeFileSync(path.join(destination,'faculty-outcomes.js'),text);
if(process.env.MQ_LO_OUTPUT_DIR)fs.writeFileSync(path.join(destination,'faculty-outcome-audit.json'),JSON.stringify(audit,null,2));
console.log(JSON.stringify({concepts:audit.concepts.length,outcomes:Object.values(policy.concepts).reduce((n,c)=>n+c.outcomes.length,0),merged:audit.merges.length,independent:policy.concepts.demand.outcomes.map(g=>({label:g.label,coverage:g.coverage})),single:audit.concepts.filter(c=>c.outcomes.length===1).length},null,2));
