'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer'),evidence=path.join(root,'faculty_exports/audits/graph_assessment_live_playthrough_remediation_20261004_evidence');
const core=require(path.join(cdir,'composer-core.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=x=>crypto.createHash('sha256').update(x).digest('hex'),clone=structuredClone;
const stable=core.stableStringify, scope=read(path.join(__dirname,'scope.json')),draft=read(path.join(__dirname,'authored.json')),originals=read(path.join(__dirname,'originals.json'));
const source=fs.readFileSync(path.join(evidence,'composer_library.js'),'utf8');
const before=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1)),lib=clone(before);
const graphDir=path.join(evidence,'graph-drafts'),graphs=read(path.join(graphDir,'asset-changes.json')),descriptions=read(path.join(__dirname,'variant_descriptions.json'));
const beforeMap=new Map(contracts.questionRecords(before).map(r=>[String(r.question.id),r.question])),newMap=new Map(),changes=[];
const graphBytes=new Map(Object.keys(graphs).map(p=>[p,fs.readFileSync(path.join(graphDir,p))]));
const allowed=['q','options','feedback','difficulty','canonicalDifficulty','type','image','imageAlt','graphDescription','graphRequired'];
for(const id of scope.authorized_ids){
 const review=draft.questions[id];assert(review?.textReviewed,'Text review '+id);
 const old=beforeMap.get(id);assert.deepEqual(old,originals[id]);const q=clone(old);
 const oldKey=old.options.findIndex(o=>sha(core.normalizeAnswerText(o))===old.aHash);assert(oldKey>=0,'Original answer '+id);
 const key=review.patch.correct_index??oldKey;
 for(const [f,v]of Object.entries(review.patch)){if(f==='correct_index')continue;assert(allowed.includes(f),'Unexpected patch field '+f);q[f]=v;}
 if(q.image!==old.image){
  const desc=descriptions[path.basename(q.image)]||before.assetInventory.find(a=>a.runtimePath===q.image)?.graphDescription;
  assert(desc,'Replacement graph description '+id);q.imageAlt=desc;q.graphDescription=desc;
 }
 q.aHash=sha(core.normalizeAnswerText(q.options[key]));if(Number.isInteger(q.a))q.a=key;
 // Preserve the actual baseline checkpoint stage when cognitive difficulty is
 // recalibrated. Historical provenance is not a reliable routing instruction.
 if(q.canonicalDifficulty!==old.canonicalDifficulty){
  const pools=contracts.questionRecords(before).filter(r=>String(r.question.id)===id).map(r=>r.pool);
  if(pools.includes('boss'))q.checkpointPool={easy:'easyBoss',medium:'mediumBoss',hard:'finalBoss'}[old.canonicalDifficulty];
  if(pools.includes('legendaryBoss'))q.checkpointPool='legendaryBoss';
  if(Object.hasOwn(q,'checkpointPool'))assert(q.checkpointPool,'Baseline stage '+id);
 }
 assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4,id);
 assert.equal(q.options.filter(o=>sha(core.normalizeAnswerText(o))===q.aHash).length,1,id);
 for(const f of ['primarySkill','repairSkill','objective','primaryConceptId','secondaryConceptIds','subtopicIds','instructionalRole','originalBossTier','sourceHash','sourceOccurrences'])assert.deepEqual(q[f],old[f],'Preserved '+f+' '+id);
 newMap.set(id,q);
 const fields=[...new Set([...Object.keys(old),...Object.keys(q)])].filter(f=>stable(old[f]??null)!==stable(q[f]??null));
 if(fields.length)changes.push({id,fields,beforeRecord:old,afterRecord:q,correctIndex:key,answerHashChanged:old.aHash!==q.aHash,review});
}
for(const r of contracts.questionRecords(lib))if(newMap.has(String(r.question.id)))Object.assign(r.question,clone(newMap.get(String(r.question.id))));
// Move only ordinary difficulty pools. Boss/checkpoint pools retain their roles.
const moves=[];
for(const [cid,module]of Object.entries(lib.concepts)){
 const pending=[];
 for(const pool of ['easy','medium','hard','elite','legendary']){
  if(!module.questions?.[pool])continue;
  module.questions[pool]=module.questions[pool].filter(q=>{
   if(!newMap.has(String(q.id))||q.canonicalDifficulty===pool)return true;
   const target=q.canonicalDifficulty;assert(['easy','medium','hard','elite','legendary'].includes(target));
   pending.push({target,q});moves.push({conceptId:cid,id:String(q.id),from:pool,to:target});return false;
  });
 }
 for(const {target,q}of pending)(module.questions[target]||=[]).push(q);
}
// Existing common assets retain descriptions; their recorded curve values remain
// valid. New variants have explicit descriptions and a new inventory identity.
for(const [asset,bytes]of graphBytes){
 const current=lib.assetInventory.filter(a=>a.runtimePath===asset);
 if(!current.length){
  const conceptId=asset.split('/')[1],filename=path.basename(asset),desc=descriptions[filename];assert(desc);
  lib.assetInventory.push({conceptId,filename,sourceAssetPath:asset,sourceUrl:'data/'+asset,runtimePath:asset,sha256:sha(bytes),sizeBytes:bytes.length,imageAlt:desc,graphDescription:desc});
  for(const [cid,m]of Object.entries(lib.concepts)){
   if(cid!==conceptId && !Object.values(m.questions||{}).flat().some(q=>q.image===asset))continue;
   const row=clone(lib.assetInventory.at(-1));m.assetMetadata||=[];m.assetMetadata.push(row);
   m.assets||=[];if(!m.assets.includes(filename))m.assets.push(filename);
   m.assetPaths||={};m.assetPaths[filename]=asset;
  }
 }
 for(const a of [...lib.assetInventory,...Object.values(lib.concepts).flatMap(m=>m.assetMetadata||[])])if(a.runtimePath===asset){a.sha256=sha(bytes);a.sizeBytes=bytes.length;}
}
// Refresh only numerical derived coverage fields; curriculum/routing stay exact.
const changedConcepts=new Set(contracts.questionRecords(lib).filter(r=>changes.some(c=>c.id===String(r.question.id))).map(r=>r.conceptId));
for(const entry of lib.registry.concepts){
 const m=lib.concepts[entry.canonicalConceptId];if(!changedConcepts.has(entry.canonicalConceptId)&&!changedConcepts.has(m.derivedFromConceptId))continue;
 const module=core.resolveConceptModule(lib,entry.canonicalConceptId),p=module.questions||{},rows=contracts.questionRecords({concepts:{x:module}}),unique=[...new Map(rows.map(r=>[String(r.question.id),r.question])).values()];
 entry.questionCountByDifficulty={easy:0,medium:0,hard:0,elite:0,legendary:0,unknown:0};
 for(const q of unique){const tier=q.canonicalDifficulty||q.difficulty;entry.questionCountByDifficulty[tier in entry.questionCountByDifficulty?tier:'unknown']++;}
 entry.questionCountByRole={boss:(p.boss||[]).length,bridge:(module.bridgeQuestions||[]).length,calculation:(p.calculation||[]).length,elite:(p.elite||[]).length,integration:(p.integration||[]).length,legendary:(p.legendary||[]).length,legendaryBoss:(p.legendaryBoss||[]).length,main:['easy','medium','hard'].reduce((n,k)=>n+(p[k]||[]).length,0),repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length};
 entry.calculationCoverage=unique.filter(q=>/calculat/i.test(q.type||'')||q.instructionalRole==='calculation').length;
 if(entry.runtimeAdaptiveCounts){const counts=Object.fromEntries(['easy','medium','hard'].map(k=>[k,(p[k]||[]).length]));for(const q of [...p.calculation||[],...p.integration||[]]){const tier=q.canonicalDifficulty||q.difficulty;if(tier in counts)counts[tier]++;}entry.runtimeAdaptiveCounts=counts;}
}
const afterMap=new Map(contracts.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
assert.deepEqual([...afterMap.keys()].sort(),[...beforeMap.keys()].sort(),'No IDs added or retired');
for(const [id,q]of afterMap)if(!newMap.has(id))assert.deepEqual(q,beforeMap.get(id),'Unrelated record '+id);
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=read(path.join(evidence,'composer_library_manifest.json'));Object.assign(manifest,{librarySha256:lib.librarySha256,assets:lib.assetInventory,assetCount:lib.assetInventory.length});
const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(evidence,'faculty-outcomes.js'),'utf8'),context);const policy=JSON.parse(JSON.stringify(context.module.exports));
for(const [cid,record]of Object.entries(policy.concepts)){
 const m=lib.concepts[cid];if(!m||(!changedConcepts.has(cid)&&!changedConcepts.has(m.derivedFromConceptId)))continue;
 for(const outcome of record.outcomes){
  const c=core.compose(lib,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[outcome.id]}}});
  const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,c.banks[k].length]));
  outcome.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+c.banks[k].length,0),repair:c.repairQuestions.length,bridge:c.bridgeQuestions.length,seed:Object.values(c.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode)};
 }
}
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
contracts.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest,readBytes:a=>graphBytes.get(a.runtimePath)||fs.readFileSync(path.join(cdir,'data',a.runtimePath))});
const metadataChanges=[];
function diff(a,b,p=[]){
 if(stable(a??null)===stable(b??null))return;
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],[...p,k]);return;}
 metadataChanges.push({path:p,before:a,after:b});
}
// Entire pool arrays are accounted separately as exact ordered ID placements.
const strip=l=>{const x=clone(l);for(const m of Object.values(x.concepts)){delete m.questions;delete m.repairQuestions;delete m.repairSeedQuestions;delete m.bridgeQuestions;}return x;};
diff(strip(before),strip(lib));
const placements=l=>Object.fromEntries(Object.entries(l.concepts).map(([cid,m])=>[cid,m.questions?Object.fromEntries(Object.entries(m.questions).map(([p,qs])=>[p,qs.map(q=>String(q.id))])):null]));
const result={schemaVersion:1,baselineRef:read(path.join(evidence,'baseline.json')).head,authorizedIds:scope.authorized_ids,beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,changes,moves,metadataChanges,placementsBefore:placements(before),placementsAfter:placements(lib),assets:Object.entries(graphs).map(([p,g])=>({...g,path:p,sha256:sha(graphBytes.get(p)),sizeBytes:graphBytes.get(p).length,referencingIds:[...afterMap].filter(([i,q])=>q.image===p).map(([i])=>i).sort()}))};
const outputs={
 'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n',
 'composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n',
 'composer_library_manifest.json':JSON.stringify(manifest,null,2)+'\n',
 'faculty-outcomes.js':"// Generated by audit_tools/faculty_lo/build-policy.cjs from reviewed grouping proposals.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'
};
fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify(result,null,2)+'\n');
const staged=path.join(evidence,'staged');fs.mkdirSync(staged,{recursive:true});for(const [n,s]of Object.entries(outputs))fs.writeFileSync(path.join(staged,n),s);
if(process.argv.includes('--write')){
 const last=path.join(__dirname,'applied_hashes.json'),prior=fs.existsSync(last)?read(last):{};
 for(const [n,s]of Object.entries(outputs)){const actual=fs.readFileSync(path.join(cdir,'data',n));assert(actual.equals(fs.readFileSync(path.join(evidence,n)))||sha(actual)===prior[n]||actual.toString()===s,'Intervening work '+n);}
 for(const [n,s]of Object.entries(outputs))fs.writeFileSync(path.join(cdir,'data',n),s);
 for(const [p,b]of graphBytes)fs.writeFileSync(path.join(cdir,'data',p),b);
 fs.writeFileSync(last,JSON.stringify(Object.fromEntries(Object.entries(outputs).map(([n,s])=>[n,sha(s)])),null,2)+'\n');
}
console.log(JSON.stringify({written:process.argv.includes('--write'),changed:changes.length,moves:moves.length,assets:graphBytes.size,hash:lib.librarySha256},null,2));
