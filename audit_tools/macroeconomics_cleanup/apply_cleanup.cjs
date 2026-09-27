'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'tmp/macroeconomics_cleanup'),composer=path.join(root,'build/faculty-build-composer');
const core=require(path.join(composer,'composer-core.js')),contracts=require(path.join(composer,'tests/composer-integrity-contracts.js'));
const read=n=>JSON.parse(fs.readFileSync(path.join(__dirname,'inputs',n),'utf8')),clone=structuredClone,sha=x=>crypto.createHash('sha256').update(x).digest('hex'),stable=core.stableStringify;
const b=read('baseline.json'),patches=read('question_patches.json'),routes=read('routing_decisions.json'),allowed=new Set(b.targets);
const at=p=>execFileSync('git',['show',b.ref+':'+p],{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024});
const frozen=at('build/faculty-build-composer/data/composer_library.js');assert.equal(sha(frozen),b.sourceSHA256,'Immutable pre-Macro source');
const baseline=JSON.parse(frozen.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,'')),library=clone(baseline);
const manifest=JSON.parse(at('build/faculty-build-composer/data/composer_library_manifest.json'));
const questionMap=lib=>new Map(contracts.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const before=questionMap(baseline),touched=new Set(),moves=[];
for(const id of Object.keys(patches))assert(allowed.has(id),'Exact audit scope '+id);
// A route alias may contain its own JSON object. Apply the same final patch to
// every copy, not just the ordinary/support storage enumerator.
function walk(value){
 if(!value||typeof value!=='object')return;
 if(Array.isArray(value)){for(const v of value)walk(v);return;}
 const id=String(value.id||'');if(value.q&&Array.isArray(value.options)&&patches[id]){
  const p=patches[id];touched.add(value.primaryConceptId);
  for(const[k,v]of Object.entries(p))if(!k.startsWith('$'))value[k]=clone(v);
  for(const k of p.$unset||[])delete value[k];
  if(p.$correct){assert.equal(value.options.filter(o=>o===p.$correct).length,1,'One intended correct choice '+id);value.aHash=sha(core.normalizeAnswerText(p.$correct));}
  assert.equal(value.options.filter(o=>sha(core.normalizeAnswerText(o))===value.aHash).length,1,'One normalized answer '+id);
  assert.equal(new Set(value.options.map(core.normalizeAnswerText)).size,4,'Distinct options '+id);
  return;
 }
 for(const v of Object.values(value))walk(v);
}
walk(library.concepts);
for(const[cid,module]of Object.entries(library.concepts)){
 const pending=[];
 for(const pool of ['easy','medium','hard','elite','legendary']){
  if(!module.questions?.[pool])continue;
  module.questions[pool]=module.questions[pool].filter(q=>{
   // Supplement challenge eligibility uses the existing storage roles, not
   // ordinary difficulty bins. Keep the role while calibrating its task tier.
   if(module.supplementType==='checkpoint-challenge'&&q.isCheckpointChallenge)return true;
   const tier=patches[String(q.id)]?.difficulty;
   if(tier&&tier!==pool&&['easy','medium','hard','elite','legendary'].includes(tier)){
    pending.push({q,tier});moves.push({id:String(q.id),conceptId:cid,from:pool,to:tier});return false;
   }return true;
  });
 }
 for(const{q,tier}of pending)(module.questions[tier]||=[]).push(q);
}
for(const r of routes){
 const src=library.concepts[r.from],dest=library.concepts[r.to];assert(src&&dest,'Existing route concepts');
 let found;
 if(r.kind==='repair'){
  found=src.repairQuestions.find(q=>String(q.id)===r.id);assert(found);
  src.repairQuestions=src.repairQuestions.filter(q=>String(q.id)!==r.id);
  for(const k of ['microSkillRepairPools','skillRepairSeedPools','microSkillBridgePools'])for(const [skill,pool]of Object.entries(src[k]||{}))src[k][skill]=pool.filter(q=>String(typeof q==='string'?q:q.id)!==r.id);
  (dest.repairQuestions||=[]).push(found);(dest.microSkillRepairPools[r.routeKey]||=[]).push(r.id);
 }else{
  let n=0;
  for(const [pool,rows]of Object.entries(src.questions)){
   const selected=rows.filter(q=>String(q.id)===r.id);src.questions[pool]=rows.filter(q=>String(q.id)!==r.id);
   for(const q of selected){found=q;(dest.questions[pool]||=[]).push(q);n++;}
  }assert.equal(n,1,'One checkpoint move '+r.id);
 }
 dest.legacyObjectives=[...new Set([...(dest.legacyObjectives||[]),found.objective].filter(Boolean))];
 if(src.objectiveLabels?.[found.objective]){dest.objectiveLabels||={};dest.objectiveLabels[found.objective]=src.objectiveLabels[found.objective];}
 touched.add(r.from);touched.add(r.to);
}
require('./metadata.cjs')(library,core,contracts,touched);
const after=questionMap(library);assert.deepEqual([...after.keys()].sort(),[...before.keys()].sort(),'Exact retained canonical universe');
const changes=[];
for(const[id,q]of after){
 const old=before.get(id);if(stable(q)===stable(old))continue;
 assert(allowed.has(id),'Changed only authorized ID '+id);
 const fields=[...new Set([...Object.keys(old),...Object.keys(q)])].filter(k=>stable(old[k]??null)!==stable(q[k]??null));
 for(const k of fields)assert(!['source','provenance','sourceOccurrences','sourceHash','sourceType','questionType','sourceId','sourcePool','originalSourcePool','sourceGame','sourceCurationPhase'].includes(k),'Historical provenance preserved '+id+'.'+k);
 changes.push({id,fields,before:Object.fromEntries(fields.map(k=>[k,old[k]??null])),after:Object.fromEntries(fields.map(k=>[k,q[k]??null])),removedFields:fields.filter(k=>!(k in q))});
}
for(const id of b.protectedQuestionIDs)assert.deepEqual(after.get(id),before.get(id),'General/Micro exact record '+id);
// No audit input or graph byte is changed by this operation.
for(const[p,hash]of Object.entries(b.fileHashes))if(p.includes('/question-assets/')||p.includes('/audits/'))assert.equal(sha(fs.readFileSync(path.join(root,p))),hash,'Protected file '+p);
const stamp='2026-09-26T20:00:00.000Z';library.generatedAt=stamp;library.registry.generatedAt=stamp;
delete library.librarySha256;delete library.registry.librarySha256;library.librarySha256=sha(stable(library));library.registry.librarySha256=library.librarySha256;
Object.assign(manifest,{assets:library.assetInventory,assetCount:library.assetInventory.length,librarySha256:library.librarySha256,generatedAt:stamp});
contracts.assertCanonicalIntegrity(library,{registry:library.registry,manifest});
const policy=core.FacultyOutcomes.policy,context={module:{exports:{}}};require('node:vm').runInNewContext(at('build/faculty-build-composer/data/faculty-outcomes.js'),context);
for(const k of Object.keys(policy))delete policy[k];Object.assign(policy,JSON.parse(JSON.stringify(context.module.exports)));
const outcomeMoves=[];
for(const[cid,record]of Object.entries(policy.concepts)){
 const module=core.resolveConceptModule(library,cid);if(!module)continue;
 const skills=core.ContentScope.describe(module).full,wanted=new Set(skills),seen=new Set();
 for(const o of record.outcomes)o.skillIds=o.skillIds.filter(s=>wanted.has(s)&&!seen.has(s)&&seen.add(s));
 const missing=skills.filter(s=>!seen.has(s));
 if(missing.length){
  assert(touched.has(cid),'Only touched outcome membership');
  // Explicit specialist decisions below retain outcome IDs and labels.
  const key={
   'money-functions-and-measures':'aggregate',
   'central-bank-and-federal-reserve':'independen',
   'deposit-creation-and-money-multiplier':'multiplier',
   'monetary-control-limits':'limit',
   'budget-accounting-and-public-saving':'account'
  }[cid];
  const target=record.outcomes.length===1?record.outcomes[0]:record.outcomes.find(o=>new RegExp(key||'^NEVER$','i').test(o.id+' '+o.label));
  assert(target,'Explicit outcome assignment required '+cid+' '+missing.join(','));
  target.skillIds.push(...missing);target.skillIds.sort();outcomeMoves.push({conceptId:cid,outcomeId:target.id,skills:missing});
 }
}
for(const[cid,record]of Object.entries(policy.concepts)){
 const module=library.concepts[cid];if(!module||(!touched.has(cid)&&!touched.has(module.derivedFromConceptId)))continue;
 for(const o of record.outcomes){
  const comp=core.compose(library,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}});
  const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,comp.banks[k].length]));
  o.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+comp.banks[k].length,0),repair:comp.repairQuestions.length,bridge:comp.bridgeQuestions.length,seed:Object.values(comp.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:comp.validation.modes.filter(m=>m.ok).map(m=>m.mode)};
 }
}
policy.librarySha256=library.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
const area=require(path.join(composer,'course-area-model.js')).create(library.registry.concepts);
function projection(lib){const out={general:new Set(),micro:new Set(),macro:new Set()};for(const cid of Object.keys(lib.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(lib,cid)))for(const a of area.areasFor(cid))out[a].add(String(q.id));return out;}
const oldArea=projection(baseline),newArea=projection(library);
for(const a of Object.keys(newArea))assert.deepEqual([...newArea[a]].sort(),b.areaIDs[a],a+' exact membership retained');
const expectations={baselineRef:b.ref,baselineSourceSha256:b.sourceSHA256,changedQuestionIds:changes.map(c=>c.id).sort(),changes,moves,routing:routes,outcomeMoves,afterLibrarySha256:library.librarySha256};
fs.mkdirSync(path.join(dir,'staged'),{recursive:true});fs.writeFileSync(path.join(dir,'expected_changes.json'),JSON.stringify(expectations,null,2));
const outputs=new Map([['composer_library.js','window.MQ_COMPOSER_LIBRARY='+JSON.stringify(library)+';\n'],['composer_registry.json',JSON.stringify(library.registry,null,2)+'\n'],['composer_library_manifest.json',JSON.stringify(manifest,null,2)+'\n'],['faculty-outcomes.js',"// Generated by audit_tools/faculty_lo/build-policy.cjs from reviewed grouping proposals.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n']]);
for(const[n,data]of outputs)fs.writeFileSync(path.join(dir,'staged',n),data);
if(process.argv.includes('--write')){
 // Replaying this completed cleanup must not overwrite subsequent user work.
 // Check every destination before writing any: only the frozen starting bytes
 // or the exact approved result are valid replay states.
 for(const[n,data]of outputs){
  const relative='build/faculty-build-composer/data/'+n;
  const current=sha(fs.readFileSync(path.join(composer,'data',n)));
  assert(current===b.fileHashes[relative]||current===sha(data),'Refusing to overwrite a changed live file: '+relative);
 }
 for(const[n,data]of outputs)fs.writeFileSync(path.join(composer,'data',n),data);
}
const summary={written:process.argv.includes('--write'),changed:changes.length,moves:moves.length,countsBefore:Object.fromEntries(Object.entries(oldArea).map(([k,v])=>[k,v.size])),countsAfter:Object.fromEntries(Object.entries(newArea).map(([k,v])=>[k,v.size])),global:after.size,protectedRecords:b.protectedQuestionIDs.length,librarySha256:library.librarySha256};
fs.writeFileSync(path.join(dir,'application_summary.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
