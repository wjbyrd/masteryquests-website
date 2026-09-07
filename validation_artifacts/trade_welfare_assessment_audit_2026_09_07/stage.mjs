import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),repo='C:/Users/Jennings/Documents/GitHub/masteryquests-website',work=path.resolve('.trade-work');
const read=n=>JSON.parse(fs.readFileSync(path.join(work,n),'utf8'));
const write=(n,x)=>fs.writeFileSync(path.join(work,n),JSON.stringify(x,null,2)+'\n');
const base=read('library-baseline.json'),spec=read('revisions.json'),selected=read('concepts.json');
const sources=read('sources.json');
const core=require(path.join(repo,'build/faculty-build-composer/composer-core.js'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const norm=x=>String(x).normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const assert=(x,m)=>{if(!x)throw Error(m)};
const locations=m=>[...Object.entries(m.questions||{}).flatMap(([p,qs])=>qs.map(q=>[p,q])),...['repairQuestions','repairSeedQuestions','bridgeQuestions'].flatMap(p=>(m[p]||[]).map(q=>[p,q]))];
const unique=m=>new Map(locations(m).map(([p,q])=>[String(q.id),q]));
const lib=structuredClone(base),changes=[],pathIds=new Set(),contentIds=new Set(),assetChanges=[];
const recordChanges=new Map();
for(const c of sources){
 const m=lib.concepts[c];
 for(const [p,q] of locations(m)){
  const id=String(q.id),s=spec[id],old=structuredClone(q);
  if(s){
   const answerIndex=q.options.findIndex(o=>sha(norm(o))===q.aHash);assert(answerIndex>=0,'Baseline answer '+id);
   const options=s.options.slice(1);options.splice(answerIndex,0,s.options[0]);
   Object.assign(q,{q:s.q,options,feedback:s.feedback,aHash:sha(norm(s.options[0]))});contentIds.add(id);
  }
  const a=(m.assetMetadata||[]).find(a=>a.sourceAssetPath===q.image);
  if(a && q.image!==a.runtimePath){q.image=a.runtimePath;pathIds.add(id);}
  if(!same(old,q)&&!recordChanges.has(id)){
   const keys=Object.keys(q).filter(k=>!same(q[k],old[k]));
   const change={id,concept:c,pool:p,difficulty:q.canonicalDifficulty||'unknown',objective:q.objective,type:q.type,primarySkill:q.primarySkill,contentRevised:!!s,pathRevised:old.image!==q.image,reason:s?.reason||'Correct legacy path to the existing approved runtime graph asset.',numericProofs:s?.proof||[],before:Object.fromEntries(keys.map(k=>[k,old[k]])),after:Object.fromEntries(keys.map(k=>[k,q[k]]))};
   changes.push(change);recordChanges.set(id,change);
  }
 }
}
assert(contentIds.size===Object.keys(spec).length,'All revisions applied');
// Correct observable graph evidence without changing graph bytes or eligibility.
const descriptions=read('asset-evidence.json');
for(const c of sources)for(const a of lib.concepts[c].assetMetadata||[]){
 const description=descriptions[a.runtimePath]||descriptions[a.filename];if(!description)continue;
 const old=structuredClone(a);a.graphDescription=description;
 a.imageAlt='Domestic supply and demand trade graph: '+a.filename.replace(/\.webp$/,'').replace(/_/g,' ')+', with labeled price and quantity guides.';
 if(!same(old,a)){
  assetChanges.push({concept:c,runtimePath:a.runtimePath,reason:'Replace incomplete OCR number lists or computed answers with verified curve coordinates and units.',before:old,after:structuredClone(a)});
  const inventory=lib.assetInventory.filter(x=>x.runtimePath===a.runtimePath);assert(inventory.length>=1,'Asset inventory identity '+a.runtimePath);for(const item of inventory)Object.assign(item,a);
 }
}
// Exact preservation of module and record architecture, including every alias and ordered pool.
const permitted=['q','options','aHash','feedback','image'];
let total=0;const revisedStems=new Map();
for(const [c,m] of Object.entries(lib.concepts)){
 if(!sources.includes(c)){assert(same(m,base.concepts[c]),'Unrelated/derived definition changed '+c);continue;}
 const old=base.concepts[c],strip=m=>Object.fromEntries(Object.entries(m).filter(([k])=>!['questions','repairQuestions','repairSeedQuestions','bridgeQuestions','assetMetadata'].includes(k)));
 assert(same(strip(m),strip(old)),'Module routing changed '+c);
 assert(same(locations(m).map(([p,q])=>[p,q.id]),locations(old).map(([p,q])=>[p,q.id])),'Pool IDs/order changed '+c);
 const oldQ=unique(old),now=unique(m);
 for(const [id,q] of now){
  total++;const b=oldQ.get(id);
  const omit=q=>Object.fromEntries(Object.entries(q).filter(([k])=>!permitted.includes(k)));
  assert(same(omit(q),omit(b)),'Metadata changed '+id);
  if(!recordChanges.has(id))assert(same(q,b),'Unlisted mutation '+id);
  assert(q.options.length===4&&new Set(q.options.map(norm)).size===4,'Four distinct options '+id);
  assert(q.options.filter(o=>sha(norm(o))===q.aHash).length===1,'One answer hash '+id);
  assert(q.q.trim()&&q.feedback.trim(),'Empty content '+id);
  if(contentIds.has(id)){assert(!revisedStems.has(norm(q.q)),'Duplicate revised stem '+id);revisedStems.set(norm(q.q),id);}
 }
 for(const [p,q] of locations(m))assert(same(q,now.get(String(q.id))),'Alias differs '+q.id);
}
assert(total===1530,'Scope count');
for(const m of Object.values(lib.concepts))for(const [id,q] of unique(m)){const other=revisedStems.get(norm(q.q));if(other)assert(other===id,'Revised stem duplicates another record '+id);}
const nohash=structuredClone(base);delete nohash.librarySha256;delete nohash.registry.librarySha256;
assert(sha(JSON.stringify(stable(nohash)))===base.librarySha256,'Baseline hash convention');
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(JSON.stringify(stable(lib)));lib.registry.librarySha256=lib.librarySha256;
const out=path.join(work,'staged');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'composer_library.js'),'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n');
for(const name of ['composer_registry.json','composer_library_manifest.json']){
 const obj=JSON.parse(fs.readFileSync(path.join(repo,'build/faculty-build-composer/data',name),'utf8'));assert(obj.librarySha256===base.librarySha256,'Sidecar baseline');obj.librarySha256=lib.librarySha256;for(const a of obj.assets||[]){const change=assetChanges.find(c=>c.runtimePath===a.runtimePath);if(change){a.imageAlt=change.after.imageAlt;a.graphDescription=change.after.graphDescription;}}fs.writeFileSync(path.join(out,name),JSON.stringify(obj,null,2)+'\n');
}
const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Trade Welfare audit validation',slug:'trade-welfare-audit-validation',guideName:'Guide',selectedConceptIds:selected,supportedModes:[...core.MODE_ORDER],checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
const comp=core.compose(lib,recipe),before=core.compose(base,recipe);
assert(comp.errors.length===0,'Compose errors '+JSON.stringify(comp.errors));assert(comp.validation.modes.every(m=>m.ok),'Mode readiness');
const architecture=x=>{
 const y=structuredClone(x);delete y.librarySha256;
 const walk=o=>{if(!o||typeof o!=='object')return;if(o.q&&o.options){for(const k of permitted)delete o[k];}for(const k of ['imageAlt','graphDescription'])delete o[k];if(o.filename&&o.runtimePath){/* paths themselves stay unchanged */}for(const v of Object.values(o))walk(v)};walk(y);return y;
};
assert(same(comp.counts,before.counts),'Composed counts');
for(const k of ['microSkillRepairPools','skillRepairSeedPools','microSkillBridgePools','trialGraphQuestionIds','fadingFortuneQuestionIds','riskRewardQuestionIds','bossCoverage'])assert(same(architecture(comp[k]),architecture(before[k])),'Composition routing '+k);
// All question-bearing composed collections must have identical non-content records and order.
for(const k of ['banks','challengeQuestionBanks','repairQuestions','bridgeQuestions']){assert(comp[k]!==undefined,'Missing composed collection '+k);assert(same(architecture(comp[k]),architecture(before[k])),'Composed collection '+k);}
const oldViews=Object.fromEntries(selected.map(c=>[c,core.resolveConceptModule(base,c)]));
const views=Object.fromEntries(selected.map(c=>[c,core.resolveConceptModule(lib,c)]));
assert(same(oldViews,read('resolved-baseline.json')),'Resolved baseline changed');
for(const c of selected)assert(same(locations(oldViews[c]).map(([p,q])=>[p,q.id]),locations(views[c]).map(([p,q])=>[p,q.id])),'Derived view eligibility '+c);
const answers=await core.verifyAnswers(comp);assert(answers.ok,'Core answers');
for(const a of comp.assets){const p=path.join(repo,'build/faculty-build-composer/data',a.runtimePath);assert(fs.existsSync(p),'Missing asset '+p);assert(sha(fs.readFileSync(p))===a.sha256,'Asset bytes '+p);}
const reviewManifest=JSON.parse(fs.readFileSync(path.join(repo,'build/faculty-build-composer/data/concept-reviews/manifest.json'),'utf8'));
const review=core.resolveConceptReviews(lib,reviewManifest,selected),oldReview=core.resolveConceptReviews(base,reviewManifest,selected);
assert(!review.errors.length&&same(review.runtimeIndex,oldReview.runtimeIndex),'Concept Review integrity');
comp.conceptReviewRuntimeIndex=review.runtimeIndex;comp.conceptReviewRuntimeSource=fs.readFileSync(path.join(repo,'build/faculty-build-composer/concept-review-runtime.js'),'utf8');
comp.embeddedQuestionAssets=Object.fromEntries(comp.assets.map(a=>[a.runtimePath,'data:image/webp;base64,'+fs.readFileSync(path.join(repo,'build/faculty-build-composer/data',a.runtimePath)).toString('base64')]));
const graphs=core.validateGeneratedGraphAssets(comp);assert(graphs.ok,'Embedded graphs '+JSON.stringify(graphs));
const template=fs.readFileSync(path.join(repo,'build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html'),'utf8');
const config=await core.createConfig(comp.recipe,lib,sha(template));
fs.mkdirSync(path.join(work,'generated'),{recursive:true});fs.writeFileSync(path.join(work,'generated/index.html'),core.buildHtml(template,comp,config,{generatedAt:'2026-09-07',purpose:'Local audit validation only'}));
write('library-after.json',lib);write('resolved-after.json',views);write('changes.json',changes);write('asset-accessibility-changes.json',assetChanges);write('composition.json',comp);write('recipe.json',recipe);
const group=(arr,k)=>Object.fromEntries([...new Set(arr.map(x=>x[k]))].map(v=>[v,arr.filter(x=>x[k]===v).length]));
const summary={uniqueBefore:total,uniqueAfter:total,contentRevised:contentIds.size,pathRevised:pathIds.size,pathOnly:changes.filter(c=>!c.contentRevised).length,recordUnchanged:total-changes.length,added:0,removed:0,contentByConcept:group(changes.filter(c=>c.contentRevised),'concept'),contentByDifficulty:group(changes.filter(c=>c.contentRevised),'difficulty'),allChangesByDifficulty:group(changes,'difficulty'),accessibilityAssetRecords:assetChanges.length,graphCount:204,assetRuntimeCount:comp.assets.length,oldLibrarySha256:base.librarySha256,newLibrarySha256:lib.librarySha256,compositionCounts:comp.counts,modeValidation:comp.validation,answerVerification:answers,graphValidation:graphs,warnings:comp.warnings,unrelatedAndDerivedDefinitionsUnchanged:Object.keys(lib.concepts).length-sources.length,conceptReviewRoutesUnchanged:true,allSourceRecordRoutingUnchanged:true,allPoolMembershipsAndOrderUnchanged:true,allResolvedViewMembershipsUnchanged:true,graphBytesUnchanged:true};
write('validation.json',summary);console.log(JSON.stringify({...summary,modeValidation:undefined,graphValidation:undefined,warnings:undefined},null,2));
