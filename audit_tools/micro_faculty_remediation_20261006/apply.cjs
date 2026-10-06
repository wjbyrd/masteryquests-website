'use strict';
// Reproducible faculty patch application. All source snapshots and exact
// before/after records are retained; --write is an explicit installation step.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer'),data=path.join(cdir,'data');
const core=require(path.join(cdir,'composer-core.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=x=>crypto.createHash('sha256').update(x).digest('hex'),clone=structuredClone,stable=core.stableStringify;
const hashes=read(path.join(__dirname,'baseline_hashes.json')),patches=read(path.join(__dirname,'patches.json')),faculty=read(path.join(__dirname,'faculty_decisions.json'));
const fMap=new Map(faculty.map(r=>[r.id,r])),unreviewed=read(path.join(__dirname,'unreviewed_scope.json'));
const source=fs.readFileSync(path.join(__dirname,'baseline_composer_library.js'),'utf8');
assert.equal(sha(source),hashes['build/faculty-build-composer/data/composer_library.js']);
const before=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1)),lib=clone(before);
for(const name of ['composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']){
 const dest=path.join(__dirname,'baseline_'+name);
 if(!fs.existsSync(dest)){const bytes=fs.readFileSync(path.join(data,name));assert.equal(sha(bytes),hashes['build/faculty-build-composer/data/'+name]);fs.writeFileSync(dest,bytes);}
}
const bRows=contracts.questionRecords(before),beforeMap=new Map(bRows.map(r=>[String(r.question.id),r.question]));
const graphDir=path.join(__dirname,'graph-drafts'),graphDrafts=read(path.join(graphDir,'asset-changes.json'));
const changedCostPaths=new Set(Object.keys(graphDrafts).filter(a=>/perfect-competition\/(pc_(profit|loss|shutdown|supply|zero|efficiency|market_firm_2\.))|cop_productivity_shift/.test(a)));
const descriptions={};
for(const [asset,g]of Object.entries(graphDrafts)){
 const original=before.assetInventory.find(a=>a.runtimePath===asset);
 descriptions[asset]=!changedCostPaths.has(asset)&&original?.graphDescription ? original.graphDescription : 'Horizontal axis: quantity. Vertical axis: dollars per unit. Curves are labeled directly. '+g.model.split('; operating profit')[0];
}
Object.assign(descriptions,{
 'question-assets/perfect-competition/PC-06-market-only.webp':'Market demand slopes down and supply slopes up. They intersect at price $40 and quantity75 thousand units. Only the market panel is shown.',
 'question-assets/perfect-competition/PC-08-market-only.webp':'Market demand slopes down and supply slopes up. They intersect at price $25 and quantity100 thousand units. Only the market panel is shown.',
 'question-assets/perfect-competition/PC-07-firm-only.webp':'A representative firm faces horizontal D=AR=MR at $15. Rising MC crosses that line at Q50. At Q50, ATC is $18 and AVC is $10. Only the firm panel is shown.',
 'question-assets/perfect-competition/PC-07-price-transfer.webp':'Market supply and demand intersect at quantity75 thousand and price $15. The representative firm panel shows MC, ATC and AVC without a revenue line. At firm Q50, MC is $15, ATC$18 and AVC$10.',
});
const allowed=['q','options','feedback','difficulty','canonicalDifficulty','type','image','imageAlt','graphDescription','graphRequired','primaryConceptId','isCheckpointChallenge','challengeStage','requiredConceptIds','challengeFocusConceptIds','remediationConceptId','challengePathway','challengeSource','challengeBossStage'];
const newMap=new Map(),changes=[];
for(const [id,old]of beforeMap){
 const p=patches[id],q=clone(old);let rationale=p?.rationale||[],scope=p?(fMap.get(id)?.state==='FACULTY FLAG'?'faculty-flag':'unreviewed-consistency'):'graph-accessibility';
 const oldKey=old.options.findIndex(o=>sha(core.normalizeAnswerText(o))===old.aHash);
 assert(oldKey>=0,'Original normalized answer '+id);const key=p?.correct_index??oldKey;
 if(p){
  assert(fMap.get(id)?.state==='FACULTY FLAG'||unreviewed[id],'Authorized editorial ID '+id);
  for(const [f,v]of Object.entries(p)){if(['correct_index','rationale','remove_fields','move_to_concept'].includes(f))continue;assert(allowed.includes(f),'Allowed patch field '+f);q[f]=clone(v);}
  for(const f of p.remove_fields||[]){assert(['image','imageAlt','graphDescription','graphRequired','graphAccessible','graphAccessibility'].includes(f));delete q[f];}
 }
 if(q.image&&graphDrafts[q.image]&&(q.image!==old.image||changedCostPaths.has(q.image))){
  q.imageAlt=descriptions[q.image];q.graphDescription=descriptions[q.image];q.graphRequired=true;
  rationale=[...rationale,'Synchronize graph description with the rebuilt plotted data; graph-accessibility exception only.'];
 }
 if(q.canonicalDifficulty!==old.canonicalDifficulty){
  const pools=bRows.filter(r=>String(r.question.id)===id).map(r=>r.pool);
  if(pools.includes('boss'))q.checkpointPool={easy:'easyBoss',medium:'mediumBoss',hard:'finalBoss'}[old.canonicalDifficulty];
  if(pools.includes('legendaryBoss'))q.checkpointPool='legendaryBoss';
  if(Object.hasOwn(q,'checkpointPool'))assert(q.checkpointPool,'Preserved checkpoint stage '+id);
 }
 q.aHash=sha(core.normalizeAnswerText(q.options[key]));if(Number.isInteger(q.a))q.a=key;
 assert.equal(q.options.length,4,id);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4,'Distinct choices '+id);
 assert.equal(q.options.filter(o=>sha(core.normalizeAnswerText(o))===q.aHash).length,1,'Unique answer '+id);
 const fields=[...new Set([...Object.keys(old),...Object.keys(q)])].filter(f=>stable(old[f]??null)!==stable(q[f]??null));
 if(fields.length){
  if(fMap.get(id)?.state==='FACULTY PASS')assert(fields.every(f=>['imageAlt','graphDescription','graphRequired'].includes(f)),'PASS freeze '+id);
  for(const f of ['primarySkill','repairSkill','objective','secondaryConceptIds','subtopicIds','instructionalRole','sourcePool','originalSourcePool','originalBossTier','sourceHash','sourceOccurrences'])assert.deepEqual(q[f],old[f],'Protected metadata '+id+'.'+f);
  changes.push({id,scope,fields,beforeRecord:old,afterRecord:q,correctIndex:key,answerHashChanged:old.aHash!==q.aHash,rationale});newMap.set(id,q);
 }
}
for(const r of contracts.questionRecords(lib))if(newMap.has(String(r.question.id))){const replacement=clone(newMap.get(String(r.question.id)));for(const k of Object.keys(r.question))delete r.question[k];Object.assign(r.question,replacement);}
const moves=[];
for(const [cid,m]of Object.entries(lib.concepts)){
 const pending=[];
 for(const pool of ['easy','medium','hard','elite','legendary'])if(m.questions?.[pool])m.questions[pool]=m.questions[pool].filter(q=>{
  if(!newMap.has(String(q.id))||q.canonicalDifficulty===pool)return true;
  assert(['easy','medium','hard','elite','legendary'].includes(q.canonicalDifficulty));pending.push(q);moves.push({conceptId:cid,id:String(q.id),from:pool,to:q.canonicalDifficulty});return false;
 });
 for(const q of pending)(m.questions[q.canonicalDifficulty]||=[]).push(q);
}
for(const [id,p]of Object.entries(patches).filter(([,p])=>p.move_to_concept)){
 const rows=contracts.questionRecords(lib).filter(r=>String(r.question.id)===id);assert.equal(rows.length,1);const r=rows[0];assert.equal(r.pool,'legendaryBoss');
 lib.concepts[r.conceptId].questions[r.pool]=lib.concepts[r.conceptId].questions[r.pool].filter(q=>String(q.id)!==id);
 lib.concepts[p.move_to_concept].questions[r.pool].push(r.question);
 const destination=lib.concepts[p.move_to_concept];destination.legacyObjectives||=[];
 if(!destination.legacyObjectives.includes(r.question.objective))destination.legacyObjectives.push(r.question.objective);
 destination.objectiveLabels||={};destination.objectiveLabels[r.question.objective]=before.concepts[r.conceptId].objectiveLabels[r.question.objective];
 moves.push({id,fromConcept:r.conceptId,toConcept:p.move_to_concept,from:r.pool,to:r.pool,reason:'Explicit faculty Macro placement'});
}
const afterMap=new Map(contracts.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const used=new Set([...afterMap.values()].map(q=>q.image).filter(Boolean));
const graphs=Object.fromEntries(Object.entries(graphDrafts).filter(([a])=>used.has(a))),graphBytes=new Map(Object.keys(graphs).map(a=>[a,fs.readFileSync(path.join(graphDir,a))]));
for(const [asset,bytes]of graphBytes){
 if(!lib.assetInventory.some(a=>a.runtimePath===asset)){
  const conceptId=asset.split('/')[1],filename=path.basename(asset),desc=descriptions[asset];assert(desc);
  const row={conceptId,filename,sourceAssetPath:asset,sourceUrl:'data/'+asset,runtimePath:asset,sha256:sha(bytes),sizeBytes:bytes.length,imageAlt:desc,graphDescription:desc};lib.assetInventory.push(row);
  for(const [cid,m]of Object.entries(lib.concepts))if(cid===conceptId||Object.values(m.questions||{}).flat().some(q=>q.image===asset)){
   m.assetMetadata||=[];m.assetMetadata.push(clone(row));m.assets||=[];m.assets.push(filename);m.assetPaths||={};
   if(Array.isArray(m.assetPaths))m.assetPaths.push(asset);else m.assetPaths[filename]=asset;
  }
 }
 for(const a of [...lib.assetInventory,...Object.values(lib.concepts).flatMap(m=>m.assetMetadata||[])])if(a.runtimePath===asset){a.sha256=sha(bytes);a.sizeBytes=bytes.length;if(changedCostPaths.has(asset)){a.imageAlt=descriptions[asset];a.graphDescription=descriptions[asset];}}
}
const changedConcepts=new Set([...bRows,...contracts.questionRecords(lib)].filter(r=>newMap.has(String(r.question.id))).map(r=>r.conceptId));
for(const e of lib.registry.concepts){
 const m=lib.concepts[e.canonicalConceptId];if(!changedConcepts.has(e.canonicalConceptId)&&!changedConcepts.has(m.derivedFromConceptId))continue;
 const mod=core.resolveConceptModule(lib,e.canonicalConceptId),p=mod.questions||{},rows=contracts.questionRecords({concepts:{x:mod}}),unique=[...new Map(rows.map(r=>[String(r.question.id),r.question])).values()];
 e.questionCountByDifficulty={easy:0,medium:0,hard:0,elite:0,legendary:0,unknown:0};for(const q of unique){const t=q.canonicalDifficulty||q.difficulty;e.questionCountByDifficulty[t in e.questionCountByDifficulty?t:'unknown']++;}
 e.questionCountByRole={boss:(p.boss||[]).length,bridge:(mod.bridgeQuestions||[]).length,calculation:(p.calculation||[]).length,elite:(p.elite||[]).length,integration:(p.integration||[]).length,legendary:(p.legendary||[]).length,legendaryBoss:(p.legendaryBoss||[]).length,main:['easy','medium','hard'].reduce((n,k)=>n+(p[k]||[]).length,0),repair:(mod.repairQuestions||[]).length,repairSeed:(mod.repairSeedQuestions||[]).length};
 e.calculationCoverage=unique.filter(q=>/calculat/i.test(q.type||'')||q.instructionalRole==='calculation').length;
 if(e.runtimeAdaptiveCounts){const counts=Object.fromEntries(['easy','medium','hard'].map(k=>[k,(p[k]||[]).length]));for(const q of [...p.calculation||[],...p.integration||[]]){const t=q.canonicalDifficulty||q.difficulty;if(t in counts)counts[t]++;}e.runtimeAdaptiveCounts=counts;}
}
assert.deepEqual([...afterMap.keys()].sort(),[...beforeMap.keys()].sort(),'No IDs lost or added');
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(stable(lib));lib.registry.librarySha256=lib.librarySha256;
const manifest=read(path.join(__dirname,'baseline_composer_library_manifest.json'));Object.assign(manifest,{librarySha256:lib.librarySha256,assets:lib.assetInventory,assetCount:lib.assetInventory.length});
const ctx={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'baseline_faculty-outcomes.js'),'utf8'),ctx);const policy=JSON.parse(JSON.stringify(ctx.module.exports));
for(const [id,p]of Object.entries(patches).filter(([,p])=>p.move_to_concept)){
 const q=afterMap.get(id),outcome=policy.concepts[p.move_to_concept].outcomes[0];
 outcome.skillIds=[...new Set([...outcome.skillIds,q.primarySkill,q.repairSkill,...q.secondarySkills||[]])].sort();
}
for(const cid of ['integrated-economic-analysis','integrated-macroeconomic-analysis'])policy.concepts[cid].outcomes[0].skillIds=core.describeContentScope(lib,cid).full;
for(const [cid,record]of Object.entries(policy.concepts)){
 const m=lib.concepts[cid];if(!m||(!changedConcepts.has(cid)&&!changedConcepts.has(m.derivedFromConceptId)))continue;
 for(const o of record.outcomes){const c=core.compose(lib,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}});const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,c.banks[k].length]));o.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+c.banks[k].length,0),repair:c.repairQuestions.length,bridge:c.bridgeQuestions.length,seed:Object.values(c.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode)};}
}
policy.librarySha256=lib.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
contracts.assertCanonicalIntegrity(lib,{registry:lib.registry,manifest,readBytes:a=>graphBytes.get(a.runtimePath)||fs.readFileSync(path.join(data,a.runtimePath))});
const metadataChanges=[];function diff(a,b,p=[]){if(stable(a??null)===stable(b??null))return;if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],[...p,k]);return;}metadataChanges.push({path:p,before:a,after:b});}
const strip=l=>{const x=clone(l);for(const m of Object.values(x.concepts))for(const f of ['questions','repairQuestions','repairSeedQuestions','bridgeQuestions'])delete m[f];return x;};diff(strip(before),strip(lib));
const placements=l=>Object.fromEntries(Object.entries(l.concepts).map(([cid,m])=>[cid,m.questions?Object.fromEntries(Object.entries(m.questions).map(([p,qs])=>[p,qs.map(q=>String(q.id))])):null]));
const result={schemaVersion:1,workbookSha256:'dd577e9e958894ec8b8570d0a64a33ab66ef48eb4874adf213fcb3ab112164f7',authorizedIds:[...new Set([...Object.keys(patches),...changes.map(c=>c.id)])].sort(),beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,changes,moves,metadataChanges,placementsBefore:placements(before),placementsAfter:placements(lib),assets:Object.entries(graphs).map(([p,g])=>({...g,path:p,description:descriptions[p],sha256:sha(graphBytes.get(p)),sizeBytes:graphBytes.get(p).length,referencingIds:[...afterMap].filter(([,q])=>q.image===p).map(([id])=>id).sort()}))};
const outputs={'composer_library.js':'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n','composer_registry.json':JSON.stringify(lib.registry,null,2)+'\n','composer_library_manifest.json':JSON.stringify(manifest,null,2)+'\n','faculty-outcomes.js':"// Generated from reviewed faculty outcome grouping.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n'};
fs.writeFileSync(path.join(__dirname,'expectations.json'),JSON.stringify(result,null,2)+'\n');
const staged=path.join(__dirname,'staged');fs.mkdirSync(staged,{recursive:true});for(const [n,s]of Object.entries(outputs))fs.writeFileSync(path.join(staged,n),s);
if(process.argv.includes('--write')){
 const last=path.join(__dirname,'applied_hashes.json'),prior=fs.existsSync(last)?read(last):{};
 for(const [n,s]of Object.entries(outputs)){const actual=fs.readFileSync(path.join(data,n));assert(sha(actual)===hashes['build/faculty-build-composer/data/'+n]||sha(actual)===prior[n]||actual.toString()===s,'Intervening work '+n);}
 for(const [p,b]of graphBytes){const dest=path.join(data,p),base=path.join(__dirname,'original-assets',p);if(fs.existsSync(dest)&&!fs.existsSync(base)){fs.mkdirSync(path.dirname(base),{recursive:true});fs.copyFileSync(dest,base);}fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);}
 for(const [n,s]of Object.entries(outputs))fs.writeFileSync(path.join(data,n),s);
 fs.writeFileSync(last,JSON.stringify(Object.fromEntries(Object.entries(outputs).map(([n,s])=>[n,sha(s)])),null,2)+'\n');
}
console.log(JSON.stringify({written:process.argv.includes('--write'),changed:changes.length,moves:moves.length,assets:graphBytes.size,hash:lib.librarySha256},null,2));
