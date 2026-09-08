const fs=require('fs'),path=require('path'),crypto=require('crypto');
const repo='C:/Users/Jennings/Documents/GitHub/masteryquests-website',work=__dirname;
const root=path.join(repo,'build/faculty-build-composer');
const core=require(path.join(root,'composer-core.js'));
const helpers=require(path.join(root,'tests/composer-test-helpers.js'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const write=(n,x)=>fs.writeFileSync(path.join(work,n),JSON.stringify(x,null,2)+'\n');
const raw=fs.readFileSync(path.join(root,'data/composer_library.js'),'utf8');
const lib=helpers.loadComposerLibrary();
const source=fs.readFileSync(path.join(root,'composer.js'),'utf8');
const match=source.match(/id: 'micro-market-failures-public-goods',[\s\S]*?conceptIds: \[([\s\S]*?)\]/);
if(!match)throw Error('Preset missing');
const ids=[...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Market Failures & Public Goods',slug:'micro-market-failures-public-goods-audit',selectedConceptIds:ids,supportedModes:[...core.MODE_ORDER],checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
const views=Object.fromEntries(ids.map(c=>[c,core.resolveConceptModule(lib,c)]));
const comp=core.compose(lib,recipe);
const locations=m=>[...Object.entries(m.questions||{}).flatMap(([p,qs])=>qs.map(q=>[p,q])),...['repairQuestions','repairSeedQuestions','bridgeQuestions'].flatMap(p=>(m[p]||[]).map(q=>[p,q]))];
const uniq=m=>Object.fromEntries(locations(m).map(([p,q])=>[String(q.id),q]));
const count=(qs,k)=>qs.reduce((o,q)=>(o[q[k]||'unknown']=(o[q[k]||'unknown']||0)+1,o),{});
const all=Object.assign({},...Object.values(views).map(uniq));
const summary={preset:{id:'micro-market-failures-public-goods',title:'Market Failures & Public Goods',selectedConceptIds:ids},unique:Object.keys(all).length,byConcept:Object.fromEntries(Object.entries(views).map(([c,m])=>[c,{unique:Object.keys(uniq(m)).length,objectives:count(Object.values(uniq(m)),'objective'),difficulty:count(Object.values(uniq(m)),'canonicalDifficulty'),types:count(Object.values(uniq(m)),'type'),poolCounts:Object.fromEntries([...new Set(locations(m).map(x=>x[0]))].map(p=>[p,locations(m).filter(x=>x[0]===p).length])),assets:m.assetMetadata?.length,keys:Object.keys(m)}])),difficulty:count(Object.values(all),'canonicalDifficulty'),types:count(Object.values(all),'type'),graphLinked:Object.values(all).filter(q=>q.image).length,composedCounts:comp.counts,modes:comp.validation,errors:comp.errors};
const sources=ids.map(c=>lib.concepts[c].sourceConceptId||c);
write('concepts.json',ids);write('sources.json',sources);write('recipe.json',recipe);write('summary-before.json',summary);write('resolved-baseline.json',views);write('library-baseline.json',lib);fs.writeFileSync(path.join(work,'library-baseline.js'),raw);
write('composition-before.json',comp);
write('inventory-before.json',{...summary,sourceFiles:Object.fromEntries(['data/composer_library.js','data/composer_registry.json','data/composer_library_manifest.json','composer.js','composer-core.js','template/mastery-quests-faculty-template-composer-ready.html','data/concept-reviews/manifest.json'].map(p=>[p,sha(fs.readFileSync(path.join(root,p)))])),records:all,views,orderedComposedPools:comp.banks,challengePools:comp.challengeQuestionBanks,repairQuestions:comp.repairQuestions,bridgeQuestions:comp.bridgeQuestions,routes:{repair:comp.microSkillRepairPools,seeds:comp.skillRepairSeedPools,bridge:comp.microSkillBridgePools,bossCoverage:comp.bossCoverage,trialGraph:comp.trialGraphQuestionIds,fadingFortune:comp.fadingFortuneQuestionIds,riskReward:comp.riskRewardQuestionIds},assets:comp.assets,conceptReview:core.resolveConceptReviews(lib,helpers.loadConceptReviewManifest(),ids)});
fs.writeFileSync(path.join(work,'BEFORE.md'),'# Market Failures & Public Goods — BEFORE\n\nCaptured from the current Composer quick start before authoring changes.\n\n```json\n'+JSON.stringify(summary,null,2)+'\n```\n\nThe exact record objects, ordered pools, metadata, approved asset registrations, composition routes, mode eligibility and Concept Review routing are in inventory-before.json. The complete source library is preserved privately in the working baseline.\n\nThe selected current concepts, source records and derived views define scope. The current preset defines the boundary. No new source assessment is attached. The user-specified difficulty model calibrates this audit.\n');
console.log(JSON.stringify({...summary,modes:undefined,byConcept:Object.fromEntries(Object.entries(summary.byConcept).map(([c,v])=>[c,{...v,keys:undefined}]))},null,2));


